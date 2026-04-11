import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 08 — 持续评估 Pipeline
   CI/CD for Evals / 回归测试 / 评估门禁
   ───────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { stage: '1. Prompt 变更触发', icon: '📝', color: '#3b82f6',
    desc: '开发者修改 Prompt / System Message / Tool Definition，提交 PR',
    detail: 'Prompt 文件应版本化管理（prompts/v2/chat_system.md），每次修改通过 PR 触发 CI。' },
  { stage: '2. 自动化评估运行', icon: '🤖', color: '#14b8a6',
    desc: 'CI 自动拉取评估数据集，运行全量/增量评估',
    detail: '使用 GitHub Actions / GitLab CI 运行评估脚本。全量评估（500+ 条）耗时约 10-30 分钟。' },
  { stage: '3. 回归检测', icon: '🔍', color: '#eab308',
    desc: '对比新旧版本分数，检测回归（分数下降）',
    detail: '逐条对比：找出从"正确→错误"的 case，这些才是真正的回归。整体分数下降 >2% 触发告警。' },
  { stage: '4. 门禁判定', icon: '🚦', color: '#10b981',
    desc: '分数 >= 阈值 → 通过；分数下降 → 阻止合并',
    detail: '多维度门禁：准确率 >=85%、安全分 >=95%、延迟 P95 <3s、成本 <$0.01/query。任一不通过则阻止。' },
  { stage: '5. 部署 + 线上监控', icon: '📊', color: '#8b5cf6',
    desc: 'A/B 测试验证线上效果，监控仪表板持续跟踪',
    detail: '灰度发布 5%→20%→100%。线上指标（满意度/完成率/逃逸率）对齐后才能全量发布。' },
  { stage: '6. 反馈闭环', icon: '🔄', color: '#f87171',
    desc: '用户反馈 + 生产 Bad Case → 自动添加到评估集',
    detail: '每周从生产日志中抽取低分案例，人工审核后加入评估集。评估集持续增长。' },
];

