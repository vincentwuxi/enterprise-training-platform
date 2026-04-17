import { useState } from 'react';
import './LessonCommon.css';

const DS_TOPICS = [
  { name: '二叉树', emoji: '🌳', color: '#22c55e', problems: ['Invert Binary Tree','Validate BST','Lowest Common Ancestor','Serialize/Deserialize','Binary Tree Maximum Path Sum'], key: 'tree',
    operations: [{op:'遍历(前/中/后/层序)',t:'O(n)'},{op:'搜索(BST)',t:'O(log n)'},{op:'插入/删除(BST)',t:'O(log n)'}] },
  { name: '图', emoji: '🕸️', color: '#3b82f6', problems: ['Number of Islands','Clone Graph','Course Schedule','Word Ladder','Network Delay Time'], key: 'graph',
    operations: [{op:'DFS/BFS',t:'O(V+E)'},{op:'Dijkstra',t:'O(E log V)'},{op:'拓扑排序',t:'O(V+E)'}] },
  { name: '堆', emoji: '⛰️', color: '#eab308', problems: ['Kth Largest Element','Merge K Sorted Lists','Top K Frequent Elements','Find Median from Data Stream'], key: 'heap',
    operations: [{op:'insert',t:'O(log n)'},{op:'extract min/max',t:'O(log n)'},{op:'peek',t:'O(1)'}] },
  { name: 'Trie', emoji: '🔤', color: '#8b5cf6', problems: ['Implement Trie','Word Search II','Design Search Autocomplete','Palindrome Pairs'], key: 'trie',
    operations: [{op:'insert',t:'O(m)'},{op:'search',t:'O(m)'},{op:'prefix query',t:'O(m)'}] },
];

export default function LessonDataStructure() {
  const [activeDS, setActiveDS] = useState('tree');
  const current = DS_TOPICS.find(d => d.key === activeDS);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge">模块三 · Data Structures</div>
        <h1>数据结构深度 — 树/图/堆/Trie 全掌握</h1>
        <p>面试中 40% 的题目涉及树和图。不只是会用——理解它们的<strong>内部实现</strong>和<strong>最优使用场景</strong>才是面试通关的关键。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 四大高频数据结构</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {DS_TOPICS.map(d => (
            <button key={d.key} className={`iv-btn${activeDS===d.key?' primary':''}`} onClick={() => setActiveDS(d.key)}>
              {d.emoji} {d.name}
            </button>
          ))}
        </div>

        {current && (
          <div>
            <div className="iv-card" style={{marginBottom:'1rem'}}>
              <div style={{fontWeight:800,fontSize:'1.1rem',color:current.color,marginBottom:'0.75rem'}}>
                {current.emoji} {current.name} — 核心操作
              </div>
              <table className="iv-table">
                <thead><tr><th>操作</th><th>复杂度</th></tr></thead>
                <tbody>
                  {current.operations.map(op => (
                    <tr key={op.op}>
                      <td>{op.op}</td>
                      <td style={{fontFamily:'JetBrains Mono,monospace',color:'var(--iv-gold)',fontWeight:600}}>{op.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="iv-section-title" style={{marginTop:'1.5rem'}}>📋 高频面试题</div>
            <div className="iv-grid-2" style={{gridTemplateColumns:'1fr'}}>
              {current.problems.map((p, i) => (
                <div key={p} className="iv-card" style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                  <span style={{fontWeight:800,color:current.color,fontSize:'1.1rem',minWidth:24}}>{i+1}</span>
                  <span style={{fontWeight:600}}>{p}</span>
                  <span className={`iv-tag ${i < 2 ? 'green' : i < 4 ? 'gold' : 'red'}`} style={{marginLeft:'auto'}}>
                    {i < 2 ? 'Medium' : i < 4 ? 'Medium' : 'Hard'}
                  </span>
                </div>
              ))}
            </div>

            {activeDS === 'tree' && (
              <div className="iv-code-wrap" style={{marginTop:'1rem'}}>
                <div className="iv-code-head">
                  <div className="iv-code-dot" style={{background:'#ef4444'}} />
                  <div className="iv-code-dot" style={{background:'#eab308'}} />
                  <div className="iv-code-dot" style={{background:'#22c55e'}} />
                  <span>tree_traversal_patterns.py</span>
                </div>
                <pre className="iv-code">{`# 二叉树遍历三件套 — 面试必会
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right

# 1.递归 DFS — 最直觉
def inorder(root):
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

# 2.迭代 DFS — 面试常考 "不用递归实现"
def inorder_iterative(root):
    stack, result = [], []
    curr = root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result

# 3. BFS 层序 — Queue
from collections import deque
def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):       # 当前层的节点数
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result`}</pre>
              </div>
            )}

            {activeDS === 'graph' && (
              <div className="iv-code-wrap" style={{marginTop:'1rem'}}>
                <div className="iv-code-head">
                  <div className="iv-code-dot" style={{background:'#ef4444'}} />
                  <div className="iv-code-dot" style={{background:'#eab308'}} />
                  <div className="iv-code-dot" style={{background:'#22c55e'}} />
                  <span>graph_patterns.py</span>
                </div>
                <pre className="iv-code">{`# 图的三大必会模板

# 1. BFS 最短路径 (无权图)
from collections import deque
def bfs_shortest(graph, start, end):
    queue = deque([(start, 0)])
    visited = {start}
    while queue:
        node, dist = queue.popleft()
        if node == end: return dist
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist+1))
    return -1

# 2. 拓扑排序 (检测环 + 排序)
def topological_sort(n, edges):
    graph = defaultdict(list)
    indegree = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indegree[v] += 1
    queue = deque([i for i in range(n) if indegree[i]==0])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nei in graph[node]:
            indegree[nei] -= 1
            if indegree[nei] == 0: queue.append(nei)
    return order if len(order) == n else []  # 空=有环!`}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
