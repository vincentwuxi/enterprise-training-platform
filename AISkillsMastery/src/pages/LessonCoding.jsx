import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Bug, Lightbulb, Copy, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const CODING_SCENARIOS = [
  {
    label: '🔨 代码生成',
    desc: '从需求描述直接生成可运行代码',
    prompt: `你是一位资深 Python 工程师。
请编写一个函数，实现以下功能：
- 接收一个包含用户信息的字典列表
- 按"年龄"字段升序排序
- 过滤掉年龄小于 18 岁的用户
- 返回每个用户的 "name" 和 "email" 字段
- 包含完整的类型注解和 docstring
- 提供一个使用示例`,
    output: `from typing import TypedDict

class User(TypedDict):
    name: str
    email: str
    age: int

def filter_adult_users(users: list[dict]) -> list[dict]:
    """
    过滤并排序成年用户列表。
    
    Args:
        users: 用户字典列表，每个字典包含 name, email, age 字段
    
    Returns:
        按年龄升序排列的成年用户列表（仅含 name 和 email）
    """
    adults = [u for u in users if u.get('age', 0) >= 18]
    sorted_adults = sorted(adults, key=lambda x: x['age'])
    return [{'name': u['name'], 'email': u['email']} for u in sorted_adults]

# 使用示例
users = [
    {'name': '张三', 'email': 'zhang@test.com', 'age': 25},
    {'name': '李四', 'email': 'li@test.com', 'age': 16},
    {'name': '王五', 'email': 'wang@test.com', 'age': 30},
]
print(filter_adult_users(users))
# [{'name': '张三', 'email': 'zhang@test.com'}, 
#  {'name': '王五', 'email': 'wang@test.com'}]`,
  },
  {
    label: '🐛 Bug 排查',
    desc: '把报错信息和代码贴给 AI，让它定位问题',
    prompt: `我的 Python 代码报错，请帮我找出问题并修复它：

错误信息：
TypeError: 'NoneType' object is not subscriptable

问题代码：
def get_user_name(user_id):
    user = database.find_user(user_id)
    return user['name']

result = get_user_name(999)
print(result)

database.find_user 在找不到用户时会返回 None，请修复这个问题并加上合适的错误处理。`,
    output: `问题分析：
当 user_id=999 的用户不存在时，database.find_user() 返回 None，
而代码试图对 None 进行字典访问操作，导致 TypeError。

修复方案（推荐）：
def get_user_name(user_id: int) -> str | None:
    """
    获取用户名称，用户不存在时返回 None
    """
    user = database.find_user(user_id)
    
    if user is None:
        print(f"警告：用户 {user_id} 不存在")
        return None
    
    return user['name']

# 调用时处理 None 情况
result = get_user_name(999)
if result:
    print(result)
else:
    print("未找到该用户")

或者使用更简洁的写法：
def get_user_name(user_id: int) -> str | None:
    user = database.find_user(user_id)
    return user['name'] if user else None`,
  },
  {
    label: '📖 代码解释',
    desc: '看不懂的代码，让 AI 逐行解释',
    prompt: `请解释以下 JavaScript 代码的作用，用中文逐行注释，并在最后总结整体功能。面向有一点基础的初学者：

const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};`,
    output: `// 定义 debounce 函数，接收两个参数：
// fn = 要延迟执行的函数，delay = 延迟毫秒数
const debounce = (fn, delay) => {
  
  // 用一个变量 timer 来存储定时器的引用
  // 初始值为 null（还没有定时器）
  let timer = null;
  
  // 返回一个新函数（这是"防抖包装后"的版本）
  return (...args) => {
    
    // 每次调用，先清掉上一次还没执行的定时器
    // 如果 timer 是 null，clearTimeout 不会有任何副作用
    clearTimeout(timer);
    
    // 重新设置一个新定时器
    // delay 毫秒后，才真正执行原来的 fn 函数
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

📌 总结：
debounce（防抖）的作用是：
无论你调用这个函数多少次，只有"最后一次调用后停止 delay 毫秒"才会真正执行。

📱 经典使用场景：
搜索框输入 — 用户每按一个键都会触发搜索，加上防抖后，
只有停止输入 500ms 后才发送一次 API 请求，避免频繁请求服务器。`,
  },
];

const DEBUG_STEPS = [
  { icon: '📋', title: '粘贴完整错误信息', desc: '包括错误类型、错误消息、完整的 traceback 堆栈。不要截图，要文字。' },
  { icon: '📄', title: '提供相关代码上下文', desc: '不只是报错那一行，要把前后5-10行一起提供，函数定义要完整。' },
  { icon: '🌍', title: '说明运行环境', desc: '语言版本、框架版本、操作系统。有时候 Bug 是版本兼容性问题。' },
  { icon: '🔍', title: '描述期望与实际', desc: '"我期望的是XXX，但实际得到了YYY"——帮 AI 快速理解问题范围。' },
  { icon: '🧪', title: '让 AI 解释修复原因', desc: '不要只要代码，要追问"为什么这样改？"——这才是真正学习的机会。' },
];

