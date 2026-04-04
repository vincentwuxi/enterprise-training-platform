import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, Code2, Briefcase, Palette, Languages } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Unlock Your <span className="text-gradient">Potential</span></h1>
          <p className="hero-subtitle">
            沉浸式、交互式的学习体验，帮助你直觉地理解复杂知识。
          </p>
          <div className="hero-actions">
            <button className="primary-btn hero-btn" onClick={() => navigate('/catalog')}>
              探索全部课程 <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">1+</div>
              <div className="stat-label">精品互动课程</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">好评率</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section page-container">
        <h2 className="section-title">探索知识领域</h2>
        <div className="categories-grid">
          <div className="category-card math" onClick={() => navigate('/catalog?category=math')}>
            <Calculator className="category-icon" />
            <h3>数学与逻辑</h3>
            <p>1 门课程</p>
          </div>
          <div className="category-card code" onClick={() => navigate('/catalog?category=code')}>
            <Code2 className="category-icon" />
            <h3>编程与技术</h3>
            <p>敬请期待</p>
          </div>
          <div className="category-card mgmt" onClick={() => navigate('/catalog?category=mgmt')}>
            <Briefcase className="category-icon" />
            <h3>管理与商业</h3>
            <p>敬请期待</p>
          </div>
          <div className="category-card design" onClick={() => navigate('/catalog?category=design')}>
            <Palette className="category-icon" />
            <h3>设计与创意</h3>
            <p>敬请期待</p>
          </div>
          <div className="category-card lang" onClick={() => navigate('/catalog?category=lang')}>
            <Languages className="category-icon" />
            <h3>语言与沟通</h3>
            <p>敬请期待</p>
          </div>
        </div>
      </section>
    </div>
  );
}
