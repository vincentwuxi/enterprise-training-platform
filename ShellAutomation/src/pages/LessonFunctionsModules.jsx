import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['函数定义', '参数与返回值', '模块化 / source', '实战: 工具库'];

export default function LessonFunctionsModules() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_04 — 函数与模块化</div>
      <div className="fs-hero">
        <h1>函数与模块化：函数定义 / source / 库文件</h1>
        <p>
          函数是 Shell 脚本复用与组织代码的基本单元——
          <strong>函数参数</strong>通过位置变量传递，<strong>返回值</strong>需区分退出码与字符串输出。
          通过 <strong>source</strong> 引入外部库文件，构建可维护的<strong>模块化</strong>脚本体系。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 函数与模块化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 函数定义</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> functions.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 函数定义语法 ═══

# 方式 1: function 关键字 (Bash)
function greet {
    echo "Hello, $1!"
}

# 方式 2: POSIX 兼容 (推荐!)
greet() {
    echo "Hello, $1!"
}

# 调用
greet "Alice"    # → Hello, Alice!
greet "Bob"      # → Hello, Bob!

# ═══ 变量作用域 ═══

# 默认: 函数内变量是全局的! (陷阱!)
count=0
bad_function() {
    count=99       # 修改了全局变量!
    name="inner"   # 创建了全局变量!
}
bad_function
echo "$count"  # → 99 (被修改了!)
echo "$name"   # → inner (泄漏了!)

# 正确: 使用 local (仅在函数内有效)
good_function() {
    local count=99     # 局部变量!
    local name="inner" # 局部变量!
    echo "Inside: count=$count"
}
count=0
good_function
echo "Outside: count=$count"  # → 0 (未被修改)

# ═══ 最佳实践: 所有函数变量都用 local! ═══

process_file() {
    local file=$1
    local line_count
    local -r MAX_LINES=1000  # local + readonly
    
    line_count=$(wc -l < "$file")
    
    if (( line_count > MAX_LINES )); then
        echo "WARNING: $file has $line_count lines (> $MAX_LINES)"
        return 1
    fi
    
    echo "OK: $file ($line_count lines)"
    return 0
}

# ═══ 递归 ═══
factorial() {
    local n=$1
    if (( n <= 1 )); then
        echo 1
    else
        local sub
        sub=$(factorial $((n - 1)))
        echo $((n * sub))
    fi
}
echo "5! = $(factorial 5)"  # → 120

# 注意: Bash 递归深度受限 (~500-1000层)
# 深递归用循环替代!

# ═══ 函数列表与删除 ═══
declare -F              # 列出所有已定义函数
declare -f greet        # 查看函数定义
type greet              # 查看类型 (function/alias/builtin)
unset -f greet          # 删除函数`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 参数与返回值</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> params_return.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 函数参数 ═══

# 参数通过 $1, $2, ... 访问 (和脚本参数一样)
create_user() {
    local name=$1
    local email=$2
    local role=\${3:-viewer}  # 默认值!
    
    echo "Creating user: $name ($email) role=$role"
}
create_user "Alice" "alice@example.com" "admin"
create_user "Bob" "bob@example.com"  # role → viewer

# ═══ 返回值 (重要!) ═══

# 方式 1: return (退出码, 0-255)
# 只能返回数字! 0=成功, 非0=失败
is_valid_port() {
    local port=$1
    (( port >= 1 && port <= 65535 ))  # 自动设置退出码
}

if is_valid_port 8080; then
    echo "Valid port"
fi

# 方式 2: echo 输出 (命令替换捕获)
# 推荐: 返回字符串/复杂数据
get_timestamp() {
    date +"%Y-%m-%d %H:%M:%S"
}
ts=$(get_timestamp)
echo "Current time: $ts"

