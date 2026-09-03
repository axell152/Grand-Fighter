import { CHARACTERS, ROSTER_ORDER } from '../data/characters.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class TeamSelectScene extends Phaser.Scene {
  constructor() {
    super('TeamSelectScene');
  }

  create() {
    this.selected = [];
    this.cards = [];

    this.add.text(GAME_WIDTH / 2, 50, 'CHOISIS TON ÉQUIPE (2 à 3 personnages)', {
      fontFamily: 'monospace', fontSize: '26px', color: '#fff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 84, 'Clique dans l\'ordre : le premier choisi commence le combat', {
      fontFamily: 'monospace', fontSize: '15px', color: '#9fd3ff',
    }).setOrigin(0.5);

    const cardW = 220;
    const cardH = 300;
    const gap = 40;
    const totalW = ROSTER_ORDER.length * cardW + (ROSTER_ORDER.length - 1) * gap;
    const startX = GAME_WIDTH / 2 - totalW / 2 + cardW / 2;

    ROSTER_ORDER.forEach((id, i) => {
      const char = CHARACTERS[id];
      const x = startX + i * (cardW + gap);
      const y = GAME_HEIGHT / 2 + 10;

      const bg = this.add.rectangle(x, y, cardW, cardH, 0x0f1f38).setStrokeStyle(3, char.colorDark);
      const portrait = this.add.circle(x, y - 80, 46, char.color).setStrokeStyle(4, char.colorDark);
      const name = this.add.text(x, y + 10, char.name, {
        fontFamily: 'monospace', fontSize: '17px', color: '#fff', align: 'center', wordWrap: { width: cardW - 20 },
      }).setOrigin(0.5, 0);
      const tag = this.add.text(x, y + 60, char.tagline, {
        fontFamily: 'monospace', fontSize: '12px', color: '#9fb3d9', align: 'center', wordWrap: { width: cardW - 30 },
      }).setOrigin(0.5, 0);
      const order = this.add.text(x, y - 130, '', {
        fontFamily: 'monospace', fontSize: '22px', color: '#ffe066', fontStyle: 'bold',
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => { if (!this.selected.includes(id)) bg.setStrokeStyle(3, 0xffffff); });
      bg.on('pointerout', () => { if (!this.selected.includes(id)) bg.setStrokeStyle(3, char.colorDark); });
      bg.on('pointerdown', () => this.toggleSelect(id, bg, order));

      this.cards.push({ id, bg, order });
    });

    this.infoText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 70, '0/3 sélectionné(s)', {
      fontFamily: 'monospace', fontSize: '16px', color: '#fff',
    }).setOrigin(0.5);

    this.startBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 34, '[ VALIDER L\'ÉQUIPE ]', {
      fontFamily: 'monospace', fontSize: '20px', color: '#555',
    }).setOrigin(0.5);
  }

  toggleSelect(id, bg, orderText) {
    const idx = this.selected.indexOf(id);
    if (idx >= 0) {
      this.selected.splice(idx, 1);
      bg.setStrokeStyle(3, CHARACTERS[id].colorDark);
      orderText.setText('');
      this.refreshOrders();
    } else {
      if (this.selected.length >= 3) return;
      this.selected.push(id);
      bg.setStrokeStyle(4, 0xffe066);
      orderText.setText(`${this.selected.length}`);
    }
    this.updateInfo();
  }

  refreshOrders() {
    this.cards.forEach((c) => {
      const pos = this.selected.indexOf(c.id);
      c.order.setText(pos >= 0 ? `${pos + 1}` : '');
    });
  }

  updateInfo() {
    this.infoText.setText(`${this.selected.length}/3 sélectionné(s)`);
    const ready = this.selected.length >= 2;
    this.startBtn.setColor(ready ? '#66ff99' : '#555');
    if (ready && !this.startBtn.input) {
      this.startBtn.setInteractive({ useHandCursor: true });
      this.startBtn.on('pointerdown', () => {
        this.scene.start('ModeSelectScene', { teamIds: this.selected });
      });
    }
  }
}
