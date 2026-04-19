import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, BookOpen, Shield, Clock, TrendingUp,
  Award, Target, MessageSquare, Settings, Activity
} from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import api from '../utils/api';
import './Admin.css';

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/admin/analytics');
        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Load analytics error:', err);
      }
      setLoading(false);
    })();
  }, []);

  const courseNameMap = useMemo(() => {
    const map = {};
    Object.entries(courseRegistry).forEach(([id, reg]) => {
      map[id] = reg.manifest?.title?.split('：')[0] || reg.manifest?.title || id;
    });
    return map;
  }, []);

  const formatHours = (seconds) => {
    if (!seconds) return '0h';
    const h = (seconds / 3600).toFixed(1);
    return `${h}h`;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="admin-page page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ color: '#4b5563' }}>加载统计数据中...</div>
      </div>
    );
  }

  const maxDaily = analytics?.dailyActivity?.length
    ? Math.max(...analytics.dailyActivity.map(d => d.count))
    : 1;

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
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/feedback')}>
          <MessageSquare size={16} /> 建议管理
        </button>
        <button className="admin-sub-nav-item active">
          <BarChart3 size={16} /> 学习统计
        </button>
        <button className="admin-sub-nav-item" onClick={() => navigate('/admin/settings')}>
          <Settings size={16} /> 系统设置
        </button>
      </div>

      <header className="admin-header">
        <div>
          <h1><BarChart3 size={24} /> 学习统计</h1>
          <p className="admin-header-sub">全平台学习数据概览与分析</p>
        </div>
      </header>

      {/* Overview stats */}
      <div className="admin-stat-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)' }}>
            <Users size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{analytics?.totalUsers || 0}</p>
            <p className="admin-stat-label">总用户数</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
            <Clock size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{analytics?.totalTimeHours || '0'}h</p>
            <p className="admin-stat-label">总学习时长</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#4ade80', background: 'rgba(34,197,94,0.1)' }}>
            <Target size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{analytics?.totalCompletions || 0}</p>
            <p className="admin-stat-label">完成课时</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <p className="admin-stat-value">{Object.keys(courseRegistry).length}</p>
            <p className="admin-stat-label">课程总数</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Daily activity chart */}
        <div className="glass-panel" style={{ padding: '20px', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> 近 14 天学习活跃度
          </h3>
          {analytics?.dailyActivity?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '0 4px' }}>
              {analytics.dailyActivity.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{d.count}</span>
                  <div style={{
                    width: '100%',
                    maxWidth: '36px',
                    height: `${Math.max(4, (d.count / maxDaily) * 90)}px`,
                    background: 'linear-gradient(180deg, #818cf8, #6366f1)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                  }} />
                  <span style={{ fontSize: '0.6rem', color: '#4b5563', whiteSpace: 'nowrap' }}>
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              暂无活动数据
            </p>
          )}
        </div>

        {/* Course ranking */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} /> 课程学习排行
          </h3>
          {analytics?.topCourses?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analytics.topCourses.slice(0, 10).map((c, i) => {
                const maxComp = analytics.topCourses[0]?.completions || 1;
                return (
                  <div key={c.courseId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700,
                          background: i < 3 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.06)',
                          color: i < 3 ? '#fff' : '#94a3b8',
                        }}>
                          {i + 1}
                        </span>
                        {courseNameMap[c.courseId] || c.courseId}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {c.completions} 课时 · {c.learners} 学员 · {formatHours(c.timeSpent)}
                      </span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(c.completions / maxComp) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                        borderRadius: '2px',
                        transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center' }}>暂无数据</p>
          )}
        </div>

        {/* Top learners */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} /> 学习达人排行
          </h3>
          {analytics?.topLearners?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analytics.topLearners.map((l, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px',
                  background: i < 3 ? 'rgba(99,102,241,0.06)' : 'transparent',
                }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                    background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                                i === 1 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' :
                                i === 2 ? 'linear-gradient(135deg, #b45309, #d97706)' :
                                'rgba(255,255,255,0.06)',
                    color: i < 3 ? '#fff' : '#94a3b8',
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {l.user.name || 'Unknown'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                      {l.user.department || ''} {l.user.email ? `· ${l.user.email}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                      {l.completedLessons} 课时
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                      {formatHours(l.timeSpent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center' }}>暂无数据</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-panel" style={{ padding: '20px', marginTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> 最近学习记录
        </h3>
        {analytics?.recentActivity?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 500 }}>学员</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 500 }}>课程</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 500 }}>章节</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: '#94a3b8', fontWeight: 500 }}>时间</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentActivity.slice(0, 20).map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{a.user}</td>
                    <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>
                      {courseNameMap[a.courseId] || a.courseId}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{a.lessonId}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b', textAlign: 'right' }}>
                      {formatTime(a.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            暂无学习记录
          </p>
        )}
      </div>
    </div>
  );
}
