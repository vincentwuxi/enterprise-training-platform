import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ARCH_LAYERS = [
  { layer: 'API Layer',     role: 'FastAPI Routers', items: ['路由注册', 'Request/Response 模型', '认证中间件'], color: '#60a5fa' },
  { layer: 'Service Layer', role: '业务逻辑',         items: ['业务规则验证', '事务协调', '跨服务调用'], color: '#14b8a6' },
  { layer: 'Repository',   role: '数据访问抽象',      items: ['CRUD 操作', '缓存策略', '查询封装'], color: '#a78bfa' },
  { layer: 'Data Layer',   role: 'DB + Redis',        items: ['SQLAlchemy ORM', 'Redis 缓存', 'Celery 队列'], color: '#fbbf24' },
];

const PROJECT_FILES = [
  { path: 'app/api/v1/products.py',     type: 'API', color: '#60a5fa',
    code: `from fastapi import APIRouter, Depends, Query, status
from app.services.product import ProductService
from app.schemas.product import ProductCreate, ProductResponse, ProductList
from app.core.deps import get_current_user, get_db

router = APIRouter(prefix="/products", tags=["商品"])

@router.get("", response_model=ProductList)
async def list_products(
    category_id: int | None = Query(None),
    search: str | None = Query(None, min_length=2),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db = Depends(get_db),
):
    """获取商品列表（支持分类筛选和搜索）"""
    svc = ProductService(db)
    products, total = await svc.list_products(
        category_id=category_id,
        search=search,
        page=page,
        size=size,
    )
    return ProductList(
        items=products,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    current_user = Depends(require_role(Role.ADMIN)),
    db = Depends(get_db),
):
    """创建商品（仅 Admin 权限）"""
    return await ProductService(db).create_product(data, current_user.id)` },
  { path: 'app/services/order.py',      type: 'Service', color: '#14b8a6',
    code: `from decimal import Decimal
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.tasks.email import send_order_confirmation

class OrderService:
    def __init__(self, db):
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
    
    async def create_order(
        self,
        user_id: int,
        items: list[dict],
    ) -> dict:
        """创建订单（核心业务逻辑）"""
        # 1. 验证商品库存
        total = Decimal("0")
        order_items = []
        
        for item in items:
            product = await self.product_repo.get_by_id(item["product_id"])
            if not product:
                raise ProductNotFound(f"商品 {item['product_id']} 不存在")
            if product.stock < item["quantity"]:
                raise InsufficientStock(f"{product.name} 库存不足")
            
            unit_price = product.price
            total += unit_price * item["quantity"]
            order_items.append({**item, "unit_price": str(unit_price)})
        
        # 2. 创建订单（事务）
        order = await self.order_repo.create_with_items(
            user_id=user_id,
            total=str(total),
            items=order_items,
        )
        
        # 3. 扣减库存
        for item in order_items:
            await self.product_repo.decr_stock(item["product_id"], item["quantity"])
        
        # 4. 异步发送确认邮件（不阻塞当前请求）
        send_order_confirmation.delay(order.id)
        
        return order` },
  { path: 'tests/test_order_service.py', type: 'Test', color: '#22c55e',
    code: `import pytest
from unittest.mock import AsyncMock, MagicMock
from decimal import Decimal
from app.services.order import OrderService
from app.exceptions import InsufficientStock, ProductNotFound

@pytest.fixture
def mock_db():
    return AsyncMock()

@pytest.fixture
def order_service(mock_db):
    return OrderService(db=mock_db)

@pytest.mark.asyncio
async def test_create_order_success(order_service):
    """正常下单流程"""
    # Arrange
    product = MagicMock(id=1, name="iPhone", price=Decimal("7999"), stock=10)
    order_service.product_repo.get_by_id = AsyncMock(return_value=product)
    order_service.order_repo.create_with_items = AsyncMock(
        return_value=MagicMock(id=100)
    )
    
    # Act
    result = await order_service.create_order(
        user_id=42,
        items=[{"product_id": 1, "quantity": 2}],
    )
    
    # Assert
    assert result.id == 100
    order_service.product_repo.decr_stock.assert_awaited_once_with(1, 2)

@pytest.mark.asyncio
async def test_create_order_insufficient_stock(order_service):
    """库存不足应该抛出异常"""
    product = MagicMock(stock=1)  # 只有1件
    order_service.product_repo.get_by_id = AsyncMock(return_value=product)
    
    with pytest.raises(InsufficientStock):
        await order_service.create_order(
            user_id=42,
            items=[{"product_id": 1, "quantity": 5}],  # 要买5件
        )

@pytest.mark.parametrize("stock,qty,expected_exc", [
    (0,  1, InsufficientStock),
    (5,  6, InsufficientStock),
    (10, 0, ValueError),  # quantity=0 非法
])
async def test_order_edge_cases(order_service, stock, qty, expected_exc):
    product = MagicMock(stock=stock, price=Decimal("100"))
    order_service.product_repo.get_by_id = AsyncMock(return_value=product)
    with pytest.raises(expected_exc):
        await order_service.create_order(42, [{"product_id":1,"quantity":qty}])` },
];

