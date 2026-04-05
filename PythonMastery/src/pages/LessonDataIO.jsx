import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const REGEX_DEMOS = [
  { pattern: r`\d+`, desc: '一个或多个数字', test: '电话号 13800138000', match: '13800138000' },
  { pattern: r`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`, desc: '邮箱地址', test: 'user@example.com', match: 'user@example.com' },
  { pattern: r`^https?://[^\s]+`, desc: 'HTTP/HTTPS URL', test: 'https://python.org/docs', match: 'https://python.org/docs' },
  { pattern: r`\b\w{4}\b`, desc: '恰好4个字母的完整单词', test: 'The best code ever', match: 'best, code, ever' },
];

export default function LessonDataIO() {
  const navigate = useNavigate();
  const [regexIdx, setRegexIdx] = useState(0);
  const [activeFormat, setActiveFormat] = useState('json');

  const FORMAT_CODE = {
    json: `import json

# 读取 JSON 文件
with open("config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

# 写入 JSON
data = {"name": "Alice", "scores": [95, 87, 92]}
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 字符串互转
json_str = json.dumps(data)           # dict → str
obj = json.loads('{"key": "value"}')  # str → dict

# 处理复杂类型（datetime 等需自定义序列化器）
from datetime import datetime
class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)`,

    csv: `import csv
from pathlib import Path

# 读取 CSV
with open("data.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["age"])

# 写入 CSV（自动处理引号、换行）
fields = ["name", "age", "email"]
rows = [
    {"name": "Alice", "age": 25, "email": "alice@example.com"},
    {"name": "Bob",   "age": 30, "email": "bob@example.com"},
]
with open("output.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)`,

    pathlib: `from pathlib import Path

# Path 是现代文件操作的首选（替代 os.path）
p = Path("data") / "2024" / "report.csv"  # 自动处理分隔符

# 文件信息
print(p.name)       # "report.csv"
print(p.stem)       # "report"
print(p.suffix)     # ".csv"
print(p.parent)     # data/2024

# 遍历目录
for f in Path(".").glob("**/*.py"):   # 递归查找所有 .py
    print(f)

# 读写帮助方法
text = p.read_text(encoding="utf-8")
p.write_text("新内容", encoding="utf-8")

# 创建目录（exist_ok 避免报错）
Path("output/2024").mkdir(parents=True, exist_ok=True)`,

    pickle: `import pickle

# Pickle：Python 对象序列化（不跨语言，仅 Python 使用）
data = {"model": [1, 2, 3], "name": "MyModel", "config": {"lr": 0.01}}

# 保存
with open("model.pkl", "wb") as f:
    pickle.dump(data, f)

# 加载
with open("model.pkl", "rb") as f:
    loaded = pickle.load(f)

# ⚠️ 安全警告：永远不要 unpickle 不信任来源的数据！
# 考虑使用 JSON 或 msgpack 替代跨团队数据交换`,
  };

  return (
    <div className="lesson-py">
      <div className="py-badge">📁 module_04 — 数据处理</div>

      <div className="py-hero">
        <h1>数据处理：文件I/O、JSON、CSV 与正则表达式</h1>
        <p>真实程序几乎都需要读写数据。掌握文件操作、结构化格式处理和正则表达式，让你的程序能<strong>与真实世界的数据自由交互</strong>。</p>
      </div>

      {/* 上下文管理器 */}
      <div className="py-section">
        <h2 className="py-section-title">🔑 with 语句：永远用上下文管理器操作文件</h2>
        <div className="py-grid-2">
          <div className="py-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <h3 style={{ color: '#f87171' }}>❌ 容易出资源泄露</h3>
            <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>{`f = open("data.txt", "r")
content = f.read()
# 如果这里抛出异常，
# f.close() 永远不会执行！
f.close()`}</div>
          </div>
          <div className="py-card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
            <h3 style={{ color: '#34d399' }}>✅ 正确：with 自动关闭</h3>
            <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>{`# with 语句确保无论如何都会关闭文件
# 即使抛出异常也会执行 __exit__
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
    lines = f.readlines()  # list of lines
    # 文件在 with 块结束时自动关闭`}</div>
          </div>
        </div>

        <div className="py-card">
          <h3>文件读写模式速查</h3>
          <table className="py-table">
            <thead><tr><th>模式</th><th>含义</th><th>文件不存在</th><th>指针位置</th></tr></thead>
            <tbody>
              {[
                ['"r"', '只读文本', '报 FileNotFoundError', '文件开头'],
                ['"w"', '写入文本（覆盖）', '自动创建', '文件开头'],
                ['"a"', '追加文本', '自动创建', '文件末尾'],
                ['"x"', '独占创建', '文件已存在则报错', '文件开头'],
                ['"rb"', '二进制只读', '报 FileNotFoundError', '文件开头'],
                ['"r+"', '读写文本', '报 FileNotFoundError', '文件开头'],
              ].map(([m, d, e, p]) => (
                <tr key={m}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24', fontWeight: 700 }}>{m}</code></td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{d}</td>
                  <td style={{ fontSize: '0.82rem', color: '#60a5fa' }}>{e}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 格式处理切换 */}
      <div className="py-section">
        <h2 className="py-section-title">📊 结构化数据格式处理</h2>
        <div className="py-interactive">
          <h3>
            格式切换
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['json','JSON'],['csv','CSV'],['pathlib','pathlib'],['pickle','Pickle']].map(([k, l]) => (
                <button key={k} className={`py-btn ${activeFormat === k ? 'primary' : ''}`} onClick={() => setActiveFormat(k)}>{l}</button>
              ))}
            </div>
          </h3>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{activeFormat}_demo.py</span>
          </div>
          <div className="py-editor">{FORMAT_CODE[activeFormat]}</div>
        </div>
      </div>

      {/* 正则表达式 */}
      <div className="py-section">
        <h2 className="py-section-title">🔍 正则表达式（re 模块）</h2>
        <div className="py-interactive">
          <h3>
            常用正则模式演示
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {REGEX_DEMOS.map((r, i) => (
                <button key={i} className={`py-btn ${regexIdx === i ? 'primary' : ''}`} onClick={() => setRegexIdx(i)}>示例 {i + 1}</button>
              ))}
            </div>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 600 }}>正则模式</div>
              <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#ce9178' }}>{REGEX_DEMOS[regexIdx].pattern}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>含义：{REGEX_DEMOS[regexIdx].desc}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 600 }}>测试文本 / 匹配结果</div>
              <div style={{ padding: '0.75rem 1rem', background: '#020917', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
                输入：{REGEX_DEMOS[regexIdx].test}<br />
                <span style={{ color: '#6ee7b7' }}>匹配：{REGEX_DEMOS[regexIdx].match}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 600 }}>re 模块常用函数</div>
            <div className="py-editor" style={{ padding: '0.875rem 1rem', fontSize: '0.78rem' }}>{`import re

text = "电话: 13800138000, 邮箱: user@example.com"

# re.search — 找第一个匹配
m = re.search(r'\\d+', text)
print(m.group())           # 13800138000

# re.findall — 找所有匹配，返回 list
phones = re.findall(r'\\d{11}', text)

# re.sub — 替换
cleaned = re.sub(r'\\s+', ' ', text)   # 压缩多余空格

# re.compile — 预编译提升性能（多次使用同一模式）
email_re = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
emails = email_re.findall(text)

# 命名分组
m = re.match(r'(?P<year>\\d{4})-(?P<month>\\d{2})', "2024-04")
print(m.group('year'))     # 2024`}</div>
          </div>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/oop')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/stdlib')}>下一模块：标准库 →</button>
      </div>
    </div>
  );
}
