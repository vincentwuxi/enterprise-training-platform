import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 08 — 生产架构
   负载均衡 / KV Cache / 监控 / 成本优化
   ───────────────────────────────────────────── */

const ARCH_LAYERS = [
  { name: '接入层', icon: '🌐', color: '#3b82f6',
    components: ['Nginx / Envoy / Kong', 'Rate Limiter', 'API Key 鉴权', 'TLS 终止'],
    desc: '流量入口: 鉴权、限流、TLS 终止、请求路由',
    config: `# ─── Nginx 负载均衡配置 ───
upstream llm_backend {
    least_conn;                    # 最少连接策略
    server vllm-1:8000 weight=1;
    server vllm-2:8000 weight=1;
    keepalive 32;                  # 连接池
}

server {
    listen 443 ssl http2;
    server_name api.yourcompany.com;

    # TLS
    ssl_certificate     /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=50r/s;
    
    location /v1/ {
        limit_req zone=api burst=100 nodelay;
        
        proxy_pass http://llm_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # SSE 流式响应
        proxy_buffering off;
        proxy_read_timeout 300s;     # 长推理超时
        proxy_send_timeout 300s;
        
        # 健康检查
        health_check interval=10s fails=3 passes=2;
    }
}` },
  { name: '缓存层', icon: '💾', color: '#22c55e',
    components: ['Semantic Cache', 'Prompt Cache', 'KV Cache 优化', '结果缓存'],
    desc: '减少重复推理: Semantic Cache 命中率可达 30-60%',
    config: `# ─── 语义缓存 (GPTCache / Redis) ───
import hashlib, redis, numpy as np
from sentence_transformers import SentenceTransformer

class SemanticCache:
    def __init__(self, threshold=0.92):
        self.redis = redis.Redis()
        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.threshold = threshold
    
    def get(self, prompt: str) -> str | None:
        """语义相似性匹配缓存"""
        embedding = self.encoder.encode(prompt)
        
        # 在缓存中搜索相似 prompt
        for key in self.redis.scan_iter("cache:*"):
            cached = json.loads(self.redis.get(key))
            similarity = np.dot(embedding, cached["embedding"]) / (
                np.linalg.norm(embedding) * np.linalg.norm(cached["embedding"])
            )
            if similarity > self.threshold:
                return cached["response"]  # 命中！
        return None
    
    def set(self, prompt: str, response: str, ttl=3600):
        """缓存响应"""
        embedding = self.encoder.encode(prompt).tolist()
        key = f"cache:{hashlib.md5(prompt.encode()).hexdigest()}"
        self.redis.setex(key, ttl, json.dumps({
            "prompt": prompt,
            "embedding": embedding,
            "response": response,
        }))

# 使用
cache = SemanticCache(threshold=0.92)

# 请求处理
cached = cache.get(user_prompt)
if cached:
    return cached  # 缓存命中，0 延迟 0 成本
else:
    response = llm.generate(user_prompt)
    cache.set(user_prompt, response)
    return response` },
  { name: '推理层', icon: '🧠', color: '#f97316',
    components: ['vLLM / TGI / Triton', '动态批处理', '多 LoRA 路由', '模型热更新'],
    desc: '核心推理: 高并发、低延迟的 LLM 推理引擎',
    config: `# ─── vLLM 生产参数模板 ───
# 针对 8B 模型 + A100 80GB 优化

vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --tensor-parallel-size 1 \\
  --max-model-len 8192 \\
  --gpu-memory-utilization 0.92 \\
  --max-num-seqs 256 \\                # 最大并发
  --enable-prefix-caching \\           # 前缀复用
  --kv-cache-dtype fp8 \\              # KV Cache 压缩
  --disable-log-requests \\            # 生产关闭日志
  --uvicorn-log-level warning

# ─── 模型热更新 (零停机) ───
# 方案: Blue-Green 部署
# 1. 部署新版本到 Green Pod
# 2. 通过 readinessProbe 确认加载完成
# 3. 切换 Service selector
# 4. 等待 Blue Pod 活跃请求完成
# 5. 下线 Blue Pod` },
  { name: '监控层', icon: '📊', color: '#a78bfa',
    components: ['Prometheus + Grafana', 'vLLM 内置 metrics', 'GPU 监控 (DCGM)', '告警 (AlertManager)'],
    desc: '全方位监控: 推理指标、GPU 利用率、成本跟踪',
    config: `# ─── Prometheus 告警规则 ───
# prometheus/alerts.yml
groups:
- name: llm-alerts
  rules:
  # TTFT 高延迟
  - alert: HighTTFT
    expr: histogram_quantile(0.95,
      vllm_time_to_first_token_seconds_bucket) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "P95 TTFT > 2s"

  # GPU 显存耗尽风险
  - alert: GPUMemoryHigh
    expr: vllm_gpu_cache_usage_perc > 0.95
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "GPU KV Cache > 95%"

  # 请求队列堆积
  - alert: RequestQueueBacklog
    expr: vllm_num_requests_waiting > 50
    for: 3m
    labels:
      severity: warning
    annotations:
      summary: "Pending requests > 50"

  # 错误率过高
  - alert: HighErrorRate
    expr: rate(vllm_request_failure_total[5m])
      / rate(vllm_request_success_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Error rate > 5%"` },
];

