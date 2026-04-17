import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['三地址码', 'SSA 形式', '控制流图', 'IR 生成'];

export default function LessonIRGeneration() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_04 — 中间表示</div>
      <div className="fs-hero">
        <h1>中间表示：三地址码 / SSA / 控制流图</h1>
        <p>
          中间表示 (Intermediate Representation, IR) 是编译器前端与后端的<strong>桥梁</strong>。
          三地址码 (TAC) 将复杂表达式分解为简单操作，SSA 形式让每个变量只赋值一次
          从而简化优化分析，控制流图 (CFG) 抽象了程序的执行路径。
          LLVM IR 是最成功的工业级 IR 设计。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 中间表示深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 三地址码 (TAC)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> tac.txt</div>
                <pre className="fs-code">{`═══ IR 的层次 ═══

High-level IR (HIR):
  接近源码, 保留循环/条件等高级结构
  → Rust: HIR (desugared AST)

Mid-level IR (MIR):
  控制流已展平, 使用基本块和跳转
  → Rust: MIR, LLVM IR, Java Bytecode

Low-level IR (LIR):
  接近机器码, 使用虚拟寄存器
  → LLVM: SelectionDAG → MachineIR

═══ 三地址码 (Three-Address Code) ═══

基本形式: x = y op z (最多三个地址)

指令类型:
  x = y op z    — 二元运算
  x = op y      — 一元运算
  x = y         — 复制
  goto L        — 无条件跳转
  if x goto L   — 条件跳转
  if x relop y goto L  — 条件比较跳转
  param x       — 传参
  call f, n     — 调用函数 f, n 个参数
  return x      — 返回
  x = y[i]      — 数组取值
  y[i] = x      — 数组赋值
  x = &y        — 取地址
  x = *y        — 解引用
  *x = y        — 间接赋值

═══ 示例: 源码 → TAC ═══

源码:
  let result = (a + b) * (c - d) + e;

TAC:
  t1 = a + b
  t2 = c - d
  t3 = t1 * t2
  t4 = t3 + e
  result = t4

源码:
  if (x > 0) {
    y = x * 2;
  } else {
    y = -x;
  }

TAC:
      if x > 0 goto L1
      goto L2
  L1: t1 = x * 2
      y = t1
      goto L3
  L2: t2 = -x
      y = t2
  L3: ...

源码:
  while (i < n) {
    sum = sum + a[i];
    i = i + 1;
  }

TAC:
  L1: if i >= n goto L2
      t1 = i * 4        // 数组偏移 (int = 4字节)
      t2 = a[t1]
      sum = sum + t2
      i = i + 1
      goto L1
  L2: ...

═══ 四元组表示 ═══
(op, arg1, arg2, result)

  (ADD, a, b, t1)
  (SUB, c, d, t2)
  (MUL, t1, t2, t3)
  (JGT, x, 0, L1)    // if x > 0 goto L1`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 SSA 形式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> ssa.txt</div>
                <pre className="fs-code">{`═══ SSA (Static Single Assignment) ═══

核心规则: 每个变量只被赋值一次!

普通代码:
  x = 1
  x = x + 1
  y = x * 2
  x = y + 3

SSA 形式:
  x₁ = 1
  x₂ = x₁ + 1
  y₁ = x₂ * 2
  x₃ = y₁ + 3

→ 每次赋值创建新版本 (subscript)

═══ Φ 函数 (Phi Function) ═══

问题: 条件分支后, 变量来自哪个分支?

  if (cond)
    x = 1;    → x₁ = 1
  else
    x = 2;    → x₂ = 2
  // x = ?    → 不确定是 x₁ 还是 x₂!

解决: 在汇合点插入 φ 函数
  x₃ = φ(x₁, x₂)

含义: 如果控制流从"then"分支来, x₃ = x₁;
      如果控制流从"else"分支来, x₃ = x₂

注意: φ 函数不是真正的运算指令!
→ 代码生成时会被消除 (通过寄存器分配或 move 指令)

═══ 循环的 SSA ═══

  i = 0
  while (i < n):
    sum = sum + a[i]
    i = i + 1

SSA:
  i₁ = 0
  sum₁ = 0
  goto loop_header

loop_header:
  i₂ = φ(i₁, i₃)      ← 来自入口或循环体
  sum₂ = φ(sum₁, sum₃)
  if i₂ >= n goto exit

loop_body:
  t₁ = a[i₂]
  sum₃ = sum₂ + t₁
  i₃ = i₂ + 1
  goto loop_header

exit:

═══ SSA 构造算法 ═══

两步:
1. 放置 φ 函数 (使用支配边界 Dominance Frontier)
   → 在变量定义的支配边界上插入 φ
2. 重命名变量 (遍历支配树)
   → 给每个定义分配新版本号

支配关系 (Dominance):
  A dom B: 从入口到 B 的每条路径都经过 A
  直接支配者 (idom): 最近的支配者
  支配树: idom 关系形成的树
  支配边界 DF(A): A 的支配结束的边界

═══ SSA 的优势 ═══

1. 简化数据流分析:
   → 定义-使用关系一目了然 (每个变量只有一个定义)
   → 使得常量传播、死代码消除等优化更简单

2. 常量传播:
   x₁ = 3
   y₁ = x₁ + 2  → y₁ = 5 (直接替换!)

3. 死代码消除:
   x₁ = compute()
   x₂ = 42        // x₁ 没有被使用 → 可以删除

4. 公共子表达式消除:
   t₁ = a₁ + b₁
   t₂ = a₁ + b₁   // 相同操作数 → t₂ = t₁

LLVM IR = SSA 形式!
GCC GIMPLE = SSA 形式!
WebAssembly = 基于栈, 不是 SSA`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 控制流图 (CFG)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> cfg.txt</div>
                <pre className="fs-code">{`═══ 控制流图 (Control Flow Graph) ═══

CFG 是有向图:
  节点 = 基本块 (Basic Block)
  边   = 控制流转移 (跳转/分支/顺序)

═══ 基本块 (Basic Block) ═══

定义: 最大化的连续指令序列, 满足:
  1. 只能从第一条指令进入
  2. 只能从最后一条指令离开

划分算法:
  1. 找出所有 Leader (入口指令):
     → 第一条指令
     → 跳转目标
     → 紧跟跳转指令的下一条指令
  2. 每个 Leader 到下一个 Leader 之间 = 一个基本块

═══ 示例 ═══

  1:  sum = 0
  2:  i = 1
  ─────────────
  3:  if i > n goto 8     ← Leader (循环头)
  ─────────────
  4:  t = a[i]            ← Leader (跳转目标之后)
  5:  sum = sum + t
  6:  i = i + 1
  7:  goto 3
  ─────────────
  8:  return sum           ← Leader (跳转目标)

CFG:
  [B1: sum=0, i=1] → [B2: if i>n goto B4]
                     ↙          ↘
  [B3: t=a[i],...,goto B2]   [B4: return sum]
         ↑_________|

═══ CFG 上的分析 ═══

1. 可达性分析:
   从入口可达的基本块 = 有效代码
   不可达的基本块 = 死代码 (可删除)

2. 循环检测:
   自然循环: 有回边 (back edge) 的 SCC
   循环头 (loop header): 支配回边目标的节点
   循环体: header 到回边源节点之间的所有块

3. 支配关系:
   ENTRY dom B₁ dom B₂ (入口支配所有块)
   循环头支配循环体内所有块

═══ 数据流分析框架 ═══

通用框架: IN/OUT 方程 + 迭代求解

到达定义 (Reaching Definitions):
  OUT[B] = gen[B] ∪ (IN[B] - kill[B])
  IN[B]  = ∪ OUT[P] for all P ∈ pred(B)
  方向: 前向 (forward)
  汇合: 并集 (union)

活跃变量 (Live Variables):
  IN[B]  = use[B] ∪ (OUT[B] - def[B])
  OUT[B] = ∪ IN[S] for all S ∈ succ(B)
  方向: 后向 (backward)
  汇合: 并集

可用表达式 (Available Expressions):
  OUT[B] = gen[B] ∪ (IN[B] - kill[B])
  IN[B]  = ∩ OUT[P] for all P ∈ pred(B)
  方向: 前向
  汇合: 交集 (intersection)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ IR 生成实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ir_gen.py</div>
                <pre className="fs-code">{`# ═══ AST → TAC 生成器 ═══

class IRGenerator(ASTVisitor):
    def __init__(self):
        self.instructions = []
        self.temp_counter = 0
        self.label_counter = 0
    
    def new_temp(self):
        self.temp_counter += 1
        return f"t{self.temp_counter}"
    
    def new_label(self):
        self.label_counter += 1
        return f"L{self.label_counter}"
    
    def emit(self, *instr):
        self.instructions.append(instr)
    
    # ═══ 表达式 ═══
    
    def visit_IntLiteral(self, node):
        t = self.new_temp()
        self.emit('CONST', t, node.value)
        return t
    
    def visit_BinaryOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        result = self.new_temp()
        
        op_map = {
            '+': 'ADD', '-': 'SUB',
            '*': 'MUL', '/': 'DIV',
        }
        self.emit(op_map[node.op], result, left, right)
        return result
    
    def visit_Identifier(self, node):
        return node.name  # 变量名直接作为地址
    
    def visit_CallExpr(self, node):
        # 计算参数 (从右到左, 匹配调用约定)
        args = [self.visit(arg) for arg in node.args]
        for arg in args:
            self.emit('PARAM', arg)
        
        result = self.new_temp()
        fn_name = node.callee.name
        self.emit('CALL', result, fn_name, len(args))
        return result
    
    # ═══ 语句 ═══
    
    def visit_LetStmt(self, node):
        if node.init:
            val = self.visit(node.init)
            self.emit('ASSIGN', node.name, val)
    
    def visit_IfExpr(self, node):
        cond = self.visit(node.condition)
        else_label = self.new_label()
        end_label = self.new_label()
        
        self.emit('IF_FALSE', cond, else_label)
        self.visit(node.then_branch)
        self.emit('GOTO', end_label)
        self.emit('LABEL', else_label)
        if node.else_branch:
            self.visit(node.else_branch)
        self.emit('LABEL', end_label)
    
    def visit_WhileStmt(self, node):
        loop_start = self.new_label()
        loop_end = self.new_label()
        
        self.emit('LABEL', loop_start)
        cond = self.visit(node.condition)
        self.emit('IF_FALSE', cond, loop_end)
        self.visit(node.body)
        self.emit('GOTO', loop_start)
        self.emit('LABEL', loop_end)

# ═══ LLVM IR 示例 ═══
# define i32 @add(i32 %a, i32 %b) {
# entry:
#   %sum = add i32 %a, %b
#   ret i32 %sum
# }
#
# define i32 @factorial(i32 %n) {
# entry:
#   %cmp = icmp sle i32 %n, 1
#   br i1 %cmp, label %base, label %recurse
# base:
#   ret i32 1
# recurse:
#   %n_minus_1 = sub i32 %n, 1
#   %result = call i32 @factorial(i32 %n_minus_1)
#   %final = mul i32 %n, %result
#   ret i32 %final
# }

# ═══ 多种 IR 设计 ═══
# 栈式 IR: JVM Bytecode, WebAssembly
#   iload 1; iload 2; iadd; istore 3
# 寄存器式 IR: LLVM IR, GCC GIMPLE
#   %3 = add i32 %1, %2
# 图式 IR: Sea of Nodes (V8 TurboFan, HotSpot C2)
#   节点 = 操作, 边 = 数据/控制依赖`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
