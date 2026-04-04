import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, RefreshCw, Users, Clock } from 'lucide-react';
import './LessonCommon.css';

// Load Balancer Simulator State
const ORIGINS = [
  { id: 'origin-sg', label: '🇸🇬 新加坡源站', region: 'ap-southeast', ip: '192.168.1.10' },
  { id: 'origin-us', label: '🇺🇸 美国源站', region: 'us-east', ip: '10.0.0.5' },
  { id: 'origin-de', label: '🇩🇪 德国源站', region: 'eu-west', ip: '172.16.0.3' },
];

export default function LessonHA() {
  const navigate = useNavigate();

  // --- Load Balancer Simulator ---
  const [originHealth, setOriginHealth] = useState({ 'origin-sg': 'healthy', 'origin-us': 'healthy', 'origin-de': 'healthy' });
  const [activeOrigin, setActiveOrigin] = useState('origin-sg');
  const [requestLog, setRequestLog] = useState([]);
  const [reqCount, setReqCount] = useState(0);
  const logRef = useRef(null);

  const toggleHealth = (id) => {
    const next = { ...originHealth, [id]: originHealth[id] === 'healthy' ? 'down' : 'healthy' };
    setOriginHealth(next);
    // Recompute best origin
    const available = ORIGINS.filter(o => next[o.id] === 'healthy');
    if (available.length > 0) {
      setActiveOrigin(available[0].id);
    }
  };

  const simulateRequest = () => {
    const n = reqCount + 1;
    setReqCount(n);
    const available = ORIGINS.filter(o => originHealth[o.id] === 'healthy');
    if (available.length === 0) {
      setRequestLog(prev => [...prev.slice(-4), { n, origin: null, msg: '❌ 所有源站不可用，返回 503 Service Unavailable', type: 'error' }]);
      return;
    }
    // Round-robin
    const chosen = available[n % available.length];
    setActiveOrigin(chosen.id);
    setRequestLog(prev => [...prev.slice(-4), { n, origin: chosen, msg: `✅ 路由至 ${chosen.label} (${chosen.ip})`, type: 'ok' }]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [requestLog]);

  // --- Waiting Room Simulator ---
  const [wrActive, setWrActive] = useState(false);
  const [queuePos, setQueuePos] = useState(0);
  const [queueTotal, setQueueTotal] = useState(2847);
  const [admitted, setAdmitted] = useState(false);

  useEffect(() => {
    let interval;
    if (wrActive && queuePos > 0 && !admitted) {
      interval = setInterval(() => {
        setQueuePos(p => {
          if (p <= 1) { setAdmitted(true); return 0; }
          return p - Math.floor(Math.random() * 30 + 10);
        });
        setQueueTotal(t => Math.max(0, t - Math.floor(Math.random() * 15 + 5)));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [wrActive, queuePos, admitted]);

  const enterQueue = () => {
    setWrActive(true);
    setQueuePos(Math.floor(Math.random() * 800 + 200));
    setAdmitted(false);
  };

  const resetWr = () => {
    setWrActive(false);
    setQueuePos(0);
    setAdmitted(false);
    setQueueTotal(2847);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2))', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
          🔀 模块九：负载均衡与高可用架构
        </div>
        <h1>让你的服务在任何情况下都不倒</h1>
        <p className="lesson-intro">
          单一源站是高可用最大的敌人。Cloudflare Load Balancing 提供全球多源站健康检查、智能故障切换和地域路由；Waiting Room 则是应对流量洪峰的最后一道防线。
        </p>
      </header>

      {/* Load Balancer Simulator */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">⚖️ 负载均衡实时模拟器</h3>
        <p className="text-gray-400 text-sm mb-6">
          点击源站开关模拟故障，然后点击"发送请求"——Load Balancer 会自动把流量切走，保证服务不中断。
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {ORIGINS.map(origin => {
            const isHealthy = originHealth[origin.id] === 'healthy';
            const isActive = activeOrigin === origin.id;
            return (
              <div key={origin.id}
                className={`p-4 rounded-xl border-2 transition-all ${isActive && isHealthy ? 'border-emerald-500 bg-emerald-900/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : isHealthy ? 'border-gray-600 bg-black/30' : 'border-red-500 bg-red-900/10 opacity-60 grayscale'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-white">{origin.label}</span>
                  <button onClick={() => toggleHealth(origin.id)}
                    className={`px-2 py-0.5 text-xs rounded-full font-bold border transition-all ${isHealthy ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' : 'bg-red-900/30 border-red-500 text-red-300'}`}>
                    {isHealthy ? '● 健康' : '✕ 故障'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={20} className={isHealthy ? 'text-gray-300' : 'text-gray-600'} />
                  <div>
                    <p className="text-xs text-gray-400">{origin.ip}</p>
                    {isActive && isHealthy && <p className="text-xs text-emerald-400 font-bold">← 当前接收流量</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button onClick={simulateRequest}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_12px_rgba(59,130,246,0.4)] flex items-center gap-2">
            <RefreshCw size={16}/> 发送一个 HTTP 请求
          </button>
          <span className="text-xs text-gray-500">💡 点击源站状态按钮模拟故障，再发请求观察路由变化</span>
        </div>

        <div ref={logRef} className="bg-black/50 border border-gray-700 rounded-xl h-32 overflow-y-auto p-3 space-y-1 font-mono text-xs">
          {requestLog.length === 0 && <p className="text-gray-600 text-center mt-8">等待请求...</p>}
          {requestLog.map((log, i) => (
            <p key={i} className={log.type === 'error' ? 'text-red-400' : 'text-emerald-300'}>
              [{String(log.n).padStart(3, '0')}] {log.msg}
            </p>
          ))}
        </div>
      </section>

      {/* LB Features */}
      <section className="lesson-section mt-8">
        <h3 className="mb-4">🏗️ 负载均衡核心能力矩阵</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: '主动健康检查', icon: '🩺', desc: 'Cloudflare 每隔 N 秒主动向每个源站发送 HTTP(S) 探针。连续 X 次失败则自动摘除该源站，故障切换时间 < 30 秒。', tag: '核心能力' },
            { title: '地域路由 (Geo-Steering)', icon: '🌍', desc: '亚太访客路由到新加坡源站，欧洲访客路由到法兰克福源站，降低跨洲延迟 60%+。配合 Argo 可进一步优化骨干网路径。', tag: '性能提升' },
            { title: 'Session Affinity 会话粘性', icon: '🍪', desc: '基于 Cookie 将同一用户的请求始终路由到同一源站，避免登录状态在多源站间丢失（无状态架构不需要此功能）。', tag: '有状态应用' },
            { title: 'Always Online™', icon: '💾', desc: 'Cloudflare 缓存了你网站的静态页面快照。当所有源站都挂掉时，自动提供降级版本，保证用户至少能看到内容，而不是白屏。', tag: '应急保障' },
          ].map((item, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.2rem' }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white flex items-center gap-2"><span>{item.icon}</span>{item.title}</h4>
                <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{item.tag}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waiting Room Simulator */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-2">🎟️ Waiting Room 排队等候室模拟器</h3>
        <p className="text-gray-400 text-sm mb-5">
          演唱会票务开抢、电商大促秒杀——突发流量可在秒级内将源站打垮。Waiting Room 将"超出容量"的访客放入虚拟排队，保护源站的同时让用户知道自己还要等多久。
        </p>

        <div className="max-w-lg mx-auto">
          {!wrActive ? (
            <div className="text-center">
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-8 mb-4">
                <div className="text-5xl mb-4">🎵</div>
                <h4 className="text-xl font-bold text-white mb-2">周杰伦世界巡回演唱会</h4>
                <p className="text-gray-400 text-sm mb-6">门票于 20:00 准时开售，预计千万人同时涌入...</p>
                <button onClick={enterQueue}
                  className="bg-orange-500 hover:bg-orange-400 font-bold px-8 py-3 rounded-xl text-white transition-all shadow-[0_0_15px_rgba(245,130,32,0.5)]">
                  🚀 立即抢票（模拟流量洪峰）
                </button>
              </div>
            </div>
          ) : admitted ? (
            <div className="text-center bg-emerald-900/20 border-2 border-emerald-500 rounded-2xl p-8">
              <div className="text-5xl mb-4">🎉</div>
              <h4 className="text-xl font-bold text-emerald-400 mb-2">恭喜！您已进入购票页面</h4>
              <p className="text-gray-300 text-sm mb-4">Waiting Room 检测到当前容量有余量，已放行您进入系统。源站始终保持健康状态，服务未受影响。</p>
              <button onClick={resetWr} className="text-sm text-gray-500 underline">重新体验</button>
            </div>
          ) : (
            <div className="bg-white text-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⏳</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-1">您正在排队候场</h4>
                <p className="text-gray-500 text-sm">系统繁忙，当前访问人数过多，请稍候</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={18}/>
                    <span className="font-medium">您前方还有</span>
                  </div>
                  <span className="text-3xl font-black text-orange-500">{Math.max(0, queuePos).toLocaleString()} 人</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((2847 - queuePos) / 2847) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={14}/> 预计等待约 {Math.ceil(queuePos / 50)} 分钟</span>
                  <span>当前排队总人数：{queueTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                Protected by <strong>Cloudflare Waiting Room</strong> | 页面每 10 秒自动更新
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/cloudflare-mastery/lesson/network')}>
          高可用拿下！最终篇：Magic 企业网络与邮件安全
        </button>
      </section>
    </div>
  );
}
