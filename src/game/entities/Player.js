import { PLAYER, XP_FORMULA } from '../../data/constants.js';
import { clamp } from '../../utils/math.js';

export class Player {
  constructor(x, y, upgrades = {}, charConfig = null) {
    this.x = x;
    this.y = y;
    this.radius = PLAYER.RADIUS;
    this.charConfig = charConfig;

    // Apply permanent upgrades
    // might: +5% dmg, armor: +1, recovery: +0.1, speed: +5%, greed: handled in pickup
    const bonusDmg = (upgrades.might || 0) * 0.05;
    const bonusArmor = (upgrades.armor || 0) * 1;
    const bonusRegen = (upgrades.recovery || 0) * 0.1;
    const bonusSpeed = (upgrades.speed || 0) * 0.05;

    // Character Base Stats (or default)
    const base = charConfig?.stats || {
      maxHp: PLAYER.BASE_HP,
      speed: PLAYER.BASE_SPEED,
      armor: PLAYER.BASE_ARMOR,
      hpRegen: PLAYER.BASE_REGEN,
      damageMult: 1.0,
      cooldownMult: 1.0,
    };

    // Stats
    this.hp = Number.isFinite(base.maxHp) ? base.maxHp : PLAYER.BASE_HP;
    this.maxHp = this.hp;
    
    let spd = base.speed * (1 + bonusSpeed);
    this.speed = Number.isFinite(spd) ? spd : PLAYER.BASE_SPEED;
    
    this.armor = (base.armor || 0) + bonusArmor;
    this.hpRegen = (base.hpRegen || 0) + bonusRegen;
    this.pickupRange = PLAYER.BASE_PICKUP_RANGE;

    // XP and leveling
    this.xp = 0;
    this.xpRequired = 15;
    this.level = 1;
    this.kills = 0; // Initialize kill count
    this.goldMultiplier = 1 + (upgrades.greed || 0) * 0.1; // New prop for gold

    // Ultimate
    this.ultimateCharge = 0;
    this.ultimateMax = 100;
    this.ultimateActive = false;

    // Combat
    this.damageMultiplier = PLAYER.BASE_DAMAGE_MULT * base.damageMult * (1 + bonusDmg);
    this.attackSpeedMultiplier = PLAYER.BASE_ATTACK_SPEED_MULT * (base.cooldownMult || 1);
    this.amount = 0; // Duplicator bonus
    this.weapons = [];

    // Visual
    this.color = charConfig?.color || PLAYER.COLOR;
    this.pulseTime = 0;
    
    // Dash
    this.isDashing = false;
    this.dashTime = 0;
    this.dashDuration = 0.2;
    this.dashCooldown = 0;
    this.dashCooldownMax = 3.0;
    this.dashSpeedMult = 3.0;
  }

  update(deltaTime, movement, worldWidth, worldHeight) {
    const { vx, vy } = movement;

    if (vx !== 0 || vy !== 0) {
      this.facingAngle = Math.atan2(vy, vx);
    }

    // Dash Logic
    if (this.isDashing) {
      this.dashTime -= deltaTime;
      if (this.dashTime <= 0) {
        this.isDashing = false;
        this.invulnerable = false; // End invuln
        this.invulnerableTime = 0;
      }
    } else {
      if (this.dashCooldown > 0) this.dashCooldown -= deltaTime;
    }

    if (vx !== 0 || vy !== 0) {
      this.facingAngle = Math.atan2(vy, vx);
    }

    let currentSpeed = this.speed;
    if (this.isDashing) currentSpeed *= this.dashSpeedMult;

    const effectiveSpeed = Math.min(currentSpeed, PLAYER.MAX_SPEED * (this.isDashing ? 3 : 1));
    this.x += vx * effectiveSpeed * deltaTime;
    this.y += vy * effectiveSpeed * deltaTime;

    // Keep in bounds
    this.x = clamp(this.x, this.radius, worldWidth - this.radius);
    this.y = clamp(this.y, this.radius, worldHeight - this.radius);

    // HP Regen
    if (this.hpRegen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * deltaTime);
    }

