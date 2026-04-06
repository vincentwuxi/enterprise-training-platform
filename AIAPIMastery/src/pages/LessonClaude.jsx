import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CLAUDE_TOPICS = [
  {
    name: 'Messages API', icon: '💬', color: '#f59e0b',
    code: `# Anthropic Claude Messages API

import anthropic

client = anthropic.Anthropic()   # 自动读取 ANTHROPIC_API_KEY

# ── 基础对话 ──
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system="你是一位专业的技术架构师，擅长大规模系统设计。",   # 系统提示
    messages=[
        {"role": "user", "content": "设计一个千万级用户的短视频推荐系统？"}
    ]
)

print(message.content[0].text)
print(f"Input tokens:  {message.usage.input_tokens}")
print(f"Output tokens: {message.usage.output_tokens}")

# ── 多轮对话（维护 messages 列表）──
conversation = []

def chat(user_text: str) -> str:
    conversation.append({"role": "user", "content": user_text})
    
    resp = client.messages.create(
        model="claude-3-5-haiku-20241022",  # 多轮用 Haiku 省成本
        max_tokens=2000,
        system="你是资深 Python 工程师",
        messages=conversation,
    )
    
    assistant_text = resp.content[0].text
    conversation.append({"role": "assistant", "content": assistant_text})
    return assistant_text

# ── 内容块（Blocks）格式 ──
# Claude 的 content 支持多种块类型：
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "请分析这段代码的性能问题："},
            {"type": "text", "text": "def sum_list(lst):\\n    total = 0\\n    for i in lst:\\n        total += i\\n    return total"},
        ]
    }]
)

# ── Prompt Caching（大幅节省成本！）──
# 对于重复使用的长系统提示，开启 cache_control
# 缓存成本仅为原来的 10%，首次写入 +25%
long_system_prompt = "..." * 5000  # 5000个字的系统提示

resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    system=[{
        "type": "text",
        "text": long_system_prompt,
        "cache_control": {"type": "ephemeral"}  # 最长缓存 5 分钟
    }],
    messages=[{"role": "user", "content": "问题1"}]
)
# cache_creation_input_tokens: 首次写入缓存的数量
# cache_read_input_tokens:     后续从缓存读取的数量（省90%成本！）`,
  },
  {
    name: 'Tool Use', icon: '🔧', color: '#8b5cf6',
    code: `# Claude Tool Use（等效 OpenAI Function Calling）

import anthropic
import json

client = anthropic.Anthropic()

# ── 1. 定义工具 ──
tools = [
    {
        "name": "execute_sql",
        "description": "在数据库中执行 SQL 查询并返回结果，只允许 SELECT 语句",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "要执行的 SQL SELECT 语句"
                },
                "database": {
                    "type": "string",
                    "enum": ["production", "analytics", "staging"],
                    "description": "目标数据库"
                }
            },
            "required": ["query", "database"]
        }
    },
    {
        "name": "send_slack_message",
        "description": "发送消息到指定的 Slack 频道",
        "input_schema": {
            "type": "object",
            "properties": {
                "channel": {"type": "string", "description": "Slack 频道名（如 #engineering）"},
                "message": {"type": "string", "description": "消息内容"}
            },
            "required": ["channel", "message"]
        }
    }
]

# ── 2. 第一轮：让模型决定工具调用 ──
messages = [{"role": "user", "content": "帮我查一下今天新注册用户数，并通知到 #data-team 频道"}]

resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    tools=tools,
    messages=messages,
)

# ── 3. 处理工具调用（stop_reason == "tool_use"）──
while resp.stop_reason == "tool_use":
    messages.append({"role": "assistant", "content": resp.content})
    tool_results = []
    
    for block in resp.content:
        if block.type == "tool_use":
            print(f"调用工具: {block.name}, 参数: {block.input}")
            
            # 执行相应工具
            if block.name == "execute_sql":
                result = {"rows": [{"count": 1523}], "query_time": "0.12s"}
            elif block.name == "send_slack_message":
                result = {"status": "sent", "ts": "1234567890.123"}
            
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result, ensure_ascii=False)
            })
    
    messages.append({"role": "user", "content": tool_results})
    
    # 继续对话
    resp = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        tools=tools,
        messages=messages,
    )

print(resp.content[0].text)
# → "今天共有 1,523 名新注册用户，已将报告发送到 #data-team 频道。"`,
  },
  {
    name: 'Extended Thinking', icon: '🧠', color: '#3b82f6',
    code: `# Claude Extended Thinking：深度推理模式（Claude 3.7 Sonnet）

import anthropic

client = anthropic.Anthropic()

# ── Extended Thinking 适用场景 ──
# • 复杂数学 / 物理推导
# • 多步逻辑推理（法律分析、医疗诊断）
# • 困难编程问题（算法优化、架构设计）
# • 竞赛级 AI 题目

# ── 开启 Extended Thinking ──
resp = client.messages.create(
    model="claude-3-7-sonnet-20250219",   # 需要 3.7 Sonnet
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000   # 给模型分配的思考预算（最多消耗多少 token 思考）
    },
    messages=[{
        "role": "user",
        "content": """
        在一个分布式系统中，有 N 个节点，节点 i 每天产生 a[i] GB 数据。
        你需要设计一个数据分片策略，使得：
        1. 每个节点存储的数据量差距最小
        2. 任意两节点之间的数据迁移不超过 M GB
        3. 系统总存储空间是 S GB

        请给出最优策略并证明其正确性。
        """
    }]
)

# ── 解析思考过程 ──
for block in resp.content:
    if block.type == "thinking":
        print("=== Claude 的思考过程 ===")
        print(block.thinking)   # 内部推理链（可能很长！）
        print()
    elif block.type == "text":
        print("=== 最终答案 ===")
        print(block.text)

# ── 流式 Extended Thinking ──
with client.messages.stream(
    model="claude-3-7-sonnet-20250219",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 8000},
    messages=[{"role": "user", "content": "证明 P≠NP 的主要挑战是什么？"}]
) as stream:
    for event in stream:
        if hasattr(event, 'type'):
            if event.type == 'content_block_start':
                block_type = event.content_block.type
                print(f"\\n开始输出 [{block_type}]:")
            elif event.type == 'content_block_delta':
                if hasattr(event.delta, 'text'):
                    print(event.delta.text, end="", flush=True)
                elif hasattr(event.delta, 'thinking'):
                    print(".", end="", flush=True)   # 思考中...
`,
  },
  {
    name: 'Vision & 文档', icon: '👁️', color: '#10b981',
    code: `# Claude Vision：图像 + PDF + 超长文档分析

import anthropic
import base64
import httpx

client = anthropic.Anthropic()

# ── 1. 图片理解（Base64）──
with open("architecture_diagram.png", "rb") as f:
    img_b64 = base64.standard_b64encode(f.read()).decode("utf-8")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": img_b64,
                },
            },
            {"type": "text", "text": "分析这张系统架构图，找出单点故障（SPOF）风险点"}
        ],
    }]
)
print(message.content[0].text)

# ── 2. 图片 URL 直接传入 ──
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=500,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": "https://example.com/chart.png",
                },
            },
            {"type": "text", "text": "这张图表的 Y 轴最大值是多少？分析增长趋势。"}
        ],
    }]
)

# ── 3. PDF 文档分析（200K Context！）──
with open("annual_report.pdf", "rb") as f:
    pdf_b64 = base64.standard_b64encode(f.read()).decode("utf-8")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": pdf_b64
                }
            },
            {"type": "text", "text": "这份年报的核心财务指标是什么？和上一年相比如何？"}
        ]
    }]
)
`,
  },
];

