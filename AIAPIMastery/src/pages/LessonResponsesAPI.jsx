import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TABS = [
  {
    name: 'Responses API', icon: '🔮', color: '#10b981',
    code: `# ━━━━ OpenAI Responses API（2025 新一代接口）━━━━
# 取代 Chat Completions，统一文本/工具/文件/搜索

from openai import OpenAI
client = OpenAI()

# ══════════════════════════════════════════════
# 1. 基础调用（替代 chat.completions.create）
# ══════════════════════════════════════════════
response = client.responses.create(
    model="gpt-4.1",              # 2025 最新模型
    input="解释 Transformer 架构的 Self-Attention 机制",

    # === 关键参数 ===
    temperature=0.7,
    max_output_tokens=2048,
    top_p=1.0,

    # === 新特性：内置工具 ===
    tools=[
        {"type": "web_search_preview"},       # 内置联网搜索！
        {"type": "file_search"},               # 向量存储搜索
        {"type": "code_interpreter"},           # 代码沙箱执行
    ],

    # === instructions（替代 system message）===
    instructions="你是资深 AI 工程师，回答简洁准确。",
)

# 提取文本输出
for item in response.output:
    if item.type == "message":
        print(item.content[0].text)

# ══════════════════════════════════════════════
# 2. 内置联网搜索（不再需要 SerpAPI！）
# ══════════════════════════════════════════════
response = client.responses.create(
    model="gpt-4.1",
    tools=[{"type": "web_search_preview"}],
    input="2025年最流行的 JavaScript 前端框架排名是什么？",
)

# 搜索结果自动整合到回答中！
for item in response.output:
    if item.type == "message":
        print(item.content[0].text)
        # 自动包含引用来源 URL

# ══════════════════════════════════════════════
# 3. Function Calling（与 Chat Completions 兼容）
# ══════════════════════════════════════════════
tools = [{
    "type": "function",
    "name": "get_weather",
    "description": "获取指定城市的实时天气",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名"}
        },
        "required": ["city"]
    }
}]

response = client.responses.create(
    model="gpt-4.1-mini",
    tools=tools,
    input="北京今天天气怎么样？",
)

# 处理工具调用
for item in response.output:
    if item.type == "function_call":
        print(f"调用: {item.name}({item.arguments})")
        # → 调用: get_weather({"city": "北京"})

# ══════════════════════════════════════════════
# 4. 多轮对话（通过 previous_response_id 链式）
# ══════════════════════════════════════════════
resp1 = client.responses.create(
    model="gpt-4.1-mini",
    input="Python 和 Go 哪个更适合做微服务？",
)

# 第二轮：自动携带上文！
resp2 = client.responses.create(
    model="gpt-4.1-mini",
    input="那 Rust 呢？",
    previous_response_id=resp1.id,   # ← 链接上一轮！
)
# 不需要手动维护 messages 列表了

# ══════════════════════════════════════════════
# 5. 流式输出（SSE）
# ══════════════════════════════════════════════
from openai import OpenAI
client = OpenAI()

stream = client.responses.create(
    model="gpt-4.1-mini",
    input="写一首关于编程的诗",
    stream=True,
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)

# ══════════════════════════════════════════════
# 6. Responses API vs Chat Completions 对比
# ══════════════════════════════════════════════
# ┌────────────────────┬──────────────────┬──────────────────┐
# │ 特性                │ Chat Completions │ Responses API    │
# ├────────────────────┼──────────────────┼──────────────────┤
# │ 多轮对话            │ 手动维护 messages│ previous_response │
# │ 联网搜索            │ ❌ 需第三方       │ ✅ 内置            │
# │ 代码执行            │ ❌ 需 sandbox    │ ✅ 内置            │
# │ 文件搜索            │ ❌ 需 RAG        │ ✅ 内置            │
# │ 结构化输出          │ response_format  │ text.format       │
# │ Function Calling   │ ✅               │ ✅ (兼容)         │
# │ 推理模型            │ ✅ o 系列        │ ✅ o 系列         │
# │ 状态               │ 仍然可用         │ 推荐新项目使用     │
# └────────────────────┴──────────────────┴──────────────────┘`,
  },
  {
    name: 'Gemini 2.5', icon: '🟠', color: '#f97316',
    code: `# ━━━━ Gemini 2.5 Pro / Flash（2025 最新）━━━━
# 内置 Thinking（思维链） + 原生工具调用 + 结构化输出

import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# ══════════════════════════════════════════════
# 1. Gemini 2.5 Flash — Thinking 模式
# ══════════════════════════════════════════════
model = genai.GenerativeModel(
    "gemini-2.5-flash-preview-05-20",
    generation_config={
        "temperature": 1.0,           # Thinking 模式推荐 >= 0.5
        "max_output_tokens": 16384,
        "thinking_config": {
            "thinking_budget": 8192,  # 思考 Token 预算
            # 0 = 关闭思考（省成本）
            # 1024~24576 = 控制思考深度
        },
    },
)

response = model.generate_content(
    "一个水池有两个进水管，A管每小时进3吨，B管每小时进5吨。"
    "池子容量20吨。如果A先开2小时，然后AB同时开，多久能注满？"
)

# 解析思考过程
for part in response.candidates[0].content.parts:
    if hasattr(part, 'thought') and part.thought:
        print("💭 思考过程:", part.text[:200], "...")
    else:
        print("📝 最终答案:", part.text)

# Token 使用详情
meta = response.usage_metadata
print(f"Input: {meta.prompt_token_count}")
print(f"Thinking: {meta.thoughts_token_count}")    # 思考消耗
print(f"Output: {meta.candidates_token_count}")

# ══════════════════════════════════════════════
# 2. 2025 新模型矩阵
# ══════════════════════════════════════════════
# ┌─────────────────────┬──────────┬───────────┬──────────┬─────────┐
# │ 模型                 │ 上下文    │ 思考能力   │ 成本/1M  │ 推荐场景│
# ├─────────────────────┼──────────┼───────────┼──────────┼─────────┤
# │ gemini-2.5-pro      │ 1M       │ ✅ 深度    │ $1.25+   │ 复杂推理│
# │ gemini-2.5-flash    │ 1M       │ ✅ 快速    │ $0.15+   │ 日常推荐│
# │ gemini-2.0-flash    │ 1M       │ ❌        │ $0.10    │ 轻量任务│
# │ gemini-2.0-flash-lite│ 1M      │ ❌        │ $0.025   │ 批量处理│
# └─────────────────────┴──────────┴───────────┴──────────┴─────────┘

# ══════════════════════════════════════════════
# 3. Gemini 原生 Function Calling
# ══════════════════════════════════════════════
def get_stock_price(symbol: str) -> dict:
    """获取股票实时价格"""
    return {"symbol": symbol, "price": 175.50, "change": "+1.2%"}

model_fc = genai.GenerativeModel(
    "gemini-2.5-flash-preview-05-20",
    tools=[get_stock_price],   # 直接传 Python 函数！不需要写 JSON Schema
)

response = model_fc.generate_content("苹果公司股价是多少？")
# Gemini 自动：
# 1. 推断需要调用 get_stock_price
# 2. 生成参数 {"symbol": "AAPL"}  
# 3. 执行函数
# 4. 用结果生成自然语言回答

# ══════════════════════════════════════════════
# 4. 结构化输出（JSON Schema）
# ══════════════════════════════════════════════
import typing_extensions as typing

class Recipe(typing.TypedDict):
    recipe_name: str
    ingredients: list[str]
    cooking_time_minutes: int

model_json = genai.GenerativeModel(
    "gemini-2.5-flash-preview-05-20",
    generation_config=genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=list[Recipe],     # 直接传 TypedDict！
    ),
)

resp = model_json.generate_content("给我 3 个快手午餐食谱")
import json
recipes = json.loads(resp.text)
# → [{"recipe_name": "蒜蓉面", "ingredients": [...], "cooking_time_minutes": 15}, ...]

# ══════════════════════════════════════════════
# 5. 图片生成（Imagen 3 集成）
# ══════════════════════════════════════════════
model_img = genai.GenerativeModel("gemini-2.0-flash-exp-image-generation")
response = model_img.generate_content(
    "生成一张赛博朋克风格的东京街头夜景",
    generation_config=genai.GenerationConfig(
        response_modalities=["TEXT", "IMAGE"],  # 同时返回文字和图片
    ),
)

for part in response.candidates[0].content.parts:
    if part.inline_data:    # 图片
        with open("tokyo.png", "wb") as f:
            f.write(part.inline_data.data)
    elif part.text:         # 描述
        print(part.text)`,
  },
  {
    name: 'Claude 4 / Sonnet 4', icon: '🟡', color: '#f59e0b',
    code: `# ━━━━ Claude Sonnet 4 / Claude 4 Opus (2025 最新) ━━━━
# Extended Thinking 升级 + MCP 集成 + 更强 Tool Use

import anthropic

client = anthropic.Anthropic()

# ══════════════════════════════════════════════
# 1. Claude Sonnet 4 — 升级版 Extended Thinking
# ══════════════════════════════════════════════
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000,     # 思考预算 1K~128K
    },
    messages=[{
        "role": "user",
        "content": """
        设计一个分布式限流系统，要求：
        1. 支持滑动窗口和令牌桶两种算法
        2. 跨节点一致性（允许短暂不一致）
        3. 每秒处理 100 万请求
        4. P99 延迟 < 1ms
        
        请给出完整的技术方案和代码框架。
        """
    }],
)

# 解析输出（思考 + 最终答案）
for block in response.content:
    if block.type == "thinking":
        print("🧠 思考过程:")
        print(block.thinking[:500], "...")   # 完整推理链！
    elif block.type == "text":
        print("\\n📝 最终方案:")
        print(block.text)

print(f"\\nUsage: Input={response.usage.input_tokens}, "
      f"Output={response.usage.output_tokens}")

# ══════════════════════════════════════════════
# 2. 2025 Claude 模型矩阵
# ══════════════════════════════════════════════
# ┌──────────────────────┬──────────┬───────────┬──────────┬──────────┐
# │ 模型                  │ 上下文    │ 思考能力   │ Input/1M │ Output/1M│
# ├──────────────────────┼──────────┼───────────┼──────────┼──────────┤
# │ claude-4-opus         │ 200K     │ ✅ 最强    │ $15.00  │ $75.00   │
# │ claude-sonnet-4       │ 200K     │ ✅ 推荐    │ $3.00   │ $15.00   │
# │ claude-3-5-haiku      │ 200K     │ ❌        │ $0.80   │ $4.00    │
# └──────────────────────┴──────────┴───────────┴──────────┴──────────┘

# ══════════════════════════════════════════════
# 3. 改进版 Tool Use：并行工具调用
# ══════════════════════════════════════════════
tools = [
    {
        "name": "search_docs",
        "description": "搜索内部文档库",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "department": {"type": "string", "enum": ["engineering", "product", "hr"]}
            },
            "required": ["query"]
        }
    },
    {
        "name": "query_database",
        "description": "查询数据库",
        "input_schema": {
            "type": "object",
            "properties": {
                "sql": {"type": "string"},
                "database": {"type": "string"}
            },
            "required": ["sql", "database"]
        }
    }
]

# Claude 可以一次返回多个 tool_use 块 → 并行执行！
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    tools=tools,
    messages=[{
        "role": "user",
        "content": "帮我查一下工程团队的 oncall 轮值表，同时查询本月的部署次数"
    }]
)

# 一次返回两个工具调用 → 你可以并行执行
tool_calls = [b for b in response.content if b.type == "tool_use"]
# [
#   ToolUse(name="search_docs", input={"query":"oncall轮值表","department":"engineering"}),
#   ToolUse(name="query_database", input={"sql":"SELECT COUNT(*)...","database":"devops"})
# ]

# ══════════════════════════════════════════════
# 4. Prompt Caching 深度用法
# ══════════════════════════════════════════════
# 场景：RAG 应用中，长 system prompt 反复使用
LONG_SYSTEM = "你是一位法律顾问..." + ("详细法律条文 " * 2000)

# 第 1 次调用：写入缓存（+25% 成本）
resp1 = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1000,
    system=[{
        "type": "text",
        "text": LONG_SYSTEM,
        "cache_control": {"type": "ephemeral"}     # 5 分钟缓存
    }],
    messages=[{"role": "user", "content": "合同中的免责条款有效吗？"}]
)
print(f"首次: 写入缓存 {resp1.usage.cache_creation_input_tokens} tokens")

# 第 2~N 次调用：读取缓存（90% 折扣！）
resp2 = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1000,
    system=[{
        "type": "text",
        "text": LONG_SYSTEM,
        "cache_control": {"type": "ephemeral"}
    }],
    messages=[{"role": "user", "content": "如何约定违约金上限？"}]
)
print(f"命中缓存: {resp2.usage.cache_read_input_tokens} tokens (省90%!)")

# ══════════════════════════════════════════════
# 5. Prefill（引导输出格式）
# ══════════════════════════════════════════════
# Claude 独有技巧：预填充 assistant 消息开头
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "分析这段代码的时间复杂度和空间复杂度：\\ndef fib(n): ..."},
        {"role": "assistant", "content": "{\\n  \\"analysis\\": {"}   # 预填充！
    ]
)
# → 模型会继续生成合法 JSON，不会偏离格式

# ══════════════════════════════════════════════
# 6. Batch API（大批量低成本）
# ══════════════════════════════════════════════
# 50% 折扣，24 小时内完成
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"req_{i}",
            "params": {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": f"翻译第{i}段文字..."}]
            }
        }
        for i in range(1000)    # 1000 个请求一次性提交
    ]
)
# 半价处理！适合非实时场景（文档翻译、数据标注）`,
  },
  {
    name: '模型选型指南', icon: '🗺️', color: '#8b5cf6',
    code: `# ━━━━ 2025 AI 模型选型决策树 ━━━━

# ══════════════════════════════════════════════
# 1. 根据任务类型选模型
# ══════════════════════════════════════════════
#
# 你的任务是？
# │
# ├── 简单任务（翻译/摘要/分类）
# │   └── 💰 最便宜: gemini-2.0-flash-lite ($0.025/1M)
# │   └── 🏆 最强:  gpt-4.1-mini ($0.40/1M)
# │
# ├── 复杂推理（数学/逻辑/架构设计）
# │   └── 💰 性价比: gemini-2.5-flash + thinking ($0.15/1M)
# │   └── 🏆 最强:  claude-4-opus ($15/1M)
# │   └── 🏆 最强:  o4-mini + high effort ($1.10/1M)
# │
# ├── 代码生成
# │   └── 🏆 全能:  claude-sonnet-4 ($3/1M)
# │   └── 💰 最快:  gpt-4.1-mini ($0.40/1M)
# │
# ├── 超长文档分析（>100页）
# │   └── 🏆 1M上下文: gemini-2.5-pro ($1.25/1M)
# │   └── 🥈 200K:   claude-sonnet-4 ($3/1M)
# │
# ├── 多模态（图片/视频/音频）
# │   └── 🏆 最全:  gemini-2.5-flash (文/图/音/视/代码执行)
# │   └── 🥈 图文:  gpt-4.1 (图文)
# │
# ├── 联网搜索实时信息
# │   └── 🏆 内置:  gpt-4.1 Responses API (web_search)
# │   └── 🥈 内置:  gemini (Grounding)
# │   └── 🥉 第三方: claude + SerpAPI
# │
# └── 批量处理（1000+请求）
#     └── 💰 Claude Batch API (半价)
#     └── 💰 OpenAI Batch API (半价)
#     └── 💰 Gemini Batch API (半价)

# ══════════════════════════════════════════════
# 2. 成本优化决策树
# ══════════════════════════════════════════════
#
# 月预算目标？
# │
# ├── < $100/月
# │   ├── Gemini Flash (免费 Tier: 1500 请求/天!)
# │   └── gpt-4.1-nano (最便宜的 OpenAI) 
# │
# ├── $100 ~ $1000/月
# │   ├── 复杂任务: gemini-2.5-flash + thinking
# │   ├── 代码任务: gpt-4.1-mini
# │   └── 长 System Prompt: claude + Prompt Caching
# │
# └── > $1000/月
#     ├── LiteLLM 路由: 简单→mini, 复杂→pro
#     ├── Batch API: 非实时任务半价
#     └── 语义缓存: 相似问题复用回答

# ══════════════════════════════════════════════
# 3. 参数调优速查（按场景）
# ══════════════════════════════════════════════
SCENE_CONFIGS = {
    "代码生成": {
        "temperature": 0.0,
        "max_tokens": 4096,
        "top_p": 1.0,      # 不动
        "tip": "确定性最大，避免生成错误代码"
    },
    "客服问答": {
        "temperature": 0.3,
        "max_tokens": 500,      # 控制成本
        "presence_penalty": 0.3, # 鼓励多样回答
        "tip": "稳定但不死板，限制长度省钱"
    },
    "创意写作": {
        "temperature": 1.0,
        "max_tokens": 2000,
        "frequency_penalty": 0.5,  # 避免重复
        "tip": "最大化创意，惩罚重复用词"
    },
    "数据提取": {
        "temperature": 0.0,
        "max_tokens": 1000,
        "response_format": "json",    # 强制 JSON
        "tip": "0 温度 + JSON Mode = 最稳定结构化输出"
    },
    "RAG 检索增强": {
        "temperature": 0.2,
        "max_tokens": 800,
        "tip": "低温忠于检索结果，不要过度创造"
    },
    "数学推理": {
        "model": "o4-mini / claude-sonnet-4 / gemini-2.5-flash",
        "reasoning": "high / budget_tokens=10000 / thinking_budget=8192",
        "temperature": "0.0 (o系列不支持调) / 1.0 (Claude Thinking 推荐)",
        "tip": "必须开启 Thinking/Reasoning，显著提升正确率"
    },
}

# ══════════════════════════════════════════════
# 4. 2025 模型能力一览表
# ══════════════════════════════════════════════
# ┌──────────────────┬────┬────┬────┬────┬────┬────┐
# │ 能力              │gpt │o4  │gem │gem │cld │cld │
# │                  │4.1 │mini│2.5P│2.5F│S4  │Opus│
# ├──────────────────┼────┼────┼────┼────┼────┼────┤
# │ 文本理解          │ ★★★│ ★★★│ ★★★│ ★★ │ ★★★│ ★★★│
# │ 代码生成          │ ★★★│ ★★ │ ★★ │ ★★ │ ★★★│ ★★★│
# │ 数学推理          │ ★★ │ ★★★│ ★★★│ ★★ │ ★★★│ ★★★│
# │ 多模态(图/视/音)  │ ★★ │ ★  │ ★★★│ ★★★│ ★★ │ ★★ │
# │ 长上下文          │ ★★ │ ★★ │ ★★★│ ★★★│ ★★ │ ★★ │
# │ Function Call    │ ★★★│ ★★ │ ★★★│ ★★ │ ★★★│ ★★★│
# │ 联网搜索          │ ★★★│ ★  │ ★★★│ ★★ │ ★  │ ★  │
# │ 思维链            │ ★  │ ★★★│ ★★★│ ★★ │ ★★★│ ★★★│
# │ 性价比            │ ★★ │ ★★★│ ★★ │ ★★★│ ★★ │ ★  │
# └──────────────────┴────┴────┴────┴────┴────┴────┘`,
  },
];

