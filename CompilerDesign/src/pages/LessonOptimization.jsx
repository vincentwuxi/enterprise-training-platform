import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['🔧 基本优化', '🔄 循环优化', '📊 数据流分析', '⚡ 优化前后对比'];

export default function LessonOptimization() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_05 — 编译优化</div>
      <div className="fs-hero">
        <h1>编译优化：常量折叠 / 死代码消除 / 循环优化</h1>
        <p>
          优化 Pass 是编译器中价值最高的部分——在不改变程序语义的前提下，让代码跑得更快、占用更少资源。
          现代编译器（GCC -O2、LLVM -O3）可能执行<strong>上百个优化 Pass</strong>。
        </p>
      </div>

      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>🌳 AST</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>⚡ IR</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.4)', color:'#fbbf24', boxShadow:'0 0 20px rgba(245,158,11,0.3)'}}><span>🔧 优化 Pass</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#94a3b8'}}><span>⚡ 优化后 IR</span></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(100,116,139,0.06)', border:'1px solid rgba(100,116,139,0.15)', color:'#64748b'}}><span>🎯 Codegen</span></div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 编译优化技术</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🔧 基本优化 Pass</h3>
            <div className="concept-card">
              <h4>🎯 优化的两大原则</h4>
              <p><strong>安全性</strong>：优化不能改变程序的可观测行为（as-if rule）</p>
              <p><strong>收益性</strong>：优化带来的加速 {'>'} 编译时增加的开销</p>
            </div>

            <h4 style={{color:'#c4b5fd', margin:'1.5rem 0 0.5rem'}}>1. 常量折叠 (Constant Folding)</h4>
            <div className="comparison-grid">
              <div><div className="label before">优化前</div><div className="sandbox-output">{`x = 3 + 4 * 2
y = "hello" + " world"`}</div></div>
              <div><div className="label after">优化后</div><div className="sandbox-output">{`x = 11          ← 编译期算好!
y = "hello world" ← 字符串也折叠`}</div></div>
            </div>

            <h4 style={{color:'#c4b5fd', margin:'1.5rem 0 0.5rem'}}>2. 死代码消除 (Dead Code Elimination)</h4>
            <div className="comparison-grid">
              <div><div className="label before">优化前</div><div className="sandbox-output">{`x = compute()    ← x 从没被使用!
return 42`}</div></div>
              <div><div className="label after">优化后 (如果 compute 无副作用)</div><div className="sandbox-output">{`return 42        ← x 的赋值被删除`}</div></div>
            </div>

            <h4 style={{color:'#c4b5fd', margin:'1.5rem 0 0.5rem'}}>3. 常量传播 (Constant Propagation)</h4>
            <div className="comparison-grid">
              <div><div className="label before">优化前</div><div className="sandbox-output">{`x = 5
y = x * 3
z = y + x`}</div></div>
              <div><div className="label after">优化后</div><div className="sandbox-output">{`x = 5
y = 15          ← x 替换为 5
z = 20          ← 进一步折叠`}</div></div>
            </div>

            <h4 style={{color:'#c4b5fd', margin:'1.5rem 0 0.5rem'}}>4. 公共子表达式消除 (CSE)</h4>
            <div className="comparison-grid">
              <div><div className="label before">优化前</div><div className="sandbox-output">{`a = b * c + d
e = b * c + f    ← b*c 重复计算!`}</div></div>
              <div><div className="label after">优化后</div><div className="sandbox-output">{`t = b * c        ← 复用!
a = t + d
e = t + f`}</div></div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🔄 循环优化</h3>
            <div className="concept-card">
              <h4>循环是程序执行时间最集中的地方 — 90/10 法则</h4>
              <p>程序 90% 的执行时间花在 10% 的代码上，而那 10% 几乎都是循环！</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> loop_optimizations.txt</div>
              <pre className="fs-code">{`═══ 循环不变量外提 (LICM) ═══
优化前:                        优化后:
  for i in 0..n:                 t = len(arr)    ← 提到循环外!
    x = len(arr)   ← 每次都算!   for i in 0..n:
    use(x, i)                      use(t, i)

═══ 归纳变量优化 ═══
优化前:                        优化后:
  for i in 0..n:                 addr = &a[0]
    a[i] = 0                     end  = &a[n]
    // addr = base + i*8          while addr < end:
                                    *addr = 0
                                    addr += 8    ← 改乘为加!

═══ 循环展开 (Loop Unrolling) ═══
优化前:                        优化后:
  for i in 0..100:               for i in 0..100 step 4:
    a[i] *= 2                      a[i]   *= 2
                                   a[i+1] *= 2
                                   a[i+2] *= 2
                                   a[i+3] *= 2
→ 减少循环控制开销, 暴露更多指令级并行

═══ 循环融合 / 分裂 ═══
融合 (减少循环开销):         分裂 (改善缓存):
  for i: a[i]=0               for i: a[i]=b[i]*2
  for i: b[i]=0               for i: c[i]=d[i]+1
  → for i: a[i]=0; b[i]=0   → 拆开, 让每个循环的数据集更小

═══ 向量化 (Auto-Vectorization) ═══
标量:                          SIMD:
  for i in 0..n:                 for i in 0..n step 4:
    a[i] = b[i] + c[i]            a[i:i+4] = b[i:i+4] + c[i:i+4]
                                   // 一条指令处理 4 个元素!`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>📊 数据流分析</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> dataflow.txt</div>
              <pre className="fs-code">{`═══ 数据流分析框架 ═══

通用形式:
  OUT[B] = fB(IN[B])          ← 传递函数
  IN[B]  = ∪ OUT[P]          ← 合流 (前驱 P 的并集)
           P∈pred(B)

迭代求解, 直到所有 IN/OUT 不变 (不动点)

═══ 四种经典分析 ═══

分析类型      │ 方向  │ 合流  │ 用途
──────────────┼───────┼───────┼────────────────
到达定值      │  前向  │  ∪   │ 未初始化变量检测
活跃变量      │  后向  │  ∪   │ 寄存器分配
可用表达式    │  前向  │  ∩   │ 公共子表达式消除
非常忙表达式  │  后向  │  ∩   │ 代码外提

═══ 到达定值 (Reaching Definitions) ═══
问: 变量 x 在某点的值来自哪条赋值?
  gen[B]  = B 中定义的变量
  kill[B] = B 中重新定义前的同变量旧定义
  OUT[B]  = gen[B] ∪ (IN[B] - kill[B])

═══ 活跃变量 (Liveness) ═══
问: 变量 x 在某点之后还会被使用吗?
  use[B]  = B 中使用但未在之前定义的变量
  def[B]  = B 中定义的变量
  IN[B]   = use[B] ∪ (OUT[B] - def[B])
  → 不活跃的变量 → 寄存器可以回收!`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>⚡ 真实代码优化对比</h3>
            <div className="concept-card">
              <h4>GCC -O0 vs -O2 — 看编译器到底做了什么</h4>
            </div>
            <div className="comparison-grid">
              <div>
                <div className="label before">C 源代码</div>
                <div className="sandbox-output">{`int sum(int n) {
  int total = 0;
  for (int i = 1; i <= n; i++)
    total += i;
  return total;
}`}</div>
              </div>
              <div>
                <div className="label after">GCC -O2 优化后 (x86-64)</div>
                <div className="sandbox-output">{`sum:
  ; 编译器用公式替换了循环!
  ; total = n * (n + 1) / 2
  lea    eax, [rdi+1]
  imul   eax, edi
  shr    eax, 1
  ret`}</div>
              </div>
            </div>
            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>GCC -O2 将 O(n) 循环优化为 O(1) 常量时间！</strong>
              编译器通过归纳变量分析识别出这是等差数列求和公式 n×(n+1)/2，直接替换为数学运算。
            </div>
            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> optimization_levels.txt</div>
              <pre className="fs-code">{`═══ GCC/Clang 优化级别 ═══
-O0: 不优化 (调试用, 编译最快)
-O1: 基本优化 (常量折叠/DCE/CSE)
-O2: 推荐级别 (循环优化/内联/向量化)
-O3: 激进优化 (可能增大代码体积)
-Os: 优化代码大小 (嵌入式)
-Oz: 极致小 (Clang 特有)
-Ofast: -O3 + 不严格遵守 IEEE 浮点

═══ LLVM Pass Pipeline (-O2) ═══
约 80+ 个 Pass, 关键的:
  SimplifyCFG → SROA → EarlyCSE →
  InstCombine → GVN → LoopRotate →
  LICM → IndVarSimplify → LoopUnroll →
  Vectorize → SLP → InstCombine(again)`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
