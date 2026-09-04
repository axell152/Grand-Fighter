// Configuration des spritesheets — un pack CC0 différent par personnage
// (Martial Hero, Huntress, Evil Wizard, Evil Wizard 2 — tous LuizMelo, itch.io).
// frameWidth/frameHeight = taille d'une frame dans le fichier source.
// targetHeight = hauteur voulue à l'écran une fois mise à l'échelle dans le jeu.
// originY = ratio vertical (0-1) où se trouvent réellement les pieds dans le cadre
// source (les cadres ont une grosse marge transparente pour laisser de la place
// aux poses d'attaque qui s'étendent plus loin que l'idle).

export const SPRITES = {
  kaira: {
    basePath: '/sprites/kaira',
    frameWidth: 200,
    frameHeight: 200,
    targetHeight: 800,
    originY: 0.61,
    animations: {
      idle: { file: 'Idle.png', frames: 8, frameRate: 8, repeat: -1 },
      run: { file: 'Run.png', frames: 8, frameRate: 12, repeat: -1 },
      jump: { file: 'Jump.png', frames: 2, frameRate: 6, repeat: 0 },
      fall: { file: 'Fall.png', frames: 2, frameRate: 6, repeat: 0 },
      attack1: { file: 'Attack1.png', frames: 6, frameRate: 16, repeat: 0 },
      attack2: { file: 'Attack2.png', frames: 6, frameRate: 16, repeat: 0 },
      takeHit: { file: 'TakeHit.png', frames: 4, frameRate: 14, repeat: 0 },
      death: { file: 'Death.png', frames: 6, frameRate: 8, repeat: 0 },
    },
  },

  ryn: {
    basePath: '/sprites/ryn',
    frameWidth: 150,
    frameHeight: 150,
    targetHeight: 500,
    originY: 0.647,
    animations: {
      idle: { file: 'Idle.png', frames: 8, frameRate: 8, repeat: -1 },
      run: { file: 'Run.png', frames: 8, frameRate: 12, repeat: -1 },
      jump: { file: 'Jump.png', frames: 2, frameRate: 6, repeat: 0 },
      fall: { file: 'Fall.png', frames: 2, frameRate: 6, repeat: 0 },
      attack1: { file: 'Attack1.png', frames: 5, frameRate: 16, repeat: 0 },
      attack2: { file: 'Attack2.png', frames: 7, frameRate: 16, repeat: 0 },
      takeHit: { file: 'TakeHit.png', frames: 3, frameRate: 14, repeat: 0 },
      death: { file: 'Death.png', frames: 8, frameRate: 8, repeat: 0 },
    },
  },

  tempest: {
    basePath: '/sprites/tempest',
    frameWidth: 150,
    frameHeight: 150,
    targetHeight: 500,
    originY: 0.667,
    animations: {
      idle: { file: 'Idle.png', frames: 8, frameRate: 8, repeat: -1 },
      run: { file: 'Run.png', frames: 8, frameRate: 12, repeat: -1 },
      // Pas de frames de saut dans ce pack : on retombe sur l'idle pendant le saut.
      jump: { file: 'Idle.png', frames: 8, frameRate: 8, repeat: -1 },
      fall: { file: 'Idle.png', frames: 8, frameRate: 8, repeat: -1 },
      attack1: { file: 'Attack1.png', frames: 8, frameRate: 16, repeat: 0 },
      // Pas de 2e attaque dédiée : le spécial réutilise l'attaque avec un flash visuel.
      attack2: { file: 'Attack1.png', frames: 8, frameRate: 20, repeat: 0 },
      takeHit: { file: 'TakeHit.png', frames: 4, frameRate: 14, repeat: 0 },
      death: { file: 'Death.png', frames: 5, frameRate: 8, repeat: 0 },
    },
  },

  kronn: {
    basePath: '/sprites/kronn',
    frameWidth: 250,
    frameHeight: 250,
    targetHeight: 500,
    originY: 0.668,
    animations: {
      idle: { file: 'Idle.png', frames: 8, frameRate: 6, repeat: -1 },
      run: { file: 'Run.png', frames: 8, frameRate: 8, repeat: -1 },
      jump: { file: 'Jump.png', frames: 2, frameRate: 6, repeat: 0 },
      fall: { file: 'Fall.png', frames: 2, frameRate: 6, repeat: 0 },
      attack1: { file: 'Attack1.png', frames: 8, frameRate: 12, repeat: 0 },
      attack2: { file: 'Attack2.png', frames: 8, frameRate: 12, repeat: 0 },
      takeHit: { file: 'TakeHit.png', frames: 3, frameRate: 14, repeat: 0 },
      death: { file: 'Death.png', frames: 7, frameRate: 8, repeat: 0 },
    },
  },
};

export function getSpriteConfig(charId) {
  return SPRITES[charId] || null;
}
