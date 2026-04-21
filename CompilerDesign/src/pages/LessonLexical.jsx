import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

/* ── Mini Lexer Engine (runs in-browser) ── */
const TOKEN_RULES = [
  { type: 'KEYWORD',  re: /^(fn|let|if|else|while|return|true|false|null)\b/ },
  { type: 'NUMBER',   re: /^(0[xX][0-9a-fA-F]+|0[bB][01]+|\d+\.?\d*([eE][+-]?\d+)?)/ },
  { type: 'STRING',   re: /^"([^"\\]|\\.)*"/ },
  { type: 'STRING',   re: /^'([^'\\]|\\.)*'/ },
  { type: 'IDENT',    re: /^[a-zA-Z_]\w*/ },
  { type: 'OP',       re: /^(==|!=|<=|>=|&&|\|\||->|=>|\+\+|--)/ },
  { type: 'OP',       re: /^[+\-*/%=<>!&|^~]/ },
  { type: 'PUNCT',    re: /^[(){}[\];,.:?]/ },
  { type: 'COMMENT',  re: /^\/\/[^\n]*/ },
  { type: 'COMMENT',  re: /^\/\*[\s\S]*?\*\// },
];

function tokenize(src) {
  const tokens = [];
  let pos = 0, line = 1, col = 1;
  while (pos < src.length) {
    // skip whitespace
    const wsMatch = src.slice(pos).match(/^(\s+)/);
    if (wsMatch) {
      for (const ch of wsMatch[1]) { if (ch === '\n') { line++; col = 1; } else col++; }
      pos += wsMatch[1].length;
      continue;
    }
    let matched = false;
    for (const rule of TOKEN_RULES) {
      const m = src.slice(pos).match(rule.re);
      if (m) {
        tokens.push({ type: rule.type, value: m[0], line, col });
        pos += m[0].length; col += m[0].length;
        matched = true; break;
      }
    }
    if (!matched) {
      tokens.push({ type: 'ERROR', value: src[pos], line, col });
      pos++; col++;
    }
  }
  tokens.push({ type: 'EOF', value: '', line, col });
  return tokens;
}

const chipClass = (t) => {
  if (t === 'KEYWORD') return 'keyword';
  if (t === 'IDENT')   return 'ident';
  if (t === 'NUMBER')  return 'number';
  if (t === 'STRING')  return 'string';
  if (t === 'OP')      return 'operator';
  return 'punct';
};

const DEMO_CODE = `fn fibonacci(n) {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  while (n > 1) {
    let temp = a + b;
    a = b;
    b = temp;
    n = n - 1;
  }
  return b;
}`;

const tabs = ['🔤 正则 & 正则语言', '🔄 NFA / DFA', '🛠️ Lexer 实现', '🎮 Lexer 沙箱'];

