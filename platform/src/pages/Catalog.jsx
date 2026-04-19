import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeOff, Search, X, BookOpen, Clock, ChevronRight, Sparkles, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';

const CATEGORIES = [
  { key: 'all',             label: '全部',           icon: '📚', color: '#6366f1' },
  { key: 'math-foundations', label: '数学基础',       icon: '📐', color: '#3b82f6' },
  { key: 'ai-fundamentals', label: 'AI 基础与理论',  icon: '🧠', color: '#8b5cf6' },
  { key: 'llm-engineering', label: '大模型与 LLM',   icon: '🤖', color: '#a855f7' },
  { key: 'ai-agent',        label: 'AI Agent 工程',  icon: '⚡', color: '#f59e0b' },
  { key: 'ai-applications', label: 'AI 行业应用',    icon: '🏭', color: '#06b6d4' },
  { key: 'ai-platform',     label: 'AI 平台与安全',  icon: '🛡️', color: '#10b981' },
  { key: 'ai-creative',     label: 'AI 创意与效率',  icon: '🎨', color: '#ec4899' },
  { key: 'programming',     label: '编程与开发',     icon: '💻', color: '#14b8a6' },
  { key: 'infra-devops',    label: '基础设施与运维', icon: '🔧', color: '#f97316' },
  { key: 'data-engineering', label: '数据与存储',    icon: '🗄️', color: '#6366f1' },
  { key: 'product-career',  label: '产品与职业',     icon: '🚀', color: '#e11d48' },
];

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

function getCategoryColor(categoryName) {
  const entry = Object.entries(CATEGORY_FILTER_MAP).find(([k, v]) => v === categoryName);
  const cat = CATEGORIES.find(c => c.key === (entry ? entry[0] : 'all'));
  return cat?.color || '#6366f1';
}

