import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Layers, TrendingUp } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import './Landing.css';

// Category icons mapping
const CATEGORY_ICONS = {
  '数学基础': '📐', 'AI 基础与理论': '🧠', '大模型与 LLM': '🤖',
  'AI Agent 工程': '⚡', 'AI 行业应用': '🏭', 'AI 平台与安全': '🛡️',
  'AI 创意与效率': '🎨', '编程与开发': '💻', '基础设施与运维': '🔧',
  '数据与存储': '🗄️', '产品与职业': '🚀',
};

const CATEGORY_KEYS = {
  '数学基础': 'math-foundations', 'AI 基础与理论': 'ai-fundamentals',
  '大模型与 LLM': 'llm-engineering', 'AI Agent 工程': 'ai-agent',
  'AI 行业应用': 'ai-applications', 'AI 平台与安全': 'ai-platform',
  'AI 创意与效率': 'ai-creative', '编程与开发': 'programming',
  '基础设施与运维': 'infra-devops', '数据与存储': 'data-engineering',
  '产品与职业': 'product-career',
};

export default function Landing() {
  const navigate = useNavigate();

  // Dynamically compute stats from registry
  const { totalCourses, totalModules, categories, featuredCourses } = useMemo(() => {
    const entries = Object.entries(courseRegistry);
    let modules = 0;
    const catMap = {};

    entries.forEach(([, reg]) => {
      const m = reg.manifest;
      const mods = m?.modules || m?.chapters || [];
      modules += mods.length;
      const cat = m?.category || '未分类';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    // Sort categories by course count descending
    const cats = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name, count,
        icon: CATEGORY_ICONS[name] || '📦',
        key: CATEGORY_KEYS[name] || 'all',
      }));

    // Pick 4 featured courses (most modules)
    const featured = entries
      .map(([id, reg]) => ({
        id,
        title: reg.manifest?.title,
        category: reg.manifest?.category,
        modules: (reg.manifest?.modules || reg.manifest?.chapters || []).length,
        gradient: reg.manifest?.cover?.gradient || ['#1e293b', '#0f172a'],
      }))
      .sort((a, b) => b.modules - a.modules)
      .slice(0, 4);

    return {
      totalCourses: entries.length,
      totalModules: modules,
      categories: cats,
      featuredCourses: featured,
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Unlock Your <span className="text-gradient">Potential</span></h1>
          <p className="hero-subtitle">
            沉浸式、交互式的学习体验，帮助你直觉地理解复杂知识。<br />
            涵盖 AI、编程、数学、基础设施等 {categories.length} 大领域。
          </p>
          <div className="hero-actions">
            <button className="primary-btn hero-btn" onClick={() => navigate('/catalog')}>
              探索全部课程 <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{totalCourses}</div>
              <div className="stat-label">精品互动课程</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{totalModules}</div>
              <div className="stat-label">交互式章节</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">知识领域</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="featured-section page-container">
        <h2 className="section-title">🔥 热门课程</h2>
        <div className="featured-grid">
          {featuredCourses.map(course => (
            <div key={course.id} className="featured-card glass-panel"
              onClick={() => navigate(`/course/${course.id}`)}>
              <div className="featured-cover" style={{
                background: `linear-gradient(135deg, ${course.gradient[0]}, ${course.gradient[1]})`
              }}>
                <BookOpen size={32} className="featured-icon" />
              </div>
              <div className="featured-info">
                <span className="featured-category">{course.category}</span>
                <h3>{course.title?.split('：')[0] || course.title}</h3>
                <p className="featured-meta">{course.modules} 章节</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories — dynamically generated */}
      <section className="categories-section page-container">
        <h2 className="section-title">探索知识领域</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.name} className="category-card"
              onClick={() => navigate(`/catalog?category=${cat.key}`)}>
              <div className="category-emoji">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>{cat.count} 门课程</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
