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
    width: 960,
    height: 600,
    parent: 'game-container',
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true // <--- Ajoutez cette ligne pour forcer l'arrondi des pixels et stopper le dédoublement
    },
    scene: [PreloadScene, TeamSelectScene, ModeSelectScene, CombatScene, ResultScene],
};

new Phaser.Game(config);
