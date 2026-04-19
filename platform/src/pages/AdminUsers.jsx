import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, BookOpen, ChevronRight, Trash2, UserPlus, Edit2, X, Check } from 'lucide-react';
import './Admin.css';

const ROLE_LABELS = { admin: '管理员', learner: '学员' };
const DEPT_COLORS = {
  '技术部': '#818cf8', '产品部': '#10b981', '运营部': '#f59e0b',
  '市场部': '#06b6d4', '未分配': '#6b7280'
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, getAllUsers, createUser, updateUser, updateUserRole, deleteUser } = useAuth();

  // Load users asynchronously (getAllUsers is async)
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', name: '', department: '', role: 'learner' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(Array.isArray(users) ? users : []);
    setUsersLoaded(true);
  };

  useEffect(() => {
    fetchUsers();
  }, [getAllUsers]);

  const filtered = allUsers.filter(u =>
    u.name.includes(search) || u.email.includes(search) || (u.department || '').includes(search)
  );

  const handleDelete = (u) => {
    if (u.id === user.id) return;
    setConfirmDelete(u);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    if (!addForm.email || !addForm.email.includes('@')) {
      setAddError('请输入有效的邮箱地址');
      setAddLoading(false);
      return;
    }

    const res = await createUser(
      addForm.email.trim(),
      addForm.name.trim() || undefined,
      addForm.department.trim() || undefined,
      addForm.role
    );

    if (res.error) {
      setAddError(res.error);
      setAddLoading(false);
      return;
    }

    // Success — refresh list and close modal
    await fetchUsers();
    setShowAddModal(false);
    setAddForm({ email: '', name: '', department: '', role: 'learner' });
    setAddLoading(false);
  };

  const handleRoleChange = async (userId, role) => {
    await updateUserRole(userId, role);
    await fetchUsers();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deleteUser(confirmDelete.id);
    await fetchUsers();
    setConfirmDelete(null);
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
          <p className="admin-subtitle">管理授权用户。只有在此添加的邮箱才能通过 Cloudflare SSO 登录。</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-nav-btn" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
            onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> 添加用户
          </button>
          <button className="admin-nav-btn" onClick={() => navigate('/admin/courses')}>
            <BookOpen size={16} /> 课程管理
          </button>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: '8px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '0.85rem', color: '#a5b4fc'
        }}>
          总用户 <strong style={{ marginLeft: '0.5rem', fontSize: '1.1rem', color: '#c7d2fe' }}>{allUsers.length}</strong>
        </div>
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: '8px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          fontSize: '0.85rem', color: '#6ee7b7'
        }}>
          学员 <strong style={{ marginLeft: '0.5rem', fontSize: '1.1rem', color: '#a7f3d0' }}>{allUsers.filter(u => u.role === 'learner').length}</strong>
        </div>
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: '8px',
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
          fontSize: '0.85rem', color: '#fdba74'
        }}>
          管理员 <strong style={{ marginLeft: '0.5rem', fontSize: '1.1rem', color: '#fed7aa' }}>{allUsers.filter(u => u.role === 'admin').length}</strong>
        </div>
      </div>

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
              <th>最后登录</th>
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
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="learner">👤 学员</option>
                    <option value="admin">🔑 管理员</option>
                  </select>
                </td>
                <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('zh-CN') : '从未登录'}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(u)}
                    disabled={u.id === user.id}
                    title={u.id === user.id ? '不能删除自己' : '删除用户（撤销授权）'}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!usersLoaded && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            加载中...
          </div>
        )}
        {usersLoaded && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            没有找到匹配的用户
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-icon"><UserPlus size={32} color="#10b981" /></div>
            <h3>添加授权用户</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1rem' }}>
              添加后，该邮箱即可通过 Cloudflare OTP 登录平台
            </p>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>邮箱 *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={e => { setAddForm(f => ({ ...f, email: e.target.value })); setAddError(''); }}
                  placeholder="user@example.com"
                  required
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f1f5f9',
                    fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>姓名（可选）</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="留空则取邮箱前缀"
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f1f5f9',
                    fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>部门（可选）</label>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={e => setAddForm(f => ({ ...f, department: e.target.value }))}
                    placeholder="例如：技术部"
                    style={{
                      width: '100%', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f1f5f9',
                      fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>角色</label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
                    className="role-select"
                    style={{ width: '100%', padding: '0.6rem 0.75rem' }}
                  >
                    <option value="learner">👤 学员</option>
                    <option value="admin">🔑 管理员</option>
                  </select>
                </div>
              </div>

              {addError && (
                <div style={{
                  padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
                  color: '#fca5a5', fontSize: '0.8rem'
                }}>
                  ⚠️ {addError}
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="modal-cancel" onClick={() => setShowAddModal(false)}>取消</button>
                <button type="submit" className="modal-confirm" disabled={addLoading}
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  {addLoading ? '创建中...' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><Trash2 size={32} color="#ef4444" /></div>
            <h3>确认删除用户？</h3>
            <p>将永久删除用户 <strong style={{ color: '#f1f5f9' }}>{confirmDelete.name}</strong> 的账号和所有学习数据，<strong style={{ color: '#ef4444' }}>该用户将无法再通过 SSO 登录</strong>。此操作不可撤销。</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="modal-confirm confirm-red" onClick={handleDeleteConfirm}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
