import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 07 — AI SaaS 平台
   多租户 / 计费系统 / 限流 / 鉴权
   ───────────────────────────────────────────── */

const LAYERS = [
  { name: '多租户架构', icon: '🏢', tag: 'Multi-Tenant',
    code: `# ─── 多租户隔离: 数据库级 Row-Level Security ───
# PostgreSQL RLS (Row-Level Security)

-- 启用 RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 租户隔离策略
CREATE POLICY tenant_isolation ON conversations
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- FastAPI 中间件自动设置租户
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

class TenantMiddleware:
    async def __call__(self, request: Request, call_next):
        # 从 JWT / API Key 提取 tenant_id
        tenant_id = extract_tenant(request)
        
        # 注入到数据库会话
        request.state.tenant_id = tenant_id
        response = await call_next(request)
        return response

async def get_db(request: Request) -> AsyncSession:
    session = async_session()
    # 设置当前租户 → PostgreSQL RLS 自动过滤
    await session.execute(
        text(f"SET app.current_tenant = '{request.state.tenant_id}'")
    )
    yield session
    await session.close()

# 数据模型
class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    plan = Column(String, default="free")  # free | pro | enterprise
    settings = Column(JSONB, default={
        "max_conversations": 100,
        "max_documents": 50,
        "allowed_models": ["gpt-4o-mini"],
        "max_tokens_per_day": 100000,
    })
    created_at = Column(DateTime, default=func.now())` },
  { name: 'API Key + 鉴权', icon: '🔑', tag: 'Authentication',
    code: `# ─── 双层鉴权: API Key + JWT ───
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, APIKeyHeader
import hashlib, secrets, jwt
from datetime import datetime, timedelta

# ─── API Key 管理 ───
api_key_header = APIKeyHeader(name="X-API-Key")

def generate_api_key() -> tuple[str, str]:
    """生成 API Key (返回 key + hash)"""
    raw_key = f"sk-{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, key_hash  # 只存 hash!

async def verify_api_key(
    api_key: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db),
):
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    result = await db.execute(
        select(APIKey).where(
            APIKey.key_hash == key_hash,
            APIKey.is_active == True,
            APIKey.expires_at > datetime.utcnow(),
        )
    )
    key_record = result.scalar_one_or_none()
    if not key_record:
        raise HTTPException(401, "Invalid API key")
    
    # 更新使用统计
    key_record.last_used_at = datetime.utcnow()
    key_record.usage_count += 1
    await db.commit()
    
    return key_record

# ─── JWT (前端用户会话) ───
def create_jwt(user_id: str, tenant_id: str) -> str:
    payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# ─── 权限装饰器 ───
from functools import wraps

def require_plan(min_plan: str):
    """检查租户是否有足够的套餐权限"""
    plan_levels = {"free": 0, "pro": 1, "enterprise": 2}
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, tenant=Depends(get_tenant), **kwargs):
            if plan_levels[tenant.plan] < plan_levels[min_plan]:
                raise HTTPException(
                    403, f"需要 {min_plan} 套餐. 当前: {tenant.plan}"
                )
            return await func(*args, tenant=tenant, **kwargs)
        return wrapper
    return decorator

@app.post("/api/v1/chat")
@require_plan("pro")  # 仅 Pro 用户可用
async def chat_endpoint(...):
    ...` },
  { name: '用量计费', icon: '💰', tag: 'Billing',
    code: `# ─── Token 用量追踪 + 计费 ───
from dataclasses import dataclass
from decimal import Decimal
import asyncio

# 价格表 (每百万 Token)
PRICING = {
    "gpt-4o":       {"input": Decimal("2.50"), "output": Decimal("10.00")},
    "gpt-4o-mini":  {"input": Decimal("0.15"), "output": Decimal("0.60")},
    "claude-3.5":   {"input": Decimal("3.00"), "output": Decimal("15.00")},
    "embedding":    {"input": Decimal("0.02"), "output": Decimal("0")},
}

# 套餐限额
PLAN_LIMITS = {
    "free":       {"monthly_tokens": 100_000,     "monthly_cost": Decimal("0")},
    "pro":        {"monthly_tokens": 5_000_000,   "monthly_cost": Decimal("29.00")},
    "enterprise": {"monthly_tokens": 100_000_000, "monthly_cost": Decimal("299.00")},
}

@dataclass
class UsageRecord:
    tenant_id: str
    model: str
    input_tokens: int
    output_tokens: int
    cost: Decimal
    endpoint: str
    timestamp: datetime

class UsageTracker:
    def __init__(self, db):
        self.db = db
        self._buffer = []  # 批量写入缓冲
    
    async def track(self, tenant_id, model, input_tokens, output_tokens, endpoint):
        """记录用量"""
        pricing = PRICING.get(model, PRICING["gpt-4o-mini"])
        cost = (
            pricing["input"] * Decimal(input_tokens) / 1_000_000
            + pricing["output"] * Decimal(output_tokens) / 1_000_000
        )
        
        record = UsageRecord(
            tenant_id=tenant_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            endpoint=endpoint,
            timestamp=datetime.utcnow(),
        )
        
        self._buffer.append(record)
        if len(self._buffer) >= 100:
            await self._flush()
        
        return cost
    
    async def check_limit(self, tenant_id: str) -> bool:
        """检查是否超出套餐限额"""
        tenant = await self.get_tenant(tenant_id)
        limits = PLAN_LIMITS[tenant.plan]
        
        usage = await self.get_monthly_usage(tenant_id)
        return usage.total_tokens < limits["monthly_tokens"]
    
    async def get_monthly_usage(self, tenant_id):
        """获取月度用量统计"""
        return await self.db.execute(text("""
            SELECT 
                SUM(input_tokens + output_tokens) as total_tokens,
                SUM(cost) as total_cost,
                COUNT(*) as request_count
            FROM usage_records
            WHERE tenant_id = :tid
            AND timestamp >= date_trunc('month', now())
        """), {"tid": tenant_id})` },
  { name: '限流保护', icon: '🚦', tag: 'Rate Limiting',
    code: `# ─── 三层限流: 全局 + 租户 + 用户 ───
import redis.asyncio as redis
from fastapi import Request, HTTPException
import time

class RateLimiter:
    """滑动窗口限流器"""
    
    def __init__(self):
        self.redis = redis.Redis()
    
    # ─── 滑动窗口算法 ───
    async def check(self, key: str, limit: int, window: int) -> bool:
        pipe = self.redis.pipeline()
        now = time.time()
        window_start = now - window
        
        # 移除过期记录
        pipe.zremrangebyscore(key, 0, window_start)
        # 添加当前请求
        pipe.zadd(key, {str(now): now})
        # 计数
        pipe.zcard(key)
        # 设置过期
        pipe.expire(key, window)
        
        results = await pipe.execute()
        count = results[2]
        return count <= limit

    async def rate_limit_middleware(self, request: Request):
        tenant_id = request.state.tenant_id
        user_id = request.state.user_id
        
        # 层级1: 全局 (所有用户)
        if not await self.check("ratelimit:global", 10000, 60):
            raise HTTPException(429, "系统繁忙，请稍后重试")
        
        # 层级2: 租户级
        tenant_limits = {
            "free": 10,        # 10 req/min
            "pro": 100,        # 100 req/min
            "enterprise": 1000, # 1000 req/min
        }
        plan = await get_tenant_plan(tenant_id)
        limit = tenant_limits.get(plan, 10)
        
        if not await self.check(f"ratelimit:tenant:{tenant_id}", limit, 60):
            raise HTTPException(429, {
                "error": "租户配额已用完",
                "limit": limit,
                "reset": 60,
                "upgrade_url": "/billing/upgrade",
            })
        
        # 层级3: 用户级 (防滥用)
        if not await self.check(f"ratelimit:user:{user_id}", 20, 60):
            raise HTTPException(429, "请求过于频繁")

# ─── FastAPI 集成 ───
limiter = RateLimiter()

@app.middleware("http")
async def rate_limit(request: Request, call_next):
    await limiter.rate_limit_middleware(request)
    response = await call_next(request)
    return response

# 在响应头返回限流信息
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 73
# X-RateLimit-Reset: 1699999999` },
];

