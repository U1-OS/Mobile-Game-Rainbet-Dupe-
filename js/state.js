// Global State Management for RainStake Mobile
// Replicating real Rainbet.com & Stake.com player progression:
// XP & Dynamic Leveling Engine, 7-Day Daily Login Streak System,
// Apple & Android/Google Profile Authentication, VIP Loyalty Ladder,
// Persistent Local Storage, Provably Fair Seed Engine

const VIP_TIERS = [
  { name: 'Bronze I', minXP: 0, rakebackRate: 0.05, badgeColor: '#cd7f32', perk: '5% Rakeback' },
  { name: 'Bronze II', minXP: 250, rakebackRate: 0.06, badgeColor: '#cd7f32', perk: '6% Rakeback' },
  { name: 'Silver I', minXP: 750, rakebackRate: 0.08, badgeColor: '#94a3b8', perk: '8% Rakeback + $50 Bonus' },
  { name: 'Silver II', minXP: 1500, rakebackRate: 0.09, badgeColor: '#cbd5e1', perk: '9% Rakeback + Level Gifts' },
  { name: 'Gold I', minXP: 3000, rakebackRate: 0.10, badgeColor: '#f59e0b', perk: '10% Rakeback + 1.2x Rain Boost' },
  { name: 'Gold II', minXP: 5000, rakebackRate: 0.11, badgeColor: '#fbbf24', perk: '11% Rakeback + Weekly Reload' },
  { name: 'Platinum I', minXP: 10000, rakebackRate: 0.13, badgeColor: '#00f0ff', perk: '13% Rakeback + Daily Wheel' },
  { name: 'Platinum II', minXP: 20000, rakebackRate: 0.15, badgeColor: '#38bdf8', perk: '15% Rakeback + Dedicated Host' },
  { name: 'Diamond', minXP: 40000, rakebackRate: 0.18, badgeColor: '#c084fc', perk: '18% Rakeback + Custom Limits' },
  { name: 'Rain God', minXP: 100000, rakebackRate: 0.22, badgeColor: '#00e701', perk: '22% Rakeback + Golden Drops' }
];

const DAILY_STREAK_REWARDS = [
  { day: 1, reward: 100, label: '$100 Free Chips' },
  { day: 2, reward: 250, label: '$250 Free Chips' },
  { day: 3, reward: 500, label: '$500 Free Chips' },
  { day: 4, reward: 1000, label: '$1,000 Free Chips' },
  { day: 5, reward: 2500, label: '$2,500 High Roller' },
  { day: 6, reward: 5000, label: '$5,000 VIP Boost' },
  { day: 7, reward: 10000, label: '$10,000 + Lucky Spin!', hasWheel: true }
];

class StateManager {
  constructor() {
    this.STORAGE_KEY = 'rainstake_mobile_state_v2';
    this.listeners = new Set();
    this.onLevelUpCallback = null;
    this.loadState();
  }

