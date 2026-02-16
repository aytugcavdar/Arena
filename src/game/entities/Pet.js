export class Pet {
  constructor(player, type = 'dragon') {
    this.x = player.x;
    this.y = player.y;
    this.radius = 10;
    this.player = player;
    this.type = type;
    this.state = 'IDLE'; // IDLE, FETCH
    this.target = null;
    this.speed = 250;
    this.fetchRange = 300;
    this.collectRange = 20;
    
    // Visuals
    this.wingCycle = 0;
    this.color = type === 'dragon' ? '#FFA500' : '#00FF00';
  }

  update(deltaTime, xpCrystals) {
    this.wingCycle += deltaTime * 10;
    
    // State Machine
    if (this.state === 'IDLE') {
      // Follow player
      const dist = Math.hypot(this.player.x - this.x, this.player.y - this.y);
      if (dist > 60) {
        const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
        this.x += Math.cos(angle) * this.speed * deltaTime;
        this.y += Math.sin(angle) * this.speed * deltaTime;
      }

      // Look for XP
      let closest = null;
      let minDst = this.fetchRange;
      
      for (const xp of xpCrystals) {
        if (xp.collected) continue;
        const d = Math.hypot(xp.x - this.player.x, xp.y - this.player.y); // Distance from player logic? Or from pet?
        // Let's make pet fetch things near itself or near player to help
        const dPet = Math.hypot(xp.x - this.x, xp.y - this.y);
        
        if (dPet < minDst) {
          minDst = dPet;
          closest = xp;
        }
      }

      if (closest) {
        this.state = 'FETCH';
        this.target = closest;
      }

    } else if (this.state === 'FETCH') {
      if (!this.target || this.target.collected) {
        this.state = 'IDLE';
        this.target = null;
        return;
      }

      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.collectRange) {
        // Collect it (by magnetizing it to player instantly or marking collected)
        this.target.collected = true; // Mark as collected by pet logic handling in GameEngine usually better
        // For now, let's just cheat and say it's collected
         // But typically we want GameEngine to handle "collection" logic to grant XP. 
         // We can set a flag on the crystal that it is being magnetized to player
         this.target.magnetized = true; 
         this.state = 'IDLE';
         this.target = null;
      } else {
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * (this.speed * 1.5) * deltaTime;
        this.y += Math.sin(angle) * (this.speed * 1.5) * deltaTime;
      }
    }
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    
    // Facing
    if (this.player.x < this.x) ctx.scale(-1, 1);

    // Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    const wingY = Math.sin(this.wingCycle) * 5;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.lineTo(-15, -10 + wingY);
    ctx.lineTo(-5, 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(5, -2);
    ctx.lineTo(15, -10 + wingY);
    ctx.lineTo(5, 2);
    ctx.fill();

    ctx.restore();
  }
}
