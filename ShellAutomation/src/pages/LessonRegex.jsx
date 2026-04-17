import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['BRE / ERE 基础', 'PCRE 高级', '零宽断言', '实战案例'];

export default function LessonRegex() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_03 — 正则表达式</div>
      <div className="fs-hero">
        <h1>正则表达式精讲：BRE / ERE / PCRE</h1>
        <p>
          正则表达式是文本处理的核心引擎——
          <strong>BRE</strong> 是 grep/sed 的默认语法，<strong>ERE</strong> 省去转义开销，
          <strong>PCRE</strong> 提供最强大的零宽断言和非贪婪匹配。
          理解正则的内部匹配机制（NFA 回溯）是编写高效模式的关键。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 正则表达式深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 BRE / ERE 基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> regex_basics.txt</div>
                <pre className="fs-code">{`═══ 正则引擎类型 ═══

  BRE (Basic Regular Expression):
    → grep (默认), sed (默认)
    → 元字符需转义: \\( \\) \\{ \\} \\| \\+
    
  ERE (Extended Regular Expression):
    → grep -E, sed -E, awk
    → 元字符不需转义: ( ) { } | +
    
  PCRE (Perl Compatible Regular Expression):
    → grep -P, Python, JavaScript, Java
    → 最强大: 零宽断言, 非贪婪, 命名捕获

═══ 元字符 (Meta Characters) ═══

  .       任意单个字符 (除换行)
  ^       行首
  $       行尾
  *       前一项重复 0 次或多次
  +       前一项重复 1 次或多次 (ERE)
  ?       前一项重复 0 次或 1 次 (ERE)
  {n}     恰好 n 次
  {n,m}   n 到 m 次
  {n,}    至少 n 次

  [abc]   字符类: a 或 b 或 c
  [^abc]  反字符类: 非 a/b/c
  [a-z]   范围: 小写字母
  [0-9]   范围: 数字

  (...)   分组 + 捕获
  |       或 (alternation)
  \\       转义

═══ POSIX 字符类 ═══

  [:alpha:]    字母           [[:alpha:]]
  [:digit:]    数字           [[:digit:]]
  [:alnum:]    字母+数字      [[:alnum:]]
  [:space:]    空白字符       [[:space:]]
  [:upper:]    大写字母       [[:upper:]]
  [:lower:]    小写字母       [[:lower:]]
  [:punct:]    标点符号       [[:punct:]]

═══ BRE vs ERE 对比 ═══

  功能         │ BRE (grep/sed)     │ ERE (grep -E)
  ─────────────┼────────────────────┼────────────────
  分组         │ \\( \\)             │ ( )
  量词 +       │ \\+                │ +
  量词 ?       │ \\?                │ ?
  或           │ \\|                │ |
  重复 {n,m}   │ \\{n,m\\}           │ {n,m}
  反向引用     │ \\1 \\2             │ \\1 \\2 (相同)

  # 示例: 匹配 IP 地址
  # BRE:
  grep '\\([0-9]\\{1,3\\}\\.\\)\\{3\\}[0-9]\\{1,3\\}' file
  # ERE:
  grep -E '([0-9]{1,3}\\.){3}[0-9]{1,3}' file
  # ERE 更简洁! 推荐使用 grep -E

═══ 反向引用 ═══

  # 匹配重复单词
  grep -E '\\b(\\w+)\\s+\\1\\b' text
  # "the the" → 匹配!

  # sed 中使用反向引用
  echo "John Smith" | sed -E 's/(\\w+) (\\w+)/\\2, \\1/'
  # → Smith, John`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ PCRE 高级特性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pcre_advanced.txt</div>
                <pre className="fs-code">{`═══ PCRE 简写类 ═══

  \\d      数字 [0-9]
  \\D      非数字
  \\w      单词字符 [a-zA-Z0-9_]
  \\W      非单词字符
  \\s      空白 [\\t\\n\\r\\f ]
  \\S      非空白
  \\b      单词边界
  \\B      非单词边界

═══ 贪婪 vs 非贪婪 ═══

  # 默认: 贪婪 (尽可能多匹配)
  echo '<b>bold</b> and <i>italic</i>' | grep -oP '<.*>'
  # → <b>bold</b> and <i>italic</i>  (整个!)

  # 非贪婪: 加 ? 后缀
  echo '<b>bold</b> and <i>italic</i>' | grep -oP '<.*?>'
  # → <b>
  #   </b>
  #   <i>
  #   </i>

  # 非贪婪量词:
  *?     → 0+ (最少匹配)
  +?     → 1+ (最少匹配)
  ??     → 0-1 (最少匹配)
  {n,m}? → n-m (最少匹配)

═══ 命名捕获组 ═══

  # (?P<name>pattern)  — Python 风格
  # (?<name>pattern)   — PCRE7+ / Java / .NET
  
  echo "2024-01-15 10:30:45" | \\
      grep -oP '(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})'

  # Python 中使用:
  # import re
  # m = re.match(r'(?P<year>\\d{4})-(?P<month>\\d{2})', date_str)
  # m.group('year')  → '2024'

═══ 非捕获组 ═══

  # (?:...) — 分组但不捕获 (性能优化)
  grep -P '(?:https?|ftp)://\\S+' file
  # 只需要分组功能, 不需要捕获 → 用 (?:)

═══ 原子组 ═══

  # (?>...) — 禁止回溯 (防止灾难性回溯!)
  grep -P '(?>\\d+)\\.' file
  # 匹配数字后面跟点, 一旦数字匹配完不回溯

═══ 条件模式 ═══

  # (?(condition)yes|no)
  # 如果捕获组 1 匹配了, 则匹配 yes, 否则匹配 no
  grep -P '(\\()\\d{3}(?(1)\\)|-)\\d{3}-\\d{4}' phones.txt
  # 匹配 (123)456-7890 或 123-456-7890
  # 但不匹配 (123-456-7890 或 123)456-7890

═══ NFA 回溯与性能 ═══

  # 灾难性回溯 (Catastrophic Backtracking)
  # 避免: (a+)+ 或 (a|a)+ 这种嵌套量词!
  
  # 坏的: (a+)+b 对 "aaaaaaaac" → 指数级回溯!
  # 好的: a+b            → 线性匹配

  # 优化原则:
  # 1. 避免嵌套量词
  # 2. 用原子组 (?>...) 防止不必要回溯
  # 3. 用非贪婪 .*? 替代贪婪 .*
  # 4. 锚点 (^, $, \\b) 减少匹配起点`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>👁️ 零宽断言 (Lookaround)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> lookaround.txt</div>
                <pre className="fs-code">{`═══ 四种零宽断言 ═══

  零宽断言: 匹配位置, 不消耗字符!

  (?=...)   正向前瞻 (Positive Lookahead)
            → 后面是 ... 的位置
  
  (?!...)   负向前瞻 (Negative Lookahead)
            → 后面不是 ... 的位置
  
  (?<=...)  正向后顾 (Positive Lookbehind)
            → 前面是 ... 的位置
  
  (?<!...)  负向后顾 (Negative Lookbehind)
            → 前面不是 ... 的位置

═══ 示例详解 ═══

  # ─── 正向前瞻 (?=...) ───
  # 匹配后面跟 "px" 的数字
  echo "12px 3em 45px" | grep -oP '\\d+(?=px)'
  # → 12  45

  # ─── 负向前瞻 (?!...) ───
  # 匹配后面不是 "px" 的数字
  echo "12px 3em 45px" | grep -oP '\\d+(?!px|\\d)'
  # → 3

  # ─── 正向后顾 (?<=...) ───
  # 提取 $ 后面的金额
  echo "Total: $99.50 USD" | grep -oP '(?<=\\$)[\\d.]+'
  # → 99.50

  # ─── 负向后顾 (?<!...) ───
  # 匹配前面不是 $ 的数字
  echo "$100 200 $300" | grep -oP '(?<!\\$)\\b\\d+'
  # → 200

═══ 实战: 零宽断言组合 ═══

  # 密码强度验证 (至少8位, 含大小写字母和数字)
  grep -P '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'
  # (?=.*[a-z])  → 某处有小写
  # (?=.*[A-Z])  → 某处有大写
  # (?=.*\\d)     → 某处有数字
  # .{8,}        → 总长 ≥ 8

  # 提取日志中某字段的值
  grep -oP '(?<=user_id=)\\w+' access.log
  # user_id=abc123 → abc123

  # 千分位分隔 (数字中每3位加逗号)
  echo "1234567890" | sed -E ':a;s/([0-9])([0-9]{3})(,|$)/\\1,\\2\\3/;ta'
  # → 1,234,567,890
  # 或 PCRE:
  echo "1234567890" | grep -oP '\\d+' | \\
      perl -pe 's/(?<=\\d)(?=(\\d{3})+$)/,/g'

  # 提取 JSON 值 (不用 jq 的紧急场景)
  grep -oP '(?<="name":\\s*")[^"]+' data.json

  # 匹配不包含某词的行
  grep -P '^(?!.*error).*$' log.txt

  # \\K — 重置匹配起点 (PCRE 独有, 比后顾更灵活!)
  echo "name: Alice" | grep -oP 'name:\\s*\\K\\S+'
  # → Alice  (\\K 之前的不包含在匹配结果中)

  # \\K 不限制定长 (后顾 (?<=..) 要求定长!)
  grep -oP 'var\\s+\\K\\w+' script.js    # ✅ \\K
  # grep -oP '(?<=var\\s+)\\w+' 会报错! (\\s+ 不定长)

═══ 正则调试技巧 ═══

  # 1. 在线工具: regex101.com (选 PCRE2 引擎)
  # 2. 分步构建: 先简单模式, 逐步添加约束
  # 3. 测试边界: 空字符串, 特殊字符, 极长输入
  # 4. 性能测试: time grep -P 'pattern' large_file`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 实战案例</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> regex_practice.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 正则表达式实战案例集 ═══

# ─── 1. IP 地址匹配 (严格版) ───
# 简单版: \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}  (会匹配 999.999...)
# 严格版:
IP_REGEX='\\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b'
grep -oP "$IP_REGEX" access.log

# ─── 2. 邮箱匹配 ───
EMAIL='[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
grep -oP "$EMAIL" contacts.txt

# ─── 3. URL 提取 ───
URL='https?://[^\\s<>"{}|\\\\^\\[\\]]+'
grep -oP "$URL" page.html

# ─── 4. 日志时间戳提取 ───
# ISO 8601: 2024-01-15T10:30:45.123Z
TIMESTAMP='\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:?\\d{2})?'
grep -oP "$TIMESTAMP" app.log

# ─── 5. 语义化版本号 (SemVer) ───
SEMVER='\\bv?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(-[\\da-zA-Z-]+(\\.[\\da-zA-Z-]+)*)?(\\+[\\da-zA-Z-]+(\\.[\\da-zA-Z-]+)*)?\\b'
grep -oP "$SEMVER" CHANGELOG.md

# ─── 6. Docker 镜像名 ───
DOCKER_IMG='[a-z0-9]+([._-][a-z0-9]+)*(:[a-zA-Z0-9._-]+)?(@sha256:[a-f0-9]{64})?'
grep -oP "$DOCKER_IMG" docker-compose.yml

# ═══ 实战: Nginx 日志分析完整流程 ═══
# Combined Log Format:
# 192.168.1.1 - - [15/Jan/2024:10:30:45 +0800] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0..."

# 提取所有 4xx 错误的 URL
awk '$9 ~ /^4/' access.log | grep -oP '"(GET|POST|PUT|DELETE) \\K[^"\\s]+'

# 找出访问量最大的 10 个 API
grep -oP '"(GET|POST|PUT|DELETE) \\K/api/[^"\\s?]+' access.log \\
    | sort | uniq -c | sort -rn | head -10

# 统计不同状态码的分布
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# ═══ 实战: 配置文件清理 ═══
# 删除注释和空行
sed -E '/^\\s*#/d; /^\\s*$/d' config.ini

# 提取 KEY=VALUE 格式
grep -oP '^[A-Z_]+=\\K.*' .env

# 验证 YAML 缩进 (找出不规范缩进)
grep -nP '^( {1,3}[^ ]| {5,7}[^ ])' config.yml

# ═══ 工具选择指南 ═══
#
# 场景              │ 工具          │ 正则类型
# ──────────────────┼───────────────┼──────────
# 快速搜索          │ grep -E       │ ERE
# 复杂提取          │ grep -P       │ PCRE
# 流式替换          │ sed -E        │ ERE
# 列式处理          │ awk           │ ERE
# 编程中使用        │ Python re     │ PCRE-like
# 性能敏感          │ ripgrep (rg)  │ Rust regex`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
