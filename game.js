import { Peer } from "https://esm.sh/peerjs@latest?bundle-deps"

const hostid = document.getElementById("hostid");
const host = document.getElementById("host");
const peerid = document.getElementById("peerid");
const connect = document.getElementById("connect");
const gestures = document.querySelectorAll(".gestures>li");
const opposition = document.querySelector("#opposition");
const result = document.querySelector("#result");

const gestureNames = ["rock", "paper", "scissors"];
const displayTexts = ["It's a Tie!", "You Win!", "You Lose!"];
const url = new URL(location.href);
peerid.value = url.searchParams.get("hostid") || "";

let pause = false;
let stableGestureIdx = 0;
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
  host.disabled = true;
  connect.disabled = true;
  peerid.style.display = "none";
  connect.style.display = "none";
  url.searchParams.set("hostid", hostid.textContent);
  history.pushState(null, '', url);
  navigator.clipboard.writeText(url.toString());
  peer.on("connection", setupListeners);
}
connect.onclick = () => {
  host.disabled = true;
  connect.disabled = true;
  hostid.style.display = "none";
  host.style.display = "none";
  setupListeners(peer.connect(peerid.value));
}

let loop;
const setupListeners = (conn) => {
  conn.on("open", () => {
    clearInterval(loop);
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

