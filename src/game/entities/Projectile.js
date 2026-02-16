export class Projectile {
  constructor(x, y, vx, vy, damage, speed, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.speed = speed;
    this.radius = config.radius || 8;
    this.color = config.color || '#FF6600';
    this.trailColor = config.trailColor || '#FF440060';
    this.lifetime = config.lifetime || 3;
    this.shouldRemove = false;
    this.piercing = config.piercing || false;
    this.hitEnemies = new Set();

    // AOE
    this.aoeRadius = config.aoeRadius || 0;
    this.aoeDamageMult = config.aoeDamageMult || 0.5;

    // Slow
    this.slowAmount = config.slowAmount || 0;
    this.freezeDuration = config.freezeDuration || 0;

    // Burn
    this.burnDamage = config.burnDamage || 0;
    this.burnDuration = config.burnDuration || 0;

    // Trail
    this.trail = [];
    this.maxTrail = 6;

    // Boomerang
    this.isBoomerang = config.isBoomerang || false;
    this.returning = false;
    this.maxDist = config.maxDist || 0;
    this.startX = x;
    this.startY = y;
    this.homing = config.homing || false;
    this.ownerRef = config.ownerRef || null;
    this.rotation = 0;
  }

  update(deltaTime) {
    // Trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();

    if (this.isBoomerang) {
      this.updateBoomerang(deltaTime);
    } else {
      this.x += this.vx * this.speed * deltaTime;
      this.y += this.vy * this.speed * deltaTime;
    }

    this.lifetime -= deltaTime;
    this.rotation += deltaTime * 10;
    if (this.lifetime <= 0) this.shouldRemove = true;
  }

  updateBoomerang(deltaTime) {
    if (!this.returning) {
      this.x += this.vx * this.speed * deltaTime;
      this.y += this.vy * this.speed * deltaTime;

      const dx = this.x - this.startX;
      const dy = this.y - this.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= this.maxDist) {
        this.returning = true;
        this.hitEnemies.clear();
      }
    } else {
      if (this.ownerRef) {
        const dx = this.ownerRef.x - this.x;
        const dy = this.ownerRef.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          this.shouldRemove = true;
          return;
        }
        const spd = this.speed * 1.2;
        this.x += (dx / dist) * spd * deltaTime;
        this.y += (dy / dist) * spd * deltaTime;
      } else {
        this.shouldRemove = true;
      }
    }
  }

  onHit(enemy) {
    if (this.hitEnemies.has(enemy)) return false;
    this.hitEnemies.add(enemy);

    if (this.slowAmount > 0) {
      enemy.applySlow(this.slowAmount, 2000);
    }
    if (this.freezeDuration > 0) {
      enemy.applyFreeze(this.freezeDuration);
    }
    if (this.burnDamage > 0) {
      enemy.applyBurn(this.burnDamage, this.burnDuration);
    }
    if (!this.piercing && !this.isBoomerang) {
      this.shouldRemove = true;
    }
    return true;
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Trail
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i / this.trail.length) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.trailColor;
      const r = this.radius * (i / this.trail.length) * 0.7;
      ctx.beginPath();
      ctx.arc(t.x - camera.x, t.y - camera.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Projectile body
    ctx.save();
    if (this.isBoomerang) {
      ctx.translate(sx, sy);
      ctx.rotate(this.rotation);

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.6, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.arc(this.radius * 0.6, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Glow
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius * 2);
      glow.addColorStop(0, this.color + '80');
      glow.addColorStop(1, this.color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(sx - this.radius * 0.2, sy - this.radius * 0.2, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
