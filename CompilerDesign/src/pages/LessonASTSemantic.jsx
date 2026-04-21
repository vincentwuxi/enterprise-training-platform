import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

/* ── Mini AST Visualizer ── */
function buildAST(src) {
  const tokens = [];
  let p = 0;
  while (p < src.length) {
    if (/\s/.test(src[p])) { p++; continue; }
    if (/\d/.test(src[p])) { let n=''; while(p<src.length && /[\d.]/.test(src[p])) n+=src[p++]; tokens.push({t:'NUM',v:n}); }
    else if (/[a-zA-Z_]/.test(src[p])) { let id=''; while(p<src.length && /\w/.test(src[p])) id+=src[p++]; tokens.push({t:'ID',v:id}); }
    else tokens.push({t:'OP',v:src[p++]});
  }
  tokens.push({t:'EOF',v:''});
  let i=0;
  const pk=()=>tokens[i]||{t:'EOF',v:''}, adv=()=>tokens[i++];
  const P={'+':1,'-':1,'*':2,'/':2};
  function ex(mbp=0){
    let tok=adv(),l;
    if(tok.t==='NUM')l={t:'NumLit',v:tok.v};
    else if(tok.t==='ID')l={t:'Ident',v:tok.v};
    else if(tok.v==='('){l=ex(0);adv();}
    else if(tok.v==='-') l={t:'UnaryMinus',c:[ex(3)]};
    else return{t:'Err',v:tok.v};
    while(pk().t==='OP'&&P[pk().v]!==undefined){
      const op=pk(), bp=P[op.v]; if(bp<=mbp)break; adv();
      l={t:'BinOp',v:op.v,c:[l,ex(bp)]};
    }
    return l;
  }
  try{return ex();}catch{return{t:'Err',v:'parse error'};}
}

function treeToText(n, pre='', last=true) {
  if(!n)return'';
  const c=last?'└─ ':'├─ ', e=last?'   ':'│  ';
  let line=pre+c;
  if(n.t==='BinOp'){line+=`BinOp(${n.v})\n`;n.c.forEach((ch,i)=>{line+=treeToText(ch,pre+e,i===n.c.length-1);});}
  else if(n.t==='UnaryMinus'){line+=`UnaryMinus\n`;line+=treeToText(n.c[0],pre+e,true);}
  else if(n.t==='NumLit')line+=`NumLit(${n.v})\n`;
  else if(n.t==='Ident')line+=`Ident(${n.v})\n`;
  else line+=`Error(${n.v})\n`;
  return line;
}

const tabs = ['🌳 AST 结构', '🔍 语义分析', '📋 符号表', '🎮 AST 可视化'];