export default function LessonResponsesAPI() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const t = TABS[tab];

  return (
    <div className="lesson-ai">
      <div className="ai-badge red">🔮 module_10 — 2025 新 API & 选型指南</div>
      <div className="ai-hero">
        <h1>2025 API 前沿：Responses API / Gemini 2.5 / Claude 4 / 选型决策树</h1>
        <p>AI API 最新版图——<strong>OpenAI Responses API 统一文本+工具+搜索，Gemini 2.5 内置 Thinking 即时推理，Claude Sonnet 4 Extended Thinking + Batch半价，以及按成本/任务/场景的完整模型选型决策树</strong>。</p>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">🔮 2025 前沿 API & 选型</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {TABS.map((topic, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`ai-btn ${i === 0 ? 'gpt' : i === 1 ? 'gemini' : i === 2 ? 'claude' : ''}`}
              style={{ flex: 1, minWidth: 110, padding: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem',
                opacity: tab === i ? 1 : 0.4,
                transform: tab === i ? 'scale(1.03)' : 'scale(1)',
                background: tab === i ? `${topic.color}15` : `${topic.color}03` }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: t.color }} /><div className="ai-code-dot" style={{ background: t.color, opacity: 0.5 }} /><div className="ai-code-dot" style={{ background: '#8b5cf6' }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name.toLowerCase().replace(/[\s\/]/g, '_')}.py</span>
          </div>
          <div className="ai-code" style={{ maxHeight: 520, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">⚡ 2025 模型成本速查</h2>
        <div className="ai-card" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
          <table className="ai-table">
            <thead><tr><th>模型</th><th>Input $/1M</th><th>Output $/1M</th><th>上下文</th><th>Thinking</th><th>推荐场景</th></tr></thead>
            <tbody>
              {[
                ['gpt-4.1', '$2.00', '$8.00', '1M', '❌', '通用旗舰', '#10b981'],
                ['gpt-4.1-mini', '$0.40', '$1.60', '1M', '❌', '日常首选', '#34d399'],
                ['gpt-4.1-nano', '$0.10', '$0.40', '1M', '❌', '极致省钱', '#86efac'],
                ['o4-mini', '$1.10', '$4.40', '200K', '✅', '数学推理', '#10b981'],
                ['gemini-2.5-pro', '$1.25', '$10.00', '1M', '✅ 深度', '复杂分析', '#f97316'],
                ['gemini-2.5-flash', '$0.15', '$0.60', '1M', '✅ 快速', '⭐ 性价比王', '#fb923c'],
                ['claude-sonnet-4', '$3.00', '$15.00', '200K', '✅', '代码/推理', '#f59e0b'],
                ['claude-3-5-haiku', '$0.80', '$4.00', '200K', '❌', '轻量任务', '#fbbf24'],
              ].map(([model, inp, out, ctx, think, scene, c]) => (
                <tr key={model}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: c, fontSize: '0.75rem' }}>{model}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>{inp}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>{out}</td>
                  <td style={{ fontSize: '0.75rem' }}>{ctx}</td>
                  <td style={{ fontSize: '0.75rem' }}>{think}</td>
                  <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{scene}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/param-bible')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery')}>🏠 返回课程首页</button>
      </div>
    </div>
  );
}
