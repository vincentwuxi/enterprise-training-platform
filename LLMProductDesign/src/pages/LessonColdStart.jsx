import { useState } from 'react';
import './LessonCommon.css';

const FLYWHEEL_STAGES = [
  { stage: '种子期', action: '找准 Niche 用户群（100人）', data: '收集使用数据和反馈', ai: 'AI 从小数据中学习', icon: '🌱' },
  { stage: '早期增长', action: 'Niche 用户口碑扩散', data: '积累用户行为数据1000+', ai: 'AI 个性化能力提升', icon: '🚀' },
  { stage: '规模化', action: '从 Niche 拓展到相邻市场', data: '数百万数据点训练', ai: 'AI 超越手工水平', icon: '📈' },
  { stage: '防御期', action: '数据优势形成护城河', data: '数据独占无法复制', ai: 'AI 成为核心壁垒', icon: '🏰' },
];

const COLD_START = [
  {
    key: 'niche', label: 'Niche First 策略',
    icon: '🎯',
    desc: '从最垂直的细分用户群开始，而非试图服务所有人',
    example: 'GitHub Copilot 最初只针对 Python 程序员 → Cursor 最初主攻"习惯 VS Code 的前端工程师"',
    steps: [
      '选择一个有真实痛点的 Niche（100-1000人）',
      '在这个 Niche 内达到极致产品力（NPS > 50）',
      '让 Niche 用户主动推荐（口碑传播替代广告）',
      '以 Niche 成功为基础，拓展到相邻 Niche',
    ],
    why: '小用户群容易服务好，口碑传播成本低，成功后可以快速扩展',
  },
  {
    key: 'content', label: '内容驱动获客',
    icon: '✍️',
    desc: '通过展示 AI 能力的内容（文章/视频/工具）吸引目标用户',
    example: 'Perplexity 早期通过展示"AI vs Google"的对比内容在 Twitter 上病毒传播',
    steps: [
      '每周发布展示产品 AI 能力的案例（Twitter/LinkedIn）',
      '制作"用 AI 完成 XX 任务"的教程视频',
      '开放免费工具或 API，让开发者体验并传播',
      '赞助目标受众的技术会议/播客',
    ],
    why: '内容是有机流量，LLM 产品因"WoW 时刻"天然适合内容展示',
  },
  {
    key: 'community', label: 'Community Led Growth',
    icon: '👥',
    desc: '建立用户社区，让用户成为你的增长引擎',
    example: 'Midjourney 的 Discord 社区 — 生成结果公开展示，形成强力社交证明和从众心理',
    steps: [
      '建立 Discord/Slack 社区，早期用户为创始成员',
      '设计让用户分享使用结果的机制（公开生成/排行榜）',
      '积极响应社区反馈，让用户感到被重视',
      '培养 Power User 成为社区大使/内容创作者',
    ],
    why: '社区是免费的客户成功团队，也是最真实的产品反馈来源',
  },
  {
    key: 'integration', label: '生态集成策略',
    icon: '🔗',
    desc: '集成到用户已经使用的工具中，零迁移成本获客',
    example: 'Notion AI 直接向 4000万 Notion 用户推送 / Copilot 通过 VS Code 插件市场分发',
    steps: [
      '识别目标用户使用的前 5 个工具（Slack/Notion/VS Code）',
      '开发集成插件（从最高频使用的工具开始）',
      '在插件市场 / App Directory 发布，获取平台流量',
      '与宿主平台建立官方合作关系（联合营销）',
    ],
    why: '集成获客 CAC 极低，用户已在目标场景，转化率显著高于独立获客',
  },
];

