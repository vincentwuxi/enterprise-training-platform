import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

const tabs = ['🏗️ 初始化与配置', '📦 暂存区机制', '📝 提交与历史', '🔄 diff 与撤销', '🎮 Git 沙箱'];

/* ── Mini Git Simulator ── */
const INITIAL_STATE = { files: {}, staged: {}, commits: [], HEAD: null, branch: 'main', log: [] };

function gitSim(state, cmd) {
  const s = JSON.parse(JSON.stringify(state));
  const parts = cmd.trim().split(/\s+/);
  const log = (msg) => s.log.push(msg);

  if (parts[0] !== 'git') { log(`❌ 未知命令: ${cmd}`); return s; }
  const sub = parts[1];

  if (sub === 'init') {
    s.files = {}; s.staged = {}; s.commits = []; s.HEAD = null; s.branch = 'main';
    log('✅ Initialized empty Git repository');
  } else if (sub === 'add') {
    const file = parts[2];
    if (!file || file === '.') {
      Object.keys(s.files).forEach(f => { s.staged[f] = s.files[f]; });
      log(`✅ Staged all ${Object.keys(s.files).length} files`);
    } else if (s.files[file]) {
      s.staged[file] = s.files[file];
      log(`✅ Staged: ${file}`);
    } else { log(`❌ pathspec '${file}' did not match any files`); }
  } else if (sub === 'commit') {
    const msgIdx = parts.indexOf('-m');
    const msg = msgIdx >= 0 ? parts.slice(msgIdx + 1).join(' ').replace(/"/g, '') : 'no message';
    if (Object.keys(s.staged).length === 0) { log('❌ nothing to commit, working tree clean'); return s; }
    const hash = Math.random().toString(36).slice(2, 9);
    s.commits.push({ hash, msg, files: { ...s.staged }, parent: s.HEAD });
    s.HEAD = hash;
    s.staged = {};
    log(`✅ [${s.branch} ${hash}] ${msg}`);
    log(`   ${Object.keys(s.commits[s.commits.length-1].files).length} file(s) changed`);
  } else if (sub === 'status') {
    const modified = Object.keys(s.files).filter(f => !s.staged[f]);
    const staged = Object.keys(s.staged);
    log('On branch ' + s.branch);
    if (staged.length) log('Changes to be committed:\n  ' + staged.map(f => `  new file: ${f}`).join('\n  '));
    if (modified.length) log('Changes not staged:\n  ' + modified.map(f => `  modified: ${f}`).join('\n  '));
    if (!staged.length && !modified.length) log('nothing to commit, working tree clean');
  } else if (sub === 'log') {
    if (!s.commits.length) { log('fatal: no commits yet'); return s; }
    s.commits.slice().reverse().forEach(c => {
      log(`commit ${c.hash} (${c.hash === s.HEAD ? 'HEAD -> ' + s.branch : ''})`);
      log(`    ${c.msg}`);
    });
  } else if (sub === 'diff') {
    const flag = parts[2];
    if (flag === '--staged') {
      Object.keys(s.staged).forEach(f => log(`+ ${f}: "${s.staged[f]}"`));
      if (!Object.keys(s.staged).length) log('(no staged changes)');
    } else {
      const unstaged = Object.keys(s.files).filter(f => !s.staged[f]);
      unstaged.forEach(f => log(`M ${f}: "${s.files[f]}"`));
      if (!unstaged.length) log('(no unstaged changes)');
    }
  } else if (sub === 'reset') {
    if (parts[2] === '--soft' || parts[2] === '--mixed') {
      s.staged = {}; log('✅ Reset HEAD (staged area cleared)');
    } else if (parts[2] === '--hard') {
      s.staged = {}; s.files = {}; log('⚠️ HEAD reset to previous commit (all changes lost!)');
    } else { s.staged = {}; log('✅ Unstaged all files'); }
  } else { log(`❌ git: '${sub}' is not a git command`); }
  return s;
}

// Simulate file creation
function touch(state, filename, content) {
  const s = JSON.parse(JSON.stringify(state));
  s.files[filename] = content || `content of ${filename}`;
  s.log.push(`📄 Created file: ${filename}`);
  return s;
}

export default function LessonGitBasics() {
  const [active, setActive] = useState(0);
  const [gitState, setGitState] = useState(INITIAL_STATE);
  const [cmdInput, setCmdInput] = useState('');

  const runCmd = useCallback(() => {
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim();
    if (cmd.startsWith('touch ') || cmd.startsWith('echo ')) {
      const parts = cmd.split(/\s+/);
      const fname = parts[parts.length - 1];
      setGitState(s => touch(s, fname, cmd));
    } else {
      setGitState(s => gitSim(s, cmd));
    }
    setCmdInput('');
  }, [cmdInput]);

  const presetCmds = [
    'git init', 'touch app.js', 'touch README.md', 'git add .',
    'git commit -m "initial commit"', 'git status', 'git log', 'git diff --staged'
  ];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge">🔀 module_01 — Git 基础</div>
      <div className="fs-hero">
        <h1>Git 基础：仓库 / 暂存区 / 提交 / 历史</h1>
        <p>
          Git 不是简单的"保存"工具。它是一台<strong>内容寻址文件系统</strong>，
          每一次 commit 都是整棵文件树的快照。本模块从 <strong>git init</strong> 开始，
          深入理解工作区 → 暂存区 → 本地仓库的三层架构。
          <strong>理解暂存区 (stage) 是从初学者到高手的分水岭</strong>。
        </p>
      </div>

      {/* Git 三层架构可视化 */}
      <div className="pipeline">
        <div className="pipeline-stage" style={{background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.3)', color:'#fb923c'}}>
          <span>📝 工作区</span><small>Working Dir</small>
        </div>
        <span className="pipeline-arrow">→ git add →</span>
        <div className="pipeline-stage" style={{background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80'}}>
          <span>📦 暂存区</span><small>Stage / Index</small>
        </div>
        <span className="pipeline-arrow">→ git commit →</span>
        <div className="pipeline-stage" style={{background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)', color:'#a78bfa'}}>
          <span>🗄️ 本地仓库</span><small>Repository</small>
        </div>
        <span className="pipeline-arrow">→ git push →</span>
        <div className="pipeline-stage" style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9'}}>
          <span>☁️ 远程仓库</span><small>Remote</small>
        </div>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📂 Git 核心工作流</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>⚙️ 初始化与全局配置</h3>
            <div className="concept-card">
              <h4>🎯 Git 的核心设计：内容寻址文件系统</h4>
              <p>每个文件、目录、提交都是一个 <strong>SHA-1 哈希对象</strong>。相同内容 → 相同哈希 → 自动去重。</p>
              <p>Git 不存储差异 (delta)，而是存储<strong>完整快照</strong>。但通过 packfile 机制自动压缩。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> git_init_config.sh</div>
              <pre className="fs-code">{`# ═══ 1. 全局配置 (只需执行一次) ═══
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 推荐配置 (高手标配)
git config --global init.defaultBranch main       # 默认分支名
git config --global core.autocrlf input           # Mac/Linux
git config --global pull.rebase true              # pull 时默认 rebase
git config --global fetch.prune true              # fetch 自动清理已删远程分支
git config --global diff.algorithm histogram      # 更好的 diff 算法
git config --global merge.conflictstyle diff3     # 三路合并冲突显示
git config --global rebase.autoStash true         # rebase 自动 stash

# 查看所有配置
git config --list --show-origin`}</pre>
            </div>
            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>📁 .git 目录结构</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> .git/ 目录</div>
              <pre className="fs-code">{`.git/
├── HEAD            → 当前分支指针 (ref: refs/heads/main)
├── config          → 仓库级配置 (覆盖全局)
├── objects/        → 所有对象存储 (blob/tree/commit/tag)
│   ├── pack/       → 压缩后的 packfile
│   └── info/
├── refs/
│   ├── heads/      → 本地分支指针 (每个分支=一个40字符文件)
│   ├── tags/       → 标签指针
│   └── remotes/    → 远程跟踪分支
├── hooks/          → 钩子脚本 (pre-commit, post-merge 等)
├── index           → 暂存区 (二进制文件)
└── logs/           → reflog 的存储位置`}</pre>
            </div>
            <div className="tip-box">
              💡 <strong>Pro Tip</strong>：在项目根目录创建 <code>.gitignore</code> 时，可以用 <code>gitignore.io</code> 快速生成模板——支持 300+ 语言/框架/IDE 的预设规则。
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>📦 暂存区 (Staging Area) 深度解析</h3>
            <div className="concept-card">
              <h4>🤔 为什么需要暂存区？直接 commit 不行吗？</h4>
              <p>暂存区让你 <strong>精确控制每次提交的内容</strong>。你可以修改 10 个文件，但只提交其中 3 个——甚至只提交一个文件中的某几行。</p>
              <p>这是 Git 和 SVN 的核心区别之一。SVN 只有"工作区→仓库"两层。</p>
            </div>

            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#f97316'}}>基本暂存</div>
                <div className="sandbox-output">{`git add file.txt          # 暂存单个文件
git add src/              # 暂存整个目录
git add *.js              # 通配符暂存
git add -A                # 暂存所有变更
git add -u                # 只暂存已跟踪文件`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#22c55e'}}>高级暂存 (高手必备)</div>
                <div className="sandbox-output">{`git add -p                # --patch: 逐块选择
# 每个 hunk 可以选择:
#   y = 暂存此块    n = 跳过
#   s = 拆分更小块  e = 手动编辑
# 场景: 一个文件里有 bug fix + feature
# → git add -p 精确到行级别的暂存`}</div>
              </div>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>查看暂存状态 & 取消暂存</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> staging_ops.sh</div>
              <pre className="fs-code">{`# 查看状态 (五种 diff 对比)
git status                       # 概览
git status -s                    # 短格式: M=修改 A=新增 D=删除 ??=未跟踪
git diff                         # 工作区 vs 暂存区 (未暂存的修改)
git diff --staged                # 暂存区 vs HEAD   (即将提交的内容)
git diff HEAD                    # 工作区 vs HEAD   (全部修改)

# 取消暂存 / 丢弃修改
git restore --staged file.txt    # 从暂存区移除 (保留工作区修改) ✅ 安全
git restore file.txt             # 丢弃工作区修改              ⚠️ 危险!
git restore --source=HEAD~3 f.txt # 恢复到 3 个提交前的版本`}</pre>
            </div>
            <div className="warning-box">
              ⚠️ <strong>git restore file.txt</strong> 会永久丢弃未暂存的修改，且<strong>无法恢复</strong>！请确认你真的不需要这些修改。
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>📝 提交与历史操作</h3>
            <div className="concept-card">
              <h4>每个 Commit 的数据结构</h4>
              <ul>
                <li><strong>tree</strong>: 文件树的 SHA-1 哈希（指向整个项目快照）</li>
                <li><strong>parent</strong>: 父提交的哈希（形成链表 → 即 Git 历史）</li>
                <li><strong>author</strong>: 作者 + 时间戳</li>
                <li><strong>message</strong>: 提交信息</li>
              </ul>
            </div>

            <h4 style={{color:'#fb923c', margin:'1rem 0 0.5rem'}}>Conventional Commits 规范</h4>
            <div className="fs-grid-3">
              {[
                { type: 'feat', desc: '新功能', color: '#22c55e' },
                { type: 'fix', desc: 'Bug 修复', color: '#ef4444' },
                { type: 'docs', desc: '文档变更', color: '#06b6d4' },
                { type: 'style', desc: '代码格式', color: '#f59e0b' },
                { type: 'refactor', desc: '重构', color: '#8b5cf6' },
                { type: 'perf', desc: '性能优化', color: '#fb7185' },
                { type: 'test', desc: '测试', color: '#14b8a6' },
                { type: 'chore', desc: '构建/工具', color: '#64748b' },
                { type: 'ci', desc: 'CI 配置', color: '#f97316' },
              ].map(({ type, desc, color }) => (
                <div key={type} className="fs-metric" style={{borderColor: `${color}33`, padding:'0.6rem'}}>
                  <div className="fs-metric-value" style={{color, fontSize:'0.9rem'}}>{type}:</div>
                  <div className="fs-metric-label" style={{textTransform:'none'}}>{desc}</div>
                </div>
              ))}
            </div>

            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> commit_history.sh</div>
              <pre className="fs-code">{`# ═══ 提交最佳实践 ═══
git commit -m "feat: add user authentication"
git commit -m "fix(auth): resolve null pointer in token parser"
git commit --amend -m "fix: correct error message"  # 修改上次提交
git add forgotten.txt && git commit --amend --no-edit # 追加文件

# ═══ 查看历史 (最常用的组合) ═══
git log --oneline --graph --all      # ASCII 分支图 (必会!)
git log --since="2024-01-01"         # 时间过滤
git log --author="Alice"             # 作者过滤
git log -- src/auth.js               # 文件历史
git log -S "TODO"                    # 搜索代码变更 (pickaxe)
git log --format="%h %an %ar %s"     # 自定义格式
git shortlog -sn                     # 按作者统计提交数
git show abc1234                     # 查看提交详情 + diff
git show abc1234:src/main.js         # 查看该提交时的文件内容`}</pre>
            </div>
            <div className="tip-box">
              💡 <strong>别名加速</strong>：<code>git config --global alias.lg "log --oneline --graph --all --decorate"</code>，以后只需输入 <code>git lg</code>。
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>🔄 diff 与撤销操作全景</h3>
            <div className="concept-card">
              <h4>撤销操作速查表 — 记住这张表就够了</h4>
            </div>
            <table className="fs-table">
              <thead>
                <tr><th>场景</th><th>命令</th><th>安全性</th></tr>
              </thead>
              <tbody>
                <tr><td>撤销工作区修改</td><td><code>git restore {'<file>'}</code></td><td><span className="fs-tag red">⚠ 危险</span></td></tr>
                <tr><td>取消暂存</td><td><code>git restore --staged {'<file>'}</code></td><td><span className="fs-tag green">✅ 安全</span></td></tr>
                <tr><td>修改上次提交</td><td><code>git commit --amend</code></td><td><span className="fs-tag amber">⚠ 慎用</span></td></tr>
                <tr><td>撤销提交(保留代码)</td><td><code>git reset --soft HEAD~1</code></td><td><span className="fs-tag green">✅ 安全</span></td></tr>
                <tr><td>撤销提交+暂存</td><td><code>git reset --mixed HEAD~1</code></td><td><span className="fs-tag green">✅ 安全</span></td></tr>
                <tr><td>彻底删除提交</td><td><code>git reset --hard HEAD~1</code></td><td><span className="fs-tag red">❌ 危险</span></td></tr>
                <tr><td>安全撤销公共提交</td><td><code>git revert {'<commit>'}</code></td><td><span className="fs-tag green">✅ 安全</span></td></tr>
              </tbody>
            </table>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Reset 三模式详解</h4>
            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#22c55e'}}>--soft (最安全)</div>
                <div className="sandbox-output">{`只移动 HEAD
→ 暂存区和工作区都保留
→ 用途: 合并最近几次提交为一个
→ 例: git reset --soft HEAD~3
     然后 git commit 合为一个`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#f59e0b'}}>--mixed (默认)</div>
                <div className="sandbox-output">{`移动 HEAD + 清空暂存区
→ 工作区保留
→ 用途: 重新选择哪些文件进入提交
→ 例: git reset HEAD~1
     重新 git add 想要的文件`}</div>
              </div>
            </div>

            <div className="danger-box">
              ❌ <strong>--hard 模式</strong>：移动 HEAD + 清空暂存区 + 清空工作区。所有修改<strong>永久丢失</strong>！唯一的后悔药是 <code>git reflog</code>（保留 90 天）。
            </div>

            <div className="tip-box" style={{marginTop:'0.75rem'}}>
              💡 <strong>Revert vs Reset</strong>：Reset 改写历史(只能用于未 push 的本地提交)；Revert 创建新提交来撤销(安全, 可用于公共分支)。
            </div>
          </div>
        )}

        {active === 4 && (
          <div className="fs-card">
            <div className="sandbox">
              <div className="sandbox-header">
                <h4>🎮 交互式 Git 模拟器</h4>
                <button className="fs-btn primary" onClick={() => setGitState(INITIAL_STATE)} style={{padding:'0.3rem 0.7rem', fontSize:'0.75rem'}}>🗑️ 重置</button>
              </div>
              <div className="sandbox-body">
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.75rem'}}>
                  <span style={{color:'#4ade80', fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem', flexShrink:0}}>$</span>
                  <input
                    type="text" value={cmdInput}
                    onChange={e => setCmdInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runCmd()}
                    placeholder="输入 Git 命令, 如: git init"
                    spellCheck={false}
                  />
                </div>
                <div className="fs-pills" style={{marginBottom:'0.75rem'}}>
                  {presetCmds.map((cmd, i) => (
                    <button key={i} className="fs-btn" onClick={() => { setCmdInput(cmd); }} style={{fontSize:'0.68rem', padding:'0.25rem 0.5rem'}}>{cmd}</button>
                  ))}
                </div>

                {/* State visualization */}
                <div className="fs-grid-3" style={{marginBottom:'0.75rem'}}>
                  <div className="fs-metric" style={{borderColor:'rgba(249,115,22,0.2)', padding:'0.6rem'}}>
                    <div className="fs-metric-value" style={{color:'#fb923c', fontSize:'1rem'}}>{Object.keys(gitState.files).length}</div>
                    <div className="fs-metric-label">工作区文件</div>
                  </div>
                  <div className="fs-metric" style={{borderColor:'rgba(34,197,94,0.2)', padding:'0.6rem'}}>
                    <div className="fs-metric-value" style={{color:'#4ade80', fontSize:'1rem'}}>{Object.keys(gitState.staged).length}</div>
                    <div className="fs-metric-label">已暂存</div>
                  </div>
                  <div className="fs-metric" style={{borderColor:'rgba(139,92,246,0.2)', padding:'0.6rem'}}>
                    <div className="fs-metric-value" style={{color:'#a78bfa', fontSize:'1rem'}}>{gitState.commits.length}</div>
                    <div className="fs-metric-label">提交数</div>
                  </div>
                </div>

                {gitState.log.length > 0 && (
                  <div className="sandbox-output">
                    {gitState.log.join('\n')}
                  </div>
                )}
              </div>
            </div>
            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>试试这个流程</strong>：<code>git init</code> → <code>touch app.js</code> → <code>touch README.md</code> → <code>git add .</code> → <code>git commit -m "initial commit"</code> → <code>git log</code>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
