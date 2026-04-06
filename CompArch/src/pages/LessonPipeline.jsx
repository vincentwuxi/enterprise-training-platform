import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 五级流水线动画
const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'];
const STAGE_NAMES = { IF: '取指', ID: '译码', EX: '执行', MEM: '访存', WB: '写回' };
const STAGE_COLORS = { IF: '#f59e0b', ID: '#3b82f6', EX: '#22c55e', MEM: '#a855f7', WB: '#ef4444' };
const STAGE_DESC = {
  IF:  '从 PC 指向的内存地址取出指令，PC=PC+4',
  ID:  '译码指令，从寄存器文件读取源操作数',
  EX:  'ALU 执行运算（加减乘除逻辑比较）',
  MEM: '访问 Data Cache（LOAD/STORE需要，其他指令pass）',
  WB:  '写回运算结果到目标寄存器',
};

const INSTRUCTIONS = ['ADD x1,x2,x3', 'LW  x4,8(x1)', 'SUB x5,x6,x4', 'AND x7,x5,x1', 'BEQ x1,x2,+8'];
const COLORS = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444'];

function PipelineDemo() {
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const [hazard, setHazard] = useState(false);
  const timerRef = useRef(null);

  const MAX_CYCLES = 9;

  // 每条指令在每个周期处于哪个阶段（含数据冒险 stall）
  // hazard 模式：LW后接 SUB 有 1个 use-after-load hazard，SUB stall 1周期
  const getStage = (instrIdx, cycleNum) => {
    if (!hazard) {
      const startCycle = instrIdx;
      const offset = cycleNum - startCycle;
      if (offset < 0 || offset >= 5) return null;
      return STAGES[offset];
    } else {
      // LW(idx=1) 结束EX在cycle 4, SUB(idx=2)的EX需要等MEM完成才能拿到数据 → SUB stall 1 cycle
      const stallAt = 2; // SUB(idx=2) stall
      let startCycle = instrIdx;
      if (instrIdx >= stallAt) startCycle += 1; // stall 导致后续指令推迟1周期
      const offset = cycleNum - startCycle;
      if (offset < 0 || offset >= 5) return null;
      // 检查stall（SUB在ID阶段被检测到hazard）
      if (instrIdx === stallAt && offset === 1 && hazard) return 'STALL';
      return STAGES[Math.min(offset, 4)];
    }
  };

  const toggle = () => {
    if (running) { clearInterval(timerRef.current); setRunning(false); return; }
    setCycle(0);
    setRunning(true);
    let c = 0;
    timerRef.current = setInterval(() => {
      c++;
      setCycle(c);
      if (c >= MAX_CYCLES) { clearInterval(timerRef.current); setRunning(false); }
    }, 700);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const reset = () => { clearInterval(timerRef.current); setRunning(false); setCycle(0); };

  return (
    <div className="ca-interactive">
      <h3>🔄 五级流水线执行时序图
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="ca-btn" onClick={() => setHazard(h => !h)} style={{ fontSize: '0.75rem', borderColor: hazard ? '#ef4444' : undefined, color: hazard ? '#ef4444' : undefined }}>
            {hazard ? '🔴 冒险模式' : '🟢 正常模式'}
          </button>
          <button className="ca-btn primary" onClick={toggle} style={{ fontSize: '0.75rem' }}>{running ? '⏸ 暂停' : '▶ 开始'}</button>
          <button className="ca-btn" onClick={reset} style={{ fontSize: '0.75rem' }}>↺</button>
        </div>
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '2px', fontSize: '0.68rem', fontFamily: 'JetBrains Mono' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.3rem 0.5rem', textAlign: 'left', color: '#475569', fontWeight: 700, width: 120 }}>指令</th>
              {Array.from({ length: MAX_CYCLES }, (_, i) => (
                <th key={i} style={{ padding: '0.3rem 0.25rem', textAlign: 'center', color: i === cycle - 1 ? '#fbbf24' : '#334155', width: 44, fontWeight: i === cycle - 1 ? 800 : 400 }}>C{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INSTRUCTIONS.map((instr, idx) => (
              <tr key={idx}>
                <td style={{ padding: '2px 0.5rem', color: COLORS[idx], fontWeight: 700, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{instr}</td>
                {Array.from({ length: MAX_CYCLES }, (_, c) => {
                  const stage = getStage(idx, c);
                  const isActive = c === cycle - 1 && stage;
                  return (
                    <td key={c} style={{ padding: '2px' }}>
                      {stage ? (
                        <div className={`ca-stage ${isActive ? 'ca-active' : ''}`}
                          style={{ background: stage === 'STALL' ? 'rgba(239,68,68,0.08)' : `${STAGE_COLORS[stage]}12`,
                            border: `1px solid ${stage === 'STALL' ? '#ef444440' : STAGE_COLORS[stage] + '40'}`,
                            color: stage === 'STALL' ? '#f87171' : STAGE_COLORS[stage] }}>
                          {stage === 'STALL' ? '──' : stage}
                        </div>
                      ) : <div style={{ height: 28 }} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {STAGES.map(s => (
          <span key={s} style={{ fontSize: '0.68rem', color: STAGE_COLORS[s] }}>
            <strong>{s}</strong>={STAGE_NAMES[s]}
          </span>
        ))}
        {hazard && <span style={{ fontSize: '0.68rem', color: '#f87171' }}>🔴 Load-Use 数据冒险：SUB 被 stall 1周期（LW结果未就绪）</span>}
      </div>
    </div>
  );
}

const PIPELINE_TOPICS = [
  {
    name: '数据冒险', icon: '⚠️', color: '#ef4444',
    code: `# 数据冒险（Data Hazard）— 指令依赖尚未完成的前驱结果

# ── RAW (Read After Write) — 最常见 ──
ADD x1, x2, x3   # x1 = x2 + x3  (WB 在周期5)
SUB x4, x1, x5   # 需要读 x1     (ID 在周期3→读到旧值！)

# ── 解决方案1：Pipeline Stall（插入气泡） ──
ADD x1, x2, x3
NOP               # 插入空操作，等待 ADD 完成 WB
NOP
SUB x4, x1, x5   # 此时 x1 已正确

# ── 解决方案2：Forwarding / Bypassing（数据转发）──
# 硬件检测 EX/MEM 阶段结果，直接转发给后续指令的 EX 阶段
# ALU输出 → 直接送到下一条指令ALU的输入（不等 WB）
# 大多数RAW冒险可以通过转发解决，无需 stall！

# ── Load-Use 冒险（转发也不够）──
LW  x1, 8(x2)    # x1 = Mem[x2+8]（MEM阶段才有数据）
SUB x4, x1, x5   # 紧接着用 x1！MEM→EX 需要1周期延迟

# 无法避免：必须 stall 1周期（或编译器重排指令）
# 编译器优化：在 LW 和 USE 之间插入不相关的指令

# ── WAR / WAW（写后读/写后写）──
# 在无序执行(OoO)处理器中可能出现，通过寄存器重命名(RAT)解决`,
  },
  {
    name: '控制冒险', icon: '🔀', color: '#f59e0b',
    code: `# 控制冒险（Control Hazard）— 分支指令导致取错误的下一条指令

# 分支指令需要到 EX 阶段才知道是否跳转
# 在此之前已经取了 IF/ID 的后续指令 → 若真的跳转就取错了！

# ── 解决方案1：分支预测（Branch Prediction）──
# 静态预测：① 总是预测不跳转（Not-Taken）
#           ② 向后跳转预测跳转（循环优化）
# 
# 动态预测：
# 1-bit 饱和计数器：记录上一次是否跳转
# 2-bit 饱和计数器（最常用）：
#   状态机: 强不跳(00)↔弱不跳(01)↔弱跳(10)↔强跳(11)
#   连续两次预测错误才改变倾向（避免抖动）
#
# 现代CPU（如Intel Alder Lake）：
# 分支目标缓存(BTB) + 全局历史寄存器 + TAGE预测器
# 预测准确率 > 98%

# ── 解决方案2：延迟槽（MIPS/早期ARM）──
BEQ x1, x2, Target    # 跳转指令
ADD x3, x4, x5        # 延迟槽：无论是否跳转都执行！
# Target:

# ── 解决方案3：分支预测失败代价 ──
# 五级流水线：预测失败冲刷2条指令（2周期惩罚）
# 深度流水线（如Pentium 4的31级）：预测失败惩罚高达20+周期！
# 这是为什么 Spectre/Meltdown 攻击成立的原因之一（推测执行）`,
  },
  {
    name: '超标量 & OoO', icon: '⚡', color: '#22c55e',
    code: `# 超标量处理器（Superscalar）和乱序执行（Out-of-Order）

# ── 超标量：同一周期发射多条指令 ──
# Intel Core i9：8路超标量，每周期最多发射8条µops
# 每周期退役（commit）最多也是8条

# ── 乱序执行（OoO/OOE）──
# 经典Tomasulo算法（1967年，IBM 360/91）：
# 1. 指令不按程序序执行，只要操作数就绪就立刻执行
# 2. 寄存器重命名（消除 WAR/WAW 假冒险）
# 3. 保留站（Reservation Station）存储等待的指令
# 4. 重排序缓冲（ROB）保证按程序序提交结果

# 示例：乱序执行的威力
# 顺序执行（有依赖链）：
DIV r1, r2, r3    # 耗时20周期（ALU慢操作）
MUL r4, r1, r5    # 必须等 DIV 完成（依赖r1）

ADD r6, r7, r8    # 与上面无关！顺序执行白白等待
ADD r9, r10, r11  # 不相关指令也无法先执行

# OoO执行：检测到 ADD 与 DIV/MUL 无依赖 → 立刻并行执行
DIV r1 | ADD r6, r7, r8 + ADD r9, r10, r11  ← 并行！
MUL r4 (等div完成)

# ── 推测执行（Speculative Execution）──
# 配合分支预测：预测分支走向，提前执行分支后的指令
# 如果预测错误：冲刷所有推测执行的结果（无副作用）
# Spectre 攻击利用了这一点：推测执行可以访问越权内存，
# 结果虽然被冲刷但 Cache 时序侧信道泄漏了内容！`,
  },
];

export default function LessonPipeline() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = PIPELINE_TOPICS[activeTopic];

  return (
    <div className="lesson-ca">
      <div className="ca-badge blue">🔄 module_04 — CPU 流水线</div>
      <div className="ca-hero">
        <h1>CPU 流水线：五级流水 / 数据冒险 / 分支预测</h1>
        <p>流水线是 CPU 提升吞吐量的核心技术：把指令执行拆成 5 个阶段，让 5 条指令同时在不同阶段执行，理想情况下<strong>吞吐量提升 5 倍</strong>。真实挑战来自数据冒险和控制冒险。</p>
      </div>

      <PipelineDemo />

      <div className="ca-section">
        <h2 className="ca-section-title">⚙️ 五个流水线阶段详解</h2>
        <div className="ca-grid-3" style={{ marginBottom: '0.875rem' }}>
          {STAGES.map(s => (
            <div key={s} className="ca-card" style={{ borderColor: `${STAGE_COLORS[s]}20`, padding: '0.875rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: STAGE_COLORS[s], fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s} — {STAGE_NAMES[s]}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>{STAGE_DESC[s]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ca-section">
        <h2 className="ca-section-title">🚧 三大流水线冒险与应对</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {PIPELINE_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.08)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="ca-code-wrap">
          <div className="ca-code-head"><div className="ca-code-dot" style={{ background: '#ef4444' }}/><div className="ca-code-dot" style={{ background: '#f59e0b' }}/><div className="ca-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span></div>
          <div className="ca-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ca-nav">
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/isa')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/cache')}>下一模块：Cache 层次结构 →</button>
      </div>
    </div>
  );
}
