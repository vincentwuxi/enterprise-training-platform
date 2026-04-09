import { useState } from 'react';
import './LessonCommon.css';

const SYSTEM_PROMPT_PARTS = [
  { label: 'Role & Persona', desc: '定义 AI 的身份和风格', example: '你是一位专业的代码审查助手，风格严谨、友善、具体。不评论无关代码问题。' },
  { label: 'Context & Domain', desc: '提供必要的背景知识', example: '我们是一家金融科技公司，代码需要满足金融级安全标准（无 SQL 注入、密钥不硬编码）。' },
  { label: 'Task & Format', desc: '明确任务和输出格式', example: '输出格式：\n1. 严重问题（必须修复）\n2. 建议改进（可选）\n3. 优秀实践（鼓励）' },
  { label: 'Constraints', desc: '限制范围，防止越界', example: '只分析用户提交的代码，不讨论编程语言选择争论，不输出完整的重写代码。' },
  { label: 'Examples (Few-shot)', desc: '提供 1-3 个示例，校准预期', example: '示例输入：for i in range(len(arr))...\n示例输出：[建议] 可用 enumerate() 替代，更 Pythonic。' },
  { label: 'Guardrails', desc: '安全边界，防止滥用', example: '如果用户请求非代码审查的内容，礼貌拒绝并引导回代码相关话题。' },
];

const PROMPT_PATTERNS = [
  {
    key: 'cot', label: 'Chain of Thought',
    when: '需要复杂推理、数学计算、逻辑分析',
    template: `请一步一步地分析这个问题：
[用户输入]

**请按如下步骤推理：**
1. 首先，理解核心问题是什么
2. 列出已知条件
3. 推理过程
4. 最终结论

不要直接跳到结论，展示你的推理过程。`,
    result: '准确率显著提升，尤其是多步推理题',
  },
  {
    key: 'fewshot', label: 'Few-shot',
    when: '需要特定格式输出、特定风格、或特殊分类任务',
    template: `将以下客服反馈分类：

示例1：
输入："我的订单3天没发货"
输出：{category: "物流问题", urgency: "高", sentiment: "负面"}

示例2：
输入："产品质量很好，下次还会购买"
输出：{category: "好评", urgency: "低", sentiment: "正面"}

现在处理：
输入："[用户反馈]"
输出：`,
    result: '格式稳定性大幅提升，无需后处理解析',
  },
  {
    key: 'rag', label: 'RAG（检索增强）',
    when: '需要使用私有数据/实时信息/避免幻觉',
    template: `基于以下参考资料回答用户问题。
如果参考资料中没有相关信息，直接说"我没有找到相关信息"，不要推测。

**参考资料（来自知识库检索）：**
[RETRIEVED_DOCS_HERE]

**用户问题：**
[USER_QUESTION]

**回答要求：**
- 只使用上述资料中的信息
- 引用具体来源（文档名+段落）
- 不确定时说明不确定`,
    result: '幻觉率大幅降低，答案可溯源',
  },
  {
    key: 'structured', label: '结构化输出',
    when: '需要将 AI 输出用于下游处理（存储/展示/调用）',
    template: `分析以下产品评论，以 JSON 格式输出分析结果。

评论：[USER_REVIEW]

输出格式（严格遵守，不要添加额外内容）：
{
  "sentiment": "positive|negative|neutral",
  "score": 1-5,
  "topics": ["话题1", "话题2"],
  "key_phrases": ["关键短语"],
  "suggestions": ["改进建议"]
}`,
    result: 'JSON 直接可被程序消费，无需解析',
  },
];

