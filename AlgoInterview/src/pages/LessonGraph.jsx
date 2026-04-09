import { useState } from 'react';
import './LessonCommon.css';

const GRAPH_TABS = [
  {
    key: 'dfs', label: 'DFS 模板',
    code: `# DFS 通用模板（递归 + 回溯）
def dfs(graph, node, visited, result):
    visited.add(node)
    result.append(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, result)

# 岛屿数量 (LC200) — 网格DFS
def numIslands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols: return
        if grid[r][c] != '1': return
        grid[r][c] = '0'           # 标记已访问（原地修改）
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count  # O(mn) 时间，O(mn) 空间（递归栈）`,
  },
  {
    key: 'dijkstra', label: 'Dijkstra',
    code: `# Dijkstra 最短路（单源，非负权重）
import heapq

def dijkstra(graph, start):
    # graph: {节点: [(邻居, 权重), ...]}
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]  # (距离, 节点)
    
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]: continue    # 过时的条目，跳过
        
        for v, w in graph[u]:       # 遍历邻居
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
    
    return dist

# 时间 O((V+E) log V)  适合稀疏图
# 注意：不能有负权重边（用 Bellman-Ford）

# 实例：LC743 网络延迟时间
def networkDelayTime(times, n, k):
    graph = {i: [] for i in range(1, n+1)}
    for u, v, w in times:
        graph[u].append((v, w))
    dist = dijkstra(graph, k)
    ans = max(dist.values())
    return ans if ans < float('inf') else -1`,
  },
  {
    key: 'topo', label: '拓扑排序',
    code: `from collections import deque

# Kahn 算法（BFS 拓扑排序）
def topologicalSort(n, prerequisites):
    # 构建邻接表 + 入度
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in prerequisites:
        graph[b].append(a)           # b → a
        indegree[a] += 1
    
    # 入度为0的节点入队
    q = deque([i for i in range(n) if indegree[i] == 0])
    order = []
    
    while q:
        node = q.popleft()
        order.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                q.append(neighbor)
    
    # 如果所有节点都完成了，无环；否则有环
    return order if len(order) == n else []

# LC207: 课程表（判断能否完成所有课）
def canFinish(numCourses, prerequisites):
    return len(topologicalSort(numCourses, prerequisites)) == numCourses`,
  },
  {
    key: 'union', label: '并查集',
    code: `# 并查集（Union-Find）— 动态连通性
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n              # 连通分量数
    
    def find(self, x):              # 路径压缩
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):          # 按秩合并
        px, py = self.find(x), self.find(y)
        if px == py: return False   # 已连通
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        self.count -= 1
        return True

# 实例：LC200 岛屿数量（并查集版）
# 实例：LC684 冗余连接（找成环的边）
def findRedundantConnection(edges):
    uf = UnionFind(len(edges) + 1)
    for u, v in edges:
        if not uf.union(u, v):       # 已连通，这条边是冗余
            return [u, v]`,
  },
];

const SORT_ALGO = [
  { name: '快速排序', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: '否', note: '原地，常数小，实际最快' },
  { name: '归并排序', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: '是', note: '稳定，适合链表，外排序' },
  { name: '堆排序', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: '否', note: '原地，不稳定' },
  { name: '计数排序', avg: 'O(n+k)', worst: 'O(n+k)', space: 'O(k)', stable: '是', note: '整数且范围小' },
  { name: '基数排序', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: '是', note: '多位整数/字符串' },
];

