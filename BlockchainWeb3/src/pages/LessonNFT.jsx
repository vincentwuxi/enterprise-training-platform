import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TOKEN_STANDARDS = [
  { std: 'ERC-20', title: '同质化代币', icon: '🪙', color: '#7c3aed', desc: '每个代币完全相同，可互换。USDC/UNI/LINK等均为ERC-20。', methods: ['transfer(to,amount)', 'approve(spender,amount)', 'transferFrom(from,to,amount)', 'balanceOf(account) → uint256'] },
  { std: 'ERC-721', title: 'NFT（非同质化）', icon: '🖼️', color: '#f97316', desc: '每个 token 有唯一 tokenId，不可互换。CryptoPunks/BAYC均为ERC-721。', methods: ['ownerOf(tokenId) → address', 'transferFrom(from,to,tokenId)', 'approve(to,tokenId)', 'tokenURI(tokenId) → string'] },
  { std: 'ERC-1155', title: '多重代币', icon: '🎮', color: '#10b981', desc: '单合约支持同质化+非同质化大混合。游戏资产标准首选，safeTransferFrom批量操作。', methods: ['balanceOf(account,id) → uint256', 'safeTransferFrom(from,to,id,amount)', 'safeBatchTransferFrom(from,to,ids,amounts)', 'uri(id) → string'] },
  { std: 'ERC-4626', title: '收益金库', icon: '🏛️', color: '#eab308', desc: '标准化的收益聚合器接口。deposit/withdraw/convertToShares，DeFi 可组合性的关键。', methods: ['deposit(assets,receiver) → shares', 'withdraw(assets,receiver,owner)', 'convertToShares(assets) → uint256', 'totalAssets() → uint256'] },
];

const NFT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public mintPrice = 0.08 ether;
    
    // 白名单（Merkle Tree 验证）
    bytes32 public merkleRoot;
    mapping(address => bool) public whitelistClaimed;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    // ── 公开 Mint ──
    function publicMint(uint256 quantity) external payable {
        require(msg.value >= mintPrice * quantity, "Underpayment");
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Exceeds supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = ++_tokenIdCounter;
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, _buildURI(tokenId));
        }
    }

    // ── Whitelist Mint（Merkle Proof 验证）──
    function whitelistMint(bytes32[] calldata proof) external payable {
        require(!whitelistClaimed[msg.sender], "Already claimed");
        require(
            MerkleProof.verify(proof, merkleRoot, keccak256(abi.encodePacked(msg.sender))),
            "Invalid proof"
        );
        whitelistClaimed[msg.sender] = true;
        uint256 tokenId = ++_tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _buildURI(tokenId));
    }

    // ── 元数据 URI（指向 IPFS）──
    function _buildURI(uint256 tokenId) internal pure returns (string memory) {
        // ipfs://QmXxx.../1, /2, /3...
        return string(abi.encodePacked(
            "ipfs://QmXxxxxxxxxxxxx/",
            Strings.toString(tokenId),
            ".json"
        ));
    }

    // Token 元数据（JSON in IPFS）:
    // {
    //   "name": "MyNFT #1",
    //   "description": "...",
    //   "image": "ipfs://QmYyyy.../1.png",
    //   "attributes": [
    //     {"trait_type": "Background", "value": "Blue"},
    //     {"trait_type": "Eyes", "value": "Laser"},
    //     {"trait_type": "Rarity", "value": "Legendary"}
    //   ]
    // }
    
    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok);
    }
}`;

export default function LessonNFT() {
  const navigate = useNavigate();
  const [activeStd, setActiveStd] = useState(0);
  const std = TOKEN_STANDARDS[activeStd];

  return (
    <div className="lesson-w3">
      <div className="w3-badge green">🖼️ module_04 — NFT & 代币标准</div>
      <div className="w3-hero">
        <h1>NFT & 代币标准：ERC-20/721/1155 / IPFS 元数据</h1>
        <p>以太坊定义了标准化接口（EIP）让不同协议可以互操作。ERC-20 是同质化代币的基础，ERC-721 是 NFT 的基础（独一无二的 tokenId），ERC-1155 支持<strong>批量多类型 token</strong>。</p>
      </div>

      {/* 标准选择器 */}
      <div className="w3-interactive">
        <h3>📋 四大代币标准（点击切换查看接口）</h3>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {TOKEN_STANDARDS.map((s, i) => (
            <button key={i} onClick={() => setActiveStd(i)}
              style={{ flex: 1, minWidth: 100, padding: '0.625rem 0.4rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontWeight: 800,
                border: `1.5px solid ${activeStd === i ? s.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeStd === i ? `${s.color}10` : 'rgba(255,255,255,0.02)',
                color: activeStd === i ? s.color : '#64748b' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.15rem' }}>{s.icon}</div>
              <div style={{ fontSize: '0.75rem' }}>{s.std}</div>
              <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '0.1rem' }}>{s.title}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, color: std.color, fontSize: '0.88rem', marginBottom: '0.35rem' }}>{std.std} — {std.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, marginBottom: '0.625rem' }}>{std.desc}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>必须实现的核心函数：</div>
            {std.methods.map(m => (
              <div key={m} style={{ padding: '0.25rem 0.5rem', background: `${std.color}06`, border: `1px solid ${std.color}15`, borderRadius: '5px', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: std.color, marginBottom: '0.15rem' }}>{m}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>真实应用举例：</div>
            {({
              0: [['USDC/USDT', '稳定币，全球流通'],['UNI', 'Uniswap治理代币'],['LINK', 'Chainlink预言机代币']],
              1: [['CryptoPunks', '最早NFT，10000个朋克'],['BAYC', '无聊猿游艇俱乐部'],['Azuki', '动漫风PFP NFT']],
              2: [['OpenSea共享合约', '多类资产同一合约'],['游戏道具', '武器/皮肤/货币同合约'],['ENS', 'Ethereum Name Service']],
              3: [['yearn vaults', '收益聚合器标准'],['Morpho Blue', '借贷协议金库'],['ERC-4626对接', '任何DeFi可组合']],
            })[activeStd].map(([name, desc]) => (
              <div key={name} style={{ marginBottom: '0.35rem' }}>
                <div style={{ fontWeight: 700, color: std.color, fontSize: '0.75rem' }}>{name}</div>
                <div style={{ fontSize: '0.68rem', color: '#475569' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NFT 合约 */}
      <div className="w3-section">
        <h2 className="w3-section-title">🎨 生产级 NFT 合约（含 Merkle Whitelist）</h2>
        <div className="w3-code-wrap">
          <div className="w3-code-head"><div className="w3-code-dot" style={{ background: '#ef4444' }}/><div className="w3-code-dot" style={{ background: '#f97316' }}/><div className="w3-code-dot" style={{ background: '#f97316' }}/><span style={{ color: '#f97316', marginLeft: '0.5rem' }}>🖼️ MyNFT.sol</span></div>
          <div className="w3-code" style={{ fontSize: '0.74rem', maxHeight: 420, overflowY: 'auto' }}>{NFT_CODE}</div>
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/defi')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/security')}>下一模块：智能合约安全 →</button>
      </div>
    </div>
  );
}
