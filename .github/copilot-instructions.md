# Copilot / AI Agent Instructions for react_heroes_battle

Purpose
- Give concise, actionable guidance for editing and extending this small single-page React game so an AI agent can be immediately productive.

Quick start (dev & build)
- Start dev server: `npm run dev` (Vite -> http://localhost:5173)
- Build for production: `npm run build`
- Preview production build locally: `npm run preview`
- Lint: `npm run lint`

Big picture (why & architecture)
- This is a single-page React app built with Vite and TailwindCSS. There is no backend or external API integration.
- UI and full game logic are centralized in `src/App.jsx`. The app uses React hooks (useState) to manage all game state.
- CSS is managed with Tailwind (see `tailwind.config.js`) and a small `App.css` / `index.css` for global styles.
- Primary dev flow: edit `src/App.jsx`, run `npm run dev`, and verify behavior in the browser UI and the Game Log panel.

Key files / where to look first
- `src/App.jsx` — single source of truth for game logic: turn flow, card generation, reactions, and UI rendering.
- `src/main.jsx` — React entrypoint and mounts `App`.
- `index.html`, `vite.config.js` — Vite entry and build config.
- `package.json` — scripts: `dev`, `build`, `preview`, `lint`.
- `tailwind.config.js`, `postcss.config.js` — Tailwind/PostCSS setup.

Important project-specific patterns & conventions (concrete)
- Centralized state: `App.jsx` holds all state variables. When adding or refactoring game behavior, prefer extending or composing helper functions inside this file rather than adding global stores.
  - Important state vars: `heroes`, `currentTurn`, `player1Hand`, `player2Hand`, `selectedCard`, `gameLog`, `gameOver`, `winner`, `waitingForReaction`, `pendingAttack`, `gameStarted`, `turnPhase`, `drawnCard`, `waitingForDiscard`.
- Game phases: A player's turn uses `turnPhase` with values `'draw'` and `'action'`. Use `endTurn()` to switch players and call `drawCardsToFive()` to refill hands.
- Card flow examples (code locations in `src/App.jsx`):
  - Card generation: `generateCard()` creates an attack or block card.
  - Drawing logic: `drawCardsToFive()` fills hand up to 5; `drawOneAndDiscard()` handles draw-when-full flow.
  - Playing cards: `playCard(card)` routes attack vs defense logic. Attack handling uses `playAttack(card)` -> sets `pendingAttack` and `waitingForReaction`.
  - Reaction handling: defender calls `resolveAttack(blockCard)`; a `null` block means skipBlock -> take damage.
- Logging: Use `addLog(message)` to append events to the visible Game Log. This keeps UI feedback consistent.
- HP and victory: Update hero HP via `setHeroes(...)` and call `checkVictory(newHeroes)` to trigger end-of-game flow and the Game Over UI.

UI / UX notes agents should preserve
- The game presents explicit states: TURN, DEFENDING (when waiting for reaction), and a Game Log. Preserve existing messages and ordering when changing behavior.
- When drawing a single card into a full hand, the UI highlights the newly drawn card using `drawnCard` and expects the user to choose a discard.
- Block cards are allowed only during `waitingForReaction` and only by the defender. The UI enforces this via `disabled` logic in card buttons.

Editing guidance & examples
- To add a new card type, update `CARD_TYPES` at top of `src/App.jsx` and ensure generation logic in `generateCard()` can choose it.
- To add a UI action that affects game state, use the existing helper patterns: modify state through `setX()` and produce visible feedback with `addLog()`.
- Example: to add a heal card that restores 4 HP to the user:
  - Add CARD_TYPES.HEAL = { name: 'Heal', heal: 4, type: 'heal' }
  - Update `generateCard()` probability table.
  - In `playCard()`, detect `card.type === 'heal'` and implement handler that updates `heroes[currentTurn].hp` (clamped to `maxHp`) via `setHeroes` and adds `addLog()` entry.

Debugging tips specific to this project
- Use the in-app Game Log (bottom panel) to trace actions; prefer adding `addLog()` calls instead of console.log so events show in the UI.
- Run `npm run dev` and open the browser console if you need stack traces — most logic runs synchronously in `src/App.jsx` so errors will appear in the console.

What NOT to change without confirmation
- Don't split the single `App.jsx` into many files automatically; this is a small demo and reviewers expect the logic concentrated there. Propose refactors before performing large moves.
- Avoid changing user-facing game messages (strings added by `addLog`) unless improving clarity; these are part of the UX and tests.

When adding tests or CI
- No tests configured today. If adding tests, prefer simple unit tests around pure helper functions (e.g., damage calculations, draw logic) rather than full UI e2e tests.

If you need more context / missing pieces
- Ask for clarification before changing turn resolution, end-turn drawing behavior, or the discard-on-draw flow — these are gameplay-critical and small changes can alter balance.

End note
- This file is intentionally concise — if you'd like richer guidance (component split patterns, sample tests, or recommended refactors), ask and I will expand with concrete refactor steps and code examples.
