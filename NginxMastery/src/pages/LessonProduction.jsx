import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const BLUE_GREEN_STEPS = [
  { label: '初始状态', icon: '🟦', desc: '蓝环境（v1.0）承接 100% 流量，绿环境（v1.1）已部署但未上线', upstream: 'upstream app {\n    server blue:8080  weight=100;\n    server green:8080 weight=0; # 权重0不接流量\n}', trafficBlue: 100, trafficGreen: 0 },
  { label: '10% 灰度', icon: '🔵', desc: '绿环境（v1.1）逐步引入 10% 流量，监控错误率和延迟', upstream: 'upstream app {\n    server blue:8080  weight=90;\n    server green:8080 weight=10;\n}', trafficBlue: 90, trafficGreen: 10 },
  { label: '50% 金丝雀', icon: '⚖️', desc: '确认 10% 流量下新版本稳定，扩大到 50% 做充分验证', upstream: 'upstream app {\n    server blue:8080  weight=50;\n    server green:8080 weight=50;\n}', trafficBlue: 50, trafficGreen: 50 },
  { label: '全量切换', icon: '🟩', desc: '绑定环境（v1.1）承接 100% 流量，蓝环境进入待机状态', upstream: 'upstream app {\n    server blue:8080  weight=0;\n    server green:8080 weight=100;\n}', trafficBlue: 0, trafficGreen: 100 },
  { label: '回滚（应急）', icon: '🔄', desc: '如果发现问题，立即修改权重将流量切回蓝环境（秒级回滚）', upstream: 'upstream app {\n    server blue:8080  weight=100; # 切回蓝\n    server green:8080 weight=0;   # 绿下线\n}\n# nginx -s reload  # 热更配置，不中断连接', trafficBlue: 100, trafficGreen: 0 },
];

const RATE_LIMIT_CONFIG = `# ─── 限流配置（防止 API 滥用）───

# 定义限流区域（内存中共享，跨 Worker）
limit_req_zone  $binary_remote_addr zone=per_ip:10m    rate=10r/s;   # 每IP 10 req/s
limit_req_zone  $http_authorization zone=per_token:10m  rate=100r/s;  # 每 Token 100 req/s
limit_req_zone  $server_name       zone=per_server:10m  rate=1000r/s; # 全局 1000 req/s

limit_conn_zone $binary_remote_addr zone=conn_limit:10m; # 并发连接限制

server {
    # 搜索接口：每 IP 每秒 10 个请求（burst=20 允许突发）
    location /api/search {
        limit_req zone=per_ip burst=20 nodelay;
        
        # 超限返回 429（Too Many Requests）而非默认 503
        limit_req_status 429;
        
        proxy_pass http://backend;
    }

    # 登录接口：每 IP 每分钟最多 5 次（防暴力破解）
    location /api/auth/login {
        limit_req zone=per_ip burst=5 nodelay;
        limit_req_status 429;
        
        # 自定义错误页（友好提示）
        error_page 429 /errors/rate_limited.json;
        proxy_pass http://backend;
    }

    # 每个 IP 最多 10 个并发连接
    location /api/ {
        limit_conn conn_limit 10;
        proxy_pass http://backend;
    }
}`;

const CIRCUIT_BREAKER = `# ─── 熔断降级配置 ───

# 被动熔断：连续失败 N 次后将后端标记为不健康
upstream backend {
    server 10.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=30s;
    
    # 备用节点（主节点全部熔断时启用）
    server 10.0.0.9:8080 backup;
}

# 错误重试（next_upstream）
proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
proxy_next_upstream_tries 2;      # 最多重试2次
proxy_next_upstream_timeout 10s;  # 重试总超时

# 降级：后端全挂时返回静态降级页面
location /api/ {
    proxy_pass http://backend;
    
    # 后端不可用时用缓存响应（即使已过期）
    proxy_cache_use_stale updating error timeout;
    
    # 所有后端都失败时
    error_page 502 503 504 @fallback;
}

location @fallback {
    # 返回预备好的降级 JSON 响应
    return 503 '{"code":503,"msg":"服务维护中，请稍后重试"}';
    add_header Content-Type 'application/json; charset=utf-8';
}`;

