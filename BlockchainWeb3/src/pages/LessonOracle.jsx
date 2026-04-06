import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ORACLE_TOPICS = [
  {
    name: 'Chainlink', icon: '🔗', color: '#3b82f6',
    code: `// Chainlink 数据预言机集成（ETH/USD 价格）

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;
    
    constructor() {
        // ETH/USD 喂价合约（Ethereum Mainnet）
        priceFeed = AggregatorV3Interface(
            0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        );
    }
    
    // 获取最新 ETH/USD 价格（8位小数）
    function getLatestPrice() public view returns (int256) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,  // ← 检查是否过期！
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        // 防止 stale price（超过 1小时的价格视为过期）
        require(updatedAt >= block.timestamp - 3600, "Stale price");
        require(price > 0, "Invalid price");
        
        return price; // e.g. 300000000000 = $3000.00000000
    }
    
    // 用链上价格计算资产价值
    function getAssetValueInUSD(uint256 ethAmount)
        public view returns (uint256)
    {
        int256 ethPrice = getLatestPrice();
        uint256 price18 = uint256(ethPrice) * 1e10; // 8 → 18 decimals
        return (ethAmount * price18) / 1e18;
    }
}

// ── Chainlink VRF（可验证随机数）──
// 问题：block.timestamp / blockhash 可被矿工操控
// 解决：Chainlink VRF 提供链外随机数 + 密码学证明

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract NFTLottery is VRFConsumerBaseV2 {
    bytes32 internal keyHash;
    uint64  internal subscriptionId;
    
    function requestRandomWords() external returns (uint256 requestId) {
        return VRFCoordinatorV2Interface(vrfCoordinator).requestRandomWords(
            keyHash, subscriptionId, 3, 200000, 1   // confirmations, callbackGas, numWords
        );
    }
    
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal override
    {
        // 用随机数选出 NFT 获奖者（完全公平！）
        uint256 winnerIndex = randomWords[0] % totalParticipants;
        winner = participants[winnerIndex];
    }
}`,
  },
  {
    name: 'IPFS 存储', icon: '🌐', color: '#10b981',
    code: `# IPFS（星际文件系统）— NFT 元数据去中心化存储

# ── 为什么不能把 NFT 图片存链上？──
# 32KB 数据 → 约 2000万 gas → $10K+ 费用！
# 解决：链上只存 IPFS CID（46字节哈希），图片存 IPFS

# ── IPFS CID 原理 ──
# CID = multihash(content) → 内容寻址
# 相同内容 → 相同 CID（永不改变）
# 不同于传统 URL（服务器可以宕机、内容被改）

# ── 上传 NFT 元数据到 IPFS（使用 Web3.Storage）──
import requests
import json

def upload_to_ipfs(metadata: dict) -> str:
    # 选项1：Pinata API
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    headers = {
        "Authorization": f"Bearer {PINATA_JWT}",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, json={
        "pinataContent": metadata,
        "pinataMetadata": {"name": f"nft-{metadata['name']}"}
    }, headers=headers)
    return f"ipfs://{resp.json()['IpfsHash']}"

# ── 批量上传 10000 个 NFT ──
for token_id in range(1, 10001):
    metadata = {
        "name": f"MyNFT #{token_id}",
        "description": "An amazing NFT collection",
        "image": f"ipfs://QmImageHash.../{token_id}.png",
        "attributes": [
            {"trait_type": "Background", "value": random.choice(backgrounds)},
            {"trait_type": "Eyes", "value": random.choice(eyes)},
            {"trait_type": "Mouth", "value": random.choice(mouths)},
        ]
    }
    cid = upload_to_ipfs(metadata)
    print(f"Token {token_id}: {cid}")

# ── IPFS Gateway 访问 ──
# ipfs://QmXxx... → https://ipfs.io/ipfs/QmXxx...
# 或私有网关：https://your-project.infura-ipfs.io/ipfs/QmXxx...

# ── Filecoin 持久化存储 ──
# IPFS 默认只要节点不固定（pin）就可能消失
# Filecoin：支付存储费用，合约保证 N 年内数据不丢失`,
  },
  {
    name: 'The Graph', icon: '📊', color: '#7c3aed',
    code: `// The Graph：区块链数据索引与查询

// 问题：直接查询区块链极慢（遍历所有区块找 events）
// 解决：The Graph 实时索引合约事件 → GraphQL API

// ── 1. 定义 Subgraph Schema ──
// schema.graphql
type Transfer @entity {
  id:         ID!
  from:       Bytes!
  to:         Bytes!
  amount:     BigInt!
  timestamp:  BigInt!
  blockNumber: BigInt!
}

type User @entity {
  id:       ID!           // address
  balance:  BigInt!
  txCount:  BigInt!
  transfers: [Transfer!]! @derivedFrom(field: "from")
}

// ── 2. 映射处理器（AssemblyScript）──
// src/mapping.ts
export function handleTransfer(event: TransferEvent): void {
  let transfer = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  transfer.from      = event.params.from;
  transfer.to        = event.params.to;
  transfer.amount    = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.save();

  // 更新发送者
  let user = User.load(event.params.from.toHex());
  if (!user) { user = new User(event.params.from.toHex()); user.balance = BigInt.fromI32(0); }
  user.balance -= event.params.value;
  user.txCount  = user.txCount.plus(BigInt.fromI32(1));
  user.save();
}

// ── 3. 前端查询（GraphQL）──
const GET_TOP_HOLDERS = gql\`
  query GetTopHolders {
    users(first: 10, orderBy: balance, orderDirection: desc) {
      id
      balance
      txCount
    }
    transfers(first: 5, orderBy: timestamp, orderDirection: desc) {
      from { id }
      to   { id }
      amount
      timestamp
    }
  }
\`

// 使用 Apollo Client 或 urql 查询
const { data } = useQuery(GET_TOP_HOLDERS, { client: theGraphClient });`,
  },
];

