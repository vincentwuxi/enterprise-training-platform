import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Circle, Clock, BookOpen, Layers } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import './CourseDetail.css';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const courseData = courseRegistry[courseId];
  if (!courseData) return <div className="page-container">Course not found.</div>;

  const course = courseData.manifest;

  // ── Normalise: support both 'chapters' (old) and 'modules' (new) ──
  const normalizeChapters = () => {
    if (course.chapters?.length) return course.chapters;
    if (course.modules?.length) {
      return course.modules.map(m => ({
        id: m.id,
        title: m.title,
        subtitle: m.description || '',
        lessons: [{ id: m.id, title: m.title, estimatedMinutes: null }],
      }));
    }
    return [];
  };

  const chapters = normalizeChapters();
  const firstLesson = chapters[0]?.lessons?.[0];

  const totalHours = course.estimatedHours || course.totalHours;

  return (
    <div className="course-detail-page page-container">
      <div className="course-hero glass-panel">
        <div className="course-hero-content">
          <div className="category-badge">{course.category}</div>
          <h1 className="course-title">{course.title}</h1>
          <p className="course-desc">{course.description}</p>

          <div className="course-stats">
            {course.difficulty && <span className="stat-badge">难度: {course.difficulty}</span>}
            {course.level && <span className="stat-badge">级别: {course.level}</span>}
            {totalHours && <span className="stat-badge">时长: ~{totalHours}h</span>}
            <span className="stat-badge">章节: {chapters.length}</span>
          </div>

          <div className="course-actions">
            <button
              className="primary-btn start-btn"
              onClick={() => {
                if (firstLesson) navigate(`/course/${courseId}/lesson/${firstLesson.id}`);
              }}
            >
              <Play size={20} fill="currentColor" /> 开始学习
            </button>
          </div>
        </div>
        <div className="course-hero-visual"
          style={{ background: `linear-gradient(135deg, ${course.cover?.gradient?.[0] || '#1e293b'}, ${course.cover?.gradient?.[1] || '#0f172a'})` }}
        />
      </div>

      <div className="course-content-layout">
        <div className="course-main">
          <h2>课程大纲</h2>
          <div className="curriculum-list">
            {chapters.map((chapter, i) => (
              <div key={chapter.id || i} className="chapter-block glass-panel">
                <div className="chapter-header">
                  <h3>{chapter.title}</h3>
                  {chapter.subtitle && <p className="chapter-subtitle">{chapter.subtitle}</p>}
                </div>
                <div className="lesson-list">
                  {(chapter.lessons || []).map((lesson) => (
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
              {course.features?.hasSandbox && <li>✨ 交互式可视化沙盒</li>}
              {course.features?.hasQuiz && <li>❓ 即时测验反馈</li>}
              {course.features?.progressTracking && <li>📈 学习进度追踪</li>}
              {!course.features && <>
                <li>✨ 交互式演示与模拟器</li>
                <li>📈 学习进度追踪</li>
                <li>🔧 代码示例与实战</li>
              </>}
            </ul>

            {course.tags?.length > 0 && (
              <>
                <h3 className="mt-6">标签</h3>
                <div className="tags-list">
                  {course.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </>
            )}

            {course.instructor && (
              <>
                <h3 className="mt-6">讲师</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{course.instructor}</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
