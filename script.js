import { GestureRecognizer, FilesetResolver, DrawingUtils } from
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js"

const gestures = document.querySelectorAll('.gestures>li');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

const gestureNames = ['rock', 'paper', 'scissors'];
let stableGestureIdx = Math.floor(Math.random() * gestureNames.length);
gestures[stableGestureIdx].classList.add('active');

function updateSelection(gesture) {
  let idx = gestureNames.indexOf(gesture);
  if (idx === -1 || idx === stableGestureIdx) return;
  gestures[idx].classList.add('active');
  gestures[stableGestureIdx].classList.remove('active');
  stableGestureIdx = idx;
}

const ctx = canvas.getContext('2d');
const drawing = new DrawingUtils(ctx);
const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "./exported_model/gesture_recognizer.task",
    delegate: "GPU"
  }, runningMode: "VIDEO"
});

let lastFrameTime = 0;
function onFrame() {
  const results = gestureRecognizer.recognizeForVideo(video, lastFrameTime);
  if (results.gestures.length > 0)
    updateSelection(results.gestures[0][0].categoryName);

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.landmarks)
    for (const landmarks of results.landmarks) {
      drawing.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: '#31748f', lineWidth: 5 });
      drawing.drawLandmarks(landmarks, { color: '#eb6f92', lineWidth: 2 });
    }
  ctx.restore();

  lastFrameTime += 1;
  requestAnimationFrame(onFrame);
}

const stream = await navigator.mediaDevices.getUserMedia({ video: true })
video.srcObject = stream;
video.addEventListener("loadeddata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  requestAnimationFrame(onFrame);
});
