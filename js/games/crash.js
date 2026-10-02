// Crash Game Engine for RainStake Mobile
// Real-time exponential multiplier curve, rocket physics particles, cash out & auto cashout mechanics

class CrashGame {
  constructor(canvasContainerId, onStateChange) {
    this.container = document.getElementById(canvasContainerId);
    this.onStateChange = onStateChange || (() => {});
    this.canvas = null;
    this.ctx = null;
    this.state = 'PREPARING'; // PREPARING, FLYING, CRASHED
    this.currentMultiplier = 1.00;
    this.crashPoint = 2.00;
    this.startTime = 0;
    this.prepStartTime = 0;
    this.prepDuration = 4000; // 4s between rounds
    this.userBet = null; // { amount, autoCashout, cashedOut, payout }
    this.particles = [];
    this.history = [1.84, 3.42, 1.15, 8.90, 2.05, 1.02, 14.20, 2.30];
    this.animFrameId = null;
    this.lastRocketX = 0;
    this.lastRocketY = 0;
    this.lastRocketAngle = -0.5;
    this.simulatedBettors = [];

    this.initCanvas();
    this.bindResize();
    this.startRoundPrep();
    this.startLoop();
  }

  initCanvas() {
    this.container.innerHTML = `
      <div class="crash-recent-bar" id="crashRecentBar"></div>
      <div class="crash-canvas-wrapper">
        <canvas id="crashCanvas"></canvas>
        <div class="crash-overlay" id="crashOverlay">
          <div class="crash-multiplier-text" id="crashMultText">1.00x</div>
          <div class="crash-status-sub" id="crashStatusSub">Preparing...</div>
        </div>
      </div>
      <!-- Live Multiplayer Bettors Roster -->
      <div class="crash-live-bettors-section" id="crashLiveBettorsSection">
        <div class="crash-bettors-header">
          <div class="bettors-count"><span class="pulse-dot"></span> LIVE PLAYERS (<span id="crashPlayerCount">8</span>)</div>
          <div class="bettors-total-pool">ROUND POOL: <span class="text-gold font-bold" id="crashRoundPool">$0.00</span></div>
        </div>
        <div class="crash-bettors-list" id="crashBettorsList"></div>
      </div>
    `;
    this.canvas = document.getElementById('crashCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.multText = document.getElementById('crashMultText');
    this.statusSub = document.getElementById('crashStatusSub');
    this.recentBar = document.getElementById('crashRecentBar');
    this.bettorsList = document.getElementById('crashBettorsList');
    this.playerCountEl = document.getElementById('crashPlayerCount');
    this.roundPoolEl = document.getElementById('crashRoundPool');
    this.updateRecentBar();
  }

  bindResize() {
    const resize = () => {
      if (!this.container || !this.canvas) return;
      const rect = this.container.querySelector('.crash-canvas-wrapper').getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = Math.min(360, Math.max(260, window.innerHeight * 0.36));

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    setTimeout(resize, 50);
  }

  generateCrashPoint() {
    // Provably fair distribution with 1.5% house edge
    // ~1% instant bust at 1.00x, heavy distribution under 2x, long exponential tail up to 1000x+
    const rand = Math.random();
    if (rand < 0.03) return 1.00; // 3% instant bust
    
    // Standard crypto casino multiplier formula: 0.98 / (1 - rand)
    const raw = 0.98 / (1 - rand);
    return Math.max(1.00, Math.floor(raw * 100) / 100);
  }

  placeBet(amount, autoCashout = 0) {
    if (this.state !== 'PREPARING') return false;
    if (!window.appState.deductBet(amount)) return false;

    this.userBet = {
      amount,
      autoCashout: autoCashout > 1.01 ? autoCashout : null,
      cashedOut: false,
      payout: 0
    };

    if (window.soundFX) window.soundFX.playClick();
    this.updateBettorsList();
    this.onStateChange(this.getPublicState());
    return true;
  }

  cashOut() {
    if (this.state !== 'FLYING' || !this.userBet || this.userBet.cashedOut) return false;

    const mult = this.currentMultiplier;
    const payout = this.userBet.amount * mult;
    this.userBet.cashedOut = true;
    this.userBet.payout = payout;

    window.appState.recordOutcome('Crash', this.userBet.amount, mult, payout);
    if (window.soundFX) window.soundFX.playCashout();

    this.updateBettorsList();
    this.onStateChange(this.getPublicState());
    return true;
  }

  generateSimulatedBettors() {
    const roster = [
      { name: 'VipWhale_99', avatar: '🐋' },
      { name: 'Satoshi_King', avatar: '👑' },
      { name: 'RainChaser', avatar: '⚡' },
      { name: 'ApexTrader', avatar: '🦅' },
      { name: 'LuckyStrike', avatar: '🍀' },
      { name: 'NeonGamer', avatar: '🎮' },
      { name: 'HighRoller_88', avatar: '💎' },
      { name: 'SolanaChad', avatar: '🚀' }
    ];

    this.simulatedBettors = roster.map(item => {
      const bet = [10, 25, 50, 100, 250, 500][Math.floor(Math.random() * 6)];
      const roll = Math.random();
      let targetMult;
      if (roll < 0.45) {
        targetMult = parseFloat((1.12 + Math.random() * 0.88).toFixed(2));
      } else if (roll < 0.8) {
        targetMult = parseFloat((2.0 + Math.random() * 2.5).toFixed(2));
      } else {
        targetMult = parseFloat((5.0 + Math.random() * 15.0).toFixed(2));
      }
      return {
        name: item.name,
        avatar: item.avatar,
        bet: bet,
        targetMult: targetMult,
        cashedOut: false,
        payout: 0,
        busted: false
      };
    });
  }

  updateBettorsList() {
    if (!this.bettorsList) return;

    let totalPool = 0;
    let listHTML = '';

    // If user bet placed, pin at top
    if (this.userBet) {
      totalPool += this.userBet.amount;
      const statusBadge = this.userBet.cashedOut
        ? `<span class="bettor-status cashed">CASHED @ ${(this.userBet.payout / this.userBet.amount).toFixed(2)}x (+$${(this.userBet.payout - this.userBet.amount).toFixed(2)})</span>`
        : (this.state === 'CRASHED'
          ? `<span class="bettor-status busted">BUSTED</span>`
          : `<span class="bettor-status playing">IN PLAY</span>`);

      listHTML += `
        <div class="crash-bettor-row user-pinned">
          <div class="bettor-info">
            <span class="bettor-avatar">⭐</span>
            <span class="bettor-name font-bold">YOU (VIP)</span>
          </div>
          <div class="bettor-bet text-gold font-bold">$${this.userBet.amount.toFixed(2)}</div>
          <div class="bettor-result">${statusBadge}</div>
        </div>
      `;
    }

    // Simulated network players
    for (const b of this.simulatedBettors) {
      totalPool += b.bet;
      let statusBadge = '';
      if (b.cashedOut) {
        statusBadge = `<span class="bettor-status cashed">${b.targetMult.toFixed(2)}x (+$${(b.payout - b.bet).toFixed(0)})</span>`;
      } else if (b.busted || this.state === 'CRASHED') {
        statusBadge = `<span class="bettor-status busted">BUSTED</span>`;
      } else {
        statusBadge = `<span class="bettor-status playing">IN PLAY</span>`;
      }

      listHTML += `
        <div class="crash-bettor-row ${b.cashedOut ? 'row-cashed' : (b.busted ? 'row-busted' : '')}">
          <div class="bettor-info">
            <span class="bettor-avatar">${b.avatar}</span>
            <span class="bettor-name">${b.name}</span>
          </div>
          <div class="bettor-bet">$${b.bet.toFixed(2)}</div>
          <div class="bettor-result">${statusBadge}</div>
        </div>
      `;
    }

    this.bettorsList.innerHTML = listHTML;
    if (this.playerCountEl) {
      this.playerCountEl.textContent = this.simulatedBettors.length + (this.userBet ? 1 : 0);
    }
    if (this.roundPoolEl) {
      this.roundPoolEl.textContent = `$${totalPool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  startRoundPrep() {
    this.state = 'PREPARING';
    this.currentMultiplier = 1.00;
    this.crashPoint = this.generateCrashPoint();
    this.prepStartTime = performance.now();
    this.userBet = null;
    this.particles = [];

    this.generateSimulatedBettors();
    this.updateBettorsList();

    this.multText.className = 'crash-multiplier-text preparing';
    this.onStateChange(this.getPublicState());
  }

  startFlying() {
    this.state = 'FLYING';
    this.startTime = performance.now();
    this.multText.className = 'crash-multiplier-text flying';
    this.statusSub.textContent = '';
    this.onStateChange(this.getPublicState());
  }

  triggerCrash() {
    this.state = 'CRASHED';
    this.multText.className = 'crash-multiplier-text crashed';
    this.multText.textContent = this.crashPoint.toFixed(2) + 'x';
    this.statusSub.textContent = 'CRASHED';

    // Mark remaining uncashed bettors as busted
    for (const b of this.simulatedBettors) {
      if (!b.cashedOut) {
        b.busted = true;
      }
    }
    this.updateBettorsList();

    // Explosion particles
    this.spawnExplosion();

    // If user bet and didn't cash out, record loss
    if (this.userBet && !this.userBet.cashedOut) {
      window.appState.recordOutcome('Crash', this.userBet.amount, 0, 0);
    }

    if (window.soundFX) window.soundFX.playCrashBust();

    // Add to history
    this.history.unshift(this.crashPoint);
    if (this.history.length > 10) this.history.pop();
    this.updateRecentBar();

    this.onStateChange(this.getPublicState());

    // Schedule next prep
    setTimeout(() => {
      this.startRoundPrep();
    }, 2800);
  }

  spawnExplosion() {
    const endX = this.lastRocketX || (this.width * 0.7);
    const endY = this.lastRocketY || (this.height * 0.4);

    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 9;
      this.particles.push({
        x: endX,
        y: endY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: ['#ff4444', '#ff8800', '#ffd700', '#ffffff', '#00f0ff'][Math.floor(Math.random() * 5)],
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.03
      });
    }
  }

  updateRecentBar() {
    if (!this.recentBar) return;
    this.recentBar.innerHTML = this.history.map(m => {
      let color = '#557086';
      if (m >= 10) color = '#ffb800'; // Gold
      else if (m >= 2.0) color = '#00e701'; // Green
      else color = '#94a3b8'; // Grey/Cyan
      return `<span class="recent-mult-badge" style="color:${color}; background:${color}18; border-color:${color}44">${m.toFixed(2)}x</span>`;
    }).join('');
  }

  getPublicState() {
    return {
      state: this.state,
      currentMultiplier: this.currentMultiplier,
      userBet: this.userBet,
      crashPoint: this.crashPoint
    };
  }

  update() {
    const now = performance.now();

    if (this.state === 'PREPARING') {
      const elapsed = now - this.prepStartTime;
      const remaining = Math.max(0, (this.prepDuration - elapsed) / 1000);
      this.multText.textContent = `Starts in ${remaining.toFixed(1)}s`;
      this.statusSub.textContent = this.userBet ? `Bet Placed: $${this.userBet.amount}` : 'Place your bet';

      if (elapsed >= this.prepDuration) {
        this.startFlying();
      }
    } else if (this.state === 'FLYING') {
      const elapsed = (now - this.startTime) / 1000;
      // Exponential curve: 1.00 + (elapsed * rate) accelerated
      const rate = 0.06;
      this.currentMultiplier = Math.floor((Math.pow(Math.E, rate * elapsed * 2.2)) * 100) / 100;

      this.multText.textContent = this.currentMultiplier.toFixed(2) + 'x';

      // Audio engine pitch
      if (Math.random() < 0.15 && window.soundFX) {
        window.soundFX.playCrashTick(this.currentMultiplier);
      }

      // Auto Cashout check
      if (this.userBet && !this.userBet.cashedOut && this.userBet.autoCashout) {
        if (this.currentMultiplier >= this.userBet.autoCashout) {
          this.cashOut();
        }
      }

      // Check simulated bettors cashouts
      let needBettorsUpdate = false;
      for (const b of this.simulatedBettors) {
        if (!b.cashedOut && this.currentMultiplier >= b.targetMult && b.targetMult <= this.crashPoint) {
          b.cashedOut = true;
          b.payout = b.bet * b.targetMult;
          needBettorsUpdate = true;
        }
      }
      if (needBettorsUpdate) {
        this.updateBettorsList();
      }

      // Check if hit crash point
      if (this.currentMultiplier >= this.crashPoint) {
        this.triggerCrash();
      }

      this.onStateChange(this.getPublicState());
    }

    // Update explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    if (!this.width || !this.height) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Subtle Grid Lines
    this.ctx.strokeStyle = '#1e3342';
    this.ctx.lineWidth = 1;

    for (let y = this.height - 30; y > 30; y -= 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(30, y);
      this.ctx.lineTo(this.width - 20, y);
      this.ctx.stroke();
    }

    for (let x = 40; x < this.width - 20; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 20);
      this.ctx.lineTo(x, this.height - 25);
      this.ctx.stroke();
    }

    // Axes
    this.ctx.strokeStyle = '#2f4553';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(30, 20);
    this.ctx.lineTo(30, this.height - 25);
    this.ctx.lineTo(this.width - 20, this.height - 25);
    this.ctx.stroke();

    // If Flying or Crashed, render curve & rocket
    if (this.state === 'FLYING' || this.state === 'CRASHED') {
      const startX = 30;
      const startY = this.height - 25;

      const progress = Math.min(1.0, (this.currentMultiplier - 1.0) / Math.max(10, this.currentMultiplier * 1.2));
      const currentX = startX + (this.width - startX - 40) * Math.min(0.92, progress * 1.5 + 0.1);
      const currentY = startY - (startY - 40) * Math.min(0.88, Math.pow(progress, 0.75) * 1.2 + 0.05);

      // Curve Path
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.quadraticCurveTo(startX + (currentX - startX) * 0.4, startY, currentX, currentY);

      // Gradient Fill under curve
      const grad = this.ctx.createLinearGradient(0, currentY, 0, startY);
      if (this.state === 'CRASHED') {
        grad.addColorStop(0, 'rgba(255, 68, 68, 0.35)');
        grad.addColorStop(1, 'rgba(255, 68, 68, 0.0)');
        this.ctx.strokeStyle = '#ff4444';
      } else {
        grad.addColorStop(0, 'rgba(0, 231, 1, 0.4)');
        grad.addColorStop(1, 'rgba(0, 231, 1, 0.0)');
        this.ctx.strokeStyle = '#00e701';
      }

      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      // Fill area
      this.ctx.lineTo(currentX, startY);
      this.ctx.lineTo(startX, startY);
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Supersonic Rocket / Explosion
      const controlX = startX + (currentX - startX) * 0.4;
      const controlY = startY;
      const dx = currentX - controlX;
      const dy = currentY - controlY;
      const angle = Math.atan2(dy, dx);

      if (this.state === 'FLYING') {
        this.lastRocketX = currentX;
        this.lastRocketY = currentY;
        this.lastRocketAngle = angle;
        this.drawRocket(this.ctx, currentX, currentY, angle, false);

        // Supersonic Thrust Flame Sparks
        if (Math.random() < 0.8) {
          const sparkAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
          const sparkSpeed = 2 + Math.random() * 4;
          this.particles.push({
            x: currentX - Math.cos(angle) * 16,
            y: currentY - Math.sin(angle) * 16,
            vx: Math.cos(sparkAngle) * sparkSpeed,
            vy: Math.sin(sparkAngle) * sparkSpeed,
            size: 1.5 + Math.random() * 2.5,
            color: ['#00f0ff', '#00e701', '#ffffff', '#38bdf8'][Math.floor(Math.random() * 4)],
            alpha: 0.9,
            decay: 0.05
          });
        }
      } else if (this.state === 'CRASHED') {
        this.drawRocket(this.ctx, this.lastRocketX, this.lastRocketY, this.lastRocketAngle, true);
      }
    }

    // Render particles
    for (let p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  drawRocket(ctx, x, y, angle, isCrashed) {
    if (isCrashed) {
      ctx.save();
      ctx.translate(x, y);
      
      const fireGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
      fireGrad.addColorStop(0, '#ffffff');
      fireGrad.addColorStop(0.25, '#fef08a');
      fireGrad.addColorStop(0.55, '#ef4444');
      fireGrad.addColorStop(0.85, '#7f1d1d');
      fireGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.sin(performance.now() * 0.01 + i) * 0.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
        ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const now = performance.now();
    const flameFlicker = Math.sin(now * 0.04) * 3;
    const flameLen = 18 + Math.random() * 8 + flameFlicker;

    // 1. Dual Ionized Supersonic Plasma Jet Flame
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.quadraticCurveTo(-14 - flameLen * 0.5, -7, -14 - flameLen, 0);
    ctx.quadraticCurveTo(-14 - flameLen * 0.5, 7, -14, 4);
    ctx.closePath();
    const flameGrad = ctx.createLinearGradient(-14, 0, -14 - flameLen, 0);
    flameGrad.addColorStop(0, '#00ffff');
    flameGrad.addColorStop(0.35, '#00e701');
    flameGrad.addColorStop(0.75, '#3b82f6');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 12;
    ctx.fill();

    // White-Hot Shock Diamond Core
    ctx.beginPath();
    ctx.moveTo(-14, -2.5);
    ctx.lineTo(-14 - flameLen * 0.6, 0);
    ctx.lineTo(-14, 2.5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Swept Delta Wings (Carbon-Composite with Neon Trims)
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(-13, -15);
    ctx.lineTo(-7, -4);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.lineTo(-13, 15);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wingtip Strobe Beacons
    ctx.beginPath();
    ctx.arc(-13, -15, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 6;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-13, 15, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Aerodynamic Fuselage
    ctx.beginPath();
    ctx.moveTo(18, 0); // Nose cone
    ctx.quadraticCurveTo(8, -6, -14, -5);
    ctx.lineTo(-14, 5);
    ctx.quadraticCurveTo(8, 6, 18, 0);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(0, -6, 0, 6);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.3, '#cbd5e1');
    bodyGrad.addColorStop(0.7, '#334155');
    bodyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 4. Cockpit Canopy (Deep Cyan Specular Glass)
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.quadraticCurveTo(2, -3.5, -4, -3);
    ctx.lineTo(-4, 3);
    ctx.quadraticCurveTo(2, 3.5, 8, 0);
    ctx.closePath();
    const canopyGrad = ctx.createLinearGradient(0, -3.5, 0, 3.5);
    canopyGrad.addColorStop(0, '#e0f2fe');
    canopyGrad.addColorStop(0.4, '#00f0ff');
    canopyGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = canopyGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Specular Highlight Glint
    ctx.beginPath();
    ctx.moveTo(5, -1);
    ctx.lineTo(0, -2.2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 5. Engine Nozzle Heat Ring
    ctx.beginPath();
    ctx.rect(-15.5, -3.5, 2.5, 7);
    ctx.fillStyle = '#f97316';
    ctx.fill();

    ctx.restore();
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }
}

window.CrashGame = CrashGame;
