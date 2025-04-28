import React, { useState, useEffect } from "react";
import { useAuth } from "../../Login/AuthContext";
import "./AptitudeSprint.css";
import questions from "./aptitude_question.json";

const AptitudeSprint = () => {
  const { student } = useAuth();
  const [activeTestType, setActiveTestType] = useState(null);
  const [currentTest, setCurrentTest] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const testTitles = {
    quantitative: "Quantitative Aptitude",
    verbal: "Verbal Ability",
    logical: "Logical Reasoning",
    mixed: "Mixed Aptitude",
  };

  useEffect(() => {
    let interval;
    if (activeTestType && !showResults) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTestType, showResults]);

  const startTest = (testType) => {
    const test = generateTest(testType);
    setActiveTestType(testType);
    setCurrentTest(test);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(1500);
    setShowResults(false);
  };

  const isValidQuestion = (q) =>
    q &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length > 0 &&
    typeof q.answer !== "undefined";

  const generateTest = (testType) => {
    const pools = {
      quantitative: [
        ...(questions.arithmetic_aptitude_questions || []),
        ...(questions.algebra_aptitude_questions || []),
        ...(questions.advanced_data_interpretation || []),
      ],
      verbal: [
        ...(questions.grammar_aptitude_questions || []),
        ...(questions.medium_grammar_questions || []),
        ...(questions.critical_thinking_questions || []),
      ],
      logical: [
        ...(questions.puzzle_aptitude_questions || []),
        ...(questions.pattern_recognition_questions || []),
      ],
      mixed: [
        ...(questions.arithmetic_aptitude_questions || []),
        ...(questions.algebra_aptitude_questions || []),
        ...(questions.grammar_aptitude_questions || []),
        ...(questions.puzzle_aptitude_questions || []),
        ...(questions.pattern_recognition_questions || []),
      ],
    };

    const rawQuestions = pools[testType] || [];
    const validQuestions = rawQuestions.filter(isValidQuestion);

    if (validQuestions.length < 25) {
      console.warn(
        `Only ${validQuestions.length} valid questions found for ${testType}.`
      );
    }

    return shuffleArray(validQuestions).slice(0, 25);
  };

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  const handleAnswerSelect = (answer) => {
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
  };

  const handleNavigation = (direction) => {
    const newIndex =
      direction === "next"
        ? currentQuestionIndex + 1
        : currentQuestionIndex - 1;
    setCurrentQuestionIndex(newIndex);
  };

  const handleSubmit = () => {
    const correctAnswers = currentTest.reduce((acc, question, index) => {
      return acc + (userAnswers[index] === question.answer ? 1 : 0);
    }, 0);
    setScore(((correctAnswers / currentTest.length) * 100).toFixed(1));
    setShowResults(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (showResults) {
    return (
      <div className="aptitude-container">
        <div className="results-glass-card">
          <div className="results-header">
            <h2 className="results-title">Test Results</h2>
            <div className="score-badge">
              <span>{score}</span>/100
            </div>
          </div>

          <div className="detailed-results">
            {Array.isArray(currentTest) &&
              currentTest.map(
                (question, index) =>
                  userAnswers[index] !== question.answer && (
                    <div key={index} className="question-review">
                      <div className="question-meta">
                        <span className="question-number">
                          Question {index + 1}
                        </span>
                        <span className="question-status">
                          {userAnswers[index] ? "Incorrect" : "Unanswered"}
                        </span>
                      </div>
                      <p className="question-text">{question.question}</p>
                      <div className="answer-comparison">
                        <div className="user-answer">
                          <label>Your Answer:</label>
                          <p>{userAnswers[index] || "-"}</p>
                        </div>
                        <div className="correct-answer">
                          <label>Correct Answer:</label>
                          <p>{question.answer}</p>
                        </div>
                      </div>
                      {question.solution && (
                        <div className="solution-section">
                          <label>Explanation:</label>
                          <p>{question.solution}</p>
                        </div>
                      )}
                    </div>
                  )
              )}
          </div>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Start New Test
          </button>
        </div>
      </div>
    );
  }

  if (activeTestType) {
    const currentQuestion = currentTest?.[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / currentTest.length) * 100 || 0;

    return (
      <div className="aptitude-container">
        <div className="test-interface">
          <div className="test-header">
            <div className="test-meta">
              <h2 className="test-title">{testTitles[activeTestType]}</h2>
              <div className="test-progress">
                Question {currentQuestionIndex + 1} of {currentTest.length}
              </div>
            </div>
            <div className="time-progress">
              <div className="timer">
                <span className="timer-icon">⏳</span>
                {formatTime(timeLeft)}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="question-card">
            <p className="question-text">{currentQuestion?.question}</p>
            <div className="options-grid">
              {currentQuestion?.options?.map((option, i) => (
                <button
                  key={i}
                  className={`option-button ${
                    userAnswers[currentQuestionIndex] === option
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="navigation-controls">
            <button
              className="nav-button prev"
              onClick={() => handleNavigation("prev")}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            <button
              className="nav-button next"
              onClick={() =>
                currentQuestionIndex === currentTest.length - 1
                  ? handleSubmit()
                  : handleNavigation("next")
              }
              disabled={!userAnswers[currentQuestionIndex]}
            >
              {currentQuestionIndex === currentTest.length - 1
                ? "Submit Test"
                : "Next →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aptitude-container">
      <div className="test-selection">
        <h1 className="main-heading">Aptitude Sprint</h1>
        <p className="sub-heading">Select your test category</p>

        <div className="test-cards">
          {Object.keys(testTitles).map((testType) => (
            <div
              key={testType}
              className="test-card"
              onClick={() => startTest(testType)}
            >
              <div className="card-gradient"></div>
              <h3 className="card-title">{testTitles[testType]}</h3>
              <p className="card-description">
                {testType === "quantitative" &&
                  "Mathematics, Algebra & Data Analysis"}
                {testType === "verbal" &&
                  "Grammar, Vocabulary & Critical Reasoning"}
                {testType === "logical" &&
                  "Puzzles, Patterns & Logical Sequences"}
                {testType === "mixed" && "Comprehensive Skill Assessment"}
              </p>
              <div className="card-stats">
                <span>25 Questions</span>
                <span>25 Minutes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AptitudeSprint;
