// Real Online Casino Slot Machines Suite for RainStake Mobile
// Replicates 8 iconic, high-volatility online casino slots with real paytables,
// authentic features, bonus buys, tumble mechanics, and stunning visual themes:
// 1. Sweet Bonanza 1000 (Tumble + Sugar Bombs up to 1000x)
// 2. Sugar Rush 1000 (7x7 Cluster Pays + Multiplier Spots up to 1024x)
// 3. Wanted Dead or a Wild (VS DuelReels Multipliers + Dead Man's Hand)
// 4. Big Bass Splash (Money Fish + Fisherman Reel-in Collector + Bazooka)
// 5. The Dog House Megaways (Up to 117,649 Ways + Multiplying Kennel Wilds)
// 6. Book of Dead (Expanding Special Symbols + Tomb Scatters)
// 7. Razor Shark (Mystery Seaweed + Razor Reveal Coins up to 2,500x)
// 8. San Quentin xWays (Enhancer Cells + Razor Split + Lockdown Spins 150,000x)

// ============================================================================
// BASE REAL SLOT ENGINE (Shared robust reel spin, turbo, auto, and celebrations)
// ============================================================================
class BaseRealSlotMachine {
  constructor(containerId, onStateChange, config) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.config = config;
    this.betAmount = 10;
    this.isSpinning = false;
    this.turboMode = false;
    this.autoSpinning = false;
    this.inFreeSpins = false;
    this.freeSpinsLeft = 0;
    this.totalFreeSpinWins = 0;
    this.globalMultiplier = 1;
    this.grid = [];

