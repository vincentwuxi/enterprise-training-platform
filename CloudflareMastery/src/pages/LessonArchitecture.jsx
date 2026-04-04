import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Globe, Shield } from 'lucide-react';
import './LessonCommon.css';

const SSL_MODES = [
  {
    id: 'off',
    name: 'Off (关闭)',
    risk: 'danger',
    riskLabel: '极危险',
    clientToCF: 'HTTP 明文',
    cfToOrigin: 'HTTP 明文',
    clientIcon: '🔓',
    originIcon: '🔓',
    desc: '全链路明文通信，所有数据（包括密码）都在网上裸奔。',
    warn: '⛔ 仅用于临时测试，任何生产环境都不应选择此模式。',
  },
  {
    id: 'flexible',
    name: 'Flexible (灵活)',
    risk: 'warning',
    riskLabel: '有坑',
    clientToCF: 'HTTPS 加密 🔒',
    cfToOrigin: 'HTTP 明文 ⚠️',
    clientIcon: '🔒',
    originIcon: '🔓',
    desc: '浏览器到 CF 节点加密，但 CF 到源站是明文。',
    warn: '💥 经典坑点：如果源站配置了"强制 HTTPS 跳转"，CF 向源站发 HTTP，源站再跳 HTTPS，CF 再发 HTTP…无限循环！ERR_TOO_MANY_REDIRECTS 就此诞生。',
  },
  {
    id: 'full',
    name: 'Full (完全)',
    risk: 'ok',
    riskLabel: '较安全',
    clientToCF: 'HTTPS 加密 🔒',
    cfToOrigin: 'HTTPS 加密（不验证证书）🔒',
    clientIcon: '🔒',
    originIcon: '🔒',
    desc: '全程加密，但 CF 不验证源站证书的有效性（自签名证书也能通过）。',
    warn: '⚠️ 如果攻击者伪造了一个假的源站并持有自签名证书，CF 也会信任。比 Flexible 安全但存在中间人攻击风险。',
  },
  {
    id: 'full-strict',
    name: 'Full (Strict) 严格',
    risk: 'best',
    riskLabel: '生产必选',
    clientToCF: 'HTTPS 加密 🔒',
    cfToOrigin: 'HTTPS + 有效 CA 证书验证 🔒✅',
    clientIcon: '🔒',
    originIcon: '🔒✅',
    desc: '全链路加密，且要求源站必须安装由可信 CA（或 Cloudflare Origin CA）签发的有效证书。',
    warn: '✅ 唯一推荐的生产环境配置。配合 Cloudflare 免费的 Origin CA 证书（十年有效期），一劳永逸。',
  },
];

const RISK_COLORS = {
  danger: { border: '#ef4444', bg: 'rgba(239,68,68,0.1)', badge: '#ef4444', text: '#fca5a5' },
  warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.1)', badge: '#f59e0b', text: '#fde68a' },
  ok: { border: '#3b82f6', bg: 'rgba(59,130,246,0.1)', badge: '#3b82f6', text: '#93c5fd' },
  best: { border: '#10b981', bg: 'rgba(16,185,129,0.1)', badge: '#10b981', text: '#6ee7b7' },
};

