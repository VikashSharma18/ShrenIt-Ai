// frontend/src/components/MockUpLabs.js
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import Webcam from "react-webcam";
import * as faceMesh from "@mediapipe/face_mesh";
import * as cameraUtils from "@mediapipe/camera_utils";
import PostureStatus from "./PostureStatus";
import "./MockUpLabs.css";

const MockUpLabs = () => {
  const [postureStatus, setPostureStatus] = useState({
    head: "red",
    shoulders: "red",
    eyes: "red",
  });
  const [questions, setQuestions] = useState({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
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
  const canvasRef = useRef(null);
  const faceMeshInstanceRef = useRef(null);
  const cameraRef = useRef(null);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const response = await axios.get("/questions.json");
        setQuestions(response.data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setErrorMessage("Failed to load questions. Please try again.");
      } finally {
        setIsLoadingQuestions(false);
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

  // Memoized posture processing
  const processPosture = useCallback((landmarks) => {
    const head = landmarks[10];
    const leftShoulder = landmarks[234];
    const rightShoulder = landmarks[454];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // Head tilt detection
    const noseTip = landmarks[1];
    const headTilt = Math.abs(noseTip.z) < 0.1 ? "green" : "red";

    // Shoulder alignment detection
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shouldersAligned = shoulderDiff < 0.05 ? "green" : "red";

    // Eye contact detection
    const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
    const eyeContact =
      eyeMidpointX > 0.4 && eyeMidpointX < 0.6 ? "green" : "red";

    return { head: headTilt, shoulders: shouldersAligned, eyes: eyeContact };
  }, []);

  // MediaPipe FaceMesh setup
  useEffect(() => {
    if (interviewStarted) return;

    faceMeshInstanceRef.current = new faceMesh.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
    });

    faceMeshInstanceRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMeshInstanceRef.current.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const newPostureStatus = processPosture(landmarks);
        setPostureStatus(newPostureStatus);

        const allGreen = Object.values(newPostureStatus).every(
          (status) => status === "green"
        );
        setCanStartInterview(allGreen);

        // Draw landmarks
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        [
          landmarks[10],
          landmarks[234],
          landmarks[454],
          landmarks[33],
          landmarks[263],
        ].forEach((point) => {
          ctx.beginPath();
          ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            5,
            0,
            2 * Math.PI
          );
          ctx.fill();
        });
      } else {
        setPostureStatus({ head: "red", shoulders: "red", eyes: "red" });
        setCanStartInterview(false);
      }
    });

    if (webcamRef.current && webcamRef.current.video) {
      cameraRef.current = new cameraUtils.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (
            faceMeshInstanceRef.current &&
            webcamRef.current &&
            webcamRef.current.video
          ) {
            await faceMeshInstanceRef.current.send({
              image: webcamRef.current.video,
            });
          }
        },
        width: 640,
        height: 400,
      });
      cameraRef.current.start().catch((err) => {
        console.error("Failed to start camera:", err);
        setErrorMessage("Failed to access camera. Please check permissions.");
      });
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshInstanceRef.current) {
        faceMeshInstanceRef.current.close();
        faceMeshInstanceRef.current = null;
      }
    };
  }, [interviewStarted, processPosture]);

  // Start recording speech
  const startRecording = useCallback(() => {
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
              setAudioBlob(audioBlob);
            } else {
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
          alert("Unable to access microphone. Please check permissions.");
        });
    }
  }, []);

  // Stop recording and send audio
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

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
          }, 2000);
        });

      const blob = await waitForAudioBlob();
      if (!blob) {
        setErrorMessage("Recording failed. Please try again.");
        return;
      }

      if (blob.size < 1000) {
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
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const transcript = response.data.transcript;
        if (
          !transcript ||
          typeof transcript !== "string" ||
          transcript.trim() === ""
        ) {
          setErrorMessage(
            "No speech detected. Please speak clearly and try again."
          );
          return;
        }

        setAnswers((prevAnswers) => [...prevAnswers, transcript]);
        setShowNextButton(true);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          `Failed to transcribe audio: ${error.message}. Please try again.`
        );
      }
    }
  }, [audioBlob, recording]);

  // Handle Next button
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions[selectedCategory]?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowNextButton(false);
      setAudioBlob(null);
      setErrorMessage(null);
    } else {
      setIsFinished(true);
      setShowNextButton(false);
    }
  }, [currentQuestionIndex, questions, selectedCategory]);

  // Handle submit for review
  const handleSubmit = useCallback(async () => {
    try {
      const response = await axios.post(
        "https://shrenitai-backend.onrender.com/api/review",
        { answers }
      );
      setReview(response.data);
    } catch (error) {
      setErrorMessage("Failed to submit answers for review. Please try again.");
    }
  }, [answers]);

  // Handle category change
  const handleCategoryChange = useCallback((e) => {
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
  }, []);

  // Start interview
  const startInterview = useCallback(() => {
    setInterviewStarted(true);
    setErrorMessage(null);
  }, []);

  // Memoized current question
  const currentQuestion = useMemo(() => {
    return questions[selectedCategory]?.[currentQuestionIndex] || "Loading...";
  }, [questions, selectedCategory, currentQuestionIndex]);

  return (
    <div className="mul-container">
      <h1 className="mul-title">MockUpLabs AI Interview</h1>
      <div className="mul-main-content">
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
            <canvas
              ref={canvasRef}
              className="mul-canvas"
              width="640"
              height="400"
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
          {!interviewStarted && <PostureStatus status={postureStatus} />}
        </div>
        <div className="mul-right-section">
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
          {isLoadingQuestions ? (
            <div className="mul-loading">Loading questions...</div>
          ) : (
            <>
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
                    Question {currentQuestionIndex + 1}: {currentQuestion}
                  </h2>
                  {showNextButton && (
                    <button onClick={handleNext} className="mul-next-button">
                      Next
                    </button>
                  )}
                </div>
              )}
              {isFinished && !review && (
                <div className="mul-interview-section">
                  <h2 className="mul-section-title">Interview Completed</h2>
                  <button onClick={handleSubmit} className="mul-submit-button">
                    Submit for Review
                  </button>
                </div>
              )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockUpLabs;
