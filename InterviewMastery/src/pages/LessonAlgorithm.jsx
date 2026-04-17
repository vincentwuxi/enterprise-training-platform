import { useState } from 'react';
import './LessonCommon.css';

const PATTERNS = [
  { name: '双指针', emoji: '👆👆', difficulty: '⭐⭐', freq: '极高', desc: '两个指针从两端/同向扫描数组', problems: ['Two Sum (sorted)', '3Sum', 'Container With Most Water', 'Trapping Rain Water'] },
  { name: '滑动窗口', emoji: '🪟', difficulty: '⭐⭐⭐', freq: '极高', desc: '维护一个可变大小的窗口在数组上滑动', problems: ['Longest Substring Without Repeating', 'Minimum Window Substring', 'Sliding Window Maximum'] },
  { name: 'BFS 广度优先', emoji: '🌊', difficulty: '⭐⭐', freq: '高', desc: '层序遍历，适合最短路径问题', problems: ['Binary Tree Level Order', 'Word Ladder', 'Rotting Oranges', '01 Matrix'] },
  { name: 'DFS 深度优先', emoji: '🔦', difficulty: '⭐⭐', freq: '极高', desc: '递归/栈探索所有路径', problems: ['Number of Islands', 'Path Sum', 'Clone Graph', 'Course Schedule'] },
  { name: '回溯', emoji: '🔙', difficulty: '⭐⭐⭐', freq: '高', desc: '尝试所有可能，不行就回退', problems: ['Permutations', 'Subsets', 'N-Queens', 'Word Search'] },
  { name: '二分搜索', emoji: '🔍', difficulty: '⭐⭐', freq: '极高', desc: '有序数组中 O(log n) 查找', problems: ['Search in Rotated Array', 'Find Peak Element', 'Median of Two Sorted Arrays'] },
];

const TWO_POINTER_DEMO = {
  problem: 'Container With Most Water',
  steps: [
    { l: 0, r: 7, area: '7×1=7', action: '初始化左右指针' },
    { l: 0, r: 6, area: '6×3=18', action: 'height[7]=3 < height[0]=1? 不，右移。实际 height[r]>height[l]，左移' },
    { l: 1, r: 7, area: '6×8=48', action: 'height[0]<height[7]，左指针右移' },
    { l: 1, r: 6, area: '5×6=30', action: 'height[7]<height[1]? 对比后右移' },
    { l: 2, r: 6, area: '4×5=20', action: '继续...' },
  ],
  heights: [1, 8, 6, 2, 5, 4, 8, 3],
};

