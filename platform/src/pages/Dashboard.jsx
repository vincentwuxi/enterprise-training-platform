import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Award, BookOpen } from 'lucide-react';
import { courseRegistry } from '../courses/registry';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Mock data for Dashboard MVP
  const inProgressCourseId = 'calculus-intuition';
  const course = courseRegistry[inProgressCourseId]?.manifest;

  return (
    <div className="dashboard-page page-container">
      <header className="dashboard-header">
         <h1>👋 欢迎回来，学习者</h1>
      </header>
      
      <div className="stats-row">
         <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper"><BookOpen size={24} /></div>
            <div className="stat-info">
               <span className="stat-title">已学习时长</span>
               <span className="stat-value">12.5h</span>
            </div>
         </div>
         <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper match"><TrendingUp size={24} /></div>
            <div className="stat-info">
               <span className="stat-title">连续打卡</span>
               <span className="stat-value">7天 🔥</span>
            </div>
         </div>
         <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper target"><Target size={24} /></div>
            <div className="stat-info">
               <span className="stat-title">已完成课程</span>
               <span className="stat-value">2课</span>
            </div>
         </div>
      </div>
      
      <div className="dashboard-main-content">
         <div className="continue-learning-section">
            <h2>📌 继续学习</h2>
            {course && (
               <div className="continue-card glass-panel" onClick={() => navigate(`/course/${inProgressCourseId}/lesson/derivatives-intro`)}>
                  <div className="continue-info">
                     <h3>{course.title}</h3>
                     <p>当前章节: 第二章 导数的直觉</p>
                     <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: '33%' }}></div>
                     </div>
                  </div>
                  <button className="primary-btn">继续 <span style={{marginLeft: "4px"}}>→</span></button>
               </div>
            )}
            
            <h2 className="mt-8">🏆 最近成就</h2>
            <div className="achievements-grid">
               <div className="achievement-card">
                  <div className="achievement-icon">🎯</div>
                  <h4>极限大师</h4>
                  <p>完成极限章节并全对通过测试</p>
               </div>
               <div className="achievement-card">
                  <div className="achievement-icon">⭐</div>
                  <h4>首次学习</h4>
                  <p>进入第一门课程</p>
               </div>
            </div>
         </div>
         
         <aside className="dashboard-sidebar">
             <div className="trend-box glass-panel">
                 <h3>📈 学习趋势</h3>
                 <div className="trend-chart-mock">
                    <div className="bar" style={{height: "30%"}}></div>
                    <div className="bar" style={{height: "50%"}}></div>
                    <div className="bar" style={{height: "20%"}}></div>
                    <div className="bar" style={{height: "70%"}}></div>
                    <div className="bar" style={{height: "40%"}}></div>
                    <div className="bar" style={{height: "80%"}}></div>
                    <div className="bar" style={{height: "60%"}}></div>
                 </div>
                 <div className="trend-labels">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                 </div>
             </div>
         </aside>
      </div>
    </div>
  );
}
