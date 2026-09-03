import { GAME_WIDTH, COLORS, ROUND_TIME_SECONDS } from '../config.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const barW = 320;
    const barH = 22;

    // Barres de vie joueur (gauche) et adversaire (droite)
    this.playerBarBg = scene.add.rectangle(30, 30, barW, barH, COLORS.hpBack).setOrigin(0, 0);
    this.playerBarFill = scene.add.rectangle(32, 32, barW - 4, barH - 4, COLORS.hpFull).setOrigin(0, 0);
    this.playerName = scene.add.text(30, 8, '', { fontFamily: 'monospace', fontSize: '16px', color: '#fff' });

    this.enemyBarBg = scene.add.rectangle(GAME_WIDTH - 30 - barW, 30, barW, barH, COLORS.hpBack).setOrigin(0, 0);
    this.enemyBarFill = scene.add.rectangle(GAME_WIDTH - 30 - barW + 2, 32, barW - 4, barH - 4, COLORS.hpFull).setOrigin(0, 0);
    this.enemyName = scene.add.text(GAME_WIDTH - 30, 8, '', { fontFamily: 'monospace', fontSize: '16px', color: '#fff' }).setOrigin(1, 0);

    // Jauges de spécial
    this.playerMeterBg = scene.add.rectangle(30, 58, 200, 10, 0x222222).setOrigin(0, 0);
    this.playerMeterFill = scene.add.rectangle(30, 58, 0, 10, COLORS.guard).setOrigin(0, 0);
    this.enemyMeterBg = scene.add.rectangle(GAME_WIDTH - 30 - 200, 58, 200, 10, 0x222222).setOrigin(1, 0).setOrigin(0, 0);
    this.enemyMeterFill = scene.add.rectangle(GAME_WIDTH - 30, 58, 0, 10, COLORS.guard).setOrigin(1, 0);

    // Timer
    this.timerText = scene.add.text(GAME_WIDTH / 2, 20, `${ROUND_TIME_SECONDS}`, {
      fontFamily: 'monospace', fontSize: '32px', color: '#fff',
    }).setOrigin(0.5, 0);

    // Indicateurs de rounds gagnés (petits carrés au-dessus des barres)
    this.playerRoundPips = [];
    this.enemyRoundPips = [];
    for (let i = 0; i < 2; i++) {
      this.playerRoundPips.push(scene.add.rectangle(30 + i * 18, 60 + 14, 12, 12, 0x444444).setOrigin(0, 0));
      this.enemyRoundPips.push(scene.add.rectangle(GAME_WIDTH - 30 - 12 - i * 18, 60 + 14, 12, 12, 0x444444).setOrigin(0, 0));
    }

    // Portraits mini de l'équipe (reste de l'équipe, en dessous des barres)
    this.playerTeamIcons = [];
    this.enemyTeamIcons = [];

    this.roundBanner = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT_HALF(scene), '', {
      fontFamily: 'monospace', fontSize: '48px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100);
  }

  setNames(playerName, enemyName) {
    this.playerName.setText(playerName);
    this.enemyName.setText(enemyName);
  }

  update(playerFighter, enemyFighter, secondsLeft) {
    const pRatio = Math.max(0, playerFighter.hp / playerFighter.maxHp);
    const eRatio = Math.max(0, enemyFighter.hp / enemyFighter.maxHp);

    this.playerBarFill.width = (320 - 4) * pRatio;
    this.enemyBarFill.width = (320 - 4) * eRatio;
    this.enemyBarFill.x = GAME_WIDTH - 30 - 2 - this.enemyBarFill.width;

    this.playerBarFill.fillColor = colorForRatio(pRatio);
    this.enemyBarFill.fillColor = colorForRatio(eRatio);

    this.playerMeterFill.width = 200 * (playerFighter.meter / 100);
    this.enemyMeterFill.width = 200 * (enemyFighter.meter / 100);
    this.enemyMeterFill.x = GAME_WIDTH - 30 - this.enemyMeterFill.width;

    this.timerText.setText(`${Math.max(0, Math.ceil(secondsLeft))}`);
  }

  setRoundPips(playerWins, enemyWins) {
    this.playerRoundPips.forEach((p, i) => p.setFillStyle(i < playerWins ? COLORS.hpFull : 0x444444));
    this.enemyRoundPips.forEach((p, i) => p.setFillStyle(i < enemyWins ? COLORS.hpFull : 0x444444));
  }

  showBanner(text, duration = 1200) {
    this.roundBanner.setText(text).setAlpha(1);
    this.scene.tweens.add({
      targets: this.roundBanner,
      alpha: 0,
      delay: duration,
      duration: 300,
    });
  }
}

function colorForRatio(ratio) {
  if (ratio > 0.5) return COLORS.hpFull;
  if (ratio > 0.2) return COLORS.hpMid;
  return COLORS.hpLow;
}

function GAME_HEIGHT_HALF(scene) {
  return scene.scale.height / 2 - 40;
}
