import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const SERVICE_MODELS = [
  {
    name: 'IaaS', full: 'Infrastructure as a Service',
    icon: '🖥️', color: '#f87171',
    desc: '提供虚拟化的基础硬件资源，用户管理操作系统以上的所有层',
    userManages: ['应用代码', '运行时/中间件', '操作系统'],
    cloudManages: ['虚拟化层', '物理服务器', '网络/存储'],
    examples: ['AWS EC2', 'Google GCE', 'Azure VMs'],
  },
  {
    name: 'PaaS', full: 'Platform as a Service',
    icon: '🏗️', color: '#fbbf24',
    desc: '提供应用运行平台，用户只需关注代码和数据',
    userManages: ['应用代码', '数据'],
    cloudManages: ['运行时/中间件', '操作系统', '虚拟化层', '物理服务器'],
    examples: ['AWS Elastic Beanstalk', 'Google App Engine', 'Heroku'],
  },
  {
    name: 'SaaS', full: 'Software as a Service',
    icon: '☁️', color: '#22c55e',
    desc: '完整的软件应用，用户直接使用，无需管理任何基础设施',
    userManages: ['数据（有限配置）'],
    cloudManages: ['应用代码', '运行时', '操作系统', '虚拟化层', '物理服务器'],
    examples: ['Gmail', 'Salesforce', 'GitHub'],
  },
  {
    name: 'FaaS', full: 'Function as a Service (Serverless)',
    icon: '⚡', color: '#a78bfa',
    desc: '事件驱动的函数执行，按调用次数付费，无需管理服务器',
    userManages: ['函数代码', '触发器配置'],
    cloudManages: ['一切基础设施', '扩缩容', '高可用'],
    examples: ['AWS Lambda', 'Google Cloud Functions', 'Vercel Functions'],
  },
];

const TWELVE_FACTORS = [
  { num: 1, name: '基准代码', rule: 'One codebase, tracked in revision control', icon: '📁', desc: '一份代码仓库对应一个应用，多环境部署同一份代码' },
  { num: 2, name: '依赖显式声明', rule: 'Explicitly declare and isolate dependencies', icon: '📦', desc: 'requirements.txt / pyproject.toml，不依赖系统全局包' },
  { num: 3, name: '配置存环境变量', rule: 'Store config in the environment', icon: '⚙️', desc: '数据库URL、密钥等配置从环境变量读取，代码中不硬编码' },
  { num: 4, name: '后端服务当附加资源', rule: 'Treat backing services as attached resources', icon: '🔌', desc: 'DB/Redis/S3 视为通过URL访问的资源，可随时替换' },
  { num: 5, name: '构建发布运行分离', rule: 'Strictly separate build and run stages', icon: '🏗️', desc: 'Build（编译）→ Release（配置注入）→ Run（运行）' },
  { num: 6, name: '进程无状态', rule: 'Stateless processes, share-nothing', icon: '🔄', desc: '进程不存本地状态，Session 存 Redis，文件存 S3' },
  { num: 7, name: '端口绑定', rule: 'Export services via port binding', icon: '🔗', desc: '应用自包含，通过 HTTP 端口对外提供服务（如 uvicorn）' },
  { num: 8, name: '并发横向扩展', rule: 'Scale out via the process model', icon: '📈', desc: '通过增加进程数扩容，而非垂直扩容' },
  { num: 9, name: '快速启动优雅停止', rule: 'Fast startup and graceful shutdown', icon: '⚡', desc: '秒级启动，收到 SIGTERM 完成当前请求后退出' },
  { num: 10, name: '开发生产等价', rule: 'Keep development, staging, production as similar as possible', icon: '🔁', desc: '三环境使用相同的数据库/中间件版本，用 Docker 保证一致' },
  { num: 11, name: '日志当事件流', rule: 'Treat logs as event streams', icon: '📊', desc: '输出到 stdout，由平台收集（CloudWatch/Stackdriver）' },
  { num: 12, name: '管理任务一次性运行', rule: 'Run admin/management tasks as one-off processes', icon: '🔧', desc: '数据库迁移等维护任务在相同环境一次性执行' },
];

