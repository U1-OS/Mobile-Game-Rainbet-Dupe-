// Procedural Web Audio API Sound Synthesizer for RainStake
// Zero external asset dependencies, zero latency, ultra lightweight

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.hapticsEnabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  vibrate(ms = 30) {
    if (this.hapticsEnabled && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(ms);
      } catch (e) {}
    }
  }

  // Soft UI click
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Plinko peg strike (pitch rises slightly on deeper rows)
  playPlinkoPeg(pitchFactor = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 520 * (0.8 + pitchFactor * 0.5);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.035);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
    this.vibrate(8);
  }

  // Plinko bucket landing
  playPlinkoWin(multiplier = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (multiplier >= 10) {
      // Big win fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
      this.vibrate([40, 30, 40, 80]);
    } else if (multiplier >= 2) {
      // Nice win chime
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
      this.vibrate(25);
    } else {
      // Minor hit
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  }

  // Crash rocket engine tone (frequency rises with multiplier)
  playCrashTick(mult = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = Math.min(1800, 180 + Math.log(mult + 0.1) * 280);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Crash bust / explosion
  playCrashBust() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Noise buffer for explosion
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    this.vibrate([80, 50, 120]);
  }

  // Cash out sound (rich ascending chords)
  playCashout() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.35);
    });
    this.vibrate([20, 20, 60]);
  }

  // Mines - diamond found
  playDiamond(step = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 600 + Math.min(step * 60, 1000);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
    this.vibrate(30);
  }

  // Mines - bomb hit
  playBomb() {
    this.playCrashBust();
  }

  // Dice roll rattle
  playDiceRoll() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 6; i++) {
      const time = now + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(400 + Math.random() * 400, time);
      gain.gain.setValueAtTime(0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.03);
    }
    this.vibrate(20);
  }

  // Dice win
  playDiceWin() {
    this.playCashout();
  }

  // Dice loss
  playDiceLoss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.2);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
    this.vibrate(50);
  }

  // Slot Reel Spin tick
  playSpinTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // Slot Reel Spin Whir / Start
  playSlotSpin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
    this.vibrate(20);
  }

  // Big / Mega Win Fanfare
  playMegaWin() {
    this.playSlotWin(true);
  }

  // Slot Win
  playSlotWin(isBig = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const chords = isBig 
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51] 
      : [440.00, 554.37, 659.25];

    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + (isBig ? 0.5 : 0.25));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + (isBig ? 0.5 : 0.25));
    });
    this.vibrate(isBig ? [50, 30, 80, 40, 120] : 40);
  }

  // Rain start shower
  playRainStart() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Shimmering chimes
    [880, 987.77, 1174.66, 1318.51, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
    this.vibrate([30, 20, 40]);
  }

  // Rain Claimed
  playRainClaim() {
    this.playCashout();
  }

  // Level Up
  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.14, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
    this.vibrate([50, 30, 60, 30, 100]);
  }

  // Card Dealing swoosh sound
  playCardDeal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Filtered noise swoosh
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.07);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    this.vibrate(8);
  }

  // Card Flip / Snap sound
  playCardFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
    this.vibrate(10);
  }

  // Casino clay chip clink
  playChipClink() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1600, 2400].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.015);
      gain.gain.setValueAtTime(0.07, now + i * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.015 + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.015);
      osc.stop(now + i * 0.015 + 0.04);
    });
    this.vibrate(12);
  }

  // Roulette ball rolling & rattling across fret numbers
  playRouletteRattle(speed = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 * speed, now);
    osc.frequency.exponentialRampToValueAtTime(400 * speed, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
    this.vibrate(6);
  }

  // Slot scatter tease (anticipation when 2 scatters land waiting for the 3rd)
  playSlotScatterTease() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + i * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500 + i * 80, time);
      gain.gain.setValueAtTime(0.09, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.07);
    }
    this.vibrate([15, 40, 15, 40, 15, 40]);
  }

  // Big Win Fanfare with celebratory coin shower
  playBigWinFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, t: 0.00, d: 0.15 }, // C5
      { f: 659.25, t: 0.12, d: 0.15 }, // E5
      { f: 783.99, t: 0.24, d: 0.15 }, // G5
      { f: 1046.5, t: 0.36, d: 0.40 }, // C6
      { f: 880.00, t: 0.50, d: 0.20 }, // A5
      { f: 1046.5, t: 0.70, d: 0.50 }  // C6 hold
    ];
    fanfare.forEach(item => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now + item.t);
      gain.gain.setValueAtTime(0.18, now + item.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + item.t);
      osc.stop(now + item.t + item.d);
    });
    this.vibrate([60, 40, 80, 40, 120, 60, 200]);
  }

  // Lightning Link: Thunder Crack
  playThunder() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Filtered noise burst
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
    this.vibrate([80, 50, 120]);
  }

  // Lightning Link: Orb Landed and Locked
  playOrbLock(isJackpot = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep punchy bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isJackpot ? 220 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // High electrical shimmer chime
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(isJackpot ? 1200 : 880, now);
    chime.frequency.exponentialRampToValueAtTime(isJackpot ? 1800 : 1320, now + 0.18);
    chimeGain.gain.setValueAtTime(0.15, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chime.start(now);
    chime.stop(now + 0.2);

    this.vibrate(isJackpot ? [60, 40, 80] : 45);
  }

  // Lightning Link: Hold & Spin Trigger Siren
  playHoldAndSpinTrigger() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Siren alarm chord sequence
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.1;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.25);
    });

    this.vibrate([100, 50, 150, 50, 200]);
  }

  // Gates of Olympus: Tumble drop cascade
  playTumble() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Gates of Olympus: Zeus Lightning Strike & Multiplier Drop
  playZeusStrike() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Thunder boom + high voltage zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Laser zap
    const zap = this.ctx.createOscillator();
    const zapGain = this.ctx.createGain();
    zap.type = 'sine';
    zap.frequency.setValueAtTime(2400, now);
    zap.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    zapGain.gain.setValueAtTime(0.2, now);
    zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    zap.connect(zapGain);
    zapGain.connect(this.ctx.destination);
    zap.start(now);
    zap.stop(now + 0.2);

    this.vibrate([60, 40, 120]);
  }
}

window.soundFX = new SoundFX();
