import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Zap, Database, DollarSign } from 'lucide-react';
import './LessonCommon.css';

// AI Gateway Cost Calculator state
const MODELS = [
  { id: 'gpt4o', name: 'GPT-4o', costPer1k: 0.005 },
  { id: 'claude', name: 'Claude Sonnet', costPer1k: 0.003 },
  { id: 'gemini', name: 'Gemini 1.5 Pro', costPer1k: 0.00125 },
];

const WORKER_AI_EXAMPLES = [
  {
    label: '📝 文本生成 (Llama 3)',
    desc: '在离用户最近的边缘节点运行 Llama 3，无需 GPU 云主机，按调用计费',
    code: `// Workers AI - 文本生成
export default {
  async fetch(request, env) {
    const { prompt } = await request.json();

    const response = await env.AI.run(
      '@cf/meta/llama-3-8b-instruct',
      {
        messages: [
          { role: 'system', content: '你是一个专业的客服助理。' },
          { role: 'user', content: prompt }
        ]
      }
    );

    return Response.json(response);
  }
};`,
  },
  {
    label: '🖼️ 图片生成 (SDXL)',
    desc: '在边缘节点运行 Stable Diffusion XL 生成图片，结果存入 R2',
    code: `// Workers AI - 图片生成
export default {
  async fetch(request, env) {
    const { prompt } = await request.json();

    // 在边缘运行 SDXL 生成图片
    const image = await env.AI.run(
      '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      { prompt }  // 返回 ArrayBuffer（PNG 格式）
    );

    // 存入 R2，返回永久 URL
    await env.R2.put(\`images/\${Date.now()}.png\`, image);

    return new Response(image, {
      headers: { 'Content-Type': 'image/png' }
    });
  }
};`,
  },
  {
    label: '🎙️ 语音转文字 (Whisper)',
    desc: '在边缘节点处理音频文件，转录为文字，延迟仅为中心化方案的 1/5',
    code: `// Workers AI - 语音识别 (Whisper)
export default {
  async fetch(request, env) {
    // 从 FormData 获取音频文件
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const audioBytes = await audioFile.arrayBuffer();

    // 调用 Whisper 模型转录
    const transcription = await env.AI.run(
      '@cf/openai/whisper',
      { audio: [...new Uint8Array(audioBytes)] }
    );

    return Response.json({
      text: transcription.text,
      language: transcription.language
    });
  }
};`,
  },
];

