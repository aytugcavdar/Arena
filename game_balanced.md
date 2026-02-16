# GAME BALANCE - MATEMATİKSEL FORMÜLLER VE DENGELEME

## CORE BALANCE FORMÜLLERI

### 1. PLAYER DAMAGE CALCULATION

```javascript
// Final weapon damage formula
finalDamage = weaponBaseDamage * playerDamageMultiplier * weaponLevelMultiplier

// Example
// Fireball Level 3: base 50 damage
// Player has +30% damage boost
// finalDamage = 50 * 1.3 * 1.0 = 65 damage

// Damage Multiplier Sources
playerDamageMultiplier = 1.0
  + (damageUpgradeCount * 0.15)  // Each upgrade = +15%
  + (level * 0.02)                // +2% per player level
  + bonuses                        // Items, special effects

// Critical Hit (Optional)
if (random() < critChance) {
  finalDamage *= critMultiplier  // 2.0 default
}
```

### 2. PLAYER HEALTH CALCULATION

```javascript
// Max HP formula
maxHP = baseHP * (1 + (hpUpgradeCount * 0.20))

// Base HP: 100
// With 5 HP upgrades: 100 * (1 + 1.0) = 200 HP

// HP Regeneration
hpRegenPerSecond = baseRegen + (regenUpgradeCount * 0.5)
// Base: 0/s
// With 4 regen upgrades: 0 + 2.0 = 2 HP/s

// Regen tick
every 100ms:
  player.hp = min(player.hp + (hpRegenPerSecond * 0.1), maxHP)
```

### 3. ENEMY DAMAGE TO PLAYER

```javascript
// Enemy contact damage formula
damageToPlayer = enemyBaseDamage * difficultyMultiplier * (1 - armorReduction)

// Armor reduction calculation
armorReduction = playerArmor / (playerArmor + 100)
// 0 armor = 0% reduction
// 50 armor = 33% reduction
// 100 armor = 50% reduction
// 200 armor = 66% reduction

// Example
// Tank hits player (base 35 damage)
// Difficulty multiplier: 1.3 (at 10 min)
// Player has 75 armor
armorReduction = 75 / (75 + 100) = 0.428 = 42.8%
damageToPlayer = 35 * 1.3 * (1 - 0.428) = 26 damage

// Invulnerability frames
player.invulnerable = true
player.invulnerableDuration = 500ms  // Can't take damage for 0.5s
```

### 4. XP AND LEVELING SYSTEM

```javascript
// XP required for next level (exponential growth)
xpRequired(level) = Math.floor(
  10 * Math.pow(level, 1.8) + (level * 5)
)

// Level progression table
Level 1 → 2:   15 XP
Level 2 → 3:   35 XP
Level 3 → 4:   62 XP
Level 4 → 5:   97 XP
Level 5 → 6:   140 XP
Level 10 → 11: 518 XP
Level 20 → 21: 2,840 XP
Level 50 → 51: 33,255 XP

// XP gain from enemies
baseXP = {
  zombie: 2,
  runner: 4,
  tank: 10,
  bat: 1,
  elite: 30,
  boss: 100 * bossLevel
}

// XP multiplier (optional feature)
xpGained = baseXP * (1 + xpBonusMultiplier)
// With +25% XP bonus: 2 * 1.25 = 2.5 XP (rounds to 3)
```

### 5. WEAPON COOLDOWN AND ATTACK SPEED

```javascript
// Effective cooldown calculation
effectiveCooldown = baseCooldown / (1 + attackSpeedBonus)

// Attack speed bonus calculation
attackSpeedBonus = (attackSpeedUpgradeCount * 0.10)
// Each upgrade = +10% attack speed

// Example
// Lightning bolt base cooldown: 1200ms
// Player has +30% attack speed
effectiveCooldown = 1200 / (1 + 0.30) = 923ms

// Maximum attack speed cap (optional)
maxAttackSpeedBonus = 2.0  // 200% = 3x attacks per second
effectiveCooldown = max(baseCooldown / 3, minCooldown)
// Min cooldown: 200ms (prevents infinite attacks)
```

