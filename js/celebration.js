// Next-Gen Celebration & Big Win Particle Engine for RainStake Mobile
// Replicates high-end Stake / Pragmatic / Aristocrat celebration FX:
// - 3D Tumbling Gold Coins with lighting & shadow
// - Neon Confetti Ribbons & Plasma Star Sparks
// - Animated Roll-Up Number Ticker with exponential easing
// - Multi-tier classification: BIG WIN (5x-19x), MEGA WIN (20x-49x), GRAND JACKPOT (50x+)
// - Haptic & Web Audio synthesis synchronization

class CelebrationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.overlay = null;
    this.particles = [];
    this.animId = null;
    this.isRunning = false;
    this.activeTicker = null;

    if (typeof document !== 'undefined' && document.getElementById) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }
  }

  init() {
    // 1. Setup Canvas
    this.canvas = document.getElementById('celebrationCanvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
    }
    if (this.canvas && this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('resize', () => this.resize());
      }
    }

    // 2. Setup Overlay HUD for Big Win Banner
    this.overlay = document.getElementById('celebrationOverlay');
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'celebrationOverlay';
      this.overlay.className = 'celebration-overlay';
      this.overlay.style.display = 'none';
      this.overlay.innerHTML = `
        <div class="celebration-backdrop" id="celebBackdrop"></div>
        <div class="celebration-card" id="celebCard">
          <div class="celeb-rays" id="celebRays"></div>
          <div class="celeb-badge" id="celebTierBadge">BIG WIN</div>
          <div class="celeb-title" id="celebTitle">CONGRATULATIONS!</div>
          <div class="celeb-amount" id="celebAmount">$0.00</div>
          <div class="celeb-mult" id="celebMult">10.00x MULTIPLIER</div>
          <button class="celeb-dismiss-btn" id="celebDismissBtn">COLLECT & CONTINUE</button>
        </div>
      `;
      document.body.appendChild(this.overlay);

      const dismissBtn = document.getElementById('celebDismissBtn');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => this.dismiss());
      }
      const backdrop = document.getElementById('celebBackdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => this.dismiss());
      }
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  triggerWin(amount, multiplier = 1, gameName = 'Game') {
    if (multiplier < 5.0 && amount < 100) return; // Only trigger for notable hits

    let tier = 'BIG WIN';
    let tierClass = 'tier-big';
    let coinCount = 60;
    let durationMs = 4500;

    if (multiplier >= 50.0 || amount >= 5000) {
      tier = 'GRAND JACKPOT';
      tierClass = 'tier-jackpot';
      coinCount = 140;
      durationMs = 6500;
    } else if (multiplier >= 20.0 || amount >= 1000) {
      tier = 'MEGA WIN';
      tierClass = 'tier-mega';
      coinCount = 95;
      durationMs = 5200;
    }

    this.showOverlay(tier, tierClass, amount, multiplier, gameName, durationMs);
    this.spawnParticles(coinCount, tier);

    // Audio & Haptic triggers
    if (window.soundFX) {
      if (tier === 'GRAND JACKPOT' && window.soundFX.playHoldAndSpinTrigger) {
        window.soundFX.playHoldAndSpinTrigger();
      } else if (window.soundFX.playSlotWin) {
        window.soundFX.playSlotWin(amount);
      }
    }
  }

  showOverlay(tierText, tierClass, targetAmount, multiplier, gameName, durationMs) {
    if (!this.overlay) return;

    const card = document.getElementById('celebCard');
    const badge = document.getElementById('celebTierBadge');
    const title = document.getElementById('celebTitle');
    const amountEl = document.getElementById('celebAmount');
    const multEl = document.getElementById('celebMult');

    if (card) {
      card.className = `celebration-card ${tierClass}`;
    }
    if (badge) badge.textContent = tierText;
    if (title) title.textContent = `${gameName.toUpperCase()}`;
    if (multEl) multEl.textContent = `${multiplier.toFixed(2)}x MULTIPLIER`;

    this.overlay.style.display = 'flex';
    this.overlay.classList.add('visible');

    // Roll-up counter animation
    if (this.activeTicker) clearInterval(this.activeTicker);
    const startVal = 0;
    const endVal = targetAmount;
    const startTime = performance.now();
    const countDuration = 2200;

    const updateCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / countDuration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;

      if (amountEl) {
        amountEl.textContent = `$${current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      if (progress < 1 && this.overlay.classList.contains('visible')) {
        requestAnimationFrame(updateCounter);
      } else if (amountEl) {
        amountEl.textContent = `$${endVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    };
    requestAnimationFrame(updateCounter);

    // Auto dismiss after duration
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.dismissTimer = setTimeout(() => {
      this.dismiss();
    }, durationMs);
  }

  dismiss() {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
      this.overlay.style.display = 'none';
    }
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
  }

  spawnParticles(count, tier) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < count; i++) {
      // Half 3D Coins, half Neon Confetti / Sparkles
      const isCoin = Math.random() < 0.55;
      const angle = (Math.random() * Math.PI * 2);
      const speed = isCoin ? (6 + Math.random() * 14) : (8 + Math.random() * 18);
      const life = 180 + Math.random() * 120;

      this.particles.push({
        type: isCoin ? 'coin' : (Math.random() < 0.5 ? 'confetti' : 'star'),
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isCoin ? 7 : 9), // upward fountain bias
        gravity: isCoin ? 0.38 : 0.22,
        drag: isCoin ? 0.985 : 0.965,
        radius: isCoin ? (10 + Math.random() * 7) : (6 + Math.random() * 5),
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.25,
        vRotY: (Math.random() - 0.5) * 0.25,
        life: life,
        maxLife: life,
        color: this.pickColor(tier)
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  pickColor(tier) {
    const palette = [
      '#ffd700', // Gold
      '#00f0ff', // Cyan
      '#a855f7', // Purple
      '#ff007a', // Hot Pink
      '#00e701', // Neon Green
      '#ffffff'  // Silver White
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  loop() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotX += p.vRotX;
      p.rotY += p.vRotY;
      p.life--;

      const alpha = Math.min(1, p.life / 30);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.globalAlpha = alpha;

      if (p.type === 'coin') {
        this.renderCoin(p);
      } else if (p.type === 'confetti') {
        this.renderConfetti(p);
      } else {
        this.renderStar(p);
      }

      this.ctx.restore();

      if (p.life <= 0 || p.y > this.canvas.height + 60) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.isRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  renderCoin(p) {
    const scaleX = Math.cos(p.rotY);
    const r = p.radius;

    this.ctx.scale(scaleX, 1);

    // Coin 3D Outer Edge
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    const goldGrad = this.ctx.createLinearGradient(-r, -r, r, r);
    goldGrad.addColorStop(0, '#ffe066');
    goldGrad.addColorStop(0.3, '#ffcc00');
    goldGrad.addColorStop(0.7, '#d48800');
    goldGrad.addColorStop(1, '#945b00');
    this.ctx.fillStyle = goldGrad;
    this.ctx.fill();

    // Inner Emboss Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.stroke();

    // Dollar / Rain Symbol in Center
    this.ctx.fillStyle = '#6b4000';
    this.ctx.font = `900 ${r * 0.9}px Inter, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('$', 0, 1);
  }

  renderConfetti(p) {
    const w = p.radius * 2;
    const h = p.radius * 0.9;
    this.ctx.rotate(p.rotX);
    this.ctx.fillStyle = p.color;
    this.ctx.fillRect(-w / 2, -h / 2, w, h);
  }

  renderStar(p) {
    const r = p.radius;
    this.ctx.rotate(p.rotX);
    this.ctx.fillStyle = p.color;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -r);
    this.ctx.quadraticCurveTo(0, 0, r, 0);
    this.ctx.quadraticCurveTo(0, 0, 0, r);
    this.ctx.quadraticCurveTo(0, 0, -r, 0);
    this.ctx.quadraticCurveTo(0, 0, 0, -r);
    this.ctx.fill();
  }
}

window.celebrationEngine = new CelebrationEngine();
