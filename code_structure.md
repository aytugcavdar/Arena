# CODE STRUCTURE - DOSYA YAPISI VE COMPONENT ŞEMALARI

## PROJE KLASÖR YAPISI

```
vampire-survivors-game/
│
├── public/
│   ├── index.html
│   └── assets/
│       ├── sounds/          (opsiyonel)
│       └── images/          (opsiyonel)
│
├── src/
│   ├── App.jsx              # Ana component
│   ├── index.js             # Entry point
│   │
│   ├── components/
│   │   ├── Game.jsx                 # Ana oyun container
│   │   ├── Menu.jsx                 # Ana menü
│   │   ├── GameCanvas.jsx           # Canvas component
│   │   ├── UI/
│   │   │   ├── HUD.jsx              # Health bar, XP bar, timer
│   │   │   ├── LevelUpScreen.jsx    # Upgrade seçimi
│   │   │   ├── PauseMenu.jsx        # Pause ekranı
│   │   │   ├── GameOverScreen.jsx   # Death screen
│   │   │   └── MiniMap.jsx          # Minimap (opsiyonel)
│   │   └── Mobile/
│   │       └── VirtualJoystick.jsx  # Touch controls
│   │
│   ├── game/
│   │   ├── GameEngine.js            # Core game loop
│   │   ├── entities/
│   │   │   ├── Player.js
│   │   │   ├── Enemy.js
│   │   │   ├── Projectile.js
│   │   │   ├── XPCrystal.js
│   │   │   └── Boss.js
│   │   ├── systems/
│   │   │   ├── InputManager.js
│   │   │   ├── CollisionManager.js
│   │   │   ├── SpawnManager.js
│   │   │   ├── WeaponSystem.js
│   │   │   └── ParticleSystem.js
│   │   ├── weapons/
│   │   │   ├── Weapon.js            # Base class
│   │   │   ├── Fireball.js
│   │   │   ├── Lightning.js
│   │   │   ├── MagicOrbit.js
│   │   │   ├── Boomerang.js
│   │   │   ├── IceShard.js
│   │   │   └── HolyBeam.js
│   │   └── ai/
│   │       ├── ChaseAI.js
│   │       ├── DashAI.js
│   │       └── BossAI.js
│   │
│   ├── data/
│   │   ├── weaponConfigs.js         # Weapon stats
│   │   ├── enemyConfigs.js          # Enemy stats
│   │   ├── upgradeConfigs.js        # Upgrade options
│   │   └── constants.js             # Game constants
│   │
│   ├── utils/
│   │   ├── math.js                  # Math helpers
│   │   ├── collision.js             # Collision detection
│   │   ├── objectPool.js            # Object pooling
│   │   └── helpers.js               # General utilities
│   │
│   ├── hooks/
│   │   ├── useGameLoop.js           # Game loop hook
│   │   ├── useCanvas.js             # Canvas setup hook
│   │   └── useInput.js              # Input handling hook
│   │
│   └── styles/
│       ├── App.css
│       └── Game.css
│
├── package.json
├── README.md
└── .gitignore
```

---

## CORE COMPONENTS

### 1. App.jsx

```jsx
import React, { useState } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import './styles/App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [difficulty, setDifficulty] = useState('normal');

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="App">
      {gameState === 'menu' && (
        <Menu onStartGame={startGame} />
      )}
      {gameState === 'playing' && (
        <Game 
          difficulty={difficulty} 
          onGameOver={returnToMenu}
        />
      )}
    </div>
  );
}

export default App;
```

---

### 2. Game.jsx (Main Game Component)

