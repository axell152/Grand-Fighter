import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, COLORS, GRAVITY_Y, ROUND_TIME_SECONDS, ROUNDS_TO_WIN } from '../config.js';
import { getCharacter, getBoss } from '../data/characters.js';
import { Fighter } from '../entities/Fighter.js';
import { InputBuffer } from '../systems/InputBuffer.js';
import { HitboxManager } from '../systems/HitboxManager.js';
import { TeamManager } from '../systems/TeamManager.js';
import { AIController } from '../systems/AIController.js';
import { BossController } from '../systems/BossController.js';
import { HUD } from '../ui/HUD.js';

const ROSTER_FOR_ENEMY = ['kaira', 'ryn', 'tempest'];

export class CombatScene extends Phaser.Scene {
  constructor() {
    super('CombatScene');
  }

  init(data) {
    this.playerTeamIds = data.teamIds;
    this.mode = data.mode; // 'duel' | 'gauntlet' | 'boss'
  }

  create() {
    this.physics.world.gravity.y = GRAVITY_Y;
    this.buildStage();

    this.hitboxManager = new HitboxManager();
    this.aiControllers = new Map(); // fighterId -> controller
    this.roundsWon = { player: 0, enemy: 0 };
    this.timeLeft = this.mode === 'duel' ? ROUND_TIME_SECONDS : 120;
    this.matchOver = false;
    this.roundLocked = false; // true pendant les intermissions / fin de match

    this.buildPlayerTeam();
    this.buildEnemyTeam();

    this.syncActiveVisuals('player');
    this.syncActiveVisuals('enemy');

    this.hud = new HUD(this);
    this.hud.setNames(this.activePlayerFighter().char.name, this.activeEnemyFighter().char.name);
    this.hud.setRoundPips(this.roundsWon.player, this.roundsWon.enemy);

    this.setupInput();

    if (this.mode === 'duel') {
      this.hud.showBanner('ROUND 1 - FIGHT!');
    } else if (this.mode === 'boss') {
      this.hud.showBanner('KRONN, TYRAN DES MARÉES');
    } else {
      this.hud.showBanner('VAGUE D\'ENNEMIS');
    }
  }

