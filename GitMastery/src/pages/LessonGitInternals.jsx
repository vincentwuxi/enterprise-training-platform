import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

const tabs = ['🧬 对象模型', '🌳 Tree 与 Blob', '📦 Packfile 压缩', '🔧 Plumbing 命令', '🎮 对象探索器'];

/* ── SHA-1 Hash Demo ── */
function HashDemo() {
  const [input, setInput] = useState('hello world');
  // Simple hash simulation (not real SHA-1, but demonstrates the concept)
  const simpleHash = useCallback((str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return hex.repeat(5).slice(0, 40);
  }, []);

  const gitBlobHeader = `blob ${new TextEncoder().encode(input).length}\\0`;
  const fullContent = gitBlobHeader + input;

  return (
    <div className="sandbox">
      <div className="sandbox-header">
        <h4>🔬 SHA-1 哈希演示</h4>
      </div>
      <div className="sandbox-body">
        <div style={{marginBottom:'0.5rem', color:'#94a3b8', fontSize:'0.8rem'}}>输入内容，观察 Git 对象的哈希计算过程：</div>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="输入任意内容..." spellCheck={false} />
        <div className="fs-grid-2" style={{marginTop:'0.75rem', gap:'0.5rem'}}>
          <div className="fs-metric" style={{borderColor:'rgba(249,115,22,0.2)', padding:'0.6rem'}}>
            <div className="fs-metric-label">Git Blob 头部</div>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color:'#fb923c', marginTop:'0.3rem'}}>{gitBlobHeader}</div>
          </div>
          <div className="fs-metric" style={{borderColor:'rgba(139,92,246,0.2)', padding:'0.6rem'}}>
            <div className="fs-metric-label">完整内容（头部+数据）</div>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color:'#a78bfa', marginTop:'0.3rem', wordBreak:'break-all'}}>{fullContent}</div>
          </div>
        </div>
        <div className="fs-metric" style={{borderColor:'rgba(34,197,94,0.2)', padding:'0.6rem', marginTop:'0.5rem'}}>
          <div className="fs-metric-label">SHA-1 哈希值（40 字符十六进制）</div>
          <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem', color:'#4ade80', marginTop:'0.3rem', wordBreak:'break-all', letterSpacing:'0.05em'}}>
            {simpleHash(fullContent)}
          </div>
        </div>
        <div className="tip-box" style={{marginTop:'0.5rem'}}>
          💡 试试改变一个字符 — 哈希完全改变！这就是"雪崩效应"。真实命令：<code>echo -n "hello" | git hash-object --stdin</code>
        </div>
      </div>
    </div>
  );
}

