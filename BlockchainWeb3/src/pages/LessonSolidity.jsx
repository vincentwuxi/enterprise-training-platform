import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const SOLIDITY_TOPICS = [
  {
    name: '数据类型 & 状态变量', icon: '📦', color: '#7c3aed',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataTypes {
    // ── 值类型 ──
    uint256 public count = 0;          // 无符号整数（0 ~ 2²⁵⁶-1）
    int256  public balance = -100;     // 有符号整数
    bool    public isActive = true;    // 布尔
    address public owner;              // 20字节以太坊地址
    bytes32 public hash;               // 固定字节数组
    
    // ── 引用类型（存在 Storage/Memory/Calldata）──
    string  public name;               // 动态字符串
    uint256[] public scores;           // 动态数组
    mapping(address => uint256) public balances;  // 哈希表
    
    // ── 结构体 ──
    struct User {
        address addr;
        uint256 balance;
        bool    active;
    }
    mapping(address => User) public users;
    
    // ── 枚举 ──
    enum Status { Pending, Active, Inactive }
    Status public status = Status.Pending;
    
    // ── 常量（编译时内联，节省 Gas）──
    uint256 public constant MAX_SUPPLY = 10_000;
    address public immutable TOKEN;    // immutable：只能在构造函数赋值
    
    constructor(address _token) {
        owner = msg.sender;
        TOKEN = _token;
    }
    
    // ── 存储位置说明 ──
    // storage：持久化在链上（贵！SSTORE 20000 gas）
    // memory：函数内临时（MLOAD 3 gas）
    // calldata：只读，函数参数首选（最省 gas）
    function processArray(uint256[] calldata arr) external pure
        returns (uint256 sum) {
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
    }
}`,
  },
  {
    name: '函数 & 访问控制', icon: '🔒', color: '#10b981',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AccessControl is Ownable {
    mapping(address => bool) public admins;
    uint256 public value;
    
    event ValueChanged(address indexed by, uint256 from, uint256 to);
    event AdminAdded(address indexed admin);
    
    // ── 函数修饰符 ──
    modifier onlyAdmin() {
        require(admins[msg.sender] || owner() == msg.sender,
            "Not admin");
        _;   // 插入被修饰函数的代码
    }
    
    modifier nonZero(uint256 _val) {
        require(_val > 0, "Value must be positive");
        _;
    }
    
    modifier withinRange(uint256 _val) {
        require(_val <= 1_000_000, "Exceeds max");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    // ── 函数可见性 ──
    // public:   内外均可调用
    // external: 只能外部调用（calldata 更省 gas）
    // internal: 本合约 + 子合约
    // private:  只本合约
    
    // ── 状态可变性 ──
    // view：只读，不修改状态
    // pure：不读也不改状态（纯计算）
    // payable：可接收 ETH
    
    function setValue(uint256 _new) external onlyAdmin nonZero(_new) withinRange(_new) {
        uint256 old = value;
        value = _new;
        emit ValueChanged(msg.sender, old, _new);
    }
    
    function addAdmin(address _admin) external onlyOwner {
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }
    
    // 接收 ETH
    receive() external payable {}
    fallback() external payable {}
    
    // 提取 ETH（仅 owner）
    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok, ) = owner().call{value: bal}("");
        require(ok, "Transfer failed");
    }
}`,
  },
  {
    name: 'ERC-20 代币实现', icon: '🪙', color: '#f97316',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 从零实现一个完整的 ERC-20 代币
contract MyToken {
    string public name;
    string public symbol;
    uint8  public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // 必须实现的 ERC-20 事件
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name   = _name;
        symbol = _symbol;
        totalSupply = _supply * 10**decimals;
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);  // Mint
    }
    
    // ── 核心 ERC-20 函数 ──
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "Insufficient allowance");
        _allowances[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        unchecked {
            _balances[from] -= amount;   // unchecked: uint256 不会下溢（已检查）
            _balances[to]   += amount;   // 节省 gas
        }
        emit Transfer(from, to, amount);
    }
}`,
  },
  {
    name: '设计模式', icon: '🏗️', color: '#eab308',
    code: `// Solidity 常用设计模式

// ── 1. 代理模式（可升级合约）──
// EIP-1967 透明代理：
// Logic合约存业务代码，Proxy合约存Storage
// 升级时只换 Logic 地址，Storage 数据不变

