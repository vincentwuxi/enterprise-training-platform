import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['AI 测试生成', '突变测试', 'TDD with AI', '端到端测试'];

export default function LessonAITesting() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_04 — AI 测试工程</div>
      <div className="fs-hero">
        <h1>AI 测试工程：自动生成测试 / 突变测试 / TDD with AI</h1>
        <p>
          测试是软件质量的基石，但大多数团队测试覆盖率不足 50%。
          AI 测试工程通过 <strong>LLM 自动生成单元测试、突变测试验证测试质量、
          AI 辅助 TDD 闭环</strong>，将测试效率提升 3-5 倍。
          本模块覆盖从测试用例生成到 E2E 全链路自动化的完整实战。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧪 AI 测试工程</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 AI 自动生成单元测试</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ai_test_gen.ts</div>
                <pre className="fs-code">{`// —— AI 测试生成: 从源码到完整测试 ——

// 源代码: calculateDiscount.ts
function calculateDiscount(
  price: number,
  userType: 'regular' | 'vip' | 'enterprise',
  quantity: number,
  couponCode?: string
): { finalPrice: number; discount: number } {
  let discount = 0;
  
  // 用户类型折扣
  if (userType === 'vip') discount += 0.1;
  if (userType === 'enterprise') discount += 0.2;
  
  // 数量折扣
  if (quantity >= 10) discount += 0.05;
  if (quantity >= 50) discount += 0.1;
  if (quantity >= 100) discount += 0.15;
  
  // 优惠券
  if (couponCode === 'SAVE20') discount += 0.2;
  
  // 最大折扣 50%
  discount = Math.min(discount, 0.5);
  
  const finalPrice = price * quantity * (1 - discount);
  return { finalPrice: Math.round(finalPrice * 100) / 100, discount };
}

// ---- AI 生成的测试 (Claude/GPT) ----
// Prompt: "为 calculateDiscount 生成完整的单元测试,
//          覆盖所有分支和边界条件"

describe('calculateDiscount', () => {
  // 基本场景
  test('regular user, no discount', () => {
    const result = calculateDiscount(100, 'regular', 1);
    expect(result).toEqual({ finalPrice: 100, discount: 0 });
  });

  // 用户类型折扣
  test('VIP user gets 10% off', () => {
    const result = calculateDiscount(100, 'vip', 1);
    expect(result).toEqual({ finalPrice: 90, discount: 0.1 });
  });

  test('enterprise user gets 20% off', () => {
    const result = calculateDiscount(100, 'enterprise', 1);
    expect(result).toEqual({ finalPrice: 80, discount: 0.2 });
  });

  // 数量折扣
  test('quantity 10+ gets additional 5%', () => {
    const result = calculateDiscount(10, 'regular', 10);
    expect(result).toEqual({ finalPrice: 95, discount: 0.05 });
  });

  // 折扣叠加
  test('VIP + quantity 100+ + coupon = max 50%', () => {
    // 0.1 + 0.15 + 0.2 = 0.45, capped at 0.5? No, 0.45 < 0.5
    const result = calculateDiscount(100, 'vip', 100, 'SAVE20');
    // 0.1 + 0.05 + 0.1 + 0.15 + 0.2 = 0.6 → capped at 0.5
    expect(result.discount).toBe(0.5);
    expect(result.finalPrice).toBe(5000); // 100*100*0.5
  });

  // 边界条件
  test('zero price', () => {
    const result = calculateDiscount(0, 'vip', 10);
    expect(result.finalPrice).toBe(0);
  });

  test('invalid coupon code ignored', () => {
    const result = calculateDiscount(100, 'regular', 1, 'INVALID');
    expect(result.discount).toBe(0);
  });

  // AI 发现的边界: 浮点精度
  test('handles floating point precision', () => {
    const result = calculateDiscount(33.33, 'regular', 3);
    expect(result.finalPrice).toBe(99.99);
  });
});

// AI 测试生成工具对比:
// ┌──────────────┬────────┬──────┬──────────────┐
// │ 工具          │ 覆盖率 │ 质量 │ 特色          │
// ├──────────────┼────────┼──────┼──────────────┤
// │ Qodo (Codium)│ 85%+  │ ⭐⭐⭐⭐│ 行为分析最深   │
// │ Copilot /test│ 70%+  │ ⭐⭐⭐ │ GitHub 集成   │
// │ Claude Code  │ 80%+  │ ⭐⭐⭐⭐│ 复杂逻辑最强   │
// │ Diffblue     │ 90%+  │ ⭐⭐⭐ │ Java 专精     │ 
// │ EvoSuite     │ 75%+  │ ⭐⭐  │ 开源/遗传算法  │
// └──────────────┴────────┴──────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧬 突变测试: 检验测试质量</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> mutation_testing.py</div>
                <pre className="fs-code">{`# —— 突变测试: "测试你的测试" ——

# 核心思想:
# 故意在源码中引入 Bug (突变体)
# 如果测试仍然通过 → 测试有漏洞!

# 突变操作符:
# ┌──────────────┬──────────┬──────────┐
# │ 操作符        │ 原始代码  │ 突变代码  │
# ├──────────────┼──────────┼──────────┤
# │ 条件取反      │ if a > b │ if a < b │
# │ 边界值        │ >= 10    │ > 10     │
# │ 算术替换      │ a + b    │ a - b    │
# │ 返回值        │ return x │ return 0 │
# │ 语句删除      │ x = f()  │ (删除)   │
# │ 常量替换      │ max=100  │ max=99   │
# └──────────────┴──────────┴──────────┘

class AIMutationTester:
    """AI 增强的突变测试"""
    
    def generate_mutants(self, source_code):
        """AI 生成高价值突变体"""
        
        # 传统: 暴力枚举所有可能的突变
        #       100 行代码 → 500+ 突变体 (太多!)
        
        # AI: 智能选择最有价值的突变
        prompt = f"""
分析以下代码, 生成最可能暴露测试漏洞的突变:

{source_code}

要求:
1. 关注业务逻辑关键路径
2. 优先边界条件突变
3. 避免等价突变 (改了但行为不变)
4. 每个突变给出"为什么这个重要"

只生成 10 个最有价值的突变体。
"""
        return self.llm.generate(prompt)
    
    def analyze_surviving(self, survivors):
        """分析存活的突变体 (测试漏洞)"""
        
        for mutant in survivors:
            analysis = self.llm.analyze(f"""
这个突变体存活了 (测试没有捕获到):

原始代码: {mutant.original}
突变代码: {mutant.mutated}
操作: {mutant.operator}

1. 为什么现有测试没有捕获?
2. 这代表什么风险?
3. 需要添加什么测试用例?
4. 生成修复测试的代码。
""")
            yield {
                "mutant": mutant,
                "risk": analysis.risk_level,
                "missing_test": analysis.test_code,
            }

# 突变测试工具:
# ├── Stryker (JS/TS) — 最流行
# ├── PITest (Java) — 业界标准
# ├── mutmut (Python) — 简单易用
# └── cosmic-ray (Python) — 分布式

# 指标:
# 突变分数 = 杀死的突变体 / 总突变体
# 目标: ≥ 80% (金融/医疗: ≥ 90%)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔄 TDD with AI 工作流</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> tdd_ai</div>
                <pre className="fs-code">{`# TDD with AI: AI 增强的测试驱动开发

# 传统 TDD:
# Red → Green → Refactor
# 人写测试 → 人写实现 → 人重构

# AI-TDD:
# Red → Green(AI) → Refactor(AI)
# 人写测试 → AI 生成实现 → AI 辅助重构

工作流:
┌──────────────────────────────────┐
│ 1. 🔴 Red: 人类写测试 (定义需求)  │
│    describe('PaymentService'...) │
│    test('should process...')     │
│                                  │
│ 2. 🟢 Green: AI 生成最小实现     │
│    Cursor: "@test 让所有测试通过" │
│    AI 分析测试 → 推导出实现       │
│                                  │
│ 3. 🔵 Refactor: AI 优化代码     │
│    "重构这个实现:                 │
│     - 提取公共逻辑               │
│     - 添加错误处理               │
│     - 优化性能                   │
│     确保测试仍然通过"             │
│                                  │
│ 4. 🧬 Verify: 突变测试           │
│    AI 生成突变 → 检验测试质量     │
│    如果有存活突变 → 补充测试      │
│                                  │
│ 5. 🔄 Iterate: 下一个功能        │
└──────────────────────────────────┘

为什么测试应该由人写?
├── 测试 = 需求的精确表达
├── 人类理解业务意图
├── AI 可能写"讨好"的测试
│   (让实现通过, 而非验证行为)
└── 测试驱动 = 设计驱动

AI 写的测试的风险:
├── ❌ 与实现耦合 (改实现就挂)
├── ❌ 遗漏边界条件
├── ❌ 不验证副作用
├── ❌ 覆盖率高但断言弱
└── ✅ 适合: 补充覆盖率不足`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📈 测试覆盖率提升策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> coverage_strategy</div>
                <pre className="fs-code">{`# AI 驱动测试覆盖率提升

# 问题: 项目覆盖率只有 45%
# 目标: 3 个月内提升到 80%+

阶段 1: AI 批量生成 (2 周)
├── 对所有未测试文件生成测试
├── 工具: Qodo / Claude Code
├── 预计覆盖率: 45% → 65%
├── 质量: 中等 (需人工审查)
└── 关注: 快速提升基准线

阶段 2: 精准补充 (4 周)
├── 分析未覆盖的代码路径
├── AI 生成针对性测试用例
├── 重点: 边界条件 + 错误路径
├── 预计覆盖率: 65% → 78%
└── 关注: 测试质量

阶段 3: 突变测试验证 (2 周)
├── 对关键模块做突变测试
├── 修复存活的突变体
├── 预计覆盖率: 78% → 82%
├── 突变分数: ≥ 80%
└── 关注: 测试有效性

阶段 4: 持续维护
├── CI 质量门禁: ≥ 80%
├── 新代码必须有测试
├── AI 自动检测覆盖退化
└── 月度突变测试报告

成本估算:
┌──────────┬────────┬────────┐
│ 方法      │ 时间   │ 成本    │
├──────────┼────────┼────────┤
│ 纯人工    │ 6个月  │ $45K   │
│ AI辅助    │ 2个月  │ $8K    │
│ 节省      │ 67%   │ 82%    │
└──────────┴────────┴────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 AI E2E 测试自动化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> e2e_ai.ts</div>
                <pre className="fs-code">{`// AI 驱动的 E2E 测试

// 1. 自然语言 → E2E 测试代码
// Prompt: "用户注册 → 登录 → 创建项目 → 邀请成员"

// AI 生成的 Playwright 测试:
test('complete user journey', async ({ page }) => {
  // 注册
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecureP@ss123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // 创建项目
  await page.click('[data-testid="new-project"]');
  await page.fill('[name="project-name"]', 'My Project');
  await page.click('button:has-text("Create")');
  await expect(page.locator('.project-card')).toBeVisible();

  // 邀请成员
  await page.click('[data-testid="invite-member"]');
  await page.fill('[name="invite-email"]', 'member@example.com');
  await page.selectOption('[name="role"]', 'editor');
  await page.click('button:has-text("Send Invite")');
  await expect(page.locator('.toast-success')).toBeVisible();
});

// 2. AI 视觉测试 (Screenshot Diff)
// 传统: 像素对比 → 高误报
// AI: 语义对比 → 理解"有意义的变化"
//
// AI 判断:
// ✅ 按钮颜色变了 → 有意义 → 报告
// ❌ 动画帧不同   → 无意义 → 忽略
// ❌ 时间戳变了   → 动态内容 → 忽略

// 3. AI 自愈测试 (Self-Healing)
// 问题: 选择器变了 → 测试挂了
// AI 自愈:
// 原始: page.click('#old-button-id')
// 自愈: page.click('button:has-text("Submit")')
// 原理: AI 理解元素语义, 自动找到新选择器

// E2E 测试工具 + AI:
// ┌──────────────┬────────────────────┐
// │ 工具          │ AI 能力             │
// ├──────────────┼────────────────────┤
// │ Playwright   │ Copilot 生成测试    │
// │ Cypress      │ AI 自愈选择器       │
// │ Testim       │ AI 视觉/自愈/生成  │
// │ Mabl         │ AI 全自动化测试     │
// │ Applitools   │ AI 视觉比对领先    │
// └──────────────┴────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
