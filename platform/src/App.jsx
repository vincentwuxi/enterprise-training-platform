import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PlatformLayout from './components/PlatformLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Login      = React.lazy(() => import('./pages/Login'));
const Catalog    = React.lazy(() => import('./pages/Catalog'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const LessonView = React.lazy(() => import('./pages/LessonView'));
const Dashboard  = React.lazy(() => import('./pages/Dashboard'));
const AdminCourses = React.lazy(() => import('./pages/AdminCourses'));
const AdminUsers   = React.lazy(() => import('./pages/AdminUsers'));

const Loader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#060b16', color: '#6b7280', flexDirection: 'column', gap: '1rem'
  }}>
    <div style={{
      width: 32, height: 32, border: '3px solid rgba(99,102,241,0.2)',
      borderTopColor: '#818cf8', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public — only login is accessible without auth */}
          <Route path="/login" element={<Login />} />

          {/* All content requires authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Catalog />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            <Route path="course/:courseId/lesson/:lessonId" element={<LessonView />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Admin-only routes */}
            <Route path="admin/courses" element={
              <ProtectedRoute requireAdmin><AdminCourses /></ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute requireAdmin><AdminCourses /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
