import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision"

export class Rocon {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  drawing: DrawingUtils;
  lastFrameTime: number;
  private gestureRecognizer!: GestureRecognizer
  onResult?: (gesture: string) => void;

  constructor(app: Element) {
    this.video = app.querySelector('#video')!;
    this.canvas = app.querySelector('#canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.drawing = new DrawingUtils(this.ctx);
    this.lastFrameTime = 0;
  }

  private onFrame() {
    const results = this.gestureRecognizer.recognizeForVideo(this.video, this.lastFrameTime);
    if (results.gestures.length > 0 && this.onResult)
      this.onResult(results.gestures[0][0].categoryName);

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (results.landmarks)
      for (const landmarks of results.landmarks) {
        this.drawing.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: '#31748f', lineWidth: 5 });
        this.drawing.drawLandmarks(landmarks, { color: '#eb6f92', lineWidth: 2 });
      }
    this.ctx.restore();
    this.lastFrameTime += 1;
    requestAnimationFrame(() => this.onFrame());
  }

  async startRecognition() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/gesture_recognizer.task",
        delegate: "GPU"
      }, runningMode: "VIDEO",
      // canvas: canvas
    });

    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    this.video.srcObject = stream;
    this.video.onloadeddata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      requestAnimationFrame(() => this.onFrame());
    }
  }
}
