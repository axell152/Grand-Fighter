// Roster original inspiré de l'esprit "pirates/aventure/pouvoirs" (aucune IP existante).
// Chaque perso a : stats de base, un jeu de couleurs (pour le placeholder graphique),
// et un moveset avec des hitboxes définies en coordonnées relatives au perso.
//
// Hitbox format : { offsetX, offsetY, width, height, damage, knockback, hitstunType, guardBreak }
// offsetX est signé par rapport au sens du perso (flip automatique en jeu selon facing).

export const CHARACTERS = {
  kaira: {
    id: 'kaira',
    name: 'Kaira "Élastik"',
    tagline: 'Combattante élastique au corps-à-corps imprévisible',
    color: 0xe0433c,
    colorDark: 0x8c1f1a,
    maxHp: 1000,
    walkSpeed: 1.0,
    jumpPower: 1.0,
    weight: 1.0, // influence le knockback reçu
    moves: {
      light: {
        name: 'Jab élastique',
        startup: 80,
        active: 70,
        recovery: 120,
        damage: 40,
        knockback: { x: 60, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 55, offsetY: -60, width: 70, height: 30 },
      },
      heavy: {
        name: 'Poing Fusée',
        startup: 200,
        active: 110,
        recovery: 300,
        damage: 110,
        knockback: { x: 260, y: -120 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 90, offsetY: -60, width: 110, height: 35 },
      },
      special: {
        name: 'Tempête de Poings',
        startup: 180,
        active: 260,
        recovery: 260,
        damage: 180,
        knockback: { x: 320, y: -200 },
        hitstunType: 'special',
        hitbox: { offsetX: 70, offsetY: -70, width: 130, height: 60 },
        meterCost: 100,
      },
    },
  },

  ryn: {
    id: 'ryn',
    name: 'Ryn Kurogane',
    tagline: 'Sabreur précis, spécialiste des enchaînements à trois lames',
    color: 0x3c7be0,
    colorDark: 0x1a3a8c,
    maxHp: 900,
    walkSpeed: 1.1,
    jumpPower: 1.05,
    weight: 0.9,
    moves: {
      light: {
        name: 'Taillade',
        startup: 70,
        active: 60,
        recovery: 110,
        damage: 35,
        knockback: { x: 50, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 60, offsetY: -65, width: 80, height: 25 },
      },
      heavy: {
        name: 'Triple Tranchant',
        startup: 190,
        active: 130,
        recovery: 280,
        damage: 130,
        knockback: { x: 240, y: -100 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 95, offsetY: -65, width: 120, height: 30 },
      },
      special: {
        name: 'Danse des Trois Lames',
        startup: 160,
        active: 300,
        recovery: 300,
        damage: 200,
        knockback: { x: 300, y: -180 },
        hitstunType: 'special',
        hitbox: { offsetX: 80, offsetY: -70, width: 140, height: 50 },
        meterCost: 100,
      },
    },
  },

  tempest: {
    id: 'tempest',
    name: 'Tempest Voss',
    tagline: 'Manipulatrice de foudre, combat à distance et control',
    color: 0xd6c23c,
    colorDark: 0x8c7a1a,
    maxHp: 800,
    walkSpeed: 0.9,
    jumpPower: 1.15,
    weight: 0.8,
    moves: {
      light: {
        name: 'Étincelle',
        startup: 100,
        active: 200,
        recovery: 130,
        damage: 30,
        knockback: { x: 40, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 120, offsetY: -60, width: 90, height: 20, projectile: true, speed: 500 },
      },
      heavy: {
        name: 'Éclair Chargé',
        startup: 220,
        active: 90,
        recovery: 260,
        damage: 120,
        knockback: { x: 200, y: -140 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 85, offsetY: -65, width: 100, height: 40 },
      },
      special: {
        name: 'Orage Total',
        startup: 240,
        active: 320,
        recovery: 300,
        damage: 190,
        knockback: { x: 280, y: -220 },
        hitstunType: 'special',
        hitbox: { offsetX: 0, offsetY: -80, width: 300, height: 90 },
        meterCost: 100,
      },
    },
  },
};

// Boss original de fin de niveau — plus de PV, moveset plus lourd, patterns scriptés
// gérés par BossController selon les phases de vie.
export const BOSSES = {
  kronn: {
    id: 'kronn',
    name: 'Kronn, Tyran des Marées',
    tagline: 'Capitaine déchu devenu titan de pierre et d\'eau',
    color: 0x4a4a6a,
    colorDark: 0x1f1f33,
    maxHp: 2600,
    walkSpeed: 0.6,
    jumpPower: 0.7,
    weight: 2.2,
    isBoss: true,
    moves: {
      light: {
        name: 'Revers de Pierre',
        startup: 140,
        active: 100,
        recovery: 200,
        damage: 60,
        knockback: { x: 120, y: -40 },
        hitstunType: 'light',
        hitbox: { offsetX: 90, offsetY: -70, width: 100, height: 40 },
      },
      heavy: {
        name: 'Fracas des Abysses',
        startup: 260,
        active: 140,
        recovery: 340,
        damage: 160,
        knockback: { x: 300, y: -160 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 110, offsetY: -60, width: 140, height: 50 },
      },
      special: {
        name: 'Raz-de-Marée',
        startup: 300,
        active: 400,
        recovery: 340,
        damage: 220,
        knockback: { x: 360, y: -240 },
        hitstunType: 'special',
        hitbox: { offsetX: 0, offsetY: -70, width: 420, height: 80 },
        meterCost: 100,
      },
    },
  },
};

