#!/usr/bin/env python3
"""Batch-generate 14 new course directories with manifests and placeholder lesson JSX files."""
import json, os, textwrap

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

COURSES = [
    # ── Math (6) ──
    {
        "dir": "LinearAlgebra",
        "id": "linear-algebra",
        "title": "📐 线性代数 — 直觉互动体验",
        "subtitle": "向量空间 / 矩阵运算 / 特征分解 / SVD / PCA",
        "description": "通过交互式可视化沙盒，从向量的几何直觉出发，深入矩阵变换、特征值分解、SVD 与 PCA。理解 Transformer Attention 和 Embedding 背后的数学原理。配备互动演示和 NumPy 实战代码。",
        "category": "数学基础",
        "difficulty": "intermediate",
        "hours": 32,
        "gradient": ["#3b82f6", "#06b6d4"],
        "modules": [
            ("vectors-spaces", "模块一：向量与向量空间 — 几何直觉 / 线性组合 / 基与维度", "LessonVectors"),
            ("linear-transforms", "模块二：线性变换 — 矩阵即函数 / 旋转 / 缩放 / 投影", "LessonTransforms"),
            ("matrix-operations", "模块三：矩阵运算 — 乘法 / 逆矩阵 / 行列式 / LU 分解", "LessonMatrixOps"),
            ("linear-systems", "模块四：线性方程组 — 高斯消元 / Rank / 解空间结构", "LessonLinearSystems"),
            ("eigenvalues", "模块五：特征值与特征向量 — 几何意义 / 对角化 / 谱定理", "LessonEigenvalues"),
            ("svd", "模块六：奇异值分解 — SVD 原理 / 图像压缩 / 推荐系统", "LessonSVD"),
            ("pca-ml", "模块七：PCA 与机器学习 — 降维 / 数据可视化 / 人脸识别", "LessonPCA"),
            ("advanced-topics", "模块八：高级专题 — 张量 / 稀疏矩阵 / GPU 加速线性代数", "LessonAdvanced"),
        ],
    },
    {
        "dir": "ProbabilityStatistics",
        "id": "probability-statistics",
        "title": "📊 概率论与数理统计 — 直觉互动体验",
        "subtitle": "概率空间 / 分布族 / 贝叶斯推断 / 假设检验 / 蒙特卡洛",
        "description": "从古典概率到贝叶斯推断的完整旅程。通过交互式模拟理解分布、期望、方差的本质；掌握最大似然估计、假设检验与置信区间；深入贝叶斯方法和蒙特卡洛采样。为 AI/ML 打下坚实的统计基础。",
        "category": "数学基础",
        "difficulty": "intermediate",
        "hours": 36,
        "gradient": ["#8b5cf6", "#ec4899"],
        "modules": [
            ("probability-basics", "模块一：概率基础 — 样本空间 / 条件概率 / 贝叶斯公式", "LessonProbBasics"),
            ("random-variables", "模块二：随机变量 — 离散 / 连续 / 期望 / 方差 / 矩母函数", "LessonRandomVars"),
            ("distributions", "模块三：常见分布族 — 高斯 / 泊松 / 指数 / Beta / Gamma", "LessonDistributions"),
            ("limit-theorems", "模块四：极限定理 — 大数定律 / 中心极限定理 / 收敛性", "LessonLimitTheorems"),
            ("estimation", "模块五：参数估计 — MLE / MAP / EM 算法 / Fisher 信息", "LessonEstimation"),
            ("hypothesis-testing", "模块六：假设检验 — p 值 / t 检验 / 卡方 / ANOVA / 多重比较", "LessonHypothesis"),
            ("bayesian-inference", "模块七：贝叶斯推断 — 先验 / 后验 / MCMC / 变分推断", "LessonBayesian"),
            ("ml-statistics", "模块八：ML 中的统计 — A/B 测试 / 交叉验证 / Bootstrap / 因果推断", "LessonMLStats"),
        ],
    },
    {
        "dir": "DiscreteMath",
        "id": "discrete-math",
        "title": "🔢 离散数学与图论",
        "subtitle": "集合论 / 逻辑 / 组合数学 / 图论 / 代数结构",
        "description": "算法与数据结构的数学根基。从命题逻辑与集合论出发，掌握组合计数、递推关系、图的遍历与最短路径，理解群论在密码学中的应用。为知识图谱、区块链和高级算法提供理论支撑。",
        "category": "数学基础",
        "difficulty": "intermediate",
        "hours": 30,
        "gradient": ["#f59e0b", "#ef4444"],
        "modules": [
            ("logic-proofs", "模块一：命题逻辑与证明 — 布尔代数 / 谓词逻辑 / 数学归纳法", "LessonLogic"),
            ("set-theory", "模块二：集合论与关系 — 映射 / 等价关系 / 偏序 / 格", "LessonSets"),
            ("combinatorics", "模块三：组合计数 — 排列 / 组合 / 容斥原理 / 生成函数", "LessonCombinatorics"),
            ("recurrence", "模块四：递推关系 — Fibonacci / Master 定理 / 算法复杂度分析", "LessonRecurrence"),
            ("graph-basics", "模块五：图论基础 — 图的表示 / DFS / BFS / 连通性 / 欧拉路径", "LessonGraphBasics"),
            ("graph-algorithms", "模块六：图算法进阶 — 最短路径 / MST / 网络流 / 匹配", "LessonGraphAlgo"),
            ("algebraic-structures", "模块七：代数结构 — 群 / 环 / 域 / 有限域与密码学", "LessonAlgebra"),
            ("applications", "模块八：应用专题 — 知识图谱 / 编码理论 / 博弈论基础", "LessonApplications"),
        ],
    },
    {
        "dir": "InformationTheory",
        "id": "information-theory",
        "title": "📡 信息论与编码",
        "subtitle": "Shannon 熵 / 互信息 / KL 散度 / 信道编码 / 数据压缩",
        "description": "Shannon 信息论是 ML 的思想源泉。从熵的数学定义出发，理解交叉熵损失、KL 散度、互信息的本质。掌握 Huffman 编码与 LZ 压缩，深入信道编码定理。为理解 Transformer 的 Tokenizer、模型蒸馏和信息瓶颈提供理论根基。",
        "category": "数学基础",
        "difficulty": "advanced",
        "hours": 28,
        "gradient": ["#14b8a6", "#3b82f6"],
        "modules": [
            ("entropy", "模块一：信息熵 — Shannon 熵 / 条件熵 / 联合熵 / 链式法则", "LessonEntropy"),
            ("mutual-info", "模块二：互信息与 KL 散度 — 信息增益 / 交叉熵 / JS 散度", "LessonMutualInfo"),
            ("source-coding", "模块三：信源编码 — Huffman / 算术编码 / LZ77 / BPE Tokenizer", "LessonSourceCoding"),
            ("channel-coding", "模块四：信道编码 — 信道容量 / 纠错码 / Hamming / Turbo", "LessonChannelCoding"),
            ("rate-distortion", "模块五：率失真理论 — 有损压缩 / 量化理论 / VQ-VAE", "LessonRateDistortion"),
            ("info-ml", "模块六：信息论与 ML — 信息瓶颈 / MDL / PAC 学习 / 正则化", "LessonInfoML"),
            ("info-llm", "模块七：信息论与 LLM — Perplexity / 模型蒸馏 / Token 信息量", "LessonInfoLLM"),
            ("advanced-info", "模块八：前沿专题 — 量子信息论 / 网络信息论 / 因果信息", "LessonAdvancedInfo"),
        ],
    },
    {
        "dir": "Optimization",
        "id": "optimization-methods",
        "title": "🎯 最优化方法",
        "subtitle": "梯度下降 / 凸优化 / 约束优化 / Adam / 二阶方法",
        "description": "训练 LLM 的数学引擎。从梯度下降的数学原理出发，深入 SGD → Momentum → Adam 优化器家族。掌握凸优化理论、拉格朗日对偶、KKT 条件。理解 Learning Rate Schedule、梯度裁剪和分布式优化，为深度学习训练调参提供理论指导。",
        "category": "数学基础",
        "difficulty": "advanced",
        "hours": 30,
        "gradient": ["#ef4444", "#f97316"],
        "modules": [
            ("unconstrained", "模块一：无约束优化基础 — 梯度 / Hessian / 泰勒展开 / 收敛性", "LessonUnconstrained"),
            ("gradient-methods", "模块二：梯度下降法族 — SGD / Momentum / Nesterov / 学习率", "LessonGradientMethods"),
            ("adaptive-optimizers", "模块三：自适应优化器 — AdaGrad / RMSprop / Adam / LAMB", "LessonAdaptive"),
            ("convex-optimization", "模块四：凸优化理论 — 凸集 / 凸函数 / 对偶理论 / SVM", "LessonConvex"),
            ("constrained", "模块五：约束优化 — Lagrange / KKT / 内点法 / 罚函数", "LessonConstrained"),
            ("second-order", "模块六：二阶方法 — Newton 法 / L-BFGS / 自然梯度 / K-FAC", "LessonSecondOrder"),
            ("dl-optimization", "模块七：深度学习优化实战 — LR Schedule / 梯度裁剪 / 混合精度", "LessonDLOptim"),
            ("distributed-optim", "模块八：分布式优化 — 数据并行 / 模型并行 / ZeRO / FSDP", "LessonDistOptim"),
        ],
    },
    {
        "dir": "NumericalComputing",
        "id": "numerical-computing",
        "title": "🔬 数值计算与科学计算",
        "subtitle": "浮点精度 / 数值稳定性 / 矩阵分解 / 微分方程 / GPU 计算",
        "description": "理解 FP16/BF16 训练和量化误差的根基。从浮点数表示出发，掌握数值稳定性、矩阵分解算法、插值与逼近、数值微积分。深入 ODE/PDE 数值求解，理解 Diffusion Model 的数学采样器。配合 NumPy/SciPy/JAX 实战。",
        "category": "数学基础",
        "difficulty": "advanced",
        "hours": 28,
        "gradient": ["#6366f1", "#a855f7"],
        "modules": [
            ("floating-point", "模块一：浮点运算 — IEEE 754 / FP16 / BF16 / 精度与误差分析", "LessonFloatingPoint"),
            ("linear-algebra-num", "模块二：数值线性代数 — LU / QR / Cholesky / 迭代法", "LessonNumericalLA"),
            ("interpolation", "模块三：插值与逼近 — 多项式 / 样条 / 切比雪夫 / FFT", "LessonInterpolation"),
            ("numerical-calculus", "模块四：数值微积分 — 自动微分 / 数值积分 / 蒙特卡洛", "LessonNumericalCalc"),
            ("ode-solvers", "模块五：常微分方程 — Euler / Runge-Kutta / 刚性问题 / Diffusion 采样", "LessonODE"),
            ("pde-solvers", "模块六：偏微分方程 — 有限差分 / 有限元 / 物理信息神经网络 PINN", "LessonPDE"),
            ("optimization-num", "模块七：数值优化实现 — 线搜索 / 信赖域 / 稀疏优化", "LessonNumOptim"),
            ("gpu-computing", "模块八：GPU 科学计算 — CUDA 核函数 / JAX / Triton / 性能优化", "LessonGPUComputing"),
        ],
    },
    # ── IT Tech (8) ──
    {
        "dir": "GitMastery",
        "id": "git-mastery",
        "title": "🔀 Git 精通：版本控制 / 团队协作 / Monorepo",
        "subtitle": "分支策略 / Rebase / Cherry-pick / Submodule / Worktree / CI 集成",
        "description": "每天都在用 Git，但 90% 的人只会 add/commit/push。本课从 Git 内部数据模型出发，精通分支策略、交互式 Rebase、Cherry-pick、Bisect 调试。掌握 Submodule/Worktree 的高级用法，深入 Monorepo 管理与 CI 集成。",
        "category": "编程与开发",
        "difficulty": "intermediate",
        "hours": 20,
        "gradient": ["#f97316", "#ef4444"],
        "modules": [
            ("git-internals", "模块一：Git 内部原理 — 对象模型 / SHA / DAG / 引用机制", "LessonGitInternals"),
            ("branching", "模块二：分支策略 — Git Flow / Trunk-based / Feature Flag", "LessonBranching"),
            ("rebase-merge", "模块三：Rebase 与合并 — Interactive Rebase / Squash / 冲突解决", "LessonRebase"),
            ("advanced-ops", "模块四：高级操作 — Cherry-pick / Bisect / Reflog / Stash", "LessonAdvancedOps"),
            ("submodule-worktree", "模块五：子模块与工作树 — Submodule / Subtree / Worktree", "LessonSubmodule"),
            ("monorepo", "模块六：Monorepo 管理 — Turborepo / Nx / Lerna / 依赖管理", "LessonMonorepo"),
            ("hooks-ci", "模块七：Hooks 与 CI 集成 — Pre-commit / Husky / GitHub Actions", "LessonHooksCI"),
            ("team-workflow", "模块八：团队协作实战 — Code Review / PR 规范 / 大规模项目管理", "LessonTeamWorkflow"),
        ],
    },
    {
        "dir": "GoLangEngineering",
        "id": "golang-engineering",
        "title": "🐹 Go 语言工程实战",
        "subtitle": "Goroutine / Channel / 接口设计 / 微服务 / CLI 工具",
        "description": "云原生生态第一语言。从 Go 语法基础出发，深入 Goroutine 并发模型、Channel 通信、接口组合设计。掌握 Gin/Echo Web 框架、gRPC 微服务、CLI 工具开发。实战项目涵盖 RESTful API、分布式爬虫和 K8s Operator。",
        "category": "编程与开发",
        "difficulty": "intermediate",
        "hours": 40,
        "gradient": ["#00ADD8", "#5DC9E2"],
        "modules": [
            ("go-basics", "模块一：Go 基础语法 — 类型系统 / 函数 / 结构体 / 错误处理", "LessonGoBasics"),
            ("concurrency", "模块二：并发编程 — Goroutine / Channel / Select / WaitGroup / Mutex", "LessonConcurrency"),
            ("interfaces", "模块三：接口与泛型 — 组合设计 / 类型断言 / Generics 1.18+", "LessonInterfaces"),
            ("stdlib", "模块四：标准库精讲 — io / net/http / context / encoding / testing", "LessonStdLib"),
            ("web-framework", "模块五：Web 开发 — Gin / 中间件 / 数据库 / 认证 / Swagger", "LessonWebFramework"),
            ("grpc-micro", "模块六：gRPC 与微服务 — Protobuf / 服务发现 / 负载均衡", "LessonGRPC"),
            ("cli-tools", "模块七：CLI 工具开发 — Cobra / Viper / 交互式终端 / 发布", "LessonCLITools"),
            ("go-production", "模块八：生产实战 — 性能优化 / pprof / K8s Operator / 项目架构", "LessonGoProduction"),
        ],
    },
    {
        "dir": "RustProgramming",
        "id": "rust-programming",
        "title": "🦀 Rust 系统编程：从所有权到高性能",
        "subtitle": "所有权 / 生命周期 / Trait / async / WebAssembly / 系统编程",
        "description": "增长最快的系统编程语言。从所有权与借用机制出发，掌握 Rust 独特的内存安全保证。深入 Trait 系统、生命周期、async/await 异步编程。实战涵盖 CLI 工具、WebAssembly、网络服务和系统级编程。",
        "category": "编程与开发",
        "difficulty": "advanced",
        "hours": 44,
        "gradient": ["#CE422B", "#F74C00"],
        "modules": [
            ("rust-basics", "模块一：Rust 基础 — 变量 / 类型 / 控制流 / 模式匹配 / Cargo", "LessonRustBasics"),
            ("ownership", "模块二：所有权系统 — 所有权 / 借用 / 生命周期 / 智能指针", "LessonOwnership"),
            ("traits-generics", "模块三：Trait 与泛型 — Trait 对象 / 关联类型 / 零成本抽象", "LessonTraits"),
            ("error-handling", "模块四：错误处理与集合 — Result / Option / Iterator / 闭包", "LessonErrorHandling"),
            ("concurrency-rust", "模块五：并发编程 — 线程 / Arc/Mutex / Channel / Rayon / Tokio", "LessonRustConcurrency"),
            ("async-rust", "模块六：异步编程 — async/await / Future / Tokio 生态 / 网络编程", "LessonAsyncRust"),
            ("wasm-rust", "模块七：WebAssembly — wasm-pack / 浏览器集成 / WASI / 边缘计算", "LessonWasmRust"),
            ("systems-programming", "模块八：系统编程实战 — FFI / unsafe / 嵌入式 / 性能优化", "LessonSystemsProg"),
        ],
    },
    {
        "dir": "OperatingSystems",
        "id": "operating-systems",
        "title": "🖥️ 操作系统原理：从进程到虚拟化",
        "subtitle": "进程 / 线程 / 内存管理 / 文件系统 / 虚拟化 / 容器",
        "description": "CS 理论三件套之一。从进程与线程模型出发，深入 CPU 调度、内存管理（虚拟内存/分页/TLB）、文件系统（ext4/ZFS）和 I/O 子系统。理解 Linux 内核机制，掌握容器（cgroup/namespace）和虚拟化技术的底层原理。",
        "category": "AI 基础与理论",
        "difficulty": "intermediate",
        "hours": 36,
        "gradient": ["#1e40af", "#7c3aed"],
        "modules": [
            ("os-overview", "模块一：操作系统概述 — 内核架构 / 系统调用 / 用户态与内核态", "LessonOSOverview"),
            ("processes", "模块二：进程管理 — 进程模型 / 创建 / IPC / 信号 / 调度算法", "LessonProcesses"),
            ("threads-sync", "模块三：线程与同步 — Pthread / 锁 / 信号量 / 死锁 / 无锁编程", "LessonThreadsSync"),
            ("memory-mgmt", "模块四：内存管理 — 虚拟内存 / 分页 / TLB / 页面置换 / OOM", "LessonMemoryMgmt"),
            ("filesystem", "模块五：文件系统 — VFS / ext4 / ZFS / 日志 / RAID", "LessonFilesystem"),
            ("io-devices", "模块六：I/O 与设备 — 中断 / DMA / 块设备 / 网络 I/O 模型", "LessonIODevices"),
            ("virtualization", "模块七：虚拟化技术 — Hypervisor / KVM / cgroup / namespace", "LessonVirtualization"),
            ("modern-os", "模块八：现代 OS 专题 — eBPF / io_uring / 实时系统 / 微内核", "LessonModernOS"),
        ],
    },
    {
        "dir": "CompilerDesign",
        "id": "compiler-design",
        "title": "⚙️ 编译原理与语言实现",
        "subtitle": "词法分析 / 语法分析 / AST / 类型系统 / 代码生成 / JIT",
        "description": "理解代码如何变成可执行程序。从词法分析与正则表达式出发，掌握语法分析（LL/LR）、AST 构建与遍历、语义分析与类型检查。深入中间表示、优化 Pass 和代码生成。实战项目：实现一门迷你编程语言。",
        "category": "AI 基础与理论",
        "difficulty": "advanced",
        "hours": 36,
        "gradient": ["#059669", "#10b981"],
        "modules": [
            ("lexical-analysis", "模块一：词法分析 — 正则表达式 / NFA/DFA / Lexer 实现", "LessonLexer"),
            ("parsing", "模块二：语法分析 — CFG / LL(1) / LR(1) / Parser Generator", "LessonParsing"),
            ("ast-ir", "模块三：AST 与中间表示 — 树遍历 / 三地址码 / SSA 形式", "LessonASTIR"),
            ("type-systems", "模块四：类型系统 — 静态类型 / 类型推导 / 多态 / 泛型", "LessonTypeSystems"),
            ("semantic-analysis", "模块五：语义分析 — 符号表 / 作用域 / 类型检查 / 错误恢复", "LessonSemantic"),
            ("code-optimization", "模块六：代码优化 — 常量折叠 / 循环优化 / 内联 / 死代码消除", "LessonOptimization"),
            ("code-generation", "模块七：代码生成 — 寄存器分配 / 指令选择 / LLVM IR", "LessonCodeGen"),
            ("jit-dsl", "模块八：JIT 与 DSL — 即时编译 / Interpreter / DSL 设计 / Prompt 模板引擎", "LessonJITDSL"),
        ],
    },
    {
        "dir": "JavaSpringBoot",
        "id": "java-spring-boot",
        "title": "☕ Java / Spring Boot 企业级开发",
        "subtitle": "Java 17+ / Spring Boot 3 / JPA / 微服务 / 分布式事务",
        "description": "企业级后端 No.1 选择。从 Java 17+ 现代语法出发，深入 Spring Boot 3 自动配置、Spring Data JPA、Spring Security。掌握微服务架构（Spring Cloud）、分布式事务（Seata）和性能调优（JVM GC）。",
        "category": "编程与开发",
        "difficulty": "intermediate",
        "hours": 44,
        "gradient": ["#E76F00", "#5382A1"],
        "modules": [
            ("java-modern", "模块一：现代 Java — Java 17+ 特性 / Record / Sealed / Pattern Matching", "LessonJavaModern"),
            ("spring-boot", "模块二：Spring Boot 3 — 自动配置 / Starter / Profile / 配置管理", "LessonSpringBoot"),
            ("spring-data", "模块三：数据持久化 — Spring Data JPA / MyBatis Plus / 事务管理", "LessonSpringData"),
            ("spring-security", "模块四：安全认证 — Spring Security / OAuth2 / JWT / RBAC", "LessonSpringSec"),
            ("rest-api", "模块五：RESTful API — OpenAPI / 版本控制 / 异常处理 / 限流", "LessonRestAPI"),
            ("spring-cloud", "模块六：微服务架构 — Spring Cloud / 服务发现 / 网关 / 熔断", "LessonSpringCloud"),
            ("jvm-performance", "模块七：JVM 性能优化 — GC 调优 / JFR / 内存分析 / 线程池", "LessonJVMPerf"),
            ("java-production", "模块八：生产实战 — 分布式事务 / 消息队列 / 部署 / 监控", "LessonJavaProduction"),
        ],
    },
    {
        "dir": "DistributedSystems",
        "id": "distributed-systems",
        "title": "🌐 分布式系统原理与实践",
        "subtitle": "CAP / Paxos / Raft / 分布式事务 / 一致性模型 / 容错",
        "description": "系统设计课的理论深度版。从分布式系统挑战出发，深入 CAP 定理、一致性模型（线性一致/因果一致）、共识算法（Paxos/Raft）、分布式事务（2PC/Saga）。理解分布式时钟、故障检测和容错设计。",
        "category": "基础设施与运维",
        "difficulty": "advanced",
        "hours": 36,
        "gradient": ["#0891b2", "#6366f1"],
        "modules": [
            ("dist-fundamentals", "模块一：分布式基础 — 挑战 / 故障模型 / FLP 不可能性", "LessonDistFundamentals"),
            ("time-clocks", "模块二：时间与时钟 — Lamport / 向量时钟 / TrueTime / HLC", "LessonTimeClocks"),
            ("consistency", "模块三：一致性模型 — 强一致 / 因果一致 / 最终一致 / 线性化", "LessonConsistency"),
            ("consensus", "模块四：共识算法 — Paxos / Raft / ZAB / EPaxos", "LessonConsensus"),
            ("replication", "模块五：复制与分区 — 主从 / 多主 / 无主 / 一致性哈希", "LessonReplication"),
            ("dist-transactions", "模块六：分布式事务 — 2PC / 3PC / Saga / TCC / Seata", "LessonDistTransactions"),
            ("fault-tolerance", "模块七：容错与可靠性 — 故障检测 / 选主 / 幂等 / 端到端论证", "LessonFaultTolerance"),
            ("case-studies", "模块八：经典系统剖析 — GFS / Spanner / Dynamo / Kafka / etcd", "LessonCaseStudies"),
        ],
    },
    {
        "dir": "ShellAutomation",
        "id": "shell-automation",
        "title": "🐚 Shell 脚本与自动化运维",
        "subtitle": "Bash / awk / sed / jq / systemd / cron / 自动化流水线",
        "description": "Linux 系统管理的瑞士军刀。从 Bash 脚本基础出发，精通文本三剑客（grep/sed/awk）、jq JSON 处理。掌握 systemd 服务管理、cron 定时任务、日志分析。实战自动化运维脚本与 ChatOps 集成。",
        "category": "基础设施与运维",
        "difficulty": "intermediate",
        "hours": 24,
        "gradient": ["#4d7c0f", "#84cc16"],
        "modules": [
            ("bash-basics", "模块一：Bash 基础 — 变量 / 条件 / 循环 / 函数 / 调试", "LessonBashBasics"),
            ("text-processing", "模块二：文本处理 — grep / sed / awk / cut / sort / uniq", "LessonTextProcessing"),
            ("regex-jq", "模块三：正则与 JSON — 正则表达式 / jq / yq / 数据转换", "LessonRegexJQ"),
            ("file-system-ops", "模块四：文件系统操作 — find / xargs / rsync / 权限管理", "LessonFileOps"),
            ("process-management", "模块五：进程管理 — ps / top / kill / nohup / systemd 服务", "LessonProcessMgmt"),
            ("cron-automation", "模块六：定时与自动化 — cron / systemd timer / at / 批量操作", "LessonCronAutomation"),
            ("log-monitoring", "模块七：日志与监控 — journalctl / logrotate / 日志分析脚本", "LessonLogMonitoring"),
            ("production-scripts", "模块八：生产实战 — 部署脚本 / 备份恢复 / ChatOps / 安全加固", "LessonProductionScripts"),
        ],
    },
]

