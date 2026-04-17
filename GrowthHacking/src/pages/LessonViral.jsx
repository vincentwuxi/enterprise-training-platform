import { useState } from 'react';
import './LessonCommon.css';

const VIRAL_TYPES = [
  { type: '口碑推荐', emoji: '💬', k: 0.3, desc: '用户主动告诉朋友有个好产品', example: 'Notion、Figma', color: '#10b981' },
  { type: '使用驱动', emoji: '🔄', k: 0.7, desc: '产品的使用行为本身就会触达新用户', example: 'Zoom 会议链接、Calendly', color: '#34d399' },
  { type: '激励推荐', emoji: '🎁', k: 1.2, desc: '双方奖励机制驱动用户邀请他人', example: 'Dropbox、拼多多', color: '#6ee7b7' },
  { type: '社交展示', emoji: '📸', k: 0.5, desc: '用户分享使用结果到社交平台', example: 'Spotify Wrapped、年度报告', color: '#a7f3d0' },
];

const REFERRAL_PROGRAMS = [
  {
    company: 'Dropbox',
    mechanism: '邀请好友注册，双方各得 500MB 存储空间',
    result: '用户量从 10 万增长到 400 万（15 个月, 3900%）',
    key: '奖励与产品核心价值直接相关 → 存储空间 = 使用动力',
  },
  {
    company: 'PayPal',
    mechanism: '每邀请一人注册，双方各得 $10',
    result: '日增 7-10% 用户，最终获得 1 亿用户',
    key: '早期现金补贴换取网络效应 → LTV >> CAC',
  },
  {
    company: 'Airbnb',
    mechanism: '邀请好友首住可获 $25 旅行基金',
    result: '推荐注册用户的预订率是自然注册的 2.5 倍',
    key: '推荐来的用户质量更高 → 朋友背书 = 信任感',
  },
  {
    company: '拼多多',
    mechanism: '砍一刀/拼团/助力免单',
    result: '3年内从0到3亿用户，社交裂变贡献 65%+',
    key: '社交压力 + 即时利益 + 低门槛 → 病毒系数 >1',
  },
];

