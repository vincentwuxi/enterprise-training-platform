import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import FormulaDisplay from '../Math/FormulaDisplay';
import './QuizPanel.css';

export default function QuizPanel({ questions, title = "本章测试 (Knowledge Check)" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index) => {
    if (isSubmitted) return; // Prevent changing after submission
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="quiz-panel glass-panel finished">
        <h2>测试完成！</h2>
        <div className="score-display">
          <span className="score-number">{score} / {questions.length}</span>
        </div>
        <p className="score-message">
          {score === questions.length ? "太棒了！你完美掌握了核心概念 🎉" : "继续努力！微积分的直觉需要时间积累。"}
        </p>
        <button className="primary-btn" onClick={handleRetry}>
          <RotateCcw size={18} /> 再试一次
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-panel glass-panel">
      <div className="quiz-header">
        <h3>{title}</h3>
        <span className="quiz-progress">题目 {currentIndex + 1}/{questions.length}</span>
      </div>

      <div className="quiz-content">
        <div className="quiz-question">
          <FormulaDisplay math={currentQuestion.question} inline={true} />
        </div>

        <div className="quiz-options">
          {currentQuestion.options.map((opt, idx) => {
            let className = "quiz-option ";
            if (selectedOption === idx) className += "selected ";
            if (isSubmitted) {
              if (idx === currentQuestion.correctAnswer) {
                className += "correct ";
              } else if (selectedOption === idx) {
                className += "incorrect ";
              }
              className += "disabled";
            }

            return (
              <button 
                key={idx} 
                className={className} 
                onClick={() => handleOptionSelect(idx)}
                disabled={isSubmitted}
              >
                <div className="option-label">{String.fromCharCode(65 + idx)}</div>
                <div className="option-text"><FormulaDisplay math={opt} inline={true} /></div>
                {isSubmitted && idx === currentQuestion.correctAnswer && <CheckCircle2 className="result-icon success" />}
                {isSubmitted && selectedOption === idx && idx !== currentQuestion.correctAnswer && <XCircle className="result-icon error" />}
              </button>
            );
          })}
        </div>

        {!isSubmitted ? (
          <button 
            className={`primary-btn submit-btn ${selectedOption === null ? 'disabled' : ''}`} 
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            提交答案
          </button>
        ) : (
          <div className="explanation-box animation-fade-in">
            <h4>解析 (Explanation)</h4>
            <div className="explanation-text">
              <FormulaDisplay math={currentQuestion.explanation} inline={true} />
            </div>
            <button className="primary-btn next-btn" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? '下一题' : '查看最终成绩'} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
