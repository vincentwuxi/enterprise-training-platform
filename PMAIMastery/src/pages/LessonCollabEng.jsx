import { useState } from 'react';
import './LessonCommon.css';

const ENG_SCENARIOS = [
  {
    key: 'spec', label: '技术方案评审',
    desc: '如何看懂工程师的技术方案，问对问题',
    prompt: `帮我理解以下技术方案，并从产品角度提出评审问题：

[粘贴技术方案/架构设计文档]

请帮我：
1. 用非技术语言解释这个方案做了什么（200字内）
2. 识别可能影响用户体验的技术决策（如性能、错误处理）
3. 找出可能的产品风险（降级方案、数据一致性等）
4. 生成我在技术评审会上应该提的5个好问题`,
    questions: [
      '如果这个服务挂了，用户会看到什么？有降级方案吗？',
      '这个方案对接口响应时间有什么影响？预期 P95 延迟是多少？',
      '数据一致性如何保证？如果写入一半失败，会有什么问题？',
      '这个方案是否有向后兼容性？旧版本 App 用户会受影响吗？',
      '灰度策略是什么？如果出问题，回滚需要多长时间？',
    ],
  },
  {
    key: 'llm', label: 'LLM 能力边界',
    desc: '了解 LLM 能做什么、不能做什么，避免做不可能的需求',
    limits: [
      { can: '✅ LLM 能做', items: ['理解和生成自然语言文本', '代码生成与解释', '知识问答（训练数据截止日期内）', '文本分类、情感分析', '结构化信息提取（JSON输出）', '多轮对话与上下文理解'] },
      { can: '❌ LLM 不能做', items: ['实时获取最新信息（除非联网）', '精确计算（容易算错，需用工具）', '100%准确率的事实核查', '理解图像（纯文本模型）', '记住跨会话的用户信息', '保证每次输出完全一致'] },
    ],
  },
  {
    key: 'estimate', label: '工期估算沟通',
    desc: '理解工程师的工期估算，避免不合理的催促',
    prompt: `工程师给出了以下工期估算，帮我理解合理性，并准备沟通方案：

**功能**：[功能描述]
**工程师估算**：[X天/X周]
**你的期望**：[Y天]

帮我：
1. 分析工程估算背后可能考虑了什么（隐藏工作量）
2. 如果要压缩时间，有哪些合理的 Trade-off 方案
3. 我应该从哪些维度了解工期构成（不显得在质疑工程师）
4. 生成一个与工程师友好沟通的对话框架`,
    tradeoffs: [
      { way: '减少范围', detail: '先做核心主流程，边缘情况留到下期' },
      { way: '降低质量门槛', detail: '先上内测版，允许有已知 Bug 的灰度版本' },
      { way: '并行开发', detail: '增加人力，但需评估沟通成本是否值得' },
      { way: '技术借力', detail: '用第三方服务/API 替代自研，速度更快' },
    ],
  },
];