export default function LessonAISaaS() {
  const [layIdx, setLayIdx] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🧩 module_07 — AI SaaS 平台</div>
      <div className="fs-hero">
        <h1>AI SaaS 平台：把 AI 产品卖给企业客户</h1>
        <p>
          做了个酷炫的 AI demo 然后呢？要变成 SaaS 产品，你需要
          <strong>多租户隔离</strong>、<strong>API Key 鉴权</strong>、<strong>按 Token 计费</strong>、
          <strong>三层限流</strong>。本模块给你一个可以收费的 SaaS 平台骨架。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🏗️ SaaS 四大支柱</h2>
        <div className="fs-pills">
          {LAYERS.map((l, i) => (
            <button key={i} className={`fs-btn ${i === layIdx ? 'primary' : ''}`}
              onClick={() => setLayIdx(i)}>
              {l.icon} {l.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fbbf24' }}>{LAYERS[layIdx].icon} {LAYERS[layIdx].name}</h3>
            <span className="fs-tag amber">{LAYERS[layIdx].tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 saas_{LAYERS[layIdx].tag.toLowerCase().replace(/[- ]/g, '_')}.py
            </div>
            <pre className="fs-code">{LAYERS[layIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="fs-section">
        <h2 className="fs-section-title">💎 套餐定价参考</h2>
        <div className="fs-grid-3">
          {[
            { name: 'Free', price: '$0', color: '#64748b', features: ['10 万 tokens/月', '1 知识库', 'GPT-4o-mini', '社区支持', '5 req/min'] },
            { name: 'Pro', price: '$29/月', color: '#8b5cf6', features: ['500 万 tokens/月', '10 知识库', 'GPT-4o + Claude', '邮件支持', '100 req/min'] },
            { name: 'Enterprise', price: '$299/月', color: '#f59e0b', features: ['1 亿 tokens/月', '无限知识库', '全部模型', '专属客服', '1000 req/min', 'SSO / SAML', 'SLA 99.9%'] },
          ].map((tier, i) => (
            <div key={i} className="fs-card" style={{ borderTop: `3px solid ${tier.color}`, textAlign: 'center' }}>
              <h3 style={{ color: tier.color, margin: '0 0 0.25rem' }}>{tier.name}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e2e8f0', margin: '0.5rem 0' }}>{tier.price}</div>
              <div style={{ textAlign: 'left' }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '0.2rem 0' }}>✓ {f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 多模态应用</button>
        <button className="fs-btn rose">上线运营 →</button>
      </div>
    </div>
  );
}
