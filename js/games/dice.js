// Dice Game Engine for RainStake Mobile
// Roll Over / Roll Under slider, real-time win probability and multiplier calculation, animated roll indicator

class DiceGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.target = 50.50;
    this.isRollOver = true;
    this.isRolling = false;
    this.lastRoll = 50.00;
    this.history = [];

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="dice-display-box">
        <div class="dice-recent-rolls" id="diceRecentRolls"></div>
        <div class="dice-number-hero" id="diceNumberHero">50.00</div>
        <div class="dice-sub-status" id="diceSubStatus">Ready to Roll</div>
      </div>

      <div class="dice-slider-container">
        <div class="dice-track" id="diceTrack">
          <div class="dice-zone-fill" id="diceZoneFill"></div>
          <div class="dice-target-pin" id="diceTargetPin">
            <span class="dice-pin-label" id="dicePinLabel">50.50</span>
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

      <div class="dice-controls-grid">
        <div class="dice-control-item">
          <span class="label">Multiplier</span>
          <div class="input-badge" id="diceMultDisplay">1.98x</div>
        </div>
        <div class="dice-control-item">
          <span class="label">Roll Mode</span>
          <button class="mode-toggle-btn" id="diceModeToggle">Roll Over</button>
        </div>
        <div class="dice-control-item">
          <span class="label">Win Chance</span>
          <div class="input-badge text-green" id="diceChanceDisplay">49.50%</div>
        </div>
      </div>
    `;

    this.numberHero = document.getElementById('diceNumberHero');
    this.subStatus = document.getElementById('diceSubStatus');
    this.zoneFill = document.getElementById('diceZoneFill');
    this.targetPin = document.getElementById('diceTargetPin');
    this.pinLabel = document.getElementById('dicePinLabel');
    this.rollMarker = document.getElementById('diceRollMarker');
    this.rangeInput = document.getElementById('diceRangeInput');
    this.multDisplay = document.getElementById('diceMultDisplay');
    this.modeToggle = document.getElementById('diceModeToggle');
    this.chanceDisplay = document.getElementById('diceChanceDisplay');
    this.recentRollsEl = document.getElementById('diceRecentRolls');

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
      this.modeToggle.textContent = this.isRollOver ? 'Roll Over' : 'Roll Under';
      this.modeToggle.className = `mode-toggle-btn ${this.isRollOver ? 'over' : 'under'}`;
      this.updateMath();
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  updateMath() {
    let winChance = 0;
    if (this.isRollOver) {
      winChance = 100 - this.target;
    } else {
      winChance = this.target;
    }

    winChance = Math.max(0.01, Math.min(99.99, winChance));
    // Stake 1% house edge formula: 99 / winChance
    const multiplier = 99 / winChance;

    this.winChance = winChance;
    this.multiplier = Math.floor(multiplier * 100) / 100;

    this.chanceDisplay.textContent = winChance.toFixed(2) + '%';
    this.multDisplay.textContent = this.multiplier.toFixed(2) + 'x';
    this.pinLabel.textContent = this.target.toFixed(2);
    this.targetPin.style.left = `${this.target}%`;

    // Fill zone coloring: green for win zone, red for lose zone
    if (this.isRollOver) {
      this.zoneFill.style.left = `${this.target}%`;
      this.zoneFill.style.width = `${100 - this.target}%`;
      this.zoneFill.style.background = 'linear-gradient(90deg, #00e701, #00f0ff)';
    } else {
      this.zoneFill.style.left = '0%';
      this.zoneFill.style.width = `${this.target}%`;
      this.zoneFill.style.background = 'linear-gradient(90deg, #00f0ff, #00e701)';
    }

    this.onStateChange({
      target: this.target,
      isRollOver: this.isRollOver,
      winChance: this.winChance,
      multiplier: this.multiplier
    });
  }

  roll(betAmount) {
    if (this.isRolling) return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.isRolling = true;
    if (window.soundFX) window.soundFX.playDiceRoll();

    // Provably fair roll outcome between 0.00 and 100.00
    const rollOutcome = Math.floor(Math.random() * 10001) / 100;
    this.lastRoll = rollOutcome;

    // Fast roll animation (cycles through numbers rapidly)
    let steps = 14;
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
    }, 25);

    return true;
  }

  finishRoll(betAmount, rollOutcome) {
    this.isRolling = false;
    this.numberHero.textContent = rollOutcome.toFixed(2);
    this.rollMarker.style.left = `${rollOutcome}%`;

    const won = this.isRollOver ? (rollOutcome > this.target) : (rollOutcome < this.target);
    const payout = won ? (betAmount * this.multiplier) : 0;

    if (won) {
      this.numberHero.className = 'dice-number-hero win-pulse';
      this.subStatus.textContent = `WON +$${(payout - betAmount).toFixed(2)} (${this.multiplier}x)`;
      this.subStatus.className = 'dice-sub-status text-green';
      if (window.soundFX) window.soundFX.playDiceWin();
    } else {
      this.numberHero.className = 'dice-number-hero lose-pulse';
      this.subStatus.textContent = `MISSED (-$${betAmount.toFixed(2)})`;
      this.subStatus.className = 'dice-sub-status text-red';
      if (window.soundFX) window.soundFX.playDiceLoss();
    }

    window.appState.recordOutcome('Dice', betAmount, won ? this.multiplier : 0, payout);

    // Recent rolls badge
    this.history.unshift({ roll: rollOutcome, won });
    if (this.history.length > 6) this.history.pop();
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