# 方式 3: 全局变量 (不推荐, 但有时必须)
parse_version() {
    local version=$1
    MAJOR=\${version%%.*}
    local rest=\${version#*.}
    MINOR=\${rest%%.*}
    PATCH=\${rest#*.}
}
parse_version "3.14.159"
echo "v$MAJOR.$MINOR.$PATCH"

# ═══ 错误处理模式 ═══

# 模式 1: 返回码 + 错误信息到 stderr
fetch_url() {
    local url=$1
    local response
    
    if ! response=$(curl -sf "$url" 2>/dev/null); then
        echo "ERROR: Failed to fetch $url" >&2  # stderr!
        return 1
    fi
    
    echo "$response"  # stdout → 给调用者
}

# 使用:
if result=$(fetch_url "https://api.example.com/data"); then
    echo "Got: $result"
else
    echo "Request failed" >&2
fi

# 模式 2: set -e + trap
handle_error() {
    local line=$1
    local cmd=$2
    echo "ERROR at line $line: $cmd" >&2
}
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# ═══ 参数校验 ═══
deploy() {
    local env=\${1:?'Usage: deploy <env> <version>'}
    local version=\${2:?'Usage: deploy <env> <version>'}
    
    case "$env" in
        dev|staging|prod) ;;
        *) echo "Invalid env: $env" >&2; return 1 ;;
    esac
    
    echo "Deploying $version to $env..."
}

# ═══ 可变参数 ═══
log() {
    local level=$1; shift  # shift: 移除第一个参数
    local message="$*"      # 剩余所有参数
    echo "[$(date +%H:%M:%S)] [$level] $message"
}
log "INFO" "Server started on port 8080"
log "ERROR" "Connection refused" "to" "database"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📂 模块化 / source</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> modules.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ source 引入外部文件 ═══

# source (或 .) 在当前 shell 中执行文件 (共享变量和函数!)
source ./lib/logging.sh
# 或等价:
. ./lib/logging.sh

# vs 执行子脚本:
./other_script.sh    # 子进程! 变量不共享
source ./other.sh    # 当前进程! 变量共享

# ═══ 项目目录结构 ═══
#
# my-project/
# ├── bin/
# │   ├── deploy.sh          # 主脚本
# │   ├── backup.sh
# │   └── monitor.sh
# ├── lib/
# │   ├── logging.sh         # 日志库
# │   ├── config.sh          # 配置加载
# │   ├── utils.sh           # 通用工具
# │   └── network.sh         # 网络工具
# ├── conf/
# │   ├── dev.env
# │   ├── staging.env
# │   └── prod.env
# └── tests/
#     └── test_utils.sh

# ═══ 可靠的 source 路径 ═══

# 脚本所在目录 (不依赖 pwd!)
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"

source "$LIB_DIR/logging.sh"
source "$LIB_DIR/config.sh"
source "$LIB_DIR/utils.sh"

# ═══ 防止重复 source (Include Guard) ═══
# lib/logging.sh:
[[ -n "$_LOGGING_SH_LOADED" ]] && return 0
_LOGGING_SH_LOADED=1

# ... 函数定义 ...
log_info()  { echo -e "\\033[32m[INFO]\\033[0m $*"; }
log_error() { echo -e "\\033[31m[ERROR]\\033[0m $*" >&2; }

# ═══ 配置文件加载 ═══
# conf/prod.env:
# DB_HOST=db.prod.example.com
# DB_PORT=5432
# DB_NAME=myapp
# REDIS_URL=redis://cache.prod:6379

load_config() {
    local env=\${1:-dev}
    local config_file="$SCRIPT_DIR/../conf/\${env}.env"
    
    if [[ ! -f "$config_file" ]]; then
        log_error "Config file not found: $config_file"
        return 1
    fi
    
    # 安全加载 (过滤危险内容)
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^[[:space:]]*# ]] && continue  # 跳过注释
        [[ -z "$key" ]] && continue                   # 跳过空行
        key=$(echo "$key" | tr -d '[:space:]')
        export "$key=$value"
    done < "$config_file"
    
    log_info "Loaded config: $config_file"
}

# ═══ 主脚本模板 ═══
# bin/deploy.sh:
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/logging.sh"
source "$SCRIPT_DIR/../lib/config.sh"
source "$SCRIPT_DIR/../lib/utils.sh"

main() {
    local env=\${1:-dev}
    log_info "Starting deployment to $env"
    load_config "$env"
    # ... deploy logic ...
    log_info "Deployment complete!"
}

# 只在直接执行时调用 main (被 source 时不执行!)
if [[ "\${BASH_SOURCE[0]}" == "\${0}" ]]; then
    main "$@"
