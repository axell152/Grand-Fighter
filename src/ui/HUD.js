import { GAME_WIDTH, GAME_HEIGHT, ROUND_TIME_SECONDS } from '../config.js';

// HUD façon jeu de combat 2D : barres biseautées rouge/or, compteur de coups,
// jauge de garde séparée de la jauge de spécial, plaques de nom stylisées.

const BAR_W = 340;
const BAR_H = 26;
const METER_W = 220;

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // --- Cadre décoratif du haut ---
    scene.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 4, 0xffd166).setOrigin(0.5, 0);

    // --- Barre de vie joueur (gauche, ancrée à droite visuellement via origin) ---
    this.playerBarFrame = scene.add.rectangle(26, 22, BAR_W + 8, BAR_H + 8, 0x1a0f08).setOrigin(0, 0).setStrokeStyle(2, 0xffd166);
    this.playerBarBg = scene.add.rectangle(30, 26, BAR_W, BAR_H, 0x3a0a0a).setOrigin(0, 0);
    this.playerBarFill = scene.add.rectangle(30, 26, BAR_W, BAR_H, 0xef4444).setOrigin(0, 0);
    this.playerBarShine = scene.add.rectangle(30, 26, BAR_W, 6, 0xffffff, 0.25).setOrigin(0, 0);

    this.playerPlate = scene.add.rectangle(26, 2, 220, 18, 0x1a0f08).setOrigin(0, 0).setStrokeStyle(2, 0xffd166);
    this.playerName = scene.add.text(34, 3, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#ffe9b0', fontStyle: 'bold',
    }).setOrigin(0, 0);

    // --- Barre de vie ennemie (droite, miroir) ---
    this.enemyBarFrame = scene.add.rectangle(GAME_WIDTH - 26, 22, BAR_W + 8, BAR_H + 8, 0x1a0f08).setOrigin(1, 0).setStrokeStyle(2, 0xffd166);
    this.enemyBarBg = scene.add.rectangle(GAME_WIDTH - 30, 26, BAR_W, BAR_H, 0x3a0a0a).setOrigin(1, 0);
    this.enemyBarFill = scene.add.rectangle(GAME_WIDTH - 30, 26, BAR_W, BAR_H, 0xef4444).setOrigin(1, 0);
    this.enemyBarShine = scene.add.rectangle(GAME_WIDTH - 30, 26, BAR_W, 6, 0xffffff, 0.25).setOrigin(1, 0);

    this.enemyPlate = scene.add.rectangle(GAME_WIDTH - 26, 2, 220, 18, 0x1a0f08).setOrigin(1, 0).setStrokeStyle(2, 0xffd166);
    this.enemyName = scene.add.text(GAME_WIDTH - 34, 3, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#ffe9b0', fontStyle: 'bold',
    }).setOrigin(1, 0);

    // --- Jauges de garde (guard burst) sous la vie ---
    this.playerGuardBg = scene.add.rectangle(30, 58, METER_W, 8, 0x1a1a1a).setOrigin(0, 0).setStrokeStyle(1, 0x475569);
    this.playerGuardFill = scene.add.rectangle(30, 58, METER_W, 8, 0x38bdf8).setOrigin(0, 0);
    this.enemyGuardBg = scene.add.rectangle(GAME_WIDTH - 30, 58, METER_W, 8, 0x1a1a1a).setOrigin(1, 0).setStrokeStyle(1, 0x475569);
    this.enemyGuardFill = scene.add.rectangle(GAME_WIDTH - 30, 58, METER_W, 8, 0x38bdf8).setOrigin(1, 0);

    // --- Jauges de spécial (or, sous la garde) ---
    this.playerMeterBg = scene.add.rectangle(30, 70, METER_W, 10, 0x1a1a1a).setOrigin(0, 0).setStrokeStyle(1, 0x92600a);
    this.playerMeterFill = scene.add.rectangle(30, 70, 0, 10, 0xffd166).setOrigin(0, 0);
    this.enemyMeterBg = scene.add.rectangle(GAME_WIDTH - 30, 70, METER_W, 10, 0x1a1a1a).setOrigin(1, 0).setStrokeStyle(1, 0x92600a);
    this.enemyMeterFill = scene.add.rectangle(GAME_WIDTH - 30, 70, 0, 10, 0xffd166).setOrigin(1, 0);

    this.playerMeterLabel = scene.add.text(30, 82, 'SPÉCIAL', { fontFamily: 'monospace', fontSize: '10px', color: '#ffd166' }).setOrigin(0, 0);
    this.enemyMeterLabel = scene.add.text(GAME_WIDTH - 30, 82, 'SPÉCIAL', { fontFamily: 'monospace', fontSize: '10px', color: '#ffd166' }).setOrigin(1, 0);

    // --- Timer central ---
    this.timerBg = scene.add.circle(GAME_WIDTH / 2, 40, 30, 0x1a0f08).setStrokeStyle(3, 0xffd166);
    this.timerText = scene.add.text(GAME_WIDTH / 2, 40, `${ROUND_TIME_SECONDS}`, {
      fontFamily: 'monospace', fontSize: '28px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // --- Compteur de coups (hit counter / combo) ---
    this.playerHitCounter = scene.add.text(30, 96, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffe066', fontStyle: 'bold italic',
    }).setOrigin(0, 0).setAlpha(0);
    this.enemyHitCounter = scene.add.text(GAME_WIDTH - 30, 96, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffe066', fontStyle: 'bold italic',
    }).setOrigin(1, 0).setAlpha(0);

    this.playerCombo = 0;
    this.enemyCombo = 0;
    this.playerComboTimer = 0;
    this.enemyComboTimer = 0;

    // --- Pips de round ---
    this.playerRoundPips = [];
    this.enemyRoundPips = [];
    for (let i = 0; i < 2; i++) {
      this.playerRoundPips.push(
        scene.add.rectangle(30 + i * 16, 122, 10, 10, 0x475569).setStrokeStyle(1, 0xffd166).setOrigin(0, 0)
      );
      this.enemyRoundPips.push(
        scene.add.rectangle(GAME_WIDTH - 30 - 10 - i * 16, 122, 10, 10, 0x475569).setStrokeStyle(1, 0xffd166).setOrigin(0, 0)
      );
    }

    // --- Bannière centrale (Round X / FIGHT / K.O.) ---
    this.roundBanner = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '', {
      fontFamily: 'monospace', fontSize: '46px', color: '#ffe066', fontStyle: 'bold',
      stroke: '#1a0f08', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(100);
  }

  setNames(playerName, enemyName) {
    this.playerName.setText(playerName.toUpperCase());
    this.enemyName.setText(enemyName.toUpperCase());
  }

  // Appelé par CombatScene lors d'un coup réussi pour alimenter le compteur de hits
  registerHit(side) {
    if (side === 'player') {
      this.playerCombo += 1;
      this.playerComboTimer = 1400;
    } else {
      this.enemyCombo += 1;
      this.enemyComboTimer = 1400;
    }
  }

  update(playerFighter, enemyFighter, secondsLeft, dt = 16.6) {
    const pRatio = Math.max(0, playerFighter.hp / playerFighter.maxHp);
    const eRatio = Math.max(0, enemyFighter.hp / enemyFighter.maxHp);

    this.playerBarFill.width = BAR_W * pRatio;
    this.enemyBarFill.width = BAR_W * eRatio;
    this.playerBarShine.width = BAR_W * pRatio;
    this.enemyBarShine.width = BAR_W * eRatio;

    const color = colorForRatio;
    this.playerBarFill.fillColor = color(pRatio);
    this.enemyBarFill.fillColor = color(eRatio);

    this.playerGuardFill.width = playerFighter.blocking ? METER_W : METER_W * 0.85;
    this.enemyGuardFill.width = enemyFighter.blocking ? METER_W : METER_W * 0.85;

    this.playerMeterFill.width = METER_W * (playerFighter.meter / 100);
    this.enemyMeterFill.width = METER_W * (enemyFighter.meter / 100);
    this.enemyMeterFill.x = GAME_WIDTH - 30 - this.enemyMeterFill.width;

    // Flash doré quand la jauge est pleine (prête à déclencher le spécial)
    this.playerMeterFill.fillColor = playerFighter.meter >= 100 ? 0xffffff : 0xffd166;
    this.enemyMeterFill.fillColor = enemyFighter.meter >= 100 ? 0xffffff : 0xffd166;

    this.timerText.setText(`${Math.max(0, Math.ceil(secondsLeft))}`);

    // Compteurs de coups avec disparition après un délai sans nouveau coup
    if (this.playerComboTimer > 0) {
      this.playerComboTimer -= dt;
      this.playerHitCounter.setText(`${this.playerCombo} HITS`).setAlpha(1);
      if (this.playerComboTimer <= 0) { this.playerHitCounter.setAlpha(0); this.playerCombo = 0; }
    }
    if (this.enemyComboTimer > 0) {
      this.enemyComboTimer -= dt;
      this.enemyHitCounter.setText(`${this.enemyCombo} HITS`).setAlpha(1);
      if (this.enemyComboTimer <= 0) { this.enemyHitCounter.setAlpha(0); this.enemyCombo = 0; }
    }
  }

  resetCombos() {
    this.playerCombo = 0;
    this.enemyCombo = 0;
    this.playerComboTimer = 0;
    this.enemyComboTimer = 0;
    this.playerHitCounter.setAlpha(0);
    this.enemyHitCounter.setAlpha(0);
  }

  setRoundPips(playerWins, enemyWins) {
    this.playerRoundPips.forEach((p, i) => p.setFillStyle(i < playerWins ? 0xffd166 : 0x475569));
    this.enemyRoundPips.forEach((p, i) => p.setFillStyle(i < enemyWins ? 0xffd166 : 0x475569));
  }

  showBanner(text, duration = 1200) {
    this.roundBanner.setText(text).setScale(0.6).setAlpha(1);
    this.scene.tweens.add({
      targets: this.roundBanner,
      scale: 1,
      duration: 220,
      ease: 'Back.Out',
    });
    this.scene.tweens.add({
      targets: this.roundBanner,
      alpha: 0,
      delay: duration,
      duration: 300,
    });
  }
}

function colorForRatio(ratio) {
  if (ratio > 0.5) return 0xef4444;
  if (ratio > 0.2) return 0xf97316;
  return 0xdc2626;
}
