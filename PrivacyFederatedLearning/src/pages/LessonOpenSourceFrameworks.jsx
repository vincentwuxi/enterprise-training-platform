import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['FATE', 'Flower', 'PySyft / OpenFL', '选型与架构'];

export default function LessonOpenSourceFrameworks() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge indigo">🛠️ module_08 — 开源框架实战</div>
      <div className="fs-hero">
        <h1>开源框架实战：FATE / Flower / PySyft / OpenFL — 隐私计算工程化</h1>
        <p>
          掌握主流开源隐私计算框架是工程落地的关键。本模块深入
          <strong>FATE</strong> (微众银行，纵向联邦首选)、
          <strong>Flower</strong> (最灵活的联邦学习框架)、
          <strong>PySyft</strong> (OpenMined，MPC/DP 集成) 和
          <strong>OpenFL</strong> (Intel，TEE+FL)，
          对比架构差异，并提供企业级选型指南和生产部署最佳实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🛠️ 开源框架</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎭 FATE (微众银行)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> fate_framework</div>
              <pre className="fs-code">{`# FATE: 国内最成熟的隐私计算框架
# Federated AI Technology Enabler
# 微众银行开源, Linux Foundation 项目

# ═══ 核心特点 ═══
fate_features = {
    "纵向联邦":     "最完善的纵向联邦学习实现",
    "横向联邦":     "支持常见 ML 模型 (LR/XGBoost/NN)",
    "安全协议":     "RSA/Paillier 加密 + SPDZ MPC",
    "PSI":          "内置隐私集合求交",
    "调度引擎":     "DAG 任务编排, 多方协调",
    "可视化":       "FATE Board 管理界面",
}

# ═══ 架构 ═══
fate_architecture = {
    "FATE Flow":   "任务调度和生命周期管理",
    "FATE Board":  "Web 可视化界面",
    "FATE Serving": "在线推理服务",
    "EggRoll":     "计算和存储引擎",
    "Federation":  "跨站点通信 (gRPC)",
}

# ═══ FATE 纵向联邦 LR 实战 ═══
# pipeline_config.yaml
pipeline_config = {
    "components": {
        "reader_0": {"module": "Reader"},
        "data_transform_0": {
            "module": "DataTransform",
            "output": {"data": ["train"]},
        },
        "intersection_0": {
            "module": "Intersection",  # PSI 隐私求交
            "output": {"data": ["intersect"]},
        },
        "hetero_lr_0": {
            "module": "HeteroLR",  # 纵向逻辑回归
            "input": {"data": {"train": "intersection_0.intersect"}},
            "output": {"model": ["model"]},
            "params": {
                "penalty": "L2",
                "optimizer": "sgd",
                "learning_rate": 0.01,
                "max_iter": 100,
                "early_stop": "weight_diff",
                "encrypt_param": {
                    "method": "Paillier",
                    "key_length": 1024,
                },
            },
        },
    },
}

# ═══ 部署方式 ═══
# 1. Docker Compose (单机测试)
#    docker-compose -f docker-compose.yaml up
# 2. Kubernetes (生产环境)
#    KubeFATE 管理工具
# 3. 云原生 (公有云)
#    阿里云/华为云 FATE 托管服务`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌸 Flower (最灵活)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> flower_framework</div>
              <pre className="fs-code">{`# Flower: 最灵活、最易用的联邦学习框架
# "A Friendly Federated Learning Framework"
# 支持任意 ML 框架: PyTorch / TensorFlow / JAX / 🤗

# ═══ 核心特点 ═══
flower_features = {
    "框架无关":     "任意 ML 框架, 包括 LLM 微调",
    "极简 API":     "~20 行代码即可开始联邦训练",
    "高度灵活":     "自定义聚合策略/通信/调度",
    "模拟模式":     "单机模拟多客户端 (快速原型)",
    "生产就绪":     "gRPC 通信, TLS 加密",
    "DP 集成":      "内置差分隐私支持",
}

# ═══ Flower 最简示例 ═══

# --- server.py ---
import flwr as fl

# 自定义聚合策略
strategy = fl.server.strategy.FedAvg(
    fraction_fit=0.3,        # 每轮选择 30% 客户端
    min_fit_clients=2,       # 至少 2 个客户端
    min_available_clients=3, # 至少 3 个可用
)

fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=10),
    strategy=strategy,
)

# --- client.py ---
import flwr as fl
import torch

class FlowerClient(fl.client.NumPyClient):
    def __init__(self, model, trainloader):
        self.model = model
        self.trainloader = trainloader
    
    def get_parameters(self, config):
        return [p.cpu().numpy() for p in self.model.parameters()]
    
    def fit(self, parameters, config):
        # 设置模型参数
        set_parameters(self.model, parameters)
        # 本地训练
        train(self.model, self.trainloader, epochs=1)
        # 返回更新后的参数
        return self.get_parameters(config), len(self.trainloader), {}
    
    def evaluate(self, parameters, config):
        set_parameters(self.model, parameters)
        loss, accuracy = test(self.model, self.testloader)
        return loss, len(self.testloader), {"accuracy": accuracy}

fl.client.start_client(
    server_address="server:8080",
    client=FlowerClient(model, trainloader),
)

# ═══ Flower + LoRA 联邦微调 LLM ═══
# 已有官方示例: flower/examples/federated-finetuning-llm
# 支持 QLoRA + FedAvg 对 LLaMA/Qwen 联邦微调`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔑 PySyft / OpenFL</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> pysyft_openfl</div>
              <pre className="fs-code">{`# PySyft 和 OpenFL: 两种不同的设计哲学

# ═══ PySyft (OpenMined) ═══
pysyft_features = {
    "理念":     "远程数据科学 — 代码到数据, 而非数据到代码",
    "隐私技术": "FL + MPC + DP 集成",
    "特色":     "Tensor-level 隐私 API",
    "目标用户": "数据科学家 (熟悉 NumPy/PyTorch)",
}

# PySyft 示例: 远程数据访问
import syft as sy

# 连接到数据拥有者的节点
domain = sy.login(url="http://hospital-a.org", email="researcher")

# 发现可用数据集 (只看到元数据, 不看原始数据)
datasets = domain.datasets
ct_data = datasets["lung_ct"]

# 用 Mock 数据开发代码
mock_ct = ct_data.mock  # 合成/脱敏数据
model = train_model(mock_ct)  # 开发调试

# 提交计算请求 (代码到数据!)
request = domain.code.submit(
    func=train_model,
    data=ct_data,
    reason="联合肺部CT诊断研究",
)
# 数据拥有者审批后, 代码在远端运行
# 研究者只收到结果 (模型参数), 不看到原始数据

# ═══ OpenFL (Intel) ═══
openfl_features = {
    "理念":     "企业级联邦学习, 与 Intel TEE 集成",
    "特色":     "Aggregation API + Task Runner API",
    "TEE":      "与 Intel SGX/TDX 原生集成",
    "认证":     "FDA 认可用于医疗 AI 研究",
    "用户":     "医疗/制药行业首选",
}

# OpenFL 简要示例
from openfl.interface import FLSpec

# 定义联邦学习实验
fl_experiment = FLSpec(
    model=model,
    optimizer=optimizer,
    rounds=50,
    aggregation='weighted_average',
    data_loader=data_loader,
)

# 启动联邦训练
fl_experiment.start()

# ═══ 框架对比 ═══
# ┌────────────┬──────────────┬──────────────┬──────────────┐
# │            │ PySyft       │ OpenFL       │ SecretFlow   │
# ├────────────┼──────────────┼──────────────┼──────────────┤
# │ 开发者      │ OpenMined    │ Intel        │ 蚂蚁集团     │
# │ 核心优势    │ MPC+DP 集成   │ TEE 集成     │ 全栈平台     │
# │ 行业偏好    │ 学术/研究     │ 医疗/FDA     │ 金融/政务    │
# │ 学习曲线    │ 中           │ 低           │ 中           │
# │ 生产成熟度  │ 中           │ 高           │ 高           │
# └────────────┴──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🗺️ 企业选型与架构</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> selection_guide</div>
              <pre className="fs-code">{`# 企业级隐私计算平台选型指南

# ═══ 维度对比 ═══
framework_comparison = {
    "FATE": {
        "适合":      "纵向联邦, 金融场景",
        "语言":      "Python, 底层 C++",
        "部署":      "Docker/K8s, 较重",
        "社区":      "中国为主, 活跃",
        "商业":      "微众银行商业版",
        "推荐场景":  "银行+电商联合建模",
    },
    "Flower": {
        "适合":      "横向联邦, 研究/原型",
        "语言":      "Python",
        "部署":      "轻量, pip install",
        "社区":      "国际, 增长最快",
        "商业":      "Flower Labs 商业支持",
        "推荐场景":  "快速验证/LLM 联邦微调",
    },
    "SecretFlow": {
        "适合":      "全栈 (FL+MPC+TEE+DP)",
        "语言":      "Python, 底层 C++/Rust",
        "部署":      "Docker/K8s",
        "社区":      "中国, 快速增长",
        "商业":      "蚂蚁摩斯 (MORSE)",
        "推荐场景":  "金融/政务, 需要全栈能力",
    },
}

# ═══ 选型决策树 ═══
decision_tree = {
    "纵向联邦 (跨行业)": {
        "金融场景": "FATE (成熟) 或 SecretFlow (全栈)",
        "通用场景": "SecretFlow 或 PrimiHub",
    },
    "横向联邦 (同行业)": {
        "快速原型":   "Flower (最灵活)",
        "医疗/FDA":   "OpenFL (Intel 认证)",
        "大规模生产": "FATE 或 SecretFlow",
    },
    "MPC 场景": {
        "学术研究": "MP-SPDZ (最全协议)",
        "PyTorch":  "CrypTen",
        "生产环境": "SecretFlow SPU",
    },
    "联邦 LLM": {
        "首选":  "Flower (官方支持 LLM 微调)",
        "备选":  "FATE-LLM (微众银行扩展)",
    },
}

# ═══ 生产架构蓝图 ═══
production_architecture = {
    "接入层": "API Gateway + 身份认证 + 流量控制",
    "调度层": "任务编排 + 资源调度 + 容错恢复",
    "计算层": "FL Engine + MPC Engine + TEE Runtime",
    "通信层": "gRPC + TLS + 消息队列",
    "存储层": "分布式存储 + 向量库 + 元数据管理",
    "安全层": "密钥管理 + 审计日志 + 访问控制",
    "监控层": "性能监控 + 隐私预算 + 告警",
}

# ═══ 成本估算 ═══
cost_estimation = {
    "小型 (2-3方, PoC)": {
        "硬件":   "2 台 8C32G 服务器, ¥5万/年",
        "软件":   "开源 (0) + 部署运维 ¥10万",
        "人力":   "2 人·6月 ≈ ¥60万",
        "总计":   "¥75万 (一次性) + ¥15万/年",
    },
    "中型 (5-10方, 生产)": {
        "硬件":   "K8s集群 + GPU, ¥50万/年",
        "软件":   "商业版 ¥30-80万/年",
        "人力":   "5 人团队, ¥200万/年",
        "总计":   "¥280-330万/年",
    },
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