### 6. MOVEMENT SPEED

```javascript
// Player speed calculation
playerSpeed = baseSpeed * (1 + speedBonusMultiplier)

// Base speed: 150 px/s
// With +40% speed: 150 * 1.4 = 210 px/s

// Speed bonus sources
speedBonusMultiplier = (speedUpgradeCount * 0.10)
  + itemBonuses
  + temporaryEffects

// Diagonal movement normalization
if (movingDiagonally) {
  // Prevent 1.414x speed when moving diagonally
  velocity.normalize()
  velocity *= playerSpeed
}

// Speed cap
maxSpeed = 400 px/s
playerSpeed = min(playerSpeed, maxSpeed)
```

### 7. PICKUP RANGE (MAGNETISM)

```javascript
// Pickup range calculation
pickupRange = baseRange * (1 + rangeBonusMultiplier)

// Base range: 80px
// With +50% range: 80 * 1.5 = 120px

// Range bonus sources
rangeBonusMultiplier = (rangeUpgradeCount * 0.15)
  + magnetItemBonus  // +100% if has Magnet item

// XP attraction logic
distanceToPlayer = distance(xp, player)
if (distanceToPlayer < pickupRange) {
  // Pull XP towards player
  direction = normalize(player.pos - xp.pos)
  xp.velocity = direction * attractionSpeed
  
  // Attraction speed (faster as closer)
  attractionSpeed = lerp(200, 600, 1 - (distanceToPlayer / pickupRange))
}
```

---

## ENEMY SCALING FORMULAS

### 8. TIME-BASED DIFFICULTY SCALING

```javascript
// Game time in seconds
gameTime = currentTime - startTime

// HP scaling
enemyHP(baseHP, gameTime) = baseHP * (1 + (gameTime / 120) * 0.5)

// Damage scaling
enemyDamage(baseDamage, gameTime) = baseDamage * (1 + (gameTime / 180) * 0.4)

// Spawn rate scaling
spawnRate(baseRate, gameTime) = baseRate * (1 + (gameTime / 90) * 0.3)

// Examples at different times
Time 0:00  → 1.00x HP, 1.00x Damage, 1.00x Spawn
Time 2:00  → 1.50x HP, 1.27x Damage, 1.40x Spawn
Time 5:00  → 2.25x HP, 1.67x Damage, 2.00x Spawn
Time 10:00 → 3.50x HP, 2.33x Damage, 3.33x Spawn
Time 20:00 → 6.00x HP, 3.67x Damage, 6.67x Spawn

// Difficulty curve graph
/*
HP Multiplier
6x |                              *
5x |                         *
4x |                    *
3x |             *
2x |        *
1x |   *
   +---+----+----+----+----+----+
   0  2min 5min 10min 15min 20min
*/
```

### 9. ENEMY SPAWN WEIGHTS

```javascript
// Spawn probability weights
function getSpawnWeights(gameTime) {
  const minutes = gameTime / 60;
  
  return {
    zombie: {
      weight: 50,  // Always high
      enabled: true
    },
    runner: {
      weight: minutes > 2 ? 25 : 0,
      enabled: minutes > 2
    },
    tank: {
      weight: minutes > 5 ? 15 : 0,
      enabled: minutes > 5
    },
    bat: {
      weight: minutes > 3 ? 20 : 0,
      enabled: minutes > 3
    },
    elite: {
      weight: minutes > 10 ? 5 : 0,
      enabled: minutes > 10
    }
  };
}

// Weighted random selection
function selectEnemyType(weights) {
  const totalWeight = Object.values(weights)
    .filter(w => w.enabled)
    .reduce((sum, w) => sum + w.weight, 0);
  
  let random = Math.random() * totalWeight;
  
  for (const [type, data] of Object.entries(weights)) {
    if (!data.enabled) continue;
    random -= data.weight;
    if (random <= 0) return type;
  }
}

// At 8 minutes:
// Zombie: 50 / 115 = 43.5% chance
// Runner: 25 / 115 = 21.7% chance
// Tank: 15 / 115 = 13.0% chance
// Bat: 20 / 115 = 17.4% chance
// Elite: 5 / 115 = 4.4% chance
```

