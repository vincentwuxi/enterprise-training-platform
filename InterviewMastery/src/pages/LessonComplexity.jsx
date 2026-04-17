import { useState } from 'react';
import './LessonCommon.css';

const COMPLEXITIES = [
  { name: 'O(1)', label: '常数', color: '#22c55e', examples: ['数组索引访问', '哈希表查找', '栈 push/pop'], bar: 5 },
  { name: 'O(log n)', label: '对数', color: '#4ade80', examples: ['二分搜索', '平衡 BST操作', '堆操作'], bar: 15 },
  { name: 'O(n)', label: '线性', color: '#eab308', examples: ['遍历数组', '链表操作', '两次遍历'], bar: 30 },
  { name: 'O(n log n)', label: '线性对数', color: '#f59e0b', examples: ['归并排序', '快速排序(平均)', '堆排序'], bar: 50 },
  { name: 'O(n²)', label: '平方', color: '#ef4444', examples: ['冒泡排序', '嵌套循环', '暴力双重遍历'], bar: 75 },
  { name: 'O(2ⁿ)', label: '指数', color: '#dc2626', examples: ['递归斐波那契(无memo)', '子集枚举', '暴力旅行商'], bar: 95 },
];

const TRAPS = [
  { q: '以下代码的时间复杂度？', code: 'for i in range(n):\n  for j in range(i, n):\n    pass', wrong: 'O(n)', right: 'O(n²)', why: '即使 j 从 i 开始，总操作数 = n(n-1)/2 = O(n²)。系数和低阶项不影响大 O。' },
  { q: 'HashMap.get() 的最坏时间复杂度？', code: 'map.get(key)', wrong: 'O(1)', right: 'O(n)', why: '平均 O(1)，但哈希冲突严重时退化为链表/红黑树，最坏 O(n)。面试时要区分平均和最坏。' },
  { q: 'Python list.append() 的复杂度？', code: 'arr.append(x)', wrong: 'O(1)', right: 'O(1) 均摊', why: '大部分时候 O(1)，但数组扩容时需要 O(n) 拷贝。均摊(amortized)分析后还是 O(1)，但面试时要说"均摊 O(1)"。' },
  { q: '对已排序数组用快排的复杂度？', code: 'quicksort(sorted_array)', wrong: 'O(n log n)', right: 'O(n²)', why: '如果 pivot 总选最小/最大元素，分区极度不平衡 → O(n²)。解决：随机 pivot 或三数取中。' },
];

