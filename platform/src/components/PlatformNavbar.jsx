import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Search, User, Compass } from 'lucide-react';
import './PlatformNavbar.css';

export default function PlatformNavbar() {
  return (
    <nav className="platform-navbar glass-panel">
      <div className="navbar-left">
        <NavLink to="/" className="logo-container">
          <BookOpen className="logo-icon" size={28} />
          <span className="logo-text text-gradient">NexusLearn</span>
        </NavLink>
      </div>
      
      <div className="navbar-center">
        <div className="nav-links">
          <NavLink to="/catalog" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Compass size={18} /> 发现课程
          </NavLink>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="搜索课程..." />
        </div>
        <NavLink to="/dashboard" className="icon-button user-btn">
          <User size={20} />
        </NavLink>
      </div>
    </nav>
  );
}
