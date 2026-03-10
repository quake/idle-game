// --- Game State ---
// Multi-resource idle game with Gold, Diamonds, and Wood
const state = {
  // Resources
  gold: 0,
  diamonds: 0,
  wood: 0,
  // Production rates (per second)
  goldPerSecond: 1,
  diamondsPerSecond: 0,
  woodPerSecond: 0,
  // Upgrade levels
  goldUpgradeLevel: 0,
  diamondsUpgradeLevel: 0,
  woodUpgradeLevel: 0,
  // Upgrade costs (in gold)
  goldUpgradeCost: 10,
  diamondsUpgradeCost: 50,
  woodUpgradeCost: 30,
  // Auto-clicker
  autoClickerOwned: false,
  autoClickerCost: 100,
  // Mine building
  mineCount: 0,
  mineCost: 50,
  mineProduction: 2, // gold per second per mine
  // Farm building
  farmCount: 0,
  farmCost: 200,
  farmProduction: 5, // gold per second per farm
  // Factory building
  factoryCount: 0,
  factoryCost: 1000,
  factoryProduction: 20, // gold per second per factory
  // Special Events
  windfallCooldown: 0,       // seconds remaining until windfall is available again
  freeUpgradesActive: false, // whether the "something for nothing" buff is active
  freeUpgradesTimer: 0,      // seconds remaining for free upgrades buff
  // Achievements — array of achievement IDs that have been unlocked
  achievements: [],
  // Cumulative stats used for achievement checks
  totalGoldEarned: 0,        // all-time gold earned (never decreases)
  totalClicks: 0,            // total manual clicks across all resources
  totalUpgrades: 0,          // total upgrades purchased
};

// --- Achievement Definitions ---
// Each achievement: { id, name, desc, icon, check(state) → { unlocked: bool, progress: number, goal: number } }
const ACHIEVEMENTS = [
  {
    id: 'first_pot_of_gold',
    name: '第一桶金',
    desc: '累计获得100金币',
    icon: '🪙',
    check: (s) => ({ unlocked: s.totalGoldEarned >= 100, progress: Math.min(s.totalGoldEarned, 100), goal: 100 }),
  },
  {
    id: 'gold_rush',
    name: '淘金热',
    desc: '累计获得10,000金币',
    icon: '💰',
    check: (s) => ({ unlocked: s.totalGoldEarned >= 10000, progress: Math.min(s.totalGoldEarned, 10000), goal: 10000 }),
  },
  {
    id: 'millionaire',
    name: '百万富翁',
    desc: '累计获得1,000,000金币',
    icon: '🤑',
    check: (s) => ({ unlocked: s.totalGoldEarned >= 1000000, progress: Math.min(s.totalGoldEarned, 1000000), goal: 1000000 }),
  },
  {
    id: 'clicker',
    name: '勤劳的矿工',
    desc: '手动点击50次',
    icon: '⛏️',
    check: (s) => ({ unlocked: s.totalClicks >= 50, progress: Math.min(s.totalClicks, 50), goal: 50 }),
  },
  {
    id: 'upgrade_addict',
    name: '升级狂人',
    desc: '购买10次升级',
    icon: '⬆️',
    check: (s) => ({ unlocked: s.totalUpgrades >= 10, progress: Math.min(s.totalUpgrades, 10), goal: 10 }),
  },
  {
    id: 'builder',
    name: '建筑师',
    desc: '建造5座建筑（矿场/农场/工厂合计）',
    icon: '🏗️',
    check: (s) => {
      const total = s.mineCount + s.farmCount + s.factoryCount;
      return { unlocked: total >= 5, progress: Math.min(total, 5), goal: 5 };
    },
  },
  {
    id: 'diamond_collector',
    name: '钻石收藏家',
    desc: '拥有10颗钻石',
    icon: '💎',
    check: (s) => ({ unlocked: s.diamonds >= 10, progress: Math.min(Math.floor(s.diamonds), 10), goal: 10 }),
  },
  {
    id: 'lumberjack',
    name: '伐木能手',
    desc: '累计拥有100木材',
    icon: '🪵',
    check: (s) => ({ unlocked: s.wood >= 100, progress: Math.min(Math.floor(s.wood), 100), goal: 100 }),
  },
  {
    id: 'auto_pilot',
    name: '自动化先锋',
    desc: '购买自动点击器',
    icon: '🤖',
    check: (s) => ({ unlocked: s.autoClickerOwned, progress: s.autoClickerOwned ? 1 : 0, goal: 1 }),
  },
  {
    id: 'speed_runner',
    name: '时来运转',
    desc: '使用"Show Me The Money"获得大奖',
    icon: '💸',
    check: (s) => ({
      unlocked: s.windfallCooldown > 0,
      progress: s.windfallCooldown > 0 ? 1 : 0,
      goal: 1,
    }),
  },
];

