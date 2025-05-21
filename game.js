import { Peer } from "https://esm.sh/peerjs@latest?bundle-deps"

const hostid = document.getElementById("hostid");
const host = document.getElementById("host");
const peerid = document.getElementById("peerid");
const connect = document.getElementById("connect");
const gestures = document.querySelectorAll(".gestures>li");
const opposition = document.querySelector("#opposition");
const result = document.querySelector("#result");

const gestureNames = ["rock", "paper", "scissors"];
const randomGesture = () => Math.floor(Math.random() * gestureNames.length);
const displayTexts = ["It's a Tie!", "You Win!", "You Lose!"];
let pause = false;
let stableGestureIdx = randomGesture();
gestures[stableGestureIdx].classList.add("active");

export function updateSelection(gesture) {
  let idx = gestureNames.indexOf(gesture);
  if (idx === -1 || idx === stableGestureIdx || pause) return;
  gestures[idx].classList.add("active");
  gestures[stableGestureIdx].classList.remove("active");
  stableGestureIdx = idx;
}

const peer = new Peer();
peer.on("open", (id) => {
  hostid.textContent = id;
})
host.onclick = () => {
  peerid.style.display = "none";
  connect.style.display = "none";
  peer.on("connection", setupListeners);
}
connect.onclick = () => {
  hostid.style.display = "none";
  host.style.display = "none";
  setupListeners(peer.connect(peerid.value));
}

const setupListeners = (conn) => {
  let loop;
  conn.on("open", () => {
    opposition.src = "/assets/loading.webp";
    loop = setInterval(() => {
      pause = true;
      gestures[stableGestureIdx].classList.add("pause");
      conn.send(stableGestureIdx);
    }, 12000);
  });

  conn.on("data", (oppositionIdx) => {
    const winnerIdx = (stableGestureIdx - oppositionIdx + 3) % 3;
    result.textContent = displayTexts[winnerIdx];
    opposition.src = `/assets/${gestureNames[oppositionIdx]}.webp`;

    setTimeout(() => {
      pause = false;
      gestures[stableGestureIdx].classList.remove("pause");
      opposition.src = "/assets/loading.webp";
    }, 4000);
    speechSynthesis.speak(new SpeechSynthesisUtterance(displayTexts[winnerIdx]));
  });

  conn.on("close", () => {
    console.log("DataConnection closed.");
    clearInterval(loop);
    opposition.src = "";
  });

  conn.on("error", (err) => {
    console.error("DataConnection error:", err);
    clearInterval(loop);
    opposition.src = "";
  });
}

