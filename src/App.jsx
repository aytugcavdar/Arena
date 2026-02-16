import React, { useState } from 'react';
import Menu from './components/Menu.jsx';
import Game from './components/Game.jsx';
import './styles/Game.css';

function App() {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('normal');
  const [characterId, setCharacterId] = useState('mage');
  const [upgrades, setUpgrades] = useState({});
  const [settings, setSettings] = useState({ volume: 0.5, showDamage: true, showJoystick: true });

  const startGame = (selectedDifficulty, selectedUpgrades, selectedCharId, selectedSettings) => {
    setDifficulty(selectedDifficulty || 'normal');
    setUpgrades(selectedUpgrades || {});
    setCharacterId(selectedCharId || 'mage');
    if (selectedSettings) setSettings(selectedSettings);
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="app">
      {gameState === 'menu' && <Menu onStartGame={startGame} />}
      {gameState === 'playing' && (
        <Game 
          difficulty={difficulty} 
          onGameOver={returnToMenu} 
          upgrades={upgrades}
          characterId={characterId}
          settings={settings}
        />
      )}
    </div>
  );
}

export default App;