export default function LessonAlgorithm() {
  const [activeTab, setActiveTab] = useState('patterns');
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [demoStep, setDemoStep] = useState(0);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge">模块一 · Core Algorithms</div>
        <h1>算法核心 — 双指针 / 滑窗 / BFS/DFS / 回溯</h1>
        <p>面试算法不是刷题量的比拼，而是<strong>模式识别</strong>的能力。掌握 6 大核心模式，80% 的 LeetCode 题不外乎这些套路的排列组合。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 核心内容</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['patterns','六大模式'],['demo','双指针演示'],['templates','代码模板'],['practice','刷题路线']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'patterns' && (
          <div className="iv-grid-2">
            {PATTERNS.map((p, i) => (
              <div key={p.name} className="iv-card" style={{cursor:'pointer'}} onClick={() => setExpandedPattern(expandedPattern===i?null:i)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700,color:'#fbbf24'}}>{p.emoji} {p.name}</div>
                  <div style={{display:'flex',gap:6}}>
                    <span className="iv-tag gold">{p.difficulty}</span>
                    <span className="iv-tag green">频率: {p.freq}</span>
                  </div>
                </div>
                <div style={{fontSize:'0.85rem',color:'var(--iv-muted)',margin:'0.5rem 0'}}>{p.desc}</div>
                {expandedPattern === i && (
                  <div style={{marginTop:'0.5rem',paddingTop:'0.5rem',borderTop:'1px solid var(--iv-border)'}}>
                    <div style={{fontSize:'0.78rem',color:'var(--iv-muted)',marginBottom:4}}>高频题目：</div>
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
              🎯 Container With Most Water — 双指针演练
              <div style={{display:'flex',gap:6}}>
                <button className="iv-btn" onClick={() => setDemoStep(Math.max(0,demoStep-1))} disabled={demoStep===0}>◀ 上一步</button>
                <button className="iv-btn green" onClick={() => setDemoStep(Math.min(TWO_POINTER_DEMO.steps.length-1,demoStep+1))} disabled={demoStep>=TWO_POINTER_DEMO.steps.length-1}>下一步 ▶</button>
              </div>
            </h3>
            <div style={{display:'flex',alignItems:'flex-end',gap:6,justifyContent:'center',margin:'1.5rem 0'}}>
              {TWO_POINTER_DEMO.heights.map((h, i) => {
                const step = TWO_POINTER_DEMO.steps[demoStep];
                const isLeft = i === step.l;
                const isRight = i === step.r;
                const inRange = i >= step.l && i <= step.r;
                return (
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{fontSize:'0.7rem',color: isLeft ? '#22c55e' : isRight ? '#ef4444' : 'transparent',fontWeight:700}}>
                      {isLeft ? 'L' : isRight ? 'R' : '.'}
                    </div>
                    <div style={{
                      width: 36, height: h * 20, borderRadius: 4,
                      background: isLeft ? 'linear-gradient(135deg,#22c55e,#16a34a)' : isRight ? 'linear-gradient(135deg,#ef4444,#dc2626)' : inRange ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.08)',
                      border: inRange ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.3s',
                    }} />
                    <div style={{fontSize:'0.75rem',color:'var(--iv-muted)'}}>{h}</div>
                  </div>
                );
              })}
            </div>
            <div className="iv-card" style={{marginTop:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <span>步骤 {demoStep + 1}/{TWO_POINTER_DEMO.steps.length}</span>
                <span style={{color:'var(--iv-gold)',fontWeight:700}}>面积 = {TWO_POINTER_DEMO.steps[demoStep].area}</span>
              </div>
              <div style={{fontSize:'0.85rem',color:'var(--iv-muted)',marginTop:6}}>
                {TWO_POINTER_DEMO.steps[demoStep].action}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <div className="iv-code-wrap">
              <div className="iv-code-head">
                <div className="iv-code-dot" style={{background:'#ef4444'}} />
                <div className="iv-code-dot" style={{background:'#eab308'}} />
                <div className="iv-code-dot" style={{background:'#22c55e'}} />
                <span>sliding_window_template.py</span>
              </div>
              <pre className="iv-code">{`# 滑动窗口万能模板
def sliding_window(s, t):
    """找满足条件的最小/最大窗口"""
    need = collections.Counter(t)
    missing = len(t)
    left = 0
    best_start, best_len = 0, float('inf')
    
    for right, char in enumerate(s):
        # 1. 扩大窗口 — 右指针右移
        if need[char] > 0:
            missing -= 1
        need[char] -= 1
        
        # 2. 收缩窗口 — 当条件满足时左指针右移
        while missing == 0:
            # 更新最优解
            window_size = right - left + 1
            if window_size < best_len:
                best_start, best_len = left, window_size
            
            # 左指针右移
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    
    return s[best_start:best_start+best_len] if best_len != float('inf') else ""`}</pre>
            </div>
            <div className="iv-code-wrap" style={{marginTop:'1rem'}}>
              <div className="iv-code-head">
                <div className="iv-code-dot" style={{background:'#ef4444'}} />
                <div className="iv-code-dot" style={{background:'#eab308'}} />
                <div className="iv-code-dot" style={{background:'#22c55e'}} />
                <span>backtrack_template.py</span>
              </div>
              <pre className="iv-code">{`# 回溯万能模板
def backtrack(candidates, path, result, start=0):
    """模板: 排列/组合/子集/N皇后"""
    
    # 1. 终止条件
    if is_valid(path):
        result.append(path[:])  # 注意要 copy!
        return
    
    # 2. 遍历选择
    for i in range(start, len(candidates)):
        # 剪枝（可选）
        if should_prune(candidates, i, path):
            continue
        
        # 做选择
        path.append(candidates[i])
        
        # 递归
        backtrack(candidates, path, result, i + 1)  # i+1=组合, i=重复选, 0=排列
        
        # 撤销选择 (回溯的核心!)
        path.pop()`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              按难度递进的刷题路线，每个模式从简单题入手，逐步挑战困难题。
            </div>
            <table className="iv-table">
              <thead>
                <tr><th>周次</th><th>模式</th><th>Easy (2题)</th><th>Medium (3题)</th><th>Hard (1题)</th></tr>
              </thead>
              <tbody>
                {[
                  ['W1','双指针','Two Sum, Valid Palindrome','3Sum, Container With Most Water, Sort Colors','Trapping Rain Water'],
                  ['W2','滑动窗口','Best Time to Buy Stock, Max Consecutive Ones','Longest Substring, Permutation in String, Fruit Into Baskets','Minimum Window Substring'],
                  ['W3','BFS','Flood Fill, Maximum Depth','Word Ladder, 01 Matrix, Rotting Oranges','Shortest Path in Grid'],
                  ['W4','DFS','Path Sum, Same Tree','Number of Islands, Clone Graph, Course Schedule','Alien Dictionary'],
                  ['W5','回溯','Letter Combinations, Subsets','Permutations, Combination Sum, Word Search','N-Queens'],
                  ['W6','二分搜索','Binary Search, First Bad Version','Search Rotated Array, Find Peak, Search 2D Matrix','Median of Two Sorted Arrays'],
                ].map(row => (
                  <tr key={row[0]}>
                    <td style={{fontWeight:700,color:'var(--iv-gold)'}}>{row[0]}</td>
                    <td style={{fontWeight:600}}>{row[1]}</td>
                    <td style={{fontSize:'0.8rem'}}>{row[2]}</td>
                    <td style={{fontSize:'0.8rem'}}>{row[3]}</td>
                    <td style={{fontSize:'0.8rem',color:'var(--iv-red)'}}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="iv-section">
        <div className="iv-section-title">📚 本章小结</div>
        <div className="iv-grid-3">
          {[
            {e:'🎯',t:'模式识别优先',d:'看到题目先判断属于哪个模式，而非直接写代码'},
            {e:'📝',t:'背模板不如懂原理',d:'理解每个模式的核心思想，模板自然记住'},
            {e:'🔄',t:'刻意练习',d:'每个模式做 8-10 题，直到看到题目就能条件反射'},
          ].map(c => (
            <div key={c.t} className="iv-card">
              <div style={{fontSize:'1.2rem',marginBottom:4}}>{c.e}</div>
              <div style={{fontWeight:700,fontSize:'0.88rem',marginBottom:4}}>{c.t}</div>
              <div style={{fontSize:'0.82rem',color:'var(--iv-muted)'}}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
