// Luxury Mystery Case Unboxing Engine for DruBet
// Features:
// - Authentic CS:GO / Stake.com horizontal unboxing reel with physics deceleration
// - 4 Tiered Luxury Crates:
//   1. 📦 Starter Rain ($25)
//   2. ⚡ Cyber Neon ($100)
//   3. 👑 High Roller Vault ($500)
//   4. 🐉 Dragon King ($1,000)
// - Precision center needle with audio ticks synchronized to item borders
// - Rarity tiers with glowing aura effects (Common, Rare, Epic, Legendary, Mythic)
// - Interactive case preview and post-unboxing celebration modal

const MYSTERY_CASES = {
  starter: {
    id: 'starter',
    name: 'Starter Rain',
    cost: 25,
    icon: '📦',
    items: [
      { name: 'Rain Coin', value: 5, mult: 0.2, rarity: 'common', color: '#64748b' },
      { name: 'Silver Chip', value: 12.5, mult: 0.5, rarity: 'common', color: '#94a3b8' },
      { name: 'Neon Drop', value: 25, mult: 1.0, rarity: 'rare', color: '#00e701' },
      { name: 'Lucky Clover', value: 50, mult: 2.0, rarity: 'rare', color: '#00e701' },
      { name: 'Diamond Ring', value: 125, mult: 5.0, rarity: 'epic', color: '#a855f7' },
      { name: 'Gold Ingot', value: 500, mult: 20.0, rarity: 'legendary', color: '#f59e0b' }
    ]
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    cost: 100,
    icon: '⚡',
    items: [
      { name: 'Data Fragment', value: 20, mult: 0.2, rarity: 'common', color: '#64748b' },
      { name: 'Neon Battery', value: 60, mult: 0.6, rarity: 'common', color: '#94a3b8' },
      { name: 'Cyber Token', value: 120, mult: 1.2, rarity: 'rare', color: '#00e701' },
      { name: 'Laser Core', value: 250, mult: 2.5, rarity: 'rare', color: '#00e701' },
      { name: 'Quantum Key', value: 800, mult: 8.0, rarity: 'epic', color: '#a855f7' },
      { name: 'Cyberpunk Rolex', value: 2500, mult: 25.0, rarity: 'legendary', color: '#f59e0b' }
    ]
  },
  vault: {
    id: 'vault',
    name: 'High Roller Vault',
    cost: 500,
    icon: '👑',
    items: [
      { name: 'Vault Scrap', value: 100, mult: 0.2, rarity: 'common', color: '#64748b' },
      { name: 'Casino Chip Stack', value: 300, mult: 0.6, rarity: 'common', color: '#94a3b8' },
      { name: 'Emerald Pendant', value: 650, mult: 1.3, rarity: 'rare', color: '#00e701' },
      { name: 'Golden Bar', value: 1500, mult: 3.0, rarity: 'rare', color: '#00e701' },
      { name: 'Diamond Crown', value: 4500, mult: 9.0, rarity: 'epic', color: '#a855f7' },
      { name: 'Rain God Chalice', value: 25000, mult: 50.0, rarity: 'legendary', color: '#f59e0b' }
    ]
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon King',
    cost: 1000,
    icon: '🐉',
    items: [
      { name: 'Dragon Scale', value: 200, mult: 0.2, rarity: 'common', color: '#64748b' },
      { name: 'Ruby Fang', value: 600, mult: 0.6, rarity: 'common', color: '#94a3b8' },
      { name: 'Dragon Heart', value: 1500, mult: 1.5, rarity: 'rare', color: '#00e701' },
      { name: 'Obsidian Blade', value: 3500, mult: 3.5, rarity: 'rare', color: '#00e701' },
      { name: 'Emperor Scepter', value: 10000, mult: 10.0, rarity: 'epic', color: '#a855f7' },
      { name: 'Mythic AWP Dragon Lore', value: 60000, mult: 60.0, rarity: 'mythic', color: '#ec4899' }
    ]
  }
};

class CasesGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.activeCaseKey = 'starter';
    this.isUnboxing = false;

    this.renderUI();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="cases-cabinet">
        
        <!-- Header Case Selector Tabs -->
        <div class="cases-selector-tabs">
          <button class="case-tab active" data-case="starter">📦 Starter ($25)</button>
          <button class="case-tab" data-case="cyber">⚡ Cyber ($100)</button>
          <button class="case-tab" data-case="vault">👑 Vault ($500)</button>
          <button class="case-tab" data-case="dragon">🐉 Dragon ($1k)</button>
        </div>

        <!-- Center Golden Needle Viewport -->
        <div class="case-unboxing-viewport">
          <div class="case-center-needle">
            <div class="needle-arrow top"></div>
            <div class="needle-line"></div>
            <div class="needle-arrow bottom"></div>
          </div>
          <div class="case-reel-tape" id="caseReelTape"></div>
        </div>

        <!-- Win Celebration Banner -->
        <div class="case-win-banner" id="caseWinBanner" style="display:none">
          <div class="case-win-icon" id="caseWinIcon">💎</div>
          <div class="case-win-info">
            <div class="case-win-title" id="caseWinTitle">Diamond Ring</div>
            <div class="case-win-amount text-gold" id="caseWinAmount">+$125.00 (5.0×)</div>
          </div>
        </div>

        <!-- Crate Drops Catalog Preview -->
        <div class="case-contents-preview" id="caseContentsPreview"></div>
      </div>
    `;

    this.tape = document.getElementById('caseReelTape');
    this.winBanner = document.getElementById('caseWinBanner');
    this.winIcon = document.getElementById('caseWinIcon');
    this.winTitle = document.getElementById('caseWinTitle');
    this.winAmount = document.getElementById('caseWinAmount');
    this.preview = document.getElementById('caseContentsPreview');

    this.bindEvents();
    this.renderCasePreview();
    this.resetTape();
  }

  bindEvents() {
    const tabs = this.container.querySelectorAll('.case-tab');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        if (this.isUnboxing) return;
        tabs.forEach(tab => tab.classList.remove('active'));
        t.classList.add('active');
        this.activeCaseKey = t.dataset.case;
        this.winBanner.style.display = 'none';
        this.renderCasePreview();
        this.resetTape();
        if (window.soundFX) window.soundFX.playClick();
      });
    });
  }

  renderCasePreview() {
    const caseData = MYSTERY_CASES[this.activeCaseKey];
    this.preview.innerHTML = `
      <div class="case-preview-title">Possible ${caseData.name} Drops:</div>
      <div class="case-items-grid">
        ${caseData.items.map(it => `
          <div class="case-item-card ${it.rarity}" style="border-color:${it.color}66">
            <span class="item-name">${it.name}</span>
            <span class="item-mult" style="color:${it.color}">$${it.value.toLocaleString()} (${it.mult}×)</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  resetTape() {
    const caseData = MYSTERY_CASES[this.activeCaseKey];
    this.tape.style.transition = 'none';
    this.tape.style.transform = 'translateX(0px)';

    // Pre-populate 40 item cards
    let html = '';
    for (let i = 0; i < 40; i++) {
      const item = caseData.items[Math.floor(Math.random() * caseData.items.length)];
      html += `
        <div class="case-tape-card ${item.rarity}" style="border-top-color:${item.color}">
          <span class="card-icon">${caseData.icon}</span>
          <span class="card-title">${item.name}</span>
          <span class="card-value" style="color:${item.color}">$${item.value.toLocaleString()}</span>
        </div>
      `;
    }
    this.tape.innerHTML = html;
  }

  openCase() {
    if (this.isUnboxing) return false;
    const caseData = MYSTERY_CASES[this.activeCaseKey];
    const cost = caseData.cost;

    if (!window.appState.deductBet(cost)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.isUnboxing = true;
    this.winBanner.style.display = 'none';

    // Weighted outcomes (highest tier rarest)
    const weights = [45, 30, 15, 7, 2.5, 0.5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let winningItem = caseData.items[0];

    for (let i = 0; i < caseData.items.length; i++) {
      if (rand < weights[i]) {
        winningItem = caseData.items[i];
        break;
      }
      rand -= weights[i];
    }

    // Winning index fixed at 34
    const winningIndex = 34;
    const cardWidth = 110; // width + gap
    const containerWidth = this.container.querySelector('.case-unboxing-viewport').offsetWidth;
    const centerOffset = containerWidth / 2 - cardWidth / 2;
    // Small random jitter within center of card
    const jitter = (Math.random() - 0.5) * 50;
    const targetTranslate = -(winningIndex * cardWidth - centerOffset + jitter);

    // Build tape with winner at index 34
    let html = '';
    for (let i = 0; i < 48; i++) {
      const item = (i === winningIndex) ? winningItem : caseData.items[Math.floor(Math.random() * caseData.items.length)];
      html += `
        <div class="case-tape-card ${item.rarity}" style="border-top-color:${item.color}">
          <span class="card-icon">${caseData.icon}</span>
          <span class="card-title">${item.name}</span>
          <span class="card-value" style="color:${item.color}">$${item.value.toLocaleString()}</span>
        </div>
      `;
    }
    this.tape.innerHTML = html;
    this.tape.style.transition = 'none';
    this.tape.style.transform = 'translateX(0px)';

    // Trigger smooth deceleration physics
    setTimeout(() => {
      this.tape.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.8, 0.22, 1)';
      this.tape.style.transform = `translateX(${targetTranslate}px)`;
      if (window.soundFX) window.soundFX.playDiceRoll();
    }, 50);

    // Synchronized audio ticks
    for (let t = 0; t < 24; t++) {
      setTimeout(() => {
        if (this.isUnboxing && window.soundFX) {
          window.soundFX.playSpinTick();
        }
      }, 100 + Math.pow(t, 1.85) * 11);
    }

    // Landed
    setTimeout(() => {
      this.isUnboxing = false;
      const payout = winningItem.value;
      const mult = winningItem.mult;

      window.appState.recordOutcome('Cases', cost, mult, payout);

      this.winIcon.textContent = caseData.icon;
      this.winTitle.textContent = winningItem.name;
      this.winAmount.textContent = `+$${payout.toLocaleString()} (${mult}×)`;
      this.winAmount.style.color = winningItem.color;
      this.winBanner.style.display = 'flex';
      this.winBanner.className = `case-win-banner win-pop ${winningItem.rarity}`;

      if (window.soundFX) {
        window.soundFX.playSlotWin(mult >= 5);
      }

      this.onStateChange({ isUnboxing: false, winningItem });
    }, 4700);

    return true;
  }
}

window.CasesGame = CasesGame;
