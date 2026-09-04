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
    width: 800,
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
        pixelArt: true, // <--- Indispensable pour le pixel art, évite le flou et stabilise le rendu
        antialias: false
    },
    scene: [ /* vos scènes */ ]
};const config = {
    type: Phaser.AUTO,
    width: 800,
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
        pixelArt: true, // <--- Indispensable pour le pixel art, évite le flou et stabilise le rendu
        antialias: false
    },
   scene: [PreloadScene, TeamSelectScene, ModeSelectScene, CombatScene, ResultScene],
};

new Phaser.Game(config);
