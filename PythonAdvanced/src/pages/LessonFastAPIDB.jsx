import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DB_SECTIONS = [
  {
    name: '模型定义',
    code: `# models.py — SQLAlchemy 2.0 Async ORM 模型
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, ForeignKey, DateTime, func, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    """所有模型的基类"""
    pass

class User(Base):
    __tablename__ = "users"
    
    # Mapped[T] + mapped_column：类型标注即表结构定义
    id:         Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    username:   Mapped[str]           = mapped_column(String(50), unique=True, nullable=False, index=True)
    email:      Mapped[str]           = mapped_column(String(120), unique=True, nullable=False)
    password:   Mapped[str]           = mapped_column(String(60), nullable=False)
    is_active:  Mapped[bool]          = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime]      = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime]      = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关系：一对多（User has many Orders）
    orders: Mapped[List["Order"]] = relationship(back_populates="user", lazy="select")

class Order(Base):
    __tablename__ = "orders"
    
    id:         Mapped[int]            = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id:    Mapped[int]            = mapped_column(ForeignKey("users.id"), index=True)
    total:      Mapped[float]          = mapped_column(nullable=False)
    status:     Mapped[str]            = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime]       = mapped_column(DateTime, server_default=func.now())
    
    # 关系：多对一（Order belongs to User）
    user: Mapped["User"] = relationship(back_populates="orders")`,
    note: '使用 Mapped[T] + mapped_column 的现代写法（SQLAlchemy 2.0+），类型清晰且 IDE 支持完好',
  },
  {
    name: '连接池配置',
    code: `# database.py — 异步连接池配置
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

# 异步 MySQL 连接字符串（使用 aiomysql 驱动）
DATABASE_URL = "mysql+aiomysql://user:password@localhost:3306/mydb"

# 创建异步引擎（连接池）
engine = create_async_engine(
    DATABASE_URL,
    echo=False,           # 生产环境关闭 SQL 日志
    pool_size=20,         # 连接池大小（最大活跃连接）
    max_overflow=30,      # 超出 pool_size 后最多再创建的连接
    pool_pre_ping=True,   # 从池中取连接前先 ping，自动重连
    pool_recycle=3600,    # 每小时回收连接（避免 MySQL 8h 超时断开）
)

# 异步 Session 工厂
AsyncSessionFactory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # commit 后 ORM 对象不失效（方便继续使用）
)

# FastAPI 依赖注入：每个请求独立 Session
async def get_db() -> AsyncSession:
    async with AsyncSessionFactory() as session:
        yield session  # 请求结束：自动 close，异常：自动 rollback`,
    note: '连接池参数：pool_size=20 适合中等规模应用，pool_pre_ping 防止 MySQL wait_timeout 导致连接失效',
  },
  {
    name: 'CRUD 操作',
    code: `# crud.py — 异步 CRUD 操作
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

class UserCRUD:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_with_orders(self, user_id: int) -> User | None:
        """预加载关联订单（避免 N+1 查询问题）"""
        stmt = (
            select(User)
            .options(selectinload(User.orders))  # ← 关键：预加载关联数据
            .where(User.id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def create(self, data: dict) -> User:
        user = User(**data)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)  # 刷新获取数据库生成的字段（id, created_at）
        return user
    
    async def update(self, user_id: int, data: dict) -> int:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(**data)
            .execution_options(synchronize_session=False)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount  # 返回影响行数

    async def list_paginated(self, page: int, size: int) -> tuple[list[User], int]:
        """分页查询（同时返回总数避免 2 次查询）"""
        from sqlalchemy import func
        count_stmt = select(func.count(User.id))
        items_stmt = select(User).offset((page-1)*size).limit(size)
        
        count = (await self.db.execute(count_stmt)).scalar()
        users = (await self.db.execute(items_stmt)).scalars().all()
        return users, count`,
    note: '使用 selectinload 预加载关联数据，彻底消除 N+1 查询问题',
  },
  {
    name: 'Alembic 迁移',
    code: `# ── Alembic 数据库迁移工具使用指南 ──

# 1. 初始化 Alembic
alembic init alembic

# 2. 修改 alembic/env.py，指向你的模型和数据库
# env.py:
from app.database import engine, Base
from app import models  # 确保所有 model 被导入

target_metadata = Base.metadata  # 关键：告诉 Alembic 从哪个 metadata 生成迁移

# 3. 自动生成迁移文件（对比模型与数据库差异）
alembic revision --autogenerate -m "add user table"

# 4. 检查生成的迁移文件（务必人工审核！）
# alembic/versions/xxxx_add_user_table.py

# 5. 执行迁移（升级到最新版本）
alembic upgrade head

# 6. 其他常用命令
alembic history          # 查看迁移历史
alembic current          # 查看当前版本
alembic downgrade -1     # 回滚一步
alembic downgrade base   # 回滚到初始状态（危险！）

# 生产建议：
# - 不要直接在生产执行 upgrade，先在 staging 验证
# - 回滚前先备份数据库
# - 破坏性操作（drop column）单独写迁移并手动审核`,
    note: 'Alembic 自动检测模型变化并生成迁移SQL，与 Django migrations 类似但更灵活',
  },
];

