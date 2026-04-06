import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PRODUCTION_CODE = `# 生产 AI 应用最佳实践：安全 / 缓存 / 监控 / 成本

# ══════════════ 1. API Key 安全管理 ══════════════
# ❌ 绝对禁止：硬编码 API Key
client = openai.OpenAI(api_key="sk-proj-xxxxxxxx")   # 永远不要这样！

# ✅ 正确方式：环境变量
import os
from functools import lru_cache

@lru_cache(maxsize=1)
def get_openai_client():
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY 环境变量未设置！")
    return openai.OpenAI(api_key=key)

# 生产环境：使用 AWS Secrets Manager / HashiCorp Vault
import boto3
import json

def get_secret(secret_name: str) -> dict:
    client = boto3.client("secretsmanager", region_name="us-east-1")
    resp = client.get_secret_value(SecretId=secret_name)
    return json.loads(resp["SecretString"])

secrets = get_secret("prod/ai-api-keys")
openai_key = secrets["OPENAI_API_KEY"]

# ══════════════ 2. 语义缓存（省 80% 成本！）══════════════
import hashlib
import redis
import openai

redis_client = redis.Redis(host="localhost", decode_responses=True)

async def cached_completion(prompt: str, model: str = "gpt-4o", ttl: int = 3600) -> str:
    # 生成缓存 Key（根据 prompt + model 的哈希）
    cache_key = f"ai:{model}:{hashlib.sha256(prompt.encode()).hexdigest()}"
    
    # 1. 先查缓存
    cached = redis_client.get(cache_key)
    if cached:
        return cached  # Cache Hit：0 Token 消耗！
    
    # 2. 缓存未命中，调用 API
    client = openai.AsyncOpenAI()
    resp = await client.chat.completions.create(
        model=model, messages=[{"role":"user","content":prompt}]
    )
    result = resp.choices[0].message.content
    
    # 3. 写入缓存（TTL 1小时）
    redis_client.setex(cache_key, ttl, result)
    return result

# 更智能：语义缓存（相似问题命中同一缓存）
# pip install gptcache
from gptcache import cache
from gptcache.embedding import Onnx

cache.init(embedding_func=Onnx().to_embeddings)
# 相似度 > 0.85 的问题直接返回缓存！

# ══════════════ 3. Token 成本监控 ══════════════
from dataclasses import dataclass
from prometheus_client import Counter, Histogram, Gauge

token_counter = Counter("ai_tokens_total", "Total AI tokens", 
                        ["model", "type"])   # type=input/output
cost_counter   = Counter("ai_cost_usd_total", "Total AI cost in USD", ["model"])
latency_hist   = Histogram("ai_request_duration_seconds", "AI request latency", ["model"])

COSTS_PER_TOKEN = {
    "gpt-4o":           {"input": 0.0000025, "output": 0.0000100},
    "gpt-4o-mini":      {"input": 0.00000015,"output": 0.00000060},
    "claude-3-5-sonnet":{"input": 0.0000030, "output": 0.0000150},
    "gemini-2.0-flash": {"input": 0.00000010,"output": 0.00000040},
}

async def tracked_completion(prompt: str, model: str = "gpt-4o") -> str:
    import time
    start = time.perf_counter()
    
    client = openai.AsyncOpenAI()
    resp = await client.chat.completions.create(
        model=model, messages=[{"role":"user","content":prompt}]
    )
    
    latency = time.perf_counter() - start
    inp  = resp.usage.prompt_tokens
    out  = resp.usage.completion_tokens
    
    costs = COSTS_PER_TOKEN.get(model, {"input":0,"output":0})
    cost = inp * costs["input"] + out * costs["output"]
    
    # Prometheus 指标
    latency_hist.labels(model=model).observe(latency)
    token_counter.labels(model=model, type="input").inc(inp)
    token_counter.labels(model=model, type="output").inc(out)
    cost_counter.labels(model=model).inc(cost)
    
    return resp.choices[0].message.content

# ══════════════ 4. 输入输出安全过滤 ══════════════
class ContentGuard:
    BLOCKED_PATTERNS = [
        "ignore all previous instructions",
        "你现在是", "act as DAN",   # 角色劫持攻击
    ]
    
    def validate_input(self, text: str) -> bool:
        """检测 Prompt Injection 攻击"""
        text_lower = text.lower()
        for pattern in self.BLOCKED_PATTERNS:
            if pattern.lower() in text_lower:
                return False
        if len(text) > 100000:   # 拒绝超长输入（可能的 Token 爆炸攻击）
            return False
        return True
    
    def validate_output(self, text: str) -> str:
        """后处理：过滤不安全内容"""
        # 1. 移除可能的 PII（正则）
        import re
        text = re.sub(r'\\b\\d{3}-\\d{2}-\\d{4}\\b', '[REDACTED-SSN]', text)
        text = re.sub(r'\\b[A-Za-z0-9+/]{20,}={0,2}\\b', '[POSSIBLE-SECRET]', text)
        return text

guard = ContentGuard()

async def safe_completion(user_input: str) -> str:
    if not guard.validate_input(user_input):
        raise ValueError("输入包含不安全内容，请求被拒绝")
    
    result = await tracked_completion(user_input)
    return guard.validate_output(result)`;