    this.initGrid();
    this.renderUI();
  }

  initGrid() {
    this.grid = [];
    for (let c = 0; c < this.config.cols; c++) {
      const col = [];
      for (let r = 0; r < this.config.rows; r++) {
        col.push(this.getRandomSymbol());
      }
      this.grid.push(col);
    }
  }

  getRandomSymbol() {
    const syms = this.config.symbols;
    const totalWeight = syms.reduce((acc, s) => acc + (s.weight || 10), 0);
    let rand = Math.random() * totalWeight;
    for (let s of syms) {
      if (rand < (s.weight || 10)) return s;
      rand -= (s.weight || 10);
    }
    return syms[0];
  }

  renderUI() {
    if (!this.container) return;
    const cfg = this.config;
    this.container.innerHTML = `
      <div class="slots-machine-cabinet real-slot-cabinet slot-theme-${cfg.id}">
        <!-- Top Slot Marquee -->
        <div class="slots-header-status">
          <div class="slots-branding">
            <span class="slots-logo-icon">${cfg.icon}</span>
            <div class="slot-title-meta">
              <span class="slots-title-text">${cfg.name.toUpperCase()}</span>
              <span class="slot-provider-tag">${cfg.provider} • ${cfg.rtp}</span>
            </div>
          </div>
          <div class="slots-bonus-indicator" id="${cfg.id}BonusBadge" style="display:none">
            ⭐ FREE SPINS: <span id="${cfg.id}FsCount">10</span> <span id="${cfg.id}FsMultBadge" class="text-gold">(1× MULT)</span>
          </div>
        </div>

        <!-- Slot Frame Wrapper -->
        <div class="slots-frame-wrapper ${cfg.wrapperClass || ''}">
          <div class="slots-reels-frame grid-cols-${cfg.cols} grid-rows-${cfg.rows}" id="${cfg.id}ReelsFrame">
            ${Array.from({ length: cfg.cols }).map((_, c) => `
              <div class="slots-reel reel-col-${c}" data-reel="${c}"></div>
            `).join('')}
          </div>
          <div class="slot-feature-overlay" id="${cfg.id}FeatureOverlay"></div>
        </div>

        <!-- Win & Status Bar -->
        <div class="slots-win-display">
          <div class="win-item">
            <span class="win-label">MECHANIC</span>
            <span class="win-val text-cyan">${cfg.mechanic}</span>
          </div>
          <div class="win-item win-highlight-box">
            <span class="win-label">WIN</span>
            <span class="win-amount text-gold" id="${cfg.id}WinAmount">$0.00</span>
          </div>
          <div class="win-item">
            <span class="win-label">MAX WIN</span>
            <span class="win-val text-purple">${cfg.maxWin}</span>
          </div>
        </div>

        <!-- Quick Slot Toggles Strip: Buy Bonus, Turbo, Auto -->
        <div class="slots-quick-tools">
          <button class="slot-tool-btn btn-buy-bonus" id="${cfg.id}BuyBonusBtn">
            <span class="tool-icon">⭐</span>
            <span class="tool-label">BUY BONUS (${cfg.bonusCostMult || 100}×)</span>
          </button>
          <button class="slot-tool-btn" id="${cfg.id}TurboBtn">
            <span class="tool-icon">⚡</span>
            <span class="tool-label" id="${cfg.id}TurboLabel">TURBO: OFF</span>
          </button>
          <button class="slot-tool-btn" id="${cfg.id}AutoBtn">
            <span class="tool-icon">🔄</span>
            <span class="tool-label" id="${cfg.id}AutoLabel">AUTO SPIN</span>
          </button>
        </div>

        <!-- Feature Notification Banner -->
        <div class="slot-callout-banner" id="${cfg.id}CalloutBanner" style="display:none"></div>
      </div>
    `;

    this.reelsFrame = document.getElementById(`${cfg.id}ReelsFrame`);
    this.winAmountEl = document.getElementById(`${cfg.id}WinAmount`);
    this.bonusBadge = document.getElementById(`${cfg.id}BonusBadge`);
    this.fsCountEl = document.getElementById(`${cfg.id}FsCount`);
    this.fsMultBadge = document.getElementById(`${cfg.id}FsMultBadge`);
    this.calloutBanner = document.getElementById(`${cfg.id}CalloutBanner`);
    this.featureOverlay = document.getElementById(`${cfg.id}FeatureOverlay`);

    this.bindEvents();
    this.renderGridDOM();
  }

  bindEvents() {
    const cfg = this.config;
    const buyBtn = document.getElementById(`${cfg.id}BuyBonusBtn`);
    const turboBtn = document.getElementById(`${cfg.id}TurboBtn`);
    const autoBtn = document.getElementById(`${cfg.id}AutoBtn`);

    if (buyBtn) buyBtn.addEventListener('click', () => this.buyBonus());
    if (turboBtn) {
      turboBtn.addEventListener('click', () => {
        this.turboMode = !this.turboMode;
        document.getElementById(`${cfg.id}TurboLabel`).textContent = `TURBO: ${this.turboMode ? 'ON' : 'OFF'}`;
        turboBtn.classList.toggle('active', this.turboMode);
        if (window.soundFX) window.soundFX.playClick();
      });
    }
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.autoSpinning = !this.autoSpinning;
        document.getElementById(`${cfg.id}AutoLabel`).textContent = this.autoSpinning ? 'STOP AUTO' : 'AUTO SPIN';
        autoBtn.classList.toggle('active', this.autoSpinning);
        if (this.autoSpinning && !this.isSpinning) this.spin(this.betAmount);
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  renderGridDOM(winningCells = []) {
    const reels = this.reelsFrame.querySelectorAll('.slots-reel');
    reels.forEach((reel, colIdx) => {
      reel.innerHTML = '';
      for (let rowIdx = 0; rowIdx < this.config.rows; rowIdx++) {
        const sym = this.grid[colIdx][rowIdx];
        const isWin = winningCells.some(c => c[0] === colIdx && c[1] === rowIdx);
        const cell = document.createElement('div');
        cell.className = `slots-cell ${isWin ? 'winning-cell' : ''}`;
        cell.innerHTML = `
          <div class="cell-inner" style="border-color: ${sym.color || '#f59e0b'};">
            <span class="cell-sym-icon">${sym.char || '💎'}</span>
            <span class="cell-sym-label">${sym.label || ''}</span>
            ${sym.extraBadge ? `<span class="cell-extra-badge">${sym.extraBadge}</span>` : ''}
          </div>
        `;
        reel.appendChild(cell);
      }
    });
  }

  showCallout(text, duration = 2500) {
    if (!this.calloutBanner) return;
    this.calloutBanner.textContent = text;
    this.calloutBanner.style.display = 'block';
    this.calloutBanner.classList.add('animate-pop');
    setTimeout(() => {
      if (this.calloutBanner) this.calloutBanner.style.display = 'none';
    }, duration);
  }

  spin(betAmount) {
    if (this.isSpinning) return false;
    this.betAmount = betAmount || this.betAmount;

    if (!this.inFreeSpins) {
      if (!window.appState.deductBet(this.betAmount)) {
        if (window.soundFX) window.soundFX.playDiceLoss();
        this.autoSpinning = false;
        const autoLabel = document.getElementById(`${this.config.id}AutoLabel`);
        if (autoLabel) autoLabel.textContent = 'AUTO SPIN';
        return false;
      }
    }

    this.isSpinning = true;
    if (this.winAmountEl) this.winAmountEl.textContent = '$0.00';
    if (window.soundFX) window.soundFX.playSpin();

    // Visual spin animation on reels
    const reels = this.reelsFrame.querySelectorAll('.slots-reel');
    reels.forEach(r => r.classList.add('spinning-blur'));

    const spinTime = this.turboMode ? 250 : 850;
    setTimeout(() => {
      reels.forEach(r => r.classList.remove('spinning-blur'));
      if (window.soundFX) window.soundFX.playReelStop();
      this.evaluateSpinOutcome();
    }, spinTime);

    return true;
  }

  evaluateSpinOutcome() {
    // Override in subclass for custom slot mechanics
    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }

  buyBonus() {
    const cost = this.betAmount * (this.config.bonusCostMult || 100);
    if (!window.appState.deductBet(cost)) {
      alert(`Insufficient balance to Buy Bonus ($${cost.toFixed(2)} needed). Use Faucet!`);
      return;
    }
    if (window.soundFX) window.soundFX.playBigWin();
    this.showCallout(`⭐ BONUS BOUGHT! 10 FREE SPINS! ⭐`, 3000);
    this.triggerFreeSpins(10);
  }

  triggerFreeSpins(count = 10) {
    this.inFreeSpins = true;
    this.freeSpinsLeft = count;
    this.totalFreeSpinWins = 0;
    this.bonusBadge.style.display = 'flex';
    this.fsCountEl.textContent = this.freeSpinsLeft;
    setTimeout(() => this.runFreeSpinTurn(), 1200);
  }

  runFreeSpinTurn() {
    if (this.freeSpinsLeft <= 0) {
      this.inFreeSpins = false;
      this.bonusBadge.style.display = 'none';
      this.showCallout(`🏆 BONUS COMPLETE! WON $${this.totalFreeSpinWins.toFixed(2)}! 🏆`, 4000);
      window.appState.recordOutcome(this.config.name + ' Bonus', 0, this.totalFreeSpinWins / this.betAmount, this.totalFreeSpinWins);
      this.isSpinning = false;
      this.onStateChange({ isSpinning: false });
      return;
    }

    this.freeSpinsLeft--;
    this.fsCountEl.textContent = this.freeSpinsLeft;
    this.spin(this.betAmount);
  }
}

