const gestures = document.querySelectorAll('.gestures>li');
const opposition = document.querySelector('#opposition');
const result = document.querySelector('#result');

const gestureNames = ['rock', 'paper', 'scissors'];
const randomGesture = () => Math.floor(Math.random() * gestureNames.length);
const displayTexts = ["It's a Tie!", "You Win!", "You Lose!"]
let pause = false;
let stableGestureIdx = randomGesture();
gestures[stableGestureIdx].classList.add('active');

export function updateSelection(gesture) {
  let idx = gestureNames.indexOf(gesture);
  if (idx === -1 || idx === stableGestureIdx || pause) return;
  gestures[idx].classList.add('active');
  gestures[stableGestureIdx].classList.remove('active');
  stableGestureIdx = idx;
}

let utterance = new SpeechSynthesisUtterance();
setInterval(() => {
  pause = true;
  gestures[stableGestureIdx].classList.add('pause');
  const oppositionIdx = randomGesture();
  const winnerIdx = (stableGestureIdx - oppositionIdx + 3) % 3;

  setTimeout(() => {
    pause = false;
    gestures[stableGestureIdx].classList.remove('pause');
    opposition.src = '/assets/loading.webp';
  }, 4000)

  result.textContent = displayTexts[winnerIdx]
  opposition.src = `/assets/${gestureNames[oppositionIdx]}.webp`;
  utterance.text = displayTexts[winnerIdx];
  speechSynthesis.speak(utterance)
}, 12000)

