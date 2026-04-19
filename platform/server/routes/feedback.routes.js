/**
 * Feedback Routes — /api/feedback/*
 * ──────────────────────────────────
 * POST   /api/feedback           — Submit feedback (learner)
 * GET    /api/feedback           — List my feedback (learner)
 * GET    /api/feedback/all       — List all feedback (admin)
 * PUT    /api/feedback/:id       — Update status/note (admin)
 * DELETE /api/feedback/:id       — Delete feedback (admin)
 */
import { Router } from 'express';
import prisma from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ── POST /api/feedback — Submit feedback ──
router.post('/', async (req, res) => {
  try {
    const { type, content } = req.body;
    if (!content || content.trim().length < 2) {
      return res.status(400).json({ success: false, error: '请输入建议内容' });
    }
    const safeType = ['suggestion', 'bug', 'other'].includes(type) ? type : 'suggestion';
    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        type: safeType,
        content: content.trim().slice(0, 2000),
      },
      include: { user: { select: { name: true, email: true } } },
    });
    console.log(`[Feedback] New ${safeType} from ${req.user.email}`);
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ success: false, error: '提交建议失败' });
  }
});

// ── GET /api/feedback — My feedback list ──
router.get('/', async (req, res) => {
  try {
    const list = await prisma.feedback.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, feedback: list });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取建议列表失败' });
  }
});

// ── GET /api/feedback/all — Admin: all feedback ──
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    const where = status && status !== 'all' ? { status } : {};
    const list = await prisma.feedback.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, department: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const counts = await prisma.feedback.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const statusCounts = { pending: 0, reviewed: 0, resolved: 0 };
    counts.forEach(c => { statusCounts[c.status] = c._count.id; });

    res.json({ success: true, feedback: list, statusCounts });
  } catch (err) {
    console.error('Admin feedback error:', err);
    res.status(500).json({ success: false, error: '获取建议列表失败' });
  }
});

// ── PUT /api/feedback/:id — Admin: update status/note ──
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const updateData = { updatedAt: new Date() };
    if (status && ['pending', 'reviewed', 'resolved'].includes(status)) {
      updateData.status = status;
    }
    if (adminNote !== undefined) {
      updateData.adminNote = adminNote.slice(0, 500);
    }
    const feedback = await prisma.feedback.update({
      where: { id: req.params.id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });
    res.json({ success: true, feedback });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: '建议不存在' });
    }
    res.status(500).json({ success: false, error: '更新建议失败' });
  }
});

// ── DELETE /api/feedback/:id — Admin: delete ──
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '已删除' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: '建议不存在' });
    }
    res.status(500).json({ success: false, error: '删除建议失败' });
  }
});

export default router;
