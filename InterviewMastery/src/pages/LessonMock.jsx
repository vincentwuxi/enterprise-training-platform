import { useState, useRef, useCallback, useEffect } from 'react';
import './LessonCommon.css';

const MOCK_PROBLEMS = [
  { name: 'Two Sum', difficulty: 'Easy', time: 15, category: '哈希表', desc: '给定数组和目标值，返回两个数的索引使其和等于目标值。' },
  { name: 'LRU Cache', difficulty: 'Medium', time: 25, category: '设计', desc: '实现一个 LRU 缓存，支持 get 和 put 操作，O(1) 时间复杂度。' },
  { name: 'Merge Intervals', difficulty: 'Medium', time: 20, category: '排序', desc: '给定一组区间，合并所有重叠的区间。' },
  { name: 'Word Break', difficulty: 'Medium', time: 25, category: 'DP', desc: '给定字符串和词典，判断字符串能否被词典中的单词分割。' },
  { name: 'Trapping Rain Water', difficulty: 'Hard', time: 30, category: '双指针', desc: '给定柱状图，计算能接多少雨水。' },
];

const CHECKLIST = [
  { phase: '理解题意 (2-3 min)', items: ['复述题目确认理解', '问清边界条件(空输入/重复/溢出)', '写 2-3 个测试用例'] },
  { phase: '思路设计 (3-5 min)', items: ['先说暴力解 + 复杂度', '优化思路 → 匹配算法模式', '跟面试官确认方向再写'] },
  { phase: '编码实现 (10-15 min)', items: ['边写边讲解思路', '变量命名清晰', '先写核心逻辑再处理边界'] },
  { phase: '测试验证 (3-5 min)', items: ['手动 walk through 测试用例', '检查边界：空/单元素/全相同', '主动提出优化空间'] },
];

function Timer({ totalMinutes }) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const toggle = useCallback(() => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
      setRunning(true);
    }
  }, [running]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setSecondsLeft(totalMinutes * 60); };
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = (secondsLeft / (totalMinutes * 60)) * 100;
  const isLow = pct < 20;

  return (
    <div style={{textAlign:'center',padding:'1.5rem'}}>
      <div style={{fontSize:'3rem',fontWeight:900,fontFamily:'JetBrains Mono,monospace',color: isLow ? '#ef4444' : '#fbbf24',transition:'color 0.3s'}}>
        {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
      </div>
      <div className="iv-progress" style={{margin:'1rem 0'}}>
        <div className="iv-progress-fill" style={{width:`${pct}%`,background: isLow ? '#ef4444' : 'linear-gradient(90deg,#eab308,#22c55e)'}} />
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center'}}>
        <button className={`iv-btn ${running ? 'red' : 'primary'}`} onClick={toggle}>{running ? '⏸ 暂停' : '▶ 开始'}</button>
        <button className="iv-btn" onClick={reset}>🔄 重置</button>
      </div>
    </div>
  );
}

export default function LessonMock() {
  const [activeTab, setActiveTab] = useState('timer');
  const [selectedProblem, setSelectedProblem] = useState(0);

  return (
    <div className="lesson-iv">
      <div className="iv-hero">
        <div className="iv-badge purple">模块七 · Mock Interview</div>
        <h1>模拟面试 — 计时器 + 实战演练 + 复盘</h1>
        <p>练习不计时 = 白练。真实面试的紧张感主要来自<strong>时间压力</strong>。用计时器模拟真实环境，培养时间管理直觉。</p>
      </div>

      <div className="iv-section">
        <div className="iv-section-title">🧭 模拟面试工具</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {[['timer','面试计时器'],['problems','题目库'],['checklist','面试清单'],['debrief','复盘模板']].map(([k,l]) => (
            <button key={k} className={`iv-btn${activeTab===k?' primary':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'timer' && (
          <div className="iv-interactive">
            <h3>⏱️ 面试计时器</h3>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:'1rem',flexWrap:'wrap'}}>
              {MOCK_PROBLEMS.map((p, i) => (
                <button key={p.name} className={`iv-btn${selectedProblem===i?' primary':''}`} onClick={() => setSelectedProblem(i)}>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="iv-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                <div style={{fontWeight:700,color:'#fbbf24',fontSize:'1.1rem'}}>{MOCK_PROBLEMS[selectedProblem].name}</div>
                <div style={{display:'flex',gap:6}}>
                  <span className={`iv-tag ${MOCK_PROBLEMS[selectedProblem].difficulty==='Easy'?'green':MOCK_PROBLEMS[selectedProblem].difficulty==='Medium'?'gold':'red'}`}>
                    {MOCK_PROBLEMS[selectedProblem].difficulty}
                  </span>
                  <span className="iv-tag blue">{MOCK_PROBLEMS[selectedProblem].category}</span>
                </div>
              </div>
              <div style={{fontSize:'0.88rem',color:'var(--iv-muted)',marginBottom:'0.5rem'}}>{MOCK_PROBLEMS[selectedProblem].desc}</div>
              <Timer totalMinutes={MOCK_PROBLEMS[selectedProblem].time} key={selectedProblem} />
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div>
            <table className="iv-table">
              <thead><tr><th>#</th><th>题目</th><th>难度</th><th>时限</th><th>类别</th></tr></thead>
              <tbody>
                {MOCK_PROBLEMS.map((p, i) => (
                  <tr key={p.name}>
                    <td style={{fontWeight:700,color:'var(--iv-gold)'}}>{i+1}</td>
                    <td style={{fontWeight:600}}>{p.name}</td>
                    <td><span className={`iv-tag ${p.difficulty==='Easy'?'green':p.difficulty==='Medium'?'gold':'red'}`}>{p.difficulty}</span></td>
                    <td>{p.time} min</td>
                    <td><span className="iv-tag blue">{p.category}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div>
            {CHECKLIST.map(c => (
              <div key={c.phase} className="iv-card" style={{marginBottom:'0.75rem'}}>
                <div style={{fontWeight:700,color:'#fbbf24',marginBottom:'0.5rem'}}>{c.phase}</div>
                {c.items.map(item => (
                  <div key={item} style={{fontSize:'0.85rem',padding:'0.25rem 0',display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{width:16,height:16,borderRadius:4,border:'1.5px solid var(--iv-border)',display:'inline-block',flexShrink:0}} /> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'debrief' && (
          <div className="iv-code-wrap">
            <div className="iv-code-head">
              <div className="iv-code-dot" style={{background:'#ef4444'}} />
              <div className="iv-code-dot" style={{background:'#eab308'}} />
              <div className="iv-code-dot" style={{background:'#22c55e'}} />
              <span>mock_debrief_template.md</span>
            </div>
            <pre className="iv-code">{`# 模拟面试复盘模板

## 基本信息
- **日期**: ____
- **题目**: ____
- **计时**: __ / __ min (实际/目标)
- **结果**: AC / 部分通过 / 超时 / 未完成

## 表现评估 (1-5分)
- [ ] 题目理解: __/5 (是否问了对的问题)
- [ ] 思路阐述: __/5 (是否清晰沟通了思路)
- [ ] 编码质量: __/5 (代码整洁、命名规范)
- [ ] 时间管理: __/5 (各阶段分配是否合理)
- [ ] 测试调试: __/5 (是否主动测试边界)

## 做得好的
1. ____
2. ____

## 需要改进的
1. ____
2. ____

## 关键学习
- 算法模式: ____
- 时间管理: ____
- 沟通技巧: ____

## 下次目标
- [ ] ____
- [ ] ____`}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