fi`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛠️ 实战: 工具库</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> lib_utils.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 实战: 通用工具库 (lib/utils.sh) ═══
[[ -n "$_UTILS_SH_LOADED" ]] && return 0
_UTILS_SH_LOADED=1

# ─── 颜色定义 ───
readonly RED='\\033[0;31m'
readonly GREEN='\\033[0;32m'
readonly YELLOW='\\033[1;33m'
readonly BLUE='\\033[0;34m'
readonly NC='\\033[0m'

# ─── 日志函数 ───
_log() {
    local level=$1 color=$2; shift 2
    echo -e "\${color}[$(date +'%H:%M:%S')] [$level]\${NC} $*"
}
log_info()  { _log "INFO"  "$GREEN"  "$@"; }
log_warn()  { _log "WARN"  "$YELLOW" "$@"; }
log_error() { _log "ERROR" "$RED"    "$@" >&2; }
log_debug() { [[ "\${DEBUG:-0}" == "1" ]] && _log "DEBUG" "$BLUE" "$@"; }
die()       { log_error "$@"; exit 1; }

# ─── 确认提示 ───
confirm() {
    local prompt=\${1:-"Are you sure?"}
    local response
    read -rp "$prompt [y/N] " response
    [[ "$response" =~ ^[Yy]$ ]]
}

# ─── 重试机制 ───
retry() {
    local max_attempts=\${1:-3}
    local delay=\${2:-5}
    shift 2
    local attempt=1
    
    while (( attempt <= max_attempts )); do
        log_info "Attempt $attempt/$max_attempts: $*"
        if "$@"; then
            return 0
        fi
        log_warn "Failed, retrying in \${delay}s..."
        sleep "$delay"
        ((attempt++))
    done
    
    log_error "All $max_attempts attempts failed"
    return 1
}
# 使用: retry 3 5 curl -sf http://localhost:8080/health

# ─── 进度条 ───
progress_bar() {
    local current=$1 total=$2
    local percent=$(( current * 100 / total ))
    local filled=$(( percent / 2 ))
    local empty=$(( 50 - filled ))
    
    printf "\\r[%s%s] %d%%" \\
        "$(printf '#%.0s' $(seq 1 $filled 2>/dev/null))" \\
        "$(printf '.%.0s' $(seq 1 $empty 2>/dev/null))" \\
        "$percent"
    
    (( current == total )) && echo  # 换行
}

# ─── 检查依赖 ───
require_commands() {
    local missing=()
    for cmd in "$@"; do
        if ! command -v "$cmd" &>/dev/null; then
            missing+=("$cmd")
        fi
    done
    
    if (( \${#missing[@]} > 0 )); then
        die "Missing required commands: \${missing[*]}"
    fi
}
# 使用: require_commands curl jq docker kubectl

# ─── 锁文件 (防止并发) ───
LOCKFILE=""
acquire_lock() {
    LOCKFILE=\${1:-/tmp/$(basename "$0").lock}
    if ! mkdir "$LOCKFILE" 2>/dev/null; then
        local pid
        pid=$(cat "$LOCKFILE/pid" 2>/dev/null || echo "?")
        die "Another instance is running (PID: $pid)"
    fi
    echo $$ > "$LOCKFILE/pid"
    trap 'release_lock' EXIT
}

release_lock() {
    [[ -n "$LOCKFILE" ]] && rm -rf "$LOCKFILE"
}

# ─── 文件大小格式化 ───
human_size() {
    local bytes=$1
    if (( bytes >= 1073741824 )); then
        printf "%.1fG" "$(echo "$bytes / 1073741824" | bc -l)"
    elif (( bytes >= 1048576 )); then
        printf "%.1fM" "$(echo "$bytes / 1048576" | bc -l)"
    elif (( bytes >= 1024 )); then
        printf "%.1fK" "$(echo "$bytes / 1024" | bc -l)"
    else
        echo "\${bytes}B"
    fi
}

# ─── 计时器 ───
timer_start() { _TIMER_START=$SECONDS; }
timer_elapsed() {
    local elapsed=$(( SECONDS - _TIMER_START ))
    printf "%02d:%02d:%02d" $((elapsed/3600)) $((elapsed%3600/60)) $((elapsed%60))
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