export default function LessonProjects() {
  const navigate = useNavigate();
  const [activeFile, setActiveFile] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge">🚀 module_08 — 生产实战</div>

      <div className="py-hero">
        <h1>生产实战：构建电商 API 完整项目</h1>
        <p>把前七个模块的所有技术融合到一个真实项目中：<strong>商品管理 + 订单系统 + JWT 认证 + TDD 覆盖</strong>。这是你能直接用于生产的代码架构模板。</p>
      </div>

      {/* 四层架构 */}
      <div className="py-section">
        <h2 className="py-section-title">🏗️ 四层清洁架构</h2>
        <div className="py-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ARCH_LAYERS.map((l, i) => (
              <div key={l.layer} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0.875rem', borderRadius: '8px', border: `1px solid ${l.color}20`, background: `${l.color}06` }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: l.color, minWidth: 90, fontFamily: 'JetBrains Mono' }}>{l.layer}</span>
                <span style={{ fontSize: '0.78rem', color: '#3a5070', minWidth: 100 }}>{l.role}</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {l.items.map(item => <span key={item} className="py-tag" style={{ background: `${l.color}10`, color: l.color }}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#3a5070', lineHeight: '1.85', marginTop: '1rem', whiteSpace: 'pre' }}>{`
依赖方向：API → Service → Repository → Data（单向依赖）
项目结构：
ecommerce-api/
├── app/
│   ├── api/v1/          # API 路由层
│   ├── services/        # 业务逻辑层（核心）
│   ├── repositories/    # 数据访问层（ORM）
│   ├── models/          # SQLAlchemy 模型
│   ├── schemas/         # Pydantic 请求/响应模型
│   ├── core/            # 配置、依赖、安全
│   └── tasks/           # Celery 异步任务
├── tests/               # 测试（镜像 app/ 结构）
├── alembic/             # 数据库迁移
└── docker-compose.yml   # 本地开发环境`}</div>
        </div>
      </div>

      {/* 核心文件代码 */}
      <div className="py-section">
        <h2 className="py-section-title">💻 核心代码（切换查看）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {PROJECT_FILES.map((f, i) => (
            <button key={i} onClick={() => setActiveFile(i)}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '7px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'JetBrains Mono',
                border: `1px solid ${activeFile === i ? f.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeFile === i ? `${f.color}10` : 'rgba(255,255,255,0.02)',
                color: activeFile === i ? f.color : '#3a5070',
                display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="py-tag" style={{ background: `${f.color}15`, color: f.color, fontSize: '0.65rem' }}>{f.type}</span>
              {f.path.split('/').pop()}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#3a5070', fontFamily: 'JetBrains Mono', marginBottom: '0.4rem' }}>📁 {PROJECT_FILES[activeFile].path}</div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: PROJECT_FILES[activeFile].color }} />
            <span style={{ marginLeft: '0.5rem', color: PROJECT_FILES[activeFile].color }}>{PROJECT_FILES[activeFile].path}</span>
          </div>
          <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 440, overflow: 'auto' }}>{PROJECT_FILES[activeFile].code}</div>
        </div>
      </div>

      {/* 完成总结 */}
      <div className="py-section">
        <div className="py-card" style={{ background: 'linear-gradient(135deg, rgba(55,118,171,0.08), rgba(0,150,136,0.06))', borderColor: 'rgba(55,118,171,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#60a5fa', fontSize: '1.2rem', marginBottom: '1rem' }}>恭喜完成 Python 高级进阶全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {['✅ asyncio 事件循环与协程执行可视化', '✅ gather/Queue/Semaphore/TaskGroup 异步模式', '✅ FastAPI 路由/Pydantic 验证/响应模型', '✅ JWT 认证 + RBAC 权限 + 中间件', '✅ SQLAlchemy 2.0 Async ORM + N+1 消除', '✅ TDD 红绿重构 + pytest 四大测试类型', '✅ cProfile/Redis缓存/Celery 性能三件套', '✅ 电商 API 四层架构完整实战'].map(s => (
              <div key={s} style={{ fontSize: '0.875rem', color: '#3a5070' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/performance')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
