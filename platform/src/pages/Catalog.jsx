import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Infinity, EyeOff } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const { isCourseOnline, isAdmin } = useAuth();

  const courses = Object.keys(courseRegistry).map(key => ({
    id: key,
    ...courseRegistry[key].manifest,
    online: isCourseOnline(key),
  })).filter(course => {
    // Learners only see online courses; admins see all (with offline badge)
    if (!isAdmin && !course.online) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'math' && course.category === '数学与逻辑') return true;
    if (activeCategory === 'code' && course.category === '编程与技术') return true;
    if (activeCategory === 'ops'  && course.category === '操作系统与运维') return true;
    if (activeCategory === 'ai'   && (course.category === 'AI 工程与模型训练' || course.category === 'AI技能')) return true;
    if (activeCategory === 'sci'  && course.category === '科学与技术') return true;
    return false;
  });

  return (
    <div className="catalog-page page-container">
      <header className="catalog-header">
        <h1>探索课程</h1>
        <div className="filter-tabs">
          {[
            { key: 'all',  label: '全部' },
            { key: 'ai',   label: 'AI 技术' },
            { key: 'ops',  label: '运维与系统' },
            { key: 'code', label: '编程与技术' },
            { key: 'math', label: '数学与逻辑' },
            { key: 'sci',  label: '科学与技术' },
          ].map(f => (
            <button key={f.key}
              className={`filter-tab ${activeCategory === f.key ? 'active' : ''}`}
              onClick={() => navigate(f.key === 'all' ? '/catalog' : `/catalog?category=${f.key}`)}>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map(course => (
            <div key={course.id} className={`course-card glass-panel ${!course.online ? 'course-offline' : ''}`}
              onClick={() => navigate(`/course/${course.id}`)}>
              {isAdmin && !course.online && (
                <div className="offline-indicator"><EyeOff size={12} /> 已下线</div>
              )}
              <div className="course-cover" style={{ background: `linear-gradient(135deg, ${course.cover?.gradient?.[0] || '#1e293b'}, ${course.cover?.gradient?.[1] || '#0f172a'})` }}>
                <Infinity size={48} className="course-cover-icon" />
              </div>
              <div className="course-content">
                <span className="course-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-meta">
                  <span>⏱️ {course.estimatedHours || course.totalHours}h</span>
                  <span>📖 {(course.chapters || course.modules || []).length}章</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state"><p>该分类下暂无课程</p></div>
        )}
      </div>
    </div>
  );
}
