import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.won = data.won;
    this.mode = data.mode;
    this.teamIds = data.teamIds;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.won ? '#123322' : '#331313');

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, this.won ? 'VICTOIRE !' : 'DÉFAITE', {
      fontFamily: 'monospace', fontSize: '56px', color: this.won ? '#66ff99' : '#ff6666', fontStyle: 'bold',
    }).setOrigin(0.5);

    const modeLabel = { duel: 'Duel d\'équipe', gauntlet: 'Vague d\'ennemis', boss: 'Combat de boss' }[this.mode] || this.mode;
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, modeLabel, {
      fontFamily: 'monospace', fontSize: '18px', color: '#cfe0ff',
    }).setOrigin(0.5);

    const retry = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, '[ REJOUER (même équipe) ]', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffe066',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.start('ModeSelectScene', { teamIds: this.teamIds }));

    const menu = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, '[ CHANGER D\'ÉQUIPE ]', {
      fontFamily: 'monospace', fontSize: '20px', color: '#9fd3ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.start('TeamSelectScene'));
  }
}
