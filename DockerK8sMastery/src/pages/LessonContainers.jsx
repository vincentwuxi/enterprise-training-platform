import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const COMPARE_ITEMS = [
  { dim: '隔离单元', vm: '整台虚拟机（带完整 OS）', container: '进程（共享宿主 OS 内核）' },
  { dim: '启动时间', vm: '分钟级（需引导 OS）', container: '毫秒级（直接启动进程）' },
  { dim: '镜像大小', vm: 'GB 级（含完整 OS）', container: 'MB 级（仅应用层）' },
  { dim: '资源开销', vm: '高（虚拟化 CPU/内存）', container: '极低（直接使用宿主资源）' },
  { dim: '隔离强度', vm: '完全隔离（硬件级）', container: '进程级隔离（Namespace/Cgroup）' },
  { dim: '可移植性', vm: '中等（依赖虚拟化平台）', container: '极高（Build Once, Run Anywhere）' },
  { dim: '密度', vm: '单机 10-20 个', container: '单机数百个' },
  { dim: '适用场景', vm: '强隔离/多 OS/遗留系统', container: '微服务/DevOps/CI/CD' },
];

const CONTAINER_MAGIC = [
  { name: 'Namespace', desc: '进程、网络、文件系统、用户的隔离视图', icon: '🔭', detail: '每个容器有独立的 PID/NET/MNT/UTS/IPC/USER 命名空间，让容器"以为"自己独占一台机器' },
  { name: 'Cgroup', desc: '控制 CPU、内存、磁盘 I/O 的资源配额', icon: '🎛️', detail: '通过 Control Groups 限制容器最多使用多少资源，防止一个容器耗尽宿主机资源' },
  { name: 'UnionFS', desc: '分层文件系统，实现镜像的写时复制', icon: '🗂️', detail: '镜像由多个只读层叠加，启动容器时加一个可写层。相同的层在多容器间共享，极大节省磁盘空间' },
  { name: 'OCI 标准', desc: '开放容器倡议，统一镜像和运行时规范', icon: '📋', detail: '确保 Docker 构建的镜像可以在 Podman、containerd、K8s 等任何 OCI 兼容运行时上运行' },
];

const HISTORY = [
  { year: '2000', event: 'FreeBSD Jails — 最早的容器雏形', tag: '起源' },
  { year: '2008', event: 'LXC (Linux Containers) 发布', tag: '奠基' },
  { year: '2013', event: 'Docker 开源发布，容器技术爆炸', tag: '革命' },
  { year: '2014', event: 'Google 开源 Kubernetes，容器编排诞生', tag: '编排' },
  { year: '2015', event: 'OCI 成立，标准化容器格式', tag: '标准' },
  { year: '2016', event: 'Docker Swarm vs K8s 编排大战', tag: '竞争' },
  { year: '2017-18', event: 'K8s 胜出，成为云原生标准', tag: '统一' },
  { year: '2020+', event: 'CNCF 生态爆发，containerd/WebAssembly', tag: '未来' },
];

