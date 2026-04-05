import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const GATEWAY_PATTERNS = [
  {
    name: 'API 网关模式', icon: '🌐', color: '#009639',
    desc: '统一入口，所有请求经过网关进行认证、限流、路由和协议转换',
    diagram: `
客户端（Browser/App/3rd-Party）
    │
    ▼
┌───────────────── API Gateway ──────────────────┐
│  认证鉴权 (Auth/JWT)   │  限流熔断 (Rate Limit) │
│  请求路由 (Routing)    │  日志链路 (Tracing)    │
│  协议转换 (HTTP/gRPC)  │  负载均衡 (LB)         │
└────────────────────────────────────────────────┘
    │          │          │           │
    ▼          ▼          ▼           ▼
用户服务    订单服务    商品服务    通知服务
:8001       :8002       :8003       :8004`,
    pros: ['统一认证，无需每个服务实现', '集中限流熔断', '链路追踪统一接入', '协议适配（REST→gRPC）'],
  },
  {
    name: 'BFF 模式', icon: '🎨', color: '#7C3AED',
    desc: 'Backend For Frontend — 针对不同客户端类型提供定制化的 API 聚合层',
    diagram: `
Browser     iOS App    Android App    小程序
   │            │             │          │
   ▼            ▼             ▼          ▼
Web BFF    Mobile BFF    Mobile BFF  Mini BFF
（聚合多API  （精简数据   （精简数据   （聚合+
 构造页面）   适配移动端)  适配移动端)  轻量化）
   │            │─────────────┘          │
   └────────────┴────────────────────────┘
                        │
              ────────────────────
              用户服务│订单服务│商品服务`,
    pros: ['每个端定制数据结构', '减少前端多次请求', '独立部署演进', '更好的用户体验'],
  },
  {
    name: '服务网格 (Service Mesh)', icon: '🕸️', color: '#38bdf8',
    desc: 'Sidecar 代理（Envoy）处理服务间通信，解耦业务逻辑与网络逻辑',
    diagram: `
Service A Pod                Service B Pod
┌──────────────────┐        ┌──────────────────┐
│  App Container   │        │  App Container   │
│                  │        │                  │
│  Envy Sidecar   │◄──────►│  Envy Sidecar   │
│  (L7 代理)       │        │  (L7 代理)       │
└──────────────────┘        └──────────────────┘
        │                           │
        └──────── Control Plane ────┘
                  (Istio / Linkerd)
                  统一管理所有 Sidecar`,
    pros: ['对应用透明（零代码改动）', '统一 mTLS 加密', '细粒度流量控制', '分布式追踪'],
  },
];

const NGINX_GATEWAY_CONFIG = `# Nginx 作为微服务 API 网关的核心配置

# ─── 上游服务定义 ───
upstream user_service    { server 10.0.1.1:8001 weight=3; server 10.0.1.2:8001; }
upstream order_service   { server 10.0.2.1:8002; server 10.0.2.2:8002; }
upstream product_service { server 10.0.3.1:8003; }

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # ─── 认证子请求（auth_request 模块）───
    location = /auth {
        internal;             # 只允许内部跳转，不对外暴露
        proxy_pass http://auth_service/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
    }

    # ─── 全局限流（基于 IP）───
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;

    # ─── /api/v1/users/* → 用户服务 ───
    location /api/v1/users/ {
        auth_request /auth;      # 调用认证子请求
        auth_request_set $auth_user_id $upstream_http_x_user_id;

        # 将认证结果传递给后端
        proxy_set_header X-User-ID $auth_user_id;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Request-ID $request_id;  # 链路追踪 ID

        proxy_pass http://user_service;

        # 错误处理：后端不健康时返回 503
        proxy_next_upstream error timeout invalid_header;
        proxy_next_upstream_tries 2;
    }

    # ─── /api/v1/orders/* → 订单服务 ───
    location /api/v1/orders/ {
        auth_request /auth;
        # 订单服务的限流更严格（防止刷单）
        limit_req zone=order_limit burst=10 nodelay;
        proxy_pass http://order_service;
    }

    # ─── /api/v1/products/* → 商品服务（可公开）───
    location /api/v1/products/ {
        # 商品列表可缓存，无需认证
        proxy_cache product_cache;
        proxy_cache_valid 200 5m;  # 成功响应缓存5分钟
        proxy_pass http://product_service;
    }
}`;