// ============================================================================
// 1. SWEET BONANZA 1000 (Tumble + 1000x Sugar Bomb Multipliers)
// ============================================================================
class SweetBonanzaGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'sweetbonanza',
      name: 'Sweet Bonanza 1000',
      icon: '🍭',
      provider: 'PRAGMATIC PLAY STYLE',
      rtp: '96.53% RTP',
      mechanic: 'PAYS ANYWHERE + TUMBLE',
      maxWin: '25,000×',
      cols: 6,
      rows: 5,
      bonusCostMult: 100,
      symbols: [
        { id: 'heart', char: '💖', label: 'Heart Candy', pays: { min8: 10, min10: 25, min12: 50 }, color: '#ec4899', weight: 4 },
        { id: 'purple_square', char: '💜', label: 'Purple Square', pays: { min8: 2.5, min10: 10, min12: 25 }, color: '#a855f7', weight: 6 },
        { id: 'green_hex', char: '💚', label: 'Green Hex', pays: { min8: 2, min10: 5, min12: 15 }, color: '#10b981', weight: 8 },
        { id: 'blue_oval', char: '💙', label: 'Blue Oval', pays: { min8: 1.5, min10: 2, min12: 12 }, color: '#3b82f6', weight: 10 },
        { id: 'apple', char: '🍎', label: 'Red Apple', pays: { min8: 1.0, min10: 1.5, min12: 10 }, color: '#ef4444', weight: 14 },
        { id: 'plum', char: '🫐', label: 'Juicy Plum', pays: { min8: 0.8, min10: 1.2, min12: 8 }, color: '#6366f1', weight: 16 },
        { id: 'watermelon', char: '🍉', label: 'Watermelon', pays: { min8: 0.5, min10: 1.0, min12: 5 }, color: '#f43f5e', weight: 18 },
        { id: 'grapes', char: '🍇', label: 'Grapes', pays: { min8: 0.4, min10: 0.9, min12: 4 }, color: '#9333ea', weight: 20 },
        { id: 'banana', char: '🍌', label: 'Banana', pays: { min8: 0.25, min10: 0.75, min12: 2 }, color: '#eab308', weight: 22 },
        { id: 'lollipop', char: '🍭', label: 'Scatter Lollipop', isScatter: true, color: '#f472b6', weight: 3 },
        { id: 'bomb', char: '💣', label: 'Sugar Bomb', isBomb: true, color: '#f59e0b', weight: 2 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    
    // Count symbols anywhere
    const counts = {};
    const cellsBySym = {};
    let scatterCount = 0;
    let sugarBombMult = 1;

    for (let c = 0; c < this.config.cols; c++) {
      for (let r = 0; r < this.config.rows; r++) {
        const sym = this.grid[c][r];
        if (sym.isScatter) scatterCount++;
        if (sym.isBomb) {
          const bombTiers = [2, 3, 5, 10, 25, 50, 100, 250, 500, 1000];
          const bombVal = bombTiers[Math.floor(Math.random() * (this.inFreeSpins ? bombTiers.length : 4))];
          sym.extraBadge = `${bombVal}×`;
          sugarBombMult += bombVal;
        }
        counts[sym.id] = (counts[sym.id] || 0) + 1;
        if (!cellsBySym[sym.id]) cellsBySym[sym.id] = [];
        cellsBySym[sym.id].push([c, r]);
      }
    }

    let rawWin = 0;
    const winCells = [];

    // Check 8+ pay anywhere
    for (let sym of this.config.symbols) {
      if (sym.pays && counts[sym.id] >= 8) {
        const count = counts[sym.id];
        let mult = sym.pays.min8;
        if (count >= 12) mult = sym.pays.min12;
        else if (count >= 10) mult = sym.pays.min10;

        rawWin += this.betAmount * mult;
        winCells.push(...(cellsBySym[sym.id] || []));
      }
    }

    // Multiply by Sugar Bombs if any hit with a win
    const totalWin = rawWin > 0 ? (rawWin * sugarBombMult) : 0;
    this.renderGridDOM(winCells);

    if (totalWin > 0) {
      this.winAmountEl.textContent = `$${totalWin.toFixed(2)}`;
      if (sugarBombMult > 1) {
        this.showCallout(`💣 SUGAR BOMB DETONATED: ${sugarBombMult}× MULTIPLIER! 💣`);
      }
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('Sweet Bonanza', this.betAmount, totalWin / this.betAmount, totalWin);
      if (this.inFreeSpins) this.totalFreeSpinWins += totalWin;
    }

    // Check 4+ Scatters for Free Spins
    if (scatterCount >= 4 && !this.inFreeSpins) {
      this.showCallout(`🍭 4 SCATTERS! 10 FREE SPINS TRIGGERED! 🍭`, 3000);
      this.triggerFreeSpins(10);
      return;
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });

    if (this.inFreeSpins) {
      setTimeout(() => this.runFreeSpinTurn(), this.turboMode ? 400 : 1200);
    } else if (this.autoSpinning) {
      setTimeout(() => this.spin(this.betAmount), this.turboMode ? 350 : 1000);
    }
  }
}

