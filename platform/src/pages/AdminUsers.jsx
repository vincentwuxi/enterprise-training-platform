import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, BookOpen, ChevronRight, Trash2, Crown, UserCheck } from 'lucide-react';
import './Admin.css';

const ROLE_LABELS = { admin: '管理员', learner: '学员' };
const DEPT_COLORS = {
  '技术部': '#818cf8', '产品部': '#10b981', '运营部': '#f59e0b',
  '市场部': '#06b6d4', '未分配': '#6b7280'
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, getAllUsers, updateUserRole, deleteUser } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  const allUsers = getAllUsers();
  const filtered = allUsers.filter(u =>
    u.name.includes(search) || u.email.includes(search) || (u.department || '').includes(search)
  );

  const handleDelete = (u) => {
    if (u.id === user.id) return;
    setConfirmDelete(u);
  };

  return (
    <div className="admin-page page-container">
      <header className="admin-header">
        <div>
          <div className="admin-breadcrumb">
            <Shield size={14} /> 管理员控制台
            <ChevronRight size={12} />
            <span>用户管理</span>
          </div>
          <h1>用户管理</h1>
          <p className="admin-subtitle">管理平台学员账号，分配角色和权限。</p>
        </div>
        <button className="admin-nav-btn" onClick={() => navigate('/admin/courses')}>
          <BookOpen size={16} /> 课程管理
        </button>
      </header>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="搜索用户姓名、邮箱或部门..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>邮箱</th>
              <th>部门</th>
              <th>角色</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={u.id === user.id ? 'row-current-user' : ''}>
                <td>
                  <div className="user-avatar-cell">
                    <div className="user-avatar" style={{
                      background: u.role === 'admin'
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : 'linear-gradient(135deg, #065f46, #059669)'
                    }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#f1f5f9', margin: 0, fontSize: '0.9rem' }}>{u.name}</p>
                      {u.id === user.id && <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>（当前账号）</span>}
                    </div>
                  </div>
                </td>
                <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{u.email}</td>
                <td>
                  <span style={{
                    fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                    background: `${DEPT_COLORS[u.department] || '#6b7280'}20`,
                    color: DEPT_COLORS[u.department] || '#6b7280'
                  }}>{u.department || '未分配'}</span>
                </td>
                <td>
                  <select
                    className="role-select"
                    value={u.role}
                    disabled={u.id === user.id}
                    onChange={e => updateUserRole(u.id, e.target.value)}
                  >
                    <option value="learner">👤 学员</option>
                    <option value="admin">🔑 管理员</option>
                  </select>
                </td>
                <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(u)}
                    disabled={u.id === user.id}
                    title={u.id === user.id ? '不能删除自己' : '删除用户'}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            没有找到匹配的用户
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><Trash2 size={32} color="#ef4444" /></div>
            <h3>确认删除用户？</h3>
            <p>将永久删除用户 <strong style={{ color: '#f1f5f9' }}>{confirmDelete.name}</strong> 的账号和所有学习数据，此操作不可撤销。</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="modal-confirm confirm-red" onClick={() => {
                deleteUser(confirmDelete.id);
                setConfirmDelete(null);
              }}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
