import { initPWA } from './pwa'
import { Game } from './game';
import { Rocon } from './recon';
import './style.css'

const app = document.getElementById("app")!;
initPWA(app)
const game = new Game(app);
const recon = new Rocon(app)
recon.onResult = game.select.bind(game);
recon.startRecognition();
game.setupMatchMaking();

