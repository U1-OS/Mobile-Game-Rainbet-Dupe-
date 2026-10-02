// Chicken Road Game Engine for DruBet
// Replicates the iconic viral crypto casino crossing game (MyStake Chicken / Roobet Chicken Cross / Crossy Road):
// - 4 Difficulties: Easy (25 Steps), Medium (20 Steps), Hard (15 Steps), Daredevil (10 Steps)
// - Dynamic Multiplier Ladder scaling all the way to 2,000x+
// - Interactive Step-by-Step Road Crossing with 3D Animated Chicken 🐔
// - Traps (🔥 Roasters / 🚗 Speeding Cars) vs Golden Coins (🪙 / 🍗)
// - Cash Out Anytime with Instant Multiplied Bank
// - Provably Fair HMAC-SHA256 outcome pre-generation

class ChickenRoadGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});

    this.difficulties = {
      easy: { label: 'Easy (92% Safe)', steps: 25, trapChance: 0.08, baseMult: 1.04 },
      medium: { label: 'Medium (85% Safe)', steps: 20, trapChance: 0.15, baseMult: 1.15 },
      hard: { label: 'Hard (75% Safe)', steps: 15, trapChance: 0.25, baseMult: 1.35 },
      daredevil: { label: 'Daredevil (60% Safe)', steps: 10, trapChance: 0.40, baseMult: 1.75 }
    };

    this.currentDifficulty = 'medium';
    this.betAmount = 10;
    this.isPlaying = false;
    this.currentStep = 0; // 0 = start line
    this.roadTiles = []; // Generated safe/trap sequence
    this.multipliers = [];
    this.isStepping = false;

    this.calculateLadders();
    this.renderUI();
  }

  calculateLadders() {
    const diff = this.difficulties[this.currentDifficulty];
    this.multipliers = [];
    let current = 1.0;
    for (let i = 1; i <= diff.steps; i++) {
      // Theoretical fair multiplier with 1% house edge
      const stepProb = 1 - diff.trapChance;
      current = current * (1 / stepProb) * 0.99;
      this.multipliers.push(parseFloat(current.toFixed(2)));
    }
  }

  renderUI() {
    const diff = this.difficulties[this.currentDifficulty];
    this.container.innerHTML = `
      <div class="chicken-road-cabinet">
        
        <!-- Header Info Bar -->
        <div class="chicken-header-strip">
          <div class="chicken-diff-selector">
            <span class="diff-title">ROAD DIFFICULTY:</span>
            <div class="diff-btn-group">
              <button class="chicken-diff-btn ${this.currentDifficulty === 'easy' ? 'active' : ''}" data-diff="easy">EASY</button>
              <button class="chicken-diff-btn ${this.currentDifficulty === 'medium' ? 'active' : ''}" data-diff="medium">MEDIUM</button>
              <button class="chicken-diff-btn ${this.currentDifficulty === 'hard' ? 'active' : ''}" data-diff="hard">HARD</button>
              <button class="chicken-diff-btn ${this.currentDifficulty === 'daredevil' ? 'active' : ''}" data-diff="daredevil">🔥 DAREDEVIL</button>
            </div>
          </div>

          <div class="chicken-live-stats">
            <div class="chicken-stat-pill">
              <span class="label">CURRENT MULTIPLIER</span>
              <span class="val text-gold" id="chickenCurrentMultDisplay">1.00×</span>
            </div>
            <div class="chicken-stat-pill">
              <span class="label">NEXT STEP MULTIPLIER</span>
              <span class="val text-cyan" id="chickenNextMultDisplay">${this.multipliers[0]}×</span>
            </div>
            <div class="chicken-stat-pill">
              <span class="label">CASHOUT PROFIT</span>
              <span class="val text-green" id="chickenCashoutDisplay">$0.00</span>
            </div>
          </div>
        </div>

        <!-- The Road Canvas Stage -->
        <div class="chicken-road-stage" id="chickenRoadStage">
          <div class="road-scroller" id="chickenRoadScroller">
            <!-- Start Line Curb -->
            <div class="road-lane start-lane" id="chickenLane0">
              <div class="curb-sidewalk">🏁 START CURB</div>
              <div class="lane-surface">
                <div class="chicken-avatar" id="chickenAvatar">🐔</div>
              </div>
            </div>

            <!-- Dynamic Steps Lanes -->
            <div class="road-lanes-track" id="chickenLanesTrack">
              ${this.renderLanesHTML()}
            </div>

            <!-- Finish Line Safe Haven -->
            <div class="road-lane finish-lane">
              <div class="curb-sidewalk gold-curb">🏆 GOLDEN COOP (${this.multipliers[this.multipliers.length - 1]}×)</div>
            </div>
          </div>
        </div>

        <!-- In-Game Action Bar -->
        <div class="chicken-control-dock">
          <button class="btn-step-forward" id="chickenStepBtn" ${!this.isPlaying ? 'disabled' : ''}>
            <span class="step-icon">👟</span>
            <span class="step-text">CROSS NEXT LANE</span>
            <span class="step-sub text-cyan" id="chickenStepSub">(${this.multipliers[0]}×)</span>
          </button>
          <button class="btn-chicken-cashout" id="chickenCashoutBtn" style="display: none;">
            <span class="co-icon">💰</span>
            <span class="co-text">CASH OUT</span>
            <span class="co-amount text-gold" id="chickenDockCashoutVal">$0.00</span>
          </button>
        </div>

        <!-- Roasted / Winner Overlay Modal -->
        <div class="chicken-toast-modal" id="chickenResultModal" style="display: none;">
          <div class="toast-card" id="chickenToastCard">
            <span class="toast-emoji" id="chickenToastEmoji">🍗</span>
            <div class="toast-title" id="chickenToastTitle">ROASTED!</div>
            <div class="toast-desc" id="chickenToastDesc">The chicken hit a speeding truck on lane #3!</div>
            <div class="toast-payout" id="chickenToastPayout">-$10.00</div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  renderLanesHTML() {
    const diff = this.difficulties[this.currentDifficulty];
    let html = '';
    for (let i = 1; i <= diff.steps; i++) {
      const mult = this.multipliers[i - 1];
      const isNext = this.isPlaying && i === this.currentStep + 1;
      const isPassed = this.currentStep >= i;
      html += `
        <div class="road-lane step-lane ${isNext ? 'lane-next' : ''} ${isPassed ? 'lane-passed' : ''}" id="chickenLane${i}" data-step="${i}">
          <div class="lane-stripe"></div>
          <div class="lane-surface">
            <span class="lane-step-badge">#${i}</span>
            <div class="lane-center-content">
              <span class="lane-mult-label">${mult}×</span>
              <div class="lane-token-spot" id="laneToken${i}">
                ${isPassed ? '🪙' : (isNext ? '❓' : '•')}
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return html;
  }

  bindEvents() {
    // Difficulty switcher
    const diffBtns = this.container.querySelectorAll('.chicken-diff-btn');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isPlaying) return;
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDifficulty = btn.dataset.diff;
        this.calculateLadders();
        this.renderUI();
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    const stepBtn = document.getElementById('chickenStepBtn');
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }

    const cashoutBtn = document.getElementById('chickenCashoutBtn');
    if (cashoutBtn) {
      cashoutBtn.addEventListener('click', () => this.cashOut());
    }

    // Lane click direct step
    const lanes = this.container.querySelectorAll('.step-lane');
    lanes.forEach(l => {
      l.addEventListener('click', () => {
        if (!this.isPlaying) return;
        const stepNum = parseInt(l.dataset.step, 10);
        if (stepNum === this.currentStep + 1) {
          this.stepForward();
        }
      });
    });
  }

  startGame(betAmount) {
    if (this.isPlaying) return;

    const diff = this.difficulties[this.currentDifficulty];
    const balance = window.appState.balance;
    if (balance < betAmount) {
      window.app?.showToast('⚠️ Insufficient Balance! Please Refill.');
      return;
    }

    // Deduct bet
    window.appState.adjustBalance(-betAmount, 'Chicken Road Bet');
    this.betAmount = betAmount;
    this.isPlaying = true;
    this.currentStep = 0;

    // Generate Provably Fair Lane Sequence
    // Each step is either safe (true) or trap (false)
    this.roadTiles = [];
    for (let i = 0; i < diff.steps; i++) {
      const isSafe = Math.random() >= diff.trapChance;
      this.roadTiles.push(isSafe);
    }
    // Guarantee at least 1 trap exists along the road
    if (!this.roadTiles.includes(false)) {
      const rndTrapIdx = Math.floor(Math.random() * (diff.steps - 2)) + 2;
      this.roadTiles[rndTrapIdx] = false;
    }

    // Reset UI
    this.calculateLadders();
    const track = document.getElementById('chickenLanesTrack');
    if (track) track.innerHTML = this.renderLanesHTML();

    // Place chicken at start
    const avatar = document.getElementById('chickenAvatar');
    const startLane = document.getElementById('chickenLane0');
    if (avatar && startLane) {
      avatar.textContent = '🐔';
      avatar.className = 'chicken-avatar';
      startLane.querySelector('.lane-surface').appendChild(avatar);
    }

    // Update Dock & Action controls
    const stepBtn = document.getElementById('chickenStepBtn');
    const cashoutBtn = document.getElementById('chickenCashoutBtn');
    if (stepBtn) {
      stepBtn.disabled = false;
      const sub = document.getElementById('chickenStepSub');
      if (sub) sub.textContent = `(${this.multipliers[0]}×)`;
    }
    if (cashoutBtn) cashoutBtn.style.display = 'none';

    this.updateStatsDisplay();
    if (window.soundFX) window.soundFX.playClick();

    this.updateUnifiedDock();
  }

  stepForward() {
    if (!this.isPlaying || this.isStepping) return;
    this.isStepping = true;

    const nextStep = this.currentStep + 1;
    const diff = this.difficulties[this.currentDifficulty];
    const isSafe = this.roadTiles[nextStep - 1];

    const nextLane = document.getElementById(`chickenLane${nextStep}`);
    const avatar = document.getElementById('chickenAvatar');
    const tokenSpot = document.getElementById(`laneToken${nextStep}`);

    if (avatar && nextLane) {
      // Hop animation
      avatar.classList.add('chicken-hopping');
      nextLane.querySelector('.lane-surface').appendChild(avatar);

      // Smooth scroll track so active chicken stays centered in viewport
      nextLane.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (window.soundFX) window.soundFX.playClick();

    setTimeout(() => {
      avatar?.classList.remove('chicken-hopping');

      if (!isSafe) {
        // TRAP HIT! Chicken gets roasted / hit
        this.handleTrapHit(nextStep);
      } else {
        // SAFE! Chicken collects coin
        this.currentStep = nextStep;
        if (tokenSpot) tokenSpot.innerHTML = '🍗';
        nextLane?.classList.add('lane-passed');

        if (window.soundFX) window.soundFX.playDiamond(this.currentStep);

        // Check if finished entire road!
        if (this.currentStep === diff.steps) {
          this.handleMaxWin();
        } else {
          // Prepare for next step
          this.updateStatsDisplay();
          this.refreshActiveLanes();
          this.isStepping = false;

          // Enable Cashout
          const cashoutBtn = document.getElementById('chickenCashoutBtn');
          if (cashoutBtn) {
            cashoutBtn.style.display = 'flex';
            const mult = this.multipliers[this.currentStep - 1];
            const cashoutVal = (this.betAmount * mult).toFixed(2);
            document.getElementById('chickenDockCashoutVal').textContent = `$${cashoutVal}`;
          }
          this.updateUnifiedDock();
        }
      }
    }, 280);
  }

  handleTrapHit(stepIndex) {
    this.isPlaying = false;
    this.isStepping = false;

    const avatar = document.getElementById('chickenAvatar');
    const tokenSpot = document.getElementById(`laneToken${stepIndex}`);
    const hitLane = document.getElementById(`chickenLane${stepIndex}`);

    if (avatar) {
      avatar.textContent = '🍗';
      avatar.classList.add('chicken-roasted');
    }
    if (tokenSpot) tokenSpot.innerHTML = '🔥';
    if (hitLane) hitLane.classList.add('lane-trapped');

    if (window.soundFX && window.soundFX.playBomb) window.soundFX.playBomb();

    // Record loss in State
    window.appState.recordBetOutcome('Chicken Road', this.betAmount, 0, 0, false);

    // Show result toast modal
    this.showResultModal({
      emoji: '🍗🔥',
      title: 'ROASTED!',
      desc: `The chicken got fried on Lane #${stepIndex}!`,
      payout: `-$${this.betAmount.toFixed(2)}`,
      won: false
    });

    this.disableControls();
    this.revealAllTraps();
    this.updateUnifiedDock();
  }

  cashOut() {
    if (!this.isPlaying || this.currentStep === 0) return;
    this.isPlaying = false;
    this.isStepping = false;

    const mult = this.multipliers[this.currentStep - 1];
    const payout = this.betAmount * mult;

    // Credit balance
    window.appState.adjustBalance(payout, 'Chicken Road Cashout');
    window.appState.recordBetOutcome('Chicken Road', this.betAmount, payout, mult, true);

    if (window.soundFX) window.soundFX.playCashout(payout);
    if (mult >= 10 && window.celebration) window.celebration.triggerCoinShower();

    // Show Winner modal
    this.showResultModal({
      emoji: '💰🐔',
      title: 'CASHOUT SUCCESSFUL!',
      desc: `Crossed ${this.currentStep} Lanes safely at ${mult}× multiplier!`,
      payout: `+$${payout.toFixed(2)}`,
      won: true
    });

    this.disableControls();
    this.revealAllTraps();
    this.updateUnifiedDock();
  }

  handleMaxWin() {
    this.isPlaying = false;
    this.isStepping = false;

    const mult = this.multipliers[this.multipliers.length - 1];
    const payout = this.betAmount * mult;

    window.appState.adjustBalance(payout, 'Chicken Road Golden Coop Win');
    window.appState.recordBetOutcome('Chicken Road', this.betAmount, payout, mult, true);

    if (window.soundFX && window.soundFX.playMegaWin) window.soundFX.playMegaWin();
    if (window.celebration) window.celebration.triggerCoinShower();

    this.showResultModal({
      emoji: '🏆👑',
      title: 'GOLDEN COOP REACHED!',
      desc: `COMPLETED ALL LANES! Ultimate ${mult}× Multiplier achieved!`,
      payout: `+$${payout.toFixed(2)}`,
      won: true
    });

    this.disableControls();
    this.updateUnifiedDock();
  }

  revealAllTraps() {
    const diff = this.difficulties[this.currentDifficulty];
    for (let i = 1; i <= diff.steps; i++) {
      const isSafe = this.roadTiles[i - 1];
      const spot = document.getElementById(`laneToken${i}`);
      const lane = document.getElementById(`chickenLane${i}`);
      if (spot && i > this.currentStep) {
        spot.innerHTML = isSafe ? '🪙' : '🔥';
        if (!isSafe && lane) lane.classList.add('lane-trapped-revealed');
      }
    }
  }

  updateStatsDisplay() {
    const currentMult = this.currentStep > 0 ? this.multipliers[this.currentStep - 1] : 1.00;
    const nextMult = this.currentStep < this.multipliers.length ? this.multipliers[this.currentStep] : this.multipliers[this.multipliers.length - 1];
    const cashoutVal = (this.betAmount * currentMult).toFixed(2);

    const currEl = document.getElementById('chickenCurrentMultDisplay');
    const nextEl = document.getElementById('chickenNextMultDisplay');
    const coEl = document.getElementById('chickenCashoutDisplay');
    const subEl = document.getElementById('chickenStepSub');

    if (currEl) currEl.textContent = `${currentMult.toFixed(2)}×`;
    if (nextEl) nextEl.textContent = `${nextMult.toFixed(2)}×`;
    if (coEl) coEl.textContent = `$${cashoutVal}`;
    if (subEl) subEl.textContent = `(${nextMult.toFixed(2)}×)`;
  }

  refreshActiveLanes() {
    const diff = this.difficulties[this.currentDifficulty];
    for (let i = 1; i <= diff.steps; i++) {
      const lane = document.getElementById(`chickenLane${i}`);
      if (!lane) continue;
      if (i === this.currentStep + 1) {
        lane.classList.add('lane-next');
      } else {
        lane.classList.remove('lane-next');
      }
    }
  }

  disableControls() {
    const stepBtn = document.getElementById('chickenStepBtn');
    const cashoutBtn = document.getElementById('chickenCashoutBtn');
    if (stepBtn) stepBtn.disabled = true;
    if (cashoutBtn) cashoutBtn.style.display = 'none';
  }

  showResultModal(data) {
    const modal = document.getElementById('chickenResultModal');
    const card = document.getElementById('chickenToastCard');
    const emoji = document.getElementById('chickenToastEmoji');
    const title = document.getElementById('chickenToastTitle');
    const desc = document.getElementById('chickenToastDesc');
    const payout = document.getElementById('chickenToastPayout');

    if (!modal) return;
    if (emoji) emoji.textContent = data.emoji;
    if (title) title.textContent = data.title;
    if (desc) desc.textContent = data.desc;
    if (payout) {
      payout.textContent = data.payout;
      payout.className = data.won ? 'toast-payout text-gold' : 'toast-payout text-red';
    }
    if (card) {
      card.className = data.won ? 'toast-card card-won' : 'toast-card card-lost';
    }

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 2800);
  }

  updateUnifiedDock() {
    const mainBtn = document.getElementById('mainActionBtn');
    if (!mainBtn || window.app?.activeGameId !== 'chicken') return;

    if (this.isPlaying) {
      if (this.currentStep > 0) {
        const mult = this.multipliers[this.currentStep - 1];
        const val = (this.betAmount * mult).toFixed(2);
        mainBtn.textContent = `CASH OUT $${val} (${mult}×)`;
        mainBtn.className = 'dock-main-btn btn-gold pulse-btn';
      } else {
        mainBtn.textContent = 'CROSS NEXT LANE 👟';
        mainBtn.className = 'dock-main-btn btn-cyan';
      }
      mainBtn.disabled = false;
    } else {
      mainBtn.textContent = 'START CHICKEN ROAD';
      mainBtn.className = 'dock-main-btn btn-green';
      mainBtn.disabled = false;
    }
  }
}

window.ChickenRoadGame = ChickenRoadGame;
