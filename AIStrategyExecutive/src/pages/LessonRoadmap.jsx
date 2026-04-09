import { useState } from 'react';
import './LessonCommon.css';

const PHASES = [
  {
    phase: '第一阶段：Discovery', time: '第 1-2 周', label: '方向确定',
    objective: '找到第一个 AI 项目，建立初始共识',
    tasks: [
      { owner: 'CEO/CTO', task: '明确 AI 战略目标（3个关键词）和1年内的成功指标' },
      { owner: 'AI PM', task: '用机会识别框架扫描全公司，提交5个候选场景' },
      { owner: '各部门 Head', task: '配合 1 小时访谈，描述最大的业务痛点' },
      { owner: '法务/合规', task: '梳理数据使用约束，提前暴露红线' },
    ],
    output: '确定第一个 POC 场景 + 项目章程（1页纸）',
    color: '#d4a054',
  },
  {
    phase: '第二阶段：POC', time: '第 3-6 周', label: '快速验证',
    objective: '用最小成本验证 AI 可行性，决策是否继续',
    tasks: [
      { owner: 'AI 工程师', task: '搭建最小可行的技术方案（目标：Demo，非生产就绪）' },
      { owner: 'AI PM', task: '定义 POC 成功指标（准确率/时间节省/用户满意度）' },
      { owner: '业务方', task: '提供测试数据集（100-500条）和测试用例' },
      { owner: '管理层', task: '每周 30 分钟 Review，确保资源不被抢占' },
    ],
    output: 'POC Demo + 量化测试报告 + 继续/暂停/调整 决策',
    color: '#4a90d9',
  },
  {
    phase: '第三阶段：Pilot', time: '第 7-10 周', label: '小范围试点',
    objective: '在真实业务环境中用真实数据验证，收集早期用户反馈',
    tasks: [
      { owner: 'AI 工程师', task: '将 POC 升级为生产就绪版本（监控/日志/错误处理）' },
      { owner: 'AI 运营', task: '设计培训材料，招募 10-30 名种子用户' },
      { owner: '管理层', task: '明确"允许失败"的文化：Pilot 的目的就是发现问题' },
      { owner: '所有人', task: '每周收集用户反馈，建立 AI 优化闭环' },
    ],
    output: '真实业务数据的效果报告 + 推广/调优/放弃 决策',
    color: '#9b59b6',
  },
  {
    phase: '第四阶段：Scale', time: '第 10-90 天', label: '全面推广',
    objective: '将验证成功的 AI 方案推广至全组织，建立长效机制',
    tasks: [
      { owner: 'AI 运营', task: '全员培训计划，分批推广，建立使用激励机制' },
      { owner: '业务 Head', task: '将 AI KPI 纳入团队绩效，确保采用率' },
      { owner: '数据团队', task: '建立持续数据反馈机制，驱动模型迭代' },
      { owner: 'CTO/AI Lead', task: '总结最佳实践，复制到下一个 AI 项目场景' },
    ],
    output: '稳定运行的 AI 产品 + 90 天 ROI 报告 + 第二阶段 AI 路线图',
    color: '#2ecc71',
  },
];

const YEAR_MILESTONES = [
  { month: 'M1', event: '完成机会识别，选定首个场景', type: 'decision' },
  { month: 'M1.5', event: 'POC 立项，招募/指定 AI PM', type: 'action' },
  { month: 'M2', event: 'POC Demo 完成，内部评审', type: 'milestone' },
  { month: 'M3', event: 'Pilot 上线，10-30人种子用户', type: 'action' },
  { month: 'M4', event: 'Pilot 效果报告，推广或调优决策', type: 'decision' },
  { month: 'M5', event: '全面推广至相关业务线', type: 'action' },
  { month: 'M6', event: '90天ROI Review，董事会汇报', type: 'milestone' },
  { month: 'M7', event: '启动第2个 AI 场景 POC', type: 'action' },
  { month: 'M9', event: '建立 AI 中台基础能力', type: 'action' },
  { month: 'M12', event: '年度 AI 战略复盘，制定次年路线图', type: 'milestone' },
];

