# Train & Test MediaPipe Hand Gesture Recognition Model

<!--toc:start-->
- [Train & Test MediaPipe Hand Gesture Recognition Model](#train-test-mediapipe-hand-gesture-recognition-model)
  - [Requirements](#requirements)
    - [Download the dataset](#download-the-dataset)
    - [On Apple Silicon](#on-apple-silicon)
  - [Train the Model](#train-the-model)
  - [Test the Model](#test-the-model)
<!--toc:end-->

## Requirements

1. Python Version: 3.9
2. mediapipe-model-maker
3. rock paper scissors dataset

### Download the dataset

```sh
wget https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/rps_data_sample.zip
unzip rps_data_sample.zip
```

### On Apple Silicon

```sh
wget https://github.com/sun1638650145/Libraries-and-Extensions-for-TensorFlow-for-Apple-Silicon/releases/download/v2.19/tensorflow_text-2.19.0-cp39-cp39-macosx_11_0_arm64.whl
pip install tensorflow_text-2.19.0-cp39-cp39-macosx_11_0_arm64.whl
pip install "pyyaml>6.0.0" "keras<3.0.0" "tensorflow<2.16" "tf-models-official<2.16" mediapipe-model-maker --no-deps
```

## Train the Model

```sh
python train.py
```

Generated model will be saved in `exported_model/` directory

## Test the Model

```sh
python -m http.server 8000
```

Open `http://localhost:8000/` on the browser.