export function getBoss(id) {
  const base = BOSSES[id];
  if (!base) throw new Error(`Boss inconnu: ${id}`);
  return JSON.parse(JSON.stringify(base));
}

// --- Monstres : adversaires du mode "Vague d'ennemis" (plus faibles à l'unité que
// le roster jouable, mais rencontrés à plusieurs en même temps) ---
export const MONSTERS = {
  goblin: {
    id: 'goblin',
    name: 'Gobelin Pillard',
    color: 0x6b8e4e,
    colorDark: 0x33481f,
    maxHp: 480,
    walkSpeed: 1.15,
    jumpPower: 1,
    weight: 0.8,
    moves: {
      light: {
        name: 'Estafilade',
        startup: 90,
        active: 80,
        recovery: 130,
        damage: 30,
        knockback: { x: 60, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 55, offsetY: -60, width: 70, height: 30 },
      },
      heavy: {
        name: 'Charge Sauvage',
        startup: 170,
        active: 100,
        recovery: 240,
        damage: 80,
        knockback: { x: 200, y: -80 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 80, offsetY: -60, width: 100, height: 35 },
      },
      special: {
        name: 'Frénésie',
        startup: 150,
        active: 200,
        recovery: 240,
        damage: 130,
        knockback: { x: 240, y: -140 },
        hitstunType: 'special',
        hitbox: { offsetX: 70, offsetY: -65, width: 110, height: 45 },
        meterCost: 100,
      },
    },
  },

  skeleton: {
    id: 'skeleton',
    name: 'Squelette Garde-Côte',
    color: 0xd8d3c4,
    colorDark: 0x7a7568,
    maxHp: 620,
    walkSpeed: 0.85,
    jumpPower: 0.9,
    weight: 1.1,
    moves: {
      light: {
        name: 'Entaille d\'Os',
        startup: 100,
        active: 80,
        recovery: 150,
        damage: 35,
        knockback: { x: 60, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 60, offsetY: -65, width: 80, height: 30 },
      },
      heavy: {
        name: 'Coup de Bouclier',
        startup: 180,
        active: 100,
        recovery: 260,
        damage: 90,
        knockback: { x: 220, y: -90 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 85, offsetY: -65, width: 100, height: 40 },
      },
      special: {
        name: 'Rempart Osseux',
        startup: 160,
        active: 220,
        recovery: 260,
        damage: 140,
        knockback: { x: 260, y: -150 },
        hitstunType: 'special',
        hitbox: { offsetX: 75, offsetY: -70, width: 120, height: 50 },
        meterCost: 100,
      },
    },
  },

  mushroom: {
    id: 'mushroom',
    name: 'Champi Toxique',
    color: 0xc25c5c,
    colorDark: 0x6e2e2e,
    maxHp: 700,
    walkSpeed: 0.7,
    jumpPower: 0.8,
    weight: 1.4,
    moves: {
      light: {
        name: 'Coup de Chapeau',
        startup: 110,
        active: 90,
        recovery: 160,
        damage: 35,
        knockback: { x: 70, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 60, offsetY: -55, width: 85, height: 35 },
      },
      heavy: {
        name: 'Écrasement',
        startup: 200,
        active: 110,
        recovery: 280,
        damage: 100,
        knockback: { x: 230, y: -100 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 90, offsetY: -55, width: 110, height: 45 },
      },
      special: {
        name: 'Nuage de Spores',
        startup: 180,
        active: 260,
        recovery: 280,
        damage: 150,
        knockback: { x: 200, y: -120 },
        hitstunType: 'special',
        hitbox: { offsetX: 0, offsetY: -60, width: 220, height: 70 },
        meterCost: 100,
      },
    },
  },

  flying_eye: {
    id: 'flying_eye',
    name: 'Œil Volant',
    color: 0x8f6fd6,
    colorDark: 0x4a3382,
    maxHp: 380,
    walkSpeed: 1.3,
    jumpPower: 1.4,
    weight: 0.6,
    moves: {
      light: {
        name: 'Morsure',
        startup: 80,
        active: 70,
        recovery: 120,
        damage: 25,
        knockback: { x: 50, y: 0 },
        hitstunType: 'light',
        hitbox: { offsetX: 50, offsetY: -70, width: 65, height: 30 },
      },
      heavy: {
        name: 'Plongeon',
        startup: 150,
        active: 90,
        recovery: 220,
        damage: 70,
        knockback: { x: 180, y: -100 },
        hitstunType: 'heavy',
        hitbox: { offsetX: 70, offsetY: -75, width: 90, height: 35 },
      },
      special: {
        name: 'Regard Maudit',
        startup: 160,
        active: 180,
        recovery: 240,
        damage: 110,
        knockback: { x: 200, y: -130 },
        hitstunType: 'special',
        hitbox: { offsetX: 60, offsetY: -80, width: 100, height: 45 },
        meterCost: 100,
      },
    },
  },
};

export const MONSTER_ROSTER = ['goblin', 'skeleton', 'mushroom', 'flying_eye'];

export function getMonster(id) {
  const base = MONSTERS[id];
  if (!base) throw new Error(`Monstre inconnu: ${id}`);
  return JSON.parse(JSON.stringify(base));
}

export const ROSTER_ORDER = ['kaira', 'ryn', 'tempest'];

export function getCharacter(id) {
  const base = CHARACTERS[id];
  if (!base) throw new Error(`Personnage inconnu: ${id}`);
  // Retourne une copie profonde pour éviter les mutations partagées entre instances
  return JSON.parse(JSON.stringify(base));
}
