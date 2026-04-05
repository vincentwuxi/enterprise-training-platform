import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const REDIS_TYPES = [
  {
    name: 'String',
    icon: '📝',
    color: '#DC382D',
    desc: '最基础类型，可存文本、数字、二进制，最大 512MB。支持原子计数器。',
    usecases: ['缓存 JSON 对象', '计数器（PV/UV）', '分布式 Session', '限流计数'],
    commands: [
      { cmd: 'SET user:1 \'{"name":"Alice","age":25}\'', ret: 'OK', note: '存储 JSON 字符串' },
      { cmd: 'GET user:1', ret: '"{\\"name\\":\\"Alice\\",\\"age\\":25}"', note: '获取值' },
      { cmd: 'SETEX session:token123 3600 "user_id:42"', ret: 'OK', note: '设置并附带过期时间（秒）' },
      { cmd: 'INCR page:views:home', ret: '(integer) 1001', note: '原子递增，防并发计数错误' },
      { cmd: 'SETNX lock:order:999 1', ret: '(integer) 1', note: 'NX = Not eXists，分布式锁核心' },
    ],
  },
  {
    name: 'Hash',
    icon: '📋',
    color: '#F29111',
    desc: '类似 Python dict，存储字段-值对，适合存储对象，节省内存（比 JSON 更高效）。',
    usecases: ['用户信息对象', '商品详情', '购物车', '配置项'],
    commands: [
      { cmd: 'HSET user:42 name Alice age 25 city Beijing', ret: '(integer) 3', note: '批量设置多个字段' },
      { cmd: 'HGET user:42 name', ret: '"Alice"', note: '获取单个字段' },
      { cmd: 'HMGET user:42 name age', ret: '1) "Alice"\n2) "25"', note: '批量获取多个字段' },
      { cmd: 'HGETALL user:42', ret: '1) "name"\n2) "Alice"\n3) "age"\n4) "25"', note: '获取所有字段和值' },
      { cmd: 'HINCRBY cart:user1 item:sku123 2', ret: '(integer) 3', note: '购物车商品数量增加（原子）' },
    ],
  },
  {
    name: 'List',
    icon: '📜',
    color: '#86efac',
    desc: '双端链表，支持从两端快速 push/pop，可实现队列（FIFO）或栈（LIFO）。',
    usecases: ['消息队列', '操作日志', '最近浏览记录', '任务队列'],
    commands: [
      { cmd: 'LPUSH recent:user1 prod:101 prod:202', ret: '(integer) 2', note: '从左侧推入（最新的在左）' },
      { cmd: 'LRANGE recent:user1 0 9', ret: '1) "prod:202"\n2) "prod:101"', note: '获取最近10条浏览记录' },
      { cmd: 'RPUSH queue:emails "send_confirm_email:order#123"', ret: '(integer) 1', note: '从右侧入队' },
      { cmd: 'BLPOP queue:emails 30', ret: '1) "queue:emails"\n2) "send_confirm_email:order#123"', note: '阻塞式出队，30秒超时（消费者）' },
      { cmd: 'LTRIM recent:user1 0 99', ret: 'OK', note: '只保留最近100条，超出自动删除' },
    ],
  },
  {
    name: 'Set',
    icon: '🔵',
    color: '#93c5fd',
    desc: '无序集合，成员唯一，支持集合运算（交/并/差），O(1) 判断成员是否存在。',
    usecases: ['好友关系/共同好友', '标签系统', '去重（UV统计）', '抽奖黑名单'],
    commands: [
      { cmd: 'SADD user:1:following 2 3 4 5', ret: '(integer) 4', note: '添加 user1 关注的人' },
      { cmd: 'SADD user:2:following 1 3 6', ret: '(integer) 3', note: '添加 user2 关注的人' },
      { cmd: 'SINTER user:1:following user:2:following', ret: '1) "3"', note: '共同关注（取交集）' },
      { cmd: 'SISMEMBER user:1:following 4', ret: '(integer) 1', note: '1=已关注，O(1) 查询' },
      { cmd: 'SRANDMEMBER lucky:pool 3', ret: '1) "user:88"\n2) "user:42"\n3) "user:7"', note: '随机抽取3名中奖者' },
    ],
  },
  {
    name: 'ZSet',
    icon: '🏆',
    color: '#a78bfa',
    desc: '有序集合，每个成员关联一个 score（分数），自动排序，排行榜的完美选择。',
    usecases: ['排行榜', '带权重的任务队列', '延迟队列（score=时间戳）', 'TOP-K 统计'],
    commands: [
      { cmd: 'ZADD leaderboard 9800 "Alice" 8500 "Bob" 9200 "Carol"', ret: '(integer) 3', note: '添加玩家得分' },
      { cmd: 'ZREVRANGEBYSCORE leaderboard +inf -inf WITHSCORES LIMIT 0 3', ret: '1) "Alice"\n2) "9800"\n3) "Carol"\n4) "9200"\n5) "Bob"\n6) "8500"', note: 'Top3 排名（降序 + 分数）' },
      { cmd: 'ZINCRBY leaderboard 500 "Bob"', ret: '"9000"', note: 'Bob 得分增加500（自动重新排序）' },
      { cmd: 'ZRANK leaderboard "Alice"', ret: '(integer) 0', note: 'Alice 的排名（0=第1）' },
      { cmd: 'ZADD delay_queue 1712345678 "job:send_reminder"', ret: '(integer) 1', note: '延迟队列：score=执行时间戳' },
    ],
  },
];

