import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['变量与运算', '条件判断', '循环与数组', '字符串与 I/O'];

export default function LessonBashBasics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_01 — Bash 基础</div>
      <div className="fs-hero">
        <h1>Bash 基础：变量 / 运算 / 条件 / 循环</h1>
        <p>
          Bash 是 Linux/macOS 上最广泛使用的 Shell——
          掌握<strong>变量扩展</strong>、<strong>条件测试</strong>、<strong>循环控制</strong>和<strong>I/O 重定向</strong>
          是编写自动化脚本的起点。Shell 的强大在于它能将无数命令行工具"粘合"成高效的自动化管线。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 Bash 基础深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📌 变量与运算</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> variables.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ Shebang ═══
# #!/bin/bash      → 硬编码路径 (Linux 多用)
# #!/usr/bin/env bash → 环境查找 (移植性好, 推荐!)

# ═══ 变量赋值 ═══
name="Alice"        # 等号两边不能有空格!
readonly PI=3.14159 # 只读变量
unset name          # 删除变量

# ─── 变量引用 ───
echo "$name"        # 双引号: 变量展开 + 保留空格
echo '$name'        # 单引号: 原样输出 (不展开!)
echo "\${name}"       # 花括号: 明确变量边界
echo "\${name}World"  # → AliceWorld (无歧义)

# ─── 变量默认值 ───
\${var:-default}     # var 未设置或为空 → 用 default
\${var:=default}     # var 未设置或为空 → 赋值 default 并使用
\${var:+alternate}   # var 有值 → 用 alternate, 否则空
\${var:?error_msg}   # var 未设置 → 打印 error_msg 并退出!

# 实战:
DB_HOST=\${DB_HOST:-localhost}
DB_PORT=\${DB_PORT:-5432}
: \${REQUIRED_VAR:?"REQUIRED_VAR must be set!"}

# ─── 命令替换 ───
today=$(date +%Y-%m-%d)        # $() 推荐!
files=$(ls *.txt 2>/dev/null)  # 反引号 \`\` 也可以, 但不推荐

# ═══ 算术运算 ═══
a=10; b=3

# (( )) — 算术上下文 (推荐!)
result=$((a + b))      # 13
result=$((a * b))      # 30
result=$((a / b))      # 3  (整数除法!)
result=$((a % b))      # 1  (取模)
result=$((a ** 2))     # 100 (幂运算)

# (( )) 也用于自增:
((count++))
((total += price))

# let 命令:
let "result = a + b"

# bc — 浮点运算 (Bash 原生只支持整数!)
result=$(echo "scale=2; 10 / 3" | bc)  # 3.33
result=$(echo "scale=4; sqrt(2)" | bc -l)  # 1.4142

# ═══ 特殊变量 ═══
echo "$0"   # 脚本名
echo "$1"   # 第 1 个参数
echo "$#"   # 参数个数
echo "$@"   # 所有参数 (独立字符串, 推荐!)
echo "$*"   # 所有参数 (一个字符串)
echo "$?"   # 上一个命令的退出码 (0=成功)
echo "$$"   # 当前进程 PID
echo "$!"   # 最近一个后台进程 PID

# $@ vs $*:
# 参数: "hello world" "foo"
# "$@" → "hello world" "foo"  (2 个参数)
# "$*" → "hello world foo"    (1 个参数!)

# ═══ 环境变量 vs 局部变量 ═══
export MY_VAR="global"   # 环境变量 → 子进程可见
local_var="local"        # 局部变量 → 仅当前 shell`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 条件判断</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> conditions.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ test / [ ] / [[ ]] ═══

# [ ] = test 命令 (POSIX 兼容)
# [[ ]] = Bash 扩展 (更安全, 推荐!)

# ─── 字符串比较 ───
[[ "$str" == "hello" ]]    # 相等
[[ "$str" != "hello" ]]    # 不等
[[ "$str" == hello* ]]     # 通配符匹配 (注意: 不引用!)
[[ "$str" =~ ^[0-9]+$ ]]   # 正则匹配!
[[ -z "$str" ]]            # 为空
[[ -n "$str" ]]            # 非空

