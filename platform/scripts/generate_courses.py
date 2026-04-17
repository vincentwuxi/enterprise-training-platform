#!/usr/bin/env python3
"""Batch-generate 12 missing courses with manifests + JSX lesson files."""

import json, os, textwrap

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

COURSES = [
    {
        "dir": "DiscreteMath",
        "id": "discrete-math",
        "title": "🔢 离散数学 — 逻辑·集合·图论·组合",
        "description": "从命题逻辑到图论算法，掌握计算机科学的数学基石。覆盖集合论、关系、函数、递推、计数、图的遍历与最短路径、树与网络流。含交互式图论 playground 与组合计数器。",
        "category": "数学基础",
        "level": "中级",
        "totalHours": 32,
        "gradient": ["#f59e0b", "#ef4444"],
        "modules": [
            ("logic-prop", "模块一：命题逻辑 — 联结词 / 真值表 / 等价重写", "LessonPropLogic",
             "命题与谓词", ["联结词与真值表", "逻辑等价与化简", "推理规则", "谓词逻辑基础"],
             "掌握命题逻辑的基本联结词、真值表构造和等价重写规则"),
            ("sets-relations", "模块二：集合与关系 — 集合运算 / 等价关系 / 偏序", "LessonSetsRelations",
             "集合与关系", ["集合运算与 Venn 图", "笛卡尔积与关系", "等价关系与等价类", "偏序与哈斯图"],
             "理解集合运算、关系的分类与偏序结构"),
            ("functions-seq", "模块三：函数与序列 — 函数类型 / 递推 / 生成函数", "LessonFunctionsSeq",
             "函数与序列", ["单射/满射/双射", "递推关系", "特征方程法", "生成函数入门"],
             "掌握函数分类、递推关系的求解方法"),
            ("counting", "模块四：计数与组合 — 排列 / 组合 / 容斥原理", "LessonCounting",
             "计数与组合", ["排列与组合公式", "多重集排列", "容斥原理", "鸽巢原理与 Ramsey"],
             "掌握计数的基本方法和容斥原理"),
            ("graph-basics", "模块五：图论基础 — 图的表示 / 遍历 / 连通性", "LessonGraphBasics",
             "图论基础", ["图的定义与表示", "BFS 与 DFS", "连通分量", "欧拉图与哈密顿图"],
             "掌握图的基本概念与遍历算法"),
            ("graph-algos", "模块六：图论算法 — 最短路径 / 最小生成树 / 着色", "LessonGraphAlgos",
             "图论算法", ["Dijkstra 算法", "Kruskal / Prim MST", "图着色问题", "平面图与 Kuratowski"],
             "掌握经典图论算法的原理与实现"),
            ("trees-networks", "模块七：树与网络流 — 树的遍历 / 最大流 / 匹配", "LessonTreesNetworks",
             "树与网络流", ["树的基本性质", "生成树与计数", "最大流-最小割", "二部图匹配"],
             "理解树结构和网络流的核心算法"),
            ("boolean-crypto", "模块八：布尔代数与应用 — 逻辑门 / 编码 / 密码学基础", "LessonBooleanCrypto",
             "布尔与应用", ["布尔代数与化简", "数字电路基础", "纠错编码", "RSA 密码学入门"],
             "理解离散数学在计算机科学中的实际应用"),
        ]
    },
    {
        "dir": "InformationTheory",
        "id": "information-theory",
        "title": "📡 信息论与编码 — 从香农到深度学习",
        "description": "信息论是通信与机器学习的理论基石。系统讲解熵、互信息、信道容量、率失真理论、Huffman/LZ 编码、纠错码与信息论在深度学习中的应用（交叉熵、KL 散度、ELBO）。",
        "category": "数学基础",
        "level": "中级到高级",
        "totalHours": 28,
        "gradient": ["#06b6d4", "#3b82f6"],
        "modules": [
            ("entropy", "模块一：信息与熵 — 自信息 / 香农熵 / 联合熵 / 条件熵", "LessonEntropy",
             "信息与熵", ["信息的度量", "香农熵公式", "联合熵与条件熵", "熵的性质与链式法则"],
             "理解信息的数学度量方式和熵的核心概念"),
            ("mutual-info", "模块二：互信息与 KL 散度 — 信道模型 / 数据处理不等式", "LessonMutualInfo",
             "互信息", ["互信息定义", "KL 散度", "数据处理不等式", "Fano 不等式"],
             "掌握互信息和 KL 散度的计算与意义"),
            ("source-coding", "模块三：信源编码 — Huffman / 算术编码 / LZ 系列", "LessonSourceCoding",
             "信源编码", ["无损压缩界", "Huffman 编码", "算术编码", "LZ77/LZ78/DEFLATE"],
             "掌握无损压缩的核心算法"),
            ("channel-capacity", "模块四：信道容量 — BSC / BEC / 高斯信道 / 香农极限", "LessonChannelCapacity",
             "信道容量", ["信道模型", "信道容量计算", "香农第二定理", "高斯信道容量"],
             "理解信道容量的计算和香农极限"),
            ("error-correction", "模块五：纠错编码 — 汉明码 / Reed-Solomon / LDPC / Polar", "LessonErrorCorrection",
             "纠错编码", ["汉明距离", "汉明码", "RS 编码", "LDPC 与 Polar 码"],
             "掌握纠错编码的理论与实现"),
            ("rate-distortion", "模块六：率失真理论 — 有损压缩 / 量化 / VQ", "LessonRateDistortion",
             "率失真理论", ["率失真函数", "量化理论", "矢量量化", "变换编码"],
             "理解有损压缩的理论极限"),
            ("info-ml", "模块七：信息论与机器学习 — 交叉熵 / ELBO / InfoNCE", "LessonInfoML",
             "信息论与 ML", ["交叉熵损失", "变分推断与 ELBO", "InfoNCE 与对比学习", "互信息最大化"],
             "将信息论核心概念与深度学习实践连接"),
            ("info-project", "模块八：实战项目 — 文本压缩引擎 + 信道模拟器", "LessonInfoProject",
             "实战项目", ["Huffman 压缩器", "信道噪声模拟", "BER 分析", "对比学习实验"],
             "完成两个综合实战项目"),
        ]
    },
    {
        "dir": "Optimization",
        "id": "optimization-methods",
        "title": "🎯 最优化方法 — 从梯度下降到凸优化",
        "description": "最优化是机器学习的引擎。覆盖梯度下降族、凸优化理论、约束优化(KKT)、线性规划/整数规划、随机优化(SGD/Adam)、进化算法与自动微分。含交互式优化轨迹可视化。",
        "category": "数学基础",
        "level": "中级",
        "totalHours": 30,
        "gradient": ["#10b981", "#059669"],
        "modules": [
            ("unconstrained", "模块一：无约束优化 — 梯度下降 / 牛顿法 / 拟牛顿法", "LessonUnconstrained",
             "无约束优化", ["梯度方向与步长", "牛顿法", "BFGS 拟牛顿法", "共轭梯度法"],
             "掌握梯度下降族算法的原理与收敛性"),
            ("convex", "模块二：凸优化基础 — 凸集 / 凸函数 / 对偶理论", "LessonConvex",
             "凸优化基础", ["凸集与凸函数", "一阶/二阶条件", "对偶问题", "强对偶与 Slater 条件"],
             "建立凸优化的理论基础"),
            ("constrained", "模块三：约束优化 — KKT 条件 / 拉格朗日乘子 / SQP", "LessonConstrained",
             "约束优化", ["等式约束与拉格朗日", "不等式约束与 KKT", "增广拉格朗日", "序列二次规划"],
             "掌握经典约束优化方法"),
            ("linear-prog", "模块四：线性规划 — 单纯形法 / 对偶 / 灵敏度分析", "LessonLinearProg",
             "线性规划", ["标准形式", "单纯形法", "对偶线性规划", "灵敏度分析"],
             "掌握线性规划的理论与单纯形法"),
            ("stochastic-opt", "模块五：随机优化 — SGD / Momentum / Adam / Learning Rate", "LessonStochasticOpt",
             "随机优化", ["SGD 与 Mini-batch", "Momentum 与 Nesterov", "Adam/AdaGrad/RMSProp", "学习率调度"],
             "掌握深度学习中最核心的优化器"),
            ("integer-comb", "模块六：整数与组合优化 — 分支定界 / 启发式 / TSP", "LessonIntegerComb",
             "组合优化", ["整数规划", "分支定界法", "TSP 与近似算法", "贪心与局部搜索"],
             "理解 NP-hard 问题的求解策略"),
            ("evolutionary", "模块七：进化算法 — 遗传算法 / 粒子群 / 贝叶斯优化", "LessonEvolutionary",
             "进化算法", ["遗传算法框架", "粒子群优化", "模拟退火", "贝叶斯优化"],
             "掌握无梯度优化方法"),
            ("autodiff", "模块八：自动微分与实战 — PyTorch Autograd / JAX", "LessonAutodiff",
             "自动微分", ["前向 vs 反向模式", "计算图构建", "PyTorch autograd", "JAX 与函数变换"],
             "理解自动微分的原理并用 PyTorch 实战"),
        ]
    },
    {
        "dir": "NumericalComputing",
        "id": "numerical-computing",
        "title": "🔬 数值计算 — 从浮点数到科学模拟",
        "description": "掌握数值分析的核心方法：浮点运算、插值拟合、数值积分、ODE/PDE 求解器、FFT、稀疏矩阵、并行计算。用 NumPy/SciPy/CuPy 实现科学计算实战。为物理模拟和 AI 计算打下坚实基础。",
        "category": "数学基础",
        "level": "中级到高级",
        "totalHours": 28,
        "gradient": ["#a855f7", "#6366f1"],
        "modules": [
            ("floating-point", "模块一：浮点数与误差 — IEEE 754 / 舍入误差 / 数值稳定性", "LessonFloatingPoint",
             "浮点数与误差", ["IEEE 754 标准", "机器精度", "舍入误差传播", "数值稳定性分析"],
             "理解浮点数的陷阱和误差控制"),
            ("linear-systems", "模块二：线性方程组 — LU 分解 / Cholesky / 迭代法", "LessonLinearSystems",
             "线性方程组", ["高斯消元与 LU", "Cholesky 分解", "Jacobi/Gauss-Seidel", "共轭梯度法"],
             "掌握线性方程组的直接法和迭代法"),
            ("interpolation", "模块三：插值与拟合 — Lagrange / 样条 / 最小二乘", "LessonInterpolation",
             "插值与拟合", ["Lagrange 插值", "Newton 差商", "三次样条", "最小二乘拟合"],
             "掌握数据插值与曲线拟合方法"),
            ("integration", "模块四：数值积分 — 梯形法 / Simpson / Gauss 求积", "LessonIntegration",
             "数值积分", ["复合梯形法", "Simpson 法则", "Gauss 求积", "自适应积分"],
             "掌握数值积分的核心算法"),
            ("ode-solvers", "模块五：常微分方程 — Euler / RK4 / 刚性问题 / 自适应步长", "LessonODESolvers",
             "ODE 求解器", ["Euler 法", "Runge-Kutta 族", "刚性问题与隐式方法", "自适应步长控制"],
             "掌握 ODE 数值求解的核心方法"),
            ("fft-spectral", "模块六：FFT 与频谱分析 — DFT / FFT / 卷积定理", "LessonFFTSpectral",
             "FFT 与频谱", ["离散傅里叶变换", "快速 FFT 算法", "频谱分析", "卷积与滤波"],
             "掌握 FFT 算法及其在信号处理中的应用"),
            ("sparse-eigen", "模块七：稀疏矩阵与特征值 — CSR / 幂迭代 / SVD 截断", "LessonSparseEigen",
             "稀疏矩阵", ["稀疏存储格式", "幂迭代法", "QR 算法", "截断 SVD"],
             "掌握大规模稀疏矩阵的高效运算"),
            ("parallel-sim", "模块八：并行计算与科学模拟 — NumPy / CuPy / PDE 模拟", "LessonParallelSim",
             "并行与模拟", ["向量化运算", "CuPy GPU 加速", "PDE 有限差分", "流体/热传导模拟"],
             "用 Python 实现高性能科学模拟"),
        ]
    },
    {
        "dir": "GitMastery",
        "id": "git-mastery",
        "title": "🔀 Git 版本控制精通 — 从入门到团队协作",
        "description": "全面掌握 Git 版本控制：从基础操作到高级技巧——分支策略、Rebase vs Merge、Submodule/Subtree、Monorepo 管理、Git Hooks、CI/CD 集成。涵盖 GitHub/GitLab 协作流程与代码审查最佳实践。",
        "category": "编程与开发",
        "level": "初级到高级",
        "totalHours": 20,
        "gradient": ["#f97316", "#dc2626"],
        "modules": [
            ("git-basics", "模块一：Git 基础 — 仓库 / 暂存区 / 提交 / 历史", "LessonGitBasics",
             "Git 基础", ["git init/clone/add/commit", "工作区/暂存区/仓库", ".gitignore 策略", "git log 与历史浏览"],
             "掌握 Git 的核心概念和基本操作"),
            ("branching", "模块二：分支与合并 — 分支策略 / Merge / Rebase / Cherry-pick", "LessonBranching",
             "分支与合并", ["创建与切换分支", "Fast-forward vs 三方合并", "Rebase 工作流", "Cherry-pick 与冲突解决"],
             "掌握分支管理和合并策略"),
            ("remote-collab", "模块三：远程协作 — Push / Pull / Fork / PR / Code Review", "LessonRemoteCollab",
             "远程协作", ["Remote 配置与管理", "Pull Request 流程", "Code Review 最佳实践", "Fork 与上游同步"],
             "掌握团队协作的 Git 工作流"),
            ("advanced-ops", "模块四：高级操作 — Stash / Reset / Reflog / Bisect / Blame", "LessonAdvancedOps",
             "高级操作", ["git stash 临时保存", "reset --soft/mixed/hard", "reflog 灾难恢复", "bisect 二分查 bug"],
             "掌握 Git 的高级调试与恢复技巧"),
            ("git-flow", "模块五：分支策略 — Git Flow / GitHub Flow / Trunk-Based", "LessonGitFlow",
             "分支策略", ["Git Flow 模型", "GitHub Flow", "Trunk-Based Development", "Release 分支管理"],
             "选择适合团队的分支策略"),
            ("hooks-ci", "模块六：Git Hooks 与 CI/CD — Pre-commit / Lint / 自动化", "LessonHooksCI",
             "Hooks 与 CI", ["客户端 Hooks", "husky + lint-staged", "GitHub Actions", "GitLab CI 集成"],
             "用 Git Hooks 实现自动化质量保障"),
            ("monorepo", "模块七：Monorepo 与大型仓库 — Submodule / Subtree / Nx / Turborepo", "LessonMonorepo",
             "Monorepo", ["Submodule 管理", "Subtree 合并", "Nx/Turborepo 工具", "大仓性能优化"],
             "掌握大型代码库的 Git 管理策略"),
            ("git-internals", "模块八：Git 内部原理 — 对象模型 / Packfile / 自定义命令", "LessonGitInternals",
             "Git 内部原理", ["Blob/Tree/Commit 对象", "SHA-1 内容寻址", "Packfile 与 Delta", "自定义 Git 命令"],
             "深入理解 Git 的存储和实现机制"),
        ]
    },
    {
        "dir": "GoLangEngineering",
        "id": "golang-engineering",
        "title": "🐹 Go 语言工程实战 — 并发·微服务·云原生",
        "description": "系统学习 Go 语言：从语法基础到高性能工程实践。覆盖 goroutine 并发模型、Channel 通信、标准库深度使用、gRPC 微服务、数据库操作、性能调优与 Docker/K8s 云原生部署。",
        "category": "编程与开发",
        "level": "中级",
        "totalHours": 36,
        "gradient": ["#00add8", "#00758d"],
        "modules": [
            ("go-basics", "模块一：Go 基础 — 类型系统 / 函数 / 错误处理 / 包管理", "LessonGoBasics",
             "Go 基础", ["变量与类型系统", "函数与闭包", "error 处理哲学", "Go Modules 管理"],
             "掌握 Go 语言的核心语法与设计哲学"),
            ("go-struct", "模块二：结构体与接口 — 组合优于继承 / 接口鸭子类型", "LessonGoStruct",
             "结构体与接口", ["结构体与方法", "接口与多态", "嵌入组合", "类型断言与 switch"],
             "掌握 Go 的面向对象范式"),
            ("go-concurrency", "模块三：并发编程 — Goroutine / Channel / Select / WaitGroup", "LessonGoConcurrency",
             "并发编程", ["Goroutine 轻量线程", "Channel 通信", "Select 多路复用", "sync 包与互斥锁"],
             "掌握 Go 的 CSP 并发模型"),
            ("go-stdlib", "模块四：标准库精讲 — net/http / encoding/json / io / context", "LessonGoStdlib",
             "标准库", ["net/http 服务器", "JSON 编解码", "io.Reader/Writer", "context 超时控制"],
             "高效使用 Go 标准库构建服务"),
            ("go-testing", "模块五：测试与质量 — 单元测试 / Benchmark / Fuzzing / 覆盖率", "LessonGoTesting",
             "测试与质量", ["testing 包", "表驱动测试", "Benchmark 性能测试", "Fuzzing 模糊测试"],
             "建立 Go 项目的测试体系"),
            ("go-grpc", "模块六：gRPC 微服务 — Protobuf / 流式 RPC / 拦截器", "LessonGoGRPC",
             "gRPC 微服务", ["Protobuf 定义", "Unary/Stream RPC", "拦截器中间件", "健康检查与优雅关闭"],
             "用 Go + gRPC 构建高性能微服务"),
            ("go-database", "模块七：数据库与缓存 — GORM / sqlx / Redis / MongoDB", "LessonGoDatabase",
             "数据库", ["GORM ORM", "database/sql 与 sqlx", "Redis 客户端", "MongoDB 驱动"],
             "掌握 Go 的数据库操作最佳实践"),
            ("go-deploy", "模块八：性能调优与部署 — pprof / trace / Docker / K8s", "LessonGoDeploy",
             "调优与部署", ["pprof CPU/内存分析", "trace 追踪", "多阶段 Docker 构建", "K8s Deployment"],
             "完成 Go 应用从调优到生产部署的全流程"),
        ]
    },
    {
        "dir": "RustProgramming",
        "id": "rust-programming",
        "title": "🦀 Rust 系统编程 — 所有权·零成本抽象·高性能",
        "description": "从零掌握 Rust：所有权系统、生命周期、Trait 泛型、异步编程(Tokio)、unsafe 与 FFI、WebAssembly。构建 CLI 工具、Web 服务、嵌入式程序。感受零成本抽象带来的安全与性能。",
        "category": "编程与开发",
        "level": "中级到高级",
        "totalHours": 40,
        "gradient": ["#b7410e", "#f74c00"],
        "modules": [
            ("rust-basics", "模块一：Rust 基础 — 所有权 / 借用 / 生命周期", "LessonRustBasics",
             "所有权系统", ["变量与不可变性", "所有权转移", "引用与借用", "生命周期注解"],
             "理解 Rust 独特的所有权系统"),
            ("rust-types", "模块二：类型系统 — Enum / Pattern Match / Trait / 泛型", "LessonRustTypes",
             "类型系统", ["枚举与模式匹配", "Trait 定义与实现", "泛型与 Trait Bound", "关联类型"],
             "掌握 Rust 强大的类型系统"),
            ("rust-errors", "模块三：错误处理与集合 — Result / Option / Vec / HashMap", "LessonRustErrors",
             "错误与集合", ["Result 与 ? 操作符", "Option 类型", "Vec/HashMap/BTreeMap", "迭代器与闭包"],
             "掌握 Rust 的错误处理范式和标准集合"),
            ("rust-concurrency", "模块四：并发编程 — 线程 / Arc<Mutex> / Channel / Rayon", "LessonRustConcurrency",
             "并发编程", ["std::thread 线程", "Arc 与 Mutex", "mpsc Channel", "Rayon 数据并行"],
             "安全地编写高性能并发代码"),
            ("rust-async", "模块五：异步编程 — async/await / Tokio / 异步 IO", "LessonRustAsync",
             "异步编程", ["Future 与 async/await", "Tokio 运行时", "异步 IO 实战", "select! 与 join!"],
             "用 Tokio 构建高性能异步应用"),
            ("rust-unsafe", "模块六：Unsafe 与 FFI — 原始指针 / C 互操作 / 内存布局", "LessonRustUnsafe",
             "Unsafe 与 FFI", ["Unsafe 的四种超能力", "原始指针", "C FFI 绑定", "内存布局与 repr"],
             "在需要时安全地使用 Unsafe"),
            ("rust-wasm", "模块七：WebAssembly — wasm-bindgen / wasm-pack / 浏览器集成", "LessonRustWasm",
             "WebAssembly", ["Wasm 概念", "wasm-bindgen", "wasm-pack 工具链", "浏览器集成"],
             "用 Rust 编写高性能 WebAssembly 模块"),
            ("rust-project", "模块八：实战项目 — CLI 工具 + HTTP 服务 + 嵌入式", "LessonRustProject",
             "实战项目", ["clap CLI 应用", "Actix-web 服务", "no_std 嵌入式", "性能对比分析"],
             "综合项目实战"),
        ]
    },
    {
        "dir": "OperatingSystems",
        "id": "operating-systems",
        "title": "🖥️ 操作系统原理 — 进程·内存·文件·虚拟化",
        "description": "深入操作系统核心：进程与线程管理、CPU 调度、内存管理（分页/分段/虚拟内存）、文件系统、I/O 与设备驱动、同步与死锁、虚拟化与容器原理。含 xv6 实验与 Linux 内核源码分析。",
        "category": "AI 基础与理论",
        "level": "中级",
        "totalHours": 40,
        "gradient": ["#475569", "#1e293b"],
        "modules": [
            ("os-intro", "模块一：操作系统概述 — 演进 / 架构 / 系统调用 / 中断", "LessonOSIntro",
             "OS 概述", ["操作系统演进", "内核架构", "系统调用机制", "中断与陷阱"],
             "理解操作系统的角色与基本架构"),
            ("process-thread", "模块二：进程与线程 — 创建 / 状态 / 调度 / 线程模型", "LessonProcessThread",
             "进程与线程", ["进程控制块 PCB", "进程状态转换", "线程与轻量级进程", "用户态/内核态线程"],
             "掌握进程与线程的核心概念"),
            ("scheduling", "模块三：CPU 调度 — FCFS / SJF / RR / MLFQ / CFS", "LessonScheduling",
             "CPU 调度", ["调度目标与指标", "FCFS/SJF/优先级", "时间片轮转 RR", "Linux CFS 调度器"],
             "掌握经典的 CPU 调度算法"),
            ("sync-deadlock", "模块四：同步与死锁 — 互斥 / 信号量 / 死锁检测与预防", "LessonSyncDeadlock",
             "同步与死锁", ["临界区问题", "信号量与管程", "死锁的四个条件", "银行家算法"],
             "解决并发同步与死锁问题"),
            ("memory-mgmt", "模块五：内存管理 — 分页 / 分段 / 虚拟内存 / 页面置换", "LessonMemoryMgmt",
             "内存管理", ["地址空间与分页", "页表与 TLB", "按需调页", "LRU/Clock 置换算法"],
             "深入理解虚拟内存系统"),
            ("filesystem", "模块六：文件系统 — VFS / ext4 / 日志 / FUSE", "LessonFilesystem",
             "文件系统", ["文件与目录抽象", "inode 结构", "日志文件系统", "VFS 与 FUSE"],
             "理解文件系统的设计与实现"),
            ("io-devices", "模块七：I/O 与设备管理 — 驱动模型 / DMA / 磁盘调度", "LessonIODevices",
             "I/O 管理", ["I/O 模型", "设备驱动架构", "DMA 传输", "磁盘调度算法"],
             "掌握 I/O 系统的工作原理"),
            ("virtualization", "模块八：虚拟化与容器 — Hypervisor / KVM / 容器原理 / cgroups", "LessonVirtualization",
             "虚拟化", ["硬件虚拟化", "KVM 架构", "namespace/cgroups", "容器 vs 虚拟机"],
             "理解现代虚拟化与容器技术的原理"),
        ]
    },
    {
        "dir": "CompilerDesign",
        "id": "compiler-design",
        "title": "⚙️ 编译原理 — 从词法分析到代码生成",
        "description": "系统学习编译器前端与后端：词法分析(正则/NFA/DFA)、语法分析(LL/LR)、语义分析、中间表示(IR)、优化Pass、代码生成与 LLVM 框架。完成一门小型语言的编译器实战。",
        "category": "AI 基础与理论",
        "level": "高级",
        "totalHours": 36,
        "gradient": ["#7c3aed", "#2563eb"],
        "modules": [
            ("lexical", "模块一：词法分析 — 正则表达式 / NFA / DFA / Lexer", "LessonLexical",
             "词法分析", ["正则表达式", "NFA 与 DFA", "Thompson 构造", "Flex/手写 Lexer"],
             "掌握词法分析器的构建方法"),
            ("parsing", "模块二：语法分析 — CFG / LL(1) / LR(1) / Parser 生成器", "LessonParsing",
             "语法分析", ["上下文无关文法", "LL(1) 预测分析", "LR(1) 移进-归约", "递归下降解析器"],
             "掌握语法分析的核心算法"),
            ("ast-semantic", "模块三：AST 与语义分析 — 类型检查 / 符号表 / 作用域", "LessonASTSemantic",
             "语义分析", ["抽象语法树构建", "符号表管理", "类型检查系统", "作用域规则"],
             "实现语义分析和类型检查"),
            ("ir-generation", "模块四：中间表示 — 三地址码 / SSA / 控制流图", "LessonIRGeneration",
             "中间表示", ["三地址码生成", "SSA 形式", "控制流图 CFG", "支配树与 Φ 函数"],
             "理解编译器 IR 的设计与生成"),
            ("optimization", "模块五：编译优化 — 常量折叠 / 死代码消除 / 循环优化", "LessonOptimization",
             "编译优化", ["常量折叠与传播", "死代码消除", "循环不变量外提", "强度削弱"],
             "掌握经典编译优化技术"),
            ("codegen", "模块六：代码生成 — 寄存器分配 / 指令选择 / 目标代码", "LessonCodegen",
             "代码生成", ["指令选择", "寄存器分配(图着色)", "指令调度", "目标代码发射"],
             "理解后端代码生成的核心问题"),
            ("llvm", "模块七：LLVM 框架 — IR / Pass / Clang / 自定义后端", "LessonLLVM",
             "LLVM 框架", ["LLVM IR 语法", "Function Pass", "Clang 前端", "自定义 Pass"],
             "使用 LLVM 框架实现编译优化"),
            ("compiler-project", "模块八：实战项目 — 设计并实现一门小型语言", "LessonCompilerProject",
             "实战项目", ["语言规范设计", "Lexer + Parser", "类型系统与 IR", "端到端编译测试"],
             "综合实战：从零实现一门编程语言的编译器"),
        ]
    },
    {
        "dir": "JavaSpringBoot",
        "id": "java-spring-boot",
        "title": "☕ Java / Spring Boot 企业级开发",
        "description": "系统学习 Java 生态与 Spring Boot。覆盖 Java 17+ 新特性、Spring IoC/AOP、Spring MVC/WebFlux、JPA/MyBatis 持久化、Spring Security 认证授权、微服务(Spring Cloud)、消息队列与性能调优。",
        "category": "编程与开发",
        "level": "中级",
        "totalHours": 48,
        "gradient": ["#b91c1c", "#f59e0b"],
        "modules": [
            ("java-modern", "模块一：Java 17+ 新特性 — Record / Sealed / Pattern / Virtual Thread", "LessonJavaModern",
             "Java 新特性", ["Record 类", "Sealed 类型", "Pattern Matching", "Virtual Thread"],
             "掌握现代 Java 的核心新特性"),
            ("spring-core", "模块二：Spring 核心 — IoC 容器 / AOP / Bean 生命周期", "LessonSpringCore",
             "Spring 核心", ["IoC 与 DI", "Bean 作用域与生命周期", "AOP 面向切面", "配置与条件装配"],
             "深入理解 Spring 框架的核心机制"),
            ("spring-web", "模块三：Web 开发 — Spring MVC / REST / WebFlux 响应式", "LessonSpringWeb",
             "Web 开发", ["Spring MVC 架构", "RESTful API 设计", "参数校验与异常处理", "WebFlux 响应式"],
             "构建高性能 Web 服务"),
            ("spring-data", "模块四：数据持久化 — JPA / MyBatis / Redis / 事务管理", "LessonSpringData",
             "数据持久化", ["Spring Data JPA", "MyBatis-Plus", "Redis 缓存策略", "声明式事务"],
             "掌握 Spring Boot 的数据访问层"),
            ("spring-security", "模块五：安全认证 — Spring Security / OAuth2 / JWT", "LessonSpringSecurity",
             "安全认证", ["Security Filter Chain", "表单/HTTP Basic 认证", "OAuth2 + JWT", "权限控制 RBAC"],
             "实现企业级安全认证方案"),
            ("spring-cloud", "模块六：微服务架构 — Spring Cloud / 注册中心 / 网关 / 熔断", "LessonSpringCloud",
             "微服务", ["服务注册与发现", "API Gateway", "Feign 声明式调用", "CircuitBreaker 熔断"],
             "用 Spring Cloud 构建微服务架构"),
            ("spring-mq", "模块七：消息驱动 — Kafka / RabbitMQ / 事件驱动架构", "LessonSpringMQ",
             "消息队列", ["Kafka 生产消费", "RabbitMQ 交换机", "事件驱动架构", "Saga 分布式事务"],
             "掌握消息驱动的异步架构"),
            ("spring-deploy", "模块八：部署与调优 — Docker / K8s / JVM 调优 / 监控", "LessonSpringDeploy",
             "部署与调优", ["Docker 容器化", "K8s 编排部署", "JVM GC 调优", "Actuator + Prometheus"],
             "完成 Spring Boot 应用的生产级部署"),
        ]
    },
    {
        "dir": "DistributedSystems",
        "id": "distributed-systems",
        "title": "🌐 分布式系统 — 共识·一致性·容错·扩展",
        "description": "深入分布式系统核心原理：CAP/BASE 理论、Paxos/Raft 共识、分布式事务(2PC/3PC/Saga)、分布式存储(LSM/B+Tree)、分布式计算(MapReduce/Spark)、微服务治理与混沌工程。",
        "category": "基础设施与运维",
        "level": "高级",
        "totalHours": 40,
        "gradient": ["#0ea5e9", "#6366f1"],
        "modules": [
            ("dist-fundamentals", "模块一：分布式基础 — 网络模型 / 时钟 / 故障模型 / FLP", "LessonDistFundamentals",
             "分布式基础", ["网络通信模型", "物理/逻辑时钟", "故障类型分类", "FLP 不可能定理"],
             "建立分布式系统的理论基础"),
            ("consensus", "模块二：共识算法 — Paxos / Raft / Zab / PBFT", "LessonConsensus",
             "共识算法", ["Paxos 原理", "Raft 日志复制", "Leader 选举", "拜占庭容错 PBFT"],
             "深入掌握分布式共识机制"),
            ("consistency", "模块三：一致性模型 — 强一致 / 最终一致 / 因果一致 / CRDT", "LessonConsistency",
             "一致性模型", ["CAP 与 BASE", "线性化与序列化", "因果一致性", "CRDT 无冲突复制"],
             "理解不同一致性级别的权衡"),
            ("dist-txn", "模块四：分布式事务 — 2PC / 3PC / Saga / TCC", "LessonDistTxn",
             "分布式事务", ["两阶段提交 2PC", "三阶段提交 3PC", "Saga 编排模式", "TCC 补偿事务"],
             "掌握分布式事务的实现方案"),
            ("dist-storage", "模块五：分布式存储 — 分片 / 复制 / LSM-Tree / 一致性哈希", "LessonDistStorage",
             "分布式存储", ["数据分片策略", "一致性哈希", "LSM-Tree 引擎", "副本复制与修复"],
             "理解分布式存储系统的设计原理"),
            ("dist-computing", "模块六：分布式计算 — MapReduce / Spark / Stream Processing", "LessonDistComputing",
             "分布式计算", ["MapReduce 模型", "Spark RDD/DataFrame", "流处理 Flink", "批流一体架构"],
             "掌握大数据分布式计算框架"),
            ("microservice-gov", "模块七：微服务治理 — 注册发现 / 熔断 / 限流 / Mesh", "LessonMicroserviceGov",
             "微服务治理", ["服务注册与发现", "熔断与降级", "限流与负载均衡", "Service Mesh (Istio)"],
             "掌握微服务的运行治理体系"),
            ("chaos-eng", "模块八：混沌工程与实战 — 故障注入 / 韧性测试 / 生产演练", "LessonChaosEng",
             "混沌工程", ["混沌工程原则", "Chaos Monkey", "故障注入框架", "韧性测试实践"],
             "通过混沌工程提升系统韧性"),
        ]
    },
    {
        "dir": "ShellAutomation",
        "id": "shell-automation",
        "title": "🐚 Shell 脚本 — 自动化运维与效率利器",
        "description": "从 Bash 基础到高级自动化：变量/控制流/函数、文本处理三剑客(grep/sed/awk)、正则表达式、进程管理、系统监控脚本、定时任务、Ansible 批量运维。含 50+ 实战脚本案例。",
        "category": "基础设施与运维",
        "level": "初级到高级",
        "totalHours": 24,
        "gradient": ["#22c55e", "#15803d"],
        "modules": [
            ("bash-basics", "模块一：Bash 基础 — 变量 / 运算 / 条件 / 循环", "LessonBashBasics",
             "Bash 基础", ["变量与环境变量", "算术与字符串运算", "if/case 条件判断", "for/while/until 循环"],
             "掌握 Shell 脚本的基本语法"),
            ("text-processing", "模块二：文本处理 — grep / sed / awk / sort / uniq", "LessonTextProcessing",
             "文本处理", ["grep 正则搜索", "sed 流编辑器", "awk 编程", "管道与重定向"],
             "精通 Linux 文本处理三剑客"),
            ("regex", "模块三：正则表达式精讲 — BRE / ERE / PCRE / 实战", "LessonRegex",
             "正则表达式", ["基本正则语法", "分组与反向引用", "零宽断言", "正则调试技巧"],
             "掌握正则表达式的完整语法"),
            ("functions-modules", "模块四：函数与模块化 — 函数定义 / source / 库文件", "LessonFunctionsModules",
             "函数与模块化", ["函数定义与返回值", "局部变量与作用域", "source 引用", "构建 Shell 库"],
             "编写可复用的模块化脚本"),
            ("process-signals", "模块五：进程与信号 — 后台任务 / trap / 子进程 / xargs", "LessonProcessSignals",
             "进程与信号", ["后台执行与 nohup", "信号处理 trap", "子进程与 wait", "xargs 并行执行"],
             "掌握进程管理与信号处理"),
            ("system-scripts", "模块六：系统管理脚本 — 监控 / 日志 / 备份 / 定时任务", "LessonSystemScripts",
             "系统管理", ["系统监控脚本", "日志轮转与分析", "自动备份方案", "cron 定时任务"],
             "编写生产级系统管理脚本"),
            ("ansible-auto", "模块七：Ansible 自动化 — Playbook / Role / Galaxy / 批量运维", "LessonAnsibleAuto",
             "Ansible", ["Ansible 架构", "Playbook 编写", "Role 组织", "大规模批量运维"],
             "用 Ansible 实现批量自动化运维"),
            ("shell-project", "模块八：实战项目 — 服务器健康监控 + 自动部署系统", "LessonShellProject",
             "实战项目", ["监控告警系统", "自动化部署工具", "日志分析平台", "综合脚本优化"],
             "综合实战项目"),
        ]
    },
]

