export const CHARACTER_CONFIGS = {
  mage: {
    id: 'mage',
    name: 'Pyromancer',
    description: 'Balanced stats. Starts with Fireball.',
    icon: '🧙‍♂️',
    stats: {
      maxHp: 100,
      speed: 150,
      armor: 0,
      hpRegen: 0,
      damageMult: 1.0,
      cooldownMult: 1.0,
    },
    startingWeapon: 'fireball',
    color: '#00D9FF',
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    description: 'High HP & Regen. Starts with Holy Beam.',
    icon: '🧙‍♀️',
    stats: {
      maxHp: 150,
      speed: 130, // Slower
      armor: 2,
      hpRegen: 0.5,
      damageMult: 0.9,
      cooldownMult: 1.0,
    },
    startingWeapon: 'holyBeam',
    color: '#FFD700',
  }
};
