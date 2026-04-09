import { useState } from 'react';
import './LessonCommon.css';

const DP_PROBLEMS = [
  {
    key: 'coin', label: '零钱兑换', lc: '322', difficulty: 'medium',
    type: '完全背包',
    desc: '给定硬币面额和总金额，求最少硬币数。',
    state: 'dp[i] = 凑出金额 i 所需的最少硬币数',
    transition: 'dp[i] = min(dp[i - coin] + 1) for coin in coins',
    code: `def coinChange(coins, amount):
    # dp[i] = 凑出金额 i 所需最少硬币数
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # base case：金额0需要0个硬币
    
    for i in range(1, amount + 1):        # 遍历所有金额
        for coin in coins:                 # 遍历所有硬币
            if i >= coin:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1
# 时间 O(n*amount)  空间 O(amount)`,
  },
  {
    key: 'lcs', label: '最长公共子序列', lc: '1143', difficulty: 'medium',
    type: '区间/序列DP',
    desc: '给两个字符串，求最长公共子序列的长度。',
    state: 'dp[i][j] = s1[:i] 和 s2[:j] 的最长公共子序列长度',
    transition: 'dp[i][j] = dp[i-1][j-1]+1 (字符相同) 或 max(dp[i-1][j],dp[i][j-1])',
    code: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    # dp[i][j] = text1[:i] 和 text2[:j] 的 LCS 长度
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1   # 字符匹配，延伸
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])  # 跳过一个
    
    return dp[m][n]  # O(mn) 时间  O(mn) 空间`,
  },
  {
    key: 'stock', label: '买卖股票（含冷冻期）', lc: '309', difficulty: 'medium',
    type: '状态机DP',
    desc: '含冷冻期（卖出后需等1天）的股票最大利润。',
    state: 'hold=持有股票, sold=刚卖出, rest=冷冻/空仓',
    transition: '状态转移三条边：hold/sold/rest 相互转换',
    code: `def maxProfit(prices):
    # 三种状态：持有(hold)、刚卖(sold)、空仓(rest)
    hold = float('-inf')  # 持有股票时的最大利润
    sold = 0              # 刚卖出（下一天进入冷冻）
    rest = 0              # 冷冻或空仓
    
    for price in prices:
        prev_hold, prev_sold, prev_rest = hold, sold, rest
        hold = max(prev_hold, prev_rest - price)  # 继续持有 or 今天买入
        sold = prev_hold + price                   # 今天卖出
        rest = max(prev_rest, prev_sold)           # 继续空仓 or 冷冻结束
    
    return max(sold, rest)  # 最终不持有股票的最大利润
# 时间 O(n)  空间 O(1)`,
  },
  {
    key: 'edit', label: '编辑距离', lc: '72', difficulty: 'hard',
    type: '区间/序列DP',
    desc: '将 word1 变为 word2 的最少操作数（插入/删除/替换）。',
    state: 'dp[i][j] = word1[:i] 变为 word2[:j] 的最少操作数',
    transition: '字符相同dp[i-1][j-1]，否则 min(insert,delete,replace)+1',
    code: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    # base case: dp[0][j]=j (word1空，插入j个)
    #            dp[i][0]=i (word2空，删除i个)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]         # 字符相同，不需要操作
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # 删除 word1[i-1]
                    dp[i][j-1],    # 插入 word2[j-1]  
                    dp[i-1][j-1],  # 替换
                )
    return dp[m][n]`,
  },
];

const FIVE_STEPS = [
  { t: '确定 dp 数组含义', d: 'dp[i] 或 dp[i][j] 代表什么？是"前i个元素的最优解"还是"区间[i,j]的结果"？' },
  { t: '找 base case', d: '边界条件：dp[0]=? 或 dp[0][j]=j，dp[i][0]=i，直接可以确定的初始值' },
  { t: '写状态转移方程', d: 'dp[i] = f(dp[i-1], dp[i-2], ...)，从"上一个或上几个状态"推导当前状态' },
  { t: '确定遍历顺序', d: '从小到大（自底向上）还是从大到小？是否有依赖顺序（背包问题 0-1 vs 完全）' },
  { t: '打印 dp 数组验证', d: '手动追踪一个小例子，和预期结果对比，发现 off-by-one 错误' },
];

export default function LessonDP() {
  const [prob, setProb] = useState('coin');
  const p = DP_PROBLEMS.find(d => d.key === prob);

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块六 · Dynamic Programming</div>
          <h1>动态规划 — 状态定义与转移方程</h1>
          <p>DP 不是玄学，是「暴力递归 → 记忆化搜索 → 自底向上 DP」的系统化转化。掌握五步法和背包/序列/状态机三大模型，举一反三解决 80% DP 题。</p>
        </div>

        <div className="al-metrics">
          {[{ v: '5步', l: 'DP 解题法' }, { v: '背包', l: '最常见子模型' }, { v: 'LCS', l: '序列类经典' }, { v: '状态机', l: '股票/游戏类' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* 5-Step Method */}
        <div className="al-section">
          <h2>🪜 DP 五步解题法</h2>
          <div className="al-steps">
            {FIVE_STEPS.map((s, i) => (
              <div key={i} className="al-step">
                <div className="al-step-content">
                  <div className="al-step-title">{s.t}</div>
                  <div className="al-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="al-tip">💡 <span>遇到 DP 题先问自己：暴力递归怎么写？加 memo 能行吗？然后再转成 Bottom-Up。<strong>自顶向下理解，自底向上实现</strong>。</span></div>
        </div>

        {/* DP Problem Library */}
        <div className="al-section">
          <h2>📚 DP 经典题精讲</h2>
          <div className="al-tabs">
            {DP_PROBLEMS.map(d => (
              <button key={d.key} className={`al-tab${prob === d.key ? ' active' : ''}`} onClick={() => setProb(d.key)}>
                #{d.lc} {d.label}
              </button>
            ))}
          </div>
          {p && (
            <div className="al-problem">
              <div className="al-problem-header">
                <span className="al-problem-id">#{p.lc}</span>
                <span className="al-problem-title">{p.label}</span>
                <span className={`al-difficulty ${p.difficulty}`}>{p.difficulty === 'medium' ? '中等' : '困难'}</span>
                <span className="al-tag">{p.type}</span>
              </div>
              <div className="al-problem-body">
                <p style={{ color: 'var(--al-muted)', fontSize: '.9rem', marginBottom: '1rem' }}>{p.desc}</p>
                <div className="al-grid-2" style={{ marginBottom: '1rem' }}>
                  <div className="al-card">
                    <div className="al-card-title" style={{ color: 'var(--al-primary)' }}>① 状态定义</div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.82rem', color: 'var(--al-text)', marginTop: '.5rem', lineHeight: 1.7 }}>{p.state}</div>
                  </div>
                  <div className="al-card">
                    <div className="al-card-title" style={{ color: 'var(--al-accent)' }}>② 转移方程</div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.82rem', color: 'var(--al-text)', marginTop: '.5rem', lineHeight: 1.7 }}>{p.transition}</div>
                  </div>
                </div>
                <div className="al-code">{p.code}</div>
              </div>
            </div>
          )}
        </div>

        {/* 0-1 Knapsack */}
        <div className="al-section">
          <h2>🎒 背包问题精华</h2>
          <div className="al-code">{`# 0-1 背包（每件物品只用一次）
