import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const NUMPY_OPS = [
  { op: '数组创建', code: `import numpy as np\n\na = np.array([1, 2, 3, 4, 5])\nb = np.zeros((3, 4))         # 3×4 全零矩阵\nc = np.ones((2, 3))          # 2×3 全一矩阵\nd = np.eye(4)                # 4×4 单位矩阵\ne = np.arange(0, 10, 0.5)   # 等差数列\nf = np.linspace(0, 1, 100)  # 100 个均匀点\ng = np.random.randn(3, 3)   # 正态分布随机` },
  { op: '向量化运算', code: `# NumPy 的核心：向量化（比 for 循环快 100x+）\na = np.array([1, 2, 3, 4, 5])\nb = np.array([10, 20, 30, 40, 50])\n\nprint(a + b)         # [11 22 33 44 55]\nprint(a * b)         # [10 40 90 160 250]\nprint(a ** 2)        # [1 4 9 16 25]\nprint(np.sqrt(b))    # [3.16 4.47 5.47 6.32 7.07]\n\n# 广播 (Broadcasting)\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m + 10)        # 每个元素+10\nprint(m * [1, 2, 3]) # 每行乘以 [1,2,3]` },
  { op: '矩阵运算', code: `A = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\n\n# 矩阵乘法\nC = A @ B                    # 或 np.matmul(A, B)\nprint(C)  # [[19 22], [43 50]]\n\n# 线性代数\nprint(np.linalg.det(A))      # 行列式: -2.0\nprint(np.linalg.inv(A))      # 逆矩阵\nevals, evecs = np.linalg.eig(A)  # 特征值/向量\n\n# 统计\nprint(A.mean())               # 2.5\nprint(A.std())                # 1.118\nprint(A.sum(axis=0))          # 按列求和: [4 6]` },
  { op: '索引与切片', code: `a = np.arange(25).reshape(5, 5)\n\nprint(a[0, :])          # 第一行\nprint(a[:, 2])          # 第三列\nprint(a[1:3, 1:3])      # 子矩阵\n\n# 花式索引\nidx = [0, 2, 4]\nprint(a[idx, :])        # 第0,2,4行\n\n# 布尔索引（最常用！）\nmask = a > 10\nprint(a[mask])          # 所有大于10的元素\na[a < 0] = 0            # 将负值置零` },
];

