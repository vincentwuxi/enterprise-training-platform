import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TerminalBlock = ({ title = 'bash', lines }) => (
  <div className="terminal-block">
    <div className="terminal-topbar">
      <span className="terminal-dot red" /><span className="terminal-dot amber" /><span className="terminal-dot green" />
      <span className="terminal-title">{title}</span>
    </div>
    <div className="terminal-body">
      {lines.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l }} />)}
    </div>
  </div>
);

// Interactive terminal simulator
const COMMANDS = {
  'help': {
    output: [
      '<span class="t-success">Available commands:</span>',
      '  <span class="t-flag">ls</span>         list directory contents',
      '  <span class="t-flag">ls -la</span>    list with details',
      '  <span class="t-flag">pwd</span>        print working directory',
      '  <span class="t-flag">echo hello</span> print text',
      '  <span class="t-flag">whoami</span>     current user',
      '  <span class="t-flag">date</span>       current date',
      '  <span class="t-flag">uname -a</span>  system info',
      '  <span class="t-flag">ps</span>         running processes',
      '  <span class="t-flag">clear</span>      clear screen',
    ]
  },
    'ls': { output: ['<span class="t-path">Desktop/</span>  <span class="t-path">Documents/</span>  <span class="t-path">Downloads/</span>  <span class="t-flag">.bashrc</span>  <span class="t-flag">.ssh/</span>  <span class="t-path">projects/</span>'] },
    'ls -la': { output: [
      '<span class="t-output">total 48</span>',
      '<span class="t-output">drwxr-xr-x  8 user user 4096 Apr  4 19:00 .</span>',
      '<span class="t-output">drwxr-xr-x 20 root root 4096 Apr  2 10:11 ..</span>',
      '<span class="t-output">-rw-------  1 user user 3421 Apr  4 18:30 .bash_history</span>',
      '<span class="t-flag">-rw-r--r--  1 user user  220 Apr  1 00:00 .bash_logout</span>',
      '<span class="t-flag">-rw-r--r--  1 user user 3526 Apr  1 00:00 .bashrc</span>',
      '<span class="t-path">drwx------  2 user user 4096 Apr  3 14:20 .ssh</span>',
      '<span class="t-path">drwxr-xr-x  5 user user 4096 Apr  4 09:15 projects</span>',
    ]},
    'pwd': { output: ['<span class="t-output">/home/user</span>'] },
    'whoami': { output: ['<span class="t-output">user</span>'] },
    'date': { output: ['<span class="t-output">DATE_PLACEHOLDER</span>'] },
    'uname -a': { output: ['<span class="t-output">Linux nexus-lab 6.5.0-25-generic #25-Ubuntu SMP PREEMPT_DYNAMIC Wed Feb  7 13:12:44 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux</span>'] },
    'ps': { output: [
      '<span class="t-output">  PID TTY          TIME CMD</span>',
      '<span class="t-output"> 1842 pts/0    00:00:00 bash</span>',
      '<span class="t-output"> 1901 pts/0    00:00:00 ps</span>',
    ]},
  'echo hello': { output: ['<span class="t-output">hello</span>'] },
  'clear': { output: [], clear: true },
};

