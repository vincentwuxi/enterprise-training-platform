import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CONFIG_SECTIONS = [
  {
    name: 'nginx.conf 主配置',
    file: '/etc/nginx/nginx.conf',
    config: `user  nginx;
worker_processes  auto;          # 建议：auto（自动=CPU核心数）
worker_rlimit_nofile  65535;     # 每个 Worker 最大打开文件数

error_log  /var/log/nginx/error.log  warn;
pid        /var/run/nginx.pid;

events {
    use              epoll;      # Linux 下使用 epoll（高效）
    worker_connections  65535;  # 每 Worker 最大连接数
    multi_accept     on;        # 一次接受多个连接
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # 日志格式（含响应时间，便于排查慢请求）
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" $request_time';

    sendfile        on;    # 零拷贝传输静态文件
    tcp_nopush      on;    # 配合 sendfile，减少网络包数量
    tcp_nodelay     on;    # 对小包立即发送（实时性）
    keepalive_timeout  65; # 长连接超时（秒）

    gzip  on;             # 开启 Gzip 压缩
    gzip_types text/plain text/css application/json application/javascript;

    include /etc/nginx/conf.d/*.conf;  # 加载站点配置
}`,
  },
  {
    name: 'server 块 — 虚拟主机',
    file: '/etc/nginx/conf.d/app.conf',
    config: `server {
    listen       80;
    listen       [::]:80;      # IPv6
    server_name  app.example.com www.app.example.com;

    root         /var/www/app;
    index        index.html;

    # 访问日志（指定格式）
    access_log   /var/log/nginx/app_access.log main;
    error_log    /var/log/nginx/app_error.log warn;

    # HTTP → HTTPS 重定向
    return 301 https://$host$request_uri;
}

server {
    listen       443 ssl http2;
    server_name  app.example.com;

    ssl_certificate     /etc/ssl/certs/app.crt;
    ssl_certificate_key /etc/ssl/private/app.key;

    # 其他配置...
    include conf.d/security_headers.conf;  # 安全头
}`,
  },
  {
    name: 'location 块 — 路由匹配',
    file: '/etc/nginx/conf.d/app.conf (location)',
    config: `# location 匹配优先级（从高到低）：
# = 精确    >  ^~ 前缀（停止正则）  >  ~ 正则  >  / 默认

server {
    # 精确匹配：只匹配 /
    location = / {
        try_files $uri /index.html;
    }

    # 前缀匹配，不检查正则（更快）
    location ^~ /static/ {
        root /var/www;
        expires 30d;            # 缓存30天
        add_header Cache-Control "public, immutable";
    }

    # 正则匹配：API 请求转发后端
    location ~ ^/api/ {
        proxy_pass http://backend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA 路由：所有未匹配路径返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}`,
  },
  {
    name: 'upstream 块 — 后端集群',
    file: '/etc/nginx/conf.d/upstream.conf',
    config: `# 定义后端服务器集群
upstream backend_upstream {
    # 负载均衡算法（默认 round_robin）
    # least_conn;   # 最少连接数
    # ip_hash;      # 同IP固定后端（Session 粘性）

    server 10.0.0.1:8080  weight=3  max_fails=3  fail_timeout=30s;
    server 10.0.0.2:8080  weight=2  max_fails=3  fail_timeout=30s;
    server 10.0.0.3:8080  weight=1  max_fails=3  fail_timeout=30s;
    server 10.0.0.4:8080  backup;   # 备用节点（主节点全挂时启动）

    # 长连接复用（减少连接建立开销）
    keepalive 64;
}

# 超时配置
proxy_connect_timeout    5s;   # 连接后端超时
proxy_read_timeout      60s;   # 读取后端响应超时
proxy_send_timeout      60s;   # 发送请求到后端超时

# 开启缓冲（减少与后端的连接时间）
proxy_buffering          on;
proxy_buffer_size        16k;
proxy_buffers            4 64k;`,
  },
];

const LOCATION_MATCH = [
  { prefix: '=',   name: '精确匹配', priority: 1, example: 'location = /favicon.ico', desc: '只匹配完全相同的路径，最高优先级，匹配后立即停止' },
  { prefix: '^~',  name: '前缀匹配（停止正则）', priority: 2, example: 'location ^~ /static/', desc: '以指定字符串开头，匹配后不再检查正则表达式，性能更好' },
  { prefix: '~',   name: '正则匹配（区分大小写）', priority: 3, example: 'location ~ \\.php$', desc: '正则表达式匹配，区分大小写，按出现顺序匹配' },
  { prefix: '~*',  name: '正则匹配（忽略大小写）', priority: 3, example: 'location ~* \\.(jpg|png)$', desc: '正则表达式匹配，不区分大小写' },
  { prefix: '/',   name: '默认前缀匹配', priority: 4, example: 'location /', desc: '最低优先级，作为兜底规则，所有请求都能匹配' },
];

