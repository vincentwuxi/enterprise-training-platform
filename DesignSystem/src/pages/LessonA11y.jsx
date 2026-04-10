import { useState } from 'react';
import './LessonCommon.css';

const CODE_A11Y = `// ━━━━ 无障碍工程（WCAG 2.2 实战）━━━━

// ━━━━ 1. ARIA 角色与属性 ━━━━
// 原则：能用语义化 HTML → 不用 ARIA
// <button> 优于 <div role="button">

// Dialog 组件的完整 ARIA 实现
function Dialog({ isOpen, onClose, title, children }) {
  return isOpen ? (
    <>
      {/* 背景遮罩 */}
      <div
        className="overlay"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* 对话框 */}
      <div
        role="dialog"
        aria-modal="true"                    // 模态：阻止与背景交互
        aria-labelledby="dialog-title"       // 标题关联
        aria-describedby="dialog-description" // 描述关联
      >
        <h2 id="dialog-title">{title}</h2>
        <div id="dialog-description">{children}</div>
        <button onClick={onClose} aria-label="关闭对话框">✕</button>
      </div>
    </>
  ) : null;
}

// ━━━━ 2. 焦点管理（Focus Management）━━━━
import { useEffect, useRef } from 'react';

function useFocusTrap(isActive) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // 打开时聚焦第一个可交互元素
    first?.focus();

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab：从第一个到最后一个
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        // Tab：从最后一个到第一个
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

// ━━━━ 3. Live Region（动态内容播报）━━━━
// 表单提交成功后，屏幕阅读器播报结果
<div role="status" aria-live="polite">
  {submitStatus === 'success' && '✅ 保存成功！'}
  {submitStatus === 'error' && '❌ 保存失败，请重试'}
</div>

// aria-live="polite" → 等当前内容读完再播报
// aria-live="assertive" → 立即中断并播报（仅紧急情况）

// ━━━━ 4. 颜色对比度检查 ━━━━
// WCAG AA 标准：
// - 正常文本：对比度 >= 4.5:1
// - 大文本（18px+）：对比度 >= 3:1
// - UI 组件/图标：对比度 >= 3:1

// 工具：axe DevTools, Lighthouse, Storybook a11y addon`;

export default function LessonA11y() {
  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 06 · ACCESSIBILITY</div>
        <h1>无障碍工程</h1>
        <p>全球 16% 的人口有某种形式的残障。无障碍不是"额外功能"——<strong>它是 WCAG 2.2 标准的法律要求</strong>。好消息是，大部分无障碍问题只需正确使用语义化 HTML + ARIA + 焦点管理就能解决。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">♿ 无障碍核心代码</div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>a11y.tsx</span>
          </div>
          <div className="ds-code">{CODE_A11Y}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📋 WCAG 2.2 四大原则</div>
        <div className="ds-grid-2">
          {[
            { name: 'Perceivable（可感知）', items: ['图片必须有 alt 文本', '视频提供字幕', '颜色对比度 >= 4.5:1（AA）', '不依赖颜色传达信息'], color: '#7c3aed' },
            { name: 'Operable（可操作）', items: ['所有功能可用键盘完成', 'Focus 样式可见', '足够的操作时间', '不使用闪烁内容'], color: '#ec4899' },
            { name: 'Understandable（可理解）', items: ['表单错误指明位置和原因', '一致的导航', 'lang 属性正确设置', '避免意外的上下文变化'], color: '#38bdf8' },
            { name: 'Robust（健壮性）', items: ['语义化 HTML 优先', 'ARIA 正确使用', '兼容辅助技术', '通过 axe/Lighthouse 检查'], color: '#22c55e' },
          ].map((p, i) => (
            <div key={i} className="ds-card" style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 700, color: p.color, fontSize: '0.87rem', marginBottom: '0.6rem' }}>{p.name}</div>
              {p.items.map((item, j) => (
                <div key={j} style={{ fontSize: '0.82rem', color: 'var(--ds-muted)', marginBottom: '0.25rem' }}>→ {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
