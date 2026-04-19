import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Infinity, EyeOff, Search, X } from 'lucide-react';
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

const CATEGORY_IMAGES = {
  'math-foundations': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
  'ai-fundamentals': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
  'llm-engineering': 'https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&w=800&q=80',
  'ai-agent': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
  'ai-applications': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  'ai-platform': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  'ai-creative': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
  'programming': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
  'infra-devops': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'data-engineering': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'product-career': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
};

function getCourseImage(categoryName) {
  const entry = Object.entries(CATEGORY_FILTER_MAP).find(([k, v]) => v === categoryName);
  return CATEGORY_IMAGES[entry ? entry[0] : 'default'];
}

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const { canUserAccessCourse, isCourseOnline, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const courses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return Object.keys(courseRegistry).map(key => ({
      id: key,
      ...courseRegistry[key].manifest,
      online: isCourseOnline(key),
    })).filter(course => {
      // ACL-aware: admins see all, learners only see courses they can access
      if (!isAdmin && !canUserAccessCourse(course.id)) return false;

      // Category filter
      if (activeCategory !== 'all') {
        const targetCategory = CATEGORY_FILTER_MAP[activeCategory];
        if (!targetCategory || course.category !== targetCategory) return false;
      }

      // Search filter — match title, description, category, or course id
      if (query) {
        const searchTarget = [
          course.title, course.description, course.category, course.id
        ].filter(Boolean).join(' ').toLowerCase();
        return searchTarget.includes(query);
      }

      return true;
    });
  }, [searchQuery, activeCategory, isAdmin, canUserAccessCourse, isCourseOnline]);

  const totalInCategory = useMemo(() => {
    if (activeCategory === 'all') return Object.keys(courseRegistry).length;
    const targetCategory = CATEGORY_FILTER_MAP[activeCategory];
    return Object.values(courseRegistry).filter(r => r.manifest?.category === targetCategory).length;
  }, [activeCategory]);

  return (
    <div className="catalog-page page-container">
      <header className="catalog-header">
        <div className="catalog-title-row">
          <h1>探索课程</h1>
          <span className="catalog-count">{courses.length} 门课程</span>
        </div>

        {/* Search box */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            id="catalog-search"
            type="text"
            className="search-input"
            placeholder="搜索课程名称、描述、分类..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

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
              <div className="course-cover" style={{ 
                backgroundImage: `url(${getCourseImage(course.category)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 100%)' }} />
              </div>
              <div className="course-content">
                <span className="course-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-meta">
                  <span>📖 {(course.chapters || course.modules || []).length}章</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            {searchQuery
              ? <p>未找到包含 "<strong>{searchQuery}</strong>" 的课程</p>
              : <p>该分类下暂无课程</p>
            }
          </div>
        )}
      </div>
    </div>
  );
}
