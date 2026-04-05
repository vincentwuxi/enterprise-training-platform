import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CRYPTO_SECTIONS = [
  {
    name: '哈希函数', icon: '🔢', color: '#38bdf8',
    desc: '单向函数：任意输入 → 固定长度摘要，不可逆。用于密码存储/文件校验/数字签名',
    code: `import hashlib
import bcrypt

# ❌ 不安全：MD5（已被彩虹表攻破）
md5 = hashlib.md5("password123".encode()).hexdigest()
# → 482c811da5d5b4bc6d497ffa98491e38（查 crackstation.net 秒出）

# ❌ 不安全：SHA-1（已被碰撞攻击）
sha1 = hashlib.sha1("password123".encode()).hexdigest()

# ✅ 安全：SHA-256（用于文件完整性校验）
sha256 = hashlib.sha256("password123".encode()).hexdigest()
# → ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

# ✅ 最安全：bcrypt（密码存储专用）
# 自动加盐，计算成本可调（应对硬件加速暴力破解）
salt = bcrypt.gensalt(rounds=12)  # 12 轮 = 约200ms
hashed = bcrypt.hashpw("password123".encode(), salt)
# → $2b$12$B5mYEXZZu0vPe0oO4BPeCe... (每次不同！)

# 验证密码
bcrypt.checkpw("password123".encode(), hashed)  # True

# 攻击：彩虹表攻击 MD5/SHA1（预计算哈希表）
# 防御：bcrypt/scrypt/argon2（带盐+慢哈希）`,
  },
  {
    name: '对称加密', icon: '🔑', color: '#22c55e',
    desc: '加密和解密使用同一密钥。速度快，适合大数据加密（文件/数据库）',
    code: `from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# ✅ AES-256-GCM（当前最佳对称加密方案）
# G = Galois/Counter Mode：提供认证加密（防篡改）

# 生成256位随机密钥（存 AWS KMS，不存代码！）
key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)

# 每次加密生成唯一 nonce（number used once）
nonce = os.urandom(12)   # 96位 nonce
ciphertext = aesgcm.encrypt(nonce, b"敏感用户数据", b"aad附加数据")

# 解密（nonce + ciphertext 一起存储）
plaintext = aesgcm.decrypt(nonce, ciphertext, b"aad附加数据")

# 简化方案：Fernet（基于AES-128-CBC，适合一般用途）
key = Fernet.generate_key()
f = Fernet(key)
token = f.encrypt(b"secret message")
message = f.decrypt(token)  # 自动验证完整性

# ❌ 危险算法：DES（56位密钥，2小时暴力破解）、RC4（流加密有偏置）
# ❌ 危险模式：ECB（相同明文→相同密文，泄露模式信息）`,
  },
  {
    name: '非对称加密', icon: '🔐', color: '#a78bfa',
    desc: '公钥加密，私钥解密。解决密钥分发问题。RSA/ECDSA/Ed25519 广泛应用于 HTTPS/SSH/JWT',
    code: `from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

# ✅ RSA-4096（非对称加密，但慢，适合加密短数据或密钥）
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=4096,       # 最少2048，推荐4096
)
public_key = private_key.public_key()

# 公钥加密（任何人都可以发给我加密信息）
ciphertext = public_key.encrypt(
    b"Only I can read this",
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# 私钥解密（只有持有私钥的人可解密）
plaintext = private_key.decrypt(ciphertext, padding.OAEP(...))

# ✅ 数字签名（私钥签名，公钥验证）
# 用于 JWT/代码签名/SSL证书
signature = private_key.sign(
    b"contract document content",
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256()
)
# 任何人用公钥可验证：消息确实由私钥持有者签署，且未被篡改

# ✅ ECDSA（比 RSA 更短的密钥，同等安全性）：
#   RSA-3072 ≈ ECDSA-256 （安全等级相当，性能ECDSA更优）

# ❌ RSA-512/1024 已被破解（NIST 要求最低 RSA-2048）`,
  },
  {
    name: 'TLS 握手', icon: '🤝', color: '#f97316',
    desc: 'TLS 1.3 的4步握手（比 TLS 1.2 少1个来回），结合了非对称密钥交换和对称加密',
    code: `# TLS 1.3 握手流程（简化版）
# =============================================
# 客户端                          服务器
# ─────────                        ─────────
# ClientHello          →          # 支持的算法列表
#   supported_versions: [TLS1.3]  # + 客户端 DH 公钥
#   key_share: [ecdh_pub_key]     #
#                                 #
#                    ←           ServerHello + 证书
#                                 # 服务器选定算法
#                                 # + 服务器 DH 公钥
#                                 # + 服务器证书（含CA签名的公钥）
#                                 # + Finished（已用对称密钥加密）
# ─────────────────────────────────────────────
# 双方各自计算：
# 预主密钥 = ECDH(客户端私钥, 服务器DH公钥)
# 会话密钥 = HKDF(预主密钥, client_random, server_random)
# → 后续所有通信用此对称密钥加密（AES-256-GCM）
# ─────────────────────────────────────────────

# openssl 工具：检查 TLS 配置
openssl s_client -connect example.com:443 -tls1_3 -brief
# 输出：Protocol: TLSv1.3   Cipher: TLS_AES_256_GCM_SHA384

# 检查证书过期时间
echo | openssl s_client -connect example.com:443 2>/dev/null | \\
  openssl x509 -noout -dates
# → notAfter=Dec 31 00:00:00 2025 GMT

# 测试弱密码套件（生产应禁用）
nmap --script ssl-enum-ciphers -p 443 example.com`,
  },
  {
    name: 'JWT 安全', icon: '🎫', color: '#fbbf24',
    desc: 'JSON Web Token：Base64编码的头部.载荷.签名。常见漏洞：弱密钥/alg=none/信息泄露',
    code: `# JWT 结构：header.payload.signature（每部分 Base64URL 编码）
import jwt, secrets

# ❌ 常见漏洞1：弱密钥（可被暴力破解）
bad_token = jwt.encode({"user": "admin"}, "secret", algorithm="HS256")
# hashcat -a 0 -m 16500 bad_token.txt wordlist.txt → 秒破

# ❌ 常见漏洞2：alg=none 攻击（部分旧库接受空签名）
# 攻击者修改 header: {"alg": "none"} + 去掉签名部分
# 某些库不验证签名 → 直接信任 Payload！

# ❌ 常见漏洞3：RS256 降级为 HS256 攻击
# 如果服务器用公钥验证RS256，攻击者改alg为HS256
# 用公钥（已知！）作为HMAC密钥重新签名 → 绕过验证

# ✅ 正确的 JWT 实踐
SECRET_KEY = secrets.token_hex(32)  # 256位随机密钥

# 签发
token = jwt.encode(
    payload={
        "sub": str(user.id),  # 用 ID，不放密码等敏感信息
        "exp": datetime.utcnow() + timedelta(minutes=15),  # 短期有效
        "iat": datetime.utcnow(),   # 签发时间
        "jti": str(uuid.uuid4()),   # 唯一ID（防重放）
    },
    key=SECRET_KEY,
    algorithm="HS256"   # 或用 RS256/ES256（更安全）
)

# 验证（必须指定算法，防止 alg=none 攻击）
decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])`,
  },
];

