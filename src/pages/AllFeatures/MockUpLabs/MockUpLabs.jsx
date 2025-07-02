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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [canStartInterview, setCanStartInterview] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [review, setReview] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioStream, setAudioStream] = useState(null);

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
        console.log("Fetched questions:", response.data); // Debug log
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
    const checkPermissions = async () => {
      try {
        const cameraResult = await navigator.permissions.query({
          name: "camera",
        });
        if (cameraResult.state === "denied") {
          setErrorMessage(
            "Camera access denied. Please enable it in browser settings."
          );
        }

        // Also check microphone permissions
        const micResult = await navigator.permissions.query({
          name: "microphone",
        });
        if (micResult.state === "denied") {
          setErrorMessage(
            "Microphone access denied. Please enable it in browser settings."
          );
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    };

    checkPermissions();
  }, []);

  // Cleanup function for audio resources
  const cleanupAudioResources = useCallback(() => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
  }, [audioStream]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();

      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (faceMeshInstanceRef.current) {
        faceMeshInstanceRef.current.close();
        faceMeshInstanceRef.current = null;
      }
    };
  }, [cleanupAudioResources]);

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
      if (!canvas) return;

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

  // Start recording speech - improved version
  const startRecording = useCallback(() => {
    setErrorMessage(null);
    setAudioChunks([]);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then((stream) => {
          setAudioStream(stream);

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 128000, // Higher quality audio
          });

          mediaRecorderRef.current = mediaRecorder;
          const chunks = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
              setAudioChunks((currentChunks) => [...currentChunks, event.data]);
            }
          };

          // Request data every 250ms to improve robustness
          mediaRecorder.start(250);
          setRecording(true);

          // Display visual feedback for recording
          console.log("Recording started...");
        })
        .catch((err) => {
          console.error("Microphone error:", err);
          setErrorMessage(
            `Unable to access microphone: ${err.message}. Please check permissions.`
          );
        });
    } else {
      setErrorMessage(
        "Your browser doesn't support audio recording. Please try a different browser."
      );
    }
  }, []);

  // Stop recording and send audio - improved version
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !recording) {
      setErrorMessage("No active recording to stop.");
      return;
    }

    setIsProcessing(true);

    try {
      // Stop the media recorder
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Wait for last ondataavailable event
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if we have audio data
      if (audioChunks.length === 0) {
        setErrorMessage(
          "No audio recorded. Please speak clearly and try again."
        );
        setIsProcessing(false);
        cleanupAudioResources();
        return;
      }

      // Create blob from all chunks
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      // Check blob size (minimum 1KB)
      if (audioBlob.size < 1000) {
        setErrorMessage(
          "Audio recording too short. Please speak clearly and try again."
        );
        setIsProcessing(false);
        cleanupAudioResources();
        return;
      }

      // Create form data for API
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Send to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

      try {
        const response = await axios.post(
          "https://shrenitai-backend.onrender.com/api/speech",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            },
          }
        );

        clearTimeout(timeoutId);

        const transcript = response.data.transcript;

        if (
          !transcript ||
          typeof transcript !== "string" ||
          transcript.trim() === ""
        ) {
          setErrorMessage(
            "No speech detected in the recording. Please speak clearly and try again."
          );
          setIsProcessing(false);
          cleanupAudioResources();
          return;
        }

        // Success path
        setAnswers((prevAnswers) => [...prevAnswers, transcript]);
        setShowNextButton(true);
        setErrorMessage(null);

        // Play a success sound to indicate successful recording
        const audio = new Audio(
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM7OKwZiQVQZ/b+tiKUw8dYaf83JdQBwkxdaqyloJkSUdtdnNza2TCubKqp6mrtK+npaOhoJ+koqaorLO5v8DAwLSqoZyenJRxWldwlbDGxAHk3cvb5PP27qUAAAwcLDMxGwYA95OktczV5OLImnyKoG8qFDRMbYqVm5csBggjhOl9MAphpqyaMQsgeHl4UDwQNllpa1g/EwMUFBALCRQ0W4fN3H8oLC4bECQoODgXBjDJ5dO/egoNASHTVJTMoTkGDkZSVUUnKzRPSCAIIFyjtrvl5PbS1N0sAwlZhoR0TSMUUqK4sqKORBAuUF1YRSssPmuEbVRVcaSRmJ+YmZeVlpiamos9KS4uIg4cdtLq5cm3SQ4mV2tVzszFlGtEQU5pe3QoHDx1iYFSNkVQSkRIO0I9MgUIGRoXEQcFCAzC4PDcvDYCCQASy3kQ1pM/JzpSWVE5MjU9UllhUxgMJlSxqpmkbjo5P0VTUSYAGlFdY1QLN5E9FUt+ZEkXEjJGU1BOFwQtdaSuoo1LBwsYLDkyKycjJCgoJB8M1/4TgQcPhXYyHDhPYmhgGSQyOzs5MjU1MzExMTExMTExMTExL28bHP0o5yAnIhkMIy4uKyroY4FMZZlhBBBADzVqdl8GJE94e2gQB1GOFLRNfJGIqJwbO2BlZVsN9T1QXGMGpJ0AAAAAAAB3r7u5sncZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAAd6+8vLN4GRsAAAAAAAB3r7y8s3gZGwAAAAAAAHevvLyzeBkbAAAAAAAA"
        );
        audio.play();
      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
          setErrorMessage(
            "Request timed out. Server may be temporarily unavailable. Please try again."
          );
        } else {
          console.error("Transcription error:", error);
          setErrorMessage(
            `Failed to transcribe audio: ${
              error.message || "Unknown error"
            }. Please try again.`
          );
        }
      }
    } catch (error) {
      console.error("Recording error:", error);
      setErrorMessage(`Recording error: ${error.message}. Please try again.`);
    } finally {
      setIsProcessing(false);
      cleanupAudioResources();
    }
  }, [audioChunks, recording, cleanupAudioResources]);

  // Handle Next button
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions[selectedCategory]?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowNextButton(false);
      setAudioChunks([]);
      setErrorMessage(null);
    } else {
      setIsFinished(true);
      setShowNextButton(false);
    }
  }, [currentQuestionIndex, questions, selectedCategory]);

  // Handle submit for review
  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/review",
        { answers },
        { timeout: 30000 }
      );

      setReview(response.data);
    } catch (error) {
      console.error("Review submission error:", error);

      if (error.code === "ECONNABORTED") {
        setErrorMessage(
          "Request timed out. Server may be temporarily unavailable. Please try again."
        );
      } else {
        setErrorMessage(
          `Failed to submit answers for review: ${
            error.message || "Unknown error"
          }. Please try again.`
        );
      }
    } finally {
      setIsProcessing(false);
    }
  }, [answers]);

  // Handle category change
  const handleCategoryChange = useCallback(
    (e) => {
      setSelectedCategory(e.target.value);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setIsFinished(false);
      setReview(null);
      setInterviewStarted(false);
      setCanStartInterview(false);
      setShowNextButton(false);
      setAudioChunks([]);
      setErrorMessage(null);
      cleanupAudioResources();
    },
    [cleanupAudioResources]
  );

  // Start interview
  const startInterview = useCallback(() => {
    setInterviewStarted(true);
    setErrorMessage(null);
  }, []);

  // Memoized current question
  const currentQuestion = useMemo(() => {
    if (!selectedCategory) {
      return "Please select a category to start.";
    }
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
                  disabled={recording || !interviewStarted || isProcessing}
                  className={`mul-record-button ${
                    recording || isProcessing ? "mul-disabled" : ""
                  }`}
                >
                  {recording ? "Recording... (speak now)" : "Start Recording"}
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!recording || isProcessing}
                  className={`mul-stop-button ${
                    !recording || isProcessing ? "mul-disabled" : ""
                  }`}
                >
                  {isProcessing ? "Processing..." : "Stop Recording"}
                </button>

                {/* Audio indicator */}
                {recording && (
                  <div className="mul-audio-indicator">
                    <div className="mul-audio-wave"></div>
                    <span>Speak clearly into your microphone</span>
                  </div>
                )}
              </div>
            )}
            {errorMessage && (
              <div className="mul-error-message">
                <p>{errorMessage}</p>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setAudioChunks([]);
                    if (!isProcessing) {
                      startRecording();
                    }
                  }}
                  className="mul-retry-button"
                  disabled={isProcessing}
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
              disabled={interviewStarted || isProcessing}
            >
              <option value="" disabled>
                Select a category
              </option>
              {Object.keys(questions).length > 0 ? (
                Object.keys(questions).map((category) => (
                  <option key={category} value={category}>
                    {category
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Loading categories...
                </option>
              )}
            </select>
          </div>
          {isLoadingQuestions ? (
            <div className="mul-loading">Loading questions...</div>
          ) : (
            <>
              {canStartInterview && !interviewStarted && selectedCategory && (
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
                    <button
                      onClick={handleNext}
                      className="mul-next-button"
                      disabled={isProcessing}
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
              {isFinished && !review && (
                <div className="mul-interview-section">
                  <h2 className="mul-section-title">Interview Completed</h2>
                  <button
                    onClick={handleSubmit}
                    className="mul-submit-button"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Submit for Review"}
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
