export class CollisionManager {
  constructor(gameEngine) {
    this.game = gameEngine;
  }

  update() {
    this.checkPlayerEnemyCollisions();
    this.checkProjectileEnemyCollisions();
    this.checkPlayerXPCollisions();
  }

  checkPlayerEnemyCollisions() {
    const player = this.game.player;
    for (const enemy of this.game.enemies) {
      if (this.circleCollision(player, enemy)) {
        if (enemy.canDamagePlayer()) {
          enemy.damagePlayer(player);
          this.game.onPlayerDamaged();
        }
      }
    }
  }

  checkProjectileEnemyCollisions() {
    for (let i = this.game.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.game.projectiles[i];

      for (let j = this.game.enemies.length - 1; j >= 0; j--) {
        const enemy = this.game.enemies[j];

        if (this.circleCollision(projectile, enemy)) {
          if (projectile.onHit(enemy)) {
            const finalDamage = projectile.damage * this.game.player.damageMultiplier;
            enemy.takeDamage(finalDamage);

            // Create hit particles
            this.game.particleSystem.createHitEffect(enemy.x, enemy.y, projectile.color);

            // Notify engine for damage numbers
            this.game.onEnemyHit(enemy, finalDamage);

            // AOE damage
            if (projectile.aoeRadius > 0 && projectile.shouldRemove) {
              this.applyAOE(projectile, enemy);
            }
          }

          if (projectile.shouldRemove) break;
        }
      }
    }
  }

  applyAOE(projectile, hitEnemy) {
    const aoeDamage = projectile.damage * projectile.aoeDamageMult * this.game.player.damageMultiplier;
    for (const enemy of this.game.enemies) {
      if (enemy === hitEnemy || enemy.isDead) continue;
      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      if (dx * dx + dy * dy < projectile.aoeRadius * projectile.aoeRadius) {
        enemy.takeDamage(aoeDamage);
      }
    }
    this.game.particleSystem.createExplosion(projectile.x, projectile.y, '#FF6600', projectile.aoeRadius);
  }

  checkPlayerXPCollisions() {
    // Handled in XPCrystal.update
  }

  circleCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distSq = dx * dx + dy * dy;
    const minDist = a.radius + b.radius;
    return distSq < minDist * minDist;
  }
}
