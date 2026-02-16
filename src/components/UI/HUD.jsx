import React from 'react';
import { formatTime } from '../../utils/math.js';

function HUD({ playerStats, gameStats, onPause }) {
  const hpPercent = Math.max(0, (playerStats.hp / playerStats.maxHp) * 100);
  const xpPercent = (playerStats.xp / playerStats.xpRequired) * 100;
  const ultPercent = ((playerStats.ultimateCharge || 0) / (playerStats.ultimateMax || 100)) * 100;
  const ultReady = ultPercent >= 100;

  return (
    <>
      <div className="hud">
        <div className="hud-top">
          <div className="hud-left">
            <div className="hp-bar-container">
              <div className="hp-bar" style={{ width: `${hpPercent}%` }} />
              <span className="hp-text">
                {Math.ceil(playerStats.hp)} / {playerStats.maxHp}
              </span>
            </div>

            {/* Ultimate bar */}
            <div className="ult-bar-container">
              <div
                className={`ult-bar ${ultReady ? 'ult-ready' : ''}`}
                style={{ width: `${Math.min(100, ultPercent)}%` }}
              />
              <span className="ult-text">
                {ultReady ? '⚡ READY' : `⚡ ${Math.floor(ultPercent)}%`}
              </span>
            </div>

            <div className="level-badge">⭐ Level {playerStats.level}</div>
            <div className="weapons-list">
              {(playerStats.weapons || []).map((w, i) => (
                <div key={i} className="weapon-icon" title={`${w.name} Lv${w.level}`}>
                  {w.icon}
                  <span className="weapon-level">{w.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hud-center">
            <div className="timer">{formatTime(gameStats.time)}</div>
          </div>

          <div className="hud-right">
            <div className="kills">💀 {gameStats.kills}</div>
            <div className="enemies-count">{gameStats.enemies} enemies</div>
            <button className="pause-btn" onClick={onPause}>⏸ Pause</button>
          </div>
        </div>
      </div>

      <div className="xp-bar-container">
        <div className="xp-bar" style={{ width: `${xpPercent}%` }} />
      </div>
    </>
  );
}

export default HUD;
