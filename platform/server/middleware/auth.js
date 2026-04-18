/**
 * JWT Authentication Middleware
 * ────────────────────────────
 * Verifies Bearer token and attaches user to req.user.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nl_jwt_dev_fallback';

/**
 * Sign a JWT for a user
 */
export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

/**
 * Middleware: require valid JWT
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未登录，请先登录' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ success: false, error: '无效的认证令牌' });
  }
}

/**
 * Middleware: require admin role (must be chained after requireAuth)
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: '无权限：需要管理员权限' });
  }
  next();
}
