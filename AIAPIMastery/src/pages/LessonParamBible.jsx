import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// ── 交互式 Temperature 实验台 ──
function TemperatureExperiment() {
  const [temp, setTemp] = useState(0.7);
  const outputs = {
    0:   ['中国的首都是北京。', '中国的首都是北京。', '中国的首都是北京。'],
    0.3: ['中国的首都是北京，位于华北平原。', '中国的首都是北京市。', '中国的首都是北京，简称"京"。'],
    0.7: ['中国首都是北京——一座有三千多年建城史的古都，也是现代中国的政治中心。', '北京是中国的首都，它承载着数千年的历史文明。', '中国的首都北京，融合了皇城文化与现代都市的活力。'],
    1.0: ['北京，这座龙盘虎踞的城市，从元大都到现代首都，见证了无数王朝更迭。', '如果说每座城市都有灵魂，那北京的灵魂大概住在紫禁城的琉璃瓦下。', '京城——三千年古都，两千万人口，一个不眠的未来都市实验场。'],
    1.5: ['想象一座城市，它的地铁在地下如毛细血管延展，胡同里藏着烤鸭和诗人，这就是北京。', '皇帝走了，宫殿留下了。摩天楼起来了，胡同还在。北京就是这样一座矛盾又迷人的城市。', '北京？那是一壶老酒配着新酿的咖啡——CBD的光投射在四合院的灰墙上，时间在这里学会了折叠。'],
  };
  const key = Object.keys(outputs).reduce((a, b) => Math.abs(b - temp) < Math.abs(a - temp) ? b : a);
  const emoji = temp <= 0.3 ? '🧊' : temp <= 0.7 ? '⚖️' : temp <= 1.0 ? '🔥' : '🌋';

  return (
    <div className="ai-interactive">
      <h3>🌡️ Temperature 实验台：同一提示，不同输出</h3>
      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.75rem' }}>Prompt: "中国的首都是哪里？"</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <input type="range" min={0} max={1.5} step={0.1} value={temp}
          onChange={e => setTemp(Number(e.target.value))}
          style={{ flex: 1, accentColor: temp <= 0.3 ? '#3b82f6' : temp <= 0.7 ? '#8b5cf6' : temp <= 1.0 ? '#f97316' : '#ef4444' }} />
        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, fontSize: '1.4rem', minWidth: 55, color: temp <= 0.3 ? '#3b82f6' : temp <= 0.7 ? '#8b5cf6' : temp <= 1.0 ? '#f97316' : '#ef4444' }}>
          {emoji} {temp.toFixed(1)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(outputs[key] || outputs[0.7]).map((out, i) => (
          <div key={i} style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: '8px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.7 }}>
            <div style={{ fontSize: '0.65rem', color: '#475569', marginBottom: '0.3rem' }}>Run {i + 1}</div>
            {out}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#475569', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span>🧊 0.0 = 确定性（每次相同）</span>
        <span>⚖️ 0.7 = 平衡（生产推荐）</span>
        <span>🔥 1.0 = 创意</span>
        <span>🌋 1.5 = 实验性</span>
      </div>
    </div>
  );
}

// ── 交互式 top_p vs temperature 对比 ──
function SamplingViz() {
  const [mode, setMode] = useState('temp');
  return (
    <div className="ai-interactive">
      <h3>🎲 采样策略对比：Temperature vs Top-P vs Top-K</h3>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'temp', label: 'Temperature', color: '#8b5cf6' },
          { key: 'topp', label: 'Top-P (Nucleus)', color: '#3b82f6' },
          { key: 'topk', label: 'Top-K', color: '#f97316' },
        ].map(m => (
          <button key={m.key} className={`ai-btn ${mode === m.key ? 'primary' : ''}`}
            onClick={() => setMode(m.key)}
            style={mode !== m.key ? { opacity: 0.5 } : {}}>{m.label}</button>
        ))}
      </div>

      {mode === 'temp' && (
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 2.2, background: '#05050f', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre' }}>
{`# Temperature 原理：缩放 logits 后做 softmax
# logits = [2.0, 1.5, 0.3, 0.1, -0.5]  （模型原始输出）

# temperature = 0.1（接近 argmax）:
# probs = softmax([20.0, 15.0, 3.0, 1.0, -5.0])
# → [0.99, 0.01, 0.00, 0.00, 0.00]  ← 几乎确定选第一个

# temperature = 1.0（原始分布）:
# probs = softmax([2.0, 1.5, 0.3, 0.1, -0.5])
# → [0.42, 0.25, 0.08, 0.06, 0.03]  ← 有概率选其他

# temperature = 2.0（扁平化）:
# probs = softmax([1.0, 0.75, 0.15, 0.05, -0.25])
# → [0.28, 0.22, 0.12, 0.11, 0.08]  ← 分布变均匀

# 数学本质：P(token) = softmax(logit / temperature)
# temperature↓ → 分布越尖锐 → 越确定
# temperature↑ → 分布越扁平 → 越随机`}
        </div>
      )}

      {mode === 'topp' && (
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 2.2, background: '#05050f', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre' }}>
{`# Top-P (Nucleus Sampling)：只从累积概率前 P% 的 token 中采样
# probs（已排序）= [0.42, 0.25, 0.15, 0.08, 0.06, 0.04]

# top_p = 0.5:
# 累积: 0.42 → 还不够 → 加 0.25 → 0.67 > 0.5 ✅
# 候选集 = [token1, token2]  ← 只从这两个里选
# → 高频词加极少量变化

# top_p = 0.9:
# 累积: 0.42+0.25+0.15+0.08 = 0.90 ≥ 0.9 ✅
# 候选集 = [token1, token2, token3, token4]
# → 更多候选，更丰富

# top_p = 1.0:
# → 所有 token 都是候选（等同关闭）

# ⚠️ 注意：OpenAI 官方建议不要同时调 temperature 和 top_p
# 调一个就好！两个同时调会有不可预测的交互效应
# Claude 没有 top_p，用 temperature 即可
# Gemini 两个都支持，还额外支持 top_k`}
        </div>
      )}

      {mode === 'topk' && (
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 2.2, background: '#05050f', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre' }}>
{`# Top-K：只从概率最高的 K 个 token 中采样
# probs = [0.42, 0.25, 0.15, 0.08, 0.06, 0.04]（已排序）

# top_k = 1: 只选第一个（= greedy decoding/argmax）
# top_k = 3: 从前 3 个中按概率采样
# top_k = 40: Gemini 默认值，从前 40 个中选

# vs Top-P 的区别：
# Top-K：固定数量，忽略概率分布形状
# Top-P：根据概率动态调整数量
#
# 例：如果第一个 token 概率 = 0.95
# Top-K=10: 仍然从 10 个中选（浪费）
# Top-P=0.9: 只选 1 个（因为 0.95 > 0.9）
#
# 结论：Top-P 通常优于 Top-K
# ┌───────────┬──────────────────┬───────────────┐
# │ 平台       │ 支持的采样参数     │ 推荐           │
# ├───────────┼──────────────────┼───────────────┤
# │ OpenAI    │ temperature, top_p│ 调 temp 即可   │
# │ Gemini    │ temp, top_p, top_k│ temp + top_k  │
# │ Claude    │ temperature, top_k│ 调 temp 即可   │
# └───────────┴──────────────────┴───────────────┘`}
        </div>
      )}
    </div>
  );
}

