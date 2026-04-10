import './LessonCommon.css';

const CODE = `# ━━━━ NDR 网络安全（Network Detection & Response）━━━━

# ━━━━ 1. Zeek（前 Bro）：网络流量分析 ━━━━
# Zeek 将原始网络流量解析为结构化日志
# 不是 IDS（不做阻断），是网络可见性工具

# 安装：apt install zeek
# 监听：zeek -i eth0

# Zeek 自动生成的日志类型：
# conn.log：每个 TCP/UDP 连接的元数据
# dns.log：所有 DNS 查询/响应
# http.log：所有 HTTP 请求/响应
# ssl.log：TLS 握手信息（SNI/JA3）
# files.log：传输的文件（可提取哈希）
# notice.log：告警事件

# ━━━━ 自定义 Zeek 脚本检测 DGA 域名 ━━━━
# dga-detect.zeek
@load base/frameworks/notice

event dns_request(c: connection, msg: dns_msg, query: string, qtype: count) {
    # DGA 特征：域名长度 > 20 且全小写字母+数字
    if ( |query| > 20 && /^[a-z0-9]+\\.[a-z]{2,4}$/ in query ) {
        NOTICE([
            $note=DNS::DGA_Detected,
            $conn=c,
            $msg=fmt("可疑 DGA 域名: %s", query),
            $identifier=query
        ]);
    }
}

# ━━━━ 2. Suricata：IDS/IPS 入侵检测/防御 ━━━━
# Suricata = 高性能 IDS/IPS，多线程，兼容 Snort 规则

# suricata.yaml 基础配置
vars:
  HOME_NET: "[10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16]"
  EXTERNAL_NET: "!$HOME_NET"

# 自定义检测规则
# 检测 Reverse Shell（反弹 Shell）
alert tcp $HOME_NET any -> $EXTERNAL_NET any (
    msg:"检测到可能的反弹 Shell";
    flow:established,to_server;
    content:"/bin/sh"; nocase;
    content:"-i"; distance:0; within:5;
    sid:1000001; rev:1;
    classtype:trojan-activity;
    metadata: mitre_technique T1059;
)

# 检测 DNS 隧道（DNS Tunneling）
alert dns any any -> any any (
    msg:"可疑 DNS 查询 - 超长子域名（疑似 DNS 隧道）";
    dns.query;
    content:"."; offset:60;   # 子域名 > 60 字符
    sid:1000002; rev:1;
    classtype:policy-violation;
)

# ━━━━ 3. JA3/JA3S 指纹（TLS 流量识别）━━━━
# JA3 = TLS Client Hello 的哈希指纹
# 即使域名/IP 变化，恶意软件的 TLS 指纹通常不变

# 已知恶意 JA3 哈希：
# Cobalt Strike: a0e9f5d64349fb13191bc781f81f42e1
# Metasploit:    72a589da586844d7f0818ce684948eea
# Trickbot:      e7d705a3286e19ea42f587b344ee6865

# Zeek 日志中的 JA3：
# cat ssl.log | awk '{print $NF}' | sort | uniq -c | sort -rn

# ━━━━ 4. NetFlow 分析（异常流量检测）━━━━
# 不看内容，只看"谁和谁通信、多少流量、持续多久"
#
# 异常模式：
# - 信标行为（Beaconing）：固定间隔的小流量出站
#   → C2 通信特征（每 60 秒一次小包）
# - 数据外泄：大量数据上传到异常 IP
#   → 单 IP 上传 > 100MB → 告警
# - 横向移动：内网 IP 扫描多台主机的 445/3389 端口
#   → 5 分钟内连接 > 10 台内网主机 → 告警`;

export default function LessonNDR() {
  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 04 · NDR</div>
        <h1>网络安全 NDR</h1>
        <p>网络流量不会说谎——<strong>Zeek 将原始流量解析为结构化日志、Suricata 实时检测入侵行为、JA3 指纹识别加密流量中的恶意软件</strong>。EDR 看终端，NDR 看网络，两者结合才能形成完整视野。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🌐 NDR 核心技术</div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>ndr-rules.zeek</span>
          </div>
          <div className="bt-code">{CODE}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🔍 网络异常模式</div>
        <div className="bt-grid-3">
          {[
            { name: '信标（Beaconing）', pattern: '固定间隔小包出站', detect: 'C2 通信', severity: '🔴 高', color: '#ef4444' },
            { name: '数据外泄', pattern: '大量数据上传异常 IP', detect: '单 IP 上传 > 100MB', severity: '🔴 高', color: '#f97316' },
            { name: '横向移动', pattern: '内网扫描多主机多端口', detect: '5min 连接 > 10 台内网', severity: '🟡 中', color: '#fbbf24' },
            { name: 'DNS 隧道', pattern: '超长子域名查询', detect: '子域名 > 60 字符', severity: '🟡 中', color: '#3b82f6' },
            { name: 'DGA 域名', pattern: '随机生成域名 DNS 查询', detect: '高熵+未知域名', severity: '🟡 中', color: '#6366f1' },
            { name: 'TLS 异常', pattern: '自签证书+非标端口', detect: 'JA3 匹配恶意指纹', severity: '🔴 高', color: '#06b6d4' },
          ].map((a, i) => (
            <div key={i} className="bt-card" style={{ borderLeft: `3px solid ${a.color}`, padding: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: a.color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{a.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)', marginBottom: '0.15rem' }}>📡 {a.pattern}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)', marginBottom: '0.15rem' }}>🎯 {a.detect}</div>
              <div style={{ fontSize: '0.8rem' }}>{a.severity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
