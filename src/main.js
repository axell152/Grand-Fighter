import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { TeamSelectScene } from './scenes/TeamSelectScene.js';
import { ModeSelectScene } from './scenes/ModeSelectScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { ResultScene } from './scenes/ResultScene.js';

window.Phaser = Phaser; // pratique pour Phaser.Math / Phaser.Input dans les scènes

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'app',
  backgroundColor: '#0b2545',
  pixelArt: true, // filtrage "plus proche voisin" : évite le bleeding/clignotement des sprites agrandis
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400 },
      debug: false,
    },
  },
  scene: [PreloadScene, TeamSelectScene, ModeSelectScene, CombatScene, ResultScene],
};

new Phaser.Game(config);
