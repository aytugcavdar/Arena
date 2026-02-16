# VAMPIRE SURVIVORS TARZI OYUN GELİŞTİRME GÖREVİ

## PROJE ÖZET
Vampire Survivors tarzında, web ve mobil platformlarda çalışabilen, tam özellikli bir survival roguelike oyunu geliştir.

## PLATFORM GEREKSİNİMLERİ
- **Web**: React + HTML5 Canvas kullanarak tarayıcıda çalışan versiyon
- **Mobil**: React Native ile iOS/Android için adapte edilebilir yapı
- Her iki platform için de responsive ve performanslı olmalı

## GRAFİK STİLİ
Modern 2D sprite görünümü:
- Temiz, renkli ve açık seçik grafikler
- Canvas API ile çizilmiş modern karakterler ve düşmanlar
- Smooth animasyonlar ve partiküler efektler
- Gölge ve parıltı efektleri
- Gradient ve modern renk paletleri

---

## TEMEL OYUN MEKANİKLERİ

### 1. KARAKTER KONTROLÜ
**Gereksinimler:**
- WASD veya Ok tuşları ile 8 yönlü hareket
- Mobil için virtual joystick/touch kontrol
- Smooth ve responsive hareket
- Karakter ekranın dışına çıkamaz
- Hareket hızı upgrade edilebilir olmalı

**Karakter Özellikleri:**
- HP (Can): Başlangıç 100, maksimum upgrade edilebilir
- Hız: Başlangıç değeri, yükseltmelerle artabilir
- Armor (Zırh): Hasar azaltma
- Regen (Canlanma): Saniye başına HP kazanımı
- Pickup Range (Toplama Menzili): XP ve item toplama alanı

### 2. SAVAŞ SİSTEMİ

**Auto-Attack Mekanikleri:**
- Silahlar otomatik olarak en yakın düşmana ateş eder
- Her silahın kendi cooldown'u vardır
- Aynı anda birden fazla silah kullanılabilir
- Silahlar seviye atlayarak güçlenir

**Silah Tipleri (En Az 5 Farklı):**

1. **Fireball (Ateş Topu)**
   - En yakın düşmana ateş topları fırlatır
   - Seviye 1: 1 mermi, orta hasar
   - Seviye 2-4: Mermi sayısı artar
   - Seviye 5: Patlamalar AOE hasar verir

2. **Lightning Bolt (Yıldırım)**
   - Zincir şimşek saldırısı
   - Seviye 1: 1 düşmana çarpar
   - Seviye 2-4: Zincir sayısı artar (3-5 düşman)
   - Seviye 5: Hasar ve zincir sayısı maksimum

3. **Magic Orbit (Sihirli Yörünge)**
   - Karakterin etrafında dönen sihirli küreler
   - Seviye 1: 2 küre
   - Seviye 2-4: Küre sayısı ve hız artar
   - Seviye 5: 6 küre, yüksek hasar

4. **Boomerang (Bumerang)**
   - Gidip geri dönen projektil
   - Seviye 1: 1 bumerang
   - Seviye 2-4: Bumerang sayısı ve menzil artar
   - Seviye 5: 4 bumerang, tüm ekranı kaplar

5. **Ice Shard (Buz Kırıkları)**
   - Spiral şekilde dışa doğru yayılan buz parçaları
   - Seviye 1: 4 yönlü
   - Seviye 2-4: 8-12 yönlü, hız artar
   - Seviye 5: 16 yönlü, düşmanları yavaşlatır

6. **Holy Beam (Kutsal Işın)** (Opsiyonel)
   - Rastgele bir düşmana dikey ışın
   - Penetrasyon hasar (birden fazla düşmana)

### 3. DÜŞMAN SİSTEMİ

**Spawn Mekanikleri:**
- Düşmanlar ekranın dışından spawn olur
- Zamanla spawn hızı ve sayısı artar
- Her 1-2 dakikada yeni düşman tipleri gelir
- Boss dalgaları (5, 10, 15 dakika gibi)

**Düşman Tipleri:**

1. **Zombie (Temel)**
   - Yavaş hareket
   - Düşük HP
   - Düşük hasar
   - XP: 1-2

2. **Fast Runner (Hızlı Koşucu)**
   - Hızlı hareket
   - Orta HP
   - Orta hasar
   - XP: 3-4

3. **Tank (Tanklı Düşman)**
   - Çok yavaş
   - Yüksek HP
   - Yüksek hasar
   - XP: 8-10

4. **Bat (Yarasa)**
   - Çok hızlı
   - Çok düşük HP
   - Düşük hasar
   - Sürü halinde gelir
   - XP: 1

5. **Elite Monster (Elit Canavar)**
   - Orta hız
   - Çok yüksek HP
   - Yüksek hasar
   - XP: 20-30
   - 10 dakika sonra başlar

