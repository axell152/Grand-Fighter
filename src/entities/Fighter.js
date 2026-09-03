import { GROUND_Y, MOVE_SPEED, JUMP_VELOCITY, DEFAULT_TIMINGS } from '../config.js';

// États possibles d'un combattant
export const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  JUMP: 'jump',
  ATTACK_LIGHT: 'attack_light',
  ATTACK_HEAVY: 'attack_heavy',
  ATTACK_SPECIAL: 'attack_special',
  BLOCK: 'block',
  BLOCKSTUN: 'blockstun',
  HITSTUN: 'hitstun',
  KO: 'ko',
  INTRO: 'intro',
  VICTORY: 'victory',
};

let NEXT_ID = 1;

export class Fighter {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} charData - objet retourné par getCharacter()
   * @param {object} opts - { x, y, facing, isPlayer, isBoss }
   */
  constructor(scene, charData, opts) {
    this.scene = scene;
    this.char = charData;
    this.id = `fighter_${NEXT_ID++}`;
    this.isPlayer = !!opts.isPlayer;
    this.isBoss = !!opts.isBoss;
    this.facing = opts.facing || 1; // 1 = droite, -1 = gauche

    this.maxHp = this.char.maxHp * (opts.hpMultiplier || 1);
    this.hp = this.maxHp;
    this.meter = 0; // jauge de spécial (0-100)
    this.alive = true;
    this.blocking = false;

    this.state = STATE.INTRO;
    this.stateTimer = 0;
    this.hitThisMove = new Set(); // évite le multi-hit sur un seul mouvement

    // Représentation visuelle simple (placeholder rectangle + tête)
    const w = 46;
    const h = 100;
    this.width = w;
    this.height = h;

    this.container = scene.add.container(opts.x, opts.y);
    this.body = scene.add.rectangle(0, -h / 2, w, h, this.char.color).setStrokeStyle(3, this.char.colorDark);
    this.head = scene.add.circle(0, -h - 12, 16, this.char.color).setStrokeStyle(3, this.char.colorDark);
    this.guardFx = scene.add.rectangle(0, -h / 2, w + 16, h + 16, 0x66d9ff, 0.25).setVisible(false);
    this.container.add([this.guardFx, this.body, this.head]);

    scene.physics.add.existing(this.container);
    this.container.body.setSize(w, h + 32);
    this.container.body.setOffset(-w / 2, -h - 32);
    this.container.body.setCollideWorldBounds(true);
    this.container.body.setDragX(1200);

    this.activeHitboxRect = null; // debug/visuel de hitbox active
    this.onHitCallback = opts.onHit || null;
    this.onKoCallback = opts.onKo || null;

    this.inputBuffer = null; // assigné en externe pour les joueurs humains
    this.controller = null; // assigné en externe (AIController) pour les CPU
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  setFacing(dir) {
    this.facing = dir;
    this.container.setScale(this.facing, 1);
  }

  isBusy() {
    return [STATE.ATTACK_LIGHT, STATE.ATTACK_HEAVY, STATE.ATTACK_SPECIAL, STATE.HITSTUN, STATE.BLOCKSTUN, STATE.KO, STATE.INTRO, STATE.VICTORY].includes(this.state);
  }

  canAct() {
    return this.alive && !this.isBusy();
  }

  // --- Déplacements ---
  moveLeft() {
    if (!this.canAct()) return;
    this.container.body.setVelocityX(-MOVE_SPEED * this.char.walkSpeed);
    this.setFacingTowardsOpponent(false);
    this.setState(STATE.WALK);
  }

  moveRight() {
    if (!this.canAct()) return;
    this.container.body.setVelocityX(MOVE_SPEED * this.char.walkSpeed);
    this.setFacingTowardsOpponent(false);
    this.setState(STATE.WALK);
  }

  stopMoving() {
    if (this.state === STATE.WALK) {
      this.container.body.setVelocityX(0);
      this.setState(STATE.IDLE);
    }
  }

  setFacingTowardsOpponent(auto = true) {
    // Ne force pas le facing pendant les déplacements manuels ; utilisé surtout par l'IA/auto-face
    if (!auto) return;
  }

  jump() {
    if (!this.canAct()) return;
    if (!this.isOnGround()) return;
    this.container.body.setVelocityY(JUMP_VELOCITY * this.char.jumpPower);
    this.setState(STATE.JUMP);
  }

  isOnGround() {
    return this.container.y >= GROUND_Y - 1 && this.container.body.velocity.y >= 0;
  }

  // --- Blocage ---
  startBlock() {
    if (!this.canAct()) return;
    this.blocking = true;
    this.guardFx.setVisible(true);
    this.setState(STATE.BLOCK);
  }

  stopBlock() {
    this.blocking = false;
    this.guardFx.setVisible(false);
    if (this.state === STATE.BLOCK) this.setState(STATE.IDLE);
  }

  // --- Attaques ---
  attack(type) {
    if (!this.canAct()) return false;
    const move = this.char.moves[type];
    if (!move) return false;
    if (type === 'special' && this.meter < (move.meterCost || 100)) return false;

    if (type === 'special') this.meter = Math.max(0, this.meter - (move.meterCost || 100));

    this.currentMove = move;
    this.currentMoveType = type;
    this.hitThisMove.clear();
    this.container.body.setVelocityX(0);

    const stateMap = { light: STATE.ATTACK_LIGHT, heavy: STATE.ATTACK_HEAVY, special: STATE.ATTACK_SPECIAL };
    this.setState(stateMap[type]);
    this.movePhase = 'startup';
    this.movePhaseTimer = 0;
    return true;
  }

  // Renvoie la hitbox active (coordonnées monde) si on est en phase "active", sinon null
  getActiveHitboxWorld() {
    if (!this.currentMove || this.movePhase !== 'active') return null;
    const hb = this.currentMove.hitbox;
    const cx = this.x + hb.offsetX * this.facing;
    const cy = this.y + hb.offsetY;
    return {
      x: cx - hb.width / 2,
      y: cy - hb.height / 2,
      width: hb.width,
      height: hb.height,
      damage: this.currentMove.damage,
      knockback: this.currentMove.knockback,
      hitstunType: this.currentMove.hitstunType,
      sourceId: this.id,
    };
  }

  getHurtboxWorld() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height - 32,
      width: this.width,
      height: this.height + 32,
    };
  }

  // Appelé par le système de hitbox quand ce fighter touche un adversaire
  registerHit(targetId) {
    if (!this.hitThisMove.has(targetId)) {
      this.hitThisMove.add(targetId);
      // Gain de jauge lors d'un coup réussi (ex: +25%)
      this.meter = Math.min(100, this.meter + 25);
    }
  }

  hasHit(targetId) {
    return this.hitThisMove.has(targetId);
  }

  // Appelé quand ce fighter est touché par une attaque adverse
  receiveHit(hitbox, attackerX) {
    if (!this.alive) return;

    if (this.blocking) {
      const chip = Math.round(hitbox.damage * 0.1);
      this.applyDamage(chip);
      this.knockback(hitbox.knockback, attackerX, 0.3);
      this.setState(STATE.BLOCKSTUN);
      this.stateTimer = DEFAULT_TIMINGS.blockstun;
      return;
    }

    this.applyDamage(hitbox.damage);
    this.knockback(hitbox.knockback, attackerX, 1);
    this.meter = Math.min(100, this.meter + 12);

    const hitstunDurations = {
      light: DEFAULT_TIMINGS.hitstunLight,
      heavy: DEFAULT_TIMINGS.hitstunHeavy,
      special: DEFAULT_TIMINGS.hitstunSpecial,
    };
    this.setState(STATE.HITSTUN);
    this.stateTimer = hitstunDurations[hitbox.hitstunType] || DEFAULT_TIMINGS.hitstunLight;

    if (this.onHitCallback) this.onHitCallback(this, hitbox);
  }

  knockback(kb, attackerX, factor) {
    const dir = this.x >= attackerX ? 1 : -1;
    this.container.body.setVelocityX(dir * kb.x * factor / (this.char.weight || 1));
    if (kb.y) this.container.body.setVelocityY(kb.y * factor);
  }

  applyDamage(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0 && this.alive) {
      this.alive = false;
      this.setState(STATE.KO);
      if (this.onKoCallback) this.onKoCallback(this);
    }
  }

  gainMeterPassive(dt) {
    this.meter = Math.min(100, this.meter + dt * 0.002);
  }

  setState(state) {
    this.state = state;
    this.stateTimer = 0;
  }

  // --- Boucle de mise à jour, appelée chaque frame par CombatScene ---
  update(dt) {
    if (!this.container?.body) return;

    // Facing automatique hors attaque/hitstun (permet de toujours se tourner vers la cible)
    if (this.autoFaceTarget && !this.isBusy()) {
      const dir = this.autoFaceTarget.x >= this.x ? 1 : -1;
      if (dir !== this.facing) this.setFacing(dir);
    }

    switch (this.state) {
      case STATE.INTRO:
        this.stateTimer += dt;
        if (this.stateTimer > 600) this.setState(STATE.IDLE);
        break;

      case STATE.JUMP:
        if (this.isOnGround()) this.setState(STATE.IDLE);
        break;

      case STATE.ATTACK_LIGHT:
      case STATE.ATTACK_HEAVY:
      case STATE.ATTACK_SPECIAL:
        this.updateAttackPhases(dt);
        break;

      case STATE.HITSTUN:
      case STATE.BLOCKSTUN:
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.setState(this.blocking ? STATE.BLOCK : STATE.IDLE);
        }
        break;

      case STATE.KO:
        this.body.setFillStyle(0x555555);
        break;

      default:
        break;
    }

    this.gainMeterPassive(dt);
  }

  updateAttackPhases(dt) {
    this.movePhaseTimer += dt;
    const m = this.currentMove;
    if (this.movePhase === 'startup' && this.movePhaseTimer >= m.startup) {
      this.movePhase = 'active';
      this.movePhaseTimer = 0;
    } else if (this.movePhase === 'active' && this.movePhaseTimer >= m.active) {
      this.movePhase = 'recovery';
      this.movePhaseTimer = 0;
    } else if (this.movePhase === 'recovery' && this.movePhaseTimer >= m.recovery) {
      this.currentMove = null;
      this.setState(STATE.IDLE);
    }
  }

  destroy() {
    this.container.destroy();
  }
}
