import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, Wifi, Rocket } from 'lucide-react';
import './LessonCommon.css';

const EMAIL_RULES = [
  { from: '*@company.com', action: 'forward', dest: 'team@gmail.com', label: '公司域名来信 → 内部 Gmail' },
  { from: 'vip@partner.com', action: 'forward', dest: 'cto@company.com', label: 'VIP 合作伙伴 → CTO 直达' },
  { from: '*@spam-domain.xyz', action: 'drop', dest: null, label: '垃圾域名 → 直接丢弃' },
];

const MAGIC_COMPARISON = [
  {
    label: '传统 DDoS 清洗方案',
    step1: '◆ 购买专用 Scrubbing Center 硬件设备',
    step2: '◆ 手动配置 BGP 流量牵引（Blackhole）',
    step3: '◆ 遭受攻击 → 手工切流量 → 清洗 → 回注',
    step4: '◆ 清洗容量固定，大流量直接溢出',
    color: 'red',
    cost: '💰 百万级硬件投入 + 专门运维团队',
  },
  {
    label: 'Magic Transit（Cloudflare）',
    step1: '✅ 纯软件，无需任何硬件',
    step2: '✅ Cloudflare 宣告 BGP 路由，全球自动牵引',
    step3: '✅ 攻击流量在全球 320 个城市同时清洗',
    step4: '✅ 最大 209 Tbps 清洗容量，几乎无上限',
    color: 'emerald',
    cost: '💡 按提供保护的 IP 前缀付费，弹性扩容',
  },
];

