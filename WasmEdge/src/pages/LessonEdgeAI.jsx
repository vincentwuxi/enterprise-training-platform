import './LessonCommon.css';

const CODE = `// ━━━━ Edge AI：在边缘运行 AI 模型 ━━━━

// ━━━━ 1. ONNX Runtime Web（浏览器端推理）━━━━
// ONNX = 通用模型格式（PyTorch/TF → ONNX → 浏览器）
import * as ort from 'onnxruntime-web';

// 加载模型
const session = await ort.InferenceSession.create('./model.onnx', {
  executionProviders: ['webgpu', 'wasm'],  // 优先 WebGPU，fallback Wasm
});

// 推理
const inputTensor = new ort.Tensor('float32', imageData, [1, 3, 224, 224]);
const results = await session.run({ input: inputTensor });
const predictions = results.output.data;  // Float32Array

// 典型用途：
// - 图像分类（MobileNet：~5MB，浏览器实时）
// - 目标检测（YOLOv8 Nano：~6MB）
// - 文本嵌入（all-MiniLM-L6：~90MB）
// - 文本分类/情感分析

// ━━━━ 2. Transformers.js（HuggingFace 浏览器端）━━━━
import { pipeline } from '@xenova/transformers';

// 情感分析（完全在浏览器运行，无需服务器）
const classifier = await pipeline('sentiment-analysis');
const result = await classifier('I love WebAssembly!');
// [{ label: 'POSITIVE', score: 0.9998 }]

// 文本嵌入（RAG 的向量化在客户端完成）
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const embedding = await embedder('Hello world', { pooling: 'mean', normalize: true });
// Float32Array(384) [0.023, -0.045, ...]

// 图像描述
const captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
const caption = await captioner('./photo.jpg');
// [{ generated_text: 'a cat sitting on a couch' }]

// ━━━━ 3. llama.cpp Wasm（大模型在浏览器运行）━━━━
// llama.cpp → Emscripten → Wasm
// 支持 GGUF 量化模型

// 在浏览器中运行 Llama 3.2 1B（Q4_K_M ~700MB）
// 开源项目：llama-cpp-wasm
// 性能：~5 tokens/s（M1 Mac Safari）
// 限制：大模型需要大量内存，体验受限

// ━━━━ 4. Cloudflare Workers AI（API 级 Edge AI）━━━━
// Workers 内直接调用 AI 模型（GPU 推理，按次付费）
export default {
  async fetch(request, env) {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Explain Edge AI in 2 sentences.' },
      ],
    });
    return Response.json(response);
  }
};

// 支持的模型（2025）：
// LLM：Llama 3.1, Mistral, Gemma
// 嵌入：bge-base-en-v1.5, bge-large-en-v1.5
// 图像：Stable Diffusion XL
// 语音：Whisper
// 翻译：m2m100

// ━━━━ 5. Edge AI vs Cloud AI 成本对比 ━━━━
// ┌──────────────────┬────────────┬────────────┬───────────┐
// │ 方案             │ 延迟       │ 隐私       │ 成本      │
// ├──────────────────┼────────────┼────────────┼───────────┤
// │ 浏览器 Wasm 推理 │ ~50ms      │ 最高(本地) │ 零（免费）│
// │ CF Workers AI    │ ~100ms     │ 高(边缘)   │ 低        │
// │ 云端 API(GPT-4o) │ ~500ms     │ 低         │ 中-高     │
// │ 自建 GPU 推理    │ ~200ms     │ 最高       │ 高        │
// └──────────────────┴────────────┴────────────┴───────────┘`;

export default function LessonEdgeAI() {
  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 07 · EDGE AI</div>
        <h1>Edge AI</h1>
        <p>AI 不必在远方的 GPU 集群上运行——<strong>ONNX Runtime Web 在浏览器做图像分类只需 50ms、Transformers.js 让 HuggingFace 模型在客户端运行、CF Workers AI 在边缘节点直接调用 Llama 3</strong>。Edge AI 是"零延迟 + 零成本 + 数据不出端"的终极方案。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">🤖 Edge AI 全栈</div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>edge-ai.ts</span>
          </div>
          <div className="we-code">{CODE}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">🎯 Edge AI 典型用例</div>
        <div className="we-grid-3">
          {[
            { name: '浏览器端推理', models: 'MobileNet / YOLOv8 Nano / MiniLM', use: '图像分类、目标检测、搜索向量化', privacy: '数据不离开设备', color: '#06b6d4' },
            { name: '边缘 API', models: 'Llama 3 / Whisper / SD XL', use: 'Chat、语音转文字、图像生成', privacy: '数据不离开边缘节点', color: '#d946ef' },
            { name: '混合架构', models: '小模型本地 + 大模型云端', use: '本地做初筛 → 复杂任务发云端', privacy: '最优延迟-成本平衡', color: '#38bdf8' },
          ].map((u, i) => (
            <div key={i} className="we-card" style={{ borderTop: `3px solid ${u.color}` }}>
              <div style={{ fontWeight: 700, color: u.color, fontSize: '0.88rem', marginBottom: '0.4rem' }}>{u.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--we-muted)', marginBottom: '0.2rem' }}>🧠 {u.models}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--we-muted)', marginBottom: '0.2rem' }}>🎯 {u.use}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--we-green)' }}>🔒 {u.privacy}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
