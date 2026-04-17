import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['系统监控', '日志管理', '备份与恢复', '定时任务'];

export default function LessonSystemScripts() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_06 — 系统管理脚本</div>
      <div className="fs-hero">
        <h1>系统管理脚本：监控 / 日志 / 备份 / 定时任务</h1>
        <p>
          系统管理是 Shell 脚本最核心的应用场景——
          <strong>监控脚本</strong>实时追踪 CPU/内存/磁盘，
          <strong>日志管理</strong>高效轮转与分析，
          <strong>备份策略</strong>结合增量与加密保护数据，
          <strong>cron</strong> 和 <strong>systemd timer</strong> 实现自动化调度。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 系统管理深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 系统监控</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> monitoring.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
set -euo pipefail

# ═══ CPU 监控 ═══
get_cpu_usage() {
    # /proc/stat 解析
    local idle prev_idle total prev_total
    read -r _ prev_user prev_nice prev_sys prev_idle _ < /proc/stat
    prev_total=$((prev_user + prev_nice + prev_sys + prev_idle))
    sleep 1
    read -r _ user nice sys idle _ < /proc/stat
    total=$((user + nice + sys + idle))
    
    local diff_idle=$((idle - prev_idle))
    local diff_total=$((total - prev_total))
    echo $(( (1000 * (diff_total - diff_idle) / diff_total + 5) / 10 ))
}
# 或简单版:
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}')

# ═══ 内存监控 ═══
get_memory_info() {
    local total used available percent
    read -r total used _ available <<< \\
        "$(free -m | awk '/^Mem:/ {print $2, $3, $6, $7}')"
    percent=$((used * 100 / total))
    echo "Memory: \${used}MB / \${total}MB (\${percent}%)"
}

# ═══ 磁盘监控 ═══
check_disk_usage() {
    local threshold=\${1:-85}
    local alert=false
    
    df -h --output=pcent,target | tail -n +2 | while read -r usage mount; do
        usage_num=\${usage%\%}
        if (( usage_num > threshold )); then
            echo "ALERT: $mount at \${usage} (threshold: \${threshold}%)"
            alert=true
        fi
    done
}

# ═══ 完整系统监控脚本 ═══
system_health_check() {
    local hostname=$(hostname)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local load=$(uptime | awk -F'average:' '{print $2}' | xargs)
    local cpu_percent=$(top -bn1 | grep "Cpu(s)" | awk '{printf "%.1f", 100-$8}')
    local mem_info=$(free -m | awk '/^Mem:/ {printf "%d/%dMB (%.1f%%)", $3, $2, $3/$2*100}')
    local disk_root=$(df -h / | awk 'NR==2 {print $5}')
    local tcp_conns=$(ss -tn state established | wc -l)
    local procs=$(ps aux | wc -l)
    
    cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  System Health Report
  Host: $hostname
  Time: $timestamp
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CPU Usage:    $cpu_percent%
  Load Average: $load
  Memory:       $mem_info
  Disk (root):  $disk_root
  TCP Conns:    $tcp_conns
  Processes:    $procs
━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

    # 告警检查
    local alerts=0
    (( $(echo "$cpu_percent > 80" | bc -l) )) && {
        echo "⚠️  CPU > 80%"; ((alerts++)); }
    [[ "\${disk_root%\%}" -gt 85 ]] && {
        echo "⚠️  Disk > 85%"; ((alerts++)); }
    
    if (( alerts > 0 )); then
        send_alert "$hostname" "$alerts alerts triggered"
    fi
}

send_alert() {
    local host=$1 msg=$2
    # Webhook (Slack/DingTalk/WeChat)
    curl -sX POST "https://hooks.slack.com/services/xxx" \\
        -H 'Content-Type: application/json' \\
        -d "{\\"text\\": \\"🚨 [$host] $msg\\"}" \\
        > /dev/null 2>&1 || true
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 日志管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> log_management.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ 日志轮转 (Log Rotation) ═══

# ─── 手动轮转脚本 ───
rotate_log() {
    local log_file=$1
    local max_files=\${2:-7}
    
    [[ ! -f "$log_file" ]] && return 0
    
    # 滚动: .7→删除, .6→.7, ..., .1→.2, 当前→.1
    for ((i = max_files - 1; i >= 1; i--)); do
        [[ -f "$log_file.$i.gz" ]] && mv "$log_file.$i.gz" "$log_file.$((i+1)).gz"
    done
    
    # 压缩当前日志
    cp "$log_file" "$log_file.1"
    gzip "$log_file.1"
    
    # 清空 (不删除, 保持 inode 不变!)
    > "$log_file"
    
    echo "Rotated: $log_file (keeping $max_files versions)"
}

# ─── logrotate 配置 (推荐!) ───
# /etc/logrotate.d/myapp:
# /var/log/myapp/*.log {
#     daily
#     rotate 30
#     compress
#     delaycompress
#     missingok
#     notifempty
#     create 644 www-data www-data
#     sharedscripts
#     postrotate
#         systemctl reload nginx > /dev/null 2>&1 || true
#     endscript
# }

# ═══ 日志分析脚本 ═══
analyze_nginx_log() {
    local log_file=\${1:-/var/log/nginx/access.log}
    
    echo "═══ Nginx Log Analysis ═══"
    echo "File: $log_file"
    echo "Total Requests: $(wc -l < "$log_file")"
    echo ""
    
    echo "─── Top 10 IPs ───"
    awk '{print $1}' "$log_file" | sort | uniq -c | sort -rn | head -10
    echo ""
    
    echo "─── Status Code Distribution ───"
    awk '{print $9}' "$log_file" | sort | uniq -c | sort -rn
    echo ""
    
    echo "─── Top 10 URLs ───"
    awk '{print $7}' "$log_file" | sort | uniq -c | sort -rn | head -10
    echo ""
    
    echo "─── Hourly Traffic ───"
    awk '{print substr($4, 14, 2)}' "$log_file" \\
        | sort | uniq -c | awk '{printf "%s:00  %s requests\\n", $2, $1}'
    echo ""
    
    echo "─── 4xx/5xx Errors ───"
    awk '$9 >= 400 {print $9, $7}' "$log_file" \\
        | sort | uniq -c | sort -rn | head -10
    echo ""
    
    echo "─── Slow Requests (> 1s) ───"
    awk '{
        time = $NF + 0
        if (time > 1.0) printf "  %.2fs %s %s\\n", time, $6, $7
    }' "$log_file" | sort -rn | head -10
}

