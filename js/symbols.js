// Realistic High-Definition Casino Vector Symbols Engine for RainStake Mobile
// Delivers authentic, real-life slot symbols with 3D metallic shading, specular highlights,
// faceted gemstone cuts, and ornate gold foil textures (Zero external image dependencies)

class CasinoSymbols {
  static get(symbolId, options = {}) {
    const fn = this.renderers[symbolId];
    if (fn) {
      return fn(options);
    }
    return `<div class="sym-fallback">${options.char || '⭐'}</div>`;
  }

  static getLightningSymbol(symObj, orbValue = null, isJackpot = false, jackpotName = '') {
    if (symObj.id === 'orb' || symObj.isOrb || symObj.char === '🌕' || orbValue !== null) {
      return this.renderLightningOrb(orbValue, isJackpot, jackpotName);
    }
    return this.get('ll_' + (symObj.id || 'pharaoh'), symObj);
  }

  static getOlympusSymbol(symObj, multiplier = null) {
    if (multiplier) {
      return this.renderOlympusMultiplierOrb(multiplier);
    }
    return this.get('oly_' + (symObj.id || 'crown'), symObj);
  }

  static getSlotSymbol(symObj) {
    if (!symObj) return this.renderSlotDiamond();
    const id = symObj.id || '';
    if (id === 'diamond' || symObj.char === '💎') return this.renderSlotDiamond();
    if (id === 'crown' || symObj.char === '👑') return this.renderSlotCrown();
    if (id === 'wild' || symObj.char === '7️⃣' || symObj.isWild) return this.renderSlotWild7();
    if (id === 'scatter' || symObj.char === '🌧️' || symObj.isScatter) return this.renderSlotRainScatter();
    if (id === 'bolt' || symObj.char === '⚡') return this.renderSlotThunderBolt();
    if (id === 'bell' || symObj.char === '🔔') return this.renderSlotBell();
    if (id === 'clover' || symObj.char === '🍀') return this.renderSlotClover();
    if (id === 'cherry' || symObj.char === '🍒') return this.renderSlotCherry();
    return this.get('slot_' + id, symObj);
  }

  // ==========================================
  // LIGHTNING LINK REAL-LIFE SYMBOLS
  // ==========================================

  // 1. TIKI / POLYNESIAN GOLDEN IDOL MASK
  static renderTikiMask() {
    return `
      <div class="real-sym sym-tiki">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="tikiGold" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="20%" stop-color="#fef08a"/>
              <stop offset="45%" stop-color="#f59e0b"/>
              <stop offset="80%" stop-color="#b45309"/>
              <stop offset="100%" stop-color="#78350f"/>
            </radialGradient>
            <radialGradient id="tikiGem" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#67e8f9"/>
              <stop offset="40%" stop-color="#06b6d4"/>
              <stop offset="100%" stop-color="#083344"/>
            </radialGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f59e0b" flood-opacity="0.6"/>
            </filter>
          </defs>
          <!-- Feather / Crown Headdress -->
          <path d="M50 4 L56 22 L66 10 L68 26 L80 18 L76 34 L50 28 L24 34 L20 18 L32 26 L34 10 L44 22 Z" fill="url(#tikiGold)" stroke="#d97706" stroke-width="1.2" filter="url(#goldGlow)"/>
          <!-- Mask Base -->
          <path d="M22 30 Q50 24 78 30 Q84 65 74 88 Q50 98 26 88 Q16 65 22 30 Z" fill="url(#tikiGold)" stroke="#78350f" stroke-width="2"/>
          <!-- Brow Ridge -->
          <path d="M26 40 Q50 34 74 40 L72 48 Q50 42 28 48 Z" fill="#78350f"/>
          <!-- Glowing Turquoise Eyes -->
          <polygon points="32,46 44,48 42,56 30,52" fill="url(#tikiGem)" stroke="#083344" stroke-width="1"/>
          <polygon points="68,46 56,48 58,56 70,52" fill="url(#tikiGem)" stroke="#083344" stroke-width="1"/>
          <circle cx="37" cy="50" r="1.8" fill="#fff"/>
          <circle cx="63" cy="50" r="1.8" fill="#fff"/>
          <!-- Carved Nose Bridge -->
          <polygon points="46,42 54,42 56,66 44,66" fill="#b45309" stroke="#78350f" stroke-width="1"/>
          <ellipse cx="50" cy="65" rx="9" ry="4" fill="url(#tikiGold)" stroke="#78350f" stroke-width="1.2"/>
          <!-- Mouth with Carved Teeth -->
          <rect x="32" y="72" width="36" height="12" rx="3" fill="#451a03" stroke="#78350f" stroke-width="1.5"/>
          <path d="M34 78 H66 M40 72 V84 M46 72 V84 M54 72 V84 M60 72 V84" stroke="#fef08a" stroke-width="1.5"/>
          <!-- Tribal Cheek Chevrons -->
          <path d="M26 58 L30 62 L26 66 M74 58 L70 62 L74 66" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    `;
  }

  // 2. BLAZING INFERNO FLAME
  static renderFire() {
    return `
      <div class="real-sym sym-fire">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="fireOuter" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="50%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#7f1d1d"/>
            </radialGradient>
            <radialGradient id="fireCore" cx="50%" cy="85%" r="60%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="30%" stop-color="#fef08a"/>
              <stop offset="70%" stop-color="#f97316"/>
              <stop offset="100%" stop-color="#dc2626"/>
            </radialGradient>
            <filter id="fireGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ef4444" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Outer Fire Tongue -->
          <path d="M50 6 Q64 30 74 44 Q86 60 78 80 Q70 96 50 96 Q30 96 22 80 Q14 60 26 44 Q36 30 50 6 Z" fill="url(#fireOuter)" filter="url(#fireGlow)"/>
          <!-- Left Wing Flare -->
          <path d="M50 20 Q60 40 46 60 Q30 40 50 20 Z" fill="#f97316"/>
          <!-- Right Secondary Tongue -->
          <path d="M50 14 Q72 38 68 62 Q52 46 50 14 Z" fill="#fbbf24"/>
          <!-- Inner White Hot Core -->
          <path d="M50 36 Q60 55 64 74 Q60 90 50 90 Q40 90 36 74 Q40 55 50 36 Z" fill="url(#fireCore)"/>
          <circle cx="50" cy="80" r="10" fill="#ffffff" opacity="0.9"/>
          <!-- Embers -->
          <circle cx="28" cy="30" r="2.5" fill="#fef08a"/>
          <circle cx="72" cy="24" r="2" fill="#fef08a"/>
          <circle cx="48" cy="10" r="1.5" fill="#fff"/>
        </svg>
      </div>
    `;
  }

  // 3. GOLDEN BALD EAGLE
  static renderEagle() {
    return `
      <div class="real-sym sym-eagle">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="eagleGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="40%" stop-color="#f59e0b"/>
              <stop offset="80%" stop-color="#b45309"/>
              <stop offset="100%" stop-color="#451a03"/>
            </linearGradient>
            <linearGradient id="eagleFeather" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="50%" stop-color="#cbd5e1"/>
              <stop offset="100%" stop-color="#64748b"/>
            </linearGradient>
          </defs>
          <!-- Feathered Backing -->
          <path d="M22 28 Q44 14 74 24 Q86 44 80 76 Q60 92 26 82 Q12 60 22 28 Z" fill="#1e293b" stroke="url(#eagleGold)" stroke-width="2"/>
          <!-- White Feather Head -->
          <path d="M26 34 Q52 20 72 32 Q80 48 76 66 L68 62 L66 70 L58 64 L54 72 L42 66 L38 72 L32 64 Q22 52 26 34 Z" fill="url(#eagleFeather)"/>
          <!-- Curved Golden Beak -->
          <path d="M68 44 Q86 46 92 60 Q86 68 76 66 Q72 64 68 56 Z" fill="url(#eagleGold)" stroke="#78350f" stroke-width="1.2"/>
          <!-- Sharp Beak Line -->
          <path d="M72 54 Q84 56 90 60" stroke="#78350f" stroke-width="1.5" fill="none"/>
          <!-- Emerald Piercing Eye -->
          <ellipse cx="56" cy="42" rx="6" ry="4.5" fill="#f59e0b"/>
          <ellipse cx="56" cy="42" rx="4" ry="3.5" fill="#10b981"/>
          <circle cx="56" cy="42" r="2" fill="#022c22"/>
          <circle cx="57.5" cy="40.5" r="1.2" fill="#ffffff"/>
        </svg>
      </div>
    `;
  }

  // 4. VEGAS LIBERTY BELL
  static renderBell() {
    return `
      <div class="real-sym sym-bell">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="bellBrass" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="25%" stop-color="#fef08a"/>
              <stop offset="60%" stop-color="#eab308"/>
              <stop offset="85%" stop-color="#a16207"/>
              <stop offset="100%" stop-color="#713f12"/>
            </radialGradient>
          </defs>
          <!-- Top Hanger Ring -->
          <rect x="42" y="8" width="16" height="12" rx="3" fill="url(#bellBrass)" stroke="#713f12" stroke-width="1.5"/>
          <circle cx="50" cy="14" r="3" fill="#1e293b"/>
          <!-- Bell Dome -->
          <path d="M50 18 Q34 22 30 46 Q28 66 18 76 L82 76 Q72 66 70 46 Q66 22 50 18 Z" fill="url(#bellBrass)" stroke="#713f12" stroke-width="2"/>
          <!-- Specular Curved Highlight -->
          <path d="M42 24 Q36 40 34 68" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
          <!-- Bottom Lip Rim -->
          <ellipse cx="50" cy="76" rx="36" ry="7" fill="url(#bellBrass)" stroke="#713f12" stroke-width="2"/>
          <!-- Clapper Ball -->
          <circle cx="50" cy="85" r="7" fill="url(#bellBrass)" stroke="#713f12" stroke-width="1.5"/>
        </svg>
      </div>
    `;
  }

  // 5. IMPERIAL ROYAL CROWN
  static renderCrown() {
    return `
      <div class="real-sym sym-crown">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="30%" stop-color="#fef08a"/>
              <stop offset="60%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#92400e"/>
            </linearGradient>
            <radialGradient id="velvetRed" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#dc2626"/>
              <stop offset="70%" stop-color="#991b1b"/>
              <stop offset="100%" stop-color="#450a0a"/>
            </radialGradient>
          </defs>
          <!-- Velvet Crimson Cushion Base -->
          <path d="M22 66 Q20 38 50 32 Q80 38 78 66 Z" fill="url(#velvetRed)"/>
          <!-- Gold Diadem Spikes -->
          <polygon points="18,68 22,34 36,52 50,22 64,52 78,34 82,68" fill="url(#crownGold)" stroke="#78350f" stroke-width="2"/>
          <!-- Top Pearls -->
          <circle cx="22" cy="33" r="4.5" fill="#fff" stroke="#f59e0b" stroke-width="1"/>
          <circle cx="50" cy="20" r="5.5" fill="#fef08a" stroke="#d97706" stroke-width="1.2"/>
          <circle cx="78" cy="33" r="4.5" fill="#fff" stroke="#f59e0b" stroke-width="1"/>
          <!-- Crown Headband -->
          <rect x="16" y="68" width="68" height="14" rx="3" fill="url(#crownGold)" stroke="#78350f" stroke-width="2"/>
          <!-- Studded Jewels -->
          <circle cx="26" cy="75" r="3.5" fill="#ef4444" stroke="#fff" stroke-width="0.8"/>
          <polygon points="50,71 54,75 50,79 46,75" fill="#3b82f6" stroke="#fff" stroke-width="0.8"/>
          <circle cx="74" cy="75" r="3.5" fill="#10b981" stroke="#fff" stroke-width="0.8"/>
        </svg>
      </div>
    `;
  }

