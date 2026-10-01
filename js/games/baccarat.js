// Baccarat Engine for RainStake Mobile
// Authentic Punto Banco rules: Player, Banker, Tie bets, 8/9 Naturals, Third Card Tableau, Bead Plate Roadmap

class BaccaratGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.selectedBetSide = 'player'; // 'player', 'banker', 'tie'
    this.betAmount = 25;
    this.isDealing = false;
    this.roadHistory = ['B', 'P', 'B', 'B', 'P', 'T', 'B', 'P', 'P']; // Roadmap

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="baccarat-felt-wrapper">
        <div class="bac-banner-title">PUNTO BANCO BACCARAT • MACAU RULES</div>

        <!-- Bead Plate History Roadmap -->
        <div class="bac-roadmap-bar" id="bacRoadmapBar"></div>

        <!-- Table Hands Area -->
        <div class="bac-hands-container">
          <!-- Player Hand -->
          <div class="bac-side-box player-side">
            <div class="bac-side-header">
              <span>PLAYER</span>
              <span class="bac-score-badge text-cyan" id="bacPlayerScore">0</span>
            </div>
            <div class="bac-cards-row" id="bacPlayerCards"></div>
          </div>

          <!-- VS Center Notice -->
          <div class="bac-vs-badge">VS</div>

          <!-- Banker Hand -->
          <div class="bac-side-box banker-side">
            <div class="bac-side-header">
              <span>BANKER</span>
              <span class="bac-score-badge text-gold" id="bacBankerScore">0</span>
            </div>
            <div class="bac-cards-row" id="bacBankerCards"></div>
          </div>
        </div>

        <!-- Outcome Banner -->
        <div class="bac-result-banner" id="bacResultBanner" style="display:none;">
          <span class="bac-result-title" id="bacResultTitle">BANKER WINS (8 over 5)</span>
          <span class="bac-result-payout text-gold" id="bacResultPayout">+$50.00</span>
        </div>

        <!-- Bet Position Selector -->
        <div class="bac-bet-selector">
          <button class="bac-bet-btn active" data-side="player">
            <span class="side-title">PLAYER</span>
            <span class="side-odds">1:1</span>
          </button>
          <button class="bac-bet-btn" data-side="tie">
            <span class="side-title">TIE</span>
            <span class="side-odds">8:1</span>
          </button>
          <button class="bac-bet-btn" data-side="banker">
            <span class="side-title">BANKER</span>
            <span class="side-odds">0.95:1</span>
          </button>
        </div>
      </div>
    `;

    this.playerScoreEl = document.getElementById('bacPlayerScore');
    this.bankerScoreEl = document.getElementById('bacBankerScore');
    this.playerCardsEl = document.getElementById('bacPlayerCards');
    this.bankerCardsEl = document.getElementById('bacBankerCards');
    this.roadmapBar = document.getElementById('bacRoadmapBar');
    this.resultBanner = document.getElementById('bacResultBanner');
    this.resultTitle = document.getElementById('bacResultTitle');
    this.resultPayout = document.getElementById('bacResultPayout');

    this.bindEvents();
    this.updateRoadmap();
  }

  bindEvents() {
    const btns = this.container.querySelectorAll('.bac-bet-btn');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        if (this.isDealing) return;
        btns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        this.selectedBetSide = b.dataset.side;
        if (window.soundFX) window.soundFX.playClick();
      });
    });
  }

  updateRoadmap() {
    if (!this.roadmapBar) return;
    this.roadmapBar.innerHTML = this.roadHistory.slice(-14).map(r => {
      const cls = r === 'P' ? 'bead-p' : (r === 'B' ? 'bead-b' : 'bead-t');
      return `<span class="bac-bead ${cls}">${r}</span>`;
    }).join('');
  }

  drawCard() {
    const suits = ['♠', '♥', '♦', '♣'];
    const vals = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const val = vals[Math.floor(Math.random() * vals.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    let pt = 0;
    if (val === 'A') pt = 1;
    else if (['10', 'J', 'Q', 'K'].includes(val)) pt = 0;
    else pt = parseInt(val, 10);

    return { val, suit, pt, isRed: suit === '♥' || suit === '♦' };
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

  calculateTotal(cards) {
    return cards.reduce((sum, c) => sum + c.pt, 0) % 10;
  }

  deal(betAmount) {
    if (this.isDealing) return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.betAmount = betAmount;
    this.isDealing = true;
    this.resultBanner.style.display = 'none';

    this.playerCardsEl.innerHTML = '';
    this.bankerCardsEl.innerHTML = '';
    this.playerScoreEl.textContent = '0';
    this.bankerScoreEl.textContent = '0';

    const pCards = [this.drawCard(), this.drawCard()];
    const bCards = [this.drawCard(), this.drawCard()];

    // Deal Player 1
    setTimeout(() => {
      this.playerCardsEl.appendChild(this.renderCardDOM(pCards[0]));
      this.playerScoreEl.textContent = this.calculateTotal([pCards[0]]);
      if (window.soundFX) window.soundFX.playClick();
    }, 150);

    // Deal Banker 1
    setTimeout(() => {
      this.bankerCardsEl.appendChild(this.renderCardDOM(bCards[0]));
      this.bankerScoreEl.textContent = this.calculateTotal([bCards[0]]);
      if (window.soundFX) window.soundFX.playClick();
    }, 400);

    // Deal Player 2
    setTimeout(() => {
      this.playerCardsEl.appendChild(this.renderCardDOM(pCards[1]));
      this.playerScoreEl.textContent = this.calculateTotal(pCards);
      if (window.soundFX) window.soundFX.playClick();
    }, 650);

    // Deal Banker 2
    setTimeout(() => {
      this.bankerCardsEl.appendChild(this.renderCardDOM(bCards[1]));
      this.bankerScoreEl.textContent = this.calculateTotal(bCards);
      if (window.soundFX) window.soundFX.playClick();

      // Check Naturals & Third Card Tableau
      this.evaluateTableau(pCards, bCards);
    }, 900);

    return true;
  }

  evaluateTableau(pCards, bCards) {
    let pScore = this.calculateTotal(pCards);
    let bScore = this.calculateTotal(bCards);

    // Natural 8 or 9
    if (pScore >= 8 || bScore >= 8) {
      setTimeout(() => this.finishRound(pScore, bScore), 500);
      return;
    }

    // Player Drawing Rules
    let playerThird = null;
    if (pScore <= 5) {
      playerThird = this.drawCard();
      pCards.push(playerThird);
      setTimeout(() => {
        this.playerCardsEl.appendChild(this.renderCardDOM(playerThird));
        this.playerScoreEl.textContent = this.calculateTotal(pCards);
        if (window.soundFX) window.soundFX.playClick();
      }, 500);
    }

    // Banker Drawing Rules based on Player's third card
    setTimeout(() => {
      let bankerDraws = false;
      const bCur = this.calculateTotal(bCards);

      if (!playerThird) {
        if (bCur <= 5) bankerDraws = true;
      } else {
        const p3 = playerThird.pt;
        if (bCur <= 2) bankerDraws = true;
        else if (bCur === 3 && p3 !== 8) bankerDraws = true;
        else if (bCur === 4 && [2, 3, 4, 5, 6, 7].includes(p3)) bankerDraws = true;
        else if (bCur === 5 && [4, 5, 6, 7].includes(p3)) bankerDraws = true;
        else if (bCur === 6 && [6, 7].includes(p3)) bankerDraws = true;
      }

      if (bankerDraws) {
        const bThird = this.drawCard();
        bCards.push(bThird);
        this.bankerCardsEl.appendChild(this.renderCardDOM(bThird));
        this.bankerScoreEl.textContent = this.calculateTotal(bCards);
        if (window.soundFX) window.soundFX.playClick();
      }

      setTimeout(() => {
        this.finishRound(this.calculateTotal(pCards), this.calculateTotal(bCards));
      }, 500);
    }, playerThird ? 900 : 400);
  }

  finishRound(pScore, bScore) {
    this.isDealing = false;
    let winner = 'tie';
    if (pScore > bScore) winner = 'player';
    else if (bScore > pScore) winner = 'banker';

    // Roadmap update
    const bead = winner === 'player' ? 'P' : (winner === 'banker' ? 'B' : 'T');
    this.roadHistory.push(bead);
    this.updateRoadmap();

    let won = this.selectedBetSide === winner;
    let payout = 0;
    let mult = 0;

    if (won) {
      if (winner === 'player') {
        payout = this.betAmount * 2.0; // 1:1
        mult = 2.0;
      } else if (winner === 'banker') {
        payout = this.betAmount * 1.95; // 0.95:1
        mult = 1.95;
      } else if (winner === 'tie') {
        payout = this.betAmount * 9.0; // 8:1
        mult = 9.0;
      }
    } else if (winner === 'tie' && this.selectedBetSide !== 'tie') {
      // Tie pushes player/banker bets in Punto Banco!
      payout = this.betAmount;
      mult = 1.0;
    }

    window.appState.recordOutcome('Baccarat', this.betAmount, mult, payout);

    // Banner Text
    const winnerLabel = winner === 'player' ? 'PLAYER WINS' : (winner === 'banker' ? 'BANKER WINS' : 'TIE');
    this.resultTitle.textContent = `${winnerLabel} (${pScore} vs ${bScore})`;
    this.resultPayout.textContent = payout > 0 ? `+$${payout.toFixed(2)}` : `-$${this.betAmount.toFixed(2)}`;
    this.resultBanner.className = `bac-result-banner win-pop ${won ? 'win' : (mult === 1.0 ? 'push' : 'lose')}`;
    this.resultBanner.style.display = 'flex';

    if (won && window.soundFX) window.soundFX.playCashout();
    else if (!won && mult === 0 && window.soundFX) window.soundFX.playDiceLoss();

    this.onStateChange({ isDealing: false, winner, payout });
  }
}

window.BaccaratGame = BaccaratGame;
