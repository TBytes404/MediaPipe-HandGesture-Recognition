import { type DataConnection, Peer } from "peerjs"

const hostid = document.getElementById("hostid")!;
const host = document.getElementById("host") as HTMLButtonElement;
const peerid = document.getElementById("peerid") as HTMLInputElement;
const connect = document.getElementById("connect") as HTMLButtonElement;
const gestures = document.querySelectorAll(".gestures>li");
const opposition = document.querySelector("#opposition") as HTMLImageElement;
const result = document.querySelector("#result")!;

const gestureNames = ["rock", "paper", "scissors"];
const displayTexts = ["It's a Tie!", "You Win!", "You Lose!"];
const url = new URL(location.href);
peerid.value = url.searchParams.get("hostid") || "";

let pause = false;
let stableGestureIdx = 0;
gestures[stableGestureIdx].classList.add("active");
export function updateSelection(gesture: string) {
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

  url.searchParams.set("hostid", hostid.textContent || "");
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

let loop: number;
const setupListeners = (conn: DataConnection) => {
  conn.on("open", () => {
    clearInterval(loop);
    opposition.src = "/loading.webp";

    loop = setInterval(() => {
      pause = true;
      gestures[stableGestureIdx].classList.add("pause");
      conn.send(stableGestureIdx);
    }, 12000);
  });

  conn.on("data", (data) => {
    const oppositionIdx = data as number;
    const winnerIdx = (stableGestureIdx - oppositionIdx + 3) % 3;
    result.textContent = displayTexts[winnerIdx];
    opposition.src = `/${gestureNames[oppositionIdx]}.webp`;

    setTimeout(() => {
      pause = false;
      gestures[stableGestureIdx].classList.remove("pause");
      opposition.src = "/loading.webp";
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