export default function LessonMicroservices() {
  const navigate = useNavigate();
  const [activePattern, setActivePattern] = useState(0);

  return (
    <div className="lesson-ng">
      <div className="ng-badge purple">🕸️ module_05 — 微服务架构</div>

      <div className="ng-hero">
        <h1>微服务架构：API Gateway 设计模式</h1>
        <p>微服务拆分解决了研发效率问题，但引入了服务治理难题。<strong>API Gateway</strong> 是解决方案的核心——统一认证、限流、路由、追踪，让几十个微服务对外表现为一个整体。</p>
      </div>

      {/* 三种模式 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🗺️ 三大 API 网关设计模式（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {GATEWAY_PATTERNS.map((p, i) => (
            <button key={p.name}
              onClick={() => setActivePattern(i)}
              style={{ flex: 1, minWidth: 160, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                border: `1px solid ${activePattern === i ? p.color + '50' : 'rgba(255,255,255,0.07)'}`,
                background: activePattern === i ? `${p.color}12` : 'rgba(255,255,255,0.02)',
                color: activePattern === i ? p.color : '#4a7a5a' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.icon}</div>
              {p.name}
            </button>
          ))}
        </div>
        {(() => {
          const p = GATEWAY_PATTERNS[activePattern];
          return (
            <div className="ng-card" style={{ borderColor: `${p.color}25` }}>
              <p style={{ marginBottom: '0.75rem' }}>{p.desc}</p>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.71rem', color: '#4a7a5a', lineHeight: '1.85', padding: '0.875rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', marginBottom: '0.75rem', whiteSpace: 'pre' }}>{p.diagram}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {p.pros.map(pr => <span key={pr} className="ng-tag green" style={{ background: `${p.color}10`, color: p.color }}>✅ {pr}</span>)}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Nginx 作为 API 网关的配置 */}
      <div className="ng-section">
        <h2 className="ng-section-title">⚙️ Nginx 作为 API 网关的完整配置</h2>
        <div className="ng-term-wrapper">
          <div className="ng-term-header">
            <div className="ng-term-dot" style={{ background: '#ef4444' }} />
            <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
            <div className="ng-term-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>api_gateway.conf</span>
          </div>
          <div className="ng-term" style={{ fontSize: '0.73rem', maxHeight: '500px', overflow: 'auto' }}>{NGINX_GATEWAY_CONFIG}</div>
        </div>
      </div>

      {/* 功能对比 */}
      <div className="ng-section">
        <h2 className="ng-section-title">📊 API 网关核心功能对比</h2>
        <div className="ng-card">
          <table className="ng-table">
            <thead><tr><th>功能</th><th>🌿 Nginx 实现方式</th><th>复杂度</th></tr></thead>
            <tbody>
              {[
                ['认证鉴权', 'auth_request 子请求 → 认证服务', '⭐⭐'],
                ['限流', 'limit_req_zone + limit_req', '⭐'],
                ['负载均衡', 'upstream + 各种算法', '⭐'],
                ['A/B 测试', 'split_clients 按比例路由', '⭐⭐'],
                ['灰度发布', 'upstream 权重 + header 路由', '⭐⭐'],
                ['缓存', 'proxy_cache 多层缓存', '⭐⭐'],
                ['CORS', 'add_header Access-Control-Allow-*', '⭐'],
                ['WebSocket', 'proxy_http_version 1.1 + Upgrade', '⭐⭐'],
                ['gRPC 代理', 'grpc_pass 指令（需 HTTP/2）', '⭐⭐⭐'],
                ['分布式追踪', 'opentelemetry_nginx_module（插件）', '⭐⭐⭐'],
              ].map(([f, impl, c]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem' }}>{f}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#22c55e' }}>{impl}</td>
                  <td style={{ fontSize: '0.82rem', color: '#4a7a5a' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/ssl')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/gateway')}>下一模块：现代网关对比 →</button>
      </div>
    </div>
  );
}
