import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDrive, FileImage, FastForward, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

// Fixed state machine: INIT -> MISS -> HIT -> EXPIRED -> MISS -> HIT ...
// Separate tracking for static requests
export default function LessonPerformance() {
  const navigate = useNavigate();
  const [staticState, setStaticState] = useState('INIT'); // INIT | MISS | HIT | EXPIRED
  const [lastAction, setLastAction] = useState('');

  // Cache Rule Builder state
  const [ruleCondition, setRuleCondition] = useState('uri');
  const [ruleAction, setRuleAction] = useState('cache');

  const RULE_OUTPUT = {
    'uri-cache': { desc: '当请求路径匹配 /api/config 时，在边缘节点缓存该响应，TTL 设为 300s（即使后端动态接口）。', badge: '强制缓存动态接口' },
    'uri-bypass': { desc: '当请求路径匹配 /api/user/* 时，绕过所有缓存，每次请求都回源（适合个人化接口）。', badge: '绕过缓存直达源站' },
    'cookie-cache': { desc: '当请求不携带 session_id Cookie 时，缓存该页面（未登录游客走缓存，已登录用户走源站）。', badge: '游客走缓存，用户穿透' },
    'cookie-bypass': { desc: '当请求携带 session_id Cookie 时，强制绕过缓存，确保已登录用户获取实时个人化内容。', badge: '登录状态强制回源' },
    'country-cache': { desc: '当访客来自 CN（中国大陆）时，将其路由到亚太区边缘节点并缓存，降低跨洋延迟。', badge: '按地区节点分流' },
    'country-bypass': { desc: '当访客来自 CN 时，绕过缓存直接回源站，适用于需要实时合规检测的场景。', badge: '敏感地区直达源站' },
  };

  const simulateStatic = () => {
    setLastAction('static');
    if (staticState === 'INIT') {
      setStaticState('MISS');
    } else if (staticState === 'MISS') {
      setStaticState('HIT');
    } else if (staticState === 'HIT') {
      setStaticState('HIT'); // stays hit unless purged
    } else if (staticState === 'EXPIRED') {
      setStaticState('MISS');
    }
  };

  const simulatePurge = () => {
    setLastAction('purge');
    setStaticState('EXPIRED');
  };

  const simulateApi = () => {
    setLastAction('api');
    // API always bypasses, doesn't affect staticState
  };

  const getStatusInfo = () => {
    if (lastAction === 'api') return { status: 'BYPASS', color: 'text-blue-400', bg: 'border-blue-500', msg: '🔵 动态 API 接口不符合默认缓存规则（BYPASS），穿透边缘节点直达源站实时计算。' };
    if (lastAction === 'purge') return { status: 'EXPIRED', color: 'text-gray-400', bg: 'border-gray-500', msg: '🗑️ 已触发 Purge Cache！边缘节点副本已清除。下次任何请求都将重新回源（MISS）。' };
    if (staticState === 'MISS') return { status: 'MISS', color: 'text-yellow-400', bg: 'border-yellow-500', msg: '🟡 第一次请求该资源（MISS）。节点向源站拉取文件，完成后在边缘节点存储副本，源站产生带宽消耗。' };
    if (staticState === 'HIT') return { status: 'HIT', color: 'text-green-400', bg: 'border-green-500', msg: '🟢 边缘节点已有副本（HIT）！响应从离你最近的节点光速返回，源站零压力，流量费节省 90%+。' };
    return { status: '---', color: 'text-gray-400', bg: 'border-gray-700', msg: '等待发起请求...' };
  };

  const info = getStatusInfo();

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">⚡ 模块二：CDN 缓存与前端优化</div>
         <h1>最大化释放边缘节点的威力</h1>
         <p className="lesson-intro">
            缓存是网站提速和降低源站成本的终极武器。理解 Cloudflare 默认缓存了什么，以及如何利用 Cache Rules 实现精细化控制。
         </p>
      </header>

      <section className="lesson-section glass-panel">
         <h3 className="mb-4">📦 默认缓存行为科普</h3>
         <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-black/30 p-5 rounded-xl border border-white/10">
             <h4 className="text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2/> 默认被缓存的后缀</h4>
             <p className="text-sm text-gray-400 mb-3">只要扩展名匹配，就自动缓存在全球边缘节点：</p>
             <div className="flex flex-wrap gap-2 text-xs font-mono">
               {['.js', '.css', '.jpg/.png', '.pdf', '.woff2', '.svg', '.ico', '.wasm', '.gz'].map(s => (
                 <span key={s} className="bg-emerald-900/30 text-emerald-200 px-2 py-1 rounded">{s}</span>
               ))}
               <span className="text-gray-500 text-xs mt-1 w-full">共 50+ 种扩展名</span>
             </div>
           </div>
           <div className="bg-black/30 p-5 rounded-xl border border-white/10">
             <h4 className="text-red-400 mb-3 flex items-center gap-2"><HardDrive/> 默认不被缓存的内容</h4>
             <p className="text-sm text-gray-400 mb-3">这些内容哪怕再高频，也会每次穿透打向源站：</p>
             <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
               <li>HTML 页面（除非配置专门规则）</li>
               <li>动态 API 接口（JSON 响应）</li>
               <li>携带 <code className="bg-gray-800 px-1 text-pink-300 rounded">Authorization</code> 头的请求</li>
               <li>后端设置了 <code className="bg-gray-800 px-1 text-pink-300 rounded">Cache-Control: no-store</code> 的响应</li>
             </ul>
           </div>
         </div>
      </section>

      {/* Cache Simulator - FIXED state machine */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-2">🎯 模拟靶场：Cache Status 命中全流程</h3>
         <p className="text-gray-400 text-sm mb-6">按顺序点击按钮，体验一个静态文件从"首次回源"到"命中边缘节点"再到"缓存过期"的完整生命周期。F12 中就看这个响应头：<strong className="text-white">cf-cache-status</strong>。</p>

         <div className="bg-black/40 rounded-xl p-6 border border-white/5">
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
               <button onClick={simulateStatic} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg">📷 请求静态文件 (logo.png)</button>
               <button onClick={simulateApi} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg">🔌 请求动态 API (/api/user)</button>
               <button onClick={simulatePurge} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors ml-4">🗑️ Purge Cache (清缓存)</button>
            </div>

            <div className="flex items-center justify-around max-w-2xl mx-auto mb-6">
               <div className="text-center">
                 <div className="text-3xl mb-1">👨‍💻</div>
                 <div className="text-xs text-gray-400">访客浏览器</div>
               </div>
               <div className="flex-1 px-3"><div className="w-full h-1 bg-gray-700 rounded"></div></div>
               <div className={`text-center border-2 rounded-xl p-3 w-44 transition-all ${info.bg}`}>
                 <div className="text-2xl mb-1">☁️</div>
                 <div className="text-xs font-bold text-white mb-1">CF 边缘节点</div>
                 <div className={`text-sm font-black px-2 py-1 rounded bg-black/50 ${info.color}`}>cf-cache-status: {info.status}</div>
               </div>
               <div className={`flex-1 px-3 transition-opacity ${info.status === 'HIT' ? 'opacity-10' : 'opacity-100'}`}><div className="w-full h-1 bg-gray-700 rounded"></div></div>
               <div className={`text-center transition-all ${info.status === 'HIT' ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                 <div className="text-3xl mb-1">🏢</div>
                 <div className="text-xs text-gray-400">源站服务器</div>
               </div>
            </div>

            <div className="mt-4 text-center text-sm p-3 bg-black/30 rounded-lg text-gray-300 min-h-[50px]">
              {info.msg}
            </div>

            {/* Flow instruction */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="text-yellow-400">MISS</span> <span>→</span>
              <span className="text-green-400">HIT</span> <span>→</span>
              <span className="text-gray-400">Purge</span> <span>→</span>
              <span className="text-yellow-400">MISS</span> <span>(再次上路)</span>
            </div>
         </div>
      </section>

      {/* Cache Rules Builder */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-2">🛠️ Cache Rules 配置生成器</h3>
         <p className="text-gray-400 text-sm mb-6">选择条件组合，查看 Cache Rule 能做什么——这是突破默认缓存限制的核心利器。</p>

         <div className="bg-black/30 p-5 rounded-xl border border-white/5">
           <div className="grid md:grid-cols-2 gap-4 mb-6">
             <div>
               <p className="text-xs text-gray-400 mb-2 font-medium">When (匹配条件)</p>
               <div className="flex gap-2 flex-wrap">
                 {[['uri', 'URI 路径'], ['cookie', 'Cookie 状态'], ['country', '访客国家']].map(([val, label]) => (
                   <button key={val} onClick={() => setRuleCondition(val)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${ruleCondition === val ? 'bg-orange-900/30 border-orange-500 text-orange-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>{label}</button>
                 ))}
               </div>
             </div>
             <div>
               <p className="text-xs text-gray-400 mb-2 font-medium">Then (执行动作)</p>
               <div className="flex gap-2">
                 {[['cache', '强制缓存'], ['bypass', '绕过缓存']].map(([val, label]) => (
                   <button key={val} onClick={() => setRuleAction(val)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${ruleAction === val ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>{label}</button>
                 ))}
               </div>
             </div>
           </div>
           <div className="p-4 bg-black/40 rounded-lg border border-orange-500/30">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded font-bold">{RULE_OUTPUT[`${ruleCondition}-${ruleAction}`]?.badge}</span>
             </div>
             <p className="text-sm text-gray-200">{RULE_OUTPUT[`${ruleCondition}-${ruleAction}`]?.desc}</p>
           </div>
         </div>
      </section>

      <section className="lesson-section mt-10">
         <h3 className="mb-4">🚀 高阶提速神技</h3>
         <div className="grid md:grid-cols-2 gap-4">
           <div className="glass-panel" style={{borderLeft: '4px solid #f58220'}}>
             <h4 className="flex items-center gap-2 mb-2"><FastForward className="text-orange-400"/> Tiered Cache (分层缓存)</h4>
             <p className="text-sm text-gray-300 leading-relaxed">普通 CDN 是每个数据中心各自回源。开启 Tiered Cache 后，全球低等级节点先从"中心骨干节点"查询，最后才回源。<strong>能够恐怖地降低源站回源率到 5% 以下。</strong>一键开启，白嫖大杀器。</p>
           </div>
           <div className="glass-panel" style={{borderLeft: '4px solid #10b981'}}>
             <h4 className="flex items-center gap-2 mb-2"><FileImage className="text-green-400"/> Polish 图片自动优化</h4>
             <p className="text-sm text-gray-300 leading-relaxed">不用在代码里压图片了。开启 <strong>Cloudflare Polish</strong>，边缘节点自动将 PNG 转换为体积只有原来几分之一的 WebP/AVIF 发给支持的设备。前端性能指标 LCP 立竿见影提升。</p>
           </div>
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/security')}>CDN 玩法满级！踏入黑客绞肉机 (安全防护篇)</button>
      </section>
    </div>
  );
}
