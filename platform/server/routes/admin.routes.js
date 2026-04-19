/**
 * Admin Routes — /api/admin/*
 * ────────────────────────────
 * All routes require admin role.
 *
 * POST   /api/admin/users              — Create authorized user (whitelist)
 * GET    /api/admin/users              — List all users
 * PUT    /api/admin/users/:id          — Update user info (name, department, role)
 * DELETE /api/admin/users/:id          — Delete user (revoke access)
 * PUT    /api/admin/courses/:id/status — Set course online/offline
 * GET    /api/admin/courses/:id/access — Get course ACL
 * PUT    /api/admin/courses/:id/access — Set course ACL
 * GET    /api/admin/analytics          — Learning analytics
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// ── POST /api/admin/users — Create authorized user ──
// Admin adds email to whitelist; user can then login via CF SSO.
router.post('/users', async (req, res) => {
  try {
    const { email, name, department, role } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: '请输入有效的邮箱地址' });
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: '该邮箱已存在' });
    }

    // Create user with random password (never used — login is via CF SSO only)
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);
    const safeName = String(name || email.split('@')[0]).slice(0, 50).replace(/[<>"'`]/g, '');
    const safeDept = String(department || '未分配').slice(0, 30).replace(/[<>"'`]/g, '');
    const safeRole = ['learner', 'admin'].includes(role) ? role : 'learner';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: safeName,
        passwordHash,
        department: safeDept,
        role: safeRole,
      },
      select: { id: true, email: true, name: true, role: true, department: true, createdAt: true },
    });

    console.log(`[Admin] Created authorized user: ${email} (${safeRole})`);
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, error: '创建用户失败' });
  }
});

// ── GET /api/admin/users ──
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true, role: true, department: true,
        createdAt: true, lastLogin: true,
        _count: { select: { progress: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// ── PUT /api/admin/users/:id — Update user info ──
router.put('/users/:id', async (req, res) => {
  try {
    const { name, department, role } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = String(name).slice(0, 50).replace(/[<>"'`]/g, '');
    if (department !== undefined) updateData.department = String(department).slice(0, 30).replace(/[<>"'`]/g, '');
    if (role !== undefined) {
      if (!['learner', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, error: '无效角色，只能设为 learner 或 admin' });
      }
      // Prevent self-demotion
      if (req.params.id === req.user.id && role !== 'admin') {
        return res.status(400).json({ success: false, error: '不能降级自己的管理员权限' });
      }
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: '没有要更新的字段' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, department: true },
    });
    res.json({ success: true, user });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    res.status(500).json({ success: false, error: '更新用户失败' });
  }
});


// ── DELETE /api/admin/users/:id ──
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: '不能删除自己的账号' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '用户已删除' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    res.status(500).json({ success: false, error: '删除用户失败' });
  }
});

// ── PUT /api/admin/courses/:id/status ──
router.put('/courses/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: '状态只能设为 online 或 offline' });
    }
    await prisma.courseStatus.upsert({
      where: { courseId: req.params.id },
      create: { courseId: req.params.id, status },
      update: { status, updatedAt: new Date() },
    });
    res.json({ success: true, courseId: req.params.id, status });
  } catch (err) {
    res.status(500).json({ success: false, error: '更新课程状态失败' });
  }
});

// ── GET /api/admin/courses/:id/access ──
router.get('/courses/:id/access', async (req, res) => {
  try {
    const records = await prisma.courseAccess.findMany({
      where: { courseId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    // If no records, course is accessible to all
    const accessList = records.length === 0 ? 'all' : records.map(r => r.user);
    res.json({ success: true, courseId: req.params.id, accessList });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取权限失败' });
  }
});

// ── PUT /api/admin/courses/:id/access ──
// Body: { userIds: string[] }  — empty array = accessible to all
router.put('/courses/:id/access', async (req, res) => {
  try {
    const { userIds } = req.body;
    const courseId = req.params.id;

    // Clear existing access rules
    await prisma.courseAccess.deleteMany({ where: { courseId } });

    // If userIds provided and non-empty, create restricted access
    if (Array.isArray(userIds) && userIds.length > 0) {
      await prisma.courseAccess.createMany({
        data: userIds.map(userId => ({ courseId, userId })),
        skipDuplicates: true,
      });
    }

    res.json({ success: true, courseId, accessMode: userIds?.length ? 'restricted' : 'all' });
  } catch (err) {
    res.status(500).json({ success: false, error: '设置权限失败' });
  }
});

// ── GET /api/admin/analytics ──
router.get('/analytics', async (req, res) => {
  try {
    const [totalUsers, totalCompletions, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.lessonProgress.count({ where: { status: 'completed' } }),
      prisma.lessonProgress.findMany({
        take: 20,
        orderBy: { completedAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ]);

    // Course completion rankings
    const courseStats = await prisma.lessonProgress.groupBy({
      by: ['courseId'],
      _count: { lessonId: true },
      orderBy: { _count: { lessonId: 'desc' } },
      take: 10,
    });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalCompletions,
        topCourses: courseStats.map(c => ({ courseId: c.courseId, completions: c._count.lessonId })),
        recentActivity: recentActivity.map(a => ({
          user: a.user.name,
          courseId: a.courseId,
          lessonId: a.lessonId,
          completedAt: a.completedAt,
        })),
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: '获取分析数据失败' });
  }
});

export default router;
