import { randomRange } from '../../utils/math.js';

class Particle {
  constructor(x, y, vx, vy, color, life, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.active = true;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.lightningChains = [];
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.lightningChains.length - 1; i >= 0; i--) {
      this.lightningChains[i].life -= deltaTime;
      if (this.lightningChains[i].life <= 0) {
        this.lightningChains.splice(i, 1);
      }
    }
  }

  createParticle(x, y, color, vx, vy, life = 0.5, size = 3) {
    this.particles.push(new Particle(x, y, vx, vy, color, life, size));
  }

  createExplosion(x, y, color, radius = 30) {
    const count = Math.floor(radius / 3) + 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(50, 200);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        randomRange(0.3, 0.8),
        randomRange(2, 6)
      ));
    }
  }

  createHitEffect(x, y, color) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(30, 100);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        randomRange(0.15, 0.35),
        randomRange(2, 4)
      ));
    }
  }

  createDeathEffect(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(60, 180);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        randomRange(0.3, 0.7),
        randomRange(3, 7)
      ));
    }
  }

  createLightningChain(from, to) {
    this.lightningChains.push({
      x1: from.x, y1: from.y,
      x2: to.x, y2: to.y,
      life: 0.15,
      maxLife: 0.15,
    });
  }

  render(ctx, camera) {
    // Particles
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Lightning chains
    for (const chain of this.lightningChains) {
      const alpha = chain.life / chain.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#88CCFF';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#44AAFF';

      const sx1 = chain.x1 - camera.x;
      const sy1 = chain.y1 - camera.y;
      const sx2 = chain.x2 - camera.x;
      const sy2 = chain.y2 - camera.y;

      // Jagged line
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);

      const segments = 5;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const mx = sx1 + (sx2 - sx1) * t + randomRange(-15, 15);
        const my = sy1 + (sy2 - sy1) * t + randomRange(-15, 15);
        ctx.lineTo(mx, my);
      }

      ctx.lineTo(sx2, sy2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
