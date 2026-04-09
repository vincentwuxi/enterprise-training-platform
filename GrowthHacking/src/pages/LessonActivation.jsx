import { useState } from 'react';
import './LessonCommon.css';

const AHA_EXAMPLES = [
  { product: 'Twitter', aha: '关注 30 个人', timing: '注册后 5 分钟内', why: '关注才有 Feed，有 Feed 才有留存动力' },
  { product: 'Dropbox', aha: '上传第 1 个文件并在另一设备看到', timing: '注册后', why: '跨设备同步 = 核心价值时刻' },
  { product: 'LinkedIn', aha: '资料完整度达到 80%', timing: '注册后 7 天内', why: '资料完整 → 有人联系 → 社交价值闭环' },
  { product: '微信', aha: '添加第一个好友并发出消息', timing: '注册即时', why: '通讯工具无社交关系则毫无价值' },
];

const ONBOARD_STEPS = [
  { step: '注册', before: '填写 8 个字段', after: '一键 Google 登录', metric: '注册转化率 +38%' },
  { step: '引导', before: '5 页文字说明', after: '3 步交互式 Tutorial', metric: '完成引导率 +52%' },
  { step: '激活动作', before: '自由探索', after: '强引导到 Aha Moment', metric: '激活率 +29%' },
  { step: '首次成功', before: '用户自己发现价值', after: '即时反馈 + 庆祝时刻', metric: '次日留存 +18%' },
];

