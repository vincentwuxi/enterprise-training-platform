import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const MAGIC_METHODS = [
  { name: '__init__', alias: '构造器', when: '创建实例时自动调用', example: 'obj = MyClass()' },
  { name: '__str__', alias: '字符串表示', when: 'print(obj) 或 str(obj)', example: '"Alice (25岁)"' },
  { name: '__repr__', alias: '开发者表示', when: 'repr(obj) 或 REPL 显示', example: '"User(name=\'Alice\')"' },
  { name: '__len__', alias: '长度', when: 'len(obj)', example: 'len(mylist)' },
  { name: '__getitem__', alias: '索引访问', when: 'obj[key]', example: 'mydict["key"]' },
  { name: '__iter__', alias: '迭代器', when: 'for x in obj', example: 'for item in mylist' },
  { name: '__eq__', alias: '相等', when: 'obj1 == obj2', example: 'user1 == user2' },
  { name: '__lt__', alias: '小于', when: 'obj1 < obj2 或 sorted()', example: 'sorted(users)' },
  { name: '__enter__/__exit__', alias: '上下文管理器', when: 'with obj:', example: 'with open(f):' },
  { name: '__call__', alias: '可调用对象', when: 'obj()', example: 'model(input_data)' },
];

const OOP_FULL = `class Animal:
    """基类"""
    species_count = 0          # 类属性（所有实例共享）

    def __init__(self, name: str, sound: str):
        self.name = name       # 实例属性
        self._sound = sound    # 约定 protected（单下划线）
        Animal.species_count += 1

    def speak(self) -> str:
        return f"{self.name} says {self._sound}!"

    @staticmethod
    def is_animal(obj) -> bool:
        return isinstance(obj, Animal)

    def __repr__(self):
        return f"Animal(name={self.name!r})"

    def __eq__(self, other):
        return isinstance(other, Animal) and self.name == other.name


class Dog(Animal):
    """继承 Animal"""
    def __init__(self, name: str, breed: str):
        super().__init__(name, "Woof")  # 调用父类构造器
        self.breed = breed

    def speak(self) -> str:
        # 重写 (Override) 父类方法
        return f"{super().speak()} *wags tail*"

    def fetch(self, item: str) -> str:
        return f"{self.name} fetches the {item}!"


class Cat(Animal):
    def __init__(self, name: str):
        super().__init__(name, "Meow")

    def speak(self) -> str:
        return f"{self.name} says Meow... (ignores you)"


# 多态：同一接口，不同行为
animals: list[Animal] = [Dog("Rex", "Labrador"), Cat("Whiskers")]
for a in animals:
    print(a.speak())

# → Rex says Woof! *wags tail*
# → Whiskers says Meow... (ignores you)`;

const DATACLASS_CODE = `from dataclasses import dataclass, field
from typing import ClassVar

@dataclass(order=True, frozen=False)
class Product:
    # 字段按定义顺序生成 __init__
    name: str
    price: float
    tags: list[str] = field(default_factory=list)

    # 不参与比较的类变量
    tax_rate: ClassVar[float] = 0.1

    @property
    def price_with_tax(self) -> float:
        return self.price * (1 + self.tax_rate)

    def __post_init__(self):
        # 初始化后验证
        if self.price < 0:
            raise ValueError("价格不能为负")

p = Product("Python Book", 59.9, ["tech", "programming"])
print(p.price_with_tax)   # 65.89
# 自动生成：__init__ __repr__ __eq__ __lt__ 等`;

