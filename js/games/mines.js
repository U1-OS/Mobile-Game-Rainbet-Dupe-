// Stake-Grade Mines Game Engine for DruBet
// Features:
// - Authentic 5x5 Dark Titanium Grid with 3D Bevels & Gold Framing
// - Configurable Mines: 1 to 24 with quick presets (1, 2, 3, 5, 10, 15, 24 💀)
// - Dynamic Multiplier Ladder Track updating in real-time
// - Tactile 3D Tile Flip animation with Harmonic Ascending Web Audio Chimes
// - Auto-Pick Random Tile button for rapid high-speed play
// - In-Game Cashout button with active profit readout
// - End-of-Round Ghost Reveal showing positions of all unrevealed mines and diamonds

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
      <div class="mines-cabinet">
        
        <!-- Header Info Bar -->
        <div class="mines-header-strip">
          <div class="mines-title-badge">
            <span class="mines-icon">💣</span>
            <span class="mines-title">DRUBET MINES</span>
          </div>
          <!-- Quick Difficulty Presets -->
          <div class="mines-presets-strip">
            <span class="preset-label">MINES:</span>
            <button class="mines-preset-btn ${this.minesCount === 1 ? 'active' : ''}" data-mines="1">1</button>
            <button class="mines-preset-btn ${this.minesCount === 2 ? 'active' : ''}" data-mines="2">2</button>
            <button class="mines-preset-btn ${this.minesCount === 3 ? 'active' : ''}" data-mines="3">3</button>
            <button class="mines-preset-btn ${this.minesCount === 5 ? 'active' : ''}" data-mines="5">5</button>
            <button class="mines-preset-btn ${this.minesCount === 10 ? 'active' : ''}" data-mines="10">10</button>
            <button class="mines-preset-btn ${this.minesCount === 15 ? 'active' : ''}" data-mines="15">15</button>
            <button class="mines-preset-btn ${this.minesCount === 24 ? 'active' : ''}" data-mines="24">24 💀</button>
          </div>
        </div>

        <!-- Key Metrics HUD Bar -->
        <div class="mines-stats-bar">
          <div class="mines-stat-box">
            <span class="label">MINES</span>
            <span class="val text-gold" id="minesCountDisplay">${this.minesCount}</span>
          </div>
          <div class="mines-stat-box">
            <span class="label">GEMS FOUND</span>
            <span class="val text-green" id="minesGemsDisplay">0</span>
          </div>
          <div class="mines-stat-box">
            <span class="label">CURRENT MULT</span>
            <span class="val text-cyan" id="minesMultDisplay">1.00×</span>
          </div>
          <div class="mines-stat-box">
            <span class="label">NEXT MULT</span>
            <span class="val text-purple" id="minesNextMultDisplay">${this.calculateMultiplier(1).toFixed(2)}×</span>
          </div>
        </div>

        <!-- Dynamic Multiplier Ladder Track -->
        <div class="mines-ladder-container" id="minesLadderContainer">
          ${this.renderLadderHTML()}
        </div>

        <!-- 5x5 Tactile Grid -->
        <div class="mines-grid" id="minesGrid"></div>

        <!-- In-Game Action Bar (Pick Random & Cashout) -->
        <div class="mines-bottom-controls" id="minesBottomControls" style="display:none;">
          <button class="btn-auto-pick" id="minesAutoPickBtn">🎲 PICK RANDOM TILE</button>
          <button class="btn-mines-cashout" id="minesCashoutBtn">
            <span>CASH OUT</span>
            <b id="minesCashoutValDisplay">$0.00</b>
          </button>
        </div>
      </div>
    `;

    this.gridEl = document.getElementById('minesGrid');
    this.countDisplay = document.getElementById('minesCountDisplay');
    this.gemsDisplay = document.getElementById('minesGemsDisplay');
    this.multDisplay = document.getElementById('minesMultDisplay');
    this.nextMultDisplay = document.getElementById('minesNextMultDisplay');
    this.bottomControls = document.getElementById('minesBottomControls');
    this.autoPickBtn = document.getElementById('minesAutoPickBtn');
    this.cashoutBtn = document.getElementById('minesCashoutBtn');
    this.cashoutValDisplay = document.getElementById('minesCashoutValDisplay');

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
          <span class="ladder-gem-num">#${s} 💎</span>
          <span class="ladder-mult-val text-gold">${mult.toFixed(2)}×</span>
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
        this.minesCount = parseInt(btn.dataset.mines, 10);
        this.countDisplay.textContent = this.minesCount;
        this.nextMultDisplay.textContent = `${this.calculateMultiplier(1).toFixed(2)}×`;
        this.updateLadder();
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    if (this.autoPickBtn) {
      this.autoPickBtn.addEventListener('click', () => {
        this.pickRandomTile();
      });
    }

    if (this.cashoutBtn) {
      this.cashoutBtn.addEventListener('click', () => {
        this.cashOut();
      });
    }
  }

  buildGridDOM() {
    this.gridEl.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const tile = document.createElement('button');
      tile.className = 'mine-tile';
      tile.dataset.index = i;
      tile.innerHTML = `
        <div class="tile-inner">
          <div class="tile-front"></div>
          <div class="tile-back"></div>
        </div>
      `;
      tile.addEventListener('click', () => this.handleTileClick(i));
      this.gridEl.appendChild(tile);
    }
  }

  calculateMultiplier(revealed) {
    if (revealed === 0) return 1.0;
    // Combinatorial math: C(25, revealed) / C(25 - mines, revealed) * 0.99
    const n = 25;
    const d = this.minesCount;
    let prob = 1.0;
    for (let i = 0; i < revealed; i++) {
      prob *= (n - d - i) / (n - i);
    }
    const mult = 0.99 / prob;
    return Math.floor(mult * 100) / 100;
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

    // Plant mines randomly
    while (this.mineIndices.size < this.minesCount) {
      const idx = Math.floor(Math.random() * 25);
      this.mineIndices.add(idx);
    }

    this.grid = [];
    for (let i = 0; i < 25; i++) {
      this.grid.push({
        isMine: this.mineIndices.has(i),
        revealed: false
      });
    }

    // Reset DOM tiles
    const tiles = this.gridEl.querySelectorAll('.mine-tile');
    tiles.forEach(t => {
      t.className = 'mine-tile';
      const back = t.querySelector('.tile-back');
      if (back) back.innerHTML = '';
    });

    this.gemsDisplay.textContent = '0';
    this.multDisplay.textContent = '1.00×';
    this.nextMultDisplay.textContent = `${this.calculateMultiplier(1).toFixed(2)}×`;
    this.updateLadder();

    if (this.bottomControls) this.bottomControls.style.display = 'flex';
    if (this.cashoutValDisplay) this.cashoutValDisplay.textContent = `$${this.betAmount.toFixed(2)}`;

    if (window.soundFX) window.soundFX.playClick();
    this.onStateChange({ isPlaying: true, revealedCount: 0, betAmount });
    return true;
  }

  pickRandomTile() {
    if (!this.isPlaying) return;
    const unrevealed = [];
    this.grid.forEach((tile, idx) => {
      if (!tile.revealed) unrevealed.push(idx);
    });
    if (unrevealed.length > 0) {
      const randomIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      this.handleTileClick(randomIdx);
    }
  }

  handleTileClick(index) {
    if (!this.isPlaying) return;
    const tileData = this.grid[index];
    if (tileData.revealed) return;

    tileData.revealed = true;
    const tileEl = this.gridEl.children[index];
    const backEl = tileEl.querySelector('.tile-back');

    if (tileData.isMine) {
      // BOOM!
      tileEl.classList.add('revealed', 'tile-mine', 'mine-explode');
      backEl.innerHTML = `<span class="mine-icon">💣</span>`;
      if (window.soundFX) window.soundFX.playMinesExplosion();

      this.gameOver(false);
    } else {
      // GEM FOUND!
      this.revealedCount++;
      tileEl.classList.add('revealed', 'tile-gem', 'gem-pop');
      backEl.innerHTML = `<span class="gem-icon">💎</span>`;

      // Ascending audio chime
      if (window.soundFX) {
        window.soundFX.playMinesDiamond(this.revealedCount);
      }

      const curMult = this.calculateMultiplier(this.revealedCount);
      const nextMult = this.calculateMultiplier(this.revealedCount + 1);

      this.gemsDisplay.textContent = this.revealedCount;
      this.multDisplay.textContent = `${curMult.toFixed(2)}×`;
      this.nextMultDisplay.textContent = `${nextMult.toFixed(2)}×`;
      this.updateLadder();

      const potentialProfit = this.betAmount * curMult;
      if (this.cashoutValDisplay) this.cashoutValDisplay.textContent = `$${potentialProfit.toFixed(2)}`;

      // Check if cleared all safe gems
      const maxGems = 25 - this.minesCount;
      if (this.revealedCount === maxGems) {
        this.cashOut();
      } else {
        this.onStateChange({
          isPlaying: true,
          revealedCount: this.revealedCount,
          currentMult: curMult
        });
      }
    }
  }

  cashOut() {
    if (!this.isPlaying || this.revealedCount === 0) return false;
    const mult = this.calculateMultiplier(this.revealedCount);
    const payout = this.betAmount * mult;

    this.gameOver(true, payout, mult);
    return true;
  }

  gameOver(won, payout = 0, mult = 0) {
    this.isPlaying = false;
    if (this.bottomControls) this.bottomControls.style.display = 'none';

    window.appState.recordOutcome('Mines', this.betAmount, won ? mult : 0, payout);

    if (won) {
      if (window.soundFX) window.soundFX.playCashout();
    } else {
      if (window.soundFX) window.soundFX.playDiceLoss();
    }

    // Ghost reveal of all remaining tiles
    this.grid.forEach((t, i) => {
      const tileEl = this.gridEl.children[i];
      if (!t.revealed) {
        tileEl.classList.add('revealed', 'ghost-revealed');
        const back = tileEl.querySelector('.tile-back');
        if (t.isMine) {
          tileEl.classList.add('tile-mine');
          back.innerHTML = `<span class="mine-icon ghost">💣</span>`;
        } else {
          tileEl.classList.add('tile-gem');
          back.innerHTML = `<span class="gem-icon ghost">💎</span>`;
        }
      }
    });

    this.onStateChange({
      isPlaying: false,
      won,
      payout,
      mult
    });
  }
}

window.MinesGame = MinesGame;
