# React Heroes Battle - Game Design Document

## Table of Contents

1. [Game Concept](#game-concept)
2. [Teams & Heroes](#teams--heroes)
3. [Card System](#card-system)
4. [Turn Flow](#turn-flow)
5. [Combat Mechanics](#combat-mechanics)
6. [Buff System](#buff-system)
7. [Defense Mechanics](#defense-mechanics)
8. [Status Effects](#status-effects)
9. [Hero Skills](#hero-skills)
10. [Win Condition & Strategy](#win-condition--strategy)
11. [Architecture Overview](#architecture-overview)

---

## Game Concept

React Heroes Battle is a **tactical turn-based 3v3 card battle game**. Two players each command a team of three heroes with distinct roles. Each turn, players draw cards from a shared pool, play buffs, launch attacks, and defend against incoming damage. The strategic depth comes from **card combinations that trigger powerful hero skills**, a rock-paper-scissors defense system, and status effects that can lock down opponents.

**Core Fantasy:** Assemble a team, master each hero's skill combo, and outplay your opponent through card synergy and tactical timing.

---

## Teams & Heroes

### Player 1

| Hero       | Job     | HP  | Skill            | Role                         |
|------------|---------|-----|------------------|------------------------------|
| Swordman   | Melee   | 60  | Power Strike     | High-HP frontline tank/burst |
| Archer     | Ranged  | 40  | Headshot         | Precision single-target DPS  |
| Wizard     | Mage    | 40  | Elemental Mastery| Status effects & AoE splash  |

### Player 2

| Hero       | Job     | HP  | Skill            | Role                         |
|------------|---------|-----|------------------|------------------------------|
| Warrior    | Melee   | 65  | Blade Fury       | Consistent multi-hit damage  |
| Gunner     | Ranged  | 40  | Rapid Fire       | Multi-target chip damage     |
| Cleric     | Support | 45  | Mass Heal        | Team healer & cleanser       |

### Job Classes

| Class   | HP Range | Attack Cards           | Unique Capability                       |
|---------|----------|------------------------|-----------------------------------------|
| Melee   | 60-65    | Strike (3), Smash (6)  | High HP, physical attacks, Counter      |
| Ranged  | 40       | Quick Shot (3), Focus Shot (6) | Focus/Ready buffs, Counter       |
| Mage    | 40       | Bolt (3), Blast (6)    | All 6 elemental magic buffs, Deflect    |
| Support | 45       | Bolt (3), Blast (6)    | Heal, Cure, Shield cards, Deflect       |

---

## Card System

### Card Types

#### Attack Cards (Job-Specific)

| Card        | Damage | Type     | Available To      |
|-------------|--------|----------|-------------------|
| Strike      | 3      | Physical | Melee             |
| Smash       | 6      | Physical | Melee             |
| Quick Shot  | 3      | Ranged   | Ranged            |
| Focus Shot  | 6      | Ranged   | Ranged            |
| Bolt        | 3      | Magic    | Mage, Support     |
| Blast       | 6      | Magic    | Mage, Support     |

#### Buff Cards

| Card             | Damage Mod | Extra Attacks | Special                          |
|------------------|------------|---------------|----------------------------------|
| Charge           | +2         | 2             | 50% stun on 0-damage hit (risky) |
| Focus            | +1         | 0             | Available to Ranged heroes        |
| Ready            | +0         | 2             | Pure extra attacks                |
| Feint            | -1         | 0             | Makes attack unavoidable          |
| Elemental Magic  | +0         | 0             | Applies a status effect (6 types) |

> Buffs are played **before** attack cards. Only one buff per attack sequence.

#### Defense Cards (Universal)

| Card     | Effect                                         |
|----------|-------------------------------------------------|
| Block    | Reduces physical damage by 4                    |
| Evade    | Nullifies any attack (except unavoidable)        |
| Counter  | Reflects 50% physical damage back to attacker    |
| Deflect  | Reflects 50% magic damage back; can reflect status effects |

#### Support Cards (Support Heroes Only)

| Card   | Effect                                |
|--------|---------------------------------------|
| Heal   | Restores 6 HP to a teammate           |
| Cure   | Removes all status effects             |
| Shield | Grants 10 shield to a teammate        |

### Hand Rules

- Each player holds **5 cards** maximum.
- Hands are **refilled to 5** at the start of each turn.
- Cards are drawn randomly from a pool based on which heroes are still alive.
- **Draw & Discard:** Once per turn (after turn 2), a player may draw 1 extra card and must discard 1 card.

### Card Pool

Each living hero contributes cards to the draw pool:

- **Melee:** 2x Strike, 2x Smash, 2x Counter
- **Ranged:** 2x Quick Shot, 2x Focus Shot, 2x Counter
- **Mage:** 2x Bolt, 2x Blast, 2x Elemental buffs, 1x Deflect
- **Support:** 1x Bolt, 1x Blast, 1x Cure, 1x Shield, 1x Heal, 1x Deflect
- **All heroes:** Focus, Charge, Ready, Feint, Block, Evade

> When a hero is defeated, their cards are **removed from the pool**, shrinking available options.

---

## Turn Flow

```
┌─────────────────────────────────────────────┐
│              TURN START                      │
│  - Hand refilled to 5 cards                 │
│  - Player selects an active hero            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           ACTION PHASE (repeat)             │
│                                             │
│  Option A: Play a Buff card                 │
│    → Sets damage modifier & extra attacks   │
│    → Must follow with attack card(s)        │
│                                             │
│  Option B: Play an Attack card              │
│    → Select target enemy hero               │
│    → Skill check (card combo triggers?)     │
│    → Creates pending attack                 │
│    → Opponent enters REACTION PHASE         │
│                                             │
│  Option C: Play a Support card              │
│    → Select target teammate                 │
│    → Apply heal / cure / shield             │
│    → Limited to 1-2 per turn                │
│                                             │
│  Option D: Draw & Discard (once per turn)   │
│    → Draw 1 card, then discard 1 card       │
│                                             │
│  Option E: End Turn                         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           REACTION PHASE                    │
│  - Defending player can play 1 defense card │
│    OR take full damage                      │
│  - Damage resolved (with skill modifiers)   │
│  - Status effects applied if attack lands   │
│  - Shield absorbs before HP                 │
│  - Defeated check                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           TURN END                          │
│  - Process all status effects (DOT ticks)   │
│  - Decrement status durations               │
│  - Check for victory                        │
│  - Reset buff/attack state                  │
│  - Switch active player                     │
└─────────────────────────────────────────────┘
```

---

## Combat Mechanics

### Damage Calculation

```
Final Damage = (Base Card Damage + Buff Modifier + Skill Bonus) - Defense Reduction
```

- **Shield:** Absorbs damage before HP. Multiple shields stack.
- **Minimum Damage:** 0 (damage cannot go negative).
- **Charge Risk:** If a Charge-buffed attack deals 0 damage, there is a **50% chance the attacker is stunned**.

### Attack Limits

| Scenario             | Attacks Allowed |
|----------------------|-----------------|
| No buff              | 1               |
| Charge buff          | 3 (1 + 2 extra) |
| Ready buff           | 3 (1 + 2 extra) |
| Focus / Feint buff   | 1               |

### Targeting Rules

- Attack cards can only target **enemy** heroes.
- Support cards can only target **allied** heroes (including self).
- A hero must be **alive** to be targeted.
- A hero must be **able to act** (not frozen/stunned) to play cards.

---

## Buff System

Buffs are played **before** attacks and modify the entire attack sequence:

| Buff            | Modifier | Extra Attacks | Special Effect                              |
|-----------------|----------|---------------|---------------------------------------------|
| **Charge**      | +2 dmg   | +2            | 50% stun self if any hit deals 0 dmg        |
| **Focus**       | +1 dmg   | 0             | Ranged heroes only                           |
| **Ready**       | +0 dmg   | +2            | Pure multi-attack enabler                    |
| **Feint**       | -1 dmg   | 0             | Attack becomes **unavoidable** (ignores Evade/Counter) |
| **Fire Magic**  | +0 dmg   | 0             | Applies **Burn** on hit                      |
| **Ice Magic**   | +0 dmg   | 0             | Applies **Freeze** on hit                    |
| **Wind Magic**  | +0 dmg   | 0             | Applies **Bleed** on hit                     |
| **Earth Magic** | +0 dmg   | 0             | Applies **Stun** on hit                      |
| **Ivy Magic**   | +0 dmg   | 0             | Applies **Poison** on hit                    |
| **Lightning**   | +0 dmg   | 0             | Applies **Paralyze** on hit                  |

---

## Defense Mechanics

During the **Reaction Phase**, the defending player may play one defense card:

| Defense      | vs Physical              | vs Ranged                | vs Magic                 |
|--------------|--------------------------|--------------------------|--------------------------|
| **Block**    | Reduces damage by 4      | Reduces damage by 4      | No effect                |
| **Evade**    | Dodges completely        | Dodges completely        | Dodges completely        |
| **Counter**  | Reflects 50% damage back | Reflects 50% damage back | No effect                |
| **Deflect**  | No effect                | No effect                | Reflects 50% dmg + status|

### Defense Interactions with Skills

- **Power Strike** ignores Block
- **Headshot** is unavoidable and ignores shields
- **Feint** makes attacks unavoidable (Evade/Counter fail)
- **Sniper Focus** is unavoidable and unblockable
- **Spell Reflect** upgrades Deflect to 100% reflection

---

## Status Effects

| Effect       | Icon | Duration | Damage/Turn | Effect                          | Source          |
|--------------|------|----------|-------------|----------------------------------|-----------------|
| **Burn**     | fire     | 2 turns  | 2 DOT      | Damage over time                 | Fire Magic      |
| **Freeze**   | ice     | 2 turns  | -           | **Skip turn** entirely           | Ice Magic       |
| **Bleed**    | blood     | 2 turns  | 2           | Takes damage when acting         | Wind Magic      |
| **Stun**     | dizzy     | 1 turn   | -           | **Skip turn** entirely           | Earth Magic / Power Strike |
| **Poison**   | skull     | 3 turns  | 3 DOT      | Strongest DOT                    | Ivy Magic       |
| **Paralyze** | lightning     | 1 turn   | -           | **Prevents ALL hero skills**     | Lightning Magic |

### Status Removal

| Method            | Removes        | Available To |
|-------------------|----------------|--------------|
| Cure card         | All effects    | Support hero |
| Mass Heal skill   | Burn/Poison/Bleed | Support hero |
| Purification skill| All + 1 turn immunity | Support hero |

### Status Priority

- **Freeze/Stun** are the most disruptive (skip entire turn).
- **Paralyze** is strategically unique (blocks skills but allows normal play).
- **Poison** deals the most total damage (3 dmg x 3 turns = 9).
- **Burn** is the most common elemental DOT (2 dmg x 2 turns = 4).
- **Bleed** punishes active play (damage on action).

---

## Hero Skills

Skills are **not separate cards** - they are powerful combo effects triggered by playing specific card combinations. Each hero has a unique skill, plus there are universal skills available to all heroes.

### Melee Skills

#### Power Strike (Swordman)
- **Trigger:** Charge + Smash (must be the first attack)
- **Effect:** +3 bonus damage (total 11), ignores Block, 50% stun chance
- **Counter:** Evade still works; Shield absorbs damage

#### Blade Fury (Warrior)
- **Trigger:** Ready + Strike x2 consecutively
- **Effect:** Each attack hits twice for 2 damage each (total 8 damage across hits)
- **Counter:** Each individual hit can be defended separately

#### Counter Stance
- **Trigger:** Block + Counter in hand, played in sequence
- **Effect:** -5 damage taken on next attack, reflects 100% damage back
- **Counter:** Magic attacks bypass this (use Bolt/Blast instead)

### Ranged Skills

#### Headshot (Archer)
- **Trigger:** Focus + Focus Shot (must be the first attack)
- **Effect:** 1.5x damage (total ~10), unavoidable, ignores shields
- **Counter:** Block still reduces damage; only Paralyze prevents it

#### Rapid Fire (Gunner)
- **Trigger:** Quick Shot x3 in hand
- **Effect:** Hits ALL enemy heroes for 2 damage each
- **Counter:** Low per-target damage; healing can outheal it

#### Sniper Focus
- **Trigger:** Ready buff, skip first attack, use second attack
- **Effect:** +4 damage, unavoidable, unblockable
- **Counter:** Deflect works if it's magic; Paralyze prevents it

### Mage Skills

#### Elemental Mastery (Wizard)
- **Trigger:** Any elemental buff + Blast
- **Effect:** Status lasts +2 turns, DOT +2 damage/turn, 2 splash to adjacent heroes
- **Counter:** Deflect reflects status; Cure removes it

#### Arcane Surge
- **Trigger:** Bolt x2 consecutively
- **Effect:** +4 damage per hit, ignores shields, 50% chain to random enemy
- **Counter:** Deflect reflects damage; Block does nothing (magic)

#### Spell Reflect
- **Trigger:** Receive a magic attack + play Deflect (reactive)
- **Effect:** Reflects 100% damage (not 50%), reflects status, +2 bonus damage
- **Counter:** Physical attacks bypass this entirely

#### Frost Nova
- **Trigger:** Ice buff + Attack x2
- **Effect:** ALL enemies take 1 damage + Frozen for 1 turn
- **Counter:** Low damage; effects can be cured next turn

### Support Skills

#### Divine Protection (Cleric)
- **Trigger:** Shield x2 on different allies
- **Effect:** ALL allies gain +5 shield, -2 damage taken for 1 turn
- **Counter:** Shield-piercing attacks (Headshot) bypass shields

#### Mass Heal
- **Trigger:** Heal x2 consecutively
- **Effect:** ALL allies heal 4 HP, removes Burn/Poison/Bleed
- **Counter:** Focus fire to kill before heals; apply Freeze to prevent casting

#### Purification
- **Trigger:** Cure + Shield on same target
- **Effect:** Remove ALL status effects, 1-turn immunity, heal 3 HP
- **Counter:** Kill the support hero; Paralyze prevents skill trigger

#### Blessing
- **Trigger:** Heal x3 on same target
- **Effect:** Target gains +3 damage, -3 damage taken for 2 turns
- **Counter:** Hard to assemble (3 heals needed); status lock the support

### Universal Skills (Any Hero)

#### Desperate Strike
- **Trigger:** Hero HP <= 25% + Charge + any attack
- **Effect:** 2x damage, self-damage 5 HP, cannot miss or be blocked
- **Counter:** Extremely risky (self-damage may KO); only viable as finisher

#### Last Stand
- **Trigger:** Last hero alive on team + Block
- **Effect:** -10 damage taken, 3 counter damage to all attackers for 1 turn
- **Counter:** Wait it out (1 turn duration); use magic (Block is physical)

---

## Win Condition & Strategy

### Victory

**First team to eliminate all 3 opposing heroes wins.**

### Strategic Archetypes

| Strategy        | Key Heroes        | Approach                                        |
|-----------------|-------------------|-------------------------------------------------|
| **Burst**       | Swordman, Archer  | Power Strike / Headshot to eliminate heroes fast |
| **Chip/Spread** | Gunner            | Rapid Fire to wear down entire team              |
| **Status Lock** | Wizard            | Paralyze to block skills, Freeze/Stun to skip turns |
| **Sustain**     | Cleric            | Mass Heal + Divine Protection to outlast         |
| **Tempo**       | Warrior           | Blade Fury for consistent pressure every turn    |

### Key Strategic Considerations

1. **Card Economy:** Dead heroes remove cards from the pool. Losing your Mage removes elemental options entirely.
2. **Skill Timing:** Skills require specific combos. Drawing the right cards is partly luck - plan around what you have.
3. **Paralyze Priority:** The only way to prevent enemy skills. Lightning Magic on the Wizard is a high-value play.
4. **Support Targeting:** Killing the Cleric early removes healing, shields, and cure - but the Cleric has 45 HP and self-heal.
5. **Defense Reads:** Choosing the right defense card is a mind game. Block vs Evade vs Counter depends on predicting the attack type.
6. **Buff Commitment:** Playing a buff commits you to an attack sequence. If defended well, the buff is wasted.

---

## Architecture Overview

### Component Structure

```
App.jsx                          # Main game state & orchestration
├── Battlefield.jsx              # Displays all 6 heroes (HP, shields, status)
├── Hand.jsx                     # Player's 5-card hand with play indicators
├── Controls.jsx                 # Action buttons (Start, End Turn, Draw)
├── BattleLog.jsx                # Scrolling combat message log
├── StatusBanners.jsx            # Current action info display
├── SkillIndicatorWithTooltip.jsx# Skill activation announcement
└── GameOverModal.jsx            # Victory screen & reset
```

### MVC Pattern

| Layer        | Files                               | Responsibility                        |
|--------------|-------------------------------------|---------------------------------------|
| **Models**   | `models/heroesModel.js`, `cardTypes.js`, `heroSkills.js`, `jobClasses.js`, `statusEffects.js`, `initialState.js` | Data definitions & constants |
| **Views**    | `components/*.jsx`                  | React components & UI rendering       |
| **Controllers** | `controllers/cardController.js`, `attackController.js`, `damageController.js`, `skillController.js`, `supportController.js`, `turnController.js` | Business logic & game rules |
| **Utils**    | `utils/gameLogic.js`, `cardGeneration.js`, `cardVisuals.js`, `skillTooltip.js` | Shared helpers |

### State Management

The game uses **React local state** (useState hooks) in App.jsx. No external state library. Key state groups:

- **Team State:** heroes, currentTurn, activeHeroIndex
- **Combat State:** pendingAttack, activeBuff, remainingAttacks, waitingForReaction
- **Card State:** player1Hand, player2Hand, drawnCard, drawUsedThisTurn
- **Game State:** gameLog, gameOver, winner, turnCount, triggeredSkill

### Tech Stack

- **React 19** with hooks
- **Vite 7** (build tool)
- **Tailwind CSS 3** (styling)
- **No external state management** - pure React useState
