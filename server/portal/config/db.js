// ============================================================
// College Grievance Portal — Dual Database Connection Pool (MySQL & Postgres)
// Handles query conversion and RETURNING clauses for MySQL compatibility
// ============================================================
const path = require('path');
const dns = require('dns');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

// Fallback DNS resolver for neon.tech in case local router / ISP DNS has issues
try {
  const origLookup = dns.lookup;
  const { Resolver } = dns;
  const fallbackResolver = new Resolver();
  fallbackResolver.setServers(['8.8.8.8', '1.1.1.1']);

  dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    origLookup(hostname, options, (err, address, family) => {
      if (err && hostname && hostname.includes('neon.tech')) {
        fallbackResolver.resolve4(hostname, (resErr, addresses) => {
          if (resErr || !addresses || addresses.length === 0) return callback(err);
          if (options && options.all) {
            return callback(null, addresses.map(a => ({ address: a, family: 4 })));
          }
          return callback(null, addresses[0], 4);
        });
      } else {
        callback(err, address, family);
      }
    });
  };
} catch (e) {}

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_oFGbWMI2P9sr@ep-quiet-cherry-ahbx45cl.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const activeDbUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

if (activeDbUrl && activeDbUrl.startsWith('postgres')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const { Pool: NeonPool, neonConfig } = require('@neondatabase/serverless');
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;

  const pgPool = new NeonPool({
    connectionString: activeDbUrl,
    connectionTimeoutMillis: 10000,
  });

  pgPool.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') console.log('🗄️ PostgreSQL connected');
  });

  module.exports = pgPool;
} else {
  // Use MySQL (GoDaddy Managed MySQL / standard MySQL)
  const mysql = require('mysql2/promise');

  const mysqlUri = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql'))
    ? process.env.DATABASE_URL
    : process.env.MYSQL_URL;

  const mysqlConfig = mysqlUri
    ? {
        uri: mysqlUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
        user: process.env.DB_USER || process.env.MYSQL_USER,
        password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
        database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
        port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      };

  const mysqlPool = mysql.createPool(mysqlConfig);

  // Auto-initialize schema & seed users on GoDaddy MySQL
  async function autoInitMySQL(pool) {
    try {
      // 1. Create table users if it does not exist at all
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          phone VARCHAR(20),
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'Student',
          department VARCHAR(100),
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          otp VARCHAR(10),
          otp_expires DATETIME,
          can_manage_staff TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Safely verify & migrate columns on existing users table (e.g. created by Sequelize)
      try {
        const [columns] = await pool.query('SHOW COLUMNS FROM users');
        const colMap = new Set(columns.map(c => c.Field.toLowerCase()));

        // Ensure user_id column exists
        if (!colMap.has('user_id')) {
          if (colMap.has('id')) {
            try {
              await pool.query('ALTER TABLE users ADD COLUMN user_id INT GENERATED ALWAYS AS (id) VIRTUAL');
              console.log('✅ Added user_id (virtual) column to users table');
            } catch (vErr) {
              try {
                await pool.query('ALTER TABLE users ADD COLUMN user_id INT NULL');
                await pool.query('UPDATE users SET user_id = id WHERE user_id IS NULL');
                console.log('✅ Added user_id column and backfilled from id');
              } catch (e2) {
                console.warn('⚠️ user_id migration note:', e2.message);
              }
            }
          }
        }

        // Ensure id column exists if table only had user_id
        if (!colMap.has('id') && colMap.has('user_id')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN id INT GENERATED ALWAYS AS (user_id) VIRTUAL');
          } catch (_) {}
        }

        // Ensure role column is NOT restricted to ENUM in MySQL
        try {
          await pool.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'Student'");
        } catch (_) {}

        // Ensure phone column exists
        if (!colMap.has('phone')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL');
          } catch (_) {}
        }

        // Ensure department column exists
        if (!colMap.has('department')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN department VARCHAR(100) DEFAULT NULL');
          } catch (_) {}
        }

        // Ensure is_active column exists
        if (!colMap.has('is_active')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1');
          } catch (_) {}
        }

        // Ensure otp column exists
        if (!colMap.has('otp')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN otp VARCHAR(10) DEFAULT NULL');
          } catch (_) {}
        }

        // Ensure otp_expires column exists
        if (!colMap.has('otp_expires')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN otp_expires DATETIME DEFAULT NULL');
          } catch (_) {}
        }

        // Ensure can_manage_staff column exists
        if (!colMap.has('can_manage_staff')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN can_manage_staff TINYINT(1) NOT NULL DEFAULT 0');
          } catch (_) {}
        }

        // Ensure created_at column exists
        if (!colMap.has('created_at')) {
          try {
            await pool.query('ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
          } catch (_) {}
        }
      } catch (colInspectErr) {
        console.warn('⚠️ Users table column inspection note:', colInspectErr.message);
      }

      // 3. Ensure grievances table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS grievances (
          grievance_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          source VARCHAR(50) NOT NULL DEFAULT 'Portal',
          status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
          created_by INT,
          student_name VARCHAR(100),
          student_email VARCHAR(100),
          student_phone VARCHAR(20),
          admission_no VARCHAR(50),
          program_name VARCHAR(100),
          assigned_dean INT,
          assigned_hod INT,
          assigned_to INT,
          prev_faculty INT,
          remark_student TEXT,
          remark_internal TEXT,
          file_url VARCHAR(500),
          faculty_file_url VARCHAR(500),
          internal_file_url VARCHAR(500),
          resolved_at DATETIME,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // 4. Ensure grievance_history table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS grievance_history (
          history_id INT AUTO_INCREMENT PRIMARY KEY,
          grievance_id INT NOT NULL,
          action VARCHAR(150) NOT NULL,
          actor_id INT,
          actor_name VARCHAR(100),
          remark TEXT,
          changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 5. Ensure core administrative and staff accounts exist
      try {
        await pool.query(`
          INSERT IGNORE INTO users (name, email, phone, password, role, department, can_manage_staff, is_active)
          VALUES
            ('Capt. Deepak Dhalla', 'md@aharadaedu.in', '+919800000001', '$2a$10$lxEh3jfA0RFElSxW/6QvSu7QwBjfrdfla5GOTbeSSReScwZlEjKC2', 'Dean', 'Administration', 1, 1),
            ('Mr. Deepak Dhalla Sir', 'nitingirdhar521@gmail.com', '+919800000002', '$2a$10$lxEh3jfA0RFElSxW/6QvSu7QwBjfrdfla5GOTbeSSReScwZlEjKC2', 'Dean', 'Administration', 1, 1),
            ('Ms. Somya Pal', 'somya@aharadaedu.in', '+919800000003', '$2a$10$lxEh3jfA0RFElSxW/6QvSu7QwBjfrdfla5GOTbeSSReScwZlEjKC2', 'HOD', 'Computer Science', 0, 1),
            ('Mr. Nitin Girdhar', 'nitin@aharadaedu.in', '+919800000004', '$2a$10$lxEh3jfA0RFElSxW/6QvSu7QwBjfrdfla5GOTbeSSReScwZlEjKC2', 'Faculty', 'Computer Science', 0, 1),
            ('Rahul Sharma', 'girdharnitin4@gmail.com', '+919800000005', '$2a$10$lxEh3jfA0RFElSxW/6QvSu7QwBjfrdfla5GOTbeSSReScwZlEjKC2', 'Student', 'BCA', 0, 1)
        `);
        await pool.query(`
          UPDATE users SET can_manage_staff = 1 WHERE role = 'Dean' OR email IN ('md@aharadaedu.in', 'nitingirdhar521@gmail.com')
        `);
        console.log('✅ Core Grievance Portal staff accounts verified in GoDaddy MySQL.');
      } catch (seedErr) {
        console.warn('⚠️ Portal account seeding notice:', seedErr.message);
      }
    } catch (err) {
      console.warn('⚠️ MySQL auto-init note:', err.message);
    }
  }

  const initPromise = autoInitMySQL(mysqlPool);

  if (process.env.NODE_ENV !== 'production') {
    console.log('🗄️ MySQL Connection Pool initialized');
  }

  /**
   * Normalize MySQL rows: convert TINYINT is_active (0/1) to boolean true/false,
   * ensure both id and user_id are set, and ensure COUNT/SUM results are consistent
   */
  function normalizeRows(rows) {
    if (!Array.isArray(rows)) return rows;
    return rows.map(row => {
      const normalized = { ...row };
      if (normalized.user_id === undefined || normalized.user_id === null) {
        if (normalized.id !== undefined && normalized.id !== null) {
          normalized.user_id = normalized.id;
        }
      }
      if (normalized.id === undefined || normalized.id === null) {
        if (normalized.user_id !== undefined && normalized.user_id !== null) {
          normalized.id = normalized.user_id;
        }
      }
      if ('is_active' in normalized) {
        normalized.is_active = !!normalized.is_active;
      }
      if ('can_manage_staff' in normalized) {
        normalized.can_manage_staff = !!normalized.can_manage_staff;
      } else {
        normalized.can_manage_staff = (normalized.role === 'Dean');
      }
      return normalized;
    });
  }

  module.exports = {
    query: async (sqlText, params = []) => {
      // Ensure schema initialization and migration has finished before handling queries
      if (initPromise) {
        try { await initPromise; } catch (_) {}
      }

      // 1. Convert PostgreSQL $1, $2, $10 positional placeholders to MySQL ? syntax
      let formattedSql = sqlText.replace(/\$\d+/g, '?');

      // 2. Handle RETURNING clause for MySQL compatibility
      const returningMatch = formattedSql.match(/RETURNING\s+([\s\S]+)$/i);
      if (returningMatch) {
        formattedSql = formattedSql.replace(/RETURNING\s+[\s\S]+$/i, '').trim();
      }

      // 3. Handle Postgres 'NOT is_active' → MySQL '1 - is_active' for TINYINT toggle
      formattedSql = formattedSql.replace(
        /SET\s+is_active\s*=\s*NOT\s+is_active/gi,
        'SET is_active = 1 - is_active'
      );

      // 4. Handle PostgreSQL EXTRACT → MySQL equivalents
      formattedSql = formattedSql.replace(/EXTRACT\s*\(\s*MONTH\s+FROM\s+/gi, 'MONTH(');
      formattedSql = formattedSql.replace(/EXTRACT\s*\(\s*YEAR\s+FROM\s+/gi, 'YEAR(');
      // Remove ::int type casts (Postgres-specific)
      formattedSql = formattedSql.replace(/::int/gi, '');

      // 5. Cast booleans to 1/0 for MySQL TINYINT compatibility
      const queryParams = params.map(p => (typeof p === 'boolean' ? (p ? 1 : 0) : p));

      // 6. Cast LIMIT and OFFSET params to integers (mysql2 execute doesn't support ? for LIMIT/OFFSET)
      const limitMatch = formattedSql.match(/LIMIT\s+\?\s+OFFSET\s+\?/i);
      if (limitMatch && queryParams.length >= 2) {
        const offsetVal = parseInt(queryParams.pop(), 10);
        const limitVal = parseInt(queryParams.pop(), 10);
        formattedSql = formattedSql.replace(
          /LIMIT\s+\?\s+OFFSET\s+\?/i,
          `LIMIT ${limitVal} OFFSET ${offsetVal}`
        );
      }

      // Execute query with auto-fallback if user_id column isn't supported in current schema
      let results;
      try {
        [results] = await mysqlPool.query(formattedSql, queryParams);
      } catch (queryErr) {
        if (queryErr.message && queryErr.message.includes("Unknown column 'user_id'")) {
          const retrySql = formattedSql.replace(/\buser_id\b/g, 'id');
          [results] = await mysqlPool.query(retrySql, queryParams);
        } else {
          throw queryErr;
        }
      }
      
      let rows = Array.isArray(results) ? results : [];

      if (!Array.isArray(results) && returningMatch) {
        // If it was an INSERT with RETURNING
        if (results.insertId) {
          const tableMatch = sqlText.match(/INSERT\s+INTO\s+([^\s(]+)/i);
          if (tableMatch) {
            const tableName = tableMatch[1].toLowerCase();
            const pkField = tableName === 'users' ? 'user_id' : (tableName === 'grievances' ? 'grievance_id' : 'history_id');
            try {
              const [inserted] = await mysqlPool.query(`SELECT * FROM ${tableName} WHERE ${pkField} = ?`, [results.insertId]);
              rows = inserted;
            } catch (_) {
              if (tableName === 'users') {
                try {
                  const [byFallback] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [results.insertId]);
                  rows = byFallback;
                } catch (e2) {}
              }
            }
          }
        } 
        // If it was an UPDATE with RETURNING (retrieve updated row even if MySQL reported 0 rows changed)
        else {
          const tableMatch = sqlText.match(/UPDATE\s+([^\s]+)/i);
          if (tableMatch) {
            const tableName = tableMatch[1].toLowerCase();
            const pkField = tableName === 'users' ? 'user_id' : (tableName === 'grievances' ? 'grievance_id' : 'history_id');
            const lastParam = queryParams[queryParams.length - 1];
            if (lastParam !== undefined) {
              try {
                const [updated] = await mysqlPool.query(`SELECT * FROM ${tableName} WHERE ${pkField} = ?`, [lastParam]);
                if (updated && updated.length > 0) {
                  rows = updated;
                } else if (tableName === 'users') {
                  const [byFallback] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [lastParam]);
                  if (byFallback && byFallback.length > 0) rows = byFallback;
                }
              } catch (_) {
                if (tableName === 'users') {
                  try {
                    const [byFallback] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [lastParam]);
                    rows = byFallback;
                  } catch (e2) {}
                }
              }
            }
          }
        }
      }

      // Normalize is_active, can_manage_staff, user_id, and count fields
      rows = normalizeRows(rows);

      return { rows, insertId: results ? results.insertId : null, affectedRows: results ? results.affectedRows : 0 };
    }
  };
}
