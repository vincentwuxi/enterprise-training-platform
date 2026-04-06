import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const L2_SOLUTIONS = [
  {
    name: 'Optimistic Rollup', icon: '🟠', color: '#f97316',
    tps: '2,000+', latency: '~7天提款', cost: '~90% 节省',
    projects: ['Optimism', 'Arbitrum', 'Base'],
    mechanism: 'Fraud Proof（欺诈证明）',
    desc: '假定所有 tx 合法，只有发现欺诈时才提交证明。7 天挑战期内任何人可挑战。简单实现，EVM 完全兼容。',
  },
  {
    name: 'ZK-Rollup', icon: '🔮', color: '#7c3aed',
    tps: '10,000+', latency: '~分钟级', cost: '~95% 节省',
    projects: ['zkSync', 'Polygon zkEVM', 'Scroll', 'StarkNet'],
    mechanism: 'Validity Proof（有效性证明）',
    desc: '每批次生成零知识证明（ZK-SNARK/STARK），L1 验证后立即最终确认。无需等待期，安全性由密码学保证。',
  },
  {
    name: 'State Channel', icon: '⚡', color: '#10b981',
    tps: '无限（链下）', latency: '即时', cost: '极低（仅开/关通道时上链）',
    projects: ['Lightning Network（BTC）', 'Raiden', 'Connext'],
    mechanism: '离链签名状态机',
    desc: '两方之间开通通道，在链下直接交换签名状态，最后结算到链上。极适合高频微支付（如游戏内购、流媒体按秒付费）。',
  },
  {
    name: 'Validium', icon: '🗂️', color: '#eab308',
    tps: '20,000+', latency: '~分钟级', cost: '最低（数据不上链）',
    projects: ['StarkEx（dYdX v3）', 'Immutable X', 'DeGate'],
    mechanism: 'ZK Proof + 链下数据',
    desc: '类似ZK-Rollup但数据不上传L1（只放证明）。吞吐量极高但数据可用性依赖链下委员会，安全性低于完全Rollup。',
  },
];

// L1 vs L2 吞吐量对比可视化
const CHAINS = [
  { name: 'Bitcoin L1', tps: 7, color: '#f97316', max: 50000 },
  { name: 'Ethereum L1', tps: 15, color: '#7c3aed', max: 50000 },
  { name: 'Optimism', tps: 2000, color: '#ef4444', max: 50000 },
  { name: 'Arbitrum', tps: 4000, color: '#3b82f6', max: 50000 },
  { name: 'zkSync Era', tps: 10000, color: '#10b981', max: 50000 },
  { name: 'StarkNet', tps: 25000, color: '#eab308', max: 50000 },
  { name: 'Visa (参考)', tps: 24000, color: '#64748b', max: 50000 },
];

