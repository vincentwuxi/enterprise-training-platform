import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const EXAMPLES = {
  bad: `# ❌ 反面教材 Dockerfile（别这样写！）
FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y pip
RUN pip install flask
RUN pip install requests

COPY . /app
WORKDIR /app

# 问题：
# 1. 多个 RUN 命令 = 多个层 → 镜像巨大
# 2. COPY . 包含了 .git、__pycache__ 等无用文件
# 3. 没有固定版本 → 构建不可重复
# 4. 以 root 运行 → 安全风险
# 5. 没有 HEALTHCHECK → 无法自愈`,

  good: `# ✅ 生产级 Python Flask 应用 Dockerfile
# syntax=docker/dockerfile:1

# Stage 1：依赖安装层（利用缓存）
FROM python:3.12-slim AS deps
WORKDIR /app

# 先只复制依赖文件（变化频率低，优先缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2：最终镜像（多阶段构建）
FROM python:3.12-slim AS final

# 创建非 root 用户（安全最佳实践）
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# 从 deps 阶段复制已安装的包
COPY --from=deps /usr/local/lib/python3.12 /usr/local/lib/python3.12

# 只复制必要文件
COPY --chown=app:app src/ ./src/
COPY --chown=app:app config.py .

# 切换到非 root 用户
USER app

EXPOSE 5000

# 健康检查（K8s 依赖此判断容器是否就绪）
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "src/app.py"]`,

  nginx: `# ✅ 多阶段构建：React 前端应用
# Stage 1：Node.js 构建
FROM node:20-alpine AS builder
WORKDIR /build

# 利用层缓存：依赖变化比代码少
COPY package*.json ./
RUN npm ci --frozen-lockfile  # 比 npm install 更严格

COPY . .
RUN npm run build
# 输出：/build/dist/ 目录

# Stage 2：Nginx 生产镜像（极小！）
FROM nginx:alpine AS final
# alpine 版本：仅 ~23MB

# 从构建阶段复制产物
COPY --from=builder /build/dist /usr/share/nginx/html

# 自定义 nginx 配置（SPA 路由支持）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# 最终镜像不含 node_modules，体积 < 30MB！`,
};

const BUILD_BEST = [
  { no: 1, rule: '充分利用构建缓存', tip: '将最不频繁变化的指令（FROM、安装依赖）放在顶部，频繁变化的（COPY 源码）放底部' },
  { no: 2, rule: '使用 .dockerignore', tip: '类似 .gitignore，排除 node_modules/、.git/、__pycache__/、*.log 等，避免无效文件进入镜像' },
  { no: 3, rule: '固定基础镜像版本', tip: '用 python:3.12-slim 而非 python:latest，确保构建可重复性，避免生产事故' },
  { no: 4, rule: '以非 root 用户运行', tip: '容器逃逸时 root 权限危害极大，创建专用用户 adduser --system app 并 USER app' },
  { no: 5, rule: '多阶段构建缩小体积', tip: '构建工具（gcc、node等）不进入最终镜像，只复制产物，典型从 1GB → 50MB' },
  { no: 6, rule: '设置 HEALTHCHECK', tip: 'K8s livenessProbe/readinessProbe 依赖此判断容器是否健康，实现自动重启' },
  { no: 7, rule: '合并 RUN 命令', tip: 'RUN apt-get update && apt-get install -y pkg && rm -rf /var/lib/apt/lists/*（减少层数 + 清理缓存）' },
  { no: 8, rule: '使用 ARG 参数化构建', tip: 'ARG VERSION=1.0 可在构建时覆盖：docker build --build-arg VERSION=2.0' },
];

