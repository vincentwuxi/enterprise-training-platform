import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import './FormulaDisplay.css';

export default function FormulaDisplay({ math, inline = false, highlight = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(math, containerRef.current, {
        displayMode: !inline,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    }
  }, [math, inline]);

  return (
    <span 
      ref={containerRef} 
      className={`formula-container ${inline ? 'inline' : 'block'} ${highlight ? 'highlight-glow' : ''}`}
    />
  );
}
