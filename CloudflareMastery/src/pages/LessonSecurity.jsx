import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Crosshair, Ban, Bot, ShieldCheck } from 'lucide-react';
import './LessonCommon.css';

// WAF payload samples - map to a detection result
const WAF_PAYLOADS = [
  { label: "正常 API 请求", value: "GET /api/user?id=42", threat: false, rule: null },
  { label: "SQL 注入攻击", value: "GET /search?q=' OR '1'='1", threat: true, rule: "SQL Injection (SQLI) — Cloudflare Managed Rules 100002A" },
  { label: "XSS 跨站脚本", value: "GET /page?name=<script>alert(1)</script>", threat: true, rule: "XSS Cross-Site Scripting — Cloudflare Managed Rules 100015B" },
  { label: "目录遍历攻击", value: "GET /../../etc/passwd", threat: true, rule: "Path Traversal — Cloudflare Managed Rules 100020C" },
  { label: "正常搜索请求", value: "GET /search?q=cloudflare+cdn", threat: false, rule: null },
];

const BOT_AGENTS = [
  { ua: 'Googlebot/2.1 (+http://www.google.com/bot.html)', type: 'good', label: '✅ 良好爬虫 (谷歌)', action: '放行，不拦截', color: 'text-emerald-400' },
  { ua: 'python-requests/2.28.0', type: 'suspicious', label: '⚠️ 可疑脚本爬虫', action: '触发质询 (Challenge)', color: 'text-yellow-400' },
  { ua: 'curl/7.68 (mass-scanner)', type: 'bad', label: '🚫 已知扫描工具', action: '直接封锁 (Block)', color: 'text-red-400' },
];

