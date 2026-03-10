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
