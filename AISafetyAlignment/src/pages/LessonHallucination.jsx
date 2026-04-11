import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 01 — AI 幻觉检测与缓解
   Grounding / 事实核查 / HaluEval
   ───────────────────────────────────────────── */

const HALLUCINATION_TYPES = [
  { type: '事实性幻觉', icon: '📰', desc: '模型编造不存在的事实、数据或引用', example: '"诺贝尔物理学奖2024年颁给了 Yann LeCun"（虚构）', severity: 'critical', color: '#ef4444' },
  { type: '忠实度幻觉', icon: '📄', desc: '模型输出与给定上下文/文档不一致', example: 'RAG 返回的内容与原文档矛盾', severity: 'high', color: '#f59e0b' },
  { type: '逻辑幻觉',   icon: '🧮', desc: '推理过程中的逻辑跳跃或矛盾', example: '"A > B, B > C, 所以 A < C"', severity: 'high', color: '#f97316' },
  { type: '指令幻觉',   icon: '📋', desc: '模型忽略或违反明确的用户指令', example: '要求JSON输出却返回Markdown', severity: 'medium', color: '#3b82f6' },
  { type: '身份幻觉',   icon: '🎭', desc: '模型声称自己拥有不具备的能力', example: '"我可以访问互联网"（实际不能）', severity: 'low', color: '#8b5cf6' },
];

const DETECTION_METHODS = [
  { name: 'Self-Consistency', desc: '多次采样同一问题，比较答案一致性。不一致 → 可能幻觉', code: `# Self-Consistency 检测
responses = [call_llm(prompt, temp=0.7) for _ in range(5)]
# 如果 5 次回答中有 3 种不同答案 → 高幻觉风险
consistency = len(set(responses)) / len(responses)
if consistency > 0.4:
    flag_as_potential_hallucination()`, icon: '🔄' },
  { name: 'Retrieval Grounding', desc: '将生成内容与可信来源（知识库/搜索）交叉验证', code: `# Retrieval-based 事实核查
claim = extract_claims(llm_response)
for c in claim:
    evidence = search_knowledge_base(c)
    verdict = nli_model.predict(
        premise=evidence, hypothesis=c
    )  # entailment / contradiction / neutral
    if verdict == "contradiction":
        flag_hallucination(c, evidence)`, icon: '🔍' },
  { name: 'NLI 蕴涵检测', desc: '用 NLI 模型判断输出是否被上下文蕴涵', code: `# Natural Language Inference
from transformers import pipeline
nli = pipeline("text-classification",
    model="cross-encoder/nli-deberta-v3-large")

result = nli({
    "text": source_document,
    "text_pair": llm_claim
})
# label: entailment / contradiction / neutral
if result["label"] == "contradiction":
    print("⚠️ 幻觉检测：与原文矛盾")`, icon: '🧪' },
  { name: 'LLM-as-Judge', desc: '用另一个 LLM 审查第一个 LLM 的输出真实性', code: `# LLM-as-Judge 幻觉审查
judge_prompt = """
你是事实核查专家。请判断以下 AI 回答是否包含幻觉。

原始问题: {question}
AI 回答: {answer}
参考资料: {context}

请逐条检查，输出格式:
- Claim: ...
- Verdict: SUPPORTED / NOT_SUPPORTED / UNVERIFIABLE
- Evidence: ...
"""
verdict = call_llm(judge_prompt, model="gpt-4o")`, icon: '⚖️' },
];

const MITIGATION_STRATEGIES = [
  { strategy: 'RAG + Citation', desc: '强制引用来源，每个声明都需关联文档段落', effectiveness: 85, category: 'retrieval' },
  { strategy: 'Constrained Decoding', desc: '限制输出只能使用给定上下文中的实体', effectiveness: 78, category: 'decoding' },
  { strategy: 'Chain-of-Verification', desc: '生成后自我验证，分解声明并逐一核实', effectiveness: 72, category: 'self-check' },
  { strategy: 'Temperature = 0', desc: '降低随机性，获得最确定性的输出', effectiveness: 65, category: 'sampling' },
  { strategy: 'Abstention Training', desc: '训练模型在不确定时说"我不知道"', effectiveness: 70, category: 'training' },
  { strategy: 'Structured Output', desc: '用 JSON Schema 约束输出格式，减少自由发挥', effectiveness: 60, category: 'format' },
];

