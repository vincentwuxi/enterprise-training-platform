import React from 'react';
import LimitVisualizer from '../components/Interactive/LimitVisualizer';
import FormulaDisplay from '../components/Math/FormulaDisplay';
import QuizPanel from '../components/Interactive/QuizPanel';
import { limitsQuiz } from '../data/quizData';
import './Lesson.css'; // Shared layout styles

export default function LessonLimits() {
  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <h1>第一章：极限的直觉 (Limits)</h1>
        <p className="lesson-intro">
          在微积分的世界里，最基本的问题不是“它等于什么？”，而是“当它无限靠近时，它**看起来**像什么？”。这就是极限（Limits）的本质。
        </p>
      </header>

      <section className="lesson-section">
        <h3>1. 芝诺的悖论与无限逼近</h3>
        <p>
          想象你正站在离墙 <FormulaDisplay inline math="2" /> 米远的地方。你每一次只能往前走剩余距离的一半。第一步你走了 <FormulaDisplay inline math="1" /> 米，第二步走了 <FormulaDisplay inline math="0.5" /> 米，接着 <FormulaDisplay inline math="0.25" /> 米……
        </p>
        <p>
          从严格逻辑上讲，只要每一次只能走一半，无论走多少步，你永远都无法真正“触碰”到那面墙。但从旁观者的角度来看你的“运动趋势”，毫无疑问：你正在**无限逼近**墙面。墙不仅是你的目的地，更是你运动规律的最终**“极限”**。
        </p>
      </section>

      <section className="lesson-section">
        <h3>2. 数学空间里的“禁区”</h3>
        <p>
          在函数的世界里，有些点被标记为“禁区”。例如，不允许把任何数除以 <FormulaDisplay inline math="0" />。
          看看这个著名的函数：<FormulaDisplay inline math="f(x) = \frac{\sin(x)}{x}" />。
        </p>
        <p>
          如果你直接把 <FormulaDisplay inline math="x = 0" /> 代入，你会得到 <FormulaDisplay inline math="\frac{0}{0}" />，计算器会直接报错。但这并不意味在它周围没有规律！极限的思想允许我们站在禁区的边缘“向里偷瞄”——只要不真正踩上禁区即可。
        </p>
      </section>

      <section className="lesson-section">
        <LimitVisualizer />
      </section>

      <QuizPanel questions={limitsQuiz} title="极限基础测试" />
      
      <section className="lesson-section footer-nav">
        <button className="nav-btn prev" disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>已经是第一章</button>
        <button className="nav-btn next">跳转到第二章：导数</button>
      </section>
    </div>
  );
}
