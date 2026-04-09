import { useState } from 'react';
import './LessonCommon.css';

const CODE_DOCKER = `# ━━━━ Docker 多阶段构建：最小镜像 ━━━━
# Dockerfile

# ━━━━ 阶段 1：构建（Builder）━━━━
FROM node:20-alpine AS builder
WORKDIR /app

# 只复制 package 文件（利用 Docker 缓存）
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build          # 编译 TypeScript
RUN pnpm prune --prod   # 删除 devDependencies（减小体积）

# ━━━━ 阶段 2：运行时（最小镜像）━━━━
FROM node:20-alpine AS runner
WORKDIR /app

# 非 root 用户运行（安全最佳实践）
RUN addgroup -g 1001 nodejs && adduser -S nestjs -u 1001
USER nestjs

# 只复制必要文件（不复制源代码！）
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/main.js"]

# ━━━━ .dockerignore ━━━━
# node_modules
# dist
# .env*
# *.spec.ts
# test/
# coverage/

# ━━━━ docker-compose.yml（开发环境）━━━━
version: '3.8'
services:
  app:
    build: { context: ., target: runner }
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/mydb
    depends_on: [postgres, redis]
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment: { POSTGRES_DB: mydb, POSTGRES_USER: user, POSTGRES_PASSWORD: pass }

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

volumes:
  pgdata:`;

const CODE_HEALTH = `// ━━━━ 健康检查 + Prometheus 监控 ━━━━

// ━━━━ 1. 健康检查端点 ━━━━
@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
})
export class HealthModule {}

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private mem: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () => this.redis.pingCheck('redis', { timeout: 2000 }),
      () => this.mem.checkHeap('memory_heap', 300 * 1024 * 1024),  // 堆内存 < 300MB
      () => this.disk.checkStorage('storage', {
        thresholdPercent: 0.9,  // 磁盘使用率 < 90%
        path: '/',
      }),
    ]);
  }
}

// 响应示例（Kubernetes Readiness/Liveness Probe 会调这个）:
// GET /health → 200 OK
// {
//   "status": "ok",
//   "info": {
//     "database": { "status": "up" },
//     "redis": { "status": "up" },
//     "memory_heap": { "status": "up", "used": "120MB" }
//   }
// }

// ━━━━ 2. Prometheus 指标暴露 ━━━━
// npm install @willsoto/nestjs-prometheus prom-client

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',         // Prometheus 抓取路径
      defaultMetrics: { enabled: true },   // 自动暴露 Node.js 默认指标
    }),
  ],
})
export class AppModule {}

// 自定义业务指标
@Injectable()
export class PostsService {
  private readonly requestCounter = new Counter({
    name: 'posts_requests_total',
    help: '文章 API 请求总数',
    labelNames: ['method', 'status'],
  });

  private readonly queryDuration = new Histogram({
    name: 'posts_db_query_duration_seconds',
    help: '数据库查询耗时',
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  });

  async findAll() {
    const end = this.queryDuration.startTimer();
    try {
      const result = await this.prisma.post.findMany();
      this.requestCounter.labels('GET', '200').inc();
      return result;
    } finally {
      end();  // 记录耗时
    }
  }
}`;

const CODE_K8S = `# ━━━━ Kubernetes Helm Chart ━━━━
# helm/templates/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-api
  labels:
    app: {{ .Release.Name }}-api
spec:
  replicas: {{ .Values.replicaCount }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # 滚动更新：最多多 1 个 Pod
      maxUnavailable: 0    # 滚动更新：最少 0 个不可用
  selector:
    matchLabels:
      app: {{ .Release.Name }}-api
  template:
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: 3000
          
          # 环境变量从 Secret 注入
          envFrom:
            - secretRef:
                name: {{ .Release.Name }}-secrets

          # 资源限制（防止 OOM）
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"
            requests:
              cpu: "200m"
              memory: "256Mi"

          # 存活探针（失败 → 重启 Pod）
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3

          # 就绪探针（失败 → 从 Service 移除）
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5

---
# HPA（水平自动扩缩容）
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Release.Name }}-api
  minReplicas: 2           # 最少 2 个 Pod（高可用）
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70   # CPU 超 70% 就扩容

# 部署命令：
# helm install my-api ./helm -f values.prod.yaml
# helm upgrade my-api ./helm --set image.tag=v1.2.3`;

export default function LessonProduction() {
  const [tab, setTab] = useState('docker');

  const tabs = [
    { key: 'docker', label: '🐳 Docker 多阶段构建', code: CODE_DOCKER },
    { key: 'health', label: '❤️ 健康检查 + Prometheus', code: CODE_HEALTH },
    { key: 'k8s',    label: '⚙️ K8s Helm 部署',       code: CODE_K8S },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 08 · PRODUCTION DEPLOYMENT</div>
        <h1>生产部署</h1>
        <p>从代码到生产服务的最后一公里——<strong>Docker 多阶段构建最小镜像、Prometheus + Grafana 可观测性、K8s HPA 弹性扩缩容</strong>。掌握这些，你的 NestJS 应用真正具备生产级可靠性。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🚀 生产部署三主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`nn-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="nn-code-wrap">
          <div className="nn-code-head">
            <div className="nn-code-dot" style={{ background: '#ef4444' }} />
            <div className="nn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="nn-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'k8s' ? 'deployment.yaml' : tab + '.ts'}</span>
          </div>
          <div className="nn-code">{t.code}</div>
        </div>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🏁 全栈技术路径回顾</div>
        <div className="nn-steps">
          {[
            { step: '1', name: 'Node.js 核心', desc: 'Event Loop + Streams + Worker Threads — 理解底层才能调优', color: '#10b981' },
            { step: '2', name: 'NestJS 架构', desc: 'Module + DI + 五大核心组件 — 企业级代码组织', color: '#0ea5e9' },
            { step: '3', name: '数据库工程', desc: 'TypeORM/Prisma + 关系映射 + 防 N+1 — 数据层正确设计', color: '#8b5cf6' },
            { step: '4', name: 'REST API', desc: 'DTO + Swagger + 版本控制 — API 即文档', color: '#f59e0b' },
            { step: '5', name: '认证授权', desc: 'JWT + Passport + RBAC + OAuth — 安全是后端的底线', color: '#ef4444' },
            { step: '6', name: '实时与异步', desc: 'WebSocket + Bull + Redis — 解锁高级后端能力', color: '#0f766e' },
            { step: '7', name: '测试体系', desc: 'Jest + Supertest + 覆盖率 — 可信任的后端', color: '#10b981' },
            { step: '8', name: '生产部署', desc: 'Docker + K8s + Prometheus — 从代码到服务的最后一步', color: '#0ea5e9' },
          ].map((s, i) => (
            <div key={i} className="nn-step">
              <div className="nn-step-num" style={{ background: `${s.color}22`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--nn-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="nn-tip">
          💡 <strong>React 工程师全栈化路径</strong>：掌握这套 NestJS 体系后，你就可以独立完成从 React 前端到 NestJS 后端、到 Docker/K8s 部署的完整全栈开发——这正是现代"全栈工程师"市场最紧缺的能力。
        </div>
      </div>
    </div>
  );
}
