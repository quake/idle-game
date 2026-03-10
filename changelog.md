# Changelog

## 2026-03-10

- Initial seed version: coins, click, upgrade, localStorage persistence

## 2026-03-10

- Added multiple resource system: Gold, Diamonds, and Wood
- Each resource has its own production rate and upgrade path
- Added resource-specific click buttons
- Added separate upgrade buttons for each resource type
- Added resource conversion system (Gold → Diamonds/Wood)

## 2026-03-10

- Added auto-clicker automation feature
- Auto-clicker costs 100 gold and provides +1 manual click per second
- Auto-clicker button hides after purchase with status indicator

## 2026-03-10

- Added mine building system
- Mines cost 50 gold to build (cost increases by 30% per mine)
- Each mine produces 2 gold per second
- Display shows mine count and current build cost

## 2026-03-10

- Added "Special Events" section with two StarCraft-themed cheat code events:
  - "Show Me The Money" (Windfall): Instantly grants 100× current gold/s bonus gold.
    Has a 5-minute cooldown. Triggers a gold flash animation and log message.
  - "Something For Nothing" (Free Upgrades): Activates a 60-second buff that makes
    all upgrades 90% cheaper. Has a 10-minute cooldown after use.
    Upgrades section glows green while buff is active.
- Added event log panel (shows last 20 events with timestamps)

## 2026-03-10

- Added Farm building: costs 200 gold initially (each subsequent farm is 40% more expensive)
- Each farm produces 5 gold per second (passive income)
- Farm button uses a distinct green-yellow color theme to distinguish from Gold Mine
- Building a farm logs a message showing total farm production per second

## 2026-03-10

- Added Factory building: costs 1000 gold initially (each subsequent factory is 50% more expensive)
- Each factory produces 20 gold per second (passive income, highest yield building)
- Factory button uses a cyan-blue color theme to distinguish from other buildings
- Building a factory logs a message showing total factory production per second

## 2026-03-10

- Added Achievement System with 10 achievements:
  - "第一桶金" (First Pot of Gold): Earn a cumulative total of 100 gold
  - "淘金热" (Gold Rush): Earn a cumulative total of 10,000 gold
  - "百万富翁" (Millionaire): Earn a cumulative total of 1,000,000 gold
  - "勤劳的矿工" (Diligent Miner): Perform 50 manual clicks
  - "升级狂人" (Upgrade Addict): Purchase 10 upgrades
  - "建筑师" (Builder): Own a total of 5 buildings (mines + farms + factories)
  - "钻石收藏家" (Diamond Collector): Own 10 diamonds at once
  - "伐木能手" (Lumberjack): Own 100 wood at once
  - "自动化先锋" (Automation Pioneer): Purchase the auto-clicker
  - "时来运转" (Lucky Break): Use the "Show Me The Money" windfall event
- Added 🏆 Achievements panel button (top-right) that opens a modal overlay
  showing all achievements with unlock status, progress bars, and completion counts
- Newly unlocked achievements trigger an animated popup notification in the bottom-right corner
- Tracks cumulative stats: totalGoldEarned, totalClicks, totalUpgrades (persisted in localStorage)

