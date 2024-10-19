import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Button, TextField, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [embedding, setEmbedding] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    async function loadModels() {
      setLoading(true); // Start loading
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false); // Loading finished
      }
    }
    loadModels();
  }, []);

  const handleRegister = async () => {
    const video = document.getElementById('videoInput');
    const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      const userEmbedding = detections.descriptor;
      setEmbedding(userEmbedding);
      await axios.post('http://localhost:5000/register', {
        username,
        embedding: userEmbedding
      });
    }
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
      setVideoRef(stream);
    });
  };

  if (loading) {
    return <CircularProgress />; // Show loading spinner
  }

  return (
    <Box sx={{ textAlign: 'center', marginTop: 5 }}>
      <Typography variant="h4">Register</Typography>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ marginTop: 2, marginBottom: 2 }}
      />
      <Button variant="contained" onClick={startVideo}>Start Video</Button>
      <div>
        <video
          id="videoInput"
          width="480"
          height="360"
          autoPlay
          ref={(ref) => (ref && ref.srcObject !== videoRef ? (ref.srcObject = videoRef) : null)}
        />
      </div>
      <Button variant="contained" onClick={handleRegister} sx={{ marginTop: 2 }}>
        Register
      </Button>
    </Box>
  );
};

export default Register;
