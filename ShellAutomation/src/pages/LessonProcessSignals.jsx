import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['进程管理', 'trap 与信号', '子进程与管道', 'xargs 并行'];

export default function LessonProcessSignals() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_05 — 进程与信号</div>
      <div className="fs-hero">
        <h1>进程与信号：后台任务 / trap / 子进程 / xargs</h1>
        <p>
          理解 Linux 进程模型是系统编程的基础——
          <strong>后台任务</strong>实现并行执行，<strong>trap</strong> 捕获信号做优雅清理，
          <strong>子进程</strong>继承父进程环境但独立运行，
          <strong>xargs</strong> 配合 <code>-P</code> 实现高效并行批处理。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 进程与信号深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 进程管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> process.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 进程基础 ═══

# 查看进程
ps aux                              # 所有进程 (BSD 风格)
ps -ef                              # 所有进程 (System V 风格)
ps -eo pid,ppid,user,%cpu,%mem,cmd  # 自定义列
pstree -p                           # 进程树 + PID
top -bn1                            # 一次性快照
htop                                # 交互式 (推荐安装)

# ─── 后台任务 ───
sleep 60 &               # & 在后台运行
echo "PID: $!"           # $! = 最近后台进程 PID
jobs                      # 查看当前 shell 的后台任务
fg %1                    # 切到前台 (job 1)
bg %1                    # 切到后台 (job 1)
kill %1                  # 终止 job 1

# ─── nohup (终端关闭后继续运行) ───
nohup ./long_task.sh > output.log 2>&1 &
echo "Started PID: $!"

# ─── disown (更灵活) ───
./long_task.sh &
disown -h %1             # 从 shell 分离, 不受 HUP 影响

# ═══ wait — 等待后台任务 ═══

# 并行执行多个任务
task1() { sleep 2; echo "Task 1 done"; }
task2() { sleep 3; echo "Task 2 done"; }
task3() { sleep 1; echo "Task 3 done"; }

task1 &
pid1=$!
task2 &
pid2=$!
task3 &
pid3=$!

echo "Waiting for all tasks..."
wait $pid1 $pid2 $pid3   # 等待所有
echo "All tasks complete!"

# 带错误检查的 wait
pids=()
for i in {1..5}; do
    (sleep $((RANDOM % 5)); exit $((RANDOM % 2))) &
    pids+=($!)
done

failed=0
for pid in "\${pids[@]}"; do
    if ! wait "$pid"; then
        echo "Task $pid failed" >&2
        ((failed++))
    fi
done
echo "Failed: $failed / \${#pids[@]}"

# ═══ 进程通信 ═══

# 命名管道 (FIFO)
mkfifo /tmp/myfifo
echo "hello" > /tmp/myfifo &   # 写入 (阻塞直到有读者)
cat < /tmp/myfifo               # 读取
rm /tmp/myfifo

# ═══ kill 与信号 ═══
kill -l                  # 列出所有信号
kill $pid                # 发送 SIGTERM (15) — 请求终止
kill -9 $pid             # 发送 SIGKILL (9) — 强制杀死!
kill -0 $pid             # 检查进程是否存在 (不发信号)
killall nginx            # 按名称杀死进程
pkill -f "python app.py" # 按命令行模式杀死

# 常用信号:
# SIGHUP  (1)  — 终端挂断 / 重新加载配置
# SIGINT  (2)  — Ctrl+C
# SIGQUIT (3)  — Ctrl+\\ (生成 core dump)
# SIGTERM (15) — 正常终止请求 (默认 kill)
# SIGKILL (9)  — 强制杀死 (不可捕获!)
# SIGUSR1 (10) — 用户自定义
# SIGUSR2 (12) — 用户自定义
# SIGCHLD (17) — 子进程状态变更`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ trap 与信号处理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> trap.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ trap — 信号捕获 ═══
# trap 'commands' SIGNAL1 SIGNAL2 ...

# ─── 清理模式 (最常用!) ───
TMPDIR=$(mktemp -d)
LOGFILE=$(mktemp)

cleanup() {
    echo "Cleaning up..."
    rm -rf "$TMPDIR"
    rm -f "$LOGFILE"
    echo "Done."
}
trap cleanup EXIT    # 无论如何退出 (正常/错误/信号) 都执行!

# 脚本核心逻辑...
echo "Working in $TMPDIR"
# 如果这里出错退出, cleanup 仍会执行!