export default function LessonArchitecture() {
  const navigate = useNavigate();
  const [isProxied, setIsProxied] = useState(true);
  const [activeSSL, setActiveSSL] = useState('full-strict');

  const sslMode = SSL_MODES.find(m => m.id === activeSSL);
  const colors = RISK_COLORS[sslMode.risk];

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">☁️ 模块一：宏观架构与接入</div>
         <h1>从单纯 DNS 到全能边缘云</h1>
         <p className="lesson-intro">
            Cloudflare 的核心不在于"服务器"，而在于它横跨全球的 <strong>Anycast（任播）边缘网络</strong>。理解架构起手式，从点亮那朵橙色的云开始。
         </p>
      </header>

      {/* Architecture Concept */}
      <section className="lesson-section glass-panel">
         <h3>🌎 反向代理与 Anycast 魔法</h3>
         <p className="text-gray-300 mb-4">
            传统网络中，用户请求直接长途奔波找你的源站服务器（Origin Server）。而在 Cloudflare 架构中，它作为一个超级庞大的<strong className="text-orange-400">反向代理 (Reverse Proxy)</strong> 挡在源站前面。通过 Anycast 技术，全球访客无论在哪，都会被自动路由到<strong>离其物理距离最近</strong>的数据中心。
         </p>
         <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-black/30 p-4 rounded-xl border border-white/10 text-center">
               <Globe className="mx-auto mb-2 text-blue-400" size={28}/>
               <h4 className="font-bold text-white mb-1">全球访客</h4>
               <p className="text-xs text-gray-400">向域名发起请求</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-orange-500/30 text-center" style={{background: 'linear-gradient(135deg, rgba(245, 130, 32, 0.1), rgba(0,0,0,0))'}}>
               <Shield className="mx-auto mb-2 text-orange-400" size={28}/>
               <h4 className="font-bold text-white mb-1">Cloudflare 边缘节点</h4>
               <p className="text-xs text-orange-200/70">WAF / 缓存 / Worker 处理大批请求</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-white/10 text-center">
               <Server className="mx-auto mb-2 text-gray-300" size={28}/>
               <h4 className="font-bold text-white mb-1">你的源站</h4>
               <p className="text-xs text-gray-400">只处理少量动态回源请求</p>
            </div>
         </div>
      </section>

      {/* Orange Cloud Simulator */}
      <section className="lesson-section glass-panel mt-10" style={{padding: '2.5rem'}}>
         <h3 className="mb-2">☁️ 核心必考：橙色云与灰色云的本质区别</h3>
         <p className="text-gray-400 text-sm mb-6">在添加 DNS 记录时，有一个至关重要的开关：代理状态。只有 <code className="bg-gray-800 text-orange-300 px-1 rounded">A / AAAA / CNAME</code> 类型记录支持代理。MX、TXT 等记录永远是灰色云。</p>

         <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-black/40 border border-white/10">
               <div className="text-center">
                 <span className="text-xs text-gray-500 block mb-2">DNS Only（灰色）</span>
                 <button onClick={() => setIsProxied(false)} className={`w-16 h-10 rounded-full flex items-center justify-center transition-all text-xl ${!isProxied ? 'bg-gray-600 border-2 border-gray-400' : 'bg-gray-800'}`}>☁️</button>
               </div>
               <div className="text-center">
                 <span className="text-xs font-bold text-orange-400 block mb-2">Proxied（橙色）</span>
                 <button onClick={() => setIsProxied(true)} className={`w-16 h-10 rounded-full flex items-center justify-center transition-all text-xl ${isProxied ? 'bg-orange-500 border-2 border-orange-300 shadow-[0_0_15px_rgba(245,130,32,0.6)]' : 'bg-gray-800'}`}>🟠</button>
               </div>
            </div>
         </div>

         <div className="relative h-60 bg-black/20 rounded-xl overflow-hidden border border-white/5 flex items-center justify-between px-8">
            <div className="z-10 flex flex-col items-center">
               <div className="bg-blue-500/20 p-3 rounded-full border border-blue-500/50 mb-2"><Globe className="text-blue-400"/></div>
               <span className="text-xs text-gray-400">访客 (IP: 8.8.8.8)</span>
            </div>
            <div className={`z-10 flex flex-col items-center transition-all duration-500 ${isProxied ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'}`}>
               <div className={`p-4 rounded-2xl mb-2 transition-all ${isProxied ? 'bg-orange-500/20 border-2 border-orange-500 shadow-[0_0_20px_rgba(245,130,32,0.4)]' : 'bg-gray-800/50 border border-gray-600'}`}>
                  <Shield className={isProxied ? 'text-orange-400' : 'text-gray-500'} size={32}/>
               </div>
               <span className={`text-xs font-bold ${isProxied ? 'text-orange-300' : 'text-gray-500'}`}>CF 节点 (IP: 104.21.x.x)</span>
            </div>
            <div className="z-10 flex flex-col items-center">
               <div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-500/50 mb-2"><Server className="text-emerald-400"/></div>
               <span className="text-xs text-gray-400">源站 (IP: 1.2.3.4)</span>
            </div>
            {isProxied ? (
              <>
                <div className="absolute left-[8%] top-[42%] w-[36%] h-[2px] bg-gradient-to-r from-blue-500 to-orange-500 overflow-hidden">
                   <div className="w-1/2 h-full bg-white opacity-50 absolute animate-[dash_1s_linear_infinite]" style={{boxShadow: '0 0 8px white'}}></div>
                </div>
                <div className="absolute right-[12%] top-[42%] w-[33%] h-[2px] bg-gradient-to-r from-orange-500 to-emerald-500 overflow-hidden">
                   <div className="w-1/2 h-full bg-white opacity-50 absolute animate-[dash_2s_linear_infinite]" style={{boxShadow: '0 0 8px white'}}></div>
                </div>
                <div className="absolute bottom-4 w-full text-center text-sm font-bold text-orange-400">
                  <p>✅ 访客只看到 CF 节点 IP — 源站真实 IP 被隐藏，WAF 防护全面生效</p>
                </div>
              </>
            ) : (
              <>
                <div className="absolute left-[10%] top-[42%] w-[80%] h-[2px] bg-gradient-to-r from-blue-500 to-red-500 overflow-hidden">
                   <div className="w-1/3 h-full bg-red-400 opacity-80 absolute animate-[dash_0.8s_linear_infinite]" style={{boxShadow: '0 0 10px red'}}></div>
                </div>
                <div className="absolute bottom-4 w-full text-center text-sm font-bold text-red-400">
                  <p>⚠️ 访客直接获知源站真实 IP (1.2.3.4) 并发起直连 — CF 形同虚设</p>
                </div>
              </>
            )}
         </div>
      </section>

      {/* CNAME Flatten */}
      <section className="lesson-section glass-panel mt-8" style={{padding: '1.2rem', borderLeft: '4px solid #3b82f6'}}>
         <h4 className="font-bold text-blue-400 mb-2">💡 CNAME Flatten（展平）— 解决根域名的历史难题</h4>
         <p className="text-sm text-gray-300 leading-relaxed">
            DNS 标准规定：根域名（如 <code className="bg-gray-800 text-blue-300 px-1 rounded">example.com</code>，无 www 前缀）不能使用 CNAME 记录，只能用 A 记录。但许多 SaaS 平台和负载均衡服务只提供 CNAME 地址。Cloudflare 独创的 <strong>CNAME Flattening</strong> 技术会在 DNS 查询时自动递归展平，为用户解析出最终的 IP 地址，让根域名支持 CNAME 成为可能。
         </p>
      </section>

      {/* SSL 4-Mode Full Matrix */}
      <section className="lesson-section glass-panel mt-8">
         <h3 className="mb-2">🔒 SSL/TLS 加密模式完整矩阵（点击选择）</h3>
         <p className="text-gray-300 text-sm mb-6">配置域名后出现 <code className="bg-red-900/40 text-red-300 px-1 rounded">ERR_TOO_MANY_REDIRECTS</code>？95% 是这里选错了。共有 4 种模式，一次看懂：</p>

         <div className="flex flex-wrap gap-2 mb-6">
           {SSL_MODES.map(mode => {
             const c = RISK_COLORS[mode.risk];
             return (
               <button key={mode.id} onClick={() => setActiveSSL(mode.id)}
                 className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                 style={{
                   borderColor: activeSSL === mode.id ? c.border : 'rgba(255,255,255,0.1)',
                   background: activeSSL === mode.id ? c.bg : 'rgba(0,0,0,0.3)',
                   color: activeSSL === mode.id ? c.text : '#9ca3af',
                   boxShadow: activeSSL === mode.id ? `0 0 12px ${c.border}60` : 'none'
                 }}>
                 {mode.name}
               </button>
             );
           })}
         </div>

         <div className="p-5 rounded-xl transition-all" style={{background: colors.bg, border: `2px solid ${colors.border}`}}>
           <div className="flex items-center justify-between mb-4">
             <h4 className="font-bold text-white">{sslMode.name}</h4>
             <span className="text-xs px-3 py-1 rounded-full font-bold" style={{background: colors.border, color: 'white'}}>{sslMode.riskLabel}</span>
           </div>

           <div className="grid md:grid-cols-3 gap-4 mb-4 text-center text-sm">
             <div className="bg-black/30 p-3 rounded-lg">
               <p className="text-gray-400 text-xs mb-1">浏览器 → CF 节点</p>
               <p className="font-bold text-white">{sslMode.clientToCF}</p>
             </div>
             <div className="bg-black/30 p-3 rounded-lg flex items-center justify-center">
               <span className="text-2xl">→</span>
             </div>
             <div className="bg-black/30 p-3 rounded-lg">
               <p className="text-gray-400 text-xs mb-1">CF 节点 → 源站</p>
               <p className="font-bold text-white">{sslMode.cfToOrigin}</p>
             </div>
           </div>

           <p className="text-sm text-gray-300 mb-3 leading-relaxed">{sslMode.desc}</p>
           <div className="bg-black/30 p-3 rounded-lg">
             <p className="text-sm text-gray-200 leading-relaxed">{sslMode.warn}</p>
           </div>
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/performance')}>架构已通透！进军 CDN 缓存提速篇</button>
      </section>
    </div>
  );
}
