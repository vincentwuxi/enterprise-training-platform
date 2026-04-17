import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['日志智能分析', '故障自愈', 'AI CI/CD', 'ChatOps'];

export default function LessonAIDevOps() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_07 — AI DevOps</div>
      <div className="fs-hero">
        <h1>AI DevOps：日志智能分析 / 故障自愈 / AI 驱动 CI/CD</h1>
        <p>
          传统 DevOps 依赖人工编写告警规则、手动排查根因、逐个修复配置。
          <strong>AI DevOps</strong> 将 LLM 注入运维全链路：日志语义分析（替代正则匹配）、
          异常根因自动推理、故障自愈（AI 生成修复方案并执行）、
          智能 CI/CD（AI 优化构建流水线 / 智能回滚 / 灰度策略）。
          让运维从"救火队"升级为"自动驾驶"。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ AI DevOps</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 AI 日志智能分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ai_log_analysis.py</div>
                <pre className="fs-code">{`# —— AI 日志分析: 从正则到语义理解 ——

class AILogAnalyzer:
    """LLM 驱动的日志分析系统"""
    
    def __init__(self):
        self.llm = Claude(model="claude-haiku-4")  # 快速+便宜
        self.embedding = EmbeddingModel("text-embedding-3-small")
    
    async def analyze_incident(self, logs: list[str], timeframe: str):
        """分析一次故障的日志"""
        
        # 1. 日志聚类 (减少噪声)
        # 10万条日志 → 50个聚类 → 送入 LLM
        clusters = self.cluster_logs(logs)
        
        # 2. AI 语义分析
        analysis = await self.llm.analyze(f"""
分析以下生产环境日志 (时间范围: {timeframe}):

{self.format_clusters(clusters)}

请完成:
1. 根因分析 (Root Cause Analysis)
   - 最可能的故障原因
   - 因果链: A → B → C → 故障
   
2. 影响范围
   - 受影响的服务/API
   - 受影响的用户数估算
   
3. 时间线
   - 故障开始时间
   - 关键事件序列
   
4. 修复建议
   - 立即止血方案
   - 根本修复方案
   
5. 预防措施
   - 监控增强建议
   - 架构改进建议
""")
        return analysis

    def cluster_logs(self, logs):
        """日志语义聚类"""
        # 传统: 正则模板匹配 → 遗漏新模式
        # AI: Embedding 向量聚类 → 自动发现模式
        
        embeddings = self.embedding.encode(logs)
        clusters = HDBSCAN().fit(embeddings)
        
        # 每个聚类取代表性日志
        representatives = []
        for cluster_id in set(clusters.labels_):
            members = [l for l, c in zip(logs, clusters.labels_) if c == cluster_id]
            representatives.append({
                "count": len(members),
                "sample": members[0],
                "severity": self.detect_severity(members),
            })
        
        return sorted(representatives, key=lambda x: x["severity"], reverse=True)

# 传统 vs AI 日志分析:
# ┌──────────────┬──────────┬──────────────┐
# │ 维度          │ 传统      │ AI           │
# ├──────────────┼──────────┼──────────────┤
# │ 模式发现      │ 正则规则 │ 语义聚类      │
# │ 根因分析      │ 人工拼图 │ 自动推理      │
# │ 新模式覆盖    │ 需写新规则│ 自动适应     │
# │ 跨服务关联    │ 手动      │ 自动关联      │
# │ 响应时间      │ 30-60分钟│ 2-5分钟       │
# │ 误报率        │ 15-30%   │ 5-10%        │
# │ 成本 (月)     │ $5K      │ $500 (API费) │
# └──────────────┴──────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔧 AI 故障自愈系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> auto_healing.py</div>
                <pre className="fs-code">{`# AI 自动故障修复

class AIAutoHealer:
    """AI 驱动的故障自愈"""
    
    # 自愈能力矩阵:
    # ┌──────────────┬────────┬────────┐
    # │ 故障类型      │自动修复 │ 置信度 │
    # ├──────────────┼────────┼────────┤
    # │ OOM (内存溢出)│ 自动扩容│ 95%   │
    # │ 磁盘满        │ 清理+扩│ 90%   │
    # │ 证书过期      │ 自动续期│ 95%   │
    # │ Pod 崩溃      │ 重启+扩│ 92%   │
    # │ 连接池耗尽    │ 回收+调节│ 85%  │
    # │ 依赖服务超时  │ 熔断+降级│ 80%  │
    # │ 配置错误      │ 回滚配置│ 75%   │
    # │ 数据库锁      │ Kill+优化│ 70%  │
    # │ 安全攻击      │ 封禁+通知│ 85%  │
    # │ 未知异常      │ 人工介入│ -     │
    # └──────────────┴────────┴────────┘
    
    async def handle_alert(self, alert):
        """处理一个告警"""
        
        # 1. AI 诊断
        diagnosis = await self.diagnose(alert)
        
        # 2. 查找修复方案
        fix = self.find_fix(diagnosis)
        
        # 3. 风险评估
        risk = self.assess_risk(fix)
        
        if risk.level == "LOW":
            # 低风险: 自动执行
            result = await self.execute(fix)
            self.notify("自动修复成功", result)
            
        elif risk.level == "MEDIUM":
            # 中风险: 执行但通知
            result = await self.execute(fix)
            self.notify("已自动修复, 请确认", result)
            
        else:
            # 高风险: 人工确认
            self.notify("需要人工确认", fix)
            await self.wait_for_approval()

# 自愈闭环:
# 检测 → 诊断 → 修复 → 验证 → 学习
#  │                              │
#  └──── 知识库更新 ←──────────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🎯 AIOps 实战工具链</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> aiops_tools</div>
                <pre className="fs-code">{`# AIOps 工具链 (2025)

# 可观测性 + AI:
┌────────────────────────────────┐
│        Metrics (指标)           │
│  Prometheus + Grafana          │
│  AI: 异常检测 + 预测           │
├────────────────────────────────┤
│        Logs (日志)              │
│  ELK / Loki + Grafana          │
│  AI: 语义分析 + 根因推理        │
├────────────────────────────────┤
│        Traces (链路)            │
│  Jaeger / Tempo                │
│  AI: 慢请求分析 + 瓶颈定位     │
├────────────────────────────────┤
│        AI 层                    │
│  LLM 统一分析三大信号          │
│  跨层关联 → 根因 → 自愈         │
└────────────────────────────────┘

# 商业 AIOps 平台:
├── Dynatrace Davis AI
│   (业界最成熟的 AI 运维)
├── Datadog AI
│   (Watchdog 异常检测)
├── New Relic AI
│   (NRAI 助手)
├── PagerDuty AIOps
│   (智能分诊 + 路由)
└── Elastic AI Assistant
    (Elasticsearch + LLM)

# 开源方案:
├── LiteLLM + 自建 Agent
├── LangGraph + 运维 RAG
├── k8sgpt (K8s 专用 AI 诊断)
└── Holmes (开源 AIOps 框架)

# k8sgpt 示例:
$ k8sgpt analyze --explain
# > Pod nginx-xxx CrashLoopBackOff
# > 原因: 镜像 nginx:latst 拼写错误
# > 修复: 更正为 nginx:latest
$ k8sgpt analyze --fix  # AI 自动修复`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 AI 驱动 CI/CD</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ai_cicd.yml</div>
                <pre className="fs-code">{`# —— AI 增强 CI/CD 流水线 ——

# 1. 智能测试选择 (Test Selection)
# 问题: 全量测试 30 分钟 → 太慢
# AI 方案: 根据代码变更只跑相关测试

name: AI-Optimized CI
on: [push]

jobs:
  smart-test:
    steps:
      - name: AI Test Selection
        run: |
          # AI 分析变更, 选择相关测试
          CHANGED=$(git diff --name-only HEAD~1)
          python ai_test_selector.py \\
            --changed-files "$CHANGED" \\
            --output selected_tests.txt
          
          # 只运行选中的测试
          npx vitest run $(cat selected_tests.txt)
        
        # 效果: 30 分钟 → 5 分钟 (83% 加速)
        # 准确率: 98% (偶尔遗漏间接依赖)

# 2. 智能回滚决策
  deploy:
    steps:
      - name: Canary Deploy (10%)
        run: kubectl set image ... --canary 10%
      
      - name: AI Monitor (5 minutes)
        run: |
          python ai_canary_monitor.py \\
            --duration 300 \\
            --metrics "error_rate,latency_p99,cpu" \\
            --baseline "last_7_days"
          
          # AI 判断:
          # ✅ 正常 → 继续 rollout
          # ⚠️ 异常 → 暂停 + 通知
          # 🔴 严重 → 自动回滚

# 3. AI 构建优化
  build:
    steps:
      - name: AI Cache Strategy
        run: |
          # AI 分析构建历史, 优化缓存策略
          # 预测哪些依赖不会变 → 激进缓存
          # 检测哪些步骤可并行 → 并行执行
          python ai_build_optimizer.py
          
          # 效果:
          # 构建时间: 8min → 3min
          # 缓存命中: 60% → 92%

# 4. AI PR 自动合并策略
# ┌──────────────────────────────────┐
# │ 条件                │ 操作       │
# ├──────────────────────────────────┤
# │ AI Review ✅ + 测试通过│ 自动合并 │
# │ AI Review ⚠️ 建议    │ 等人工审查│
# │ AI Review 🔴 问题    │ 阻止合并 │
# │ 安全扫描发现漏洞      │ 阻止合并 │
# │ 覆盖率降低 >2%       │ 阻止合并 │
# └──────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💬 ChatOps: AI 运维助手</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> chatops</div>
                <pre className="fs-code">{`# ChatOps + AI: 在 Slack/Teams 中运维

# 传统 ChatOps: 预定义命令
# /deploy production v2.3.1
# /rollback production
# /status api-service

# AI ChatOps: 自然语言运维
┌─────────────────────────────────────┐
│ 👤 SRE: "昨晚3点的502错误是什么原因?" │
│                                     │
│ 🤖 AI: 分析结果:                     │
│  时间: 03:12-03:47 (35分钟)          │
│  影响: API 服务, 约 2300 次请求失败   │
│  根因: Redis 连接池耗尽               │
│  原因: 定时任务在03:00并发写入导致     │
│  修复: 已自动扩容连接池 50→200        │
│  建议: 将定时任务改为分批执行          │
│                                     │
│ 👤 SRE: "帮我实施分批执行的修改"       │
│                                     │
│ 🤖 AI: 已创建 PR #1234:              │
│  - 将 bulk_write 改为 batch_write    │
│  - 每批 100 条, 间隔 1s              │
│  - 添加了并发控制锁                  │
│  请审查后合并。                      │
└─────────────────────────────────────┘

# AI ChatOps 架构:
# Slack Bot
#    │
#    ├── 意图识别 (LLM)
#    │   ├── "查看状态"  → 查询 Prometheus
#    │   ├── "部署版本"  → 触发 CI/CD
#    │   ├── "分析故障"  → 查询日志+链路
#    │   ├── "生成报告"  → 汇总+可视化
#    │   └── "修复问题"  → 创建PR/执行命令
#    │
#    ├── 工具调用 (Function Calling)
#    │   ├── kubectl / helm
#    │   ├── GitHub API
#    │   ├── Prometheus API
#    │   ├── PagerDuty API
#    │   └── Slack API
#    │
#    └── 权限控制
#        ├── 🟢 只读操作: 自动执行
#        ├── 🟡 低风险写: SRE确认后执行
#        └── 🔴 高风险: 需 2 人审批

# 工具推荐:
# ├── Kubiya: AI DevOps 平台
# ├── env0 + AI: IaC 管理
# ├── 自建: LangGraph + Slack Bot
# └── Copilot for CLI: 终端 AI 助手`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
