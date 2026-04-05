import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const COMPOSE_FILE = `version: '3.9'

# ─────────────────────────────────────────
# 生产级 Web 应用 docker-compose.yml
# 服务：React 前端 + FastAPI 后端 + PostgreSQL + Redis + Nginx
# ─────────────────────────────────────────

services:
  # ① Nginx 反向代理 / 前端静态资源
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./certs:/etc/ssl/certs:ro
    depends_on:
      api:
        condition: service_healthy  # 等待 api 健康检查通过
    networks: [frontend, backend]

  # ② FastAPI 后端 API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    environment:
      DATABASE_URL: postgresql://\${DB_USER}:\${DB_PASS}@db:5432/\${DB_NAME}
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: \${SECRET_KEY}
    env_file: .env.prod
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      replicas: 2          # 运行 2 个副本（负载均衡）
      restart_policy:
        condition: on-failure
        max_attempts: 3
    networks: [backend]

  # ③ PostgreSQL 主数据库
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASS}
      POSTGRES_DB: \${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data   # 数据持久化
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [backend]

  # ④ Redis 缓存 + Session 存储
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASS} --maxmemory 256mb
    volumes:
      - redisdata:/data
    networks: [backend]

# 命名卷（数据持久化）
volumes:
  pgdata:
  redisdata:

# 网络隔离（前端服务只能访问 backend 网络中的 api）
networks:
  frontend:
  backend:
    internal: true  # 纯内部网络，容器无法直接访问外网`;

const COMPOSE_CMDS = [
  { cmd: 'docker compose up -d', desc: '后台启动所有服务（首次构建镜像）' },
  { cmd: 'docker compose up -d --build', desc: '强制重新构建镜像后启动' },
  { cmd: 'docker compose ps', desc: '查看所有服务状态' },
  { cmd: 'docker compose logs -f api', desc: '实时查看 api 服务日志' },
  { cmd: 'docker compose exec db psql -U admin nexuslearn', desc: '进入数据库容器执行 psql' },
  { cmd: 'docker compose scale api=4', desc: '将 api 服务扩展到 4 个副本' },
  { cmd: 'docker compose down -v', desc: '停止并删除所有服务和数据卷（⚠️慎用）' },
  { cmd: 'docker compose restart api', desc: '重启单个服务（不停其他服务）' },
];

const SERVICES = [
  { name: 'nginx', icon: '🌐', port: '80/443', role: '反向代理 + 静态资源', color: '#10b981' },
  { name: 'api (×2)', icon: '⚡', port: '8000', role: 'FastAPI 后端（双副本）', color: '#0db7ed' },
  { name: 'db', icon: '🗃️', port: '5432', role: 'PostgreSQL 主数据库', color: '#326CE5' },
  { name: 'redis', icon: '🔴', port: '6379', role: '缓存 + Session 存储', color: '#ef4444' },
];

