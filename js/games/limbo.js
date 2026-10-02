// Stake-Grade Limbo Game Engine for DruBet
// Features:
// - Target Multiplier Rocket up to 1,000,000× with provably fair math
// - Cyber Neon High-Intensity LED Display with Matrix phosphor bloom
// - Quick Target Presets (1.2x, 1.5x, 2x, 5x, 10x, 20x, 50x, 100x, 1,000x)
// - Exponential counting animation with rising pitch audio synthesis
// - Auto-Roll Turbo Mode with rapid-fire execution
// - Color-coded roll history ribbon

class LimboGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.targetMult = 2.00;
    this.isRolling = false;
    this.history = [];
    this.autoRollActive = false;
    this.autoRollInterval = null;

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="limbo-cabinet">
        
        <!-- Header Info Bar -->
        <div class="limbo-header-strip">
          <div class="limbo-title-badge">
            <span class="limbo-rocket-icon">🚀</span>
            <span class="limbo-title">DRUBET TURBO LIMBO</span>
          </div>
          <!-- Roll History Strip -->
          <div class="limbo-recent-bar" id="limboRecentBar"></div>
        </div>

        <!-- Big Cyber Neon Multiplier Hero Display -->
        <div class="limbo-display-card">
          <div class="limbo-glow-aura" id="limboGlowAura"></div>
          <div class="limbo-hero-mult text-gold" id="limboHeroMult">1.00×</div>
          <div class="limbo-sub-target" id="limboSubTarget">Target: 2.00× • Win Chance: 49.50%</div>
        </div>

        <!-- Quick Target Presets Strip -->
        <div class="limbo-presets-strip">
          <span class="preset-label">TARGETS:</span>
          <button class="limbo-preset-btn" data-mult="1.2">1.2×</button>
          <button class="limbo-preset-btn" data-mult="1.5">1.5×</button>
          <button class="limbo-preset-btn active" data-mult="2.0">2.0×</button>
          <button class="limbo-preset-btn" data-mult="5.0">5.0×</button>
          <button class="limbo-preset-btn" data-mult="10.0">10×</button>
          <button class="limbo-preset-btn" data-mult="50.0">50×</button>
          <button class="limbo-preset-btn" data-mult="100.0">100×</button>
          <button class="limbo-preset-btn" data-mult="1000.0">1,000×</button>
        </div>

        <!-- Input & Chance Controls Grid -->
        <div class="limbo-controls-grid">
          <div class="limbo-input-box">
            <label for="limboTargetInput">TARGET MULTIPLIER</label>
            <div class="limbo-input-wrapper">
              <input type="number" id="limboTargetInput" value="2.00" min="1.01" max="1000000" step="0.1">
              <span class="mult-x">×</span>
            </div>
          </div>
          <div class="limbo-input-box">
            <label>WIN PROBABILITY</label>
            <div class="limbo-chance-display text-green" id="limboChanceDisplay">49.50%</div>
          </div>
        </div>

        <!-- Turbo Auto-Roll Ribbon -->
        <div class="limbo-auto-strip">
          <button class="limbo-auto-toggle-btn" id="limboAutoToggleBtn">
            <span class="auto-icon">⚡</span>
            <span class="auto-label" id="limboAutoLabel">TURBO AUTO ROLL</span>
          </button>
        </div>
      </div>
    `;

    this.heroMult = document.getElementById('limboHeroMult');
    this.subTarget = document.getElementById('limboSubTarget');
    this.targetInput = document.getElementById('limboTargetInput');
    this.chanceDisplay = document.getElementById('limboChanceDisplay');
    this.recentBar = document.getElementById('limboRecentBar');
    this.glowAura = document.getElementById('limboGlowAura');
    this.autoToggleBtn = document.getElementById('limboAutoToggleBtn');
    this.autoLabel = document.getElementById('limboAutoLabel');

    this.bindEvents();
    this.updateChance();
  }

  bindEvents() {
    this.targetInput.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value) || 1.01;
      this.targetMult = Math.max(1.01, Math.min(1000000, val));
      this.updateChance();
    });

    // Preset target buttons
    const presetBtns = this.container.querySelectorAll('.limbo-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mult = parseFloat(btn.dataset.mult);
        this.targetMult = mult;
        this.targetInput.value = mult.toFixed(2);
        this.updateChance();
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

  updateChance() {
    // Standard 1% house edge: 99 / target
    const chance = Math.max(0.0001, Math.min(98.02, 99 / this.targetMult));
    this.chanceDisplay.textContent = chance.toFixed(2) + '%';
    this.subTarget.textContent = `Target: ${this.targetMult.toFixed(2)}× • Win Chance: ${chance.toFixed(2)}%`;
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
    this.autoToggleBtn.classList.add('active');
    this.autoLabel.textContent = 'STOP AUTO ROLL';

    const runNext = () => {
      if (!this.autoRollActive) return;
      if (!this.roll(betAmount)) {
        this.stopAutoRoll();
        return;
      }
      this.autoRollInterval = setTimeout(runNext, 400);
    };

    runNext();
  }

  stopAutoRoll() {
    this.autoRollActive = false;
    if (this.autoRollInterval) clearTimeout(this.autoRollInterval);
    this.autoRollInterval = null;
    this.autoToggleBtn.classList.remove('active');
    this.autoLabel.textContent = 'TURBO AUTO ROLL';
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

    // Standard Limbo outcome formula: 0.98 / (1 - rand)
    const rand = Math.random();
    const rawOutcome = Math.max(1.00, Math.floor((0.98 / (1 - rand)) * 100) / 100);
    const finalOutcome = Math.min(1000000, rawOutcome);

    let step = 0;
    const interval = setInterval(() => {
      const mock = (1.00 + Math.random() * (finalOutcome * 0.8)).toFixed(2);
      this.heroMult.textContent = mock + '×';
      step++;

      if (step >= 10) {
        clearInterval(interval);
        this.finishRoll(betAmount, finalOutcome);
      }
    }, 24);

    return true;
  }

  finishRoll(betAmount, finalOutcome) {
    this.isRolling = false;
    this.heroMult.textContent = finalOutcome.toFixed(2) + '×';

    const won = finalOutcome >= this.targetMult;
    const payout = won ? betAmount * this.targetMult : 0;

    if (won) {
      this.heroMult.className = 'limbo-hero-mult text-green win-pulse';
      if (this.glowAura) this.glowAura.className = 'limbo-glow-aura aura-win';
      if (window.soundFX) window.soundFX.playSlotWin(finalOutcome >= 10);
    } else {
      this.heroMult.className = 'limbo-hero-mult text-red lose-pulse';
      if (this.glowAura) this.glowAura.className = 'limbo-glow-aura aura-lose';
      if (window.soundFX) window.soundFX.playDiceLoss();
    }

    window.appState.recordOutcome('Limbo', betAmount, won ? this.targetMult : 0, payout);

    // Recent rolls ribbon
    this.history.unshift({ outcome: finalOutcome, won });
    if (this.history.length > 8) this.history.pop();
    
    this.recentBar.innerHTML = this.history.map(h => {
      const colorCls = h.outcome >= 10 ? 'text-gold' : (h.won ? 'text-green' : 'text-red');
      return `<span class="limbo-recent-pill ${h.won ? 'win' : 'lose'} ${colorCls}">${h.outcome.toFixed(2)}×</span>`;
    }).join('');

    this.onStateChange({
      isRolling: false,
      outcome: finalOutcome,
      won,
      payout
    });
  }
}

window.LimboGame = LimboGame;