---

## WEAPON BALANCE

### 10. DPS (DAMAGE PER SECOND) CALCULATIONS

```javascript
// DPS formula
DPS = (damage * projectileCount) / (cooldown / 1000)

// Weapon DPS comparison (Level 5, no upgrades)
// Fireball
DPS = (100 * 5) / (0.7) = 714 DPS

// Lightning
DPS = (120 * 1) / (1.2) = 100 DPS (but chains to 10 enemies!)
Effective DPS vs 10 enemies = 100 * 7 = 700 DPS (with damage falloff)

// Magic Orbit
DPS = (70 * 6) / (0.2) = 2100 DPS (continuous)

// Boomerang
DPS = (110 * 4 * 2) / (1.0) = 880 DPS (hits twice)

// Ice Shard
DPS = (90 * 20) / (1.5) = 1200 DPS

// Holy Beam
DPS = (125 * ticks) / (2.0) = 625-1250 DPS (vs 1-many enemies)

// DPS Tier List
S-Tier: Magic Orbit (2100 DPS)
A-Tier: Ice Shard (1200 DPS), Boomerang (880 DPS)
B-Tier: Fireball (714 DPS), Lightning (700 DPS AoE)
C-Tier: Holy Beam (625 DPS single target)
```

### 11. WEAPON LEVEL SCALING

```javascript
// Damage scaling per level
weaponDamage(level) = baseDamage * Math.pow(1.4, level - 1)

// Example: Fireball
Level 1: 25 * 1.0 = 25 damage
Level 2: 25 * 1.4 = 35 damage
Level 3: 25 * 1.96 = 49 damage
Level 4: 25 * 2.74 = 68 damage
Level 5: 25 * 3.84 = 96 damage

// Cooldown reduction per level
weaponCooldown(level) = baseCooldown * Math.pow(0.9, level - 1)

// Example: Ice Shard
Level 1: 2500ms
Level 2: 2250ms (-10%)
Level 3: 2025ms (-19%)
Level 4: 1822ms (-27%)
Level 5: 1640ms (-34%)
```

---

## PLAYER PROGRESSION

### 12. LEVEL-UP UPGRADE PROBABILITY

```javascript
// Upgrade selection algorithm
function generateUpgradeOptions(player, availableWeapons) {
  const options = [];
  
  // Calculate probabilities
  const hasAllWeapons = player.weapons.length >= 6;
  const hasMaxLevelWeapons = player.weapons.some(w => w.level >= 5);
  
  // Option 1: New weapon
  if (!hasAllWeapons && Math.random() < 0.4) {
    const newWeapon = randomFrom(availableWeapons);
    options.push({ type: 'weapon', weapon: newWeapon, level: 1 });
  }
  
  // Option 2: Upgrade existing weapon
  if (player.weapons.length > 0 && Math.random() < 0.4) {
    const upgradableWeapons = player.weapons.filter(w => w.level < 5);
    if (upgradableWeapons.length > 0) {
      const weapon = randomFrom(upgradableWeapons);
      options.push({ 
        type: 'upgrade', 
        weapon: weapon.name, 
        level: weapon.level + 1 
      });
    }
  }
  
  // Fill remaining slots with stat upgrades
  while (options.length < 3) {
    options.push(randomStatUpgrade());
  }
  
  return options;
}

// Stat upgrade weights
const STAT_WEIGHTS = {
  maxHP: 20,
  damage: 15,
  attackSpeed: 15,
  moveSpeed: 12,
  armor: 10,
  hpRegen: 8,
  pickupRange: 10,
  critical: 5,
  special: 5
};
```

### 13. STAT UPGRADE SCALING

