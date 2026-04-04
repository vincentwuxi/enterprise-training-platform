import React from 'react';
import { Target, Activity, DivideSquare, Sparkles } from 'lucide-react';
import './Sidebar.css';

const chapters = [
  {
    id: 'limits',
    title: '第一章：极限',
    subtitle: '无穷逼近的艺术',
    icon: Target,
  },
  {
    id: 'derivatives',
    title: '第二章：导数',
    subtitle: '捕捉瞬间的变化率',
    icon: Activity,
  },
  {
    id: 'integrals',
    title: '第三章：积分',
    subtitle: '化零为整的魔法',
    icon: DivideSquare,
  }
];

export default function Sidebar({ activeChapter, onChapterSelect }) {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-section">
        <h3 className="section-title">课程目录</h3>
        <nav className="nav-menu">
          {chapters.map((chapter) => (
            <div 
              key={chapter.id} 
              className={`nav-item ${activeChapter === chapter.id ? 'active' : ''}`}
              onClick={() => onChapterSelect(chapter.id)}
            >
              <chapter.icon className="icon" />
              <div className="nav-item-content">
                <span className="nav-item-title">{chapter.title}</span>
                <span className="nav-item-subtitle">{chapter.subtitle}</span>
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="sidebar-section" style={{marginTop: 'auto'}}>
        <div className="nav-item" style={{ background: 'var(--gradient-glow)', color: 'white' }}>
          <Sparkles className="icon" />
          <div className="nav-item-content">
            <span className="nav-item-title">解锁全部互动沙盒</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
