import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['正则表达式', 'NFA 与 DFA', 'Lexer 实现', '工具与实践'];

export default function LessonLexical() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_01 — 词法分析</div>
      <div className="fs-hero">
        <h1>词法分析：正则表达式 / NFA / DFA / Lexer</h1>
        <p>
          词法分析 (Lexical Analysis) 是编译器的<strong>第一阶段</strong>——将源代码的字符流
          转换为 Token 流。理论基础是正则语言与有穷自动机 (FA)。
          从正则表达式到 NFA (Thompson 构造)，NFA 到 DFA (子集构造)，
          再到 DFA 最小化和 Lexer 代码生成，这是自动机理论的经典应用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 词法分析深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 正则表达式与正则语言</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> regex_theory.txt</div>
                <pre className="fs-code">{`═══ 正则语言 (Regular Language) ═══
Chomsky 文法层级 (4个层级):
  Type 0: 递归可枚举语言   (图灵机)
  Type 1: 上下文相关语言   (线性界限自动机)
  Type 2: 上下文无关语言   (下推自动机) ← 语法分析
  Type 3: 正则语言        (有穷自动机) ← 词法分析

正则语言的 3 种等价描述:
1. 正则表达式 (Regular Expression)
2. 有穷自动机 (Finite Automaton): NFA / DFA
3. 正则文法 (Regular Grammar): A → aB | a

═══ 正则表达式的形式定义 ═══

基本操作:
  ε       — 空串
  a       — 单个字符
  r₁ | r₂  — 选择 (alternation)
  r₁ r₂   — 连接 (concatenation)
  r*      — 闭包 (Kleene star, 0 次或多次)

扩展操作 (语法糖):
  r+      — 正闭包 (1 次或多次) = r r*
  r?      — 可选 (0 或 1 次) = r | ε
  [a-z]   — 字符类 = a | b | ... | z
  .       — 任意字符

═══ 编程语言 Token 的正则表达式 ═══

标识符 (identifier):
  [a-zA-Z_][a-zA-Z0-9_]*

整数字面量:
  0 | [1-9][0-9]*           — 十进制
  0[xX][0-9a-fA-F]+         — 十六进制
  0[bB][01]+                — 二进制
  0[0-7]+                   — 八进制

浮点数:
  [0-9]+\\.[0-9]*([eE][+-]?[0-9]+)?
  \\.[0-9]+([eE][+-]?[0-9]+)?

字符串:
  "(\\\\.|[^"\\\\])*"        — 双引号, 支持转义

单行注释:
  //[^\\n]*

多行注释:
  /\\*([^*]|\\*[^/])*\\*/

关键字: 不用正则, 用查表! (先匹配标识符, 再查关键字表)

═══ 正则表达式的局限 ═══
不能匹配:
  1. 嵌套括号: {}, (), []  → 需要 CFG
  2. 回文: abcba  → 需要下推自动机
  3. 数学关系: aⁿbⁿ (n个a后跟n个b)
原因: 有穷自动机的"有穷"状态无法记录无限信息

→ 所以语法分析需要更强大的 CFG + PDA!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 NFA 与 DFA</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> automata.txt</div>
                <pre className="fs-code">{`═══ NFA (非确定性有穷自动机) ═══

形式定义: (Q, Σ, δ, q₀, F)
  Q  — 有限状态集
  Σ  — 输入字母表
  δ  — 转移函数: Q × (Σ ∪ {ε}) → P(Q)  (可以到多个状态!)
  q₀ — 初始状态
  F  — 接受状态集

NFA 的特点:
  1. 一个状态可以有多条同字符的转移 (非确定性)
  2. 允许 ε-转移 (不消耗输入的转移)

═══ Thompson 构造: 正则表达式 → NFA ═══

基本构造 (递归):

  字符 a:        ε:
  →(s)—a→(f)     →(s)—ε→(f)

  r₁ | r₂ (选择):
        ┌─ε→[NFA₁]—ε─┐
  →(s)─┤              ├→(f)
        └─ε→[NFA₂]—ε─┘

  r₁ r₂ (连接):
  →[NFA₁]—ε→[NFA₂]→

  r* (闭包):
        ┌────ε────┐
        ↓         │
  →(s)─ε→[NFA]—ε→(f)
    │              ↑
    └──────ε───────┘

═══ 子集构造 (Subset Construction): NFA → DFA ═══

核心思想: DFA 的每个状态 = NFA 状态的子集

算法:
  1. 计算初始状态 T₀ = ε-closure({q₀})
  2. 对每个未标记的 DFA 状态 T:
     对每个输入符号 a:
       U = ε-closure(move(T, a))
       如果 U 不在 DFA 状态表中, 加入
       添加转移 T —a→ U
  3. 包含 NFA 接受状态的 DFA 状态 = DFA 接受状态

ε-closure(S): 从 S 出发, 只走 ε 转移能到达的所有状态
move(S, a):   从 S 出发, 走一步 a 转移能到达的所有状态

═══ DFA 最小化 (Hopcroft 算法) ═══

步骤:
  1. 初始划分: {接受状态} 和 {非接受状态}
  2. 对每个划分组:
     如果组内状态对某输入 a 到达不同组 → 细分
  3. 重复直到不能再细分

最小 DFA 定理:
  → 对任意正则语言, 最小 DFA 是唯一的!
  → 两个正则表达式等价 ⟺ 最小 DFA 同构

═══ NFA vs DFA 权衡 ═══
         │ NFA          │ DFA
  ───────┼──────────────┼──────────────
  状态数  │ 少 (O(n))    │ 最坏 O(2ⁿ)
  匹配时间│ O(n×m)       │ O(m) 保证!
  构建    │ 简单 (线性)  │ 可能指数爆炸
  空间    │ 小           │ 可能很大
  
  实践选择:
  → Lexer 生成器: DFA (编译时构建, 运行时 O(m))
  → 动态正则匹配: NFA (避免指数爆炸)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛠️ Lexer 实现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> lexer.py</div>
                <pre className="fs-code">{`# ═══ 手写 Lexer (表驱动 DFA) ═══

from enum import Enum, auto
from dataclasses import dataclass

class TokenType(Enum):
    # 字面量
    INTEGER = auto()
    FLOAT = auto()
    STRING = auto()
    IDENTIFIER = auto()
    # 关键字
    IF = auto()
    ELSE = auto()
    WHILE = auto()
    RETURN = auto()
    FN = auto()
    LET = auto()
    # 运算符
    PLUS = auto()      # +
    MINUS = auto()     # -
    STAR = auto()      # *
    SLASH = auto()     # /
    ASSIGN = auto()    # =
    EQ = auto()        # ==
    NEQ = auto()       # !=
    LT = auto()        # <
    GT = auto()        # >
    LTEQ = auto()      # <=
    GTEQ = auto()      # >=
    # 分隔符
    LPAREN = auto()    # (
    RPAREN = auto()    # )
    LBRACE = auto()    # {
    RBRACE = auto()    # }
    SEMICOLON = auto() # ;
    COMMA = auto()     # ,
    # 特殊
    EOF = auto()

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
        self.source = source
        self.pos = 0
        self.line = 1
        self.col = 1
    
    def peek(self) -> str:
        if self.pos >= len(self.source): return '\\0'
        return self.source[self.pos]
    
    def advance(self) -> str:
        ch = self.source[self.pos]
        self.pos += 1
        if ch == '\\n':
            self.line += 1; self.col = 1
        else:
            self.col += 1
        return ch
    
    def skip_whitespace(self):
        while self.pos < len(self.source) and self.peek() in ' \\t\\n\\r':
            self.advance()
    
    def read_number(self) -> Token:
        start_col = self.col
        num = ''
        is_float = False
        while self.peek().isdigit():
            num += self.advance()
        if self.peek() == '.' and self.source[self.pos+1:self.pos+2].isdigit():
            is_float = True
            num += self.advance()  # '.'
            while self.peek().isdigit():
                num += self.advance()
        return Token(
            TokenType.FLOAT if is_float else TokenType.INTEGER,
            num, self.line, start_col)
    
    def read_identifier(self) -> Token:
        start_col = self.col
        ident = ''
        while self.peek().isalnum() or self.peek() == '_':
            ident += self.advance()
        token_type = KEYWORDS.get(ident, TokenType.IDENTIFIER)
        return Token(token_type, ident, self.line, start_col)
    
    def next_token(self) -> Token:
        self.skip_whitespace()
        if self.pos >= len(self.source):
            return Token(TokenType.EOF, '', self.line, self.col)
        
        ch = self.peek()
        
        if ch.isdigit(): return self.read_number()
        if ch.isalpha() or ch == '_': return self.read_identifier()
        
        # 双字符运算符 (最长匹配!)
        two = self.source[self.pos:self.pos+2]
        if two == '==': self.advance(); self.advance()
                        return Token(TokenType.EQ, '==', ...)
        if two == '!=': ...
        
        # 单字符
        self.advance()
        return {
            '+': Token(TokenType.PLUS, '+', ...),
            '-': Token(TokenType.MINUS, '-', ...),
            # ...
        }.get(ch, Token(TokenType.EOF, ch, ...))`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 Lexer 工具与实践</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> lexer_tools.txt</div>
                <pre className="fs-code">{`═══ Lexer 生成器 ═══

Flex/Lex (C/C++):
  规则格式: 正则表达式 → 动作 (C 代码)

  %{
  #include "parser.tab.h"
  %}

  %%
  [0-9]+          { yylval.ival = atoi(yytext); return INTEGER; }
  [a-zA-Z_][a-zA-Z0-9_]*  { yylval.sval = strdup(yytext); return IDENT; }
  "+"             { return PLUS; }
  [ \\t\\n]+       { /* skip whitespace */ }
  "//".*          { /* skip comment */ }
  %%

ANTLR 4 (Java/Python/JS):
  lexer grammar SimpleLexer;
  
  INTEGER: [0-9]+;
  FLOAT: [0-9]+ '.' [0-9]*;
  IDENT: [a-zA-Z_] [a-zA-Z0-9_]*;
  STRING: '"' (~["\\\\] | '\\\\' .)* '"';
  WS: [ \\t\\n\\r]+ -> skip;
  COMMENT: '//' ~[\\n]* -> skip;

═══ 最长匹配 (Maximal Munch) 规则 ═══

Lexer 始终匹配最长的 token:
  输入 "iffy":
  → "if" 是关键字, 但 "iffy" 更长 → IDENTIFIER("iffy")
  
  输入 "==":
  → "=" 是 ASSIGN, 但 "==" 更长 → EQ("==")
  
  输入 "3.14":
  → "3" 是 INTEGER, 但 "3.14" 更长 → FLOAT("3.14")

规则冲突: 相同长度时, 规则出现顺序优先
  → 关键字规则放在标识符规则之前
  → 或: 先匹配标识符, 再查关键字表 (更常见)

═══ 错误恢复策略 ═══

1. Panic Mode (恐慌模式):
   遇到无法识别的字符 → 跳过该字符, 报错, 继续

2. 错误产生式:
   . { error("unexpected character: %c", yytext[0]); }

3. 位置追踪:
   每个 Token 记录 (line, column, offset)
   → 错误信息: "error at line 5, column 12"

═══ 实际编译器的 Lexer ═══

GCC Lexer:
  → 手写 C 代码 (libcpp)
  → 处理预处理器指令 (#include, #define)
  → 支持 UTF-8 标识符

Rust Lexer (rustc):
  → 手写 Rust 代码 (rustc_lexer crate)
  → 两阶段: 原始 token → 精细 token
  → 处理 raw string (r#"..."#)

Go Lexer:
  → go/scanner 包
  → 手写, 单遍扫描
  → 自动插入分号 (Go 的特色!)
    规则: 如果行末 token 是标识符/数字/)/}/++/--
          → 自动在行末插入分号

V8 (JavaScript):
  → 手写 C++ (scanner.cc)
  → 处理模板字面量 \`...\${...}\`
  → 延迟解析 (lazy parsing) 优化

═══ 性能优化 ═══
1. 表驱动 DFA (编译时生成转移表)
2. 避免 Unicode 全表: ASCII 快速路径
3. 缓冲区管理: 双缓冲区避免频繁 I/O
4. SIMD: 快速跳过空白字符 (批量比较)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
