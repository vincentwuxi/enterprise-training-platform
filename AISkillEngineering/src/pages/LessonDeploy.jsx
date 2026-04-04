import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Upload, GitBranch, CheckCircle2, ArrowRight, Repeat } from 'lucide-react';
import './LessonCommon.css';

const TEST_TYPES = [
  {
    type: '纪律型 Skill',
    icon: '⚖️',
    example: 'TDD、verification-before-completion',
    approach: ['学术问题：Agent 理解规则了吗？', '压力场景：在压力下 Agent 是否遵守？', '多重压力组合：时间 + 沉没成本 + 权威', '识别合理化借口并追加明确反驳'],
    successCriteria: 'Agent 在最大压力下仍然遵守规则',
    color: 'red',
  },
  {
    type: '技法型 Skill',
    icon: '🔧',
    example: 'systematic-debugging、condition-based-waiting',
    approach: ['应用场景：Agent 能正确应用该技法吗？', '变体场景：处理边界情况的能力', '信息缺失测试：文档是否有关键信息空白？'],
    successCriteria: 'Agent 能将技法成功应用到新场景',
    color: 'emerald',
  },
  {
    type: '模式型 Skill',
    icon: '🧠',
    example: 'brainstorming、dispatching-parallel-agents',
    approach: ['识别场景：Agent 能识别出该模式适用吗？', '应用场景：能否用心智模型指导决策？', '反例测试：能否识别"不应该用"的情况？'],
    successCriteria: 'Agent 能正确判断何时/如何应用该模式',
    color: 'blue',
  },
  {
    type: '参考型 Skill',
    icon: '📖',
    example: 'API 文档 Skill、工具手册',
    approach: ['检索场景：Agent 能找到所需信息吗？', '应用场景：找到后能否正确使用？', '覆盖度：常见使用场景都有文档覆盖吗？'],
    successCriteria: 'Agent 能找到并正确应用参考信息',
    color: 'yellow',
  },
];

const DEPLOY_STEPS = [
  {
    step: '1', title: '保存到正确路径',
    detail: '个人 Skill 保存到 ~/.claude/skills/ 或 ~/.agents/skills/（取决于平台），保持扁平的命名空间',
    cmd: 'mkdir -p ~/.claude/skills/my-skill-name\n# 将 SKILL.md 放入该目录',
    color: '#7c3aed',
  },
  {
    step: '2', title: '（可选）纳入版本控制',
    detail: '把 Skill 目录提交到 Git，方便团队共享、版本追踪和持续迭代。建议单独的 Skills Repo 或 Monorepo 的 .agent/skills 目录',
    cmd: 'git add .agent/skills/my-skill-name/\ngit commit -m "feat(skills): add my-skill-name"',
    color: '#2563eb',
  },
  {
    step: '3', title: '团队共享',
    detail: '通过 Git 共享，团队成员 clone/pull 后，Skill 立即生效。或者贡献到 agentskills.io 社区（如果具有足够普遍性）',
    cmd: 'git push origin main\n# 团队成员：git pull',
    color: '#059669',
  },
  {
    step: '4', title: '迭代：发现问题 → 更新 → 重测',
    detail: 'Skill 不是一次性写完就结束的。每次发现 Agent 找到新的绕过方式，就更新 Skill 并重新测试（REFACTOR 阶段）',
    cmd: '# 每次编辑 Skill 后必须重新测试\n# No Edit Without Failing Test First',
    color: '#d97706',
  },
];

const LIFECYCLE_STAGES = [
  { stage: 'Identify', desc: '识别需要 Skill 的场景（Agent 反复犯同类错误）', icon: '🔍' },
  { stage: 'RED', desc: '运行无 Skill 的压力场景，文档化违规行为', icon: '🔴' },
  { stage: 'GREEN', desc: '写针对性的 Skill，让 Agent 通过压力测试', icon: '🟢' },
  { stage: 'REFACTOR', desc: '堵新漏洞，直到 Bulletproof', icon: '🔁' },
  { stage: 'Deploy', desc: '部署到路径，纳入版本控制', icon: '🚀' },
  { stage: 'Monitor', desc: '持续观察 Agent 行为，发现新漏洞后回到 RED', icon: '👁️' },
];

const TOKEN_TIPS = [
  { category: 'getting-started Skill', limit: '< 150 词', reason: '每次对话都加载，必须极简' },
  { category: '高频加载 Skill', limit: '< 200 词', reason: '每个会话都可能加载' },
  { category: '普通 Skill', limit: '< 500 词', reason: '按需加载，仍然需要简洁' },
  { category: '重型参考文档', limit: '独立文件', reason: '通过链接引用，不放在 SKILL.md 主文件里' },
];

