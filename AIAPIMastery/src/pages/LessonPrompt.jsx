import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 交互式 Prompt 工坊
const PROMPT_TEMPLATES = [
  {
    name: 'Zero-shot',
    color: '#64748b',
    system: '你是一位专业的代码审阅者。',
    user: '审阅以下 Python 代码，指出问题：\n\ndef divide(a, b):\n    return a / b',
    desc: '无示例，直接让模型完成任务。适合简单任务，效果较不稳定。',
    quality: 60,
  },
  {
    name: 'Few-shot',
    color: '#3b82f6',
    system: '你是一位专业的代码审阅者。',
    user: `用户: 审阅 def add(a,b): return a+b
助手: 建议: 1. 缺少类型提示 2. 缺少文档字符串 → 改为 def add(a: int, b: int) -> int: """..."""

用户: 审阅 def divide(a, b): return a / b
助手:`,
    desc: '给出1-3个示例再让模型完成，格式更稳定，适合结构化输出。',
    quality: 78,
  },
  {
    name: 'Chain-of-Thought',
    color: '#8b5cf6',
    system: '你是专业代码审阅者。审阅时请逐步分析：1)功能理解 2)错误检查 3)性能分析 4)给出改进建议。',
    user: '请逐步审阅以下代码（先理解功能，再找问题，最后给建议）：\n\ndef divide(a, b):\n    return a / b\n\n请一步步分析：',
    desc: '引导模型逐步推理（"Let me think step by step"），适合复杂推理任务。',
    quality: 90,
  },
  {
    name: 'Role + Context',
    color: '#10b981',
    system: '你是一位有15年经验的 Google 高级工程师，专注于代码审阅。公司标准：① 必须有类型提示 ② 必须处理异常 ③ 必须有文档字符串 ④ 遵循 PEP8。',
    user: '按照公司代码审阅标准，审阅以下代码。输出格式：\n**问题级别**: [严重/警告/建议]\n**问题**: ...\n**修复方案**: ...\n\n代码：\ndef divide(a, b):\n    return a / b',
    desc: '赋予具体角色 + 背景 + 明确输出格式。效果最好，生产环境推荐。',
    quality: 96,
  },
];

function PromptWorkshop() {
  const [active, setActive] = useState(0);
  const pt = PROMPT_TEMPLATES[active];

  return (
    <div className="ai-interactive">
      <h3>🔬 Prompt 工坊：四大技术效果对比</h3>
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {PROMPT_TEMPLATES.map((p, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ flex: 1, minWidth: 80, padding: '0.5rem 0.625rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              border: `1px solid ${active === i ? p.color + '60' : 'rgba(255,255,255,0.07)'}`,
              background: active === i ? `${p.color}12` : 'rgba(255,255,255,0.02)',
              fontWeight: active === i ? 800 : 500, color: active === i ? p.color : '#64748b', fontSize: '0.75rem' }}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ai-progress" style={{ flex: 1, height: 8 }}>
          <div className="ai-progress-fill" style={{ width: `${pt.quality}%`, background: pt.color }} />
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: pt.color, fontSize: '0.85rem', minWidth: 60 }}>
          效果 {pt.quality}%
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.625rem' }}>{pt.desc}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>SYSTEM PROMPT</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '6px', padding: '0.4rem 0.625rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{pt.system}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>USER MESSAGE</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#60a5fa', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '6px', padding: '0.4rem 0.625rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{pt.user}</div>
        </div>
      </div>
    </div>
  );
}

