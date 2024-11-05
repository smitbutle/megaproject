// This is reference file not used in the project

// // Import required modules
// import express from 'express';
// import * as faceapi from 'face-api.js';
// import crypto from 'crypto';

// const app = express();
// const MODEL_URL = '/models';
// const SECRET_KEY = 'your-hardcoded-secret-key'; // Use a secure key for production

// // Helper function for encryption
// const encryptData = (data) => {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
//   let encrypted = cipher.update(data);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
// };

// // Function to load and encrypt model weights
// const loadAndEncryptModel = async () => {
//   await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
//   const modelWeights = faceapi.nets.ssdMobilenetv1.params; // Assuming this is how you access the model weights
//   const serializedWeights = JSON.stringify(modelWeights); // Convert to JSON
//   return encryptData(serializedWeights);
// };

// // Endpoint to send encrypted model to the client
// app.get('/get-encrypted-model', async (req, res) => {
//   try {
//     const encryptedModel = await loadAndEncryptModel();
//     res.json(encryptedModel);
//   } catch (error) {
//     console.error('Error sending encrypted model:', error);
//     res.status(500).json({ message: 'Error sending model' });
//   }
// });

// // // Start the server
// // app.listen(3000, () => {
// //   console.log('Server is running on port 3000');
// // });
