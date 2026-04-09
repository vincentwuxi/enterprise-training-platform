import { useState } from 'react';
import './LessonCommon.css';

const METHODS = [
  {
    key: 'prompt', name: 'Prompt Engineering', icon: '💬',
    cost: '零', speed: '即时', quality: 55, control: 30, data: '0条',
    when: '任务通用、模型已够好、无私有数据',
    limit: '模型能力上限、风格不可控、长 Prompt 成本高',
    verdict: '快速验证 PoC，但无法达到专有领域专家水平',
  },
  {
    key: 'rag', name: 'RAG 检索增强', icon: '🔍',
    cost: '低', speed: '快', quality: 72, control: 55, data: '文档',
    when: '频繁更新的知识库、引用型回答、企业知识问答',
    limit: '检索质量决定上限、复杂推理弱、格式控制差',
    verdict: '知识注入首选，无法改变模型的推理风格和世界观',
  },
  {
    key: 'sft', name: 'SFT 指令微调', icon: '🎯',
    cost: '中', speed: '数小时', quality: 88, control: 82, data: '500-5000条',
    when: '特定风格输出、垂直领域专家、格式严格要求',
    limit: '需要高质量数据、可能遗忘通用能力（灾难性遗忘）',
    verdict: '最常用的微调方式，掌握后可解决 80% 的定制化需求',
  },
  {
    key: 'dpo', name: 'DPO 偏好对齐', icon: '⚖️',
    cost: '中高', speed: '数小时+', quality: 92, control: 88, data: 'Chosen/Rejected 对',
    when: 'SFT 后仍需输出更安全/更符合价值观/更高质量',
    limit: '偏好数据难以构建，训练不稳定',
    verdict: 'SFT 之后的进阶对齐手段，让模型"知道什么是好答案"',
  },
  {
    key: 'full', name: '全参数微调', icon: '🔥',
    cost: '极高', speed: '数天', quality: 96, control: 95, data: '10万+',
    when: '预训练新模型、根本性改变模型能力（语言切换/领域预训练）',
    limit: '需要 8+ GPU、大量数据、很少有必要',
    verdict: '99% 场景用不到，除非你在做大规模领域继续预训练',
  },
];

const MODELS = [
  { name: 'Llama 3.1 8B', org: 'Meta', params: '8B', ctx: '128K', lang: '多语言', license: '宽松商用', best: '通用指令/代码', rank: 92, vram: '6GB(4-bit)' },
  { name: 'Qwen2.5 7B', org: 'Alibaba', params: '7B', ctx: '128K', lang: '中文优秀', license: 'Apache 2.0', best: '中文/代码/数学', rank: 91, vram: '5GB(4-bit)' },
  { name: 'Mistral 7B v0.3', org: 'Mistral', params: '7B', ctx: '32K', lang: '英文为主', license: 'Apache 2.0', best: '英文通用/RAG', rank: 88, vram: '5GB(4-bit)' },
  { name: 'Gemma 2 9B', org: 'Google', params: '9B', ctx: '8K', lang: '多语言', license: '宽松商用', best: '指令遵循', rank: 90, vram: '6GB(4-bit)' },
  { name: 'Phi-3.5 Mini', org: 'Microsoft', params: '3.8B', ctx: '128K', lang: '多语言', license: 'MIT', best: '资源受限/边缘推理', rank: 84, vram: '3GB(4-bit)' },
  { name: 'DeepSeek-R1 7B', org: 'DeepSeek', params: '7B', ctx: '64K', lang: '中英双语', license: 'MIT', best: '数学/推理', rank: 93, vram: '5GB(4-bit)' },
];

