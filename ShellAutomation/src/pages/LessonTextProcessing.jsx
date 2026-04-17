import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['grep 搜索', 'sed 编辑', 'awk 编程', 'sort / uniq / cut'];

export default function LessonTextProcessing() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_02 — 文本处理</div>
      <div className="fs-hero">
        <h1>文本处理三剑客：grep / sed / awk</h1>
        <p>
          Linux 的核心哲学是"一切皆文本"——
          <strong>grep</strong> 用正则搜索匹配文本，<strong>sed</strong> 流式编辑替换文本，
          <strong>awk</strong> 按列处理结构化数据。
          配合 sort/uniq/cut/tr/xargs，这套工具链能处理绝大多数日志分析、数据清洗和运维自动化任务。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 文本处理深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 grep 搜索</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> grep.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ grep — Global Regular Expression Print ═══

# ─── 基本用法 ───
grep "error" /var/log/syslog          # 搜索包含 "error" 的行
grep -i "error" /var/log/syslog       # -i: 忽略大小写
grep -n "error" /var/log/syslog       # -n: 显示行号
grep -c "error" /var/log/syslog       # -c: 统计匹配行数
grep -l "error" /var/log/*.log        # -l: 只显示文件名
grep -r "TODO" --include="*.py" .     # -r: 递归搜索

# ─── 常用选项 ───
grep -v "debug" app.log               # -v: 反选 (不包含)
grep -w "error" app.log               # -w: 全字匹配 (不匹配 "errors")
grep -A 3 "Exception" app.log         # -A: 后 3 行 (After)
grep -B 2 "Exception" app.log         # -B: 前 2 行 (Before)
grep -C 5 "Exception" app.log         # -C: 前后 5 行 (Context)
grep -o "[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}" access.log  # -o: 只输出匹配部分

# ─── grep -E (扩展正则 = egrep) ───
grep -E "error|warning|fatal" app.log          # 多模式 OR
grep -E "^(GET|POST|PUT) /api" access.log      # 分组
grep -E "[0-9]{3,}" app.log                    # 3位以上数字

# ─── grep -P (Perl 正则, 最强!) ───
grep -P "\\d{4}-\\d{2}-\\d{2}" app.log           # \\d 数字
grep -oP '(?<=user=)[^&]+' query.log           # 零宽断言 (提取 user= 后的值)
grep -oP '"latency":\\s*\\K[\\d.]+' metrics.json  # \\K 重置匹配起点

# ═══ 实战: 日志分析 ═══

# 统计每小时的错误数
grep -oP "\\d{4}-\\d{2}-\\d{2}T\\d{2}" error.log \\
    | sort | uniq -c | sort -rn

# 找出响应时间超过 1s 的请求
grep -P '"duration":\\s*[1-9]\\d{3,}' access.json

# 提取所有唯一 IP
grep -oP '\\d+\\.\\d+\\.\\d+\\.\\d+' access.log | sort -u

# 连续 grep 过滤 (管道链)
cat access.log \\
    | grep "POST /api" \\
    | grep -v "health" \\
    | grep -E "\\b5[0-9]{2}\\b"  # 5xx 错误

# ═══ ripgrep (rg) — 现代替代 ═══
# 比 grep 快 10x+, 自动忽略 .gitignore
rg "TODO" --type py                    # 按文件类型
rg -g '!vendor' "error" .             # 排除目录
rg --json "pattern" file              # JSON 输出`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✏️ sed 编辑</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> sed.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ sed — Stream EDitor ═══
# 流式编辑器: 逐行读入 → 模式匹配 → 执行命令 → 输出

# ─── 替换 (s/old/new/) ───
sed 's/foo/bar/' file          # 首次匹配替换 (每行)
sed 's/foo/bar/g' file         # 全部替换
sed 's/foo/bar/gi' file        # 全部替换 + 忽略大小写
sed -i 's/foo/bar/g' file      # -i: 原地修改! (危险!)
sed -i.bak 's/foo/bar/g' file  # -i.bak: 备份后修改

# ─── 分隔符 ───
sed 's|/usr/local|/opt|g' file    # | 作分隔符 (路径含 /)
sed 's#http://#https://#g' file   # # 作分隔符

# ─── 定位行 ───
sed '5s/foo/bar/' file         # 只替换第 5 行
sed '1,10s/foo/bar/' file      # 替换 1-10 行
sed '/^#/s/foo/bar/' file      # 只替换注释行
sed '/start/,/end/s/a/b/g'    # 范围: 从 start 到 end

# ─── 删除 ───
sed '/^$/d' file               # 删除空行
sed '/^#/d' file               # 删除注释行
sed '1d' file                  # 删除第一行
sed '$d' file                  # 删除最后一行
sed '1,5d' file                # 删除 1-5 行

# ─── 插入 / 追加 ───
sed '3i\\New line before 3' file  # i: 在第3行前插入
sed '3a\\New line after 3' file   # a: 在第3行后追加
sed '$ a\\Last line' file         # 在文件末尾追加

# ─── 打印 ───
sed -n '10,20p' file           # 只打印 10-20 行 (-n 抑制默认输出)
sed -n '/error/p' file         # 只打印匹配行

# ═══ 高级: 捕获组 ═══
# 提取日期各部分并重新格式化
echo "2024-01-15" | sed -E 's/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3\\/\\2\\/\\1/'
# → 15/01/2024

# 给所有函数名加前缀
sed -E 's/^(function )([a-z_]+)/\\1prefix_\\2/' script.sh

# ═══ 多命令 ═══
sed -e 's/foo/bar/g' -e 's/baz/qux/g' file
# 或:
sed '
    s/foo/bar/g
    s/baz/qux/g
    /^#/d
' file

# ═══ 实战 ═══
# 修改 Nginx 配置 (替换端口)
sed -i 's/listen 80;/listen 8080;/' /etc/nginx/nginx.conf

# 批量重命名文件中的类名
find . -name "*.java" -exec sed -i 's/OldClass/NewClass/g' {} +

# 提取 JSON 中的值 (简单场景, 复杂用 jq)
sed -n 's/.*"name":\\s*"\\([^"]*\\)".*/\\1/p' data.json`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 awk 编程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> awk.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ awk — 列处理利器 ═══
# 结构: awk 'pattern { action }' file
# 默认按空格/Tab 分列: $1, $2, ..., $NF

