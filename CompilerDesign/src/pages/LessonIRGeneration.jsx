import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['📦 三地址码', '🔗 SSA 形式', '📊 控制流图', '🔄 源码→IR 对照'];

export default function LessonIRGeneration() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_04 — 中间表示</div>
      <div className="fs-hero">
        <h1>中间表示：三地址码 / SSA / 控制流图</h1>
        <p>
          中间表示 (IR) 是编译器的<strong>「通用语言」</strong>——让前端（语法分析）和后端（代码生成）解耦。
          三地址码是最经典的 IR 形式，SSA 是现代编译器的标配，控制流图是优化分析的基础。
        </p>
      </div>

      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>🔤 Lexer</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>🌳 Parser</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>🔍 Semantic</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.4)', color:'#93c5fd', boxShadow:'0 0 20px rgba(37,99,235,0.3)'}}><span>⚡ IR 生成</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}><span>🔧 优化</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}><span>🎯 Codegen</span></div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 中间表示深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>📦 三地址码 (Three-Address Code)</h3>
            <div className="concept-card">
              <h4>为什么叫「三地址」？</h4>
              <p>每条指令最多涉及<strong>三个地址</strong>（操作数）：<code>x = y op z</code>。这是最简单的线性 IR 形式。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> three_addr.txt</div>
              <pre className="fs-code">{`═══ 三地址码指令集 ═══

赋值:     x = y op z    (op = +, -, *, /, %, ...)
复制:     x = y
一元:     x = op y      (op = -, !, ~, type_cast)
跳转:     goto L
条件跳:   if x goto L / iffalse x goto L
比较跳:   if x relop y goto L
调用:     param x₁; param x₂; call f, n
返回:     return x
取址:     x = &y
解引用:   x = *y  /  *x = y
数组:     x = y[i]  /  x[i] = y

═══ 示例: a = b * c + d ═══

  t1 = b * c      ← 一条三地址指令
  t2 = t1 + d     ← 临时变量 t1, t2
  a  = t2          ← 最终赋值

═══ 示例: if (x > 0) y = 1; else y = -1; ═══

  L1:  if x > 0 goto L2
       goto L3
  L2:  y = 1
       goto L4
  L3:  y = -1
  L4:  (continue...)

═══ 四元组表示 ═══
(op, arg1, arg2, result)
  (*,  b,    c,    t1)
  (+,  t1,   d,    t2)
  (=,  t2,   _,    a)`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🔗 SSA 形式 (Static Single Assignment)</h3>
            <div className="concept-card">
              <h4>🎯 核心规则：每个变量只被赋值一次</h4>
              <p>SSA 是<strong>现代编译器的标配 IR</strong>（LLVM IR、GCC GIMPLE、V8 Turbofan 都用 SSA）。
              每个变量只有一个定义点，极大简化了数据流分析和优化 Pass。</p>
            </div>
            <div className="comparison-grid">
              <div>
                <div className="label before">普通三地址码</div>
                <div className="sandbox-output">{`x = 1
x = x + 1    ← x 被重新赋值
y = x * 2`}</div>
              </div>
              <div>
                <div className="label after">SSA 形式</div>
                <div className="sandbox-output">{`x₁ = 1
x₂ = x₁ + 1  ← 新变量 x₂!
y₁ = x₂ * 2`}</div>
              </div>
            </div>
            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> ssa_phi.txt</div>
              <pre className="fs-code">{`═══ φ 函数 (Phi Function) ═══

if (cond)                    │ SSA:
  x = 1;          →         │   cond_1 = ...
else                         │   if cond_1 goto L1 else L2
  x = 2;                    │ L1: x_1 = 1; goto L3
y = x;                      │ L2: x_2 = 2; goto L3
                             │ L3: x_3 = φ(x_1, x_2)  ← φ 函数!
                             │     y_1 = x_3

φ(x_1, x_2): "如果从 L1 来, 用 x_1; 从 L2 来, 用 x_2"

═══ SSA 的优势 ═══
1. 数据流分析变简单: 每个变量只有一个定义 → def-use 链显然
2. 死代码消除: 定义了但没被 use → 直接删
3. 常量传播: x₁=5 → 所有 use x₁ 的地方替换为 5
4. 公共子表达式消除: 相同表达式只算一次

═══ SSA 构造算法 ═══
1. 计算支配边界 (Dominance Frontier)
2. 在支配边界处插入 φ 函数
3. 重命名变量 (加下标)`}</pre>
            </div>
            <div className="tip-box">
              💡 LLVM IR 就是 SSA 形式！每个 <code>%1</code>, <code>%2</code> 都是 SSA 变量，只有一个定义点。
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>📊 控制流图 (CFG)</h3>
            <div className="concept-card">
              <h4>CFG 是优化的"地图"</h4>
              <p>控制流图将程序分解为<strong>基本块 (Basic Block)</strong>，每个块内是顺序执行的指令，块间通过跳转边连接。
              所有编译器优化（循环检测、可达性、支配关系）都基于 CFG。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> cfg_example.txt</div>
              <pre className="fs-code">{`═══ 基本块 (Basic Block) ═══
定义: 
  • 入口: 只能从第一条指令进入
  • 出口: 只能从最后一条指令离开
  • 内部: 顺序执行, 无跳转

═══ 示例代码 → CFG ═══

fn gcd(a, b):              ┌──────────────┐
  while b != 0:     →      │ B0: entry    │
    temp = a % b            │   ...        │
    a = b                   └──────┬───────┘
    b = temp                       │
  return a                  ┌──────▼───────┐
                      ┌────→│ B1: b != 0?  │──── false ───┐
                      │     └──────┬───────┘              │
                      │       true │                       │
                      │     ┌──────▼───────┐        ┌─────▼──────┐
                      │     │ B2: loop body│        │ B3: return │
                      │     │  temp = a%b  │        │  return a  │
                      │     │  a = b       │        └────────────┘
                      │     │  b = temp    │
                      │     └──────┬───────┘
                      └────────────┘

═══ CFG 上的分析 ═══

支配关系 (Dominance):
  A dom B: 从入口到 B 的所有路径都经过 A
  → 用于 SSA 构造和循环检测

循环检测:
  回边 (back edge): B → A 且 A dom B → 存在循环!
  自然循环: 回边 B→A 定义的循环 = {A} ∪ 所有能不经 A 到达 B 的节点

可达性分析:
  从入口不可达的基本块 → 死代码 → 删除!`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>🔄 源码 → IR 对照</h3>
            <div className="concept-card">
              <h4>看看 C 代码如何翻译为三地址码和 LLVM IR</h4>
            </div>
            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#c4b5fd'}}>C 源代码</div>
                <div className="sandbox-output">{`int factorial(int n) {
  int result = 1;
  while (n > 1) {
    result = result * n;
    n = n - 1;
  }
  return result;
}`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#22d3ee'}}>三地址码</div>
                <div className="sandbox-output">{`factorial(n):
  result = 1
L1:
  t1 = n > 1
  iffalse t1 goto L2
  t2 = result * n
  result = t2
  t3 = n - 1
  n = t3
  goto L1
L2:
  return result`}</div>
              </div>
            </div>
            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#4ade80'}}></span> factorial.ll — LLVM IR (SSA 形式)</div>
              <pre className="fs-code">{`define i32 @factorial(i32 %n) {
entry:
  br label %loop.header

loop.header:
  %result = phi i32 [1, %entry], [%new_result, %loop.body]
  %n.cur  = phi i32 [%n, %entry], [%n.dec, %loop.body]
  %cond = icmp sgt i32 %n.cur, 1
  br i1 %cond, label %loop.body, label %exit

loop.body:
  %new_result = mul i32 %result, %n.cur
  %n.dec = sub i32 %n.cur, 1
  br label %loop.header

exit:
  ret i32 %result
}`}</pre>
            </div>
            <div className="tip-box">
              💡 注意 LLVM IR 的 SSA 特征：每个 <code>%变量</code> 只有一个定义，
              循环中用 <code>phi</code> 函数合并不同路径的值。
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