export default function LessonColdStart() {
  const [strategy, setStrategy] = useState('niche');
  const s = COLD_START.find(x => x.key === strategy);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块四 · Cold Start & Data Flywheel</div>
          <h1>AI 产品冷启动 & 数据飞轮</h1>
          <p>AI 产品冷启动的核心挑战：没有数据就没有 AI 能力，没有 AI 能力就没有用户，没有用户就没有数据。打破这个死循环，建立自增强的数据飞轮。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: 'Niche', l: '从100人开始' }, { v: '数据飞轮', l: '自增强护城河' }, { v: '0 CAC', l: '集成获客' }, { v: 'WoW', l: '内容传播核武' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Data Flywheel */}
        <div className="lp-section">
          <h2>🔄 AI 数据飞轮的四个阶段</h2>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            {FLYWHEEL_STAGES.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ background: 'var(--lp-surface2)', border: `1px solid ${i === 3 ? 'var(--lp-primary)' : 'var(--lp-border)'}`, borderRadius: 14, padding: '1.25rem', width: 160, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--lp-primary)', marginBottom: '.4rem' }}>{s.stage}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--lp-text)', marginBottom: '.3rem', lineHeight: 1.4 }}>{s.action}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--lp-muted)', lineHeight: 1.4 }}>{s.data}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--lp-accent)', marginTop: '.3rem', lineHeight: 1.4 }}>{s.ai}</div>
                </div>
                {i < FLYWHEEL_STAGES.length - 1 && (
                  <div style={{ color: 'var(--lp-primary)', fontSize: '1.4rem', padding: '0 0.25rem', flexShrink: 0 }}>→</div>
                )}
              </div>
            ))}
          </div>
          <div className="lp-tip">🔄 <span>数据飞轮的关键：每一个用户行为都要变成<strong>改善 AI 的信号</strong>。用户分享/保存/重新生成/评分——都是宝贵的训练数据。设计产品时就要考虑如何收集这些信号。</span></div>

          <div className="lp-code">{`# 数据飞轮信号收集实践
# 每一个用户交互都是数据

class FlyWheelSignalCollector:
    def collect(self, event_type: str, data: dict):
        signals = {
            # 正向信号（AI 做对了）
            "accepted_suggestion":  {"weight": 1.0, "use": "强化"},
            "copy_response":        {"weight": 0.8, "use": "强化"},
            "share_result":         {"weight": 0.9, "use": "强化"},
            
            # 负向信号（AI 做错了）
            "rejected_suggestion":  {"weight": 1.0, "use": "惩罚"},
            "regenerate_clicked":   {"weight": 0.7, "use": "惩罚"},
            "thumbs_down":          {"weight": 1.0, "use": "惩罚/加入测试集"},
            "edit_after_accept":    {"weight": 0.5, "use": "弱惩罚"},
            
            # 中性信号（理解用户行为）
            "session_duration":     {"use": "留存分析"},
            "feature_used":         {"use": "功能价值分析"},
        }
        # 存储信号 → 定期 Batch 处理 → 改善 Prompt/Fine-tune`}</div>
        </div>

        {/* Cold Start Strategies */}
        <div className="lp-section">
          <h2>🚀 四大冷启动策略</h2>
          <div className="lp-tabs">
            {COLD_START.map(x => <button key={x.key} className={`lp-tab${strategy === x.key ? ' active' : ''}`} onClick={() => setStrategy(x.key)}>{x.icon} {x.label}</button>)}
          </div>
          {s && (
            <div>
              <p style={{ color: 'var(--lp-muted)', fontSize: '.88rem', marginBottom: '0.75rem' }}>{s.desc}</p>
              <div className="lp-good">🌟 <span><strong>成功案例：</strong>{s.example}</span></div>
              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: '0.75rem' }}>执行步骤：</div>
                <div className="lp-steps">
                  {s.steps.map((step, i) => (
                    <div key={i} className="lp-step"><div><div className="lp-step-desc">{step}</div></div></div>
                  ))}
                </div>
              </div>
              <div className="lp-tip">💡 <span><strong>为什么有效：</strong>{s.why}</span></div>
            </div>
          )}
        </div>

        {/* The "Cheat Code" */}
        <div className="lp-section">
          <h2>🃏 AI 产品冷启动的终极秘诀</h2>
          <div className="lp-code">{`"""
冷启动终极公式：找到"手工服务可以达到 AI 产品效果"的场景

第一步：用人工替代 AI
  - 先用真人来完成 AI 将要做的工作（"Wizard of Oz" 测试）
  - 验证用户是否真的需要这个价值，愿意付费
  - 收集真实场景数据，为后续 AI 训练奠基

第二步：从手工到半自动
  - 用 AI 辅助人做判断（人工审核 AI 输出）
  - 在质量有保证的情况下逐步扩大 AI 比例
  - 保持 SLA 但降低人工投入

第三步：全自动 + 人工兜底
  - 大部分请求由 AI 自动处理
  - 复杂/不确定的转人工（HITL）
  - 持续从人工处理中提取 AI 训练数据

真实案例：
  - Stripe Atlas（公司注册）：先有律师团队帮客户办理 → 逐步自动化
  - Scale AI：先用人工标注 → 再用 AI + 人工校验
  - 很多 AI 的 "Demo" 背后其实是人在驱动（别人也这么做）
"""

# 关键思路：用户买的是"结果"，不是"AI 技术"
# 先确保有结果，再优化有 AI`}</div>
        </div>

      </div>
    </div>
  );
}
