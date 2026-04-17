import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['语言设计', '前端实现', '后端与运行时', '项目架构'];

export default function LessonCompilerProject() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_08 — 实战项目</div>
      <div className="fs-hero">
        <h1>实战项目：设计并实现一门小型语言</h1>
        <p>
          将前七个模块的知识融合，从零构建一门完整的编程语言——
          <strong>MiniLang</strong>：一门静态类型、支持函数和基本控制流的教学语言。
          覆盖从语言规范设计到 Lexer → Parser → 类型检查 → IR 生成 → 解释执行
          的完整编译器前端流水线，以及可选的 LLVM 后端集成。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 编译器实战</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 MiniLang 语言设计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> minilang_spec.mini</div>
                <pre className="fs-code">{`// ═══ MiniLang 语法规范 ═══
// 静态类型 | 函数定义 | 控制流 | 基本 I/O

// ─── 变量声明 ───
let x: int = 42;
let name: string = "MiniLang";
let pi: float = 3.14159;
let flag: bool = true;

// 类型推断 (可选)
let y = 100;            // 推断为 int
let msg = "hello";      // 推断为 string

// ─── 函数定义 ───
fn add(a: int, b: int) -> int {
    return a + b;
}

fn greet(name: string) -> string {
    return "Hello, " + name + "!";
}

// 递归
fn factorial(n: int) -> int {
    if n <= 1 {
        return 1;
    }
    return n * factorial(n - 1);
}

// ─── 控制流 ───
fn classify(score: int) -> string {
    if score >= 90 {
        return "A";
    } else if score >= 80 {
        return "B";
    } else if score >= 60 {
        return "C";
    } else {
        return "F";
    }
}

// while 循环
fn sum_to(n: int) -> int {
    let total = 0;
    let i = 1;
    while i <= n {
        total = total + i;
        i = i + 1;
    }
    return total;
}

// ─── 程序入口 ───
fn main() {
    let result = factorial(10);
    print(result);            // 内置函数
    print(greet("World"));
    print(sum_to(100));
}

// ═══ 形式文法 (EBNF) ═══
//
// program     → declaration* EOF
// declaration → fn_decl | let_stmt
// fn_decl     → "fn" IDENT "(" params? ")" ("->" type)? block
// params      → param ("," param)*
// param       → IDENT ":" type
// type        → "int" | "float" | "string" | "bool" | "void"
//
// block       → "{" statement* "}"
// statement   → let_stmt | assign_stmt | if_stmt
//             | while_stmt | return_stmt | expr_stmt
// let_stmt    → "let" IDENT (":" type)? "=" expr ";"
// assign_stmt → IDENT "=" expr ";"
// if_stmt     → "if" expr block ("else" (if_stmt | block))?
// while_stmt  → "while" expr block
// return_stmt → "return" expr? ";"
// expr_stmt   → expr ";"
//
// expr        → logic_or
// logic_or    → logic_and ("||" logic_and)*
// logic_and   → equality ("&&" equality)*
// equality    → comparison (("==" | "!=") comparison)*
// comparison  → term (("<" | ">" | "<=" | ">=") term)*
// term        → factor (("+" | "-") factor)*
// factor      → unary (("*" | "/" | "%") unary)*
// unary       → ("-" | "!") unary | call
// call        → primary ("(" arguments? ")")*
// arguments   → expr ("," expr)*
// primary     → INTEGER | FLOAT | STRING | "true" | "false"
//             | IDENT | "(" expr ")"

// ═══ 设计决策 ═══
// 1. 静态类型: 编译时发现错误
// 2. 显式返回: 语句式, 非表达式式
// 3. 块作用域: {} 创建新作用域
// 4. 无指针: 安全, 降低复杂度
// 5. 无类/OOP: 聚焦编译器核心 (可扩展)
// 6. 自动分号: 无 (需要显式写分号)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔨 前端实现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> frontend.py</div>
                <pre className="fs-code">{`# ═══ 编译器前端: Lexer → Parser → Checker ═══

# ─── 步骤 1: Lexer ───
class Lexer:
    """Token 流生成器 (手写 DFA)"""
    
    KEYWORDS = {
        'fn', 'let', 'if', 'else', 'while',
        'return', 'true', 'false',
        'int', 'float', 'string', 'bool', 'void',
    }
    
    def tokenize(self, source: str) -> list[Token]:
        tokens = []
        pos = 0
        while pos < len(source):
            # 跳过空白和注释
            if source[pos] in ' \\t\\n\\r':
                pos += 1; continue
            if source[pos:pos+2] == '//':
                while pos < len(source) and source[pos] != '\\n':
                    pos += 1
                continue
            
            # 数字
            if source[pos].isdigit():
                end = pos
                is_float = False
                while end < len(source) and source[end].isdigit():
                    end += 1
                if end < len(source) and source[end] == '.':
                    is_float = True; end += 1
                    while end < len(source) and source[end].isdigit():
                        end += 1
                tokens.append(Token(
                    'FLOAT' if is_float else 'INT',
                    source[pos:end]))
                pos = end; continue
            
            # 标识符 / 关键字
            if source[pos].isalpha() or source[pos] == '_':
                end = pos
                while end < len(source) and (source[end].isalnum() or source[end] == '_'):
                    end += 1
                word = source[pos:end]
                kind = word.upper() if word in self.KEYWORDS else 'IDENT'
                tokens.append(Token(kind, word))
                pos = end; continue
            
            # 字符串
            if source[pos] == '"':
                end = pos + 1
                while end < len(source) and source[end] != '"':
                    if source[end] == '\\\\': end += 1  # 转义
                    end += 1
                tokens.append(Token('STRING', source[pos+1:end]))
                pos = end + 1; continue
            
            # 双字符运算符 (最长匹配)
            two = source[pos:pos+2]
            if two in ('==','!=','<=','>=','->','&&','||'):
                tokens.append(Token(two, two))
                pos += 2; continue
            
            # 单字符
            tokens.append(Token(source[pos], source[pos]))
            pos += 1
        
        tokens.append(Token('EOF', ''))
        return tokens

# ─── 步骤 2: Parser (递归下降) ───
class Parser:
    """递归下降 + Pratt 表达式解析"""
    
    def parse_program(self) -> Program:
        decls = []
        while not self.at_end():
            if self.check('FN'):
                decls.append(self.parse_fn_decl())
            elif self.check('LET'):
                decls.append(self.parse_let_stmt())
            else:
                self.error("expected 'fn' or 'let'")
        return Program(decls)
    
    def parse_fn_decl(self) -> FnDecl:
        self.expect('FN')
        name = self.expect('IDENT').value
        self.expect('(')
        params = self.parse_params()
        self.expect(')')
        ret_type = None
        if self.match('->'):
            ret_type = self.parse_type()
        body = self.parse_block()
        return FnDecl(name, params, ret_type, body)
    
    def parse_expr(self, min_bp=0):
        """Pratt Parser 处理运算符优先级"""
        lhs = self.parse_primary()
        
        while True:
            op = self.peek()
            if op.kind not in self.PRECEDENCE:
                break
            left_bp, right_bp = self.PRECEDENCE[op.kind]
            if left_bp < min_bp:
                break
            self.advance()
            rhs = self.parse_expr(right_bp)
            lhs = BinaryOp(op.value, lhs, rhs)
        
        return lhs

# ─── 步骤 3: 类型检查 ───
class TypeChecker(ASTVisitor):
    def visit_BinaryOp(self, node):
        lt = self.check(node.left)
        rt = self.check(node.right)
        if node.op in ('+','-','*','/','%'):
            if lt == 'int' and rt == 'int': return 'int'
            if lt in ('int','float') and rt in ('int','float'): return 'float'
            if node.op == '+' and lt == 'string' and rt == 'string': return 'string'
            self.error(f"cannot {node.op} {lt} and {rt}")
        if node.op in ('==','!=','<','>','<=','>='):
            return 'bool'
        if node.op in ('&&','||'):
            if lt != 'bool' or rt != 'bool':
                self.error("logical ops require bool")
            return 'bool'`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 后端与运行时</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> backend.py</div>
                <pre className="fs-code">{`# ═══ 方案 A: 树遍历解释器 (最简单) ═══

class TreeInterpreter(ASTVisitor):
    """直接遍历 AST 执行"""
    
    def __init__(self):
        self.env = Environment()  # 变量环境
        # 注册内置函数
        self.env.define('print', BuiltinFunction(self._print))
    
    def visit_Program(self, node):
        # 先注册所有函数
        for decl in node.decls:
            if isinstance(decl, FnDecl):
                self.env.define(decl.name, UserFunction(decl, self.env))
        # 调用 main
        main = self.env.lookup('main')
        return self.call_function(main, [])
    
    def visit_BinaryOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        ops = {
            '+': lambda a, b: a + b,
            '-': lambda a, b: a - b,
            '*': lambda a, b: a * b,
            '/': lambda a, b: a // b if isinstance(a, int) else a / b,
            '%': lambda a, b: a % b,
            '==': lambda a, b: a == b,
            '!=': lambda a, b: a != b,
            '<': lambda a, b: a < b,
            '>': lambda a, b: a > b,
            '&&': lambda a, b: a and b,
            '||': lambda a, b: a or b,
        }
        return ops[node.op](left, right)
    
    def visit_IfStmt(self, node):
        if self.visit(node.condition):
            return self.visit(node.then_branch)
        elif node.else_branch:
            return self.visit(node.else_branch)
    
    def visit_WhileStmt(self, node):
        while self.visit(node.condition):
            result = self.visit(node.body)
            if isinstance(result, ReturnValue):
                return result
    
    def call_function(self, fn, args):
        if isinstance(fn, BuiltinFunction):
            return fn.call(args)
        # 创建新的作用域
        local_env = Environment(parent=fn.closure)
        for param, arg in zip(fn.decl.params, args):
            local_env.define(param.name, arg)
        # 执行函数体
        old_env = self.env
        self.env = local_env
        try:
            result = self.visit(fn.decl.body)
        except ReturnException as e:
            result = e.value
        self.env = old_env
        return result

# ═══ 方案 B: 字节码编译器 + VM ═══

class BytecodeCompiler(ASTVisitor):
    """AST → 栈式字节码"""
    
    OPCODES = {
        'LOAD_CONST': 0x01,  'LOAD_VAR': 0x02,
        'STORE_VAR': 0x03,   'ADD': 0x10,
        'SUB': 0x11,         'MUL': 0x12,
        'DIV': 0x13,         'CMP_LT': 0x20,
        'CMP_EQ': 0x21,      'JUMP': 0x30,
        'JUMP_IF_FALSE': 0x31,'CALL': 0x40,
        'RETURN': 0x41,       'PRINT': 0x50,
    }
    
    def visit_BinaryOp(self, node):
        self.visit(node.left)
        self.visit(node.right)
        op_map = {'+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV'}
        self.emit(op_map[node.op])

class StackVM:
    """栈式虚拟机"""
    def run(self, bytecode):
        ip = 0; stack = []; frames = []
        while ip < len(bytecode):
            op = bytecode[ip]
            if op == LOAD_CONST:
                stack.append(bytecode[ip+1]); ip += 2
            elif op == ADD:
                b, a = stack.pop(), stack.pop()
                stack.append(a + b); ip += 1
            elif op == JUMP_IF_FALSE:
                if not stack.pop():
                    ip = bytecode[ip+1]
                else:
                    ip += 2
            # ...

# ═══ 方案 C: LLVM 后端 (高级) ═══
# from llvmlite import ir, binding
# → 直接生成 LLVM IR, 编译为原生代码
# → 性能最优, 复杂度最高`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 项目架构与路线图</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> project_guide.txt</div>
                <pre className="fs-code">{`═══ 项目目录结构 ═══

minilang/
├── src/
│   ├── lexer.py          # 词法分析器
│   ├── tokens.py         # Token 类型定义
│   ├── ast_nodes.py      # AST 节点定义
│   ├── parser.py         # 语法分析器 (递归下降)
│   ├── type_checker.py   # 类型检查 + 作用域解析
│   ├── ir_generator.py   # AST → 字节码/TAC
│   ├── interpreter.py    # 树遍历解释器
│   ├── vm.py             # 栈式虚拟机 (可选)
│   ├── errors.py         # 错误处理与报告
│   └── main.py           # CLI 入口
├── tests/
│   ├── test_lexer.py     # Lexer 单元测试
│   ├── test_parser.py    # Parser 单元测试
│   ├── test_checker.py   # 类型检查测试
│   ├── test_interp.py    # 解释器端到端测试
│   └── examples/         # 示例程序
│       ├── hello.mini
│       ├── fibonacci.mini
│       ├── factorial.mini
│       └── sorting.mini
├── docs/
│   ├── spec.md           # 语言规范
│   └── grammar.ebnf      # 形式文法
└── README.md

═══ 增量开发路线 ═══

Phase 1 — 计算器 (1-2 天):
  [x] Token 定义 + Lexer
  [x] 算术表达式 Parser (Pratt)
  [x] 表达式求值器
  → 能计算: 3 + 4 * (2 - 1)

Phase 2 — 变量与控制流 (2-3 天):
  [x] let 语句 + 变量引用
  [x] if/else 语句
  [x] while 循环
  [x] 环境/作用域
  → 能执行: let x = 5; if x > 3 { ... }

Phase 3 — 函数 (2-3 天):
  [x] 函数声明 + 调用
  [x] 参数传递 + 返回值
  [x] 递归支持
  [x] 内置函数 (print)
  → 能执行: fn fib(n) { ... }; fib(10)

Phase 4 — 类型系统 (2-3 天):
  [x] 类型标注语法
  [x] 类型检查器 (表达式/语句/函数)
  [x] 类型推断 (let x = 42 → int)
  [x] 错误报告 (带行号)
  → 编译时捕获类型错误

Phase 5 — 高级特性 (可选, 3-5 天):
  [ ] 字节码编译 + 栈式 VM
  [ ] 数组 / 字符串操作
  [ ] 闭包 / 高阶函数
  [ ] 结构体
  [ ] LLVM 后端 (llvmlite)
  [ ] REPL 交互环境

═══ 测试策略 ═══

  1. 快照测试 (Snapshot):
     输入 .mini 文件 → 期望输出 → 自动比对
     
  2. 错误测试:
     故意错误的程序 → 验证错误消息质量
     // error: type mismatch
     let x: int = "hello";
     //            ^^^^^^^ expected int, got string
     
  3. 端到端测试:
     factorial.mini → 运行 → 输出 3628800 → 通过!

═══ 推荐学习资源 ═══

  1. Crafting Interpreters (Robert Nystrom)
     → 最佳入门, 两种实现: 树遍历 + 字节码 VM
     → 免费在线: craftinginterpreters.com

  2. Writing an Interpreter in Go (Thorsten Ball)
     → Monkey 语言, Go 实现, 非常实战

  3. Modern Compiler Implementation in ML (Andrew Appel)
     → Tiger 语言, 学术经典, 覆盖完整后端

  4. Engineering a Compiler (Cooper & Torczon)
     → 工程导向教材, 覆盖优化和后端

  5. LLVM Tutorial: Building a Kaleidoscope Language
     → llvm.org 官方教程, 从零用 LLVM 构建语言`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
