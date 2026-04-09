import { useState } from 'react';
import './LessonCommon.css';

const UX_PRINCIPLES = [
  {
    key: 'uncertainty', icon: '🌫️', title: '处理不确定性',
    problem: 'LLM 输出是概率性的，用户无法预测结果。不确定性引发焦虑。',
    solutions: [
      '显示置信度或"AI 可能出错"提示',
      '提供"重新生成"和"优化"按钮，让用户感到可控',
      '在高风险操作前明确提示"请检查结果"',
      '对事实性内容提供引用/来源',
    ],
    example: `// ✅ 好的设计：显示 AI 置信程度
<AIResponse
  content={response}
  confidence={confidence}  // 高/中/低
  showRegenerateBtn={true}
  disclaimer="AI 生成内容，请核实重要信息"
/>

// ❌ 坏的设计：直接展示 AI 结果无任何提示
<div>{aiResponse}</div>`,
    real: 'Perplexity 每个答案强制附引用链接，Bing Chat 显示信息来源',
  },
  {
    key: 'latency', icon: '⏱️', title: '延迟与等待体验',
    problem: 'LLM 推理慢（P50 约 2-5 秒，复杂任务更长），用户会认为产品卡顿或出错。',
    solutions: [
      '流式输出（Streaming）：字符逐个出现，感知延迟降低 70%',
      '骨架屏 / 加载提示：显示"AI 正在思考..."的动态效果',
      '展示思考过程（Chain of Thought UI）',
      '并行处理：拆分任务并行执行，总体更快',
    ],
    example: `// ✅ 流式输出实现
async function streamResponse(prompt) {
  const stream = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    stream: true,  // 关键参数
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    // 每个 chunk 立即更新 UI
    setDisplayText(prev => prev + content);
  }
}

// 用户感知：立即看到内容开始出现 → 不感觉卡顿`,
    real: 'ChatGPT 流式输出、Claude 显示"Thinking..."过程、Cursor 显示代码生成步骤',
  },
  {
    key: 'error', icon: '❌', title: '错误与失败处理',
    problem: 'AI 会生成错误内容、拒绝回答、或发生 API 错误。处理不好严重影响信任。',
    solutions: [
      '区分"AI 错误"和"系统错误"，给用户不同引导',
      '提供"这个回答有问题"反馈按钮，收集 Bad Case',
      'API 超时时自动重试（最多 3 次），并显示进度',
      '内容过滤被拒绝时，给出具体原因和替代建议',
    ],
    example: `// ✅ 分层错误处理策略
const handleAIError = (error) => {
  if (error.code === 'content_policy_violation') {
    showMessage("该内容不符合使用规范，请修改后重试", 
                {type: 'guidance', link: '/help/content-policy'});
  } else if (error.code === 'rate_limit') {
    showMessage("请求频率过高，60秒后重试", 
                {type: 'warning', countdown: 60});
  } else if (error.code === 'timeout') {
    autoRetry(3);  // 自动重试3次
  } else {
    showMessage("出现未知错误", {type: 'error', showSupport: true});
  }
};`,
    real: 'ChatGPT 的"This content may violate our usage policies"提示、Claude 的"I cannot help with that"解释',
  },
  {
    key: 'trust', icon: '🤝', title: '建立用户信任',
    problem: '新用户对 AI 不信任（怕出错），老用户过度信任（盲目采纳）。两个极端都是危险。',
    solutions: [
      '渐进式揭示 AI 能力：先展示简单任务，再引导复杂任务',
      '人工审查关卡（HITL）：高风险操作需要用户确认',
      '展示"AI 是怎么想的"：可解释性增加信任',
      '错误覆盘透明度：出错后解释原因，不掩盖',
    ],
    example: `// ✅ 高风险操作强制确认
function DeleteWithAI({ aiSuggestion }) {
  return (
    <ConfirmDialog
      title="AI 建议删除以下内容"
      preview={aiSuggestion.itemsToDelete}
      warning="此操作不可撤销，请仔细检查"
      onConfirm={executeDelete}
      onCancel={rejectAISuggestion}
      // 额外：显示 AI 的判断依据
      aiReason={aiSuggestion.reasoning}
    />
  );
}`,
    real: 'Cursor 在执行危险命令前（如删除文件）显示确认对话框',
  },
];

