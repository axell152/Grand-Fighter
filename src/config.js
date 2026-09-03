// Constantes globales du jeu
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GROUND_Y = 460;
export const STAGE_LEFT = 60;
export const STAGE_RIGHT = GAME_WIDTH - 60;

export const GRAVITY_Y = 1400;

export const COLORS = {
  bg: 0x0b2545,
  bgSea: 0x134074,
  ground: 0x8d6a4f,
  groundDark: 0x6b4f39,
  hpFull: 0x33cc55,
  hpMid: 0xe6b800,
  hpLow: 0xdd3333,
  hpBack: 0x330000,
  hitbox: 0xff0033,
  hurtbox: 0x33aaff,
  guard: 0x66d9ff,
  white: 0xffffff,
  black: 0x000000,
};

// Timings communs (en ms) — servent de base, chaque perso peut surcharger
export const DEFAULT_TIMINGS = {
  lightStartup: 90,
  lightActive: 70,
  lightRecovery: 140,
  heavyStartup: 180,
  heavyActive: 90,
  heavyRecovery: 260,
  specialStartup: 220,
  specialActive: 120,
  specialRecovery: 320,
  hitstunLight: 220,
  hitstunHeavy: 420,
  hitstunSpecial: 520,
  blockstun: 160,
  jumpDuration: 620,
};

export const ROUND_TIME_SECONDS = 60;
export const ROUNDS_TO_WIN = 2; // best of 3

export const MOVE_SPEED = 220;
export const JUMP_VELOCITY = -640;

// Distance de combo buffer (fenêtre en ms pour enchaîner un input)
export const INPUT_BUFFER_WINDOW = 200;
