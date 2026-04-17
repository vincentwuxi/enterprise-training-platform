import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['特征工程', '在线学习', 'A/B 测试', '系统架构'];

export default function LessonRealtimeRec() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🔍 module_06 — 实时推荐引擎</div>
      <div className="fs-hero">
        <h1>实时推荐引擎：毫秒级个性化</h1>
        <p>
          用户刚刚浏览了一双跑鞋，3 秒后首页就推荐了运动装备——这就是<strong>实时推荐</strong>。
          本模块覆盖实时特征工程（流式计算 + 特征存储）、在线学习（增量训练）、
          <strong>A/B 测试</strong>（分桶策略 + 多臂老虎机）、以及抖音级推荐系统架构。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚡ 实时推荐</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 实时特征工程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> feature_engineering.py</div>
                <pre className="fs-code">{`# —— 推荐系统实时特征工程 ——

# 特征分类体系
FEATURE_TAXONOMY = {
    "用户画像特征 (离线)": {
        "基础": ["年龄", "性别", "城市", "注册天数"],
        "兴趣": ["类目偏好 Top10", "品牌偏好", "价格区间偏好"],
        "行为统计": ["30天购买次数", "7天浏览品类分布", "客单价均值"],
    },
    "物品特征 (离线)": {
        "基础": ["类目", "品牌", "价格", "上架天数"],
        "统计": ["CTR", "CVR", "收藏率", "好评率"],
        "内容": ["标题 Embedding", "图片 Embedding", "标签"],
    },
    "上下文特征 (实时)": {
        "时间": ["当前时刻", "星期几", "是否节假日"],
        "设备": ["机型", "网络类型", "屏幕分辨率"],
        "场景": ["首页/搜索/详情页", "来源渠道"],
    },
    "实时交互特征 (秒级)": {
        "近期行为": ["最近1h点击序列", "最近30min搜索词"],
        "会话特征": ["本次会话已浏览N个", "停留时长序列"],
        "实时统计": ["过去5min该品类CTR", "实时热度指数"],
    }
}

# Feast 特征存储实现
from feast import FeatureStore, Entity, Field
from feast.types import Float32, Int64, String

store = FeatureStore(repo_path="./feature_repo")

# 定义用户特征实体
user = Entity(
    name="user_id",
    join_keys=["user_id"],
    description="User entity for recommendation"
)

# 在线获取特征 (毫秒级)
features = store.get_online_features(
    features=[
        "user_profile:age",
        "user_profile:city",
        "user_behavior:click_count_7d",
        "user_behavior:avg_price_30d",
        "user_realtime:last_click_category",
        "user_realtime:session_duration",
    ],
    entity_rows=[{"user_id": "u_12345"}]
).to_dict()

# 特征交叉 (DCN / AutoFE)
# 自动发现: user_city × item_brand → 高价值交叉特征`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 在线学习: 模型实时更新</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> online_learning.py</div>
                <pre className="fs-code">{`# —— 在线学习: 增量训练与实时更新 ——

class OnlineLearningPipeline:
    """实时模型更新管线"""
    
    # 三种更新策略
    STRATEGIES = {
        "全量训练": {
            "频率": "每天/每周",
            "数据": "全量历史数据",
            "延迟": "小时级",
            "适合": "基础模型更新",
        },
        "增量训练": {
            "频率": "每小时",
            "数据": "最近 N 小时增量",
            "延迟": "分钟级",
            "适合": "快速追踪趋势",
        },
        "在线学习": {
            "频率": "实时 (每条反馈)",
            "数据": "流式单条/小批",
            "延迟": "秒级",
            "适合": "即时个性化",
        }
    }
    
    def __init__(self, base_model, stream_source):
        self.model = base_model
        self.stream = stream_source
        self.buffer = []
        self.update_interval = 60  # 秒
    
    async def run(self):
        """增量训练主循环"""
        async for event in self.stream:
            # 1. 收集用户反馈
            feature = self.extract_feature(event)
            label = event["clicked"]  # 0/1
            self.buffer.append((feature, label))
            
            # 2. 攒够 mini-batch 则更新
            if len(self.buffer) >= 256:
                X = [f for f, _ in self.buffer]
                y = [l for _, l in self.buffer]
                
                # 3. 增量训练 (小学习率)
                self.model.partial_fit(X, y, lr=1e-4)
                
                # 4. 在线 AUC 监控
                auc = self.evaluate(X, y)
                if auc < self.auc_threshold:
                    alert("模型 AUC 下降, 可能需要全量重训")
                
                self.buffer.clear()
                
                # 5. 热部署 (无中断更新)
                self.hot_deploy(self.model)
    
    def hot_deploy(self, model):
        """模型热更新: 零宕机切换"""
        # 方案 1: 双 Buffer 切换
        # 方案 2: 滚动部署
        # 方案 3: Shadow 模式先验证后上线
        model.save(f"model_v{self.version}")
        self.version += 1`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🧪 A/B 测试框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ab_testing.py</div>
                <pre className="fs-code">{`# A/B 测试: 推荐系统的科学方法

class ABTestFramework:
    """推荐系统 A/B 测试"""
    
    def __init__(self):
        self.experiments = {}
    
    def create_experiment(self, name, variants, traffic_split):
        """
        创建实验
        variants: {"control": model_v1, "treatment": model_v2}
        traffic_split: {"control": 0.5, "treatment": 0.5}
        """
        self.experiments[name] = {
            "variants": variants,
            "split": traffic_split,
            "metrics": {v: MetricCollector() for v in variants}
        }
    
    def assign_variant(self, user_id, experiment_name):
        """确定性分桶 (同一用户始终同组)"""
        exp = self.experiments[experiment_name]
        hash_val = hash(f"{user_id}_{experiment_name}") % 100
        
        cumulative = 0
        for variant, ratio in exp["split"].items():
            cumulative += ratio * 100
            if hash_val < cumulative:
                return variant
        return list(exp["variants"].keys())[-1]
    
    def evaluate(self, experiment_name):
        """统计检验: 判断实验是否有显著效果"""
        from scipy import stats
        
        exp = self.experiments[experiment_name]
        control = exp["metrics"]["control"].values
        treatment = exp["metrics"]["treatment"].values
        
        # t 检验
        t_stat, p_value = stats.ttest_ind(control, treatment)
        
        # 效果量
        effect = (np.mean(treatment) - np.mean(control)) / np.mean(control)
        
        return {
            "p_value": p_value,
            "significant": p_value < 0.05,
            "effect_size": f"{effect:.2%}",
            "sample_sizes": {
                "control": len(control),
                "treatment": len(treatment)
            }
        }`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🎰 MAB: 更智能的实验</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> bandit.py</div>
                <pre className="fs-code">{`# Multi-Armed Bandit:
# 比 A/B 更灵活, 自动分配流量

class ThompsonSampling:
    """Thompson Sampling:
    贝叶斯最优的 Explore-Exploit 平衡
    """
    def __init__(self, n_arms):
        self.alpha = np.ones(n_arms)  # 成功次数
        self.beta = np.ones(n_arms)   # 失败次数
    
    def select_arm(self):
        # 从 Beta 分布采样
        samples = [
            np.random.beta(a, b)
            for a, b in zip(self.alpha, self.beta)
        ]
        return np.argmax(samples)
    
    def update(self, arm, reward):
        if reward:
            self.alpha[arm] += 1
        else:
            self.beta[arm] += 1

# A/B vs MAB:
# A/B测试:
#   ✅ 严格统计检验
#   ❌ 浪费流量在差模型
#   适合: 重大决策
#
# MAB:
#   ✅ 自动流量调配
#   ✅ 减少机会成本
#   ❌ 统计严谨性较弱
#   适合: 持续优化`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 工业级推荐系统架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> 系统架构</div>
                <pre className="fs-code">{`工业推荐系统架构 (抖音/美团级):

┌──────────────────────────────────────────────────┐
│                    客户端请求                      │
│            (userId, sceneId, deviceInfo)           │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│                  API Gateway                      │
│            负载均衡 / 流量控制 / A/B 分桶          │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│              Feature Service (特征服务)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Redis    │  │ Feast    │  │ Flink    │       │
│  │ 用户画像 │  │ 特征存储 │  │ 实时特征 │       │
│  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│                 召回层 (Recall)                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │双塔向量  │ │Item-CF  │ │热门/新品 │ │关注流 │ │
│  │ANN 检索 │ │行为相似 │ │时间衰减 │ │社交流 │ │
│  └─────────┘ └─────────┘ └─────────┘ └───────┘ │
│            合并去重 → ~2000 候选                   │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│              精排层 (Ranking)                      │
│  ┌───────────────────────────────┐               │
│  │ 多目标模型 (DeepFM/DIN/DCN)  │               │
│  │ pCTR × pCVR × pDuration      │               │
│  └───────────────────────────────┘               │
│            得分排序 → ~50 候选                     │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│              重排层 (Re-Ranking)                   │
│  多样性打散 + 广告混排 + 运营干预 + 展示最终列表  │
└──────────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
