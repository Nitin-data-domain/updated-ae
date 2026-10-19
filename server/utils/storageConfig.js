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

// 1. Resolve root persistent uploads directory
// In cloud/Linux production (such as GoDaddy PaaS), checks /private/uploads.
// In local Windows development, defaults cleanly to local server/uploads unless PRIVATE_STORAGE_PATH is explicitly set.
const isCloudOrLinux = process.platform !== 'win32' || !!process.env.PRIVATE_STORAGE_PATH;
const persistentUploadsRoot = isCloudOrLinux
  ? resolveWritableDir(
      [
        process.env.PRIVATE_STORAGE_PATH ? path.resolve(process.env.PRIVATE_STORAGE_PATH) : null,
        '/private/uploads',
        process.env.HOME ? path.join(process.env.HOME, 'private', 'uploads') : null,
      ],
      localUploadsDir
    )
  : localUploadsDir;

// 2. Subdirectories
const imagesDir = path.join(persistentUploadsRoot, 'images');
const booksDir = path.join(persistentUploadsRoot, 'books');
const brochuresDir = path.join(persistentUploadsRoot, 'brochures');

for (const dir of [imagesDir, booksDir, brochuresDir]) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
}

// 3. Return all root directories that exist to serve files from (persistent first, then local repo)
function getAllUploadRoots() {
  const roots = [
    persistentUploadsRoot,
    localUploadsDir,
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'server', 'uploads'),
  ];
  return Array.from(new Set(roots.filter((r) => r && fs.existsSync(r))));
}

// 4. Return all possible subdirectories for a given subfolder (e.g. 'books', 'images')
function getAllSubDirs(sub) {
  return getAllUploadRoots()
    .map((root) => path.join(root, sub))
    .filter((d) => fs.existsSync(d));
}

// 5. One-time startup sync from local repo bundled assets to persistent storage
function syncBundledAssetsToPersistent() {
  if (persistentUploadsRoot === localUploadsDir) {
    console.log(`📁 Storage: Using local uploads directory (${localUploadsDir})`);
    return;
  }

  console.log(`📁 Persistent Storage Active: ${persistentUploadsRoot}`);
  for (const sub of ['books', 'images', 'brochures']) {
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
  persistentUploadsRoot,
  imagesDir,
  booksDir,
  brochuresDir,
  getAllUploadRoots,
  getAllSubDirs,
  syncBundledAssetsToPersistent,
};
