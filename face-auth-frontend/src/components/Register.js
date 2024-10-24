import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [embedding, setEmbedding] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLivenessVerified, setIsLivenessVerified] = useState(false);
  const [noBlinkCount, setNoBlinkCount] = useState(0);

  // Load face-api.js models
  useEffect(() => {
    async function loadModels() {
      setLoading(true);
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  // Function to handle the registration process by capturing the face embedding
  const handleRegister = async () => {
    if (!isLivenessVerified) {
      alert("Liveness not verified. Please ensure you're not a static image.");
      return;
    }

    setLoading(true);
    try {
      const video = document.getElementById("videoInput");
      const detections = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const userEmbedding = detections.descriptor;
        setEmbedding(userEmbedding);
        await axios.post("http://localhost:5000/register", {
          username,
          embedding: userEmbedding,
        });
        alert("Registration successful!");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("User has already registered.");
      } else {
        console.error("Error during registration:", error);
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Start the video stream
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
      setVideoRef(stream);
      detectLiveness();
    });
  };

  // Function to detect liveness by monitoring blinking
  const detectLiveness = async () => {
    const video = document.getElementById("videoInput");
    const blinkThreshold = 200; // number of frames without blinking to consider as non-lively
    let blinkDetected = false;

    const checkBlinking = async () => {
      const result = await faceapi.detectSingleFace(video).withFaceLandmarks();
      if (result) {
        const landmarks = result.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const leftEyeHeight = faceapi.euclideanDistance(leftEye[1], leftEye[5]);
        const rightEyeHeight = faceapi.euclideanDistance(
          rightEye[1],
          rightEye[5]
        );

        if (leftEyeHeight < 0.03 && rightEyeHeight < 0.03) {
          // Eye closed (blinking)
          blinkDetected = true;
          setNoBlinkCount(0);
        } else {
          // Eyes open
          if (!blinkDetected) {
            setNoBlinkCount((prev) => prev + 1);
          }
        }

        if (noBlinkCount >= blinkThreshold) {
          setIsLivenessVerified(false);
          alert("Liveness failed. Please blink or show natural movement.");
        } else if (blinkDetected) {
          setIsLivenessVerified(true);
        }
      }
      requestAnimationFrame(checkBlinking);
    };

    checkBlinking();
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Paper sx={{ padding: 4, maxWidth: 480, textAlign: "center" }}>
        <Typography variant="h5">Register</Typography>
        {loading ? (
          <CircularProgress sx={{ margin: 3 }} />
        ) : (
          <>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ marginTop: 2, marginBottom: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={startVideo}
              sx={{ marginBottom: 2 }}
            >
              Start Video
            </Button>
            <video
              id="videoInput"
              width="100%"
              height="360"
              autoPlay
              style={{ borderRadius: 8, marginBottom: 2 }}
              ref={(ref) =>
                ref && ref.srcObject !== videoRef
                  ? (ref.srcObject = videoRef)
                  : null
              }
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              sx={{ backgroundColor: "#1976d2", color: "#fff", marginTop: 2 }}
              disabled={!isLivenessVerified}
            >
              Register
            </Button>
            {!isLivenessVerified && (
              <Typography color="error" sx={{ marginTop: 2 }}>
                Liveness not verified. Please blink to continue.
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Register;