const BENCHMARKS = [
  { name: 'HaluEval', org: 'RUC', size: '35K', focus: '问答/摘要/对话三场景幻觉', url: 'github.com/RUCAIBox/HaluEval' },
  { name: 'TruthfulQA', org: 'Oxford', size: '817', focus: '常见误解的真实性测试', url: 'github.com/sylinrl/TruthfulQA' },
  { name: 'FaithDial', org: 'Amazon', size: '50K', focus: '对话忠实度评估', url: 'github.com/McGill-NLP/FaithDial' },
  { name: 'FELM', org: 'THU', size: '847', focus: '细粒度幻觉标注（世界知识/数学/推理）', url: 'github.com/THUNLP/FELM' },
  { name: 'FactScore', org: 'UW', size: '-', focus: '长文本事实精度自动评估', url: 'github.com/shmsw25/FActScore' },
];

export default function LessonHallucination() {
  const [selectedType, setSelectedType] = useState(0);
  const [detectionIdx, setDetectionIdx] = useState(0);
  const [showMitigation, setShowMitigation] = useState(false);

  return (
    <div className="lesson-safety">
      <div className="sf-badge">🛡️ module_01 — 幻觉检测与缓解</div>

      <div className="sf-hero">
        <h1>AI 幻觉：检测、分类与缓解全指南</h1>
        <p>
          大模型最危险的能力不是"不知道"，而是<strong>"一本正经地胡说八道"</strong>。
          本模块系统梳理幻觉的五大类型、四种检测方法、六种缓解策略，
          以及主流评估基准（HaluEval / TruthfulQA / FactScore），
          让你构建可信赖的 AI 系统。
        </p>
      </div>

      {/* ─── 幻觉类型学 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🔬 幻觉类型学：五大分类</h2>
        <div className="sf-grid-3" style={{ marginBottom: '1rem' }}>
          {HALLUCINATION_TYPES.map((h, i) => (
            <button key={i} className={`sf-btn ${i === selectedType ? 'primary' : ''}`}
              onClick={() => setSelectedType(i)} style={i === selectedType ? {} : { borderColor: h.color + '33', color: h.color }}>
              {h.icon} {h.type}
            </button>
          ))}
        </div>
        <div className="sf-card" style={{ borderColor: HALLUCINATION_TYPES[selectedType].color + '35' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: HALLUCINATION_TYPES[selectedType].color, fontSize: '1.1rem' }}>
              {HALLUCINATION_TYPES[selectedType].icon} {HALLUCINATION_TYPES[selectedType].type}
            </h3>
            <span className={`sf-tag ${HALLUCINATION_TYPES[selectedType].severity === 'critical' ? 'red' : HALLUCINATION_TYPES[selectedType].severity === 'high' ? 'amber' : 'blue'}`}>
              {HALLUCINATION_TYPES[selectedType].severity.toUpperCase()}
            </span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.7 }}>
            {HALLUCINATION_TYPES[selectedType].desc}
          </p>
          <div className="sf-alert warning" style={{ margin: 0 }}>
            <strong>💡 典型案例：</strong>{HALLUCINATION_TYPES[selectedType].example}
          </div>
        </div>
      </div>

      {/* ─── 检测方法 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🔍 四种检测方法</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {DETECTION_METHODS.map((m, i) => (
            <button key={i} className={`sf-btn ${i === detectionIdx ? 'primary' : 'amber'}`}
              onClick={() => setDetectionIdx(i)}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>
        <div className="sf-card">
          <p style={{ color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.7 }}>
            {DETECTION_METHODS[detectionIdx].desc}
          </p>
          <div className="sf-code-wrap">
            <div className="sf-code-head">
              <span className="sf-code-dot" style={{ background: '#ef4444' }} />
              <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
              <span className="sf-code-dot" style={{ background: '#10b981' }} />
              🐍 {DETECTION_METHODS[detectionIdx].name.toLowerCase().replace(/[\s-]/g, '_')}_detector.py
            </div>
            <pre className="sf-code">{DETECTION_METHODS[detectionIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 缓解策略 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">
          🛡️ 六大缓解策略
          <button className="sf-btn green" style={{ marginLeft: 'auto', fontSize: '0.78rem' }}
            onClick={() => setShowMitigation(!showMitigation)}>
            {showMitigation ? '收起详情' : '展开对比'}
          </button>
        </h2>
        <div className="sf-card">
          <table className="sf-table">
            <thead>
              <tr>
                <th>策略</th>
                <th>原理</th>
                <th>有效性</th>
              </tr>
            </thead>
            <tbody>
              {MITIGATION_STRATEGIES.map((m, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#f87171' }}>{m.strategy}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{m.desc}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="sf-progress" style={{ width: '80px' }}>
                        <div className="sf-progress-fill" style={{
                          width: `${m.effectiveness}%`,
                          background: m.effectiveness > 75 ? '#10b981' : m.effectiveness > 65 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{m.effectiveness}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showMitigation && (
          <div className="sf-code-wrap" style={{ marginTop: '1rem' }}>
            <div className="sf-code-head">
              <span className="sf-code-dot" style={{ background: '#ef4444' }} />
              <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
              <span className="sf-code-dot" style={{ background: '#10b981' }} />
              🐍 chain_of_verification.py
            </div>
            <pre className="sf-code">{`# Chain-of-Verification (CoVe) — 生成后自我验证
import openai

def chain_of_verification(question, initial_answer):
    """
    Step 1: 从初始回答中提取可验证的声明
    Step 2: 为每个声明生成验证问题
    Step 3: 独立回答每个验证问题
    Step 4: 基于验证结果修正最终回答
    """
    # Step 1: 提取声明
    claims = extract_claims(initial_answer)
    
    verified_claims = []
    for claim in claims:
        # Step 2: 生成验证问题
        verify_q = llm(f"针对'{claim}'，生成一个事实核查问题")
        
        # Step 3: 独立回答（不看原始上下文，避免偏见）
        verify_a = llm(verify_q, temperature=0)
        
        # Step 4: 判断一致性
        if is_consistent(claim, verify_a):
            verified_claims.append(claim)
        else:
            verified_claims.append(f"[已修正] {verify_a}")
    
    # 重新生成最终回答
    return regenerate_answer(question, verified_claims)`}</pre>
          </div>
        )}
      </div>

      {/* ─── 评估基准 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">📊 幻觉评估基准</h2>
        <div className="sf-card">
          <table className="sf-table">
            <thead>
              <tr>
                <th>基准</th>
                <th>机构</th>
                <th>数据量</th>
                <th>评估重点</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARKS.map((b, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#60a5fa' }}>{b.name}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{b.org}</td>
                  <td><span className="sf-tag blue">{b.size}</span></td>
                  <td style={{ color: '#94a3b8' }}>{b.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 生产 Pipeline ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🏭 生产级幻觉检测 Pipeline</h2>
        <div className="sf-card">
          <div className="sf-code-wrap">
            <div className="sf-code-head">
              <span className="sf-code-dot" style={{ background: '#ef4444' }} />
              <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
              <span className="sf-code-dot" style={{ background: '#10b981' }} />
              🏗️ hallucination_guard_pipeline.py
            </div>
            <pre className="sf-code">{`# 生产级幻觉检测 Pipeline — 三层防御
class HallucinationGuard:
    def __init__(self):
        self.nli_model = load_nli_model()      # Layer 1: NLI
        self.retriever = VectorRetriever()      # Layer 2: RAG 验证
        self.judge_llm = "gpt-4o"               # Layer 3: LLM Judge

    async def check(self, query, response, context=None):
        results = {
            "claims": extract_claims(response),
            "verdicts": [],
            "risk_score": 0.0,
        }
        
        for claim in results["claims"]:
            # Layer 1: NLI 蕴涵检测
            if context:
                nli_score = self.nli_model.predict(context, claim)
            
            # Layer 2: 检索验证
            evidence = self.retriever.search(claim, top_k=3)
            retrieval_score = max(e.score for e in evidence)
            
            # Layer 3: LLM 交叉审查（可选，高成本）
            if nli_score < 0.5 and retrieval_score < 0.6:
                judge_verdict = await self.llm_judge(claim, evidence)
            
            results["verdicts"].append({
                "claim": claim,
                "nli": nli_score,
                "retrieval": retrieval_score,
                "final": "SUPPORTED" if nli_score > 0.7 else "SUSPECT"
            })
        
        results["risk_score"] = self._calc_risk(results["verdicts"])
        return results

# 使用：每个 LLM 响应都经过 Guard 检查
guard = HallucinationGuard()
response = await llm.generate(prompt)
check = await guard.check(prompt, response, context)
if check["risk_score"] > 0.7:
    response = "[⚠️ 高幻觉风险] " + response`}</pre>
          </div>
        </div>
      </div>

      {/* ─── Key Takeaways ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🎯 关键要点</h2>
        <div className="sf-grid-2">
          <div className="sf-alert critical">
            <strong>🚫 不要做：</strong><br/>
            盲信 LLM 输出 · 用于高风险决策无人工审查 · 忽略幻觉检测直接上线
          </div>
          <div className="sf-alert success">
            <strong>✅ 要做：</strong><br/>
            多层检测 Pipeline · RAG + Citation 强制引用 · 不确定时让模型说"我不知道"
          </div>
        </div>
      </div>

      <div className="sf-nav">
        <span />
        <button className="sf-btn amber">下一课：红队测试 →</button>
      </div>
    </div>
  );
}
