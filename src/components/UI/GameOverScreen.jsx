import React, { useEffect, useState } from 'react';
import { formatTime } from '../../utils/math.js';
import Leaderboard from './Leaderboard.jsx';

function GameOverScreen({ stats, onRestart, onQuit }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    // Save score logic
    try {
      const saved = localStorage.getItem('survivor_scores');
      let scores = saved ? JSON.parse(saved) : [];
      
      const newEntry = {
        score: stats.kills * 10 + stats.level * 100 + Math.floor(stats.time),
        kills: stats.kills,
        level: stats.level,
        time: stats.time,
        wave: Math.floor(stats.time / 60) + 1,
        date: new Date().toISOString()
      };
      
      // Check if duplicate (avoid multiple saves on strict mode/remount)
      const isDuplicate = scores.some(s => 
        s.date === newEntry.date && s.score === newEntry.score
      );

      if (!isDuplicate) {
        scores.push(newEntry);
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);
        
        localStorage.setItem('survivor_scores', JSON.stringify(scores));
        
        if (scores.some(s => s.date === newEntry.date)) { // If it made it to top 10
           // Check if it's the very top score
           if (scores[0].date === newEntry.date) {
             setIsNewHighScore(true);
           }
        }
      }
    } catch (e) {
      console.error("Failed to save score", e);
    }
  }, [stats]);

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="overlay">
      <div className="overlay-title gameover">☠ GAME OVER ☠</div>
      
      {isNewHighScore && <div className="new-high-score" style={{color: '#FFD700', fontSize: '24px', marginBottom: '10px', fontWeight: 'bold'}}>🏆 NEW HIGH SCORE! 🏆</div>}

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{formatTime(stats.time)}</div>
          <div className="stat-label">Survival Time</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.kills}</div>
          <div className="stat-label">Total Kills</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.level}</div>
          <div className="stat-label">Level Reached</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {stats.time > 0 ? (stats.kills / (stats.time / 60)).toFixed(1) : '0'}
          </div>
          <div className="stat-label">Kills / Min</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#FFD700' }}>
            {stats.maxCombo || 0}x
          </div>
          <div className="stat-label">Max Combo</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#FF6600' }}>
            {stats.maxCombo >= 50 ? '💀' : stats.maxCombo >= 25 ? '🔥' : stats.maxCombo >= 10 ? '⚡' : '💥'}
          </div>
          <div className="stat-label">Best Streak</div>
        </div>
      </div>

      <div className="overlay-buttons">
        <button className="overlay-btn" onClick={onRestart}>🔄 Play Again</button>
        <button className="overlay-btn" onClick={() => setShowLeaderboard(true)}>🏆 Leaderboard</button>
        <button className="overlay-btn danger" onClick={onQuit}>✕ Main Menu</button>
      </div>
    </div>
  );
}

export default GameOverScreen;
