import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['GNN 基础', '核心架构', '应用场景', '实战代码'];

export default function LessonGraphNN() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🕸️ module_05 — 图神经网络</div>
      <div className="fs-hero">
        <h1>图神经网络：GCN / GAT / GraphSAGE — 关系数据的深度学习</h1>
        <p>
          现实世界充满<strong>图结构数据</strong>：社交网络、分子结构、知识图谱、推荐系统。
          GNN 是处理这类非欧几里得数据的核心工具。本模块从消息传递范式出发，
          深入 <strong>GCN / GAT / GraphSAGE</strong> 的数学与 PyTorch Geometric 实战，
          探索分子性质预测、社区检测、链接预测等前沿应用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🕸️ 图神经网络</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 图数据与消息传递</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gnn_fundamentals</div>
                <pre className="fs-code">{`# 图神经网络: 在图结构上做深度学习

# ═══ 为什么需要 GNN? ═══
# CNN → 处理网格数据 (图像)
# RNN → 处理序列数据 (文本)
# GNN → 处理图结构数据 (关系)
#
# 图无处不在:
# - 社交网络: 用户→节点, 关注→边
# - 分子: 原子→节点, 化学键→边
# - 知识图谱: 实体→节点, 关系→边
# - 推荐系统: 用户/商品→节点, 交互→边

# ═══ 图的数学表示 ═══
# G = (V, E, X)
# V: 节点集合 (|V| = N)
# E: 边集合
# X: 节点特征矩阵 (N × F)
# A: 邻接矩阵 (N × N), A[i][j] = 1 if 边(i,j)存在

# ═══ 消息传递范式 (MPNN) ═══
# GNN 的统一框架 (Gilmer et al., 2017)
#
# 每一层做三步:
# 1. Message:     m_ij = MSG(h_i, h_j, e_ij)
#    每条边生成一个"消息"
# 2. Aggregate:   M_i = AGG({m_ij : j ∈ N(i)})
#    聚合来自邻居的消息 (sum/mean/max)
# 3. Update:      h_i' = UPD(h_i, M_i)
#    更新节点表示

# 伪代码:
# for each layer:
#   for each node i:
#     messages = [MSG(h_i, h_j) for j in neighbors(i)]
#     aggregated = AGG(messages)      # sum / mean / max
#     h_i = UPDATE(h_i, aggregated)   # MLP / GRU

# ═══ 感受野 ═══
# 1 层 GNN → 感受野 = 1-hop 邻居
# 2 层 GNN → 感受野 = 2-hop 邻居
# K 层 GNN → 感受野 = K-hop 邻居
# 注意: 层数太深 → 过平滑 (所有节点表示趋同)

# ═══ 图神经网络 vs CNN ═══
# ┌──────────┬──────────────┬──────────────┐
# │          │ CNN          │ GNN          │
# ├──────────┼──────────────┼──────────────┤
# │ 数据结构 │ 规则网格      │ 任意图       │
# │ 邻居关系 │ 固定(3×3窗口)│ 变化(度不同) │
# │ 平移等变 │ 是           │ 置换等变     │
# │ 参数共享 │ 卷积核共享   │ 消息函数共享 │
# │ 感受野   │ 逐层扩大     │ 逐层扩大     │
# └──────────┴──────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ GCN / GAT / GraphSAGE</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> gnn_architectures</div>
                <pre className="fs-code">{`# 三大经典 GNN 架构

# ═══ 1. GCN (Graph Convolutional Network, Kipf 2017) ═══
# 谱域方法的简化: 切比雪夫逼近 → 一阶近似
# H^(l+1) = σ(D̃^{-1/2} Ã D̃^{-1/2} H^(l) W^(l))
# Ã = A + I  (加入自环)
# D̃ 是度矩阵
# → 本质: 邻居特征的加权平均 + 线性变换

# ═══ 2. GAT (Graph Attention Network, 2018) ═══
# 核心: 不是平均聚合, 而是注意力加权
# α_ij = softmax(LeakyReLU(a^T [Wh_i || Wh_j]))
# h_i' = σ(Σ α_ij · W · h_j)
# → 不同邻居的重要性不同!
# 多头注意力: K 个独立注意力头 → 拼接或平均

# ═══ 3. GraphSAGE (Sample and Aggregate, 2017) ═══
# 关键创新: 采样 + 聚合 (归纳学习)
# 1. 从邻居中采样固定数量节点 (不用全部)
# 2. 聚合: MEAN / LSTM / Pool
# 3. h_i' = σ(W · [h_i || AGG(h_j)])
# → 可以处理新节点! (归纳式, 不像 GCN 要全图)

# ═══ PyTorch Geometric 实战 ═══
import torch
from torch_geometric.nn import GCNConv, GATConv, SAGEConv
from torch_geometric.data import Data

# 构建图
edge_index = torch.tensor([
    [0, 1, 1, 2, 2, 3],  # source nodes
    [1, 0, 2, 1, 3, 2],  # target nodes
], dtype=torch.long)
x = torch.randn(4, 16)  # 4个节点, 16维特征

data = Data(x=x, edge_index=edge_index)

# GCN 模型
class GCN(torch.nn.Module):
    def __init__(self, in_ch, hidden_ch, out_ch):
        super().__init__()
        self.conv1 = GCNConv(in_ch, hidden_ch)
        self.conv2 = GCNConv(hidden_ch, out_ch)
    
    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index).relu()
        x = torch.nn.functional.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        return x