# ─── 优雅关闭 (服务脚本) ───
RUNNING=true
PID=0

start_service() {
    echo "Service starting..."
    while $RUNNING; do
        echo "[$(date)] Processing..."
        sleep 5
    done
    echo "Service stopped gracefully."
}

graceful_shutdown() {
    echo "Received shutdown signal..."
    RUNNING=false
    # 等待当前任务完成
    [[ $PID -ne 0 ]] && wait $PID
}

trap graceful_shutdown SIGTERM SIGINT
start_service &
PID=$!
wait $PID

# ─── 多信号处理 ───
trap 'echo "Caught SIGINT (Ctrl+C)"; exit 130' INT
trap 'echo "Caught SIGTERM"; exit 143' TERM
trap 'echo "Caught HUP, reloading config..."; load_config' HUP

# ─── 忽略信号 ───
trap '' INT   # 忽略 Ctrl+C (空命令!)

# ─── 恢复默认处理 ───
trap - INT    # 恢复 INT 的默认行为

# ═══ trap ERR — 错误捕获 ═══
set -euo pipefail

on_error() {
    local exit_code=$?
    local line_number=$1
    local command=$2
    echo "ERROR at line $line_number: '$command' exited with $exit_code" >&2
    
    # 可以发送告警
    # curl -X POST webhook_url -d "Script failed at line $line_number"
}
trap 'on_error $LINENO "$BASH_COMMAND"' ERR

# ═══ trap DEBUG — 调试跟踪 ═══
trap 'echo "+ $BASH_COMMAND" >&2' DEBUG
# 类似 set -x 但可编程

# ═══ 实战: 安全的临时文件管理 ═══
safely_edit() {
    local original=$1
    local tmpfile
    tmpfile=$(mktemp "\${original}.XXXXXX")
    
    trap 'rm -f "$tmpfile"' RETURN  # 函数返回时清理
    
    # 编辑临时文件
    cp "$original" "$tmpfile"
    sed -i 's/old/new/g' "$tmpfile"
    
    # 原子替换 (避免写入一半时断电!)
    mv "$tmpfile" "$original"
}

# ═══ 实战: 超时控制 ═══
run_with_timeout() {
    local timeout=$1; shift
    "$@" &
    local pid=$!
    
    (sleep "$timeout"; kill -TERM $pid 2>/dev/null) &
    local watchdog=$!
    
    if wait $pid 2>/dev/null; then
        kill $watchdog 2>/dev/null
        return 0
    else
        return 1
    fi
}
# 使用:
run_with_timeout 30 curl -sL https://slow-api.example.com`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 子进程与管道</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> subshell.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 子 Shell (Subshell) ═══

# ( ) — 在子 shell 中执行 (变量不影响父 shell!)
x=10
(
    x=20
    echo "Inside subshell: x=$x"  # 20
)
echo "Outside subshell: x=$x"     # 10 (未受影响!)

# 用途: 临时改变环境
(
    cd /tmp            # 只影响子 shell!
    export PATH="/custom:$PATH"
    ./some_command
)
# 这里 pwd 和 PATH 不变!

# ═══ 管道与子 shell 陷阱 ═══

# 管道中的每个命令都在子 shell 中执行!
count=0
echo "a b c" | while read -r word; do
    ((count++))   # 修改的是子 shell 的 count!
done
echo "count=$count"  # → 0! (父 shell 的 count 未变)

# 解决方案 1: Process Substitution
count=0
while read -r word; do
    ((count++))
done < <(echo "a b c")
echo "count=$count"  # → 3!

# 解决方案 2: Here String
count=0
while read -r word; do
    ((count++))
done <<< "a b c"
echo "count=$count"  # → 3!

# 解决方案 3: lastpipe (Bash 4.2+)
shopt -s lastpipe
count=0
echo "a b c" | while read -r word; do
    ((count++))
done
echo "count=$count"  # → 3! (最后的管道在当前 shell)

# ═══ 进程替换 (Process Substitution) ═══
# <(command) — 把命令输出当文件读
# >(command) — 把命令输入当文件写

# 比较两个命令的输出 (无需临时文件!)
diff <(sort file1) <(sort file2)

# 比较远程和本地文件
diff <(ssh remote "cat /etc/nginx/nginx.conf") /etc/nginx/nginx.conf