const PROMPT_CODE = `# Prompt Engineering 全套技巧代码

# ── 1. 结构化输出（XML 标签法 —— Claude 尤其喜欢）──
SYSTEM = """
你是数据提取专家。从用户提供的文本中提取结构化信息。
输出格式：
<persons>
  <person>
    <name>姓名</name>
    <role>职位</role>
    <company>公司</company>
  </person>
</persons>
"""

# ── 2. Chain-of-Thought（思维链）——提升推理质量 ──
COT_PROMPT = """
分析以下商业决策，并给出建议。

请按以下步骤思考：
<thinking>
1. 识别关键利益相关者
2. 分析风险和机会
3. 评估短期 vs 长期影响
4. 考虑竞争对手可能的反应
</thinking>

<conclusion>
基于以上分析，我的建议是：
</conclusion>

问题：是否应该进入新的东南亚市场？
"""

# ── 3. Few-shot 生成（专门设计示例）──
FEW_SHOT = """
将以下产品评论分类为：正面/中性/负面

评论: "物流很快，包装完善，产品和描述一致"
分类: 正面

评论: "价格偏高，但质量确实不错"
分类: 中性

评论: "收到时包装破损，客服态度差"
分类: 负面

评论: "颜色和图片不符，但尺码准确"
分类:"""   # 模型补全这里

# ── 4. Prompt 模板化（利用 Jinja2 或 f-string）──
from string import Template

REVIEW_TEMPLATE = Template("""
你是专业的 $role。
今天是 $date，你正在审阅来自 $department 部门的申请。

申请内容：
$content

请按以下维度评估（各10分）：
- 可行性：
- 投资回报率：
- 风险：
总评：
""")

prompt = REVIEW_TEMPLATE.substitute(
    role="投资分析师",
    date="2025年1月",
    department="产品",
    content="申请开发新功能，预计3个月，成本50万"
)

# ── 5. 自动 Prompt 优化（DSPy 思路）──
import openai

def optimize_prompt(original_prompt: str, examples: list[dict]) -> str:
    """利用 GPT 本身来优化 Prompt"""
    meta_prompt = f"""
    以下是一个 Prompt：
    {original_prompt}
    
    测试失败案例：
    {examples}
    
    请分析失败原因，并改写这个 Prompt，让它更清晰、更不容易被误解。
    只返回改写后的 Prompt，不要有任何解释。
    """
    resp = openai.OpenAI().chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": meta_prompt}]
    )
    return resp.choices[0].message.content

# ── 6. Temperature 调优指南 ──
TEMPERATURE_GUIDE = {
    0.0:  "代码生成、SQL、提取结构化数据（确定性最高）",
    0.3:  "问答、摘要、翻译（稍有变化）",
    0.7:  "对话助手（平衡）",
    1.0:  "创意写作、brainstorming",
    1.5:  "诗歌、实验性创作（谨慎使用）",
}`;

export default function LessonPrompt() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ai">
      <div className="ai-badge">🎨 module_05 — Prompt Engineering</div>
      <div className="ai-hero">
        <h1>Prompt Engineering：CoT / Few-shot / 结构化输出 / 模板化</h1>
        <p>Prompt 的质量直接决定输出质量。<strong>Zero-shot → Few-shot → Chain-of-Thought → Role+Context</strong> 是效果递增的四个层次。生产环境中 Prompt 必须版本化管理，并通过 A/B 测试持续优化。</p>
      </div>

      <PromptWorkshop />

      <div className="ai-section">
        <h2 className="ai-section-title">🔧 Prompt Engineering 完整技巧代码</h2>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#8b5cf6' }}/><div className="ai-code-dot" style={{ background: '#3b82f6' }}/><div className="ai-code-dot" style={{ background: '#10b981' }}/><span style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>🎨 prompt_engineering.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{PROMPT_CODE}</div>
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">⚡ Temperature 速查</h2>
        <div className="ai-grid-3">
          {[
            ['0.0', '代码/SQL/提取', '#10b981', '确定：总是选最高概率词'],
            ['0.3', '问答/摘要/翻译', '#3b82f6', '稳定：有轻微变化'],
            ['0.7', '对话助手', '#8b5cf6', '平衡：生产推荐'],
            ['1.0', '创意写作', '#f97316', '创意：多样化输出'],
            ['1.5+', '诗歌/实验', '#ef4444', '随机：慎用！'],
          ].map(([temp, usecase, color, note]) => (
            <div key={temp} className="ai-card" style={{ borderColor: `${color}20`, textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.3rem', fontWeight: 900, color }}>{temp}</div>
              <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.78rem', margin: '0.2rem 0' }}>{usecase}</div>
              <div style={{ fontSize: '0.65rem', color: '#475569' }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/claude')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/streaming')}>下一模块：流式 & 并发 →</button>
      </div>
    </div>
  );
}
