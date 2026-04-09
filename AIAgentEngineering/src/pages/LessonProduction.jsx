import { useState } from 'react';
import './LessonCommon.css';

export default function LessonProduction() {
  const [tab, setTab] = useState('langsmith');

  const codes = {
    langsmith: `# ━━━━ LangSmith：Agent 可观测性平台 ━━━━

import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"
os.environ["LANGCHAIN_PROJECT"] = "production-agent-v2"

# 以上配置后，所有 LangChain/LangGraph 调用自动追踪！

# ━━━━ 自定义追踪（关键路径）━━━━
from langsmith import traceable

@traceable(name="research_pipeline", tags=["critical"])
async def research_agent_run(query: str) -> str:
    """追踪整个 research pipeline"""
    # 所有内部调用（包括 LLM / 工具）都会被记录
    results = await agent.ainvoke({"input": query})
    return results["output"]

# ━━━━ 在 LangSmith Dashboard 可以看到 ━━━━
# - 每次调用的完整 Trace（输入/输出/每步耗时）
# - LLM Token 使用量和费用
# - 工具调用记录
# - 错误和异常信息
# - Latency P50/P95/P99 分布

# ━━━━ 数据集 + 评估（A/B 测试 Agent）━━━━
from langsmith import Client

client = Client()

# 创建评估数据集
dataset = client.create_dataset("agent-eval-v1")
client.create_examples(
    inputs=[{"query": "2024年GPU市场份额？"}],
    outputs=[{"expected": "NVIDIA 约 88% 份额..."}],
    dataset_id=dataset.id,
)

# 运行评估（对比两个 Agent 版本）
from langsmith.evaluation import evaluate, LangChainStringEvaluator

correctness_eval = LangChainStringEvaluator(
    "qa",
    config={"llm": ChatOpenAI(model="gpt-4o")},
)

results = evaluate(
    lambda inputs: research_agent_run(inputs["query"]),
    data=dataset.name,
    evaluators=[correctness_eval],
    experiment_prefix="agent-v2-test",
)`,

    reliability: `# ━━━━ 生产可靠性工程 ━━━━

import asyncio, time
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import RateLimitError, APIConnectionError

# ━━━━ 1. 带指数退避的重试 ━━━━
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=30),
    retry=retry_if_exception_type((RateLimitError, APIConnectionError)),
    reraise=True,
)
async def reliable_llm_call(messages: list) -> str:
    return await llm.ainvoke(messages)

# ━━━━ 2. 超时控制（防止 Agent 卡死）━━━━
async def agent_with_timeout(input: str, timeout_s: int = 60) -> str:
    try:
        return await asyncio.wait_for(
            agent.ainvoke({"input": input}),
            timeout=timeout_s,
        )
    except asyncio.TimeoutError:
        return "Agent 执行超时（60s），请简化问题或稍后重试"

# ━━━━ 3. 成本控制（Token 预算）━━━━
class TokenBudgetManager:
    def __init__(self, max_tokens_per_session: int = 50000):
        self.max_tokens = max_tokens_per_session
        self.used_tokens = 0
    
    def check_budget(self, estimated_tokens: int) -> bool:
        return (self.used_tokens + estimated_tokens) <= self.max_tokens
    
    def record_usage(self, tokens_used: int):
        self.used_tokens += tokens_used
        if self.used_tokens > self.max_tokens * 0.8:
            print(f"⚠️ 已使用 {self.used_tokens}/{self.max_tokens} tokens（80%）")

# ━━━━ 4. 并发控制（防止 API 限流）━━━━
semaphore = asyncio.Semaphore(5)  # 最多5个并发 Agent

async def rate_limited_agent(input: str) -> str:
    async with semaphore:  # 超过5个请求时自动排队
        return await agent.ainvoke({"input": input})

# ━━━━ 5. 错误分类与处理 ━━━━
class AgentError(Exception):
    pass

class ToolExecutionError(AgentError):
    """工具执行失败"""
    pass

class MaxIterationsError(AgentError):
    """超过最大迭代次数"""
    pass

class SafetyFilterError(AgentError):
    """安全过滤器拦截"""
    pass

async def safe_agent_run(input: str) -> dict:
    try:
        result = await agent.ainvoke({"input": input})
        return {"status": "success", "output": result["output"]}
    except MaxIterationsError:
        return {"status": "max_iter", "output": "任务过于复杂，请拆分后重试"}
    except ToolExecutionError as e:
        return {"status": "tool_error", "output": f"工具执行失败：{e}"}
    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)
        return {"status": "error", "output": "系统异常，已记录日志"}`,

    cost: `# ━━━━ 成本监控与优化 ━━━━

from openai import OpenAI
import tiktoken

# ━━━━ Token 计算（事前估算）━━━━
def count_tokens(text: str, model: str = "gpt-4o-mini") -> int:
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))

# ━━━━ 成本追踪回调 ━━━━
from langchain_core.callbacks import BaseCallbackHandler

class CostTracker(BaseCallbackHandler):
    PRICES = {  # per 1M tokens, USD
        "gpt-4o":       {"input": 5.0,  "output": 15.0},
        "gpt-4o-mini":  {"input": 0.15, "output": 0.60},
        "claude-3-5-sonnet": {"input": 3.0, "output": 15.0},
    }
    
    def __init__(self):
        self.total_cost = 0.0
        self.call_count = 0
    
    def on_llm_end(self, response, **kwargs):
        usage = response.llm_output.get("token_usage", {})
        model = response.llm_output.get("model_name", "gpt-4o-mini")
        prices = self.PRICES.get(model, {"input": 0.15, "output": 0.60})
        
        cost = (
            usage.get("prompt_tokens", 0) * prices["input"] / 1_000_000 +
            usage.get("completion_tokens", 0) * prices["output"] / 1_000_000
        )
        self.total_cost += cost
        self.call_count += 1

# ━━━━ 成本优化策略 ━━━━
# 1. 模型路由：简单任务用 gpt-4o-mini，复杂任务用 gpt-4o
def route_model(task_complexity: str) -> str:
    return "gpt-4o" if task_complexity == "high" else "gpt-4o-mini"

# 2. 提示词压缩（减少输入 Token）
from langchain.retrievers.document_compressors import LLMChainExtractor
compressor = LLMChainExtractor.from_llm(llm)

# 3. 响应缓存（相同输入直接返回）
from langchain.cache import RedisSemanticCache
from langchain.globals import set_llm_cache

set_llm_cache(RedisSemanticCache(
    redis_url="redis://localhost:6379",
    embedding=OpenAIEmbeddings(),
    score_threshold=0.95,  # 相似度 > 95% 直接用缓存
))`,
  };

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 06 · PRODUCTION AGENT</div>
        <h1>Agent 生产实战</h1>
        <p>Demo 阶段的 Agent 成功率可以很高，但生产环境面对真实用户，稳定性、成本、可观测性缺一不可。<strong>LangSmith 追踪、重试机制、Token 预算、并发控制</strong>是生产 Agent 的标配。</p>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">⚙️ 生产工程三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['langsmith', '🔭 LangSmith 可观测性'], ['reliability', '🛡️ 可靠性工程'], ['cost', '💰 成本控制']].map(([k, l]) => (
            <button key={k} className={`ag-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ag-code-wrap">
          <div className="ag-code-head">
            <div className="ag-code-dot" style={{ background: '#ef4444' }} /><div className="ag-code-dot" style={{ background: '#f59e0b' }} /><div className="ag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_production.py</span>
          </div>
          <div className="ag-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">📊 生产 Agent SLA 参考指标</div>
        <div className="ag-grid-4">
          {[
            { v: '<5s', l: '简单查询 P95 延迟目标' },
            { v: '<60s', l: '复杂任务超时阈值' },
            { v: '>95%', l: '目标任务成功率' },
            { v: '$0.05', l: '每次对话平均成本上限' },
          ].map((s, i) => (
            <div key={i} className="ag-metric">
              <div className="ag-metric-val" style={{ fontSize: '1.2rem' }}>{s.v}</div>
              <div className="ag-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
