import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['统一注册', '工具发现', '编排引擎', '运维监控'];

export default function LessonToolPlatform() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-container">
      <div className="lesson-badge">🔌 module_08 — 企业工具平台</div>
      <h1 className="lesson-title">企业工具平台：统一注册 / 发现 / 编排</h1>
      <p className="lesson-subtitle">
        当企业拥有几十上百个 AI 工具时，需要一个统一的<strong>工具平台</strong>来管理它们。
        本模块设计一个完整的企业级 AI 工具管理平台：工具注册中心 → 智能发现 → 
        编排引擎 → 版本管理 → 健康监控 → 成本优化。
      </p>

      <section className="lesson-section">
        <h2 className="section-title">🏢 企业工具平台架构</h2>
        <div className="lesson-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab-btn ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 工具注册中心</h3>
              <span className="card-badge">Registry</span>
              <div className="code-block">
                <div className="code-header">🐍 tool_registry.py</div>
                <pre>{`# —— 企业 AI 工具注册中心 ——
from pydantic import BaseModel
from enum import Enum

class ToolStatus(Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    BETA = "beta"
    MAINTENANCE = "maintenance"

class ToolMetadata(BaseModel):
    """工具注册元数据"""
    # 基本信息
    name: str
    version: str
    description: str
    category: str  # database / api / filesystem / compute
    
    # 连接信息
    transport: str  # stdio / http
    endpoint: str | None  # HTTP endpoint
    command: list[str] | None  # stdio command
    
    # 能力声明
    tools: list[dict]  # Tool Schema 列表
    resources: list[dict]  # Resource URI 模式
    
    # 运维信息
    owner_team: str
    status: ToolStatus
    health_check_url: str | None
    sla_latency_ms: int  # P99 延迟 SLA
    
    # 安全信息
    auth_type: str  # none / api_key / oauth
    required_roles: list[str]
    data_classification: str  # public / internal / confidential
    
    # 版本管理
    changelog: str
    deprecated_date: str | None
    migration_guide: str | None

class ToolRegistry:
    """工具注册中心"""
    
    def __init__(self, db):
        self.db = db
    
    async def register(self, metadata: ToolMetadata) -> str:
        """注册新工具"""
        # 1. Schema 验证
        self._validate_schema(metadata)
        
        # 2. 健康检查
        if metadata.health_check_url:
            healthy = await self._health_check(metadata.health_check_url)
            if not healthy:
                raise ValueError(f"工具 {metadata.name} 健康检查失败")
        
        # 3. 冲突检测
        existing = await self.db.find(name=metadata.name)
        if existing and existing.version == metadata.version:
            raise ValueError(f"版本 {metadata.version} 已存在")
        
        # 4. 注册
        tool_id = await self.db.insert(metadata.dict())
        
        # 5. 通知订阅者
        await self._notify_subscribers("tool_registered", metadata)
        
        return tool_id
    
    async def deprecate(self, name: str, migration_guide: str):
        """废弃工具（软删除，提供迁移指南）"""
        await self.db.update(
            name=name,
            status=ToolStatus.DEPRECATED,
            migration_guide=migration_guide,
            deprecated_date=datetime.utcnow().isoformat()
        )
        await self._notify_subscribers("tool_deprecated", {
            "name": name,
            "migration_guide": migration_guide
        })
    
    async def list_by_category(self, category: str) -> list[ToolMetadata]:
        """按类别列出工具"""
        return await self.db.find_many(
            category=category,
            status=ToolStatus.ACTIVE
        )`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 智能工具发现</h3>
              <span className="card-badge">Discovery</span>
              <div className="code-block">
                <div className="code-header">🐍 tool_discovery.py</div>
                <pre>{`# —— 智能工具发现: 根据任务自动选择最佳工具 ——
from openai import OpenAI

class SmartToolDiscovery:
    """基于语义匹配的工具发现引擎"""
    
    def __init__(self, registry: ToolRegistry, embedder):
        self.registry = registry
        self.embedder = embedder
        self.tool_index = None  # 向量索引
    
    async def build_index(self):
        """构建工具语义索引"""
        all_tools = await self.registry.list_all(status="active")
        
        descriptions = []
        for tool in all_tools:
            # 拼接工具的完整描述
            desc = f"{tool.name}: {tool.description}. "
            desc += f"能力: {', '.join(t['name'] for t in tool.tools)}. "
            desc += f"类别: {tool.category}"
            descriptions.append(desc)
        
        # 生成嵌入向量
        embeddings = await self.embedder.encode(descriptions)
        self.tool_index = VectorIndex(embeddings, all_tools)
    
    async def discover(
        self,
        task_description: str,
        user_role: str,
        top_k: int = 5
    ) -> list[ToolMetadata]:
        """根据任务描述发现最匹配的工具"""
        
        # 1. 语义搜索
        query_embedding = await self.embedder.encode([task_description])
        candidates = self.tool_index.search(query_embedding, top_k=top_k*2)
        
        # 2. 权限过滤
        permitted = [t for t in candidates
                     if user_role in t.required_roles or "*" in t.required_roles]
        
        # 3. 健康状态过滤
        healthy = [t for t in permitted
                   if t.status == ToolStatus.ACTIVE]
        
        # 4. LLM 精排
        reranked = await self._llm_rerank(task_description, healthy[:top_k])
        
        return reranked
    
    async def _llm_rerank(self, task: str, tools: list) -> list:
        """用 LLM 对工具进行精排"""
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"""任务: {task}

可用工具:
{json.dumps([{"name": t.name, "description": t.description} for t in tools])}

按相关性排序这些工具，返回排序后的工具名列表(JSON)。"""
            }],
            response_format={"type": "json_object"}
        )
        order = json.loads(response.choices[0].message.content)["tools"]
        tool_map = {t.name: t for t in tools}
        return [tool_map[name] for name in order if name in tool_map]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 工具编排引擎</h3>
              <span className="card-badge">Orchestration</span>
              <div className="code-block">
                <div className="code-header">🐍 tool_orchestrator.py</div>
                <pre>{`# —— 工具编排引擎: 自动组合多工具完成复杂任务 ——

class ToolOrchestrator:
    """多工具编排执行引擎"""
    
    def __init__(self, registry, discovery, gatekeeper, audit):
        self.registry = registry
        self.discovery = discovery
        self.gatekeeper = gatekeeper
        self.audit = audit
    
    async def execute_task(self, task: str, user, max_steps=15):
        """端到端执行用户任务"""
        
        # 1. 发现相关工具
        tools = await self.discovery.discover(
            task, user.role, top_k=10
        )
        
        # 2. 转换为 LLM 工具格式
        llm_tools = self._to_openai_format(tools)
        
        # 3. Agent 循环
        messages = [{"role": "user", "content": task}]
        results = []
        
        for step in range(max_steps):
            response = await self.llm.chat(
                messages=messages,
                tools=llm_tools
            )
            
            if not response.tool_calls:
                # 任务完成
                results.append({
                    "step": step + 1,
                    "type": "final_answer",
                    "content": response.content
                })
                break
            
            for call in response.tool_calls:
                # 4. 权限检查
                allowed, msg = await self.gatekeeper.check(
                    call.function.name, user
                )
                
                if not allowed:
                    messages.append(self._tool_error(call.id, msg))
                    continue
                
                # 5. 路由到正确的 MCP Server 执行
                server = self._resolve_server(call.function.name)
                result = await server.call_tool(
                    call.function.name,
                    json.loads(call.function.arguments)
                )
                
                # 6. 审计记录
                await self.audit.log({
                    "user_id": user.id,
                    "tool_name": call.function.name,
                    "args": json.loads(call.function.arguments),
                    "result_summary": str(result)[:500],
                    "step": step + 1
                })
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": call.id,
                    "content": str(result)
                })
                
                results.append({
                    "step": step + 1,
                    "tool": call.function.name,
                    "result": str(result)[:200]
                })
        
        return {
            "task": task,
            "steps": results,
            "total_tool_calls": len([r for r in results if "tool" in r])
        }`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🔀 编排模式</h3>
              <span className="card-badge">Patterns</span>
              <div className="code-block">
                <div className="code-header">📋 编排模式</div>
                <pre>{`工具编排模式：

