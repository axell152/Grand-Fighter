import { AIController } from './AIController.js';

// Contrôleur spécialisé pour les boss : hérite de l'IA de base mais change de
// profil d'agressivité selon les phases de vie (façon boss fight classique).
// Phase 1 (100%-66%) : prudent, teste le joueur.
// Phase 2 (66%-33%)  : agressif, plus de heavy/special.
// Phase 3 (<33%)     : enrage, cadence maximale, spam de specials dès que dispo.

export class BossController extends AIController {
  constructor(fighter) {
    super(fighter, 'boss');
    this.phase = 1;
  }

  update(dt, target) {
    this.updatePhase();
    super.update(dt, target);
  }

  updatePhase() {
    const ratio = this.fighter.hp / this.fighter.maxHp;
    let newPhase = 1;
    if (ratio <= 0.33) newPhase = 3;
    else if (ratio <= 0.66) newPhase = 2;

    if (newPhase !== this.phase) {
      this.phase = newPhase;
      if (newPhase === 2) {
        this.profile = { reactionMs: 160, attackChance: 0.6, blockChance: 0.2, specialChance: 0.28 };
      } else if (newPhase === 3) {
        this.profile = { reactionMs: 90, attackChance: 0.75, blockChance: 0.1, specialChance: 0.4 };
      }
    }
  }
}
