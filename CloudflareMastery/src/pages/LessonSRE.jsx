import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TerminalSquare, Search } from 'lucide-react';
import './LessonCommon.css';

// Each error code has its own fault location on the network chain
// segments: 'client' | 'edge' | 'transit' | 'origin'
const ERROR_CODES = {
  '520': {
    title: '520 Web server returned an unknown error',
    desc: '源站返回了空响应包、被强制重置 (RST) 的连接，或格式非常奇怪无法被解析的报文。',
    faultSegment: 'origin-internal',
    guilty: '源站内部处理异常',
    fix: '检查源站 Nginx/Apache 的错误日志，是否有应用崩溃、内存耗尽或进程重启导致连接断开。',
  },
  '521': {
    title: '521 Web server is down',
    desc: '最常见！Cloudflare 节点向你的源站发起 TCP 连接，但源站直接拒绝了（Connection Refused）。',
    faultSegment: 'firewall',
    guilty: '源站防火墙 / 安全组拦截了 CF 节点 IP',
    fix: '检查源站端口是否监听（80/443）。更常见的是云主机安全组把 Cloudflare 节点的 IP 段屏蔽了，需要在防火墙放行 CF 官方 IP。',
  },
  '522': {
    title: '522 Connection timed out',
    desc: 'TCP 握手包（SYN）发出去了，等待 15 秒都没有收到源站的 ACK 应答，超时放弃。',
    faultSegment: 'transit',
    guilty: '中间网络路由 / 源站高负载',
    fix: '可能是源站云主机路由配置错误屏蔽了 CF 节点的包，或者源站负载极高（CPU/内存满载），内核无法响应 TCP 握手。',
  },
  '524': {
    title: '524 A timeout occurred',
    desc: 'TCP 连接成功建立，但等待源站返回首字节（TTFB）超过了 100 秒！',
    faultSegment: 'origin-slow',
    guilty: '源站业务代码执行超时',
    fix: '这绝对是数据库慢查询、PHP/Java 代码死循环导致的。优化后端接口处理速度，或使用 Worker 将慢任务转为异步队列处理。',
  },
  '525': {
    title: '525 SSL handshake failed',
    desc: '加密模式设为 Full (Strict) 时，CF 向源站发起 SSL 握手，但源站证书无效或握手协议不兼容。',
    faultSegment: 'ssl',
    guilty: '源站 SSL 证书配置错误',
    fix: '检查源站证书是否已过期、是否是自签名证书（Full Strict 不信任自签名）。建议安装免费的 Cloudflare Origin CA 十年期证书。',
  },
};

