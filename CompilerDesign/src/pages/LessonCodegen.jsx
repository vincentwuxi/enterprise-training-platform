import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['指令选择', '寄存器分配', '指令调度', '目标代码'];

export default function LessonCodegen() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_06 — 代码生成</div>
      <div className="fs-hero">
        <h1>代码生成：寄存器分配 / 指令选择 / 目标代码</h1>
        <p>
          代码生成是编译器后端的核心——将中间表示转换为目标机器的汇编代码。
          <strong>指令选择</strong>把 IR 操作映射到机器指令，<strong>寄存器分配</strong>
          将无限虚拟寄存器映射到有限物理寄存器，<strong>指令调度</strong>
          重排指令以充分利用流水线并行。三者相互影响，是 NP-hard 问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 代码生成深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 指令选择 (Instruction Selection)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> isel.txt</div>
                <pre className="fs-code">{`═══ 指令选择的目标 ═══

将 IR 操作映射到目标机器指令:
  IR: t3 = t1 + t2
  x86: add eax, ebx
  ARM: ADD r0, r1, r2
  RISC-V: add a0, a1, a2

挑战:
  → 一对多: 一条 IR 可能需要多条机器指令
  → 多对一: 多条 IR 可以合并为一条复杂指令
  → 最优选择是 NP-hard

═══ 树模式匹配 (Tree Pattern Matching) ═══

将 IR 表达式树与指令模式进行匹配:

IR 树:
      STORE
      /    \\
    ADD     addr
   /   \\
  LOAD   const(4)
  |
  addr

模式匹配:
1. LOAD addr            → mov reg, [addr]
   ADD reg, const(4)    → add reg, 4
   STORE reg, addr      → mov [addr], reg

2. 复杂寻址模式 (x86):
   LOAD(ADD(base, MUL(index, scale)))
   → mov reg, [base + index*scale]   (一条指令!)

═══ BURG 算法 ═══

Bottom-Up Rewriting Grammar:
  使用动态规划找到最小代价的指令覆盖

  每个 IR 节点标注:
    → 每种匹配模式的代价
    → 选择代价最小的匹配

  代价模型:
    → 指令延迟 (cycles)
    → 代码大小 (bytes)
    → 寄存器压力
    → 加权组合

═══ 寻址模式选择 (x86) ═══

x86 支持丰富的寻址模式:
  [base]
  [base + disp]
  [base + index]
  [base + index*scale + disp]
  scale ∈ {1, 2, 4, 8}

  a[i] → [rax + rcx*4]         (数组访问)
  obj.field → [rbx + 16]       (字段访问)
  a[i].x → [rax + rcx*8 + 4]  (结构体数组)
  
  → 一条 mov 指令完成 "加载 base + 计算偏移"
  → RISC 架构需要多条指令

═══ LLVM 的指令选择 ═══

LLVM SelectionDAG:
  1. LLVM IR → SelectionDAG (有向无环图)
  2. 合法化 (Legalization): 不支持的类型/操作 → 拆分
     → i128 → 两个 i64
     → float → 软浮点函数调用 (无 FPU 时)
  3. 模式匹配: .td 文件定义指令模式
  4. 调度 + 发射: DAG → MachineInstr

LLVM GlobalISel (新一代):
  → 增量合法化 (比 SelectionDAG 更灵活)
  → 更好的编译速度`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 寄存器分配 (Register Allocation)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> regalloc.txt</div>
                <pre className="fs-code">{`═══ 问题定义 ═══

输入: 使用无限虚拟寄存器的 IR
输出: 使用有限物理寄存器的代码 + 必要的溢出 (spill)

物理寄存器数量:
  x86-64: 16 个通用寄存器 (rax, rbx, ..., r15)
  ARM64:  31 个通用寄存器 (x0-x30)
  RISC-V: 32 个通用寄存器 (x0-x31)

溢出 (Spill): 寄存器不够时, 变量存到栈上
  → 产生额外 load/store, 性能下降

═══ 活跃分析 (Liveness Analysis) ═══

变量的活跃范围: 从定义到最后一次使用

  t1 = a + b      ← t1 活跃开始
  t2 = c + d      ← t2 活跃开始
  t3 = t1 * t2    ← t1, t2 活跃结束; t3 活跃开始
  return t3        ← t3 活跃结束

同时活跃的变量不能共享寄存器!

═══ 图着色 (Graph Coloring) ═══

经典方法: Chaitin 算法

1. 构建干涉图 (Interference Graph):
   节点 = 变量 (虚拟寄存器)
   边   = 两个变量同时活跃 → 不能同色

2. 着色 = 分配寄存器
   K 色 = K 个物理寄存器
   
   问题: K-着色是 NP-hard!

3. 简化 (Simplify): 度数 < K 的节点可以安全着色
   → 移除该节点, 压入栈

4. 溢出 (Spill): 如果没有度数 < K 的节点
   → 选择一个变量溢出到栈
   → 启发式: 选择使用频率最低的

5. 着色 (Select): 从栈中弹出节点, 分配颜色
   → 邻居没用的颜色中选一个

═══ 线性扫描 (Linear Scan) ═══

更快但次优的方法 (JIT 编译器常用):

1. 计算所有变量的活跃区间 [start, end]
2. 按 start 排序
3. 顺序扫描, 尝试分配寄存器:
   → 释放已过期的寄存器
   → 如果有空闲寄存器 → 分配
   → 如果没有 → 溢出跨度最长的变量

  时间复杂度: O(n log n) vs 图着色 O(n²)
  → 适合 JIT 编译 (编译时间敏感)
  → LLVM 的 -O0 使用线性扫描
  → LLVM 的 -O2 使用图着色 (Greedy)

═══ 调用约定 (Calling Convention) ═══

x86-64 System V ABI:
  参数: rdi, rsi, rdx, rcx, r8, r9 (前6个整数参数)
  浮点: xmm0-xmm7
  返回: rax (整数), xmm0 (浮点)
  Caller-saved: rax, rcx, rdx, rsi, rdi, r8-r11
  Callee-saved: rbx, rbp, r12-r15

→ 寄存器分配器必须尊重调用约定!
  → 函数调用前后, caller-saved 寄存器可能被破坏
  → 需要在调用前保存, 调用后恢复`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⏱️ 指令调度 (Instruction Scheduling)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> scheduling.txt</div>
                <pre className="fs-code">{`═══ 为什么需要指令调度? ═══

现代 CPU 是流水线处理器:
  取指 → 译码 → 执行 → 访存 → 写回

数据依赖导致流水线暂停 (stall):
  load  r1, [addr]    // 延迟 3 cycle
  add   r2, r1, r3    // 等 r1! 暂停 2 cycle

调度后:
  load  r1, [addr]    // 延迟 3 cycle
  add   r4, r5, r6    // 无关操作, 填充延迟
  mul   r7, r8, r9    // 无关操作, 填充延迟
  add   r2, r1, r3    // r1 已就绪, 无暂停!

═══ 依赖类型 ═══

1. RAW (Read After Write) — 真依赖:
   add r1, r2, r3     // 写 r1
   mul r4, r1, r5     // 读 r1 → 必须等!

2. WAR (Write After Read) — 反依赖:
   mul r4, r1, r5     // 读 r1
   add r1, r2, r3     // 写 r1 → 可通过寄存器重命名消除

3. WAW (Write After Write) — 输出依赖:
   add r1, r2, r3     // 写 r1
   mul r1, r4, r5     // 写 r1 → 可通过重命名消除

注意: 现代 OoO (乱序) CPU 硬件自动处理依赖!
  → 指令调度对顺序 (in-order) 处理器更重要
  → 但对 OoO 也有帮助 (减少重命名压力、改善 I-cache)

═══ List Scheduling 算法 ═══

1. 构建依赖 DAG (Data Dependence Graph)
2. 计算每个节点的优先级 (启发式):
   → 关键路径长度 (ASAP 最晚开始时间)
   → 后继数量
3. 模拟时钟周期:
   → 每个周期, 从 ready 集合中选优先级最高的指令
   → 发射该指令
   → 更新依赖: 如果后继的所有前驱都已发射 → 加入 ready

═══ 调度 vs 寄存器分配的冲突 ═══

调度想: 指令间隔远 → 减少流水线暂停
寄存器分配想: 变量生存期短 → 减少溢出

两者矛盾!
  → 调度增加活跃变量数 → 需要更多寄存器
  → 寄存器压力限制调度自由度

解决:
  1. 先分配后调度 (先满足寄存器约束)
  2. 先调度后分配 (先优化性能)
  3. 集成 (Integrated): 同时考虑两者
  → LLVM: 先 pre-RA 调度, 寄存器分配, 再 post-RA 调度`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💻 目标代码</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> target_code.txt</div>
                <pre className="fs-code">{`═══ 汇编代码生成示例 ═══

C 源码:
  int add(int a, int b) {
    return a + b;
  }

x86-64 (System V ABI):
  add:
    lea eax, [rdi + rsi]   ; a 在 rdi, b 在 rsi, 结果在 eax
    ret

ARM64:
  add:
    add w0, w0, w1         ; a 在 w0, b 在 w1, 结果在 w0
    ret

RISC-V:
  add:
    add a0, a0, a1         ; a 在 a0, b 在 a1, 结果在 a0
    ret

═══ 栈帧布局 (Stack Frame) ═══

  高地址
  ┌──────────────────┐
  │ 调用者的帧       │
  ├──────────────────┤ ← 旧 rbp
  │ 返回地址         │ ← call 指令自动压入
  ├──────────────────┤ ← 新 rbp (如果使用帧指针)
  │ 保存的寄存器     │ callee-saved regs
  ├──────────────────┤
  │ 局部变量         │
  ├──────────────────┤
  │ 溢出位置 (spill) │
  ├──────────────────┤
  │ 对齐填充         │ 16 字节对齐
  ├──────────────────┤ ← rsp
  │ 参数传递区       │ 超过 6 个的参数
  └──────────────────┘
  低地址

函数序言 (Prologue):
  push rbp
  mov  rbp, rsp
  sub  rsp, 32         ; 分配栈空间

函数尾声 (Epilogue):
  mov  rsp, rbp
  pop  rbp
  ret

═══ 目标文件格式 ═══

ELF (Linux):
  .text    — 代码段 (可执行, 只读)
  .data    — 已初始化的全局变量
  .bss     — 未初始化的全局变量 (不占文件空间)
  .rodata  — 只读数据 (字符串常量等)
  .symtab  — 符号表
  .rel.text — 重定位信息

Mach-O (macOS):
  __TEXT,__text       — 代码
  __DATA,__data       — 数据
  __DATA_CONST,__const — 常量

═══ 重定位 (Relocation) ═══

编译时不知道的地址:
  → 外部函数: call printf  (地址未知)
  → 全局变量: mov rax, [global_var]
  → 字符串常量

重定位条目记录:
  → 需要修复的位置
  → 引用的符号名
  → 修复方式 (绝对/相对)

链接器负责:
  1. 解析符号引用 (找到定义)
  2. 修补重定位位置 (填入实际地址)
  3. 合并相同段 (.text + .text)
  4. 生成可执行文件

═══ 位置无关代码 (PIC) ═══

共享库 (.so/.dylib) 必须是 PIC:
  → 全局变量: 通过 GOT (Global Offset Table)
  → 函数调用: 通过 PLT (Procedure Linkage Table)
  → 引用自身: PC-relative 寻址

  x86-64 默认使用 RIP-relative 寻址
  → lea rax, [rip + offset]  (加载全局变量地址)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