  // 6. VEGAS ROYAL CARD RANKS (ACE, KING, QUEEN)
  static renderCardRank(letter, color) {
    return `
      <div class="real-sym sym-card-rank">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="rankGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="35%" stop-color="#fef08a"/>
              <stop offset="70%" stop-color="#d97706"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <filter id="rankShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- 3D Bevel Plaque -->
          <rect x="14" y="14" width="72" height="72" rx="14" fill="#0f172a" stroke="url(#rankGold)" stroke-width="3" filter="url(#rankShadow)"/>
          <rect x="18" y="18" width="64" height="64" rx="10" fill="none" stroke="#334155" stroke-width="1.2"/>
          <!-- Bold Letter -->
          <text x="50" y="66" text-anchor="middle" font-size="52" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" fill="url(#rankGold)" stroke="#451a03" stroke-width="1.5">${letter}</text>
          <!-- Corner Diamond Pip -->
          <polygon points="50,22 53,26 50,30 47,26" fill="#f59e0b"/>
          <polygon points="50,70 53,74 50,78 47,74" fill="#f59e0b"/>
        </svg>
      </div>
    `;
  }

  // 7. ERUPTING VOLCANO SCATTER
  static renderVolcanoScatter() {
    return `
      <div class="real-sym sym-volcano">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="lavaGlow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="40%" stop-color="#fbbf24"/>
              <stop offset="80%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#7f1d1d"/>
            </radialGradient>
            <linearGradient id="volcanoRock" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#475569"/>
              <stop offset="60%" stop-color="#1e293b"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
            <linearGradient id="scatterGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="50%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>
          <!-- Lava Eruption Smoke & Fire -->
          <path d="M50 8 Q38 24 44 32 Q50 20 56 32 Q62 24 50 8 Z" fill="url(#lavaGlow)"/>
          <circle cx="44" cy="18" r="4" fill="#fbbf24"/>
          <circle cx="56" cy="14" r="3.5" fill="#f97316"/>
          <!-- Volcano Mountain Base -->
          <polygon points="50,30 68,36 86,84 14,84 32,36" fill="url(#volcanoRock)" stroke="#78350f" stroke-width="1.5"/>
          <!-- Molten Lava Rivers -->
          <path d="M46 34 Q40 50 36 84 M50 34 Q52 56 50 84 M54 34 Q62 52 66 84" stroke="#ef4444" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M48 34 Q50 56 48 84" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          <!-- SCATTER Gold Ribbon Banner -->
          <g filter="url(#goldGlow)">
            <rect x="8" y="74" width="84" height="20" rx="4" fill="#991b1b" stroke="url(#scatterGold)" stroke-width="2"/>
            <text x="50" y="88" text-anchor="middle" font-size="12" font-family="'Arial Black', sans-serif" font-weight="900" fill="url(#scatterGold)" stroke="#000" stroke-width="0.5" letter-spacing="1">SCATTER</text>
          </g>
        </svg>
      </div>
    `;
  }

  // 8. LIGHTNING WILD MEDALLION
  static renderLightningWild() {
    return `
      <div class="real-sym sym-wild">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="wildAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00f0ff"/>
              <stop offset="50%" stop-color="#0284c7"/>
              <stop offset="100%" stop-color="#082f49"/>
            </radialGradient>
            <linearGradient id="wildGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="50%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
            <filter id="wildGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#00f0ff" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Outer Neon Medallion -->
          <circle cx="50" cy="50" r="44" fill="url(#wildAura)" stroke="#00f0ff" stroke-width="3" filter="url(#wildGlow)"/>
          <circle cx="50" cy="50" r="38" fill="#090e17" stroke="url(#wildGold)" stroke-width="2"/>
          <!-- Electric Lightning Bolt -->
          <polygon points="54,16 32,48 48,48 44,82 70,44 54,44" fill="url(#wildGold)" stroke="#ffffff" stroke-width="1.5" filter="url(#wildGlow)"/>
          <!-- WILD Plaque -->
          <rect x="18" y="70" width="64" height="18" rx="4" fill="#0369a1" stroke="url(#wildGold)" stroke-width="1.8"/>
          <text x="50" y="83" text-anchor="middle" font-size="13" font-family="'Arial Black', sans-serif" font-weight="900" fill="#ffffff" letter-spacing="1">WILD</text>
        </svg>
      </div>
    `;
  }

  // 9. HOLD & SPIN LIGHTNING ORB
  static renderLightningOrb(value = 20, isJackpot = false, jackpotName = '') {
    const displayVal = isJackpot ? jackpotName : `$${value}`;
    const isBig = isJackpot || value >= 100;
    return `
      <div class="real-sym sym-orb ${isJackpot ? 'orb-jackpot' : ''}">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="orbCoreGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="25%" stop-color="#fef08a"/>
              <stop offset="55%" stop-color="#eab308"/>
              <stop offset="85%" stop-color="#a16207"/>
              <stop offset="100%" stop-color="#451a03"/>
            </radialGradient>
            <radialGradient id="orbElectricAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(0, 240, 255, 0.9)"/>
              <stop offset="60%" stop-color="rgba(245, 158, 11, 0.4)"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
            <filter id="orbPulseGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${isJackpot ? '#00f0ff' : '#f59e0b'}" flood-opacity="0.9"/>
            </filter>
          </defs>
          <!-- Outer Corona Glow -->
          <circle cx="50" cy="50" r="48" fill="url(#orbElectricAura)"/>
          <!-- 3D Electric Plasma Sphere -->
          <circle cx="50" cy="50" r="40" fill="url(#orbCoreGrad)" stroke="#fef08a" stroke-width="2" filter="url(#orbPulseGlow)"/>
          <!-- High Voltage Lightning Ring Arcs -->
          <path d="M20 40 Q50 18 80 40 Q50 62 20 40 Z" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.8"/>
          <path d="M30 65 Q50 80 70 65" fill="none" stroke="#00f0ff" stroke-width="2" opacity="0.9"/>
          <!-- Specular Light Reflection -->
          <ellipse cx="38" cy="28" rx="10" ry="5" fill="#ffffff" opacity="0.7" transform="rotate(-25 38 28)"/>
          <!-- Central Cash Readout Pill -->
          <rect x="12" y="38" width="76" height="24" rx="12" fill="rgba(9, 14, 23, 0.88)" stroke="${isBig ? '#00f0ff' : '#fef08a'}" stroke-width="1.8"/>
          <text x="50" y="55" text-anchor="middle" font-size="${isJackpot ? '11' : (displayVal.length > 5 ? '12' : '15')}" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" fill="${isBig ? '#00f0ff' : '#fbbf24'}">${displayVal}</text>
        </svg>
      </div>
    `;
  }

  // ==========================================
  // GATES OF OLYMPUS 1000 REAL-LIFE SYMBOLS
  // ==========================================

  // 10. ZEUS SCATTER PORTRAIT
  static renderZeusScatter() {
    return `
      <div class="real-sym sym-zeus">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="zeusGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#e0f2fe"/>
              <stop offset="40%" stop-color="#38bdf8"/>
              <stop offset="80%" stop-color="#0369a1"/>
              <stop offset="100%" stop-color="#082f49"/>
            </radialGradient>
            <linearGradient id="zeusGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <filter id="zeusAura">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00f0ff" flood-opacity="0.9"/>
            </filter>
          </defs>
          <!-- Ornate Greek Frame -->
          <circle cx="50" cy="50" r="45" fill="url(#zeusGlow)" stroke="url(#zeusGoldBorder)" stroke-width="3" filter="url(#zeusAura)"/>
          <!-- Zeus Head & Flowing White Beard -->
          <path d="M34 40 Q50 30 66 40 Q76 64 64 82 Q50 90 36 82 Q24 64 34 40 Z" fill="#f8fafc"/>
          <!-- Shading on Beard -->
          <path d="M42 66 Q50 82 58 66 M46 72 Q50 86 54 72" stroke="#94a3b8" stroke-width="1.8" fill="none"/>
          <!-- Face Skin -->
          <path d="M38 42 Q50 36 62 42 Q66 56 60 64 Q50 68 40 64 Q34 56 38 42 Z" fill="#fed7aa"/>
          <!-- Glowing Electric Cyan Eyes -->
          <ellipse cx="44" cy="48" rx="3" ry="2" fill="#00f0ff" filter="url(#zeusAura)"/>
          <ellipse cx="56" cy="48" rx="3" ry="2" fill="#00f0ff" filter="url(#zeusAura)"/>
          <!-- Golden Laurel Wreath -->
          <path d="M30 42 Q50 26 70 42" stroke="url(#zeusGoldBorder)" stroke-width="4" fill="none" stroke-linecap="round"/>
          <polygon points="34,36 38,40 32,42" fill="#fbbf24"/>
          <polygon points="66,36 62,40 68,42" fill="#fbbf24"/>
          <polygon points="50,28 53,34 47,34" fill="#fbbf24"/>
          <!-- SCATTER Gold Banner -->
          <rect x="12" y="74" width="76" height="18" rx="4" fill="#1e1b4b" stroke="url(#zeusGoldBorder)" stroke-width="2"/>
          <text x="50" y="87" text-anchor="middle" font-size="11" font-family="'Arial Black', sans-serif" font-weight="900" fill="#fef08a" letter-spacing="1">SCATTER</text>
        </svg>
      </div>
    `;
  }

  // 11. OLYMPIAN GOLD DIADEM CROWN
  static renderOlympusCrown() {
    return `
      <div class="real-sym sym-oly-crown">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="olyCrownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="25%" stop-color="#fef08a"/>
              <stop offset="60%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <radialGradient id="crownPurple" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#a855f7"/>
              <stop offset="80%" stop-color="#581c87"/>
              <stop offset="100%" stop-color="#2e1065"/>
            </radialGradient>
          </defs>
          <!-- Background Sunburst Glow -->
          <circle cx="50" cy="50" r="42" fill="url(#crownPurple)" stroke="url(#olyCrownGold)" stroke-width="2"/>
          <!-- Greek Temple Crown -->
          <path d="M22 64 L26 36 L38 50 L50 24 L62 50 L74 36 L78 64 Z" fill="url(#olyCrownGold)" stroke="#78350f" stroke-width="1.8"/>
          <!-- Large Center Sapphire -->
          <polygon points="50,42 56,48 50,56 44,48" fill="#38bdf8" stroke="#fff" stroke-width="1"/>
          <!-- Side Rubies -->
          <circle cx="32" cy="54" r="3.5" fill="#ef4444" stroke="#fff" stroke-width="0.8"/>
          <circle cx="68" cy="54" r="3.5" fill="#ef4444" stroke="#fff" stroke-width="0.8"/>
          <!-- Crown Band with Greek Meander Line -->
          <rect x="20" y="64" width="60" height="12" rx="2" fill="url(#olyCrownGold)" stroke="#78350f" stroke-width="1.5"/>
          <path d="M26 70 H30 V66 H36 V74 H32" stroke="#78350f" stroke-width="1" fill="none"/>
          <path d="M64 70 H68 V66 H74 V74 H70" stroke="#78350f" stroke-width="1" fill="none"/>
        </svg>
      </div>
    `;
  }

  // 12. CELESTIAL WINGED HOURGLASS
  static renderHourglass() {
    return `
      <div class="real-sym sym-hourglass">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="40%" stop-color="#eab308"/>
              <stop offset="80%" stop-color="#a16207"/>
              <stop offset="100%" stop-color="#451a03"/>
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.7)"/>
              <stop offset="40%" stop-color="rgba(56,189,248,0.2)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.4)"/>
            </linearGradient>
          </defs>
          <!-- Top Brass Cap -->
          <rect x="24" y="16" width="52" height="10" rx="3" fill="url(#brassGrad)" stroke="#713f12" stroke-width="1.5"/>
          <!-- Bottom Brass Cap -->
          <rect x="24" y="74" width="52" height="10" rx="3" fill="url(#brassGrad)" stroke="#713f12" stroke-width="1.5"/>
          <!-- Curved Glass Bulbs -->
          <path d="M30 26 Q50 48 50 50 Q50 52 30 74 L70 74 Q50 52 50 50 Q50 48 70 26 Z" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
          <!-- Golden Star-Sand in Bulbs -->
          <path d="M38 32 Q50 42 62 32 Z" fill="#fbbf24"/>
          <path d="M34 72 Q50 58 66 72 Z" fill="#fbbf24"/>
          <!-- Falling Sand Stream -->
          <line x1="50" y1="46" x2="50" y2="64" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
          <!-- Brass Side Pillars -->
          <line x1="28" y1="26" x2="28" y2="74" stroke="url(#brassGrad)" stroke-width="3"/>
          <line x1="72" y1="26" x2="72" y2="74" stroke="url(#brassGrad)" stroke-width="3"/>
        </svg>
      </div>
    `;
  }

