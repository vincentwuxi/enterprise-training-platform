import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Database } from 'lucide-react';
import './LessonCommon.css';

const WORKER_EXAMPLES = [
  {
    label: '🌏 IP 地理位置重定向',
    desc: '根据访客国家，把用户重定向到对应的本地化页面——零后端修改，纯边缘处理',
    code: `export default {
  async fetch(request) {
    const country = request.cf.country;
    if (country === 'JP') {
      return Response.redirect('https://example.com/ja', 302);
    }
    if (country === 'DE') {
      return Response.redirect('https://example.com/de', 302);
    }
    return fetch(request); // 其他地区正常回源
  }
};`,
  },
  {
    label: '🔒 边缘注入安全响应头',
    desc: '在所有响应上自动添加安全头（HSTS / CSP / XFO），无需修改后端代码',
    code: `export default {
  async fetch(request) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);

    // 注入安全响应头
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000');
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('Content-Security-Policy', "default-src 'self'");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }
};`,
  },
  {
    label: '🎯 边缘 A/B 测试',
    desc: '在边缘节点按比例随机分流用户到不同版本，不依赖后端逻辑，延迟极低',
    code: `export default {
  async fetch(request) {
    // 随机分流：30% 用户路由到新版本
    const isNewVersion = Math.random() < 0.3;
    const targetUrl = isNewVersion
      ? 'https://example.com/v2' + new URL(request.url).pathname
      : request.url;

    return fetch(targetUrl, request);
  }
};`,
  },
];

const STORAGE_QUIZ = [
  { q: '需要强一致性，多人实时协作（WebSocket）？', ans: 'Durable Objects', color: 'emerald' },
  { q: '上传视频/图片等大文件，不想交流量费？', ans: 'R2 Storage', color: 'pink' },
  { q: '全局配置下发，读非常多，写非常少？', ans: 'Workers KV', color: 'blue' },
  { q: '用户数据的 CRUD，需要 SQL 查询？', ans: 'D1 Database', color: 'yellow' },
];

