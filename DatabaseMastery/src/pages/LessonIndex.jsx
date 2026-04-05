import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const INDEX_TYPES = [
  {
    name: 'B+Tree 索引', icon: '🌳', color: '#F29111',
    desc: 'MySQL 默认索引结构，叶子节点存储数据，支持范围查询、ORDER BY',
    goodFor: ['等值查询 =', '范围查询 BETWEEN/>/< ', 'ORDER BY 排序', 'GROUP BY 分组'],
    badFor: ['函数计算列 YEAR(created_at)', 'LIKE "%xxx"（前缀模糊）', '列值区分度低（如性别）'],
  },
  {
    name: '联合索引', icon: '🔗', color: '#fbbf24',
    desc: '多列组成一个索引，遵循最左前缀规则，设计好可替代多个单列索引',
    goodFor: ['多条件联合查询', '覆盖索引（无需回表）', '减少索引数量'],
    badFor: ['跳过最左列查询', '跨列范围查询后的列'],
  },
  {
    name: '全文索引', icon: '🔍', color: '#93c5fd',
    desc: 'FULLTEXT，支持自然语言全文搜索，适合文章内容检索（生产建议用 ES）',
    goodFor: ['文章内容搜索', 'MATCH...AGAINST 语法'],
    badFor: ['比 ES 功能弱', '不支持中文分词（需插件）'],
  },
];

const EXPLAIN_FIELDS = [
  { field: 'type', worst: ['ALL（全表扫描！）', 'index（全索引扫描）'], best: ['const', 'eq_ref', 'ref', 'range'] },
  { field: 'key', desc: '实际使用的索引名称，NULL 表示无索引' },
  { field: 'rows', desc: '预估扫描行数，越小越好（优化目标）' },
  { field: 'Extra', important: ['Using index（覆盖索引✅）', 'Using filesort（需要优化⚠️）', 'Using temporary（极差❌）'] },
];

const BAD_GOOD = [
  {
    title: '❌ 索引失效：函数操作',
    bad:  "SELECT * FROM orders WHERE YEAR(created_at) = 2024;",
    good: "SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';",
    why: "函数操作导致索引失效，改用范围查询完全可以用上索引",
  },
  {
    title: '❌ 索引失效：隐式类型转换',
    bad:  "SELECT * FROM users WHERE phone = 13800138000;  -- phone 是 VARCHAR",
    good: "SELECT * FROM users WHERE phone = '13800138000';",
    why: "字符串列用数字查询，MySQL 会隐式转换，导致索引失效全表扫描",
  },
  {
    title: '❌ 深分页问题',
    bad:  "SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;  -- 扫描100W行！",
    good: "-- 游标分页（主键翻页法）\nSELECT * FROM orders WHERE id > 最后一页最大id ORDER BY id LIMIT 10;",
    why: "OFFSET 越大扫描越多，游标法始终 O(1)，适合移动端无限滚动",
  },
  {
    title: '❌ SELECT * 问题',
    bad:  "SELECT * FROM products;  -- 带出所有列，无法用覆盖索引",
    good: "SELECT id, name, price FROM products;  -- 只取需要的列\n-- 如果 (id, name, price) 刚好是联合索引 → 覆盖索引，无需回表",
    why: "覆盖索引（只查索引不回表）是最快的查询方式，前提是不使用 SELECT *",
  },
];

