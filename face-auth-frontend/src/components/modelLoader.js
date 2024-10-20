// Code to load models from face-api.js library 

import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Function to load models with caching
export const loadModels = async () => {
  // Check if models are already loaded
  if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    } catch (error) {
      console.error('Error loading SSD Mobilenet model:', error);
    }
  }
  
  if (!faceapi.nets.faceRecognitionNet.isLoaded) {
    try {
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    } catch (error) {
      console.error('Error loading Face Recognition Net model:', error);
    }
  }
  
  if (!faceapi.nets.faceLandmark68Net.isLoaded) {
    try {
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    } catch (error) {
      console.error('Error loading Face Landmark model:', error);
    }
  }
};
