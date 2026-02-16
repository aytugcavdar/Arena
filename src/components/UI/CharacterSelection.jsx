import React, { useState } from 'react';
import { CHARACTER_CONFIGS } from '../../data/characterConfigs.js';

function CharacterSelection({ onSelect, onBack }) {
  const [selectedId, setSelectedId] = useState('mage');

  const handleSelect = () => {
    onSelect(selectedId);
  };

  return (
    <div className="char-select-overlay">
      <div className="char-select-container">
        <h2>SELECT CHARACTER</h2>
        
        <div className="char-grid">
          {Object.values(CHARACTER_CONFIGS).map(char => (
            <div 
              key={char.id} 
              className={`char-card ${selectedId === char.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(char.id)}
            >
              <div className="char-icon">{char.icon}</div>
              <h3>{char.name}</h3>
              <p className="char-desc">{char.description}</p>
              
              <div className="char-stats">
                <div className="stat"><span>❤️ HP</span> <span>{char.stats.maxHp}</span></div>
                <div className="stat"><span>👟 Spd</span> <span>{char.stats.speed}</span></div>
                <div { ...char.stats.hpRegen > 0 ? {style:{color:'#4f4'}} : {}}>
                  <span>💚 Reg</span> <span>{char.stats.hpRegen}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="char-actions">
          <button className="menu-btn" onClick={onBack}>BACK</button>
          <button className="menu-btn primary" onClick={handleSelect}>START</button>
        </div>
      </div>

      <style>{`
        .char-select-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.9);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .char-select-container {
          text-align: center;
          width: 800px;
          max-width: 95%;
        }
        h2 { color: #fff; font-size: 2.5rem; margin-bottom: 30px; text-shadow: 0 0 10px #00D9FF; }
        
        .char-grid {
          display: flex; justify-content: center; gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        
        .char-card {
          background: #1a1a2e;
          border: 2px solid #336;
          border-radius: 12px;
          padding: 20px;
          width: 250px;
          cursor: pointer;
          transition: 0.2s;
          position: relative;
        }
        
        .char-card:hover { transform: translateY(-5px); border-color: #666; }
        .char-card.selected { border-color: #00D9FF; box-shadow: 0 0 20px rgba(0, 217, 255, 0.4); background: #252540; }
        
        .char-icon { font-size: 4rem; margin-bottom: 10px; }
        .char-card h3 { color: #fff; margin: 0 0 5px 0; }
        .char-desc { color: #aaa; font-size: 0.9rem; margin-bottom: 15px; height: 40px; }
        
        .char-stats {
          background: rgba(0,0,0,0.3);
          padding: 10px;
          border-radius: 8px;
        }
        .stat { display: flex; justify-content: space-between; color: #ccc; font-size: 0.9rem; margin-bottom: 4px; }
        
        .char-actions { display: flex; justify-content: center; gap: 20px; }
        .menu-btn {
          padding: 12px 30px; font-size: 1.2rem; cursor: pointer;
          background: transparent; border: 2px solid #666; color: #fff;
          border-radius: 4px; text-transform: uppercase; font-weight: bold;
          transition: 0.2s;
        }
        .menu-btn:hover { background: #333; }
        .menu-btn.primary { border-color: #00D9FF; background: rgba(0, 217, 255, 0.1); }
        .menu-btn.primary:hover { background: #00D9FF; color: #000; }
      `}</style>
    </div>
  );
}

export default CharacterSelection;
