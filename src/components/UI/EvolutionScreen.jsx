import React from 'react';

const EvolutionScreen = ({ data, onConfirm }) => {
  return (
    <div className="evolution-overlay">
      <div className="evolution-card">
        <h1 className="evo-title">WEAPON EVOLUTION!</h1>
        <div className="evo-icon">{data.icon}</div>
        <h2 className="evo-name">{data.name}</h2>
        <button className="evo-btn" onClick={onConfirm}>EVOLVE</button>
      </div>
    </div>
  );
};

export default EvolutionScreen;
