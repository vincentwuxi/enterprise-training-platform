import { useState } from 'react';
import './LessonCommon.css';

const tabs = ['NIST IR 流程', '检测与遏制', '数字取证', '事后改进'];

export default function LessonIncident() {
  const [active, setActive] = useState(0);

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 08 · INCIDENT RESPONSE</div>
        <h1>应急响应</h1>
        <p>安全事件不是"会不会发生"而是"什么时候发生"——<strong>NIST 六阶段 IR 流程（准备→检测→遏制→根除→恢复→改进）是每个安全团队的"肌肉记忆"</strong>。准备越充分，响应越迅速，损失越小。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🚨 应急响应全流程</div>
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
                <span style={{ marginLeft: '0.5rem' }}>nist-ir-framework.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ NIST IR 六阶段流程 (SP 800-61r2) ━━━━

# ┌────────────────────────────────────────────────────────┐
# │                                                        │
# │   ① 准备 → ② 检测分析 → ③ 遏制 → ④ 根除            │
# │                                                        │
# │                          ↓                             │
# │                                                        │
# │                     ⑤ 恢复 → ⑥ 事后改进 → ① 准备    │
# │                     (循环改进)                          │
# └────────────────────────────────────────────────────────┘

# ━━━━ ① 准备阶段 (Preparation) ━━━━
# 这是最重要的阶段! 80% 的 IR 效果取决于准备。

# IR 就绪清单 (Readiness Checklist):
# ┌────┬──────────────────┬───────────────────────────────┐
# │ #  │ 项目             │ 具体要求                      │
# ├────┼──────────────────┼───────────────────────────────┤
# │ 1  │ IR 计划文档      │ 书面计划, 年度审核更新        │
# │ 2  │ 应急联系人       │ 技术/管理/法务/公关/执法       │
# │ 3  │ 通信计划         │ 内部 Slack/Teams + 外部声明    │
# │ 4  │ 取证工具箱       │ 预配置 USB 启动盘 + 脚本      │
# │ 5  │ 隔离执行流程     │ 网络隔离 SOP + 授权审批链     │
# │ 6  │ 备份恢复测试     │ 每季度演练一次恢复            │
# │ 7  │ 桌面推演         │ 每半年一次模拟事件推演        │
# │ 8  │ 外部合同         │ IR 服务商预签合同(非事中签)    │
# │ 9  │ 日志保留策略     │ 关键日志 ≥ 90 天             │
# │10  │ 证据保全流程     │ CoC 监管链 + 法律合规         │
# └────┴──────────────────┴───────────────────────────────┘

# IR 取证工具箱 (Go Bag):
# ┌──────────────────────┬──────────────────────────────┐
# │ 工具                 │ 用途                         │
# ├──────────────────────┼──────────────────────────────┤
# │ WinPMEM / AVML       │ 内存取证镜像                 │
# │ FTK Imager           │ 磁盘取证镜像                 │
# │ Velociraptor         │ 远程取证数据收集             │
# │ Volatility 3         │ 内存分析框架                 │
# │ KAPE                 │ 快速证据收集                 │
# │ Sysinternals Suite   │ Windows 系统调试工具         │
# │ Wireshark            │ 网络流量捕获分析             │
# │ CyberChef            │ 加解密/编解码瑞士军刀        │
# └──────────────────────┴──────────────────────────────┘`}</div>
            </div>

            <div className="bt-grid-4">
              {[
                { v: '< 15min', l: 'P1 事件响应目标', color: 'var(--bt-red)' },
                { v: '80%', l: '效果取决于准备', color: 'var(--bt-amber)' },
                { v: '90天', l: '日志最低保留', color: 'var(--bt-blue)' },
                { v: '2次/年', l: '桌面推演频率', color: 'var(--bt-green)' },
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
          <div className="bt-code-wrap">
            <div className="bt-code-head">
              <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>detection-containment.md</span>
            </div>
            <div className="bt-code">{`# ━━━━ ② 检测与分析 ━━━━

# 事件时间线 (Timeline) 构建:
# 从多个数据源拼接完整攻击链
# 这是 IR 最关键的技术能力

# ━━━━ 案例: 勒索软件事件时间线 ━━━━
# 
# 14:32 - 用户收到钓鱼邮件 (邮件网关日志)
#   📧 发件人: invoice@fake-company.com
#   📎 附件: Invoice_Q3_Final.xlsm (包含恶意宏)
#
# 14:35 - 用户打开附件，宏执行 (Sysmon EID 1)
#   ⚡ WINWORD.EXE → cmd.exe → powershell.exe
#   ⚡ PowerShell -enc [Base64编码的恶意脚本]
#
# 14:36 - 下载 Cobalt Strike Beacon (Sysmon EID 3)
#   🌐 连接: evil-c2.com:443 (HTTPS)
#   📁 落盘: C:\Users\Public\svchost.exe
#
# 14:37 - 进程注入 (Sysmon EID 8)
#   💉 注入目标: 合法的 svchost.exe 进程
#   目的: 防御规避 → EDR 难以检测
#
# 14:40 - 凭证窃取 (Sysmon EID 10)
#   🔑 访问 lsass.exe 内存
#   🔑 使用 Mimikatz 提取域管密码哈希
#
# 14:45 - 获取 Domain Admin (AD EventID 4672)
#   👑 Pass-the-Hash 获取域管理员权限
#
# 14:50 - 横向移动到域控 (RDP, EID 4624 Type 10)
#   🏃 使用域管凭证 RDP 连接 DC01
#
# 15:00 - GPO 部署勒索软件
#   💣 通过组策略将勒索软件推送到所有工作站
#   💣 同时删除 Volume Shadow Copies
#
# 15:05 - 文件加密开始，勒索通知出现
#   🔒 加密完成，显示 ransom note
#   💰 要求 100 BTC (≈ $6.5M)


# ━━━━ ③ 遏制 (Containment) ━━━━

# 原则: 断网但不关机! (保留内存证据)

# 短期遏制 (分钟级 → 止血):
# ┌────┬──────────────────────────┬──────────────────┐
# │ #  │ 动作                     │ 执行方式         │
# ├────┼──────────────────────────┼──────────────────┤
# │ 1  │ 网络隔离受感染主机       │ EDR 远程隔离     │
# │ 2  │ 封锁 C2 IP/域名         │ 防火墙 + DNS     │
# │ 3  │ 禁用被盗账户            │ AD 立即禁用      │
# │ 4  │ 阻断横向移动端口        │ 关闭 SMB + RDP   │
# │ 5  │ 启用增强监控            │ 临时加强日志     │
# └────┴──────────────────────────┴──────────────────┘

# 长期遏制 (小时级 → 构建安全区):
# 1. 重置所有 Domain Admin 密码
# 2. krbtgt 密码双重重置 (防 Golden Ticket)
#    - 第一次重置, 等待复制完成
#    - 12 小时后再重置一次
# 3. 部署临时监控规则 (重点监控横向移动)
# 4. 将受感染网段隔离到单独 VLAN
# 5. 建立"干净"网络区域供恢复使用

# ④ 根除 (Eradication):
# - 完全清除恶意软件 (建议重装而非清理)
# - 修复攻击入口 (补丁/配置/策略)
# - 清除所有持久化机制 (计划任务/注册表)
# - 确认所有后门已清除 (全盘 YARA 扫描)

# ⑤ 恢复 (Recovery):
# - 从已验证的干净备份恢复
# - 分阶段恢复: 关键系统 → 重要系统 → 一般系统
# - 恢复后持续监控 72 小时
# - 不要使用在线备份 (可能也被加密)`}</div>
          </div>
        )}

        {active === 2 && (
          <div className="bt-code-wrap">
            <div className="bt-code-head">
              <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>digital-forensics.sh</span>
            </div>
            <div className="bt-code">{`# ━━━━ 数字取证 (Digital Forensics) ━━━━

# 取证黄金原则:
# 1. 不修改原始证据 (只读挂载)
# 2. 监管链 (Chain of Custody) 记录完整
# 3. 证据可重现、可验证
# 4. 时间戳和哈希记录一切

# ━━━━ Step 1: 内存取证 ━━━━
# 内存是最易消失的证据 → 优先采集!

# Windows 内存镜像采集:
winpmem_mini_x64.exe memdump.raw
# 或使用 Magnet RAM Capturer (图形界面)

# Linux 内存镜像采集:
sudo avml memdump.lime
# 或: sudo insmod lime.ko "path=memdump.lime format=lime"

# 内存分析 (Volatility 3):
# 列出所有进程 (发现隐藏进程)
python3 vol.py -f memdump.raw windows.pslist
python3 vol.py -f memdump.raw windows.psscan  # 包含隐藏进程

# 检测进程注入 (关键!)
python3 vol.py -f memdump.raw windows.malfind
# malfind 检测: 内存段有执行权限 + 非映射文件
# → 几乎 100% 可疑

# 查看网络连接 (找 C2 通信)
python3 vol.py -f memdump.raw windows.netscan
# 重点关注: ESTABLISHED 状态 + 非标准端口

# 提取命令行参数
python3 vol.py -f memdump.raw windows.cmdline
# 发现: powershell -enc XXXXXX → 解码分析

# 提取注入的 DLL
python3 vol.py -f memdump.raw windows.dlllist --pid 1234

# ━━━━ Step 2: 磁盘取证 ━━━━

# 1. 制作磁盘镜像 (法律级别的证据保全)
dd if=/dev/sda of=/evidence/disk.img bs=4M status=progress

# 专业级: 使用 dc3dd (带校验和日志)
dc3dd if=/dev/sda of=/evidence/disk.img hash=sha256 \\
  log=/evidence/acquisition.log

# 2. 计算并记录哈希 (证据完整性证明)
sha256sum /evidence/disk.img > /evidence/disk.sha256
# 取证前后的哈希必须一致 → 证明未被篡改

# 3. 只读挂载分析
mount -o ro,loop,noexec,nosuid /evidence/disk.img /mnt/evidence

# 4. 关键取证点:
# - 预取文件 (Prefetch): 程序执行历史
#   C:\\Windows\\Prefetch\\*.pf
#
# - 事件日志: 登录/进程/服务
#   C:\\Windows\\System32\\winevt\\Logs\\*.evtx
#
# - 浏览器历史/下载: 初始感染向量
#   C:\\Users\\*\\AppData\\Local\\Google\\Chrome\\
#
# - $MFT: 文件系统时间线
#   析取: python3 analyzeMFT.py -f $MFT -o timeline.csv
#
# - 注册表 Hive: 持久化 + 用户活动
#   NTUSER.DAT, SAM, SYSTEM, SOFTWARE

# ━━━━ Step 3: 网络取证 ━━━━
# 捕获和分析网络流量

# 使用 tcpdump 捕获流量
tcpdump -i eth0 -w /evidence/capture.pcap -c 100000

# Wireshark 分析:
# - 过滤 C2 通信: ip.addr == [C2_IP]
# - 导出 HTTP 对象: File → Export Objects → HTTP
# - 检查 DNS 隧道: dns.qry.name contains "encoded"

# ━━━━ KAPE: 快速取证数据收集 ━━━━
# Kroll Artifact Parser and Extractor
# 不做全盘镜像, 只收集关键取证文件 → 快!

# 收集关键 Windows 取证数据
kape.exe --tsource C: --tdest /evidence/kape/ \\
  --target KapeTriage \\
  --module !EZParser
# 5 分钟内收集完关键证据 (vs 全盘镜像数小时)`}</div>
          </div>
        )}

        {active === 3 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>lessons-learned.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ ⑥ 事后改进 (Lessons Learned) ━━━━
# 这一步最容易被跳过, 但恰恰最重要!

# ━━━━ 复盘会议议程 (Postmortem) ━━━━
# 参与者: IR 团队 + 受影响部门 + 管理层
# 时间: 事件关闭后 1 周内
# 原则: 无指责文化 (Blame-Free)

# 1. 事件概述
#    - 发生了什么? (一句话总结)
#    - 影响范围: XX 台终端, XX 条数据
#    - 持续时间: 检测到 → 完全恢复 = XX 小时

# 2. 时间线回顾
#    - 攻击者视角: 完整的攻击链
#    - 防守者视角: 我们何时知道? 何时遏制?

# 3. Root Cause Analysis (5 Why 分析法)
#    问题: 勒索软件加密了 200 台工作站
#    Why 1: 因为恶意 GPO 被推送到域
#    Why 2: 因为攻击者获取了域管权限
#    Why 3: 因为 LSASS 中存储了域管凭证哈希
#    Why 4: 因为没有启用 Credential Guard
#    Why 5: 因为 Windows 安全基线没有覆盖该配置
#    → 根因: 安全基线不完整

# 4. 检测差距分析
#    ┌──────────────────┬──────────┬──────────────────┐
#    │ 攻击步骤         │ 是否检测 │ 改进措施         │
#    ├──────────────────┼──────────┼──────────────────┤
#    │ 钓鱼邮件         │ ❌ 未检测│ 加强邮件过滤规则 │
#    │ 宏执行           │ ✅ 检测  │ 未生效(规则关闭) │
#    │ PowerShell 下载  │ ✅ 检测  │ 告警被误判关闭   │
#    │ 进程注入         │ ❌ 未检测│ 新增 Sysmon EID8 │
#    │ 凭证窃取         │ ✅ 检测  │ EID10 告警被淹没 │
#    │ 横向移动         │ ❌ 未检测│ 新增 SMB 异常规则│
#    │ GPO 推送加密     │ ✅ 检测  │ 检测到时已太晚   │
#    └──────────────────┴──────────┴──────────────────┘

# 5. Action Items (必须具体可执行!)
#    ┌────┬──────────────────────┬─────────┬──────────┐
#    │ #  │ 改进项               │ Owner   │ Deadline │
#    ├────┼──────────────────────┼─────────┼──────────┤
#    │ 1  │ 启用 Credential Guard│ IT Ops  │ 2 周内   │
#    │ 2  │ 加强邮件附件过滤     │ SecOps  │ 1 周内   │
#    │ 3  │ 新增 5 条 Sigma 规则 │ SOC     │ 3 天内   │
#    │ 4  │ 实施 3-2-1 备份策略  │ IT Ops  │ 1 月内   │
#    │ 5  │ 全员反钓鱼培训       │ HR+Sec  │ 2 周内   │
#    │ 6  │ 网络微分段改造       │ NetOps  │ 3 月内   │
#    └────┴──────────────────────┴─────────┴──────────┘

# ━━━━ IR 成熟度自评 ━━━━
# Level 1 (被动): 没有 IR 计划, 事件发生时手忙脚乱
# Level 2 (基础): 有 IR 计划但很少演练, 依赖个人经验
# Level 3 (标准): 有 Playbook + SIEM + EDR, 定期演练
# Level 4 (优化): SOAR 自动化 + 威胁猎捕 + 红蓝对抗
# Level 5 (卓越): 全自动响应 + 预测性防御 + 行业协作`}</div>
            </div>

            <div className="bt-section-title">🏁 蓝队防御全链路回顾</div>
            <div className="bt-steps">
              {[
                { step: '1', name: 'SOC 运营', desc: '告警分级 + 三层模型 + MITRE ATT&CK 映射 + Playbook', color: '#3b82f6' },
                { step: '2', name: 'SIEM 日志', desc: 'ELK/Splunk + Sigma 规则 + 关联分析 → SOC 的"眼睛"', color: '#6366f1' },
                { step: '3', name: '终端 EDR', desc: 'YARA 规则 + Sysmon 监控 + Osquery → 端点行为检测', color: '#06b6d4' },
                { step: '4', name: '网络 NDR', desc: 'Zeek + Suricata + JA3 指纹 → 网络流量分析', color: '#38bdf8' },
                { step: '5', name: '云安全', desc: 'CloudTrail + GuardDuty + IAM 最小权限 + 容器安全', color: '#3b82f6' },
                { step: '6', name: '零信任', desc: 'BeyondCorp + 微分段 + 持续认证 → "永不信任"', color: '#6366f1' },
                { step: '7', name: '威胁情报', desc: 'IOC/TTP + STIX/TAXII + 威胁狩猎 + ATT&CK Navigator', color: '#06b6d4' },
                { step: '8', name: '应急响应', desc: 'NIST 六阶段 + 数字取证 + Volatility + 事后复盘', color: '#fbbf24' },
              ].map((s, i) => (
                <div key={i} className="bt-step">
                  <div className="bt-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--bt-muted)', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bt-tip">💡 <strong>红蓝对抗闭环</strong>：渗透测试课（红队）教你"怎么攻"，本课（蓝队）教你"怎么防"。红队发现的每个漏洞 → 蓝队写检测规则 → 红队绕过规则 → 蓝队改进规则 → 螺旋上升的安全水平。</div>
          </>
        )}
      </div>
    </div>
  );
}