export default function LessonDockerfile() {
  const navigate = useNavigate();
  const [example, setExample] = useState('good');
  const [checklist, setChecklist] = useState({});

  const toggle = (i) => setChecklist(p => ({ ...p, [i]: !p[i] }));
  const score = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="lesson-dk">
      <div className="dk-badge">📋 module_03 — Dockerfile 精通</div>

      <div className="dk-hero">
        <h1>Dockerfile 精通：多阶段构建与最佳实践</h1>
        <p>Dockerfile 是镜像的"菜谱"。写好 Dockerfile 的关键在于理解<strong>层缓存机制</strong>和<strong>多阶段构建</strong>——前者加速 CI/CD，后者让生产镜像轻量安全。</p>
      </div>

      {/* Dockerfile 对比 */}
      <div className="dk-section">
        <h2 className="dk-section-title">📝 Dockerfile 示例（切换查看）</h2>
        <div className="dk-interactive">
          <h3>
            示例切换
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['bad','❌ 反例'], ['good','✅ Python 最佳实践'], ['nginx','✅ 多阶段 React']].map(([k, l]) => (
                <button key={k} className={`dk-btn ${example === k ? 'primary' : ''}`} onClick={() => setExample(k)}>{l}</button>
              ))}
            </div>
          </h3>
          <div className="dk-term-wrapper">
            <div className="dk-term-header">
              <div className="dk-term-dot" style={{ background: '#ef4444' }} />
              <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
              <div className="dk-term-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>Dockerfile</span>
            </div>
            <div className="dk-term" style={{ maxHeight: '420px', overflow: 'auto' }}>{EXAMPLES[example]}</div>
          </div>
        </div>
      </div>

      {/* 缓存机制可视化 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⚡ 构建缓存机制（理解这个 = 省 80% CI/CD 时间）</h2>
        <div className="dk-card">
          <div className="dk-arch" style={{ fontSize: '0.74rem' }}>{`
第一次构建：全部执行                    第二次构建（只改了源代码）：

Step 1/6: FROM python:3.12-slim        Step 1/6: FROM python:3.12-slim
  → 下载基础镜像...（慢）                 → Using cache  ✅（0.0s）

Step 2/6: COPY requirements.txt .      Step 2/6: COPY requirements.txt .
  → 复制文件...                           → Using cache  ✅（0.0s）

Step 3/6: RUN pip install...           Step 3/6: RUN pip install...
  → 安装依赖...（慢，2分钟）               → Using cache  ✅（0.0s）

Step 4/6: COPY src/ .                  Step 4/6: COPY src/ .
  → 复制源码...                           → ❌ 源码变了！缓存失效
                                           → 重新执行（从这层开始往后都重新执行）

Step 5/6: RUN python -m pytest          Step 5/6: RUN python -m pytest
  → 运行测试...                           → 重新执行

最终结论：依赖安装步骤放在 COPY 源码之前 → 享受缓存 → CI从3分钟→10秒！`}</div>
        </div>
      </div>

      {/* .dockerignore */}
      <div className="dk-section">
        <h2 className="dk-section-title">🚫 .dockerignore — 必须配置的文件</h2>
        <div className="dk-card">
          <div className="dk-term-wrapper">
            <div className="dk-term-header">
              <div className="dk-term-dot" style={{ background: '#ef4444' }} />
              <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
              <div className="dk-term-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>.dockerignore</span>
            </div>
            <div className="dk-term">{`# 版本控制
.git/
.gitignore

# 依赖目录（镜像内重新安装）
node_modules/
vendor/
__pycache__/
*.pyc

# 日志和临时文件
*.log
.env
.env.local
*.tmp

# 测试和文档
tests/
docs/
*.test.js
coverage/

# Docker 相关（避免循环引用）
Dockerfile*
docker-compose*.yml
.dockerignore

# IDE 配置
.vscode/
.idea/
*.swp`}</div>
          </div>
        </div>
      </div>

      {/* 最佳实践清单 */}
      <div className="dk-section">
        <h2 className="dk-section-title">✅ Dockerfile 最佳实践清单（{score}/{BUILD_BEST.length} 完成）</h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <div className="dk-meter">
            <div className="dk-meter-fill" style={{ width: `${(score / BUILD_BEST.length) * 100}%`, background: 'linear-gradient(90deg, #0369a1, #0db7ed)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {BUILD_BEST.map((b, i) => (
            <div key={i}
              onClick={() => toggle(i)}
              style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.875rem 1rem', borderRadius: '8px', cursor: 'pointer',
                background: checklist[i] ? 'rgba(13,183,237,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checklist[i] ? 'rgba(13,183,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.2s',
              }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${checklist[i] ? '#0db7ed' : '#334155'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: checklist[i] ? '#0db7ed' : 'transparent', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                {checklist[i] ? '✓' : ''}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: checklist[i] ? '#0db7ed' : '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                  {b.no}. {b.rule}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>{b.tip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/docker')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/compose')}>下一模块：Docker Compose →</button>
      </div>
    </div>
  );
}
