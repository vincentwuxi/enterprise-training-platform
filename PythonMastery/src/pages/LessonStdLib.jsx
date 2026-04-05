import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const STDLIB_MODULES = [
  {
    mod: 'collections',
    desc: '高性能容器数据类型，是普通列表/字典的增强版',
    items: [
      { name: 'Counter', use: '词频统计、计数器', code: `from collections import Counter\nwords = ["apple", "banana", "apple", "cherry", "banana", "apple"]\nc = Counter(words)\nprint(c.most_common(2))\n# [('apple', 3), ('banana', 2)]\nprint(c["apple"])        # 3` },
      { name: 'defaultdict', use: '带默认值的字典，无需 setdefault', code: `from collections import defaultdict\ngraph = defaultdict(list)\n# 不存在的键自动返回 []\ngraph["A"].append("B")\ngraph["A"].append("C")\nprint(dict(graph))\n# {'A': ['B', 'C']}` },
      { name: 'deque', use: '双端队列，O(1) 两端操作', code: `from collections import deque\nd = deque([1, 2, 3], maxlen=5)\nd.appendleft(0)      # [0, 1, 2, 3]\nd.append(4)          # [0, 1, 2, 3, 4]\nd.rotate(2)          # [3, 4, 0, 1, 2]\nprint(d.popleft())   # 3` },
      { name: 'namedtuple', use: '具名元组，轻量级不可变对象', code: `from collections import namedtuple\nPoint = namedtuple("Point", ["x", "y"])\np = Point(3, 4)\nprint(p.x, p.y)      # 3 4\nprint(p._asdict())   # {'x': 3, 'y': 4}\n# 比 dict 节省内存，有属性名访问` },
    ],
  },
  {
    mod: 'itertools',
    desc: '高效迭代器工具，避免不必要的内存复制',
    items: [
      { name: 'chain()', use: '串联多个可迭代对象', code: `from itertools import chain\nresult = list(chain([1,2], [3,4], [5]))\n# [1, 2, 3, 4, 5]\n# 等价于 [*a, *b, *c] 但更节内存` },
      { name: 'groupby()', use: '分组（需先排序！）', code: `from itertools import groupby\ndata = sorted([("A",1),("B",2),("A",3)], key=lambda x: x[0])\nfor key, group in groupby(data, key=lambda x: x[0]):\n    print(key, list(group))\n# A [('A', 1), ('A', 3)]\n# B [('B', 2)]` },
      { name: 'product()', use: '笛卡尔积（替代多层 for 循环）', code: `from itertools import product\nfor x, y in product([1,2], ['a','b']):\n    print(x, y)\n# 1 a / 1 b / 2 a / 2 b` },
      { name: 'islice()', use: '惰性切片，节省内存', code: `from itertools import islice\ndef count_up():\n    n = 0\n    while True: yield n; n+=1\n\n# 只取前 5 个，不生成无限序列\nfirst5 = list(islice(count_up(), 5))\n# [0, 1, 2, 3, 4]` },
    ],
  },
  {
    mod: 'functools',
    desc: '函数式编程工具，缓存、偏函数、归约',
    items: [
      { name: 'lru_cache', use: '记忆化缓存，加速递归/重复计算', code: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)\n\nprint(fib(100))   # 瞬间完成\nprint(fib.cache_info())  # 缓存统计` },
      { name: 'partial()', use: '偏函数，固定部分参数', code: `from functools import partial\ndef power(base, exp): return base ** exp\n\nsquare = partial(power, exp=2)\ncube   = partial(power, exp=3)\nprint(square(4))   # 16\nprint(cube(3))     # 27` },
      { name: 'reduce()', use: '归约操作', code: `from functools import reduce\nnums = [1, 2, 3, 4, 5]\nproduct = reduce(lambda a, b: a*b, nums)\nprint(product)     # 120\n# 等价于 1*2*3*4*5` },
      { name: 'total_ordering', use: '自动补全比较方法', code: `from functools import total_ordering\n@total_ordering\nclass Version:\n    def __init__(self, v): self.v = v\n    def __eq__(self, o): return self.v == o.v\n    def __lt__(self, o): return self.v < o.v\n# 自动生成 >, >=, <=` },
    ],
  },
];

