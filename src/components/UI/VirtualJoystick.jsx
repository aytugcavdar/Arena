import React from 'react';

function VirtualJoystick({ inputManager }) {
  if (!inputManager || !inputManager.isMobile) return null;
  if (!inputManager.joystickCenter) return null;

  const cx = inputManager.joystickCenter.x;
  const cy = inputManager.joystickCenter.y;
  const px = inputManager.joystickPos?.x || cx;
  const py = inputManager.joystickPos?.y || cy;
  const r = inputManager.joystickRadius;

  return (
    <>
      {/* Outer ring */}
      <div
        style={{
          position: 'fixed',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: '2px solid rgba(0, 217, 255, 0.4)',
          background: 'rgba(0, 217, 255, 0.08)',
          pointerEvents: 'none',
          zIndex: 200,
        }}
      />
      {/* Inner knob */}
      <div
        style={{
          position: 'fixed',
          left: px - 18,
          top: py - 18,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,217,255,0.6), rgba(0,217,255,0.2))',
          border: '2px solid rgba(0, 217, 255, 0.7)',
          boxShadow: '0 0 15px rgba(0, 217, 255, 0.4)',
          pointerEvents: 'none',
          zIndex: 201,
        }}
      />
    </>
  );
}

export default VirtualJoystick;
