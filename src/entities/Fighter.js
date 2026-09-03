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

    // Représentation visuelle stylisée (membres, accessoires, corps)
    const w = 46;
    const h = 100;
    this.width = w;
    this.height = h;

    this.container = scene.add.container(opts.x, opts.y);

    this.shadow = scene.add.ellipse(0, 4, w * 0.9, 14, 0x000000, 0.4);
    this.guardFx = scene.add.rectangle(0, -h / 2, w + 16, h + 16, 0x38bdf8, 0.35)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(false);

    // Membres de base (bras et jambes)
    this.leftArm = scene.add.rectangle(-w / 2 - 4, -h / 2 - 5, 12, 42, this.char.colorDark).setStrokeStyle(2, 0x0f172a);
    this.rightArm = scene.add.rectangle(w / 2 + 4, -h / 2 - 5, 12, 42, this.char.colorDark).setStrokeStyle(2, 0x0f172a);
    this.leftLeg = scene.add.rectangle(-10, -25, 14, 50, this.char.colorDark).setStrokeStyle(2, 0x0f172a);
    this.rightLeg = scene.add.rectangle(10, -25, 14, 50, this.char.colorDark).setStrokeStyle(2, 0x0f172a);

    this.body = scene.add.rectangle(0, -h / 2, w, h - 20, this.char.color).setStrokeStyle(4, 0x0f172a);
    this.armorPlate = scene.add.rectangle(0, -h / 2 - 10, w - 12, 26, this.char.colorDark).setStrokeStyle(2, 0xffffff, 0.25);
    this.head = scene.add.circle(0, -h - 12, 18, this.char.color).setStrokeStyle(4, 0x0f172a);

    const accessories = [
      this.shadow,
      this.guardFx,
      this.leftLeg,
      this.rightLeg,
      this.leftArm,
      this.rightArm,
      this.body,
      this.armorPlate,
      this.head
    ];

    // Personnalisation Kaira ("Élastik") : Chapeau de paille
    if (this.char.id === 'kaira') {
      this.hatBrim = scene.add.rectangle(0, -h - 30, 56, 8, 0xfde047).setStrokeStyle(2, 0xca8a04);
      this.hatTop = scene.add.rectangle(0, -h - 40, 32, 14, 0xfde047).setStrokeStyle(2, 0xca8a04);
      accessories.push(this.hatBrim, this.hatTop);
    }

    // Personnalisation Ryn : Les trois sabres
    if (this.char.id === 'ryn') {
      this.sword1 = scene.add.rectangle(w / 2 + 16, -h / 2, 28, 5, 0xe2e8f0).setStrokeStyle(1, 0x0f172a);
      this.sword2 = scene.add.rectangle(w / 2 + 16, -h / 2 - 10, 28, 5, 0xe2e8f0).setStrokeStyle(1, 0x0f172a);
      this.sword3 = scene.add.rectangle(0, -h - 10, 32, 5, 0xe2e8f0).setAngle(45).setStrokeStyle(1, 0x0f172a);
      accessories.push(this.sword1, this.sword2, this.sword3);
    }

    this.container.add(accessories);

    scene.physics.add.existing(this.container);
    this.container.body.setSize(w, h + 32);
    this.container.body.setOffset(-w / 2, -h - 32);
    this.container.body.setCollideWorldBounds(true);
    this.container.body.setDragX(1200);

    this.activeHitboxRect = null;
    this.onHitCallback = opts.onHit || null;
    this.onKoCallback = opts.onKo || null;

    this.inputBuffer = null;
    this.controller = null;
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
    this.setState(STATE.WALK);
  }

  moveRight() {
    if (!this.canAct()) return;
    this.container.body.setVelocityX(MOVE_SPEED * this.char.walkSpeed);
    this.setState(STATE.WALK);
  }

  stopMoving() {
    if (this.state === STATE.WALK) {
      this.container.body.setVelocityX(0);
      this.setState(STATE.IDLE);
    }
  }

  setFacingTowardsOpponent(auto = true) {
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

  registerHit(targetId) {
    if (!this.hitThisMove.has(targetId)) {
      this.hitThisMove.add(targetId);
      this.meter = Math.min(100, this.meter + 25);
    }
  }

  hasHit(targetId) {
    return this.hitThisMove.has(targetId);
  }

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

  update(dt) {
    if (!this.container?.body) return;

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
    const defaultArmX = this.width / 2 + 4;

    // Animation dynamique des bras lors des attaques
    if (this.char.id === 'kaira' && this.currentMoveType === 'special') {
      // Bras élastique qui s'allonge brusquement en phase active
      if (this.movePhase === 'active') {
        this.rightArm.width = 100;
        this.rightArm.x = defaultArmX + 45;
      } else {
        this.rightArm.width = 12;
        this.rightArm.x = defaultArmX;
      }
    } else if (this.currentMoveType) {
      // Mouvement standard de coup de poing / estoc
      if (this.movePhase === 'startup') {
        this.rightArm.x = defaultArmX - 6;
      } else if (this.movePhase === 'active') {
        this.rightArm.x = defaultArmX + 16;
      } else {
        this.rightArm.x = defaultArmX;
      }
    }

    if (this.movePhase === 'startup' && this.movePhaseTimer >= m.startup) {
      this.movePhase = 'active';
      this.movePhaseTimer = 0;
    } else if (this.movePhase === 'active' && this.movePhaseTimer >= m.active) {
      this.movePhase = 'recovery';
      this.movePhaseTimer = 0;
    } else if (this.movePhase === 'recovery' && this.movePhaseTimer >= m.recovery) {
      this.currentMove = null;
      this.rightArm.width = 12;
      this.rightArm.x = defaultArmX;
      this.setState(STATE.IDLE);
    }
  }

  destroy() {
    this.container.destroy();
  }
}
