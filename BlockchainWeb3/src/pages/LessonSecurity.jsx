import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ATTACKS = [
  {
    name: '重入攻击 (Reentrancy)',
    severity: 'Critical',
    icon: '🔄',
    color: '#ef4444',
    loss: '$60M（The DAO，以太坊最大hack）',
    steps: [
      '攻击者部署恶意合约，其 receive() 函数会反复调用受害合约的 withdraw()',
      '受害合约先执行 call.value(amount)，将控制权交给攻击者合约',
      '攻击者的 receive() 立刻再次调用 withdraw()（此时余额还没清零！）',
      '循环递归直到 gasLimit，每次都能取出余额。The DAO 损失 360万 ETH',
    ],
    fix: '① CEI 模式（先改状态再互动）② nonReentrant 修饰符 ③ ReentrancyGuard',
  },
  {
    name: '闪电贷攻击 (Flash Loan)',
    severity: 'Critical',
    icon: '⚡',
    color: '#f97316',
    loss: '$200M（Euler Finance, 2023）',
    steps: [
      '从 AAVE 无抵押借出巨额资金（单笔可达数亿美元）',
      '用大量资金操纵 DEX 价格（如将 token 价格暴涨10倍）',
      '利用另一个协议的价格预言机（依赖 spot price）触发套利或清算',
      '获利后还款，整个过程在一个区块内完成，不需要抵押品',
    ],
    fix: '① 使用 TWAP（时间加权均价）而非 spot price ② Chainlink 预言机 ③ 添加价格偏差限制',
  },
  {
    name: '访问控制漏洞',
    severity: 'High',
    icon: '🔓',
    color: '#eab308',
    loss: '$326M（Wormhole Bridge, 2022）',
    steps: [
      '合约的关键函数（如 mint、withdraw）没有访问限制',
      '攻击者直接调用 mint(attacker, 1000000) 铸造大量代币',
      '或修改关键参数（owner address、fee recipient）',
      'tx.origin 代替 msg.sender 导致钓鱼攻击（调用链被劫持）',
    ],
    fix: '① OpenZeppelin Ownable/AccessControl ② 多签（Multisig）② 时间锁（Timelock）',
  },
  {
    name: '整数溢出/截断',
    severity: 'High',
    icon: '🔢',
    color: '#a78bfa',
    loss: 'BEC Token: 2^256 枚代币凭空出现（2018）',
    steps: [
      'Solidity 0.8之前：uint256 加法超过最大值回绕到0（上溢）',
      'uint256(0) - 1 = 2^256 - 1（下溢）',
      '攻击者利用下溢使余额变为天文数字',
      'Solidity 0.8+ 默认检查（checked arithmetic），但 unchecked{} 块需小心',
    ],
    fix: '① Solidity 0.8+ 默认 checked ② 旧版使用 SafeMath ③ 谨慎使用 unchecked{}',
  },
];