```javascript
// Each upgrade provides diminishing returns (optional)
// Linear scaling
upgrade(stat, count) = baseValue + (upgradeValue * count)

// Example: Max HP
maxHP = 100 + (20 * hpUpgradeCount)
// 1 upgrade: 120 HP
// 5 upgrades: 200 HP
// 10 upgrades: 300 HP

// Multiplicative scaling (preferred for most stats)
upgrade(stat, count) = baseValue * Math.pow(multiplier, count)

// Example: Damage
damageMultiplier = Math.pow(1.15, damageUpgradeCount)
// 1 upgrade: 1.15x damage
// 5 upgrades: 2.01x damage
// 10 upgrades: 4.05x damage
```

---

## SURVIVAL TIME METRICS

### 14. EXPECTED SURVIVAL TIME

```javascript
// Player power calculation
playerPower = (maxHP / 100) 
  * damageMultiplier 
  * (1 + attackSpeedBonus)
  * (1 / (1 - armorReduction))
  * weaponCount

// Enemy pressure (enemies per second killed required)
enemyPressure(time) = spawnRate(time) * avgEnemyHP(time) / playerDPS

// Survival probability
survivalChance = playerPower / enemyPressure
// > 1.0 = sustainable
// < 1.0 = will eventually die

// Example
// At 10 minutes:
// Player has: 200 HP, 2.0x damage, 3 weapons, 30 armor
playerPower = 2 * 2.0 * 1.3 * 1.43 * 3 = 22.3

// Enemies: 4/s spawn, 175 HP avg
// Player DPS: 3000
enemyPressure = 4 * 175 / 3000 = 0.23

survivalChance = 22.3 / 0.23 = 97x (very safe)
```

### 15. DIFFICULTY ZONES

```javascript
// Difficulty rating by time
function getDifficultyRating(gameTime) {
  const minutes = gameTime / 60;
  
  if (minutes < 5) return "Easy";
  if (minutes < 10) return "Medium";
  if (minutes < 15) return "Hard";
  if (minutes < 20) return "Very Hard";
  return "Extreme";
}

// Expected player stats at each zone
const EXPECTED_STATS = {
  5: {  // 5 minutes
    level: 8-12,
    weapons: 2-3,
    hp: 120-150,
    damageBonus: 1.3x
  },
  10: {  // 10 minutes
    level: 15-20,
    weapons: 3-4,
    hp: 180-220,
    damageBonus: 1.8x
  },
  15: {  // 15 minutes
    level: 25-30,
    weapons: 4-5 (some Level 4-5),
    hp: 250-300,
    damageBonus: 2.5x
  },
  20: {  // 20 minutes
    level: 35-45,
    weapons: 5-6 (most Level 5),
    hp: 300-400,
    damageBonus: 3.5x
  }
};
```

---

## COLLISION DETECTION

### 16. COLLISION FORMULAS

```javascript
// Circle-Circle collision (most common)
function checkCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = a.radius + b.radius;
  
  return distance < minDistance;
}

// Optimized (avoid sqrt)
function checkCollisionFast(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distanceSquared = dx * dx + dy * dy;
  const minDistance = a.radius + b.radius;
  const minDistanceSquared = minDistance * minDistance;
  
  return distanceSquared < minDistanceSquared;
}

// Spatial partitioning (grid-based)
// Divide screen into grid cells
cellSize = 100px
cell = {
  x: Math.floor(entity.x / cellSize),
  y: Math.floor(entity.y / cellSize)
}

// Only check collisions within same cell + adjacent cells
// Reduces checks from O(n²) to O(n)
```

---

## PERFORMANCE OPTIMIZATION

### 17. ENTITY POOLING

```javascript
// Object pool for projectiles
class ProjectilePool {
  constructor(size = 200) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createProjectile());
    }
    this.activeIndex = 0;
  }
  
  acquire() {
    if (this.activeIndex < this.pool.length) {
      const projectile = this.pool[this.activeIndex];
      this.activeIndex++;
      projectile.active = true;
      return projectile;
    }
    // Pool exhausted, create new
    return this.createProjectile();
  }
  
  release(projectile) {
    projectile.active = false;
    // Move to back of pool
    this.activeIndex--;
    [this.pool[this.activeIndex], projectile] = 
      [projectile, this.pool[this.activeIndex]];
  }
}
```