// --- Achievement Helpers ---

// Check all achievements and unlock any newly met ones, showing a notification
function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    // Skip if already unlocked
    if (state.achievements.includes(ach.id)) return;
    const result = ach.check(state);
    if (result.unlocked) {
      state.achievements.push(ach.id);
      showAchievementNotification(ach);
      logMessage(`🏆 成就解锁：${ach.icon} ${ach.name} — ${ach.desc}`);
    }
  });
}

// Show a popup notification in the bottom-right corner
function showAchievementNotification(ach) {
  const notif = document.createElement('div');
  notif.className = 'achievement-notif';
  notif.innerHTML = `
    <span class="ach-notif-icon">${ach.icon}</span>
    <div class="ach-notif-text">
      <div class="ach-notif-title">🏆 成就解锁！</div>
      <div class="ach-notif-name">${ach.name}</div>
      <div class="ach-notif-desc">${ach.desc}</div>
    </div>
  `;
  document.body.appendChild(notif);
  // Animate in, hold, then fade out and remove
  setTimeout(() => notif.classList.add('show'), 50);
  setTimeout(() => notif.classList.remove('show'), 3500);
  setTimeout(() => notif.remove(), 4200);
}

// Render the achievements panel content
function renderAchievementsPanel() {
  const container = document.getElementById('achievements-list');
  if (!container) return;
  container.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = state.achievements.includes(ach.id);
    const result = ach.check(state);
    const pct = Math.min(100, Math.round((result.progress / result.goal) * 100));

    const card = document.createElement('div');
    card.className = 'ach-card' + (unlocked ? ' ach-unlocked' : ' ach-locked');
    card.innerHTML = `
      <span class="ach-icon">${unlocked ? ach.icon : '🔒'}</span>
      <div class="ach-info">
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.desc}</div>
        <div class="ach-progress-bar">
          <div class="ach-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="ach-progress-label">${Math.floor(result.progress)} / ${result.goal}</div>
      </div>
      ${unlocked ? '<span class="ach-check">✅</span>' : ''}
    `;
    container.appendChild(card);
  });
  // Summary
  const summary = document.getElementById('achievements-summary');
  if (summary) {
    summary.textContent = `已解锁 ${state.achievements.length} / ${ACHIEVEMENTS.length} 个成就`;
  }
}

// --- DOM Elements ---
const goldEl = document.getElementById('gold');
const diamondsEl = document.getElementById('diamonds');
const woodEl = document.getElementById('wood');
const goldPerSecEl = document.getElementById('gold-per-second');
const diamondsPerSecEl = document.getElementById('diamonds-per-second');
const woodPerSecEl = document.getElementById('wood-per-second');
const goldUpgradeCostEl = document.getElementById('gold-upgrade-cost');
const diamondsUpgradeCostEl = document.getElementById('diamonds-upgrade-cost');
const woodUpgradeCostEl = document.getElementById('wood-upgrade-cost');

const clickGoldBtn = document.getElementById('click-gold');
const clickDiamondsBtn = document.getElementById('click-diamonds');
const clickWoodBtn = document.getElementById('click-wood');
const upgradeGoldBtn = document.getElementById('upgrade-gold');
const upgradeDiamondsBtn = document.getElementById('upgrade-diamonds');
const upgradeWoodBtn = document.getElementById('upgrade-wood');
const convertDiamondBtn = document.getElementById('convert-diamond');
const convertWoodBtn = document.getElementById('convert-wood');
const autoClickerBtn = document.getElementById('buy-auto-clicker');
const autoClickerStatusEl = document.getElementById('auto-clicker-status');
const buildMineBtn = document.getElementById('build-mine');
const mineCountEl = document.getElementById('mine-count');
const mineCostEl = document.getElementById('mine-cost');
const buildFarmBtn = document.getElementById('build-farm');
const farmCountEl = document.getElementById('farm-count');
const farmCostEl = document.getElementById('farm-cost');
const buildFactoryBtn = document.getElementById('build-factory');
const factoryCountEl = document.getElementById('factory-count');
const factoryCostEl = document.getElementById('factory-cost');

// Special Events
const windfallBtn = document.getElementById('btn-windfall');
const windfallStatusEl = document.getElementById('windfall-status');
const freeUpgradesBtn = document.getElementById('btn-free-upgrades');
const freeUpgradesStatusEl = document.getElementById('free-upgrades-status');

