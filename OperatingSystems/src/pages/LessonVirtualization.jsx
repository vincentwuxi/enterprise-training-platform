import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['虚拟化基础', 'KVM 与 Hypervisor', '容器原理', 'cgroups 与 Namespace'];

export default function LessonVirtualization() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☁️ module_08 — 虚拟化与容器</div>
      <div className="fs-hero">
        <h1>虚拟化与容器：Hypervisor / KVM / 容器原理 / cgroups</h1>
        <p>
          虚拟化让<strong>一台物理机运行多个隔离的操作系统</strong>，
          容器让<strong>一个内核运行多个隔离的用户空间</strong>。
          本模块从 Trap-and-Emulate 的理论基础出发，深入 KVM + QEMU 的硬件辅助虚拟化架构，
          再到 Linux Namespace + cgroups 如何构成容器的两大支柱，理解 Docker 底层的每一个机制。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☁️ 虚拟化与容器深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 虚拟化基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> virtualization_basics.txt</div>
                <pre className="fs-code">{`# ═══ 虚拟化的核心问题 ═══
# 如何让多个 OS 同时运行在一套硬件上?
# 每个 OS 都以为自己独占 CPU/内存/磁盘!
#
# 解决: Hypervisor (虚拟机监控器, VMM)
# → 在硬件和 Guest OS 之间插入一层
# → 虚拟化 CPU、内存、I/O

# ═══ Hypervisor 分类 ═══
#
# Type 1 (裸金属 / Bare-metal):
# 直接运行在硬件上, 没有宿主OS
# ┌─────────┬─────────┬─────────┐
# │ Guest 1 │ Guest 2 │ Guest 3 │
# ├─────────┴─────────┴─────────┤
# │         Hypervisor           │
# ├──────────────────────────────┤
# │           硬件               │
# └──────────────────────────────┘
# 代表: VMware ESXi, Xen, Hyper-V
# 特点: 性能好, 企业级数据中心

# Type 2 (宿主型 / Hosted):
# 运行在宿主 OS 上, 像普通应用
# ┌─────────┬─────────┐
# │ Guest 1 │ Guest 2 │
# ├─────────┴─────────┤
# │    Hypervisor      │
# ├────────────────────┤
# │    Host OS         │
# ├────────────────────┤
# │    硬件            │
# └────────────────────┘
# 代表: VirtualBox, VMware Workstation, QEMU
# 特点: 安装方便, 开发/测试用

# ═══ CPU 虚拟化: Trap-and-Emulate ═══
# 核心思想 (Popek & Goldberg, 1974):
# 
# Guest OS 运行在非特权模式 (Ring 1 或 Ring 3)
# → Guest 执行特权指令 → 触发 Trap
# → Hypervisor 捕获 Trap → 模拟该指令的效果
# → 返回 Guest 继续执行
#
# 问题: x86 有 17 条"敏感但非特权"指令!
# → 不触发 Trap, 但行为与 Ring 0 不同
# → 例: POPF 在 Ring 3 不修改中断标志
# → 这就是 x86 曾经"不可虚拟化"的原因!
#
# 解决方案:
# 1. 二进制翻译 (Binary Translation):
#    → 替换敏感指令为安全等价代码
#    → VMware 早期使用, 运行时翻译
#
# 2. 半虚拟化 (Paravirtualization):
#    → 修改 Guest OS 源码, 把敏感指令替换为 hypercall
#    → Xen 模式, 需要修改内核
#
# 3. 硬件辅助虚拟化 (最现代):
#    → Intel VT-x / AMD-V
#    → 新增 VMX root / non-root 执行模式
#    → Guest 在 non-root Ring 0 运行
#    → 敏感指令自动触发 VM Exit → Hypervisor 处理
#    → KVM 使用这种模式`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐧 KVM + QEMU 架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> kvm_qemu.txt</div>
                <pre className="fs-code">{`# ═══ KVM (Kernel-based Virtual Machine) ═══
# Linux 内核模块, 把 Linux 变成 Type-1 Hypervisor
# 利用 Intel VT-x / AMD-V 硬件虚拟化
#
# QEMU + KVM 协作架构:
#
# ┌─────────────────────────────────────┐
# │ Guest VM                            │
# │  ┌──────────────────────────┐      │
# │  │ Guest OS (Linux/Windows) │      │
# │  │  ← 虚拟 CPU/内存/设备 → │      │
# │  └──────────────────────────┘      │
# ├─────────────────────────────────────┤
# │ QEMU (用户态)                      │
# │ → 设备模拟 (虚拟网卡/磁盘/显卡)    │
# │ → 每个 vCPU = 一个 QEMU 线程      │
# │ → ioctl(/dev/kvm) 与内核交互      │
# ├─────────────────────────────────────┤
# │ KVM (内核态)                       │
# │ → CPU 虚拟化 (VT-x: VMLAUNCH/VMRESUME)│
# │ → 内存虚拟化 (EPT/NPT)            │
# │ → 中断虚拟化 (虚拟 APIC)          │
# │ → /dev/kvm 设备接口               │
# ├─────────────────────────────────────┤
# │ 硬件 (Intel VT-x / AMD-V)        │
# └─────────────────────────────────────┘

# ═══ VM 生命周期 (KVM) ═══
# 
# 1. QEMU 打开 /dev/kvm
# 2. ioctl(KVM_CREATE_VM) → 创建虚拟机
# 3. ioctl(KVM_CREATE_VCPU) → 创建 vCPU
# 4. 分配 Guest 内存 (mmap)
# 5. 加载 Guest 内核/BIOS
# 6. 主循环:
#    while (true) {
#        ioctl(KVM_RUN)  → 进入 Guest (VMLAUNCH)
#        // Guest 运行中...
#        // VM Exit! (I/O / 中断 / 特权指令)
#        switch (exit_reason) {
#            case KVM_EXIT_IO:     handle_io(); break;
#            case KVM_EXIT_MMIO:   handle_mmio(); break;
#            case KVM_EXIT_HLT:    handle_halt(); break;
#        }
#    }

# ═══ 内存虚拟化 ═══
# 
# 两层地址翻译:
# Guest 虚拟 → Guest 物理 → Host 物理
#   (GVA)        (GPA)        (HPA)
#
# 方法 1: 影子页表 (Shadow Page Table)
# → Hypervisor 维护 GVA→HPA 的页表
# → 每次 Guest 修改页表 → Trap → 更新影子页表
# → 开销大!
#
# 方法 2: EPT/NPT (硬件辅助, 现代)
# → Intel EPT (Extended Page Table)
# → AMD NPT (Nested Page Table)
# → 硬件自动完成两层翻译
# → GVA → Guest页表 → GPA → EPT → HPA
# → TLB miss 时双重遍历 (最多 24 次内存访问!)
# → 但有专用 TLB 缓存, 实际性能接近原生

# ═══ I/O 虚拟化 ═══
# 
# 全虚拟化: QEMU 模拟设备 (慢)
# → Guest 发 I/O → VM Exit → QEMU 处理
#
# 半虚拟化: virtio (性能好, 主流)
# → Guest 安装 virtio 驱动
# → 共享内存环形缓冲区 (vring)
# → 减少 VM Exit 次数
# → virtio-net, virtio-blk, virtio-scsi
#
# 设备直通: SR-IOV + VFIO (最高性能)
# → 物理设备直接分配给 Guest
# → 近乎原生性能
# → 需要 IOMMU (Intel VT-d / AMD-Vi)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 容器原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> container_internals.txt</div>
                <pre className="fs-code">{`# ═══ 容器 vs 虚拟机 ═══
#
# 虚拟机:                    容器:
# ┌──────┬──────┐           ┌──────┬──────┐
# │App A │App B │           │App A │App B │
# ├──────┼──────┤           ├──────┼──────┤
# │OS A  │OS B  │           │Libs A│Libs B│
# ├──────┴──────┤           ├──────┴──────┤
# │ Hypervisor  │           │   Host OS   │
# ├─────────────┤           │  (共享内核)  │
# │   硬件      │           ├─────────────┤
# └─────────────┘           │   硬件      │
#                           └─────────────┘
# 启动: 分钟级                启动: 秒/毫秒级
# 大小: GB 级                 大小: MB 级
# 隔离: 强 (独立内核)         隔离: 弱 (共享内核)
# 开销: 高 (完整 OS)         开销: 低 (只有应用)

# ═══ 容器 = Namespace + cgroups + 联合文件系统 ═══
#
# Docker 不是虚拟化! 它只是利用了 Linux 内核的三个机制:
#
# 1. Namespace  → 隔离 (看到什么)
#    → 每个容器有独立的 PID/网络/文件系统/用户 视图
#
# 2. cgroups    → 限制 (能用多少)
#    → 限制 CPU/内存/磁盘I/O/网络 的使用量
#
# 3. UnionFS    → 分层镜像 (存储)
#    → OverlayFS: 只读镜像层 + 可写容器层

# ═══ Docker 运行容器的底层过程 ═══
#
# $ docker run -it ubuntu bash
#
# 实际发生了什么:
# 1. dockerd 接收请求
# 2. 调用 containerd → runc (OCI 运行时)
# 3. runc 执行:
#    a. clone(CLONE_NEWPID | CLONE_NEWNET | 
#             CLONE_NEWNS | CLONE_NEWUTS | ...)
#       → 创建新进程, 在新 Namespace 中
#    b. pivot_root() → 切换根文件系统 (OverlayFS)
#    c. 配置 cgroups → 资源限制
#    d. 设置 capabilities → 删除不需要的权限
#    e. seccomp → 限制可用的系统调用
#    f. exec("bash") → 在容器中执行命令
#
# $ docker inspect --format '{{.State.Pid}}' <id>
# → 获取容器在宿主机上的真实 PID
# $ ls /proc/<pid>/ns/  → 查看 Namespace
# $ cat /proc/<pid>/cgroup → 查看 cgroup

# ═══ 容器镜像: OverlayFS ═══
#
# 镜像是分层的, 每层只读:
# ┌────────────────────────┐ ← 容器层 (可写, 临时)
# ├────────────────────────┤
# │ Layer 3: COPY app.py  │ ← 只读
# ├────────────────────────┤
# │ Layer 2: RUN pip install│
# ├────────────────────────┤
# │ Layer 1: Ubuntu 22.04  │ ← 基础镜像
# └────────────────────────┘
#
# OverlayFS 合并所有层:
# mount -t overlay overlay \
#   -o lowerdir=layer1:layer2:layer3,\
#      upperdir=container_rw,\
#      workdir=work \
#   /merged
#
# 写时复制: 修改文件 → 从 lower 复制到 upper
# 删除文件: 在 upper 创建 "whiteout" 标记`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 cgroups 与 Namespace 详解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> cgroups_namespace.sh</div>
                <pre className="fs-code">{`# ═══ Linux Namespace (8 种) ═══
#
# ┌──────────────┬────────┬──────────────────────┐
# │ Namespace    │ 标志   │ 隔离内容              │
# ├──────────────┼────────┼──────────────────────┤
# │ PID          │NEWPID  │ 进程ID (PID 1 = init)│
# │ Network      │NEWNET  │ 网络栈/IP/端口/路由   │
# │ Mount        │NEWNS   │ 文件系统挂载点         │
# │ UTS          │NEWUTS  │ 主机名和域名          │
# │ IPC          │NEWIPC  │ 信号量/共享内存/消息队列│
# │ User         │NEWUSER │ UID/GID 映射          │
# │ Cgroup       │NEWCGROUP│cgroup 根目录          │
# │ Time         │NEWTIME │ 系统时钟 (5.6+)       │
# └──────────────┴────────┴──────────────────────┘

# ═══ 手动创建隔离环境 (不用 Docker!) ═══

# 创建 PID + Mount + UTS 命名空间:
sudo unshare --pid --mount --uts --fork bash

# 在新 namespace 中:
hostname mycontainer       # 只影响这个 namespace
mount -t proc proc /proc   # 重新挂载 /proc
ps aux                     # 只能看到自己的进程!
# PID 1 = bash (容器内的"init"进程)

# 查看进程的 namespace:
ls -la /proc/$$/ns/
# lrwxrwxrwx ipc -> ipc:[4026531839]
# lrwxrwxrwx mnt -> mnt:[4026532485]  ← 不同!
# lrwxrwxrwx pid -> pid:[4026532486]  ← 不同!

# 进入已有 namespace (nsenter):
nsenter -t <pid> -p -m -u bash  # 进入容器

# ═══ cgroups v2 (Control Groups) ═══
# 资源限制和监控
#
# cgroup 层次结构:
# /sys/fs/cgroup/
# ├── cgroup.controllers    # 可用控制器
# ├── cgroup.subtree_control
# ├── system.slice/         # systemd 服务
# │   ├── nginx.service/
# │   └── docker.service/
# ├── user.slice/           # 用户会话
# └── docker/               # Docker 容器
#     ├── <container-id-1>/
#     └── <container-id-2>/

# ── CPU 限制 ──
# 限制容器最多使用 0.5 个 CPU:
echo "50000 100000" > /sys/fs/cgroup/docker/<id>/cpu.max
# 含义: 每 100ms 中最多使用 50ms CPU
# = docker run --cpus=0.5

# CPU 权重 (相对分配):
echo 100 > /sys/fs/cgroup/docker/<id>/cpu.weight
# 默认 100, 范围 1-10000
# = docker run --cpu-shares=100

# ── 内存限制 ──
echo 536870912 > /sys/fs/cgroup/docker/<id>/memory.max
# 限制 512MB, 超过触发 OOM Killer
# = docker run --memory=512m

# 查看内存使用:
cat /sys/fs/cgroup/docker/<id>/memory.current
cat /sys/fs/cgroup/docker/<id>/memory.stat

# ── I/O 限制 ──
echo "8:0 wbps=10485760" > io.max  # 限制写入 10MB/s
# = docker run --device-write-bps /dev/sda:10mb

# ── PID 限制 ──
echo 100 > pids.max  # 最多 100 个进程
# = docker run --pids-limit=100
# → 防止 fork 炸弹!

# ═══ 容器安全强化 ═══
# 
# 1. Capabilities: 细粒度权限 (替代 root)
#    docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE
#    → 只保留绑定低端口的权限
#
# 2. seccomp: 限制系统调用
#    docker 默认禁止 ~44 个危险 syscall
#    (如 reboot, mount, ptrace)
#
# 3. AppArmor / SELinux: MAC 访问控制
#    → 限制文件/网络/能力的访问
#
# 4. rootless containers: 非 root 运行
#    → Podman 默认 rootless
#    → User Namespace 映射 UID
#
# 5. gVisor / Kata Containers: 更强隔离
#    gVisor: 在用户态实现 syscall (沙箱内核)
#    Kata: 轻量级 VM + 容器接口 (最强隔离)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
