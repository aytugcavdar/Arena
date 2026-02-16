# ENEMIES CONFIG - DÜŞMAN TİPLERİ VE SPAWN SİSTEMİ

## DÜŞMAN SİSTEMİ GENEL KURALLARI

### Temel Mekanikler
- Tüm düşmanlar player'a doğru hareket eder (AI)
- Player ile temas = damage dealt to player
- HP 0 olunca ölür ve XP düşürür
- Ekran dışından spawn olur (random edge point)

### Difficulty Scaling
- Zaman ilerledikçe düşman HP ve damage artar
- Spawn rate artar
- Yeni düşman tipleri unlock olur

---

## DÜŞMAN TİPİ #1: ZOMBIE

### Genel Bilgi
- **Rol:** Basic melee grunt
- **Spawn Time:** 0:00'dan itibaren
- **Tema:** Yavaş ama bol

### Stat Tablosu (Base)

| Attribute | Value |
|-----------|-------|
| HP | 50 |
| Damage | 10 |
| Speed | 60 px/s |
| Size | 25px radius |
| XP Drop | 2 |
| Contact Damage Cooldown | 1000ms |

### Time Scaling

| Game Time | HP Multiplier | Damage Multiplier | Spawn Rate |
|-----------|---------------|-------------------|------------|
| 0:00-2:00 | 1.0x | 1.0x | 1/s |
| 2:00-5:00 | 1.3x | 1.2x | 2/s |
| 5:00-10:00 | 1.7x | 1.5x | 3/s |
| 10:00+ | 2.2x | 2.0x | 4/s |

### AI Behavior
```javascript
// Simple chase
direction = normalize(player.pos - zombie.pos)
zombie.velocity = direction * zombie.speed

// No special abilities
// No attack patterns
// Just walk and damage on contact
```

