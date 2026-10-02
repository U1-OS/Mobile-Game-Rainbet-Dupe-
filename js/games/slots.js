// DruBet Crown Slots Engine for DruBet VIP Gaming
// Real Vegas / Stake / Pragmatic Play style 5x3 Video Slot:
// 10 Paylines, Wild 7s, Crown Scatter Free Spins with 3X Multiplier,
// Buy Bonus Feature (100x), Turbo Spin Mode, Auto Spin,
// SVG Glowing Payline Traces, Multi-tiered Big Win Overlays, Authentic Audio

const SLOT_SYMBOLS = [
  { id: 'diamond', char: '💎', label: 'DIAMOND', weight: 4, pays: [0, 0, 5, 15, 50], color: '#38bdf8' },
  { id: 'crown', char: '👑', label: 'CROWN', weight: 6, pays: [0, 0, 3, 8, 25], color: '#f59e0b' },
  { id: 'wild', char: '7️⃣', label: 'WILD 7', weight: 5, pays: [0, 0, 4, 10, 30], isWild: true, color: '#ef4444' },
  { id: 'scatter', char: '🌧️', label: 'CROWN SCATTER', weight: 6, isScatter: true, color: '#00f0ff' },
  { id: 'bolt', char: '⚡', label: 'THUNDER', weight: 10, pays: [0, 0, 1.5, 4, 12], color: '#eab308' },
  { id: 'bell', char: '🔔', label: 'GOLD BELL', weight: 12, pays: [0, 0, 1, 2.5, 8], color: '#f59e0b' },
  { id: 'clover', char: '🍀', label: 'CLOVER', weight: 15, pays: [0, 0, 0.8, 2, 5], color: '#10b981' },
  { id: 'cherry', char: '🍒', label: 'CHERRY', weight: 18, pays: [0, 0, 0.5, 1, 3], color: '#f43f5e' }
];

// 10 Standard Casino Paylines (grid coordinates [col, row], 0-indexed)
const PAYLINES = [
  [[0,1], [1,1], [2,1], [3,1], [4,1]], // 1: Middle row
  [[0,0], [1,0], [2,0], [3,0], [4,0]], // 2: Top row
  [[0,2], [1,2], [2,2], [3,2], [4,2]], // 3: Bottom row
  [[0,0], [1,1], [2,2], [3,1], [4,0]], // 4: V shape
  [[0,2], [1,1], [2,0], [3,1], [4,2]], // 5: Inverted V
  [[0,1], [1,0], [2,0], [3,0], [4,1]], // 6: Top arch
  [[0,1], [1,2], [2,2], [3,2], [4,1]], // 7: Bottom arch
  [[0,0], [1,0], [2,1], [3,2], [4,2]], // 8: Diagonal down
  [[0,2], [1,2], [2,1], [3,0], [4,0]], // 9: Diagonal up
  [[0,1], [1,2], [2,1], [3,0], [4,1]]  // 10: Zig zag
];

class SlotsGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.isSpinning = false;
    this.turboMode = false;
    this.autoSpinning = false;
    this.freeSpinsLeft = 0;
    this.freeSpinsMultiplier = 3;
    this.totalFreeSpinWins = 0;
    this.betAmount = 10;
    this.grid = [
      ['💎', '👑', '🍒'],
      ['⚡', '7️⃣', '🔔'],
      ['🌧️', '💎', '🍀'],
      ['🔔', '⚡', '🍒'],
      ['👑', '🍀', '7️⃣']
    ];

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="slots-machine-cabinet">
        <!-- Top Neon Header -->
        <div class="slots-header-status" id="slotsStatusBanner">
          <div class="slots-branding">
            <span class="slots-logo-icon">🎰</span>
            <span class="slots-title-text">DRUBET CROWN SLOTS DELUXE</span>
          </div>
          <div class="slots-bonus-indicator" id="slotsBonusBadge" style="display:none">
            ⚡ FREE SPINS: <span id="slotsFsCount">10</span> (3X MULT)
          </div>
        </div>

        <!-- 5x3 Reels Cabinet Frame with SVG Payline Canvas -->
        <div class="slots-frame-wrapper">
          <div class="slots-reels-frame" id="slotsReelsFrame">
            <div class="slots-reel" data-reel="0"></div>
            <div class="slots-reel" data-reel="1"></div>
            <div class="slots-reel" data-reel="2"></div>
            <div class="slots-reel" data-reel="3"></div>
            <div class="slots-reel" data-reel="4"></div>
          </div>
          <svg class="slots-paylines-svg" id="slotsPaylinesSvg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
        </div>

        <!-- Win & Status Bar -->
        <div class="slots-win-display" id="slotsWinDisplay">
          <div class="win-item">
            <span class="win-label">PAYLINES</span>
            <span class="win-val text-cyan">10 FIXED</span>
          </div>
          <div class="win-item win-highlight-box">
            <span class="win-label">WIN</span>
            <span class="win-amount text-gold" id="slotsWinAmount">$0.00</span>
          </div>
          <div class="win-item">
            <span class="win-label">FREE SPINS MULT</span>
            <span class="win-val text-purple" id="slotsBonusMult">3.0×</span>
          </div>
        </div>

        <!-- Quick Slot Toggles Strip: Buy Bonus, Turbo, Auto -->
        <div class="slots-quick-tools">
          <button class="slot-tool-btn btn-buy-bonus" id="slotBuyBonusBtn">
            <span class="tool-icon">⚡</span>
            <span class="tool-label">BUY BONUS (100×)</span>
          </button>
          <button class="slot-tool-btn" id="slotTurboBtn">
            <span class="tool-icon">⚡</span>
            <span class="tool-label" id="slotTurboLabel">TURBO: OFF</span>
          </button>
          <button class="slot-tool-btn" id="slotAutoBtn">
            <span class="tool-icon">🔄</span>
            <span class="tool-label" id="slotAutoLabel">AUTO SPIN</span>
          </button>
        </div>

        <!-- Big Win Celebratory Overlay Modal -->
        <div class="slots-bigwin-modal" id="slotsBigWinModal" style="display:none;">
          <div class="bigwin-content">
            <div class="bigwin-sparkles">✨ 🌧️ 💎 ✨</div>
            <div class="bigwin-title" id="bigWinTitle">BIG WIN!</div>
            <div class="bigwin-amount text-gold" id="bigWinAmount">$500.00</div>
            <div class="bigwin-mult text-cyan" id="bigWinMult">50.0× MULTIPLIER</div>
          </div>
        </div>
      </div>
    `;

    this.reelsEls = this.container.querySelectorAll('.slots-reel');
    this.statusBanner = document.getElementById('slotsStatusBanner');
    this.bonusBadge = document.getElementById('slotsBonusBadge');
    this.fsCountEl = document.getElementById('slotsFsCount');
    this.winAmountEl = document.getElementById('slotsWinAmount');
    this.winDisplay = document.getElementById('slotsWinDisplay');
    this.paylinesSvg = document.getElementById('slotsPaylinesSvg');
    this.buyBonusBtn = document.getElementById('slotBuyBonusBtn');
    this.turboBtn = document.getElementById('slotTurboBtn');
    this.turboLabel = document.getElementById('slotTurboLabel');
    this.autoBtn = document.getElementById('slotAutoBtn');
    this.autoLabel = document.getElementById('slotAutoLabel');
    this.bigWinModal = document.getElementById('slotsBigWinModal');
    this.bigWinTitle = document.getElementById('bigWinTitle');
    this.bigWinAmount = document.getElementById('bigWinAmount');
    this.bigWinMult = document.getElementById('bigWinMult');

    this.bindEvents();
    this.renderStaticGrid();
  }

  bindEvents() {
    // Buy Bonus Feature
    this.buyBonusBtn.addEventListener('click', () => {
      if (this.isSpinning) return;
      const betInput = document.getElementById('unifiedBetInput');
      const baseBet = betInput ? parseFloat(betInput.value) || 10 : 10;
      const bonusCost = baseBet * 100;

      if (!window.appState.deductBet(bonusCost)) {
        if (window.soundFX) window.soundFX.playDiceLoss();
        if (window.app?.showToast) {
          window.app.showToast(`Insufficient balance ($${bonusCost.toFixed(2)} needed). Claim Faucet!`, 'error');
        }
        return;
      }

      if (window.soundFX) window.soundFX.playRainStart();
      this.triggerFreeSpins(baseBet, true);
    });

    // Turbo Spin toggle
    this.turboBtn.addEventListener('click', () => {
      this.turboMode = !this.turboMode;
      this.turboBtn.classList.toggle('active', this.turboMode);
      this.turboLabel.textContent = `TURBO: ${this.turboMode ? 'ON' : 'OFF'}`;
      if (window.soundFX) window.soundFX.playClick();
    });

    // Auto Spin toggle
    this.autoBtn.addEventListener('click', () => {
      this.autoSpinning = !this.autoSpinning;
      this.autoBtn.classList.toggle('active', this.autoSpinning);
      this.autoLabel.textContent = this.autoSpinning ? 'STOP AUTO' : 'AUTO SPIN';
      if (window.soundFX) window.soundFX.playClick();

      if (this.autoSpinning && !this.isSpinning) {
        const betInput = document.getElementById('unifiedBetInput');
        const bet = betInput ? parseFloat(betInput.value) || 10 : 10;
        this.spin(bet);
      }
    });

    // Dismiss Big Win modal on tap
    this.bigWinModal.addEventListener('click', () => {
      this.bigWinModal.style.display = 'none';
    });
  }

  renderStaticGrid() {
    this.reelsEls.forEach((reelEl, rIdx) => {
      reelEl.innerHTML = '';
      for (let cIdx = 0; cIdx < 3; cIdx++) {
        const symbolChar = this.grid[rIdx][cIdx];
        const symObj = SLOT_SYMBOLS.find(s => s.char === symbolChar || s.id === symbolChar) || SLOT_SYMBOLS[0];
        const cell = document.createElement('div');
        cell.className = `slot-cell sym-${symObj.id}`;
        cell.innerHTML = window.CasinoSymbols ? window.CasinoSymbols.getSlotSymbol(symObj) : `<div class="sym-char">${symbolChar}</div><div class="sym-name">${symObj.label}</div>`;
        reelEl.appendChild(cell);
      }
    });
  }

  getRandomSymbol() {
    const totalWeight = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let s of SLOT_SYMBOLS) {
      if (rand < s.weight) return s;
      rand -= s.weight;
    }
    return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1];
  }

  spin(betAmount) {
    if (this.isSpinning) return false;

    // Deduct bet if not free spin
    if (this.freeSpinsLeft === 0) {
      if (!window.appState.deductBet(betAmount)) {
        if (window.soundFX) window.soundFX.playDiceLoss();
        this.stopAutoSpin();
        return false;
      }
    } else {
      this.freeSpinsLeft--;
      this.updateBonusBadge();
    }

    this.betAmount = betAmount;
    this.isSpinning = true;
    this.winDisplay.classList.remove('big-win-glow');
    this.winAmountEl.textContent = '$0.00';
    this.clearPaylines();

    // Generate new final grid
    const newGrid = [];
    let scatterCount = 0;

    for (let r = 0; r < 5; r++) {
      const col = [];
      for (let c = 0; c < 3; c++) {
        const sym = this.getRandomSymbol();
        col.push(sym.char);
        if (sym.isScatter) scatterCount++;
      }
      newGrid.push(col);
    }

    // Set reel spinning animations with realistic vector blur
    const reelDuration = this.turboMode ? 80 : 250;
    const baseDuration = this.turboMode ? 150 : 400;

    this.reelsEls.forEach((reelEl, rIdx) => {
      reelEl.classList.add('spinning');
      const r1 = this.getRandomSymbol();
      const r2 = this.getRandomSymbol();
      const r3 = this.getRandomSymbol();
      reelEl.innerHTML = `
        <div class="slot-cell blur-spin">${window.CasinoSymbols ? window.CasinoSymbols.getSlotSymbol(r1) : `<div class="sym-char">${r1.char}</div>`}</div>
        <div class="slot-cell blur-spin">${window.CasinoSymbols ? window.CasinoSymbols.getSlotSymbol(r2) : `<div class="sym-char">${r2.char}</div>`}</div>
        <div class="slot-cell blur-spin">${window.CasinoSymbols ? window.CasinoSymbols.getSlotSymbol(r3) : `<div class="sym-char">${r3.char}</div>`}</div>
      `;
    });

    if (window.soundFX) window.soundFX.playSpinTick();

    // Staggered stop for each of the 5 reels
    let scattersSoFar = 0;
    this.reelsEls.forEach((reelEl, rIdx) => {
      const stopDelay = baseDuration + rIdx * reelDuration;

      setTimeout(() => {
        reelEl.classList.remove('spinning');
        reelEl.innerHTML = '';
        for (let c = 0; c < 3; c++) {
          const symChar = newGrid[rIdx][c];
          const symObj = SLOT_SYMBOLS.find(s => s.char === symChar || s.id === symChar) || SLOT_SYMBOLS[0];
          if (symObj.isScatter) scattersSoFar++;

          const cell = document.createElement('div');
          cell.className = `slot-cell bounce-land sym-${symObj.id}`;
          cell.innerHTML = window.CasinoSymbols ? window.CasinoSymbols.getSlotSymbol(symObj) : `
            <div class="sym-char">${symChar}</div>
            <div class="sym-name">${symObj.label}</div>
          `;
          reelEl.appendChild(cell);
        }

        if (window.soundFX) window.soundFX.playSpinTick();

        // Scatter tease sound if 2 scatters landed waiting for 3rd
        if (scattersSoFar === 2 && rIdx < 4 && !this.turboMode) {
          if (window.soundFX && window.soundFX.playSlotScatterTease) {
            window.soundFX.playSlotScatterTease();
          }
        }
      }, stopDelay);
    });

    // Evaluation after all 5 reels have locked in
    const totalSpinTime = baseDuration + 4 * reelDuration + 150;
    setTimeout(() => {
      this.grid = newGrid;
      this.evaluateSpin(betAmount, newGrid, scatterCount);
    }, totalSpinTime);

    return true;
  }

  evaluateSpin(betAmount, grid, scatterCount) {
    let totalMultiplier = 0;
    const winningLines = [];

    // Check 10 paylines
    for (let lIdx = 0; lIdx < PAYLINES.length; lIdx++) {
      const line = PAYLINES[lIdx];
      const symbolsInLine = line.map(([r, c]) => grid[r][c]);

      // Determine match character (skip wilds)
      let matchChar = null;
      for (let sym of symbolsInLine) {
        if (sym !== '7️⃣' && sym !== '🌧️') {
          matchChar = sym;
          break;
        }
      }

      if (!matchChar) matchChar = '7️⃣'; // Line of wilds!

      let matchCount = 0;
      for (let sym of symbolsInLine) {
        if (sym === matchChar || sym === '7️⃣') {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const symbolObj = SLOT_SYMBOLS.find(s => s.char === matchChar);
        if (symbolObj && symbolObj.pays) {
          const pay = symbolObj.pays[matchCount - 1] || 0;
          totalMultiplier += pay;
          winningLines.push({ lineIndex: lIdx, line, symbolObj, matchCount });
        }
      }
    }

    // Apply Free Spins 3x Multiplier
    const isBonusRound = this.freeSpinsLeft > 0;
    if (isBonusRound && totalMultiplier > 0) {
      totalMultiplier *= this.freeSpinsMultiplier;
    }

    const payout = betAmount * totalMultiplier;

    if (totalMultiplier > 0) {
      this.winAmountEl.textContent = `+$${payout.toFixed(2)} (${totalMultiplier.toFixed(1)}×)`;
      this.winDisplay.classList.add('big-win-glow');

      // Highlight winning cells
      winningLines.forEach(w => {
        w.line.forEach(([r, c], idx) => {
          if (idx < w.matchCount) {
            const cell = this.reelsEls[r].children[c];
            if (cell) cell.classList.add('win-cell-highlight');
          }
        });
      });

      // Draw SVG neon paylines
      this.drawWinningPaylines(winningLines);

      // Play Win Sounds / Fanfares
      if (totalMultiplier >= 20) {
        this.showBigWinModal(totalMultiplier, payout);
        if (window.soundFX && window.soundFX.playBigWinFanfare) {
          window.soundFX.playBigWinFanfare();
        } else if (window.soundFX) {
          window.soundFX.playSlotWin(true);
        }
      } else if (window.soundFX) {
        window.soundFX.playSlotWin(totalMultiplier >= 5);
      }
    }

    window.appState.recordOutcome('Slots', betAmount, totalMultiplier, payout);

    // Check Scatter trigger (3+ Scatters anywhere on reels)
    if (scatterCount >= 3 && this.freeSpinsLeft === 0) {
      this.triggerFreeSpins(betAmount, false);
    } else {
      this.isSpinning = false;
      this.onStateChange({ isSpinning: false, won: totalMultiplier > 0, payout });

      // Handle Auto Spin cycle
      if (this.autoSpinning) {
        const delay = totalMultiplier > 0 ? (totalMultiplier >= 20 ? 3000 : 1200) : 500;
        setTimeout(() => {
          if (this.autoSpinning) {
            this.spin(betAmount);
          }
        }, delay);
      }
    }
  }

  drawWinningPaylines(winningLines) {
    if (!this.paylinesSvg) return;
    this.paylinesSvg.innerHTML = '';

    const colors = ['#f59e0b', '#00e701', '#00f0ff', '#a855f7', '#ec4899', '#3b82f6'];

    winningLines.forEach((w, wIdx) => {
      const color = colors[wIdx % colors.length];
      const points = [];

      w.line.forEach(([r, c], idx) => {
        if (idx < w.matchCount) {
          // Calculate percentage coords for 5 cols x 3 rows
          const x = (r * 20) + 10;
          const y = (c * 33.33) + 16.66;
          points.push(`${x},${y}`);
        }
      });

      if (points.length > 1) {
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points.join(' '));
        polyline.setAttribute('stroke', color);
        polyline.setAttribute('stroke-width', '2.5');
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke-linecap', 'round');
        polyline.setAttribute('stroke-linejoin', 'round');
        polyline.setAttribute('class', 'payline-anim-stroke');
        this.paylinesSvg.appendChild(polyline);
      }
    });
  }

  clearPaylines() {
    if (this.paylinesSvg) this.paylinesSvg.innerHTML = '';
  }

  showBigWinModal(mult, payout) {
    let title = 'BIG WIN!';
    if (mult >= 50) title = 'MEGA WIN!';
    if (mult >= 100) title = '★ SUPER JACKPOT! ★';

    this.bigWinTitle.textContent = title;
    this.bigWinAmount.textContent = `+$${payout.toFixed(2)}`;
    this.bigWinMult.textContent = `${mult.toFixed(1)}× MULTIPLIER`;
    this.bigWinModal.style.display = 'flex';

    setTimeout(() => {
      this.bigWinModal.style.display = 'none';
    }, 2800);
  }

  triggerFreeSpins(betAmount, bought = false) {
    this.freeSpinsLeft = 10;
    this.updateBonusBadge();
    this.bonusBadge.style.display = 'inline-block';
    this.bonusBadge.classList.add('pulse-anim');

    if (window.soundFX) window.soundFX.playRainStart();

    const bannerMsg = bought ? '⚡ BONUS BOUGHT: 10 FREE SPINS ACTIVATED!' : '🌧️ 3+ SCATTERS: 10 RAIN STORM FREE SPINS!';
    const winDisplay = document.getElementById('slotsWinAmount');
    if (winDisplay) winDisplay.textContent = bannerMsg;

    setTimeout(() => {
      this.isSpinning = false;
      this.runNextFreeSpin(betAmount);
    }, 1400);
  }

  runNextFreeSpin(betAmount) {
    if (this.freeSpinsLeft > 0) {
      this.spin(betAmount);
      const delay = this.turboMode ? 800 : 1800;
      setTimeout(() => {
        this.runNextFreeSpin(betAmount);
      }, delay);
    } else {
      this.bonusBadge.style.display = 'none';
      this.isSpinning = false;
      this.onStateChange({ isSpinning: false });
    }
  }

  updateBonusBadge() {
    if (this.bonusBadge && this.fsCountEl) {
      this.fsCountEl.textContent = this.freeSpinsLeft;
    }
  }

  stopAutoSpin() {
    this.autoSpinning = false;
    if (this.autoBtn) {
      this.autoBtn.classList.remove('active');
      this.autoLabel.textContent = 'AUTO SPIN';
    }
  }
}

window.SlotsGame = SlotsGame;
