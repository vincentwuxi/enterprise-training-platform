import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const GEMINI_TOPICS = [
  {
    name: '基础调用 & 配置', icon: '🚀', color: '#f97316',
    code: `# Google Gemini API 完整指南

import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# ── 模型选择 ──
# gemini-2.0-flash       → 最新最快，日常推荐
# gemini-1.5-pro         → 100万Token上下文，复杂任务
# gemini-1.5-flash-8b    → 极低成本，轻量任务

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config={
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 2048,
        "response_mime_type": "text/plain",  # 或 "application/json"
    },
    safety_settings=[    # 安全过滤器
        {"category": "HARM_CATEGORY_HATE_SPEECH",      "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ],
    system_instruction="你是一位专业的技术讲师，回答要准确、简洁、有例子。"
)

# ── 基础对话 ──
response = model.generate_content("解释什么是 Transformer 架构？")
print(response.text)
print(response.usage_metadata.total_token_count)

# ── 多轮对话（Chat Session）──
# Gemini 原生支持多轮对话，无需手动维护 history
chat = model.start_chat(history=[])

resp1 = chat.send_message("Python 和 JavaScript 的主要区别？")
print(resp1.text)
resp2 = chat.send_message("对于后端开发，我该选哪个？")  # 自动携带上下文
print(resp2.text)

# 访问对话历史
print(chat.history)  # List[Content] 包含所有对话轮次

# ── 系统配置最佳实践 ──
# system_instruction 设置 → 固定模型行为（比 user 消息更权威）
# safety_settings    → 生产环境根据业务场景调整
# generation_config  → temperature 建议: 事实类=0.1, 创意类=1.0`,
  },
  {
    name: '多模态 & 1M 上下文', icon: '🖼️', color: '#3b82f6',
    code: `# Gemini 多模态：文字 + 图片 + 音频 + 视频

import google.generativeai as genai
import PIL.Image
from pathlib import Path

model = genai.GenerativeModel("gemini-1.5-pro")   # 多模态用 Pro

# ── 1. 图片理解（本地文件）──
image = PIL.Image.open("chart.png")
response = model.generate_content([
    "这张图表显示了什么趋势？请用数字说明。",
    image
])
print(response.text)

# ── 2. 多图片对比 ──
img1 = PIL.Image.open("before.png")
img2 = PIL.Image.open("after.png")
response = model.generate_content([
    "对比这两张UI截图的差异，并列出具体改动：",
    img1, "和", img2
])

# ── 3. 超长文档分析（1M Token 上下文！）──
# 约等于 750页 PDF、100小时视频字幕、整个代码库
with open("large_codebase.py", "r") as f:
    code = f.read()   # 假设 500KB 的代码

response = model.generate_content([
    f"分析以下代码库，找出所有安全漏洞：\n\n{code}"
])

# ── 4. 音频转录+分析（仅 Gemini 1.5+）──
audio_file = genai.upload_file("meeting.mp3", mime_type="audio/mp3")
response = model.generate_content([
    "请转录并总结这段会议音频，提取所有 Action Items：",
    audio_file
])

# ── 5. 视频分析（YouTube 链接！）──
response = model.generate_content([
    genai.protos.Part(file_data=genai.protos.FileData(
        file_uri="https://youtu.be/dQw4w9WgXcQ"  # YouTube URL 直接用！
    )),
    "这个视频讲了什么？列出5个关键点"
])

# ── 文件上传（用于大型媒体）──
uploaded = genai.upload_file(path="document.pdf", display_name="合同文档")
print(f"文件 URI: {uploaded.uri}")   # 保存 URI 后续可复用（72小时有效）`,
  },
  {
    name: 'Grounding（联网）', icon: '🌐', color: '#10b981',
    code: `# Gemini Grounding：让模型搜索最新信息

import google.generativeai as genai
from google.generativeai.types import Tool, GoogleSearchRetrieval

# ── 方式1：Google Search Grounding（自动联网）──
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    tools=[Tool(google_search_retrieval=GoogleSearchRetrieval())]
)

# 模型自动判断是否需要联网搜索
response = model.generate_content(
    "最新的 GPT-5 发布了吗？有什么新特性？"   # 训练数据截止后的问题
)

# 查看搜索来源（Grounding Metadata）
for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
    print(f"来源: {chunk.web.uri}")
    print(f"标题: {chunk.web.title}")

print(response.text)   # 包含最新搜索结果的回答！

# ── 方式2：Vertex AI Search（企业内部知识库）──
from google.cloud.aiplatform_v1beta1.types import SafetySetting

# 需要配置 Vertex AI Search 数据存储
model_grounded = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    tools=[Tool(retrieval=genai.types.Retrieval(
        vertex_ai_search=genai.types.VertexAISearch(
            datastore="projects/my-project/locations/us/collections/default/dataStores/my-docs"
        )
    ))]
)

# 查询企业内部文档（RAG 的 Gemini 原生实现）
response = model_grounded.generate_content("我们公司的请假政策是什么？")

# ── 方式3：Code Execution（在沙箱执行 Python）──
model_code = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    tools=[genai.types.Tool(code_execution=genai.types.CodeExecution())]
)

response = model_code.generate_content(
    "帮我计算 1 到 1000 内所有质数的和，并画出分布直方图"
)
# Gemini 自动生成并执行 Python 代码，返回计算结果和图表！
print(response.text)  # 包含代码执行结果`,
  },
  {
    name: '流式 & 异步', icon: '⚡', color: '#8b5cf6',
    code: `# Gemini 流式输出 + 异步调用

import google.generativeai as genai
import asyncio

model = genai.GenerativeModel("gemini-2.0-flash")

# ── 1. 同步流式输出（Streaming）──
# 用户体验 = 看到模型逐字输出，而非等待全文
response = model.generate_content(
    "写一篇500字的科技文章介绍量子计算",
    stream=True   # 开启流式！
)

import sys
for chunk in response:
    if chunk.text:
        print(chunk.text, end="", flush=True)  # 实时打印
print()  # 换行

# 获取最终使用情况（流式结束后）
print(f"总 Tokens: {response.usage_metadata.total_token_count}")

# ── 2. 异步流式输出（推荐！配合 FastAPI/aiohttp）──
async def stream_to_frontend(prompt: str):
    """配合 FastAPI SSE 实现流式 API"""
    async for chunk in await model.generate_content_async(
        prompt, stream=True
    ):
        if chunk.text:
            yield f"data: {chunk.text}\n\n"   # SSE 格式
    yield "data: [DONE]\n\n"

# ── 3. FastAPI + Gemini 流式 API 端点 ──
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/stream")
async def stream_chat(prompt: str):
    return StreamingResponse(
        stream_to_frontend(prompt),
        media_type="text/event-stream",
        headers={
            "X-Accel-Buffering": "no",    # 关闭 nginx 缓冲
            "Cache-Control": "no-cache",
        }
    )

# ── 4. 并发批量调用（省时间）──
async def batch_generate(prompts: list[str]) -> list[str]:
    tasks = [model.generate_content_async(p) for p in prompts]
    responses = await asyncio.gather(*tasks)   # 并发执行！
    return [r.text for r in responses]

# 串行：10个任务 × 2秒 = 20秒
# 并发：10个任务同时发出，等最慢的一个 ≈ 2秒！
results = asyncio.run(batch_generate(["问题1", "问题2", "问题3"]))`,
  },
];

