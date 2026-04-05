import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const NORMAL_FORMS = [
  { nf: '1NF', name: '第一范式', rule: '每列只存原子值（不可再分），每行有唯一主键', bad: 'phone: "13800,13900"（两个号存一格）', good: 'phone_1: "13800", phone_2: "13900"（或另建 phones 表）', color: '#F29111' },
  { nf: '2NF', name: '第二范式', rule: '满足 1NF，且非主键列必须完全依赖整个主键（消除部分依赖）', bad: '(order_id, product_id) 主键，但 product_name 只依赖 product_id', good: '拆出 products 表，订单只存 product_id', color: '#fbbf24' },
  { nf: '3NF', name: '第三范式', rule: '满足 2NF，且非主键列之间不存在传递依赖', bad: 'users 表里有 city_id 和 city_name（city_name 依赖 city_id）', good: '拆出 cities 表，users 只存 city_id', color: '#86efac' },
  { nf: 'BCNF', name: 'BC 范式', rule: '每个决定因素都是候选键，消除所有异常（比 3NF 更严格）', bad: '老师-课程-教室，"教室" 决定 "老师" 但不是候选键', good: '分解为：老师-课程 表 + 老师-教室 表', color: '#a78bfa' },
];

const SHARDING = [
  {
    name: '垂直分库',
    icon: '📦',
    desc: '按业务模块拆分数据库。用户库、订单库、商品库分别部署。',
    diagram: `单数据库                    垂直分库
┌─────────────┐        ┌─────┐ ┌──────┐ ┌──────┐
│  users      │   →    │ 用户│ │ 订单 │ │ 商品 │
│  orders     │        │  DB │ │  DB  │ │  DB  │
│  products   │        └─────┘ └──────┘ └──────┘
└─────────────┘        每个DB 只负责一个业务域`,
    pros: '解耦模块，不同业务可独立扩展', cons: '跨库 JOIN 复杂，分布式事务困难',
  },
  {
    name: '水平分表',
    icon: '🗂️',
    desc: '同一张表按行拆分到多个表。如 orders_2023、orders_2024，或按 user_id % 4 分表。',
    diagram: `orders 单表                 水平分表
┌─────────────┐        ┌──────────┐┌──────────┐
│ 10亿行数据  │   →    │orders_0  ││orders_1  │
│ 查询极慢    │        │(uid%4=0) ││(uid%4=1) │
│ 索引失效    │        └──────────┘└──────────┘
└─────────────┘        ┌──────────┐┌──────────┐
                        │orders_2  ││orders_3  │
                        └──────────┘└──────────┘`,
    pros: '解决单表数据量过大问题', cons: '分片键选择错误会导致数据热点',
  },
];

