// Main Application Controller for RainStake Mobile
// Replicates Rainbet.com & Stake.com:
// - Authentic Lobby with Hero Carousel, Player Level & XP Card, Game Posters
// - In-Game Arena with Unified Betting Dock & Real Casino Table/Slot Engines
// - Real Slots: Lightning Link (Hold & Spin), Gates of Olympus 1000 (Tumbling Zeus Multipliers)
// - Modals: Apple/Google Login & 12 Avatars, 7-Day Streak Calendar, Faucet Reload, Level Up, Game Rules
// - Splash Screen, Community Rain Ticker & Live High Rollers Stream

const GAME_METADATA = {
  blackjack: {
    name: 'Blackjack 3:2',
    rtp: '99.54% RTP',
    category: 'cards',
    provider: 'REAL TABLE',
    rules: `
      <h4>Vegas Strip Blackjack 3:2 Rules</h4>
      <ul>
        <li><strong>Blackjack Pays:</strong> 3 to 2 on natural 21 (Ace + 10-value card).</li>
        <li><strong>Dealer Rules:</strong> Dealer must hit on 16 and stand on all 17s (soft and hard).</li>
        <li><strong>Double Down:</strong> Allowed on any initial two-card hand. Receive exactly one card.</li>
        <li><strong>Split Pairs:</strong> Split identical rank cards into two separate hands with an equal additional bet.</li>
        <li><strong>Insurance:</strong> Offered when Dealer shows an Ace. Pays 2 to 1 if Dealer has natural Blackjack.</li>
        <li><strong>Shoe:</strong> Played with a 6-deck shoe shuffled with simulated cryptographic RNG.</li>
      </ul>
    `
  },
  poker: {
    name: 'Texas Hold\'em',
    rtp: '98.80% RTP',
    category: 'cards',
    provider: 'REAL TABLE',
    rules: `
      <h4>Casino Texas Hold'em Rules</h4>
      <ul>
        <li><strong>Ante Bet:</strong> Place Ante bet to receive 2 hole cards. Dealer receives 2 face-down cards.</li>
        <li><strong>The Flop:</strong> 3 community cards dealt face up.</li>
        <li><strong>Call or Fold:</strong> Call requires 2x Ante bet to see Turn & River; Fold forfeits your Ante.</li>
        <li><strong>Showdown:</strong> Best 5-card poker hand wins. Dealer qualifies with Pair of 4s or better.</li>
        <li><strong>AA Bonus Side Bet:</strong> Pays bonus if player hole cards + Flop contains Pair of Aces or better (up to 100:1 for Royal Flush).</li>
      </ul>
    `
  },
  roulette: {
    name: 'European Roulette',
    rtp: '97.30% RTP',
    category: 'cards',
    provider: 'REAL TABLE',
    rules: `
      <h4>Single-Zero European Roulette Rules</h4>
      <ul>
        <li><strong>Wheel:</strong> 37 pockets (0 to 36). Single green zero gives superior 97.30% player RTP.</li>
        <li><strong>Straight Up (Single Number):</strong> Pays 35:1.</li>
        <li><strong>Split (2 Numbers):</strong> Pays 17:1.</li>
        <li><strong>Street (3 Numbers):</strong> Pays 11:1. Corner (4 Numbers): Pays 8:1.</li>
        <li><strong>Dozens & Columns:</strong> Pays 2:1.</li>
        <li><strong>Even Money (Red/Black, Odd/Even, 1-18/19-36):</strong> Pays 1:1.</li>
      </ul>
    `
  },
  baccarat: {
    name: 'Baccarat Punto Banco',
    rtp: '98.94% RTP',
    category: 'cards',
    provider: 'REAL TABLE',
    rules: `
      <h4>Baccarat Punto Banco Rules</h4>
      <ul>
        <li><strong>Objective:</strong> Bet on Banker, Player, or Tie. Hand closest to 9 wins.</li>
        <li><strong>Card Values:</strong> Aces = 1, 2-9 = Face value, 10s and face cards = 0. Hand value is last digit of total.</li>
        <li><strong>Player Bet:</strong> Pays 1:1 (House edge 1.24%).</li>
        <li><strong>Banker Bet:</strong> Pays 0.95:1 (5% standard casino commission, House edge 1.06%).</li>
        <li><strong>Tie Bet:</strong> Pays 8:1.</li>
        <li><strong>Tableau Rules:</strong> Natural 8 or 9 ends round immediately. Third card drawn according to strict tableau.</li>
      </ul>
    `
  },
  lightning: {
    name: 'Lightning Link',
    rtp: '96.80% RTP',
    category: 'slots',
    provider: 'VEGAS SLOT',
    rules: `
      <h4>Lightning Link Hold & Spin Rules</h4>
      <ul>
        <li><strong>Hold & Spin Feature:</strong> 6 or more Golden Lightning Orbs trigger the Hold & Spin bonus!</li>
        <li><strong>3 Respins:</strong> All triggering orbs lock into place. You start with 3 respins. Every new orb landing resets respins back to 3!</li>
        <li><strong>Jackpots:</strong> Orbs can hold cash values ($1 to $500) or MINI ($10), MINOR ($50), or MAJOR ($500) jackpots!</li>
        <li><strong>GRAND JACKPOT:</strong> Fill all 15 positions on the 5x3 reels with orbs to win the progressive GRAND JACKPOT ($10,000+)!</li>
        <li><strong>Giant 3x3 Free Games:</strong> 3 Scatters trigger Free Games with reels 2, 3, and 4 spinning together as one Giant Mega Symbol!</li>
        <li><strong>Buy Feature:</strong> Buy Hold & Spin for 60x bet, or Buy Giant Free Games for 80x bet!</li>
      </ul>
    `
  },
  olympus: {
    name: 'Rain God 1000',
    rtp: '96.50% RTP',
    category: 'slots',
    provider: 'DRUBET SLOTS',
    rules: `
      <h4>Rain God 1000 Rules</h4>
      <ul>
        <li><strong>Scatter Pays:</strong> 6x5 grid. Symbols pay ANYWHERE on screen when 8 or more identical symbols land!</li>
        <li><strong>Tumble Feature:</strong> Winning symbols explode and disappear. Remaining symbols fall down, and new symbols drop from above for consecutive wins!</li>
        <li><strong>Rain God Multipliers:</strong> The Rain God strikes with thunder and drops winged multiplier orbs randomly from 2x up to 1,000x!</li>
        <li><strong>Free Spins:</strong> 4 or more Rain God Scatters award 15 Free Spins!</li>
        <li><strong>Persistent Multiplier:</strong> In Free Spins, any multiplier that hits on a winning tumble is added to the Total Multiplier for the entire bonus!</li>
        <li><strong>Buy Bonus:</strong> Buy 15 Free Spins instantly for 100x bet!</li>
        <li><strong>Double Chance:</strong> Turn on Ante Bet (+25% bet) for 2x natural chance of hitting Free Spins.</li>
      </ul>
    `
  },
  sweetbonanza: {
    name: 'Sweet Bonanza 1000',
    rtp: '96.53% RTP',
    category: 'slots',
    provider: 'PRAGMATIC PLAY',
    rules: `
      <h4>Sweet Bonanza 1000 Rules</h4>
      <ul>
        <li><strong>Pay Anywhere:</strong> 6x5 tumble grid where 8+ matching candies anywhere on screen pay.</li>
        <li><strong>Tumbling Reels:</strong> Winning candies explode and new candies drop down in rapid succession.</li>
        <li><strong>Sugar Bomb Multipliers:</strong> In Free Spins, rainbow sugar bombs drop with multipliers from 2x up to 1,000x!</li>
        <li><strong>Free Spins Feature:</strong> 4+ Lollipops award 10 Free Spins!</li>
        <li><strong>Buy Bonus:</strong> 100x Standard Bonus or 500x Super Bonus with guaranteed 20x+ bombs!</li>
      </ul>
    `
  },
  sugarrush: {
    name: 'Sugar Rush 1000',
    rtp: '96.53% RTP',
    category: 'slots',
    provider: 'PRAGMATIC PLAY',
    rules: `
      <h4>Sugar Rush 1000 Rules</h4>
      <ul>
        <li><strong>Cluster Pays:</strong> 7x7 grid. Form clusters of 5 or more connected gummy bears and stars.</li>
        <li><strong>Multiplier Spots:</strong> Winning symbols leave a wrapper. A second win on that spot starts a 2x multiplier that DOUBLES on every win up to 1,024x!</li>
        <li><strong>Persistent Free Spins:</strong> In Free Spins, all multiplier spots remain sticky until the bonus ends!</li>
        <li><strong>Buy Bonus:</strong> 100x Standard Free Spins or 500x Super Free Spins (all spots pre-filled with 2x)!</li>
      </ul>
    `
  },
  wanted: {
    name: 'Wanted Dead or a Wild',
    rtp: '96.38% RTP',
    category: 'slots',
    provider: 'HACKSAW GAMING',
    rules: `
      <h4>Wanted Dead or a Wild Rules</h4>
      <ul>
        <li><strong>VS DuelReels:</strong> When a VS symbol lands and forms part of a win, it expands into a full wild duel reel with multipliers up to 100x!</li>
        <li><strong>The Great Train Robbery:</strong> 3+ Train Robbery symbols award 10 Free Spins with sticky wilds.</li>
        <li><strong>Duel at Dawn:</strong> 3+ Duel symbols award 10 Free Spins loaded with VS DuelReels.</li>
        <li><strong>Dead Man's Hand:</strong> Collect wilds and multipliers in phase 1, then spin 3 showdown spins!</li>
      </ul>
    `
  },
  bigbass: {
    name: 'Big Bass Splash',
    rtp: '96.71% RTP',
    category: 'slots',
    provider: 'REEL KINGDOM',
    rules: `
      <h4>Big Bass Splash Rules</h4>
      <ul>
        <li><strong>Money Fish:</strong> Fish symbols carry random cash values from 2x to 500x your bet.</li>
        <li><strong>Fisherman Wild:</strong> Appears during Free Spins to reel in and collect all visible fish money values!</li>
        <li><strong>Free Spins Level-up:</strong> Every 4 Fishermen collected awards +10 Free Spins and increases the Fisherman multiplier (2x, 3x, and 10x)!</li>
        <li><strong>Bazooka & Hook:</strong> Random modifiers reel in extra fish when a Fisherman lands with no fish!</li>
      </ul>
    `
  },
  doghouse: {
    name: 'The Dog House Megaways',
    rtp: '96.55% RTP',
    category: 'slots',
    provider: 'PRAGMATIC PLAY',
    rules: `
      <h4>The Dog House Megaways Rules</h4>
      <ul>
        <li><strong>Megaways Action:</strong> 6 reels with up to 117,649 ways to win!</li>
        <li><strong>Multiplying Kennel Wilds:</strong> Dog kennels land with 2x or 3x multipliers and multiply each other!</li>
        <li><strong>Raining Wilds or Sticky Wilds:</strong> Choose between Sticky Wilds Free Spins or Raining Wilds Free Spins!</li>
      </ul>
    `
  },
  bookofdead: {
    name: 'Book of Dead',
    rtp: '96.21% RTP',
    category: 'slots',
    provider: 'PLAY\'N GO',
    rules: `
      <h4>Book of Dead Rules</h4>
      <ul>
        <li><strong>Rich Wilde Adventure:</strong> 5x3 reels with 10 classic paylines in ancient Egypt.</li>
        <li><strong>Tomb Book Symbol:</strong> Acts as both Wild and Scatter!</li>
        <li><strong>Expanding Symbol:</strong> 3+ Books trigger 10 Free Spins with 1 randomly chosen special expanding symbol that covers whole reels!</li>
      </ul>
    `
  },
  razorshark: {
    name: 'Razor Shark',
    rtp: '96.70% RTP',
    category: 'slots',
    provider: 'PUSH GAMING',
    rules: `
      <h4>Razor Shark Rules</h4>
      <ul>
        <li><strong>Mystery Seaweed:</strong> Stacks of 4 seaweed nudge down each spin, revealing paying symbols or Golden Sharks!</li>
        <li><strong>Razor Reveal:</strong> Golden Sharks spin into bet multipliers up to 2,500x or Scatter symbols!</li>
        <li><strong>Free Games:</strong> Unlimited Free Games with increasing multipliers on every seaweed nudge!</li>
      </ul>
    `
  },
  sanquentin: {
    name: 'San Quentin xWays',
    rtp: '96.03% RTP',
    category: 'slots',
    provider: 'NOLIMIT CITY',
    rules: `
      <h4>San Quentin xWays Rules</h4>
      <ul>
        <li><strong>Enhancer Cells:</strong> Locked cells on top and bottom reels open to reveal xWays, Razor Splits, or Wilds!</li>
        <li><strong>Razor Split:</strong> Splits all symbols on the reel into doubles!</li>
        <li><strong>Lockdown Spins:</strong> Jumping Wilds that move each spin with multiplying frenzy up to 150,000x max win!</li>
      </ul>
    `
  },
  slots: {
    name: 'Rain Crown Slots',
    rtp: '96.50% RTP',
    category: 'slots',
    provider: 'VIDEO SLOT',
    rules: `
      <h4>Rain Crown 10-Line Slot Rules</h4>
      <ul>
        <li><strong>Paylines:</strong> 10 fixed paylines paying left-to-right across 5 reels and 3 rows.</li>
        <li><strong>Crown Wild:</strong> Substitutes for all regular symbols to form highest winning combination.</li>
        <li><strong>Free Spins:</strong> 3 or more Scatters award 10 Free Spins with a random Expanding Special Symbol!</li>
        <li><strong>Buy Bonus:</strong> Buy 10 Free Spins instantly for 100x bet.</li>
      </ul>
    `
  },
  cases: {
    name: 'Mystery Cases',
    rtp: '97.00% RTP',
    category: 'slots',
    provider: 'CASE BATTLES',
    rules: `
      <h4>Mystery Cases Rules</h4>
      <ul>
        <li><strong>Unboxing:</strong> Open virtual weapon & crypto cases with authentic roulette rolling animation.</li>
        <li><strong>Odds & Tiers:</strong> Items range from Common (Grey), Rare (Blue), Classified (Pink), Covert (Red), to Gold Jackpot Knives & Gloves!</li>
        <li><strong>Instant Payout:</strong> Winning item simulated value is immediately credited to your balance.</li>
      </ul>
    `
  },
  chicken: {
    name: 'Chicken Road',
    rtp: '99.00% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Chicken Road Rules</h4>
      <ul>
        <li><strong>Cross the Road:</strong> Guide the 🐔 safely across each lane without getting hit by cars or roasted by fire!</li>
        <li><strong>Difficulty Modes:</strong> Choose Easy (25 steps, 8% traps), Medium (20 steps, 15% traps), Hard (15 steps, 25% traps), or Daredevil (10 steps, 40% traps).</li>
        <li><strong>Multiplier Ladder:</strong> Every successful hop increases your multiplier up to 2,000x+!</li>
        <li><strong>Cash Out Anytime:</strong> Take your profits whenever you want before disaster strikes!</li>
      </ul>
    `
  },
  btcupdown: {
    name: 'BTC 2.5M Up or Down',
    rtp: '97.50% RTP',
    category: 'originals',
    provider: 'CRYPTO DERIVATIVES',
    rules: `
      <h4>BTC 2.5 Minute Up or Down Rules</h4>
      <ul>
        <li><strong>Binary Expiry:</strong> 2.5 minute (150-second) candlestick interval rounds based on real-time Bitcoin price action.</li>
        <li><strong>Strike Price:</strong> The opening price of the 2.5-minute candle marks the Strike Price.</li>
        <li><strong>Predict Direction:</strong> Predict whether BTC will close HIGHER (UP ▲) or LOWER (DOWN ▼) than the Strike Price at expiry.</li>
        <li><strong>Fixed Payout:</strong> Correct predictions win 1.95x your bet instantly!</li>
      </ul>
    `
  },
  plinko: {
    name: 'Plinko 1000x',
    rtp: '99.00% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Provably Fair Plinko Rules</h4>
      <ul>
        <li><strong>Drop:</strong> Balls bounce through peg pyramid to bottom multiplier buckets.</li>
        <li><strong>Risk & Rows:</strong> Configure Low, Medium, or High Risk, and 8 to 16 rows.</li>
        <li><strong>Max Win:</strong> High Risk 16 Rows edges pay up to 1,000x!</li>
      </ul>
    `
  },
  crash: {
    name: 'Crash Rocket',
    rtp: '99.00% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Crash Rocket Rules</h4>
      <ul>
        <li><strong>Multiplier Curve:</strong> Multiplier starts at 1.00x and ascends exponentially towards the moon.</li>
        <li><strong>Cash Out:</strong> Cash out before the rocket crashes to lock in your multiplied winnings!</li>
        <li><strong>Auto Cashout:</strong> Set a target multiplier to automatically bank profit.</li>
      </ul>
    `
  },
  mines: {
    name: 'Mines Multiplier',
    rtp: '99.00% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Mines Rules</h4>
      <ul>
        <li><strong>Grid:</strong> 5x5 field with 25 tiles hiding Gems and hidden Mines (1 to 24 mines).</li>
        <li><strong>Cash Out:</strong> Reveal gems to increase payout multiplier. Cash out anytime before hitting a mine!</li>
      </ul>
    `
  },
  dice: {
    name: 'Classic Dice',
    rtp: '99.00% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Classic Dice Rules</h4>
      <ul>
        <li><strong>Roll Under / Over:</strong> Set target roll from 1.00 to 98.00. Multiplier scales dynamically up to 990x!</li>
      </ul>
    `
  },
  limbo: {
    name: 'Limbo Moon',
    rtp: '99.00% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Limbo Rules</h4>
      <ul>
        <li><strong>Target Multiplier:</strong> Enter any target multiplier up to 1,000,000x. If roll meets or exceeds target, you win!</li>
      </ul>
    `
  },
  hilo: {
    name: 'Hi-Lo Card Master',
    rtp: '98.50% RTP',
    category: 'originals',
    provider: 'RAIN ORIGINAL',
    rules: `
      <h4>Hi-Lo Rules</h4>
      <ul>
        <li><strong>Guess Higher or Lower:</strong> Guess whether next card is higher or lower. Stack streak multipliers and cash out anytime!</li>
      </ul>
    `
  }
};

