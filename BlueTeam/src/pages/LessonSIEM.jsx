import { useState } from 'react';
import './LessonCommon.css';

const CODE_ELK = `# ━━━━ ELK Stack（Elasticsearch + Logstash + Kibana）━━━━

# ━━━━ 1. 架构概览 ━━━━
# [数据源] → Beats → Logstash → Elasticsearch → Kibana
#
# Beats：轻量日志采集器（Filebeat/Winlogbeat/Packetbeat）
# Logstash：日志解析/转换/丰富
# Elasticsearch：搜索和存储引擎
# Kibana：可视化仪表盘 + 安全分析

# ━━━━ 2. Filebeat 配置（日志采集）━━━━
# filebeat.yml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/auth.log       # Linux 认证日志
      - /var/log/syslog
    fields:
      log_type: linux_auth
  - type: log
    paths:
      - /var/log/nginx/access.log
    fields:
      log_type: nginx

output.logstash:
  hosts: ["siem-server:5044"]

# ━━━━ 3. Logstash 解析管道 ━━━━
# logstash.conf
input {
  beats { port => 5044 }
}

filter {
  # SSH 暴力破解检测
  if [log_type] == "linux_auth" {
    grok {
      match => { "message" => "Failed password for %{USER:username} from %{IP:src_ip}" }
    }
    geoip { source => "src_ip" }   # IP 地理位置丰富
    # 标记：同一 IP 5 分钟内 > 10 次失败 → 暴力破解
  }

  # Nginx 日志解析
  if [log_type] == "nginx" {
    grok {
      match => { "message" => '%{IPORHOST:src_ip} .* "%{WORD:method} %{URIPATH:path}" %{INT:status}' }
    }
    # 标记：状态码 4xx > 100/分钟 → Web 扫描
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "security-%{+YYYY.MM.dd}"
  }
}`;

const CODE_SIGMA = `# ━━━━ Sigma 规则（通用检测规则语言）━━━━
# Sigma = 安全检测的 "YAML 规则"
# 可转换为 Splunk SPL / Elastic KQL / QRadar AQL 等

# ━━━━ 规则示例：检测 Mimikatz ━━━━
title: Mimikatz 凭证窃取工具检测
id: 0ec65b1f-0bb5-45a4-b9f3-2b8c36d3a789
status: stable
description: 检测 Mimikatz 工具的执行
author: Blue Team
date: 2025/01/15
references:
  - https://attack.mitre.org/techniques/T1003/001/
logsource:
  category: process_creation
  product: windows
detection:
  selection_name:
    - Image|endswith:
      - '\\mimikatz.exe'
      - '\\mimilib.dll'
  selection_cmdline:
    CommandLine|contains:
      - 'sekurlsa::logonpasswords'
      - 'lsadump::sam'
      - 'privilege::debug'
  selection_hash:
    Hashes|contains:
      - 'IMPHASH=A9D50692E56DC6FE6C11B42F5C3B6C6C'
  condition: selection_name or selection_cmdline or selection_hash
falsepositives:
  - 安全测试工具
level: critical
tags:
  - attack.credential_access
  - attack.t1003.001

# ━━━━ Sigma 转换为 Elastic KQL ━━━━
# sigma convert -t elasticsearch -p ecs-windows rule.yml
# 输出：
# process.executable:*\\\\mimikatz.exe OR
# process.command_line:*sekurlsa*logonpasswords*

# ━━━━ Sigma 转换为 Splunk SPL ━━━━
# sigma convert -t splunk rule.yml
# 输出：
# index=windows Image="*\\\\mimikatz.exe" OR
# CommandLine="*sekurlsa::logonpasswords*"

# ━━━━ 关联分析规则 ━━━━
# 单条日志不足以定性 → 多事件关联才能确认攻击
#
# 示例：横向移动检测
# 条件：5 分钟内，同一源 IP 满足以下所有：
# 1. 成功 RDP 登录（EventID 4624, LogonType 10）
# 2. 新进程创建（EventID 4688, 非常见进程）
# 3. 远程服务创建（EventID 7045）
# → 高置信度横向移动告警`;

export default function LessonSIEM() {
  const [tab, setTab] = useState('elk');
  const tabs = [
    { key: 'elk',   label: '📊 ELK Stack', code: CODE_ELK },
    { key: 'sigma', label: '📝 Sigma 规则 & 关联分析', code: CODE_SIGMA },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 02 · SIEM</div>
        <h1>SIEM 日志工程</h1>
        <p>SIEM 是 SOC 的"眼睛"——<strong>将分散在数百台服务器、网络设备、终端上的日志集中收集、解析、关联，用 Sigma 规则自动检测已知攻击模式</strong>。没有 SIEM，SOC 就是盲人摸象。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🔍 SIEM 两大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`bt-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'elk' ? 'logstash.conf' : 'sigma-rule.yml'}</span>
          </div>
          <div className="bt-code">{t.code}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">📊 SIEM 产品对比</div>
        <div className="bt-card" style={{ overflowX: 'auto' }}>
          <table className="bt-table">
            <thead><tr><th>产品</th><th>定位</th><th>规则语言</th><th>成本</th><th>推荐场景</th></tr></thead>
            <tbody>
              {[
                ['ELK Stack', '开源', 'KQL / Lucene', '免费（自运维）', '预算有限、自建能力强'],
                ['Splunk', '商业领导者', 'SPL', '按数据量付费（贵）', '大型企业、成熟 SOC'],
                ['Azure Sentinel', '云原生', 'KQL', '按注入量付费', 'Azure / M365 生态'],
                ['Google SecOps', '云原生', 'YARA-L', '按端点付费', 'Google Cloud 生态'],
                ['Wazuh', '开源 XDR', 'XML Rules', '免费', '中小企业、一体化'],
              ].map(([name, pos, lang, cost, rec], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{name}</td>
                  <td><span className="bt-tag blue">{pos}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem' }}>{lang}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--bt-muted)' }}>{cost}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--bt-muted)' }}>{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
