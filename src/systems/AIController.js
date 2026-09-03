// IA à état simple pour un Fighter contrôlé par le CPU.
// difficulty : 'easy' | 'normal' | 'hard' | 'boss' — influence réactivité et agressivité.

const PROFILES = {
  easy: { reactionMs: 380, attackChance: 0.25, blockChance: 0.15, specialChance: 0.05 },
  normal: { reactionMs: 240, attackChance: 0.4, blockChance: 0.3, specialChance: 0.12 },
  hard: { reactionMs: 140, attackChance: 0.55, blockChance: 0.45, specialChance: 0.2 },
  boss: { reactionMs: 100, attackChance: 0.65, blockChance: 0.35, specialChance: 0.3 },
};

const CLOSE_RANGE = 110;
const MID_RANGE = 260;

export class AIController {
  constructor(fighter, difficulty = 'normal') {
    this.fighter = fighter;
    this.profile = PROFILES[difficulty] || PROFILES.normal;
    this.decisionTimer = 0;
    this.currentDecision = 'idle';
  }

  // target : le Fighter adverse actuellement visé (le plus proche en général)
  update(dt, target) {
    if (!this.fighter.alive || !target || !target.alive) return;

    this.fighter.autoFaceTarget = target;

    this.decisionTimer -= dt;
    if (this.decisionTimer > 0) {
      this.applyDecision(target);
      return;
    }

    this.decisionTimer = this.profile.reactionMs;
    const dist = Math.abs(this.fighter.x - target.x);

    if (!this.fighter.canAct()) {
      this.currentDecision = 'idle';
      return;
    }

    const roll = Math.random();

    if (dist <= CLOSE_RANGE) {
      if (roll < this.profile.specialChance && this.fighter.meter >= 100) {
        this.currentDecision = 'special';
      } else if (roll < this.profile.attackChance) {
        this.currentDecision = Math.random() < 0.5 ? 'light' : 'heavy';
      } else if (roll < this.profile.attackChance + this.profile.blockChance) {
        this.currentDecision = 'block';
      } else {
        this.currentDecision = Math.random() < 0.5 ? 'retreat' : 'idle';
      }
    } else if (dist <= MID_RANGE) {
      this.currentDecision = roll < 0.7 ? 'approach' : 'jump';
    } else {
      this.currentDecision = 'approach';
    }

    this.applyDecision(target);
  }

  applyDecision(target) {
    const f = this.fighter;
    if (!f.canAct() && this.currentDecision !== 'block') return;

    switch (this.currentDecision) {
      case 'approach':
        if (target.x < f.x) f.moveLeft(); else f.moveRight();
        break;
      case 'retreat':
        if (target.x < f.x) f.moveRight(); else f.moveLeft();
        break;
      case 'jump':
        f.jump();
        this.currentDecision = 'idle';
        break;
      case 'light':
        f.attack('light');
        this.currentDecision = 'idle';
        break;
      case 'heavy':
        f.attack('heavy');
        this.currentDecision = 'idle';
        break;
      case 'special':
        f.attack('special');
        this.currentDecision = 'idle';
        break;
      case 'block':
        f.startBlock();
        break;
      default:
        f.stopMoving();
        f.stopBlock();
        break;
    }
  }
}
