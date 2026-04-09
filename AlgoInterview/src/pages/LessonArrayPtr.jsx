import { useState } from 'react';
import './LessonCommon.css';

const PROBLEMS = [
  {
    id: 1, title: 'Two Sum', difficulty: 'easy', tag: '哈希/双指针',
    desc: '给定整数数组 nums 和目标值 target，找出两个数之和等于 target 的下标。',
    template: '哈希表一次遍历',
    code: `def twoSum(nums: list[int], target: int) -> list[int]:
    # 模板：哈希表 — 边遍历边查
    seen = {}  # val → index
    for i, v in enumerate(nums):
        complement = target - v
        if complement in seen:
            return [seen[complement], i]
        seen[v] = i
    return []

# 时间 O(n)  空间 O(n)
# 关键：不能用双指针（数组无序），必须用哈希`,
    complexity: ['O(n)', 'O(n)'],
  },
  {
    id: 15, title: '3Sum', difficulty: 'medium', tag: '双指针',
    desc: '找出所有不重复的三元组，使 nums[i]+nums[j]+nums[k]=0。',
    template: '排序 + 固定一个 + 双指针',
    code: `def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()          # 必须排序
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]: continue  # 去重
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l+1]: l += 1  # 去重
                while l < r and nums[r] == nums[r-1]: r -= 1  # 去重
                l += 1; r -= 1
            elif s < 0: l += 1
            else:       r -= 1
    return res  # O(n²) 时间  O(1) 空间（排序原地）`,
    complexity: ['O(n²)', 'O(1)'],
  },
  {
    id: 76, title: '最小覆盖子串', difficulty: 'hard', tag: '滑动窗口',
    desc: '给定字符串 s 和 t，找 s 中包含 t 所有字符的最短子串。',
    template: '滑动窗口通用模板',
    code: `def minWindow(s: str, t: str) -> str:
    from collections import Counter
    need = Counter(t)   # 需要的字符及次数
    window = {}         # 窗口内字符次数
    left = right = 0
    valid = 0           # 已满足条件的字符数
    start, min_len = 0, float('inf')
    
    while right < len(s):
        c = s[right]; right += 1     # 右扩窗口
        if c in need:
            window[c] = window.get(c, 0) + 1
            if window[c] == need[c]: valid += 1
        
        while valid == len(need):    # 窗口满足条件 → 左收
            if right - left < min_len:
                start, min_len = left, right - left
            d = s[left]; left += 1
            if d in need:
                if window[d] == need[d]: valid -= 1
                window[d] -= 1
    
    return s[start:start+min_len] if min_len != float('inf') else ""`,
    complexity: ['O(n)', 'O(k)'],
  },
  {
    id: 560, title: '和为 K 的子数组', difficulty: 'medium', tag: '前缀和',
    desc: '给定整数数组 nums 和整数 k，返回和等于 k 的连续子数组的个数。',
    template: '前缀和 + 哈希表',
    code: `def subarraySum(nums: list[int], k: int) -> int:
    # 前缀和：prefix[j] - prefix[i] = k → prefix[i] = prefix[j] - k
    count = 0
    prefix_sum = 0
    seen = {0: 1}   # 前缀和 → 出现次数，初始 {0:1} 处理从头开始的情况
    
    for num in nums:
        prefix_sum += num
        # 查找之前是否有 (prefix_sum - k) 的前缀和
        count += seen.get(prefix_sum - k, 0)
        seen[prefix_sum] = seen.get(prefix_sum, 0) + 1
    
    return count  # 时间 O(n)  空间 O(n)`,
    complexity: ['O(n)', 'O(n)'],
  },
];

const SLIDING_WINDOW = [2, 3, 4, 8, 5, 1, 9, 6, 7];

