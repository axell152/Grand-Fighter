// Résout les collisions entre hitboxes actives et hurtboxes adverses.
// Fonctionne avec un nombre arbitraire de combattants (1v1, 1v2, équipe vs boss, etc.)
// grâce à une notion de "camp" (team id) : un fighter ne peut toucher que les fighters
// d'un camp différent du sien.

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export class HitboxManager {
  constructor() {
    // liste de { fighter, teamId }
    this.entries = [];
  }

  register(fighter, teamId) {
    this.entries.push({ fighter, teamId });
  }

  unregister(fighter) {
    this.entries = this.entries.filter((e) => e.fighter !== fighter);
  }

  clear() {
    this.entries = [];
  }

  // À appeler chaque frame par CombatScene
  resolve() {
    const attackers = this.entries.filter((e) => e.fighter.alive);
    for (const atk of attackers) {
      const hitbox = atk.fighter.getActiveHitboxWorld();
      if (!hitbox) continue;

      for (const def of this.entries) {
        if (def.teamId === atk.teamId) continue; // pas d'ami vs ami
        if (!def.fighter.alive) continue;
        if (atk.fighter.hasHit(def.fighter.id)) continue; // déjà touché sur ce coup

        const hurtbox = def.fighter.getHurtboxWorld();
        if (rectsOverlap(hitbox, hurtbox)) {
          atk.fighter.registerHit(def.fighter.id);
          def.fighter.receiveHit(hitbox, atk.fighter.x);
        }
      }
    }
  }
}