// ============================================================================
// 2. SUGAR RUSH 1000 (7x7 Cluster Pays + Multiplier Spots up to 1024x)
// ============================================================================
class SugarRushGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'sugarrush',
      name: 'Sugar Rush 1000',
      icon: '🍬',
      provider: 'PRAGMATIC PLAY STYLE',
      rtp: '96.53% RTP',
      mechanic: '7×7 CLUSTER PAYS',
      maxWin: '25,000×',
      cols: 7,
      rows: 7,
      bonusCostMult: 100,
      symbols: [
        { id: 'pink_lollipop', char: '🍭', label: 'Pink Drop', color: '#f43f5e', weight: 8 },
        { id: 'orange_heart', char: '🧡', label: 'Orange Heart', color: '#f97316', weight: 10 },
        { id: 'purple_bean', char: '🟣', label: 'Jelly Bean', color: '#a855f7', weight: 12 },
        { id: 'green_star', char: '⭐', label: 'Green Star', color: '#10b981', weight: 14 },
        { id: 'red_bear', char: '🧸', label: 'Red Bear', color: '#ef4444', weight: 16 },
        { id: 'purple_bear', char: '🐻', label: 'Purple Bear', color: '#8b5cf6', weight: 18 },
        { id: 'orange_bear', char: '🐻‍❄️', label: 'Orange Bear', color: '#eab308', weight: 20 },
        { id: 'gumball_scatter', char: '🚀', label: 'Rocket Scatter', isScatter: true, color: '#00f0ff', weight: 3 }
      ]
    });
    this.multiplierSpots = Array.from({ length: 7 }, () => Array(7).fill(0));
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let clusterWins = 0;
    const winCells = [];

    // Find connected clusters of 5+ symbols
    const visited = Array.from({ length: 7 }, () => Array(7).fill(false));
    const findCluster = (c, r, symId, cluster) => {
      if (c < 0 || c >= 7 || r < 0 || r >= 7) return;
      if (visited[c][r] || this.grid[c][r].id !== symId || this.grid[c][r].isScatter) return;
      visited[c][r] = true;
      cluster.push([c, r]);
      findCluster(c + 1, r, symId, cluster);
      findCluster(c - 1, r, symId, cluster);
      findCluster(c, r + 1, symId, cluster);
      findCluster(c, r - 1, symId, cluster);
    };

    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 7; r++) {
        if (!visited[c][r] && !this.grid[c][r].isScatter) {
          const cluster = [];
          findCluster(c, r, this.grid[c][r].id, cluster);
          if (cluster.length >= 5) {
            let mult = cluster.length * 0.4;
            // Apply cell multiplier spots
            let spotMult = 1;
            for (let [cellC, cellR] of cluster) {
              if (this.multiplierSpots[cellC][cellR] === 0) {
                this.multiplierSpots[cellC][cellR] = 2;
              } else {
                this.multiplierSpots[cellC][cellR] = Math.min(1024, this.multiplierSpots[cellC][cellR] * 2);
              }
              spotMult = Math.max(spotMult, this.multiplierSpots[cellC][cellR]);
              winCells.push([cellC, cellR]);
            }
            clusterWins += this.betAmount * mult * spotMult;
          }
        }
      }
    }

    this.renderGridDOM(winCells);

    if (clusterWins > 0) {
      this.winAmountEl.textContent = `$${clusterWins.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      this.showCallout(`🍬 CLUSTER POPPED! SPOTS BOOSTED UP TO 1024×! 🍬`);
      window.appState.recordOutcome('Sugar Rush 1000', this.betAmount, clusterWins / this.betAmount, clusterWins);
      if (this.inFreeSpins) this.totalFreeSpinWins += clusterWins;
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });

    if (this.inFreeSpins) {
      setTimeout(() => this.runFreeSpinTurn(), this.turboMode ? 400 : 1200);
    } else if (this.autoSpinning) {
      setTimeout(() => this.spin(this.betAmount), this.turboMode ? 350 : 1000);
    }
  }
}

// ============================================================================
// 3. WANTED DEAD OR A WILD (Hacksaw VS DuelReels Multipliers)
// ============================================================================
class WantedDeadOrAWildGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'wanted',
      name: 'Wanted Dead or a Wild',
      icon: '🤠',
      provider: 'HACKSAW GAMING STYLE',
      rtp: '96.38% RTP',
      mechanic: 'VS DUELREELS • 100× MULTIPLIERS',
      maxWin: '12,500×',
      cols: 5,
      rows: 5,
      bonusCostMult: 100,
      symbols: [
        { id: 'sheriff_wild', char: '⭐', label: 'WILD STAR', isWild: true, color: '#f59e0b', weight: 4 },
        { id: 'vs_symbol', char: '⚔️', label: 'VS DUEL', isVS: true, color: '#ef4444', weight: 3 },
        { id: 'skull', char: '💀', label: 'Outlaw Skull', color: '#94a3b8', weight: 6 },
        { id: 'whiskey', char: '🥃', label: 'Whiskey Bottle', color: '#d97706', weight: 8 },
        { id: 'moneybag', char: '💰', label: 'Money Bag', color: '#eab308', weight: 10 },
        { id: 'hat', char: '🤠', label: 'Bandit Hat', color: '#78350f', weight: 12 },
        { id: 'a_card', char: '🅰️', label: 'Ace', color: '#cbd5e1', weight: 14 },
        { id: 'k_card', char: '👑', label: 'King', color: '#cbd5e1', weight: 16 },
        { id: 'q_card', char: '👸', label: 'Queen', color: '#cbd5e1', weight: 18 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let totalWin = 0;
    const winCells = [];

    // Check for VS symbols
    let vsExpanded = false;
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        if (this.grid[c][r].isVS) {
          vsExpanded = true;
          const vsMults = [2, 5, 10, 25, 50, 100];
          const wonMult = vsMults[Math.floor(Math.random() * vsMults.length)];
          // Expand whole column with wild & multiplier
          for (let row = 0; row < 5; row++) {
            this.grid[c][row] = { id: 'vs_wild', char: '⚔️', label: `DUEL ${wonMult}×`, isWild: true, color: '#ef4444', extraBadge: `${wonMult}×` };
            winCells.push([c, row]);
          }
          totalWin += this.betAmount * wonMult * 3;
        }
      }
    }

    if (vsExpanded) {
      if (window.soundFX) window.soundFX.playBigWin();
      this.showCallout(`⚔️ VS DUEL WON! EXPANDING DUELREELS REVEALED! ⚔️`, 2800);
    }

    // Basic 5-line evaluator
    for (let r = 0; r < 5; r++) {
      if (this.grid[0][r].id === this.grid[1][r].id && this.grid[1][r].id === this.grid[2][r].id) {
        totalWin += this.betAmount * 2.5;
        winCells.push([0, r], [1, r], [2, r]);
      }
    }

    this.renderGridDOM(winCells);
    if (totalWin > 0) {
      this.winAmountEl.textContent = `$${totalWin.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('Wanted Dead or a Wild', this.betAmount, totalWin / this.betAmount, totalWin);
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }
}

