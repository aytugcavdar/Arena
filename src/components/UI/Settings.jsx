import React, { useState, useEffect } from 'react';

function Settings({ onClose, settings, onUpdate }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const toggle = (key) => {
    const newVal = !localSettings[key];
    const newSettings = { ...localSettings, [key]: newVal };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    const newSettings = { ...localSettings, volume: val };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        <h2>SETTINGS</h2>

        <div className="setting-row">
          <label>Master Volume</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={localSettings.volume} 
            onChange={handleVolume} 
          />
          <span>{Math.round(localSettings.volume * 100)}%</span>
        </div>

        <div className="setting-row">
          <label>Show Damage Numbers</label>
          <button 
            className={`toggle-btn ${localSettings.showDamage ? 'active' : ''}`}
            onClick={() => toggle('showDamage')}
          >
            {localSettings.showDamage ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="setting-row">
          <label>Show Joystick (Mobile)</label>
          <button 
            className={`toggle-btn ${localSettings.showJoystick ? 'active' : ''}`}
            onClick={() => toggle('showJoystick')}
          >
            {localSettings.showJoystick ? 'ON' : 'OFF'}
          </button>
        </div>

        <button className="menu-btn primary" onClick={onClose} style={{marginTop: '20px'}}>CLOSE</button>
      </div>

      <style>{`
        .settings-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex; justify-content: center; align-items: center;
          z-index: 1100;
        }
        .settings-container {
          background: #1a1a2e;
          padding: 30px;
          border-radius: 12px;
          border: 2px solid #00D9FF;
          width: 400px;
          text-align: center;
        }
        .setting-row {
          display: flex; justify-content: space-between; align-items: center;
          margin: 20px 0;
          color: #eee;
        }
        .toggle-btn {
          background: #333; color: #aaa; border: 1px solid #555;
          padding: 5px 15px; border-radius: 4px; cursor: pointer; width: 60px;
        }
        .toggle-btn.active {
          background: #00D9FF; color: #000; border-color: #00D9FF; font-weight: bold;
        }
        input[type=range] { flex: 1; margin: 0 15px; }
      `}</style>
    </div>
  );
}

export default Settings;
