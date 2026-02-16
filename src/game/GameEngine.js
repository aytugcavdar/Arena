import { Player } from './entities/Player.js';
import { Pet } from './entities/Pet.js';
import { SpawnManager } from './systems/SpawnManager.js';
import { CollisionManager } from './systems/CollisionManager.js';
import { WeaponSystem } from './systems/WeaponSystem.js';
import { InputManager } from './systems/InputManager.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { SoundManager } from './systems/SoundManager.js';
import { PASSIVE_CONFIGS } from '../data/passiveConfigs.js';
import { CHARACTER_CONFIGS } from '../data/characterConfigs.js';
import { GAME, STAT_UPGRADES } from '../data/constants.js';
import { WEAPON_CONFIGS } from '../data/weaponConfigs.js';
import { randomFrom } from '../utils/math.js';

export class GameEngine {
  constructor(canvas, difficulty, callbacks, upgrades = {}, characterId = 'mage', settings = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.difficulty = difficulty;
    this.callbacks = callbacks;
    this.upgrades = upgrades;
    this.characterId = characterId;
    this.settings = settings;

    // World
    this.worldWidth = 4000;
    this.worldHeight = 4000;

    // Game state
    this.running = false;
    this.paused = false;
    this.gameTime = 0;
    this.lastFrameTime = 0;
    this.kills = 0; // Initialize kill count

    // Camera
    this.camera = { x: 0, y: 0, width: canvas.width, height: canvas.height };

    // Entities
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.xpCrystals = [];
    this.treasureChests = [];
    this.pet = null;

    // Systems
    this.inputManager = null;
    this.spawnManager = null;
    this.collisionManager = null;
    this.weaponSystem = null;
    this.particleSystem = null;
    this.soundManager = null;

    // Boss warning
    this.showBossWarning = false;
    this.bossWarningName = '';
    this.bossWarningTimer = 0;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeTimer = 0;

    // === COMBO SYSTEM ===
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboTimeout = 2.0; // seconds to keep combo alive
    this.maxComboReached = 0;
    this.comboMultiplier = 1;
    this.comboMessage = '';
    this.comboMessageTimer = 0;

    // === FLOATING DAMAGE NUMBERS ===
    this.damageNumbers = [];

    // === ULTIMATE VISUAL ===
    this.ultimateFlashTimer = 0;

    // Mobile detection
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Background stars (fewer on mobile)
    this.bgStars = [];
    const starCount = this.isMobile ? 80 : 200;
    for (let i = 0; i < starCount; i++) {
      this.bgStars.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.2,
      });
    }

    this.init();
  }

  init() {
    const charConfig = CHARACTER_CONFIGS[this.characterId] || CHARACTER_CONFIGS['mage'];
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2, this.upgrades, charConfig);
    
    this.inputManager = new InputManager();
    this.spawnManager = new SpawnManager(this);
    this.collisionManager = new CollisionManager(this);
    this.weaponSystem = new WeaponSystem(this);
    this.particleSystem = new ParticleSystem();
    this.soundManager = new SoundManager();
    if (this.settings.volume !== undefined) {
      if (this.soundManager.masterGain) {
         this.soundManager.masterGain.gain.value = this.settings.volume;
      }
    }

    this.weaponSystem.addWeapon(this.player, charConfig.startingWeapon);
    
    // Initialize Pet (Always on for now, or based on upgrade)
    this.pet = new Pet(this.player, 'dragon');
  }

  start() {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  pause() { this.paused = true; }
  resume() {
    this.paused = false;
    this.lastFrameTime = performance.now();
  }

  gameLoop = (currentTime) => {
    if (!this.running) return;

    let deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    if (deltaTime > 0.1) deltaTime = 0.016;

    if (!this.paused) {
      this.update(deltaTime);
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  update(deltaTime) {
    this.gameTime += deltaTime;
    this.inputManager.update();

    // Get unified movement (keyboard or touch)
    const movement = this.inputManager.getMovement();

    // Dash check
    if (this.inputManager.consumeDash()) {
      if (this.player.tryDash()) {
        // Visual effect for dash start
          for(let i=0; i<8; i++) {
             // x, y, color, vx, vy, life, size
             this.particleSystem.createParticle(
                 this.player.x, this.player.y, 
                 this.player.color, 
                 (Math.random()-0.5)*200, (Math.random()-0.5)*200, 
                 0.5,
                 3
             );
          }
      }
    }

    // Update player with movement vector
    this.player.update(deltaTime, movement, this.worldWidth, this.worldHeight);

    // Update Pet
    if (this.pet) {
      this.pet.update(deltaTime, this.xpCrystals);
    }

    // Check ultimate trigger
    if (this.inputManager.consumeUltimate() && this.player.canUseUltimate()) {
      this.triggerUltimate();
    }

    // Update camera
    this.updateCamera();

    // Update systems
    this.spawnManager.update(deltaTime);
    this.weaponSystem.update(deltaTime);

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const spawnReq = enemy.update(deltaTime, this.player, this.gameTime, this.worldWidth, this.worldHeight);
      if (spawnReq) {
        this.spawnManager.spawnMinions(spawnReq.type, spawnReq.count, spawnReq.x, spawnReq.y);
      }
      if (enemy.isDead) {
        this.handleEnemyDeath(enemy);
        this.enemies.splice(i, 1);
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(deltaTime);
      if (this.projectiles[i].shouldRemove) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update XP crystals
    for (let i = this.xpCrystals.length - 1; i >= 0; i--) {
      const crystal = this.xpCrystals[i];
      crystal.update(deltaTime, this.player);
      if (crystal.collected) {
        // Apply combo multiplier to XP
        const xpGain = Math.floor(crystal.value * this.comboMultiplier);
        const leveled = this.player.gainXP(xpGain);
        this.xpCrystals.splice(i, 1);
        if (leveled) {
          this.handleLevelUp();
        }
      }
    }

    // Update Treasure Chests
    for (let i = this.treasureChests.length - 1; i >= 0; i--) {
      const chest = this.treasureChests[i];
      if (chest.update(deltaTime, this.player)) {
        this.handleChestCollection(chest);
        this.treasureChests.splice(i, 1);
      }
    }

    // Collisions
    this.collisionManager.update();

    // Particles
    this.particleSystem.update(deltaTime);

    // Combo timer
    this.updateCombo(deltaTime);

    // Damage numbers
    this.updateDamageNumbers(deltaTime);

    // Boss warning
    if (this.showBossWarning) {
      this.bossWarningTimer -= deltaTime;
      if (this.bossWarningTimer <= 0) this.showBossWarning = false;
    }

    // Screen shake
    if (this.shakeTimer > 0) this.shakeTimer -= deltaTime;

    // Ultimate flash
    if (this.ultimateFlashTimer > 0) this.ultimateFlashTimer -= deltaTime;

    // Update UI callbacks
    this.updateCallbacks();

    // Game over check
    if (this.player.hp <= 0) {
      this.handleGameOver();
    }
  }

  // === COMBO SYSTEM ===
  updateCombo(deltaTime) {
    if (this.comboCount > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        // Combo expired
        this.comboCount = 0;
        this.comboMultiplier = 1;
      }
    }
    if (this.comboMessageTimer > 0) {
      this.comboMessageTimer -= deltaTime;
    }
  }

  addComboKill() {
    this.comboCount++;
    this.comboTimer = this.comboTimeout;
    this.comboMultiplier = 1 + Math.min(this.comboCount * 0.1, 3.0);

    if (this.comboCount > this.maxComboReached) {
      this.maxComboReached = this.comboCount;
    }

    // Combo messages
    if (this.comboCount >= 50) {
      this.comboMessage = '💀 GODLIKE!';
      this.comboMessageTimer = 2;
    } else if (this.comboCount >= 25) {
      this.comboMessage = '🔥 UNSTOPPABLE!';
      this.comboMessageTimer = 2;
    } else if (this.comboCount >= 10) {
      this.comboMessage = '⚡ MEGA KILL!';
      this.comboMessageTimer = 1.5;
    } else if (this.comboCount >= 5) {
      this.comboMessage = '💥 KILLING SPREE!';
      this.comboMessageTimer = 1;
    }
  }

  // === ULTIMATE ABILITY ===
  triggerUltimate() {
    this.player.activateUltimate();
    this.shakeIntensity = 12;
    this.shakeTimer = 0.8;
    this.ultimateFlashTimer = 0.4;

    // Damage all visible enemies
    const cam = this.camera;
    for (const enemy of this.enemies) {
      if (this.isVisible(enemy, cam)) {
        const dmg = 80 * this.player.damageMultiplier;
        enemy.takeDamage(dmg);
        this.createDamageNumber(enemy.x, enemy.y, Math.floor(dmg), true);
        this.particleSystem.createExplosion(enemy.x, enemy.y, '#00D9FF');
      }
    }
    
    if (this.soundManager) this.soundManager.play('evolution'); // Ultimate sound reuse

    // Big particle burst at player position
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 / 30) * i;
      const speed = 200 + Math.random() * 300;
      this.particleSystem.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 4 + Math.random() * 4,
        color: i % 2 === 0 ? '#00D9FF' : '#FFFFFF',
      });
    }
  }

  // === FLOATING DAMAGE NUMBERS ===
  createDamageNumber(x, y, amount, isCrit = false) {
    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      amount,
      isCrit,
      isCombo: this.comboCount >= 5,
      life: 1.0,
      vy: -60 - Math.random() * 40,
      scale: isCrit ? 1.5 : 1.0,
    });
  }

  updateDamageNumbers(deltaTime) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life -= deltaTime * 1.2;
      dn.y += dn.vy * deltaTime;
      dn.vy += 20 * deltaTime; // slow down
      if (dn.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  updateCamera() {
    this.camera.x = this.player.x - this.canvas.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2;
  }

  render() {
    const ctx = this.ctx;
    const cam = this.camera;

    // Screen shake offset
    let shakeX = 0, shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Background stars
    for (const star of this.bgStars) {
      const sx = star.x - cam.x;
      const sy = star.y - cam.y;
      if (sx < -10 || sx > this.canvas.width + 10 || sy < -10 || sy > this.canvas.height + 10) continue;
      ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // World border indicator
    this.renderWorldBorder(ctx, cam);

    // XP Crystals
    for (const crystal of this.xpCrystals) {
      if (this.isVisible(crystal, cam)) crystal.render(ctx, cam);
    }

    // Enemies
    for (const enemy of this.enemies) {
      if (this.isVisible(enemy, cam)) enemy.render(ctx, cam);
    }

    // Projectiles
    for (const proj of this.projectiles) {
      if (this.isVisible(proj, cam)) proj.render(ctx, cam);
    }

    // Treasure Chests
    for (const chest of this.treasureChests) {
      if (this.isVisible(chest, cam)) chest.render(ctx, cam);
    }

    // Weapon specials
    this.weaponSystem.renderOrbitals(ctx, cam);
    this.weaponSystem.renderBeams(ctx, cam);

    // Player
    this.player.render(ctx, cam);

    // Pet
    if (this.pet) {
      this.pet.render(ctx, cam);
    }

    // Particles
    this.particleSystem.render(ctx, cam);

    // Floating damage numbers
    this.renderDamageNumbers(ctx, cam);

    // Combo display
    this.renderCombo(ctx);

    // Ultimate ready indicator
    this.renderUltimateReady(ctx);

    // Ultimate flash
    if (this.ultimateFlashTimer > 0) {
      ctx.fillStyle = `rgba(0, 217, 255, ${this.ultimateFlashTimer * 0.5})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Boss warning overlay
    if (this.showBossWarning) {
      this.renderBossWarning(ctx);
    }
    
    // Post-processing effects
    this.renderPostProcessing(ctx);

    ctx.restore();
  }

  renderDamageNumbers(ctx, cam) {
    for (const dn of this.damageNumbers) {
      const sx = dn.x - cam.x;
      const sy = dn.y - cam.y;
      const alpha = Math.max(0, dn.life);
      const size = (dn.isCrit ? 22 : 15) * dn.scale;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${size}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';

      if (dn.isCombo) {
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FFD700';
      } else if (dn.isCrit) {
        ctx.fillStyle = '#FF4444';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#FF0000';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#FFFFFF';
      }

      ctx.fillText(dn.amount, sx, sy);
      ctx.restore();
    }
  }

  renderCombo(ctx) {
    if (this.comboCount < 3) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Combo counter (top center)
    ctx.save();
    ctx.textAlign = 'center';

    // Combo count
    const scale = 1 + Math.sin(performance.now() / 150) * 0.05;
    ctx.font = `bold ${Math.floor(28 * scale)}px Orbitron, sans-serif`;
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFD700';
    ctx.fillText(`${this.comboCount}x COMBO`, w / 2, 80);

    // Multiplier
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#FF6600';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#FF6600';
    ctx.fillText(`XP ×${this.comboMultiplier.toFixed(1)}`, w / 2, 102);

    ctx.restore();

    // Big combo message
    if (this.comboMessageTimer > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, this.comboMessageTimer * 2);
      const msgScale = 1 + (1 - Math.min(1, this.comboMessageTimer)) * 0.3;
      ctx.font = `bold ${Math.floor(48 * msgScale)}px Orbitron, sans-serif`;

      if (this.comboMessage.includes('GODLIKE')) {
        ctx.fillStyle = '#FF0000';
        ctx.shadowColor = '#FF0000';
      } else if (this.comboMessage.includes('UNSTOPPABLE')) {
        ctx.fillStyle = '#FF6600';
        ctx.shadowColor = '#FF6600';
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
      }
      ctx.shadowBlur = 20;
      ctx.fillText(this.comboMessage, w / 2, h / 2 - 60);
      ctx.restore();
    }
  }

  renderUltimateReady(ctx) {
    if (!this.player.canUseUltimate()) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const t = performance.now() / 1000;

    ctx.save();
    ctx.textAlign = 'center';
    const alpha = 0.6 + Math.sin(t * 4) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.fillStyle = '#00D9FF';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00D9FF';

    const text = this.isMobile ? '⚡ TAP TO ULTIMATE ⚡' : '⚡ PRESS SPACE ⚡';
    ctx.fillText(text, w / 2, h - 50);
    ctx.restore();
  }

  renderWorldBorder(ctx, cam) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-cam.x, -cam.y, this.worldWidth, this.worldHeight);
  }

  renderBossWarning(ctx) {
    const alpha = Math.min(1, this.bossWarningTimer);
    ctx.save();
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.2})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.font = 'bold 48px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF0000';
    ctx.fillText('⚠ BOSS APPROACHING ⚠', this.canvas.width / 2, this.canvas.height / 2 - 20);
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
    ctx.fillText(this.bossWarningName, this.canvas.width / 2, this.canvas.height / 2 + 30);
    ctx.restore();
  }

  isVisible(entity, cam) {
    const buf = GAME.RENDER_BUFFER;
    return (
      entity.x > cam.x - buf &&
      entity.x < cam.x + cam.width + buf &&
      entity.y > cam.y - buf &&
      entity.y < cam.y + cam.height + buf
    );
  }

  handleEnemyDeath(enemy) {
    this.spawnManager.spawnXP(enemy.x, enemy.y, enemy.xpValue);
    this.particleSystem.createDeathEffect(enemy.x, enemy.y, enemy.color);
    this.player.kills++;

    // Combo
    this.addComboKill();

    // Ultimate charge (+5 per kill)
    this.player.addUltimateCharge(5);

    if (enemy.isBoss) {
      this.shakeIntensity = 8;
      this.shakeTimer = 0.5;
      this.player.addUltimateCharge(30);
    }
  }

  // Called from CollisionManager when enemy damages player
  onPlayerDamaged() {
    this.player.addUltimateCharge(10);
  }

  // Called from CollisionManager when projectile hits enemy
  onEnemyHit(enemy, damage) {
    this.createDamageNumber(enemy.x, enemy.y, Math.floor(damage), damage > 50);
  }

  handleLevelUp() {
    if (this.soundManager) this.soundManager.play('levelup');
    const options = this.generateUpgradeOptions();
    this.callbacks.onLevelUp(options);
  }

  handleChestCollection(chest) {
    if (this.soundManager) this.soundManager.play('chest');
    
    // 1. Try Evolution
    const evolvableWeapon = this.weaponSystem.activeWeapons.find(w => {
      const config = WEAPON_CONFIGS[w.id];
      return !w.isEvolved && config.evolution && w.level >= config.levels.length - 1;
    });

    if (evolvableWeapon) {
      this.weaponSystem.evolveWeapon(this.player, evolvableWeapon.id);
      // Show evolution UI
      this.callbacks.onEvolution({
        weaponId: evolvableWeapon.id,
        name: WEAPON_CONFIGS[evolvableWeapon.id].evolution.name,
        icon: WEAPON_CONFIGS[evolvableWeapon.id].evolution.icon
      });
      return;
    }

    // 2. Give Random Passive or Gold
    const passives = Object.keys(PASSIVE_CONFIGS);
    const passiveId = randomFrom(passives);
    const passive = PASSIVE_CONFIGS[passiveId];
    
    // Apply passive effect directly (simplified for now)
    // In a full system we'd track levels, but here we just give a stack
    let currentLevel = this.player.passives[passiveId] || 0;
    if (currentLevel < passive.maxLevel) {
      currentLevel++;
      this.player.passives[passiveId] = currentLevel;
      passive.effect(this.player, currentLevel);
      
      this.damageNumbers.push({
        x: this.player.x,
        y: this.player.y - 40,
        amount: `${passive.icon} ${passive.name}`,
        life: 2.0,
        vy: -30,
        scale: 1.0,
        isCrit: true // simplified reuse
      });
    } else {
      // Gold/XP fallback
      const xp = 500;
      this.player.gainXP(xp);
       this.damageNumbers.push({
        x: this.player.x,
        y: this.player.y - 40,
        amount: `💰 ${xp} XP`,
        life: 2.0,
        vy: -30,
        scale: 1.2,
        isCrit: true
      });
    }
  }

  renderPostProcessing(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Vignette
    const grad = ctx.createRadialGradient(w/2, h/2, h*0.4, w/2, h/2, h*0.8);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'multiply'; // distinct look
    ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation = 'source-over';

    // Low HP Pulse
    if (this.player.hp < this.player.maxHp * 0.3) {
      const pulse = Math.sin(performance.now() / 200) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.2})`;
      ctx.fillRect(0,0,w,h);
    }
  }

  generateUpgradeOptions() {
    const options = [];
    const playerWeaponIds = this.weaponSystem.activeWeapons.map(w => w.id);
    const allWeaponIds = Object.keys(WEAPON_CONFIGS);
    const availableNewWeapons = allWeaponIds.filter(id => !playerWeaponIds.includes(id));
    const upgradableWeapons = this.weaponSystem.activeWeapons.filter(
      w => w.level < WEAPON_CONFIGS[w.id].levels.length - 1
    );

    if (availableNewWeapons.length > 0 && playerWeaponIds.length < 6) {
      const wid = randomFrom(availableNewWeapons);
      const config = WEAPON_CONFIGS[wid];
      options.push({
        type: 'weapon',
        weaponId: wid,
        name: config.name,
        description: config.description,
        icon: config.icon,
        level: 1,
      });
    }

    if (upgradableWeapons.length > 0) {
      const w = randomFrom(upgradableWeapons);
      const config = WEAPON_CONFIGS[w.id];
      options.push({
        type: 'weaponUpgrade',
        weaponId: w.id,
        name: `${config.name} Lv${w.level + 2}`,
        description: `Upgrade ${config.name}`,
        icon: config.icon,
        level: w.level + 2,
      });
    }

    const shuffledStats = [...STAT_UPGRADES].sort(() => Math.random() - 0.5);
    let idx = 0;
    while (options.length < 3 && idx < shuffledStats.length) {
      options.push({
        type: 'stat',
        stat: shuffledStats[idx].stat,
        value: shuffledStats[idx].value,
        name: shuffledStats[idx].name,
        description: shuffledStats[idx].description,
        icon: shuffledStats[idx].icon,
      });
      idx++;
    }

    return options.slice(0, 3);
  }

  applyUpgrade(upgrade) {
    if (upgrade.type === 'weapon') {
      this.weaponSystem.addWeapon(this.player, upgrade.weaponId);
    } else if (upgrade.type === 'weaponUpgrade') {
      this.weaponSystem.upgradeWeapon(this.player, upgrade.weaponId);
    } else if (upgrade.type === 'stat') {
      this.player.applyStatUpgrade(upgrade.stat, upgrade.value);
    }
  }

  handleGameOver() {
    this.stop();
    this.callbacks.onGameOver({
      time: this.gameTime,
      kills: this.player.kills,
      level: this.player.level,
      maxCombo: this.maxComboReached,
    });
  }

  updateCallbacks() {
    this.callbacks.onPlayerStatsUpdate({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      xp: this.player.xp,
      xpRequired: this.player.xpRequired,
      level: this.player.level,
      weapons: this.player.weapons,
      ultimateCharge: this.player.ultimateCharge,
      ultimateMax: this.player.ultimateMax,
      comboCount: this.comboCount,
      comboMultiplier: this.comboMultiplier,
    });

    this.callbacks.onGameStatsUpdate({
      time: Math.floor(this.gameTime),
      kills: this.player.kills,
      enemies: this.enemies.length,
    });
  }

  // Expose for MiniMap
  getState() {
    return {
      player: this.player,
      enemies: this.enemies,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
      camera: this.camera,
      chests: this.treasureChests,
    };
  }
}
