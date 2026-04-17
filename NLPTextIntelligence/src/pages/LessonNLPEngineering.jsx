import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['标注平台', '模型服务', '质量监控', '全链路实战'];

export default function LessonNLPEngineering() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge indigo">⚙️ module_08 — 企业级 NLP 工程化</div>
      <div className="fs-hero">
        <h1>企业级 NLP 工程化：标注平台 / 模型服务 / 质量监控 — 从实验到生产</h1>
        <p>
          模型效果再好，不能上线就是零。本模块覆盖企业 NLP 系统的
          <strong>全生命周期工程化</strong>：标注平台建设 → 模型训练与实验管理 →
          模型服务部署 (TorchServe/Triton/vLLM) → 线上质量监控与数据飞轮。
          打通从<strong>数据标注到模型迭代</strong>的完整闭环。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ NLP 工程化</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏷️ 标注平台与数据工程</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> annotation_platform</div>
              <pre className="fs-code">{`# 数据标注: NLP 项目成败的关键!

# ═══ 标注平台选型 ═══
annotation_platforms = {
    "Label Studio":   "开源, 功能全, 支持NLP/CV/Audio",
    "Doccano":        "开源, NLP 专用, 轻量",
    "Prodigy":        "商业, 主动学习集成, 高效",
    "Labelbox":       "商业, 企业级, 团队协作",
    "自研":           "完全定制, 但开发成本高",
}

# ═══ 标注规范设计 ═══
annotation_spec = {
    "标注指南": {
        "实体边界":    "尽量短, 不包含修饰词",
        "嵌套实体":    "是否标注, 标注到几层",
        "歧义处理":    "列出常见歧义和处理规则",
        "特殊情况":    "缩写/简称/外文怎么处理",
    },
    "质量控制": {
        "双盲标注":    "每条数据至少2人标注",
        "IAA":         "Inter-Annotator Agreement > 0.8",
        "金标数据":    "嵌入测试题检测标注质量",
        "定期校准":    "每周会议同步标准",
    },
}

# ═══ 智能标注 (减少标注成本) ═══
smart_annotation = {
    "预标注":        "模型预标注 → 人工修正 (效率提升 3x)",
    "主动学习":      "模型选择最有价值的样本优先标注",
    "弱监督":        "Snorkel: 程序化标注 + 噪声处理",
    "LLM 辅助标注":  "GPT-4 初标注 → 人工审核 (质量不稳定)",
}

# ═══ LLM 辅助标注实战 ═══
llm_annotation_prompt = """
请对以下文本进行命名实体标注, 输出 JSON 格式:

文本: "2024年3月, 华为在深圳发布了 Mate 70"

标注类型: PER(人名), ORG(机构), LOC(地点), TIME(时间), PROD(产品)

输出格式:
[{"entity": "华为", "type": "ORG", "start": 8, "end": 10}]
"""
# 经验: LLM 标注准确率约 80-85%
# 仍需人工审核! 但效率提升 2-3 倍

# ═══ 数据版本管理 ═══
# DVC (Data Version Control): Git for data
# 每次标注迭代 = 一个数据版本
# 训练数据可追溯, 可回滚`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🚀 模型服务部署</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> model_serving</div>
              <pre className="fs-code">{`# 模型部署: 从 notebook 到生产 API

# ═══ 部署架构 ═══
# 开发 → 实验管理 → 模型注册 → 服务部署 → 监控

# ═══ 模型优化 (推理加速) ═══
optimization_techniques = {
    "量化": {
        "INT8":         "精度损失 < 1%, 速度 2x",
        "INT4/GPTQ":    "LLM 专用, 显存减半",
        "ONNX Runtime": "跨平台高效推理",
    },
    "蒸馏": {
        "DistilBERT":   "6层, 速度 2x, 精度 97%",
        "TinyBERT":     "4层, 速度 9x, 精度 96%",
        "LLM→SLM":      "GPT-4 → Qwen-7B 蒸馏",
    },
    "剪枝": {
        "结构化剪枝":   "删除整个注意力头/层",
        "非结构化剪枝": "权重稀疏化",
    },
}

# ═══ 服务框架 ═══
serving_frameworks = {
    "BERT 级模型": {
        "TorchServe":     "PyTorch 官方, 功能全",
        "Triton":         "NVIDIA, 高性能, 动态批处理",
        "ONNX Runtime":   "微软, 跨平台, 速度快",
        "FastAPI + 手动": "简单灵活, 快速上线",
    },
    "LLM 服务": {
        "vLLM":          "PagedAttention, 吞吐量最高",
        "TGI":           "HuggingFace, 流式输出",
        "SGLang":        "高效调度, RadixAttention",
        "Ollama":        "本地部署最简单",
    },
}

# ═══ FastAPI 部署示例 ═══
from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()
nlp_model = pipeline("ner", model="bert-base-chinese-ner")

@app.post("/ner")
async def extract_entities(text: str):
    results = nlp_model(text)
    return {"entities": results}

# ═══ 关键指标 ═══
serving_metrics = {
    "延迟 (P50/P95/P99)": "BERT: P95 < 50ms",
    "吞吐量 (QPS)":       "BERT: 100-500 QPS/GPU",
    "GPU 利用率":          "目标 > 70%",
    "首 token 延迟":       "LLM: < 500ms",
    "生成速度":            "LLM: > 30 tokens/s",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 质量监控与数据飞轮</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> monitoring</div>
              <pre className="fs-code">{`# 线上模型质量监控: 模型不是部署了就完事!

# ═══ 监控维度 ═══
monitoring_dimensions = {
    "模型质量": {
        "准确率追踪":  "每日/小时采样评估",
        "置信度分布":  "低置信度报警 → 可能分布偏移",
        "BadCase 分析": "自动收集错误案例",
    },
    "服务质量": {
        "延迟监控":    "P50/P95/P99 延迟",
        "错误率":      "5xx / 超时率",
        "吞吐量":      "QPS 趋势",
    },
    "数据质量": {
        "输入分布":    "文本长度、语言、领域分布",
        "漂移检测":    "输入分布 vs 训练数据分布",
        "异常检测":    "识别攻击/乱码/异常输入",
    },
}

# ═══ 数据漂移检测 ═══
# 训练数据 vs 线上数据的分布差异
# 方法:
#   1. 特征统计: 文本长度/词频变化
#   2. 嵌入差异: 训练集 vs 线上的嵌入中心漂移
#   3. 预测分布: 类别比例变化
# 判断: KL 散度 / JS 散度 / PSI > 阈值 → 报警

# ═══ 数据飞轮 ═══
# 核心循环:
# 线上预测 → 质量评估 → 挖掘 BadCase →
# → 补充标注 → 重新训练 → 部署新模型 → ...

data_flywheel = {
    "Step 1 - 挖掘": {
        "低置信度样本":  "模型不确定的 → 标注价值高",
        "边界样本":      "接近决策边界的样本",
        "新模式":        "新出现的表达/实体/意图",
    },
    "Step 2 - 标注": {
        "优先级":        "按业务影响Rank → 重要类别优先",
        "效率":          "预标注 + 修订 → 效率 3x",
    },
    "Step 3 - 训练": {
        "增量训练":      "新旧数据混合, 防止遗忘",
        "A/B 测试":      "新模型灰度上线, 对比指标",
    },
    "Step 4 - 部署": {
        "蓝绿部署":      "新旧版本并行, 快速回滚",
        "金丝雀发布":    "先切 5% 流量验证",
    },
}

# ═══ A/B 测试框架 ═══
# 实验组: 新模型处理 10% 流量
# 对照组: 旧模型处理 90% 流量
# 观察 3-7 天 → 指标显著提升 → 全量切换
# 关键: 统计显著性检验 (p < 0.05)`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏭 全链路 NLP 实战</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> full_stack_practice</div>
              <pre className="fs-code">{`# 企业 NLP 项目全生命周期

# ═══ Case Study: 智能客服工单分类系统 ═══

# Phase 1: 需求分析 (1 周)
requirements = {
    "输入":     "客户工单文本 (50-500字)",
    "输出":     "一级分类(5类) + 二级分类(30类)",
    "指标":     "一级准确率>95%, 二级准确率>85%",
    "延迟":     "P95 < 100ms",
    "日均量":   "10 万条",
}

# Phase 2: 数据准备 (2-3 周)
data_preparation = {
    "历史数据分析":  "导出半年工单, 分析类别分布",
    "标注规范制定":  "和业务方对齐分类标准",
    "数据标注":      "5,000 条双人标注, IAA > 0.85",
    "数据增强":      "回译 + LLM 生成少数类数据",
    "数据划分":      "训练:验证:测试 = 8:1:1",
}

# Phase 3: 模型开发 (2-3 周)
model_development = {
    "基线":     "TF-IDF + SVM → 一级 88%, 二级 72%",
    "进阶":     "BERT-base-chinese → 一级 96%, 二级 86%",
    "优化":     "DeBERTa + FocalLoss → 一级 97%, 二级 89%",
    "压缩":     "蒸馏到 4 层 → 速度 3x, 精度降 1%",
}

# Phase 4: 部署上线 (1-2 周)  
deployment = {
    "模型导出":    "ONNX 格式, INT8 量化",
    "服务封装":    "Triton Inference Server",
    "负载均衡":    "Nginx → 2x GPU Pod",
    "灰度发布":    "5% → 20% → 100% 流量",
    "回滚预案":    "< 5min 可回滚到旧模型",
}

# Phase 5: 持续迭代
iteration = {
    "每日报告":   "准确率/低置信度/BadCase",
    "每周优化":   "标注新 BadCase, 增量训练",
    "每月评估":   "全面离线评估 + A/B 测试",
    "季度迭代":   "模型架构升级, 类别体系调整",
}

# ═══ NLP 项目 ROI 计算 ═══
roi_calculation = {
    "人工成本":   "10人客服 × ¥8K/月 = ¥80K/月",
    "AI 成本":    "GPU ¥5K/月 + 维护 ¥10K/月 = ¥15K/月",
    "自动化率":   "70% 工单自动分类, 节省 7 人",
    "月节省":     "¥56K - ¥15K = ¥41K/月",
    "回收周期":   "开发成本 ¥200K / ¥41K ≈ 5 个月",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
