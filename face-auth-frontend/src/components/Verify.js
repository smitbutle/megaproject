import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Button, TextField, Box, Typography, CircularProgress } from '@mui/material'; 
import axios from 'axios';

const Verify = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      setLoading(true);
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const handleVerify = async () => {
    const video = document.getElementById('videoInput');
    const detections = await faceapi.detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const currentEmbedding = detections.descriptor;

      try {
        const response = await axios.post('http://localhost:5000/verify', {
          username,
          currentEmbedding,
          // Removed threshold from the request
        });
        
        if (response.data.isVerified) {
          alert('Face verified successfully!');
        } else {
          alert('Face verification failed.');
        }
      } catch (error) {
        console.error('Error during verification:', error);
        alert('Verification error occurred. Please try again.');
      }
    } else {
      console.error('No face detected');
    }
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        const video = document.getElementById('videoInput');
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
      });
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ textAlign: 'center', marginTop: 5 }}>
      <Typography variant="h4">Verify</Typography>
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
        />
      </div>
      <Button variant="contained" onClick={handleVerify} sx={{ marginTop: 2 }}>
        Verify
      </Button>
    </Box>
  );
};

export default Verify;