# JSX template for placeholder lesson files
LESSON_TEMPLATE = textwrap.dedent('''\
import React from 'react';
import './LessonCommon.css';

export default function {component}() {{
  return (
    <div className="lesson-container">
      <div className="lesson-hero" style={{{{ background: 'linear-gradient(135deg, {grad0}, {grad1})' }}}}>
        <h1>{module_title}</h1>
        <p className="lesson-subtitle">{course_title}</p>
      </div>

      <section className="lesson-section">
        <h2>📋 学习目标</h2>
        <div className="objectives-grid">
          <div className="objective-card">
            <span className="obj-icon">🎯</span>
            <p>理解本模块核心概念与原理</p>
          </div>
          <div className="objective-card">
            <span className="obj-icon">🔧</span>
            <p>掌握关键技术与工具的实际应用</p>
          </div>
          <div className="objective-card">
            <span className="obj-icon">💡</span>
            <p>通过实战项目巩固所学知识</p>
          </div>
          <div className="objective-card">
            <span className="obj-icon">🚀</span>
            <p>构建可用于生产环境的解决方案</p>
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>📖 课程大纲</h2>
        <div className="outline-card">
          <p>本模块内容正在精心打磨中，即将上线。请关注课程更新通知。</p>
          <div className="coming-soon-badge">🚧 Coming Soon</div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>💬 讨论</h2>
        <div className="outline-card">
          <p>课程发布后，欢迎在此交流学习心得和疑问。</p>
        </div>
      </section>
    </div>
  );
}}
''')

