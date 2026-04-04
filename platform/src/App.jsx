import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PlatformLayout from './components/PlatformLayout';

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const LessonView = React.lazy(() => import('./pages/LessonView'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <Suspense fallback={<div className="page-container">Loading...</div>}>
      <Routes>
        <Route path="/" element={<PlatformLayout />}>
          <Route index element={<Landing />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="course/:courseId" element={<CourseDetail />} />
          <Route path="course/:courseId/lesson/:lessonId" element={<LessonView />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
