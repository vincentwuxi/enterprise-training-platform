import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['图的表示与类型', 'BFS 与 DFS', '连通性', '欧拉与哈密顿'];

export default function LessonGraphBasics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_05 — 图论基础</div>
      <div className="fs-hero">
        <h1>图论基础：图的表示 / 遍历 / 连通性</h1>
        <p>
          图论是计算机科学中最重要的数学分支——
          <strong>社交网络</strong>、<strong>路由算法</strong>、<strong>编译器依赖分析</strong>、
          <strong>推荐系统</strong>的底层都是图问题。
          掌握图的表示、遍历、连通性是一切图算法的基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 图论基础深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 图的表示与类型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> graph_types.txt</div>
                <pre className="fs-code">{`═══ 图的定义 ═══

  G = (V, E)
  V = 顶点集 (节点)
  E = 边集 ⊆ V × V

  |V| = n (顶点数),  |E| = m (边数)

═══ 图的类型 ═══

  类型        │ 特征
  ────────────┼─────────────────────────
  无向图      │ {u,v} ∈ E (无方向)
  有向图      │ (u,v) ∈ E (有方向)
  简单图      │ 无自环、无重边
  多重图      │ 允许重边
  加权图      │ 边有权重 w(u,v)
  完全图 Kₙ   │ 每对顶点都有边, m=C(n,2)
  二部图      │ V 可分为两组, 边只在组间
  完全二部图  │ K_{m,n}, 两组间所有边
  树          │ 连通无环 (n-1 条边)
  DAG         │ 有向无环图
  平面图      │ 可画在平面上无交叉

═══ 存储方式 ═══

# ─── 1. 邻接矩阵 ───
  M[i][j] = 1 if (i,j) ∈ E, else 0
  
  空间: O(n²)
  查询边: O(1) ✓
  遍历邻居: O(n) ✗
  适用: 稠密图, Floyd-Warshall, 矩阵运算

# ─── 2. 邻接表 ───
  adj[u] = [v₁, v₂, ...] (u 的邻居列表)
  
  空间: O(n + m) ✓
  查询边: O(deg(u))
  遍历邻居: O(deg(u)) ✓
  适用: 稀疏图, BFS/DFS, 大多数实际场景

  Python:
    from collections import defaultdict
    graph = defaultdict(list)
    graph[u].append(v)
    graph[v].append(u)  # 无向图

# ─── 3. 边列表 ───
  edges = [(u₁,v₁,w₁), (u₂,v₂,w₂), ...]
  
  空间: O(m)
  适用: Kruskal MST, Bellman-Ford

═══ 基本性质 ═══

  握手定理: Σ deg(v) = 2|E|
  (每条边贡献 2 度)
  
  推论: 奇数度顶点个数为偶数!

  密度: d = 2m / (n(n-1))   (无向简单图)
  稠密: m ≈ n²
  稀疏: m ≈ n

  完全图 Kₙ: m = n(n-1)/2
  树:       m = n-1
  平面图:  m ≤ 3n-6  (欧拉公式: V-E+F=2)

═══ 选型指南 ═══

  场景           │ 推荐表示
  ───────────────┼──────────────
  社交网络       │ 邻接表 (稀疏)
  路由矩阵       │ 邻接矩阵 (密集查询)
  GNN 训练       │ COO/CSR 稀疏矩阵
  知识图谱       │ 三元组 (边列表)
  编译器 IR      │ 邻接表 + 支配树`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 BFS 与 DFS</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> traversal.py</div>
                <pre className="fs-code">{`# ═══ BFS (广度优先搜索) ═══

from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    dist = {start: 0}      # 距离 (无权最短路!)
    parent = {start: None}  # BFS 树
    
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            if v not in visited:
                visited.add(v)
                queue.append(v)
                dist[v] = dist[u] + 1
                parent[v] = u
    
    return order, dist, parent

# 时间: O(V + E)
# 空间: O(V)
# 特性: 按层展开 → 无权最短路!

# ═══ DFS (深度优先搜索) ═══

def dfs_recursive(graph, u, visited=None):
    if visited is None:
        visited = set()
    visited.add(u)
    print(f"Visit: {u}")
    
    for v in graph[u]:
        if v not in visited:
            dfs_recursive(graph, v, visited)
    
    print(f"Finish: {u}")  # 后序!

def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    order = []
    
    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)
        order.append(u)
        for v in reversed(graph[u]):
            if v not in visited:
                stack.append(v)
    
    return order

# 时间: O(V + E)
# 空间: O(V) (栈深度)

# ═══ DFS 时间戳与边分类 ═══

timer = 0

def dfs_timestamps(graph, u, disc, finish, parent, edges):
    global timer
    timer += 1
    disc[u] = timer
    
    for v in graph[u]:
        if disc[v] == 0:          # 未访问
            parent[v] = u
            edges.append(('tree', u, v))
            dfs_timestamps(graph, v, disc, finish, parent, edges)
        elif finish[v] == 0:      # 已发现但未完成
            edges.append(('back', u, v))    # 回边 → 有环!
        elif disc[v] > disc[u]:
            edges.append(('forward', u, v)) # 前向边
        else:
            edges.append(('cross', u, v))   # 交叉边
    
    timer += 1
    finish[u] = timer

# 回边 (back edge) 的存在 ⟺ 图有环!

# ═══ BFS vs DFS 对比 ═══
#
#              │ BFS              │ DFS
# ─────────────┼──────────────────┼──────────────
# 数据结构     │ 队列 (FIFO)      │ 栈 (LIFO)
# 遍历顺序     │ 按层展开          │ 一条路走到底
# 最短路       │ 无权图 ✓          │ ✗
# 连通分量     │ ✓                │ ✓
# 环检测       │ ✓                │ ✓ (回边!)
# 拓扑排序     │ Kahn (入度)      │ 后序反转
# 强连通分量   │ ✗                │ Tarjan / Kosaraju
# 割点/桥     │ ✗                │ ✓ (low 值)
# 空间        │ O(宽度)           │ O(深度)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 连通性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> connectivity.py</div>
                <pre className="fs-code">{`# ═══ 连通分量 (无向图) ═══

def connected_components(graph, n):
    visited = [False] * n
    components = []
    
    for v in range(n):
        if not visited[v]:
            comp = []
            # BFS or DFS 从 v 出发
            stack = [v]
            while stack:
                u = stack.pop()
                if visited[u]:
                    continue
                visited[u] = True
                comp.append(u)
                for w in graph[u]:
                    if not visited[w]:
                        stack.append(w)
            components.append(comp)
    
    return components  # 每个元素是一个连通分量

# ═══ 强连通分量 SCC (有向图) ═══
# Tarjan 算法: O(V + E)

def tarjan_scc(graph, n):
    idx = [0]
    stack = []
    on_stack = [False] * n
    disc = [-1] * n
    low = [0] * n
    sccs = []
    
    def strongconnect(v):
        disc[v] = low[v] = idx[0]
        idx[0] += 1
        stack.append(v)
        on_stack[v] = True
        
        for w in graph[v]:
            if disc[w] == -1:
                strongconnect(w)
                low[v] = min(low[v], low[w])
            elif on_stack[w]:
                low[v] = min(low[v], disc[w])
        
        # v 是 SCC 的根
        if low[v] == disc[v]:
            scc = []
            while True:
                w = stack.pop()
                on_stack[w] = False
                scc.append(w)
                if w == v:
                    break
            sccs.append(scc)
    
    for v in range(n):
        if disc[v] == -1:
            strongconnect(v)
    
    return sccs

# ═══ 割点与桥 ═══

def find_bridges(graph, n):
    """找所有桥 (删除后增加连通分量的边)"""
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    bridges = []
    
    def dfs(u, parent):
        disc[u] = low[u] = timer[0]
        timer[0] += 1
        
        for v in graph[u]:
            if disc[v] == -1:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:   # 桥!
                    bridges.append((u, v))
            elif v != parent:
                low[u] = min(low[u], disc[v])
    
    for v in range(n):
        if disc[v] == -1:
            dfs(v, -1)
    
    return bridges

# low[v] > disc[u] → (u,v) 是桥
# low[v] ≥ disc[u] 且 u 非根 → u 是割点
# u 是根且有 ≥2 个子树 → u 是割点

# ═══ 应用场景 ═══
# 
# 连通分量:    社交网络朋友圈、图像连通区域
# 强连通分量:  有向图缩点、2-SAT
# 割点:       网络关键节点 (单点故障)
# 桥:         网络关键链路 (容灾设计)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛤️ 欧拉与哈密顿</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> euler_hamilton.txt</div>
                <pre className="fs-code">{`═══ 欧拉路径与回路 ═══

  欧拉路径: 经过每条边恰好一次的路径
  欧拉回路: 起点=终点的欧拉路径

  存在条件 (无向图):
  ──────────────────────────────
  欧拉回路: 所有顶点度数为偶数 且 图连通
  欧拉路径: 恰好 2 个奇数度顶点 (起/终点) 且 图连通

  存在条件 (有向图):
  ──────────────────────────────
  欧拉回路: 所有顶点 入度=出度 且 图弱连通
  欧拉路径: 至多 1 个顶点 出度-入度=1 (起点)
            至多 1 个顶点 入度-出度=1 (终点)
            其余入度=出度

  Hierholzer 算法 (O(E)):
  
  def find_euler_circuit(graph):
      stack = [0]       # 起点
      circuit = []
      
      while stack:
          v = stack[-1]
          if graph[v]:  # 还有未走的边
              u = graph[v].pop()
              # 无向图: 同时删除反向边
              graph[u].remove(v)
              stack.append(u)
          else:
              circuit.append(stack.pop())
      
      return circuit[::-1]

  历史: 1736 哥尼斯堡七桥问题 — 图论的诞生!
  
  应用:
  • De Bruijn 序列: 包含所有 k^n 个 n-子串的最短序列
  • 中国邮递员问题: 最短遍历所有道路
  • DNA 测序: De Bruijn 图上的欧拉路径!

═══ 哈密顿路径与回路 ═══

  哈密顿路径: 经过每个顶点恰好一次
  哈密顿回路: 起点=终点的哈密顿路径

  ⚠️ 判定是否存在: NP 完全问题!
  (没有已知多项式算法!)

  充分条件 (无必要):
  • Dirac: ∀v, deg(v) ≥ n/2 → 存在哈密顿回路
  • Ore:   ∀不相邻的 u,v, deg(u)+deg(v) ≥ n → 存在

  必要条件 (非充分):
  • 删除 k 个顶点后，剩余分量数 ≤ k

  精确算法: O(n² · 2ⁿ) — 状态压缩 DP!

  def hamilton_path(graph, n):
      dp = [[False] * n for _ in range(1 << n)]
      for v in range(n):
          dp[1 << v][v] = True
      
      for mask in range(1, 1 << n):
          for u in range(n):
              if not (mask & (1 << u)):
                  continue
              if not dp[mask][u]:
                  continue
              for v in graph[u]:
                  if not (mask & (1 << v)):
                      dp[mask | (1 << v)][v] = True
      
      full = (1 << n) - 1
      return any(dp[full][v] for v in range(n))

═══ 欧拉 vs 哈密顿 ═══

              │ 欧拉            │ 哈密顿
  ────────────┼─────────────────┼──────────────
  遍历对象    │ 每条边一次      │ 每个顶点一次
  判定复杂度  │ P (多项式)      │ NP-Complete!
  算法        │ Hierholzer O(E) │ 状压 DP O(n²·2ⁿ)
  著名问题    │ 七桥问题        │ TSP (旅行商)
  实际应用    │ 扫雪车路线      │ 物流配送`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