export default function LessonActivation() {
  const [ahaIdx, setAhaIdx] = useState(0);
  const [regFields, setRegFields] = useState(6);

  const conversionRate = Math.max(10, 85 - regFields * 9);

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块三 · Activation</div>
          <h1>激活与 Aha Moment — 留下第一批用户</h1>
          <p>用户注册不等于激活。找到你的 Aha Moment，设计无摩擦的 Onboarding 路径，让用户在 5 分钟内体验到核心价值。</p>
        </div>

        <div className="gh-metrics">
          {[
            { v: 'Aha', l: '价值时刻' },
            { v: '<5min', l: '激活黄金时间' },
            { v: '+30%', l: '精简注册提升' },
            { v: '3步', l: '最优引导步骤' },
          ].map(m => (
            <div key={m.l} className="gh-metric-card">
              <div className="gh-metric-value">{m.v}</div>
              <div className="gh-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Aha Moment */}
        <div className="gh-section">
          <h2>💡 寻找你的 Aha Moment</h2>
          <p style={{ color: 'var(--gh-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Aha Moment = 用户第一次真正"Get 到"你产品价值的那一刻。这个时刻越清晰、越快到达，激活率越高。
          </p>
          <div className="gh-tabs">
            {AHA_EXAMPLES.map((e, i) => (
              <button key={i} className={`gh-tab${ahaIdx === i ? ' active' : ''}`} onClick={() => setAhaIdx(i)}>
                {e.product}
              </button>
            ))}
          </div>
          <div className="gh-card" style={{ marginTop: '0' }}>
            <div className="gh-formula">{AHA_EXAMPLES[ahaIdx].aha}</div>
            <div className="gh-grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gh-muted)', marginBottom: '0.3rem' }}>触达时机</div>
                <div style={{ color: 'var(--gh-accent)', fontWeight: 600 }}>
                  ⏱️ {AHA_EXAMPLES[ahaIdx].timing}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gh-muted)', marginBottom: '0.3rem' }}>背后逻辑</div>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{AHA_EXAMPLES[ahaIdx].why}</div>
              </div>
            </div>
          </div>

          <div className="gh-tip" style={{ marginTop: '1rem' }}>
            💡 <span>如何找到自己的 Aha Moment？<strong>对比留存用户 vs 流失用户的行为差异</strong>——留存用户在注册后 7 天内做了什么，流失用户没做？</span>
          </div>
          <div className="gh-code">{`-- SQL: 找 Aha Moment（留存 vs 流失的行为差异）
WITH retained AS (
  SELECT user_id FROM users
  WHERE datediff(last_active, created_at) > 30  -- 留存用户
),
churned AS (
  SELECT user_id FROM users
  WHERE datediff(last_active, created_at) <= 3  -- 流失用户
)
SELECT 
  event_name,
  COUNT(CASE WHEN u.user_id IN (SELECT user_id FROM retained) THEN 1 END) AS retained_cnt,
  COUNT(CASE WHEN u.user_id IN (SELECT user_id FROM churned) THEN 1 END) AS churned_cnt,
  ROUND(
    COUNT(CASE WHEN u.user_id IN (SELECT user_id FROM retained) THEN 1 END) * 100.0 /
    COUNT(CASE WHEN u.user_id IN (SELECT user_id FROM churned) THEN 1 END), 1
  ) AS retained_vs_churned_ratio
FROM events e
JOIN users u USING(user_id)
WHERE datediff(e.created_at, u.created_at) <= 7  -- 前7天行为
GROUP BY event_name
ORDER BY retained_vs_churned_ratio DESC
LIMIT 10;`}</div>
        </div>

        {/* Registration Friction */}
        <div className="gh-section">
          <h2>🚧 注册摩擦实验室</h2>
          <p style={{ color: 'var(--gh-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            每增加一个注册字段，转化率平均下降 9%。拖动滑块体验摩擦效应：
          </p>
          <div className="gh-slider-wrap">
            <label>注册字段数量</label>
            <input type="range" className="gh-slider" min={1} max={9} step={1}
              value={regFields} onChange={e => setRegFields(+e.target.value)} />
            <span className="gh-slider-val">{regFields} 个</span>
          </div>
          <div className="gh-result">
            <div className="gh-result-title">预估注册转化率</div>
            <div className="gh-result-value" style={{ color: conversionRate > 50 ? 'var(--gh-primary)' : conversionRate > 30 ? 'var(--gh-accent)' : 'var(--gh-red)' }}>
              {conversionRate}%
            </div>
            <div className="gh-result-sub">
              {regFields <= 2 ? '✅ 极低摩擦，适合冷启动阶段' :
                regFields <= 4 ? '⚠️ 可接受，确保字段都是必要的' :
                  '❌ 摩擦过高，建议分步注册或砍掉非关键字段'}
            </div>
          </div>
          <div className="gh-warn" style={{ marginTop: '1rem' }}>
            ⚡ <span>最优实践：<strong>注册只要邮箱+密码</strong>（或一键登录），其他信息在激活成功后的 Profile 补全流程中收集。</span>
          </div>
        </div>

        {/* Onboarding Optimization */}
        <div className="gh-section">
          <h2>🗺️ Onboarding 路径优化</h2>
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead><tr><th>环节</th><th>优化前</th><th>优化后</th><th>效果</th></tr></thead>
              <tbody>
                {ONBOARD_STEPS.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--gh-primary)' }}>{s.step}</td>
                    <td style={{ color: 'var(--gh-red)', fontSize: '0.85rem' }}>❌ {s.before}</td>
                    <td style={{ color: 'var(--gh-primary)', fontSize: '0.85rem' }}>✅ {s.after}</td>
                    <td><span className="gh-tag">{s.metric}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gh-code" style={{ marginTop: '1rem' }}>{`# Onboarding 邮件激活序列（7天滴灌）

Day 0（注册后1小时）: 欢迎 + 引导完成第一个关键动作
  主题: "你还差一步——完成 [Aha Moment 动作]"
  CTA: 单一清晰按钮

Day 1: 核心功能 Tips（1个功能/邮件）
  主题: "[产品名] 的第一个超能力"
  
Day 3: 社会证明 + 案例
  主题: "[同类用户] 用 [产品名] 实现了 [成果]"

Day 5（如果未激活）: 触发 "我能帮到你吗？" CSM 介入

Day 7（如果未激活）: 最后挽留
  主题: "还有什么我们可以改进的？"（收集流失原因）`}</div>
        </div>

        {/* Activation Checklist */}
        <div className="gh-section">
          <h2>✅ 激活率提升 Top 5 杠杆</h2>
          <div className="gh-steps">
            {[
              { t: '减少注册字段到 ≤ 3 个', d: '用 OAuth 一键登录替代手动填表，能达到的话只要邮箱' },
              { t: '强制引导到 Aha Moment', d: '注册后不要"自由探索"，用进度条引导用户完成 1-3 个关键动作' },
              { t: '即时成功反馈', d: '用户完成激活动作时，给予庆祝反馈（动画/音效/积分）强化正向行为' },
              { t: '7 天激活邮件序列', d: '自动化滴灌，不同行为触发不同内容（用 Braze/Customer.io）' },
              { t: '分析 "激活失败"用户', d: '每周看一遍流失用户的行为录像（Hotjar/FullStory），找出最大卡点' },
            ].map((item, i) => (
              <div key={i} className="gh-step">
                <div className="gh-step-content">
                  <div className="gh-step-title">{item.t}</div>
                  <div className="gh-step-desc">{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
