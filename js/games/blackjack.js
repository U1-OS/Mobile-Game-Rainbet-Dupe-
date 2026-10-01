// Blackjack Game Engine for RainStake Mobile
// Real Vegas Strip / Atlantic City rules:
// 6-Deck Shoe, Cut-card reshuffle, Natural 3:2 payout, Dealer stands on 17,
// True Hand Splitting (dual-hand play), Double Down, Insurance on Ace upcard,
// Interactive 3D Chip Betting Tray, Real Card Deal Sound FX

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class BlackjackGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.deck = [];
    this.playerHands = [[]]; // Array of hands to support splitting!
    this.activeHandIdx = 0;
    this.dealerHand = [];
    this.handBets = [25];
    this.handStates = ['IDLE']; // 'PLAYING', 'STOOD', 'BUST', 'BLACKJACK'
    this.state = 'IDLE'; // IDLE, DEALING, INSURANCE_PROMPT, PLAYER_TURN, DEALER_TURN, ROUND_OVER
    this.betAmount = 25;
    this.insuranceBet = 0;
    this.hasDoubled = false;
    this.selectedChipVal = 25;

    this.renderUI();
  }

  renderUI() {
    const sym = window.CasinoSymbols;
    this.container.innerHTML = `
      <div class="blackjack-table-felt">
        <!-- Padded Table Rail & Felt Markings -->
        <div class="bj-felt-arc-container">
          <div class="bj-felt-banner">★ BLACKJACK PAYS 3 TO 2 ★</div>
          <div class="bj-felt-sub-banner">Dealer Must Draw to 16 and Stand on all 17s • Insurance Pays 2 to 1</div>
        </div>

        <!-- Dealer Hand Area with 3D Dealing Shoe -->
        <div class="bj-hand-section dealer-section">
          <div class="bj-hand-header">
            <div class="bj-actor-label-wrap">
              <span class="bj-actor-label">DEALER</span>
              <span class="bj-shoe-info" id="bjShoeCount">Shoe: 312</span>
            </div>
            <div class="bj-header-right">
              <div class="bj-shoe-graphic" id="bjShoeGraphic">
                ${sym ? sym.renderCardShoe(6, 312) : ''}
              </div>
              <span class="bj-score-badge" id="bjDealerScore">0</span>
            </div>
          </div>
          <div class="bj-cards-row" id="bjDealerCards">
            ${sym ? sym.renderCardSlotPlaceholder('DEALER 1', '♠') + sym.renderCardSlotPlaceholder('DEALER 2', '♥') : ''}
          </div>
        </div>

        <!-- Real Vegas In-Felt Betting Circle Spot -->
        <div class="bj-table-center-zone">
          <div class="bj-bet-circle-spot" id="bjTableBetSpot" title="Active Wager">
            <div class="bet-spot-outer-ring">
              <div class="bet-spot-inner-ring">
                <span class="bet-spot-label">PLACED BET</span>
                <div class="bet-spot-chips" id="bjBetSpotChips">
                  ${sym ? sym.renderChipStack(this.betAmount) : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Insurance Prompt Modal Box (When Dealer shows Ace) -->
        <div class="bj-insurance-modal" id="bjInsuranceModal" style="display:none;">
          <div class="ins-title">🛡️ DEALER SHOWS ACE: TAKE INSURANCE?</div>
          <div class="ins-sub">Pays 2:1 if Dealer has Blackjack. Cost: $<span id="bjInsCost">12.50</span></div>
          <div class="ins-btn-row">
            <button class="ins-btn btn-ins-yes" id="bjInsYesBtn">YES (INSURE)</button>
            <button class="ins-btn btn-ins-no" id="bjInsNoBtn">NO THANKS</button>
          </div>
        </div>

        <!-- Center Table Result Notice -->
        <div class="bj-result-overlay" id="bjResultOverlay" style="display:none;">
          <span class="bj-result-text" id="bjResultText">PLAYER WINS!</span>
          <span class="bj-payout-text text-gold" id="bjPayoutText">+$50.00</span>
        </div>

        <!-- Player Hands Area (Supports Split Hands) -->
        <div class="bj-player-area" id="bjPlayerArea">
          <div class="bj-hand-section player-section active-hand" id="bjHand0">
            <div class="bj-hand-header">
              <div class="bj-actor-label-wrap">
                <span class="bj-actor-label">YOUR HAND</span>
                <span class="bj-bet-tag" id="bjHandBet0">$25.00</span>
              </div>
              <span class="bj-score-badge" id="bjPlayerScore0">0</span>
            </div>
            <div class="bj-cards-row" id="bjPlayerCards0">
              ${sym ? sym.renderCardSlotPlaceholder('CARD 1', '♦') + sym.renderCardSlotPlaceholder('CARD 2', '♣') : ''}
            </div>
          </div>
        </div>

        <!-- In-Hand Quick Actions Bar -->
        <div class="bj-actions-bar" id="bjActionsBar" style="display:none;">
          <button class="bj-action-btn btn-hit" id="bjHitBtn">HIT</button>
          <button class="bj-action-btn btn-stand" id="bjStandBtn">STAND</button>
          <button class="bj-action-btn btn-double" id="bjDoubleBtn">DOUBLE (2×)</button>
          <button class="bj-action-btn btn-split" id="bjSplitBtn" style="display:none;">SPLIT</button>
        </div>

        <!-- Vegas Felt 3D Clay Chip Denominations Bar -->
        <div class="bj-chip-bar" id="bjChipBar">
          <div class="chip-bar-header">
            <span class="chip-bar-label">SELECT CHIP:</span>
            <button class="bj-clear-chip-btn" id="bjClearBetBtn">RESET</button>
          </div>
          <div class="chip-buttons-strip">
            <button class="bj-chip-btn" data-val="1" title="$1 Chip">
              ${sym ? sym.renderRealCasinoChip(1, false, 42) : '$1'}
            </button>
            <button class="bj-chip-btn" data-val="5" title="$5 Chip">
              ${sym ? sym.renderRealCasinoChip(5, false, 42) : '$5'}
            </button>
            <button class="bj-chip-btn" data-val="10" title="$10 Chip">
              ${sym ? sym.renderRealCasinoChip(10, false, 42) : '$10'}
            </button>
            <button class="bj-chip-btn active" data-val="25" title="$25 Chip">
              ${sym ? sym.renderRealCasinoChip(25, true, 42) : '$25'}
            </button>
            <button class="bj-chip-btn" data-val="100" title="$100 Chip">
              ${sym ? sym.renderRealCasinoChip(100, false, 42) : '$100'}
            </button>
            <button class="bj-chip-btn" data-val="500" title="$500 Chip">
              ${sym ? sym.renderRealCasinoChip(500, false, 42) : '$500'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.dealerScoreEl = document.getElementById('bjDealerScore');
    this.dealerCardsEl = document.getElementById('bjDealerCards');
    this.shoeCountEl = document.getElementById('bjShoeCount');
    this.shoeGraphicEl = document.getElementById('bjShoeGraphic');
    this.playerAreaEl = document.getElementById('bjPlayerArea');
    this.actionsBar = document.getElementById('bjActionsBar');
    this.hitBtn = document.getElementById('bjHitBtn');
    this.standBtn = document.getElementById('bjStandBtn');
    this.doubleBtn = document.getElementById('bjDoubleBtn');
    this.splitBtn = document.getElementById('bjSplitBtn');
    this.insuranceModal = document.getElementById('bjInsuranceModal');
    this.insCostEl = document.getElementById('bjInsCost');
    this.insYesBtn = document.getElementById('bjInsYesBtn');
    this.insNoBtn = document.getElementById('bjInsNoBtn');
    this.resultOverlay = document.getElementById('bjResultOverlay');
    this.resultText = document.getElementById('bjResultText');
    this.payoutText = document.getElementById('bjPayoutText');
    this.betSpotChipsEl = document.getElementById('bjBetSpotChips');

    this.bindEvents();
    this.initDeck();
  }

  bindEvents() {
    this.hitBtn.addEventListener('click', () => this.hit());
    this.standBtn.addEventListener('click', () => this.stand());
    this.doubleBtn.addEventListener('click', () => this.doubleDown());
    this.splitBtn.addEventListener('click', () => this.split());
    this.insYesBtn.addEventListener('click', () => this.resolveInsurance(true));
    this.insNoBtn.addEventListener('click', () => this.resolveInsurance(false));

    // Chip denomination selection with 3D visual selection state
    const chips = this.container.querySelectorAll('.bj-chip-btn');
    chips.forEach(c => {
      c.addEventListener('click', () => {
        chips.forEach(ch => {
          ch.classList.remove('active');
          const chipInner = ch.querySelector('.casino-3d-chip');
          if (chipInner) chipInner.classList.remove('selected');
        });
        c.classList.add('active');
        const activeChipInner = c.querySelector('.casino-3d-chip');
        if (activeChipInner) activeChipInner.classList.add('selected');

        this.selectedChipVal = parseFloat(c.dataset.val);
        const betInput = document.getElementById('unifiedBetInput');
        if (betInput) {
          const current = parseFloat(betInput.value) || 0;
          const nextVal = (current + this.selectedChipVal).toFixed(2);
          betInput.value = nextVal;
          betInput.dispatchEvent(new Event('input'));
          this.updateBetSpot(parseFloat(nextVal));
        }
        if (window.soundFX) window.soundFX.playChipClink();
      });
    });

    const clearBtn = document.getElementById('bjClearBetBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const betInput = document.getElementById('unifiedBetInput');
        if (betInput) {
          betInput.value = '10.00';
          betInput.dispatchEvent(new Event('input'));
          this.updateBetSpot(10.00);
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  updateBetSpot(amount) {
    if (this.betSpotChipsEl && window.CasinoSymbols) {
      this.betSpotChipsEl.innerHTML = window.CasinoSymbols.renderChipStack(amount);
    }
  }

  initDeck() {
    this.deck = [];
    // 6-Deck Shoe standard for authentic casino dealing
    for (let shoe = 0; shoe < 6; shoe++) {
      for (let suit of CARD_SUITS) {
        for (let val of CARD_VALUES) {
          this.deck.push({
            suit,
            val,
            isRed: suit === '♥' || suit === '♦'
          });
        }
      }
    }
    // Fisher-Yates Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    if (this.shoeCountEl) this.shoeCountEl.textContent = `Shoe: ${this.deck.length}`;
  }

  drawCard(hidden = false) {
    if (this.deck.length < 25) this.initDeck();
    const card = this.deck.pop();
    if (this.shoeCountEl) this.shoeCountEl.textContent = `Shoe: ${this.deck.length}`;
    if (this.shoeGraphicEl && window.CasinoSymbols) {
      this.shoeGraphicEl.innerHTML = window.CasinoSymbols.renderCardShoe(Math.ceil(this.deck.length / 52), this.deck.length);
    }
    return { ...card, hidden };
  }

  calculateHand(cards, countHidden = false) {
    let score = 0;
    let aces = 0;

    for (let c of cards) {
      if (c.hidden && !countHidden) continue;
      if (c.val === 'A') {
        aces++;
        score += 11;
      } else if (['K', 'Q', 'J', '10'].includes(c.val)) {
        score += 10;
      } else {
        score += parseInt(c.val, 10);
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    const isSoft = aces > 0 && score <= 21;
    const isBlackjack = cards.length === 2 && score === 21;
    return { score, isSoft, isBlackjack, isBust: score > 21 };
  }

  renderCardDOM(card) {
    if (window.CasinoSymbols && window.CasinoSymbols.createPlayingCardElement) {
      return window.CasinoSymbols.createPlayingCardElement(card, card.hidden);
    }
    const cardEl = document.createElement('div');
    if (card.hidden) {
      cardEl.className = 'bj-card card-hidden';
      cardEl.innerHTML = `<div class="card-back-pattern"></div>`;
    } else {
      cardEl.className = `bj-card card-dealt ${card.isRed ? 'red-suit' : 'black-suit'}`;
      cardEl.innerHTML = `
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
    return cardEl;
  }

  startRound(betAmount) {
    if (this.state !== 'IDLE' && this.state !== 'ROUND_OVER') return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.betAmount = betAmount;
    this.handBets = [betAmount];
    this.playerHands = [[]];
    this.activeHandIdx = 0;
    this.handStates = ['PLAYING'];
    this.dealerHand = [];
    this.insuranceBet = 0;
    this.hasDoubled = false;
    this.state = 'DEALING';

    this.resultOverlay.style.display = 'none';
    this.actionsBar.style.display = 'none';
    this.insuranceModal.style.display = 'none';

    // Reset Player Hands DOM container
    this.playerAreaEl.innerHTML = `
      <div class="bj-hand-section player-section active-hand" id="bjHand0">
        <div class="bj-hand-header">
          <div class="bj-actor-label-wrap">
            <span class="bj-actor-label">YOUR HAND</span>
            <span class="bj-bet-tag" id="bjHandBet0">$${betAmount.toFixed(2)}</span>
          </div>
          <span class="bj-score-badge" id="bjPlayerScore0">0</span>
        </div>
        <div class="bj-cards-row" id="bjPlayerCards0"></div>
      </div>
    `;

    this.dealerCardsEl.innerHTML = '';
    this.dealerScoreEl.textContent = '0';

    if (window.soundFX) window.soundFX.playChipClink();

    // Deal sequence: Player 1, Dealer 1, Player 2, Dealer 2 (hole card)
    setTimeout(() => {
      this.playerHands[0].push(this.drawCard());
      this.updateBoard(false);
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 150);

    setTimeout(() => {
      this.dealerHand.push(this.drawCard());
      this.updateBoard(false);
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 450);

    setTimeout(() => {
      this.playerHands[0].push(this.drawCard());
      this.updateBoard(false);
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 750);

    setTimeout(() => {
      this.dealerHand.push(this.drawCard(true)); // Hole card face-down
      this.updateBoard(false);
      if (window.soundFX) window.soundFX.playCardDeal();

      this.checkAfterDeal();
    }, 1050);

    return true;
  }

  checkAfterDeal() {
    const dealerUp = this.dealerHand[0];
    const playerHand = this.playerHands[0];
    const pCalc = this.calculateHand(playerHand);
    const dCalc = this.calculateHand(this.dealerHand, true);

    // If Dealer shows Ace, offer Insurance
    if (dealerUp.val === 'A' && !pCalc.isBlackjack) {
      const insCost = this.betAmount * 0.5;
      if (window.appState.balance >= insCost) {
        this.state = 'INSURANCE_PROMPT';
        this.insCostEl.textContent = insCost.toFixed(2);
        this.insuranceModal.style.display = 'flex';
        return;
      }
    }

    // Dealer Peeks for Blackjack if showing Ace or 10
    if (['A', '10', 'J', 'Q', 'K'].includes(dealerUp.val)) {
      if (dCalc.isBlackjack) {
        // Dealer has Blackjack! Reveal hole card
        this.dealerHand[1].hidden = false;
        this.updateBoard(true);
        if (window.soundFX) window.soundFX.playCardFlip();

        if (pCalc.isBlackjack) {
          this.endRound('PUSH', 1.0, this.betAmount, 'BLACKJACK PUSH (BOTH 21)!');
        } else {
          this.endRound('LOSE', 0, 0, 'DEALER HAS BLACKJACK (21)!');
        }
        return;
      }
    }

    // Check Player Natural Blackjack
    if (pCalc.isBlackjack) {
      this.dealerHand[1].hidden = false;
      this.updateBoard(true);
      if (window.soundFX) window.soundFX.playCardFlip();

      const payout = this.betAmount * 2.5; // 3:2 payout = 1.5 profit + original bet
      this.endRound('BLACKJACK', 2.5, payout, '★ NATURAL BLACKJACK (3:2)! ★');
      return;
    }

    // Normal player turn starts
    this.state = 'PLAYER_TURN';
    this.updateActionButtons();
    this.onStateChange({ state: this.state, playerHands: this.playerHands });
  }

  resolveInsurance(accept) {
    this.insuranceModal.style.display = 'none';
    const dCalc = this.calculateHand(this.dealerHand, true);

    if (accept) {
      const insCost = this.betAmount * 0.5;
      window.appState.deductBet(insCost);
      this.insuranceBet = insCost;
      if (window.soundFX) window.soundFX.playChipClink();

      if (dCalc.isBlackjack) {
        // Insurance wins 2:1!
        const insPayout = this.insuranceBet * 3;
        window.appState.recordOutcome('Blackjack Insurance', this.insuranceBet, 3.0, insPayout);
        this.dealerHand[1].hidden = false;
        this.updateBoard(true);
        this.endRound('INSURANCE_WIN', 0, insPayout, 'DEALER BLACKJACK • INSURANCE PAYS 2:1!');
        return;
      } else {
        // Insurance loses, game continues
        if (window.soundFX) window.soundFX.playDiceLoss();
      }
    }

    if (dCalc.isBlackjack) {
      this.dealerHand[1].hidden = false;
      this.updateBoard(true);
      this.endRound('LOSE', 0, 0, 'DEALER HAS BLACKJACK!');
      return;
    }

    this.state = 'PLAYER_TURN';
    this.updateActionButtons();
    this.onStateChange({ state: this.state, playerHands: this.playerHands });
  }

  updateBoard(showDealerHole = false) {
    // Render Player Hands
    this.playerHands.forEach((hand, idx) => {
      const cardsEl = document.getElementById(`bjPlayerCards${idx}`);
      const scoreEl = document.getElementById(`bjPlayerScore${idx}`);
      const handSec = document.getElementById(`bjHand${idx}`);

      if (cardsEl && scoreEl) {
        cardsEl.innerHTML = '';
        hand.forEach(c => cardsEl.appendChild(this.renderCardDOM(c)));
        const calc = this.calculateHand(hand);
        scoreEl.textContent = calc.isSoft && calc.score < 21 ? `${calc.score - 10}/${calc.score}` : calc.score;
        if (handSec) {
          handSec.classList.toggle('active-hand', idx === this.activeHandIdx && this.state === 'PLAYER_TURN');
        }
      }
    });

    // Render Dealer Hand
    this.dealerCardsEl.innerHTML = '';
    this.dealerHand.forEach(c => this.dealerCardsEl.appendChild(this.renderCardDOM(c)));

    const dScore = this.calculateHand(this.dealerHand, showDealerHole);
    if (showDealerHole) {
      this.dealerScoreEl.textContent = dScore.isSoft && dScore.score < 21 ? `${dScore.score - 10}/${dScore.score}` : dScore.score;
    } else if (this.dealerHand.length > 0) {
      this.dealerScoreEl.textContent = this.calculateHand([this.dealerHand[0]]).score;
    }
  }

  updateActionButtons() {
    this.actionsBar.style.display = 'flex';
    const currentHand = this.playerHands[this.activeHandIdx];
    const canDouble = currentHand.length === 2 && window.appState.balance >= this.handBets[this.activeHandIdx];
    this.doubleBtn.disabled = !canDouble;

    // Check Split Eligibility: first 2 cards have same numerical value
    const canSplit = currentHand.length === 2 &&
      this.playerHands.length === 1 &&
      this.getCardPoints(currentHand[0]) === this.getCardPoints(currentHand[1]) &&
      window.appState.balance >= this.handBets[0];

    this.splitBtn.style.display = canSplit ? 'block' : 'none';
  }

  getCardPoints(card) {
    if (card.val === 'A') return 11;
    if (['K', 'Q', 'J', '10'].includes(card.val)) return 10;
    return parseInt(card.val, 10);
  }

  hit() {
    if (this.state !== 'PLAYER_TURN') return;
    this.doubleBtn.disabled = true;
    this.splitBtn.style.display = 'none';

    const hand = this.playerHands[this.activeHandIdx];
    hand.push(this.drawCard());
    this.updateBoard(false);
    if (window.soundFX) window.soundFX.playCardDeal();

    const calc = this.calculateHand(hand);
    if (calc.isBust) {
      this.handStates[this.activeHandIdx] = 'BUST';
      this.advanceToNextHand();
    } else if (calc.score === 21) {
      this.stand();
    }
  }

  doubleDown() {
    if (this.state !== 'PLAYER_TURN') return;
    const bet = this.handBets[this.activeHandIdx];
    if (!window.appState.deductBet(bet)) return;

    this.handBets[this.activeHandIdx] *= 2;
    const betTag = document.getElementById(`bjHandBet${this.activeHandIdx}`);
    if (betTag) betTag.textContent = `$${this.handBets[this.activeHandIdx].toFixed(2)}`;

    const hand = this.playerHands[this.activeHandIdx];
    hand.push(this.drawCard());
    this.updateBoard(false);
    if (window.soundFX) {
      window.soundFX.playChipClink();
      window.soundFX.playCardDeal();
    }

    const calc = this.calculateHand(hand);
    if (calc.isBust) {
      this.handStates[this.activeHandIdx] = 'BUST';
    } else {
      this.handStates[this.activeHandIdx] = 'STOOD';
    }

    setTimeout(() => this.advanceToNextHand(), 600);
  }

  split() {
    if (this.state !== 'PLAYER_TURN' || this.playerHands.length !== 1) return;
    const originalBet = this.handBets[0];
    if (!window.appState.deductBet(originalBet)) return;

    if (window.soundFX) window.soundFX.playChipClink();

    // Divide into 2 hands
    const card1 = this.playerHands[0][0];
    const card2 = this.playerHands[0][1];

    this.playerHands = [[card1], [card2]];
    this.handBets = [originalBet, originalBet];
    this.handStates = ['PLAYING', 'PLAYING'];
    this.activeHandIdx = 0;

    // Render 2 player hands in DOM
    this.playerAreaEl.innerHTML = `
      <div class="bj-split-hands-grid">
        <div class="bj-hand-section player-section active-hand" id="bjHand0">
          <div class="bj-hand-header">
            <span class="bj-actor-label">HAND 1</span>
            <span class="bj-score-badge" id="bjPlayerScore0">0</span>
          </div>
          <div class="bj-cards-row" id="bjPlayerCards0"></div>
          <div class="bj-bet-tag" id="bjHandBet0">$${originalBet.toFixed(2)}</div>
        </div>
        <div class="bj-hand-section player-section" id="bjHand1">
          <div class="bj-hand-header">
            <span class="bj-actor-label">HAND 2</span>
            <span class="bj-score-badge" id="bjPlayerScore1">0</span>
          </div>
          <div class="bj-cards-row" id="bjPlayerCards1"></div>
          <div class="bj-bet-tag" id="bjHandBet1">$${originalBet.toFixed(2)}</div>
        </div>
      </div>
    `;

    // Deal 1 card to each hand
    setTimeout(() => {
      this.playerHands[0].push(this.drawCard());
      this.updateBoard(false);
      if (window.soundFX) window.soundFX.playCardDeal();
    }, 250);

    setTimeout(() => {
      this.playerHands[1].push(this.drawCard());
      this.updateBoard(false);
      if (window.soundFX) window.soundFX.playCardDeal();
      this.updateActionButtons();
    }, 600);
  }

  stand() {
    if (this.state !== 'PLAYER_TURN') return;
    this.handStates[this.activeHandIdx] = 'STOOD';
    this.advanceToNextHand();
  }

  advanceToNextHand() {
    if (this.activeHandIdx < this.playerHands.length - 1) {
      this.activeHandIdx++;
      this.updateBoard(false);
      this.updateActionButtons();
      if (window.soundFX) window.soundFX.playClick();
    } else {
      // All player hands finished, proceed to dealer
      this.actionsBar.style.display = 'none';
      const allBust = this.handStates.every(s => s === 'BUST');
      if (allBust) {
        // Reveal dealer card and end round
        this.dealerHand[1].hidden = false;
        this.updateBoard(true);
        if (window.soundFX) window.soundFX.playCardFlip();
        this.evaluateFinalPayouts();
      } else {
        this.state = 'DEALER_TURN';
        this.dealerHand[1].hidden = false;
        this.updateBoard(true);
        if (window.soundFX) window.soundFX.playCardFlip();
        this.runDealerAI();
      }
    }
  }

  runDealerAI() {
    const playDealerStep = () => {
      const dCalc = this.calculateHand(this.dealerHand, true);

      // Dealer stands on all 17s (hard or soft)
      if (dCalc.score < 17) {
        setTimeout(() => {
          this.dealerHand.push(this.drawCard());
          this.updateBoard(true);
          if (window.soundFX) window.soundFX.playCardDeal();
          playDealerStep();
        }, 650);
      } else {
        this.evaluateFinalPayouts();
      }
    };

    setTimeout(playDealerStep, 500);
  }

  evaluateFinalPayouts() {
    const dCalc = this.calculateHand(this.dealerHand, true);
    const dScore = dCalc.score;
    let totalBet = 0;
    let totalPayout = 0;
    let winCount = 0;
    let pushCount = 0;
    let loseCount = 0;

    this.playerHands.forEach((hand, idx) => {
      const bet = this.handBets[idx];
      totalBet += bet;
      const pCalc = this.calculateHand(hand);
      const pScore = pCalc.score;

      if (pCalc.isBust) {
        loseCount++;
      } else if (dCalc.isBust) {
        // Dealer busted!
        winCount++;
        totalPayout += bet * 2;
      } else if (pScore > dScore) {
        winCount++;
        totalPayout += bet * 2;
      } else if (pScore === dScore) {
        pushCount++;
        totalPayout += bet;
      } else {
        loseCount++;
      }
    });

    const netProfit = totalPayout - totalBet;
    const mult = totalBet > 0 ? totalPayout / totalBet : 0;
    window.appState.recordOutcome('Blackjack', totalBet, mult, totalPayout);

    let message = '';
    if (this.playerHands.length > 1) {
      message = `SPLIT: ${winCount} Won • ${pushCount} Push • ${loseCount} Lost`;
    } else if (dCalc.isBust) {
      message = 'DEALER BUSTS • YOU WIN!';
    } else if (winCount > 0) {
      message = 'YOU WIN!';
    } else if (pushCount > 0) {
      message = 'PUSH • BET RETURNED';
    } else {
      message = 'DEALER WINS';
    }

    this.endRound(winCount > 0 ? 'WIN' : (pushCount > 0 ? 'PUSH' : 'LOSE'), mult, totalPayout, message);
  }

  endRound(result, mult, payout, message) {
    this.state = 'ROUND_OVER';
    this.actionsBar.style.display = 'none';

    this.resultText.textContent = message;
    const profit = payout - this.betAmount;
    this.payoutText.textContent = payout > 0 ? `+$${payout.toFixed(2)}` : `-$${this.betAmount.toFixed(2)}`;
    this.resultOverlay.style.display = 'flex';
    this.resultOverlay.className = `bj-result-overlay win-pop ${mult > 1 ? 'win' : (mult === 1 ? 'push' : 'lose')}`;

    if (mult > 1 && window.soundFX) {
      window.soundFX.playCashout();
    } else if (mult === 0 && window.soundFX) {
      window.soundFX.playDiceLoss();
    }

    this.onStateChange({ state: this.state, result, payout });
  }
}

window.BlackjackGame = BlackjackGame;