export default function LessonCompose() {
  const navigate = useNavigate();
  const [activeCmd, setActiveCmd] = useState(0);
  const [activeService, setActiveService] = useState(null);

  return (
    <div className="lesson-dk">
      <div className="dk-badge">🎼 module_04 — Docker Compose</div>

      <div className="dk-hero">
        <h1>Docker Compose：多服务应用一键编排</h1>
        <p>真实应用从不是单个容器。<strong>docker-compose.yml</strong> 用一个文件定义所有服务、网络、卷的关系，实现一条命令启动完整应用栈。</p>
      </div>

      {/* 服务架构图 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🏗️ 多服务架构（点击查看服务详情）</h2>
        <div className="dk-card">
          <div className="dk-arch" style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>{`
  用户浏览器
       │ :80/:443
       ▼
  ┌─────────┐    frontend 网络
  │  Nginx  │──────────────────────────────────────────────
  └────┬────┘
       │ /api/* 代理至后端          backend 网络 (internal=true)
       ├──────────────────────────────────────────────────
       │         ┌─────────────┐  ┌─────────────┐
       └────────►│   api (1)   │  │   api (2)   │  副本×2
                 └──────┬──────┘  └──────┬──────┘
                        │  负载均衡        │
                ┌───────┴──────────────────┤
                ▼                          ▼
          ┌────────┐                 ┌─────────┐
          │   db   │                 │  redis  │
          │  :5432 │                 │  :6379  │
          └────────┘                 └─────────┘
                │                        │
           pgdata 卷                 redisdata 卷`}</div>

          <div className="dk-grid-4">
            {SERVICES.map((s, i) => (
              <div key={s.name}
                onClick={() => setActiveService(activeService === i ? null : i)}
                style={{
                  padding: '0.875rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  background: activeService === i ? `${s.color}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeService === i ? s.color + '40' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', fontWeight: 700, color: s.color }}>{s.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem' }}>:{s.port}</div>
              </div>
            ))}
          </div>
          {activeService !== null && (
            <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: `${SERVICES[activeService].color}08`, border: `1px solid ${SERVICES[activeService].color}25`, borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
              {SERVICES[activeService].icon} <strong style={{ color: SERVICES[activeService].color }}>{SERVICES[activeService].name}</strong>：{SERVICES[activeService].role}，监听端口 :{SERVICES[activeService].port}
            </div>
          )}
        </div>
      </div>

      {/* compose 文件查看 */}
      <div className="dk-section">
        <h2 className="dk-section-title">📄 生产级 docker-compose.yml 全文</h2>
        <div className="dk-term-wrapper">
          <div className="dk-term-header">
            <div className="dk-term-dot" style={{ background: '#ef4444' }} />
            <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
            <div className="dk-term-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>docker-compose.yml</span>
          </div>
          <div className="dk-term" style={{ maxHeight: '500px', overflow: 'auto', fontSize: '0.75rem' }}>{COMPOSE_FILE}</div>
        </div>
      </div>

      {/* 常用命令 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⌨️ Compose 核心命令速查</h2>
        <div className="dk-interactive">
          <h3>
            命令演示
            <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 400 }}>点击查看说明</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {COMPOSE_CMDS.map((c, i) => (
              <button key={i} className={`dk-btn ${activeCmd === i ? 'primary' : ''}`}
                onClick={() => setActiveCmd(i)}
                style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                {c.cmd.split(' ').slice(2, 4).join(' ')}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>📖 {COMPOSE_CMDS[activeCmd].desc}</div>
          <div className="dk-term-wrapper">
            <div className="dk-term-header">
              <div className="dk-term-dot" style={{ background: '#ef4444' }} />
              <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
              <div className="dk-term-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>terminal</span>
            </div>
            <div className="dk-term">
              <span className="prompt">$ </span>
              <span className="cmd">{COMPOSE_CMDS[activeCmd].cmd}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compose vs K8s 对比 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⚖️ Docker Compose vs Kubernetes：何时用哪个？</h2>
        <div className="dk-card">
          <table className="dk-table">
            <thead><tr><th>场景</th><th>🎼 Docker Compose</th><th>☸️ Kubernetes</th></tr></thead>
            <tbody>
              {[
                ['规模', '单机，10个以内服务', '多机集群，数千容器'],
                ['学习成本', '低（YAML简单）', '高（概念多，配置复杂）'],
                ['高可用', '无（单点故障）', '内置自愈、多副本、跨节点'],
                ['弹性伸缩', '手动 scale', '自动水平扩容（HPA）'],
                ['滚动更新', '需手动操作', '内置滚动更新/回滚'],
                ['生产使用', '⚠️ 小型项目/开发环境', '✅ 企业级生产首选'],
                ['适合谁', '个人开发、初创、CI环境', '中大型企业、微服务架构'],
              ].map(([s, d, k]) => (
                <tr key={s}>
                  <td style={{ fontWeight: 600, color: '#94a3b8' }}>{s}</td>
                  <td style={{ fontSize: '0.82rem', color: '#34d399' }}>{d}</td>
                  <td style={{ fontSize: '0.82rem', color: '#93c5fd' }}>{k}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/dockerfile')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/k8score')}>下一模块：Kubernetes 核心 →</button>
      </div>
    </div>
  );
}
