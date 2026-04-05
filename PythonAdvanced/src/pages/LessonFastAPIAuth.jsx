import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const JWT_STEPS = [
  { step: '① 用户登录', color: '#60a5fa', code: `# 客户端 POST /auth/login
{
  "username": "alice",
  "password": "secret123"
}`, note: '客户端发送账号密码' },
  { step: '② 验证 & 签发', color: '#14b8a6', code: `# 服务端验证后，生成 JWT Token
import jwt
from datetime import datetime, timedelta

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),  # subject：用户ID
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),  # issued at
        "type": "access",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# JWT 结构：Header.Payload.Signature（Base64编码）
# eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiJ9.xxxx`, note: '服务端用密钥签名生成 JWT' },
  { step: '③ 客户端存储', color: '#a78bfa', code: `# 客户端收到 Token 响应
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 3600
}

# 前端存储方式：
# HttpOnly Cookie（推荐，防 XSS）
# localStorage（方便但有 XSS 风险）
# sessionStorage（关闭标签页即失效）`, note: '客户端存储 Token（推荐 HttpOnly Cookie）' },
  { step: '④ 携带请求', color: '#fbbf24', code: `# 后续每次请求携带 Token
GET /api/profile HTTP/1.1
Authorization: Bearer eyJhbGci...

# FastAPI 自动解析
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme)  # 自动提取
) -> User:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user = await db.get_user(int(payload["sub"]))
    return user`, note: '请求头携带 Bearer Token，FastAPI 自动解析' },
  { step: '⑤ 验证 & 响应', color: '#22c55e', code: `@app.get("/api/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)  # 依赖注入
):
    # current_user 已经是验证通过的用户对象
    return current_user

# Token 过期时自动返回 401：
# {
#   "detail": "Could not validate credentials"
# }

# Refresh Token 刷新流程（避免用户重新登录）
@app.post("/auth/refresh")
async def refresh_token(refresh_token: str):
    payload = verify_refresh_token(refresh_token)
    new_access_token = create_access_token(payload["sub"])
    return {"access_token": new_access_token}`, note: 'Token 验证通过后注入用户对象，过期自动 401' },
];

const MIDDLEWARE_EXAMPLES = [
  {
    name: 'CORS 跨域',
    code: `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],  # 生产：精确域名
    # allow_origins=["*"],                       # 开发：允许所有
    allow_credentials=True,   # 允许携带 Cookie
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)`,
  },
  {
    name: '日志 & 耗时',
    code: `import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()
        
        # 给 request 附加 ID（可在路由中取用）
        request.state.request_id = request_id
        
        response = await call_next(request)
        
        duration_ms = (time.perf_counter() - start) * 1000
        print(
            f"[{request_id}] {request.method} {request.url.path} "
            f"→ {response.status_code} ({duration_ms:.1f}ms)"
        )
        response.headers["X-Request-ID"] = request_id
        return response

app.add_middleware(LoggingMiddleware)`,
  },
  {
    name: '限流（速率限制）',
    code: `from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 给特定路由添加限频
@app.post("/auth/login")
@limiter.limit("5/minute")  # 每 IP 每分钟最多5次登录
async def login(request: Request, form: LoginForm):
    ...

@app.get("/api/search")
@limiter.limit("30/minute")  # 搜索接口允许更多
async def search(request: Request, q: str):
    ...`,
  },
];

export default function LessonFastAPIAuth() {
  const navigate = useNavigate();
  const [activeJwt, setActiveJwt] = useState(null);
  const [activeMw, setActiveMw] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge teal">🔐 module_04 — FastAPI 认证</div>

      <div className="py-hero">
        <h1>FastAPI 进阶：JWT 认证与中间件</h1>
        <p><strong>JWT + 依赖注入</strong>是 FastAPI 认证的标准姿势。中间件则是跨切面处理的利器——<strong>日志、限流、CORS、请求追踪</strong>，统统在中间件中解决，业务代码零入侵。</p>
      </div>

      {/* JWT 流程步进 */}
      <div className="py-section">
        <h2 className="py-section-title">🔐 JWT 认证完整流程（点击展开）</h2>
        <div>
          {JWT_STEPS.map((s, i) => (
            <div key={i} className="py-step" onClick={() => setActiveJwt(activeJwt === i ? null : i)}
              style={{ background: activeJwt === i ? `${s.color}0a` : undefined, borderColor: activeJwt === i ? `${s.color}35` : undefined }}>
              <div className="py-step-num" style={{ background: `${s.color}15`, color: s.color }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: activeJwt === i ? '0.5rem' : '0.1rem' }}>{s.step}</div>
                <div style={{ fontSize: '0.78rem', color: '#3a5070' }}>{s.note}</div>
                {activeJwt === i && (
                  <div className="py-code-wrapper" style={{ marginTop: '0.75rem' }}>
                    <div className="py-code" style={{ fontSize: '0.74rem', maxHeight: 220, overflow: 'auto' }}>{s.code}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC 权限模型 */}
      <div className="py-section">
        <h2 className="py-section-title">🎭 RBAC 角色权限控制</h2>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>rbac.py — 基于依赖注入的权限验证</span>
          </div>
          <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 300, overflow: 'auto' }}>{`from enum import Enum
from functools import partial
from fastapi import Depends, HTTPException, status

class Role(str, Enum):
    ADMIN  = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

def require_role(*roles: Role):
    """角色权限依赖工厂"""
    async def checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要权限：{[r.value for r in roles]}",
            )
        return current_user
    return checker

# ── 在路由中使用 ──
@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    _: User = Depends(require_role(Role.ADMIN)),  # 只有 admin 可删
):
    await db.delete_user(user_id)
    return {"message": "已删除"}

@app.get("/articles")
async def list_articles(
    _: User = Depends(require_role(Role.ADMIN, Role.EDITOR, Role.VIEWER)),
):  # 所有角色均可访问
    return await db.get_articles()`}</div>
        </div>
      </div>

      {/* 中间件 */}
      <div className="py-section">
        <h2 className="py-section-title">🔀 关键中间件实现（切换查看）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {MIDDLEWARE_EXAMPLES.map((m, i) => (
            <button key={i} className={`py-btn ${activeMw === i ? 'primary' : ''}`} onClick={() => setActiveMw(i)} style={{ fontSize: '0.8rem' }}>
              {m.name}
            </button>
          ))}
        </div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>middleware.py — {MIDDLEWARE_EXAMPLES[activeMw].name}</span>
          </div>
          <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 320, overflow: 'auto' }}>{MIDDLEWARE_EXAMPLES[activeMw].code}</div>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/fastapi-basics')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/fastapi-db')}>下一模块：SQLAlchemy Async ORM →</button>
      </div>
    </div>
  );
}
