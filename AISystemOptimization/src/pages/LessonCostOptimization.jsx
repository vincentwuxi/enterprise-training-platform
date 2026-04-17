import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'cost-model', title: '成本建模', icon: '💰' },
  { id: 'autoscaling', title: '弹性伸缩', icon: '📈' },
  { id: 'spot', title: 'Spot / 混合部署', icon: '🎯' },
  { id: 'architecture', title: '推理平台架构', icon: '🏗️' },
];

export default function LessonCostOptimization() {
  const [active, setActive] = useState(sections[0].id);
  return (
    <div className="lesson-page">
      <div className="lesson-tabs">
        {sections.map(s => (
          <button key={s.id} className={`lesson-tab ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
            <span className="tab-icon">{s.icon}</span>{s.title}
          </button>
        ))}
      </div>
      <div className="lesson-content">
        {active === 'cost-model' && <CostModelSection />}
        {active === 'autoscaling' && <AutoscalingSection />}
        {active === 'spot' && <SpotSection />}
        {active === 'architecture' && <ArchitectureSection />}
      </div>
    </div>
  );
}

function CostModelSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">💰</span>推理成本建模</h2>
      <p className="section-desc">精准的成本模型是优化的起点。需要将 <strong>GPU 小时费用</strong> 拆解到 <strong>每百万 token 成本</strong>，建立可量化的优化目标。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>推理成本公式</h3>
          <div className="code-block">
{`# 推理成本 = GPU 成本 / 有效吞吐

基础公式:
  Cost per 1M tokens = 
    (GPU_hourly_rate × num_GPUs) / 
    (throughput_tokens_per_second × 3600) × 1,000,000

示例计算 (Llama-3-70B on 4× H100):
  GPU 费用: $3.5/hr/GPU × 4 = $14/hr
  吞吐: 2000 tokens/s (vLLM, bs=64)
  
  Cost = $14 / (2000 × 3600) × 1M
       = $1.94 / 1M tokens

成本优化杠杆:
┌──────────────────────────────────┐
│ 优化方向     │提升倍数│节省比例  │
├──────────────┼───────┼─────────┤
│ INT4 量化    │ 2-3×  │ 50-66%  │
│ Batch 优化   │ 2-5×  │ 50-80%  │
│ Prefix Cache │ 1.5-3×│ 33-66%  │
│ Spot 实例    │ -     │ 60-70%  │
│ 小模型替代   │ 5-10× │ 80-90%  │
│ 缓存热点     │ ∞     │ ~30%    │
└──────────────┴───────┴─────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>云厂商 GPU 价格对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>GPU</th><th>云厂商</th><th>按需 ($/hr)</th><th>Spot ($/hr)</th><th>性价比</th></tr>
            </thead>
            <tbody>
              <tr><td>H100 80GB SXM</td><td>AWS p5</td><td>$5.38</td><td>$2.15</td><td>基准</td></tr>
              <tr><td>H100 80GB SXM</td><td>GCP a3</td><td>$4.35</td><td>$1.74</td><td>更优</td></tr>
              <tr><td>A100 80GB</td><td>AWS p4d</td><td>$3.67</td><td>$1.47</td><td>性价比高</td></tr>
              <tr><td>L40S 48GB</td><td>AWS g6e</td><td>$1.86</td><td>$0.74</td><td>推理优选</td></tr>
              <tr><td>H100 (Serverless)</td><td>Together AI</td><td>$0.88/M tok</td><td>-</td><td>按用量</td></tr>
              <tr><td>-</td><td>Groq (LPU)</td><td>$0.27/M tok</td><td>-</td><td>最低成本</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h3>TCO (总拥有成本) 分析</h3>
          <div className="code-block">
{`# 总拥有成本不仅仅是 GPU 费用

TCO = GPU + Networking + Storage + 
      Engineering + Monitoring + Ops

# 自建 vs 云 vs Serverless API

1. 云 GPU 自管:
   GPU: $14/hr (4× H100)
   工程: $200K/yr (1 MLE)
   运维: $50K/yr
   → 适合: 大规模, 定制需求

2. Serverless API (Together/Fireworks):
   $0.88/M tokens (Llama-3-70B)
   零运维
   → 适合: < 100M tokens/月

3. 模型 API (OpenAI/Anthropic):
   GPT-4o: $2.50/M input, $10/M output
   Claude 3.5: $3/M input, $15/M output
   → 适合: 质量优先, 快速上线

// 盈亏平衡点:
// 月用量 > 50M tokens → 自建更省
// 月用量 < 10M tokens → Serverless
// 月用量 < 1M tokens  → 直接用 API`}
          </div>
        </div>
      </div>
    </section>
  );
}

function AutoscalingSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📈</span>弹性伸缩策略</h2>
      <p className="section-desc">AI 推理流量通常有明显的 <strong>峰谷特征</strong>（工作日高、周末低）。正确的 Auto-scaling 策略可以在保证 SLA 的同时节省 40-60% 成本。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Scaling 策略矩阵</h3>
          <div className="code-block">
{`1. Reactive Scaling (响应式)
   监控指标 → 超阈值 → 扩容
   ┌──────────────────────────────┐
   │ 指标             │ 阈值      │
   ├──────────────────┼───────────┤
   │ GPU 利用率       │ > 80%     │
   │ 请求队列长度     │ > 100     │
   │ P95 延迟         │ > 2s      │
   │ KV Cache 使用率  │ > 90%     │
   └──────────────────┴───────────┘
   缺点: 有 5-10 分钟冷启动延迟

2. Predictive Scaling (预测式)
   历史数据 → 时序预测 → 提前扩容
   # 使用 Prophet / LSTM 预测未来 1h QPS
   # 提前 10min 启动 GPU 实例
   # 准确率: 85-95% (稳定业务)

3. Scheduled Scaling (定时)
   工作日 9:00-21:00 → 高容量
   夜间/周末     → 最低容量
   # 最简单, 适合流量模式稳定的场景

推荐: Scheduled + Reactive 混合`}
          </div>
        </div>

        <div className="info-card">
          <h3>K8s HPA + KEDA 实战</h3>
          <div className="code-block">
{`# KEDA ScaledObject (基于自定义指标)
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: vllm-scaler
spec:
  scaleTargetRef:
    name: vllm-deployment
  minReplicaCount: 2     # 最少 2 副本
  maxReplicaCount: 16    # 最多 16 副本
  cooldownPeriod: 300    # 缩容冷却 5min
  
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus:9090
      metricName: vllm_queue_size   
      threshold: "50"        # 队列 > 50
      query: |
        sum(vllm_num_requests_waiting)
        
  - type: prometheus
    metadata:
      metricName: vllm_gpu_utilization
      threshold: "80"        # GPU > 80%
      query: |
        avg(vllm_gpu_cache_usage_perc)

# 缩容策略: 缓慢缩容避免抖动
# 扩容: 立即生效
# 缩容: 每 5 分钟最多减少 1 个副本`}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🎯</span>Spot Instance & 混合部署</h2>
      <p className="section-desc">Spot Instance (竞价实例) 比按需实例便宜 60-70%，但可能被随时回收。通过 <strong>容错设计</strong> 可以安全地将推理负载运行在 Spot 上。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Spot 推理安全策略</h3>
          <div className="code-block">
{`# Spot 实例回收处理流程

┌────────────────────────────────┐
│  Spot 中断信号 (2 分钟预警)    │
│           │                    │
│           ▼                    │
│  1. 停止接受新请求              │
│  2. 等待当前 batch 完成 (<30s)  │
│  3. 将排队请求转发到 on-demand  │
│  4. 保存模型状态 checkpoint     │
│  5. 优雅退出                   │
└────────────────────────────────┘

混合部署架构:
┌──────────────────────────────────┐
│         Load Balancer             │
│   (基于延迟 + 容量路由)           │
├──────────┬───────────────────────┤
│ On-Demand│     Spot Instances    │
│ (保底)   │     (弹性层)          │
│ 2 pods   │     0-14 pods        │
│ 处理基线 │     处理峰值流量      │
│ 流量     │     60-70% 折扣      │
│ 永不中断 │     可被回收          │
└──────────┴───────────────────────┘

# 成本效果:
# 纯按需: $14/hr × 8 replicas = $112/hr
# 混合:   $14/hr × 2 + $5.6/hr × 6 = $61.6/hr
# 节省: 45% ✅`}
          </div>
        </div>

        <div className="info-card">
          <h3>多区域 / 多 GPU 型号池</h3>
          <div className="code-block">
{`# 增加 Spot 可用性的关键:
# 不要只依赖一种 GPU 类型 / 一个区域

# AWS Spot Fleet 配置
{
  "LaunchSpecifications": [
    {"InstanceType": "p4d.24xlarge",
     "AvailabilityZone": "us-east-1a"},
    {"InstanceType": "p4d.24xlarge",
     "AvailabilityZone": "us-west-2a"},
    {"InstanceType": "g5.48xlarge",
     "AvailabilityZone": "us-east-1b"},
    {"InstanceType": "p5.48xlarge",
     "AvailabilityZone": "eu-west-1a"}
  ],
  "AllocationStrategy": "capacityOptimized"
}

# 模型版本池 (适配不同 GPU):
# H100 → FP8 版本 (最快)
# A100 → FP16 / INT8 版本
# L40S → INT4 版本 (显存小)
# → 自动选择匹配的模型版本`}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🏗️</span>企业推理平台架构</h2>
      <p className="section-desc">企业级推理平台需要解决 <strong>多模型管理、流量路由、成本核算、安全合规</strong> 等工程问题。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>推理平台架构图</h3>
          <div className="code-block">
{`┌─────────────────────────────────────────┐
│              API Gateway                 │
│  Rate Limiting / Auth / Metering         │
├──────────┬──────────┬───────────────────┤
│          │ Router   │                    │
│          │ ┌──────────────────────┐      │
│          │ │ Model Router         │      │
│          │ │ ├── Cost-Aware       │      │
│          │ │ ├── Latency-Aware    │      │
│          │ │ └── Capability-Based │      │
│          │ └──────────────────────┘      │
├──────────┴──────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ vLLM    │  │ vLLM    │  │ TRT-LLM │ │
│  │ Pool A  │  │ Pool B  │  │ Pool C  │ │
│  │ Llama-  │  │ Llama-  │  │ Whisper │ │
│  │ 3-70B   │  │ 3-8B    │  │ Large   │ │
│  │ (4×H100)│  │ (1×L40S)│  │ (1×A100)│ │
│  └─────────┘  └─────────┘  └─────────┘ │
├─────────────────────────────────────────┤
│  Monitoring: Prometheus + Grafana        │
│  Logging: Vector → ClickHouse            │
│  Cost Metering: 按 BU/team 计费          │
└─────────────────────────────────────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>语义缓存 (Semantic Cache)</h3>
          <div className="code-block">
{`# 缓存相似查询的响应 → 减少 GPU 调用

import numpy as np
from redis import Redis

class SemanticCache:
    def __init__(self, threshold=0.95):
        self.redis = Redis()
        self.threshold = threshold
        self.embedder = load_embed_model()
    
    def get(self, query: str):
        q_emb = self.embedder.encode(query)
        
        # 搜索 Redis 中的相似向量
        results = self.redis.ft.search(
            query=f"*=>[KNN 1 @embedding $vec AS score]",
            query_params={"vec": q_emb.tobytes()},
        )
        
        if results and results[0].score > self.threshold:
            return results[0].cached_response  # 缓存命中!
        return None  # 未命中 → 调用模型
    
    def put(self, query, response):
        emb = self.embedder.encode(query)
        self.redis.hset(f"cache:{hash(query)}", mapping={
            "embedding": emb.tobytes(),
            "cached_response": response
        })

# 效果: 高频问题缓存命中率 20-40%
# → 直接节省 20-40% GPU 成本`}
          </div>
        </div>
      </div>
    </section>
  );
}
