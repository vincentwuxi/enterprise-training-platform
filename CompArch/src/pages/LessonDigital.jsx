import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// ── 逻辑门真值表 ──
const GATES = {
  AND:  { sym: '&',  fn: (a,b) => a&b,  color: '#f59e0b', desc: '两个输入都为1时输出1' },
  OR:   { sym: '≥1', fn: (a,b) => a|b,  color: '#3b82f6', desc: '至少一个输入为1时输出1' },
  NOT:  { sym: '1',  fn: (a)   => a^1,  color: '#22c55e', desc: '输出输入的反值（非门）', single: true },
  NAND: { sym: '⊼',  fn: (a,b) => (a&b)^1, color: '#a855f7', desc: 'AND的反：通用门，可构造任意电路' },
  XOR:  { sym: '=1', fn: (a,b) => a^b,  color: '#ef4444', desc: '两个输入不同时输出1（异或）' },
};

function GateSimulator() {
  const [gateType, setGateType] = useState('AND');
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const g = GATES[gateType];
  const out = g.single ? g.fn(a) : g.fn(a, b);

  return (
    <div className="ca-interactive">
      <h3>⚡ 逻辑门交互模拟器（点击输入切换 0/1）</h3>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {Object.entries(GATES).map(([name, gate]) => (
          <button key={name} onClick={() => setGateType(name)}
            style={{ flex: 1, minWidth: 70, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '0.8rem', textAlign: 'center', transition: 'all 0.15s',
              border: `1.5px solid ${gateType === name ? gate.color + '80' : 'rgba(255,255,255,0.08)'}`,
              background: gateType === name ? `${gate.color}12` : 'rgba(255,255,255,0.02)',
              color: gateType === name ? gate.color : '#64748b' }}>
            {name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
        {/* 输入 A */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.3rem' }}>输入 A</div>
          <div className={`ca-bit ${a ? 'ca-bit-1' : 'ca-bit-0'}`} style={{ width: 48, height: 48, fontSize: '1.1rem' }} onClick={() => setA(a^1)}>{a}</div>
        </div>

        {/* 门符号 */}
        <div style={{ textAlign: 'center' }}>
          {!g.single && <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.3rem' }}>输入 B</div>}
          {!g.single && <div className={`ca-bit ${b ? 'ca-bit-1' : 'ca-bit-0'}`} style={{ width: 48, height: 48, fontSize: '1.1rem' }} onClick={() => setB(b^1)}>{b}</div>}
        </div>

        {/* 门图形 */}
        <svg width={80} height={60} viewBox="0 0 80 60">
          <rect x={5} y={8} width={50} height={44} rx={8} fill={`${g.color}12`} stroke={g.color} strokeWidth={1.5} />
          <text x={30} y={35} textAnchor="middle" fill={g.color} fontSize={11} fontWeight={800} fontFamily="JetBrains Mono">{g.sym}</text>
          {/* Input wires */}
          {!g.single && <line x1={0} y1={20} x2={5} y2={20} stroke={a ? '#f59e0b' : '#334155'} strokeWidth={2} />}
          {!g.single && <line x1={0} y1={40} x2={5} y2={40} stroke={b ? '#f59e0b' : '#334155'} strokeWidth={2} />}
          {g.single && <line x1={0} y1={30} x2={5} y2={30} stroke={a ? '#f59e0b' : '#334155'} strokeWidth={2} />}
          {/* Output wire */}
          <line x1={55} y1={30} x2={80} y2={30} stroke={out ? '#22c55e' : '#334155'} strokeWidth={2} />
          {out ? <circle cx={74} cy={30} r={4} fill="#22c55e" /> : <circle cx={74} cy={30} r={4} fill="#334155" stroke="#475569" strokeWidth={1.5} />}
        </svg>

        {/* 输出 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.3rem' }}>输出</div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontFamily: 'JetBrains Mono', fontWeight: 900,
            background: out ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
            border: `2px solid ${out ? '#22c55e' : '#334155'}`,
            color: out ? '#22c55e' : '#334155', boxShadow: out ? '0 0 16px rgba(34,197,94,0.3)' : 'none',
            transition: 'all 0.2s' }}>{out}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        <span style={{ color: g.color, fontWeight: 700 }}>{gateType}：</span>{g.desc}
      </div>

      {/* 真值表 */}
      <div style={{ marginTop: '0.875rem', overflowX: 'auto' }}>
        <table className="ca-table" style={{ maxWidth: 300, margin: '0 auto' }}>
          <thead>
            <tr>
              <th>A</th>
              {!g.single && <th>B</th>}
              <th style={{ color: g.color }}>{gateType} 输出</th>
            </tr>
          </thead>
          <tbody>
            {(g.single ? [[0],[1]] : [[0,0],[0,1],[1,0],[1,1]]).map((row, ri) => {
              const isActive = row[0] === a && (!g.single || row[1] === b);
              return (
                <tr key={ri} style={{ background: isActive ? `${g.color}08` : 'transparent' }}>
                  {row.map((v, ci) => <td key={ci} style={{ color: isActive ? g.color : '#64748b', fontFamily: 'JetBrains Mono', fontWeight: isActive ? 800 : 400, textAlign: 'center' }}>{v}</td>)}
                  <td style={{ color: (g.single ? g.fn(row[0]) : g.fn(row[0], row[1])) ? '#22c55e' : '#334155', fontFamily: 'JetBrains Mono', fontWeight: 800, textAlign: 'center' }}>
                    {g.single ? g.fn(row[0]) : g.fn(row[0], row[1])}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 4位加法器 ──
function HalfAdderDemo() {
  const [numA, setNumA] = useState(5);
  const [numB, setNumB] = useState(3);

  const sum = numA + numB;
  const carry = sum > 15 ? 1 : 0;
  const result = sum & 0xF;

  const toBin4 = n => (n & 0xF).toString(2).padStart(4, '0').split('');

  return (
    <div className="ca-interactive">
      <h3>➕ 4 位二进制加法器（点击位切换）</h3>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['A', numA, setNumA], ['B', numB, setNumB]].map(([lbl, val, setter]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>
              {lbl} = <span style={{ color: '#fbbf24', fontFamily: 'JetBrains Mono', fontWeight: 800 }}>{val}</span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {toBin4(val).map((bit, i) => (
                <div key={i} className={`ca-bit ${bit === '1' ? 'ca-bit-1' : 'ca-bit-0'}`}
                  onClick={() => setter(v => v ^ (1 << (3 - i)))}>{bit}</div>
              ))}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#334155', marginTop: '0.15rem', fontFamily: 'JetBrains Mono' }}>2³ 2² 2¹ 2⁰</div>
          </div>
        ))}

        <div style={{ fontSize: '1.5rem', color: '#f59e0b' }}>+</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#22c55e', marginBottom: '0.3rem' }}>
            S = <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800 }}>{result}</span>
            {carry ? <span style={{ color: '#ef4444', marginLeft: '0.3rem' }}>进位！</span> : ''}
          </div>
          {carry ? (
            <div style={{ display: 'flex', gap: '3px' }}>
              <div className="ca-bit ca-bit-1" style={{ border: '1.5px solid #ef4444', background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>1</div>
              {toBin4(result).map((bit, i) => (
                <div key={i} className={`ca-bit ${bit === '1' ? 'ca-bit-1' : 'ca-bit-0'}`}>{bit}</div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '3px' }}>
              {toBin4(result).map((bit, i) => (
                <div key={i} className={`ca-bit ${bit === '1' ? 'ca-bit-1' : 'ca-bit-0'}`}>{bit}</div>
              ))}
            </div>
          )}
          <div style={{ fontSize: '0.62rem', color: '#334155', marginTop: '0.15rem', fontFamily: 'JetBrains Mono' }}>{carry ? 'C 2³ 2² 2¹ 2⁰' : '2³ 2² 2¹ 2⁰'}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
        {numA} (0b{numA.toString(2).padStart(4,'0')}) + {numB} (0b{numB.toString(2).padStart(4,'0')}) = {sum} {carry ? `（溢出：5位结果 0b${sum.toString(2).padStart(5,'0')}）` : `(0b${result.toString(2).padStart(4,'0')})`}
      </div>
    </div>
  );
}

const BINARY_TOPICS = [
  {
    name: '进制转换', color: '#f59e0b',
    code: `# Python：各进制转换

n = 42
print(bin(n))   # 0b101010  (二进制)
print(oct(n))   # 0o52      (八进制)
print(hex(n))   # 0x2a      (十六进制)

# 反向转换
print(int('101010', 2))  # 42
print(int('2a', 16))     # 42

# 手工计算 42 的二进制：
# 42 ÷ 2 = 21 余 0
# 21 ÷ 2 = 10 余 1
# 10 ÷ 2 =  5 余 0
# 5  ÷ 2 =  2 余 1
# 2  ÷ 2 =  1 余 0
# 1  ÷ 2 =  0 余 1
# 从下往上读：101010 ✓

# 十六进制在计算机中的意义：
# 1个十六进制位 = 4个二进制位 (nibble)
# FF = 11111111 = 255 (8位最大值)
# 0xFF00_0000 >> 24 = 0xFF = 255

# 有符号整数（二补数）：
# +42  = 0b00101010
# -42  = ~42 + 1 = 0b11010110 (8位)
# 最高位为符号位：0=正，1=负
print(-42 & 0xFF)  # 214 (0b11010110)`,
  },
  {
    name: '位运算技巧', color: '#22c55e',
    code: `# 位运算：最快的运算（单个 CPU 周期）

n = 0b10110100  # 180

# 基础操作
print(n & 0x0F)   # 取低4位 = 0100 = 4
print(n | 0x01)   # 设置最低位 = 10110101
print(n ^ 0xFF)   # 取反(所有位) = 01001011
print(n >> 2)     # 右移2位(除以4) = 101101 = 45
print(n << 1)     # 左移1位(乘以2) = 1_01101000 = 360

# 实用技巧
print(n & (n-1))  # 清除最低位的1 = 10110000
print(n & (-n))   # 只保留最低位的1 = 100

# 判断2的幂次：
is_power_of_2 = lambda x: x > 0 and (x & (x-1)) == 0
print(is_power_of_2(16))  # True
print(is_power_of_2(12))  # False

# 交换两个整数（不用临时变量）：
a, b = 5, 9
a ^= b; b ^= a; a ^= b
print(a, b)  # 9, 5

# 计算整数中1的个数（popcount）：
print(bin(n).count('1'))  # 4
import ctypes
# CPU指令 POPCNT 可一个周期完成

# 掩码操作系统中的标志位：
READABLE  = 1 << 0  # 0b001 = 1
WRITABLE  = 1 << 1  # 0b010 = 2
EXCUTABLE = 1 << 2  # 0b100 = 4

perms = READABLE | WRITABLE  # 0b011 = 3
print(bool(perms & READABLE))   # True
print(bool(perms & EXCUTABLE))  # False`,
  },
];

export default function LessonDigital() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = BINARY_TOPICS[activeTopic];

  return (
    <div className="lesson-ca">
      <div className="ca-badge">⚡ module_02 — 数字电路基础</div>
      <div className="ca-hero">
        <h1>数字电路基础：二进制 / 逻辑门 / 加法器 / ALU</h1>
        <p>计算机只认识 <strong>0 和 1</strong>。所有的计算都规约到对二进制位的逻辑运算。5 个基本逻辑门（AND/OR/NOT/NAND/XOR）就能构造出半加器→全加器→ALU→CPU 的完整计算链路。</p>
      </div>

      <GateSimulator />
      <HalfAdderDemo />

      <div className="ca-section">
        <h2 className="ca-section-title">🔢 二进制与位运算</h2>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
          {BINARY_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.08)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="ca-code-wrap">
          <div className="ca-code-head"><div className="ca-code-dot" style={{ background: '#ef4444' }}/><div className="ca-code-dot" style={{ background: '#f59e0b' }}/><div className="ca-code-dot" style={{ background: '#22c55e' }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>digital.py</span></div>
          <div className="ca-code">{t.code}</div>
        </div>
      </div>

      <div className="ca-nav">
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/overview')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/isa')}>下一模块：指令集架构 →</button>
      </div>
    </div>
  );
}