export default function LessonEdge() {
  const navigate = useNavigate();
  const [raceState, setRaceState] = useState('idle');
  const [activeExample, setActiveExample] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState({});

  const startRace = () => {
    if (raceState === 'running') return;
    setRaceState('running');
    setTimeout(() => setRaceState('finished'), 2500);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag" style={{background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.2))', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd'}}>
            💻 模块五：边缘计算与生态
         </div>
         <h1>将代码部署到离用户几十公里的地方</h1>
         <p className="lesson-intro">
            如果说传统云服务是将数据拉回总部处理，边缘计算就是把处理逻辑推送到全球 300+ 城市的节点上。这是 Serverless 的下一次进化。
         </p>
      </header>

      {/* Race */}
      <section className="lesson-section glass-panel mt-8">
         <h3 className="mb-2 text-center">⏱️ 冷启动赛跑：V8 Isolate 碾压容器机制</h3>
         <p className="text-sm text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            传统 AWS Lambda 的冷启动：下载代码包 → 启动 Docker 容器 → 启动 Linux 进程 = 200-500ms 延迟。Cloudflare Worker 基于 V8 Isolate，进程预热常驻，真正 0ms 冷启动。
         </p>
         <div className="bg-black/40 rounded-xl p-6 border border-white/5 mb-6">
            <div className="flex justify-center mb-6">
               <button onClick={raceState === 'idle' ? startRace : () => setRaceState('idle')}
                 className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full font-bold text-white flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                 <Play size={18}/> {raceState === 'idle' ? '🔫 发令枪响：处理一个 HTTP 请求' : raceState === 'running' ? '竞速中...' : '🔄 重新比赛'}
               </button>
            </div>
            <div className="mb-5">
               <div className="flex justify-between text-xs font-bold mb-2">
                 <span className="text-gray-400">🐢 传统 Serverless (AWS Lambda)</span>
                 <span className={raceState === 'finished' ? 'text-gray-400' : 'text-gray-600'}>{raceState === 'finished' ? '约 200-500 ms 延迟' : ''}</span>
               </div>
               <div className="h-10 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                 {raceState !== 'idle' && (
                   <>
                     <div className="h-full bg-red-900/50 flex items-center justify-center text-[10px] text-red-200" style={{width: '60%', animation: 'revealBoot 1.5s linear forwards'}}>下载容器 & 启动 OS... (冷启动惩罚)</div>
                     <div className="h-full bg-blue-500/80 rounded-r" style={{position: 'absolute', top: 0, width: '40%', opacity: 0, animation: 'revealExec 0.5s linear forwards 1.5s', animationFillMode: 'both'}}></div>
                   </>
                 )}
               </div>
            </div>
            <div>
               <div className="flex justify-between text-xs font-bold mb-2">
                 <span className="text-orange-400">🚀 Cloudflare Worker (V8 Isolate)</span>
                 <span className={raceState === 'finished' ? 'text-orange-400' : 'text-gray-600'}>{raceState === 'finished' ? '0ms 启动，瞬间完成！' : ''}</span>
               </div>
               <div className="h-10 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 relative">
                 {raceState !== 'idle' && (
                   <div className="h-full bg-orange-500 rounded shadow-[0_0_15px_orange] flex items-center pl-4 text-[10px] font-bold text-white overflow-hidden" style={{width: '100%', animation: 'revealFastExec 0.3s ease-out forwards'}}>
                     ⚡ V8 引擎直接分配内存，无需启动 OS！
                   </div>
                 )}
               </div>
            </div>
            <style>{`
              @keyframes revealBoot { 0% { width: 0%; } 100% { width: 60%; } }
              @keyframes revealExec { 0% { opacity: 1; width: 0%; } 100% { opacity: 1; width: 40%; } }
              @keyframes revealFastExec { 0% { width: 0%; } 100% { width: 100%; } }
            `}</style>
         </div>
      </section>

      {/* Worker Code Examples */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-2">💡 Worker 实战代码：3 个典型应用场景</h3>
         <p className="text-gray-400 text-sm mb-5">每个 Worker 脚本都能一键部署到全球 300+ 数据中心，点击 Tab 切换场景：</p>
         <div className="flex gap-2 flex-wrap mb-5">
           {WORKER_EXAMPLES.map((ex, i) => (
             <button key={i} onClick={() => setActiveExample(i)}
               className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${activeExample === i ? 'bg-orange-900/30 border-orange-500 text-orange-200' : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
               {ex.label}
             </button>
           ))}
         </div>
         <p className="text-sm text-gray-300 mb-3">{WORKER_EXAMPLES[activeExample].desc}</p>
         <pre className="bg-black/70 border border-gray-600 rounded-xl p-4 text-xs text-green-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
           {WORKER_EXAMPLES[activeExample].code}
         </pre>
         <p className="text-xs text-gray-500 mt-2">🚀 使用 <code className="bg-gray-800 text-orange-300 px-1 rounded">wrangler deploy</code> 命令，5 秒内将此代码发布到全球所有边缘节点。</p>
      </section>

      {/* Storage Selector Quiz */}
      <section className="lesson-section mt-10">
         <h3 className="mb-4">🗄️ 我该选哪个存储？（点击场景查看推荐）</h3>
         <div className="grid md:grid-cols-2 gap-4">
           {STORAGE_QUIZ.map((item, i) => (
             <div key={i} className={`glass-panel cursor-pointer border transition-all ${quizAnswered[i] ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-white/10 hover:border-white/30'}`}
                  style={{padding: '1.2rem'}}
                  onClick={() => setQuizAnswered(prev => ({...prev, [i]: true}))}>
               <p className="text-sm text-gray-300 mb-3">{item.q}</p>
               {quizAnswered[i] ? (
                 <div className="flex items-center gap-2">
                   <span className="text-emerald-400">✅</span>
                   <span className="font-bold text-white">{item.ans}</span>
                 </div>
               ) : (
                 <p className="text-xs text-gray-500">👆 点击查看推荐方案</p>
               )}
             </div>
           ))}
         </div>
      </section>

      {/* Cloudflare Pages */}
      <section className="lesson-section glass-panel mt-10" style={{borderLeft: '4px solid #6366f1'}}>
         <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
           <Database size={18}/> Cloudflare Pages：前端项目的一键 CI/CD
         </h4>
         <p className="text-sm text-gray-300 leading-relaxed mb-3">
            把 GitHub/GitLab 仓库连上 Cloudflare Pages，每次 git push 自动触发构建 + 全球发布。支持 React、Vue、Next.js 等所有主流框架。与 Workers 深度集成，可在 Pages Functions 中混用 KV/R2/D1。
         </p>
         <div className="flex items-center gap-2 flex-wrap text-xs">
           <span className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">git push → 自动构建</span>
           <span className="text-gray-600">→</span>
           <span className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">Preview URL（每个 PR 独立）</span>
           <span className="text-gray-600">→</span>
           <span className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">合并 main → 全球发布</span>
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/sre')}>代码跑通了！如何排错？(SRE 篇)</button>
      </section>
    </div>
  );
}
