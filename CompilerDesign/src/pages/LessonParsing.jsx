import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

/* ── Mini Expression Parser (Pratt / Precedence Climbing) ── */
function parseExpr(src) {
  const tokens = [];
  let p = 0;
  // simple tokenizer for math expressions
  while (p < src.length) {
    if (/\s/.test(src[p])) { p++; continue; }
    if (/\d/.test(src[p])) {
      let n = '';
      while (p < src.length && /[\d.]/.test(src[p])) n += src[p++];
      tokens.push({ type: 'NUM', value: n });
    } else if (/[a-zA-Z_]/.test(src[p])) {
      let id = '';
      while (p < src.length && /\w/.test(src[p])) id += src[p++];
      tokens.push({ type: 'ID', value: id });
    } else {
      tokens.push({ type: 'OP', value: src[p++] });
    }
  }
  tokens.push({ type: 'EOF', value: '' });

  let pos = 0;
  const peek = () => tokens[pos] || { type: 'EOF', value: '' };
  const advance = () => tokens[pos++];

  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };

  function expr(minBP = 0) {
    let tok = advance();
    let left;
    if (tok.type === 'NUM') left = { type: 'Num', value: tok.value };
    else if (tok.type === 'ID') left = { type: 'Var', name: tok.value };
    else if (tok.value === '(') { left = expr(0); advance(); /* skip ) */ }
    else if (tok.value === '-') { left = { type: 'Neg', child: expr(3) }; }
    else return { type: 'Error', value: tok.value };

    while (peek().type === 'OP' && PREC[peek().value] !== undefined) {
      const op = peek();
      const bp = PREC[op.value];
      if (bp <= minBP) break;
      advance();
      const right = expr(bp);
      left = { type: 'BinOp', op: op.value, left, right };
    }
    return left;
  }

  try { return expr(); } catch { return { type: 'Error', value: 'Parse error' }; }
}

function renderTree(node, prefix = '', isLast = true) {
  if (!node) return '';
  const connector = isLast ? '└─ ' : '├─ ';
  const extension = isLast ? '   ' : '│  ';
  let line = prefix + connector;

  if (node.type === 'BinOp') {
    line += `[${node.op}]\n`;
    line += renderTree(node.left, prefix + extension, false);
    line += renderTree(node.right, prefix + extension, true);
  } else if (node.type === 'Neg') {
    line += `[neg]\n`;
    line += renderTree(node.child, prefix + extension, true);
  } else if (node.type === 'Num') {
    line += node.value + '\n';
  } else if (node.type === 'Var') {
    line += node.name + '\n';
  } else {
    line += `Error: ${node.value}\n`;
  }
  return line;
}

const tabs = ['📐 CFG & 推导', '⬇️ LL(1) 分析', '⬆️ LR 分析', '🎮 AST 构建器'];

