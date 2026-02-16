import { Enemy } from '../entities/Enemy.js';
import { XPCrystal } from '../entities/XPCrystal.js';
import { TreasureChest } from '../entities/TreasureChest.js';
import { ENEMY_CONFIGS, BOSS_CONFIGS, SPAWN_WEIGHTS } from '../../data/enemyConfigs.js';
import { GAME, BOSS_TIMES } from '../../data/constants.js';
import { randomRange, randomInt } from '../../utils/math.js';

export class SpawnManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.spawnTimer = 0;
    this.spawnInterval = 0.5; // check every 500ms
    this.bossesSpawned = new Set();
    this.chestTimer = 0;
    this.chestInterval = 90; // seconds
  }

  update(deltaTime) {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer < this.spawnInterval) return;
    this.spawnTimer = 0;

    const gameTime = this.game.gameTime;
    let minutes = gameTime / 60;

    // ENDLESS MODE SCALING
    // In endless mode, difficulty keeps ramping up after 20 minutes
    if (this.game.difficulty === 'endless' && minutes > 20) {
      // Create artificial "loops" or just exponential scaling
      // For now, let's just make minutes effectively larger for spawn rates
      // but capped for some types if needed.
    } else if (this.game.difficulty !== 'endless' && minutes >= 20) {
      // Normal game ends at 20 min (handled in GameEngine probably, or just stop spawning)
      // But we'll leave it to GameEngine to trigger win state.
    }

    // Check max enemies
    if (this.game.enemies.length >= GAME.MAX_ENEMIES) return;

    // Boss checks
    this.checkBossSpawn(gameTime);

    // Chest checks
    this.chestTimer += deltaTime;
    if (this.chestTimer >= this.chestInterval) {
      this.chestTimer = 0;
      this.spawnChest();
    }

    // Normal enemy spawning
    const rates = this.getSpawnRates(minutes);

    for (const [type, data] of Object.entries(rates)) {
      if (!data.enabled || data.rate <= 0) continue;

      // Probability-based spawn per interval
      const spawnChance = data.rate * this.spawnInterval;
      if (Math.random() < spawnChance) {
        if (type === 'bat') {
          this.spawnSwarm(type, data.groupSize || 5);
        } else {
          this.spawnEnemy(type);
        }
      }
    }
  }

  getSpawnRates(minutes) {
    return {
      zombie: {
        rate: 1 + (minutes * 0.3),
        enabled: true,
      },
      runner: {
        rate: minutes > 2 ? 0.5 + ((minutes - 2) * 0.2) : 0,
        enabled: minutes > 2,
      },
      tank: {
        rate: minutes > 5 ? 0.2 + ((minutes - 5) * 0.1) : 0,
        enabled: minutes > 5,
      },
      bat: {
        rate: minutes > 3 ? 0.3 : 0,
        enabled: minutes > 3,
        groupSize: Math.min(5 + Math.floor(minutes), 15),
      },
      elite: {
        rate: minutes > 10 ? 0.015 : 0,
        enabled: minutes > 10,
      },
    };
  }

  spawnEnemy(type) {
    const config = ENEMY_CONFIGS[type];
    if (!config) return;

    const pos = this.getSpawnPosition();
    const enemy = new Enemy(pos.x, pos.y, type, config, this.game.gameTime);
    this.game.enemies.push(enemy);
  }

  spawnSwarm(type, count) {
    const center = this.getSpawnPosition();
    const config = ENEMY_CONFIGS[type];
    if (!config) return;

    for (let i = 0; i < count; i++) {
      const ox = randomRange(-80, 80);
      const oy = randomRange(-80, 80);
      const enemy = new Enemy(center.x + ox, center.y + oy, type, config, this.game.gameTime);
      this.game.enemies.push(enemy);
      if (this.game.enemies.length >= GAME.MAX_ENEMIES) break;
    }
  }

  spawnMinions(type, count, x, y) {
    const config = ENEMY_CONFIGS[type];
    if (!config) return;
    for (let i = 0; i < count; i++) {
      const ox = randomRange(-50, 50);
      const oy = randomRange(-50, 50);
      const enemy = new Enemy(x + ox, y + oy, type, config, this.game.gameTime);
      this.game.enemies.push(enemy);
    }
  }

  checkBossSpawn(gameTime) {
    for (let i = 0; i < BOSS_CONFIGS.length; i++) {
      const bossConfig = BOSS_CONFIGS[i];
      if (!this.bossesSpawned.has(i) && gameTime >= bossConfig.time) {
        this.bossesSpawned.add(i);
        this.spawnBoss(bossConfig);
      }
    }
  }

  spawnBoss(config) {
    const pos = this.getSpawnPosition();
    const bossEnemy = new Enemy(pos.x, pos.y, 'boss', {
      hp: config.hp,
      damage: config.damage,
      speed: config.speed,
      radius: config.radius,
      xpValue: config.xpValue,
      color: config.color,
      contactCooldown: 1.0,
      ai: 'chase',
      damageReduction: 0.1,
    }, 0); // bosses don't scale further
    bossEnemy.isBoss = true;
    bossEnemy.bossName = config.name;
    this.game.enemies.push(bossEnemy);

    // Notify
    this.game.showBossWarning = true;
    this.game.bossWarningName = config.name;
    this.game.bossWarningTimer = 3;
  }

  spawnXP(x, y, value) {
    const crystal = new XPCrystal(x, y, value);
    this.game.xpCrystals.push(crystal);
  }

  spawnChest(x, y) {
    let pos = { x, y };
    if (x === undefined || y === undefined) {
       // Random spawn near player if not specified
       const p = this.getSpawnPosition();
       pos.x = p.x;
       pos.y = p.y;
    }
    const chest = new TreasureChest(pos.x, pos.y, this.game.gameTime);
    this.game.treasureChests.push(chest);
    if (this.game.soundManager) this.game.soundManager.play('chest');
  }

  getSpawnPosition() {
    const w = this.game.worldWidth;
    const h = this.game.worldHeight;
    const pad = 60;
    const player = this.game.player;

    // Spawn around player, outside viewport
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    const viewW = this.game.canvas.width;
    const viewH = this.game.canvas.height;

    switch (edge) {
      case 0: // top
        x = player.x + randomRange(-viewW, viewW);
        y = player.y - viewH / 2 - pad;
        break;
      case 1: // bottom
        x = player.x + randomRange(-viewW, viewW);
        y = player.y + viewH / 2 + pad;
        break;
      case 2: // left
        x = player.x - viewW / 2 - pad;
        y = player.y + randomRange(-viewH, viewH);
        break;
      case 3: // right
        x = player.x + viewW / 2 + pad;
        y = player.y + randomRange(-viewH, viewH);
        break;
    }

    return { x, y };
  }
}
