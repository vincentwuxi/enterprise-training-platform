import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, AlertTriangle, Mail } from 'lucide-react';
import './Login.css';

const SSO_ERRORS = {
  no_cf_token: '未检测到 Cloudflare Access 令牌，请重试',
  invalid_token: '安全令牌验证失败，请重试',
  missing_email: '无法获取邮箱信息，请联系管理员',
  not_authorized: '您的邮箱未被授权访问此平台，请联系管理员开通权限',
  server_error: '服务器错误，请稍后重试',
};

export default function Login() {
  const { user, ssoLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Already logged in
  if (user) return <Navigate to="/dashboard" replace />;

  const ssoError = searchParams.get('sso_error');
  const deniedEmail = searchParams.get('email');

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
          <p className="brand-sub">专业课程 · 交互式学习 · 多端同步<br />从 AI 到 Linux，让学习真正发生</p>
          <div className="brand-stats">
            <div className="bstat"><span className="bstat-num">9</span><span className="bstat-label">门课程</span></div>
            <div className="bstat"><span className="bstat-num">40h+</span><span className="bstat-label">学习内容</span></div>
            <div className="bstat"><span className="bstat-num">100%</span><span className="bstat-label">交互式</span></div>
          </div>
        </div>

        {/* Right panel — CF SSO login */}
        <div className="login-form-panel">
          <div className="sso-login-section">
            <div className="sso-icon-wrap">
              <Shield size={40} />
            </div>
            <h2 className="sso-title">安全登录</h2>
            <p className="sso-desc">
              本平台采用 Cloudflare Zero Trust 安全认证，<br />
              通过邮箱 OTP 验证码登录，无需密码。
            </p>

            {/* SSO Error */}
            {ssoError && (
              <div className="sso-error-box">
                <AlertTriangle size={16} />
                <div>
                  <p>{SSO_ERRORS[ssoError] || '登录出现问题，请重试'}</p>
                  {deniedEmail && (
                    <p className="denied-email">
                      <Mail size={12} /> {decodeURIComponent(deniedEmail)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <a href="/api/auth/cf-sso" className="sso-btn-primary">
              <Shield size={18} />
              Cloudflare 安全登录
            </a>

            <div className="sso-help-text">
              <p>点击后将跳转到 Cloudflare 验证页面</p>
              <p>输入您的邮箱即可收到一次性验证码</p>
              <p className="sso-help-note">⚠️ 仅管理员授权的邮箱可登录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
