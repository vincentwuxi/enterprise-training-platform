#!/usr/bin/env node
/**
 * NexusLearn API Server
 * ─────────────────────
 * Express server with PostgreSQL + JWT authentication.
 *
 * Endpoints:
 *   Auth:
 *     POST /api/auth/register       — Create account
 *     POST /api/auth/login          — Login, returns JWT
 *     GET  /api/auth/me             — Get current user
 *   Progress:
 *     GET  /api/progress            — Get my learning progress
 *     POST /api/progress            — Mark lesson complete
 *     GET  /api/progress/:courseId   — Course-specific progress
 *   Admin:
 *     GET    /api/admin/users              — List users
 *     PUT    /api/admin/users/:id/role     — Change role
 *     DELETE /api/admin/users/:id          — Delete user
 *     PUT    /api/admin/courses/:id/status — Online/offline
 *     GET    /api/admin/courses/:id/access — Get ACL
 *     PUT    /api/admin/courses/:id/access — Set ACL
 *     GET    /api/admin/analytics          — Learning analytics
 *   Courses:
 *     GET  /api/courses             — List all courses
 *     GET  /api/courses/:id/export  — Export course as zip
 *     POST /api/courses/import      — Import course zip
 *     GET  /api/status              — Health check
 *
 * Run: node server/index.js
 */

import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from server/ directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { execSync } from 'child_process';

// Import route modules
import authRoutes from './routes/auth.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';

const PLATFORM_DIR = path.resolve(__dirname, '..');
const TRAINING_ROOT = path.resolve(PLATFORM_DIR, '..');
const DIST_DIR = path.resolve(PLATFORM_DIR, 'dist');
const EXPORTS_DIR = path.resolve(PLATFORM_DIR, 'exports');
const UPLOADS_DIR = path.resolve(PLATFORM_DIR, 'uploads');

// Ensure dirs exist
[EXPORTS_DIR, UPLOADS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const app = express();
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════════
// Route modules
// ═══════════════════════════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// ═══════════════════════════════════════════════════════════════════════════════
// Course API (unchanged from original)
// ═══════════════════════════════════════════════════════════════════════════════

// ── API Key authentication middleware (for import) ──
const API_KEY = process.env.NL_API_KEY || '';

function requireApiKey(req, res, next) {
  if (!API_KEY) return next();
  const provided = req.headers['x-api-key'] || req.query.apikey;
  if (provided === API_KEY) return next();
  return res.status(401).json({
    success: false,
    error: 'Unauthorized: invalid or missing API key. Set x-api-key header.',
  });
}

// Simple rate limiter (in-memory)
const rateLimitMap = new Map();
function rateLimit(windowMs, maxReqs) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count++;
    rateLimitMap.set(ip, entry);
    if (entry.count > maxReqs) {
      return res.status(429).json({
        success: false,
        error: `Rate limited. Try again in ${Math.ceil((entry.resetAt - now) / 1000)}s`,
      });
    }
    next();
  };
}

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.zip') || file.originalname.endsWith('.nexuscourse.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip / .nexuscourse.zip files are accepted'));
    }
  }
});

// ── Helper: discover courses ──
function discoverCourses() {
  const entries = fs.readdirSync(TRAINING_ROOT, { withFileTypes: true });
  const courses = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'platform' || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const manifestPath = path.join(TRAINING_ROOT, entry.name, 'course.manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.id) continue;

      const srcDir = path.join(TRAINING_ROOT, entry.name, 'src', 'pages');
      const hasPages = fs.existsSync(srcDir);

      courses.push({
        id: manifest.id,
        dirName: entry.name,
        title: manifest.title || manifest.id,
        category: manifest.category || '',
        version: manifest.version || '1.0.0',
        modulesCount: (manifest.modules || manifest.chapters || []).length,
        hasPages,
        exportable: manifest.exportable !== false,
      });
    } catch (err) {
      // skip malformed
    }
  }

  return courses.sort((a, b) => a.id.localeCompare(b.id));
}

