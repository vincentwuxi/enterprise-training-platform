import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ENDPOINTS = [
  {
    method: 'GET', path: '/users/{user_id}', tag: '查询',
    desc: '路径参数 + 查询参数 + 响应模型',
    code: `from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

app = FastAPI(
    title="用户管理 API",
    description="基于 FastAPI 构建的用户管理服务",
    version="1.0.0",
)

# ── Pydantic 响应模型 ──
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True  # 支持 ORM 模式

# ── 路由：GET /users/{user_id} ──
@app.get(
    "/users/{user_id}",
    response_model=UserResponse,   # 自动过滤不在模型里的字段
    summary="获取用户详情",
    tags=["Users"],
)
async def get_user(
    user_id: int,                             # 路径参数（自动类型校验）
    include_orders: bool = Query(
        default=False,
        description="是否包含订单数据"
    ),
):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"用户 {user_id} 不存在",
        )
    return user`,
    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "username": "alice",
  "email": "alice@example.com",
  "is_active": true,
  "created_at": "2024-03-15T09:23:11.000Z"
}`,
  },
  {
    method: 'POST', path: '/users', tag: '创建',
    desc: 'Request Body 验证 + 自动文档 + 状态码',
    code: `from pydantic import BaseModel, EmailStr, Field, validator
from fastapi import FastAPI, status

class UserCreate(BaseModel):
    username: str = Field(
        ...,  # ... 表示必填
        min_length=3,
        max_length=50,
        pattern=r'^[a-zA-Z0-9_]+$',
        examples=["alice_123"],
    )
    email: EmailStr
    password: str = Field(..., min_length=8)
    age: Optional[int] = Field(None, ge=0, le=150)

    @validator('username')
    def username_not_reserved(cls, v):
        reserved = {'admin', 'root', 'system'}
        if v.lower() in reserved:
            raise ValueError(f"用户名 {v} 是保留词")
        return v

@app.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,  # 返回 201 而非 200
    summary="创建新用户",
    tags=["Users"],
)
async def create_user(user: UserCreate):
    # Pydantic 在这里已自动完成所有字段验证
    # 如果验证失败，FastAPI 自动返回 422 + 详细错误信息
    hashed_pw = hash_password(user.password)
    db_user = await db.create_user(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw,
    )
    return db_user`,
    response: `HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 99,
  "username": "bob",
  "email": "bob@example.com",
  "is_active": true,
  "created_at": "2024-04-05T23:00:00.000Z"
}

# 字段错误时（422 自动生成）：
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}`,
  },
  {
    method: 'PATCH', path: '/users/{id}', tag: '更新',
    desc: 'Optional 字段部分更新 + Dependency 注入',
    code: `from fastapi import Depends
from typing import Optional

class UserUpdate(BaseModel):
    # Optional 字段：客户端只传需要更新的字段
    username: Optional[str] = Field(None, min_length=3)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

# ── 依赖注入：数据库连接 ──
async def get_db():
    async with AsyncSession(engine) as session:
        yield session  # 请求结束后自动关闭

# ── 依赖注入：获取当前用户（下一模块详解 JWT）──
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    user = await verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="未授权")
    return user

@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    update: UserUpdate,
    current_user: User = Depends(get_current_user),  # 注入认证
    db: AsyncSession = Depends(get_db),              # 注入数据库
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权操作")
    
    # exclude_unset=True：只更新客户端传了的字段
    update_data = update.dict(exclude_unset=True)
    return await db.update_user(user_id, update_data)`,
    response: `HTTP/1.1 200 OK
Content-Type: application/json

# 只传 email，只更新 email
# Request: {"email": "new@example.com"}