# ─── 数值比较 ───
[[ $a -eq $b ]]   # 等于 (equal)
[[ $a -ne $b ]]   # 不等于 (not equal)
[[ $a -gt $b ]]   # 大于 (greater than)
[[ $a -ge $b ]]   # 大于等于
[[ $a -lt $b ]]   # 小于 (less than)
[[ $a -le $b ]]   # 小于等于

# (( )) 更直观:
(( a > b ))        # 更像编程语言!
(( a >= 10 && a <= 100 ))

# ─── 文件测试 ───
[[ -f "$file" ]]   # 是普通文件
[[ -d "$dir" ]]    # 是目录
[[ -e "$path" ]]   # 存在
[[ -r "$file" ]]   # 可读
[[ -w "$file" ]]   # 可写
[[ -x "$file" ]]   # 可执行
[[ -s "$file" ]]   # 文件大小 > 0
[[ -L "$file" ]]   # 是符号链接
[[ "$f1" -nt "$f2" ]]  # f1 比 f2 新 (newer than)

# ─── 逻辑运算 ───
[[ $a -gt 5 && $a -lt 10 ]]   # AND
[[ $a -eq 1 || $a -eq 2 ]]    # OR
[[ ! -f "$file" ]]              # NOT

# ═══ if / elif / else ═══
if [[ -f "/etc/os-release" ]]; then
    source /etc/os-release
    echo "OS: $NAME $VERSION"
elif [[ "$(uname)" == "Darwin" ]]; then
    echo "macOS $(sw_vers -productVersion)"
else
    echo "Unknown OS"
fi

# ═══ case ═══ (比多个 elif 更清晰)
case "$1" in
    start)
        echo "Starting service..."
        ;;
    stop)
        echo "Stopping service..."
        ;;
    restart|reload)  # 多个匹配
        echo "Restarting..."
        ;;
    status)
        echo "Service is running"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

# ═══ 实战: 安全检查脚本 ═══
check_root() {
    if (( EUID != 0 )); then
        echo "ERROR: This script must be run as root" >&2
        exit 1
    fi
}

