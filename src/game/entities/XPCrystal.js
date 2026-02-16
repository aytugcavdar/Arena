import { distance, lerp } from '../../utils/math.js';

export class XPCrystal {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.radius = Math.max(5, Math.min(15, 5 + value * 0.5));
    this.collected = false;
    this.lifetime = 30;
    this.bobTime = Math.random() * Math.PI * 2;
    this.attracted = false;

    // Color based on value
    if (value >= 20) {
      this.color = '#FF4500';
      this.glowColor = 'rgba(255, 69, 0, 0.4)';
    } else if (value >= 5) {
      this.color = '#FFD700';
      this.glowColor = 'rgba(255, 215, 0, 0.4)';
    } else {
      this.color = '#7CFC00';
      this.glowColor = 'rgba(124, 252, 0, 0.4)';
    }
  }

  update(deltaTime, player) {
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.collected = true;
      return;
    }

    this.bobTime += deltaTime * 3;
    const dist = distance(this, player);

    if (dist < player.pickupRange) {
      this.attracted = true;
      const attractionSpeed = lerp(200, 600, 1 - (dist / player.pickupRange));
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0) {
        this.x += (dx / d) * attractionSpeed * deltaTime;
        this.y += (dy / d) * attractionSpeed * deltaTime;
      }

      if (dist < player.radius + this.radius) {
        this.collected = true;
      }
    }
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y + Math.sin(this.bobTime) * 3;

    ctx.save();

    // Fade when about to expire
    if (this.lifetime < 5) {
      ctx.globalAlpha = this.lifetime / 5;
    }

    // Glow
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius * 3);
    glow.addColorStop(0, this.glowColor);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Crystal body - diamond shape
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(sx, sy - this.radius);
    ctx.lineTo(sx + this.radius * 0.6, sy);
    ctx.lineTo(sx, sy + this.radius);
    ctx.lineTo(sx - this.radius * 0.6, sy);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(sx, sy - this.radius * 0.6);
    ctx.lineTo(sx + this.radius * 0.2, sy - this.radius * 0.1);
    ctx.lineTo(sx - this.radius * 0.2, sy - this.radius * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
