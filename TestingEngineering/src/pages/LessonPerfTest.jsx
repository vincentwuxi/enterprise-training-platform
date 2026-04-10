import './LessonCommon.css';

const CODE = `// ━━━━ 性能测试（k6 负载测试）━━━━
// k6 = Grafana Labs 出品，JavaScript 脚本，开源

// ━━━━ 1. 安装 ━━━━
// brew install k6
// 或 docker run grafana/k6

// ━━━━ 2. 基础负载测试 ━━━━
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 阶梯式负载
  stages: [
    { duration: '30s', target: 10 },   // 30s 内增加到 10 用户
    { duration: '1m',  target: 50 },   // 1min 内增加到 50 用户
    { duration: '2m',  target: 50 },   // 维持 50 用户 2 分钟
    { duration: '30s', target: 0 },    // 30s 内降到 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 请求 < 500ms
    http_req_failed:   ['rate<0.01'],  // 失败率 < 1%
    checks:            ['rate>0.99'],  // 检查通过率 > 99%
  },
};

export default function () {
  // 模拟用户行为
  const loginRes = http.post('https://api.example.com/login', JSON.stringify({
    username: 'testuser',
    password: 'testpass',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has token':     (r) => JSON.parse(r.body).token !== undefined,
  });

  const token = JSON.parse(loginRes.body).token;

  // 获取用户数据
  const dataRes = http.get('https://api.example.com/api/data', {
    headers: { Authorization: 'Bearer ' + token },
  });

  check(dataRes, {
    'data status is 200': (r) => r.status === 200,
    'data has items':     (r) => JSON.parse(r.body).items.length > 0,
  });

  sleep(1);  // 模拟用户思考时间
}

// 运行：k6 run load-test.js

// ━━━━ 3. 四种性能测试类型 ━━━━
// ① 负载测试（Load Test）
// 目的：验证系统在预期负载下的表现
// 场景：50 并发用户，持续 5 分钟
export const loadOptions = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
};

// ② 压力测试（Stress Test）
// 目的：找到系统的极限（什么时候崩？）
export const stressOptions = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 500 },   // 持续加压
    { duration: '5m', target: 1000 },  // 极限压力
    { duration: '5m', target: 0 },
  ],
};

// ③ 浸泡测试（Soak Test）
// 目的：发现内存泄漏（长时间运行后性能下降？）
export const soakOptions = {
  stages: [
    { duration: '5m',  target: 50 },
    { duration: '24h', target: 50 },   // 24 小时！
    { duration: '5m',  target: 0 },
  ],
};

// ④ 峰值测试（Spike Test）
// 目的：突然流量暴增时系统是否能恢复
export const spikeOptions = {
  stages: [
    { duration: '1m',  target: 10 },
    { duration: '10s', target: 1000 }, // 瞬间飙升！
    { duration: '3m',  target: 1000 },
    { duration: '10s', target: 10 },   // 瞬间回落
    { duration: '3m',  target: 10 },
  ],
};

// ━━━━ 4. SLA 验证 ━━━━
// thresholds 直接映射 SLA 指标
export const slaOptions = {
  thresholds: {
    http_req_duration: [
      'p(50)<200',    // 50% 请求 < 200ms
      'p(90)<400',    // 90% 请求 < 400ms
      'p(95)<500',    // 95% 请求 < 500ms（SLA）
      'p(99)<1000',   // 99% 请求 < 1s
    ],
    http_req_failed: ['rate<0.001'],  // 错误率 < 0.1%
  },
};`;

export default function LessonPerfTest() {
  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 06 · PERFORMANCE TESTING</div>
        <h1>性能测试</h1>
        <p>系统在 10 个用户时很快不代表 1000 个用户时不崩——<strong>k6 用 JavaScript 写负载测试脚本，支持负载/压力/浸泡/峰值四种模式，thresholds 直接验证 SLA</strong>。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">⚡ k6 性能测试</div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>load-test.js</span>
          </div>
          <div className="te-code">{CODE}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">📊 四种性能测试</div>
        <div className="te-grid-2">
          {[
            { name: '负载测试（Load）', purpose: '验证预期负载', pattern: '📈 逐步增加到目标 → 保持', when: '每次发布前', color: '#059669' },
            { name: '压力测试（Stress）', purpose: '找到系统极限', pattern: '📈📈📈 持续加压直到崩溃', when: '架构评审', color: '#f97316' },
            { name: '浸泡测试（Soak）', purpose: '发现内存泄漏', pattern: '📊 低负载持续 24 小时', when: '重大更新后', color: '#7c3aed' },
            { name: '峰值测试（Spike）', purpose: '突发流量恢复', pattern: '📉📈⚡ 瞬间飙升后回落', when: '大促/活动前', color: '#ef4444' },
          ].map((t, i) => (
            <div key={i} className="te-card" style={{ borderLeft: `3px solid ${t.color}` }}>
              <div style={{ fontWeight: 700, color: t.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)', marginBottom: '0.15rem' }}>🎯 {t.purpose}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)', marginBottom: '0.15rem' }}>{t.pattern}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)' }}>📅 {t.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