```jsx
import React, { useRef, useState, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import HUD from './UI/HUD';
import LevelUpScreen from './UI/LevelUpScreen';
import PauseMenu from './UI/PauseMenu';
import GameOverScreen from './UI/GameOverScreen';
import { GameEngine } from '../game/GameEngine';

function Game({ difficulty, onGameOver }) {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  
  const [gameState, setGameState] = useState('playing'); // playing, paused, levelUp, gameOver
  const [playerStats, setPlayerStats] = useState({
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpRequired: 15,
    level: 1,
    weapons: []
  });
  const [gameStats, setGameStats] = useState({
    time: 0,
    kills: 0
  });
  const [upgradeOptions, setUpgradeOptions] = useState([]);

  useEffect(() => {
    // Initialize game engine
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(
        canvasRef.current,
        difficulty,
        {
          onPlayerStatsUpdate: setPlayerStats,
          onGameStatsUpdate: setGameStats,
          onLevelUp: handleLevelUp,
          onGameOver: handleGameOver
        }
      );
      
      gameEngineRef.current.start();
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, [difficulty]);

  const handleLevelUp = (options) => {
    setUpgradeOptions(options);
    setGameState('levelUp');
    gameEngineRef.current.pause();
  };

  const handleUpgradeSelected = (upgrade) => {
    gameEngineRef.current.applyUpgrade(upgrade);
    setGameState('playing');
    gameEngineRef.current.resume();
  };

  const handlePause = () => {
    setGameState('paused');
    gameEngineRef.current.pause();
  };

  const handleResume = () => {
    setGameState('playing');
    gameEngineRef.current.resume();
  };

  const handleGameOver = (stats) => {
    setGameState('gameOver');
    setGameStats(stats);
  };

  return (
    <div className="game-container">
      <GameCanvas ref={canvasRef} />
      
      <HUD 
        playerStats={playerStats}
        gameStats={gameStats}
        onPause={handlePause}
      />
      
      {gameState === 'levelUp' && (
        <LevelUpScreen 
          options={upgradeOptions}
          onSelect={handleUpgradeSelected}
        />
      )}
      
      {gameState === 'paused' && (
        <PauseMenu 
          onResume={handleResume}
          onQuit={onGameOver}
        />
      )}
      
      {gameState === 'gameOver' && (
        <GameOverScreen 
          stats={gameStats}
          onRestart={() => window.location.reload()}
          onQuit={onGameOver}
        />
      )}
    </div>
  );
}

export default Game;
```

---

### 3. GameCanvas.jsx

```jsx
import React, { forwardRef } from 'react';

const GameCanvas = forwardRef((props, ref) => {
  return (
    <canvas
      ref={ref}
      width={1600}
      height={900}
      style={{
        display: 'block',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
      }}
    />
  );
});

export default GameCanvas;
```

---

## GAME ENGINE ARCHITECTURE

### 4. GameEngine.js (Core)