export default function LessonCoding() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState('');

  const scenario = CODING_SCENARIOS[activeScenario];

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">💻 模块四：AI 编程助手</div>
        <h1>人人都是 10x 工程师</h1>
        <p className="lesson-intro">
          AI 不会让程序员失业，但<strong style={{color:'#a78bfa'}}>会用 AI 的程序员会替代不会用的</strong>。对于非程序员，AI 让"代码思维"第一次变得可及。这一节教你用对方法，让 AI 成为你的专属技术合伙人。
        </p>
      </header>

      {/* Coding Scenarios */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">🎯 AI 辅助编程的 3 大核心场景</h3>
        <p className="text-gray-400 text-sm mb-5">选择场景查看完整的 Prompt 模板和示例输出：</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {CODING_SCENARIOS.map((s, i) => (
            <button key={i} onClick={() => { setActiveScenario(i); setShowCode(false); }}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${activeScenario === i ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-gray-300 text-sm mb-4">{scenario.desc}</p>

        <div className="space-y-4">
          <div className="bg-black/40 border border-violet-500/20 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 cursor-pointer" onClick={() => setShowCode(!showCode)}>
              <span className="text-sm font-bold text-violet-300">📋 Prompt（点击展开）</span>
              <span className="text-xs text-gray-500">{showCode ? '▲' : '▼'}</span>
            </div>
            {showCode && (
              <div className="p-4 relative">
                <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">{scenario.prompt}</pre>
                <button onClick={() => copyText(scenario.prompt, 'prompt')} className="absolute top-3 right-3 text-xs bg-violet-900/60 text-violet-300 px-2 py-1 rounded flex items-center gap-1">
                  {copied === 'prompt' ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
                </button>
              </div>
            )}
          </div>
          <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-4 relative">
            <p className="text-xs text-emerald-400 font-bold mb-2">🤖 AI 输出示例</p>
            <pre className="text-xs text-gray-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">{scenario.output}</pre>
            <button onClick={() => copyText(scenario.output, 'output')} className="absolute top-3 right-3 text-xs bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded flex items-center gap-1">
              {copied === 'output' ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
            </button>
          </div>
        </div>
      </section>

      {/* Debug Steps */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🐛 AI Debug 黄金 5 步流程</h3>
        <p className="text-gray-400 text-sm mb-5">很多人"把错误截图发给 AI"——这是最低效的做法。正确的 Bug 汇报能让 AI 一击即中：</p>
        <div className="space-y-3">
          {DEBUG_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
              <span className="text-2xl shrink-0">{step.icon}</span>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{`步骤 ${i + 1}: ${step.title}`}</h4>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Coding Tools */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">🛠️ 主流 AI 编程工具全景</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: 'GitHub Copilot', desc: '直接在 VS Code/JetBrains 里内联补全代码。按 Tab 接受建议，Alt+] 切换选项。最适合写重复性代码和补充 boilerplate。', badge: '最广泛', color: 'blue' },
            { name: 'Cursor IDE', desc: '专为 AI 辅助编程设计的 IDE，基于 VS Code。Cmd+K 直接在编辑器里对话修改代码，Cmd+L 打开侧边对话框。', badge: '最强大', color: 'violet' },
            { name: 'Claude / ChatGPT', desc: '用于架构设计、复杂逻辑讨论、代码审查。长文本、复杂推理场景下比内联工具更适合。', badge: '适合对话', color: 'emerald' },
            { name: 'Devin / Replit AI', desc: '自主 Agent，能自动创建文件、运行代码、调试直到完成任务。适合原型快速搭建，减少手动操作。', badge: '自主 Agent', color: 'orange' },
          ].map((tool, i) => {
            const colors = { blue: {border: '#2563eb', bg: 'rgba(37,99,235,0.1)', badge: '#2563eb'}, violet: {border: '#7c3aed', bg: 'rgba(124,58,237,0.1)', badge: '#7c3aed'}, emerald: {border: '#059669', bg: 'rgba(5,150,105,0.1)', badge: '#059669'}, orange: {border: '#d97706', bg: 'rgba(217,119,6,0.1)', badge: '#d97706'} };
            const c = colors[tool.color];
            return (
              <div key={i} className="p-4 rounded-xl border" style={{borderColor: c.border + '60', background: c.bg}}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{tool.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{background: c.badge}}>{tool.badge}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Non-programmer Note */}
      <section className="lesson-section glass-panel mt-8" style={{borderLeft: '4px solid #7c3aed'}}>
        <h4 className="font-bold text-violet-300 mb-2">💡 给非程序员的特别提示</h4>
        <p className="text-sm text-gray-300 leading-relaxed">
          即使你从来不打算写代码，AI 编程能力也非常有价值：用 Claude 写 Excel VBA 宏来自动化繁琐报表、用 ChatGPT 生成 SQL 查询直接从数据库取数、让 AI 帮你写 Shell 脚本批量重命名文件。<strong className="text-white">代码是通用的自动化工具，AI 让你第一次可以不懂语法就用上它。</strong>
        </p>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/data')}>
          开发满级！进入 AI 数据分析篇 →
        </button>
      </section>
    </div>
  );
}