{
  "id": 42,
  "username": "alice",           # 保持不变
  "email": "new@example.com",    # 已更新
  "is_active": true,
  "created_at": "2024-03-15T09:23:11.000Z"
}`,
  },
];

export default function LessonFastAPIBasics() {
  const navigate = useNavigate();
  const [activeEp, setActiveEp] = useState(0);
  const [showResp, setShowResp] = useState(false);

  const METHOD_COLOR = { GET: '#22c55e', POST: '#fbbf24', PATCH: '#a78bfa', DELETE: '#f87171' };
  const ep = ENDPOINTS[activeEp];

  return (
    <div className="lesson-py">
      <div className="py-badge teal">⚡ module_03 — FastAPI 基础</div>

      <div className="py-hero">
        <h1>FastAPI 基础：路由、参数验证与响应模型</h1>
        <p>FastAPI 把 <strong>Python 类型标注</strong>变成了自动文档、自动验证和自动序列化。写出类型清晰的 Python 代码，就自然得到了一个生产级 API。</p>
      </div>

      {/* FastAPI 三大核心优势 */}
      <div className="py-section">
        <h2 className="py-section-title">🚀 为什么选 FastAPI？</h2>
        <div className="py-grid-3">
          {[
            { icon: '⚡', title: '极高性能', desc: '基于 Starlette + Uvicorn，性能与 Node.js/Go 持平，比 Django/Flask 快 5-10x', color: '#fbbf24' },
            { icon: '🛡️', title: '自动验证', desc: 'Pydantic v2 驱动，类型标注即验证规则，422 错误信息精确到字段和错误原因', color: '#22c55e' },
            { icon: '📚', title: '自动文档', desc: '启动即有 /docs (Swagger) 和 /redoc (ReDoc)，API 文档零维护成本', color: '#60a5fa' },
          ].map(a => (
            <div key={a.title} className="py-card" style={{ textAlign: 'center', padding: '1.25rem', borderColor: `${a.color}20` }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{a.icon}</div>
              <div style={{ fontWeight: 800, color: a.color, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{a.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#3a5070' }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API 接口示例 */}
      <div className="py-section">
        <h2 className="py-section-title">💻 接口设计实战（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {ENDPOINTS.map((ep, i) => (
            <button key={i} onClick={() => { setActiveEp(i); setShowResp(false); }}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                border: `1px solid ${activeEp === i ? (METHOD_COLOR[ep.method] + '60') : 'rgba(255,255,255,0.07)'}`,
                background: activeEp === i ? `${METHOD_COLOR[ep.method]}10` : 'rgba(255,255,255,0.02)',
                color: activeEp === i ? METHOD_COLOR[ep.method] : '#3a5070' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', background: `${METHOD_COLOR[ep.method]}20`, padding: '0.1rem 0.35rem', borderRadius: '3px', color: METHOD_COLOR[ep.method] }}>{ep.method}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>{ep.path}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#3a5070', marginBottom: '0.5rem' }}>💡 {ep.desc}</div>

        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: METHOD_COLOR[ep.method] }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', marginRight: '0.35rem' }}>{ep.method}</span>{ep.path} — {ep.tag}
            </span>
            <button className="py-btn" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setShowResp(s => !s)}>
              {showResp ? '< 代码' : '> 响应'}
            </button>
          </div>
          <div className="py-code" style={{ maxHeight: 380, overflow: 'auto', fontSize: '0.76rem' }}>
            {showResp ? ep.response : ep.code}
          </div>
        </div>
      </div>

      {/* Pydantic 验证规则速查 */}
      <div className="py-section">
        <h2 className="py-section-title">🔍 Pydantic Field 验证规则速查</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>字段类型</th><th>Field 参数</th><th>示例</th></tr></thead>
            <tbody>
              {[
                ['str', 'min_length, max_length, pattern, examples', 'Field(..., min_length=3, max_length=50)'],
                ['int/float', 'ge(≥), gt(>), le(≤), lt(<)', 'Field(..., ge=0, le=150)'],
                ['list', 'min_length, max_length (列表长度)', 'Field(..., min_length=1)'],
                ['Optional[T]', 'default=None 或直接 Optional', 'username: Optional[str] = None'],
                ['EmailStr', '自动 email 格式校验（pydantic[email]）', 'email: EmailStr'],
                ['datetime', '自动 ISO 8601 解析', 'created_at: datetime'],
                ['Literal[...]', '枚举限制', 'status: Literal["active","banned"]'],
              ].map(([t, p, e]) => (
                <tr key={t}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#60a5fa', fontSize: '0.78rem' }}>{t}</code></td>
                  <td style={{ fontSize: '0.78rem', color: '#3a5070' }}>{p}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#14b8a6' }}>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/async-patterns')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/fastapi-auth')}>下一模块：JWT 认证与中间件 →</button>
      </div>
    </div>
  );
}
