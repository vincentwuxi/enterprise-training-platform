import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['视觉质检', '预测维护', '供应链优化', '数字孪生'];

export default function LessonManufacturingAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge blue">🏭 module_06 — 制造 AI</div>
      <div className="fs-hero">
        <h1>制造 AI：视觉质检 / 预测维护 / 供应链 / 数字孪生</h1>
        <p>
          智能制造是工业 4.0 的核心——AI 让产线从"经验驱动"变为"数据驱动"。
          本模块覆盖 AI 视觉质检（缺陷检测/少样本/Edge 部署）、
          设备预测维护（故障预测/寿命估计/IoT 数据分析）、
          智能供应链（需求预测/排程优化/库存管理）、
          以及数字孪生（虚拟产线/仿真优化/工艺参数）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏭 制造 AI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>👁️ AI 视觉质检</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> visual_inspection</div>
                <pre className="fs-code">{`# —— AI 视觉质检: 从人工目检到 AI 全自动 ——

工业视觉质检系统:

    相机 → 采图 → AI推理 → 判定 → 分拣
         (GigE/USB3)  (Edge GPU)  (OK/NG)  (机械臂)

AI 质检应用场景:
┌──────────────┬──────────────┬──────────┬──────────┐
│ 行业          │ 检测对象      │ 缺陷类型  │ 难度     │
├──────────────┼──────────────┼──────────┼──────────┤
│ 半导体        │ 晶圆/芯片    │ 划痕/颗粒 │ ⭐⭐⭐⭐⭐  │
│ 新能源电池    │ 极片/电芯    │ 破损/褶皱 │ ⭐⭐⭐⭐   │
│ PCB          │ 电路板       │ 焊点/短路 │ ⭐⭐⭐⭐   │
│ 汽车零部件    │ 车身/零件    │ 凹坑/裂纹 │ ⭐⭐⭐    │
│ 纺织         │ 布匹/成衣    │ 色差/瑕疵 │ ⭐⭐⭐    │
│ 食品包装      │ 包装/标签    │ 漏印/错印 │ ⭐⭐      │
│ 3C 电子      │ 手机/平板    │ 屏幕/外壳 │ ⭐⭐⭐⭐   │
└──────────────┴──────────────┴──────────┴──────────┘

技术方案:
1️⃣ 分类: 良品/不良品 (最基础)
   └── EfficientNet + TensorRT → <5ms/张

2️⃣ 目标检测: 定位缺陷位置
   └── YOLOv8/RT-DETR → <10ms/张

3️⃣ 语义分割: 像素级缺陷标注
   └── U-Net/SegFormer → <20ms/张

4️⃣ 异常检测: 无需缺陷样本 (关键!)
   └── PatchCore / DRAEM / AnomalyGPT
   └── 只需正常样本即可训练

少样本方案 (核心痛点: 缺陷样本少):
├── 数据增强: 旋转/翻转/CutPaste
├── 生成式: Diffusion 合成缺陷图
├── 自监督: MAE 预训练 → 少量微调
├── 异常检测: 只需正品样本
└── 零样本: CLIP/SAM + 文本描述

Edge 部署:
├── 硬件: NVIDIA Jetson / Intel NCS / RK3588
├── 优化: TensorRT / ONNX / INT8 量化
├── 延迟: < 50ms (满足产线节拍)
└── 可靠性: 7×24, 温度 -10~60°C

效果:
├── 检出率: 99.5%+ (vs 人工 90%)
├── 误判率: < 0.5%
├── 速度: 500-2000 个/分钟
├── ROI: 6-12月回本
└── 人力: ↓ 60-80%`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 设备预测维护</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> predictive_maintenance.py</div>
                <pre className="fs-code">{`# —— 预测维护: 从"坏了修"到"提前修" ——

class PredictiveMaintenance:
    """设备预测维护系统"""
    
    # 维护策略演进:
    # 事后维护 → 定期维护 → 状态维护 → 预测维护
    #  (坏了才修)  (按时间修)  (监测状态)  (AI预测)
    
    def predict_failure(self, sensor_data):
        """故障预测"""
        # 传感器数据:
        # ├── 振动 (加速度计)
        # ├── 温度 (热电偶)
        # ├── 电流 (电流互感器)
        # ├── 声音 (麦克风/超声波)
        # └── 压力/流量/转速
        
        # 特征工程 (工业时序特征)
        features = self.extract_features(sensor_data)
        # ├── 时域: 均值/方差/峭度/波峰因子
        # ├── 频域: FFT频谱/包络谱
        # ├── 时频: 小波变换
        # └── 趋势: 退化趋势斜率
        
        # 多任务预测
        prediction = self.model.predict(features)
        return {
            "fault_probability": prediction.fault_prob,      # 故障概率
            "remaining_life": prediction.rul,                # 剩余寿命(小时)
            "fault_type": prediction.fault_class,            # 故障类型
            "confidence": prediction.confidence,             # 置信度
            "recommended_action": self.recommend(prediction) # 建议
        }
    
    # 模型选择:
    # ├── 传统ML: XGBoost (可解释性好)
    # ├── 深度学习: 1D-CNN + LSTM (精度高)
    # ├── Transformer: 长序列时序 (SOTA)
    # └── 物理模型+ML: 机理+数据混合 (可靠)
    
    # 典型应用:
    # ├── 风电: 齿轮箱/轴承故障 (提前30天预警)
    # ├── 航空: 发动机退化 (剩余寿命预测)
    # ├── 半导体: 真空泵/RF源 (停机损失$1M/天)
    # ├── 轨交: 转向架/车轴 (安全关键)
    # └── 化工: 旋转设备 (振动监测)

# 效果:
# ├── 非计划停机: ↓ 50-70%
# ├── 维护成本: ↓ 20-40%
# ├── 设备寿命: ↑ 10-20%
# └── ROI: 3-10x (第一年)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📊 智能排程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> scheduling</div>
                <pre className="fs-code">{`智能排程 (APS):

传统排程 vs AI 排程:
┌──────────┬──────────┬──────────┐
│          │ 传统      │ AI       │
├──────────┼──────────┼──────────┤
│ 方法     │ 规则/经验 │ 优化算法 │
│ 维度     │ 单目标    │ 多目标   │
│ 响应     │ 小时级    │ 分钟级   │
│ 约束     │ 简单      │ 复杂    │
│ 效率     │ ★★       │ ★★★★★  │
└──────────┴──────────┴──────────┘

优化目标:
├── 最小化: 交期延误
├── 最大化: 设备利用率
├── 最小化: 换线次数
├── 最小化: 在制品库存
└── 平衡: 多目标 Pareto

约束条件:
├── 设备能力/可用性
├── 人员排班/技能
├── 物料到料时间
├── 工艺路线顺序
├── 质量检验节点
└── 客户优先级

AI 方法:
├── 遗传算法 (GA)
├── 强化学习 (DRL)
├── 约束规划 (CP-SAT)
└── 混合: 规则 + ML

效果:
├── 产能利用率: ↑ 10-25%
├── 交期达成率: ↑ 15-30%
├── 换线时间: ↓ 20-40%
└── 排程时间: 数小时 → 5分钟`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📦 制造供应链</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> mfg_supply_chain</div>
                <pre className="fs-code">{`制造业供应链 AI:

1️⃣ 需求预测
├── 历史订单 + 外部信号
│   (经济指标/季节/促销)
├── 层次预测: 品类→SKU→仓库
├── 概率预测: 分位数回归
│   P50/P75/P90 预测值
├── 精度: MAPE 8-15%
└── 效果: 库存成本 ↓ 20%

2️⃣ 供应商管理
├── 供应商评分模型
│   质量/交期/价格/服务
├── 风险预警: NLP 监控新闻
│   供应商财务/合规/地缘风险
├── 多源替代推荐
└── 效果: 供应中断 ↓ 40%

3️⃣ 库存优化
├── 安全库存动态计算
│   考虑需求不确定性+供应不确定性
├── ABC-XYZ 分类
│   不同品类不同策略
├── 多级库存优化
│   原材料-在制品-成品
└── 效果: 库存周转 ↑ 30%

4️⃣ 物流优化
├── 运输路径优化 (VRP)
├── 装载优化 (3D装箱)
├── 多式联运选择
└── 效果: 物流成本 ↓ 15%

工业4.0 技术栈:
├── IoT Sensor → 边缘计算
├── MES/ERP → 数据整合
├── 数字孪生 → 仿真优化
├── 5G/TSN → 实时通信
└── AI → 智能决策`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 数字孪生</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> digital_twin</div>
                <pre className="fs-code">{`# —— 数字孪生: 虚拟世界映射物理世界 ——

数字孪生 (Digital Twin) 架构:
                                           
 ┌─────────────┐    实时数据    ┌──────────────┐
 │  物理世界     │──────────────▶│  数字世界      │
 │  (产线/设备)  │              │  (3D仿真模型)  │
 │              │◀──────────────│              │
 └─────────────┘    优化指令    └──────────────┘
        │                             │
    IoT 传感器                     AI 分析
    ├── 温度/压力                  ├── 状态监测
    ├── 振动/电流                  ├── 异常检测
    ├── 图像/视频                  ├── 仿真优化
    └── 位置/速度                  └── 参数推荐

应用场景:
┌──────────────┬──────────────┬──────────────────┐
│ 场景          │ 描述          │ 价值              │
├──────────────┼──────────────┼──────────────────┤
│ 产线仿真      │ 虚拟调试新    │ 调试时间 ↓ 30-50% │
│              │ 产线/新产品    │ 投产风险 ↓         │
├──────────────┼──────────────┼──────────────────┤
│ 工艺优化      │ AI搜索最优    │ 良率 ↑ 2-5%       │
│              │ 工艺参数       │ 能耗 ↓ 10-20%     │
├──────────────┼──────────────┼──────────────────┤
│ 预测维护      │ 设备状态实时   │ 停机 ↓ 50%        │
│              │ 映射+预测     │ 维护成本 ↓ 30%     │
├──────────────┼──────────────┼──────────────────┤
│ 培训演练      │ VR/AR操作    │ 培训时间 ↓ 40%     │
│              │ 培训          │ 安全事故 ↓         │
└──────────────┴──────────────┴──────────────────┘

技术栈:
├── 3D 引擎: Unity / Unreal / NVIDIA Omniverse
├── 物理仿真: FEA / CFD / 多体动力学
├── AI: 替代模型 (Surrogate Model)
│   用 ML 替代物理仿真 → 1000x 加速
├── IoT: MQTT / OPC UA / Kafka
└── 可视化: WebGL / Three.js / Cesium

AI + 数字孪生 = 闭环优化:
1. 物理世界 → IoT 数据 → 数字孪生
2. 数字孪生 → AI 分析 → 优化方案
3. 优化方案 → 仿真验证 → 物理执行
4. 物理结果 → 反馈更新 → 模型校准
→ 持续改进的智能产线`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
