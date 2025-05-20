# Rock Paper Scissors using Hand Gesture Recognition

![rock paper scissor](/assets/loading.webp)

Using computer vision and machine learning to recognize the gesture of rock paper scissors.

<!--toc:start-->
- [Rock Paper Scissors using Hand Gesture Recognition](#rock-paper-scissors-using-hand-gesture-recognition)
  - [Play the Game](#play-the-game)
  - [Model Training](#model-training)
    - [Requirements](#requirements)
    - [Command](#command)
<!--toc:end-->

## Play the Game

```sh
python -m http.server 8000
```

Open `http://localhost:8000/` on the browser.

## Model Training

### Requirements

1. Python Version: 3.9
2. mediapipe-model-maker

  ```sh
  pip install mediapipe-model-maker
  ```

3. rock paper scissors dataset

  ```sh
  wget https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/rps_data_sample.zip
  unzip rps_data_sample.zip
  ```

### Command

```sh
python train.py
```

Generated model will be saved in `exported_model/` directory
