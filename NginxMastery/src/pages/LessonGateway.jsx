import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const GATEWAYS = [
  {
    name: 'Nginx',
    icon: '🌿', color: '#009639',
    type: '高性能 Web 服务器 / 反向代理',
    pros: ['极高性能，C 编写，内存占用极低', '生态成熟，文档丰富', '模块化扩展（Lua/OpenResty）', '完全免费开源（Nginx OSS）'],
    cons: ['功能需手动配置，插件体系较弱', '动态路由需要 Lua 脚本或重载', '原生无 Admin API'],
    bestFor: '静态资源、高性能反向代理、传统 Web 应用',
    config: `# Nginx 限流插件
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;

server {
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://backend;
    }
}

# 需要 OpenResty + Lua 实现动态路由
# 或使用 NGINX Plus（商业版 $$$）`,
  },
  {
    name: 'Kong',
    icon: '🦍', color: '#003459',
    type: '企业级 API 网关',
    bgColor: '#1b6b8c',
    pros: ['插件生态丰富（50+ 官方插件）', 'Admin REST API，动态配置', '内置认证/限流/日志/追踪', '支持 Kubernetes Ingress（Kong Ingress Controller）'],
    cons: ['资源消耗较大（Lua + OpenResty）', 'Kong Enterprise 功能需付费', '学习曲线较陡'],
    bestFor: '企业 API 管理平台，多租户 API 网关',
    config: `# Kong Admin API 配置（无需重启！）
# 创建 Service
curl -X POST http://localhost:8001/services \\
  -d name=user-service \\
  -d url=http://10.0.1.1:8001

# 创建 Route
curl -X POST http://localhost:8001/services/user-service/routes \\
  -d paths[]=/api/v1/users

# 启用限流插件（动态生效）
curl -X POST http://localhost:8001/services/user-service/plugins \\
  -d name=rate-limiting \\
  -d config.minute=1000 \\
  -d config.hour=10000`,
  },
  {
    name: 'Traefik',
    icon: '🔷', color: '#1ebcff',
    type: '云原生 / K8s 原生网关',
    pros: ['Kubernetes 原生，自动发现服务', '配置即代码（CRD / labels）', '内置 Dashboard 和监控', '自动 Let\'s Encrypt 证书'],
    cons: ['高级功能（Traefik EE）需付费', '性能略低于 Nginx', '企业功能依赖付费版'],
    bestFor: 'Kubernetes 环境，云原生微服务',
    config: `# Traefik v3 Kubernetes IngressRoute
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-service-ingress
spec:
  entryPoints: [websecure]   # HTTPS 入口
  routes:
  - match: Host('api.example.com') && PathPrefix('/api/v1/users')
    kind: Rule
    services:
    - name: user-service
      port: 8001
    middlewares:
    - name: rate-limit       # 引用限流中间件
    - name: auth-jwt         # JWT 认证

---
# 限流中间件（声明式，无需重启）
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: rate-limit
spec:
  rateLimit:
    average: 100
    burst: 50`,
  },
];

