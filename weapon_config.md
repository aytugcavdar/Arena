# WEAPONS CONFIG - SİLAH DETAYLARI VE İSTATİSTİKLER

## SİLAH SİSTEMİ GENEL KURALLARI

### Seviye Sistemi
- Tüm silahlar **Seviye 1-5** arası upgrade edilebilir
- Her seviye önemli güç artışı sağlar
- Seviye 5 = "Evolution" (özel dönüşüm)

### Cooldown Sistemi
- Cooldown: Atışlar arası bekleme süresi (ms)
- Attack Speed stat'ı tüm cooldown'ları azaltır

### Damage Scaling
- Base Damage × Player Damage Multiplier = Final Damage
- Damage Multiplier: Upgrade'lerle artar (başlangıç 1.0)

---

## SİLAH #1: FIREBALL (ATEŞ TOPU)

### Genel Bilgi
- **Tip:** Projektil
- **Hedefleme:** En yakın düşman
- **Özellik:** Penetrasyon yok, tek hedef

### Seviye Tablosu

| Seviye | Damage | Cooldown (ms) | Projectile Count | Speed | Special |
|--------|--------|---------------|------------------|-------|---------|
| 1 | 25 | 1200 | 1 | 400 px/s | - |
| 2 | 35 | 1000 | 2 | 450 px/s | - |
| 3 | 50 | 900 | 3 | 500 px/s | - |
| 4 | 70 | 800 | 4 | 550 px/s | - |
| 5 | 100 | 700 | 5 | 600 px/s | AOE Explosion (50px radius, 50% damage) |

### Davranış
```javascript
// Level 1-4
- En yakın düşmanı hedef al
- Düz çizgide ilerle
- Hedefe çarpınca kaybol
- Max range: 600px

// Level 5 (Evolution)
- Hedefe çarpınca patlama
- 50px radius AOE damage
- Ana hedef: 100 damage
- AOE enemies: 50 damage
```

### Görsel
- Renk: Turuncu-kırmızı gradient
- Boyut: 15px radius (circle)
- Trail efekti: Ateş parçacıkları
- Hit efekti: Turuncu patlama

---

## SİLAH #2: LIGHTNING BOLT (YILDIRIM)

### Genel Bilgi
- **Tip:** Chain Attack
- **Hedefleme:** En yakın düşman, sonra chain
- **Özellik:** Zincir şimşek

### Seviye Tablosu

| Seviye | Damage | Cooldown (ms) | Chain Count | Chain Range | Special |
|--------|--------|---------------|-------------|-------------|---------|
| 1 | 40 | 2000 | 1 | - | - |
| 2 | 50 | 1800 | 3 | 150px | - |
| 3 | 65 | 1600 | 5 | 175px | - |
| 4 | 85 | 1400 | 7 | 200px | -25% damage per chain |
| 5 | 120 | 1200 | 10 | 250px | -15% damage per chain |

### Davranış
```javascript
// Zincir Mekanikleri
1. İlk hedefi vur (full damage)
2. Range içinde başka düşman ara
3. Bulunca ona zincirle (damage × multiplier)
4. Chain count'a kadar tekrarla

// Damage Calculation
Chain 1: 100% damage
Chain 2: 75% damage (Level 4-5: 85%)
Chain 3: 56% damage (Level 4-5: 72%)
...
```

### Görsel
- Renk: Mavi-beyaz elektrik
- Efekt: Animasyonlu zikzak çizgi
- Hit efekti: Elektrik sparks
- Sound: Zap!

---

## SİLAH #3: MAGIC ORBIT (SİHİRLİ YÖRÜNGE)

### Genel Bilgi
- **Tip:** Orbital Defense
- **Hedefleme:** Pasif, temas ile
- **Özellik:** Karakterin etrafında döner

### Seviye Tablosu

| Seviye | Damage | Rotation Speed | Orb Count | Orbit Radius | Special |
|--------|--------|----------------|-----------|--------------|---------|
| 1 | 20 | 2 rad/s | 2 | 60px | - |
| 2 | 28 | 2.5 rad/s | 3 | 70px | - |
| 3 | 38 | 3 rad/s | 4 | 80px | - |
| 4 | 50 | 3.5 rad/s | 5 | 90px | Knockback |
| 5 | 70 | 4 rad/s | 6 | 100px | Piercing (2 enemies) |