export default function LessonViral() {
  const [activeTab, setActiveTab] = useState('kfactor');
  const [simK, setSimK] = useState(0.8);
  const [simUsers, setSimUsers] = useState(1000);

  // K-Factor simulation
  const rounds = [];
  let total = simUsers;
  let current = simUsers;
  for (let i = 0; i <= 8; i++) {
    rounds.push({ round: i, newUsers: Math.round(current), total: Math.round(total) });
    current = current * simK;
    total += current;
  }

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块六 · Viral Growth</div>
          <h1>裂变增长 — 病毒系数与推荐系统</h1>
          <p>当 K &gt; 1 时，增长是指数级的——每个用户带来超过一个新用户，你的产品就像病毒一样自发传播。掌握设计裂变增长引擎的完整方法论。</p>
        </div>

        <div className="gh-metrics">
          {[
            { v: 'K', l: '病毒系数' },
            { v: 'Ct', l: '传播周期' },
            { v: 'K>1', l: '指数增长阈值' },
            { v: 'LTV:CAC', l: '单位经济学' },
          ].map(m => (
            <div key={m.l} className="gh-metric-card">
              <div className="gh-metric-value">{m.v}</div>
              <div className="gh-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="gh-section">
          <h2>🧭 核心内容</h2>
          <div className="gh-tabs">
            {[['kfactor','K因子模型'],['types','裂变类型'],['cases','经典案例'],['design','设计策略']].map(([k,l]) => (
              <button key={k} className={`gh-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'kfactor' && (
            <div>
              <div className="gh-formula">K = i × c  (i=每用户发出的邀请数, c=邀请转化率)</div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1rem',fontSize:'0.9rem'}}>
                用下方滑块模拟不同 K 值对用户增长的影响。当 K≥1 时，用户可以自增长。
              </p>
              <div className="gh-card" style={{padding:'1.25rem'}}>
                <div style={{display:'flex',gap:'2rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                  <label style={{flex:1}}>
                    <span style={{fontSize:'0.8rem',color:'var(--gh-muted)'}}>初始用户</span>
                    <input type="range" min="100" max="10000" step="100" value={simUsers} onChange={e=>setSimUsers(+e.target.value)}
                      style={{width:'100%'}} />
                    <span style={{fontWeight:700,color:'var(--gh-primary)'}}>{simUsers.toLocaleString()}</span>
                  </label>
                  <label style={{flex:1}}>
                    <span style={{fontSize:'0.8rem',color:'var(--gh-muted)'}}>K 值</span>
                    <input type="range" min="0.1" max="2" step="0.1" value={simK} onChange={e=>setSimK(+e.target.value)}
                      style={{width:'100%'}} />
                    <span style={{fontWeight:700,color: simK >= 1 ? 'var(--gh-primary)' : '#ef4444'}}>{simK.toFixed(1)} {simK >= 1 ? '🚀 指数增长' : '📉 衰减增长'}</span>
                  </label>
                </div>
                <div className="gh-table-wrap">
                  <table className="gh-table">
                    <thead><tr><th>传播轮次</th><th>本轮新增</th><th>累计用户</th></tr></thead>
                    <tbody>
                      {rounds.map(r => (
                        <tr key={r.round} style={{color: r.round === 0 ? 'var(--gh-primary)' : undefined}}>
                          <td>{r.round === 0 ? '初始' : `第 ${r.round} 轮`}</td>
                          <td>{r.newUsers.toLocaleString()}</td>
                          <td style={{fontWeight:600}}>{r.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="gh-tip">💡 <span>K=0.8 时，初始 1000 个用户最终能带来 ~5000。K=1.2 时，增长永不停止——这就是 Dropbox 早期的增长奇迹。</span></div>
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                裂变不只是「分享有奖」。不同产品形态适合不同的病毒传播机制。
              </p>
              <div className="gh-grid-2">
                {VIRAL_TYPES.map(v => (
                  <div key={v.type} className="gh-card">
                    <div className="gh-card-title">{v.emoji} {v.type}</div>
                    <div className="gh-card-body">{v.desc}</div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:'0.5rem',fontSize:'0.8rem'}}>
                      <span style={{color:'var(--gh-muted)'}}>典型: {v.example}</span>
                      <span style={{color:'var(--gh-primary)',fontWeight:600}}>K ≈ {v.k}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="gh-code">{`# 裂变类型选择决策树
if product.has_network_effect:       # Slack, Zoom
    → 使用驱动型裂变 (产品本身就是传播渠道)
elif product.value_scales_with_data:  # Dropbox, iCloud
    → 激励推荐 (奖励 = 产品核心资源)
elif product.creates_shareable_content:  # Canva, Spotify
    → 社交展示型 (让创作成果自带传播力)
else:
    → 口碑推荐 + 精心设计倒逼体验 (先做到 NPS > 50)`}</div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                最经典的裂变案例，解剖它们的增长引擎核心逻辑。
              </p>
              <div className="gh-grid-1">
                {REFERRAL_PROGRAMS.map(r => (
                  <div key={r.company} className="gh-card">
                    <div className="gh-card-title" style={{color:'var(--gh-primary)',fontSize:'1.1rem'}}>{r.company}</div>
                    <div style={{fontSize:'0.88rem',margin:'0.5rem 0'}}><strong>机制：</strong>{r.mechanism}</div>
                    <div style={{fontSize:'0.88rem',margin:'0.5rem 0',color:'var(--gh-primary)'}}><strong>结果：</strong>{r.result}</div>
                    <div className="gh-tip" style={{marginTop:'0.5rem'}}>🔑 <span>{r.key}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                设计一个成功的推荐系统的 5 个关键要素：
              </p>
              <div className="gh-steps">
                {[
                  {t:'1. 双边激励', d:'邀请人和被邀请人都要有奖励。Dropbox 的「双方各得 500MB」比「你邀请好友得 1GB」效果好 2 倍。'},
                  {t:'2. 奖励与价值对齐', d:'奖励要跟产品核心价值相关——Airbnb 给旅行基金，不是优惠券；Evernote 给 Premium 月份。'},
                  {t:'3. 降低传播摩擦', d:'预写好邀请文案、生成专属链接、支持一键分享到微信/WhatsApp。每多一步，转化率降 30%。'},
                  {t:'4. 即时反馈', d:'用户邀请成功后立即通知并发放奖励，延迟奖励 = 失去信任 = 不再邀请。'},
                  {t:'5. 社交证明', d:'展示「已有 23 位朋友通过你的邀请加入」——排行榜、进度条、身份标签。'},
                ].map(s => (
                  <div key={s.t} className="gh-step">
                    <div className="gh-step-content">
                      <div className="gh-step-title">{s.t}</div>
                      <div className="gh-step-desc">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="gh-code">{`# 推荐系统数据模型
class ReferralProgram:
    def __init__(self):
        self.referrer_reward = "500MB"       # 邀请人奖励
        self.referee_reward = "500MB"         # 被邀请人奖励
        self.max_referrals_per_user = 32      # 防刷限制
        self.reward_trigger = "signup"        # 触发条件
        self.expiry_days = None               # 永不过期
        self.double_sided = True              # 双边激励

    def calculate_k_factor(self, period_days=30):
        invites_sent = self.get_invites(period_days)
        invites_accepted = self.get_conversions(period_days)
        active_users = self.get_active_users(period_days)
        
        i = invites_sent / active_users      # 每用户发出邀请数
        c = invites_accepted / invites_sent   # 邀请转化率
        return i * c                          # K 值`}</div>
            </div>
          )}
        </div>

        <div className="gh-section">
          <h2>📚 本章小结</h2>
          <div className="gh-steps">
            {[
              {t:'计算你的 K 值', d:'追踪邀请数 × 转化率，每周监控趋势。K < 0.5 说明产品还没有值得传播的 Aha Moment。'},
              {t:'选择适合你产品的裂变类型', d:'不是每个产品都适合「分享有奖」——找到产品天然的传播触点。'},
              {t:'设计双边激励推荐计划', d:'参考 Dropbox 模式，奖励与产品价值对齐，降低传播摩擦，提供即时反馈。'},
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
