import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 06 — AI 法规合规
   EU AI Act / 中国算法备案 / 风险分级
   ───────────────────────────────────────────── */

const REGULATIONS = [
  { name: 'EU AI Act', region: '🇪🇺 欧盟', status: '2025 年 8 月生效', icon: '⚖️',
    overview: '全球首部全面 AI 立法，按风险等级对 AI 系统进行分层监管。',
    riskLevels: [
      { level: '不可接受风险', color: '#ef4444', examples: '社会评分系统、实时远程生物识别（公共场所）、操纵性AI', requirement: '完全禁止' },
      { level: '高风险', color: '#f59e0b', examples: '招聘AI、信用评分、医疗诊断、教育评估、关键基础设施', requirement: '合规评估+注册+持续监控+人工监督' },
      { level: '有限风险', color: '#3b82f6', examples: '聊天机器人、AI 生成内容、情感识别', requirement: '透明度义务（告知用户正在与 AI 交互）' },
      { level: '最低风险', color: '#10b981', examples: 'AI 驱动的视频游戏、垃圾邮件过滤', requirement: '无强制要求' },
    ],
    penalties: '最高罚款：3500 万欧元 或 全球营收的 7%（取较高者）',
    genai: '通用 AI 模型（GPAI）须提供技术文档、版权合规、训练数据摘要。系统风险模型需额外进行红队测试。' },
  { name: '中国算法备案', region: '🇨🇳 中国', status: '已实施', icon: '📋',
    overview: '中国对算法推荐、深度合成、生成式 AI 实施多层监管体系。',
    riskLevels: [
      { level: '算法推荐', color: '#f59e0b', examples: '信息推荐、搜索排序、个性化推送', requirement: '算法备案+用户选择权+关闭推荐+防沉迷' },
      { level: '深度合成', color: '#ef4444', examples: 'AI 换脸、AI 语音克隆、AI 视频生成', requirement: '显著标识+源数据保护+实名认证' },
      { level: '生成式 AI', color: '#8b5cf6', examples: 'ChatGPT类产品、AI写作、AI编程', requirement: '安全评估+数据合规+内容标注+用户投诉机制' },
    ],
    penalties: '最高：暂停服务 + 吊销营业执照 + 追究法律责任',
    genai: '《生成式人工智能服务管理暂行办法》要求：训练数据合法合规、生成内容不得违反法律法规、需建立内容审核机制。' },
  { name: 'Executive Order 14110', region: '🇺🇸 美国', status: '2023.10 签署', icon: '🏛️',
    overview: '拜登行政令，对 AI 安全、隐私、公平提出联邦级框架要求。',
    riskLevels: [
      { level: '报告义务', color: '#f59e0b', examples: '训练算力超 10²⁶ FLOPs 的模型', requirement: '向政府报告训练详情+安全测试结果' },
      { level: '联邦采购', color: '#3b82f6', examples: '政府使用的 AI 系统', requirement: '安全标准+偏见测试+透明度要求' },
      { level: '行业指南', color: '#10b981', examples: '医疗/金融/法律 AI', requirement: 'NIST AI RMF 框架+行业自律' },
    ],
    penalties: '联邦合同取消 + 行业处罚（由各监管机构决定）',
    genai: 'NIST 负责制定 AI 安全标准（AI RMF），商务部负责 AI 水印和检测标准。' },
];

const COMPLIANCE_CHECKLIST = [
  { category: '数据合规', items: ['训练数据来源合法性审查', '个人数据 GDPR/PIPL 合规', '版权内容过滤', '数据保留和删除策略'] },
  { category: '模型安全', items: ['红队测试报告', '幻觉率评估', '偏见审计报告', '对抗性鲁棒性测试'] },
  { category: '透明度', items: ['AI 交互明确标识', '模型卡片（Model Card）发布', '系统能力和局限声明', '决策解释能力'] },
  { category: '人工监督', items: ['人在回路审核机制', '用户投诉和申诉渠道', '紧急停用开关', '定期人工抽检'] },
  { category: '技术文档', items: ['训练方法和超参记录', '评估指标和基准测试', '已知风险和缓解措施', '版本管理和变更日志'] },
];