export default function LessonOracle() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = ORACLE_TOPICS[activeTopic];

  return (
    <div className="lesson-w3">
      <div className="w3-badge blue">🔗 module_06 — Oracle & 去中心化存储</div>
      <div className="w3-hero">
        <h1>Oracle & 存储：Chainlink / IPFS / The Graph</h1>
        <p>智能合约是<strong>封闭的确定性系统</strong>——无法主动访问链外数据。Oracle 是链上和现实世界的桥梁；IPFS 解决 NFT 元数据的去中心化存储；The Graph 让查询链上历史数据变得和查普通 API 一样简单。</p>
      </div>

      <div className="w3-interactive">
        <h3>🌉 链上与链外数据流动</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '0.5rem 0' }}>
          {[
            { name: '真实世界', sub: '价格/天气/体育', icon: '🌍', color: '#64748b' },
            { name: 'Chainlink 节点', sub: '聚合+密码学签名', icon: '🔗', color: '#3b82f6' },
            { name: '链上 Oracle', sub: '喂价合约', icon: '📡', color: '#7c3aed' },
            { name: '智能合约', sub: '使用可信数据', icon: '📜', color: '#10b981' },
          ].map((node, i) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center', padding: '0.5rem 0.75rem', background: `${node.color}08`, border: `1px solid ${node.color}25`, borderRadius: '9px', minWidth: 100 }}>
                <div style={{ fontSize: '1.3rem' }}>{node.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: node.color }}>{node.name}</div>
                <div style={{ fontSize: '0.6rem', color: '#475569' }}>{node.sub}</div>
              </div>
              {i < 3 && <div style={{ color: '#7c3aed', fontSize: '1.2rem' }}>→</div>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: '#475569', textAlign: 'center' }}>
          Chainlink 使用 16~31 个独立节点聚合数据 → 取中位数 → 防止单点操控
        </div>
      </div>

      <div className="w3-section">
        <h2 className="w3-section-title">🔧 三大基础设施代码</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {ORACLE_TOPICS.map((topic, i) => (
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
          <div className="w3-code-head"><div className="w3-code-dot" style={{ background: '#ef4444' }}/><div className="w3-code-dot" style={{ background: '#f97316' }}/><div className="w3-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span></div>
          <div className="w3-code" style={{ fontSize: '0.74rem', maxHeight: 420, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/security')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/layer2')}>下一模块：Layer2 扩容 →</button>
      </div>
    </div>
  );
}
