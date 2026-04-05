import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DEFENSE_LAYERS = [
  {
    name: 'WAF 配置', icon: '🧱', color: '#22c55e',
    code: `# Nginx + ModSecurity WAF 配置
# 安装 ModSecurity
apt install libmodsecurity3 libnginx-mod-security

# /etc/nginx/nginx.conf
http {
    # 启用 ModSecurity
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsec/main.conf;
}

# ModSecurity 核心规则集（CRS）
# /etc/nginx/modsec/main.conf
Include /etc/modsecurity/crs/crs-setup.conf
Include /etc/modsecurity/crs/rules/*.conf

# 自定义规则
SecRule ARGS "@rx (?i)(union.*select|drop.*table|insert.*into)" \\
    "id:1001,phase:2,deny,status:403,msg:'SQL Injection'"

SecRule ARGS "@rx <script[^>]*>" \\
    "id:1002,phase:2,deny,status:403,msg:'XSS detected'"

# 速率限制（防暴力破解）
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
server {
    location /api/login {
        limit_req zone=login burst=3 nodelay;  # 每分钟5次，允许短暂burst=3
    }
}

# Cloudflare WAF（推荐云托管方案）：Managed Rules + Rate Limiting`,
  },
  {
    name: 'IDS/IPS', icon: '🚨', color: '#fbbf24',
    code: `# Suricata：高性能 IDS/IPS 配置
# 安装
apt install suricata

# /etc/suricata/suricata.yaml 关键配置
vars:
  address-groups:
    HOME_NET: "[192.168.0.0/16,10.0.0.0/8]"  # 内网范围
  port-groups:
    HTTP_PORTS: "80,8080,443"

# 自定义检测规则 /etc/suricata/rules/local.rules
# 检测 SQL 注入尝试
alert http $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS \\
  (msg:"SQL Injection attempt"; content:"UNION SELECT"; \\
   http_uri; nocase; sid:1000001; rev:1;)

# 检测 XSS 攻击
alert http $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS \\
  (msg:"XSS Attack"; content:"<script>"; http_uri; \\
   nocase; sid:1000002;)

# 检测端口扫描
alert tcp $EXTERNAL_NET any -> $HOME_NET any \\
  (msg:"Port scan detected"; flags:S; threshold:type both, \\
   track by_src, count 30, seconds 60; sid:1000003;)

# 以 IPS 模式运行（主动阻断）
suricata -c /etc/suricata/suricata.yaml --af-packet --init-errors-fatal`,
  },
  {
    name: '零信任架构', icon: '🔒', color: '#a78bfa',
    code: `# 零信任核心原则：Never Trust, Always Verify
# 传统安全："内网可信" → 零信任："任何请求都必须验证"

# 实施关键点：
# 1. 身份验证：每个请求都需要强身份认证
# 2. 设备验证：确认设备是企业管理的
# 3. 最小权限：只给完成任务的最少权限
# 4. 持续监控：假设已被入侵，监控所有行为
# 5. 微分段：不同服务间通信也要验证

# 以 Cloudflare Zero Trust 为例
# cloudflare-zero-trust.yaml
policies:
  - name: "只允许企业邮箱访问内网系统"
    app_type: self_hosted
    url: https://internal.company.com
    include:
      - email_domain: "company.com"    # 只允许公司域名邮箱
      - mTLS:                          # 同时要求设备证书
          certificate_valid: true
    require:
      - identity_provider: "Google Workspace"
      - auth_method: "mfa"             # 强制多因素认证
      - country: ["CN", "US"]          # 国家白名单

# Google BeyondCorp 实践
# 所有员工访问内部应用：
# 公网访问 → 身份验证 → 设备注册检查 → 行为分析 → 授权访问
# 即使在办公室网络，同样要经过完整验证流程`,
  },
  {
    name: '安全编码清单', icon: '📋', color: '#f87171',
    code: `# OWASP 安全编码实践 Top 20 快速清单

## 输入验证
✅ 服务端验证所有输入（客户端验证只是UX，不是安全）
✅ 使用白名单验证（明确允许的格式）
✅ 拒绝无效输入，不尝试清理
✅ 文件上传：验证扩展名+MIME类型+内容

## 输出编码
✅ HTML输出转义（&<>"'）
✅ URL参数编码（urllib.parse.quote）
✅ SQL参数化查询（不拼接字符串）
✅ JSON输出使用framework自带序列化

## 身份认证与会话
✅ 密码：bcrypt + 最小8位 + 复杂度要求
✅ 支持 MFA（TOTP/SMS 二次验证）
✅ 登录失败锁定（5次 → 锁定15分钟）
✅ Session在登录后重新生成ID
✅ Cookie：HttpOnly + Secure + SameSite=Strict
✅ JWT：强密钥 + 短有效期 + 拒绝 alg=none

## 访问控制
✅ 默认拒绝，白名单授权
✅ 服务端每次请求都验证权限
✅ RBAC/ABAC 细粒度权限控制
✅ 日志记录所有越权尝试

## 密码学
✅ 使用 AES-256-GCM 加密敏感数据
✅ 密钥存 AWS KMS / GCP KMS，不存代码
✅ TLS 1.3 + HSTS + 禁用弱密码套件
✅ 使用 os.urandom() 生成随机数

## 错误处理
✅ 生产环境不返回技术错误详情
✅ 统一错误响应格式（不透露内部信息）
✅ 记录详细错误到日志（不显示给用户）`,
  },
  {
    name: 'DevSecOps', icon: '🔄', color: '#38bdf8',
    code: `# DevSecOps：将安全左移到 CI/CD 流水线

# .github/workflows/security.yml
name: Security Scanning
on: [push, pull_request]

jobs:
  sast:
    name: SAST 静态代码分析
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Bandit（Python安全扫描）
        run: |
          pip install bandit
          bandit -r src/ -f json -o bandit-report.json
          # 发现高危漏洞则构建失败
          bandit -r src/ --exit-zero -lll

  dependency:
    name: 依赖漏洞扫描
    runs-on: ubuntu-latest
    steps:
      - name: pip-audit
        run: pip-audit --vulnerability-service osv
      - name: Trivy Docker镜像扫描
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: my-app:latest
          severity: CRITICAL,HIGH  # 发现CRITICAL则失败

  secret:
    name: 敏感信息扫描
    runs-on: ubuntu-latest
    steps:
      - name: Gitleaks（防止密钥提交到Git）
        uses: gitleaks/gitleaks-action@v2
        # 扫描 AWS密钥/密码/Token/私钥 等100+种模式

  dast:
    name: DAST 动态扫描（仅PR）
    steps:
      - name: OWASP ZAP
        run: docker run ghcr.io/zaproxy/zaproxy zap-baseline.py -t $STAGING_URL`,
  },
];

