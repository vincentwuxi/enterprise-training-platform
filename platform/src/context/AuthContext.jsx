/**
 * AuthContext — localStorage-based multi-user auth system
 * 
 * Schema:
 *   nl_users:          { [userId]: UserRecord }
 *   nl_current_user:   userId | null
 *   nl_course_status:  { [courseId]: 'online' | 'offline' }
 *   nl_course_access:  { [courseId]: 'all' | string[] }  — per-user ACL
 *   nl_progress_{uid}: { [courseId]: { [lessonId]: true, timeSpent: N } }
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseRegistry } from '../courses/registry';

const AuthContext = createContext(null);

// ─── Storage helpers ────────────────────────────────────────────────────────
const KEYS = {
  users: 'nl_users',
  currentUser: 'nl_current_user',
  courseStatus: 'nl_course_status',
  courseAccess: 'nl_course_access',
};

function progressKey(userId) { return `nl_progress_${userId}`; }

function getUsers() {
  try { return JSON.parse(localStorage.getItem(KEYS.users) || '{}'); }
  catch { return {}; }
}
function saveUsers(users) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}
function getCourseStatus() {
  try { return JSON.parse(localStorage.getItem(KEYS.courseStatus) || '{}'); }
  catch { return {}; }
}
function saveCourseStatus(status) {
  localStorage.setItem(KEYS.courseStatus, JSON.stringify(status));
}
function getCourseAccess() {
  try { return JSON.parse(localStorage.getItem(KEYS.courseAccess) || '{}'); }
  catch { return {}; }
}
function saveCourseAccess(access) {
  localStorage.setItem(KEYS.courseAccess, JSON.stringify(access));
}
function getProgress(userId) {
  try { return JSON.parse(localStorage.getItem(progressKey(userId)) || '{}'); }
  catch { return {}; }
}
function saveProgress(userId, data) {
  localStorage.setItem(progressKey(userId), JSON.stringify(data));
}

// Password encoding (demo-grade — replace with bcrypt on a real backend)
// NOTE: btoa is NOT a cryptographic hash; this is intentional for a frontend-only demo.
// For production, use Supabase Auth or a backend with bcrypt/argon2.
function fakeHash(password) {
  return btoa(encodeURIComponent(password) + '_nlsalt_v1_2026');
}

// Remove sensitive fields before putting user in React state
function sanitizeUser(u) {
  const { passwordHash, ...safe } = u;
  return safe;
}

// ─── Seed default accounts ───────────────────────────────────────────────────
function seedDefaultAccounts() {
  const users = getUsers();
  if (Object.keys(users).length === 0) {
    const defaults = {
      'user_admin': {
        id: 'user_admin',
        name: '系统管理员',
        email: 'admin@nexuslearn.com',
        role: 'admin',
        department: '技术部',
        createdAt: new Date().toISOString(),
        passwordHash: fakeHash('admin123'),
      },
      'user_demo': {
        id: 'user_demo',
        name: '张三（演示学员）',
        email: 'demo@nexuslearn.com',
        role: 'learner',
        department: '产品部',
        createdAt: new Date().toISOString(),
        passwordHash: fakeHash('demo123'),
      },
    };
    saveUsers(defaults);
    // Seed some demo progress
    saveProgress('user_demo', {
      'linux-mastery': { philosophy: true, timeSpent: 3600 },
      'calculus-intuition': { limits: true, derivatives: true, timeSpent: 7200 },
    });
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseStatus, setCourseStatus] = useState({});
  const [courseAccessMap, setCourseAccessMap] = useState({});

  // Login attempt tracking (in-memory, resets on page refresh)
  const loginAttempts = React.useRef({});
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

  // Initialize
  useEffect(() => {
    seedDefaultAccounts();
    const users = getUsers();
    const currentId = localStorage.getItem(KEYS.currentUser);
    if (currentId && users[currentId]) {
      setUser(sanitizeUser(users[currentId]));  // SEC-005: never put passwordHash in state
    }
    setCourseStatus(getCourseStatus());
    setCourseAccessMap(getCourseAccess());
    setLoading(false);
  }, []);

  // ── Auth actions ──
  const login = useCallback((email, password) => {
    const now = Date.now();
    const key = (email || '').toLowerCase();

    // SEC-004: Rate limiting
    const attempts = loginAttempts.current[key] || { count: 0, lockedUntil: 0 };
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 60000);
      return { error: `账号已临时锁定，请 ${remaining} 分钟后重试` };
    }

    const users = getUsers();
    const found = Object.values(users).find(u => u.email === email);
    const valid = found && found.passwordHash === fakeHash(password);

    if (!valid) {
      attempts.count = (attempts.count || 0) + 1;
      if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_MS;
        attempts.count = 0;
      }
      loginAttempts.current[key] = attempts;
      const remaining = MAX_ATTEMPTS - (loginAttempts.current[key]?.count || 0);
      return { error: !found ? '账号不存在' : `密码错误（还可尝试 ${remaining} 次）` };
    }

    // Success — clear attempts and set user (sanitized)
    delete loginAttempts.current[key];
    localStorage.setItem(KEYS.currentUser, found.id);
    setUser(sanitizeUser(found));  // SEC-005
    return { success: true };
  }, []);

  const register = useCallback((name, email, password, department = '未分配') => {
    const users = getUsers();
    if (Object.values(users).find(u => u.email === email)) {
      return { error: '该邮箱已注册' };
    }
    // SEC-006: Use UUID instead of predictable timestamp
    const id = `user_${crypto.randomUUID()}`;
    // SEC-008: Sanitize user input lengths
    const safeName = String(name).slice(0, 50).replace(/[<>"'`]/g, '');
    const safeDept = String(department).slice(0, 30).replace(/[<>"'`]/g, '');
    const newUser = {
      id, name: safeName, email, department: safeDept, role: 'learner',
      createdAt: new Date().toISOString(),
      passwordHash: fakeHash(password),
    };
    users[id] = newUser;
    saveUsers(users);
    localStorage.setItem(KEYS.currentUser, id);
    setUser(sanitizeUser(newUser));  // SEC-005: strip passwordHash from state
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEYS.currentUser);
    setUser(null);
  }, []);

  // ── Course status actions (admin only) ──
  const setCourseOnline = useCallback((courseId, online) => {
    const status = getCourseStatus();
    status[courseId] = online ? 'online' : 'offline';
    saveCourseStatus(status);
    setCourseStatus({ ...status });
  }, []);

  const isCourseOnline = useCallback((courseId) => {
    // If admin has explicitly set a status, use it; otherwise default to 'online'
    return courseStatus[courseId] !== 'offline';
  }, [courseStatus]);

  // ── Course access control (per-user ACL) ──
  const setCourseAccessControl = useCallback((courseId, userIds) => {
    if (user?.role !== 'admin') return;
    const access = getCourseAccess();
    // null / empty array / 'all' → visible to everyone
    if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
      access[courseId] = 'all';
    } else {
      access[courseId] = userIds;
    }
    saveCourseAccess(access);
    setCourseAccessMap({ ...access });
  }, [user]);

  const getCourseAccessList = useCallback((courseId) => {
    // Returns 'all' or an array of userId strings
    const val = courseAccessMap[courseId];
    if (!val || val === 'all') return 'all';
    if (Array.isArray(val) && val.length > 0) return val;
    return 'all';
  }, [courseAccessMap]);

  const canUserAccessCourse = useCallback((courseId) => {
    // Admin can always see everything
    if (user?.role === 'admin') return true;
    // Must be online first
    if (courseStatus[courseId] === 'offline') return false;
    // Check ACL
    const acl = courseAccessMap[courseId];
    if (!acl || acl === 'all') return true; // default: visible to all
    if (Array.isArray(acl)) return acl.includes(user?.id);
    return true;
  }, [user, courseStatus, courseAccessMap]);

  // ── Progress actions ──
  const markLessonComplete = useCallback((courseId, lessonId) => {
    if (!user) return;
    const progress = getProgress(user.id);
    if (!progress[courseId]) progress[courseId] = { timeSpent: 0 };
    progress[courseId][lessonId] = true;
    saveProgress(user.id, progress);
  }, [user]);

  const getUserProgress = useCallback(() => {
    if (!user) return {};
    return getProgress(user.id);
  }, [user]);

  // ── Admin: list all users ──
  const getAllUsers = useCallback(() => {
    if (user?.role !== 'admin') return [];
    return Object.values(getUsers());
  }, [user]);

  const updateUserRole = useCallback((userId, role) => {
    if (user?.role !== 'admin') return;
    const users = getUsers();
    if (users[userId]) {
      users[userId].role = role;
      saveUsers(users);
    }
  }, [user]);

  const deleteUser = useCallback((userId) => {
    if (user?.role !== 'admin' || userId === user.id) return;
    const users = getUsers();
    delete users[userId];
    saveUsers(users);
  }, [user]);

  // ── Computed: course list with status for catalog ──
  const getVisibleCourses = useCallback(() => {
    return Object.entries(courseRegistry).map(([id, reg]) => ({
      id,
      manifest: reg.manifest,
      online: isCourseOnline(id),
      accessList: getCourseAccessList(id),
    }));
  }, [isCourseOnline, getCourseAccessList]);

  const value = {
    user, loading,
    isAdmin: user?.role === 'admin',
    courseStatus, courseAccessMap,
    login, register, logout,
    setCourseOnline, isCourseOnline,
    setCourseAccessControl, getCourseAccessList, canUserAccessCourse,
    markLessonComplete, getUserProgress,
    getAllUsers, updateUserRole, deleteUser,
    getVisibleCourses,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
