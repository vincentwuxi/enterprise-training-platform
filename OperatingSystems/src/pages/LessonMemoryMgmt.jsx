import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['地址空间', '分页机制', '虚拟内存', '页面置换算法'];

export default function LessonMemoryMgmt() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🧠 module_05 — 内存管理</div>
      <div className="fs-hero">
        <h1>内存管理：分页 / 分段 / 虚拟内存 / 页面置换</h1>
        <p>
          虚拟内存是操作系统<strong>最精妙的抽象之一</strong>——让每个进程认为自己独占整个地址空间，
          实际上物理内存在多个进程间巧妙共享。本模块从分页 (paging) 的硬件支持出发，
          深入多级页表、TLB、缺页处理流程，以及 LRU / Clock 等页面置换算法的实现与工程权衡。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 内存管理深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 地址空间与内存抽象</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> address_space.txt</div>
                <pre className="fs-code">{`# ═══ 为什么需要虚拟内存? ═══
#
# 问题 1: 隔离性
#   没有虚拟内存, 进程可以读写任意物理地址
#   → 进程 A 可以覆盖进程 B 的数据!
#   → 恶意程序可以窃取任何数据
#
# 问题 2: 灵活性
#   物理内存是固定的, 程序不知道自己将被加载到哪里
#   → 编译时无法确定数据和代码的物理地址
#
# 问题 3: 共享
#   多进程时, 物理内存不够用
#   → 需要一种机制让 4GB 物理内存服务 10GB 的进程

# ═══ 虚拟地址空间 (VAS) ═══
# 每个进程有独立的虚拟地址空间 (x86-64: 48位/128TB)
#
# 进程 A 的视角:        进程 B 的视角:
# ┌──────────────┐      ┌──────────────┐
# │ 内核空间     │      │ 内核空间     │
# ├──────────────┤      ├──────────────┤
# │ 栈           │      │ 栈           │
# │              │      │              │
# │ mmap 区域    │      │ mmap 区域    │
# │              │      │              │
# │ 堆           │      │ 堆           │
# │ BSS          │      │ BSS          │
# │ Data         │      │ Data         │
# │ Text         │      │ Text         │
# └──────────────┘      └──────────────┘
# 虚拟地址 0x4000        虚拟地址 0x4000
# → 映射到物理 0xA000    → 映射到物理 0xD000
# 
# 即使虚拟地址相同, 物理地址完全不同!

# ═══ 地址翻译: 虚拟 → 物理 ═══
#
# CPU → 虚拟地址 → MMU (内存管理单元)
#                    ├→ TLB 命中 → 物理地址 → 内存
#                    └→ TLB 未命中 → 查页表
#                                   ├→ 页面在内存 → 物理地址
#                                   └→ 页面不在 → 缺页异常
#                                      → OS 从磁盘加载

# ═══ 分段 (Segmentation) — 历史方案 ═══
# 将地址空间分为若干逻辑段:
# Code Segment, Data Segment, Stack Segment
#
# 虚拟地址 = 段号 + 段内偏移
# 段表: [基址, 限长, 权限]
#
# 问题: 外部碎片 (External Fragmentation)
# ┌───┬─────┬───┬──────┬───┬─────────┐
# │ A │ 空闲│ B │ 空闲 │ C │  空闲   │
# └───┴─────┴───┴──────┴───┴─────────┘
# 总空闲很大, 但都是零碎的, 放不下大段!
# → 现代 OS 主要使用分页, 不再依赖分段
# → x86-64 处于兼容考虑保留了段寄存器,
#   但段基址都设为 0 (平坦模型)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📄 分页机制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> paging.txt</div>
                <pre className="fs-code">{`# ═══ 分页 (Paging) ═══
# 虚拟地址空间和物理内存都划分为固定大小的块
# 虚拟: 页 (Page), 通常 4KB
# 物理: 帧 (Frame), 与页大小相同
#
# 虚拟地址 = 页号 (VPN) + 页内偏移 (Offset)
# 
# 例 (32位, 4KB页):
# 虚拟地址: 0x00003A7C
# 页号 VPN:  0x00003     (高 20 位)
# 偏移:     0xA7C       (低 12 位, 2^12=4096)
#
# 页表查找:
# PTE = PageTable[VPN]    // 页表项
# 物理地址 = PTE.PFN << 12 | Offset
#
# 页表项 (PTE) 的结构 (x86-64):
# ┌──┬──┬──┬──┬──┬──┬──┬────────────────┬──┬──┬──┐
# │NX│ 保留 │G │PS│D │A │CD│WT│U/S│R/W│P │
# └──┴──┴──┴──┴──┴──┴──┴────────────────┴──┴──┴──┘
#  63                    物理页帧号 (PFN)          0
#
# P  (Present):     页面在物理内存中? (0=缺页)
# R/W (Read/Write): 可写?
# U/S (User/Sup):   用户态可访问?
# A  (Accessed):    页面被访问过?
# D  (Dirty):       页面被修改过?
# NX (No Execute):  不可执行? (防代码注入)

# ═══ 多级页表 ═══
# 问题: 32位=4GB, 每页4KB → 需要 100万个 PTE
#       每个PTE 4字节 → 页表占 4MB!
#       64位更恐怖 → 需要 10^15 个 PTE
#
# 解: 多级页表 — 只为使用的区域创建页表
#
# x86-64 四级页表 (48位虚拟地址):
#
# 虚拟地址 48 位:
# ┌────────┬────────┬────────┬────────┬──────────┐
# │ PML4   │ PDPT   │ PD     │ PT     │ Offset   │
# │ 9 bits │ 9 bits │ 9 bits │ 9 bits │ 12 bits  │
# └────┬───┴────┬───┴────┬───┴────┬───┴──────────┘
#      │        │        │        │
#      ↓        ↓        ↓        ↓
#   PML4表 → PDPT表 → PD表 → PT表 → 物理帧
#   (CR3)    512项    512项   512项   512项
#
# → 每级 9 bits = 512 项, 每表 4KB (恰好一页!)
# → 未使用的区域不需要分配下级页表
# → 稀疏地址空间只需少量页表页

# ═══ TLB (Translation Lookaside Buffer) ═══
# 页表在内存中, 每次访问都查页表太慢!
# → TLB: 页表的硬件缓存, 在 CPU 内部
#
# TLB 命中: 1 cycle 完成翻译
# TLB 未命中: ~100 cycles (4级页表 = 4次内存访问)
#
# 典型 TLB:
# L1 dTLB: 64 entries, 4-way, 1 cycle
# L1 iTLB: 128 entries
# L2 TLB:  1536 entries, 12-way, ~7 cycles
#
# TLB 命中率通常 > 99% (局部性原理!)
# → 进程切换时刷新 TLB (开销很大)
# → ASID/PCID: 不同进程的 TLB 项可以共存

# ═══ 大页 (Huge Pages) ═══
# 4KB 页面太小 → 大量 TLB miss (尤其大数据库)
# → 2MB 大页 (x86): 一个 TLB 项覆盖 2MB
# → 1GB 巨页: 内存密集型应用
#
# Linux:
# $ echo 1024 > /proc/sys/vm/nr_hugepages  # 预留2MB大页
# mmap(NULL, size, PROT_READ|PROT_WRITE,
#      MAP_PRIVATE|MAP_ANONYMOUS|MAP_HUGETLB, -1, 0);
#
# THP (Transparent Huge Pages):
# → 内核自动将连续4KB页合并为大页
# → 对应用透明, 但可能导致延迟毛刺`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💾 虚拟内存与换页</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> virtual_memory.txt</div>
                <pre className="fs-code">{`# ═══ 请求分页 (Demand Paging) ═══
# 页面只在首次访问时才加载到物理内存
# → 程序启动时不加载任何页面!
# → 访问 → 缺页 → OS加载 → 继续执行
#
# 好处: 程序启动快, 不用的页面不占内存
# (一个程序可能只用到 20% 的代码页)

# ═══ 缺页处理流程 ═══
#
# 1. CPU 访问虚拟地址
# 2. MMU 查页表 → PTE.Present = 0 → 缺页异常
# 3. CPU 切换到内核态, 调用缺页处理程序
# 4. 内核检查:
#    ├── 地址是否合法? (在 VMA 中?)
#    │   └── 不合法 → SIGSEGV (段错误)
#    ├── 是否有读/写权限?
#    │   └── 无权限 → SIGSEGV
#    └── 合法 → 继续处理
# 5. 找一个空闲物理帧
#    ├── 有空闲帧 → 使用它
#    └── 没有 → 页面置换! 选一个牺牲页
#               ├── 脏页 → 先写回磁盘
#               └── 干净页 → 直接覆盖
# 6. 从磁盘读取页面到物理帧 (~10ms!)
# 7. 更新页表 PTE (设置 P=1, PFN=物理帧号)
# 8. 重新执行导致缺页的指令

# ═══ 工作集与抖动 ═══
# 工作集 (Working Set):
#   一段时间窗口内进程活跃使用的页面集合
#   → 如果物理内存 ≥ 所有进程的工作集之和 → 正常
#
# 抖动 (Thrashing):
#   物理内存不够 → 频繁换页 → CPU 大部分时间
#   在处理缺页, 而不是执行用户程序
#
#   CPU利用率
#   ↑         ╱╲
#   │       ╱    ╲
#   │     ╱       ╲ ← 抖动!
#   │   ╱          ╲
#   │ ╱              ╲
#   └─────────────────→ 多道程序度
#
# 解决抖动:
# 1. 增加物理内存 (最简单)
# 2. 减少多道程序度 (杀进程/swap out)
# 3. 优化工作集 (程序局部性优化)

# ═══ mmap: 内存映射文件 ═══
# 将文件直接映射到进程地址空间
# → 访问内存 = 访问文件 (经过缺页处理)
# → 比 read/write 少一次拷贝
#
# char *ptr = mmap(NULL, filesize,
#                  PROT_READ, MAP_PRIVATE, fd, 0);
# // ptr[0..filesize-1] 就是文件内容
# // 缺页时内核自动从文件读取
#
# 典型应用:
# → 共享库 (.so): mmap 到多个进程, 共享物理页
# → 数据库: PostgreSQL 用 mmap 管理共享缓冲
# → 大文件处理: 不需要一次读入全部`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 页面置换算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> page_replacement.txt</div>
                <pre className="fs-code">{`# ═══ 最优算法 (OPT / Belady) ═══
# 替换未来最久不会被使用的页面
# → 理论最优, 但需要预知未来! (不可实现)
# → 用作其他算法的性能上界参考

# ═══ FIFO (先进先出) ═══
# 替换最早进入内存的页面
# → 简单, 但性能差
# → Belady 异常: 增加帧数反而 缺页更多!
#
# 引用序列: 1,2,3,4,1,2,5,1,2,3,4,5
# 3帧: 9次缺页
# 4帧: 10次缺页 ← 更多了??

# ═══ LRU (最近最少使用) ═══
# 替换 最近最久未被访问 的页面
# → 基于时间局部性: 最近用过的将来还会用
# → 性能接近 OPT
#
# 引用: 7,0,1,2,0,3,0,4,2,3
# 3帧:
# Step 1: [7, -, -]    缺页 → 装入 7
# Step 2: [7, 0, -]    缺页 → 装入 0
# Step 3: [7, 0, 1]    缺页 → 装入 1
# Step 4: [0, 1, 2]    缺页 → 替换 7 (最久)
# Step 5: [0, 1, 2]    命中 0
# Step 6: [0, 2, 3]    缺页 → 替换 1 (最久)
# Step 7: [0, 2, 3]    命中 0
# Step 8: [0, 3, 4]    缺页 → 替换 2
# ...
#
# 精确 LRU 实现代价高:
# 方案1: 计数器 — 每次访问记录时间戳
# 方案2: 栈 — 访问的页面移到栈顶
# 都需要硬件支持或开销大

# ═══ Clock 算法 (二次机会) ═══
# LRU 的近似, Linux 实际使用!
#
# 所有帧排成环形, 一个指针扫描:
#
#        ┌→ [A, R=1] → [B, R=0] ─→ 替换B!
#        │                            
#   指针╱  [D, R=1]   [C, R=0]
#        └── [E, R=1] ←──┘
#
# R = Referenced (访问位, 硬件自动设置)
#
# 指针扫描到:
# R=1 → 清除R=0, 给"二次机会", 继续扫描
# R=0 → 替换此页!
#
# → 类似 FIFO, 但跳过最近访问过的页面
# → O(1) 实现, 非常高效

# ═══ Linux 的页面回收 ═══
# Linux 使用改进的 Clock: 双链表 LRU
#
# 活跃链表 (Active)   ← 最近频繁访问的
# 非活跃链表 (Inactive) ← 候选回收的
#
# 页面生命周期:
# 新页面 → Inactive 尾部
# 被访问 → 提升到 Active
# Active 太大 → 降级到 Inactive
# Inactive 头部 → 回收!
#
# kswapd: 内核线程, 后台异步回收
# → 当空闲内存 < 低水位线时启动
# → 目标: 维持足够的空闲页面
#
# 水位线:
# ┌─────────────────────────────────┐
# │ min_free_kbytes: 紧急! 同步回收│ 
# │ low: kswapd 开始工作           │
# │ high: kswapd 停止, 内存充足     │
# └─────────────────────────────────┘
#
# $ cat /proc/meminfo
# $ cat /proc/vmstat | grep pgfault
# $ cat /proc/sys/vm/swappiness  # 0-100, 越高越倾向swap`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
