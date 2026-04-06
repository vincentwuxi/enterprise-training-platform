import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 指令编码可视化
const INSTR_FORMATS = {
  'R-type (寄存器)': {
    fields: [
      { name: 'opcode', bits: 7, color: '#f59e0b', desc: '操作码：0110011' },
      { name: 'rd',     bits: 5, color: '#22c55e', desc: '目标寄存器' },
      { name: 'funct3', bits: 3, color: '#3b82f6', desc: '功能码（区分同opcode不同指令）' },
      { name: 'rs1',    bits: 5, color: '#a855f7', desc: '源寄存器1' },
      { name: 'rs2',    bits: 5, color: '#ef4444', desc: '源寄存器2' },
      { name: 'funct7', bits: 7, color: '#64748b', desc: '功能码扩展（如ADD vs SUB）' },
    ],
    example: 'ADD x1, x2, x3  // x1 = x2 + x3',
    desc: 'R-type 用于寄存器–寄存器运算（ADD/SUB/AND/OR/SLT等）',
  },
  'I-type (立即数)': {
    fields: [
      { name: 'opcode', bits: 7,  color: '#f59e0b', desc: '操作码：0000011（LOAD）' },
      { name: 'rd',     bits: 5,  color: '#22c55e', desc: '目标寄存器' },
      { name: 'funct3', bits: 3,  color: '#3b82f6', desc: '数据宽度（lw=010, lb=000）' },
      { name: 'rs1',    bits: 5,  color: '#a855f7', desc: '基址寄存器' },
      { name: 'imm',    bits: 12, color: '#ef4444', desc: '有符号立即数偏移（-2048~2047）' },
    ],
    example: 'LW x1, 8(x2)   // x1 = Mem[x2 + 8]',
    desc: 'I-type 用于立即数运算和 LOAD（ADDI/LW/JALR等）',
  },
  'S-type (存储)': {
    fields: [
      { name: 'opcode', bits: 7, color: '#f59e0b', desc: '操作码：0100011' },
      { name: 'imm4:0', bits: 5, color: '#ef4444', desc: '偏移量低5位' },
      { name: 'funct3', bits: 3, color: '#3b82f6', desc: '数据宽度' },
      { name: 'rs1',    bits: 5, color: '#a855f7', desc: '基址寄存器' },
      { name: 'rs2',    bits: 5, color: '#22c55e', desc: '存储的数据寄存器' },
      { name: 'imm11:5',bits: 7, color: '#ef4444', desc: '偏移量高7位（合并得12位偏移）' },
    ],
    example: 'SW x1, 16(x2)  // Mem[x2 + 16] = x1',
    desc: 'S-type 用于 STORE 指令（SW/SH/SB）',
  },
};

const ADDR_MODES = [
  { name: '立即数寻址', example: 'MOV R1, #42', desc: '操作数直接编码在指令中，速度最快，但范围受指令位宽限制（通常12~16位）' },
  { name: '寄存器寻址', example: 'ADD R1, R2', desc: '操作数在寄存器中，最常用的寻址方式，速度极快（寄存器访问<1周期）' },
  { name: '直接寻址', example: 'LOAD R1, [4096]', desc: '地址直接写在指令里，只能访问固定地址，例如访问全局变量' },
  { name: '间接寻址', example: 'LOAD R1, [R2]', desc: '寄存器中存储的是地址，常用于指针操作（C语言*ptr解引用）' },
  { name: '相对寻址', example: 'LW R1, 8(R2)', desc: '基址+偏移，最常用于访问结构体成员和栈帧（ARM/RISC-V主要方式）' },
  { name: 'PC相对寻址', example: 'BEQ R1, R2, +16', desc: '分支目标相对当前PC的偏移，允许代码位置无关（PIC），链接时不需调整' },
];

const ISA_CMP = [
  { feat: '设计哲学', risc: '简单指令，一周期执行', cisc: '复杂指令，可直接完成高级操作', riscp: '#22c55e', ciscp: '#f59e0b' },
  { feat: '指令数量', risc: '少（<100条）', cisc: '多（x86有>1000条编码）', riscp: '#22c55e', ciscp: '#64748b' },
  { feat: '指令长度', risc: '固定（32bit）', cisc: '变长（x86: 1~15字节）', riscp: '#22c55e', ciscp: '#64748b' },
  { feat: '内存访问', risc: '只有LOAD/STORE能访问内存', cisc: '任意指令可直接操作内存', riscp: '#22c55e', ciscp: '#f59e0b' },
  { feat: '寄存器数量', risc: '多（32个通用）', cisc: '少（x86-64: 16个）', riscp: '#22c55e', ciscp: '#64748b' },
  { feat: '流水线友好', risc: '非常友好（定长指令）', cisc: '复杂（变长需预解码）', riscp: '#22c55e', ciscp: '#64748b' },
  { feat: '典型代表', risc: 'ARM / RISC-V / MIPS / Apple M系列', cisc: 'x86-32 / x86-64 / Intel / AMD', riscp: '#3b82f6', ciscp: '#3b82f6' },
];