COMMON_CSS = textwrap.dedent('''\
.lesson-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}
.lesson-hero {
  border-radius: 16px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #fff;
}
.lesson-hero h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}
.lesson-subtitle {
  font-size: 0.95rem;
  opacity: 0.85;
}
.lesson-section {
  margin-bottom: 2rem;
}
.lesson-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #e2e8f0;
}
.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.objective-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}
.obj-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.5rem;
}
.objective-card p {
  color: #cbd5e1;
  font-size: 0.9rem;
  margin: 0;
}
.outline-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}
.coming-soon-badge {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: rgba(99,102,241,0.2);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #a5b4fc;
}
''')


def create_manifest(course):
    modules = []
    for mod_id, mod_title, component in course["modules"]:
        modules.append({
            "id": mod_id,
            "title": mod_title,
            "component": component,
        })
    manifest = {
        "id": course["id"],
        "title": course["title"],
        "subtitle": course["subtitle"],
        "description": course["description"],
        "category": course["category"],
        "difficulty": course.get("difficulty", "intermediate"),
        "duration": f"~{course['hours']}h",
        "modules": modules,
    }
    return manifest


def create_lesson_jsx(course, mod_id, mod_title, component):
    return LESSON_TEMPLATE.format(
        component=component,
        module_title=mod_title.split("：", 1)[-1] if "：" in mod_title else mod_title,
        course_title=course["title"],
        grad0=course["gradient"][0],
        grad1=course["gradient"][1],
    )


def main():
    created = 0
    for course in COURSES:
        course_dir = os.path.join(BASE, course["dir"])
        pages_dir = os.path.join(course_dir, "src", "pages")
        os.makedirs(pages_dir, exist_ok=True)

        # Write manifest
        manifest_path = os.path.join(course_dir, "course.manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(create_manifest(course), f, indent=2, ensure_ascii=False)
        print(f"✅ {course['dir']}/course.manifest.json")

        # Write common CSS
        css_path = os.path.join(pages_dir, "LessonCommon.css")
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(COMMON_CSS)

        # Write lesson JSX files
        for mod_id, mod_title, component in course["modules"]:
            jsx_path = os.path.join(pages_dir, f"{component}.jsx")
            with open(jsx_path, "w", encoding="utf-8") as f:
                f.write(create_lesson_jsx(course, mod_id, mod_title, component))

        created += 1
        print(f"   └── {len(course['modules'])} lessons created")

    print(f"\n🎉 Done! Created {created} courses with {created * 8} lesson files.")


if __name__ == "__main__":
    main()
''')
</invoke>