### Davranış
```javascript
// Rotation Logic
angle += rotationSpeed * deltaTime
orb.x = player.x + cos(angle + offset) * radius
orb.y = player.y + sin(angle + offset) * radius

// Offset Calculation
offset = (2 * PI / orbCount) * orbIndex

// Collision
- Orb touches enemy → Deal damage
- Cooldown per enemy: 200ms
```

### Görsel
- Renk: Mor-pembe glow
- Boyut: 12px radius
- Trail: Hafif iz bırakır
- Glow efekti: Outer glow

---

## SİLAH #4: BOOMERANG (BUMERANG)

### Genel Bilgi
- **Tip:** Return Projectile
- **Hedefleme:** Yön bazlı
- **Özellik:** Gider-gelir, multiple hit

### Seviye Tablosu

| Seviye | Damage | Cooldown (ms) | Count | Max Distance | Special |
|--------|--------|---------------|-------|--------------|---------|
| 1 | 30 | 1500 | 1 | 300px | - |
| 2 | 42 | 1400 | 2 | 350px | - |
| 3 | 58 | 1300 | 3 | 400px | Piercing |
| 4 | 78 | 1200 | 4 | 450px | Piercing |
| 5 | 110 | 1000 | 4 | 500px | Homing on return |

### Davranış
```javascript
// Phase 1: Going Out
- Direction: Random or toward enemies
- Speed: 500 px/s
- Can hit multiple enemies
- Reaches max distance

// Phase 2: Returning
- Speed: 600 px/s
- Returns to player position
- Can hit enemies again
- Level 5: Homes toward player

// Hit Logic
- Same enemy can be hit going & returning
- Cooldown per enemy: 100ms
```

### Görsel
- Renk: Cyan-yeşil
- Shape: Boomerang şekli (8 vertices)
- Animation: Rotation (5 rad/s)
- Trail: Cyan trail

---

## SİLAH #5: ICE SHARD (BUZ KIRIĞI)

### Genel Bilgi
- **Tip:** Radial Burst
- **Hedefleme:** Tüm yönler
- **Özellik:** 360° dağılım

### Seviye Tablosu

| Seviye | Damage | Cooldown (ms) | Shard Count | Speed | Special |
|--------|--------|---------------|-------------|-------|---------|
| 1 | 22 | 2500 | 4 (90° apart) | 350 px/s | - |
| 2 | 32 | 2200 | 8 (45° apart) | 400 px/s | - |
| 3 | 45 | 2000 | 12 (30° apart) | 450 px/s | - |
| 4 | 62 | 1800 | 16 (22.5° apart) | 500 px/s | Slow enemies 30% |
| 5 | 90 | 1500 | 20 (18° apart) | 550 px/s | Slow 50%, Freeze 2s |

### Davranış
```javascript
// Spawn Pattern
for (let i = 0; i < shardCount; i++) {
  angle = (2 * PI / shardCount) * i + playerRotation
  shard.vx = cos(angle) * speed
  shard.vy = sin(angle) * speed
}

// Special Effects (Level 4-5)
onHit(enemy) {
  enemy.speed *= 0.5  // Level 5
  if (level === 5) {
    enemy.frozen = true
    setTimeout(() => enemy.frozen = false, 2000)
  }
}

// Range
Max distance: 400px, then disappear
```

### Görsel
- Renk: Açık mavi-beyaz
- Shape: Diamond/Shard (6 vertices)
- Rotation: Spiral (3 rad/s)
- Trail: Buz parçacıkları
- Hit efekt: Mavi patlama + snow particles

---

## SİLAH #6: HOLY BEAM (KUTSAL IŞIN)

### Genel Bilgi
- **Tip:** Penetrating Beam
- **Hedefleme:** Rastgele düşman
- **Özellik:** Dikey ışın, çoklu vuruş

### Seviye Tablosu