export default function LessonGateway() {
  const navigate = useNavigate();
  const [activeGw, setActiveGw] = useState(0);
  const [activeTab, setActiveTab] = useState('config');

  const gw = GATEWAYS[activeGw];

  return (
    <div className="lesson-ng">
      <div className="ng-badge purple">🦍 module_06 — 现代网关</div>

      <div className="ng-hero">
        <h1>现代网关：Kong / Traefik / Nginx 对比实战</h1>
        <p>没有放之四海而皆准的网关选择。<strong>Nginx</strong> 适合高性能，<strong>Kong</strong> 适合企业 API 管理，<strong>Traefik</strong> 适合 Kubernetes 原生环境——选对工具事半功倍。</p>
      </div>

      {/* 网关对比卡片 */}
      <div className="ng-section">
        <h2 className="ng-section-title">⚖️ 三大网关横向对比</h2>
        <div className="ng-card" style={{ padding: '1rem' }}>
          <table className="ng-table">
            <thead><tr><th>特性</th><th>🌿 Nginx</th><th>🦍 Kong</th><th>🔷 Traefik</th></tr></thead>
            <tbody>
              {[
                ['性能', '⭐⭐⭐⭐⭐ 极高', '⭐⭐⭐⭐ 高', '⭐⭐⭐⭐ 高'],
                ['学习曲线', '⭐⭐⭐ 中等', '⭐⭐⭐⭐ 较陡', '⭐⭐ 易（K8s环境）'],
                ['动态路由', '需重载或 Lua', '✅ Admin API', '✅ K8s CRD'],
                ['K8s 集成', '需 Ingress Controller', '✅ Kong IC', '✅ 原生支持'],
                ['插件生态', '模块/Lua 扩展', '50+ 官方插件', '中间件体系'],
                ['Admin UI', '❌ 无（第三方）', '✅ Kong Manager', '✅ 内置 Dashboard'],
                ['证书管理', '手动/Certbot', '✅ 插件', '✅ 自动 ACME'],
                ['费用', '完全免费', '核心免费，部分付费', '核心免费，EE 付费'],
                ['适合场景', '传统 / 高性能', '企业 API 管理', 'K8s 微服务'],
              ].map(([f, n, k, t]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{f}</td>
                  <td style={{ fontSize: '0.8rem', color: '#22c55e' }}>{n}</td>
                  <td style={{ fontSize: '0.8rem', color: '#4a7a5a' }}>{k}</td>
                  <td style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 各网关详情 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🔍 深度对比（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          {GATEWAYS.map((g, i) => (
            <button key={g.name}
              onClick={() => { setActiveGw(i); setActiveTab('config'); }}
              style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', transition: 'all 0.2s', textAlign: 'center',
                border: `1px solid ${activeGw === i ? g.color + '70' : 'rgba(255,255,255,0.07)'}`,
                background: activeGw === i ? `${g.color}15` : 'rgba(255,255,255,0.02)',
                color: activeGw === i ? g.color : '#4a7a5a' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{g.icon}</div>
              {g.name}
            </button>
          ))}
        </div>

        <div className="ng-card" style={{ borderColor: `${gw.color}25` }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="ng-tag green" style={{ background: `${gw.color}12`, color: gw.color }}>{gw.type}</span>
          </div>
          <div className="ng-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem', marginBottom: '0.4rem' }}>✅ 优势</div>
              {gw.pros.map(p => <div key={p} style={{ fontSize: '0.8rem', color: '#4a7a5a', marginBottom: '0.2rem' }}>• {p}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.82rem', marginBottom: '0.4rem' }}>⚠️ 局限</div>
              {gw.cons.map(c => <div key={c} style={{ fontSize: '0.8rem', color: '#4a7a5a', marginBottom: '0.2rem' }}>• {c}</div>)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button className={`ng-btn ${activeTab === 'config' ? 'primary' : ''}`} onClick={() => setActiveTab('config')}>⚙️ 配置示例</button>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(0,150,57,0.06)', borderRadius: '8px', fontSize: '0.82rem', color: '#4a7a5a', marginBottom: '0.75rem' }}>
            🎯 <strong style={{ color: '#fbbf24' }}>最适合：</strong>{gw.bestFor}
          </div>
          <div className="ng-term-wrapper">
            <div className="ng-term-header">
              <div className="ng-term-dot" style={{ background: '#ef4444' }} />
              <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
              <div className="ng-term-dot" style={{ background: `${gw.color}` }} />
              <span style={{ marginLeft: '0.5rem' }}>{gw.name} — 核心配置示例</span>
            </div>
            <div className="ng-term" style={{ fontSize: '0.74rem', maxHeight: '280px', overflow: 'auto' }}>{gw.config}</div>
          </div>
        </div>
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/microservices')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/performance')}>下一模块：性能调优 →</button>
      </div>
    </div>
  );
}