export default function LessonDesign() {
  const navigate = useNavigate();
  const [activeNF, setActiveNF] = useState(0);
  const [activeShard, setActiveShard] = useState(0);
  const [checklist, setChecklist] = useState({});
  const toggleCheck = i => setChecklist(p => ({ ...p, [i]: !p[i] }));

  const DESIGN_CHECKLIST = [
    '主键使用 BIGINT AUTO_INCREMENT（或分布式 ID 如 Snowflake）',
    '所有时间字段使用 DATETIME 而非 TIMESTAMP（避免 2038 问题）',
    '金额字段使用 DECIMAL(15,4)，禁止 FLOAT/DOUBLE',
    '字符集统一为 utf8mb4，排序规则 utf8mb4_unicode_ci',
    '每张表必须有 created_at 和 updated_at 字段',
    '软删除使用 deleted_at IS NULL，而非 DELETE 物理删除',
    '外键在应用层而非数据库层维护（分库分表不支持跨库外键）',
    '为高频 WHERE/ORDER BY 字段建立合适的索引',
    '单表数据量预计超过 2000万行时，提前规划分表策略',
    '通过 EXPLAIN 验证所有关键查询的执行计划',
  ];

  return (
    <div className="lesson-db">
      <div className="db-badge">📐 module_07 — 数据库设计</div>

      <div className="db-hero">
        <h1>数据库设计：范式、ER 图与分库分表</h1>
        <p>好的数据库设计是系统性能的基石。<strong>三大范式</strong>指导你建模，<strong>分库分表</strong>解决海量数据，<strong>设计清单</strong>让你少踩 90% 的坑。</p>
      </div>

      {/* 三大范式 */}
      <div className="db-section">
        <h2 className="db-section-title">📚 数据库范式（点击展开详解）</h2>
        <div className="db-grid-4" style={{ marginBottom: '1rem' }}>
          {NORMAL_FORMS.map((nf, i) => (
            <div key={nf.nf} onClick={() => setActiveNF(i)}
              style={{ padding: '1.1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activeNF === i ? `${nf.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeNF === i ? nf.color + '50' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: nf.color }}>{nf.nf}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: activeNF === i ? nf.color : '#f5e6d0', marginTop: '0.2rem' }}>{nf.name}</div>
            </div>
          ))}
        </div>
        <div className="db-card" style={{ borderColor: `${NORMAL_FORMS[activeNF].color}25` }}>
          <h3 style={{ color: NORMAL_FORMS[activeNF].color }}>{NORMAL_FORMS[activeNF].nf} — {NORMAL_FORMS[activeNF].name}</h3>
          <p><strong style={{ color: '#f5e6d0' }}>规则：</strong>{NORMAL_FORMS[activeNF].rule}</p>
          <div className="db-grid-2" style={{ marginTop: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.8rem', marginBottom: '0.3rem' }}>❌ 违反示例</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#a08060', padding: '0.6rem', background: 'rgba(239,68,68,0.05)', borderRadius: '6px' }}>{NORMAL_FORMS[activeNF].bad}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.8rem', marginBottom: '0.3rem' }}>✅ 规范做法</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#a08060', padding: '0.6rem', background: 'rgba(16,185,129,0.05)', borderRadius: '6px' }}>{NORMAL_FORMS[activeNF].good}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 电商 ER 图 */}
      <div className="db-section">
        <h2 className="db-section-title">🗺️ 电商系统 ER 图（核心 6 张表）</h2>
        <div className="db-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#a08060', lineHeight: '1.85', whiteSpace: 'pre' }}>{`
  users (用户)          categories (分类)
  ┌──────────┐          ┌─────────────┐
  │ id PK    │          │ id PK       │
  │ username │          │ name        │
  │ email    │    ┌─────│ parent_id FK│ ← 自关联（多级分类）
  │ status   │    │     └─────────────┘
  └────┬─────┘    │
       │          │     products (商品)
       │1         │     ┌─────────────────┐
       │N         └────►│ id PK           │
  orders (订单)         │ category_id FK  │
  ┌──────────────┐      │ name, price     │
  │ id PK        │      │ stock           │
  │ user_id FK   │      └───────┬─────────┘
  │ status       │              │
  │ total        │           1  │N
  │ created_at   │      ┌───────▼──────────┐
  └──────┬───────┘      │ order_items (订单详情) │
         │1             │ id PK            │
         │N             │ order_id FK      │
         └─────────────►│ product_id FK    │
                         │ quantity, price  │
                         └──────────────────┘

  数量关系：1用户 → 多订单，1订单 → 多商品（M:N 通过 order_items 实现）`}</div>
        </div>
      </div>

      {/* 分库分表 */}
      <div className="db-section">
        <h2 className="db-section-title">🔀 分库分表策略</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          {SHARDING.map((s, i) => (
            <button key={s.name} className={`db-btn ${activeShard === i ? 'primary' : ''}`}
              onClick={() => setActiveShard(i)} style={{ flex: 1 }}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
        <div className="db-card">
          <p style={{ marginBottom: '0.75rem' }}>{SHARDING[activeShard].desc}</p>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#a08060', lineHeight: '1.75', whiteSpace: 'pre', padding: '0.875rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '0.75rem' }}>{SHARDING[activeShard].diagram}</div>
          <div className="db-grid-2">
            <div><span style={{ color: '#34d399', fontWeight: 700 }}>✅ </span><span style={{ fontSize: '0.82rem', color: '#a08060' }}>{SHARDING[activeShard].pros}</span></div>
            <div><span style={{ color: '#f87171', fontWeight: 700 }}>⚠️ </span><span style={{ fontSize: '0.82rem', color: '#a08060' }}>{SHARDING[activeShard].cons}</span></div>
          </div>
        </div>
      </div>

      {/* 设计清单 */}
      <div className="db-section">
        <h2 className="db-section-title">✅ 数据库设计清单（{Object.values(checklist).filter(Boolean).length}/{DESIGN_CHECKLIST.length} 完成）</h2>
        <div className="db-meter" style={{ marginBottom: '0.75rem' }}>
          <div className="db-meter-fill" style={{ width: `${(Object.values(checklist).filter(Boolean).length / DESIGN_CHECKLIST.length) * 100}%`, background: 'linear-gradient(90deg, #c46d00, #F29111)' }} />
        </div>
        {DESIGN_CHECKLIST.map((item, i) => (
          <div key={i} onClick={() => toggleCheck(i)}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.4rem', transition: 'all 0.15s',
              background: checklist[i] ? 'rgba(242,145,17,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${checklist[i] ? 'rgba(242,145,17,0.3)' : 'rgba(255,255,255,0.05)'}`,
            }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${checklist[i] ? '#F29111' : '#2a1a00'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: checklist[i] ? '#F29111' : 'transparent', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
              {checklist[i] ? '✓' : ''}
            </div>
            <div style={{ fontSize: '0.85rem', color: checklist[i] ? '#F29111' : '#a08060' }}>{item}</div>
          </div>
        ))}
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/redisadvanced')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/projects')}>下一模块：实战项目 →</button>
      </div>
    </div>
  );
}