export default function LessonOOP() {
  const navigate = useNavigate();
  const [selectedMagic, setSelectedMagic] = useState(null);
  const [tab, setTab] = useState('full');

  return (
    <div className="lesson-py">
      <div className="py-badge">🏗️ module_03 — 面向对象编程</div>

      <div className="py-hero">
        <h1>面向对象编程：类、继承与魔术方法</h1>
        <p>Python 是"一切皆对象"的语言。掌握 OOP 不是为了炫技，而是为了<strong>更好地组织复杂系统的代码结构</strong>。魔术方法让你的类像内建类型一样优雅。</p>
      </div>

      {/* 完整 OOP 示例 */}
      <div className="py-section">
        <h2 className="py-section-title">🐾 完整继承链示例</h2>
        <div className="py-interactive">
          <h3>
            Animal → Dog / Cat 多态演示
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`py-btn ${tab === 'full' ? 'primary' : ''}`} onClick={() => setTab('full')}>完整代码</button>
              <button className={`py-btn ${tab === 'dc' ? 'primary' : ''}`} onClick={() => setTab('dc')}>@dataclass</button>
            </div>
          </h3>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'full' ? 'oop_demo.py' : 'dataclass_demo.py'}</span>
          </div>
          <div className="py-editor">{tab === 'full' ? OOP_FULL : DATACLASS_CODE}</div>
        </div>
      </div>

      {/* 魔术方法 */}
      <div className="py-section">
        <h2 className="py-section-title">✨ 魔术方法（Dunder Methods）速查</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>点击查看触发时机：</p>
        <div className="py-grid-4" style={{ marginBottom: '0.75rem' }}>
          {MAGIC_METHODS.map((m, i) => (
            <div key={m.name}
              onClick={() => setSelectedMagic(selectedMagic === i ? null : i)}
              style={{
                padding: '0.7rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                background: selectedMagic === i ? 'rgba(26,86,219,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedMagic === i ? 'rgba(26,86,219,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>{m.name}</div>
              <div style={{ fontSize: '0.67rem', color: '#475569', marginTop: '0.2rem' }}>{m.alias}</div>
            </div>
          ))}
        </div>
        {selectedMagic !== null && (
          <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(26,86,219,0.06)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>触发时机</div><div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{MAGIC_METHODS[selectedMagic].when}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>示例</div><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: '#ce9178' }}>{MAGIC_METHODS[selectedMagic].example}</code></div>
          </div>
        )}
      </div>

      {/* ABC 抽象基类 */}
      <div className="py-section">
        <h2 className="py-section-title">📐 ABC 抽象基类 & Protocol</h2>
        <div className="py-grid-2">
          <div className="py-card">
            <h3>抽象基类（强制实现接口）</h3>
            <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>{`from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return 3.14 * self.r**2
    def perimeter(self): return 2 * 3.14 * self.r

# Shape()  ← TypeError! 不能实例化抽象类
c = Circle(5)  # ✅`}</div>
          </div>
          <div className="py-card">
            <h3>Protocol（鸭子类型接口，Python 3.8+）</h3>
            <div className="py-editor" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>{`from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Button:
    def draw(self):       # 无需继承 Drawable
        print("Draw button")

class Canvas:
    def draw(self):
        print("Draw canvas")

def render(item: Drawable):
    item.draw()

# 只要有 draw() 就符合协议
render(Button())   # ✅
render(Canvas())   # ✅`}</div>
          </div>
        </div>
      </div>

      {/* 封装 */}
      <div className="py-section">
        <h2 className="py-section-title">🔒 封装：公有、保护、私有属性</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>命名约定</th><th>含义</th><th>访问性</th><th>示例</th></tr></thead>
            <tbody>
              {[
                ['name', '公有属性', '任意访问', 'self.name'],
                ['_name', '约定保护（非强制）', '内部和子类使用', 'self._name'],
                ['__name', '名称修饰（强私有）', 'self._ClassName__name', 'self.__name'],
                ['__name__', '魔术属性', 'Python 内部使用', '__init__'],
              ].map(([n, m, a, e]) => (
                <tr key={n}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24' }}>{n}</code></td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{m}</td>
                  <td style={{ fontSize: '0.82rem', color: '#60a5fa' }}>{a}</td>
                  <td><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#ce9178' }}>{e}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/functions')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/dataio')}>下一模块：数据处理 →</button>
      </div>
    </div>
  );
}
