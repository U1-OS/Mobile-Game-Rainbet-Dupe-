// Lightning Link Slot Engine for RainStake Mobile
// Replicates the world's most famous Vegas casino slot machine:
// - Authentic Hold & Spin Feature (6+ Lightning Orbs trigger, 3 Respins reset)
// - 4 Progressive Jackpots: GRAND ($10,000+), MAJOR ($500), MINOR ($50), MINI ($10)
// - Free Games with Giant 3x3 Mega Symbols on Center Reels (Sahara Gold / Tiki Fire)
// - Buy Feature (Hold & Spin 60x, Giant Free Games 80x)
// - Realistic Thunder, Orb lock, and Jackpot Tally Web Audio sound effects

const LIGHTNING_SYMBOLS = [
  { id: 'wild', char: '⚡', label: 'WILD', isWild: true, pays: [0, 0, 10, 50, 200], color: '#00f0ff' },
  { id: 'pharaoh', char: '🗿', label: 'TIKI', pays: [0, 0, 5, 25, 100], color: '#f59e0b' },
  { id: 'fire', char: '🔥', label: 'FIRE', pays: [0, 0, 4, 15, 60], color: '#ef4444' },
  { id: 'eagle', char: '🦅', label: 'EAGLE', pays: [0, 0, 3, 10, 40], color: '#10b981' },
  { id: 'bell', char: '🔔', label: 'BELL', pays: [0, 0, 2, 8, 30], color: '#fbbf24' },
  { id: 'ace', char: '🅰️', label: 'ACE', pays: [0, 0, 1, 4, 15], color: '#94a3b8' },
  { id: 'king', char: '👑', label: 'KING', pays: [0, 0, 1, 4, 15], color: '#94a3b8' },
  { id: 'queen', char: '👸', label: 'QUEEN', pays: [0, 0, 0.5, 2, 10], color: '#64748b' },
  { id: 'scatter', char: '🌋', label: 'SCATTER', isScatter: true, color: '#f97316' },
  { id: 'orb', char: '🌕', label: 'ORB', isOrb: true, color: '#eab308' }
];

const LIGHTNING_PAYLINES = [
  [[0,1], [1,1], [2,1], [3,1], [4,1]], // 1: Middle row
  [[0,0], [1,0], [2,0], [3,0], [4,0]], // 2: Top row
  [[0,2], [1,2], [2,2], [3,2], [4,2]], // 3: Bottom row
  [[0,0], [1,1], [2,2], [3,1], [4,0]], // 4: V shape
  [[0,2], [1,1], [2,0], [3,1], [4,2]], // 5: Inverted V
  [[0,1], [1,0], [2,0], [3,0], [4,1]], // 6: Top arch
  [[0,1], [1,2], [2,2], [3,2], [4,1]], // 7: Bottom arch
  [[0,0], [1,0], [2,1], [3,2], [4,2]], // 8: Diagonal down
  [[0,2], [1,2], [2,1], [3,0], [4,0]], // 9: Diagonal up
  [[0,1], [1,2], [2,1], [3,0], [4,1]], // 10: Zig zag
  [[0,1], [1,0], [2,1], [3,2], [4,1]], // 11: Wave
  [[0,0], [1,1], [2,0], [3,1], [4,0]], // 12: M shape
  [[0,2], [1,1], [2,2], [3,1], [4,2]], // 13: W shape
  [[0,0], [1,2], [2,0], [3,2], [4,0]], // 14: Sharp V
  [[0,2], [1,0], [2,2], [3,0], [4,2]]  // 15: Sharp Inverted V
];

class LightningLinkGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    
    // State
    this.isSpinning = false;
    this.turboMode = false;
    this.autoSpinning = false;
    this.inHoldAndSpin = false;
    this.inFreeGames = false;
    this.freeGamesLeft = 0;
    this.holdAndSpinRespins = 3;
    
    // Jackpot amounts (Simulated USD)
    this.jackpots = {
      grand: 10000.00,
      major: 500.00,
      minor: 50.00,
      mini: 10.00
    };

    // 5x3 Grid representations
    this.grid = this.generateInitialGrid();
    this.lockedOrbs = {}; // key: "col,row" -> { value, label, isJackpot }

    this.renderUI();
  }

  generateInitialGrid() {
    return [
      [{ sym: '🗿' }, { sym: '⚡' }, { sym: '🅰️' }],
      [{ sym: '🔥' }, { sym: '🌕', orbValue: 20 }, { sym: '👑' }],
      [{ sym: '🔔' }, { sym: '🗿' }, { sym: '🌕', orbValue: 50 }],
      [{ sym: '🌕', orbValue: 10 }, { sym: '🦅' }, { sym: '⚡' }],
      [{ sym: '👑' }, { sym: '🔥' }, { sym: '🅰️' }]
    ];
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="lightning-cabinet">
        
        <!-- Top Progressive Jackpots Header (Vegas Cabinet Screen) -->
        <div class="lightning-jackpots-marquee">
          <div class="jackpot-tier tier-grand">
            <span class="jackpot-label">GRAND JACKPOT</span>
            <span class="jackpot-val" id="llGrandJackpot">$10,000.00</span>
          </div>
          <div class="jackpot-sub-row">
            <div class="jackpot-tier tier-major">
              <span class="jackpot-label">MAJOR</span>
              <span class="jackpot-val" id="llMajorJackpot">$500.00</span>
            </div>
            <div class="jackpot-tier tier-minor">
              <span class="jackpot-label">MINOR</span>
              <span class="jackpot-val" id="llMinorJackpot">$50.00</span>
            </div>
            <div class="jackpot-tier tier-mini">
              <span class="jackpot-label">MINI</span>
              <span class="jackpot-val" id="llMiniJackpot">$10.00</span>
            </div>
          </div>
        </div>

        <!-- Hold & Spin Banner (Active during feature) -->
        <div class="holdspin-status-banner" id="llHoldSpinBanner" style="display: none;">
          <div class="holdspin-banner-inner">
            <div class="holdspin-badge">⚡ HOLD & SPIN ⚡</div>
            <div class="holdspin-respins-wrap">
              <span>RESPINS:</span>
              <div class="respins-indicators" id="llRespinsDots">
                <span class="respin-orb active">⚡</span>
                <span class="respin-orb active">⚡</span>
                <span class="respin-orb active">⚡</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 5x3 Reels Grid Frame with Electric Lightning Aura -->
        <div class="lightning-reels-wrapper" id="llReelsWrapper">
          <div class="lightning-grid-canvas" id="llReelsGrid">
            ${this.renderGridHTML()}
          </div>
          <svg class="slots-paylines-svg" id="llPaylinesSvg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
        </div>

        <!-- Win & Status Bar -->
        <div class="slots-win-display">
          <div class="win-item">
            <span class="win-label">LINES</span>
            <span class="win-val text-cyan">15 LINES</span>
          </div>
          <div class="win-item win-highlight-box">
            <span class="win-label">TOTAL WIN</span>
            <span class="win-amount text-gold" id="llWinAmount">$0.00</span>
          </div>
          <div class="win-item">
            <span class="win-label">FEATURE</span>
            <span class="win-val text-gold font-bold" id="llFeatureStatus">6 ORBS = HOLD&SPIN</span>
          </div>
        </div>

        <!-- Quick Slot Toggles Strip: Buy Hold & Spin, Free Games, Turbo, Auto -->
        <div class="slots-quick-tools">
          <button class="slot-tool-btn btn-buy-holdspin" id="llBuyHoldSpinBtn">
            <span class="tool-icon">🌕</span>
            <span class="tool-label">BUY HOLD & SPIN (60×)</span>
          </button>
          <button class="slot-tool-btn btn-buy-megagames" id="llBuyFreeGamesBtn">
            <span class="tool-icon">🌋</span>
            <span class="tool-label">BUY GIANT 3×3 (80×)</span>
          </button>
          <button class="slot-tool-btn" id="llTurboBtn">
            <span class="tool-icon">⚡</span>
            <span class="tool-label" id="llTurboLabel">TURBO: OFF</span>
          </button>
          <button class="slot-tool-btn" id="llAutoBtn">
            <span class="tool-icon">🔄</span>
            <span class="tool-label" id="llAutoLabel">AUTO SPIN</span>
          </button>
        </div>

        <!-- Giant Big Win & Jackpot Celebration Modal -->
        <div class="slots-bigwin-modal" id="llCelebrationModal" style="display: none;">
          <div class="bigwin-content">
            <div class="bigwin-sparkles">⚡ 🌕 🏆 ⚡</div>
            <div class="bigwin-title" id="llCelebrationTitle">GRAND JACKPOT!</div>
            <div class="bigwin-amount text-gold" id="llCelebrationAmount">$10,000.00</div>
            <div class="bigwin-mult text-cyan" id="llCelebrationDesc">ALL 15 ORBS LOCKED!</div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
    this.startJackpotTickers();
  }

  renderGridHTML() {
    const CHAR_TO_ID = {
      '⚡': 'wild',
      '🗿': 'pharaoh',
      '🔥': 'fire',
      '🦅': 'eagle',
      '🔔': 'bell',
      '👑': 'crown',
      '🅰️': 'ace',
      '👸': 'queen',
      '🌋': 'scatter',
      '🌕': 'orb'
    };

    let html = '';
    for (let col = 0; col < 5; col++) {
      html += `<div class="lightning-col" data-col="${col}">`;
      for (let row = 0; row < 3; row++) {
        const cell = this.grid[col][row];
        const isLocked = this.lockedOrbs[`${col},${row}`];
        
        if (cell.sym === '🌕' || isLocked) {
          const val = isLocked ? isLocked.value : (cell.orbValue || 20);
          const isJp = isLocked ? isLocked.isJackpot : cell.isJackpot;
          const jpName = isLocked ? isLocked.jackpotName : cell.jackpotName;
          
          const orbHTML = window.CasinoSymbols
            ? window.CasinoSymbols.renderLightningOrb(val, isJp, jpName)
            : `<div class="orb-amount">${isJp ? jpName : '$' + val}</div>`;

          html += `
            <div class="lightning-cell orb-cell ${isLocked ? 'locked-orb' : ''}" data-col="${col}" data-row="${row}">
              ${orbHTML}
            </div>
          `;
        } else {
          const symId = CHAR_TO_ID[cell.sym] || 'pharaoh';
          const symHTML = window.CasinoSymbols
            ? window.CasinoSymbols.get('ll_' + symId, { char: cell.sym })
            : `<span class="cell-symbol">${cell.sym}</span>`;

          html += `
            <div class="lightning-cell" data-col="${col}" data-row="${row}">
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
    // Buy Hold & Spin
    const buyHsBtn = this.container.querySelector('#llBuyHoldSpinBtn');
    if (buyHsBtn) {
      buyHsBtn.addEventListener('click', () => {
        if (this.isSpinning || this.inHoldAndSpin) return;
        const betInput = document.getElementById('unifiedBetInput');
        const bet = betInput ? parseFloat(betInput.value) || 10 : 10;
        const cost = bet * 60;
        
        if (window.appState.balance < cost) {
          window.app?.showToast('❌ Insufficient balance to Buy Hold & Spin ($' + cost.toFixed(2) + ')');
          return;
        }

        window.appState.deductBet(cost);
        window.app?.showToast('⚡ HOLD & SPIN BOUGHT! 6+ Lightning Orbs Triggering!');
        this.spin(true, false);
      });
    }

    // Buy Free Games
    const buyFgBtn = this.container.querySelector('#llBuyFreeGamesBtn');
    if (buyFgBtn) {
      buyFgBtn.addEventListener('click', () => {
        if (this.isSpinning || this.inHoldAndSpin) return;
        const betInput = document.getElementById('unifiedBetInput');
        const bet = betInput ? parseFloat(betInput.value) || 10 : 10;
        const cost = bet * 80;
        
        if (window.appState.balance < cost) {
          window.app?.showToast('❌ Insufficient balance to Buy Free Games ($' + cost.toFixed(2) + ')');
          return;
        }

        window.appState.deductBet(cost);
        window.app?.showToast('🌋 6 FREE GAMES BOUGHT! Giant 3x3 Mega Symbols active!');
        this.spin(false, true);
      });
    }

    // Turbo Button
    const turboBtn = this.container.querySelector('#llTurboBtn');
    const turboLabel = this.container.querySelector('#llTurboLabel');
    if (turboBtn) {
      turboBtn.addEventListener('click', () => {
        this.turboMode = !this.turboMode;
        turboLabel.textContent = this.turboMode ? 'TURBO: ON' : 'TURBO: OFF';
        turboBtn.classList.toggle('active', this.turboMode);
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Auto Button
    const autoBtn = this.container.querySelector('#llAutoBtn');
    const autoLabel = this.container.querySelector('#llAutoLabel');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.autoSpinning = !this.autoSpinning;
        autoLabel.textContent = this.autoSpinning ? 'STOP AUTO' : 'AUTO SPIN';
        autoBtn.classList.toggle('btn-red', this.autoSpinning);
        if (this.autoSpinning && !this.isSpinning && !this.inHoldAndSpin) {
          this.spin();
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  startJackpotTickers() {
    // Increment progressive jackpot slightly for live realism
    setInterval(() => {
      this.jackpots.grand += (Math.random() * 0.15);
      const grandEl = document.getElementById('llGrandJackpot');
      if (grandEl) grandEl.textContent = `$${this.jackpots.grand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }, 2000);
  }

  // Spin Method
  spin(forceHoldAndSpin = false, forceFreeGames = false) {
    if (this.isSpinning) return;
    
    // If in Hold & Spin, spin remaining empty cells
    if (this.inHoldAndSpin) {
      this.spinHoldAndSpinStep();
      return;
    }

    const betInput = document.getElementById('unifiedBetInput');
    const bet = betInput ? parseFloat(betInput.value) || 10 : 10;

    // Normal Spin Deduction
    if (!forceHoldAndSpin && !forceFreeGames && !this.inFreeGames) {
      if (!window.appState.deductBet(bet)) {
        window.app?.showToast('❌ Insufficient balance for bet ($' + bet.toFixed(2) + ')');
        this.autoSpinning = false;
        return;
      }
    }

    this.isSpinning = true;
    this.updateDockUI('SPINNING...', true);
    if (window.soundFX) window.soundFX.playSlotSpin();

    // Animate Reels Rolling
    const cols = this.container.querySelectorAll('.lightning-col');
    cols.forEach(col => col.classList.add('spinning-blur'));

    const spinDuration = this.turboMode ? 400 : 900;

    setTimeout(() => {
      cols.forEach(col => col.classList.remove('spinning-blur'));

      // Generate New Grid Outcome
      this.generateOutcomeGrid(bet, forceHoldAndSpin, forceFreeGames);
      
      const gridEl = document.getElementById('llReelsGrid');
      if (gridEl) gridEl.innerHTML = this.renderGridHTML();

      this.isSpinning = false;

      // Check if Hold & Spin Triggered (6 or more Orbs)
      const orbPositions = [];
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
          if (this.grid[c][r].sym === '🌕') {
            orbPositions.push({ col: c, row: r, data: this.grid[c][r] });
          }
        }
      }

      if (orbPositions.length >= 6) {
        this.triggerHoldAndSpin(orbPositions, bet);
        return;
      }

      // Check Scatters for Free Games (3+ Volcanos)
      let scatterCount = 0;
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
          if (this.grid[c][r].sym === '🌋') scatterCount++;
        }
      }

      if (scatterCount >= 3 || forceFreeGames) {
        this.triggerFreeGames(bet);
        return;
      }

      // Calculate Normal Payline Wins
      this.evaluatePaylineWins(bet);

    }, spinDuration);
  }

  generateOutcomeGrid(bet, forceHoldAndSpin, forceFreeGames) {
    const symbolList = ['⚡', '🗿', '🔥', '🦅', '🔔', '🅰️', '👑', '👸', '🌋', '🌕'];
    const weights = [4, 7, 9, 10, 12, 16, 16, 16, 4, 6];

    // Pick random symbol weighted
    const pickSym = () => {
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < symbolList.length; i++) {
        if (r < weights[i]) return symbolList[i];
        r -= weights[i];
      }
      return '🅰️';
    };

    let newGrid = [];
    for (let c = 0; c < 5; c++) {
      let col = [];
      for (let r = 0; r < 3; r++) {
        const sym = pickSym();
        if (sym === '🌕') {
          // Cash Orb
          const orbRnd = Math.random();
          let orbVal = Math.floor(bet * (1 + Math.floor(Math.random() * 5)));
          let isJp = false;
          let jpName = '';

          if (orbRnd < 0.05) {
            isJp = true;
            jpName = 'MAJOR';
            orbVal = this.jackpots.major;
          } else if (orbRnd < 0.15) {
            isJp = true;
            jpName = 'MINOR';
            orbVal = this.jackpots.minor;
          } else if (orbRnd < 0.30) {
            isJp = true;
            jpName = 'MINI';
            orbVal = this.jackpots.mini;
          } else {
            orbVal = Math.floor(bet * (1 + Math.floor(Math.random() * 10)));
          }

          col.push({ sym: '🌕', orbValue: orbVal, isJackpot: isJp, jackpotName: jpName });
        } else {
          col.push({ sym: sym });
        }
      }
      newGrid.push(col);
    }

    // If forced Hold & Spin, place 6 guaranteed Orbs!
    if (forceHoldAndSpin) {
      const positions = [
        [0,0], [1,1], [2,0], [2,2], [3,1], [4,2]
      ];
      positions.forEach(pos => {
        newGrid[pos[0]][pos[1]] = {
          sym: '🌕',
          orbValue: Math.floor(bet * (2 + Math.floor(Math.random() * 8))),
          isJackpot: Math.random() < 0.2,
          jackpotName: 'MINI'
        };
      });
    }

    // If forced Free Games, place 3 Scatters
    if (forceFreeGames) {
      newGrid[0][1] = { sym: '🌋' };
      newGrid[2][1] = { sym: '🌋' };
      newGrid[4][1] = { sym: '🌋' };
    }

    this.grid = newGrid;
  }

  // Hold & Spin Logic
  triggerHoldAndSpin(initialOrbs, bet) {
    this.inHoldAndSpin = true;
    this.holdAndSpinRespins = 3;
    this.lockedOrbs = {};

    initialOrbs.forEach(orb => {
      this.lockedOrbs[`${orb.col},${orb.row}`] = {
        value: orb.data.orbValue,
        isJackpot: orb.data.isJackpot,
        jackpotName: orb.data.jackpotName
      };
    });

    if (window.soundFX && window.soundFX.playHoldAndSpinTrigger) {
      window.soundFX.playHoldAndSpinTrigger();
    }
    if (window.soundFX && window.soundFX.playThunder) {
      window.soundFX.playThunder();
    }

    window.app?.showToast('⚡ HOLD & SPIN TRIGGERED! 3 Respins to lock more orbs!');

    const banner = document.getElementById('llHoldSpinBanner');
    if (banner) banner.style.display = 'block';
    this.updateRespinsIndicator();

    const wrapper = document.getElementById('llReelsWrapper');
    if (wrapper) wrapper.classList.add('holdspin-active');

    const gridEl = document.getElementById('llReelsGrid');
    if (gridEl) gridEl.innerHTML = this.renderGridHTML();

    this.updateDockUI('RESPIN (3 LEFT)', false);

    // If auto spinning, step immediately
    if (this.autoSpinning) {
      setTimeout(() => this.spinHoldAndSpinStep(), 1000);
    }
  }

  spinHoldAndSpinStep() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.updateDockUI('RESPINNING...', true);

    if (window.soundFX) window.soundFX.playSlotSpin();

    // Spin only unlocked cells
    const unlockedCells = this.container.querySelectorAll('.lightning-cell:not(.locked-orb)');
    unlockedCells.forEach(cell => cell.classList.add('spinning-blur'));

    const duration = this.turboMode ? 350 : 700;

    setTimeout(() => {
      unlockedCells.forEach(cell => cell.classList.remove('spinning-blur'));
      
      let newOrbLanded = false;
      const betInput = document.getElementById('unifiedBetInput');
      const bet = betInput ? parseFloat(betInput.value) || 10 : 10;

      // Evaluate each empty position
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
          const key = `${c},${r}`;
          if (!this.lockedOrbs[key]) {
            // Chance of landing an orb: 22%
            if (Math.random() < 0.22) {
              newOrbLanded = true;
              const isJp = Math.random() < 0.12;
              const jpName = Math.random() < 0.3 ? 'MAJOR' : (Math.random() < 0.5 ? 'MINOR' : 'MINI');
              const val = isJp ? (jpName === 'MAJOR' ? this.jackpots.major : (jpName === 'MINOR' ? this.jackpots.minor : this.jackpots.mini)) : Math.floor(bet * (1 + Math.floor(Math.random() * 10)));
              
              this.lockedOrbs[key] = { value: val, isJackpot: isJp, jackpotName: jpName };
              this.grid[c][r] = { sym: '🌕', orbValue: val, isJackpot: isJp, jackpotName: jpName };

              if (window.soundFX && window.soundFX.playOrbLock) {
                window.soundFX.playOrbLock(isJp);
              }
            } else {
              this.grid[c][r] = { sym: '' }; // blank
            }
          }
        }
      }

      const gridEl = document.getElementById('llReelsGrid');
      if (gridEl) gridEl.innerHTML = this.renderGridHTML();

      // Check if respins reset or decrement
      if (newOrbLanded) {
        this.holdAndSpinRespins = 3;
        window.app?.showToast('⚡ ORB LOCKED! Respins Reset to 3!');
      } else {
        this.holdAndSpinRespins--;
      }

      this.updateRespinsIndicator();

      // Check if all 15 cells are locked -> GRAND JACKPOT!
      const lockedCount = Object.keys(this.lockedOrbs).length;
      if (lockedCount === 15) {
        this.finishHoldAndSpin(true, bet);
        return;
      }

      // Check if respins expired
      if (this.holdAndSpinRespins <= 0) {
        this.finishHoldAndSpin(false, bet);
        return;
      }

      this.isSpinning = false;
      this.updateDockUI(`RESPIN (${this.holdAndSpinRespins} LEFT)`, false);

      if (this.autoSpinning) {
        setTimeout(() => this.spinHoldAndSpinStep(), 800);
      }
    }, duration);
  }

  updateRespinsIndicator() {
    const dotsEl = document.getElementById('llRespinsDots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const active = i < this.holdAndSpinRespins;
      dotsEl.innerHTML += `<span class="respin-orb ${active ? 'active' : ''}">${active ? '⚡' : '○'}</span>`;
    }
  }

  finishHoldAndSpin(isGrand, bet) {
    this.isSpinning = false;
    this.inHoldAndSpin = false;

    let totalFeatureWin = 0;
    Object.values(this.lockedOrbs).forEach(orb => {
      totalFeatureWin += orb.value;
    });

    if (isGrand) {
      totalFeatureWin += this.jackpots.grand;
      if (window.soundFX && window.soundFX.playThunder) window.soundFX.playThunder();
    }

    if (window.soundFX && window.soundFX.playBigWinFanfare) {
      window.soundFX.playBigWinFanfare();
    }

    // Award Win
    const mult = Math.floor((totalFeatureWin / bet) * 100) / 100;
    window.appState.recordOutcome('Lightning Link', bet, mult, totalFeatureWin);

    // Show Celebration Modal
    const modal = document.getElementById('llCelebrationModal');
    const title = document.getElementById('llCelebrationTitle');
    const amount = document.getElementById('llCelebrationAmount');
    const desc = document.getElementById('llCelebrationDesc');

    if (modal && title && amount && desc) {
      title.textContent = isGrand ? '🏆 GRAND JACKPOT WON! 🏆' : '⚡ HOLD & SPIN COMPLETE! ⚡';
      amount.textContent = `$${totalFeatureWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      desc.textContent = isGrand ? 'ALL 15 ORBS LOCKED! GRAND PRIZE UNLOCKED!' : `${Object.keys(this.lockedOrbs).length} ORBS COLLECTED!`;
      modal.style.display = 'flex';

      setTimeout(() => {
        modal.style.display = 'none';
        this.resetHoldAndSpinView();
      }, 3500);
    } else {
      this.resetHoldAndSpinView();
    }

    const winAmountEl = document.getElementById('llWinAmount');
    if (winAmountEl) winAmountEl.textContent = `$${totalFeatureWin.toFixed(2)}`;
  }

  resetHoldAndSpinView() {
    this.lockedOrbs = {};
    const banner = document.getElementById('llHoldSpinBanner');
    if (banner) banner.style.display = 'none';

    const wrapper = document.getElementById('llReelsWrapper');
    if (wrapper) wrapper.classList.remove('holdspin-active');

    this.updateDockUI('SPIN LIGHTNING', false);

    if (this.autoSpinning) {
      setTimeout(() => this.spin(), 800);
    }
  }

  // Free Games with Giant 3x3 Symbol
  triggerFreeGames(bet) {
    this.inFreeGames = true;
    this.freeGamesLeft = 6;
    window.app?.showToast('🌋 6 FREE GAMES WITH GIANT 3X3 SYMBOL STARTED!');
    if (window.soundFX) window.soundFX.playSlotWin(true);

    const featureStatus = document.getElementById('llFeatureStatus');
    if (featureStatus) featureStatus.textContent = 'FREE GAMES: 6 LEFT';

    this.runFreeGamesLoop(bet);
  }

  runFreeGamesLoop(bet) {
    if (this.freeGamesLeft <= 0) {
      this.inFreeGames = false;
      const featureStatus = document.getElementById('llFeatureStatus');
      if (featureStatus) featureStatus.textContent = '6 ORBS = HOLD&SPIN';
      window.app?.showToast('🎉 Free Games Finished!');
      this.updateDockUI('SPIN LIGHTNING', false);
      return;
    }

    this.freeGamesLeft--;
    const featureStatus = document.getElementById('llFeatureStatus');
    if (featureStatus) featureStatus.textContent = `FREE GAMES: ${this.freeGamesLeft} LEFT`;

    // Spin with center 3x3 mega symbol!
    this.isSpinning = true;
    this.updateDockUI(`FREE GAME (${this.freeGamesLeft} LEFT)`, true);

    setTimeout(() => {
      this.generateMegaGrid(bet);
      const gridEl = document.getElementById('llReelsGrid');
      if (gridEl) gridEl.innerHTML = this.renderGridHTML();
      this.isSpinning = false;

      // Evaluate win
      this.evaluatePaylineWins(bet);

      setTimeout(() => this.runFreeGamesLoop(bet), 1200);
    }, 800);
  }

  generateMegaGrid(bet) {
    // Generate reels 0 and 4 normally
    this.generateOutcomeGrid(bet, false, false);
    // Mega symbol on reels 1, 2, 3 (all identical!)
    const megaSym = Math.random() < 0.25 ? '⚡' : (Math.random() < 0.4 ? '🗿' : (Math.random() < 0.6 ? '🔥' : '👑'));
    for (let c = 1; c <= 3; c++) {
      for (let r = 0; r < 3; r++) {
        this.grid[c][r] = { sym: megaSym };
      }
    }
  }

  // Paylines Evaluation
  evaluatePaylineWins(bet) {
    let totalWin = 0;
    const lineBet = bet / LIGHTNING_PAYLINES.length;

    LIGHTNING_PAYLINES.forEach(lineCoords => {
      const symbolsOnLine = lineCoords.map(([col, row]) => this.grid[col][row].sym);
      const firstSym = symbolsOnLine[0];
      if (!firstSym || firstSym === '🌕' || firstSym === '🌋') return;

      let matchCount = 1;
      for (let i = 1; i < symbolsOnLine.length; i++) {
        if (symbolsOnLine[i] === firstSym || symbolsOnLine[i] === '⚡') {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const symDef = LIGHTNING_SYMBOLS.find(s => s.char === firstSym);
        if (symDef && symDef.pays && symDef.pays[matchCount - 1]) {
          const payout = lineBet * symDef.pays[matchCount - 1];
          totalWin += payout;
        }
      }
    });

    const mult = Math.floor((totalWin / bet) * 100) / 100;
    if (totalWin > 0) {
      window.appState.recordOutcome('Lightning Link', bet, mult, totalWin);
      if (window.soundFX) window.soundFX.playSlotWin(totalWin >= bet * 5);
    } else {
      window.appState.recordOutcome('Lightning Link', bet, 0, 0);
    }

    const winAmountEl = document.getElementById('llWinAmount');
    if (winAmountEl) winAmountEl.textContent = `$${totalWin.toFixed(2)}`;

    this.updateDockUI('SPIN LIGHTNING', false);

    if (this.autoSpinning && !this.inHoldAndSpin && !this.inFreeGames) {
      setTimeout(() => this.spin(), this.turboMode ? 300 : 800);
    }
  }

  updateDockUI(btnText, disabled) {
    const mainBtn = document.getElementById('mainActionBtn');
    if (mainBtn && window.app?.activeGameId === 'lightning') {
      mainBtn.textContent = btnText;
      mainBtn.className = disabled ? 'dock-main-btn btn-grey' : 'dock-main-btn btn-gold pulse-btn';
      mainBtn.disabled = disabled;
    }
  }
}

window.LightningLinkGame = LightningLinkGame;
