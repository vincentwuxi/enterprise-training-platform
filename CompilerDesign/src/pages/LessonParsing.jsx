import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['CFG 与推导', 'LL(1) 分析', 'LR 分析', 'Parser 实战'];

export default function LessonParsing() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_02 — 语法分析</div>
      <div className="fs-hero">
        <h1>语法分析：CFG / LL(1) / LR(1) / Parser 生成器</h1>
        <p>
          语法分析 (Parsing) 是编译器的<strong>第二阶段</strong>——将 Token 流按照
          上下文无关文法 (CFG) 的规则构建语法树。LL 分析器自顶向下预测，
          LR 分析器自底向上移进-归约。理解 FIRST/FOLLOW 集和分析表的构造
          是掌握编译器前端的核心。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 语法分析深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 上下文无关文法 (CFG)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> cfg_theory.txt</div>
                <pre className="fs-code">{`═══ CFG 形式定义 ═══

G = (V, Σ, P, S)
  V — 非终结符集 (变量集)
  Σ — 终结符集 (Token 集)
  P — 产生式规则集
  S — 开始符号, S ∈ V

═══ 算术表达式文法 ═══

  E → E + T | E - T | T
  T → T * F | T / F | F
  F → ( E ) | num | id

分析 "3 + 4 * 5":
  E → E + T → T + T → F + T → 3 + T
    → 3 + T * F → 3 + F * F → 3 + 4 * F → 3 + 4 * 5

═══ 推导 (Derivation) ═══

最左推导 (Leftmost): 每步替换最左边的非终结符
  E ⇒ E + T ⇒ T + T ⇒ F + T ⇒ 3 + T ⇒ ...

最右推导 (Rightmost): 每步替换最右边的非终结符
  E ⇒ E + T ⇒ E + T * F ⇒ E + T * 5 ⇒ ...

═══ 二义性 (Ambiguity) ═══

二义文法: 同一个串有两棵不同的语法树

  经典例子 — 悬挂 else:
  S → if E then S
    | if E then S else S
    | other

  "if a then if b then s1 else s2"
  → else 和哪个 if 配对? 两种解析!

  解决方案:
  1. 重写文法消除二义性:
     S → matched | unmatched
     matched → if E then matched else matched | other
     unmatched → if E then S | if E then matched else unmatched
  
  2. 优先级/结合性声明 (Yacc/Bison):
     %left '+' '-'
     %left '*' '/'
     %right '='

═══ 消除左递归 ═══

直接左递归:
  A → Aα | β
  改写为:
  A → βA'
  A' → αA' | ε

示例:
  E → E + T | T
  改写为:
  E → T E'
  E' → + T E' | ε

间接左递归 (A → B..., B → A...):
  按非终结符排序, 逐步消除

═══ 提取左公因子 ═══

  A → αβ₁ | αβ₂
  改写为:
  A → αA'
  A' → β₁ | β₂

示例:
  S → if E then S else S | if E then S
  改写为:
  S → if E then S S'
  S' → else S | ε`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⬇️ LL(1) 自顶向下分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> ll1_parser.txt</div>
                <pre className="fs-code">{`═══ LL(1) = Left-to-right, Leftmost derivation, 1 lookahead ═══

═══ FIRST 集计算 ═══

FIRST(α) = α 能推导出的所有串的首终结符集

规则:
  1. FIRST(a) = {a}  (a 是终结符)
  2. 如果 A → ε, 则 ε ∈ FIRST(A)
  3. 如果 A → Y₁Y₂...Yₖ:
     - FIRST(Y₁) - {ε} 加入 FIRST(A)
     - 如果 ε ∈ FIRST(Y₁), 则 FIRST(Y₂) - {ε} 加入
     - 如果 ε ∈ FIRST(Y₁)...FIRST(Yᵢ), 则 FIRST(Yᵢ₊₁) 加入
     - 如果所有 Yᵢ 都可推出 ε, 则 ε ∈ FIRST(A)

═══ FOLLOW 集计算 ═══

FOLLOW(A) = 所有句型中, 紧跟 A 后面的终结符集

规则:
  1. $ ∈ FOLLOW(S)  (S 是开始符号)
  2. 如果 A → αBβ:
     - FIRST(β) - {ε} 加入 FOLLOW(B)
  3. 如果 A → αB, 或 A → αBβ 且 ε ∈ FIRST(β):
     - FOLLOW(A) 加入 FOLLOW(B)

═══ 构造 LL(1) 预测分析表 ═══

对每条产生式 A → α:
  1. 对每个 a ∈ FIRST(α), 将 A → α 放入 M[A, a]
  2. 如果 ε ∈ FIRST(α):
     对每个 b ∈ FOLLOW(A), 将 A → α 放入 M[A, b]

如果某个 M[A, a] 有多条规则 → 不是 LL(1) 文法!

═══ 示例: 算术表达式 ═══

文法 (已消除左递归):
  E  → T E'
  E' → + T E' | ε
  T  → F T'
  T' → * F T' | ε
  F  → ( E ) | id

FIRST 集:
  FIRST(E) = FIRST(T) = FIRST(F) = {(, id}
  FIRST(E') = {+, ε}
  FIRST(T') = {*, ε}

FOLLOW 集:
  FOLLOW(E) = FOLLOW(E') = {), $}
  FOLLOW(T) = FOLLOW(T') = {+, ), $}
  FOLLOW(F) = {*, +, ), $}

预测分析表 M:
       │  id    │  +     │  *     │  (     │  )     │  $
  ─────┼────────┼────────┼────────┼────────┼────────┼──────
  E    │ TE'   │        │        │ TE'   │        │
  E'   │        │ +TE'  │        │        │  ε     │  ε
  T    │ FT'   │        │        │ FT'   │        │
  T'   │        │  ε     │ *FT'  │        │  ε     │  ε
  F    │  id    │        │        │ (E)   │        │

═══ 递归下降 Parser (最常用!) ═══
每个非终结符 → 一个函数
每个产生式右部 → 一个分支

def parse_E():
    parse_T()
    parse_E_prime()

def parse_E_prime():
    if lookahead == '+':
        match('+')
        parse_T()
        parse_E_prime()
    # else: ε production, do nothing`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⬆️ LR 自底向上分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> lr_parser.txt</div>
                <pre className="fs-code">{`═══ LR = Left-to-right, Rightmost derivation (in reverse) ═══

LR 分析器的核心操作:
  移进 (Shift):  读入下一个 Token, 压入栈
  归约 (Reduce): 弹出栈顶的 β, 按 A → β 替换为 A
  接受 (Accept): 归约到开始符号, 输入已耗尽
  报错 (Error):  无法继续

═══ LR 分析器家族 ═══

  LR(0):  不看前看符号, 最简单但最弱
  SLR(1): 用 FOLLOW 集解决冲突, 中等力
  LALR(1): 合并 LR(1) 同核状态, 实用 (Yacc/Bison)
  CLR(1): 最强, 但状态数最多

  能力: LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ CLR(1)

═══ LR(0) 项集 (Item Set) ═══

LR(0) 项: 产生式中加一个点 "·"
  表示"已经看到点左边的部分"

  E → · E + T    (还没看到任何东西)
  E → E · + T    (已经看到 E)
  E → E + · T    (已经看到 E+)
  E → E + T ·    (已经看到 E+T, 可以归约!)

═══ 构造 LR(0) 自动机 ═══

1. 增广文法: 加入 S' → S
2. 初始项集 I₀: closure({S' → ·S})
3. GOTO(I, X): 从 I 中, 经过符号 X 能到达的项集的闭包

closure(I):
  对 I 中每个项 A → α·Bβ (点后面是非终结符 B):
    将 B 的所有产生式 B → ·γ 加入 I
  重复直到不变

═══ SLR(1) 分析表构造 ═══

对每个状态 I:
  1. 如果 A → α·aβ ∈ I (a 是终结符):
     ACTION[I, a] = shift GOTO(I, a)
  2. 如果 A → α· ∈ I (归约项):
     对所有 a ∈ FOLLOW(A): ACTION[I, a] = reduce A → α
  3. 如果 S' → S· ∈ I:
     ACTION[I, $] = accept

冲突类型:
  移进-归约冲突 (shift-reduce): 看到 a, 不知道移进还是归约
  归约-归约冲突 (reduce-reduce): 不知道用哪条规则归约
  → 出现冲突 = 不是 SLR(1)!

═══ LALR(1) — 实用标准 ═══

LR(1) 项: 比 LR(0) 项多一个前看符号
  [A → α·β, a]   a 是前看符号

LALR(1): 合并 LR(1) 中核相同的状态
  → 状态数 = LR(0)
  → 能力 > SLR(1), 接近 LR(1)
  → Yacc/Bison/LEMON 都用 LALR(1)

═══ 冲突解决 ═══
1. 优先级声明: %left '+' '-'
2. 结合性声明: %right '='
3. 重写文法
4. GLR parser: 同时尝试所有可能 (Tree-sitter)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 Parser 实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> parser_impl.py</div>
                <pre className="fs-code">{`# ═══ Pratt Parser (运算符优先级分析) ═══
# 递归下降的优雅变种, 处理运算符优先级和结合性

class PrattParser:
    """
    Pratt Parser — 处理中缀/前缀/后缀表达式
    关键概念: binding power (绑定力)
    """
    
    # 优先级表 (绑定力)
    PRECEDENCE = {
        '=':  (1, 2),   # 右结合: left < right
        '||': (3, 4),
        '&&': (5, 6),
        '==': (7, 8), '!=': (7, 8),
        '<':  (9, 10), '>': (9, 10),
        '+':  (11, 12), '-': (11, 12),
        '*':  (13, 14), '/': (13, 14),
        # 左结合: (n, n+1)
        # 右结合: (n+1, n)
    }
    
    def parse_expr(self, min_bp=0):
        # 1. 解析前缀 (nud)
        token = self.advance()
        
        if token.type == 'INTEGER':
            lhs = IntLiteral(token.value)
        elif token.type == 'IDENT':
            lhs = Identifier(token.value)
        elif token.type == 'LPAREN':
            lhs = self.parse_expr(0)
            self.expect('RPAREN')
        elif token.value == '-':       # 前缀负号
            rhs = self.parse_expr(15)  # 高优先级
            lhs = UnaryOp('-', rhs)
        elif token.value == '!':       # 前缀取反
            rhs = self.parse_expr(15)
            lhs = UnaryOp('!', rhs)
        
        # 2. 解析中缀 (led)
        while True:
            op = self.peek()
            if op.type == 'EOF':
                break
            
            if op.value not in self.PRECEDENCE:
                break
            
            left_bp, right_bp = self.PRECEDENCE[op.value]
            
            if left_bp < min_bp:
                break  # 当前运算符优先级不够
            
            self.advance()  # 消费运算符
            rhs = self.parse_expr(right_bp)
            lhs = BinaryOp(op.value, lhs, rhs)
        
        return lhs

# 解析 "1 + 2 * 3":
# parse_expr(0)
#   lhs = 1
#   op = '+', bp = (11, 12), 11 >= 0 → 进入
#     rhs = parse_expr(12)
#       lhs = 2
#       op = '*', bp = (13, 14), 13 >= 12 → 进入
#         rhs = parse_expr(14)
#           lhs = 3
#           op = EOF → 返回 3
#         lhs = 2 * 3
#       op = EOF → 返回 2 * 3
#     rhs = 2 * 3
#   lhs = 1 + (2 * 3)  ← 正确!

# ═══ 实际编译器的 Parser 选择 ═══
# GCC: 手写递归下降 (C/C++)
# Clang: 同上
# Rust (rustc): 手写递归下降
# V8 (JS): 手写递归下降
# Python (CPython): PEG Parser (Python 3.9+)
# Go: 手写递归下降
#
# 结论: 生产级编译器几乎都用手写递归下降!
# → 错误恢复更灵活
# → 性能可控
# → 更好的错误消息

# ═══ Parser 生成器 ═══
# Yacc/Bison: LALR(1), C/C++
# ANTLR 4: LL(*), Java/Python/JS/Go
# Tree-sitter: GLR/PEG, 增量解析, 编辑器用
# PEG: Packrat Parser, 无二义性 (有序选择)
# Lalrpop: LALR(1), Rust
# pest: PEG, Rust`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
