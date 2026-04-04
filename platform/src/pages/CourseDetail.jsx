import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Circle } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import './CourseDetail.css';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const courseData = courseRegistry[courseId];
  if (!courseData) return <div className="page-container">Course not found.</div>;
  
  const course = courseData.manifest;
  
  // Find first lesson
  const firstChapter = course.chapters[0];
  const firstLesson = firstChapter?.lessons[0];

  return (
    <div className="course-detail-page page-container">
      <div className="course-hero glass-panel">
        <div className="course-hero-content">
          <div className="category-badge">{course.category}</div>
          <h1 className="course-title">{course.title}</h1>
          <p className="course-desc">{course.description}</p>
          
          <div className="course-stats">
            <span className="stat-badge">难度: {course.difficulty}</span>
            <span className="stat-badge">时长: ~{course.estimatedHours}h</span>
            <span className="stat-badge">章节: {course.chapters.length}</span>
          </div>
          
          <div className="course-actions">
            <button 
              className="primary-btn start-btn"
              onClick={() => {
                 if(firstLesson) navigate(`/course/${courseId}/lesson/${firstLesson.id}`);
              }}
            >
              <Play size={20} fill="currentColor" /> 开始学习
            </button>
          </div>
        </div>
        <div className="course-hero-visual" style={{ background: `linear-gradient(135deg, ${course.cover.gradient[0]}, ${course.cover.gradient[1]})` }}>
           {/* Visual placeholder */}
        </div>
      </div>
      
      <div className="course-content-layout">
        <div className="course-main">
          <h2>课程大纲</h2>
          <div className="curriculum-list">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="chapter-block glass-panel">
                <div className="chapter-header">
                  <h3>{chapter.title}</h3>
                  <p className="chapter-subtitle">{chapter.subtitle}</p>
                </div>
                <div className="lesson-list">
                  {chapter.lessons.map((lesson) => (
                    <div 
                      key={lesson.id} 
                      className="lesson-item"
                      onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                    >
                       <Circle size={18} className="lesson-status-icon pending" />
                       <span className="lesson-title">{lesson.title}</span>
                       {lesson.estimatedMinutes && <span className="lesson-duration">{lesson.estimatedMinutes} min</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <aside className="course-sidebar">
          <div className="glass-panel info-box">
            <h3>包含内容</h3>
            <ul className="feature-list">
              {course.features.hasSandbox && <li>✨ 交互式可视化沙盒</li>}
              {course.features.hasQuiz && <li>❓ 即时测验反馈</li>}
              {course.features.progressTracking && <li>📈 学习进度追踪</li>}
            </ul>
             
            <h3 className="mt-6">标签</h3>
            <div className="tags-list">
               {course.tags.map(tag => (
                 <span key={tag} className="tag">#{tag}</span>
               ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
