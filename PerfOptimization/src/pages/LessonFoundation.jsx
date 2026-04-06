import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 交互式火焰图模拟器
const FLAME_DATA = [
  { name: 'main()', width: 100, depth: 0, pct: 100, hot: false, color: '#ef4444' },
  { name: 'http_handler()', width: 90, depth: 1, pct: 90, hot: false, color: '#f97316' },
  { name: 'process_request()', width: 75, depth: 2, pct: 75, hot: false, color: '#fbbf24' },
  { name: 'query_db()', width: 55, depth: 3, pct: 55, hot: true, color: '#ef4444' },   // HOT SPOT
  { name: 'mysql_execute()', width: 50, depth: 4, pct: 50, hot: true, color: '#dc2626' },
  { name: '[serialize]', width: 20, depth: 3, pct: 20, hot: false, color: '#22c55e' },
  { name: 'render_template()', width: 15, depth: 2, pct: 15, hot: false, color: '#3b82f6' },
  { name: 'middleware()', width: 10, depth: 1, pct: 10, hot: false, color: '#8b5cf6' },
];

function FlameGraph() {
  const [selected, setSelected] = useState(null);
  const [showOptimized, setShowOptimized] = useState(false);

  const optimizedData = FLAME_DATA.map(f =>
    f.name === 'query_db()' ? { ...f, width: 15, pct: 15, hot: false, color: '#22c55e' } :
    f.name === 'mysql_execute()' ? { ...f, width: 10, pct: 10, hot: false, color: '#22c55e' } :
    f
  );

  const data = showOptimized ? optimizedData : FLAME_DATA;

  return (
    <div className="po-interactive">
      <h3>🔥 交互式火焰图（点击函数查看详情）
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className={`po-btn ${showOptimized ? 'green' : ''}`} onClick={() => setShowOptimized(o => !o)} style={{ fontSize: '0.75rem' }}>
            {showOptimized ? '✅ 优化后' : '🔴 优化前'}
          </button>
        </div>
      </h3>

      {/* 火焰图主体（倒置火焰图：从底部向上是调用栈） */}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: '0.2rem', textAlign: 'right' }}>← 火焰越宽 = 占用 CPU 时间越长</div>
        {data.map((frame, i) => (
          <div key={i} style={{ marginBottom: '2px', paddingLeft: `${frame.depth * 12}px` }}>
            <div onClick={() => setSelected(selected === i ? null : i)}
              className={frame.hot ? 'po-hot' : ''}
              style={{ width: `${frame.width}%`, height: 26, display: 'flex', alignItems: 'center', paddingLeft: '0.5rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s',
                background: `${frame.color}${selected === i ? 'dd' : '55'}`,
                border: `1.5px solid ${selected === i ? frame.color : frame.color + '40'}`,
                fontWeight: selected === i ? 800 : 500, color: selected === i ? '#fff' : '#cbd5e1', fontSize: '0.65rem',
                boxShadow: frame.hot ? `0 0 8px ${frame.color}40` : 'none' }}>
              {frame.name}
              <span style={{ marginLeft: '0.4rem', opacity: 0.7 }}>{frame.pct}%</span>
              {frame.hot && <span style={{ marginLeft: '0.4rem', fontSize: '0.55rem', color: '#fcd34d' }}>🔥HOT</span>}
            </div>
          </div>
        ))}
      </div>

      {selected !== null && (
        <div style={{ padding: '0.625rem 0.875rem', background: `${data[selected].color}08`, border: `1px solid ${data[selected].color}25`, borderRadius: '8px', fontSize: '0.78rem' }}>
          <div style={{ fontWeight: 800, color: data[selected].color, marginBottom: '0.3rem' }}>{data[selected].name}</div>
          <div style={{ color: '#94a3b8', marginBottom: '0.2rem' }}>CPU 占比: <strong style={{ color: data[selected].color }}>{data[selected].pct}%</strong></div>
          {data[selected].hot && !showOptimized && (
            <div style={{ color: '#fcd34d', fontSize: '0.72rem' }}>
              ⚡ 热点！优化建议：① 添加 Redis 缓存（减少DB查询）② 添加索引 ③ 批量查询替代 N+1
            </div>
          )}
          {showOptimized && data[selected].pct < 20 && (
            <div style={{ color: '#22c55e', fontSize: '0.72rem' }}>✅ 已优化：加 Redis 缓存后 DB 查询从 55% → 15%</div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.68rem', flexWrap: 'wrap' }}>
        {[['🔴', '热点函数（需要优化）'], ['📊', '宽度=CPU占用时间'], ['↕️', '深度=调用栈层级'], ['✅', '点击「优化后」对比效果']].map(([ico, txt]) => (
          <span key={txt} style={{ color: '#475569' }}>{ico} {txt}</span>
        ))}
      </div>
    </div>
  );
}

const PERF_METHODS = [
  { name: 'USE 方法论', target: '系统资源', icon: '📊', color: '#ef4444', items: ['U - Utilization（利用率）：资源使用率 > 70% 告警', 'S - Saturation（饱和度）：等待队列是否积压', 'E - Errors（错误率）：是否有资源错误', '适用于：CPU、内存、磁盘、网络等硬件资源'] },
  { name: 'RED 方法论', target: '服务质量', icon: '🌐', color: '#f97316', items: ['R - Rate（请求率）：每秒处理的请求数', 'E - Errors（错误率）：失败请求占比', 'D - Duration（延迟）：请求处理时间 P50/P95/P99', '适用于：微服务、API、函数等服务层'] },
  { name: '火焰图分析', target: 'CPU热点', icon: '🔥', color: '#fbbf24', items: ['X轴=CPU时间占比，Y轴=调用栈深度', '找最宽的框（热点函数）', 'perf record -g → perf script → FlameGraph.pl', '结合采样率：通常 99Hz（每秒99次快照）'] },
  { name: 'Apdex 用户满意度', target: '用户体验', icon: '😊', color: '#22c55e', items: ['T=目标响应时间（如1秒）', '满意：响应 ≤ T（计1分）', '容忍：T < 响应 ≤ 4T（计0.5分）', 'Apdex = (满意 + 容忍×0.5) / 总请求'] },
];

const KEY_METRICS = [
  { name: 'P50（中位数）', val: '200ms', color: '#22c55e', desc: '50%用户的响应时间，代表"平均"体验' },
  { name: 'P95', val: '800ms', color: '#f97316', desc: '95%用户的响应时间，慢尾用户体验' },
  { name: 'P99', val: '2.4s', color: '#ef4444', desc: '99%用户，VIP用户通常关注此指标' },
  { name: 'P999', val: '8.1s', color: '#dc2626', desc: '极端慢请求，通常为GC停顿/锁等待' },
  { name: 'Throughput', val: '1200 RPS', color: '#3b82f6', desc: '每秒请求数，系统吞吐量' },
  { name: 'Error Rate', val: '0.12%', color: '#8b5cf6', desc: '5xx错误占总请求比例' },
];

export default function LessonFoundation() {
  const navigate = useNavigate();
  return (
    <div className="lesson-po">
      <div className="po-badge">⚡ module_01 — 性能分析基础</div>
      <div className="po-hero">
        <h1>性能分析基础：指标体系 / 火焰图 / USE/RED 方法论</h1>
        <p>性能优化不是"感觉哪里慢就改哪里"，而是<strong>测量驱动</strong>。先建立指标体系（P50/P99/TPS/Error Rate），用 USE/RED 方法论定位瓶颈层，用火焰图精确找到 CPU 热点函数，再针对性优化。</p>
      </div>

      <FlameGraph />

      <div className="po-section">
        <h2 className="po-section-title">📏 四大性能分析方法论</h2>
        <div className="po-grid-2">
          {PERF_METHODS.map(m => (
            <div key={m.name} className="po-card" style={{ borderColor: `${m.color}18` }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span>{m.icon}</span>
                <span style={{ fontWeight: 800, color: m.color, fontSize: '0.88rem' }}>{m.name}</span>
                <span style={{ fontSize: '0.62rem', color: '#475569', marginLeft: 'auto' }}>适用: {m.target}</span>
              </div>
              {m.items.map(it => <div key={it} style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: '0.15rem' }}>▸ {it}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="po-section">
        <h2 className="po-section-title">📊 核心性能指标仪表盘</h2>
        <div className="po-grid-3">
          {KEY_METRICS.map(m => (
            <div key={m.name} className="po-metric" style={{ borderColor: `${m.color}20` }}>
              <div className="po-metric-val" style={{ color: m.color }}>{m.val}</div>
              <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.72rem', margin: '0.15rem 0' }}>{m.name}</div>
              <div className="po-metric-label">{m.desc}</div>
            </div>
          ))}
        </div>
        <div className="po-card" style={{ marginTop: '0.75rem', background: 'rgba(239,68,68,0.03)' }}>
          <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.82rem', marginBottom: '0.5rem' }}>⚠️ 不要只看平均值（Average is a Lie!）</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.75 }}>
            假设10个请求延迟：[10,12,15,18,20,22,25,30,50,<strong style={{ color: '#ef4444' }}>3000</strong>] ms<br/>
            平均值 = 220ms（看起来还好）<br/>
            P99 = 3000ms（1%用户等待3秒！这才是问题所在）<br/>
            <span style={{ color: '#22c55e' }}>→ 始终关注 P95/P99，而非平均延迟</span>
          </div>
        </div>
      </div>

      <div className="po-nav">
        <div />
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/linux')}>下一模块：Linux 系统调优 →</button>
      </div>
    </div>
  );
}
