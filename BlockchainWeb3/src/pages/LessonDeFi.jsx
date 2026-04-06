import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// AMM 恒定乘积做市商模拟器
// x * y = k
function AMMSimulator() {
  const [reserveX, setReserveX] = useState(1000);  // ETH
  const [reserveY, setReserveY] = useState(200000); // USDC
  const [inputAmt, setInputAmt] = useState(10);
  const [swapDir, setSwapDir] = useState('XtoY'); // ETH→USDC or USDC→ETH

  const k = reserveX * reserveY;
  const priceXinY = reserveY / reserveX;

  // 计算输出量（含手续费 0.3%）
  const FEE = 0.003;
  let outAmt = 0, priceImpact = 0, newRX = reserveX, newRY = reserveY;

  if (swapDir === 'XtoY') {
    const inAfterFee = inputAmt * (1 - FEE);
    newRX = reserveX + inAfterFee;
    newRY = k / newRX;
    outAmt = reserveY - newRY;
    const effectivePrice = outAmt / inputAmt;
    priceImpact = Math.abs((priceXinY - effectivePrice) / priceXinY * 100);
  } else {
    const inAfterFee = inputAmt * (1 - FEE);
    newRY = reserveY + inAfterFee;
    newRX = k / newRY;
    outAmt = reserveX - newRX;
    const effectivePrice = outAmt / inputAmt;
    const priceYinX = reserveX / reserveY;
    priceImpact = Math.abs((priceYinX - effectivePrice) / priceYinX * 100);
  }

  const liqPoints = [];
  const step = reserveX / 20;
  for (let x = step; x <= reserveX * 2; x += step) {
    liqPoints.push({ x: x / reserveX, y: k / x / reserveY });
  }

  // SVG dimensions
  const W = 260, H = 160, PAD = 24;
  const xScale = (W - PAD * 2);
  const yScale = (H - PAD * 2);

  const pathD = liqPoints.map((p, i) => {
    const sx = PAD + Math.min(p.x - 0.05, 1.9) / 2 * xScale;
    const sy = H - PAD - Math.min(1/p.y - 0.05, 1.9) / 2 * yScale;
    return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`;
  }).join(' ');

  // Current reserve dot
  const dotX = PAD + 0.5 * xScale;
  const dotY = H - PAD - 0.5 * yScale;
  const newDotX = PAD + Math.min((newRX/reserveX - 0.05) / 2, 0.95) * xScale;
  const newDotY = H - PAD - Math.min(((k/newRX)/reserveY - 0.05) / 2, 0.95) * yScale;

  return (
    <div className="w3-interactive">
      <h3>📈 Uniswap V2 AMM 恒定乘积模拟器 (x · y = k)
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>当前 k = {(k/1e6).toFixed(2)}M</span>
      </h3>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* 控制面板 */}
        <div style={{ flex: '0 0 260px' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>流动性池储备</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ flex: 1, padding: '0.375rem 0.5rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.6rem' }}>ETH</div>
                <div style={{ color: '#10b981', fontWeight: 800 }}>{reserveX.toLocaleString()}</div>
              </div>
              <div style={{ flex: 1, padding: '0.375rem 0.5rem', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.6rem' }}>USDC</div>
                <div style={{ color: '#60a5fa', fontWeight: 800 }}>{reserveY.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>ETH 价格: ${priceXinY.toFixed(2)}</div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>兑换方向</div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {[['XtoY', 'ETH → USDC'], ['YtoX', 'USDC → ETH']].map(([dir, lbl]) => (
                <button key={dir} onClick={() => setSwapDir(dir)}
                  style={{ flex: 1, padding: '0.3rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.15s',
                    border: `1px solid ${swapDir === dir ? '#f97316' : 'rgba(255,255,255,0.08)'}`,
                    background: swapDir === dir ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.02)',
                    color: swapDir === dir ? '#f97316' : '#64748b' }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
              投入数量 ({swapDir === 'XtoY' ? 'ETH' : 'USDC'})
            </div>
            <input type="range" min={1} max={swapDir === 'XtoY' ? 500 : 100000} value={inputAmt}
              onChange={e => setInputAmt(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7c3aed', marginBottom: '0.2rem' }} />
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#a78bfa', fontWeight: 800 }}>
              {inputAmt.toLocaleString()} {swapDir === 'XtoY' ? 'ETH' : 'USDC'}
            </div>
          </div>

          {/* 输出结果 */}
          <div style={{ padding: '0.5rem 0.625rem', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '7px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.15rem' }}>预计收到</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#10b981', fontSize: '0.9rem' }}>
              {outAmt > 0 ? outAmt.toFixed(swapDir === 'XtoY' ? 2 : 4) : '0'} {swapDir === 'XtoY' ? 'USDC' : 'ETH'}
            </div>
            <div style={{ fontSize: '0.65rem', color: priceImpact > 5 ? '#ef4444' : '#64748b', marginTop: '0.1rem', fontFamily: 'JetBrains Mono' }}>
              价格影响: {priceImpact.toFixed(2)}% {priceImpact > 5 ? '⚠️ 高滑点！' : ''}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#334155', marginTop: '0.05rem' }}>手续费: {(inputAmt * FEE).toFixed(4)} ({(FEE*100).toFixed(1)}%)</div>
          </div>
        </div>

        {/* 恒定乘积曲线 SVG */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.3rem', textAlign: 'center' }}>恒定乘积曲线 (x · y = k)</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
            <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD+5} stroke="#334155" strokeWidth={1} />
            <line x1={PAD-5} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#334155" strokeWidth={1} />
            <text x={PAD+2} y={H-PAD+15} fill="#334155" fontSize={7} fontFamily="JetBrains Mono">ETH</text>
            <text x={2} y={PAD+4} fill="#334155" fontSize={7} fontFamily="JetBrains Mono">USDC</text>

            <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth={1.5} opacity={0.7} />

            {/* 当前状态 */}
            <circle cx={dotX} cy={dotY} r={5} fill="#7c3aed" opacity={0.9} />
            <text x={dotX+7} y={dotY-4} fill="#a78bfa" fontSize={7} fontFamily="JetBrains Mono">Now</text>

            {/* 交换后状态 */}
            {outAmt > 0 && (
              <>
                <line x1={dotX} y1={dotY} x2={newDotX} y2={newDotY} stroke="#f97316" strokeWidth={1} strokeDasharray="3 2" />
                <circle cx={newDotX} cy={newDotY} r={4} fill="#f97316" opacity={0.9} />
                <text x={newDotX+6} y={newDotY+3} fill="#fb923c" fontSize={7} fontFamily="JetBrains Mono">After</text>
              </>
            )}
          </svg>
          <div style={{ fontSize: '0.65rem', color: '#334155', textAlign: 'center', marginTop: '0.2rem' }}>
            买入越多 ETH → 价格越贵（曲线越陡）= 价格影响
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFI_TOPICS = [
  {
    name: 'AMM & DEX', icon: '🔄', color: '#7c3aed',
    code: `// Uniswap V2 核心合约简化版

contract UniswapV2Pair {
    // 恒定乘积公式：x * y = k
    // 每笔交易收取 0.3% 手续费给 LP（流动性提供者）
    
    uint112 private reserve0;    // token0 储备量
    uint112 private reserve1;    // token1 储备量
    
    // 添加流动性（LP 获得份额代币）
    function mint(address to) external returns (uint256 liquidity) {
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - reserve0;
        uint256 amount1 = balance1 - reserve1;
        
        uint256 _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            // 首次添加：LP = sqrt(amount0 * amount1) - 1000（防攻击）
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
        } else {
            // 后续添加：按比例分配 LP Token
            liquidity = Math.min(
                amount0 * _totalSupply / reserve0,
                amount1 * _totalSupply / reserve1
            );
        }
        _mint(to, liquidity);
        _update(balance0, balance1);
    }
    
    // 兑换核心逻辑
    function swap(uint256 out0, uint256 out1, address to) external {
        // 验证 k 值不减小（保证 AMM 不被套利破坏）
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        // 含手续费验证：balance0_adj * balance1_adj >= k
        require(
            balance0 * 1000 - amount0In * 3) *
            balance1 * 1000 - amount1In * 3) >=
            reserve0 * reserve1 * 1000**2,
            "K invariant violated"
        );
    }
}`,
  },
  {
    name: '借贷协议（AAVE）', icon: '🏦', color: '#10b981',
    code: `// AAVE V3 核心借贷逻辑（简化）