  // 13. GREEK RUBY SIGNET RING
  static renderRing() {
    return `
      <div class="real-sym sym-ring">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="ringGold" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="30%" stop-color="#fef08a"/>
              <stop offset="60%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </radialGradient>
            <radialGradient id="rubyGlow" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#fca5a5"/>
              <stop offset="40%" stop-color="#ef4444"/>
              <stop offset="80%" stop-color="#991b1b"/>
              <stop offset="100%" stop-color="#450a0a"/>
            </radialGradient>
          </defs>
          <!-- Ring Band -->
          <circle cx="50" cy="58" r="28" fill="none" stroke="url(#ringGold)" stroke-width="8"/>
          <!-- Ring Crown Mount -->
          <polygon points="34,36 66,36 60,48 40,48" fill="url(#ringGold)" stroke="#78350f" stroke-width="1.5"/>
          <!-- Large Cabochon Ruby -->
          <ellipse cx="50" cy="34" rx="18" ry="14" fill="url(#rubyGlow)" stroke="#fef08a" stroke-width="1.8"/>
          <!-- Specular Facet -->
          <ellipse cx="45" cy="28" rx="6" ry="3" fill="#ffffff" opacity="0.8" transform="rotate(-15 45 28)"/>
        </svg>
      </div>
    `;
  }

  // 14. EMBOSSED GOLDEN CHALICE
  static renderChalice() {
    return `
      <div class="real-sym sym-chalice">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="chaliceGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="30%" stop-color="#fef08a"/>
              <stop offset="65%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <radialGradient id="wineRed" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#450a0a"/>
            </radialGradient>
          </defs>
          <!-- Ambrosia Liquid Inside -->
          <ellipse cx="50" cy="28" rx="26" ry="8" fill="url(#wineRed)"/>
          <!-- Chalice Cup -->
          <path d="M22 28 Q24 58 44 64 L44 76 L34 82 L34 88 L66 88 L66 82 L56 76 L56 64 Q76 58 78 28 Z" fill="url(#chaliceGold)" stroke="#78350f" stroke-width="2"/>
          <!-- Specular Highlight Curve -->
          <path d="M32 34 Q34 52 46 58" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6"/>
          <!-- Greek Meander Filigree on Cup -->
          <path d="M30 42 H70 M30 46 H70" stroke="#78350f" stroke-width="1.2"/>
          <!-- Jeweled Stem Knob -->
          <circle cx="50" cy="70" r="5" fill="#ef4444" stroke="#fff" stroke-width="1"/>
        </svg>
      </div>
    `;
  }

  // 15. 3D FACETED GEMSTONES (RUBY, AMETHYST, TOPAZ, EMERALD, SAPPHIRE)
  static renderRubyGem() {
    return `
      <div class="real-sym sym-gem gem-ruby">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <filter id="rubyGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#ef4444" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Octagon Brilliant Cut Face -->
          <polygon points="34,16 66,16 84,34 84,66 66,84 34,84 16,66 16,34" fill="#991b1b" stroke="#fecaca" stroke-width="1.5" filter="url(#rubyGlow)"/>
          <!-- Facet Planes -->
          <polygon points="34,16 66,16 60,32 40,32" fill="#f87171"/>
          <polygon points="66,16 84,34 68,40 60,32" fill="#ef4444"/>
          <polygon points="84,34 84,66 68,60 68,40" fill="#b91c1c"/>
          <polygon points="84,66 66,84 60,68 68,60" fill="#7f1d1d"/>
          <polygon points="66,84 34,84 40,68 60,68" fill="#450a0a"/>
          <polygon points="34,84 16,66 32,60 40,68" fill="#7f1d1d"/>
          <polygon points="16,66 16,34 32,40 32,60" fill="#b91c1c"/>
          <polygon points="16,34 34,16 40,32 32,40" fill="#ef4444"/>
          <!-- Table Center Facet -->
          <polygon points="40,32 60,32 68,40 68,60 60,68 40,68 32,60 32,40" fill="#dc2626" stroke="#fca5a5" stroke-width="1"/>
          <!-- Brilliant White Glisten Star -->
          <circle cx="44" cy="38" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `;
  }

  static renderAmethystGem() {
    return `
      <div class="real-sym sym-gem gem-amethyst">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <filter id="purpleGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#a855f7" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Teardrop Pear Cut -->
          <path d="M50 14 Q78 50 74 72 Q68 88 50 88 Q32 88 26 72 Q22 50 50 14 Z" fill="#6b21a8" stroke="#e9d5ff" stroke-width="1.5" filter="url(#purpleGlow)"/>
          <!-- Facet Rays -->
          <polygon points="50,14 42,42 50,48 58,42" fill="#c084fc"/>
          <polygon points="50,14 26,72 38,62 42,42" fill="#a855f7"/>
          <polygon points="50,14 74,72 62,62 58,42" fill="#9333ea"/>
          <polygon points="26,72 50,88 50,72 38,62" fill="#581c87"/>
          <polygon points="74,72 50,88 50,72 62,62" fill="#3b0764"/>
          <!-- Center Diamond -->
          <polygon points="50,48 58,62 50,72 42,62" fill="#d8b4fe" stroke="#fff" stroke-width="0.8"/>
          <circle cx="48" cy="40" r="2.5" fill="#fff"/>
        </svg>
      </div>
    `;
  }

  static renderTopazGem() {
    return `
      <div class="real-sym sym-gem gem-topaz">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <filter id="topazGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#eab308" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Hexagon Cut Gem -->
          <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="#a16207" stroke="#fef08a" stroke-width="1.5" filter="url(#topazGlow)"/>
          <polygon points="50,14 82,32 68,40 50,28" fill="#fde047"/>
          <polygon points="82,32 82,68 68,60 68,40" fill="#eab308"/>
          <polygon points="82,68 50,86 50,72 68,60" fill="#ca8a04"/>
          <polygon points="50,86 18,68 32,60 50,72" fill="#713f12"/>
          <polygon points="18,68 18,32 32,40 32,60" fill="#a16207"/>
          <polygon points="18,32 50,14 50,28 32,40" fill="#facc15"/>
          <!-- Table Center -->
          <polygon points="50,28 68,40 68,60 50,72 32,60 32,40" fill="#fef08a" stroke="#fff" stroke-width="1"/>
          <circle cx="44" cy="36" r="3" fill="#fff"/>
        </svg>
      </div>
    `;
  }

  static renderEmeraldGem() {
    return `
      <div class="real-sym sym-gem gem-emerald">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <filter id="emeraldGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#10b981" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Trillion Triangle Cut -->
          <polygon points="50,16 86,80 14,80" fill="#064e3b" stroke="#a7f3d0" stroke-width="1.5" filter="url(#emeraldGlow)"/>
          <polygon points="50,16 86,80 64,62 50,42" fill="#10b981"/>
          <polygon points="86,80 14,80 50,68 64,62" fill="#047857"/>
          <polygon points="14,80 50,16 50,42 36,62" fill="#34d399"/>
          <!-- Center Inverted Triangle -->
          <polygon points="50,42 64,62 36,62" fill="#6ee7b7" stroke="#fff" stroke-width="1"/>
          <circle cx="48" cy="34" r="2.5" fill="#fff"/>
        </svg>
      </div>
    `;
  }

  static renderSapphireGem() {
    return `
      <div class="real-sym sym-gem gem-sapphire">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <filter id="sapphireGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#3b82f6" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Princess Square Cut -->
          <polygon points="50,14 86,50 50,86 14,50" fill="#1e3a8a" stroke="#bfdbfe" stroke-width="1.5" filter="url(#sapphireGlow)"/>
          <!-- Facets -->
          <polygon points="50,14 86,50 68,50 50,32" fill="#60a5fa"/>
          <polygon points="86,50 50,86 50,68 68,50" fill="#2563eb"/>
          <polygon points="50,86 14,50 32,50 50,68" fill="#1d4ed8"/>
          <polygon points="14,50 50,14 50,32 32,50" fill="#93c5fd"/>
          <!-- Center Diamond Table -->
          <polygon points="50,32 68,50 50,68 32,50" fill="#3b82f6" stroke="#fff" stroke-width="1"/>
          <circle cx="44" cy="40" r="3" fill="#fff"/>
        </svg>
      </div>
    `;
  }

  // 16. ZEUS WINGED MULTIPLIER ORB (2x to 1000x)
  static renderOlympusMultiplierOrb(multiplier) {
    const val = multiplier.val || 2;
    const color = multiplier.color || '#10b981';
    return `
      <div class="real-sym sym-oly-mult">
        <svg viewBox="0 0 120 100" class="sym-svg">
          <defs>
            <radialGradient id="multCore_${val}" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="35%" stop-color="${color}"/>
              <stop offset="80%" stop-color="#090e17"/>
              <stop offset="100%" stop-color="#000000"/>
            </radialGradient>
            <linearGradient id="wingGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <filter id="multAura_${val}">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${color}" flood-opacity="0.9"/>
            </filter>
          </defs>
          <!-- Left Golden Feathered Wing -->
          <path d="M42 46 Q24 24 6 36 Q18 48 30 52 Q14 56 10 66 Q24 68 38 62" fill="url(#wingGold)" stroke="#78350f" stroke-width="1.2"/>
          <!-- Right Golden Feathered Wing -->
          <path d="M78 46 Q96 24 114 36 Q102 48 90 52 Q106 56 110 66 Q96 68 82 62" fill="url(#wingGold)" stroke="#78350f" stroke-width="1.2"/>
          <!-- Central Sphere -->
          <circle cx="60" cy="50" r="28" fill="url(#multCore_${val})" stroke="url(#wingGold)" stroke-width="2.5" filter="url(#multAura_${val})"/>
          <!-- Multiplier Text -->
          <text x="60" y="56" text-anchor="middle" font-size="${val >= 100 ? '14' : '17'}" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" fill="#ffffff" stroke="#000" stroke-width="1">${val}×</text>
        </svg>
      </div>
    `;
  }

  // ==========================================
  // RAIN SLOTS DELUXE REAL-LIFE SYMBOLS
  // ==========================================

  // 17. 3D ICE-BLUE BRILLIANT CUT DIAMOND
  static renderSlotDiamond() {
    return `
      <div class="real-sym sym-slot-diamond">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="diaAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(56, 189, 248, 0.6)"/>
              <stop offset="70%" stop-color="rgba(2, 132, 199, 0.2)"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
            <filter id="diaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#38bdf8" flood-opacity="0.9"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#diaAura)"/>
          <!-- Diamond Outline & Main Facets -->
          <polygon points="26,30 74,30 90,48 50,88 10,48" fill="#0369a1" stroke="#e0f2fe" stroke-width="1.8" filter="url(#diaGlow)"/>
          <polygon points="34,30 66,30 72,40 28,40" fill="#ffffff" opacity="0.95"/>
          <polygon points="26,30 34,30 28,40 10,48" fill="#7dd3fc"/>
          <polygon points="74,30 66,30 72,40 90,48" fill="#38bdf8"/>
          <polygon points="28,40 50,48 72,40 66,30 34,30" fill="#bae6fd"/>
          <polygon points="10,48 28,40 50,48" fill="#0284c7"/>
          <polygon points="90,48 72,40 50,48" fill="#0284c7"/>
          <!-- Pavilion Bottom Facets -->
          <polygon points="10,48 50,48 50,88" fill="#0369a1"/>
          <polygon points="90,48 50,48 50,88" fill="#075985"/>
          <polygon points="28,48 50,88 50,48" fill="#0284c7"/>
          <polygon points="72,48 50,88 50,48" fill="#38bdf8"/>
          <!-- Sparkle Glints -->
          <path d="M78 20 Q78 28 86 28 Q78 28 78 36 Q78 28 70 28 Q78 28 78 20 Z" fill="#ffffff" filter="url(#diaGlow)"/>
          <circle cx="78" cy="28" r="1.5" fill="#ffffff"/>
          <path d="M20 58 Q20 64 26 64 Q20 64 20 70 Q20 64 14 64 Q20 64 20 58 Z" fill="#ffffff"/>
        </svg>
      </div>
    `;
  }

  // 18. IMPERIAL ROYAL VEGAS CROWN
  static renderSlotCrown() {
    return this.renderCrown();
  }

