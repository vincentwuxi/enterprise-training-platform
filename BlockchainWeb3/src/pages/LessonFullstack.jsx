import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const WEB3_STACK_TOPICS = [
  {
    name: 'ethers.js 核心', icon: '⚙️', color: '#7c3aed',
    code: `// ethers.js v6 — 以太坊 JavaScript 交互库完全指南

import { ethers } from "ethers";

// ── 1. 连接钱包（MetaMask）──
async function connectWallet() {
  if (!window.ethereum) throw new Error("请安装 MetaMask!");
  
  // 请求账户授权
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });
  
  // 创建 BrowserProvider（连接 MetaMask）
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  
  console.log("钱包地址:", await signer.getAddress());
  console.log("ETH 余额:", ethers.formatEther(
    await provider.getBalance(signer.getAddress())
  ), "ETH");
  
  return { provider, signer };
}

// ── 2. 读取合约数据（read-only）──
const ERC20_ABI = [
  "function name() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

async function readContract(tokenAddress: string, userAddress: string) {
  const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY");
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  
  const [name, balance, supply] = await Promise.all([
    token.name(),
    token.balanceOf(userAddress),
    token.totalSupply(),
  ]);
  
  console.log(\`\${name}: balance=\${ethers.formatUnits(balance, 18)} tokens\`);
  return { name, balance, supply };
}

// ── 3. 写入合约（需要 signer）──
async function transferTokens(tokenAddress: string, toAddress: string, amount: string) {
  const { signer } = await connectWallet();
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  
  // 发送交易
  const tx = await token.transfer(
    toAddress,
    ethers.parseUnits(amount, 18)    // 将人类可读金额转为 wei
  );
  
  console.log("交易哈希:", tx.hash);
  
  // 等待确认（建议等 2 个区块）
  const receipt = await tx.wait(2);
  console.log("确认区块:", receipt.blockNumber);
  console.log("Gas 使用:", receipt.gasUsed.toString());
}

// ── 4. 监听事件 ──
async function listenTransfers(tokenAddress: string) {
  const provider = new ethers.WebSocketProvider("wss://eth-mainnet.g.alchemy.com/v2/YOUR_KEY");
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  
  // 过滤并监听Transfer事件
  token.on("Transfer", (from, to, value, event) => {
    console.log(\`Transfer: \${from} → \${to}: \${ethers.formatUnits(value, 18)} tokens\`);
    console.log("tx:", event.log.transactionHash);
  });
}`,
  },
  {
    name: 'wagmi & React', icon: '⚛️', color: '#3b82f6',
    code: `// wagmi v2 + viem — React Web3 Hook 库

import { createConfig, WagmiProvider, useAccount, 
         useBalance, useWriteContract, useReadContract } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ── 1. 配置 Wagmi ──
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),          // MetaMask / 浏览器钱包
    walletConnect({ projectId: 'YOUR_WC_PROJECT_ID' }),
    coinbaseWallet({ appName: 'My dApp' }),
  ],
  transports: {
    [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY'),
  },
})

// ── 2. App 根组件 ──
export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <DApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// ── 3. 核心 Hook 使用 ──
function DApp() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  
  // 读取合约（自动缓存 + 轮询）
  const { data: tokenBalance } = useReadContract({
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  })
  
  // 写入合约（自动处理 gas 估算）
  const { writeContractAsync } = useWriteContract()
  
  const handleTransfer = async () => {
    const hash = await writeContractAsync({
      address: TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientAddress, parseUnits('100', 18)],
    })
    console.log('tx hash:', hash)
    
    // 等待确认
    await waitForTransactionReceipt(config, { hash })
  }
  
  return (
    <div>
      {isConnected ? (
        <>
          <p>地址: {address}</p>
          <p>ETH: {formatEther(balance?.value ?? 0n)}</p>
          <p>DAI: {tokenBalance ? formatUnits(tokenBalance, 18) : '...'}</p>
          <button onClick={handleTransfer}>转账 100 DAI</button>
        </>
      ) : (
        <w3m-button />      // Wallet Connect modal 按钮
      )}
    </div>
  )
}`,
  },
  {
    name: 'Hardhat 开发', icon: '🔨', color: '#f97316',
    code: `// Hardhat — Solidity 专业开发框架

// ── 1. 初始化项目 ──
// npx hardhat init
// npm install @nomicfoundation/hardhat-toolbox

// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,  // 启用 IR 优化（节省更多 gas）
    }
  },
  networks: {
    mainnet:  { url: "https://eth-mainnet.g.alchemy.com/v2/...", accounts: [PK] },
    sepolia:  { url: "https://eth-sepolia.g.alchemy.com/v2/...", accounts: [PK] },
    hardhat:  { forking: { url: "mainnet_rpc", blockNumber: 19500000 } },  // 主网分叉！
  },
  etherscan: { apiKey: ETHERSCAN_KEY },   // 自动验证合约源码
};

// ── 2. 测试（Hardhat + Chai）──
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MyToken", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy("MyToken", "MTK", 1_000_000);
    return { token, owner, alice, bob };
  }

  it("Should transfer correctly", async function () {
    const { token, alice, bob } = await loadFixture(deployFixture);
    
    await token.transfer(alice.address, ethers.parseUnits("100", 18));
    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseUnits("100", 18));
    
    // 重入攻击测试
    const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
    const attacker = await Attacker.deploy(token.address);
    await expect(attacker.attack()).to.be.reverted;  // 应被 nonReentrant 阻止
  });
  
  it("Gas optimization check", async function () {
    const { token, alice } = await loadFixture(deployFixture);
    const tx = await token.transfer(alice.address, 1);
    const receipt = await tx.wait();
    console.log("Transfer gas:", receipt?.gasUsed);
    expect(receipt?.gasUsed).to.be.lessThan(50000n);
  });
});

// ── 3. 部署脚本 ──
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy("MyToken", "MTK", 1_000_000);
  await token.waitForDeployment();
  
  console.log("Token deployed to:", await token.getAddress());
  
  // 自动验证源码（等 5 个区块）
  await verify(await token.getAddress(), ["MyToken", "MTK", 1_000_000]);
}`,
  },
];

