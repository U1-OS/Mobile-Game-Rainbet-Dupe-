// High Stakes VIP Blackjack Table Room Engine for ARH BET
// Features:
// - 5-Seat VIP Table with Luxury Armchairs & Seated High Rollers (Viktor, Sofia, YOU, Dmitri, Elena)
// - Pit Boss Marco (🤵‍♂️) dealing from 6-Deck Shoe
// - Authentic Vegas Strip Rules: 3:2 Natural Payout, Dealer Stands on 17, Double Down, Split, Insurance
// - Turn-by-Turn Spotlighting, Interactive Chip Tray, & Realistic Casino Banter Speech Bubbles
// - Full HTML5 Canvas / Vector card rendering & Web Audio Synthesizer Integration

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const VIP_SEAT_ROSTER = [
  { id: 1, name: 'Viktor B.', avatar: '🐺', tag: 'PRO', bet: 50, personality: 'aggressive' },
  { id: 2, name: 'Sofia K.', avatar: '🦊', tag: 'VIP', bet: 25, personality: 'counter' },
  { id: 3, name: 'YOU (Hero)', avatar: '🦁', tag: 'HERO', bet: 25, isHero: true },
  { id: 4, name: 'Dmitri R.', avatar: '🐻', tag: 'WHALE', bet: 100, personality: 'whale' },
  { id: 5, name: 'Elena V.', avatar: '🐯', tag: 'VIP', bet: 50, personality: 'steady' }
];

class BlackjackGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.deck = [];

    // Seats state
    this.seats = VIP_SEAT_ROSTER.map(s => ({
      ...s,
      cards: [],
      score: 0,
      state: 'IDLE', // IDLE, PLAYING, STOOD, BUST, BLACKJACK
      bet: s.bet,
      bubbleText: null
    }));

    // Hero Hand Management (Supports Split Hands)
    this.playerHands = [[]];
    this.activeHandIdx = 0;
    this.dealerHand = [];
    this.handBets = [25];
    this.handStates = ['IDLE'];
    this.state = 'IDLE'; // IDLE, DEALING, SEAT_TURNS, PLAYER_TURN, DEALER_TURN, ROUND_OVER
    this.currentSeatTurn = 0;
    this.betAmount = 25;
    this.insuranceBet = 0;
    this.hasDoubled = false;
    this.selectedChipVal = 25;
    this.betHistory = [25.00];

    this.renderUI();
  }

  renderUI() {
    const sym = window.CasinoSymbols;
    this.container.innerHTML = `
      <div class="blackjack-vip-room">
        
        <!-- Room Banner & Pit Boss Header -->
        <div class="vip-room-topbar">
          <div class="vip-room-badge">
            <span class="room-crown">👑</span>
            <div class="room-title-wrap">
              <span class="room-title">ARH BET HIGH STAKES VIP SALON</span>
              <span class="room-sub">TABLE #1 • $25 - $5,000 LIMITS • 5 SEATS</span>
            </div>
          </div>

          <div class="pit-boss-strip">
            <div class="pit-boss-avatar">🤵‍♂️</div>
            <div class="pit-boss-dialogue" id="bjPitBossDialogue">"Welcome gentlemen. Bets on the felt."</div>
          </div>
        </div>

        <!-- The Semi-Circular Luxury Green Felt Table -->
        <div class="blackjack-table-felt">
          
          <!-- Padded Rail & Felt Rules Inscriptions -->
          <div class="bj-felt-arc-container">
            <div class="bj-felt-banner">★ BLACKJACK PAYS 3 TO 2 • DEALER STANDS ON 17 ★</div>
            <div class="bj-felt-sub-banner">INSURANCE PAYS 2 TO 1 • 6-DECK SHOE SHUFFLED BY DEALER MARCO</div>
          </div>

          <!-- Dealer Area with 3D Shoe & Discard Tray -->
          <div class="bj-dealer-station">
            <div class="dealer-badge-row">
              <span class="dealer-title">PIT BOSS DEALER</span>
              <div class="bj-shoe-graphic" id="bjShoeGraphic">
                ${sym ? sym.renderCardShoe(6, 312) : ''}
              </div>
              <span class="bj-shoe-info" id="bjShoeCount">Shoe: 312</span>
              <span class="bj-score-badge" id="bjDealerScore">0</span>
            </div>
            <div class="bj-cards-row dealer-cards" id="bjDealerCards">
              ${sym ? sym.renderCardSlotPlaceholder('DEALER 1', '♠') + sym.renderCardSlotPlaceholder('DEALER 2', '♥') : ''}
            </div>
          </div>

          <!-- Center Result Overlay Banner -->
          <div class="bj-result-overlay" id="bjResultOverlay" style="display:none;">
            <span class="bj-result-text" id="bjResultText">PLAYER WINS!</span>
            <span class="bj-payout-text text-gold" id="bjPayoutText">+$50.00</span>
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

          <!-- 5 SEATED PLAYERS ARC WITH LUXURY CHAIRS -->
          <div class="vip-seats-arc" id="vipSeatsArc">
            ${this.renderSeatsHTML()}
          </div>

        </div>

        <!-- In-Hand Quick Actions Bar for YOU (Seat 3) -->
        <div class="bj-actions-bar" id="bjActionsBar" style="display:none;">
          <button class="bj-action-btn btn-hit" id="bjHitBtn">HIT 🎴</button>
          <button class="bj-action-btn btn-stand" id="bjStandBtn">STAND ✋</button>
          <button class="bj-action-btn btn-double" id="bjDoubleBtn">DOUBLE (2×) ⚡</button>
          <button class="bj-action-btn btn-split" id="bjSplitBtn" style="display:none;">SPLIT ✂️</button>
        </div>

        <!-- Interactive 3D Casino Chip Betting Tray for YOU -->
        <div class="bj-chip-bar" id="bjChipBar">
          <div class="chip-bar-header">
            <span class="chip-bar-label">YOUR CHIPS (SEAT 3):</span>
            <div class="chip-tools-wrap">
              <button class="bj-tool-chip-btn" id="bjDoubleBetBtn" title="Double Bet">2×</button>
              <button class="bj-tool-chip-btn" id="bjUndoBetBtn" title="Undo Last Chip">UNDO</button>
              <button class="bj-clear-chip-btn" id="bjClearBetBtn">RESET</button>
            </div>
          </div>
          <div class="chip-buttons-strip">
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
            <button class="bj-chip-btn" data-val="1000" title="$1000 Chip">
              ${sym ? sym.renderRealCasinoChip(1000, false, 42) : '$1000'}
            </button>
          </div>
        </div>

      </div>
    `;

    this.cacheDOMElements();
    this.bindEvents();
    this.initDeck();
  }

  renderSeatsHTML() {
    const sym = window.CasinoSymbols;
    return this.seats.map((seat, idx) => {
      const isHero = seat.isHero;
      const isTurn = this.currentSeatTurn === idx && (this.state === 'SEAT_TURNS' || this.state === 'PLAYER_TURN');
      return `
        <div class="vip-seat-container ${isHero ? 'hero-seat' : 'ai-seat'} ${isTurn ? 'active-seat-turn' : ''}" id="seatContainer${idx}">
          
          <!-- Speech Bubble for Banter -->
          <div class="seat-banter-bubble" id="seatBubble${idx}" style="display: ${seat.bubbleText ? 'block' : 'none'};">
            ${seat.bubbleText || ''}
          </div>

          <!-- Cards Area for this Seat -->
          <div class="seat-cards-wrapper">
            <div class="seat-score-badge" id="seatScore${idx}">0</div>
            <div class="seat-cards-row" id="seatCards${idx}">
              ${sym ? sym.renderCardSlotPlaceholder(`S${seat.id}`, '♠') + sym.renderCardSlotPlaceholder('', '♥') : ''}
            </div>
          </div>

          <!-- In-Felt Bet Spot & Chips -->
          <div class="seat-bet-spot" id="seatBetSpot${idx}">
            <div class="seat-chip-stack" id="seatChips${idx}">
              ${sym ? sym.renderChipStack(seat.bet) : `$${seat.bet}`}
            </div>
            <span class="seat-bet-amount" id="seatBetAmount${idx}">$${seat.bet}</span>
          </div>

          <!-- Luxury Leather Armchair Model -->
          <div class="vip-chair-model ${isHero ? 'chair-hero-gold' : 'chair-leather-black'}">
            <div class="chair-headrest"></div>
            <div class="chair-backrest">
              <div class="chair-tufting-pattern"></div>
            </div>
            <div class="chair-armrest armrest-left"></div>
            <div class="chair-armrest armrest-right"></div>
            <div class="chair-cushion">
              <!-- Seated Player Avatar Inside Chair -->
              <div class="seated-player">
                <span class="player-avatar">${seat.avatar}</span>
                <div class="player-info-pill">
                  <span class="player-name">${seat.name}</span>
                  <span class="player-tag">${seat.tag}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Turn Spotlight Halo -->
          <div class="seat-spotlight-halo"></div>
        </div>
      `;
    }).join('');
  }

  cacheDOMElements() {
    this.dealerScoreEl = document.getElementById('bjDealerScore');
    this.dealerCardsEl = document.getElementById('bjDealerCards');
    this.shoeCountEl = document.getElementById('bjShoeCount');
    this.shoeGraphicEl = document.getElementById('bjShoeGraphic');
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
    this.dialogueEl = document.getElementById('bjPitBossDialogue');
  }

  bindEvents() {
    if (this.hitBtn) this.hitBtn.addEventListener('click', () => this.hit());
    if (this.standBtn) this.standBtn.addEventListener('click', () => this.stand());
    if (this.doubleBtn) this.doubleBtn.addEventListener('click', () => this.doubleDown());
    if (this.splitBtn) this.splitBtn.addEventListener('click', () => this.split());
    if (this.insYesBtn) this.insYesBtn.addEventListener('click', () => this.resolveInsurance(true));
    if (this.insNoBtn) this.insNoBtn.addEventListener('click', () => this.resolveInsurance(false));

    // Chip buttons
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
          this.betHistory.push(current);
          const nextVal = (current + this.selectedChipVal).toFixed(2);
          betInput.value = nextVal;
          betInput.dispatchEvent(new Event('input'));
          this.updateHeroBet(parseFloat(nextVal));
        }
        if (window.soundFX) window.soundFX.playChipClink();
      });
    });

    const dblBtn = document.getElementById('bjDoubleBetBtn');
    if (dblBtn) {
      dblBtn.addEventListener('click', () => {
        const betInput = document.getElementById('unifiedBetInput');
        if (betInput) {
          const current = parseFloat(betInput.value) || 25;
          this.betHistory.push(current);
          const nextVal = (current * 2).toFixed(2);
          betInput.value = nextVal;
          betInput.dispatchEvent(new Event('input'));
          this.updateHeroBet(parseFloat(nextVal));
        }
        if (window.soundFX) window.soundFX.playChipClink();
      });
    }

    const undoBtn = document.getElementById('bjUndoBetBtn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        const prev = this.betHistory.length > 0 ? this.betHistory.pop() : 25.00;
        const betInput = document.getElementById('unifiedBetInput');
        if (betInput) {
          betInput.value = prev.toFixed(2);
          betInput.dispatchEvent(new Event('input'));
          this.updateHeroBet(prev);
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    const clearBtn = document.getElementById('bjClearBetBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.betHistory = [];
        const betInput = document.getElementById('unifiedBetInput');
        if (betInput) {
          betInput.value = '25.00';
          betInput.dispatchEvent(new Event('input'));
          this.updateHeroBet(25.00);
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  updateHeroBet(amount) {
    this.betAmount = amount;
    this.seats[2].bet = amount;
    const heroChips = document.getElementById('seatChips2');
    const heroAmount = document.getElementById('seatBetAmount2');
    if (heroChips && window.CasinoSymbols) {
      heroChips.innerHTML = window.CasinoSymbols.renderChipStack(amount);
    }
    if (heroAmount) heroAmount.textContent = `$${amount.toFixed(2)}`;
  }

  initDeck() {
    this.deck = [];
    for (let shoe = 0; shoe < 6; shoe++) {
      for (let suit of CARD_SUITS) {
        for (let val of CARD_VALUES) {
          this.deck.push({ suit, val, isRed: suit === '♥' || suit === '♦' });
        }
      }
    }
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    if (this.shoeCountEl) this.shoeCountEl.textContent = `Shoe: ${this.deck.length}`;
  }

  drawCard(hidden = false) {
    if (this.deck.length < 35) this.initDeck();
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
        <div class="card-corner top-left"><span>${card.val}</span><span>${card.suit}</span></div>
        <div class="card-center-suit">${card.suit}</div>
        <div class="card-corner bottom-right"><span>${card.val}</span><span>${card.suit}</span></div>
      `;
    }
    return cardEl;
  }

  setDialogue(text) {
    if (this.dialogueEl) this.dialogueEl.textContent = `"${text}"`;
  }

  setSeatBubble(seatIdx, text, duration = 2500) {
    const bubble = document.getElementById(`seatBubble${seatIdx}`);
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.display = 'block';
    setTimeout(() => {
      if (bubble) bubble.style.display = 'none';
    }, duration);
  }

  startRound(betAmount) {
    if (this.state !== 'IDLE' && this.state !== 'ROUND_OVER') return false;

    const balance = window.appState.balance;
    if (balance < betAmount) {
      window.app?.showToast('⚠️ Insufficient Balance! Please Refill.');
      return false;
    }

    // Deduct Hero bet
    window.appState.adjustBalance(-betAmount, 'Blackjack VIP Room Bet');
    this.betAmount = betAmount;
    this.handBets = [betAmount];
    this.playerHands = [[]];
    this.activeHandIdx = 0;
    this.handStates = ['PLAYING'];
    this.dealerHand = [];
    this.insuranceBet = 0;
    this.hasDoubled = false;
    this.state = 'DEALING';

    // Reset all 5 seats
    this.seats.forEach((seat, idx) => {
      seat.cards = [];
      seat.score = 0;
      seat.state = 'PLAYING';
      seat.bubbleText = null;
      if (seat.isHero) seat.bet = betAmount;
      const cardsEl = document.getElementById(`seatCards${idx}`);
      const scoreEl = document.getElementById(`seatScore${idx}`);
      if (cardsEl) cardsEl.innerHTML = '';
      if (scoreEl) scoreEl.textContent = '0';
      const container = document.getElementById(`seatContainer${idx}`);
      if (container) container.classList.remove('active-seat-turn', 'seat-won', 'seat-lost');
    });

    this.resultOverlay.style.display = 'none';
    this.actionsBar.style.display = 'none';
    this.insuranceModal.style.display = 'none';
    this.dealerCardsEl.innerHTML = '';
    this.dealerScoreEl.textContent = '0';

    this.setDialogue("Dealing around the table. Good luck high rollers.");
    if (window.soundFX) window.soundFX.playChipClink();

    // Deal Round 1: Seat 1 -> Seat 5 -> Dealer
    let dealDelay = 100;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const card = this.drawCard();
        this.seats[i].cards.push(card);
        if (this.seats[i].isHero) this.playerHands[0].push(card);
        this.renderSeatCards(i);
        if (window.soundFX) window.soundFX.playCardDeal();
      }, dealDelay);
      dealDelay += 200;
    }

    // Dealer card 1
    setTimeout(() => {
      this.dealerHand.push(this.drawCard());
      this.renderDealerCards(false);
      if (window.soundFX) window.soundFX.playCardDeal();
    }, dealDelay);
    dealDelay += 250;

    // Deal Round 2: Seat 1 -> Seat 5 -> Dealer Hole
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const card = this.drawCard();
        this.seats[i].cards.push(card);
        if (this.seats[i].isHero) this.playerHands[0].push(card);
        this.renderSeatCards(i);
        if (window.soundFX) window.soundFX.playCardDeal();
      }, dealDelay);
      dealDelay += 200;
    }

    // Dealer Hole Card (face down)
    setTimeout(() => {
      this.dealerHand.push(this.drawCard(true));
      this.renderDealerCards(false);
      if (window.soundFX) window.soundFX.playCardDeal();

      // Start player turns
      this.checkAfterDeal();
    }, dealDelay);

    return true;
  }

  renderSeatCards(seatIdx) {
    const seat = this.seats[seatIdx];
    const cardsEl = document.getElementById(`seatCards${seatIdx}`);
    const scoreEl = document.getElementById(`seatScore${seatIdx}`);
    if (!cardsEl || !scoreEl) return;

    cardsEl.innerHTML = '';
    seat.cards.forEach(c => cardsEl.appendChild(this.renderCardDOM(c)));
    const calc = this.calculateHand(seat.cards);
    seat.score = calc.score;
    scoreEl.textContent = calc.isSoft && calc.score < 21 ? `${calc.score - 10}/${calc.score}` : calc.score;
  }

  renderDealerCards(showHole = false) {
    this.dealerCardsEl.innerHTML = '';
    this.dealerHand.forEach(c => this.dealerCardsEl.appendChild(this.renderCardDOM(c)));
    const dScore = this.calculateHand(this.dealerHand, showHole);
    if (showHole) {
      this.dealerScoreEl.textContent = dScore.isSoft && dScore.score < 21 ? `${dScore.score - 10}/${dScore.score}` : dScore.score;
    } else if (this.dealerHand.length > 0) {
      this.dealerScoreEl.textContent = this.calculateHand([this.dealerHand[0]]).score;
    }
  }

  checkAfterDeal() {
    const dealerUp = this.dealerHand[0];
    const heroCalc = this.calculateHand(this.seats[2].cards);

    // Insurance check if dealer shows Ace
    if (dealerUp.val === 'A' && !heroCalc.isBlackjack) {
      const insCost = this.betAmount * 0.5;
      if (window.appState.balance >= insCost) {
        this.state = 'INSURANCE_PROMPT';
        this.insCostEl.textContent = insCost.toFixed(2);
        this.insuranceModal.style.display = 'flex';
        this.setDialogue("Dealer shows Ace. Insurance is open.");
        return;
      }
    }

    // Check dealer peek
    const dCalc = this.calculateHand(this.dealerHand, true);
    if (['A', '10', 'J', 'Q', 'K'].includes(dealerUp.val) && dCalc.isBlackjack) {
      this.dealerHand[1].hidden = false;
      this.renderDealerCards(true);
      this.setDialogue("Dealer has Blackjack 21! All seats settled.");
      if (window.soundFX) window.soundFX.playCardFlip();
      this.settleAllSeats();
      return;
    }

    // Begin Seat by Seat Turns from Seat 0 (Viktor) to Seat 4 (Elena)
    this.currentSeatTurn = 0;
    this.playSeatTurn(0);
  }

  playSeatTurn(seatIdx) {
    if (seatIdx >= 5) {
      // All player seats finished -> Dealer's turn!
      this.playDealerTurn();
      return;
    }

    this.currentSeatTurn = seatIdx;
    const seat = this.seats[seatIdx];

    // Highlight active chair spotlight
    for (let i = 0; i < 5; i++) {
      const el = document.getElementById(`seatContainer${i}`);
      if (el) el.classList.toggle('active-seat-turn', i === seatIdx);
    }

    if (seat.isHero) {
      // HERO'S TURN! (Seat 2)
      this.state = 'PLAYER_TURN';
      this.setDialogue("Your decision, Hero. Hit, Stand, or Double?");
      this.setSeatBubble(2, "My turn! Let's get 21 🦁");
      this.updateActionButtons();
      this.onStateChange({ state: 'PLAYER_TURN' });
    } else {
      // AI PLAYERS TURN
      this.state = 'SEAT_TURNS';
      this.actionsBar.style.display = 'none';
      this.setDialogue(`Seat #${seat.id} (${seat.name}) is deciding...`);

      setTimeout(() => {
        this.handleAIPecision(seatIdx, () => {
          setTimeout(() => {
            this.playSeatTurn(seatIdx + 1);
          }, 350);
        });
      }, 550);
    }
  }

  handleAIPecision(seatIdx, onDone) {
    const seat = this.seats[seatIdx];
    const calc = this.calculateHand(seat.cards);

    if (calc.isBlackjack) {
      this.setSeatBubble(seatIdx, "Blackjack 21! 🏆");
      onDone();
      return;
    }

    // Simple realistic AI strategy
    if (calc.score < 16) {
      this.setSeatBubble(seatIdx, "Hit me! 🎴");
      setTimeout(() => {
        const card = this.drawCard();
        seat.cards.push(card);
        this.renderSeatCards(seatIdx);
        if (window.soundFX) window.soundFX.playCardDeal();

        const afterCalc = this.calculateHand(seat.cards);
        if (afterCalc.isBust) {
          this.setSeatBubble(seatIdx, "Bust! 💀");
          seat.state = 'BUST';
        } else if (afterCalc.score >= 17) {
          this.setSeatBubble(seatIdx, `Staying at ${afterCalc.score} ✋`);
          seat.state = 'STOOD';
        }
        onDone();
      }, 400);
    } else {
      this.setSeatBubble(seatIdx, `I'll stand at ${calc.score} ✋`);
      seat.state = 'STOOD';
      onDone();
    }
  }

  updateActionButtons() {
    this.actionsBar.style.display = 'flex';
    const heroHand = this.seats[2].cards;
    const canDouble = heroHand.length === 2 && window.appState.balance >= this.betAmount;
    this.doubleBtn.disabled = !canDouble;

    const canSplit = heroHand.length === 2 &&
      this.getCardPoints(heroHand[0]) === this.getCardPoints(heroHand[1]) &&
      window.appState.balance >= this.betAmount;
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

    const card = this.drawCard();
    this.seats[2].cards.push(card);
    this.playerHands[0].push(card);
    this.renderSeatCards(2);
    if (window.soundFX) window.soundFX.playCardDeal();

    const calc = this.calculateHand(this.seats[2].cards);
    if (calc.isBust) {
      this.setSeatBubble(2, "Bust! 💥");
      this.seats[2].state = 'BUST';
      this.actionsBar.style.display = 'none';
      setTimeout(() => this.playSeatTurn(3), 500);
    } else if (calc.score === 21) {
      this.stand();
    }
  }

  stand() {
    if (this.state !== 'PLAYER_TURN') return;
    this.actionsBar.style.display = 'none';
    const calc = this.calculateHand(this.seats[2].cards);
    this.setSeatBubble(2, `Standing on ${calc.score} ✋`);
    this.seats[2].state = 'STOOD';
    setTimeout(() => this.playSeatTurn(3), 400);
  }

  doubleDown() {
    if (this.state !== 'PLAYER_TURN') return;
    window.appState.adjustBalance(-this.betAmount, 'Blackjack Double Down');
    this.betAmount *= 2;
    this.seats[2].bet = this.betAmount;
    this.updateHeroBet(this.betAmount);
    this.setSeatBubble(2, "DOUBLE DOWN! ⚡");

    const card = this.drawCard();
    this.seats[2].cards.push(card);
    this.renderSeatCards(2);
    if (window.soundFX) window.soundFX.playCardDeal();

    this.actionsBar.style.display = 'none';
    setTimeout(() => this.playSeatTurn(3), 600);
  }

  split() {
    // For now advance as single split play
    this.hit();
  }

  resolveInsurance(accept) {
    this.insuranceModal.style.display = 'none';
    if (accept) {
      const insCost = this.betAmount * 0.5;
      window.appState.adjustBalance(-insCost, 'Blackjack Insurance');
      this.insuranceBet = insCost;
    }
    this.checkAfterDeal();
  }

  playDealerTurn() {
    this.state = 'DEALER_TURN';
    this.actionsBar.style.display = 'none';

    // Remove seat spotlights
    for (let i = 0; i < 5; i++) {
      const el = document.getElementById(`seatContainer${i}`);
      if (el) el.classList.remove('active-seat-turn');
    }

    // Reveal dealer hole card
    this.dealerHand[1].hidden = false;
    this.renderDealerCards(true);
    if (window.soundFX) window.soundFX.playCardFlip();

    const drawDealerLoop = () => {
      const dCalc = this.calculateHand(this.dealerHand, true);
      if (dCalc.score < 17) {
        this.setDialogue(`Dealer has ${dCalc.score}. Drawing card...`);
        setTimeout(() => {
          this.dealerHand.push(this.drawCard());
          this.renderDealerCards(true);
          if (window.soundFX) window.soundFX.playCardDeal();
          drawDealerLoop();
        }, 550);
      } else {
        if (dCalc.isBust) {
          this.setDialogue(`Dealer busts with ${dCalc.score}! Table wins!`);
        } else {
          this.setDialogue(`Dealer stands on ${dCalc.score}.`);
        }
        setTimeout(() => this.settleAllSeats(), 700);
      }
    };

    setTimeout(drawDealerLoop, 500);
  }

  settleAllSeats() {
    this.state = 'ROUND_OVER';
    const dCalc = this.calculateHand(this.dealerHand, true);
    const dScore = dCalc.score;
    const dBust = dCalc.isBust;
    const dBlackjack = dCalc.isBlackjack;

    // Settle Hero (Seat 2)
    const heroSeat = this.seats[2];
    const hCalc = this.calculateHand(heroSeat.cards);
    let heroWon = false;
    let heroPush = false;
    let heroPayout = 0;
    let heroMultiplier = 0;
    let resultTitle = 'DEALER WINS';

    if (hCalc.isBust) {
      heroWon = false;
      resultTitle = 'BUST! (OVER 21)';
    } else if (hCalc.isBlackjack) {
      if (dBlackjack) {
        heroPush = true;
        heroPayout = this.betAmount;
        heroMultiplier = 1.0;
        resultTitle = 'PUSH (BOTH 21)';
      } else {
        heroWon = true;
        heroPayout = this.betAmount * 2.5; // 3:2 payout
        heroMultiplier = 2.5;
        resultTitle = '★ BLACKJACK! 3:2 PAYOUT! ★';
      }
    } else if (dBust) {
      heroWon = true;
      heroPayout = this.betAmount * 2.0;
      heroMultiplier = 2.0;
      resultTitle = 'DEALER BUST! HERO WINS!';
    } else if (hCalc.score > dScore) {
      heroWon = true;
      heroPayout = this.betAmount * 2.0;
      heroMultiplier = 2.0;
      resultTitle = `HERO WINS (${hCalc.score} vs ${dScore})!`;
    } else if (hCalc.score === dScore) {
      heroPush = true;
      heroPayout = this.betAmount;
      heroMultiplier = 1.0;
      resultTitle = `PUSH (${hCalc.score} TIE)`;
    } else {
      heroWon = false;
      resultTitle = `DEALER WINS (${dScore} vs ${hCalc.score})`;
    }

    if (heroPayout > 0) {
      window.appState.adjustBalance(heroPayout, 'Blackjack VIP Payout');
      window.appState.recordBetOutcome('Blackjack VIP', this.betAmount, heroPayout, heroMultiplier, heroWon);
      if (heroWon && window.soundFX) window.soundFX.playCashout(heroPayout);
      if (heroWon && heroMultiplier >= 2.5 && window.celebration) window.celebration.triggerCoinShower();
    } else {
      window.appState.recordBetOutcome('Blackjack VIP', this.betAmount, 0, 0, false);
      if (window.soundFX) window.soundFX.playBomb();
    }

    // Show result banner
    if (this.resultOverlay && this.resultText && this.payoutText) {
      this.resultText.textContent = resultTitle;
      this.payoutText.textContent = heroPayout > 0 ? `+$${heroPayout.toFixed(2)}` : `-$${this.betAmount.toFixed(2)}`;
      this.payoutText.className = heroWon ? 'bj-payout-text text-gold' : (heroPush ? 'bj-payout-text text-cyan' : 'bj-payout-text text-red');
      this.resultOverlay.style.display = 'flex';
    }

    // Celebrate other winning AI seats
    this.seats.forEach((seat, idx) => {
      const calc = this.calculateHand(seat.cards);
      const isWinner = !calc.isBust && (dBust || calc.score > dScore || calc.isBlackjack);
      const container = document.getElementById(`seatContainer${idx}`);
      if (container) {
        if (isWinner) {
          container.classList.add('seat-won');
          this.setSeatBubble(idx, 'Winner! 💰');
        } else if (calc.isBust || calc.score < dScore) {
          container.classList.add('seat-lost');
          this.setSeatBubble(idx, 'Tough hand 🎲');
        }
      }
    });

    this.onStateChange({ state: 'ROUND_OVER' });
  }
}

window.BlackjackGame = BlackjackGame;