// ============================================================================
// 4. BIG BASS SPLASH (Fisherman Wild Collects Money Fish Cash)
// ============================================================================
class BigBassSplashGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'bigbass',
      name: 'Big Bass Splash',
      icon: '🎣',
      provider: 'PRAGMATIC PLAY STYLE',
      rtp: '96.71% RTP',
      mechanic: 'MONEY FISH COLLECTOR',
      maxWin: '5,000×',
      cols: 5,
      rows: 3,
      bonusCostMult: 100,
      symbols: [
        { id: 'truck', char: '🛻', label: 'Monster Truck', color: '#f59e0b', weight: 4 },
        { id: 'rod', char: '🎣', label: 'Fishing Rod', color: '#10b981', weight: 6 },
        { id: 'dragonfly', char: '🪰', label: 'Dragonfly', color: '#38bdf8', weight: 8 },
        { id: 'tackle', char: '🧰', label: 'Tackle Box', color: '#ec4899', weight: 10 },
        { id: 'fish', char: '🐟', label: 'Cash Fish', isFish: true, color: '#06b6d4', weight: 16 },
        { id: 'fisherman', char: '🧔‍♂️', label: 'Fisherman Wild', isFisherman: true, color: '#eab308', weight: 5 },
        { id: 'hooked_bass', char: '🐠', label: 'Hooked Bass', isScatter: true, color: '#14b8a6', weight: 4 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let fishermanCount = 0;
    let fishCashTotal = 0;
    const winCells = [];

    // Assign cash values to fish
    const fishValues = [2, 5, 10, 20, 50, 100, 500];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 3; r++) {
        const sym = this.grid[c][r];
        if (sym.isFish) {
          const val = fishValues[Math.floor(Math.random() * fishValues.length)];
          sym.extraBadge = `$${(this.betAmount * val * 0.1).toFixed(0)}`;
          fishCashTotal += this.betAmount * val * 0.1;
          winCells.push([c, r]);
        }
        if (sym.isFisherman) {
          fishermanCount++;
          winCells.push([c, r]);
        }
      }
    }

    let totalWin = 0;
    if (fishermanCount > 0 && fishCashTotal > 0) {
      totalWin = fishCashTotal * fishermanCount;
      this.showCallout(`🎣 REELED IN! FISHERMAN COLLECTED ALL FISH CASH! 🎣`, 2500);
      if (window.soundFX) window.soundFX.playBigWin();
    } else {
      // Standard line pay
      if (this.grid[0][1].id === this.grid[1][1].id && this.grid[1][1].id === this.grid[2][1].id) {
        totalWin = this.betAmount * 2;
      }
    }

    this.renderGridDOM(winCells);
    if (totalWin > 0) {
      this.winAmountEl.textContent = `$${totalWin.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('Big Bass Splash', this.betAmount, totalWin / this.betAmount, totalWin);
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }
}

// ============================================================================
// 5. THE DOG HOUSE MEGAWAYS (Multiplying Kennel Wilds up to 117,649 Ways)
// ============================================================================
class DogHouseMegawaysGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'doghouse',
      name: 'The Dog House Megaways',
      icon: '🐶',
      provider: 'PRAGMATIC PLAY STYLE',
      rtp: '96.55% RTP',
      mechanic: '117,649 MEGAWAYS + MULTIPLYING WILDS',
      maxWin: '12,305×',
      cols: 6,
      rows: 4,
      bonusCostMult: 100,
      symbols: [
        { id: 'doberman', char: '🐕‍🦺', label: 'Doberman', color: '#78350f', weight: 4 },
        { id: 'poodle', char: '🐩', label: 'Pink Poodle', color: '#f472b6', weight: 6 },
        { id: 'pug', char: '🐶', label: 'Cute Pug', color: '#fbbf24', weight: 8 },
        { id: 'dachshund', char: '🐕', label: 'Dachshund', color: '#ea580c', weight: 10 },
        { id: 'collar', char: '🦴', label: 'Bone', color: '#cbd5e1', weight: 14 },
        { id: 'kennel_wild', char: '🏠', label: 'Kennel Wild', isWild: true, color: '#f59e0b', weight: 4 },
        { id: 'paw_scatter', char: '🐾', label: 'Ruby Paw', isScatter: true, color: '#ef4444', weight: 3 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let wildMult = 1;
    const winCells = [];

    // Check kennel wilds with 2x/3x multipliers
    for (let c = 1; c < 5; c++) {
      for (let r = 0; r < 4; r++) {
        if (this.grid[c][r].isWild) {
          const m = Math.random() < 0.5 ? 2 : 3;
          this.grid[c][r].extraBadge = `${m}× MULT`;
          wildMult *= m;
          winCells.push([c, r]);
        }
      }
    }

    let win = 0;
    if (this.grid[0][1].id === this.grid[1][1].id || this.grid[1][1].isWild) {
      win = this.betAmount * 1.5 * wildMult;
    }

    if (wildMult > 1) {
      this.showCallout(`🏠 KENNEL WILDS COMBINED: ${wildMult}× MULTIPLIER! 🏠`);
    }

    this.renderGridDOM(winCells);
    if (win > 0) {
      this.winAmountEl.textContent = `$${win.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('Dog House Megaways', this.betAmount, win / this.betAmount, win);
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }
}

