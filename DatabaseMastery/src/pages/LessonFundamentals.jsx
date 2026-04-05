import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DB_TYPES = [
  {
    name: 'MySQL / PostgreSQL',
    icon: '🗃️', type: '关系型（RDBMS）', color: '#F29111',
    pros: ['强事务（ACID）', '复杂查询/JOIN', '数据一致性高', '成熟生态工具'],
    cons: ['水平扩展困难', '固定 Schema', '大数据量性能下降'],
    usecases: ['电商订单', '用户账户', '金融交易', '内容管理'],
    structure: '表 → 行 → 列（固定 Schema）',
  },
  {
    name: 'Redis',
    icon: '🔴', type: 'K-V / 内存数据库', color: '#DC382D',
    pros: ['极低延迟（<1ms）', '丰富数据结构', '原子操作', '内置集群'],
    cons: ['数据量受内存限制', '不适合复杂查询', '持久化有开销'],
    usecases: ['缓存', '会话存储', '排行榜', '消息队列'],
    structure: 'Key → Value（String/Hash/List/Set/ZSet）',
  },
  {
    name: 'MongoDB',
    icon: '🍃', type: '文档型（NoSQL）', color: '#47A248',
    pros: ['灵活 Schema', '水平扩展强', 'JSON格式友好', '读写性能高'],
    cons: ['事务支持较弱', '数据冗余', '内存占用大'],
    usecases: ['日志存储', '内容平台', 'IoT数据', '目录管理'],
    structure: 'Collection → Document（BSON/JSON）',
  },
  {
    name: 'Elasticsearch',
    icon: '🔍', type: '搜索引擎', color: '#FEC514',
    pros: ['全文检索极强', '近实时索引', '分布式天然', '聚合分析'],
    cons: ['不适合事务', '数据仅追加', '运维复杂'],
    usecases: ['全文搜索', '日志分析(ELK)', '商品搜索', '监控'],
    structure: 'Index → Document（倒排索引）',
  },
];

const ACID = [
  { letter: 'A', name: 'Atomicity 原子性', icon: '⚛️', def: '事务中所有操作要么全部成功，要么全部回滚。银行转账：扣款和入账必须同时成功，不存在扣了款但没入账的情况。' },
  { letter: 'C', name: 'Consistency 一致性', icon: '⚖️', def: '事务执行前后，数据库始终满足所有约束规则。账户余额不能为负，外键引用必须存在——这些约束始终成立。' },
  { letter: 'I', name: 'Isolation 隔离性', icon: '🔒', def: '并发事务之间互不干扰。读未提交 → 读已提交 → 可重复读 → 串行化，隔离级别越高，并发性越低。' },
  { letter: 'D', name: 'Durability 持久性', icon: '💾', def: '事务提交后，数据不因宕机丢失。MySQL 通过 redo log（WAL）保证写入磁盘即持久化。' },
];

export default function LessonFundamentals() {
  const navigate = useNavigate();
  const [activeDb, setActiveDb] = useState(0);
  const [activeAcid, setActiveAcid] = useState(null);

  return (
    <div className="lesson-db">
      <div className="db-badge">🗃️ module_01 — 数据库基础</div>

      <div className="db-hero">
        <h1>数据库基础：关系型 vs NoSQL 选型指南</h1>
        <p>没有最好的数据库，只有最适合场景的数据库。<strong>MySQL 保证事务安全</strong>，<strong>Redis 追求极限性能</strong>，选错工具比写错代码的代价更大。</p>
      </div>

      {/* 数据库类型对比 */}
      <div className="db-section">
        <h2 className="db-section-title">🗺️ 主流数据库类型（点击查看详情）</h2>
        <div className="db-grid-4" style={{ marginBottom: '1rem' }}>
          {DB_TYPES.map((db, i) => (
            <div key={db.name} onClick={() => setActiveDb(i)}
              style={{ padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activeDb === i ? `${db.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeDb === i ? db.color + '50' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{db.icon}</div>
              <div style={{ fontWeight: 700, color: activeDb === i ? db.color : '#f5e6d0', fontSize: '0.85rem' }}>{db.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#4a3b28', marginTop: '0.15rem' }}>{db.type}</div>
            </div>
          ))}
        </div>

        {(() => {
          const db = DB_TYPES[activeDb];
          return (
            <div className="db-card" style={{ borderColor: `${db.color}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{db.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: db.color }}>{db.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4a3b28' }}>数据结构：{db.structure}</div>
                </div>
              </div>
              <div className="db-grid-3">
                <div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.82rem', marginBottom: '0.4rem' }}>✅ 优点</div>
                  {db.pros.map(p => <div key={p} style={{ fontSize: '0.8rem', color: '#a08060', marginBottom: '0.15rem' }}>• {p}</div>)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.82rem', marginBottom: '0.4rem' }}>⚠️ 局限</div>
                  {db.cons.map(c => <div key={c} style={{ fontSize: '0.8rem', color: '#a08060', marginBottom: '0.15rem' }}>• {c}</div>)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem', marginBottom: '0.4rem' }}>🎯 适用场景</div>
                  {db.usecases.map(u => <div key={u} style={{ fontSize: '0.8rem', color: '#a08060', marginBottom: '0.15rem' }}>• {u}</div>)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ACID 详解 */}
      <div className="db-section">
        <h2 className="db-section-title">🔐 ACID 四大特性（点击卡片展开详解）</h2>
        <div className="db-grid-4">
          {ACID.map((a, i) => (
            <div key={a.letter} onClick={() => setActiveAcid(activeAcid === i ? null : i)}
              style={{ padding: '1.25rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activeAcid === i ? 'rgba(242,145,17,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeAcid === i ? 'rgba(242,145,17,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F29111', marginBottom: '0.25rem' }}>{a.letter}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: activeAcid === i ? '#F29111' : '#f5e6d0' }}>{a.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
        {activeAcid !== null && (
          <div style={{ marginTop: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(242,145,17,0.06)', border: '1px solid rgba(242,145,17,0.2)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: '#F29111', marginBottom: '0.4rem' }}>{ACID[activeAcid].icon} {ACID[activeAcid].name}</div>
            <div style={{ fontSize: '0.85rem', color: '#a08060', lineHeight: 1.75 }}>{ACID[activeAcid].def}</div>
          </div>
        )}
      </div>

      {/* 选型决策树 */}
      <div className="db-section">
        <h2 className="db-section-title">🌲 数据库选型决策树</h2>
        <div className="db-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', lineHeight: '1.9', color: '#a08060', whiteSpace: 'pre' }}>{`
需要处理的数据是什么类型？
│
├── 结构化数据，需要 JOIN 和复杂查询？
│   └── ✅ MySQL / PostgreSQL（关系型）
│       ├── 需要地理空间查询？→ PostgreSQL + PostGIS
│       └── 普通业务系统？→ MySQL 8.x
│
├── 需要极低延迟（<1ms）和高吞吐？
│   └── ✅ Redis（内存数据库）
│       ├── 缓存？→ Redis + TTL 策略
│       ├── 排行榜？→ Redis Sorted Set
│       └── 消息队列？→ Redis Stream / 或换 Kafka
│
├── 数据结构灵活，Schema 频繁变化？
│   └── ✅ MongoDB（文档型）
│
└── 需要全文搜索或日志分析？
    └── ✅ Elasticsearch（搜索引擎）

⚠️ 真实系统通常混合使用：MySQL（主库）+ Redis（缓存）+ ES（搜索）`}</div>
        </div>
      </div>

      <div className="db-nav">
        <div />
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/mysql')}>下一模块：MySQL 核心 →</button>
      </div>
    </div>
  );
}
