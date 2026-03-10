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
};

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
}

// --- Game Loop (1-second tick) ---
function tick() {
  state.gold += state.goldPerSecond;
  state.diamonds += state.diamondsPerSecond;
  state.wood += state.woodPerSecond;
  // Auto-clicker: automatically clicks gold once per second
  if (state.autoClickerOwned) {
    state.gold += 1;
  }
  // Mines produce gold
  state.gold += state.mineCount * state.mineProduction;
  render();
  save();
}

// --- Click Handlers (Manual Collection) ---
clickGoldBtn.addEventListener('click', () => {
  state.gold += 1;
  render();
  save();
});

clickDiamondsBtn.addEventListener('click', () => {
  state.diamonds += 1;
  render();
  save();
});

clickWoodBtn.addEventListener('click', () => {
  state.wood += 1;
  render();
  save();
});

// --- Upgrade Handlers ---
upgradeGoldBtn.addEventListener('click', () => {
  if (state.gold >= state.goldUpgradeCost) {
    state.gold -= state.goldUpgradeCost;
    state.goldPerSecond += 1;
    state.goldUpgradeLevel += 1;
    state.goldUpgradeCost = Math.floor(10 * Math.pow(1.5, state.goldUpgradeLevel));
    render();
    save();
  }
});

upgradeDiamondsBtn.addEventListener('click', () => {
  if (state.gold >= state.diamondsUpgradeCost) {
    state.gold -= state.diamondsUpgradeCost;
    state.diamondsPerSecond += 0.1; // Diamonds are rarer
    state.diamondsUpgradeLevel += 1;
    state.diamondsUpgradeCost = Math.floor(50 * Math.pow(1.6, state.diamondsUpgradeLevel));
    render();
    save();
  }
});

upgradeWoodBtn.addEventListener('click', () => {
  if (state.gold >= state.woodUpgradeCost) {
    state.gold -= state.woodUpgradeCost;
    state.woodPerSecond += 2; // Wood is more abundant
    state.woodUpgradeLevel += 1;
    state.woodUpgradeCost = Math.floor(30 * Math.pow(1.5, state.woodUpgradeLevel));
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
    render();
    save();
  }
});

// --- Init ---
load();
render();
setInterval(tick, 1000);
