export class TreasureChest {
  constructor(x, y, gameTime) {
    this.x = x;
    this.y = y;
    this.type = 'chest';
    this.spawnTime = gameTime;
    this.wobbleTime = 0;
    this.collected = false;
    this.radius = 20;
    this.isEvolved = false; // logic handled by GameEngine
  }

  update(deltaTime, player) {
    this.wobbleTime += deltaTime;
    
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.radius + player.radius) {
      this.collected = true;
      return true; // collect signal
    }
    return false;
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const t = this.wobbleTime;
    
    const bounce = Math.sin(t * 4) * 5;
    const glowScale = 1 + Math.sin(t * 3) * 0.2;

    ctx.save();
    
    // Glow
    const gradient = ctx.createRadialGradient(sx, sy, 10, sx, sy, 40 * glowScale);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, 40 * glowScale, 0, Math.PI * 2);
    ctx.fill();

    // Chest box
    ctx.translate(sx, sy + bounce);
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    // Base
    ctx.fillRect(-15, -10, 30, 20);
    ctx.strokeRect(-15, -10, 30, 20);
    
    // Lid
    ctx.beginPath();
    ctx.arc(0, -10, 15, Math.PI, 0);
    ctx.lineTo(15, -10);
    ctx.lineTo(-15, -10);
    ctx.fill();
    ctx.stroke();

    // Lock
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
