import { useState } from 'react';
import './LessonCommon.css';

const DP_PATTERNS = [
  { name: '线性 DP', emoji: '📏', difficulty: '⭐⭐', problems: ['Climbing Stairs','House Robber','Longest Increasing Subsequence','Maximum Subarray'], template: 'dp[i] = max(dp[i-1]+val, val)' },
  { name: '背包 DP', emoji: '🎒', difficulty: '⭐⭐⭐', problems: ['0/1 Knapsack','Coin Change','Partition Equal Subset Sum','Target Sum'], template: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi]+vi)' },
  { name: '区间 DP', emoji: '📐', difficulty: '⭐⭐⭐⭐', problems: ['Longest Palindromic Substring','Burst Balloons','Matrix Chain Multiplication'], template: 'dp[i][j] = min(dp[i][k]+dp[k+1][j]+cost)' },
  { name: '树形 DP', emoji: '🌲', difficulty: '⭐⭐⭐', problems: ['House Robber III','Diameter of Binary Tree','Binary Tree Maximum Path Sum'], template: 'dfs(node) → (take, skip)' },
  { name: '状态压缩 DP', emoji: '🔢', difficulty: '⭐⭐⭐⭐', problems: ['Traveling Salesman','Shortest Hamilton Path','Can I Win'], template: 'dp[mask][i] = min(dp[mask^(1<<j)][j]+dist[j][i])' },
  { name: '股票买卖系列', emoji: '📈', difficulty: '⭐⭐⭐', problems: ['Best Time to Buy/Sell I-IV','With Cooldown','With Fee'], template: 'dp[i][k][0/1] = max(hold, sell, buy)' },
];

const CLIMB_STAIRS = [
  { n: 1, dp: [1], explain: 'dp[1]=1: 只有一种方式 (1步)' },
  { n: 2, dp: [1,2], explain: 'dp[2]=2: 1+1 或 2' },
  { n: 3, dp: [1,2,3], explain: 'dp[3]=dp[1]+dp[2]=3' },
  { n: 4, dp: [1,2,3,5], explain: 'dp[4]=dp[2]+dp[3]=5' },
  { n: 5, dp: [1,2,3,5,8], explain: 'dp[5]=dp[3]+dp[4]=8' },
];

