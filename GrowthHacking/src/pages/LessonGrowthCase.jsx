import { useState } from 'react';
import './LessonCommon.css';

const TIMELINE = [
  { week: 'W1-2', phase: '诊断期', emoji: '🔍', tasks: ['埋点审计 & 数据治理', '绘制全链路漏斗', '定位最大漏点'], result: '发现注册→激活转化率仅 18%（行业均值 35%）' },
  { week: 'W3-4', phase: '激活攻坚', emoji: '⚡', tasks: ['Onboarding 流程从 7 步简化到 3 步', '新增「首单 0 元体验包」', 'A/B 测试 3 个引导方案'], result: '激活率提升至 41%（+128%）' },
  { week: 'W5-8', phase: '留存深耕', emoji: '🔄', tasks: ['建立推送策略（商品降价/库存预警）', '搭建用户分层模型（RFM）', '流失预警邮件序列上线'], result: '30日留存从 12% 提升至 28%' },
  { week: 'W9-12', phase: '裂变引爆', emoji: '🚀', tasks: ['推荐有奖计划上线（双边 ¥15）', '拼团功能 + 限时秒杀', '社群运营 + KOC 种草'], result: 'K 值从 0.3 提升至 0.85，月新增 8 万' },
  { week: 'W13-20', phase: '规模化', emoji: '📈', tasks: ['渠道 ROI 优化 — 砍掉 CAC>LTV 渠道', '自动化营销 workflow 上线', '数据看板 + 周报全自动化'], result: '从 1 万用户增长到 50 万' },
  { week: 'W21-36', phase: '增长飞轮', emoji: '♻️', tasks: ['UGC 社区激励体系', '会员体系 & 等级权益', '供应链效率提升 → 复购率↑'], result: '月活 100 万，LTV/CAC = 4.2' },
];

const DECISIONS = [
  {
    q: '激活率 18%，应该先优化注册流程还是首页体验？',
    a: '选择优化注册→激活流程',
    why: '用户已经注册了（说明获取没问题），但激活率低说明首次体验断裂。优化 Onboarding 是 ROI 最高的动作。',
    data: '通过漏斗发现：注册后首页停留 <8 秒的用户占 67% →首页信息过载。',
  },
  {
    q: '推荐有奖的金额应该设多少？',
    a: '双边各 ¥15（首单 AOV 的 ~15%）',
    why: 'CAC ≈ ¥40，LTV ≈ ¥180。¥30 的推荐成本远低于渠道 CAC，且推荐用户的 LTV 是自然用户的 1.8 倍。',
    data: 'A/B 测试 ¥10 vs ¥15 vs ¥25：¥15 的 K 值最高（¥25 吸引了大量薅羊毛用户，质量差）。',
  },
  {
    q: '用户增长到 30 万后增速放缓，怎么办？',
    a: '从「拉新驱动」切换到「留存驱动」',
    why: '边际获客成本递增是必然的。增长的第二曲线 = 提升用户粘性 + ARPU。',
    data: 'RFM 分析发现 Top 20% 用户贡献 65% 收入 → 做好「高价值用户运营」比拉新更值。',
  },
];

