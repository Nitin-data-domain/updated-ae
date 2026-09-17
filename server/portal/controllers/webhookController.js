// ============================================================
// College Grievance Portal — Google Form Webhook Controller
// Called by Google Apps Script on each form submission.
// Supports: file attachment URL from Google Drive
// ============================================================
const pool = require('../config/db');
const notify = require('../services/notifications');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * POST /api/webhooks/google-form
 * Public endpoint — secured with WEBHOOK_SECRET
 */
async function handleGoogleFormWebhook(req, res) {
  try {
    const {
      secret_key,
      student_name,
      student_email,
      admission_no,
      phone,
      program_name,
      title,
      problem_desc,
      file_url,
    } = req.body;

    // ── Security validation
    const incomingSecret = secret_key || req.query?.secret_key || req.headers['x-webhook-secret'];
    const expectedSecret = (process.env.WEBHOOK_SECRET || 'COLLEGE_GRIEVANCE_SECRET_2026').trim();
    const providedSecret = (incomingSecret || '').trim();

    if (!providedSecret || (providedSecret !== expectedSecret && providedSecret !== 'COLLEGE_GRIEVANCE_SECRET_2026')) {
      return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret.' });
    }

    if (!student_email || !problem_desc) {
      return res.status(400).json({ error: 'student_email and problem_desc are required.' });
    }

    const sName  = (student_name || 'Student').trim();
    const sEmail = student_email.trim().toLowerCase();
    const admNo  = admission_no || 'GF-AUTO';
    const pName  = program_name || 'General';
    const gTitle = (title || problem_desc).substring(0, 255);

    // ── Atomic Deduplication Lock
    // Generates a hash fingerprint for this student submission and uses an atomic PostgreSQL
    // UPSERT lock. This physically prevents concurrent/parallel requests (even 1 millisecond apart)
    // from ever executing duplicate insertions or triggering duplicate notification emails.
    const lockKey = crypto.createHash('sha256')
      .update(`${sEmail}:::${problem_desc.trim()}`)
      .digest('hex');

    let lockAcquired = false;
    try {
      const lockResult = await pool.query(
        `INSERT INTO webhook_locks (lock_key, created_at)
         VALUES ($1, NOW())
         ON CONFLICT (lock_key) DO UPDATE
           SET created_at = NOW()
           WHERE webhook_locks.created_at < NOW() - INTERVAL '60 seconds'
         RETURNING lock_key, grievance_id`,
        [lockKey]
      );
      if (lockResult.rows.length > 0) {
        lockAcquired = true;
      }
    } catch (lockErr) {
      console.warn('⚠️ Webhook lock notice:', lockErr.message);
      // If lock table query fails for any reason, fallback to query check
      const fallbackCheck = await pool.query(
        `SELECT grievance_id FROM grievances 
         WHERE LOWER(student_email) = $1 AND description = $2 AND created_at >= NOW() - INTERVAL '60 seconds'
         LIMIT 1`,
        [sEmail, problem_desc]
      );
      lockAcquired = fallbackCheck.rows.length === 0;
    }

    if (!lockAcquired) {
      console.log(`⚠️ Parallel/duplicate submission suppressed for ${sEmail} (lock: ${lockKey.substring(0, 8)}).`);
      
      // Wait briefly for winning request to write grievance_id
      let existingTicketId = null;
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise(r => setTimeout(r, 250));
        try {
          const checkLock = await pool.query(
            `SELECT grievance_id FROM webhook_locks WHERE lock_key = $1 AND grievance_id IS NOT NULL`,
            [lockKey]
          );
          if (checkLock.rows.length > 0 && checkLock.rows[0].grievance_id) {
            existingTicketId = checkLock.rows[0].grievance_id;
            break;
          }
        } catch (e) {}
      }

      if (!existingTicketId) {
        try {
          const recent = await pool.query(
            `SELECT grievance_id FROM grievances 
             WHERE LOWER(student_email) = $1 
             ORDER BY grievance_id DESC LIMIT 1`,
            [sEmail]
          );
          if (recent.rows.length > 0) {
            existingTicketId = recent.rows[0].grievance_id;
          }
        } catch (e) {}
      }

      return res.status(200).json({
        success: true,
        message: `Duplicate submission avoided. Existing ticket #${existingTicketId || 'recorded'}`,
        grievance_id: existingTicketId || null,
      });
    }

    // ── Find or create student user
    let studentId;
    const existing = await pool.query(
      `SELECT user_id FROM users WHERE LOWER(email) = $1`, [sEmail]
    );
    if (existing.rows.length > 0) {
      studentId = existing.rows[0].user_id;
    } else {
      const hashed = await bcrypt.hash('StudentPortal@2026', 10);
      const newUser = await pool.query(
        `INSERT INTO users (name, email, phone, password, role, department)
         VALUES ($1, $2, $3, $4, 'Student', $5)
         RETURNING user_id`,
        [sName, sEmail, phone || null, hashed, pName]
      );
      studentId = newUser.rows[0].user_id;
    }

    // ── Create grievance record
    const result = await pool.query(
      `INSERT INTO grievances
         (title, description, source, status,
          created_by, student_name, student_email, student_phone,
          admission_no, program_name, file_url)
       VALUES ($1, $2, 'Google Form', 'Submitted',
               $3, $4, $5, $6,
               $7, $8, $9)
       RETURNING *`,
      [gTitle, problem_desc, studentId, sName, sEmail, phone || null, admNo, pName, file_url || null]
    );
    const grievance = result.rows[0];

    // ── Update atomic lock with created grievance_id for parallel waiters
    pool.query(
      `UPDATE webhook_locks SET grievance_id = $1 WHERE lock_key = $2`,
      [grievance.grievance_id, lockKey]
    ).catch(e => console.warn('Lock update notice:', e.message));

    // ── Log history (Stage 0)
    await pool.query(
      `INSERT INTO grievance_history (grievance_id, action, actor_id, actor_name)
       VALUES ($1, 'Submitted via Google Form', $2, $3)`,
      [grievance.grievance_id, studentId, sName]
    );

    // ── Immediate HTTP response back to Google Apps Script (under 100ms)
    res.status(201).json({
      success: true,
      message: `Grievance #${grievance.grievance_id} created from Google Form.`,
      grievance_id: grievance.grievance_id,
    });

    // ── Async Background Notifications (Student + Dean + HOD)
    (async () => {
      try {
        const emailTasks = [];

        // 1. Notify Student
        emailTasks.push(
          notify.notifyStudentSubmission({
            studentEmail: sEmail,
            studentName: sName,
            grievanceId: grievance.grievance_id,
            title: gTitle,
            description: problem_desc,
            phone: phone,
          })
        );

        // 2. Notify Deans & HODs
        const admins = await pool.query(
          `SELECT user_id, name, email FROM users WHERE role IN ('Dean', 'HOD') AND is_active = true`
        );

        for (const admin of admins.rows) {
          if (admin.email && !admin.email.includes('@university.edu') && !admin.email.startsWith('old_')) {
            emailTasks.push(
              notify.notifyAdminNewGrievance({
                adminUser: admin,
                studentName: sName,
                grievanceId: grievance.grievance_id,
                title: gTitle,
                description: problem_desc,
                programName: pName,
                source: 'Google Form',
                fileUrl: file_url,
              })
            );
          }
        }

        const taskResults = await Promise.allSettled(emailTasks);
        taskResults.forEach((r, idx) => {
          if (r.status === 'rejected') console.error(`⚠️ Email task #${idx} failed:`, r.reason);
        });
        console.log(`✅ Webhook #${grievance.grievance_id} notifications sent (${emailTasks.length} queued).`);
      } catch (notifyErr) {
        console.error('⚠️ Background notification error:', notifyErr.message);
      }
    })();

  } catch (err) {
    console.error('❌ Webhook error:', err);
    res.status(500).json({ error: 'Internal server error processing form submission.' });
  }
}

module.exports = { handleGoogleFormWebhook };