// --- Save / Load ---
function save() {
  localStorage.setItem('idle-game-v2-state', JSON.stringify(state));
}

function load() {
  const data = localStorage.getItem('idle-game-v2-state');
  if (data) {
    const saved = JSON.parse(data);
    Object.assign(state, saved);
  }
}

// --- Rendering ---
function render() {
  // Resource amounts
  goldEl.textContent = Math.floor(state.gold);
  diamondsEl.textContent = Math.floor(state.diamonds);
  woodEl.textContent = Math.floor(state.wood);
  // Production rates
  goldPerSecEl.textContent = state.goldPerSecond;
  diamondsPerSecEl.textContent = state.diamondsPerSecond;
  woodPerSecEl.textContent = state.woodPerSecond;
  // Upgrade costs
  goldUpgradeCostEl.textContent = state.goldUpgradeCost;
  diamondsUpgradeCostEl.textContent = state.diamondsUpgradeCost;
  woodUpgradeCostEl.textContent = state.woodUpgradeCost;
  // Button states (disabled if cannot afford)
  upgradeGoldBtn.disabled = state.gold < state.goldUpgradeCost;
  upgradeDiamondsBtn.disabled = state.gold < state.diamondsUpgradeCost;
  upgradeWoodBtn.disabled = state.gold < state.woodUpgradeCost;
  convertDiamondBtn.disabled = state.gold < 100;
  convertWoodBtn.disabled = state.gold < 50;
  // Auto-clicker button - hide if already owned
  if (state.autoClickerOwned) {
    autoClickerBtn.style.display = 'none';
    autoClickerStatusEl.textContent = '✅ Auto-clicker active (+1 gold/s)';
  } else {
    autoClickerBtn.disabled = state.gold < state.autoClickerCost;
    autoClickerStatusEl.textContent = '';
  }
  // Mine building
  mineCountEl.textContent = state.mineCount;
  mineCostEl.textContent = state.mineCost;
  buildMineBtn.disabled = state.gold < state.mineCost;
  // Farm building
  farmCountEl.textContent = state.farmCount;
  farmCostEl.textContent = state.farmCost;
  buildFarmBtn.disabled = state.gold < state.farmCost;
  // Factory building
  factoryCountEl.textContent = state.factoryCount;
  factoryCostEl.textContent = state.factoryCost;
  buildFactoryBtn.disabled = state.gold < state.factoryCost;

  // Windfall button (5-minute cooldown = 300 seconds)
  if (state.windfallCooldown > 0) {
    windfallBtn.disabled = true;
    const mins = Math.floor(state.windfallCooldown / 60);
    const secs = state.windfallCooldown % 60;
    windfallStatusEl.textContent = `Cooldown: ${mins}m ${secs}s`;
  } else {
    windfallBtn.disabled = false;
    const bonus = Math.max(state.goldPerSecond * 100, 50);
    windfallStatusEl.textContent = `Gives +${bonus} gold instantly!`;
  }

  // Free Upgrades buff button (available when buff is not active)
  if (state.freeUpgradesActive) {
    freeUpgradesBtn.disabled = true;
    freeUpgradesStatusEl.textContent = `⏳ Active: ${state.freeUpgradesTimer}s remaining`;
  } else {
    // Cooldown after use: 10 minutes (tracked via freeUpgradesTimer < 0)
    if (state.freeUpgradesTimer < 0) {
      freeUpgradesBtn.disabled = true;
      freeUpgradesStatusEl.textContent = `Cooldown: ${Math.abs(state.freeUpgradesTimer)}s`;
    } else {
      freeUpgradesBtn.disabled = false;
      freeUpgradesStatusEl.textContent = 'All upgrades 90% off for 60s!';
    }
  }
}