**Boss Mekanikleri:**
- Belirli aralıklarla özel boss'lar
- Çok yüksek HP ve hasar
- Özel attack pattern'ler
- Öldürüldüğünde bonus XP ve item

### 4. XP VE SEVİYE SİSTEMİ

**XP Mekanikleri:**
- Düşmanlar öldüğünde XP kristali düşürür
- Kristaller karaktere doğru çekilir (pickup range)
- XP barı dolunca seviye atlanır
- Her seviyede gerekli XP exponential artar

**Seviye Atlama:**
- Oyun DURAKLIR
- 3 rastgele yetenek/upgrade seçeneği sunulur
- Seçimlerden biri seçilmeli
- Seçim yapılınca oyun devam eder

**Upgrade Seçenekleri:**

*Yeni Silahlar:*
- Fireball, Lightning, Magic Orbit, Boomerang, Ice Shard vb.

*Silah Upgrade'leri:*
- Mevcut silahları seviye atlat (Seviye 2-5)
- Her seviyede güç, hız veya özel efektler artar

*Stat Upgrade'leri:*
- Max HP +20%
- HP Regen +0.5/sn
- Movement Speed +10%
- Armor +5
- Pickup Range +15%
- Attack Speed +10%
- Damage +15%

*Özel Yetenekler:*
- Magnet (tüm XP'yi çeker)
- Garlic (yakın düşmanlara DoT)
- Wings (hareket hızı ve iframes)

### 5. KARAKTER GELİŞTİRME

**İstatistik Sistemi:**
```
Player Stats:
- Level: Mevcut seviye
- XP: Mevcut/Gerekli XP
- HP: Mevcut/Maksimum
- Damage Multiplier: Tüm silahlara etki
- Attack Speed: Cooldown azalması
- Movement Speed: Pixel/frame
- Armor: Hasar azaltma %
- HP Regen: Saniye başına
- Pickup Range: Pixel cinsinden
```

**UI Göstergeleri:**
- Sol üst: HP bar (yeşil)
- Alt: XP bar (mavi/mor)
- Sağ üst: Süre ve kill count
- Minimap (opsiyonel)

---

## TEKNİK GEREKSINIMLER

### PERFORMANS
- 60 FPS hedefle
- Canvas API optimizasyonları
- Efficient collision detection (spatial partitioning)
- Object pooling (düşmanlar, projektiller için)
- En fazla 500-1000 aktif entity aynı anda

### REACT YAPISI
```
Hooks kullan:
- useState: Game state yönetimi
- useEffect: Game loop ve event listeners
- useRef: Canvas, animation frame, game state
- useCallback: Event handler optimizasyonları
```

### GAME LOOP
```javascript
60 FPS hedefle:
1. Input handling
2. Update (physics, AI, collisions)
3. Render (canvas drawing)
```

### COLLISION DETECTION
- Circle-circle collisions (player-enemy, projectile-enemy)
- Efficient spatial hashing veya quadtree
- XP pickup radius kontrolü

### STATE MANAGEMENT
```javascript
Game States:
- menu: Ana menü
- playing: Oyun aktif
- paused: Duraklama menüsü
- levelUp: Yetenek seçimi ekranı
- gameOver: Ölüm ekranı
```

---

## UI/UX GEREKSİNİMLERİ

### ANA MENÜ
- "Start Game" butonu
- Karakter seçimi (opsiyonel)
- Ayarlar (ses, grafik kalitesi)
- Nasıl oynanır bilgisi

### OYUN İÇİ UI
- HP bar (üst sol)
- XP bar (alt, tam genişlik)
- Timer (üst orta)
- Kill count (üst sağ)
- Aktif silahlar (sol taraf icon'ları)
- Minimap (sağ alt, opsiyonel)

### LEVEL UP EKRANI
- Oyun duraklar
- 3 seçenek kartı:
  - Icon
  - İsim
  - Açıklama
  - Mevcut seviye (silahlar için)
- Hover efektleri
- Seçimle devam et

### PAUSE MENÜ
- Resume
- Restart
- Quit to Menu
- Stats (mevcut istatistikler)

### GAME OVER EKRANI
- Survival time
- Total kills
- Level reached
- Restart butonu
- Main menu butonu

---

## MOBİL ADAPTASYON

### KONTROL ŞEMASİ
- Virtual joystick (sol taraf)
- Otomatik ateş zaten var
- Pause butonu (sağ üst)
- Touch-friendly UI buttons

### RESPONSIVE TASARIM
- Canvas otomatik resize
- Touch event handling
- Performans optimizasyonları (düşük grafik modu)

### REACT NATIVE İÇİN
- react-native-game-engine kullan
- Veya expo-gl + Canvas API polyfill
- Touch gesture handlers
- AsyncStorage for progress

---

## VİZUAL TASARIM ÖNERİLERİ

### RENK PALETİ
```
Player: Mavi/Cyan tonları (#00D9FF)
Enemies: 
  - Zombie: Yeşil (#4CAF50)
  - Fast: Turuncu (#FF9800)
  - Tank: Kırmızı (#F44336)
  - Bat: Mor (#9C27B0)
XP Crystals: Parlak sarı-altın (#FFD700)
Background: Koyu gri gradient (#1a1a2e -> #16213e)
UI: Modern, temiz, neon efektler
```

### ANIMASYONLAR
- Karakter idle animasyonu (hafif salınma)
- Yürüme animasyonu
- Düşman animasyonları
- Silah ateşleme efektleri
- Hit efektleri (flash, shake)
- Death animasyonları
- Particle efektler (kan, patlama, ışık)

### EFEKTLER
- Glow efektleri (silahlar, XP)
- Screen shake (hasar aldığında)
- Slow motion (boss kill)
- Particle sistemler
- Trail efektleri (hızlı düşmanlar)

---

## SES VE MÜZİK (OPSİYONEL)

Eğer eklenirse:
- Background music (looping)
- Silah sesleri
- Düşman ölüm sesleri
- Level up sesi
- XP toplama sesi
- Hit sesleri
- Boss music

---

## GELİŞTİRME AŞAMALARI (ÖNERİLEN)

### PHASE 1: CORE MECHANICS
1. Canvas setup ve game loop
2. Player movement (WASD)
3. Basit düşman spawn
4. Temel collision detection
5. Basit bir silah (Fireball)

### PHASE 2: COMBAT SYSTEM
1. Tüm silahları implement et
2. Düşman çeşitliliği
3. HP ve hasar sistemi
4. Death mekanikleri

### PHASE 3: PROGRESSION
1. XP sistemi
2. Level up ekranı
3. Upgrade sistemi
4. Stat management

### PHASE 4: POLISH
1. UI/UX iyileştirmeleri
2. Visual efektler
3. Animasyonlar
4. Particle sistemler
5. Sound efektler

### PHASE 5: MOBILE
1. Touch kontroller
2. Responsive design
3. Performance optimizasyonları
4. React Native port

---

## DOSYA YAPISI ÖNERİSİ

```
vampire-survivors-game/
├── src/
│   ├── components/
│   │   ├── Game.jsx (Main game component)
│   │   ├── Menu.jsx
│   │   ├── PauseMenu.jsx
│   │   ├── LevelUpScreen.jsx
│   │   └── GameOverScreen.jsx
│   ├── game/
│   │   ├── GameEngine.js (Core game loop)
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── Weapon.js
│   │   ├── Projectile.js
│   │   ├── CollisionManager.js
│   │   └── SpawnManager.js
│   ├── data/
│   │   ├── weapons.js (Weapon configs)
│   │   ├── enemies.js (Enemy configs)
│   │   └── upgrades.js (Upgrade configs)
│   ├── utils/
│   │   ├── math.js
│   │   └── helpers.js
│   └── App.jsx
```

---

## TEST EDİLMESİ GEREKENLER

- [ ] Karakter kontrolü responsive
- [ ] Tüm silahlar çalışıyor
- [ ] Düşmanlar düzgün spawn oluyor
- [ ] Collision detection doğru
- [ ] XP toplama çalışıyor
- [ ] Level up sistemi sorunsuz
- [ ] Game over ekranı çalışıyor
- [ ] Pause/Resume çalışıyor
- [ ] Performans 60 FPS'de
- [ ] Mobil cihazda test edildi
- [ ] Uzun süreli oynanabilirlik (15+ dakika)

---

## BONUS ÖZELLIKLER (OPSİYONEL)

- Achievement sistemi
- Multiple characters (farklı starting stats)
- Persistent progression (unlockables)
- Daily challenges
- Leaderboard
- Power-ups (geçici buff'lar)
- Environmental hazards
- Boss fights with patterns
- Evolution system (silah kombinasyonları)
- Passive items (ring, accessories)

---

## BAŞARI KRİTERLERİ

Oyun şunları yapabiliyorsa başarılı:
✅ 60 FPS'de akıcı çalışıyor
✅ Vampire Survivors'ın core loop'unu yakalıyor
✅ 15+ dakika engaging gameplay
✅ Web ve mobilde çalışıyor
✅ Modern ve polished görünüyor
✅ Addictive ve replayable

---

## NOTLAR

- Kodda type safety için TypeScript kullanabilirsin
- ESLint ve Prettier kullan
- Git commit'leri düzenli at
- Her feature için ayrı branch
- README.md ekle (nasıl çalıştırılır)

**ÖNEMLİ:** Tüm kodu tek seferde yazmaya çalışma. Önce temel mekaniği çalıştır, sonra üzerine feature ekle.

Good luck! 🎮🧛