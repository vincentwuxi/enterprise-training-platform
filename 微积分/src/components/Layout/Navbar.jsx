import React from 'react';
import { BookOpen, Infinity, Code2, Moon, Sun } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-left">
        <div className="logo-container">
          <Infinity className="logo-icon" size={28} />
          <span className="logo-text text-gradient">微积分直觉</span>
        </div>
      </div>
      <div className="navbar-center">
        <div className="course-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '66%' }}></div>
          </div>
          <span className="progress-text">微积分课程 - 学习中</span>
        </div>
      </div>
      <div className="navbar-right">
        <button className="icon-button" title="Toggle Theme">
          <Moon size={20} />
        </button>
      </div>
    </nav>
  );
}