```javascript
import { Player } from './entities/Player';
import { SpawnManager } from './systems/SpawnManager';
import { CollisionManager } from './systems/CollisionManager';
import { WeaponSystem } from './systems/WeaponSystem';
import { InputManager } from './systems/InputManager';
import { ParticleSystem } from './systems/ParticleSystem';

export class GameEngine {
  constructor(canvas, difficulty, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.difficulty = difficulty;
    this.callbacks = callbacks;
    
    // Game state
    this.running = false;
    this.paused = false;
    this.gameTime = 0;
    this.lastFrameTime = 0;
    
    // Entities
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.xpCrystals = [];
    this.particles = [];
    
    // Systems
    this.inputManager = null;
    this.spawnManager = null;
    this.collisionManager = null;
    this.weaponSystem = null;
    this.particleSystem = null;
    
    this.init();
  }
  
  init() {
    // Initialize player
    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    
    // Initialize systems
    this.inputManager = new InputManager();
    this.spawnManager = new SpawnManager(this);
    this.collisionManager = new CollisionManager(this);
    this.weaponSystem = new WeaponSystem(this);
    this.particleSystem = new ParticleSystem(this);
    
    // Give player starting weapon
    this.weaponSystem.addWeapon(this.player, 'fireball');
  }
  
  start() {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }
  
  stop() {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
  }
  
  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
    this.lastFrameTime = performance.now();
  }
  
  gameLoop = (currentTime) => {
    if (!this.running) return;
    
    // Calculate delta time
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;
    
    if (!this.paused) {
      this.update(deltaTime);
    }
    
    this.render();
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }
  
  update(deltaTime) {
    // Update game time
    this.gameTime += deltaTime;
    
    // Update input
    this.inputManager.update();
    
    // Update player
    this.player.update(deltaTime, this.inputManager.keys);
    
    // Update systems
    this.spawnManager.update(deltaTime);
    this.weaponSystem.update(deltaTime);
    
    // Update entities
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateXPCrystals(deltaTime);
    this.particleSystem.update(deltaTime);
    
    // Check collisions
    this.collisionManager.update();
    
    // Update callbacks
    this.updateCallbacks();
    
    // Check game over
    if (this.player.hp <= 0) {
      this.handleGameOver();
    }
  }
  
  updateEnemies(deltaTime) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime, this.player);
      
      if (enemy.isDead) {
        this.handleEnemyDeath(enemy);
        this.enemies.splice(i, 1);
      }
    }
  }
  
  updateProjectiles(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);
      
      if (projectile.shouldRemove) {
        this.projectiles.splice(i, 1);
      }
    }
  }
  
  updateXPCrystals(deltaTime) {
    for (let i = this.xpCrystals.length - 1; i >= 0; i--) {
      const crystal = this.xpCrystals[i];
      crystal.update(deltaTime, this.player);
      
      if (crystal.collected) {
        this.player.gainXP(crystal.value);
        this.xpCrystals.splice(i, 1);
      }
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render particles (background layer)
    this.particleSystem.renderBackground(this.ctx);
    
    // Render XP crystals
    this.xpCrystals.forEach(crystal => crystal.render(this.ctx));
    
    // Render enemies
    this.enemies.forEach(enemy => enemy.render(this.ctx));
    
    // Render projectiles
    this.projectiles.forEach(projectile => projectile.render(this.ctx));
    
    // Render player
    this.player.render(this.ctx);
    
    // Render particles (foreground layer)
    this.particleSystem.renderForeground(this.ctx);
  }
  
  handleEnemyDeath(enemy) {
    // Spawn XP
    this.spawnManager.spawnXP(enemy.x, enemy.y, enemy.xpValue);
    
    // Create death particles
    this.particleSystem.createExplosion(enemy.x, enemy.y, enemy.color);
    
    // Update stats
    this.player.kills++;
  }
  
  handleGameOver() {
    this.stop();
    this.callbacks.onGameOver({
      time: this.gameTime,
      kills: this.player.kills,
      level: this.player.level
    });
  }
  
  updateCallbacks() {
    this.callbacks.onPlayerStatsUpdate({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      xp: this.player.xp,
      xpRequired: this.player.xpRequired,
      level: this.player.level,
      weapons: this.player.weapons
    });
    
    this.callbacks.onGameStatsUpdate({
      time: Math.floor(this.gameTime),
      kills: this.player.kills
    });
  }
  
  applyUpgrade(upgrade) {
    // Handle different upgrade types
    if (upgrade.type === 'weapon') {
      this.weaponSystem.addWeapon(this.player, upgrade.weaponId);
    } else if (upgrade.type === 'weaponUpgrade') {
      this.weaponSystem.upgradeWeapon(this.player, upgrade.weaponId);
    } else if (upgrade.type === 'stat') {
      this.player.applyStatUpgrade(upgrade.stat, upgrade.value);
    }
  }
}
```

---

## ENTITY CLASSES

### 5. Player.js

```javascript
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.radius = 15;
    
    // Stats
    this.hp = 100;
    this.maxHp = 100;
    this.speed = 150; // pixels per second
    this.armor = 0;
    this.hpRegen = 0;
    this.pickupRange = 80;
    
    // XP and leveling
    this.xp = 0;
    this.xpRequired = 15;
    this.level = 1;
    
    // Combat
    this.damageMultiplier = 1.0;
    this.attackSpeedMultiplier = 1.0;
    this.weapons = [];
    
    // State
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.kills = 0;
    
    // Visuals
    this.color = '#00D9FF';
    this.angle = 0;
  }
  
  update(deltaTime, keys) {
    // Movement
    let vx = 0;
    let vy = 0;
    
    if (keys['w'] || keys['ArrowUp']) vy -= 1;
    if (keys['s'] || keys['ArrowDown']) vy += 1;
    if (keys['a'] || keys['ArrowLeft']) vx -= 1;
    if (keys['d'] || keys['ArrowRight']) vx += 1;
    
    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }
    
    // Apply speed
    this.x += vx * this.speed * deltaTime;
    this.y += vy * this.speed * deltaTime;
    
    // Keep in bounds
    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    
    // HP Regeneration
    if (this.hpRegen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * deltaTime);
    }
    
    // Invulnerability timer
    if (this.invulnerable) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }
  }
  
  takeDamage(damage) {
    if (this.invulnerable) return;
    
    // Apply armor
    const armorReduction = this.armor / (this.armor + 100);
    const finalDamage = damage * (1 - armorReduction);
    
    this.hp = Math.max(0, this.hp - finalDamage);
    
    // Set invulnerability
    this.invulnerable = true;
    this.invulnerableTime = 0.5; // 500ms
  }
  
  gainXP(amount) {
    this.xp += amount;
    
    while (this.xp >= this.xpRequired) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.xp -= this.xpRequired;
    this.level++;
    this.xpRequired = Math.floor(10 * Math.pow(this.level, 1.8) + (this.level * 5));
    
    // Trigger level up callback
    // This is handled by GameEngine
  }
  
  applyStatUpgrade(stat, value) {
    switch(stat) {
      case 'maxHp':
        this.maxHp += value;
        this.hp = Math.min(this.maxHp, this.hp + value);
        break;
      case 'damage':
        this.damageMultiplier *= value;
        break;
      case 'attackSpeed':
        this.attackSpeedMultiplier *= value;
        break;
      case 'speed':
        this.speed *= value;
        break;
      case 'armor':
        this.armor += value;
        break;
      case 'hpRegen':
        this.hpRegen += value;
        break;
      case 'pickupRange':
        this.pickupRange *= value;
        break;
    }
  }
  
  render(ctx) {
    ctx.save();
    
    // Invulnerability flash
    if (this.invulnerable && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw player
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw glow
    const gradient = ctx.createRadialGradient(
      this.x, this.y, this.radius,
      this.x, this.y, this.radius * 2
    );
    gradient.addColorStop(0, `${this.color}80`);
    gradient.addColorStop(1, `${this.color}00`);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }
}
```

