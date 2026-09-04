import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const MODES = [
  {
    key: 'duel',
    title: 'DUEL D\'ÉQUIPE',
    desc: 'Best of 3 rounds vs une équipe adverse.\nLa sélection adverse inclut les nouveaux ennemis.\nChangez de perso entre les rounds (touche T).',
  },
  {
    key: 'gauntlet',
    title: 'VAGUE D\'ENNEMIS',
    desc: '2 adversaires en même temps, sans reset de vie.\nPirates, Marines et hommes-poissons.\nSurvivez et changez de perso à la volée.',
  },
  {
    key: 'boss',
    title: 'COMBAT DE BOSS',
    desc: 'Affrontez Kronn, Tyran des Marées.\nAttention à ses phases de rage.',
  },
];

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super('ModeSelectScene');
  }

  init(data) {
    this.teamIds = data.teamIds;
  }

  create() {
    this.add.text(GAME_WIDTH / 2, 60, 'CHOISIS UN MODE', {
      fontFamily: 'monospace', fontSize: '28px', color: '#fff',
    }).setOrigin(0.5);

    const cardW = 260;
    const cardH = 320;
    const gap = 40;
    const totalW = MODES.length * cardW + (MODES.length - 1) * gap;
    const startX = GAME_WIDTH / 2 - totalW / 2 + cardW / 2;

    MODES.forEach((mode, i) => {
      const x = startX + i * (cardW + gap);
      const y = GAME_HEIGHT / 2 + 20;
      const bg = this.add.rectangle(x, y, cardW, cardH, 0x0f1f38).setStrokeStyle(3, 0x2a4a7a);
      this.add.text(x, y - cardH / 2 + 30, mode.title, {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffe066', align: 'center', wordWrap: { width: cardW - 20 },
      }).setOrigin(0.5);
      this.add.text(x, y + 10, mode.desc, {
        fontFamily: 'monospace', fontSize: '13px', color: '#cfe0ff', align: 'center', wordWrap: { width: cardW - 30 },
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setStrokeStyle(3, 0xffffff));
      bg.on('pointerout', () => bg.setStrokeStyle(3, 0x2a4a7a));
      bg.on('pointerdown', () => {
        this.scene.start('CombatScene', { teamIds: this.teamIds, mode: mode.key });
      });
    });
  }
}
