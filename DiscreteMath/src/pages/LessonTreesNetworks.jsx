import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['树的基本性质', '二叉树与遍历', '生成树与计数', '最大流算法'];

export default function LessonTreesNetworks() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_07 — 树与网络流</div>
      <div className="fs-hero">
        <h1>树与网络流：树的遍历 / 最大流 / 匹配</h1>
        <p>
          <strong>树</strong>是最简洁的连通结构——n 个顶点 n-1 条边，无环且连通。
          从<strong>文件系统</strong>到<strong>DOM 树</strong>再到<strong>决策树</strong>，
          树结构无处不在。<strong>网络流算法</strong>则解决资源分配的最优化问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 树与网络流深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌳 树的基本性质</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> tree_properties.txt</div>
                <pre className="fs-code">{`═══ 树的定义 ═══

  树 = 连通无环图

  以下命题等价 (任一即树):
  1. G 连通且无环
  2. G 连通且恰有 n-1 条边
  3. G 无环且恰有 n-1 条边
  4. G 中任意两点间恰有一条简单路径
  5. G 连通, 删除任一边则不连通 (每条边都是桥!)
  6. G 无环, 添加任一边则形成恰好一个环

═══ 有根树 (Rooted Tree) ═══

  选定一个顶点为根 → 定义层次结构

  术语:
  • 父节点 (Parent): 上一层的唯一前驱
  • 子节点 (Child): 下一层的后继
  • 叶节点 (Leaf): 无子节点 (deg=1, 除根外)
  • 内部节点: 非叶节点
  • 深度 (Depth): 根到该节点的路径长
  • 高度 (Height): 该节点到叶的最长路径
  • 兄弟 (Sibling): 同一父节点的子节点
  • 子树 (Subtree): 以某节点为根的子图

  树的高度 h:
  • 最坏: h = n-1 (链状)
  • 最优: h = ⌈log₂ n⌉ (完全平衡)

═══ 树的类型 ═══

  m 叉树 (m-ary tree):
  • 每个节点最多 m 个子节点
  • 满 m 叉树: 每个内部节点恰 m 个子节点
  • 完全 m 叉树: 除最后一层外全满
  
  k 层满二叉树:
  • 内部节点: 2ᵏ - 1
  • 叶节点: 2ᵏ
  • 总节点: 2ᵏ⁺¹ - 1

  性质 (满 m 叉树, n 个内部节点):
  • 叶节点: (m-1)n + 1
  • 总节点: mn + 1
  • 高度 h: ⌈log_m((m-1)n + 1)⌉ - 1

═══ 森林 ═══

  森林 = 不相交的树的并集 (无环图)
  
  连通分量数 = n - m  (n 顶点, m 边)
  
  添加 k-1 条边可把 k 棵树连成一棵树

═══ 应用 ═══

  结构       │ 树类型            │ 操作
  ───────────┼───────────────────┼──────────
  文件系统   │ 多叉树            │ 遍历/搜索
  DOM        │ 多叉树            │ 选择/变更
  表达式     │ 二叉树            │ 求值/简化
  Huffman    │ 满二叉树          │ 编码/解码
  Trie       │ 26叉树            │ 字符串匹配
  BST/AVL    │ 二叉搜索树        │ O(log n) 查找
  B-Tree     │ m 叉搜索树        │ 磁盘 I/O 优化
  决策树     │ 二叉树            │ ML 分类`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 二叉树与遍历</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> binary_tree.py</div>
                <pre className="fs-code">{`# ═══ 二叉树遍历 ═══

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# ─── 前序 (Pre-order): 根-左-右 ───
def preorder(root):
    if not root:
        return
    print(root.val)         # 处理根
    preorder(root.left)     # 递归左
    preorder(root.right)    # 递归右

# 应用: 序列化/复制树, 表达式前缀表示

# ─── 中序 (In-order): 左-根-右 ───
def inorder(root):
    if not root:
        return
    inorder(root.left)
    print(root.val)         # BST → 排序输出!
    inorder(root.right)

# 应用: BST 排序输出, 表达式中缀表示

# ─── 后序 (Post-order): 左-右-根 ───
def postorder(root):
    if not root:
        return
    postorder(root.left)
    postorder(root.right)
    print(root.val)         # 最后处理根

# 应用: 计算目录大小, 表达式求值, 内存释放

# ─── 层序 (Level-order): BFS ───
from collections import deque

def levelorder(root):
    if not root:
        return
    queue = deque([root])
    while queue:
        node = queue.popleft()
        print(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

# ═══ 遍历重建 ═══

# 前序 + 中序 → 唯一重建树!
def build_tree(preorder, inorder):
    if not preorder:
        return None
    root_val = preorder[0]
    root = TreeNode(root_val)
    
    mid = inorder.index(root_val)
    
    root.left = build_tree(
        preorder[1:1+mid],
        inorder[:mid]
    )
    root.right = build_tree(
        preorder[1+mid:],
        inorder[mid+1:]
    )
    return root

# 注意: 前序 + 后序 不能唯一重建! (除非满二叉树)

# ═══ 表达式树 ═══

#        +
#       / \\
#      *   5
#     / \\
#    3   4
#
# 前序: + * 3 4 5    (前缀/波兰表示)
# 中序: 3 * 4 + 5    (中缀, 需括号)
# 后序: 3 4 * 5 +    (后缀/逆波兰, 栈计算!)

def eval_postfix(tokens):
    """后缀表达式求值"""
    stack = []
    ops = {'+': lambda a,b: a+b,
           '-': lambda a,b: a-b,
           '*': lambda a,b: a*b,
           '/': lambda a,b: a//b}
    
    for t in tokens:
        if t in ops:
            b, a = stack.pop(), stack.pop()
            stack.append(ops[t](a, b))
        else:
            stack.append(int(t))
    
    return stack[0]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 生成树与计数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> spanning_trees.txt</div>
                <pre className="fs-code">{`═══ 生成树 (Spanning Tree) ═══

  图 G 的生成树 = G 的子图, 包含所有顶点且连通无环
  
  性质:
  • 恰含 n-1 条边
  • 添加任一非树边形成恰一个环 (基本环)
  • 删除任一树边断开成两个分量 (基本割)
  
  BFS 树 和 DFS 树 都是生成树!

═══ Cayley 公式 ═══

  完全图 Kₙ 的标记生成树个数 = nⁿ⁻²

  K₃: 3¹ = 3 棵
  K₄: 4² = 16 棵
  K₅: 5³ = 125 棵

═══ Prüfer 序列 ═══

  n 个标记顶点的树 ↔ 长度 n-2 的序列 (元素 ∈ [1,n])
  
  → 双射! 证明 Cayley 公式: nⁿ⁻² 种序列

  编码 (树 → 序列):
  def tree_to_prufer(adj, n):
      degree = [len(adj[v]) for v in range(n)]
      seq = []
      
      for _ in range(n - 2):
          # 找最小叶节点
          leaf = min(v for v in range(n)
                     if degree[v] == 1)
          # 记录其邻居
          neighbor = next(v for v in adj[leaf]
                         if degree[v] > 0)
          seq.append(neighbor)
          degree[leaf] = 0
          degree[neighbor] -= 1
      
      return seq

  解码 (序列 → 树):
  def prufer_to_tree(seq, n):
      degree = [1] * n
      for v in seq:
          degree[v] += 1
      
      edges = []
      ptr = 0
      
      for v in seq:
          while degree[ptr] != 1:
              ptr += 1
          edges.append((ptr, v))
          degree[ptr] -= 1
          degree[v] -= 1
          if degree[v] == 1 and v < ptr:
              edges.append((v, seq[...]))
              # ... 完整实现略
          ptr += 1
      
      return edges

═══ Kirchhoff 矩阵树定理 ═══

  一般图的生成树计数:
  
  Laplacian 矩阵 L = D - A
  (D = 度数对角矩阵, A = 邻接矩阵)
  
  生成树数 = L 的任意一个 (n-1)×(n-1) 余子式的行列式

  例: 三角形 K₃
       [ 2 -1 -1]
  L =  [-1  2 -1]
       [-1 -1  2]
  
  删除第3行第3列: det[2,-1; -1,2] = 4-1 = 3 ✓

═══ 应用 ═══

  1. 网络可靠性: 生成树数越多 → 网络越健壮
  2. 随机生成树: Aldous-Broder 算法 (随机游走!)
  3. 电阻网络: 有效电阻 ∝ 1/生成树数
  4. MCMC: 生成树采样用于概率推断`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 最大流算法实现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> max_flow.py</div>
                <pre className="fs-code">{`# ═══ Edmonds-Karp (BFS 版 Ford-Fulkerson) ═══

from collections import deque

def edmonds_karp(graph, s, t, n):
    """
    graph[u][v] = capacity (邻接矩阵)
    返回最大流值
    """
    def bfs(source, sink, parent):
        visited = {source}
        queue = deque([source])
        
        while queue:
            u = queue.popleft()
            for v in range(n):
                if v not in visited and graph[u][v] > 0:
                    visited.add(v)
                    parent[v] = u
                    if v == sink:
                        return True
                    queue.append(v)
        return False
    
    max_flow = 0
    
    while True:
        parent = [-1] * n
        if not bfs(s, t, parent):
            break  # 无增广路
        
        # 找瓶颈
        path_flow = float('inf')
        v = t
        while v != s:
            u = parent[v]
            path_flow = min(path_flow, graph[u][v])
            v = u
        
        # 更新残差图
        v = t
        while v != s:
            u = parent[v]
            graph[u][v] -= path_flow  # 正向减
            graph[v][u] += path_flow  # 反向加
            v = u
        
        max_flow += path_flow
    
    return max_flow

# 时间: O(VE²) — 足够应对中等规模图

# ═══ Dinic (更快的最大流) ═══

class Dinic:
    """O(V²E) 一般图, O(E√V) 单位容量图"""
    
    def __init__(self, n):
        self.n = n
        self.graph = [[] for _ in range(n)]
    
    def add_edge(self, u, v, cap):
        self.graph[u].append([v, cap, len(self.graph[v])])
        self.graph[v].append([u, 0, len(self.graph[u]) - 1])
    
    def bfs(self, s, t):
        self.level = [-1] * self.n
        self.level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v, cap, _ in self.graph[u]:
                if cap > 0 and self.level[v] == -1:
                    self.level[v] = self.level[u] + 1
                    q.append(v)
        return self.level[t] != -1
    
    def dfs(self, u, t, flow):
        if u == t:
            return flow
        while self.iter[u] < len(self.graph[u]):
            v, cap, rev = self.graph[u][self.iter[u]]
            if cap > 0 and self.level[v] == self.level[u] + 1:
                d = self.dfs(v, t, min(flow, cap))
                if d > 0:
                    self.graph[u][self.iter[u]][1] -= d
                    self.graph[v][rev][1] += d
                    return d
            self.iter[u] += 1
        return 0
    
    def max_flow(self, s, t):
        flow = 0
        while self.bfs(s, t):
            self.iter = [0] * self.n
            while True:
                f = self.dfs(s, t, float('inf'))
                if f == 0:
                    break
                flow += f
        return flow

# ═══ 最小费用最大流 (MCMF) ═══
# 每条边有容量 c 和单位费用 w
# 目标: 在最大流前提下最小化总费用
# 算法: SPFA + 增广 (把 BFS 换成最短路)
# 应用: 任务分配最优化, KM 算法的替代`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
