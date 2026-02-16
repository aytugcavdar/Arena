export const PASSIVE_CONFIGS = {
  magnet: {
    name: 'Attractorb',
    description: 'Increases pickup range by 30%',
    icon: '🧲',
    maxLevel: 5,
    effect: (player, level) => { player.pickupRange = player.basePickupRange * (1 + level * 0.3); }
  },
  shield: {
    name: 'Force Field',
    description: 'Blocks damage periodically',
    icon: '🛡️',
    maxLevel: 5,
    effect: (player, level) => { player.maxShield = level; player.shieldRegenTime = 30 - level * 2; }
  },
  luck: {
    name: 'Clover',
    description: 'Increases chance for double XP and chests',
    icon: '💎',
    maxLevel: 5,
    effect: (player, level) => { player.luck = 1 + level * 0.2; }
  },
  cooldown: {
    name: 'Empty Tome',
    description: 'Reduces weapon cooldowns by 8%',
    icon: '🕐',
    maxLevel: 5,
    effect: (player, level) => { player.attackSpeedMultiplier = 1 + level * 0.08; }
  },
  regen: {
    name: 'Pummarola',
    description: 'Regenerates 1 HP per second',
    icon: '❤️',
    maxLevel: 5,
    effect: (player, level) => { player.hpRegen = level * 1.0; }
  },
  armor: {
    name: 'Iron Armor',
    description: 'Reduces incoming damage by 2',
    icon: '🥋',
    maxLevel: 5,
    effect: (player, level) => { player.armor = level * 2; }
  },
  speed: {
    name: 'Wings',
    description: 'Increases movement speed by 10%',
    icon: '👟',
    maxLevel: 5,
    effect: (player, level) => { player.speed = player.baseSpeed * (1 + level * 0.1); }
  },
  growth: {
    name: 'Crown',
    description: 'Increases XP gain by 10%',
    icon: '👑',
    maxLevel: 5,
    effect: (player, level) => { player.xpMultiplier = 1 + level * 0.1; }
  },
  duplicator: {
    name: 'Duplicator',
    description: 'Weapons fire more projectiles',
    icon: '💍',
    maxLevel: 2,
    effect: (player, level) => { player.amount = level; }
  }
};
