import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 07 — AI 水印与溯源
   C2PA / 数字水印 / AI 内容检测
   ───────────────────────────────────────────── */

const WATERMARK_METHODS = [
  { name: '文本水印 (KGW)', icon: '📝', category: '生成时嵌入',
    desc: 'Kirchenbauer et al. (UMD) — 在 Token 采样时偏向"绿色列表"词汇，形成统计可检测的信号',
    how: '将词表按前序 Token 的哈希分为绿色/红色组，生成时提升绿色组的概率',
    detect: '统计绿色 Token 比例，如果显著高于随机（z-score > 4），则判定为 AI 生成',
    pros: ['对用户不可见', '可数学证明检测率', '不降低文本质量（delta 很小时）'],
    cons: ['短文本检测率低', '释义攻击可移除水印', '多语言支持待完善'],
    code: `# KGW 文本水印 — 核心原理
import hashlib
import numpy as np

def get_green_tokens(prev_token, vocab_size, gamma=0.25):
    """基于前序 Token 生成绿色列表"""
    seed = hashlib.sha256(str(prev_token).encode()).digest()
    rng = np.random.RandomState(int.from_bytes(seed[:4], 'big'))
    perm = rng.permutation(vocab_size)
    green_size = int(vocab_size * gamma)
    return set(perm[:green_size])

def watermarked_sample(logits, prev_token, vocab_size, delta=2.0):
    """水印采样：提升绿色 Token 的 logit"""
    green_tokens = get_green_tokens(prev_token, vocab_size)
    for t in green_tokens:
        logits[t] += delta  # 轻微提升绿色 Token 概率
    return sample_from_logits(logits)

def detect_watermark(text, tokenizer, vocab_size, gamma=0.25):
    """检测文本是否含水印"""
    tokens = tokenizer.encode(text)
    green_count = 0
    for i in range(1, len(tokens)):
        green_set = get_green_tokens(tokens[i-1], vocab_size, gamma)
        if tokens[i] in green_set:
            green_count += 1
    # z-score 检验
    n = len(tokens) - 1
    z = (green_count - gamma * n) / np.sqrt(gamma * (1-gamma) * n)
    return z > 4.0  # z > 4 → AI 生成（p < 0.00003）` },
  { name: 'C2PA (内容真实性)', icon: '🔐', category: '元数据标准',
    desc: 'Coalition for Content Provenance and Authenticity — Adobe/Microsoft/BBC 联合推动的内容溯源开放标准',
    how: '在文件元数据中嵌入加密签名的溯源链（谁用什么工具在什么时间创建/修改了内容）',
    detect: '验证数字签名链，展示完整的内容编辑历史',
    pros: ['开放标准，跨平台互操作', '不影响内容质量', '支持图片/视频/音频/文档', 'Chrome/Edge 已原生支持'],
    cons: ['元数据可被剥离', '需要整个生态链支持', '不适用于纯文本'],
    code: `# C2PA 内容溯源 — 实战代码
from c2pa import Builder, SigningAlgorithm
import json

# 创建 C2PA Manifest
builder = Builder({
    "claim_generator": "MyAIApp/1.0",
    "title": "AI Generated Image",
    "assertions": [
        {
            "label": "c2pa.actions",
            "data": {
                "actions": [{
                    "action": "c2pa.created",
                    "digitalSourceType": 
                        "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
                    "softwareAgent": "DALL-E 3 via OpenAI API",
                    "when": "2025-03-15T10:30:00Z"
                }]
            }
        },
        {
            "label": "c2pa.hash.data",
            "data": {"exclusions": [], "name": "jumbf manifest"}
        }
    ]
})

# 签名并嵌入到图片
builder.sign_file(
    input_path="generated_image.png",
    output_path="signed_image.png",
    signing_algorithm=SigningAlgorithm.ES256,
    private_key=load_key("private.pem"),
    certificate_chain=load_cert("cert_chain.pem")
)

# 验证
from c2pa import Reader
reader = Reader("signed_image.png")
print(reader.get_manifest_store())
# → 完整的溯源链：创建者、工具、时间、编辑历史` },
  { name: 'AI 内容检测器', icon: '🔍', category: '后验检测',
    desc: '基于统计特征或训练分类器，判断文本/图片是否由 AI 生成',
    how: '分析困惑度(Perplexity)分布、token 概率曲线、特征空间异常等统计信号',
    detect: '输入待检测文本，输出 AI 生成概率分数',
    pros: ['不需要预先嵌入水印', '可检测任何模型的输出', '已有商业产品（GPTZero, Originality.ai）'],
    cons: ['准确率不高（~85-90%）', '短文本/混合文本更难', '人类故意模仿 AI 风格会导致误判', '新模型出现后需要重新训练'],
    code: `# AI 内容检测 — 基于困惑度的方法
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def detect_ai_text(text, model_name="gpt2"):
    """基于困惑度的 AI 文本检测"""
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs, labels=inputs["input_ids"])
    
    perplexity = torch.exp(outputs.loss).item()
    
    # AI 生成的文本通常困惑度更低（更"可预测"）
    # 人类写的文本困惑度更高（更"意外"）
    if perplexity < 30:
        return {"verdict": "可能 AI 生成", "confidence": 0.8}
    elif perplexity < 60:
        return {"verdict": "不确定", "confidence": 0.5}
    else:
        return {"verdict": "可能人类写作", "confidence": 0.7}

# ⚠️ 注意：单一指标不可靠
# 生产环境应组合多个信号:
# 1. 困惑度分布
# 2. Token 概率曲线的"平坦度"
# 3. 句法多样性
# 4. 词汇丰富度 (TTR)
# 5. 风格特征（对比已知 AI 输出样本）` },
  { name: 'SynthID (Google)', icon: '🌊', category: '嵌入式水印',
    desc: 'Google DeepMind 的 AI 水印技术，支持文本/图片/音频/视频四种模态',
    how: '文本：Tournament Sampling 方法修改采样分布；图片：在潜空间注入不可见水印',
    detect: 'Google 提供验证 API，第三方无法检测（设计如此）',
    pros: ['Google Gemini 已全线集成', '四模态统一', '对质量影响最小', '开源了文本水印部分'],
    cons: ['目前仅 Google 生态系统可用', '图片/视频水印未开源', '依赖 Google 验证服务'],
    code: `# SynthID Text — Google 开源实现
# pip install synthid-text

from synthid_text import SynthIDTextWatermarkingConfig
from synthid_text import SynthIDTextWatermarkLogitsProcessor

# 配置水印参数
config = SynthIDTextWatermarkingConfig(
    ngram_len=5,           # n-gram 上下文长度
    keys=[42, 123, 456],   # 秘密水印密钥
    sampling_table_size=2**16,
    sampling_table_seed=0,
    context_history_size=1024,
)

# 创建 Logits Processor
watermark_processor = SynthIDTextWatermarkLogitsProcessor(
    config=config,
    device="cuda",
)

# 集成到 HuggingFace generate()
outputs = model.generate(
    input_ids,
    logits_processor=[watermark_processor],
    max_new_tokens=256,
    do_sample=True,
    temperature=0.7,
)

# 检测水印
from synthid_text import SynthIDTextWatermarkDetector
detector = SynthIDTextWatermarkDetector(config)
score = detector.detect(outputs)
# score > threshold → AI 生成` },
];

