import React from 'react';

function PauseMenu({ onResume, onRestart, onQuit }) {
  return (
    <div className="overlay">
      <div className="overlay-title">⏸ PAUSED</div>
      <div className="overlay-buttons">
        <button className="overlay-btn" onClick={onResume}>▶ Resume</button>
        <button className="overlay-btn" onClick={onRestart}>🔄 Restart</button>
        <button className="overlay-btn danger" onClick={onQuit}>✕ Quit</button>
      </div>
    </div>
  );
}

export default PauseMenu;
