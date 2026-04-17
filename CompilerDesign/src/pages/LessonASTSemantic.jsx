import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['AST 设计', '符号表', '类型检查', '语义规则'];

export default function LessonASTSemantic() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_03 — AST 与语义分析</div>
      <div className="fs-hero">
        <h1>AST 与语义分析：类型检查 / 符号表 / 作用域</h1>
        <p>
          语法分析产生的解析树 (Parse Tree) 包含大量冗余节点，需要转换为更精简的
          <strong>抽象语法树 (AST)</strong>。语义分析在 AST 上进行类型检查、作用域解析、
          名称绑定等工作——回答"这段代码含义是否合法"的问题。
          符号表是语义分析的核心数据结构。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 语义分析深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌲 抽象语法树 (AST)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> ast.py</div>
                <pre className="fs-code">{`# ═══ Parse Tree vs AST ═══
#
# Parse Tree (具体语法树):
# 保留所有文法符号, 包括括号、逗号等
#
#            E
#          / | \\
#         E  +  T
#         |     |
#         T     F
#         |     |
#         F     5
#         |
#         3
#
# AST (抽象语法树):
# 只保留语义信息, 去掉冗余
#
#         +
#        / \\
#       3   5

# ═══ AST 节点定义 ═══

from dataclasses import dataclass
from typing import Optional

# 类型节点
@dataclass
class TypeNode:
    """类型标注"""
    name: str                  # "int", "float", "string"
    generic_args: list = None  # Array<int> → name="Array", args=["int"]

# 表达式节点
@dataclass
class IntLiteral:
    value: int

@dataclass
class FloatLiteral:
    value: float

@dataclass  
class StringLiteral:
    value: str

@dataclass
class Identifier:
    name: str

@dataclass
class BinaryOp:
    op: str           # '+', '-', '*', '/', '==', '<', ...
    left: 'Expr'
    right: 'Expr'

@dataclass
class UnaryOp:
    op: str           # '-', '!'
    operand: 'Expr'

@dataclass
class CallExpr:
    callee: 'Expr'    # 被调用的函数
    args: list        # 参数列表

@dataclass
class IndexExpr:
    object: 'Expr'    # a[0] 中的 a
    index: 'Expr'     # a[0] 中的 0

@dataclass
class FieldAccess:
    object: 'Expr'    # point.x 中的 point
    field: str        # point.x 中的 x

@dataclass
class IfExpr:
    condition: 'Expr'
    then_branch: 'Expr'
    else_branch: Optional['Expr']

# 语句节点
@dataclass
class LetStmt:
    name: str
    type_ann: Optional[TypeNode]   # 可选类型标注
    init: Optional['Expr']         # 初始化表达式

@dataclass
class AssignStmt:
    target: 'Expr'
    value: 'Expr'

@dataclass
class ReturnStmt:
    value: Optional['Expr']

@dataclass
class WhileStmt:
    condition: 'Expr'
    body: 'Block'

# 声明节点
@dataclass
class FnDecl:
    name: str
    params: list       # [(name, type), ...]
    return_type: Optional[TypeNode]
    body: 'Block'

@dataclass
class Block:
    stmts: list        # 语句列表

@dataclass
class Program:
    decls: list        # 顶层声明列表

# ═══ Visitor 模式遍历 AST ═══
class ASTVisitor:
    def visit(self, node):
        method = f'visit_{type(node).__name__}'
        visitor = getattr(self, method, self.generic_visit)
        return visitor(node)

    def generic_visit(self, node):
        raise NotImplementedError(f"No visit for {type(node).__name__}")

class ASTPrinter(ASTVisitor):
    def visit_BinaryOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        return f"({left} {node.op} {right})"
    
    def visit_IntLiteral(self, node):
        return str(node.value)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📖 符号表与作用域</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> symbol_table.py</div>
                <pre className="fs-code">{`# ═══ 符号表 (Symbol Table) ═══
# 记录标识符的定义信息: 名称、类型、作用域、内存位置

from enum import Enum, auto

class SymbolKind(Enum):
    VARIABLE = auto()
    FUNCTION = auto()
    PARAMETER = auto()
    TYPE = auto()

@dataclass
class Symbol:
    name: str
    kind: SymbolKind
    type: TypeNode
    defined_at: (int, int)   # (line, column)
    is_mutable: bool = True

@dataclass
class FunctionSymbol(Symbol):
    params: list = None      # 参数类型列表
    return_type: TypeNode = None

# ═══ 作用域 (Scope) ═══

class Scope:
    """链式作用域: 每个作用域保持对父作用域的引用"""
    
    def __init__(self, parent=None, name=""):
        self.parent = parent
        self.name = name
        self.symbols: dict[str, Symbol] = {}
    
    def define(self, symbol: Symbol):
        """在当前作用域定义符号"""
        if symbol.name in self.symbols:
            raise SemanticError(
                f"'{symbol.name}' already defined in scope '{self.name}'")
        self.symbols[symbol.name] = symbol
    
    def lookup(self, name: str) -> Symbol:
        """从当前作用域向上查找"""
        if name in self.symbols:
            return self.symbols[name]
        if self.parent:
            return self.parent.lookup(name)  # 向上查找!
        raise SemanticError(f"undefined: '{name}'")
    
    def lookup_local(self, name: str) -> Symbol:
        """只在当前作用域查找"""
        return self.symbols.get(name)

# ═══ 作用域解析器 ═══

class ScopeResolver(ASTVisitor):
    def __init__(self):
        self.global_scope = Scope(name="global")
        self.current_scope = self.global_scope
    
    def enter_scope(self, name=""):
        new_scope = Scope(parent=self.current_scope, name=name)
        self.current_scope = new_scope
        return new_scope
    
    def exit_scope(self):
        self.current_scope = self.current_scope.parent
    
    def visit_FnDecl(self, node):
        # 在当前作用域注册函数
        fn_sym = FunctionSymbol(
            name=node.name, kind=SymbolKind.FUNCTION,
            type=node.return_type, defined_at=...)
        self.current_scope.define(fn_sym)
        
        # 进入函数作用域
        self.enter_scope(f"fn:{node.name}")
        
        # 注册参数
        for param_name, param_type in node.params:
            self.current_scope.define(Symbol(
                name=param_name, kind=SymbolKind.PARAMETER,
                type=param_type, ...))
        
        # 遍历函数体
        self.visit(node.body)
        self.exit_scope()
    
    def visit_LetStmt(self, node):
        if node.init:
            self.visit(node.init)  # 先解析右值!
        self.current_scope.define(Symbol(
            name=node.name, kind=SymbolKind.VARIABLE,
            type=node.type_ann, ...))
    
    def visit_Identifier(self, node):
        symbol = self.current_scope.lookup(node.name)
        node.resolved_symbol = symbol  # 名称绑定

# ═══ 作用域规则 ═══
# 1. 变量在定义后才可使用
# 2. 内层作用域可以遮蔽 (shadow) 外层同名变量
# 3. 函数声明提升 (hoisting) — 某些语言支持
# 4. 闭包: 函数捕获定义时的作用域环境`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔒 类型检查</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> type_checker.py</div>
                <pre className="fs-code">{`# ═══ 类型系统基础 ═══
#
# 静态类型 vs 动态类型:
#   静态: 编译时检查 (C, Java, Rust, Go, TypeScript)
#   动态: 运行时检查 (Python, JavaScript, Ruby)
#
# 强类型 vs 弱类型:
#   强: 不允许隐式转换 (Python, Rust)
#   弱: 允许隐式转换 (C, JavaScript)
#
# 类型推断 (Type Inference):
#   Hindley-Milner (ML, Haskell, Rust) — 双向类型推断
#   局部推断 (Go, Kotlin) — 从初始化值推断

class TypeChecker(ASTVisitor):
    """自底向上的类型检查"""
    
    def __init__(self, scope_resolver):
        self.scopes = scope_resolver
        self.current_fn_return_type = None
    
    # ═══ 表达式类型推断 ═══
    
    def visit_IntLiteral(self, node):
        node.type = TypeNode("int")
        return node.type
    
    def visit_FloatLiteral(self, node):
        node.type = TypeNode("float")
        return node.type
    
    def visit_StringLiteral(self, node):
        node.type = TypeNode("string")
        return node.type
    
    def visit_BinaryOp(self, node):
        left_type = self.visit(node.left)
        right_type = self.visit(node.right)
        
        # 算术运算
        if node.op in ('+', '-', '*', '/'):
            if left_type.name == "int" and right_type.name == "int":
                node.type = TypeNode("int")
            elif left_type.name in ("int","float") and \\
                 right_type.name in ("int","float"):
                node.type = TypeNode("float")  # 提升
            elif node.op == '+' and \\
                 left_type.name == "string" and right_type.name == "string":
                node.type = TypeNode("string")  # 字符串拼接
            else:
                raise TypeError(
                    f"cannot apply '{node.op}' to {left_type} and {right_type}")
        
        # 比较运算
        elif node.op in ('==', '!=', '<', '>', '<=', '>='):
            if not self.types_comparable(left_type, right_type):
                raise TypeError(...)
            node.type = TypeNode("bool")
        
        # 逻辑运算
        elif node.op in ('&&', '||'):
            if left_type.name != "bool" or right_type.name != "bool":
                raise TypeError("logical ops require bool")
            node.type = TypeNode("bool")
        
        return node.type
    
    def visit_CallExpr(self, node):
        fn_type = self.visit(node.callee)
        
        # 检查参数数量
        if len(node.args) != len(fn_type.params):
            raise TypeError(
                f"expected {len(fn_type.params)} args, got {len(node.args)}")
        
        # 检查参数类型
        for arg, param_type in zip(node.args, fn_type.params):
            arg_type = self.visit(arg)
            if not self.is_assignable(param_type, arg_type):
                raise TypeError(
                    f"argument type mismatch: expected {param_type}, got {arg_type}")
        
        node.type = fn_type.return_type
        return node.type
    
    # ═══ 语句类型检查 ═══
    
    def visit_LetStmt(self, node):
        if node.init:
            init_type = self.visit(node.init)
            if node.type_ann:
                if not self.is_assignable(node.type_ann, init_type):
                    raise TypeError("type mismatch in let")
            else:
                node.type_ann = init_type  # 类型推断!
    
    def visit_ReturnStmt(self, node):
        if node.value:
            ret_type = self.visit(node.value)
            if not self.is_assignable(self.current_fn_return_type, ret_type):
                raise TypeError("return type mismatch")

    # ═══ 子类型 (Subtyping) ═══
    def is_assignable(self, target, source):
        """target 位置能否接受 source 类型的值"""
        if target.name == source.name:
            return True
        # int → float 隐式提升
        if target.name == "float" and source.name == "int":
            return True
        return False`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 语义规则与属性文法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> semantic_rules.txt</div>
                <pre className="fs-code">{`═══ 属性文法 (Attribute Grammar) ═══

两类属性:
  综合属性 (Synthesized): 自底向上计算
    → 子节点的信息向上传递 (如: 类型推断)
  继承属性 (Inherited): 自顶向下传播
    → 父节点的信息向下传递 (如: 期望类型)

S-属性定义: 只有综合属性 (用后序遍历计算)
L-属性定义: 继承属性只依赖左兄弟和父节点

═══ 语义动作示例 ═══

E → E₁ + T   { E.val = E₁.val + T.val }
E → T        { E.val = T.val }
T → T₁ * F   { T.val = T₁.val * F.val }
T → F        { T.val = T.val }
F → ( E )    { F.val = E.val }
F → num      { F.val = num.val }

═══ 语义分析的常见检查 ═══

1. 类型检查 (Type Checking):
   → 运算符操作数类型是否兼容
   → 函数调用参数类型是否匹配
   → 赋值两边类型是否兼容

2. 作用域检查:
   → 变量是否已声明
   → 变量是否重复声明
   → 使用前是否已初始化

3. 流分析:
   → 函数是否有返回值 (所有路径)
   → 是否有不可达代码
   → break/continue 是否在循环内

4. 其他:
   → 数组下标是否为整数
   → switch/match 是否穷举
   → 常量是否被修改

═══ 实际编译器的语义分析 ═══

Rust (rustc):
  → 借用检查 (Borrow Checker): 确保内存安全
  → 生命周期推断 (Lifetime Inference)
  → Trait 求解 (Trait Solving)
  → 模式穷举检查

TypeScript (tsc):
  → 结构化类型系统 (Structural Typing)
  → 可辨识联合 (Discriminated Union)
  → 类型窄化 (Type Narrowing)
  → 条件类型 (Conditional Types)

Go:
  → 接口满足检查 (implicit)
  → 未使用变量/导入检查 (编译错误!)
  → 类型断言检查

═══ 中间表示准备 ═══
语义分析完成后, AST 被标注了:
  → 每个表达式的类型 (type annotation)
  → 每个标识符的符号绑定 (name resolution)
  → 隐式类型转换的位置 (coercion insertion)
  → 运算符重载的实际函数 (operator resolution)

带类型标注的 AST → 准备进入 IR 生成阶段!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