contract LendingPool {
    // 每个资产的利率模型（动态）
    struct ReserveData {
        uint256 liquidityRate;   // 存款年化利率（APY）
        uint256 borrowRate;      // 借款年化利率
        uint256 utilizationRate; // 资金利用率 = borrowed / totalLiquidity
        address aToken;          // 存款凭证代币
    }
    
    // 存款（获得 aToken，利息自动累积）
    function supply(address asset, uint256 amount, address onBehalfOf) external {
        // 转移资产到 Pool
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        // 铸造 aToken（1:1 + 利息）
        IAToken(reserves[asset].aToken).mint(onBehalfOf, amount, liquidityIndex);
        emit Supply(asset, msg.sender, onBehalfOf, amount);
    }
    
    // 借款（需要有足够抵押品）
    function borrow(address asset, uint256 amount, address onBehalfOf) external {
        // 检查健康因子 > 1
        uint256 healthFactor = getUserHealthFactor(onBehalfOf);
        require(healthFactor >= 1e18, "Health factor below 1");
        
        // 铸造 debtToken（随时间增加的债务）
        IDebtToken(reserves[asset].debtToken).mint(onBehalfOf, amount, borrowIndex);
        IERC20(asset).transfer(msg.sender, amount);
    }
    
    // 清算（健康因子 < 1 时任何人可触发）
    function liquidate(address collateral, address debt, address user, uint256 debtAmount) external {
        uint256 hf = getUserHealthFactor(user);
        require(hf < 1e18, "User is healthy");
        
        // 清算人偿还债务，获得折价抵押品（+清算奖励 5-10%）
        IERC20(debt).transferFrom(msg.sender, address(this), debtAmount);
        uint256 collateralAmount = getCollateralAmount(debt, collateral, debtAmount);
        // 清算奖励 + 协议罚款
        IAToken(reserves[collateral].aToken).burn(user, collateralAmount * 1.05);
    }
}
// 利率模型：utilization↑ → borrowRate↑（超过最优点后急剧上升）`,
  },
  {
    name: '收益农场', icon: '🌾', color: '#eab308',
    code: `// Yield Farming：流动性挖矿激励机制

contract MasterChef {
    struct PoolInfo {
        IERC20 lpToken;          // 质押的 LP Token
        uint256 allocPoint;      // 此池的挖矿权重
        uint256 lastRewardBlock; // 上次发放奖励的区块号
        uint256 accRewardPerShare; // 每份 LP Token 累计奖励（精度 1e12）
    }
    
    struct UserInfo {
        uint256 amount;          // 质押的 LP Token 数量
        uint256 rewardDebt;      // 已领取的奖励（防止重复领取）
    }
    
    IERC20 public rewardToken;   // 奖励代币（如 SUSHI/CAKE）
    uint256 public rewardPerBlock = 100e18;  // 每区块挖矿产出
    
    // 质押 LP Token 进行流动性挖矿
    function deposit(uint256 pid, uint256 amount) external {
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];
        
        updatePool(pid);  // 先更新累计奖励
        
        // 领取待领奖励
        if (user.amount > 0) {
            uint256 pending = user.amount * pool.accRewardPerShare / 1e12 - user.rewardDebt;
            rewardToken.transfer(msg.sender, pending);
        }
        
        pool.lpToken.transferFrom(msg.sender, address(this), amount);
        user.amount += amount;
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
    }
    
    // 更新池奖励（按区块数计算）
    function updatePool(uint256 pid) public {
        PoolInfo storage pool = poolInfo[pid];
        uint256 blocksDelta = block.number - pool.lastRewardBlock;
        uint256 reward = blocksDelta * rewardPerBlock * pool.allocPoint / totalAllocPoint;
        rewardToken.mint(address(this), reward);  // 铸造新代币
        pool.accRewardPerShare += reward * 1e12 / pool.lpToken.balanceOf(address(this));
        pool.lastRewardBlock = block.number;
    }
}`,
  },
];

export default function LessonDeFi() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = DEFI_TOPICS[activeTopic];

  return (
    <div className="lesson-w3">
      <div className="w3-badge orange">💰 module_03 — DeFi 协议</div>
      <div className="w3-hero">
        <h1>DeFi 协议：AMM / DEX / 借贷 / 收益农场</h1>
        <p>DeFi（去中心化金融）用智能合约替代传统金融中介。Uniswap 的<strong>恒定乘积 AMM</strong>（x·y=k）让任何人都能成为做市商，AAVE 的借贷协议让抵押品自动产生收益。</p>
      </div>

      <AMMSimulator />

      <div className="w3-section">
        <h2 className="w3-section-title">🏗️ DeFi 三大核心协议</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DEFI_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="w3-code-wrap">
          <div className="w3-code-head"><div className="w3-code-dot" style={{ background: '#ef4444' }}/><div className="w3-code-dot" style={{ background: '#f97316' }}/><div className="w3-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.sol</span></div>
          <div className="w3-code" style={{ fontSize: '0.74rem', maxHeight: 420, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/solidity')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/nft')}>下一模块：NFT & 代币标准 →</button>
      </div>
    </div>
  );
}
