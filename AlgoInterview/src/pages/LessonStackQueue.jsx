import { useState } from 'react';
import './LessonCommon.css';

const TABS = [
  { key: 'mono_stack', label: '单调栈', code: `# 单调栈模板 — 解决"下一个更大/更小元素"
# 核心：栈保持单调递增或递减
def nextGreaterElement(nums):
    n = len(nums)
    res = [-1] * n
    stack = []  # 存索引，栈底到栈顶单调递减（等待被解决的元素）
    
    for i in range(n):
        while stack and nums[stack[-1]] < nums[i]:
            idx = stack.pop()
            res[idx] = nums[i]   # i 就是 idx 的下一个更大元素
        stack.append(i)
    return res

# 例：nums = [2,1,2,4,3]
# res  = [4,2,4,-1,-1]

# 变体：接雨水 (LC42) — 经典单调栈
def trap(height):
    stack = []  # 单调递减栈（存索引）
    water = 0
    for r in range(len(height)):
        while stack and height[stack[-1]] < height[r]:
            bottom = stack.pop()
            if not stack: break
            l = stack[-1]
            w = (r - l - 1) * (min(height[l], height[r]) - height[bottom])
            water += w
        stack.append(r)
    return water` },
  { key: 'mono_queue', label: '单调队列', code: `# 单调队列 — 滑动窗口最大值 (LC239)
from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()  # 存索引，从队头到队尾单调递减
    res = []
    
    for r in range(len(nums)):
        # 1. 移除队尾所有比当前小的（它们不可能是窗口最大值）
        while dq and nums[dq[-1]] < nums[r]:
            dq.pop()
        dq.append(r)
        
        # 2. 移除超出窗口的队头
        if dq[0] < r - k + 1:
            dq.popleft()
        
        # 3. 窗口形成后记录结果（队头始终是窗口最大值）
        if r >= k - 1:
            res.append(nums[dq[0]])
    return res

# 时间 O(n) — 每个元素只入队/出队一次
# 关键：队头 = 当前窗口最大值，队尾 = 最新入窗的元素` },
  { key: 'heap', label: '优先队列(堆)', code: `import heapq

# Python heapq 是最小堆，实现最大堆取负数

# Top-K 最大元素 (LC215)
def findKthLargest(nums, k):
    # 方法1：最小堆，维护大小为k的堆
    heap = nums[:k]
    heapq.heapify(heap)           # O(k)
    for num in nums[k:]:
        if num > heap[0]:         # 比堆顶大
            heapq.heapreplace(heap, num)  # 替换堆顶
    return heap[0]  # 堆顶即第k大
    # 时间 O(n log k)  空间 O(k)
    
    # 方法2：直接sort（面试可接受）
    # return sorted(nums)[-k]  # O(n log n)

# 合并 K 个有序链表 (LC23)
def mergeKLists(lists):
    dummy = cur = ListNode(0)
    # (val, node) 入堆（val 相等时比较节点会报错，加 id 避免）
    heap = [(n.val, i, n) for i, n in enumerate(lists) if n]
    heapq.heapify(heap)
    while heap:
        val, i, node = heapq.heappop(heap)
        cur.next = node; cur = cur.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next  # 时间 O(n log k)` },
  { key: 'bfs', label: 'BFS 层序', code: `from collections import deque

# BFS 通用模板（最短路径/层级问题）
def bfs(start, end, graph):
    queue = deque([(start, 0)])  # (节点, 步数)
    visited = {start}
    
    while queue:
        node, steps = queue.popleft()
        if node == end: return steps
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, steps + 1))
    return -1  # 无法到达

# 实例：单词接龙 (LC127)
def ladderLength(beginWord, endWord, wordList):
    wordSet = set(wordList)
    q = deque([(beginWord, 1)])
    while q:
        word, step = q.popleft()
        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                new_word = word[:i] + c + word[i+1:]
                if new_word == endWord: return step + 1
                if new_word in wordSet:
                    wordSet.discard(new_word)  # 用过的删掉
                    q.append((new_word, step + 1))
    return 0` },
];

