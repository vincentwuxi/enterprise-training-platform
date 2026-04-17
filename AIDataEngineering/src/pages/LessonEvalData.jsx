import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Benchmark 构建', '测试集设计', '污染检测', 'LLM-as-Judge'];

export default function LessonEvalData() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🏗️ module_06 — 评估数据工程</div>
      <div className="fs-hero">
        <h1>评估数据工程：你的模型真的变好了吗？</h1>
        <p>
          "模型在 benchmark 上 SOTA, 但用户体验并没有提升"——
          这是评估数据出了问题。本模块覆盖 Benchmark 构建方法论、
          测试集设计原则（分布/分层/时效性）、
          <strong>数据污染检测</strong>（训练集泄露到测试集）、
          以及 LLM-as-Judge 自动评估体系。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📏 评估工程</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ Benchmark 构建方法论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> benchmark_design</div>
                <pre className="fs-code">{`# —— 构建高质量 Benchmark ——

Benchmark 设计原则:
┌────────────────────────────────────────────────┐
│ 1. 代表性 (Representativeness)                   │
│    覆盖真实使用场景的分布                         │
│    ❌ 只测学术题 → 不代表实际用户需求              │
│                                                │
│ 2. 区分度 (Discriminability)                     │
│    能区分好模型和差模型                           │
│    ❌ 所有模型都 95%+ → benchmark 太简单          │
│                                                │
│ 3. 鲁棒性 (Robustness)                          │
│    不容易被 hack 或 overfit                      │
│    ❌ 换个措辞就答错 → benchmark 太脆弱           │
│                                                │
│ 4. 可复现性 (Reproducibility)                    │
│    不同人评估得到相同结果                         │
│    ❌ 评估方式模糊 → 结果不可比                   │
│                                                │
│ 5. 时效性 (Timeliness)                           │
│    定期更新, 防止过时                            │
│    ❌ 2020 年的 benchmark 已被训练集覆盖          │
└────────────────────────────────────────────────┘

主流 Benchmark 生态:
├── 通用理解: MMLU / MMLU-Pro / ARC
├── 推理: GSM8K / MATH / BBH
├── 代码: HumanEval / MBPP / SWE-bench
├── 长文本: RULER / LongBench
├── 多模态: MMMU / MathVista
├── 安全: TruthfulQA / HarmBench
├── 对话: MT-Bench / Chatbot Arena
└── 中文: C-Eval / CMMLU / SuperCLUE

构建步骤:
1. 定义评估维度 (能力矩阵)
2. 设计题目类型 (选择/生成/代码)
3. 编写题目 (人工 + LLM 辅助)
4. 多人验证 (IAA > 0.85)
5. 难度标定 (人类基线)
6. 发布 & 持续维护`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📐 测试集设计原则</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> test_set.py</div>
                <pre className="fs-code">{`# 测试集设计: 企业内部评估

class TestSetDesigner:
    """设计高质量测试集"""
    
    def design_test_set(self, use_cases):
        """分层设计测试集"""
        test_set = []
        
        # 1. 核心功能测试 (40%)
        # 覆盖最常见的用户请求
        core = self.sample_by_frequency(
            use_cases, top_percentile=0.8, n=400
        )
        
        # 2. 边界案例测试 (25%)
        # 模型容易出错的场景
        edge_cases = [
            "长输入 (>4K tokens)",
            "多语言混合",
            "非常规格式 (表格/代码/公式)",
            "歧义性指令",
            "拒绝类请求 (安全边界)",
        ]
        
        # 3. 回归测试 (20%)
        # 历史上出过问题的case
        regression = self.get_historical_failures()
        
        # 4. 金丝雀测试 (15%)
        # 极端困难, 测试上限
        canary = self.generate_hard_cases()
        
        return {
            "core": core,           # 400 条
            "edge": edge_cases,     # 250 条
            "regression": regression, # 200 条
            "canary": canary,       # 150 条
            "total": 1000,
        }
    
    def stratify(self, test_set, dimensions):
        """多维度分层"""
        # 确保每个维度都有足够覆盖
        # 维度: 任务类型/难度/长度/语言/领域
        return self.stratified_sample(
            test_set, dimensions
        )

# 黄金法则: 
# 测试集 ≥ 1000 条
# 每个子维度 ≥ 50 条
# 每季度更新 20% 测试题`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 评估指标体系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> metrics</div>
                <pre className="fs-code">{`评估指标选择:

按任务类型:
┌────────────┬─────────────────┐
│ 任务        │ 指标             │
├────────────┼─────────────────┤
│ 分类        │ Accuracy, F1    │
│            │ Precision, Recall│
├────────────┼─────────────────┤
│ 生成        │ BLEU, ROUGE     │
│            │ BERTScore       │
│            │ LLM-as-Judge    │
├────────────┼─────────────────┤
│ 检索        │ MRR, NDCG@K    │
│            │ Recall@K        │
├────────────┼─────────────────┤
│ 代码        │ Pass@K         │
│            │ CodeBERTScore   │
├────────────┼─────────────────┤
│ 数学        │ Exact Match    │
│            │ (最终答案一致)   │
├────────────┼─────────────────┤
│ 对话        │ 多维度打分:     │
│            │ ├── Helpfulness │
│            │ ├── Harmlessness│
│            │ ├── Honesty     │
│            │ └── Coherence   │
└────────────┴─────────────────┘

置信区间很重要:
├── 1000条测试: ±3% (95% CI)
├── 500条测试: ±4.4%
├── 100条测试: ±10%
└── 差异 < CI → 不显著!

A/B 测试统计:
├── 双尾检验 (p < 0.05)
├── 效应量 (Cohen's d)
└── 功效分析 (Power Analysis)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 数据污染检测</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> contamination.py</div>
                <pre className="fs-code">{`# —— 数据污染: Benchmark 的头号敌人 ——

# 问题: 如果测试题已经在训练集中出现过,
#       模型的"高分"只是死记硬背,不是真正理解

class ContaminationDetector:
    """训练数据 × 测试集 交叉污染检测"""
    
    # 方法 1: n-gram 重叠检测
    def ngram_overlap(self, train_data, test_data, n=13):
        """13-gram 重叠检测 (GPT-4 论文方法)"""
        # 生成训练集所有 13-gram
        train_ngrams = set()
        for doc in train_data:
            tokens = doc.split()
            for i in range(len(tokens) - n + 1):
                train_ngrams.add(tuple(tokens[i:i+n]))
        
        # 检查测试集中有多少 13-gram 出现在训练集
        contaminated = []
        for test_item in test_data:
            tokens = test_item["question"].split()
            overlap_count = 0
            total = max(1, len(tokens) - n + 1)
            
            for i in range(total):
                if tuple(tokens[i:i+n]) in train_ngrams:
                    overlap_count += 1
            
            overlap_ratio = overlap_count / total
            if overlap_ratio > 0.8:  # 80% 重叠 = 污染
                contaminated.append(test_item)
        
        return contaminated
    
    # 方法 2: 成员推断攻击 (MIA)
    def membership_inference(self, model, test_data):
        """看模型是否"记住"了测试题"""
        suspicious = []
        for item in test_data:
            # 如果模型对某道题的困惑度异常低
            # → 可能在训练时见过
            ppl = model.perplexity(item["question"] + item["answer"])
            if ppl < self.threshold:  # 阈值需要标定
                suspicious.append((item, ppl))
        return suspicious
    
    # 方法 3: 换皮测试 (Rephrasing Test)
    def rephrase_test(self, model, test_data):
        """换个说法再问, 看答案是否一致"""
        for item in test_data:
            original_answer = model.generate(item["question"])
            rephrased_q = self.rephrase(item["question"])
            rephrased_answer = model.generate(rephrased_q)
            
            if original_answer != rephrased_answer:
                # 不一致 → 可能是背答案,不是真理解
                item["contamination_risk"] = "HIGH"

# 真实案例:
# GPT-4 在 Codeforces 旧题上表现远好于新题
# → 旧题已在训练集中 (数据污染!)
# MMLU 多个模型涉嫌污染
# → 推动了 MMLU-Pro、LiveBench 等新 benchmark`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 LLM-as-Judge 评估</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> llm_judge.py</div>
                <pre className="fs-code">{`# —— LLM-as-Judge: 用 AI 评估 AI ——

class LLMJudge:
    """用强模型评估弱模型"""
    
    # 方法 1: 单样本打分 (Pointwise)
    async def score(self, question, answer, criteria):
        """对单个回答打 1-10 分"""
        prompt = f"""
你是一位严格的AI评估专家。请评估以下回答。

问题: {question}
回答: {answer}

评估标准:
{criteria}

请从以下维度打分 (1-10):
1. 准确性: 信息是否正确
2. 完整性: 是否回答了所有方面
3. 清晰度: 表达是否清晰易懂
4. 有用性: 对用户是否有帮助

请用 JSON 格式输出分数和理由。
"""
        return await self.judge_model.generate(prompt)
    
    # 方法 2: 成对比较 (Pairwise)
    async def compare(self, question, answer_a, answer_b):
        """A vs B, 哪个更好? (MT-Bench 风格)"""
        prompt = f"""
问题: {question}

回答 A: {answer_a}
回答 B: {answer_b}

请判断哪个回答更好。
输出: A胜 / B胜 / 平局, 并说明理由。

注意: 不要被回答长度误导,关注质量。
"""
        return await self.judge_model.generate(prompt)
    
    # 方法 3: Chain-of-Thought 评估
    async def cot_evaluate(self, question, answer, reference):
        """思维链评估 (更准确)"""
        prompt = f"""
请一步步评估:

1. 参考答案的关键点是什么?
2. 回答覆盖了哪些关键点?
3. 回答有哪些错误?
4. 综合评分 (1-10)

参考: {reference}
回答: {answer}
"""
        return await self.judge_model.generate(prompt)

# LLM-as-Judge 可靠性:
# ├── 与人类评估一致性: 80-85%
# ├── 位置偏差: A放前面容易被选 (需要交换位置评两次)
# ├── 长度偏差: 长回答容易高分 (需控制)
# ├── 自我偏差: GPT-4 偏好 GPT-4 的回答
# └── 最佳实践: Judge 用比被评模型更强的模型`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
