import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['自适应学习', '智能批改', '知识图谱', '虚拟教师'];

export default function LessonEducationAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🏭 module_07 — 教育 AI</div>
      <div className="fs-hero">
        <h1>教育 AI：自适应学习 / 智能批改 / 知识图谱 / 虚拟教师</h1>
        <p>
          AI 正在重新定义教育——每个学生都能拥有"一对一 AI 导师"。
          本模块覆盖自适应学习引擎（知识追踪/学习路径推荐/难度自适应）、
          智能批改（作文/编程/数学/主观题）、
          教育知识图谱（知识建模/测评/诊断）、
          以及 AI 虚拟教师（对话式教学/苏格拉底方法/情感支持）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎓 教育 AI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 自适应学习引擎</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> adaptive_learning.py</div>
                <pre className="fs-code">{`# —— 自适应学习: 千人千面的学习体验 ——

class AdaptiveLearningEngine:
    """AI 自适应学习引擎"""
    
    # 核心算法: 知识追踪 (Knowledge Tracing)
    def knowledge_tracing(self, student, interaction_log):
        """追踪学生知识掌握状态"""
        # 输入: 学生答题序列 [(题目, 知识点, 是否正确), ...]
        
        # 方法 1: BKT (Bayesian Knowledge Tracing)
        # 经典模型: P(掌握) 基于答题正确率推断
        
        # 方法 2: DKT (Deep Knowledge Tracing)
        # LSTM/Transformer 建模学习过程序列
        model = self.dkt_model  # Transformer 架构
        knowledge_state = model.predict(interaction_log)
        # 输出: 每个知识点的掌握概率 [0-1]
        
        return {
            "知识点掌握度": {
                "一元一次方程": 0.85,
                "二元一次方程": 0.42,  # ← 薄弱点
                "不等式": 0.91,
                "函数基础": 0.65,     # ← 需巩固
            },
            "总体水平": "中等偏上",
            "建议": "加强二元方程练习"
        }
    
    def recommend_path(self, student_state):
        """个性化学习路径推荐"""
        # 1. 找出薄弱知识点 (掌握度 < 0.7)
        weak_points = [k for k, v in student_state.items() if v < 0.7]
        
        # 2. 考虑知识依赖关系 (知识图谱)
        # 二元方程 依赖 一元方程
        # 必须先确保前置知识掌握
        ordered = self.topological_sort(weak_points, self.knowledge_graph)
        
        # 3. 推荐练习 (难度自适应)
        exercises = []
        for point in ordered:
            mastery = student_state[point]
            if mastery < 0.3:
                difficulty = "基础"   # 概念题
            elif mastery < 0.6:
                difficulty = "中等"   # 应用题
            else:
                difficulty = "提高"   # 综合题
            
            exercises.extend(
                self.select_exercises(point, difficulty, n=5)
            )
        
        return exercises
    
    # 4. 间隔重复 (Spaced Repetition)
    # 艾宾浩斯遗忘曲线 + 个性化参数
    # 复习时机: 1天 → 3天 → 7天 → 15天 → 30天

# 效果:
# ├── 学习效率: ↑ 30-50% (比统一进度)
# ├── 知识留存: ↑ 40% (间隔重复)
# ├── 学生参与度: ↑ 25%
# └── 案例: Khan Academy, 松鼠AI, 猿辅导`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📝 AI 智能批改</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> auto_grading</div>
                <pre className="fs-code">{`AI 批改: 各学科方案

1️⃣ 作文批改 (中/英文)
├── 评分维度:
│   ├── 内容 (主题/论点/论据)
│   ├── 结构 (起承转合/段落)
│   ├── 语言 (词汇/语法/修辞)
│   ├── 字数 / 卷面
│   └── 综合评分 (百分制)
├── 技术: LLM + Rubric-based
├── 精度: 与人工评分相关系数 0.85+
├── 输出: 评分 + 逐段批注 + 修改建议
└── 挑战: 创意写作难评估

2️⃣ 数学批改
├── OCR: 手写公式识别
│   (HME → LaTeX → 语义理解)
├── 步骤分析: 逐步检查推理
│   不只看答案, 看每步过程
├── 错因诊断: 
│   "概念错误" / "计算错误" / "粗心"
├── LLM: 生成详细解题过程
└── 挑战: 多种解法都应该认可

3️⃣ 编程批改
├── 自动测试: 单元测试用例
├── 静态分析: 代码风格/复杂度
├── LLM 评审: 代码可读性/效率
├── 反馈: 具体改进建议
└── 防抄袭: 代码相似度检测

4️⃣ 主观题批改
├── 关键词匹配 (旧方案)
├── 语义理解 (新方案, LLM)
├── 评分标准对齐 (Rubric)
├── 一致性: 同题多评分一致
└── 精度: 与教师评分 90%+`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 教育知识图谱</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> edu_kg</div>
                <pre className="fs-code">{`教育知识图谱:

结构:
┌─────────────────────────────┐
│ 学科 → 章节 → 知识点 → 题目  │
│                             │
│  知识点关系:                  │
│  ├── 前置 (prerequisite)     │
│  ├── 包含 (contains)         │
│  ├── 关联 (related)          │
│  └── 拓展 (extends)          │
└─────────────────────────────┘

示例 (高中数学):

函数
├── [前置] → 集合, 映射
├── [包含] → 一次函数
│            ├── [前置] → 一元一次方程
│            └── [关联] → 直线方程
├── [包含] → 二次函数
│            ├── [前置] → 一元二次方程
│            └── [关联] → 抛物线
├── [包含] → 指数/对数函数
│            └── [前置] → 幂运算
└── [拓展] → 导数, 极限

应用:
1. 诊断性测评
   └── 学生答错→追溯前置知识薄弱
2. 自适应路径
   └── 根据掌握度→跳过已掌握
3. 错因分析
   └── 不是不会本知识点,而是前置没学好
4. 课程推荐
   └── 关联知识点→拓展学习

构建方法:
├── 人工: 学科专家标注 (准确但贵)
├── 半自动: NLP + 人工校验
├── LLM: 自动提取+关系推理
└── 规模: 数学 5000+知识点`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 AI 虚拟教师</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> ai_tutor.py</div>
                <pre className="fs-code">{`# —— AI 虚拟教师: 苏格拉底式 AI 导师 ——

class AITutor:
    """苏格拉底式 AI 导师"""
    
    async def teach(self, student_question, student_profile):
        """AI 教学对话"""
        
        # 核心原则: 不直接给答案，引导学生思考
        response = await self.llm.generate(
            system="""
你是一名耐心的AI导师,使用苏格拉底式教学法:

核心原则:
1. 不直接给答案,通过提问引导学生思考
2. 将复杂问题分解为小步骤
3. 给予积极鼓励("很好!""你的方向对了!")
4. 当学生困惑时,给出提示而非答案
5. 用类比和生活例子解释抽象概念
6. 根据学生水平调节难度

教学步骤:
1. 理解→ 确认学生的问题和困惑点
2. 引导→ 提出引导性问题
3. 启发→ 给出关键提示
4. 验证→ 让学生尝试解答
5. 总结→ 归纳方法和知识点
""",
            user=f"""
学生水平: {student_profile.level}
学科: {student_profile.subject}
当前知识点: {student_profile.current_topic}
学生问题: {student_question}

请用苏格拉底式方法引导学生。
"""
        )
        return response

# AI 虚拟教师进化:
# ├── 文本问答 (GPT-4, Claude)
# ├── 语音交互 (GPT-4o 实时语音)
# ├── 多模态 (拍照搜题+讲解)
# ├── 数字人 (虚拟形象+表情)
# └── AR/VR (沉浸式教学)
#
# 案例:
# ├── Khanmigo (Khan Academy + GPT-4)
# ├── Duolingo Max (语言学习)
# ├── Photomath (数学拍照解题)
# ├── Quizlet Q-Chat (学习助手)
# └── 学而思 MathGPT (中文数学)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🏫 教育 AI 产品全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> edu_landscape</div>
                <pre className="fs-code">{`教育 AI 产品全景:

学习辅助:
├── 搜题/解题: 小猿搜题, Photomath
├── 翻译/词典: DeepL, 有道
├── 写作辅助: Grammarly, 秘塔写作
└── 编程学习: Replit AI, GitHub Copilot

教学工具:
├── 备课: AI生成教案/PPT/题目
├── 批改: 自动评分+反馈
├── 分析: 学情分析/诊断报告
└── 管理: 智能排课/考务

自适应平台:
├── 国内: 松鼠AI, 洋葱数学
├── 国际: Khan Academy, ALEKS
├── 语言: Duolingo, Babbel
└── 职教: Coursera, Udemy + AI

新兴方向:
├── AI 伴学 (虚拟学伴)
├── AI 考试 (自适应测评)
├── AI 科研 (论文助手)
└── AI 心理 (学生心理关怀)

⚠️ 教育 AI 伦理:
├── 公平: 避免加剧教育不公
├── 隐私: 学生数据保护 (COPPA)
├── 依赖: 防止过度依赖AI
├── 抄袭: AI 生成内容检测
└── 人文: AI 不能替代人际互动`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 教育 AI 商业模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> business</div>
                <pre className="fs-code">{`教育 AI 商业模式:

B2C (面向学生/家长):
├── 订阅制: $10-50/月
│   (Duolingo, Khan Academy)
├── 按需付费: 单次$1-5
│   (搜题, 翻译)
├── 免费+增值: 基础免费
│   (广告 + Premium)
└── LTV: $200-2000/学生

B2B (面向学校/机构):
├── SaaS: $5-20/学生/年
│   (自适应平台)
├── 项目制: $50K-500K
│   (定制开发)
├── 硬件+软件: 智慧教室
│   ($5K-50K/教室)
└── LTV: $10K-200K/学校

关键指标:
├── DAU/MAU: 日活/月活比
├── 完课率: 学生完成率
├── 学习效果: 提分/通过率
├── 续费率: > 70%
└── NPS: > 50

市场规模:
├── 全球 EdTech: $400B (2025)
├── AI 教育: $30B+ (2025)
├── CAGR: 20-30%
└── 中国: ¥6000亿 (2025)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