export default function LessonAI() {
  const navigate = useNavigate();
  const [dailyRequests, setDailyRequests] = useState(10000);
  const [cacheHitRate, setCacheHitRate] = useState(40);
  const [selectedModel, setSelectedModel] = useState('gpt4o');
  const [avgTokens, setAvgTokens] = useState(500);
  const [activeExample, setActiveExample] = useState(0);

  const model = MODELS.find(m => m.id === selectedModel);
  const dailyCost = (dailyRequests * avgTokens / 1000) * model.costPer1k;
  const savedRequests = dailyRequests * (cacheHitRate / 100);
  const savedCost = (savedRequests * avgTokens / 1000) * model.costPer1k;
  const afterCost = dailyCost - savedCost;

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
          🤖 模块八：Cloudflare AI 产品线
        </div>
        <h1>把 AI 推进到离用户最近的地方</h1>
        <p className="lesson-intro">
          Cloudflare 不仅是 CDN，它正在成为全球最大的 AI 推理基础设施之一。AI Gateway 连接所有主流 LLM 服务，Workers AI 让模型直接在边缘节点运行，Vectorize 提供全球分布式向量存储。
        </p>
      </header>

      {/* AI Gateway */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">🔀 AI Gateway — LLM 请求的"边缘反向代理"</h3>
        <p className="text-gray-400 text-sm mb-5">
          传统架构：你的应用 → 直接调用 OpenAI API（昂贵、不可审计、无法缓存）<br/>
          AI Gateway 架构：你的应用 → <strong className="text-violet-400">AI Gateway（一个端点管所有模型）</strong> → 任意 LLM 服务
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-3">
            {[
              { icon: '💾', title: 'Prompt 语义缓存', desc: '相同或高度相似的 Prompt 直接返回缓存结果，不消耗 Token。实测可节省 40-70% AI API 费用。' },
              { icon: '📊', title: '全量日志审计', desc: '每一条 AI 请求/响应都被记录，满足企业合规与内容审计要求，可推送到 Logpush。' },
              { icon: '🔁', title: 'Provider Fallback', desc: 'OpenAI 报错/限速时自动切换到 Anthropic 或 Gemini，应用层零感知，SLA 不中断。' },
              { icon: '🚦', title: '速率限制与访问控制', desc: '按用户、Team、API Key 维度限速，防止 AI 接口被内部滥用爆光额度。' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Calculator */}
          <div className="bg-black/40 border border-violet-500/30 rounded-xl p-5">
            <h4 className="font-bold text-violet-300 mb-4 flex items-center gap-2"><DollarSign size={18}/> AI 成本节省计算器</h4>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">每日请求量：<strong className="text-white">{dailyRequests.toLocaleString()}</strong></label>
                <input type="range" min="1000" max="100000" step="1000" value={dailyRequests}
                  onChange={e => setDailyRequests(Number(e.target.value))}
                  className="w-full accent-violet-500"/>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">缓存命中率：<strong className="text-white">{cacheHitRate}%</strong></label>
                <input type="range" min="0" max="80" step="5" value={cacheHitRate}
                  onChange={e => setCacheHitRate(Number(e.target.value))}
                  className="w-full accent-violet-500"/>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">使用模型</label>
                <div className="flex gap-2 flex-wrap">
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => setSelectedModel(m.id)}
                      className={`px-2 py-1 rounded text-xs border transition-all ${selectedModel === m.id ? 'border-violet-500 bg-violet-900/30 text-violet-200' : 'border-gray-700 text-gray-400'}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">直连 API 每日成本</p>
                <p className="text-2xl font-black text-red-400">${dailyCost.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">接入 AI Gateway 后</p>
                <p className="text-2xl font-black text-emerald-400">${afterCost.toFixed(2)}</p>
                <p className="text-xs text-emerald-300">节省 ${savedCost.toFixed(2)}/天</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code snippet */}
        <div className="bg-black/60 border border-violet-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">接入 AI Gateway 仅需修改 API BaseURL（兼容所有 SDK）：</p>
          <pre className="text-xs text-green-300 font-mono">
{`// 原来（直连 OpenAI）
const client = new OpenAI({ baseURL: 'https://api.openai.com/v1' });

// 接入 AI Gateway（一行修改，所有功能生效）
const client = new OpenAI({
  baseURL: 'https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/openai'
});`}
          </pre>
        </div>
      </section>

      {/* Workers AI */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-2">⚡ Workers AI — 在边缘节点跑 GPU 推理</h3>
        <p className="text-gray-400 text-sm mb-5">
          不需要租 A100/H100，不需要搭 vLLM，不需要运维。Cloudflare 的 GPU 网络遍布全球，在 Worker 代码里直接 <code className="bg-gray-800 text-violet-300 px-1 rounded">env.AI.run()</code> 即可调用主流开源模型，距离用户最近的 GPU 节点处理请求。
        </p>

        <div className="flex gap-2 flex-wrap mb-4">
          {WORKER_AI_EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setActiveExample(i)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${activeExample === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {ex.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-300 mb-3">{WORKER_AI_EXAMPLES[activeExample].desc}</p>
        <pre className="bg-black/70 border border-gray-700 rounded-xl p-4 text-xs text-green-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
          {WORKER_AI_EXAMPLES[activeExample].code}
        </pre>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="text-gray-500">支持的开源模型：</span>
          {['Llama 3.3 70B', 'Mistral 7B', 'Gemma 3', 'Whisper Large v3', 'SDXL', 'BGE Embeddings'].map(m => (
            <span key={m} className="bg-violet-900/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">{m}</span>
          ))}
        </div>
      </section>

      {/* Vectorize + RAG */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">🗃️ Vectorize + AutoRAG — 零基础搭企业知识库</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-violet-300 font-bold mb-3">RAG 完整架构（全在 Cloudflare 体系内）</h4>
            <div className="space-y-2">
              {[
                { icon: '📄', step: '文档入库', desc: '企业文档（PDF/Word）上传到 R2 存储', color: 'blue' },
                { icon: '🔢', step: 'Embedding 向量化', desc: 'Workers AI (BGE 模型) 将文档切片转为向量', color: 'purple' },
                { icon: '🗄️', step: '向量存入 Vectorize', desc: '全球分布式向量数据库，亚毫秒级检索', color: 'orange' },
                { icon: '❓', step: '用户提问', desc: '问题也经 Embedding 转为向量，在 Vectorize 搜相似片段', color: 'emerald' },
                { icon: '🤖', step: 'LLM 生成答案', desc: '将检索到的上下文 + 问题送入 Llama/GPT，生成精准答案', color: 'pink' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-black/30 p-3 rounded-lg">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-gray-300">{`步骤 ${i+1}: ${item.step}`}</span>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-violet-300 font-bold mb-3">AutoRAG：无代码一键激活知识库</h4>
            <div className="bg-black/40 border border-violet-500/30 rounded-xl p-5 h-full">
              <p className="text-sm text-gray-300 mb-4">Cloudflare 2025 年推出的"一键知识库"，省去所有 Embedding 管道的搭建工作：</p>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  将 PDF / .txt 文档上传到 R2 bucket
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  在 AI → AutoRAG 面板绑定该 bucket，选择模型
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  Cloudflare 自动完成切片 + Embedding + 存入 Vectorize
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  获得一个 REST API 端点，直接接受自然语言问题，返回基于文档的精准答案
                </li>
              </ol>
              <p className="text-xs text-emerald-400 mt-4 p-2 bg-emerald-900/20 rounded border border-emerald-500/20">
                💡 企业内训场景：把所有 SOP 文档、产品手册上传 → 5 分钟搭建智能客服知识库，无需写一行代码。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/ha')}>
          AI 体系已握！进入高可用架构篇（负载均衡 + 排队等候室）
        </button>
      </section>
    </div>
  );
}
