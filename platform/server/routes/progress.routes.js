/**
 * Progress Routes — /api/progress/*
 * ──────────────────────────────────
 * GET  /api/progress           — Get all progress for current user
 * POST /api/progress           — Mark a lesson complete
 * GET  /api/progress/:courseId  — Get progress for a specific course
 */
import { Router } from 'express';
import prisma from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ── GET /api/progress ──
// Returns { [courseId]: { [lessonId]: true, timeSpent: N } } for backwards compat
router.get('/', async (req, res) => {
  try {
    const records = await prisma.lessonProgress.findMany({
      where: { userId: req.user.id },
      select: { courseId: true, lessonId: true, status: true, timeSpent: true },
    });

    // Transform to the same shape the frontend expects
    const progress = {};
    for (const r of records) {
      if (!progress[r.courseId]) progress[r.courseId] = { timeSpent: 0 };
      if (r.status === 'completed') progress[r.courseId][r.lessonId] = true;
      progress[r.courseId].timeSpent += r.timeSpent;
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ success: false, error: '获取进度失败' });
  }
});

// ── POST /api/progress ──
// Body: { courseId, lessonId, timeSpent? }
router.post('/', async (req, res) => {
  try {
    const { courseId, lessonId, timeSpent } = req.body;
    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, error: '缺少 courseId 或 lessonId' });
    }

    await prisma.lessonProgress.upsert({
      where: {
        userId_courseId_lessonId: {
          userId: req.user.id,
          courseId,
          lessonId,
        },
      },
      create: {
        userId: req.user.id,
        courseId,
        lessonId,
        status: 'completed',
        timeSpent: timeSpent || 0,
        completedAt: new Date(),
      },
      update: {
        status: 'completed',
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        completedAt: new Date(),
      },
    });

    res.json({ success: true, message: '进度已记录' });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ success: false, error: '保存进度失败' });
  }
});

// ── GET /api/progress/:courseId ──
router.get('/:courseId', async (req, res) => {
  try {
    const records = await prisma.lessonProgress.findMany({
      where: { userId: req.user.id, courseId: req.params.courseId },
      select: { lessonId: true, status: true, timeSpent: true, completedAt: true },
    });

    const lessons = {};
    let totalTime = 0;
    for (const r of records) {
      lessons[r.lessonId] = { completed: r.status === 'completed', timeSpent: r.timeSpent };
      totalTime += r.timeSpent;
    }

    res.json({ success: true, courseId: req.params.courseId, lessons, totalTime });
  } catch (err) {
    console.error('Get course progress error:', err);
    res.status(500).json({ success: false, error: '获取课程进度失败' });
  }
});

export default router;
