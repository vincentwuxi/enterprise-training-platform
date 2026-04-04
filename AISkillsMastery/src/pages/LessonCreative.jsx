import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Music, Video, Wand2, Copy, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const IMG_STYLES = ['写实摄影', '油画风格', '水彩插画', '赛博朋克', '吉卜力动画', '极简主义', '波普艺术', '中国水墨'];
const IMG_SUBJECTS = ['商务女性在咖啡馆工作', '未来城市夜景', '宇宙中的一只猫', '大自然中的机器人', '樱花树下的古代武士'];
const IMG_MOODS = ['充满能量', '宁静祥和', '神秘感', '温馨治愈', '史诗壮阔'];
const IMG_LIGHTINGS = ['自然光', '黄金时刻', '霓虹灯光', '戏剧性侧光', '电影感打光'];

const MODAL_TOOLS = [
  {
    category: '🎨 AI 图像生成',
    tools: [
      { name: 'Midjourney', desc: '行业最高质量，Discord 社区操作，商用授权完善。最适合艺术创作和品牌物料。', tier: '付费', color: 'violet' },
      { name: 'DALL-E 3', desc: '集成在 ChatGPT 内，对中文 Prompt 支持好，能精确理解文字生成文字入画。', tier: '订阅', color: 'blue' },
      { name: 'Stable Diffusion', desc: '开源免费，本地运行，可精确控制构图（ControlNet），适合有技术背景的创作者。', tier: '免费', color: 'emerald' },
      { name: '即梦/可灵', desc: '字节/快手出品，对中文语境理解好，适合国内商业场景和国风风格。', tier: '免费+', color: 'orange' },
    ]
  },
  {
    category: '🎬 AI 视频生成',
    tools: [
      { name: 'Sora (OpenAI)', desc: '最强视频生成，最长 20 秒，物理规律模拟准确。目前仍在限量访问中。', tier: '付费', color: 'violet' },
      { name: 'Runway Gen-3', desc: '商业最成熟，支持文生视频/图生视频，适合广告和内容创作。', tier: '付费', color: 'blue' },
      { name: '可灵 AI', desc: '快手出品，支持最长 3 分钟视频生成，中文场景表现优秀，免费额度充足。', tier: '免费+', color: 'emerald' },
    ]
  },
  {
    category: '🎵 AI 音乐/音频',
    tools: [
      { name: 'Suno AI', desc: '描述音乐风格和歌词，一键生成完整歌曲（含人声），作品质量媲美专业制作。', tier: '免费+', color: 'violet' },
      { name: 'ElevenLabs', desc: '最真实的 AI 语音克隆，可复制任何人的声音特征，适合播客、广告旁白配音。', tier: '付费', color: 'orange' },
      { name: 'Whisper', desc: 'OpenAI 开源语音转文字，准确率 95%+，支持 99 种语言，可本地部署。', tier: '免费', color: 'emerald' },
    ]
  }
];

