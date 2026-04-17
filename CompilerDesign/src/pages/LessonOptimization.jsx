import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['局部优化', '全局优化', '循环优化', '过程间优化'];

export default function LessonOptimization() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_05 — 编译优化</div>
      <div className="fs-hero">
        <h1>编译优化：常量折叠 / 死代码消除 / 循环优化</h1>
        <p>
          编译优化在<strong>保持语义等价</strong>的前提下改进程序的效率——
          减少执行时间、降低内存使用。优化的正确性是最重要的约束，
          其次才是优化效果。从窥孔优化到过程间分析，
          现代编译器的优化 Pass 数量可达数百个。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 编译优化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 局部优化 (Basic Block 内)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> local_opts.txt</div>
                <pre className="fs-code">{`═══ 常量折叠 (Constant Folding) ═══

编译时计算常量表达式:
  x = 3 + 5        → x = 8
  y = 2 * 3.14     → y = 6.28
  z = "hello" + " " + "world"  → z = "hello world"
  b = 10 > 5       → b = true

注意: 浮点折叠需要保证与运行时行为一致
  → 某些编译器对浮点常量折叠保守

═══ 常量传播 (Constant Propagation) ═══

如果变量值已知为常量, 替换所有使用:
  x = 5
  y = x + 3    → y = 5 + 3 → y = 8  (再折叠!)
  z = x * y    → z = 5 * 8 → z = 40

SSA 形式让常量传播非常简单:
  x₁ = 5
  y₁ = x₁ + 3  → 直接看到 x₁ 的唯一定义是 5

═══ 代数化简 (Algebraic Simplification) ═══

  x + 0   → x          x * 1   → x
  x - 0   → x          x * 0   → 0
  x * 2   → x << 1     x / 1   → x
  x ** 2  → x * x      -(-x)   → x
  x & 0   → 0          x | 0   → x
  x ^ x   → 0          x & x   → x

强度削弱 (Strength Reduction):
  x * 4   → x << 2     (移位比乘法快)
  x / 8   → x >> 3     (仅对无符号/正整数)
  x % 16  → x & 15

═══ 公共子表达式消除 (CSE) ═══

  t1 = a + b
  t2 = a + b    → t2 = t1  (复用已计算的结果!)
  t3 = t1 * t2
  
  在 SSA 中更简单:
  如果两个表达式的操作数是相同的 SSA 变量
  且操作相同 → 等价

  局部 CSE: 在基本块内
  全局 CSE: 在 CFG 上 (使用可用表达式分析)

═══ 死代码消除 (DCE) ═══

删除结果不被使用的指令:
  x = compute_something()  // x 后续未使用
  → 删除! (前提: compute_something 无副作用)

SSA 中的 DCE:
  如果一个 SSA 变量的 use list 为空 → 删除其定义

连锁删除:
  x₁ = a + b    // x₁ 只被 y₁ 使用
  y₁ = x₁ * 2   // y₁ 未使用 → 删除 y₁
  → x₁ 也未使用了 → 删除 x₁

═══ 复制传播 (Copy Propagation) ═══

  x = y
  z = x + 1    → z = y + 1  (用 y 替换 x)
  → 然后 x = y 可能变成死代码被删除`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 全局优化 (跨基本块)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> global_opts.txt</div>
                <pre className="fs-code">{`═══ 全局常量传播 (SCCP) ═══

Sparse Conditional Constant Propagation:
  结合 SSA + CFG, 同时做常量传播和不可达代码消除

  if (true) {       // true 是常量!
    x = 5;
  } else {
    x = 10;         // 此分支不可达!
  }
  y = x + 1;        // x 一定是 5 → y = 6

SCCP 的格 (Lattice):
  ⊤ (undefined) → 常量值 → ⊥ (not constant)
  
  初始: 所有变量 = ⊤
  遇到常量赋值: 变量 = 常量
  两个不同常量汇合: 变量 = ⊥

═══ 全局值编号 (GVN) ═══

给等价的表达式分配相同的编号:
  a₁ = x + y   → vn(a₁) = hash(ADD, vn(x), vn(y)) = v1
  b₁ = x + y   → vn(b₁) = hash(ADD, vn(x), vn(y)) = v1
  → a₁ 和 b₁ 有相同的值编号 → b₁ = a₁

比 CSE 更强:
  a = x + y
  b = y + x     // 交换律: 也是 v1!

═══ 部分冗余消除 (PRE) ═══

表达式在某些路径上冗余, 但在其他路径上不冗余

  路径1: a = x + y; ... b = x + y  (冗余)
  路径2: .............. b = x + y  (非冗余)
  
  PRE: 在路径2的前面插入 t = x + y
  → 两条路径都用 t, b = t

Lazy Code Motion:
  → 表达式尽可能晚计算 (减少寄存器压力)
  → 但至少和原来一样早 (不增加计算次数)

═══ 条件消除 ═══

  if (x > 0) {
    if (x > 0) {   // 冗余条件!
      ...
    }
  }
  → 内层 if 一定为 true, 消除

  if (x > 5) {
    if (x > 3) {   // 被蕴含!
      ...
    }
  }
  → 内层 if 一定为 true (x > 5 → x > 3), 消除

═══ 尾调用优化 (TCO) ═══

  fn factorial(n, acc):
    if n <= 1: return acc
    return factorial(n-1, n*acc)  // 尾调用!
  
  → 复用当前栈帧, 变成循环:
  factorial:
    if n <= 1: return acc
    acc = n * acc
    n = n - 1
    goto factorial

  要求: 递归调用是函数的最后一个操作
  → Go 不做 TCO! (设计决定: 更好的 stack trace)
  → Rust/C/Scheme 支持 TCO`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔁 循环优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> loop_opts.txt</div>
                <pre className="fs-code">{`═══ 循环不变量外提 (LICM) ═══

将循环内不变的计算移到循环外:

  for (i = 0; i < n; i++) {
    x = a * b + c;     // 每次迭代结果相同!
    arr[i] = x + i;
  }
  
  优化后:
  x = a * b + c;       // 外提到循环外
  for (i = 0; i < n; i++) {
    arr[i] = x + i;
  }

条件: 表达式的所有操作数在循环内不被修改

═══ 循环展开 (Loop Unrolling) ═══

减少循环控制开销, 增加 ILP 机会:

  for (i = 0; i < 100; i++)
    a[i] = b[i] + c[i];

  展开 4 次:
  for (i = 0; i < 100; i += 4) {
    a[i]   = b[i]   + c[i];
    a[i+1] = b[i+1] + c[i+1];
    a[i+2] = b[i+2] + c[i+2];
    a[i+3] = b[i+3] + c[i+3];
  }

好处:
  → 减少分支指令 (4x)
  → 增加指令级并行 (ILP)
  → 为 SIMD 向量化做准备

成本:
  → 代码体积增大
  → I-cache 压力

═══ 归纳变量消除 ═══

  for (i = 0; i < n; i++) {
    j = i * 4;         // j 是 i 的派生归纳变量
    a[j] = ...;        // 等价于 a[i*4]
  }

  优化后 (强度削弱):
  j = 0;
  for (i = 0; i < n; i++) {
    a[j] = ...;
    j = j + 4;          // 乘法 → 加法!
  }

  进一步删除 i (如果 i 只用于控制循环):
  j = 0;
  limit = n * 4;
  while (j < limit) {
    a[j] = ...;
    j = j + 4;
  }

═══ 循环向量化 (Auto-vectorization) ═══

  for (i = 0; i < n; i++)
    a[i] = b[i] + c[i];

  向量化 (SSE/AVX):
  for (i = 0; i < n; i += 4) {   // 4 个 float 一组
    __m128 vb = _mm_load_ps(&b[i]);
    __m128 vc = _mm_load_ps(&c[i]);
    __m128 va = _mm_add_ps(vb, vc);
    _mm_store_ps(&a[i], va);       // 4 个元素同时计算!
  }

条件:
  → 无循环依赖 (a[i] 不依赖 a[i-1])
  → 数据对齐
  → 编译器能证明不存在别名 (aliasing)

═══ 循环分裂 / 融合 / 交换 ═══

分裂 (Fission): 一个循环 → 多个循环
  → 改善缓存局部性

融合 (Fusion): 多个循环 → 一个循环
  → 减少循环开销, 改善数据复用

交换 (Interchange):
  for (i) for (j) a[i][j] = ...   // 行优先
  → for (j) for (i) a[i][j] = ... // 列优先
  → 改善 C 语言的行主序访问模式`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 过程间优化 (IPA)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ipa.txt</div>
                <pre className="fs-code">{`═══ 函数内联 (Inlining) ═══

将函数调用替换为函数体:

  int square(int x) { return x * x; }
  
  int result = square(5);
  → int result = 5 * 5;
  → int result = 25;  (常量折叠!)

内联的好处:
  → 消除调用开销 (call/ret/压栈/出栈)
  → 暴露更多优化机会 (常量传播到函数体内)
  → 改善指令缓存局部性 (小函数)

内联的成本:
  → 代码体积膨胀
  → 编译时间增加
  → I-cache 压力

内联决策 (启发式):
  → 小函数 (热路径上 <100 条指令): 总是内联
  → 递归函数: 不内联 (或有限展开)
  → 虚函数/间接调用: 使用推测内联 (Speculative Inlining)
  → cold 函数: 不内联
  → 调用频率 (PGO Profile-Guided): 热路径优先内联

═══ 过程间常量传播 ═══

  void process(int n) {
    if (n > 0) { ... }
  }
  
  process(5);  // n 一定是 5 → if (5 > 0) → if (true)

跨函数传播常量, 简化被调用函数

═══ 逃逸分析 (Escape Analysis) ═══

分析对象是否逃逸出当前函数:
  → 不逃逸: 可以栈分配 (避免 GC!)
  → 逃逸到堆: 必须堆分配

Go 编译器的逃逸分析:
  func create() *User {
    u := User{Name: "Alice"}
    return &u               // u 逃逸到堆!
  }
  
  func local() int {
    u := User{Name: "Alice"}
    return u.Age            // u 不逃逸, 栈分配!
  }

═══ 链接时优化 (LTO) ═══

Link-Time Optimization:
  编译每个文件时保存 IR (而非目标代码)
  链接时合并所有 IR, 执行全程序优化

  clang -flto -O2 a.c b.c   // 生成 LLVM bitcode
  → 链接时合并, 跨文件内联/优化

ThinLTO:
  → 并行 LTO, 摘要信息指导优化
  → 编译速度接近非 LTO, 优化效果接近 Full LTO

═══ Profile-Guided Optimization (PGO) ═══

  1. 编译插桩版本: gcc -fprofile-generate -o app app.c
  2. 运行收集 profile: ./app < typical_input
  3. 使用 profile 重新编译: gcc -fprofile-use -o app app.c

PGO 可指导:
  → 分支预测 (likely/unlikely)
  → 内联决策 (热函数优先)
  → 基本块布局 (热路径连续)
  → 循环展开次数

效果: 通常 10-30% 性能提升
  → Rust 编译器自身用 PGO 编译!
  → Chrome/V8 也使用 PGO`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