export default function LessonCompliance() {
  const [regIdx, setRegIdx] = useState(0);

  const reg = REGULATIONS[regIdx];

  return (
    <div className="lesson-safety">
      <div className="sf-badge green">🛡️ module_06 — AI 法规合规</div>

      <div className="sf-hero">
        <h1>AI 法规合规：全球监管版图与落地清单</h1>
        <p>
          2025 年是 AI 法规的"执行元年"——EU AI Act 正式生效，中国算法监管持续收紧。
          本模块覆盖<strong>三大主要法域</strong>（欧盟/中国/美国）的 AI 监管框架，
          以及企业落地的完整合规清单。
        </p>
      </div>

      {/* ─── 法规选择器 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🌍 三大法域 AI 监管</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {REGULATIONS.map((r, i) => (
            <button key={i} className={`sf-btn ${i === regIdx ? 'primary' : 'green'}`}
              onClick={() => setRegIdx(i)} style={{ fontSize: '0.82rem' }}>
              {r.region} {r.name}
            </button>
          ))}
        </div>

        <div className="sf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.1rem' }}>{reg.icon} {reg.name}</h3>
            <span className="sf-tag green">{reg.status}</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 1.25rem', lineHeight: 1.7 }}>{reg.overview}</p>

          {/* 风险分级 */}
          <h4 style={{ color: '#e2e8f0', margin: '0 0 0.75rem', fontSize: '0.9rem' }}>📊 风险分级体系</h4>
          {reg.riskLevels.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: r.color + '08', border: `1px solid ${r.color}22`, borderRadius: '8px', marginBottom: '0.5rem' }}>
              <div style={{ minWidth: '100px' }}>
                <div style={{ color: r.color, fontWeight: 700, fontSize: '0.82rem' }}>{r.level}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>📌 {r.examples}</div>
                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>📋 {r.requirement}</div>
              </div>
            </div>
          ))}

          <div className="sf-alert critical" style={{ marginTop: '1rem' }}>
            <strong>💰 处罚力度：</strong>{reg.penalties}
          </div>

          <div className="sf-alert info" style={{ marginTop: '0.5rem' }}>
            <strong>🤖 GPAI / 生成式 AI 规定：</strong>{reg.genai}
          </div>
        </div>
      </div>

      {/* ─── 合规清单 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">✅ 企业 AI 合规清单</h2>
        <div className="sf-grid-2">
          {COMPLIANCE_CHECKLIST.map((cat, i) => (
            <div key={i} className="sf-card">
              <h4 style={{ color: '#fbbf24', margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{cat.category}</h4>
              {cat.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: '#10b981', fontSize: '0.8rem' }}>☐</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.83rem' }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Model Card ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">📄 Model Card 模板</h2>
        <div className="sf-code-wrap">
          <div className="sf-code-head">
            <span className="sf-code-dot" style={{ background: '#ef4444' }} />
            <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
            <span className="sf-code-dot" style={{ background: '#10b981' }} />
            📄 model_card_template.yaml
          </div>
          <pre className="sf-code">{`# Model Card — EU AI Act 合规模板
model_details:
  name: "Enterprise Customer Service Bot v2.1"
  version: "2.1.0"
  type: "Fine-tuned LLM (GPT-4o base)"
  developers: "AI Safety Team, XX Corp"
  release_date: "2025-03-15"

intended_use:
  primary: "企业内部客服问答"
  out_of_scope: "医疗诊断、法律建议、金融投资决策"
  users: "企业客服人员（辅助工具，非自主决策）"

risk_classification:
  eu_ai_act: "Limited Risk (透明度义务)"
  china: "生成式 AI（需安全评估+备案）"

training_data:
  sources: ["企业知识库（已脱敏）", "公开客服QA数据集"]
  size: "500K 对话"
  pii_handling: "所有个人信息已做匿名化处理"
  bias_audit: "已完成性别/年龄/地域偏见审计（报告附件B）"

evaluation:
  benchmarks:
    accuracy: "92.3% (内部测试集)"
    hallucination_rate: "3.2% (HaluEval)"
    bias_score: "0.95 (Demographic Parity)"
  red_team_testing: "已通过 Garak 全面安全扫描（报告附件A）"
  
limitations:
  - "不支持多模态输入（仅文本）"
  - "英文能力弱于中文"
  - "对 2024 年之后的政策变更不了解"

ethical_considerations:
  fairness: "每月进行偏见审计"
  transparency: "所有交互明确标注 AI 生成"
  human_oversight: "高置信度（>0.9）自动回复，低置信度转人工"`}</pre>
        </div>
      </div>

      <div className="sf-nav">
        <button className="sf-btn">← 对齐工程</button>
        <button className="sf-btn amber">AI 水印与溯源 →</button>
      </div>
    </div>
  );
}
