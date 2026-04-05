import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 模拟 Grafana 指标数据
function useMockMetrics() {
  const [metrics, setMetrics] = useState({ cpu: 42, mem: 68, rps: 1240, latency: 23, errors: 0.12 });
  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(m => ({
        cpu:     Math.max(5,  Math.min(95,  m.cpu     + (Math.random()-0.5)*8)),
        mem:     Math.max(20, Math.min(90,  m.mem     + (Math.random()-0.5)*4)),
        rps:     Math.max(50, Math.min(3000, m.rps    + (Math.random()-0.5)*200)),
        latency: Math.max(5,  Math.min(500, m.latency + (Math.random()-0.5)*15)),
        errors:  Math.max(0,  Math.min(5,   m.errors  + (Math.random()-0.5)*0.3)),
      }));
    }, 1500);
    return () => clearInterval(t);
  }, []);
  return metrics;
}

const PROM_EXAMPLES = [
  { name: 'CPU 使用率', query: 'rate(container_cpu_usage_seconds_total[5m]) * 100', desc: '过去 5 分钟 CPU 使用率' },
  { name: '内存使用', query: 'container_memory_usage_bytes / 1024 / 1024', desc: '容器内存使用（MB）' },
  { name: '请求速率', query: 'rate(http_requests_total[1m])', desc: '每秒 HTTP 请求数' },
  { name: 'P99 延迟', query: 'histogram_quantile(0.99, rate(http_duration_seconds_bucket[5m]))', desc: '99% 请求的响应时间' },
  { name: '错误率', query: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100', desc: '5xx 错误占总请求的百分比' },
];

export default function LessonObservability() {
  const navigate = useNavigate();
  const metrics = useMockMetrics();
  const [activeQuery, setActiveQuery] = useState(0);
  const [logLevel, setLogLevel] = useState('all');

  const LOGS = [
    { time: '08:32:01', level: 'INFO',  msg: 'api-pod-7f8d  GET /api/users 200 23ms', svc: 'api' },
    { time: '08:32:03', level: 'INFO',  msg: 'api-pod-7f8d  POST /api/auth/login 200 45ms', svc: 'api' },
    { time: '08:32:05', level: 'WARN',  msg: 'db-pod-a1b2   Slow query detected: 2340ms', svc: 'db' },
    { time: '08:32:07', level: 'ERROR', msg: 'api-pod-3c4d   Connection refused: redis:6379', svc: 'api' },
    { time: '08:32:09', level: 'INFO',  msg: 'nginx-pod-9e1f  GET / 304 2ms', svc: 'nginx' },
    { time: '08:32:11', level: 'INFO',  msg: 'api-pod-7f8d  GET /api/courses 200 67ms', svc: 'api' },
    { time: '08:32:13', level: 'WARN',  msg: 'api-pod-3c4d   High memory usage: 78%', svc: 'api' },
    { time: '08:32:15', level: 'ERROR', msg: 'api-pod-3c4d   Panic: runtime error: index out of range', svc: 'api' },
    { time: '08:32:17', level: 'INFO',  msg: 'kubelet          Pod api-pod-3c4d restarted (CrashLoopBackOff)', svc: 'k8s' },
  ];

  const filtered = LOGS.filter(l => logLevel === 'all' || l.level === logLevel);
  const levelColor = { INFO: '#34d399', WARN: '#fbbf24', ERROR: '#f87171' };

  const MetricCard = ({ label, value, unit, max, warn, critical, fmt }) => {
    const pct = Math.min(100, (value / max) * 100);
    const color = value >= critical ? '#ef4444' : value >= warn ? '#f59e0b' : '#10b981';
    return (
      <div className="dk-card" style={{ borderColor: `${color}30` }}>
        <div style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.6rem', fontWeight: 900, color, marginBottom: '0.5rem' }}>
          {fmt ? fmt(value) : value.toFixed(1)}<span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.2rem' }}>{unit}</span>
        </div>
        <div className="dk-meter">
          <div className="dk-meter-fill" style={{ width: `${pct}%`, background: color, transition: 'all 0.8s' }} />
        </div>
      </div>
    );
  };

  return (
    <div className="lesson-dk">
      <div className="dk-badge">👁️ module_07 — 可观测性</div>

      <div className="dk-hero">
        <h1>可观测性：Prometheus、Grafana 与日志聚合</h1>
        <p>可观测性三支柱：<strong>指标（Metrics）</strong>告诉你发生了什么，<strong>日志（Logs）</strong>说明为什么发生，<strong>追踪（Traces）</strong>告诉在哪里发生。缺一不可。</p>
      </div>

      {/* 实时 Grafana 仪表盘模拟 */}
      <div className="dk-section">
        <h2 className="dk-section-title">📊 实时监控仪表盘（数据每 1.5 秒刷新）</h2>
        <div style={{ padding: '1rem', background: '#020b14', border: '1px solid rgba(13,183,237,0.2)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(13,183,237,0.05)', borderRadius: '6px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>NexusLearn Production Cluster — Grafana Live Dashboard</span>
          </div>
          <div className="dk-grid-4">
            <MetricCard label="CPU 使用率" value={metrics.cpu} unit="%" max={100} warn={70} critical={85} />
            <MetricCard label="内存使用率" value={metrics.mem} unit="%" max={100} warn={75} critical={90} />
            <MetricCard label="请求速率" value={metrics.rps} unit="RPS" max={3000} warn={2000} critical={2800} fmt={v => Math.round(v)} />
            <MetricCard label="P99 延迟" value={metrics.latency} unit="ms" max={500} warn={100} critical={300} />
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: metrics.errors > 1 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${metrics.errors > 1 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1rem' }}>{metrics.errors > 1 ? '🔴' : '🟢'}</span>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: metrics.errors > 1 ? '#f87171' : '#34d399', fontSize: '0.9rem' }}>错误率：{metrics.errors.toFixed(2)}%</div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{metrics.errors > 1 ? '⚠️ 超过告警阈值 1%，触发 PagerDuty 通知' : '✅ 错误率正常'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Prometheus PromQL */}
      <div className="dk-section">
        <h2 className="dk-section-title">🔍 Prometheus PromQL 查询语言</h2>
        <div className="dk-interactive">
          <h3>
            常用查询示例
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PROM_EXAMPLES.map((p, i) => (
                <button key={i} className={`dk-btn ${activeQuery === i ? 'primary' : ''}`}
                  onClick={() => setActiveQuery(i)} style={{ fontSize: '0.78rem' }}>{p.name}</button>
              ))}
            </div>
          </h3>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>
            📖 {PROM_EXAMPLES[activeQuery].desc}
          </div>
          <div style={{ padding: '1rem', background: '#010c18', border: '1px solid rgba(13,183,237,0.2)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: '#0db7ed', wordBreak: 'break-all' }}>
            {PROM_EXAMPLES[activeQuery].query}
          </div>
        </div>
      </div>

      {/* 日志聚合 */}
      <div className="dk-section">
        <h2 className="dk-section-title">📋 集中式日志（Loki / ELK Stack）</h2>
        <div className="dk-interactive">
          <h3>
            日志流过滤
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[['all', '全部'], ['INFO', 'INFO'], ['WARN', 'WARN'], ['ERROR', 'ERROR']].map(([l, label]) => (
                <button key={l} className={`dk-btn ${logLevel === l ? 'primary' : ''}`} onClick={() => setLogLevel(l)}
                  style={{ fontSize: '0.75rem', color: l === 'INFO' ? '#34d399' : l === 'WARN' ? '#fbbf24' : l === 'ERROR' ? '#f87171' : undefined }}>{label}</button>
              ))}
            </div>
          </h3>
          <div style={{ background: '#010c18', border: '1px solid rgba(13,183,237,0.15)', borderRadius: '8px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
            {filtered.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                <span style={{ color: '#334155', flexShrink: 0 }}>{l.time}</span>
                <span style={{ color: levelColor[l.level] || '#94a3b8', fontWeight: 700, width: 40, flexShrink: 0 }}>{l.level}</span>
                <span className="dk-tag docker" style={{ fontSize: '0.65rem', flexShrink: 0, padding: '0.1rem 0.4rem' }}>{l.svc}</span>
                <span style={{ color: '#94a3b8' }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 三支柱对比 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🔭 可观测性三支柱 + 工具推荐</h2>
        <div className="dk-grid-3">
          {[
            { name: '指标（Metrics）', icon: '📊', color: '#0db7ed', tools: ['Prometheus', 'Grafana', 'VictoriaMetrics', 'Datadog'], use: '量化系统状态，支持告警规则，适合 Dashboard 展示' },
            { name: '日志（Logs）', icon: '📋', color: '#10b981', tools: ['Loki + Grafana', 'ELK Stack', 'Fluentd', 'CloudWatch'], use: '记录事件详情，排查问题根因，需要结构化（JSON格式）' },
            { name: '链路追踪（Traces）', icon: '🕵️', color: '#a78bfa', tools: ['Jaeger', 'Zipkin', 'Tempo', 'AWS X-Ray'], use: '追踪请求在微服务间的完整路径，找出性能瓶颈服务' },
          ].map(p => (
            <div key={p.name} className="dk-card" style={{ borderColor: `${p.color}25` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{p.icon}</div>
              <h3 style={{ color: p.color }}>{p.name}</h3>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.6 }}>{p.use}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {p.tools.map(t => <span key={t} className="dk-tag docker" style={{ background: `${p.color}10`, color: p.color, fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/k8sadvanced')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/production')}>下一模块：生产实战 →</button>
      </div>
    </div>
  );
}
