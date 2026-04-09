import { useState } from 'react';
import './LessonCommon.css';

const STRATEGIES = [
  {
    key: 'fixed', name: 'Fixed-size Chunking', icon: '📏',
    pro: '实现最简单，速度最快', con: '切割句子导致语义破碎，效果较差',
    best: '结构均匀的日志/数据文件', score: 2,
    code: `from langchain.text_splitter import CharacterTextSplitter

# ❌ 最简单但效果最差
splitter = CharacterTextSplitter(
    separator="",          # 不考虑任何语义边界
    chunk_size=500,        # 每 500 字符硬切
    chunk_overlap=50,      # 重叠 50 字符（避免上下文丢失）
)

# 问题：可能在句子中间切断
# "用户需要在24小时内完成..." 被切成
# chunk1: "用户需要在24小时内"
# chunk2: "完成退货申请" ← 失去上下文！`,
  },
  {
    key: 'recursive', name: 'Recursive Chunking', icon: '🔄',
    pro: '尝试按段落/句子等自然边界切分，是最常用策略', con: '对Markdown/代码等格式化文档不够智能',
    best: '通用文档（大多数场景的首选）', score: 4,
    code: `from langchain.text_splitter import RecursiveCharacterTextSplitter

# ✅ 最常用，按优先级尝试不同分隔符
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    # 按优先级依次尝试这些分隔符分割
    separators=[
        "\n\n",    # 1. 优先按段落分
        "\n",      # 2. 按行分
        "。",      # 3. 按中文句号分
        "！", "？",
        " ",       # 4. 按空格分
        "",        # 5. 最后按字符分
    ],
    length_function=len,
)

chunks = splitter.split_text(text)
print(f"切分为 {len(chunks)} 个 chunk")
# 每个 chunk 都尽量保持完整的段落/句子

# 对于中文文档的优化版本
from langchain.text_splitter import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",   # 用 token 数计算而非字符数
    chunk_size=400,        # 400 tokens（约 700-800 中文字）
    chunk_overlap=50,
)`,
  },
  {
    key: 'semantic', name: 'Semantic Chunking', icon: '🧠',
    pro: '根据语义相似度切分，边界最自然，RAG 召回率最高', con: '需要先计算 Embedding，速度较慢，成本较高',
    best: '高质量知识库（法律/医疗/技术文档）', score: 5,
    code: `from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# ✅✅ 语义切分：计算相邻句子的语义距离
# 当语义发生明显跳变时，判定为切分点
embeddings = OpenAIEmbeddings()
splitter = SemanticChunker(
    embeddings,
    breakpoint_threshold_type="percentile",  # 或 "standard_deviation"
    breakpoint_threshold_amount=95,           # 95% 分位数作为切分阈值
)

chunks = splitter.split_text(text)

# 原理：
# "苹果是一种水果。苹果含有丰富的维生素C。" → 同一语义块
# "苹果是一种水果。" | "手机的电池续航..." → 语义跳变，切分点！

# 效果对比（同一文档）：
# Fixed:    平均召回率 ≈ 47%
# Recursive: 平均召回率 ≈ 62%
# Semantic:  平均召回率 ≈ 78%  ← 最佳，代价是 2-3x 处理时间`,
  },
  {
    key: 'structure', name: 'Structure-aware Chunking', icon: '🏗️',
    pro: '完全尊重文档原有结构（标题/列表/表格），最适合Markdown/HTML', con: '需要文档有较好的格式',
    best: 'Markdown/HTML/代码文档/Wiki', score: 5,
    code: `from langchain.text_splitter import MarkdownHeaderTextSplitter

# ✅✅ Markdown 结构感知切分
headers_to_split_on = [
    ("#",   "h1"),    # 一级标题作为大块边界
    ("##",  "h2"),    # 二级标题
    ("###", "h3"),
]

splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on,
    strip_headers=False,  # 保留标题信息在 metadata 中
)

chunks = splitter.split_text(markdown_text)
# 每个 chunk 附带 metadata:
# {"h1": "产品介绍", "h2": "退货政策", "source": "manual.md"}

# 利用 metadata 做精确过滤
results = vectorstore.similarity_search(
    "退货流程",
    filter={"h2": "退货政策"},  # 只在退货政策章节搜索
    k=5,
)

# HTML 文档
from langchain.text_splitter import HTMLHeaderTextSplitter
html_splitter = HTMLHeaderTextSplitter(
    headers_to_split_on=[("h1","h1"), ("h2","h2"),("h3","h3")]
)`,
  },
];

