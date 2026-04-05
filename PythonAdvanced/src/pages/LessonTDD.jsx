import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TDD_CYCLE = [
  { phase: 'RED', label: '🔴 写失败的测试', color: '#f87171', desc: '先写测试，描述期望行为。此时没有实现，测试必然失败。这是 TDD 的起点。', code: `# test_user_service.py
import pytest
from app.services.user import UserService

@pytest.mark.asyncio
async def test_create_user_returns_id():
    """测试：创建用户应该返回用户 ID"""
    service = UserService(db=mock_db)
    
    result = await service.create_user(
        username="alice",
        email="alice@example.com",
        password="secure123",
    )
    
    # 断言：返回的字典包含 id 字段
    assert "id" in result
    assert isinstance(result["id"], int)
    assert result["username"] == "alice"

# 运行：pytest test_user_service.py
# ❌ FAILED — AttributeError: module has no attribute 'UserService'` },
  { phase: 'GREEN', label: '🟢 写最小实现', color: '#22c55e', desc: '只写让测试通过的最少代码，不追求完美，先让绿灯亮起来。', code: `# app/services/user.py
class UserService:
    def __init__(self, db):
        self.db = db
    
    async def create_user(
        self,
        username: str,
        email: str,
        password: str,
    ) -> dict:
        # 最小实现：让测试通过
        user = await self.db.create({
            "username": username,
            "email": email,
            "password": hash_password(password),
        })
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }

# 运行：pytest test_user_service.py
# ✅ PASSED — 1 passed in 0.05s` },
  { phase: 'REFACTOR', label: '🔵 重构优化', color: '#60a5fa', desc: '在测试保护下放心重构：提取复用代码、改进架构、添加边界校验，测试始终保持绿色。', code: `# 重构：提取验证逻辑，添加异常处理
from app.exceptions import DuplicateEmailError
from app.models import User

class UserService:
    def __init__(self, db: UserRepository):
        self.db = db
    
    async def create_user(self, data: UserCreate) -> UserResponse:
        # 重构后：边界检查、Pydantic 模型、明确异常
        if await self.db.get_by_email(data.email):
            raise DuplicateEmailError(f"邮箱 {data.email} 已注册")
        
        user = await self.db.create(
            username=data.username,
            email=data.email,
            password=hash_password(data.password),
        )
        return UserResponse.model_validate(user)

# 运行：pytest test_user_service.py
# ✅ PASSED — 1 passed in 0.05s （重构不破坏测试）` },
];

const TEST_TYPES = [
  {
    name: '单元测试', icon: '🔬', color: '#22c55e',
    desc: '测试单个函数/方法，隔离外部依赖（DB/API）',
    code: `# 纯函数单元测试：无外部依赖
def test_hash_password_not_plaintext():
    result = hash_password("my_secret")
    assert result != "my_secret"   # 不是明文
    assert len(result) == 60       # bcrypt 始终 60 字符

def test_hash_password_different_each_call():
    """bcrypt 每次生成不同 hash（加盐）"""
    h1 = hash_password("same_password")
    h2 = hash_password("same_password")
    assert h1 != h2  # 不同（盐不同）

def test_verify_password():
    p = "my_secret"
    h = hash_password(p)
    assert verify_password(p, h) is True
    assert verify_password("wrong", h) is False`,
  },
  {
    name: 'Mock 测试', icon: '🎭', color: '#a78bfa',
    desc: '用 Mock 替换外部依赖，测试业务逻辑',
    code: `from unittest.mock import AsyncMock, patch, MagicMock
import pytest

@pytest.mark.asyncio
async def test_send_email_on_register():
    """测试：注册后是否发送了欢迎邮件"""
    mock_db = AsyncMock()
    mock_db.create.return_value = MagicMock(id=1, username="bob")
    
    mock_email = AsyncMock()
    
    service = UserService(db=mock_db)
    
    with patch("app.services.user.send_email", mock_email):
        await service.create_user(
            username="bob",
            email="bob@example.com",
            password="pass1234",
        )
    
    # 验证 send_email 被调用一次，且参数正确
    mock_email.assert_called_once_with(
        to="bob@example.com",
        subject="欢迎注册！",
    )`,
  },
  {
    name: 'API 集成测试', icon: '🌐', color: '#14b8a6',
    desc: 'TestClient 模拟 HTTP 请求，测试完整请求链路',
    code: `from fastapi.testclient import TestClient
from httpx import AsyncClient
import pytest
from app.main import app

# 同步测试（简单场景）
client = TestClient(app)

def test_get_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404
    assert "不存在" in response.json()["detail"]

# 异步测试（推荐，与应用一致）
@pytest.mark.asyncio
async def test_create_user_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/users", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "secure123",
        })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert "password" not in data  # 密码不能在响应中泄漏！`,
  },
  {
    name: 'Fixture & 参数化', icon: '🔧', color: '#fbbf24',
    desc: 'pytest fixture 管理测试依赖，参数化覆盖多场景',
    code: `import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Fixture：测试数据库 Session
@pytest.fixture
async def db_session():
    """每个测试函数独立的数据库 Session"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSession(engine) as session:
        yield session
    
    # 测试结束后自动清理
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# Fixture：已登录的用户 Token
@pytest.fixture
async def auth_headers(db_session):
    user = await create_test_user(db_session)
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}

# 参数化：一次测试多个场景
@pytest.mark.parametrize("username,expected_status", [
    ("valid_user",  201),  # 正常创建
    ("ad",          422),  # 用户名太短
    ("admin",       422),  # 保留关键字
    ("",            422),  # 空字符串
])
async def test_create_user_validation(username, expected_status, db_session):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/users", json={"username": username, ...})
    assert resp.status_code == expected_status`,
  },
];

