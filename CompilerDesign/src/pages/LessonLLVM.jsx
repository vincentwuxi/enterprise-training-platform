import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['LLVM IR', 'Pass 框架', 'Clang 前端', '自定义后端'];

export default function LessonLLVM() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_07 — LLVM 框架</div>
      <div className="fs-hero">
        <h1>LLVM 框架：IR / Pass / Clang / 自定义后端</h1>
        <p>
          LLVM 是现代编译器基础设施的<strong>事实标准</strong>——
          Clang (C/C++/ObjC)、Rust、Swift、Julia、Zig 等语言都基于 LLVM。
          其核心是精心设计的 SSA 形式 IR、模块化的 Pass 管线、
          以及完整的后端代码生成框架 (TableGen + SelectionDAG)。
          理解 LLVM 是掌握工业级编译器工程的必修课。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ LLVM 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 LLVM IR 详解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> llvm_ir.ll</div>
                <pre className="fs-code">{`; ═══ LLVM IR 三种表示 ═══
; 1. 文本格式 (.ll): 人类可读, 本文件
; 2. 二进制格式 (.bc): 紧凑二进制 (bitcode)
; 3. 内存表示: C++ 对象图 (编译器内部)
;
; 生成: clang -S -emit-llvm hello.c -o hello.ll
; 编译: llc hello.ll -o hello.s
; 执行: lli hello.ll  (JIT 解释执行)

; ═══ 模块结构 ═══
; 目标三元组: 架构-供应商-操作系统
target datalayout = "e-m:o-i64:64-i128:128-n32:64-S128"
target triple = "arm64-apple-macosx14.0.0"

; ═══ 全局变量 ═══
@greeting = private unnamed_addr constant [14 x i8] c"Hello, LLVM!\\0A\\00"
@counter = global i32 0, align 4

; ═══ 类型系统 ═══
; 整数: i1 (bool), i8, i16, i32, i64, i128
; 浮点: half, float, double
; 指针: ptr (opaque pointer, LLVM 15+)
; 数组: [10 x i32]
; 结构体: { i32, ptr, [4 x float] }
; 向量: <4 x float>  (SIMD)
; 函数: i32 (i32, i32)
; void: void

; ═══ 结构体定义 ═══
%struct.Point = type { double, double }
%struct.Node = type { i32, ptr }  ; 链表节点

; ═══ 函数定义 ═══
define i32 @add(i32 %a, i32 %b) {
entry:
  %sum = add nsw i32 %a, %b       ; nsw = no signed wrap
  ret i32 %sum
}

; ═══ 控制流 ═══
define i32 @max(i32 %a, i32 %b) {
entry:
  %cmp = icmp sgt i32 %a, %b      ; signed greater than
  br i1 %cmp, label %then, label %else

then:
  br label %merge

else:
  br label %merge

merge:
  %result = phi i32 [ %a, %then ], [ %b, %else ]
  ret i32 %result
}

; ═══ 循环 ═══
define i32 @sum_to_n(i32 %n) {
entry:
  br label %loop

loop:
  %i = phi i32 [ 0, %entry ], [ %i.next, %loop ]
  %sum = phi i32 [ 0, %entry ], [ %sum.next, %loop ]
  %sum.next = add i32 %sum, %i
  %i.next = add i32 %i, 1
  %cond = icmp slt i32 %i.next, %n
  br i1 %cond, label %loop, label %exit

exit:
  ret i32 %sum.next
}

; ═══ 内存操作 ═══
define void @memory_demo() {
entry:
  ; 栈分配
  %x = alloca i32, align 4
  store i32 42, ptr %x, align 4
  %val = load i32, ptr %x, align 4

  ; GEP: GetElementPtr — 地址计算 (不访问内存!)
  %arr = alloca [10 x i32], align 4
  %elem_ptr = getelementptr [10 x i32], ptr %arr, i64 0, i64 3
  ; → &arr[3] — 注意两个索引: 第一个解引用指针, 第二个是数组下标

  ; 结构体访问
  %pt = alloca %struct.Point, align 8
  %y_ptr = getelementptr %struct.Point, ptr %pt, i64 0, i32 1
  ; → &pt.y — i32 1 表示第二个字段 (下标1)

  ret void
}

; ═══ 关键 IR 特性 ═══
; 1. SSA 形式: 每个变量只赋值一次
; 2. 强类型: 每条指令都有显式类型
; 3. 无限虚拟寄存器: %0, %1, %name
; 4. phi 节点: 处理控制流汇合
; 5. GEP: 类型安全的地址计算
; 6. 属性: nonnull, noalias, readonly (辅助优化)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 Pass 框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> pass_framework.cpp</div>
                <pre className="fs-code">{`// ═══ LLVM Pass 管线 (New Pass Manager, LLVM 14+) ═══
//
// Pass: 接收 IR → 分析或变换 → 输出修改后的 IR
// 模块化设计: 每个优化是独立的 Pass, 可自由组合
//
// Pass 类型:
//   ModulePass:   处理整个模块 (跨函数分析)
//   FunctionPass: 处理单个函数 (最常用)
//   LoopPass:     处理单个循环
//   CGSCCPass:    处理调用图的强连通分量

// ═══ 自定义 Pass 示例 (New PM) ═══
#include "llvm/IR/PassManager.h"
#include "llvm/Passes/PassBuilder.h"
#include "llvm/Passes/PassPlugin.h"

struct MyFunctionPass : public llvm::PassInfoMixin<MyFunctionPass> {
    llvm::PreservedAnalyses run(
        llvm::Function &F,
        llvm::FunctionAnalysisManager &AM
    ) {
        // 遍历函数中的每个基本块
        for (auto &BB : F) {
            // 遍历基本块中的每条指令
            for (auto &I : BB) {
                // 常量折叠: 如果两个操作数都是常量
                if (auto *BinOp = dyn_cast<BinaryOperator>(&I)) {
                    auto *LHS = dyn_cast<ConstantInt>(BinOp->getOperand(0));
                    auto *RHS = dyn_cast<ConstantInt>(BinOp->getOperand(1));
                    if (LHS && RHS) {
                        // 在编译时计算结果
                        int64_t Result;
                        switch (BinOp->getOpcode()) {
                        case Instruction::Add:
                            Result = LHS->getSExtValue() + RHS->getSExtValue();
                            break;
                        // ... 其他运算
                        }
                        auto *Const = ConstantInt::get(BinOp->getType(), Result);
                        BinOp->replaceAllUsesWith(Const);
                    }
                }
            }
        }
        return PreservedAnalyses::none();  // IR 已修改
    }
};

// ═══ 注册为插件 ═══
extern "C" LLVM_ATTRIBUTE_WEAK
::llvm::PassPluginLibraryInfo llvmGetPassPluginInfo() {
    return {
        LLVM_PLUGIN_API_VERSION, "MyPass", "0.1",
        [](PassBuilder &PB) {
            PB.registerPipelineParsingCallback(
                [](StringRef Name, FunctionPassManager &FPM, ...) {
                    if (Name == "my-pass") {
                        FPM.addPass(MyFunctionPass());
                        return true;
                    }
                    return false;
                });
        }
    };
}

// ═══ 使用 Pass ═══
// 编译 Pass:
//   cmake + LLVM development headers
//
// 运行自定义 Pass:
//   opt -load-pass-plugin=./MyPass.so \\
//       -passes="my-pass" input.ll -o output.ll
//
// 查看 LLVM 内置 Pass:
//   opt --print-passes
//
// 常见 Pass 管线:
//   -O0: 几乎不优化 (mem2reg + 基本清理)
//   -O1: 基本优化 (内联 + DCE + CSE)
//   -O2: 标准优化 (循环优化 + GVN + vectorization)
//   -O3: 激进优化 (-O2 + 更多内联 + 循环展开)
//   -Os: 体积优化 (-O2 but 不增加代码大小)
//   -Oz: 极致体积

// ═══ 分析 Pass ═══
// 不修改 IR, 计算辅助信息供优化 Pass 使用:
// DominatorTreeAnalysis    — 支配树
// LoopAnalysis             — 循环信息
// ScalarEvolutionAnalysis  — 标量演化 (循环计数)
// AliasAnalysis            — 别名分析
// MemorySSAAnalysis        — 内存 SSA (load/store 依赖)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔨 Clang 前端</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> clang_frontend.txt</div>
                <pre className="fs-code">{`═══ Clang 编译流程 ═══

  源码 (.c/.cpp)
    │
    ▼  预处理 (Preprocessor)
  展开宏/include → 预处理后的源码
    │
    ▼  词法分析 (Lexer)
  Token 流
    │
    ▼  语法分析 (Parser) — 递归下降
  AST (Clang AST)
    │
    ▼  语义分析 (Sema)
  带类型标注的 AST
    │
    ▼  IR 生成 (CodeGen)
  LLVM IR (.ll)
    │
    ▼  LLVM 优化 Pass 管线
  优化后的 LLVM IR
    │
    ▼  后端代码生成 (llc)
  目标汇编 (.s) 或目标文件 (.o)
    │
    ▼  链接 (ld/lld)
  可执行文件

═══ Clang AST 查看 ═══

clang -Xclang -ast-dump -fsyntax-only hello.c

输出示例:
FunctionDecl 0x... <line:1:1, line:4:1> line:1:5 main 'int ()'
|-CompoundStmt 0x... <col:12, line:4:1>
| |-DeclStmt 0x... <line:2:3, col:14>
| | \`-VarDecl 0x... <col:3, col:13> col:7 used x 'int' cinit
| |   \`-IntegerLiteral 0x... <col:11> 'int' 42
| \`-ReturnStmt 0x... <line:3:3, col:10>
|   \`-ImplicitCastExpr <col:10> 'int'
|     \`-DeclRefExpr 0x... <col:10> 'int' lvalue Var 'x'

═══ 使用 Clang 作为库 (LibTooling) ═══

用途:
  → 代码分析工具 (静态分析, Lint)
  → 代码重构工具 (自动重命名, 格式化)
  → 源到源转换
  → 文档生成

// clang-tidy: 静态分析框架
// clang-format: 代码格式化
// clangd: LSP 语言服务器

═══ Clang 的诊断系统 ═══

优质错误信息的设计:
  → 精确的源码位置 (行号+列号)
  → 修复建议 (Fix-it hints)
  → 上下文插入标记 (^~~~)
  → 宏展开链的完整追溯

示例:
  error: use of undeclared identifier 'pritnf'
    pritnf("hello");
    ^~~~~~
    printf

  note: candidate function not viable:
        no known conversion from 'int' to 'const char *'
        for 1st argument

对比 GCC:
  GCC 诊断也在改进, 但 Clang 的设计理念:
  → 每条诊断信息都是自包含的
  → 用户不需要去 StackOverflow 查错

═══ Clang 的特殊能力 ═══

1. 增量编译: 预编译头 (PCH) / 模块 (Modules)
2. 模糊解析: 即使有错误也产生有用的 AST
3. 完整预处理: 追踪宏展开和 #include 链
4. 交叉编译: 内置所有目标架构支持
5. 插件系统: 自定义 AST 检查 (类似 Lint)
6. JIT: 通过 LLVM ORC JIT 运行时编译`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 自定义后端与生态</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> backend.txt</div>
                <pre className="fs-code">{`═══ LLVM 后端流水线 ═══

  LLVM IR
    │
    ▼  指令选择 (SelectionDAG / GlobalISel)
  MachineInstr (虚拟寄存器)
    │
    ▼  寄存器分配 (Greedy / Fast)
  MachineInstr (物理寄存器)
    │
    ▼  指令调度 (Post-RA Scheduler)
  调度后的 MachineInstr
    │
    ▼  代码发射 (MCInst → AsmPrinter / ObjectWriter)
  汇编 (.s) 或目标文件 (.o)

═══ TableGen — 目标描述语言 ═══

LLVM 使用 .td 文件声明式描述目标架构:

// 寄存器定义
def GPR : RegisterClass<"MyArch", [i32], 32,
    (add R0, R1, R2, R3, R4, R5, R6, R7)>;

def R0 : Register<"r0">;
def R1 : Register<"r1">;
// ...

// 指令定义
def ADDrr : Instruction {
  let Opcode = 0x01;
  dag OutOperandList = (outs GPR:$dst);
  dag InOperandList = (ins GPR:$src1, GPR:$src2);
  let AsmString = "add $dst, $src1, $src2";
  // 模式匹配: LLVM IR add → 此指令
  let Pattern = [(set GPR:$dst, (add GPR:$src1, GPR:$src2))];
}

def ADDri : Instruction {
  let Pattern = [(set GPR:$dst, (add GPR:$src, imm:$val))];
  let AsmString = "addi $dst, $src, $val";
}

→ TableGen 自动生成:
  → 指令编码 / 解码器
  → 汇编解析器
  → 指令选择匹配表
  → 寄存器分配约束

═══ 添加自定义后端的步骤 ═══

1. 创建目标目录: llvm/lib/Target/MyArch/
2. 定义寄存器: MyArchRegisterInfo.td
3. 定义指令集: MyArchInstrInfo.td
4. 定义调用约定: MyArchCallingConv.td
5. 实现 SelectionDAG Lowering
6. 实现 AsmPrinter
7. 实现 MCInstLowering (MachineInstr → MCInst)
8. 注册目标: TargetRegistry

工作量: 约 5000-20000 行代码 (取决于 ISA 复杂度)

═══ 基于 LLVM 的语言 ═══

Rust (rustc):
  → 前端: Rust → HIR → MIR
  → 后端: MIR → LLVM IR → 机器码
  → 关键: 借用检查在 MIR 阶段完成

Swift:
  → 前端: Swift → SIL (Swift IL)
  → SIL 优化 (ARC, 泛型特化, 逃逸分析)
  → SIL → LLVM IR → 机器码

Julia:
  → JIT 编译: Julia AST → Julia IR → LLVM IR
  → LLVM MCJIT 执行

Zig:
  → 自举编译器, 直接生成 LLVM IR
  → 也有实验性的自前端到后端 (不依赖 LLVM)

═══ LLVM 工具链 ═══

opt:    IR 级优化器
llc:    IR → 机器码 (后端)
lli:    IR JIT 执行
llvm-as / llvm-dis: .ll ↔ .bc 转换
llvm-link: 链接多个 .bc
llvm-objdump: 反汇编
llvm-mc: 汇编器
lld:    链接器
lldb:   调试器

═══ MLIR — 下一代编译器框架 ═══
Multi-Level IR: 支持在不同抽象层次上表示和优化
→ 用于 ML 编译器 (TensorFlow, PyTorch)
→ 高级方言: linalg, tensor, affine
→ 逐步从高级 IR 合法化到 LLVM IR`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
