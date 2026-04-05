import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PERF_TOPICS = [
  {
    name: '静态资源缓存',
    icon: '⚡', color: '#22c55e',
    desc: '合理设置缓存头，减少重复传输，提升用户体验',
    config: `# 静态资源分级缓存策略
location /static/ {
    root /var/www;
    
    # 内置变量：文件 MD5 hash（需 nginx-module-hash）
    # 或使用文件名 hash（Webpack 等构建工具）
    
    # 带 hash 的资源（内容不变则缓存永久）
    location ~* \\.(js|css)$ {
        expires    1y;                              # 缓存1年
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # 图片/字体（较长缓存）
    location ~* \\.(png|jpg|gif|ico|woff2)$ {
        expires    30d;
        add_header Cache-Control "public";
    }
    
    # HTML（不缓存，实时获取最新版本）
    location ~* \\.html$ {
        expires    -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }
}`,
  },
  {
    name: 'Gzip/Brotli 压缩',
    icon: '🗜️', color: '#fbbf24',
    desc: '文本内容压缩后可减少 60-80% 传输体积，显著提升加载速度',
    config: `http {
    # ─── Gzip 配置（内置支持）───
    gzip                on;
    gzip_vary           on;        # 告知代理服务器响应会因 Accept-Encoding 变化
    gzip_proxied        any;       # 对代理请求也压缩
    gzip_comp_level     6;         # 压缩级别 1(最快)-9(最强)，推荐 6
    gzip_min_length     1000;      # 小于 1KB 不压缩（压缩小文件性价比低）
    gzip_buffers        16 8k;
    gzip_http_version   1.1;
    
    # 压缩的 MIME 类型（注意：图片/视频不要压缩，已经压缩过）
    gzip_types
        text/plain text/css text/xml text/javascript
        application/json application/javascript application/xml
        application/rss+xml font/opentype font/truetype
        image/svg+xml;
    
    # ─── Brotli 配置（需编译 ngx_brotli 模块）───
    # Brotli 比 Gzip 压缩率高 20-30%
    brotli              on;
    brotli_comp_level   6;
    brotli_types        text/plain text/css application/json application/javascript;
}`,
  },
  {
    name: '代理缓存',
    icon: '🗃️', color: '#38bdf8',
    desc: 'Nginx 缓存后端响应，减轻后端压力，API 缓存可降低 90% 后端请求',
    config: `# 定义缓存区域（在 http 块）
proxy_cache_path /var/cache/nginx
    levels=1:2              # 两级目录结构
    keys_zone=api_cache:10m # 缓存键存储区（10MB = ~80000条记录）
    max_size=1g             # 最大磁盘占用
    inactive=60m            # 60分钟未访问则清除
    use_temp_path=off;      # 直接写入目标目录

server {
    location /api/v1/products/ {
        proxy_cache         api_cache;
        proxy_cache_valid   200 5m;      # 200 OK 缓存5分钟
        proxy_cache_valid   404 1m;      # 404 缓存1分钟（防止穿透）
        proxy_cache_revalidate on;       # If-Modified-Since 验证
        proxy_cache_use_stale error timeout updating;  # 后端失败时继续用旧缓存

        # 缓存 Key（同路径不同参数不同缓存）
        proxy_cache_key "$scheme$host$request_uri";

        # 响应头告知客户端是否命中缓存
        add_header X-Cache-Status $upstream_cache_status;  # HIT/MISS/BYPASS

        proxy_pass http://product_service;
    }
    
    # 强制跳过缓存（如用户传了 Authorization 头）
    proxy_cache_bypass $http_authorization;
}`,
  },
  {
    name: '连接优化',
    icon: '🔌', color: '#a78bfa',
    desc: '长连接复用和系统参数调优，是高并发场景的关键',
    config: `# ─── Nginx 连接优化 ───
worker_processes    auto;
worker_rlimit_nofile 65535;  # 提高文件描述符限制

events {
    use              epoll;
    worker_connections 65535;
    multi_accept     on;      # 一次接受所有新连接
}

http {
    # 客户端 Keep-Alive
    keepalive_timeout  65;    # 65秒无请求关闭连接
    keepalive_requests 1000;  # 每个连接最多1000个请求

    # 上游 Keep-Alive（关键：减少与后端建连开销）
    upstream backend {
        server 10.0.0.1:8080;
        keepalive 64;         # 保持64个空闲长连接到后端
    }

    # 读写超时
    client_body_timeout    10s;
    client_header_timeout  10s;
    send_timeout           30s;

    # 开启 TCP 优化
    sendfile    on;
    tcp_nopush  on;   # 合并小包发送
    tcp_nodelay on;   # 禁用 Nagle 算法
}

# ─── 系统内核参数 (/etc/sysctl.conf) ───
# net.core.somaxconn = 65535
# net.ipv4.tcp_max_syn_backlog = 65535
# net.ipv4.tcp_fin_timeout = 30`,
  },
];

