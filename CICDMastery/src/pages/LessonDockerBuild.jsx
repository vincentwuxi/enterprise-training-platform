import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DOCKER_TOPICS = [
  {
    name: '多阶段构建', icon: '🏗️', color: '#22c55e',
    desc: '把构建环境（含编译工具/开发依赖）和运行环境完全分离，镜像体积可减小 80-95%。',
    code: `# ── 多阶段构建：Python FastAPI 应用 ──
# 第一阶段：构建阶段（完整 Python 环境 + 依赖安装）
FROM python:3.12-slim AS builder

WORKDIR /app

# 安装构建依赖（只在 builder 阶段）
RUN pip install --upgrade pip && \\
    pip install poetry==1.8.3

COPY pyproject.toml poetry.lock ./
# 只安装生产依赖，不安装 dev 依赖，导出到 /install
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes && \\
    pip install --prefix=/install -r requirements.txt

# 第二阶段：运行阶段（最小化镜像，无构建工具）
FROM python:3.12-slim AS runtime

# 安全：非 root 用户运行
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# 只复制构建阶段安装好的包（不含 pip/poetry/编译器）
COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser src/ ./src/

USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Builder 镜像：~800MB  →  Runtime 镜像：~120MB（减小85%!）`,
  },
  {
    name: '镜像安全扫描', icon: '🛡️', color: '#ef4444',
    desc: 'Trivy 扫描镜像中的 CVE 漏洞、错误配置、SBOM 软件物料清单。CI 中集成阻断高危漏洞上线。',
    code: `# ── Trivy 镜像安全扫描（GitHub Actions 集成）──
- name: 🛡️ Security Scan with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ghcr.io/myorg/app:${{ github.sha }}'
    format: 'sarif'            # GitHub Security 标准格式
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'  # 只报告高危
    exit-code: '1'            # 发现高危时让 CI 失败！

# 上传到 GitHub Security Tab
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'

# ── 本地扫描命令 ──
# 扫描容器镜像
trivy image --severity CRITICAL,HIGH python:3.12-slim

# 扫描文件系统（检查 Dockerfile、K8s manifests）
trivy fs --security-checks config,secret .

# 生成 SBOM（软件物料清单）
trivy image --format spdx-json --output sbom.json myapp:latest

# ── 典型问题与修复 ──
# 问题1：基础镜像有漏洞 → 换到 distroless
FROM gcr.io/distroless/python3:nonroot  # Google distroless 最小化

# 问题2：包版本过旧 → 指定 slim 变体 + apt 更新
FROM python:3.12-slim
RUN apt-get update && apt-get upgrade -y && \\
    rm -rf /var/lib/apt/lists/*  # 清理 apt 缓存`,
  },
  {
    name: '构建优化', icon: '⚡', color: '#f59e0b',
    desc: 'BuildKit 并行构建、层缓存策略、.dockerignore 排除文件，把构建时间从分钟级压缩到秒级。',
    code: `# ── Dockerfile 构建优化技巧 ──

# 技巧1：先复制依赖文件，后复制源码（利用层缓存！）
# ❌ 错误：每次代码变更都重新 pip install（慢）
COPY . .
RUN pip install -r requirements.txt

# ✅ 正确：只有 requirements.txt 变更时才重新安装
COPY requirements.txt .
RUN pip install -r requirements.txt  # 被缓存！
COPY src/ ./src/                     # 代码变更不影响上层

# 技巧2：.dockerignore 排除无关文件
# .dockerignore
__pycache__/
*.pyc
.git/
.github/
tests/
docs/
*.md
.env
node_modules/
.pytest_cache/

# 技巧3：BuildKit 并行构建 + 远程缓存
export DOCKER_BUILDKIT=1  # 启用 BuildKit（Docker 23+ 默认开启）

# 并行构建多平台（ARM64 + AMD64）
docker buildx build \\
  --platform linux/amd64,linux/arm64 \\  # 同时构建两个平台
  --cache-from type=registry,ref=ghcr.io/myorg/app:cache \\
  --cache-to type=registry,ref=ghcr.io/myorg/app:cache,mode=max \\
  --push \\
  -t ghcr.io/myorg/app:latest .

# 技巧4：Slim 工具（自动分析和精简镜像）
docker-slim build --target myapp:latest --tag myapp:slim
# 自动移除未使用文件，体积减小 30-50%

# 构建时间（优化前 vs 后）：
# 首次构建：150s → 145s（差不多）
# 代码变更：150s → 15s（10倍提升，层缓存命中）`,
  },
  {
    name: 'Distroless & SBOM', icon: '📋', color: '#6366f1',
    desc: 'Distroless 镜像仅含应用运行时，无 shell/包管理器，攻击面极小。SBOM 软件物料清单用于供应链安全审计。',
    code: `# ── Google Distroless 镜像（最安全的基础镜像）──
# 特点：无 bash/sh，无包管理器，无 curl/wget
# 只有应用运行需要的最小文件

FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt
COPY src/ ./src/

# ✅ 切换到 Distroless（最小化攻击面）
FROM gcr.io/distroless/python3-debian12:nonroot
# nonroot 标签：默认以非 root 用户运行（UID 65532）

COPY --from=builder /install/lib /usr/lib
COPY --from=builder /app /app
WORKDIR /app

# 注意：distroless 没有 shell，CMD 必须用 exec 格式（数组）
CMD ["/usr/bin/python3", "-m", "uvicorn", "src.main:app"]
# ❌ CMD "uvicorn src.main:app"  -- 需要 shell，distroless 无法运行！

# ── SBOM 生成与验证（供应链安全）──
# 生成 SBOM（列出镜像中所有包及版本）
syft ghcr.io/myorg/app:latest -o spdx-json > sbom.json

# Cosign 签名镜像（防篡改）
cosign sign --key cosign.key ghcr.io/myorg/app:latest

# 在部署前验证签名
cosign verify --key cosign.pub ghcr.io/myorg/app:latest

# GitHub Actions SLSA 供应链证明（Provenance）
- uses: slsa-framework/slsa-github-generator/.github/workflows/...
  with:
    image: ghcr.io/myorg/app:${{ github.sha }}
  # 生成 SLSA Level 3 证明，链接到特定构建运行`,
  },
];

