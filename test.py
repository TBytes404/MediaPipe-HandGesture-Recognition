import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


def print_result(
    result: vision.GestureRecognizerResult, output_image: mp.Image, timestamp_ms: int
):
    print("gesture recognition result: {}".format(result))


options = vision.GestureRecognizerOptions(
    base_options=python.BaseOptions(
        model_asset_path="./exported_model/gesture_recognizer.task"
    ),
    running_mode=vision.RunningMode.LIVE_STREAM,
    result_callback=print_result,
)

frame_time = 0
cap = cv2.VideoCapture(0)
with vision.GestureRecognizer.create_from_options(options) as recognizer:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Ignoring empty camera frame.")
            continue
        frame_time += 1

        frame.flags.writeable = False
        frame = image = cv2.flip(frame, 1)
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB),
        )
        recognizer.recognize_async(mp_image, frame_time)

        cv2.imshow("MediaPipe Hands", frame)
        if cv2.waitKey(5) & 0xFF == 27:
            break

cap.release()
cv2.destroyAllWindows()