export default function LessonPerformance() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const [checklist, setChecklist] = useState({});
  const toggleCheck = i => setChecklist(p => ({ ...p, [i]: !p[i] }));

  const PERF_CHECKLIST = [
    'worker_processes 设置为 auto（匹配 CPU 核心数）',
    'worker_connections 设置为 65535',
    'worker_rlimit_nofile 设置为 65535（同时修改系统 ulimit）',
    '开启 Gzip 压缩，压缩级别设为 6',
    '静态资源设置合理的 Cache-Control 和 Expires',
    '启用 sendfile / tcp_nopush / tcp_nodelay',
    '配置 upstream keepalive 连接池（减少与后端建连开销）',
    '开启 proxy_cache 缓存热点 API 响应',
    'HTTP/2 支持（ssl + http2，多路复用减少连接数）',
    '运行 nginx -t 后验证配置，再执行 nginx -s reload',
  ];

  const topic = PERF_TOPICS[activeTopic];

  return (
    <div className="lesson-ng">
      <div className="ng-badge">⚡ module_07 — 性能调优</div>

      <div className="ng-hero">
        <h1>性能调优：缓存、压缩与连接池优化</h1>
        <p>同样的硬件，调优前后 Nginx 的吞吐量可能相差数倍。<strong>Gzip 减少传输量</strong>，<strong>缓存减少后端请求</strong>，<strong>连接池减少建连开销</strong>——层层优化叠加，才能支撑百万 QPS。</p>
      </div>

      <div className="ng-section">
        <h2 className="ng-section-title">🔧 性能优化专题（点击切换）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {PERF_TOPICS.map((t, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? t.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${t.color}12` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? t.color : '#4a7a5a' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{t.icon}</div>
              {t.name}
            </button>
          ))}
        </div>

        <div className="ng-card" style={{ borderColor: `${topic.color}25` }}>
          <h3 style={{ color: topic.color }}>{topic.icon} {topic.name}</h3>
          <p style={{ marginBottom: '0.875rem' }}>{topic.desc}</p>
          <div className="ng-term-wrapper">
            <div className="ng-term-header">
              <div className="ng-term-dot" style={{ background: '#ef4444' }} />
              <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
              <div className="ng-term-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>nginx.conf — {topic.name}</span>
            </div>
            <div className="ng-term" style={{ fontSize: '0.73rem', maxHeight: '380px', overflow: 'auto' }}>{topic.config}</div>
          </div>
        </div>
      </div>

      {/* 性能调优 Checklist */}
      <div className="ng-section">
        <h2 className="ng-section-title">✅ 性能调优 Checklist（{Object.values(checklist).filter(Boolean).length}/{PERF_CHECKLIST.length} 完成）</h2>
        <div className="ng-meter" style={{ marginBottom: '0.75rem' }}>
          <div className="ng-meter-fill" style={{ width: `${(Object.values(checklist).filter(Boolean).length / PERF_CHECKLIST.length) * 100}%`, background: 'linear-gradient(90deg, #007a2e, #22c55e)' }} />
        </div>
        {PERF_CHECKLIST.map((item, i) => (
          <div key={i} onClick={() => toggleCheck(i)}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.35rem', transition: 'all 0.15s',
              background: checklist[i] ? 'rgba(0,150,57,0.07)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${checklist[i] ? 'rgba(0,150,57,0.35)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${checklist[i] ? '#009639' : '#0f2018'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: checklist[i] ? '#009639' : 'transparent', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
              {checklist[i] ? '✓' : ''}
            </div>
            <div style={{ fontSize: '0.85rem', color: checklist[i] ? '#22c55e' : '#4a7a5a' }}>{item}</div>
          </div>
        ))}
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/gateway')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/production')}>下一模块：生产实战 →</button>
      </div>
    </div>
  );
}