export default function LessonTDD() {
  const navigate = useNavigate();
  const [activeCycle, setActiveCycle] = useState(0);
  const [activeTest, setActiveTest] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge green">🧪 module_06 — 测试驱动开发</div>

      <div className="py-hero">
        <h1>测试驱动开发：pytest 与测试策略</h1>
        <p>TDD 不是"写完代码再补测试"，而是<strong>测试驱动设计</strong>——先写测试逼迫你思考接口，再写实现。这让代码天生松耦合、行为清晰，重构时有信心。</p>
      </div>

      {/* TDD 循环 */}
      <div className="py-section">
        <h2 className="py-section-title">🔄 TDD 红绿重构循环（步进演示）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {TDD_CYCLE.map((c, i) => (
            <button key={i} onClick={() => setActiveCycle(i)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${activeCycle === i ? c.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeCycle === i ? `${c.color}12` : 'rgba(255,255,255,0.02)',
                color: activeCycle === i ? c.color : '#3a5070' }}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="py-card" style={{ borderColor: `${TDD_CYCLE[activeCycle].color}25` }}>
          <h3 style={{ color: TDD_CYCLE[activeCycle].color }}>{TDD_CYCLE[activeCycle].phase} 阶段</h3>
          <p style={{ marginBottom: '0.875rem' }}>{TDD_CYCLE[activeCycle].desc}</p>
          <div className="py-code-wrapper">
            <div className="py-code-header">
              <div className="py-code-dot" style={{ background: '#ef4444' }} />
              <div className="py-code-dot" style={{ background: '#f59e0b' }} />
              <div className="py-code-dot" style={{ background: TDD_CYCLE[activeCycle].color }} />
              <span style={{ marginLeft: '0.5rem' }}>{TDD_CYCLE[activeCycle].phase} — pytest</span>
            </div>
            <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 300, overflow: 'auto' }}>{TDD_CYCLE[activeCycle].code}</div>
          </div>
        </div>
      </div>

      {/* 四大测试类型 */}
      <div className="py-section">
        <h2 className="py-section-title">🧪 四大测试类型（切换查看）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {TEST_TYPES.map((t, i) => (
            <button key={i} onClick={() => setActiveTest(i)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                border: `1px solid ${activeTest === i ? t.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeTest === i ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTest === i ? t.color : '#3a5070' }}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#3a5070', marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(55,118,171,0.05)', borderRadius: '6px' }}>
          💡 {TEST_TYPES[activeTest].desc}
        </div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: TEST_TYPES[activeTest].color }} />
            <span style={{ marginLeft: '0.5rem', color: TEST_TYPES[activeTest].color }}>{TEST_TYPES[activeTest].icon} {TEST_TYPES[activeTest].name}</span>
          </div>
          <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflow: 'auto' }}>{TEST_TYPES[activeTest].code}</div>
        </div>
      </div>

      {/* pytest 命令速查 */}
      <div className="py-section">
        <h2 className="py-section-title">⚡ pytest 高频命令速查</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>命令</th><th>用途</th></tr></thead>
            <tbody>
              {[
                ['pytest -v', '详细输出每条测试结果'],
                ['pytest -x', '第一个失败即停止（快速定位问题）'],
                ['pytest -k "test_user"', '只运行名称匹配的测试'],
                ['pytest --cov=app --cov-report=html', '生成覆盖率报告（需 pytest-cov）'],
                ['pytest -s', '显示 print() 输出（调试用）'],
                ['pytest --lf', '只重跑上次失败的测试（last-failed）'],
                ['pytest -n 4', '并行运行测试（需 pytest-xdist）'],
                ['pytest --tb=short', '简短的错误追踪（默认 long）'],
              ].map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#22c55e', fontSize: '0.78rem' }}>{cmd}</code></td>
                  <td style={{ fontSize: '0.82rem', color: '#3a5070' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/fastapi-db')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/performance')}>下一模块：性能优化 →</button>
      </div>
    </div>
  );
}
