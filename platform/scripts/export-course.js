#!/usr/bin/env node
/**
 * export-course.js
 * ────────────────
 * Export a course as a .nexuscourse.zip package.
 *
 * Usage:
 *   node scripts/export-course.js <course-id>
 *   npm run export:course -- deep-learning
 */

import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_DIR = path.resolve(__dirname, '..');
const TRAINING_ROOT = path.resolve(PLATFORM_DIR, '..');
const EXPORTS_DIR = path.resolve(PLATFORM_DIR, 'exports');

const courseId = process.argv[2];
if (!courseId) {
  console.error('❌ Usage: node scripts/export-course.js <course-id>');
  console.error('   Example: node scripts/export-course.js deep-learning');
  process.exit(1);
}

// Find the course directory
function findCourse(id) {
  const entries = fs.readdirSync(TRAINING_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(TRAINING_ROOT, entry.name, 'course.manifest.json');
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.id === id) return { dirName: entry.name, manifest };
    } catch (e) { /* skip */ }
  }
  return null;
}

const course = findCourse(courseId);
if (!course) {
  console.error(`❌ Course "${courseId}" not found.`);
  console.error('\nAvailable courses:');
  const entries = fs.readdirSync(TRAINING_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const mp = path.join(TRAINING_ROOT, entry.name, 'course.manifest.json');
    if (!fs.existsSync(mp)) continue;
    try {
      const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
      if (m.id) console.error(`  - ${m.id}`);
    } catch (e) { /* skip */ }
  }
  process.exit(1);
}

const courseDir = path.join(TRAINING_ROOT, course.dirName);
const version = course.manifest.version || '1.0.0';
const zipName = `${courseId}-v${version}.nexuscourse.zip`;

fs.mkdirSync(EXPORTS_DIR, { recursive: true });

const zip = new AdmZip();

// Add manifest
zip.addLocalFile(path.join(courseDir, 'course.manifest.json'));

// Add src/ directory
const srcDir = path.join(courseDir, 'src');
if (fs.existsSync(srcDir)) {
  zip.addLocalFolder(srcDir, 'src');
}

const zipPath = path.join(EXPORTS_DIR, zipName);
zip.writeZip(zipPath);

const stats = fs.statSync(zipPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log(`\n📦 Course exported successfully!`);
console.log(`   Course:  ${courseId} (${course.manifest.title || courseId})`);
console.log(`   Version: ${version}`);
console.log(`   File:    ${zipPath}`);
console.log(`   Size:    ${sizeMB} MB`);
console.log(`   Dir:     ${course.dirName}/`);
console.log('');
