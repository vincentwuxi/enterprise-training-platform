import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Function Call 构建器
const FUNCTION_EXAMPLES = [
  {
    name: 'get_weather', desc: '查询天气函数',
    schema: {
      name: 'get_weather',
      description: '获取指定城市的实时天气信息',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: '城市名，如"北京"或"New York, NY"' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'], description: '温度单位' }
        },
        required: ['location']
      }
    }
  },
  {
    name: 'search_products', desc: '商品搜索函数',
    schema: {
      name: 'search_products',
      description: '根据关键词和价格范围搜索商品',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
          max_price: { type: 'number', description: '最高价格（元）' },
          category: { type: 'string', enum: ['electronics', 'clothing', 'food', 'books'] }
        },
        required: ['keyword']
      }
    }
  },
];

function FunctionCallBuilder() {
  const [activeFunc, setActiveFunc] = useState(0);
  const [userMsg, setUserMsg] = useState('北京今天天气怎么样？');
  const [step, setStep] = useState(0); // 0=初始 1=模型决定调用 2=工具返回 3=最终回复

  const fn = FUNCTION_EXAMPLES[activeFunc];
  const steps = [
    { label: '1. 用户提问', icon: '💬', color: '#3b82f6' },
    { label: '2. 模型决定调用工具', icon: '🤖', color: '#8b5cf6' },
    { label: '3. 执行函数 → 结果', icon: '⚙️', color: '#f97316' },
    { label: '4. 模型生成最终回复', icon: '✅', color: '#10b981' },
  ];

  const simulate = () => {
    if (step >= 3) { setStep(0); return; }
    setTimeout(() => setStep(s => Math.min(s + 1, 3)), 0);
  };

  return (
    <div className="ai-interactive">
      <h3>⚙️ Function Calling 交互式演示（逐步执行）</h3>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {FUNCTION_EXAMPLES.map((f, i) => (
          <button key={i} onClick={() => { setActiveFunc(i); setStep(0); }}
            className={`ai-btn gpt`}
            style={{ opacity: activeFunc === i ? 1 : 0.4, fontWeight: activeFunc === i ? 800 : 500, fontSize: '0.75rem' }}>
            {f.name}()
          </button>
        ))}
      </div>

      {/* 流程步骤 */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, transition: 'all 0.3s',
              background: step >= i ? `${s.color}15` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${step >= i ? s.color + '50' : 'rgba(255,255,255,0.06)'}`,
              color: step >= i ? s.color : '#334155' }}>
              {s.icon} {s.label}
            </div>
            {i < 3 && <span style={{ color: '#334155', fontSize: '0.8rem' }}>→</span>}
          </div>
        ))}
      </div>

      {/* 当前状态展示 */}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', background: '#05050f', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.625rem', lineHeight: 1.8, minHeight: 80 }}>
        {step === 0 && <div style={{ color: '#60a5fa' }}>// 等待开始...点击「下一步」开始演示 Function Calling 流程</div>}
        {step >= 1 && (
          <div>
            <div style={{ color: '#f97316', marginBottom: '0.25rem' }}>// Step 1: 用户消息 → 模型决定调用工具</div>
            <div style={{ color: '#94a3b8' }}>{`{"role":"user","content":"${userMsg}"}`}</div>
            <div style={{ color: '#a78bfa', marginTop: '0.25rem' }}>→ Model 返回 tool_calls: [{`{"function":{"name":"${fn.name}","arguments":{"location":"北京","unit":"celsius"}}`}]</div>
          </div>
        )}
        {step >= 2 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ color: '#f97316' }}>// Step 2: 执行 {fn.name}() → 返回结果</div>
            <div style={{ color: '#34d399' }}>{`result = ${fn.name}(location="北京", unit="celsius")`}</div>
            <div style={{ color: '#94a3b8' }}>{`# → {"location":"北京","temperature":16,"condition":"晴","humidity":"45%"}`}</div>
          </div>
        )}
        {step >= 3 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ color: '#10b981' }}>// Step 3: 将工具结果传回模型 → 生成自然语言回复</div>
            <div style={{ color: '#fbbf24' }}>Assistant: "北京今天天气晴朗，气温 16°C，湿度 45%，是外出的好时机！"</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button className="ai-btn gpt" onClick={simulate} style={{ fontSize: '0.8rem' }}>
          {step >= 3 ? '↺ 重置' : '▶ 下一步'}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#10b981' : 'rgba(255,255,255,0.06)', transition: 'all 0.3s' }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

const OPENAI_TOPICS = [
  {
    name: 'Chat Completions', icon: '💬', color: '#10b981',
    code: `# OpenAI Chat Completions API 完整指南

from openai import OpenAI
client = OpenAI()  # 自动读取 OPENAI_API_KEY 环境变量

# ── 基础对话 ──
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一位专业的 Python 工程师，回答要简洁精准。"},
        {"role": "user",   "content": "什么是 GIL？"},
    ],
    max_tokens=500,       # 最大输出 Token 数（控制成本！）
    temperature=0.7,      # 0=确定性, 1=创意, 2=随机（通常不超过1）
    top_p=1.0,            # 核采样（与 temperature 配合）
    frequency_penalty=0,  # 惩罚重复词（0-2）
    presence_penalty=0,   # 鼓励新主题（0-2）
    seed=42,              # 固定随机种子（提高可复现性）
)

content = response.choices[0].message.content
tokens  = response.usage.total_tokens
print(f"回答: {content}")
print(f"Tokens: {tokens} = \${tokens * 0.0000025:.6f}")

# ── 多轮对话（维护 history）──
history = [{"role": "system", "content": "你是 Python 专家"}]

def chat(user_input: str) -> str:
    history.append({"role": "user", "content": user_input})
    
    resp = client.chat.completions.create(
        model="gpt-4o-mini",  # 多轮对话用 mini 省成本
        messages=history,
    )
    
    assistant_msg = resp.choices[0].message.content
    history.append({"role": "assistant", "content": assistant_msg})
    return assistant_msg

# ── 结构化输出（JSON Mode）──
import json
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是数据提取助手，只返回 JSON，不要有任何额外文字"},
        {"role": "user",   "content": "从这段文字提取人名和公司：张三是百度的高级工程师，李四在字节跳动担任产品经理。"},
    ],
    response_format={"type": "json_object"},  # 强制 JSON 输出
)
data = json.loads(resp.choices[0].message.content)
# → {"persons":[{"name":"张三","company":"百度","role":"高级工程师"},{"name":"李四",...}]}`,
  },
  {
    name: 'Function Calling', icon: '⚙️', color: '#8b5cf6',
    code: `# OpenAI Function Calling / Tool Use

from openai import OpenAI
import json

client = OpenAI()

# ── 1. 定义工具（JSON Schema）──
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_stock_price",
            "description": "获取指定股票的实时价格和涨跌幅",
            "parameters": {
                "type": "object",
                "properties": {
                    "symbol": {
                        "type": "string",
                        "description": "股票代码，如 AAPL、600036"
                    },
                    "currency": {
                        "type": "string",
                        "enum": ["USD", "CNY"],
                        "description": "报价货币"
                    }
                },
                "required": ["symbol"]
            }
        }
    }
]

# ── 2. 第一轮：让模型决定是否调用工具 ──
messages = [{"role": "user", "content": "苹果公司的股价现在是多少？"}]

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # "auto"=让模型决定 / "required"=强制调用 / "none"=不调用
)

msg = resp.choices[0].message

# ── 3. 检查是否触发工具调用 ──
if msg.tool_calls:
    for tool_call in msg.tool_calls:
        func_name = tool_call.function.name
        func_args = json.loads(tool_call.function.arguments)
        
        # 4. 执行真实函数
        if func_name == "get_stock_price":
            # 模拟调用真实 API
            result = {"symbol": "AAPL", "price": 189.50, "change": "+1.23%"}
        
        # 5. 将工具结果加入对话
        messages.append(msg)  # 模型的 tool_calls 消息
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(result, ensure_ascii=False)
        })
    
    # 6. 第二轮：模型根据工具结果生成回复
    final = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
    )
    print(final.choices[0].message.content)
    # → "苹果公司（AAPL）目前股价为 $189.50，今日上涨 1.23%。"`,
  },
  {
    name: 'Vision & 多模态', icon: '👁️', color: '#3b82f6',
    code: `# GPT-4o Vision：图像理解 + 多模态输入

from openai import OpenAI
import base64

client = OpenAI()

# ── 方式1：URL 图片（公开图片）──
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "这张图里有什么？请详细描述。"},
            {"type": "image_url", "image_url": {
                "url": "https://example.com/chart.png",
                "detail": "high"   # high/low/auto，high 消耗更多 tokens
            }}
        ]
    }],
    max_tokens=500,
)

# ── 方式2：Base64 本地图片 ──
with open("screenshot.png", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "这是我的代码截图，请找出 Bug："},
            {"type": "image_url", "image_url": {
                "url": f"data:image/png;base64,{img_b64}"
            }}
        ]
    }],
)

# ── 方式3：多图对比（分析报表）──
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "对比这两张表格，找出差异并生成摘要："},
            {"type": "image_url", "image_url": {"url": "https://example.com/q1.png"}},
            {"type": "image_url", "image_url": {"url": "https://example.com/q2.png"}},
        ]
    }],
)
print(resp.choices[0].message.content)

# ── Token 消耗说明（Vision）──
# "low" detail:  固定 85 tokens/张（适合缩略图）
# "high" detail: 按图片分辨率分块，每个 512×512 瓦片 170 tokens
# 1024×1024 图片 ≈ 765 tokens（约 $0.002/张 with gpt-4o）`,
  },
  {
    name: 'Embeddings', icon: '🔢', color: '#f97316',
    code: `# OpenAI Embeddings：文本语义向量化

from openai import OpenAI
import numpy as np

client = OpenAI()

# ── 1. 生成单个文本向量（1536维）──
resp = client.embeddings.create(
    model="text-embedding-3-small",   # 小：$0.02/1M tokens
    # model="text-embedding-3-large", # 大：$0.13/1M tokens，精度更高
    input="机器学习是人工智能的一个分支",
    encoding_format="float",
)
vector = resp.data[0].embedding   # List[float], 长度 1536

# ── 2. 批量向量化（省 API 调用次数）──
texts = ["苹果是水果", "香蕉是水果", "机器学习是AI分支", "深度学习属于机器学习"]

resp = client.embeddings.create(
    model="text-embedding-3-small",
    input=texts,
)
vectors = [d.embedding for d in resp.data]  # List[List[float]]

# ── 3. 相似度计算（余弦相似度）──
def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# "苹果是水果" vs "香蕉是水果" → 高相似度
sim1 = cosine_similarity(vectors[0], vectors[1])   # ~0.92

# "苹果是水果" vs "机器学习是AI分支" → 低相似度
sim2 = cosine_similarity(vectors[0], vectors[2])   # ~0.22

print(f"苹果 vs 香蕉: {sim1:.3f}")       # 很相似！
print(f"苹果 vs 机器学习: {sim2:.3f}")   # 很不同！

# ── 4. 语义搜索实现 ──
knowledge_base = ["Python 是解释型语言", "GIL 限制多线程", "asyncio 用于异步编程"]
kb_vecs = [client.embeddings.create(model="text-embedding-3-small", input=t).data[0].embedding for t in knowledge_base]

def semantic_search(query: str, top_k=2):
    q_vec = client.embeddings.create(model="text-embedding-3-small", input=query).data[0].embedding
    scores = [(cosine_similarity(q_vec, v), t) for v, t in zip(kb_vecs, knowledge_base)]
    return sorted(scores, reverse=True)[:top_k]

results = semantic_search("Python 的性能限制是什么？")
# → [("GIL 限制多线程", 0.87), ("Python 是解释型语言", 0.75)]`,
  },
];

export default function LessonOpenAI() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = OPENAI_TOPICS[activeTopic];

  return (
    <div className="lesson-ai">
      <div className="ai-badge gpt">🟢 module_02 — OpenAI GPT API</div>
      <div className="ai-hero">
        <h1>OpenAI GPT API：Chat / Function Calling / Vision / Embeddings</h1>
        <p>OpenAI 是目前生态最成熟的 AI 平台。<strong>Function Calling</strong> 允许模型调用外部工具（天气、数据库、代码执行），<strong>Vision</strong> 支持图文混合输入，<strong>Embeddings</strong> 是语义搜索和 RAG 的基础。</p>
      </div>

      <FunctionCallBuilder />

      <div className="ai-section">
        <h2 className="ai-section-title">📚 GPT API 四大核心功能</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {OPENAI_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              className="ai-btn gpt"
              style={{ flex: 1, minWidth: 110, padding: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem',
                opacity: activeTopic === i ? 1 : 0.4,
                transform: activeTopic === i ? 'scale(1.03)' : 'scale(1)',
                background: activeTopic === i ? `${topic.color}15` : 'rgba(16,185,129,0.03)' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#10b981' }}/><div className="ai-code-dot" style={{ background: '#10b981', opacity: 0.5 }}/><div className="ai-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/basics')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/gemini')}>下一模块：Gemini API →</button>
      </div>
    </div>
  );
}
