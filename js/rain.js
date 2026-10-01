// Rain & Live Chat System for RainStake Mobile
// Replicates Rainbet's signature "Rain Drop" community event with golden canvas rain, live chat, and claiming mechanics

const BOT_USERNAMES = [
  'CryptoKing', 'RainChaser', 'StakeViper', 'NeonPulse', 'MoonShot99',
  'DiamondHands', 'PlinkoMaster', 'PixelWhale', 'SatoshiGamer', 'ApexRoller',
  'GoldenDrop', 'CyberSamurai', 'LuckyLucy', 'ZeroRisk', 'RocketMan'
];

const BOT_MESSAGES = [
  'yo plinko just hit 130x on high!! 🚀',
  'crash rocket went to 45x wtf!!',
  'anyone got rain ready?? 🌧️',
  'who is tipping the rain pool next?',
  'mines 5 bombs is my favorite',
  'W',
  'stake originals are unbeatable',
  'leveling up to gold soon let’s go',
  'rain drop incoming boys! 👀',
  'just cashed out 12x on crash at the last millisecond lol',
  'plinko multi drop 10 balls satisfies my soul',
  'free chips feel so good when you hit 1000x',
  'ggs',
  'Rain God tier when?? 🔥'
];

class RainSystem {
  constructor() {
    this.chatMessages = [];
    this.rainActive = false;
    this.rainCountdown = 0;
    this.rainAmount = 0;
    this.rainInterval = null;
    this.rainCanvas = null;
    this.rainCtx = null;
    this.rainDrops = [];
    this.animId = null;

    this.initCanvas();
    this.initChatSeed();
    this.startChatSimulation();
    this.scheduleNextRain(25000); // First rain in 25s
  }