export default function LessonFullstack() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = WEB3_STACK_TOPICS[activeTopic];

  return (
    <div className="lesson-w3">
      <div className="w3-badge green">🌐 module_08 — Web3 全栈开发</div>
      <div className="w3-hero">
        <h1>Web3 全栈：ethers.js / wagmi / Hardhat dApp</h1>
        <p>一个完整的 dApp = 智能合约（Solidity）+ 链上交互（ethers.js / wagmi）+ 前端（React）+ 开发测试（Hardhat）。掌握这条技术栈，就能从零构建<strong>生产级 DeFi / NFT 应用</strong>。</p>
      </div>

      {/* dApp 架构图 */}
      <div className="w3-interactive">
        <h3>🏗️ Web3 全栈 dApp 技术架构</h3>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', padding: '0.25rem 0' }}>
          {[
            { layer: 'Frontend（用户界面）', items: ['React + Next.js', 'wagmi + viem', 'Tailwind CSS'], color: '#3b82f6', icon: '🖥️' },
            { layer: 'Web3 连接层', items: ['ethers.js / viem', 'WalletConnect', 'RainbowKit / Web3Modal'], color: '#7c3aed', icon: '🔌' },
            { layer: '区块链节点', items: ['Alchemy / Infura', 'QuickNode', 'Self-hosted Geth'], color: '#10b981', icon: '🌐' },
            { layer: '智能合约', items: ['Solidity 0.8+', 'OpenZeppelin', 'Hardhat / Foundry'], color: '#f97316', icon: '📜' },
            { layer: '数据索引', items: ['The Graph', 'Moralis', 'QuickNode Streams'], color: '#eab308', icon: '📊' },
            { layer: '存储', items: ['IPFS + Filecoin', 'Arweave', 'Pinata / nft.storage'], color: '#64748b', icon: '💾' },
          ].map(l => (
            <div key={l.layer} style={{ flex: '1 1 200px', padding: '0.625rem 0.75rem', background: `${l.color}06`, border: `1px solid ${l.color}18`, borderRadius: '9px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{l.icon}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: l.color, marginBottom: '0.25rem' }}>{l.layer}</div>
              {l.items.map(it => <div key={it} style={{ fontSize: '0.65rem', color: '#475569' }}>{it}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="w3-section">
        <h2 className="w3-section-title">💻 三大开发工具链代码</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {WEB3_STACK_TOPICS.map((topic, i) => (
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
          <div className="w3-code-head"><div className="w3-code-dot" style={{ background: '#ef4444' }}/><div className="w3-code-dot" style={{ background: '#f97316' }}/><div className="w3-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.ts</span></div>
          <div className="w3-code" style={{ fontSize: '0.74rem', maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      {/* 结课卡片 */}
      <div className="w3-section">
        <div className="w3-card" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(249,115,22,0.04),rgba(16,185,129,0.04))', border: '1px solid rgba(124,58,237,0.18)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#a78bfa', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成区块链 & Web3 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.4rem', textAlign: 'left' }}>
            {[
              '✅ 区块链结构可视化 + SHA-256/EC密码学 + Gas机制',
              '✅ Solidity 数据类型/访问控制/ERC-20完整实现',
              '✅ AMM恒定乘积模拟器（拖动调整+SVG曲线+价格影响）',
              '✅ ERC-721 NFT合约（Merkle白名单+IPFS元数据）',
              '✅ 四类攻击路径动画（重入/闪电贷/访问控制/溢出）',
              '✅ Chainlink预言机/VRF + IPFS批量上传 + The Graph',
              '✅ L1 vs L2吞吐量对比图 + ZK-Rollup原理代码',
              '✅ ethers.js v6 + wagmi v2 + Hardhat测试完整示例',
            ].map(s => <div key={s} style={{ fontSize: '0.78rem', color: '#64748b' }}>{s}</div>)}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#f97316' }}>
            🛠️ 推荐工具：Remix IDE · Hardhat · Foundry · OpenZeppelin Wizard · Tenderly · Etherscan
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
            📚 延伸阅读：以太坊黄皮书 · OpenZeppelin Docs · DeFiHackLabs · PatrickCollins Solidity Course
          </div>
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/layer2')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
