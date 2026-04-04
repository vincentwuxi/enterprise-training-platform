import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseRegistry } from '../courses/registry';
import {
  BarChart3, Users, BookOpen, TrendingUp, Shield,
  ToggleLeft, ToggleRight, Eye, AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react';
import './Admin.css';

// ── Stat card ──
function StatCard({ icon, label, value, color = '#818cf8', sub }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <div>
        <p className="admin-stat-value">{value}</p>
        <p className="admin-stat-label">{label}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const navigate = useNavigate();
  const { user, courseStatus, setCourseOnline, isCourseOnline, getAllUsers } = useAuth();

  const allUsers = getAllUsers();
  const learners = allUsers.filter(u => u.role === 'learner');
  const totalCourses = Object.keys(courseRegistry).length;
  const onlineCount = Object.keys(courseRegistry).filter(id => isCourseOnline(id)).length;

  const [confirmToggle, setConfirmToggle] = useState(null); // { courseId, toOnline }
  const [filter, setFilter] = useState('all'); // 'all' | 'online' | 'offline'

  const courses = Object.entries(courseRegistry).map(([id, reg]) => ({
    id,
    manifest: reg.manifest,
    online: isCourseOnline(id),
  })).filter(c => {
    if (filter === 'online') return c.online;
    if (filter === 'offline') return !c.online;
    return true;
  });

  const handleToggle = (courseId, currentOnline) => {
    setConfirmToggle({ courseId, toOnline: !currentOnline });
  };

  const confirmAction = () => {
    if (confirmToggle) {
      setCourseOnline(confirmToggle.courseId, confirmToggle.toOnline);
      setConfirmToggle(null);
    }
  };

  return (
    <div className="admin-page page-container">
      {/* Header */}
      <header className="admin-header">
        <div>
          <div className="admin-breadcrumb">
            <Shield size={14} /> 管理员控制台
            <ChevronRight size={12} />
            <span>课程管理</span>
          </div>
          <h1>课程上线管理</h1>
          <p className="admin-subtitle">控制哪些课程对学员可见。下线课程不会影响已报名学员的学习进度。</p>
        </div>
        <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>
          <Users size={16} /> 用户管理
        </button>
      </header>

      {/* Stats row */}
      <div className="admin-stats-row">
        <StatCard icon={<BookOpen size={20} />} label="课程总数" value={totalCourses} color="#818cf8" />
        <StatCard icon={<CheckCircle size={20} />} label="已上线" value={onlineCount} color="#10b981" sub={`${totalCourses - onlineCount} 门已下线`} />
        <StatCard icon={<Users size={20} />} label="学员总数" value={learners.length} color="#f59e0b" />
        <StatCard icon={<TrendingUp size={20} />} label="上线率" value={`${Math.round(onlineCount / totalCourses * 100)}%`} color="#06b6d4" />
      </div>

      {/* Filter tabs */}
      <div className="admin-filter-tabs">
        {[
          { key: 'all', label: `全部 (${totalCourses})` },
          { key: 'online', label: `已上线 (${onlineCount})` },
          { key: 'offline', label: `已下线 (${totalCourses - onlineCount})` },
        ].map(f => (
          <button key={f.key} className={`admin-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Course table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>状态</th>
              <th>课程名称</th>
              <th>分类</th>
              <th>章节数</th>
              <th>预计时长</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(({ id, manifest, online }) => (
              <tr key={id} className={!online ? 'row-offline' : ''}>
                <td>
                  <span className={`status-badge ${online ? 'online' : 'offline'}`}>
                    {online ? '● 上线' : '○ 下线'}
                  </span>
                </td>
                <td>
                  <div className="course-name-cell">
                    <strong>{manifest?.title || id}</strong>
                    <span className="course-id-tag">{id}</span>
                  </div>
                </td>
                <td><span className="category-tag-sm">{manifest?.category || '—'}</span></td>
                <td>{manifest?.modules?.length ?? '—'} 章</td>
                <td>{manifest?.totalHours ? `${manifest.totalHours}h` : '—'}</td>
                <td>
                  <div className="action-btns">
                    <button className="preview-btn" onClick={() => navigate(`/course/${id}`)}>
                      <Eye size={14} /> 预览
                    </button>
                    <button
                      className={`toggle-btn ${online ? 'toggle-off' : 'toggle-on'}`}
                      onClick={() => handleToggle(id, online)}>
                      {online
                        ? <><ToggleRight size={16} /> 下线</>
                        : <><ToggleLeft size={16} /> 上线</>
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      {confirmToggle && (
        <div className="modal-overlay" onClick={() => setConfirmToggle(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              {confirmToggle.toOnline ? <CheckCircle size={32} color="#10b981" /> : <AlertTriangle size={32} color="#f59e0b" />}
            </div>
            <h3>{confirmToggle.toOnline ? '确认上线课程？' : '确认下线课程？'}</h3>
            <p>
              {confirmToggle.toOnline
                ? '上线后，所有学员将能在课程目录中看到该课程。'
                : '下线后，该课程将从学员目录中隐藏。已报名学员仍可继续学习。'}
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmToggle(null)}>取消</button>
              <button className={`modal-confirm ${confirmToggle.toOnline ? 'confirm-green' : 'confirm-amber'}`}
                onClick={confirmAction}>
                确认{confirmToggle.toOnline ? '上线' : '下线'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