// --- Game Loop (1-second tick) ---
function tick() {
  // Track gold earned this tick for cumulative stat
  let goldThisTick = state.goldPerSecond;

  state.gold += state.goldPerSecond;
  state.diamonds += state.diamondsPerSecond;
  state.wood += state.woodPerSecond;
  // Auto-clicker: automatically clicks gold once per second
  if (state.autoClickerOwned) {
    state.gold += 1;
    goldThisTick += 1;
  }
  // Mines produce gold
  const mineGold = state.mineCount * state.mineProduction;
  state.gold += mineGold;
  goldThisTick += mineGold;
  // Farms produce gold
  const farmGold = state.farmCount * state.farmProduction;
  state.gold += farmGold;
  goldThisTick += farmGold;
  // Factories produce gold
  const factoryGold = state.factoryCount * state.factoryProduction;
  state.gold += factoryGold;
  goldThisTick += factoryGold;

  // Accumulate total gold earned
  state.totalGoldEarned += goldThisTick;

  // Countdown windfall cooldown
  if (state.windfallCooldown > 0) {
    state.windfallCooldown -= 1;
  }

  // Countdown free upgrades buff or its post-use cooldown
  if (state.freeUpgradesActive) {
    state.freeUpgradesTimer -= 1;
    if (state.freeUpgradesTimer <= 0) {
      // Buff expired — restore real upgrade costs and start post-cooldown
      state.freeUpgradesActive = false;
      state.goldUpgradeCost = Math.floor(10 * Math.pow(1.5, state.goldUpgradeLevel));
      state.diamondsUpgradeCost = Math.floor(50 * Math.pow(1.6, state.diamondsUpgradeLevel));
      state.woodUpgradeCost = Math.floor(30 * Math.pow(1.5, state.woodUpgradeLevel));
      state.freeUpgradesTimer = -600; // 10-minute cooldown after use
      document.getElementById('upgrades').classList.remove('free-upgrades-active');
      logMessage('✅ Free upgrades buff expired! Costs restored.');
    }
  } else if (state.freeUpgradesTimer < 0) {
    // Post-use cooldown countdown
    state.freeUpgradesTimer += 1;
  }

  // Check achievements every tick
  checkAchievements();

  render();
  save();
}

// --- Click Handlers (Manual Collection) ---
clickGoldBtn.addEventListener('click', () => {
  state.gold += 1;
  state.totalGoldEarned += 1;
  state.totalClicks += 1;
  checkAchievements();
  render();
  save();
});

clickDiamondsBtn.addEventListener('click', () => {
  state.diamonds += 1;
  state.totalClicks += 1;
  checkAchievements();
  render();
  save();
});

clickWoodBtn.addEventListener('click', () => {
  state.wood += 1;
  state.totalClicks += 1;
  checkAchievements();
  render();
  save();
});

// --- Upgrade Handlers ---
upgradeGoldBtn.addEventListener('click', () => {
  if (state.gold >= state.goldUpgradeCost) {
    state.gold -= state.goldUpgradeCost;
    state.goldPerSecond += 1;
    state.goldUpgradeLevel += 1;
    state.totalUpgrades += 1;
    // Only recalculate cost at full price if free upgrades buff is not active
    if (!state.freeUpgradesActive) {
      state.goldUpgradeCost = Math.floor(10 * Math.pow(1.5, state.goldUpgradeLevel));
    } else {
      // Keep discounted cost during buff
      state.goldUpgradeCost = Math.max(1, Math.floor(10 * Math.pow(1.5, state.goldUpgradeLevel) * 0.1));
    }
    checkAchievements();
    render();
    save();
  }
});

upgradeDiamondsBtn.addEventListener('click', () => {
  if (state.gold >= state.diamondsUpgradeCost) {
    state.gold -= state.diamondsUpgradeCost;
    state.diamondsPerSecond += 0.1; // Diamonds are rarer
    state.diamondsUpgradeLevel += 1;
    state.totalUpgrades += 1;
    if (!state.freeUpgradesActive) {
      state.diamondsUpgradeCost = Math.floor(50 * Math.pow(1.6, state.diamondsUpgradeLevel));
    } else {
      state.diamondsUpgradeCost = Math.max(1, Math.floor(50 * Math.pow(1.6, state.diamondsUpgradeLevel) * 0.1));
    }
    checkAchievements();
    render();
    save();
  }
});

upgradeWoodBtn.addEventListener('click', () => {
  if (state.gold >= state.woodUpgradeCost) {
    state.gold -= state.woodUpgradeCost;
    state.woodPerSecond += 2; // Wood is more abundant
    state.woodUpgradeLevel += 1;
    state.totalUpgrades += 1;
    if (!state.freeUpgradesActive) {
      state.woodUpgradeCost = Math.floor(30 * Math.pow(1.5, state.woodUpgradeLevel));
    } else {
      state.woodUpgradeCost = Math.max(1, Math.floor(30 * Math.pow(1.5, state.woodUpgradeLevel) * 0.1));
    }
    checkAchievements();
    render();
    save();
  }
});

// --- Conversion Handlers ---
convertDiamondBtn.addEventListener('click', () => {
  if (state.gold >= 100) {
    state.gold -= 100;
    state.diamonds += 1;
    render();
    save();
  }
});

convertWoodBtn.addEventListener('click', () => {
  if (state.gold >= 50) {
    state.gold -= 50;
    state.wood += 5;
    render();
    save();
  }
});

