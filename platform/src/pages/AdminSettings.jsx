/**
 * AdminSettings — AI Configuration Management
 * ─────────────────────────────────────────────
 * Admin can configure AI endpoint, API key, and model selection.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Settings, Sparkles, RefreshCw, Check, Eye, EyeOff, Users, BookOpen, Send } from 'lucide-react';
import api from '../utils/api';
import './Admin.css';

export default function AdminSettings() {
  const navigate = useNavigate();

  const [config, setConfig] = useState({ endpoint: '', apiKey: '', model: '' });
  const [hasKey, setHasKey] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testMsg, setTestMsg] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  // Load config
  useEffect(() => {
    api.get('/api/ai/admin/config')
      .then(data => {
        setConfig({
          endpoint: data.config.endpoint,
          apiKey: data.config.apiKey,
          model: data.config.model,
        });
        setHasKey(data.hasKey);
      })
      .catch(() => {
        // Use defaults if not configured
        setConfig({
          endpoint: 'https://generativelanguage.googleapis.com/v1beta',
          apiKey: '',
          model: 'gemini-2.0-flash',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/api/ai/admin/config', config);
      setMessage({ type: 'success', text: 'AI 配置已保存 ✅' });
      setHasKey(!!config.apiKey && !config.apiKey.includes('****'));
    } catch (err) {
      setMessage({ type: 'error', text: err.data?.error || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshModels = async () => {
    setModelsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await api.get('/api/ai/admin/models');
      setModels(data.models || []);
      setMessage({ type: 'success', text: `已加载 ${data.models.length} 个可用模型` });
    } catch (err) {
      setMessage({ type: 'error', text: err.data?.error || '获取模型列表失败' });
    } finally {
      setModelsLoading(false);
    }
  };

  const handleTest = async () => {
    const question = testMsg.trim() || '什么是 Transformer？';
    setTesting(true);
    setTestResult('');
    try {
      const data = await api.post('/api/ai/chat', {
        messages: [{ role: 'user', content: question }],
      });
      setTestResult(data.content);
    } catch (err) {
      setTestResult('❌ 测试失败: ' + (err.data?.error || err.message));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#6b7280' }}>加载配置中...</div>
      </div>
    );
  }

  return (
    <div className="admin-page page-container">
      {/* Sub Navigation */}
      <div className="admin-sub-nav">
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/courses')}>
          <BookOpen size={16} /> 课程管理
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/users')}>
          <Users size={16} /> 用户管理
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/feedback')}>
          <span style={{ fontSize: '14px' }}>💬</span> 建议管理
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/analytics')}>
          <span style={{ fontSize: '14px' }}>📊</span> 学习统计
        </button>
        <button className="admin-sub-nav-item active">
          <Settings size={16} /> 系统设置
        </button>
      </div>

      <header className="admin-header">
        <div>
          <div className="admin-breadcrumb">
            <Shield size={14} /> 管理员控制台
            <ChevronRight size={12} />
            <span>系统设置</span>
          </div>
          <h1><Settings size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />系统设置</h1>
          <p className="admin-subtitle">AI 助手模型配置、API 端点管理</p>
        </div>
      </header>

      {/* AI Config Card */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1rem' }}>AI 学习助手配置</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>配置 AI 模型端点和密钥，支持 Gemini 和 OpenAI 兼容接口</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Endpoint */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
              API 端点
            </label>
            <input
              type="text"
              value={config.endpoint}
              onChange={e => setConfig(c => ({ ...c, endpoint: e.target.value }))}
              placeholder="https://generativelanguage.googleapis.com/v1beta"
              style={{
                width: '100%', padding: '0.6rem 0.75rem',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#f1f5f9', fontSize: '0.85rem', fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#4b5563' }}>
              Gemini: https://generativelanguage.googleapis.com/v1beta | OpenAI: https://api.openai.com/v1
            </p>
          </div>

          {/* API Key */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
              API Key
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                  placeholder="输入 API Key..."
                  style={{
                    width: '100%', padding: '0.6rem 2.5rem 0.6rem 0.75rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', color: '#f1f5f9', fontSize: '0.85rem', fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px',
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
              <span>模型</span>
              <button
                onClick={handleRefreshModels}
                disabled={modelsLoading}
                style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '6px', padding: '3px 10px', color: '#818cf8', fontSize: '0.75rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <RefreshCw size={12} className={modelsLoading ? 'spin' : ''} />
                {modelsLoading ? '加载中...' : '刷新模型列表'}
              </button>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={config.model}
                onChange={e => setConfig(c => ({ ...c, model: e.target.value }))}
                placeholder="gemini-2.0-flash"
                style={{
                  flex: 1, padding: '0.6rem 0.75rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#f1f5f9', fontSize: '0.85rem', fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Model dropdown from refreshed list */}
            {models.length > 0 && (
              <div style={{
                marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setConfig(c => ({ ...c, model: m.id })); setModels([]); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '8px 12px', background: config.model === m.id ? 'rgba(99,102,241,0.15)' : 'none',
                      border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      color: config.model === m.id ? '#c7d2fe' : '#9ca3af', fontSize: '0.8rem',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace' }}>{m.id}</span>
                    {config.model === m.id && <Check size={14} color="#818cf8" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
          {message.text && (
            <span style={{
              fontSize: '0.8rem',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
            }}>{message.text}</span>
          )}
        </div>
      </div>

      {/* Test Section */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
      }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#f1f5f9', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={16} color="#10b981" /> 测试 AI 连接
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={testMsg}
            onChange={e => setTestMsg(e.target.value)}
            placeholder="输入测试问题（默认：什么是 Transformer？）"
            style={{
              flex: 1, padding: '0.6rem 0.75rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#f1f5f9', fontSize: '0.85rem', fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {testing ? '测试中...' : '发送测试'}
          </button>
        </div>
        {testResult && (
          <div style={{
            padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px', color: '#e2e8f0', fontSize: '0.85rem',
            lineHeight: 1.6, maxHeight: '300px', overflowY: 'auto',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