# ─── 基本用法 ───
awk '{print $1}' file              # 打印第1列
awk '{print $1, $3}' file          # 打印第1和第3列
awk '{print $NF}' file             # 打印最后一列
awk '{print $(NF-1)}' file         # 打印倒数第2列
awk '{print NR, $0}' file          # 行号 + 整行

# ─── 分隔符 ───
awk -F':' '{print $1}' /etc/passwd             # 按 : 分割
awk -F'[,;]' '{print $1}' file                 # 按多个分隔符
awk -v OFS='\t' '{print $1, $2}' file          # 输出分隔符

# ─── 条件过滤 ───
awk '$3 > 100 {print $1, $3}' data             # 第3列 > 100
awk '/error/ {print}' log                      # 包含 error
awk '!/debug/ {print}' log                     # 不包含 debug
awk 'NR >= 10 && NR <= 20' file                # 第 10-20 行
awk '$1 == "Alice" {print $2}' data            # 第1列等于 Alice

# ═══ 内置变量 ═══
# NR    当前行号 (所有文件累计)
# NF    当前行的列数
# FS    输入字段分隔符
# OFS   输出字段分隔符
# FILENAME 当前文件名
# FNR   当前文件的行号

# ═══ BEGIN / END ═══
awk 'BEGIN {print "Name\\tScore"}
     {sum += $2; print $1 "\\t" $2}
     END {print "---\\nTotal:\\t" sum}' scores.txt

# ═══ 实战: 日志分析 ═══

# 统计每个 IP 的访问次数 (Top 10)
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head

# 等价的纯 awk:
awk '{ip[$1]++} END {for(i in ip) print ip[i], i}' access.log \\
    | sort -rn | head

# 计算平均响应时间
awk '{sum += $NF; cnt++} END {printf "Avg: %.2fms\\n", sum/cnt}' access.log

# 找出响应时间 > 1000ms 的请求
awk '$NF > 1000 {printf "SLOW %s %s %dms\\n", $1, $7, $NF}' access.log

# 按小时统计 4xx/5xx 错误
awk '$9 >= 400 {
    split($4, dt, ":");
    hour = dt[2];
    errors[hour]++;
}
END {
    for (h in errors)
        printf "%s:00 → %d errors\\n", h, errors[h]
}' access.log | sort

