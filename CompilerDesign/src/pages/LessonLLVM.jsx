import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['🏗️ LLVM 架构', '📝 LLVM IR 详解', '🔧 Pass 开发', '🛠️ Clang & 工具链'];

export default function LessonLLVM() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_07 — LLVM 框架</div>
      <div className="fs-hero">
        <h1>LLVM 框架：IR / Pass / Clang / 自定义后端</h1>
        <p>
          LLVM 是现代编译器基础设施的<strong>事实标准</strong>——Clang (C/C++)、Rustc、Swift、
          Julia、Zig 的后端都基于 LLVM。理解 LLVM IR 和 Pass 框架，是进入编译器工业界的必修课。
        </p>
      </div>

      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', color:'#fda4af'}}><span>Clang</span><small>C/C++ 前端</small></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#fbbf24'}}><span>rustc</span><small>Rust 前端</small></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage active" style={{background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.4)', color:'#c4b5fd', boxShadow:'0 0 20px rgba(124,58,237,0.3)'}}><span>LLVM IR</span><small>统一中间表示</small></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9'}}><span>Pass Pipeline</span><small>优化</small></div>
        <span className="pipeline-arrow">→</span>
        <div className="pipeline-stage" style={{background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac'}}><span>后端</span><small>x86/ARM/RISC-V</small></div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ LLVM 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🏗️ LLVM 三层架构</h3>
            <div className="concept-card">
              <h4>LLVM 的核心设计: M × N → M + N</h4>
              <p>没有 LLVM：M 种语言 × N 种架构 = M×N 个编译器</p>
              <p>有了 LLVM：M 个前端 + N 个后端 = M+N 个组件</p>
            </div>

            <div className="fs-grid-3" style={{marginTop:'1rem'}}>
              <div className="fs-metric" style={{borderColor:'rgba(251,113,133,0.3)'}}>
                <div className="fs-metric-value" style={{color:'#fb7185'}}>前端</div>
                <div className="fs-metric-label">Source → LLVM IR</div>
                <p style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.5rem'}}>Clang, rustc, swiftc, flang</p>
              </div>
              <div className="fs-metric" style={{borderColor:'rgba(124,58,237,0.3)'}}>
                <div className="fs-metric-value" style={{color:'#a78bfa'}}>中端</div>
                <div className="fs-metric-label">IR 优化 (Pass Pipeline)</div>
                <p style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.5rem'}}>与语言/架构无关的通用优化</p>
              </div>
              <div className="fs-metric" style={{borderColor:'rgba(34,197,94,0.3)'}}>
                <div className="fs-metric-value" style={{color:'#4ade80'}}>后端</div>
                <div className="fs-metric-label">IR → Machine Code</div>
                <p style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.5rem'}}>x86, ARM, RISC-V, WASM, ...</p>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> llvm_ecosystem.txt</div>
              <pre className="fs-code">{`═══ 基于 LLVM 的语言/编译器 ═══

语言      │ 前端   │  特点
──────────┼────────┼──────────────────
C/C++     │ Clang  │  最成熟, 替代 GCC
Rust      │ rustc  │  MIR → LLVM IR
Swift     │ swiftc │  Apple 主推
Zig       │ zig    │  LLVM 后端可选
Julia     │ julia  │  JIT 编译
Fortran   │ flang  │  科学计算
CUDA      │ nvcc   │  使用 LLVM 优化

═══ LLVM 子项目 ═══
LLVM Core:  IR 定义 + 优化 Pass + 代码生成
Clang:      C/C++/ObjC 前端
LLD:        链接器 (替代 ld/gold)
LLDB:       调试器 (替代 GDB)
libc++:     C++ 标准库
compiler-rt: 运行时库 (sanitizers)
MLIR:       多层IR框架 (AI编译器用!)`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>📝 LLVM IR 详解</h3>
            <div className="concept-card">
              <h4>LLVM IR 三种形式</h4>
              <ul>
                <li><strong>.ll</strong> — 人类可读的文本形式（类似汇编）</li>
                <li><strong>.bc</strong> — 高效的二进制 bitcode</li>
                <li><strong>内存 C++ 对象</strong> — 编译器内部使用</li>
              </ul>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#4ade80'}}></span> fibonacci.ll — LLVM IR 示例</div>
              <pre className="fs-code">{`; LLVM IR 是强类型的 SSA 形式
; 每个值只有一个定义点 (% 变量)

define i32 @fibonacci(i32 %n) {
entry:
  %cmp = icmp sle i32 %n, 1          ; n <= 1 ?
  br i1 %cmp, label %base, label %loop.preheader

base:
  ret i32 %n                          ; return n

loop.preheader:
  br label %loop

loop:
  ; φ 函数: 合并不同路径的值
  %i   = phi i32 [2, %loop.preheader], [%i.next, %loop]
  %a   = phi i32 [0, %loop.preheader], [%b, %loop]
  %b   = phi i32 [1, %loop.preheader], [%sum, %loop]

  %sum    = add i32 %a, %b            ; fib(i) = a + b
  %i.next = add i32 %i, 1
  %done   = icmp sgt i32 %i.next, %n  ; i+1 > n ?
  br i1 %done, label %exit, label %loop

exit:
  ret i32 %sum
}`}</pre>
            </div>
            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> llvm_ir_types.txt</div>
              <pre className="fs-code">{`═══ LLVM IR 类型系统 ═══
i1, i8, i16, i32, i64  — 整数 (无符号/有符号由指令区分)
float, double           — 浮点
void                    — 无返回值
i8*                     — 指针 (LLVM 15+ 用 ptr)
[10 x i32]              — 数组
{i32, float}            — 结构体
<4 x float>             — SIMD 向量

═══ 常用指令 ═══
算术:  add, sub, mul, sdiv, srem, fadd, fmul
比较:  icmp eq/ne/sgt/slt/sge/sle, fcmp
内存:  alloca, load, store, getelementptr (GEP)
控制:  br, switch, ret, call, invoke
转换:  zext, sext, trunc, bitcast, inttoptr
SSA:   phi

═══ LLVM 命令行工具 ═══
clang -emit-llvm -S file.c -o file.ll   ← C → IR
opt -O2 file.ll -o opt.ll               ← 优化 IR
llc file.ll -o file.s                   ← IR → 汇编
lli file.ll                              ← IR 解释执行`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🔧 LLVM Pass 开发</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> my_pass.cpp — 自定义 LLVM Pass</div>
              <pre className="fs-code">{`// ═══ LLVM New Pass Manager (LLVM 14+) ═══
#include "llvm/Passes/PassBuilder.h"
#include "llvm/Passes/PassPlugin.h"

struct MyCountPass : public PassInfoMixin<MyCountPass> {
  PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM) {
    unsigned instCount = 0;
    unsigned bbCount = 0;

    for (BasicBlock &BB : F) {
      bbCount++;
      for (Instruction &I : BB) {
        instCount++;
        // 检查是否是乘以 2 → 可以优化为左移
        if (auto *BO = dyn_cast<BinaryOperator>(&I)) {
          if (BO->getOpcode() == Instruction::Mul) {
            if (auto *C = dyn_cast<ConstantInt>(BO->getOperand(1))) {
              if (C->getValue() == 2) {
                // 替换 x * 2 → x << 1
                auto *Shl = BinaryOperator::Create(
                    Instruction::Shl, BO->getOperand(0),
                    ConstantInt::get(C->getType(), 1));
                BO->replaceAllUsesWith(Shl);
                Shl->insertBefore(BO);
              }
            }
          }
        }
      }
    }

    errs() << F.getName() << ": "
           << bbCount << " blocks, "
           << instCount << " instructions\\n";
    return PreservedAnalyses::all();
  }
};

// 注册插件
extern "C" LLVM_ATTRIBUTE_WEAK PassPluginLibraryInfo
llvmGetPassPluginInfo() {
  return {LLVM_PLUGIN_API_VERSION, "MyPass", "v0.1",
    [](PassBuilder &PB) {
      PB.registerPipelineParsingCallback(
        [](StringRef Name, FunctionPassManager &FPM, ...) {
          if (Name == "my-count") {
            FPM.addPass(MyCountPass());
            return true;
          }
          return false;
        });
    }};
}

// 编译 & 运行:
// clang++ -shared -o MyPass.so MyPass.cpp $(llvm-config --cxxflags --ldflags)
// opt -load-pass-plugin=./MyPass.so -passes=my-count input.ll`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>🛠️ Clang 编译流水线</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> clang_pipeline.txt</div>
              <pre className="fs-code">{`═══ Clang 完整编译流程 ═══

hello.c → [预处理] → [词法分析] → [语法分析]
        → [语义分析] → [LLVM IR 生成] → [优化]
        → [代码生成] → [汇编] → [链接] → a.out

查看每个阶段:
  clang -E  hello.c          # 预处理 → 展开 #include/#define
  clang -fsyntax-only hello.c # 语法检查
  clang -emit-llvm -S hello.c # → LLVM IR (.ll)
  clang -S hello.c            # → 汇编 (.s)
  clang -c hello.c            # → 目标文件 (.o)
  clang hello.c               # → 可执行文件 (a.out)

═══ Clang AST ═══
  clang -Xclang -ast-dump hello.c
  → 查看 Clang 的完整 AST

═══ MLIR — 多层 IR 框架 (AI 编译器) ═══

传统: Source → AST → LLVM IR → Machine Code

MLIR: Source → AST → High-Level Dialect
                   → Affine/Linalg Dialect
                   → GPU/Async Dialect
                   → LLVM Dialect → Machine Code

用于:
  • TensorFlow (XLA/IREE)
  • PyTorch (torch-mlir)
  • AI 加速器编译 (TPU/NPU)

═══ 编译器领域职业方向 ═══
1. 前端工程师: 语言设计/Parser/类型检查
2. 中端优化: LLVM Pass/分析/向量化
3. 后端/代码生成: 指令选择/寄存器分配
4. AI 编译器: MLIR/XLA/TVM (最热门!)
5. JIT: V8 TurboFan/SpiderMonkey/LuaJIT`}</pre>
            </div>
            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>AI 编译器 (MLIR/XLA/TVM)</strong> 是当前最热门的编译器方向——
              将深度学习计算图编译为 GPU/TPU/NPU 的高效指令。起薪极高！
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
