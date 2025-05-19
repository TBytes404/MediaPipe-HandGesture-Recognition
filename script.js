import "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
import "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
import "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js"

const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: { modelAssetPath: "./exported_model/gesture_recognizer.task" },
});

const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const gestureText = document.getElementById('gesture_text');
const canvasCtx = canvasElement.getContext('2d');

async function onFrame() {
  const results = await gestureRecognizer.recognize(videoElement)
  if (results.gestures.length > 0)
    gestureText.textContent = results.gestures[0][0].categoryName || 'none';

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  if (results.landmarks)
    for (const landmarks of results.landmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#31748f', lineWidth: 2 });
      drawLandmarks(canvasCtx, landmarks, { color: '#eb6f92', lineWidth: 2 });
    }
  canvasCtx.restore();
}

const camera = new Camera(videoElement, {
  onFrame, width: 640, height: 360
});
camera.start();
