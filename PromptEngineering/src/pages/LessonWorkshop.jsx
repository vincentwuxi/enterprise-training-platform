import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle, XCircle, Trophy } from 'lucide-react';
import './LessonCommon.css';

const QUIZ = [
  {
    q: '你想让 AI 帮你总结一篇超长报告，但它总是乱答题材。最有效的改进方式是？',
    options: [
      '直接重新发一遍',
      '使用分隔符 ### 区隔指令和文章，并明确"只总结###内的内容"',
      '换一个模型试试',
      '把报告分成两段发送',
    ],
    answer: 1,
    explain: '使用 ### 分隔符精准区隔"指令"与"待处理材料"，是防止 AI 混淆、产生幻觉的最直接手段。',
  },
  {
    q: '你问 AI 一道复杂的逻辑推理题，它给出了一个看似有理但错误的答案。下一步最应该做什么？',
    options: [
      '接受它的答案，AI 比人聪明',
      '在问题末尾加上 "Let\'s think step by step"，强制它展示推理过程',
      '把题目简化后重新问',
      '换用另一个模型',
    ],
    answer: 1,
    explain: '思维链 (CoT) 的核心价值就是强制 AI 展示中间推理步骤，这样错误更容易被发现和纠正，而不是跳步直接输出答案。',
  },
  {
    q: '你所在公司打算把上传客户身份证号的工作委托给公共大模型自动化处理，这样做：',
    options: [
      '完全没问题，AI 处理后会自动删除',
      '效率极高，强烈建议推行',
      '违反数据安全红线，必须禁止，应先脱敏或使用企业私有部署版本',
      '只要不上传姓名就安全',
    ],
    answer: 2,
    explain: '客户身份证号属于个人敏感信息，输入公开可商业化调用的大模型存在数据泄漏风险，违反 GDPR 及国内数据安全法律。必须先脱敏处理或使用企业私有部署版本。',
  },
];

const CHEAT_CONTENT = `# 🚀 Prompt Engineering 防身小抄

## RTF 入门框架
Role:   你是一位______
Task:   你的任务是______
Format: 请以______格式输出，长度______

## CRISPE 高级框架
C - Capacity:    你具备______的专业能力
R - Role:        你扮演______角色
I - Insight:     你了解______背景偏好
S - Statement:   你的任务是具体______
P - Personality: 用______的语气和风格
E - Experiment:  输出______，含______

## 破局金句（直接用！）
1. "Let's think step by step."（防答错）
2. "用给小学生解释的方式说。"（降复杂度）
3. "如果不确定就说不知道，禁止编造。"（防幻觉）
4. "向我提问，直到你完全理解需求再执行。"（需求澄清）
5. "以 JSON 格式输出，不要其他解释文字。"（精准格式）

## 分隔符记忆卡
区分指令与材料: ### 内容 ###
复杂结构嵌套:   <text>内容</text>
多条任务列举:   先用数字 1.2.3. 明确标注

## 数据安全三不原则
🚫 不输入身份证/密码/账号
🚫 不输入未发布的商业机密
⚠️  员工数据先脱敏再使用`;

