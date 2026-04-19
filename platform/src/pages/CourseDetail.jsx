import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Circle, BookOpen, Layers, ShieldAlert } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import './CourseDetail.css';

const CATEGORY_FILTER_MAP = {
  'math-foundations': '数学基础',
  'ai-fundamentals': 'AI 基础与理论',
  'llm-engineering': '大模型与 LLM',
  'ai-agent':        'AI Agent 工程',
  'ai-applications': 'AI 行业应用',
  'ai-platform':     'AI 平台与安全',
  'ai-creative':     'AI 创意与效率',
  'programming':     '编程与开发',
  'infra-devops':    '基础设施与运维',
  'data-engineering': '数据与存储',
  'product-career':  '产品与职业',
};

const CATEGORY_IMAGES = {
  'math-foundations': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  'ai-fundamentals': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
  'llm-engineering': 'https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&w=1200&q=80',
  'ai-agent': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  'ai-applications': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'ai-platform': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'ai-creative': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80',
  'programming': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  'infra-devops': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'data-engineering': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  'product-career': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
};

function getCourseImage(categoryName) {
  const entry = Object.entries(CATEGORY_FILTER_MAP).find(([k, v]) => v === categoryName);
  return CATEGORY_IMAGES[entry ? entry[0] : 'default'];
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { canUserAccessCourse, isAdmin } = useAuth();

  const courseData = courseRegistry[courseId];
  if (!courseData) return <div className="page-container">Course not found.</div>;

  // ACL check: non-admin users without access see a restricted message
  if (!isAdmin && !canUserAccessCourse(courseId)) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <ShieldAlert size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>无权访问此课程</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>该课程尚未对您开放，请联系管理员获取访问权限。</p>
        <button onClick={() => navigate('/catalog')} style={{
          padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
        }}>返回课程目录</button>
      </div>
    );
  }

  const course = courseData.manifest;

  // ── Normalise: support both 'chapters' (old) and 'modules' (new) ──
  const normalizeChapters = () => {
    if (course.chapters?.length) return course.chapters;
    if (course.modules?.length) {
      return course.modules.map(m => ({
        id: m.id,
        title: m.title,
        subtitle: m.description || '',
        lessons: [{ id: m.id, title: m.title }],
      }));
    }
    return [];
  };

  const chapters = normalizeChapters();
  const firstLesson = chapters[0]?.lessons?.[0];



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
          style={{ 
            backgroundImage: `url(${getCourseImage(course.category)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,1) 0%, rgba(15,23,42,0.4) 100%)' }} />
        </div>
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