# ═══════════════════════════════════════════════════════════════════
# CSS template
# ═══════════════════════════════════════════════════════════════════
LESSON_CSS = """\
/* LessonCommon.css — Shared styles */
.lesson-page { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; color: #e2e8f0; }
.lesson-hero { background: linear-gradient(135deg, var(--g1), var(--g2)); border-radius: 18px; padding: 2.5rem; margin-bottom: 2rem; }
.lesson-hero h1 { font-size: 2rem; margin: 0 0 .5rem; }
.lesson-hero p { opacity: .85; line-height: 1.7; margin: 0; }
.section { background: rgba(30,41,59,.65); border: 1px solid rgba(99,102,241,.15); border-radius: 14px; padding: 1.8rem; margin-bottom: 1.5rem; }
.section h2 { color: #a5b4fc; font-size: 1.35rem; margin: 0 0 1rem; display: flex; align-items: center; gap: .5rem; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 1rem; }
.card { background: rgba(15,23,42,.6); border: 1px solid rgba(99,102,241,.12); border-radius: 12px; padding: 1.2rem; transition: transform .2s, border-color .2s; cursor: pointer; }
.card:hover { transform: translateY(-3px); border-color: rgba(99,102,241,.4); }
.card h3 { font-size: 1rem; color: #c4b5fd; margin: 0 0 .5rem; }
.card p, .card li { font-size: .88rem; color: #94a3b8; line-height: 1.6; margin: 0; }
.card ul { padding-left: 1.2rem; margin: .3rem 0 0; }
.tag { display: inline-block; font-size: .75rem; padding: 3px 10px; border-radius: 999px; background: rgba(99,102,241,.18); color: #a5b4fc; margin-right: 6px; }
.interactive-box { background: rgba(99,102,241,.08); border: 1px dashed rgba(99,102,241,.3); border-radius: 12px; padding: 1.5rem; margin-top: 1rem; text-align: center; }
.interactive-box p { color: #94a3b8; font-size: .9rem; }
.btn { padding: 8px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: .9rem; transition: all .2s; }
.btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99,102,241,.4); }
.checklist { list-style: none; padding: 0; }
.checklist li { padding: .5rem 0; border-bottom: 1px solid rgba(99,102,241,.08); display: flex; align-items: center; gap: .5rem; color: #cbd5e1; font-size: .92rem; }
.checklist li::before { content: '○'; color: #6366f1; font-weight: bold; }
.table-wrapper { overflow-x: auto; }
.table-wrapper table { width: 100%; border-collapse: collapse; font-size: .88rem; }
.table-wrapper th { background: rgba(99,102,241,.15); color: #a5b4fc; padding: 10px; text-align: left; }
.table-wrapper td { padding: 10px; border-bottom: 1px solid rgba(99,102,241,.08); color: #cbd5e1; }
"""