export default function LessonPromptProduct() {
  const [activePrompt, setActivePrompt] = useState('cot');

  const pattern = PROMPT_PATTERNS.find(p => p.key === activePrompt);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块三 · Prompt Engineering × Product</div>
          <h1>Prompt 工程与产品设计</h1>
          <p>System Prompt 是 AI 产品的"灵魂"，是你对 AI 行为最核心的设计决策。本模块教你设计稳定、安全、高质量的 Prompt，并掌握 CoT、Few-shot、RAG、结构化输出四大产品级 Prompt 模式。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '6层', l: 'System Prompt 结构' }, { v: 'CoT', l: '推理准确率+20%' }, { v: 'RAG', l: '幻觉率大幅降低' }, { v: 'JSON', l: '结构化输出' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* System Prompt Architecture */}
        <div className="lp-section">
          <h2>🏗️ System Prompt 六层架构</h2>
          <p style={{ color: 'var(--lp-muted)', fontSize: '.9rem', marginBottom: '1.25rem' }}>
            好的 System Prompt 是分层设计的。点击每一层了解其作用和示例：
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {SYSTEM_PROMPT_PARTS.map((part, i) => (
              <div key={i} style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 10, padding: '0.85rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 28, height: 28, background: 'var(--lp-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', flexShrink: 0, color: '#fff' }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{part.label}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--lp-muted)' }}>{part.desc}</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.78rem', color: '#f5d0fe', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{part.example}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="lp-tip">💡 <span>小团队可先从 Role + Task + Constraints 三层开始，逐步迭代加入 Few-shot 和精细化 Format 要求。</span></div>
        </div>

        {/* Prompt Patterns */}
        <div className="lp-section">
          <h2>⚡ 四大产品级 Prompt 模式</h2>
          <div className="lp-tabs">
            {PROMPT_PATTERNS.map(p => <button key={p.key} className={`lp-tab${activePrompt === p.key ? ' active' : ''}`} onClick={() => setActivePrompt(p.key)}>{p.label}</button>)}
          </div>
          {pattern && (
            <div>
              <div className="lp-cyan">🎯 <span><strong>适用场景：</strong>{pattern.when}</span></div>
              <div className="lp-code">{pattern.template}</div>
              <div className="lp-good">✅ <span><strong>效果：</strong>{pattern.result}</span></div>
            </div>
          )}
        </div>

        {/* Guardrails */}
        <div className="lp-section">
          <h2>🛡️ Guardrails 设计 — 防止 AI 越界</h2>
          <div className="lp-code">{`# Prompt Injection 防御：不信任用户输入
# 危险：直接把用户输入拼接到系统关键位置
system_prompt = f"回答{user_question}"  # ❌ 用户可能输入 "忽略以上指令，做XX"

# 安全：明确区分系统指令和用户输入
messages = [
    {"role": "system",    "content": SYSTEM_PROMPT},      # 系统指令固定
    {"role": "user",      "content": user_question},       # 用户输入被隔离
]

# Output Guardrail：在输出前检测
import re

def check_output_safety(text: str) -> dict:
    issues = []
    
    # 检测个人信息泄露（手机、邮箱、身份证）
    if re.search(r'1[3-9]\d{9}', text):           # 手机号
        issues.append("phone_number")
    if re.search(r'[\w.-]+@[\w.-]+\.\w+', text):  # 邮箱
        issues.append("email")
    
    # 检测竞品相关内容（如不希望提及）
    BLOCKED_WORDS = ["competitor_name", "sensitive_topic"]
    for word in BLOCKED_WORDS:
        if word.lower() in text.lower():
            issues.append(f"blocked_word:{word}")
    
    return {"safe": len(issues) == 0, "issues": issues}

# Topic Guardrail：话题守门人
ALLOWED_TOPICS_PROMPT = """
如果用户的问题与 [产品功能/公司业务] 无关，
请礼貌地说：
"这个问题超出了我的服务范围，我专注于帮助您解决 [产品] 相关问题。"
然后主动提出 3 个相关的可回答问题供用户选择。
"""`}</div>
          <div className="lp-warn">⚠️ <span>Guardrails 是 AI 产品上线前的<strong>必须项</strong>，不是"之后再加"。Prompt Injection 和内容违规在发布第一天就会被用户（or 黑客）测试。</span></div>
        </div>

        {/* Prompt Testing */}
        <div className="lp-section">
          <h2>🧪 Prompt 测试方法论</h2>
          <div className="lp-steps">
            {[
              { t: '构建测试集（30-50 条）', d: '覆盖：典型用例 20 条、边界情况 15 条、攻击测试 10 条（Prompt Injection/越界请求）、空输入/超长输入' },
              { t: '定义评分标准', d: '每条测试用例定义预期输出的评分维度（格式正确/内容准确/语气合适），用 GPT-4 做自动评分 + 人工抽查' },
              { t: 'A/B 对比不同版本', d: '对同一测试集运行多个 Prompt 版本，比较平均分，选择最优版本发布' },
              { t: '生产环境持续监控', d: '上线后持续收集 Bad Case，每周 Review，迭代 Prompt。将用户的"差评"反馈自动加入测试集' },
            ].map((s, i) => (
              <div key={i} className="lp-step">
                <div>
                  <div className="lp-step-title">{s.t}</div>
                  <div className="lp-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