# GAT 模型 (多头注意力)
class GAT(torch.nn.Module):
    def __init__(self, in_ch, hidden_ch, out_ch, heads=8):
        super().__init__()
        self.conv1 = GATConv(in_ch, hidden_ch, heads=heads)
        self.conv2 = GATConv(hidden_ch * heads, out_ch, heads=1)
    
    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return x`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 GNN 应用场景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> gnn_applications</div>
                <pre className="fs-code">{`# GNN 的核心应用领域

# ═══ 1. 分子性质预测 ═══
# 原子 = 节点, 化学键 = 边
# 预测: 溶解度 / 毒性 / 结合亲和力
# 模型: SchNet / DimeNet / GemNet / MACE
# 工具: RDKit + PyTorch Geometric
molecular_gnn = {
    "节点特征": "原子类型/电荷/杂化/芳香性",
    "边特征":   "键类型/键长/键角",
    "聚合":     "sum (保持原子数信息)",
    "读出":     "全局池化 → 分子级预测",
}

# ═══ 2. 推荐系统 ═══
# 用户-商品二部图
# 模型: PinSage (Pinterest) / LightGCN
# 任务: 链接预测 (用户是否会点击商品)
recommendation = {
    "PinSage":  "GraphSAGE + 随机游走采样 (Pinterest)",
    "LightGCN": "极简 GCN, 去掉特征变换和非线性",
    "规模":     "20亿节点 (Pinterest 生产级)",
}

# ═══ 3. 知识图谱 ═══
# 实体→节点, 关系→边
# 任务: 链接预测 / 知识补全
# 模型: R-GCN / CompGCN / NBFNet
knowledge_graph = {
    "TransE":   "h + r ≈ t (翻译模型)",
    "RotatE":   "旋转变换 (复数空间)",
    "R-GCN":    "关系特定的 GCN",
    "GraphRAG": "GNN + RAG 结合",
}

# ═══ 4. 交通/时空预测 ═══
# 路网 = 图, 交通流 = 时序信号
# 模型: STGCN / DCRNN / Graph WaveNet
traffic = {
    "空间": "GCN 捕捉路网拓扑",
    "时间": "TCN/LSTM 捕捉时序",
    "应用": "交通流预测/ETA估计/打车调度",
}

# ═══ 5. 社交网络分析 ═══
# 节点分类: 用户画像 / 社区检测
# 异常检测: 虚假账号 / 欺诈识别
# 影响力传播: 信息如何在网络中扩散

# ═══ GNN 面临的挑战 ═══
challenges = {
    "过平滑":     "层数增加→所有节点表示趋同",
    "可扩展性":   "大图训练→采样策略(GraphSAGE)",
    "异质图":     "不同类型节点/边→R-GCN/HGT",
    "时序图":     "图结构随时间变化→TGN",
    "3D 等变":    "保持旋转/平移不变性→E(3)-GNN",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💻 PyTorch Geometric 实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> pyg_practice</div>
                <pre className="fs-code">{`# PyTorch Geometric 节点分类完整流程

import torch
from torch_geometric.datasets import Planetoid
from torch_geometric.nn import GCNConv
import torch.nn.functional as F

# ═══ 1. 加载 Cora 数据集 ═══
# 2,708 篇论文, 5,429 条引用, 7 个领域
dataset = Planetoid(root='./data', name='Cora')
data = dataset[0]
# data.x: [2708, 1433] 节点特征 (词袋)
# data.edge_index: [2, 10556] 边 (双向)
# data.y: [2708] 标签 (7 类)

# ═══ 2. 模型定义 ═══
class GCN(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = GCNConv(dataset.num_features, 64)
        self.conv2 = GCNConv(64, dataset.num_classes)
    
    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)

# ═══ 3. 训练 ═══
model = GCN()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

for epoch in range(200):
    model.train()
    optimizer.zero_grad()
    out = model(data)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()

# ═══ 4. 评估 ═══
model.eval()
pred = model(data).argmax(dim=1)
correct = pred[data.test_mask] == data.y[data.test_mask]
accuracy = correct.sum() / data.test_mask.sum()
print(f"Test Accuracy: {accuracy:.4f}")
# 典型结果: ~81% (2层 GCN on Cora)

# ═══ 5. 图级任务 (分子分类) ═══
from torch_geometric.nn import global_mean_pool
from torch_geometric.datasets import TUDataset

dataset = TUDataset(root='./data', name='MUTAG')

class MoleculeGNN(torch.nn.Module):
    def __init__(self, in_ch, hidden_ch, out_ch):
        super().__init__()
        self.conv1 = GCNConv(in_ch, hidden_ch)
        self.conv2 = GCNConv(hidden_ch, hidden_ch)
        self.fc = torch.nn.Linear(hidden_ch, out_ch)
    
    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        x = global_mean_pool(x, batch)  # 全局池化
        return self.fc(x)

# batch 变量: 标记每个节点属于 mini-batch 中的哪个图`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
