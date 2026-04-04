import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Infinity } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import './Catalog.css';

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const courses = Object.keys(courseRegistry).map(key => ({
    id: key,
    ...courseRegistry[key].manifest
  }));

  // Simple filtering
  const filteredCourses = courses.filter(course => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'math' && course.category === '数学与逻辑') return true;
    if (activeCategory === 'code' && course.category === '编程与技术') return true;
    if (activeCategory === 'mgmt' && course.category === '管理与商业') return true;
    if (activeCategory === 'design' && course.category === '设计与创意') return true;
    if (activeCategory === 'lang' && course.category === '语言与沟通') return true;
    return false;
  });

  return (
    <div className="catalog-page page-container">
      <header className="catalog-header">
        <h1>探索课程</h1>
        <div className="filter-tabs">
          <button className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => navigate('/catalog')}>全部</button>
          <button className={`filter-tab ${activeCategory === 'math' ? 'active' : ''}`} onClick={() => navigate('/catalog?category=math')}>数学与逻辑</button>
          <button className={`filter-tab ${activeCategory === 'code' ? 'active' : ''}`} onClick={() => navigate('/catalog?category=code')}>编程与技术</button>
        </div>
      </header>

      <div className="course-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card glass-panel" onClick={() => navigate(`/course/${course.id}`)}>
              <div className="course-cover" style={{ background: `linear-gradient(135deg, ${course.cover.gradient[0]}, ${course.cover.gradient[1]})` }}>
                <Infinity size={48} className="course-cover-icon" />
              </div>
              <div className="course-content">
                <span className="course-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-meta">
                  <span>⏱️ {course.estimatedHours}h</span>
                  <span>📖 {course.chapters.length}章</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>该分类下暂无课程</p>
          </div>
        )}
      </div>
    </div>
  );
}