const HIGH_FREQ = [
  { lc: '84', title: '柱状图中最大矩形', tag: '单调栈', difficulty: 'hard' },
  { lc: '42', title: '接雨水', tag: '单调栈/双指针', difficulty: 'hard' },
  { lc: '239', title: '滑动窗口最大值', tag: '单调队列', difficulty: 'hard' },
  { lc: '295', title: '数据流的中位数', tag: '双堆', difficulty: 'hard' },
  { lc: '215', title: '数组中第K大元素', tag: '快排/堆', difficulty: 'medium' },
  { lc: '23', title: '合并K个升序链表', tag: '优先队列', difficulty: 'hard' },
  { lc: '994', title: '腐烂的橘子', tag: 'BFS多源', difficulty: 'medium' },
  { lc: '127', title: '单词接龙', tag: 'BFS', difficulty: 'hard' },
];

export default function LessonStackQueue() {
  const [tab, setTab] = useState('mono_stack');

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块三 · Stack & Queue & Heap</div>
          <h1>栈 & 队列 & 堆 — 单调结构专训</h1>
          <p>单调栈、单调队列、优先队列——三种数据结构解锁"下一个更大元素""滑动窗口极值""Top-K"等系列高频题。</p>
        </div>

        <div className="al-metrics">
          {[{ v: '单调栈', l: '维护历史极值' }, { v: '单调队列', l: '窗口最大/最小' }, { v: '最小堆', l: 'Top-K 专治' }, { v: 'BFS', l: '多源最短路' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Template Tabs */}
        <div className="al-section">
          <h2>💻 核心模板详解</h2>
          <div className="al-tabs">
            {TABS.map(t => <button key={t.key} className={`al-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
          </div>
          <div className="al-code">{TABS.find(t => t.key === tab)?.code}</div>

          {tab === 'mono_stack' && <div className="al-tip">🎯 <span>单调栈口诀：维护单调递减栈→处理"下一个更大"；维护单调递增栈→处理"下一个更小"。栈弹出时的那个元素找到了"答案"。</span></div>}
          {tab === 'mono_queue' && <div className="al-tip">🎯 <span>单调队列 vs 单调栈：队列两端都能操作（从尾加、从头取答案、从头删过期项），适合<strong>窗口类</strong>问题。</span></div>}
          {tab === 'heap' && (
            <div className="al-info">ℹ️ <span>Python <code>heapq</code> 只有最小堆。最大堆技巧：<strong>存负数</strong>。或用 <code>(-val, node)</code> 元组让堆按负值排序。</span></div>
          )}
          {tab === 'bfs' && <div className="al-tip">🗺️ <span>BFS 找最短路时，<strong>visited 集合必须在入队时就标记</strong>，而非出队时——否则同一节点会被多次入队，复杂度退化。</span></div>}
        </div>

        {/* 双堆技巧 */}
        <div className="al-section">
          <h2>⚖️ 双堆技巧 — 数据流中位数</h2>
          <div className="al-code">{`# LC295: 数据流的中位数
# 技巧：左边最大堆（存较小半）+ 右边最小堆（存较大半）
# 始终保持 |left| == |right| 或 |left| == |right| + 1

import heapq
class MedianFinder:
    def __init__(self):
        self.lo = []   # 最大堆（用负数）存较小的一半
        self.hi = []   # 最小堆，存较大的一半

    def addNum(self, num: int) -> None:
        heapq.heappush(self.lo, -num)      # 先入最大堆
        # 保证 lo 的最大值 <= hi 的最小值
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        # 保持 lo 比 hi 多一个（或相等）
        if len(self.lo) < len(self.hi):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self) -> float:
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2`}</div>
        </div>

        {/* High Frequency Problems */}
        <div className="al-section">
          <h2>🔥 高频题目速查</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>题目</th><th>标签</th><th>难度</th><th>核心思路</th></tr></thead>
              <tbody>
                {HIGH_FREQ.map((p, i) => (
                  <tr key={i}>
                    <td><span className="al-tag blue">#{p.lc}</span> {p.title}</td>
                    <td><span className="al-tag">{p.tag}</span></td>
                    <td><span className={`al-difficulty ${p.difficulty}`}>{p.difficulty === 'hard' ? '困难' : '中等'}</span></td>
                    <td style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>
                      {p.tag.includes('单调栈') ? '维护单调性，出栈时计算面积/水量' :
                        p.tag.includes('单调队列') ? '双端队列维护窗口最大值' :
                          p.tag.includes('双堆') ? '左最大堆+右最小堆各存一半' :
                            p.tag.includes('快排') ? '快速选择分区，期望O(n)' :
                              p.tag.includes('BFS多源') ? '所有初始节点同时入队' :
                                p.tag.includes('优先队列') ? '(val,idx,node)入堆，取最小' :
                                  'BFS记录步数，单词替换每一位'}
                    </td>
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
