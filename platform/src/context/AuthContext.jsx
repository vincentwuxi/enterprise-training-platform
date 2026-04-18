/**
 * AuthContext — PostgreSQL + JWT backed authentication
 * 
 * API-driven auth system. All user data, progress, and ACLs
 * are persisted server-side in PostgreSQL. Only the JWT token
 * is stored in localStorage.
 *
 * Public API (useAuth hook) is backwards-compatible with the
 * previous localStorage implementation.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseRegistry } from '../courses/registry';
import api, { setToken, clearToken } from '../utils/api';

const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [courseStatus, setCourseStatus] = useState({});
  const [courseAccessMap, setCourseAccessMap] = useState({});
  const [progressCache, setProgressCache] = useState({});

  // ── Helper: load user progress ──
  const loadProgress = useCallback(async () => {
    try {
      const data = await api.get('/api/progress');
      setProgressCache(data.progress || {});
    } catch { /* non-fatal */ }
  }, []);

  // ── Initialize: restore session from JWT or CF Access SSO token ──
  useEffect(() => {
    // Check for SSO token in URL fragment (from /api/auth/cf-sso redirect)
    const hash = window.location.hash;
    const ssoMatch = hash.match(/^#sso_token=(.+)$/);

    if (ssoMatch) {
      // SSO redirect — extract token from URL fragment
      const ssoToken = ssoMatch[1];
      window.location.hash = ''; // Clean up URL
      setToken(ssoToken);
      setSsoLoading(true);

      api.get('/api/auth/me')
        .then(data => {
          setUser(data.user);
          return loadProgress();
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => {
          setSsoLoading(false);
          setLoading(false);
        });
      return;
    }

    // Check for existing JWT in localStorage
    const token = localStorage.getItem('nl_token');

    if (token) {
      // Existing JWT — verify and restore session
      api.get('/api/auth/me')
        .then(data => {
          setUser(data.user);
          return api.get('/api/progress');
        })
        .then(data => {
          setProgressCache(data.progress || {});
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      // No JWT, no SSO token — show login page
      setLoading(false);
    }
  }, [loadProgress]);

  // ── Auth actions ──
  const login = useCallback(async (email, password) => {
    try {
      const data = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);

      // Load progress
      try {
        const prog = await api.get('/api/progress');
        setProgressCache(prog.progress || {});
      } catch { /* progress load failure is non-fatal */ }

      return { success: true };
    } catch (err) {
      return { error: err.data?.error || err.message || '登录失败' };
    }
  }, []);

  const register = useCallback(async (name, email, password, department = '未分配') => {
    try {
      const data = await api.post('/api/auth/register', { name, email, password, department });
      setToken(data.token);
      setUser(data.user);
      setProgressCache({});
      return { success: true };
    } catch (err) {
      return { error: err.data?.error || err.message || '注册失败' };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setProgressCache({});
    setCourseStatus({});
    setCourseAccessMap({});
  }, []);

  // ── Course status actions (admin only) ──
  const setCourseOnline = useCallback(async (courseId, online) => {
    try {
      await api.put(`/api/admin/courses/${courseId}/status`, {
        status: online ? 'online' : 'offline'
      });
      setCourseStatus(prev => ({ ...prev, [courseId]: online ? 'online' : 'offline' }));
    } catch (err) {
      console.error('Set course status failed:', err);
      // Fallback: update local state anyway for UX
      setCourseStatus(prev => ({ ...prev, [courseId]: online ? 'online' : 'offline' }));
    }
  }, []);

  const isCourseOnline = useCallback((courseId) => {
    return courseStatus[courseId] !== 'offline';
  }, [courseStatus]);

  // ── Course access control (per-user ACL) ──
  const setCourseAccessControl = useCallback(async (courseId, userIds) => {
    if (user?.role !== 'admin') return;
    try {
      await api.put(`/api/admin/courses/${courseId}/access`, {
        userIds: (!userIds || (Array.isArray(userIds) && userIds.length === 0)) ? [] : userIds
      });
      setCourseAccessMap(prev => ({
        ...prev,
        [courseId]: (!userIds || (Array.isArray(userIds) && userIds.length === 0)) ? 'all' : userIds
      }));
    } catch (err) {
      console.error('Set course access failed:', err);
    }
  }, [user]);

  const getCourseAccessList = useCallback((courseId) => {
    const val = courseAccessMap[courseId];
    if (!val || val === 'all') return 'all';
    if (Array.isArray(val) && val.length > 0) return val;
    return 'all';
  }, [courseAccessMap]);

  const canUserAccessCourse = useCallback((courseId) => {
    if (user?.role === 'admin') return true;
    if (courseStatus[courseId] === 'offline') return false;
    const acl = courseAccessMap[courseId];
    if (!acl || acl === 'all') return true;
    if (Array.isArray(acl)) return acl.includes(user?.id);
    return true;
  }, [user, courseStatus, courseAccessMap]);

  // ── Progress actions ──
  const markLessonComplete = useCallback(async (courseId, lessonId) => {
    if (!user) return;

    // Optimistic update
    setProgressCache(prev => {
      const updated = { ...prev };
      if (!updated[courseId]) updated[courseId] = { timeSpent: 0 };
      updated[courseId] = { ...updated[courseId], [lessonId]: true };
      return updated;
    });

    // Persist to server
    try {
      await api.post('/api/progress', { courseId, lessonId });
    } catch (err) {
      console.error('Save progress failed:', err);
      // Keep optimistic update — will sync on next page load
    }
  }, [user]);

  const getUserProgress = useCallback(() => {
    if (!user) return {};
    return progressCache;
  }, [user, progressCache]);

  // ── Admin: list all users ──
  const getAllUsers = useCallback(async () => {
    if (user?.role !== 'admin') return [];
    try {
      const data = await api.get('/api/admin/users');
      return data.users || [];
    } catch (err) {
      console.error('Get users failed:', err);
      return [];
    }
  }, [user]);

  const updateUserRole = useCallback(async (userId, role) => {
    if (user?.role !== 'admin') return;
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role });
    } catch (err) {
      console.error('Update role failed:', err);
    }
  }, [user]);

  const deleteUser = useCallback(async (userId) => {
    if (user?.role !== 'admin' || userId === user.id) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
    } catch (err) {
      console.error('Delete user failed:', err);
    }
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
    user, loading, ssoLoading,
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
