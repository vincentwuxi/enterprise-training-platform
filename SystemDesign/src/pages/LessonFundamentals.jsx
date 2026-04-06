import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// CAP 定理交互选择器
const CAP_SYSTEMS = [
  { name: 'Zookeeper / etcd', c: true, a: false, p: true, type: 'CP', color: '#3b82f6', desc: '强一致性 + 分区容忍。当网络分区时，Zookeeper 会拒绝写操作（牺牲可用性）以保证所有节点数据一致。适合：分布式锁、服务发现、配置中心。' },
  { name: 'Cassandra / DynamoDB', c: false, a: true, p: true, type: 'AP', color: '#22c55e', desc: '高可用 + 分区容忍。写入任意节点都成功，最终一致性。适合：社交媒体时间线、购物车、用户行为日志等高可用场景，可以接受短暂不一致。' },
  { name: 'MySQL / 单机 Redis', c: true, a: true, p: false, type: 'CA', color: '#f59e0b', desc: '强一致 + 高可用，但不支持网络分区。在分布式环境中实际上 CA 系统不存在（网络必定会分区）。单机场景适用，不适合分布式集群部署。' },
  { name: 'MongoDB (最终一致)', c: false, a: true, p: true, type: 'AP', color: '#a855f7', desc: '默认 AP 模式：写入 Primary 后立刻返回，Secondary 异步同步。可通过 writeConcern: majority 切换为 CP 模式（强一致但降低可用性）。' },
  { name: 'HBase / BigTable', c: true, a: false, p: true, type: 'CP', color: '#ef4444', desc: '强一致 + 分区容忍。Region Server 不可达时拒绝服务，等待恢复。适合离线分析、用户画像等对一致性要求高但可忍受短暂不可用的场景。' },
];

const ESTIMATION_STEPS = [
  { step: '1. 明确需求', tips: ['日活用户数 DAU（如 1亿）', '主要功能（读多还是写多）', '数据量（消息大小、图片视频）', 'SLA：99.9% 还是 99.99%'] },
  { step: '2. 容量估算', tips: ['QPS = DAU × 操作次数 / 86400', '读写比（通常读:写 = 10:1~100:1）', '存储 = 日均数据 × 保留年限', '带宽 = QPS × 平均包大小'] },
  { step: '3. 高层设计', tips: ['画出主流程（Client→LB→Server→DB）', '确定核心组件（Cache/MQ/CDN）', '数据模型设计（关系/KV/文档）', '一致性要求（强/最终）'] },
  { step: '4. 深入细节', tips: ['数据库选型 & 索引设计', '缓存策略（LRU/TTL/预热）', '关键算法（哈希/分词/推荐）', '瓶颈识别 & 水平扩展方案'] },
  { step: '5. 评估与优化', tips: ['单点故障（SPOF）排查', '监控 & 告警 & 链路追踪', '降级 & 熔断 & 限流策略', 'AB测试 & 灰度发布'] },
];

const SCALE_NUMBERS = [
  { label: '1秒', val: '1 s', rps: '1 req', context: '手动触发' },
  { label: '1分钟', val: '60 s', rps: '10 K req', context: '小型 API' },
  { label: '1天', val: '86,400 s', rps: '100 M req', context: '大型网站' },
  { label: '1年', val: '31.5 M s', rps: '100 B req', context: 'Google规模' },
  { label: '1 KB', val: '10³ B', rps: '1 条推文', context: '文本数据' },
  { label: '1 MB', val: '10⁶ B', rps: '1 张图片', context: '媒体数据' },
  { label: '1 GB', val: '10⁹ B', rps: '1 部电影', context: '大文件' },
  { label: '1 TB', val: '10¹² B', rps: '日均日志', context: '大规模系统' },
];

