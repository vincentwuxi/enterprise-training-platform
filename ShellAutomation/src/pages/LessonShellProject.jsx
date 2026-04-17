import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['健康监控系统', '自动部署系统', 'CI/CD Pipeline', '项目工程化'];

export default function LessonShellProject() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_08 — 实战项目</div>
      <div className="fs-hero">
        <h1>实战项目：健康监控 + 自动部署 + CI/CD</h1>
        <p>
          将前七个模块的知识融会贯通——
          构建一个<strong>生产级服务器健康监控系统</strong>，
          实现一套<strong>零停机自动部署流水线</strong>，
          并编写完整的<strong>CI/CD Shell Pipeline</strong>。
          这些是真实运维场景中最常见、最有价值的自动化项目。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 实战项目</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 服务器健康监控系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> health_monitor.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
set -euo pipefail

# ═══ 服务器健康监控系统 ═══
# 功能:
#   → CPU / 内存 / 磁盘 / 网络 实时监控
#   → 服务存活检查
#   → 阈值告警 (Webhook / 邮件)
#   → HTML 报告生成
#   → 历史数据记录

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/utils.sh"

# ─── 配置 ───
readonly DATA_DIR="/var/lib/health-monitor"
readonly REPORT_DIR="/var/www/html/status"
readonly ALERT_WEBHOOK="\${ALERT_WEBHOOK:-}"
readonly HOSTNAME=$(hostname)

# 阈值
readonly CPU_WARN=70  CPU_CRIT=90
readonly MEM_WARN=80  MEM_CRIT=95
readonly DISK_WARN=80 DISK_CRIT=90
readonly LOAD_WARN=$(nproc)

mkdir -p "$DATA_DIR" "$REPORT_DIR"

# ─── 采集指标 ───
collect_cpu() {
    local idle prev_idle total prev_total
    read -r _ user nice sys idle rest < /proc/stat
    prev_total=$((user+nice+sys+idle))
    prev_idle=$idle
    sleep 1
    read -r _ user nice sys idle rest < /proc/stat
    total=$((user+nice+sys+idle))
    echo $(( (1000*(total-prev_total-(idle-prev_idle)) / (total-prev_total)+5) /10 ))
}

collect_memory() {
    awk '/^MemTotal:/ {total=$2}
         /^MemAvailable:/ {avail=$2}
         END {printf "%d", (total-avail)*100/total}' /proc/meminfo
}

collect_disk() {
    df -h --output=pcent,target | tail -n +2 | while read -r usage mount; do
        echo "\${usage%\%}|\${mount}"
    done
}

collect_load() {
    awk '{print $1}' /proc/loadavg
}

collect_network() {
    ss -tn state established | wc -l
}

# ─── 评估状态 ───
evaluate() {
    local value=$1 warn=$2 crit=$3
    if (( value >= crit )); then echo "CRITICAL"
    elif (( value >= warn )); then echo "WARNING"
    else echo "OK"
    fi
}

# ─── 服务检查 ───
check_services() {
    local services=("nginx" "mysql" "redis-server" "docker")
    local results=()
    
    for svc in "\${services[@]}"; do
        if systemctl is-active "$svc" &>/dev/null; then
            results+=("$svc:UP")
        else
            results+=("$svc:DOWN")
        fi
    done
    
    printf '%s\\n' "\${results[@]}"
}

# ─── HTTP 端点检查 ───
check_endpoints() {
    local endpoints=(
        "http://localhost:80|Website"
        "http://localhost:8080/api/health|API"
        "http://localhost:3000|Dashboard"
    )
    
    for entry in "\${endpoints[@]}"; do
        IFS='|' read -r url name <<< "$entry"
        local code
        code=$(curl -so /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo "000")
        
        if [[ "$code" == "200" ]]; then
            echo "$name:UP:$code"
        else
            echo "$name:DOWN:$code"
        fi
    done
}

