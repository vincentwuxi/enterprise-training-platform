import { useState } from 'react';
import './LessonCommon.css';

const STAR_FRAMEWORK = [
  { letter: 'S', word: 'Situation', cn: '情境', desc: '简要描述背景和挑战 (2-3句)', example: '"在上一家公司，我们的核心 API 平均响应时间超过 2 秒，用户投诉率激增，团队士气低落。"' },
  { letter: 'T', word: 'Task', cn: '任务', desc: '你的职责和目标 (1-2句)', example: '"作为后端 Tech Lead，我负责在 6 周内将 P99 延迟降到 500ms 以下。"' },
  { letter: 'A', word: 'Action', cn: '行动', desc: '你做了什么？(具体步骤，用"我"不用"我们")', example: '"我首先用 APM 工具定位了 3 个最慢的 SQL 查询，然后设计了读写分离方案，并推动团队引入 Redis 缓存层..."' },
  { letter: 'R', word: 'Result', cn: '结果', desc: '用数据量化结果', example: '"P99 延迟从 2.1s 降到 380ms，用户投诉下降 72%，API 可用性 99.95%。该方案后来被推广到公司其他 3 个核心服务。"' },
];

const TOP_QUESTIONS = [
  { q: 'Tell me about a time you disagreed with your manager.', category: '冲突管理', tips: '展示你能有理有据地表达不同意见，最终以数据/结果赢得共识。' },
  { q: 'Describe a situation where you failed.', category: '失败复盘', tips: '不要挑无关紧要的"假失败"——讲真实的失败，重点放在学到了什么。' },
  { q: 'Tell me about your most impactful project.', category: '影响力', tips: '量化影响：节省了多少成本、提升了多少性能、影响了多少用户。' },
  { q: 'How do you handle tight deadlines?', category: '压力管理', tips: '展示你的优先级排序能力和资源协调能力，而非"我加班"。' },
  { q: 'Describe a time you mentored someone.', category: '领导力', tips: '展示教学方法 + 对方的成长结果，体现你对团队的投资。' },
  { q: 'Tell me about a time you had to learn something new quickly.', category: '学习能力', tips: '描述你的学习策略（读源码/做项目/找导师），以及从零到产出的时间线。' },
];

export default function LessonBehavioral() {
  const [activeTab, setActiveTab] = useState('star');
  const [expandedQ, setExpandedQ] = useState(null);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge green">模块六 · Behavioral Interview</div>
        <h1>行为面试 — STAR 法则 + 30 道高频题解析</h1>
        <p>行为面试占 FAANG 面试评分的 <strong>30-40%</strong>。它不是闲聊——而是用过去的行为预测未来的表现。STAR 法则是唯一可靠的回答框架。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 核心内容</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['star','STAR 法则'],['questions','高频题库'],['dos','注意事项'],['prep','备考策略']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'star' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              每个行为面试回答都用 STAR 结构。总时长控制在 <strong>2-3 分钟</strong>。
            </div>
            {STAR_FRAMEWORK.map(s => (
              <div key={s.letter} className="iv-card" style={{marginBottom:'0.75rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.5rem'}}>
                  <div style={{
                    width:40,height:40,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',
                    background:'linear-gradient(135deg,#b45309,#a16207)',fontWeight:900,fontSize:'1.2rem',color:'#fef3c7'
                  }}>{s.letter}</div>
                  <div>
                    <div style={{fontWeight:700,color:'#fbbf24'}}>{s.word} <span style={{fontWeight:400,color:'var(--iv-muted)'}}>/ {s.cn}</span></div>
                    <div style={{fontSize:'0.82rem',color:'var(--iv-muted)'}}>{s.desc}</div>
                  </div>
                </div>
                <div style={{fontSize:'0.85rem',padding:'0.75rem',background:'rgba(234,179,8,0.04)',borderRadius:8,borderLeft:'3px solid var(--iv-gold)'}}>
                  {s.example}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              准备 6-8 个故事，覆盖以下类别。每个故事可以复用到多个问题。
            </div>
            {TOP_QUESTIONS.map((q, i) => (
              <div key={i} className="iv-card" style={{marginBottom:'0.5rem',cursor:'pointer'}} onClick={() => setExpandedQ(expandedQ===i?null:i)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:600,flex:1}}>{q.q}</div>
                  <span className="iv-tag gold">{q.category}</span>
                </div>
                {expandedQ === i && (
                  <div style={{marginTop:'0.5rem',paddingTop:'0.5rem',borderTop:'1px solid var(--iv-border)',fontSize:'0.85rem',color:'var(--iv-muted)'}}>
                    💡 {q.tips}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'dos' && (
          <div className="iv-grid-2">
            {[
              {type:'✅',title:'用"我"不用"我们"',desc:'面试官想知道你的贡献，不是团队的。'},
              {type:'✅',title:'数据量化结果',desc:'"提升了性能" → "P99 从 2s 降到 200ms"'},
              {type:'✅',title:'准备 follow-up',desc:'面试官会追问细节，深入准备每个故事。'},
              {type:'✅',title:'展示成长和反思',desc:'失败的故事比成功更有价值——关键在你的复盘。'},
              {type:'❌',title:'不要照本宣科',desc:'练到自然讲述，而非背稿。'},
              {type:'❌',title:'不要说"没有"',desc:"被问到失败/冲突时说'没遇到过'= 零分。"},
              {type:'❌',title:'不要抱怨前同事',desc:'即使对方确实有问题，也要中性描述、聚焦你的行动。'},
              {type:'❌',title:'不要超过 3 分钟',desc:'太长面试官会走神。S/T 各 30 秒，A 占 60%，R 30 秒。'},
            ].map(c => (
              <div key={c.title} className="iv-card">
                <div style={{fontWeight:700,color: c.type==='✅' ? 'var(--iv-green)' : 'var(--iv-red)',marginBottom:4}}>{c.type} {c.title}</div>
                <div style={{fontSize:'0.82rem',color:'var(--iv-muted)'}}>{c.desc}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prep' && (
          <div>
            <div className="iv-code-wrap">
              <div className="iv-code-head">
                <div className="iv-code-dot" style={{background:'#ef4444'}} />
                <div className="iv-code-dot" style={{background:'#eab308'}} />
                <div className="iv-code-dot" style={{background:'#22c55e'}} />
                <span>behavioral_prep_matrix.md</span>
              </div>
              <pre className="iv-code">{`# 行为面试备考矩阵
# 准备 6-8 个故事，标注每个故事能覆盖的题型

故事 1: API 性能优化项目
  ✅ 最有影响力的项目
  ✅ 技术挑战/难题
  ✅ 跨团队协作
  ✅ 在紧急截止日期下完成

故事 2: 与产品经理的需求分歧
  ✅ 与人意见不合
  ✅ 说服他人
  ✅ 数据驱动决策

故事 3: 新人入职遇到遗留代码
  ✅ 快速学习新技术
  ✅ 处理模糊需求
  ✅ 主动推动改进

故事 4: 线上故障排查（P0事故）
  ✅ 压力下的决策
  ✅ 失败/错误经历
  ✅ 事后复盘和改进

故事 5: 指导初级工程师
  ✅ 领导力/mentoring
  ✅ 团队建设
  ✅ 处理绩效问题

# 练习方式:
# 1. 写下每个故事的 STAR 大纲 (关键词即可)
# 2. 对着镜子/录音说一遍 (计时 2-3 分钟)
# 3. 找朋友模拟面试，练习被追问的即兴回答`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