export default function LessonISA() {
  const navigate = useNavigate();
  const [activeFormat, setActiveFormat] = useState('R-type (寄存器)');
  const [selectedField, setSelectedField] = useState(null);
  const fmt = INSTR_FORMATS[activeFormat];

  return (
    <div className="lesson-ca">
      <div className="ca-badge green">💻 module_03 — 指令集架构</div>
      <div className="ca-hero">
        <h1>指令集架构（ISA）：RISC/CISC / 指令格式 / 寻址模式</h1>
        <p>ISA 是软件和硬件之间的<strong>唯一接口</strong>——CPU 保证能执行哪些指令，操作系统和编译器据此生成机器码。RISC-V 作为教学首选 ISA，帮助你理解指令编码、寻址模式和设计哲学。</p>
      </div>

      {/* RISC-V 指令格式可视化 */}
      <div className="ca-interactive">
        <h3>🔢 RISC-V 32位指令格式解析（点击字段查看含义）</h3>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {Object.keys(INSTR_FORMATS).map(name => (
            <button key={name} onClick={() => { setActiveFormat(name); setSelectedField(null); }}
              style={{ flex: 1, minWidth: 120, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center', transition: 'all 0.15s',
                border: `1px solid ${activeFormat === name ? '#f59e0b60' : 'rgba(255,255,255,0.08)'}`,
                background: activeFormat === name ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                color: activeFormat === name ? '#fbbf24' : '#64748b' }}>
              {name}
            </button>
          ))}
        </div>

        {/* 位字段可视化 */}
        <div style={{ marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>bit[31]</span><span>bit[0]</span>
          </div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '0.3rem' }}>
            {[...fmt.fields].reverse().map((f, i) => (
              <div key={f.name} onClick={() => setSelectedField(selectedField === f.name ? null : f.name)}
                style={{ flex: f.bits, minWidth: f.bits * 5, height: 36, borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
                  background: selectedField === f.name ? `${f.color}25` : `${f.color}10`,
                  border: `1.5px solid ${selectedField === f.name ? f.color : f.color + '40'}` }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: selectedField === f.name ? f.color : f.color + 'a0', fontFamily: 'JetBrains Mono' }}>{f.name}</div>
                <div style={{ fontSize: '0.55rem', color: '#334155' }}>[{f.bits}bit]</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...fmt.fields].reverse().map(f => (
              <div key={f.name} style={{ flex: f.bits, minWidth: f.bits * 5, textAlign: 'center', fontSize: '0.55rem', color: '#334155', fontFamily: 'JetBrains Mono' }}>{f.bits}b</div>
            ))}
          </div>
        </div>

        {selectedField && (
          <div style={{ padding: '0.5rem 0.75rem', background: `${fmt.fields.find(f=>f.name===selectedField)?.color}08`, border: `1px solid ${fmt.fields.find(f=>f.name===selectedField)?.color}25`, borderRadius: '7px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <strong style={{ color: fmt.fields.find(f=>f.name===selectedField)?.color }}>{selectedField}：</strong>
            {fmt.fields.find(f=>f.name===selectedField)?.desc}
          </div>
        )}
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#22c55e', padding: '0.375rem 0.625rem', background: 'rgba(34,197,94,0.05)', borderRadius: '5px', marginBottom: '0.3rem' }}>
          示例：{fmt.example}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{fmt.desc}</div>
      </div>

      {/* 寻址模式 */}
      <div className="ca-section">
        <h2 className="ca-section-title">🎯 六大寻址模式</h2>
        <div className="ca-grid-2">
          {ADDR_MODES.map(a => (
            <div key={a.name} className="ca-card" style={{ padding: '0.875rem' }}>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{a.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#22c55e', marginBottom: '0.3rem' }}>{a.example}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RISC vs CISC */}
      <div className="ca-section">
        <h2 className="ca-section-title">⚖️ RISC vs CISC 全面对比</h2>
        <div className="ca-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ca-table">
            <thead>
              <tr>
                <th>特性</th>
                <th style={{ color: '#22c55e' }}>RISC（精简）</th>
                <th style={{ color: '#f59e0b' }}>CISC（复杂）</th>
              </tr>
            </thead>
            <tbody>
              {ISA_CMP.map(row => (
                <tr key={row.feat}>
                  <td style={{ fontWeight: 600, color: '#94a3b8' }}>{row.feat}</td>
                  <td style={{ color: row.riscp, fontSize: '0.8rem' }}>{row.risc}</td>
                  <td style={{ color: row.ciscp, fontSize: '0.8rem' }}>{row.cisc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '7px', fontSize: '0.78rem', color: '#64748b' }}>
          💡 <strong style={{ color: '#fbbf24' }}>现代趋势：</strong>x86 CPU 内部将 CISC 指令解码为 RISC-like 的微操作（µops）再执行。本质上现代高性能 CPU 都是 RISC 内核 + 硬件翻译层。Apple M 系列（ARM RISC）在移动端已超越 Intel，正向桌面端发起挑战。
        </div>
      </div>

      <div className="ca-nav">
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/digital')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/pipeline')}>下一模块：CPU 流水线 →</button>
      </div>
    </div>
  );
}