export default function LessonWatermark() {
  const [methodIdx, setMethodIdx] = useState(0);

  const m = WATERMARK_METHODS[methodIdx];

  return (
    <div className="lesson-safety">
      <div className="sf-badge blue">🛡️ module_07 — AI 水印与溯源</div>

      <div className="sf-hero">
        <h1>AI 水印与溯源：标记、检测、追踪 AI 生成内容</h1>
        <p>
          当 AI 生成的文本、图片、视频与人类创作越来越难以区分，
          <strong>"这是 AI 生成的吗？"</strong>成为信任的核心问题。
          本模块覆盖四种主流水印/检测技术——KGW 文本水印、C2PA 溯源标准、
          AI 内容检测器、Google SynthID。
        </p>
      </div>

      {/* ─── 方法选择器 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🔬 四种水印/检测技术</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {WATERMARK_METHODS.map((w, i) => (
            <button key={i} className={`sf-btn ${i === methodIdx ? 'primary' : 'blue'}`}
              onClick={() => setMethodIdx(i)} style={{ fontSize: '0.78rem' }}>
              {w.icon} {w.name.split(' (')[0]}
            </button>
          ))}
        </div>

        <div className="sf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.05rem' }}>{m.icon} {m.name}</h3>
            <span className="sf-tag blue">{m.category}</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.7 }}>{m.desc}</p>

          <div className="sf-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="sf-alert info" style={{ margin: 0 }}>
              <strong>🔧 原理：</strong>{m.how}
            </div>
            <div className="sf-alert success" style={{ margin: 0 }}>
              <strong>🔍 检测：</strong>{m.detect}
            </div>
          </div>

          <div className="sf-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#34d399', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>✅ 优势</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {m.pros.map((p, i) => <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.82rem' }}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>⚠️ 局限</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {m.cons.map((c, i) => <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.82rem' }}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="sf-code-wrap">
            <div className="sf-code-head">
              <span className="sf-code-dot" style={{ background: '#ef4444' }} />
              <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
              <span className="sf-code-dot" style={{ background: '#10b981' }} />
              🐍 watermark_impl.py
            </div>
            <pre className="sf-code">{m.code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 技术对比 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">📊 水印技术对比</h2>
        <div className="sf-card">
          <table className="sf-table">
            <thead>
              <tr><th>维度</th><th>KGW 文本水印</th><th>C2PA</th><th>AI 检测器</th><th>SynthID</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style={{ color: '#e2e8f0' }}>模态</strong></td>
                <td style={{ color: '#94a3b8' }}>文本</td>
                <td style={{ color: '#94a3b8' }}>图/视频/音频</td>
                <td style={{ color: '#94a3b8' }}>文本/图片</td>
                <td style={{ color: '#94a3b8' }}>文/图/音/视</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#e2e8f0' }}>需预嵌入</strong></td>
                <td><span className="sf-tag amber">是</span></td>
                <td><span className="sf-tag amber">是</span></td>
                <td><span className="sf-tag green">否</span></td>
                <td><span className="sf-tag amber">是</span></td>
              </tr>
              <tr>
                <td><strong style={{ color: '#e2e8f0' }}>鲁棒性</strong></td>
                <td style={{ color: '#94a3b8' }}>中（释义可移除）</td>
                <td style={{ color: '#94a3b8' }}>低（元数据可剥离）</td>
                <td style={{ color: '#94a3b8' }}>中（新模型需重训）</td>
                <td style={{ color: '#94a3b8' }}>高</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#e2e8f0' }}>开放性</strong></td>
                <td><span className="sf-tag green">开源</span></td>
                <td><span className="sf-tag green">开放标准</span></td>
                <td><span className="sf-tag blue">商业+开源</span></td>
                <td><span className="sf-tag amber">部分开源</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="sf-nav">
        <button className="sf-btn">← AI 法规合规</button>
        <button className="sf-btn amber">安全实战 →</button>
      </div>
    </div>
  );
}
