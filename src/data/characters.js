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

export const ROSTER_ORDER = ['kaira', 'ryn', 'tempest'];

export function getCharacter(id) {
  const base = CHARACTERS[id];
  if (!base) throw new Error(`Personnage inconnu: ${id}`);
  // Retourne une copie profonde pour éviter les mutations partagées entre instances
  return JSON.parse(JSON.stringify(base));
}
