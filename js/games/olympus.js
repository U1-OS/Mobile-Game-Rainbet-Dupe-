// Gates of Olympus 1000 Slot Engine for RainStake Mobile
// Replicates Pragmatic Play's #1 most famous crypto casino slot:
// - 6x5 Grid with Scatter Pays Anywhere (8+ matching symbols pay)
// - Cascading Tumble Mechanism (Winning symbols explode, new ones drop from above)
// - Zeus Lightning Multiplier Orbs (2x up to 1,000x winged orbs dropped with thunder strike)
// - Free Spins with Cumulative Multipliers (4+ Zeus Scatters award 15 Free Spins)
// - Buy Bonus (100x) & Ante Bet / Double Chance toggle
// - Full Web Audio Synthesizer Integration & Rich Visual Feedback

const OLYMPUS_SYMBOLS = [
  { id: 'crown', char: '👑', label: 'Crown', pays: { min8: 10, min10: 25, min12: 50 }, color: '#f59e0b', weight: 4 },
  { id: 'hourglass', char: '⏳', label: 'Hourglass', pays: { min8: 2.5, min10: 10, min12: 25 }, color: '#38bdf8', weight: 6 },
  { id: 'ring', char: '💍', label: 'Ring', pays: { min8: 2, min10: 5, min12: 15 }, color: '#ec4899', weight: 8 },
  { id: 'chalice', char: '🏆', label: 'Chalice', pays: { min8: 1.5, min10: 2, min12: 12 }, color: '#fbbf24', weight: 10 },
  { id: 'red_gem', char: '🔴', label: 'Ruby', pays: { min8: 1.0, min10: 1.5, min12: 10 }, color: '#ef4444', weight: 14 },
  { id: 'purple_gem', char: '🟣', label: 'Amethyst', pays: { min8: 0.8, min10: 1.2, min12: 8 }, color: '#a855f7', weight: 16 },
  { id: 'yellow_gem', char: '🟡', label: 'Topaz', pays: { min8: 0.5, min10: 1.0, min12: 5 }, color: '#eab308', weight: 18 },
  { id: 'green_gem', char: '🟢', label: 'Emerald', pays: { min8: 0.4, min10: 0.9, min12: 4 }, color: '#10b981', weight: 20 },
  { id: 'blue_gem', char: '🔵', label: 'Sapphire', pays: { min8: 0.25, min10: 0.75, min12: 2 }, color: '#3b82f6', weight: 22 },
  { id: 'zeus', char: '⚡', label: 'Zeus Scatter', isScatter: true, color: '#00f0ff', weight: 3 }
];

const MULTIPLIER_ORB_TIERS = [
  { val: 2, color: '#10b981', weight: 30 },
  { val: 3, color: '#10b981', weight: 25 },
  { val: 5, color: '#10b981', weight: 20 },
  { val: 10, color: '#3b82f6', weight: 12 },
  { val: 25, color: '#3b82f6', weight: 6 },
  { val: 50, color: '#a855f7', weight: 4 },
  { val: 100, color: '#ec4899', weight: 2 },
  { val: 250, color: '#f59e0b', weight: 0.8 },
  { val: 500, color: '#ef4444', weight: 0.3 },
  { val: 1000, color: '#00f0ff', weight: 0.1 }
];

class GatesOfOlympusGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});

    // State
    this.isSpinning = false;
    this.isTumbling = false;
    this.turboMode = false;
    this.autoSpinning = false;
    this.anteBetActive = false; // +25% bet for double scatter chance

    // Free Spins State
    this.inFreeSpins = false;
    this.freeSpinsLeft = 0;
    this.totalFreeSpinsWin = 0;
    this.globalMultiplier = 0; // Cumulative in Free Spins

    // Active Spin Multipliers on screen
    this.activeMultipliers = []; // [{ val, col, row, color }]

    // 6 columns x 5 rows grid
    this.cols = 6;
    this.rows = 5;
    this.grid = this.generateInitialGrid();

    this.renderUI();
  }

  getRandomSymbol(allowScatter = true) {
    let pool = [...OLYMPUS_SYMBOLS];
    if (!allowScatter) pool = pool.filter(s => !s.isScatter);
    
    // Ante bet increases scatter weight
    const totalWeight = pool.reduce((acc, s) => {
      let w = s.weight;
      if (s.isScatter && this.anteBetActive) w *= 2;
      return acc + w;
    }, 0);

    let rnd = Math.random() * totalWeight;
    for (const sym of pool) {
      let w = sym.weight;
      if (sym.isScatter && this.anteBetActive) w *= 2;
      if (rnd < w) return sym;
      rnd -= w;
    }
    return pool[pool.length - 1];
  }

  generateInitialGrid() {
    const grid = [];
    for (let c = 0; c < 6; c++) {
      const col = [];
      for (let r = 0; r < 5; r++) {
        col.push({
          sym: this.getRandomSymbol(),
          multiplier: null
        });
      }
      grid.push(col);
    }
    return grid;
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="olympus-cabinet">
        
        <!-- Top Banner: Zeus Character & Persistent Multiplier Meter -->
        <div class="olympus-header-meter">
          <div class="zeus-character-card">
            <div class="zeus-avatar-glow" id="olympusZeusAvatar">⚡</div>
            <div class="zeus-status-wrap">
              <span class="zeus-name">ZEUS 1000</span>
              <span class="zeus-sub" id="olympusZeusStatus">WAITING FOR SCATTERS...</span>
            </div>
          </div>
          
          <div class="olympus-mult-badge ${this.inFreeSpins && this.globalMultiplier > 0 ? 'active' : ''}" id="olympusGlobalMultBadge">
            <span class="mult-label">TOTAL MULTIPLIER</span>
            <span class="mult-value text-cyan" id="olympusGlobalMultVal">${this.globalMultiplier > 0 ? this.globalMultiplier + '×' : '1×'}</span>
          </div>
        </div>

        <!-- Free Spins Banner (Active during feature) -->
        <div class="olympus-fs-banner" id="olympusFsBanner" style="display: ${this.inFreeSpins ? 'flex' : 'none'};">
          <div class="fs-badge">⚡ FREE SPINS BONUS ⚡</div>
          <div class="fs-count">SPINS LEFT: <span class="text-gold font-bold" id="olympusFsLeft">${this.freeSpinsLeft}</span></div>
          <div class="fs-win">BONUS WIN: <span class="text-green font-bold" id="olympusFsTotalWin">$${this.totalFreeSpinsWin.toFixed(2)}</span></div>
        </div>

        <!-- 6x5 Grid Stage with Golden Greek Pillars Frame -->
        <div class="olympus-grid-frame" id="olympusGridFrame">
          <div class="olympus-grid-canvas" id="olympusGridCanvas">
            ${this.renderGridHTML()}
          </div>
          <div class="zeus-lightning-flash" id="zeusLightningFlash"></div>
        </div>

        <!-- Win & Status Bar -->
        <div class="slots-win-display">
          <div class="win-item">
            <span class="win-label">PAYS</span>
            <span class="win-val text-cyan">ANYWHERE (8+)</span>
          </div>
          <div class="win-item win-highlight-box">
            <span class="win-label">TUMBLE WIN</span>
            <span class="win-amount text-gold" id="olympusWinAmount">$0.00</span>
          </div>
          <div class="win-item">
            <span class="win-label">ROUND MULT</span>
            <span class="win-val text-purple font-bold" id="olympusRoundMultVal">1×</span>
          </div>
        </div>

        <!-- Quick Slot Toggles Strip: Buy Bonus (100x), Double Chance Ante, Turbo, Auto -->
        <div class="slots-quick-tools">
          <button class="slot-tool-btn btn-buy-bonus" id="olympusBuyBonusBtn">
            <span class="tool-icon">⚡</span>
            <span class="tool-label">BUY FREE SPINS (100×)</span>
          </button>
          <button class="slot-tool-btn ${this.anteBetActive ? 'active' : ''}" id="olympusAnteBetBtn">
            <span class="tool-icon">🔥</span>
            <span class="tool-label" id="olympusAnteLabel">DOUBLE CHANCE: ${this.anteBetActive ? 'ON' : 'OFF'}</span>
          </button>
          <button class="slot-tool-btn" id="olympusTurboBtn">
            <span class="tool-icon">⚡</span>
            <span class="tool-label" id="olympusTurboLabel">TURBO: OFF</span>
          </button>
          <button class="slot-tool-btn" id="olympusAutoBtn">
            <span class="tool-icon">🔄</span>
            <span class="tool-label" id="olympusAutoLabel">AUTO SPIN</span>
          </button>
        </div>

        <!-- Big Win & Bonus Celebration Modal -->
        <div class="slots-bigwin-modal" id="olympusCelebrationModal" style="display: none;">
          <div class="bigwin-content">
            <div class="bigwin-sparkles">⚡ 👑 🏆 ⚡</div>
            <div class="bigwin-title" id="olympusCelebrationTitle">ZEUS 1000 MEGA WIN!</div>
            <div class="bigwin-amount text-gold" id="olympusCelebrationAmount">$0.00</div>
            <div class="bigwin-mult text-cyan" id="olympusCelebrationDesc">CASCADING MULTIPLIER HIT!</div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  renderGridHTML() {
    let html = '';
    for (let c = 0; c < this.cols; c++) {
      html += `<div class="olympus-col" data-col="${c}">`;
      for (let r = 0; r < this.rows; r++) {
        const cell = this.grid[c][r];
        if (cell.multiplier) {
          const orbHTML = window.CasinoSymbols
            ? window.CasinoSymbols.renderOlympusMultiplierOrb(cell.multiplier)
            : `<div class="mult-orb-val">${cell.multiplier.val}×</div>`;

          html += `
            <div class="olympus-cell mult-cell" data-col="${c}" data-row="${r}">
              ${orbHTML}
            </div>
          `;
        } else {
          const symHTML = window.CasinoSymbols
            ? window.CasinoSymbols.getOlympusSymbol(cell.sym)
            : `<span class="olympus-sym">${cell.sym.char}</span>`;

          html += `
            <div class="olympus-cell" data-col="${c}" data-row="${r}">
              ${symHTML}
            </div>
          `;
        }
      }
      html += `</div>`;
    }
    return html;
  }

  bindEvents() {
    // Buy Bonus (100x)
    const buyBtn = this.container.querySelector('#olympusBuyBonusBtn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        if (this.isSpinning || this.inFreeSpins) return;
        const betInput = document.getElementById('unifiedBetInput');
        const bet = betInput ? parseFloat(betInput.value) || 10 : 10;
        const cost = bet * 100;

        if (window.appState.balance < cost) {
          window.app?.showToast('❌ Insufficient balance to Buy Free Spins ($' + cost.toFixed(2) + ')');
          return;
        }

        window.appState.deductBet(cost);
        window.app?.showToast('⚡ 15 FREE SPINS BOUGHT! Zeus descending!');
        this.spin(true);
      });
    }

    // Ante Bet / Double Chance (+25% bet)
    const anteBtn = this.container.querySelector('#olympusAnteBetBtn');
    const anteLabel = this.container.querySelector('#olympusAnteLabel');
    if (anteBtn) {
      anteBtn.addEventListener('click', () => {
        if (this.isSpinning) return;
        this.anteBetActive = !this.anteBetActive;
        anteBtn.classList.toggle('active', this.anteBetActive);
        anteLabel.textContent = `DOUBLE CHANCE: ${this.anteBetActive ? 'ON' : 'OFF'}`;
        window.app?.showToast(this.anteBetActive ? '🔥 Ante Bet Active (+25% Bet for 2x Free Spins Chance)' : 'Ante Bet Deactivated');
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Turbo Mode
    const turboBtn = this.container.querySelector('#olympusTurboBtn');
    const turboLabel = this.container.querySelector('#olympusTurboLabel');
    if (turboBtn) {
      turboBtn.addEventListener('click', () => {
        this.turboMode = !this.turboMode;
        turboLabel.textContent = this.turboMode ? 'TURBO: ON' : 'TURBO: OFF';
        turboBtn.classList.toggle('active', this.turboMode);
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Auto Spin
    const autoBtn = this.container.querySelector('#olympusAutoBtn');
    const autoLabel = this.container.querySelector('#olympusAutoLabel');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.autoSpinning = !this.autoSpinning;
        autoLabel.textContent = this.autoSpinning ? 'STOP AUTO' : 'AUTO SPIN';
        autoBtn.classList.toggle('btn-red', this.autoSpinning);
        if (this.autoSpinning && !this.isSpinning) {
          this.spin();
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  spin(forceBonus = false) {
    if (this.isSpinning) return;

    const betInput = document.getElementById('unifiedBetInput');
    let baseBet = betInput ? parseFloat(betInput.value) || 10 : 10;
    let actualBet = this.anteBetActive ? baseBet * 1.25 : baseBet;

    // Normal Spin Deduction (when not bought or in free spins)
    if (!forceBonus && !this.inFreeSpins) {
      if (!window.appState.deductBet(actualBet)) {
        window.app?.showToast('❌ Insufficient balance for bet ($' + actualBet.toFixed(2) + ')');
        this.autoSpinning = false;
        return;
      }
    }

    this.isSpinning = true;
    this.updateDockUI('SPINNING...', true);
    if (window.soundFX) window.soundFX.playSlotSpin();

    // Reset current round values
    this.activeMultipliers = [];
    const winDisplay = document.getElementById('olympusWinAmount');
    if (winDisplay) winDisplay.textContent = '$0.00';
    const roundMultDisplay = document.getElementById('olympusRoundMultVal');
    if (roundMultDisplay) roundMultDisplay.textContent = '1×';

    // Animate grid drop
    const gridCanvas = document.getElementById('olympusGridCanvas');
    if (gridCanvas) gridCanvas.classList.add('grid-falling');

    const spinDuration = this.turboMode ? 350 : 800;

    setTimeout(() => {
      if (gridCanvas) gridCanvas.classList.remove('grid-falling');

      // Generate New Grid
      this.generateNewGrid(forceBonus);
      if (gridCanvas) gridCanvas.innerHTML = this.renderGridHTML();

      // Check for Zeus Random Lightning Strike
      this.checkZeusRandomLightning(() => {
        // Start Cascade / Tumble evaluations
        this.evaluateTumbleCycle(actualBet, 0, () => {
          this.finishSpinRound(actualBet, forceBonus);
        });
      });

    }, spinDuration);
  }

  generateNewGrid(forceBonus) {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        this.grid[c][r] = {
          sym: this.getRandomSymbol(),
          multiplier: null
        };
      }
    }

    // Force 4+ Scatters if bought
    if (forceBonus) {
      const scatterSym = OLYMPUS_SYMBOLS.find(s => s.isScatter);
      const scatterCols = [0, 1, 2, 4];
      scatterCols.forEach(col => {
        this.grid[col][Math.floor(Math.random() * 5)].sym = scatterSym;
      });
    }
  }

  checkZeusRandomLightning(callback) {
    // 25% chance in normal, 45% in Free Spins for Zeus to strike
    const shouldStrike = this.inFreeSpins ? Math.random() < 0.45 : Math.random() < 0.28;

    if (!shouldStrike) {
      callback();
      return;
    }

    // Trigger Zeus Lightning Animation & Thunder
    const zeusAvatar = document.getElementById('olympusZeusAvatar');
    const zeusStatus = document.getElementById('olympusZeusStatus');
    const flash = document.getElementById('zeusLightningFlash');

    if (zeusAvatar) zeusAvatar.classList.add('zeus-striking');
    if (zeusStatus) zeusStatus.textContent = '⚡ ZEUS STRIKING MULTIPLIER! ⚡';
    if (flash) flash.classList.add('flash-active');
    if (window.soundFX && window.soundFX.playZeusStrike) window.soundFX.playZeusStrike();

    setTimeout(() => {
      if (flash) flash.classList.remove('flash-active');
      if (zeusAvatar) zeusAvatar.classList.remove('zeus-striking');

      // Drop 1 to 3 Multiplier Orbs into grid
      const orbCount = Math.random() < 0.8 ? 1 : (Math.random() < 0.9 ? 2 : 3);
      for (let i = 0; i < orbCount; i++) {
        const c = Math.floor(Math.random() * this.cols);
        const r = Math.floor(Math.random() * this.rows);
        const orbTier = this.pickRandomMultiplier();

        this.grid[c][r].multiplier = orbTier;
        this.activeMultipliers.push({ val: orbTier.val, color: orbTier.color, col: c, row: r });
      }

      // Re-render grid with orbs
      const gridCanvas = document.getElementById('olympusGridCanvas');
      if (gridCanvas) gridCanvas.innerHTML = this.renderGridHTML();

      // Update round multiplier display
      const totalRoundMult = this.activeMultipliers.reduce((acc, m) => acc + m.val, 0);
      const roundMultDisplay = document.getElementById('olympusRoundMultVal');
      if (roundMultDisplay) roundMultDisplay.textContent = `${totalRoundMult}×`;

      setTimeout(callback, this.turboMode ? 200 : 500);
    }, this.turboMode ? 300 : 600);
  }

  pickRandomMultiplier() {
    const totalWeight = MULTIPLIER_ORB_TIERS.reduce((acc, t) => acc + t.weight, 0);
    let rnd = Math.random() * totalWeight;
    for (const tier of MULTIPLIER_ORB_TIERS) {
      if (rnd < tier.weight) return tier;
      rnd -= tier.weight;
    }
    return MULTIPLIER_ORB_TIERS[0];
  }

  evaluateTumbleCycle(betAmount, accumulatedCashWin, onComplete) {
    // 1. Count occurrences of each non-scatter symbol
    const counts = {};
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const sym = this.grid[c][r].sym;
        if (!sym.isScatter && !this.grid[c][r].multiplier) {
          counts[sym.id] = (counts[sym.id] || 0) + 1;
        }
      }
    }

    // 2. Find winning symbols (8+)
    const winningSymIds = [];
    let cycleWin = 0;

    for (const [symId, count] of Object.entries(counts)) {
      if (count >= 8) {
        winningSymIds.push(symId);
        const symObj = OLYMPUS_SYMBOLS.find(s => s.id === symId);
        let multiplier = 0;
        if (count >= 12) multiplier = symObj.pays.min12;
        else if (count >= 10) multiplier = symObj.pays.min10;
        else multiplier = symObj.pays.min8;

        cycleWin += betAmount * multiplier;
      }
    }

    // Check Scatters (4+ pays and triggers free spins)
    let scatterCount = 0;
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[c][r].sym.isScatter) scatterCount++;
      }
    }

    if (scatterCount >= 4 && accumulatedCashWin === 0) {
      let scatterMult = scatterCount === 4 ? 3 : (scatterCount === 5 ? 5 : 100);
      cycleWin += betAmount * scatterMult;
    }

    // If no wins in this cycle, cascade is complete!
    if (winningSymIds.length === 0) {
      onComplete(accumulatedCashWin, scatterCount);
      return;
    }

    // 3. Highlight winning symbols with explosion
    if (window.soundFX && window.soundFX.playTumble) window.soundFX.playTumble();
    const cellsToExplode = [];

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const cell = this.grid[c][r];
        if (winningSymIds.includes(cell.sym.id)) {
          cellsToExplode.push({ c, r });
          const domCell = this.container.querySelector(`.olympus-cell[data-col="${c}"][data-row="${r}"]`);
          if (domCell) domCell.classList.add('cell-explode');
        }
      }
    }

    accumulatedCashWin += cycleWin;
    const winDisplay = document.getElementById('olympusWinAmount');
    if (winDisplay) winDisplay.textContent = `$${accumulatedCashWin.toFixed(2)}`;

    // 4. After explosion, collapse and drop new symbols
    const explodeDuration = this.turboMode ? 200 : 450;
    setTimeout(() => {
      this.applyTumbleDrop(cellsToExplode);

      const gridCanvas = document.getElementById('olympusGridCanvas');
      if (gridCanvas) gridCanvas.innerHTML = this.renderGridHTML();

      // Check next tumble cycle
      setTimeout(() => {
        this.evaluateTumbleCycle(betAmount, accumulatedCashWin, onComplete);
      }, this.turboMode ? 150 : 350);

    }, explodeDuration);
  }

  applyTumbleDrop(explodedCoords) {
    for (let c = 0; c < this.cols; c++) {
      // Find surviving cells in this column (shift down)
      const surviving = [];
      for (let r = this.rows - 1; r >= 0; r--) {
        const isExploded = explodedCoords.some(coord => coord.c === c && coord.row === r);
        if (!isExploded) {
          surviving.push(this.grid[c][r]);
        }
      }

      // Reconstruct column from bottom up
      const newCol = [];
      // Push surviving first
      for (let i = 0; i < surviving.length; i++) {
        newCol.unshift(surviving[i]);
      }

      // Fill remaining empty top spots with new symbols
      const needed = this.rows - newCol.length;
      for (let i = 0; i < needed; i++) {
        newCol.unshift({
          sym: this.getRandomSymbol(),
          multiplier: null
        });
      }

      this.grid[c] = newCol;
    }
  }

  finishSpinRound(betAmount, triggeredBonus) {
    let totalRoundMult = this.activeMultipliers.reduce((acc, m) => acc + m.val, 0);
    const winDisplay = document.getElementById('olympusWinAmount');
    let baseTumbleWin = parseFloat(winDisplay?.textContent.replace('$', '') || 0);

    let finalPayout = baseTumbleWin;

    // Apply multipliers if there was a tumble win
    if (baseTumbleWin > 0 && totalRoundMult > 0) {
      if (this.inFreeSpins) {
        this.globalMultiplier += totalRoundMult;
        const globalEl = document.getElementById('olympusGlobalMultVal');
        if (globalEl) globalEl.textContent = `${this.globalMultiplier}×`;
        finalPayout = baseTumbleWin * this.globalMultiplier;
      } else {
        finalPayout = baseTumbleWin * totalRoundMult;
      }
    } else if (this.inFreeSpins && this.globalMultiplier > 0 && baseTumbleWin > 0) {
      finalPayout = baseTumbleWin * this.globalMultiplier;
    }

    if (winDisplay) winDisplay.textContent = `$${finalPayout.toFixed(2)}`;

    // Add winnings to balance and record outcome (+50 XP if win)
    if (finalPayout > 0) {
      window.appState.recordBetOutcome('Gates of Olympus', betAmount, finalPayout, finalPayout / betAmount, finalPayout > betAmount);

      // Check Big Win Celebration
      const mult = finalPayout / betAmount;
      if (mult >= 20) {
        this.showCelebration(mult, finalPayout);
      } else if (window.soundFX) {
        window.soundFX.playSlotWin(finalPayout);
      }
    } else {
      window.appState.recordBetOutcome('Gates of Olympus', betAmount, 0, 0, false);
    }

    // Check Free Spins Trigger (4+ Scatters)
    let scatterCount = 0;
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[c][r].sym.isScatter) scatterCount++;
      }
    }

    if (scatterCount >= 4 || triggeredBonus) {
      if (!this.inFreeSpins) {
        this.triggerFreeSpins();
        return;
      } else {
        // Retrigger +5 Free Spins
        this.freeSpinsLeft += 5;
        window.app?.showToast('⚡ ZEUS RETRIGGER! +5 FREE SPINS AWARDED! ⚡');
        const fsLeftEl = document.getElementById('olympusFsLeft');
        if (fsLeftEl) fsLeftEl.textContent = this.freeSpinsLeft;
      }
    }

    // Continue Free Spins or end round
    if (this.inFreeSpins) {
      this.totalFreeSpinsWin += finalPayout;
      this.freeSpinsLeft--;
      const fsLeftEl = document.getElementById('olympusFsLeft');
      const fsWinEl = document.getElementById('olympusFsTotalWin');
      if (fsLeftEl) fsLeftEl.textContent = this.freeSpinsLeft;
      if (fsWinEl) fsWinEl.textContent = `$${this.totalFreeSpinsWin.toFixed(2)}`;

      if (this.freeSpinsLeft <= 0) {
        this.endFreeSpins();
      } else {
        setTimeout(() => {
          this.isSpinning = false;
          this.spin();
        }, this.turboMode ? 500 : 1200);
        return;
      }
    }

    this.isSpinning = false;
    this.updateDockUI('SPIN REELS', false);

    // Auto spin continuation
    if (this.autoSpinning && !this.inFreeSpins) {
      setTimeout(() => {
        if (this.autoSpinning) this.spin();
      }, this.turboMode ? 300 : 900);
    }
  }

  triggerFreeSpins() {
    this.inFreeSpins = true;
    this.freeSpinsLeft = 15;
    this.totalFreeSpinsWin = 0;
    this.globalMultiplier = 0;

    const banner = document.getElementById('olympusFsBanner');
    if (banner) banner.style.display = 'flex';
    const fsLeftEl = document.getElementById('olympusFsLeft');
    if (fsLeftEl) fsLeftEl.textContent = '15';
    const fsWinEl = document.getElementById('olympusFsTotalWin');
    if (fsWinEl) fsWinEl.textContent = '$0.00';

    if (window.soundFX && window.soundFX.playHoldAndSpinTrigger) window.soundFX.playHoldAndSpinTrigger();
    window.app?.showToast('⚡ 15 GATES OF OLYMPUS FREE SPINS TRIGGERED! ⚡');

    setTimeout(() => {
      this.isSpinning = false;
      this.spin();
    }, 1800);
  }

  endFreeSpins() {
    this.inFreeSpins = false;
    const banner = document.getElementById('olympusFsBanner');
    if (banner) banner.style.display = 'none';

    this.showCelebration(this.totalFreeSpinsWin / 10, this.totalFreeSpinsWin, 'FREE SPINS BONUS COMPLETE!');
  }

  showCelebration(mult, winAmount, titleOverride) {
    const modal = document.getElementById('olympusCelebrationModal');
    const title = document.getElementById('olympusCelebrationTitle');
    const amount = document.getElementById('olympusCelebrationAmount');
    const desc = document.getElementById('olympusCelebrationDesc');

    if (!modal) return;

    if (titleOverride) {
      title.textContent = titleOverride;
    } else if (mult >= 100) {
      title.textContent = '⚡ ZEUS 1000 MAX WIN! ⚡';
    } else if (mult >= 50) {
      title.textContent = '🏆 SENSATIONAL WIN! 🏆';
    } else {
      title.textContent = '🔥 MEGA WIN! 🔥';
    }

    if (amount) amount.textContent = `$${winAmount.toFixed(2)}`;
    if (desc) desc.textContent = `${mult.toFixed(1)}× TOTAL MULTIPLIER PAYOUT`;

    modal.style.display = 'flex';
    if (window.soundFX && window.soundFX.playMegaWin) window.soundFX.playMegaWin();

    setTimeout(() => {
      modal.style.display = 'none';
    }, 3800);
  }

  updateDockUI(text, disabled) {
    const mainBtn = document.getElementById('mainActionBtn');
    if (mainBtn && window.app?.activeGameId === 'olympus') {
      mainBtn.textContent = text;
      mainBtn.disabled = disabled;
      mainBtn.className = disabled ? 'dock-main-btn btn-grey' : 'dock-main-btn btn-gold';
    }
  }
}

window.GatesOfOlympusGame = GatesOfOlympusGame;
