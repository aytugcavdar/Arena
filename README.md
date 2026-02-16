# Kuantum Labirent (Quantum Labyrinth) 🌌

Vampire Survivors'tan esinlenilmiş, React ve HTML5 Canvas kullanılarak geliştirilen aksiyon dolu bir roguelite hayatta kalma oyunu.

## 🎮 Özellikler

### Temel Oynanış
- **Sonsuz Düşman Dalgaları**: Zombiler, Koşucular, Tanklar, Yarasalar ve Elit düşmanlar.
- **Boss Savaşları**: Her 5 dakikada bir (veya belirli aralıklarla) gelen güçlü bosslar.
- **Silah Sistemi**: 7 farklı silah ve bunların güçlü evrimleri (Evolution).
  - 🔥 Fireball -> Inferno
  - ⚡ Lightning -> Thunder God
  - ❄️ Ice Shard -> Blizzard
  - 🪃 Boomerang -> Gale Force
  - ✨ Magic Orbit -> Void Vortex
  - ✝️ Holy Beam -> Divine Judgment
- **Pasif Eşyalar**: Zırh, Hız, Toplama Alanı, Şans, Bekleme Süresi Azaltma ve Duplicator (Mermi Sayısı Artışı).

### İlerleme & Meta-Progression
- **Seviye Atlama**: Düşmanlardan düşen XP kristallerini toplayarak seviye atla ve güçlen.
- **Altın Dükkanı (Gold Shop)**: Oyunlarda topladığın altınlarla kalıcı güçlendirmeler satın al (Güç, Zırh, Açgözlülük vb.).
- **Karakterler**: Farklı başlangıç silahlarına ve statlara sahip karakterler (Büyücü, Rahip vb.).
- **Kalici Ayarlar**: Ses, hasar sayıları ve joystick görünürlüğü ayarları.

### Özel Mekanikler
- **Dash (Atılma)**: Düşmanların içinden geçmek ve hızlanmak için (PC: Shift / Mobil: Buton).
- **Ultimate (Süper Güç)**: Düşman öldürdükçe dolan enerji barı ile ekranı temizleyen güçlü saldırı (PC: Space / Mobil: Buton).
- **Pet (Yoldaş)**: Seninle gezen ve XP toplayan sadık bir ejderha.
- **Combo Sistemi**: Aralıksız öldürmelerle XP çarpanını artır.

## 🕹️ Kontroller

### Masaüstü (PC)
- **Hareket**: W, A, S, D veya Ok Tuşları
- **Dash (Atılma)**: Shift
- **Ultimate**: Space
- **Duraklatma (Pause)**: ESC

### Mobil (Dokunmatik)
- **Hareket**: Sol taraftaki Sanal Joystick
- **Dash**: Sağ alttaki buton (Joystick üzeri)
- **Ultimate**: Sağ alttaki büyük buton (Enerji dolduğunda)

## 🚀 Kurulum ve Çalıştırma

Bu projeyi yerel ortamınızda çalıştırmak için:

1.  **Depoyu Klonlayın**:
    ```bash
    git clone https://github.com/kullaniciadi/kuantum-labirent.git
    cd kuantum-labirent
    ```

2.  **Bağımlılıkları Yükleyin**:
    ```bash
    npm install
    ```

3.  **Geliştirme Sunucusunu Başlatın**:
    ```bash
    npm run dev
    ```

4.  Tarayıcınızda açılan adrese gidin (genellikle `http://localhost:5173`).

## 🛠️ Teknolojiler

- **React**: UI ve oyun döngüsü yönetimi.
- **Vite**: Hızlı geliştirme ortamı.
- **HTML5 Canvas**: Yüksek performanslı render işlemi.
- **Web Audio API**: Sentezlenmiş ses efektleri.

---

İyi eğlenceler! 🎮✨