  getDefaultState() {
    return {
      balance: 0.00,
      xp: 0,
      level: 1,
      v3_zero_reset: true,
      user: {
        username: 'RainRoller_' + Math.floor(100 + Math.random() * 900),
        avatar: '🦁',
        authProvider: 'apple', // 'apple', 'google', 'guest'
        isLoggedIn: true,
        joinedDate: new Date().toLocaleDateString()
      },
      dailyBonus: {
        streak: 1,
        lastClaimDate: null,
        totalClaimed: 0
      },
      rakebackClaimable: 0.00,
      lastDailyWheelTime: 0,
      stats: {
        totalBets: 0,
        totalWagered: 0.00,
        totalWon: 0.00,
        netProfit: 0.00,
        biggestWin: 0.00,
        biggestMultiplier: 0.00,
        plinkoDrops: 0,
        crashRounds: 0,
        minesGames: 0,
        diceRolls: 0,
        slotsSpins: 0,
        casesOpened: 0
      },
      provablyFair: {
        clientSeed: 'rainstake-' + Math.random().toString(36).substring(2, 9),
        serverSeedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        nonce: 1
      },
      settings: {
        sound: true,
        haptics: true,
        fastMode: false,
        theme: 'rainbet-dark'
      },
      history: []
    };
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.data = { ...this.getDefaultState(), ...JSON.parse(saved) };
      } else {
        this.data = this.getDefaultState();
      }
    } catch (e) {
      this.data = this.getDefaultState();
    }

    // Force zero reset & wipe all stats if not yet applied
    if (!this.data.v3_stats_wiped) {
      this.wipeAllStats();
    }

    // Recalculate level on load
    this.calculateLevel();
  }

  wipeAllStats() {
    this.data.balance = 0.00;
    this.data.xp = 0;
    this.data.level = 1;
    this.data.rakebackClaimable = 0.00;
    this.data.stats = {
      totalBets: 0,
      totalWagered: 0.00,
      totalWon: 0.00,
      netProfit: 0.00,
      biggestWin: 0.00,
      biggestMultiplier: 0.00,
      plinkoDrops: 0,
      crashRounds: 0,
      minesGames: 0,
      diceRolls: 0,
      slotsSpins: 0,
      casesOpened: 0
    };
    this.data.history = [];
    this.data.v3_stats_wiped = true;
    this.data.v3_zero_reset = true;
    this.saveState();
  }

  resetAllToZero() {
    this.wipeAllStats();
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {}
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.data);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.data));
  }

  get balance() {
    return this.data.balance;
  }

  get user() {
    return this.data.user;
  }

  get level() {
    return this.data.level;
  }

  get xp() {
    return this.data.xp;
  }

  // Level & XP Progression Formula
  // Level = floor(sqrt(XP / 50)) + 1
  calculateLevel() {
    const prevLevel = this.data.level || 1;
    const newLevel = Math.floor(Math.sqrt(this.data.xp / 50)) + 1;
    this.data.level = newLevel;

    // Check level up event
    if (newLevel > prevLevel) {
      const levelUpReward = newLevel * 50; // $50 free chips per level
      this.data.balance += levelUpReward;
      if (this.onLevelUpCallback) {
        this.onLevelUpCallback(newLevel, levelUpReward);
      }
      if (window.soundFX && window.soundFX.playLevelUp) {
        window.soundFX.playLevelUp();
      }
    }

    // Calculate progress within current level
    const currentLevelBaseXP = Math.pow(newLevel - 1, 2) * 50;
    const nextLevelBaseXP = Math.pow(newLevel, 2) * 50;
    const xpInLevel = this.data.xp - currentLevelBaseXP;
    const xpRequiredForLevel = nextLevelBaseXP - currentLevelBaseXP;
    const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForLevel) * 100));

    return {
      level: newLevel,
      currentXP: this.data.xp,
      xpInLevel: Math.floor(xpInLevel),
      xpRequired: Math.floor(xpRequiredForLevel),
      progress: progressPercent
    };
  }

  get levelInfo() {
    return this.calculateLevel();
  }

  get vip() {
    const xp = this.data.xp;
    let currentTier = VIP_TIERS[0];
    let nextTier = VIP_TIERS[1];
    let tierIndex = 0;

    for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
      if (xp >= VIP_TIERS[i].minXP) {
        currentTier = VIP_TIERS[i];
        tierIndex = i;
        nextTier = VIP_TIERS[i + 1] || null;
        break;
      }
    }

    let progress = 100;
    if (nextTier) {
      const tierRange = nextTier.minXP - currentTier.minXP;
      const currentXPInTier = xp - currentTier.minXP;
      progress = Math.min(100, Math.max(0, (currentXPInTier / tierRange) * 100));
    }

    return {
      current: currentTier,
      next: nextTier,
      index: tierIndex,
      progress: progress,
      xp: xp
    };
  }

  // Daily Streak Bonus Logic
  get dailyBonusStatus() {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const lastClaim = this.data.dailyBonus.lastClaimDate;

    if (!lastClaim) {
      return { canClaim: true, streak: this.data.dailyBonus.streak, currentDayReward: DAILY_STREAK_REWARDS[0] };
    }

    const lastDate = new Date(lastClaim);
    const diffHours = (now - lastDate) / (1000 * 60 * 60);

    if (lastClaim === todayStr) {
      // Already claimed today
      const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
      const hoursLeft = Math.floor(msUntilMidnight / (1000 * 60 * 60));
      const minsLeft = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
      return { canClaim: false, timeLeft: `${hoursLeft}h ${minsLeft}m`, streak: this.data.dailyBonus.streak };
    }

    // If within 48 hours, streak continues! If missed > 48h, reset streak to Day 1
    if (diffHours > 48) {
      this.data.dailyBonus.streak = 1;
    }

    const currentStreakIdx = (this.data.dailyBonus.streak - 1) % 7;
    const currentReward = DAILY_STREAK_REWARDS[currentStreakIdx];

    return { canClaim: true, streak: this.data.dailyBonus.streak, currentDayReward: currentReward };
  }

  claimDailyBonus() {
    const status = this.dailyBonusStatus;
    if (!status.canClaim) return null;

    const streakIdx = (this.data.dailyBonus.streak - 1) % 7;
    const rewardItem = DAILY_STREAK_REWARDS[streakIdx];

    this.data.balance += rewardItem.reward;
    this.data.dailyBonus.totalClaimed += rewardItem.reward;
    this.data.dailyBonus.lastClaimDate = new Date().toISOString().slice(0, 10);
    this.data.dailyBonus.streak = (this.data.dailyBonus.streak % 7) + 1;

    this.saveState();
    if (window.soundFX) window.soundFX.playCashout();

    return rewardItem;
  }

  // Deduct bet (XP is now awarded on wins only)
  deductBet(amount) {
    if (amount <= 0) return false;
    if (this.data.balance < amount) return false;

    this.data.balance -= amount;
    // NOTE: Per user rule, XP increases strictly per win, NOT by how much you bet or win.
    this.data.stats.totalWagered += amount;
    this.data.stats.totalBets += 1;

    // Calculate VIP rakeback
    const currentVip = this.vip.current;
    const rakebackAmount = amount * (currentVip.rakebackRate * 0.05);
    this.data.rakebackClaimable += rakebackAmount;

    this.data.provablyFair.nonce += 1;
    this.saveState();
    return true;
  }

  // Record game outcome
  recordOutcome(gameName, betAmount, multiplier, payout) {
    const profit = payout - betAmount;
    const won = (payout > betAmount) || (multiplier > 1.0) || (payout > 0 && betAmount === 0);

    if (payout > 0) {
      this.data.balance += payout;
      this.data.stats.totalWon += payout;
    }
    this.data.stats.netProfit += profit;

    if (payout > this.data.stats.biggestWin) {
      this.data.stats.biggestWin = payout;
    }
    if (multiplier > this.data.stats.biggestMultiplier) {
      this.data.stats.biggestMultiplier = multiplier;
    }

    // USER REQUIREMENT: "make xp go up per win not by how much you win"
    // Each win gives a flat +50 XP regardless of dollar payout amount ($1 win or $1,000,000 win = +50 XP)
    let xpGained = 0;
    if (won) {
      xpGained = 50;
      this.data.xp += xpGained;
      this.data.stats.totalWinsCount = (this.data.stats.totalWinsCount || 0) + 1;
      this.calculateLevel();
      if (window.app?.notifyXPWin) {
        window.app.notifyXPWin(xpGained);
      }

      // Next-Gen Big Win celebration trigger
      if (window.celebrationEngine && (multiplier >= 5.0 || payout >= 100)) {
        window.celebrationEngine.triggerWin(payout, multiplier, gameName);
      }
    }

    const counterMap = {
      'Plinko': 'plinkoDrops',
      'Crash': 'crashRounds',
      'Mines': 'minesGames',
      'Dice': 'diceRolls',
      'Slots': 'slotsSpins',
      'Cases': 'casesOpened'
    };
    if (counterMap[gameName]) {
      this.data.stats[counterMap[gameName]] += 1;
    }

    const record = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      game: gameName,
      bet: betAmount,
      multiplier: multiplier,
      payout: payout,
      profit: profit,
      won: won,
      xpGained: xpGained
    };

    this.data.history.unshift(record);
    if (this.data.history.length > 50) {
      this.data.history.pop();
    }

    this.saveState();
    return record;
  }

  // Authentication: Apple / Google / Guest
  login(provider, username, avatar) {
    this.data.user = {
      username: username || ('Player_' + Math.floor(100 + Math.random() * 900)),
      avatar: avatar || '🦁',
      authProvider: provider,
      isLoggedIn: true,
      joinedDate: this.data.user.joinedDate || new Date().toLocaleDateString()
    };
    this.saveState();
  }

  // Update Profile
  updateProfile(username, avatar) {
    if (username) this.data.user.username = username;
    if (avatar) this.data.user.avatar = avatar;
    this.saveState();
  }

  // Add Win Amount to Balance & Total Won
  addWin(amount) {
    if (amount <= 0) return;
    this.data.balance += amount;
    this.data.stats.totalWon += amount;
    // Per user rule: XP goes up per win (+50 XP flat)
    const xpGained = 50;
    this.data.xp += xpGained;
    this.data.stats.totalWinsCount = (this.data.stats.totalWinsCount || 0) + 1;
    this.calculateLevel();
    this.saveState();
    if (window.app?.notifyXPWin) {
      window.app.notifyXPWin(xpGained);
    }
    if (window.celebrationEngine && amount >= 250) {
      window.celebrationEngine.triggerWin(amount, amount / 10, 'Big Hit');
    }
  }

  // Record Bet Outcome alias
  recordBetOutcome(gameName, betAmount, payout, multiplier, won) {
    return this.recordOutcome(gameName, betAmount, multiplier || (betAmount > 0 ? payout / betAmount : 0), payout);
  }

  // Claim Faucet Reload
  claimFaucet(amount = 1000.00) {
    this.data.balance += amount;
    this.saveState();
    if (window.soundFX) window.soundFX.playCashout();
    return amount;
  }

  // Claim Rakeback
  claimRakeback() {
    const amount = this.data.rakebackClaimable;
    if (amount <= 0.01) return 0;
    this.data.balance += amount;
    this.data.rakebackClaimable = 0;
    this.saveState();
    if (window.soundFX) window.soundFX.playCashout();
    return amount;
  }

  // Spin Lucky Wheel Reward
  claimWheelReward(amount) {
    this.data.balance += amount;
    this.data.lastDailyWheelTime = Date.now();
    this.saveState();
    if (window.soundFX) window.soundFX.playSlotWin(true);
    return amount;
  }

  // Receive Rain Drop
  addRainBonus(amount) {
    this.data.balance += amount;
    this.saveState();
    if (window.soundFX) window.soundFX.playRainClaim();
  }

  // Tip Rain Pool
  tipRainPool(amount) {
    if (amount <= 0 || this.data.balance < amount) return false;
    this.data.balance -= amount;
    this.data.xp += amount * 15; // Bonus XP for tipping!
    this.calculateLevel();
    this.saveState();
    return true;
  }

  // Rotate Provably Fair Seeds
  rotateSeed(newClientSeed) {
    this.data.provablyFair.clientSeed = newClientSeed || ('rainstake-' + Math.random().toString(36).substring(2, 9));
    this.data.provablyFair.serverSeedHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    this.data.provablyFair.nonce = 1;
    this.saveState();
  }
}

window.appState = new StateManager();
