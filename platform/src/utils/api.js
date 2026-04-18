/**
 * API Client — Centralized fetch wrapper with JWT injection
 * ──────────────────────────────────────────────────────────
 * Usage:
 *   import api from '../utils/api';
 *   const data = await api.post('/api/auth/login', { email, password });
 *   const me   = await api.get('/api/auth/me');
 */

const TOKEN_KEY = 'nl_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(method, url, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  // Auto-logout on 401 (expired/invalid token)
  if (res.status === 401 && token) {
    clearToken();
    // Don't auto-redirect here; let AuthContext handle it
  }

  if (!res.ok) {
    const error = new Error(data.error || `Request failed: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  delete: (url) => request('DELETE', url),
};

export default api;
