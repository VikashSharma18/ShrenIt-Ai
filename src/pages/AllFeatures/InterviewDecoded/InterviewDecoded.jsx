import React, { useState, useEffect } from "react";
import "./InterviewDecoded.css";

const InterviewDecoded = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  useEffect(() => {
    fetch("/questions_by_topic1.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleBack = () => {
    if (currentView === "roles") {
      setCurrentView("categories");
      setSelectedCategory(null);
    } else if (currentView === "questions") {
      setCurrentView("roles");
      setSelectedRole(null);
    } else if (currentView === "questionDetail") {
      setCurrentView("questions");
      setSelectedQuestionIndex(null);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Information Technology": "fa-laptop-code",
      Medical: "fa-user-md",
      "Business And Management": "fa-chart-line",
      Legal: "fa-gavel",
      "Accounts And Finance": "fa-calculator",
      Administrative: "fa-clipboard-list",
      Teaching: "fa-chalkboard-teacher",
      Hospitality: "fa-utensils",
      Security: "fa-shield-alt",
      Marketing: "fa-bullhorn",
      Production: "fa-cogs",
      "Customer Service": "fa-headset",
    };
    return icons[category] || "fa-briefcase";
  };

  const getRandomColor = () => {
    const colors = [
      "#4361ee",
      "#3f37c9",
      "#4895ef",
      "#4cc9f0",
      "#f72585",
      "#7209b7",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading)
    return <div className="interview-decoded-loader">Loading...</div>;

  return (
    <div className="interview-decoded-container">
      {currentView === "categories" && (
        <>
          <Header
            title="Interview Decoded"
            subtitle="Master your next interview"
          />
          <div className="interview-decoded-grid">
            {[...new Set(data.jobRolesData.map((role) => role.industry))].map(
              (category) => {
                const roles = data.jobRolesData.filter(
                  (role) => role.industry === category
                );
                const questionCount = roles.reduce(
                  (sum, role) => sum + role.questionCount,
                  0
                );

                return (
                  <div
                    key={category}
                    className="interview-decoded-card"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentView("roles");
                    }}
                  >
                    <div className="interview-decoded-card-icon">
                      <i className={`fas ${getCategoryIcon(category)}`}></i>
                    </div>
                    <div className="interview-decoded-card-content">
                      <h3>{category}</h3>
                      <p>
                        {roles.length} roles • {questionCount} questions
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </>
      )}

      {currentView === "roles" && (
        <>
          <Header title={selectedCategory} onBack={handleBack} />
          <div className="interview-decoded-grid">
            {data.jobRolesData
              .filter((role) => role.industry === selectedCategory)
              .map((role) => (
                <div
                  key={role.title}
                  className="interview-decoded-card"
                  onClick={() => {
                    setSelectedRole(role.title);
                    setCurrentView("questions");
                  }}
                >
                  <div
                    className="interview-decoded-card-icon"
                    style={{ backgroundColor: getRandomColor() }}
                  >
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className="interview-decoded-card-content">
                    <h3>{role.title}</h3>
                    <p>{role.questionCount} professional questions</p>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {currentView === "questions" && (
        <>
          <Header
            title={selectedRole}
            subtitle="Interview Questions"
            onBack={handleBack}
          />
          <div className="interview-decoded-question-list">
            {(data.questionsData[selectedRole] || []).map((question, index) => (
              <div
                key={index}
                className="interview-decoded-question-card"
                onClick={() => {
                  setSelectedQuestionIndex(index);
                  setCurrentView("questionDetail");
                }}
              >
                <div className="interview-decoded-question-number">
                  {index + 1}
                </div>
                <div className="interview-decoded-question-text">
                  {question.question}
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>
            ))}
          </div>
        </>
      )}

      {currentView === "questionDetail" && (
        <>
          <Header
            title={`Question ${selectedQuestionIndex + 1}`}
            onBack={handleBack}
          />
          <div className="interview-decoded-question-detail">
            <div className="interview-decoded-question-header">
              <h2>
                {
                  data.questionsData[selectedRole][selectedQuestionIndex]
                    .question
                }
              </h2>
            </div>

            <section className="interview-decoded-section">
              <h3>Overview</h3>
              <p>
                {
                  data.questionsData[selectedRole][selectedQuestionIndex]
                    .overview
                }
              </p>
            </section>

            <section className="interview-decoded-section">
              <h3>What Interviewers Look For</h3>
              <ul className="interview-decoded-expectations">
                {data.questionsData[selectedRole][
                  selectedQuestionIndex
                ].expectations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </section>

            <section className="interview-decoded-section">
              <h3>Sample Answer</h3>
              <div className="interview-decoded-sample-answer">
                {
                  data.questionsData[selectedRole][selectedQuestionIndex]
                    .sampleAnswer
                }
              </div>
            </section>

            <div className="interview-decoded-navigation">
              <button
                className="interview-decoded-nav-button"
                disabled={selectedQuestionIndex === 0}
                onClick={() =>
                  setSelectedQuestionIndex(selectedQuestionIndex - 1)
                }
              >
                Previous
              </button>
              <span>
                Question {selectedQuestionIndex + 1} of{" "}
                {data.questionsData[selectedRole].length}
              </span>
              <button
                className="interview-decoded-nav-button"
                disabled={
                  selectedQuestionIndex ===
                  data.questionsData[selectedRole].length - 1
                }
                onClick={() =>
                  setSelectedQuestionIndex(selectedQuestionIndex + 1)
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Header = ({ title, subtitle, onBack }) => (
  <header className="interview-decoded-header">
    {onBack && (
      <button className="interview-decoded-back-button" onClick={onBack}>
        <i className="fas fa-arrow-left"></i>
      </button>
    )}
    <div className="interview-decoded-header-content">
      <h1>{title}</h1>
      {subtitle && <p className="interview-decoded-subtitle">{subtitle}</p>}
    </div>
  </header>
);

export default InterviewDecoded;