export default function LessonWorkshop() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showCheat, setShowCheat] = useState(false);

  const handleAnswer = (qi, ai) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: ai }));
  };

  const score = QUIZ.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🏅 模块六：终极黑客松</div>
         <h1>带着干货满载而归</h1>
         <p className="lesson-intro">
            用 3 道实战判断题验收你的知识，再领走你的专属防身小抄！
         </p>
      </header>

      <section className="lesson-section glass-panel text-left">
         <h3 className="flex items-center gap-2 text-2xl mb-6"><Target className="text-pink-500" size={28}/> 线下 BYOP 实战工坊流程</h3>
         <div className="grid md:grid-cols-2 gap-6">
            <div>
               <h4 className="text-pink-400 mb-2">1. BYOP (Bring Your Own Problem)</h4>
               <p className="text-gray-300 text-sm">各组提出自己工作中最耗时、最繁琐的真实痛点，打破部门壁垒，在课堂现场作为攻克课题！</p>
               <h4 className="text-pink-400 mb-2 mt-5">2. Prompt 迭代神鬼交锋</h4>
               <p className="text-gray-300 text-sm">各组使用 RTF / CoT / Few-Shot 公式编写"超级 Prompt"，并在大模型中当场运行，互换测试找出破绽。</p>
            </div>
            <div className="bg-black/30 p-5 rounded-xl border border-pink-500/20">
               <h4 className="text-amber-400 mb-3">🏆 沉淀企业 AI 资产</h4>
               <p className="text-gray-300 text-sm">跑赢测验的最佳 Prompt 将被汇编为<strong>《企业专属提示词模板手册》</strong>，分发全体人员推广使用，这才是企业 AI 化转型的真正落地产物！</p>
            </div>
         </div>
      </section>

      {/* Quiz Section */}
      <section className="lesson-section mt-10">
        <h2 className="text-2xl mb-2">🎯 结业技能测验</h2>
        <p className="text-gray-400 text-sm mb-8">3 道情景题，测测你是否真正"上岸"了？</p>

        {QUIZ.map((q, qi) => (
          <div key={qi} className="glass-panel p-6 rounded-xl mb-6">
            <p className="font-medium mb-4 text-white"><span className="text-gray-500 mr-2">Q{qi + 1}.</span> {q.q}</p>
            <div className="space-y-2">
              {q.options.map((opt, ai) => {
                const isSelected = answers[qi] === ai;
                const isCorrect = q.answer === ai;
                let style = 'border-white/10 bg-black/20 text-gray-300';
                if (submitted) {
                  if (isCorrect) style = 'border-green-500/50 bg-green-900/20 text-green-200';
                  else if (isSelected && !isCorrect) style = 'border-red-500/50 bg-red-900/20 text-red-200';
                } else if (isSelected) {
                  style = 'border-amber-500/50 bg-amber-900/20 text-amber-200';
                }

                return (
                  <button
                    key={ai}
                    onClick={() => handleAnswer(qi, ai)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-start gap-2 ${style}`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">{String.fromCharCode(65 + ai)}.</span>
                    <span>{opt}</span>
                    {submitted && isCorrect && <CheckCircle size={16} className="text-green-400 shrink-0 ml-auto mt-0.5"/>}
                    {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 shrink-0 ml-auto mt-0.5"/>}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-3 p-3 rounded bg-blue-900/20 border border-blue-500/20 text-xs text-blue-200">
                💡 <strong>解析：</strong>{q.explain}
              </div>
            )}
          </div>
        ))}

        {!submitted ? (
          <div className="flex justify-center">
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < QUIZ.length}
              className="px-8 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40"
              style={{background: 'linear-gradient(135deg, #f59e0b, #ec4899)', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'}}
            >
              提交答案，看看我考了多少分！
            </button>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-xl text-center" style={{borderTop: '3px solid #f59e0b'}}>
            <Trophy size={40} className="mx-auto mb-3 text-amber-400"/>
            <h3 className="text-2xl font-bold text-white">答对 {score} / {QUIZ.length} 题</h3>
            <p className="text-gray-300 mt-2">
              {score === 3 ? '🎉 满分通关！你已经是货真价实的 Prompt 实战者了！' :
               score === 2 ? '🌟 优秀！大部分关键概念已掌握，继续保持！' :
               '💪 有些环节还需要加强，建议回顾对应模块后重新挑战。'}
            </p>
          </div>
        )}
      </section>

      {/* Cheat Sheet */}
      <section className="lesson-section mt-12">
        <h2 className="text-2xl mb-4 text-center">🃏 领取你的专属防身小抄</h2>
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowCheat(!showCheat)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            style={{background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(236, 72, 153, 0.1))'}}
          >
            <div className="text-left">
              <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">CHEAT SHEET</h3>
              <p className="text-sm text-gray-400 mt-1">Prompt 万能框架 · 破局金句 · 安全原则 · 分隔符速查</p>
            </div>
            <span className="text-gray-400 text-sm">{showCheat ? '▲ 收起' : '▼ 展开查看'}</span>
          </button>
          {showCheat && (
            <pre className="p-6 text-sm text-green-300 font-mono leading-relaxed whitespace-pre-wrap bg-black/40 overflow-x-auto border-t border-white/10">
              {CHEAT_CONTENT}
            </pre>
          )}
        </div>
        <p className="text-gray-500 text-xs text-center mt-3">📄 在真实线下培训中，这份小抄会作为实体卡片发给每位学员，贴在显示器旁随手可查。</p>
      </section>

      <section className="lesson-section footer-nav mt-8 border-t border-white/10 pt-10">
        <button className="nav-btn next" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'}} onClick={() => navigate('/dashboard')}>
          🎉 学满下课！返回特训大本营
        </button>
      </section>
    </div>
  );
}
