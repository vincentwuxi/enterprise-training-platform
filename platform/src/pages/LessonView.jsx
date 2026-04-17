import React, { Suspense, useMemo, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/CourseSidebar';
import { ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, Menu, X, CheckCircle } from 'lucide-react';
import './LessonView.css';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { canUserAccessCourse, isAdmin, markLessonComplete, getUserProgress } = useAuth();
  const courseData = courseRegistry[courseId];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!courseData) return <div className="page-container">Course not found.</div>;

  // ACL guard: redirect unauthorized users to course detail (shows 'no access' message)
  if (!isAdmin && !canUserAccessCourse(courseId)) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  const course = courseData.manifest;

  // ── Build a flat list of all lessons for navigation ──
  const allLessons = useMemo(() => {
    const lessons = [];
    if (course.chapters?.length) {
      for (const chapter of course.chapters) {
        for (const lesson of (chapter.lessons || [])) {
          lessons.push({
            id: lesson.id,
            title: lesson.title,
            component: lesson.component,
          });
        }
      }
    }
    if (course.modules?.length) {
      for (const mod of course.modules) {
        lessons.push({
          id: mod.id,
          title: mod.title,
          component: mod.component || mod.lessonKey,
        });
      }
    }
    return lessons;
  }, [course]);

  // Find current lesson
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!currentLesson) return <div className="page-container">Lesson not found.</div>;

  // Resolve component
  const componentKey = currentLesson.component;
  const LessonComponent = courseData.components[componentKey];

  // Progress
  const progress = getUserProgress();
  const isCompleted = progress[courseId]?.[lessonId];

  const handleMarkComplete = () => {
    markLessonComplete(courseId, lessonId);
    if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  return (
    <div className="lesson-view-layout">
      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar with mobile overlay */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        <CourseSidebar course={course} activeLessonId={lessonId} />
      </div>

      <main className="lesson-content-area">
        <div className="lesson-breadcrumb">
          <Link to={`/course/${courseId}`} className="breadcrumb-link">{course.title}</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{currentLesson.title}</span>
          <span className="lesson-progress-indicator">
            {currentIndex + 1} / {allLessons.length}
          </span>
        </div>

        <div className="lesson-scroll-area">
          <Suspense fallback={<div className="lesson-loading">Loading Lesson Content...</div>}>
            {LessonComponent
              ? <LessonComponent />
              : <div style={{ padding: '2rem', color: '#ef4444' }}>⚠️ Component "{componentKey}" not found in registry.</div>
            }
          </Suspense>

          {/* Bottom navigation */}
          <div className="lesson-bottom-nav">
            <div className="lesson-nav-left">
              {prevLesson ? (
                <button
                  className="lesson-nav-btn prev"
                  onClick={() => navigate(`/course/${courseId}/lesson/${prevLesson.id}`)}
                >
                  <ArrowLeft size={16} />
                  <div className="nav-btn-text">
                    <span className="nav-btn-label">上一章</span>
                    <span className="nav-btn-title">{prevLesson.title}</span>
                  </div>
                </button>
              ) : (
                <button
                  className="lesson-nav-btn prev"
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  <ArrowLeft size={16} />
                  <div className="nav-btn-text">
                    <span className="nav-btn-label">返回</span>
                    <span className="nav-btn-title">课程概览</span>
                  </div>
                </button>
              )}
            </div>

            <button
              className={`lesson-complete-btn ${isCompleted ? 'completed' : ''}`}
              onClick={handleMarkComplete}
              disabled={isCompleted}
            >
              <CheckCircle size={18} />
              {isCompleted ? '已完成' : '标记完成'}
            </button>

            <div className="lesson-nav-right">
              {nextLesson ? (
                <button
                  className="lesson-nav-btn next"
                  onClick={() => navigate(`/course/${courseId}/lesson/${nextLesson.id}`)}
                >
                  <div className="nav-btn-text">
                    <span className="nav-btn-label">下一章</span>
                    <span className="nav-btn-title">{nextLesson.title}</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="lesson-nav-btn next completed-course"
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  <div className="nav-btn-text">
                    <span className="nav-btn-label">🎉 课程完结</span>
                    <span className="nav-btn-title">返回课程页</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
