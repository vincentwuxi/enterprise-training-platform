import React, { useState } from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import LessonDerivatives from './pages/LessonDerivatives';
import LessonIntegrals from './pages/LessonIntegrals';
import FormulaDisplay from './components/Math/FormulaDisplay';
import './App.css';

import LessonLimits from './pages/LessonLimits';

function App() {
  const [currentLesson, setCurrentLesson] = useState('limits'); // default to limits

  const renderLesson = () => {
    switch(currentLesson) {
      case 'limits':
        return <LessonLimits />;
      case 'derivatives':
        return <LessonDerivatives />;
      case 'integrals':
        return <LessonIntegrals />;
      default:
        return <LessonDerivatives />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-main">
        <Sidebar activeChapter={currentLesson} onChapterSelect={setCurrentLesson} />
        <main className="content-area">
          {renderLesson()}
        </main>
      </div>
    </div>
  );
}

export default App;
