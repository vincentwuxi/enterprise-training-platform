import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DATA_TYPES = [
  { type: 'int',   example: '42, -7, 0',           ops: '+ - * // % **',    note: '整数，精度无限' },
  { type: 'float', example: '3.14, -0.5, 1e10',    ops: '+ - * / **',       note: '浮点数，注意精度陷阱' },
  { type: 'str',   example: '"hello", \'world\'',   ops: '+ * [i] [i:j]',    note: '不可变序列，万物皆可转 str' },
  { type: 'bool',  example: 'True, False',          ops: 'and or not',       note: '本质是 int(1/0)' },
  { type: 'list',  example: '[1, "a", True]',       ops: '[i] append sort',  note: '可变有序序列，最常用' },
  { type: 'tuple', example: '(1, 2, 3)',            ops: '[i] count index',  note: '不可变，适合当字典键' },
  { type: 'dict',  example: '{"k": "v"}',           ops: '[k] get keys',     note: '哈希表，O(1) 查找' },
  { type: 'set',   example: '{1, 2, 3}',            ops: '| & - ^',          note: '无序唯一，集合运算' },
];

const CODE_SAMPLES = {
  vars: `# 变量赋值 — Python 是动态类型语言
name = "Alice"          # str
age  = 25               # int
pi   = 3.14159          # float
is_student = True       # bool

# 多重赋值
x, y, z = 1, 2, 3
a = b = c = 0           # 同时赋值

# 类型查看 & 转换
print(type(name))       # <class 'str'>
print(int("42"))        # 42
print(str(3.14))        # "3.14"
print(float("1e3"))     # 1000.0`,

  control: `# 条件语句
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"          # ← 进入这里
else:
    grade = "C"

# 三元表达式（Python 风格）
status = "pass" if score >= 60 else "fail"

# for 循环
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# while 循环
count = 0
while count < 3:
    print(count)
    count += 1

# 推导式（Python 最地道的写法）
squares = [x**2 for x in range(10) if x % 2 == 0]
# → [0, 4, 16, 36, 64]`,

  fstring: `# f-string — Python 3.6+ 推荐方式
name, age = "Bob", 30
print(f"My name is {name}, I'm {age} years old.")

# 格式化数字
pi = 3.14159
print(f"π ≈ {pi:.2f}")          # π ≈ 3.14
print(f"{1000000:,}")           # 1,000,000
print(f"{0.85:.0%}")            # 85%

# 表达式直接嵌入
print(f"2 + 2 = {2 + 2}")        # 2 + 2 = 4
print(f"{'hello'.upper()}")     # HELLO`,
};