// --- Auto-clicker Handler ---
autoClickerBtn.addEventListener('click', () => {
  if (!state.autoClickerOwned && state.gold >= state.autoClickerCost) {
    state.gold -= state.autoClickerCost;
    state.autoClickerOwned = true;
    checkAchievements();
    render();
    save();
  }
});

// --- Mine Building Handler ---
buildMineBtn.addEventListener('click', () => {
  if (state.gold >= state.mineCost) {
    state.gold -= state.mineCost;
    state.mineCount += 1;
    state.mineCost = Math.floor(50 * Math.pow(1.3, state.mineCount));
    checkAchievements();
    render();
    save();
  }
});

// --- Farm Building Handler ---
// Farm costs 200 gold initially; each additional farm costs 40% more than the last.
buildFarmBtn.addEventListener('click', () => {
  if (state.gold >= state.farmCost) {
    state.gold -= state.farmCost;
    state.farmCount += 1;
    // Each subsequent farm is 40% more expensive (rounded)
    state.farmCost = Math.floor(200 * Math.pow(1.4, state.farmCount));
    logMessage(`🌾 Farm #${state.farmCount} built! Total farm production: +${state.farmCount * state.farmProduction} gold/s`);
    checkAchievements();
    render();
    save();
  }
});

// --- Factory Building Handler ---
// Factory costs 1000 gold initially; each additional factory costs 50% more than the last.
buildFactoryBtn.addEventListener('click', () => {
  if (state.gold >= state.factoryCost) {
    state.gold -= state.factoryCost;
    state.factoryCount += 1;
    // Each subsequent factory is 50% more expensive (rounded)
    state.factoryCost = Math.floor(1000 * Math.pow(1.5, state.factoryCount));
    logMessage(`🏭 Factory #${state.factoryCount} built! Total factory production: +${state.factoryCount * state.factoryProduction} gold/s`);
    checkAchievements();
    render();
    save();
  }
});

// --- Log Helper ---
// Displays a timestamped message in the #log div (newest on top)
function logMessage(msg) {
  const logEl = document.getElementById('log');
  const entry = document.createElement('div');
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logEl.prepend(entry);
  // Keep only latest 20 log entries
  while (logEl.children.length > 20) logEl.removeChild(logEl.lastChild);
}

// --- Special Event: "Show Me The Money" (Windfall) ---
// Gives 100× the current gold/s as an instant gold bonus.
// Has a 5-minute cooldown between uses.
windfallBtn.addEventListener('click', () => {
  if (state.windfallCooldown > 0) return;
  const bonus = Math.max(Math.floor(state.goldPerSecond * 100), 50);
  state.gold += bonus;
  state.totalGoldEarned += bonus;
  state.windfallCooldown = 300; // 5-minute cooldown
  // Flash animation on the gold display
  goldEl.classList.add('windfall-flash');
  setTimeout(() => goldEl.classList.remove('windfall-flash'), 1000);
  logMessage(`💰 WINDFALL! Received +${bonus} gold! (next in 5 min)`);
  checkAchievements();
  render();
  save();
});

// --- Special Event: "Something For Nothing" (Free Upgrades Buff) ---
// Makes all upgrades 90% cheaper for 60 seconds. 10-minute cooldown after use.
freeUpgradesBtn.addEventListener('click', () => {
  if (state.freeUpgradesActive || state.freeUpgradesTimer < 0) return;
  state.freeUpgradesActive = true;
  state.freeUpgradesTimer = 60;
  // Apply 90% discount to all upgrade costs
  state.goldUpgradeCost = Math.max(1, Math.floor(state.goldUpgradeCost * 0.1));
  state.diamondsUpgradeCost = Math.max(1, Math.floor(state.diamondsUpgradeCost * 0.1));
  state.woodUpgradeCost = Math.max(1, Math.floor(state.woodUpgradeCost * 0.1));
  // Flash animation on upgrades section
  document.getElementById('upgrades').classList.add('free-upgrades-active');
  logMessage('🎁 FREE UPGRADES! All costs 90% off for 60 seconds!');
  render();
  save();
});

// --- Init ---
load();
render();
setInterval(tick, 1000);

// --- Achievements Panel Toggle ---
const achBtn = document.getElementById('btn-achievements');
const achPanel = document.getElementById('achievements-panel');
const achCloseBtn = document.getElementById('achievements-close');

if (achBtn) {
  achBtn.addEventListener('click', () => {
    achPanel.classList.toggle('hidden');
    if (!achPanel.classList.contains('hidden')) {
      renderAchievementsPanel();
    }
  });
}

if (achCloseBtn) {
  achCloseBtn.addEventListener('click', () => {
    achPanel.classList.add('hidden');
  });
}