export default function LessonGrowthCase() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [expandedDecision, setExpandedDecision] = useState(null);

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块八 · Growth Case Study</div>
          <h1>实战项目 — 电商 App 从 1 万到 100 万用户</h1>
          <p>完整复盘一个电商 App 的增长全程：从诊断问题、制定策略、执行实验到规模化增长，每一步都有数据佐证和关键决策点分析。</p>
        </div>

        <div className="gh-metrics">
          {[
            { v: '1万→100万', l: '用户增长' },
            { v: '36周', l: '执行周期' },
            { v: '4.2x', l: 'LTV/CAC' },
            { v: '0.85', l: 'K 值' },
          ].map(m => (
            <div key={m.l} className="gh-metric-card">
              <div className="gh-metric-value">{m.v}</div>
              <div className="gh-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="gh-section">
          <h2>🧭 增长全程</h2>
          <div className="gh-tabs">
            {[['timeline','增长时间线'],['decisions','关键决策'],['metrics','指标变化'],['lessons','教训总结']].map(([k,l]) => (
              <button key={k} className={`gh-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'timeline' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                以下是完整的 36 周增长时间线。注意每个阶段的<strong>聚焦点</strong>不同——增长不是同时做所有事。
              </p>
              <div className="gh-grid-1">
                {TIMELINE.map(t => (
                  <div key={t.week} className="gh-card">
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'0.5rem'}}>
                      <span style={{fontSize:'1.3rem'}}>{t.emoji}</span>
                      <div>
                        <div style={{fontSize:'0.75rem',color:'var(--gh-muted)'}}>{t.week}</div>
                        <div className="gh-card-title" style={{margin:0}}>{t.phase}</div>
                      </div>
                    </div>
                    <div style={{marginBottom:'0.5rem'}}>
                      {t.tasks.map(task => (
                        <div key={task} style={{fontSize:'0.85rem',padding:'0.2rem 0',display:'flex',gap:6}}>
                          <span style={{color:'var(--gh-primary)'}}>▸</span> {task}
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:'0.82rem',color:'var(--gh-primary)',fontWeight:600,padding:'0.5rem 0.75rem',background:'rgba(16,185,129,0.08)',borderRadius:6}}>
                      📊 {t.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'decisions' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                增长过程中最重要的不是执行力，而是<strong>做对选择</strong>。以下是 3 个关键决策及其数据依据。
              </p>
              <div className="gh-grid-1">
                {DECISIONS.map((d, i) => (
                  <div key={i} className="gh-card" style={{cursor:'pointer'}} onClick={() => setExpandedDecision(expandedDecision === i ? null : i)}>
                    <div className="gh-card-title" style={{color:'var(--gh-primary)'}}>🤔 {d.q}</div>
                    <div style={{fontSize:'0.9rem',fontWeight:600,margin:'0.5rem 0'}}>
                      ✅ 决策：{d.a}
                    </div>
                    {expandedDecision === i && (
                      <div style={{marginTop:'0.5rem'}}>
                        <div style={{fontSize:'0.85rem',marginBottom:'0.5rem'}}><strong>理由：</strong>{d.why}</div>
                        <div className="gh-tip">📊 <span><strong>数据佐证：</strong>{d.data}</span></div>
                      </div>
                    )}
                    {expandedDecision !== i && (
                      <div style={{fontSize:'0.78rem',color:'var(--gh-muted)'}}>点击展开详细分析 ▾</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                关键指标的变化轨迹 — 从开始到 100 万用户的核心数据演进。
              </p>
              <div className="gh-table-wrap">
                <table className="gh-table">
                  <thead>
                    <tr>
                      <th>指标</th>
                      <th>起点 (W0)</th>
                      <th>W12</th>
                      <th>W24</th>
                      <th>W36 (终)</th>
                      <th>变化</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['用户数', '10,000', '58,000', '320,000', '1,020,000', '×102'],
                      ['激活率', '18%', '41%', '52%', '58%', '+222%'],
                      ['30日留存', '12%', '28%', '34%', '38%', '+217%'],
                      ['K 值', '0.15', '0.45', '0.72', '0.85', '+467%'],
                      ['CAC', '¥65', '¥42', '¥35', '¥28', '-57%'],
                      ['LTV', '¥80', '¥120', '¥155', '¥180', '+125%'],
                      ['LTV/CAC', '1.2x', '2.9x', '4.4x', '6.4x', '+433%'],
                      ['月收入', '¥8万', '¥52万', '¥240万', '¥680万', '×85'],
                    ].map(row => (
                      <tr key={row[0]}>
                        <td style={{fontWeight:600}}>{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                        <td style={{color:'var(--gh-primary)',fontWeight:600}}>{row[4]}</td>
                        <td style={{color:'var(--gh-primary)',fontWeight:700}}>{row[5]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="gh-tip">💡 <span>注意 LTV/CAC 的变化：早期 1.2x 几乎不赚钱，但随着留存提升和 CAC 下降，后期达到 6.4x — <strong>留存才是最好的增长</strong>。</span></div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                过程中踩过的坑和血泪教训，避免重复犯错。
              </p>
              <div className="gh-grid-2">
                {[
                  {t:'❌ 过早追求规模化', d:'W4 就想花钱投放拉新，但激活率只有 18%。投进来的用户大量流失，等于烧钱。应先修好桶再灌水。', fix:'先优化到激活率 >35%，再加大投放。'},
                  {t:'❌ 同时跑太多实验', d:'W6 同时跑了 7 个 A/B 实验，导致用户分流太细，没有一个达到统计显著性。', fix:'每次最多 2-3 个不冲突的实验，保证每个有足够样本。'},
                  {t:'✅ 数据先行的文化', d:'从 W1 就建立了完整的埋点体系和自动化看板，所有决策都有数据支撑。', fix:'投资数据基建的 ROI 是最高的——它让后续所有优化都有据可依。'},
                  {t:'✅ 聚焦单点突破', d:'每个阶段只聚焦一个漏斗环节。W3-4 只做激活，W5-8 只做留存，W9-12 才做裂变。', fix:'贪多嚼不烂。与其同时优化 5 个指标提升 5%，不如专注 1 个提升 50%。'},
                  {t:'❌ 忽略渠道质量', d:'W10 发现某信息流渠道 CPA 最低，大量投入。后来发现该渠道用户 7 日留存只有 5%。', fix:'CAC 低 ≠ 好渠道。看 LTV/CAC 和留存，而非只看获取成本。'},
                  {t:'✅ 推荐比投放好用', d:'推荐来的用户 LTV 是投放用户的 1.8 倍，因为朋友背书 = 信任感 + 使用场景契合。', fix:'把部分获客预算转移到推荐奖励，单位经济学好得多。'},
                ].map(c => (
                  <div key={c.t} className="gh-card">
                    <div className="gh-card-title">{c.t}</div>
                    <div className="gh-card-body">{c.d}</div>
                    <div className="gh-tip" style={{marginTop:'0.5rem'}}>🔑 <span>{c.fix}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="gh-section">
          <h2>📚 课程总结</h2>
          <div className="gh-steps">
            {[
              {t:'增长是系统工程', d:'不是拍脑袋的灵感，而是「假设→实验→数据→迭代」的科学方法。建立实验文化是最重要的一步。'},
              {t:'聚焦比全面更重要', d:'每个阶段只打一个仗。先修桶（激活/留存），再灌水（获客/裂变），最后加杠杆（规模化）。'},
              {t:'数据驱动每一个决策', d:'从指标体系到自动化看板到 A/B 测试，让数据说话，而非直觉。'},
              {t:'留存是增长的基石', d:'LTV/CAC 的改善主要来自留存提升和 CAC 下降。留住现有用户比获取新用户的 ROI 高 5-10 倍。'},
            ].map(s => (
              <div key={s.t} className="gh-step">
                <div className="gh-step-content">
                  <div className="gh-step-title">{s.t}</div>
                  <div className="gh-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
