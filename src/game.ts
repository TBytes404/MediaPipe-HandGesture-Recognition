import { Net } from "./net"

export class Game {
  gestures: NodeListOf<HTMLElement>
  opposition: HTMLImageElement
  message: HTMLElement
  scores: NodeListOf<HTMLElement>
  match: HTMLElement
  game: HTMLElement
  vscomputer: HTMLInputElement
  vsplayer: HTMLElement
  singleplayer: HTMLElement
  multiplayer: HTMLElement
  play: HTMLButtonElement
  share: HTMLButtonElement

  paused: boolean
  gestureNames: string[]
  displayTexts: string[]
  stableGestureIdx: number
  private loop?: NodeJS.Timeout
  private net: Net

  constructor(app: Element) {
    this.match = app.querySelector("#match")!
    this.vscomputer = app.querySelector('#vscomputer')!
    this.vsplayer = app.querySelector('#vsplayer')!
    this.singleplayer = app.querySelector('#singleplayer')!
    this.multiplayer = app.querySelector('#multiplayer')!
    this.play = app.querySelector("#play")!
    this.game = app.querySelector("#game")!
    this.gestures = app.querySelectorAll("#gestures>li")
    this.opposition = app.querySelector("#opposition")!
    this.message = app.querySelector("#message")!
    this.scores = app.querySelectorAll("#scores>li>span")!
    this.share = app.querySelector("#share")!
    this.paused = false
    this.gestureNames = ["rock", "paper", "scissors"]
    this.displayTexts = ["It's a Tie!", "You Win!", "You Lose!"]
    this.stableGestureIdx = this.randomGestureIdx()
    this.net = new Net(app)
  }

  update(gesture: string) {
    let idx = this.gestureNames.indexOf(gesture)
    if (idx === -1 || idx === this.stableGestureIdx || this.paused) return
    this.gestures[idx].classList.add("active")
    this.gestures[this.stableGestureIdx].classList.remove("active")
    this.stableGestureIdx = idx
  }

  setup() {
    this.gestures[this.stableGestureIdx].classList.add("active")
    for (let idx = 0; idx < this.gestures.length; idx++)
      this.gestures[idx].onclick = () => this.update(this.gestureNames[idx])

    this.play.onclick = () => this.startSinglePlayer()
    this.vscomputer.onclick = () => {
      this.singleplayer.hidden = false
      this.multiplayer.hidden = true
    }

    this.setupMultiplayer()
    this.share.onclick = async () => {
      await navigator.clipboard.writeText(this.net.url.toString())
      this.share.innerText = "Copied ✅"
      this.vscomputer.checked = true
      this.singleplayer.hidden = false
      this.multiplayer.hidden = true
    }
    this.vsplayer.onclick = () => {
      this.singleplayer.hidden = true
      this.multiplayer.hidden = false
    }
  }

  randomGestureIdx() {
    return Math.floor(Math.random() * this.gestureNames.length)
  }

  private startSinglePlayer() {
    this.start("Playing against the Computer!")
    this.loop = setInterval(() => {
      this.pause()
      this.evaluate(this.randomGestureIdx())
      setTimeout(() => this.resume(), 4000)
    }, 8000)
  }

  private setupMultiplayer() {
    this.net.onOpen = () => {
      this.start("Player has Joined the Game!")
      if (this.net.isHost)
        this.loop = setInterval(() => {
          this.pause()
          this.net.send(this.stableGestureIdx)
        }, 8000)
    }
    this.net.onData = (data: any) => {
      this.evaluate(data)
      if (!this.net.isHost) {
        this.pause()
        this.net.send(this.stableGestureIdx)
      }
      setTimeout(() => this.resume(), 4000)
    }
    this.net.onClose = () => {
      this.net.close()
      this.stop()
    }
    this.net.setup()
  }

  private evaluate(oppositionIdx: number) {
    const winnerIdx = (this.stableGestureIdx - oppositionIdx + 3) % 3
    this.message.textContent = this.displayTexts[winnerIdx]
    this.opposition.src = `/${this.gestureNames[oppositionIdx]}.webp`
    this.scores[winnerIdx].textContent =
      (parseInt(this.scores[winnerIdx].textContent!) + 1).toString()
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(this.displayTexts[winnerIdx]))
  }

  private start(msg: string) {
    clearInterval(this.loop)
    this.loop = undefined
    this.match.hidden = true
    this.game.hidden = false
    this.opposition.src = "/loading.webp"
    for (const li of this.scores) li.textContent = "0"
    this.message.textContent = msg
    speechSynthesis.speak(new SpeechSynthesisUtterance(msg))
  }

  private stop() {
    clearInterval(this.loop)
    this.loop = undefined
    this.match.hidden = false
    this.game.hidden = true
  }

  private resume() {
    this.paused = false
    this.gestures[this.stableGestureIdx].classList.remove("pause")
    this.opposition.src = "/loading.webp"
  }

  private pause() {
    this.paused = true
    this.gestures[this.stableGestureIdx].classList.add("pause")
  }
}
