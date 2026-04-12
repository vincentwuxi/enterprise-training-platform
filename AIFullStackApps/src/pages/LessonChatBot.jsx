import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 02 — 智能 ChatBot
   多轮对话 / 流式输出 / 工具调用 / 记忆
   ───────────────────────────────────────────── */

const FEATURES = [
  { name: '流式输出', icon: '🌊', tag: 'SSE', 
    code: `# ─── FastAPI SSE Streaming ───
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from openai import OpenAI
import json

app = FastAPI()
client = OpenAI()

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """流式聊天接口"""
    async def generate():
        stream = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": request.system},
                *request.history,  # 多轮上下文
                {"role": "user", "content": request.message},
            ],
            stream=True,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                data = {"content": chunk.choices[0].delta.content}
                yield f"data: {json.dumps(data)}\\n\\n"
        yield "data: [DONE]\\n\\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )

# ─── Next.js 前端 (Vercel AI SDK) ───
# app/api/chat/route.ts
import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}` },
  { name: '工具调用', icon: '🔧', tag: 'Function Calling',
    code: `# ─── LLM 工具调用 (Function Calling) ───
from openai import OpenAI
import json

client = OpenAI()

# 定义工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_database",
            "description": "搜索产品数据库",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "搜索关键词"},
                    "category": {"type": "string", "enum": ["电子", "服装", "食品"]},
                    "max_price": {"type": "number", "description": "最高价格"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_order",
            "description": "为用户创建订单",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string"},
                    "quantity": {"type": "integer", "minimum": 1}
                },
                "required": ["product_id", "quantity"]
            }
        }
    }
]

# Agent 循环
def agent_loop(user_message, history):
    messages = history + [{"role": "user", "content": user_message}]
    
    while True:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
        )
        msg = response.choices[0].message
        messages.append(msg)
        
        # 没有工具调用 → 返回最终回复
        if not msg.tool_calls:
            return msg.content
        
        # 执行工具调用
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)
            result = execute_tool(call.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result)
            })` },
  { name: '记忆系统', icon: '🧠', tag: 'Memory',
    code: `# ─── 三层记忆架构 ───
from typing import List, Dict
import redis
import json
from datetime import datetime

class ChatMemory:
    """三层记忆: 短期(对话) + 中期(会话摘要) + 长期(用户画像)"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.redis = redis.Redis()
    
    # ── 短期记忆: 当前对话 (最近 N 轮) ──
    def get_short_term(self, limit=20) -> List[Dict]:
        key = f"chat:{self.user_id}:messages"
        messages = self.redis.lrange(key, -limit, -1)
        return [json.loads(m) for m in messages]
    
    def add_message(self, role: str, content: str):
        key = f"chat:{self.user_id}:messages"
        self.redis.rpush(key, json.dumps({
            "role": role, "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }))
        self.redis.expire(key, 3600 * 24)  # 24小时过期
    
    # ── 中期记忆: 会话摘要 ──
    def summarize_session(self, messages: List[Dict]) -> str:
        """用 LLM 压缩长对话为摘要"""
        summary = client.chat.completions.create(
            model="gpt-4o-mini",  # 用便宜模型做摘要
            messages=[{
                "role": "system",
                "content": "将以下对话压缩为简洁摘要，保留关键信息和用户偏好"
            }, {
                "role": "user",
                "content": json.dumps(messages, ensure_ascii=False)
            }],
        )
        return summary.choices[0].message.content
    
    # ── 长期记忆: 用户画像 (PostgreSQL) ──
    def update_profile(self, key: str, value: str):
        """持久化用户偏好"""
        # INSERT INTO user_profiles (user_id, key, value)
        # ON CONFLICT (user_id, key) DO UPDATE SET value = $3
        pass
    
    # ── 组装最终 Context ──
    def build_context(self) -> str:
        profile = self.get_profile()       # 长期
        summaries = self.get_summaries()    # 中期
        recent = self.get_short_term(10)   # 短期
        
        return f"""## 用户画像
{profile}

## 历史摘要
{summaries}

## 最近对话
{json.dumps(recent, ensure_ascii=False)[:2000]}"""` },
  { name: '安全护栏', icon: '🛡️', tag: 'Guardrails',
    code: `# ─── 输入/输出安全护栏 ───
from pydantic import BaseModel
from enum import Enum

class SafetyCheck(BaseModel):
    is_safe: bool
    category: str  # "safe" | "injection" | "jailbreak" | "pii" | "toxic"
    confidence: float
    action: str    # "allow" | "block" | "warn" | "redact"

# 1. Prompt Injection 检测
INJECTION_PATTERNS = [
    r"ignore (?:all )?(?:previous|above) instructions",
    r"you are now",
    r"system prompt",
    r"\\[INST\\]|\\[/INST\\]",
    r"<\\|im_start\\|>",
]

def check_injection(text: str) -> SafetyCheck:
    """检测 Prompt Injection 攻击"""
    import re
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return SafetyCheck(
                is_safe=False, category="injection",
                confidence=0.95, action="block"
            )
    return SafetyCheck(is_safe=True, category="safe",
                       confidence=0.9, action="allow")

# 2. PII 脱敏
def redact_pii(text: str) -> str:
    """脱敏个人信息"""
    import re
    text = re.sub(r'\\b\\d{11}\\b', '[PHONE]', text)     # 手机号
    text = re.sub(r'\\b\\d{18}\\b', '[ID_CARD]', text)   # 身份证
    text = re.sub(r'[\\w.]+@[\\w.]+', '[EMAIL]', text)   # 邮箱
    return text

# 3. 输出安全检查
def check_output(response: str) -> SafetyCheck:
    """检查 LLM 输出是否安全"""
    result = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": "判断以下 AI 回复是否包含有害/不当内容。返回 JSON: {safe: bool, reason: str}"
        }, {
            "role": "user",
            "content": response
        }],
        response_format={"type": "json_object"},
    )
    return parse_safety_result(result)

# 4. 完整管道
async def safe_chat(user_message: str) -> str:
    # 输入检查
    input_check = check_injection(user_message)
    if not input_check.is_safe:
        return "抱歉，我无法处理该请求。"
    
    # PII 脱敏
    sanitized = redact_pii(user_message)
    
    # LLM 推理
    response = await generate_response(sanitized)
    
    # 输出检查
    output_check = check_output(response)
    if not output_check.is_safe:
        return "抱歉，生成的内容不符合安全标准。"
    
    return response` },
];

