import React from 'react';
import './LessonCommon.css';

export default function LessonCVProduction() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🚀 模块八：生产部署 — TensorRT / OpenVINO / 模型优化 / 性能测试</h1>
      <p className="lesson-subtitle">
        从实验到量产，掌握 CV 模型高性能部署与工程化全链路
      </p>

      <section className="lesson-section">
        <h2>1. CV 部署技术栈全景</h2>
        <div className="info-box">
          <h3>🏗️ 推理引擎对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>推理引擎</th><th>硬件</th><th>加速</th><th>最适场景</th></tr>
            </thead>
            <tbody>
              <tr><td>TensorRT</td><td>NVIDIA GPU</td><td>FP16/INT8/稀疏化</td><td>云端 + Jetson</td></tr>
              <tr><td>OpenVINO</td><td>Intel CPU/iGPU/VPU</td><td>INT8 + 图优化</td><td>x86 服务器</td></tr>
              <tr><td>ONNX Runtime</td><td>跨平台</td><td>EP 多后端</td><td>通用部署</td></tr>
              <tr><td>CoreML</td><td>Apple SoC</td><td>ANE 硬件加速</td><td>iOS / macOS</td></tr>
              <tr><td>TFLite</td><td>ARM/Coral</td><td>INT8 + 代理</td><td>Android / 边缘</td></tr>
              <tr><td>ncnn</td><td>ARM CPU</td><td>NEON/Vulkan</td><td>移动端 (国内流行)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 部署流程全链路</h3>
          <div className="code-block">
{`"""
CV 模型部署全链路:

训练框架 (PyTorch/PaddlePaddle)
    ↓  torch.onnx.export / paddle2onnx
中间表示 (ONNX)
    ↓  图优化 / 算子融合 / 常量折叠
    ├── TensorRT (GPU)
    │     ↓ FP16/INT8 量化 + 层融合 + Kernel Auto-Tune
    │     └── .engine / .plan 文件
    ├── OpenVINO (Intel)
    │     ↓ Model Optimizer → Inference Engine
    │     └── .xml + .bin 文件
    ├── ONNX Runtime
    │     ↓ Execution Provider (CUDA / TensorRT / CPU)
    │     └── .onnx 文件 (通用)
    └── ncnn / TFLite (Mobile)
          ↓ 量化 + 内存优化
          └── 移动端模型文件
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. TensorRT 深度实战</h2>
        <div className="concept-card">
          <h3>⚡ TensorRT 优化管线</h3>
          <div className="code-block">
{`import tensorrt as trt
import numpy as np

# TensorRT 构建 Engine
def build_engine(onnx_path, engine_path, precision='fp16'):
    logger = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(logger)
    config = builder.create_builder_config()
    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 4 << 30)  # 4GB
    
    # 精度设置
    if precision == 'fp16':
        config.set_flag(trt.BuilderFlag.FP16)
    elif precision == 'int8':
        config.set_flag(trt.BuilderFlag.INT8)
        config.int8_calibrator = EntropyCalibrator(
            data_loader,             # 校准数据 (200-500 张)
            cache_file='calibration.cache'
        )
    
    # 解析 ONNX
    network = builder.create_network(
        1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)
    )
    parser = trt.OnnxParser(network, logger)
    with open(onnx_path, 'rb') as f:
        parser.parse(f.read())
    
    # 动态 shape (可选)
    profile = builder.create_optimization_profile()
    profile.set_shape(
        'images',
        min=(1, 3, 640, 640),
        opt=(4, 3, 640, 640),
        max=(8, 3, 640, 640)
    )
    config.add_optimization_profile(profile)
    
    # 构建
    engine = builder.build_serialized_network(network, config)
    with open(engine_path, 'wb') as f:
        f.write(engine)
    return engine

# TensorRT 推理封装
class TRTInference:
    def __init__(self, engine_path):
        self.logger = trt.Logger(trt.Logger.WARNING)
        with open(engine_path, 'rb') as f:
            self.engine = trt.Runtime(self.logger).deserialize_cuda_engine(f.read())
        self.context = self.engine.create_execution_context()
    
    def infer(self, input_data):
        import pycuda.driver as cuda
        # 分配 GPU 内存, 拷贝, 执行, 拷回
        # ... (CUDA memory management)
        self.context.execute_v2(bindings)
        return output_data`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. OpenVINO 部署</h2>
        <div className="concept-card">
          <h3>🔧 OpenVINO 2024 工作流</h3>
          <div className="code-block">
{`import openvino as ov

# OpenVINO 2024: 简化 API
core = ov.Core()

# 1. 加载 ONNX 模型
model = core.read_model("yolo_model.onnx")

# 2. 模型优化 (INT8 量化)
import nncf  # Neural Network Compression Framework

calibration_dataset = nncf.Dataset(
    data_loader,
    transform_fn=lambda x: x['images']
)

quantized_model = nncf.quantize(
    model,
    calibration_dataset,
    model_type=nncf.ModelType.TRANSFORMER,  # 或 nncf.parameters.ModelType.CNN
    preset=nncf.QuantizationPreset.MIXED,   # 速度/精度平衡
)

# 3. 编译到目标设备
compiled_model = core.compile_model(
    quantized_model,
    device_name='CPU',     # 或 'GPU', 'AUTO', 'MULTI:CPU,GPU'
    config={
        'NUM_STREAMS': '4',            # 推理流数
        'INFERENCE_PRECISION_HINT': 'f32',
        'PERFORMANCE_HINT': 'THROUGHPUT'   # 或 'LATENCY'
    }
)

