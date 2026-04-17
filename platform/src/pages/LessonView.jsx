import React, { Suspense } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/CourseSidebar';
import { ChevronRight } from 'lucide-react';
import './LessonView.css';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const { canUserAccessCourse, isAdmin } = useAuth();
  const courseData = courseRegistry[courseId];

  if (!courseData) return <div className="page-container">Course not found.</div>;

  // ACL guard: redirect unauthorized users to course detail (shows 'no access' message)
  if (!isAdmin && !canUserAccessCourse(courseId)) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  const course = courseData.manifest;

  // ── Normalise: support both 'chapters' (old) and 'modules' (new) ──
  let currentLesson = null;
  let componentKey = null;

  if (course.chapters?.length) {
    // Old format: chapters > lessons > component
    for (const chapter of course.chapters) {
      const found = chapter.lessons?.find(l => l.id === lessonId);
      if (found) { currentLesson = found; componentKey = found.component; break; }
    }
  }

  if (!currentLesson && course.modules?.length) {
    // New format: modules[].id === lessonId, lessonKey = component key
    const mod = course.modules.find(m => m.id === lessonId);
    if (mod) {
      currentLesson = { id: mod.id, title: mod.title };
      componentKey = mod.component || mod.lessonKey;
    }
  }

  if (!currentLesson) return <div className="page-container">Lesson not found.</div>;

  // Resolve component
  const LessonComponent = courseData.components[componentKey];

  return (
    <div className="lesson-view-layout">
      <CourseSidebar course={course} activeLessonId={lessonId} />

      <main className="lesson-content-area">
        <div className="lesson-breadcrumb">
          <Link to={`/course/${courseId}`} className="breadcrumb-link">{course.title}</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{currentLesson.title}</span>
        </div>

        <div className="lesson-scroll-area">
          <Suspense fallback={<div className="lesson-loading">Loading Lesson Content...</div>}>
            {LessonComponent
              ? <LessonComponent />
              : <div style={{ padding: '2rem', color: '#ef4444' }}>⚠️ Component "{componentKey}" not found in registry.</div>
            }
          </Suspense>
        </div>
      </main>
    </div>
  );
}
