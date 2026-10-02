// Mines Game Engine for RainStake Mobile
// Authentic 5x5 grid, combination probability multipliers, suspense animations & audio

class MinesGame {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.gridSize = 25; // 5x5
    this.minesCount = 3;
    this.betAmount = 10;
    this.isPlaying = false;
    this.revealedCount = 0;
    this.grid = []; // Array of { isMine: bool, revealed: bool }
    this.mineIndices = new Set();

    this.renderInitialUI();
  }

  renderInitialUI() {
    this.container.innerHTML = `
      <!-- Stake-style Quick Mines Difficulty Presets -->
      <div class="mines-presets-strip">
        <span class="preset-label">MINES:</span>
        <button class="mines-preset-btn ${this.minesCount === 1 ? 'active' : ''}" data-mines="1">1</button>
        <button class="mines-preset-btn ${this.minesCount === 3 ? 'active' : ''}" data-mines="3">3</button>
        <button class="mines-preset-btn ${this.minesCount === 5 ? 'active' : ''}" data-mines="5">5</button>
        <button class="mines-preset-btn ${this.minesCount === 10 ? 'active' : ''}" data-mines="10">10</button>
        <button class="mines-preset-btn ${this.minesCount === 24 ? 'active' : ''}" data-mines="24">24 💀</button>
      </div>

      <div class="mines-stats-bar">
        <div class="mines-stat-box">
          <span class="label">Mines</span>
          <span class="val text-gold" id="minesCountDisplay">${this.minesCount}</span>
        </div>
        <div class="mines-stat-box">
          <span class="label">Gems Found</span>
          <span class="val text-green" id="minesGemsDisplay">0</span>
        </div>
        <div class="mines-stat-box">
          <span class="label">Current Mult</span>
          <span class="val text-cyan" id="minesMultDisplay">1.00x</span>
        </div>
        <div class="mines-stat-box">
          <span class="label">Next Mult</span>
          <span class="val text-purple" id="minesNextMultDisplay">${this.calculateMultiplier(1).toFixed(2)}x</span>
        </div>
      </div>

      <!-- Live Dynamic Multiplier Ladder Track -->
      <div class="mines-ladder-container" id="minesLadderContainer">
        ${this.renderLadderHTML()}
      </div>

      <div class="mines-grid" id="minesGrid"></div>

      <!-- Auto Pick Random Tile Helper -->
      <div class="mines-bottom-controls" id="minesBottomControls" style="display:none;">
        <button class="btn-auto-pick" id="minesAutoPickBtn">🎲 PICK RANDOM TILE</button>
      </div>
    `;

    this.gridEl = document.getElementById('minesGrid');
    this.countDisplay = document.getElementById('minesCountDisplay');
    this.gemsDisplay = document.getElementById('minesGemsDisplay');
    this.multDisplay = document.getElementById('minesMultDisplay');
    this.nextMultDisplay = document.getElementById('minesNextMultDisplay');
    this.bottomControls = document.getElementById('minesBottomControls');
    this.autoPickBtn = document.getElementById('minesAutoPickBtn');

    this.bindPresets();
    this.buildGridDOM();
  }

  renderLadderHTML() {
    let html = '';
    const safeTiles = 25 - this.minesCount;
    const startStep = Math.max(1, this.revealedCount + 1);
    const endStep = Math.min(safeTiles, startStep + 4);

    for (let s = startStep; s <= endStep; s++) {
      const mult = this.calculateMultiplier(s);
      const isNext = s === this.revealedCount + 1;
      html += `
        <div class="ladder-step ${isNext ? 'ladder-next' : ''}">
          <span class="ladder-gem-num">#${s}</span>
          <span class="ladder-mult-val">${mult.toFixed(2)}×</span>
        </div>
      `;
    }
    return html;
  }

  updateLadder() {
    const el = document.getElementById('minesLadderContainer');
    if (el) el.innerHTML = this.renderLadderHTML();
  }

  bindPresets() {
    const presetBtns = this.container.querySelectorAll('.mines-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isPlaying) return;
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMinesCount(btn.dataset.mines);
        this.updateLadder();
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    if (this.autoPickBtn) {
      this.autoPickBtn.addEventListener('click', () => {
        if (!this.isPlaying) return;
        const unrevealed = [];
        for (let i = 0; i < this.gridSize; i++) {
          const t = this.gridEl.children[i];
          if (t && !t.classList.contains('revealed')) {
            unrevealed.push(i);
          }
        }
        if (unrevealed.length > 0) {
          const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          this.handleTileClick(pick);
        }
      });
    }
  }

  buildGridDOM() {
    this.gridEl.innerHTML = '';
    for (let i = 0; i < this.gridSize; i++) {
      const tile = document.createElement('button');
      tile.className = 'mines-tile';
      tile.dataset.index = i;
      tile.innerHTML = `<div class="mines-tile-inner"><span class="mines-icon"></span></div>`;
      tile.addEventListener('click', () => this.handleTileClick(i));
      this.gridEl.appendChild(tile);
    }
  }

  // Combination formula nCr
  combinations(n, r) {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (r > n / 2) r = n - r;
    let res = 1;
    for (let i = 1; i <= r; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return res;
  }

  // Calculate multiplier for gems found with 1% house edge
  calculateMultiplier(gemsFound) {
    if (gemsFound <= 0) return 1.00;
    const totalTiles = 25;
    const safeTiles = totalTiles - this.minesCount;
    if (gemsFound > safeTiles) return 1.00;

    // Stake probability: 0.99 * (C(25, gemsFound) / C(25 - mines, gemsFound))
    const totalCombos = this.combinations(totalTiles, gemsFound);
    const safeCombos = this.combinations(safeTiles, gemsFound);
    const houseEdge = 0.99;
    const mult = houseEdge * (totalCombos / safeCombos);
    return Math.floor(mult * 100) / 100;
  }

  setMinesCount(count) {
    if (this.isPlaying) return;
    this.minesCount = Math.max(1, Math.min(24, parseInt(count, 10)));
    if (this.countDisplay) this.countDisplay.textContent = this.minesCount;
    if (this.nextMultDisplay) this.nextMultDisplay.textContent = this.calculateMultiplier(1).toFixed(2) + 'x';
  }

  startGame(betAmount) {
    if (this.isPlaying) return false;
    if (!window.appState.deductBet(betAmount)) {
      if (window.soundFX) window.soundFX.playDiceLoss();
      return false;
    }

    this.betAmount = betAmount;
    this.isPlaying = true;
    this.revealedCount = 0;
    this.mineIndices.clear();

    // Place random mines
    while (this.mineIndices.size < this.minesCount) {
      const idx = Math.floor(Math.random() * this.gridSize);
      this.mineIndices.add(idx);
    }

    // Reset Grid DOM
    const tiles = this.gridEl.querySelectorAll('.mines-tile');
    tiles.forEach(t => {
      t.className = 'mines-tile active-turn';
      t.disabled = false;
      const icon = t.querySelector('.mines-icon');
      icon.innerHTML = '';
      icon.className = 'mines-icon';
    });

    this.gemsDisplay.textContent = '0';
    this.multDisplay.textContent = '1.00x';
    this.nextMultDisplay.textContent = this.calculateMultiplier(1).toFixed(2) + 'x';
    if (this.bottomControls) this.bottomControls.style.display = 'flex';
    this.updateLadder();

    if (window.soundFX) window.soundFX.playClick();
    this.onStateChange({ isPlaying: true, gemsFound: 0, currentMultiplier: 1.00, betAmount: this.betAmount });
    return true;
  }

  handleTileClick(index) {
    if (!this.isPlaying) return;
    const tile = this.gridEl.children[index];
    if (!tile || tile.classList.contains('revealed')) return;

    tile.classList.add('revealed');
    tile.classList.remove('active-turn');

    const isMine = this.mineIndices.has(index);

    if (isMine) {
      // Hit a Bomb!
      tile.classList.add('tile-mine');
      const icon = tile.querySelector('.mines-icon');
      icon.innerHTML = window.CasinoSymbols ? window.CasinoSymbols.renderMineBomb() : '💣';
      this.endGame(false, index);
    } else {
      // Found a Gem!
      this.revealedCount++;
      tile.classList.add('tile-gem');
      const icon = tile.querySelector('.mines-icon');
      icon.innerHTML = window.CasinoSymbols ? window.CasinoSymbols.renderMineGem() : '💎';

      const currentMult = this.calculateMultiplier(this.revealedCount);
      const nextMult = this.calculateMultiplier(this.revealedCount + 1);

      this.gemsDisplay.textContent = this.revealedCount;
      this.multDisplay.textContent = currentMult.toFixed(2) + 'x';
      this.nextMultDisplay.textContent = nextMult.toFixed(2) + 'x';
      this.updateLadder();

      if (window.soundFX) window.soundFX.playDiamond(this.revealedCount);

      // Check if all safe tiles cleared!
      const totalSafe = this.gridSize - this.minesCount;
      if (this.revealedCount === totalSafe) {
        this.cashOut();
      } else {
        this.onStateChange({
          isPlaying: true,
          gemsFound: this.revealedCount,
          currentMultiplier: currentMult,
          cashoutAmount: this.betAmount * currentMult,
          betAmount: this.betAmount
        });
      }
    }
  }

  cashOut() {
    if (!this.isPlaying || this.revealedCount === 0) return;

    const mult = this.calculateMultiplier(this.revealedCount);
    const payout = this.betAmount * mult;

    window.appState.recordOutcome('Mines', this.betAmount, mult, payout);
    if (window.soundFX) window.soundFX.playCashout();

    this.endGame(true);
  }

  endGame(won, hitIndex = -1) {
    this.isPlaying = false;
    if (this.bottomControls) this.bottomControls.style.display = 'none';

    if (!won) {
      window.appState.recordOutcome('Mines', this.betAmount, 0, 0);
      if (window.soundFX) window.soundFX.playBomb();
    }

    // Reveal all remaining tiles with subtle opacity
    const tiles = this.gridEl.querySelectorAll('.mines-tile');
    tiles.forEach((t, i) => {
      t.disabled = true;
      t.classList.remove('active-turn');
      if (!t.classList.contains('revealed')) {
        t.classList.add('revealed', 'dimmed-reveal');
        const icon = t.querySelector('.mines-icon');
        if (this.mineIndices.has(i)) {
          t.classList.add('tile-mine');
          icon.innerHTML = window.CasinoSymbols ? window.CasinoSymbols.renderMineBomb() : '💣';
        } else {
          t.classList.add('tile-gem');
          icon.innerHTML = window.CasinoSymbols ? window.CasinoSymbols.renderMineGem() : '💎';
        }
      }
    });

    this.onStateChange({
      isPlaying: false,
      won,
      gemsFound: this.revealedCount,
      multiplier: won ? this.calculateMultiplier(this.revealedCount) : 0,
      payout: won ? this.betAmount * this.calculateMultiplier(this.revealedCount) : 0
    });
  }
}

window.MinesGame = MinesGame;
