import { useState } from 'react';
import './LessonCommon.css';

const CODE_DARK = `// ━━━━ 暗色模式工程化 ━━━━

// ━━━━ 1. CSS 变量切换（最推荐）━━━━
/* tokens/themes.css */
:root, [data-theme="light"] {
  --color-bg:       #ffffff;
  --color-surface:  #f8fafc;
  --color-text:     #0f172a;
  --color-text-muted: #64748b;
  --color-border:   #e2e8f0;
  --color-primary:  #7c3aed;
  --color-shadow:   0 1px 3px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
  --color-bg:       #0f172a;
  --color-surface:  #1e293b;
  --color-text:     #e2e8f0;
  --color-text-muted: #94a3b8;
  --color-border:   #334155;
  --color-primary:  #a78bfa;
  --color-shadow:   0 1px 3px rgba(0,0,0,0.4);
}

/* 组件代码零修改！直接引用 var(--color-bg) */
.card {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  box-shadow: var(--color-shadow);
}

// ━━━━ 2. React 主题 Hook ━━━━
function useTheme() {
  const [theme, setTheme] = useState(() => {
    // 优先级：用户手动选择 > 系统偏好 > 默认
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 监听系统偏好变化
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return { theme, setTheme, toggle };
}

// ━━━━ 3. SSR 防闪烁（Flash of Wrong Theme）━━━━
// 在 <head> 中注入阻塞脚本（Next.js / Remix）
// <script dangerouslySetInnerHTML={{ __html: \`
//   (function() {
//     var theme = localStorage.getItem('theme') ||
//       (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
//     document.documentElement.setAttribute('data-theme', theme);
//   })();
// \` }} />

// ━━━━ 4. 暗色模式设计规则 ━━━━
// ❌ 不要简单反转颜色（纯黑&纯白伤眼）
// ✅ 背景用深灰（#0f172a）而非纯黑（#000000）
// ✅ 文字用浅灰（#e2e8f0）而非纯白（#ffffff）
// ✅ 阴影加深（暗色模式下阴影更重）
// ✅ 主色提亮（dark 用 --primary-400 而非 --primary-700）
// ✅ 图片降低亮度（filter: brightness(0.85)）`;

export default function LessonDarkMode() {
  const [mode, setMode] = useState('light');
  const isDark = mode === 'dark';

  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 07 · DARK MODE</div>
        <h1>暗色模式工程</h1>
        <p>暗色模式不是"把白色换成黑色"——<strong>它需要完整的 Token 切换体系、系统偏好检测、SSR 防闪烁、过渡动画</strong>。本模块教你做到"加一行 data-theme 切换，组件代码零修改"。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🌗 主题切换演示</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {['light', 'dark'].map(m => (
            <button key={m} className={`ds-btn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
              {m === 'light' ? '☀️ Light' : '🌙 Dark'}
            </button>
          ))}
        </div>
        <div style={{
          background: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: 10, padding: '1.5rem',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', marginBottom: '0.5rem' }}>Card Title</div>
          <div style={{ fontSize: '0.87rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>这是一段描述文字。注意暗色模式下文字不用纯白，背景不用纯黑——这是暗色模式设计的第一原则。</div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button style={{
              padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
              background: isDark ? '#a78bfa' : '#7c3aed', color: 'white',
              fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer',
            }}>Primary</button>
            <button style={{
              padding: '0.4rem 1rem', borderRadius: 6,
              background: 'transparent', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer',
            }}>Secondary</button>
          </div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📝 完整实现代码</div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>dark-mode.tsx</span>
          </div>
          <div className="ds-code">{CODE_DARK}</div>
        </div>
      </div>
    </div>
  );
}