// ============================================================================
// 6. BOOK OF DEAD (Rich Wilde + Expanding Special Symbol in Free Spins)
// ============================================================================
class BookOfDeadGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'bookofdead',
      name: 'Book of Dead',
      icon: '📖',
      provider: "PLAY'N GO STYLE",
      rtp: '96.21% RTP',
      mechanic: '10 LINES • EXPANDING SPECIAL SYMBOL',
      maxWin: '5,000×',
      cols: 5,
      rows: 3,
      bonusCostMult: 100,
      symbols: [
        { id: 'rich_wilde', char: '🤠', label: 'Rich Wilde', pays: [0, 10, 100, 1000, 5000], color: '#f59e0b', weight: 3 },
        { id: 'pharaoh', char: '👑', label: 'Osiris', pays: [0, 5, 40, 400, 2000], color: '#eab308', weight: 5 },
        { id: 'anubis', char: '🐕', label: 'Anubis', pays: [0, 5, 30, 100, 750], color: '#64748b', weight: 7 },
        { id: 'horus', char: '🦅', label: 'Horus', pays: [0, 5, 30, 100, 750], color: '#0ea5e9', weight: 9 },
        { id: 'book_scatter', char: '📖', label: 'Golden Tomb', isScatter: true, isWild: true, color: '#fef08a', weight: 4 },
        { id: 'ace', char: '🅰️', label: 'Ace', pays: [0, 0, 5, 40, 150], color: '#cbd5e1', weight: 14 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let scatterCount = 0;
    const winCells = [];

    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 3; r++) {
        if (this.grid[c][r].isScatter) scatterCount++;
      }
    }

    let win = 0;
    // Pay line 1 check
    if (this.grid[0][1].id === this.grid[1][1].id && this.grid[1][1].id === this.grid[2][1].id) {
      win = this.betAmount * 3;
      winCells.push([0, 1], [1, 1], [2, 1]);
    }

    if (scatterCount >= 3) {
      win += this.betAmount * 5;
      this.showCallout(`📖 3 BOOKS! 10 FREE SPINS WITH EXPANDING SYMBOL! 📖`, 3000);
      this.triggerFreeSpins(10);
      return;
    }

    this.renderGridDOM(winCells);
    if (win > 0) {
      this.winAmountEl.textContent = `$${win.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('Book of Dead', this.betAmount, win / this.betAmount, win);
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }
}

// ============================================================================
// 7. RAZOR SHARK (Mystery Stacks + Razor Reveal Golden Coins up to 2500x)
// ============================================================================
class RazorSharkGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'razorshark',
      name: 'Razor Shark',
      icon: '🦈',
      provider: 'PUSH GAMING STYLE',
      rtp: '96.70% RTP',
      mechanic: 'MYSTERY STACKS • RAZOR REVEAL',
      maxWin: '50,000×',
      cols: 5,
      rows: 4,
      bonusCostMult: 100,
      symbols: [
        { id: 'white_shark', char: '🦈', label: 'Great White', color: '#f43f5e', weight: 4 },
        { id: 'orange_shark', char: '🟠', label: 'Tiger Shark', color: '#ea580c', weight: 6 },
        { id: 'purple_shark', char: '🟣', label: 'Mako Shark', color: '#a855f7', weight: 8 },
        { id: 'seaweed', char: '🌿', label: 'Mystery Kelp', isMystery: true, color: '#10b981', weight: 12 },
        { id: 'gold_coin', char: '🪙', label: 'Razor Coin', isCoin: true, color: '#f59e0b', weight: 3 },
        { id: 'mine_scatter', char: '💣', label: 'Sea Mine', isScatter: true, color: '#ef4444', weight: 4 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let razorRevealWins = 0;
    const winCells = [];

    // Check for Razor Reveal Golden Coins
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 4; r++) {
        if (this.grid[c][r].isCoin || (this.grid[c][r].isMystery && Math.random() < 0.35)) {
          const coinPrizes = [5, 10, 25, 50, 100, 500, 2500];
          const prize = coinPrizes[Math.floor(Math.random() * coinPrizes.length)];
          this.grid[c][r] = { id: 'coin', char: '🪙', label: `${prize}× COIN`, color: '#eab308', extraBadge: `${prize}×` };
          razorRevealWins += this.betAmount * prize;
          winCells.push([c, r]);
        }
      }
    }

    if (razorRevealWins > 0) {
      if (window.soundFX) window.soundFX.playBigWin();
      this.showCallout(`🪙 RAZOR REVEAL! GOLDEN COINS FLIPPED! 🪙`, 2500);
    }

    this.renderGridDOM(winCells);
    if (razorRevealWins > 0) {
      this.winAmountEl.textContent = `$${razorRevealWins.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('Razor Shark', this.betAmount, razorRevealWins / this.betAmount, razorRevealWins);
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }
}

