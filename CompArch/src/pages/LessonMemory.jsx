import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 虚拟地址翻译可视化
function VMTranslator() {
  const [va, setVa] = useState(0x12345678);
  const PAGE_SIZE = 4096;  // 4KB
  const VPN = Math.floor(va / PAGE_SIZE);
  const offset = va % PAGE_SIZE;
  const PAGE_TABLE = { 0x123: 0x7F0, 0x456: 0x200, 0x789: 0xA01, 0xABC: 0x3F5 };
  const PFN = PAGE_TABLE[VPN] || null;
  const PA = PFN !== null ? (PFN * PAGE_SIZE + offset) : null;

  const addrToBin = n => n.toString(2).padStart(32, '0');
  const vaStr = addrToBin(va);

  const fields = [
    { name: 'VPN[1]',  bits: 10, value: vaStr.slice(0,10),  color: '#f59e0b', desc: `一级页目录索引 = 0x${parseInt(vaStr.slice(0,10),2).toString(16).toUpperCase()}` },
    { name: 'VPN[0]',  bits: 10, value: vaStr.slice(10,20), color: '#3b82f6', desc: `二级页表索引 = 0x${parseInt(vaStr.slice(10,20),2).toString(16).toUpperCase()}` },
    { name: 'Offset',  bits: 12, value: vaStr.slice(20,32), color: '#22c55e', desc: `页内偏移 = 0x${parseInt(vaStr.slice(20,32),2).toString(16).toUpperCase()} (4KB以内)` },
  ];

  return (
    <div className="ca-interactive">
      <h3>🗺️ 虚拟地址 → 物理地址翻译（两级页表）</h3>

      {/* 地址输入 */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.875rem' }}>
        {[0x12345678, 0x45678ABC, 0x00001234, 0xDEADBEEF].map(a => (
          <button key={a} onClick={() => setVa(a)}
            style={{ padding: '0.375rem 0.625rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.15s',
              border: `1px solid ${va === a ? '#f59e0b60' : 'rgba(255,255,255,0.08)'}`,
              background: va === a ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
              color: va === a ? '#fbbf24' : '#64748b' }}>
            0x{a.toString(16).toUpperCase()}
          </button>
        ))}
      </div>

      {/* 32位地址位字段 */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.2rem' }}>虚拟地址: 0x{va.toString(16).toUpperCase().padStart(8,'0')}</div>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
          {fields.map(f => (
            <div key={f.name} style={{ flex: f.bits, height: 34, borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `${f.color}10`, border: `1.5px solid ${f.color}40` }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 800, color: f.color, fontFamily: 'JetBrains Mono' }}>{f.name}</div>
              <div style={{ fontSize: '0.52rem', color: '#334155', fontFamily: 'JetBrains Mono' }}>[{f.bits}bit]</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {fields.map(f => (
            <div key={f.name} style={{ flex: f.bits, textAlign: 'center', fontSize: '0.58rem', color: f.color, fontFamily: 'JetBrains Mono' }}>{f.desc}</div>
          ))}
        </div>
      </div>

      {/* 翻译流程 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {[
          { icon: '📖', label: 'CR3 → 一级页目录', color: '#f59e0b', val: `VPN[1]=0x${parseInt(vaStr.slice(0,10),2).toString(16).toUpperCase()} → 找到二级页表基址` },
          { icon: '📋', label: '二级页表查询', color: '#3b82f6', val: `VPN[0]=0x${parseInt(vaStr.slice(10,20),2).toString(16).toUpperCase()} → PFN=${PFN !== null ? '0x'+PFN.toString(16).toUpperCase() : '❌ 缺页！'}` },
          { icon: '🎯', label: '物理地址拼接', color: '#22c55e', val: PA !== null ? `PA = PFN(0x${PFN.toString(16).toUpperCase()}) × 4096 + Offset(0x${offset.toString(16).toUpperCase()}) = 0x${PA.toString(16).toUpperCase().padStart(8,'0')}` : '❌ Page Fault！OS 触发缺页中断，从磁盘调入页面' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', padding: '0.4rem 0.625rem', borderRadius: '6px', background: `${s.color}05`, border: `1px solid ${s.color}15` }}>
            <span>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEGMENTS = [
  { name: 'Kernel Space', range: '0xFFFF8000_00000000 ~ 0xFFFFFFFF_FFFFFFFF', size: '128TB', color: '#ef4444', desc: '内核独占，用户态不可访问（CPL=3时访问触发 GPF）' },
  { name: '栈 (Stack)', range: '↓ 向低地址生长', size: '8MB (ulimit)', color: '#f59e0b', desc: '函数调用帧、局部变量、寄存器保存区；ESP/RSP 指向栈顶' },
  { name: '内存映射段 (mmap)', range: '动态分配', size: '可变', color: '#a855f7', desc: '共享库(.so)、mmap文件映射、匿名内存映射（malloc大块调用）' },
  { name: '堆 (Heap)', range: '↑ 向高地址生长', size: '动态', color: '#3b82f6', desc: 'malloc/new 分配；程序终止前须 free/delete 避免内存泄漏' },
  { name: 'BSS 段', range: '固定地址', size: '未初始化全局变量', color: '#22c55e', desc: '未初始化的全局和静态变量（只记录大小，不占文件空间，运行时清零）' },
  { name: 'Data 段', range: '固定地址', size: '已初始化全局变量', color: '#22c55e', desc: '已初始化的全局/静态变量（存储在可执行文件中）' },
  { name: 'Text 段 (代码)', range: '0x400000 起', size: '只读', color: '#64748b', desc: '程序机器码（ELF代码节）；通常只读+可执行，写保护防止代码注入' },
];

const VM_TOPICS = [
  {
    name: '页表 & TLB', icon: '🗂️', color: '#f59e0b',
    code: `# 虚拟内存与页表关键概念

# ── 页表条目（PTE）64位格式 ──
# 63    52: 保留/软件使用 (OS使用这里存swap位置)
# 51    12: Physical Frame Number (PFN) — 物理页号
# 11     9: AVL — 软件可用标志
#  8:      G — 全局页（共享于所有进程，不被 TLB flush）
#  7:      PS — Page Size（0=4KB, 1=2MB大页）
#  6:      D — Dirty（被写过，需要写回磁盘）
#  5:      A — Accessed（被访问过）
#  4:      PCD — Cache 禁止 
#  3:      PWT — Write Through
#  2:      U/S — User/Supervisor（控制是否允许用户态访问）
#  1:      R/W — 读写权限（0=只读，1=读写）
#  0:      P — Present（1=在物理内存，0=已换出→触发缺页）

# ── TLB（Translation Lookaside Buffer）──
# 本质：页表的 Cache（全相联 Cache，通常64~4096条目）
# 命中：虚拟地址 → TLB → 物理地址（1~2周期）
# 缺失：需要遍历页表（页表遍历 =4次内存访问，Intel叫 Page Walk）

# ── 上下文切换时 TLB 的处理 ──
# 切换进程 → 地址空间变化 → TLB 失效！
# 方案1：切换时 flush 全部 TLB（简单但昂贵）
# 方案2：ASID（地址空间标识符）—— 每条TLB项带ASID
#         切换进程只需换 ASID，不需 flush（ARM/RISC-V）
# 方案3：Global页（内核空间标G位）— 不随进程切换而失效

# Linux 创建进程（fork/exec）的内存工作：
import os
pid = os.fork()  # 调用 clone() 系统调用
# fork 时复制页表（Copy-on-Write！不复制物理内存）
# 子进程写某页时触发缺页 → OS复制物理页给子进程`,
  },
  {
    name: '缺页中断', icon: '💥', color: '#ef4444',
    code: `# 缺页中断处理流程（Page Fault Handler）

# 触发场景：
# 1. 合法访问但页面不在内存（被换出到 Swap）
# 2. 写只读页（Copy-on-Write）
# 3. 访问未映射区域（Segmentation Fault！）
# 4. 权限不足（如用户态访问内核页：Page Protection Fault）

# ── Linux 缺页处理伪代码 ──
def handle_page_fault(addr, error_code):
    vma = find_vma(current->mm, addr)
    
    if vma is None or addr < vma.start:
        # 访问未映射区域 → SIGSEGV（段错误）
        send_signal(current, SIGSEGV)
        return
    
    if not can_access(vma, error_code):
        # 权限不足 → SIGSEGV
        send_signal(current, SIGSEGV)
        return
    
    # 正常缺页 → 分配物理页
    page = alloc_page()
    
    if page is None:
        # OOM：物理内存耗尽 → 调用 OOM Killer 杀掉进程
        out_of_memory()
        return
    
    if vma.flags & VM_FILE:
        # 文件映射：从磁盘读入页面（触发 I/O，进程阻塞）
        read_from_file(page, vma, addr)
    elif error_code & FAULT_FLAG_WRITE and is_cow_page(vma):
        # Copy-on-Write：复制父进程的物理页给子进程
        page = copy_page(find_parent_page(addr))
    else:
        # 匿名页（堆/栈）：用零页（zero page）填充
        clear_page(page)     # 清零新页（安全！防止信息泄露）
    
    # 更新页表，设置 PTE Present=1
    install_pte(current->mm, addr, page)`,
  },
];

export default function LessonMemory() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = VM_TOPICS[activeTopic];

  return (
    <div className="lesson-ca">
      <div className="ca-badge">🗺️ module_06 — 虚拟内存</div>
      <div className="ca-hero">
        <h1>虚拟内存：页表 / TLB / 缺页中断 / 进程地址空间</h1>
        <p>虚拟内存给每个进程一个<strong>独立的、隔离的地址空间幻觉</strong>——好像独占整个内存。OS 通过页表完成虚拟地址到物理地址的映射，TLB 缓存热点翻译，缺页中断处理按需调页。</p>
      </div>

      <VMTranslator />

      {/* 进程地址空间布局 */}
      <div className="ca-section">
        <h2 className="ca-section-title">📐 Linux 64位进程地址空间布局</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {SEGMENTS.map(s => (
            <div key={s.name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.45rem 0.875rem', borderRadius: '7px', border: `1px solid ${s.color}15`, background: `${s.color}05` }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <div style={{ fontWeight: 700, color: s.color, minWidth: 140, fontSize: '0.78rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', flex: 1, lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ fontSize: '0.65rem', color: '#334155', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>{s.size}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ca-section">
        <h2 className="ca-section-title">🔑 虚拟内存核心机制</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {VM_TOPICS.map((topic, i) => (
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
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/cache')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch/lesson/io')}>下一模块：I/O 系统 →</button>
      </div>
    </div>
  );
}
