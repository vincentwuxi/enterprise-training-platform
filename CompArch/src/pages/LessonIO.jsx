import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const IO_METHODS = [
  { name: '程序轮询 (Polling)', icon: '🔄', color: '#f59e0b', pros: '实现简单，延迟可控', cons: 'CPU 持续浪费在等待，100% 占用', when: '嵌入式系统简单外设、极低延迟场景' },
  { name: '中断驱动 (Interrupt)', icon: '🔔', color: '#22c55e', pros: 'CPU 可做其他事，效率高', cons: '高频中断时上下文切换开销大', when: '鼠标/键盘/网卡（中低频率 I/O）' },
  { name: 'DMA 传输', icon: '🚀', color: '#3b82f6', pros: 'CPU 完全不参与数据传输', cons: '需要额外 DMA 控制器硬件', when: '磁盘/网卡大块数据传输（MB级）' },
  { name: 'MMIO + 轮询', icon: '⚡', color: '#a855f7', pros: '用户态直接访问设备寄存器，无系统调用', cons: '需要设备支持，绕过操作系统保护', when: 'DPDK 网络 / RDMA / SPDK 存储 NVMe' },
];

const BUS_TYPES = [
  { name: 'PCIe 5.0 x16', bw: '128 GB/s 双向', latency: '~100ns', use: 'GPU / 高端 NVMe SSD', color: '#f59e0b' },
  { name: 'USB 4', bw: '40 Gbps', latency: '~1μs', use: '外设/存储', color: '#3b82f6' },
  { name: 'DDR5', bw: '100+ GB/s', latency: '~70ns', use: '主内存(DRAM)', color: '#22c55e' },
  { name: 'SATA III', bw: '600 MB/s', latency: '~100μs', use: '传统 HDD/SSD', color: '#64748b' },
  { name: 'NVMe (PCIe)', bw: '7+ GB/s', latency: '~10μs', use: '高端 SSD', color: '#a855f7' },
  { name: 'Thunderbolt 4', bw: '40 Gbps', latency: '~1μs', use: '高速外设/eGPU', color: '#ef4444' },
];

const IO_TOPICS = [
  {
    name: 'DMA 原理', icon: '🚀', color: '#3b82f6',
    code: `# DMA（Direct Memory Access）无 CPU 介入的数据传输

# ── DMA 传输流程 ──
# 1. CPU 初始化 DMA 控制器（写寄存器）：
#    - 源地址（设备/内存缓冲区）
#    - 目标地址（内存/设备）
#    - 传输字节数
#    - 方向（内存→设备 或 设备→内存）
#    - 传输宽度（8/16/32/64位）

# 2. DMA 控制器接管总线，CPU 去做其他事

# 3. DMA 传输完成 → 发中断通知 CPU

# Python 模拟 DMA 读盘（实际是系统调用）：
import asyncio

async def dma_read(disk_addr, buf_size):
    print("CPU: 初始化 DMA 控制器...")
    print(f"  src=disk[{disk_addr}], dst=mem_buf, size={buf_size}B")
    
    # CPU 提交后可以去做别的事（非阻塞）
    print("CPU: 去执行其他任务...")
    await asyncio.sleep(0.001)   # 模拟 DMA 传输时间（磁盘 I/O）
    
    # DMA 完成，发中断
    print("DMA 控制器: 传输完成，触发中断!")
    return True

# ── Scatter-Gather DMA ──
# 现代 DMA 支持不连续内存（SGList）：
# 一次传输可以写入多个不连续的内存缓冲区（iovec）
# 避免用户态/内核态都分配连续大内存的困难

# ── Zero Copy（零拷贝）── 最重要的优化！
# 传统文件发送：磁盘→内核buf→用户buf→内核socket buf→网卡  (4次拷贝)
# sendfile() 系统调用：磁盘→内核buf→网卡   (内核态2次拷贝，0次用户态)
# mmap + write：磁盘→内核buf（共享映射）→网卡  (2次拷贝)
# splice()：管道间零拷贝，内核直接转移页面所有权`,
  },
  {
    name: '中断机制', icon: '🔔', color: '#22c55e',
    code: `# CPU 中断机制详解

# ── 中断类型 ──
# 外部中断（硬件中断）：设备就绪（网卡/键盘）→ 触发 IRQ
# 内部中断（异常/陷阱）：
#   - 除零异常（#DE, exception 0）
#   - 缺页异常（#PF, exception 14）
#   - 调试断点（#BP, exception 3）
#   - 系统调用（int 0x80 / syscall 指令）← 软件中断

# ── IDT（中断描述符表）──
# 256条目，每条目指向中断处理例程（ISR）的地址
# IDTR 寄存器保存 IDT 基址

# ── 中断处理流程 ──
# 1. CPU 完成当前指令（精确中断保证）
#    (软件看不到"指令执行一半时"的中间状态)
# 2. 硬件自动 push: SS, RSP, RFLAGS, CS, RIP（返回地址）
# 3. 从 IDT 获取 ISR 地址
# 4. 跳转执行 ISR（特权级可能从 Ring3 → Ring0）

# Linux 网络收包中断路径（简化）：
# NIC DMA → 系统内存 RX Ring
# ↓ 网卡拉高 MSI-X 中断线
# CPU APIC 接收中断 → 暂停当前任务
# ↓ 调用 net_rx_action (NAPI 软中断)
# 读取 RX Ring → sk_buff → netif_receive_skb
# ↓ TCP/IP 协议栈处理
# 数据到达 socket 接收缓冲区 → epoll 通知应用

# ── NAPI（New API）── 高速网卡优化
# 传统：每包一个中断（万兆网卡 14M包/s = 1400万 IRQ/s！）
# NAPI：第一个包触发中断，随后转为轮询模式，处理完关中再开
import select
epoll = select.epoll()
epoll.register(sock.fileno(), select.EPOLLIN)
events = epoll.poll(timeout=1)   # edge-triggered 事件驱动`,
  },
];

