import React, { useState } from 'react';
import FormulaDisplay from '../Math/FormulaDisplay';
import './LimitVisualizer.css';

export default function LimitVisualizer() {
  const [x, setX] = useState(2.0); // start slightly off-center
  
  const numX = Number(x);
  const isZero = numX === 0;

  // The true limit we are heading to
  const L = 1;
  
  // Math function
  const f = (val) => {
    if (val === 0) return NaN;
    return Math.sin(val) / val;
  };
  
  const y = f(numX);

  // SVG Scalers mapping [-10, 10]x to [0, 500] and [-0.5, 1.5]y to [300, 0]
  const scaleX = (val) => 250 + val * 22;
  const scaleY = (val) => 250 - val * 120;
  
  // Generate smooth sine curve
  let curvePaths = [];
  let currentPath = [];
  
  for (let curveX = -10; curveX <= 10.1; curveX += 0.2) {
    if (Math.abs(curveX) < 0.05) {
      // jump over the exact zero hole to avoid drawing full stroke through it if we were strict
      curvePaths.push(currentPath);
      currentPath = [];
    } else {
      currentPath.push(`${scaleX(curveX)},${scaleY(f(curveX))}`);
    }
  }
  curvePaths.push(currentPath);
  
  const renderPathD = curvePaths.map(p => {
    if(p.length > 0) return `M ${p.join(" L ")}`;
    return "";
  }).join(" ");

  // Target point geometry
  const px = scaleX(numX);
  const py = isZero ? scaleY(L) : scaleY(y);

  return (
    <div className="visualizer-card glass-panel limit-vis">
      <div className="card-header">
        <h2>无限逼近的艺术 (Limits)</h2>
        <p className="subtitle">
          移动滑块，观察 <FormulaDisplay inline math="f(x) = \frac{\sin(x)}{x}" /> 在 <FormulaDisplay inline math="x=0" /> 附近的表现。
        </p>
      </div>
      
      <div className="visualizer-content">
        <div className="graph-container limit-graph">
          <svg viewBox="0 0 500 300" className="math-graph">
            {/* Grid & Axes */}
            <line x1="0" y1={scaleY(0)} x2="500" y2={scaleY(0)} className="axis" />
            <line x1={scaleX(0)} y1="0" x2={scaleX(0)} y2="300" className="axis" />
            
            {/* Y=1 Reference Line */}
            <line x1="0" y1={scaleY(1)} x2="500" y2={scaleY(1)} className="dashed-helper" />
            <text x="10" y={scaleY(1) - 10} className="svg-text highlight-text">y = 1</text>
            
            {/* Function Curve */}
            <path d={renderPathD} className="curve limit-curve" fill="none" />
            
            {/* The undefined Hole at x=0, y=1 */}
            <circle cx={scaleX(0)} cy={scaleY(1)} r="7" className={`hole ${isZero ? 'hole-active' : ''}`} />
            
            {/* Moving Point */}
            {!isZero && (
              <g className="moving-target">
                <line x1={px} y1={scaleY(0)} x2={px} y2={py} className="tracker-line" />
                <circle cx={px} cy={py} r="5" className="tracker-point" />
                <text x={px + 10} y={py - 10} className="svg-text highlight-text">
                  ({numX.toFixed(2)}, {y.toFixed(2)})
                </text>
              </g>
            )}

            {/* Error Marker when x=0 */}
            {isZero && (
              <g className="error-target">
                <text x={scaleX(0) + 15} y={scaleY(1) + 5} className="svg-text error-text">
                  未定义 (Undefined)
                </text>
              </g>
            )}
          </svg>
        </div>
        
        <div className="controls-panel">
          <div className="control-group">
            <label>控制逼近变量 x:</label>
            <input 
              type="range" 
              min="-6" 
              max="6" 
              step="0.05" 
              value={x} 
              onChange={(e) => setX(e.target.value)}
              className="slider"
            />
            <div className="value-badge">x = {numX > 0 ? '+' : ''}{numX.toFixed(2)}</div>
          </div>
          
          <div className="formula-box limit-formula">
             {isZero ? (
               <div className="error-message">
                 🚨 警告：被除数不能为 0！产生 $0/0$ 形式错误。<br/>
                 但在极限的概念下：<FormulaDisplay math="\lim_{x \to 0} \frac{\sin(x)}{x} = 1" />
               </div>
             ) : (
               <>
                 <FormulaDisplay 
                   math={`f(${numX.toFixed(2)}) = \\frac{\\sin(${numX.toFixed(2)})}{${numX.toFixed(2)}} = ${y.toFixed(4)}`} 
                 />
                 <div className="info-message limit-info">
                   尝试将 $x$ 移动到严丝合缝的 $0.00$，看看会发生什么故障并观察周围的神奇收敛现象。
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
