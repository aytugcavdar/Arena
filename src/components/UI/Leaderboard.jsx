import React, { useState, useEffect } from 'react';

const Leaderboard = ({ onClose }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('survivor_scores');
    if (saved) {
      setScores(JSON.parse(saved).sort((a, b) => b.score - a.score).slice(0, 10));
    }
  }, []);

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-container">
        <h2>🏆 HALL OF FAME</h2>
        
        <div className="scores-list">
          {scores.length === 0 ? (
            <div className="no-scores">No records yet. Be the first!</div>
          ) : (
            scores.map((entry, index) => (
              <div key={index} className={`score-row ${index < 3 ? 'top-3' : ''}`}>
                <div className="rank">#{index + 1}</div>
                <div className="score-details">
                  <span className="sc-val">{entry.score.toLocaleString()}</span>
                  <span className="sc-info">
                    Wave {entry.wave} • {entry.kills} Kills • {Math.floor(entry.time/60)}m {Math.floor(entry.time%60)}s
                  </span>
                </div>
                {index === 0 && <div className="medal">👑</div>}
              </div>
            ))
          )}
        </div>

        <button className="close-btn" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
};

export default Leaderboard;
