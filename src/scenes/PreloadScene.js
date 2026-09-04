import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SPRITES } from '../data/spriteConfig.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const barW = 400;
    const barH = 22;
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, barW + 8, barH + 8, 0x1a0f08).setStrokeStyle(2, 0xffd166);
    const fill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2, GAME_HEIGHT / 2, 0, barH, 0xffd166).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Chargement des combattants...', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffe9b0',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      fill.width = barW * value;
    });

    // Charge chaque spritesheet déclaré dans la config, pour chaque perso.
    Object.entries(SPRITES).forEach(([charId, conf]) => {
      Object.entries(conf.animations).forEach(([animKey, anim]) => {
        const textureKey = `${charId}_${animKey}`;
        this.load.spritesheet(textureKey, `${conf.basePath}/${anim.file}`, {
          frameWidth: conf.frameWidth,
          frameHeight: conf.frameHeight,
        });
      });
    });
  }

  create() {
    // Crée toutes les animations une seule fois, réutilisables par tous les Fighters.
    Object.entries(SPRITES).forEach(([charId, conf]) => {
      Object.entries(conf.animations).forEach(([animKey, anim]) => {
        const textureKey = `${charId}_${animKey}`;
        const animName = `${charId}_${animKey}`;
        if (!this.anims.exists(animName)) {
          this.anims.create({
            key: animName,
            frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: anim.frames - 1 }),
            frameRate: anim.frameRate,
            repeat: anim.repeat,
          });
        }
      });
    });

    this.scene.start('TeamSelectScene');
  }
}
