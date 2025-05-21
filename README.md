# Rock Paper Scissors using Hand Gesture Recognition

![rock paper scissor](/assets/loading.webp)

Using computer vision and machine learning to recognize the gesture of rock paper scissors.

<!--toc:start-->
- [Rock Paper Scissors using Hand Gesture Recognition](#rock-paper-scissors-using-hand-gesture-recognition)
  - [Play the Game](#play-the-game)
  - [Model Training](#model-training)
    - [Requirements](#requirements)
    - [Steps](#steps)
<!--toc:end-->

## Play the Game

1. Host this site publicly, then Visit to play
2. Click `Host` & Share the copied URL with your friends
3. The other Player must visit the URL you Shared and click `Connect`
4. You can start Playing by showing rock-paper-scissors on the Camera.

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

### Steps

1. Train the model locally

```sh
python train.py
```

Generated model will be saved in `exported_model/` directory

2. Host the site locally

```sh
python -m http.server 8000
```

Open `http://localhost:8000/` on the browser.
