import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './FeedbackWidget.css';

const TYPE_LABELS = {
  suggestion: '💡 建议',
  bug: '🐛 问题',
  other: '📝 其他',
};

const STATUS_LABELS = {
  pending: '待处理',
  reviewed: '已查看',
  resolved: '已解决',
};

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('submit'); // submit | history
  const [type, setType] = useState('suggestion');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const data = await api.get('/api/feedback');
      setHistory(data.feedback || []);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  }, [user]);

  useEffect(() => {
    if (open && tab === 'history') {
      loadHistory();
    }
  }, [open, tab, loadHistory]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/api/feedback', { type, content: content.trim() });
      setSubmitted(true);
      setContent('');
      setTimeout(() => {
        setSubmitted(false);
        setTab('history');
        loadHistory();
      }, 1500);
    } catch (err) {
      alert(err.data?.error || '提交失败，请重试');
    }
    setSubmitting(false);
  };

  if (!user) return null;

  const formatTime = (iso) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Count items with admin replies the user hasn't seen
  const repliedCount = history.filter(f => f.adminNote && f.status !== 'pending').length;

  return (
    <div className="feedback-fab">
      <button
        className={`feedback-fab-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        title="提交建议"
      >
        {open ? <X size={22} /> : <MessageSquarePlus size={22} />}
      </button>
      {!open && repliedCount > 0 && (
        <span className="feedback-badge">{repliedCount}</span>
      )}

      {open && (
        <div className="feedback-panel">
          <div className="feedback-panel-header">
            <h3>📬 意见反馈</h3>
          </div>

          <div className="feedback-tabs">
            <button
              className={`feedback-tab ${tab === 'submit' ? 'active' : ''}`}
              onClick={() => setTab('submit')}
            >
              提交建议
            </button>
            <button
              className={`feedback-tab ${tab === 'history' ? 'active' : ''}`}
              onClick={() => setTab('history')}
            >
              我的建议 {history.length > 0 && `(${history.length})`}
            </button>
          </div>

          {tab === 'submit' && (
            submitted ? (
              <div className="feedback-success-toast">✅ 感谢您的建议，我们会认真处理！</div>
            ) : (
              <div className="feedback-form">
                <div className="feedback-type-row">
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      className={`feedback-type-btn ${type === key ? 'active' : ''}`}
                      onClick={() => setType(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="feedback-textarea"
                  placeholder="请描述您的建议或遇到的问题..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                />
                <button
                  className="feedback-submit-btn"
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                >
                  {submitting ? '提交中...' : '提交建议'}
                </button>
              </div>
            )
          )}

          {tab === 'history' && (
            <div className="feedback-history">
              {loadingHistory ? (
                <div className="feedback-history-empty">加载中...</div>
              ) : history.length === 0 ? (
                <div className="feedback-history-empty">暂无提交记录</div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="feedback-item">
                    <div className="feedback-item-header">
                      <span className={`feedback-item-type ${item.type}`}>
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className={`feedback-item-status ${item.status}`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                        <span className="feedback-item-time">{formatTime(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="feedback-item-content">{item.content}</div>
                    {item.adminNote && (
                      <div className="feedback-item-note">{item.adminNote}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