export default function LessonASTSemantic() {
  const [active, setActive] = useState(0);
  const [expr, setExpr] = useState('x + y * 2 - z / 4');
  const [tree, setTree] = useState(() => buildAST('x + y * 2 - z / 4'));

  const handleBuild = useCallback(() => { setTree(buildAST(expr)); }, [expr]);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_03 — AST 与语义分析</div>
      <div className="fs-hero">
        <h1>AST 与语义分析：类型检查 / 符号表 / 作用域</h1>
        <p>
          Parser 输出的<strong>具体语法树 (CST)</strong> 会被转化为<strong>抽象语法树 (AST)</strong>，
          去掉括号、分号等冗余信息。语义分析在 AST 上遍历，进行类型检查、符号表管理和作用域解析，
          是编译器前端的最后一道「门卫」。
        </p>
      </div>

      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>🔤 Lexer</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>🌳 Parser</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.4)', color:'#93c5fd', boxShadow:'0 0 20px rgba(37,99,235,0.3)'}}><span>🔍 AST & 语义</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}><span>⚡ IR</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}><span>🎯 Codegen</span></div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ AST 与语义分析</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌳 CST vs AST</h3>
              <div className="concept-card">
                <h4>具体语法树 (CST) → 抽象语法树 (AST)</h4>
                <p>CST 保留了文法中的所有节点（包括括号、分号等辅助 Token），AST 只保留语义上有意义的节点。</p>
              </div>
              <div className="comparison-grid">
                <div>
                  <div className="label before">CST (具体语法树)</div>
                  <div className="sandbox-output">{`E
├─ E
│  └─ T
│     └─ F
│        └─ 3
├─ +
└─ T
   ├─ T
   │  └─ F
   │     └─ 4
   ├─ *
   └─ F
      └─ 5`}</div>
                </div>
                <div>
                  <div className="label after">AST (抽象语法树)</div>
                  <div className="sandbox-output">{`BinOp(+)
├─ NumLit(3)
└─ BinOp(*)
   ├─ NumLit(4)
   └─ NumLit(5)`}</div>
                </div>
              </div>
              <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> ast_nodes.py</div>
                <pre className="fs-code">{`# ═══ AST 节点定义 ═══
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Expr: pass

@dataclass
class NumLit(Expr):     value: float
@dataclass
class StrLit(Expr):     value: str
@dataclass
class Ident(Expr):      name: str

@dataclass
class BinOp(Expr):      op: str; left: Expr; right: Expr
@dataclass
class UnaryOp(Expr):    op: str; operand: Expr
@dataclass
class Call(Expr):        callee: Expr; args: List[Expr]

@dataclass
class Stmt: pass

@dataclass
class LetStmt(Stmt):    name: str; type_ann: Optional[str]; init: Expr
@dataclass
class ReturnStmt(Stmt): value: Optional[Expr]
@dataclass
class IfStmt(Stmt):     cond: Expr; then_body: List[Stmt]; else_body: List[Stmt]
@dataclass
class WhileStmt(Stmt):  cond: Expr; body: List[Stmt]
@dataclass
class FnDecl(Stmt):     name: str; params: List[tuple]; ret_type: str; body: List[Stmt]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 语义分析 — 类型检查</h3>
              <div className="concept-card">
                <h4>语义分析的 3 大任务</h4>
                <ul>
                  <li><strong>名称解析</strong>：变量/函数在哪声明的？作用域链查找</li>
                  <li><strong>类型检查</strong>：<code>int + string</code> 合法吗？隐式转换规则？</li>
                  <li><strong>一致性校验</strong>：函数参数个数对吗？break/continue 在循环内吗？</li>
                </ul>
              </div>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> type_checker.py</div>
                <pre className="fs-code">{`class TypeChecker:
    """AST 遍历式类型检查 (Visitor 模式)"""

    def check(self, node):
        method = f'check_{type(node).__name__}'
        return getattr(self, method)(node)

    def check_NumLit(self, node):
        return 'int' if '.' not in str(node.value) else 'float'

    def check_BinOp(self, node):
        lt = self.check(node.left)
        rt = self.check(node.right)

        # 类型提升规则 (type coercion)
        if lt == 'float' or rt == 'float':
            return 'float'
        if lt == 'int' and rt == 'int':
            return 'int'
        if lt == 'string' and node.op == '+':
            return 'string'  # 字符串拼接

        raise TypeError(
            f"Cannot apply '{node.op}' to {lt} and {rt}"
        )

    def check_Call(self, node):
        fn_type = self.env.lookup(node.callee.name)
        if len(node.args) != len(fn_type.params):
            raise TypeError(
                f"Expected {len(fn_type.params)} args, "
                f"got {len(node.args)}"
            )
        for arg, param in zip(node.args, fn_type.params):
            arg_t = self.check(arg)
            if not is_assignable(arg_t, param.type):
                raise TypeError(f"Cannot pass {arg_t} as {param.type}")
        return fn_type.return_type`}</pre>
              </div>
              <div className="warning-box">
                ⚠️ 类型系统设计直接决定语言的「手感」：TypeScript 的结构化类型、Rust 的所有权类型、
                Go 的接口隐式实现，都是在语义分析阶段实现的。
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 符号表与作用域</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> symbol_table.py</div>
                <pre className="fs-code">{`# ═══ 符号表 = 编译器的"电话簿" ═══
# 记录每个标识符的: 名称, 类型, 作用域层级, 内存位置

class SymbolTable:
    """链式作用域符号表 (Chained Scope)"""

    def __init__(self, parent=None):
        self.symbols = {}
        self.parent = parent  # 外层作用域

    def define(self, name, symbol):
        if name in self.symbols:
            raise NameError(f"Redefinition of '{name}'")
        self.symbols[name] = symbol

    def lookup(self, name):
        """沿作用域链向上查找 (最近原则)"""
        if name in self.symbols:
            return self.symbols[name]
        if self.parent:
            return self.parent.lookup(name)  # 递归上查
        raise NameError(f"Undefined '{name}'")

    def enter_scope(self):
        """进入新作用域 (函数体/if/while/块)"""
        return SymbolTable(parent=self)

    def exit_scope(self):
        """退出作用域"""
        return self.parent

# ═══ 作用域规则 ═══
# 词法作用域 (Lexical Scoping): 编译时确定
#   → C, Java, Python, Rust, Go, JS (let/const)
# 动态作用域 (Dynamic Scoping): 运行时确定
#   → Bash, Emacs Lisp (很少见)

# ═══ 变量遮蔽 (Shadowing) ═══
# let x = 1;
# {
#   let x = 2;   ← 内层 x 遮蔽外层 x
#   print(x);    → 2
# }
# print(x);      → 1  (外层 x 不受影响)

# ═══ 闭包 (Closure) ═══
# fn make_counter() {
#   let count = 0;
#   return fn() {
#     count = count + 1;  ← 捕获外层变量!
#     return count;
#   };
# }`}</pre>
              </div>
              <div className="tip-box">
                💡 <strong>Rust 的所有权系统</strong>本质上也是一种高级的符号表分析——
                编译器在语义分析阶段追踪每个值的所有者、借用关系和生命周期。
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <div className="sandbox">
                <div className="sandbox-header">
                  <h4>🎮 AST 可视化工具</h4>
                  <button className="fs-btn primary" onClick={handleBuild} style={{padding:'0.35rem 0.8rem', fontSize:'0.78rem'}}>▶ 构建 AST</button>
                </div>
                <div className="sandbox-body">
                  <input type="text" value={expr} onChange={e=>setExpr(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBuild()} placeholder="输入表达式, 如: x + y * 2 - z" spellCheck={false} />
                  {tree && (
                    <>
                      <div style={{margin:'1rem 0 0.5rem', fontSize:'0.82rem', color:'#a78bfa', fontWeight:700}}>🌳 AST 树形结构</div>
                      <div className="sandbox-output">{treeToText(tree,'',true)}</div>
                      <div style={{margin:'1rem 0 0.5rem', fontSize:'0.82rem', color:'#22d3ee', fontWeight:700}}>📋 AST JSON</div>
                      <div className="sandbox-output">{JSON.stringify(tree,null,2)}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="tip-box" style={{marginTop:'1rem'}}>
                💡 试试 <code>a * b + c * d</code> 观察运算符优先级如何体现在树结构中。
                每个内部节点是运算符，叶子节点是操作数，树的深度表示优先级。
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