function ThroughputChart() {
  return (
    <div className="w3-interactive">
      <h3>⚡ L1 vs L2 吞吐量对比（TPS）</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {CHAINS.map(chain => (
          <div key={chain.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ minWidth: 110, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>{chain.name}</div>
            <div style={{ flex: 1 }}>
              <div className="w3-progress">
                <div className="w3-progress-fill" style={{ width: `${Math.log(chain.tps + 1) / Math.log(chain.max + 1) * 100}%`, background: chain.color }} />
              </div>
            </div>
            <div style={{ minWidth: 70, fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 800, color: chain.color, textAlign: 'right' }}>
              {chain.tps.toLocaleString()} TPS
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.625rem', fontSize: '0.68rem', color: '#475569' }}>
        💡 L2 将交易批量打包后只在 L1 提交一次结算，安全性继承 Ethereum，成本降低 90%+
      </div>
    </div>
  );
}

const LAYER2_CODE = `// ZK-Rollup 核心原理（以 zkSync / Scroll 为例）

// ── 1. 用户提交交易到 L2 Sequencer ──
// 用户在 L2 发起 transfer(bob, 100 USDC)
// L2 节点验证签名，更新本地状态树（Merkle Tree）

// ── 2. Sequencer 批量打包（Batch）──
// 每隔几分钟/几百笔交易 → 打包成一个 Batch
// Batch 包含：
//   - 所有压缩交易数据（calldata，供数据可用性）
//   - 旧的 State Root（Merkle Root）
//   - 新的 State Root（执行后）

// ── 3. Prover 生成 ZK 证明 ──
// 使用 ZK-SNARK/STARK 证明：
// "我知道一系列 txs，使得执行它们后
//  状态树从 oldRoot 变为 newRoot"
// 证明大小：~几百字节（与批次大小无关！）

// ── 4. Verifier 合约在 L1 验证 ──
pragma solidity ^0.8.20;
contract ZKVerifier {
    bytes32 public latestStateRoot;
    
    function submitBatch(
        bytes32 newRoot,
        bytes calldata proof,        // ZK 证明（~1KB）
        bytes calldata pubInputs     // 公共输入（旧Root+新Root）
    ) external {
        // 在链上验证 ZK 证明（约 300K gas）
        require(
            verifyProof(proof, pubInputs),
            "Invalid ZK proof"
        );
        // 更新状态根（整批数千笔交易一起确认！）
        latestStateRoot = newRoot;
        emit BatchVerified(newRoot, block.number);
    }
}

// ── L2 Bridge：跨链转账 ──
// 存款（L1 → L2，几分钟）：
// L1: lock(100 USDC) → L1 Bridge → 事件
// L2: Sequencer 监听事件 → mint(user, 100 USDC)

// 提款（L2 → L1）：
// Optimistic: 7 天等待期（任何人可挑战欺诈）
// ZK-Rollup:  几分钟（ZK 证明验证后立即）`;

export default function LessonLayer2() {
  const navigate = useNavigate();
  const [activeL2, setActiveL2] = useState(0);
  const sol = L2_SOLUTIONS[activeL2];

  return (
    <div className="lesson-w3">
      <div className="w3-badge gold">⚡ module_07 — Layer2 扩容</div>
      <div className="w3-hero">
        <h1>Layer2 扩容：Optimistic / ZK-Rollup / Bridge</h1>
        <p>以太坊 L1 只有 15 TPS，但<strong>Layer2</strong> 把大量计算移到链下，只把结果（和证明）提交 L1。Rollup 是目前最主流的 L2 方案，安全性继承以太坊，成本降低 90%+，TPS 提升百倍。</p>
      </div>

      <ThroughputChart />

      {/* L2 方案对比 */}
      <div className="w3-section">
        <h2 className="w3-section-title">🔮 四大 Layer2 方案</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {L2_SOLUTIONS.map((s, i) => (
            <button key={i} onClick={() => setActiveL2(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.625rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                border: `1px solid ${activeL2 === i ? s.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeL2 === i ? `${s.color}10` : 'rgba(255,255,255,0.02)',
                color: activeL2 === i ? s.color : '#64748b', fontWeight: 700, fontSize: '0.78rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{s.icon}</div>
              <div>{s.name}</div>
              <div style={{ fontSize: '0.6rem', color: '#334155', fontFamily: 'JetBrains Mono', marginTop: '0.1rem' }}>{s.tps} TPS</div>
            </button>
          ))}
        </div>

        <div className="w3-card" style={{ borderColor: `${sol.color}25` }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 900, color: sol.color, fontSize: '1rem', marginBottom: '0.35rem' }}>{sol.icon} {sol.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, marginBottom: '0.5rem' }}>{sol.desc}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[['机制', sol.mechanism, '#a78bfa'], ['TPS', sol.tps, '#10b981'], ['提款时间', sol.latency, '#f97316'], ['Gas 节省', sol.cost, '#eab308']].map(([k, v, c]) => (
                  <div key={k} style={{ padding: '0.25rem 0.5rem', background: `${c}08`, border: `1px solid ${c}20`, borderRadius: '5px' }}>
                    <div style={{ fontSize: '0.6rem', color: '#475569' }}>{k}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: c, fontFamily: 'JetBrains Mono' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>代表项目</div>
              {sol.projects.map(p => <div key={p} style={{ padding: '0.2rem 0.4rem', background: `${sol.color}06`, borderRadius: '4px', fontSize: '0.72rem', color: sol.color, marginBottom: '0.15rem', fontWeight: 600 }}>{p}</div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="w3-section">
        <h2 className="w3-section-title">🔬 ZK-Rollup 技术原理</h2>
        <div className="w3-code-wrap">
          <div className="w3-code-head"><div className="w3-code-dot" style={{ background: '#ef4444' }}/><div className="w3-code-dot" style={{ background: '#f97316' }}/><div className="w3-code-dot" style={{ background: '#7c3aed' }}/><span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>🔮 zk-rollup.sol</span></div>
          <div className="w3-code" style={{ fontSize: '0.74rem', maxHeight: 420, overflowY: 'auto' }}>{LAYER2_CODE}</div>
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/oracle')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/fullstack')}>下一模块：Web3 全栈 →</button>
      </div>
    </div>
  );
}
