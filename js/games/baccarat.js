// Macau VIP Baccarat Engine for DruBet
// Authentic Punto Banco Rules with Macau VIP High Stakes features:
// - Main Bets: Player (1:1), Banker (0.95:1 / 5% commission), Tie (8:1)
// - Side Bets: Player Pair (11:1), Banker Pair (11:1), Perfect Pair (25:1)
// - Real 3D Chip Placement directly on Felt Sectors ($1, $5, $10, $25, $100 chips)
// - Card Squeeze / Peek animation toggle for high-roller suspense
// - Comprehensive Bead Plate & Big Road Roadmap
// - Strict Third Card Tableau & Natural 8/9 Fanfare

class BaccaratGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    
    // Placed bets on felt { 'player': 25, 'banker': 0, 'tie': 0, 'playerPair': 0, 'bankerPair': 0, 'perfectPair': 0 }
    this.placedBets = {
      player: 25,
      banker: 0,
      tie: 0,
      playerPair: 0,
      bankerPair: 0,
      perfectPair: 0
    };
    this.previousBets = { ...this.placedBets };
    this.selectedChipVal = 25;
    this.isDealing = false;
    this.squeezeMode = false;
    this.roadHistory = ['B', 'P', 'B', 'B', 'P', 'T', 'B', 'P', 'P', 'B', 'B', 'P'];

    this.renderUI();
  }

  renderUI() {
    const sym = window.CasinoSymbols;
    this.container.innerHTML = `
      <div class="baccarat-felt-wrapper">
        
        <!-- Macau VIP Table Header -->
        <div class="bac-table-topbar">
          <div class="bac-table-title-wrap">
            <span class="bac-crown-icon">👑</span>
            <div class="bac-title-box">
              <span class="bac-felt-title">DRUBET MACAU VIP BACCARAT</span>
              <span class="bac-felt-sub">PUNTO BANCO • 8-DECK SHOE • MACAU HIGH ROLLER SALON</span>
            </div>
          </div>
          
          <div class="bac-toggles-bar">
            <button class="bac-toggle-btn ${this.squeezeMode ? 'active' : ''}" id="bacSqueezeToggleBtn" title="Toggle Card Squeeze">
              <span class="toggle-icon">🎴</span>
              <span class="toggle-label">CARD SQUEEZE: <b id="bacSqueezeStatus">${this.squeezeMode ? 'ON' : 'OFF'}</b></span>
            </button>
          </div>
        </div>

        <!-- Bead Plate & Big Road History Roadmap -->
        <div class="bac-roadmap-section">
          <div class="bac-roadmap-header">
            <span class="roadmap-label">BEAD ROAD:</span>
            <div class="bac-roadmap-bar" id="bacRoadmapBar"></div>
          </div>
        </div>

        <!-- Table Hands Felt Arena -->
        <div class="bac-hands-container">
          <!-- Player Hand Box -->
          <div class="bac-side-box player-side">
            <div class="bac-side-header">
              <div class="side-info">
                <span class="side-dot dot-player"></span>
                <span class="side-name">PLAYER</span>
              </div>
              <span class="bac-score-badge score-player" id="bacPlayerScore">0</span>
            </div>
            <div class="bac-cards-row" id="bacPlayerCards">
              ${sym ? sym.renderCardSlotPlaceholder('PLAYER 1', '♠') + sym.renderCardSlotPlaceholder('PLAYER 2', '♥') : ''}
            </div>
          </div>

          <!-- Center VS Crown Badge -->
          <div class="bac-center-vs-badge">
            <span class="vs-crown">👑</span>
            <span class="vs-text">VS</span>
          </div>

          <!-- Banker Hand Box -->
          <div class="bac-side-box banker-side">
            <div class="bac-side-header">
              <div class="side-info">
                <span class="side-dot dot-banker"></span>
                <span class="side-name">BANKER</span>
              </div>
              <span class="bac-score-badge score-banker" id="bacBankerScore">0</span>
            </div>
            <div class="bac-cards-row" id="bacBankerCards">
              ${sym ? sym.renderCardSlotPlaceholder('BANKER 1', '♦') + sym.renderCardSlotPlaceholder('BANKER 2', '♣') : ''}
            </div>
          </div>
        </div>

        <!-- Outcome Celebration Banner -->
        <div class="bac-result-banner" id="bacResultBanner" style="display:none;">
          <div class="bac-result-title" id="bacResultTitle">BANKER WINS (8 over 5)</div>
          <div class="bac-result-payout text-gold" id="bacResultPayout">+$48.75</div>
          <div class="bac-result-sub" id="bacResultSub">Natural 8 • Standard Commission 5%</div>
        </div>

        <!-- Real 3D Chips Denomination Strip -->
        <div class="bac-chip-selector">
          <div class="bac-chips-strip">
            <button class="felt-chip-btn" data-val="1" title="$1 Chip">
              ${sym ? sym.renderRealCasinoChip(1, false, 36) : '$1'}
            </button>
            <button class="felt-chip-btn" data-val="5" title="$5 Chip">
              ${sym ? sym.renderRealCasinoChip(5, false, 36) : '$5'}
            </button>
            <button class="felt-chip-btn" data-val="10" title="$10 Chip">
              ${sym ? sym.renderRealCasinoChip(10, false, 36) : '$10'}
            </button>
            <button class="felt-chip-btn active" data-val="25" title="$25 Chip">
              ${sym ? sym.renderRealCasinoChip(25, true, 36) : '$25'}
            </button>
            <button class="felt-chip-btn" data-val="100" title="$100 Chip">
              ${sym ? sym.renderRealCasinoChip(100, false, 36) : '$100'}
            </button>
          </div>
          <div class="bac-tools-strip">
            <button class="felt-tool-btn" id="bacRebetBtn">REBET</button>
            <button class="felt-tool-btn" id="bacClearBtn">CLEAR</button>
          </div>
        </div>

        <!-- Interactive Felt Betting Sectors (Main & Side Bets) -->
        <div class="bac-felt-betting-grid">
          <!-- Side Bets Row -->
          <div class="bac-side-bets-row">
            <div class="bac-bet-spot spot-side" data-bet="playerPair">
              <span class="spot-title">PLAYER PAIR</span>
              <span class="spot-odds">11:1</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="bac-bet-spot spot-side spot-perfect-pair" data-bet="perfectPair">
              <span class="spot-title">PERFECT PAIR</span>
              <span class="spot-odds">25:1</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
            <div class="bac-bet-spot spot-side" data-bet="bankerPair">
              <span class="spot-title">BANKER PAIR</span>
              <span class="spot-odds">11:1</span>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
          </div>

          <!-- Main Bets Row (Player, Tie, Banker) -->
          <div class="bac-main-bets-row">
            <div class="bac-bet-spot spot-main spot-player ${this.placedBets.player > 0 ? 'has-bet' : ''}" data-bet="player">
              <div class="spot-header">
                <span class="spot-tag-player">PLAYER</span>
                <span class="spot-odds">1:1</span>
              </div>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>

            <div class="bac-bet-spot spot-main spot-tie ${this.placedBets.tie > 0 ? 'has-bet' : ''}" data-bet="tie">
              <div class="spot-header">
                <span class="spot-tag-tie">TIE</span>
                <span class="spot-odds">8:1</span>
              </div>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>

            <div class="bac-bet-spot spot-main spot-banker ${this.placedBets.banker > 0 ? 'has-bet' : ''}" data-bet="banker">
              <div class="spot-header">
                <span class="spot-tag-banker">BANKER</span>
                <span class="spot-odds">0.95:1</span>
              </div>
              <span class="spot-chip-badge" style="display:none;"></span>
            </div>
          </div>
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
    this.resultSub = document.getElementById('bacResultSub');
    this.squeezeToggleBtn = document.getElementById('bacSqueezeToggleBtn');
    this.squeezeStatusEl = document.getElementById('bacSqueezeStatus');

    this.bindEvents();
    this.updateRoadmap();
    this.updateFeltChips();
  }

  bindEvents() {
    // Squeeze Mode Toggle
    if (this.squeezeToggleBtn) {
      this.squeezeToggleBtn.addEventListener('click', () => {
        this.squeezeMode = !this.squeezeMode;
        this.squeezeToggleBtn.classList.toggle('active', this.squeezeMode);
        if (this.squeezeStatusEl) this.squeezeStatusEl.textContent = this.squeezeMode ? 'ON' : 'OFF';
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Chip denomination buttons
    const chips = this.container.querySelectorAll('.felt-chip-btn');
    chips.forEach(c => {
      c.addEventListener('click', () => {
        chips.forEach(ch => {
          ch.classList.remove('active');
          const inner = ch.querySelector('.casino-3d-chip');
          if (inner) inner.classList.remove('selected');
        });
        c.classList.add('active');
        const activeInner = c.querySelector('.casino-3d-chip');
        if (activeInner) activeInner.classList.add('selected');

        this.selectedChipVal = parseFloat(c.dataset.val);
        if (window.soundFX) window.soundFX.playChipClink();
      });
    });

    // Clear bets
    const clearBtn = document.getElementById('bacClearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.isDealing) return;
        Object.keys(this.placedBets).forEach(k => this.placedBets[k] = 0);
        this.updateFeltChips();
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Rebet button
    const rebetBtn = document.getElementById('bacRebetBtn');
    if (rebetBtn) {
      rebetBtn.addEventListener('click', () => {
        if (this.isDealing) return;
        this.placedBets = { ...this.previousBets };
        this.updateFeltChips();
        if (window.soundFX) window.soundFX.playChipClink();
      });
    }

    // Betting Felt Spots
    const spots = this.container.querySelectorAll('.bac-bet-spot');
    spots.forEach(s => {
      s.addEventListener('click', () => {
        if (this.isDealing) return;
        const betType = s.dataset.bet;
        this.placedBets[betType] = (this.placedBets[betType] || 0) + this.selectedChipVal;
        this.updateFeltChips();
        if (window.soundFX) window.soundFX.playChipClink();
      });
    });
  }

  updateFeltChips() {
    let total = 0;
    const spots = this.container.querySelectorAll('.bac-bet-spot');
    spots.forEach(s => {
      const betType = s.dataset.bet;
      const amt = this.placedBets[betType] || 0;
      total += amt;

      let badge = s.querySelector('.spot-chip-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'spot-chip-badge';
        s.appendChild(badge);
      }

      if (amt > 0) {
        s.classList.add('has-bet');
        badge.style.display = 'flex';
        if (window.CasinoSymbols) {
          badge.innerHTML = window.CasinoSymbols.renderRealCasinoChip(amt, false, 24);
        } else {
          badge.textContent = `$${amt}`;
        }
      } else {
        s.classList.remove('has-bet');
        badge.style.display = 'none';
        badge.innerHTML = '';
      }
    });

    // Sync with unified betting dock input if available
    const betInput = document.getElementById('unifiedBetInput');
    if (betInput && total > 0) {
      betInput.value = total.toFixed(2);
    }

    this.onStateChange({ totalBet: total, isDealing: this.isDealing });
  }

  updateRoadmap() {
    if (!this.roadmapBar) return;
    this.roadmapBar.innerHTML = this.roadHistory.slice(-18).map(r => {
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

  renderCardDOM(card, isSqueezed = false) {
    if (window.CasinoSymbols && window.CasinoSymbols.createPlayingCardElement) {
      const el = window.CasinoSymbols.createPlayingCardElement(card);
      if (isSqueezed) el.classList.add('card-squeeze-reveal');
      return el;
    }
    const el = document.createElement('div');
    el.className = `bj-card card-dealt ${card.isRed ? 'red-suit' : 'black-suit'} ${isSqueezed ? 'card-squeeze-reveal' : ''}`;
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

    // Check if any bets placed
    let totalBet = Object.values(this.placedBets).reduce((a, b) => a + b, 0);
    if (totalBet <= 0) {
      // Default to $25 on Player if nothing selected
      this.placedBets.player = betAmount || 25;
      totalBet = this.placedBets.player;
      this.updateFeltChips();
    }

    if (!window.appState.deductBet(totalBet)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.previousBets = { ...this.placedBets };
    this.isDealing = true;
    this.resultBanner.style.display = 'none';

    this.playerCardsEl.innerHTML = '';
    this.bankerCardsEl.innerHTML = '';
    this.playerScoreEl.textContent = '0';
    this.bankerScoreEl.textContent = '0';

    const pCards = [this.drawCard(), this.drawCard()];
    const bCards = [this.drawCard(), this.drawCard()];

    const dealDelay = this.squeezeMode ? 450 : 250;

    // Deal Player 1
    setTimeout(() => {
      this.playerCardsEl.appendChild(this.renderCardDOM(pCards[0], this.squeezeMode));
      this.playerScoreEl.textContent = this.calculateTotal([pCards[0]]);
      if (window.soundFX) window.soundFX.playCardSlide();
    }, dealDelay * 1);

    // Deal Banker 1
    setTimeout(() => {
      this.bankerCardsEl.appendChild(this.renderCardDOM(bCards[0], this.squeezeMode));
      this.bankerScoreEl.textContent = this.calculateTotal([bCards[0]]);
      if (window.soundFX) window.soundFX.playCardSlide();
    }, dealDelay * 2);

    // Deal Player 2
    setTimeout(() => {
      this.playerCardsEl.appendChild(this.renderCardDOM(pCards[1], this.squeezeMode));
      this.playerScoreEl.textContent = this.calculateTotal(pCards);
      if (window.soundFX) window.soundFX.playCardSlide();
    }, dealDelay * 3);

    // Deal Banker 2
    setTimeout(() => {
      this.bankerCardsEl.appendChild(this.renderCardDOM(bCards[1], this.squeezeMode));
      this.bankerScoreEl.textContent = this.calculateTotal(bCards);
      if (window.soundFX) window.soundFX.playCardSlide();

      // Check Naturals & Third Card Tableau
      this.evaluateTableau(pCards, bCards);
    }, dealDelay * 4);

    return true;
  }

  evaluateTableau(pCards, bCards) {
    let pScore = this.calculateTotal(pCards);
    let bScore = this.calculateTotal(bCards);
    const dealDelay = this.squeezeMode ? 600 : 350;

    // Natural 8 or 9
    if (pScore >= 8 || bScore >= 8) {
      setTimeout(() => this.finishRound(pCards, bCards), dealDelay);
      return;
    }

    // Player Drawing Rules: Draws if 0-5, Stands on 6-7
    let playerThird = null;
    if (pScore <= 5) {
      playerThird = this.drawCard();
      pCards.push(playerThird);
      setTimeout(() => {
        this.playerCardsEl.appendChild(this.renderCardDOM(playerThird, this.squeezeMode));
        this.playerScoreEl.textContent = this.calculateTotal(pCards);
        if (window.soundFX) window.soundFX.playCardSlide();
      }, dealDelay);
    }

    // Banker Drawing Rules based on Player third card
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
        this.bankerCardsEl.appendChild(this.renderCardDOM(bThird, this.squeezeMode));
        this.bankerScoreEl.textContent = this.calculateTotal(bCards);
        if (window.soundFX) window.soundFX.playCardSlide();
      }

      setTimeout(() => {
        this.finishRound(pCards, bCards);
      }, dealDelay);
    }, playerThird ? dealDelay * 2 : dealDelay);
  }

  finishRound(pCards, bCards) {
    this.isDealing = false;
    const pScore = this.calculateTotal(pCards);
    const bScore = this.calculateTotal(bCards);

    let winner = 'tie';
    if (pScore > bScore) winner = 'player';
    else if (bScore > pScore) winner = 'banker';

    // Pair checks on initial 2 cards
    const playerPair = pCards[0].val === pCards[1].val;
    const bankerPair = bCards[0].val === bCards[1].val;
    const perfectPair = (playerPair && pCards[0].suit === pCards[1].suit) || (bankerPair && bCards[0].suit === bCards[1].suit);

    // Update Bead Plate roadmap
    const bead = winner === 'player' ? 'P' : (winner === 'banker' ? 'B' : 'T');
    this.roadHistory.push(bead);
    this.updateRoadmap();

    let totalPayout = 0;
    let totalBet = Object.values(this.placedBets).reduce((a, b) => a + b, 0);
    const winDetails = [];

    // Main Bet Outcomes
    if (winner === 'player' && this.placedBets.player > 0) {
      const pWin = this.placedBets.player * 2.0;
      totalPayout += pWin;
      winDetails.push(`Player (+$${pWin.toFixed(2)})`);
    } else if (winner === 'banker' && this.placedBets.banker > 0) {
      const bWin = this.placedBets.banker * 1.95; // 5% commission
      totalPayout += bWin;
      winDetails.push(`Banker (+$${bWin.toFixed(2)})`);
    } else if (winner === 'tie') {
      if (this.placedBets.tie > 0) {
        const tWin = this.placedBets.tie * 9.0;
        totalPayout += tWin;
        winDetails.push(`Tie (+$${tWin.toFixed(2)})`);
      }
      // In Punto Banco, Tie pushes active Player and Banker bets!
      if (this.placedBets.player > 0) {
        totalPayout += this.placedBets.player;
        winDetails.push(`Player Bet Push`);
      }
      if (this.placedBets.banker > 0) {
        totalPayout += this.placedBets.banker;
        winDetails.push(`Banker Bet Push`);
      }
    }

    // Side Bet Outcomes
    if (playerPair && this.placedBets.playerPair > 0) {
      const ppWin = this.placedBets.playerPair * 12.0; // 11:1 payout
      totalPayout += ppWin;
      winDetails.push(`Player Pair 11:1 (+$${ppWin.toFixed(2)})`);
    }
    if (bankerPair && this.placedBets.bankerPair > 0) {
      const bpWin = this.placedBets.bankerPair * 12.0; // 11:1 payout
      totalPayout += bpWin;
      winDetails.push(`Banker Pair 11:1 (+$${bpWin.toFixed(2)})`);
    }
    if (perfectPair && this.placedBets.perfectPair > 0) {
      const perfWin = this.placedBets.perfectPair * 26.0; // 25:1 payout
      totalPayout += perfWin;
      winDetails.push(`Perfect Pair 25:1 (+$${perfWin.toFixed(2)})`);
    }

    const won = totalPayout > totalBet;
    const push = totalPayout === totalBet && totalBet > 0;
    const mult = totalBet > 0 ? (totalPayout / totalBet) : 0;

    window.appState.recordOutcome('Baccarat', totalBet, mult, totalPayout);

    // Banner Text
    const winnerLabel = winner === 'player' ? 'PLAYER WINS' : (winner === 'banker' ? 'BANKER WINS' : 'TIE');
    const isNatural = (pCards.length === 2 && pScore >= 8) || (bCards.length === 2 && bScore >= 8);

    this.resultTitle.textContent = `${winnerLabel} (${pScore} vs ${bScore}) ${isNatural ? '• NATURAL!' : ''}`;
    this.resultPayout.textContent = totalPayout > 0 ? `+$${totalPayout.toFixed(2)}` : `-$${totalBet.toFixed(2)}`;
    this.resultSub.textContent = winDetails.length > 0 ? winDetails.join(' • ') : (winner === 'tie' ? 'Tie Round • Push on Player & Banker' : 'House Wins');
    
    this.resultBanner.className = `bac-result-banner win-pop ${won ? 'win' : (push ? 'push' : 'lose')}`;
    this.resultBanner.style.display = 'flex';

    if (won && window.soundFX) window.soundFX.playCashout();
    else if (!won && !push && window.soundFX) window.soundFX.playDiceLoss();

    this.onStateChange({ isDealing: false, winner, payout: totalPayout, totalBet });
  }
}

window.BaccaratGame = BaccaratGame;
