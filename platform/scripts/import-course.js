#!/usr/bin/env node
/**
 * import-course.js
 * ────────────────
 * Import a .nexuscourse.zip course package into the training platform.
 *
 * Usage:
 *   node scripts/import-course.js <path-to-zip> [--overwrite]
 *   npm run import:course -- path/to/course.nexuscourse.zip
 */

import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_DIR = path.resolve(__dirname, '..');
const TRAINING_ROOT = path.resolve(PLATFORM_DIR, '..');

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const zipPath = args.find(a => !a.startsWith('--'));

if (!zipPath) {
  console.error('❌ Usage: node scripts/import-course.js <path-to-zip> [--overwrite]');
  console.error('   Example: node scripts/import-course.js exports/deep-learning-v1.0.0.nexuscourse.zip');
  process.exit(1);
}

const resolvedPath = path.resolve(zipPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ File not found: ${resolvedPath}`);
  process.exit(1);
}

console.log(`\n📦 Importing course from: ${resolvedPath}`);

// 1. Open zip and find manifest
const zip = new AdmZip(resolvedPath);
const zipEntries = zip.getEntries();

const manifestEntry = zipEntries.find(e =>
  e.entryName === 'course.manifest.json' ||
  e.entryName.endsWith('/course.manifest.json')
);

if (!manifestEntry) {
  console.error('❌ Invalid course package: missing course.manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
if (!manifest.id) {
  console.error('❌ Invalid manifest: missing "id" field');
  process.exit(1);
}

const courseId = manifest.id;
console.log(`   Course ID: ${courseId}`);
console.log(`   Title:     ${manifest.title || 'N/A'}`);

// 2. Determine target directory
const dirName = courseId.replace(/(^|-)([a-z])/g, (_, _sep, c) => c.toUpperCase());
const targetDir = path.join(TRAINING_ROOT, dirName);

// 3. Check for existing course
if (fs.existsSync(targetDir)) {
  if (!overwrite) {
    console.error(`\n❌ Directory already exists: ${targetDir}`);
    console.error('   Use --overwrite to replace the existing course.');
    process.exit(1);
  }
  console.log(`   ⚠️  Overwriting existing directory: ${dirName}/`);
}

// 4. Determine if zip has a root prefix to strip
const prefix = manifestEntry.entryName.includes('/')
  ? manifestEntry.entryName.split('/')[0] + '/'
  : '';

// 5. Extract files
fs.mkdirSync(targetDir, { recursive: true });
let fileCount = 0;

for (const entry of zipEntries) {
  if (entry.isDirectory) continue;

  let relativePath = entry.entryName;
  if (prefix && relativePath.startsWith(prefix)) {
    relativePath = relativePath.substring(prefix.length);
  }

  const targetPath = path.join(targetDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, entry.getData());
  fileCount++;
}

console.log(`   📂 Extracted ${fileCount} files to ${dirName}/`);

// 6. Regenerate registry
console.log('   🔄 Regenerating registry...');
try {
  execSync('node scripts/generate-registry.js', {
    cwd: PLATFORM_DIR,
    stdio: 'inherit',
    timeout: 30000,
  });
} catch (err) {
  console.error('   ⚠️  Registry regeneration failed:', err.message);
}

console.log(`\n✅ Course "${courseId}" imported successfully!`);
console.log(`   Directory: ${dirName}/`);
console.log(`   Files:     ${fileCount}`);
console.log(`\n💡 If you're running the dev server, Vite HMR should auto-reload.`);
console.log(`   For production, run: npm run build`);
console.log('');
