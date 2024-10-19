// Load the face-api.js models
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
async function detectFaces() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('overlay');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    video.addEventListener('play', async () => {
        const options = new faceapi.TinyFaceDetectorOptions();
        
        // Detect face in real-time
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, options)
                .withFaceLandmarks()
                .withFaceDescriptors();

            // Resize the detections to fit the video canvas
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // Clear previous drawings
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            // Draw face boxes and landmarks
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

            // Extract embeddings (face descriptors)
            if (resizedDetections.length > 0) {
                const faceDescriptor = resizedDetections[0].descriptor;
                console.log("Face Descriptor (Embedding):", faceDescriptor);
            }
        }, 100);
    });
}

// Initialize the app
async function init() {
    await loadModels();
    startVideo();
    detectFaces();
}

init();