export default function LessonDataScience() {
  const navigate = useNavigate();
  const [activeNP, setActiveNP] = useState(0);
  const [activeLib, setActiveLib] = useState('pandas');

  const LIB_CODE = {
    pandas: `import pandas as pd

# 创建 DataFrame
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie", "Diana"],
    "age": [25, 30, 35, 28],
    "score": [92, 85, 78, 96],
    "dept": ["Tech", "Marketing", "Tech", "HR"],
})

# 基础探索
print(df.shape)          # (4, 4)
print(df.dtypes)         # 各列类型
print(df.describe())     # 统计摘要
print(df.head(2))        # 前2行

# 数据筛选
tech = df[df["dept"] == "Tech"]
high_score = df[df["score"] > 88]
result = df.query("age > 27 and score > 80")

# 分组聚合
agg = df.groupby("dept")["score"].agg(["mean", "max", "count"])
print(agg)

# 数据清洗
df["age"] = df["age"].fillna(df["age"].median())
df = df.drop_duplicates(subset=["name"])
df["score_normalized"] = (df["score"] - df["score"].min()) / (df["score"].max() - df["score"].min())

# 读写文件
# df.to_csv("output.csv", index=False)
# df = pd.read_csv("data.csv", parse_dates=["date"])`,

    matplotlib: `import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle("Python 数据可视化示例", fontsize=14)

# 折线图
x = np.linspace(0, 2*np.pi, 100)
axes[0, 0].plot(x, np.sin(x), label="sin(x)", color="#1a56db")
axes[0, 0].plot(x, np.cos(x), label="cos(x)", color="#f59e0b")
axes[0, 0].legend()
axes[0, 0].set_title("三角函数")

# 散点图
n = 100
x = np.random.randn(n)
y = 2*x + np.random.randn(n)
axes[0, 1].scatter(x, y, alpha=0.6, c=y, cmap="cool")
axes[0, 1].set_title("散点图")

# 柱状图
labels = ["Tech", "Marketing", "HR", "Finance"]
values = [85.5, 72.3, 68.9, 90.1]
colors = ["#1a56db", "#f59e0b", "#10b981", "#a78bfa"]
axes[1, 0].bar(labels, values, color=colors)
axes[1, 0].set_title("各部门平均分")

# 直方图
data = np.random.normal(70, 15, 1000)
axes[1, 1].hist(data, bins=30, color="#1a56db", alpha=0.7)
axes[1, 1].set_title("成绩分布")

plt.tight_layout()
plt.savefig("chart.png", dpi=150, bbox_inches="tight")
plt.show()`,

    sklearn: `from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
import numpy as np

# 1. 准备数据
from sklearn.datasets import load_iris
X, y = load_iris(return_X_y=True)

# 2. 划分训练/测试集（8:2）
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. 构建 Pipeline（自动化预处理→训练）
pipe = Pipeline([
    ("scaler", StandardScaler()),              # 标准化
    ("clf", RandomForestClassifier(
        n_estimators=100, random_state=42)),   # 随机森林
])

# 4. 交叉验证评估
scores = cross_val_score(pipe, X_train, y_train, cv=5)
print(f"CV 准确率: {scores.mean():.3f} ± {scores.std():.3f}")

# 5. 训练 & 评估
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
print(classification_report(y_test, y_pred))

# 6. 特征重要性
importances = pipe.named_steps["clf"].feature_importances_
print("最重要特征:", np.argsort(importances)[::-1][:3])`,
  };

  return (
    <div className="lesson-py">
      <div className="py-badge">📊 module_07 — 数据科学</div>

      <div className="py-hero">
        <h1>数据科学入门：NumPy、Pandas 与机器学习</h1>
        <p>Python 成为数据科学首选语言，核心是这三个库。<strong>NumPy</strong> 高效数组运算，<strong>Pandas</strong> 结构化数据处理，<strong>scikit-learn</strong> 一站式机器学习。</p>
      </div>

      {/* NumPy */}
      <div className="py-section">
        <h2 className="py-section-title">🔢 NumPy 核心操作（点击切换）</h2>
        <div className="py-interactive">
          <h3>
            NumPy 操作演示
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {NUMPY_OPS.map((n, i) => (
                <button key={n.op} className={`py-btn ${activeNP === i ? 'primary' : ''}`}
                  onClick={() => setActiveNP(i)}>{n.op}</button>
              ))}
            </div>
          </h3>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>numpy_{NUMPY_OPS[activeNP].op}.py</span>
          </div>
          <div className="py-editor">{NUMPY_OPS[activeNP].code}</div>
        </div>
      </div>

      {/* Pandas / Matplotlib / sklearn */}
      <div className="py-section">
        <h2 className="py-section-title">📦 数据科学生态（点击切换）</h2>
        <div className="py-interactive">
          <h3>
            代码示例
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[['pandas','🐼 Pandas'],['matplotlib','📈 Matplotlib'],['sklearn','🤖 scikit-learn']].map(([k,l]) => (
                <button key={k} className={`py-btn ${activeLib === k ? 'primary' : ''}`} onClick={() => setActiveLib(k)}>{l}</button>
              ))}
            </div>
          </h3>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{activeLib}_demo.py</span>
          </div>
          <div className="py-editor">{LIB_CODE[activeLib]}</div>
        </div>
      </div>

      {/* 生态地图 */}
      <div className="py-section">
        <h2 className="py-section-title">🗺️ Python 数据科学全景图</h2>
        <div className="py-grid-3">
          {[
            { cat: '数据处理', color: '#1a56db', libs: ['NumPy（数组计算）', 'Pandas（表格数据）', 'Polars（高性能 DataFrame）', 'Dask（超大数据集）'] },
            { cat: '可视化', color: '#10b981', libs: ['Matplotlib（基础绘图）', 'Seaborn（统计图表）', 'Plotly（交互图表）', 'Altair（声明式）'] },
            { cat: '机器学习', color: '#f59e0b', libs: ['scikit-learn（传统 ML）', 'XGBoost / LightGBM', 'PyTorch（深度学习）', 'TensorFlow / Keras'] },
            { cat: '数值计算', color: '#a78bfa', libs: ['SciPy（科学计算）', 'SymPy（符号计算）', 'statsmodels（统计）', 'NetworkX（图论）'] },
            { cat: '自然语言处理', color: '#06b6d4', libs: ['NLTK（经典 NLP）', 'spaCy（工业级 NLP）', 'HuggingFace Transformers', 'Jieba（中文分词）'] },
            { cat: '开发工具', color: '#ef4444', libs: ['Jupyter / JupyterLab', 'Google Colab（免费 GPU）', 'MLflow（实验追踪）', 'Weights & Biases'] },
          ].map(g => (
            <div key={g.cat} className="py-card" style={{ borderColor: `${g.color}25` }}>
              <h3 style={{ color: g.color }}>{g.cat}</h3>
              {g.libs.map(l => (
                <div key={l} style={{ fontSize: '0.82rem', color: '#64748b', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>• {l}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/concurrent')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/projects')}>下一模块：实战项目 →</button>
      </div>
    </div>
  );
}
