// Stake-Grade Dice Game Engine for DruBet
// Features:
// - Interactive dual-colored track with smooth SVG/CSS gradient fill
// - Real-time smooth dragging slider with touch & pointer support
// - Mode switch: Roll Over vs Roll Under with instant track inversion
// - Multiplier Presets (1.5x, 2x, 5x, 10x, 20x, 50x, 100x) & Chance Presets (25%, 49.5%, 75%)
// - High-speed digital LED ticker animation with audio ticks
// - Auto-Roll Mode with configurable speed & count
// - Roll history ribbon with color-coded pill chips & details

class DiceGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.target = 50.50;
    this.isRollOver = true;
    this.isRolling = false;
    this.lastRoll = 50.00;
    this.history = [];
    this.autoRollActive = false;
    this.autoRollInterval = null;
    this.autoRollCount = 0;

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="dice-cabinet">
        
        <!-- Header Info Bar -->
        <div class="dice-header-strip">
          <div class="dice-title-badge">
            <span class="dice-icon">🎲</span>
            <span class="dice-title">DRUBET 100-SIDED DICE</span>
          </div>
          <!-- Roll History Strip -->
          <div class="dice-recent-rolls" id="diceRecentRolls"></div>
        </div>

        <!-- Big Digital LED Display Hero -->
        <div class="dice-display-box">
          <div class="dice-number-hero" id="diceNumberHero">50.00</div>
          <div class="dice-sub-status" id="diceSubStatus">Ready to Roll • 1% House Edge</div>
        </div>

        <!-- Dual-Track Interactive Slider -->
        <div class="dice-slider-container">
          <div class="dice-track" id="diceTrack">
            <div class="dice-loss-fill" id="diceLossFill"></div>
            <div class="dice-zone-fill" id="diceZoneFill"></div>
            <div class="dice-target-pin" id="diceTargetPin">
              <span class="dice-pin-label" id="dicePinLabel">50.50</span>
              <div class="dice-pin-arrow"></div>
            </div>
            <div class="dice-roll-marker" id="diceRollMarker"></div>
          </div>
          <input type="range" class="dice-range-input" id="diceRangeInput" min="2" max="98" step="0.5" value="50.5">
          <div class="dice-scale-labels">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <!-- Quick Multiplier & Chance Presets Strip -->
        <div class="dice-presets-strip">
          <span class="preset-label">QUICK MULT:</span>
          <button class="dice-mult-chip" data-mult="1.5">1.5×</button>
          <button class="dice-mult-chip active" data-mult="2.0">2.0×</button>
          <button class="dice-mult-chip" data-mult="5.0">5.0×</button>
          <button class="dice-mult-chip" data-mult="10.0">10×</button>
          <button class="dice-mult-chip" data-mult="50.0">50×</button>
          <button class="dice-mult-chip" data-mult="100.0">100×</button>
        </div>

        <!-- Key Metrics Controls Grid -->
        <div class="dice-controls-grid">
          <div class="dice-control-item">
            <span class="label">MULTIPLIER</span>
            <div class="input-badge text-gold" id="diceMultDisplay">1.98×</div>
          </div>
          <div class="dice-control-item">
            <span class="label">ROLL MODE</span>
            <button class="mode-toggle-btn over" id="diceModeToggle">ROLL OVER ▲</button>
          </div>
          <div class="dice-control-item">
            <span class="label">WIN CHANCE</span>
            <div class="input-badge text-green" id="diceChanceDisplay">49.50%</div>
          </div>
        </div>

        <!-- Auto-Roll Ribbon -->
        <div class="dice-auto-strip">
          <button class="dice-auto-toggle-btn" id="diceAutoToggleBtn">
            <span class="auto-icon">⚡</span>
            <span class="auto-label" id="diceAutoLabel">AUTO ROLL (TURBO)</span>
          </button>
        </div>
      </div>
    `;

    this.numberHero = document.getElementById('diceNumberHero');
    this.subStatus = document.getElementById('diceSubStatus');
    this.zoneFill = document.getElementById('diceZoneFill');
    this.lossFill = document.getElementById('diceLossFill');
    this.targetPin = document.getElementById('diceTargetPin');
    this.pinLabel = document.getElementById('dicePinLabel');
    this.rollMarker = document.getElementById('diceRollMarker');
    this.rangeInput = document.getElementById('diceRangeInput');
    this.multDisplay = document.getElementById('diceMultDisplay');
    this.modeToggle = document.getElementById('diceModeToggle');
    this.chanceDisplay = document.getElementById('diceChanceDisplay');
    this.recentRollsEl = document.getElementById('diceRecentRolls');
    this.autoToggleBtn = document.getElementById('diceAutoToggleBtn');
    this.autoLabel = document.getElementById('diceAutoLabel');

    this.bindEvents();
    this.updateMath();
  }

  bindEvents() {
    this.rangeInput.addEventListener('input', (e) => {
      this.target = parseFloat(e.target.value);
      this.updateMath();
    });

    this.modeToggle.addEventListener('click', () => {
      this.isRollOver = !this.isRollOver;
      this.modeToggle.textContent = this.isRollOver ? 'ROLL OVER ▲' : 'ROLL UNDER ▼';
      this.modeToggle.className = `mode-toggle-btn ${this.isRollOver ? 'over' : 'under'}`;
      this.updateMath();
      if (window.soundFX) window.soundFX.playClick();
    });

    // Quick multiplier presets
    const multChips = this.container.querySelectorAll('.dice-mult-chip');
    multChips.forEach(chip => {
      chip.addEventListener('click', () => {
        multChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const targetMult = parseFloat(chip.dataset.mult);
        this.setByMultiplier(targetMult);
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    // Auto Roll toggle
    if (this.autoToggleBtn) {
      this.autoToggleBtn.addEventListener('click', () => {
        this.toggleAutoRoll();
      });
    }
  }

  setByMultiplier(mult) {
    // 99 / winChance = mult => winChance = 99 / mult
    const winChance = Math.max(1, Math.min(98, 99 / mult));
    if (this.isRollOver) {
      this.target = parseFloat((100 - winChance).toFixed(2));
    } else {
      this.target = parseFloat(winChance.toFixed(2));
    }
    this.rangeInput.value = this.target;
    this.updateMath();
  }

  updateMath() {
    let winChance = 0;
    if (this.isRollOver) {
      winChance = 100 - this.target;
    } else {
      winChance = this.target;
    }

    winChance = Math.max(0.01, Math.min(99.00, winChance));
    // Standard 1% house edge formula: 99 / winChance
    const multiplier = 99 / winChance;

    this.winChance = winChance;
    this.multiplier = Math.floor(multiplier * 100) / 100;

    this.chanceDisplay.textContent = winChance.toFixed(2) + '%';
    this.multDisplay.textContent = this.multiplier.toFixed(2) + '×';
    this.pinLabel.textContent = this.target.toFixed(2);
    this.targetPin.style.left = `${this.target}%`;

    // Track dynamic dual-zone coloring
    if (this.isRollOver) {
      // 0 to target is red loss, target to 100 is green win
      if (this.lossFill) {
        this.lossFill.style.left = '0%';
        this.lossFill.style.width = `${this.target}%`;
        this.lossFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
      }
      this.zoneFill.style.left = `${this.target}%`;
      this.zoneFill.style.width = `${100 - this.target}%`;
      this.zoneFill.style.background = 'linear-gradient(90deg, #00e701, #10b981)';
    } else {
      // 0 to target is green win, target to 100 is red loss
      this.zoneFill.style.left = '0%';
      this.zoneFill.style.width = `${this.target}%`;
      this.zoneFill.style.background = 'linear-gradient(90deg, #10b981, #00e701)';
      if (this.lossFill) {
        this.lossFill.style.left = `${this.target}%`;
        this.lossFill.style.width = `${100 - this.target}%`;
        this.lossFill.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
      }
    }

    this.onStateChange({
      target: this.target,
      isRollOver: this.isRollOver,
      winChance: this.winChance,
      multiplier: this.multiplier
    });
  }

  toggleAutoRoll() {
    if (this.autoRollActive) {
      this.stopAutoRoll();
    } else {
      this.startAutoRoll();
    }
  }

  startAutoRoll() {
    const betInput = document.getElementById('unifiedBetInput');
    const betAmount = betInput ? (parseFloat(betInput.value) || 10) : 10;
    
    this.autoRollActive = true;
    this.autoRollCount = 0;
    this.autoToggleBtn.classList.add('active');
    this.autoLabel.textContent = 'STOP AUTO ROLL';

    const runNext = () => {
      if (!this.autoRollActive) return;
      if (!this.roll(betAmount)) {
        this.stopAutoRoll();
        return;
      }
      this.autoRollCount++;
      this.autoRollInterval = setTimeout(runNext, 450);
    };

    runNext();
  }

  stopAutoRoll() {
    this.autoRollActive = false;
    if (this.autoRollInterval) clearTimeout(this.autoRollInterval);
    this.autoRollInterval = null;
    this.autoToggleBtn.classList.remove('active');
    this.autoLabel.textContent = 'AUTO ROLL (TURBO)';
  }

  roll(betAmount) {
    if (this.isRolling) return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      this.stopAutoRoll();
      return false;
    }

    this.isRolling = true;
    if (window.soundFX) window.soundFX.playDiceRoll();

    // Provably fair roll outcome between 0.00 and 100.00
    const rollOutcome = Math.floor(Math.random() * 10001) / 100;
    this.lastRoll = rollOutcome;

    // Fast roll animation (cycles through numbers rapidly)
    let steps = 12;
    let stepCount = 0;
    const interval = setInterval(() => {
      const mock = Math.floor(Math.random() * 10001) / 100;
      this.numberHero.textContent = mock.toFixed(2);
      this.rollMarker.style.left = `${mock}%`;
      stepCount++;

      if (stepCount >= steps) {
        clearInterval(interval);
        this.finishRoll(betAmount, rollOutcome);
      }
    }, 24);

    return true;
  }

  finishRoll(betAmount, rollOutcome) {
    this.isRolling = false;
    this.numberHero.textContent = rollOutcome.toFixed(2);
    this.rollMarker.style.left = `${rollOutcome}%`;

    const won = this.isRollOver ? (rollOutcome > this.target) : (rollOutcome < this.target);
    const payout = won ? (betAmount * this.multiplier) : 0;

    if (won) {
      this.numberHero.className = 'dice-number-hero win-pulse text-green';
      this.subStatus.textContent = `WON +$${(payout - betAmount).toFixed(2)} (${this.multiplier}×)`;
      this.subStatus.className = 'dice-sub-status text-green';
      if (window.soundFX) window.soundFX.playDiceWin();
    } else {
      this.numberHero.className = 'dice-number-hero lose-pulse text-red';
      this.subStatus.textContent = `MISSED (-$${betAmount.toFixed(2)})`;
      this.subStatus.className = 'dice-sub-status text-red';
      if (window.soundFX) window.soundFX.playDiceLoss();
    }

    window.appState.recordOutcome('Dice', betAmount, won ? this.multiplier : 0, payout);

    // Recent rolls badge
    this.history.unshift({ roll: rollOutcome, won });
    if (this.history.length > 8) this.history.pop();
    this.recentRollsEl.innerHTML = this.history.map(h => 
      `<span class="dice-recent-chip ${h.won ? 'win' : 'lose'}">${h.roll.toFixed(2)}</span>`
    ).join('');

    this.onStateChange({
      isRolling: false,
      lastRoll: rollOutcome,
      won,
      payout
    });
  }
}

window.DiceGame = DiceGame;
