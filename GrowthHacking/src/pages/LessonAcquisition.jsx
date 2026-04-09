import { useState } from 'react';
import './LessonCommon.css';

const CHANNELS = [
  { name: 'SEO 内容', cac: '¥12', scale: '高', speed: '慢', fit: ['SaaS','内容产品','工具类'] },
  { name: 'SEM 投放', cac: '¥85', scale: '高', speed: '快', fit: ['电商','本地服务','高客单'] },
  { name: '社交裂变', cac: '¥5', scale: '中', speed: '快', fit: ['社交App','消费品','游戏'] },
  { name: 'KOL/达人', cac: '¥60', scale: '中', speed: '中', fit: ['美妆','食品','新消费'] },
  { name: '私域流量', cac: '¥8', scale: '中', speed: '中', fit: ['教育','零售','社区'] },
  { name: 'PR/媒体', cac: '¥0~200', scale: '低', speed: '不可控', fit: ['品牌','B2B','融资期'] },
];

const HOOKS = [
  {
    name: '稀缺钩子',
    example: '"仅剩 3 个名额"',
    formula: '限时限量 → 行动紧迫感',
    code: `// 动态倒计时组件
const Countdown = ({ deadline }) => {
  const [left, setLeft] = useState(calcTimeLeft(deadline));
  useEffect(() => {
    const t = setInterval(() => setLeft(calcTimeLeft(deadline)), 1000);
    return () => clearInterval(t);
  }, []);
  return <div className="countdown">{left.h}h {left.m}m {left.s}s</div>;
};`,
  },
  {
    name: '社交证明',
    example: '"已有 12,847 人加入"',
    formula: '群体行为 → 从众效应',
    code: `// 实时计数器（WebSocket 推送）
// 后端: 每5秒广播当前注册数
socket.on('user_count', (count) => {
  setUserCount(count.toLocaleString());
});
// 前端: 数字滚动动画
<AnimatedCounter value={userCount} duration={800} />`,
  },
  {
    name: '互惠钩子',
    example: '"免费获取完整报告"',
    formula: '先给价值 → 降低获客摩擦',
    code: `// Lead Magnet 转化漏斗
// 1. 提供免费资产（报告/工具/模板）
// 2. 邮件 + 姓名（低承诺）
// 3. 激活邮件序列 → 转化付费
const LeadMagnet = ({ asset }) => (
  <form onSubmit={handleSubmit}>
    <input name="email" placeholder="输入邮箱，立即获取" />
    <button>免费下载</button>
  </form>
);`,
  },
];

