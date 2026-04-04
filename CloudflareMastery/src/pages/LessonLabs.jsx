import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, Terminal, Rocket, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import './LessonCommon.css';

const LABS = [
  {
    id: 1,
    icon: ShieldCheck,
    duration: '~30 分钟',
    title: 'Lab 1: 防御降临 (站点接入与防护)',
    objective: '接入测试域名，实现全链路加密，并编写自定义防火墙规则。',
    steps: [
      '注册账号并使用 CNAME Setup 或全量 NS 接入一个测试域名，确保 DNS 记录的云图标变为橙色。',
      '在 SSL/TLS → Overview 菜单中，将加密模式设置为「Full (Strict)」。',
      '导航到 Security → WAF → Custom Rules，点击「Create rule」。',
      '配置规则：If "URI path equals /admin" AND "Country is NOT CN" → Interactive Challenge。',
      '用海外 VPN 访问 /admin 路径，验证是否弹出 Turnstile 人机验证界面。',
    ],
    validate: '✅ 验收标准：海外 IP 访问 /admin 触发 Turnstile 验证；本地 IP 直接访问成功。Dashboard → Security Events 中可看到对应拦截记录。',
  },
  {
    id: 2,
    icon: Zap,
    duration: '~20 分钟',
    title: 'Lab 2: 极致压榨 (边缘缓存控制)',
    objective: '突破默认限制，强制缓存后端动态接口并验证缓存命中。',
    steps: [
      '在后端服务器写一个输出当前时间戳的简单动态 API `/api/time`，默认不缓存。',
      '导航到 Rules → Cache Rules，点击「Create Cache Rule」。',
      '条件：URI path equals /api/time；动作：Cache eligibility = Eligible，Edge TTL = 5 分钟。',
      '保存规则。在浏览器打开 F12 → Network，多次刷新 `/api/time`。',
      '观察 Response Headers 中 `cf-cache-status` 是否从 MISS 变为 HIT，且时间戳不再更新。',
    ],
    validate: '✅ 验收标准：第一次请求 cf-cache-status: MISS，后续请求均为 HIT，时间戳停止变化。这证明动态内容已被边缘节点缓存。',
  },
  {
    id: 3,
    icon: Laptop,
    duration: '~40 分钟',
    title: 'Lab 3: 黑客潜行 (内网穿透与零信任)',
    objective: '在不开放任何入站端口的前提下，安全暴露本机内网服务。',
    steps: [
      '在本地电脑运行一个简单 Web 服务：`python3 -m http.server 8080`',
      '进入 Cloudflare Zero Trust Dashboard → Networks → Tunnels → Create a tunnel。',
      '选择 cloudflared，复制安装命令在本机运行，等待 Connector 显示为 Connected。',
      '配置 Public Hostname：Subdomain = ops，Domain = yourdomain.com，Service = http://localhost:8080。',
      '进入 Access → Applications 新建应用，绑定 ops.yourdomain.com，添加策略：Email ends with @youremail.com。',
      '从任意网络访问 ops.yourdomain.com，验证 Access 的邮箱验证码登录流程。',
    ],
    validate: '✅ 验收标准：在没有公网 IP 的内网机器上，通过公网域名成功访问了本地 8080 服务，且需经过 Access 邮箱验证码认证。',
  },
  {
    id: 4,
    icon: Terminal,
    duration: '~20 分钟',
    title: 'Lab 4: 边缘极客 (Serverless 拦截器)',
    objective: '在 V8 Isolate 引擎上编写 Worker，动态重定向访客至本地化页面。',
    steps: [
      '在本地安装 Wrangler CLI：`npm install -g wrangler`，并执行 `wrangler login`。',
      '初始化项目：`wrangler init geo-redirect`，选择 Hello World 模板。',
      '编辑 src/index.js，通过 `request.cf.country` 获取访客国家码，实现日本访客重定向到 /ja 路径。',
      '本地测试：`wrangler dev`，使用 curl 或 Postman 附加 `CF-IPCountry: JP` 头测试重定向逻辑。',
      '发布到生产：`wrangler deploy`，验证全球节点分发成功。',
    ],
    validate: '✅ 验收标准：`wrangler deploy` 成功后显示 Worker URL。访问该 URL 添加 ?country=JP 参数（或实际用 JP 节点访问）验证重定向生效。',
  },
];

export default function LessonLabs() {
  const navigate = useNavigate();
  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">💻 模块七：实战工作坊 (Hands-on Labs)</div>
         <h1>不敲代码的架构师不是好 SRE</h1>
         <p className="lesson-intro">
            真理只在实践中。请打开你的笔记本电脑和 Cloudflare Dashboard，跟着以下的 4 个实验室（Labs），真正把边缘网络变成你的武器库。
         </p>
      </header>

      <section className="lesson-section mt-10">
         <div className="grid md:grid-cols-2 gap-8">
            {LABS.map(lab => {
              const Icon = lab.icon;
              return (
                <div key={lab.id} className="glass-panel relative overflow-hidden group">
                   {/* Hover effect */}
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-500/30">
                           <Icon size={24} className="text-orange-400"/>
                         </div>
                         <h3 className="text-xl font-bold m-0 text-white">{lab.title}</h3>
                       </div>
                       <span className="text-xs text-gray-500 shrink-0 bg-black/30 px-2 py-1 rounded">{lab.duration}</span>
                     </div>
                     <p className="text-sm font-bold text-gray-400 mb-4 pb-4 border-b border-white/10">🎯 目标：{lab.objective}</p>
                     <ol className="text-sm text-gray-300 space-y-3 pl-1 mb-4">
                       {lab.steps.map((step, idx) => (
                         <li key={idx} className="flex items-start gap-2">
                           <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0"/>
                           <span dangerouslySetInnerHTML={{__html: step.replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-pink-300 px-1 rounded">$1</code>')}} />
                         </li>
                       ))}
                     </ol>
                     <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-xs text-emerald-300">
                       {lab.validate}
                     </div>
                   </div>
                </div>
              );
            })}
         </div>
      </section>

      <section className="lesson-section glass-panel mt-12 text-center py-10" style={{borderTop: '4px solid #f58220'}}>
         <Rocket size={48} className="mx-auto mb-4 text-orange-500"/>
         <h2 className="text-3xl font-bold text-white mb-2">🎉 恭喜！全栈特训营结业</h2>
         <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            你已经掌握了这只控制着全球近 20% 流量的"吞吐巨兽"。不论是防攻击、做提速还是构建下一代无服务器应用，边缘的世界任你驰骋。
         </p>
         <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(245,130,32,0.4)] transition-transform hover:scale-105" onClick={() => navigate('/dashboard')}>
            返回控制台仪表盘
         </button>
      </section>
    </div>
  );
}
