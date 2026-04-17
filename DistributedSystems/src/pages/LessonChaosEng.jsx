import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['混沌工程原理', '故障注入', '韧性模式', '生产演练'];

export default function LessonChaosEng() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_08 — 混沌工程</div>
      <div className="fs-hero">
        <h1>混沌工程与实战：故障注入 / 韧性测试 / 生产演练</h1>
        <p>
          混沌工程 (Chaos Engineering) 通过在<strong>受控条件下主动注入故障</strong>来发现系统弱点——
          在故障找到你之前，先找到故障。Netflix、Google、Amazon 等公司
          在生产环境中持续进行混沌实验，推动系统韧性从被动修复走向主动演进。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 混沌工程深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 混沌工程原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> principles.txt</div>
                <pre className="fs-code">{`═══ 混沌工程的定义 ═══

  "Chaos Engineering is the discipline of experimenting
   on a distributed system in order to build confidence
   in the system's capability to withstand turbulent
   conditions in production."
   — principlesofchaos.org

  核心: 不是制造混乱, 而是通过科学实验发现系统弱点

═══ 混沌工程五原则 ═══

  1. 建立稳态假设 (Build Hypotheses around Steady State):
     → 定义 "正常" 是什么
     → 指标: 请求成功率 > 99.9%, P99 延迟 < 200ms
     → 假设: "即使杀掉一个节点, 这些指标不会显著恶化"

  2. 多样化真实世界事件 (Vary Real-World Events):
     → 模拟真实故障:
       节点崩溃、网络延迟、磁盘满、CPU 飙高、
       DNS 故障、证书过期、时钟偏移、依赖超时
     → 不要只测 "节点挂了": 现实中更常见的是慢节点!

  3. 在生产环境实验 (Run Experiments in Production):
     → 测试环境 ≠ 生产环境!
       不同的流量模式、不同的数据量、不同的配置
     → 在生产环境验证才是真正的信心
     → 前提: 有完善的安全措施!

  4. 自动化持续运行 (Automate Experiments):
     → 不是一次性的, 而是 CI/CD 的一部分
     → 每次部署后自动运行混沌测试
     → 系统演进 → 混沌实验也要演进

  5. 最小化爆炸半径 (Minimize Blast Radius):
     → 从小范围开始 (一个 Pod, 一个节点)
     → 逐步扩大 (一个 AZ, 一个 Region)
     → 随时准备回滚!
     → 有明确的停止条件

═══ 混沌成熟度模型 ═══

  Level 0: 无混沌实践
    → 出了问题手动排查

  Level 1: 临时手动测试
    → 偶尔手动杀进程测试
    → 无系统化方法

  Level 2: 自动化混沌实验
    → GameDay 演练
    → 使用混沌工具 (Chaos Monkey 等)
    → 在预发布环境

  Level 3: 持续混沌
    → CI/CD 集成
    → 生产环境混沌实验
    → 自动化回滚

  Level 4: 自适应混沌
    → AI 驱动: 自动发现新的实验场景
    → 基于系统变更自动调整实验
    → 混沌即代码 (Chaos as Code)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💉 故障注入</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> injection.txt</div>
                <pre className="fs-code">{`═══ 故障注入类型 ═══

  基础设施层:
    → 杀 Pod/容器/VM
    → CPU 压力 (stress-ng --cpu 4)
    → 内存压力 (stress-ng --vm 2 --vm-bytes 80%)
    → 磁盘 I/O 压力 / 磁盘填满
    → 时钟偏移 (timedatectl set-ntp false)

  网络层:
    → 延迟注入 (tc qdisc add ... delay 100ms)
    → 丢包 (tc ... loss 10%)
    → 网络分区 (iptables -A INPUT -s target -j DROP)
    → DNS 故障
    → 带宽限制

  应用层:
    → HTTP 错误注入 (返回 500/503)
    → 响应延迟 (sleep 在处理链中)
    → 异常注入 (随机抛出异常)
    → 资源泄漏模拟

═══ 混沌工程工具 ═══

  Chaos Monkey (Netflix):
    → 随机杀 EC2 实例
    → 2011 年开源, 混沌工程的开端
    → Simian Army: Chaos Gorilla (杀 AZ),
      Latency Monkey (延迟), Conformity Monkey

  Litmus Chaos (CNCF):
    → K8s 原生混沌工程
    → ChaosEngine → ChaosExperiment → ChaosResult
    → 丰富的实验库 (100+ 预定义实验)
    → Litmus Portal: Web UI 管理

  Chaos Mesh (PingCAP, CNCF):
    → K8s 原生, 使用 CRD
    → 支持: Pod/Network/Stress/IO/Time/DNS 故障
    → Dashboard: 可视化实验编排
    → 强大的网络故障注入

  AWS Fault Injection Simulator (FIS):
    → AWS 原生混沌服务
    → 注入: EC2/ECS/RDS/网络 故障
    → 与 CloudWatch Alarm 集成 (自动停止)
    → 安全! (IAM 控制 + 停止条件)

═══ Chaos Mesh 实验示例 ═══

  # 杀 Pod 实验
  apiVersion: chaos-mesh.org/v1alpha1
  kind: PodChaos
  metadata:
    name: pod-kill-test
  spec:
    action: pod-kill
    mode: one                  # 随机杀一个
    selector:
      labelSelectors:
        app: my-service
    scheduler:
      cron: "@every 5m"        # 每 5 分钟杀一次

  # 网络延迟实验
  apiVersion: chaos-mesh.org/v1alpha1
  kind: NetworkChaos
  metadata:
    name: network-delay
  spec:
    action: delay
    mode: all
    selector:
      labelSelectors:
        app: payment-service
    delay:
      latency: "200ms"
      jitter: "50ms"
      correlation: "50"
    duration: "5m"

  # 时钟偏移实验
  apiVersion: chaos-mesh.org/v1alpha1
  kind: TimeChaos
  metadata:
    name: clock-skew
  spec:
    mode: one
    selector:
      labelSelectors:
        app: order-service
    timeOffset: "+5m"          # 时钟向前偏移 5 分钟
    duration: "10m"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 韧性模式 (Resilience Patterns)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> resilience.txt</div>
                <pre className="fs-code">{`═══ 优雅降级 (Graceful Degradation) ═══

  当系统部分故障时, 提供降级但可用的服务:

  推荐服务挂了:
    → 不显示个性化推荐 → 显示热门列表 (静态缓存)
  
  搜索服务延迟:
    → 不返回完整结果 → 返回缓存的近似结果
  
  支付服务不可用:
    → 不阻塞下单 → 延迟支付 (先创建待支付订单)

  设计:
    → 识别核心 vs 非核心功能
    → 核心功能: 必须可用 (下单/支付)
    → 非核心功能: 可降级 (推荐/评论/广告)

═══ 舱壁模式 (Bulkhead) ═══

  灵感: 船舱隔壁 — 一个舱进水不影响其他舱

  资源隔离:
    线程池隔离:
      → 调用 Service A: 10 个线程的池
      → 调用 Service B: 20 个线程的池
      → A 超时只耗尽 A 的 10 个线程, 不影响 B

    信号量隔离:
      → 并发数限制
      → 比线程池轻量, 但不能设超时

    独立部署:
      → 关键服务独立集群/Pod
      → 非关键服务共享集群
      → 故障隔离到集群级别

═══ 缓存策略 ═══

  Cache-Aside (旁路缓存):
    1. 读缓存 → Miss → 读 DB → 写缓存
    2. 写 DB → 删缓存 (不是更新!)
    → 为什么删而不是更新: 避免并发写导致不一致

  Read-Through / Write-Through:
    → 应用只和缓存交互
    → 缓存负责读写 DB
    → 更简单的应用代码

  缓存雪崩:
    → 大量缓存同时过期 → DB 被打爆
    → 解决: 过期时间加随机抖动

  缓存穿透:
    → 查询不存在的 key → 每次都打 DB
    → 解决: Bloom Filter / 缓存空值

  缓存击穿:
    → 热点 key 过期 → 大量并发请求打 DB
    → 解决: 互斥锁 (singleflight) / 永不过期

═══ 重试退避策略 ═══

  指数退避 + 抖动 (Exponential Backoff + Jitter):
    wait = min(cap, base * 2^attempt) + random(0, waitTime)
    
    attempt 1: ~1s + jitter
    attempt 2: ~2s + jitter
    attempt 3: ~4s + jitter
    cap: 30s

  为什么加抖动:
    → 10000 个客户端同时重试
    → 无抖动: 所有客户端在 1s, 2s, 4s 同时重试 → 雷击群效应
    → 有抖动: 请求分散, 避免同时到达

  AWS 推荐: Full Jitter
    wait = random(0, min(cap, base * 2^attempt))
    → 最大程度分散重试`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 生产演练 (GameDay)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> gameday.txt</div>
                <pre className="fs-code">{`═══ GameDay 演练流程 ═══

  Phase 1: 准备
    1. 选择演练场景:
       → "数据库主节点故障"
       → "支付网关 P99 延迟升至 5s"
       → "一个 AZ 完全不可用"
    
    2. 定义稳态指标:
       → 请求成功率 > 99.9%
       → P99 延迟 < 500ms
       → 错误报警 < 5 个/分钟
    
    3. 建立假设:
       → "主数据库故障后, 30 秒内自动 Failover,
          期间请求成功率 > 99%"
    
    4. 准备回滚方案:
       → 一键停止故障注入
       → 手动切换数据库
       → 预先通知相关团队

  Phase 2: 执行
    1. 通知所有相关方 (不是惊喜!)
    2. 开始监控 (Grafana 大屏)
    3. 注入故障
    4. 观察系统行为 (~15-30 分钟)
    5. 记录时间线和异常

  Phase 3: 分析
    1. 对比假设 vs 实际:
       假设: 30 秒 Failover
       实际: 2 分钟 → 差距! → Action Item
    
    2. 发现的问题:
       → Failover 超时配置过大
       → 连接池没有自动重连
       → 告警延迟 3 分钟 (应该 30 秒内)
    
    3. 生成改进 Action Items:
       → [P0] 调整 Failover 超时: 30s → 10s
       → [P1] 连接池增加自动重连机制
       → [P1] 优化告警规则, 减少检测时间

═══ Netflix 的混沌实践 ═══

  Chaos Monkey: 随机杀 EC2 实例
    → 工作日 9am-3pm 自动运行
    → 所有服务都必须能容忍! (opt-out 需审批)

  Chaos Kong: 模拟整个 AWS Region 故障
    → 定期将流量从一个 Region 切走
    → 验证跨 Region 容灾

  FIT (Failure Injection Testing):
    → 在微服务调用中注入故障
    → 服务 A 调用服务 B: 注入超时/错误
    → 验证服务 A 的降级逻辑

═══ 真实事故案例 (从中学习) ═══

  GitHub 2018 — 43 秒的网络分区:
    → US East 和 US West 集群网络中断 43 秒
    → MySQL 集群选主混乱
    → 数据不一致 → 手动修复 24 小时
    → 根因: 网络设备维护

  AWS 2020 — Kinesis 故障:
    → 前端服务器数量超过 OS 线程限制
    → 级联失败: CloudWatch, Lambda, Cognito
    → 根因: 容量规划不足 + 缺少隔离

  Cloudflare 2020 — 全球宕机 27 分钟:
    → BGP 路由泄漏到核心网络
    → Backbone 路由器内存耗尽
    → 根因: 路由策略配置错误

  从这些事故学到什么:
    1. 网络分区比想象中更常见
    2. 级联故障是最危险的
    3. 容量规划 + 舱壁隔离是必须的
    4. 混沌工程能提前发现这些问题!

═══ 混沌工程实施清单 ═══

  □ 定义系统的稳态指标 (SLO)
  □ 部署混沌工具 (Chaos Mesh / Litmus)
  □ 从最小范围开始 (Dev → Staging → Prod)
  □ 先测最基本的: 杀一个 Pod, 加网络延迟
  □ 建立 GameDay 流程 (月度)
  □ 自动化混沌实验 (CI/CD 集成)
  □ 培养团队的混沌文化 (不追责!)
  □ 持续扩展实验范围`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