  // 19. FLAMING VEGAS LUCKY TRIPLE 7 WILD
  static renderSlotWild7() {
    return `
      <div class="real-sym sym-slot-wild7">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="gold7Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="25%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#f59e0b"/>
              <stop offset="80%" stop-color="#b45309"/>
              <stop offset="100%" stop-color="#451a03"/>
            </linearGradient>
            <linearGradient id="ruby7Grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f87171"/>
              <stop offset="50%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#991b1b"/>
            </linearGradient>
            <radialGradient id="fireAura" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="40%" stop-color="#f97316"/>
              <stop offset="80%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
            <filter id="wild7Glow">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#f59e0b" flood-opacity="0.9"/>
            </filter>
          </defs>
          <!-- Background Blazing Fire Flame -->
          <path d="M50 4 Q66 24 76 46 Q86 66 74 84 Q62 96 50 96 Q38 96 26 84 Q14 66 24 46 Q34 24 50 4 Z" fill="url(#fireAura)" opacity="0.6"/>
          <path d="M30 38 Q42 16 52 28 Q44 48 30 38 Z" fill="#fef08a" opacity="0.8"/>
          <path d="M68 32 Q78 14 74 36 Q64 48 68 32 Z" fill="#fbbf24" opacity="0.8"/>
          <!-- Outer 3D Gold Beveled 7 -->
          <path d="M22 14 L78 14 L80 26 L54 74 L38 74 L60 28 L22 28 Z" fill="url(#gold7Grad)" stroke="#451a03" stroke-width="2" filter="url(#wild7Glow)"/>
          <!-- Inner Crimson Core 7 -->
          <path d="M26 18 L74 18 L76 24 L52 70 L42 70 L62 26 L26 26 Z" fill="url(#ruby7Grad)"/>
          <!-- Chrome Highlight Edge -->
          <path d="M26 18 L74 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <path d="M74 18 L52 70" stroke="#fef08a" stroke-width="1.5"/>
          <!-- Glowing Red/Gold WILD Plaque Banner -->
          <g filter="url(#wild7Glow)">
            <rect x="12" y="70" width="76" height="20" rx="4" fill="#1e1b4b" stroke="url(#gold7Grad)" stroke-width="2"/>
            <rect x="14" y="72" width="72" height="16" rx="2" fill="none" stroke="#fef08a" stroke-width="0.8"/>
            <text x="50" y="85" text-anchor="middle" font-size="13" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" fill="url(#gold7Grad)" stroke="#000" stroke-width="0.6" letter-spacing="1.5">WILD</text>
          </g>
        </svg>
      </div>
    `;
  }

  // 20. RAIN SCATTER THUNDERCLOUD
  static renderSlotRainScatter() {
    return `
      <div class="real-sym sym-slot-scatter">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="40%" stop-color="#0284c7"/>
              <stop offset="80%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
            <linearGradient id="goldScat" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="50%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
            <filter id="rainGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#00f0ff" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- Thunder Cloud Base -->
          <path d="M30 46 Q16 46 16 34 Q16 22 28 20 Q34 10 48 10 Q64 10 70 20 Q84 20 84 34 Q84 46 70 46 Z" fill="url(#cloudGrad)" stroke="#38bdf8" stroke-width="2" filter="url(#rainGlow)"/>
          <!-- Specular highlight on cloud rim -->
          <path d="M32 20 Q48 12 66 20" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8"/>
          <!-- Falling Neon Rain Droplets -->
          <line x1="28" y1="52" x2="24" y2="68" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="42" y1="50" x2="38" y2="70" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="56" y1="52" x2="52" y2="68" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="70" y1="50" x2="66" y2="70" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Twin Electric Sparks -->
          <polygon points="46,38 40,54 48,54 44,66 54,48 48,48" fill="#fef08a" stroke="#ffffff" stroke-width="1" filter="url(#rainGlow)"/>
          <!-- SCATTER Gold Banner -->
          <g filter="url(#rainGlow)">
            <rect x="8" y="72" width="84" height="20" rx="4" fill="#0f172a" stroke="url(#goldScat)" stroke-width="2"/>
            <text x="50" y="86" text-anchor="middle" font-size="12" font-family="'Arial Black', sans-serif" font-weight="900" fill="url(#goldScat)" stroke="#000" stroke-width="0.5" letter-spacing="1">SCATTER</text>
          </g>
        </svg>
      </div>
    `;
  }

  // 21. HIGH-VOLTAGE THUNDER BOLT
  static renderSlotThunderBolt() {
    return `
      <div class="real-sym sym-slot-bolt">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="30%" stop-color="#fef08a"/>
              <stop offset="60%" stop-color="#eab308"/>
              <stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
            <filter id="boltGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#eab308" flood-opacity="0.9"/>
            </filter>
          </defs>
          <polygon points="56,8 26,48 46,48 38,92 78,44 54,44" fill="url(#boltGrad)" stroke="#ffffff" stroke-width="2" filter="url(#boltGlow)"/>
          <polygon points="54,16 32,46 48,46 44,78 68,46 52,46" fill="#ffffff" opacity="0.8"/>
        </svg>
      </div>
    `;
  }

  // 22. POLISHED VEGAS LIBERTY BELL
  static renderSlotBell() {
    return this.renderBell();
  }

  // 23. 4-LEAF EMERALD LUCKY CLOVER
  static renderSlotClover() {
    return `
      <div class="real-sym sym-slot-clover">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="cloverLeaf" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#6ee7b7"/>
              <stop offset="40%" stop-color="#10b981"/>
              <stop offset="80%" stop-color="#047857"/>
              <stop offset="100%" stop-color="#022c22"/>
            </radialGradient>
            <filter id="cloverGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#10b981" flood-opacity="0.8"/>
            </filter>
          </defs>
          <!-- 4 Heart-shaped Clover Leaves -->
          <path d="M50 48 C40 26 22 30 36 14 C46 2 54 22 50 48 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M50 48 C60 26 78 30 64 14 C54 2 46 22 50 48 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M48 50 C26 40 30 22 14 36 C2 46 22 54 48 50 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M48 50 C26 60 30 78 14 64 C2 54 22 46 48 50 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M52 50 C74 40 70 22 86 36 C98 46 78 54 52 50 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M52 50 C74 60 70 78 86 64 C98 54 78 46 52 50 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M50 52 C40 74 22 70 36 86 C46 98 54 78 50 52 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <path d="M50 52 C60 74 78 70 64 86 C54 98 46 78 50 52 Z" fill="url(#cloverLeaf)" filter="url(#cloverGlow)"/>
          <!-- Veins -->
          <line x1="50" y1="50" x2="50" y2="18" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="50" y1="50" x2="20" y2="50" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="50" y1="50" x2="80" y2="50" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="50" y1="50" x2="50" y2="82" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Stem -->
          <path d="M50 52 Q56 78 68 94" stroke="#047857" stroke-width="3" fill="none" stroke-linecap="round"/>
          <circle cx="62" cy="38" r="3.5" fill="#ffffff" opacity="0.9"/>
        </svg>
      </div>
    `;
  }

  // 24. GLOSSY TWIN CHERRIES
  static renderSlotCherry() {
    return `
      <div class="real-sym sym-slot-cherry">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="cherryRed" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="20%" stop-color="#fda4af"/>
              <stop offset="50%" stop-color="#e11d48"/>
              <stop offset="85%" stop-color="#9f1239"/>
              <stop offset="100%" stop-color="#4c0519"/>
            </radialGradient>
            <filter id="cherryGlow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#e11d48" flood-opacity="0.8"/>
            </filter>
          </defs>
          <path d="M50 14 Q74 8 82 24 Q68 34 50 14 Z" fill="#15803d" stroke="#166534" stroke-width="1.5"/>
          <path d="M54 16 Q68 20 76 22" stroke="#86efac" stroke-width="1" fill="none"/>
          <path d="M50 14 Q38 34 32 60" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M50 14 Q58 38 68 64" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/>
          <circle cx="32" cy="68" r="22" fill="url(#cherryRed)" stroke="#4c0519" stroke-width="1.5" filter="url(#cherryGlow)"/>
          <ellipse cx="26" cy="58" rx="6" ry="3" fill="#ffffff" opacity="0.8" transform="rotate(-30 26 58)"/>
          <circle cx="68" cy="72" r="21" fill="url(#cherryRed)" stroke="#4c0519" stroke-width="1.5" filter="url(#cherryGlow)"/>
          <ellipse cx="62" cy="62" rx="6" ry="3" fill="#ffffff" opacity="0.8" transform="rotate(-30 62 62)"/>
        </svg>
      </div>
    `;
  }

  // ==========================================
  // REAL-LIFE CASINO PLAYING CARDS ENGINE
  // ==========================================

