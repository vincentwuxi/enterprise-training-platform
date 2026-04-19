/**
 * Auth Routes — /api/auth/*
 * ─────────────────────────
 * GET  /api/auth/cf-sso    — Cloudflare Access SSO (redirect-based, whitelist-gated)
 * GET  /api/auth/me        — Get current user (requires app JWT)
 *
 * Login flow:
 *   1. User clicks "Cloudflare 登录" → browser navigates to /api/auth/cf-sso
 *   2. CF Access intercepts → shows OTP page
 *   3. After OTP, CF sets cookie & injects Cf-Access-Jwt-Assertion header
 *   4. This endpoint verifies CF JWT → checks email in whitelist (user table)
 *   5. If authorized → signs app JWT → redirects to /#sso_token=xxx
 *   6. If not authorized → redirects to /?sso_error=not_authorized
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { verifyCfToken } from '../middleware/cfAccess.js';

const router = Router();
const SALT_ROUNDS = 12;

// Default admin email — always allowed, auto-created if missing
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wenyun@gmail.com';

// ── GET /api/auth/cf-sso — Cloudflare Access SSO (redirect-based) ──
router.get('/cf-sso', async (req, res) => {
  try {
    const cfJwt = req.headers['cf-access-jwt-assertion'];
    if (!cfJwt) {
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

    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // Check if user exists in whitelist (user table)
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user && isAdmin) {
      // Auto-create admin account if it doesn't exist
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          passwordHash,
          role: 'admin',
          department: '管理层',
        },
      });
      console.log(`[CF SSO] Auto-created admin: ${email}`);
    }

    if (!user) {
      // Email not in whitelist — reject
      console.warn(`[CF SSO] Unauthorized email: ${email}`);
      return res.redirect(`/?sso_error=not_authorized&email=${encodeURIComponent(email)}`);
    }

    // Ensure admin email always has admin role
    if (isAdmin && user.role !== 'admin') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' },
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Sign app JWT and redirect
    const token = signToken(user);
    console.log(`[CF SSO] Login success: ${email} (${user.role})`);
    res.redirect(`/#sso_token=${token}`);
  } catch (err) {
    console.error('CF SSO error:', err);
    res.redirect('/?sso_error=server_error');
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
