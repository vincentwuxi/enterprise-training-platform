import React from 'react';
import DerivativeVisualizer from '../components/Interactive/DerivativeVisualizer';
import FormulaDisplay from '../components/Math/FormulaDisplay';
import QuizPanel from '../components/Interactive/QuizPanel';
import { derivativesQuiz } from '../data/quizData';
import './Lesson.css';

export default function LessonDerivatives() {
  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <h1>第二章：导数的直觉 (Derivatives)</h1>
        <p className="lesson-intro">
          导数（Derivative）听起来像是一个高深莫测的数学词汇，但它的核心思想其实非常接地气：<strong>在特定的瞬间，事物是以多快的速度在变化？</strong>
        </p>
      </header>

      <section className="lesson-section">
        <h3>1. 从平均速度到瞬时速度</h3>
        <p>
          想象你正在开车。如果你在 <FormulaDisplay inline math="2" /> 小时内行驶了 <FormulaDisplay inline math="120" /> 公里，你的<strong>平均速度</strong>是 <FormulaDisplay inline math="60" /> km/h。
          但这并不意味着你每一秒都准确地以 <FormulaDisplay inline math="60" /> km/h 的速度行驶。也许中间你停下来喝了杯咖啡，或者在高速上开到了 <FormulaDisplay inline math="100" /> km/h。
        </p>
        <p>
          如果你看一眼汽车的里程表针，它指向的具体数值，其实就是那一刻的<strong>瞬时速度</strong>。
          微积分的先驱们（牛顿和莱布尼茨）在几百年前遇到了一个巨大的难题：我们如何用数学来准确表达“一瞬间”的速度？
        </p>
      </section>

      <section className="lesson-section">
        <h3>2. 极限的思想：用已知逼近未知</h3>
        <p>
          我们已经知道如何求一段时间内的平均变化率（即割线的斜率）。
          假设时间间隔是 <FormulaDisplay inline math="\Delta x" />，公式如下：
        </p>
        <FormulaDisplay math="\text{平均变化率} = \frac{f(x + \Delta x) - f(x)}{\Delta x}" />
        <p>
          牛顿的魔法在于：如果我们将这个时间间隔 <FormulaDisplay inline math="\Delta x" /> 无限缩短，缩短到几乎是 <FormulaDisplay inline math="0" /> 呢？此时的“割线”就会变成“切线”，而平均速率就会变成我们要寻找的“瞬时速率”！
        </p>
      </section>

      <section className="lesson-section">
        <DerivativeVisualizer />
      </section>

      <QuizPanel questions={derivativesQuiz} title="导数直觉测试" />
      
      <section className="lesson-section footer-nav">
        <button className="nav-btn prev">上一章: 极限基础</button>
        <button className="nav-btn next">完成理论体验，开始练习</button>
      </section>
    </div>
  );
}