export default function LessonClaude() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = CLAUDE_TOPICS[activeTopic];

  const CLAUDE_VS = [
    { feature: 'Context Window', claude: '200K Token', gpt: '128K Token', gemini: '1000K Token' },
    { feature: 'Deep Reasoning', claude: 'Extended Thinking ✅', gpt: 'o1/o3 推理 ✅', gemini: 'Thinking 模式 ✅' },
    { feature: 'Tool Use', claude: 'Tool Use', gpt: 'Function Calling', gemini: 'Function Calling' },
    { feature: 'PDF 支持', claude: '原生 ✅（200K ctx）', gpt: '需解析为文字', gemini: '需文件API上传' },
    { feature: 'Prompt Caching', claude: '✅ 省 90% 成本', gpt: '❌（无）', gemini: '✅（Context Caching）' },
    { feature: '图片理解', claude: 'Base64/URL', gpt: 'Base64/URL', gemini: '文件/PIL/URL' },
  ];

  return (
    <div className="lesson-ai">
      <div className="ai-badge claude">🟡 module_04 — Anthropic Claude API</div>
      <div className="ai-hero">
        <h1>Claude API：Messages / Tool Use / Extended Thinking / Prompt Caching</h1>
        <p>Claude 的<strong>独家差异化</strong>：① 200K Token 超长上下文（可分析整本书）；② Extended Thinking（深度推理，公开思维链）；③ Prompt Caching（重复长 System Prompt 省 90% 成本）；④ PDF 原生支持。</p>
      </div>

      <div className="ai-interactive">
        <h3>📊 Claude vs GPT vs Gemini 能力对比</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="ai-table">
            <thead>
              <tr>
                <th>特性</th>
                <th style={{ color: '#f59e0b' }}>Claude</th>
                <th style={{ color: '#10b981' }}>GPT</th>
                <th style={{ color: '#f97316' }}>Gemini</th>
              </tr>
            </thead>
            <tbody>
              {CLAUDE_VS.map(r => (
                <tr key={r.feature}>
                  <td style={{ fontWeight: 700, color: '#94a3b8' }}>{r.feature}</td>
                  <td style={{ fontSize: '0.78rem', color: '#f59e0b' }}>{r.claude}</td>
                  <td style={{ fontSize: '0.78rem', color: '#10b981' }}>{r.gpt}</td>
                  <td style={{ fontSize: '0.78rem', color: '#f97316' }}>{r.gemini}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">📚 Claude API 四大核心功能</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {CLAUDE_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              className="ai-btn claude"
              style={{ flex: 1, minWidth: 110, padding: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem',
                opacity: activeTopic === i ? 1 : 0.4,
                transform: activeTopic === i ? 'scale(1.03)' : 'scale(1)',
                background: activeTopic === i ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.03)' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#f59e0b' }}/><div className="ai-code-dot" style={{ background: '#f59e0b', opacity: 0.5 }}/><div className="ai-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/gemini')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/prompt')}>下一模块：Prompt Engineering →</button>
      </div>
    </div>
  );
}