export default function LessonAcquisition() {
  const [activeChannel, setActiveChannel] = useState(0);
  const [budget, setBudget] = useState(50000);
  const [hookIdx, setHookIdx] = useState(0);

  const cac = [12, 85, 5, 60, 8, 120][activeChannel];
  const users = Math.floor(budget / cac);

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块二 · Acquisition</div>
          <h1>用户获取 — 低成本高效率拉新</h1>
          <p>渠道矩阵管理、钩子策略、CAC 计算与渠道 ROI 优化——让每一分获客预算发挥最大效益。</p>
        </div>

        {/* Channel Matrix */}
        <div className="gh-section">
          <h2>📣 渠道矩阵 — 找到你的主力渠道</h2>
          <div className="gh-tip">💡 <span>早期聚焦 1-2 个渠道，验证 PMF 后再横向扩展。"什么都做"等于"什么都没做好"。</span></div>
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead>
                <tr><th>渠道</th><th>平均 CAC</th><th>规模上限</th><th>起效速度</th><th>适合产品</th></tr>
              </thead>
              <tbody>
                {CHANNELS.map((c, i) => (
                  <tr key={i} style={{ cursor: 'pointer', background: activeChannel === i ? 'rgba(16,185,129,0.06)' : '' }}
                    onClick={() => setActiveChannel(i)}>
                    <td style={{ fontWeight: 600, color: 'var(--gh-primary)' }}>{c.name}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cac}</td>
                    <td><span className={`gh-tag ${c.scale === '高' ? '' : c.scale === '中' ? 'amber' : 'red'}`}>{c.scale}</span></td>
                    <td style={{ color: 'var(--gh-muted)', fontSize: '0.85rem' }}>{c.speed}</td>
                    <td>
                      <div className="gh-tags">{c.fit.map(f => <span key={f} className="gh-tag purple">{f}</span>)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CAC Calculator */}
          <div className="gh-card" style={{ marginTop: '1.25rem' }}>
            <div className="gh-card-title">🧮 CAC 预算计算器（{CHANNELS[activeChannel].name}）</div>
            <div className="gh-slider-wrap" style={{ marginTop: '1rem' }}>
              <label>月度预算</label>
              <input type="range" className="gh-slider" min={5000} max={500000} step={5000}
                value={budget} onChange={e => setBudget(+e.target.value)} />
              <span className="gh-slider-val">¥{(budget / 1000).toFixed(0)}K</span>
            </div>
            <div className="gh-result">
              <div className="gh-result-title">预计新增用户（CAC = {CHANNELS[activeChannel].cac}）</div>
              <div className="gh-result-value">{users.toLocaleString()} 用户/月</div>
              <div className="gh-result-sub">人均获客成本 {CHANNELS[activeChannel].cac}，月预算 ¥{budget.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Hook Strategy */}
        <div className="gh-section">
          <h2>🪝 钩子策略 — 降低第一步的摩擦</h2>
          <div className="gh-tabs">
            {HOOKS.map((h, i) => (
              <button key={i} className={`gh-tab${hookIdx === i ? ' active' : ''}`} onClick={() => setHookIdx(i)}>
                {h.name}
              </button>
            ))}
          </div>
          <div className="gh-card">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div className="gh-card-title" style={{ color: 'var(--gh-primary)', fontSize: '1.1rem' }}>示例：{HOOKS[hookIdx].example}</div>
            </div>
            <div className="gh-formula">{HOOKS[hookIdx].formula}</div>
            <div className="gh-code">{HOOKS[hookIdx].code}</div>
          </div>
        </div>

        {/* SEO vs SEM */}
        <div className="gh-section">
          <h2>🔍 SEO × SEM — 搜索流量双引擎</h2>
          <div className="gh-grid-2">
            <div className="gh-card">
              <div className="gh-card-title" style={{ color: '#10b981' }}>✅ SEO — 长线复利</div>
              <div className="gh-code" style={{ marginTop: '0.75rem' }}>{`# 内容 SEO 飞轮
关键词研究 (Ahrefs/SEMrush)
  ↓
创作 Pillar + Cluster 内容体系
  ↓  
内链建设 + 外链获取
  ↓
排名提升 → 流量 → 更多外链
  ↓ (循环)

# 核心指标
- DR (Domain Rating): 目标 > 40
- Organic Traffic: 月增 15%+
- Keyword Rankings: Top 3 占比`}</div>
            </div>
            <div className="gh-card">
              <div className="gh-card-title" style={{ color: '#f59e0b' }}>⚡ SEM — 即时可控</div>
              <div className="gh-code" style={{ marginTop: '0.75rem' }}>{`# Google Ads 优化清单
QS (Quality Score) 提升:
  - 广告相关性 > 7/10
  - 落地页体验 > 8/10
  - 预期 CTR > 行业均值

ROI 公式:
  ROAS = 广告收入 / 广告支出
  目标: ROAS > 3x (至少 > 1.5x)

出价策略:
  冷启动 → 手动 CPC
  数据积累 → 智能出价 (tCPA)
  规模扩张 → Maximize Conversions`}</div>
            </div>
          </div>
        </div>

        {/* Viral Loop */}
        <div className="gh-section">
          <h2>📊 获客漏斗诊断框架</h2>
          <div className="gh-code">{`# 获客健康度自检 Checklist

□ 是否知道每个渠道的精确 CAC？
  → 目标: CAC < LTV / 3（至少 < LTV）

□ CAC 回收周期是否可接受？
  → SaaS: 目标 < 12 个月
  → 电商: 目标 < 3 个月

□ 是否在做渠道归因（Attribution）？
  → 工具: GA4 / MixPanel / AppsFlyer
  → 模型: Last-click / Data-driven

□ 是否有内容资产积累（SEO）？
  → 每月至少产出 4 篇 Cluster 文章

□ 最高效渠道的预算是否足够？
  → 找到 1 个 ROI > 3x 的渠道，
    All-in 直到边际成本上升`}</div>
          <div className="gh-tip">🚀 <span>Sean Ellis 规律：真正做到 Product-Market Fit 的产品，<strong>40%+ 的用户</strong>会说"如果失去这款产品，我会非常失望"。PMF 之前别大力做获客。</span></div>
        </div>

      </div>
    </div>
  );
}