### 18. RENDER OPTIMIZATION

```javascript
// Only render entities within viewport + buffer
const RENDER_BUFFER = 100px;

function shouldRender(entity, camera) {
  return (
    entity.x > camera.x - RENDER_BUFFER &&
    entity.x < camera.x + camera.width + RENDER_BUFFER &&
    entity.y > camera.y - RENDER_BUFFER &&
    entity.y < camera.y + camera.height + RENDER_BUFFER
  );
}

// LOD (Level of Detail)
function getRenderQuality(entity, camera) {
  const distance = distanceToCamera(entity, camera);
  
  if (distance < 200) return "high";  // Full detail
  if (distance < 400) return "medium";  // Simplified
  return "low";  // Minimal/culled
}
```

---

## BALANCE TESTING METRICS

### 19. KEY PERFORMANCE INDICATORS

```javascript
// Track these during testing
const metrics = {
  // Survival metrics
  avgSurvivalTime: 0,
  deathRate: {
    "0-5min": 0,
    "5-10min": 0,
    "10-15min": 0,
    "15-20min": 0,
    "20+min": 0
  },
  
  // Kill metrics
  avgKillsPerMinute: 0,
  mostKilledEnemy: "",
  
  // Weapon metrics
  mostUsedWeapon: "",
  avgWeaponLevel: 0,
  weaponDPSContribution: {},
  
  // Upgrade metrics
  mostPickedUpgrade: "",
  avgLevelReached: 0,
  
  // Difficulty feedback
  playerFeedback: {
    tooEasy: 0,
    balanced: 0,
    tooHard: 0
  }
};

// Ideal balance targets
const BALANCE_TARGETS = {
  avgSurvivalTime: "12-15 minutes",
  deathRateAt10Min: "30-40%",
  avgKillsPerMinute: "20-40",
  playerSatisfaction: "> 70% balanced or tooHard"
};
```

---

## DIFFICULTY PRESETS (OPTIONAL)

```javascript
// Different difficulty modes
const DIFFICULTY_MODES = {
  EASY: {
    playerDamage: 1.5,
    playerHP: 1.5,
    enemyHP: 0.7,
    enemyDamage: 0.7,
    xpGain: 1.3
  },
  NORMAL: {
    playerDamage: 1.0,
    playerHP: 1.0,
    enemyHP: 1.0,
    enemyDamage: 1.0,
    xpGain: 1.0
  },
  HARD: {
    playerDamage: 0.8,
    playerHP: 0.8,
    enemyHP: 1.3,
    enemyDamage: 1.3,
    xpGain: 0.8
  },
  NIGHTMARE: {
    playerDamage: 0.6,
    playerHP: 0.6,
    enemyHP: 1.8,
    enemyDamage: 1.8,
    xpGain: 0.6,
    specialRules: {
      noHPRegen: true,
      bossesSummonMore: true
    }
  }
};
```

---

## FORMÜL ÖZET TABLOSU

| Sistem | Formül | Amaç |
|--------|--------|------|
| Player Damage | `base × multiplier × level` | Hasar hesaplama |
| Enemy HP | `base × (1 + time/120 × 0.5)` | Zorluk artışı |
| XP Required | `10 × level^1.8 + level×5` | Seviye ilerlemesi |
| Armor Reduction | `armor / (armor + 100)` | Hasar azaltma |
| DPS | `(dmg × count) / cooldown` | Silah gücü |
| Cooldown | `base / (1 + atkSpd)` | Ateş hızı |

---

## TESTING CHECKLIST

- [ ] 5 dakika survive edilebilir (90% players)
- [ ] 10 dakika challenging (50% players)
- [ ] 15 dakika hard (20% players)
- [ ] Player damage hissediliyor (enemies die fast enough)
- [ ] Enemy damage tehlikeli (health matters)
- [ ] Upgrades meaningful (fark hissediliyor)
- [ ] No infinite loop bugs
- [ ] Performance 60 FPS (200 enemies)
- [ ] Balance tests yapıldı

Bu formüllerle matematiksel olarak dengeli bir oyun elde edersin!