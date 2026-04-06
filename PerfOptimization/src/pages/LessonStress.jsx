import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 实时压测模拟器（响应时间分布）
function StressSimulator() {
  const [running, setRunning] = useState(false);
  const [vus, setVus] = useState(50);
  const [duration, setDuration] = useState(0);
  const [results, setResults] = useState({ p50: 0, p95: 0, p99: 0, tps: 0, errors: 0, total: 0 });
  const [histogram, setHistogram] = useState(Array(20).fill(0));
  const timer = useRef(null);

  const simulate = () => {
    const p50base = 80 + vus * 0.5;
    const p95base = 200 + vus * 1.8;
    const p99base = 500 + vus * 4;
    const tps = Math.max(10, 1000 / (p50base / vus));
    const errRate = vus > 200 ? (vus - 200) * 0.0005 : 0;

    setResults({
      p50: Math.round(p50base + (Math.random() - 0.5) * 20),
      p95: Math.round(p95base + (Math.random() - 0.5) * 40),
      p99: Math.round(p99base + (Math.random() - 0.5) * 80),
      tps: Math.round(tps * (1 + (Math.random() - 0.5) * 0.1)),
      errors: parseFloat((errRate * 100).toFixed(2)),
      total: Math.round(tps * duration),
    });

    setHistogram(prev => {
      const buckets = [...prev];
      const peakBucket = Math.min(Math.floor(p50base / 50), 19);
      for (let i = 0; i < 20; i++) {
        const dist = Math.abs(i - peakBucket);
        buckets[i] = Math.max(5, Math.round(100 * Math.exp(-dist * dist * 0.3) + (Math.random() - 0.5) * 10));
      }
      return buckets;
    });
  };

  const start = () => {
    setRunning(true);
    setDuration(0);
    let tick = 0;
    timer.current = setInterval(() => {
      tick++;
      setDuration(tick);
      simulate();
      if (tick >= 30) { clearInterval(timer.current); setRunning(false); }
    }, 500);
  };

  const stop = () => { clearInterval(timer.current); setRunning(false); };

  useEffect(() => () => clearInterval(timer.current), []);

  const maxH = Math.max(...histogram, 1);
  const isOverloaded = vus > 200;

  return (
    <div className="po-interactive">
      <h3>📈 压测模拟器（k6 风格）
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className={`po-btn ${running ? '' : 'primary'}`} onClick={running ? stop : start} style={{ fontSize: '0.75rem' }}>
            {running ? '⏹ 停止' : '▶ 开始压测'}
          </button>
        </div>
      </h3>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
            并发虚拟用户数（VUs）: <span style={{ color: isOverloaded ? '#ef4444' : '#22c55e', fontWeight: 700 }}>{vus}</span>
            {isOverloaded && <span style={{ color: '#ef4444', fontSize: '0.65rem' }}> ⚠️ 超过容量阈值！</span>}
          </div>
          <input type="range" min={10} max={500} step={10} value={vus}
            onChange={e => setVus(Number(e.target.value))}
            style={{ width: '100%', accentColor: isOverloaded ? '#ef4444' : '#22c55e' }} />
        </div>
        <div style={{ fontSize: '0.68rem', color: '#334155' }}>
          测试时长: <span style={{ fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>{duration}/30s</span>
        </div>
      </div>

      {/* 指标 */}
      <div className="po-grid-4" style={{ marginBottom: '0.75rem' }}>
        {[
          ['P50', `${results.p50}ms`, results.p50 > 200 ? '#ef4444' : '#22c55e'],
          ['P95', `${results.p95}ms`, results.p95 > 500 ? '#ef4444' : results.p95 > 200 ? '#f97316' : '#22c55e'],
          ['P99', `${results.p99}ms`, results.p99 > 1000 ? '#ef4444' : '#f97316'],
          ['TPS', `${results.tps}/s`, '#3b82f6'],
          ['错误率', `${results.errors}%`, results.errors > 1 ? '#ef4444' : '#22c55e'],
          ['总请求', results.total.toLocaleString(), '#8b5cf6'],
        ].map(([label, val, color]) => (
          <div key={label} className="po-metric" style={{ borderColor: `${color}20` }}>
            <div className="po-metric-val" style={{ color, fontSize: '1.1rem' }}>{val || '--'}</div>
            <div className="po-metric-label" style={{ marginTop: '0.15rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 响应时间分布直方图 */}
      {results.total > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', color: '#475569', marginBottom: '0.25rem' }}>响应时间分布直方图（ms）</div>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: 60 }}>
            {histogram.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', height: (h / maxH * 56), borderRadius: '2px 2px 0 0', transition: 'height 0.3s',
                  background: i < 8 ? '#22c55e' : i < 14 ? '#f97316' : '#ef4444' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#334155', marginTop: '0.1rem' }}>
            <span>0ms</span><span>250ms</span><span>500ms</span><span>750ms</span><span>1000ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

const STRESS_CODE = `# k6 + Locust 压测 + SLO 容量规划

# ── 1. k6 压测脚本（JavaScript）──
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate  = new Rate('errors');
const p99Latency = new Trend('p99_latency', true);

export const options = {
  stages: [
    { duration: '2m',  target: 50  },   // 预热：2分钟爬升到50 VUs
    { duration: '5m',  target: 200 },   // 压力测试：5分钟保持200 VUs
    { duration: '2m',  target: 500 },   // 峰值：500 VUs（模拟活动秒杀）
    { duration: '2m',  target: 0   },   // 缓降
  ],
  thresholds: {                         // SLO 门槛（超过则测试失败！）
    'http_req_duration': ['p99<1000'],  // P99 < 1秒
    'http_req_failed':   ['rate<0.01'], // 错误率 < 1%
    'p99_latency':       ['p99<800'],   // 自定义 P99 < 800ms
  },
};

export default function () {
  const res = http.get('https://api.example.com/products', {
    headers: { Authorization: \`Bearer \${__ENV.API_TOKEN}\` },
    timeout: '5s',
  });

  check(res, {
    'status 200':        (r) => r.status === 200,
    'body has data':     (r) => r.json('data') !== undefined,
    'latency < 500ms':   (r) => r.timings.duration < 500,
  });

  errorRate.add(res.status !== 200);
  p99Latency.add(res.timings.duration);

  sleep(1);   // 每个 VU 每秒一个请求
}

# ── 2. Locust 压测（Python）──
from locust import HttpUser, task, between, events

class APIUser(HttpUser):
    wait_time = between(0.5, 2.0)    # 请求间隔 0.5-2 秒
    
    def on_start(self):
        # 登录获取 token
        resp = self.client.post("/auth/login", json={"user": "test", "pass": "test"})
        self.token = resp.json()["token"]
    
    @task(3)    # 权重 3（高频接口）
    def get_products(self):
        self.client.get("/api/products", headers={"Authorization": f"Bearer {self.token}"})
    
    @task(1)    # 权重 1（低频接口）
    def create_order(self):
        self.client.post("/api/orders", json={"product_id": 123, "qty": 1},
            headers={"Authorization": f"Bearer {self.token}"})

# locust -f locustfile.py --host http://api.example.com --headless -u 200 -r 10 -t 5m

# ── 3. SLO/SLA 定义与容量规划 ──
# SLO（Service Level Objective）：服务级别目标
# SLA（Service Level Agreement）：含赔偿条款的合同

# 典型 SLO 设置：
# Availability:   99.9%（每月允许下线 ~43 分钟）
# Latency P99:   < 500ms（API 类）/ < 2s（页面类）
# Error Rate:    < 0.1%

# 容量规划公式：
# 当前：100 VUs → P99 200ms, TPS 800, CPU 40%
# 目标：支持 500 VUs（5x 流量）

# 线性近似：
# 需要 CPU：40% × 5 = 200%（超了！）
# 需要实例：ceil(200% / 70%) = 3 台（70%利用率留余量）
# 验证：3台 × 800 TPS = 2400 TPS，大于目标 800×5=4000? 不够!
# → 还需优化代码（P99 目标降低）或再加实例`;

export default function LessonStress() {
  const navigate = useNavigate();

  const SLO_TABLE = [
    ['可用性 99%', '8小时44分/月', '适合内部工具', '#f97316'],
    ['可用性 99.9%', '43分钟/月', 'B端SaaS标准', '#fbbf24'],
    ['可用性 99.95%', '21.9分钟/月', '金融/支付', '#22c55e'],
    ['可用性 99.99%', '4.4分钟/月', '电信/核心基础设施', '#3b82f6'],
    ['可用性 99.999%', '26秒/月', '航空/医疗系统', '#8b5cf6'],
  ];

  return (
    <div className="lesson-po">
      <div className="po-badge amber">🔥 module_08 — 压测 & 容量规划</div>
      <div className="po-hero">
        <h1>压测 & 容量规划：k6 / Locust / SLO 落地</h1>
        <p>性能测试是性能工程的<strong>最后一道防线</strong>。压测不只是"看系统能撑多少并发"，更是用来验证 SLO、发现性能退化、规划扩容策略。k6 和 Locust 是目前最流行的两大压测工具。</p>
      </div>

      <StressSimulator />

      <div className="po-section">
        <h2 className="po-section-title">📜 SLA 可用性等级速查</h2>
        <div className="po-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="po-table">
            <thead><tr><th>可用性等级</th><th>每月允许停机</th><th>适用场景</th></tr></thead>
            <tbody>
              {SLO_TABLE.map(([sla, down, use, color]) => (
                <tr key={sla}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color }}>{sla}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color, fontSize: '0.8rem' }}>{down}</td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="po-section">
        <h2 className="po-section-title">⚙️ k6 + Locust + 容量规划</h2>
        <div className="po-code-wrap">
          <div className="po-code-head"><div className="po-code-dot" style={{ background: '#ef4444' }}/><div className="po-code-dot" style={{ background: '#f97316' }}/><div className="po-code-dot" style={{ background: '#fbbf24' }}/><span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>🔥 stress-test</span></div>
          <div className="po-code" style={{ maxHeight: 420, overflowY: 'auto' }}>{STRESS_CODE}</div>
        </div>
      </div>

      {/* 结课卡 */}
      <div className="po-section">
        <div className="po-card" style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.05),rgba(34,197,94,0.03),rgba(59,130,246,0.03))', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成性能优化专项全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.4rem', textAlign: 'left' }}>
            {[
              '✅ 火焰图交互模拟（热点点击+优化前后对比）+ USE/RED方法论 + P99指标',
              '✅ 实时CPU/内存/IO/网络仪表盘 + Linux perf/eBPF命令速查',
              '✅ Python速度对比图 + cProfile/asyncio/NumPy/FastAPI连接池代码',
              '✅ Core Web Vitals交互模拟器（五指标拖动+实时评级）+ React优化',
              '✅ 慢查询分析器（三个案例+EXPLAIN展示+修复方案+加速比）',
              '✅ Jaeger风格分布式追踪Gantt图 + OpenTelemetry/Prometheus代码',
              '✅ JVM GC算法对比图（停顿/吞吐双进度条）+ Python泄漏/Go对象池',
              '✅ 实时压测模拟器（VU调节+实时指标+响应时间分布直方图）+SLO表',
            ].map(s => <div key={s} style={{ fontSize: '0.76rem', color: '#64748b' }}>{s}</div>)}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#f97316' }}>
            📚 推荐书单：《Systems Performance》Brendan Gregg · 《High Performance MySQL》· 《BPF Performance Tools》
          </div>
        </div>
      </div>

      <div className="po-nav">
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/memory')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