export default function LessonComplexity() {
  const [activeTab, setActiveTab] = useState('chart');
  const [revealedTraps, setRevealedTraps] = useState({});

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge">模块二 · Complexity Analysis</div>
        <h1>复杂度分析 — 时间/空间 / 均摊分析 / 面试陷阱</h1>
        <p>面试官最常问的不是"写出来"，而是<strong>"这个解法的时间复杂度是什么？能不能更好？"</strong>。复杂度分析是区分初级和资深候选人的分水岭。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 核心内容</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['chart','复杂度阶梯'],['space','空间分析'],['traps','面试陷阱'],['cheatsheet','速查表']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'chart' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              从最快到最慢——理解每个复杂度意味着什么，以及它们在真实面试中的应用场景。
            </div>
            {COMPLEXITIES.map(c => (
              <div key={c.name} className="iv-card" style={{marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'1rem'}}>
                <div style={{minWidth:80,fontWeight:800,color:c.color,fontFamily:'JetBrains Mono,monospace'}}>{c.name}</div>
                <div style={{flex:1}}>
                  <div style={{height:8,borderRadius:4,background:'rgba(255,255,255,0.05)',marginBottom:4}}>
                    <div style={{height:'100%',borderRadius:4,width:`${c.bar}%`,background:c.color,transition:'width 0.5s'}} />
                  </div>
                  <div style={{fontSize:'0.78rem',color:'var(--iv-muted)'}}>{c.examples.join(' · ')}</div>
                </div>
                <div style={{minWidth:60,fontSize:'0.75rem',color:'var(--iv-muted)',textAlign:'right'}}>{c.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'space' && (
          <div>
            <div className="iv-code-wrap">
              <div className="iv-code-head">
                <div className="iv-code-dot" style={{background:'#ef4444'}} />
                <div className="iv-code-dot" style={{background:'#eab308'}} />
                <div className="iv-code-dot" style={{background:'#22c55e'}} />
                <span>space_complexity_guide.py</span>
              </div>
              <pre className="iv-code">{`# 空间复杂度核心考点

# O(1) 原地操作 — 面试官最爱看你能不能做到
def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]  # swap in-place
        left += 1; right -= 1
    # 无额外数组 → O(1) space

# O(n) 需要额外空间
def two_sum(nums, target):
    seen = {}  # HashMap 最多存 n 个元素 → O(n) space
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target-num], i]
        seen[num] = i

# O(h) 递归栈空间 — 容易被忽略!
def max_depth(root):
    if not root: return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
    # 递归深度 = 树高 h → O(h) space
    # 平衡树 h=log n，退化链表 h=n

# 面试关键问题：
# Q: "能不能用 O(1) 空间做？"
# A: 考虑双指针、位运算、Morris Traversal 等技巧`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'traps' && (
          <div>
            <div style={{fontSize:'0.9rem',color:'var(--iv-muted)',marginBottom:'1rem'}}>
              面试中最容易踩的复杂度陷阱——回答错一个就可能被扣分。
            </div>
            <div className="iv-grid-2" style={{gridTemplateColumns:'1fr'}}>
              {TRAPS.map((t, i) => (
                <div key={i} className="iv-card">
                  <div style={{fontWeight:700,color:'#fbbf24',marginBottom:'0.5rem'}}>{t.q}</div>
                  <div className="iv-code-wrap" style={{marginBottom:'0.75rem'}}>
                    <pre className="iv-code" style={{padding:'0.75rem 1rem',maxHeight:80}}>{t.code}</pre>
                  </div>
                  {!revealedTraps[i] ? (
                    <button className="iv-btn primary" onClick={() => setRevealedTraps({...revealedTraps,[i]:true})}>点击揭晓答案</button>
                  ) : (
                    <div>
                      <div style={{display:'flex',gap:'1rem',marginBottom:'0.5rem'}}>
                        <span style={{color:'var(--iv-red)'}}>❌ 常见错误: <strong>{t.wrong}</strong></span>
                        <span style={{color:'var(--iv-green)'}}>✅ 正确答案: <strong>{t.right}</strong></span>
                      </div>
                      <div style={{fontSize:'0.85rem',color:'var(--iv-muted)',padding:'0.5rem 0.75rem',background:'rgba(234,179,8,0.05)',borderRadius:8}}>
                        💡 {t.why}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cheatsheet' && (
          <div>
            <table className="iv-table">
              <thead>
                <tr><th>数据结构</th><th>Access</th><th>Search</th><th>Insert</th><th>Delete</th><th>Space</th></tr>
              </thead>
              <tbody>
                {[
                  ['Array','O(1)','O(n)','O(n)','O(n)','O(n)'],
                  ['Linked List','O(n)','O(n)','O(1)','O(1)','O(n)'],
                  ['HashMap','—','O(1)*','O(1)*','O(1)*','O(n)'],
                  ['BST (balanced)','—','O(log n)','O(log n)','O(log n)','O(n)'],
                  ['Heap','—','O(n)','O(log n)','O(log n)','O(n)'],
                  ['Stack/Queue','O(n)','O(n)','O(1)','O(1)','O(n)'],
                  ['Trie','—','O(m)','O(m)','O(m)','O(ΣLEN)'],
                ].map(row => (
                  <tr key={row[0]}>
                    <td style={{fontWeight:700,color:'var(--iv-gold)'}}>{row[0]}</td>
                    {row.slice(1).map((c,i) => (
                      <td key={i} style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.8rem',color: c.includes('1') && !c.includes('n') ? '#22c55e' : c.includes('n)') && !c.includes('log') ? '#ef4444' : '#fbbf24'}}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontSize:'0.78rem',color:'var(--iv-muted)',marginTop:'0.5rem'}}>* 平均情况。最坏 O(n)。m = 字符串长度。</div>
          </div>
        )}
      </div>
    </div>
  );
}
