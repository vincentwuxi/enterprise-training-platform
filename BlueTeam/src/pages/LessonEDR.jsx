import { useState } from 'react';
import './LessonCommon.css';

const tabs = ['EDR 核心能力', 'YARA & Sysmon', '取证与响应', '产品选型'];

export default function LessonEDR() {
  const [active, setActive] = useState(0);

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 03 · EDR</div>
        <h1>终端安全 EDR</h1>
        <p>终端是攻击的"第一着陆点"——<strong>EDR 实时监控每个进程创建、DLL 加载、网络连接，用 YARA 规则检测恶意文件，用行为分析发现无文件攻击</strong>。从"杀毒软件"进化到"端点行为监控"的时代。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🖥️ EDR 终端安全体系</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {tabs.map((t, i) => (
            <button key={i} className={`bt-tag ${active===i?'blue':''}`} style={{cursor:'pointer',padding:'0.35rem 0.8rem',fontSize:'0.78rem'}} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>edr-evolution.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ 终端安全进化史 ━━━━

# ┌─────────────────────────────────────────────────────────────┐
# │ 时代       │ 技术         │ 检测能力          │ 代表产品     │
# ├─────────────────────────────────────────────────────────────┤
# │ AV 时代    │ 签名匹配     │ 仅检测已知病毒    │ Norton/卡巴  │
# │ NGAV 时代  │ 机器学习     │ 检测变种/未知     │ Cylance      │
# │ EDR 时代   │ 行为监控     │ 全链路可见性      │ CrowdStrike  │
# │ XDR 时代   │ 多源融合     │ 端+网+云统一      │ Palo Alto    │
# └─────────────────────────────────────────────────────────────┘

# ━━━━ EDR 四大核心能力 ━━━━

# 1. 遥测采集 (Telemetry)
#    采集终端上发生的一切:
#    ┌──────────────┬─────────────────────────────────┐
#    │ 数据类型     │ 具体内容                        │
#    ├──────────────┼─────────────────────────────────┤
#    │ 进程活动     │ 创建/终止/命令行参数/父子关系   │
#    │ 文件操作     │ 创建/修改/删除/重命名/哈希      │
#    │ 注册表       │ 键值创建/修改 (持久化检测)      │
#    │ 网络连接     │ 出入站连接/DNS查询/端口监听     │
#    │ 内存操作     │ 进程注入/代码注入/hook检测       │
#    │ 用户行为     │ 登录/提权/策略变更              │
#    └──────────────┴─────────────────────────────────┘

# 2. 行为检测 (Behavioral Detection)
#    不依赖签名, 而是分析行为模式:
#    
#    传统AV思路: 文件A的哈希 = 已知恶意 → 告警
#    EDR思路:    Word进程 → 启动PowerShell → 下载EXE
#               → 这个行为链本身就很可疑!! → 告警
#
#    常见检测规则:
#    - Office 进程生成脚本解释器 (宏攻击)
#    - 用户态进程访问 LSASS (凭证窃取)
#    - svchost.exe 从非标准路径启动 (伪装)
#    - 进程注入到 explorer.exe (防御规避)

# 3. 自动响应 (Automated Response)
#    检测到威胁后自动执行:
#    - 网络隔离: 断开终端网络(保留Agent通信)
#    - 进程终止: Kill 恶意进程
#    - 文件隔离: 将恶意文件移入隔离区
#    - 文件回滚: 利用 VSS 快照恢复被加密的文件
#    - 账户锁定: 可疑账户临时禁用

# 4. 取证调查 (Forensics & Investigation)
#    提供完整的行为时间线:
#    09:00 - user@PC01: 打开 invoice.docm
#    09:01 - WINWORD.EXE → cmd.exe → powershell.exe
#    09:01 - PowerShell 执行 Base64 编码命令
#    09:02 - 建立到 evil.com:443 的 HTTPS 连接
#    09:03 - 创建计划任务 (持久化)
#    09:05 - 访问 LSASS 进程 (凭证窃取)
#    09:10 - 通过 SMB 横向移动到 DC01
#    → 完整的攻击链可视化!`}</div>
            </div>

            <div className="bt-grid-4">
              {[
                { v: '实时', l: '遥测采集延迟', color: 'var(--bt-blue)' },
                { v: '94%', l: 'ATT&CK 技术覆盖率', color: 'var(--bt-green)' },
                { v: '<1s', l: '自动隔离响应时间', color: 'var(--bt-amber)' },
                { v: '30天', l: '行为日志保留', color: 'var(--bt-muted)' },
              ].map((s, i) => (
                <div key={i} className="bt-metric">
                  <div className="bt-metric-val" style={{ color: s.color }}>{s.v}</div>
                  <div className="bt-metric-label">{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {active === 1 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>edr-detection-rules.yar</span>
              </div>
              <div className="bt-code">{`# ━━━━ YARA 规则 (恶意文件检测) ━━━━

rule Cobalt_Strike_Beacon
{
    meta:
        description = "检测 Cobalt Strike Beacon Payload"
        author = "Blue Team"
        severity = "critical"
        mitre_attack = "T1071.001"

    strings:
        $beacon_config = { 00 01 00 01 00 02 ?? ?? 00 02 00 01 }
        $sleep_mask = "ReflectiveLoader"
        $named_pipe = "\\\\.\\pipe\\msagent_"
        $uri_checksum = "/submit.php?id="
        $default_ua = "Mozilla/5.0 (compatible; MSIE"

    condition:
        uint16(0) == 0x5A4D and    // PE 文件头
        filesize < 1MB and
        (2 of ($beacon_config, $sleep_mask, $named_pipe) or
         all of ($uri_checksum, $default_ua))
}

# 使用：yara -r cobalt_strike.yar /suspicious/directory/

# ━━━━ Sysmon 进程监控 (Windows 必备) ━━━━
# Sysmon = System Monitor (微软官方工具)
# 安装: sysmon64.exe -i sysmonconfig.xml

# 核心事件 ID 与检测价值:

# EventID 1 - 进程创建
# 包含: 完整命令行 + 父进程 + 文件哈希
# 检测: powershell -enc, cmd /c, certutil -decode
# 关键: 父子进程关系 → 判断是否被利用
#   正常: explorer.exe → chrome.exe
#   异常: WINWORD.EXE → cmd.exe → powershell.exe

# EventID 3 - 网络连接
# 包含: 源IP/目标IP/端口/进程
# 检测: 连接 C2 服务器的出站流量
# 关键: 哪个进程在建立外联?
#   正常: chrome.exe → 443/80
#   异常: svchost.exe → 8443 (外部IP)

# EventID 7 - DLL 加载
# 检测: DLL 侧加载 / 劫持
# 关键: 合法进程加载了非预期的 DLL

# EventID 8 - CreateRemoteThread
# 检测: 进程注入 (Process Injection)
# 几乎 100% 是恶意行为

# EventID 10 - ProcessAccess → LSASS
# 检测: 凭证窃取 (Mimikatz/procdump)
# 规则: TargetImage=lsass.exe AND 
#        SourceImage != svchost.exe
# → 立即 P1 告警!

# EventID 22 - DNS 查询
# 检测: DGA 域名 / DNS 隧道 / C2 通信
# 特征: 高频查询 + 长随机域名

# ━━━━ Linux EDR: Osquery ━━━━
# Facebook 开源, 用 SQL 查询操作系统状态

SELECT pid, name, path, cmdline, start_time
FROM processes
WHERE name IN ('nc', 'ncat', 'socat', 'python', 'perl')
  AND on_disk = 0;
-- 检测: 运行中但磁盘不存在的进程 (fileless malware)

SELECT address, port, pid, protocol
FROM listening_ports
WHERE port NOT IN (22, 80, 443, 3306)
  AND address = '0.0.0.0';
-- 检测: 非标准端口上的后门监听

SELECT * FROM crontab 
WHERE command LIKE '%curl%' OR command LIKE '%wget%';
-- 检测: 定时任务中的可疑下载

SELECT * FROM authorized_keys
WHERE key NOT IN (SELECT key FROM baseline_keys);
-- 检测: 未授权的 SSH 公钥 (后门)`}</div>
            </div>

            <div className="bt-section-title">📊 Sysmon 关键事件 ID 速查</div>
            <div className="bt-grid-3">
              {[
                { id: 'EventID 1', name: '进程创建', detect: '可疑命令行 (powershell -enc)', color: '#3b82f6' },
                { id: 'EventID 3', name: '网络连接', detect: 'C2 外联通信检测', color: '#6366f1' },
                { id: 'EventID 8', name: 'RemoteThread', detect: '进程注入 (DLL Injection)', color: '#ef4444' },
                { id: 'EventID 10', name: 'ProcessAccess', detect: 'LSASS 访问 = 凭证窃取', color: '#f97316' },
                { id: 'EventID 11', name: '文件创建', detect: '恶意文件落盘 (Dropper)', color: '#06b6d4' },
                { id: 'EventID 22', name: 'DNS 查询', detect: 'DGA 域名 / DNS 隧道', color: '#22c55e' },
              ].map((e, i) => (
                <div key={i} className="bt-card" style={{ borderLeft: `3px solid ${e.color}`, padding: '0.85rem' }}>
                  <span className="bt-tag blue" style={{ marginBottom: '0.3rem', display: 'inline-block' }}>{e.id}</span>
                  <div style={{ fontWeight: 700, color: e.color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{e.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)' }}>🎯 {e.detect}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {active === 2 && (
          <div className="bt-code-wrap">
            <div className="bt-code-head">
              <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>edr-forensics-playbook.md</span>
            </div>
            <div className="bt-code">{`# ━━━━ EDR 取证与响应实战 ━━━━

# ━━━━ 场景: 勒索软件事件响应 ━━━━

# 第一阶段: 检测与遏制 (前 15 分钟)
# ─────────────────────────────────────
# 1. EDR 告警: 大量文件在短时间内被修改
#    - 特征: 文件扩展名批量被改为 .locked/.encrypt
#    - 触发: 行为检测规则 "批量文件加密"
#
# 2. 自动响应 (EDR 策略):
#    - [自动] 隔离受感染终端 (断网但保留Agent通信)
#    - [自动] 终止加密进程
#    - [自动] 阻止横向移动 (封锁SMB/RDP端口)
#
# 3. SOC 研判:
#    - 确认是勒索软件 vs 误报 (合法的批量重命名)
#    - 识别勒索软件家族 (通过 ransom note 或文件特征)
#    - 判断加密范围: 只有一台? 还是已经扩散?

# 第二阶段: 取证分析 (1-4 小时)
# ─────────────────────────────────────
# 1. 内存取证
#    EDR 自动采集内存快照:
#    - 提取加密密钥 (部分勒索软件在内存中保留密钥)
#    - 分析恶意进程的 DLL 和注入代码
#    - 提取 C2 通信地址
#
# 2. 行为时间线
#    EDR 的进程时间线:
#    08:50 - 用户打开邮件附件 (初始感染)
#    08:51 - 宏执行 → PowerShell 下载 Loader
#    08:52 - Loader 释放勒索软件主体
#    08:52 - 禁用 Windows Defender
#    08:53 - 删除 Volume Shadow Copies (防恢复)
#    08:53 - 开始加密 C:\\Users\\*
#    08:55 - 尝试枚举网络共享 (横向移动)
#    08:56 - EDR 检测到行为异常 → 自动隔离
#
# 3. IOC 提取
#    - 恶意文件哈希 (SHA-256)
#    - C2 域名/IP
#    - 持久化机制 (注册表/计划任务)
#    - 横向移动痕迹

# 第三阶段: 恢复与加固 (4-24 小时)
# ─────────────────────────────────────
# 1. 恢复数据
#    - 检查 VSS 快照是否幸存
#    - 从离线备份恢复 (不要使用在线备份!)
#    - 检查是否有已公开的解密工具
#      → nomoreransom.org
#
# 2. 清除与重建
#    - 不建议只清除恶意文件 → 建议重装系统
#    - 重置所有受影响账户密码
#    - 检查并清除持久化机制
#
# 3. 加固措施
#    - 更新 EDR 检测规则
#    - 启用 ASR 规则 (Attack Surface Reduction)
#    - 加强邮件过滤 (附件类型白名单)
#    - 实施 3-2-1 备份策略
#      3 份副本, 2 种介质, 1 份离线

# ━━━━ Velociraptor: 开源数字取证利器 ━━━━

# 安装: 
# $ wget https://github.com/Velocidex/velociraptor/releases
# $ ./velociraptor gui  # 启动Web界面

# 常用取证 Artifact:
# Windows.System.Pslist    → 进程列表+命令行
# Windows.Detection.YARA   → 全盘 YARA 扫描
# Windows.EventLogs.Evtx   → 事件日志分析
# Windows.System.Amcache   → 程序执行历史
# Windows.Forensics.Prefetch → 预取文件分析
# Linux.Sys.CrontabFile    → 定时任务检查
# Linux.Detection.ProcessHollowing → 进程注入检测`}</div>
          </div>
        )}

        {active === 3 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>edr-product-comparison.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ EDR/XDR 产品选型矩阵 ━━━━

# ┌──────────────────┬──────────┬──────────┬────────────────────┬──────────┐
# │ 产品             │ 平台     │ 定位     │ 核心优势           │ 年费/端点│
# ├──────────────────┼──────────┼──────────┼────────────────────┼──────────┤
# │ CrowdStrike      │ 全平台   │ 商业#1   │ 云原生/最强AI检测  │ $15-25   │
# │  Falcon          │          │          │ 轻量Agent(~25MB)   │          │
# │                  │          │          │ MITRE评估连年第一  │          │
# ├──────────────────┼──────────┼──────────┼────────────────────┼──────────┤
# │ SentinelOne      │ 全平台   │ 商业#2   │ 全自动响应/回滚    │ $12-20   │
# │  Singularity     │          │          │ 内置 AI 引擎       │          │
# │                  │          │          │ 支持 K8s 容器保护  │          │
# ├──────────────────┼──────────┼──────────┼────────────────────┼──────────┤
# │ Microsoft        │ Windows  │ 内置免费 │ 与 M365/Intune集成 │ 免费-$5  │
# │  Defender for EP │ (有限Mac)│          │ ASR攻击面缩减      │          │
# │                  │          │          │ 中小企业首选       │          │
# ├──────────────────┼──────────┼──────────┼────────────────────┼──────────┤
# │ Palo Alto        │ 全平台   │ XDR 平台 │ 端+网+云统一       │ $18-30   │
# │  Cortex XDR      │          │          │ 强大的日志关联     │          │
# │                  │          │          │ 适合大型企业       │          │
# ├──────────────────┼──────────┼──────────┼────────────────────┼──────────┤
# │ Wazuh            │ 全平台   │ 开源     │ SIEM+EDR一体化     │ 免费     │
# │                  │          │          │ 合规审计(PCI/HIPAA)│          │
# │                  │          │          │ 适合预算有限团队   │          │
# ├──────────────────┼──────────┼──────────┼────────────────────┼──────────┤
# │ Velociraptor     │ 全平台   │ 开源取证 │ 数字取证专项工具   │ 免费     │
# │                  │          │          │ VQL查询语言        │          │
# │                  │          │          │ 配合EDR做深度调查  │          │
# └──────────────────┴──────────┴──────────┴────────────────────┴──────────┘

# ━━━━ 选型决策树 ━━━━
#
# 你是...
# │
# ├─ 大型企业 (>5000 端点)?
# │   ├─ 预算充足 → CrowdStrike / Palo Alto XDR
# │   └─ 已有 M365 → Microsoft Defender for Endpoint
# │
# ├─ 中型企业 (500-5000 端点)?
# │   ├─ 需要自动化响应 → SentinelOne
# │   └─ 已有 M365 E5 → Microsoft Defender (免费!)
# │
# ├─ 初创/小团队 (<500 端点)?
# │   ├─ 有安全运维能力 → Wazuh (免费开源)
# │   └─ 无专职安全 → Microsoft Defender (最低门槛)
# │
# └─ 安全研究/取证团队?
#     └─ Velociraptor (专业取证) + 商业 EDR

# ━━━━ MITRE ATT&CK 评估结果 (2024) ━━━━
# 
# 检测覆盖率 (越高越好):
# CrowdStrike  ████████████████████ 99%
# SentinelOne  ███████████████████  96%
# Palo Alto    ██████████████████   93%
# MS Defender  █████████████████    90%
# Wazuh        ██████████████       78%
#
# 注: 开源方案需要大量自定义规则才能提升覆盖率`}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