    // Invulnerability timer
    if (this.invulnerable) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }

    this.pulseTime += deltaTime;

    // Ultimate timer
    if (this.ultimateActive) {
      this.ultimateTimer -= deltaTime;
      if (this.ultimateTimer <= 0) {
        this.ultimateActive = false;
      }
    }
  }

  addUltimateCharge(amount) {
    if (this.ultimateActive) return;
    this.ultimateCharge = Math.min(this.ultimateMax, this.ultimateCharge + amount);
  }

  canUseUltimate() {
    return this.ultimateCharge >= this.ultimateMax && !this.ultimateActive;
  }

  activateUltimate() {
    this.ultimateCharge = 0;
    this.ultimateActive = true;
    this.ultimateTimer = 0.5; // brief invuln during ultimate
    this.invulnerable = true;
    this.invulnerableTime = 0.5;
  }

  tryDash() {
    if (this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTime = this.dashDuration;
      this.dashCooldown = this.dashCooldownMax;
      this.invulnerable = true;
      this.invulnerableTime = this.dashDuration; // Invuln during dash
      return true;
    }
    return false;
  }

  takeDamage(damage) {
    if (this.invulnerable) return;

    const armorReduction = this.armor / (this.armor + 100);
    const finalDamage = damage * (1 - armorReduction);

    this.hp = Math.max(0, this.hp - finalDamage);
    this.invulnerable = true;
    this.invulnerableTime = PLAYER.INVULN_DURATION;
  }

  gainXP(amount) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpRequired) {
      this.xp -= this.xpRequired;
      this.level++;
      this.xpRequired = Math.floor(
        XP_FORMULA.BASE * Math.pow(this.level, XP_FORMULA.EXPONENT) + (this.level * XP_FORMULA.LINEAR)
      );
      leveled = true;
    }
    return leveled;
  }

  applyStatUpgrade(stat, value) {
    switch (stat) {
      case 'maxHp':
        this.maxHp += value;
        this.hp = Math.min(this.maxHp, this.hp + value);
        break;
      case 'damage':
        this.damageMultiplier *= value;
        break;
      case 'attackSpeed':
        this.attackSpeedMultiplier *= value;
        break;
      case 'speed':
        this.speed *= value;
        break;
      case 'armor':
        this.armor += value;
        break;
      case 'hpRegen':
        this.hpRegen += value;
        break;
      case 'pickupRange':
        this.pickupRange *= value;
        break;
    }
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const r = this.radius;
    const t = this.pulseTime;
    const facing = this.facingAngle;
    const facingX = Math.cos(facing);
    const facingY = Math.sin(facing);

    ctx.save();

    // Invulnerability flash
    if (this.invulnerable && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // === MAGIC AURA (ground circle) ===
    const auraR = r * 2.2 + Math.sin(t * 2) * 3;
    const aura = ctx.createRadialGradient(sx, sy + r * 0.3, r * 0.3, sx, sy + r * 0.3, auraR);
    aura.addColorStop(0, 'rgba(0, 217, 255, 0.15)');
    aura.addColorStop(0.6, 'rgba(100, 0, 255, 0.08)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(sx, sy + r * 0.3, auraR, auraR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // === CAPE / CLOAK (behind body) ===
    const capeOffX = -facingX * r * 0.6;
    const capeOffY = -facingY * r * 0.6;
    const capeWave = Math.sin(t * 4) * 2;

    ctx.fillStyle = '#1a0a3e';
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.5, sy - r * 0.2);
    ctx.quadraticCurveTo(sx + capeOffX + capeWave, sy + r * 0.8 + capeOffY, sx - r * 0.7, sy + r * 1.3 + capeWave);
    ctx.lineTo(sx + r * 0.7, sy + r * 1.3 - capeWave);
    ctx.quadraticCurveTo(sx + capeOffX - capeWave, sy + r * 0.8 + capeOffY, sx + r * 0.5, sy - r * 0.2);
    ctx.closePath();
    ctx.fill();

    // Cape edge highlight
    ctx.strokeStyle = '#4400AA';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // === BODY (torso) ===
    const bodyGrad = ctx.createLinearGradient(sx - r * 0.4, sy - r * 0.3, sx + r * 0.4, sy + r * 0.6);
    bodyGrad.addColorStop(0, '#2a1a5e');
    bodyGrad.addColorStop(0.5, '#3d2a7a');
    bodyGrad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.45, sy - r * 0.3);
    ctx.lineTo(sx - r * 0.5, sy + r * 0.6);
    ctx.quadraticCurveTo(sx, sy + r * 0.75, sx + r * 0.5, sy + r * 0.6);
    ctx.lineTo(sx + r * 0.45, sy - r * 0.3);
    ctx.closePath();
    ctx.fill();

    // Robe trim
    ctx.strokeStyle = '#00D9FF';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Belt
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(sx - r * 0.45, sy + r * 0.15, r * 0.9, r * 0.12);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sx, sy + r * 0.21, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // === HEAD ===
    const headY = sy - r * 0.55;
    // Hood
    const hoodGrad = ctx.createLinearGradient(sx, headY - r * 0.5, sx, headY + r * 0.3);
    hoodGrad.addColorStop(0, '#2a1a5e');
    hoodGrad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = hoodGrad;
    ctx.beginPath();
    ctx.moveTo(sx - r * 0.55, headY + r * 0.15);
    ctx.quadraticCurveTo(sx - r * 0.6, headY - r * 0.35, sx, headY - r * 0.5);
    ctx.quadraticCurveTo(sx + r * 0.6, headY - r * 0.35, sx + r * 0.55, headY + r * 0.15);
    ctx.quadraticCurveTo(sx, headY + r * 0.3, sx - r * 0.55, headY + r * 0.15);
    ctx.fill();
    ctx.strokeStyle = '#4400AA';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Face (shadow)
    ctx.fillStyle = '#0a0515';
    ctx.beginPath();
    ctx.ellipse(sx, headY + r * 0.04, r * 0.32, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    const eyeGlow = 0.7 + Math.sin(t * 5) * 0.3;
    const eyeSpacing = r * 0.14;
    // Left eye
    ctx.fillStyle = `rgba(0, 217, 255, ${eyeGlow})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00D9FF';
    ctx.beginPath();
    ctx.ellipse(sx - eyeSpacing, headY + r * 0.02, r * 0.08, r * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(sx + eyeSpacing, headY + r * 0.02, r * 0.08, r * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // === STAFF (in facing direction) ===
    const staffBaseX = sx + facingX * r * 0.5;
    const staffBaseY = sy + facingY * r * 0.5 - r * 0.2;
    const staffTipX = sx + facingX * r * 1.6;
    const staffTipY = sy + facingY * r * 1.6 - r * 0.7;

    // Staff shaft
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(staffBaseX, staffBaseY);
    ctx.lineTo(staffTipX, staffTipY);
    ctx.stroke();

    // Staff crystal (orb)
    const orbPulse = 0.8 + Math.sin(t * 6) * 0.2;
    const orbR = r * 0.2 * orbPulse;

    // Orb glow
    // Orb glow
    if (Number.isFinite(staffTipX) && Number.isFinite(staffTipY) && Number.isFinite(orbR) && orbR > 0) {
      try {
        const orbGlow = ctx.createRadialGradient(staffTipX, staffTipY, 0, staffTipX, staffTipY, orbR * 4);
        orbGlow.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
        orbGlow.addColorStop(0.5, 'rgba(100, 0, 255, 0.15)');
        orbGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGlow;
        ctx.beginPath();
        ctx.arc(staffTipX, staffTipY, orbR * 4, 0, Math.PI * 2);
        ctx.fill();
      } catch (e) {
        // Fallback or ignore
      }
    }

    // Orb body
    if (Number.isFinite(staffTipX) && Number.isFinite(staffTipY) && Number.isFinite(orbR) && orbR > 0) {
      try {
        const orbGrd = ctx.createRadialGradient(staffTipX - 1, staffTipY - 1, 0, staffTipX, staffTipY, orbR);
        orbGrd.addColorStop(0, '#FFFFFF');
        orbGrd.addColorStop(0.3, '#80EEFF');
        orbGrd.addColorStop(1, '#0066CC');
        ctx.fillStyle = orbGrd;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00D9FF';
        ctx.beginPath();
        ctx.arc(staffTipX, staffTipY, orbR, 0, Math.PI * 2);
        ctx.fill();
      } catch (e) {
        // Fallback
      }
    }
    ctx.shadowBlur = 0;

    // === ENERGY PARTICLES floating around ===
    for (let i = 0; i < 4; i++) {
      const angle = t * 2 + (Math.PI * 2 / 4) * i;
      const dist = r * 1.4 + Math.sin(t * 3 + i) * r * 0.3;
      const px = sx + Math.cos(angle) * dist;
      const py = sy + Math.sin(angle) * dist * 0.6 - r * 0.2;
      const alpha = 0.3 + Math.sin(t * 4 + i * 2) * 0.2;
      ctx.fillStyle = `rgba(0, 217, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
