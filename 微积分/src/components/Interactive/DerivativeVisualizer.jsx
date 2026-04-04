import React, { useState } from 'react';
import FormulaDisplay from '../Math/FormulaDisplay';
import './DerivativeVisualizer.css';

export default function DerivativeVisualizer() {
  const [dx, setDx] = useState(4); // delta x
  
  // Math constants for f(x) = -x^2 + 10x
  const x0 = 3;
  const f = (x) => -Math.pow(x, 2) + 10 * x;
  const y0 = f(x0);
  
  const x1 = x0 + Number(dx);
  const y1 = f(x1);
  
  // SVG scales
  const scaleX = (val) => val * 40;
  const scaleY = (val) => 300 - val * 10;
  
  // Generate path data for the parabola
  let pathD = "M ";
  for (let x = 0; x <= 10; x += 0.2) {
    pathD += `${scaleX(x)},${scaleY(f(x))} `;
  }

  // Secant line points
  const p0 = { x: scaleX(x0), y: scaleY(y0) };
  const p1 = { x: scaleX(x1), y: scaleY(y1) };
  
  // Secant line extended (y = mx + b)
  const m = dx === 0 ? (-2 * x0 + 10) : (y1 - y0) / dx;
  const b = y0 - m * x0;
  
  const lineStartX = 0;
  const lineStartY = scaleY(m * lineStartX + b);
  const lineEndX = 10;
  const lineEndY = scaleY(m * lineEndX + b);

  return (
    <div className="visualizer-card glass-panel">
      <div className="card-header">
        <h2>割线逼近切线 (Secant to Tangent)</h2>
        <p className="subtitle">
          拖动滑块，观察当 <FormulaDisplay inline math="\Delta x" /> 趋近于 <FormulaDisplay inline math="0" /> 时会发生什么。
        </p>
      </div>
      
      <div className="visualizer-content">
        <div className="graph-container">
          <svg viewBox="0 0 400 300" className="math-graph">
            {/* Grid & Axes */}
            <line x1="0" y1="300" x2="400" y2="300" className="axis" />
            <line x1="0" y1="0" x2="0" y2="300" className="axis" />
            
            {/* Function Curve */}
            <path d={pathD} className="curve" fill="none" />
            
            {/* Secant/Tangent Line */}
            <line 
              x1={scaleX(lineStartX)} 
              y1={lineStartY} 
              x2={scaleX(lineEndX)} 
              y2={lineEndY} 
              className={`secant-line ${dx === 0 || dx === '0' ? 'tangent' : ''}`} 
            />
            
            {/* Points A and B */}
            <circle cx={p0.x} cy={p0.y} r="5" className="point-a" />
            {(dx !== 0 && dx !== '0') && (
              <circle cx={p1.x} cy={p1.y} r="5" className="point-b" />
            )}
            
            {/* Delta annotations */}
            {(dx !== 0 && dx !== '0') && (
              <g className="annotations">
                <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p0.y} className="dashed-helper" />
                <line x1={p1.x} y1={p0.y} x2={p1.x} y2={p1.y} className="dashed-helper" />
                <text x={(p0.x + p1.x)/2} y={p0.y + 15} className="svg-text">Δx = {Number(dx).toFixed(1)}</text>
                <text x={p1.x + 10} y={(p0.y + p1.y)/2} className="svg-text">Δy = {(y1-y0).toFixed(1)}</text>
              </g>
            )}
          </svg>
        </div>
        
        <div className="controls-panel">
          <div className="control-group">
            <label>控制变化量 Δx:</label>
            <input 
              type="range" 
              min="-2" 
              max="4" 
              step="0.1" 
              value={dx} 
              onChange={(e) => setDx(e.target.value)}
              className="slider"
            />
            <div className="value-badge">{Number(dx).toFixed(2)}</div>
          </div>
          
          <div className="formula-box">
             <FormulaDisplay 
               math={`m = \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x} = ${m.toFixed(2)}`} 
               highlight={dx === 0 || dx === '0'}
             />
             {Number(dx) === 0 ? (
                <div className="success-message">
                  🎉 你找到了瞬时变化率 (导数)！<br/>此时 <FormulaDisplay inline math="m" /> 就是切线的斜率。
                </div>
             ) : (
                <div className="info-message">
                  此时 <FormulaDisplay inline math="m" /> 是割线斜率（平均变化率）
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