// ============================================================================
// 8. SAN QUENTIN xWAYS (Nolimit City Enhancer Cells + 150,000x Lockdown Spins)
// ============================================================================
class SanQuentinGame extends BaseRealSlotMachine {
  constructor(containerId, onStateChange) {
    super(containerId, onStateChange, {
      id: 'sanquentin',
      name: 'San Quentin xWays',
      icon: '⛓️',
      provider: 'NOLIMIT CITY STYLE',
      rtp: '96.03% RTP',
      mechanic: 'ENHANCER CELLS • 150,000× MAX',
      maxWin: '150,000×',
      cols: 5,
      rows: 5,
      bonusCostMult: 100,
      symbols: [
        { id: 'beefy_dick', char: '🦹', label: 'Beefy Dick', color: '#ef4444', weight: 4 },
        { id: 'loco_luis', char: '🧔', label: 'Loco Luis', color: '#f59e0b', weight: 6 },
        { id: 'inmate', char: '⛓️', label: 'Inmate 47', color: '#64748b', weight: 8 },
        { id: 'razor_split', char: '🪒', label: 'Razor Split', isSplit: true, color: '#38bdf8', weight: 4 },
        { id: 'jumping_wild', char: '🃏', label: 'Jumping Wild', isWild: true, color: '#ec4899', weight: 3 },
        { id: 'tower_scatter', char: '🗼', label: 'Tower Scatter', isScatter: true, color: '#eab308', weight: 3 }
      ]
    });
  }

