import React, { useState } from 'react';
import './LessonCommon.css';

const TOPICS = [
  {
    id: 'series-df',
    label: 'Series & DataFrame',
    code: `import pandas as pd
import numpy as np

# ── 创建 DataFrame ──────────────────────────────
data = {
    'name':   ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'dept':   ['Engineering', 'Marketing', 'Engineering', 'HR', 'Marketing'],
    'salary': [12000, 8500, 15000, 9000, 9500],
    'years':  [3, 5, 7, 2, 4],
}
df = pd.DataFrame(data)

# ── 基础查看 ────────────────────────────────────
print(df.dtypes)          # 列类型
print(df.describe())      # 统计摘要
print(df.shape)           # (5, 4)

# ── 列操作 ──────────────────────────────────────
df['monthly'] = df['salary']          # 新增列
df['annual']  = df['salary'] * 12     # 计算列
df.drop('monthly', axis=1, inplace=True)

# ── 索引选择 ─────────────────────────────────────
df.iloc[0]                 # 按位置
df.loc[df['dept']=='Engineering']   # 按条件`,
    output: `   name          dept  salary  years  annual
0  Alice   Engineering   12000      3  144000
1    Bob     Marketing    8500      5  102000
2  Charlie  Engineering   15000      7  180000
3  Diana          HR     9000      2  108000
4  Eve       Marketing    9500      4  114000`,
    points: ['iloc/loc 区别是位置 vs 标签', '惰性求值：链式操作不会立即执行', 'df.copy() 避免 SettingWithCopyWarning'],
  },
  {
    id: 'clean',
    label: '数据清洗',
    code: `# ── 缺失值处理 ─────────────────────────────────
df.isnull().sum()              # 各列缺失数
df.dropna(subset=['salary'])   # 删除关键列缺失行
df['age'].fillna(df['age'].median(), inplace=True)

# ── 重复值 ──────────────────────────────────────
df.duplicated().sum()
df.drop_duplicates(subset=['email'], keep='last', inplace=True)

# ── 类型转换 ─────────────────────────────────────
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
df['category'] = df['category'].astype('category')

# ── 字符串清洗 ───────────────────────────────────
df['name'] = df['name'].str.strip().str.title()
df['phone'] = df['phone'].str.replace(r'[^0-9]', '', regex=True)

# ── 异常值检测（IQR法）───────────────────────────
Q1, Q3 = df['salary'].quantile([0.25, 0.75])
IQR = Q3 - Q1
mask = (df['salary'] >= Q1 - 1.5*IQR) & (df['salary'] <= Q3 + 1.5*IQR)
df_clean = df[mask]
print(f"清洗前: {len(df)} 行, 清洗后: {len(df_clean)} 行")`,
    output: `缺失值统计:
name      0
salary    2
age       5
date      1

重复行: 3 条
清洗前: 1000 行, 清洗后: 952 行`,
    points: ['IQR 法适合正态分布，Z-Score 适合大样本', 'category 类型节省 90% 内存', 'regex=True 处理复杂字符串'],
  },
  {
    id: 'groupby',
    label: 'GroupBy 分组',
    code: `# ── 基础分组聚合 ────────────────────────────────
summary = df.groupby('dept').agg(
    head_count=('name', 'count'),
    avg_salary=('salary', 'mean'),
    max_salary=('salary', 'max'),
    total_cost=('salary', 'sum'),
).round(0)

# ── 多层分组 ─────────────────────────────────────
df.groupby(['dept', 'level'])['salary'].mean().unstack()

# ── Transform：保留原始行数 ──────────────────────
df['dept_avg'] = df.groupby('dept')['salary'].transform('mean')
df['vs_avg'] = df['salary'] - df['dept_avg']   # 与部门均值差距

# ── Apply 自定义聚合 ──────────────────────────────
def salary_band(series):
    q25, q75 = series.quantile([0.25, 0.75])
    return pd.Series({'p25': q25, 'p75': q75, 'iqr': q75 - q25})

df.groupby('dept')['salary'].apply(salary_band)`,
    output: `              head_count  avg_salary  max_salary  total_cost
dept                                                        
Engineering            8     13500.0       20000.0   108000.0
HR                     4      9200.0       11000.0    36800.0
Marketing              6      8800.0       12000.0    52800.0`,
    points: ['transform 保留索引，agg 压缩成一行', 'unstack 把分组级别变成列（透视效果）', 'groupby 是懒加载，不耗内存直到调用 agg'],
  },
  {
    id: 'merge',
    label: '多表合并',
    code: `# ── merge / join ────────────────────────────────
orders   = pd.read_csv('orders.csv')    # order_id, user_id, amount
users    = pd.read_csv('users.csv')     # user_id, name, city
products = pd.read_csv('products.csv')  # product_id, category, price

# INNER JOIN
df = pd.merge(orders, users, on='user_id', how='inner')

# LEFT JOIN（保留所有订单，即使用户已注销）
df = pd.merge(orders, users, on='user_id', how='left')

# 多键合并
df = pd.merge(orders, products,
              left_on='product_id', right_on='id', how='left')

# ── concat 纵向拼接 ──────────────────────────────
monthly = pd.concat([jan_df, feb_df, mar_df], ignore_index=True)

# ── pivot_table 透视表 ───────────────────────────
pivot = df.pivot_table(
    values='amount', index='city',
    columns='category', aggfunc='sum', fill_value=0
)`,
    output: `city       Electronics  Clothing  Food
Beijing         52000     18000  8500
Shanghai        38000     25000  6200
Guangzhou       29000     19000  5800`,
    points: ['how="left" 保留左表所有行，右表无匹配填 NaN', 'merge 前检查 key 唯一性防止行数爆炸', 'pivot_table 比 groupby→unstack 更直观'],
  },
];