export default function LessonCollabEng() {
  const [tab, setTab] = useState('spec');
  const t = ENG_SCENARIOS.find(s => s.key === tab);

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块七 · PM × Engineering</div>
          <h1>与工程师协作 AI 项目</h1>
          <p>AI 时代的 PM 不需要写代码，但需要"懂技术的语言"——理解 LLM 能力边界、看懂技术方案、合理评估工期，成为工程师信任的产品合作伙伴。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: '信任', l: 'PM-工程师关系' }, { v: '边界', l: 'LLM 能力认知' }, { v: '评审', l: '技术方案阅读' }, { v: 'Trade-off', l: '工期沟通框架' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        <div className="pm-section">
          <h2>🤝 协作场景详解</h2>
          <div className="pm-tabs">
            {ENG_SCENARIOS.map(s => <button key={s.key} className={`pm-tab${tab === s.key ? ' active' : ''}`} onClick={() => setTab(s.key)}>{s.label}</button>)}
          </div>
          <p style={{ color: 'var(--pm-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>{t?.desc}</p>

          {tab === 'spec' && (
            <div>
              <div className="pm-prompt">{t.prompt}</div>
              <div className="pm-prompt-label" style={{ marginTop: '1rem' }}>💬 技术评审必问的5个问题：</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {t.questions.map((q, i) => (
                  <div key={i} style={{ background: 'var(--pm-surface2)', border: '1px solid var(--pm-border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '.88rem', display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--pm-primary)', fontWeight: 700 }}>{i + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'llm' && (
            <div>
              <div className="pm-grid-2">
                {t.limits.map((group, i) => (
                  <div key={i} className="pm-card" style={{ borderColor: i === 0 ? 'var(--pm-green)' : 'var(--pm-rose)' }}>
                    <div className="pm-card-title" style={{ color: i === 0 ? 'var(--pm-green)' : 'var(--pm-rose)' }}>{group.can}</div>
                    <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.2rem', color: 'var(--pm-muted)', fontSize: '.85rem', lineHeight: 2 }}>
                      {group.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pm-warn">⚠️ <span>对工程师说"让 AI 实现 100% 准确的医学诊断"或"让 AI 实时获取股价"——这类需求会直接破坏信任。理解边界，才能提可执行的需求。</span></div>
              <div className="pm-code">{`# AI 产品需求的黄金问题
在写 AI 功能需求前，先问自己：

1. 这个任务需要实时数据吗？
   → 如需要：必须接入搜索/API，不能只靠 LLM 知识库

2. 这个任务对准确率要求是多少？
   → 99.99% 准确率的任务不适合纯 LLM

3. 输出格式是否必须完全一致？
   → LLM 输出有随机性，需要约束（如 JSON Schema）

4. 用户能接受"有时候答错"吗？
   → 创意类可以，事实类不行，金融/医疗要极慎重

5. 如果 AI 出错，后果是什么？
   → 后果严重的，必须有人工审核兜底（HITL）`}</div>
            </div>
          )}

          {tab === 'estimate' && (
            <div>
              <div className="pm-prompt">{t.prompt}</div>
              <div className="pm-prompt-label" style={{ marginTop: '1rem' }}>🔧 压缩工期的4种 Trade-off：</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {t.tradeoffs.map((tr, i) => (
                  <div key={i} className="pm-card" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem' }}>
                    <span style={{ color: 'var(--pm-primary)', fontWeight: 700, minWidth: 100, fontSize: '.88rem' }}>{tr.way}</span>
                    <span style={{ color: 'var(--pm-muted)', fontSize: '.85rem' }}>{tr.detail}</span>
                  </div>
                ))}
              </div>
              <div className="pm-tip">💡 <span>最好的沟通策略：不问"能不能更快"，而问"<strong>如果提前一周，哪些功能可以先不做</strong>"——让工程师帮你做 Trade-off，而不是催他们加班。</span></div>
            </div>
          )}
        </div>

        {/* PM-Eng Trust Building */}
        <div className="pm-section">
          <h2>🌟 建立 PM-工程师信任的10个习惯</h2>
          <div className="pm-grid-2">
            {[
              { t: '需求冻结期前通知', d: '至少提前3天告知即将封版，给工程师缓冲空间' },
              { t: '一起参加 Scrum Planning', d: '亲自参加，当场解答问题，减少异步沟通成本' },
              { t: '承认不懂技术', d: '"我不太了解技术细节，能帮我解释一下" > 装懂说错话' },
              { t: '替工程师挡外部压力', d: '"产品还没ready"由 PM 来说，不让工程背锅' },
              { t: 'Debug 时不旁观', d: '线上问题时提供数据和用户反馈，帮工程师缩小范围' },
              { t: 'Changelog 认可贡献', d: '发布邮件中具名感谢工程师的关键工作' },
            ].map((c, i) => (
              <div key={i} className="pm-card">
                <div className="pm-card-title">✅ {c.t}</div>
                <div className="pm-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