# ═══ awk 数组 (关联数组) ═══
# 统计每个 URL 的平均响应时间
awk '{
    url = $7;
    count[url]++;
    total[url] += $NF;
}
END {
    for (u in count)
        printf "%-40s avg=%.1fms (n=%d)\\n", u, total[u]/count[u], count[u]
}' access.log | sort -t= -k2 -rn | head -20

# ═══ awk 函数 ═══
awk '
function human_size(bytes) {
    if (bytes >= 1073741824) return sprintf("%.1fG", bytes/1073741824)
    if (bytes >= 1048576)    return sprintf("%.1fM", bytes/1048576)
    if (bytes >= 1024)       return sprintf("%.1fK", bytes/1024)
    return bytes "B"
}
{print $1, human_size($5)}
' du_output.txt`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛠️ sort / uniq / cut / tr / xargs</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> text_utils.sh</div>
                <pre className="fs-code">{`#!/usr/bin/env bash
# ═══ sort ═══
sort file                      # 字典序排序
sort -n file                   # 数值排序
sort -r file                   # 逆序
sort -k2 file                  # 按第2列排序
sort -k2,2n -k3,3nr file       # 第2列数值升序, 第3列数值降序
sort -t',' -k3 file            # 按逗号分隔的第3列排序
sort -u file                   # 排序 + 去重

# ═══ uniq ═══ (需先 sort!)
sort file | uniq               # 去重
sort file | uniq -c            # 统计每行出现次数
sort file | uniq -d            # 只显示重复行
sort file | uniq -u            # 只显示唯一行

# ═══ cut ═══
cut -d':' -f1 /etc/passwd      # 按 : 分割取第1列
cut -d',' -f2,4 data.csv       # 取第2和第4列
cut -c1-10 file                # 取每行前 10 个字符

# ═══ tr ═══ (字符级转换)
echo "Hello" | tr 'a-z' 'A-Z'          # 大写转换
echo "Hello" | tr -d 'aeiou'           # 删除元音
echo "a  b   c" | tr -s ' '           # 压缩空格 → "a b c"
tr '\\r' '\\n' < windows.txt > unix.txt  # Windows → Unix 换行

# ═══ paste ═══
paste file1 file2              # 并排拼接 (Tab 分隔)
paste -d',' file1 file2        # 按逗号拼接
paste -s file                  # 多行合并为一行

# ═══ xargs ═══ (构建命令行参数)
find . -name "*.log" | xargs rm           # 危险! 空格问题
find . -name "*.log" -print0 | xargs -0 rm  # 安全! (-0 空字符分隔)
find . -name "*.py" | xargs grep "import"
cat urls.txt | xargs -P 4 -I{} curl -sL {} -o /dev/null  # 并行下载

# xargs 选项:
# -n 3     每次传 3 个参数
# -P 4     4 个并行进程
# -I{}     用 {} 占位符
# -0       空字符分隔 (配合 -print0)

# ═══ 实战: 管道链组合 ═══

# 1. 统计项目代码行数 (按语言)
find . -type f \\( -name "*.py" -o -name "*.js" -o -name "*.go" \\) \\
    | while read -r f; do
        ext="\${f##*.}"
        lines=$(wc -l < "$f")
        echo "$ext $lines"
    done | awk '{lang[$1]+=$2} END {for(l in lang) print l, lang[l]}' \\
    | sort -k2 -rn

# 2. 实时监控日志 (新错误告警)
tail -F /var/log/app/error.log \\
    | grep --line-buffered "CRITICAL" \\
    | while IFS= read -r line; do
        echo "[$(date)] $line" | tee -a /tmp/alerts.log
        # curl -X POST webhook-url -d "$line"
    done

# 3. 分析 Nginx 日志: 找出被爬虫访问最多的 URL
awk '\$0 ~ /bot|crawler|spider/ {print \$7}' access.log \\
    | sort | uniq -c | sort -rn | head -20

# 4. CSV → JSON (简单转换)
head -1 data.csv | tr ',' '\\n' > /tmp/headers
tail -n +2 data.csv | while IFS=',' read -ra cols; do
    echo "{"
    paste -d: /tmp/headers <(printf '%s\\n' "\${cols[@]}") \\
        | sed 's/^/  "/; s/:/":/; s/$$/,/'
    echo "}"
done`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