export default function LessonCreative() {
  const navigate = useNavigate();
  const [style, setStyle] = useState('');
  const [subject, setSubject] = useState('');
  const [mood, setMood] = useState('');
  const [lighting, setLighting] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const generatePrompt = () => {
    if (!subject) return;
    const parts = [
      subject,
      style ? `${style}风格` : '',
      mood ? `${mood}的氛围` : '',
      lighting ? `${lighting}打光` : '',
      '高质量，细节丰富，8k分辨率',
    ].filter(Boolean);

    const enParts = {
      '写实摄影': 'photorealistic, DSLR photography', '油画风格': 'oil painting, impressionist',
      '水彩插画': 'watercolor illustration, soft', '赛博朋克': 'cyberpunk, neon, futuristic',
      '吉卜力动画': 'Studio Ghibli style, anime', '极简主义': 'minimalist, clean',
      '波普艺术': 'pop art, bold colors', '中国水墨': 'Chinese ink wash painting',
      '充满能量': 'energetic, vibrant', '宁静祥和': 'serene, peaceful', '神秘感': 'mysterious, dramatic',
      '温馨治愈': 'warm, cozy, healing', '史诗壮阔': 'epic, grand scale',
      '自然光': 'natural lighting', '黄金时刻': 'golden hour lighting',
      '霓虹灯光': 'neon lighting', '戏剧性侧光': 'dramatic side lighting', '电影感打光': 'cinematic lighting',
    };

    const cnPrompt = parts.join('，');
    const enPrompt = [
      subject,
      enParts[style] || '',
      enParts[mood] || '',
      enParts[lighting] || '',
      'masterpiece, best quality, ultra detailed, 8k',
    ].filter(Boolean).join(', ');

    setGeneratedPrompt(`【中文（适合国内AI工具）】\n${cnPrompt}\n\n【英文（适合 Midjourney/DALL-E）】\n${enPrompt}`);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🎨 模块七：AI 多模态创作</div>
        <h1>文图声视全制霸：多模态 AI 创作实战</h1>
        <p className="lesson-intro">
          AI 创作已经不只是文字。<strong style={{color:'#a78bfa'}}>一句话生成图片、一段描述变成视频、一行歌词产出完整音乐。</strong>掌握多模态 AI，让创意不再受制作能力限制。
        </p>
      </header>

      {/* Image Prompt Generator */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">🎨 AI 图像 Prompt 生成器</h3>
        <p className="text-gray-400 text-sm mb-6">组合 4 个维度，生成可直接使用的中英双语图像 Prompt：</p>
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="text-xs font-bold text-purple-300 block mb-2">🖼️ 主体内容（必填）</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {IMG_SUBJECTS.map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className={`px-2 py-1 rounded text-xs border transition-all ${subject === s ? 'border-violet-400 bg-violet-900/40 text-violet-200' : 'border-gray-700 text-gray-400 bg-black/20'}`}>{s}</button>
              ))}
            </div>
            <input className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-lg p-2 focus:outline-none focus:border-violet-500 placeholder-gray-600"
              placeholder="或者自己输入..." value={IMG_SUBJECTS.includes(subject) ? '' : subject} onChange={e => setSubject(e.target.value)}/>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1.5">🎭 艺术风格</label>
              <div className="flex flex-wrap gap-1">
                {IMG_STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(style === s ? '' : s)}
                    className={`px-2 py-0.5 rounded text-xs border transition-all ${style === s ? 'border-blue-400 bg-blue-900/40 text-blue-200' : 'border-gray-700 text-gray-500 bg-black/20'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-emerald-300 block mb-1.5">🌈 情绪氛围</label>
              <div className="flex flex-wrap gap-1">
                {IMG_MOODS.map(s => (
                  <button key={s} onClick={() => setMood(mood === s ? '' : s)}
                    className={`px-2 py-0.5 rounded text-xs border transition-all ${mood === s ? 'border-emerald-400 bg-emerald-900/40 text-emerald-200' : 'border-gray-700 text-gray-500 bg-black/20'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1.5">💡 打光方式</label>
              <div className="flex flex-wrap gap-1">
                {IMG_LIGHTINGS.map(s => (
                  <button key={s} onClick={() => setLighting(lighting === s ? '' : s)}
                    className={`px-2 py-0.5 rounded text-xs border transition-all ${lighting === s ? 'border-orange-400 bg-orange-900/40 text-orange-200' : 'border-gray-700 text-gray-500 bg-black/20'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button onClick={generatePrompt} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-full text-sm font-bold text-white transition-all">
          <Wand2 size={15}/> 生成 Prompt
        </button>
        {generatedPrompt && (
          <div className="mt-4 relative">
            <pre className="bg-black/60 border border-violet-500/30 text-sm text-gray-200 p-4 rounded-xl whitespace-pre-wrap leading-relaxed font-mono">{generatedPrompt}</pre>
            <button onClick={copyPrompt} className="absolute top-3 right-3 text-xs bg-violet-900/60 text-violet-300 px-2 py-1 rounded flex items-center gap-1">
              {copied ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
            </button>
          </div>
        )}
      </section>

      {/* Multimodal Tools */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🛠️ 多模态 AI 工具全景</h3>
        <div className="flex gap-2 flex-wrap mb-5">
          {MODAL_TOOLS.map((cat, i) => (
            <button key={i} onClick={() => setActiveCategory(i)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${activeCategory === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {cat.category}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {MODAL_TOOLS[activeCategory].tools.map((tool, i) => {
            const colors = { violet: {b:'#7c3aed40', bg:'rgba(124,58,237,0.1)', t:'#a78bfa'}, blue: {b:'#2563eb40', bg:'rgba(37,99,235,0.1)', t:'#93c5fd'}, emerald: {b:'#05966940', bg:'rgba(5,150,105,0.1)', t:'#6ee7b7'}, orange: {b:'#d9770640', bg:'rgba(217,119,6,0.1)', t:'#fcd34d'} };
            const c = colors[tool.color];
            return (
              <div key={i} className="p-4 rounded-xl border" style={{borderColor: c.b, background: c.bg}}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{tool.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded border font-bold" style={{borderColor: c.b, color: c.t}}>{tool.tier}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creative Tips */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">✨ 进阶图像 Prompt 技巧</h3>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          {[
            { tip: '参考艺术家风格', eg: 'in the style of Monet, Van Gogh, 宫崎骏', note: '指定知名艺术家能大幅锁定风格基调' },
            { tip: '指定摄影参数', eg: 'shot on Canon 5D, 85mm lens, f/1.8, bokeh', note: '模拟真实摄影的技术参数，让图像更真实' },
            { tip: '用负向 Prompt 排除', eg: '(Midjourney --no ugly, blurry, watermark)', note: '告诉 AI 不要什么，往往比说要什么更有效' },
          ].map((item, i) => (
            <div key={i} className="bg-black/30 p-3 rounded-lg border border-white/5">
              <h4 className="font-bold text-violet-300 mb-1">{item.tip}</h4>
              <code className="text-emerald-300 block mb-1">{item.eg}</code>
              <p className="text-gray-500">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/build')}>
          创作满级！终极篇：构建你的专属 AI →
        </button>
      </section>
    </div>
  );
}