# ─── 生成 HTML 报告 ───
generate_html_report() {
    local cpu=$1 mem=$2 load=$3 conns=$4
    local cpu_status=$(evaluate "$cpu" $CPU_WARN $CPU_CRIT)
    local mem_status=$(evaluate "$mem" $MEM_WARN $MEM_CRIT)
    
    cat > "$REPORT_DIR/index.html" <<HTML
<!DOCTYPE html>
<html><head><title>Server Status - $HOSTNAME</title>
<meta http-equiv="refresh" content="60">
<style>
body{font-family:monospace;background:#1a1a2e;color:#eee;padding:2rem}
.ok{color:#0f0}.warn{color:#ff0}.crit{color:#f00}
table{border-collapse:collapse;width:100%}
td,th{padding:8px;border:1px solid #333;text-align:left}
</style></head><body>
<h1>🖥️ $HOSTNAME Status</h1>
<p>Updated: $(date)</p>
<table>
<tr><th>Metric</th><th>Value</th><th>Status</th></tr>
<tr><td>CPU</td><td>\${cpu}%</td><td class="\${cpu_status,,}">$cpu_status</td></tr>
<tr><td>Memory</td><td>\${mem}%</td><td class="\${mem_status,,}">$mem_status</td></tr>
<tr><td>Load</td><td>$load</td><td>-</td></tr>
<tr><td>TCP Conns</td><td>$conns</td><td>-</td></tr>
</table>
</body></html>
HTML
}

# ─── 主循环 ───
main() {
    log_info "Health Monitor started on $HOSTNAME"
    
    local cpu mem load conns
    cpu=$(collect_cpu)
    mem=$(collect_memory)
    load=$(collect_load)
    conns=$(collect_network)
    
    # 记录历史
    echo "$(date +%s),$cpu,$mem,$load,$conns" >> "$DATA_DIR/metrics.csv"
    
    # 生成报告
    generate_html_report "$cpu" "$mem" "$load" "$conns"
    
    # 告警
    local cpu_status=$(evaluate "$cpu" $CPU_WARN $CPU_CRIT)
    [[ "$cpu_status" != "OK" ]] && send_alert "CPU $cpu_status: \${cpu}%"
    
    log_info "CPU=\${cpu}% MEM=\${mem}% Load=$load Conns=$conns"
}

[[ "\${BASH_SOURCE[0]}" == "\${0}" ]] && main "$@"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 自动部署系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> auto_deploy.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
set -euo pipefail

# ═══ 零停机自动部署系统 ═══
# 功能:
#   → 蓝/绿部署 (Blue-Green)
#   → 自动回滚
#   → 健康检查
#   → 版本管理
#   → 部署日志

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/utils.sh"

readonly APP_NAME="myapp"
readonly DEPLOY_DIR="/opt/\${APP_NAME}"
readonly RELEASES_DIR="$DEPLOY_DIR/releases"
readonly CURRENT_LINK="$DEPLOY_DIR/current"
readonly SHARED_DIR="$DEPLOY_DIR/shared"
readonly KEEP_RELEASES=5
readonly HEALTH_URL="http://localhost:8080/health"
readonly HEALTH_TIMEOUT=60

# ─── 部署前准备 ───
prepare() {
    local version=$1
    local release_dir="$RELEASES_DIR/$version"
    
    log_info "Preparing release $version..."
    
    mkdir -p "$release_dir"
    mkdir -p "$SHARED_DIR"/{logs,tmp,uploads}
    
    # 下载构建产物
    if [[ -f "$DEPLOY_DIR/artifacts/\${APP_NAME}-\${version}.tar.gz" ]]; then
        tar xzf "$DEPLOY_DIR/artifacts/\${APP_NAME}-\${version}.tar.gz" -C "$release_dir"
    else
        die "Artifact not found: \${APP_NAME}-\${version}.tar.gz"
    fi
    
    # 链接共享目录
    ln -sfn "$SHARED_DIR/logs" "$release_dir/logs"
    ln -sfn "$SHARED_DIR/uploads" "$release_dir/uploads"
    
    # 复制环境配置
    cp "$SHARED_DIR/.env" "$release_dir/.env" 2>/dev/null || true
    
    log_info "Release prepared: $release_dir"
}

# ─── 切换版本 (原子操作!) ───
switch_release() {
    local version=$1
    local release_dir="$RELEASES_DIR/$version"
    
    if [[ ! -d "$release_dir" ]]; then
        die "Release not found: $release_dir"
    fi
    
    # 原子切换! (ln -sfn 是原子操作)
    local tmp_link="$DEPLOY_DIR/.current_tmp"
    ln -sfn "$release_dir" "$tmp_link"
    mv -Tf "$tmp_link" "$CURRENT_LINK"
    
    log_info "Switched to: $version"
}

# ─── 健康检查 ───
health_check() {
    local timeout=\${1:-$HEALTH_TIMEOUT}
    local elapsed=0
    
    log_info "Waiting for health check (timeout: \${timeout}s)..."
    
    while (( elapsed < timeout )); do
        if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
            log_info "Health check passed! (\${elapsed}s)"
            return 0
        fi
        sleep 2
        ((elapsed += 2))
    done
    
    log_error "Health check failed after \${timeout}s"
    return 1
}

# ─── 回滚 ───
rollback() {
    local prev_version
    prev_version=$(ls -t "$RELEASES_DIR" | sed -n '2p')
    
    if [[ -z "$prev_version" ]]; then
        die "No previous release to rollback to!"
    fi
    
    log_warn "Rolling back to $prev_version..."
    switch_release "$prev_version"
    systemctl restart "$APP_NAME"
    
    if health_check; then
        log_info "Rollback successful: $prev_version"
    else
        die "Rollback also failed! Manual intervention required."
    fi
}

# ─── 清理旧版本 ───
cleanup_releases() {
    local keep=\${1:-$KEEP_RELEASES}
    local releases
    releases=$(ls -t "$RELEASES_DIR" | tail -n +$((keep + 1)))
    
    for rel in $releases; do
        log_info "Removing old release: $rel"
        rm -rf "$RELEASES_DIR/$rel"
    done
}

# ─── 主部署流程 ───
deploy() {
    local version=\${1:?'Usage: deploy.sh <version>'}
    
    log_info "═══ Deploying $APP_NAME v$version ═══"
    timer_start
    
    # 1. 准备
    prepare "$version"
    
    # 2. 切换
    switch_release "$version"
    
    # 3. 重启服务
    systemctl restart "$APP_NAME"
    
    # 4. 健康检查
    if ! health_check; then
        log_error "Deployment failed, rolling back..."
        rollback
        exit 1
    fi
    
    # 5. 清理
    cleanup_releases
    
    log_info "═══ Deploy SUCCESS: v$version ($(timer_elapsed)) ═══"
    
    # 记录部署日志
    echo "$(date +%s)|$version|SUCCESS|$(timer_elapsed)" >> "$DEPLOY_DIR/deploy.log"
}

[[ "\${BASH_SOURCE[0]}" == "\${0}" ]] && deploy "$@"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 CI/CD Pipeline</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> ci_pipeline.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
set -euo pipefail

# ═══ Shell CI/CD Pipeline ═══
# 功能:
#   → 代码检出 → 依赖安装 → 构建 → 测试 → 打包 → 部署

source "$(dirname "\${BASH_SOURCE[0]}")/lib/utils.sh"

readonly WORKSPACE="\${WORKSPACE:-$(pwd)}"
readonly BUILD_DIR="$WORKSPACE/build"
readonly ARTIFACT_DIR="$WORKSPACE/artifacts"

# ─── Stage 1: 准备 ───
stage_prepare() {
    log_info "━━━ Stage: Prepare ━━━"
    
    require_commands git docker node npm
    
    mkdir -p "$BUILD_DIR" "$ARTIFACT_DIR"
    
    # 获取版本信息
    GIT_COMMIT=$(git rev-parse --short HEAD)
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    VERSION=$(git describe --tags --always 2>/dev/null || echo "0.0.0-$GIT_COMMIT")
    
    log_info "Branch: $GIT_BRANCH, Commit: $GIT_COMMIT, Version: $VERSION"
}

# ─── Stage 2: 依赖安装 ───
stage_install() {
    log_info "━━━ Stage: Install ━━━"
    
    if [[ -f "package-lock.json" ]]; then
        npm ci --prefer-offline    # 使用 lock 文件精确安装
    elif [[ -f "pom.xml" ]]; then
        ./mvnw dependency:go-offline -B
    elif [[ -f "go.mod" ]]; then
        go mod download
    fi
}

# ─── Stage 3: 代码检查 ───
stage_lint() {
    log_info "━━━ Stage: Lint ━━━"
    
    local failed=0
    
    # Shell 脚本检查
    if command -v shellcheck &>/dev/null; then
        find . -name "*.sh" -not -path "./node_modules/*" \\
            | xargs -r shellcheck --severity=warning || ((failed++))
    fi
    
    # JavaScript/TypeScript
    if [[ -f ".eslintrc.js" ]] || [[ -f ".eslintrc.json" ]]; then
        npx eslint . --max-warnings=0 || ((failed++))
    fi
    
    (( failed > 0 )) && die "Lint failed with $failed issue(s)"
    log_info "Lint passed ✓"
}

# ─── Stage 4: 测试 ───
stage_test() {
    log_info "━━━ Stage: Test ━━━"
    
    if [[ -f "package.json" ]]; then
        npm test -- --coverage --ci 2>&1 | tee "$BUILD_DIR/test-results.txt"
    elif [[ -f "pom.xml" ]]; then
        ./mvnw test -B 2>&1 | tee "$BUILD_DIR/test-results.txt"
    fi
    
    log_info "Tests passed ✓"
}

# ─── Stage 5: 构建 ───
stage_build() {
    log_info "━━━ Stage: Build ━━━"
    
    if [[ -f "Dockerfile" ]]; then
        local image_tag="registry.example.com/myapp:$VERSION"
        
        docker build \\
            --build-arg VERSION="$VERSION" \\
            --build-arg COMMIT="$GIT_COMMIT" \\
            -t "$image_tag" \\
            -t "registry.example.com/myapp:latest" \\
            .
        
        # 保存镜像信息
        echo "$image_tag" > "$ARTIFACT_DIR/image_tag.txt"
        log_info "Built Docker image: $image_tag"
    elif [[ -f "package.json" ]]; then
        npm run build
        tar czf "$ARTIFACT_DIR/app-\${VERSION}.tar.gz" -C dist .
    fi
}

# ─── Stage 6: 推送 ───
stage_push() {
    log_info "━━━ Stage: Push ━━━"
    
    if [[ -f "$ARTIFACT_DIR/image_tag.txt" ]]; then
        local tag
        tag=$(cat "$ARTIFACT_DIR/image_tag.txt")
        docker push "$tag"
        docker push "registry.example.com/myapp:latest"
        log_info "Pushed: $tag"
    fi
}

# ─── Stage 7: 部署 ───
stage_deploy() {
    local env=\${1:-staging}
    log_info "━━━ Stage: Deploy to $env ━━━"
    
    case "$env" in
        staging)
            ssh deploy@staging "cd /opt/myapp && ./deploy.sh $VERSION"
            ;;
        production)
            if [[ "$GIT_BRANCH" != "main" ]]; then
                die "Can only deploy main to production!"
            fi
            confirm "Deploy $VERSION to PRODUCTION?" || die "Aborted"
            ssh deploy@prod "cd /opt/myapp && ./deploy.sh $VERSION"
            ;;
    esac
}

# ─── Pipeline 主入口 ───
run_pipeline() {
    local start_time=$SECONDS
    local stage_name=""
    
    trap 'log_error "Pipeline FAILED at stage: $stage_name"' ERR
    
    for stage in prepare install lint test build push; do
        stage_name=$stage
        timer_start
        "stage_$stage"
        log_info "Stage $stage completed ($(timer_elapsed))"
    done
    
    local total=$(( SECONDS - start_time ))
    log_info "═══ Pipeline SUCCESS (total: \${total}s) ═══"
}

[[ "\${BASH_SOURCE[0]}" == "\${0}" ]] && run_pipeline "$@"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏭 项目工程化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> engineering.txt</div>
                <pre className="fs-code">{`═══ Shell 项目最佳实践 ═══

─── 1. 项目结构 ───
ops-toolkit/
├── bin/                    # 可执行脚本
│   ├── deploy.sh
│   ├── backup.sh
│   ├── monitor.sh
│   └── ci-pipeline.sh
├── lib/                    # 共享库函数
│   ├── utils.sh
│   ├── logging.sh
│   ├── config.sh
│   └── network.sh
├── conf/                   # 配置文件
│   ├── dev.env
│   ├── staging.env
│   └── prod.env
├── templates/              # 模板文件
│   ├── nginx.conf.tpl
│   └── systemd.service.tpl
├── tests/                  # 测试
│   ├── test_utils.sh
│   └── test_deploy.sh
├── docs/                   # 文档
│   └── README.md
├── Makefile                # 任务入口
└── .shellcheckrc           # ShellCheck 配置

─── 2. Makefile (统一入口) ───
.PHONY: help lint test deploy

help:            ## Show help
    @grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \\
        | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\\n", $$1, $$2}'

lint:            ## Run shellcheck
    find bin/ lib/ -name "*.sh" | xargs shellcheck -x

test:            ## Run tests
    bash tests/test_utils.sh
    bash tests/test_deploy.sh

deploy-staging:  ## Deploy to staging
    bash bin/deploy.sh staging

deploy-prod:     ## Deploy to production
    bash bin/deploy.sh production

─── 3. 测试框架 ───
# 简单断言函数:
assert_equals() {
    local expected=$1 actual=$2 msg=\${3:-""}
    if [[ "$expected" == "$actual" ]]; then
        echo "  ✅ PASS: $msg"
    else
        echo "  ❌ FAIL: $msg (expected: $expected, got: $actual)"
        FAILURES=$((FAILURES + 1))
    fi
}

# 或使用 bats 框架:
# brew install bats-core
# tests/test_utils.bats:
# @test "human_size formats bytes" {
#     source lib/utils.sh
#     run human_size 1048576
#     [ "$output" = "1.0M" ]
# }

─── 4. ShellCheck ───
# .shellcheckrc:
disable=SC2034   # 允许未使用的变量
source-path=lib  # source 搜索路径

# CI 集成:
shellcheck -x -S warning bin/*.sh lib/*.sh

# 常见错误:
# SC2086: 变量未加引号 (Double quote to prevent globbing)
# SC2046: 命令替换未加引号
# SC2155: local 和赋值分开 (Declare and assign separately)
# SC2004: 不需要 $ 在 (( )) 中

─── 5. 文档 ───
# 每个脚本开头:
#!/usr/bin/env bash
#
# deploy.sh — Zero-downtime deployment script
#
# Usage:
#   deploy.sh <version> [environment]
#
# Arguments:
#   version      Release version (e.g., 1.2.3)
#   environment  Target env: staging|production (default: staging)
#
# Environment Variables:
#   DEPLOY_DIR   Base deployment directory (/opt/myapp)
#   HEALTH_URL   Health check endpoint
#
# Examples:
#   deploy.sh 1.2.3
#   deploy.sh 1.2.3 production
#

─── 6. 安全清单 ───
□ set -euo pipefail 在所有脚本开头
□ 所有变量用双引号: "$var"
□ 用 mktemp 创建临时文件 (不用 /tmp/fixed_name)
□ trap cleanup EXIT 清理临时资源
□ 敏感信息不硬编码 (用环境变量)
□ ShellCheck 通过 (无 warning)
□ 输入参数校验 (防注入!)
□ 破坏性操作前确认 (confirm)
□ 日志记录审计轨迹
□ 使用 flock 防止并发执行`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