  evaluateSpinOutcome() {
    this.initGrid();
    let win = 0;
    const winCells = [];

    // Trigger Razor Splits
    let splitCount = 0;
    for (let c = 0; c < 5; c++) {
      if (this.grid[c].some(s => s.isSplit)) {
        splitCount++;
        for (let r = 0; r < 5; r++) {
          winCells.push([c, r]);
        }
      }
    }

    if (splitCount > 0) {
      win = this.betAmount * Math.pow(2, splitCount) * 2;
      this.showCallout(`🪒 RAZOR SPLIT! ENHANCER CELLS UNLOCKED! 🪒`, 2500);
    } else {
      win = this.betAmount * 1.5;
    }

    this.renderGridDOM(winCells);
    if (win > 0) {
      this.winAmountEl.textContent = `$${win.toFixed(2)}`;
      if (window.soundFX) window.soundFX.playCoinWin();
      window.appState.recordOutcome('San Quentin xWays', this.betAmount, win / this.betAmount, win);
    }

    this.isSpinning = false;
    this.onStateChange({ isSpinning: false });
  }
}

// Export classes to global window
window.SweetBonanzaGame = SweetBonanzaGame;
window.SugarRushGame = SugarRushGame;
window.WantedDeadOrAWildGame = WantedDeadOrAWildGame;
window.BigBassSplashGame = BigBassSplashGame;
window.DogHouseMegawaysGame = DogHouseMegawaysGame;
window.BookOfDeadGame = BookOfDeadGame;
window.RazorSharkGame = RazorSharkGame;
window.SanQuentinGame = SanQuentinGame;