### Görsel
- **Renk:** Yeşil (#4CAF50)
- **Shape:** Circle with darker outline
- **Animation:** Slow wobble (0.5 Hz)
- **Death:** Green puff particles

---

## DÜŞMAN TİPİ #2: FAST RUNNER

### Genel Bilgi
- **Rol:** Fast melee harasser
- **Spawn Time:** 2:00'dan itibaren
- **Tema:** Hızlı ve sinir bozucu

### Stat Tablosu (Base)

| Attribute | Value |
|-----------|-------|
| HP | 30 |
| Damage | 15 |
| Speed | 140 px/s |
| Size | 20px radius |
| XP Drop | 4 |
| Contact Damage Cooldown | 800ms |

### Time Scaling

| Game Time | HP Multiplier | Damage Multiplier | Spawn Rate |
|-----------|---------------|-------------------|------------|
| 2:00-5:00 | 1.0x | 1.0x | 0.5/s |
| 5:00-10:00 | 1.4x | 1.3x | 1/s |
| 10:00+ | 1.9x | 1.7x | 2/s |

### AI Behavior
```javascript
// Dash attack pattern
if (distanceToPlayer > 200) {
  // Normal chase
  moveTowardPlayer(speed)
} else if (distanceToPlayer < 200 && dashCooldown === 0) {
  // Dash attack
  dashSpeed = speed * 2
  dashDuration = 400ms
  dashCooldown = 3000ms
}
```

### Görsel
- **Renk:** Turuncu (#FF9800)
- **Shape:** Elongated oval (motion blur)
- **Animation:** Fast vibration
- **Trail:** Orange streak
- **Death:** Orange particles scatter

---

## DÜŞMAN TİPİ #3: TANK

### Genel Bilgi
- **Rol:** Heavy damage sponge
- **Spawn Time:** 5:00'dan itibaren
- **Tema:** Yavaş ama ölümcül

### Stat Tablosu (Base)

| Attribute | Value |
|-----------|-------|
| HP | 250 |
| Damage | 35 |
| Speed | 40 px/s |
| Size | 40px radius |
| XP Drop | 10 |
| Contact Damage Cooldown | 1500ms |

### Time Scaling

| Game Time | HP Multiplier | Damage Multiplier | Spawn Rate |
|-----------|---------------|-------------------|------------|
| 5:00-10:00 | 1.0x | 1.0x | 0.2/s |
| 10:00-15:00 | 1.5x | 1.3x | 0.4/s |
| 15:00+ | 2.0x | 1.6x | 0.6/s |

### AI Behavior
```javascript
// Slow but unstoppable
moveTowardPlayer(speed)

// Knockback resistant
onKnockback() {
  knockbackForce *= 0.3  // 70% resistant
}

// Armor
incomingDamage *= 0.85  // 15% damage reduction
```

### Görsel
- **Renk:** Kırmızı koyu (#F44336)
- **Shape:** Large circle with armor plates
- **Animation:** Slow stomp (screen shake on nearby)
- **Special:** Cracks appear as HP lowers
- **Death:** Big red explosion

---

## DÜŞMAN TİPİ #4: BAT (SWARM)

### Genel Bilgi
- **Rol:** Swarm enemy (groups)
- **Spawn Time:** 3:00'dan itibaren
- **Tema:** Çok sayıda, düşük HP

### Stat Tablosu (Base)

| Attribute | Value |
|-----------|-------|
| HP | 15 |
| Damage | 8 |
| Speed | 120 px/s |
| Size | 12px radius |
| XP Drop | 1 |
| Contact Damage Cooldown | 600ms |

### Spawn Behavior
```javascript
// Always spawns in groups
spawnCount = random(5, 12)
formation = "V" or "Cloud"

// Formation patterns
V_formation: {
  leader: center
  followers: 45° offset from leader
}

Cloud_formation: {
  random offset from center point
  radius: 80px
}
```

### Time Scaling

| Game Time | HP Multiplier | Spawn Rate | Group Size |
|-----------|---------------|------------|------------|
| 3:00-7:00 | 1.0x | 1 group/3s | 5-8 |
| 7:00-12:00 | 1.3x | 1 group/2s | 8-12 |
| 12:00+ | 1.6x | 1 group/1.5s | 10-15 |

### AI Behavior
```javascript
// Erratic movement
baseDirection = normalize(player.pos - bat.pos)
sineOffset = sin(time * 5) * 30px
bat.velocity = (baseDirection + sineOffset) * speed

// Avoidance
avoidOtherBats(radius: 20px)
```

### Görsel
- **Renk:** Mor (#9C27B0)
- **Shape:** Small with wing flap animation
- **Animation:** Wing flap (3 Hz)
- **Movement:** Sine wave pattern
- **Death:** Purple poof (small)

---

## DÜŞMAN TİPİ #5: ELITE MONSTER

### Genel Bilgi
- **Rol:** Mini-boss, rare spawn
- **Spawn Time:** 10:00'dan itibaren
- **Tema:** Güçlü, değerli

### Stat Tablosu (Base)

| Attribute | Value |
|-----------|-------|
| HP | 800 |
| Damage | 50 |
| Speed | 80 px/s |
| Size | 50px radius |
| XP Drop | 30 |
| Contact Damage Cooldown | 1000ms |

### Spawn Behavior
```javascript
// Rare spawn
spawnChance = 0.05  // 5% per spawn cycle
minTimeBetweenElites = 60s

// Announcement
onSpawn() {
  screenShake(intensity: 2)
  playSound("elite_roar")
  showWarningIndicator(position, duration: 2s)
}
```

### Time Scaling

| Game Time | HP Multiplier | Damage Multiplier | Spawn Rate |
|-----------|---------------|-------------------|------------|
| 10:00-15:00 | 1.0x | 1.0x | 1/90s |
| 15:00+ | 1.6x | 1.4x | 1/60s |

### AI Behavior
```javascript
// Aggressive charge
if (distanceToPlayer > 300) {
  moveTowardPlayer(speed)
} else {
  // Charge attack
  chargeSpeed = speed * 2.5
  chargeDuration = 800ms
  chargeCooldown = 4000ms
  
  // Also spawns minions
  if (hp < maxHp * 0.5 && !hasSpawnedMinions) {
    spawnMinions(count: 4, type: "zombie")
  }
}
```

### Görsel
- **Renk:** Koyu mor-siyah gradient (#311B92)
- **Shape:** Large with spikes/horns
- **Animation:** Breathing (scale pulse)
- **Aura:** Purple glow/aura effect
- **Special:** Red eyes that glow
- **Death:** Large explosion with screen shake

---

## BOSS TİPİ: BOSS MONSTER

### Genel Bilgi
- **Rol:** Boss encounter
- **Spawn Time:** 5:00, 10:00, 15:00, 20:00
- **Tema:** Epic fight

### Stat Tablosu

| Boss | Time | HP | Damage | Speed | XP Drop | Special Ability |
|------|------|----|----|-------|---------|----------------|
| Boss 1 | 5:00 | 2000 | 40 | 70 px/s | 100 | Summon Zombies |
| Boss 2 | 10:00 | 5000 | 60 | 85 px/s | 250 | Teleport |
| Boss 3 | 15:00 | 10000 | 80 | 90 px/s | 500 | AOE Slam |
| Boss 4 | 20:00 | 20000 | 120 | 95 px/s | 1000 | All abilities |

### Boss Spawn Event
```javascript
onBossSpawn() {
  // Announcement
  pauseGame(2s)
  showWarning("BOSS APPROACHING", size: large)
  playMusic("boss_theme")
  screenShake(intensity: 5, duration: 1s)
  
  // Clear some enemies
  removeWeakEnemies(percentage: 50%)
  
  // Boss intro
  bossSpawnAnimation(duration: 2s)
  resumeGame()
}
```

### Attack Patterns

**Boss 1 (5:00) - Summoner:**
```javascript
// Phase 1 (100% - 50% HP)
- Normal chase
- Every 5s: Summon 3 zombies

// Phase 2 (50% - 0% HP)
- Faster movement (+30%)
- Every 3s: Summon 5 zombies
- Spawn 2 Fast Runners at 25% HP
```

**Boss 2 (10:00) - Teleporter:**
```javascript
// Abilities
- Teleport: Every 8s, teleport to random position near player
- After teleport: Brief invulnerability (1s)
- Summon Elite at 30% HP

// Movement
- Chase player
- Teleport if player too far (>400px)
```

**Boss 3 (15:00) - Berserker:**
```javascript
// Rage mechanic
if (hp < maxHp * 0.5) {
  speed *= 1.5
  damage *= 1.3
  size *= 1.2
}

// AOE Slam
- Every 10s
- Red circle indicator (1s warning)
- 200px radius
- 100 damage
- Knockback
```

**Boss 4 (20:00) - Ultimate:**
```javascript
// All previous abilities
- Summons (zombies, elites)
- Teleport
- AOE Slam

// New: Projectile attack
- Every 6s
- Shoots 8 projectiles in circle
- 40 damage each
- 300px range

// Phases
Phase 1 (100-66%): Slow, summons
Phase 2 (66-33%): Faster, teleport
Phase 3 (33-0%): Berserker mode, all abilities
```

### Görsel
- **Size:** 80px radius (huge)
- **Renk:** Unique per boss
  - Boss 1: Dark green
  - Boss 2: Purple-black
  - Boss 3: Blood red
  - Boss 4: Rainbow/prismatic
- **Effects:** 
  - Glowing eyes
  - Particle aura
  - Screen distortion nearby
- **Health Bar:** Top of screen, special UI
- **Death:** Epic explosion, slow-motion

---

## SPAWN SYSTEM

### Spawn Manager Config
```javascript
const SPAWN_CONFIG = {
  // Spawn zones (screen edges)
  spawnPadding: 50px,  // Outside visible area
  
  // Base spawn rates (enemies per second)
  baseRates: {
    zombie: 1.0,
    runner: 0.0,  // Unlocks at 2:00
    tank: 0.0,    // Unlocks at 5:00
    bat: 0.0,     // Unlocks at 3:00
    elite: 0.0    // Unlocks at 10:00
  },
  
  // Maximum enemies on screen
  maxEnemies: 200,
  
  // Spawn intervals
  spawnCheckInterval: 500ms  // Check every 500ms
}
```

### Time-Based Spawning
```javascript
function getSpawnRates(gameTime) {
  const minutes = gameTime / 60;
  
  return {
    zombie: {
      rate: 1 + (minutes * 0.3),
      enabled: true
    },
    runner: {
      rate: minutes > 2 ? 0.5 + ((minutes - 2) * 0.2) : 0,
      enabled: minutes > 2
    },
    tank: {
      rate: minutes > 5 ? 0.2 + ((minutes - 5) * 0.1) : 0,
      enabled: minutes > 5
    },
    bat: {
      rate: minutes > 3 ? 0.3 + ((minutes - 3) * 0.15) : 0,
      enabled: minutes > 3,
      groupSize: Math.min(5 + Math.floor(minutes), 15)
    },
    elite: {
      rate: minutes > 10 ? 0.015 : 0,
      enabled: minutes > 10
    }
  };
}
```

### Spawn Position Algorithm
```javascript
function getSpawnPosition(canvas) {
  const edge = random(['top', 'right', 'bottom', 'left']);
  const padding = 50;
  
  switch(edge) {
    case 'top':
      return {
        x: random(0, canvas.width),
        y: -padding
      };
    case 'bottom':
      return {
        x: random(0, canvas.width),
        y: canvas.height + padding
      };
    case 'left':
      return {
        x: -padding,
        y: random(0, canvas.height)
      };
    case 'right':
      return {
        x: canvas.width + padding,
        y: random(0, canvas.height)
      };
  }
}
```

---

## DIFFICULTY CURVE

### Scaling Formula
```javascript
// HP Scaling
enemyHP = baseHP * (1 + (gameTime / 120) * 0.5)
// At 2:00: 1.5x HP
// At 10:00: 2.5x HP

// Damage Scaling  
enemyDamage = baseDamage * (1 + (gameTime / 180) * 0.4)
// At 3:00: 1.4x Damage
// At 15:00: 2.0x Damage

// Spawn Rate Scaling
spawnRate = baseRate * (1 + (gameTime / 90) * 0.3)
// Exponential increase over time
```

### Enemy Composition Over Time

| Time | Zombie % | Runner % | Tank % | Bat % | Elite % |
|------|----------|----------|--------|-------|---------|
| 0-2 min | 100% | 0% | 0% | 0% | 0% |
| 2-5 min | 70% | 20% | 0% | 10% | 0% |
| 5-10 min | 50% | 25% | 10% | 15% | 0% |
| 10-15 min | 40% | 25% | 15% | 15% | 5% |
| 15+ min | 30% | 25% | 20% | 20% | 5% |

---

## XP DROP SYSTEM

### Base XP Values
```javascript
const XP_VALUES = {
  zombie: 2,
  runner: 4,
  tank: 10,
  bat: 1,
  elite: 30,
  boss: 100-1000 (depends on boss level)
}
```

### XP Crystal Behavior
```javascript
onEnemyDeath(enemy) {
  // Spawn XP crystal
  const crystal = {
    x: enemy.x,
    y: enemy.y,
    value: enemy.xpValue,
    lifetime: 30s,  // Despawns if not picked up
    
    // Magnetism
    attractionRadius: player.pickupRange,
    attractionSpeed: 300 px/s
  }
  
  // Visual
  crystal.size = map(value, 1, 100, 10px, 25px)
  crystal.glow = true
  crystal.color = lerpColor('#FFD700', '#FF4500', value/100)
}
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Tüm 5 düşman tipi implement edildi
- [ ] Boss sistemi çalışıyor
- [ ] Spawn manager time-based scaling yapıyor
- [ ] HP/Damage scaling formülleri doğru
- [ ] XP drop mekanikleri aktif
- [ ] AI behavior'lar çalışıyor (chase, dash, charge)
- [ ] Visual effects (colors, animations)
- [ ] Boss spawn events ve cutscene'ler
- [ ] Elite spawn warnings
- [ ] Max enemy limit enforced

---

## BALANCE NOTES

### Difficulty Testing
- **Easy:** 5 dakika survive = casual player
- **Medium:** 10 dakika survive = experienced player
- **Hard:** 15+ dakika survive = expert player
- **Impossible:** 20+ dakika = god-tier

### Enemy Density
- Optimal: 30-50 enemies on screen
- Chaotic: 100-150 enemies
- Max: 200 enemies (performance limit)

### Boss Difficulty
- Boss HP should take 30-60 seconds to kill
- Player should feel challenged but not impossible
- Reward must feel worth it (100+ XP minimum)

Bu config ile dengeli ve progressive bir düşman sistemi elde edersin!