export default function LessonNetwork() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [emailResult, setEmailResult] = useState(null);
  const [activeTab, setActiveTab] = useState('magic');

  const testEmailRoute = () => {
    if (!emailInput) return;
    const matched = EMAIL_RULES.find(r => {
      if (r.from.startsWith('*@')) {
        return emailInput.endsWith(r.from.slice(1));
      }
      return emailInput === r.from;
    });
    if (matched) {
      setEmailResult(matched);
    } else {
      setEmailResult({ action: 'fallback', label: '未匹配任何规则，投递到默认收件箱' });
    }
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
          🌐 模块十：Magic 企业网络与邮件安全
        </div>
        <h1>到达网络最底层：保护 IP 网段与企业通信</h1>
        <p className="lesson-intro">
          当你的业务规模大到需要保护整个 IP 地址段、管理全球分支机构网络、防范企业钓鱼攻击时，Magic 系列和 Email Security 就是 Cloudflare 的终极武器。
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8">
        {[['magic', '🌐 Magic 企业网络'], ['email', '📧 邮件安全'], ['warp', '📱 WARP 设备保护']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeTab === id ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'magic' && (
        <>
          <section className="lesson-section glass-panel">
            <h3 className="mb-4">⚡ Magic Transit：保护你的 IP 网段，而非单个域名</h3>
            <p className="text-gray-300 text-sm mb-6">
              当前课程讲的 WAF/DDoS 防护，都需要将<strong>域名</strong>接入 Cloudflare。但如果你是金融机构、游戏公司或运营商，你有<strong>自己的 IP 地址段（如 203.0.113.0/24）</strong>，需要保护整个网段，怎么办？
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {MAGIC_COMPARISON.map((item, i) => (
                <div key={i} className={`p-5 rounded-xl border-2 ${item.color === 'red' ? 'border-red-500/40 bg-red-900/10' : 'border-emerald-500/40 bg-emerald-900/10'}`}>
                  <h4 className={`font-bold mb-4 ${item.color === 'red' ? 'text-red-300' : 'text-emerald-300'}`}>{item.label}</h4>
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    {[item.step1, item.step2, item.step3, item.step4].map((s, j) => (
                      <p key={j} className={item.color === 'red' ? 'text-gray-400' : 'text-gray-200'}>{s}</p>
                    ))}
                  </div>
                  <p className={`text-xs p-2 rounded ${item.color === 'red' ? 'bg-red-900/20 text-red-300' : 'bg-emerald-900/20 text-emerald-300'}`}>{item.cost}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🔮', title: 'Magic WAN', desc: '用 Cloudflare 骨干网替代 MPLS 专线，连接总部与全球分支机构，延迟更低、成本降 60%+，自带 Magic Firewall 网络层防火墙。' },
                { icon: '🧱', title: 'Magic Firewall', desc: 'L3/L4 网络层防火墙，在流量进入你的网络之前在 Cloudflare 节点上过滤，支持 Wireshark 风格的规则语法，替代 iptables 规则的云端版。' },
                { icon: '📡', title: 'Network Interconnect', desc: 'Cloudflare Network Interconnect (CNI)：与 Cloudflare 建立直连（PNI/VXC），避免流量走公开互联网，适合金融级低延迟场景。' },
              ].map((item, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.2rem' }}>
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === 'email' && (
        <>
          <section className="lesson-section glass-panel">
            <h3 className="mb-2">📧 Email Routing — 免费自定义域名邮件转发</h3>
            <p className="text-gray-400 text-sm mb-5">
              不用买邮件服务器。只需 Cloudflare DNS 接管域名，即可用 <code className="bg-gray-800 text-blue-300 px-1 rounded">hello@yourcompany.com</code> 接收邮件并转发到 Gmail/Outlook——完全免费。
            </p>

            {/* Email Route Tester */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-gray-300 mb-3">🧪 Email Rule 路由测试器</h4>
              <div className="flex gap-3 mb-4">
                <input
                  className="flex-1 bg-black/50 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="输入发件人地址，如：vip@partner.com"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setEmailResult(null); }}
                  onKeyDown={e => e.key === 'Enter' && testEmailRoute()}
                />
                <button onClick={testEmailRoute} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition-all">测试路由</button>
              </div>

              <div className="text-xs text-gray-500 mb-3">已配置的规则：</div>
              {EMAIL_RULES.map((rule, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 text-xs">
                  <code className="text-blue-300 w-40 shrink-0">{rule.from}</code>
                  <span className={`px-2 py-0.5 rounded font-bold ${rule.action === 'forward' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-red-900/30 text-red-300'}`}>
                    {rule.action === 'forward' ? '转发' : '丢弃'}
                  </span>
                  <span className="text-gray-400">{rule.label}</span>
                </div>
              ))}

              {emailResult && (
                <div className={`mt-4 p-3 rounded-lg border ${emailResult.action === 'drop' ? 'bg-red-900/20 border-red-500/40 text-red-300' : emailResult.action === 'fallback' ? 'bg-blue-900/20 border-blue-500/40 text-blue-300' : 'bg-emerald-900/20 border-emerald-500/40 text-emerald-300'}`}>
                  <strong>路由结果：</strong> {emailResult.label}
                  {emailResult.action === 'forward' && <span> → <code>{emailResult.dest}</code></span>}
                </div>
              )}
            </div>

            {/* Email Security */}
            <h3 className="mb-2 mt-6">🛡️ Email Security（原 Area 1）— 企业反钓鱼</h3>
            <p className="text-gray-400 text-sm mb-4">Cloudflare 2022 年以 $1.62 亿收购 Area 1，提供<strong>预防式</strong>邮件安全（在邮件到达收件箱之前就拦截）。</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🎣', title: 'BEC 商业邮件欺诈', desc: '识别伪装成CEO/CFO发出"紧急转账"指令的钓鱼邮件，AI 分析写作风格与发件人身份。' },
                { icon: '🔗', title: '恶意链接检测', desc: '邮件中所有 URL 在点击前实时单击分析，进入沙箱执行，检测重定向链和零日钓鱼页面。' },
                { icon: '📎', title: '恶意附件沙箱', desc: 'PDF/Office 文档在送达前在隔离环境执行，检测宏病毒、漏洞利用和勒索软件释放载体。' },
              ].map((item, i) => (
                <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl">
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === 'warp' && (
        <>
          <section className="lesson-section glass-panel">
            <h3 className="mb-2">📱 WARP — 员工设备的最后一块拼图</h3>
            <p className="text-gray-400 text-sm mb-6">
              模块四里我们讲了 Cloudflare Tunnel（服务端）和 Access（身份网关）。但 Zero Trust 体系还有第三块拼图：<strong>员工设备侧的 WARP 客户端</strong>。
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-900/10 border border-red-500/30 p-5 rounded-xl">
                <h4 className="text-red-300 font-bold mb-3">❌ 传统 VPN 的设备风险</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 员工用家里未打补丁的个人电脑连 VPN，直通内网</li>
                  <li>• 无法验证设备健康状态（是否有杀毒软件？是否是公司资产？）</li>
                  <li>• 员工设备感染木马后，可通过 VPN 横向移动到所有内网资产</li>
                </ul>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-500/30 p-5 rounded-xl">
                <h4 className="text-emerald-300 font-bold mb-3">✅ WARP + Zero Trust 的设备管控</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 员工设备注册 WARP，建立设备指纹</li>
                  <li>• Access 策略可以增加设备合规性检查：<em>是否安装了 EDR？磁盘是否加密？</em></li>
                  <li>• 不合规设备即使有账号密码也被拒绝访问内网资源</li>
                  <li>• Gateway 过滤员工上网流量，内容审计无死角</li>
                </ul>
              </div>
            </div>

            {/* WARP Architecture */}
            <h4 className="font-bold text-gray-200 mb-4 text-center">Cloudflare One：完整 SASE 架构全景</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              {[
                { icon: '💻', label: '员工设备', sub: 'WARP 客户端' },
                { icon: '🔐', label: 'Access', sub: '身份验证网关' },
                { icon: '👁️', label: 'Gateway', sub: '上网行为管控' },
                { icon: '🚇', label: 'Tunnel', sub: '内网服务穿透' },
              ].map((item, i) => (
                <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-xl">
                  <div className="text-3xl mb-1">{item.icon}</div>
                  <p className="font-bold text-white">{item.label}</p>
                  <p className="text-gray-500">{item.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">四者协同，构成完整的 SASE（安全访问服务边缘）框架，彻底替代传统 VPN + 防火墙边界安全架构</p>
          </section>
        </>
      )}

      {/* Final Celebration */}
      <section className="lesson-section glass-panel mt-10 text-center py-10" style={{ borderTop: '4px solid #10b981' }}>
        <Rocket size={48} className="mx-auto mb-4 text-emerald-500" />
        <h2 className="text-3xl font-bold text-white mb-3">🎓 Cloudflare 全栈培训·完整版结业</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          恭喜！你已经从基础架构、CDN 缓存、安全防护、Zero Trust、边缘计算、SRE 排障，一路贯穿到 AI 产品线、高可用架构与企业网络安全——这是对 Cloudflare 生态最完整的一次深度探索。
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
          {['DNS & 橙云', 'SSL 全模式', 'CDN 缓存', 'WAF & Bot', 'Zero Trust', 'Workers AI', '边缘计算', '52x 排障', 'AI Gateway', 'Load Balancing', 'Waiting Room', 'Magic Transit', 'Email Security', 'WARP'].map(tag => (
            <span key={tag} className="bg-emerald-900/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">{tag}</span>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform hover:scale-105">
          返回控制台仪表盘
        </button>
      </section>
    </div>
  );
}
