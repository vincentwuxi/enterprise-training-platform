import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['🎯 指令选择', '📦 寄存器分配', '📐 指令调度', '🔧 目标代码'];

export default function LessonCodegen() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_06 — 代码生成</div>
      <div className="fs-hero">
        <h1>代码生成：寄存器分配 / 指令选择 / 目标代码</h1>
        <p>
          代码生成是编译器<strong>后端</strong>的核心——将与机器无关的 IR 转化为特定硬件的机器指令。
          三大任务：指令选择（用什么指令）、寄存器分配（变量放哪）、指令调度（什么顺序执行最快）。
        </p>
      </div>

      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>⚡ 优化后 IR</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(251,113,133,0.12)', border:'1px solid rgba(251,113,133,0.4)', color:'#fda4af', boxShadow:'0 0 20px rgba(251,113,133,0.3)'}}><span>🎯 指令选择</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.4)', color:'#fbbf24'}}><span>📦 寄存器分配</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.4)', color:'#86efac'}}><span>📐 调度</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', color:'#c4b5fd'}}><span>🖥️ 机器码</span></div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 代码生成</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🎯 指令选择 (Instruction Selection)</h3>
            <div className="concept-card">
              <h4>核心问题：一条 IR 指令可能对应多条机器指令</h4>
              <p>不同 CPU 架构的指令集差异巨大：x86 有复杂寻址模式、ARM 有条件执行、RISC-V 是精简指令集。
              指令选择就是将 IR 映射到目标机器最优指令序列的过程。</p>
            </div>
            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#c4b5fd'}}>IR 三地址码</div>
                <div className="sandbox-output">{`t1 = a + b
t2 = t1 * 4
t3 = base + t2
x  = *t3`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#22d3ee'}}>x86-64 (一条指令搞定!)</div>
                <div className="sandbox-output">{`mov eax, [base + (a+b)*4]
; x86 的 SIB 寻址模式:
; [base + index*scale + disp]
; 一条指令完成4条IR!`}</div>
              </div>
            </div>
            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> isel_methods.txt</div>
              <pre className="fs-code">{`═══ 指令选择方法 ═══

1. 宏展开 (Macro Expansion) — 最简单
   每条 IR → 固定的指令模板
   优点: 实现简单    缺点: 无法利用复杂指令

2. 树模式匹配 (Tree Pattern Matching) — LLVM 用
   将 DAG 上的子树匹配为指令模式
   用 .td (TableGen) 文件声明模式

3. 窥孔优化 (Peephole) — 后处理
   扫描指令序列, 用更优的指令替换
   mov eax, 0 → xor eax, eax  (更短更快)

═══ x86 vs ARM vs RISC-V ═══
         │ x86-64    │ ARM64    │ RISC-V
─────────┼───────────┼──────────┼─────────
风格     │ CISC      │ RISC     │ RISC
寄存器   │ 16 GPR    │ 31 GPR   │ 32 GPR
指令长度 │ 变长1-15B │ 定长4B   │ 定长4B
寻址模式 │ 复杂SIB   │ 中等     │ 简单
条件执行 │ 条件跳转  │ 条件选择 │ 条件跳转`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>📦 寄存器分配 (Register Allocation)</h3>
            <div className="concept-card">
              <h4>NP-完全问题！但有好的启发式算法</h4>
              <p>SSA IR 中有无限虚拟寄存器，但物理 CPU 只有有限寄存器（x86: 16个，ARM64: 31个）。
              寄存器分配决定哪些变量放寄存器、哪些溢出 (spill) 到栈。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> register_allocation.txt</div>
              <pre className="fs-code">{`═══ 图着色寄存器分配 (Graph Coloring) ═══

步骤:
1. 构建干涉图 (Interference Graph)
   - 每个变量 = 一个节点
   - 两个变量同时活跃 → 连边 (不能用同一寄存器!)

2. 图着色
   - K 种颜色 = K 个物理寄存器
   - 相邻节点不能同色 → K-着色问题

3. 简化 (Simplify)
   - 度 < K 的节点一定可着色 → 先移除
   - 重复直到图空或所有节点度 ≥ K

4. 溢出 (Spill)
   - 无法着色的节点 → 放到栈上
   - 选溢出代价最低的变量 (使用次数少/循环外)

═══ 线性扫描 (Linear Scan) ═══
更快但效果稍差, JIT 编译器常用:
  1. 对变量按活跃区间排序
  2. 从左到右扫描, 贪心分配寄存器
  3. 冲突时溢出最远使用的变量

═══ LLVM 的寄存器分配器 ═══
  - -O0: FastRegAlloc (线性, 超快)
  - -O1: BasicRegAlloc
  - -O2+: Greedy (贪心, LLVM 默认, 效果接近图着色)

═══ 调用约定 (Calling Convention) ═══
                │ x86-64 Linux │ ARM64
────────────────┼──────────────┼─────────
参数寄存器      │ rdi,rsi,rdx  │ x0-x7
返回值          │ rax          │ x0
调用者保存      │ rax,rcx,rdx  │ x9-x15
被调用者保存    │ rbx,r12-r15  │ x19-x28`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>📐 指令调度 (Instruction Scheduling)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> scheduling.txt</div>
              <pre className="fs-code">{`═══ 为什么需要指令调度? ═══

现代 CPU 是流水线 + 乱序执行:
  - 指令重叠执行 (pipelining)
  - 数据依赖会导致流水线停顿 (stall)

═══ 数据依赖类型 ═══
RAW (Read After Write): 真依赖, 不可消除
  a = ...
  b = a + 1    ← 必须等 a 写完

WAR (Write After Read): 名依赖, 可通过寄存器重命名消除
WAW (Write After Write): 名依赖, 同上

═══ 列表调度 (List Scheduling) ═══

1. 构建依赖DAG: 节点=指令, 边=数据依赖
2. 计算优先级: 关键路径长度 / 延迟
3. 贪心调度:
   while (有指令未调度):
     选就绪且优先级最高的指令
     发射到当前 cycle
     更新就绪队列

═══ 示例 ═══
优化前 (有停顿):          优化后 (交错执行):
  load A → r1  (3 cycle)    load A → r1
  add r1, r2   ← stall!     load B → r3    ← 填充空隙!
  load B → r3  (3 cycle)    some_other_op  ← 填充空隙!
  sub r3, r4   ← stall!     add r1, r2     ← load A 已完成
                             sub r3, r4     ← load B 已完成`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>🔧 完整代码生成示例</h3>
            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#c4b5fd'}}>C 源代码</div>
                <div className="sandbox-output">{`int max(int a, int b) {
  if (a > b)
    return a;
  else
    return b;
}`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#22d3ee'}}>x86-64 汇编 (GCC -O2)</div>
                <div className="sandbox-output">{`max:
  cmp    edi, esi    ; a vs b
  mov    eax, esi    ; eax = b
  cmovg  eax, edi    ; if a>b: eax=a
  ret
; 无分支! cmov 条件移动`}</div>
              </div>
            </div>
            <div className="comparison-grid" style={{marginTop:'1rem'}}>
              <div>
                <div className="label" style={{color:'#c4b5fd'}}>同样的 C 代码</div>
                <div className="sandbox-output">{`int max(int a, int b) {
  if (a > b)
    return a;
  else
    return b;
}`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#fbbf24'}}>ARM64 汇编</div>
                <div className="sandbox-output">{`max:
  cmp    w0, w1     ; a vs b
  csel   w0, w0, w1, gt
  ret
; csel = 条件选择, ARM 特色`}</div>
              </div>
            </div>
            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>注意</strong>：x86 用 <code>cmov</code>，ARM 用 <code>csel</code>，两者都避免了分支预测失败的代价 (15-20 cycle penalty)。
              好的指令选择器要知道目标机器的「特长」。
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
