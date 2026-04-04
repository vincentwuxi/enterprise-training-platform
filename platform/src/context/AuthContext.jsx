/**
 * AuthContext — localStorage-based multi-user auth system
 * 
 * Schema:
 *   nl_users:          { [userId]: UserRecord }
 *   nl_current_user:   userId | null
 *   nl_course_status:  { [courseId]: 'online' | 'offline' }
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
function getProgress(userId) {
  try { return JSON.parse(localStorage.getItem(progressKey(userId)) || '{}'); }
  catch { return {}; }
}
function saveProgress(userId, data) {
  localStorage.setItem(progressKey(userId), JSON.stringify(data));
}

// Simple password "hash" (demo only — production should use real hash)
function fakeHash(password) {
  return btoa(password + '_nexuslearn_salt_2026');
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

  // Initialize
  useEffect(() => {
    seedDefaultAccounts();
    const users = getUsers();
    const currentId = localStorage.getItem(KEYS.currentUser);
    if (currentId && users[currentId]) {
      setUser(users[currentId]);
    }
    setCourseStatus(getCourseStatus());
    setLoading(false);
  }, []);

  // ── Auth actions ──
  const login = useCallback((email, password) => {
    const users = getUsers();
    const found = Object.values(users).find(u => u.email === email);
    if (!found) return { error: '账号不存在' };
    if (found.passwordHash !== fakeHash(password)) return { error: '密码错误' };
    localStorage.setItem(KEYS.currentUser, found.id);
    setUser(found);
    return { success: true };
  }, []);

  const register = useCallback((name, email, password, department = '未分配') => {
    const users = getUsers();
    if (Object.values(users).find(u => u.email === email)) {
      return { error: '该邮箱已注册' };
    }
    const id = `user_${Date.now()}`;
    const newUser = {
      id, name, email, department, role: 'learner',
      createdAt: new Date().toISOString(),
      passwordHash: fakeHash(password),
    };
    users[id] = newUser;
    saveUsers(users);
    localStorage.setItem(KEYS.currentUser, id);
    setUser(newUser);
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
    }));
  }, [isCourseOnline]);

  const value = {
    user, loading,
    isAdmin: user?.role === 'admin',
    courseStatus,
    login, register, logout,
    setCourseOnline, isCourseOnline,
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
