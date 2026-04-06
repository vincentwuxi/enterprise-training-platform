import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Cache 模拟器
const CACHE_SIZE = 8;
const ASSOC = 2; // 2路组相联

function CacheSimulator() {
  // 4组，每组2路（2-way set associative, 8 blocks total）
  const SETS = 4;
  const [cache, setCache] = useState(
    Array.from({ length: SETS }, () => Array.from({ length: ASSOC }, () => ({ tag: null, valid: false, lru: 0 })))
  );
  const [history, setHistory] = useState([]);
  const [addr, setAddr] = useState('');
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [lastResult, setLastResult] = useState(null);

  const accessAddr = (addrInput) => {
    const num = parseInt(addrInput, 16);
    if (isNaN(num) || num < 0) return;

    const blockSize = 4;        // 4 bytes per block
    const blockAddr = num >> 2; // divide by 4
    const setIdx = blockAddr % SETS;
    const tag = Math.floor(blockAddr / SETS);

    let hit = false;
    let hitWay = -1;

    const newCache = cache.map(s => s.map(w => ({ ...w })));

    // Check hit
    for (let way = 0; way < ASSOC; way++) {
      if (newCache[setIdx][way].valid && newCache[setIdx][way].tag === tag) {
        hit = true; hitWay = way;
        break;
      }
    }

    if (hit) {
      // Update LRU
      const hitLRU = newCache[setIdx][hitWay].lru;
      for (let w = 0; w < ASSOC; w++) {
        if (newCache[setIdx][w].valid && newCache[setIdx][w].lru < hitLRU) {
          newCache[setIdx][w].lru++;
        }
      }
      newCache[setIdx][hitWay].lru = 0;
      setStats(s => ({ ...s, hits: s.hits + 1 }));
    } else {
      // Find LRU or invalid way to evict
      let evictWay = newCache[setIdx].findIndex(w => !w.valid);
      if (evictWay === -1) {
        evictWay = newCache[setIdx].reduce((m, w, i) => w.lru > newCache[setIdx][m].lru ? i : m, 0);
      }
      // Update all LRUs
      for (let w = 0; w < ASSOC; w++) {
        if (newCache[setIdx][w].valid) newCache[setIdx][w].lru++;
      }
      newCache[setIdx][evictWay] = { tag, valid: true, lru: 0, new: true };
      setStats(s => ({ ...s, misses: s.misses + 1 }));
    }

    const result = { addr: addrInput, hex: `0x${num.toString(16).toUpperCase().padStart(4,'0')}`, setIdx, tag, hit };
    setLastResult(result);
    setHistory(h => [...h.slice(-6), result]);
    setCache(newCache);
  };

  const reset = () => {
    setCache(Array.from({ length: SETS }, () => Array.from({ length: ASSOC }, () => ({ tag: null, valid: false, lru: 0 }))));
    setHistory([]);
    setStats({ hits: 0, misses: 0 });
    setLastResult(null);
    setAddr('');
  };

  const quickAccess = (addrs) => { addrs.forEach((a, i) => setTimeout(() => accessAddr(a.toString(16)), i * 300)); };

  const total = stats.hits + stats.misses;
  const hitRate = total > 0 ? (stats.hits / total * 100).toFixed(1) : '0.0';

  return (
    <div className="ca-interactive">
      <h3>💾 Cache 命中/缺失模拟器（2路组相联，4组）
        <button className="ca-btn red" onClick={reset}>↺ 重置</button>
      </h3>

      {/* 输入区 */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center' }}>
        <input value={addr} onChange={e => setAddr(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0,4))}
          onKeyDown={e => e.key === 'Enter' && accessAddr(addr)}
          placeholder="十六进制地址 (e.g. 04)"
          style={{ flex: 1, minWidth: 160, padding: '0.5rem 0.75rem', background: '#0d0f0a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '7px', color: '#fbbf24', fontFamily: 'JetBrains Mono', fontSize: '0.82rem', outline: 'none' }} />
        <button className="ca-btn primary" onClick={() => accessAddr(addr)}>访问</button>
        <button className="ca-btn" style={{ fontSize: '0.72rem' }} onClick={() => quickAccess([0,4,8,0,4,0xC,0])}>演示序列</button>
      </div>

      {/* 命中率 */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.625rem' }}>
        {[['命中', stats.hits, '#22c55e'], ['缺失', stats.misses, '#ef4444'], ['命中率', hitRate + '%', '#f59e0b']].map(([l, v, c]) => (
          <div key={l} style={{ padding: '0.3rem 0.625rem', background: `${c}08`, border: `1px solid ${c}25`, borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{l}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: c, fontSize: '0.9rem' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Cache 内容 */}
      <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
        <table className="ca-table" style={{ fontSize: '0.72rem' }}>
          <thead>
            <tr>
              <th>Set</th>
              <th>Way 0</th>
              <th>LRU</th>
              <th>Way 1</th>
              <th>LRU</th>
            </tr>
          </thead>
          <tbody>
            {cache.map((set, si) => {
              const isActive = lastResult && lastResult.setIdx === si;
              return (
                <tr key={si} style={{ background: isActive ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: isActive ? '#fbbf24' : '#475569' }}>Set {si}</td>
                  {set.map((way, wi) => {
                    const isHit = isActive && lastResult.hit && way.tag === lastResult.tag;
                    const isNew = isActive && !lastResult.hit && way.new;
                    return (
                      <React.Fragment key={wi}>
                        <td style={{ color: isHit ? '#22c55e' : isNew ? '#f59e0b' : way.valid ? '#94a3b8' : '#334155', fontFamily: 'JetBrains Mono', fontWeight: (isHit || isNew) ? 800 : 400, transition: 'all 0.3s' }}>
                          {way.valid ? `Tag:${way.tag.toString(16).toUpperCase().padStart(2,'0')}` : '—'}
                          {isHit && ' ✅'}{isNew && ' 🆕'}
                        </td>
                        <td style={{ color: '#334155', fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}>{way.valid ? way.lru : '—'}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {history.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {history.map((h, i) => (
            <span key={i} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '0.65rem', fontWeight: 700,
              background: h.hit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: h.hit ? '#22c55e' : '#ef4444' }}>
              {h.hex} {h.hit ? 'HIT' : 'MISS'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const HIERARCHY = [
  { name: 'L1 Cache', size: '32KB~64KB', latency: '4 周期 (~1ns)', bw: '1TB/s', tech: 'SRAM 6T', color: '#f59e0b' },
  { name: 'L2 Cache', size: '256KB~1MB', latency: '12 周期 (~4ns)', bw: '500GB/s', tech: 'SRAM 6T', color: '#22c55e' },
  { name: 'L3 Cache', size: '8MB~64MB', latency: '40~50周期 (~15ns)', bw: '200GB/s', tech: 'SRAM 共享', color: '#3b82f6' },
  { name: 'DRAM (主存)', size: '8GB~256GB', latency: '100~300周期 (~70ns)', bw: '50GB/s', tech: 'DRAM 1T1C', color: '#a855f7' },
  { name: 'NVMe SSD', size: '256GB~8TB', latency: '25,000 周期 (~10μs)', bw: '7GB/s', tech: 'NAND Flash', color: '#ef4444' },
];

const REPLACE_ALGOS = [
  { name: 'LRU (最近最少使用)', pros: '命中率高，最符合局部性原理', cons: '需要精确时间戳或链表，硬件实现成本高', used: 'CPU L1/L2 Cache（硬件近似LRU）' },
  { name: 'FIFO (先进先出)', pros: '实现简单，只需指针', cons: 'Belady异常：增加 Cache 容量反而缺失率更高！', used: 'TLB 的某些实现' },
  { name: '随机替换', pros: '实现最简单（LFSR生成随机数）', cons: '不利用局部性，平均性能低', used: 'ARM架构的某些 Cache' },
  { name: 'LFU (最不常用)', pros: '统计频率，保留热点数据', cons: '新数据不公平，需要计数器，老数据永不淘汰', used: 'Redis eviction / CDN缓存' },
];

export default function LessonCache() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ca">
      <div className="ca-badge purple">💾 module_05 — Cache 层次结构</div>
      <div className="ca-hero">
        <h1>Cache 层次结构：命中/缺失 / 替换策略 / 一致性</h1>
        <p>CPU 和内存之间存在 <strong>100 倍的速度鸿沟</strong>。Cache 利用程序的局部性原理——时间局部性（近期用过的很快还会再用）和空间局部性（用了 A，A 周围的数据也会被用）——填补这一鸿沟。</p>
      </div>

      <CacheSimulator />

      {/* 存储层次 */}
      <div className="ca-section">
        <h2 className="ca-section-title">🏔️ 存储层次结构（越向上越快越贵越小）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.875rem' }}>
          {HIERARCHY.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: '8px', border: `1px solid ${h.color}20`, background: `${h.color}05`, width: `${100 - i * 12}%` }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: h.color, minWidth: 110, fontSize: '0.78rem' }}>{h.name}</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                {[['容量', h.size], ['延迟', h.latency], ['带宽', h.bw], ['工艺', h.tech]].map(([k, v]) => (
                  <div key={k} style={{ fontSize: '0.68rem' }}>
                    <span style={{ color: '#334155' }}>{k}:</span> <span style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 替换策略 */}
      <div className="ca-section">
        <h2 className="ca-section-title">🔄 Cache 替换策略对比</h2>
        <div className="ca-grid-2">
          {REPLACE_ALGOS.map(a => (
            <div key={a.name} className="ca-card" style={{ padding: '0.875rem' }}>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.82rem', marginBottom: '0.35rem' }}>{a.name}</div>
              <div style={{ fontSize: '0.73rem', color: '#22c55e', marginBottom: '0.2rem' }}>✅ {a.pros}</div>
              <div style={{ fontSize: '0.73rem', color: '#f87171', marginBottom: '0.2rem' }}>❌ {a.cons}</div>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'JetBrains Mono' }}>Used: {a.used}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ca-nav">
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/pipeline')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/memory')}>下一模块：虚拟内存 →</button>
      </div>
    </div>
  );
}
