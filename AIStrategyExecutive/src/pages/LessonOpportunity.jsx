import { useState } from 'react';
import './LessonCommon.css';

const SCENARIOS = [
  {
    dept: '客服 & 售后', icon: '🎧', potential: 5,
    pains: ['重复性工单占 70%+', '高峰期人力不足', '质量一致性差', '多语言支持成本高'],
    aiSolutions: ['AI 客服机器人处理标准问题', '智能路由（自动分类+分配）', '座席实时辅助（推荐答案）', '自动质检与合规审查'],
    effort: '低', timeToValue: '3-6月', roi: '⭐⭐⭐⭐⭐',
  },
  {
    dept: '销售 & 市场', icon: '📊', potential: 5,
    pains: ['线索质量参差不齐', '销售团队时间浪费在低质量跟进', '内容个性化缺失', '数据分析滞后'],
    aiSolutions: ['AI 线索评分（预测成交概率）', '个性化邮件/提案自动生成', '竞品分析与市场情报', '销售预测与配额优化'],
    effort: '中', timeToValue: '3-9月', roi: '⭐⭐⭐⭐⭐',
  },
  {
    dept: '研发 & 工程', icon: '💻', potential: 4,
    pains: ['代码 Review 耗时', '文档严重落后', '新人上手慢', '测试覆盖不足'],
    aiSolutions: ['AI 代码助手（GitHub Copilot 等）', '自动生成技术文档', 'AI 代码 Review 与安全扫描', '测试用例自动生成'],
    effort: '低', timeToValue: '1-3月', roi: '⭐⭐⭐⭐',
  },
  {
    dept: '人力资源', icon: '👥', potential: 3,
    pains: ['简历筛选耗时', '面试问题不一致', '员工培训效率低', '离职率预测缺失'],
    aiSolutions: ['AI 简历筛选与排名', '面试题生成与评估辅助', '个性化学习路径推荐', '员工流失风险预警'],
    effort: '中', timeToValue: '3-6月', roi: '⭐⭐⭐',
  },
  {
    dept: '法务 & 合规', icon: '⚖️', potential: 4,
    pains: ['合同审查耗时长', '合规更新追踪困难', '法律文件检索效率低', 'NDA 等标准文件起草重复'],
    aiSolutions: ['AI 合同审查与风险标注', '法规变更自动追踪与摘要', '法律知识库问答系统', '标准合同自动起草'],
    effort: '中高', timeToValue: '6-12月', roi: '⭐⭐⭐⭐',
  },
  {
    dept: '供应链 & 运营', icon: '🏭', potential: 5,
    pains: ['需求预测不准', '库存管理粗放', '供应商风险监测滞后', '物流调度效率低'],
    aiSolutions: ['需求预测（准确率提升20-40%）', '动态库存优化', '供应商风险监控与预警', '智能排班与路径优化'],
    effort: '高', timeToValue: '6-18月', roi: '⭐⭐⭐⭐⭐',
  },
];

const MATRIX_CRITERIA = ['影响规模', '实施难度低', '数据可用性', '竞争紧迫度'];

export default function LessonOpportunity() {
  const [dept, setDept] = useState(0);
  const d = SCENARIOS[dept];

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 02 · Opportunity Mapping</div>
        <h1>机会识别框架</h1>
        <p>AI 转型的最大失败原因不是技术，而是<strong>选错了场景</strong>。本模块提供系统性的机会识别框架——从哪里开始、优先级如何排序、如何避免"炫技而无实用"的陷阱。</p>
      </div>

      {/* The Framework */}
      <div className="ex-section">
        <div className="ex-section-title">🎯 机会评估四维矩阵</div>
        <div className="ex-grid-2">
          {[
            { d: 'Impact（影响规模）', q: '这个环节一年影响多少人次/多少钱？影响规模越大，AI 价值越高。', icon: '💥', color: '#d4a054' },
            { d: 'Feasibility（可行性）', q: '数据质量够吗？有没有现成 AI 工具？实施周期多长？风险高不高？', icon: '⚙️', color: '#4a90d9' },
            { d: 'Urgency（紧迫度）', q: '如果不行动，竞争对手会抢走多少市场？内部的痛点有多烫？', icon: '🔥', color: '#e74c3c' },
            { d: 'Data Readiness（数据就绪）', q: '相关数据是否已数字化？是否可访问？质量是否足够？', icon: '📦', color: '#2ecc71' },
          ].map((c, i) => (
            <div key={i} className="ex-card" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                <span style={{ fontWeight: 700, color: c.color }}>{c.d}</span>
              </div>
              <div style={{ color: 'var(--ex-muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>{c.q}</div>
            </div>
          ))}
        </div>
        <div className="ex-callout gold" style={{ marginTop: '1rem' }}>
          💼 <strong>高优先级 AI 机会特征：</strong>Impact 高 + Feasibility 高 + Urgency 高，数据已就绪。先找"低垂果实"（高影响 + 低难度），建立信心和内部声誉，再推进复杂项目。
        </div>
      </div>

      {/* By Department */}
      <div className="ex-section">
        <div className="ex-section-title">🏢 各部门 AI 机会地图</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {SCENARIOS.map((s, i) => (
            <button key={i} className={`ex-btn ${dept === i ? 'active' : ''}`} onClick={() => setDept(i)}>
              {s.icon} {s.dept}
            </button>
          ))}
        </div>
        <div className="ex-grid-2">
          <div className="ex-card">
            <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>🔴 当前痛点</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {d.pains.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.87rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: 'var(--ex-red)', flexShrink: 0 }}>•</span> {p}
                </div>
              ))}
            </div>
          </div>
          <div className="ex-card">
            <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>✅ AI 解决方案</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {d.aiSolutions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.87rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: 'var(--ex-green)', flexShrink: 0 }}>✓</span> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {[['实施难度', d.effort], ['见效时间', d.timeToValue], ['ROI 潜力', d.roi]].map(([k, v]) => (
            <div key={k} className="ex-card" style={{ flex: '1', minWidth: 120, textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--ex-muted)', marginBottom: '0.3rem' }}>{k}</div>
              <div style={{ fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pitfalls */}
      <div className="ex-section">
        <div className="ex-section-title">⛔ 机会识别的四大陷阱</div>
        <div className="ex-grid-2">
          {[
            { t: '技术图新鲜，忽略业务价值', d: '企业采购 GPT-4 后，只用来写外部邮件，没有结合核心业务流程。3个月后兴趣消退。', icon: '🎪' },
            { t: '一步登天，从最难的开始', d: '直接上 AI 客服全自动化，跳过数据准备和客服场景梳理，上线后频繁出错，CEO 失去信心，项目叫停。', icon: '🧗' },
            { t: '技术主导，业务旁观', d: 'AI项目由IT推进，业务方不参与需求定义，结果产品做出来没人用，投入打水漂。', icon: '🤖' },
            { t: '忽视"最后一公里"变革管理', d: 'AI工具上线，但员工不会用、不愿用、担心被替代，推广卡在第一步。', icon: '🚧' },
          ].map((p, i) => (
            <div key={i} className="ex-callout red" style={{ margin: 0, borderRadius: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
              <span style={{ fontWeight: 700, color: 'var(--ex-red)', marginLeft: '0.4rem' }}>{p.t}</span>
              <div style={{ marginTop: '0.4rem', color: 'var(--ex-muted)', fontSize: '0.85rem' }}>{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