1️⃣ 顺序编排
   Tool A → Tool B → Tool C
   适合: 数据管道

2️⃣ 并行编排
   Tool A ─┐
   Tool B ─┼→ 合并结果
   Tool C ─┘
   适合: 独立查询聚合

3️⃣ 条件编排
   Tool A → if成功 → Tool B
             else → Tool C
   适合: 降级策略

4️⃣ 循环编排
   Tool A → 检查 → 不满足 → Tool A
                  → 满足 → 结束
   适合: 迭代优化

5️⃣ Agent 自主编排
   LLM 自主决定调用顺序
   适合: 开放式任务`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🔄 版本管理</h3>
              <span className="card-badge">Versioning</span>
              <div className="code-block">
                <div className="code-header">📋 版本策略</div>
                <pre>{`工具版本管理策略：

语义版本 (SemVer):
├── Major: 破坏性变更
│   └── 删参数/改行为 → v2.0.0
├── Minor: 新功能添加
│   └── 新参数/新工具 → v1.1.0
└── Patch: Bug 修复
    └── 修复/优化 → v1.0.1

灰度发布:
├── v1 (stable): 90% 流量
├── v2 (canary): 10% 流量
└── 自动回滚: 错误率 > 5%

废弃流程:
├── 标记 deprecated
├── 发送迁移通知
├── 并行运行 30 天
├── 降低流量至 0
└── 下线`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="card-grid">
            <div className="info-card">
              <h3>📊 监控仪表板</h3>
              <span className="card-badge">Monitoring</span>
              <div className="code-block">
                <div className="code-header">📋 核心指标</div>
                <pre>{`工具平台监控 Dashboard：

🟢 可用性
├── 各 Server 存活状态
├── P99 延迟分布
├── 错误率趋势
└── SLA 达标率

📊 使用量
├── 工具调用 QPS
├── 按团队/用户维度
├── 热门工具 Top 10
└── 调用链路分析

💰 成本
├── API 调用费用
├── 计算资源消耗
├── Token 消耗归因
└── 成本/效益比

⚠️ 告警规则
├── 错误率 > 5% → P1
├── 延迟 > SLA → P2
├── 异常调用模式 → P1
└── 工具下线 → P2`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>💰 成本优化</h3>
              <span className="card-badge">Cost</span>
              <div className="code-block">
                <div className="code-header">📋 优化策略</div>
                <pre>{`工具平台成本优化：

1. 缓存层
   ├── 幂等工具结果缓存
   ├── LRU + TTL 策略
   └── 缓存命中率 > 30%

2. 工具选择优化
   ├── 优先使用低成本工具
   ├── 本地优先于远程
   └── 批量合并调用

3. LLM 成本
   ├── 工具发现用小模型
   ├── 执行决策用大模型
   └── 减少不必要的工具数

4. 资源弹性
   ├── 按需伸缩 Server
   ├── 冷门工具关闭
   └── 热门工具多实例

5. 计费归因
   ├── 按部门/项目归因
   ├── 设置预算上限
   └── 超额自动降级`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
