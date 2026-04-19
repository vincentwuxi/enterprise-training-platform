import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Shield, BookOpen, Users, BarChart3,
  CheckCircle, Eye, Clock, Trash2, ChevronRight, Settings, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Admin.css';

const TYPE_LABELS = { suggestion: '💡 建议', bug: '🐛 问题', other: '📝 其他' };
const STATUS_CONFIG = {
  pending:  { label: '待处理', color: '#fbbf24', bg: 'rgba(234,179,8,0.12)' },
  reviewed: { label: '已查看', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  resolved: { label: '已解决', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
};

export default function AdminFeedback() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, reviewed: 0, resolved: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/feedback/all?status=${filter}`);
      setFeedback(data.feedback || []);
      setStatusCounts(data.statusCounts || { pending: 0, reviewed: 0, resolved: 0 });
    } catch (err) {
      console.error('Load feedback error:', err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadFeedback(); }, [loadFeedback]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/feedback/${id}`, { status });
      loadFeedback();
    } catch (err) {
      alert('更新失败');
    }
  };

  const saveNote = async (id) => {
    try {
      await api.put(`/api/feedback/${id}`, { adminNote: editNote, status: 'reviewed' });
      setEditingId(null);
      setEditNote('');
      loadFeedback();
    } catch (err) {
      alert('保存失败');
    }
  };

  const deleteFeedback = async (id) => {
    if (!confirm('确定删除这条建议？')) return;
    try {
      await api.delete(`/api/feedback/${id}`);
      loadFeedback();
    } catch (err) {
      alert('删除失败');
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const totalAll = statusCounts.pending + statusCounts.reviewed + statusCounts.resolved;

  return (
    <div className="admin-page page-container">
      {/* Admin sub-navigation */}
      <div className="admin-sub-nav">
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/courses')}>
          <BookOpen size={16} /> 课程管理
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/users')}>
          <Users size={16} /> 用户管理
        </button>
        <button className="admin-sub-nav-item active">
          <MessageSquare size={16} /> 建议管理
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/analytics')}>
          <BarChart3 size={16} /> 学习统计
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/settings')}>
          <Settings size={16} /> 系统设置
        </button>
      </div>

      <header className="admin-header">
        <div>
          <h1><Shield size={24} /> 建议管理</h1>
          <p className="admin-header-sub">查看和管理学员提交的意见反馈</p>
        </div>
      </header>

      {/* Stats row */}
      <div className="admin-stat-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{totalAll}</p>
            <p className="admin-stat-label">总建议数</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#fbbf24', background: 'rgba(234,179,8,0.1)' }}>
            <Clock size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{statusCounts.pending}</p>
            <p className="admin-stat-label">待处理</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
            <Eye size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{statusCounts.reviewed}</p>
            <p className="admin-stat-label">已查看</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#4ade80', background: 'rgba(34,197,94,0.1)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{statusCounts.resolved}</p>
            <p className="admin-stat-label">已解决</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `全部 (${totalAll})` },
          { key: 'pending', label: `待处理 (${statusCounts.pending})` },
          { key: 'reviewed', label: `已查看 (${statusCounts.reviewed})` },
          { key: 'resolved', label: `已解决 (${statusCounts.resolved})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === tab.key ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
              background: filter === tab.key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
              color: filter === tab.key ? '#a5b4fc' : '#94a3b8',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#4b5563' }}>加载中...</div>
      ) : feedback.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#4b5563' }}>暂无建议</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {feedback.map(item => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <div key={item.id} className="glass-panel" style={{ padding: '16px 20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.75rem', padding: '2px 10px', borderRadius: '6px', fontWeight: 600,
                      background: item.type === 'bug' ? 'rgba(239,68,68,0.12)' : item.type === 'other' ? 'rgba(168,85,247,0.12)' : 'rgba(59,130,246,0.12)',
                      color: item.type === 'bug' ? '#f87171' : item.type === 'other' ? '#c084fc' : '#60a5fa',
                    }}>
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {item.user?.name || '未知用户'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                      {item.user?.email} · {item.user?.department || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', padding: '2px 10px', borderRadius: '6px',
                      fontWeight: 500, background: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {item.content}
                </p>

                {/* Admin note */}
                {item.adminNote && editingId !== item.id && (
                  <div style={{
                    fontSize: '0.82rem', color: '#a5b4fc', padding: '10px 12px', borderRadius: '8px',
                    background: 'rgba(99,102,241,0.08)', marginBottom: '10px',
                  }}>
                    💬 管理员回复：{item.adminNote}
                  </div>
                )}

                {/* Edit note form */}
                {editingId === item.id && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="输入管理员回复..."
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: '8px',
                        border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(255,255,255,0.03)',
                        color: '#e2e8f0', fontSize: '0.82rem',
                      }}
                    />
                    <button
                      onClick={() => saveNote(item.id)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: '#6366f1', color: '#fff', fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditNote(''); }}
                      style={{
                        padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      取消
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(item.id, 'reviewed')}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', border: 'none',
                        background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                        fontSize: '0.75rem', cursor: 'pointer',
                      }}
                    >
                      <Eye size={13} style={{ verticalAlign: '-2px' }} /> 标记已查看
                    </button>
                  )}
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(item.id, 'resolved')}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', border: 'none',
                        background: 'rgba(34,197,94,0.12)', color: '#4ade80',
                        fontSize: '0.75rem', cursor: 'pointer',
                      }}
                    >
                      <CheckCircle size={13} style={{ verticalAlign: '-2px' }} /> 标记已解决
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingId(item.id); setEditNote(item.adminNote || ''); }}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none',
                      background: 'rgba(129,140,248,0.12)', color: '#a5b4fc',
                      fontSize: '0.75rem', cursor: 'pointer',
                    }}
                  >
                    <MessageCircle size={13} style={{ verticalAlign: '-2px' }} /> 回复
                  </button>
                  <button
                    onClick={() => deleteFeedback(item.id)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none',
                      background: 'rgba(239,68,68,0.1)', color: '#f87171',
                      fontSize: '0.75rem', cursor: 'pointer', marginLeft: 'auto',
                    }}
                  >
                    <Trash2 size={13} style={{ verticalAlign: '-2px' }} /> 删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
