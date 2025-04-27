import React, { useEffect, useState } from "react";
import VideoFeed from "./VideoFeed";
import PostureStatus from "./PostureStatus";
import Interview from "./Interview";
import axios from "axios";
import "./MockUpLabs.css";

const MockUpLabs = () => {
  const [postureStatus, setPostureStatus] = useState({
    head: "red",
    shoulders: "red",
    eyes: "red",
  });
  const [questions, setQuestions] = useState([]);
  const [canStartInterview, setCanStartInterview] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Fetching questions when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await axios.get("/questions.json");
      setQuestions(response.data.data_scientist);
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (interviewStarted) return;

    const interval = setInterval(async () => {
      const response = await axios.get(
        "http://localhost:5000/api/posture_data"
      );
      setPostureStatus(response.data);

      if (
        response.data.head === "green" &&
        response.data.shoulders === "green" &&
        response.data.eyes === "green"
      ) {
        setCanStartInterview(true);
        setInterviewStarted(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewStarted]);

  return (
    <div className="container">
      <VideoFeed />
      {!interviewStarted && (
        <PostureStatus
          status={postureStatus}
          className="posture-status-section"
        />
      )}
      {canStartInterview ? (
        <Interview questions={questions} className="interview-section" />
      ) : (
        !interviewStarted && (
          <div className="waiting-text">
            Waiting for all posture statuses to turn green...
          </div>
        )
      )}
    </div>
  );
};

export default MockUpLabs;