export default function LessonConfig() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="lesson-ng">
      <div className="ng-badge">⚙️ module_02 — 配置精通</div>

      <div className="ng-hero">
        <h1>配置精通：server / location / upstream 详解</h1>
        <p>Nginx 的强大 90% 来自配置。掌握 <strong>server</strong>（虚拟主机）、<strong>location</strong>（路由匹配规则）和 <strong>upstream</strong>（后端集群），你就能搭建企业级 Web 基础设施。</p>
      </div>

      {/* 配置层级结构 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🏛️ Nginx 配置块层级结构</h2>
        <div className="ng-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#4a7a5a', lineHeight: '1.85', whiteSpace: 'pre' }}>{`main 全局块（worker_processes, error_log...）
└── events 块（epoll, worker_connections...）
└── http 块（gzip, log_format, keepalive...）
    ├── upstream 块（定义后端集群）
    └── server 块（虚拟主机，监听端口/域名）
        ├── location / 块（根路径路由）
        ├── location /api/ 块（API 路由）
        └── location /static/ 块（静态资源）

配置优先级：局部配置 > 块级配置 > 全局配置
继承规则：子块继承父块指令，但子块可覆盖`}</div>
        </div>
      </div>

      {/* 配置文件交互演示 */}
      <div className="ng-section">
        <h2 className="ng-section-title">📄 完整配置示例（分块讲解）</h2>
        <div className="ng-interactive">
          <h3>
            选择配置模块
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {CONFIG_SECTIONS.map((s, i) => (
                <button key={i} className={`ng-btn ${activeSection === i ? 'primary' : ''}`}
                  onClick={() => setActiveSection(i)} style={{ fontSize: '0.78rem' }}>{s.name.split(' ')[0]} {s.name.split(' ')[1]}</button>
              ))}
            </div>
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#22c55e', fontFamily: 'JetBrains Mono', marginBottom: '0.5rem' }}>
            📁 {CONFIG_SECTIONS[activeSection].file}
          </div>
          <div className="ng-term-wrapper">
            <div className="ng-term-header">
              <div className="ng-term-dot" style={{ background: '#ef4444' }} />
              <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
              <div className="ng-term-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>nginx.conf — {CONFIG_SECTIONS[activeSection].name}</span>
            </div>
            <div className="ng-term" style={{ maxHeight: '380px', overflow: 'auto', fontSize: '0.75rem' }}>
              {CONFIG_SECTIONS[activeSection].config}
            </div>
          </div>
        </div>
      </div>

      {/* location 匹配优先级 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🎯 location 匹配规则优先级（面试高频）</h2>
        <div className="ng-card">
          <table className="ng-table">
            <thead><tr><th>优先级</th><th>前缀</th><th>名称</th><th>示例</th><th>说明</th></tr></thead>
            <tbody>
              {LOCATION_MATCH.map(m => (
                <tr key={m.prefix}>
                  <td style={{ textAlign: 'center' }}>
                    <span className="ng-tag green" style={{ fontsize: '0.85rem', fontWeight: 900 }}>P{m.priority}</span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: '#fbbf24', fontSize: '0.9rem' }}>{m.prefix}</td>
                  <td style={{ fontWeight: 600, color: '#22c55e', fontSize: '0.82rem' }}>{m.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#38bdf8' }}>{m.example}</td>
                  <td style={{ fontSize: '0.78rem', color: '#4a7a5a' }}>{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 内置变量 */}
      <div className="ng-section">
        <h2 className="ng-section-title">📦 常用内置变量速查</h2>
        <div className="ng-grid-2">
          {[
            { vars: ['$host', '$server_name', '$server_port', '$scheme'], cat: '请求相关', color: '#22c55e' },
            { vars: ['$remote_addr', '$proxy_add_x_forwarded_for', '$request_method', '$request_uri'], cat: '客户端相关', color: '#38bdf8' },
            { vars: ['$upstream_addr', '$upstream_status', '$upstream_response_time', '$request_time'], cat: '上游/性能', color: '#fbbf24' },
            { vars: ['$http_user_agent', '$http_referer', '$http_authorization', '$cookie_session'], cat: 'Header/Cookie', color: '#a78bfa' },
          ].map(g => (
            <div key={g.cat} className="ng-card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 700, color: g.color, fontSize: '0.82rem', marginBottom: '0.5rem' }}>{g.cat}</div>
              {g.vars.map(v => (
                <div key={v} style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#4a7a5a', padding: '0.15rem 0' }}>{v}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/core')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/proxy')}>下一模块：反向代理与负载均衡 →</button>
      </div>
    </div>
  );
}
