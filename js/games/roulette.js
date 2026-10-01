// European Roulette Engine for RainStake Mobile
// Real 37-number single-zero wheel canvas, interactive felt betting grid,
// Straight-up (35:1), Outside bets, Chip placement stacks, Rebet button,
// Deceleration ball physics with fret rattle audio, Hot/Cold statistics

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

class RouletteGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.wheelCanvas = null;
    this.wheelCtx = null;
    this.isSpinning = false;
    this.placedBets = {}; // { 'red': 25, '17': 10 }
    this.previousBets = {};
    this.selectedChipVal = 10;
    this.wheelAngle = 0;
    this.ballAngle = 0;
    this.ballRadius = 90;
    this.history = [14, 31, 9, 22, 0, 7, 28];

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="roulette-table-wrapper">
        <!-- Hot & Cold Recent Numbers Bar -->
        <div class="roulette-stats-header">
          <span class="stats-label">HISTORY:</span>
          <div class="roulette-recent-bar" id="rouletteRecentBar"></div>
        </div>

        <!-- Animated Wheel Canvas Section -->
        <div class="roulette-wheel-container">
          <canvas id="rouletteCanvas" width="280" height="280"></canvas>
          <div class="roulette-center-result" id="rouletteCenterResult" style="display:none;">
            <span class="res-num" id="rouletteResultNum">17</span>
            <span class="res-label" id="rouletteResultLabel">BLACK</span>
          </div>
        </div>

        <!-- Chip Denomination Selector Strip -->
        <div class="roulette-chip-selector">
          <button class="felt-chip-btn chip-1" data-val="1">$1</button>
          <button class="felt-chip-btn chip-5" data-val="5">$5</button>
          <button class="felt-chip-btn chip-10 active" data-val="10">$10</button>
          <button class="felt-chip-btn chip-25" data-val="25">$25</button>
          <button class="felt-chip-btn chip-100" data-val="100">$100</button>
          <button class="felt-tool-btn" id="rouletteRebetBtn">Rebet</button>
          <button class="felt-tool-btn" id="rouletteClearBtn">Clear</button>
        </div>

        <!-- Interactive Felt Grid -->
        <div class="roulette-felt-grid">
          <!-- 0 Zero Row -->
          <div class="felt-spot spot-zero" data-bet="0">
            <span>0</span>
            <span class="spot-chip-badge" style="display:none;"></span>
          </div>

          <!-- Inside Numbers 1 to 36 (3 columns) -->
          <div class="felt-numbers-grid" id="rouletteNumbersGrid"></div>

          <!-- Outside Bets Grid -->
          <div class="felt-outside-grid">
            <div class="felt-spot spot-outside" data-bet="1st12">
              <span>1st 12 (2:1)</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside" data-bet="2nd12">
              <span>2nd 12 (2:1)</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside" data-bet="3rd12">
              <span>3rd 12 (2:1)</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
          </div>
          <div class="felt-outside-grid">
            <div class="felt-spot spot-outside" data-bet="1-18">
              <span>1-18</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside spot-even" data-bet="even">
              <span>EVEN</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside spot-red" data-bet="red">
              <span>RED</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside spot-black" data-bet="black">
              <span>BLACK</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside spot-odd" data-bet="odd">
              <span>ODD</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="felt-spot spot-outside" data-bet="19-36">
              <span>19-36</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
          </div>
        </div>

        <div class="roulette-totals-bar">
          <span>Active Table Bet: <strong class="text-gold" id="rouletteTotalBet">$0.00</strong></span>
        </div>
      </div>
    `;

    this.wheelCanvas = document.getElementById('rouletteCanvas');
    this.wheelCtx = this.wheelCanvas.getContext('2d');
    this.numbersGrid = document.getElementById('rouletteNumbersGrid');
    this.recentBar = document.getElementById('rouletteRecentBar');
    this.totalBetEl = document.getElementById('rouletteTotalBet');
    this.centerResult = document.getElementById('rouletteCenterResult');
    this.resultNumEl = document.getElementById('rouletteResultNum');
    this.resultLabelEl = document.getElementById('rouletteResultLabel');

    this.buildNumbersGrid();
    this.bindEvents();
    this.updateRecentBar();
    this.drawWheel();
  }

  buildNumbersGrid() {
    this.numbersGrid.innerHTML = '';
    for (let i = 1; i <= 36; i++) {
      const isRed = RED_NUMBERS.has(i);
      const spot = document.createElement('div');
      spot.className = `felt-spot ${isRed ? 'spot-red-num' : 'spot-black-num'}`;
      spot.dataset.bet = i.toString();
      spot.innerHTML = `<span>${i}</span><span class="spot-chip-badge" style="display:none;"></span>`;
      this.numbersGrid.appendChild(spot);
    }
  }

  bindEvents() {
    // Chip selection
    const chips = this.container.querySelectorAll('.felt-chip-btn');
    chips.forEach(c => {
      c.addEventListener('click', () => {
        chips.forEach(ch => ch.classList.remove('active'));
        c.classList.add('active');
        this.selectedChipVal = parseFloat(c.dataset.val);
        if (window.soundFX) window.soundFX.playChipClink();
      });
    });

    // Clear bets
    document.getElementById('rouletteClearBtn').addEventListener('click', () => {
      if (this.isSpinning) return;
      this.placedBets = {};
      this.updateFeltChips();
      if (window.soundFX) window.soundFX.playClick();
    });

    // Rebet button
    const rebetBtn = document.getElementById('rouletteRebetBtn');
    if (rebetBtn) {
      rebetBtn.addEventListener('click', () => {
        if (this.isSpinning) return;
        if (Object.keys(this.previousBets).length > 0) {
          this.placedBets = { ...this.previousBets };
          this.updateFeltChips();
          if (window.soundFX) window.soundFX.playChipClink();
        }
      });
    }

    // Felt spots click
    const spots = this.container.querySelectorAll('.felt-spot');
    spots.forEach(s => {
      s.addEventListener('click', () => {
        if (this.isSpinning) return;
        const betType = s.dataset.bet;
        const cur = this.placedBets[betType] || 0;
        this.placedBets[betType] = cur + this.selectedChipVal;
        this.updateFeltChips();
        if (window.soundFX) window.soundFX.playChipClink();
      });
    });
  }

  updateFeltChips() {
    let total = 0;
    const spots = this.container.querySelectorAll('.felt-spot');
    spots.forEach(s => {
      const betType = s.dataset.bet;
      const amt = this.placedBets[betType] || 0;
      total += amt;

      let badge = s.querySelector('.spot-chip-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'spot-chip-badge';
        s.appendChild(badge);
      }

      if (amt > 0) {
        badge.style.display = 'block';
        badge.textContent = `$${amt}`;
      } else {
        badge.style.display = 'none';
      }
    });

    this.totalBetEl.textContent = `$${total.toFixed(2)}`;
    this.onStateChange({ totalBet: total });
  }

  drawWheel(angle = 0, ballAngle = 0, ballDist = 95) {
    if (!this.wheelCanvas || !this.wheelCtx) return;
    const ctx = this.wheelCtx;
    const w = this.wheelCanvas.width;
    const h = this.wheelCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 10;

    ctx.clearRect(0, 0, w, h);

    // Outer Polished Mahogany Wood Bowl Rim
    const outerGrad = ctx.createRadialGradient(cx, cy, radius - 15, cx, cy, radius + 8);
    outerGrad.addColorStop(0, '#78350f');
    outerGrad.addColorStop(0.3, '#451a03');
    outerGrad.addColorStop(0.7, '#270c03');
    outerGrad.addColorStop(1, '#170601');

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
    ctx.fillStyle = outerGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Metallic Brass Ball Track Rail
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const sliceAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;

    // Draw 37 numbered pockets with metallic frets
    for (let i = 0; i < ROULETTE_NUMBERS.length; i++) {
      const num = ROULETTE_NUMBERS[i];
      const startA = angle + i * sliceAngle;
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 4, startA, endA);
      ctx.closePath();

      if (num === 0) ctx.fillStyle = '#15803d';
      else if (RED_NUMBERS.has(num)) ctx.fillStyle = '#b91c1c';
      else ctx.fillStyle = '#0f172a';

      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Number label text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 2;
      ctx.fillText(num.toString(), radius - 10, 4);
      ctx.restore();
    }

    // Inner Mirror-Finish Polished Brass Turret
    const grad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 40);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, '#fef08a');
    grad.addColorStop(0.6, '#eab308');
    grad.addColorStop(0.85, '#a16207');
    grad.addColorStop(1, '#451a03');

    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4 Turned Brass Finial Handles / Spindle Cross
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach(a => {
      const hx = cx + Math.cos(a + angle) * 26;
      const hy = cy + Math.sin(a + angle) * 26;
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();

    // Center Spindle Gem Cap
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Real Ivory Ball with 3D Specular Highlight & Cast Shadow
    if (ballDist > 0) {
      const bx = cx + Math.cos(ballAngle) * ballDist;
      const by = cy + Math.sin(ballAngle) * ballDist;

      // Drop shadow on wheel
      ctx.beginPath();
      ctx.arc(bx + 2, by + 3, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Ivory Ball sphere gradient
      const ballGrad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 7);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.45, '#f8fafc');
      ballGrad.addColorStop(0.85, '#cbd5e1');
      ballGrad.addColorStop(1, '#94a3b8');

      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  spin() {
    if (this.isSpinning) return false;
    const totalBet = Object.values(this.placedBets).reduce((a, b) => a + b, 0);
    if (totalBet <= 0) {
      alert('Please tap numbers or outside bets to place chips before spinning!');
      return false;
    }

    if (!window.appState.deductBet(totalBet)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.previousBets = { ...this.placedBets };
    this.isSpinning = true;
    this.centerResult.style.display = 'none';

    // Pick winning index randomly (0 to 36)
    const winningIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winningNum = ROULETTE_NUMBERS[winningIndex];

    const sliceAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;
    const duration = 4600;
    const startTime = performance.now();

    const startWheelAngle = this.wheelAngle;
    const targetWheelAngle = startWheelAngle + Math.PI * 2 * 6; // clockwise 6 full rotations

    const startBallAngle = this.ballAngle;
    const targetBallAngle = startBallAngle - Math.PI * 2 * 12 + (winningIndex * sliceAngle); // counter-clockwise

    let lastTickAngle = startBallAngle;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.wheelAngle = startWheelAngle + (targetWheelAngle - startWheelAngle) * ease;
      this.ballAngle = startBallAngle + (targetBallAngle - startBallAngle) * ease;
      const ballDist = 102 - (24 * ease); // ball drops into pocket track

      this.drawWheel(this.wheelAngle, this.ballAngle, ballDist);

      if (Math.abs(this.ballAngle - lastTickAngle) >= sliceAngle) {
        lastTickAngle = this.ballAngle;
        const speedFactor = 1.0 - progress * 0.5;
        if (window.soundFX && window.soundFX.playRouletteRattle) {
          window.soundFX.playRouletteRattle(speedFactor);
        } else if (window.soundFX) {
          window.soundFX.playSpinTick();
        }
      }

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.finishSpin(winningNum, totalBet);
      }
    };

    requestAnimationFrame(animate);
    return true;
  }

  finishSpin(winningNum, totalBet) {
    this.isSpinning = false;
    const isRed = RED_NUMBERS.has(winningNum);
    const isZero = winningNum === 0;

    let totalPayout = 0;

    for (let betKey in this.placedBets) {
      const amt = this.placedBets[betKey];
      if (amt <= 0) continue;

      if (betKey === winningNum.toString()) {
        totalPayout += amt * 36; // 35:1 straight up
      } else if (betKey === 'red' && isRed) {
        totalPayout += amt * 2; // 1:1
      } else if (betKey === 'black' && !isRed && !isZero) {
        totalPayout += amt * 2;
      } else if (betKey === 'even' && !isZero && winningNum % 2 === 0) {
        totalPayout += amt * 2;
      } else if (betKey === 'odd' && !isZero && winningNum % 2 !== 0) {
        totalPayout += amt * 2;
      } else if (betKey === '1-18' && winningNum >= 1 && winningNum <= 18) {
        totalPayout += amt * 2;
      } else if (betKey === '19-36' && winningNum >= 19 && winningNum <= 36) {
        totalPayout += amt * 2;
      } else if (betKey === '1st12' && winningNum >= 1 && winningNum <= 12) {
        totalPayout += amt * 3; // 2:1
      } else if (betKey === '2nd12' && winningNum >= 13 && winningNum <= 24) {
        totalPayout += amt * 3;
      } else if (betKey === '3rd12' && winningNum >= 25 && winningNum <= 36) {
        totalPayout += amt * 3;
      }
    }

    const mult = totalBet > 0 ? (totalPayout / totalBet) : 0;
    window.appState.recordOutcome('Roulette', totalBet, mult, totalPayout);

    // Show center result banner
    this.resultNumEl.textContent = winningNum;
    this.resultNumEl.style.color = isZero ? '#00e701' : (isRed ? '#ef4444' : '#ffffff');
    this.resultLabelEl.textContent = isZero ? 'ZERO (GREEN)' : (isRed ? 'RED' : 'BLACK');
    this.centerResult.style.display = 'flex';
    this.centerResult.className = `roulette-center-result win-pop ${totalPayout > 0 ? 'win' : 'lose'}`;

    if (totalPayout > 0 && window.soundFX) window.soundFX.playCashout();
    else if (window.soundFX) window.soundFX.playDiceLoss();

    // History update
    this.history.unshift(winningNum);
    if (this.history.length > 8) this.history.pop();
    this.updateRecentBar();

    this.onStateChange({ winningNum, totalPayout, isSpinning: false });
  }

  updateRecentBar() {
    if (!this.recentBar) return;
    this.recentBar.innerHTML = this.history.map(num => {
      const isRed = RED_NUMBERS.has(num);
      const isZero = num === 0;
      const bg = isZero ? '#00e701' : (isRed ? '#ef4444' : '#1e293b');
      return `<span class="roulette-hist-badge" style="background:${bg}">${num}</span>`;
    }).join('');
  }
}

window.RouletteGame = RouletteGame;