function AttackAnimator() {
  const [activeAttack, setActiveAttack] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const atk = ATTACKS[activeAttack];

  const runAnimation = () => {
    if (running) return;
    setRunning(true);
    setCurrentStep(-1);
    atk.steps.forEach((_, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        if (i === atk.steps.length - 1) setRunning(false);
      }, (i + 1) * 1200);
    });
  };

  const reset = () => { setCurrentStep(-1); setRunning(false); };

  return (
    <div className="w3-interactive">
      <h3>💥 智能合约攻击路径动画（点击「演示攻击」逐步展示）</h3>

      {/* 攻击类型选择 */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {ATTACKS.map((a, i) => (
          <button key={i} onClick={() => { setActiveAttack(i); reset(); }}
            style={{ flex: 1, minWidth: 140, padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              border: `1px solid ${activeAttack === i ? a.color + '60' : 'rgba(255,255,255,0.07)'}`,
              background: activeAttack === i ? `${a.color}10` : 'rgba(255,255,255,0.02)',
              color: activeAttack === i ? a.color : '#64748b', fontWeight: 700, fontSize: '0.75rem' }}>
            <div>{a.icon} {a.name.split(' ')[0]}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 400, marginTop: '0.1rem', color: a.severity === 'Critical' ? '#ef4444' : '#f59e0b' }}>{a.severity}</div>
          </button>
        ))}
      </div>

      {/* 攻击信息 */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.2rem' }}>{atk.icon}</span>
        <span style={{ fontWeight: 800, color: atk.color, fontSize: '0.9rem' }}>{atk.name}</span>
        <span className="w3-tag red">{atk.severity}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#ef4444', marginLeft: 'auto' }}>损失: {atk.loss}</span>
      </div>

      {/* 步骤动画 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.625rem' }}>
        {atk.steps.map((step, si) => (
          <div key={si} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', padding: '0.4rem 0.625rem', borderRadius: '7px', transition: 'all 0.4s',
            background: currentStep === si ? `${atk.color}12` : currentStep > si ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
            border: `1px solid ${currentStep === si ? atk.color + '40' : 'rgba(255,255,255,0.04)'}` }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800,
              background: currentStep === si ? atk.color : currentStep > si ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: `1.5px solid ${currentStep >= si ? atk.color : 'rgba(255,255,255,0.1)'}`,
              color: currentStep === si ? '#fff' : currentStep > si ? '#64748b' : '#334155' }}>
              {si + 1}
            </div>
            <div style={{ fontSize: '0.78rem', color: currentStep === si ? atk.color : currentStep > si ? '#94a3b8' : '#334155', lineHeight: 1.6, transition: 'all 0.3s' }}>{step}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="w3-btn red" onClick={runAnimation} disabled={running} style={{ fontSize: '0.8rem' }}>💥 演示攻击</button>
        <button className="w3-btn" onClick={reset} style={{ fontSize: '0.8rem' }}>↺ 重置</button>
        <div style={{ flex: 1, fontSize: '0.72rem', color: '#10b981' }}>🛡️ 修复: {atk.fix}</div>
      </div>
    </div>
  );
}

const AUDIT_CHECKLIST = [
  { category: '访问控制', checks: ['onlyOwner/onlyRole 保护敏感函数', '不使用 tx.origin 做鉴权', '初始化函数只能调用一次（initializer）', '多签或时间锁保护 Owner 转让'] },
  { category: '重入防护', checks: ['遵循 CEI 模式（Check-Effect-Interaction）', 'nonReentrant 修饰符', '避免低级 call 返回后的状态依赖', 'Pull而非Push支付模式'] },
  { category: '算术安全', checks: ['Solidity 0.8+ 默认检查（建议使用）', 'unchecked{} 块只用于确定不溢出场景', '除法截断：先乘后除减少精度损失', '无限精度要求用 Fixed-point 库'] },
  { category: '预言机', checks: ['不使用 spot price（可被操控）', '使用 Chainlink TWAP 价格', '添加价格偏差保护（如±5%）', '多来源预言机聚合'] },
];

export default function LessonSecurity() {
  const navigate = useNavigate();

  return (
    <div className="lesson-w3">
      <div className="w3-badge red">🔒 module_05 — 智能合约安全</div>
      <div className="w3-hero">
        <h1>智能合约安全：重入攻击 / 闪电贷 / 访问控制审计</h1>
        <p>智能合约一旦部署无法修改，安全漏洞往往意味着<strong>资产永久损失</strong>。仅 2022 年 DeFi hack 总损失超过 36 亿美元。掌握常见攻击向量和审计清单是每个 Solidity 工程师的必修课。</p>
      </div>

      <AttackAnimator />

      <div className="w3-section">
        <h2 className="w3-section-title">✅ 智能合约安全审计清单</h2>
        <div className="w3-grid-2">
          {AUDIT_CHECKLIST.map(c => (
            <div key={c.category} className="w3-card">
              <div style={{ fontWeight: 800, color: '#a78bfa', fontSize: '0.88rem', marginBottom: '0.5rem' }}>{c.category}</div>
              {c.checks.map(ch => (
                <div key={ch} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>{ch}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/nft')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/oracle')}>下一模块：Oracle & 存储 →</button>
      </div>
    </div>
  );
}