export default function LessonLexical() {
  const [active, setActive] = useState(0);
  const [code, setCode] = useState(DEMO_CODE);
  const [tokens, setTokens] = useState(() => tokenize(DEMO_CODE));

  const handleTokenize = useCallback(() => {
    setTokens(tokenize(code));
  }, [code]);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_01 — 词法分析</div>
      <div className="fs-hero">
        <h1>词法分析：正则表达式 / NFA / DFA / Lexer</h1>
        <p>
          词法分析是编译器的<strong>第一阶段</strong>——将源代码字符流转换为 Token 流。
          理论基础是正则语言与有穷自动机。从正则表达式 → NFA (Thompson 构造) → DFA (子集构造) → 最小化 DFA → Lexer 代码生成，
          这是自动机理论在工程中最经典的应用。
        </p>
      </div>

      {/* Compiler Pipeline */}
      <div className="pipeline">
        <div className="pipeline-stage active" style={{background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', color:'#c4b5fd'}}>
          <span>📝 Source</span><small>字符流</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.4)', color:'#93c5fd', boxShadow:'0 0 20px rgba(37,99,235,0.3)'}}>
          <span>🔤 Lexer</span><small>词法分析</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>🌳 Parser</span><small>语法分析</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>🔍 Semantic</span><small>语义检查</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>⚡ IR</span><small>中间表示</small>
        </div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}>
          <span>🎯 Codegen</span><small>代码生成</small>
        </div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 词法分析深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {/* ── Tab 0: 正则表达式 ── */}
        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 正则表达式与正则语言</h3>

              <div className="concept-card">
                <h4>🎯 核心概念：Chomsky 文法层级</h4>
                <p>语言的表达力从弱到强分为 4 层，词法分析处于最底层（Type 3）——正则语言：</p>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> chomsky_hierarchy.txt</div>
                <pre className="fs-code">{`Chomsky 文法层级 (4个层级):
  Type 0: 递归可枚举语言   (图灵机)        → 最强
  Type 1: 上下文相关语言   (线性界限自动机)
  Type 2: 上下文无关语言   (下推自动机 PDA) ← 语法分析用这层!
  Type 3: 正则语言        (有穷自动机 FA)  ← 词法分析用这层!

正则语言的 3 种等价描述 (它们识别的语言完全相同):
  1. 正则表达式 (Regular Expression)
  2. 有穷自动机 (Finite Automaton): NFA / DFA
  3. 正则文法 (Regular Grammar): A → aB | a`}</pre>
              </div>

              <div className="concept-card" style={{marginTop:'1rem'}}>
                <h4>✍️ 正则表达式的形式定义</h4>
                <p><strong>基本操作</strong>（三个就够了！）：</p>
                <ul>
                  <li><code>ε</code> — 空串</li>
                  <li><code>a</code> — 匹配单个字符</li>
                  <li><code>r₁ | r₂</code> — 选择 (alternation)</li>
                  <li><code>r₁ r₂</code> — 连接 (concatenation)</li>
                  <li><code>r*</code> — 闭包 (Kleene star, 0 次或多次)</li>
                </ul>
                <p><strong>扩展语法糖</strong>：<code>r+</code> = <code>r r*</code>，<code>r?</code> = <code>r | ε</code>，<code>[a-z]</code> = <code>a | b | ... | z</code></p>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> token_regex.txt</div>
                <pre className="fs-code">{`═══ 编程语言 Token 的正则表达式 ═══

标识符 (identifier):  [a-zA-Z_][a-zA-Z0-9_]*
整数 (十进制):        0 | [1-9][0-9]*
整数 (十六进制):      0[xX][0-9a-fA-F]+
浮点数:              [0-9]+\\.[0-9]*([eE][+-]?[0-9]+)?
字符串:              "(\\\\.| [^"\\\\])*"    ← 支持转义
单行注释:            //[^\\n]*
多行注释:            /\\*([^*]|\\*[^/])*\\*/
关键字:              先匹配标识符, 再查关键字表! (不用正则)

═══ 正则表达式的局限 (面试常考!) ═══
不能匹配:
  ✗ 嵌套括号 {}, ()  → 需要 CFG + 下推自动机
  ✗ 回文 abcba        → 需要下推自动机
  ✗ aⁿbⁿ (n个a后跟n个b) → 泵引理可证
原因: 有穷自动机的"有穷"状态无法记录无限嵌套深度`}</pre>
              </div>

              <div className="tip-box">
                💡 <strong>为什么词法分析用正则而不用 CFG？</strong> 因为正则语言的自动机可以保证 O(n) 线性时间扫描，
                而且词法规则天然是正则的（标识符、数字、字符串面量），不需要嵌套匹配能力。
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 1: NFA & DFA ── */}
        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 NFA 与 DFA</h3>

              <div className="concept-card">
                <h4>NFA vs DFA 一句话区分</h4>
                <p><strong>NFA</strong>: 一个状态遇到一个字符可以走<em>多条路</em>，还能白走 (ε-转移)  →  想象成"分身术"</p>
                <p><strong>DFA</strong>: 一个状态遇到一个字符只能走<em>一条路</em>，没有白走  →  确定、高效、适合跑代码</p>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> automata_formal.txt</div>
                <pre className="fs-code">{`═══ 有穷自动机形式定义 ════════════════════

NFA = (Q, Σ, δ, q₀, F)
  Q  — 有限状态集
  Σ  — 输入字母表
  δ  — 转移函数: Q × (Σ ∪ {ε}) → P(Q)  ← 可到多个状态!
  q₀ — 初始状态
  F  — 接受状态集

DFA = (Q, Σ, δ, q₀, F)
  δ  — 转移函数: Q × Σ → Q  ← 只到一个状态!

═══ Thompson 构造: 正则 → NFA ═════════════

递归构造, 每种正则操作对应一种 NFA 结构:

  字符 a:       →(s)—a→(f)

  r₁ | r₂:          ┌─ε→[NFA₁]─ε─┐
                →(s)─┤              ├→(f)
                     └─ε→[NFA₂]─ε─┘

  r₁ r₂:       →[NFA₁]─ε→[NFA₂]→

  r*:               ┌────ε────┐
                    ↓         │
              →(s)─ε→[NFA]─ε→(f)
                │              ↑
                └──────ε───────┘`}</pre>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> subset_construction.txt</div>
                <pre className="fs-code">{`═══ 子集构造 (Subset Construction): NFA → DFA ═══

核心思想: DFA 的每个状态 = NFA 状态的一个子集

算法:
  1. 初始 DFA 状态 T₀ = ε-closure({q₀})
  2. 工作表算法:
     while (有未标记的 DFA 状态 T):
       标记 T
       for 每个输入符号 a:
         U = ε-closure(move(T, a))
         if U 不在状态表中: 加入工作表
         添加转移 T —a→ U
  3. 含 NFA 接受状态的 DFA 状态 → DFA 接受状态

关键函数:
  ε-closure(S): 从 S 出发, 只走 ε 能到的所有状态
  move(S, a):   从 S 出发, 走一步 a 能到的所有状态

═══ DFA 最小化 (Hopcroft) ═══

  1. 初始: 划分为 {接受态} 和 {非接受态}
  2. 细分: 如果组内状态对某输入到达不同组 → 拆开
  3. 重复直到稳定

定理: 最小 DFA 唯一! → 可用来判断两个正则是否等价`}</pre>
              </div>

              <div className="fs-card" style={{marginTop:'1rem'}}>
                <h3>📊 NFA vs DFA 工程选择</h3>
                <table className="fs-table">
                  <thead><tr><th></th><th>NFA</th><th>DFA</th></tr></thead>
                  <tbody>
                    <tr><td>状态数</td><td>少 O(n)</td><td>最坏 O(2ⁿ)</td></tr>
                    <tr><td>匹配时间</td><td>O(n×m)</td><td><strong style={{color:'#4ade80'}}>O(m) 保证</strong></td></tr>
                    <tr><td>构建开销</td><td>简单（线性）</td><td>可能指数爆炸</td></tr>
                    <tr><td>空间</td><td>小</td><td>可能很大</td></tr>
                    <tr><td style={{color:'#c4b5fd'}}>适用场景</td><td>动态正则匹配</td><td><strong style={{color:'#4ade80'}}>Lexer 生成器</strong></td></tr>
                  </tbody>
                </table>
                <div className="tip-box" style={{marginTop:'0.75rem'}}>
                  💡 Lexer 在<strong>编译期</strong>构建 DFA 转移表，运行时只做表查询 → 保证 O(m) 扫描！
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Lexer 实现 ── */}
        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛠️ 手写 Lexer 实现</h3>

              <div className="concept-card">
                <h4>两种实现风格</h4>
                <p><strong>1. 表驱动 (Table-Driven)</strong>：DFA 转移表 → 查表前进 → Flex/Lex 生成器产出</p>
                <p><strong>2. 手写 (Hand-Written)</strong>：switch/if-else 链 → GCC、Clang、Rust、Go 全用这种！</p>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> lexer.py — 手写 Lexer 核心</div>
                <pre className="fs-code">{`from enum import Enum, auto
from dataclasses import dataclass

class TokenType(Enum):
    # 字面量
    INTEGER = auto()      # 42, 0xFF
    FLOAT   = auto()      # 3.14
    STRING  = auto()      # "hello"
    IDENT   = auto()      # foo, bar
    # 关键字
    IF = auto(); ELSE = auto(); WHILE = auto()
    RETURN = auto(); FN = auto(); LET = auto()
    # 运算符 & 分隔符
    PLUS = auto(); MINUS = auto(); STAR = auto()
    EQ = auto(); NEQ = auto(); ASSIGN = auto()
    LPAREN = auto(); RPAREN = auto()
    LBRACE = auto(); RBRACE = auto()
    SEMICOLON = auto(); EOF = auto()

KEYWORDS = {
    'if': TokenType.IF, 'else': TokenType.ELSE,
    'while': TokenType.WHILE, 'return': TokenType.RETURN,
    'fn': TokenType.FN, 'let': TokenType.LET,
}

@dataclass
class Token:
    type: TokenType
    value: str
    line: int
    column: int

class Lexer:
    def __init__(self, source: str):
        self.src = source
        self.pos = 0
        self.line = 1
        self.col = 1

    def peek(self) -> str:
        return self.src[self.pos] if self.pos < len(self.src) else '\\0'

    def advance(self) -> str:
        ch = self.src[self.pos]
        self.pos += 1
        if ch == '\\n': self.line += 1; self.col = 1
        else: self.col += 1
        return ch

    def next_token(self) -> Token:
        self.skip_whitespace()
        if self.pos >= len(self.src):
            return Token(TokenType.EOF, '', self.line, self.col)

        ch = self.peek()
        if ch.isdigit():         return self.read_number()
        if ch.isalpha() or ch == '_': return self.read_ident()
        if ch == '"':            return self.read_string()

        # 双字符运算符 → 最长匹配原则!
        two = self.src[self.pos:self.pos+2]
        if two == '==': self.advance(); self.advance()
            return Token(TokenType.EQ, '==', ...)
        if two == '!=': ...

        # 单字符
        self.advance()
        MAP = {'+': TokenType.PLUS, '-': TokenType.MINUS, ...}
        return Token(MAP.get(ch, TokenType.EOF), ch, ...)`}</pre>
              </div>

              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> lexer_tools.txt — Lexer 生成器 & 工业级实践</div>
                <pre className="fs-code">{`═══ Lexer 工具对比 ═══
Flex/Lex (C/C++)   — 经典, 正则→DFA→C 代码
ANTLR 4 (多语言)   — LL(*), 同时生成 Lexer+Parser
re2c (C/C++)       — 零开销, 运行时无库依赖

═══ 最长匹配 (Maximal Munch) ═══
Lexer 永远匹配最长 token:
  "iffy"  → IDENT("iffy"),  不是 IF + IDENT("fy")
  "=="    → EQ("=="),       不是 ASSIGN("=") × 2
  "3.14"  → FLOAT("3.14"),  不是 INT("3") + DOT + INT("14")

═══ 工业级编译器的 Lexer ═══
GCC:   手写 C (libcpp), 处理 #include/#define
Clang: 手写 C++, 与预处理器深度耦合
Rust:  手写 (rustc_lexer crate), 两阶段 token
Go:    手写 (go/scanner), 自动分号插入!
V8:    手写 C++ (scanner.cc), 惰性解析优化

═══ 性能优化 ═══
1. 表驱动 DFA (编译时生成转移表)
2. ASCII 快速路径 (跳过 Unicode 全表)
3. 双缓冲 (避免频繁 I/O)
4. SIMD 批量跳过空白`}</pre>
              </div>

              <div className="warning-box">
                ⚠️ <strong>结论</strong>：几乎所有生产级编译器都用<strong>手写 Lexer</strong>！
                因为手写可以做到更灵活的错误恢复、更好的错误消息、更高的性能控制。
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Interactive Lexer Sandbox ── */}
        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <div className="sandbox">
                <div className="sandbox-header">
                  <h4>🎮 交互式 Lexer — 实时 Token 分析</h4>
                  <button className="fs-btn primary" onClick={handleTokenize} style={{padding:'0.35rem 0.8rem', fontSize:'0.78rem'}}>
                    ▶ 运行 Tokenize
                  </button>
                </div>
                <div className="sandbox-body">
                  <textarea
                    rows={10}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    spellCheck={false}
                    placeholder="输入代码，点击运行查看 Token 流..."
                  />

                  {tokens.length > 0 && (
                    <>
                      <div style={{margin:'1rem 0 0.5rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <span style={{fontSize:'0.82rem', color:'#a78bfa', fontWeight:700}}>Token 流 ({tokens.filter(t=>t.type!=='EOF').length} tokens)</span>
                        <span style={{fontSize:'0.72rem', color:'#64748b'}}>点击任意 Token 查看详情</span>
                      </div>

                      <div className="token-list">
                        {tokens.filter(t => t.type !== 'EOF').map((t, i) => (
                          <span key={i} className={`token-chip ${chipClass(t.type)}`} title={`${t.type} @ ${t.line}:${t.col}`}>
                            <span style={{opacity:.5, fontSize:'0.6rem'}}>{t.type}</span>
                            {t.value}
                          </span>
                        ))}
                      </div>

                      <div className="sandbox-output" style={{marginTop:'1rem'}}>
                        <span style={{color:'#64748b'}}>{'// 结构化输出\n'}</span>
                        {tokens.filter(t => t.type !== 'EOF').map((t, i) =>
                          `Token(${t.type.padEnd(8)}, ${JSON.stringify(t.value).padEnd(12)}, ${t.line}:${t.col})\n`
                        ).join('')}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="tip-box" style={{marginTop:'1rem'}}>
                💡 <strong>试试输入</strong>：<code>let x = 3.14 + 0xFF;</code> 或 <code>if (a == "hello") {'{'} return true; {'}'}</code>
                观察不同 Token 类型的颜色分类。
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