class RainStakeApp {
  constructor() {
    this.activeTab = 'games';
    this.activeGameId = 'blackjack';
    this.activeCategory = 'all';
    this.currentBetAmount = 10.00;
    this.gameInstances = {};
    this.carouselIndex = 0;
    this.carouselTimer = null;
    this.selectedDepositAmount = 1000;
    this.currentCurrency = 'USDT';
    this.cryptoRates = {
      USDT: { symbol: '₮', name: 'USDT', rate: 1.0, decimals: 2 },
      BTC:  { symbol: '₿', name: 'BTC',  rate: 65000.0, decimals: 6 },
      ETH:  { symbol: 'Ξ', name: 'ETH',  rate: 3500.0, decimals: 5 },
      SOL:  { symbol: '◎', name: 'SOL',  rate: 150.0, decimals: 4 },
      LTC:  { symbol: 'Ł', name: 'LTC',  rate: 85.0, decimals: 4 }
    };

    this.init();
  }

  init() {
    this.bindDOMReferences();
    this.initSplashScreen();
    this.initHeroCarousel();
    this.initPosterVisuals();
    this.init3DPosterTilt();
    this.initCryptoCurrencySelector();
    this.bindEvents();
    this.bindModals();
    this.bindStateSubscription();
    this.startSimulatedLiveBets();
    this.syncProfileDOM();

    // Hash-based routing for direct game loading
    const initialHash = window.location.hash;
    const match = initialHash.match(/game=([a-z0-9_-]+)/);
    if (match) {
      this.openGame(match[1]);
    } else {
      this.showLobby();
    }

    window.addEventListener('hashchange', () => {
      const h = window.location.hash;
      const m = h.match(/game=([a-z0-9_-]+)/);
      if (m) {
        this.openGame(m[1]);
      } else if (h === '#lobby' || !h) {
        this.showLobby();
      }
    });
  }

  initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    const fill = document.getElementById('splashLoaderFill');
    const status = document.getElementById('splashStatusText');

    if (!splash || !fill) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 100) {
        fill.style.width = progress + '%';
        if (progress === 30) status.textContent = 'Verifying Provably Fair Entropy...';
        if (progress === 60) status.textContent = 'Loading Vegas & Rain Originals Engines...';
        if (progress === 85) status.textContent = 'Syncing Lightning Link Jackpots & Rain Pool...';
        if (progress >= 100) {
          status.textContent = 'Welcome to DruBet!';
          clearInterval(interval);
          setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => {
              splash.style.display = 'none';
            }, 450);
          }, 250);
        }
      }
    }, 45);
  }

  bindDOMReferences() {
    // Header
    this.balanceEl = document.getElementById('headerBalance');
    this.headerAvatar = document.getElementById('headerAvatar');
    this.headerUsername = document.getElementById('headerUsername');
    this.headerLvlBadge = document.getElementById('headerLvlBadge');
    this.soundToggleBtn = document.getElementById('headerSoundToggle');
    this.headerLogoBtn = document.getElementById('headerLogoBtn');
    this.headerDepositBtn = document.getElementById('headerDepositBtn');
    this.headerProfileBtn = document.getElementById('headerProfileBtn');
    this.headerChatBtn = document.getElementById('headerChatBtn');
    this.menuToggleBtn = document.getElementById('menuToggleBtn');

    // Navigation Tabs & View Panels
    this.navBtns = document.querySelectorAll('.nav-tab-btn');
    this.viewPanels = document.querySelectorAll('.view-panel');

    // Casino Lobby vs Arena
    this.casinoLobby = document.getElementById('casinoLobby');
    this.gameArena = document.getElementById('gameArena');
    this.backToLobbyBtn = document.getElementById('backToLobbyBtn');
    this.arenaGameTitle = document.getElementById('arenaGameTitle');
    this.arenaRtpBadge = document.getElementById('arenaRtpBadge');
    this.arenaRulesBtn = document.getElementById('arenaRulesBtn');
    this.arenaFairnessBtn = document.getElementById('arenaFairnessBtn');

    // Game Selector Strip & Category Filters
    this.categoryBtns = document.querySelectorAll('.cat-filter-btn');
    this.gameTabs = document.querySelectorAll('.game-select-tab');
    this.gameCards = document.querySelectorAll('.game-poster-card');
    this.lobbySearchInput = document.getElementById('lobbySearchInput');

    // Unified Betting Dock
    this.betInput = document.getElementById('unifiedBetInput');
    this.mainActionBtn = document.getElementById('mainActionBtn');
    this.subActionBtn = document.getElementById('subActionBtn');
    this.quickBetChips = document.querySelectorAll('.bet-modifier-btn');

    // Stats & History Tables
    this.liveBetsTable = document.getElementById('liveBetsTableBody');
    this.lobbyLiveBetsTable = document.getElementById('lobbyLiveBetsTableBody');
    this.userHistoryTable = document.getElementById('userHistoryTableBody');

    // Side Drawer
    this.sideDrawer = document.getElementById('sideDrawer');
    this.drawerBackdrop = document.getElementById('drawerBackdrop');
    this.closeDrawerBtn = document.getElementById('closeDrawerBtn');
  }

  initHeroCarousel() {
    const track = document.getElementById('heroCarouselTrack');
    const dots = document.querySelectorAll('#carouselDots .dot');
    const slides = document.querySelectorAll('.hero-slide');
    if (!track || slides.length === 0) return;

    const setSlide = (idx) => {
      this.carouselIndex = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${this.carouselIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === this.carouselIndex));
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        setSlide(idx);
        this.resetCarouselTimer();
      });
    });

    this.resetCarouselTimer = () => {
      if (this.carouselTimer) clearInterval(this.carouselTimer);
      this.carouselTimer = setInterval(() => {
        setSlide(this.carouselIndex + 1);
      }, 4500);
    };

    this.resetCarouselTimer();
  }

  bindEvents() {
    // Nav Bottom Tabs
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    // Logo click -> Back to Lobby
    if (this.headerLogoBtn) {
      this.headerLogoBtn.addEventListener('click', () => {
        this.switchTab('games');
        this.showLobby();
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Back to Lobby button inside Arena
    if (this.backToLobbyBtn) {
      this.backToLobbyBtn.addEventListener('click', () => {
        this.showLobby();
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Category Filter Buttons in Lobby
    this.categoryBtns.forEach(cBtn => {
      cBtn.addEventListener('click', () => {
        this.categoryBtns.forEach(b => b.classList.remove('active'));
        cBtn.classList.add('active');
        this.filterCategory(cBtn.dataset.cat);
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    // Lobby Search Input
    if (this.lobbySearchInput) {
      this.lobbySearchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        this.gameCards.forEach(card => {
          const title = card.querySelector('.poster-title')?.textContent.toLowerCase() || '';
          const tag = card.querySelector('.provider-tag')?.textContent.toLowerCase() || '';
          const match = title.includes(q) || tag.includes(q);
          card.style.display = match ? 'flex' : 'none';
        });
      });
    }

    // Game Selector Tabs in In-Game Strip
    this.gameTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const gameId = tab.dataset.game;
        this.switchGame(gameId);
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    // Sound Toggle
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        window.soundFX.enabled = !window.soundFX.enabled;
        this.soundToggleBtn.textContent = window.soundFX.enabled ? '🔊' : '🔇';
        this.soundToggleBtn.classList.toggle('muted', !window.soundFX.enabled);
        if (window.soundFX.enabled) window.soundFX.playClick();
      });
    }

    // Chat Shortcut in Header
    if (this.headerChatBtn) {
      this.headerChatBtn.addEventListener('click', () => {
        this.switchTab('chat');
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    // Bet Input
    if (this.betInput) {
      this.betInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value) || 0;
        this.currentBetAmount = Math.max(0.1, val);
        this.updateDockState();
      });
    }

    // Quick Bet Modifiers (Min, 1/2, 2x, Max, +10, +50)
    this.quickBetChips.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let bal = window.appState.balance;

        if (action === 'half') {
          this.currentBetAmount = Math.max(0.1, Math.floor((this.currentBetAmount / 2) * 100) / 100);
        } else if (action === 'double') {
          this.currentBetAmount = Math.min(bal, Math.floor((this.currentBetAmount * 2) * 100) / 100);
        } else if (action === 'max') {
          this.currentBetAmount = Math.max(0.1, Math.floor(bal * 100) / 100);
        } else if (action === 'min') {
          this.currentBetAmount = 1.00;
        } else if (action.startsWith('add_')) {
          const addVal = parseFloat(action.replace('add_', ''));
          this.currentBetAmount = Math.min(bal, this.currentBetAmount + addVal);
        }

        if (this.betInput) this.betInput.value = this.currentBetAmount.toFixed(2);
        this.updateDockState();
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    // Main Game Action Button
    if (this.mainActionBtn) {
      this.mainActionBtn.addEventListener('click', () => {
        this.handleMainAction();
      });
    }

    // Sub Game Action Button
    if (this.subActionBtn) {
      this.subActionBtn.addEventListener('click', () => {
        this.handleSubAction();
      });
    }

    // Rain Pool Tip Button in Ticker Strip
    const tickerTipBtn = document.getElementById('tickerTipBtn');
    if (tickerTipBtn) {
      tickerTipBtn.addEventListener('click', () => {
        this.openRainTipModal();
      });
    }

    // Make It Rain Button in Chat
    const makeRainBtn = document.getElementById('makeItRainBtn');
    if (makeRainBtn) {
      makeRainBtn.addEventListener('click', () => {
        this.openRainTipModal();
      });
    }

    // Chat Send Form
    const chatForm = document.getElementById('chatInputForm');
    const chatInput = document.getElementById('chatMessageInput');
    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (chatInput.value.trim() && window.rainSystem) {
          window.rainSystem.addUserMessage(chatInput.value.trim());
          chatInput.value = '';
        }
      });
    }

    // Rain Drop Claim Button
    const rainClaimBtn = document.getElementById('rainClaimBtn');
    if (rainClaimBtn) {
      rainClaimBtn.addEventListener('click', () => {
        if (window.rainSystem) window.rainSystem.claimRain();
      });
    }

    // Spin Lucky Wheel Button in Rewards
    const spinWheelBtn = document.getElementById('spinWheelBtn');
    if (spinWheelBtn) {
      spinWheelBtn.addEventListener('click', () => {
        if (window.rewardsManager?.isSpinning) return;
        spinWheelBtn.disabled = true;
        window.rewardsManager.spinWheel((prize) => {
          spinWheelBtn.disabled = false;
          this.showToast(`🎉 Lucky Wheel Won: ${prize.label} Free Chips!`);
        });
      });
    }

    // Claim Rakeback Button
    const claimRakebackBtn = document.getElementById('claimRakebackBtn');
    if (claimRakebackBtn) {
      claimRakebackBtn.addEventListener('click', () => {
        const amount = window.appState.claimRakeback();
        if (amount > 0) {
          this.showToast(`💰 Claimed $${amount.toFixed(2)} in VIP Rakeback!`);
        } else {
          this.showToast(`No rakeback available to claim yet! Place more bets.`);
        }
      });
    }

    // Side Drawer Open / Close
    if (this.menuToggleBtn) {
      this.menuToggleBtn.addEventListener('click', () => this.openSideDrawer());
    }
    if (this.closeDrawerBtn) {
      this.closeDrawerBtn.addEventListener('click', () => this.closeSideDrawer());
    }
    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => this.closeSideDrawer());
    }

    // Drawer Navigation Links
    document.querySelectorAll('.drawer-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const action = item.dataset.action;
        this.closeSideDrawer();

        if (action === 'lobby') {
          this.switchTab('games');
          this.showLobby();
        } else if (action === 'game') {
          this.openGame(item.dataset.game);
        } else if (action === 'streak') {
          this.openDailyBonusModal();
        } else if (action === 'rewards') {
          this.switchTab('rewards');
        } else if (action === 'chat') {
          this.switchTab('chat');
        } else if (action === 'refill') {
          this.openDepositModal();
        }
      });
    });

    // In-Game Rules Button
    if (this.arenaRulesBtn) {
      this.arenaRulesBtn.addEventListener('click', () => {
        this.openRulesModal(this.activeGameId);
      });
    }

    // In-Game Fairness Button -> Open Provably Fair Modal
    if (this.arenaFairnessBtn) {
      this.arenaFairnessBtn.addEventListener('click', () => {
        this.openProvablyFairModal();
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  bindModals() {
    // 1. Auth & Avatar Modal
    const authModal = document.getElementById('authModal');
    const closeAuthBtn = document.getElementById('closeAuthModalBtn');
    const lobbyAuthBtn = document.getElementById('lobbyAuthBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const appleAuthBtn = document.getElementById('appleAuthBtn');
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    const guestAuthBtn = document.getElementById('guestAuthBtn');
    const avatarOptions = document.querySelectorAll('.avatar-option');

    if (this.headerProfileBtn) this.headerProfileBtn.addEventListener('click', () => this.openAuthModal());
    if (lobbyAuthBtn) lobbyAuthBtn.addEventListener('click', () => this.openAuthModal());
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => this.closeModal('authModal'));

    // Avatar Selection
    let selectedAvatar = window.appState.user.avatar || '🦁';
    avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedAvatar = opt.dataset.avatar;
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => {
        const nickInput = document.getElementById('authNicknameInput');
        const nick = nickInput?.value.trim() || window.appState.user.username;
        window.appState.updateProfile(nick, selectedAvatar);
        this.closeModal('authModal');
        this.syncProfileDOM();
        this.showToast('✅ Profile Updated Successfully!');
      });
    }

    if (appleAuthBtn) {
      appleAuthBtn.addEventListener('click', () => {
        window.appState.data.user.authProvider = 'apple';
        window.appState.data.user.isLoggedIn = true;
        window.appState.saveState();
        this.closeModal('authModal');
        this.syncProfileDOM();
        this.showToast(' Signed in with Apple ID!');
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    if (googleAuthBtn) {
      googleAuthBtn.addEventListener('click', () => {
        window.appState.data.user.authProvider = 'google';
        window.appState.data.user.isLoggedIn = true;
        window.appState.saveState();
        this.closeModal('authModal');
        this.syncProfileDOM();
        this.showToast('🌐 Signed in with Google!');
        if (window.soundFX) window.soundFX.playClick();
      });
    }

    if (guestAuthBtn) {
      guestAuthBtn.addEventListener('click', () => {
        this.closeModal('authModal');
        this.showToast('👤 Playing in Guest Mode');
      });
    }

    // 2. Daily Streak Modal
    const dailyModal = document.getElementById('dailyBonusModal');
    const closeDailyBtn = document.getElementById('closeDailyBonusModalBtn');
    const lobbyStreakBtn = document.getElementById('lobbyStreakBtn');
    const rewardsDailyBtn = document.getElementById('rewardsDailyBonusBtn');
    const claimDailyBtn = document.getElementById('claimDailyRewardBtn');

    if (lobbyStreakBtn) lobbyStreakBtn.addEventListener('click', () => this.openDailyBonusModal());
    if (rewardsDailyBtn) rewardsDailyBtn.addEventListener('click', () => this.openDailyBonusModal());
    if (closeDailyBtn) closeDailyBtn.addEventListener('click', () => this.closeModal('dailyBonusModal'));

    if (claimDailyBtn) {
      claimDailyBtn.addEventListener('click', () => {
        const reward = window.appState.claimDailyBonus();
        if (reward) {
          this.closeModal('dailyBonusModal');
          this.showToast(`🎁 Claimed Day ${reward.day}: +$${reward.amount.toLocaleString()} Free Chips!`);
          if (window.soundFX) window.soundFX.playSlotWin(reward.amount);
        } else {
          this.showToast('⏳ Daily reward already claimed today! Check back tomorrow.');
        }
      });
    }

    // 3. Deposit / Refill Modal
    const depositModal = document.getElementById('depositModal');
    const closeDepositBtn = document.getElementById('closeDepositModalBtn');
    const confirmDepositBtn = document.getElementById('confirmDepositBtn');
    const depositChipBtns = document.querySelectorAll('.deposit-chip-btn');

    if (this.headerDepositBtn) this.headerDepositBtn.addEventListener('click', () => this.openDepositModal());
    if (closeDepositBtn) closeDepositBtn.addEventListener('click', () => this.closeModal('depositModal'));

    depositChipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        depositChipBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDepositAmount = parseFloat(btn.dataset.amount) || 1000;
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    if (confirmDepositBtn) {
      confirmDepositBtn.addEventListener('click', () => {
        const added = window.appState.claimFaucet(this.selectedDepositAmount);
        this.closeModal('depositModal');
        this.showToast(`💵 Free Refill: +$${added.toLocaleString()} Simulated Chips Added!`);
        if (window.soundFX) window.soundFX.playChip();
      });
    }

    // 4. Level Up Callback Registration
    window.appState.onLevelUpCallback = (newLevel, reward) => {
      this.showLevelUpModal(newLevel, reward);
    };

    const claimLevelUpBtn = document.getElementById('claimLevelUpRewardBtn');
    if (claimLevelUpBtn) {
      claimLevelUpBtn.addEventListener('click', () => {
        this.closeModal('levelUpModal');
      });
    }

    // 5. Game Rules Modal Close Button
    const closeRulesBtn = document.getElementById('closeRulesModalBtn');
    if (closeRulesBtn) {
      closeRulesBtn.addEventListener('click', () => this.closeModal('gameRulesModal'));
    }

    // 6. Provably Fair Modal
    const fairBadge = document.getElementById('headerFairBadge');
    const closePfBtn = document.getElementById('closeProvablyFairModalBtn');
    const pfRandomizeBtn = document.getElementById('pfRandomizeClientBtn');
    const pfSaveClientBtn = document.getElementById('pfSaveClientBtn');
    const pfCopyServerBtn = document.getElementById('pfCopyServerBtn');
    const pfRotateSeedBtn = document.getElementById('pfRotateSeedBtn');
    const pfRunVerifyBtn = document.getElementById('pfRunVerifyBtn');

    if (fairBadge) {
      fairBadge.addEventListener('click', () => this.openProvablyFairModal());
    }
    if (closePfBtn) {
      closePfBtn.addEventListener('click', () => this.closeModal('provablyFairModal'));
    }
    if (pfRandomizeBtn) {
      pfRandomizeBtn.addEventListener('click', () => {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randSeed = '';
        for (let i = 0; i < 16; i++) randSeed += chars[Math.floor(Math.random() * chars.length)];
        const input = document.getElementById('pfClientSeedInput');
        if (input) input.value = randSeed;
        if (window.appState?.data?.provablyFair) {
          window.appState.data.provablyFair.clientSeed = randSeed;
          window.appState.saveState();
        }
        this.showToast('🎲 Random Client Seed Generated!');
        if (window.soundFX) window.soundFX.playClick();
      });
    }
    if (pfSaveClientBtn) {
      pfSaveClientBtn.addEventListener('click', () => {
        const input = document.getElementById('pfClientSeedInput');
        const val = input ? input.value.trim() : '';
        if (val && window.appState?.data?.provablyFair) {
          window.appState.data.provablyFair.clientSeed = val;
          window.appState.saveState();
          this.showToast('✅ Client Seed Updated!');
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }
    if (pfCopyServerBtn) {
      pfCopyServerBtn.addEventListener('click', () => {
        const input = document.getElementById('pfServerSeedHash');
        if (input) {
          navigator.clipboard?.writeText(input.value).catch(() => {});
          this.showToast('📋 Server Seed Hash Copied!');
          if (window.soundFX) window.soundFX.playClick();
        }
      });
    }
    if (pfRotateSeedBtn) {
      pfRotateSeedBtn.addEventListener('click', () => {
        if (window.appState?.rotateProvablyFairSeeds) {
          const newPf = window.appState.rotateProvablyFairSeeds();
          const hashEl = document.getElementById('pfServerSeedHash');
          const nonceEl = document.getElementById('pfNonceInput');
          const nonceBadge = document.getElementById('pfNonceBadge');
          if (hashEl) hashEl.value = newPf.serverSeedHash;
          if (nonceEl) nonceEl.value = newPf.nonce;
          if (nonceBadge) nonceBadge.textContent = `Nonce #${newPf.nonce}`;
          this.showToast('🔄 New Cryptographic Seed Pair Activated!');
          if (window.soundFX) window.soundFX.playChip();
        }
      });
    }
    if (pfRunVerifyBtn) {
      pfRunVerifyBtn.addEventListener('click', () => {
        this.runProvablyFairVerification();
      });
    }
  }

  showLobby() {
    if (this.casinoLobby) this.casinoLobby.style.display = 'block';
    if (this.gameArena) this.gameArena.style.display = 'none';
    const dock = document.getElementById('unifiedBetDock');
    if (dock) dock.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openGame(gameId) {
    this.activeGameId = gameId;
    this.switchTab('games');

    if (this.casinoLobby) this.casinoLobby.style.display = 'none';
    if (this.gameArena) this.gameArena.style.display = 'block';
    const dock = document.getElementById('unifiedBetDock');
    if (dock) dock.style.display = 'flex';

    // Update in-game header
    const meta = GAME_METADATA[gameId] || { name: gameId.toUpperCase(), rtp: '98.50% RTP' };
    if (this.arenaGameTitle) this.arenaGameTitle.textContent = meta.name;
    if (this.arenaRtpBadge) this.arenaRtpBadge.textContent = meta.rtp;

    // Update active tab in in-game switcher strip
    this.gameTabs.forEach(t => t.classList.toggle('active', t.dataset.game === gameId));

    // Activate Stage
    const stages = document.querySelectorAll('.game-stage');
    stages.forEach(s => s.classList.toggle('active', s.id === `stage-${gameId}`));

    // Initialize Game Engine
    this.initGame(gameId);
    this.updateDockState();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchGame(gameId) {
    this.openGame(gameId);
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    this.viewPanels.forEach(panel => panel.classList.toggle('active', panel.id === `view-${tabName}`));

    const dock = document.getElementById('unifiedBetDock');
    if (dock) {
      if (tabName === 'games' && this.gameArena && this.gameArena.style.display === 'block') {
        dock.style.display = 'flex';
      } else {
        dock.style.display = 'none';
      }
    }

    if (tabName === 'rewards') {
      setTimeout(() => window.rewardsManager?.initWheel(), 50);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  filterCategory(category) {
    this.activeCategory = category;
    this.gameCards.forEach(card => {
      const cat = card.dataset.category;
      if (category === 'all' || cat === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  initGame(gameId) {
    if (gameId === 'lightning') {
      if (!this.gameInstances.lightning) {
        this.gameInstances.lightning = new window.LightningLinkGame('lightningContainer', () => this.updateDockState());
      }
    } else if (gameId === 'olympus') {
      if (!this.gameInstances.olympus) {
        this.gameInstances.olympus = new window.GatesOfOlympusGame('olympusContainer', () => this.updateDockState());
      }
    } else if (gameId === 'plinko') {
      if (!this.gameInstances.plinko) {
        this.gameInstances.plinko = new window.PlinkoGame('plinkoContainer');
        const rowSelect = document.getElementById('plinkoRowsSelect');
        const riskSelect = document.getElementById('plinkoRiskSelect');
        if (rowSelect) rowSelect.addEventListener('change', (e) => this.gameInstances.plinko.setRows(e.target.value));
        if (riskSelect) riskSelect.addEventListener('change', (e) => this.gameInstances.plinko.setRisk(e.target.value));
      }
    } else if (gameId === 'crash') {
      if (!this.gameInstances.crash) {
        this.gameInstances.crash = new window.CrashGame('crashContainer', () => this.updateDockState());
      }
    } else if (gameId === 'blackjack') {
      if (!this.gameInstances.blackjack) {
        this.gameInstances.blackjack = new window.BlackjackGame('blackjackContainer', () => this.updateDockState());
      }
    } else if (gameId === 'poker') {
      if (!this.gameInstances.poker) {
        this.gameInstances.poker = new window.PokerGame('pokerContainer', () => this.updateDockState());
      }
    } else if (gameId === 'roulette') {
      if (!this.gameInstances.roulette) {
        this.gameInstances.roulette = new window.RouletteGame('rouletteContainer', () => this.updateDockState());
      }
    } else if (gameId === 'baccarat') {
      if (!this.gameInstances.baccarat) {
        this.gameInstances.baccarat = new window.BaccaratGame('baccaratContainer', () => this.updateDockState());
      }
    } else if (gameId === 'mines') {
      if (!this.gameInstances.mines) {
        this.gameInstances.mines = new window.MinesGame('minesContainer', () => this.updateDockState());
        const minesCountSelect = document.getElementById('minesCountSelect');
        if (minesCountSelect) {
          minesCountSelect.addEventListener('change', (e) => this.gameInstances.mines.setMinesCount(e.target.value));
        }
      }
    } else if (gameId === 'dice') {
      if (!this.gameInstances.dice) {
        this.gameInstances.dice = new window.DiceGame('diceContainer', () => this.updateDockState());
      }
    } else if (gameId === 'limbo') {
      if (!this.gameInstances.limbo) {
        this.gameInstances.limbo = new window.LimboGame('limboContainer', () => this.updateDockState());
      }
    } else if (gameId === 'hilo') {
      if (!this.gameInstances.hilo) {
        this.gameInstances.hilo = new window.HiLoGame('hiloContainer', () => this.updateDockState());
      }
    } else if (gameId === 'slots') {
      if (!this.gameInstances.slots) {
        this.gameInstances.slots = new window.SlotsGame('slotsContainer', () => this.updateDockState());
      }
    } else if (gameId === 'cases') {
      if (!this.gameInstances.cases) {
        this.gameInstances.cases = new window.CasesGame('casesContainer', () => this.updateDockState());
      }
    } else if (gameId === 'sweetbonanza') {
      if (!this.gameInstances.sweetbonanza) {
        this.gameInstances.sweetbonanza = new window.SweetBonanzaGame('sweetbonanzaContainer', () => this.updateDockState());
      }
    } else if (gameId === 'sugarrush') {
      if (!this.gameInstances.sugarrush) {
        this.gameInstances.sugarrush = new window.SugarRushGame('sugarrushContainer', () => this.updateDockState());
      }
    } else if (gameId === 'wanted') {
      if (!this.gameInstances.wanted) {
        this.gameInstances.wanted = new window.WantedDeadOrAWildGame('wantedContainer', () => this.updateDockState());
      }
    } else if (gameId === 'bigbass') {
      if (!this.gameInstances.bigbass) {
        this.gameInstances.bigbass = new window.BigBassSplashGame('bigbassContainer', () => this.updateDockState());
      }
    } else if (gameId === 'doghouse') {
      if (!this.gameInstances.doghouse) {
        this.gameInstances.doghouse = new window.DogHouseMegawaysGame('doghouseContainer', () => this.updateDockState());
      }
    } else if (gameId === 'bookofdead') {
      if (!this.gameInstances.bookofdead) {
        this.gameInstances.bookofdead = new window.BookOfDeadGame('bookofdeadContainer', () => this.updateDockState());
      }
    } else if (gameId === 'razorshark') {
      if (!this.gameInstances.razorshark) {
        this.gameInstances.razorshark = new window.RazorSharkGame('razorsharkContainer', () => this.updateDockState());
      }
    } else if (gameId === 'sanquentin') {
      if (!this.gameInstances.sanquentin) {
        this.gameInstances.sanquentin = new window.SanQuentinGame('sanquentinContainer', () => this.updateDockState());
      }
    } else if (gameId === 'chicken') {
      if (!this.gameInstances.chicken) {
        this.gameInstances.chicken = new window.ChickenRoadGame('chickenContainer', () => this.updateDockState());
      }
    } else if (gameId === 'btcupdown') {
      if (!this.gameInstances.btcupdown) {
        this.gameInstances.btcupdown = new window.BtcUpDownGame('btcupdownContainer', () => this.updateDockState());
      }
    }
  }

  updateDockState() {
    if (!this.mainActionBtn) return;
    const game = this.activeGameId;

    if (game === 'lightning') {
      this.subActionBtn.style.display = 'none';
      const ll = this.gameInstances.lightning;
      if (ll?.inHoldAndSpin) {
        this.mainActionBtn.textContent = `HOLD & SPIN (RESPIN ${ll.holdAndSpinRespins})`;
        this.mainActionBtn.className = 'dock-main-btn btn-gold pulse-btn';
        this.mainActionBtn.disabled = ll.isSpinning;
      } else {
        this.mainActionBtn.textContent = ll?.isSpinning ? 'SPINNING...' : 'SPIN LIGHTNING';
        this.mainActionBtn.className = 'dock-main-btn btn-gold';
        this.mainActionBtn.disabled = ll?.isSpinning;
      }
    } else if (game === 'olympus') {
      this.subActionBtn.style.display = 'none';
      const oly = this.gameInstances.olympus;
      if (oly?.inFreeSpins) {
        this.mainActionBtn.textContent = `FREE SPINS (${oly.freeSpinsLeft})`;
        this.mainActionBtn.className = 'dock-main-btn btn-purple pulse-btn';
        this.mainActionBtn.disabled = true;
      } else {
        this.mainActionBtn.textContent = oly?.isSpinning ? 'TUMBLING...' : 'SPIN RAIN GOD';
        this.mainActionBtn.className = 'dock-main-btn btn-cyan';
        this.mainActionBtn.disabled = oly?.isSpinning;
      }
    } else if (['sweetbonanza', 'sugarrush', 'wanted', 'bigbass', 'doghouse', 'bookofdead', 'razorshark', 'sanquentin'].includes(game)) {
      this.subActionBtn.style.display = 'none';
      const slotInst = this.gameInstances[game];
      if (slotInst?.inFreeSpins) {
        this.mainActionBtn.textContent = `FREE SPINS (${slotInst.freeSpinsLeft})`;
        this.mainActionBtn.className = 'dock-main-btn btn-purple pulse-btn';
        this.mainActionBtn.disabled = true;
      } else {
        const slotMeta = GAME_METADATA[game];
        this.mainActionBtn.textContent = slotInst?.isSpinning ? 'SPINNING...' : `SPIN ${slotMeta?.name?.toUpperCase() || 'REELS'}`;
        this.mainActionBtn.className = 'dock-main-btn btn-gold';
        this.mainActionBtn.disabled = slotInst?.isSpinning;
      }
    } else if (game === 'plinko') {
      this.mainActionBtn.textContent = 'DROP BALL';
      this.mainActionBtn.className = 'dock-main-btn btn-green';
      this.mainActionBtn.disabled = false;
      this.subActionBtn.style.display = 'block';
      this.subActionBtn.textContent = this.gameInstances.plinko?.isAutoDropping ? 'STOP AUTO' : 'AUTO DROP';
      this.subActionBtn.className = this.gameInstances.plinko?.isAutoDropping ? 'dock-sub-btn btn-red' : 'dock-sub-btn';
    } else if (game === 'crash') {
      this.subActionBtn.style.display = 'none';
      const crash = this.gameInstances.crash;
      if (!crash) return;

      if (crash.state === 'FLYING' && crash.userBet && !crash.userBet.cashedOut) {
        const cashoutVal = (crash.userBet.amount * crash.currentMultiplier).toFixed(2);
        this.mainActionBtn.textContent = `CASH OUT $${cashoutVal}`;
        this.mainActionBtn.className = 'dock-main-btn btn-gold pulse-btn';
        this.mainActionBtn.disabled = false;
      } else if (crash.state === 'PREPARING') {
        if (crash.userBet) {
          this.mainActionBtn.textContent = 'BET PLACED (WAIT)';
          this.mainActionBtn.className = 'dock-main-btn btn-grey';
          this.mainActionBtn.disabled = true;
        } else {
          this.mainActionBtn.textContent = 'PLACE BET';
          this.mainActionBtn.className = 'dock-main-btn btn-green';
          this.mainActionBtn.disabled = false;
        }
      } else {
        this.mainActionBtn.textContent = 'WAITING ROUND...';
        this.mainActionBtn.className = 'dock-main-btn btn-grey';
        this.mainActionBtn.disabled = true;
      }
    } else if (game === 'blackjack') {
      this.subActionBtn.style.display = 'none';
      const bj = this.gameInstances.blackjack;
      if (bj && (bj.state === 'PLAYER_TURN' || bj.state === 'DEALING' || bj.state === 'DEALER_TURN')) {
        this.mainActionBtn.textContent = 'IN HAND (USE FELT ACTIONS)';
        this.mainActionBtn.className = 'dock-main-btn btn-grey';
        this.mainActionBtn.disabled = true;
      } else {
        this.mainActionBtn.textContent = 'DEAL BLACKJACK';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
        this.mainActionBtn.disabled = false;
      }
    } else if (game === 'poker') {
      this.subActionBtn.style.display = 'none';
      const poker = this.gameInstances.poker;
      if (poker && (poker.state === 'FLOP_DEALT' || poker.state === 'DEALING')) {
        this.mainActionBtn.textContent = 'DECIDE: CALL OR FOLD';
        this.mainActionBtn.className = 'dock-main-btn btn-gold';
        this.mainActionBtn.disabled = true;
      } else {
        this.mainActionBtn.textContent = 'DEAL TEXAS HOLD\'EM';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
        this.mainActionBtn.disabled = false;
      }
    } else if (game === 'roulette') {
      this.subActionBtn.style.display = 'none';
      const r = this.gameInstances.roulette;
      this.mainActionBtn.textContent = r?.isSpinning ? 'SPINNING WHEEL...' : 'SPIN ROULETTE';
      this.mainActionBtn.className = 'dock-main-btn btn-gold';
      this.mainActionBtn.disabled = r?.isSpinning;
    } else if (game === 'baccarat') {
      this.subActionBtn.style.display = 'none';
      const bac = this.gameInstances.baccarat;
      this.mainActionBtn.textContent = bac?.isDealing ? 'DEALING BACCARAT...' : 'DEAL BACCARAT';
      this.mainActionBtn.className = 'dock-main-btn btn-green';
      this.mainActionBtn.disabled = bac?.isDealing;
    } else if (game === 'mines') {
      this.subActionBtn.style.display = 'none';
      const mines = this.gameInstances.mines;
      if (mines && mines.isPlaying) {
        if (mines.revealedCount > 0) {
          const cashoutVal = (this.currentBetAmount * mines.calculateMultiplier(mines.revealedCount)).toFixed(2);
          this.mainActionBtn.textContent = `CASH OUT $${cashoutVal}`;
          this.mainActionBtn.className = 'dock-main-btn btn-gold pulse-btn';
        } else {
          this.mainActionBtn.textContent = 'PICK A TILE 💎';
          this.mainActionBtn.className = 'dock-main-btn btn-grey';
        }
      } else {
        this.mainActionBtn.textContent = 'START MINES';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
      }
      this.mainActionBtn.disabled = false;
    } else if (game === 'dice') {
      this.subActionBtn.style.display = 'none';
      const dice = this.gameInstances.dice;
      this.mainActionBtn.textContent = dice?.isRolling ? 'ROLLING...' : 'ROLL DICE';
      this.mainActionBtn.className = 'dock-main-btn btn-green';
      this.mainActionBtn.disabled = dice?.isRolling;
    } else if (game === 'limbo') {
      this.subActionBtn.style.display = 'none';
      const limbo = this.gameInstances.limbo;
      this.mainActionBtn.textContent = limbo?.isRolling ? 'ROLLING...' : 'ROLL LIMBO';
      this.mainActionBtn.className = 'dock-main-btn btn-green';
      this.mainActionBtn.disabled = limbo?.isRolling;
    } else if (game === 'hilo') {
      this.subActionBtn.style.display = 'none';
      const hilo = this.gameInstances.hilo;
      if (hilo && hilo.isPlaying) {
        if (hilo.currentMultiplier > 1.0) {
          const cashoutVal = (this.currentBetAmount * hilo.currentMultiplier).toFixed(2);
          this.mainActionBtn.textContent = `CASH OUT $${cashoutVal}`;
          this.mainActionBtn.className = 'dock-main-btn btn-gold pulse-btn';
        } else {
          this.mainActionBtn.textContent = 'GUESS HIGHER / LOWER';
          this.mainActionBtn.className = 'dock-main-btn btn-grey';
        }
      } else {
        this.mainActionBtn.textContent = 'START HI-LO';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
      }
      this.mainActionBtn.disabled = false;
    } else if (game === 'slots') {
      this.subActionBtn.style.display = 'none';
      const slots = this.gameInstances.slots;
      if (slots?.freeSpinsLeft > 0) {
        this.mainActionBtn.textContent = `FREE SPINS (${slots.freeSpinsLeft})`;
        this.mainActionBtn.className = 'dock-main-btn btn-purple';
        this.mainActionBtn.disabled = true;
      } else {
        this.mainActionBtn.textContent = slots?.isSpinning ? 'SPINNING...' : 'SPIN REELS';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
        this.mainActionBtn.disabled = slots?.isSpinning;
      }
    } else if (game === 'cases') {
      this.subActionBtn.style.display = 'none';
      const cases = this.gameInstances.cases;
      const caseCost = window.MYSTERY_CASES ? window.MYSTERY_CASES[cases?.activeCaseKey || 'starter'].cost : 25;
      this.mainActionBtn.textContent = cases?.isUnboxing ? 'UNBOXING...' : `OPEN CASE ($${caseCost})`;
      this.mainActionBtn.className = 'dock-main-btn btn-gold';
      this.mainActionBtn.disabled = cases?.isUnboxing;
    } else if (game === 'chicken') {
      this.subActionBtn.style.display = 'none';
      const chk = this.gameInstances.chicken;
      if (chk && chk.isPlaying) {
        if (chk.currentStep > 0) {
          const mult = chk.multipliers[chk.currentStep - 1];
          const val = (this.currentBetAmount * mult).toFixed(2);
          this.mainActionBtn.textContent = `CASH OUT $${val} (${mult}×)`;
          this.mainActionBtn.className = 'dock-main-btn btn-gold pulse-btn';
        } else {
          this.mainActionBtn.textContent = 'CROSS NEXT LANE 👟';
          this.mainActionBtn.className = 'dock-main-btn btn-cyan';
        }
      } else {
        this.mainActionBtn.textContent = 'START CHICKEN ROAD';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
      }
      this.mainActionBtn.disabled = false;
    } else if (game === 'btcupdown') {
      const btc = this.gameInstances.btcupdown;
      if (btc && btc.betPlacedInCurrentRound) {
        this.subActionBtn.style.display = 'none';
        this.mainActionBtn.textContent = `ACTIVE: ${btc.userPrediction} ($${btc.userBetAmount.toFixed(2)})`;
        this.mainActionBtn.className = 'dock-main-btn btn-grey';
        this.mainActionBtn.disabled = true;
      } else {
        this.subActionBtn.style.display = 'block';
        this.subActionBtn.textContent = 'DOWN ▼';
        this.subActionBtn.className = 'dock-sub-btn btn-red';
        this.mainActionBtn.textContent = 'PREDICT UP ▲ (1.95×)';
        this.mainActionBtn.className = 'dock-main-btn btn-green';
        this.mainActionBtn.disabled = false;
      }
    }
  }

  handleMainAction() {
    const game = this.activeGameId;
    const bet = this.currentBetAmount;

    if (game === 'lightning') {
      this.gameInstances.lightning?.spin();
    } else if (game === 'olympus') {
      this.gameInstances.olympus?.spin();
    } else if (['sweetbonanza', 'sugarrush', 'wanted', 'bigbass', 'doghouse', 'bookofdead', 'razorshark', 'sanquentin'].includes(game)) {
      this.gameInstances[game]?.spin();
    } else if (game === 'plinko') {
      this.gameInstances.plinko.dropBall(bet);
    } else if (game === 'crash') {
      const crash = this.gameInstances.crash;
      if (crash.state === 'FLYING' && crash.userBet && !crash.userBet.cashedOut) {
        crash.cashOut();
      } else if (crash.state === 'PREPARING') {
        const autoCashoutVal = parseFloat(document.getElementById('crashAutoCashoutInput')?.value) || 0;
        crash.placeBet(bet, autoCashoutVal);
      }
    } else if (game === 'blackjack') {
      this.gameInstances.blackjack.startRound(bet);
    } else if (game === 'poker') {
      this.gameInstances.poker.startRound(bet);
    } else if (game === 'roulette') {
      this.gameInstances.roulette.spin();
    } else if (game === 'baccarat') {
      this.gameInstances.baccarat.deal(bet);
    } else if (game === 'mines') {
      const mines = this.gameInstances.mines;
      if (mines.isPlaying) {
        mines.cashOut();
      } else {
        mines.startGame(bet);
      }
    } else if (game === 'dice') {
      this.gameInstances.dice.roll(bet);
    } else if (game === 'limbo') {
      this.gameInstances.limbo.roll(bet);
    } else if (game === 'hilo') {
      const hilo = this.gameInstances.hilo;
      if (hilo.isPlaying) {
        hilo.cashOut();
      } else {
        hilo.startGame(bet);
      }
    } else if (game === 'slots') {
      this.gameInstances.slots.spin(bet);
    } else if (game === 'cases') {
      this.gameInstances.cases.openCase();
    } else if (game === 'chicken') {
      const chk = this.gameInstances.chicken;
      if (chk) {
        if (chk.isPlaying) {
          if (chk.currentStep > 0) {
            chk.cashOut();
          } else {
            chk.step();
          }
        } else {
          chk.startGame(bet);
        }
      }
    } else if (game === 'btcupdown') {
      const btc = this.gameInstances.btcupdown;
      if (btc && !btc.betPlacedInCurrentRound) {
        btc.placePrediction('UP');
      }
    }

    this.updateDockState();
  }

  handleSubAction() {
    if (this.activeGameId === 'plinko') {
      this.gameInstances.plinko.toggleAutoDrop(this.currentBetAmount, (isAuto) => {
        this.updateDockState();
      });
    } else if (this.activeGameId === 'btcupdown') {
      const btc = this.gameInstances.btcupdown;
      if (btc && !btc.betPlacedInCurrentRound) {
        btc.placePrediction('DOWN');
      }
    }
  }

  syncProfileDOM() {
    const user = window.appState.user;
    const lvlInfo = window.appState.levelInfo;
    const vip = window.appState.vip;

    // Header Profile Pill
    if (this.headerAvatar) this.headerAvatar.textContent = user.avatar || '🦁';
    if (this.headerUsername) this.headerUsername.textContent = user.username || 'RainRoller';
    if (this.headerLvlBadge) this.headerLvlBadge.textContent = `LVL ${lvlInfo.level}`;

    // Lobby Player Card
    const lobbyAvatar = document.getElementById('lobbyAvatar');
    const lobbyUsername = document.getElementById('lobbyUsername');
    const lobbyVipTag = document.getElementById('lobbyVipTag');
    const lobbyLevelBadge = document.getElementById('lobbyLevelBadge');
    const lobbyXpCount = document.getElementById('lobbyXpCount');
    const lobbyXpFill = document.getElementById('lobbyXpFill');

    if (lobbyAvatar) lobbyAvatar.textContent = user.avatar || '🦁';
    if (lobbyUsername) lobbyUsername.textContent = user.username || 'RainRoller';
    if (lobbyVipTag) {
      lobbyVipTag.textContent = vip.current.name.toUpperCase();
      lobbyVipTag.style.color = vip.current.badgeColor;
      lobbyVipTag.style.borderColor = vip.current.badgeColor;
    }
    if (lobbyLevelBadge) lobbyLevelBadge.textContent = `Level ${lvlInfo.level}`;
    if (lobbyXpCount) lobbyXpCount.textContent = `${lvlInfo.xpInLevel} / ${lvlInfo.xpRequired} XP (+50 XP/Win)`;
    if (lobbyXpFill) lobbyXpFill.style.width = `${lvlInfo.progress}%`;

    // Drawer Avatar
    const drawerAvatar = document.getElementById('drawerAvatar');
    const drawerUsername = document.getElementById('drawerUsername');
    const drawerLevel = document.getElementById('drawerLevel');
    if (drawerAvatar) drawerAvatar.textContent = user.avatar || '🦁';
    if (drawerUsername) drawerUsername.textContent = user.username || 'RainRoller';
    if (drawerLevel) drawerLevel.textContent = `Level ${lvlInfo.level} • ${vip.current.name} • (+50 XP/Win)`;
  }

  notifyXPWin(amount = 50) {
    const floater = document.createElement('div');
    floater.className = 'xp-win-floater';
    floater.innerHTML = `<span>⚡ +${amount} XP</span> <small>WIN!</small>`;
    document.body.appendChild(floater);
    setTimeout(() => {
      if (floater.parentNode) floater.remove();
    }, 1800);
  }

  bindStateSubscription() {
    window.appState.subscribe(state => {
      // Balance with multi-crypto support
      if (this.balanceEl) {
        this.balanceEl.textContent = this.formatBalance(state.balance);
      }

      this.syncProfileDOM();

      // Update VIP Progress in Rewards view
      const vip = window.appState.vip;
      const vipTitle = document.getElementById('vipCurrentTierName');
      const vipProgressFill = document.getElementById('vipProgressBarFill');
      const vipProgressText = document.getElementById('vipProgressPercent');
      const rakebackAmountDisplay = document.getElementById('claimableRakebackDisplay');

      if (vipTitle) vipTitle.textContent = `${vip.current.name} (Tier ${vip.index + 1})`;
      if (vipProgressFill) vipProgressFill.style.width = `${vip.progress}%`;
      if (vipProgressText) vipProgressText.textContent = `${Math.floor(vip.progress)}% to ${vip.next ? vip.next.name : 'MAX'}`;
      if (rakebackAmountDisplay) rakebackAmountDisplay.textContent = `$${state.rakebackClaimable.toFixed(2)}`;

      // Update Stats tab
      this.updateStatsDOM(state);

      // Update User History Table
      this.updateUserHistoryDOM(state.history);

      this.updateDockState();
    });
  }

  updateStatsDOM(state) {
    const s = state.stats;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('statTotalWagered', `$${s.totalWagered.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('statTotalWon', `$${s.totalWon.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('statNetProfit', `${s.netProfit >= 0 ? '+' : ''}$${s.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('statTotalBets', s.totalBets.toLocaleString());
    setText('statBiggestWin', `$${s.biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('statBiggestMult', `${s.biggestMultiplier.toFixed(2)}x`);

    const netProfitEl = document.getElementById('statNetProfit');
    if (netProfitEl) {
      netProfitEl.className = s.netProfit >= 0 ? 'text-green' : 'text-red';
    }
  }

  updateUserHistoryDOM(history) {
    if (!this.userHistoryTable) return;
    if (history.length === 0) {
      this.userHistoryTable.innerHTML = `<tr><td colspan="5" class="table-empty">No bets recorded yet. Spin or drop to play!</td></tr>`;
      return;
    }

    this.userHistoryTable.innerHTML = history.slice(0, 15).map(h => `
      <tr>
        <td><span class="game-tag tag-${h.game.toLowerCase().replace(/[^a-z]/g, '')}">${h.game}</span></td>
        <td>$${h.bet.toFixed(2)}</td>
        <td><span class="${h.multiplier >= 2 ? 'text-green' : (h.multiplier > 0 ? 'text-cyan' : 'text-red')}">${h.multiplier.toFixed(2)}x</span></td>
        <td class="${h.profit > 0 ? 'text-green' : 'text-muted'}">${h.payout > 0 ? '+$' + h.payout.toFixed(2) : '$0.00'}</td>
        <td class="text-subtle">${h.time}</td>
      </tr>
    `).join('');
  }

  startSimulatedLiveBets() {
    const games = ['Lightning Link', 'Gates of Olympus', 'Blackjack 3:2', 'Texas Hold\'em', 'Plinko 1000x', 'Crash Rocket', 'European Roulette', 'Mines', 'Baccarat'];
    const users = ['Viper99', 'SatoshiDrop', 'NeonAce', 'DiamondPanda', 'CyberWolf', 'MoonBettor', 'AlphaRain', 'HoldemKing', 'RoulettePro', 'LuckyZeus', 'OrbMaster'];

    setInterval(() => {
      const game = games[Math.floor(Math.random() * games.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const bet = Math.floor(5 + Math.random() * 250);
      const won = Math.random() < 0.49;
      const mult = won ? Math.floor((1.1 + Math.random() * 7.5) * 100) / 100 : 0.00;
      const payout = won ? bet * mult : 0;

      const rowHTML = `
        <td><span class="game-tag tag-${game.toLowerCase().replace(/[^a-z]/g, '')}">${game}</span></td>
        <td class="text-white">${user}</td>
        <td>$${bet.toFixed(2)}</td>
        <td><span class="${mult >= 2 ? 'text-green' : (mult > 0 ? 'text-cyan' : 'text-red')}">${mult.toFixed(2)}x</span></td>
        <td class="${won ? 'text-green font-bold' : 'text-muted'}">${won ? '+$' + payout.toFixed(2) : '$0.00'}</td>
      `;

      // Update Arena live bets table
      if (this.liveBetsTable) {
        const r1 = document.createElement('tr');
        r1.className = 'live-bet-anim';
        r1.innerHTML = rowHTML;
        this.liveBetsTable.prepend(r1);
        if (this.liveBetsTable.children.length > 10) this.liveBetsTable.lastElementChild.remove();
      }

      // Update Lobby live bets table
      if (this.lobbyLiveBetsTable) {
        const r2 = document.createElement('tr');
        r2.className = 'live-bet-anim';
        r2.innerHTML = rowHTML;
        this.lobbyLiveBetsTable.prepend(r2);
        if (this.lobbyLiveBetsTable.children.length > 8) this.lobbyLiveBetsTable.lastElementChild.remove();
      }
    }, 2400);
  }

  openSideDrawer() {
    if (this.sideDrawer) this.sideDrawer.classList.add('open');
    if (this.drawerBackdrop) this.drawerBackdrop.classList.add('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  closeSideDrawer() {
    if (this.sideDrawer) this.sideDrawer.classList.remove('open');
    if (this.drawerBackdrop) this.drawerBackdrop.classList.remove('visible');
  }

  openAuthModal() {
    const modal = document.getElementById('authModal');
    const nickInput = document.getElementById('authNicknameInput');
    if (nickInput) nickInput.value = window.appState.user.username;

    const avatarOpts = document.querySelectorAll('.avatar-option');
    avatarOpts.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.avatar === window.appState.user.avatar);
    });

    if (modal) modal.classList.add('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  openDailyBonusModal() {
    const modal = document.getElementById('dailyBonusModal');
    const grid = document.getElementById('dailyStreakGrid');
    const claimBtn = document.getElementById('claimDailyRewardBtn');
    const streak = window.appState.dailyBonus.streak;
    const status = window.appState.dailyBonusStatus;

    if (grid && window.DAILY_STREAK_REWARDS) {
      grid.innerHTML = window.DAILY_STREAK_REWARDS.map(r => {
        const isClaimed = r.day < streak;
        const isActive = r.day === streak;
        return `
          <div class="streak-day-cell ${isClaimed ? 'cell-claimed' : ''} ${isActive ? 'cell-active' : ''} ${r.day === 7 ? 'cell-jackpot' : ''}">
            <span class="cell-day">DAY ${r.day}</span>
            <span class="cell-icon">${r.day === 7 ? '🏆' : (r.day >= 4 ? '💎' : '🪙')}</span>
            <span class="cell-amount">$${r.reward.toLocaleString()}</span>
            <span class="cell-status">${isClaimed ? 'CLAIMED' : (isActive ? 'TODAY' : 'LOCKED')}</span>
          </div>
        `;
      }).join('');
    }

    if (claimBtn) {
      if (status.canClaim) {
        claimBtn.disabled = false;
        claimBtn.textContent = `CLAIM DAY ${streak} BONUS ($${status.currentDayReward.reward.toLocaleString()})`;
        claimBtn.className = 'modal-action-btn btn-green pulse-btn';
      } else {
        claimBtn.disabled = true;
        claimBtn.textContent = `CLAIMED TODAY (NEXT IN ${status.timeLeft || '12h'})`;
        claimBtn.className = 'modal-action-btn btn-grey';
      }
    }

    if (modal) modal.classList.add('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  openDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) modal.classList.add('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  showLevelUpModal(level, reward) {
    const modal = document.getElementById('levelUpModal');
    const lvlNum = document.getElementById('levelUpNumDisplay');
    const rewardVal = document.getElementById('levelUpRewardDisplay');

    if (lvlNum) lvlNum.textContent = `LEVEL ${level}`;
    if (rewardVal) rewardVal.textContent = `+$${reward.toLocaleString()} Free Chips`;

    if (modal) modal.classList.add('visible');
    if (window.soundFX) window.soundFX.playLevelUp();
  }

  openRulesModal(gameId) {
    const modal = document.getElementById('gameRulesModal');
    const title = document.getElementById('rulesModalTitle');
    const body = document.getElementById('rulesModalBody');
    const meta = GAME_METADATA[gameId] || { name: gameId.toUpperCase(), rules: '<p>Standard casino game rules apply.</p>' };

    if (title) title.textContent = `${meta.name} • Rules & Paytable`;
    if (body) body.innerHTML = meta.rules;

    if (modal) modal.classList.add('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  openRainTipModal() {
    const amountStr = prompt('Enter simulated chips amount to Tip into the Community Rain Pool:', '500');
    const num = parseFloat(amountStr);
    if (num && num > 0) {
      if (window.rainSystem && window.rainSystem.makeItRain(num)) {
        this.showToast(`🌧️ You tipped $${num.toLocaleString()} into the Community Rain Pool! Chat is celebrating!`);
      } else {
        this.showToast('❌ Insufficient balance to tip rain!');
      }
    }
  }

  formatBalance(usdBalance) {
    const info = this.cryptoRates[this.currentCurrency] || this.cryptoRates.USDT;
    if (this.currentCurrency === 'USDT') {
      return `$${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const converted = usdBalance / info.rate;
    return `${info.symbol} ${converted.toFixed(info.decimals)}`;
  }

  initPosterVisuals() {
    const containers = document.querySelectorAll('.poster-art-container');
    containers.forEach(container => {
      const posterId = container.dataset.poster;
      if (posterId && window.CasinoSymbols?.renderPosterVisual) {
        container.innerHTML = window.CasinoSymbols.renderPosterVisual(posterId);
      }
    });
  }

  init3DPosterTilt() {
    const cards = document.querySelectorAll('.game-poster-card');
    cards.forEach(card => {
      const glare = card.querySelector('.poster-specular-glare');

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

        const rotX = (0.5 - y) * 14;
        const rotY = (x - 0.5) * 14;

        card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-5px) scale(1.02)`;

        if (glare) {
          glare.style.opacity = '0.7';
          glare.style.background = `radial-gradient(circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`;
        }
      };

      const handleLeave = () => {
        card.style.transform = '';
        if (glare) {
          glare.style.opacity = '0';
        }
      };

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
      card.addEventListener('touchmove', handleMove, { passive: true });
      card.addEventListener('touchend', handleLeave);
    });
  }

  initCryptoCurrencySelector() {
    const currBtn = document.getElementById('headerCurrBtn');
    const dropdown = document.getElementById('headerCryptoDropdown');
    const badgeText = document.getElementById('currBadgeText');
    const opts = document.querySelectorAll('.crypto-opt');

    if (currBtn && dropdown) {
      currBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dropdown.style.display === 'none' || !dropdown.style.display;
        dropdown.style.display = isHidden ? 'block' : 'none';
        if (window.soundFX) window.soundFX.playClick();
      });

      document.addEventListener('click', (e) => {
        if (!currBtn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });
    }

    opts.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const curr = opt.dataset.curr;
        if (!curr || !this.cryptoRates[curr]) return;

        opts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        this.currentCurrency = curr;
        const info = this.cryptoRates[curr];
        if (badgeText) {
          badgeText.textContent = `${info.symbol} ${info.name}`;
        }

        if (this.balanceEl && window.appState) {
          this.balanceEl.textContent = this.formatBalance(window.appState.balance);
        }

        if (dropdown) dropdown.style.display = 'none';
        this.showToast(`Switched currency to ${info.name} (${info.symbol})`);
        if (window.soundFX) window.soundFX.playClick();
      });
    });
  }

  openProvablyFairModal() {
    const modal = document.getElementById('provablyFairModal');
    const pf = window.appState?.provablyFair || {
      serverSeedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      clientSeed: 'RainStakeLucky2026',
      nonce: 1
    };

    const hashInput = document.getElementById('pfServerSeedHash');
    const clientInput = document.getElementById('pfClientSeedInput');
    const nonceInput = document.getElementById('pfNonceInput');
    const nonceBadge = document.getElementById('pfNonceBadge');

    if (hashInput) hashInput.value = pf.serverSeedHash;
    if (clientInput) clientInput.value = pf.clientSeed;
    if (nonceInput) nonceInput.value = pf.nonce;
    if (nonceBadge) nonceBadge.textContent = `Nonce #${pf.nonce}`;

    const resCard = document.getElementById('pfCalcResult');
    if (resCard) resCard.style.display = 'none';

    if (modal) modal.classList.add('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  computeDeterministicHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    let full = hex1 + hex2;
    while (full.length < 64) {
      h1 = Math.imul(h1 ^ 0x9e3779b9, 1073741827);
      h2 = Math.imul(h2 ^ 0x6a09e667, 1073741827);
      full += ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
    }
    return full.substring(0, 64);
  }

  runProvablyFairVerification() {
    const gameSelect = document.getElementById('pfVerifyGameSelect');
    const game = gameSelect ? gameSelect.value : 'crash';
    const serverHash = document.getElementById('pfServerSeedHash')?.value || 'e3b0c442';
    const clientSeed = document.getElementById('pfClientSeedInput')?.value || 'userEntropy';
    const nonce = parseInt(document.getElementById('pfNonceInput')?.value || '1', 10);

    const combo = `${serverHash}:${clientSeed}:${nonce}:${game}`;
    const hash = this.computeDeterministicHash(combo);

    const sub = hash.substring(0, 8);
    const intVal = parseInt(sub, 16);
    const floatVal = (intVal % 1000000) / 1000000;

    let outcomeText = '';
    if (game === 'crash') {
      const mult = Math.max(1.00, Math.floor((99 / (100 * (1 - floatVal * 0.99))) * 100) / 100);
      outcomeText = `${mult.toFixed(2)}x Crash Point`;
    } else if (game === 'dice') {
      const roll = (floatVal * 100).toFixed(2);
      outcomeText = `Dice Roll Result: ${roll}`;
    } else if (game === 'roulette') {
      const pocket = Math.floor(floatVal * 37);
      outcomeText = `Roulette Pocket: #${pocket} ${pocket === 0 ? '🟢 Green' : (pocket % 2 === 0 ? '🔴 Red' : '⚫ Black')}`;
    } else if (game === 'plinko') {
      const slot = Math.floor(floatVal * 17);
      outcomeText = `Plinko Bucket Slot: Index [${slot}]`;
    } else if (game === 'mines') {
      const tile = Math.floor(floatVal * 25) + 1;
      outcomeText = `Deterministic Diamond at Tile #${tile}`;
    } else if (game === 'lightning') {
      const orbVal = Math.floor(floatVal * 100) + 10;
      outcomeText = `Lightning Orb Value: $${orbVal} Hold & Spin`;
    } else if (game === 'olympus') {
      const mult = [2, 5, 10, 25, 50, 100, 500, 1000][Math.floor(floatVal * 8)];
      outcomeText = `Zeus Multiplier Strike: ${mult}x`;
    } else if (game === 'blackjack') {
      const shoeCard = Math.floor(floatVal * 312);
      outcomeText = `6-Deck Shoe Card Position: #${shoeCard}`;
    } else {
      outcomeText = `Normalized Entropy: ${floatVal.toFixed(6)}`;
    }

    const resCard = document.getElementById('pfCalcResult');
    const resHash = document.getElementById('pfResultHash');
    const resFloat = document.getElementById('pfResultFloat');
    const resOutcome = document.getElementById('pfResultOutcome');

    if (resHash) resHash.textContent = hash;
    if (resFloat) resFloat.textContent = floatVal.toFixed(6);
    if (resOutcome) resOutcome.textContent = outcomeText;
    if (resCard) resCard.style.display = 'block';

    if (window.soundFX) window.soundFX.playChip();
    this.showToast('🛡️ Provably Fair Outcome Verified Successfully!');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('visible');
    if (window.soundFX) window.soundFX.playClick();
  }

  showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'global-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }
}

window.RainStakeApp = RainStakeApp;

// Global App Instance
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RainStakeApp();
});

