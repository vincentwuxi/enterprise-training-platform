import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Infinity, EyeOff } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';

const CATEGORIES = [
  { key: 'all',             label: '全部',           icon: '📚' },
  { key: 'math-foundations', label: '数学基础',       icon: '📐' },
  { key: 'ai-fundamentals', label: 'AI 基础与理论',  icon: '🧠' },
  { key: 'llm-engineering', label: '大模型与 LLM',   icon: '🤖' },
  { key: 'ai-agent',        label: 'AI Agent 工程',  icon: '⚡' },
  { key: 'ai-applications', label: 'AI 行业应用',    icon: '🏭' },
  { key: 'ai-platform',     label: 'AI 平台与安全',  icon: '🛡️' },
  { key: 'ai-creative',     label: 'AI 创意与效率',  icon: '🎨' },
  { key: 'programming',     label: '编程与开发',     icon: '💻' },
  { key: 'infra-devops',    label: '基础设施与运维', icon: '🔧' },
  { key: 'data-engineering', label: '数据与存储',    icon: '🗄️' },
  { key: 'product-career',  label: '产品与职业',     icon: '🚀' },
];

// Map filter key -> manifest category value
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

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const { isCourseOnline, isAdmin } = useAuth();

  const courses = Object.keys(courseRegistry).map(key => ({
    id: key,
    ...courseRegistry[key].manifest,
    online: isCourseOnline(key),
  })).filter(course => {
    // Learners only see online courses; admins see all (with offline badge)
    if (!isAdmin && !course.online) return false;
    if (activeCategory === 'all') return true;
    const targetCategory = CATEGORY_FILTER_MAP[activeCategory];
    return targetCategory && course.category === targetCategory;
  });

  return (
    <div className="catalog-page page-container">
      <header className="catalog-header">
        <h1>探索课程</h1>
        <div className="filter-tabs">
          {CATEGORIES.map(f => (
            <button key={f.key}
              className={`filter-tab ${activeCategory === f.key ? 'active' : ''}`}
              onClick={() => navigate(f.key === 'all' ? '/catalog' : `/catalog?category=${f.key}`)}>
              <span className="filter-icon">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map(course => (
            <div key={course.id} className={`course-card glass-panel ${!course.online ? 'course-offline' : ''}`}
              onClick={() => navigate(`/course/${course.id}`)}>
              {isAdmin && !course.online && (
                <div className="offline-indicator"><EyeOff size={12} /> 已下线</div>
              )}
              <div className="course-cover" style={{ background: `linear-gradient(135deg, ${course.cover?.gradient?.[0] || '#1e293b'}, ${course.cover?.gradient?.[1] || '#0f172a'})` }}>
                <Infinity size={48} className="course-cover-icon" />
              </div>
              <div className="course-content">
                <span className="course-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-meta">
                  <span>⏱️ {course.estimatedHours || course.totalHours}h</span>
                  <span>📖 {(course.chapters || course.modules || []).length}章</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state"><p>该分类下暂无课程</p></div>
        )}
      </div>
    </div>
  );
}