export default function LessonCloudCore() {
  const navigate = useNavigate();
  const [activeModel, setActiveModel] = useState(0);
  const [expandedFactor, setExpandedFactor] = useState(null);

  const model = SERVICE_MODELS[activeModel];

  return (
    <div className="lesson-cn">
      <div className="cn-badge">☁️ module_01 — 云原生基础</div>

      <div className="cn-hero">
        <h1>云原生基础：IaaS / PaaS / SaaS 与 12-Factor</h1>
        <p>云原生不只是"把应用搬到云上"，而是重新设计应用的构建、发布和运行方式。<strong>服务模型决定责任边界</strong>，<strong>12-Factor 方法论</strong>是云原生应用设计的基准。</p>
      </div>

      {/* 服务模型对比 */}
      <div className="cn-section">
        <h2 className="cn-section-title">☁️ 四大云服务模型（点击切换）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          {SERVICE_MODELS.map((m, i) => (
            <button key={m.name} onClick={() => setActiveModel(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.2s',
                border: `1px solid ${activeModel === i ? m.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeModel === i ? `${m.color}12` : 'rgba(255,255,255,0.02)',
                color: activeModel === i ? m.color : '#1e4060' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{m.icon}</div>
              {m.name}
            </button>
          ))}
        </div>

        <div className="cn-card" style={{ borderColor: `${model.color}25` }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: model.color, fontSize: '1rem' }}>{model.name}</span>
            <span style={{ fontSize: '0.8rem', color: '#1e4060', alignSelf: 'center' }}>({model.full})</span>
          </div>
          <p style={{ marginBottom: '1rem' }}>{model.desc}</p>
          <div className="cn-grid-2">
            <div>
              <div style={{ fontWeight: 700, color: model.color, fontSize: '0.8rem', marginBottom: '0.4rem' }}>👤 用户管理</div>
              {model.userManages.map(u => <div key={u} style={{ fontSize: '0.82rem', color: '#e0f0ff', marginBottom: '0.2rem', padding: '0.25rem 0.5rem', background: `${model.color}10`, borderRadius: '4px' }}>✅ {u}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e4060', fontSize: '0.8rem', marginBottom: '0.4rem' }}>☁️ 云平台管理</div>
              {model.cloudManages.map(c => <div key={c} style={{ fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.2rem' }}>☁ {c}</div>)}
            </div>
          </div>
          <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {model.examples.map(e => <span key={e} className="cn-tag blue">{e}</span>)}
          </div>
        </div>
      </div>

      {/* CAP 定理 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🔺 CAP 定理（分布式系统三角难题）</h2>
        <div className="cn-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#1e4060', lineHeight: '1.9', whiteSpace: 'pre' }}>{`
              Consistency（一致性）
                   ▲  所有节点在同一时刻
                   │  看到相同数据
                   │
               CP ─┤─ CA（理论存在，网络分区下不可实现）
                   │
    AP ────────────★ 三个特性只能同时满足两个
                  ╱│╲
          CP ────╱ │ ╲──── AP
                ╱  │  ╲
   Partition   ╱   │   ╲   Availability（可用性）
   Tolerance  ╱    │    ╲  每次请求都能得到响应
（分区容错）   ────────────  （不一定是最新数据）

典型数据库选择：
• CP（一致性+分区）：MySQL/PostgreSQL  → 银行系统
• AP（可用性+分区）：Cassandra/DynamoDB → 社交/购物车
• CA 不存在于分布式系统中（无法保证分区不发生）`}</div>
        </div>
      </div>

      {/* 12-Factor */}
      <div className="cn-section">
        <h2 className="cn-section-title">📋 12-Factor 方法论（点击展开每条）</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.4rem' }}>
          {TWELVE_FACTORS.map(f => (
            <div key={f.num} onClick={() => setExpandedFactor(expandedFactor === f.num ? null : f.num)}
              style={{ padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${expandedFactor === f.num ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.05)'}`,
                background: expandedFactor === f.num ? 'rgba(14,165,233,0.07)' : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#0ea5e9', minWidth: 20, fontWeight: 700 }}>#{f.num}</span>
                <span style={{ fontSize: '0.7rem' }}>{f.icon}</span>
                <span style={{ fontWeight: 700, color: '#e0f0ff', fontSize: '0.82rem' }}>{f.name}</span>
              </div>
              {expandedFactor === f.num && (
                <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#0ea5e9', marginBottom: '0.3rem', fontStyle: 'italic' }}>{f.rule}</div>
                  <div style={{ fontSize: '0.78rem', color: '#1e4060' }}>{f.desc}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 云原生 vs 传统架构 */}
      <div className="cn-section">
        <h2 className="cn-section-title">⚖️ 云原生 vs 传统架构</h2>
        <div className="cn-card">
          <table className="cn-table">
            <thead><tr><th>维度</th><th>❌ 传统架构</th><th>✅ 云原生架构</th></tr></thead>
            <tbody>
              {[
                ['部署单元', '虚拟机/物理机（分钟级）', '容器/函数（秒级）'],
                ['扩缩容', '手动预购机器，扩容慢', '自动水平扩容（HPA/Auto Scaling）'],
                ['故障恢复', '人工处理，停机时间长', '自愈，自动重启容器'],
                ['发布方式', '手动 SSH 部署，停机发布', 'CI/CD，蓝绿/金丝雀，零停机'],
                ['配置管理', '硬编码/SSH 上传配置文件', '环境变量/Secret Manager'],
                ['可观测', '文件日志，人工查找', 'Metrics/Logs/Traces 统一收集'],
                ['成本', '按月付固定服务器费', '按用量付费（Pay-as-you-go）'],
              ].map(([d, t, cn]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{d}</td>
                  <td style={{ fontSize: '0.8rem', color: '#1e4060' }}>{t}</td>
                  <td style={{ fontSize: '0.8rem', color: '#22c55e' }}>{cn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cn-nav">
        <div />
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/aws-core')}>下一模块：AWS 核心服务 →</button>
      </div>
    </div>
  );
}