export default function LessonEvalPipeline() {
  const [stageIdx, setStageIdx] = useState(0);

  return (
    <div className="lesson-eval">
      <div className="ev-badge coral">📊 module_08 — 持续评估 Pipeline</div>

      <div className="ev-hero">
        <h1>持续评估 Pipeline：让每次 Prompt 变更都有保障</h1>
        <p>
          评估不是上线前跑一次的事——它是<strong>持续的、自动化的、阻止回归的</strong>。
          本模块搭建从 PR 触发到线上监控的完整评估 CI/CD Pipeline，包括
          GitHub Actions 配置、回归检测、评估门禁和反馈闭环。
        </p>
      </div>

      {/* ─── Pipeline 六阶段 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔄 评估 Pipeline 六阶段</h2>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
          {PIPELINE_STAGES.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: '6px', borderRadius: '3px', cursor: 'pointer',
              background: i <= stageIdx ? s.color : 'rgba(255,255,255,0.05)',
              transition: 'background 0.3s'
            }} onClick={() => setStageIdx(i)} />
          ))}
        </div>
        <div className="ev-pills">
          {PIPELINE_STAGES.map((s, i) => (
            <button key={i} className={`ev-btn ${i === stageIdx ? 'primary' : ''}`}
              onClick={() => setStageIdx(i)} style={{ fontSize: '0.72rem' }}>
              {s.icon} Stage {i + 1}
            </button>
          ))}
        </div>
        <div className="ev-card" style={{ borderLeftColor: PIPELINE_STAGES[stageIdx].color, borderLeftWidth: '3px' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: PIPELINE_STAGES[stageIdx].color }}>
            {PIPELINE_STAGES[stageIdx].icon} {PIPELINE_STAGES[stageIdx].stage}
          </h3>
          <p style={{ color: '#e2e8f0', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{PIPELINE_STAGES[stageIdx].desc}</p>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem', lineHeight: 1.7 }}>{PIPELINE_STAGES[stageIdx].detail}</p>
        </div>
      </div>

      {/* ─── GitHub Actions ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">⚙️ GitHub Actions 评估工作流</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            📄 .github/workflows/eval.yml
          </div>
          <pre className="ev-code">{`name: LLM Eval Pipeline
on:
  pull_request:
    paths:
      - 'prompts/**'         # Prompt 文件变更触发
      - 'src/chains/**'      # 链/Agent 代码变更触发
      - 'evals/**'           # 评估配置变更触发

permissions:
  pull-requests: write       # 允许 Bot 评论 PR
  contents: read

jobs:
  eval:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2      # 需要对比 HEAD~1

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install ragas langsmith openai

      - name: Run evaluations
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          LANGSMITH_API_KEY: \${{ secrets.LANGSMITH_API_KEY }}
        run: |
          python evals/run_eval.py \\
            --dataset evals/datasets/golden_v3.jsonl \\
            --config evals/config.yaml \\
            --output eval_results.json \\
            --compare-with HEAD~1

      - name: Check eval gates
        id: gate
        run: |
          python evals/check_gates.py \\
            --results eval_results.json \\
            --thresholds evals/thresholds.yaml

      - name: Post PR comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(
              fs.readFileSync('eval_results.json', 'utf8')
            );
            const status = results.passed ? '✅ PASSED' : '❌ FAILED';
            const body = \`## 📊 Eval Results: \${status}
            
            | Metric | Score | Threshold | Status |
            |--------|-------|-----------|--------|
            | Accuracy | \${results.accuracy} | ≥0.85 | \${results.accuracy >= 0.85 ? '✅' : '❌'} |
            | Safety | \${results.safety} | ≥0.95 | \${results.safety >= 0.95 ? '✅' : '❌'} |
            | Faithfulness | \${results.faithfulness} | ≥0.85 | \${results.faithfulness >= 0.85 ? '✅' : '❌'} |
            | Latency P95 | \${results.latency_p95}ms | <3000ms | \${results.latency_p95 < 3000 ? '✅' : '❌'} |
            
            **Regressions:** \${results.regressions.length} cases
            **New Passes:** \${results.new_passes.length} cases
            \`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body,
            });`}</pre>
        </div>
      </div>

      {/* ─── 评估脚本 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🐍 回归检测脚本</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            🐍 evals/check_gates.py
          </div>
          <pre className="ev-code">{`import json, yaml, sys

def check_eval_gates(results_path, thresholds_path):
    """评估门禁检查"""
    with open(results_path) as f:
        results = json.load(f)
    with open(thresholds_path) as f:
        thresholds = yaml.safe_load(f)
    
    # 检查每个指标是否达标
    failures = []
    for metric, threshold in thresholds["gates"].items():
        actual = results.get(metric, 0)
        op = threshold.get("operator", ">=")
        target = threshold["value"]
        
        passed = (actual >= target) if op == ">=" else (actual <= target)
        if not passed:
            failures.append({
                "metric": metric,
                "actual": actual,
                "target": target,
                "operator": op,
            })
    
    # 回归检测：逐条对比
    regressions = []
    if "baseline" in results:
        for case_id, new_score in results["per_case"].items():
            old_score = results["baseline"].get(case_id, 0)
            if old_score == 1 and new_score == 0:
                regressions.append(case_id)
    
    # 输出报告
    report = {
        "passed": len(failures) == 0 and len(regressions) <= 3,
        "failures": failures,
        "regressions": regressions,
        "total_cases": len(results.get("per_case", {})),
    }
    
    if not report["passed"]:
        print("❌ EVAL GATE FAILED")
        print(f"   Failures: {failures}")
        print(f"   Regressions: {len(regressions)} cases")
        sys.exit(1)
    else:
        print("✅ EVAL GATE PASSED")
        sys.exit(0)

# thresholds.yaml 示例:
# gates:
#   accuracy:     { value: 0.85, operator: ">=" }
#   safety:       { value: 0.95, operator: ">=" }  
#   faithfulness: { value: 0.85, operator: ">=" }
#   latency_p95:  { value: 3000, operator: "<=" }
#   cost_per_query: { value: 0.01, operator: "<=" }`}</pre>
        </div>
      </div>

      {/* ─── 最佳实践 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🏆 持续评估最佳实践</h2>
        <div className="ev-grid-2">
          <div className="ev-alert pass">
            <strong>✅ 版本化一切</strong><br/>
            Prompt、评估集、阈值配置都应 Git 版本化。每次评估结果记录 commit hash，确保可追溯。
          </div>
          <div className="ev-alert pass">
            <strong>✅ 评估集持续增长</strong><br/>
            每周从生产 Bad Case 中补充 10-20 条评估用例。6 个月后评估集会从 200 条增长到 1000+ 条。
          </div>
          <div className="ev-alert info">
            <strong>📊 多层评估策略</strong><br/>
            快速评估（规则/格式检查 ~1min）→ 标准评估（LLM Judge ~10min）→ 深度评估（人工审核 ~1h），按 PR 重要性选择。
          </div>
          <div className="ev-alert info">
            <strong>📊 评估预算管理</strong><br/>
            500 条评估集 × GPT-4o Judge ≈ $2-5/次。设置月度评估预算上限，优先评估高风险变更。
          </div>
          <div className="ev-alert warning">
            <strong>⚠️ 避免 Eval 膨胀</strong><br/>
            评估集不要无限增长。定期清理过时的、重复的用例。保持 Golden Set 精而不滥。
          </div>
          <div className="ev-alert warning">
            <strong>⚠️ 关注评估漂移</strong><br/>
            Judge 模型更新可能导致历史分数不可比。每次 Judge 模型升级后，重新校准基线。
          </div>
        </div>
      </div>

      {/* ─── 工具栈总结 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🧰 评估工程全栈工具箱</h2>
        <div className="ev-card">
          <table className="ev-table">
            <thead><tr><th>层次</th><th>工具</th><th>用途</th></tr></thead>
            <tbody>
              {[
                ['离线评估', 'RAGAS / DeepEval / Promptfoo', 'RAG + LLM 自动化评估'],
                ['追踪观测', 'LangSmith / Langfuse / Arize Phoenix', 'LLM 调用追踪 + 在线评估'],
                ['基准测试', 'lm-eval-harness / HELM', '标准 Benchmark 运行'],
                ['A/B 测试', 'LaunchDarkly / Statsig / 自建', '线上分流 + 显著性检测'],
                ['CI/CD', 'GitHub Actions / GitLab CI / Argo', '评估流水线自动化'],
                ['数据管理', 'Argilla / Label Studio', '评估数据标注 + 管理'],
                ['监控告警', 'Grafana / Datadog / LangSmith Monitoring', '生产指标监控'],
              ].map(([layer, tools, use], i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#5eead4' }}>{layer}</strong></td>
                  <td style={{ color: '#a5b4fc' }}>{tools}</td>
                  <td style={{ color: '#94a3b8' }}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← Agent 评估</button>
        <button className="ev-btn primary">🎓 课程完成！</button>
      </div>
    </div>
  );
}