# 4. 推理
infer_request = compiled_model.create_infer_request()
input_tensor = ov.Tensor(input_data)
infer_request.set_input_tensor(input_tensor)
infer_request.infer()
output = infer_request.get_output_tensor().data

# 异步推理 (高吞吐)
infer_request.start_async()
infer_request.wait()  # 或设置回调`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 模型优化技术</h2>
        <div className="info-box">
          <h3>📋 优化技术矩阵</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>技术</th><th>原理</th><th>速度提升</th><th>精度损失</th></tr>
            </thead>
            <tbody>
              <tr><td>FP16 混合精度</td><td>权重/激活用半精度</td><td>1.5-2x</td><td>极小 (&lt;0.5%)</td></tr>
              <tr><td>INT8 量化</td><td>8 位整数运算</td><td>2-4x</td><td>小 (0.5-2%)</td></tr>
              <tr><td>结构化剪枝</td><td>移除整个通道/层</td><td>1.5-3x</td><td>中等 (1-3%)</td></tr>
              <tr><td>知识蒸馏</td><td>大模型指导小模型</td><td>变化大</td><td>可忽略</td></tr>
              <tr><td>算子融合</td><td>合并 Conv+BN+ReLU</td><td>1.2-1.5x</td><td>无</td></tr>
              <tr><td>图优化</td><td>常量折叠/死代码消除</td><td>1.1-1.3x</td><td>无</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📏 量化校准策略</h3>
          <div className="code-block">
{`# INT8 量化校准方法
"""
1. MinMax 校准:
   收集 min/max 值 → 线性映射到 [-128, 127]
   简单, 对异常值敏感

2. 熵校准 (Entropy):
   最小化 FP32 与 INT8 分布的 KL 散度
   TensorRT 默认, 通常最优

3. 百分位校准 (Percentile):
   忽略极端值 (99.9th percentile)
   对异常值鲁棒

校准数据要求:
- 数量: 200-1000 张代表性图像
- 多样性: 覆盖各种场景/光照/物体
- 质量: 避免异常数据 (全黑/过曝)
"""

# 量化感知训练 (QAT)
# 比 PTQ 精度更好, 但需要重新训练
import torch.quantization as quant

model.qconfig = quant.get_default_qat_qconfig('fbgemm')
quant.prepare_qat(model, inplace=True)

# 正常训练几个 epoch
for epoch in range(5):
    train(model, dataloader)

# 转换为量化模型
quantized = quant.convert(model, inplace=False)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>5. 性能测试与监控</h2>
        <div className="concept-card">
          <h3>📊 性能基准测试</h3>
          <div className="code-block">
{`import time
import numpy as np

def benchmark_model(model_fn, input_shape, warmup=50, iterations=500):
    """标准化性能测试"""
    dummy = np.random.randn(*input_shape).astype(np.float32)
    
    # Warm-up
    for _ in range(warmup):
        model_fn(dummy)
    
    # 正式测试
    latencies = []
    for _ in range(iterations):
        start = time.perf_counter()
        model_fn(dummy)
        latencies.append((time.perf_counter() - start) * 1000)
    
    latencies = np.array(latencies)
    report = {
        'mean_ms':   np.mean(latencies),
        'p50_ms':    np.percentile(latencies, 50),
        'p95_ms':    np.percentile(latencies, 95),
        'p99_ms':    np.percentile(latencies, 99),
        'fps':       1000 / np.mean(latencies),
        'std_ms':    np.std(latencies),
    }
    return report

# 生产监控指标
monitoring_metrics = {
    "推理延迟":    "P50/P95/P99 延迟 + 告警阈值",
    "吞吐量":      "FPS / QPS (每秒处理图像数)",
    "GPU 利用率":   "nvidia-smi / DCGM Exporter",
    "内存占用":    "GPU Memory / System Memory",
    "精度漂移":    "定期评估 mAP, 检测漂移 → 模型更新",
    "输入质量":    "图像亮度/对比度/模糊度 → 预警",
    "系统可用性":   "健康检查 / 自动重启 / 故障转移",
}

# Prometheus + Grafana 监控
"""
推理服务 → Prometheus 指标暴露
  ├── inference_latency_seconds (Histogram)
  ├── inference_total (Counter)
  ├── model_version (Gauge)
  ├── detection_count (Counter per class)
  └── input_quality_score (Gauge)
     ↓
Grafana Dashboard → 可视化 + 告警 → PagerDuty/飞书
"""`}
          </div>
        </div>

        <div className="info-box">
          <h3>📋 CV 生产部署检查清单</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>检查项</th><th>标准</th><th>工具</th></tr>
            </thead>
            <tbody>
              <tr><td>模型精度</td><td>FP16/INT8 精度损失 &lt; 1%</td><td>pycocotools / 自定义评估</td></tr>
              <tr><td>推理速度</td><td>满足业务 SLA (如 &lt; 50ms)</td><td>trtexec / benchmark 脚本</td></tr>
              <tr><td>内存占用</td><td>不超过设备 80% 显存</td><td>nvidia-smi / torch.cuda</td></tr>
              <tr><td>吞吐量</td><td>满足并发需求</td><td>locust / wrk 压测</td></tr>
              <tr><td>稳定性</td><td>7×24 无内存泄漏</td><td>长时间运行测试</td></tr>
              <tr><td>回退方案</td><td>模型版本管理 + 一键回退</td><td>MLflow / Triton</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：工业视觉</span>
        <span></span>
      </div>
    </div>
  );
}
