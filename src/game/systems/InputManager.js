export class InputManager {
  constructor() {
    this.keys = {};
    this.touchActive = false;
    this.touchVx = 0;
    this.touchVy = 0;
    this.joystickCenter = null; // { x, y }
    this.joystickPos = null;    // { x, y } current touch
    this.joystickRadius = 60;
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Ultimate button
    this.ultimatePressed = false;
    
    // Dash button
    this.dashPressed = false;

    this.initEventListeners();
  }

  initEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch
    if (this.isMobile) {
      window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      window.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const x = touch.clientX;
      const y = touch.clientY;
      const screenW = window.innerWidth;

      // Left half = joystick
      if (x < screenW * 0.5) {
        this.touchActive = true;
        this.joystickCenter = { x, y };
        this.joystickPos = { x, y };
        this.joystickTouchId = touch.identifier;
      }

      // Right half = ultimate trigger area (bottom right)
      if (x > screenW * 0.7 && y > window.innerHeight * 0.6) {
        if (y > window.innerHeight * 0.8) {
           this.ultimatePressed = true;
        } else {
           this.dashPressed = true; // Above ultimate is dash
        }
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.joystickTouchId && this.joystickCenter) {
        this.joystickPos = { x: touch.clientX, y: touch.clientY };

        const dx = this.joystickPos.x - this.joystickCenter.x;
        const dy = this.joystickPos.y - this.joystickCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.joystickRadius;

        if (dist > 0) {
          const clampedDist = Math.min(dist, maxDist);
          this.touchVx = (dx / dist) * (clampedDist / maxDist);
          this.touchVy = (dy / dist) * (clampedDist / maxDist);

          // Clamp joystick visual position
          if (dist > maxDist) {
            this.joystickPos = {
              x: this.joystickCenter.x + (dx / dist) * maxDist,
              y: this.joystickCenter.y + (dy / dist) * maxDist,
            };
          }
        }
      }
    }
  }

  handleTouchEnd(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.joystickTouchId) {
        this.touchActive = false;
        this.touchVx = 0;
        this.touchVy = 0;
        this.joystickCenter = null;
        this.joystickPos = null;
        this.joystickTouchId = null;
      }
    }
  }

  getMovement() {
    // Mobile touch takes priority
    if (this.touchActive) {
      return { vx: this.touchVx, vy: this.touchVy };
    }

    // Keyboard
    let vx = 0;
    let vy = 0;
    if (this.keys['w'] || this.keys['arrowup']) vy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) vy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) vx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) vx += 1;

    // Normalize
    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;
    }

    return { vx, vy };
  }

  consumeUltimate() {
    if (this.ultimatePressed || this.keys[' ']) { // Space for Ultimate
      this.ultimatePressed = false;
      this.keys[' '] = false;
      return true;
    }
    return false;
  }

  consumeDash() {
    if (this.dashPressed || this.keys['shift']) { // Shift for Dash
      this.dashPressed = false;
      this.keys['shift'] = false; // Consume key
      return true;
    }
    return false;
  }

  update() {}

  isKeyPressed(key) {
    return this.keys[key] === true;
  }

  destroy() {}
}
