import { GROUND_Y, MOVE_SPEED, JUMP_VELOCITY, DEFAULT_TIMINGS } from '../config.js';
import { getSpriteConfig } from '../data/spriteConfig.js';

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

// Correspondance état/type de coup -> nom d'animation dans la spritesheet du perso
const ATTACK_ANIM = {
  light: 'attack1',
  heavy: 'attack2',
  special: 'attack2', // pas de 3e animation dédiée : le spécial réutilise attack2 + flash
};

export class Fighter {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} charData - objet retourné par getCharacter()/getBoss()
   * @param {object} opts - { x, y, facing, isPlayer, isBoss }
   */
  constructor(scene, charData, opts) {
    this.scene = scene;
    this.char = charData;
    this.id = `fighter_${NEXT_ID++}`;
    this.isPlayer = !!opts.isPlayer;
    this.isBoss = !!opts.isBoss;
    this.facing = opts.facing || 1;

    this.maxHp = this.char.maxHp * (opts.hpMultiplier || 1);
    this.hp = this.maxHp;
    this.meter = 0;
    this.alive = true;
    this.blocking = false;

    this.state = STATE.INTRO;
    this.stateTimer = 0;
    this.hitThisMove = new Set();

    this.spriteConf = getSpriteConfig(this.char.id);
    if (!this.spriteConf) throw new Error(`Pas de sprite configuré pour ${this.char.id}`);

    const h = this.spriteConf.targetHeight;
    const w = Math.round(h * 0.42);
    this.width = w;
    this.height = h;
    // Échelle utilisée pour adapter la portée des hitboxes (tunées à l'origine pour h=100)
    this.visualScale = h / 100;

    this.container = scene.add.container(opts.x, opts.y);

    this.shadow = scene.add.ellipse(0, 6, w * 1.1, 16, 0x000000, 0.4);

    const scale = h / this.spriteConf.frameHeight;
    
    // Si c'est Kronn, on ajuste légèrement son origine verticale ou son offset 
    // pour compenser la taille de sa frame source par rapport au sol.
    const originY = (this.char.id === 'kronn') ? 0.92 : 1; 

    this.sprite = scene.add.sprite(0, 4, `${this.char.id}_idle`)
      .setOrigin(0.5, originY)
      .setScale(scale);

    // FIX : Ajustement de la hauteur et du positionnement du rectangle de garde pour qu'il reste sur le sol
    this.guardFx = scene.add.rectangle(0, -h / 2, w + 16, h, 0x38bdf8, 0.3)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(false);

    this.container.add([this.shadow, this.sprite, this.guardFx]);
    this.currentAnim = 'idle';
    this.sprite.play(`${this.char.id}_idle`);

   scene.physics.add.existing(this.container);
    
    const bodyWidth = w * 0.6; 
    const bodyHeight = h;
    
    // Centre la hitbox horizontalement et place sa base exactement sur le point 0 du conteneur (les pieds)
    this.container.body.setSize(bodyWidth, bodyHeight);
    this.container.body.setOffset(-bodyWidth / 2, -bodyHeight);
    
    this.container.body.setCollideWorldBounds(true);
    this.container.body.setDragX(1200);

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

  playAnim(key) {
    const full = `${this.char.id}_${key}`;
    if (this.currentAnim !== key) {
      this.currentAnim = key;
      this.sprite.play(full);
    }
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

    this.playAnim(ATTACK_ANIM[type]);
    if (type === 'special') {
      // Flash doré pour distinguer visuellement le spécial de l'attaque réutilisée
      this.sprite.setTint(0xffe066);
      this.scene.time.delayedCall(220, () => this.sprite.clearTint());
    }
    return true;
  }

  getActiveHitboxWorld() {
    if (!this.currentMove || this.movePhase !== 'active') return null;
    const hb = this.currentMove.hitbox;
    const s = this.visualScale;
    const cx = this.x + hb.offsetX * s * this.facing;
    const cy = this.y + hb.offsetY * s;
    return {
      x: cx - (hb.width * s) / 2,
      y: cy - (hb.height * s) / 2,
      width: hb.width * s,
      height: hb.height * s,
      damage: this.currentMove.damage,
      knockback: this.currentMove.knockback,
      hitstunType: this.currentMove.hitstunType,
      sourceId: this.id,
    };
  }

  getHurtboxWorld() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height,
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
    this.playAnim('takeHit');

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
      this.playAnim('death');
      this.sprite.setTint(0xcccccc);
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
        this.playAnim('idle');
        this.stateTimer += dt;
        if (this.stateTimer > 600) this.setState(STATE.IDLE);
        break;

      case STATE.IDLE:
        this.playAnim('idle');
        break;

      case STATE.WALK:
        this.playAnim('run');
        break;

      case STATE.BLOCK:
        this.playAnim('idle');
        break;

      case STATE.JUMP:
        this.playAnim(this.container.body.velocity.y < 0 ? 'jump' : 'fall');
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