const SECURE_ITEMS = [
  { cat: '🔴 立即修复', items: ['禁用 DEBUG 模式', '修改所有默认密码', '移除测试账号', '修复已知CVE漏洞', '关闭不必要端口'] },
  { cat: '🟡 本周完成', items: ['启用 HTTPS + HSTS', '配置 WAF 规则', '实施 MFA', '审计 sudo 权限', '设置登录失败锁定'] },
  { cat: '🟢 计划执行', items: ['零信任架构迁移', 'DevSecOps 流水线', '渗透测试计划', '安全意识培训', '事件响应预案'] },
];

export default function LessonDefense() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState(0);
  const [checked, setChecked] = useState({});
  const toggle = k => setChecked(p => ({ ...p, [k]: !p[k] }));

  const d = DEFENSE_LAYERS[activeLayer];
  const totalItems = SECURE_ITEMS.reduce((s, c) => s + c.items.length, 0);
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="lesson-sec">
      <div className="sec-badge green">🛡️ module_08 — 防御加固</div>

      <div className="sec-hero">
        <h1>防御加固：WAF / IDS / 零信任 / 安全编码清单</h1>
        <p>渗透测试的终极目的是改善防御能力。本模块从蓝队视角出发，构建<strong>纵深防御（Defense in Depth）</strong>体系——没有单一防线，每层都能独立阻挡一类攻击。</p>
      </div>

      {/* 五大防御层 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🧱 纵深防御五层体系（切换查看配置）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.875rem' }}>
          {DEFENSE_LAYERS.map((layer, i) => (
            <button key={i} onClick={() => setActiveLayer(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeLayer === i ? layer.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeLayer === i ? `${layer.color}10` : 'rgba(255,255,255,0.02)',
                color: activeLayer === i ? layer.color : '#5a1a1a', fontSize: '0.82rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.15rem' }}>{layer.icon}</div>
              {layer.name}
            </button>
          ))}
        </div>

        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: d.color }} />
            <span style={{ marginLeft: '0.5rem', color: d.color }}>{d.icon} {d.name} — 配置示例</span>
          </div>
          <div className="sec-terminal-body" style={{ color: '#c0ffd0', fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{d.code}</div>
        </div>
      </div>

      {/* 安全加固优先级清单 */}
      <div className="sec-section">
        <h2 className="sec-section-title">
          ✅ 安全加固优先级清单（{doneCount}/{totalItems} 完成）
        </h2>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.875rem' }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${(doneCount / totalItems) * 100}%`, background: 'linear-gradient(90deg, #7f1d1d, #dc2626, #22c55e)', transition: 'width 0.4s' }} />
        </div>
        <div className="sec-grid-3">
          {SECURE_ITEMS.map(cat => (
            <div key={cat.cat} className="sec-card" style={{ padding: '1rem', borderColor: cat.cat.includes('🔴') ? 'rgba(220,38,38,0.2)' : cat.cat.includes('🟡') ? 'rgba(251,191,36,0.2)' : 'rgba(34,197,94,0.2)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.5rem', color: cat.cat.includes('🔴') ? '#f87171' : cat.cat.includes('🟡') ? '#fbbf24' : '#22c55e' }}>{cat.cat}</div>
              {cat.items.map((item, j) => {
                const k = `${cat.cat}-${j}`;
                return (
                  <div key={j} onClick={() => toggle(k)}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', cursor: 'pointer', padding: '0.2rem 0.3rem', borderRadius: '4px',
                      background: checked[k] ? 'rgba(34,197,94,0.06)' : 'transparent' }}>
                    <div style={{ width: 16, height: 16, border: `1.5px solid ${checked[k] ? '#22c55e' : '#5a1a1a'}`, borderRadius: '3px', flexShrink: 0, background: checked[k] ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff', fontWeight: 900 }}>
                      {checked[k] ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: checked[k] ? '#22c55e' : '#5a1a1a' }}>{item}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 完成总结 */}
      <div className="sec-section">
        <div className="sec-card" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.06), rgba(34,197,94,0.04))', borderColor: 'rgba(220,38,38,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成 系统安全 & 渗透测试 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {['✅ CIA+STRIDE+攻击生命周期 攻防世界观建立', '✅ OWASP Top 10 全部漏洞攻击/修复代码', '✅ SQL 注入靶场模拟器（交互式演练）', '✅ XSS/CSRF/DOM四类客户端攻击+防御', '✅ 五阶段渗透方法论 + Burp Suite 工作流', '✅ Linux/Windows 权限提升全技术清单', '✅ 密码学选型速查（哈希/对称/非对称/TLS）', '✅ WAF/IDS/零信任/DevSecOps 防御体系'].map(s => (
              <div key={s} style={{ fontSize: '0.82rem', color: '#5a1a1a' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            🏆 推荐下一步：HTB（HackTheBox）⭐ TryHackMe ⭐ OSCP 认证备考
          </div>
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/crypto')}>← 上一模块</button>
        <button className="sec-btn defense" onClick={() => navigate('/course/security-pentest')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