export default function LessonProduction() {
  const navigate = useNavigate();
  const [bgStep, setBgStep] = useState(0);
  const [activeDemo, setActiveDemo] = useState('ratelimit');

  const step = BLUE_GREEN_STEPS[bgStep];

  return (
    <div className="lesson-ng">
      <div className="ng-badge">🚀 module_08 — 生产实战</div>

      <div className="ng-hero">
        <h1>生产实战：蓝绿部署、熔断与限流</h1>
        <p>理论变成生产力的最后一关。<strong>蓝绿部署</strong>实现零停机发布，<strong>限流</strong>防止服务被打垮，<strong>熔断降级</strong>在后端失效时保持服务可用，SRE 的核心技能全在这里。</p>
      </div>

      {/* 蓝绿部署步进演示 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🔵🟩 蓝绿发布 / 金丝雀发布（步进演示）</h2>
        <div className="ng-interactive">
          <h3>
            步骤 {bgStep + 1}/{BLUE_GREEN_STEPS.length}：{step.label}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="ng-btn" onClick={() => setBgStep(s => Math.max(0, s - 1))} disabled={bgStep === 0}>← 上一步</button>
              <button className="ng-btn primary" onClick={() => setBgStep(s => Math.min(BLUE_GREEN_STEPS.length - 1, s + 1))} disabled={bgStep === BLUE_GREEN_STEPS.length - 1}>下一步 →</button>
              <button className="ng-btn" onClick={() => setBgStep(0)}>重置</button>
            </div>
          </h3>

          {/* 流量可视化 */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>{step.icon}</span>
              <span style={{ fontSize: '0.85rem', color: '#4a7a5a' }}>{step.desc}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: '🔵 蓝环境 (v1.0)', pct: step.trafficBlue, color: '#38bdf8' },
                { label: '🟩 绿环境 (v1.1)', pct: step.trafficGreen, color: '#22c55e' },
              ].map(e => (
                <div key={e.label} style={{ padding: '0.875rem', borderRadius: '8px', border: `1px solid ${e.color}30`, background: `${e.color}08` }}>
                  <div style={{ fontSize: '0.78rem', color: '#4a7a5a', marginBottom: '0.4rem' }}>{e.label}</div>
                  <div style={{ fontWeight: 900, fontSize: '2rem', color: e.color }}>{e.pct}%</div>
                  <div className="ng-meter" style={{ marginTop: '0.4rem' }}>
                    <div className="ng-meter-fill" style={{ width: `${e.pct}%`, background: e.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 对应 Nginx 配置 */}
          <div className="ng-term-wrapper">
            <div className="ng-term-header">
              <div className="ng-term-dot" style={{ background: '#ef4444' }} />
              <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
              <div className="ng-term-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>upstream.conf — {step.label}</span>
            </div>
            <div className="ng-term" style={{ fontSize: '0.78rem' }}>{step.upstream}</div>
          </div>
        </div>
      </div>

      {/* 限流 & 熔断 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🛡️ 限流与熔断降级配置</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button className={`ng-btn ${activeDemo === 'ratelimit' ? 'primary' : ''}`} onClick={() => setActiveDemo('ratelimit')}>🚦 限流（Rate Limiting）</button>
          <button className={`ng-btn ${activeDemo === 'circuit' ? 'primary' : ''}`} onClick={() => setActiveDemo('circuit')}>⚡ 熔断降级（Circuit Breaker）</button>
        </div>
        <div className="ng-term-wrapper">
          <div className="ng-term-header">
            <div className="ng-term-dot" style={{ background: '#ef4444' }} />
            <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
            <div className="ng-term-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{activeDemo === 'ratelimit' ? '限流配置' : '熔断降级配置'} — nginx.conf</span>
          </div>
          <div className="ng-term" style={{ fontSize: '0.73rem', maxHeight: '420px', overflow: 'auto' }}>
            {activeDemo === 'ratelimit' ? RATE_LIMIT_CONFIG : CIRCUIT_BREAKER}
          </div>
        </div>
      </div>

      {/* 课程完成 */}
      <div className="ng-section">
        <div className="ng-card" style={{ background: 'linear-gradient(135deg, rgba(0,150,57,0.08), rgba(124,58,237,0.06))', borderColor: 'rgba(0,150,57,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#22c55e', fontSize: '1.2rem', marginBottom: '1rem' }}>恭喜完成 Nginx + 微服务网关全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {['✅ Nginx 事件驱动 + Worker 进程模型', '✅ 配置精通：server/location/upstream', '✅ 五大负载均衡算法可视化对比', '✅ TLS 握手 + SSL 安全配置', '✅ 微服务 API Gateway 设计模式', '✅ Kong / Traefik / Nginx 对比选型', '✅ Gzip / 代理缓存 / 连接池调优', '✅ 蓝绿发布 + 限流 + 熔断降级'].map(s => (
              <div key={s} style={{ fontSize: '0.875rem', color: '#4a7a5a' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <span className="ng-tag green" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>下一步：Nginx 认证工程师 / CKAD (Kubernetes Application Developer)</span>
          </div>
        </div>
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/performance')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
