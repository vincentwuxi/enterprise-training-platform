import { useState } from 'react';
import './LessonCommon.css';

const METHODS = [
  {
    key: 'lora', name: 'LoRA', icon: '🔬', color: '#e11d48',
    params: '< 1%', memory: '低', speed: '快', quality: '高',
    desc: '在预训练权重旁并联低秩矩阵，只训练低秩矩阵。最主流的 PEFT 方法。',
    best: '绝大多数下游任务微调',
  },
  {
    key: 'qlora', name: 'QLoRA', icon: '⚡', color: '#f59e0b',
    params: '< 1%', memory: '极低（4-bit）', speed: '较慢（量化开销）', quality: '接近 LoRA',
    desc: '在 4-bit 量化的冻结模型上做 LoRA。单张 24GB GPU 可微调 70B 模型。',
    best: '消费级 GPU，大参数模型',
  },
  {
    key: 'prefix', name: 'Prefix Tuning', icon: '🎯', color: '#6366f1',
    params: '0.1%', memory: '极低', speed: '极快', quality: '中等',
    desc: '在每层注意力前加入可训练的虚拟 Token（Prefix），模型权重完全冻结。',
    best: '条件生成任务（摘要/翻译）',
  },
  {
    key: 'adapter', name: 'Adapter', icon: '🔌', color: '#10b981',
    params: '0.5-3%', memory: '低', speed: '较慢（推理有额外层）', quality: '高',
    desc: '在 Transformer 层间插入小型 Adapter 模块，推理时有额外计算开销。',
    best: '需要多任务切换（不同适配器）',
  },
  {
    key: 'ia3', name: 'IA³', icon: '🧬', color: '#06b6d4',
    params: '< 0.01%', memory: '极低', speed: '极快', quality: '中等',
    desc: '通过缩放激活函数的输出来适配模型，参数量极小，是目前参数效率最高的方法。',
    best: '计算受限 / 超多任务场景',
  },
  {
    key: 'full', name: '全量微调', icon: '💪', color: '#818cf8',
    params: '100%', memory: '极高（A100×多张）', speed: '慢', quality: '最高',
    desc: '更新所有参数。需要大量计算资源，适合超大数据集或需要模型能力根本性改变。',
    best: '预算充足，任务和预训练差异大',
  },
];

const DECISION = [
  { q: '显卡 < 48GB？', yes: '⬇ QLoRA（4-bit 量化）', no: '⬇ 可考虑 LoRA 或全量微调' },
  { q: '训练数据 < 1 万条？', yes: '✅ LoRA / QLoRA 足够', no: '⬇ 数据够多 → 考虑全量' },
  { q: '需要多任务切换？', yes: '✅ Adapter（可插拔）', no: '✅ LoRA 即可' },
  { q: '任务是生成/摘要？', yes: '✅ Prefix Tuning 效果好', no: '✅ LoRA 通杀' },
];

