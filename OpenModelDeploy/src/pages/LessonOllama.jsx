import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 02 — Ollama 本地部署
   Modelfile / GPU 加速 / 多模型管理
   ───────────────────────────────────────────── */

const OLLAMA_COMMANDS = [
  { cmd: 'ollama run llama3.2', desc: '下载并运行模型（一键）', category: '基础' },
  { cmd: 'ollama pull qwen2.5:72b', desc: '仅下载模型不运行', category: '基础' },
  { cmd: 'ollama list', desc: '列出本地已下载的模型', category: '管理' },
  { cmd: 'ollama show llama3.2', desc: '查看模型详情（参数/许可证/Modelfile）', category: '管理' },
  { cmd: 'ollama cp llama3.2 my-llama', desc: '复制模型（用于自定义）', category: '管理' },
  { cmd: 'ollama rm my-llama', desc: '删除本地模型', category: '管理' },
  { cmd: 'ollama serve', desc: '启动 Ollama API 服务 (默认 :11434)', category: 'API' },
  { cmd: 'ollama ps', desc: '查看正在运行的模型', category: '运行时' },
];

const POPULAR_MODELS = [
  { name: 'Llama 3.2 3B', size: '2.0 GB', speed: '~60 tok/s (M2)', use: 'Mac 本地对话/编码' },
  { name: 'Qwen 2.5 7B', size: '4.7 GB', speed: '~40 tok/s (M2)', use: '中文最强 7B 模型' },
  { name: 'DeepSeek-R1 7B', size: '4.7 GB', speed: '~35 tok/s (M2)', use: '推理增强 / 数学' },
  { name: 'Gemma 2 9B', size: '5.4 GB', speed: '~30 tok/s (M2)', use: 'Google 高效模型' },
  { name: 'Llama 3.1 70B', size: '40 GB', speed: '~8 tok/s (H100)', use: '最强开源通用模型' },
  { name: 'Qwen 2.5 72B', size: '42 GB', speed: '~7 tok/s (A100)', use: '中文最强大模型' },
  { name: 'nomic-embed-text', size: '274 MB', speed: 'N/A', use: 'Embedding 模型' },
  { name: 'llava 13B', size: '8.0 GB', speed: '~15 tok/s', use: '多模态 (图片+文字)' },
];

