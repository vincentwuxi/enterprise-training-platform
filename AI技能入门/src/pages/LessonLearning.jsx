import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PieChart, Dog } from 'lucide-react';
import './LessonCommon.css';

const COMPARISON = [
  { name: '监督学习', needLabel: '✅ 需要', suitable: '分类/预测问题', examples: '垃圾邮件过滤、医疗影像识别、贷款风险评估' },
  { name: '无监督学习', needLabel: '❌ 不需要', suitable: '聚类/模式发现', examples: '用户群体分层、异常检测、推荐系统分组' },
  { name: '强化学习', needLabel: '♻️ 靠奖惩信号', suitable: '序列决策问题', examples: '游戏AI、机器人走路、自动驾驶决策' },
];

export default function LessonLearning() {
  const navigate = useNavigate();
  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧅 洋葱第三层</div>
         <h1>机器是怎么上课的？（三大门派）</h1>
         <p className="lesson-intro">
            既然模型是通过数据学习来的，那具体是用什么姿势学？行业内把 AI 获取知识的方法分为<strong>绝活三大流派</strong>。
         </p>
      </header>

      <section className="lesson-section mt-8">
         <div className="ethics-grid gap-6">
            <div className="ethics-card glass-panel" style={{borderLeftColor: "#3b82f6"}}>
               <div className="ethics-header">
                  <BookOpen className="text-blue-400" />
                  <h3>门派一：监督学习 (Supervised Learning)</h3>
               </div>
               <p className="font-bold text-blue-300 mb-2">比喻：带标准答案的练习册</p>
               <p>你教孩子认字，拿出一张卡片写着"A"，并且口头告诉他这是 A。给 AI 看一万张狗的图片，每张都明确打上标签"狗"。等练习册做完，AI 学会了局部特征，遇到新图片就能稳稳地认出。</p>
               <p className="mt-2 text-xs text-gray-400">📌 典型应用：手机人脸解锁（成千上万张人脸图片 + 标注）</p>
            </div>

            <div className="ethics-card glass-panel" style={{borderLeftColor: "#8b5cf6"}}>
               <div className="ethics-header">
                  <PieChart className="text-purple-400" />
                  <h3>门派二：无监督学习 (Unsupervised Learning)</h3>
               </div>
               <p className="font-bold text-purple-300 mb-2">比喻：不带答案，自己找共同点</p>
               <p>甩给 AI 几万个消费者的超市购物记录，没有任何预设标签。AI 凭借极其庞大的算法，自己从数据中"抠出"聚类规律，比如它惊人地发现：买"啤酒"的人大概率经常和"尿布"一起结算。它<strong>自动</strong>为你分出了人群画像。</p>
               <p className="mt-2 text-xs text-gray-400">📌 典型应用：电商"猜你喜欢"（对没有行为标注的用户做分组）</p>
            </div>

            <div className="ethics-card glass-panel" style={{borderLeftColor: "#f59e0b"}}>
               <div className="ethics-header">
                  <Dog className="text-orange-400" />
                  <h3>门派三：强化学习 (Reinforcement Learning)</h3>
               </div>
               <p className="font-bold text-orange-300 mb-2">比喻：训狗模拟器</p>
               <p>AlphaGo 下围棋为什么无敌？因为没人能给它无穷的围棋标准答案。科学家直接弄了一个<strong>模拟环境</strong>，让它在里面左右互搏盲下几千万盘。<br/>法则只有一个：<strong>赢了给一块大饼干奖励，输了扣分</strong>。为了追求分数最大化，这个瞎下棋的 AI 自己摸索出了围棋的"降维打击手法"。</p>
               <p className="mt-2 text-xs text-gray-400">📌 典型应用：ChatGPT 使用 RLHF 让人类给生成结果打分，不断纠正回答质量</p>
            </div>
         </div>
      </section>

      <section className="lesson-section glass-panel mt-10" style={{padding: "1.5rem"}}>
        <h3 className="mb-4">📊 三大门派速查对比表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-gray-400 font-medium">门派</th>
                <th className="text-left p-3 text-gray-400 font-medium">需要标注数据？</th>
                <th className="text-left p-3 text-gray-400 font-medium">适合什么问题</th>
                <th className="text-left p-3 text-gray-400 font-medium">代表应用场景</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{row.name}</td>
                  <td className="p-3 text-gray-300">{row.needLabel}</td>
                  <td className="p-3 text-gray-300">{row.suitable}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery/lesson/jargon')}>武功已学！剥开第四层：听懂大模型黑话！</button>
      </section>
    </div>
  );
}