export default function LessonFastAPIDB() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge teal">🗃️ module_05 — FastAPI + 数据库</div>

      <div className="py-hero">
        <h1>FastAPI + 数据库：SQLAlchemy 2.0 Async ORM</h1>
        <p>SQLAlchemy 2.0 的异步 ORM 完美配合 FastAPI，实现<strong>数据库操作全链路异步化</strong>。掌握连接池、N+1 消除、Alembic 迁移，搭建生产级数据层。</p>
      </div>

      {/* ORM vs 原生 SQL */}
      <div className="py-section">
        <h2 className="py-section-title">⚖️ ORM vs 原生 SQL 选型</h2>
        <div className="py-grid-2">
          {[
            { title: '✅ 用 ORM（SQLAlchemy）', color: '#22c55e', items: ['快速 CRUD，代码简洁', '类型安全，IDE 补全', '数据库切换零改动', 'Alembic 迁移管理', '防止 SQL 注入（自动参数化）'] },
            { title: '✅ 用原生 SQL（asyncpg）', color: '#60a5fa', items: ['复杂报表查询（多 JOIN）', '性能关键路径（批量插入）', '数据库特有函数（存储过程）', '全文搜索（MATCH AGAINST）'] },
          ].map(a => (
            <div key={a.title} className="py-card" style={{ borderColor: `${a.color}20` }}>
              <h3 style={{ color: a.color }}>{a.title}</h3>
              {a.items.map(item => <div key={item} style={{ fontSize: '0.82rem', color: '#3a5070', marginBottom: '0.2rem' }}>• {item}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 分块代码演示 */}
      <div className="py-section">
        <h2 className="py-section-title">💻 SQLAlchemy 2.0 实战代码</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {DB_SECTIONS.map((s, i) => (
            <button key={i} className={`py-btn ${activeSection === i ? 'primary' : ''}`}
              onClick={() => setActiveSection(i)} style={{ fontSize: '0.8rem' }}>{s.name}</button>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#3a5070', marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(55,118,171,0.05)', borderRadius: '6px' }}>
          💡 {DB_SECTIONS[activeSection].note}
        </div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>SQLAlchemy 2.0 — {DB_SECTIONS[activeSection].name}</span>
          </div>
          <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 420, overflow: 'auto' }}>{DB_SECTIONS[activeSection].code}</div>
        </div>
      </div>

      {/* N+1 问题说明 */}
      <div className="py-section">
        <h2 className="py-section-title">⚠️ N+1 查询问题与解决方案</h2>
        <div className="py-grid-2">
          <div className="py-card" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
            <h3 style={{ color: '#f87171' }}>❌ N+1 查询（严重性能问题）</h3>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#3a5070', lineHeight: '1.8', padding: '0.5rem', background: 'rgba(248,113,113,0.05)', borderRadius: '6px' }}>{`# 查询10个用户
users = await db.execute(select(User).limit(10))
# → 1次 SQL

for user in users:
    print(user.orders)  # 每个用户触发1次查询
    # → 10次 SQL！

# 总计 11 次 SQL（N+1 问题）`}</div>
          </div>
          <div className="py-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
            <h3 style={{ color: '#22c55e' }}>✅ selectinload 解决方案</h3>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#3a5070', lineHeight: '1.8', padding: '0.5rem', background: 'rgba(34,197,94,0.05)', borderRadius: '6px' }}>{`from sqlalchemy.orm import selectinload

stmt = (
    select(User).limit(10)
    .options(selectinload(User.orders))
    # 自动预加载：先查10个用户，
    # 再用 WHERE user_id IN (1,2,...,10)
    # 一次查出所有订单
)
users = await db.execute(stmt)

# 总计 2 次 SQL（无论 N 多大）`}</div>
          </div>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/fastapi-auth')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/tdd')}>下一模块：测试驱动开发 →</button>
      </div>
    </div>
  );
}
