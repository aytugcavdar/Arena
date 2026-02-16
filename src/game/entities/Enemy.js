import { distance } from '../../utils/math.js';

export class Enemy {
  constructor(x, y, type, config, gameTime) {
    this.x = x;
    this.y = y;
    this.type = type;

    // Time-based scaling
    // Time-based scaling (Quadratic)
    const minutes = gameTime / 60;
    // HP: 1x start, ~4x at 5min, ~10x at 10min, ~27x at 20min
    const hpMult = 1 + Math.pow(minutes, 1.6) * 0.8;
    // Dmg: 1x start, ~2x at 5min, ~3.5x at 10min
    const dmgMult = 1 + Math.pow(minutes, 1.3) * 0.3;

    this.hp = config.hp * hpMult;
    this.maxHp = this.hp;
    this.damage = config.damage * dmgMult;
    this.speed = config.speed;
    this.radius = config.radius;
    this.xpValue = config.xpValue;
    this.color = config.color;
    this.contactCooldown = config.contactCooldown;
    this.damageCooldownTimer = 0;
    this.damageReduction = config.damageReduction || 0;

    // AI
    this.aiType = config.ai;
    this.isDead = false;
    this.hitFlash = 0;

    // Slow/freeze
    this.slowMultiplier = 1;
    this.slowTimer = 0;
    this.frozen = false;
    this.frozenTimer = 0;

    // Burn
    this.burning = false;
    this.burnDamage = 0;
    this.burnTimer = 0;
    this.burnTickTimer = 0;

    // Dash AI
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.isDashing = false;
    this.dashVx = 0;
    this.dashVy = 0;
    this.dashSpeed = config.dashSpeed || 0;
    this.dashDuration = config.dashDuration || 0;
    this.dashCooldown = config.dashCooldown || 0;
    this.dashRange = config.dashRange || 0;

    // Charge AI (elite)
    this.chargeSpeed = config.chargeSpeed || 0;
    this.chargeDuration = config.chargeDuration || 0;
    this.chargeCooldown = config.chargeCooldown || 0;
    this.chargeRange = config.chargeRange || 0;
    this.isCharging = false;
    this.chargeTimer = 0;
    this.chargeCooldownTimer = 0;
    this.chargeVx = 0;
    this.chargeVy = 0;

    // Sine AI (bat)
    this.sineFreq = config.sineFrequency || 0;
    this.sineAmp = config.sineAmplitude || 0;
    this.sinePhase = Math.random() * Math.PI * 2;

    // Elite spawned minions
    this.hasSpawnedMinions = false;
    this.spawnMinionsAtHalf = config.spawnMinionsAtHalf || false;
    this.minionCount = config.minionCount || 0;
    this.minionType = config.minionType || 'zombie';

    this.wobbleTime = Math.random() * 10;
  }

  update(deltaTime, player, gameTime, worldWidth = 4000, worldHeight = 4000) {
    // Keep in bounds
    this.x = Math.max(this.radius, Math.min(this.x, worldWidth - this.radius));
    this.y = Math.max(this.radius, Math.min(this.y, worldHeight - this.radius));

    if (this.frozen) {
      this.frozenTimer -= deltaTime;
      if (this.frozenTimer <= 0) this.frozen = false;
      this.wobbleTime += deltaTime;
      this.damageCooldownTimer = Math.max(0, this.damageCooldownTimer - deltaTime);
      this.updateBurn(deltaTime);
      return null;
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) this.slowMultiplier = 1;
    }

    const effectiveSpeed = this.speed * this.slowMultiplier;
    let spawnRequest = null;

    switch (this.aiType) {
      case 'chase':
        this.chasePlayer(player, deltaTime, effectiveSpeed);
        break;
      case 'dash':
        this.dashAI(player, deltaTime, effectiveSpeed);
        break;
      case 'sine':
        this.sineAI(player, deltaTime, effectiveSpeed, gameTime);
        break;
      case 'charge':
        spawnRequest = this.chargeAI(player, deltaTime, effectiveSpeed);
        break;
      default:
        this.chasePlayer(player, deltaTime, effectiveSpeed);
    }