export default function LessonOverview() {
  const [method, setMethod] = useState('lora');
  const m = METHODS.find(x => x.key === method) ?? {};

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 01 · FINETUNING OVERVIEW</div>
        <h1>微调策略全景</h1>
        <p>微调不是唯一选择。在做任何工程工作前，必须先回答：<strong>这个问题用 Prompt Engineering / RAG 能解决吗？</strong>只有当它们确实无法满足时，微调才是正确答案。</p>
      </div>

      {/* Decision: Fine-tune or not? */}
      <div className="ft-section">
        <div className="ft-section-title">🤔 微调 vs RAG vs Prompt — 三路决策</div>
        <div className="ft-card" style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table className="ft-table">
            <thead><tr><th>维度</th><th style={{color:'#e11d48'}}>微调</th><th style={{color:'#6366f1'}}>RAG</th><th style={{color:'#10b981'}}>Prompt Engineering</th></tr></thead>
            <tbody>
              {[
                ['知识更新频率', '低（重训代价高）', '✅ 高（实时更新向量库）', '✅ 即时'],
                ['私有领域知识', '✅ 深度融入模型', '✅ 可注入上下文', '⚠️ 需全文塞入'],
                ['输出风格/格式', '✅ 稳定一致', '⚠️ 依赖 Prompt', '⚠️ 不稳定'],
                ['推理成本', '✅ 无额外检索', '⚠️ 多一次检索', '✅ 最低'],
                ['数据需求', '⚠️ 需要训练数据', '✅ 原始文档即可', '✅ 零数据'],
                ['典型场景', '医疗/法律垂直模型', '企业知识库问答', '通用助手调优'],
              ].map(([d, ft, rag, pe], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d}</td>
                  <td style={{ color: 'var(--ft-muted)', fontSize: '0.83rem' }}>{ft}</td>
                  <td style={{ color: 'var(--ft-muted)', fontSize: '0.83rem' }}>{rag}</td>
                  <td style={{ color: 'var(--ft-muted)', fontSize: '0.83rem' }}>{pe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ft-insight">
          🎯 <strong>经验法则</strong>：先试 Prompt Engineering → 效果不够加 RAG → 仍无法满足才微调。微调的核心价值是<strong>改变模型行为方式</strong>（风格/格式/领域推理），而不是注入新知识（RAG 更擅长）。
        </div>
      </div>

      {/* PEFT Methods */}
      <div className="ft-section">
        <div className="ft-section-title">🔬 PEFT 方法全景对比</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {METHODS.map(mt => (
            <button key={mt.key} className={`ft-btn ${method === mt.key ? 'active' : ''}`}
              style={{ borderColor: method === mt.key ? mt.color : undefined, color: method === mt.key ? mt.color : undefined }}
              onClick={() => setMethod(mt.key)}>
              {mt.icon} {mt.name}
            </button>
          ))}
        </div>
        <div className="ft-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="ft-card" style={{ borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: m.color, marginBottom: '0.5rem' }}>{m.icon} {m.name}</div>
            <div style={{ color: 'var(--ft-muted)', fontSize: '0.87rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>{m.desc}</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="ft-tag rose">可训练参数：{m.params}</span>
              <span className="ft-tag indigo">显存：{m.memory}</span>
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--ft-muted)', marginTop: '0.5rem' }}>
              <span style={{ color: m.color, fontWeight: 700 }}>最佳场景：</span> {m.best}
            </div>
          </div>
          <div className="ft-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ft-violet)', marginBottom: '0.75rem' }}>📊 各方法参数效率对比</div>
            {METHODS.map((mt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 70, fontSize: '0.78rem', color: 'var(--ft-muted)', flexShrink: 0 }}>{mt.name}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: mt.color,
                    width: mt.key === 'full' ? '100%' : mt.key === 'adapter' ? '20%' : mt.key === 'lora' || mt.key === 'qlora' ? '8%' : mt.key === 'prefix' ? '4%' : '2%',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ width: 50, fontSize: '0.75rem', color: 'var(--ft-muted)', textAlign: 'right' }}>{mt.params}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision tree */}
      <div className="ft-section">
        <div className="ft-section-title">🌳 方法选择决策树</div>
        <div className="ft-card">
          <div className="ft-steps">
            {DECISION.map((d, i) => (
              <div key={i} className="ft-step">
                <div className="ft-step-num">{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ft-text)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>？ {d.q}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--ft-muted)' }}>
                    <span style={{ color: 'var(--ft-pink)' }}>是 → </span>{d.yes}
                    <span style={{ margin: '0 0.5rem', color: 'var(--ft-muted)' }}>|</span>
                    <span style={{ color: 'var(--ft-violet)' }}>否 → </span>{d.no}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ft-grid-4" style={{ marginTop: '1.25rem' }}>
          {[
            { v: '0.1%', l: '最少可训练参数（IA³）' },
            { v: '10x', l: 'QLoRA 显存节省（vs 全量）' },
            { v: '1000条', l: 'LoRA 起步数据量下限' },
            { v: '3~5%', l: '垂直领域 LoRA 典型提升' },
          ].map((s, i) => (
            <div key={i} className="ft-metric">
              <div className="ft-metric-val">{s.v}</div>
              <div className="ft-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