# ═══ 实时日志监控 ═══
watch_errors() {
    local log_file=\${1:-/var/log/syslog}
    local pattern=\${2:-"error|fail|critical"}
    
    echo "Watching $log_file for [$pattern]..."
    tail -F "$log_file" 2>/dev/null \\
        | grep --line-buffered -iE "$pattern" \\
        | while IFS= read -r line; do
            echo "[$(date '+%H:%M:%S')] $line"
            # 可以在这里触发告警
        done
}

# ═══ journalctl (systemd 日志) ═══
# journalctl -u nginx          # 特定服务
# journalctl --since "1 hour ago"
# journalctl -f                # 实时跟踪
# journalctl -p err            # 只看错误
# journalctl --disk-usage      # 日志占用空间
# journalctl --vacuum-size=500M # 清理到 500MB`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💾 备份与恢复</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> backup.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
set -euo pipefail

# ═══ 完整备份脚本 ═══

BACKUP_DIR="/backup"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
HOSTNAME=$(hostname)

# ─── 文件备份 (tar) ───
backup_files() {
    local name=$1; shift
    local sources=("$@")
    local archive="$BACKUP_DIR/files/\${name}_\${DATE}.tar.gz"
    
    mkdir -p "$(dirname "$archive")"
    
    tar czf "$archive" \\
        --exclude='*.log' \\
        --exclude='node_modules' \\
        --exclude='.git' \\
        "\${sources[@]}"
    
    echo "Created: $archive ($(du -sh "$archive" | cut -f1))"
}
# backup_files "webapp" /var/www/html /etc/nginx

# ─── 增量备份 (rsync) ───
incremental_backup() {
    local source=$1
    local dest="$BACKUP_DIR/incremental/$DATE"
    local latest="$BACKUP_DIR/incremental/latest"
    
    mkdir -p "$dest"
    
    rsync -avz --delete \\
        --link-dest="$latest" \\
        "$source/" "$dest/"
    
    # 更新 latest 链接
    rm -f "$latest"
    ln -s "$dest" "$latest"
    
    echo "Incremental backup: $dest"
}
# 每日执行 → 只传输变化的文件 → 节省空间/时间!

# ─── 数据库备份 ───
backup_mysql() {
    local db=$1
    local archive="$BACKUP_DIR/db/\${db}_\${DATE}.sql.gz"
    
    mkdir -p "$(dirname "$archive")"
    
    mysqldump --single-transaction --routines --triggers \\
        --databases "$db" \\
        | gzip > "$archive"
    
    echo "MySQL dump: $archive ($(du -sh "$archive" | cut -f1))"
}

backup_postgres() {
    local db=$1
    local archive="$BACKUP_DIR/db/\${db}_\${DATE}.sql.gz"
    
    mkdir -p "$(dirname "$archive")"
    
    pg_dump -Fc "$db" > "$archive"
    
    echo "PG dump: $archive"
}

# ─── 备份到远程 (rsync over SSH) ───
sync_to_remote() {
    local remote_host=$1
    local remote_dir=$2
    
    rsync -avz --progress \\
        -e "ssh -o StrictHostKeyChecking=no" \\
        "$BACKUP_DIR/" \\
        "$remote_host:$remote_dir/"
    
    echo "Synced to $remote_host:$remote_dir"
}

# ─── 备份到 S3 ───
sync_to_s3() {
    local bucket=$1
    aws s3 sync "$BACKUP_DIR/" "s3://$bucket/\${HOSTNAME}/" \\
        --storage-class STANDARD_IA \\
        --exclude "*.tmp"
    echo "Synced to s3://$bucket"
}

