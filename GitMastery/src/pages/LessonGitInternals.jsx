import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['对象模型', '引用与 HEAD', 'Packfile 优化', '底层命令'];

export default function LessonGitInternals() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge red">🔬 module_08 — Git 内部原理</div>
      <div className="fs-hero">
        <h1>Git 内部原理：对象模型 / Packfile / 底层命令</h1>
        <p>
          要真正精通 Git，必须理解 <strong>.git 目录</strong> 里到底藏了什么。
          Git 的核心是一个<strong>内容寻址 (content-addressable) 的文件系统</strong>——
          每个文件、每棵目录树、每次提交都是一个 SHA-1 哈希标识的对象。
          理解 blob / tree / commit / tag 四种对象类型，
          就能解释 Git 所有行为的本质。<strong>知其然，更知其所以然</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 Git 底层揭秘</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 Git 四种对象类型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> git_objects.sh</div>
                <pre className="fs-code">{`# ═══ Git 的存储模型 ═══
# Git = 内容寻址文件系统 + 版本控制层
# 所有数据存储在 .git/objects/ 中
# key = SHA-1(内容), value = 压缩后的对象

# ═══ 1. Blob (Binary Large Object) ═══
# 存储文件内容 (不包括文件名!)
echo "Hello World" | git hash-object --stdin
# → 557db03de997c86a4a028e1ebd3a1ceb225be238

# 实际存储:
# .git/objects/55/7db03de997c86a4a028e1ebd3a1ceb225be238
# 前两位做目录名, 避免单目录文件过多

# 查看对象内容:
git cat-file -p 557db03          # "Hello World"
git cat-file -t 557db03          # "blob"
git cat-file -s 557db03          # 12 (字节数)

# ═══ 2. Tree (目录树) ═══
# 存储目录结构: 文件名 → blob 的映射
git cat-file -p main^{tree}
# 100644 blob abc123  .gitignore
# 100644 blob def456  package.json
# 040000 tree ghi789  src/
#
# 文件模式:
# 100644 → 普通文件
# 100755 → 可执行文件
# 040000 → 子目录
# 120000 → 符号链接
# 160000 → gitlink (submodule)

# ═══ 3. Commit (提交) ═══
# 指向一棵 tree, 加上元数据
git cat-file -p HEAD
# tree    abc123def456...        ← 根目录的 tree 对象
# parent  789abc012def...        ← 父提交 (可以有多个)
# author  Alice <a@b.com> 1706000000 +0800
# committer Alice <a@b.com> 1706000000 +0800
#
# feat: add user authentication

# ═══ 4. Tag (标注标签) ═══
git cat-file -p v1.0.0
# object  abc123...              ← 指向的 commit
# type    commit
# tag     v1.0.0
# tagger  Alice <a@b.com> 1706000000 +0800
#
# Release 1.0.0

# ═══ 对象关系图 ═══
#
# commit ──→ tree (根目录)
#   │          ├── blob (README.md 的内容)
#   │          ├── blob (package.json 的内容)
#   │          └── tree (src/ 子目录)
#   │               ├── blob (index.js 的内容)
#   │               └── blob (utils.js 的内容)
#   │
#   └──→ parent commit ──→ tree ──→ ...
#
# 关键洞察:
# 1. 相同内容的文件 → 相同的 blob → 自动去重
# 2. 未修改的目录 → tree 对象复用 → 快照 ≠ 全量复制
# 3. SHA-1 保证完整性 → 任何篡改都会被检测到`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔖 引用系统与 HEAD</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> refs_and_head.sh</div>
                <pre className="fs-code">{`# ═══ .git 目录完整结构 ═══
#
# .git/
# ├── HEAD                → 当前分支的符号引用
# ├── config              → 仓库级配置
# ├── description         → GitWeb 描述
# ├── hooks/              → 钩子脚本
# ├── index               → 暂存区 (二进制)
# ├── info/
# │   └── exclude         → 本地 gitignore
# ├── logs/               → reflog 日志
# │   ├── HEAD
# │   └── refs/heads/
# ├── objects/            → 所有对象
# │   ├── info/
# │   ├── pack/           → 打包文件
# │   └── xx/yyyyyyyy...  → 松散对象
# ├── packed-refs         → 打包的引用
# └── refs/
#     ├── heads/          → 本地分支
#     │   ├── main        → "abc123..."
#     │   └── feature     → "def456..."
#     ├── remotes/        → 远程跟踪分支
#     │   └── origin/
#     │       ├── main
#     │       └── feature
#     ├── tags/           → 标签
#     └── stash           → stash 引用

# ═══ HEAD 的工作原理 ═══
cat .git/HEAD
# → ref: refs/heads/main       (正常: 指向分支)
# → abc123def456...             (分离HEAD: 直接指向commit)

# HEAD 是如何移动的:
# git commit  → 创建新 commit → 分支指针前移 → HEAD 跟着走
# git switch  → HEAD 改为指向另一个分支
# git reset   → 分支指针移动 → HEAD 跟着走
# git checkout abc123 → HEAD 直接指向 commit (分离)

# ═══ 引用解析规则 ═══
# Git 如何解析一个名字 (如 "main"):
# 1. .git/<name>                        → HEAD
# 2. .git/refs/<name>
# 3. .git/refs/tags/<name>              → v1.0.0
# 4. .git/refs/heads/<name>             → main
# 5. .git/refs/remotes/<name>           → origin/main
# 6. .git/refs/remotes/<name>/HEAD      → origin/HEAD

# ═══ 常见引用语法 ═══
# HEAD          → 当前提交
# HEAD~1        → 一代父提交
# HEAD~3        → 三代祖先
# HEAD^1        → 第一个父提交 (合并提交有多个父)
# HEAD^2        → 第二个父提交
# main@{1}      → main 上一次指向的位置 (reflog)
# main@{yesterday}  → main 昨天的位置
# HEAD^{tree}   → HEAD 对应的 tree 对象
# :0:file.txt   → 暂存区中的 file.txt
# :/fix bug     → 搜索提交信息包含 "fix bug" 的提交

# ═══ 验证: 手动计算 SHA-1 ═══
# Git 对象的 SHA-1 = SHA1(type + space + size + null + content)
echo -n "blob 12\0Hello World\n" | shasum
# → 557db03de997c86a4a028e1ebd3a1ceb225be238
# 和 git hash-object 的结果一致!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 Packfile 与存储优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> packfile_gc.sh</div>
                <pre className="fs-code">{`# ═══ 松散对象 vs Packfile ═══
#
# 松散对象: 每个对象一个文件 (.git/objects/xx/yyyy...)
# → 新创建的对象先以松散形式存储
# → 文件多了以后效率低
#
# Packfile: 多个对象打包成一个文件
# → .git/objects/pack/pack-xxx.pack  (数据)
# → .git/objects/pack/pack-xxx.idx   (索引)
# → Delta 压缩: 相似对象只存差异

# ═══ 何时打包 ═══
# 1. git push / git fetch 时自动打包传输
# 2. git gc (garbage collection) 时打包本地对象
# 3. 松散对象超过 6700 个时自动触发

git gc                           # 手动触发垃圾回收
# 做了什么:
# 1. 打包松散对象为 Packfile
# 2. Delta 压缩相似对象
# 3. 删除不可达的对象 (超过 gc.pruneExpire)
# 4. 打包引用 (refs → packed-refs)

git gc --aggressive              # 更激进的压缩 (耗时长)

# ═══ Delta 压缩的原理 ═══
# 假设 file.js 有 1000 行, 修改了 5 行:
# 松散存储: 两个 blob, 各 ~30KB = 60KB
# Delta 存储: 基础 blob 30KB + delta 差异 200B ≈ 30.2KB
#
# Git 自动选择最佳的 "delta base"
# → 不一定是历史上的前一个版本
# → 而是内容最相似的对象

# 查看 Packfile 信息:
git verify-pack -v .git/objects/pack/pack-*.idx | head -20
# SHA-1    type  size  size-in-pack  offset  depth  base-SHA-1
# abc123   commit 208   150          12
# def456   tree   95    84           162
# ghi789   blob   12000 3200         246
# jkl012   blob   300   120         3446     1 ghi789  ← delta, 基于 ghi789

# ═══ 仓库维护命令 ═══
git count-objects -vH            # 对象统计
# count: 125                     # 松散对象数
# size: 1.2 MiB                  # 松散对象大小
# in-pack: 10432                 # 打包对象数
# packs: 3                       # Packfile 数量
# size-pack: 45.6 MiB            # Packfile 大小

git fsck                         # 完整性检查
git prune                        # 删除不可达的松散对象
git repack -a -d                 # 重新打包所有对象

# ═══ 自动维护 (Git 2.17+) ═══
git maintenance start            # 启动后台维护
# 自动执行:
# - hourly: prefetch (预取远程)
# - daily: loose-objects (打包松散对象)
# - weekly: pack-refs + incremental-repack

git maintenance run --task=gc    # 手动运行特定任务`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 Plumbing 底层命令</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> plumbing_commands.sh</div>
                <pre className="fs-code">{`# ═══ Porcelain vs Plumbing ═══
# Porcelain (瓷器): 用户友好的命令
#   git add / git commit / git push / git log
#
# Plumbing (管道): 底层命令, 用于脚本和工具开发
#   git hash-object / git cat-file / git update-index

# ═══ 手动创建一次提交 (纯 Plumbing) ═══

# Step 1: 创建 blob (存储文件内容)
echo "Hello Git Internals" | git hash-object -w --stdin
# → abc123... (返回 SHA-1, -w 表示写入数据库)

# Step 2: 创建 blob 文件
git hash-object -w src/main.js
# → def456...

# Step 3: 构建 tree (目录结构)
git update-index --add --cacheinfo 100644 abc123 README.md
git update-index --add --cacheinfo 100644 def456 src/main.js
git write-tree
# → tree_sha...

# Step 4: 创建 commit
echo "Initial commit" | git commit-tree tree_sha
# → commit_sha...

# Step 5: 更新分支引用
git update-ref refs/heads/main commit_sha

# → 这就是 git add + git commit 在底层做的事!

# ═══ 实用的 Plumbing 命令 ═══
# 对象操作:
git hash-object file.txt         # 计算 SHA-1 (不存储)
git hash-object -w file.txt      # 计算 + 存储到数据库
git cat-file -p <sha>            # 查看对象内容
git cat-file -t <sha>            # 查看对象类型
git cat-file -s <sha>            # 查看对象大小

# 索引 (暂存区) 操作:
git ls-files --stage             # 查看暂存区内容
git update-index --add file.txt  # 添加到暂存区
git write-tree                   # 将暂存区写成 tree 对象
git read-tree <tree-sha>         # 将 tree 读入暂存区

# 引用操作:
git update-ref refs/heads/main <sha>  # 更新引用
git symbolic-ref HEAD refs/heads/main  # 更新 HEAD

# ═══ 用 Plumbing 写自定义工具 ═══
# 例: 统计每个作者的代码行数
git log --format='%aN' --diff-filter=A --name-only |
  awk 'NF==1{author=$0;next} {print author, $0}' |
  while read author file; do
    lines=$(git show HEAD:"$file" 2>/dev/null | wc -l)
    echo "$author $lines $file"
  done | sort -k1,1 -k2,2nr

# 例: 找到从未被修改过的"远古代码"
git log --format='%H %ai' --diff-filter=M -- src/ |
  tail -1  # 最早的修改

# ═══ 构建 Git 别名 ═══
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.st "status -sb"
git config --global alias.co "checkout"
git config --global alias.br "branch -vv"
git config --global alias.unstage "restore --staged"
git config --global alias.last "log -1 HEAD --stat"
git config --global alias.visual '!gitk --all &'
# 使用: git lg / git st / git co / git br`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