export default function LessonPandasCore() {
  const [tab, setTab] = useState(0);
  const t = TOPICS[tab];

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">📊 模块一</div>
        <h1>Pandas 核心 — 数据清洗与转换</h1>
        <p>从零掌握数据分析的瑞士军刀。覆盖 DataFrame 操作、缺失值处理、分组聚合、多表合并，让杂乱数据变成整洁的分析基础。</p>
      </div>

      <div className="da-goals">
        {[
          { icon:'🗂️', title:'Series & DataFrame', desc:'Pandas 数据结构精讲与索引体系' },
          { icon:'🧹', title:'数据清洗', desc:'缺失值/重复值/异常值完整处理流程' },
          { icon:'🔢', title:'GroupBy 分组聚合', desc:'transform vs agg，统计任意维度' },
          { icon:'🔗', title:'多表合并', desc:'merge/concat/pivot_table 全掌握' },
        ].map(g => (
          <div className="da-goal" key={g.title}>
            <div className="da-goal-icon">{g.icon}</div>
            <div><h3>{g.title}</h3><p>{g.desc}</p></div>
          </div>
        ))}
      </div>

      {/* 交互式代码演示 */}
      <div className="da-sim">
        <div className="da-sim-title">💻 交互代码演示</div>
        <div className="da-tab-bar">
          {TOPICS.map((tp, i) => (
            <button key={tp.id} className={`da-tab${tab===i?' active':''}`} onClick={() => setTab(i)}>{tp.label}</button>
          ))}
        </div>

        <div className="da-code">
          <div className="da-code-header"><span className="da-code-lang">Python / Pandas</span></div>
          <pre>{t.code}</pre>
        </div>

        <div className="da-output">
          <span className="out-label">▶ 输出结果</span>
          {t.output}
        </div>

        <div className="da-section-title" style={{fontSize:'.85rem'}}>💡 关键注意点</div>
        <ul style={{margin:0,paddingLeft:'1.2rem',display:'flex',flexDirection:'column',gap:'.4rem'}}>
          {t.points.map((p, i) => <li key={i} style={{color:'var(--da-muted)',fontSize:'.82rem',lineHeight:1.6}}>{p}</li>)}
        </ul>
      </div>

      {/* 数据清洗流程 */}
      <div className="da-section-title">🔄 标准数据清洗 SOP</div>
      <ol className="da-steps">
        {[
          { n:'01', h:'形态探查', d:'df.info() / df.describe() / df.head() — 了解数据规模、类型、分布' },
          { n:'02', h:'缺失值量化', d:'df.isnull().sum() / heatmap — 找出缺失模式，判断 MCAR/MAR/MNAR' },
          { n:'03', h:'重复值清理', d:'df.duplicated(subset=[…]) — 按业务主键去重，不是全列比较' },
          { n:'04', h:'类型修正', d:'日期→datetime64，分类→category，整数→int8/int16（节省内存）' },
          { n:'05', h:'异常值检测', d:'IQR / Z-Score / 业务规则（如 age > 150 必为错误数据）' },
          { n:'06', h:'一致性归一', d:'字符串 trim/title/lower — 避免 "Beijing" 和 "beijing" 被认为是两个城市' },
        ].map(s => (
          <li key={s.n}>
            <div className="da-step-num">{s.n}</div>
            <div className="da-step-body"><h4>{s.h}</h4><p>{s.d}</p></div>
          </li>
        ))}
      </ol>

      {/* 内存优化 */}
      <div className="da-section-title">⚡ 内存优化速查</div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead><tr><th>数据类型</th><th>原始类型</th><th>优化类型</th><th>节省内存</th><th>适用场景</th></tr></thead>
          <tbody>
            {[
              ['整数(小范围)', 'int64', 'int8 / int16', '87%', '年龄、评分(0-100)'],
              ['浮点数', 'float64', 'float32', '50%', '经纬度、小数金额'],
              ['低基数字符串', 'object', 'category', '90%', '城市、部门、性别'],
              ['布尔值', 'object', 'bool', '93%', '是否付费、是否活跃'],
              ['日期', 'object', 'datetime64[ns]', '—', '所有日期列，解锁dt属性'],
            ].map(([t1,t2,t3,t4,t5]) => (
              <tr key={t1}>
                <td style={{fontWeight:600}}>{t1}</td>
                <td><span className="da-badge blue">{t2}</span></td>
                <td><span className="da-badge green">{t3}</span></td>
                <td style={{color:'#10b981',fontWeight:700}}>{t4}</td>
                <td style={{color:'var(--da-muted)'}}>{t5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="da-tip">
        <strong>🏆 1000万行数据的优化技巧</strong>
        <p>用 <code>pd.read_csv('data.csv', dtype=dtypes, usecols=[...])</code> 在读取时就指定类型和列选择，比读完再转换节省 60% 内存，速度提升 3x。</p>
      </div>
    </div>
  );
}
