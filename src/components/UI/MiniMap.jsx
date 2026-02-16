import React from 'react';

function MiniMap({ gameState }) {
  if (!gameState) return null;

  const { player, enemies, worldWidth, worldHeight } = gameState;
  const mapSize = 120;
  const scaleX = mapSize / worldWidth;
  const scaleY = mapSize / worldHeight;

  const playerX = (player?.x || 0) * scaleX;
  const playerY = (player?.y || 0) * scaleY;

  const enemyDots = (enemies || []).map((e, i) => ({
    x: e.x * scaleX,
    y: e.y * scaleY,
    isBoss: e.isBoss,
    key: i,
  }));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 16,
        width: mapSize,
        height: mapSize,
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 15,
        pointerEvents: 'none',
      }}
    >
      {/* World border */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          border: '1px solid rgba(255, 0, 0, 0.2)',
        }}
      />

      {/* Enemy dots */}
      {enemyDots.map((e) => (
        <div
          key={e.key}
          style={{
            position: 'absolute',
            left: e.x - (e.isBoss ? 3 : 1),
            top: e.y - (e.isBoss ? 3 : 1),
            width: e.isBoss ? 6 : 2,
            height: e.isBoss ? 6 : 2,
            background: e.isBoss ? '#FF4444' : 'rgba(255, 80, 80, 0.7)',
            borderRadius: e.isBoss ? 0 : '50%',
            transform: e.isBoss ? 'rotate(45deg)' : 'none',
          }}
        />
      ))}

      {/* Player dot */}
      <div
        style={{
          position: 'absolute',
          left: playerX - 3,
          top: playerY - 3,
          width: 6,
          height: 6,
          background: '#00D9FF',
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(0, 217, 255, 0.8)',
        }}
      />

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          bottom: 2,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 8,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Orbitron, sans-serif',
        }}
      >
        MAP
      </div>
    </div>
  );
}

export default MiniMap;