export default function LessonOllama() {
  const [tab, setTab] = useState('quickstart');

  return (
    <div className="lesson-deploy">
      <div className="dp-badge green">🚀 module_02 — Ollama</div>

      <div className="dp-hero">
        <h1>Ollama：一键运行开源大模型</h1>
        <p>
          Ollama 是本地 LLM 的 Docker——<strong>一行命令</strong>就能在 Mac/Linux/Windows 
          上运行 Llama、Qwen、DeepSeek 等模型。本模块从安装到生产级 API 配置，
          覆盖 Modelfile 自定义、GPU 加速策略和多模型管理。
        </p>
      </div>

      {/* ─── Tab切换 ─── */}
      <div className="dp-pills">
        {['quickstart', 'modelfile', 'api', 'gpu'].map(t => (
          <button key={t} className={`dp-btn ${tab === t ? 'primary' : 'green'}`}
            onClick={() => setTab(t)} style={{ fontSize: '0.8rem' }}>
            {{ quickstart: '🚀 快速上手', modelfile: '📝 Modelfile', api: '🔌 API 集成', gpu: '⚡ GPU 加速' }[t]}
          </button>
        ))}
      </div>

      {tab === 'quickstart' && (
        <>
          <div className="dp-section">
            <h2 className="dp-section-title">🚀 5 分钟快速上手</h2>
            <div className="dp-code-wrap">
              <div className="dp-code-head">
                <span className="dp-code-dot" style={{ background: '#ef4444' }} />
                <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
                <span className="dp-code-dot" style={{ background: '#22c55e' }} />
                🖥️ terminal
              </div>
              <pre className="dp-code">{`# ─── Step 1: 安装 Ollama ───
# macOS
curl -fsSL https://ollama.com/install.sh | sh
# 或 brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: 下载 OllamaSetup.exe

# ─── Step 2: 一键运行模型 ───
ollama run llama3.2        # 3B 模型，2GB 显存即可
ollama run qwen2.5:7b      # 中文最强 7B
ollama run deepseek-r1:7b  # 推理增强

# ─── Step 3: 测试 API ───
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Hello!"}],
  "stream": false
}'`}</pre>
            </div>
          </div>

          <div className="dp-section">
            <h2 className="dp-section-title">📦 常用命令速查</h2>
            <div className="dp-card">
              <table className="dp-table">
                <thead><tr><th>命令</th><th>说明</th><th>类别</th></tr></thead>
                <tbody>
                  {OLLAMA_COMMANDS.map((c, i) => (
                    <tr key={i}>
                      <td><code style={{ color: '#4ade80', fontSize: '0.78rem' }}>{c.cmd}</code></td>
                      <td style={{ color: '#94a3b8' }}>{c.desc}</td>
                      <td><span className="dp-tag green">{c.category}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dp-section">
            <h2 className="dp-section-title">🏆 推荐模型</h2>
            <div className="dp-card">
              <table className="dp-table">
                <thead><tr><th>模型</th><th>大小</th><th>速度</th><th>适用场景</th></tr></thead>
                <tbody>
                  {POPULAR_MODELS.map((m, i) => (
                    <tr key={i}>
                      <td><strong style={{ color: '#4ade80' }}>{m.name}</strong></td>
                      <td style={{ color: '#fde047' }}>{m.size}</td>
                      <td style={{ color: '#94a3b8' }}>{m.speed}</td>
                      <td style={{ color: '#94a3b8' }}>{m.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'modelfile' && (
        <div className="dp-section">
          <h2 className="dp-section-title">📝 Modelfile 自定义模型</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              📄 Modelfile
            </div>
            <pre className="dp-code">{`# ─── 自定义 AI 助手 ───
FROM qwen2.5:7b

# 设置参数
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 8192        # 上下文长度
PARAMETER repeat_penalty 1.1
PARAMETER stop "<|im_end|>"

# 系统提示词
SYSTEM """
你是一个专业的 Python 编程助手。
- 用中文回答，代码注释用英文
- 代码要包含类型注解和 docstring
- 始终考虑边界情况和错误处理
- 推荐 Pythonic 的写法
"""

# 对话模板（通常不需要改，模型自带）
TEMPLATE """
{{ if .System }}<|im_start|>system
{{ .System }}<|im_end|>
{{ end }}{{ if .Prompt }}<|im_start|>user
{{ .Prompt }}<|im_end|>
{{ end }}<|im_start|>assistant
{{ .Response }}<|im_end|>
"""

# 构建命令:
# ollama create my-python-assistant -f Modelfile
# ollama run my-python-assistant`}</pre>
          </div>
          <div className="dp-alert success" style={{ marginTop: '1rem' }}>
            <strong>💡 导入自己的 GGUF 模型：</strong><br/>
            <code>FROM ./my-finetuned-model.gguf</code> — 可以直接加载本地 GGUF 文件！
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div className="dp-section">
          <h2 className="dp-section-title">🔌 Ollama API 集成</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              🐍 ollama_integration.py
            </div>
            <pre className="dp-code">{`# ─── 方法 1: Ollama Python SDK ───
import ollama

response = ollama.chat(
    model="qwen2.5:7b",
    messages=[
        {"role": "system", "content": "你是 Python 专家"},
        {"role": "user", "content": "写一个异步爬虫"}
    ],
)
print(response["message"]["content"])

# 流式输出
for chunk in ollama.chat(model="qwen2.5:7b",
    messages=[{"role": "user", "content": "你好"}],
    stream=True):
    print(chunk["message"]["content"], end="", flush=True)

# ─── 方法 2: OpenAI 兼容接口 ───
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",  # Ollama 兼容端点
    api_key="ollama"                         # 任意字符串
)

response = client.chat.completions.create(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "你好"}],
    temperature=0.7,
)
print(response.choices[0].message.content)

# ─── 方法 3: LangChain 集成 ───
from langchain_ollama import ChatOllama

llm = ChatOllama(model="qwen2.5:7b", temperature=0.7)
response = llm.invoke("什么是 RAG？")

# ─── Embedding ───
embeddings = ollama.embed(
    model="nomic-embed-text",
    input=["向量搜索很有用", "Embedding 是基础"]
)
# embeddings["embeddings"] → [[0.1, -0.2, ...], ...]`}</pre>
          </div>
        </div>
      )}

      {tab === 'gpu' && (
        <div className="dp-section">
          <h2 className="dp-section-title">⚡ GPU 加速配置</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              🖥️ gpu_config.sh
            </div>
            <pre className="dp-code">{`# ─── NVIDIA GPU 自动检测 ───
# Ollama 自动检测 CUDA GPU，无需额外配置
ollama run llama3.1:70b  # 自动使用 GPU

# 检查 GPU 使用情况
nvidia-smi

# ─── 环境变量调优 ───
# 指定使用哪些 GPU
export CUDA_VISIBLE_DEVICES=0,1     # 多 GPU

# GPU 层数（部分层放 GPU，其余放 CPU）
export OLLAMA_NUM_GPU=35            # GPU 上放 35 层

# 并发请求数
export OLLAMA_NUM_PARALLEL=4        # 同时处理 4 个请求

# 上下文长度
export OLLAMA_CONTEXT_LENGTH=32768  # 32K 上下文

# 模型保留时间（默认 5m 后卸载）
export OLLAMA_KEEP_ALIVE=30m        # 保留 30 分钟

# ─── macOS Metal (Apple Silicon) ───
# 自动启用 Metal 加速，无需配置
# M1/M2/M3/M4 统一内存 = GPU 显存

# ─── 多模型并行 ───
# 终端 1: ollama run llama3.2
# 终端 2: ollama run qwen2.5:7b
# 两个模型同时加载（需要足够内存）

# ─── 远程访问 ───
export OLLAMA_HOST=0.0.0.0:11434    # 允许远程连接
# 注意：生产环境务必加 Nginx 反代 + 鉴权！`}</pre>
          </div>
          <div className="dp-grid-2" style={{ marginTop: '1rem' }}>
            <div className="dp-alert success">
              <strong>✅ Apple Silicon 优势</strong><br/>
              统一内存架构让 M4 Max 128GB 可以跑 70B 模型，无需 GPU 显存限制。
            </div>
            <div className="dp-alert info">
              <strong>📊 NVIDIA GPU 建议</strong><br/>
              7B → RTX 3060 12GB | 13B → RTX 4090 24GB | 70B → A100 80GB
            </div>
          </div>
        </div>
      )}

      <div className="dp-nav">
        <button className="dp-btn">← 部署基础</button>
        <button className="dp-btn green">vLLM 高性能推理 →</button>
      </div>
    </div>
  );
}
