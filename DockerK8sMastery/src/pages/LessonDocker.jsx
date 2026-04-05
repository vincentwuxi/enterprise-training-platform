import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CMD_GROUPS = [
  {
    cat: '镜像操作', icon: '🖼️',
    cmds: [
      { cmd: 'docker pull nginx:latest', out: 'latest: Pulling from library/nginx\nDigest: sha256:abc123...\nStatus: Image is up to date for nginx:latest', desc: '从 Docker Hub 拉取镜像' },
      { cmd: 'docker images', out: 'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE\nnginx        latest    abc123def456   2 weeks ago    187MB\npython       3.12      fedcba654321   3 weeks ago    1.02GB', desc: '列出本地所有镜像' },
      { cmd: 'docker inspect nginx:latest', out: '[\n  {\n    "Id": "sha256:abc123...",\n    "Architecture": "amd64",\n    "Os": "linux",\n    "Size": 196055516,\n    "RootFS": {\n      "Type": "layers",\n      "Layers": ["sha256:layer1...", "sha256:layer2..."]\n    }\n  }\n]', desc: '查看镜像详细信息（层结构）' },
      { cmd: 'docker rmi nginx:latest', out: 'Untagged: nginx:latest\nDeleted: sha256:abc123...', desc: '删除本地镜像' },
    ],
  },
  {
    cat: '容器生命周期', icon: '🔄',
    cmds: [
      { cmd: 'docker run -d -p 8080:80 --name web nginx', out: 'a1b2c3d4e5f6...  ← 容器 ID\n\n# 解释:\n# -d        后台运行（detached）\n# -p 8080:80  宿主机8080 → 容器80\n# --name web  给容器命名', desc: '在后台启动 nginx 容器并映射端口' },
      { cmd: 'docker ps', out: 'CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS    PORTS                  NAMES\na1b2c3d4e5f6   nginx   "..."     5s ago    Up 5s     0.0.0.0:8080->80/tcp   web', desc: '查看运行中的容器' },
      { cmd: 'docker stop web && docker rm web', out: 'web\nweb\n\n# stop: 发送 SIGTERM 优雅关闭\n# rm:   删除停止的容器\n# 合并: docker rm -f web (强制删除运行中容器)', desc: '停止并删除容器' },
      { cmd: 'docker run --rm -it ubuntu bash', out: 'root@a1b2c3d4:/# ls\nbin  boot  dev  etc  home  lib  ...\nroot@a1b2c3d4:/# exit\n# --rm: 退出后自动删除容器\n# -it:  交互式终端', desc: '启动交互式容器（退出后自动删除）' },
    ],
  },
  {
    cat: '调试与日志', icon: '🔍',
    cmds: [
      { cmd: 'docker logs -f web', out: '172.17.0.1 - - [05/Apr/2024] "GET / HTTP/1.1" 200 615\n172.17.0.1 - - [05/Apr/2024] "GET /favicon.ico" 404 555\n... (持续输出，Ctrl+C 退出)\n\n-f: follow 实时跟踪\n--tail 100: 只看最后100行', desc: '查看容器日志（实时跟踪）' },
      { cmd: 'docker exec -it web bash', out: 'root@a1b2c3d4:/# nginx -v\nnginx version: nginx/1.25.3\nroot@a1b2c3d4:/# cat /etc/nginx/nginx.conf\n...\n# exec 进入运行中容器执行命令', desc: '进入运行中容器的 Shell' },
      { cmd: 'docker stats', out: 'CONTAINER ID  NAME  CPU %  MEM USAGE/LIMIT  NET I/O     BLOCK I/O\na1b2c3d4e5f6  web   0.0%   5.2MiB/8GiB     1.2kB/648B  0B/0B\n\n# 实时资源使用监控\n# 类似 Linux 的 top 命令', desc: '实时监控容器资源使用' },
      { cmd: 'docker cp web:/etc/nginx/nginx.conf ./nginx.conf', out: 'Successfully copied 2.56kB\n\n# 在容器和宿主机之间复制文件\n# 方向可以反过来:\n# docker cp ./new.conf web:/etc/nginx/', desc: '从容器中复制文件到宿主机' },
    ],
  },
  {
    cat: '网络与存储', icon: '🌐',
    cmds: [
      { cmd: 'docker network create app-net', out: 'b7c8d9e0f1a2...  ← 网络 ID\n\n# 容器可以通过容器名互相访问:\n# docker run --network app-net --name db postgres\n# docker run --network app-net --name api myapp\n# api 容器: 使用 db:5432 连接数据库', desc: '创建自定义Bridge网络（容器间通信）' },
      { cmd: 'docker volume create mydata', out: 'mydata\n\n# 挂载卷到容器:\n# docker run -v mydata:/var/lib/postgresql/data postgres\n# 或绑定挂载宿主机目录:\n# docker run -v $(pwd)/data:/app/data myapp\n\n# 查看卷: docker volume ls\n# 清理: docker volume prune', desc: '创建数据卷（持久化容器数据）' },
    ],
  },
];