const COST_OPT = [
  { strategy: '量化', saving: '50-75%', desc: 'FP16 → INT4 量化，精度损失 <1%', risk: '低' },
  { strategy: '语义缓存', saving: '30-60%', desc: '相似问题直接返回缓存结果', risk: '低' },
  { strategy: 'Spot/竞价实例', saving: '60-80%', desc: '使用云厂商竞价 GPU，但可能被抢占', risk: '中' },
  { strategy: 'KV Cache FP8', saving: '20-30%', desc: 'KV Cache 用 FP8 精度，省显存增并发', risk: '低' },
  { strategy: '前缀共享', saving: '10-40%', desc: '相同 System Prompt 的 KV Cache 复用', risk: '低' },
  { strategy: '小模型路由', saving: '40-70%', desc: '简单问题路由到小模型，复杂问题用大模型', risk: '中' },
  { strategy: '批量推理', saving: '20-50%', desc: '非实时请求攒批处理，提高 GPU 利用率', risk: '低' },
];

export default function LessonProductionArch() {
  const [layerIdx, setLayerIdx] = useState(0);

  return (
    <div className="lesson-deploy">
      <div className="dp-badge indigo">🚀 module_08 — 生产架构</div>

      <div className="dp-hero">
        <h1>生产架构：让你的 LLM 服务千万用户</h1>
        <p>
          部署只是开始，<strong>生产级 LLM 服务</strong>还需要负载均衡、语义缓存、
          GPU 监控、成本优化。本模块给出四层架构的完整配置——从流量入口到成本控制。
        </p>
      </div>

      {/* ─── 四层架构 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🏗️ 生产四层架构</h2>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
          {ARCH_LAYERS.map((l, i) => (
            <div key={i} style={{
              flex: 1, height: '8px', borderRadius: '4px', cursor: 'pointer',
              background: i <= layerIdx ? l.color : 'rgba(255,255,255,0.05)',
              transition: 'background 0.3s'
            }} onClick={() => setLayerIdx(i)} />
          ))}
        </div>
        <div className="dp-pills">
          {ARCH_LAYERS.map((l, i) => (
            <button key={i} className={`dp-btn ${i === layerIdx ? 'primary' : ''}`}
              onClick={() => setLayerIdx(i)} style={{ fontSize: '0.78rem' }}>
              {l.icon} {l.name}
            </button>
          ))}
        </div>

        <div className="dp-card" style={{ borderLeftColor: ARCH_LAYERS[layerIdx].color, borderLeftWidth: '3px' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: ARCH_LAYERS[layerIdx].color }}>
            {ARCH_LAYERS[layerIdx].icon} {ARCH_LAYERS[layerIdx].name}
          </h3>
          <p style={{ color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.7 }}>{ARCH_LAYERS[layerIdx].desc}</p>
          <div className="dp-grid-4" style={{ marginBottom: '1rem' }}>
            {ARCH_LAYERS[layerIdx].components.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                {c}
              </div>
            ))}
          </div>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              📄 配置示例
            </div>
            <pre className="dp-code">{ARCH_LAYERS[layerIdx].config}</pre>
          </div>
        </div>
      </div>

      {/* ─── 成本优化 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">💰 七大成本优化策略</h2>
        <div className="dp-card">
          <table className="dp-table">
            <thead><tr><th>策略</th><th>节省</th><th>说明</th><th>风险</th></tr></thead>
            <tbody>
              {COST_OPT.map((c, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#fb923c' }}>{c.strategy}</strong></td>
                  <td><span className="dp-tag green">{c.saving}</span></td>
                  <td style={{ color: '#94a3b8' }}>{c.desc}</td>
                  <td><span className={`dp-tag ${c.risk === '低' ? 'green' : 'gold'}`}>{c.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 核心指标 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">📊 生产 SLO 参考</h2>
        <div className="dp-grid-4">
          {[
            ['< 500ms', 'TTFT P95', '#22c55e'],
            ['> 30 tok/s', '输出速率', '#3b82f6'],
            ['> 99.9%', '可用性', '#f97316'],
            ['< 0.1%', '错误率', '#ef4444'],
            ['< $0.01', '每请求成本', '#eab308'],
            ['> 80%', 'GPU 利用率', '#a78bfa'],
            ['< 30%', '缓存命中率', '#14b8a6'],
            ['< 2min', '故障恢复', '#fb7185'],
          ].map(([value, label, color], i) => (
            <div key={i} className="dp-metric">
              <div className="dp-metric-value" style={{ color }}>{value}</div>
              <div className="dp-metric-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dp-nav">
        <button className="dp-btn">← 容器化编排</button>
        <button className="dp-btn primary">🎓 课程完成！</button>
      </div>
    </div>
  );
}
