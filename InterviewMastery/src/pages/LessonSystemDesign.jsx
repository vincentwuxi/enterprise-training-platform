import { useState } from 'react';
import './LessonCommon.css';

const SD_FRAMEWORK = [
  { step: '1. 需求澄清', time: '5 min', emoji: '❓', desc: '功能范围、用户量级、读写比、一致性要求', tips: ['主动问问题，不要闷头设计', '量化：DAU、QPS、存储量', '明确 MVP vs 完整功能'] },
  { step: '2. 高层设计', time: '10 min', emoji: '🏗️', desc: '画出核心组件和数据流', tips: ['Client → LB → API Server → DB', '先画 happy path', '标注协议(HTTP/gRPC/WebSocket)'] },
  { step: '3. 数据模型', time: '5 min', emoji: '💾', desc: 'Schema 设计 + 存储选型', tips: ['SQL vs NoSQL 的选择理由', '索引设计', '分库分表策略'] },
  { step: '4. 核心 API', time: '5 min', emoji: '🔌', desc: 'RESTful / gRPC 接口定义', tips: ['POST /tweets, GET /feed?user_id=X', '分页、限流、鉴权', '幂等性考虑'] },
  { step: '5. 深入设计', time: '10 min', emoji: '🔬', desc: '性能优化、缓存、消息队列', tips: ['缓存策略(Cache-Aside/Write-Through)', 'CDN、读写分离', '异步处理(Kafka/SQS)'] },
  { step: '6. 扩展与权衡', time: '5 min', emoji: '⚖️', desc: '水平扩展、故障恢复、监控', tips: ['CAP 定理的选择', '单点故障处理', 'Rate Limiting、熔断'] },
];

const CLASSIC_PROBLEMS = [
  { name: '设计 Twitter/微博', tags: ['Feed 流','Fan-out','缓存','Timeline'], freq: '🔥🔥🔥', key: 'twitter' },
  { name: '设计 URL 缩短器', tags: ['哈希','Base62','302重定向','分析'], freq: '🔥🔥🔥', key: 'url' },
  { name: '设计分布式缓存', tags: ['一致性哈希','LRU','分片','复制'], freq: '🔥🔥🔥', key: 'cache' },
  { name: '设计聊天系统', tags: ['WebSocket','消息队列','已读回执','群聊'], freq: '🔥🔥', key: 'chat' },
  { name: '设计搜索引擎', tags: ['倒排索引','分词','排序','分布式爬虫'], freq: '🔥🔥', key: 'search' },
  { name: '设计限流器', tags: ['令牌桶','滑动窗口','分布式限流','Redis'], freq: '🔥🔥🔥', key: 'ratelimit' },
];

export default function LessonSystemDesign() {
  const [activeTab, setActiveTab] = useState('framework');
  const [expandedStep, setExpandedStep] = useState(null);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge blue">模块五 · System Design</div>
        <h1>系统设计 — FAANG 框架 + 经典题全解</h1>
        <p>系统设计面试不考你画完美架构图——考的是<strong>结构化思考</strong>、<strong>权衡取舍</strong>和<strong>沟通能力</strong>。掌握 6 步框架，45 分钟内从容展示你的架构思维。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 核心内容</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['framework','六步框架'],['problems','经典题库'],['concepts','核心概念'],['mistakes','常见错误']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'framework' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              系统设计面试的<strong>黄金 40 分钟</strong>时间分配——不要跳步骤。
            </div>
            {SD_FRAMEWORK.map((s, i) => (
              <div key={s.step} className="iv-card" style={{marginBottom:'0.5rem',cursor:'pointer'}} onClick={() => setExpandedStep(expandedStep===i?null:i)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700,color:'#fbbf24'}}>{s.emoji} {s.step}</div>
                  <div style={{display:'flex',gap:8}}>
                    <span className="iv-tag blue">{s.time}</span>
                  </div>
                </div>
                <div style={{fontSize:'0.85rem',color:'var(--iv-muted)',marginTop:4}}>{s.desc}</div>
                {expandedStep === i && (
                  <div style={{marginTop:'0.5rem',paddingTop:'0.5rem',borderTop:'1px solid var(--iv-border)'}}>
                    {s.tips.map(tip => (
                      <div key={tip} style={{fontSize:'0.82rem',padding:'0.2rem 0',display:'flex',gap:6}}>
                        <span style={{color:'var(--iv-gold)'}}>▸</span> {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="iv-grid-2">
            {CLASSIC_PROBLEMS.map(p => (
              <div key={p.key} className="iv-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700,color:'#fbbf24'}}>{p.name}</div>
                  <span style={{fontSize:'0.85rem'}}>{p.freq}</span>
                </div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:'0.5rem'}}>
                  {p.tags.map(t => <span key={t} className="iv-tag blue">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'concepts' && (
          <div>
            <div className="iv-grid-3">
              {[
                {t:'CAP 定理',d:'Consistency / Availability / Partition Tolerance — 三选二',c:'#ef4444'},
                {t:'一致性哈希',d:'节点增减时只需迁移 K/N 的数据',c:'#3b82f6'},
                {t:'读写分离',d:'Master 写 / Slave 读，提升读 QPS',c:'#22c55e'},
                {t:'数据库分片',d:'水平切分 → 范围分片 or 哈希分片',c:'#eab308'},
                {t:'消息队列',d:'异步解耦 + 削峰填谷 (Kafka/SQS)',c:'#8b5cf6'},
                {t:'CDN',d:'静态资源就近分发，降低延迟',c:'#f59e0b'},
                {t:'缓存策略',d:'Cache-Aside / Write-Through / Write-Behind',c:'#22c55e'},
                {t:'负载均衡',d:'Round Robin / 加权 / 一致性哈希',c:'#3b82f6'},
                {t:'微服务 vs 单体',d:'权衡复杂度、部署、团队规模',c:'#ef4444'},
              ].map(c => (
                <div key={c.t} className="iv-card">
                  <div style={{fontWeight:700,color:c.c,fontSize:'0.88rem',marginBottom:4}}>{c.t}</div>
                  <div style={{fontSize:'0.8rem',color:'var(--iv-muted)'}}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="iv-grid-2" style={{gridTemplateColumns:'1fr'}}>
            {[
              {x:'❌ 上来就画架构图',v:'✅ 先花 5 分钟问需求、量化规模',why:'面试官想看你的需求分析能力，不是画图速度。'},
              {x:'❌ 过度设计',v:'✅ 先设计 MVP，再逐步优化',why:'1000 QPS 不需要 Kafka + Redis + 分库分表。匹配规模设计。'},
              {x:'❌ 只说方案不说理由',v:'✅ 每个选择都解释 "为什么"',why:'"我用 Redis 做缓存"→"因为读 QPS 100K，DB 扛不住，Redis 的 p99 < 1ms"'},
              {x:'❌ 忽略故障场景',v:'✅ 主动讨论 "如果 X 挂了怎么办"',why:'展示你有生产经验，不是只会画理想架构。'},
            ].map(m => (
              <div key={m.x} className="iv-card">
                <div style={{color:'var(--iv-red)',fontWeight:600,marginBottom:4}}>{m.x}</div>
                <div style={{color:'var(--iv-green)',fontWeight:600,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:'0.82rem',color:'var(--iv-muted)'}}>💡 {m.why}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
