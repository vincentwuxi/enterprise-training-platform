import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['TEE 原理', 'Intel SGX/TDX', 'GPU 机密计算', 'TEE 部署'];

export default function LessonTrustedExecution() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🏰 module_06 — 可信执行环境</div>
      <div className="fs-hero">
        <h1>可信执行环境：TEE / SGX / TDX / 机密计算 — 硬件级隐私保护</h1>
        <p>
          可信执行环境 (TEE) 通过<strong>硬件隔离</strong>保护数据在使用中的安全，
          性能开销最小 (通常 &lt;10%)。本模块覆盖 Intel SGX/TDX、AMD SEV、
          ARM TrustZone 等主流方案，深入 NVIDIA H100 Confidential Computing
          如何实现<strong>GPU 加密推理</strong>，以及 TEE 在隐私计算中的部署实战。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏰 可信执行环境</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔧 TEE 核心原理</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> tee_fundamentals</div>
              <pre className="fs-code">{`# TEE: 硬件级别的安全隔离计算

# ═══ 什么是 TEE? ═══
# Trusted Execution Environment
# CPU 提供的硬件隔离区域 (Enclave/Secure World)
# 在隔离区内的代码和数据:
# - 即使 OS/Hypervisor 被攻破也无法窥探
# - 内存加密, 离开 CPU 就是密文
# - 远程认证: 可验证代码完整性

# ═══ 安全保证 ═══
tee_security = {
    "机密性":     "Enclave 内存加密, 外部无法读取",
    "完整性":     "代码/数据篡改会被检测",
    "认证性":     "远程验证 Enclave 中运行的是预期代码",
    "隔离性":     "OS/VMM/其他应用无法访问 Enclave",
}

# ═══ 不保证什么? ═══
tee_limitations = {
    "侧信道攻击":   "时序/缓存/功耗分析可能泄露信息",
    "Enclave 漏洞":  "Enclave 内部代码 bug 仍然危险",
    "硬件后门":      "需要信任芯片制造商",
    "DoS":           "OS 可以停止/饿死 Enclave",
}

# ═══ 主流 TEE 技术 ═══
# ┌─────────────┬──────────────┬──────────────┬──────────────┐
# │ 技术         │ 厂商         │ 粒度         │ 内存限制     │
# ├─────────────┼──────────────┼──────────────┼──────────────┤
# │ SGX         │ Intel        │ 进程级       │ 128MB-512MB  │
# │ TDX         │ Intel        │ VM 级        │ 数百 GB      │
# │ SEV(-SNP)   │ AMD          │ VM 级        │ 数百 GB      │
# │ TrustZone   │ ARM          │ 世界级(2个)  │ 灵活         │
# │ CCA         │ ARM v9       │ Realm 级     │ 灵活         │
# │ Keystone    │ RISC-V       │ Enclave 级   │ 灵活         │
# └─────────────┴──────────────┴──────────────┴──────────────┘

# ═══ 远程认证 (Remote Attestation) ═══
# 核心问题: 如何证明远端 Enclave 运行的是正确代码?
attestation_flow = [
    "1. Enclave 生成 Report (包含代码哈希/数据)",
    "2. Report 发送给 Intel/AMD 认证服务",
    "3. 认证服务用密钥签名 → Quote",
    "4. 验证方检查 Quote 签名 + 代码哈希",
    "5. 确认: 远端确实在 TEE 中运行预期代码",
]`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💻 Intel SGX / TDX</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> intel_tee</div>
              <pre className="fs-code">{`# Intel SGX & TDX: 最成熟的 TEE 方案

# ═══ SGX (Software Guard Extensions) ═══
# 进程级隔离: 在用户空间创建 Enclave
# EPC (Enclave Page Cache): 加密内存区域
sgx_features = {
    "内存加密":     "MEE 对 EPC 页加密, 离开 CPU 即密文",
    "Enclave 模型": "不可信 OS 调用可信 Enclave 函数",
    "Sealed Data":  "数据绑定到 Enclave 身份, 持久化存储",
    "内存限制":     "SGX1: 128MB, SGX2: 可动态扩展",
}

# SGX 编程模型:
# ┌─────────────────────────────────┐
# │  不可信部分 (Host Application)   │
# │  - 文件 I/O, 网络, UI          │
# │  - 调用 Enclave 函数 (ECall)    │
# ├─────────────────────────────────┤
# │  可信部分 (Enclave)             │
# │  - 敏感计算 / 密钥操作          │
# │  - 回调 Host 函数 (OCall)       │
# │  - 无系统调用 (不能直接 I/O)    │
# └─────────────────────────────────┘

# ═══ TDX (Trust Domain Extensions) ═══
# VM 级隔离: 整个虚拟机是受保护的
tdx_advantages = {
    "内存无限制":   "不受 EPC 大小限制 → 可运行大模型",
    "兼容性好":     "现有应用无需修改, 整个 VM 受保护",
    "多租户隔离":   "云厂商无法访问租户数据",
    "性能":         "接近原生 (<5% 开销)",
}

# TDX 适合 AI:
# - 可在 TD (Trust Domain) 中运行完整 ML 训练
# - 数百 GB 加密内存 → LLM 推理无压力
# - Azure/GCP/AWS 已提供 Confidential VM

# ═══ SGX vs TDX 选择 ═══
# SGX: 需要最小可信计算基 (TCB) → 安全要求极高
# TDX: 需要运行大型应用/模型 → 实用性优先
# 趋势: TDX 逐渐取代 SGX 成为主流

# ═══ Gramine (SGX 运行时) ═══
# 让未修改的 Linux 应用在 SGX 中运行
# gramine-sgx python3 my_ml_script.py
# 自动处理系统调用转发、内存管理
# 支持 PyTorch, scikit-learn 等 ML 框架`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎮 GPU 机密计算</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gpu_cc</div>
              <pre className="fs-code">{`# GPU 机密计算: AI 时代的 TEE 革新

# ═══ 问题 ═══
# 传统 TEE 只保护 CPU 内存
# AI 推理在 GPU 上! GPU 显存不受保护!
# → 攻击者可以 dump GPU 显存 → 获取模型/数据

# ═══ NVIDIA 机密计算 (H100+) ═══
nvidia_cc = {
    "Hopper (H100)": {
        "功能": "首个支持机密计算的 GPU",
        "机制": "GPU 显存加密 + CPU-GPU 通道加密",
        "认证": "GPU 远程认证 + 驱动完整性验证",
        "性能": "约 5-10% 开销",
    },
    "Blackwell (B100/B200)": {
        "功能": "增强机密计算, 更大显存",
        "改进": "性能开销进一步降低",
    },
}

# ═══ 工作原理 ═══
# 1. CPU TEE (TDX/SEV) 建立信任根
# 2. 安全通道传输模型和数据到 GPU
# 3. GPU 显存加密 (AES-XTS)
# 4. PCIe 通道加密 (CPU ↔ GPU)
# 5. GPU Enclave 内执行推理
# 6. 结果加密返回 → 只有授权方可解密

# ═══ 架构图 ═══
# ┌─────────────────────────────────────┐
# │  Confidential VM (TDX/SEV)         │
# │  ┌─────────────────────────────┐    │
# │  │  Application                │    │
# │  │  ┌──────────┐ ┌──────────┐  │    │
# │  │  │ PyTorch  │ │ vLLM     │  │    │
# │  │  └────┬─────┘ └────┬─────┘  │    │
# │  │       │ CUDA        │        │    │
# │  │  ┌────┴─────────────┴─────┐  │    │
# │  │  │  NVIDIA Driver (签名)  │  │    │
# │  │  └────────────┬───────────┘  │    │
# │  └───────────────┼──────────────┘    │
# │         加密 PCIe │                  │
# │  ┌───────────────┼──────────────┐    │
# │  │  GPU H100 CC  ▼              │    │
# │  │  ┌─────────────────────────┐ │    │
# │  │  │ 加密显存 (Model+Data)   │ │    │
# │  │  └─────────────────────────┘ │    │
# │  └──────────────────────────────┘    │
# └─────────────────────────────────────┘

# ═══ 云厂商支持 ═══
cloud_cc = {
    "Azure":   "DCsv3 (SGX) / DCdsv3 (TDX+H100CC)",
    "GCP":     "Confidential VMs (SEV-SNP, 即将支持 GPU CC)",
    "AWS":     "Nitro Enclaves + 预览 GPU CC",
    "阿里云":   "机密计算实例 (TDX, 部分支持 GPU)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🚀 TEE AI 部署实战</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> tee_deployment</div>
              <pre className="fs-code">{`# TEE + AI: 企业部署实战

# ═══ 部署方案选型 ═══
deployment_options = {
    "方案1 — Gramine + SGX": {
        "适合":   "小模型 (BERT/SentenceBERT)",
        "优势":   "最小 TCB, 安全性最高",
        "限制":   "128-512MB 内存, 不支持 GPU",
        "步骤": [
            "1. 编写 Gramine manifest",
            "2. 签名 Enclave",
            "3. gramine-sgx python3 serve.py",
        ],
    },
    "方案2 — TDX Confidential VM": {
        "适合":   "中大型模型 (7B-70B LLM)",
        "优势":   "无需改代码, 整个 VM 受保护",
        "限制":   "需要云厂商支持",
        "步骤": [
            "1. 创建 Confidential VM (Azure/GCP)",
            "2. 安装 PyTorch/vLLM",
            "3. 正常部署模型 (自动保护)",
            "4. 远程认证后才允许访问",
        ],
    },
    "方案3 — H100 CC + TDX": {
        "适合":   "GPU 推理, 最高安全要求",
        "优势":   "CPU+GPU 全链路加密",
        "限制":   "仅 H100+ / 成本高",
        "步骤": [
            "1. 使用 H100 CC-enabled 实例",
            "2. 启用 GPU CC 功能",
            "3. 验证 GPU 认证报告",
            "4. 部署 vLLM + CC 模式",
        ],
    },
}

# ═══ 性能基准 ═══
performance_benchmark = {
    "推理延迟": {
        "明文推理":     "BERT P95=10ms",
        "SGX 推理":     "BERT P95=15ms (+50%)",
        "TDX 推理":     "BERT P95=11ms (+10%)",
        "H100 CC 推理": "LLM 30tok/s → 27tok/s (-10%)",
    },
    "训练": {
        "TDX 训练":     "吞吐量 ~90% of 明文",
        "H100 CC 训练": "吞吐量 ~85% of 明文",
    },
}

# ═══ 最佳实践 ═══
best_practices = {
    "安全": [
        "最小化 Enclave/TD 中的代码 (减少攻击面)",
        "定期更新微码/固件 (修复侧信道漏洞)",
        "日志和审计 (但不在 Enclave 中)",
        "密钥用 Sealing 保护, 不硬编码",
    ],
    "性能": [
        "减少 Enclave 内外通信 (ECall/OCall 有开销)",
        "批处理请求 (减少上下文切换)",
        "预加载模型 (启动慢, 推理快)",
    ],
    "运维": [
        "自动化认证流程",
        "灰度发布: 先在 CC 实例上小流量验证",
        "监控 Enclave 内存使用和性能指标",
    ],
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