export default function LessonDP() {
  const [activeTab, setActiveTab] = useState('patterns');
  const [climbStep, setClimbStep] = useState(4);
  const [expandedPattern, setExpandedPattern] = useState(null);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge">模块四 · Dynamic Programming</div>
        <h1>动态规划 — DP 方程推导 + 经典套路 20 种</h1>
        <p>DP 不是"背公式"——而是学会把一个大问题<strong>分解为重叠子问题</strong>，找到<strong>状态定义</strong>和<strong>转移方程</strong>。掌握 6 大 DP 模式，你就能推导出 80% 的 DP 题。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 核心内容</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['patterns','六大模式'],['demo','爬楼梯推导'],['framework','解题框架'],['hard','高频难题']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'patterns' && (
          <div className="iv-grid-2">
            {DP_PATTERNS.map((p, i) => (
              <div key={p.name} className="iv-card" style={{cursor:'pointer'}} onClick={() => setExpandedPattern(expandedPattern===i?null:i)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700,color:'#fbbf24'}}>{p.emoji} {p.name}</div>
                  <span className="iv-tag gold">{p.difficulty}</span>
                </div>
                <div style={{fontSize:'0.8rem',color:'var(--iv-gold)',fontFamily:'JetBrains Mono,monospace',margin:'0.5rem 0',padding:'0.4rem 0.6rem',background:'rgba(234,179,8,0.06)',borderRadius:6}}>
                  {p.template}
                </div>
                {expandedPattern === i && (
                  <div style={{paddingTop:'0.5rem',borderTop:'1px solid var(--iv-border)'}}>
                    {p.problems.map(prob => (
                      <div key={prob} style={{fontSize:'0.82rem',padding:'0.2rem 0',display:'flex',gap:6}}>
                        <span style={{color:'var(--iv-gold)'}}>▸</span> {prob}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="iv-interactive">
            <h3>
              🪜 Climbing Stairs — DP 推导过程
              <div style={{display:'flex',gap:6}}>
                <button className="iv-btn" onClick={() => setClimbStep(Math.max(0,climbStep-1))} disabled={climbStep===0}>◀</button>
                <button className="iv-btn green" onClick={() => setClimbStep(Math.min(4,climbStep+1))} disabled={climbStep>=4}>▶</button>
              </div>
            </h3>
            <div style={{display:'flex',gap:8,justifyContent:'center',margin:'1.5rem 0',flexWrap:'wrap'}}>
              {CLIMB_STAIRS[climbStep].dp.map((v, i) => (
                <div key={i} style={{
                  width:52, height:52, borderRadius:10, display:'flex',alignItems:'center',justifyContent:'center',
                  background: i === climbStep ? 'linear-gradient(135deg,#b45309,#a16207)' : 'var(--iv-card)',
                  border: `2px solid ${i === climbStep ? '#eab308' : 'var(--iv-border)'}`,
                  flexDirection:'column', gap:2
                }}>
                  <div style={{fontSize:'0.65rem',color:'var(--iv-muted)'}}>n={i+1}</div>
                  <div style={{fontSize:'1.1rem',fontWeight:800,color: i === climbStep ? '#fef3c7' : '#fbbf24'}}>{v}</div>
                </div>
              ))}
            </div>
            <div className="iv-card">
              <div style={{fontWeight:700,color:'var(--iv-gold)'}}>dp[{CLIMB_STAIRS[climbStep].n}] = {CLIMB_STAIRS[climbStep].dp[climbStep]}</div>
              <div style={{fontSize:'0.85rem',color:'var(--iv-muted)',marginTop:4}}>{CLIMB_STAIRS[climbStep].explain}</div>
            </div>
            <div style={{fontSize:'0.82rem',color:'var(--iv-muted)',marginTop:'1rem',padding:'0.75rem',background:'rgba(234,179,8,0.04)',borderRadius:8}}>
              💡 <strong>转移方程</strong>：dp[i] = dp[i-1] + dp[i-2]（从第 i-1 阶走 1 步，或从第 i-2 阶走 2 步）
            </div>
          </div>
        )}

        {activeTab === 'framework' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              DP 解题五步法——面试时就按这个框架思考，跟面试官边写边讲。
            </div>
            {[
              {step:'1. 定义状态',desc:'dp[i] 代表什么？是前 i 个元素的最优解？还是以第 i 个元素结尾的最优解？',tip:'状态定义错了，后面全废。花 2 分钟想清楚这一步。'},
              {step:'2. 状态转移方程',desc:'dp[i] 怎么从 dp[i-1]、dp[i-2]... 推导出来？哪些子问题合成当前问题？',tip:'画个图，列出前几项，找规律。'},
              {step:'3. 初始化',desc:'dp[0]、dp[1] 等边界案例的值是什么？',tip:'边界错误是 DP bug 最常见的来源。'},
              {step:'4. 遍历顺序',desc:'从小到大还是从大到小？一维还是二维？',tip:'确保计算 dp[i] 时，它依赖的子问题已经算过。'},
              {step:'5. 空间优化',desc:'能不能用滚动数组把 O(n) 降到 O(1)？O(n²) 降到 O(n)？',tip:'先写出正确解，再优化空间——面试官会为此加分。'},
            ].map(s => (
              <div key={s.step} className="iv-card" style={{marginBottom:'0.5rem'}}>
                <div style={{fontWeight:700,color:'var(--iv-gold)',marginBottom:4}}>{s.step}</div>
                <div style={{fontSize:'0.88rem',marginBottom:4}}>{s.desc}</div>
                <div style={{fontSize:'0.8rem',color:'var(--iv-muted)'}}>💡 {s.tip}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hard' && (
          <div>
            <table className="iv-table">
              <thead><tr><th>#</th><th>题目</th><th>模式</th><th>难度</th><th>频率</th></tr></thead>
              <tbody>
                {[
                  ['1','Longest Increasing Subsequence','线性 DP','Medium','🔥🔥🔥'],
                  ['2','Coin Change','背包 DP','Medium','🔥🔥🔥'],
                  ['3','Edit Distance','二维 DP','Hard','🔥🔥🔥'],
                  ['4','Longest Common Subsequence','二维 DP','Medium','🔥🔥🔥'],
                  ['5','House Robber II (环形)','线性 DP','Medium','🔥🔥'],
                  ['6','Word Break','线性/背包','Medium','🔥🔥🔥'],
                  ['7','Partition Equal Subset Sum','背包 DP','Medium','🔥🔥'],
                  ['8','Burst Balloons','区间 DP','Hard','🔥🔥'],
                  ['9','Best Time Buy/Sell IV','状态机 DP','Hard','🔥🔥'],
                  ['10','Regular Expression Matching','二维 DP','Hard','🔥🔥🔥'],
                ].map(row => (
                  <tr key={row[0]}>
                    <td style={{fontWeight:700,color:'var(--iv-gold)'}}>{row[0]}</td>
                    <td style={{fontWeight:600}}>{row[1]}</td>
                    <td><span className="iv-tag purple">{row[2]}</span></td>
                    <td><span className={`iv-tag ${row[3]==='Hard'?'red':'gold'}`}>{row[3]}</span></td>
                    <td>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
