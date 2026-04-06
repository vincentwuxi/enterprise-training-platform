import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 区块链可视化：每个区块头
const GENESIS_CHAIN = [
  { height: 0,   hash: '0x0000...dead', prev: '0x0000...0000', tx: 0,   nonce: 0,        miner: 'Genesis' },
  { height: 1,   hash: '0x3a4f...8bc1', prev: '0x0000...dead', tx: 12,  nonce: 83721,   miner: '0xF23d...' },
  { height: 2,   hash: '0x7e21...ac02', prev: '0x3a4f...8bc1', tx: 47,  nonce: 201934,  miner: '0xA19e...' },
  { height: 3,   hash: '0xb8f0...3e7d', prev: '0x7e21...ac02', tx: 89,  nonce: 574012,  miner: '0xC02a...' },
];

function BlockchainVisual() {
  const [activeBlock, setActiveBlock] = useState(null);
  return (
    <div className="w3-interactive">
      <h3>⛓️ 区块链结构可视化（点击区块查看详情）</h3>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {GENESIS_CHAIN.map((block, i) => (
          <React.Fragment key={i}>
            <div onClick={() => setActiveBlock(activeBlock === i ? null : i)}
              style={{ flexShrink: 0, width: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                background: activeBlock === i ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
                border: `1.5px solid ${activeBlock === i ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
              <div style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.2rem' }}>Block #{block.height}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#a78bfa', wordBreak: 'break-all', lineHeight: 1.4 }}>{block.hash}</div>
              <div style={{ fontSize: '0.58rem', color: '#334155', marginTop: '0.3rem' }}>{block.tx} txns · Nonce: {block.nonce}</div>
            </div>
            {i < GENESIS_CHAIN.length - 1 && (
              <div style={{ color: '#7c3aed', fontSize: '1.2rem', flexShrink: 0 }}>←</div>
            )}
          </React.Fragment>
        ))}
        {/* 待确认区块 */}
        <div style={{ color: '#7c3aed', fontSize: '1.2rem', flexShrink: 0 }}>←</div>
        <div className="w3-pulse" style={{ flexShrink: 0, width: 130, padding: '0.75rem', borderRadius: '10px', border: '1.5px dashed rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.04)' }}>
          <div style={{ fontSize: '0.62rem', color: '#f97316', fontFamily: 'JetBrains Mono' }}>Pending...</div>
          <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: '0.3rem' }}>等待矿工打包</div>
        </div>
      </div>

      {activeBlock !== null && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 800, color: '#a78bfa', marginBottom: '0.45rem', fontSize: '0.85rem' }}>Block #{GENESIS_CHAIN[activeBlock].height} 详情</div>
          {[
            ['Block Hash（当前块哈希）', GENESIS_CHAIN[activeBlock].hash, '#10b981'],
            ['Parent Hash（父块哈希）', GENESIS_CHAIN[activeBlock].prev, '#60a5fa'],
            ['Transactions Count', GENESIS_CHAIN[activeBlock].tx + ' 笔交易', '#f97316'],
            ['Nonce（工作量证明）', GENESIS_CHAIN[activeBlock].nonce.toString(), '#eab308'],
            ['Miner（矿工地址）', GENESIS_CHAIN[activeBlock].miner, '#a78bfa'],
          ].map(([k, v, c]) => (
            <div key={k} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#475569', minWidth: 180 }}>{k}:</span>
              <span style={{ fontSize: '0.72rem', color: c, fontFamily: 'JetBrains Mono' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.4rem', fontSize: '0.68rem', color: '#475569' }}>
            💡 更改任意字段 → Hash 完全改变（SHA-256 雪崩效应）→ 后续所有区块 hash 连锁失效 → 链被破坏！
          </div>
        </div>
      )}
    </div>
  );
}

const CRYPTO_CONCEPTS = [
  { name: 'SHA-256 哈希', icon: '🔒', color: '#7c3aed', items: ['输入任意长度 → 固定256位输出', '单向函数：无法从哈希反推原文', '雪崩效应：输入1bit变化 → 输出约50% bit变化', 'PoW挖矿：找 nonce 使 Hash < target'] },
  { name: '非对称加密/签名', icon: '🔑', color: '#10b981', items: ['私钥(256位随机数) → 公钥(EC点乘) → 地址(Hash)', '私钥签名 tx → 任何人用公钥验签', '丢失私钥 = 永久失去资产（无找回机制）', '以太坊用 secp256k1 椭圆曲线'] },
  { name: 'Merkle 树', icon: '🌳', color: '#3b82f6', items: ['所有交易的哈希构成二叉 Merkle 树', 'Merkle Root 存入区块头（32字节）', 'SPV 轻节点：不下载全部 tx，只需 Merkle Proof', '1000笔交易 → 只需 log₂(1000)≈10 个哈希验证'] },
  { name: '共识机制', icon: '🤝', color: '#f97316', items: ['PoW(比特币)：算力竞争，耗能巨大', 'PoS(以太坊Merge后)：质押ETH，按份额出块', 'DPoS：投票选出21个超级节点(EOS)', 'Finality：LMD-GHOST + Casper FFG 2/3确认'] },
];

const ACCOUNT_TYPES = [
  { name: 'EOA（外部账户）', desc: '由私钥控制。发送交易需要私钥签名。有 ETH 余额，没有合约代码。MetaMask 钱包就是管理 EOA。', icon: '👤', color: '#10b981' },
  { name: 'CA（合约账户）', desc: '由合约代码控制。没有私钥。被 EOA 的交易调用时自动执行 EVM 字节码。有自己的 ETH 余额和 Storage。', icon: '📜', color: '#7c3aed' },
];

export default function LessonFoundation() {
  const navigate = useNavigate();
  return (
    <div className="lesson-w3">
      <div className="w3-badge">⛓️ module_01 — 区块链基础</div>
      <div className="w3-hero">
        <h1>区块链基础：密码学 / 共识 / 以太坊账户模型</h1>
        <p>区块链 = 用<strong>密码学</strong>链接的分布式账本。每个区块通过父块哈希链形成不可篡改的链结构。以太坊在此基础上增加<strong>图灵完备的智能合约</strong>，开创了可编程货币时代。</p>
      </div>

      <BlockchainVisual />

      <div className="w3-section">
        <h2 className="w3-section-title">🔐 四大密码学基础</h2>
        <div className="w3-grid-2">
          {CRYPTO_CONCEPTS.map(c => (
            <div key={c.name} className="w3-card" style={{ borderColor: `${c.color}20` }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                <span style={{ fontWeight: 800, color: c.color, fontSize: '0.88rem' }}>{c.name}</span>
              </div>
              {c.items.map(it => <div key={it} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.18rem' }}>▸ {it}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="w3-section">
        <h2 className="w3-section-title">🏦 以太坊两类账户</h2>
        <div className="w3-grid-2">
          {ACCOUNT_TYPES.map(a => (
            <div key={a.name} className="w3-card" style={{ borderColor: `${a.color}25` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{a.icon}</div>
              <div style={{ fontWeight: 800, color: a.color, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{a.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.75 }}>{a.desc}</div>
            </div>
          ))}
        </div>

        <div className="w3-card" style={{ marginTop: '0.75rem' }}>
          <div style={{ fontWeight: 700, color: '#e0d4ff', marginBottom: '0.5rem', fontSize: '0.88rem' }}>📊 以太坊 Gas 机制</div>
          <div className="w3-grid-3">
            {[
              ['Gas Limit', '21,000 (简单转账) / 200,000+ (合约)', '#60a5fa'],
              ['Base Fee', 'EIP-1559：动态调整，全部销毁 🔥', '#ef4444'],
              ['Priority Fee', '给矿工的小费（Tip），加速交易', '#10b981'],
              ['Gas Price', 'Base Fee + Tip（单位 Gwei，1 ETH = 1e9 Gwei）', '#f97316'],
              ['EIP-1559', 'Gas 费用可预测，防止 Gas 战争', '#7c3aed'],
              ['EVM 执行', 'SSTORE=20000 / ADD=3 / SHA3=30 gas', '#eab308'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ padding: '0.5rem 0.625rem', background: 'rgba(255,255,255,0.02)', borderRadius: '7px', border: `1px solid rgba(255,255,255,0.05)` }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: c, marginBottom: '0.15rem' }}>{k}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w3-nav">
        <div />
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/solidity')}>下一模块：Solidity 合约 →</button>
      </div>
    </div>
  );
}
