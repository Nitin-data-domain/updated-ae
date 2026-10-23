const path = require('path');
const fs = require('fs');

/**
 * GoDaddy / Cloud persistent storage manager.
 * Detects whether /private, process.env.PRIVATE_STORAGE_PATH, or user home /private
 * is available and writable so uploaded files survive container rebuilds.
 */

// Local repository uploads folder (contains bundled assets)
const localUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadsDir)) {
  try {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  } catch (_) {}
}

function resolveWritableDir(candidates, defaultDir) {
  for (const dir of candidates) {
    if (!dir) continue;
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (_) {
      // not writable or cannot create, try next candidate
    }
  }
  return defaultDir;
}

// 1. Resolve root persistent private and uploads directory
// In cloud/Linux production (such as GoDaddy PaaS/cPanel), checks:
// - process.env.PRIVATE_STORAGE_PATH
// - /home/<user>/private or /home/<user>/private/uploads
// - path.resolve(process.cwd(), '../private') or '../../private'
// - /private/uploads or /private
// In local Windows development, defaults cleanly to local server/uploads unless PRIVATE_STORAGE_PATH is set.
const isCloudOrLinux = process.platform !== 'win32' || !!process.env.PRIVATE_STORAGE_PATH;

const homeDir = process.env.HOME || process.env.USERPROFILE || '';
const cwd = process.cwd();

const candidatePrivateRoots = [
  process.env.PRIVATE_STORAGE_PATH ? path.resolve(process.env.PRIVATE_STORAGE_PATH) : null,
  homeDir ? path.join(homeDir, 'private') : null,
  path.resolve(cwd, '../private'),
  path.resolve(cwd, '../../private'),
  path.resolve(__dirname, '../../private'),
  '/private',
  path.join(__dirname, '../private'),
];

const candidateUploadRoots = [
  process.env.PRIVATE_STORAGE_PATH ? path.join(path.resolve(process.env.PRIVATE_STORAGE_PATH), 'uploads') : null,
  '/private/uploads',
  homeDir ? path.join(homeDir, 'private', 'uploads') : null,
  path.resolve(cwd, '../private/uploads'),
  path.resolve(cwd, '../../private/uploads'),
  path.resolve(__dirname, '../../private/uploads'),
];

let persistentPrivateRoot = localUploadsDir;
if (isCloudOrLinux) {
  persistentPrivateRoot = resolveWritableDir(candidatePrivateRoots, path.join(__dirname, '../private'));
}

let persistentUploadsRoot = localUploadsDir;
if (isCloudOrLinux) {
  persistentUploadsRoot = resolveWritableDir(
    [
      ...candidateUploadRoots,
      path.join(persistentPrivateRoot, 'uploads'),
    ],
    localUploadsDir
  );
}

// 2. Persistent subdirectories for uploads
const imagesDir = path.join(persistentUploadsRoot, 'images');
const booksDir = path.join(persistentUploadsRoot, 'books');
const brochuresDir = path.join(persistentUploadsRoot, 'brochures');
const grievancesDir = path.join(persistentUploadsRoot, 'grievances');

// 3. Persistent directory for structured data (forms, grievances, enquiries, SQLite database)
const persistentDataDir = path.join(persistentPrivateRoot, 'data');
const databaseDir = path.join(persistentDataDir, 'database');

for (const dir of [imagesDir, booksDir, brochuresDir, grievancesDir, persistentDataDir, databaseDir]) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
}

// 4. Return all root directories that exist to serve files from (persistent first, then local repo)
function getAllUploadRoots() {
  const roots = [
    persistentUploadsRoot,
    localUploadsDir,
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'server', 'uploads'),
  ];
  return Array.from(new Set(roots.filter((r) => r && fs.existsSync(r))));
}

// 5. Return all possible subdirectories for a given subfolder (e.g. 'books', 'images', 'grievances')
function getAllSubDirs(sub) {
  return getAllUploadRoots()
    .map((root) => path.join(root, sub))
    .filter((d) => fs.existsSync(d));
}

// 6. Helper: save submission record (grievances, enquiries, feedback) to GoDaddy private storage
function saveRecordToPrivateStorage(category, id, record) {
  try {
    const categoryDir = path.join(persistentDataDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const payload = {
      ...record,
      _saved_at: timestamp,
      _storage_destination: 'godaddy_private_storage',
    };

    // 1. Save individual JSON record snapshot
    const safeId = String(id || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');
    const jsonPath = path.join(categoryDir, `${safeId}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

    // 2. Append to line-delimited JSON log for easy querying / streaming
    const jsonlPath = path.join(persistentDataDir, `${category}.jsonl`);
    fs.appendFileSync(jsonlPath, JSON.stringify(payload) + '\n', 'utf8');

    console.log(`💾 GoDaddy Private Storage: Stored ${category} #${id} at ${jsonPath}`);
    return true;
  } catch (err) {
    console.error(`Failed to store ${category} #${id} to private storage:`, err.message);
    return false;
  }
}

// 7. Helper: get persistent SQLite database file path
function getDatabaseStoragePath(filename = 'aharada_dev.sqlite') {
  try {
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir, { recursive: true });
    }
    return path.join(databaseDir, filename);
  } catch (_) {
    return path.join(__dirname, '..', filename);
  }
}

// 8. One-time startup sync from local repo bundled assets to persistent storage
function syncBundledAssetsToPersistent() {
  if (persistentUploadsRoot === localUploadsDir) {
    console.log(`📁 Storage: Using local uploads directory (${localUploadsDir})`);
    return;
  }

  console.log(`📁 Persistent Storage Active: ${persistentUploadsRoot}`);
  console.log(`📁 Persistent Data Active: ${persistentDataDir}`);
  for (const sub of ['books', 'images', 'brochures', 'grievances']) {
    const srcDir = path.join(localUploadsDir, sub);
    const destDir = path.join(persistentUploadsRoot, sub);
    if (!fs.existsSync(srcDir)) continue;
    if (!fs.existsSync(destDir)) {
      try {
        fs.mkdirSync(destDir, { recursive: true });
      } catch (_) {}
    }

    try {
      const files = fs.readdirSync(srcDir);
      let copied = 0;
      for (const file of files) {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        const stat = fs.statSync(srcFile);
        if (stat.isFile() && !fs.existsSync(destFile)) {
          fs.copyFileSync(srcFile, destFile);
          copied++;
        }
      }
      if (copied > 0) {
        console.log(`✅ Synced ${copied} bundled ${sub} to persistent storage: ${destDir}`);
      }
    } catch (e) {
      console.warn(`Notice during sync to persistent ${sub}:`, e.message);
    }
  }
}

module.exports = {
  localUploadsDir,
  persistentPrivateRoot,
  persistentUploadsRoot,
  persistentDataDir,
  databaseDir,
  imagesDir,
  booksDir,
  brochuresDir,
  grievancesDir,
  getAllUploadRoots,
  getAllSubDirs,
  saveRecordToPrivateStorage,
  getDatabaseStoragePath,
  syncBundledAssetsToPersistent,
};