| Seviye | Damage | Cooldown (ms) | Beam Width | Duration | Special |
|--------|--------|---------------|------------|----------|---------|
| 1 | 35 | 3000 | 30px | 500ms | Hits 1 enemy |
| 2 | 48 | 2800 | 40px | 600ms | Hits 2 enemies |
| 3 | 65 | 2600 | 50px | 700ms | Hits 3 enemies |
| 4 | 88 | 2400 | 60px | 800ms | Hits 5 enemies |
| 5 | 125 | 2000 | 80px | 1000ms | Hits all, Burn DoT |

### Davranış
```javascript
// Targeting
target = randomEnemy()
beamX = target.x

// Beam Properties
- Full screen height (top to bottom)
- Fixed X position for duration
- Enemies inside take damage per tick
- Tick rate: 100ms

// Level 5 Burn
onHit(enemy) {
  enemy.burn = {
    damage: 10,
    duration: 3000,
    tickRate: 500
  }
}
```

### Görsel
- Renk: Altın-sarı glow
- Effect: Gradient dikey ışın
- Particles: Işık parçacıkları yukarı çıkar
- Sound: Whoosh + divine choir

---

## WEAPON SYNERGY (OPSİYONEL)

### Combo Bonuslar
Belirli silahlar birlikte kullanılınca bonus:

**Fire & Ice:**
- Fireball + Ice Shard = Steam Cloud (DoT area)

**Lightning & Water:**
- Lightning + (future water weapon) = Chain range +50%

**Orbit + Beam:**
- Magic Orbit + Holy Beam = Orbs shoot beams

---

## WEAPON UNLOCK SİSTEMİ

### Başlangıç
Oyun başında **Fireball** zaten aktif (Level 1)

### Level Up'larda
Her level up'ta 3 seçenek:
- Yeni silah (eğer unlock edilmemişse)
- Mevcut silah upgrade (Level 2-5)
- Stat boost

### Öncelik Sırası
```javascript
// Weapon pool
Available = All weapons - Player's weapons
If (player has < 6 weapons):
  70% chance: New weapon
  30% chance: Upgrade/Stat
Else:
  100% chance: Upgrade/Stat
```

---

## BALANCE NOTES

### Silah Tier List (Güç)
**S-Tier:** Lightning (zincir çok güçlü)
**A-Tier:** Magic Orbit (pasif defense), Ice Shard (AOE)
**B-Tier:** Fireball (solid), Holy Beam (high damage)
**C-Tier:** Boomerang (risky but fun)

### Combo Önerileri
**Early Game:** Fireball + Magic Orbit
**Mid Game:** Lightning + Ice Shard
**Late Game:** All weapons Level 5

### Cooldown Optimization
Attack Speed +50% ile:
- Fireball: 700ms → 466ms (Level 5)
- Lightning: 1200ms → 800ms (Level 5)
- Ice Shard: 1500ms → 1000ms (Level 5)

---

## IMPLEMENTATION CHECKLIST

- [ ] Tüm 6 silah implement edildi
- [ ] Seviye sistemleri çalışıyor
- [ ] Special efektler (AOE, Chain, Slow) aktif
- [ ] Görsel efektler eklendi
- [ ] Ses efektleri eklendi (opsiyonel)
- [ ] Balance test edildi
- [ ] Weapon unlock flow doğru
- [ ] Synergy bonusları (opsiyonel)

---

## KOD ÖRNEĞİ (TEMPLATE)

```javascript
const WEAPONS = {
  fireball: {
    name: "Fireball",
    description: "Shoots fireballs at the nearest enemy",
    icon: "🔥",
    levels: [
      { damage: 25, cooldown: 1200, projectileCount: 1, speed: 400 },
      { damage: 35, cooldown: 1000, projectileCount: 2, speed: 450 },
      { damage: 50, cooldown: 900, projectileCount: 3, speed: 500 },
      { damage: 70, cooldown: 800, projectileCount: 4, speed: 550 },
      { damage: 100, cooldown: 700, projectileCount: 5, speed: 600, aoeRadius: 50 }
    ],
    fire: function(player, level) {
      // Implementation
    }
  },
  // ... other weapons
}
```

Bu config'i JSON veya JS object olarak kullan!