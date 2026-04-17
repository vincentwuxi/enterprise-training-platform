import { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Zeek 流量分析', 'Suricata IDS/IPS', 'JA3 & 加密流量', 'NetFlow & 异常检测'];

export default function LessonNDR() {
  const [active, setActive] = useState(0);

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 04 · NDR</div>
        <h1>网络安全 NDR</h1>
        <p>网络流量不会说谎——<strong>Zeek 将原始流量解析为结构化日志、Suricata 实时检测入侵行为、JA3 指纹识别加密流量中的恶意软件</strong>。EDR 看终端，NDR 看网络，两者结合才能形成完整视野。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🌐 NDR 核心技术栈</div>
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
                <span style={{ marginLeft: '0.5rem' }}>zeek-network-analysis.zeek</span>
              </div>
              <div className="bt-code">{`# ━━━━ Zeek (前 Bro): 网络可见性之王 ━━━━
# Zeek 不是 IDS (不做阻断), 是网络流量分析引擎
# 将原始网络流量 → 结构化日志 → 安全分析

# 安装: apt install zeek
# 监听: zeek -i eth0
# 离线分析: zeek -r capture.pcap

# ━━━━ Zeek 自动生成的日志类型 ━━━━
# ┌──────────────┬──────────────────────────────────────┐
# │ 日志文件     │ 内容                                 │
# ├──────────────┼──────────────────────────────────────┤
# │ conn.log     │ 每个 TCP/UDP 连接的元数据            │
# │              │ 源IP/目标IP/端口/持续时间/字节数     │
# │ dns.log      │ 所有 DNS 查询/响应                   │
# │              │ 用于检测 DGA/DNS隧道/C2             │
# │ http.log     │ 所有 HTTP 请求/响应                  │
# │              │ URL/User-Agent/响应码/MIME类型       │
# │ ssl.log      │ TLS 握手信息                         │
# │              │ SNI/证书/JA3指纹/过期证书            │
# │ files.log    │ 网络传输的文件                       │
# │              │ 文件哈希 → VirusTotal 查询           │
# │ notice.log   │ Zeek 告警事件                        │
# │ weird.log    │ 异常协议行为                         │
# │ x509.log     │ X.509 证书详情                       │
# │ smtp.log     │ 邮件流量 (钓鱼检测)                  │
# └──────────────┴──────────────────────────────────────┘

# ━━━━ 自定义 Zeek 脚本: 检测 DGA 域名 ━━━━
@load base/frameworks/notice

event dns_request(c: connection, msg: dns_msg, 
                  query: string, qtype: count) {
    # DGA 特征: 域名长度 > 20 且全小写字母+数字
    if ( |query| > 20 && /^[a-z0-9]+\\.[a-z]{2,4}$/ in query ) {
        NOTICE([
            $note=DNS::DGA_Detected,
            $conn=c,
            $msg=fmt("可疑 DGA 域名: %s", query),
            $identifier=query
        ]);
    }
}

# ━━━━ Zeek 实用查询 (命令行分析) ━━━━

# 1. 查找最多连接的外部 IP (可能是 C2)
cat conn.log | zeek-cut id.resp_h | \\
  sort | uniq -c | sort -rn | head -20

# 2. 查找异常 DNS 查询 (子域名 > 50 字符)
cat dns.log | zeek-cut query | \\
  awk 'length($0) > 50' | sort | uniq -c | sort -rn

# 3. 查找自签名证书 (可疑 HTTPS)
cat ssl.log | zeek-cut server_name validation_status | \\
  grep "self signed"

# 4. 查找非标准端口上的 HTTP 流量
cat http.log | zeek-cut id.resp_p host uri | \\
  awk '$1 != 80 && $1 != 443'

# 5. 查找大文件传输 (数据外泄)
cat conn.log | zeek-cut id.orig_h id.resp_h orig_bytes | \\
  awk '$3 > 100000000'  # > 100MB

# 6. 查找信标行为 (固定间隔连接)
cat conn.log | zeek-cut id.resp_h ts | \\
  sort -k1,1 -k2,2 | \\
  awk '{if(prev[$1]) { diff=$2-prev[$1]; \\
  if(diff>55 && diff<65) cnt[$1]++} prev[$1]=$2} \\
  END {for(i in cnt) if(cnt[i]>10) print i, cnt[i]}'
# → 每 60 秒一次的连接 = C2 信标`}</div>
            </div>

            <div className="bt-grid-4">
              {[
                { v: '10Gbps', l: 'Zeek 处理能力', color: 'var(--bt-blue)' },
                { v: '8+', l: '自动生成日志类型', color: 'var(--bt-green)' },
                { v: '文件哈希', l: '自动提取传输文件', color: 'var(--bt-amber)' },
                { v: '开源', l: '完全免费使用', color: 'var(--bt-muted)' },
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
              <span style={{ marginLeft: '0.5rem' }}>suricata-ids-rules.rules</span>
            </div>
            <div className="bt-code">{`# ━━━━ Suricata: 高性能 IDS/IPS ━━━━
# Suricata vs Snort:
#   Suricata: 多线程 → 适合高流量
#   Snort:    单线程 → 社区更大
#   Suricata 兼容 Snort 规则 → 可直接导入

# 安装: apt install suricata
# 运行: suricata -c suricata.yaml -i eth0

# ━━━━ suricata.yaml 基础配置 ━━━━
vars:
  HOME_NET: "[10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16]"
  EXTERNAL_NET: "!$HOME_NET"
  HTTP_SERVERS: "$HOME_NET"
  DNS_SERVERS: "$HOME_NET"

# 规则源:
#   - ET Open Rules    (免费, 社区维护)
#   - ET Pro Rules     (商业, Proofpoint)
#   - Suricata 官方规则 (免费)
# 更新: suricata-update

# ━━━━ 自定义检测规则 ━━━━

# 1. 检测反弹 Shell (Reverse Shell)
alert tcp $HOME_NET any -> $EXTERNAL_NET any (
    msg:"[CRITICAL] 检测到反弹 Shell";
    flow:established,to_server;
    content:"/bin/sh"; nocase;
    content:"-i"; distance:0; within:5;
    sid:1000001; rev:1;
    classtype:trojan-activity;
    metadata: mitre_technique T1059;
)

# 2. 检测 DNS 隧道 (超长子域名)
alert dns any any -> any any (
    msg:"[HIGH] DNS 隧道 - 超长子域名查询";
    dns.query;
    content:"."; offset:60;
    sid:1000002; rev:1;
    classtype:policy-violation;
    metadata: mitre_technique T1572;
)

# 3. 检测 PowerShell 下载 (Living off the Land)
alert http $HOME_NET any -> $EXTERNAL_NET any (
    msg:"[HIGH] PowerShell Web 请求下载";
    flow:established,to_server;
    http.user_agent; content:"PowerShell"; nocase;
    sid:1000003; rev:1;
    classtype:trojan-activity;
    metadata: mitre_technique T1059.001;
)

# 4. 检测 Cobalt Strike Beacon (HTTP)
alert http $HOME_NET any -> $EXTERNAL_NET any (
    msg:"[CRITICAL] 疑似 Cobalt Strike Beacon";
    flow:established,to_server;
    http.uri; content:"/submit.php"; endswith;
    http.header; content:"Cookie:";
    pcre:"/Cookie:\\s*[A-Za-z0-9+/=]{60,}/";
    sid:1000004; rev:1;
    classtype:trojan-activity;
)

# 5. 检测 ICMP 隧道 (数据外泄)
alert icmp $HOME_NET any -> $EXTERNAL_NET any (
    msg:"[MEDIUM] 异常大 ICMP 包 (疑似隧道)";
    dsize:>100;
    itype:8;
    sid:1000005; rev:1;
    classtype:policy-violation;
    metadata: mitre_technique T1572;
)

# 6. 检测 SMB 横向移动
alert tcp $HOME_NET any -> $HOME_NET 445 (
    msg:"[HIGH] SMB 横向移动 - PsExec 特征";
    flow:established,to_server;
    content:"|ff|SMB"; offset:0; depth:4;
    content:"PSEXESVC"; nocase;
    sid:1000006; rev:1;
    classtype:trojan-activity;
    metadata: mitre_technique T1021.002;
)

# ━━━━ Suricata 日志分析 ━━━━
# 告警日志: /var/log/suricata/fast.log
# EVE JSON:  /var/log/suricata/eve.json (推荐)
# EVE JSON 可直接导入 ELK/Splunk 进行关联分析

# 使用 jq 快速分析 EVE JSON:
cat eve.json | jq 'select(.event_type=="alert")' \\
  | jq '{ts: .timestamp, sig: .alert.signature, 
         src: .src_ip, dst: .dest_ip}' | head -50`}</div>
          </div>
        )}

        {active === 2 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>ja3-tls-fingerprint.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ JA3/JA3S: TLS 流量指纹 ━━━━

# 问题: 80%+ 的流量是 HTTPS 加密的, 传统 IDS 看不到内容
# 解决: JA3 不需要解密! 只分析 TLS 握手的明文部分

# JA3 原理:
# TLS Client Hello 包含以下明文字段:
#   1. TLS Version (版本)
#   2. Cipher Suites (加密套件列表)
#   3. Extensions (扩展列表)
#   4. Elliptic Curves (椭圆曲线)
#   5. EC Point Formats (曲线点格式)
#
# JA3 = MD5(上述 5 个字段拼接)
# → 每个 TLS 客户端都有独特的"指纹"
# → 即使 IP/域名变化, 恶意软件的 JA3 通常不变!

# ━━━━ 已知恶意 JA3 哈希表 ━━━━
# ┌──────────────────────┬──────────────────────────────────┐
# │ 恶意软件/工具        │ JA3 哈希                         │
# ├──────────────────────┼──────────────────────────────────┤
# │ Cobalt Strike 4.x    │ a0e9f5d64349fb13191bc781f81f42e1 │
# │ Metasploit Meterpreter│ 72a589da586844d7f0818ce684948eea │
# │ Trickbot             │ e7d705a3286e19ea42f587b344ee6865 │
# │ Emotet               │ 4d7a28d6f2263ed61de88ca66eb011e3 │
# │ Dridex               │ 51c64c77e60f3980eea90869b68c58a8 │
# │ SolarWinds SUNBURST  │ f5e5e4b95c3f44d7c2e5b2e8b60fa8af │
# └──────────────────────┴──────────────────────────────────┘

# JA3S = Server Hello 的指纹
# JA3 + JA3S 组合 → 更精确的识别

# ━━━━ 实战: 在 Zeek 中使用 JA3 ━━━━

# Zeek ssl.log 自动包含 JA3:
cat ssl.log | zeek-cut ja3 server_name | \\
  sort | uniq -c | sort -rn | head -20

# 匹配已知恶意 JA3:
cat ssl.log | zeek-cut ja3 id.orig_h id.resp_h server_name | \\
  grep -f known_malicious_ja3.txt

# ━━━━ 加密流量分析 (不解密) ━━━━

# 除了 JA3, 还可以分析:
# 1. 证书信息 (x509.log)
#    - 自签名证书 → 高度可疑
#    - 证书有效期 < 30 天 → 可能是临时 C2
#    - 免费证书 (Let's Encrypt) + 奇怪域名 → 可疑
#
# 2. SNI (Server Name Indication)
#    - TLS 握手中的明文域名
#    - SNI 与 DNS 查询不匹配 → Domain Fronting
#
# 3. 证书透明度 (CT Logs)
#    - 监控新注册的与你公司相似的域名
#    - 提前发现钓鱼域名
#    - 工具: crt.sh / CertStream
#
# 4. 流量模式 (不看内容)
#    - 包大小分布 → C2 通信通常是小包
#    - 时间间隔 → 固定间隔 = 信标
#    - Session 持续时间 → 异常长连接`}</div>
            </div>

            <div className="bt-grid-3">
              {[
                { name: 'JA3 (Client)', desc: 'TLS Client Hello 指纹', use: '识别恶意客户端/工具', color: '#3b82f6' },
                { name: 'JA3S (Server)', desc: 'TLS Server Hello 指纹', use: '识别恶意 C2 服务器', color: '#6366f1' },
                { name: 'JARM', desc: '主动扫描服务端 TLS', use: '批量识别 C2 基础设施', color: '#06b6d4' },
              ].map((f, i) => (
                <div key={i} className="bt-card" style={{ borderTop: `3px solid ${f.color}` }}>
                  <div style={{ fontWeight: 700, color: f.color, fontSize: '0.88rem', marginBottom: 4 }}>{f.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)', marginBottom: 4 }}>{f.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>🎯 {f.use}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {active === 3 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>netflow-anomaly-detection.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ NetFlow 分析 (元数据级网络监控) ━━━━

# NetFlow = 不看内容, 只看 "谁和谁通信, 多少流量, 多久"
# 类似: 不窃听电话内容, 只看通话记录

# NetFlow 记录的 5 元组:
# 源IP + 源端口 + 目标IP + 目标端口 + 协议
# + 字节数 + 包数 + 开始/结束时间

# ━━━━ 六大网络异常模式 ━━━━

# 1. 信标行为 (Beaconing) → C2 通信
# ─────────────────────────────────
# 特征: 固定间隔(±5%)的小包出站
# 检测: 
#   - 每 60 秒一次到同一 IP 的 HTTPS 连接
#   - 包大小 < 1KB, 持续 > 24 小时
# 精度提升:
#   时间间隔标准差 / 平均值 < 0.05 → 高置信度信标
# 工具: RITA (Real Intelligence Threat Analytics)
rita import --import-type zeek /path/to/logs my_dataset
rita show-beacons my_dataset

# 2. 数据外泄 (Data Exfiltration)
# ─────────────────────────────────
# 特征: 大量数据上传到异常 IP
# 检测:
#   - 单 IP 上传 > 100MB → 告警
#   - 工作时间外的大量上传 → 高度可疑
#   - 向从未通信过的 IP 发送大量数据
# 隐蔽外泄:
#   - DNS 隧道: 每次查询携带 < 255 字节
#   - ICMP 隧道: 利用 ping 包携带数据
#   - 图片隐写: 数据嵌入图片文件

# 3. 横向移动 (Lateral Movement)
# ─────────────────────────────────
# 特征: 内网 IP 扫描多台主机的 445/3389 端口
# 检测:
#   - 5 分钟内连接 > 10 台内网主机 → 告警
#   - 非 IT 工作站访问多台服务器 → 异常
#   - 使用 Admin Share (\\\\host\\C$) → P2 告警

# 4. 端口扫描 (Port Scanning)
# ─────────────────────────────────
# 特征: 单 IP 短时间连接多个端口
# 检测:
#   - 1分钟内连接 > 50 个不同端口 → 扫描
#   - SYN 包无后续 ACK → SYN 扫描
# 区分: 正常服务发现 vs 恶意扫描

# 5. DNS 异常
# ─────────────────────────────────
# 特征: 异常 DNS 查询模式
# 检测:
#   - 子域名 > 60 字符 → DNS 隧道
#   - 查询频率 > 100次/分钟 → DGA
#   - 直接查询 IP (跳过域名) → 可疑
#   - NXDOMAIN 响应 > 50% → DGA 尝试

# 6. 加密异常
# ─────────────────────────────────
# 特征: 非标准 TLS 行为
# 检测:
#   - 非 443 端口的 TLS 连接
#   - 自签名证书 + 新注册域名
#   - JA3 匹配已知恶意指纹
#   - 证书有效期 > 10 年 (默认C2配置)

# ━━━━ NDR 产品选型 ━━━━
# ┌──────────────────┬──────────┬──────────────────────┐
# │ 产品             │ 类型     │ 特点                 │
# ├──────────────────┼──────────┼──────────────────────┤
# │ Zeek + RITA      │ 开源     │ 最强开源组合         │
# │ Suricata         │ 开源     │ IDS/IPS, 多线程      │
# │ Darktrace        │ 商业     │ AI 驱动, 自学习      │
# │ Vectra AI        │ 商业     │ 攻击行为检测         │
# │ ExtraHop         │ 商业     │ 网络性能+安全        │
# │ Corelight        │ 商业     │ 基于 Zeek 的商业版   │
# └──────────────────┴──────────┴──────────────────────┘`}</div>
            </div>

            <div className="bt-section-title">🔍 网络异常模式速查</div>
            <div className="bt-grid-3">
              {[
                { name: '信标 (Beaconing)', pattern: '固定间隔小包出站', detect: 'C2 通信', severity: '🔴 高', color: '#ef4444' },
                { name: '数据外泄', pattern: '大量数据上传异常 IP', detect: '单 IP 上传 > 100MB', severity: '🔴 高', color: '#f97316' },
                { name: '横向移动', pattern: '内网扫描多主机多端口', detect: '5min 连接 > 10 台', severity: '🟡 中', color: '#fbbf24' },
                { name: 'DNS 隧道', pattern: '超长子域名查询', detect: '子域名 > 60 字符', severity: '🟡 中', color: '#3b82f6' },
                { name: 'DGA 域名', pattern: '随机域名 DNS 查询', detect: '高熵 + NXDOMAIN', severity: '🟡 中', color: '#6366f1' },
                { name: 'TLS 异常', pattern: '自签证书 + 非标端口', detect: 'JA3 匹配恶意指纹', severity: '🔴 高', color: '#06b6d4' },
              ].map((a, i) => (
                <div key={i} className="bt-card" style={{ borderLeft: `3px solid ${a.color}`, padding: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: a.color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{a.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)', marginBottom: '0.15rem' }}>📡 {a.pattern}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bt-muted)', marginBottom: '0.15rem' }}>🎯 {a.detect}</div>
                  <div style={{ fontSize: '0.8rem' }}>{a.severity}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