// Context Window 对比可视化
function ContextWindowViz() {
  const CONTEXTS = [
    { model: 'GPT-4o', tokens: 128000, color: '#10b981', equiv: '300页' },
    { model: 'Claude-3.5-Sonnet', tokens: 200000, color: '#f59e0b', equiv: '500页' },
    { model: 'Gemini 1.5 Pro', tokens: 1000000, color: '#f97316', equiv: '2500页' },
    { model: 'GPT-4o-mini', tokens: 128000, color: '#34d399', equiv: '300页' },
    { model: 'Gemini Flash', tokens: 1000000, color: '#fb923c', equiv: '2500页' },
  ];
  const MAX = 1000000;

  return (
    <div className="ai-interactive">
      <h3>📏 Context Window 对比（1M+ 是 Gemini 的最大差异化优势）</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {CONTEXTS.map(c => (
          <div key={c.model} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ minWidth: 170, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>{c.model}</div>
            <div style={{ flex: 1 }}>
              <div className="ai-progress">
                <div className="ai-progress-fill" style={{ width: `${c.tokens / MAX * 100}%`, background: c.color }} />
              </div>
            </div>
            <div style={{ minWidth: 110, fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 800, color: c.color }}>{(c.tokens/1000).toFixed(0)}K </div>
            <div style={{ minWidth: 60, fontSize: '0.65rem', color: '#475569' }}>≈{c.equiv}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#475569' }}>
        💡 Gemini 1M Token 可以一次性分析整个代码仓库（~300万行代码）或 11 小时视频字幕
      </div>
    </div>
  );
}

export default function LessonGemini() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = GEMINI_TOPICS[activeTopic];

  return (
    <div className="lesson-ai">
      <div className="ai-badge gemini">🟠 module_03 — Google Gemini API</div>
      <div className="ai-hero">
        <h1>Google Gemini API：多模态 / 1M上下文 / Grounding / 流式</h1>
        <p>Gemini 的<strong>差异化优势</strong>在于：① 业界最长 100万 Token 上下文；② 原生多模态（文/图/音/视）; ③ Grounding 联网搜索 API；④ 慷慨的免费 Tier（Flash 每天 1500次请求）。</p>
      </div>

      <ContextWindowViz />

      <div className="ai-section">
        <h2 className="ai-section-title">📚 Gemini API 四大核心功能</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {GEMINI_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              className="ai-btn gemini"
              style={{ flex: 1, minWidth: 110, padding: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem',
                opacity: activeTopic === i ? 1 : 0.4,
                transform: activeTopic === i ? 'scale(1.03)' : 'scale(1)',
                background: activeTopic === i ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.03)' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#f97316' }}/><div className="ai-code-dot" style={{ background: '#f97316', opacity: 0.5 }}/><div className="ai-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/openai')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/claude')}>下一模块：Claude API →</button>
      </div>
    </div>
  );
}
