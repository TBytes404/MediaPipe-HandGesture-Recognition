import { updateSelection } from './game';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision"

const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const drawing = new DrawingUtils(ctx);
let gestureRecognizer: GestureRecognizer

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

(async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/gesture_recognizer.task",
      delegate: "GPU"
    }, runningMode: "VIDEO",
    // canvas: canvas
  });

  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  video.srcObject = stream;
  video.addEventListener("loadeddata", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    requestAnimationFrame(onFrame);
  });
})()