check_deps() {
    local deps=("curl" "jq" "docker")
    for cmd in "\${deps[@]}"; do
        if ! command -v "$cmd" &>/dev/null; then
            echo "ERROR: $cmd is required but not installed" >&2
            exit 1
        fi
    done
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 循环与数组</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> loops_arrays.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ for 循环 ═══

# 列表循环
for fruit in apple banana cherry; do
    echo "I like $fruit"
done

# C 风格循环
for ((i = 0; i < 10; i++)); do
    echo "Iteration: $i"
done

# 范围循环
for i in {1..5}; do echo "$i"; done         # 1 2 3 4 5
for i in {0..20..5}; do echo "$i"; done      # 0 5 10 15 20

# 遍历文件 (不要解析 ls 的输出!)
for file in /var/log/*.log; do
    [[ -f "$file" ]] || continue  # glob 不匹配时跳过
    echo "Processing: $file ($(wc -l < "$file") lines)"
done

# ═══ while / until ═══

# while: 条件为真时循环
count=0
while (( count < 5 )); do
    echo "Count: $count"
    ((count++))
done

# 读取文件每行 (正确方式!)
while IFS= read -r line; do
    echo "Line: $line"
done < /etc/hosts

# 读取命令输出
while IFS= read -r pid cmd; do
    echo "PID=$pid CMD=$cmd"
done < <(ps -eo pid,comm --no-headers)
# < <() 是 Process Substitution (进程替换)!

# until: 条件为假时循环 (等待条件变真)
until curl -sf http://localhost:8080/health; do
    echo "Waiting for service..."
    sleep 2
done
echo "Service is ready!"

# ═══ 循环控制 ═══
# break    → 跳出循环
# continue → 跳过当前迭代
# break 2  → 跳出两层循环

# ═══ 数组 ═══

# 索引数组
fruits=("apple" "banana" "cherry")
echo "\${fruits[0]}"       # apple (第一个元素)
echo "\${fruits[@]}"       # 所有元素
echo "\${#fruits[@]}"      # 数组长度 (3)
echo "\${fruits[@]:1:2}"   # 切片: banana cherry

# 追加
fruits+=("date" "elderberry")

# 遍历
for f in "\${fruits[@]}"; do
    echo "$f"
done

# 删除
unset 'fruits[1]'  # 删除索引 1 (但索引不会重排!)

# ═══ 关联数组 (Bash 4+) ═══
declare -A config
config[host]="localhost"
config[port]="5432"
config[db]="myapp"

# 遍历 key
for key in "\${!config[@]}"; do
    echo "$key = \${config[$key]}"
done

# ═══ 实战: 解析 CSV ═══
while IFS=',' read -r name email age; do
    echo "Name: $name, Email: $email, Age: $age"
done < <(tail -n +2 users.csv)  # 跳过表头`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 字符串与 I/O 重定向</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> strings_io.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 字符串操作 ═══

str="Hello, World!"

# 长度
echo "\${#str}"           # 13

# 子串
echo "\${str:7}"          # World!  (从位置7到末尾)
echo "\${str:7:5}"        # World   (从位置7取5个)

# 替换
echo "\${str/World/Bash}" # Hello, Bash!  (首次匹配)
echo "\${str//l/L}"       # HeLLo, WorLd! (全部替换)

# 删除 (模式匹配)
file="/home/user/docs/report.tar.gz"
echo "\${file##*/}"       # report.tar.gz (贪婪删前缀 → basename)
echo "\${file#*/}"        # home/user/docs/report.tar.gz
echo "\${file%%.*}"       # /home/user/docs/report (贪婪删后缀)
echo "\${file%.*}"        # /home/user/docs/report.tar

# 大小写转换 (Bash 4+)
echo "\${str^^}"          # HELLO, WORLD! (全大写)
echo "\${str,,}"          # hello, world! (全小写)
echo "\${str^}"           # Hello, World! (首字母大写)

# ═══ I/O 重定向 ═══

# 标准流:
# 0 = stdin  (标准输入)
# 1 = stdout (标准输出)
# 2 = stderr (标准错误)

cmd > file           # stdout → 文件 (覆盖)
cmd >> file          # stdout → 文件 (追加)
cmd 2> err.log       # stderr → 文件
cmd 2>&1             # stderr → stdout (合并)
cmd > file 2>&1      # stdout + stderr → 文件
cmd &> file          # 同上 (简写, Bash)
cmd > /dev/null 2>&1 # 丢弃所有输出

# 管道
cat access.log | grep "ERROR" | sort | uniq -c | sort -rn | head

# Here Document (多行输入)
cat <<EOF
Hello \${name},
Today is $(date +%A).
Your home is \$HOME.
EOF

# Here String
grep "error" <<< "$log_content"

# ═══ set 选项 (脚本安全!) ═══
set -e          # 命令失败立即退出 (不再执行后续!)
set -u          # 未定义变量报错 (防止 $TYPO 变空)
set -o pipefail # 管道中任何命令失败 → 整个管道失败
set -x          # 调试: 打印每条执行的命令

# 推荐在脚本开头:
set -euo pipefail

# ═══ 实战: 脚本模板 ═══
#!/usr/bin/env bash
set -euo pipefail

# 颜色
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'  # No Color

log_info()  { echo -e "\${GREEN}[INFO]\${NC} $*"; }
log_warn()  { echo -e "\${YELLOW}[WARN]\${NC} $*"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} $*" >&2; }

die() { log_error "$@"; exit 1; }

# 清理函数
cleanup() {
    rm -f "$TMPFILE"
    log_info "Cleaned up temporary files"
}
trap cleanup EXIT  # 脚本退出时自动清理

TMPFILE=$(mktemp)
log_info "Starting script..."
# ... your logic here`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
