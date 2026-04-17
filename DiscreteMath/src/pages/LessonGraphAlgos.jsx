import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['最短路径', '最小生成树', '图着色', '网络流简介'];

export default function LessonGraphAlgos() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_06 — 图论算法</div>
      <div className="fs-hero">
        <h1>图论算法：最短路径 / 最小生成树 / 着色</h1>
        <p>
          图论算法是<strong>路由协议</strong>、<strong>网络优化</strong>、<strong>资源分配</strong>
          的核心引擎——Dijkstra 驱动 GPS 导航，Prim/Kruskal 优化网络布线，
          图着色解决寄存器分配和调度冲突。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 图论算法深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗺️ 最短路径</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> shortest_path.py</div>
                <pre className="fs-code">{`# ═══ Dijkstra — 单源最短路 (非负权) ═══

import heapq

def dijkstra(graph, src, n):
    """graph[u] = [(v, weight), ...]"""
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]  # (距离, 节点)
    
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # 过期条目, 跳过
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    
    return dist

# 时间: O((V+E) log V)   (二叉堆)
#       O(V² + E)         (数组, 稠密图更快)
#       O(E + V log V)    (Fibonacci 堆, 理论最优)
# ⚠️ 不支持负权边!

# ═══ Bellman-Ford — 支持负权 ═══

def bellman_ford(edges, src, n):
    """edges = [(u, v, w), ...], 支持负权"""
    dist = [float('inf')] * n
    dist[src] = 0
    
    for _ in range(n - 1):        # 最多松弛 n-1 轮
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    
    # 检测负环
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None  # 存在负环!
    
    return dist

# 时间: O(VE)
# 优化: SPFA (队列版 BF, 实践中快很多)

# ═══ Floyd-Warshall — 全源最短路 ═══

def floyd_warshall(adj_matrix, n):
    """adj_matrix[i][j] = weight, inf if no edge"""
    dist = [row[:] for row in adj_matrix]
    
    for k in range(n):            # 中间节点
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    
    return dist

# 时间: O(V³)
# 空间: O(V²)  (可 in-place)
# 优点: 简洁, 处理负权, 检测负环 (对角线 < 0)
# 本质: 传递闭包的加权版本!

# ═══ 选型指南 ═══
#
# 算法           │ 时间      │ 负权 │ 场景
# ───────────────┼───────────┼──────┼──────────
# BFS            │ O(V+E)   │ ✗    │ 无权图
# Dijkstra       │ O(ElogV) │ ✗    │ 非负权单源
# Bellman-Ford   │ O(VE)    │ ✓    │ 负权/负环检测
# Floyd-Warshall │ O(V³)    │ ✓    │ 全源 / 小图
# A*             │ O(ElogV) │ ✗    │ 有启发式的单目标`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌲 最小生成树</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> mst.py</div>
                <pre className="fs-code">{`# ═══ Kruskal — 贪心 + 并查集 ═══

class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # 已连通 (会形成环!)
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True

def kruskal(edges, n):
    """edges = [(w, u, v), ...]"""
    edges.sort()                # 按权重排序
    uf = UnionFind(n)
    mst = []
    total = 0
    
    for w, u, v in edges:
        if uf.union(u, v):      # 不形成环则加入
            mst.append((u, v, w))
            total += w
            if len(mst) == n - 1:
                break
    
    return mst, total

# 时间: O(E log E) = O(E log V)  (排序为瓶颈)

# ═══ Prim — 贪心 + 优先队列 ═══

import heapq

def prim(graph, n):
    """graph[u] = [(v, weight), ...]"""
    visited = [False] * n
    pq = [(0, 0, -1)]  # (weight, node, parent)
    mst = []
    total = 0
    
    while pq and len(mst) < n:
        w, u, parent = heapq.heappop(pq)
        if visited[u]:
            continue
        visited[u] = True
        if parent != -1:
            mst.append((parent, u, w))
        total += w
        
        for v, weight in graph[u]:
            if not visited[v]:
                heapq.heappush(pq, (weight, v, u))
    
    return mst, total

# 时间: O(E log V)  (二叉堆)
#       O(E + V log V)  (Fibonacci 堆)

# ═══ MST 性质 ═══

# Cut Property (切割性质):
#   对于任意切割, 穿越切割的最小权边在某个 MST 中
#   → Kruskal 和 Prim 的正确性基础!

# Cycle Property (环路性质):
#   图中任意环上的最大权边不在任何 MST 中

# 唯一性:
#   如果所有边权不同 → MST 唯一

# ═══ Kruskal vs Prim ═══
#
#              │ Kruskal          │ Prim
# ─────────────┼──────────────────┼──────────────
# 策略         │ 全局最小边       │ 局部扩展
# 数据结构     │ 并查集           │ 优先队列
# 稀疏图       │ ✓ (E log E 小)   │ 一般
# 稠密图       │ 一般             │ ✓ (E+V log V)
# 离线         │ ✓ (边列表)       │ ✗ (需邻接表)
# 应用         │ 多连通分量       │ 增量构建`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎨 图着色</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> coloring.txt</div>
                <pre className="fs-code">{`═══ 图着色问题 ═══

  给图的顶点染色, 使相邻顶点颜色不同
  
  χ(G) = 色数 = 所需最少颜色数

  判定 χ(G) ≤ k (k≥3) 是 NP 完全问题!

═══ 特殊图的色数 ═══

  图类型        │ χ(G)
  ──────────────┼──────────────
  空图 (无边)   │ 1
  完全图 Kₙ     │ n
  二部图        │ 2  (当且仅当!)
  树            │ 2  (二部图)
  环 Cₙ (n奇)  │ 3
  环 Cₙ (n偶)  │ 2
  平面图        │ ≤ 4 (四色定理!)
  Peterson      │ 3

═══ 四色定理 ═══

  任何平面图都可以用 4 种颜色着色!
  
  1976 年 Appel & Haken 用计算机证明 (减少到 1936 种情况)
  — 第一个由计算机辅助证明的重要定理

  五色定理 (较易证明):
  • 平面图至少有一个 deg ≤ 5 的顶点 (欧拉公式!)
  • 删除该顶点, 递归着色, 再加回
  • 最多 5 个邻居 → 5 色足够

═══ 贪心着色 ═══

  def greedy_coloring(graph, n):
      color = [-1] * n
      
      for u in range(n):
          # 收集邻居已用颜色
          neighbor_colors = set()
          for v in graph[u]:
              if color[v] != -1:
                  neighbor_colors.add(color[v])
          
          # 选最小可用颜色
          c = 0
          while c in neighbor_colors:
              c += 1
          color[u] = c
      
      return color

  # 使用颜色数 ≤ Δ+1 (Δ = 最大度)
  # 顺序影响结果! 最优顺序也是 NP-Hard

═══ 边着色 (边色数 χ'(G)) ═══

  Vizing 定理: Δ ≤ χ'(G) ≤ Δ+1
  
  即边着色最多比最大度多用 1 种颜色!

═══ 应用 ═══

  1. 寄存器分配 (编译器):
     变量 = 顶点, 同时活跃 = 边
     颜色 = 寄存器
     χ(G) = 最少需要的寄存器数

  2. 考试调度:
     课程 = 顶点, 有共同学生的课 = 边
     颜色 = 时间段
     χ(G) = 最少时间段数

  3. 地图着色: 四色定理!

  4. 频率分配:
     基站 = 顶点, 干扰 = 边
     颜色 = 频率
     χ(G) = 最少频率数

  5. 二部图判定:
     χ(G) = 2 ⟺ G 是二部图
     BFS 交替染色即可检测!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 网络流简介</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> network_flow.txt</div>
                <pre className="fs-code">{`═══ 网络流基础 ═══

  网络 G = (V, E) 有:
  • 源 s, 汇 t
  • 容量函数 c(u,v) ≥ 0
  • 流函数 f(u,v) 满足:
    - 容量约束: 0 ≤ f(u,v) ≤ c(u,v)
    - 流守恒: Σf(in) = Σf(out) (除 s,t)

  最大流: 从 s 到 t 的最大流量

═══ Ford-Fulkerson 方法 ═══

  核心思想: 反复找增广路径 (augmenting path)
  
  1. 初始: 所有流 = 0
  2. 构建残差图 (residual graph):
     - 正向边: 剩余容量 c(u,v) - f(u,v)
     - 反向边: 已用流量 f(u,v) (允许"退流"!)
  3. 在残差图中找 s→t 路径
  4. 沿路径增广 (bottleneck)
  5. 重复直到无增广路径

  BFS 找路径 → Edmonds-Karp: O(VE²)
  DFS 找路径 → Ford-Fulkerson: O(Ef*) (可能不终止!)

═══ 最大流-最小割定理 ═══

  最大流 = 最小割
  
  割: 将 V 分为 S(含s) 和 T(含t)
  割容量: Σ c(u,v), u∈S, v∈T
  
  最小割 = 将 s 和 t 分开的最小容量切割
  
  定理: max flow = min cut  (对偶性!)

  直觉: 流的上限是最薄弱的"瓶颈"

═══ 二部图最大匹配 ═══

  二部图 G = (L ∪ R, E)
  匹配: 边集 M ⊆ E, 每个顶点至多被一条边覆盖
  最大匹配 = 规模最大的匹配

  方法 1: 转化为最大流
    添加源 s → L 中所有点 (容量 1)
    添加 R 中所有点 → 汇 t (容量 1)
    最大流 = 最大匹配!

  方法 2: Hungarian 算法 O(V³)
  方法 3: Hopcroft-Karp O(E√V)

  Hall 定理 (完美匹配条件):
    L 中任意子集 S, |N(S)| ≥ |S|
    (邻居数 ≥ 子集大小)
  
  König 定理:
    二部图中: 最大匹配 = 最小顶点覆盖!

═══ 应用 ═══

  1. 任务分配: 人→任务, 最大匹配 = 最多任务完成
  2. 网络带宽: 最大流 = 可用带宽
  3. 图像分割: 最小割 = 前景/背景分割
  4. 棒球淘汰: 某队是否仍有夺冠可能?
  5. 项目选择: 最大权闭合图 → 最小割`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
