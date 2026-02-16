// Game constants
export const GAME = {
  WIDTH: 1600,
  HEIGHT: 900,
  MAX_ENEMIES: 200,
  SPAWN_CHECK_INTERVAL: 500,
  RENDER_BUFFER: 100,
};

export const PLAYER = {
  BASE_HP: 100,
  BASE_SPEED: 150,
  BASE_ARMOR: 0,
  BASE_REGEN: 0,
  BASE_PICKUP_RANGE: 80,
  BASE_DAMAGE_MULT: 1.0,
  BASE_ATTACK_SPEED_MULT: 1.0,
  RADIUS: 15,
  COLOR: '#00D9FF',
  INVULN_DURATION: 0.5,
  MAX_SPEED: 400,
  MAX_WEAPONS: 6,
};

export const XP_FORMULA = {
  BASE: 10,
  EXPONENT: 1.8,
  LINEAR: 5,
};

export const SCALING = {
  HP_TIME_DIVISOR: 120,
  HP_MULTIPLIER: 0.5,
  DMG_TIME_DIVISOR: 180,
  DMG_MULTIPLIER: 0.4,
  SPAWN_TIME_DIVISOR: 90,
  SPAWN_MULTIPLIER: 0.3,
};

export const COLORS = {
  PLAYER: '#00D9FF',
  ZOMBIE: '#4CAF50',
  RUNNER: '#FF9800',
  TANK: '#F44336',
  BAT: '#9C27B0',
  ELITE: '#311B92',
  XP_CRYSTAL: '#FFD700',
  BACKGROUND: '#0a0a1a',
  BACKGROUND_GRADIENT_TOP: '#1a1a2e',
  BACKGROUND_GRADIENT_BOTTOM: '#16213e',
};

export const STAT_UPGRADES = [
  { id: 'maxHp', name: 'Max HP', description: '+20 Max HP', icon: '❤️', stat: 'maxHp', value: 20, weight: 20 },
  { id: 'damage', name: 'Damage', description: '+15% Damage', icon: '⚔️', stat: 'damage', value: 1.15, weight: 15 },
  { id: 'attackSpeed', name: 'Attack Speed', description: '+10% Attack Speed', icon: '⏩', stat: 'attackSpeed', value: 1.10, weight: 15 },
  { id: 'speed', name: 'Move Speed', description: '+10% Speed', icon: '👟', stat: 'speed', value: 1.10, weight: 12 },
  { id: 'armor', name: 'Armor', description: '+8 Armor', icon: '🛡️', stat: 'armor', value: 8, weight: 10 },
  { id: 'hpRegen', name: 'HP Regen', description: '+0.5 HP/s', icon: '💚', stat: 'hpRegen', value: 0.5, weight: 8 },
  { id: 'pickupRange', name: 'Pickup Range', description: '+20% Range', icon: '🧲', stat: 'pickupRange', value: 1.20, weight: 10 },
];

export const BOSS_TIMES = [180, 360, 540, 720]; // 3, 6, 9, 12 min in seconds
