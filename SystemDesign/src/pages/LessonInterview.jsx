import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 面试白板：URL 短链系统设计步骤
const URL_SHORT_STEPS = [
  {
    step: '① 需求分析', color: '#3b82f6',
    content: [
      '功能需求：长URL → 短URL（如 https://bit.ly/3xK），短URL → 跳转',
      '非功能：低延迟 (<50ms), 高可用 (99.99%), 可扩展（100亿条URL）',
      '规模估算：1亿 DAU，写：1000 QPS，读：100000 QPS（100:1读写比）',
      '存储估算：每条记录 ~500B，100亿条 = 5 TB（5年）',
    ],
  },
  {
    step: '② 高层设计', color: '#22c55e',
    content: [
      'Client → CDN/LB → URL Service（水平扩展） → DB',
      '写入：长URL → Hash → 短码 → 存 DB + 写 Cache',
      '读取：短码 → 查 Cache（Miss→DB） → 301/302 重定向',
      '301（永久缓存）vs 302（临时，利于统计点击）',
    ],
  },
  {
    step: '③ 短码生成算法', color: '#f59e0b',
    content: [
      '方案A：MD5(长URL)取前6位 → 冲突需拼接 3% 冲突率',
      '方案B：Base62(自增ID) → 62^6 = 560亿，足够', 
      '方案C：随机6位Base62 → 需检测冲突（存在率低，推荐用BitMap检查）',
      '最终选择：雪花ID → Base62编码（7位字符，趋势递增，DB索引友好）',
    ],
  },
  {
    step: '④ 数据库设计', color: '#a855f7',
    content: [
      'URL 表：id(BIGINT) | short_code(VARCHAR7) | long_url(TEXT) | user_id | expires_at | clicks',
      '索引：主键id + unique(short_code) + idx(user_id)',
      '选型：MySQL（强一致，数据量<1亿）→ Cassandra（100亿条，分布式）',
      'Cache：Redis String，key=short_code，value=long_url，TTL=1天',
    ],
  },
  {
    step: '⑤ 扩展 & 优化', color: '#ef4444',
    content: [
      'CDN：静态资源 + 热点短URL在边缘节点缓存（减少源站压力）',
      '读多写少 → 主从分离（写Primary，读n个Replica）',
      '自定义短链：允许用户自定义短码（Vanity URL），需额外唯一索引',
      '点击统计：写MQ（Kafka），消费者异步聚合，避免频繁更新DB',
    ],
  },
];

const CASE_STUDIES = [
  {
    title: '🐦 Twitter Feed 时间线',
    difficulty: 'Hard',
    qps: '读：300K QPS',
    color: '#3b82f6',
    key_points: ['推模式(Push/Fan-out Write)：用户发推 → 推入所有粉丝的Feed列表', '拉模式(Pull/Fan-out Read)：用户刷Feed → 合并关注列表最新推文', '混合模式：普通用户Push，大V(粉丝>100万)用Pull', 'Redis ZSet 存储Feed列表（score=timestamp，取最新50条）'],
  },
  {
    title: '🛒 电商秒杀系统',
    difficulty: 'Hard+',
    qps: '峰值：10M QPS',
    color: '#ef4444',
    key_points: ['预处理：商品信息静态化到CDN，挡住99%流量', '前端倒计时：按钮在服务器时间开始前置灰（防提前请求）', '库存：Redis DECR原子扣减（Lua脚本），真实DB异步扣减', 'MQ削峰：秒杀成功写MQ，Order服务1000/s处理，防DB过载'],
  },
  {
    title: '🔍 分布式搜索系统',
    difficulty: 'Hard',
    qps: '读：50K QPS',
    color: '#22c55e',
    key_points: ['倒排索引：term → [docId, docId...] → ES底层数据结构', '分片策略：按IndexName哈希分片，每个Shard是独立Lucene实例', '相关性排序：TF-IDF + BM25 + 自定义业务分(点击率/时效性)', '实时写入：写Kafka → Logstash消费 → ES批量写入（每秒刷盘）'],
  },
  {
    title: '💬 IM 即时通讯',
    difficulty: 'Extreme',
    qps: '写：500K msg/s',
    color: '#a855f7',
    key_points: ['长连接：WebSocket（Web）/ TCP长连接（Mobile），Gateway层维护连接', '消息ID：雪花ID保证全局有序（同一会话按时间戳排序）', '离线消息：用户下线→消息落库；上线→拉取Inbox未读消息', '消息漫游：多端同步通过游标（last_msg_id）拉取增量消息'],
  },
];

