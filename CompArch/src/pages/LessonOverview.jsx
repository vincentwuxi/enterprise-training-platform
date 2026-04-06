import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const VON_LAYERS = [
  { label: '应用程序', sub: 'Word / Chrome / Python', color: '#a855f7', h: 36 },
  { label: '操作系统', sub: 'Linux / Windows / macOS', color: '#3b82f6', h: 36 },
  { label: '指令集架构 ISA', sub: 'x86-64 / ARM / RISC-V', color: '#22c55e', h: 36 },
  { label: '微体系结构', sub: '流水线 / Cache / 分支预测', color: '#f59e0b', h: 36 },
  { label: '数字电路', sub: '逻辑门 / 寄存器 / ALU', color: '#ef4444', h: 36 },
  { label: '晶体管（CMOS）', sub: '2nm ~ 7nm 工艺', color: '#64748b', h: 36 },
];

const HISTORY = [
  { year: '1945', name: 'ENIAC', desc: '第一台电子计算机，18000个真空管，占地170㎡，30T重', icon: '🏭' },
  { year: '1958', name: '集成电路', desc: '基尔比发明，将晶体管集成到单片硅芯片，开启摩尔定律时代', icon: '💿' },
  { year: '1971', name: 'Intel 4004', desc: '第一款商用CPU，4位寄存器，2300个晶体管，10μm工艺', icon: '⚡' },
  { year: '1985', name: 'x86-32位', desc: 'Intel 386，第一款32位处理器，275000晶体管，支持保护模式', icon: '🖥️' },
  { year: '2003', name: 'x86-64', desc: 'AMD64扩展指令集，64位地址空间，16个通用寄存器', icon: '🚀' },
  { year: '2020', name: 'Apple M1', desc: 'ARM 5nm，160亿晶体管，统一内存架构，性能功耗比革命', icon: '🍎' },
  { year: '2024', name: 'NVIDIA B200', desc: 'AI时代GPU，208亿晶体管，9PetaFLOPS FP8算力', icon: '🤖' },
];

const PERF_EQ = [
  { term: 'CPU时间', formula: '= 指令数 × CPI × 时钟周期', color: '#f59e0b' },
  { term: '指令数', formula: '↓ 靠编译器优化 + 高效算法', color: '#22c55e' },
  { term: 'CPI（每指令周期数）', formula: '↓ 靠流水线 + 超标量 + 分支预测', color: '#3b82f6' },
  { term: '时钟周期（1/频率）', formula: '↓ 靠更先进的工艺（更短的门延迟）', color: '#ef4444' },
];