export default function LessonDocker() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState(0);
  const [activeCmd, setActiveCmd] = useState(0);
  const [typed, setTyped] = useState('');

  const cmds = CMD_GROUPS[activeCat].cmds;

  return (
    <div className="lesson-dk">
      <div className="dk-badge">🐳 module_02 — Docker 实战</div>

      <div className="dk-hero">
        <h1>Docker 实战：镜像、容器与核心命令</h1>
        <p>Docker 的核心模型极其简洁：<strong>镜像（Image）</strong> 是静态模板，<strong>容器（Container）</strong> 是运行实例。掌握这 20 个命令，你就能驾驭 90% 的日常 Docker 场景。</p>
      </div>

      {/* Docker 核心概念 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🏗️ Docker 核心概念关系图</h2>
        <div className="dk-arch">{`
  Dockerfile  →  docker build  →  Image  →  docker push  →  Registry (Docker Hub)
                                    │
                                    ↓ docker pull / docker run
                                  Container (运行实例)
                                    │
              ┌─────────────────────┼───────────────────────┐
              ↓                     ↓                       ↓
          stdout/stderr          Network                  Volume
         (docker logs)       (docker network)         (docker volume)
                                   │                       │
                             端口映射 -p              数据持久化 -v
                          宿主机端口 → 容器端口        避免容器删除时数据丢失`}</div>
      </div>

      {/* 命令模拟器 */}
      <div className="dk-section">
        <h2 className="dk-section-title">💻 交互式命令模拟器</h2>
        <div className="dk-interactive">
          <h3>
            选择命令类别
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CMD_GROUPS.map((g, i) => (
                <button key={g.cat} className={`dk-btn ${activeCat === i ? 'primary' : ''}`}
                  onClick={() => { setActiveCat(i); setActiveCmd(0); }}>
                  {g.icon} {g.cat}
                </button>
              ))}
            </div>
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {cmds.map((c, i) => (
              <button key={i} className={`dk-btn ${activeCmd === i ? 'primary' : ''}`}
                onClick={() => setActiveCmd(i)}
                style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                {c.cmd.split(' ').slice(0, 3).join(' ')}...
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
            📖 {cmds[activeCmd].desc}
          </div>

          <div className="dk-term-wrapper">
            <div className="dk-term-header">
              <div className="dk-term-dot" style={{ background: '#ef4444' }} />
              <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
              <div className="dk-term-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>bash — docker</span>
            </div>
            <div className="dk-term">
              <span className="prompt">$ </span>
              <span className="cmd">{cmds[activeCmd].cmd}</span>
              {'\n'}
              <span className="out">{cmds[activeCmd].out}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 镜像分层 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🗂️ 镜像分层机制（UnionFS）</h2>
        <div className="dk-card">
          <div className="dk-arch" style={{ fontSize: '0.75rem' }}>{`
                nginx:latest 镜像的层结构：

  ┌─────────────────────────────────────────┐  ← 可写层（容器运行时新增）
  │  Container Layer (writable)              │
  ├─────────────────────────────────────────┤  ← 只读镜像层
  │  Layer 4: COPY ./config /etc/nginx/     │
  ├─────────────────────────────────────────┤
  │  Layer 3: RUN apt-get install nginx     │
  ├─────────────────────────────────────────┤
  │  Layer 2: RUN apt-get update            │
  ├─────────────────────────────────────────┤
  │  Layer 1: FROM ubuntu:22.04 (基础层)    │
  └─────────────────────────────────────────┘

  关键：相同的层在多个镜像/容器间共享 → 节省磁盘、加快拉取速度
  docker history nginx:latest  ← 查看所有层`}</div>
        </div>
      </div>

      {/* 常用技巧 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⚡ 高频实用技巧</h2>
        <div className="dk-grid-2">
          {[
            { title: '一键清理所有停止的容器', code: 'docker container prune -f\n# 或清理所有未使用资源\ndocker system prune -af --volumes\n# ⚠️ 谨慎：会删除所有未使用镜像/卷' },
            { title: '查看容器 IP 地址', code: `docker inspect \\
  -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \\
  web` },
            { title: '限制资源（内存+CPU）', code: 'docker run -d \\\n  --memory="512m"    \\\n  --cpus="1.5"       \\\n  --name limited     \\\n  nginx' },
            { title: '环境变量注入', code: 'docker run -d \\\n  -e DB_HOST=db \\\n  -e DB_PORT=5432 \\\n  -e DB_PASSWORD=secret \\\n  --env-file .env.prod \\\n  myapp:latest' },
          ].map(t => (
            <div key={t.title} className="dk-card">
              <h3 style={{ fontSize: '0.875rem' }}>{t.title}</h3>
              <div className="dk-term-wrapper" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <div className="dk-term" style={{ fontSize: '0.75rem', padding: '0.6rem 0.875rem' }}>{t.code}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/containers')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/dockerfile')}>下一模块：Dockerfile →</button>
      </div>
    </div>
  );
}
