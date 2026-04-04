import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Play, Plus, Trash2, ArrowRight } from 'lucide-react';
import './LessonCommon.css';

const TRIGGER_OPTIONS = ['📧 收到新邮件', '📅 每天定时触发', '📋 表单提交成功', '💬 收到消息', '📂 新增文件'];
const ACTION_OPTIONS = ['🤖 AI分析/总结', '📤 发送通知', '📝 写入数据库', '📊 更新表格', '🔀 转发给团队'];

const WORKFLOW_TEMPLATES = [
  {
    name: '📧 邮件智能分类助理',
    trigger: '收到新邮件',
    steps: ['AI 判断邮件优先级（紧急/普通/垃圾）', 'AI 生成 50 字摘要', '高优先级邮件 → 企业微信推送通知', '普通邮件 → 自动打标签归档', '垃圾 → 直接删除'],
    tools: 'Gmail + Make + Claude + 企业微信',
    save: '每天节省 30-45 分钟的邮件处理时间',
  },
  {
    name: '📊 周报自动生成流水线',
    trigger: '每周五下午 4 点定时触发',
    steps: ['从 Notion/飞书读取本周任务完成情况', 'AI 将任务列表整理为结构化汇报段落', 'AI 自动生成下周重点计划', '合并成完整周报 Word 文档', '发送到团队频道 + 上级邮箱'],
    tools: 'Notion + Zapier + GPT-4 + Feishu Bot',
    save: '每周节省 2-3 小时写报告时间',
  },
  {
    name: '🎤 会议纪要自动化流水线',
    trigger: '会议录音文件上传到云盘',
    steps: ['Whisper AI 语音转文字（准确率 95%+）', 'Claude 提炼发言人观点和关键决策', 'AI 生成结构化会议纪要（议题/决议/行动项/负责人）', '自动同步到项目管理工具（创建 Action Items）', '邮件发送给所有与会人员'],
    tools: 'Whisper + n8n + Claude + Notion + Gmail',
    save: '每次会议节省 1-2 小时整理时间',
  },
];

const AI_TOOLS_MATRIX = [
  { category: '🔗 工作流平台', tools: ['Zapier', 'Make (Integromat)', 'n8n（开源）', '飞书多维表格 + AI'], desc: '连接各种 SaaS，无需写代码搭建自动化流程' },
  { category: '🤖 AI 核心引擎', tools: ['ChatGPT API', 'Claude API', 'Gemini API', '文心一言 API'], desc: '提供 AI 能力：文本生成、分析、翻译、摘要等' },
  { category: '📱 消息推送', tools: ['企业微信机器人', '钉钉 Webhook', 'Slack Bot', '飞书消息卡片'], desc: '将自动化结果推送通知给相关人员' },
  { category: '🗃️ 数据存储', tools: ['Notion Database', 'Google Sheets', 'Airtable', 'Feishu 多维表'], desc: '自动化流程中的数据读写目标' },
];

export default function LessonAutomation() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([
    { id: 1, type: 'trigger', label: '📧 收到新邮件' },
    { id: 2, type: 'action', label: '🤖 AI分析/总结' },
    { id: 3, type: 'action', label: '📤 发送通知' },
  ]);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [nextId, setNextId] = useState(4);

  const addNode = () => {
    const options = ACTION_OPTIONS;
    const label = options[Math.floor(Math.random() * options.length)];
    setNodes(prev => [...prev, { id: nextId, type: 'action', label }]);
    setNextId(n => n + 1);
  };

  const removeNode = (id) => {
    if (nodes.length <= 2) return;
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const changeNodeLabel = (id, label) => {
    setNodes(prev => prev.map(n => n.id === id ? {...n, label} : n));
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">⚙️ 模块六：AI 自动化工作流</div>
        <h1>让 AI 帮你打工：构建自动化流水线</h1>
        <p className="lesson-intro">
          如果 Prompt Engineering 是教 AI 做一件事，<strong style={{color:'#a78bfa'}}>工作流自动化就是让 AI 自动完成一整条流水线</strong>——你触发一个动作，剩下的全自动运行。
        </p>
      </header>

      {/* Flow Designer */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">🔧 可视化流程设计器（交互体验）</h3>
        <p className="text-gray-400 text-sm mb-6">设计你的自动化流程：点击节点可修改步骤，点击"添加步骤"扩展流程</p>

        <div className="flex flex-col items-center gap-2 mb-6">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex flex-col items-center w-full max-w-sm">
              <div className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${node.type === 'trigger' ? 'border-orange-500/50 bg-orange-900/15' : 'border-blue-500/30 bg-blue-900/10'}`}>
                <select
                  value={node.label}
                  onChange={e => changeNodeLabel(node.id, e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer">
                  {(node.type === 'trigger' ? TRIGGER_OPTIONS : ACTION_OPTIONS).map(opt => (
                    <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                  ))}
                </select>
                {node.type !== 'trigger' && (
                  <button onClick={() => removeNode(node.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                )}
              </div>
              {i < nodes.length - 1 && <div className="w-0.5 h-6 bg-gray-600"></div>}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={addNode} className="bg-blue-600/80 hover:bg-blue-500 px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2 transition-all">
            <Plus size={15}/> 添加步骤
          </button>
          <div className="bg-emerald-900/30 border border-emerald-500/30 px-4 py-2 rounded-full text-sm text-emerald-300 font-medium">
            ✅ {nodes.length} 步自动化流程已就绪
          </div>
        </div>
      </section>

      {/* Template Library */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🚀 3 个企业级自动化流程模板（拿来即用）</h3>
        <div className="flex gap-2 flex-wrap mb-5">
          {WORKFLOW_TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => setActiveTemplate(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activeTemplate === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {t.name}
            </button>
          ))}
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-white">{WORKFLOW_TEMPLATES[activeTemplate].name}</h4>
            <span className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">{WORKFLOW_TEMPLATES[activeTemplate].save}</span>
          </div>
          <div className="mb-4">
            <p className="text-xs text-orange-400 font-bold mb-2">⚡ 触发器</p>
            <div className="bg-orange-900/20 border border-orange-500/30 px-3 py-2 rounded-lg text-sm text-orange-200">{WORKFLOW_TEMPLATES[activeTemplate].trigger}</div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-blue-400 font-bold mb-2">🔄 自动化步骤</p>
            <div className="space-y-2">
              {WORKFLOW_TEMPLATES[activeTemplate].steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-200">
                  <span className="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">{i+1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 border-t border-white/5 pt-3">🛠️ 使用工具：{WORKFLOW_TEMPLATES[activeTemplate].tools}</p>
        </div>
      </section>

      {/* Tools Matrix */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🗺️ AI 自动化工具生态全景</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {AI_TOOLS_MATRIX.map((cat, i) => (
            <div key={i} className="glass-panel" style={{padding: '1.2rem'}}>
              <h4 className="font-bold text-white mb-1">{cat.category}</h4>
              <p className="text-xs text-gray-500 mb-3">{cat.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.tools.map(tool => (
                  <span key={tool} className="text-xs bg-black/40 text-gray-300 px-2 py-1 rounded border border-white/10">{tool}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/creative')}>
          自动化满级！解锁 AI 多模态创作 →
        </button>
      </section>
    </div>
  );
}
