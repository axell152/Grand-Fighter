// Gère une équipe (joueur ou adverse) : liste de Fighters, qui est actif,
// et la logique de switch en fin de round. Réutilisable pour 1, 2 ou N adversaires
// simultanés (ex: 1v2) en gardant plusieurs membres "actifs" à la fois si besoin.

export class TeamManager {
  /**
   * @param {Fighter[]} members
   * @param {object} opts - { simultaneousActive: 1 } nombre de membres actifs en même temps
   */
  constructor(members, opts = {}) {
    this.members = members;
    this.simultaneousActive = opts.simultaneousActive || 1;
    this.activeIndex = 0;
  }

  getActive() {
    // Renvoie les N membres actifs (vivants, en priorité), N = simultaneousActive
    const alive = this.members.filter((m) => m.alive);
    if (alive.length <= this.simultaneousActive) return alive;
    return alive.slice(0, this.simultaneousActive);
  }

  getAll() {
    return this.members;
  }

  isDefeated() {
    return this.members.every((m) => !m.alive);
  }

  aliveCount() {
    return this.members.filter((m) => m.alive).length;
  }

  // Appelé en fin de round : fait passer le prochain membre vivant en position "active"
  // (le joueur choisit qui via UI ; ici on prépare juste l'ordre / auto-swap si le perso actif est KO)
  promoteNextAlive() {
    const idx = this.members.findIndex((m) => m.alive);
    if (idx >= 0) {
      const [chosen] = this.members.splice(idx, 1);
      this.members.unshift(chosen);
    }
  }

  // Permet un switch volontaire vers un membre précis (par id) entre les rounds
  switchTo(fighterId) {
    const idx = this.members.findIndex((m) => m.id === fighterId);
    if (idx > 0 && this.members[idx].alive) {
      const [chosen] = this.members.splice(idx, 1);
      this.members.unshift(chosen);
    }
  }

  resetForNewRound() {
    // Les membres KO restent KO d'un round à l'autre (mécanique équipe façon 3v3) ;
    // seul le membre actif regagne un peu de meter au démarrage.
    const active = this.getActive();
    active.forEach((f) => {
      f.meter = Math.min(100, f.meter + 20);
    });
  }
}