export default function LessonBasics() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState(null);
  const [codeSample, setCodeSample] = useState('vars');
  const [quizAns, setQuizAns] = useState(null);

  return (
    <div className="lesson-py">
      <div className="py-badge">🐍 module_01 — Python 基础</div>

      <div className="py-hero">
        <h1>Python 基础：语法、数据类型与控制流</h1>
        <p>Python 的核心哲学：<strong>"优美胜于丑陋，明确胜于晦涩"</strong>。掌握数据类型和控制流，你已经能解决 80% 的日常编程问题。</p>
      </div>

      {/* 数据类型交互表 */}
      <div className="py-section">
        <h2 className="py-section-title">📦 核心数据类型（点击查看详情）</h2>
        <div className="py-grid-4">
          {DATA_TYPES.map((t, i) => (
            <div key={t.type}
              onClick={() => setActiveType(activeType === i ? null : i)}
              style={{
                padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                background: activeType === i ? 'rgba(26,86,219,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeType === i ? 'rgba(26,86,219,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{t.type}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'JetBrains Mono' }}>{t.example.substring(0, 18)}</div>
            </div>
          ))}
        </div>
        {activeType !== null && (
          <div style={{ marginTop: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(26,86,219,0.07)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>示例值</div><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: '#ce9178' }}>{DATA_TYPES[activeType].example}</code></div>
            <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>常用操作</div><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: '#dcdcaa' }}>{DATA_TYPES[activeType].ops}</code></div>
            <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>关键特性</div><span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{DATA_TYPES[activeType].note}</span></div>
          </div>
        )}
      </div>

      {/* 代码示例 */}
      <div className="py-section">
        <h2 className="py-section-title">💻 代码示例（可切换）</h2>
        <div className="py-interactive">
          <h3>
            Python 代码精讲
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[['vars', '变量赋值'], ['control', '控制流'], ['fstring', 'f-string']].map(([k, l]) => (
                <button key={k} className={`py-btn ${codeSample === k ? 'primary' : ''}`} onClick={() => setCodeSample(k)}>{l}</button>
              ))}
            </div>
          </h3>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>example.py</span>
          </div>
          <div className="py-editor">{CODE_SAMPLES[codeSample]}</div>
        </div>
      </div>

      {/* 常见陷阱 */}
      <div className="py-section">
        <h2 className="py-section-title">⚠️ Python 新手必踩的坑</h2>
        <div className="py-grid-2">
          {[
            { title: '可变默认参数', bad: 'def f(lst=[]):\n    lst.append(1)\n    return lst\n# 每次调用共享同一个 list！', good: 'def f(lst=None):\n    if lst is None: lst = []\n    lst.append(1)\n    return lst' },
            { title: '浮点精度', bad: '>>> 0.1 + 0.2\n0.30000000000000004\n>>> 0.1 + 0.2 == 0.3\nFalse', good: 'from decimal import Decimal\nDecimal("0.1") + Decimal("0.2")\n# → Decimal("0.3") ✅\n# 或用 math.isclose()' },
            { title: 'is vs ==', bad: '>>> a = 1000\n>>> b = 1000\n>>> a is b\nFalse  # is 比较身份 (id)\n>>> a == b\nTrue   # == 比较值', good: '# 规则：\n# == 比较值（日常使用这个）\n# is 只用于 None 比较：\n# if x is None: ...' },
            { title: '整除 vs 除法', bad: '# Python 2 习惯\n5 / 2   # 在 Py3 = 2.5\n        # 不是 2 了！', good: '5 / 2    # → 2.5 （真除法）\n5 // 2   # → 2   （整除）\n5 % 2    # → 1   （取余）\n-7 // 2  # → -4  （向下取整！）' },
          ].map(t => (
            <div key={t.title} className="py-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
              <h3 style={{ color: '#fbbf24' }}>⚠️ {t.title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', marginBottom: '0.3rem', fontWeight: 700 }}>❌ 问题</div>
                  <div className="py-editor" style={{ fontSize: '0.72rem', padding: '0.6rem 0.75rem' }}>{t.bad}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399', marginBottom: '0.3rem', fontWeight: 700 }}>✅ 正确</div>
                  <div className="py-editor" style={{ fontSize: '0.72rem', padding: '0.6rem 0.75rem' }}>{t.good}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 测验 */}
      <div className="py-section">
        <h2 className="py-section-title">🧠 快速测验</h2>
        <div className="py-interactive">
          <h3>Q: Python 中 <code style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24' }}>[] * 3</code> 的结果是？</h3>
          {[
            { ans: 'A', text: '报错，列表不支持乘法运算', correct: false },
            { ans: 'B', text: '[[], [], []] — 三个独立的空列表', correct: false },
            { ans: 'C', text: '[] — 空列表乘以任何數都是空列表', correct: true },
            { ans: 'D', text: '[[],[],[]] — 嵌套结构', correct: false },
          ].map(o => (
            <div key={o.ans} className={`py-quiz-opt ${quizAns === o.ans ? (o.correct ? 'correct' : 'wrong') : ''}`}
              onClick={() => setQuizAns(o.ans)}>
              <strong style={{ marginRight: '0.75rem', color: '#64748b' }}>{o.ans}.</strong>{o.text}
              {quizAns === o.ans && <span style={{ marginLeft: '0.75rem' }}>{o.correct ? '✅' : '❌'}</span>}
            </div>
          ))}
          {quizAns === 'C' && (
            <div className="py-result">
              💡 正确！<code style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24' }}>[1, 2] * 3 → [1, 2, 1, 2, 1, 2]</code>，空列表重复后还是空列表。注意：这和 <code style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24' }}>[[]] * 3</code> 不同，后者三个引用指向同一个列表对象！
            </div>
          )}
        </div>
      </div>

      <div className="py-nav">
        <div />
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/functions')}>下一模块：函数与模块 →</button>
      </div>
    </div>
  );
}
