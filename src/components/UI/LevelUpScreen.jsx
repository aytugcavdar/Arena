import React from 'react';

function LevelUpScreen({ options, playerLevel, onSelect }) {
  return (
    <div className="overlay">
      <div className="levelup-title">⬆ LEVEL UP! ⬆</div>
      <div className="levelup-subtitle">Level {playerLevel} — Choose an upgrade</div>
      <div className="upgrade-cards">
        {options.map((option, idx) => (
          <div
            key={idx}
            className="upgrade-card"
            onClick={() => onSelect(option)}
          >
            <div className="upgrade-icon">{option.icon}</div>
            <div className="upgrade-name">{option.name}</div>
            <div className="upgrade-desc">{option.description}</div>
            {option.level && (
              <div className="upgrade-level">Lv {option.level}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LevelUpScreen;