  static getSuitSvg(suit, size = 14) {
    const isRed = suit === '♥' || suit === '♦' || suit === 'hearts' || suit === 'diamonds';
    const color = isRed ? '#dc2626' : '#0f172a';
    let path = '';
    if (suit === '♠' || suit === 'spades') {
      path = 'M50 15 C50 15 20 46 20 62 C20 74 30 80 40 80 C47 80 50 74 50 74 C50 74 53 80 60 80 C70 80 80 74 80 62 C80 46 50 15 50 15 Z M46 72 L42 90 L58 90 L54 72 Z';
    } else if (suit === '♥' || suit === 'hearts') {
      path = 'M50 84 C50 84 15 54 15 32 C15 18 26 12 36 12 C44 12 49 18 50 18 C51 18 56 12 64 12 C74 12 85 18 85 32 C85 54 50 84 50 84 Z';
    } else if (suit === '♦' || suit === 'diamonds') {
      path = 'M50 12 L84 50 L50 88 L16 50 Z';
    } else { // ♣ clubs
      path = 'M50 14 C42 14 36 20 36 28 C36 34 40 38 44 40 C36 38 26 42 26 52 C26 62 36 68 44 66 C42 72 38 88 38 88 L62 88 C62 88 58 72 56 66 C64 68 74 62 74 52 C74 42 64 38 56 40 C60 38 64 34 64 28 C64 20 58 14 50 14 Z';
    }
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:inline-block; vertical-align:middle; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.25));"><path d="${path}" fill="${color}"/></svg>`;
  }

  static renderCardBackContent() {
    return `
      <svg viewBox="0 0 58 84" class="card-back-svg" style="width:100%; height:100%; display:block; border-radius:5px;">
        <defs>
          <linearGradient id="backRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#991b1b"/>
            <stop offset="50%" stop-color="#7f1d1d"/>
            <stop offset="100%" stop-color="#450a0a"/>
          </linearGradient>
          <linearGradient id="backGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
          <pattern id="cardLattice" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 4 L4 0 L8 4 L4 8 Z" fill="none" stroke="#f59e0b" stroke-width="0.6" opacity="0.4"/>
            <circle cx="4" cy="4" r="0.8" fill="#fef08a" opacity="0.6"/>
          </pattern>
        </defs>
        <rect x="1" y="1" width="56" height="82" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="3" y="3" width="52" height="78" rx="3" fill="url(#backRed)"/>
        <rect x="4" y="4" width="50" height="76" rx="2" fill="url(#cardLattice)"/>
        <rect x="5" y="5" width="48" height="74" rx="2" fill="none" stroke="url(#backGold)" stroke-width="1.2"/>
        <rect x="7" y="7" width="44" height="70" rx="1.5" fill="none" stroke="url(#backGold)" stroke-width="0.5" stroke-dasharray="2,2"/>
        <!-- Central Golden Shield -->
        <circle cx="29" cy="42" r="14" fill="#1e1b4b" stroke="url(#backGold)" stroke-width="1.2"/>
        <circle cx="29" cy="42" r="11" fill="none" stroke="url(#backGold)" stroke-width="0.6" stroke-dasharray="1.5,1.5"/>
        <polygon points="21,45 23,38 26,42 29,36 32,42 35,38 37,45" fill="url(#backGold)"/>
        <rect x="22" y="45" width="14" height="2.5" rx="0.5" fill="url(#backGold)"/>
      </svg>
    `;
  }

  static renderAceCenterSvg(suit, isRed) {
    const color = isRed ? '#dc2626' : '#0f172a';
    return `
      <div class="ace-center-crest">
        <svg viewBox="0 0 100 100" width="38" height="38">
          <defs>
            <radialGradient id="aceGold" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="35%" stop-color="#fef08a"/>
              <stop offset="70%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </radialGradient>
          </defs>
          <!-- Ornate Filigree Wreath -->
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#aceGold)" stroke-width="1.5" stroke-dasharray="2,3"/>
          <path d="M20 50 Q24 24 50 18 Q76 24 80 50 Q76 76 50 82 Q24 76 20 50 Z" fill="none" stroke="url(#aceGold)" stroke-width="0.8"/>
          <!-- Big Center Suit Pip -->
          <g transform="translate(18, 18) scale(0.64)">
            ${this.getSuitSvg(suit, 100)}
          </g>
          <!-- Miniature Golden Top Crown -->
          <polygon points="42,22 44,16 47,19 50,14 53,19 56,16 58,22" fill="url(#aceGold)"/>
        </svg>
      </div>
    `;
  }

  static renderCourtCardSvg(role, suit, isRed) {
    const goldGrad = `url(#courtGold)`;
    const robeColor = isRed ? '#b91c1c' : '#1e3a8a';
    const mantleColor = isRed ? '#7f1d1d' : '#0f172a';
    return `
      <div class="court-center-box">
        <svg viewBox="0 0 100 120" width="36" height="44" style="display:block; margin:0 auto;">
          <defs>
            <linearGradient id="courtGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
          </defs>
          <!-- Mirrored Upper Body (Top Half) -->
          <g>
            <rect x="15" y="10" width="70" height="48" rx="4" fill="${mantleColor}" stroke="url(#courtGold)" stroke-width="1.5"/>
            <!-- Robe chest -->
            <polygon points="30,28 70,28 64,56 36,56" fill="${robeColor}"/>
            <!-- Ermine collar -->
            <path d="M30 28 Q50 38 70 28 Q64 34 50 36 Q36 34 30 28 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
            <!-- Head & Crown -->
            <circle cx="50" cy="22" r="10" fill="#fed7aa"/>
            <polygon points="40,16 42,8 46,12 50,6 54,12 58,8 60,16" fill="url(#courtGold)"/>
            <!-- Mini Suit in Hand -->
            <g transform="translate(62, 34) scale(0.24)">
              ${this.getSuitSvg(suit, 100)}
            </g>
          </g>
          <!-- Diagonal Division Ribbon -->
          <line x1="8" y1="58" x2="92" y2="58" stroke="url(#courtGold)" stroke-width="2"/>
          <!-- Mirrored Lower Body (Bottom Half Inverted) -->
          <g transform="rotate(180 50 60)">
            <rect x="15" y="10" width="70" height="48" rx="4" fill="${mantleColor}" stroke="url(#courtGold)" stroke-width="1.5"/>
            <polygon points="30,28 70,28 64,56 36,56" fill="${robeColor}"/>
            <path d="M30 28 Q50 38 70 28 Q64 34 50 36 Q36 34 30 28 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
            <circle cx="50" cy="22" r="10" fill="#fed7aa"/>
            <polygon points="40,16 42,8 46,12 50,6 54,12 58,8 60,16" fill="url(#courtGold)"/>
            <g transform="translate(62, 34) scale(0.24)">
              ${this.getSuitSvg(suit, 100)}
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  static renderNumberCardPips(val, suit, isRed) {
    const num = parseInt(val, 10);
    const suitIcon = this.getSuitSvg(suit, 15);
    const count = isNaN(num) ? 1 : num;
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<div class="pip-item">${suitIcon}</div>`;
    }
    return html;
  }

  static renderCardFaceContent(val, suit, isRed) {
    let centerHtml = '';
    if (val === 'A') {
      centerHtml = this.renderAceCenterSvg(suit, isRed);
    } else if (val === 'K' || val === 'Q' || val === 'J') {
      centerHtml = this.renderCourtCardSvg(val, suit, isRed);
    } else {
      centerHtml = `<div class="card-pips-grid pips-${val}">${this.renderNumberCardPips(val, suit, isRed)}</div>`;
    }

    return `
      <div class="card-corner top-left">
        <span class="card-val">${val}</span>
        <span class="card-suit-pip">${this.getSuitSvg(suit, 11)}</span>
      </div>
      <div class="card-center-art">${centerHtml}</div>
      <div class="card-corner bottom-right">
        <span class="card-val">${val}</span>
        <span class="card-suit-pip">${this.getSuitSvg(suit, 11)}</span>
      </div>
    `;
  }

  static createPlayingCardElement(card, hidden = false, winning = false) {
    const cardEl = document.createElement('div');
    if (hidden || card.hidden) {
      cardEl.className = 'bj-card card-hidden';
      cardEl.innerHTML = this.renderCardBackContent();
      return cardEl;
    }

    const isRed = card.isRed !== undefined ? card.isRed : (card.suit === '♥' || card.suit === '♦');
    const suit = card.suit || '♠';
    const val = card.val || 'A';

    cardEl.className = `bj-card card-dealt ${isRed ? 'red-suit' : 'black-suit'} ${winning ? 'winning-poker-card' : ''}`;
    cardEl.innerHTML = this.renderCardFaceContent(val, suit, isRed);
    return cardEl;
  }

  // ==========================================
  // REAL-LIFE MINES ICONS
  // ==========================================

  static renderMineBomb() {
    return `
      <div class="real-sym sym-mine-bomb">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="mineMetal" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#64748b"/>
              <stop offset="35%" stop-color="#334155"/>
              <stop offset="70%" stop-color="#1e293b"/>
              <stop offset="100%" stop-color="#020617"/>
            </radialGradient>
            <radialGradient id="bombRedGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="30%" stop-color="#ff0000"/>
              <stop offset="70%" stop-color="#990000"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
            <filter id="mineGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ef4444" flood-opacity="0.9"/>
            </filter>
          </defs>
          <!-- 8 Protruding Detonator Spikes -->
          <polygon points="46,14 54,14 52,24 48,24" fill="#f59e0b" stroke="#78350f" stroke-width="0.8"/>
          <circle cx="50" cy="12" r="3" fill="#ef4444"/>
          <polygon points="46,86 54,86 52,76 48,76" fill="#f59e0b" stroke="#78350f" stroke-width="0.8"/>
          <circle cx="50" cy="88" r="3" fill="#ef4444"/>
          <polygon points="14,46 14,54 24,52 24,48" fill="#f59e0b" stroke="#78350f" stroke-width="0.8"/>
          <circle cx="12" cy="50" r="3" fill="#ef4444"/>
          <polygon points="86,46 86,54 76,52 76,48" fill="#f59e0b" stroke="#78350f" stroke-width="0.8"/>
          <circle cx="88" cy="50" r="3" fill="#ef4444"/>
          <line x1="24" y1="24" x2="32" y2="32" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
          <circle cx="22" cy="22" r="3" fill="#ef4444"/>
          <line x1="76" y1="24" x2="68" y2="32" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
          <circle cx="78" cy="22" r="3" fill="#ef4444"/>
          <line x1="24" y1="76" x2="32" y2="68" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
          <circle cx="22" cy="78" r="3" fill="#ef4444"/>
          <line x1="76" y1="76" x2="68" y2="68" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
          <circle cx="78" cy="78" r="3" fill="#ef4444"/>
          <!-- Naval Mine Sphere -->
          <circle cx="50" cy="50" r="32" fill="url(#mineMetal)" stroke="#475569" stroke-width="1.8"/>
          <!-- Riveted Seam Band -->
          <ellipse cx="50" cy="50" rx="32" ry="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,5"/>
          <!-- Specular Light Reflection -->
          <ellipse cx="40" cy="34" rx="8" ry="4" fill="#ffffff" opacity="0.6" transform="rotate(-30 40 34)"/>
          <!-- Center Pulsing Danger LED -->
          <circle cx="50" cy="50" r="8" fill="url(#bombRedGlow)" filter="url(#mineGlow)"/>
          <circle cx="50" cy="50" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `;
  }

  static renderMineGem() {
    return `
      <div class="real-sym sym-mine-gem">
        <svg viewBox="0 0 100 100" class="sym-svg">
          <defs>
            <radialGradient id="gemEmeraldGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="25%" stop-color="#6ee7b7"/>
              <stop offset="55%" stop-color="#10b981"/>
              <stop offset="85%" stop-color="#047857"/>
              <stop offset="100%" stop-color="#022c22"/>
            </radialGradient>
            <filter id="mineGemGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#10b981" flood-opacity="0.9"/>
            </filter>
          </defs>
          <polygon points="24,34 76,34 90,52 50,88 10,52" fill="#047857" stroke="#a7f3d0" stroke-width="1.8" filter="url(#mineGemGlow)"/>
          <polygon points="34,34 66,34 72,44 28,44" fill="#a7f3d0"/>
          <polygon points="24,34 34,34 28,44 10,52" fill="#34d399"/>
          <polygon points="76,34 66,34 72,44 90,52" fill="#059669"/>
          <polygon points="28,44 50,52 72,44 66,34 34,34" fill="#6ee7b7"/>
          <polygon points="10,52 28,44 50,52" fill="#10b981"/>
          <polygon points="90,52 72,44 50,52" fill="#047857"/>
          <polygon points="10,52 50,52 50,88" fill="#059669"/>
          <polygon points="90,52 50,52 50,88" fill="#065f46"/>
          <path d="M78 26 Q78 34 86 34 Q78 34 78 42 Q78 34 70 34 Q78 34 78 26 Z" fill="#ffffff" filter="url(#mineGemGlow)"/>
          <circle cx="78" cy="34" r="1.5" fill="#ffffff"/>
        </svg>
      </div>
    `;
  }

  // ==========================================
  // NEXT-GEN 3D GAME POSTER VECTOR GRAPHICS
  // ==========================================
  static renderPosterVisual(gameId) {
    switch (gameId) {
      case 'blackjack':
        return `
          <div class="poster-svg-art poster-blackjack">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="bjCardGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="100%" stop-color="#e2e8f0"/>
                </linearGradient>
                <linearGradient id="bjGoldBorder" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fef08a"/>
                  <stop offset="50%" stop-color="#eab308"/>
                  <stop offset="100%" stop-color="#854d0e"/>
                </linearGradient>
                <filter id="bjDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.7"/>
                </filter>
              </defs>
              <!-- Card 1: King of Diamonds (Tilted Left) -->
              <g transform="translate(38, 55) rotate(-14) translate(-30, -42)" filter="url(#bjDropShadow)">
                <rect x="0" y="0" width="60" height="84" rx="6" fill="url(#bjCardGrad)" stroke="url(#bjGoldBorder)" stroke-width="1.8"/>
                <text x="7" y="16" font-family="Inter, sans-serif" font-weight="900" font-size="12" fill="#e11d48">K</text>
                <polygon points="10,21 14,26 10,31 6,26" fill="#e11d48"/>
                <!-- Miniature Royal King Silhouette -->
                <circle cx="30" cy="38" r="10" fill="#f87171" opacity="0.3"/>
                <path d="M22 48 L38 48 L36 34 L32 38 L30 32 L28 38 L24 34 Z" fill="#e11d48"/>
                <polygon points="30,54 36,62 30,70 24,62" fill="#e11d48"/>
              </g>
              <!-- Card 2: Ace of Spades (Tilted Right) -->
              <g transform="translate(95, 52) rotate(10) translate(-30, -42)" filter="url(#bjDropShadow)">
                <rect x="0" y="0" width="60" height="84" rx="6" fill="url(#bjCardGrad)" stroke="url(#bjGoldBorder)" stroke-width="2"/>
                <text x="7" y="16" font-family="Inter, sans-serif" font-weight="900" font-size="13" fill="#0f172a">A</text>
                <path d="M10 20 C10 22 7 24 7 26 C7 28 9 29 10 29 C10 30 9.5 31 9 32 L11 32 C10.5 31 10 30 10 29 C11 29 13 28 13 26 C13 24 10 22 10 20 Z" fill="#0f172a"/>
                <!-- Ornate Center Ace -->
                <path d="M30 32 C30 39 18 48 18 55 C18 61 24 64 28 63 C29 67 27 71 25 73 L35 73 C33 71 31 67 32 63 C36 64 42 61 42 55 C42 48 30 39 30 32 Z" fill="#0f172a"/>
                <circle cx="30" cy="50" r="3" fill="#eab308"/>
              </g>
              <!-- 3D Gold Blackjack Badge -->
              <g transform="translate(80, 92)">
                <rect x="-35" y="-10" width="70" height="20" rx="10" fill="#0f172a" stroke="#eab308" stroke-width="1.5"/>
                <text x="0" y="4" font-family="Outfit, sans-serif" font-weight="900" font-size="10" fill="#fef08a" text-anchor="middle">BLACKJACK 3:2</text>
              </g>
            </svg>
          </div>
        `;
      case 'poker':
        return `
          <div class="poster-svg-art poster-poker">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="pokerFelt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#064e3b"/>
                  <stop offset="100%" stop-color="#022c22"/>
                </linearGradient>
                <linearGradient id="pokerGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fde047"/>
                  <stop offset="100%" stop-color="#b45309"/>
                </linearGradient>
              </defs>
              <!-- Fan of 3 Cards: A♠ K♠ Q♠ -->
              <g transform="translate(48, 52) rotate(-18) translate(-25, -36)">
                <rect x="0" y="0" width="50" height="72" rx="5" fill="#f8fafc" stroke="#334155" stroke-width="1.2"/>
                <text x="6" y="14" font-family="Inter, sans-serif" font-weight="900" font-size="11" fill="#0f172a">A♠</text>
              </g>
              <g transform="translate(80, 48) rotate(0) translate(-25, -36)">
                <rect x="0" y="0" width="50" height="72" rx="5" fill="#f8fafc" stroke="#334155" stroke-width="1.2"/>
                <text x="6" y="14" font-family="Inter, sans-serif" font-weight="900" font-size="11" fill="#0f172a">K♠</text>
                <polygon points="25,25 32,38 18,38" fill="#eab308"/>
              </g>
              <g transform="translate(112, 52) rotate(18) translate(-25, -36)">
                <rect x="0" y="0" width="50" height="72" rx="5" fill="#f8fafc" stroke="#334155" stroke-width="1.2"/>
                <text x="6" y="14" font-family="Inter, sans-serif" font-weight="900" font-size="11" fill="#0f172a">Q♠</text>
              </g>
              <!-- Golden Dealer Button -->
              <circle cx="125" cy="80" r="14" fill="url(#pokerGold)" stroke="#ffffff" stroke-width="1.5"/>
              <text x="125" y="84" font-family="Inter, sans-serif" font-weight="900" font-size="8" fill="#451a03" text-anchor="middle">DEALER</text>
            </svg>
          </div>
        `;
      case 'roulette':
        return `
          <div class="poster-svg-art poster-roulette">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <radialGradient id="roulRim" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stop-color="#451a03"/>
                  <stop offset="88%" stop-color="#b45309"/>
                  <stop offset="96%" stop-color="#fde047"/>
                  <stop offset="100%" stop-color="#1e293b"/>
                </radialGradient>
              </defs>
              <g transform="translate(80, 52)">
                <!-- Outer Mahogany Rim -->
                <circle cx="0" cy="0" r="44" fill="url(#roulRim)"/>
                <!-- Number Track Wheel -->
                <circle cx="0" cy="0" r="35" fill="#0f172a" stroke="#d97706" stroke-width="1.5"/>
                <!-- Segments -->
                <path d="M0 -35 L10 -25 L-10 -25 Z" fill="#059669"/>
                <path d="M-25 -25 L-20 -15 L-30 -15 Z" fill="#dc2626"/>
                <path d="M25 -25 L20 -15 L30 -15 Z" fill="#0f172a"/>
                <path d="M-35 0 L-25 5 L-25 -5 Z" fill="#dc2626"/>
                <path d="M35 0 L25 5 L25 -5 Z" fill="#0f172a"/>
                <path d="M-25 25 L-20 15 L-30 15 Z" fill="#dc2626"/>
                <path d="M25 25 L20 15 L30 15 Z" fill="#0f172a"/>
                <path d="M0 35 L10 25 L-10 25 Z" fill="#dc2626"/>
                <!-- Spindle Turret -->
                <circle cx="0" cy="0" r="16" fill="#fde047" stroke="#78350f" stroke-width="1.5"/>
                <circle cx="0" cy="0" r="7" fill="#b45309"/>
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#451a03" stroke-width="2"/>
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#451a03" stroke-width="2"/>
                <!-- Ivory Ball -->
                <circle cx="16" cy="-24" r="4.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
              </g>
            </svg>
          </div>
        `;
      case 'baccarat':
        return `
          <div class="poster-svg-art poster-baccarat">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="bacGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fef08a"/>
                  <stop offset="50%" stop-color="#eab308"/>
                  <stop offset="100%" stop-color="#9a3412"/>
                </linearGradient>
              </defs>
              <g transform="translate(60, 48) rotate(-8)">
                <rect x="-22" y="-32" width="44" height="64" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
                <text x="-16" y="-18" font-family="Inter, sans-serif" font-weight="900" font-size="10" fill="#dc2626">9♥</text>
                <polygon points="0,-10 6,0 -6,0" fill="#dc2626"/>
              </g>
              <g transform="translate(100, 48) rotate(8)">
                <rect x="-22" y="-32" width="44" height="64" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
                <text x="-16" y="-18" font-family="Inter, sans-serif" font-weight="900" font-size="10" fill="#0f172a">K♠</text>
                <polygon points="0,-10 6,0 -6,0" fill="#0f172a"/>
              </g>
              <!-- Golden Imperial Dragon Seal -->
              <g transform="translate(80, 80)">
                <circle cx="0" cy="0" r="16" fill="url(#bacGold)" stroke="#ffffff" stroke-width="1.5"/>
                <text x="0" y="4" font-family="Inter, sans-serif" font-weight="900" font-size="11" fill="#451a03" text-anchor="middle">龍 9</text>
              </g>
            </svg>
          </div>
        `;
      case 'plinko':
        return `
          <div class="poster-svg-art poster-plinko">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="plkGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#00f0ff"/>
                  <stop offset="100%" stop-color="#a855f7"/>
                </linearGradient>
                <filter id="plkBallGlow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <!-- Pegs Grid in Pyramid -->
              <g fill="#94a3b8">
                <circle cx="80" cy="20" r="2.5" fill="#f8fafc"/>
                <circle cx="68" cy="34" r="2.5"/><circle cx="92" cy="34" r="2.5"/>
                <circle cx="56" cy="48" r="2.5"/><circle cx="80" cy="48" r="2.5"/><circle cx="104" cy="48" r="2.5"/>
                <circle cx="44" cy="62" r="2.5"/><circle cx="68" cy="62" r="2.5"/><circle cx="92" cy="62" r="2.5"/><circle cx="116" cy="62" r="2.5"/>
                <circle cx="32" cy="76" r="2.5"/><circle cx="56" cy="76" r="2.5"/><circle cx="80" cy="76" r="2.5"/><circle cx="104" cy="76" r="2.5"/><circle cx="128" cy="76" r="2.5"/>
              </g>
              <!-- Bouncing Glowing Plasma Balls -->
              <circle cx="74" cy="26" r="6" fill="#00f0ff" filter="url(#plkBallGlow)"/>
              <circle cx="96" cy="52" r="6.5" fill="#ff007a" filter="url(#plkBallGlow)"/>
              <circle cx="50" cy="68" r="5.5" fill="#a855f7" filter="url(#plkBallGlow)"/>
              <!-- Bottom 1000x Multiplier Buckets -->
              <rect x="24" y="88" width="18" height="12" rx="3" fill="#ef4444"/>
              <text x="33" y="97" font-family="Inter, sans-serif" font-weight="900" font-size="7" fill="#ffffff" text-anchor="middle">1000x</text>
              <rect x="71" y="88" width="18" height="12" rx="3" fill="#eab308"/>
              <text x="80" y="97" font-family="Inter, sans-serif" font-weight="900" font-size="7" fill="#0f172a" text-anchor="middle">0.2x</text>
              <rect x="118" y="88" width="18" height="12" rx="3" fill="#ef4444"/>
              <text x="127" y="97" font-family="Inter, sans-serif" font-weight="900" font-size="7" fill="#ffffff" text-anchor="middle">1000x</text>
            </svg>
          </div>
        `;
      case 'crash':
        return `
          <div class="poster-svg-art poster-crash">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="crashCurve" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.2"/>
                  <stop offset="80%" stop-color="#00f0ff"/>
                  <stop offset="100%" stop-color="#00e701"/>
                </linearGradient>
                <linearGradient id="jetGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#f8fafc"/>
                  <stop offset="100%" stop-color="#475569"/>
                </linearGradient>
              </defs>
              <!-- Ascending Grid Curve -->
              <path d="M20 90 Q 70 85, 105 45" fill="none" stroke="url(#crashCurve)" stroke-width="4" stroke-linecap="round"/>
              <!-- Jet Plume -->
              <ellipse cx="100" cy="50" rx="9" ry="4" fill="#ff7700" transform="rotate(-40 100 50)"/>
              <ellipse cx="98" cy="52" rx="6" ry="2.5" fill="#ffe600" transform="rotate(-40 98 52)"/>
              <!-- Supersonic Jet Model -->
              <g transform="translate(112, 38) rotate(-40)">
                <!-- Wings -->
                <polygon points="0,0 -16,-12 -8,0 -16,12" fill="#64748b"/>
                <!-- Fuselage -->
                <polygon points="16,0 -12,-6 -14,0 -12,6" fill="url(#jetGrad)"/>
                <!-- Cockpit Canopy -->
                <ellipse cx="2" cy="0" rx="6" ry="2.5" fill="#00f0ff"/>
              </g>
              <g transform="translate(42, 35)">
                <text x="0" y="0" font-family="Outfit, sans-serif" font-weight="900" font-size="16" fill="#00e701">14.82×</text>
              </g>
            </svg>
          </div>
        `;
      case 'mines':
        return `
          <div class="poster-svg-art poster-mines">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <!-- 3D Emerald Gem (Left) -->
              <g transform="translate(48, 52) scale(0.65) translate(-50, -50)">
                <polygon points="50,12 85,38 72,88 28,88 15,38" fill="#10b981"/>
                <polygon points="50,12 34,34 66,34" fill="#a7f3d0"/>
                <polygon points="34,34 15,38 28,44 50,52" fill="#34d399"/>
                <polygon points="66,34 85,38 72,44 50,52" fill="#059669"/>
                <polygon points="28,44 50,52 50,88 28,88" fill="#047857"/>
                <polygon points="72,44 50,52 50,88 72,88" fill="#065f46"/>
              </g>
              <!-- 3D Naval Mine with Detonators (Right) -->
              <g transform="translate(110, 52) scale(0.65) translate(-50, -50)">
                <circle cx="50" cy="50" r="32" fill="#1e293b" stroke="#475569" stroke-width="2.5"/>
                <!-- Spikes -->
                <line x1="50" y1="18" x2="50" y2="8" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="50" y1="82" x2="50" y2="92" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="18" y1="50" x2="8" y2="50" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="82" y1="50" x2="92" y2="50" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="27" y1="27" x2="19" y2="19" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="73" y1="27" x2="81" y2="19" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="27" y1="73" x2="19" y2="81" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <line x1="73" y1="73" x2="81" y2="81" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
                <!-- Pulsing Core LED -->
                <circle cx="50" cy="50" r="9" fill="#ef4444"/>
                <circle cx="50" cy="50" r="4" fill="#ffffff"/>
              </g>
            </svg>
          </div>
        `;
      case 'dice':
        return `
          <div class="poster-svg-art poster-dice">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="diceCyan" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="100%" stop-color="#0284c7"/>
                </linearGradient>
                <linearGradient id="dicePurple" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#c084fc"/>
                  <stop offset="100%" stop-color="#7e22ce"/>
                </linearGradient>
              </defs>
              <!-- Die 1: Isometric View Left -->
              <g transform="translate(54, 56) rotate(-15)">
                <!-- Top Face -->
                <polygon points="0,-18 20,-7 0,4 -20,-7" fill="#7dd3fc"/>
                <!-- Left Face -->
                <polygon points="-20,-7 0,4 0,26 -20,15" fill="#0284c7"/>
                <!-- Right Face -->
                <polygon points="0,4 20,-7 20,15 0,26" fill="#0369a1"/>
                <!-- Pips -->
                <circle cx="0" cy="-7" r="2.5" fill="#ffffff"/>
                <circle cx="-10" cy="7" r="2" fill="#ffffff"/>
                <circle cx="-10" cy="18" r="2" fill="#ffffff"/>
                <circle cx="10" cy="7" r="2" fill="#ffffff"/>
                <circle cx="10" cy="18" r="2" fill="#ffffff"/>
              </g>
              <!-- Die 2: Isometric View Right -->
              <g transform="translate(106, 50) rotate(20)">
                <polygon points="0,-18 20,-7 0,4 -20,-7" fill="#e9d5ff"/>
                <polygon points="-20,-7 0,4 0,26 -20,15" fill="#a855f7"/>
                <polygon points="0,4 20,-7 20,15 0,26" fill="#7e22ce"/>
                <circle cx="-6" cy="-10" r="2.2" fill="#ffffff"/>
                <circle cx="6" cy="-4" r="2.2" fill="#ffffff"/>
                <circle cx="-10" cy="12" r="2.2" fill="#ffffff"/>
                <circle cx="10" cy="12" r="2.2" fill="#ffffff"/>
              </g>
            </svg>
          </div>
        `;
      case 'limbo':
        return `
          <div class="poster-svg-art poster-limbo">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <radialGradient id="limboVortex" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#f59e0b"/>
                  <stop offset="50%" stop-color="#ef4444"/>
                  <stop offset="100%" stop-color="#1e1b4b"/>
                </radialGradient>
              </defs>
              <!-- Hyperspace Vortex -->
              <circle cx="80" cy="55" r="42" fill="url(#limboVortex)" opacity="0.35"/>
              <ellipse cx="80" cy="55" rx="34" ry="12" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 3"/>
              <!-- Ascending Moon Rocket -->
              <g transform="translate(80, 50) rotate(15)">
                <polygon points="0,-24 9,8 -9,8" fill="#f8fafc"/>
                <polygon points="0,-24 4,-6 -4,-6" fill="#ef4444"/>
                <polygon points="-9,8 -14,14 -7,10" fill="#3b82f6"/>
                <polygon points="9,8 14,14 7,10" fill="#3b82f6"/>
                <circle cx="0" cy="-2" r="3.5" fill="#38bdf8"/>
                <!-- Flame -->
                <polygon points="0,8 4,18 -4,18" fill="#eab308"/>
              </g>
              <text x="80" y="94" font-family="Outfit, sans-serif" font-weight="900" font-size="12" fill="#fde047" text-anchor="middle">∞ 1,000,000×</text>
            </svg>
          </div>
        `;
      case 'hilo':
        return `
          <div class="poster-svg-art poster-hilo">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <!-- Center Card -->
              <g transform="translate(80, 52)">
                <rect x="-24" y="-35" width="48" height="70" rx="5" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
                <text x="-18" y="-20" font-family="Inter, sans-serif" font-weight="900" font-size="11" fill="#dc2626">7♥</text>
                <text x="0" y="8" font-family="Inter, sans-serif" font-weight="900" font-size="20" fill="#dc2626" text-anchor="middle">♥</text>
              </g>
              <!-- HIGHER Green Arrow (Left) -->
              <g transform="translate(36, 52)">
                <polygon points="0,-16 14,0 5,0 5,16 -5,16 -5,0 -14,0" fill="#00e701"/>
                <text x="0" y="27" font-family="Outfit, sans-serif" font-weight="900" font-size="8" fill="#00e701" text-anchor="middle">HIGHER</text>
              </g>
              <!-- LOWER Red Arrow (Right) -->
              <g transform="translate(124, 52)">
                <polygon points="0,16 14,0 5,0 5,-16 -5,-16 -5,0 -14,0" fill="#ef4444"/>
                <text x="0" y="-19" font-family="Outfit, sans-serif" font-weight="900" font-size="8" fill="#ef4444" text-anchor="middle">LOWER</text>
              </g>
            </svg>
          </div>
        `;
      case 'lightning':
        return `
          <div class="poster-svg-art poster-lightning">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <!-- Tiki Center Mask scaled -->
              <g transform="translate(56, 52) scale(0.7) translate(-50, -50)">
                <path d="M25 15 L75 15 L70 85 L30 85 Z" fill="#78350f" stroke="#fbbf24" stroke-width="2.5"/>
                <path d="M30 25 L45 25 L40 38 L30 35 Z" fill="#f59e0b"/>
                <path d="M70 25 L55 25 L60 38 L70 35 Z" fill="#f59e0b"/>
                <ellipse cx="38" cy="30" rx="3.5" ry="5.5" fill="#fef08a"/>
                <ellipse cx="62" cy="30" rx="3.5" ry="5.5" fill="#fef08a"/>
                <polygon points="50,40 43,55 57,55" fill="#d97706"/>
                <path d="M34 65 L66 65 L62 76 L38 76 Z" fill="#451a03"/>
                <polygon points="38,65 42,70 46,65 50,70 54,65 58,70 62,65" fill="#ffffff"/>
              </g>
              <!-- Golden Lightning Orb (Right) -->
              <g transform="translate(112, 50)">
                <circle cx="0" cy="0" r="22" fill="#eab308" stroke="#fef08a" stroke-width="2"/>
                <circle cx="0" cy="0" r="18" fill="#b45309"/>
                <path d="M2 -14 L-6 0 L0 0 L-2 14 L6 0 L0 0 Z" fill="#fef08a"/>
                <text x="0" y="27" font-family="Outfit, sans-serif" font-weight="900" font-size="9" fill="#fde047" text-anchor="middle">GRAND $10K</text>
              </g>
            </svg>
          </div>
        `;
      case 'olympus':
        return `
          <div class="poster-svg-art poster-olympus">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <!-- Zeus Scatter Head Silhouette (Left) -->
              <g transform="translate(52, 52) scale(0.7) translate(-50, -50)">
                <ellipse cx="50" cy="46" rx="22" ry="26" fill="#f8fafc"/>
                <!-- Zeus Golden Crown -->
                <path d="M28 26 L50 14 L72 26 L66 32 L34 32 Z" fill="#eab308"/>
                <!-- Flowing White Beard -->
                <path d="M30 46 Q24 78 50 86 Q76 78 70 46 Z" fill="#e2e8f0"/>
                <!-- Lightning Eyes -->
                <circle cx="42" cy="42" r="3.5" fill="#00f0ff"/>
                <circle cx="58" cy="42" r="3.5" fill="#00f0ff"/>
              </g>
              <!-- Winged 1000x Multiplier Orb (Right) -->
              <g transform="translate(112, 50)">
                <!-- Wings -->
                <path d="M-10 0 C-22 -14 -28 -4 -16 6 Z" fill="#eab308"/>
                <path d="M10 0 C22 -14 28 -4 16 6 Z" fill="#eab308"/>
                <!-- Orb -->
                <circle cx="0" cy="0" r="17" fill="#7e22ce" stroke="#eab308" stroke-width="2"/>
                <text x="0" y="4" font-family="Outfit, sans-serif" font-weight="900" font-size="11" fill="#fef08a" text-anchor="middle">1000×</text>
              </g>
            </svg>
          </div>
        `;
      case 'slots':
        return `
          <div class="poster-svg-art poster-slots">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <!-- Imperial Crown Center -->
              <g transform="translate(62, 50) scale(0.75) translate(-50, -50)">
                <path d="M15 70 L85 70 L80 40 L65 52 L50 25 L35 52 L20 40 Z" fill="#eab308" stroke="#fef08a" stroke-width="2"/>
                <circle cx="50" cy="25" r="4.5" fill="#ef4444"/>
                <circle cx="20" cy="40" r="3.5" fill="#3b82f6"/>
                <circle cx="80" cy="40" r="3.5" fill="#3b82f6"/>
                <rect x="20" y="70" width="60" height="8" rx="2" fill="#b45309"/>
              </g>
              <!-- Flaming 7 Wild (Right) -->
              <g transform="translate(114, 52)">
                <path d="M-14 -20 L16 -20 L4 18 L-6 18 L4 -10 L-14 -10 Z" fill="#ef4444" stroke="#fde047" stroke-width="2"/>
                <text x="0" y="27" font-family="Outfit, sans-serif" font-weight="900" font-size="8" fill="#fde047" text-anchor="middle">10 LINES</text>
              </g>
            </svg>
          </div>
        `;
      case 'cases':
        return `
          <div class="poster-svg-art poster-cases">
            <svg viewBox="0 0 160 110" class="poster-vector">
              <defs>
                <linearGradient id="caseBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#334155"/>
                  <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
                <linearGradient id="bladeGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fde047"/>
                  <stop offset="100%" stop-color="#b45309"/>
                </linearGradient>
              </defs>
              <!-- Heavy Military Weapon Crate -->
              <g transform="translate(80, 55)">
                <rect x="-42" y="-24" width="84" height="48" rx="6" fill="url(#caseBody)" stroke="#eab308" stroke-width="2"/>
                <!-- Reinforced Corners -->
                <rect x="-42" y="-24" width="10" height="10" fill="#eab308"/>
                <rect x="32" y="-24" width="10" height="10" fill="#eab308"/>
                <rect x="-42" y="14" width="10" height="10" fill="#eab308"/>
                <rect x="32" y="14" width="10" height="10" fill="#eab308"/>
                <!-- Golden Beam Cracking Open -->
                <rect x="-40" y="-2" width="80" height="4" fill="#fef08a"/>
                <!-- Karambit Blade Silhouette -->
                <path d="M-18 -8 Q10 -14 26 2 Q8 0 -4 4 Z" fill="url(#bladeGold)"/>
              </g>
            </svg>
          </div>
        `;
      default:
        return `<div class="poster-fallback-art">🎰</div>`;
    }
  }

  // ==========================================
  // REAL-LIFE 3D CASINO CHIP RENDERER
  // ==========================================
  static renderRealCasinoChip(val, isSelected = false, size = 44) {
    const v = parseInt(val, 10) || 1;
    let mainColor = '#ffffff';
    let stripeColor = '#0284c7';
    let textColor = '#0f172a';
    let ringColor = '#ca8a04';
    let label = '$' + v;

    if (v === 1) {
      mainColor = '#f8fafc';
      stripeColor = '#0ea5e9';
      textColor = '#0369a1';
      ringColor = '#38bdf8';
    } else if (v === 5) {
      mainColor = '#dc2626';
      stripeColor = '#ffffff';
      textColor = '#ffffff';
      ringColor = '#fca5a5';
    } else if (v === 10) {
      mainColor = '#2563eb';
      stripeColor = '#fbbf24';
      textColor = '#ffffff';
      ringColor = '#93c5fd';
    } else if (v === 25) {
      mainColor = '#16a34a';
      stripeColor = '#fef08a';
      textColor = '#ffffff';
      ringColor = '#86efac';
    } else if (v === 50) {
      mainColor = '#ea580c';
      stripeColor = '#ffffff';
      textColor = '#ffffff';
      ringColor = '#fdba74';
    } else if (v === 100) {
      mainColor = '#18181b';
      stripeColor = '#f59e0b';
      textColor = '#fef08a';
      ringColor = '#eab308';
    } else if (v === 500) {
      mainColor = '#7e22ce';
      stripeColor = '#f472b6';
      textColor = '#ffffff';
      ringColor = '#d8b4fe';
    } else if (v >= 1000) {
      mainColor = '#b45309';
      stripeColor = '#00f0ff';
      textColor = '#fef08a';
      ringColor = '#fde047';
      label = '$' + (v >= 1000 ? (v / 1000) + 'K' : v);
    }

    const stripes = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg =>
      `<rect x="47" y="3" width="6" height="11" rx="1.5" fill="${stripeColor}" stroke="rgba(0,0,0,0.3)" stroke-width="0.8" transform="rotate(${deg} 50 50)"/>`
    ).join('');

    return `
      <div class="casino-3d-chip ${isSelected ? 'selected' : ''}" data-val="${v}" style="width: ${size}px; height: ${size}px;">
        <svg viewBox="0 0 100 100" class="chip-svg">
          <defs>
            <radialGradient id="chipLight_${v}" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
              <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.45"/>
            </radialGradient>
            <linearGradient id="goldFoil_${v}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#ca8a04"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <filter id="chipDropShadow_${v}" x="-25%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.7"/>
            </filter>
          </defs>
          <g filter="url(#chipDropShadow_${v})">
            <!-- Clay Base Circle -->
            <circle cx="50" cy="50" r="46" fill="${mainColor}" stroke="#0f172a" stroke-width="1.8"/>
            <!-- 12 Alternating Edge Inserts -->
            ${stripes}
            <!-- 3D Bevel Lighting Spherical Overlay -->
            <circle cx="50" cy="50" r="46" fill="url(#chipLight_${v})"/>
            <!-- Outer Gold Stamped Ring -->
            <circle cx="50" cy="50" r="32" fill="none" stroke="url(#goldFoil_${v})" stroke-width="2.5"/>
            <circle cx="50" cy="50" r="28" fill="none" stroke="${ringColor}" stroke-width="1" stroke-dasharray="2.5 2"/>
            <!-- Center Denomination Inlay -->
            <circle cx="50" cy="50" r="25" fill="${v === 1 ? '#e2e8f0' : (v === 100 ? '#09090b' : mainColor)}" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>
            <circle cx="50" cy="50" r="25" fill="url(#chipLight_${v})"/>
            <!-- Value Text -->
            <text x="50" y="55" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="${label.length > 3 ? '13' : '15'}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" style="letter-spacing: -0.5px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.7));">${label}</text>
          </g>
        </svg>
      </div>
    `;
  }

  // Chip Stack Display for Active Bets
  static renderChipStack(amount) {
    if (!amount || amount <= 0) return '';
    let rem = amount;
    const chips = [];
    const denoms = [1000, 500, 100, 50, 25, 10, 5, 1];
    for (const d of denoms) {
      while (rem >= d && chips.length < 5) {
        chips.push(d);
        rem -= d;
      }
    }
    if (chips.length === 0) chips.push(1);

    return `
      <div class="table-chip-stack-wrap">
        <div class="table-chip-stack">
          ${chips.map((val, idx) => `
            <div class="stacked-chip-layer" style="transform: translateY(-${idx * 6}px) scale(0.92); z-index: ${idx + 1};">
              ${this.renderRealCasinoChip(val, false, 36)}
            </div>
          `).join('')}
        </div>
        <div class="chip-stack-total-pill">$${amount.toFixed(2)}</div>
      </div>
    `;
  }

  // 3D Casino Dealing Shoe
  static renderCardShoe(remainingDecks = 6, cardsLeft = 312) {
    return `
      <div class="vegas-card-shoe" title="6-Deck Shuffled Casino Shoe">
        <svg viewBox="0 0 100 65" class="shoe-svg">
          <defs>
            <linearGradient id="shoeWood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#451a03"/>
              <stop offset="40%" stop-color="#78350f"/>
              <stop offset="80%" stop-color="#451a03"/>
              <stop offset="100%" stop-color="#1c0e07"/>
            </linearGradient>
            <linearGradient id="shoeAcrylic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(56, 189, 248, 0.4)"/>
              <stop offset="60%" stop-color="rgba(14, 165, 233, 0.15)"/>
              <stop offset="100%" stop-color="rgba(2, 132, 199, 0.3)"/>
            </linearGradient>
          </defs>
          <!-- Wooden Base Wedge -->
          <polygon points="5,55 95,55 88,18 20,18" fill="url(#shoeWood)" stroke="#1c0e07" stroke-width="1.5"/>
          <!-- Acrylic Clear Front Plate -->
          <polygon points="20,18 88,18 80,48 24,48" fill="url(#shoeAcrylic)" stroke="#38bdf8" stroke-width="1"/>
          <!-- Cards Stack Inside -->
          <rect x="26" y="22" width="50" height="22" rx="2" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
          <line x1="28" y1="26" x2="74" y2="26" stroke="#e2e8f0" stroke-width="1"/>
          <line x1="28" y1="30" x2="74" y2="30" stroke="#e2e8f0" stroke-width="1"/>
          <line x1="28" y1="34" x2="74" y2="34" stroke="#e2e8f0" stroke-width="1"/>
          <!-- Red Plastic Cut Card -->
          <polygon points="74,16 78,16 74,48 70,48" fill="#dc2626" stroke="#991b1b" stroke-width="0.8"/>
          <!-- Steel Roller -->
          <rect x="78" y="24" width="8" height="24" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
          <!-- Gold Plaque -->
          <rect x="30" y="52" width="40" height="10" rx="2" fill="#f59e0b" stroke="#78350f" stroke-width="0.8"/>
          <text x="50" y="59" font-family="'Outfit', sans-serif" font-weight="900" font-size="6.5" fill="#451a03" text-anchor="middle">SHOE: ${cardsLeft}</text>
        </svg>
      </div>
    `;
  }

  // Realistic Poker Community Card Slot Placeholder with Gold Leaf Filigree
  static renderCardSlotPlaceholder(label, suitSymbol = '♠') {
    return `
      <div class="lux-card-slot">
        <div class="slot-inner-border">
          <span class="slot-suit-watermark">${suitSymbol}</span>
          <span class="slot-label-gold">${label}</span>
          <div class="slot-corner-filigree top-left"></div>
          <div class="slot-corner-filigree bottom-right"></div>
        </div>
      </div>
    `;
  }

  // Full Majestic Zeus Figure for Gates of Olympus
  static renderZeusFullFigure() {
    return `
      <div class="zeus-olympus-figure">
        <svg viewBox="0 0 140 180" class="zeus-svg">
          <defs>
            <radialGradient id="zeusEyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="40%" stop-color="#00f0ff"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
            <linearGradient id="zeusArmorGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="30%" stop-color="#fbbf24"/>
              <stop offset="70%" stop-color="#d97706"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <linearGradient id="zeusTogaWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="60%" stop-color="#e2e8f0"/>
              <stop offset="100%" stop-color="#94a3b8"/>
            </linearGradient>
            <radialGradient id="lightningBoltGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="50%" stop-color="#00f0ff"/>
              <stop offset="100%" stop-color="#3b82f6"/>
            </radialGradient>
            <filter id="zeusGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#00f0ff" flood-opacity="0.8"/>
            </filter>
          </defs>

          <!-- Electric Aura Wings Background -->
          <g filter="url(#zeusGlowFilter)" opacity="0.6">
            <path d="M70,30 C30,10 10,50 15,110 C25,75 50,60 70,65 Z" fill="#00f0ff" opacity="0.3"/>
            <path d="M70,30 C110,10 130,50 125,110 C115,75 90,60 70,65 Z" fill="#00f0ff" opacity="0.3"/>
          </g>

          <!-- Flowing White Cape / Toga -->
          <path d="M40,55 Q10,100 20,165 Q70,180 120,165 Q130,100 100,55 Z" fill="url(#zeusTogaWhite)" stroke="#64748b" stroke-width="1.5"/>
          <path d="M35,65 Q50,110 40,160 M95,65 Q85,110 95,160" stroke="#cbd5e1" stroke-width="2" fill="none"/>

          <!-- Golden Armor Cuirass / Gauntlets -->
          <path d="M48,55 L92,55 L88,95 L52,95 Z" fill="url(#zeusArmorGold)" stroke="#78350f" stroke-width="1.8"/>
          <!-- Greek Meander Belt -->
          <rect x="46" y="95" width="48" height="8" rx="2" fill="#d97706" stroke="#78350f" stroke-width="1"/>
          <path d="M48,99 H92 M52,95 V103 M60,95 V103 M68,95 V103 M76,95 V103 M84,95 V103" stroke="#fef08a" stroke-width="1"/>

          <!-- Muscular Neck & Head Base -->
          <rect x="62" y="38" width="16" height="20" rx="4" fill="#f8fafc"/>
          <ellipse cx="70" cy="38" rx="18" ry="22" fill="#f8fafc"/>

          <!-- Chiseled Olympian Features -->
          <!-- Flowing Majestic White Beard -->
          <path d="M52,38 C42,65 52,90 70,96 C88,90 98,65 88,38 C80,48 60,48 52,38 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.2"/>
          <path d="M60,54 Q70,72 80,54 M65,60 Q70,82 75,60" stroke="#94a3b8" stroke-width="1.2" fill="none"/>

          <!-- Moustache -->
          <path d="M54,42 Q70,48 70,44 Q70,48 86,42 Q70,39 54,42 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>

          <!-- Glowing Cyan Lightning Eyes -->
          <ellipse cx="62" cy="33" rx="4.5" ry="3" fill="#000000"/>
          <circle cx="62" cy="33" r="3" fill="url(#zeusEyeGlow)"/>
          <circle cx="62" cy="33" r="1.2" fill="#ffffff"/>

          <ellipse cx="78" cy="33" rx="4.5" ry="3" fill="#000000"/>
          <circle cx="78" cy="33" r="3" fill="url(#zeusEyeGlow)"/>
          <circle cx="78" cy="33" r="1.2" fill="#ffffff"/>

          <!-- Golden Laurel Leaf Diadem / Crown -->
          <path d="M48,22 Q70,10 92,22 L88,27 Q70,18 52,27 Z" fill="url(#zeusArmorGold)" stroke="#78350f" stroke-width="1.5"/>
          <polygon points="70,6 74,18 66,18" fill="#fef08a"/>
          <polygon points="56,12 62,20 54,22" fill="#fef08a"/>
          <polygon points="84,12 78,20 86,22" fill="#fef08a"/>

          <!-- Hand Holding Crackling Triple Lightning Bolt -->
          <!-- Golden Arm Gauntlet -->
          <path d="M92,70 L115,75 L118,65 L95,60 Z" fill="url(#zeusArmorGold)" stroke="#78350f" stroke-width="1.5"/>
          <!-- Fisted Hand -->
          <circle cx="118" cy="70" r="7" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
          <!-- Massive Crackling Lightning Bolt -->
          <g filter="url(#zeusGlowFilter)">
            <polygon points="120,20 126,55 118,60 134,68 116,80 122,86 102,120 114,84 104,82 118,72 106,62 116,56" fill="url(#lightningBoltGlow)" stroke="#ffffff" stroke-width="1.5"/>
            <!-- Energy Arcs -->
            <path d="M124,35 Q135,45 128,60 M110,75 Q100,90 108,105" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
    `;
  }
}

