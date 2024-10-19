let registeredDescriptor = null;  // To store the registered user's face descriptor

// Load the models including MTCNN for face detection
async function loadModels() {
    await faceapi.nets.mtcnn.loadFromUri('../weights');  // Load MTCNN for face detection
    await faceapi.nets.faceLandmark68Net.loadFromUri('../weights');  // More detailed face landmarks
    await faceapi.nets.faceRecognitionNet.loadFromUri('../weights');  // Face recognition model
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

// Detect face and generate embeddings using MTCNN for face detection
async function detectFaceEmbeddings() {
    const video = document.getElementById('video');

    const mtcnnOptions = new faceapi.MtcnnOptions({
        minFaceSize: 20,  // Smaller faces will be ignored
        scaleFactor: 0.709,  // Image scale factor during detection
        maxNumScales: 10,  // Max scales to apply during pyramid scaling
    });

    const detection = await faceapi.detectSingleFace(video, mtcnnOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (detection) {
        const faceDescriptor = detection.descriptor;  // Embedding
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