export default function LessonIO() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = IO_TOPICS[activeTopic];

  return (
    <div className="lesson-ca">
      <div className="ca-badge red">🚌 module_07 — I/O 系统</div>
      <div className="ca-hero">
        <h1>I/O 系统：总线 / DMA / 中断 / PCIe / 零拷贝</h1>
        <p>CPU 与外部世界的通信通过 I/O 总线完成。理解<strong>轮询 vs 中断 vs DMA</strong>的权衡，以及零拷贝等优化技术，是开发高性能网络/存储系统的基础。</p>
      </div>

      {/* 四种 I/O 方式 */}
      <div className="ca-interactive">
        <h3>⚖️ 四种 I/O 实现方式对比</h3>
        <div className="ca-grid-2">
          {IO_METHODS.map(m => (
            <div key={m.name} className="ca-card" style={{ borderColor: `${m.color}20`, padding: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span>{m.icon}</span>
                <span style={{ fontWeight: 800, color: m.color, fontSize: '0.82rem' }}>{m.name}</span>
              </div>
              <div style={{ fontSize: '0.73rem', color: '#22c55e', marginBottom: '0.15rem' }}>✅ {m.pros}</div>
              <div style={{ fontSize: '0.73rem', color: '#f87171', marginBottom: '0.15rem' }}>❌ {m.cons}</div>
              <div style={{ fontSize: '0.68rem', color: '#475569' }}>应用: {m.when}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 总线速度 */}
      <div className="ca-section">
        <h2 className="ca-section-title">🚌 主流总线带宽对比</h2>
        <div className="ca-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ca-table">
            <thead>
              <tr><th>总线</th><th>带宽</th><th>延迟</th><th>用途</th></tr>
            </thead>
            <tbody>
              {BUS_TYPES.map(b => (
                <tr key={b.name}>
                  <td style={{ fontWeight: 700, color: b.color, fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>{b.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#fbbf24' }}>{b.bw}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#64748b' }}>{b.latency}</td>
                  <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ca-section">
        <h2 className="ca-section-title">🔧 DMA 与中断机制</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {IO_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.08)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ca-code-wrap">
          <div className="ca-code-head"><div className="ca-code-dot" style={{ background: '#ef4444' }}/><div className="ca-code-dot" style={{ background: '#f59e0b' }}/><div className="ca-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span></div>
          <div className="ca-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ca-nav">
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/memory')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/parallel')}>下一模块：并行架构 →</button>
      </div>
    </div>
  );
}
