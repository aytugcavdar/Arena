export class AchievementSystem {
  constructor() {
    this.achievements = [
      { id: 'first_blood', name: 'First Blood', desc: 'Kill your first enemy', icon: '🩸', condition: (s) => s.kills >= 1 },
      { id: 'kill_50', name: 'Slayer', desc: 'Kill 50 enemies', icon: '⚔️', condition: (s) => s.kills >= 50 },
      { id: 'kill_100', name: 'Centurion', desc: 'Kill 100 enemies', icon: '🛡️', condition: (s) => s.kills >= 100 },
      { id: 'kill_500', name: 'Warlord', desc: 'Kill 500 enemies', icon: '👑', condition: (s) => s.kills >= 500 },
      { id: 'kill_1000', name: 'Annihilator', desc: 'Kill 1000 enemies', icon: '💀', condition: (s) => s.kills >= 1000 },
      { id: 'survive_5', name: '5 Min Survivor', desc: 'Survive 5 minutes', icon: '⏱️', condition: (s) => s.time >= 300 },
      { id: 'survive_10', name: '10 Min Legend', desc: 'Survive 10 minutes', icon: '🏅', condition: (s) => s.time >= 600 },
      { id: 'survive_15', name: '15 Min Immortal', desc: 'Survive 15 minutes', icon: '🌟', condition: (s) => s.time >= 900 },
      { id: 'combo_10', name: 'Combo Starter', desc: 'Reach 10x combo', icon: '🔥', condition: (s) => s.maxCombo >= 10 },
      { id: 'combo_25', name: 'Combo Master', desc: 'Reach 25x combo', icon: '💥', condition: (s) => s.maxCombo >= 25 },
      { id: 'combo_50', name: 'Combo God', desc: 'Reach 50x combo', icon: '⚡', condition: (s) => s.maxCombo >= 50 },
      { id: 'level_10', name: 'Leveling Up', desc: 'Reach level 10', icon: '📈', condition: (s) => s.level >= 10 },
    ];

    this.unlocked = new Set();
    this.pendingToasts = [];
  }

  check(stats) {
    for (const ach of this.achievements) {
      if (!this.unlocked.has(ach.id) && ach.condition(stats)) {
        this.unlocked.add(ach.id);
        this.pendingToasts.push({
          name: ach.name,
          desc: ach.desc,
          icon: ach.icon,
          timer: 3.0,
        });
      }
    }
  }

  getToasts() {
    return this.pendingToasts;
  }

  updateToasts(deltaTime) {
    for (let i = this.pendingToasts.length - 1; i >= 0; i--) {
      this.pendingToasts[i].timer -= deltaTime;
      if (this.pendingToasts[i].timer <= 0) {
        this.pendingToasts.splice(i, 1);
      }
    }
  }
}