export default function LessonFundamentals() {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const sys = CAP_SYSTEMS[selectedSystem];

  return (
    <div className="lesson-sd">
      <div className="sd-badge">🏗️ module_01 — 设计方法论</div>
      <div className="sd-hero">
        <h1>系统设计方法论：需求分析 / 容量估算 / CAP 定理</h1>
        <p>大厂面试系统设计的核心不是背答案，而是掌握<strong>结构化思维框架</strong>：从需求出发→容量量化→架构选型→深入细节→瓶颈优化。CAP 定理帮助你在一致性与可用性之间做出正确权衡。</p>
      </div>

      {/* 五步框架 */}
      <div className="sd-interactive">
        <h3>📋 系统设计五步框架（点击查看每步要点）
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>面试 45 分钟的时间分配指引</span>
        </h3>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {ESTIMATION_STEPS.map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.625rem 0.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center', transition: 'all 0.2s',
                border: `1px solid ${activeStep === i ? '#3b82f6' : 'rgba(255,255,255,0.06)'}`,
                background: activeStep === i ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                color: activeStep === i ? '#60a5fa' : '#64748b' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', marginBottom: '0.1rem' }}>~{[5, 10, 15, 15, 5][i]}min</div>
              {s.step}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.4rem' }}>
          {ESTIMATION_STEPS[activeStep].tips.map((tip, i) => (
            <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '7px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              ✦ {tip}
            </div>
          ))}
        </div>
      </div>

      {/* CAP 定理交互 */}
      <div className="sd-section">
        <h2 className="sd-section-title">⚖️ CAP 定理 — 交互式系统选型</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          CAP：分布式系统最多同时满足三个特性中的两个。<strong style={{ color: '#60a5fa' }}>C</strong>onsistency 一致性 · <strong style={{ color: '#22c55e' }}>A</strong>vailability 可用性 · <strong style={{ color: '#f59e0b' }}>P</strong>artition Tolerance 分区容忍
        </p>

        {/* CAP 三角 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <svg width="280" height="240" viewBox="0 0 280 240">
            <polygon points="140,20 20,220 260,220" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5" />
            {/* 三个顶点标签 */}
            <text x="140" y="12" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">C 一致性</text>
            <text x="10" y="235" fill="#22c55e" fontSize="11" fontWeight="700">A 可用性</text>
            <text x="210" y="235" fill="#f59e0b" fontSize="11" fontWeight="700">P 分区容忍</text>
            {/* 边中点标签 */}
            <text x="72" y="118" textAnchor="middle" fill="#3b82f6" fontSize="10">CA</text>
            <text x="208" y="118" textAnchor="middle" fill="#f59e0b" fontSize="10">CP</text>
            <text x="140" y="228" textAnchor="middle" fill="#22c55e" fontSize="10">AP</text>
            {/* 高亮三角形中心点 */}
            <circle cx="140" cy="160" r="30" fill={sys.color + '18'} stroke={sys.color} strokeWidth="1.5" />
            <text x="140" y="155" textAnchor="middle" fill={sys.color} fontSize="11" fontWeight="800">{sys.type}</text>
            <text x="140" y="170" textAnchor="middle" fill={sys.color} fontSize="9">{sys.name.split('/')[0]}</text>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {CAP_SYSTEMS.map((s, i) => (
            <button key={i} onClick={() => setSelectedSystem(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.625rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', transition: 'all 0.2s',
                border: `1px solid ${selectedSystem === i ? s.color + '60' : 'rgba(255,255,255,0.06)'}`,
                background: selectedSystem === i ? `${s.color}10` : 'rgba(255,255,255,0.02)',
                color: selectedSystem === i ? s.color : '#64748b' }}>
              <span className="sd-tag" style={{ background: `${s.color}15`, color: s.color, marginBottom: '0.2rem', display: 'block' }}>{s.type}</span>
              {s.name}
            </button>
          ))}
        </div>

        <div className="sd-card" style={{ borderColor: `${sys.color}25`, background: `${sys.color}05` }}>
          <div style={{ fontWeight: 800, color: sys.color, marginBottom: '0.4rem' }}>{sys.name} — {sys.type}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7 }}>{sys.desc}</div>
          <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.4rem' }}>
            {[['C', sys.c], ['A', sys.a], ['P', sys.p]].map(([l, v]) => (
              <span key={l} style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800, background: v ? `${sys.color}15` : 'rgba(255,255,255,0.04)', color: v ? sys.color : '#334155' }}>{l} {v ? '✓' : '✗'}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 量级速查 */}
      <div className="sd-section">
        <h2 className="sd-section-title">🔢 估算量级速查（面试必备数字）</h2>
        <div className="sd-grid-4">
          {SCALE_NUMBERS.map(s => (
            <div key={s.label} className="sd-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', fontWeight: 900, color: '#60a5fa', marginBottom: '0.15rem' }}>{s.label}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#22c55e', marginBottom: '0.2rem' }}>{s.val}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.rps}<br />{s.context}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sd-nav">
        <div />
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/high-avail')}>下一模块：高可用架构 →</button>
      </div>
    </div>
  );
}
