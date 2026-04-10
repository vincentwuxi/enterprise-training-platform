import './LessonCommon.css';

const CODE = `# ━━━━ EDR 终端安全（Endpoint Detection & Response）━━━━

# ━━━━ 1. EDR 核心能力 ━━━━
# 传统杀毒（AV）：基于签名匹配已知病毒文件
# EDR：实时监控终端行为，检测未知威胁 + 自动响应
#
# 数据采集：进程创建/文件操作/注册表/网络连接/内存
# 行为检测：异常行为模式匹配（不依赖签名）
# 自动响应：隔离终端/杀进程/回滚文件
# 取证支持：完整行为时间线（Timeline）

# ━━━━ 2. YARA 规则（恶意文件检测）━━━━
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
        uint16(0) == 0x5A4D and    // PE 文件
        filesize < 1MB and
        (2 of ($beacon_config, $sleep_mask, $named_pipe) or
         all of ($uri_checksum, $default_ua))
}

# 使用：yara -r cobalt_strike.yar /suspicious/directory/

# ━━━━ 3. Sysmon 进程监控（Windows 必备）━━━━
# Sysmon = System Monitor（微软官方工具）
# 记录详细的进程/网络/文件活动日志

# sysmon-config.xml（推荐配置）
# 监控规则：
# EventID 1：进程创建（包含完整命令行和父进程）
# EventID 3：网络连接（源IP/目标IP/端口）
# EventID 7：DLL 加载（检测 DLL 注入）
# EventID 8：CreateRemoteThread（检测进程注入）
# EventID 10：ProcessAccess（检测 LSASS 访问=凭证窃取）
# EventID 11：文件创建
# EventID 22：DNS 查询

# 检测逻辑示例：
# 规则：LSASS 进程被非系统进程访问
# EventID 10 + TargetImage=lsass.exe + SourceImage != svchost.exe
# → 可能是凭证窃取（Mimikatz/LaZagne/procdump）

# ━━━━ 4. Linux EDR：Osquery + Wazuh ━━━━
# Osquery：Facebook 开源，SQL 查询操作系统
SELECT pid, name, path, cmdline, start_time
FROM processes
WHERE name IN ('nc', 'ncat', 'socat', 'python', 'perl')
  AND on_disk = 0;
-- 检测：运行中但磁盘上不存在的可疑进程（fileless malware）

SELECT address, port, pid, protocol
FROM listening_ports
WHERE port NOT IN (22, 80, 443, 3306)
  AND address = '0.0.0.0';
-- 检测：监听在非标准端口上的后门

# ━━━━ 5. 主流 EDR 产品对比 ━━━━
# ┌──────────────────┬──────────┬──────────┬───────────────────┐
# │ 产品             │ 平台     │ 定位     │ 特点              │
# ├──────────────────┼──────────┼──────────┼───────────────────┤
# │ CrowdStrike      │ Win/Mac/Lin│ 商业领导│ 云原生、AI检测    │
# │ SentinelOne      │ Win/Mac/Lin│ 商业    │ 自动响应、回滚    │
# │ Microsoft Defender│ Windows  │ 内置    │ M365集成、免费    │
# │ Wazuh            │ 全平台   │ 开源    │ SIEM+EDR一体化    │
# │ Velociraptor     │ 全平台   │ 开源    │ 取证调查专用      │
# └──────────────────┴──────────┴──────────┴───────────────────┘`;

export default function LessonEDR() {
  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 03 · EDR</div>
        <h1>终端安全 EDR</h1>
        <p>终端是攻击的"第一着陆点"——<strong>EDR 实时监控每个进程创建、DLL 加载、网络连接，用 YARA 规则检测恶意文件，用行为分析发现无文件攻击</strong>。从"杀毒软件"进化到"端点行为监控"的时代。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🖥️ EDR 核心代码</div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>edr-rules.yar</span>
          </div>
          <div className="bt-code">{CODE}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">📊 Sysmon 关键事件 ID</div>
        <div className="bt-grid-3">
          {[
            { id: 'EventID 1', name: '进程创建', detect: '可疑命令行（powershell -enc ...）', color: '#3b82f6' },
            { id: 'EventID 3', name: '网络连接', detect: '连接 C2 服务器的出站流量', color: '#6366f1' },
            { id: 'EventID 8', name: 'CreateRemoteThread', detect: '进程注入（DLL Injection）', color: '#ef4444' },
            { id: 'EventID 10', name: 'ProcessAccess', detect: 'LSASS 访问 = 凭证窃取', color: '#f97316' },
            { id: 'EventID 11', name: '文件创建', detect: '可执行文件落盘（Dropper）', color: '#06b6d4' },
            { id: 'EventID 22', name: 'DNS 查询', detect: 'DGA 域名 / DNS 隧道', color: '#22c55e' },
          ].map((e, i) => (
            <div key={i} className="bt-card" style={{ borderLeft: `3px solid ${e.color}`, padding: '0.85rem' }}>
              <span className="bt-tag blue" style={{ marginBottom: '0.3rem', display: 'inline-block' }}>{e.id}</span>
              <div style={{ fontWeight: 700, color: e.color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{e.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)' }}>🎯 {e.detect}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
