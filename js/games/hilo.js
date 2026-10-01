// Hi-Lo Game Engine for RainStake Mobile
// Stake original: predict Higher or Lower, compound streak multipliers, and cash out anytime

const HILO_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class HiLoGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.currentCard = null;
    this.cardHistory = [];
    this.currentMultiplier = 1.00;
    this.isPlaying = false;
    this.betAmount = 10;

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="hilo-table-wrapper">
        <div class="hilo-history-strip" id="hiloHistoryStrip"></div>

        <div class="hilo-card-arena">
          <div class="hilo-active-card-box" id="hiloActiveCardBox">
            <!-- Active Card DOM -->
          </div>

          <div class="hilo-streak-display">
            <span class="label">Total Multiplier</span>
            <span class="mult text-green" id="hiloStreakMult">1.00x</span>
            <span class="profit" id="hiloProfitDisplay">Cashout: $10.00</span>
          </div>
        </div>

        <div class="hilo-choices-grid" id="hiloChoicesGrid" style="display:none;">
          <button class="hilo-btn btn-higher" id="hiloHigherBtn">
            <span class="direction">HIGHER / SAME ▲</span>
            <span class="mult" id="hiloHigherOdds">1.50x</span>
          </button>
          <button class="hilo-btn btn-lower" id="hiloLowerBtn">
            <span class="direction">LOWER / SAME ▼</span>
            <span class="mult" id="hiloLowerOdds">1.50x</span>
          </button>
          <button class="hilo-btn btn-skip" id="hiloSkipBtn">
            <span>SKIP CARD ↻</span>
          </button>
        </div>
      </div>
    `;

    this.historyStrip = document.getElementById('hiloHistoryStrip');
    this.activeCardBox = document.getElementById('hiloActiveCardBox');
    this.streakMultEl = document.getElementById('hiloStreakMult');
    this.profitDisplay = document.getElementById('hiloProfitDisplay');
    this.choicesGrid = document.getElementById('hiloChoicesGrid');
    this.higherBtn = document.getElementById('hiloHigherBtn');
    this.lowerBtn = document.getElementById('hiloLowerBtn');
    this.skipBtn = document.getElementById('hiloSkipBtn');
    this.higherOddsEl = document.getElementById('hiloHigherOdds');
    this.lowerOddsEl = document.getElementById('hiloLowerOdds');

    this.bindEvents();
    this.showInitialCard();
  }

  bindEvents() {
    this.higherBtn.addEventListener('click', () => this.guess('higher'));
    this.lowerBtn.addEventListener('click', () => this.guess('lower'));
    this.skipBtn.addEventListener('click', () => this.skip());
  }

  getRandomCard() {
    const suits = ['♠', '♥', '♦', '♣'];
    const val = HILO_VALUES[Math.floor(Math.random() * HILO_VALUES.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
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

    const higherMult = Math.floor((12.87 / higherCount) * 100) / 100;
    const lowerMult = Math.floor((12.87 / lowerCount) * 100) / 100;

    this.higherOddsEl.textContent = `${higherMult.toFixed(2)}x`;
    this.lowerOddsEl.textContent = `${lowerMult.toFixed(2)}x`;

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
    this.cardHistory = [];
    this.historyStrip.innerHTML = '';

    this.currentCard = this.getRandomCard();
    this.activeCardBox.innerHTML = '';
    this.activeCardBox.appendChild(this.renderCardDOM(this.currentCard));

    this.streakMultEl.textContent = '1.00x';
    this.profitDisplay.textContent = `Cashout: $${this.betAmount.toFixed(2)}`;

    this.calculateOdds();
    this.choicesGrid.style.display = 'grid';

    if (window.soundFX) window.soundFX.playClick();
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

    // Archive current card to history
    this.cardHistory.unshift(this.currentCard);
    this.updateHistoryStrip();

    // Show next card
    this.currentCard = nextCard;
    this.activeCardBox.innerHTML = '';
    const newCardDOM = this.renderCardDOM(nextCard);
    this.activeCardBox.appendChild(newCardDOM);

    if (won) {
      const stepMult = this.odds[choice];
      this.currentMultiplier = Math.floor((this.currentMultiplier * stepMult) * 100) / 100;
      this.streakMultEl.textContent = `${this.currentMultiplier.toFixed(2)}x`;
      const cashoutAmt = this.betAmount * this.currentMultiplier;
      this.profitDisplay.textContent = `Cashout: $${cashoutAmt.toFixed(2)}`;

      this.calculateOdds();
      if (window.soundFX) window.soundFX.playDiamond();
      this.onStateChange({ isPlaying: true, multiplier: this.currentMultiplier, cashoutAmt });
    } else {
      // Loss
      this.endGame(false);
    }
  }

  skip() {
    if (!this.isPlaying) return;
    this.currentCard = this.getRandomCard();
    this.activeCardBox.innerHTML = '';
    this.activeCardBox.appendChild(this.renderCardDOM(this.currentCard));
    this.calculateOdds();
    if (window.soundFX) window.soundFX.playClick();
  }

  cashOut() {
    if (!this.isPlaying || this.currentMultiplier <= 1.0) return;
    const payout = this.betAmount * this.currentMultiplier;
    window.appState.recordOutcome('Hi-Lo', this.betAmount, this.currentMultiplier, payout);
    if (window.soundFX) window.soundFX.playCashout();
    this.endGame(true, payout);
  }

  endGame(won, payout = 0) {
    this.isPlaying = false;
    this.choicesGrid.style.display = 'none';

    if (!won) {
      window.appState.recordOutcome('Hi-Lo', this.betAmount, 0, 0);
      if (window.soundFX) window.soundFX.playBomb();
      this.profitDisplay.textContent = `BUSTED (-$${this.betAmount.toFixed(2)})`;
      this.profitDisplay.className = 'profit text-red';
    } else {
      this.profitDisplay.textContent = `WON +$${payout.toFixed(2)}!`;
      this.profitDisplay.className = 'profit text-green';
    }

    this.onStateChange({ isPlaying: false, won, payout });
  }

  updateHistoryStrip() {
    this.historyStrip.innerHTML = this.cardHistory.slice(0, 7).map(c => `
      <span class="hilo-mini-card ${c.isRed ? 'red-suit' : ''}">${c.val}${c.suit}</span>
    `).join('');
  }
}

window.HiLoGame = HiLoGame;