export default function LessonRedis() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState(0);
  const [activeCmd, setActiveCmd] = useState(0);

  const t = REDIS_TYPES[activeType];

  return (
    <div className="lesson-db">
      <div className="db-badge redis">🔴 module_05 — Redis 核心</div>

      <div className="db-hero">
        <h1>Redis 核心：五大数据类型与使用场景</h1>
        <p>Redis 之所以快，是因为<strong>纯内存操作 + 单线程命令处理</strong>（避免锁竞争）+ I/O 多路复用。掌握五大数据类型，就能优雅解决 80% 的缓存设计问题。</p>
      </div>

      {/* Redis 为什么快 */}
      <div className="db-section">
        <h2 className="db-section-title">⚡ Redis 为什么能达到 100万 QPS？</h2>
        <div className="db-grid-4">
          {[
            { icon: '💾', title: '纯内存', desc: '所有数据在内存，读写无磁盘I/O，延迟 < 0.1ms' },
            { icon: '🧵', title: '单线程命令', desc: '命令执行单线程，无锁竞争，无上下文切换开销' },
            { icon: '🔌', title: 'I/O多路复用', desc: 'epoll/kqueue，单线程处理数千并发连接' },
            { icon: '📦', title: '高效数据结构', desc: 'ziplist/skiplist/sds等，内存紧凑，操作O(1)~O(logN)' },
          ].map(r => (
            <div key={r.title} className="db-card" style={{ textAlign: 'center', padding: '1.1rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{r.icon}</div>
              <div style={{ fontWeight: 700, color: '#DC382D', fontSize: '0.875rem', marginBottom: '0.3rem' }}>{r.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#4a3b28' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 五大类型交互演示 */}
      <div className="db-section">
        <h2 className="db-section-title">🎯 五大数据类型（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {REDIS_TYPES.map((type, i) => (
            <button key={type.name}
              className={`db-btn ${activeType === i ? 'redis' : ''}`}
              onClick={() => { setActiveType(i); setActiveCmd(0); }}
              style={{ border: `1px solid ${activeType === i ? type.color + '50' : 'rgba(255,255,255,0.08)'}`, color: activeType === i ? type.color : undefined, background: activeType === i ? `${type.color}12` : undefined, fontSize: '0.85rem' }}>
              {type.icon} {type.name}
            </button>
          ))}
        </div>

        <div className="db-interactive" style={{ borderColor: `${t.color}25` }}>
          <h3 style={{ color: t.color }}>
            {t.icon} {t.name} — {t.desc.slice(0, 35)}…
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#4a3b28' }}>典型场景：</span>
            {t.usecases.map(u => (
              <span key={u} className="db-tag redis" style={{ background: `${t.color}12`, color: t.color }}>{u}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {t.commands.map((c, i) => (
              <button key={i} className="db-btn"
                onClick={() => setActiveCmd(i)}
                style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem',
                  background: activeCmd === i ? `${t.color}15` : undefined,
                  borderColor: activeCmd === i ? `${t.color}50` : undefined,
                  color: activeCmd === i ? t.color : '#a08060' }}>
                {c.cmd.split(' ')[0]}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#4a3b28', marginBottom: '0.5rem' }}>
            💡 {t.commands[activeCmd].note}
          </div>

          <div className="db-redis-term">
            <span className="prompt">redis&gt; </span>
            <span className="cmd">{t.commands[activeCmd].cmd}</span>
            {'\n'}
            <span className="ret">{t.commands[activeCmd].ret}</span>
          </div>
        </div>
      </div>

      {/* Key 命名规范 */}
      <div className="db-section">
        <h2 className="db-section-title">📐 Redis Key 命名规范（生产必读）</h2>
        <div className="db-card">
          <table className="db-table">
            <thead><tr><th>规范</th><th>✅ 正确示例</th><th>❌ 错误示例</th></tr></thead>
            <tbody>
              {[
                ['业务:类型:ID', 'user:profile:42', 'u42 / user42 / User_42'],
                ['冒号分隔层级', 'order:status:pending', 'order_status_pending'],
                ['避免过长（>44字节走堆外内存）', 'session:tok:a1b2', 'session_token_for_user_authenticated_a1b2c3d4'],
                ['敏感信息不入 Key', 'payment:status:order123', 'payment:user:password:xxx'],
                ['设置 TTL，避免内存泄漏', 'EXPIRE cache:products 3600', '（永不过期的缓存会导致内存溢出）'],
              ].map(([r, good, bad]) => (
                <tr key={r}>
                  <td style={{ fontWeight: 600, color: '#a08060', fontSize: '0.82rem' }}>{r}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#34d399', fontSize: '0.78rem' }}>{good}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#f87171', fontSize: '0.78rem' }}>{bad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/index')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/redisadvanced')}>下一模块：Redis 进阶 →</button>
      </div>
    </div>
  );
}