# ─── 清理旧备份 ───
cleanup_old_backups() {
    local dir=$1
    local days=\${2:-$RETENTION_DAYS}
    
    local count
    count=$(find "$dir" -type f -mtime +$days | wc -l)
    
    if (( count > 0 )); then
        find "$dir" -type f -mtime +$days -delete
        echo "Cleaned $count files older than $days days"
    fi
}

# ─── 主流程 ───
main() {
    echo "═══ Backup Started: $(date) ═══"
    
    backup_files "configs" /etc/nginx /etc/systemd
    backup_mysql "production_db"
    incremental_backup /var/www/html
    sync_to_remote "backup-server" "/data/backups"
    cleanup_old_backups "$BACKUP_DIR" 30
    
    echo "═══ Backup Complete: $(date) ═══"
}

[[ "\${BASH_SOURCE[0]}" == "\${0}" ]] && main "$@"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⏰ 定时任务</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> cron.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ crontab 语法 ═══
#
# ┌───────── 分钟 (0-59)
# │ ┌─────── 小时 (0-23)
# │ │ ┌───── 日   (1-31)
# │ │ │ ┌─── 月   (1-12)
# │ │ │ │ ┌─ 星期 (0-7, 0和7都是周日)
# │ │ │ │ │
# * * * * * command

# ─── 常用示例 ───
# 每分钟
# * * * * * /path/to/script.sh

# 每 5 分钟
# */5 * * * * /path/to/script.sh

# 每天凌晨 2 点
# 0 2 * * * /path/to/backup.sh

# 每周一 9 点
# 0 9 * * 1 /path/to/weekly_report.sh

# 每月 1 号和 15 号
# 0 0 1,15 * * /path/to/semi_monthly.sh

# 工作日每天 9-18 点每小时
# 0 9-18 * * 1-5 /path/to/work_hours.sh

# ─── 管理 crontab ───
# crontab -e          # 编辑当前用户的 crontab
# crontab -l          # 列出当前用户的 crontab
# crontab -r          # 删除当前用户的 crontab (危险!)
# crontab -u www-data -l  # 查看其他用户的

# ═══ cron 最佳实践 ═══

# 1. 始终使用绝对路径
# 0 2 * * * /usr/local/bin/backup.sh

# 2. 重定向输出 (否则会发邮件!)
# 0 2 * * * /path/to/script.sh >> /var/log/cron-backup.log 2>&1

# 3. 使用 flock 防并发
# * * * * * flock -n /tmp/mylock /path/to/script.sh
# -n: 非阻塞, 如果锁已存在则跳过

# 4. 设置环境变量
# PATH=/usr/local/bin:/usr/bin:/bin
# SHELL=/bin/bash
# MAILTO=admin@example.com

# ═══ systemd timer (现代替代) ═══

# /etc/systemd/system/backup.service:
# [Unit]
# Description=Daily Backup
#
# [Service]
# Type=oneshot
# ExecStart=/path/to/backup.sh
# User=backup
# StandardOutput=journal
# StandardError=journal

# /etc/systemd/system/backup.timer:
# [Unit]
# Description=Daily Backup Timer
#
# [Timer]
# OnCalendar=*-*-* 02:00:00    # 每天 2 点
# # OnCalendar=Mon *-*-* 09:00  # 每周一 9 点
# # OnBootSec=5min               # 启动后 5 分钟
# # OnUnitActiveSec=1h           # 每小时
# Persistent=true                # 错过的任务补执行
# RandomizedDelaySec=300         # 随机延迟 (避免惊群)
#
# [Install]
# WantedBy=timers.target

# systemctl enable --now backup.timer
# systemctl list-timers --all
# journalctl -u backup.service

# ═══ systemd timer vs cron ═══
#
#              │ cron            │ systemd timer
# ─────────────┼─────────────────┼──────────────────
# 日志         │ 自行管理        │ journalctl 集成
# 依赖管理     │ 无              │ After/Requires
# 资源限制     │ 无              │ MemoryMax/CPUQuota
# 错过执行     │ 跳过            │ Persistent=true
# 随机延迟     │ 无              │ RandomizedDelaySec
# 用户级       │ crontab -e      │ ~/.config/systemd/
# 监控         │ 需要额外工具    │ systemctl status
# 推荐         │ 简单场景        │ 生产环境

# ═══ 实战: 完整的定时任务包装器 ═══
run_cron_job() {
    local job_name=$1; shift
    local lock_file="/tmp/cron_\${job_name}.lock"
    local log_file="/var/log/cron_\${job_name}.log"
    
    # 防并发
    exec 200>"$lock_file"
    if ! flock -n 200; then
        echo "[$job_name] Already running, skipping" >> "$log_file"
        return 0
    fi
    
    {
        echo "═══ [$job_name] Started: $(date) ═══"
        
        local start=$SECONDS
        if "$@"; then
            echo "[$job_name] SUCCESS ($(( SECONDS - start ))s)"
        else
            echo "[$job_name] FAILED (exit: $?)" >&2
            # send_alert "$job_name failed"
        fi
        
        echo "═══ [$job_name] Finished: $(date) ═══"
    } >> "$log_file" 2>&1
}

# crontab:
# 0 2 * * * /path/to/wrapper.sh run_cron_job "backup" backup.sh`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
