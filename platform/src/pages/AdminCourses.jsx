import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseRegistry } from '../courses/registry';
import {
  BarChart3, Users, BookOpen, TrendingUp, Shield,
  ToggleLeft, ToggleRight, Eye, AlertTriangle, CheckCircle, ChevronRight,
  UserCheck, Search, X, Globe, Lock, Download, Upload, Package, Loader, RefreshCw
} from 'lucide-react';
import './Admin.css';

// ── Stat card ──
function StatCard({ icon, label, value, color = '#818cf8', sub }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <div>
        <p className="admin-stat-value">{value}</p>
        <p className="admin-stat-label">{label}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

// ── Course Access Modal ──
function CourseAccessModal({ courseId, courseName, accessList, allUsers, onSave, onClose }) {
  const learners = allUsers.filter(u => u.role === 'learner');
  const [mode, setMode] = useState(accessList === 'all' ? 'all' : 'specific');
  const [selected, setSelected] = useState(() => {
    if (Array.isArray(accessList)) return new Set(accessList);
    return new Set();
  });
  const [search, setSearch] = useState('');

  const filtered = learners.filter(u =>
    u.name.includes(search) || u.email.includes(search) || (u.department || '').includes(search)
  );

  const toggle = (uid) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(learners.map(u => u.id)));
  const deselectAll = () => setSelected(new Set());

  const handleSave = () => {
    if (mode === 'all') {
      onSave(courseId, null); // null = 'all'
    } else {
      onSave(courseId, Array.from(selected));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box access-modal" onClick={e => e.stopPropagation()}>
        <div className="access-modal-header">
          <div>
            <h3>设置可见范围</h3>
            <p className="access-course-name">{courseName}</p>
          </div>
          <button className="access-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Mode toggle */}
        <div className="access-mode-tabs">
          <button
            className={`access-mode-btn ${mode === 'all' ? 'active' : ''}`}
            onClick={() => setMode('all')}
          >
            <Globe size={14} /> 全部学员可见
          </button>
          <button
            className={`access-mode-btn ${mode === 'specific' ? 'active' : ''}`}
            onClick={() => setMode('specific')}
          >
            <Lock size={14} /> 指定用户可见
          </button>
        </div>

        {mode === 'all' ? (
          <div className="access-all-hint">
            <Globe size={32} color="#10b981" />
            <p>课程上线后，<strong>所有学员</strong>都可以看到和学习这门课程。</p>
          </div>
        ) : (
          <>
            {/* Search + batch actions */}
            <div className="access-toolbar">
              <div className="access-search-wrap">
                <Search size={14} />
                <input
                  type="text" placeholder="搜索用户..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="access-search-input"
                />
              </div>
              <div className="access-batch-btns">
                <button onClick={selectAll} className="access-batch-btn">全选</button>
                <button onClick={deselectAll} className="access-batch-btn">清空</button>
              </div>
            </div>

            {/* User list */}
            <div className="access-user-list">
              {filtered.length > 0 ? filtered.map(u => (
                <label key={u.id} className={`access-user-item ${selected.has(u.id) ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggle(u.id)}
                  />
                  <div className="access-user-avatar" style={{
                    background: 'linear-gradient(135deg, #065f46, #059669)'
                  }}>
                    {u.name.charAt(0)}
                  </div>
                  <div className="access-user-info">
                    <span className="access-user-name">{u.name}</span>
                    <span className="access-user-meta">{u.email} · {u.department || '未分配'}</span>
                  </div>
                </label>
              )) : (
                <div className="access-empty">没有匹配的用户</div>
              )}
            </div>

            <div className="access-selected-count">
              已选择 <strong>{selected.size}</strong> / {learners.length} 人
            </div>
          </>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button
            className="modal-confirm confirm-green"
            onClick={handleSave}
            disabled={mode === 'specific' && selected.size === 0}
          >
            <CheckCircle size={14} /> 保存设置
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Import Course Modal ──
function ImportCourseModal({ onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [overwrite, setOverwrite] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('course', selectedFile);

      const url = overwrite ? '/api/courses/import?overwrite=true' : '/api/courses/import';
      const resp = await fetch(url, { method: 'POST', body: formData });
      const data = await resp.json();

      if (data.success) {
        setResult({ type: 'success', message: data.message, course: data.course, note: data.note });
        onImported?.();
      } else {
        setResult({ type: 'error', message: data.error, existingCourse: data.existingCourse });
      }
    } catch (err) {
      setResult({ type: 'error', message: `Network error: ${err.message}` });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box import-modal" onClick={e => e.stopPropagation()}>
        <div className="access-modal-header">
          <div>
            <h3><Upload size={18} /> 导入课程包</h3>
            <p className="access-course-name">上传 .nexuscourse.zip 文件</p>
          </div>
          <button className="access-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Drag & drop zone */}
        <div
          className={`import-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {selectedFile ? (
            <div className="import-file-info">
              <Package size={32} color="#818cf8" />
              <p className="import-file-name">{selectedFile.name}</p>
              <p className="import-file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="import-placeholder">
              <Upload size={32} color="#64748b" />
              <p>拖拽文件到此处，或点击选择</p>
              <span>支持 .zip / .nexuscourse.zip</span>
            </div>
          )}
        </div>

        {/* Overwrite checkbox */}
        <label className="import-overwrite-label">
          <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} />
          覆盖已有同名课程
        </label>

        {/* Result feedback */}
        {result && (
          <div className={`import-result ${result.type}`}>
            {result.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <div>
              <p>{result.message}</p>
              {result.note && <span className="import-result-note">{result.note}</span>}
              {result.course && (
                <span className="import-result-note">
                  模块数: {result.course.modulesCount} · 目录: {result.course.dirName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>关闭</button>
          <button
            className="modal-confirm confirm-green"
            onClick={handleImport}
            disabled={!selectedFile || importing}
          >
            {importing ? (
              <><Loader size={14} className="spin-icon" /> 导入中...</>
            ) : (
              <><Upload size={14} /> 开始导入</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminCourses ──
export default function AdminCourses() {
  const navigate = useNavigate();
  const {
    user, courseStatus, setCourseOnline, isCourseOnline,
    getAllUsers, getCourseAccessList, setCourseAccessControl
  } = useAuth();

  const allUsers = getAllUsers();
  const learners = allUsers.filter(u => u.role === 'learner');
  const totalCourses = Object.keys(courseRegistry).length;
  const onlineCount = Object.keys(courseRegistry).filter(id => isCourseOnline(id)).length;

  const [confirmToggle, setConfirmToggle] = useState(null); // { courseId, toOnline }
  const [accessModal, setAccessModal] = useState(null);     // { courseId, courseName }
  const [importModal, setImportModal] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'online' | 'offline'

  const courses = Object.entries(courseRegistry).map(([id, reg]) => ({
    id,
    manifest: reg.manifest,
    online: isCourseOnline(id),
    accessList: getCourseAccessList(id),
  })).filter(c => {
    if (filter === 'online') return c.online;
    if (filter === 'offline') return !c.online;
    return true;
  });

  const handleToggle = (courseId, currentOnline) => {
    setConfirmToggle({ courseId, toOnline: !currentOnline });
  };

  const confirmAction = () => {
    if (confirmToggle) {
      setCourseOnline(confirmToggle.courseId, confirmToggle.toOnline);
      setConfirmToggle(null);
    }
  };

  const handleSaveAccess = (courseId, userIds) => {
    setCourseAccessControl(courseId, userIds);
  };

  const handleExport = async (courseId) => {
    setExportingId(courseId);
    try {
      const resp = await fetch(`/api/courses/${courseId}/export`);
      if (!resp.ok) {
        const data = await resp.json();
        alert(`导出失败: ${data.error || resp.statusText}`);
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = resp.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+)"/);
      a.download = match?.[1] || `${courseId}.nexuscourse.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`导出失败: ${err.message}`);
    } finally {
      setExportingId(null);
    }
  };

  // Count restricted courses
  const restrictedCount = Object.keys(courseRegistry).filter(id => {
    const acl = getCourseAccessList(id);
    return Array.isArray(acl);
  }).length;

  return (
    <div className="admin-page page-container">
      {/* Header */}
      <header className="admin-header">
        <div>
          <div className="admin-breadcrumb">
            <Shield size={14} /> 管理员控制台
            <ChevronRight size={12} />
            <span>课程管理</span>
          </div>
          <h1>课程上线管理</h1>
          <p className="admin-subtitle">控制哪些课程对学员可见，并可指定课程仅对特定用户开放。</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-action-btn import-btn" onClick={() => setImportModal(true)}>
            <Upload size={16} /> 导入课程
          </button>
          <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>
            <Users size={16} /> 用户管理
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="admin-stats-row">
        <StatCard icon={<BookOpen size={20} />} label="课程总数" value={totalCourses} color="#818cf8" />
        <StatCard icon={<CheckCircle size={20} />} label="已上线" value={onlineCount} color="#10b981" sub={`${totalCourses - onlineCount} 门已下线`} />
        <StatCard icon={<Lock size={20} />} label="指定用户" value={restrictedCount} color="#f59e0b" sub={`${totalCourses - restrictedCount} 门全员可见`} />
        <StatCard icon={<Users size={20} />} label="学员总数" value={learners.length} color="#06b6d4" />
      </div>

      {/* Filter tabs */}
      <div className="admin-filter-tabs">
        {[
          { key: 'all', label: `全部 (${totalCourses})` },
          { key: 'online', label: `已上线 (${onlineCount})` },
          { key: 'offline', label: `已下线 (${totalCourses - onlineCount})` },
        ].map(f => (
          <button key={f.key} className={`admin-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Course table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>状态</th>
              <th>课程名称</th>
              <th>分类</th>
              <th>可见范围</th>
              <th>章节数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(({ id, manifest, online, accessList }) => (
              <tr key={id} className={!online ? 'row-offline' : ''}>
                <td>
                  <span className={`status-badge ${online ? 'online' : 'offline'}`}>
                    {online ? '● 上线' : '○ 下线'}
                  </span>
                </td>
                <td>
                  <div className="course-name-cell">
                    <strong>{manifest?.title || id}</strong>
                    <span className="course-id-tag">{id}</span>
                  </div>
                </td>
                <td><span className="category-tag-sm">{manifest?.category || '—'}</span></td>
                <td>
                  {accessList === 'all' ? (
                    <span className="access-badge access-all">
                      <Globe size={12} /> 全部学员
                    </span>
                  ) : (
                    <span className="access-badge access-restricted">
                      <Lock size={12} /> {accessList.length} 人可见
                    </span>
                  )}
                </td>
                <td>{manifest?.modules?.length ?? '—'} 章</td>
                <td>
                  <div className="action-btns">
                    <button className="preview-btn" onClick={() => navigate(`/course/${id}`)}>
                      <Eye size={14} /> 预览
                    </button>
                    <button
                      className="export-btn"
                      onClick={() => handleExport(id)}
                      disabled={exportingId === id}
                      title="导出课程包"
                    >
                      {exportingId === id
                        ? <><Loader size={14} className="spin-icon" /></>
                        : <><Download size={14} /> 导出</>
                      }
                    </button>
                    <button
                      className="access-assign-btn"
                      onClick={() => setAccessModal({ courseId: id, courseName: manifest?.title || id })}
                      title="设置可见范围"
                    >
                      <UserCheck size={14} /> 权限
                    </button>
                    <button
                      className={`toggle-btn ${online ? 'toggle-off' : 'toggle-on'}`}
                      onClick={() => handleToggle(id, online)}>
                      {online
                        ? <><ToggleRight size={16} /> 下线</>
                        : <><ToggleLeft size={16} /> 上线</>
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm toggle modal */}
      {confirmToggle && (
        <div className="modal-overlay" onClick={() => setConfirmToggle(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              {confirmToggle.toOnline ? <CheckCircle size={32} color="#10b981" /> : <AlertTriangle size={32} color="#f59e0b" />}
            </div>
            <h3>{confirmToggle.toOnline ? '确认上线课程？' : '确认下线课程？'}</h3>
            <p>
              {confirmToggle.toOnline
                ? '上线后，所有学员将能在课程目录中看到该课程。'
                : '下线后，该课程将从学员目录中隐藏。已报名学员仍可继续学习。'}
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmToggle(null)}>取消</button>
              <button className={`modal-confirm ${confirmToggle.toOnline ? 'confirm-green' : 'confirm-amber'}`}
                onClick={confirmAction}>
                确认{confirmToggle.toOnline ? '上线' : '下线'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course access modal */}
      {accessModal && (
        <CourseAccessModal
          courseId={accessModal.courseId}
          courseName={accessModal.courseName}
          accessList={getCourseAccessList(accessModal.courseId)}
          allUsers={allUsers}
          onSave={handleSaveAccess}
          onClose={() => setAccessModal(null)}
        />
      )}

      {/* Import course modal */}
      {importModal && (
        <ImportCourseModal
          onClose={() => setImportModal(false)}
          onImported={() => {
            // In dev mode, Vite HMR handles reload.
            // In production, page reload picks up the new build.
          }}
        />
      )}
    </div>
  );
}
