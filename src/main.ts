import { initPWA } from './pwa'
import { Game } from './game'
import { Rocon } from './recon'

const app = document.getElementById("app")!
initPWA(app)
const game = new Game(app)
const recon = new Rocon(app)

recon.onResult = (r) => game.update(r)
recon.start()
game.setup()
