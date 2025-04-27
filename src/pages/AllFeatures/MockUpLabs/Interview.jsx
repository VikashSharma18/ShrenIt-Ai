import React, { useState, useEffect, useRef } from "react";
import "./MockUpLabs.css";

const Interview = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(120);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex]);

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSeconds(120);
    }
  };

  if (!questions || questions.length === 0) {
    return <div className="loading-message">Loading questions...</div>;
  }

  return (
    <div className="interview-container">
      <h3 className="question">{questions[currentIndex]}</h3>
      <div className="timer">
        Time Left: <span className="timer-seconds">{seconds}s</span>
      </div>
      <button className="next-button" onClick={nextQuestion}>
        Next Question
      </button>
    </div>
  );
};

export default Interview;
