import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['布尔代数', '有限状态机', '复杂度理论', '综合实战'];

export default function LessonBooleanCrypto() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_08 — 代数结构与应用</div>
      <div className="fs-hero">
        <h1>代数结构与应用：布尔代数 / FSM / 复杂度理论</h1>
        <p>
          <strong>布尔代数</strong>是数字电路和编程逻辑的数学基础，
          <strong>有限状态机</strong>驱动正则表达式和协议设计，
          <strong>复杂度理论</strong>回答"什么问题是可计算的"这一根本问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 代数结构与应用深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 布尔代数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> boolean_algebra.txt</div>
                <pre className="fs-code">{`═══ 布尔代数 (Boolean Algebra) ═══

  (B, +, ·, ', 0, 1) 满足:
  • 交换律: a+b = b+a,  a·b = b·a
  • 分配律: a·(b+c) = a·b + a·c
            a+(b·c) = (a+b)·(a+c)  ← 与普通代数不同!
  • 单位元: a+0 = a,  a·1 = a
  • 补元:   a+a' = 1, a·a' = 0

  对偶原理: 交换 +↔·, 0↔1, 等式仍成立

═══ 布尔函数与电路 ═══

  布尔函数: f: {0,1}ⁿ → {0,1}

  n=2 变量有 2^(2²) = 16 种布尔函数

  常见门:
  AND:  a·b     (串联)
  OR:   a+b     (并联)
  NOT:  a'      (反相器)
  NAND: (a·b)'  (万能门!)
  XOR:  a⊕b = a'b + ab'  (异或 = 不等检测)

═══ 化简: Sum of Products (SOP) ═══

  1. 真值表 → 找所有输出为 1 的行
  2. 写出每行的极小项 (minterm)
  3. 析取所有极小项

  例: f(A,B,C) = Σm(1,3,5,7)
  = A'B'C + A'BC + AB'C + ABC
  = C(A'B' + A'B + AB' + AB)
  = C · 1 = C

═══ 卡诺图化简 (2-4 变量) ═══

  比代数化简更直观!

  AB\\CD  00  01  11  10
  00   │  0   1   0   0
  01   │  1   1   1   1
  11   │  0   1   0   0
  10   │  0   0   0   0

  → 圈出最大矩形组 → 消去变化的变量
  → f = B'D + B'C·...

═══ Quine-McCluskey 算法 ═══

  卡诺图的系统化版本 (适用于多变量!)

  步骤:
  1. 按 1 的个数分组
  2. 相邻组间合并 (只差 1 位的)
  3. 标记被合并的项 → 未标记的 = 素蕴含项
  4. 选择最小覆盖 (集合覆盖问题!)

  → 这本身是 NP-Hard! 但实际中效果很好

═══ 在 CS 中的应用 ═══

  1. CPU ALU: 加法器、比较器、移位器全由门组合
  2. 编译器: 短路求值 (&&, ||) = 布尔代数
  3. 数据库: WHERE 条件优化 = 布尔化简
  4. 搜索引擎: 布尔检索 (AND/OR/NOT)
  5. 权限系统: 位掩码 (r=4, w=2, x=1 → rwx=7)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 有限状态机</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> fsm.txt</div>
                <pre className="fs-code">{`═══ 有限自动机 (Finite Automaton) ═══

  DFA = (Q, Σ, δ, q₀, F)
  • Q:  有限状态集
  • Σ:  输入字母表
  • δ:  转移函数 Q × Σ → Q
  • q₀: 初始状态
  • F:  接受状态集 ⊆ Q

═══ DFA 示例: 能被 3 整除的二进制数 ═══

  状态: {q₀, q₁, q₂} (余数 0, 1, 2)
  Σ = {0, 1}
  q₀ = q₀, F = {q₀}

  转移:
  δ(qᵢ, b) = q_{(2i + b) mod 3}

  δ    │ 0    │ 1
  ─────┼──────┼──────
  q₀   │ q₀   │ q₁
  q₁   │ q₂   │ q₀
  q₂   │ q₁   │ q₂

  例: 110₂ = 6 → q₀→q₁→q₀→q₀ ∈ F ✓ (6 mod 3 = 0)

═══ NFA (非确定有限自动机) ═══

  δ: Q × Σ → 𝒫(Q)  (一个输入可到多个状态!)
  
  可有 ε-转移 (不消耗输入)

  NFA 接受 ⟺ 存在一条到达 F 的路径

  子集构造法: NFA → DFA
  • DFA 状态 = NFA 状态的子集
  • 最坏: 2ⁿ 个 DFA 状态!

═══ 正则表达式 ↔ 有限自动机 ═══

  Kleene 定理:
    正则语言 = DFA 识别的语言 = NFA 识别的语言
              = 正则表达式描述的语言

  正则表达式 → NFA: Thompson 构造法
  NFA → DFA: 子集构造法
  DFA → 正则表达式: 状态消去法

  正则: a*b+c?  →  NFA  →  DFA  →  最小 DFA

═══ DFA 最小化 ═══

  Hopcroft 算法: O(n log n)
  
  1. 初始划分: {F, Q\F} (接受/非接受)
  2. 对每个符号, 检查每个分组是否可区分
  3. 可区分则细分
  4. 重复直到稳定
  
  → 最小 DFA 唯一! (同构意义下)

═══ 在 CS 中的应用 ═══

  1. 正则表达式引擎:
     grep, sed, Python re 底层
     NFA 模拟 or DFA 编译

  2. 协议设计:
     TCP 状态机: LISTEN→SYN_SENT→ESTABLISHED→...
     HTTP 状态机: 请求解析

  3. 词法分析器:
     编译器 Scanner (flex/lex)
     Token 识别 = DFA 转移

  4. 硬件设计:
     Mealy 机: 输出取决于状态和输入
     Moore 机: 输出只取决于状态

  5. 游戏 AI: NPC 行为状态机`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 复杂度理论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> complexity.txt</div>
                <pre className="fs-code">{`═══ 计算复杂度类 ═══

  P:    多项式时间可解 (确定性图灵机)
  NP:   多项式时间可验证 (非确定性图灵机)
  NP-Hard: 至少和 NP 中最难的一样难
  NP-Complete: NP ∩ NP-Hard

  关系: P ⊆ NP
  世纪问题: P = NP? (几乎所有人认为 P ≠ NP)

═══ NP 完全问题 ═══

  Cook-Levin 定理: SAT 是 NP-Complete (第一个!)

  归约链:
  SAT → 3-SAT → Clique → Vertex Cover
      → Independent Set → Set Cover
      → Hamiltonian → TSP → ...

  经典 NP-Complete 问题:
  1. SAT (布尔可满足性)
  2. 3-Coloring (三着色)
  3. Clique (最大团)
  4. Vertex Cover (最小顶点覆盖)
  5. Hamiltonian Cycle (哈密顿回路)
  6. TSP (旅行商问题)
  7. Subset Sum (子集和)
  8. Knapsack (背包, 判定版)
  9. Set Cover (集合覆盖)
  10. Integer Programming (整数规划)

═══ 归约 (Reduction) ═══

  A ≤_p B: "A 多项式归约到 B"
  → 如果能解 B, 就能解 A
  → B 至少和 A 一样难!

  证明 X 是 NP-Complete:
  1. 证明 X ∈ NP (给解可多项式验证)
  2. 证明某个已知 NPC 问题 ≤_p X

  例: 3-SAT ≤_p Graph Coloring
  每个子句 → 一组互斥的节点
  → 3 着色 ⟺ 3-SAT 可满足

═══ 面对 NP-Hard 的策略 ═══

  1. 近似算法: 保证近似比
     - Vertex Cover: 2-近似 (O(E))
     - TSP (三角不等式): 1.5-近似 (Christofides)
     - Set Cover: ln(n)-近似 (贪心)

  2. 参数化算法:
     - FPT: O(f(k)·nᶜ), k 是参数
     - Vertex Cover: O(2ᵏ·n) (k 为覆盖大小)

  3. 特殊情况:
     - 平面图: 很多 NPC 变简单
     - 树宽/路径宽有限的图

  4. 启发式:
     - 模拟退火, 遗传算法, 蚁群
     - 实践中效果好, 无理论保证

  5. SAT 求解器:
     - 现代 SAT solver 能处理 10⁶+ 变量!
     - DPLL + CDCL + 单元传播

═══ 可判定性 ═══

  停机问题 (Halting Problem):
  "程序 P 在输入 x 上会停机吗?"
  → 不可判定! (Turing 1936)
  
  证明: 对角线论证 (类似 Cantor)
  假设有 H(P,x) 判定停机
  构造 D(P): if H(P,P) then loop else halt
  D(D) → 矛盾!

  更多不可判定问题:
  • Rice 定理: 一切非平凡语义性质不可判定!
  • Post 对应问题
  • 矩阵死亡问题`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏆 综合实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> applications.txt</div>
                <pre className="fs-code">{`═══ 离散数学在 CS 中的知识图谱 ═══

  离散数学分支    │ CS 应用领域            │ 核心技术
  ────────────────┼────────────────────────┼──────────────
  命题逻辑        │ SAT 求解器             │ DPLL/CDCL
  谓词逻辑        │ 数据库/类型系统         │ SQL/泛型
  集合论          │ 数据库关系代数          │ JOIN/UNION
  等价关系        │ 并查集/分类             │ Union-Find
  偏序            │ 任务调度/依赖           │ 拓扑排序
  函数            │ 编码/加密              │ 单射→加密
  递推            │ 动态规划               │ DP/分治
  组合            │ 算法分析               │ 复杂度
  图论            │ 网络/社交/路由          │ BFS/DFS/Dijkstra
  树              │ 数据结构               │ BST/B-Tree/Trie
  布尔代数        │ 电路设计/编译器         │ 门电路/优化
  有限自动机      │ 正则/编译/协议          │ DFA/NFA
  复杂度理论      │ 算法设计               │ P/NP/近似

═══ 实战案例: 社交网络分析 ═══

  问题: 社交网络中的社区检测

  建模:
  • 用户 = 顶点, 关系 = 边 (无向图)
  • 社区 = 稠密子图 / 连通分量

  算法流程:
  1. 图表示: 邻接表 (稀疏图)
  2. 连通分量: BFS/DFS or Union-Find
  3. 社区检测: Louvain (模块度优化)
  4. 影响力排序: PageRank (幂迭代)
  5. 推荐: 二部图匹配 (用户-物品)

═══ 实战案例: 编译器实现 ═══

  离散数学贯穿编译器全流程:

  1. 词法分析:
     正则表达式 → NFA → DFA → Scanner
     (自动机理论)

  2. 语法分析:
     CFG → Parse Tree
     (形式语言, 树的遍历)

  3. 语义分析:
     类型推导 = 逻辑推理
     (谓词逻辑, 类型论)

  4. 优化:
     寄存器分配 = 图着色 (NP-Complete!)
     常量传播 = 格上的不动点
     (图论, 格论)

  5. 代码生成:
     指令调度 = 拓扑排序
     (偏序, DAG)

═══ 课程总结: 核心公式速查 ═══

  对象         │ 公式
  ─────────────┼──────────────────────
  子集数       │ 2ⁿ
  排列         │ n!/(n-r)!
  组合         │ C(n,r) = n!/(r!(n-r)!)
  多重排列     │ n!/(n₁!n₂!...nₖ!)
  可重组合     │ C(n+k-1, k)
  Catalan      │ C(2n,n)/(n+1)
  Stirling     │ S(n,k) = k·S(n-1,k)+S(n-1,k-1)
  Euler φ      │ n·Π(1-1/p)
  错位排列     │ n!·Σ(-1)ᵏ/k!
  二项式       │ (a+b)ⁿ = ΣC(n,k)aⁿ⁻ᵏbᵏ
  标记树       │ nⁿ⁻² (Cayley)
  Fibonacci    │ (φⁿ-ψⁿ)/√5
  主定理       │ T(n) = aT(n/b)+f(n)
  Stirling近似 │ n! ≈ √(2πn)(n/e)ⁿ

  这些公式构成了计算机科学的数学骨架!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
