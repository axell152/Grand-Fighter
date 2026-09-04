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
    // On garde aussi une liste des textures demandées : cela permet de vérifier
    // proprement les assets avant de créer les animations.
    this._spriteAssets = [];
    Object.entries(SPRITES).forEach(([charId, conf]) => {
      Object.entries(conf.animations).forEach(([animKey, anim]) => {
        const textureKey = `${charId}_${animKey}`;
        const url = `${conf.basePath}/${anim.file}`;
        this._spriteAssets.push({ charId, animKey, textureKey, url });
        this.load.spritesheet(textureKey, url, {
          frameWidth: conf.frameWidth,
          frameHeight: conf.frameHeight,
        });
      });
    });

    this.load.on('loaderror', (file) => {
      // Ne fait pas planter le jeu si un asset isolé est absent.
      // Le Fighter utilisera alors automatiquement son idle comme secours.
      console.warn(`[Sprites] Asset introuvable : ${file.key} (${file.src})`);
    });
  }

  create() {
    // Crée toutes les animations une seule fois, réutilisables par tous les Fighters.
    Object.entries(SPRITES).forEach(([charId, conf]) => {
      Object.entries(conf.animations).forEach(([animKey, anim]) => {
        const textureKey = `${charId}_${animKey}`;
        const animName = `${charId}_${animKey}`;
        // Un fichier peut être absent/cassé sans empêcher les autres
        // personnages de se charger. On ne crée l'animation que si la texture
        // existe réellement dans le TextureManager.
        if (!this.textures.exists(textureKey)) {
          console.warn(`[Sprites] Texture ignorée : ${textureKey}`);
          return;
        }

        const texture = this.textures.get(textureKey);
        const availableFrames = texture.frameTotal ?? 0;
        const lastFrame = Math.min(anim.frames - 1, availableFrames - 1);
        if (lastFrame < 0) {
          console.warn(`[Sprites] Aucun frame disponible : ${textureKey}`);
          return;
        }

        if (!this.anims.exists(animName)) {
          this.anims.create({
            key: animName,
            frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: lastFrame }),
            frameRate: anim.frameRate,
            repeat: anim.repeat,
          });
        }
      });
    });

    this.scene.start('TeamSelectScene');
  }
}