export default function LessonOverview() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeYear, setActiveYear] = useState(null);

  return (
    <div className="lesson-ca">
      <div className="ca-badge">🏗️ module_01 — 体系结构总览</div>
      <div className="ca-hero">
        <h1>计算机体系结构：从晶体管到应用程序</h1>
        <p>计算机是一台按层次构建的复杂机器。最底层是<strong>晶体管</strong>开关，一层层向上抽象出逻辑门→ALU→CPU→指令集→操作系统→应用程序。理解这个层次模型，是理解系统性能、调试、编译器优化的基础。</p>
      </div>

      {/* 冯诺依曼层次图 */}
      <div className="ca-interactive">
        <h3>🏛️ 计算机系统层次模型（点击每层查看详情）</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 280px' }}>
            {VON_LAYERS.map((layer, i) => (
              <div key={i} onClick={() => setActiveLayer(activeLayer === i ? null : i)}
                style={{ height: layer.h, marginBottom: 4, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeLayer === i ? `${layer.color}18` : 'rgba(255,255,255,0.02)',
                  border: `1.5px solid ${activeLayer === i ? layer.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  width: `${100 - i * 7}%`, margin: '0 auto 4px' }}>
                <div style={{ fontWeight: 800, color: activeLayer === i ? layer.color : '#64748b', fontSize: '0.78rem' }}>{layer.label}</div>
                <div style={{ fontSize: '0.62rem', color: '#334155', fontFamily: 'JetBrains Mono' }}>{layer.sub}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#334155', marginTop: '0.3rem' }}>← 从上到下：抽象层级从高到低</div>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            {activeLayer !== null ? (
              <div className="ca-card" style={{ borderColor: `${VON_LAYERS[activeLayer].color}25` }}>
                <div style={{ color: VON_LAYERS[activeLayer].color, fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>{VON_LAYERS[activeLayer].label}</div>
                {[
                  ['负责什么', ['定义计算机能做哪些操作 (ISA是合同)', '操作系统管理资源和抽象', '应用程序完成用户任务']],
                  ['为什么重要', ['每层只看上下相邻层，不关心其他层', '指令集是软硬件的唯一接口', '应用程序员不需要了解电路细节']],
                  ['工程实践', ['改善某层不影响其他层(可替换)', 'ISA向后兼容(x86从1978延续至今)', '性能瓶颈需要跨层分析']],
                ].slice(activeLayer < 2 ? 0 : activeLayer < 4 ? 1 : 2, activeLayer < 2 ? 1 : activeLayer < 4 ? 2 : 3).map(([title, items]) =>
                  <div key={title}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>
                    {items.map(it => <div key={it} style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>✦ {it}</div>)}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#334155', marginTop: '0.5rem' }}>层级 {VON_LAYERS.length - activeLayer}/{VON_LAYERS.length}（越小越底层）</div>
              </div>
            ) : (
              <div style={{ color: '#334155', fontSize: '0.8rem', padding: '1rem', textAlign: 'center' }}>← 点击左侧层级棱柱查看详情</div>
            )}

            <div className="ca-card" style={{ marginTop: '0.75rem', padding: '0.875rem' }}>
              <div style={{ fontWeight: 700, color: '#e8e0c0', fontSize: '0.82rem', marginBottom: '0.4rem' }}>⚡ 性能铁三角</div>
              {PERF_EQ.map(p => (
                <div key={p.term} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                  <span style={{ color: p.color, fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, minWidth: 120 }}>{p.term}</span>
                  <span style={{ fontSize: '0.73rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{p.formula}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 历史时间轴 */}
      <div className="ca-section">
        <h2 className="ca-section-title">🕰️ CPU 发展里程碑（点击查看详情）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {HISTORY.map((h, i) => (
            <div key={i} onClick={() => setActiveYear(activeYear === i ? null : i)}
              style={{ flex: 1, minWidth: 100, padding: '0.625rem 0.5rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activeYear === i ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeYear === i ? '#f59e0b50' : 'rgba(255,255,255,0.06)'}` }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>{h.icon}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 800, color: activeYear === i ? '#fbbf24' : '#64748b' }}>{h.year}</div>
              <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.1rem' }}>{h.name}</div>
            </div>
          ))}
        </div>
        {activeYear !== null && (
          <div className="ca-card" style={{ marginTop: '0.75rem', borderColor: 'rgba(245,158,11,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>{HISTORY[activeYear].icon}</span>
              <div>
                <div style={{ fontWeight: 800, color: '#fbbf24' }}>{HISTORY[activeYear].year} — {HISTORY[activeYear].name}</div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>{HISTORY[activeYear].desc}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 冯诺依曼架构 */}
      <div className="ca-section">
        <h2 className="ca-section-title">🖥️ 冯·诺依曼架构核心组件</h2>
        <div className="ca-grid-2">
          {[
            { name: 'CPU（中央处理器）', icon: '🧠', color: '#f59e0b', items: ['控制单元（CU）：指令译码、发出控制信号', '算术逻辑单元（ALU）：执行计算和比较', '寄存器文件：32~256个超快速存储单元（<1ps）', 'PC（程序计数器）：指向下一条待执行指令'] },
            { name: '内存（主存 RAM）', icon: '💾', color: '#3b82f6', items: ['存储程序和数据（程序存储原理）', 'DRAM：动态随机存取，需要周期刷新', '按字节寻址（通常64-bit对齐访问更快）', '容量大（GB级）但比寄存器慢约100倍'] },
            { name: '输入设备', icon: '⌨️', color: '#22c55e', items: ['键盘：扫描码→PS/2/USB HID协议', '鼠标：光学/激光→坐标差分', '磁盘/SSD：大容量持久存储', '网卡：数据包收发'] },
            { name: '输出设备', icon: '🖥️', color: '#a855f7', items: ['显示器：帧缓冲→GPU→HDMI/DP', '打印机：DMA驱动', '网络：发送缓冲区→MAC层→物理层', '音频：DAC数模转换'] },
          ].map(c => (
            <div key={c.name} className="ca-card" style={{ borderColor: `${c.color}20` }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                <span style={{ fontWeight: 800, color: c.color, fontSize: '0.88rem' }}>{c.name}</span>
              </div>
              {c.items.map(it => <div key={it} style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>▸ {it}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="ca-nav">
        <div />
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/digital')}>下一模块：数字电路基础 →</button>
      </div>
    </div>
  );
}