const PARAM_CODE = `# ━━━━ API 参数百科全书（三平台完整对照）━━━━

# ════════════════════════════════════════════
# 1. 生成控制参数（最核心！）
# ════════════════════════════════════════════

# ── temperature ──────────────────────────────
# 控制随机性，值越高越随机
# OpenAI:  0 ~ 2（默认 1）
# Gemini:  0 ~ 2（默认 1）
# Claude:  0 ~ 1（默认 1！Claude 最高只到 1）
# ⚠️ Claude 的 temperature=1 约等于 OpenAI 的 0.7
#
# 最佳实践：
# 代码生成:    0.0 ~ 0.2
# 数据提取:    0.0
# 客服问答:    0.3 ~ 0.5
# 通用对话:    0.7
# 创意写作:    0.9 ~ 1.0
# 头脑风暴:    1.0 ~ 1.5（OpenAI/Gemini 才支持超过 1）

# ── max_tokens / max_output_tokens ──────────
# 限制输出最大 Token 数（直接影响成本！）
# OpenAI:  max_tokens=4096    (或 max_completion_tokens)
# Gemini:  max_output_tokens=2048
# Claude:  max_tokens=4096    (必填！)
#
# ⚠️ Claude 的 max_tokens 是必填参数（不像 OpenAI 有默认值）
# ⚠️ 设置过小会导致输出被截断（finish_reason = "length"）
# 💡 估算 Token：中文 ≈ 1.5 token/字，英文 ≈ 0.75 token/词

# ── top_p (nucleus sampling) ─────────────────
# 从累积概率前 P% 的 token 中采样
# OpenAI:  0 ~ 1（默认 1）   ← 支持
# Gemini:  0 ~ 1（默认 0.95）← 支持
# Claude:  0 ~ 1（默认 0.999）← 支持（2024.10 新增）
#
# ⚠️ OpenAI 官方：「不要同时调 temperature 和 top_p」
# 推荐：只调一个，另一个保持默认值

# ── top_k ────────────────────────────────────
# 只从概率最高的 K 个 token 中选
# OpenAI:  ❌ 不支持
# Gemini:  1 ~ 100（默认 40）
# Claude:  0 ~ 500（默认不设置）

# ── frequency_penalty ────────────────────────
# 降低已出现 token 再次出现的概率，值越大惩罚越重
# OpenAI:  -2 ~ 2（默认 0）
# Gemini:  ❌ 不支持（用 presence_penalty 替代）
# Claude:  ❌ 不支持
#
# 用途：避免模型反复说同一句话
# 0.0 = 不惩罚, 0.5 = 轻微惩罚, 1.5 = 强力惩罚

# ── presence_penalty ─────────────────────────
# 鼓励模型引入新主题（已出现的 token 被惩罚）
# OpenAI:  -2 ~ 2（默认 0）
# Gemini:  -2 ~ 2（默认 0）
# Claude:  ❌ 不支持
#
# vs frequency_penalty:
# frequency = 出现越多次，惩罚越大（线性）
# presence  = 只要出现过，就一次性惩罚（二值）

# ══════════════════════════════════════════════
# 2. 推理/思维链参数（2025 新特性！）
# ══════════════════════════════════════════════

# ── OpenAI Reasoning（o1/o3/o4-mini 系列）──
# reasoning_effort: "low" | "medium" | "high"
# → 控制模型思考的深度
# 
# resp = client.chat.completions.create(
#     model="o4-mini",
#     reasoning_effort="high",         # 复杂数学: high
#     max_completion_tokens=25000,      # o 系列用这个代替 max_tokens
#     messages=[...]
# )
# 
# output.reasoning_content  ← 思维链过程（仅部分返回）

# ── Claude Extended Thinking ──
# thinking.budget_tokens: 1024 ~ 128000
# → 分配给思考过程的 Token 预算
#
# resp = client.messages.create(
#     model="claude-sonnet-4-20250514",
#     max_tokens=16000,
#     thinking={
#         "type": "enabled",
#         "budget_tokens": 10000       # 思考预算
#     },
#     messages=[...]
# )
# 
# resp.content[0].type == "thinking"  ← 完整思维链！
# resp.content[1].type == "text"      ← 最终答案

# ── Gemini Thinking（2.5 Pro/Flash）──
# thinking_config.thinking_budget: 0 ~ 24576
#
# model = genai.GenerativeModel(
#     "gemini-2.5-flash",
#     generation_config={
#         "thinking_config": {
#             "thinking_budget": 8192  # 思考 Token 预算
#         }
#     }
# )
# 
# resp.candidates[0].content.parts[0].thought == True  ← 思考部分
# resp.candidates[0].content.parts[1].text             ← 最终答案

# ══════════════════════════════════════════════
# 3. 结构化输出参数
# ══════════════════════════════════════════════

# ── OpenAI JSON Mode ──
# response_format={"type": "json_object"}       # 强制 JSON
# response_format={"type": "json_schema", "json_schema": {...}}  # 严格 Schema

# ── OpenAI Structured Output（推荐！）──
# from pydantic import BaseModel
# class CalendarEvent(BaseModel):
#     name: str
#     date: str
#     participants: list[str]
#
# resp = client.beta.chat.completions.parse(
#     model="gpt-4o",
#     response_format=CalendarEvent,   # Pydantic 模型直接传！
#     messages=[...]
# )
# event = resp.choices[0].message.parsed  # → CalendarEvent 对象

# ── Gemini JSON Mode ──
# generation_config={"response_mime_type": "application/json"}     # 简单 JSON
# generation_config={
#     "response_mime_type": "application/json",
#     "response_schema": {                              # 严格 Schema
#         "type": "object",
#         "properties": {
#             "name": {"type": "string"},
#             "score": {"type": "number"}
#         }
#     }
# }

# ── Claude JSON Mode ──
# Claude 没有 response_format 参数！
# 但可以通过 Prompt 强制 JSON：
# system = "只返回 JSON 格式，不要有任何额外文字。"
# 或者在 content 末尾用 prefill：
# messages=[
#     {"role": "user",      "content": "提取人名..."},
#     {"role": "assistant", "content": "{"}     # prefill 引导
# ]

# ══════════════════════════════════════════════
# 4. 输入/输出优化参数
# ══════════════════════════════════════════════

# ── seed（可复现性）──
# OpenAI:  seed=42              ← 支持（但不保证 100% 一致）
# Gemini:  seed=42              ← 支持（generation_config 内）
# Claude:  ❌ 不支持

# ── stop sequences（停止词）──
# OpenAI:  stop=["\\n", "END"]   ← 遇到就停止
# Gemini:  stop_sequences=["END"]
# Claude:  stop_sequences=["\\n\\nHuman:"]
# 用途：限制输出范围，比如只生成一行

# ── logprobs（对数概率）──
# OpenAI:  logprobs=True, top_logprobs=5  ← 返回每个 token 的概率
# Gemini:  ❌ 不支持
# Claude:  ❌ 不支持
# 用途：评估模型确信度、做分类阈值

# ── n（多路生成）──
# OpenAI:  n=3   ← 一次生成 3 个候选回答
# Gemini:  candidate_count=3
# Claude:  ❌ 不支持（手动调用多次）

# ── stream（流式输出）──
# OpenAI:  stream=True          ← SSE 流
# Gemini:  stream=True          ← GenerateContentResponse 迭代
# Claude:  用 client.messages.stream() 上下文管理器

# ══════════════════════════════════════════════
# 5. 安全 & 审核参数
# ══════════════════════════════════════════════

# ── OpenAI Moderation ──
# 单独的内容审核 API
# resp = client.moderations.create(input="...")
# resp.results[0].flagged  → True/False
# resp.results[0].categories.violence  → True/False

# ── Gemini Safety Settings ──
# safety_settings=[
#     {"category": "HARM_CATEGORY_HATE_SPEECH", 
#      "threshold": "BLOCK_LOW_AND_ABOVE"}     # 最严格
#      # BLOCK_NONE / BLOCK_LOW_AND_ABOVE / BLOCK_MEDIUM_AND_ABOVE / BLOCK_ONLY_HIGH
# ]
# ⚠️ Gemini 被安全过滤时 response.text 会抛异常

# ── Claude Content Policy ──
# Claude 没有显式安全参数（内置策略）
# 被拒绝时 stop_reason = "stop" 但内容是拒绝回复`;

