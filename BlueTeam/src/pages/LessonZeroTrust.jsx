import './LessonCommon.css';

const CODE = `# ━━━━ 零信任架构（Zero Trust Architecture）━━━━
# 核心理念："永不信任，始终验证"（Never Trust, Always Verify）
# 传统安全：城堡模型（内网 = 可信，外网 = 不可信）
# 零信任：没有"内网"概念，每次访问都要验证

# ━━━━ 1. BeyondCorp（Google 的零信任实践）━━━━
# Google 2014 年论文：取消 VPN，所有应用通过代理访问
#
# 访问决策引擎（Access Proxy）：
# 每次请求 → 检查以下信号 → 决定是否放行
#
# ┌──────────────────────────────────────────────┐
# │              访问请求                         │
# │                                              │
# │  用户身份 ──┐                                │
# │  设备状态 ──┤                                │
# │  网络位置 ──┼── Access Proxy ── Allow/Deny   │
# │  资源敏感度 ─┤                                │
# │  行为上下文 ─┘                                │
# └──────────────────────────────────────────────┘
#
# 信号维度：
# 1. 用户：身份认证（MFA）+ 角色（RBAC）
# 2. 设备：是否企业设备 + OS 补丁 + 防病毒 + 加密
# 3. 网络：IP 信誉 + 地理位置 + 时间异常
# 4. 资源：敏感度级别（公开/内部/机密）
# 5. 行为：是否偏离基线（异常登录时间/位置）

# ━━━━ 2. ZTNA 实现方案 ━━━━
# 零信任网络访问（Zero Trust Network Access）
#
# 商业方案：
# - Cloudflare Access（与 CF Workers 课程闭环！）
# - Zscaler Private Access
# - Palo Alto Prisma Access
# - Google BeyondCorp Enterprise
#
# 开源方案：
# - Teleport（SSH/K8s/数据库零信任）
# - Boundary（HashiCorp，基于身份的访问）
# - Tailscale（基于 WireGuard 的私有网络）

# ━━━━ 3. 微分段（Microsegmentation）━━━━
# 传统：一个大内网，横向移动无阻碍
# 微分段：将网络切成最小粒度的安全区域
#
# 实现方式：
# 1. 基于网络（VLAN/Firewall ACL）→ 粗粒度
# 2. 基于主机（iptables/Windows Firewall）→ 中粒度
# 3. 基于身份（Service Mesh / mTLS）→ 最细粒度

# Kubernetes 中的微分段（NetworkPolicy）
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-only-from-frontend
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - port: 8080
# → api-server 只接受来自 frontend Pod 的 8080 端口连接
# → 即使攻击者拿下了其他 Pod，也无法访问 api-server

# ━━━━ 4. 持续认证（Continuous Authentication）━━━━
# 不是"登录一次就信任"，而是"持续评估"
#
# 触发重新评估的信号：
# - 地理位置突然变化（不可能旅行）
# - 设备指纹变化
# - 行为偏离基线（访问从未访问的资源）
# - Risk Score 超过阈值
# - Session 超时（每 4 小时重认证）
#
# 响应动作：
# Low Risk → 继续访问
# Medium Risk → Step-up MFA（要求再次验证）
# High Risk → 终止 Session + 通知 SOC`;

export default function LessonZeroTrust() {
  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 06 · ZERO TRUST</div>
        <h1>零信任架构</h1>
        <p>VPN 已死，零信任万岁——<strong>"永不信任，始终验证"意味着每一次访问都要经过身份验证 + 设备检查 + 行为分析</strong>。Google 的 BeyondCorp 取消了 VPN，全球 10 万+ 员工通过零信任代理访问内部系统。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🔐 零信任架构</div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>zero-trust.yaml</span>
          </div>
          <div className="bt-code">{CODE}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🏗️ 零信任五大支柱</div>
        <div className="bt-grid-3">
          {[
            { name: '身份（Identity）', items: ['多因素认证 MFA', 'SSO 单点登录', '条件访问策略'], icon: '👤', color: '#3b82f6' },
            { name: '设备（Device）', items: ['设备合规检查', 'MDM 托管状态', 'OS 补丁级别'], icon: '💻', color: '#6366f1' },
            { name: '网络（Network）', items: ['微分段隔离', 'mTLS 加密通信', 'DNS 过滤'], icon: '🌐', color: '#06b6d4' },
            { name: '应用（Application）', items: ['应用代理（无 VPN）', '最小权限 API', '审计日志'], icon: '📱', color: '#22c55e' },
            { name: '数据（Data）', items: ['数据分级分类', '加密（静态+传输）', 'DLP 防泄漏'], icon: '🗄️', color: '#fbbf24' },
            { name: '可见性（Visibility）', items: ['SIEM 集中日志', '行为分析 UEBA', 'Risk Score'], icon: '👁️', color: '#f97316' },
          ].map((p, i) => (
            <div key={i} className="bt-card" style={{ borderTop: `3px solid ${p.color}`, padding: '0.9rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 700, color: p.color, fontSize: '0.85rem', marginBottom: '0.4rem' }}>{p.name}</div>
              {p.items.map((item, j) => (
                <div key={j} style={{ fontSize: '0.8rem', color: 'var(--bt-muted)', marginBottom: '0.2rem' }}>→ {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
