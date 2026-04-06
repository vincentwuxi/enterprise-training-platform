import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const MS_TOPICS = [
  {
    name: '服务发现', icon: '🔍', color: '#3b82f6',
    code: `# 服务发现：Client-Side vs Server-Side

# ── Client-Side（客户端发现）— Consul + Python ──
import consul
import random

class ServiceRegistry:
    def __init__(self):
        self.consul = consul.Consul(host='consul-server', port=8500)

    def register(self, service_name: str, host: str, port: int) -> None:
        self.consul.agent.service.register(
            name=service_name,
            service_id=f"{service_name}-{host}-{port}",
            address=host,
            port=port,
            check=consul.Check.http(
                url=f"http://{host}:{port}/health",
                interval="10s",
                timeout="3s",
                deregister="30s"   # 30秒不健康则自动注销
            ),
            tags=["v2.1", "production"]
        )

    def discover(self, service_name: str) -> tuple[str, int]:
        _, services = self.consul.health.service(service_name, passing=True)
        if not services:
            raise RuntimeError(f"服务 {service_name} 无可用实例")
        # 随机负载均衡
        svc = random.choice(services)["Service"]
        return svc["Address"], svc["Port"]

# ── 使用方式 ──
registry = ServiceRegistry()
registry.register("order-service", "192.168.1.100", 8080)

host, port = registry.discover("payment-service")
# 直接调用对端（Client-Side 负载均衡）
response = httpx.get(f"http://{host}:{port}/api/pay")

# ── Server-Side（服务端发现）— Kubernetes ──
# K8s Service 自动管理服务发现！
# 只需访问 Service DNS: http://payment-service.default.svc.cluster.local:8080
# kube-proxy 在 Endpoint 层面做负载均衡`,
  },
  {
    name: 'API 网关', icon: '🚪', color: '#f59e0b',
    code: `# API 网关：Kong / APISIX 核心功能配置

# ── Kong 插件配置（声明式）──
# kong.yml
_format_version: "3.0"
services:
  - name: user-service
    url: http://user-service:8080
    routes:
      - name: user-api
        paths: ["/api/v1/users"]
        methods: ["GET", "POST"]
    plugins:
      # 1. JWT 鉴权
      - name: jwt
        config:
          secret_is_base64: false
          key_claim_name: iss
          claims_to_verify: [exp]

      # 2. 限流（IP 维度）
      - name: rate-limiting
        config:
          minute: 1000          # 每分钟1000次
          hour: 10000           # 每小时10000次
          policy: redis         # 用Redis存计数（分布式限流）
          redis_host: redis
          limit_by: ip

      # 3. 请求转换（添加内部Header）
      - name: request-transformer
        config:
          add:
            headers:
              - "X-Internal-Request: true"
              - "X-Gateway-Version: 2.1"

  - name: order-service
    url: http://order-service:8080
    plugins:
      # 4. 熔断（成功率低于95%时熔断）
      - name: circuitbreaker
        config:
          threshold: 0.95
          window_time: 10
          min_calls_in_window: 10
          timeout_ms: 3000

# ── API 网关的核心功能 ──
# 认证鉴权（JWT/OAuth2/API Key）
# 限流熔断（保护后端服务）
# 请求路由（按Header/Path/Method）
# 协议转换（REST ↔ gRPC ↔ WebSocket）
# 可观测性（请求日志、Traces、Metrics）`,
  },
  {
    name: '服务网格', icon: '🕸️', color: '#a855f7',
    code: `# 服务网格 (Service Mesh) — Istio + Envoy

# 核心理念：把网络功能（重试/限流/mTLS）沉淀到 Sidecar
# 应用代码0改动，获得完整服务治理能力

# ── Istio 流量管理配置 ──
# 1. VirtualService：流量路由（金丝雀/AB测试）
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: product-service
spec:
  hosts: [product-service]
  http:
    # 基于 Header 的路由（内测用户 → v2）
    - match:
        - headers:
            x-user-beta: { exact: "true" }
      route:
        - destination: { host: product-service, subset: v2 }

    # 权重路由（5% → v2，95% → v1）
    - route:
        - destination: { host: product-service, subset: v1 }
          weight: 95
        - destination: { host: product-service, subset: v2 }
          weight: 5

# 2. DestinationRule：负载均衡 + 熔断
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: product-service
spec:
  host: product-service
  trafficPolicy:
    loadBalancer: { simple: LEAST_CONN }
    connectionPool:
      http: { http1MaxPendingRequests: 100, http2MaxRequests: 1000 }
    outlierDetection:            # 熔断：自动驱逐不健康实例
      consecutive5xxErrors: 5   # 连续5次5xx → 驱逐
      interval: 10s
      baseEjectionTime: 30s
  subsets:
    - name: v1
      labels: { version: v1 }
    - name: v2
      labels: { version: v2 }

# 3. PeerAuthentication：mTLS（服务间加密）
apiVersion: security.istio.io/v1
kind: PeerAuthentication
spec:
  mtls: { mode: STRICT }  # 所有服务间通信强制 mTLS`,
  },
];

const DDD_CONCEPTS = [
  { name: '限界上下文', desc: '每个微服务对应一个BC，有独立的语言和模型。订单BC的"Product"和商品BC的"Product"是不同概念。', icon: '🗺️', color: '#3b82f6' },
  { name: '聚合根', desc: 'Order是聚合根，OrderItem只能通过Order访问。外部只能引用聚合根的ID，不能直接引用内部对象。', icon: '⭐', color: '#22c55e' },
  { name: '领域事件', desc: 'OrderPlaced、PaymentConfirmed等事件是跨BC通信的纽带。事件驱动解耦，最终一致。', icon: '🔔', color: '#f59e0b' },
  { name: '防腐层', desc: '调用外部BC时，在本BC边界添加Adapter，将外部模型翻译为本BC的领域概念，防止外部概念污染。', icon: '🛡️', color: '#a855f7' },
];

export default function LessonMicroservice() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = MS_TOPICS[activeTopic];

  return (
    <div className="lesson-sd">
      <div className="sd-badge">🏗️ module_07 — 微服务架构</div>
      <div className="sd-hero">
        <h1>微服务架构：服务发现 / API 网关 / 服务网格</h1>
        <p>微服务把大单体拆成<strong>独立部署、独立扩缩</strong>的小服务。服务发现解决服务定位，API 网关统一入口，服务网格（Istio）在基础设施层提供流量控制、可观测性和安全。</p>
      </div>

      {/* DDD 四大概念 */}
      <div className="sd-interactive">
        <h3>🏛️ DDD 领域驱动设计 — 微服务拆分基础</h3>
        <div className="sd-grid-4">
          {DDD_CONCEPTS.map(c => (
            <div key={c.name} className="sd-card" style={{ borderColor: `${c.color}20`, padding: '1rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 800, color: c.color, fontSize: '0.82rem', marginBottom: '0.3rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sd-section">
        <h2 className="sd-section-title">🔧 微服务三大核心技术</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {MS_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="sd-code-wrap">
          <div className="sd-code-head">
            <div className="sd-code-dot" style={{ background: '#ef4444' }} />
            <div className="sd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="sd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span>
          </div>
          <div className="sd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="sd-nav">
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/distributed')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/interview')}>下一模块：面试实战 →</button>
      </div>
    </div>
  );
}
