import React, { useState, useEffect } from 'react';

const UPGRADES = [
  { id: 'might', name: 'Might', description: '+5% Damage', baseCost: 100, costMult: 1.5, stat: 'damage', perLevel: 0.05, maxLevel: 10, icon: '⚔️' },
  { id: 'armor', name: 'Armor', description: '+1 Armor', baseCost: 150, costMult: 1.5, stat: 'armor', perLevel: 1, maxLevel: 5, icon: '🛡️' },
  { id: 'recovery', name: 'Recovery', description: '+0.1 HP/s', baseCost: 200, costMult: 1.5, stat: 'recovery', perLevel: 0.1, maxLevel: 10, icon: '💚' },
  { id: 'greed', name: 'Greed', description: '+10% Gold', baseCost: 250, costMult: 1.5, stat: 'greed', perLevel: 0.1, maxLevel: 10, icon: '💰' },
  { id: 'speed', name: 'Haste', description: '+5% Move Speed', baseCost: 120, costMult: 1.5, stat: 'speed', perLevel: 0.05, maxLevel: 5, icon: '👟' },
];

function Shop({ onClose, globalState, setGlobalState }) {
  const [gold, setGold] = useState(globalState.gold || 0);
  const [upgrades, setUpgrades] = useState(globalState.upgrades || {});

  const buyUpgrade = (u) => {
    const currentLevel = upgrades[u.id] || 0;
    if (currentLevel >= u.maxLevel) return;

    const cost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLevel));
    if (gold >= cost) {
      const newGold = gold - cost;
      const newUpgrades = { ...upgrades, [u.id]: currentLevel + 1 };
      
      setGold(newGold);
      setUpgrades(newUpgrades);
      
      // Persist
      const newState = { ...globalState, gold: newGold, upgrades: newUpgrades };
      setGlobalState(newState); // Parent state update
      localStorage.setItem('survivor_progression', JSON.stringify(newState));
    }
  };

  return (
    <div className="shop-overlay">
      <div className="shop-container">
        <div className="shop-header">
          <h2>MERCHANT</h2>
          <div className="shop-gold">💰 {gold}</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="shop-grid">
          {UPGRADES.map(u => {
            const level = upgrades[u.id] || 0;
            const cost = Math.floor(u.baseCost * Math.pow(u.costMult, level));
            const isMax = level >= u.maxLevel;
            const canAfford = gold >= cost && !isMax;

            return (
              <div key={u.id} className={`shop-item ${isMax ? 'maxed' : ''} ${!canAfford && !isMax ? 'locked' : ''}`}>
                <div className="item-icon">{u.icon}</div>
                <div className="item-info">
                  <h3>{u.name} <span className="item-level">Lvl {level}/{u.maxLevel}</span></h3>
                  <p>{u.description}</p>
                </div>
                <button 
                  className="buy-btn" 
                  onClick={() => buyUpgrade(u)}
                  disabled={!canAfford && !isMax}
                >
                  {isMax ? 'MAX' : `💰 ${cost}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .shop-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.85);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .shop-container {
          background: #1a1a2e;
          width: 800px;
          max-width: 90%;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #00D9FF;
          box-shadow: 0 0 30px rgba(0, 217, 255, 0.2);
        }
        .shop-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
        }
        .shop-header h2 { color: #00D9FF; margin: 0; font-size: 2rem; }
        .shop-gold { font-size: 1.5rem; color: #FFD700; font-weight: bold; }
        .close-btn { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }
        
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 15px;
        }
        .shop-item {
          background: #252540;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #336;
          transition: 0.2s;
        }
        .shop-item:hover { border-color: #00D9FF; }
        .item-icon { font-size: 2.5rem; }
        .item-info { flex: 1; }
        .item-info h3 { margin: 0; color: #eee; font-size: 1.1rem; }
        .item-level { font-size: 0.8rem; color: #aaa; margin-left: 5px; }
        .item-info p { margin: 5px 0 0; color: #888; font-size: 0.9rem; }
        .buy-btn {
          background: #FFD700; color: #000; border: none;
          padding: 8px 16px; border-radius: 4px; font-weight: bold;
          cursor: pointer; min-width: 80px;
        }
        .buy-btn:disabled { background: #555; color: #888; cursor: not-allowed; }
        .maxed .buy-btn { background: #00D9FF; color: #fff; }
      `}</style>
    </div>
  );
}

export default Shop;