/* Animated counter hook */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const { user, canUserAccessCourse, isCourseOnline, isAdmin, getUserProgress } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const courseSectionRef = useRef(null);

  // Stats
  const totalCourses = Object.keys(courseRegistry).length;
  const progress = getUserProgress?.() || {};
  const coursesStarted = Object.keys(progress).length;
  const totalModules = Object.values(courseRegistry).reduce((sum, r) => {
    return sum + (r.manifest?.modules || r.manifest?.chapters || []).length;
  }, 0);

  const animatedCourses = useCounter(totalCourses);
  const animatedModules = useCounter(totalModules);

  const courses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return Object.keys(courseRegistry).map(key => ({
      id: key,
      ...courseRegistry[key].manifest,
      online: isCourseOnline(key),
    })).filter(course => {
      if (!isAdmin && !canUserAccessCourse(course.id)) return false;
      if (activeCategory !== 'all') {
        const targetCategory = CATEGORY_FILTER_MAP[activeCategory];
        if (!targetCategory || course.category !== targetCategory) return false;
      }
      if (query) {
        const searchTarget = [course.title, course.description, course.category, course.id].filter(Boolean).join(' ').toLowerCase();
        return searchTarget.includes(query);
      }
      return true;
    });
  }, [searchQuery, activeCategory, isAdmin, canUserAccessCourse, isCourseOnline]);

  // Category stats for category cards
  const categoryStats = useMemo(() => {
    const stats = {};
    Object.values(courseRegistry).forEach(r => {
      const cat = r.manifest?.category || '未分类';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return stats;
  }, []);

  const scrollToCourses = () => {
    courseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showHero = activeCategory === 'all' && !searchQuery;

  return (
    <div className="catalog-page">
      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      {showHero && (
        <section className="hero-section">
          <div className="hero-bg-effects">
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
            <div className="hero-grid-overlay" />
          </div>

          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>AI 时代的企业学习平台</span>
            </div>

            <h1 className="hero-title">
              在 <span className="hero-highlight">AivoloLearn</span> 上
              <br />掌握 AI 前沿技能
            </h1>

            <p className="hero-subtitle">
              从数学基础到大模型开发，从 Agent 工程到行业应用 —— 系统化的 AI 学习路径，助你成为新时代的技术领先者
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{animatedCourses}</span>
                <span className="hero-stat-label">精品课程</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">{animatedModules}</span>
                <span className="hero-stat-label">课程模块</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">11</span>
                <span className="hero-stat-label">知识领域</span>
              </div>
            </div>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={scrollToCourses}>
                <BookOpen size={18} />
                浏览全部课程
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate('/dashboard')}>
                <TrendingUp size={18} />
                我的学习
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          CATEGORY BROWSER (only on "all")
          ═══════════════════════════════════════ */}
      {showHero && (
        <section className="category-browser">
          <div className="section-header">
            <h2>探索知识领域</h2>
            <p>选择你感兴趣的方向，开始学习之旅</p>
          </div>
          <div className="category-grid">
            {CATEGORIES.filter(c => c.key !== 'all').map(cat => {
              const courseCount = categoryStats[CATEGORY_FILTER_MAP[cat.key]] || 0;
              return (
                <button
                  key={cat.key}
                  className="category-card"
                  onClick={() => navigate(`/catalog?category=${cat.key}`)}
                  style={{ '--cat-color': cat.color }}
                >
                  <div className="category-card-glow" />
                  <span className="category-card-icon">{cat.icon}</span>
                  <span className="category-card-label">{cat.label}</span>
                  <span className="category-card-count">{courseCount} 门课程</span>
                  <ChevronRight size={16} className="category-card-arrow" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          COURSE LISTING SECTION
          ═══════════════════════════════════════ */}
      <section className="courses-section page-container" ref={courseSectionRef}>
        <header className="catalog-header">
          <div className="catalog-title-row">
            <div className="catalog-title-group">
              {activeCategory !== 'all' && (
                <button className="back-to-all" onClick={() => navigate('/catalog')}>
                  ← 全部
                </button>
              )}
              <h1>
                {activeCategory === 'all' ? '全部课程' : CATEGORIES.find(c => c.key === activeCategory)?.label}
              </h1>
              <span className="catalog-count">{courses.length} 门课程</span>
            </div>
          </div>

          {/* Search */}
          <div className={`search-box ${searchFocused ? 'focused' : ''}`} ref={searchRef}>
            <Search size={18} className="search-icon" />
            <input
              id="catalog-search"
              type="text"
              className="search-input"
              placeholder="搜索课程名称、描述、分类..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="filter-tabs">
            {CATEGORIES.map(f => (
              <button key={f.key}
                className={`filter-tab ${activeCategory === f.key ? 'active' : ''}`}
                onClick={() => navigate(f.key === 'all' ? '/catalog' : `/catalog?category=${f.key}`)}
                style={activeCategory === f.key ? { '--tab-color': f.color } : {}}
              >
                <span className="filter-icon">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </header>

        {/* Course Grid */}
        <div className="course-grid">
          {courses.length > 0 ? (
            courses.map((course, idx) => {
              const moduleCount = (course.chapters || course.modules || []).length;
              const color = getCategoryColor(course.category);
              return (
                <div key={course.id}
                  className={`course-card ${!course.online ? 'course-offline' : ''}`}
                  onClick={() => navigate(`/course/${course.id}`)}
                  style={{ '--card-accent': color, animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  {isAdmin && !course.online && (
                    <div className="offline-indicator"><EyeOff size={12} /> 已下线</div>
                  )}
                  <div className="course-cover" style={{
                    backgroundImage: `url(${getCourseImage(course.category)})`,
                  }}>
                    <div className="course-cover-overlay" />
                    <div className="course-cover-badge" style={{ background: color }}>
                      {course.category}
                    </div>
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-desc">{course.description}</p>
                    <div className="course-footer">
                      <div className="course-meta">
                        <span className="course-meta-item">
                          <BookOpen size={14} />
                          {moduleCount} 章节
                        </span>
                      </div>
                      <span className="course-enter">
                        进入 <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              {searchQuery
                ? <p>未找到包含 "<strong>{searchQuery}</strong>" 的课程</p>
                : <p>该分类下暂无课程</p>
              }
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
