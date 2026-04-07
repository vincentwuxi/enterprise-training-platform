import React, { useState } from 'react';
import './LessonCommon.css';

export default function LessonBusinessDash() {
  const [tool, setTool] = useState('metabase');

  const tools = {
    metabase: {
      label: '🦔 Metabase',
      tagline: '开源免费，5分钟搭建 BI',
      code: `# Metabase 快速部署（Docker）
docker run -d -p 3000:3000 \\
  -v /my/data:/metabase-data \\
  -e MB_DB_FILE=/metabase-data/metabase.db \\
  --name metabase metabase/metabase

# 访问 http://localhost:3000 完成初始化配置
# 连接 PostgreSQL / MySQL / BigQuery / Snowflake

# ── Question Builder（无需 SQL）──────────────────
# 1. 选择数据源 → 2. 选择表 → 3. 添加过滤/分组 → 4. 选择图表类型

# ── 原生 SQL 查询 ────────────────────────────────
-- 在 SQL Editor 中使用变量
SELECT *
FROM orders
WHERE created_at >= {{start_date}}
  AND created_at <= {{end_date}}
  AND status = {{order_status}}
-- 双花括号变量自动变成 Dashboard Filter

# ── 定时推送 ─────────────────────────────────────
# Dashboard → Subscriptions → Email / Slack
# 每周一 9:00 自动推送数据周报`,
      features: [
        { icon: '🆓', t: '完全开源', d: '社区版免费，支持自托管' },
        { icon: '🤖', t: 'AI 助手', d: '自然语言转 SQL（v0.47+）' },
        { icon: '📧', t: '定时推送', d: 'Email/Slack 自动发送报告' },
        { icon: '🔒', t: '权限管理', d: '行级/列级数据访问控制' },
      ],
    },
    grafana: {
      label: '📊 Grafana',
      tagline: '运维监控 + 业务指标一体化',
      code: `# Grafana 快速部署
docker run -d -p 3001:3000 \\
  --name grafana grafana/grafana-oss

# 默认账密：admin / admin

# ── 连接数据源 ───────────────────────────────────
# Connections → Data Sources → 支持 50+ 数据源:
# PostgreSQL, MySQL, InfluxDB, Prometheus, 
# BigQuery, Elasticsearch, Loki, Tempo...

# ── 关键面板类型 ──────────────────────────────────
# Time Series  → 时序趋势（最强）
# Stat         → 单个大数字 KPI
# Bar Chart    → 分类对比
# Heatmap      → 热力图（留存/错误率）
# Gauge        → 进度/健康度

# ── PromQL 示例（配合 Prometheus）────────────────
# 过去5分钟 API 错误率
rate(http_requests_total{status=~"5.."}[5m])
/ rate(http_requests_total[5m])

# P99 延迟
histogram_quantile(0.99, 
  rate(http_request_duration_seconds_bucket[5m]))`,
      features: [
        { icon: '⚡', t: '实时监控', d: '秒级刷新，配合 Prometheus' },
        { icon: '🔔', t: '告警系统', d: '阈值告警，支持 PagerDuty' },
        { icon: '🔌', t: '插件生态', d: '1000+ 插件，地图/3D/桑基图' },
        { icon: '🎨', t: '主题定制', d: '完全自定义 Dashboard 样式' },
      ],
    },
    superset: {
      label: '🚀 Apache Superset',
      tagline: '企业级 BI，支持大规模数据',
      code: `# Superset Docker Compose 安装
git clone https://github.com/apache/superset.git
cd superset
docker compose -f docker-compose-non-dev.yml up -d

# 访问 http://localhost:8088
# 默认账密：admin / admin

# ── 连接数据源（SQLAlchemy URI）───────────────────
postgresql+psycopg2://user:pass@host/db
bigquery://project/dataset
trino://user@host:8080/catalog/schema

# ── 创建 Chart ───────────────────────────────────
# Charts → + Chart → 选择数据集 → 选择图表类型
# 支持 40+ 原生图表类型 + ECharts 扩展

# ── Jinja2 模板（SQL 动态参数）───────────────────
SELECT *
FROM orders
WHERE ds BETWEEN '{{ from_dttm }}' AND '{{ to_dttm }}'
  {% if filter_values('city') %}
  AND city IN ({{ "'" + "','".join(filter_values('city')) + "'" }})
  {% endif %}

# ── 行级安全 ─────────────────────────────────────
# Security → Row Level Security → 按角色过滤数据行`,
      features: [
        { icon: '🏢', t: '企业级', d: 'Airbnb/Twitter 生产使用' },
        { icon: '🗃️', t: '语义层', d: '定义指标、维度、计算字段' },
        { icon: '📐', t: '权限细粒', d: '数据集/图表/面板分级授权' },
        { icon: '🔍', t: 'SQL Lab', d: '完整的 SQL IDE + 查询历史' },
      ],
    },
  };

  const t = tools[tool];

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">📊 模块六</div>
        <h1>业务仪表盘 — Metabase + Grafana 实战</h1>
        <p>零代码搭建专业级数据仪表盘。从 Docker 部署到图表配置、权限管理、定时推送，让全公司都能用数据说话。</p>
      </div>

      <div className="da-goals">
        {[
          { icon: '🦔', title: 'Metabase', desc: '开源 BI，无需 SQL 快速建图表' },
          { icon: '📊', title: 'Grafana', desc: '运维+业务双栈，实时监控告警' },
          { icon: '🚀', title: 'Superset', desc: '企业级 BI，语义层+行级权限' },
          { icon: '🎨', title: '设计原则', desc: '仪表盘布局、配色、KPI 卡设计' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      {/* 工具对比选择器 */}
      <div className="da-sim">
        <div className="da-sim-title">🛠️ BI 工具实战对比</div>
        <div className="da-tab-bar">
          {Object.entries(tools).map(([k, v]) => (
            <button key={k} className={`da-tab${tool === k ? ' active' : ''}`} onClick={() => setTool(k)}>{v.label}</button>
          ))}
        </div>

        <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid var(--da-border)', borderRadius: '.75rem', padding: '.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--da-text)' }}>{t.label}</span>
          <span style={{ fontSize: '.8rem', color: 'var(--da-muted)' }}>{t.tagline}</span>
        </div>

        <div className="da-cards" style={{ marginBottom: '1rem' }}>
          {t.features.map(f => (
            <div className="da-card" key={f.t}>
              <div className="da-card-icon">{f.icon}</div>
              <h3>{f.t}</h3><p>{f.d}</p>
            </div>
          ))}
        </div>

        <div className="da-code">
          <div className="da-code-header"><span className="da-code-lang">Shell / SQL</span></div>
          <pre>{t.code}</pre>
        </div>
      </div>

      {/* 工具选型指南 */}
      <div className="da-section-title">🎯 如何选择 BI 工具</div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead><tr><th>场景</th><th>推荐工具</th><th>理由</th></tr></thead>
          <tbody>
            {[
              ['创业公司/快速验证', 'Metabase', '5分钟上线，非技术人员可用，免费'],
              ['运维监控 + 业务指标', 'Grafana', '时序数据最强，告警体系完整'],
              ['百人以上企业 BI', 'Superset', '权限控制细粒，语义层统一指标口径'],
              ['数据量 > 1亿行', 'Superset + Trino/ClickHouse', '原生支持列式数据库查询加速'],
              ['嵌入产品内部', 'Redash / Grafana Embed', '支持 iframe 嵌入，有公开分享链接'],
              ['付费可接受', 'Tableau / Looker / PowerBI', '最强可视化，但 $1000+/月/用户'],
            ].map(([sc, tool2, reason]) => (
              <tr key={sc}>
                <td style={{ color: 'var(--da-text)', fontWeight: 600 }}>{sc}</td>
                <td><span className="da-badge blue">{tool2}</span></td>
                <td style={{ color: 'var(--da-muted)', fontSize: '.82rem' }}>{reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dashboard设计原则 */}
      <div className="da-section-title">🎨 仪表盘设计黄金法则</div>
      <ol className="da-steps">
        {[
          { n: '01', h: '一个仪表盘一个主题', d: '不要把所有指标塞进一张 Dashboard，按受众分：运营日报 / 产品月报 / 管理层周报' },
          { n: '02', h: '顶部放核心 KPI 大数字', d: '用 Stat 面板展示最重要的 3-5 个数字，配上环比趋势箭头' },
          { n: '03', h: '颜色只有一个含义', d: '红色只代表"坏"，绿色只代表"好"。不要用颜色装饰，只用它传递信息' },
          { n: '04', h: '时间过滤器全局联动', d: '所有图表使用同一个时间选择器，避免不同图表时间范围不一致' },
          { n: '05', h: '写清楚这个数字代表什么', d: '每个图表加 Description，说明指标定义和数据来源，避免歧义' },
        ].map(s => (
          <li key={s.n}>
            <div className="da-step-num">{s.n}</div>
            <div className="da-step-body"><h4>{s.h}</h4><p>{s.d}</p></div>
          </li>
        ))}
      </ol>
    </div>
  );
}