---

### 6. Enemy.js

```javascript
export class Enemy {
  constructor(x, y, type, config) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    // Stats from config
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.damage = config.damage;
    this.speed = config.speed;
    this.radius = config.radius;
    this.xpValue = config.xpValue;
    this.color = config.color;
    
    // State
    this.isDead = false;
    this.damageCooldown = 0;
    
    // AI
    this.ai = config.ai;
  }
  
  update(deltaTime, player) {
    // AI behavior
    if (this.ai) {
      this.ai.update(this, player, deltaTime);
    } else {
      // Default: chase player
      this.chasePlayer(player, deltaTime);
    }
    
    // Update cooldowns
    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
    }
  }
  
  chasePlayer(player, deltaTime) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.x += (dx / distance) * this.speed * deltaTime;
      this.y += (dy / distance) * this.speed * deltaTime;
    }
  }
  
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }
  
  canDamagePlayer() {
    return this.damageCooldown <= 0;
  }
  
  damagePlayer(player) {
    if (this.canDamagePlayer()) {
      player.takeDamage(this.damage);
      this.damageCooldown = 1.0; // 1 second
    }
  }
  
  render(ctx) {
    // Draw enemy
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw HP bar
    if (this.hp < this.maxHp) {
      const barWidth = this.radius * 2;
      const barHeight = 4;
      const barY = this.y - this.radius - 10;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
      
      // HP
      ctx.fillStyle = '#ff0000';
      const hpPercent = this.hp / this.maxHp;
      ctx.fillRect(this.x - barWidth/2, barY, barWidth * hpPercent, barHeight);
    }
  }
}
```

---

## SYSTEMS

### 7. InputManager.js

```javascript
export class InputManager {
  constructor() {
    this.keys = {};
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  update() {
    // Can add additional input processing here
  }
  
  isKeyPressed(key) {
    return this.keys[key] === true;
  }
}
```

---

### 8. CollisionManager.js

