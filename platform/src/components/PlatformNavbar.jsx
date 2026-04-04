import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Compass, Shield, LogOut, User, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PlatformNavbar.css';

export default function PlatformNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

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
          <NavLink to="/catalog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Compass size={18} /> 发现课程
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active admin-link' : 'nav-link admin-link'}>
              <Shield size={18} /> 管理后台
            </NavLink>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="搜索课程..." />
        </div>

        {user ? (
          <div className="user-menu" ref={dropRef}>
            <button className="user-menu-trigger" onClick={() => setDropdownOpen(o => !o)}>
              <div className="user-avatar-small" style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                  : 'linear-gradient(135deg, #065f46, #059669)'
              }}>
                {user.name.charAt(0)}
              </div>
              <span className="user-name-text">{user.name}</span>
              {isAdmin && <span className="admin-badge">管理员</span>}
              <ChevronDown size={14} className={dropdownOpen ? 'chevron-up' : ''} />
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>
                  <LayoutDashboard size={15} /> 我的学习
                </button>
                {isAdmin && (
                  <button className="dropdown-item admin-item" onClick={() => { navigate('/admin'); setDropdownOpen(false); }}>
                    <Shield size={15} /> 管理后台
                  </button>
                )}
                <div className="dropdown-divider" />
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={15} /> 退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            <User size={16} /> 登录
          </button>
        )}
      </div>
    </nav>
  );
}
