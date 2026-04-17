import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['推荐系统', '智能搜索', '动态定价', '客服与供应链'];

export default function LessonEcommerceAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🏭 module_03 — 电商 AI</div>
      <div className="fs-hero">
        <h1>电商 AI：推荐 / 搜索 / 定价 / 客服 / 供应链</h1>
        <p>
          电商是 AI 应用最密集的行业——推荐驱动 35% 的 GMV，搜索提升 20% 转化率。
          本模块覆盖深度推荐系统（DIN/DIEN/多目标优化）、
          LLM 增强搜索（Query 理解/多模态搜索）、
          AI 动态定价（竞价/弹性/促销优化）、
          以及智能客服和供应链预测。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🛒 电商 AI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 深度推荐系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> recommendation.py</div>
                <pre className="fs-code">{`# —— 电商推荐系统: 工业级架构 ——

class RecommendationSystem:
    """电商推荐全链路"""
    
    # 工业级推荐管线:
    # 用户请求 → 召回 → 粗排 → 精排 → 重排 → 展示
    
    def recall(self, user, context, n=1000):
        """多路召回 (10ms, 从亿级→千级)"""
        candidates = set()
        
        # 路径 1: 协同过滤 (i2i)
        # "买了X的人也买了Y"
        candidates |= self.item2item_cf(user.history, n=300)
        
        # 路径 2: 向量召回 (u2i)
        # 用户Embedding → 最近邻商品
        user_emb = self.user_tower(user.features)
        candidates |= self.ann_search(user_emb, n=300)  # FAISS/HNSW
        
        # 路径 3: 热门/新品/位置
        candidates |= self.hot_items(context.category, n=200)
        
        # 路径 4: LLM 语义召回 (新!)
        if user.search_query:
            candidates |= self.llm_semantic_recall(user.search_query, n=200)
        
        return candidates
    
    def rank(self, user, candidates):
        """精排模型 (50ms)"""
        # 多目标排序: 不只是点击, 还要购买+GMV
        features = self.extract_features(user, candidates)
        
        # 多目标预测:
        predictions = self.multi_task_model(features)
        # ├── P(click): 点击率
        # ├── P(cart): 加购率
        # ├── P(purchase): 购买率
        # ├── P(return): 退货率 (要低)
        # └── GMV: 预估成交额
        
        # 综合打分:
        score = (
            predictions["click"] * 0.3 +
            predictions["purchase"] * 0.5 +
            predictions["gmv"] * 0.15 -
            predictions["return"] * 0.05
        )
        
        return sorted(candidates, key=lambda x: score[x.id], reverse=True)

    def rerank(self, ranked_list):
        """重排: 多样性 + 商业规则"""
        # 1. 多样性打散 (MMR)
        #    不能连续推荐同品类
        diversified = self.maximal_marginal_relevance(ranked_list)
        
        # 2. 商业规则
        #    广告位插入 / 促销品提权 / 新品曝光
        
        # 3. 个性化排列
        #    A/B 测试不同排列策略
        
        return diversified

# 推荐系统关键指标:
# ├── CTR (点击率): 3-8%
# ├── CVR (转化率): 1-5%
# ├── GMV 提升: 10-30%
# ├── 用户停留时长: ↑ 20-40%
# └── 推荐覆盖率: > 80%`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 LLM 增强电商搜索</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ecom_search.py</div>
                <pre className="fs-code">{`# —— 电商搜索: 意图理解 + 多模态 ——

class EcomSearch:
    """LLM 增强电商搜索"""
    
    async def search(self, query, user):
        """搜索全链路"""
        
        # 1. Query 理解 (LLM)
        parsed = await self.understand_query(query)
        # "200块以内的运动鞋耐克" →
        # {
        #   "intent": "product_search",
        #   "category": "运动鞋",
        #   "brand": "耐克",
        #   "price_range": [0, 200],
        #   "synonyms": ["跑步鞋", "球鞋"]
        # }
        
        # 2. 混合检索
        results = self.hybrid_search(parsed)
        # ├── BM25 关键词匹配 (品牌/型号)
        # ├── 向量语义搜索 (描述/评论)
        # └── 属性过滤 (价格/品类/库存)
        
        # 3. 意图满足 (LLM)
        if parsed["intent"] == "comparison":
            # "iPhone 15 和 三星 S24 哪个好"
            comparison = await self.llm_compare(parsed)
            return {"type": "comparison", "data": comparison}
        
        if parsed["intent"] == "qa":
            # "这个手机支持5G吗"
            answer = await self.llm_qa(parsed, results[0])
            return {"type": "qa", "answer": answer, "products": results}
        
        # 4. 个性化重排
        reranked = self.personalize(results, user)
        
        return {"type": "products", "data": reranked}

    async def multimodal_search(self, image, text_query):
        """以图搜图 + 文本 (多模态搜索)"""
        # "找和这件衣服类似但更便宜的"
        img_emb = self.clip.encode_image(image)
        text_emb = self.clip.encode_text(text_query)
        
        # 结合图像和文本意图
        combined_emb = 0.7 * img_emb + 0.3 * text_emb
        results = self.vector_search(combined_emb)
        
        # 价格约束
        if "便宜" in text_query:
            original_price = self.detect_price(image)
            results = [r for r in results if r.price < original_price]
        
        return results

# 电商搜索关键指标:
# ├── 无结果率 (Null Rate): < 3%
# ├── 首屏点击率: > 40%
# ├── 搜索转化率: > 5%
# └── NDCG@10: > 0.65`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💲 AI 动态定价</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pricing.py</div>
                <pre className="fs-code">{`# —— AI 动态定价: 最大化利润的定价策略 ——

class DynamicPricing:
    """AI 驱动的动态定价引擎"""
    
    def optimize_price(self, product, market_state):
        """实时价格优化"""
        
        # 1. 需求弹性估计
        elasticity = self.estimate_elasticity(product)
        # 弹性 = 需求变化% / 价格变化%
        # |e| > 1: 弹性大 (价格敏感, 日用品)
        # |e| < 1: 弹性小 (价格不敏感, 奢侈品)
        
        # 2. 竞品价格监控
        competitor_prices = self.monitor_competitors(product)
        # 爬取竞品实时价格 (经授权)
        
        # 3. 库存成本考虑
        inventory_factor = self.inventory_pressure(product)
        # 库存多 → 适度降价清仓
        # 库存少 → 维持/提价
        
        # 4. ML 价格优化
        optimal_price = self.price_model.predict(
            features={
                "elasticity": elasticity,
                "competitor_avg": competitor_prices.mean,
                "inventory_days": inventory_factor,
                "season": market_state.season,
                "day_of_week": market_state.dow,
                "user_segment": market_state.segment,
            }
        )
        
        # 5. 约束条件
        final_price = self.apply_constraints(optimal_price, product)
        # ├── 最低利润率 > 15%
        # ├── 价格波动 < 30%/周 (防投诉)
        # ├── 不低于成本价 (合规)
        # └── 会员价/促销价规则
        
        return final_price

    定价场景对比:
    ┌──────────┬─────────┬────────┬────────────┐
    │ 场景      │ 频率     │ 弹性   │ 关键因素    │
    ├──────────┼─────────┼────────┼────────────┤
    │ 航空机票  │ 每小时   │ 高     │ 上座率/时间 │
    │ 酒店房间  │ 每天     │ 中     │ 入住率/季节 │
    │ 网约车    │ 实时     │ 高     │ 供需/天气  │
    │ 电商日用  │ 每天     │ 高     │ 竞品/库存  │
    │ 奢侈品   │ 季度     │ 低     │ 品牌/稀缺性│
    └──────────┴─────────┴────────┴────────────┘

    # 效果: 利润 ↑ 5-15%, 库存周转 ↑ 20%`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🤖 电商智能客服</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> customer_service</div>
                <pre className="fs-code">{`电商智能客服架构:

多层处理:
┌─────────────────────────────────┐
│ Layer 1: 意图识别 (5ms)          │
│ ├── 商品咨询 (35%)              │
│ ├── 物流查询 (25%)              │
│ ├── 退换货 (20%)                │
│ ├── 投诉 (10%)                  │
│ └── 其他 (10%)                  │
└──────────┬──────────────────────┘
           ▼
┌─────────────────────────────────┐
│ Layer 2: 自动回复 (80%自动解决)   │
│ ├── FAQ 匹配 → 直接回复          │
│ ├── 订单查询 → 调用系统 API      │
│ ├── 退换货 → 自动审核+引导       │
│ └── LLM 生成 → 复杂问答          │
└──────────┬──────────────────────┘
           ▼ (20% 转人工)
┌─────────────────────────────────┐
│ Layer 3: 人工坐席辅助            │
│ ├── AI 推荐回复 (坐席一键发送)   │
│ ├── 实时情绪检测 (预警)          │
│ ├── 知识库搜索辅助               │
│ └── 工单自动生成                 │
└─────────────────────────────────┘

LLM 增强:
├── 多轮对话理解 (上下文记忆)
├── 商品专业知识 (RAG)
├── 语气情感适配 (共情/安抚)
└── 多语言支持 (跨境电商)

效果:
├── 自动解决率: 80-85%
├── 平均响应时间: < 3秒 (vs 人工30秒)
├── 客户满意度: 4.2/5 (vs 人工 4.0)
└── 人力成本: ↓ 50-70%`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📦 供应链预测</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> supply_chain</div>
                <pre className="fs-code">{`AI 供应链优化:

1️⃣ 需求预测
├── 传统: ARIMA/指数平滑
│   精度: MAPE 25-35%
├── ML: LightGBM + 特征工程
│   精度: MAPE 15-25%
├── 深度学习: Transformer 时序
│   精度: MAPE 10-18%
├── LLM 增强: 事件感知预测
│   "双十一" → 自动提升预测量
│   精度: MAPE 8-15%
└── 效果: 库存成本 ↓ 15-30%

2️⃣ 智能补货
├── 安全库存动态计算
├── 多仓协同调拨
├── 季节性/促销因子
└── 效果: 缺货率 ↓ 40%

3️⃣ 物流优化
├── 路径规划 (VRP)
│   配送路线优化 → 成本 ↓ 10-20%
├── 仓储布局
│   需求热力图 → 前置仓选址
├── 最后一公里
│   预测配送时间 → 时效承诺
└── 效果: 物流成本 ↓ 10-15%

4️⃣ 品质控制
├── 图像质检 (瑕疵检测)
├── 供应商评分模型
└── 退货预测 (降低逆向物流)

整体效果:
├── 库存周转率 ↑ 20-40%
├── 库存成本 ↓ 15-30%
├── 履约时效 ↑ 25%
└── 缺货损失 ↓ 30-50%`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
