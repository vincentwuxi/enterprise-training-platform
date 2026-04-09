import { useState } from 'react';
import './LessonCommon.css';

export default function LessonEvaluation() {
  const [tab, setTab] = useState('benchmarks');

  const codes = {
    benchmarks: `# ━━━━ LLM 评估体系全景 ━━━━

# ━━━━ 1. 通用能力 Benchmark ━━━━
# 防止微调后通用能力退化（灾难性遗忘检测）

# MMLU（大规模多任务语言理解）
# - 57 个学科，14,000+ 选择题
# - 评估知识广度
lm_eval --model hf \
  --model_args pretrained=./finetuned-model \
  --tasks mmlu \
  --num_fewshot 5 \
  --output_path ./eval_results

# MT-Bench（多轮对话质量）
# - 80 个高质量多轮对话问题（8类）
# - 用 GPT-4 自动打分（1-10分）
python -m fastchat.llm_judge.gen_model_answer \
  --model-path ./finetuned-model \
  --model-id my-model \
  --bench-name mt_bench

python -m fastchat.llm_judge.gen_judgment \
  --model-list my-model \
  --judge-model gpt-4o

# IFEval（指令遵循评估）
# - 严格检查模型是否真正执行了指令（格式要求等）
# - 测试微调后的指令遵循能力
lm_eval --tasks ifeval --model hf \
  --model_args pretrained=./finetuned-model

# ━━━━ 2. 领域专项评估 ━━━━
# 微调是为了垂直任务，必须有专项指标！

# 代码能力
lm_eval --tasks humaneval,mbpp --model hf \
  --model_args pretrained=./finetuned-model

# 数学推理
lm_eval --tasks gsm8k,math --num_fewshot 4 \
  --model hf --model_args pretrained=./finetuned-model

# 中文评估（CEVAL）
lm_eval --tasks ceval-valid --model hf \
  --model_args pretrained=./finetuned-model`,

    custom: `# ━━━━ 自定义领域评估体系 ━━━━

from openai import OpenAI
from sklearn.metrics import f1_score, accuracy_score
import json, re

client = OpenAI()

# ━━━━ 1. LLM-as-Judge（LLM 评估 LLM 输出）━━━━
JUDGE_PROMPT = """你是一位严格的评估专家。
评估以下模型回答的质量（1-5分）：

问题：{question}
标准答案：{reference}
模型回答：{response}

评分标准：
5分：完全正确，与标准答案一致，表达清晰
4分：基本正确，有轻微偏差
3分：部分正确，关键信息有遗漏
2分：主要内容错误或严重偏差
1分：完全错误或无关

输出JSON：{{"score": <1-5>, "reason": "<简短评分理由>"}}"""

def judge_response(question: str, reference: str, response: str) -> dict:
    result = client.chat.completions.create(
        model="gpt-4o",    # 用强模型做评判
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            question=question, reference=reference, response=response
        )}],
        response_format={"type": "json_object"},
        temperature=0,
    )
    return json.loads(result.choices[0].message.content)

# ━━━━ 2. 结构化输出准确性评估 ━━━━
def eval_json_extraction(preds: list, golds: list) -> dict:
    """评估模型提取 JSON 字段的准确性"""
    field_scores = {}
    for pred_str, gold in zip(preds, golds):
        try:
            pred = json.loads(pred_str)
        except:
            pred = {}
        for field in gold:
            if field not in field_scores:
                field_scores[field] = []
            field_scores[field].append(int(pred.get(field) == gold[field]))
    return {f: sum(scores)/len(scores) for f, scores in field_scores.items()}

# ━━━━ 3. 完整评估 Pipeline ━━━━
class FinetunedModelEvaluator:
    def __init__(self, model_path: str, test_file: str):
        self.model = load_model(model_path)
        self.test_data = load_jsonl(test_file)
    
    def run_full_eval(self) -> dict:
        results = {}
        
        # 通用能力：防止退化
        results["mmlu"] = self.run_mmlu_subset(n=200)
        results["mt_bench"] = self.run_mt_bench_subset(n=20)
        
        # 领域指标
        results["domain_accuracy"] = self.eval_task_accuracy()
        results["format_compliance"] = self.eval_format()
        results["judge_score"] = self.run_llm_judge()
        
        # 退化检测
        results["regression"] = {
            "math": self.compare_with_base("gsm8k"),
            "code": self.compare_with_base("humaneval"),
        }
        
        return results
    
    def generate_report(self, results: dict) -> str:
        """生成可读的评估报告"""
        report = f"""
====================================
微调模型评估报告
====================================
✅ 领域任务准确率：{results['domain_accuracy']:.1%}
✅ LLM-Judge 平均分：{results['judge_score']:.2f}/5.0
✅ 格式合规率：{results['format_compliance']:.1%}

📊 通用能力（退化检测）：
   MMLU：{results['mmlu']:.1%}
   MT-Bench：{results['mt_bench']:.2f}/10

⚠️ 退化检测（vs 基座模型）：
   数学（GSM8K）：{results['regression']['math']:+.1%}
   代码（HumanEval）：{results['regression']['code']:+.1%}
"""
        return report`,

    iterate: `# ━━━━ 微调迭代工作流 ━━━━

# ━━━━ 灾难性遗忘检测与修复 ━━━━

# Step 1：在基座模型上跑 baseline
baseline_scores = {
    "mmlu": 0.682,      # Llama 3 8B 原始分数
    "gsm8k": 0.794,
    "humaneval": 0.621,
}

# Step 2：微调后重新评估
finetuned_scores = {
    "mmlu": 0.651,      # 下降 3.1%！
    "gsm8k": 0.723,     # 下降 7.1%！！严重
    "humaneval": 0.589, # 下降 3.2%
    # 领域任务准确率：88.3%（大幅提升）
}

# Step 3：检测退化阈值（下降 > 5% 视为严重退化）
DEGRADATION_THRESHOLD = 0.05
for task, score in finetuned_scores.items():
    if task in baseline_scores:
        drop = baseline_scores[task] - score
        if drop > DEGRADATION_THRESHOLD:
            print(f"⚠️ 严重退化：{task} 下降 {drop:.1%}")

# 修复策略：
# 1. 数据配比调整（增加通用数据比例）
data_mix = {
    "domain_data": 0.6,      # 从 0.9 降低到 0.6
    "alpaca_general": 0.3,  # 增加通用指令数据
    "math_orca": 0.1,        # 加入数学数据防退化
}

# 2. 降低学习率（微调幅度不要太大）
training_args.learning_rate = 1e-4  # 从 2e-4 降到 1e-4

# 3. 减少训练轮次（只训练 1-2 epoch）
training_args.num_train_epochs = 2  # 避免过拟合

# ━━━━ 持续迭代流程 ━━━━
# V1：快速验证（500条数据，1 epoch）→ 看领域指标
# V2：扩大数据（2000条），优化数据配比 → 看退化指标
# V3：加 DPO 对齐（500对偏好数据）→ 提升格式和语言质量
# V4：生产测试（A/B 测试 5% 流量）→ 真实效果验证
# V5：全量上线，定期用新数据迭代

# ━━━━ 推荐工具 ━━━━
# LM Evaluation Harness：https://github.com/EleutherAI/lm-evaluation-harness
# FastChat MT-Bench：    https://github.com/lm-sys/FastChat
# OpenCompass：          中文评估综合平台
# WandB：               实验追踪和对比`,
  };

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 08 · EVALUATION & ITERATION</div>
        <h1>评估与持续迭代</h1>
        <p>微调完成不是终点。<strong>如何知道微调真的有效？如何检测灾难性遗忘？如何建立评估体系驱动持续迭代？</strong>这些工程问题决定了微调项目能否真正落地产生价值。</p>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">📊 三层评估体系</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['benchmarks', '📏 标准 Benchmark'], ['custom', '🎯 自定义领域评估'], ['iterate', '🔄 迭代优化工作流']].map(([k, l]) => (
            <button key={k} className={`ft-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} /><div className="ft-code-dot" style={{ background: '#f59e0b' }} /><div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_eval.py</span>
          </div>
          <div className="ft-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">🏆 微调工程完整流程回顾</div>
        <div className="ft-steps">
          {[
            { step: '1', name: '需求分析', desc: '明确用 Prompt/RAG/还是微调？确定期望效果（量化目标）', color: '#e11d48' },
            { step: '2', name: '数据工程', desc: '收集/清洗/格式化数据（目标1000-10000条高质量样本）', color: '#f59e0b' },
            { step: '3', name: 'LoRA/QLoRA 微调', desc: '快速跑 1 epoch（验证数据是否有效），再跑完整训练', color: '#6366f1' },
            { step: '4', name: '评估（灾难性遗忘）', desc: '领域指标 + 通用退化检测，不达标则调整数据配比', color: '#10b981' },
            { step: '5', name: 'DPO 偏好对齐（可选）', desc: '加入 chosen/rejected 对，提升输出质量和格式合规', color: '#06b6d4' },
            { step: '6', name: 'vLLM 生产部署', desc: 'PagedAttention 服务化，接入监控，A/B 测试上线', color: '#e11d48' },
          ].map((s, i) => (
            <div key={i} className="ft-step">
              <div className="ft-step-num" style={{ background: `${s.color}22`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--ft-muted)', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ft-tip">
          💡 <strong>快速迭代原则</strong>：先用 500 条数据、1 epoch 快速验证方向（1-2小时）；方向对再扩大数据量和训练轮次。不要一开始就用全量数据跑三天，发现数据有问题浪费时间。
        </div>
      </div>
    </div>
  );
}
