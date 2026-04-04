import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Award, BookOpen, Shield } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, getUserProgress } = useAuth();

  // Real progress from localStorage
  const progress = getUserProgress();

  const stats = useMemo(() => {
    const courseIds = Object.keys(progress);
    let totalLessons = 0;
    let completedLessons = 0;
    courseIds.forEach(cid => {
      const p = progress[cid];
      const reg = courseRegistry[cid];
      if (!reg) return;
      const total = (reg.manifest?.modules || reg.manifest?.chapters || []).length;
      const done = Object.keys(p).filter(k => k !== 'timeSpent').length;
      totalLessons += total;
      completedLessons += done;
    });
    const totalTime = courseIds.reduce((acc, cid) => acc + (progress[cid]?.timeSpent || 0), 0);
    const hours = (totalTime / 3600).toFixed(1);
    return { coursesStarted: courseIds.length, completedLessons, totalLessons, hours };
  }, [progress]);

  // Most recent course with progress
  const recentCourseId = Object.keys(progress)[0] || 'linux-mastery';
  const recentCourse = courseRegistry[recentCourseId]?.manifest;
  const recentProgress = progress[recentCourseId] || {};
  const recentModules = recentCourse?.modules || recentCourse?.chapters || [];
  const recentDone = Object.keys(recentProgress).filter(k => k !== 'timeSpent').length;
  const recentPct = recentModules.length ? Math.round(recentDone / recentModules.length * 100) : 0;

  // All courses with progress
  const inProgressCourses = Object.keys(courseRegistry)
    .filter(id => progress[id] && Object.keys(progress[id]).some(k => k !== 'timeSpent'))
    .slice(0, 4)
    .map(id => {
      const manifest = courseRegistry[id].manifest;
      const modules = manifest?.modules || manifest?.chapters || [];
      const done = Object.keys(progress[id]).filter(k => k !== 'timeSpent').length;
      const pct = modules.length ? Math.round(done / modules.length * 100) : 0;
      return { id, manifest, pct, done, total: modules.length };
    });

  return (
    <div className="dashboard-page page-container">
      <header className="dashboard-header">
        <h1>👋 欢迎回来，{user?.name || '学习者'}</h1>
        {isAdmin && (
          <button className="goto-admin-btn" onClick={() => navigate('/admin')}>
            <Shield size={16} /> 进入管理后台
          </button>
        )}
      </header>

      <div className="stats-row">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><BookOpen size={24} /></div>
          <div className="stat-info">
            <span className="stat-title">已学习时长</span>
            <span className="stat-value">{stats.hours}h</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper match"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="stat-title">学习中课程</span>
            <span className="stat-value">{stats.coursesStarted} 门</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper target"><Target size={24} /></div>
          <div className="stat-info">
            <span className="stat-title">完成章节</span>
            <span className="stat-value">{stats.completedLessons} 章</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="continue-learning-section">
          <h2>📌 继续学习</h2>

          {inProgressCourses.length > 0 ? inProgressCourses.map(c => (
            <div key={c.id} className="continue-card glass-panel"
              onClick={() => navigate(`/course/${c.id}`)}>
              <div className="continue-info">
                <h3>{c.manifest?.title}</h3>
                <p>已完成 {c.done}/{c.total} 章节 · {c.pct}%</p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
              <button className="primary-btn">继续 →</button>
            </div>
          )) : (
            <div className="empty-progress glass-panel">
              <p>还没有开始的课程。</p>
              <button className="primary-btn" onClick={() => navigate('/catalog')}>浏览课程目录 →</button>
            </div>
          )}

          <h2 className="mt-8">🏆 推荐课程</h2>
          <div className="achievements-grid">
            {Object.entries(courseRegistry).slice(0, 4).map(([id, reg]) => (
              <div key={id} className="achievement-card" onClick={() => navigate(`/course/${id}`)}
                style={{ cursor: 'pointer' }}>
                <div className="achievement-icon">📚</div>
                <h4>{reg.manifest?.title?.split('：')[0] || reg.manifest?.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {(reg.manifest?.modules || reg.manifest?.chapters || []).length} 章节
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="dashboard-sidebar">
          <div className="trend-box glass-panel">
            <h3>📈 学习概览</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {Object.entries(courseRegistry).slice(0, 5).map(([id, reg]) => {
                const p = progress[id] || {};
                const modules = reg.manifest?.modules || reg.manifest?.chapters || [];
                const done = Object.keys(p).filter(k => k !== 'timeSpent').length;
                const pct = modules.length ? Math.round(done / modules.length * 100) : 0;
                return (
                  <div key={id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <span>{(reg.manifest?.title || id).split('：')[0]}</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #818cf8)', borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