export default function LessonRoadmap() {
  const [phase, setPhase] = useState(0);
  const p = PHASES[phase];

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 08 · Action Roadmap</div>
        <h1>90 天行动路线图</h1>
        <p>战略只有落地才有价值。本模块提供可直接使用的<strong>90天 AI 落地行动计划</strong>——明确每个阶段的目标、负责人、关键任务和交付物，让"AI 转型"从愿景变成可执行的项目。</p>
      </div>

      {/* Readiness Check */}
      <div className="ex-section">
        <div className="ex-section-title">✅ 出发前：AI 就绪度自测</div>
        <div className="ex-grid-2">
          {[
            { dim: '战略对齐', checks: ['AI 目标与公司战略明确关联', '管理层达成共识（非个别人的项目）', '愿意接受6个月内无法量化ROI的阶段'] },
            { dim: '资源准备', checks: ['有预算（哪怕小额试点预算）', '有或能招到 AI PM 角色', '业务方愿意贡献时间和数据'] },
            { dim: '文化准备', checks: ['允许 POC 阶段的"有益失败"', '数据分享文化（跨部门数据不封锁）', '高层愿意为 AI 项目"站台"'] },
            { dim: '数据基础', checks: ['目标场景的相关数据已数字化', '数据可被技术团队访问（非孤岛状态）', '数据量至少满足最低验证需求'] },
          ].map((d, i) => (
            <div key={i} className="ex-card">
              <div style={{ fontWeight: 700, color: 'var(--ex-gold)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{d.dim}</div>
              {d.checks.map((c, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: 'var(--ex-gold)', flexShrink: 0 }}>□</span> {c}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="ex-callout gold">
          💡 不必等到全部打勾再出发。先启动得分在 60% 以上的团队，边做边补足。等到100%就绪才行动的企业，往往错过了最佳窗口期。
        </div>
      </div>

      {/* 90-Day Phases */}
      <div className="ex-section">
        <div className="ex-section-title">📅 90 天四阶段执行框架</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {PHASES.map((ph, i) => (
            <button key={i} className={`ex-btn ${phase === i ? 'active' : ''}`}
              style={{ borderColor: phase === i ? ph.color : undefined, color: phase === i ? ph.color : undefined }}
              onClick={() => setPhase(i)}>
              <span className="ex-tag" style={{ background: `${ph.color}18`, color: ph.color, marginRight: '0.4rem' }}>{ph.label}</span>
              {ph.time}
            </button>
          ))}
        </div>
        <div className="ex-card-gold">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: p.color }}>{p.phase}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ex-muted)', marginTop: '0.25rem' }}>{p.objective}</div>
            </div>
            <span className="ex-tag" style={{ background: `${p.color}18`, color: p.color }}>{p.time}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {p.tasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.7rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <span className="ex-tag blue" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{t.owner}</span>
                <span style={{ fontSize: '0.87rem', color: 'var(--ex-muted)', lineHeight: 1.6 }}>{t.task}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.75rem 1rem', background: `${p.color}10`, border: `1px solid ${p.color}30`, borderRadius: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: p.color }}>📦 阶段交付物：</span>
            <span style={{ fontSize: '0.87rem', color: 'var(--ex-muted)', marginLeft: '0.4rem' }}>{p.output}</span>
          </div>
        </div>
      </div>

      {/* 12-Month Timeline */}
      <div className="ex-section">
        <div className="ex-section-title">🗓️ 12 个月关键里程碑</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {YEAR_MILESTONES.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.65rem', borderRadius: 8, transition: 'background 0.15s' }}>
              <div style={{ width: 48, flexShrink: 0, fontWeight: 800, fontSize: '0.78rem', color: 'var(--ex-gold)', fontFamily: 'monospace', paddingTop: '0.1rem' }}>{m.month}</div>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: '0.22rem',
                background: m.type === 'milestone' ? 'var(--ex-gold)' : m.type === 'decision' ? '#4a90d9' : 'rgba(255,255,255,0.15)',
                border: '2px solid',
                borderColor: m.type === 'milestone' ? 'var(--ex-gold)' : m.type === 'decision' ? '#4a90d9' : 'rgba(255,255,255,0.2)',
              }} />
              <div style={{ fontSize: '0.87rem', color: m.type === 'milestone' ? 'var(--ex-text)' : 'var(--ex-muted)', fontWeight: m.type === 'milestone' ? 600 : 400, lineHeight: 1.5 }}>
                {m.event}
                {m.type === 'milestone' && <span className="ex-tag gold" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>里程碑</span>}
                {m.type === 'decision' && <span className="ex-tag blue" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>决策点</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ex-quote" style={{ marginTop: '2rem' }}>
        "执行力是 AI 战略最稀缺的资产。制定完美路线图的时间，不如立刻启动第一个 POC。"
        <cite>— 课程总结</cite>
      </div>
    </div>
  );
}
