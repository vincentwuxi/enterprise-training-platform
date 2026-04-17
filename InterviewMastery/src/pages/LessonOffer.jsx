import { useState } from 'react';
import './LessonCommon.css';

const COMP_STRUCTURE = [
  { component: '基本工资', desc: '固定月薪/年薪', example: '¥60万/年', pct: 40, color: '#22c55e' },
  { component: '年终奖金', desc: '通常 2-6 个月，视绩效', example: '¥15万 (3个月)', pct: 15, color: '#eab308' },
  { component: '股票/期权', desc: 'RSU 通常 4 年 vest', example: '¥80万 (4年)', pct: 30, color: '#3b82f6' },
  { component: '签字费', desc: '一次性入职奖金', example: '¥10万', pct: 10, color: '#8b5cf6' },
  { component: '福利', desc: '保险/补贴/餐饮/健身', example: '~¥5万/年', pct: 5, color: '#f59e0b' },
];

const NEGOTIATION_RULES = [
  { rule: '永远不要先报数字', emoji: '🤐', desc: '让对方先出价。被问到期望薪资时说："我更关注整体 package 的竞争力，希望了解贵司的 range。"' },
  { rule: '手里最好有 2+ 个 Offer', emoji: '🃏', desc: '这是最大的谈判筹码。即使你确定去 A，也要拿到 B/C 的 Offer。但不要编造——会被查。' },
  { rule: '谈的是 Total Compensation', emoji: '💰', desc: '不要只看 base salary。RSU、bonus、sign-on、福利加在一起才是真实收入。' },
  { rule: '展示你了解市场行情', emoji: '📊', desc: '引用 levels.fyi、脉脉等数据："据我了解，这个级别在贵司的 range 大约是 X-Y。"' },
  { rule: '永远保持友善专业', emoji: '🤝', desc: '谈判不是对抗。你和 recruiter 的关系会影响你未来在公司的合作体验。' },
  { rule: '拿到书面 Offer 再做决定', emoji: '📝', desc: '口头 Offer 不算数。确认 base/RSU/vest schedule/sign-on/start date 全部写入 Offer Letter。' },
];

const OFFER_COMPARE = [
  { attr: '基本工资', compA: '¥55万', compB: '¥48万', compC: '¥62万' },
  { attr: '年终奖金', compA: '4个月', compB: '2个月', compC: '3个月' },
  { attr: 'RSU (4年总)', compA: '¥120万', compB: '¥200万', compC: '¥60万' },
  { attr: 'TC 第一年', compA: '¥103万', compB: '¥98万', compC: '¥97万' },
  { attr: 'TC 第四年', compA: '¥85万', compB: '¥98万', compC: '¥77万' },
  { attr: '成长空间', compA: '⭐⭐⭐', compB: '⭐⭐⭐⭐⭐', compC: '⭐⭐' },
  { attr: 'WLB', compA: '⭐⭐⭐⭐', compB: '⭐⭐', compC: '⭐⭐⭐⭐⭐' },
  { attr: '团队匹配', compA: '⭐⭐⭐⭐', compB: '⭐⭐⭐⭐', compC: '⭐⭐⭐' },
];