export default function LessonParsing() {
  const [active, setActive] = useState(0);
  const [exprInput, setExprInput] = useState('3 + 4 * (2 - 1)');
  const [ast, setAst] = useState(() => parseExpr('3 + 4 * (2 - 1)'));

  const handleParse = useCallback(() => {
    setAst(parseExpr(exprInput));
  }, [exprInput]);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_02 — 语法分析</div>
      <div className="fs-hero">
        <h1>语法分析：CFG / LL(1) / LR(1) / Parser 生成器</h1>
        <p>
          语法分析是编译器<strong>第二阶段</strong>——将 Token 流按上下文无关文法 (CFG) 的规则构建抽象语法树 (AST)。
          LL 自顶向下预测、LR 自底向上移进-归约，理解 FIRST/FOLLOW 集和分析表构造是掌握编译器前端的核心。
        </p>
      </div>

      {/* Pipeline */}
      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>📝 Source</span><small>字符流</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}>
          <span>🔤 Lexer</span><small>Token 流</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.4)', color:'#93c5fd', boxShadow:'0 0 20px rgba(37,99,235,0.3)'}}>
          <span>🌳 Parser</span><small>语法分析</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>🔍 Semantic</span>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>⚡ IR</span>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>🎯 Codegen</span>
        </div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 语法分析深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {/* Tab 0: CFG */}
        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 上下文无关文法 (CFG)</h3>

              <div className="concept-card">
                <h4>🎯 CFG 形式定义</h4>
                <p><strong>G = (V, Σ, P, S)</strong></p>
                <ul>
                  <li><code>V</code> — 非终结符集 (变量集)</li>
                  <li><code>Σ</code> — 终结符集 (Token 集)</li>
                  <li><code>P</code> — 产生式规则集</li>
                  <li><code>S</code> — 开始符号, S ∈ V</li>
                </ul>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> cfg_example.txt</div>
                <pre className="fs-code">{`═══ 算术表达式文法 (经典!) ═══

  E → E + T | E - T | T      ← 加减法 (左结合)
  T → T * F | T / F | F      ← 乘除法 (左结合, 高优先级)
  F → ( E ) | num | id       ← 原子

推导 "3 + 4 * 5":
  E ⇒ E + T                  ← 选择 E → E + T
    ⇒ T + T                  ← E → T
    ⇒ F + T                  ← T → F
    ⇒ 3 + T                  ← F → num
    ⇒ 3 + T * F              ← T → T * F
    ⇒ 3 + F * F              ← T → F
    ⇒ 3 + 4 * F              ← F → num
    ⇒ 3 + 4 * 5              ← F → num

  结果: * 比 + 先结合 → 优先级通过文法结构实现!

═══ 二义性 (Ambiguity) ═══

悬挂 else 问题:
  S → if E then S | if E then S else S | other
  "if a then if b then s1 else s2"
  → else 和哪个 if 配对? 两棵不同的语法树!

解决: 重写文法 / %left %right 声明 / PEG 有序选择

═══ 消除左递归 ═══
  E → E + T | T   (左递归!)
  改为:
  E  → T E'
  E' → + T E' | ε  (右递归, LL 可用)`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: LL(1) */}
        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⬇️ LL(1) 自顶向下分析</h3>

              <div className="concept-card">
                <h4>LL(1) = Left-to-right, Leftmost derivation, 1 lookahead</h4>
                <p>从<strong>开始符号</strong>出发，每次选择一条产生式展开最左非终结符，只看 1 个前看符号就能确定选哪条规则。</p>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> first_follow.txt</div>
                <pre className="fs-code">{`═══ FIRST 集 ═══
FIRST(α) = α 能推导出的所有串的首终结符集

规则:
  1. FIRST(终结符 a) = {a}
  2. A → ε  ⟹  ε ∈ FIRST(A)
  3. A → Y₁Y₂...Yₖ:
     • FIRST(Y₁) - {ε} 加入 FIRST(A)
     • 如果 ε ∈ FIRST(Y₁), 再看 Y₂ ...
     • 如果全部 Yᵢ 可推出 ε, 则 ε ∈ FIRST(A)

═══ FOLLOW 集 ═══
FOLLOW(A) = 句型中紧跟 A 后面的终结符集

规则:
  1. $ ∈ FOLLOW(S)         (S = 开始符号)
  2. A → αBβ: FIRST(β)-{ε} 加入 FOLLOW(B)
  3. A → αB 或 β ⇒* ε: FOLLOW(A) 加入 FOLLOW(B)

═══ 完整示例 ═══
文法: E→TE', E'→+TE'|ε, T→FT', T'→*FT'|ε, F→(E)|id

  FIRST(E) = FIRST(T) = FIRST(F) = {(, id}
  FIRST(E') = {+, ε}     FIRST(T') = {*, ε}
  FOLLOW(E) = FOLLOW(E') = {), $}
  FOLLOW(T) = FOLLOW(T') = {+, ), $}
  FOLLOW(F) = {*, +, ), $}

═══ LL(1) 预测分析表 ═══
        │  id   │  +    │  *    │  (    │  )    │  $
  ──────┼───────┼───────┼───────┼───────┼───────┼──────
  E     │ TE'  │       │       │ TE'  │       │
  E'    │       │ +TE' │       │       │  ε    │  ε
  T     │ FT'  │       │       │ FT'  │       │
  T'    │       │  ε    │ *FT' │       │  ε    │  ε
  F     │  id   │       │       │ (E)  │       │

如果某格有两条规则 → 不是 LL(1)!`}</pre>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> recursive_descent.py</div>
                <pre className="fs-code">{`# ═══ 递归下降 Parser (最实用!) ═══
# 每个非终结符 → 一个函数
# 每个产生式右部 → 一个分支

def parse_E():
    parse_T()
    parse_E_prime()

def parse_E_prime():
    if lookahead == '+':
        match('+')
        parse_T()
        parse_E_prime()
    # else: ε production, do nothing

def parse_F():
    if lookahead == '(':
        match('(')
        parse_E()
        match(')')
    elif lookahead == 'id':
        match('id')
    else:
        error("expected ( or id")`}</pre>
              </div>

              <div className="tip-box">
                💡 <strong>面试高频</strong>：递归下降 Parser 是 LL(1) 的代码实现形式。
                GCC、Clang、Rust、V8、Go 编译器全部使用手写递归下降！
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: LR */}
        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⬆️ LR 自底向上分析</h3>

              <div className="concept-card">
                <h4>LR = Left-to-right, Rightmost derivation (逆序)</h4>
                <p>从<strong>输入的 Token 流</strong>出发，通过「移进-归约」不断将栈顶的产生式右部替换为左部非终结符，最终归约到开始符号。</p>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> lr_analysis.txt</div>
                <pre className="fs-code">{`═══ LR 核心操作 ═══
  Shift:   读入 Token, 压栈
  Reduce:  弹出栈顶 β, 按 A → β 替换为 A
  Accept:  归约到开始符号 + 输入耗尽 → 成功!
  Error:   无法继续 → 语法错误

═══ LR 家族 ═══
  LR(0)  ⊂  SLR(1)  ⊂  LALR(1)  ⊂  CLR(1)
  │          │           │            │
  太弱      用FOLLOW     实用标准     最强但状态多
             解决冲突     Yacc/Bison   

═══ LR(0) 项与项集 ═══
LR(0) 项 = 产生式中插入一个点 "·"
  E → · E + T    (还没看到任何东西)
  E → E · + T    (已看到 E, 等待 +)
  E → E + · T    (已看到 E+, 等待 T)
  E → E + T ·    (可以归约!)

═══ SLR(1) 分析表构造 ═══
对每个状态 I:
  · 在点后面 (A → α · aβ): ACTION[I,a] = shift
  · 点在最后 (A → α ·):    ACTION[I,a] = reduce (∀a ∈ FOLLOW(A))
  · S' → S ·:              ACTION[I,$] = accept

冲突:
  移进-归约冲突: 不知道移进还是归约
  归约-归约冲突: 不知道用哪条规则
  → 出现冲突 = 不是 SLR(1)!

═══ LALR(1) — 工业标准 ═══
LR(1) 项: [A → α·β, a]  多一个前看符号
LALR(1): 合并核相同的 LR(1) 状态
  → 状态数 = LR(0), 能力 ≈ LR(1)
  → Yacc / Bison / LEMON 都用 LALR(1)`}</pre>
              </div>

              <div className="fs-card" style={{marginTop:'1rem'}}>
                <h3>🔧 Parser 选择指南</h3>
                <table className="fs-table">
                  <thead><tr><th>编译器</th><th>Parser 类型</th><th>特点</th></tr></thead>
                  <tbody>
                    <tr><td>GCC / Clang</td><td>手写递归下降</td><td>灵活错误恢复</td></tr>
                    <tr><td>Rust (rustc)</td><td>手写递归下降</td><td>优秀错误消息</td></tr>
                    <tr><td>CPython 3.9+</td><td>PEG Parser</td><td>Packrat 缓存</td></tr>
                    <tr><td>Tree-sitter</td><td>GLR</td><td>增量解析, 编辑器用</td></tr>
                    <tr><td>Yacc/Bison</td><td>LALR(1)</td><td>经典生成器</td></tr>
                    <tr><td>ANTLR 4</td><td>LL(*)</td><td>多语言目标</td></tr>
                  </tbody>
                </table>
                <div className="warning-box" style={{marginTop:'0.75rem'}}>
                  ⚠️ 生产级编译器几乎都用<strong>手写递归下降</strong>！原因：错误恢复更灵活、性能可控、错误消息更友好。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive AST Builder */}
        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <div className="sandbox">
                <div className="sandbox-header">
                  <h4>🎮 交互式 AST 构建器 — Pratt Parser</h4>
                  <button className="fs-btn primary" onClick={handleParse} style={{padding:'0.35rem 0.8rem', fontSize:'0.78rem'}}>
                    ▶ 解析
                  </button>
                </div>
                <div className="sandbox-body">
                  <input
                    type="text"
                    value={exprInput}
                    onChange={e => setExprInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleParse()}
                    placeholder="输入算术表达式, 如: 3 + 4 * (2 - 1)"
                    spellCheck={false}
                  />

                  {ast && (
                    <>
                      <div style={{margin:'1rem 0 0.5rem', fontSize:'0.82rem', color:'#a78bfa', fontWeight:700}}>
                        🌳 抽象语法树 (AST)
                      </div>
                      <div className="sandbox-output" style={{fontFamily:'JetBrains Mono, monospace'}}>
                        {renderTree(ast, '', true)}
                      </div>

                      <div style={{margin:'1rem 0 0.5rem', fontSize:'0.82rem', color:'#22d3ee', fontWeight:700}}>
                        📋 AST JSON
                      </div>
                      <div className="sandbox-output">
                        {JSON.stringify(ast, null, 2)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="tip-box" style={{marginTop:'1rem'}}>
                💡 <strong>试试这些表达式</strong>：
                <br/><code>1 + 2 * 3</code> → 观察 * 优先级高于 +
                <br/><code>(1 + 2) * 3</code> → 括号改变优先级
                <br/><code>a + b * c - d / e</code> → 多运算符混合
                <br/><code>-x + y</code> → 前缀一元运算符
              </div>

              <div className="concept-card" style={{marginTop:'1rem'}}>
                <h4>💡 Pratt Parser 核心原理</h4>
                <p>每个运算符有两个<strong>绑定力 (binding power)</strong>：左绑定力和右绑定力。</p>
                <ul>
                  <li><strong>左结合</strong> (<code>+</code>, <code>*</code>): left_bp {'<'} right_bp，如 (11, 12)</li>
                  <li><strong>右结合</strong> (<code>=</code>): left_bp {'>'} right_bp，如 (2, 1)</li>
                </ul>
                <p>递归时传入最小绑定力 min_bp，当遇到的运算符 left_bp {'<'} min_bp 时停止，自然实现优先级和结合性。</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