// ── 2. Factory 工厂模式 ──
contract PairFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    event PairCreated(address token0, address token1, address pair);
    
    function createPair(address tokenA, address tokenB)
        external returns (address pair)
    {
        require(tokenA != tokenB, "Identical addresses");
        (address t0, address t1) = tokenA < tokenB
            ? (tokenA, tokenB) : (tokenB, tokenA);
        
        // CREATE2：确定性地址（salt=token pair hash）
        bytes32 salt = keccak256(abi.encodePacked(t0, t1));
        pair = address(new UniswapV2Pair{salt: salt}(t0, t1));
        
        getPair[t0][t1] = pair;
        getPair[t1][t0] = pair;
        allPairs.push(pair);
        emit PairCreated(t0, t1, pair);
    }
}

// ── 3. Pull vs Push 支付模式 ──
// ❌ Push（不安全）：合约主动给用户转账
//    → 如果用户是恶意合约，call() 会触发重入攻击！
// ✅ Pull（安全）：用户自己调用提款
contract SafeWithdraw {
    mapping(address => uint256) public credits;
    
    // 用户调用 withdraw() 拉取资金
    function withdraw() external {
        uint256 amount = credits[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        credits[msg.sender] = 0;         // ① 先清零（防重入）
        (bool ok, ) = msg.sender.call{value: amount}("");  // ② 再转账
        require(ok, "Transfer failed");
    }
}

// ── 4. 检查-效果-交互（CEI）模式 ──
function safeAction(uint256 amount) external {
    // Check：前置条件检查
    require(balances[msg.sender] >= amount, "balance");
    // Effect：状态变更（先！）
    balances[msg.sender] -= amount;
    // Interaction：外部调用（后！）
    token.transfer(msg.sender, amount);
}`,
  },
];

export default function LessonSolidity() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = SOLIDITY_TOPICS[activeTopic];

  return (
    <div className="lesson-w3">
      <div className="w3-badge purple">📜 module_02 — Solidity 智能合约</div>
      <div className="w3-hero">
        <h1>Solidity 智能合约：语法精讲 / 访问控制 / 设计模式</h1>
        <p>Solidity 是以太坊的<strong>智能合约编程语言</strong>，语法类 JavaScript + C++。合约一旦部署到链上就无法修改（除非使用代理模式），因此安全和设计都至关重要。</p>
      </div>

      <div className="w3-interactive">
        <h3>⚡ 快速参考：Solidity 关键语法速查</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.4rem' }}>
          {[
            ['msg.sender', 'address', '调用者地址'],
            ['msg.value', 'uint256', '发送的 ETH 数量 (wei)'],
            ['block.timestamp', 'uint256', '当前区块时间戳'],
            ['block.number', 'uint256', '当前区块高度'],
            ['address(this)', 'address', '当前合约地址'],
            ['tx.gasPrice', 'uint256', '交易 Gas 价格'],
            ['keccak256()', 'bytes32', 'Keccak-256 哈希函数'],
            ['abi.encode()', 'bytes', 'ABI 编码参数'],
          ].map(([fn, type, desc]) => (
            <div key={fn} style={{ padding: '0.375rem 0.5rem', background: 'rgba(124,58,237,0.04)', borderRadius: '6px', border: '1px solid rgba(124,58,237,0.1)' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', fontWeight: 700, color: '#10b981' }}>{fn}</div>
              <div style={{ fontSize: '0.62rem', color: '#f97316', fontFamily: 'JetBrains Mono' }}>{type}</div>
              <div style={{ fontSize: '0.62rem', color: '#475569' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w3-section">
        <h2 className="w3-section-title">📚 Solidity 四大核心主题</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {SOLIDITY_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="w3-code-wrap">
          <div className="w3-code-head">
            <div className="w3-code-dot" style={{ background: '#ef4444' }} />
            <div className="w3-code-dot" style={{ background: '#f59e0b' }} />
            <div className="w3-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.sol</span>
          </div>
          <div className="w3-code" style={{ fontSize: '0.74rem', maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="w3-nav">
        <button className="w3-btn" onClick={() => navigate('/course/blockchain-web3/lesson/foundation')}>← 上一模块</button>
        <button className="w3-btn primary" onClick={() => navigate('/course/blockchain-web3/lesson/defi')}>下一模块：DeFi 协议 →</button>
      </div>
    </div>
  );
}
