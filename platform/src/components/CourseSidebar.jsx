import React from 'react';
import { Target, Activity, DivideSquare, Sparkles, Circle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './CourseSidebar.css';

// Simple icon map for dynamic rendering
const IconMap = {
  'target': Target,
  'activity': Activity,
  'divide-square': DivideSquare,
  'circle': Circle
};

export default function CourseSidebar({ course, activeLessonId }) {
  const navigate = useNavigate();
  const { courseId } = useParams();

  return (
    <aside className="course-sidebar-nav glass-panel">
      <div className="sidebar-section">
        <h3 className="section-title">课程目录</h3>
        <nav className="nav-menu">
          {/* Normalise: support both chapters (old) and modules (new) */}
          {(course.chapters || course.modules || []).map((item) => {
             const Icon = IconMap[item.icon] || Circle;
             const lessons = item.lessons || [{ id: item.id, title: item.title }];
             const hasActiveLesson = lessons.some(l => l.id === activeLessonId);
             const isActive = item.id === activeLessonId || hasActiveLesson;

             return (
              <div key={item.id} className="chapter-group">
                <div
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    navigate(`/course/${courseId}/lesson/${lessons[0].id}`);
                  }}
                >
                  <Icon className="icon" />
                  <div className="nav-item-content">
                    <span className="nav-item-title">{item.title}</span>
                    {item.subtitle && <span className="nav-item-subtitle">{item.subtitle}</span>}
                  </div>
                </div>
                {hasActiveLesson && lessons.length > 1 && (
                   <div className="lesson-submenu">
                      {lessons.map(lesson => (
                         <div
                           key={lesson.id}
                           className={`submenu-item ${lesson.id === activeLessonId ? 'active' : ''}`}
                           onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                         >
                            <span className="submenu-title">{lesson.title}</span>
                         </div>
                      ))}
                   </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      
      <div className="sidebar-section" style={{marginTop: 'auto'}}>
        <div className="nav-item unlock-btn">
          <Sparkles className="icon" />
          <div className="nav-item-content">
            <span className="nav-item-title">解锁全部互动沙盒</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
