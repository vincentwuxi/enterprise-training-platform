/**
 * Auth Routes — /api/auth/*
 * ─────────────────────────
 * GET  /api/auth/cf-sso    — Cloudflare Access SSO auto-login
 * POST /api/auth/register  — Create account
 * POST /api/auth/login     — Login, returns JWT
 * GET  /api/auth/me        — Get current user (requires JWT)
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { verifyCfToken } from '../middleware/cfAccess.js';

const router = Router();
const SALT_ROUNDS = 12;

// Default admin email (matches Cloudflare Access identity)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wenyun@gmail.com';

// ── GET /api/auth/cf-sso — Cloudflare Access SSO (redirect-based) ──
// Flow: Browser navigates here → CF Access shows OTP → after auth,
// this endpoint verifies CF JWT, creates/finds user, generates app JWT,
// and redirects back to frontend with token in URL fragment.
router.get('/cf-sso', async (req, res) => {
  try {
    const cfJwt = req.headers['cf-access-jwt-assertion'];
    if (!cfJwt) {
      // No CF JWT — redirect to login page with error
      return res.redirect('/?sso_error=no_cf_token');
    }

    // Verify the Cloudflare Access JWT
    let payload;
    try {
      payload = await verifyCfToken(cfJwt);
    } catch (err) {
      console.warn(`[CF SSO] Invalid token: ${err.message}`);
      return res.redirect('/?sso_error=invalid_token');
    }

    const email = payload.email;
    if (!email) {
      return res.redirect('/?sso_error=missing_email');
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-create account for new CF Access users
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          passwordHash,
          role: isAdmin ? 'admin' : 'learner',
          department: '未分配',
        },
      });
      console.log(`[CF SSO] Auto-created user: ${email} (${isAdmin ? 'admin' : 'learner'})`);
    } else {
      // Ensure admin email always has admin role
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
        });
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Sign app JWT and redirect to frontend with token
    const token = signToken(user);
    console.log(`[CF SSO] Login success: ${email} (${user.role})`);
    // Use URL fragment (#) so token doesn't appear in server logs
    res.redirect(`/#sso_token=${token}`);
  } catch (err) {
    console.error('CF SSO error:', err);
    res.redirect('/?sso_error=server_error');
  }
});

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: '请填写姓名、邮箱和密码' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: '密码至少 6 位' });
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: '该邮箱已注册' });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const safeName = String(name).slice(0, 50).replace(/[<>"'`]/g, '');
    const safeDept = String(department || '未分配').slice(0, 30).replace(/[<>"'`]/g, '');

    const user = await prisma.user.create({
      data: {
        email,
        name: safeName,
        passwordHash,
        department: safeDept,
        role: 'learner',
      },
      select: { id: true, email: true, name: true, role: true, department: true, createdAt: true },
    });

    const token = signToken(user);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: '注册失败，请稍后重试' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: '请输入邮箱和密码' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: '账号不存在' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: '密码错误' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = signToken(user);
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: '登录失败，请稍后重试' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, department: true, createdAt: true, lastLogin: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

export default router;