export default function LessonGraph() {
  const [tab, setTab] = useState('dfs');

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块七 · Graph & Sorting</div>
          <h1>图论 & 排序 — 搜索与拓扑</h1>
          <p>DFS/BFS 双模板、Dijkstra 最短路、拓扑排序检测环、并查集动态连通——图论是面试进阶的分水岭，排序算法是必背基础。</p>
        </div>

        <div className="al-metrics">
          {[{ v: 'DFS', l: '深度优先' }, { v: 'Dijkstra', l: '最短路径' }, { v: '拓扑排序', l: '有向无环图' }, { v: '并查集', l: '动态连通' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Graph Templates */}
        <div className="al-section">
          <h2>🕸️ 图论核心模板</h2>
          <div className="al-tabs">
            {GRAPH_TABS.map(t => <button key={t.key} className={`al-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
          </div>
          <div className="al-code">{GRAPH_TABS.find(t => t.key === tab)?.code}</div>
          {tab === 'dfs' && <div className="al-tip">🌊 <span>网格图中 DFS 的关键：<strong>原地修改格子值为已访问状态</strong>（'0'或'#'），避免额外 visited 集合，简化代码。</span></div>}
          {tab === 'dijkstra' && <div className="al-warn">⚠️ <span>Dijkstra <strong>不能有负权重边</strong>。有负权重用 Bellman-Ford（O(VE)），或 SPFA（期望O(E)）。面试中主要考 Dijkstra。</span></div>}
          {tab === 'topo' && <div className="al-tip">🔄 <span>拓扑排序本质是 BFS。如果最终排序结果长度 &lt; n，说明图中有环（无法完成所有课程）。</span></div>}
          {tab === 'union' && <div className="al-good">✅ <span>并查集两个优化缺一不可：<strong>路径压缩</strong>（find 时压缩）+ <strong>按秩合并</strong>（union 时合并），让操作均摊接近 O(1)。</span></div>}
        </div>

        {/* Quick Sort Implementation */}
        <div className="al-section">
          <h2>⚡ 快速排序 — 面试必手写</h2>
          <div className="al-code">{`def quickSort(nums, left, right):
    if left >= right: return
    pivot_idx = partition(nums, left, right)
    quickSort(nums, left, pivot_idx - 1)
    quickSort(nums, pivot_idx + 1, right)

def partition(nums, left, right):
    pivot = nums[right]              # 选最右为基准
    i = left - 1                     # i 指向"小于pivot区域"的末尾
    for j in range(left, right):
        if nums[j] <= pivot:
            i += 1
            nums[i], nums[j] = nums[j], nums[i]
    nums[i+1], nums[right] = nums[right], nums[i+1]
    return i + 1

# 快速选择 — 第K大元素 O(n) 期望
def quickSelect(nums, k):
    # k 从 0 开始（第1大 = k=0）
    def select(left, right, k):
        if left == right: return nums[left]
        pivot_idx = partition(nums, left, right)
        if pivot_idx == k: return nums[k]
        elif pivot_idx < k: return select(pivot_idx + 1, right, k)
        else:              return select(left, pivot_idx - 1, k)
    return select(0, len(nums) - 1, len(nums) - k)  # 第k大`}</div>
        </div>

        {/* Sort Comparison */}
        <div className="al-section">
          <h2>📊 排序算法复杂度对比</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>算法</th><th>平均</th><th>最坏</th><th>空间</th><th>稳定</th><th>特点</th></tr></thead>
              <tbody>
                {SORT_ALGO.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--al-primary)' }}>{s.name}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-accent)', fontSize: '.82rem' }}>{s.avg}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: s.worst === 'O(n²)' ? 'var(--al-red)' : 'var(--al-accent)', fontSize: '.82rem' }}>{s.worst}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-blue)', fontSize: '.82rem' }}>{s.space}</td>
                    <td><span className={`al-tag ${s.stable === '是' ? 'green' : 'red'}`}>{s.stable}</span></td>
                    <td style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="al-info">ℹ️ <span>面试常问：<strong>为什么 Arrays.sort() 对基本类型用双轴快排，对对象用 TimSort？</strong> → 基本类型不需要稳定性，双轴快排实践最优；对象需要稳定性，用归并改进的 TimSort。</span></div>
        </div>

        {/* High Freq Graph */}
        <div className="al-section">
          <h2>🔥 图论高频题目</h2>
          <div className="al-grid-2">
            {[
              { lc: '200/695/463', t: '岛屿系列', desc: '岛屿数量/最大面积/周长，DFS/BFS 通用' },
              { lc: '207/210', t: '课程表系列', desc: '拓扑排序判断是否有环，输出合法修课顺序' },
              { lc: '743/787', t: '最短路系列', desc: 'Dijkstra 求最短路，K 次中转内最便宜航班' },
              { lc: '684/547', t: '并查集系列', desc: '冗余连接（找环），省份数量（连通分量）' },
              { lc: '130/417', t: '边界DFS', desc: '被围绕的区域，太平洋大西洋水流' },
              { lc: '332', t: '欧拉路径', desc: '重新安排行程，DFS + 贪心字典序' },
            ].map((c, i) => (
              <div key={i} className="al-card">
                <div className="al-card-title">
                  <span className="al-tag blue" style={{ marginRight: '.5rem' }}>#{c.lc}</span>
                  {c.t}
                </div>
                <div className="al-card-body">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
