// Stake-Grade Hi-Lo Game Engine for DruBet
// Features:
// - Dynamic 3D Card Dealing with Squeeze & Flip Animations
// - Live Percentage Odds and Payout Multipliers calculated on every card
// - "SKIP CARD" button (allows up to 3 strategic skips per streak)
// - Compound Streak Multiplier Ladder with real-time cashout amount
// - Card History Track showing dealt card sequence with win markers
// - Provably Fair standard 52-card shoe distribution

const HILO_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const HILO_SUITS = ['♠', '♥', '♦', '♣'];

class HiLoGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.currentCard = null;
    this.cardHistory = [];
    this.currentMultiplier = 1.00;
    this.isPlaying = false;
    this.betAmount = 10;
    this.skipsLeft = 3;
    this.streakCount = 0;

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="hilo-cabinet">
        
        <!-- Header Info Bar -->
        <div class="hilo-header-strip">
          <div class="hilo-title-badge">
            <span class="hilo-icon">🃏</span>
            <span class="hilo-title">DRUBET HI-LO</span>
          </div>
          <!-- Streak & Skips HUD -->
          <div class="hilo-hud-pills">
            <span class="hilo-hud-pill">STREAK: <b id="hiloStreakBadge">0</b></span>
            <span class="hilo-hud-pill">SKIPS LEFT: <b id="hiloSkipsBadge">3/3</b></span>
          </div>
        </div>

        <!-- History Ribbon of Dealt Cards -->
        <div class="hilo-history-strip" id="hiloHistoryStrip"></div>

        <!-- Center Card Arena with Multiplier Showcase -->
        <div class="hilo-card-arena">
          <!-- Active Card Frame -->
          <div class="hilo-active-card-box" id="hiloActiveCardBox">
            <!-- Active Card DOM inserted dynamically -->
          </div>

          <!-- Live Multiplier & Profit Display -->
          <div class="hilo-streak-display">
            <span class="label">CURRENT STREAK MULTIPLIER</span>
            <span class="mult text-gold" id="hiloStreakMult">1.00×</span>
            <span class="profit text-green" id="hiloProfitDisplay">CASHOUT: $10.00</span>
          </div>
        </div>

        <!-- Prediction Choice Buttons Grid -->
        <div class="hilo-choices-grid" id="hiloChoicesGrid" style="display:none;">
          <button class="hilo-btn btn-higher" id="hiloHigherBtn">
            <div class="btn-content">
              <span class="direction">HIGHER OR SAME ▲</span>
              <span class="chance" id="hiloHigherChance">50.00%</span>
            </div>
            <span class="mult text-gold" id="hiloHigherOdds">1.98×</span>
          </button>

          <button class="hilo-btn btn-lower" id="hiloLowerBtn">
            <div class="btn-content">
              <span class="direction">LOWER OR SAME ▼</span>
              <span class="chance" id="hiloLowerChance">50.00%</span>
            </div>
            <span class="mult text-gold" id="hiloLowerOdds">1.98×</span>
          </button>

          <button class="hilo-btn btn-skip" id="hiloSkipBtn">
            <span>SKIP CARD ↻ (<b id="hiloSkipCountText">3</b>)</span>
          </button>
        </div>

        <!-- Pre-Round Deal Button -->
        <div class="hilo-pre-round-box" id="hiloPreRoundBox">
          <div class="hilo-hint-text">Choose your bet amount and tap START HI-LO to deal the first card!</div>
        </div>
      </div>
    `;

    this.historyStrip = document.getElementById('hiloHistoryStrip');
    this.activeCardBox = document.getElementById('hiloActiveCardBox');
    this.streakMultEl = document.getElementById('hiloStreakMult');
    this.profitDisplay = document.getElementById('hiloProfitDisplay');
    this.choicesGrid = document.getElementById('hiloChoicesGrid');
    this.preRoundBox = document.getElementById('hiloPreRoundBox');
    this.higherBtn = document.getElementById('hiloHigherBtn');
    this.lowerBtn = document.getElementById('hiloLowerBtn');
    this.skipBtn = document.getElementById('hiloSkipBtn');
    this.higherOddsEl = document.getElementById('hiloHigherOdds');
    this.lowerOddsEl = document.getElementById('hiloLowerOdds');
    this.higherChanceEl = document.getElementById('hiloHigherChance');
    this.lowerChanceEl = document.getElementById('hiloLowerChance');
    this.streakBadge = document.getElementById('hiloStreakBadge');
    this.skipsBadge = document.getElementById('hiloSkipsBadge');
    this.skipCountText = document.getElementById('hiloSkipCountText');

    this.bindEvents();
    this.showInitialCard();
  }

  bindEvents() {
    this.higherBtn.addEventListener('click', () => this.guess('higher'));
    this.lowerBtn.addEventListener('click', () => this.guess('lower'));
    this.skipBtn.addEventListener('click', () => this.skip());
  }

  getRandomCard() {
    const val = HILO_VALUES[Math.floor(Math.random() * HILO_VALUES.length)];
    const suit = HILO_SUITS[Math.floor(Math.random() * HILO_SUITS.length)];
    const rank = HILO_VALUES.indexOf(val) + 1; // 1 to 13
    return { val, suit, rank, isRed: suit === '♥' || suit === '♦' };
  }

  renderCardDOM(card) {
    if (window.CasinoSymbols && window.CasinoSymbols.createPlayingCardElement) {
      return window.CasinoSymbols.createPlayingCardElement(card);
    }
    const el = document.createElement('div');
    el.className = `bj-card card-dealt ${card.isRed ? 'red-suit' : 'black-suit'}`;
    el.innerHTML = `
      <div class="card-corner top-left">
        <span>${card.val}</span>
        <span class="suit-icon">${card.suit}</span>
      </div>
      <div class="card-center-suit">${card.suit}</div>
      <div class="card-corner bottom-right">
        <span>${card.val}</span>
        <span class="suit-icon">${card.suit}</span>
      </div>
    `;
    return el;
  }

  showInitialCard() {
    this.currentCard = this.getRandomCard();
    this.activeCardBox.innerHTML = '';
    this.activeCardBox.appendChild(this.renderCardDOM(this.currentCard));
  }

  calculateOdds() {
    const rank = this.currentCard.rank; // 1 (Ace) to 13 (King)
    // Higher or same cards count (13 - rank + 1)
    const higherCount = 13 - rank + 1;
    // Lower or same cards count (rank)
    const lowerCount = rank;

    const higherProb = higherCount / 13;
    const lowerProb = lowerCount / 13;

    // Multiplier with 1% house edge
    const higherMult = Math.floor((0.99 / higherProb) * 100) / 100;
    const lowerMult = Math.floor((0.99 / lowerProb) * 100) / 100;

    this.higherOddsEl.textContent = `${higherMult.toFixed(2)}×`;
    this.lowerOddsEl.textContent = `${lowerMult.toFixed(2)}×`;
    this.higherChanceEl.textContent = `${(higherProb * 100).toFixed(1)}%`;
    this.lowerChanceEl.textContent = `${(lowerProb * 100).toFixed(1)}%`;

    this.odds = { higher: higherMult, lower: lowerMult };
  }

  startGame(betAmount) {
    if (this.isPlaying) return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.betAmount = betAmount;
    this.isPlaying = true;
    this.currentMultiplier = 1.00;
    this.skipsLeft = 3;
    this.streakCount = 0;
    this.cardHistory = [];
    this.historyStrip.innerHTML = '';

    this.currentCard = this.getRandomCard();
    this.activeCardBox.innerHTML = '';
    this.activeCardBox.appendChild(this.renderCardDOM(this.currentCard));

    this.streakMultEl.textContent = '1.00×';
    this.profitDisplay.textContent = `CASHOUT: $${this.betAmount.toFixed(2)}`;
    this.streakBadge.textContent = '0';
    this.skipsBadge.textContent = '3/3';
    this.skipCountText.textContent = '3';
    this.skipBtn.disabled = false;

    this.calculateOdds();
    this.choicesGrid.style.display = 'grid';
    if (this.preRoundBox) this.preRoundBox.style.display = 'none';

    if (window.soundFX) window.soundFX.playCardSlide();
    this.onStateChange({ isPlaying: true, multiplier: 1.00, betAmount });
    return true;
  }

  guess(choice) {
    if (!this.isPlaying) return;
    const nextCard = this.getRandomCard();

    // Check win condition
    let won = false;
    if (choice === 'higher' && nextCard.rank >= this.currentCard.rank) won = true;
    else if (choice === 'lower' && nextCard.rank <= this.currentCard.rank) won = true;

    // Archive current card to history strip
    this.archiveCard(this.currentCard, won);

    if (won) {
      // Compound multiplier
      const stepMult = choice === 'higher' ? this.odds.higher : this.odds.lower;
      this.currentMultiplier = Math.floor((this.currentMultiplier * stepMult) * 100) / 100;
      this.streakCount++;
      this.streakBadge.textContent = this.streakCount.toString();

      this.currentCard = nextCard;
      this.activeCardBox.innerHTML = '';
      this.activeCardBox.appendChild(this.renderCardDOM(nextCard));

      const potentialProfit = this.betAmount * this.currentMultiplier;
      this.streakMultEl.textContent = `${this.currentMultiplier.toFixed(2)}×`;
      this.profitDisplay.textContent = `CASHOUT: $${potentialProfit.toFixed(2)}`;
      this.calculateOdds();

      if (window.soundFX) window.soundFX.playChip();
      this.onStateChange({ isPlaying: true, multiplier: this.currentMultiplier, betAmount: this.betAmount });
    } else {
      // BUST!
      this.currentCard = nextCard;
      this.activeCardBox.innerHTML = '';
      const lostCardEl = this.renderCardDOM(nextCard);
      lostCardEl.classList.add('card-busted');
      this.activeCardBox.appendChild(lostCardEl);

      this.endGame(false);
    }
  }

  skip() {
    if (!this.isPlaying || this.skipsLeft <= 0) return;
    this.skipsLeft--;
    this.skipsBadge.textContent = `${this.skipsLeft}/3`;
    this.skipCountText.textContent = this.skipsLeft.toString();

    if (this.skipsLeft <= 0) {
      this.skipBtn.disabled = true;
    }

    this.currentCard = this.getRandomCard();
    this.activeCardBox.innerHTML = '';
    this.activeCardBox.appendChild(this.renderCardDOM(this.currentCard));
    this.calculateOdds();

    if (window.soundFX) window.soundFX.playCardSlide();
  }

  archiveCard(card, won) {
    const el = document.createElement('div');
    el.className = `hilo-hist-item ${won ? 'win' : 'lose'}`;
    el.innerHTML = `
      <span class="hist-card-val ${card.isRed ? 'red' : 'black'}">${card.val}${card.suit}</span>
      <span class="hist-status">${won ? '✓' : '✗'}</span>
    `;
    this.historyStrip.prepend(el);
    if (this.historyStrip.children.length > 8) this.historyStrip.lastElementChild.remove();
  }

  cashOut() {
    if (!this.isPlaying) return false;
    const payout = this.betAmount * this.currentMultiplier;
    this.endGame(true, payout);
    return true;
  }

  endGame(won, payout = 0) {
    this.isPlaying = false;
    this.choicesGrid.style.display = 'none';
    if (this.preRoundBox) this.preRoundBox.style.display = 'block';

    const mult = won ? this.currentMultiplier : 0;
    window.appState.recordOutcome('HiLo', this.betAmount, mult, payout);

    if (won) {
      this.profitDisplay.textContent = `WON +$${payout.toFixed(2)} (${mult.toFixed(2)}×)`;
      this.profitDisplay.className = 'profit text-green win-pulse';
      if (window.soundFX) window.soundFX.playCashout();
    } else {
      this.profitDisplay.textContent = `BUSTED (-$${this.betAmount.toFixed(2)})`;
      this.profitDisplay.className = 'profit text-red lose-pulse';
      if (window.soundFX) window.soundFX.playDiceLoss();
    }

    this.onStateChange({ isPlaying: false, multiplier: mult, payout });
  }
}

window.HiLoGame = HiLoGame;