const BEST_PRACTICES = [
  { cat: '🔐 API 安全', items: ['绝不硬编码 Key，使用 Secrets Manager', 'Key 轮换：每90天更换一次', '最小权限：每个服务独立 Key', 'IP 白名单（企业级）'] },
  { cat: '💰 成本控制', items: ['max_tokens 设上限（防爆炸）', '语义缓存（省 80% 重复调用）', '按任务选模型（mini 够用用 mini）', '监控每个端点的 Token 消耗'] },
  { cat: '🛡️ 输入安全', items: ['检测 Prompt Injection 攻击', '限制输入长度（Token预算）', '敏感信息过滤（PII）', '输出内容审核（Moderation API）'] },
  { cat: '📊 可观测性', items: ['Prometheus + Grafana 监控', '记录 P50/P99 延迟', '按模型统计成本（日/月）', 'LangSmith / Helicone 追踪'] },
];

export default function LessonProduction() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ai">
      <div className="ai-badge red">🚀 module_08 — 生产最佳实践</div>
      <div className="ai-hero">
        <h1>生产最佳实践：API 安全 / 缓存 / 成本监控 / 内容过滤</h1>
        <p>AI 应用上生产不是"让模型跑起来"就结束。真正挑战在于：<strong>API Key 泄漏</strong>（国内外均有大量案例）、成本失控（一个 Bug 导致百万次重复调用）、Prompt Injection 攻击。语义缓存可节省 80% 重复调用成本。</p>
      </div>

      <div className="ai-grid-2">
        {BEST_PRACTICES.map(bp => (
          <div key={bp.cat} className="ai-card">
            <div style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.88rem', marginBottom: '0.5rem' }}>{bp.cat}</div>
            {bp.items.map(it => <div key={it} style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: '0.18rem' }}>▸ {it}</div>)}
          </div>
        ))}
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">🔧 生产级代码：安全 + 缓存 + 监控</h2>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#ef4444' }}/><div className="ai-code-dot" style={{ background: '#f59e0b' }}/><div className="ai-code-dot" style={{ background: '#10b981' }}/><span style={{ color: '#f87171', marginLeft: '0.5rem' }}>🚀 production_ai.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{PRODUCTION_CODE}</div>
        </div>
      </div>

      {/* 结课卡 */}
      <div className="ai-section">
        <div className="ai-card" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.05),rgba(139,92,246,0.03),rgba(16,185,129,0.03))', border: '1px solid rgba(99,102,241,0.15)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#a78bfa', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成 AI API 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.4rem', textAlign: 'left', marginBottom: '1rem' }}>
            {[
              '✅ 模型对比 + Token成本计算器（9个模型实时成本）',
              '✅ GPT Function Calling 4步逐步演示 + Chat/Vision/Embeddings',
              '✅ Gemini 1M Context对比图 + 多模态/Grounding/流式代码',
              '✅ Claude 三平台能力对比表 + Tool Use/Extended Thinking/PDF',
              '✅ Prompt工坊（4技术效果进度条+实时Prompt预览）',
              '✅ 流式vs批量动画（打字机效果）+ 并发/限流/重试代码',
              '✅ 任务路由演示（5类任务→自动选模型）+ LiteLLM Fallback',
              '✅ 生产安全/语义缓存/成本监控/Prompt Injection防护代码',
            ].map(s => <div key={s} style={{ fontSize: '0.76rem', color: '#64748b' }}>{s}</div>)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f97316' }}>
            📚 延伸阅读：OpenAI Cookbook · Anthropic Prompt Library · Google AI Studio · LiteLLM Docs · LangSmith
          </div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/routing')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