export default function LessonChatBot() {
  const [featIdx, setFeatIdx] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🧩 module_02 — 智能 ChatBot</div>
      <div className="fs-hero">
        <h1>智能 ChatBot：从玩具到生产级对话系统</h1>
        <p>
          一个玩具 ChatBot 只需要 10 行代码，但生产级需要<strong>流式输出 (SSE)</strong>、
          <strong>Function Calling 工具调用</strong>、<strong>三层记忆架构</strong>、
          <strong>安全护栏</strong>。本模块给你一个可以卖钱的 ChatBot 架构。
        </p>
      </div>

      {/* Feature tabs */}
      <div className="fs-section">
        <h2 className="fs-section-title">⚡ 四大核心能力</h2>
        <div className="fs-pills">
          {FEATURES.map((f, i) => (
            <button key={i} className={`fs-btn ${i === featIdx ? 'primary' : ''}`}
              onClick={() => setFeatIdx(i)}>
              {f.icon} {f.name}
            </button>
          ))}
        </div>
        <div className="fs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#a78bfa' }}>{FEATURES[featIdx].icon} {FEATURES[featIdx].name}</h3>
            <span className="fs-tag cyan">{FEATURES[featIdx].tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 chatbot_{FEATURES[featIdx].name}.py
            </div>
            <pre className="fs-code">{FEATURES[featIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* Architecture overview */}
      <div className="fs-section">
        <h2 className="fs-section-title">🏗️ 生产 ChatBot 架构</h2>
        <div className="fs-card">
          <div className="fs-flow">
            {[
              { label: '🛡️ 护栏', bg: '#ef4444' }, { label: '🧠 记忆', bg: '#8b5cf6' },
              { label: '🔧 路由', bg: '#f59e0b' }, { label: '🤖 LLM', bg: '#22c55e' },
              { label: '🔄 工具', bg: '#06b6d4' }, { label: '🌊 流式', bg: '#3b82f6' },
            ].map((n, i, arr) => (
              <React.Fragment key={i}>
                <div className="fs-flow-node" style={{ background: `${n.bg}22`, border: `1px solid ${n.bg}44`, color: n.bg }}>{n.label}</div>
                {i < arr.length - 1 && <span className="fs-flow-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="fs-grid-3" style={{ marginTop: '1rem' }}>
            <div className="fs-alert info"><strong>📊 关键指标</strong><br/>• TTFT &lt; 500ms<br/>• Token/s &gt; 40<br/>• 错误率 &lt; 0.1%</div>
            <div className="fs-alert success"><strong>✅ 必须有</strong><br/>• 流式输出<br/>• 打字机效果<br/>• 重试机制</div>
            <div className="fs-alert warning"><strong>⚠️ 常见坑</strong><br/>• Token 超限截断<br/>• 并发连接泄漏<br/>• 上下文膨胀</div>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← AI 全栈架构</button>
        <button className="fs-btn amber">RAG 知识库 →</button>
      </div>
    </div>
  );
}