export default function LessonSecurity() {
  const navigate = useNavigate();
  const [underAttack, setUnderAttack] = useState(false);
  const [challengeStep, setChallengeStep] = useState(0);
  const [selectedPayload, setSelectedPayload] = useState(0);
  const [wafResult, setWafResult] = useState(null);

  useEffect(() => {
    let timer;
    if (underAttack) {
      setChallengeStep(1);
      timer = setTimeout(() => setChallengeStep(2), 5000);
    } else {
      setChallengeStep(0);
    }
    return () => clearTimeout(timer);
  }, [underAttack]);

  const testWaf = () => {
    setWafResult(WAF_PAYLOADS[selectedPayload]);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2))', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5'}}>
            🛡️ 模块三：Web 应用安全防护
         </div>
         <h1>全副武装，抵挡世界上最凶猛的攻击</h1>
         <p className="lesson-intro">
            凭借庞大的 Anycast 容量，Cloudflare 是名副其实的"抗 D 绞肉机"。从 WAF 拦截 OWASP 漏洞到无感拦截自动化爬虫。
         </p>
      </header>

      {/* 5-Second Shield */}
      <section className="lesson-section glass-panel">
         <h3>🔥 紧急救命神技："开启 5 秒盾" (Under Attack 模式)</h3>
         <p className="text-gray-300 text-sm mb-6">遭遇 CC 攻击打挂源站时，在后台一键开启 <code className="text-red-400 bg-red-900/20 px-1 rounded">I'm Under Attack!</code>，强制所有访客先在浏览器端做 JS 计算人机验证——机器人无法通过，真实用户 5 秒后正常访问。</p>

         <div className="bg-black/60 border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto flex flex-col items-center">
            {!underAttack ? (
              <div className="text-center">
                 <ShieldAlert size={60} className="text-red-500 mx-auto mb-4"/>
                 <h4 className="text-xl font-bold mb-4">遭遇百万级并发 CC 攻击！</h4>
                 <button onClick={() => setUnderAttack(true)} className="bg-red-600 hover:bg-red-500 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                   🚨 立即开启 Under Attack 模式
                 </button>
              </div>
            ) : (
              <div className="w-full bg-white text-gray-800 p-8 rounded-lg shadow-xl">
                 {challengeStep === 1 ? (
                   <div className="text-center">
                      <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Checking your browser before accessing example.com.</h2>
                      <p className="text-gray-600 mb-4">This process is automatic. Your browser will redirect to your requested content shortly.</p>
                      <p className="text-xs text-gray-500">Please allow up to 5 seconds…</p>
                      <div className="mt-8 pt-4 border-t border-gray-200 flex justify-center gap-2 text-sm text-gray-500">
                         <span className="font-bold">Cloudflare</span> Ray ID: 8945a0bcd789x • IP: 8.8.8.8
                      </div>
                   </div>
                 ) : (
                   <div className="text-center">
                      <ShieldCheck size={64} className="text-green-500 mx-auto mb-4"/>
                      <h2 className="text-xl font-bold text-green-600 mb-2">验证通过！你是真正的人类！</h2>
                      <p className="text-gray-600">正在重定向至目标网页...</p>
                      <button onClick={() => setUnderAttack(false)} className="mt-6 text-sm text-blue-500 underline">关闭攻击模式，恢复正常</button>
                   </div>
                 )}
              </div>
            )}
         </div>
      </section>

      {/* WAF Attack Simulator */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-2">⚔️ WAF 攻防实验室：请求能过防火墙吗？</h3>
         <p className="text-gray-400 text-sm mb-6">选择一种 HTTP 请求，模拟经过 Cloudflare WAF 的检测结果——</p>

         <div className="space-y-2 mb-5">
           {WAF_PAYLOADS.map((p, i) => (
             <button key={i} onClick={() => { setSelectedPayload(i); setWafResult(null); }}
               className={`w-full text-left p-3 rounded-lg border text-sm font-mono transition-all ${selectedPayload === i ? 'border-purple-500 bg-purple-900/20 text-white' : 'border-gray-700 bg-black/30 text-gray-400 hover:border-gray-500'}`}>
               <span className="font-sans text-xs text-gray-500 mr-2">{p.label}</span>{p.value}
             </button>
           ))}
         </div>

         <div className="flex justify-center mb-5">
           <button onClick={testWaf} className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-full font-bold text-white transition-all shadow-[0_0_12px_rgba(139,92,246,0.5)]">
             🧪 发送请求 → WAF 检测
           </button>
         </div>

         {wafResult && (
           <div className={`p-5 rounded-xl border-2 transition-all ${wafResult.threat ? 'bg-red-900/20 border-red-500' : 'bg-emerald-900/20 border-emerald-500'}`}>
             {wafResult.threat ? (
               <>
                 <p className="text-red-400 font-bold text-lg mb-2">🚫 请求已被 WAF 拦截！</p>
                 <p className="text-sm text-gray-300 mb-2">触发规则：<code className="bg-red-900/30 text-red-300 px-2 py-0.5 rounded">{wafResult.rule}</code></p>
                 <p className="text-xs text-gray-400">攻击者收到 403 Forbidden。WAF 日志记录此事件，可在 Dashboard → Security → Events 中查看。</p>
               </>
             ) : (
               <>
                 <p className="text-emerald-400 font-bold text-lg mb-2">✅ 请求通过 WAF 检测，正常转发至源站</p>
                 <p className="text-xs text-gray-400">未触发任何安全规则，请求正常传达给后端服务处理。</p>
               </>
             )}
           </div>
         )}
      </section>

      {/* WAF Three Functions */}
      <section className="lesson-section mt-10">
         <h3 className="mb-4">🛡️ WAF 三大功能矩阵</h3>
         <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/40 border border-blue-500/20 p-5 rounded-xl">
               <Crosshair className="text-blue-400 mb-3" size={30}/>
               <h4 className="font-bold mb-2">托管规则集</h4>
               <p className="text-xs text-gray-400 leading-relaxed">Cloudflare 安全团队每日更新的规则。一键开启拦截 SQL 注入、XSS、Log4Shell 等 OWASP Top 10 漏洞。</p>
            </div>
            <div className="bg-black/40 border border-purple-500/20 p-5 rounded-xl">
               <Ban className="text-purple-400 mb-3" size={30}/>
               <h4 className="font-bold mb-2">自定义规则</h4>
               <p className="text-xs text-gray-400 leading-relaxed">灵活配置：<code className="text-purple-300 bg-purple-900/30 px-1 rounded">If URI is /admin AND Country is NOT CN → Block</code>。封堵非业务区域的暴力探测。</p>
            </div>
            <div className="bg-black/40 border border-emerald-500/20 p-5 rounded-xl">
               <Bot className="text-emerald-400 mb-3" size={30}/>
               <h4 className="font-bold mb-2">速率限制</h4>
               <p className="text-xs text-gray-400 leading-relaxed">防 CC 与密码爆破：某 IP 1 分钟内访问 <code className="text-emerald-300 bg-emerald-900/30 px-1 rounded">/login</code> 超过 5 次，自动封禁 1 小时。</p>
            </div>
         </div>
      </section>

      {/* Bot Management */}
      <section className="lesson-section glass-panel mt-10">
         <h3 className="mb-4">🤖 Bot 管理：谁是机器人，谁是真人？</h3>
         <p className="text-gray-400 text-sm mb-5">Cloudflare Bot Fight Mode 能识别 User-Agent 和行为模式，区分对待不同类型的自动化请求：</p>
         <div className="space-y-3">
           {BOT_AGENTS.map((bot, i) => (
             <div key={i} className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/5">
               <code className="text-xs text-gray-400 flex-1 truncate font-mono">{bot.ua}</code>
               <span className={`text-xs font-bold shrink-0 ${bot.color}`}>{bot.label}</span>
               <span className="text-xs bg-black/40 px-2 py-1 rounded text-gray-400 shrink-0">{bot.action}</span>
             </div>
           ))}
         </div>
         <p className="text-xs text-gray-500 mt-3 pl-1">💡 Turnstile 无感验证：替代令人抓狂的"点选红绿灯"验证码，基于设备行为特征静默判断人类，对真实用户完全透明。</p>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/zerotrust')}>公网防护满级！走入内网与 Zero Trust</button>
      </section>
    </div>
  );
}
