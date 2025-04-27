import React from "react";
import "./MockUpLabs.css";

const PostureStatus = ({ status }) => {
  return (
    <div className="posture-status-container ">
      <h2 className="posture-status-header ">Posture Status</h2>
      <p
        className={`posture-status-text  ${
          status.head === "green" ? "green" : "red"
        }`}
      >
        Head: {status.head === "green" ? "Straight" : "Not Straight"}
      </p>
      <p
        className={`posture-status-text ${
          status.shoulders === "green" ? "green" : "red"
        }`}
      >
        Shoulders: {status.shoulders === "green" ? "Aligned" : "Not Aligned"}
      </p>
      <p
        className={`posture-status-text ${
          status.eyes === "green" ? "green" : "red"
        }`}
      >
        Eyes: {status.eyes === "green" ? "Contact" : "No Contact"}
      </p>
    </div>
  );
};

export default PostureStatus;
