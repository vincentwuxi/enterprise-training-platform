import { useState } from 'react';
import './LessonCommon.css';

const TREE_PROBLEMS = [
  {
    id: 94, title: '二叉树中序遍历', difficulty: 'easy', tag: '遍历',
    code: `def inorderTraversal(root):
    # 方法1：递归（简洁）
    res = []
    def dfs(node):
        if not node: return
        dfs(node.left)       # 左
        res.append(node.val) # 根
        dfs(node.right)      # 右
    dfs(root)
    return res

    # 方法2：迭代（面试推荐）
    res, stack, cur = [], [], root
    while cur or stack:
        while cur:               # 一路向左
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        res.append(cur.val)     # 访问根
        cur = cur.right          # 转向右子树
    return res`,
  },
  {
    id: 104, title: '二叉树最大深度', difficulty: 'easy', tag: 'DFS/BFS',
    code: `def maxDepth(root) -> int:
    # DFS 后序遍历
    if not root: return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))

    # BFS 层序遍历
    if not root: return 0
    from collections import deque
    q = deque([root])
    depth = 0
    while q:
        depth += 1
        for _ in range(len(q)):  # 每次处理一层
            node = q.popleft()
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
    return depth`,
  },
  {
    id: 124, title: '二叉树最大路径和', difficulty: 'hard', tag: '后序+全局变量',
    code: `def maxPathSum(root) -> int:
    # 关键：区分"贡献值"（往上传递）和"路径和"（横跨左右）
    self_max = float('-inf')
    
    def dfs(node) -> int:
        if not node: return 0
        # 子节点的贡献（负数取0，不如不走）
        left  = max(dfs(node.left),  0)
        right = max(dfs(node.right), 0)
        
        # 以 node 为最高点的路径和
        self_max = max(self_max, node.val + left + right)
        
        # 向父节点提供的贡献（只能选一侧）
        return node.val + max(left, right)
    
    dfs(root)
    return self_max`,
  },
  {
    id: 206, title: '反转链表', difficulty: 'easy', tag: '链表操作',
    code: `def reverseList(head):
    # 迭代（推荐）
    prev, cur = None, head
    while cur:
        nxt = cur.next   # 1. 保存下一个
        cur.next = prev  # 2. 反转指针
        prev = cur       # 3. prev 前进
        cur = nxt        # 4. cur 前进
    return prev

    # 递归（理解尾递归）
    def reverseList(head):
        if not head or not head.next: return head
        new_head = reverseList(head.next)  # 假设后面已经反转
        head.next.next = head              # 把当前节点接到末尾
        head.next = None
        return new_head`,
  },
];

const TRAVERSAL = {
  pre:  ['根', '左', '右', '→ 用于序列化/复制树'],
  in:   ['左', '根', '右', '→ BST 得到有序序列'],
  post: ['左', '右', '根', '→ 用于删除/计算'],
  bfs:  ['层序（队列）', '', '', '→ 最短路径/层级问题'],
};

