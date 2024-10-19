let registeredDescriptor = null;  // To store the registered user's face descriptor

// Load the face-api.js models from the /models folder
async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('../weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('../weights');
    await faceapi.nets.faceRecognitionNet.loadFromUri('../weights');
}


// Start video stream from webcam
async function startVideo() {
    const video = document.getElementById('video');
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
}

// Detect face and generate embeddings
async function detectFaceEmbeddings() {
    const video = document.getElementById('video');
    const options = new faceapi.TinyFaceDetectorOptions();

    const detection = await faceapi.detectSingleFace(video, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (detection) {
        const faceDescriptor = detection.descriptor; // Embedding
        return faceDescriptor;
    } else {
        console.log("No face detected");
        return null;
    }
}

// Registration: Save the user's face descriptor
document.getElementById('register').addEventListener('click', async () => {
    const embedding = await detectFaceEmbeddings();
    if (embedding) {
        registeredDescriptor = embedding;  // Save the embedding for later comparison
        document.getElementById('result').innerText = "Face Registered!";
        console.log("Registered Face Descriptor:", registeredDescriptor);
    } else {
        document.getElementById('result').innerText = "No face detected for registration.";
    }
});

// Update the threshold value dynamically
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValueDisplay = document.getElementById('thresholdValue');

thresholdSlider.addEventListener('input', () => {
    const threshold = thresholdSlider.value;
    thresholdValueDisplay.innerText = threshold;
});

// Verification: Compare the current face with the registered one
document.getElementById('verify').addEventListener('click', async () => {
    if (!registeredDescriptor) {
        document.getElementById('result').innerText = "No registered face found!";
        return;
    }

    const currentEmbedding = await detectFaceEmbeddings();
    if (currentEmbedding) {
        // Get the dynamic threshold from the slider
        const threshold = parseFloat(thresholdSlider.value);
        const distance = faceapi.euclideanDistance(registeredDescriptor, currentEmbedding);

        // Compare the distance with the dynamic threshold
        if (distance < threshold) {
            document.getElementById('result').innerText = "Face Match! Welcome!";
        } else {
            document.getElementById('result').innerText = "Face does not match!";
        }
        console.log("Face Match Distance:", distance, "Threshold:", threshold);
    } else {
        document.getElementById('result').innerText = "No face detected for verification.";
    }
});

// Initialize the app
async function init() {
    await loadModels();
    startVideo();
}

init();
