// Rewards & VIP Manager for RainStake Mobile
// Handles Daily Wheel of Fortune canvas, instant unlimited Faucet, VIP Progression & Rakeback Claims

const WHEEL_PRIZES = [
  { amount: 100, label: '$100', color: '#1e293b' },
  { amount: 500, label: '$500', color: '#00e701' },
  { amount: 250, label: '$250', color: '#0284c7' },
  { amount: 2500, label: '$2,500', color: '#a855f7' },
  { amount: 1000, label: '$1,000', color: '#f59e0b' },
  { amount: 5000, label: '$5,000', color: '#ec4899' },
  { amount: 750, label: '$750', color: '#06b6d4' },
  { amount: 10000, label: '$10,000 ★', color: '#ffd700', isJackpot: true }
];

class RewardsManager {
  constructor() {
    this.wheelCanvas = null;
    this.wheelCtx = null;
    this.isSpinning = false;
    this.currentAngle = 0;
  }

  initWheel() {
    this.wheelCanvas = document.getElementById('luckyWheelCanvas');
    if (!this.wheelCanvas) return;
    this.wheelCtx = this.wheelCanvas.getContext('2d');
    this.drawWheel(this.currentAngle);
  }

  drawWheel(angle = 0) {
    if (!this.wheelCanvas || !this.wheelCtx) return;
    const ctx = this.wheelCtx;
    const width = this.wheelCanvas.width;
    const height = this.wheelCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);
    const sliceAngle = (Math.PI * 2) / WHEEL_PRIZES.length;

    // Draw slices
    for (let i = 0; i < WHEEL_PRIZES.length; i++) {
      const p = WHEEL_PRIZES[i];
      const startA = angle + i * sliceAngle;
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#0f212e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = p.isJackpot ? '#0f212e' : '#ffffff';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(p.label, radius - 18, 5);
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#0f212e';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);
  }

  spinWheel(onFinish) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Select prize (weighted towards middle, rare jackpot)
    const weights = [35, 25, 20, 10, 6, 2.5, 1.2, 0.3];
    const totalW = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalW;
    let winningIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) {
        winningIndex = i;
        break;
      }
      rand -= weights[i];
    }

    const prize = WHEEL_PRIZES[winningIndex];
    const sliceAngle = (Math.PI * 2) / WHEEL_PRIZES.length;
    // Pointer is at the top (angle -PI/2)
    // Target angle calculation
    const extraRotations = 6 * Math.PI * 2;
    const targetSliceAngle = (Math.PI * 2) - (winningIndex * sliceAngle + sliceAngle / 2) - Math.PI / 2;
    const targetTotalAngle = this.currentAngle + extraRotations + targetSliceAngle;

    const startTime = performance.now();
    const duration = 5000; // 5 seconds
    const startAngle = this.currentAngle;

    let lastTickAngle = startAngle;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentAngle = startAngle + (targetTotalAngle - startAngle) * ease;
      this.drawWheel(this.currentAngle);

      // Play tick sound when passing slice boundaries
      if (Math.abs(this.currentAngle - lastTickAngle) >= sliceAngle) {
        lastTickAngle = this.currentAngle;
        if (window.soundFX) window.soundFX.playSpinTick();
      }

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        window.appState.claimWheelReward(prize.amount);
        if (onFinish) onFinish(prize);
      }
    };

    requestAnimationFrame(animate);
  }
}

window.rewardsManager = new RewardsManager();