export default function LessonLinkedTree() {
  const [probIdx, setProbIdx] = useState(0);
  const [traversal, setTraversal] = useState('pre');
  const prob = TREE_PROBLEMS[probIdx];

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块二 · Linked List & Trees</div>
          <h1>链表 & 二叉树 — 递归思维训练</h1>
          <p>链表的六大操作模板、二叉树的四种遍历、BST 的性质利用——递归思维是打通树形结构题目的核心。</p>
        </div>

        <div className="al-metrics">
          {[{ v: '4种', l: '遍历方式' }, { v: '6类', l: '链表模板' }, { v: 'BST', l: '有序性利用' }, { v: '递归', l: '核心思维' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Tree Traversal */}
        <div className="al-section">
          <h2>🌲 二叉树遍历 — 统一模板</h2>
          <div className="al-tabs">
            {[['pre', '前序'], ['in', '中序'], ['post', '后序'], ['bfs', 'BFS层序']].map(([k, l]) => (
              <button key={k} className={`al-tab${traversal === k ? ' active' : ''}`} onClick={() => setTraversal(k)}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.9rem' }}>
              {TRAVERSAL[traversal].slice(0, 3).filter(Boolean).map((s, i) => (
                <span key={i} style={{ background: 'var(--al-glow)', color: 'var(--al-primary)', border: '1px solid rgba(249,115,22,.3)', borderRadius: 8, padding: '.35rem .75rem', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
            <span style={{ color: 'var(--al-muted)', fontSize: '.85rem' }}>{TRAVERSAL[traversal][3]}</span>
          </div>
          <div className="al-code">{traversal === 'pre' ? `# 前序遍历（根左右）— DFS 模板
def preorder(root):
    if not root: return
    print(root.val)      # 先处理根
    preorder(root.left)
    preorder(root.right)

# 迭代版（栈）
def preorder_iter(root):
    if not root: return []
    stack, res = [root], []
    while stack:
        node = stack.pop()
        res.append(node.val)
        if node.right: stack.append(node.right)  # 先压右
        if node.left:  stack.append(node.left)    # 后压左（先出）
    return res` : traversal === 'in' ? `# 中序遍历（左根右）— BST 核心
def inorder(root):
    if not root: return
    inorder(root.left)
    print(root.val)      # 中间处理根
    inorder(root.right)

# BST 中序 = 升序序列
# 验证 BST (LC98)：中序遍历是否严格递增
prev = float('-inf')
def is_valid_BST(node):
    global prev
    if not node: return True
    if not is_valid_BST(node.left): return False
    if node.val <= prev: return False  # 不是严格递增
    prev = node.val
    return is_valid_BST(node.right)` : traversal === 'post' ? `# 后序遍历（左右根）— 计算/删除类
def postorder(root):
    if not root: return
    postorder(root.left)
    postorder(root.right)
    print(root.val)      # 最后处理根（子节点先算完）

# 后序适合：计算树的高度、节点数、路径和
# 因为子节点的值会"向上汇报"给父节点
def height(node):
    if not node: return 0
    l = height(node.left)
    r = height(node.right)
    return 1 + max(l, r)  # ← 利用子节点结果` : `# BFS 层序遍历（队列）
from collections import deque
def level_order(root):
    if not root: return []
    q = deque([root])
    res = []
    while q:
        level = []
        for _ in range(len(q)):  # 关键：len(q) 是当前层节点数
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res  # 返回[[层1],[层2],...]`}</div>
        </div>

        {/* Linked List Templates */}
        <div className="al-section">
          <h2>🔗 链表六大操作模板</h2>
          <div className="al-code">{`# ① 虚拟头节点（处理头节点边界）
dummy = ListNode(0, head)
cur = dummy
# ... 操作完后 return dummy.next

# ② 快慢指针（找中点/环/倒数第k个）
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
# slow 此时在中点

# ③ 链表反转（核心：三指针）
prev, cur = None, head
while cur:
    nxt = cur.next
    cur.next = prev
    prev, cur = cur, nxt
return prev

# ④ 合并两个有序链表
def merge(l1, l2):
    dummy = cur = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val: cur.next = l1; l1 = l1.next
        else:                cur.next = l2; l2 = l2.next
        cur = cur.next
    cur.next = l1 or l2
    return dummy.next

# ⑤ 环检测（Floyd 判圈）
def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next; fast = fast.next.next
        if slow == fast: return True
    return False

# ⑥ 删除倒数第 N 个节点（快慢指针差距 N 步）
def removeNthFromEnd(head, n):
    dummy = fast = slow = ListNode(0, head)
    for _ in range(n): fast = fast.next
    while fast.next: fast = fast.next; slow = slow.next
    slow.next = slow.next.next
    return dummy.next`}</div>
          <div className="al-tip">💡 <span>链表题 90% 都能用「<strong>虚拟头节点 + 快慢指针</strong>」解决。遇到不确定头节点会不会变化的情况，一律加 dummy。</span></div>
        </div>

        {/* Problem Library */}
        <div className="al-section">
          <h2>📚 高频题精讲</h2>
          <div className="al-tabs">
            {TREE_PROBLEMS.map((p, i) => (
              <button key={i} className={`al-tab${probIdx === i ? ' active' : ''}`} onClick={() => setProbIdx(i)}>#{p.id}</button>
            ))}
          </div>
          <div className="al-problem">
            <div className="al-problem-header">
              <span className="al-problem-id">#{prob.id}</span>
              <span className="al-problem-title">{prob.title}</span>
              <span className={`al-difficulty ${prob.difficulty}`}>{prob.difficulty === 'easy' ? '简单' : prob.difficulty === 'medium' ? '中等' : '困难'}</span>
              <span className="al-tag">{prob.tag}</span>
            </div>
            <div className="al-problem-body"><div className="al-code">{prob.code}</div></div>
          </div>
        </div>

        {/* Complexity Summary */}
        <div className="al-section">
          <h2>📊 常见题复杂度一览</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>题目</th><th>LeetCode</th><th>时间</th><th>空间</th><th>难度</th></tr></thead>
              <tbody>
                {[
                  ['反转链表', '206', 'O(n)', 'O(1)', 'easy'],
                  ['合并有序链表', '21', 'O(m+n)', 'O(1)', 'easy'],
                  ['环形链表 II', '142', 'O(n)', 'O(1)', 'medium'],
                  ['二叉树最大深度', '104', 'O(n)', 'O(h)', 'easy'],
                  ['对称二叉树', '101', 'O(n)', 'O(h)', 'easy'],
                  ['二叉树最大路径和', '124', 'O(n)', 'O(h)', 'hard'],
                  ['序列化二叉树', '297', 'O(n)', 'O(n)', 'hard'],
                ].map(([title, lc, t, s, d], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{title}</td>
                    <td><span className="al-tag blue">#{lc}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-accent)' }}>{t}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-blue)' }}>{s}</td>
                    <td><span className={`al-difficulty ${d}`}>{d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}</span></td>
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
