import React, { useEffect, useRef } from "react";
import "./MockUpLabs.css";

const VideoFeed = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-feed-container">
      <h2 className="video-feed-title">Video Feed</h2>
      <video ref={videoRef} autoPlay className="video-feed" />
    </div>
  );
};

export default VideoFeed;