def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    
    for i in range(n):               # 遍历物品
        for j in range(capacity, weights[i] - 1, -1):  # ⚠️ 从大到小！防止重复选
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    return dp[capacity]

# 完全背包（每件物品可无限用）— 零钱兑换类型
def knapsack_complete(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for i in range(n):
        for j in range(weights[i], capacity + 1):  # ⚠️ 从小到大！允许重复选
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    return dp[capacity]

# 区别只在内层循环方向：
# 0-1背包: for j in range(capacity, w-1, -1)  ← 倒序
# 完全背包: for j in range(w, capacity+1)      ← 正序`}</div>
          <div className="al-warn">⚠️ <span>0-1 背包必须<strong>倒序</strong>内层循环。倒序保证每个物品的"之前状态"不受本轮选择影响，相当于不重复选。</span></div>
        </div>

        {/* Complexity Table */}
        <div className="al-section">
          <h2>📊 DP 高频题复杂度速查</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>题目</th><th>类型</th><th>时间</th><th>空间</th></tr></thead>
              <tbody>
                {[
                  ['#70 爬楼梯', '线性DP', 'O(n)', 'O(1)'],
                  ['#322 零钱兑换', '完全背包', 'O(n·amount)', 'O(amount)'],
                  ['#300 最长递增子序列', '序列DP', 'O(n²)/O(n log n)', 'O(n)'],
                  ['#1143 最长公共子序列', '双序列DP', 'O(mn)', 'O(mn)'],
                  ['#72 编辑距离', '双序列DP', 'O(mn)', 'O(mn)'],
                  ['#121~188 买卖股票系列', '状态机DP', 'O(n)', 'O(1)'],
                  ['#312 戳气球', '区间DP', 'O(n³)', 'O(n²)'],
                ].map(([t, type, time, space], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t}</td>
                    <td><span className="al-tag">{type}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-accent)', fontSize: '.82rem' }}>{time}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-blue)', fontSize: '.82rem' }}>{space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