  buildStage() {
    // Ciel en dégradé (simulé par bandes) + horizon
    this.add.rectangle(GAME_WIDTH / 2, 90, GAME_WIDTH, 180, 0x0a1f3a);
    this.add.rectangle(GAME_WIDTH / 2, 220, GAME_WIDTH, 100, COLORS.bg);
    this.add.rectangle(GAME_WIDTH / 2, 340, GAME_WIDTH, 160, COLORS.bgSea);

    // Silhouettes de rochers/île au loin pour la profondeur
    this.add.triangle(150, 340, -80, 60, 80, 60, 0, -40, 0x0d2b4e).setAlpha(0.7);
    this.add.triangle(820, 340, -100, 70, 100, 70, 20, -60, 0x0d2b4e).setAlpha(0.6);
    this.add.rectangle(GAME_WIDTH / 2, 300, GAME_WIDTH, 6, 0x0d2b4e, 0.5);

    // Silhouette de navire pirate au loin (mât + coque, purement décoratif/original)
    this.add.rectangle(700, 330, 6, 90, 0x0a1a2e).setAlpha(0.5);
    this.add.triangle(700, 300, 0, 0, 0, 60, 40, 30, 0x13324f).setAlpha(0.5);
    this.add.rectangle(700, 380, 120, 20, 0x0a1a2e).setAlpha(0.5);

    // Mer scintillante juste avant la plage
    for (let i = 0; i < 14; i++) {
      const x = 40 + i * 65 + Phaser.Math.Between(-15, 15);
      this.add.rectangle(x, GROUND_Y - 30 + Phaser.Math.Between(-6, 6), 30, 3, 0x9fd3ff, 0.25);
    }

    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 60, GAME_WIDTH, 160, COLORS.groundDark);
    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y, GAME_WIDTH, 8, COLORS.ground);
    // Texture de sable/plage (traits simples)
    for (let i = 0; i < 20; i++) {
      this.add.rectangle(20 + i * 48, GROUND_Y + 20 + Phaser.Math.Between(0, 30), 30, 2, 0x5a4230, 0.4);
    }

    // Sol physique invisible
    const ground = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 4, GAME_WIDTH, 8, 0x000000, 0);
    this.physics.add.existing(ground, true);
    this.groundBody = ground;
  }

  buildPlayerTeam() {
    const members = this.playerTeamIds.map((id, i) =>
      this.createFighter(getCharacter(id), { isPlayer: true, facing: 1, x: -500 - i * 10, y: GROUND_Y })
    );
    this.playerTeam = new TeamManager(members, { simultaneousActive: 1 });
    this.physics.add.collider(members.map((m) => m.container), this.groundBody);
  }

  buildEnemyTeam() {
    if (this.mode === 'boss') {
      const boss = this.createFighter(getBoss('kronn'), { isPlayer: false, isBoss: true, facing: -1, x: -900, y: GROUND_Y, hpMultiplier: 1 });
      this.enemyTeam = new TeamManager([boss], { simultaneousActive: 1 });
      this.aiControllers.set(boss.id, new BossController(boss));
      this.physics.add.collider(boss.container, this.groundBody);
      return;
    }

    const count = this.mode === 'gauntlet' ? 2 : Math.max(2, this.playerTeamIds.length);
    const enemyIds = pickRandomEnemyRoster(count);
    const members = enemyIds.map((id, i) =>
      this.createFighter(getCharacter(id), { isPlayer: false, facing: -1, x: -700 - i * 10, y: GROUND_Y })
    );
    const simultaneousActive = this.mode === 'gauntlet' ? 2 : 1;
    this.enemyTeam = new TeamManager(members, { simultaneousActive });
    members.forEach((m) => {
      const difficulty = this.mode === 'gauntlet' ? 'normal' : 'normal';
      this.aiControllers.set(m.id, new AIController(m, difficulty));
    });
    this.physics.add.collider(members.map((m) => m.container), this.groundBody);
  }

  createFighter(charData, opts) {
    const fighter = new Fighter(this, charData, {
      ...opts,
      onHit: (f) => { if (this.hud) this.hud.registerHit(f.isPlayer ? 'enemy' : 'player'); },
      onKo: (f) => this.handleKo(f),
    });
    fighter.container.setVisible(false);
    return fighter;
  }

  handleKo(fighter) {
    if (this.mode === 'duel') {
      // Fin de round immédiate
      this.endRound(fighter.isPlayer ? 'enemy' : 'player', `${fighter.char.name} K.O. !`);
    } else {
      // Modes continus : le prochain membre vivant prend la relève automatiquement
      this.time.delayedCall(400, () => {
        this.syncActiveVisuals(fighter.isPlayer ? 'player' : 'enemy');
        this.checkContinuousWinLoss();
      });
    }
  }

  // Place/masque les fighters selon qui est actif dans l'équipe donnée, et
  // met à jour leur enregistrement dans le HitboxManager.
  syncActiveVisuals(side) {
    const team = side === 'player' ? this.playerTeam : this.enemyTeam;
    const active = team.getActive();

    team.getAll().forEach((f) => {
      this.hitboxManager.unregister(f);
      f.container.setVisible(false);
    });

    const baseX = side === 'player' ? 200 : GAME_WIDTH - 200;
    const spacing = 90;
    active.forEach((f, i) => {
      const offset = (i - (active.length - 1) / 2) * spacing;
      f.setPosition(baseX + offset, GROUND_Y);
      f.setFacing(side === 'player' ? 1 : -1);
      f.container.setVisible(true);
      f.container.body.setVelocity(0, 0);
      this.hitboxManager.register(f, side);
    });
  }

  activePlayerFighter() {
    return this.playerTeam.getActive()[0];
  }

  activeEnemyFighter() {
    return this.enemyTeam.getActive()[0];
  }

  setupInput() {
    // Déplacements : Q (gauche), D (droite), Z (sauter)
    this.keyLeft = this.input.keyboard.addKey('Q');
    this.keyRight = this.input.keyboard.addKey('D');
    this.keyJump = this.input.keyboard.addKey('Z');
    // Actions : U (parer), I (attaque corps à corps), O (spécial)
    this.keyBlock = this.input.keyboard.addKey('U');
    this.keyLight = this.input.keyboard.addKey('I');
    this.keySpecial = this.input.keyboard.addKey('O');
    this.keyDodge = this.input.keyboard.addKey('E');
    this.keySwap = this.input.keyboard.addKey('T');
    this.inputBuffer = new InputBuffer();
  }

  update(time, delta) {
    if (this.matchOver) return;

    const dt = delta;
    this.handlePlayerInput();
    if (!this.roundLocked) this.updateAI(dt);

    // Update de tous les fighters visibles
    [...this.playerTeam.getActive(), ...this.enemyTeam.getActive()].forEach((f) => f.update(dt));

    this.hitboxManager.resolve();

    const p = this.activePlayerFighter();
    const e = this.activeEnemyFighter();
    if (p && e) this.hud.update(p, e, this.timeLeft, dt);

    if (!this.roundLocked) {
      this.timeLeft -= dt / 1000;
      if (this.timeLeft <= 0) this.handleTimeout();
    }
  }

  handlePlayerInput() {
    if (this.roundLocked) return;
    const p = this.activePlayerFighter();
    if (!p || !p.alive) return;

    // Swap d'équipe (édge-triggered)
    if (Phaser.Input.Keyboard.JustDown(this.keySwap)) {
      this.playerTeam.switchTo(this.nextAlivePlayerId());
      this.syncActiveVisuals('player');
      this.hud.setNames(this.activePlayerFighter().char.name, this.activeEnemyFighter().char.name);
      return;
    }

    // Cible auto la plus proche pour le facing
    const target = this.nearestEnemy();
    if (target) p.autoFaceTarget = target;

    // Esquive arrière (édge-triggered, gère elle-même son cooldown en interne)
    if (Phaser.Input.Keyboard.JustDown(this.keyDodge)) {
      p.dodge();
    }

    if (p.canAct()) {
      if (this.keyLeft.isDown) p.moveLeft();
      else if (this.keyRight.isDown) p.moveRight();
      else p.stopMoving();

      if (this.keyBlock.isDown) p.startBlock();
      else p.stopBlock();

      if (Phaser.Input.Keyboard.JustDown(this.keyJump)) p.jump();
      if (Phaser.Input.Keyboard.JustDown(this.keyLight)) this.inputBuffer.push('light');
      if (Phaser.Input.Keyboard.JustDown(this.keySpecial)) this.inputBuffer.push('special');

      const buffered = this.inputBuffer.consume();
      if (buffered) p.attack(buffered);
    } else {
      if (Phaser.Input.Keyboard.JustDown(this.keyLight)) this.inputBuffer.push('light');
      if (Phaser.Input.Keyboard.JustDown(this.keySpecial)) this.inputBuffer.push('special');
    }
  }

  nextAlivePlayerId() {
    const alive = this.playerTeam.getAll().filter((f) => f.alive);
    const current = this.activePlayerFighter();
    const idx = alive.findIndex((f) => f.id === current.id);
    const next = alive[(idx + 1) % alive.length];
    return next ? next.id : current.id;
  }

  nearestEnemy() {
    const p = this.activePlayerFighter();
    const enemies = this.enemyTeam.getActive().filter((f) => f.alive);
    if (!p || enemies.length === 0) return null;
    return enemies.reduce((best, f) => (Math.abs(f.x - p.x) < Math.abs(best.x - p.x) ? f : best), enemies[0]);
  }

  updateAI(dt) {
    const target = this.activePlayerFighter();
    this.enemyTeam.getActive().forEach((f) => {
      const controller = this.aiControllers.get(f.id);
      if (controller) controller.update(dt, target);
    });
  }

  // --- Fin de round / conditions de victoire ---

  endRound(winnerSide, message) {
    if (this.roundLocked) return;
    this.roundLocked = true;
    this.roundsWon[winnerSide] += 1;
    this.hud.setRoundPips(this.roundsWon.player, this.roundsWon.enemy);
    this.hud.showBanner(message, 1000);

    const loserTeam = winnerSide === 'player' ? this.enemyTeam : this.playerTeam;
    const noOneLeft = loserTeam.isDefeated();

    if (noOneLeft || this.roundsWon[winnerSide] >= ROUNDS_TO_WIN) {
      this.time.delayedCall(1400, () => this.endMatch(winnerSide));
      return;
    }

    this.time.delayedCall(1600, () => {
      this.hud.showBanner('Changement possible : T', 1000);
    });

    this.time.delayedCall(2800, () => this.startNextRound());
  }

  startNextRound() {
    // Réinitialise complètement les fighters actifs (façon reset classique par round)
    [...this.playerTeam.getAll(), ...this.enemyTeam.getAll()].forEach((f) => {
      if (f.alive) {
        f.hp = f.maxHp;
      }
    });
    this.syncActiveVisuals('player');
    this.syncActiveVisuals('enemy');
    this.hud.setNames(this.activePlayerFighter().char.name, this.activeEnemyFighter().char.name);
    this.hud.resetCombos();
    this.timeLeft = ROUND_TIME_SECONDS;
    this.roundLocked = false;
    this.hud.showBanner(`ROUND ${this.roundsWon.player + this.roundsWon.enemy + 1} - FIGHT!`);
  }

  handleTimeout() {
    if (this.mode === 'duel') {
      const p = this.activePlayerFighter();
      const e = this.activeEnemyFighter();
      if (!p || !e) return;
      const winner = p.hp === e.hp ? null : p.hp > e.hp ? 'player' : 'enemy';
      if (winner) this.endRound(winner, 'TEMPS ÉCOULÉ !');
      else {
        this.roundLocked = true;
        this.hud.showBanner('ÉGALITÉ !', 1200);
        this.time.delayedCall(1800, () => this.startNextRound());
      }
    } else {
      this.endMatch('enemy', true);
    }
  }

  checkContinuousWinLoss() {
    if (this.playerTeam.isDefeated()) this.endMatch('enemy');
    else if (this.enemyTeam.isDefeated()) this.endMatch('player');
  }

  endMatch(winnerSide, timeout = false) {
    if (this.matchOver) return;
    this.matchOver = true;
    this.time.delayedCall(600, () => {
      this.scene.start('ResultScene', {
        won: winnerSide === 'player',
        mode: this.mode,
        timeout,
        teamIds: this.playerTeamIds,
      });
    });
  }
}

function pickRandomEnemyRoster(count) {
  const pool = [...ROSTER_FOR_ENEMY];
  const picked = [];
  while (picked.length < count && pool.length) {
    const idx = Phaser.Math.Between(0, pool.length - 1);
    picked.push(pool.splice(idx, 1)[0]);
  }
  while (picked.length < count) picked.push(ROSTER_FOR_ENEMY[picked.length % ROSTER_FOR_ENEMY.length]);
  return picked;
}
