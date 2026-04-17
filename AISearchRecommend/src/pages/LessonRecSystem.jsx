import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['协同过滤', '深度学习推荐', '多目标排序', '冷启动'];

export default function LessonRecSystem() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🔍 module_04 — 推荐系统核心</div>
      <div className="fs-hero">
        <h1>推荐系统：从协同过滤到深度学习</h1>
        <p>
          推荐系统驱动着 Netflix 80% 的播放量、Amazon 35% 的销售额、TikTok 几乎 100% 的内容消费。
          本模块系统覆盖<strong>协同过滤</strong>（User-CF / Item-CF / ALS）→
          <strong>深度学习推荐</strong>（双塔 / DeepFM / DIN）→
          <strong>多目标排序</strong>（点击率 + 转化率 + 时长）→ 冷启动策略。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 推荐算法</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>👥 协同过滤三剑客</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> collaborative_filtering.py</div>
                <pre className="fs-code">{`# —— 协同过滤: 推荐系统的基石 ——
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

class UserBasedCF:
    """User-CF: 找到相似用户，推荐他们喜欢的物品"""
    
    def __init__(self, ratings_matrix):
        # ratings_matrix: (n_users, n_items) 评分矩阵
        self.R = csr_matrix(ratings_matrix)
        self.user_sim = cosine_similarity(self.R)
    
    def recommend(self, user_id, top_k=10, n_neighbors=50):
        # 1. 找到最相似的 N 个邻居
        sim_scores = self.user_sim[user_id]
        neighbors = np.argsort(sim_scores)[::-1][1:n_neighbors+1]
        
        # 2. 加权预测评分
        user_rated = set(self.R[user_id].nonzero()[1])
        scores = {}
        
        for item in range(self.R.shape[1]):
            if item in user_rated:
                continue  # 跳过已评分项
            
            weighted_sum = 0
            sim_sum = 0
            for nb in neighbors:
                rating = self.R[nb, item]
                if rating > 0:
                    weighted_sum += sim_scores[nb] * rating
                    sim_sum += abs(sim_scores[nb])
            
            if sim_sum > 0:
                scores[item] = weighted_sum / sim_sum
        
        # 3. 返回 Top-K
        return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

class ItemBasedCF:
    """Item-CF: 找到相似物品进行推荐（更稳定）"""
    
    def __init__(self, ratings_matrix):
        self.R = csr_matrix(ratings_matrix)
        self.item_sim = cosine_similarity(self.R.T)  # 转置计算物品相似度
    
    def recommend(self, user_id, top_k=10):
        user_items = self.R[user_id].nonzero()[1]
        user_ratings = self.R[user_id].toarray().flatten()
        
        scores = {}
        for item in range(self.R.shape[1]):
            if user_ratings[item] > 0:
                continue
            score = sum(
                self.item_sim[item, j] * user_ratings[j]
                for j in user_items
            )
            scores[item] = score
        
        return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

# ALS 矩阵分解 (Spark MLlib)
# from pyspark.ml.recommendation import ALS
# als = ALS(rank=64, maxIter=20, regParam=0.01, userCol="userId", itemCol="itemId")
# model = als.fit(ratings_df)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 深度推荐模型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> deep_rec_models.py</div>
                <pre className="fs-code">{`# —— 深度学习推荐模型 ——
import torch
import torch.nn as nn

# ── 1. 双塔模型 (Two-Tower / DSSM) ──
class TwoTowerModel(nn.Module):
    """用户塔 + 物品塔: 召回阶段标配"""
    
    def __init__(self, user_dim, item_dim, embed_dim=128):
        super().__init__()
        # 用户塔: 用户特征 → 128维 Embedding
        self.user_tower = nn.Sequential(
            nn.Linear(user_dim, 256),
            nn.ReLU(), nn.BatchNorm1d(256),
            nn.Linear(256, embed_dim),
            nn.Functional.normalize  # L2 归一化
        )
        # 物品塔: 物品特征 → 128维 Embedding
        self.item_tower = nn.Sequential(
            nn.Linear(item_dim, 256),
            nn.ReLU(), nn.BatchNorm1d(256),
            nn.Linear(256, embed_dim),
        )
    
    def forward(self, user_features, item_features):
        user_emb = self.user_tower(user_features)
        item_emb = self.item_tower(item_features)
        # 内积 = 相似度
        return torch.sum(user_emb * item_emb, dim=-1)

# ── 2. DeepFM (特征交叉) ──
class DeepFM(nn.Module):
    """FM 捕获二阶交叉 + DNN 捕获高阶交叉"""
    
    def __init__(self, field_dims, embed_dim=16, hidden_dims=[256, 128, 64]):
        super().__init__()
        self.embedding = nn.Embedding(sum(field_dims), embed_dim)
        self.fm = FactorizationMachine(reduce_sum=True)
        self.dnn = MLP(len(field_dims) * embed_dim, hidden_dims)
        self.output = nn.Linear(hidden_dims[-1] + 1, 1)
    
    def forward(self, x):
        emb = self.embedding(x)  # (batch, fields, embed_dim)
        fm_out = self.fm(emb)                     # 二阶交叉
        dnn_out = self.dnn(emb.view(emb.size(0), -1))  # 高阶交叉
        return torch.sigmoid(self.output(torch.cat([fm_out, dnn_out], dim=1)))

# ── 3. DIN (注意力机制) ──
class DIN(nn.Module):
    """Deep Interest Network: 用注意力权重建模用户兴趣"""
    
    def __init__(self, item_dim, embed_dim=64):
        super().__init__()
        self.attention = nn.Sequential(
            nn.Linear(embed_dim * 4, 128), nn.ReLU(),
            nn.Linear(128, 64), nn.ReLU(),
            nn.Linear(64, 1)
        )
    
    def attention_pooling(self, candidate, history):
        """根据候选物品对历史行为做注意力加权"""
        # candidate: (batch, dim)
        # history: (batch, seq_len, dim)
        candidate_expand = candidate.unsqueeze(1).expand_as(history)
        
        # 四种交互特征
        att_input = torch.cat([
            candidate_expand, history,
            candidate_expand - history,
            candidate_expand * history
        ], dim=-1)
        
        weights = self.attention(att_input).squeeze(-1)
        weights = torch.softmax(weights, dim=1)
        
        return torch.sum(history * weights.unsqueeze(-1), dim=1)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🎯 多目标排序</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> multi_objective.py</div>
                <pre className="fs-code">{`# 多目标排序: 不只是点击率
# 真实业务需同时优化多个目标

# 多目标融合公式 (抖音/快手版):
# score = pCTR^a × pCVR^b × bid^c
#         × duration^d × quality^e

# 各目标权重:
# pCTR (预估点击率): 用户是否会点
# pCVR (预估转化率): 是否会购买
# duration (预估时长): 停留多久
# quality (内容质量): 避免低质量

class MultiObjectiveRanker:
    def __init__(self):
        self.ctr_model = load_model("ctr")
        self.cvr_model = load_model("cvr")
        self.dur_model = load_model("duration")
    
    def rank(self, user, candidates):
        scores = []
        for item in candidates:
            feats = extract_features(user, item)
            
            pctr = self.ctr_model.predict(feats)
            pcvr = self.cvr_model.predict(feats)
            pdur = self.dur_model.predict(feats)
            
            # 加权融合
            score = (pctr ** 0.5) * (pcvr ** 0.3) * (pdur ** 0.2)
            
            # 多样性打散
            score *= diversity_penalty(item, scores)
            
            scores.append((item, score))
        
        return sorted(scores, key=lambda x: x[1], reverse=True)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔄 推荐系统全链路</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> 全链路</div>
                <pre className="fs-code">{`工业推荐系统 4 阶段:

1️⃣ 召回 (Recall) → 千万→千
├── 双塔模型 (向量检索)
├── Item-CF (行为相似)
├── 热门/新品 (补充)
└── 合并去重 ~1000 条

2️⃣ 粗排 (Pre-Ranking) → 千→百
├── 轻量级模型 (蒸馏)
├── 特征精简版
└── 延迟 < 10ms

3️⃣ 精排 (Ranking) → 百→几十
├── DeepFM / DIN / DCN
├── 全特征参与
├── 多目标预估
└── 延迟 < 50ms

4️⃣ 重排 (Re-Ranking) → 最终展示
├── 多样性打散
├── 广告混排
├── 运营干预 (置顶/降权)
└── A/B 实验分桶`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🥶 冷启动策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> cold_start</div>
                <pre className="fs-code">{`冷启动: 推荐系统最大挑战

新用户冷启动:
├── 注册信息推断 (年龄/性别/城市)
├── 引导页兴趣选择
├── 热门推荐 (Explore)
├── 跨平台数据桥接
└── 快速探索 (MAB 算法)

新物品冷启动:
├── 内容特征推荐 (CB)
├── 相似物品关联
├── 创作者历史数据迁移
├── 初始流量池测试
└── Meta-Learning (学习如何推荐)

技术方案: Multi-Armed Bandit
├── ε-Greedy: 简单有效
│   └── ε=0.1: 90%利用, 10%探索
├── UCB: 置信区间上界
│   └── 偏好不确定的物品
├── Thompson Sampling: 贝叶斯
│   └── 最优的探索-利用平衡
└── Contextual Bandit
    └── 结合用户上下文`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⚖️ 推荐偏差</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> bias</div>
                <pre className="fs-code">{`推荐系统常见偏差:

位置偏差 (Position Bias)
├── 越靠前点击越多
├── 解决: 位置特征建模
└── IPW 逆倾向加权

流行度偏差 (Popularity Bias)
├── 热门物品越推越热
├── 解决: 采样负例校正
└── 长尾物品提权

曝光偏差 (Exposure Bias)
├── 没曝光 ≠ 不喜欢
├── 解决: IPS 估计
└── 因果推断方法

信息茧房 (Filter Bubble)
├── 推荐越来越窄
├── 解决: 多样性打散
├── 探索性推荐 (serendipity)
└── 内容审核 + 优质扶持`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
