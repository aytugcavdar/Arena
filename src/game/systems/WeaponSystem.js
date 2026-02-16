import { Projectile } from '../entities/Projectile.js';
import { WEAPON_CONFIGS } from '../../data/weaponConfigs.js';
import { distance, angleBetween, randomRange } from '../../utils/math.js';

export class WeaponSystem {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.activeWeapons = []; // { id, level, cooldownTimer }
    this.orbitAngle = 0;

    // Beam state
    this.activeBeams = [];
  }

  addWeapon(player, weaponId) {
    const existing = this.activeWeapons.find(w => w.id === weaponId);
    if (existing) {
      this.upgradeWeapon(player, weaponId);
      return;
    }
    this.activeWeapons.push({ id: weaponId, level: 0, cooldownTimer: 0, isEvolved: false });
    player.weapons.push({ id: weaponId, level: 1, name: WEAPON_CONFIGS[weaponId].name, icon: WEAPON_CONFIGS[weaponId].icon });
  }

  evolveWeapon(player, weaponId) {
    const weapon = this.activeWeapons.find(w => w.id === weaponId);
    if (!weapon || weapon.isEvolved) return;

    const config = WEAPON_CONFIGS[weaponId];
    if (weapon.level < config.levels.length - 1) return; // Must be max level

    weapon.isEvolved = true;
    
    // Update player UI ref
    const pw = player.weapons.find(w => w.id === weaponId);
    if (pw) {
      pw.name = config.evolution.name;
      pw.icon = config.evolution.icon;
      pw.isEvolved = true;
    }

    // Play Evolution Sound/Effect
    if (this.game.soundManager) this.game.soundManager.play('evolution');
    this.game.particleSystem.createExplosion(player.x, player.y, '#FFD700', 100);
  }

  upgradeWeapon(player, weaponId) {
    const weapon = this.activeWeapons.find(w => w.id === weaponId);
    if (!weapon) return;
    const config = WEAPON_CONFIGS[weaponId];
    if (weapon.level < config.levels.length - 1) {
      weapon.level++;
      const pw = player.weapons.find(w => w.id === weaponId);
      if (pw) pw.level = weapon.level + 1;
    }
  }

  update(deltaTime) {
    const player = this.game.player;
    const enemies = this.game.enemies;

    this.orbitAngle += deltaTime;

    for (const weapon of this.activeWeapons) {
      weapon.cooldownTimer -= deltaTime;

      const config = WEAPON_CONFIGS[weapon.id];
      const levelConfig = config.levels[weapon.level];
      const effectiveCooldown = (levelConfig.cooldown || 0) / 1000 / player.attackSpeedMultiplier;

      if (config.type === 'orbit') {
        this.updateOrbit(player, enemies, weapon, levelConfig);
        continue;
      }

      if (weapon.cooldownTimer > 0) continue;
      if (enemies.length === 0) continue;

      weapon.cooldownTimer = effectiveCooldown;

      switch (config.type) {
        case 'projectile':
          this.fireProjectile(player, enemies, levelConfig, weapon);
          break;
        case 'chain':
          this.fireLightning(player, enemies, levelConfig, weapon);
          break;
        case 'boomerang':
          this.fireBoomerang(player, enemies, levelConfig, weapon);
          break;
        case 'radial':
          this.fireRadial(player, levelConfig, weapon);
          break;
        case 'beam':
          this.fireBeam(player, enemies, levelConfig, weapon);
          break;
      }
    }

    // Update beams
    for (let i = this.activeBeams.length - 1; i >= 0; i--) {
      const beam = this.activeBeams[i];
      beam.timer -= deltaTime;
      beam.tickTimer -= deltaTime;
      if (beam.tickTimer <= 0) {
        beam.tickTimer = 0.1;
        this.applyBeamDamage(beam);
      }
      if (beam.timer <= 0) {
        this.activeBeams.splice(i, 1);
      }
    }
  }

  fireProjectile(player, enemies, config, weapon) {
    const isEvolved = weapon.isEvolved;
    const count = (isEvolved ? config.projectileCount + 2 : config.projectileCount) + (player.amount || 0);
    const targets = this.getNearestEnemies(player, enemies, count);
    
    // If evolved (Inferno), fire in random directions if no targets
    if (isEvolved && targets.length < count) {
      for (let i = 0; i < count - targets.length; i++) {
        const angle = Math.random() * Math.PI * 2;
        this.createFireball(player.x, player.y, Math.cos(angle), Math.sin(angle), config, isEvolved);
      }
    }

    for (const target of targets) {
      const angle = angleBetween(player, target);
      this.createFireball(player.x, player.y, Math.cos(angle), Math.sin(angle), config, isEvolved);
    }
  }

  createFireball(x, y, vx, vy, config, isEvolved) {
    const proj = new Projectile(x, y, vx, vy, config.damage * (isEvolved ? 2 : 1), config.speed, {
      color: isEvolved ? '#FF0000' : '#FF6600',
      trailColor: isEvolved ? '#FF000080' : '#FF440060',
      radius: isEvolved ? 15 : 8,
      aoeRadius: isEvolved ? 80 : (config.aoeRadius || 0),
      aoeDamageMult: config.aoeDamageMult || 0.5,
      lifetime: config.range / config.speed,
      onHitEffect: isEvolved ? (x, y) => this.game.particleSystem.createExplosion(x, y, '#FF4400', 60) : null,
    });
    this.game.projectiles.push(proj);
  }

  fireLightning(player, enemies, config, weapon) {
    if (enemies.length === 0) return;

    const isEvolved = weapon.isEvolved;
    // Evolved: Thunder God - hits random enemies if no chain available, unlimited count effectively
    const chainLimit = isEvolved ? 99 : config.chainCount;
    const damage = config.damage * player.damageMultiplier * (isEvolved ? 1.5 : 1);

    // Find nearest enemy
    let nearest = null;
    let nearestDist = Infinity;
    for (const e of enemies) {
      const d = distance(player, e);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }
    if (!nearest) return;

    const chainTargets = [nearest];
    let currentTarget = nearest;
    let currentDamage = damage;

    // First hit
    nearest.takeDamage(currentDamage);
    this.game.particleSystem.createHitEffect(nearest.x, nearest.y, isEvolved ? '#AA00FF' : '#44AAFF');
    this.game.onEnemyHit(nearest, currentDamage); // for dmg text

    // Chain
    const chainDecay = isEvolved ? 0.95 : (config.chainDecay || 0.75);
    const range = isEvolved ? 400 : config.chainRange;

    for (let i = 1; i < chainLimit; i++) {
      let nextTarget = null;
      let nextDist = Infinity;

      for (const e of enemies) {
        if (chainTargets.includes(e) || e.isDead) continue;
        const d = distance(currentTarget, e);
        if (d < range && d < nextDist) {
          nextDist = d;
          nextTarget = e;
        }
      }

      if (!nextTarget) break;

      currentDamage *= chainDecay;
      nextTarget.takeDamage(currentDamage);
      this.game.particleSystem.createLightningChain(currentTarget, nextTarget, isEvolved ? '#AA00FF' : '#44AAFF');
      this.game.particleSystem.createHitEffect(nextTarget.x, nextTarget.y, isEvolved ? '#AA00FF' : '#44AAFF');
      this.game.onEnemyHit(nextTarget, currentDamage);

      chainTargets.push(nextTarget);
      currentTarget = nextTarget;
    }
  }

  fireBoomerang(player, enemies, config, weapon) {
    const isEvolved = weapon.isEvolved;
    const count = (isEvolved ? config.count * 2 : config.count) + (player.amount || 0);
    
    for (let i = 0; i < count; i++) {
      let angle;
      if (enemies.length > 0 && !isEvolved) {
        const target = this.getNearestEnemies(player, enemies, 1)[0];
        angle = angleBetween(player, target) + randomRange(-0.3, 0.3) * i;
      } else {
        // Evolved: spread out perfectly
        angle = player.facingAngle + (i * Math.PI * 2 / count);
      }

      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      const proj = new Projectile(player.x, player.y, vx, vy, config.damage * (isEvolved ? 1.5 : 1), config.speed * (isEvolved ? 1.5 : 1), {
        color: isEvolved ? '#FFD700' : '#00E5CC',
        trailColor: isEvolved ? '#FFD70060' : '#00E5CC60',
        radius: isEvolved ? 16 : 12,
        isBoomerang: true,
        maxDist: config.maxDist * (isEvolved ? 2 : 1),
        piercing: isEvolved ? true : (config.piercing || false),
        homing: isEvolved ? true : (config.homing || false),
        ownerRef: player,
        lifetime: 5,
      });
      this.game.projectiles.push(proj);
    }
  }

  fireRadial(player, config, weapon) {
    const isEvolved = weapon.isEvolved;
    // Evolved: Blizzard - fires rapidly, continuously
    const count = (isEvolved ? config.shardCount * 1.5 : config.shardCount) + (player.amount || 0);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (isEvolved ? this.orbitAngle * 2 : this.orbitAngle);
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      const proj = new Projectile(player.x, player.y, vx, vy, config.damage * (isEvolved ? 1.2 : 1), config.speed, {
        color: isEvolved ? '#FFFFFF' : '#88DDFF',
        trailColor: isEvolved ? '#FFFFFF80' : '#88DDFF40',
        radius: 6,
        piercing: true,
        lifetime: config.range / config.speed,
        slowAmount: isEvolved ? 0.8 : (config.slowAmount || 0),
        freezeDuration: isEvolved ? 3000 : (config.freezeDuration || 0),
      });
      this.game.projectiles.push(proj);
    }
  }

  fireBeam(player, enemies, config, weapon) {
    if (enemies.length === 0) return;
    const isEvolved = weapon.isEvolved;
    // Evolved: Divine Judgment - massive width, instant kill chance
    const width = isEvolved ? config.beamWidth * 4 : config.beamWidth;
    const target = enemies[Math.floor(Math.random() * enemies.length)];
    
    this.activeBeams.push({
      x: target.x,
      width: width,
      damage: config.damage * (isEvolved ? 2 : 1),
      maxHits: isEvolved ? 9999 : config.maxHits,
      timer: config.duration / 1000,
      tickTimer: 0,
      burnDamage: isEvolved ? 50 : (config.burnDamage || 0),
      burnDuration: config.burnDuration || 0,
      hitCount: 0,
      isEvolved: isEvolved,
    });
  }

  applyBeamDamage(beam) {
    const finalDamage = beam.damage * 0.2 * this.game.player.damageMultiplier; // per tick
    for (const enemy of this.game.enemies) {
      if (beam.hitCount >= beam.maxHits) break;
      if (Math.abs(enemy.x - beam.x) < beam.width / 2 + enemy.radius) {
        enemy.takeDamage(finalDamage);
        beam.hitCount++;
        if (beam.burnDamage > 0) {
          enemy.applyBurn(beam.burnDamage, beam.burnDuration);
        }
      }
    }
    beam.hitCount = 0; // reset per tick
  }

  updateOrbit(player, enemies, weapon, config) {
    const isEvolved = weapon.isEvolved;
    const orbCount = (isEvolved ? config.orbCount + 4 : config.orbCount) + (player.amount || 0);
    const radius = isEvolved ? config.orbitRadius * 1.5 : config.orbitRadius;
    const speed = isEvolved ? config.rotationSpeed * 2 : config.rotationSpeed;
    const damage = config.damage * player.damageMultiplier * (isEvolved ? 1.5 : 1);

    for (let i = 0; i < orbCount; i++) {
      const angle = this.orbitAngle * speed + (Math.PI * 2 / orbCount) * i;
      const ox = player.x + Math.cos(angle) * radius;
      const oy = player.y + Math.sin(angle) * radius;
      const orbRadius = isEvolved ? 18 : 12;

      // Evolved: Void Vortex - sucks enemies in
      if (isEvolved) {
        for (const enemy of enemies) {
           const d = distance({x:ox, y:oy}, enemy);
           if (d < 150) {
             const pullAngle = Math.atan2(oy - enemy.y, ox - enemy.x);
             enemy.x += Math.cos(pullAngle) * 100 * 0.016;
             enemy.y += Math.sin(pullAngle) * 100 * 0.016;
           }
        }
      }

      // Check collision with enemies
      for (const enemy of enemies) {
        const dx = enemy.x - ox;
        const dy = enemy.y - oy;
        if (dx * dx + dy * dy < (orbRadius + enemy.radius) * (orbRadius + enemy.radius)) {
          if (!enemy._orbHitTimer || enemy._orbHitTimer <= 0) {
            enemy.takeDamage(damage);
            this.game.onEnemyHit(enemy, damage);
            enemy._orbHitTimer = 0.2;
            this.game.particleSystem.createHitEffect(ox, oy, isEvolved ? '#4400AA' : '#CC66FF');
          }
        }
        if (enemy._orbHitTimer) enemy._orbHitTimer -= 0.016; // approx
      }
    }
  }

  renderOrbitals(ctx, camera) {
    const player = this.game.player;
    for (const weapon of this.activeWeapons) {
      const config = WEAPON_CONFIGS[weapon.id];
      if (config.type !== 'orbit') continue;

      const levelConfig = config.levels[weapon.level];
      const orbCount = levelConfig.orbCount;
      const radius = levelConfig.orbitRadius;
      const speed = levelConfig.rotationSpeed;

      for (let i = 0; i < orbCount; i++) {
        const angle = this.orbitAngle * speed + (Math.PI * 2 / orbCount) * i;
        const ox = player.x + Math.cos(angle) * radius - camera.x;
        const oy = player.y + Math.sin(angle) * radius - camera.y;

        // Glow
        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 20);
        glow.addColorStop(0, 'rgba(204, 102, 255, 0.5)');
        glow.addColorStop(1, 'rgba(204, 102, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ox, oy, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#CC66FF';
        ctx.beginPath();
        ctx.arc(ox, oy, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#EECCFF';
        ctx.beginPath();
        ctx.arc(ox - 2, oy - 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderBeams(ctx, camera) {
    for (const beam of this.activeBeams) {
      const sx = beam.x - camera.x;
      const alpha = Math.min(1, beam.timer * 3);

      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      const grad = ctx.createLinearGradient(sx - beam.width, 0, sx + beam.width, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, '#FFD70060');
      grad.addColorStop(0.5, '#FFD700');
      grad.addColorStop(0.7, '#FFD70060');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(sx - beam.width, 0, beam.width * 2, this.game.canvas.height);

      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(sx - beam.width * 0.2, 0, beam.width * 0.4, this.game.canvas.height);
      ctx.restore();
    }
  }

  getNearestEnemies(player, enemies, count) {
    return [...enemies]
      .map(e => ({ enemy: e, dist: distance(player, e) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count)
      .map(e => e.enemy);
  }
}