// Visual fault location: renders the 4-segment chain and marks the bad one
function FaultChain({ segment }) {
  const nodes = [
    { id: 'client', icon: '👨‍💻', label: '访客' },
    { id: 'edge', icon: '🟠', label: 'CF 节点' },
    { id: 'transit', icon: '🌐', label: '骨干网络' },
    { id: 'firewall', icon: '🧱', label: '防火墙' },
    { id: 'ssl', icon: '🔒', label: 'SSL 层' },
    { id: 'origin-internal', icon: '💥', label: '源站内部' },
    { id: 'origin-slow', icon: '🐌', label: '源站代码' },
  ];

  // Build a simplified 4-node display
  const display = [
    { id: 'client', icon: '👨‍💻', label: '访客浏览器' },
    { id: 'edge', icon: '🟠', label: 'CF 边缘节点' },
    { id: segment, icon: nodes.find(n => n.id === segment)?.icon || '❓', label: nodes.find(n => n.id === segment)?.label || segment },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mt-4 mb-6 flex-wrap">
      {/* Client */}
      <div className="text-center">
        <div className="text-2xl mb-1">👨‍💻</div>
        <div className="text-xs text-gray-400">访客</div>
      </div>
      <div className="h-0.5 w-8 bg-green-500"></div>
      {/* CF Edge */}
      <div className="text-center">
        <div className="text-2xl mb-1 drop-shadow-[0_0_8px_orange]">🟠</div>
        <div className="text-xs text-orange-400 font-bold">CF 节点</div>
      </div>
      {/* Segment between CF and fault */}
      {segment === 'transit' ? (
        <>
          <div className="h-0.5 w-8 bg-red-500 animate-pulse"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">🌐</div>
            <div className="text-xs text-red-400 font-bold">骨干网络 ❌</div>
          </div>
        </>
      ) : segment === 'firewall' ? (
        <>
          <div className="h-0.5 w-8 bg-red-500 animate-pulse"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">🧱</div>
            <div className="text-xs text-red-400 font-bold">防火墙/安全组 ❌</div>
          </div>
        </>
      ) : segment === 'ssl' ? (
        <>
          <div className="h-0.5 w-8 bg-green-500"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">🏢</div>
            <div className="text-xs text-gray-400">源站</div>
          </div>
          <div className="h-0.5 w-8 bg-red-500 animate-pulse"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-xs text-red-400 font-bold">SSL 层 ❌</div>
          </div>
        </>
      ) : (
        <>
          <div className="h-0.5 w-8 bg-green-500"></div>
          <div className="text-center">
            <div className={`text-2xl mb-1 ${segment.startsWith('origin') ? 'animate-pulse' : ''}`}>🏢</div>
            <div className={`text-xs font-bold ${segment.startsWith('origin') ? 'text-red-400' : 'text-gray-400'}`}>
              {segment === 'origin-internal' ? '源站崩溃 ❌' : segment === 'origin-slow' ? '源站超时 ❌' : '源站'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function LessonSRE() {
  const navigate = useNavigate();
  const [activeCode, setActiveCode] = useState('521');
  const [showRayDemo, setShowRayDemo] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(4, 120, 87, 0.2))', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7'}}>
            🛠️ 模块六：可观测性与排障
         </div>
         <h1>不背黑锅：精准定位 52x 错误码</h1>
         <p className="lesson-intro">
            引入反向代理后，排障链条变长了。当你看到 5xx 错误时，如何区分到底是 Cloudflare 节点挂了，还是你自己的源站挂了？
         </p>
      </header>

      {/* 52x Interactive Troubleshooter — Fixed to show different fault locations */}
      <section className="lesson-section glass-panel">
         <h3 className="mb-4 text-center">🚑 52x 错误黑盒追踪器（精准链路定位）</h3>
         <p className="text-gray-400 text-sm text-center mb-6">点击不同错误码，看看"锅"到底甩给哪个环节——每种错误的"故障点"各不相同。</p>

         <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.keys(ERROR_CODES).map(code => (
              <button key={code} onClick={() => setActiveCode(code)}
                className={`px-4 py-2 font-mono font-bold rounded-lg border transition-all ${activeCode === code ? 'bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {code}
              </button>
            ))}
         </div>

         <div className="bg-black/50 border border-gray-600 rounded-xl p-6">
            <h4 className="text-xl font-bold text-red-400 mb-2">{ERROR_CODES[activeCode].title}</h4>
            <p className="text-gray-300 mb-4">{ERROR_CODES[activeCode].desc}</p>

            {/* Dynamic fault chain visualization */}
            <FaultChain segment={ERROR_CODES[activeCode].faultSegment} />

            <div className="bg-amber-900/20 border border-amber-500/30 px-4 py-2 rounded-lg mb-4 text-sm">
              <span className="text-amber-400 font-bold">📍 责任方：</span>
              <span className="text-gray-200">{ERROR_CODES[activeCode].guilty}</span>
            </div>

            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
               <span className="text-xs text-red-400 font-bold block mb-1">🔧 药方 (How to Fix)</span>
               <p className="text-sm text-gray-200">{ERROR_CODES[activeCode].fix}</p>
            </div>
         </div>
      </section>

      {/* CF-Ray Tracing */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-2 flex items-center gap-2"><Search size={20} className="text-emerald-400"/> CF-Ray ID：你的专属请求 DNA</h3>
         <p className="text-gray-300 text-sm mb-5">每一个经过 Cloudflare 处理的 HTTP 请求，都会被分配一个全球唯一的 Ray ID。它是排障追踪的核心线索，就像案件的 DNA 证据。</p>

         <button onClick={() => setShowRayDemo(!showRayDemo)} className="mb-5 text-sm text-emerald-400 underline">
           {showRayDemo ? '▲ 收起演示' : '▼ 展开：如何找到并使用 CF-Ray ID？'}
         </button>

         {showRayDemo && (
           <div className="space-y-4">
             <div className="bg-black/40 p-4 rounded-xl border border-white/5">
               <p className="text-xs text-gray-400 mb-2 font-bold">📌 第一步：在浏览器 F12 的 Response Headers 中找到它</p>
               <div className="bg-black font-mono text-xs p-3 rounded border border-gray-700">
                 <span className="text-gray-500">HTTP/1.1 200 OK</span><br/>
                 <span className="text-gray-500">content-type: text/html</span><br/>
                 <span className="text-gray-500">cf-cache-status: HIT</span><br/>
                 <span className="text-emerald-400 font-bold">cf-ray: 89a12b3c4d56ef78-SIN</span>  <span className="text-yellow-400 text-[10px]">← 这就是 Ray ID，SIN=新加坡节点</span><br/>
                 <span className="text-gray-500">server: cloudflare</span>
               </div>
             </div>
             <div className="bg-black/40 p-4 rounded-xl border border-white/5">
               <p className="text-xs text-gray-400 mb-2 font-bold">📌 第二步：去 Cloudflare Dashboard 用 Ray ID 搜索单条请求</p>
               <p className="text-sm text-gray-300">进入 <strong>Analytics → Security Events</strong> 或 <strong>Logs → Instant Logs</strong>，粘贴 Ray ID 精确找到这一条请求——包括它触发了哪些 WAF 规则、经过了哪个 Cache 处理、响应耗时多少。</p>
             </div>
             <div className="bg-black/40 p-4 rounded-xl border border-white/5">
               <p className="text-xs text-gray-400 mb-2 font-bold">📌 终极技巧：联系 CF 客服 always带上 Ray ID</p>
               <p className="text-sm text-gray-300">当你在提交 Cloudflare Support Ticket 时，一定要附上问题请求的 Ray ID，工程师可以通过它回放整条请求在全球网络上的完整处理路径，大幅加速排障效率。</p>
             </div>
           </div>
         )}
      </section>

      <section className="lesson-section mt-10">
         <h3 className="mb-4">⚙️ 进阶：自动化与日志提取</h3>
         <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-panel" style={{padding: '1.2rem', borderLeft: '4px solid #8b5cf6'}}>
               <h4 className="flex items-center gap-2 mb-2 text-purple-300"><Activity size={20}/> Logpush（日志推送）</h4>
               <p className="text-xs text-gray-400 mb-2">CF 不在面板长期保存每一条访问日志。使用 Logpush 将原始访问事件、WAF 拦截记录近实时地推送到 AWS S3、Datadog、阿里云 OSS。</p>
               <div className="text-xs bg-purple-900/30 p-2 rounded text-gray-300">
                 可推送字段包括：ClientIP、RequestURI、EdgeResponseStatus、WAFAction、CacheStatus、RayID 等 50+ 个维度。
               </div>
            </div>
            <div className="glass-panel" style={{padding: '1.2rem', borderLeft: '4px solid #0ea5e9'}}>
               <h4 className="flex items-center gap-2 mb-2 text-sky-300"><TerminalSquare size={20}/> Terraform IaC 自动化</h4>
               <p className="text-xs text-gray-400 mb-2">管理上千个域名的企业，UI 面板是灾难。几行 HCL 声明代码搞定 DNS / WAF / 缓存规则，纳入 GitOps 版本控制与协同审批。</p>
               <code className="text-xs bg-sky-900/20 p-2 rounded text-sky-300 block font-mono">
                 resource "cloudflare_record" "www" &#123;<br/>
                 &nbsp;&nbsp;zone_id = var.zone_id<br/>
                 &nbsp;&nbsp;name = "www"<br/>
                 &nbsp;&nbsp;proxied = true<br/>
                 &#125;
               </code>
            </div>
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/labs')}>理论全通！最后一步：毕业实战工作坊 (Labs)</button>
      </section>
    </div>
  );
}
