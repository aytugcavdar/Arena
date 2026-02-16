import React, { useEffect, useRef, useState } from 'react';
import Leaderboard from './UI/Leaderboard.jsx';
import Shop from './UI/Shop.jsx';
import CharacterSelection from './UI/CharacterSelection.jsx';
import Settings from './UI/Settings.jsx';

function Menu({ onStartGame }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [difficultyForSelection, setDifficultyForSelection] = useState('normal'); // temp state
  const [showSettings, setShowSettings] = useState(false);
  const [progression, setProgression] = useState({ gold: 0, upgrades: {} });
  
  // Default Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('survivor_settings');
    return saved ? JSON.parse(saved) : { volume: 0.5, showDamage: true, showJoystick: true };
  });

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('survivor_settings', JSON.stringify(newSettings));
  };
  
  const canvasRef = useRef(null);

  useEffect(() => {
    // Load progression
    try {
      const saved = localStorage.getItem('survivor_progression');
      if (saved) setProgression(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load progression', e);
    }
  }, []);

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 217, 255, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleStartRequest = (diff) => {
    setDifficultyForSelection(diff);
    setShowCharSelect(true);
  };

  const handleCharacterSelected = (charId) => {
    onStartGame(difficultyForSelection, progression.upgrades, charId, settings);
  };

  return (
    <>
    {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    {showShop && <Shop onClose={() => setShowShop(false)} globalState={progression} setGlobalState={setProgression} />}
    {showCharSelect && <CharacterSelection onBack={() => setShowCharSelect(false)} onSelect={handleCharacterSelected} />}
    {showSettings && <Settings onClose={() => setShowSettings(false)} settings={settings} onUpdate={handleSettingsUpdate} />}
    <div className="menu">
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      <h1 className="menu-title">SURVIVOR ARENA</h1>
      <p className="menu-subtitle">Survive the Horde</p>
      <div className="menu-buttons">
        <button className="menu-btn primary" onClick={() => handleStartRequest('normal')}>
          ▶ Start Game
        </button>
        <button className="menu-btn" onClick={() => handleStartRequest('hard')}>
          💀 Hard Mode
        </button>
        <button className="menu-btn" onClick={() => handleStartRequest('endless')} style={{borderColor: '#ff00ff', color: '#ff00ff'}}>
          ♾️ Endless Mode
        </button>
        <button className="menu-btn" onClick={() => setShowLeaderboard(true)}>
          🏆 Leaderboard
        </button>
        <button className="menu-btn" style={{ borderColor: '#FFD700', color: '#FFD700' }} onClick={() => setShowShop(true)}>
          💰 Merchant ({progression.gold})
        </button>
        <button className="menu-btn" onClick={() => setShowSettings(true)}>
          ⚙️ Settings
        </button>
      </div>
      <div className="menu-controls">
        <p>Move: <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or Arrow Keys</p>
        <p style={{ marginTop: 4 }}>Weapons fire automatically • Survive as long as you can!</p>
      </div>
    </div>
    </>
  );
}

export default Menu;
