import React from 'react';

function AchievementToast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 150,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast, i) => {
        const opacity = Math.min(1, toast.timer * 2);
        const slideY = toast.timer > 2.5 ? -(1 - (3 - toast.timer) * 2) * 20 : 0;

        return (
          <div
            key={`${toast.name}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(40, 30, 10, 0.95), rgba(60, 50, 20, 0.95))',
              border: '2px solid #FFD700',
              borderRadius: 10,
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.05)',
              opacity,
              transform: `translateY(${slideY}px)`,
              transition: 'transform 0.3s ease',
              minWidth: 280,
            }}
          >
            <div style={{
              fontSize: 28,
              lineHeight: 1,
            }}>
              🏆
            </div>
            <div>
              <div style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                color: '#FFD700',
                letterSpacing: 1,
              }}>
                {toast.icon} {toast.name}
              </div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: 2,
              }}>
                {toast.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AchievementToast;