# 同时写多个目标
echo "log message" | tee >(logger -t myapp) >> /var/log/myapp.log

# ═══ coproc — 协同进程 (Bash 4+) ═══
coproc BC { bc -l; }

echo "3.14 * 2" >&"\${BC[1]}"    # 写入 bc
read -r result <&"\${BC[0]}"     # 读取结果
echo "Result: $result"           # → 6.28

kill "$BC_PID"

# ═══ PIPESTATUS — 管道各段的退出码 ═══
false | true | false
echo "\${PIPESTATUS[@]}"  # → 1 0 1

# 检查管道中是否有失败:
cmd1 | cmd2 | cmd3
if (( \${PIPESTATUS[0]} != 0 )); then
    echo "cmd1 failed!"
fi

# 或使用 set -o pipefail:
set -o pipefail
false | true   # → 整体退出码 = 1 (管道中有失败)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ xargs 并行处理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> xargs_parallel.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ xargs 深入 ═══

# ─── 基本用法 ───
echo "file1 file2 file3" | xargs rm       # 构建: rm file1 file2 file3
find . -name "*.tmp" | xargs rm -f        # 删除所有 .tmp

# ─── 安全处理空格和特殊字符 ───
find . -name "*.log" -print0 | xargs -0 rm -f
# -print0: 用 \\0 分隔 (不是换行!)
# -0:      xargs 按 \\0 分隔读入

# ─── 占位符 -I ───
find . -name "*.txt" | xargs -I{} cp {} {}.bak
# 等价于: cp file1.txt file1.txt.bak; cp file2.txt file2.txt.bak

echo "alice bob charlie" | tr ' ' '\\n' | xargs -I{} echo "Hello, {}!"

# ─── 限制参数数量 -n ───
echo {1..10} | xargs -n 3 echo
# echo 1 2 3
# echo 4 5 6
# echo 7 8 9
# echo 10

# ═══ 并行执行 -P ═══

# 串行下载 (慢!):
cat urls.txt | xargs -I{} curl -sLO {}

# 并行下载 (快!):
cat urls.txt | xargs -P 4 -I{} curl -sLO {}
# -P 4: 同时 4 个并行进程!

# ─── 并行压缩 ───
find /var/log -name "*.log" -print0 \\
    | xargs -0 -P "$(nproc)" -I{} gzip -9 {}
# -P $(nproc): 使用所有 CPU 核心

# ─── 并行 ping ───
echo "192.168.1."{1..254} | tr ' ' '\\n' \\
    | xargs -P 50 -I{} sh -c 'ping -c1 -W1 {} &>/dev/null && echo "{} UP"'

# ═══ GNU Parallel (更强大的替代!) ═══

# 安装: apt install parallel / brew install parallel

# 基本并行:
parallel gzip ::: *.log

# 从文件读取:
cat servers.txt | parallel -j 10 ssh {} 'df -h'

# 进度条:
parallel --bar --eta gzip ::: *.log

# 远程执行:
parallel --sshlogin server1,server2,server3 \\
    "uptime; df -h /" ::: dummy

# 替换占位符:
ls *.csv | parallel 'python process.py {} > {.}.json'
# {.} = 去扩展名, {/} = basename, {//} = dirname

# ═══ 实战: 批量操作 ═══

# 1. 批量检查 HTTPS 证书过期
cat domains.txt | xargs -P 10 -I{} sh -c '
    expiry=$(echo | openssl s_client -connect {}:443 2>/dev/null \\
        | openssl x509 -noout -enddate 2>/dev/null \\
        | cut -d= -f2)
    echo "{}: $expiry"
'

# 2. 批量 Docker 镜像清理
docker images --format '{{.ID}} {{.Repository}}:{{.Tag}}' \\
    | grep '<none>' \\
    | awk '{print $1}' \\
    | xargs -r docker rmi  # -r: 输入为空时不执行

# 3. 并行日志搜索 (比单进程 grep 快 N 倍)
find /var/log -name "*.log" -print0 \\
    | xargs -0 -P "$(nproc)" grep -l "OutOfMemoryError"

# 4. 批量数据库备份
mysql -e "SHOW DATABASES" -sN \\
    | grep -v information_schema \\
    | xargs -P 4 -I{} sh -c \\
        'mysqldump {} | gzip > /backup/{}_$(date +%Y%m%d).sql.gz'`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