export default function LessonInterview() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(null);
  const [activeCase, setActiveCase] = useState(0);

  return (
    <div className="lesson-sd">
      <div className="sd-badge green">🎯 module_08 — 面试实战</div>
      <div className="sd-hero">
        <h1>面试实战：URL 短链 / Twitter Feed / 电商秒杀</h1>
        <p>把前 7 个模块的知识整合到<strong>4 道经典面试题</strong>中。每道题按照「需求分析 → 高层设计 → 数据库选型 → 扩展优化」的框架拆解，是大厂 P6-P8 系统设计面试的标准答题路径。</p>
      </div>

      {/* URL 短链白板 */}
      <div className="sd-interactive">
        <h3>📐 URL 短链系统设计（白板演练）
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>点击每一步展开详细分析</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {URL_SHORT_STEPS.map((s, i) => (
            <div key={i}>
              <div onClick={() => setActiveStep(activeStep === i ? null : i)}
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.625rem 0.875rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeStep === i ? `${s.color}08` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeStep === i ? s.color + '30' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${s.color}20`, border: `1.5px solid ${s.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: s.color, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontWeight: 700, color: activeStep === i ? s.color : '#94a3b8', fontSize: '0.85rem' }}>{s.step}</span>
                <span style={{ marginLeft: 'auto', color: '#334155', fontSize: '0.8rem' }}>{activeStep === i ? '▲' : '▼'}</span>
              </div>
              {activeStep === i && (
                <div style={{ margin: '0.25rem 0 0.25rem 1.5rem', padding: '0.5rem 0.875rem', background: `${s.color}05`, borderLeft: `2px solid ${s.color}30`, borderRadius: '0 6px 6px 0' }}>
                  {s.content.map((c, j) => (
                    <div key={j} style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', lineHeight: 1.65 }}>
                      <span style={{ color: s.color, fontWeight: 700 }}>✦</span> {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 四大经典题目 */}
      <div className="sd-section">
        <h2 className="sd-section-title">🏆 四大经典系统设计题（切换查看要点）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {CASE_STUDIES.map((c, i) => (
            <button key={i} onClick={() => setActiveCase(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem 0.5rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s',
                border: `1px solid ${activeCase === i ? c.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeCase === i ? `${c.color}10` : 'rgba(255,255,255,0.02)',
                color: activeCase === i ? c.color : '#64748b' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>{c.title.split(' ')[0]}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: activeCase === i ? c.color : '#334155' }}>{c.qps}</div>
            </button>
          ))}
        </div>

        <div className="sd-card" style={{ borderColor: `${CASE_STUDIES[activeCase].color}25` }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 900, color: CASE_STUDIES[activeCase].color, fontSize: '1rem' }}>{CASE_STUDIES[activeCase].title}</span>
            <span className="sd-tag red">{CASE_STUDIES[activeCase].difficulty}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>{CASE_STUDIES[activeCase].qps}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {CASE_STUDIES[activeCase].key_points.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.65 }}>
                <span style={{ color: CASE_STUDIES[activeCase].color, fontWeight: 700, flexShrink: 0 }}>{'①②③④'[i]}</span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 结课 */}
      <div className="sd-section">
        <div className="sd-card" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.06),rgba(168,85,247,0.04))', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#60a5fa', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成系统设计全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.4rem', textAlign: 'left' }}>
            {['✅ 五步框架 + CAP交互选择器（5大真实系统）', '✅ LB四算法模拟器（可注入服务器故障）', '✅ 缓存穿透/击穿/雪崩四场景步骤动画', '✅ Kafka生产配置 + 可靠性三语义', '✅ SVG一致性哈希环（可增删节点）', '✅ Raft五节点状态机（提案→提交+选举动画）', '✅ API网关/服务网格Istio完整配置', '✅ URL短链白板演练 + 四大经典题要点'].map(s => (
              <div key={s} style={{ fontSize: '0.8rem', color: '#64748b' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            📚 推荐资料：《Designing Data-Intensive Applications》 · 《System Design Interview》Vol 1&2 · ByteByteGo
          </div>
        </div>
      </div>

      <div className="sd-nav">
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/microservice')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
