import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DECORATOR_DEMOS = [
  {
    name: '@property', desc: '将方法伪装成属性访问，实现 getter/setter 控制',
    code: `class Temperature:
    def __init__(self, celsius):
        self._c = celsius

    @property
    def celsius(self):
        return self._c

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._c = value

    @property
    def fahrenheit(self):
        return self._c * 9/5 + 32

t = Temperature(25)
print(t.fahrenheit)   # 77.0
t.celsius = 100       # 触发 setter`,
  },
  {
    name: '@staticmethod', desc: '静态方法，不依赖实例或类，像普通函数但归属于类',
    code: `class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def is_prime(n):
        if n < 2: return False
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0: return False
        return True

# 无需实例化
print(MathUtils.add(3, 4))      # 7
print(MathUtils.is_prime(17))   # True`,
  },
  {
    name: '@classmethod', desc: '类方法，第一个参数是 cls（类本身），常用作工厂方法',
    code: `class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, date_str):
        # "2024-01-15" → Date(2024, 1, 15)
        y, m, d = map(int, date_str.split('-'))
        return cls(y, m, d)

    def __repr__(self):
        return f"Date({self.year}, {self.month}, {self.day})"

d = Date.from_string("2024-04-05")
print(d)  # Date(2024, 4, 5)`,
  },
];

const SCOPE_CODE = `# Python 作用域：LEGB 顺序
# Local → Enclosing → Global → Built-in

x = "global"

def outer():
    x = "enclosing"      # Enclosing 作用域

    def inner():
        x = "local"      # Local 作用域
        print(x)         # → "local"

    inner()
    print(x)             # → "enclosing"

outer()
print(x)                 # → "global"

# global / nonlocal 关键字
count = 0
def increment():
    global count          # 声明修改全局变量
    count += 1

def make_counter():
    n = 0
    def inc():
        nonlocal n        # 声明修改闭包变量
        n += 1
        return n
    return inc`;

export default function LessonFunctions() {
  const navigate = useNavigate();
  const [activeDecorator, setActiveDecorator] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge">🔧 module_02 — 函数与模块</div>

      <div className="py-hero">
        <h1>函数与模块：构建可复用的优雅代码</h1>
        <p>Python 函数不只是封装代码块——<strong>装饰器、闭包、lambda</strong> 让它成为强大的元编程工具。模块化思维是区分业余和专业 Python 程序员的关键。</p>
      </div>

      {/* 函数定义精要 */}
      <div className="py-section">
        <h2 className="py-section-title">🎯 函数参数全类型速览</h2>
        <div className="py-card">
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>args_demo.py</span>
          </div>
          <div className="py-editor">{`def demo(pos, /, normal, *, kw_only, **kwargs):
    """
    pos       — 仅位置参数（/ 之前，Python 3.8+）
    normal    — 普通参数（位置或关键字均可传）
    kw_only   — 仅关键字参数（* 之后）
    **kwargs  — 收集多余关键字参数为 dict
    """
    pass

# *args 收集多余位置参数为 tuple
def sum_all(*args):
    return sum(args)

print(sum_all(1, 2, 3, 4, 5))  # 15

# 函数注解（Type Hints）— Python 3.5+
def greet(name: str, times: int = 1) -> str:
    return (f"Hello, {name}! " * times).strip()

# Lambda — 匿名单行函数
square = lambda x: x ** 2
sorted_data = sorted(["banana","apple","cherry"], key=lambda s: len(s))`}</div>
        </div>
      </div>

      {/* 装饰器 */}
      <div className="py-section">
        <h2 className="py-section-title">🎨 装饰器（Decorator）详解</h2>
        <div className="py-interactive">
          <h3>
            核心装饰器模式
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {DECORATOR_DEMOS.map((d, i) => (
                <button key={d.name} className={`py-btn ${activeDecorator === i ? 'primary' : ''}`}
                  onClick={() => setActiveDecorator(i)}
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{d.name}</button>
              ))}
            </div>
          </h3>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
            {DECORATOR_DEMOS[activeDecorator].desc}
          </div>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{DECORATOR_DEMOS[activeDecorator].name}.py</span>
          </div>
          <div className="py-editor">{DECORATOR_DEMOS[activeDecorator].code}</div>
        </div>

        {/* 自定义装饰器 */}
        <div className="py-card">
          <h3>✍️ 手写一个计时装饰器</h3>
          <div className="py-editor">{`import time
import functools

def timer(func):
    @functools.wraps(func)  # 保留原函数的元信息
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} 耗时: {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

slow_sum(10_000_000)  # slow_sum 耗时: 0.3821s`}</div>
        </div>
      </div>

      {/* 作用域 */}
      <div className="py-section">
        <h2 className="py-section-title">🔭 作用域与闭包 (LEGB)</h2>
        <div className="py-card">
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>scope.py</span>
          </div>
          <div className="py-editor">{SCOPE_CODE}</div>
        </div>
      </div>

      {/* 模块与包 */}
      <div className="py-section">
        <h2 className="py-section-title">📦 模块与包管理</h2>
        <div className="py-grid-2">
          {[
            { title: '模块导入规范', code: `# PEP 8 导入顺序：
# 1. 标准库
import os, sys
from pathlib import Path

# 2. 第三方库
import requests
import numpy as np

# 3. 本地模块
from myapp.utils import helper

# 避免 wildcard 导入
# from os import *  ← 不推荐！` },
            { title: 'pip 包管理', code: `# 安装依赖
pip install requests

# 固定版本（生产推荐）
pip install "requests==2.31.0"

# 导出依赖
pip freeze > requirements.txt

# 从 requirements.txt 安装
pip install -r requirements.txt

# 推荐：用 uv（更快的 pip 替代）
pip install uv
uv pip install requests` },
            { title: '虚拟环境', code: `# 创建虚拟环境
python -m venv .venv

# 激活（macOS/Linux）
source .venv/bin/activate

# 激活（Windows）
.venv\\Scripts\\activate

# 退出
deactivate

# 现代方案：uv
uv venv
source .venv/bin/activate` },
            { title: '__name__ 守卫', code: `# mymodule.py
def main():
    print("执行主逻辑")

def helper():
    return "辅助函数"

# 关键：只有直接运行时才执行 main()
# 被 import 时不会自动运行
if __name__ == "__main__":
    main()

# 测试：
# python mymodule.py   → 执行 main()
# import mymodule      → 不执行 main()` },
          ].map(s => (
            <div key={s.title} className="py-card">
              <h3>{s.title}</h3>
              <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>{s.code}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/basics')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/oop')}>下一模块：面向对象 →</button>
      </div>
    </div>
  );
}