export default function LessonFTIntro() {
  const [method, setMethod] = useState('sft');
  const [modelTab, setModelTab] = useState(0);
  const m = METHODS.find(x => x.key === method);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块一 · Fine-tuning Fundamentals</div>
          <h1>微调原理与开源模型生态</h1>
          <p>为什么你需要微调？什么时候 Prompt 够用、什么时候必须微调？主流开源模型怎么选？本模块帮你建立微调的完整认知框架。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: 'LoRA', l: '最常用方法' }, { v: '4-bit', l: 'QLoRA 量化训练' }, { v: '8B', l: '单 GPU 可微调' }, { v: '500+', l: '数据起步条数' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Method Comparison */}
        <div className="ft-section">
          <h2>⚖️ 五种定制化方法对比</h2>
          <div className="ft-tabs">
            {METHODS.map(x => <button key={x.key} className={`ft-tab${method === x.key ? ' active' : ''}`} onClick={() => setMethod(x.key)}>{x.icon} {x.name.split(' ')[0]}</button>)}
          </div>
          {m && (
            <div>
              <div className="ft-grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  {[['输出质量', m.quality], ['行为控制', m.control]].map(([label, val]) => (
                    <div key={label} className="ft-bar-row">
                      <span className="ft-bar-label">{label}</span>
                      <div className="ft-bar-track"><div className="ft-bar-fill" style={{ width: `${val}%` }} /></div>
                      <span className="ft-bar-val">{val}/100</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
                    <span className="ft-tag">💰 成本：{m.cost}</span>
                    <span className="ft-tag blue">⏱ 时间：{m.speed}</span>
                    <span className="ft-tag purple">📦 数据：{m.data}</span>
                  </div>
                </div>
                <div className="ft-card">
                  <div className="ft-card-title" style={{ color: 'var(--ft-green)' }}>✅ 适合场景</div>
                  <div className="ft-card-body">{m.when}</div>
                  <div className="ft-card-title" style={{ color: 'var(--ft-rose)', marginTop: '.75rem' }}>⚠️ 局限性</div>
                  <div className="ft-card-body">{m.limit}</div>
                </div>
              </div>
              <div className="ft-tip">🎯 <span><strong>结论：</strong>{m.verdict}</span></div>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="ft-section">
          <h2>🤖 主流开源小模型选型指南（2025年）</h2>
          <div className="ft-tabs" style={{ marginBottom: '0.75rem' }}>
            {MODELS.map((mod, i) => <button key={i} className={`ft-tab${modelTab === i ? ' active' : ''}`} onClick={() => setModelTab(i)}>{mod.name.split(' ')[0]}</button>)}
          </div>
          {(() => {
            const mod = MODELS[modelTab];
            return (
              <div className="ft-card" style={{ borderColor: 'var(--ft-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{mod.name}</div>
                    <div style={{ color: 'var(--ft-muted)', fontSize: '.83rem' }}>by {mod.org}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ft-primary)', fontFamily: 'JetBrains Mono,monospace' }}>{mod.rank}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--ft-muted)' }}>综合评分</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span className="ft-tag">参数：{mod.params}</span>
                  <span className="ft-tag blue">上下文：{mod.ctx}</span>
                  <span className="ft-tag green">显存：{mod.vram}</span>
                  <span className="ft-tag purple">协议：{mod.license}</span>
                </div>
                <div className="ft-grid-2">
                  <div><div style={{ fontSize: '.78rem', color: 'var(--ft-muted)', marginBottom: '.3rem' }}>语言支持</div><div style={{ fontSize: '.9rem' }}>{mod.lang}</div></div>
                  <div><div style={{ fontSize: '.78rem', color: 'var(--ft-muted)', marginBottom: '.3rem' }}>最佳使用场景</div><div style={{ fontSize: '.9rem', color: 'var(--ft-accent)' }}>{mod.best}</div></div>
                </div>
              </div>
            );
          })()}
          <div className="ft-table-wrap" style={{ marginTop: '1.25rem' }}>
            <table className="ft-table">
              <thead><tr><th>模型</th><th>参数</th><th>中文</th><th>最低显存</th><th>协议</th><th>推荐指数</th></tr></thead>
              <tbody>
                {MODELS.map((mod, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setModelTab(i)}>
                    <td style={{ fontWeight: 600 }}>{mod.name}</td>
                    <td><span className="ft-tag">{mod.params}</span></td>
                    <td>{mod.lang.includes('中') ? '✅' : '—'}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--ft-cyan)', fontSize: '.82rem' }}>{mod.vram}</td>
                    <td><span className="ft-tag green">{mod.license}</span></td>
                    <td>{'⭐'.repeat(Math.round(mod.rank / 20))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ft-tip">💡 <span><strong>快速决策：</strong>中文任务 → <strong>Qwen2.5 7B</strong>；英文通用 → <strong>Llama 3.1 8B</strong>；资源受限 → <strong>Phi-3.5 Mini</strong>；推理/数学 → <strong>DeepSeek-R1 7B</strong></span></div>
        </div>

        {/* Finetune Decision Flow */}
        <div className="ft-section">
          <h2>🗺️ 微调决策流程</h2>
          <div className="ft-code">{`Q1: 基础模型是否已能完成任务（Prompt 测试）？
  → 是：用 Prompt Engineering，不要过度工程
  → 否：继续 Q2

Q2: 是否主要是"知识"不够（缺少私有数据）？
  → 是：优先考虑 RAG（更新快、引用可查）
  → 否：继续 Q3

Q3: 数据量多少？
  → < 100条：先用 GPT-4 合成数据到 500+ 条
  → 500-5000条：SFT（LoRA/QLoRA）
  → > 5000条：SFT + DPO 对齐

Q4: GPU 资源？
  → 单卡 RTX 3090/4090 (24GB)：QLoRA 4-bit，可微调 70B 以内
  → Google Colab Pro (15GB)：   QLoRA 4-bit，轻松微调 7-13B
  → A100 (80GB)：               LoRA bf16，或全参数 7B

Q5: 生产部署要求？
  → 边缘/私有化：量化 GGUF + Ollama
  → 高并发 API：vLLM + OpenAI 兼容接口
  → 快速原型：Gradio / Streamlit`}</div>
        </div>

      </div>
    </div>
  );
}