export default function LessonStdLib() {
  const navigate = useNavigate();
  const [activeMod, setActiveMod] = useState(0);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge">📚 module_05 — 标准库精讲</div>

      <div className="py-hero">
        <h1>标准库精讲：自带的"瑞士军刀"</h1>
        <p>Python 最大的优势是"内置电池"（Batteries Included）。<strong>真正掌握标准库</strong>，能让你用更少代码解决更多问题，而无需安装任何第三方包。</p>
      </div>

      {/* 核心库交互 */}
      <div className="py-section">
        <h2 className="py-section-title">🔋 核心标准库交互演示</h2>
        <div className="py-interactive">
          <h3>
            选择模块
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {STDLIB_MODULES.map((m, i) => (
                <button key={m.mod} className={`py-btn ${activeMod === i ? 'primary' : ''}`}
                  onClick={() => { setActiveMod(i); setActiveItem(0); }}
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{m.mod}</button>
              ))}
            </div>
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>{STDLIB_MODULES[activeMod].desc}</p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {STDLIB_MODULES[activeMod].items.map((item, i) => (
              <button key={item.name} className={`py-btn ${activeItem === i ? 'yellow' : ''}`}
                onClick={() => setActiveItem(i)}
                style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                {item.name}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>
            适用场景：{STDLIB_MODULES[activeMod].items[activeItem].use}
          </div>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{STDLIB_MODULES[activeMod].mod}_demo.py</span>
          </div>
          <div className="py-editor">{STDLIB_MODULES[activeMod].items[activeItem].code}</div>
        </div>
      </div>

      {/* datetime */}
      <div className="py-section">
        <h2 className="py-section-title">⏰ datetime — 时间处理必备</h2>
        <div className="py-card">
          <div className="py-editor" style={{ padding: '0.875rem 1rem', fontSize: '0.78rem' }}>{`from datetime import datetime, date, timedelta, timezone

# 当前时间
now = datetime.now()                    # 本地时间
utc_now = datetime.now(timezone.utc)   # UTC 时间（推荐）

# 格式化
print(now.strftime("%Y-%m-%d %H:%M:%S"))    # 2024-04-05 08:30:00
print(now.isoformat())                       # 2024-04-05T08:30:00.123456

# 解析字符串
dt = datetime.strptime("2024-04-05", "%Y-%m-%d")

# 时间运算
tomorrow = datetime.now() + timedelta(days=1)
delta = datetime(2025, 1, 1) - datetime.now()
print(f"距离 2025 年元旦还有 {delta.days} 天")

# 时区处理（推荐 zoneinfo，Python 3.9+）
from zoneinfo import ZoneInfo
beijing = datetime.now(ZoneInfo("Asia/Shanghai"))
print(beijing.strftime("%Z %Y-%m-%d %H:%M"))  # CST 2024-04-05 08:30`}</div>
        </div>
      </div>

      {/* os / sys / subprocess */}
      <div className="py-section">
        <h2 className="py-section-title">🖥️ os / sys / subprocess — 系统交互</h2>
        <div className="py-grid-2">
          {[
            { title: 'os 模块', code: `import os\n# 环境变量\napi_key = os.environ.get("API_KEY", "default")\nos.environ["DEBUG"] = "true"\n\n# 进程管理\nprint(os.getpid())       # 当前进程 ID\nos.system("ls -la")      # 执行 shell 命令（简单用）\n\n# 路径操作（建议用 pathlib 替代）\nabs_path = os.path.abspath(".")\nbase = os.path.basename("/a/b/c.txt")  # c.txt` },
            { title: 'subprocess 模块', code: `import subprocess\n\n# 推荐方式：subprocess.run\nresult = subprocess.run(\n    ["git", "log", "--oneline", "-5"],\n    capture_output=True,\n    text=True,\n    timeout=10\n)\nprint(result.stdout)\nprint(result.returncode)  # 0 = 成功\n\n# 管道链\nps = subprocess.run(["ps", "aux"], capture_output=True, text=True)\ngrep = subprocess.run(["grep", "python"],\n    input=ps.stdout, capture_output=True, text=True)\nprint(grep.stdout)` },
          ].map(s => (
            <div key={s.title} className="py-card">
              <h3>{s.title}</h3>
              <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.72rem' }}>{s.code}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 标准库速查表 */}
      <div className="py-section">
        <h2 className="py-section-title">📋 30 个最常用标准库速查</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>模块</th><th>主要用途</th><th>关键点</th></tr></thead>
            <tbody>
              {[
                ['pathlib', '文件路径操作', '替代 os.path，面向对象 API'],
                ['json', 'JSON 序列化', 'json.loads/dumps, json.load/dump'],
                ['re', '正则表达式', 'compile 预编译提升性能'],
                ['datetime', '日期时间', '用 timezone.utc，避免 naive datetime'],
                ['logging', '日志记录', '比 print 更专业，支持级别/文件'],
                ['argparse', '命令行参数', 'CLI 工具必备'],
                ['typing', '类型注解', 'List/Dict/Optional/Union/Generic'],
                ['dataclasses', '数据类', '替代大量 __init__ 样板代码'],
                ['enum', '枚举类型', '替代字符串魔法值'],
                ['contextlib', '上下文管理器', '@contextmanager 快速创建 with 语句'],
                ['abc', '抽象基类', '@abstractmethod 强制接口实现'],
                ['copy', '对象复制', 'copy.deepcopy 深拷贝'],
                ['hashlib', '哈希计算', 'md5/sha256，文件完整性校验'],
                ['hmac', '消息认证', 'API 签名验证'],
                ['base64', 'Base64 编解码', '二进制数据 HTTP 传输'],
                ['urllib', 'HTTP 请求（内置）', '简单场景用，复杂用 requests'],
                ['http.server', '简易 HTTP 服务', 'python -m http.server 8000'],
                ['socket', '底层网络', 'TCP/UDP 直接编程'],
                ['struct', '二进制格式', '解析网络协议/二进制文件'],
                ['threading', '多线程', 'I/O 密集型，有 GIL 限制'],
                ['multiprocessing', '多进程', 'CPU 密集型，绕过 GIL'],
                ['asyncio', '异步 I/O', '高并发网络应用'],
                ['concurrent.futures', '线程/进程池', 'ThreadPool/ProcessPool 高层接口'],
                ['queue', '线程安全队列', '生产者/消费者模型'],
                ['heapq', '堆/优先队列', 'nlargest/nsmallest 快速 Top-N'],
                ['bisect', '二分查找', '有序列表的快速插入/查找'],
                ['math', '数学函数', 'math.isclose 比较浮点数'],
                ['random', '随机数', 'random.sample 无重复抽样'],
                ['statistics', '统计计算', 'mean/median/stdev'],
                ['textwrap', '文本格式化', 'wrap 自动换行'],
              ].map(([mod, use, tip]) => (
                <tr key={mod}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24', fontSize: '0.82rem' }}>{mod}</code></td>
                  <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{use}</td>
                  <td style={{ fontSize: '0.78rem', color: '#475569' }}>{tip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/dataio')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/concurrent')}>下一模块：并发编程 →</button>
      </div>
    </div>
  );
}
