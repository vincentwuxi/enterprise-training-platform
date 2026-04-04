import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Cpu, Globe, XCircle, CheckCircle2, Shield, Eye } from 'lucide-react';
import './LessonCommon.css';

const TUNNEL_STEPS = [
  {
    id: 1,
    icon: '🖥️',
    title: '步骤 1：在内网机器运行 cloudflared',
    desc: '在你那台没有公网 IP 的内网服务器上，运行一行命令：',
    code: 'cloudflared tunnel run --token <YOUR_TUNNEL_TOKEN>',
    state: '本地服务器主动向 Cloudflare 发起 HTTPS 出站（Outbound）连接。防火墙无需开放任何入站端口！',
  },
  {
    id: 2,
    icon: '🤝',
    title: '步骤 2：隧道握手成功',
    desc: 'cloudflared 守护进程与 Cloudflare 的两个最近的 PoP（接入点）建立加密的持久化 WebSocket 连接。',
    code: '2025/01/01 10:00:00 INF Connection established connIndex=0 location=SIN',
    state: '即使服务器重启，cloudflared 会自动重连。隧道是持久的、双向的加密通道。',
  },
  {
    id: 3,
    icon: '🔗',
    title: '步骤 3：在 Dashboard 绑定公网域名',
    desc: '在 Zero Trust Dashboard → Tunnels → Configure Public Hostname，将 internal-app.company.com 映射到 localhost:8080。',
    code: 'Hostname: ops.company.com → Service: http://localhost:8080',
    state: 'Cloudflare 自动为该域名颁发 TLS 证书，访客通过 HTTPS 访问，全程加密。',
  },
  {
    id: 4,
    icon: '🔐',
    title: '步骤 4：配置 Access 策略锁门',
    desc: '在 Cloudflare Access 为该域名添加身份验证策略，使用公司 IdP（飞书/钉钉/Okta）进行统一鉴权。',
    code: 'Policy: Allow | Rule: Email ends with @company.com | SSO: 飞书扫码',
    state: '访客浏览器访问 → CF 节点拦截 → IdP 验证身份 → 通过后通过隧道转发到内网服务 ✅',
  },
];

