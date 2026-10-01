// Texas Hold'em / Casino Hold'em Poker Engine for RainStake Mobile
// Real 7-Card Evaluator (Royal Flush down to High Card),
// Authentic Vegas/Atlantic City Casino Hold'em rules:
// Preflop deal, Flop community deal, Turn & River, Dealer qualification (Pair of 4s+),
// Ante Bonus Payouts, AA Bonus Side Bet (pays up to 100:1 on Aces or better in hole/flop),
// Card Peeking Animation & Audio Integration

const POKER_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const POKER_SUITS = ['♠', '♥', '♦', '♣'];

class PokerGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.deck = [];
    this.playerCards = [];
    this.dealerCards = [];
    this.communityCards = [];
    this.state = 'IDLE'; // IDLE, DEALING, FLOP_DEALT, SHOWDOWN
    this.anteBet = 10;
    this.callBet = 20;
    this.aaBonusBet = 0;
    this.aaBonusSelected = false;

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="poker-table-felt">
        <!-- Felt Rail & Header Banner -->
        <div class="poker-felt-header">
          <span class="poker-felt-title">TEXAS HOLD'EM POKER • CASINO RULES</span>
          <div class="poker-pot-badge">
            <span class="pot-label">POT:</span>
            <span class="pot-val text-gold" id="pokerPotDisplay">$0.00</span>
          </div>
        </div>

        <!-- Dealer Hand Section -->
        <div class="poker-hand-box dealer-box">
          <div class="poker-label-row">
            <div class="dealer-title-wrap">
              <span class="poker-actor-name">DEALER</span>
              <span class="poker-qualify-note">(Qualifies with Pair of 4s+)</span>
            </div>
            <span class="poker-hand-name" id="pokerDealerHandName">--</span>
          </div>
          <div class="poker-cards-row" id="pokerDealerCards"></div>
        </div>

        <!-- Community Board: Flop, Turn, River -->
        <div class="poker-community-box">
          <div class="community-header-row">
            <span class="community-label">COMMUNITY BOARD</span>
            <span class="community-stage-indicator" id="pokerBoardStage">PRE-FLOP</span>
          </div>
          <div class="poker-board-cards" id="pokerCommunityCards">
            <!-- 5 slots -->
            <div class="card-slot-placeholder">FLOP</div>
            <div class="card-slot-placeholder">FLOP</div>
            <div class="card-slot-placeholder">FLOP</div>
            <div class="card-slot-placeholder">TURN</div>
            <div class="card-slot-placeholder">RIVER</div>
          </div>
        </div>

        <!-- Player Hole Cards & Hand Strength Evaluation -->
        <div class="poker-hand-box player-box">
          <div class="poker-label-row">
            <span class="poker-actor-name">YOUR HOLE CARDS</span>
            <span class="poker-hand-name text-gold" id="pokerPlayerHandName">Place Bet to Deal</span>
          </div>
          <div class="poker-cards-row" id="pokerPlayerCards"></div>
        </div>

        <!-- AA Bonus Side Bet Box -->
        <div class="poker-sidebet-strip">
          <button class="aa-bonus-toggle-btn" id="aaBonusToggleBtn">
            <span class="aa-icon">⭐</span>
            <div class="aa-text">
              <span class="aa-title">AA BONUS SIDE BET</span>
              <span class="aa-payout">Pair of Aces or Better (Pays up to 100:1)</span>
            </div>
            <span class="aa-status" id="aaBonusStatus">OFF</span>
          </button>
        </div>

        <!-- Showdown Result Banner -->
        <div class="poker-result-banner" id="pokerResultBanner" style="display:none;">
          <div class="result-title" id="pokerResultTitle">YOU WIN!</div>
          <div class="result-amount text-gold" id="pokerResultAmount">+$60.00</div>
          <div class="result-detail" id="pokerResultDetail">Full House over Two Pair</div>
        </div>

        <!-- Poker Actions Bar (Call / Fold after Flop) -->
        <div class="poker-actions-bar" id="pokerActionsBar" style="display:none;">
          <button class="poker-btn btn-call" id="pokerCallBtn">CALL ($20.00)</button>
          <button class="poker-btn btn-raise" id="pokerRaiseBtn">RAISE 3X ($30.00)</button>
          <button class="poker-btn btn-fold" id="pokerFoldBtn">FOLD</button>
        </div>
      </div>
    `;

    this.dealerCardsEl = document.getElementById('pokerDealerCards');
    this.playerCardsEl = document.getElementById('pokerPlayerCards');
    this.communityCardsEl = document.getElementById('pokerCommunityCards');
    this.dealerHandNameEl = document.getElementById('pokerDealerHandName');
    this.playerHandNameEl = document.getElementById('pokerPlayerHandName');
    this.boardStageEl = document.getElementById('pokerBoardStage');
    this.potDisplayEl = document.getElementById('pokerPotDisplay');
    this.aaToggleBtn = document.getElementById('aaBonusToggleBtn');
    this.aaStatusEl = document.getElementById('aaBonusStatus');
    this.actionsBar = document.getElementById('pokerActionsBar');
    this.callBtn = document.getElementById('pokerCallBtn');
    this.raiseBtn = document.getElementById('pokerRaiseBtn');
    this.foldBtn = document.getElementById('pokerFoldBtn');
    this.resultBanner = document.getElementById('pokerResultBanner');
    this.resultTitle = document.getElementById('pokerResultTitle');
    this.resultAmount = document.getElementById('pokerResultAmount');
    this.resultDetail = document.getElementById('pokerResultDetail');

    this.bindEvents();
    this.initDeck();
  }

  bindEvents() {
    this.callBtn.addEventListener('click', () => this.call(1));
    this.raiseBtn.addEventListener('click', () => this.call(1.5));
    this.foldBtn.addEventListener('click', () => this.fold());

    this.aaToggleBtn.addEventListener('click', () => {
      if (this.state !== 'IDLE' && this.state !== 'SHOWDOWN') return;
      this.aaBonusSelected = !this.aaBonusSelected;
      this.aaToggleBtn.classList.toggle('active', this.aaBonusSelected);
      this.aaStatusEl.textContent = this.aaBonusSelected ? 'ON ($5)' : 'OFF';
      this.aaStatusEl.style.color = this.aaBonusSelected ? '#00e701' : 'var(--text-muted)';
      if (window.soundFX) window.soundFX.playChipClink();
    });
  }

  initDeck() {
    this.deck = [];
    for (let s of POKER_SUITS) {
      for (let r of POKER_RANKS) {
        this.deck.push({
          suit: s,
          val: r,
          rankIndex: POKER_RANKS.indexOf(r),
          isRed: s === '♥' || s === '♦'
        });
      }
    }
    // Fisher-Yates Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  renderCardDOM(card, hidden = false, winning = false) {
    let el;
    if (window.CasinoSymbols && window.CasinoSymbols.createPlayingCardElement) {
      el = window.CasinoSymbols.createPlayingCardElement(card, hidden, winning);
    } else {
      el = document.createElement('div');
      if (hidden) {
        el.className = 'bj-card card-hidden';
        el.innerHTML = `<div class="card-back-pattern"></div>`;
      } else {
        el.className = `bj-card card-dealt ${card.isRed ? 'red-suit' : 'black-suit'} ${winning ? 'winning-poker-card' : ''}`;
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
      }
    }

    // Allow interactive card peek on click
    if (!hidden) {
      el.addEventListener('click', () => {
        el.classList.add('card-peek-anim');
        setTimeout(() => el.classList.remove('card-peek-anim'), 400);
        if (window.soundFX) window.soundFX.playCardFlip();
      });
    }
    return el;
  }

  startRound(betAmount) {
    if (this.state !== 'IDLE' && this.state !== 'SHOWDOWN') return false;

    let totalDeduct = betAmount;
    if (this.aaBonusSelected) totalDeduct += 5;

    if (!window.appState.deductBet(totalDeduct)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.anteBet = betAmount;
    this.callBet = betAmount * 2;
    this.aaBonusBet = this.aaBonusSelected ? 5 : 0;
    this.state = 'DEALING';

    this.resultBanner.style.display = 'none';
    this.actionsBar.style.display = 'none';
    this.boardStageEl.textContent = 'DEALING...';
    this.potDisplayEl.textContent = `$${(this.anteBet + this.aaBonusBet).toFixed(2)}`;

    this.initDeck();

    this.playerCards = [this.deck.pop(), this.deck.pop()];
    this.dealerCards = [this.deck.pop(), this.deck.pop()];
    this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()]; // Flop

    // Render Dealer face down
    this.dealerCardsEl.innerHTML = '';
    this.dealerCardsEl.appendChild(this.renderCardDOM(this.dealerCards[0], true));
    this.dealerCardsEl.appendChild(this.renderCardDOM(this.dealerCards[1], true));
    this.dealerHandNameEl.textContent = 'Hidden (2 Cards)';

    // Render Player Hole Cards with dealing animations
    this.playerCardsEl.innerHTML = '';
    setTimeout(() => {
      this.playerCardsEl.appendChild(this.renderCardDOM(this.playerCards[0]));
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 150);

    setTimeout(() => {
      this.playerCardsEl.appendChild(this.renderCardDOM(this.playerCards[1]));
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 350);

    // Deal The Flop
    setTimeout(() => {
      this.communityCardsEl.innerHTML = '';
      this.communityCards.forEach(c => this.communityCardsEl.appendChild(this.renderCardDOM(c)));
      this.boardStageEl.textContent = 'THE FLOP';

      const flopEval = this.evaluate7Cards([...this.playerCards, ...this.communityCards]);
      this.playerHandNameEl.textContent = flopEval.name;

      if (window.soundFX) window.soundFX.playCardFlip();

      // Enable Call, Raise, or Fold
      this.state = 'FLOP_DEALT';
      this.callBtn.textContent = `CALL ($${this.callBet.toFixed(2)})`;
      this.callBtn.disabled = window.appState.balance < this.callBet;

      const raiseCost = this.anteBet * 3;
      this.raiseBtn.textContent = `RAISE ($${raiseCost.toFixed(2)})`;
      this.raiseBtn.disabled = window.appState.balance < raiseCost;

      this.actionsBar.style.display = 'flex';
      this.onStateChange({ state: this.state, playerHand: this.playerHandNameEl.textContent });
    }, 700);

    return true;
  }

  call(multiplier = 1) {
    if (this.state !== 'FLOP_DEALT') return;
    const betCost = this.anteBet * 2 * multiplier;
    if (!window.appState.deductBet(betCost)) return;

    this.callBet = betCost;
    this.actionsBar.style.display = 'none';
    this.potDisplayEl.textContent = `$${(this.anteBet + this.callBet + this.aaBonusBet).toFixed(2)}`;

    if (window.soundFX) window.soundFX.playChipClink();

    // Deal Turn and River community cards
    const turn = this.deck.pop();
    const river = this.deck.pop();
    this.communityCards.push(turn, river);

    this.boardStageEl.textContent = 'THE TURN & RIVER';

    setTimeout(() => {
      this.communityCardsEl.appendChild(this.renderCardDOM(turn));
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 250);

    setTimeout(() => {
      this.communityCardsEl.appendChild(this.renderCardDOM(river));
      if (window.soundFX) window.soundFX.playCardDeal();
      this.showdown();
    }, 600);
  }

  fold() {
    if (this.state !== 'FLOP_DEALT') return;
    this.state = 'SHOWDOWN';
    this.actionsBar.style.display = 'none';

    const totalLost = this.anteBet + this.aaBonusBet;
    window.appState.recordOutcome('Poker', totalLost, 0, 0);

    this.resultTitle.textContent = 'YOU FOLDED';
    this.resultAmount.textContent = `-$${totalLost.toFixed(2)}`;
    this.resultDetail.textContent = 'Ante forfeited to the house';
    this.resultBanner.className = 'poker-result-banner lose';
    this.resultBanner.style.display = 'flex';

    if (window.soundFX) window.soundFX.playDiceLoss();
    this.onStateChange({ state: this.state, result: 'FOLD' });
  }

  showdown() {
    this.state = 'SHOWDOWN';
    this.boardStageEl.textContent = 'SHOWDOWN';

    // Reveal Dealer Hole Cards
    this.dealerCardsEl.innerHTML = '';
    this.dealerCardsEl.appendChild(this.renderCardDOM(this.dealerCards[0]));
    this.dealerCardsEl.appendChild(this.renderCardDOM(this.dealerCards[1]));
    if (window.soundFX) window.soundFX.playCardFlip();

    const playerEval = this.evaluate7Cards([...this.playerCards, ...this.communityCards]);
    const dealerEval = this.evaluate7Cards([...this.dealerCards, ...this.communityCards]);

    this.playerHandNameEl.textContent = playerEval.name;
    this.dealerHandNameEl.textContent = dealerEval.name;

    // Dealer Qualifies with Pair of 4s or better (rankTier >= 1 and mainRank >= 2)
    const dealerQualifies = dealerEval.rankTier > 1 || (dealerEval.rankTier === 1 && dealerEval.mainRank >= 2);

    let totalBet = this.anteBet + this.callBet + this.aaBonusBet;
    let payout = 0;
    let won = false;
    let push = false;

    // Evaluate AA Side Bet if placed (Pair of Aces or better in player hole + 3 flop cards)
    let aaPayout = 0;
    if (this.aaBonusBet > 0) {
      const flop5 = [...this.playerCards, this.communityCards[0], this.communityCards[1], this.communityCards[2]];
      const aaEval = this.evaluate7Cards(flop5);
      if (aaEval.rankTier >= 4) { // Flush or higher
        aaPayout = this.aaBonusBet * 25;
      } else if (aaEval.rankTier === 3) { // Three of a Kind
        aaPayout = this.aaBonusBet * 7;
      } else if (aaEval.rankTier === 2) { // Two Pair
        aaPayout = this.aaBonusBet * 2;
      } else if (aaEval.rankTier === 1 && aaEval.mainRank === 12) { // Pair of Aces
        aaPayout = this.aaBonusBet * 2;
      }
    }

    if (!dealerQualifies) {
      // Dealer does not qualify: Ante pays 1:1, Call pushes
      won = true;
      payout = (this.anteBet * 2) + this.callBet + aaPayout;
      this.resultTitle.textContent = `DEALER DOES NOT QUALIFY!`;
      this.resultDetail.textContent = `Dealer lacked Pair of 4s • Ante won + Call returned!`;
    } else if (playerEval.score > dealerEval.score) {
      // Player beats Dealer: Ante pays with bonus, Call pays 1:1
      won = true;
      const anteMult = this.getAntePayMultiplier(playerEval.rankTier);
      payout = (this.anteBet * (1 + anteMult)) + (this.callBet * 2) + aaPayout;
      this.resultTitle.textContent = `YOU WIN!`;
      this.resultDetail.textContent = `${playerEval.name} beats ${dealerEval.name}!`;
    } else if (playerEval.score === dealerEval.score) {
      // Exact tie: Push
      push = true;
      payout = this.anteBet + this.callBet + aaPayout;
      this.resultTitle.textContent = `TIE / PUSH!`;
      this.resultDetail.textContent = `Identical 5-card hands • Bets returned`;
    } else {
      // Dealer wins
      payout = aaPayout;
      this.resultTitle.textContent = `DEALER WINS`;
      this.resultDetail.textContent = `${dealerEval.name} beats ${playerEval.name}`;
    }

    const mult = totalBet > 0 ? payout / totalBet : 0;
    window.appState.recordOutcome('Poker', totalBet, mult, payout);

    this.resultAmount.textContent = payout > 0 ? `+$${payout.toFixed(2)} (${mult.toFixed(2)}×)` : `-$${totalBet.toFixed(2)}`;
    this.resultBanner.className = `poker-result-banner ${won ? 'win' : (push ? 'push' : 'lose')}`;
    this.resultBanner.style.display = 'flex';

    if (won && window.soundFX) {
      window.soundFX.playCashout();
    } else if (!won && !push && window.soundFX) {
      window.soundFX.playDiceLoss();
    }

    this.onStateChange({ state: this.state, result: won ? 'WIN' : (push ? 'PUSH' : 'LOSE'), payout });
  }

  getAntePayMultiplier(tier) {
    // Standard Casino Hold'em Ante Paytable
    if (tier === 9) return 100; // Royal Flush
    if (tier === 8) return 20;  // Straight Flush
    if (tier === 7) return 10;  // Four of a Kind
    if (tier === 6) return 3;   // Full House
    if (tier === 5) return 2;   // Flush
    return 1;                   // Straight or lower: 1:1
  }

  // 7-Card Poker Evaluator: ranks all 21 combinations of 5 from 7 cards
  evaluate7Cards(cards) {
    if (cards.length < 5) {
      return { score: 0, rankTier: 0, name: 'Incomplete Hand', mainRank: 0 };
    }

    // Generate all 5-card subsets
    const combinations = [];
    const k = 5;
    const n = cards.length;

    const generateCombos = (start, combo) => {
      if (combo.length === k) {
        combinations.push([...combo]);
        return;
      }
      for (let i = start; i < n; i++) {
        combo.push(cards[i]);
        generateCombos(i + 1, combo);
        combo.pop();
      }
    };
    generateCombos(0, []);

    let bestScore = -1;
    let bestEval = null;

    for (let combo of combinations) {
      const ev = this.evaluate5Cards(combo);
      if (ev.score > bestScore) {
        bestScore = ev.score;
        bestEval = ev;
      }
    }

    return bestEval;
  }

  evaluate5Cards(hand) {
    // Sort ranks descending
    const ranks = hand.map(c => c.rankIndex).sort((a, b) => b - a);
    const suits = hand.map(c => c.suit);

    const isFlush = suits.every(s => s === suits[0]);

    // Check straight
    let isStraight = false;
    let straightHigh = -1;

    // Standard straight
    if (
      ranks[0] - ranks[1] === 1 &&
      ranks[1] - ranks[2] === 1 &&
      ranks[2] - ranks[3] === 1 &&
      ranks[3] - ranks[4] === 1
    ) {
      isStraight = true;
      straightHigh = ranks[0];
    } else if (ranks[0] === 12 && ranks[1] === 3 && ranks[2] === 2 && ranks[3] === 1 && ranks[4] === 0) {
      // Wheel straight (A-2-3-4-5)
      isStraight = true;
      straightHigh = 3; // 5-high
    }

    // Rank frequencies
    const freq = {};
    ranks.forEach(r => freq[r] = (freq[r] || 0) + 1);
    const freqArr = Object.entries(freq).map(([r, count]) => ({ rank: parseInt(r), count }));
    freqArr.sort((a, b) => b.count - a.count || b.rank - a.rank);

    // Tier 9: Royal Flush (A-high straight flush)
    if (isFlush && isStraight && straightHigh === 12) {
      return { score: 9000000, rankTier: 9, name: 'Royal Flush', mainRank: 12 };
    }

    // Tier 8: Straight Flush
    if (isFlush && isStraight) {
      return { score: 8000000 + straightHigh, rankTier: 8, name: `${POKER_RANKS[straightHigh]}-High Straight Flush`, mainRank: straightHigh };
    }

    // Tier 7: Four of a Kind
    if (freqArr[0].count === 4) {
      const score = 7000000 + freqArr[0].rank * 100 + freqArr[1].rank;
      return { score, rankTier: 7, name: `Four of a Kind, ${POKER_RANKS[freqArr[0].rank]}s`, mainRank: freqArr[0].rank };
    }

    // Tier 6: Full House
    if (freqArr[0].count === 3 && freqArr[1].count === 2) {
      const score = 6000000 + freqArr[0].rank * 100 + freqArr[1].rank;
      return { score, rankTier: 6, name: `Full House, ${POKER_RANKS[freqArr[0].rank]}s full of ${POKER_RANKS[freqArr[1].rank]}s`, mainRank: freqArr[0].rank };
    }

    // Tier 5: Flush
    if (isFlush) {
      const score = 5000000 + ranks[0] * 10000 + ranks[1] * 1000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4];
      return { score, rankTier: 5, name: `Flush, ${POKER_RANKS[ranks[0]]}-High`, mainRank: ranks[0] };
    }

    // Tier 4: Straight
    if (isStraight) {
      return { score: 4000000 + straightHigh, rankTier: 4, name: `Straight, ${POKER_RANKS[straightHigh]}-High`, mainRank: straightHigh };
    }

    // Tier 3: Three of a Kind
    if (freqArr[0].count === 3) {
      const score = 3000000 + freqArr[0].rank * 10000 + freqArr[1].rank * 100 + freqArr[2].rank;
      return { score, rankTier: 3, name: `Three of a Kind, ${POKER_RANKS[freqArr[0].rank]}s`, mainRank: freqArr[0].rank };
    }

    // Tier 2: Two Pair
    if (freqArr[0].count === 2 && freqArr[1].count === 2) {
      const highPair = Math.max(freqArr[0].rank, freqArr[1].rank);
      const lowPair = Math.min(freqArr[0].rank, freqArr[1].rank);
      const kicker = freqArr[2].rank;
      const score = 2000000 + highPair * 1000 + lowPair * 100 + kicker;
      return { score, rankTier: 2, name: `Two Pair, ${POKER_RANKS[highPair]}s & ${POKER_RANKS[lowPair]}s`, mainRank: highPair };
    }

    // Tier 1: One Pair
    if (freqArr[0].count === 2) {
      const pairRank = freqArr[0].rank;
      const score = 1000000 + pairRank * 10000 + freqArr[1].rank * 100 + freqArr[2].rank * 10 + freqArr[3].rank;
      return { score, rankTier: 1, name: `Pair of ${POKER_RANKS[pairRank]}s`, mainRank: pairRank };
    }

    // Tier 0: High Card
    const score = ranks[0] * 10000 + ranks[1] * 1000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4];
    return { score, rankTier: 0, name: `High Card, ${POKER_RANKS[ranks[0]]}`, mainRank: ranks[0] };
  }
}

window.PokerGame = PokerGame;
