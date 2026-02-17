# Copilot / AI Agent Instructions — react_heroes_battle

**Purpose**: Rapid onboarding guide for AI agents to be immediately productive in this Vite + React + Tailwind 3v3 tactical card battle game.

## Quick Start
- **Dev**: `npm run dev` (Vite → http://localhost:5173)
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`
- **Test**: No test suite configured yet; focus on manual battle flow testing

## Big Picture Architecture
Single-page React app (no backend) with modern, scalable architecture. Game logic is **refactored and modularized** across multiple layers for maintainability and extensibility. State management uses React hooks via [useGameState.js](src/hooks/useGameState.js) custom hook with centralized state initialization in [initialState.js](src/models/initialState.js). The game is a 3v3 hero card battle where players take turns playing attack/buff/support cards; defenders react with defense cards. **Each hero has a unique skill that triggers when specific card combinations are played.** Victory when one team has all heroes defeated (HP → 0).

**Key Architecture layers**:
1. **Models** ([src/models/](src/models/)): Define game constants—`cardTypes.js` (CARD_TYPES), `statusEffects.js` (STATUS_EFFECTS), `jobClasses.js` (JOB_CLASSES), `heroesModel.js` (hero creation with skill assignments), `heroSkills.js` (all skill definitions), `initialState.js` (initial game state).
2. **Controllers** ([src/controllers/](src/controllers/)): Pure functions handling game logic—`attackController.js` (buff/attack play), `cardController.js` (card selection/play), `damageController.js` (damage calculation with skill effects), `supportController.js` (support card logic), `turnController.js` (turn transitions), `skillController.js` (skill detection and application).
3. **Views/Components** ([src/components/](src/components/)): React components for UI—Battlefield (displays hero skills), Hand, BattleLog, Controls, GameOverModal, StatusBanners.
4. **Utilities** ([src/utils/](src/utils/)): Helper functions—`gameLogic.js` (victory checks, status effect logic), `cardGeneration.js` (card drawing/generation), `cardVisuals.js` (visual styling for cards).
5. **Hooks** ([src/hooks/](src/hooks/)): `useGameState.js` manages all game state via custom hook.

## Key Game Mechanics
- **Heroes**: 6 heroes total (3 per player), each with job class (Melee, Ranged, Mage, Support), max HP, current HP, **unique hero skill**, and `statusEffects[]` array. When HP reaches 0, marked `defeated`.
- **Hero Skills**: Each hero has one unique skill (e.g., Swordman: Power Strike 💥, Archer: Headshot 🎯, Wizard: Elemental Mastery 🌟). Skills trigger automatically when specific card combinations are played (e.g., Charge buff + Smash attack). Skills modify damage, ignore defenses, apply bonus effects. Displayed on hero cards below job class.
- **Cards**: Five types—*attack* (damage 3–6, physical/ranged/magic; elemental magic cards apply status effects via buff), *buff* (Focus, Charge, Ready, Feint; modify damage or grant extra attacks), *defense* (Block, Evade, Counter, Deflect; reduce/nullify damage or reflect), *support* (Heal, Cure, Shield; restore HP, cleanse effects, or add protective shield, target any teammate).
- **Status Effects**: Six types (Burn, Freeze, Bleed, Stun, Poison, Paralyze). Each has icon, duration, and effect (damagePerTurn, skipTurn, etc.). Applied by elemental magic cards on hit, processed at turn end via `processStatusEffects()`.
- **Elemental Magic**: Elemental magic cards (Fire, Ice, Wind, Earth, Ivy, Lightning) are **buff-type cards** that require a magic attack card. When used with a magic attack, they apply a status effect to the target on hit.
- **Support Cards**: Can target any teammate (including self). Each hero can use 1 support card per turn, or 2 if READY buff is active. Usage counter resets at turn end.
- **READY Buff**: Grants 2 attacks instead of 1, and allows 2 support card uses (instead of 1).
- **Turn flow**: `currentTurn` player draws/plays cards → `drawCardsToFive()` refills hand to 5 → player plays attack/buff/support → if attack: **check for skill triggers** → `playAttack()` triggers `waitingForReaction` → defender plays defense or skips → `resolveAttack()` applies damage, skill effects & status effects → if buff grants extra attacks, loop; else call `confirmEndTurn()` to process status effects, switch turns, draw cards.

## State Variables (Critical for Editing)
- **Core**: `heroes` (3v3 grid with statusEffects and heroSkill), `currentTurn` ('player1'/'player2'), `activeHeroIndex` (0–2, which hero acts), `gameStarted`, `gameOver`, `winner`, `turnCount`
- **Hands & Draw**: `player1Hand`, `player2Hand` (max 5 cards), `drawnCard` (single card from `drawOneAndDiscard()`), `waitingForDiscard`, `drawUsedThisTurn`
- **Combat**: `pendingAttack` (attacker/defender/card/isFeint/skill properties), `waitingForReaction`, `activeBuff` (buff card currently active), `remainingAttacks`, `waitingForNextAttack`, `heroAttackCounts` (tracks attacks per hero per turn)
- **Skills**: `triggeredSkill` (currently active skill object), `skillIndicatorVisible` (shows skill activation UI feedback)
- **Support Cards**: `pendingSupportCard`, `selectingSupportTarget`, `heroSupportCounts` (tracks support uses per hero per turn)
- **Selection**: `selectingTarget` (true when choosing opponent hero for attack), `pendingAttackCard` (temp storage during attack target selection), `isFirstAttackOfHero` (tracks if hero's first attack; used for early-abandon logic)
- **Output**: `gameLog` (array of event messages)

## File Reference

### Core Application
- [src/App.jsx](src/App.jsx) — Main React component (~726 lines); orchestrates hooks, renders components, exports game UI
- [src/main.jsx](src/main.jsx) — React mount point
- [src/hooks/useGameState.js](src/hooks/useGameState.js) — Custom hook managing all game state via useState; centralized state initialization and `addLog()`, `resetGame()` helpers

### Models (Game Constants & Data)
- [src/models/cardTypes.js](src/models/cardTypes.js) — CARD_TYPES object: all attack/buff/defense/support card definitions
### Models (Game Constants & Data)
- [src/models/cardTypes.js](src/models/cardTypes.js) — CARD_TYPES object: all attack/buff/defense/support card definitions
- [src/models/statusEffects.js](src/models/statusEffects.js) — STATUS_EFFECTS object: all status effect definitions (Burn, Freeze, Bleed, Stun, Poison, Paralyze)
- [src/models/jobClasses.js](src/models/jobClasses.js) — JOB_CLASSES object: hero job definitions (Melee, Ranged, Mage, Support)
- [src/models/heroesModel.js](src/models/heroesModel.js) — `createAllHeroes()` function: generates initial 6 heroes with unique heroSkill assignments. Each hero has `heroSkill: { id, name, icon, description }`
- [src/models/heroSkills.js](src/models/heroSkills.js) — HERO_SKILLS object: all 17 skill definitions (Power Strike, Blade Fury, Headshot, Rapid Fire, Elemental Mastery, etc.). Utility functions: `getSkillsForJobClass()`, `canHeroUseSkill()`, `detectPossibleSkills()`, `applySkillEffects()`
- [src/models/initialState.js](src/models/initialState.js) — `createInitialGameState()` and `createInitialHeroes()` functions: game state initialization (includes `triggeredSkill`, `skillIndicatorVisible` for skill UI)

### Controllers (Game Logic)
- [src/controllers/attackController.js](src/controllers/attackController.js) — `playBuffController()`: validates and plays buff cards; manages elemental magic constraints
- [src/controllers/cardController.js](src/controllers/cardController.js) — `playAttackController()`, `drawOneAndDiscardController()`, `discardCardController()`: card play routing, attack target selection, draw/discard management. Calls `checkBuffAttackSkill()` to detect skill triggers
- [src/controllers/damageController.js](src/controllers/damageController.js) — `resolveAttackController()`: complete attack resolution with damage calculation, defense handling, **skill effect application** (ignoresBlock, ignoreShield), status effect application, death checking, multi-attack loop management
- [src/controllers/skillController.js](src/controllers/skillController.js) — Skill detection and application: `checkBuffAttackSkill()` (buff+attack triggers), `checkElementalSkill()`, `checkMultiCardSkill()`, `checkConditionalSkills()`, `applySkillToAttack()` (modifies pendingAttack with skill data)
- [src/controllers/supportController.js](src/controllers/supportController.js) — `selectSupportTargetController()`: support card targeting and effect application (heal, cleanse, shield)
- [src/controllers/turnController.js](src/controllers/turnController.js) — `confirmEndTurnController()`: end turn processing (status effects, turn switch, card draw), skill state reset, multi-attack loop management

### Utilities (Helper Functions)
- [src/utils/gameLogic.js](src/utils/gameLogic.js) — `checkVictory()`, `applyStatusEffect()`, `processStatusEffects()`, `canHeroAct()`, `canHeroUseCard()`: core game logic (victory detection, status effect application/processing, hero action validation)
- [src/utils/cardGeneration.js](src/utils/cardGeneration.js) — `drawCardsToFive()`, `generateCard()`: card draw/generation (fills hand to 5, generates random cards from job-specific pools)
- [src/utils/cardVisuals.js](src/utils/cardVisuals.js) — `getCardVisual()`: card styling (colors, icons for attack types/buff types/defense types)

### Components (UI)
- [src/components/Battlefield.jsx](src/components/Battlefield.jsx) — Hero grid display; target selection UI
- [src/components/Hand.jsx](src/components/Hand.jsx) — Player hand display; card play UI
- [src/components/BattleLog.jsx](src/components/BattleLog.jsx) — Game event log/message display
- [src/components/Controls.jsx](src/components/Controls.jsx) — Game control buttons (Start, End Turn, Draw/Discard, Reaction options)
- [src/components/GameOverModal.jsx](src/components/GameOverModal.jsx) — Victory/defeat screen
- [src/components/StatusBanners.jsx](src/components/StatusBanners.jsx) — Status effect display on hero cards

### Configuration & Styling
- [index.html](index.html), [vite.config.js](vite.config.js) — Vite config
- [tailwind.config.js](tailwind.config.js), [postcss.config.js](postcss.config.js), [src/index.css](src/index.css), [src/App.css](src/App.css) — styling (Tailwind + dark theme)
- [package.json](package.json) — scripts and deps (React 19, Vite 7, Tailwind 3)

### Legacy/Experimental
- Phase*.jsx files — legacy experiment pages; ignore for main game

## Project-Specific Patterns

### State Management
1. **useGameState.js Hook**: Central state management via custom hook. App.jsx calls `useGameState()` to get all state and setters. All state initialization happens in `createInitialGameState()` in [src/models/initialState.js](src/models/initialState.js).
2. **State Shape**: State is organized by feature (core, hands, combat, selection, support, etc). Avoid deeply nested state; keep properties at top level for easy access in controllers.
3. **Hero Updates**: Heroes stored as `{ player1: [hero1, hero2, hero3], player2: [hero1, hero2, hero3] }`. Never mutate directly; always map and return new objects. Clamp HP to [0, maxHp]. Always preserve `statusEffects` and `shield` properties.

### Controller Functions
1. **Controller Pattern**: Controllers in [src/controllers/](src/controllers/) are pure functions that receive state and setters as parameters. They return void and update state via setters. Examples:
   - `attackController.js`: `handlePlayBuff(card, currentTurn, activeHeroIndex, heroes, player1Hand, setPlayer1Hand, player2Hand, setPlayer2Hand, ...setters, addLog)`
   - `damageController.js`: `resolveAttack(pendingAttack, defendingHeroId, defenseCard, heroes, setHeroes, ...setters, addLog)`
   - `supportController.js`: `playSupportCard(card, currentTurn, activeHeroIndex, heroes, setHeroes, ...setters, addLog)`
   - `turnController.js`: `confirmEndTurn(currentTurn, heroes, setHeroes, ...setters, addLog)`
2. **Logging**: Every game event must call `addLog(message)`. These appear in the Battle Log UI—order and clarity are critical. Examples: card plays, damage taken, status effects applied, turn transitions.
3. **When to Add Controllers**: If a feature spans multiple steps or requires complex validation, create a controller function. Single-step logic can stay in App.jsx or components.

### Game Logic Utilities
1. **Validation Functions** in [src/utils/gameLogic.js](src/utils/gameLogic.js):
   - `canHeroUseCard(hero, card)`: Check if hero can play card (job restrictions, card type, hero status)
   - `canHeroAct(hero)`: Check if hero can act (no skip-turn status effects)
   - `checkVictory(heroes, addLog, setGameOver, setWinner)`: Check end condition on hero defeat
2. **Status Effect Logic**:
   - `applyStatusEffect(heroId, player, statusType, heroes, setHeroes, addLog, STATUS_EFFECTS)`: Apply a status effect to a hero
   - `processStatusEffects(player, heroes, setHeroes, addLog, STATUS_EFFECTS)`: Process DOT damage, decrement durations, remove expired effects (called at turn end)

### Card System Patterns
1. **Card Generation**: `drawCardsToFive()` in [src/utils/cardGeneration.js](src/utils/cardGeneration.js) fills hand to 5 cards from job-specific pools. Each hero generates cards from their job pool: Melee → physical attacks, Ranged → ranged attacks, Mage → magic attacks + elemental magic buffs, Support → magic attacks + support cards.
2. **Card Types**: Defined in [src/models/cardTypes.js](src/models/cardTypes.js). Five categories:
   - **Attack**: `{ type: 'attack', attackType: 'physical'|'ranged'|'magic', damage: number }`
   - **Buff**: `{ type: 'buff', buffType: 'focus'|'charge'|'ready'|'feint'|'elementalMagic', damageModifier: number, extraAttacks: number, statusEffect?: string }`
   - **Defense**: `{ type: 'defense', defenseType: 'block'|'evade'|'counter'|'deflect', defense: number, counterType?: string }`
   - **Support**: `{ type: 'support', effect: 'heal'|'cleanse'|'shield', heal?: number, shieldValue?: number }`
3. **Adding New Cards**:
   - Define in [src/models/cardTypes.js](src/models/cardTypes.js) CARD_TYPES object
   - Add to job-specific pool in `generateCard()` in [src/utils/cardGeneration.js](src/utils/cardGeneration.js)
   - If new type, add handler in [src/controllers/cardController.js](src/controllers/cardController.js) `playCard()` function

### Status Effect Workflow
1. **Definition**: Each status effect in [src/models/statusEffects.js](src/models/statusEffects.js) has: name, icon, duration, damagePerTurn (optional), skipTurn (optional)
2. **Application**: Elemental magic buffs carry `statusEffect: 'TYPE'`. When magic attack hits, `resolveAttack()` calls `applyStatusEffect()` to add status to target.
3. **Processing**: At turn end, `confirmEndTurn()` calls `processStatusEffects()` which: (1) applies damage-over-time effects, (2) decrements durations, (3) removes expired effects. Events logged to Battle Log.

### Support Card Workflow
1. **Play**: `playCard()` with `card.type === 'support'` → checks `canHeroUseCard()` → checks `heroSupportCounts` and READY buff → enters `selectingSupportTarget` mode
2. **Target Selection**: Player clicks teammate in UI → `selectTarget(heroId)` applies effect (heal, cleanse, or shield) → increments `heroSupportCounts[heroId]` counter
3. **Counter Reset**: `confirmEndTurn()` resets `heroSupportCounts` for next turn
4. **Effects**: Use helper functions in [src/controllers/supportController.js](src/controllers/supportController.js): `applyShield()`, `healHero()`, `cleanseHero()`

### Attack & Buff Workflow
1. **Buff Play**: `handlePlayBuff()` validates buff requirements (e.g., elemental magic requires Mage, requires magic attack cards). Sets `activeBuff` and `remainingAttacks`.
2. **Attack Play**: `playCard()` with `card.type === 'attack'` → enters `selectingTarget` mode → player clicks opponent hero → `playAttack()` sets `pendingAttack` + `waitingForReaction`
3. **Reaction**: Defender plays defense card or skips → `resolveAttack()` applies damage, buffs, status effects → if buff has extra attacks, loops; else `confirmEndTurn()`
4. **Extra Attacks**: READY buff grants 2 attacks per turn; loop continues until `remainingAttacks === 0`, then `confirmEndTurn()` ends turn

### Shield System
1. **Current**: `applyShield()` adds to hero's `shield` property (visual only, doesn't reduce damage yet)
2. **Future Enhancement**: To implement shield damage reduction, modify `resolveAttack()` to consume shield before HP damage, decrement `hero.shield` when damage taken

### Hero Skill Restrictions
1. **Attack Type Restrictions**:
   - Melee: physical attacks only
   - Ranged: ranged attacks only
   - Mage: magic attacks + elemental magic buffs
   - Support: magic attacks + support cards
2. **Buff Type Restrictions**:
   - Elemental magic (Fire, Ice, Wind, Earth, Ivy, Lightning): Mage only, requires magic attack card in hand
   - Ready: requires 2+ attack cards in hand
   - Other buffs (Focus, Charge, Feint): require 1+ attack card in hand
3. **Support Card Restrictions**: Support heroes only (enforced in `canHeroUseCard()` and `playCard()`)

### Draw & Discard
1. **Flow**: Hand starts at 5 cards (drawn in `startGame()`). When player plays a card, hand size decreases. To draw new cards: `drawOneAndDiscard()` → `waitingForDiscard` → player selects card to discard → `drawCardsToFive()` refills hand to 5.
2. **Refill**: Called at turn end in `confirmEndTurn()` and after draw/discard action. Always passes correct player name ('player1' or 'player2') and current heroes state.

### Multiattack Loop (READY buff)
1. **State Management**: `activeBuff` tracks current buff. `remainingAttacks` tracks attacks left. `heroAttackCounts` tracks which heroes have attacked this turn.
2. **Flow**: After `resolveAttack()` completes, if `remainingAttacks > 0` and hero hasn't exceeded limit, `waitingForNextAttack` → player selects another target or defense hero plays counter → repeat until `remainingAttacks === 0` → `confirmEndTurn()`
3. **Early Abandon**: If hero's first attack is feint or misses (damage 0), can abandon buff and end turn manually via `confirmEndTurn()`

### Hero Skills System
1. **Skill Structure**: Each hero has one unique `heroSkill` object with `id`, `name`, `icon`, and `description`. Stored in [src/models/heroSkills.js](src/models/heroSkills.js) with full trigger and effect definitions.
2. **Current Skill Assignments**:
   - **Swordman** (Melee) → Power Strike 💥: Charge + Smash attack. Bonus: +3 damage, ignores Block, 50% stun chance
   - **Archer** (Ranged) → Headshot 🎯: Focus + Charge Shot. Bonus: ×1.5 damage, cannot be evaded, ignores Shield
   - **Wizard** (Mage) → Elemental Mastery 🌟: Elemental buff + Heavy Magic. Bonus: status duration +2 turns, DOT damage +2, splash 2 damage to adjacent
   - **Warrior** (Melee) → Blade Fury ⚔️: Ready + 2 Normal Attacks. Effect: each attack hits twice for 2 damage each
   - **Gunner** (Ranged) → Rapid Fire 🔫: 3 Quick Shots. Effect: hits all enemy heroes, 2 damage each
   - **Cleric** (Support) → Mass Heal 💚: 2 Heal cards consecutively. Effect: all allies heal 4 HP, removes Burn/Poison/Bleed
3. **Skill Detection Flow**:
   - Player plays attack card → `playAttackController()` calls `checkBuffAttackSkill()`
   - Function checks: hero job matches skill, activeBuff matches trigger, attack card matches trigger, first attack condition
   - If all conditions met, skill is detected and added to `pendingAttack` object
4. **Skill Application Flow**:
   - `applySkillToAttack()` modifies `pendingAttack` with skill properties: damage bonus, penetration flags, ignore defenses, status bonuses
   - `resolveAttackController()` reads these properties and applies effects: `ignoresBlock` bypasses block defense, `ignoreShield` bypasses shield absorption, extra damage is applied
   - Skill name and icon logged to Battle Log for visual feedback
5. **UI Display**:
   - Skill name displayed on hero card below job class in purple text (e.g., "💥 Power Strike")
   - When skill triggers, `skillIndicatorVisible` shows feedback (hides after 2 seconds)
   - Skill does NOT need to be separately selected or toggled—happens automatically when trigger conditions met
6. **Adding New Skills**:
   - Define in [src/models/heroSkills.js](src/models/heroSkills.js) with trigger and effect properties
   - Add to hero in [src/models/heroesModel.js](src/models/heroesModel.js) via `heroSkill` property
   - Implement detection logic in [src/controllers/skillController.js](src/controllers/skillController.js) (already handles buff+attack pattern)
   - Ensure `applySkillEffects()` in heroSkills.js handles the new effect type

## Editing Examples
- **Add new attack card**: Define in CARD_TYPES (e.g., `FIRE_STRIKE: { name: 'Fire Strike', damage: 5, type: 'attack', attackType: 'physical' }`), add to job-specific pools in `generateCard()`
- **Add new buff card**: Define in CARD_TYPES with `type: 'buff'`, specify `buffType`, `damageModifier`, `extraAttacks`. Validation in `playBuffController()`.
- **Add new status effect**: Define in `STATUS_EFFECTS` (e.g., `SLEEP: { name: 'Sleep', icon: '😴', skipTurn: true, duration: 2 }`). Create elemental magic card that applies it. `applyStatusEffect()` and `processStatusEffects()` handle rest.
- **Add support card**: Define in CARD_TYPES (e.g., `REVIVE: { name: 'Revive', type: 'support', effect: 'revive', heal: 0 }`). Add handler in `selectTarget()` in [src/controllers/cardController.js](src/controllers/cardController.js). Create helper in [src/controllers/supportController.js](src/controllers/supportController.js).
- **Implement shield mechanics**: Currently `applyShield()` adds visual shield. To reduce damage: modify `resolveAttackController()` to consume shield before HP, and update damage display.
- **Add new hero skill**: Define in [src/models/heroSkills.js](src/models/heroSkills.js) with trigger and effect, assign to hero in `heroesModel.js`, implement trigger detection in [src/controllers/skillController.js](src/controllers/skillController.js), add effect application logic to `applySkillEffects()`
- **Add new job class**: Define in [src/models/jobClasses.js](src/models/jobClasses.js), add hero in `createAllHeroes()` in [src/models/heroesModel.js](src/models/heroesModel.js), add card generation logic in `generateCard()`, update `canHeroUseCard()` if needed

## UI/UX Notes (Preserve These)
- **Draw-when-full flow**: Only when hand is full (5 cards) can player click "Draw & Discard" → `drawOneAndDiscard()` adds card and sets `waitingForDiscard` → UI highlights new card with green pulse ring → player must click a card to discard (can be the new card or existing).
- **Reaction window**: When `waitingForReaction` is true, only the *defending* player may play cards, and *only defense cards*. Other players' hands are greyed out. Attacker sees "Defend?" prompt with "Take Damage" button to skip. After resolution, status effects are NOT processed yet—only at `confirmEndTurn()`.
- **Attack target selection**: When player plays an attack, `selectingTarget` becomes true, opponent hero grid gets green borders, and player must click an opponent hero to target. Defeated heroes cannot be targeted.
- **Support card targeting**: When player plays a support card, `selectingSupportTarget` becomes true, own team hero grid gets green borders, and player must click a teammate (can target self). Defeated heroes cannot be targeted. Max 1 use per turn, 2 with READY buff.
- **Status effect display**: Heroes show active status effects (icons + durations) on their cards. At end of turn, `processStatusEffects()` applies damage-over-time, decrements durations, and removes expired effects. Battle Log logs each effect application.

## Debugging Tips
- Use Battle Log (bottom panel) to trace event order; prefer `addLog()` over `console.log`.
- Run `npm run dev`, inspect browser console for stack traces. Most logic is synchronous in controllers and [src/App.jsx](src/App.jsx).
- Check state values by adding temporary `addLog()` statements (e.g., `addLog(\`Debug: activeBuff = ${activeBuff}, remainingAttacks = ${remainingAttacks}\`)`) to trace game state.
- For support cards: verify `heroSupportCounts` tracked, check if READY buff active for 2-use rule, confirm `selectingSupportTarget` correctly shows only own team as targets.
- For card drawing: ensure `drawCardsToFive()` called with correct player name format ('player1'/'player2' lowercase, no spaces) and updated heroes state passed.
- For controller debugging: pass `addLog` to all controller functions to log state transitions and verify parameter passing.

## What NOT to Change Without Discussion
- **Don't bypass controllers**: Game logic should flow through controller functions, not directly in components or App.jsx state setters. Controllers are the source of truth for game rules.
- **Don't alter core turn/attack resolution logic** in [src/controllers/turnController.js](src/controllers/turnController.js) or [src/controllers/damageController.js](src/controllers/damageController.js) without confirming game balance implications (especially multi-attack flow, status effect timing, support card usage limits).
- **Don't modify hero HP logic** (clamp, defeat state, victory check) without approval—these affect gameplay.
- **Don't alter status effect timing**: Effects apply on hit, not at resolution end; durations decrement at turn end, not mid-combat.
- **Don't change support card targeting** without discussion—allows any teammate (same team only), not opponents.
- **Don't modify `useGameState.js` hook structure** without discussion—central to entire app state management.
- **Don't alter `addLog()` messages** unless clarifying UX; these are gameplay-critical and part of the user experience.
- **Don't change hero skill triggers** without verifying balance—skills are core gameplay feature affecting win conditions
- **Don't modify skill effect application** in damage controller without testing all skill interactions (ignoresBlock, ignoreShield, damage bonuses, status effects)

## Known Issues & Future Features
- **Shield Implementation**: `applyShield()` currently adds to hero's `shield` property (visual only). Shield doesn't reduce damage yet. To implement: modify `resolveAttackController()` to consume shield before HP damage.
- **Elemental Magic Cards**: Currently use `type: 'buff'` (confusing naming). Consider refactoring to `type: 'elementalAttack'` or similar for clarity.
- **Multi-Hero Coordination**: No active hero selection UI during combat—players must click hero cards to switch before playing cards. Consider adding "Select Hero" button.
- **Card Generation Balance**: Mages get many elemental magic cards; consider rebalancing pools if certain cards feel overpowered.
- **Advanced Skills**: Currently supports buff+attack triggers. Future versions could support multi-card sequences, reactive skills (triggered on defense), and area-of-effect skills.
- **Test Suite**: No tests configured. Future tests should cover: damage calculations, skill detection/application, status effect application/duration, card generation (Mage elemental pool), HP clamping, victory detection, multi-attack loops.

## Testing & CI
No tests configured. If adding tests, focus on: skill detection/application, damage calculations with skill effects, status effect application/duration, card generation (Mage elemental pool), HP clamping, victory detection, multi-attack loops.

## Clarification Needed?
Ask before changing: turn resolution, draw mechanics (card generation pools, `drawCardsToFive()` parameter format), buff/attack interaction, support card usage limits/targeting, feint/counter logic, status effect timing, skill triggers and effects—these are gameplay-critical balance points.