const DOC_TYPES = [
  { type: 'PDF', lib: 'PyPDFLoader / pdfplumber', issue: '表格和图片无法提取，多列布局乱序', fix: '用 pdfplumber 处理复杂表格，图片用 OCR', cmd: "pip install pypdf pdfplumber" },
  { type: 'Word (.docx)', lib: 'python-docx / Docx2txtLoader', issue: '样式信息丢失，嵌入图片需单独处理', fix: '用 python-docx 保留标题层级', cmd: "pip install python-docx" },
  { type: 'HTML / Web', lib: 'BeautifulSoup / Jina Reader', issue: '导航/广告等噪音干扰检索质量', fix: '提取 main/article 标签，过滤 nav/footer', cmd: "pip install beautifulsoup4 requests" },
  { type: 'CSV / Excel', lib: 'CSVLoader / pandas', issue: '表格型数据不适合直接切分', fix: '按行转为自然语言描述后再 Embedding', cmd: "pip install pandas openpyxl" },
];

export default function LessonChunking() {
  const [strat, setStrat] = useState('recursive');
  const s = STRATEGIES.find(x => x.key === strat) ?? {};

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 02 · CHUNKING STRATEGY</div>
        <h1>文档处理与 Chunking 工程</h1>
        <p>Chunking 策略是<strong>影响 RAG 效果最大的单一因素</strong>，没有之一。切错了，再好的 Embedding 模型和向量数据库也救不回来。本模块深度对比 4 种切分策略，告诉你每种场景该怎么选。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">✂️ 4 种核心 Chunking 策略</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {STRATEGIES.map(s => (
            <button key={s.key} className={`rag-btn ${strat === s.key ? 'active' : ''}`} onClick={() => setStrat(s.key)}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
        <div className="rag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="rag-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700 }}>{s.icon} {s.name}</span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= s.score ? 'var(--rag-emerald)' : 'rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>★</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', fontSize: '0.86rem' }}>
              <div><span style={{ color: 'var(--rag-emerald)' }}>✅ 优点：</span><span style={{ color: 'var(--rag-muted)' }}> {s.pro}</span></div>
              <div><span style={{ color: 'var(--rag-red)' }}>⚠️ 缺点：</span><span style={{ color: 'var(--rag-muted)' }}> {s.con}</span></div>
              <div><span style={{ color: 'var(--rag-teal)' }}>🎯 最适合：</span><span style={{ color: 'var(--rag-muted)' }}> {s.best}</span></div>
            </div>
          </div>
          <div className="rag-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--rag-emerald)' }}>Chunk Size 选择参考：</div>
            {[['128-256 tokens', '问答型：问题通常简短', 'green'], ['256-512 tokens', '✅ 通用推荐区间', 'teal'], ['512-1024 tokens', '知识密集型文档（技术文档）', 'amber'], ['>1024 tokens', '慎用：超出模型上下文注意力重点', 'red']].map(([sz, desc, c]) => (
              <div key={sz} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.84rem' }}>
                <span className={`rag-tag ${c}`}>{sz}</span>
                <span style={{ color: 'var(--rag-muted)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rag-code-wrap">
          <div className="rag-code-head">
            <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{s.key}_chunking.py</span>
          </div>
          <div className="rag-code">{s.code}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">📄 文档类型处理全攻略</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {DOC_TYPES.map((d, i) => (
            <div key={i} className="rag-card">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span className="rag-tag teal" style={{ flexShrink: 0 }}>{d.type}</span>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--rag-muted)', marginBottom: '0.3rem' }}>推荐库：<code style={{ color: 'var(--rag-emerald)', fontFamily: 'JetBrains Mono,monospace' }}>{d.lib}</code></div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--rag-muted)' }}>⚠️ 坑：{d.issue}</div>
                  <div style={{ fontSize: '0.82rem', color: '#34d399', marginTop: '0.2rem' }}>✅ 解法：{d.fix}</div>
                </div>
                <code style={{ fontSize: '0.75rem', color: 'var(--rag-amber)', fontFamily: 'JetBrains Mono,monospace', background: 'rgba(245,158,11,0.06)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>{d.cmd}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🔑 Chunking 黄金法则</div>
        <div className="rag-code-wrap">
          <div className="rag-code-head"><span>golden_rules.md</span></div>
          <div className="rag-code">{`# Chunking 黄金法则

## 1. 一个 chunk = 一个完整的想法
不要在句子中间切断。代价是 chunk 大小不均匀，但值得。

## 2. chunk_overlap 设置为 chunk_size 的 10-20%
chunk_size=512 → chunk_overlap=64
这样相邻 chunk 有重叠，确保边界上的信息不会丢失。

## 3. 先实验，再规模化
对 50-100 个真实查询测试不同 chunk 大小的召回效果
不要假设 chunk_size=512 对所有场景都最优

## 4. 在 metadata 中保存上下文
每个 chunk 存储：
  - source: 来源文件名
  - page: 页码（PDF）
  - section: 章节标题
  - chunk_id: 唯一ID（方便溯源）
这些 metadata 在检索后过滤和答案引用时极其重要

## 5. 清理文档的噪音
去掉：页眉/页脚/目录/参考文献/版权声明
保留：正文、表格（转文本）、重要标题`}</div>
        </div>
      </div>
    </div>
  );
}
