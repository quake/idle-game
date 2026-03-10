// --- Game State ---
const state = {
  coins: 0,
  perSecond: 1,      // coins generated per second
  upgradeCost: 10,   // cost of next upgrade
  upgradeLevel: 0,   // number of upgrades purchased
};

// --- DOM Elements ---
const coinsEl = document.getElementById("coins");
const perSecondEl = document.getElementById("per-second");
const upgradeCostEl = document.getElementById("upgrade-cost");
const clickBtn = document.getElementById("click-btn");
const upgradeBtn = document.getElementById("upgrade-btn");

// --- Save / Load ---
function save() {
  localStorage.setItem("idle-game-state", JSON.stringify(state));
}

function load() {
  const data = localStorage.getItem("idle-game-state");
  if (data) {
    const saved = JSON.parse(data);
    Object.assign(state, saved);
  }
}

// --- Rendering ---
function render() {
  coinsEl.textContent = Math.floor(state.coins);
  perSecondEl.textContent = state.perSecond;
  upgradeCostEl.textContent = state.upgradeCost;
  upgradeBtn.disabled = state.coins < state.upgradeCost;
}

// --- Game Loop (1-second tick) ---
function tick() {
  state.coins += state.perSecond;
  render();
  save();
}

// --- Click Handler ---
clickBtn.addEventListener("click", () => {
  state.coins += 1;
  render();
  save();
});

// --- Upgrade Handler ---
upgradeBtn.addEventListener("click", () => {
  if (state.coins >= state.upgradeCost) {
    state.coins -= state.upgradeCost;
    state.perSecond += 1;
    state.upgradeLevel += 1;
    state.upgradeCost = Math.floor(10 * Math.pow(1.5, state.upgradeLevel));
    render();
    save();
  }
});

// --- Init ---
load();
render();
setInterval(tick, 1000);
