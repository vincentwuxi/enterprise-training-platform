import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 流式输出动画模拟器
function StreamingDemo() {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState('');
  const [mode, setMode] = useState('stream'); // stream | batch
  const [elapsed, setElapsed] = useState(0);
  const [tokensPerSec, setTokensPerSec] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  const DEMO_TEXT = `欢迎使用 Gemini 2.0 Flash 模型！以下是流式输出的演示：

流式输出（Streaming）的核心优势在于用户体验。当模型开始生成文字时，用户会立即看到第一个词，而不是等待整个响应完成后才显示。

这对于长响应尤为重要：
• 用户感知到的延迟从 3-5 秒降低到 < 0.5 秒
• 用户可以在阅读开头时就判断回答是否正确方向
• 可以随时中断，节省 Token 成本

实现方式很简单：在 API 调用中添加 stream=True 参数即可✔`;

  const startStream = () => {
    setText('');
    setElapsed(0);
    setTokensPerSec(0);
    setStreaming(true);
    startRef.current = Date.now();
    let i = 0;
    const chars = DEMO_TEXT.split('');

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setElapsed(elapsed.toFixed(1));
      if (mode === 'stream') {
        const chunkSize = Math.floor(Math.random() * 3) + 1;
        const nextI = Math.min(i + chunkSize, chars.length);
        setText(DEMO_TEXT.slice(0, nextI));
        setTokensPerSec(Math.round(nextI / 4 / elapsed));
        i = nextI;
        if (i >= chars.length) { clearInterval(timerRef.current); setStreaming(false); }
      } else {
        if (elapsed >= 2.5) {
          setText(DEMO_TEXT);
          setTokensPerSec(Math.round(DEMO_TEXT.length / 4 / elapsed));
          clearInterval(timerRef.current);
          setStreaming(false);
        }
      }
    }, mode === 'stream' ? 25 : 100);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div className="ai-interactive">
      <h3>⚡ 流式 vs 批量输出体验对比（点击感受差异）</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['stream', 'batch'].map(m => (
          <button key={m} onClick={() => { setMode(m); setText(''); }}
            className={`ai-btn ${m === 'stream' ? 'gpt' : 'blue'}`}
            style={{ opacity: mode === m ? 1 : 0.4, fontWeight: mode === m ? 800 : 500 }}>
            {m === 'stream' ? '⚡ 流式输出（推荐）' : '⏳ 批量等待'}
          </button>
        ))}
        <button className="ai-btn primary" onClick={startStream} disabled={streaming} style={{ fontSize: '0.8rem' }}>
          {streaming ? '生成中...' : '▶ 开始演示'}
        </button>
        {text && <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
          {elapsed}s · {tokensPerSec} tok/s
        </div>}
      </div>

      <div style={{ minHeight: 100, background: '#05050f', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(99,102,241,0.1)' }}>
        {!text && !streaming && <div style={{ color: '#334155', fontSize: '0.75rem', fontStyle: 'italic' }}>// 点击「开始演示」查看效果...</div>}
        {mode === 'batch' && streaming && <div style={{ color: '#64748b', fontSize: '0.78rem' }}>⏳ 等待模型返回完整响应...</div>}
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {text}{streaming && mode === 'stream' && <span className="ai-cursor" />}
        </div>
      </div>
      {mode === 'batch' && text && <div style={{ marginTop: '0.3rem', fontSize: '0.68rem', color: '#ef4444' }}>❌ 用户等待了 {elapsed}s 才看到第一个字</div>}
      {mode === 'stream' && text === DEMO_TEXT && <div style={{ marginTop: '0.3rem', fontSize: '0.68rem', color: '#10b981' }}>✅ 流式输出：第一个字在 0.1s 内显示，用户感知延迟极低</div>}
    </div>
  );
}

const STREAMING_CODE = `# 流式输出 + 并发处理 + 限流重试 完整实现

import asyncio
import openai
from anthropic import Anthropic
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# ══════════════ 1. 三大平台流式输出 ══════════════

# OpenAI 流式
async def openai_stream(prompt: str):
    client = openai.AsyncOpenAI()
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta  # 生成器：yield 每个文字片段

# Claude 流式
async def claude_stream(prompt: str):
    client = Anthropic()
    with client.messages.stream(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text

# Gemini 流式
async def gemini_stream(prompt: str):
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text

# ══════════════ 2. FastAPI SSE 流式 API ══════════════
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/v1/stream")
async def stream_endpoint(request: dict):
    model  = request.get("model", "gpt-4o")
    prompt = request["prompt"]
    
    async def event_generator():
        generator = (openai_stream if "gpt" in model
                     else claude_stream if "claude" in model
                     else gemini_stream)
        async for text in generator(prompt):
            # SSE 格式（前端用 EventSource 接收）
            yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"}
    )

# ══════════════ 3. 并发批量调用（大幅提速）══════════════
async def batch_generate_concurrent(
    prompts: list[str],
    model: str = "gpt-4o-mini",
    max_concurrency: int = 10,   # 限制并发数（避免触发限流）
) -> list[str]:
    client = openai.AsyncOpenAI()
    semaphore = asyncio.Semaphore(max_concurrency)
    
    async def one_call(prompt: str) -> str:
        async with semaphore:   # 限制同时进行的请求数
            resp = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.choices[0].message.content
    
    # 全部并发！1000个请求 ≈ 1000/10 = 100批 × 2s = 200s
    # vs 串行：1000 × 2s = 2000s（快 10倍！）
    tasks = [one_call(p) for p in prompts]
    return await asyncio.gather(*tasks)

# ══════════════ 4. 自动限流重试（必备！）══════════════
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=60),  # 指数退避
    retry=retry_if_exception_type((
        openai.RateLimitError,
        openai.APITimeoutError,
        openai.APIConnectionError,
    )),
    before_sleep=lambda rs: print(f"限流重试 {rs.attempt_number}/5，等待 {rs.next_action.sleep:.1f}s"),
)
async def robust_call(prompt: str) -> str:
    client = openai.AsyncOpenAI()
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        timeout=30,   # 设置超时！
    )
    return resp.choices[0].message.content`;

export default function LessonStreaming() {
  const navigate = useNavigate();
  return (
    <div className="lesson-ai">
      <div className="ai-badge blue">⚡ module_06 — 流式输出 & 并发</div>
      <div className="ai-hero">
        <h1>流式输出 & 并发处理：SSE / 异步批量 / 限流重试</h1>
        <p>流式输出将用户感知延迟从 <strong>3-5 秒</strong>降到 <strong>{'<'}0.5 秒</strong>。异步并发批量调用让 1000 个任务的处理时间从 2000 秒降至 200 秒。配合自动限流重试，构建健壮的 AI 应用。</p>
      </div>
      <StreamingDemo />
      <div className="ai-section">
        <h2 className="ai-section-title">🔧 流式 + 并发 + 重试完整代码</h2>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#10b981' }}/><div className="ai-code-dot" style={{ background: '#f59e0b' }}/><div className="ai-code-dot" style={{ background: '#3b82f6' }}/><span style={{ color: '#60a5fa', marginLeft: '0.5rem' }}>⚡ streaming_concurrent.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{STREAMING_CODE}</div>
        </div>
      </div>
      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/prompt')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/routing')}>下一模块：多模型路由 →</button>
      </div>
    </div>
  );
}