def jsx_template(course, mod_info, idx):
    """Generate a rich JSX lesson component."""
    mod_id, title, comp_name, topic, concepts, goal = mod_info
    concepts_jsx = "\n".join(
        f'            <div className="card" key="{i}">\n              <h3>{c}</h3>\n              <p>深入理解{c}的核心原理与实践应用</p>\n            </div>'
        for i, c in enumerate(concepts)
    )
    checklist_jsx = "\n".join(
        f'            <li>{c}</li>' for c in concepts
    )

    return f'''import React, {{ useState }} from 'react';
import './LessonCommon.css';

export default function {comp_name}() {{
  const [activeCard, setActiveCard] = useState(null);

  const concepts = {json.dumps(concepts, ensure_ascii=False)};

  return (
    <div className="lesson-page" style={{{{"--g1": "{course['gradient'][0]}", "--g2": "{course['gradient'][1]}"}}}}>
      <div className="lesson-hero">
        <span className="tag">模块 {idx+1}</span>
        <h1>{title}</h1>
        <p>{goal}</p>
      </div>

      {{/* ── 学习目标 ── */}}
      <div className="section">
        <h2>🎯 学习目标</h2>
        <ul className="checklist">
{checklist_jsx}
        </ul>
      </div>

      {{/* ── 核心概念 ── */}}
      <div className="section">
        <h2>📖 核心概念</h2>
        <div className="card-grid">
{concepts_jsx}
        </div>
      </div>

      {{/* ── 交互区域 ── */}}
      <div className="section">
        <h2>🧪 交互式练习</h2>
        <div className="interactive-box">
          <p>🚀 {topic} — 交互式练习区</p>
          <div style={{{{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}}}>
            {{concepts.map((c, i) => (
              <button key={{i}} className={{`btn ${{activeCard === i ? "btn-primary" : ""}}`}}
                onClick={{() => setActiveCard(activeCard === i ? null : i)}}
                style={{{{ background: activeCard === i ? undefined : "rgba(99,102,241,.15)", color: activeCard === i ? "white" : "#a5b4fc", border: "1px solid rgba(99,102,241,.25)" }}}}>
                {{c}}
              </button>
            ))}}
          </div>
          {{activeCard !== null && (
            <div style={{{{ marginTop: "1rem", padding: "1rem", background: "rgba(15,23,42,.7)", borderRadius: "10px", textAlign: "left" }}}}>
              <h3 style={{{{ color: "#c4b5fd", marginBottom: ".5rem" }}}}>{{concepts[activeCard]}}</h3>
              <p style={{{{ color: "#94a3b8", lineHeight: 1.7 }}}}>
                这里将展示关于 <strong style={{{{ color: "#e2e8f0" }}}}>{{concepts[activeCard]}}</strong> 的详细解释、
                交互式演示和练习题。通过可视化手段帮助你直观理解核心概念。
              </p>
            </div>
          )}}
        </div>
      </div>

      {{/* ── 知识速查 ── */}}
      <div className="section">
        <h2>📋 知识速查表</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>概念</th>
                <th>核心要点</th>
                <th>难度</th>
              </tr>
            </thead>
            <tbody>
              {{concepts.map((c, i) => (
                <tr key={{i}}>
                  <td style={{{{ fontWeight: 600 }}}}>{{c}}</td>
                  <td>掌握 {{c}} 的定义、性质与应用场景</td>
                  <td><span className="tag">{{["基础", "核心", "进阶", "挑战"][i % 4]}}</span></td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}}
'''