export default function LessonGitInternals() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge red">🧬 module_08 — Git 内部原理</div>
      <div className="fs-hero">
        <h1>Git 内部原理：对象模型 / Packfile / 自定义命令</h1>
        <p>
          理解 Git 的内部原理，你就能从"使用者"升级为"驾驭者"。
          Git 的核心是一个<strong>内容寻址文件系统 (content-addressable filesystem)</strong>，
          一切操作（commit、branch、tag）都建立在 4 种对象之上。
          <strong>掌握 plumbing 命令，你可以手工构建一个 commit</strong>。
        </p>
      </div>

      {/* 四种对象类型 */}
      <div className="pipeline">
        {[
          { icon:'📄', text:'Blob', sub:'文件内容', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
          { icon:'🌳', text:'Tree', sub:'目录结构', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
          { icon:'💾', text:'Commit', sub:'快照+元数据', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
          { icon:'🏷️', text:'Tag', sub:'标签(注释)', bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="pipeline-arrow">→</span>}
            <div className="pipeline-stage" style={{background:s.bg, border:`1px solid ${s.color}33`, color:s.color, minWidth:'120px'}}>
              <span>{s.icon} {s.text}</span><small>{s.sub}</small>
            </div>
          </React.Fragment>
        ))}
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧬 深入 Git 内部</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🧬 Git 对象模型 — 4 种对象构建一切</h3>
            <div className="concept-card">
              <h4>核心思想：内容寻址</h4>
              <p>Git 对每个对象计算 SHA-1 哈希值作为"地址"。<strong>相同内容 → 相同哈希 → 自动去重</strong>。这意味着如果 1000 个提交中某个文件没变，Git 只存一份。</p>
            </div>

            <div className="fs-grid-2">
              <div className="concept-card" style={{borderColor:'rgba(249,115,22,0.3)'}}>
                <h4 style={{color:'#fb923c'}}>📄 Blob (Binary Large Object)</h4>
                <p><strong>存储文件内容</strong>。不包含文件名！只是纯内容。</p>
                <p style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color:'#475569'}}>blob {'<size>'}\\0{'<content>'}</p>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(34,197,94,0.3)'}}>
                <h4 style={{color:'#4ade80'}}>🌳 Tree</h4>
                <p><strong>存储目录结构</strong>。指向 blob（文件）或其他 tree（子目录）。包含文件名和权限。</p>
                <p style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color:'#475569'}}>100644 blob abc1234 README.md</p>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(139,92,246,0.3)'}}>
                <h4 style={{color:'#a78bfa'}}>💾 Commit</h4>
                <p><strong>存储快照+元数据</strong>。指向顶层 tree + 父 commit + 作者 + 提交信息。</p>
                <p style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color:'#475569'}}>tree + parent + author + msg</p>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(245,158,11,0.3)'}}>
                <h4 style={{color:'#fbbf24'}}>🏷️ Tag (注释标签)</h4>
                <p><strong>指向任意对象(通常是 commit)</strong>。包含标签名、标签者信息和消息。</p>
                <p style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color:'#475569'}}>object + type + tag + tagger</p>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> explore_objects.sh</div>
              <pre className="fs-code">{`# 查看 HEAD 指向的 commit 对象
git cat-file -p HEAD
# tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579
# parent abc1234def5678...
# author Alice <alice@company.com> 1705305600 +0800
# committer Alice <alice@company.com> 1705305600 +0800
#
# feat: add user authentication

# 查看这个 commit 的 tree 对象
git cat-file -p d8329fc
# 100644 blob e69de29bb2d1d6434b8b29ae775ad8c2e48c5391  .gitignore
# 100644 blob fa49b077972391ad58037050f2a75f74e3671e92  README.md
# 040000 tree abc1234def5678...                          src/

# 查看某个 blob 的内容
git cat-file -p fa49b07
# # My Project
# This is the README.

# 查看对象类型和大小
git cat-file -t fa49b07          # blob
git cat-file -s fa49b07          # 42 (bytes)`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🌳 Tree 与 Blob — 文件是如何存储的</h3>
            <div className="concept-card">
              <h4>一次 Commit 的完整对象图</h4>
              <p>一个 commit 指向一个 root tree，tree 递归地指向子 tree 和 blob，形成整棵文件树的快照。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> object_graph</div>
              <pre className="fs-code">{`# 一次提交的对象关系图:
#
#  commit abc1234
#    │
#    └─→ tree (root)
#          ├── blob README.md        → "# My Project..."
#          ├── blob package.json     → "{\"name\":\"app\"...}"
#          ├── blob .gitignore       → "node_modules/..."
#          └── tree src/
#                ├── blob index.js   → "import React..."
#                ├── blob App.jsx    → "function App()..."
#                └── tree components/
#                      ├── blob Header.jsx
#                      └── blob Footer.jsx
#
# 关键洞察:
# 1. blob 不含文件名 → 文件名在 tree 中
# 2. 相同内容的文件只存一份 blob
# 3. 如果只改了一个文件, 只有该文件的 blob
#    和包含它的 tree 链路上的对象是新的
#    其他所有对象被复用!`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>手工创建一个 Commit（用 plumbing 命令）</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> manual_commit.sh</div>
              <pre className="fs-code">{`# 1. 创建 blob
echo "Hello, Git Internals!" | git hash-object -w --stdin
# → 返回: 8ab686eafeb1f44702738c8b0f24f2567c36da6d

# 2. 创建 tree (包含这个 blob)
printf '100644 blob 8ab686ea\\thello.txt\\n' | git mktree
# → 返回: 4b825dc642cb6eb9a060e54bf899d1535850211

# 3. 创建 commit (指向这个 tree)
echo "My first manual commit" | \\
  git commit-tree 4b825dc -p HEAD
# → 返回: 新的 commit hash

# 4. 移动分支指针
git update-ref refs/heads/main <new-commit-hash>

# 恭喜! 你刚刚绕过了所有 porcelain 命令,
# 直接用底层 plumbing 命令手工构建了一个完整的提交!`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>📦 Packfile 压缩机制</h3>
            <div className="concept-card">
              <h4>为什么 Git 存储完整快照却不占太多空间？</h4>
              <p>Git 用两种机制压缩：(1) 每个 <strong>loose object</strong> 用 zlib 压缩；(2) <code>git gc</code> 把相似对象打包为 <strong>packfile</strong>，用 delta 编码只存差异。</p>
            </div>

            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#f97316'}}>Loose Objects</div>
                <div className="sandbox-output">{`每个对象单独存储在
.git/objects/ab/c1234...

格式: zlib(type + size + \\0 + content)

优点: 简单, 快速写入
缺点: 大量小文件, 浪费空间`}</div>
              </div>
              <div>
                <div className="label" style={{color:'#22c55e'}}>Packfile</div>
                <div className="sandbox-output">{`多个对象打包为一个文件
.git/objects/pack/pack-xxx.pack

格式: 基础对象 + delta 编码
→ 只存储相似文件间的差异

优点: 极高压缩比
触发: git gc / git push`}</div>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pack_operations.sh</div>
              <pre className="fs-code">{`# 查看 packfile 信息
git verify-pack -v .git/objects/pack/pack-xxx.idx
# SHA-1   type  size  size-in-pack  offset  depth  base-SHA-1
# abc12   blob  1024  512           5       2      def56
#               ↑原始大小  ↑压缩后      ↑delta深度 ↑基础对象

# 手动触发打包
git gc                           # 同时清理 + 打包 + 压缩
git repack -a -d                 # 重新打包所有对象
git prune                        # 清理无引用的 loose objects

# 查看仓库统计
git count-objects -v
# count: 42                      # loose objects 数量
# size: 168                      # loose objects 大小 (KB)
# in-pack: 1234                  # packfile 中的对象数
# packs: 1                       # packfile 数量
# size-pack: 4096                # packfile 总大小 (KB)

# 自动维护 (Git 2.29+)
git maintenance start
# → 自动在后台执行 gc, prefetch, commit-graph 等`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>🔧 Porcelain vs Plumbing 命令</h3>
            <div className="concept-card">
              <h4>两类 Git 命令</h4>
              <p><strong>Porcelain (瓷器)</strong>：面向用户的高级命令 — add, commit, push, pull, merge...</p>
              <p><strong>Plumbing (管道)</strong>：面向脚本的底层命令 — hash-object, cat-file, update-ref, rev-parse...</p>
            </div>

            <table className="fs-table">
              <thead><tr><th>Porcelain</th><th>等价的 Plumbing</th><th>底层操作</th></tr></thead>
              <tbody>
                <tr><td><code>git add</code></td><td><code>git update-index</code></td><td>更新暂存区 (index)</td></tr>
                <tr><td><code>git commit</code></td><td><code>git write-tree + commit-tree</code></td><td>创建 tree + commit 对象</td></tr>
                <tr><td><code>git branch</code></td><td><code>git update-ref</code></td><td>创建/修改引用文件</td></tr>
                <tr><td><code>git checkout</code></td><td><code>git read-tree + checkout-index</code></td><td>读取 tree 到 index + 工作区</td></tr>
                <tr><td><code>git log</code></td><td><code>git rev-list + cat-file</code></td><td>遍历 commit 链 + 读取对象</td></tr>
                <tr><td><code>git diff</code></td><td><code>git diff-tree / diff-index</code></td><td>比较 tree/index 对象</td></tr>
              </tbody>
            </table>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>自定义 Git 命令</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> custom_commands.sh</div>
              <pre className="fs-code">{`# 任何名为 git-xxx 的可执行文件放在 PATH 中,
# 就可以用 git xxx 调用!

# 例: git-stats → git stats
cat > ~/bin/git-stats << 'EOF'
#!/bin/bash
echo "📊 Repository Stats"
echo "==================="
echo "Total commits: $(git rev-list --count HEAD)"
echo "Contributors:  $(git shortlog -sn | wc -l)"
echo "Files tracked: $(git ls-files | wc -l)"
echo "Repo size:     $(du -sh .git | cut -f1)"
echo "First commit:  $(git log --reverse --format='%ar' | head -1)"
echo ""
echo "Top 5 contributors:"
git shortlog -sn --no-merges | head -5
EOF
chmod +x ~/bin/git-stats

# 现在可以运行:
git stats`}</pre>
            </div>
          </div>
        )}

        {active === 4 && (
          <div className="fs-card">
            <HashDemo />
            <div style={{marginTop:'1.5rem'}}></div>
            <h4 style={{color:'#fb923c', margin:'0 0 0.5rem'}}>动手探索</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> diy_exploration.sh</div>
              <pre className="fs-code">{`# ═══ 在你自己的仓库中试试 ═══

# 1. 查看 HEAD 指向哪里
cat .git/HEAD
# → ref: refs/heads/main

# 2. 查看 main 分支指向哪个 commit
cat .git/refs/heads/main
# → abc1234def5678... (40 字符 SHA-1)

# 3. 查看这个 commit 对象
git cat-file -p $(cat .git/refs/heads/main)

# 4. 继续探索 tree 和 blob...
# 5. 验证: 修改一个文件后 blob 的哈希完全改变

# ═══ 有趣的实验 ═══
# 创建两个内容相同但文件名不同的文件:
echo "same content" > file1.txt
echo "same content" > file2.txt
git add .
# 查看暂存区:
git ls-files -s
# 两个文件指向同一个 blob!  (Git 自动去重)

# ═══ 推荐阅读 ═══
# Pro Git Book: https://git-scm.com/book (免费)
# 第10章 "Git Internals" 是理解底层原理的最佳资料`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