function TerminalSim() {
  const [lines, setLines] = useState([
    '<span class="t-success">NexusLearn Linux Simulator v1.0</span>',
    '<span class="t-comment">Type a command and press Enter. Try: help</span>',
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);

  const run = (cmd) => {
    if (!cmd.trim()) return;
    const result = COMMANDS[cmd.trim()];
    const promptLine = `<span class="t-prompt">user@nexus-lab:~$</span> <span class="t-cmd">${cmd}</span>`;
    if (result && result.clear) {
      setLines(['<span class="t-success">Screen cleared.</span>']);
    } else if (cmd.trim() === 'date') {
      setLines(l => [...l, promptLine, `<span class="t-output">${new Date().toString()}</span>`]);
    } else if (result) {
      setLines(l => [...l, promptLine, ...result.output]);
    } else {
      setLines(l => [...l, promptLine, `<span class="t-error">bash: ${cmd.trim()}: command not found</span>`]);
    }
    setHistory(h => [cmd.trim(), ...h].slice(0, 50));
    setHIdx(-1);
    setInput('');
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { run(input); return; }
    if (e.key === 'ArrowUp' && history.length) {
      const ni = Math.min(hIdx + 1, history.length - 1);
      setHIdx(ni); setInput(history[ni] || '');
    }
    if (e.key === 'ArrowDown') {
      const ni = Math.max(hIdx - 1, -1);
      setHIdx(ni); setInput(ni === -1 ? '' : (history[ni] || ''));
    }
  };

  return (
    <div className="terminal-block" style={{ marginBottom: '1rem' }}>
      <div className="terminal-topbar">
        <span className="terminal-dot red" />
        <span className="terminal-dot amber" />
        <span className="terminal-dot green" />
        <span className="terminal-title">user@nexus-lab:~$ — Interactive Shell Simulator</span>
      </div>
      <div className="terminal-body" style={{ minHeight: '180px', maxHeight: '300px', overflowY: 'auto' }}>
        {lines.map((l, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', paddingTop: '0.25rem' }}>
          <span className="t-prompt" style={{ flexShrink: 0 }}>user@nexus-lab:~$</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#e0ffe0', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.82rem', flex: 1, minWidth: 0
            }}
            placeholder="type a command..."
          />
          <span className="t-cursor" />
        </div>
      </div>
    </div>
  );
}

const BASH_FEATURES = [
  {
    cat: '管道与重定向', icon: '🔗', cmds: [
      { cmd: 'cmd1 | cmd2', desc: '管道：cmd1 的输出作为 cmd2 的输入' },
      { cmd: 'cmd > file', desc: '重定向标准输出到文件（覆盖）' },
      { cmd: 'cmd >> file', desc: '重定向标准输出到文件（追加）' },
      { cmd: 'cmd 2>&1', desc: '将标准错误合并到标准输出' },
      { cmd: 'cmd < file', desc: '从文件读取标准输入' },
      { cmd: 'cmd1 && cmd2', desc: 'cmd1 成功才执行 cmd2（AND）' },
      { cmd: 'cmd1 || cmd2', desc: 'cmd1 失败才执行 cmd2（OR）' },
    ]
  },
  {
    cat: '变量与字符串', icon: '📝', cmds: [
      { cmd: 'VAR=value', desc: '赋值（等号两侧无空格！）' },
      { cmd: 'echo $VAR', desc: '读取变量' },
      { cmd: 'echo "${VAR}"', desc: '推荐：用双引号包裹防止空格拆分' },
      { cmd: 'export VAR', desc: '导出变量到子进程' },
      { cmd: '${#VAR}', desc: '变量字符串长度' },
      { cmd: '$(cmd)', desc: '命令替换：将命令输出赋值给变量' },
      { cmd: '$((expr))', desc: '算术计算：echo $((2**10)) = 1024' },
    ]
  },
  {
    cat: '条件与循环', icon: '🔄', cmds: [
      { cmd: 'if [ cond ]; then ... fi', desc: '基本条件判断' },
      { cmd: '[[ cond ]]', desc: '推荐：更安全的条件 (bash 专有)' },
      { cmd: 'for i in {1..10}; do', desc: '数字循环' },
      { cmd: 'while read line; do', desc: '逐行读取文件' },
      { cmd: 'case $var in ...', desc: '多值匹配（类似 switch）' },
      { cmd: '[ -f file ]', desc: '测试文件存在且是普通文件' },
      { cmd: '[ -z "$str" ]', desc: '测试字符串为空' },
    ]
  },
  {
    cat: '文本三剑客', icon: '⚔️', cmds: [
      { cmd: 'grep -r "pattern" .', desc: '递归搜索目录下匹配文本' },
      { cmd: "sed 's/old/new/g' file", desc: '流编辑器：全局替换文本' },
      { cmd: "awk '{print $1,$3}' file", desc: '打印第1、3列' },
      { cmd: "awk -F: '{print $1}' /etc/passwd", desc: '以冒号为分隔符取第1列（用户名）' },
      { cmd: "grep -v 'pattern'", desc: '反向匹配：过滤掉匹配行' },
      { cmd: "sort | uniq -c | sort -rn", desc: '频率统计三连（排序+去重计数+降序）' },
      { cmd: "xargs -I{} cmd {}", desc: '将标准输入转换为命令参数' },
    ]
  },
];

const SCRIPT_TEMPLATE = `#!/usr/bin/env bash
# 生产级 Bash 脚本模板
set -euo pipefail  # 遇错退出、变量未定义报错、管道错误传播
IFS=$'\\n\\t'       # 更安全的字段分隔符

# --- 常量 ---
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/var/log/my_script.log"
readonly TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# --- 日志函数 ---
log()   { echo "[\${TIMESTAMP}] [INFO]  \$*" | tee -a "\${LOG_FILE}"; }
warn()  { echo "[\${TIMESTAMP}] [WARN]  \$*" | tee -a "\${LOG_FILE}" >&2; }
error() { echo "[\${TIMESTAMP}] [ERROR] \$*" | tee -a "\${LOG_FILE}" >&2; exit 1; }

# --- 清理陷阱 ---
cleanup() {
  log "Cleaning up..."
  # 在这里释放临时文件、锁等资源
}
trap cleanup EXIT

# --- 参数验证 ---
[[ \$# -lt 1 ]] && error "Usage: \$0 <target>"
TARGET="\$1"

# --- 主逻辑 ---
main() {
  log "Starting script for target: \${TARGET}"
  
  # 检查依赖
  command -v curl &>/dev/null || error "curl not found, please install it"
  
  # 你的逻辑
  log "Done."
}

main "\$@"`;

export default function LessonShell() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [showScript, setShowScript] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_02 — Shell 精通</div>
        <h1>命令行是你的超级武器</h1>
        <p className="lesson-intro">
          Shell 不只是敲命令的地方，它是<strong style={{ color: '#00ff41' }}>可编程的操作系统接口</strong>。掌握 Bash，你就拥有了组合任意工具、自动化一切重复操作、远程管理数千台服务器的能力。
        </p>
      </header>

      {/* Interactive Terminal */}
      <section className="lesson-section">
        <h3>💻 互动终端模拟器（直接输入命令体验）</h3>
        <p style={{ color: '#7a9c7a', marginBottom: '1rem', fontSize: '0.9rem' }}>输入 <code>help</code> 查看可用命令，支持方向键查看历史</p>
        <TerminalSim />
      </section>

      {/* Core Features */}
      <section className="lesson-section">
        <h3>🛠️ Bash 核心技能四大类（点击切换）</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {BASH_FEATURES.map((f, i) => (
            <button key={i} onClick={() => setActiveFeature(i)}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem', cursor: 'pointer',
                background: activeFeature === i ? 'rgba(0,255,65,0.15)' : 'rgba(0,255,65,0.05)',
                border: `1px solid ${activeFeature === i ? 'rgba(0,255,65,0.5)' : 'rgba(0,255,65,0.15)'}`,
                color: activeFeature === i ? '#00ff41' : '#4a6a4a' }}>
              {f.icon} {f.cat}
            </button>
          ))}
        </div>
        <div className="glass-panel fade-in">
          <h4 style={{ marginBottom: '1rem' }}>{BASH_FEATURES[activeFeature].icon} {BASH_FEATURES[activeFeature].cat}</h4>
          <div className="space-y-2">
            {BASH_FEATURES[activeFeature].cmds.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(0,255,65,0.06)', flexWrap: 'wrap' }}>
                <code style={{ minWidth: '220px', fontSize: '0.8rem', color: '#00ff41' }}>{c.cmd}</code>
                <span style={{ color: '#7a9c7a', fontSize: '0.85rem' }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipe power */}
      <section className="lesson-section">
        <h3>⚡ 管道的威力：用组合解决一切</h3>
        <TerminalBlock title="管道实战 — 生产级单行命令" lines={[
          '<span class="t-comment"># 找出占用端口最多的进程 Top 5</span>',
          '<span class="t-prompt">$</span> ss <span class="t-flag">-tunp</span> | awk <span class="t-string">\'NR>1 {print $7}\'</span> | sort | uniq -c | sort -rn | head -5',
          '',
          '<span class="t-comment"># 实时监控日志中的错误（含过滤）</span>',
          '<span class="t-prompt">$</span> tail <span class="t-flag">-f</span> /var/log/nginx/error.log | grep <span class="t-flag">--line-buffered</span> <span class="t-string">"ERROR"</span> | sed <span class="t-string">\'s/2024-[0-9-]*//g\'</span>',
          '',
          '<span class="t-comment"># 批量重命名文件：把所有 .log 改为 .bak</span>',
          '<span class="t-prompt">$</span> find . <span class="t-flag">-name</span> <span class="t-string">"*.log"</span> | xargs <span class="t-flag">-I{}</span> mv {} {}.bak',
          '',
          '<span class="t-comment"># 统计 nginx 日志最多访问的 IP Top 10</span>',
          '<span class="t-prompt">$</span> awk <span class="t-string">\'{print $1}\'</span> /var/log/nginx/access.log | sort | uniq -c | sort <span class="t-flag">-rn</span> | head -10',
          '',
          '<span class="t-comment"># 找到最大的 10 个文件</span>',
          '<span class="t-prompt">$</span> find / <span class="t-flag">-type f -printf</span> <span class="t-string">"%s %p\\n"</span> 2>/dev/null | sort <span class="t-flag">-rn</span> | head -10 | numfmt <span class="t-flag">--to=iec --field=1</span>',
        ]} />
      </section>

      {/* Production Script */}
      <section className="lesson-section">
        <h3>📜 生产级 Bash 脚本：最佳实践模板</h3>
        <div className="info-box warn" style={{ marginBottom: '1rem' }}>
          ⚠️ <strong>最重要的三行：</strong><code>set -euo pipefail</code>——这三个选项能防止脚本在错误时"带病运行"，避免 90% 的生产事故。
        </div>
        <button onClick={() => setShowScript(!showScript)}
          style={{ background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)', color: '#00cc33', padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem', marginBottom: '1rem' }}>
          {showScript ? '▲ 收起模板' : '▼ 展开生产级脚本模板'}
        </button>
        {showScript && (
          <div className="fade-in terminal-block">
            <div className="terminal-topbar">
              <span className="terminal-dot red" /><span className="terminal-dot amber" /><span className="terminal-dot green" />
              <span className="terminal-title">production_script.sh</span>
            </div>
            <pre className="terminal-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.65', color: '#7fff7f', fontSize: '0.78rem' }}>{SCRIPT_TEMPLATE}</pre>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { rule: 'set -e', detail: '遇到非零返回立即退出' },
            { rule: 'set -u', detail: '使用未定义变量时报错' },
            { rule: 'set -o pipefail', detail: '管道中任一命令失败则整体失败' },
            { rule: '引号保护变量', detail: '"$VAR" 防止空格拆分和通配符展开' },
            { rule: 'trap EXIT', detail: '无论成功失败都执行清理函数' },
            { rule: 'readonly 常量', detail: '防止常量被意外修改' },
          ].map(r => (
            <div key={r.rule} className="linux-card">
              <code style={{ display: 'block', marginBottom: '0.3rem', color: '#00ff41', fontSize: '0.82rem' }}>{r.rule}</code>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem' }}>{r.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/filesystem')}>
          $ cd next_chapter  # 文件系统 →
        </button>
      </section>
    </div>
  );
}