  initCanvas() {
    this.canvas = document.getElementById('globalRainCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initChatSeed() {
    for (let i = 0; i < 6; i++) {
      const user = BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)];
      const msg = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
      this.chatMessages.push({
        id: Math.random(),
        user,
        message: msg,
        badge: ['VIP', 'MOD', 'HIGH ROLLER', 'PRO'][Math.floor(Math.random() * 4)],
        time: new Date(Date.now() - (6 - i) * 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  startChatSimulation() {
    setInterval(() => {
      // 40% chance of random message every 4 seconds
      if (Math.random() < 0.45) {
        this.addBotMessage();
      }
    }, 4000);
  }

  addBotMessage() {
    const user = BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)];
    const msg = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
    this.pushMessage({
      id: Math.random(),
      user,
      message: msg,
      badge: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'][Math.floor(Math.random() * 4)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  addUserMessage(text) {
    if (!text || !text.trim()) return;
    this.pushMessage({
      id: Math.random(),
      user: window.appState.data.username,
      message: text.trim(),
      badge: window.appState.vip.current.name.toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    });
    if (window.soundFX) window.soundFX.playClick();
  }

  pushMessage(msgObj) {
    this.chatMessages.push(msgObj);
    if (this.chatMessages.length > 50) this.chatMessages.shift();
    this.renderChatDOM();
  }

  renderChatDOM() {
    const container = document.getElementById('chatMessagesList');
    if (!container) return;

    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

    container.innerHTML = this.chatMessages.map(m => {
      if (m.isSystem) {
        return `
          <div class="chat-system-message">
            <span class="system-icon">🌧️</span>
            <div class="system-content">${m.message}</div>
          </div>
        `;
      }

      return `
        <div class="chat-message-row ${m.isSelf ? 'self' : ''}">
          <div class="chat-meta">
            <span class="user-badge badge-${m.badge.toLowerCase()}">${m.badge}</span>
            <span class="chat-username">${m.user}</span>
            <span class="chat-time">${m.time}</span>
          </div>
          <div class="chat-bubble">${this.escapeHTML(m.message)}</div>
        </div>
      `;
    }).join('');

    if (isScrolledToBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  scheduleNextRain(delay = 60000) {
    setTimeout(() => {
      this.triggerRainEvent(Math.floor(500 + Math.random() * 2000));
    }, delay);
  }

  triggerRainEvent(totalPool = 1000, sponsorName = 'RainBot') {
    if (this.rainActive) return;
    this.rainActive = true;
    this.rainAmount = totalPool;
    this.rainCountdown = 20; // 20 seconds to claim

    // Post to chat
    this.pushMessage({
      isSystem: true,
      message: `<strong>RAIN ALERT!</strong> ${sponsorName} just triggered <strong>$${totalPool.toLocaleString()} SIMULATED RAIN!</strong> Click Claim below before it stops!`
    });

    if (window.soundFX) window.soundFX.playRainStart();

    // Start Golden Rain Particles
    this.startRainParticles();

    // Show Global Claim Banner
    const banner = document.getElementById('globalRainBanner');
    const amountEl = document.getElementById('rainBannerAmount');
    const timerEl = document.getElementById('rainBannerTimer');
    const claimBtn = document.getElementById('rainClaimBtn');

    if (banner) {
      banner.style.display = 'flex';
      amountEl.textContent = `$${totalPool.toLocaleString()}`;
      timerEl.textContent = `${this.rainCountdown}s`;
      claimBtn.disabled = false;
      claimBtn.textContent = 'CLAIM RAIN';
    }

    // Countdown interval
    this.rainInterval = setInterval(() => {
      this.rainCountdown--;
      if (timerEl) timerEl.textContent = `${this.rainCountdown}s`;

      if (this.rainCountdown <= 0) {
        this.stopRainEvent();
      }
    }, 1000);
  }

  claimRain() {
    if (!this.rainActive) return;
    const claimBtn = document.getElementById('rainClaimBtn');
    if (claimBtn) {
      claimBtn.disabled = true;
      claimBtn.textContent = 'CLAIMED!';
    }

    // Calculate user's share (between $50 and $250)
    const userShare = Math.floor(50 + Math.random() * 150);
    window.appState.addRainBonus(userShare);

    this.pushMessage({
      isSystem: true,
      message: `🎉 <strong>${window.appState.data.username}</strong> caught <strong>+$${userShare.toFixed(2)}</strong> from the rain!`
    });

    // Confetti / droplet pulse
    if (window.soundFX) window.soundFX.playRainClaim();
  }

  stopRainEvent() {
    clearInterval(this.rainInterval);
    this.rainActive = false;
    const banner = document.getElementById('globalRainBanner');
    if (banner) banner.style.display = 'none';
    this.stopRainParticles();

    // Schedule next rain in 60-90s
    this.scheduleNextRain(50000 + Math.random() * 40000);
  }

  startRainParticles() {
    this.rainDrops = [];
    if (!this.canvas) this.canvas = document.getElementById('globalRainCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    for (let i = 0; i < 90; i++) {
      this.rainDrops.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        vy: 8 + Math.random() * 12,
        length: 12 + Math.random() * 16,
        color: ['#00e5ff', '#ffd700', '#00e701'][Math.floor(Math.random() * 3)],
        alpha: 0.6 + Math.random() * 0.4
      });
    }

    const loop = () => {
      if (!this.rainActive && this.rainDrops.length === 0) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.rainDrops.length - 1; i >= 0; i--) {
        const d = this.rainDrops[i];
        d.y += d.vy;

        this.ctx.save();
        this.ctx.globalAlpha = d.alpha;
        this.ctx.strokeStyle = d.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(d.x, d.y);
        this.ctx.lineTo(d.x - 1, d.y + d.length);
        this.ctx.stroke();
        this.ctx.restore();

        if (d.y > this.canvas.height) {
          if (this.rainActive) {
            d.y = -20;
            d.x = Math.random() * this.canvas.width;
          } else {
            this.rainDrops.splice(i, 1);
          }
        }
      }

      this.animId = requestAnimationFrame(loop);
    };

    loop();
  }

  stopRainParticles() {
    // Drops will naturally fall out without respawning
  }

  // User manually makes it rain!
  makeItRain(amount) {
    if (!window.appState.tipRainPool(amount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.triggerRainEvent(amount, window.appState.data.username);
    return true;
  }
}

window.rainSystem = new RainSystem();
