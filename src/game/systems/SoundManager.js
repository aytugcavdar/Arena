export class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterVolume = 0.3;
    this.muted = false;
    this.initialized = false;
    
    // Resume context on first user interaction
    const resume = () => {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.initialized = true;
      window.removeEventListener('click', resume);
      window.removeEventListener('keydown', resume);
      window.removeEventListener('touchstart', resume);
    };
    window.addEventListener('click', resume);
    window.addEventListener('keydown', resume);
    window.addEventListener('touchstart', resume);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  play(type) {
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case 'shoot':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400 + Math.random() * 200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.1 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'hit':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.1 * this.masterVolume, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'kill':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.15 * this.masterVolume, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'xp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(0.05 * this.masterVolume, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'levelup':
        this.playChord([523.25, 659.25, 783.99, 1046.50], 0.4); // C Major
        break;

      case 'chest':
        this.playChord([523.25, 783.99, 1046.50, 1567.98], 0.8, 'square'); 
        break;

      case 'evolution':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(800, t + 1.0);
        gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
        gain.gain.linearRampToValueAtTime(0, t + 1.0);
        osc.start(t);
        osc.stop(t + 1.0);
        // Tremolo
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 15;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(t);
        lfo.stop(t + 1.0);
        break;

      case 'boss':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 2.0);
        gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
        gain.gain.linearRampToValueAtTime(0, t + 2.0);
        osc.start(t);
        osc.stop(t + 2.0);
        break;
        
      case 'combo':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
        gain.gain.setValueAtTime(0.1 * this.masterVolume, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
    }
  }

  playChord(freqs, duration, type = 'sine') {
    const t = this.ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      gain.gain.setValueAtTime(0.1 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration + i * 0.1);
      osc.start(t + i * 0.05);
      osc.stop(t + duration + i * 0.1 + 0.1);
    });
  }
}
