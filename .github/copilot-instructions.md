# Copilot / AI Agent Instructions — react_heroes_battle

**Purpose**: Concise guide for AI agents to be immediately productive in this Vite + React + Tailwind 3v3 tactical card battle game.

## Quick Start
- **Dev**: `npm run dev` (Vite → http://localhost:5173)
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Big Picture Architecture
Single-page React app (no backend). All game logic and UI centralized in [src/App.jsx](src/App.jsx) (~1002 lines). State management via React hooks only—no external stores. The game is a 3v3 hero card battle where players take turns playing attack/buff/support cards; defenders react with defense cards. Victory when one team has all heroes defeated (HP → 0).

## Key Game Mechanics
- **Heroes**: 6 heroes total (3 per player), each with job class (Melee, Ranged, Mage, Support), max HP, current HP, and `statusEffects[]` array. When HP reaches 0, marked `defeated`.
- **Cards**: Five types—*attack* (damage 3–6, physical/ranged/magic; elemental magic cards apply status effects), *buff* (Focus, Charge, Ready, Feint; modify damage or grant extra attacks), *defense* (Block, Evade, Counter, Deflect; reduce/nullify damage or reflect), *support* (Heal, Cure; restore HP or cleanse effects).
- **Status Effects**: Six types (Burn, Freeze, Bleed, Stun, Poison, Paralyze). Each has icon, duration, and effect (damagePerTurn, skipTurn, etc.). Applied by elemental magic cards on hit, processed at turn end via `processStatusEffects()`.
- **Turn flow**: `currentTurn` player draws/plays cards → `drawCardsToFive()` refills hand to 5 → player plays attack/buff/support → if attack: `playAttack()` triggers `waitingForReaction` → defender plays defense or skips → `resolveAttack()` applies damage & status effects → if buff grants extra attacks, loop; else call `confirmEndTurn()` to process status effects, switch turns, draw cards.

## State Variables (Critical for Editing)
- **Core**: `heroes` (3v3 grid with statusEffects), `currentTurn` ('player1'/'player2'), `activeHeroIndex` (0–2, which hero acts), `gameStarted`, `gameOver`, `winner`, `turnCount`
- **Hands & Draw**: `player1Hand`, `player2Hand` (max 5 cards), `drawnCard` (single card from `drawOneAndDiscard()`), `waitingForDiscard`, `drawUsedThisTurn`
- **Combat**: `pendingAttack` (attacker/defender/card/isFeint), `waitingForReaction`, `activeBuff` (buff card currently active), `remainingAttacks`, `waitingForNextAttack`, `heroAttackCounts` (tracks attacks per hero per turn)
- **Selection**: `selectingTarget` (true when choosing opponent hero), `pendingAttackCard` (temp storage during target selection)
- **Output**: `gameLog` (array of event messages), `statusEffectLog` (reserved for future use)

## File Reference
- [src/App.jsx](src/App.jsx) — entire game logic (1002 lines); `App()` function contains all state, helpers, and UI rendering
- [src/main.jsx](src/main.jsx) — React mount point
- [index.html](index.html), [vite.config.js](vite.config.js) — Vite config
- [tailwind.config.js](tailwind.config.js), [postcss.config.js](postcss.config.js), [src/index.css](src/index.css), [src/App.css](src/App.css) — styling (Tailwind + dark theme)
- [package.json](package.json) — scripts and deps (React 19, Vite 7, Tailwind 3)
- Phase*.jsx files — legacy experiment pages; ignore for main game

## Project-Specific Patterns
1. **Centralized state in App.jsx**: All game logic lives in one component. Prefer adding helper functions inside App rather than extracting to separate files (unless major refactor discussed first).
2. **Logging with `addLog()`**: Every game event must call `addLog(message)`. These appear in the Battle Log UI—order and clarity are critical. Examples: attack plays, damage taken, status effects applied, turn transitions.
3. **Hero updates via `setHeroes()`**: Never mutate hero directly; always map array and return new objects. Clamp HP to [0, maxHp]. Always preserve `statusEffects` array.
4. **Status effect workflow**: (1) Elemental magic cards carry `statusEffect: 'TYPE'` and `damage: 0`; (2) `resolveAttack()` calls `applyStatusEffect()` if `card.statusEffect` exists and `defenderDamage >= 0`; (3) `confirmEndTurn()` calls `processStatusEffects()` to apply per-turn effects and decrement durations.
5. **Attack resolution pattern**: `playAttack(card, targetId)` → sets `pendingAttack` + `waitingForReaction` → defender's `resolveAttack(defenseCard)` → damage applied → status effects applied → if buff with extra attacks, loop; else done.
6. **Card generation**: `generateCard(forHero)` returns random card from pool. Mages get elemental magic cards in addition to normal attacks. Add new card types to `CARD_TYPES` object at top of [src/App.jsx](src/App.jsx), then add to pool in `generateCard()`.

## Editing Examples
- **Add new elemental magic card**: Define in `CARD_TYPES` (e.g., `THUNDER_MAGIC: { name: 'Thunder Magic', damage: 0, type: 'attack', attackType: 'magic', element: 'thunder', statusEffect: 'PARALYZE' }`), add to pool in `generateCard()` for Mages, define or reuse `STATUS_EFFECTS.PARALYZE`. Damage is applied via status effect at turn end.
- **Add new status effect**: Define in `STATUS_EFFECTS` at top (e.g., `SLEEP: { name: 'Sleep', icon: '😴', skipTurn: true, duration: 2 }`). Then create elemental magic card that applies it via `statusEffect: 'SLEEP'` in `CARD_TYPES`. `applyStatusEffect()` and `processStatusEffects()` handle the rest.
- **Modify buff logic**: Edit `playBuff()` (check requirements), then update `resolveAttack()` (apply damage mod), and `confirmEndTurn()` if needed. Test multi-attack loops with `remainingAttacks`.
- **Add support card**: Define in `CARD_TYPES` (e.g., `REVIVE: { name: 'Revive', type: 'support', effect: 'revive' }`), then handle in `playCard()` (detect `card.type === 'support'`, call new helper like `reviveHero()`, call `addLog()`).

## UI/UX Notes (Preserve These)
- **Draw-when-full flow**: Only when hand is full (5 cards) can player click "Draw & Discard" → `drawOneAndDiscard()` adds card and sets `waitingForDiscard` → UI highlights new card with green pulse ring → player must click a card to discard (can be the new card or existing).
- **Reaction window**: When `waitingForReaction` is true, only the *defending* player may play cards, and *only defense cards*. Other players' hands are greyed out. Attacker sees "Defend?" prompt with "Take Damage" button to skip. After resolution, status effects are NOT processed yet—only at `confirmEndTurn()`.
- **Target selection**: When player plays an attack, `selectingTarget` becomes true, both hero grids get green borders, and player must click an opponent hero to target. Defeated heroes cannot be targeted.
- **Status effect display**: Heroes show active status effects (icons + durations) on their cards. At end of turn, `processStatusEffects()` applies damage-over-time, decrements durations, and removes expired effects. Battle Log logs each effect application.

## Debugging Tips
- Use Battle Log (bottom panel) to trace event order; prefer `addLog()` over `console.log`.
- Run `npm run dev`, inspect browser console for stack traces. Most logic is synchronous in [src/App.jsx](src/App.jsx).
- Check state values by adding temporary `addLog()` statements (e.g., `addLog(\`Debug: activeBuff = ${activeBuff}, remainingAttacks = ${remainingAttacks}\`)`) to trace game state.
- For status effects: verify `STATUS_EFFECTS` defined, elemental card has `statusEffect` key, `applyStatusEffect()` called in `resolveAttack()`, `processStatusEffects()` called in `confirmEndTurn()`.

## What NOT to Change Without Discussion
- **Don't split App.jsx** into separate component files without approval; reviewers expect logic consolidated.
- **Don't alter `addLog()` messages** unless clarifying UX; these are gameplay-critical and part of the user experience.
- **Don't change core turn/attack resolution logic** without confirming game balance implications (especially multi-attack flow, status effect timing).
- **Don't modify hero HP logic** (clamp, defeat state, victory check) without approval—these affect gameplay.
- **Don't alter status effect timing**: Effects apply on hit, not at resolution end; durations decrement at turn end, not mid-combat.

## Testing & CI
No tests configured. If adding tests, focus on: damage calculations, status effect application/duration, card generation (Mage elemental pool), HP clamping, victory detection, multi-attack loops.

## Clarification Needed?
Ask before changing turn resolution, draw mechanics, buff/attack interaction, feint/counter logic, or status effect timing—these are gameplay-critical balance points.
