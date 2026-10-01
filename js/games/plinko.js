// Plinko Canvas Physics Engine for RainStake Mobile
// Real-time ball-peg collision physics, authentic multiplier payouts, multi-ball cascades

const PLINKO_PAYOUTS = {
  8: {
    low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29]
  },
  10: {
    low: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    medium: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    high: [76, 10, 3, 1.4, 0.3, 0.2, 0.3, 1.4, 3, 10, 76]
  },
  12: {
    low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170]
  },
  14: {
    low: [15, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 15],
    medium: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    high: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420]
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
  }
};

class PlinkoGame {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.canvas = null;
    this.ctx = null;
    this.rows = 16;
    this.risk = 'high';
    this.balls = [];
    this.pegs = [];
    this.buckets = [];
    this.bucketAnimations = [];
    this.recentHits = [];
    this.autoDropInterval = null;
    this.isAutoDropping = false;
    this.betAmount = 10;
    this.animFrameId = null;

    this.initCanvas();
    this.setupGeometry();
    this.bindResize();
    this.startLoop();
  }

  initCanvas() {
    this.container.innerHTML = `
      <div class="plinko-recent-bar" id="plinkoRecentBar"></div>
      <canvas id="plinkoCanvas"></canvas>
    `;
    this.canvas = document.getElementById('plinkoCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.recentBar = document.getElementById('plinkoRecentBar');
  }

  bindResize() {
    const resize = () => {
      if (!this.container || !this.canvas) return;
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = Math.min(520, Math.max(380, window.innerHeight * 0.52));
      
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.setupGeometry();
    };

    window.addEventListener('resize', resize);
    resize();
  }

  setRows(rows) {
    this.rows = parseInt(rows, 10);
    this.setupGeometry();
  }

  setRisk(risk) {
    this.risk = risk;
    this.setupGeometry();
  }

  getMultipliers() {
    const rowTable = PLINKO_PAYOUTS[this.rows] || PLINKO_PAYOUTS[16];
    return rowTable[this.risk] || rowTable['medium'];
  }

  getMultiplierColor(mult, maxMult) {
    if (mult >= 100) return '#ff1744'; // deep bright red
    if (mult >= 20) return '#ff5252';  // red-orange
    if (mult >= 5) return '#ff9100';   // amber
    if (mult >= 2) return '#ffd600';   // yellow-gold
    if (mult >= 1) return '#00e676';   // green
    return '#455a64';                 // grey for below 1x
  }

  setupGeometry() {
    if (!this.width || !this.height) return;

    this.pegs = [];
    this.buckets = [];
    const multipliers = this.getMultipliers();
    const bucketCount = multipliers.length;

    // Margins and spacing
    const topMargin = 40;
    const bottomMargin = 48;
    const availableHeight = this.height - topMargin - bottomMargin;
    const rowSpacing = availableHeight / (this.rows + 1);

    // Dynamic peg radius
    this.pegRadius = Math.max(2.5, Math.min(4.5, (this.width / this.rows) * 0.12));
    this.ballRadius = Math.max(3.8, Math.min(6.5, this.pegRadius * 1.55));

    // Construct Pegs Pyramid
    // Top row (row 0) has 3 pegs, bottom row (row N-1) has N+2 pegs
    for (let r = 0; r < this.rows; r++) {
      const pegCountInRow = r + 3;
      const rowWidth = (this.width * 0.88) * ((r + 2) / (this.rows + 2));
      const startX = (this.width - rowWidth) / 2;
      const pegSpacing = rowWidth / (pegCountInRow - 1);
      const y = topMargin + (r + 1) * rowSpacing;

      for (let c = 0; c < pegCountInRow; c++) {
        const x = startX + c * pegSpacing;
        this.pegs.push({
          x,
          y,
          row: r,
          radius: this.pegRadius,
          hitGlow: 0
        });
      }
    }

    // Construct Bottom Multiplier Buckets
    const lastRowWidth = this.width * 0.94;
    const bucketStartX = (this.width - lastRowWidth) / 2;
    const bucketWidth = lastRowWidth / bucketCount;
    const bucketY = this.height - 38;

    for (let i = 0; i < bucketCount; i++) {
      this.buckets.push({
        index: i,
        multiplier: multipliers[i],
        x: bucketStartX + i * bucketWidth,
        y: bucketY,
        width: bucketWidth - 2,
        height: 24,
        animOffset: 0
      });
    }

    this.bucketAnimations = new Array(bucketCount).fill(0);
  }

  dropBall(betAmount) {
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    const startX = this.width / 2 + (Math.random() - 0.5) * 8;
    const startY = 15;

    // Pick dynamic vibrant neon colors for ball
    const colors = ['#00e5ff', '#00e701', '#ff007f', '#ffd600', '#7c4dff'];
    const ballColor = colors[Math.floor(Math.random() * colors.length)];

    this.balls.push({
      id: Math.random(),
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 1.2,
      radius: this.ballRadius,
      color: ballColor,
      bet: betAmount,
      path: []
    });

    if (window.soundFX) window.soundFX.playClick();
    return true;
  }

  toggleAutoDrop(betAmount, callback) {
    if (this.isAutoDropping) {
      clearInterval(this.autoDropInterval);
      this.isAutoDropping = false;
      if (callback) callback(false);
      return false;
    } else {
      this.isAutoDropping = true;
      this.dropBall(betAmount);
      this.autoDropInterval = setInterval(() => {
        if (!this.dropBall(betAmount)) {
          clearInterval(this.autoDropInterval);
          this.isAutoDropping = false;
          if (callback) callback(false);
        }
      }, 190);
      if (callback) callback(true);
      return true;
    }
  }

  updatePhysics() {
    const gravity = 0.22;
    const bounceDamping = 0.58;
    const friction = 0.99;

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];

      b.vy += gravity;
      b.vx *= friction;
      b.x += b.vx;
      b.y += b.vy;

      // Wall bounce
      if (b.x - b.radius < 5) {
        b.x = 5 + b.radius;
        b.vx = Math.abs(b.vx) * 0.6;
      } else if (b.x + b.radius > this.width - 5) {
        b.x = this.width - 5 - b.radius;
        b.vx = -Math.abs(b.vx) * 0.6;
      }

      // Check collision with pegs
      for (let p of this.pegs) {
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b.radius + p.radius;

        if (dist < minDist) {
          // Collision resolution
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          // Position separation
          const overlap = minDist - dist;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Normal & Tangential velocities
          const dot = b.vx * nx + b.vy * ny;
          if (dot < 0) {
            b.vx = (b.vx - (1 + bounceDamping) * dot * nx) + (Math.random() - 0.5) * 0.7;
            b.vy = (b.vy - (1 + bounceDamping) * dot * ny);
            
            // Jitter to prevent ball getting stuck in vertical balance
            if (Math.abs(b.vx) < 0.3) {
              b.vx += (Math.random() > 0.5 ? 0.7 : -0.7);
            }

            p.hitGlow = 1.0;
            const pitchFactor = (p.row + 1) / this.rows;
            if (window.soundFX) window.soundFX.playPlinkoPeg(pitchFactor);
          }
        }
      }

      // Check if reached bottom buckets
      const bottomThreshold = this.height - 46;
      if (b.y >= bottomThreshold) {
        // Find which bucket
        let targetBucket = null;
        for (let bucket of this.buckets) {
          if (b.x >= bucket.x && b.x <= bucket.x + bucket.width + 2) {
            targetBucket = bucket;
            break;
          }
        }

        // Default to closest if edge cases
        if (!targetBucket) {
          if (b.x < this.buckets[0].x) targetBucket = this.buckets[0];
          else targetBucket = this.buckets[this.buckets.length - 1];
        }

        if (targetBucket) {
          const mult = targetBucket.multiplier;
          const payout = b.bet * mult;
          targetBucket.animOffset = 8;
          this.bucketAnimations[targetBucket.index] = 1.0;

          // Record win/history
          window.appState.recordOutcome('Plinko', b.bet, mult, payout);
          if (window.soundFX) window.soundFX.playPlinkoWin(mult);

          // Add to recent hits
          this.addRecentHit(mult);
        }

        // Remove ball
        this.balls.splice(i, 1);
      }
    }

    // Decay peg glows
    for (let p of this.pegs) {
      if (p.hitGlow > 0) {
        p.hitGlow -= 0.08;
        if (p.hitGlow < 0) p.hitGlow = 0;
      }
    }

    // Decay bucket animations
    for (let b of this.buckets) {
      if (b.animOffset > 0) {
        b.animOffset -= 0.6;
        if (b.animOffset < 0) b.animOffset = 0;
      }
    }
  }

  addRecentHit(mult) {
    this.recentHits.unshift(mult);
    if (this.recentHits.length > 8) this.recentHits.pop();

    if (this.recentBar) {
      this.recentBar.innerHTML = this.recentHits.map(m => {
        const color = this.getMultiplierColor(m);
        return `<span class="recent-mult-badge" style="background:${color}22; color:${color}; border-color:${color}66">${m}x</span>`;
      }).join('');
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render 3D Multiplier Buckets at bottom
    const maxMult = Math.max(...this.buckets.map(b => b.multiplier));
    for (let b of this.buckets) {
      const color = this.getMultiplierColor(b.multiplier, maxMult);
      const y = b.y + b.animOffset;

      // Drop shadow for bucket
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.roundRect(this.ctx, b.x, y + 2, b.width, b.height, 4, true, false);

      // Bucket body with 3D bevel gradient
      const bucketGrad = this.ctx.createLinearGradient(0, y, 0, y + b.height);
      bucketGrad.addColorStop(0, color);
      bucketGrad.addColorStop(0.7, color);
      bucketGrad.addColorStop(1, '#020617');

      this.ctx.fillStyle = bucketGrad;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = b.animOffset > 0 ? 16 : 4;
      this.roundRect(this.ctx, b.x, y, b.width, b.height, 4, true, false);

      // Top glossy highlight reflection line
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      this.roundRect(this.ctx, b.x + 1, y + 1, b.width - 2, Math.max(2, b.height * 0.35), 2, true, false);

      // Chrome separator pin between buckets
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(b.x - 1, y, 1.5, b.height);

      // Text multiplier
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '900 ' + (this.rows > 14 ? '9px' : '11px') + ' Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      let label = b.multiplier.toString();
      if (b.multiplier >= 1000) label = '1k';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 2;
      this.ctx.fillText(label + 'x', b.x + b.width / 2, y + b.height / 2 + 1);
      this.ctx.shadowBlur = 0;
    }

    // Render 3D Chrome Metallic Pegs
    for (let p of this.pegs) {
      if (p.hitGlow > 0) {
        // Shockwave aura
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 240, 255, ${0.45 * p.hitGlow})`;
        this.ctx.fill();

        // White-hot core
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 14 * p.hitGlow;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else {
        // Shadow beneath peg
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y + 1.2, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fill();

        // 3D Polished Chrome Radial Gradient
        const chromeGrad = this.ctx.createRadialGradient(
          p.x - p.radius * 0.35, p.y - p.radius * 0.35, 0.5,
          p.x, p.y, p.radius
        );
        chromeGrad.addColorStop(0, '#ffffff');
        chromeGrad.addColorStop(0.3, '#e2e8f0');
        chromeGrad.addColorStop(0.7, '#64748b');
        chromeGrad.addColorStop(1, '#1e293b');

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = chromeGrad;
        this.ctx.fill();
      }
    }

    // Render 3D Glowing Plasma Balls
    for (let b of this.balls) {
      // Outer Glow Aura
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius * 1.6, 0, Math.PI * 2);
      this.ctx.fillStyle = b.color + '44';
      this.ctx.fill();

      // 3D Plasma Sphere
      const ballGrad = this.ctx.createRadialGradient(
        b.x - b.radius * 0.35, b.y - b.radius * 0.35, 0.8,
        b.x, b.y, b.radius
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.3, b.color);
      ballGrad.addColorStop(0.8, '#090e17');
      ballGrad.addColorStop(1, '#000000');

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = ballGrad;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Specular Reflection Glint
      this.ctx.beginPath();
      this.ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.ctx.fill();
    }
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  startLoop() {
    const loop = () => {
      this.updatePhysics();
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  destroy() {
    if (this.autoDropInterval) clearInterval(this.autoDropInterval);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }
}

window.PlinkoGame = PlinkoGame;