export default function LessonOffer() {
  const [activeTab, setActiveTab] = useState('structure');

  const totalPct = COMP_STRUCTURE.reduce((s, c) => s + c.pct, 0);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge" style={{background:'rgba(139,92,246,0.07)',borderColor:'rgba(139,92,246,0.25)',color:'#a78bfa'}}>模块八 · Offer & Negotiation</div>
        <h1>Offer & 薪资 — 谈判策略 + Offer 对比 + 入职准备</h1>
        <p>面试通过只是开始——<strong>谈判技能</strong>可能让你的 TC 差 20-50%。掌握薪资结构、谈判策略和 Offer 对比框架，拿到你真正值得的报酬。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 核心内容</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['structure','薪资结构'],['negotiate','谈判策略'],['compare','Offer 对比'],['onboard','入职准备']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'structure' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              大厂薪资由 5 个部分组成。很多人只看 base salary，忽略了占比更大的 RSU。
            </div>
            {COMP_STRUCTURE.map(c => (
              <div key={c.component} className="iv-card" style={{marginBottom:'0.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{fontWeight:700}}>{c.component}</div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:'0.85rem',color:c.color,fontWeight:700}}>{c.example}</span>
                    <span className="iv-tag gold">{c.pct}%</span>
                  </div>
                </div>
                <div style={{fontSize:'0.82rem',color:'var(--iv-muted)',marginBottom:6}}>{c.desc}</div>
                <div className="iv-progress">
                  <div className="iv-progress-fill" style={{width:`${(c.pct/totalPct)*100}%`,background:c.color}} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'negotiate' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              薪资谈判的 6 条铁律——违反任何一条都可能让你少拿 10-30%。
            </div>
            {NEGOTIATION_RULES.map(r => (
              <div key={r.rule} className="iv-card" style={{marginBottom:'0.5rem'}}>
                <div style={{fontWeight:700,color:'#fbbf24',marginBottom:4}}>{r.emoji} {r.rule}</div>
                <div style={{fontSize:'0.85rem',color:'var(--iv-muted)'}}>{r.desc}</div>
              </div>
            ))}
            <div className="iv-code-wrap" style={{marginTop:'1rem'}}>
              <div className="iv-code-head">
                <div className="iv-code-dot" style={{background:'#ef4444'}} />
                <div className="iv-code-dot" style={{background:'#eab308'}} />
                <div className="iv-code-dot" style={{background:'#22c55e'}} />
                <span>negotiation_email_template.txt</span>
              </div>
              <pre className="iv-code">{`Hi [Recruiter],

Thank you so much for the offer! I'm very excited about the 
opportunity to join [Company] as a [Role].

I've given the offer careful consideration. Based on my 
research on market rates for this level and my competing 
offers, I was hoping we could discuss the compensation package.

Specifically, I'd love to explore:
- Base salary: I was hoping for something closer to [X]
- RSU: Given the 4-year vesting, would it be possible to 
  increase the grant to [Y]?
- Sign-on bonus: To bridge the gap in Year 1, would a 
  sign-on of [Z] be possible?

I'm genuinely excited about this role and believe I can make 
a significant impact. I'd love to find a package that works 
for both of us.

Best regards,
[Your Name]`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              多维度对比 Offer——不要只看第一年的 TC。
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="iv-table">
                <thead>
                  <tr>
                    <th>维度</th>
                    <th style={{color:'#22c55e'}}>🏢 公司 A (大厂)</th>
                    <th style={{color:'#3b82f6'}}>🚀 公司 B (高增长)</th>
                    <th style={{color:'#8b5cf6'}}>🏖️ 公司 C (外企)</th>
                  </tr>
                </thead>
                <tbody>
                  {OFFER_COMPARE.map(row => (
                    <tr key={row.attr}>
                      <td style={{fontWeight:600}}>{row.attr}</td>
                      <td>{row.compA}</td>
                      <td>{row.compB}</td>
                      <td>{row.compC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:'0.82rem',color:'var(--iv-muted)',marginTop:'1rem',padding:'0.75rem',background:'rgba(234,179,8,0.04)',borderRadius:8}}>
              💡 <strong>关键洞察</strong>：公司 B 第一年 TC 不是最高的，但 RSU 总量最大 + 成长空间最好。如果你看好公司前景，4 年 TC 最优。公司 C 第一年最低但 WLB 最好——取决于你的人生阶段。
            </div>
          </div>
        )}

        {activeTab === 'onboard' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              签了 Offer 到入职的 30 天准备清单：
            </div>
            {[
              { phase: '签约后 (Day 1-7)', items: ['确认 Offer Letter 所有条款', '了解 visa/relocation 细节', '通知现公司(提前 2-4 周)', '感谢所有面过的公司的 recruiter'] },
              { phase: '离职过渡 (Day 8-21)', items: ['完成工作交接文档', '与同事保持良好关系', '整理在职期间的成长笔记', '提前学习新公司的技术栈'] },
              { phase: '入职前 (Day 22-30)', items: ['阅读新公司的工程博客', '设置开发环境(提前装好工具)', '了解团队成员和汇报关系', '制定 30/60/90 天个人目标'] },
              { phase: '入职首周', items: ['主动约 1-on-1 认识团队', '快速找一个小 task 产出成果', '理解 oncall/release 流程', '找到 mentor 或 buddy'] },
            ].map(p => (
              <div key={p.phase} className="iv-card" style={{marginBottom:'0.5rem'}}>
                <div style={{fontWeight:700,color:'#fbbf24',marginBottom:'0.5rem'}}>{p.phase}</div>
                {p.items.map(item => (
                  <div key={item} style={{fontSize:'0.85rem',padding:'0.2rem 0',display:'flex',gap:6}}>
                    <span style={{color:'var(--iv-gold)'}}>▸</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🎓 课程总结</div>
        <div className="iv-card" style={{borderColor:'rgba(234,179,8,0.3)',background:'rgba(234,179,8,0.03)'}}>
          <div style={{fontSize:'1rem',fontWeight:700,color:'#fbbf24',marginBottom:'0.75rem'}}>🏆 恭喜你完成全部课程！</div>
          <div className="iv-grid-3">
            {[
              {e:'🧠',t:'算法 + 数据结构',d:'6 大模式 + 4 大数据结构 + DP 框架'},
              {e:'🏗️',t:'系统设计',d:'6 步框架 + 6 道经典大题'},
              {e:'💬',t:'行为面试',d:'STAR 法则 + 30 道高频题'},
              {e:'⏱️',t:'模拟面试',d:'计时器 + 复盘模板'},
              {e:'💰',t:'薪资谈判',d:'6 条铁律 + 邮件模板'},
              {e:'🚀',t:'入职准备',d:'30/60/90 天目标'},
            ].map(c => (
              <div key={c.t} style={{textAlign:'center',padding:'0.5rem'}}>
                <div style={{fontSize:'1.5rem',marginBottom:4}}>{c.e}</div>
                <div style={{fontWeight:700,fontSize:'0.82rem',marginBottom:2}}>{c.t}</div>
                <div style={{fontSize:'0.72rem',color:'var(--iv-muted)'}}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