export default function LessonContainers() {
  const navigate = useNavigate();
  const [selectedMagic, setSelectedMagic] = useState(null);
  const [showVm, setShowVm] = useState(true);

  return (
    <div className="lesson-dk">
      <div className="dk-badge">🐳 module_01 — 容器革命</div>

      <div className="dk-hero">
        <h1>容器革命：为什么它改变了软件世界</h1>
        <p>2013 年 Docker 发布后，软件交付方式彻底改变。"<strong>在我机器上能跑</strong>"成为历史——容器把应用和它的全部依赖打包，确保在任何环境下完全一致地运行。</p>
      </div>

      {/* VM vs Container 对比 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⚔️ 容器 vs 虚拟机：架构对比</h2>
        <div className="dk-interactive">
          <h3>
            系统架构可视化
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`dk-btn ${showVm ? 'primary' : ''}`} onClick={() => setShowVm(true)}>🖥️ 虚拟机架构</button>
              <button className={`dk-btn ${!showVm ? 'primary' : ''}`} onClick={() => setShowVm(false)}>🐳 容器架构</button>
            </div>
          </h3>
          {showVm ? (
            <div className="dk-arch">{`
┌──────────────────────────────────────────────────────────────┐
│                        物理服务器                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     宿主机 OS                           │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │                  Hypervisor (VMware/KVM)         │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐            │   │  │
│  │  │  │    VM 1      │  │    VM 2      │            │   │  │
│  │  │  │  ┌────────┐  │  │  ┌────────┐ │            │   │  │
│  │  │  │  │ Guest  │  │  │  │ Guest  │ │   ← 每个VM │   │  │
│  │  │  │  │  OS    │  │  │  │  OS    │ │     带完整OS│   │  │
│  │  │  │  └────────┘  │  │  └────────┘ │            │   │  │
│  │  │  │  │   App  │  │  │  │  App   │ │            │   │  │
│  │  │  └──────────────┘  └──────────────┘            │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
  ❌ 每个 VM：1-2GB 内存开销，分钟级启动，运行 20 个已达上限`}</div>
          ) : (
            <div className="dk-arch">{`
┌──────────────────────────────────────────────────────────────┐
│                        物理服务器                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     宿主机 OS (Linux Kernel)            │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              Docker Engine / containerd           │  │  │
│  │  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │  │  │
│  │  │  │ C1  │  │ C2  │  │ C3  │  │ C4  │  │ C5  │  │  │  │
│  │  │  │App A│  │App B│  │App C│  │App D│  │App E│  │  │  │
│  │  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │  │  │
│  │  │        共享宿主 OS 内核 (Namespace隔离)           │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
  ✅ 每个容器：MB 级内存，毫秒启动，单机数百个并行运行`}</div>
          )}

          <table className="dk-table" style={{ marginTop: '1.25rem' }}>
            <thead><tr><th>维度</th><th>🖥️ 虚拟机</th><th>🐳 容器</th></tr></thead>
            <tbody>
              {COMPARE_ITEMS.map(r => (
                <tr key={r.dim}>
                  <td style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.85rem' }}>{r.dim}</td>
                  <td style={{ color: '#f87171', fontSize: '0.82rem' }}>{r.vm}</td>
                  <td style={{ color: '#34d399', fontSize: '0.82rem' }}>{r.container}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 容器技术原理 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⚙️ 容器的四大技术支柱（点击展开）</h2>
        <div className="dk-grid-2">
          {CONTAINER_MAGIC.map((m, i) => (
            <div key={m.name}
              onClick={() => setSelectedMagic(selectedMagic === i ? null : i)}
              style={{
                padding: '1.1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                background: selectedMagic === i ? 'rgba(13,183,237,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedMagic === i ? 'rgba(13,183,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{m.icon}</div>
              <div style={{ fontWeight: 700, color: selectedMagic === i ? '#0db7ed' : '#e2e8f0', marginBottom: '0.3rem' }}>{m.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{m.desc}</div>
              {selectedMagic === i && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(13,183,237,0.06)', borderRadius: '8px', borderLeft: '3px solid #0db7ed', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7 }}>
                  💡 {m.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 历史时间轴 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🕰️ 容器技术发展史</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {HISTORY.map((h, i) => (
            <div key={h.year} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#0db7ed', fontSize: '0.85rem', minWidth: 60 }}>{h.year}</div>
              <div style={{ flex: 1, fontSize: '0.875rem', color: '#94a3b8' }}>{h.event}</div>
              <span className="dk-tag docker" style={{ whiteSpace: 'nowrap' }}>{h.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 云原生关键词 */}
      <div className="dk-section">
        <h2 className="dk-section-title">☁️ 云原生（Cloud Native）核心理念</h2>
        <div className="dk-card" style={{ background: 'linear-gradient(135deg, rgba(13,183,237,0.08), rgba(50,108,229,0.06))', borderColor: 'rgba(13,183,237,0.25)' }}>
          <div className="dk-grid-2">
            {[
              { icon: '📦', title: '容器化（Containerization）', desc: '应用及其依赖统一打包为容器镜像，实现环境一致性' },
              { icon: '🔄', title: '动态管理（Dynamic Orchestration）', desc: 'Kubernetes 自动调度、扩缩容、故障自愈' },
              { icon: '🧩', title: '微服务（Microservices）', desc: '将大型应用拆分为独立可部署的小服务，独立扩展' },
              { icon: '🔁', title: 'DevOps & CI/CD', desc: '开发、测试、部署自动化，快速迭代交付' },
            ].map(c => (
              <div key={c.title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#0db7ed', fontSize: '0.875rem', marginBottom: '0.3rem' }}>{c.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dk-nav">
        <div />
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/docker')}>下一模块：Docker 实战 →</button>
      </div>
    </div>
  );
}
