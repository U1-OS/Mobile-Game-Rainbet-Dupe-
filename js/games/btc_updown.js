// BTC Up or Down (2.5 Minute Intervals) Game Engine for DruBet
// Replicates high-stakes crypto binary candlestick prediction:
// - 2.5 Minute (150s) Expiry Interval Rounds
// - Real-time HTML5 Canvas Candlestick & Tick Chart with Strike Price & Live Price lines
// - Live micro-volatility price simulation anchored to realistic Bitcoin market prices
// - Dynamic UP (Call) / DOWN (Put) Pools with 1.95x Multiplier Payout
// - Real-time settlement with "IN THE MONEY" status and celebration animations

class BtcUpDownGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});

    // Round Timing (150 seconds = 2.5 minutes)
    this.ROUND_DURATION = 150;
    this.timeLeft = this.ROUND_DURATION;
    this.roundNumber = Math.floor(Date.now() / 150000);

    // Price Simulation State
    this.basePrice = 65420.00 + (Math.random() * 200 - 100);
    this.currentPrice = this.basePrice;
    this.strikePrice = this.basePrice;
    this.priceHistory = []; // Tick series
    this.candles = []; // 15-second candle aggregates

    // Active User Bet
    this.userPrediction = null; // 'UP' or 'DOWN'
    this.userBetAmount = 0;
    this.userEntryPrice = 0;
    this.betPlacedInCurrentRound = false;

    // Simulated Pools
    this.upPool = 4250.00;
    this.downPool = 3980.00;

    this.timerInterval = null;
    this.tickInterval = null;
    this.animFrameId = null;

    this.initChartData();
    this.renderUI();
    this.startRoundLoop();
  }

  initChartData() {
    this.priceHistory = [];
    let p = this.basePrice - 40;
    for (let i = 0; i < 60; i++) {
      p += (Math.random() - 0.49) * 12;
      this.priceHistory.push(p);
    }
    this.currentPrice = p;
    this.strikePrice = parseFloat(p.toFixed(2));
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="btc-updown-cabinet">
        
        <!-- Header Info Bar -->
        <div class="btc-header-strip">
          <div class="btc-asset-badge">
            <span class="btc-coin-icon">₿</span>
            <div class="btc-asset-meta">
              <span class="btc-pair-title">BTC / USDT</span>
              <span class="btc-interval-tag">⏱️ 2.5 MINUTE EXPIRY</span>
            </div>
          </div>

          <div class="btc-round-meta">
            <span class="btc-round-id">ROUND #${this.roundNumber}</span>
            <div class="btc-countdown-pill" id="btcTimerPill">
              <span class="timer-icon">⏳</span>
              <span class="timer-val" id="btcTimerVal">${this.formatTime(this.timeLeft)}</span>
            </div>
          </div>
        </div>

        <!-- Prices Display Bar -->
        <div class="btc-prices-bar">
          <div class="btc-price-box strike-box">
            <span class="label">STRIKE PRICE (ROUND START)</span>
            <span class="val text-gold" id="btcStrikePriceVal">$${this.strikePrice.toFixed(2)}</span>
          </div>

          <div class="btc-price-box live-box">
            <span class="label">LIVE BTC PRICE</span>
            <span class="val text-green" id="btcLivePriceVal">$${this.currentPrice.toFixed(2)}</span>
            <span class="delta-badge" id="btcDeltaBadge">+0.00%</span>
          </div>

          <div class="btc-price-box pool-box">
            <span class="label">PAYOUT MULTIPLIER</span>
            <span class="val text-cyan">1.95× (95% RETURN)</span>
          </div>
        </div>

        <!-- Real-Time Canvas Chart Stage -->
        <div class="btc-chart-stage">
          <canvas id="btcChartCanvas" class="btc-chart-canvas"></canvas>
          <div class="chart-status-overlay" id="btcChartStatus">
            <span class="status-dot">●</span> LIVE 2.5M CANDLES
          </div>
        </div>

        <!-- User Active Bet Status Notice -->
        <div class="btc-bet-notice" id="btcBetNotice" style="display: none;">
          <div class="bet-notice-left">
            <span class="bet-type-badge" id="btcNoticeBadge">PREDICTED UP 📈</span>
            <span class="bet-entry-txt" id="btcNoticeEntry">Entry: $65,420.00</span>
          </div>
          <div class="bet-notice-right">
            <span class="bet-status-pill in-money" id="btcNoticeStatus">IN THE MONEY 🟢</span>
            <span class="bet-payout-est text-gold" id="btcNoticeEst">Est. Payout: $48.75</span>
          </div>
        </div>

        <!-- Prediction Action Buttons (UP vs DOWN) -->
        <div class="btc-prediction-dock">
          <button class="btn-predict-up" id="btnPredictUp">
            <div class="btn-predict-inner">
              <span class="arrow-icon">▲</span>
              <div class="btn-text-wrap">
                <span class="main-txt">PREDICT UP</span>
                <span class="sub-txt">Closes Higher than Strike</span>
              </div>
              <span class="mult-badge">1.95×</span>
            </div>
          </button>

          <button class="btn-predict-down" id="btnPredictDown">
            <div class="btn-predict-inner">
              <span class="arrow-icon">▼</span>
              <div class="btn-text-wrap">
                <span class="main-txt">PREDICT DOWN</span>
                <span class="sub-txt">Closes Lower than Strike</span>
              </div>
              <span class="mult-badge">1.95×</span>
            </div>
          </button>
        </div>

        <!-- Round Settlement Modal -->
        <div class="btc-settlement-modal" id="btcSettlementModal" style="display: none;">
          <div class="settle-card" id="btcSettleCard">
            <span class="settle-icon" id="btcSettleIcon">🏆</span>
            <div class="settle-title" id="btcSettleTitle">ROUND #8492 SETTLED</div>
            <div class="settle-prices" id="btcSettlePrices">Strike: $65,420.00 ➔ Final: $65,465.80</div>
            <div class="settle-result" id="btcSettleResult">PRICE CLOSED UP (+0.07%)</div>
            <div class="settle-payout text-gold" id="btcSettlePayout">+$48.75</div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
    this.initCanvas();
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  bindEvents() {
    const upBtn = document.getElementById('btnPredictUp');
    const downBtn = document.getElementById('btnPredictDown');

    if (upBtn) {
      upBtn.addEventListener('click', () => this.placePrediction('UP'));
    }
    if (downBtn) {
      downBtn.addEventListener('click', () => this.placePrediction('DOWN'));
    }
  }

  initCanvas() {
    const canvas = document.getElementById('btcChartCanvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || 380) * window.devicePixelRatio;
    canvas.height = (rect.height || 220) * window.devicePixelRatio;
    this.drawChart();
  }

  startRoundLoop() {
    // 1-second countdown timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;

      const timerEl = document.getElementById('btcTimerVal');
      if (timerEl) timerEl.textContent = this.formatTime(this.timeLeft);

      // Settle at 0 seconds
      if (this.timeLeft <= 0) {
        this.settleRound();
      }
    }, 1000);

    // 200ms price tick oscillator
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      const delta = (Math.random() - 0.495) * 4.5;
      this.currentPrice = parseFloat((this.currentPrice + delta).toFixed(2));
      this.priceHistory.push(this.currentPrice);
      if (this.priceHistory.length > 120) this.priceHistory.shift();

      this.updatePriceDOM();
      this.drawChart();
      this.updateBetNotice();
    }, 200);
  }

  updatePriceDOM() {
    const liveEl = document.getElementById('btcLivePriceVal');
    const deltaEl = document.getElementById('btcDeltaBadge');
    if (!liveEl) return;

    liveEl.textContent = `$${this.currentPrice.toFixed(2)}`;
    const diff = this.currentPrice - this.strikePrice;
    const pct = ((diff / this.strikePrice) * 100).toFixed(2);

    if (diff >= 0) {
      liveEl.className = 'val text-green';
      if (deltaEl) {
        deltaEl.textContent = `▲ +$${diff.toFixed(2)} (+${pct}%)`;
        deltaEl.className = 'delta-badge delta-green';
      }
    } else {
      liveEl.className = 'val text-red';
      if (deltaEl) {
        deltaEl.textContent = `▼ -$${Math.abs(diff).toFixed(2)} (${pct}%)`;
        deltaEl.className = 'delta-badge delta-red';
      }
    }
  }

  placePrediction(direction) {
    if (this.betPlacedInCurrentRound) {
      window.app?.showToast('⚠️ You already placed a prediction for this 2.5m round!');
      return;
    }

    if (this.timeLeft < 10) {
      window.app?.showToast('⚠️ Round closing soon! Wait for next 2.5m candle.');
      return;
    }

    const betAmount = window.app?.currentBetAmount || 10;
    const balance = window.appState.balance;

    if (balance < betAmount) {
      window.app?.showToast('⚠️ Insufficient Balance! Please Refill.');
      return;
    }

    // Deduct bet
    window.appState.adjustBalance(-betAmount, `BTC 2.5M Predict ${direction}`);
    this.userPrediction = direction;
    this.userBetAmount = betAmount;
    this.userEntryPrice = this.currentPrice;
    this.betPlacedInCurrentRound = true;

    if (window.soundFX) window.soundFX.playChipClink();
    window.app?.showToast(`✅ Predicted BTC ${direction} at $${this.currentPrice.toFixed(2)}!`);

    // Lock UI buttons
    const upBtn = document.getElementById('btnPredictUp');
    const downBtn = document.getElementById('btnPredictDown');
    if (direction === 'UP' && upBtn) upBtn.classList.add('selected-prediction');
    if (direction === 'DOWN' && downBtn) downBtn.classList.add('selected-prediction');

    this.updateBetNotice();
    this.updateUnifiedDock();
    this.onStateChange();
  }

  updateBetNotice() {
    const notice = document.getElementById('btcBetNotice');
    if (!notice || !this.betPlacedInCurrentRound) {
      if (notice) notice.style.display = 'none';
      return;
    }

    notice.style.display = 'flex';
    const badge = document.getElementById('btcNoticeBadge');
    const entry = document.getElementById('btcNoticeEntry');
    const status = document.getElementById('btcNoticeStatus');
    const est = document.getElementById('btcNoticeEst');

    const isUp = this.userPrediction === 'UP';
    if (badge) {
      badge.textContent = isUp ? 'PREDICTED UP 📈' : 'PREDICTED DOWN 📉';
      badge.className = isUp ? 'bet-type-badge tag-green' : 'bet-type-badge tag-red';
    }
    if (entry) entry.textContent = `Entry: $${this.userEntryPrice.toFixed(2)}`;

    // In the money check
    const winning = (isUp && this.currentPrice > this.strikePrice) || (!isUp && this.currentPrice < this.strikePrice);
    if (status) {
      status.textContent = winning ? 'IN THE MONEY 🟢' : 'OUT OF THE MONEY 🔴';
      status.className = winning ? 'bet-status-pill in-money' : 'bet-status-pill out-money';
    }

    const estVal = (this.userBetAmount * 1.95).toFixed(2);
    if (est) est.textContent = `Est. Win: $${estVal}`;
  }

  settleRound() {
    const finalPrice = this.currentPrice;
    const strike = this.strikePrice;
    const closedUp = finalPrice > strike;
    const isTie = Math.abs(finalPrice - strike) < 0.01;

    let userWon = false;
    let payout = 0;

    if (this.betPlacedInCurrentRound) {
      if (isTie) {
        // Refund
        payout = this.userBetAmount;
        window.appState.adjustBalance(payout, 'BTC Round Tie Refund');
        window.appState.recordBetOutcome('BTC Up/Down', this.userBetAmount, payout, 1.0, false);
      } else if ((this.userPrediction === 'UP' && closedUp) || (this.userPrediction === 'DOWN' && !closedUp)) {
        userWon = true;
        payout = this.userBetAmount * 1.95;
        window.appState.adjustBalance(payout, 'BTC Round Prediction Win');
        window.appState.recordBetOutcome('BTC Up/Down', this.userBetAmount, payout, 1.95, true);

        if (window.soundFX) window.soundFX.playCashout(payout);
        if (window.celebration) window.celebration.triggerCoinShower();
      } else {
        window.appState.recordBetOutcome('BTC Up/Down', this.userBetAmount, 0, 0, false);
        if (window.soundFX) window.soundFX.playBomb();
      }

      this.showSettlementModal({
        won: userWon,
        tie: isTie,
        strike: strike,
        final: finalPrice,
        closedUp: closedUp,
        payout: payout,
        bet: this.userBetAmount
      });
    }

    // Reset for Next 2.5-Minute Round
    this.roundNumber++;
    this.timeLeft = this.ROUND_DURATION;
    this.strikePrice = this.currentPrice;
    this.betPlacedInCurrentRound = false;
    this.userPrediction = null;
    this.userBetAmount = 0;

    const strikeEl = document.getElementById('btcStrikePriceVal');
    if (strikeEl) strikeEl.textContent = `$${this.strikePrice.toFixed(2)}`;

    const roundIdEl = document.querySelector('.btc-round-id');
    if (roundIdEl) roundIdEl.textContent = `ROUND #${this.roundNumber}`;

    const upBtn = document.getElementById('btnPredictUp');
    const downBtn = document.getElementById('btnPredictDown');
    if (upBtn) upBtn.classList.remove('selected-prediction');
    if (downBtn) downBtn.classList.remove('selected-prediction');

    this.updateBetNotice();
    this.updateUnifiedDock();
    this.onStateChange();
  }

  showSettlementModal(data) {
    const modal = document.getElementById('btcSettlementModal');
    const icon = document.getElementById('btcSettleIcon');
    const title = document.getElementById('btcSettleTitle');
    const prices = document.getElementById('btcSettlePrices');
    const result = document.getElementById('btcSettleResult');
    const payout = document.getElementById('btcSettlePayout');
    const card = document.getElementById('btcSettleCard');

    if (!modal) return;
    if (icon) icon.textContent = data.won ? '🏆' : (data.tie ? '⚖️' : '📉');
    if (title) title.textContent = data.won ? 'PREDICTION WON!' : (data.tie ? 'ROUND TIED' : 'PREDICTION LOST');
    if (prices) prices.textContent = `Strike: $${data.strike.toFixed(2)} ➔ Final: $${data.final.toFixed(2)}`;
    if (result) {
      result.textContent = data.closedUp ? 'PRICE CLOSED HIGHER (UP ▲)' : 'PRICE CLOSED LOWER (DOWN ▼)';
      result.className = data.closedUp ? 'settle-result text-green' : 'settle-result text-red';
    }
    if (payout) {
      payout.textContent = data.won ? `+$${data.payout.toFixed(2)}` : (data.tie ? `$${data.payout.toFixed(2)} REFUND` : `-$${data.bet.toFixed(2)}`);
      payout.className = data.won ? 'settle-payout text-gold' : 'settle-payout text-red';
    }
    if (card) {
      card.className = data.won ? 'settle-card card-won' : 'settle-card card-lost';
    }

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 3800);
  }

  drawChart() {
    const canvas = document.getElementById('btcChartCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(100, Math.floor((rect.width || 380) * dpr));
    const targetH = Math.max(100, Math.floor((rect.height || 220) * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (this.priceHistory.length < 2) return;

    const minPrice = Math.min(...this.priceHistory, this.strikePrice) - 8;
    const maxPrice = Math.max(...this.priceHistory, this.strikePrice) + 8;
    const priceRange = Math.max(1, maxPrice - minPrice);

    const getY = (price) => h - ((price - minPrice) / priceRange) * (h - 40) - 20;

    // Draw Strike Price Horizontal Line (Golden Dotted)
    const strikeY = getY(this.strikePrice);
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, strikeY);
    ctx.lineTo(w, strikeY);
    ctx.stroke();

    // Strike Price Label Badge
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.fillRect(w - 110, strikeY - 14, 105, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`STRIKE $${this.strikePrice.toFixed(1)}`, w - 105, strikeY);
    ctx.restore();

    // Draw Area Gradient & Price Line
    const isAboveStrike = this.currentPrice >= this.strikePrice;
    const themeColor = isAboveStrike ? '#10b981' : '#ef4444';
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, isAboveStrike ? 'rgba(16, 185, 129, 0.28)' : 'rgba(239, 68, 68, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    const stepX = w / (this.priceHistory.length - 1);

    ctx.beginPath();
    ctx.moveTo(0, getY(this.priceHistory[0]));
    for (let i = 1; i < this.priceHistory.length; i++) {
      const cx = i * stepX;
      const cy = getY(this.priceHistory[i]);
      ctx.lineTo(cx, cy);
    }

    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill area below price line
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Pulsing Head Beacon at current price
    const lastX = (this.priceHistory.length - 1) * stepX;
    const lastY = getY(this.currentPrice);

    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  updateUnifiedDock() {
    const mainBtn = document.getElementById('mainActionBtn');
    if (!mainBtn || window.app?.activeGameId !== 'btcupdown') return;

    if (this.betPlacedInCurrentRound) {
      mainBtn.textContent = `PREDICTION ACTIVE: ${this.userPrediction} ($${this.userBetAmount.toFixed(2)})`;
      mainBtn.className = 'dock-main-btn btn-grey';
      mainBtn.disabled = true;
    } else {
      mainBtn.textContent = 'PREDICT UP ▲ OR DOWN ▼';
      mainBtn.className = 'dock-main-btn btn-green';
      mainBtn.disabled = false;
    }
  }
}

window.BtcUpDownGame = BtcUpDownGame;