```javascript
export class CollisionManager {
  constructor(gameEngine) {
    this.game = gameEngine;
  }
  
  update() {
    // Player vs Enemies
    this.checkPlayerEnemyCollisions();
    
    // Projectiles vs Enemies
    this.checkProjectileEnemyCollisions();
    
    // Player vs XP Crystals
    this.checkPlayerXPCollisions();
  }
  
  checkPlayerEnemyCollisions() {
    const player = this.game.player;
    
    for (const enemy of this.game.enemies) {
      if (this.circleCollision(player, enemy)) {
        enemy.damagePlayer(player);
      }
    }
  }
  
  checkProjectileEnemyCollisions() {
    for (let i = this.game.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.game.projectiles[i];
      
      for (let j = this.game.enemies.length - 1; j >= 0; j--) {
        const enemy = this.game.enemies[j];
        
        if (this.circleCollision(projectile, enemy)) {
          enemy.takeDamage(projectile.damage);
          projectile.onHit(enemy);
          
          if (projectile.piercing === false) {
            projectile.shouldRemove = true;
            break;
          }
        }
      }
    }
  }
  
  checkPlayerXPCollisions() {
    const player = this.game.player;
    
    for (const crystal of this.game.xpCrystals) {
      const distance = this.distance(player, crystal);
      
      if (distance < player.pickupRange) {
        crystal.attractToPlayer(player);
        
        if (distance < player.radius + crystal.radius) {
          crystal.collected = true;
        }
      }
    }
  }
  
  circleCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distanceSquared = dx * dx + dy * dy;
    const minDistance = a.radius + b.radius;
    return distanceSquared < minDistance * minDistance;
  }
  
  distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

---

## DATA CONFIGS

### 9. weaponConfigs.js

```javascript
export const WEAPON_CONFIGS = {
  fireball: {
    name: "Fireball",
    description: "Shoots fireballs at the nearest enemy",
    icon: "🔥",
    levels: [
      { damage: 25, cooldown: 1200, projectileCount: 1, speed: 400 },
      { damage: 35, cooldown: 1000, projectileCount: 2, speed: 450 },
      { damage: 50, cooldown: 900, projectileCount: 3, speed: 500 },
      { damage: 70, cooldown: 800, projectileCount: 4, speed: 550 },
      { 
        damage: 100, 
        cooldown: 700, 
        projectileCount: 5, 
        speed: 600, 
        special: { aoeRadius: 50, aoeDamage: 50 }
      }
    ]
  },
  
  lightning: {
    name: "Lightning Bolt",
    description: "Chain lightning that jumps between enemies",
    icon: "⚡",
    levels: [
      { damage: 40, cooldown: 2000, chainCount: 1, chainRange: 0 },
      { damage: 50, cooldown: 1800, chainCount: 3, chainRange: 150 },
      { damage: 65, cooldown: 1600, chainCount: 5, chainRange: 175 },
      { damage: 85, cooldown: 1400, chainCount: 7, chainRange: 200 },
      { damage: 120, cooldown: 1200, chainCount: 10, chainRange: 250 }
    ]
  },
  
  // ... other weapons
};
```

---

### 10. enemyConfigs.js

```javascript
export const ENEMY_CONFIGS = {
  zombie: {
    hp: 50,
    damage: 10,
    speed: 60,
    radius: 25,
    xpValue: 2,
    color: '#4CAF50'
  },
  
  runner: {
    hp: 30,
    damage: 15,
    speed: 140,
    radius: 20,
    xpValue: 4,
    color: '#FF9800'
  },
  
  tank: {
    hp: 250,
    damage: 35,
    speed: 40,
    radius: 40,
    xpValue: 10,
    color: '#F44336'
  },
  
  // ... other enemies
};
```

---

## HOOKS (OPSİYONEL)

### 11. useGameLoop.js

```javascript
import { useEffect, useRef } from 'react';

export function useGameLoop(callback, dependencies = []) {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, dependencies);
}
```

---

## IMPLEMENTATION CHECKLIST

### Component Setup
- [ ] App.jsx with state management
- [ ] Game.jsx with game engine integration
- [ ] GameCanvas.jsx responsive setup
- [ ] HUD component with stats display
- [ ] LevelUpScreen with upgrade UI
- [ ] PauseMenu and GameOverScreen

### Game Engine
- [ ] GameEngine.js with game loop
- [ ] Update/render pipeline
- [ ] Entity management (add/remove)
- [ ] System coordination
- [ ] Callback system for UI updates

### Entities
- [ ] Player class with all stats
- [ ] Enemy class with AI support
- [ ] Projectile classes per weapon type
- [ ] XPCrystal with attraction logic
- [ ] Boss class with special behaviors

### Systems
- [ ] InputManager for keyboard/touch
- [ ] CollisionManager with optimizations
- [ ] SpawnManager with time-based spawning
- [ ] WeaponSystem for weapon management
- [ ] ParticleSystem for effects

### Data
- [ ] Weapon configs with all levels
- [ ] Enemy configs with stats
- [ ] Upgrade configs with effects
- [ ] Constants file (speeds, colors, etc)

### Optimization
- [ ] Object pooling for projectiles
- [ ] Spatial partitioning for collisions
- [ ] Render culling (off-screen skip)
- [ ] Delta time for frame independence

---

Bu yapı ile temiz, maintainable ve scalable bir kod tabanı elde edersin!