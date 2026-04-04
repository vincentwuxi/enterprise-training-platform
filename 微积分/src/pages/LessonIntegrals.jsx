import React from 'react';
import IntegralVisualizer from '../components/Interactive/IntegralVisualizer';
import FormulaDisplay from '../components/Math/FormulaDisplay';
import QuizPanel from '../components/Interactive/QuizPanel';
import { integralsQuiz } from '../data/quizData';
import './Lesson.css'; // Inheriting previous styles

export default function LessonIntegrals() {
  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <h1>第三章：积分的魔法 (Integrals)</h1>
        <p className="lesson-intro">
          导数关注的是“一瞬间的变化”，而积分关注的是“长期的累积”。在几何上，它通常意味着求出**一条曲线下方的面积**。
        </p>
      </header>

      <section className="lesson-section">
        <h3>1. 为什么面积如此重要？</h3>
        <p>
          回到我们开车的例子。如果横轴是时间，纵轴是速度，那么“速度段”底下的**面积**，其实就是你行驶的**总距离**。
        </p>
        <p>
          如果速度是保持 <FormulaDisplay inline math="60" /> km/h 不变的矩形块，面积很好算。面积 <FormulaDisplay inline math="= \text{速度} \times \text{时间}" />。
          但是，如果你的速度是在不断变化的（就像一条平滑的曲线），我们该如何计算这块不规则形状的面积呢？
        </p>
      </section>

      <section className="lesson-section">
        <h3>2. 黎曼和：化繁为简的艺术</h3>
        <p>
          数学家的解决思路是：**既然我们只会计算矩形的面积，那我们就把曲线下方的空间切分成无数个小矩形！**
        </p>
        <p>
          我们把区间横向等分成 <FormulaDisplay inline math="n" /> 份，每份宽度为 <FormulaDisplay inline math="\Delta x" />。然后用曲线在每个区间上的高等于对应矩形的高。
          把所有小矩形的面积加起来：
        </p>
        <FormulaDisplay math="\text{总面积} \approx \sum_{i=1}^{n} f(x_i)\Delta x" />
        <p>
          一开始，矩形很粗，边缘像阶梯，存在很大的误差。但当我们把切片切得越来越薄（也就是 <FormulaDisplay inline math="n \to \infty" /> ），那些多出来的或缺少的边角料就会奇迹般地消失无穷小！
        </p>
      </section>

      <section className="lesson-section">
        <IntegralVisualizer />
      </section>
      
      <QuizPanel questions={integralsQuiz} title="积分直觉测试" />

      <section className="lesson-section footer-nav">
        <button className="nav-btn prev">上一章: 导数体验</button>
        <button className="nav-btn next">完成课程</button>
      </section>
    </div>
  );
}