export default function LessonZeroTrust() {
  const navigate = useNavigate();
  const [tunnelStep, setTunnelStep] = useState(0); // 0 = not started

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🔐 模块四：Zero Trust 零信任</div>
         <h1>拆掉城墙，淘汰企业 VPN</h1>
         <p className="lesson-intro">
            在这个勒索软件横行的时代，单纯靠防火墙和 VPN 建立"企业内网"已经不安全了。Cloudflare One 提供了一种全新的连接范式。
         </p>
      </header>

      <section className="lesson-section glass-panel">
         <h3 className="mb-4">🏰 "城堡-护城河"的消亡</h3>
         <div className="grid md:grid-cols-2 gap-6">
            <div>
               <h4 className="text-red-400 font-bold mb-2">❌ 传统的企业 VPN 模式</h4>
               <p className="text-sm text-gray-300 leading-relaxed">
                  你在互联网上挖了一个洞（开放公网端口）作为大门。大门加了锁（VPN账号密码），一旦员工被钓鱼导致密码泄露，黑客连上这扇门后，由于是内网直连（横向移动），可以直接把财务系统、代码仓库全盘端掉。
               </p>
            </div>
            <div>
               <h4 className="text-emerald-400 font-bold mb-2">✅ Cloudflare Access 零信任模式</h4>
               <p className="text-sm text-gray-300 leading-relaxed">
                  <strong>不再信任任何人，哪怕他在局域网里。</strong>每个服务的每次请求，都要经过 Cloudflare 的实人验证。不仅校验账号，还校验设备指纹（是否合规设备？是否满足安全基线？）。
               </p>
            </div>
         </div>
      </section>

      {/* Cloudflare Tunnel Step-by-Step Interactive */}
      <section className="lesson-section mt-10">
         <h3 className="mb-4 text-center">🚇 Tunnel 内网穿透：4 步建立零信任访问通道</h3>
         <p className="text-sm text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            在一台没有公网 IP、防火墙全关的内网服务器上，安全地对外提供服务——点击每个步骤查看详情：
         </p>

         {/* Steps */}
         <div className="space-y-3 max-w-3xl mx-auto">
           {TUNNEL_STEPS.map((step, i) => {
             const isActive = tunnelStep === step.id;
             const isDone = tunnelStep > step.id;
             return (
               <div key={step.id} className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${isActive ? 'border-orange-500 bg-orange-900/10' : isDone ? 'border-emerald-500/50 bg-emerald-900/5' : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                    onClick={() => setTunnelStep(isActive ? 0 : step.id)}>
                 <div className="flex items-center gap-4 p-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg ${isActive ? 'bg-orange-500 text-white' : isDone ? 'bg-emerald-500/30 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                     {isDone ? '✓' : step.id}
                   </div>
                   <span className="text-2xl">{step.icon}</span>
                   <h4 className={`font-bold text-sm ${isActive ? 'text-orange-200' : isDone ? 'text-emerald-300' : 'text-gray-300'}`}>{step.title}</h4>
                 </div>
                 {isActive && (
                   <div className="px-6 pb-5">
                     <p className="text-sm text-gray-300 mb-3">{step.desc}</p>
                     <code className="block bg-black/60 border border-gray-600 text-green-300 p-3 rounded-lg text-xs font-mono mb-3 whitespace-pre-wrap">{step.code}</code>
                     <p className="text-xs text-orange-200/80 bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">{step.state}</p>
                   </div>
                 )}
               </div>
             );
           })}
         </div>

         {tunnelStep === 4 && (
           <div className="mt-6 text-center p-4 rounded-xl bg-emerald-900/20 border border-emerald-500">
             <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={32}/>
             <p className="text-emerald-300 font-bold">🎉 零信任通道已成功建立！访客通过 IdP 验证后，可安全访问内网服务，源站从未向互联网开放任何端口。</p>
           </div>
         )}
      </section>

      {/* Cloudflare One Full Picture */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-4">🌐 Cloudflare One 全景图：三大支柱协同</h3>
         <div className="grid md:grid-cols-3 gap-4">
           <div className="bg-black/40 p-4 rounded-xl border border-orange-500/30 text-center">
             <Shield className="mx-auto mb-2 text-orange-400" size={28}/>
             <h4 className="font-bold text-orange-300 mb-1">Cloudflare Tunnel</h4>
             <p className="text-xs text-gray-400">将内网服务安全穿透到公网，无需开放防火墙端口</p>
           </div>
           <div className="bg-black/40 p-4 rounded-xl border border-blue-500/30 text-center">
             <Lock className="mx-auto mb-2 text-blue-400" size={28}/>
             <h4 className="font-bold text-blue-300 mb-1">Cloudflare Access</h4>
             <p className="text-xs text-gray-400">身份认证网关，结合 IdP 对每个服务端点进行细粒度鉴权</p>
           </div>
           <div className="bg-black/40 p-4 rounded-xl border border-violet-500/30 text-center">
             <Eye className="mx-auto mb-2 text-violet-400" size={28}/>
             <h4 className="font-bold text-violet-300 mb-1">Cloudflare Gateway (SWG)</h4>
             <p className="text-xs text-gray-400">员工上网代理层：DNS 过滤、恶意网站拦截、上网行为审计</p>
           </div>
         </div>
         <p className="text-xs text-gray-500 mt-4 text-center">三者共同构成 Cloudflare One SASE 框架，从"进入内网"和"访问互联网"两个方向全面替代传统 VPN 安全边界。</p>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/edge')}>内网也搞定了！开启写代码模式 (边缘计算篇)</button>
      </section>
    </div>
  );
}
