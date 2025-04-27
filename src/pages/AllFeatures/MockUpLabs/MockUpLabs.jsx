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
  const [errorMessage, setErrorMessage] = useState(null);
  const mediaRecorderRef = useRef(null);
  const webcamRef = useRef(null);

  // Fetch questions once when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("/questions.json");
        setQuestions(response.data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
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
    if (interviewStarted || canStartInterview) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          "https://shrenitai-backend.onrender.com/api/posture_data"
        );
        const data = response.data;
        setPostureStatus(data);

        const allGreen =
          data.head === "green" &&
          data.shoulders === "green" &&
          data.eyes === "green";

        if (allGreen) {
          setCanStartInterview(true);
          clearInterval(interval); // Stop polling
        }
      } catch (error) {
        console.error("Failed to fetch posture data:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewStarted, canStartInterview]);

  // Start recording speech
  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          const chunks = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          mediaRecorderRef.current.onstop = () => {
            if (chunks.length > 0) {
              const audioBlob = new Blob(chunks, { type: "audio/wav" });
              console.log("Audio Blob created:", {
                size: audioBlob.size,
                type: audioBlob.type,
              });
              setAudioBlob(audioBlob);
            } else {
              console.error("No audio data recorded");
              setErrorMessage(
                "No audio recorded. Please speak clearly and try again."
              );
            }
          };

          mediaRecorderRef.current.start();
          setRecording(true);
          setErrorMessage(null);
        })
        .catch((err) => {
          console.error("Error accessing media devices:", err);
          alert("Unable to access microphone. Please check permissions.");
        });
    }
  };

  // Stop recording and send audio to backend
  const stopRecording = async () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Wait for audioBlob to be set
      const waitForAudioBlob = () =>
        new Promise((resolve) => {
          const checkBlob = setInterval(() => {
            if (audioBlob) {
              clearInterval(checkBlob);
              resolve(audioBlob);
            }
          }, 50);
          setTimeout(() => {
            clearInterval(checkBlob);
            resolve(null);
          }, 2000); // Timeout after 2 seconds
        });

      const blob = await waitForAudioBlob();
      if (!blob) {
        console.error("No audio blob available after recording");
        setErrorMessage("Recording failed. Please try again.");
        return;
      }

      if (blob.size < 1000) {
        console.error("Audio blob too small:", blob.size);
        setErrorMessage(
          "Audio too short or empty. Please speak clearly and try again."
        );
        return;
      }

      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.wav");

        const response = await axios.post(
          "https://shrenitai-backend.onrender.com/api/speech",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("Speech API response:", response.data);

        const transcript = response.data.transcript;
        if (
          !transcript ||
          typeof transcript !== "string" ||
          transcript.trim() === ""
        ) {
          console.error("Invalid or empty transcript:", transcript);
          setErrorMessage(
            "No speech detected. Please speak clearly and try again."
          );
          return;
        }

        setAnswers((prevAnswers) => [...prevAnswers, transcript]);
        setShowNextButton(true);
        setErrorMessage(null);
      } catch (error) {
        console.error("Error processing audio:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setErrorMessage(
          `Failed to transcribe audio: ${error.message}. Please try again.`
        );
      }
    }
  };

  // Handle Next button click
  const handleNext = () => {
    if (currentQuestionIndex < questions[selectedCategory]?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowNextButton(false);
      setAudioBlob(null);
      setErrorMessage(null);
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
    setAudioBlob(null);
    setErrorMessage(null);
  };

  // Start interview manually after posture check
  const startInterview = () => {
    setInterviewStarted(true);
    setErrorMessage(null);
  };

  return (
    <div className="mul-container">
      <h1 className="mul-title">MockUpLabs AI Interview</h1>
      <div className="mul-main-content">
        {/* Left Section: Video Feed and Speech Recorder */}
        <div className="mul-left-section">
          <div className="mul-video-feed-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height={400}
              className="mul-video"
              videoConstraints={{ facingMode: "user" }}
            />
            {interviewStarted && (
              <div className="mul-speech-recorder">
                <button
                  onClick={startRecording}
                  disabled={recording || !interviewStarted}
                  className={`mul-record-button ${
                    recording ? "mul-disabled" : ""
                  }`}
                >
                  {recording ? "Recording..." : "Start Recording"}
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!recording}
                  className={`mul-stop-button ${
                    !recording ? "mul-disabled" : ""
                  }`}
                >
                  Stop Recording
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="mul-error-message">
                <p>{errorMessage}</p>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setAudioBlob(null);
                    startRecording();
                  }}
                  className="mul-retry-button"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Category, Posture, Questions, Review */}
        <div className="mul-right-section">
          {/* Category Selection */}
          <div className="mul-category-selection-container">
            <label className="mul-category-label">Select Category:</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="mul-category-select"
            >
              <option value="data_scientist">Data Scientist</option>
              <option value="software_engineer">Software Engineer</option>
            </select>
          </div>

          {/* Posture Status */}
          {!canStartInterview && (
            <div className="mul-posture-status">
              <h3 className="mul-posture-title">Posture Check</h3>
              <p className={postureStatus.head}>Head: {postureStatus.head}</p>
              <p className={postureStatus.shoulders}>
                Shoulders: {postureStatus.shoulders}
              </p>
              <p className={postureStatus.eyes}>Eyes: {postureStatus.eyes}</p>
              <p className="mul-waiting-text">
                Please adjust your posture to start the interview.
              </p>
            </div>
          )}

          {/* Interview Section */}
          {canStartInterview && !interviewStarted && (
            <div className="mul-interview-section">
              <h2 className="mul-section-title">Ready to Start</h2>
              <button onClick={startInterview} className="mul-start-button">
                Begin Interview
              </button>
            </div>
          )}

          {interviewStarted && !isFinished && (
            <div className="mul-interview-section">
              <h2 className="mul-question-title">
                Question {currentQuestionIndex + 1}:{" "}
                {questions[selectedCategory]?.[currentQuestionIndex]}
              </h2>
              {showNextButton && (
                <button onClick={handleNext} className="mul-next-button">
                  Next
                </button>
              )}
            </div>
          )}

          {/* Submit Button */}
          {isFinished && !review && (
            <div className="mul-interview-section">
              <h2 className="mul-section-title">Interview Completed</h2>
              <button onClick={handleSubmit} className="mul-submit-button">
                Submit for Review
              </button>
            </div>
          )}

          {/* Review Section */}
          {review && (
            <div className="mul-review-section">
              <h3 className="mul-section-title">Review & Scores</h3>
              <p className="mul-score">
                Overall Score: {review.overallScore}/10
              </p>
              <p className="mul-feedback">{review.overallFeedback}</p>
              {review.scores.map((item, index) => (
                <div key={index} className="mul-review-item">
                  <p className="mul-review-question">
                    Question {item.question}: {item.score}/10
                  </p>
                  <p className="mul-review-feedback">{item.feedback}</p>
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
