import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['自动微分原理', '计算图与反向模式', 'PyTorch Autograd', 'JAX 与实战'];

export default function LessonAutodiff() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_08 — 自动微分与实战</div>
      <div className="fs-hero">
        <h1>自动微分与实战：PyTorch Autograd / JAX</h1>
        <p>
          自动微分是深度学习的<strong>幕后英雄</strong>——
          它既不是符号微分（太慢），也不是数值微分（不精确），
          而是通过<strong>计算图</strong>精确高效地计算任意程序的梯度。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 自动微分深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 自动微分原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ad_basics.txt</div>
                <pre className="fs-code">{`═══ 三种微分方法对比 ═══

  1. 符号微分 (Symbolic):
     d/dx (x² + sin(x)) = 2x + cos(x)
     → 精确! 但表达式膨胀! (exponential blowup)
     → Mathematica/SymPy 使用此方法

  2. 数值微分 (Numerical):
     f'(x) ≈ (f(x+h) - f(x-h)) / (2h)
     → 简单但不精确! h 太小 → 浮点误差!
     → 每个参数需要一次函数求值: O(n) 次
     → 只用于验证梯度!

  3. 自动微分 (Automatic Differentiation):
     → 精确到机器精度!
     → 复杂度 = O(1) × 前向传播 (反向模式)
     → 深度学习的核心!

═══ 链式法则是核心 ═══

  f(x) = h(g(x))

  df/dx = dh/dg · dg/dx

  多元链式法则:
  ∂f/∂xᵢ = Σⱼ (∂f/∂zⱼ) · (∂zⱼ/∂xᵢ)

  → 自动微分 = 系统地应用链式法则!

═══ 前向模式 vs 反向模式 ═══

  前向模式 (Forward Mode):
  从输入到输出, 逐步传播导数
  每次计算 ∂output/∂xᵢ (一个输入变量)
  → 输入少时高效: f: ℝ → ℝⁿ

  反向模式 (Reverse Mode):
  从输出到输入, 逐步传播梯度
  每次计算 ∂L/∂所有参数 (一个输出变量)
  → 输出少时高效: f: ℝⁿ → ℝ

  深度学习: 损失 L 是标量 → ℝⁿ → ℝ
  → 反向模式完美! = 反向传播 (Backprop)!

═══ 对偶数 (Dual Numbers) ═══

  前向模式的优雅实现:
  
  扩展实数: a + bε  (ε² = 0)

  (a+bε) + (c+dε) = (a+c) + (b+d)ε
  (a+bε) × (c+dε) = ac + (ad+bc)ε
  f(a+bε) = f(a) + f'(a)·bε

  → 计算 f(x₀ + ε) = f(x₀) + f'(x₀)ε
  → 实部 = 函数值, 虚部 = 导数值!
  → 同时算出函数值和导数!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 计算图与反向模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> computation_graph.txt</div>
                <pre className="fs-code">{`═══ 计算图 (Computation Graph) ═══

  f(x,y) = (x+y) · sin(x)

  节点: 每个中间计算
  边:   数据依赖关系

  x ──→ [+] ──→ [×] ──→ f
  y ──↗       ↗
  x ──→ [sin]↗

  前向传播: 按拓扑排序求值
  反向传播: 反向遍历, 累计梯度

═══ 反向模式详解 ═══

  记 v̄ᵢ = ∂L/∂vᵢ (伴随值/adjoint)

  前向:
  v₁ = x           → v₁ = 2
  v₂ = y           → v₂ = 3
  v₃ = v₁ + v₂     → v₃ = 5
  v₄ = sin(v₁)     → v₄ = sin(2) ≈ 0.909
  v₅ = v₃ × v₄     → v₅ = 5 × 0.909 = 4.546

  反向 (从 v̄₅ = 1 开始):
  v̄₅ = 1
  v̄₃ = v̄₅ · v₄ = 0.909     (∂(v₃·v₄)/∂v₃ = v₄)
  v̄₄ = v̄₅ · v₃ = 5         (∂(v₃·v₄)/∂v₄ = v₃)
  v̄₁ = v̄₃ · 1 + v̄₄ · cos(v₁)  (两条路径!)
     = 0.909 + 5 × cos(2) ≈ 0.909 - 2.081 = -1.172
  v̄₂ = v̄₃ · 1 = 0.909

  → ∂f/∂x = -1.172, ∂f/∂y = 0.909
  → 一次反向传播算出所有偏导!

═══ 反向传播 = 反向模式 AD ═══

  神经网络的反向传播就是反向模式 AD!
  
  每个层/操作需要实现:
  1. forward(x): 计算输出 y 和保存需要的中间值
  2. backward(ḡ): 给定输出梯度, 计算输入梯度

  例: y = Wx + b
  forward: 保存 x (反向需要!)
  backward: 
    ∂L/∂W = ḡ · xᵀ
    ∂L/∂x = Wᵀ · ḡ
    ∂L/∂b = ḡ

═══ 内存 vs 计算的权衡 ═══

  反向传播需要保存所有中间值 → 内存大!
  
  梯度检查点 (Gradient Checkpointing):
  只保存部分中间值, 反向时重新计算其余
  → 内存 O(√n), 但计算 ×2

  → GPT-3 (1750 亿参数) 必须用!
  
  torch.utils.checkpoint.checkpoint(fn, *inputs)

═══ 复杂度定理 ═══

  Cheap Gradient Principle:
  反向传播的计算量 ≤ 5 × 前向传播

  → 计算梯度几乎"免费"!
  → 这就是深度学习能训练的根本原因!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔥 PyTorch Autograd</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> pytorch_autograd.py</div>
                <pre className="fs-code">{`# ═══ PyTorch Autograd 基础 ═══

import torch

# requires_grad=True → 追踪计算, 构建计算图
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = torch.tensor([1.0, 4.0], requires_grad=True)

# 前向计算 (自动构建计算图!)
z = x**2 + 3*y
loss = z.sum()

# 反向传播 (自动计算梯度!)
loss.backward()

print(x.grad)  # tensor([4., 6.])  → ∂loss/∂x = 2x
print(y.grad)  # tensor([3., 3.])  → ∂loss/∂y = 3

# ═══ 动态计算图 (Define-by-Run) ═══
#
# PyTorch: 每次前向重新构建图 → 支持任意 Python 控制流!
# TensorFlow 1.x: 先构建图再运行 (静态) → 笨重!
# TensorFlow 2.x (Eager): 也支持动态图了

def dynamic_model(x, training=True):
    y = x @ W1
    if training and torch.rand(1) > 0.5:  # 随机! 动态图处理自如!
        y = torch.dropout(y, p=0.3, train=True)
    return y @ W2

# ═══ 自定义 Autograd 函数 ═══

class MyReLU(torch.autograd.Function):
    @staticmethod
    def forward(ctx, input):
        ctx.save_for_backward(input)  # 保存中间值!
        return input.clamp(min=0)
    
    @staticmethod
    def backward(ctx, grad_output):
        input, = ctx.saved_tensors
        grad_input = grad_output.clone()
        grad_input[input < 0] = 0     # ReLU 导数!
        return grad_input

# 使用:
y = MyReLU.apply(x)

# ═══ 高阶导数 ═══

x = torch.tensor(3.0, requires_grad=True)
y = x**3  # y = x³

# 一阶导数
dy = torch.autograd.grad(y, x, create_graph=True)[0]
print(dy)  # 27.0 → 3x² = 27

# 二阶导数 (因为 create_graph=True, 一阶导数也在图中!)
d2y = torch.autograd.grad(dy, x)[0]
print(d2y)  # 18.0 → 6x = 18

# → Hessian-向量乘积: 不需要算整个 Hessian!
# torch.autograd.functional.hvp(f, x, v) → H·v

# ═══ 梯度累积 (大 batch 模拟) ═══

accumulation_steps = 4
for i, (batch_x, batch_y) in enumerate(dataloader):
    loss = model(batch_x, batch_y) / accumulation_steps
    loss.backward()  # 梯度累积!
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()

# ═══ 常见陷阱 ═══
#
# 1. 忘记 zero_grad() → 梯度累加 → 梯度爆炸!
# 2. 在 no_grad 外做推理 → 浪费内存!
# 3. inplace 操作破坏图 → a += b 改为 a = a + b
# 4. detach() 断开梯度流 → 故意不想传梯度时用`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ JAX 与前沿实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> jax_practice.py</div>
                <pre className="fs-code">{`# ═══ JAX: 可组合的函数变换 ═══
#
# PyTorch: 面向对象 (nn.Module)
# JAX:     函数式 (纯函数 + 变换!)

import jax
import jax.numpy as jnp

# ═══ grad: 自动微分 ═══

def f(x):
    return jnp.sin(x) * x**2

df = jax.grad(f)          # 一阶导数!
d2f = jax.grad(jax.grad(f))  # 二阶导数!
print(df(2.0))            # 精确到机器精度!

# 对向量函数:
def loss(params, x, y):
    pred = params['w'] @ x + params['b']
    return jnp.mean((pred - y)**2)

grads = jax.grad(loss)(params, x, y)
# grads 与 params 结构相同! (pytree!)

# ═══ jit: Just-In-Time 编译 ═══

@jax.jit
def fast_function(x):
    return jnp.dot(x, x) + jnp.sum(jnp.sin(x))

# 第一次: 编译 (trace → XLA → 机器码)
# 后续: 直接执行编译后代码 → 极快!

# ═══ vmap: 自动向量化 ═══

# 写单样本的代码:
def predict_single(params, x):
    return params['w'] @ x + params['b']

# 自动变成批量版本!
predict_batch = jax.vmap(predict_single, in_axes=(None, 0))
# → 不需要手动加 batch 维度!

# ═══ pmap: 自动并行化 ═══

# 跨多个 GPU/TPU 并行!
parallel_fn = jax.pmap(update_step)

# ═══ JAX 组合的威力 ═══

# grad + jit + vmap = 批量快速梯度!
batch_grad = jax.jit(jax.vmap(jax.grad(loss), in_axes=(None, 0, 0)))

# ═══ 微分方程 + 自动微分 ═══

# Neural ODE: 用 ODE 求解器做前向, AD 做反向!
from jax.experimental.ode import odeint

def dynamics(y, t, params):
    return neural_net(params, y)

y_final = odeint(dynamics, y0, t_span, params)
loss = jnp.sum(y_final**2)
grads = jax.grad(lambda p: jnp.sum(odeint(dynamics, y0, t_span, p)**2))(params)

# ═══ 自动微分在科学计算中 ═══
#
# 1. PINN (物理信息神经网络):
#    网络输出 u(x,t), AD 计算 ∂u/∂t, ∂²u/∂x²
#    → 直接在损失中强制 PDE!
#
# 2. 分子模拟:
#    能量 E(r) → 力 F = -∇E → AD!
#    → 比解析推导快得多!
#
# 3. 机器人学:
#    动力学 forward: 关节角 → 末端位置
#    逆运动学: AD 计算雅可比 → 梯度下降!
#
# 4. 金融:
#    期权定价: 对参数求偏导 → Greeks!
#    AD 比有限差分快且精确!

# ═══ AD 工具生态 ═══
#
# 框架         │ 模式        │ 语言    │ 特点
# ─────────────┼─────────────┼─────────┼──────
# PyTorch      │ 动态反向    │ Python  │ 易用
# JAX          │ 函数变换    │ Python  │ 组合性
# TensorFlow   │ 动态/静态   │ Python  │ 工业
# Enzyme       │ 编译器级    │ C/C++   │ 最快
# Zygote       │ 源码变换    │ Julia   │ 通用
# Stan         │ 反向        │ Stan    │ 统计`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