    this.damageCooldownTimer = Math.max(0, this.damageCooldownTimer - deltaTime);
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);
    this.wobbleTime += deltaTime;
    this.updateBurn(deltaTime);

    return spawnRequest;
  }

  updateBurn(deltaTime) {
    if (!this.burning) return;
    this.burnTimer -= deltaTime;
    this.burnTickTimer -= deltaTime;
    if (this.burnTickTimer <= 0) {
      this.hp -= this.burnDamage;
      this.burnTickTimer = 0.5;
      if (this.hp <= 0) this.isDead = true;
    }
    if (this.burnTimer <= 0) this.burning = false;
  }

  chasePlayer(player, deltaTime, speed) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.x += (dx / dist) * speed * deltaTime;
      this.y += (dy / dist) * speed * deltaTime;
    }
  }

  dashAI(player, deltaTime, speed) {
    const dist = distance(this, player);

    if (this.isDashing) {
      this.x += this.dashVx * this.dashSpeed * deltaTime;
      this.y += this.dashVy * this.dashSpeed * deltaTime;
      this.dashTimer -= deltaTime;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.dashCooldownTimer = this.dashCooldown;
      }
    } else if (dist < this.dashRange && this.dashCooldownTimer <= 0) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      this.dashVx = dx / d;
      this.dashVy = dy / d;
      this.isDashing = true;
      this.dashTimer = this.dashDuration;
    } else {
      this.chasePlayer(player, deltaTime, speed);
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - deltaTime);
    }
  }

  sineAI(player, deltaTime, speed, gameTime) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      const perpX = -ny;
      const perpY = nx;
      const sineOff = Math.sin(gameTime * this.sineFreq + this.sinePhase) * this.sineAmp * deltaTime;
      this.x += (nx * speed * deltaTime) + (perpX * sineOff);
      this.y += (ny * speed * deltaTime) + (perpY * sineOff);
    }
  }

  chargeAI(player, deltaTime, speed) {
    let spawnRequest = null;
    const dist = distance(this, player);

    if (this.isCharging) {
      this.x += this.chargeVx * this.chargeSpeed * deltaTime;
      this.y += this.chargeVy * this.chargeSpeed * deltaTime;
      this.chargeTimer -= deltaTime;
      if (this.chargeTimer <= 0) {
        this.isCharging = false;
        this.chargeCooldownTimer = this.chargeCooldown;
      }
    } else if (dist < this.chargeRange && this.chargeCooldownTimer <= 0) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      this.chargeVx = dx / d;
      this.chargeVy = dy / d;
      this.isCharging = true;
      this.chargeTimer = this.chargeDuration;
    } else {
      this.chasePlayer(player, deltaTime, speed);
      this.chargeCooldownTimer = Math.max(0, this.chargeCooldownTimer - deltaTime);
    }

    // Spawn minions at half health
    if (this.spawnMinionsAtHalf && !this.hasSpawnedMinions && this.hp < this.maxHp * 0.5) {
      this.hasSpawnedMinions = true;
      spawnRequest = { type: this.minionType, count: this.minionCount, x: this.x, y: this.y };
    }

    return spawnRequest;
  }

  takeDamage(amount) {
    const finalDamage = amount * (1 - this.damageReduction);
    this.hp -= finalDamage;
    this.hitFlash = 0.1;
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  applySlow(amount, duration) {
    this.slowMultiplier = 1 - amount;
    this.slowTimer = duration / 1000;
  }

  applyFreeze(duration) {
    this.frozen = true;
    this.frozenTimer = duration / 1000;
  }

  applyBurn(damage, duration) {
    this.burning = true;
    this.burnDamage = damage;
    this.burnTimer = duration / 1000;
    this.burnTickTimer = 0.5;
  }

  canDamagePlayer() {
    return this.damageCooldownTimer <= 0;
  }

  damagePlayer(player) {
    if (this.canDamagePlayer()) {
      player.takeDamage(this.damage);
      this.damageCooldownTimer = this.contactCooldown;
    }
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const r = this.radius;
    const t = this.wobbleTime;

    ctx.save();

    // Frozen overlay
    if (this.frozen) ctx.globalAlpha = 0.7;

    // Hit flash
    const isFlashing = this.hitFlash > 0;
    let baseColor = this.color;
    if (isFlashing) baseColor = '#FFFFFF';
    else if (this.frozen) baseColor = '#88DDFF';

    // Render by type
    switch (this.type) {
      case 'zombie':
        this.renderZombie(ctx, sx, sy, r, t, baseColor);
        break;
      case 'runner':
        this.renderRunner(ctx, sx, sy, r, t, baseColor);
        break;
      case 'tank':
        this.renderTank(ctx, sx, sy, r, t, baseColor);
        break;
      case 'bat':
        this.renderBat(ctx, sx, sy, r, t, baseColor);
        break;
      case 'elite':
        this.renderElite(ctx, sx, sy, r, t, baseColor);
        break;
      default: // boss or unknown
        this.renderBoss(ctx, sx, sy, r, t, baseColor);
        break;
    }

    // Burn flame effect
    if (this.burning) {
      for (let i = 0; i < 4; i++) {
        const fx = sx + Math.sin(t * 8 + i * 1.5) * r * 0.4;
        const fy = sy - r * 0.5 - Math.abs(Math.sin(t * 6 + i)) * r * 0.6;
        const fs = 3 + Math.sin(t * 10 + i) * 2;
        ctx.fillStyle = i % 2 === 0 ? '#FF6600' : '#FFAA00';
        ctx.beginPath();
        ctx.arc(fx, fy, fs, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Frozen crystal overlay
    if (this.frozen) {
      ctx.strokeStyle = 'rgba(136, 221, 255, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i;
        const cr = r * 0.9;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(a) * cr, sy + Math.sin(a) * cr);
        ctx.stroke();
      }
    }

    // HP bar (only when damaged)
    if (this.hp < this.maxHp) {
      const barWidth = r * 2;
      const barHeight = 4;
      const barY = sy - r - 10;
      const barX = sx - barWidth / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

      const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));
      const hpColor = hpPct > 0.5 ? '#4CAF50' : hpPct > 0.25 ? '#FF9800' : '#F44336';
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barWidth * hpPct, barHeight);
    }

    // Boss name
    if (this.isBoss && this.bossName) {
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 14px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#FF0000';
      ctx.fillText(this.bossName, sx, sy - r - 18);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // ========= ZOMBIE: shambling humanoid =========
  renderZombie(ctx, sx, sy, r, t, color) {
    const sway = Math.sin(t * 2) * 3;
    const armSwing = Math.sin(t * 3) * 0.3;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + r * 0.8, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left arm (behind)
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.5, sy - r * 0.1);
    ctx.lineTo(sx - r * 0.9 + sway * 0.3, sy + r * 0.2 + Math.sin(t * 3) * r * 0.15);
    ctx.stroke();

    // Body (torso - trapezoid)
    const bodyGrad = ctx.createLinearGradient(sx, sy - r * 0.5, sx, sy + r * 0.6);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(1, this.darkenColor(color, 0.6));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.35, sy - r * 0.45);
    ctx.lineTo(sx + r * 0.35, sy - r * 0.45);
    ctx.lineTo(sx + r * 0.45, sy + r * 0.6);
    ctx.lineTo(sx - r * 0.45, sy + r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.darkenColor(color, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Torn rags detail
    ctx.strokeStyle = this.darkenColor(color, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.2, sy + r * 0.6);
    ctx.lineTo(sx - r * 0.25, sy + r * 0.75);
    ctx.moveTo(sx + r * 0.1, sy + r * 0.6);
    ctx.lineTo(sx + r * 0.15, sy + r * 0.72);
    ctx.stroke();

    // Right arm (front, reaching)
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(sx + r * 0.5, sy - r * 0.1);
    ctx.lineTo(sx + r * 0.85 - sway * 0.3, sy - r * 0.1 + Math.sin(t * 3 + 1) * r * 0.15);
    ctx.stroke();
    // Claw
    ctx.lineWidth = r * 0.08;
    const clawX = sx + r * 0.85 - sway * 0.3;
    const clawY = sy - r * 0.1 + Math.sin(t * 3 + 1) * r * 0.15;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + r * 0.15, clawY + i * r * 0.1);
      ctx.stroke();
    }

    // Head
    const headY = sy - r * 0.65;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx + sway * 0.2, headY, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.darkenColor(color, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes (dead, uneven)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(sx + sway * 0.2 - r * 0.1, headY - r * 0.03, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#CC0000';
    ctx.beginPath();
    ctx.arc(sx + sway * 0.2 + r * 0.12, headY + r * 0.02, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (jagged)
    ctx.strokeStyle = '#330000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + sway * 0.2 - r * 0.12, headY + r * 0.12);
    ctx.lineTo(sx + sway * 0.2 - r * 0.04, headY + r * 0.16);
    ctx.lineTo(sx + sway * 0.2 + r * 0.04, headY + r * 0.11);
    ctx.lineTo(sx + sway * 0.2 + r * 0.12, headY + r * 0.15);
    ctx.stroke();
  }

  // ========= RUNNER: sleek speedster =========
  renderRunner(ctx, sx, sy, r, t, color) {
    const lean = Math.sin(t * 6) * 0.15;

    // Speed lines behind
    ctx.strokeStyle = `rgba(255, 152, 0, 0.3)`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const ly = sy - r * 0.3 + i * r * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx - r * 1.2 - i * 5, ly);
      ctx.lineTo(sx - r * 0.6, ly);
      ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + r * 0.6, r * 0.5, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (sleek diamond/arrow shape)
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(lean);

    const bodyGrad = ctx.createLinearGradient(-r * 0.3, -r * 0.6, r * 0.3, r * 0.5);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(1, this.darkenColor(color, 0.6));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);         // top
    ctx.lineTo(r * 0.4, -r * 0.15);  // right shoulder
    ctx.lineTo(r * 0.3, r * 0.5);    // right hip
    ctx.lineTo(0, r * 0.65);          // bottom
    ctx.lineTo(-r * 0.3, r * 0.5);   // left hip
    ctx.lineTo(-r * 0.4, -r * 0.15); // left shoulder
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.darkenColor(color, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Racing stripe
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.65);
    ctx.lineTo(0, r * 0.6);
    ctx.stroke();

    // Head (angular)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.95);
    ctx.lineTo(r * 0.25, -r * 0.6);
    ctx.lineTo(-r * 0.25, -r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.darkenColor(color, 0.4);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes (sharp, angular)
    ctx.fillStyle = '#FFFF00';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#FFAA00';
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, -r * 0.78);
    ctx.lineTo(-r * 0.04, -r * 0.74);
    ctx.lineTo(-r * 0.12, -r * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.12, -r * 0.78);
    ctx.lineTo(r * 0.04, -r * 0.74);
    ctx.lineTo(r * 0.12, -r * 0.7);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // ========= TANK: heavy armored brute =========
  renderTank(ctx, sx, sy, r, t, color) {
    const breathe = 1 + Math.sin(t * 1.5) * 0.03;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + r * 0.7, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (large hexag0nal shape)
    const br = r * breathe;
    const bodyGrad = ctx.createRadialGradient(sx, sy, br * 0.2, sx, sy, br);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(0.7, this.darkenColor(color, 0.7));
    bodyGrad.addColorStop(1, this.darkenColor(color, 0.4));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i - Math.PI / 6;
      const px = sx + Math.cos(a) * br * 0.85;
      const py = sy + Math.sin(a) * br * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Armor plates
    ctx.strokeStyle = this.darkenColor(color, 0.35);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cross armor detail
    ctx.strokeStyle = this.darkenColor(color, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - br * 0.5, sy);
    ctx.lineTo(sx + br * 0.5, sy);
    ctx.moveTo(sx, sy - br * 0.5);
    ctx.lineTo(sx, sy + br * 0.5);
    ctx.stroke();

    // Shoulder spikes
    ctx.fillStyle = this.darkenColor(color, 0.4);
    // Left spike
    ctx.beginPath();
    ctx.moveTo(sx - br * 0.7, sy - br * 0.3);
    ctx.lineTo(sx - br * 1.0, sy - br * 0.5);
    ctx.lineTo(sx - br * 0.65, sy - br * 0.1);
    ctx.closePath();
    ctx.fill();
    // Right spike
    ctx.beginPath();
    ctx.moveTo(sx + br * 0.7, sy - br * 0.3);
    ctx.lineTo(sx + br * 1.0, sy - br * 0.5);
    ctx.lineTo(sx + br * 0.65, sy - br * 0.1);
    ctx.closePath();
    ctx.fill();

    // Head (small, armored)
    ctx.fillStyle = this.darkenColor(color, 0.6);
    ctx.beginPath();
    ctx.arc(sx, sy - br * 0.55, br * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.darkenColor(color, 0.35);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes (menacing slits)
    ctx.fillStyle = '#FF3300';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#FF0000';
    ctx.fillRect(sx - br * 0.15, sy - br * 0.58, br * 0.1, br * 0.04);
    ctx.fillRect(sx + br * 0.05, sy - br * 0.58, br * 0.1, br * 0.04);
    ctx.shadowBlur = 0;
  }

  // ========= BAT: winged creature =========
  renderBat(ctx, sx, sy, r, t, color) {
    const wingFlap = Math.sin(t * 12) * 0.4;
    const bob = Math.sin(t * 4) * 3;

    // Shadow  
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + r * 1.5, r * 0.4, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left wing
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.15, sy + bob - r * 0.1);
    ctx.quadraticCurveTo(sx - r * 1.2, sy + bob - r * 0.8 + wingFlap * r, sx - r * 0.9, sy + bob + r * 0.1);
    ctx.quadraticCurveTo(sx - r * 0.8, sy + bob + r * 0.3 + wingFlap * r * 0.3, sx - r * 0.15, sy + bob + r * 0.15);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(sx + r * 0.15, sy + bob - r * 0.1);
    ctx.quadraticCurveTo(sx + r * 1.2, sy + bob - r * 0.8 + wingFlap * r, sx + r * 0.9, sy + bob + r * 0.1);
    ctx.quadraticCurveTo(sx + r * 0.8, sy + bob + r * 0.3 + wingFlap * r * 0.3, sx + r * 0.15, sy + bob + r * 0.15);
    ctx.closePath();
    ctx.fill();

    // Wing membrane lines
    ctx.strokeStyle = this.darkenColor(color, 0.5);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.15, sy + bob);
    ctx.lineTo(sx - r * 0.7, sy + bob - r * 0.4 + wingFlap * r * 0.5);
    ctx.moveTo(sx - r * 0.15, sy + bob);
    ctx.lineTo(sx - r * 0.85, sy + bob - r * 0.1 + wingFlap * r * 0.3);
    ctx.moveTo(sx + r * 0.15, sy + bob);
    ctx.lineTo(sx + r * 0.7, sy + bob - r * 0.4 + wingFlap * r * 0.5);
    ctx.moveTo(sx + r * 0.15, sy + bob);
    ctx.lineTo(sx + r * 0.85, sy + bob - r * 0.1 + wingFlap * r * 0.3);
    ctx.stroke();

    // Body (small oval)
    const bodyGrad = ctx.createRadialGradient(sx, sy + bob, 0, sx, sy + bob, r * 0.35);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(1, this.darkenColor(color, 0.5));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy + bob, r * 0.25, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.12, sy + bob - r * 0.3);
    ctx.lineTo(sx - r * 0.2, sy + bob - r * 0.6);
    ctx.lineTo(sx - r * 0.02, sy + bob - r * 0.25);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + r * 0.12, sy + bob - r * 0.3);
    ctx.lineTo(sx + r * 0.2, sy + bob - r * 0.6);
    ctx.lineTo(sx + r * 0.02, sy + bob - r * 0.25);
    ctx.fill();

    // Eyes (glowing red)
    ctx.fillStyle = '#FF0044';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#FF0044';
    ctx.beginPath();
    ctx.arc(sx - r * 0.08, sy + bob - r * 0.12, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + r * 0.08, sy + bob - r * 0.12, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.04, sy + bob + r * 0.02);
    ctx.lineTo(sx - r * 0.02, sy + bob + r * 0.12);
    ctx.lineTo(sx, sy + bob + r * 0.02);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + r * 0.04, sy + bob + r * 0.02);
    ctx.lineTo(sx + r * 0.02, sy + bob + r * 0.12);
    ctx.lineTo(sx, sy + bob + r * 0.02);
    ctx.fill();
  }

  // ========= ELITE: demonic creature =========
  renderElite(ctx, sx, sy, r, t, color) {
    const pulse = 1 + Math.sin(t * 2) * 0.04;
    const pr = r * pulse;

    // Dark aura
    const aura = ctx.createRadialGradient(sx, sy, pr * 0.3, sx, sy, pr * 1.5);
    aura.addColorStop(0, 'rgba(139, 0, 0, 0.15)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(sx, sy, pr * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Body (spiky star shape)
    const spikes = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = (Math.PI * 2 / (spikes * 2)) * i - Math.PI / 2;
      const dist = i % 2 === 0 ? pr * 0.9 : pr * 0.55;
      const px = sx + Math.cos(a) * dist;
      const py = sy + Math.sin(a) * dist;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Inner body
    const innerGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, pr * 0.55);
    innerGrad.addColorStop(0, this.darkenColor(color, 1.3));
    innerGrad.addColorStop(1, color);
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, pr * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Face - skull pattern
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.ellipse(sx, sy - pr * 0.05, pr * 0.35, pr * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (three, demonic)
    ctx.fillStyle = '#FF0000';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.arc(sx - pr * 0.15, sy - pr * 0.08, pr * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + pr * 0.15, sy - pr * 0.08, pr * 0.07, 0, Math.PI * 2);
    ctx.fill();
    // Third eye
    ctx.fillStyle = '#FF4400';
    ctx.beginPath();
    ctx.arc(sx, sy - pr * 0.2, pr * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Mouth
    ctx.strokeStyle = '#FF2200';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy + pr * 0.08, pr * 0.12, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // ========= BOSS: massive demon king =========
  renderBoss(ctx, sx, sy, r, t, color) {
    const pulse = 1 + Math.sin(t * 1.5) * 0.03;
    const pr = r * pulse;

    // Dark energy aura
    const aura = ctx.createRadialGradient(sx, sy, pr * 0.5, sx, sy, pr * 2);
    aura.addColorStop(0, 'rgba(255, 0, 0, 0.15)');
    aura.addColorStop(0.5, 'rgba(100, 0, 0, 0.08)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(sx, sy, pr * 2, 0, Math.PI * 2);
    ctx.fill();

    // Body (large, imposing pentagon)
    const bodyGrad = ctx.createLinearGradient(sx, sy - pr, sx, sy + pr);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(0.5, this.darkenColor(color, 0.7));
    bodyGrad.addColorStop(1, this.darkenColor(color, 0.4));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(sx, sy - pr * 0.8);
    ctx.lineTo(sx + pr * 0.85, sy - pr * 0.25);
    ctx.lineTo(sx + pr * 0.55, sy + pr * 0.75);
    ctx.lineTo(sx - pr * 0.55, sy + pr * 0.75);
    ctx.lineTo(sx - pr * 0.85, sy - pr * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FF2200';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Crown / Horns
    ctx.fillStyle = this.darkenColor(color, 0.5);
    // Left horn
    ctx.beginPath();
    ctx.moveTo(sx - pr * 0.4, sy - pr * 0.6);
    ctx.lineTo(sx - pr * 0.7, sy - pr * 1.2);
    ctx.lineTo(sx - pr * 0.2, sy - pr * 0.55);
    ctx.closePath();
    ctx.fill();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(sx + pr * 0.4, sy - pr * 0.6);
    ctx.lineTo(sx + pr * 0.7, sy - pr * 1.2);
    ctx.lineTo(sx + pr * 0.2, sy - pr * 0.55);
    ctx.closePath();
    ctx.fill();

    // Face plate
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.ellipse(sx, sy - pr * 0.15, pr * 0.4, pr * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (large, glowing)
    ctx.fillStyle = '#FF0000';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.ellipse(sx - pr * 0.18, sy - pr * 0.2, pr * 0.1, pr * 0.06, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + pr * 0.18, sy - pr * 0.2, pr * 0.1, pr * 0.06, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Mouth (teeth)
    ctx.fillStyle = '#330000';
    ctx.beginPath();
    ctx.arc(sx, sy + pr * 0.05, pr * 0.15, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
      const tx = sx - pr * 0.12 + i * pr * 0.06;
      ctx.beginPath();
      ctx.moveTo(tx, sy + pr * 0.05);
      ctx.lineTo(tx + pr * 0.02, sy + pr * 0.13);
      ctx.lineTo(tx + pr * 0.04, sy + pr * 0.05);
      ctx.fill();
    }

    // Rune symbols rotating
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const a = t * 0.5 + (Math.PI * 2 / 4) * i;
      const rx = sx + Math.cos(a) * pr * 1.3;
      const ry = sy + Math.sin(a) * pr * 1.3;
      ctx.beginPath();
      ctx.arc(rx, ry, pr * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx - pr * 0.06, ry);
      ctx.lineTo(rx + pr * 0.06, ry);
      ctx.moveTo(rx, ry - pr * 0.06);
      ctx.lineTo(rx, ry + pr * 0.06);
      ctx.stroke();
    }
  }

  darkenColor(hex, factor) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.floor(((num >> 16) & 255) * factor);
    const g = Math.floor(((num >> 8) & 255) * factor);
    const b = Math.floor((num & 255) * factor);
    return `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
  }
}