export default function LessonDockerBuild() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const [showSizes, setShowSizes] = useState(false);
  const t = DOCKER_TOPICS[activeTopic];

  const IMAGE_SIZES = [
    { name: 'python:3.12', size: 1020, type: '官方完整镜像', color: '#ef4444' },
    { name: 'python:3.12-slim', size: 130, type: '精简版', color: '#f97316' },
    { name: '多阶段构建', size: 120, type: '仅运行时', color: '#fbbf24' },
    { name: 'distroless', size: 52, type: '无 shell', color: '#22c55e' },
    { name: 'alpine-based', size: 45, type: 'Alpine 精简', color: '#3b82f6' },
  ];
  const maxSize = Math.max(...IMAGE_SIZES.map(m => m.size));

  return (
    <div className="lesson-cd">
      <div className="cd-badge amber">🐳 module_03 — 容器化最佳实践</div>
      <div className="cd-hero">
        <h1>容器化最佳实践：多阶段构建 / 安全扫描 / SBOM</h1>
        <p>好的 Dockerfile 决定了镜像安全性、构建速度和运行时性能。<strong>多阶段构建</strong>减小 95% 体积，<strong>Trivy 扫描</strong>阻断高危漏洞，<strong>Distroless</strong>最小化攻击面。</p>
      </div>

      {/* 镜像体积可视化 */}
      <div className="cd-interactive">
        <h3>📦 Python 镜像体积对比
          <button className="cd-btn" onClick={() => setShowSizes(s => !s)}>{showSizes ? '▲ 收起' : '▼ 查看对比'}</button>
        </h3>
        {IMAGE_SIZES.map(img => (
          <div key={img.name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 140, fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: img.color, flexShrink: 0 }}>
              {img.name}<br /><span style={{ color: '#8b949e', fontSize: '0.65rem' }}>{img.type}</span>
            </div>
            <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(img.size / maxSize) * 100}%`, background: img.color, borderRadius: 4, transition: 'width 0.8s', display: 'flex', alignItems: 'center', paddingLeft: 6, fontSize: '0.65rem', fontWeight: 700, color: '#000' }}>
                {img.size >= 100 ? `${img.size} MB` : ''}
              </div>
            </div>
            <div style={{ width: 60, textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', fontWeight: 700, color: img.color, flexShrink: 0 }}>{img.size} MB</div>
          </div>
        ))}
        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#8b949e' }}>
          💡 多阶段构建 + Distroless：体积从 <strong style={{ color: '#ef4444' }}>1020MB</strong> → <strong style={{ color: '#22c55e' }}>52MB</strong>，减小 <strong style={{ color: '#22c55e' }}>95%</strong>
        </div>
      </div>

      {/* 四主题 */}
      <div className="cd-section">
        <h2 className="cd-section-title">🐳 容器化四大主题（切换查看）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DOCKER_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#8b949e' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '0.5rem 0.875rem', background: `${t.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#8b949e', marginBottom: '0.625rem' }}>{t.desc}</div>

        <div className="cd-code-wrap">
          <div className="cd-code-head">
            <div className="cd-code-dot" style={{ background: '#ef4444' }} />
            <div className="cd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name} — Dockerfile</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/github-actions')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/helm-chart')}>下一模块：Helm Chart →</button>
      </div>
    </div>
  );
}
