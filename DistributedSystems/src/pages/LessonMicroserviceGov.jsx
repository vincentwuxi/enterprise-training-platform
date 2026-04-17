import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['服务注册与发现', '流量治理', '可观测性', 'Service Mesh'];

export default function LessonMicroserviceGov() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_07 — 微服务治理</div>
      <div className="fs-hero">
        <h1>微服务治理：注册发现 / 熔断 / 限流 / Mesh</h1>
        <p>
          微服务将单体应用拆分为独立部署的服务，但带来了<strong>分布式治理</strong>的全新挑战——
          服务发现 (谁在哪？)、负载均衡 (发给谁？)、熔断限流 (怎么保护？)、
          可观测性 (出了什么问题？)。Service Mesh 将这些横切关注点下沉到基础设施层。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 微服务治理深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 服务注册与发现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> discovery.txt</div>
                <pre className="fs-code">{`═══ 为什么需要服务发现? ═══

  单体: 函数调用 (内存地址, 编译时确定)
  微服务: RPC/HTTP 调用 (IP:Port, 运行时变化!)
  
  挑战:
    → 实例动态伸缩 (3个 → 10个)
    → IP 地址不固定 (容器、K8s Pod)
    → 实例可能不健康 (需要健康检查)

═══ 服务注册中心 ═══

  注册: 服务启动 → 向注册中心注册 (IP:Port)
  发现: 调用方查询注册中心 → 获取目标服务实例列表
  健康检查: 注册中心定期检查实例存活
  注销: 服务关闭 → 从注册中心注销

═══ 实现对比 ═══

  etcd / Consul (CP):
    → 基于 Raft 共识
    → 强一致性: 注册信息不会丢
    → 分区时可能不可用
    → K8s 内部使用 etcd

  Nacos (AP/CP 可切换):
    → 阿里开源
    → 配置中心 + 服务发现
    → AP 模式: 临时实例, 心跳检测
    → CP 模式: 持久化实例, Raft
    → Java 生态首选 (Spring Cloud Alibaba)

  ZooKeeper (CP):
    → 老牌, 但不推荐用于服务发现
    → 半数节点故障 → 不可用
    → Dubbo 早期使用

  Eureka (AP, 已停更):
    → Netflix 开源, Spring Cloud 默认
    → AP: 分区时仍可用 (可能读到过期数据)
    → 自保护模式: 大面积注销时暂停剔除
    → 2.x 停更, 建议迁移到 Nacos/Consul

═══ 客户端发现 vs 服务端发现 ═══

  客户端发现:
    → 客户端从注册中心获取实例列表
    → 客户端自己做负载均衡
    → 例: Ribbon, gRPC 负载均衡
    → 优: 少一跳; 缺: SDK 侵入

  服务端发现:
    → 通过负载均衡器/网关路由
    → 客户端不知道具体实例
    → 例: AWS ALB, K8s Service
    → 优: 语言无关; 缺: 多一跳

═══ K8s 服务发现 ═══

  Service: 稳定的虚拟 IP (ClusterIP)
    → DNS: my-service.namespace.svc.cluster.local
    → kube-proxy: iptables/IPVS 规则
    → 自动追踪 Pod 变化

  Headless Service: 没有 ClusterIP
    → DNS 直接返回 Pod IP (用于有状态服务)
    → StatefulSet + Headless = 稳定的网络标识`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 流量治理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> traffic.txt</div>
                <pre className="fs-code">{`═══ 熔断 (Circuit Breaker) ═══

  下游服务故障时, 快速失败, 避免级联故障

  三种状态:
    Closed (正常):
      → 请求正常通过
      → 统计失败率

    Open (熔断):
      → 失败率超过阈值 → 打开熔断器
      → 后续请求直接失败 (不调用下游)
      → 返回降级响应 (fallback)

    Half-Open (半开):
      → 等待冷却时间后
      → 放少量请求试探下游
      → 试探成功 → 关闭熔断器 (恢复)
      → 试探失败 → 继续熔断

  参数:
    → 失败率阈值: 50% (5个中3个失败)
    → 最小调用数: 10 (至少10个请求才统计)
    → 熔断持续时间: 30s
    → 滑动窗口: 最近 10s 的数据

  实现: Resilience4j (Java), Polly (.NET), gobreaker (Go)

═══ 限流 (Rate Limiting) ═══

  令牌桶 (Token Bucket):
    → 桶容量: B (突发量)
    → 填充速率: R tokens/sec
    → 请求需要消耗一个 token
    → 桶空 → 拒绝 (或排队)
    → 允许突发! (桶满时可一次消耗 B 个)

  漏桶 (Leaky Bucket):
    → 请求进入桶, 固定速率流出
    → 桶满 → 新请求丢弃
    → 流量整形: 输出恒定速率

  滑动窗口:
    → 精确统计最近 N 秒的请求数
    → 比固定窗口更精确 (不会在窗口边界突发)

  分布式限流:
    → Redis + Lua 脚本 (原子操作)
    → 所有节点共享同一个计数器
    → Sentinel, Envoy Rate Limit

═══ 负载均衡 ═══

  轮询 (Round Robin):
    → 依次分配, 最简单
    → 问题: 不感知服务器负载

  加权轮询 (Weighted RR):
    → 高性能节点分配更多请求
    → Nginx upstream weight

  最少连接 (Least Connections):
    → 发送到当前连接数最少的节点
    → 适合长连接、处理时间不均的场景

  一致性哈希:
    → 相同 key → 相同节点 (缓存友好)
    → 适合有状态路由

  P2C (Power of Two Choices):
    → 随机选 2 个, 挑负载更低的
    → gRPC 默认, 接近最优, 低开销

═══ 重试与超时 ═══

  超时设计:
    → 连接超时: 500ms (发现对端不可达)
    → 读超时: 5s (等待响应)
    → 级联超时: 每层递减!
      API Gateway: 10s
      Service A: 5s
      Service B: 2s

  重试策略:
    → 指数退避: 1s, 2s, 4s, 8s (带抖动)
    → 最大重试次数: 3
    → 幂等检查: 只重试幂等操作!
    → 重试风暴: N 个客户端同时重试 → 雪崩
      → 解决: 退避 + 抖动 + 限流`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>👁️ 可观测性 (Observability)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> observability.txt</div>
                <pre className="fs-code">{`═══ 可观测性三支柱 ═══

  1. 日志 (Logging):
     → 离散事件记录
     → 结构化日志 (JSON) > 文本日志
     → ELK Stack: Elasticsearch + Logstash + Kibana
     → Loki (Grafana): 轻量级日志聚合

  2. 指标 (Metrics):
     → 时序数值数据 (聚合)
     → RED 方法:
       Rate (请求速率), Error (错误率), Duration (延迟)
     → USE 方法:
       Utilization (利用率), Saturation (饱和度), Errors
     → Prometheus + Grafana

  3. 链路追踪 (Tracing):
     → 跟踪请求在多个服务间的完整路径
     → TraceID → 贯穿所有服务
     → SpanID → 每个服务内的操作
     → 父子关系: Span A → Span B → Span C
     → Jaeger, Zipkin, Tempo

═══ OpenTelemetry ═══

  统一的可观测性标准:
    → 合并 OpenTracing + OpenCensus
    → API + SDK + Collector
    → 支持: Traces, Metrics, Logs
    → 语言: Go, Java, Python, JS, Rust, ...

  架构:
    应用 (SDK) → OTel Collector → Backend
                                  → Jaeger (Traces)
                                  → Prometheus (Metrics)
                                  → Loki (Logs)

  自动插桩 (Auto-instrumentation):
    → Java Agent: 无需改代码!
    → Go: 需要少量代码修改
    → 自动采集: HTTP, gRPC, DB, Redis

═══ SLO / SLI / SLA ═══

  SLI (Service Level Indicator):
    → 可度量的指标
    → 例: 99% 请求延迟 < 200ms

  SLO (Service Level Objective):
    → 内部目标
    → 例: 99.9% 可用性/月 (≈ 43 分钟下线)

  SLA (Service Level Agreement):
    → 与客户的合同
    → 例: 99.95% 可用性, 违反赔偿 10%

  Error Budget (错误预算):
    → SLO = 99.9% → 可以有 0.1% 的不可用
    → 每月 43 分钟的 "预算"
    → 预算用完 → 冻结新功能, 修 bug
    → Google SRE 核心理念

═══ 告警策略 ═══

  分级:
    P0/Critical: 服务不可用, 立即响应
    P1/High:     核心功能降级, 15 分钟内
    P2/Medium:   非核心功能异常, 工作时间
    P3/Low:      信息/优化, 下个迭代

  告警疲劳 (Alert Fatigue):
    → 太多告警 → 运维忽略 → 真正的故障被淹没
    → 解决: 基于 SLO 告警 (不是基于指标阈值)
    → 多窗口 / 多燃烧率 (fast burn + slow burn)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🕸️ Service Mesh</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> service_mesh.txt</div>
                <pre className="fs-code">{`═══ 为什么需要 Service Mesh? ═══

  微服务的横切关注点:
    → 服务发现
    → 负载均衡
    → 熔断/重试/超时
    → mTLS (双向 TLS)
    → 可观测性 (指标/追踪)
    → 流量管理 (灰度/金丝雀)
  
  传统: 每个服务用 SDK 实现 (如 Spring Cloud)
    → 语言绑定! (Java SDK ≠ Go SDK)
    → 升级困难 (每个服务都要改)
    → 代码侵入
  
  Service Mesh: 将这些功能下沉到 Sidecar 代理
    → 对应用透明 (无需改代码!)
    → 语言无关
    → 统一管理

═══ Istio 架构 ═══

  数据面 (Data Plane): Envoy Sidecar
    → 每个 Pod 注入一个 Envoy 代理
    → 拦截所有入口/出口流量
    → 执行: 路由/重试/熔断/mTLS/采集指标

  控制面 (Control Plane): istiod
    → Pilot: 服务发现 + 流量规则 → 下发给 Envoy
    → Citadel: 证书管理 (mTLS)
    → Galley: 配置验证

  流量管理示例:

  # 金丝雀发布: 90% v1, 10% v2
  apiVersion: networking.istio.io/v1
  kind: VirtualService
  spec:
    http:
    - route:
      - destination:
          host: my-service
          subset: v1
        weight: 90
      - destination:
          host: my-service
          subset: v2
        weight: 10

  # 故障注入: 10% 请求注入 500 错误
  apiVersion: networking.istio.io/v1
  kind: VirtualService
  spec:
    http:
    - fault:
        abort:
          percentage:
            value: 10
          httpStatus: 500
      route: ...

═══ Service Mesh 的挑战 ═══

  1. 性能开销:
     → 每次调用多 2 跳 (Sidecar → Sidecar)
     → 延迟增加: 0.5-2ms / hop
     → 内存: 每个 Sidecar ~50-100MB RAM

  2. 复杂性:
     → Istio 学习曲线陡
     → 调试困难 (请求经过 Sidecar 代理)
     → 配置错误 → 流量黑洞

  3. 资源消耗:
     → 1000 个 Pod → 1000 个 Sidecar
     → 额外 50-100GB RAM

═══ 无 Sidecar 趋势 ═══

  Cilium (eBPF):
    → 在内核层面拦截网络流量
    → 无需 Sidecar (性能更好!)
    → L4 + 部分 L7 功能
    → K8s CNI + Service Mesh

  Istio Ambient Mesh:
    → 节点级代理 (而非 Pod 级 Sidecar)
    → ztunnel (零信任隧道): L4
    → waypoint proxy: L7 (按需)
    → 资源开销大幅减少

  gRPC xDS:
    → gRPC 原生支持 xDS 协议
    → 不需要 Sidecar, SDK 直接与控制面通信
    → "Proxyless Service Mesh"
    → Google Traffic Director`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
