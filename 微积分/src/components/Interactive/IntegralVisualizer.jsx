import React, { useState } from 'react';
import FormulaDisplay from '../Math/FormulaDisplay';
import './IntegralVisualizer.css'; // Let's reuse Derivative visualizer base styles, or create new ones

export default function IntegralVisualizer() {
  const [n, setN] = useState(4); // number of rectangles
  
  // Math constants for f(x) = x^2
  const f = (x) => Math.pow(x, 2);
  const a = 0;
  const b = 5;
  const dx = (b - a) / n;
  
  const trueArea = 125 / 3; // exact integral of x^2 from 0 to 5 is 41.666...
  
  let currentArea = 0;
  let rectangles = [];
  
  // Right Riemann Sum
  for (let i = 1; i <= n; i++) {
    const x = a + i * dx;
    const height = f(x);
    const rectArea = height * dx;
    currentArea += rectArea;
    rectangles.push({ x: x - dx, width: dx, height: height });
  }

  // SVG scales
  // x domain [0, 5.5], width 400 -> scaleX ~ 70
  // y domain [0, 30], height 300 -> scaleY ~ 10
  const scaleX = (val) => val * 70;
  const scaleY = (val) => 300 - val * 9;
  
  // Generate path data for the parabola
  let pathD = `M ${scaleX(0)},${scaleY(0)} `;
  for (let x = 0; x <= 5.2; x += 0.1) {
    pathD += `L ${scaleX(x)},${scaleY(f(x))} `;
  }

  // Error percentage
  const error = Math.abs(currentArea - trueArea) / trueArea * 100;

  return (
    <div className="visualizer-card glass-panel integral-vis">
      <div className="card-header">
        <h2>化零为整的黎曼和 (Riemann Sums)</h2>
        <p className="subtitle">
          拖动滑块增加矩形的数量 <FormulaDisplay inline math="n" />，观察它们如何“填满”曲线下方的面积。
        </p>
      </div>
      
      <div className="visualizer-content">
        <div className="graph-container">
          <svg viewBox="0 0 400 300" className="math-graph">
            {/* Grid & Axes */}
            <line x1="0" y1={scaleY(0)} x2="400" y2={scaleY(0)} className="axis" />
            <line x1={scaleX(0)} y1="0" x2={scaleX(0)} y2="300" className="axis" />
            
            {/* Rectangles */}
            <g className="rectangles-group">
              {rectangles.map((rect, idx) => (
                <rect
                  key={idx}
                  x={scaleX(rect.x)}
                  y={scaleY(rect.height)}
                  width={scaleX(rect.width) - scaleX(0)}
                  height={scaleY(0) - scaleY(rect.height)}
                  className="riemann-rect"
                  style={{
                    opacity: 0.5 + (0.5 * (idx / n)),
                    fill: 'var(--accent-secondary)',
                    stroke: 'none' /* We will add a gap via rect.width slightly reduced if needed, or stroke */
                  }}
                />
              ))}
              {/* Overlay stroke to make boundaries visible */}
              {rectangles.map((rect, idx) => (
                <rect
                  key={'s'+idx}
                  x={scaleX(rect.x)}
                  y={scaleY(rect.height)}
                  width={scaleX(rect.width) - scaleX(0)}
                  height={scaleY(0) - scaleY(rect.height)}
                  fill="none"
                  stroke="var(--bg-primary)"
                  strokeWidth="1.5"
                />
              ))}
            </g>

            {/* Function Curve (drawn above rectangles) */}
            <path d={pathD} className="curve" fill="none" style={{stroke: 'var(--accent-primary)'}} />
          </svg>
        </div>
        
        <div className="controls-panel">
          <div className="control-group">
            <label>控制切割数量 n:</label>
            <input 
              type="range" 
              min="2" 
              max="50" 
              step="1" 
              value={n} 
              onChange={(e) => setN(parseInt(e.target.value))}
              className="slider"
            />
            <div className="value-badge">n = {n}</div>
          </div>
          
          <div className="formula-box">
             <FormulaDisplay 
               math={`\\sum_{i=1}^{${n}} f(x_i)\\Delta x \\approx ${currentArea.toFixed(2)}`} 
               highlight={n >= 40}
             />
             <div className="stats-row">
                <span>真实面积: {trueArea.toFixed(2)}</span>
                <span className={error < 5 ? "text-success" : "text-warning"}>
                  误差: {error.toFixed(1)}%
                </span>
             </div>

             {n >= 40 ? (
                <div className="success-message">
                  🎉 完美逼近！当矩形无穷多时，它们叠加的总和就等于积分的精确值。这是“微积分基本定理”直觉的核心。
                </div>
             ) : (
                <div className="info-message">
                  目前矩形较少，存在明显的“误差”（超出多出的面积）。继续增加矩形试一试！
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