// ── GET /api/courses ──
app.get('/api/courses', (req, res) => {
  try {
    const courses = discoverCourses();
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/courses/:id/export ──
app.get('/api/courses/:id/export', (req, res) => {
  try {
    const courseId = req.params.id;
    const courses = discoverCourses();
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ success: false, error: `Course "${courseId}" not found` });
    }

    const courseDir = path.join(TRAINING_ROOT, course.dirName);
    const manifestPath = path.join(courseDir, 'course.manifest.json');
    const srcDir = path.join(courseDir, 'src');

    const zip = new AdmZip();
    zip.addLocalFile(manifestPath);
    if (fs.existsSync(srcDir)) {
      zip.addLocalFolder(srcDir, 'src');
    }

    const zipName = `${courseId}-v${course.version}.nexuscourse.zip`;
    const zipPath = path.join(EXPORTS_DIR, zipName);
    zip.writeZip(zipPath);

    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.sendFile(zipPath);

    console.log(`📦 Exported: ${courseId} → ${zipName}`);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/courses/import ──
app.post('/api/courses/import', requireApiKey, rateLimit(60000, 5), upload.single('course'), async (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    const zip = new AdmZip(uploadedFile.path);
    const zipEntries = zip.getEntries();

    const manifestEntry = zipEntries.find(e =>
      e.entryName === 'course.manifest.json' ||
      e.entryName.endsWith('/course.manifest.json')
    );

    if (!manifestEntry) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid course package: missing course.manifest.json'
      });
    }

    const manifestData = JSON.parse(manifestEntry.getData().toString('utf8'));
    if (!manifestData.id) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid manifest: missing "id" field'
      });
    }

    const courseId = manifestData.id;
    const dirName = courseId.replace(/(^|-)([a-z])/g, (_, _sep, c) => c.toUpperCase());
    const targetDir = path.join(TRAINING_ROOT, dirName);

    const existingCourses = discoverCourses();
    const existing = existingCourses.find(c => c.id === courseId);
    const overwrite = req.body?.overwrite === 'true' || req.query.overwrite === 'true';

    if (existing && !overwrite) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(409).json({
        success: false,
        error: `Course "${courseId}" already exists in directory "${existing.dirName}". Add ?overwrite=true to replace.`,
        existingCourse: existing,
      });
    }

    const prefix = manifestEntry.entryName.includes('/')
      ? manifestEntry.entryName.split('/')[0] + '/'
      : '';

    fs.mkdirSync(targetDir, { recursive: true });

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      let relativePath = entry.entryName;
      if (prefix && relativePath.startsWith(prefix)) {
        relativePath = relativePath.substring(prefix.length);
      }
      const targetPath = path.join(targetDir, relativePath);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, entry.getData());
    }

    console.log(`📂 Extracted to: ${targetDir}`);

    try {
      execSync('node scripts/generate-registry.js', {
        cwd: PLATFORM_DIR,
        stdio: 'pipe',
        timeout: 30000,
      });
      console.log('✅ Registry regenerated');
    } catch (genErr) {
      console.error('⚠️  Registry regeneration failed:', genErr.message);
    }

    let buildStatus = 'skipped';
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      try {
        console.log('🔨 Rebuilding...');
        execSync('npm run build', {
          cwd: PLATFORM_DIR,
          stdio: 'pipe',
          timeout: 120000,
          env: { ...process.env, PATH: process.env.PATH },
        });
        buildStatus = 'success';
        console.log('✅ Build completed');
      } catch (buildErr) {
        buildStatus = 'failed';
        console.error('⚠️  Build failed:', buildErr.message);
      }
    }

    fs.unlinkSync(uploadedFile.path);

    res.json({
      success: true,
      message: `Course "${courseId}" imported successfully`,
      course: {
        id: courseId,
        title: manifestData.title,
        dirName,
        modulesCount: (manifestData.modules || manifestData.chapters || []).length,
      },
      buildStatus,
      note: isProduction
        ? (buildStatus === 'success' ? 'Course is now available.' : 'Import succeeded but build failed. Check server logs.')
        : 'Development mode: Vite HMR will auto-reload with the new course.',
    });

    console.log(`🎉 Import complete: ${courseId}`);
  } catch (err) {
    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/status ──
app.get('/api/status', (req, res) => {
  const courses = discoverCourses();
  res.json({
    success: true,
    server: 'NexusLearn Course API',
    version: '2.0.0',
    coursesCount: courses.length,
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    features: ['jwt-auth', 'postgresql', 'progress-sync'],
  });
});

// ── Serve static files in production ──
if (process.env.NODE_ENV === 'production' && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    } else {
      next();
    }
  });
}

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

// ── Start server ──
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 NexusLearn API Server v2.0`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Env:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB:   PostgreSQL (Prisma)`);
  console.log(`   Auth: JWT + bcrypt`);
  console.log(`   Root: ${TRAINING_ROOT}`);
  console.log(`   Courses: ${discoverCourses().length}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/progress`);
  console.log(`   POST /api/progress`);
  console.log(`   GET  /api/admin/users`);
  console.log(`   GET  /api/admin/analytics`);
  console.log(`   GET  /api/courses`);
  console.log(`   GET  /api/courses/:id/export`);
  console.log(`   POST /api/courses/import`);
  console.log(`   GET  /api/status`);
  console.log('');
});
