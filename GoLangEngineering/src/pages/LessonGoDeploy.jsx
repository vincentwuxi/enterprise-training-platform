import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['pprof 性能分析', 'GC 调优', 'Docker 容器化', 'K8s 部署'];

export default function LessonGoDeploy() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_08 — 性能调优与部署</div>
      <div className="fs-hero">
        <h1>性能调优与部署：pprof / trace / Docker / K8s</h1>
        <p>
          Go 内置了<strong>世界级的性能分析工具</strong>——pprof 可以分析 CPU/内存/goroutine，
          trace 可以可视化调度器行为。配合 Docker 多阶段构建和 K8s 部署，
          Go 的静态二进制特性使其成为云原生时代最理想的后端语言之一。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 性能与部署</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 pprof 性能分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> pprof.go</div>
                <pre className="fs-code">{`package main

import (
    "net/http"
    _ "net/http/pprof"  // 导入即自动注册 HTTP 端点
)

// ═══ 启用 pprof HTTP 端点 ═══
func main() {
    // 非生产环境直接使用 DefaultServeMux:
    go func() {
        http.ListenAndServe(":6060", nil)
    }()
    
    // 生产环境: 独立 mux, 限制访问
    mux := http.NewServeMux()
    mux.HandleFunc("/debug/pprof/", pprof.Index)
    mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
    mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
    mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
    mux.HandleFunc("/debug/pprof/trace", pprof.Trace)
    
    // 启动主服务...
}

// ═══ CPU 分析 ═══
// 采集 30 秒 CPU profile:
// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
//
// 交互模式:
// (pprof) top 20          ← 显示 CPU 占用最高的 20 个函数
// (pprof) list funcName   ← 查看函数逐行 CPU 占用
// (pprof) web             ← 生成调用图 (需要 graphviz)
// (pprof) flamegraph      ← 火焰图 (Go 1.22+)
//
// Web UI:
// go tool pprof -http=:8080 profile.pb.gz
// → 浏览器中查看火焰图、Top、Source

// ═══ 内存分析 ═══
// go tool pprof http://localhost:6060/debug/pprof/heap
//
// 关键指标:
// inuse_space  — 当前使用中的内存 (重点关注!)
// inuse_objects — 当前使用中的对象数
// alloc_space  — 累计分配的总内存
// alloc_objects — 累计分配的总对象数
//
// (pprof) top -cum  ← 按累计分配排序
// → 找出内存分配热点

// ═══ Goroutine 分析 ═══
// 查看所有 goroutine 栈:
// curl http://localhost:6060/debug/pprof/goroutine?debug=2
//
// 常见问题:
// → goroutine 泄漏: 持续增长的 goroutine 数量
// → 阻塞: channel/mutex 等待过久

// ═══ 代码级分析 ═══
import "runtime/pprof"

func cpuProfile() {
    f, _ := os.Create("cpu.prof")
    pprof.StartCPUProfile(f)
    defer pprof.StopCPUProfile()
    
    // 要分析的代码...
}

func memProfile() {
    // 做完操作后
    f, _ := os.Create("mem.prof")
    runtime.GC()  // 先触发 GC, 更准确
    pprof.WriteHeapProfile(f)
    f.Close()
}

// ═══ trace — 调度器可视化 ═══
// curl -o trace.out http://localhost:6060/debug/pprof/trace?seconds=5
// go tool trace trace.out
//
// 可视化:
// → 每个 goroutine 的运行/阻塞/系统调用时间线
// → G/M/P 调度事件
// → GC 暂停时间
// → 网络/同步阻塞
// 适合诊断延迟抖动、调度不均`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>♻️ GC 调优与内存优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> gc_tuning.go</div>
                <pre className="fs-code">{`package main

// ═══ Go GC 概览 ═══
// 并发三色标记-清除 (Concurrent Tri-color Mark-Sweep)
// → 非分代 GC (与 Java/C# 不同)
// → 低延迟优先: STW 暂停通常 <1ms
// → 吞吐量换延迟
//
// GC 触发条件:
// 1. 堆大小达到目标 (GOGC 控制)
// 2. 2 分钟未触发 GC (强制 GC)
// 3. 手动 runtime.GC()

// ═══ GOGC 调优 ═══
// GOGC=100 (默认): 堆增长 100% 时触发 GC
// GOGC=200: 堆增长 200% 时触发 → 更少 GC, 更多内存
// GOGC=50:  堆增长 50% 时触发  → 更频繁 GC, 更少内存
// GOGC=off: 关闭 GC (不推荐!)
//
// 环境变量: GOGC=200 ./myapp
// 代码:     debug.SetGCPercent(200)

// ═══ GOMEMLIMIT (Go 1.19+) ═══
// 设置软内存限制, 更智能的 GC 触发
// GOMEMLIMIT=1GiB ./myapp
//
// → 容器环境强烈推荐!
// → 示例: 容器内存限制 2GiB, 设置 GOMEMLIMIT=1.5GiB
// → GC 会在接近限制时更积极回收

// ═══ 逃逸分析 ═══
// go build -gcflags='-m -l' main.go
//
// 栈分配 (快!) vs 堆分配 (需要 GC):
func stackAlloc() int {
    x := 42     // 栈分配: 函数返回后自动释放
    return x
}

func heapAlloc() *int {
    x := 42     // 逃逸到堆! 因为返回了指针
    return &x   // go build -gcflags=-m 会提示: "moved to heap"
}

// 减少逃逸的技巧:
// 1. 返回值而非指针 (小结构体)
// 2. 预分配切片: make([]T, 0, expectedSize)
// 3. 使用 sync.Pool 复用对象
// 4. 避免 interface{} (会逃逸)

// ═══ 内存优化实践 ═══
func memoryOptimization() {
    // 1. 预分配切片
    // ❌ var s []int; for ... { s = append(s, x) }
    // ✅ s := make([]int, 0, 1000)
    
    // 2. 字符串拼接
    // ❌ s += "data"  (每次创建新字符串)
    // ✅ strings.Builder
    
    // 3. 避免切片泄漏
    // ❌ return bigSlice[:2]  (底层数组仍持有!)
    // ✅ result := make([]int, 2); copy(result, bigSlice[:2])
    
    // 4. 结构体字段排列 (减少 padding)
    // ❌ struct { a bool; b int64; c bool }  // 24 bytes
    // ✅ struct { b int64; a bool; c bool }  // 16 bytes
    
    // 5. sync.Pool 复用
    var bufPool = sync.Pool{
        New: func() any { return new(bytes.Buffer) },
    }
    buf := bufPool.Get().(*bytes.Buffer)
    buf.Reset()
    // 使用 buf...
    bufPool.Put(buf)
}

// ═══ 诊断命令 ═══
// GODEBUG=gctrace=1 ./myapp
// → 每次 GC 打印详细信息
// gc 1 @0.012s 0%: 0.009+0.21+0.004 ms clock, ...
//
// runtime.ReadMemStats(&memStats)
// → 编程方式获取内存统计`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐳 Docker 容器化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2496ed'}}></span> Dockerfile</div>
                <pre className="fs-code">{`# ═══ 多阶段构建 (Multi-stage Build) ═══

# Stage 1: 构建
FROM golang:1.22-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# 先复制依赖文件, 利用缓存层
COPY go.mod go.sum ./
RUN go mod download

# 复制源码
COPY . .

# 编译静态二进制
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \\
    go build -ldflags="-s -w \\
    -X main.version=1.0.0 \\
    -X main.buildTime=$(date -u +%Y%m%d%H%M%S)" \\
    -o /app/server ./cmd/server

# Stage 2: 运行
FROM scratch
# 或 FROM gcr.io/distroless/static-debian12

# 从 builder 复制必要文件
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /server

# 非 root 用户 (安全!)
# USER 65534:65534

EXPOSE 8080
ENTRYPOINT ["/server"]

# ═══ 镜像大小对比 ═══
# golang:1.22        → ~800MB
# golang:1.22-alpine → ~250MB
# gcr.io/distroless  → ~20MB
# scratch            → ~10MB (只有二进制!)
# → Go 静态链接 = 完美的容器化语言

# ═══ .dockerignore ═══
# .git
# .env
# *.test
# vendor/
# tmp/

# ═══ docker-compose.yml ═══
# version: "3.9"
# services:
#   app:
#     build: .
#     ports: ["8080:8080"]
#     environment:
#       - DATABASE_URL=postgres://user:pass@db:5432/mydb
#       - REDIS_URL=redis://redis:6379
#       - GOMEMLIMIT=512MiB
#     depends_on:
#       db: { condition: service_healthy }
#       redis: { condition: service_started }
#     deploy:
#       resources:
#         limits: { cpus: "2", memory: 1G }
#   db:
#     image: postgres:16
#     volumes: [pgdata:/var/lib/postgresql/data]
#     healthcheck:
#       test: ["CMD-SHELL", "pg_isready"]
#   redis:
#     image: redis:7-alpine
# volumes:
#   pgdata:

# ═══ 构建优化 ═══
# 1. 缓存 go mod download 层
# 2. 使用 .dockerignore
# 3. 使用 BuildKit: DOCKER_BUILDKIT=1 docker build .
# 4. 多平台构建:
#    docker buildx build --platform linux/amd64,linux/arm64 -t myapp .`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>☸️ Kubernetes 部署</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#326ce5'}}></span> k8s_deploy.yaml</div>
                <pre className="fs-code">{`# ═══ Deployment ═══
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-api
  labels:
    app: go-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: go-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0   # 零停机部署
  template:
    metadata:
      labels:
        app: go-api
    spec:
      containers:
      - name: api
        image: registry.example.com/go-api:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: GOMEMLIMIT
          value: "400MiB"     # 设置为 requests.memory 的 80%
        - name: GOMAXPROCS
          value: "2"          # 匹配 CPU limits
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            cpu: 100m         # 0.1 CPU
            memory: 256Mi
          limits:
            cpu: "2"
            memory: 512Mi
        # 健康检查
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 3
          periodSeconds: 5
        startupProbe:           # 启动探针 (慢启动)
          httpGet:
            path: /health
            port: 8080
          failureThreshold: 30
          periodSeconds: 1
        # 安全上下文
        securityContext:
          runAsNonRoot: true
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false

---
# ═══ Service ═══
apiVersion: v1
kind: Service
metadata:
  name: go-api
spec:
  selector:
    app: go-api
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP

---
# ═══ HPA (自动扩缩) ═══
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: go-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: go-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

# ═══ 优雅关闭 (Graceful Shutdown) ═══
# Go 代码:
# ctx, stop := signal.NotifyContext(context.Background(),
#     syscall.SIGINT, syscall.SIGTERM)
# defer stop()
#
# go func() {
#     server.ListenAndServe()
# }()
#
# <-ctx.Done()
# shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
# defer cancel()
# server.Shutdown(shutdownCtx)  // 等待请求完成

# ═══ Go + K8s 最佳实践 ═══
# 1. GOMEMLIMIT = 80% of memory limit
# 2. GOMAXPROCS = CPU limit (用 uber/automaxprocs 自动检测)
# 3. 健康检查: /health (存活) + /ready (就绪)
# 4. 优雅关闭: 处理 SIGTERM, 等待请求完成
# 5. 结构化日志: JSON 格式, 配合 EFK/Loki
# 6. 指标暴露: Prometheus /metrics 端点
# 7. 分布式追踪: OpenTelemetry SDK`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