export default function LessonDeploy() {
  const navigate = useNavigate();
  const [activeTestType, setActiveTestType] = useState(0);
  const [activeDeployStep, setActiveDeployStep] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🚀 模块六：验证部署篇</div>
        <h1>验证是最后一关：Skill 上线流程</h1>
        <p className="lesson-intro">
          写完 Skill 只是一半。另一半是<strong style={{color:'#c4b5fd'}}>验证它真的有效</strong>。本模块覆盖 4 种 Skill 类型的具体测试方法、Token 效率控制 和完整的部署流程。
        </p>
      </header>

      {/* Test Types */}
      <section className="lesson-section">
        <h3 className="mb-4">🧪 4 种 Skill 的不同测试方法（官方分类）</h3>
        <div className="flex gap-2 flex-wrap mb-5">
          {TEST_TYPES.map((t, i) => {
            const colors = { red: 'border-red-500 bg-red-900/20 text-red-300', emerald: 'border-emerald-500 bg-emerald-900/20 text-emerald-300', blue: 'border-blue-500 bg-blue-900/20 text-blue-300', yellow: 'border-yellow-500 bg-yellow-900/20 text-yellow-300' };
            return (
              <button key={i} onClick={() => setActiveTestType(i)}
                className={`px-3 py-1.5 rounded-lg text-xs border-2 font-bold transition-all ${activeTestType === i ? colors[t.color] : 'border-gray-700 bg-black/20 text-gray-400'}`}>
                {t.icon} {t.type}
              </button>
            );
          })}
        </div>
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{TEST_TYPES[activeTestType].icon}</span>
            <div>
              <h4 className="font-bold text-white">{TEST_TYPES[activeTestType].type}</h4>
              <p className="text-xs text-gray-500">示例：{TEST_TYPES[activeTestType].example}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold text-violet-300 mb-2">测试方法：</p>
            <div className="space-y-1.5">
              {TEST_TYPES[activeTestType].approach.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-violet-400 font-bold shrink-0">{i+1}.</span>{a}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3">
            <p className="text-xs font-bold text-emerald-300 mb-1">✅ 成功标准</p>
            <p className="text-sm text-gray-300">{TEST_TYPES[activeTestType].successCriteria}</p>
          </div>
        </div>
      </section>

      {/* Token Efficiency */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">⚡️ Token 效率控制（Anthropic 官方字数限制）</h3>
        <p className="text-gray-400 text-sm mb-4">高频加载的 Skill 会在每次对话开始时注入 Agent 的上下文窗口，因此必须严格控制 Token 用量：</p>
        <div className="space-y-2">
          {TOKEN_TIPS.map((tip, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-sm text-gray-200 flex-1">{tip.category}</span>
              <code className="text-violet-300 font-bold text-sm whitespace-nowrap">{tip.limit}</code>
              <span className="text-xs text-gray-600">{tip.reason}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <p className="text-xs text-blue-300">
            💡 <strong>交叉引用技巧：</strong>不要重复已有 Skill 的内容，用 "REQUIRED SUB-SKILL: use superpowers:xxx" 的方式引用，节省大量 Token。
          </p>
        </div>
      </section>

      {/* Deploy Steps */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">📦 Skill 部署步骤（点击展开命令）</h3>
        <div className="space-y-3">
          {DEPLOY_STEPS.map((s, i) => (
            <div key={i} className="p-4 rounded-xl border cursor-pointer transition-all"
                 style={{ borderColor: activeDeployStep === i ? s.color + '60' : '#ffffff10', background: activeDeployStep === i ? s.color + '12' : 'rgba(0,0,0,0.2)' }}
                 onClick={() => setActiveDeployStep(activeDeployStep === i ? null : i)}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0" style={{ background: s.color }}>{s.step}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{s.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>
                </div>
                <ArrowRight size={14} className={`text-gray-600 transition-transform ${activeDeployStep === i ? 'rotate-90' : ''}`}/>
              </div>
              {activeDeployStep === i && (
                <div className="mt-3 fade-in">
                  <pre className="bg-black/60 p-3 rounded-lg text-xs text-emerald-300 font-mono whitespace-pre-wrap">{s.cmd}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Lifecycle */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">🔄 Skill 的完整生命周期</h3>
        <div className="space-y-2">
          {LIFECYCLE_STAGES.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-2xl">{s.icon}</div>
              <div className="flex-1 p-3 bg-black/30 rounded-xl border border-white/5">
                <span className="font-bold text-violet-300 text-sm mr-2">{s.stage}</span>
                <span className="text-sm text-gray-400">{s.desc}</span>
              </div>
              {i < LIFECYCLE_STAGES.length - 1 && <div className="text-gray-700 text-lg self-center">↓</div>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4 text-center">注意：生命周期不是线性的，Monitor 阶段发现问题后会循环回 RED 阶段</p>
      </section>

      {/* Graduation */}
      <section className="lesson-section glass-panel mt-10 text-center py-12" style={{borderTop: '4px solid #6d28d9', background: 'linear-gradient(135deg, rgba(109,40,217,0.1), rgba(37,99,235,0.1))'}}>
        <Trophy size={60} className="mx-auto mb-4 text-yellow-400" style={{ filter: 'drop-shadow(0 0 20px rgba(250,204,21,0.5))' }}/>
        <h2 className="text-3xl font-black mb-3" style={{ background: 'linear-gradient(to right, #c4b5fd, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎓 恭喜完成《AI Skill 工程师实战营》！
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          你已经完整掌握了 AI Skill 工程的全链路：从认知重塑、结构规范、TDD 铁律、14 个官方案例解析，到动手实战与验证部署。
          <br/><br/>
          <strong className="text-white">现在的你，不只是 AI 的"使用者"，而是 AI 的"训练者"和"工程师"。</strong>
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
          {['认知重塑', 'YAML规范', 'CSO优化', 'TDD铁律', '压力测试', '14官方Skill', '版本迭代', 'Token效率', '部署流程', '生命周期管理'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border border-violet-500/40 text-violet-300 bg-violet-900/20">{tag}</span>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-black py-3 px-8 rounded-full text-lg shadow-[0_0_25px_rgba(109,40,217,0.5)] hover:scale-105 transition-all">
          🚀 返回课程中心，继续探索
        </button>
      </section>
    </div>
  );
}