export default function LessonCrypto() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  const s = CRYPTO_SECTIONS[activeSection];

  return (
    <div className="lesson-sec">
      <div className="sec-badge blue">🔐 module_07 — 密码学</div>

      <div className="sec-hero">
        <h1>密码学应用：哈希 / 对称 / 非对称 / 证书链</h1>
        <p>密码学是安全的基石。你不需要自己实现算法（<strong>Never Roll Your Own Crypto！</strong>），但必须理解每种算法的适用场景、已知弱点和正确的使用方式。</p>
      </div>

      {/* 五种密码学主题 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🔢 密码学核心主题（切换查看代码）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {CRYPTO_SECTIONS.map((sec, i) => (
            <button key={i} onClick={() => setActiveSection(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeSection === i ? sec.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeSection === i ? `${sec.color}10` : 'rgba(255,255,255,0.02)',
                color: activeSection === i ? sec.color : '#5a1a1a', fontSize: '0.82rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{sec.icon}</div>
              {sec.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '0.75rem', background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: '8px', fontSize: '0.82rem', color: '#5a1a1a', marginBottom: '0.75rem' }}>
          {s.desc}
        </div>

        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: s.color }} />
            <span style={{ marginLeft: '0.5rem', color: s.color }}>{s.icon} {s.name}</span>
          </div>
          <div className="sec-terminal-body" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{s.code}</div>
        </div>
      </div>

      {/* 算法选型速查 */}
      <div className="sec-section">
        <h2 className="sec-section-title">📋 密码算法选型速查表</h2>
        <div className="sec-card">
          <table className="sec-table">
            <thead><tr><th>使用场景</th><th>✅ 推荐</th><th>❌ 不要用</th></tr></thead>
            <tbody>
              {[
                ['密码存储', 'bcrypt / scrypt / Argon2id', 'MD5 / SHA1 / SHA256（无盐）'],
                ['数据签名', 'Ed25519 / ECDSA-P256 / RSA-4096', 'RSA-1024 / DSA'],
                ['数据加密（传输）', 'AES-256-GCM / ChaCha20-Poly1305', 'DES / RC4 / AES-ECB'],
                ['密钥交换', 'ECDH / X25519', 'RSA 直接密钥加密（非 PFS）'],
                ['TLS 版本', 'TLS 1.3（首选）/ TLS 1.2', 'SSL 3.0 / TLS 1.0/1.1'],
                ['文件完整性', 'SHA-256 / SHA-3-256', 'MD5 / SHA1（可碰撞）'],
                ['JWT 签名', 'RS256 (非对称) / HS256+强密钥', 'none算法 / 弱HS256密钥'],
                ['随机数', 'os.urandom() / secrets 模块', 'random 模块（伪随机）'],
              ].map(([s, r, b]) => (
                <tr key={s}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{s}</td>
                  <td style={{ fontSize: '0.78rem', color: '#22c55e', fontFamily: 'JetBrains Mono' }}>{r}</td>
                  <td style={{ fontSize: '0.78rem', color: '#f87171', fontFamily: 'JetBrains Mono' }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/privesc')}>← 上一模块</button>
        <button className="sec-btn defense" onClick={() => navigate('/course/security-pentest/lesson/defense')}>下一模块：防御加固 →</button>
      </div>
    </div>
  );
}
