import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['联结词与真值表', '逻辑等价与化简', '推理规则', '谓词逻辑'];

export default function LessonPropLogic() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_01 — 命题逻辑</div>
      <div className="fs-hero">
        <h1>命题逻辑：联结词 / 真值表 / 等价重写</h1>
        <p>
          命题逻辑是数学推理与计算机科学的基石——
          <strong>命题 (Proposition)</strong> 是有确定真假值的陈述句，
          <strong>联结词 (Connective)</strong> 将简单命题组合为复合命题，
          <strong>等价重写</strong> 是电路优化和编译器中的核心技术。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 命题逻辑深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 联结词与真值表</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> connectives.txt</div>
                <pre className="fs-code">{`═══ 命题 (Proposition) ═══

定义: 能唯一判定真假的陈述句

  ✅ 命题: "2 + 3 = 5"      (真)
  ✅ 命题: "π 是有理数"      (假)
  ❌ 非命题: "x + 1 > 3"    (含自由变量)
  ❌ 非命题: "关上门!"       (祈使句)
  ❌ 非命题: "这句话是假的"   (悖论)

═══ 五大联结词 ═══

  符号    名称       自然语言     优先级
  ────────────────────────────────────
  ¬       否定(NOT)  非 p          1 (最高)
  ∧       合取(AND)  p 且 q        2
  ∨       析取(OR)   p 或 q        3
  →       蕴含       若 p 则 q     4
  ↔       双条件     p 当且仅当 q  5 (最低)

═══ 核心真值表 ═══

  p  q │ ¬p  p∧q  p∨q  p→q  p↔q
  ─────┼──────────────────────────
  T  T │  F    T    T    T    T
  T  F │  F    F    T    F    F
  F  T │  T    F    T    T    F
  F  F │  T    F    F    T    T

# ─── 蕴含 (→) 的理解要点 ───

  "若 p 则 q"  等价于  "¬p ∨ q"

  直觉: p→q 只在 "前件真、后件假" 时为假
  
  例: "如果下雨，地是湿的"
    下雨 ∧ 地湿 → T  (正常)
    下雨 ∧ 地干 → F  (违反!)
    不雨 ∧ 地湿 → T  (可能有人泼水, 不违反)
    不雨 ∧ 地干 → T  (正常)

# ─── 功能完备集 (Functionally Complete) ───

  {¬, ∧}          足够表达所有真值函数!
  {¬, ∨}          同上 (De Morgan 对偶)
  {NAND} 即 {↑}   单运算符完备! (计算机硬件基础)
  {NOR}  即 {↓}   单运算符完备!

  NAND: p ↑ q ≡ ¬(p ∧ q)
  NOR:  p ↓ q ≡ ¬(p ∨ q)

  用 NAND 构造:
    ¬p    ≡ p ↑ p
    p ∧ q ≡ (p ↑ q) ↑ (p ↑ q)
    p ∨ q ≡ (p ↑ p) ↑ (q ↑ q)

# ─── n 个命题变量的真值表 ───

  变量数 │ 行数  │ 可能的函数数
  ───────┼───────┼─────────────
  1      │ 2     │ 4
  2      │ 4     │ 16
  3      │ 8     │ 256
  n      │ 2ⁿ   │ 2^(2ⁿ)     → 增长极快!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 逻辑等价与化简</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> equivalences.txt</div>
                <pre className="fs-code">{`═══ 核心等价律 ═══

  名称              │ 公式
  ──────────────────┼────────────────────────────
  双重否定          │ ¬¬p ≡ p
  幂等律            │ p ∧ p ≡ p,   p ∨ p ≡ p
  交换律            │ p ∧ q ≡ q ∧ p
  结合律            │ (p∧q)∧r ≡ p∧(q∧r)
  分配律            │ p∧(q∨r) ≡ (p∧q)∨(p∧r)
                    │ p∨(q∧r) ≡ (p∨q)∧(p∨r)
  De Morgan         │ ¬(p∧q) ≡ ¬p∨¬q
                    │ ¬(p∨q) ≡ ¬p∧¬q
  吸收律            │ p∧(p∨q) ≡ p
                    │ p∨(p∧q) ≡ p
  蕴含消去          │ p→q ≡ ¬p∨q
  双条件消去        │ p↔q ≡ (p→q)∧(q→p)
  逆否命题          │ p→q ≡ ¬q→¬p

═══ 范式 (Normal Form) ═══

# ─── 析取范式 (DNF) ───
# 极小项 (Minterm) 的析取
# 形式: (p∧q∧¬r) ∨ (¬p∧q∧r)

  构造 DNF:
  1. 找真值表中结果为 T 的行
  2. 每行写出对应的合取项 (变量为 T 取原，为 F 取非)
  3. 析取所有项

  例:  f(p,q) = p→q
  T 行: (T,T), (F,T), (F,F)
  DNF: (p∧q) ∨ (¬p∧q) ∨ (¬p∧¬q)
  化简: q ∨ ¬p  即 ¬p∨q ✓

# ─── 合取范式 (CNF) ───
# 极大项 (Maxterm) 的合取
# 形式: (p∨q∨¬r) ∧ (¬p∨q∨r)

  构造 CNF:
  1. 找真值表中结果为 F 的行
  2. 每行写出对应的析取项 (变量为 T 取非，为 F 取原)
  3. 合取所有项

  例:  f(p,q) = p→q
  F 行: (T,F)
  CNF: (¬p∨q)  ← 已经是最简! ✓

  应用: SAT 求解器的标准输入格式!

═══ 卡诺图化简 (Karnaugh Map) ═══

  用于 2-4 变量的快速化简
  核心: 合并相邻 1-格 (消去一个变量)

  例: f(A,B,C) 真值表:
       BC
  A  00 01 11 10
  0 | 0  1  1  0 |
  1 | 0  1  1  0 |

  → 圈出 01,11 列 → 消去 A 和 C 的一部分
  → 结果: B (只与 B 有关!)

  规则:
  • 每组必须包含 2ⁿ 个 1 (1, 2, 4, 8...)
  • 组越大越好 (消去变量越多)
  • 可以回绕 (上下/左右相邻)
  • 每个 1 至少被一组覆盖`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 推理规则</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> inference.txt</div>
                <pre className="fs-code">{`═══ 核心推理规则 ═══

  规则名         │ 形式                    │ 直觉
  ───────────────┼─────────────────────────┼──────────────
  Modus Ponens   │ p, p→q ⊢ q             │ "若则"消去
  Modus Tollens  │ ¬q, p→q ⊢ ¬p           │ 逆否推理
  假言三段论      │ p→q, q→r ⊢ p→r         │ 传递性
  析取三段论      │ p∨q, ¬p ⊢ q            │ 排除一项
  合取引入        │ p, q ⊢ p∧q             │ 组合
  合取消去        │ p∧q ⊢ p (或 q)         │ 拆分
  析取引入        │ p ⊢ p∨q               │ 弱化
  归结法          │ p∨q, ¬p∨r ⊢ q∨r       │ SAT 核心!
  构造性两难      │ p→q, r→s, p∨r ⊢ q∨s   │ 分情况讨论

═══ 证明策略 ═══

# ─── 1. 直接证明 ───
  证明 p → q:
  假设 p 为真，推导出 q 为真
  
  例: 证明 "n 是偶数 → n² 是偶数"
  设 n = 2k (偶数定义)
  n² = (2k)² = 4k² = 2(2k²)  → 偶数 ✓

# ─── 2. 反证法 (归谬法) ───
  证明 p:
  假设 ¬p，推导出矛盾
  
  例: 证明 "√2 是无理数"
  假设 √2 = p/q (最简分数)
  → 2 = p²/q² → p² = 2q²
  → p 是偶数 → p = 2k
  → 4k² = 2q² → q² = 2k²
  → q 也是偶数
  → p/q 不是最简！矛盾 ✓

# ─── 3. 反例证明 (否定全称) ───
  否定 ∀x P(x):
  只需找一个 x₀ 使 P(x₀) 为假
  
  "所有素数都是奇数" — 反例: 2 是偶素数 ✓

# ─── 4. 数学归纳法 ───
  证明 ∀n≥n₀, P(n):
  (1) 基础: P(n₀) 为真
  (2) 归纳: P(k) → P(k+1)

  强归纳法: (∀j<k, P(j)) → P(k)

═══ 归结法 (Resolution) ═══

  SAT 求解器的核心算法!

  步骤:
  1. 将命题转为 CNF
  2. 否定结论，加入子句集
  3. 反复归结: {A∨B} + {¬A∨C} → {B∨C}
  4. 若推出空子句 □ → 原命题成立

  例: 证明 {p→q, q→r} ⊢ p→r
  CNF: {¬p∨q, ¬q∨r}
  否定结论: {p, ¬r}

  归结:
    ¬p∨q + p → q        (消去 p)
    q + ¬q∨r → r        (消去 q)
    r + ¬r → □          (矛盾!)
  ∴ p→r 成立 ✓`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 谓词逻辑</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> predicate_logic.txt</div>
                <pre className="fs-code">{`═══ 从命题到谓词 ═══

  命题逻辑的局限:
  "所有人都会死" → 无法表达 (没有"变量"概念)

  谓词逻辑引入:
  • 谓词: P(x) 表示 "x 具有性质 P"
  • 量词: ∀ (全称), ∃ (存在)
  • 域 (Domain): 变量的取值范围

  Human(x) = "x 是人"
  Mortal(x) = "x 会死"
  ∀x (Human(x) → Mortal(x))  — "所有人都会死"

═══ 量词 ═══

  ∀x P(x)  — 对所有 x，P(x) 为真
  ∃x P(x)  — 存在某个 x，P(x) 为真
  ∃!x P(x) — 恰好存在一个 x (唯一性)

  量词否定 (De Morgan 推广):
    ¬(∀x P(x)) ≡ ∃x ¬P(x)
    ¬(∃x P(x)) ≡ ∀x ¬P(x)

  嵌套量词:
    ∀x∀y P(x,y)  — 可交换 ✓
    ∃x∃y P(x,y)  — 可交换 ✓
    ∀x∃y P(x,y)  — 不可交换! ✗
    ∃y∀x P(x,y)  — 比上面更强!

  例: L(x,y) = "x 喜欢 y"
    ∀x∃y L(x,y)  "每个人都有喜欢的人"
    ∃y∀x L(x,y)  "有一个人被所有人喜欢" (更强!)

═══ 自由变量与约束变量 ═══

  ∀x (P(x) → Q(x, y))
        ↑          ↑
      约束变量    自由变量!

  • 约束变量 (Bound): 被量词绑定
  • 自由变量 (Free): 未被绑定
  • 闭公式 (Sentence): 无自由变量

═══ 前束范式 (Prenex Normal Form) ═══

  所有量词移到公式前面:
  
  ∀x P(x) → ∃y Q(y)
  ≡ ¬(∀x P(x)) ∨ ∃y Q(y)
  ≡ ∃x ¬P(x) ∨ ∃y Q(y)
  ≡ ∃x∃y (¬P(x) ∨ Q(y))   — 前束范式

═══ 在计算机科学中的应用 ═══

  1. 数据库查询 (SQL ≈ 关系演算):
     SELECT * FROM Users WHERE age > 18
     ≡ { u | u ∈ Users ∧ u.age > 18 }

  2. 类型系统:
     ∀T. List<T> → Int    (泛型函数)
     ∃T. { val: T, show: T → String }  (存在类型)

  3. 形式验证:
     Hoare 三元组: {P} S {Q}
     ∀state. P(state) → Q(exec(S, state))

  4. Prolog (逻辑编程):
     parent(tom, bob).          % 事实
     ancestor(X, Y) :-          % 规则
         parent(X, Y).
     ancestor(X, Y) :-
         parent(X, Z),
         ancestor(Z, Y).
     ?- ancestor(tom, bob).     % 查询 → true`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
