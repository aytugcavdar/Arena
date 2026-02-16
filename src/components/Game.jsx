import React, { useRef, useState, useEffect, useCallback } from 'react';
import HUD from './UI/HUD.jsx';
import LevelUpScreen from './UI/LevelUpScreen.jsx';
import PauseMenu from './UI/PauseMenu.jsx';
import GameOverScreen from './UI/GameOverScreen.jsx';
import MiniMap from './UI/MiniMap.jsx';
import VirtualJoystick from './UI/VirtualJoystick.jsx';
import AchievementToast from './UI/AchievementToast.jsx';
import EvolutionScreen from './UI/EvolutionScreen.jsx';
import { GameEngine } from '../game/GameEngine.js';
import { AchievementSystem } from '../game/systems/AchievementSystem.js';

function Game({ difficulty, onGameOver, upgrades = {}, characterId = 'mage', settings = {} }) {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  const achievementRef = useRef(new AchievementSystem());

  const [gameState, setGameState] = useState('playing');
  const [playerStats, setPlayerStats] = useState({
    hp: 100, maxHp: 100, xp: 0, xpRequired: 15, level: 1, weapons: [],
    ultimateCharge: 0, ultimateMax: 100, comboCount: 0, comboMultiplier: 1,
  });
  const [gameStats, setGameStats] = useState({ time: 0, kills: 0, enemies: 0 });
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const [finalStats, setFinalStats] = useState(null);
  const [miniMapState, setMiniMapState] = useState(null);
  const [achievementToasts, setAchievementToasts] = useState([]);
  const [evolutionData, setEvolutionData] = useState(null);

  const handleLevelUp = useCallback((options) => {
    setUpgradeOptions(options);
    setGameState('levelUp');
    gameEngineRef.current?.pause();
  }, []);

  const handleGameOver = useCallback((stats) => {
    setGameState('gameOver');
    setFinalStats(stats);
  }, []);

  // Achievement & minimap ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = gameEngineRef.current;
      if (!engine || !engine.running) return;

      // Update minimap
      setMiniMapState(engine.getState());

      // Check achievements
      const ach = achievementRef.current;
      ach.check({
        kills: engine.player?.kills || 0,
        time: engine.gameTime || 0,
        maxCombo: engine.maxComboReached || 0,
        level: engine.player?.level || 1,
      });

      // Update achievement toasts
      ach.updateToasts(0.25);
      setAchievementToasts([...ach.getToasts()]);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameEngineRef.current) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gameEngineRef.current = new GameEngine(canvasRef.current, difficulty, {
      onPlayerStatsUpdate: setPlayerStats,
      onGameStatsUpdate: setGameStats,
      onLevelUp: handleLevelUp,
      onGameOver: handleGameOver,
      onEvolution: (data) => {
        setEvolutionData(data);
        gameEngineRef.current.pause();
      },
    }, upgrades, characterId, settings);

    gameEngineRef.current.start();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (gameEngineRef.current) {
        gameEngineRef.current.camera.width = canvas.width;
        gameEngineRef.current.camera.height = canvas.height;
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      gameEngineRef.current?.stop();
      gameEngineRef.current = null;
    };
  }, [difficulty, handleLevelUp, handleGameOver, upgrades, characterId, settings]);

  // Pause with Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
          gameEngineRef.current?.pause();
        } else if (gameState === 'paused') {
          setGameState('playing');
          gameEngineRef.current?.resume();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState]);

  const handleUpgradeSelected = (upgrade) => {
    gameEngineRef.current?.applyUpgrade(upgrade);
    setGameState('playing');
    gameEngineRef.current?.resume();
  };

  const handlePause = () => {
    setGameState('paused');
    gameEngineRef.current?.pause();
  };

  const handleResume = () => {
    setGameState('playing');
    gameEngineRef.current?.resume();
  };

  const handleRestart = () => {
    gameEngineRef.current?.stop();
    gameEngineRef.current = null;
    achievementRef.current = new AchievementSystem();
    setGameState('playing');
    setPlayerStats({
      hp: 100, maxHp: 100, xp: 0, xpRequired: 15, level: 1, weapons: [],
      ultimateCharge: 0, ultimateMax: 100, comboCount: 0, comboMultiplier: 1,
    });
    setGameStats({ time: 0, kills: 0, enemies: 0 });
    setAchievementToasts([]);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      gameEngineRef.current = new GameEngine(canvas, difficulty, {
        onPlayerStatsUpdate: setPlayerStats,
        onGameStatsUpdate: setGameStats,
        onLevelUp: handleLevelUp,
        onGameOver: handleGameOver,
      });
      gameEngineRef.current.start();
    }, 50);
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} className="game-canvas" />

      <HUD
        playerStats={playerStats}
        gameStats={gameStats}
        onPause={handlePause}
      />

      <AchievementToast toasts={achievementToasts} />

      {evolutionData && (
        <EvolutionScreen 
          data={evolutionData} 
          onConfirm={() => {
            setEvolutionData(null);
            gameEngineRef.current.resume();
          }} 
        />
      )}

      {/* Mini Map */}
      <MiniMap gameState={miniMapState} />

      {/* Virtual Joystick (mobile only) */}
      <VirtualJoystick inputManager={gameEngineRef.current?.inputManager} />

      {/* Achievement Toasts */}
      <AchievementToast toasts={achievementToasts} />

      {/* Mobile Ultimate Button */}
      {gameEngineRef.current?.isMobile && gameState === 'playing' && (
        <button
          className="mobile-ultimate-btn"
          style={{
            position: 'absolute',
            bottom: 40,
            right: 20,
            width: 70,
            height: 70,
            borderRadius: '50%',
            border: `3px solid ${playerStats.ultimateCharge >= (playerStats.ultimateMax || 100) ? '#00D9FF' : 'rgba(255,255,255,0.2)'}`,
            background: playerStats.ultimateCharge >= (playerStats.ultimateMax || 100)
              ? 'rgba(0, 217, 255, 0.3)' : 'rgba(0,0,0,0.4)',
            color: '#fff',
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            boxShadow: playerStats.ultimateCharge >= (playerStats.ultimateMax || 100)
              ? '0 0 20px rgba(0,217,255,0.5)' : 'none',
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (gameEngineRef.current?.inputManager) {
              gameEngineRef.current.inputManager.ultimatePressed = true;
            }
          }}
        >
          ⚡
        </button>
      )}

      {gameState === 'levelUp' && (
        <LevelUpScreen
          options={upgradeOptions}
          playerLevel={playerStats.level}
          onSelect={handleUpgradeSelected}
        />
      )}

      {gameState === 'paused' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={onGameOver}
        />
      )}

      {gameState === 'gameOver' && (
        <GameOverScreen
          stats={finalStats || gameStats}
          onRestart={handleRestart}
          onQuit={onGameOver}
        />
      )}
    </div>
  );
}

export default Game;
