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
          {course.chapters.map((chapter) => {
             const Icon = IconMap[chapter.icon] || Circle;
             
             // Check if active lesson id is in this chapter
             const hasActiveLesson = chapter.lessons.some(l => l.id === activeLessonId);

             return (
              <div key={chapter.id} className="chapter-group">
                <div 
                  className={`nav-item ${hasActiveLesson ? 'active' : ''}`}
                  onClick={() => {
                    if (chapter.lessons.length > 0) {
                      navigate(`/course/${courseId}/lesson/${chapter.lessons[0].id}`);
                    }
                  }}
                >
                  <Icon className="icon" />
                  <div className="nav-item-content">
                    <span className="nav-item-title">{chapter.title}</span>
                    <span className="nav-item-subtitle">{chapter.subtitle}</span>
                  </div>
                </div>
                {hasActiveLesson && (
                   <div className="lesson-submenu">
                      {chapter.lessons.map(lesson => (
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