export default function LessonIndex() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeBad, setActiveBad] = useState(0);

  const EXPLAIN_OUTPUT = `mysql> EXPLAIN SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;

+----+-------------+--------+------+----------------+----------------+---------+-------+------+-------------+
| id | select_type | table  | type | possible_keys  | key            | key_len | rows  | ref  | Extra       |
+----+-------------+--------+------+----------------+----------------+---------+-------+------+-------------+
|  1 | SIMPLE      | orders | ref  | idx_user_date  | idx_user_date  | 8       | 12    | const| Using index |
+----+-------------+--------+------+----------------+----------------+---------+-------+------+-------------+

解读：
type=ref      ✅ 使用了索引（非全表扫描）
key=idx_user_date ✅ 使用了联合索引 (user_id, created_at)
rows=12       ✅ 仅预估扫描12行
Extra=Using index ✅ 覆盖索引！无需回表，极快`;

  return (
    <div className="lesson-db">
      <div className="db-badge">⚡ module_04 — 索引与优化</div>

      <div className="db-hero">
        <h1>索引与优化：EXPLAIN 执行计划深度剖析</h1>
        <p>索引是数据库性能的核心。一条 SQL 从 3 秒变成 3 毫秒，99% 都是靠正确的索引设计——而不是换硬件。</p>
      </div>

      {/* 索引类型 */}
      <div className="db-section">
        <h2 className="db-section-title">🗂️ MySQL 索引类型（点击查看）</h2>
        <div className="db-grid-3" style={{ marginBottom: '1rem' }}>
          {INDEX_TYPES.map((t, i) => (
            <div key={t.name} onClick={() => setActiveIdx(i)}
              style={{ padding: '1.1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activeIdx === i ? `${t.color}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeIdx === i ? t.color + '45' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{t.icon}</div>
              <div style={{ fontWeight: 700, color: activeIdx === i ? t.color : '#f5e6d0', fontSize: '0.9rem' }}>{t.name}</div>
            </div>
          ))}
        </div>
        {(() => {
          const t = INDEX_TYPES[activeIdx];
          return (
            <div className="db-card" style={{ borderColor: `${t.color}25` }}>
              <h3 style={{ color: t.color }}>{t.icon} {t.name}</h3>
              <p style={{ marginBottom: '1rem' }}>{t.desc}</p>
              <div className="db-grid-2">
                <div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.82rem', marginBottom: '0.4rem' }}>✅ 适合</div>
                  {t.goodFor.map(g => <div key={g} style={{ fontSize: '0.8rem', color: '#a08060', marginBottom: '0.2rem', fontFamily: 'JetBrains Mono' }}>• {g}</div>)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.82rem', marginBottom: '0.4rem' }}>⚠️ 不适合</div>
                  {t.badFor.map(b => <div key={b} style={{ fontSize: '0.8rem', color: '#a08060', marginBottom: '0.2rem', fontFamily: 'JetBrains Mono' }}>• {b}</div>)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* EXPLAIN 分析 */}
      <div className="db-section">
        <h2 className="db-section-title">🔍 EXPLAIN 执行计划解读</h2>
        <div className="db-sql-wrapper">
          <div className="db-sql-header">
            <div className="db-sql-dot" style={{ background: '#ef4444' }} />
            <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
            <div className="db-sql-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>MySQL EXPLAIN 输出</span>
          </div>
          <div className="db-sql" style={{ fontSize: '0.73rem', maxHeight: 300, overflow: 'auto' }}>{EXPLAIN_OUTPUT}</div>
        </div>
        <div className="db-grid-2" style={{ marginTop: '0.75rem' }}>
          {[
            { key: 'type', values: [{ v: 'ALL', c: '#ef4444', d: '全表扫描，最差！' }, { v: 'index', c: '#f97316', d: '全索引扫描' }, { v: 'range', c: '#fbbf24', d: '范围查询' }, { v: 'ref', c: '#86efac', d: '非唯一索引' }, { v: 'const', c: '#34d399', d: '主键/唯一，最快' }] },
            { key: 'Extra', values: [{ v: 'Using index', c: '#34d399', d: '覆盖索引 ✅' }, { v: 'Using where', c: '#86efac', d: '索引后再过滤' }, { v: 'Using filesort', c: '#fbbf24', d: '文件排序 ⚠️' }, { v: 'Using temporary', c: '#ef4444', d: '临时表 ❌' }] },
          ].map(col => (
            <div key={col.key} className="db-card" style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#F29111', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{col.key} 字段</div>
              {col.values.map(v => (
                <div key={v.v} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: v.c, fontWeight: 700, minWidth: 100 }}>{v.v}</span>
                  <span style={{ fontSize: '0.78rem', color: '#4a3b28' }}>{v.d}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 索引优化实战 */}
      <div className="db-section">
        <h2 className="db-section-title">🛠️ 索引优化实战：慢 SQL 改写</h2>
        <div className="db-interactive">
          <h3>
            典型错误案例
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {BAD_GOOD.map((b, i) => (
                <button key={i} className={`db-btn ${activeBad === i ? 'primary' : ''}`}
                  onClick={() => setActiveBad(i)} style={{ fontSize: '0.75rem' }}>案例 {i+1}</button>
              ))}
            </div>
          </h3>
          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{BAD_GOOD[activeBad].title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, marginBottom: '0.3rem' }}>❌ 错误写法</div>
              <div className="db-sql-wrapper">
                <div className="db-sql" style={{ fontSize: '0.73rem' }}>{BAD_GOOD[activeBad].bad}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, marginBottom: '0.3rem' }}>✅ 正确写法</div>
              <div className="db-sql-wrapper">
                <div className="db-sql" style={{ fontSize: '0.73rem' }}>{BAD_GOOD[activeBad].good}</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(242,145,17,0.06)', border: '1px solid rgba(242,145,17,0.2)', borderRadius: '8px', fontSize: '0.82rem', color: '#a08060' }}>
            💡 {BAD_GOOD[activeBad].why}
          </div>
        </div>
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/sqladvanced')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/redis')}>下一模块：Redis 核心 →</button>
      </div>
    </div>
  );
}