// Renderer Registry Map
CasinoSymbols.renderers = {
  // Lightning Link Map
  'll_pharaoh': () => CasinoSymbols.renderTikiMask(),
  'll_fire': () => CasinoSymbols.renderFire(),
  'll_eagle': () => CasinoSymbols.renderEagle(),
  'll_bell': () => CasinoSymbols.renderBell(),
  'll_crown': () => CasinoSymbols.renderCrown(),
  'll_ace': () => CasinoSymbols.renderCardRank('A', '#94a3b8'),
  'll_king': () => CasinoSymbols.renderCardRank('K', '#94a3b8'),
  'll_queen': () => CasinoSymbols.renderCardRank('Q', '#64748b'),
  'll_scatter': () => CasinoSymbols.renderVolcanoScatter(),
  'll_wild': () => CasinoSymbols.renderLightningWild(),
  
  // Gates of Olympus Map
  'oly_zeus': () => CasinoSymbols.renderZeusScatter(),
  'oly_crown': () => CasinoSymbols.renderOlympusCrown(),
  'oly_hourglass': () => CasinoSymbols.renderHourglass(),
  'oly_ring': () => CasinoSymbols.renderRing(),
  'oly_chalice': () => CasinoSymbols.renderChalice(),
  'oly_red_gem': () => CasinoSymbols.renderRubyGem(),
  'oly_purple_gem': () => CasinoSymbols.renderAmethystGem(),
  'oly_yellow_gem': () => CasinoSymbols.renderTopazGem(),
  'oly_green_gem': () => CasinoSymbols.renderEmeraldGem(),
  'oly_blue_gem': () => CasinoSymbols.renderSapphireGem(),

  // Rain Slots Deluxe Map
  'slot_diamond': () => CasinoSymbols.renderSlotDiamond(),
  'slot_crown': () => CasinoSymbols.renderSlotCrown(),
  'slot_wild': () => CasinoSymbols.renderSlotWild7(),
  'slot_scatter': () => CasinoSymbols.renderSlotRainScatter(),
  'slot_bolt': () => CasinoSymbols.renderSlotThunderBolt(),
  'slot_bell': () => CasinoSymbols.renderSlotBell(),
  'slot_clover': () => CasinoSymbols.renderSlotClover(),
  'slot_cherry': () => CasinoSymbols.renderSlotCherry()
};

window.CasinoSymbols = CasinoSymbols;