export default function LessonParamBible() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ai">
      <div className="ai-badge blue">📖 module_09 — 参数百科全书</div>
      <div className="ai-hero">
        <h1>API 参数百科全书：三平台完整对照 & 调优实验</h1>
        <p>所有参数一网打尽——<strong>temperature / top_p / top_k 的数学原理与实战区别，Reasoning/Thinking 推理参数，结构化输出，安全审核，以及每个参数在 OpenAI / Gemini / Claude 三平台的差异对照</strong>。</p>
      </div>

      <TemperatureExperiment />
      <SamplingViz />

      <div className="ai-section">
        <h2 className="ai-section-title">📖 三平台 API 参数完整对照</h2>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#10b981' }} /><div className="ai-code-dot" style={{ background: '#f97316' }} /><div className="ai-code-dot" style={{ background: '#f59e0b' }} /><span style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>📖 parameter_bible.py</span></div>
          <div className="ai-code" style={{ maxHeight: 520, overflowY: 'auto' }}>{PARAM_CODE}</div>
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">🗺️ 参数速查表</h2>
        <div className="ai-card" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
          <table className="ai-table">
            <thead>
              <tr>
                <th>参数</th>
                <th style={{ color: '#10b981' }}>OpenAI</th>
                <th style={{ color: '#f97316' }}>Gemini</th>
                <th style={{ color: '#f59e0b' }}>Claude</th>
                <th>推荐值</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['temperature', '0~2 (默认1)', '0~2 (默认1)', '0~1 (默认1)', '代码0/对话0.7/创意1.0'],
                ['max_tokens', '可选 (默认模型最大)', 'max_output_tokens', '必填！', '按需设置，省成本'],
                ['top_p', '0~1 (默认1)', '0~1 (默认0.95)', '0~1 (默认0.999)', '不要和 temp 同时调！'],
                ['top_k', '❌ 不支持', '1~100 (默认40)', '0~500', 'Gemini: 40'],
                ['frequency_penalty', '-2~2', '❌', '❌', 'OpenAI: 0~0.5'],
                ['presence_penalty', '-2~2', '-2~2', '❌', '0 或 0.3'],
                ['seed', '✅', '✅', '❌', '42（调试用）'],
                ['stop', '✅ (最多4个)', '✅ stop_sequences', '✅ stop_sequences', '按场景'],
                ['logprobs', '✅ top_logprobs', '❌', '❌', '分类任务用'],
                ['n / candidate_count', '✅ n=3', '✅ candidate_count', '❌', '择优选择'],
                ['stream', '✅', '✅', '✅ (messages.stream)', '生产必开'],
                ['JSON Mode', '✅ response_format', '✅ response_mime_type', '❌ (用 prefill)', 'OpenAI最稳'],
                ['Thinking/Reasoning', '✅ reasoning_effort', '✅ thinking_budget', '✅ budget_tokens', '复杂推理用'],
              ].map(([param, oai, gem, claude, rec]) => (
                <tr key={param}>
                  <td style={{ fontWeight: 700, color: '#a78bfa', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{param}</td>
                  <td style={{ fontSize: '0.72rem', color: '#10b981' }}>{oai}</td>
                  <td style={{ fontSize: '0.72rem', color: '#f97316' }}>{gem}</td>
                  <td style={{ fontSize: '0.72rem', color: '#f59e0b' }}>{claude}</td>
                  <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">🧠 2025 推理模型参数</h2>
        <div className="ai-grid-3">
          {[
            { name: 'OpenAI o4-mini', param: 'reasoning_effort', values: 'low / medium / high', note: '控制思考深度，high 消耗更多 token', color: '#10b981' },
            { name: 'Claude Sonnet 4', param: 'thinking.budget_tokens', values: '1024 ~ 128000', note: '完整思维链对外公开，可调试推理过程', color: '#f59e0b' },
            { name: 'Gemini 2.5 Flash', param: 'thinking_budget', values: '0 ~ 24576', note: '思考预算，0=关闭思考', color: '#f97316' },
          ].map(m => (
            <div key={m.name} className="ai-card" style={{ borderColor: `${m.color}25` }}>
              <div style={{ fontWeight: 800, color: m.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{m.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#a78bfa', marginBottom: '0.2rem' }}>{m.param}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.15rem' }}>范围: {m.values}</div>
              <div style={{ fontSize: '0.68rem', color: '#475569' }}>💡 {m.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/production')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/responses-api')}>下一模块：2025 新 API →</button>
      </div>
    </div>
  );
}
