import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, User, Building2, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { user, ssoLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });

  // Already logged in
  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = await login(form.email, form.password);
        if (res.error) { setError(res.error); setLoading(false); return; }
        navigate('/dashboard');
      } else {
        if (!form.name.trim()) { setError('请输入姓名'); setLoading(false); return; }
        if (!form.email.includes('@')) { setError('请输入有效邮箱'); setLoading(false); return; }
        if (form.password.length < 6) { setError('密码至少 6 位'); setLoading(false); return; }
        const res = await register(form.name, form.email, form.password, form.department || '未分配');
        if (res.error) { setError(res.error); setLoading(false); return; }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || '操作失败，请重试');
    }
    setLoading(false);
  };

  const quickLogin = async (email, password) => {
    setForm(f => ({ ...f, email, password }));
    setLoading(true);
    const res = await login(email, password);
    if (res.error) { setError(res.error); setLoading(false); return; }
    navigate('/dashboard');
    setLoading(false);
  };

  // SSO in progress — show loading screen
  if (ssoLoading) {
    return (
      <div className="login-page">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
        <div className="login-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
            <Shield size={48} style={{ marginBottom: 16, opacity: 0.7, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>正在通过 Cloudflare 安全登录...</h2>
            <p style={{ opacity: 0.6 }}>正在验证您的身份，请稍候</p>
            <span className="loading-spinner" style={{ marginTop: 24, display: 'inline-block' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />

      <div className="login-container">
        {/* Left panel — branding */}
        <div className="login-brand-panel">
          <div className="brand-logo">
            <BookOpen size={36} />
            <span>NexusLearn</span>
          </div>
          <h2 className="brand-headline">企业级交互式<br />培训中心</h2>
          <p className="brand-sub">9 门专业课程 · 交互式学习 · 多端同步<br />从 AI 到 Linux，让学习真正发生</p>
          <div className="brand-stats">
            <div className="bstat"><span className="bstat-num">9</span><span className="bstat-label">门课程</span></div>
            <div className="bstat"><span className="bstat-num">40h+</span><span className="bstat-label">学习内容</span></div>
            <div className="bstat"><span className="bstat-num">100%</span><span className="bstat-label">交互式</span></div>
          </div>

          {/* Quick login hints — DEV only, never shown in production */}
          {import.meta.env.DEV && (
            <div className="quick-login-hints">
              <p className="ql-title">⚠️ 仅开发模式可见 · 快速体验：</p>
              <button className="ql-btn" onClick={() => quickLogin('wenyun@gmail.com', 'admin123')}>
                🔑 管理员账号 (wenyun@gmail.com)
              </button>
              <button className="ql-btn" onClick={() => quickLogin('demo@nexuslearn.com', 'demo123')}>
                👤 学员账号 (demo / demo123)
              </button>
            </div>
          )}
        </div>

        {/* Right panel — form */}
        <div className="login-form-panel">
          <div className="form-header">
            <div className="form-header-tabs">
              <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
                登录
              </button>
              <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>
                注册
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label><User size={14} /> 姓名</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="您的真实姓名" required />
              </div>
            )}
            <div className="form-group">
              <label><Mail size={14} /> 邮箱</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label><Lock size={14} /> 密码</label>
              <div className="input-with-icon">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'} required />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(s => !s)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div className="form-group">
                <label><Building2 size={14} /> 部门（可选）</label>
                <input type="text" value={form.department} onChange={e => set('department', e.target.value)}
                  placeholder="例如：技术部、产品部" />
              </div>
            )}

            {error && <div className="form-error">⚠️ {error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <Sparkles size={16} />}
              {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册并开始学习')}
            </button>
          </form>

          <p className="form-footer">
            {mode === 'login'
              ? <span>还没有账号？<button onClick={() => setMode('register')}>立即注册</button></span>
              : <span>已有账号？<button onClick={() => setMode('login')}>返回登录</button></span>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