def generate_course(course):
    """Generate a complete course directory."""
    course_dir = os.path.join(BASE, course["dir"])
    pages_dir = os.path.join(course_dir, "src", "pages")
    os.makedirs(pages_dir, exist_ok=True)

    # manifest
    manifest = {
        "id": course["id"],
        "title": course["title"],
        "description": course["description"],
        "category": course["category"],
        "level": course["level"],
        "totalHours": course["totalHours"],
        "cover": {"gradient": course["gradient"]},
        "modules": [
            {"id": m[0], "title": m[1], "component": m[2]}
            for m in course["modules"]
        ]
    }
    mf_path = os.path.join(course_dir, "course.manifest.json")
    with open(mf_path, "w") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # CSS
    css_path = os.path.join(pages_dir, "LessonCommon.css")
    with open(css_path, "w") as f:
        f.write(LESSON_CSS)

    # JSX lessons
    for idx, mod in enumerate(course["modules"]):
        jsx_path = os.path.join(pages_dir, f"{mod[2]}.jsx")
        with open(jsx_path, "w") as f:
            f.write(jsx_template(course, mod, idx))

    return len(course["modules"])


if __name__ == "__main__":
    total_modules = 0
    for course in COURSES:
        n = generate_course(course)
        total_modules += n
        print(f"  ✅ {course['dir']} ({course['id']}) — {n} modules")
    print(f"\n🎉 Generated {len(COURSES)} courses with {total_modules} total modules.")
