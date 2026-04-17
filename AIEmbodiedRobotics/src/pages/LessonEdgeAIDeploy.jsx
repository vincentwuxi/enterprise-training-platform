import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['TensorRT/ONNX', 'NPU/边缘芯片', '模型量化', '部署流水线'];

export default function LessonEdgeAIDeploy() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge orange">⚡ module_04 — 端侧 AI 部署</div>
      <div className="fs-hero">
        <h1>端侧 AI 部署：TensorRT / ONNX Runtime / NPU / 量化推理 — 机器人的实时大脑</h1>
        <p>
          机器人的 AI 模型必须在边缘设备上实时运行：感知 &lt;50ms、控制 &lt;10ms。
          <strong>NVIDIA Jetson</strong> 系列 (Orin/Thor) 是机器人的主流计算平台，
          <strong>TensorRT</strong> 提供极致推理加速，INT8/INT4 量化让大模型跑在边缘。
          本模块覆盖从模型优化到端侧部署的完整工程实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚡ 边缘部署</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🚀 TensorRT / ONNX Runtime</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> tensorrt_onnx</div>
              <pre className="fs-code">{`# TensorRT: NVIDIA GPU 极致推理加速

# ═══ 部署流水线 ═══
# PyTorch 模型 → ONNX → TensorRT → 部署
# ┌───────┐    ┌──────┐    ┌──────────┐    ┌────────┐
# │PyTorch│ →  │ ONNX │ →  │TensorRT  │ →  │Jetson  │
# │ .pt   │    │ .onnx│    │ .engine  │    │ 实时推理│
# └───────┘    └──────┘    └──────────┘    └────────┘

# Step 1: PyTorch → ONNX
import torch
import torch.onnx

model = load_robot_perception_model()
dummy_input = torch.randn(1, 3, 640, 640).cuda()

torch.onnx.export(
    model, dummy_input,
    "perception.onnx",
    opset_version=17,
    input_names=["image"],
    output_names=["detections"],
    dynamic_axes={"image": {0: "batch"}},
)

# Step 2: ONNX → TensorRT
import tensorrt as trt

logger = trt.Logger(trt.Logger.WARNING)
builder = trt.Builder(logger)
network = builder.create_network(
    1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)
)
parser = trt.OnnxParser(network, logger)

with open("perception.onnx", "rb") as f:
    parser.parse(f.read())

config = builder.create_builder_config()
config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30)

# FP16 加速 (Jetson 强项)
config.set_flag(trt.BuilderFlag.FP16)

# INT8 量化 (需要校准数据)
# config.set_flag(trt.BuilderFlag.INT8)
# config.int8_calibrator = MyCalibrator(calib_data)

engine = builder.build_serialized_network(network, config)
with open("perception.engine", "wb") as f:
    f.write(engine)

# Step 3: TensorRT 推理
import tensorrt as trt
import pycuda.driver as cuda

runtime = trt.Runtime(logger)
with open("perception.engine", "rb") as f:
    engine = runtime.deserialize_cuda_engine(f.read())

context = engine.create_execution_context()
# → 推理延迟: FP32 50ms → FP16 12ms → INT8 6ms

# ═══ ONNX Runtime (跨平台) ═══
import onnxruntime as ort

# CPU 部署 (ARM/x86)
session = ort.InferenceSession(
    "perception.onnx",
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
)

result = session.run(None, {"image": input_array})

# ═══ 延迟基准 (Jetson Orin) ═══
# ┌─────────────────┬─────────┬────────┬────────┐
# │ 模型            │ FP32    │ FP16   │ INT8   │
# ├─────────────────┼─────────┼────────┼────────┤
# │ YOLOv8-S        │ 12ms    │ 5ms    │ 3ms    │
# │ ResNet-50       │ 8ms     │ 3ms    │ 2ms    │
# │ ViT-Base        │ 25ms    │ 10ms   │ 6ms    │
# │ Octo-Base (93M) │ 45ms    │ 18ms   │ 10ms   │
# └─────────────────┴─────────┴────────┴────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔧 NPU / 边缘芯片</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> edge_chips</div>
              <pre className="fs-code">{`# 机器人边缘 AI 芯片全景

# ═══ NVIDIA Jetson 系列 ═══
jetson_lineup = {
    "Jetson Orin Nano": {
        "算力": "40 TOPS (INT8)",
        "GPU":  "1024 CUDA cores",
        "内存": "8GB LPDDR5",
        "功耗": "7-15W",
        "适用": "小型机器人/无人机",
        "价格": "~$499",
    },
    "Jetson Orin NX": {
        "算力": "100 TOPS",
        "GPU":  "2048 CUDA cores",
        "内存": "16GB LPDDR5",
        "功耗": "10-25W",
        "适用": "机械臂/AMR",
        "价格": "~$699",
    },
    "Jetson AGX Orin": {
        "算力": "275 TOPS",
        "GPU":  "2048 CUDA + Tensor cores",
        "内存": "64GB LPDDR5",
        "功耗": "15-60W",
        "适用": "自动驾驶/人形机器人",
        "价格": "~$1999",
    },
    "Jetson Thor (2025)": {
        "算力": "800 TOPS!",
        "架构": "Blackwell GPU + Grace CPU",
        "特色": "专为人形机器人设计",
        "适用": "运行 GR00T Foundation Model",
        "LLM":  "可本地运行 7B-13B 模型",
    },
}

# ═══ 中国边缘 AI 芯片 ═══
china_chips = {
    "地平线 征程6": {
        "算力": "560 TOPS",
        "适用": "自动驾驶/机器人",
        "特色": "BPU 架构, 高效 Transformer",
    },
    "寒武纪 思元370": {
        "算力": "256 TOPS",
        "适用": "边缘 AI 服务器",
    },
    "瑞芯微 RK3588": {
        "算力": "6 TOPS (NPU)",
        "适用": "低成本机器人/摄像头",
        "价格": "~$80",
        "特色": "极致性价比, 8K 视频",
    },
}

# ═══ 芯片选型决策 ═══
# ┌────────────────┬───────────────┬──────────┐
# │ 场景           │ 推荐芯片      │ 预算      │
# ├────────────────┼───────────────┼──────────┤
# │ 小型服务机器人 │ Jetson Orin   │ $500-700 │
# │ 工业机械臂     │ Orin NX/AGX   │ $700-2K  │
# │ 自动驾驶       │ AGX Orin ×2   │ $4K+     │
# │ 人形机器人     │ Thor          │ $2K+     │
# │ 低成本方案     │ RK3588        │ $80-100  │
# └────────────────┴───────────────┴──────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📦 模型量化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> quantization</div>
              <pre className="fs-code">{`# 模型量化: 让大模型跑在边缘设备

# ═══ 量化基础 ═══
# FP32 (32bit) → FP16 (16bit) → INT8 (8bit) → INT4 (4bit)
# 精度:  高 ←────────────────────────────→ 低
# 速度:  慢 ←────────────────────────────→ 快
# 内存:  大 ←────────────────────────────→ 小

# ═══ 量化方法 ═══
quantization_methods = {
    "训练后量化 (PTQ)": {
        "原理": "训练后直接量化权重",
        "步骤": "准备校准数据 → 统计分布 → 量化",
        "精度损失": "INT8 通常 <1%, INT4 需注意",
        "适用": "大多数部署场景",
    },
    "量化感知训练 (QAT)": {
        "原理": "训练时模拟量化误差",
        "步骤": "插入伪量化节点 → 继续训练",
        "精度损失": "极低, 接近原模型",
        "适用": "精度要求高的场景",
    },
    "GPTQ/AWQ": {
        "原理": "大模型专用量化 (4-bit)",
        "适用": "VLM/LLM 在边缘运行",
        "工具": "AutoGPTQ, llm.int8()",
    },
}

# ═══ PyTorch PTQ 示例 ═══
import torch.quantization as quant

# 动态量化 (最简单)
model_int8 = quant.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# 静态量化 (需要校准)
model.qconfig = quant.get_default_qconfig('fbgemm')
model_prepared = quant.prepare(model)

# 校准 (用代表性数据)
for batch in calibration_loader:
    model_prepared(batch)

model_quantized = quant.convert(model_prepared)

# ═══ TensorRT INT8 量化 ═══
# 使用校准器自动确定量化参数
class RobotCalibrator(trt.IInt8EntropyCalibrator2):
    def __init__(self, data_loader):
        super().__init__()
        self.data_loader = data_loader
        self.batch_iter = iter(data_loader)
        
    def get_batch(self, names):
        try:
            batch = next(self.batch_iter)
            return [batch.data_ptr()]
        except StopIteration:
            return None

# ═══ 量化效果对比 ═══
# 模型: Octo-Base (93M params)
# ┌────────┬────────┬───────┬──────────┐
# │ 精度   │ 大小   │ 延迟  │ 成功率   │
# ├────────┼────────┼───────┼──────────┤
# │ FP32   │ 372MB  │ 45ms  │ 92.3%    │
# │ FP16   │ 186MB  │ 18ms  │ 92.1%    │
# │ INT8   │ 93MB   │ 10ms  │ 91.5%    │
# │ INT4   │ 47MB   │ 6ms   │ 89.8%    │
# └────────┴────────┴───────┴──────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 部署流水线</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> deployment_pipeline</div>
              <pre className="fs-code">{`# 端到端机器人 AI 部署流水线

# ═══ 完整部署架构 ═══
# ┌─────────────────────────────────────────┐
# │           机器人控制系统                  │
# │                                         │
# │  ┌──────┐  ┌──────────┐  ┌───────────┐ │
# │  │传感器│→ │感知模型   │→ │决策/规划  │ │
# │  │RGB   │  │TensorRT  │  │策略网络   │ │
# │  │Depth │  │<10ms     │  │<5ms       │ │
# │  │LiDAR │  └──────────┘  └───────────┘ │
# │  └──────┘                      ↓       │
# │              ┌───────────────────┐      │
# │              │ 低层控制器        │      │
# │              │ PD/力控 <1ms      │      │
# │              └───────────────────┘      │
# │                      ↓                 │
# │              ┌───────────────────┐      │
# │              │ 电机驱动          │      │
# │              │ 1kHz 控制环       │      │
# │              └───────────────────┘      │
# └─────────────────────────────────────────┘

# ═══ Jetson 部署脚本 ═══
# Dockerfile for Jetson Orin
DOCKERFILE = """
FROM nvcr.io/nvidia/l4t-tensorrt:r35.3.1-runtime

# 安装 ROS 2 Humble
RUN apt-get update && apt-get install -y ros-humble-base

# 安装 Python 依赖
COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

# 复制模型和代码
COPY models/ /app/models/
COPY src/ /app/src/

# 启动节点
CMD ["ros2", "launch", "robot_ai", "perception.launch.py"]
"""

# ═══ 多进程实时架构 ═══
# 感知进程 (30Hz, GPU)
#   → 检测/分割/深度估计
#   → 发布到 /perception/objects
#
# 决策进程 (10Hz, GPU)
#   → 策略网络推理
#   → 发布到 /planning/action
#
# 控制进程 (1000Hz, CPU, 实时)
#   → PD 控制器
#   → 直接写入关节电机
#
# 关键: 控制进程必须是实时优先级!

import multiprocessing as mp

def perception_process(model_path):
    """30Hz 感知循环"""
    engine = load_tensorrt_engine(model_path)
    while True:
        image = camera.read()
        detections = engine.infer(image)  # <10ms
        publish("/perception/objects", detections)

def control_process():
    """1kHz 实时控制循环"""
    import os
    os.sched_setscheduler(0, os.SCHED_FIFO, 
                          os.sched_param(99))
    while True:
        target = get_latest("/planning/action")
        current = read_joint_sensors()
        torque = pd_controller(target, current)
        write_motors(torque)
        # 精确 1ms 定时
        precise_sleep(0.001)

# ═══ OTA 更新流程 ═══
ota_update = {
    "1. 云端训练": "A100 集群训练新模型",
    "2. 导出":     "PyTorch → ONNX → TensorRT",
    "3. 测试":     "仿真环境回归测试",
    "4. 推送":     "OTA 推送到 Jetson 集群",
    "5. 灰度":     "10% 机器人先升级验证",
    "6. 全量":     "验证通过后全量升级",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
