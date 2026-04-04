import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseRegistry } from '../courses/registry';
import CourseSidebar from '../components/CourseSidebar';
import { ChevronRight } from 'lucide-react';
import './LessonView.css';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const courseData = courseRegistry[courseId];
  
  if (!courseData) return <div className="page-container">Course not found.</div>;
  
  const course = courseData.manifest;
  
  // Find current lesson definition
  let currentLesson = null;
  for (const chapter of course.chapters) {
     const found = chapter.lessons.find(l => l.id === lessonId);
     if(found) {
        currentLesson = found;
        break;
     }
  }

  if(!currentLesson) return <div className="page-container">Lesson not found.</div>;

  // Resolve component
  const LessonComponent = courseData.components[currentLesson.component];

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
                 {LessonComponent ? <LessonComponent /> : <div>Component Not Defined</div>}
             </Suspense>
         </div>
      </main>
    </div>
  );
}