export default function LessonAIUX() {
  const [tab, setTab] = useState('uncertainty');
  const p = UX_PRINCIPLES.find(x => x.key === tab);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块二 · AI UX Design</div>
          <h1>AI 产品 UX 设计原则</h1>
          <p>AI 产品的 UX 挑战与传统产品截然不同——你需要设计"不确定性""延迟""偶发错误"。掌握这 4 个核心原则，让用户爱上你的 AI 产品而不是放弃它。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '流式', l: '延迟感知降 70%' }, { v: '引用', l: '信任度关键' }, { v: 'HITL', l: '高风险必须有' }, { v: '反馈', l: 'Bad Case 收集' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Principles */}
        <div className="lp-section">
          <h2>🎨 AI UX 四大核心原则</h2>
          <div className="lp-tabs">
            {UX_PRINCIPLES.map(x => (
              <button key={x.key} className={`lp-tab${tab === x.key ? ' active' : ''}`} onClick={() => setTab(x.key)}>
                {x.icon} {x.title}
              </button>
            ))}
          </div>
          {p && (
            <div>
              <div className="lp-warn">⚠️ <span><strong>核心问题：</strong>{p.problem}</span></div>
              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lp-text)', fontSize: '.92rem' }}>✅ 设计解决方案：</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.solutions.map((s, i) => (
                    <div key={i} style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 8, padding: '0.65rem 1rem', fontSize: '.87rem', display: 'flex', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--lp-primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '.85rem', color: 'var(--lp-muted)' }}>💻 实现示例：</div>
              <div className="lp-code">{p.example}</div>
              <div className="lp-good">🌟 <span><strong>真实案例：</strong>{p.real}</span></div>
            </div>
          )}
        </div>

        {/* The Golden Rule */}
        <div className="lp-section">
          <h2>🏆 AI UX 黄金法则</h2>
          <div className="lp-grid-2">
            {[
              { t: '永远给用户 Escape Hatch', d: '任何 AI 操作都应该有"撤销"或"拒绝"。用户感到被 AI 困住时会愤而放弃产品。' },
              { t: '明确 AI 的边界', d: '让用户知道 AI 能做什么、不能做什么，而非让他们自己踩坑发现边界。' },
              { t: '优先流式输出', d: '哪怕 AI 总时间一样长，流式输出让用户感知延迟降低 70%。这是延迟体验的第一优化。' },
              { t: 'Onboarding 中演示 Wow 时刻', d: '用户第一次使用时应该体验到"哇，AI 真的可以做到这个"。找到你的 Aha Moment，在 Onboarding 中必然触发。' },
              { t: '收集每一个 Bad Case', d: '在界面上提供"🙁 这个回答有问题"反馈，每一个 Bad Case 都是改进 Prompt 的机会。' },
              { t: '降级方案永远存在', d: 'AI 不可用时（API 故障/成本过高），有降级方案让用户完成任务，而非看到纯错误页。' },
            ].map((c, i) => (
              <div key={i} className="lp-card">
                <div className="lp-card-title" style={{ color: 'var(--lp-primary)' }}>⚡ {c.t}</div>
                <div className="lp-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="lp-section">
          <h2>📋 AI UX 设计检查清单</h2>
          <div className="lp-code">{`✅ 不确定性处理
□ AI 生成内容有"可能出错"的提示
□ 事实性内容附有来源/引用
□ 提供重新生成、优化、拒绝 AI 建议的选项

✅ 延迟体验
□ 实现了流式输出（Streaming）
□ 有 Loading 状态设计（骨架屏/动画）
□ 长时间任务有进度提示

✅ 错误处理
□ 区分 AI 内容错误 vs 系统错误
□ 有"反馈这个回答有问题"的按钮
□ API 超时有自动重试机制

✅ 信任建立
□ 高风险操作有人工确认步骤
□ 首次使用有 WoW 时刻演示
□ 有清晰的 AI 能力边界说明

✅ 降级方案
□ AI 功能不可用时，核心功能仍然可用
□ 内容被过滤时，提供具体引导
□ 错误信息对用户有帮助，不是技术报错`}</div>
        </div>

      </div>
    </div>
  );
}