export default function LessonArrayPtr() {
  const [probIdx, setProbIdx] = useState(0);
  const [wLeft, setWLeft] = useState(0);
  const [wRight, setWRight] = useState(2);
  const [pLeft, setPLeft] = useState(0);
  const [pRight, setPRight] = useState(8);
  const [activeTab, setActiveTab] = useState('slide');

  const windowSum = SLIDING_WINDOW.slice(wLeft, wRight + 1).reduce((a, b) => a + b, 0);
  const prob = PROBLEMS[probIdx];

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块一 · Arrays & Two Pointers</div>
          <h1>数组 & 双指针 — 高频模板精讲</h1>
          <p>滑动窗口、Two Sum 系列、前缀和、差分数组——面试出现频率最高的数组技巧，掌握模板即可举一反三。</p>
        </div>

        <div className="al-metrics">
          {[{ v: '4类', l: '核心模板' }, { v: '30+', l: '相关 LeetCode 题' }, { v: '双指针', l: '最通用技巧' }, { v: 'O(n)', l: '目标时间复杂度' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Interactive Visualizer */}
        <div className="al-section">
          <h2>🎮 交互式可视化</h2>
          <div className="al-tabs">
            {[['slide', '滑动窗口'], ['two', '双指针'], ['prefix', '前缀和']].map(([k, l]) => (
              <button key={k} className={`al-tab${activeTab === k ? ' active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'slide' && (
            <div>
              <p style={{ color: 'var(--al-muted)', fontSize: '.9rem', marginBottom: '1rem' }}>拖动滑块控制窗口位置，观察窗口内元素变化：</p>
              <div className="al-array" style={{ marginBottom: '2rem' }}>
                {SLIDING_WINDOW.map((v, i) => (
                  <div key={i} className={`al-cell${i >= wLeft && i <= wRight ? ' window' : ''}`}>
                    {v}
                    {i === wLeft && <span className="al-ptr-label" style={{ color: 'var(--al-primary)' }}>L</span>}
                    {i === wRight && <span className="al-ptr-label" style={{ color: 'var(--al-accent)' }}>R</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>左指针 L = {wLeft}</label>
                  <input type="range" className="al-tab" style={{ width: '100%', marginTop: '.5rem' }}
                    min={0} max={wRight} value={wLeft} onChange={e => setWLeft(+e.target.value)} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>右指针 R = {wRight}</label>
                  <input type="range" style={{ width: '100%', marginTop: '.5rem' }}
                    min={wLeft} max={SLIDING_WINDOW.length - 1} value={wRight} onChange={e => setWRight(+e.target.value)} />
                </div>
              </div>
              <div style={{ background: 'var(--al-surface2)', border: '1px solid var(--al-border)', borderRadius: 10, padding: '1rem 1.5rem', display: 'flex', gap: '2rem' }}>
                <div><div style={{ fontSize: '.75rem', color: 'var(--al-muted)' }}>窗口大小</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--al-primary)' }}>{wRight - wLeft + 1}</div></div>
                <div><div style={{ fontSize: '.75rem', color: 'var(--al-muted)' }}>窗口和</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--al-accent)' }}>{windowSum}</div></div>
                <div><div style={{ fontSize: '.75rem', color: 'var(--al-muted)' }}>元素</div><div style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-text)' }}>[{SLIDING_WINDOW.slice(wLeft, wRight + 1).join(', ')}]</div></div>
              </div>
            </div>
          )}

          {activeTab === 'two' && (
            <div>
              <p style={{ color: 'var(--al-muted)', fontSize: '.9rem', marginBottom: '1rem' }}>排序数组中的双指针对向逼近（目标和 = 15）：</p>
              <div className="al-array" style={{ marginBottom: '2rem' }}>
                {[1, 3, 4, 6, 7, 9, 11, 14].map((v, i) => (
                  <div key={i} className={`al-cell${i === pLeft ? ' left' : i === pRight ? ' right' : i > pLeft && i < pRight ? '' : ''}`}>
                    {v}
                    {i === pLeft && <span className="al-ptr-label" style={{ color: 'var(--al-accent2)' }}>L</span>}
                    {i === pRight && <span className="al-ptr-label" style={{ color: 'var(--al-blue)' }}>R</span>}
                  </div>
                ))}
              </div>
              {(() => {
                const arr = [1, 3, 4, 6, 7, 9, 11, 14];
                const sum = arr[pLeft] + arr[pRight];
                return (
                  <div style={{ background: 'var(--al-surface2)', borderRadius: 10, padding: '1rem 1.5rem', border: `1px solid ${sum === 15 ? 'var(--al-accent2)' : 'var(--al-border)'}` }}>
                    <div style={{ fontSize: '.85rem', color: 'var(--al-muted)' }}>当前状态</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '.3rem' }}>
                      arr[{pLeft}]({arr[pLeft]}) + arr[{pRight}]({arr[pRight]}) = <span style={{ color: sum === 15 ? 'var(--al-accent2)' : sum < 15 ? 'var(--al-accent)' : 'var(--al-red)' }}>{sum}</span>
                      {sum === 15 ? ' ✅ 找到！' : sum < 15 ? ' → L 右移' : ' → R 左移'}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="al-tab" onClick={() => setPLeft(Math.min(pLeft + 1, pRight - 1))}>L 右移 →</button>
                <button className="al-tab" onClick={() => setPRight(Math.max(pRight - 1, pLeft + 1))}>← R 左移</button>
                <button className="al-tab" onClick={() => { setPLeft(0); setPRight(7); }}>重置</button>
              </div>
            </div>
          )}

          {activeTab === 'prefix' && (
            <div>
              <p style={{ color: 'var(--al-muted)', fontSize: '.9rem', marginBottom: '1rem' }}>
                前缀和 prefix[i] = nums[0..i-1] 之和，子数组 [l,r] 之和 = prefix[r+1] - prefix[l]
              </p>
              <div className="al-code">{`nums   = [3,  1,  4,  1,  5,  9,  2]
prefix = [0,  3,  4,  8,  9, 14, 23, 25]
        
# 查询 nums[2..5] 之和（索引 2 到 5）
sum_2_5 = prefix[6] - prefix[2]  # = 23 - 4 = 19
# = 4 + 1 + 5 + 9 = 19 ✅

# 模板：构建前缀和
prefix = [0] * (len(nums) + 1)
for i in range(len(nums)):
    prefix[i+1] = prefix[i] + nums[i]

# 查询 [l, r] 区间和
def range_sum(l, r):
    return prefix[r+1] - prefix[l]`}</div>
            </div>
          )}
        </div>

        {/* Problem Library */}
        <div className="al-section">
          <h2>📚 高频题精讲</h2>
          <div className="al-tabs">
            {PROBLEMS.map((p, i) => (
              <button key={i} className={`al-tab${probIdx === i ? ' active' : ''}`} onClick={() => setProbIdx(i)}>
                #{p.id} {p.title}
              </button>
            ))}
          </div>
          <div className="al-problem">
            <div className="al-problem-header">
              <span className="al-problem-id">#{prob.id}</span>
              <span className="al-problem-title">{prob.title}</span>
              <span className={`al-difficulty ${prob.difficulty}`}>{prob.difficulty === 'easy' ? '简单' : prob.difficulty === 'medium' ? '中等' : '困难'}</span>
              <span className="al-tag">{prob.tag}</span>
            </div>
            <div className="al-problem-body">
              <p style={{ color: 'var(--al-muted)', fontSize: '.9rem', marginBottom: '1rem' }}>{prob.desc}</p>
              <div className="al-info">💡 <span><strong>解题模板：{prob.template}</strong></span></div>
              <div className="al-code">{prob.code}</div>
              <div className="al-complexity">
                <span className="al-time">⏱ 时间 {prob.complexity[0]}</span>
                <span className="al-space">💾 空间 {prob.complexity[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Template Summary */}
        <div className="al-section">
          <h2>📋 四大模板速查</h2>
          <div className="al-grid-2">
            {[
              { t: '🪟 滑动窗口', when: '连续子数组/子串问题', key: 'right 扩张 + 满足条件 → left 收缩', lc: '76, 3, 209, 424, 438' },
              { t: '👉 双指针', when: '有序数组，两数/三数之和', key: '排序后 left/right 对向移动', lc: '1, 15, 11, 167, 42' },
              { t: '➕ 前缀和', when: '区间求和，子数组和问题', key: 'prefix[r]-prefix[l] = 区间和', lc: '560, 303, 304, 525, 974' },
              { t: '📊 差分数组', when: '区间批量修改问题', key: 'diff[l]++, diff[r+1]-- → 还原', lc: '1109, 1094, 370' },
            ].map((c, i) => (
              <div key={i} className="al-card">
                <div className="al-card-title" style={{ color: 'var(--al-primary)' }}>{c.t}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--al-muted)', marginBottom: '.5rem' }}>适用：{c.when}</div>
                <div style={{ fontSize: '.82rem', fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-text)', marginBottom: '.5rem' }}>{c.key}</div>
                <div className="al-tags"><span className="al-tag blue">相关题: {c.lc}</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
