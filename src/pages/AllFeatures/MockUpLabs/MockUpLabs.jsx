import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "./MockUpLabs.css";

const MockUpLabs = () => {
  const [postureStatus, setPostureStatus] = useState({
    head: "red",
    shoulders: "red",
    eyes: "red",
  });
  const [questions, setQuestions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("data_scientist");
  const [canStartInterview, setCanStartInterview] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [review, setReview] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const mediaRecorderRef = useRef(null);
  const webcamRef = useRef(null);

  // Fetch questions once when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("/questions.json");
        setQuestions(response.data);
      } catch (error) {
        console.error("Failed to fetch questions", error);
      }
    };

    fetchQuestions();
  }, []);

  // Check camera permissions
  useEffect(() => {
    navigator.permissions.query({ name: "camera" }).then((result) => {
      if (result.state === "denied") {
        alert("Camera access denied. Please enable it in browser settings.");
      }
    });
  }, []);

  // Poll posture status until all are green
  useEffect(() => {
    if (interviewStarted) return;

    const interval = setInterval(async () => {
      try {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            const response = await axios.post(
              "https://shrenitai-backend.onrender.com/api/posture_data",
              { image: imageSrc },
              { headers: { "Content-Type": "application/json" } }
            );
            const data = response.data;
            setPostureStatus(data);

            const allGreen =
              data.head === "green" &&
              data.shoulders === "green" &&
              data.eyes === "green";

            if (allGreen) {
              clearInterval(interval);
              setCanStartInterview(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch posture data", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewStarted]);

  // Start recording speech
  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          const chunks = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(chunks, { type: "audio/wav" });
            setAudioBlob(audioBlob);
          };

          mediaRecorderRef.current.start();
          setRecording(true);
        })
        .catch((err) => {
          console.error("Error accessing media devices:", err);
          alert("Unable to access microphone. Please check permissions.");
        });
    }
  };

  // Stop recording and send audio to backend
  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      setTimeout(async () => {
        if (audioBlob) {
          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.wav");

            const response = await axios.post(
              "https://shrenitai-backend.onrender.com/api/speech",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            const newAnswer = response.data.transcript;
            setAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
            setShowNextButton(true);
          } catch (error) {
            console.error("Error processing audio:", error);
            alert("Failed to process your answer. Please try again.");
          }
        }
      }, 100);
    }
  };

  // Handle Next button click
  const handleNext = () => {
    if (currentQuestionIndex < questions[selectedCategory]?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowNextButton(false);
    } else {
      setIsFinished(true);
      setShowNextButton(false);
    }
  };

  // Handle submit to get Gemini review
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "https://shrenitai-backend.onrender.com/api/review",
        {
          answers,
        }
      );
      setReview(response.data);
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("Failed to submit answers for review. Please try again.");
    }
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsFinished(false);
    setReview(null);
    setInterviewStarted(false);
    setCanStartInterview(false);
    setShowNextButton(false);
  };

  // Start interview manually after posture check
  const startInterview = () => {
    setInterviewStarted(true);
  };

  return (
    <div className="container">
      <h1 className="title">MockUpLabs AI Interview</h1>
      <div className="main-contenttt">
        {/* Left Section: Video Feed and Speech Recorder */}
        <div className="left-section">
          <div className="video-feed-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height={400}
              className="video"
              videoConstraints={{ facingMode: "user" }}
            />
            {interviewStarted && (
              <div className="speech-recorder">
                <button
                  onClick={startRecording}
                  disabled={recording || !interviewStarted}
                  className={`record-button ${recording ? "disabled" : ""}`}
                >
                  {recording ? "Recording..." : "Start Recording"}
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!recording}
                  className={`stop-button ${!recording ? "disabled" : ""}`}
                >
                  Stop Recording
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Category, Posture, Questions, Review */}
        <div className="right-section">
          {/* Category Selection */}
          <div className="category-selection-container">
            <label className="category-label">Select Category:</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="data_scientist">Data Scientist</option>
              <option value="software_engineer">Software Engineer</option>
            </select>
          </div>

          {/* Posture Status */}
          {!canStartInterview && (
            <div className="posture-status">
              <h3 className="posture-title">Posture Check</h3>
              <p className={postureStatus.head}>Head: {postureStatus.head}</p>
              <p className={postureStatus.shoulders}>
                Shoulders: {postureStatus.shoulders}
              </p>
              <p className={postureStatus.eyes}>Eyes: {postureStatus.eyes}</p>
              <p className="waiting-text">
                Please adjust your posture to start the interview.
              </p>
            </div>
          )}

          {/* Interview Section */}
          {canStartInterview && !interviewStarted && (
            <div className="interview-section">
              <h2 className="section-title">Ready to Start</h2>
              <button onClick={startInterview} className="start-button">
                Begin Interview
              </button>
            </div>
          )}

          {interviewStarted && !isFinished && (
            <div className="interview-section">
              <h2 className="question-title">
                Question {currentQuestionIndex + 1}:{" "}
                {questions[selectedCategory]?.[currentQuestionIndex]}
              </h2>
              {showNextButton && (
                <button onClick={handleNext} className="next-button">
                  Next
                </button>
              )}
            </div>
          )}

          {/* Submit Button */}
          {isFinished && !review && (
            <div className="interview-section">
              <h2 className="section-title">Interview Completed</h2>
              <button onClick={handleSubmit} className="submit-button">
                Submit for Review
              </button>
            </div>
          )}

          {/* Review Section */}
          {review && (
            <div className="review-section">
              <h3 className="section-title">Review & Scores</h3>
              <p className="score">Overall Score: {review.overallScore}/10</p>
              <p className="feedback">{review.overallFeedback}</p>
              {review.scores.map((item, index) => (
                <div key={index} className="review-item">
                  <p className="review-question">
                    Question {item.question}: {item.score}/10
                  </p>
                  <p className="review-feedback">{item.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockUpLabs;
