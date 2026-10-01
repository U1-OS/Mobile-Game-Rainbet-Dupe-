// Limbo Game Engine for RainStake Mobile
// Stake classic: target multiplier rocket roll up to 1,000,000x with provably fair math

class LimboGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.targetMult = 2.00;
    this.isRolling = false;
    this.history = [];

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="limbo-display-card">
        <div class="limbo-recent-bar" id="limboRecentBar"></div>
        <div class="limbo-hero-mult" id="limboHeroMult">1.00x</div>
        <div class="limbo-sub-target" id="limboSubTarget">Target: 2.00x</div>
      </div>

      <div class="limbo-controls-grid">
        <div class="limbo-input-box">
          <label for="limboTargetInput">Target Multiplier</label>
          <div class="limbo-input-wrapper">
            <input type="number" id="limboTargetInput" value="2.00" min="1.01" max="1000000" step="0.1">
            <span class="mult-x">×</span>
          </div>
        </div>
        <div class="limbo-input-box">
          <label>Win Chance</label>
          <div class="limbo-chance-display" id="limboChanceDisplay">49.50%</div>
        </div>
      </div>
    `;

    this.heroMult = document.getElementById('limboHeroMult');
    this.subTarget = document.getElementById('limboSubTarget');
    this.targetInput = document.getElementById('limboTargetInput');
    this.chanceDisplay = document.getElementById('limboChanceDisplay');
    this.recentBar = document.getElementById('limboRecentBar');

    this.bindEvents();
    this.updateChance();
  }

  bindEvents() {
    this.targetInput.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value) || 1.01;
      this.targetMult = Math.max(1.01, Math.min(1000000, val));
      this.updateChance();
    });
  }

  updateChance() {
    // 99% / target
    const chance = Math.max(0.0001, Math.min(98.02, 99 / this.targetMult));
    this.chanceDisplay.textContent = chance.toFixed(2) + '%';
    this.subTarget.textContent = `Target: ${this.targetMult.toFixed(2)}x`;
  }

  roll(betAmount) {
    if (this.isRolling) return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.isRolling = true;
    if (window.soundFX) window.soundFX.playDiceRoll();

    // Standard Limbo outcome formula: 0.98 / (1 - rand)
    const rand = Math.random();
    const rawOutcome = Math.max(1.00, Math.floor((0.98 / (1 - rand)) * 100) / 100);
    const finalOutcome = Math.min(1000000, rawOutcome);

    let step = 0;
    const interval = setInterval(() => {
      const mock = (1.00 + Math.random() * (finalOutcome * 0.8)).toFixed(2);
      this.heroMult.textContent = mock + 'x';
      step++;

      if (step >= 12) {
        clearInterval(interval);
        this.finishRoll(betAmount, finalOutcome);
      }
    }, 28);

    return true;
  }

  finishRoll(betAmount, finalOutcome) {
    this.isRolling = false;
    this.heroMult.textContent = finalOutcome.toFixed(2) + 'x';

    const won = finalOutcome >= this.targetMult;
    const payout = won ? betAmount * this.targetMult : 0;

    if (won) {
      this.heroMult.className = 'limbo-hero-mult win-pulse text-green';
      if (window.soundFX) window.soundFX.playCashout();
    } else {
      this.heroMult.className = 'limbo-hero-mult lose-pulse text-red';
      if (window.soundFX) window.soundFX.playDiceLoss();
    }

    window.appState.recordOutcome('Limbo', betAmount, won ? this.targetMult : 0, payout);

    // Recent roll badge
    this.history.unshift({ outcome: finalOutcome, won });
    if (this.history.length > 7) this.history.pop();
    this.recentBar.innerHTML = this.history.map(h => `
      <span class="recent-mult-badge" style="background:${h.won ? 'rgba(0,231,1,0.2)' : 'rgba(255,73,73,0.2)'}; color:${h.won ? '#00e701' : '#ff4949'}">${h.outcome.toFixed(2)}x</span>
    `).join('');

    this.onStateChange({ isRolling: false, outcome: finalOutcome, won, payout });
  }
}

window.LimboGame = LimboGame;
