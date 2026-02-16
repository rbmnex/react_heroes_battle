# Step-by-Step: Implementing Power Strike Skill

This guide walks through implementing a SINGLE skill (Power Strike) from start to finish.

## What is Power Strike?
- **Hero Class:** Melee only
- **Trigger:** Charge buff + Smash (Heavy Attack) on first attack
- **Effect:** +3 damage, ignores Block, 50% chance to Stun

---

## Step 1: Add the Skill to Your Game State

### In `initialState.js`
Add these properties:

```javascript
export const createInitialGameState = () => ({
  // ... existing state
  triggeredSkill: null,
  skillIndicatorVisible: false,
});
```

### In `useGameState.js`
Add state management:

```javascript
const [triggeredSkill, setTriggeredSkill] = useState(initialState.triggeredSkill);
const [skillIndicatorVisible, setSkillIndicatorVisible] = useState(initialState.skillIndicatorVisible);

// In the return statement:
return {
  // ... existing returns
  triggeredSkill, setTriggeredSkill,
  skillIndicatorVisible, setSkillIndicatorVisible,
};
```

---

## Step 2: Detect When Power Strike Should Trigger

### In your attack selection logic (probably `attackController.js` or similar)

Find where you create the `pendingAttack` object. BEFORE that, add:

```javascript
// Let's say you have these variables already:
// - attackerHero (the hero attacking)
// - attackCard (the attack card being played)
// - activeBuff (currently active buff)
// - heroAttackCounts (tracking attacks per hero)

// Check if this is the first attack by this hero this turn
const attackCount = heroAttackCounts[attackerHero.id] || 0;
const isFirstAttack = attackCount === 0;

// Check for Power Strike trigger
let triggeredSkill = null;

// Requirements for Power Strike:
// 1. Hero must be Melee class
// 2. Charge buff must be active
// 3. Attack card must be Smash (Heavy Attack)
// 4. Must be first attack of the sequence
// 5. Hero must not be Paralyzed

const canUseSkills = !attackerHero.statusEffects.some(e => e.preventSkills);

if (canUseSkills &&
    attackerHero.job.name === 'Melee' &&
    activeBuff &&
    activeBuff.buffType === 'charge' &&
    attackCard.name === 'Smash' &&
    isFirstAttack) {
  
  // Power Strike triggered!
  triggeredSkill = {
    id: 'POWER_STRIKE',
    name: 'Power Strike',
    icon: '💥',
    description: 'Devastating blow that ignores defense',
    damageBonus: 3,
    ignoresBlock: true,
    stunChance: 0.5
  };
  
  // Show skill indicator
  setTriggeredSkill(triggeredSkill);
  setSkillIndicatorVisible(true);
  
  // Hide after 2 seconds
  setTimeout(() => {
    setSkillIndicatorVisible(false);
  }, 2000);
  
  // Log to game log
  addLog(`💥 SKILL: Power Strike! Devastating blow that ignores defense!`);
}

// Create pending attack WITH skill data
const pendingAttack = {
  card: {
    ...attackCard,
    damage: attackCard.damage + (triggeredSkill ? triggeredSkill.damageBonus : 0)
  },
  attacker: currentTurn,
  attackerHero,
  defender: opponentTeam,
  defenderHero: targetHero,
  isFeint: activeBuff && activeBuff.unavoidable,
  // Add skill-specific data
  skillTriggered: triggeredSkill ? triggeredSkill.id : null,
  skillName: triggeredSkill ? triggeredSkill.name : null,
  skillIcon: triggeredSkill ? triggeredSkill.icon : null,
  ignoresBlock: triggeredSkill ? triggeredSkill.ignoresBlock : false,
  stunChance: triggeredSkill ? triggeredSkill.stunChance : 0
};

setPendingAttack(pendingAttack);
setWaitingForReaction(true);
```

---

## Step 3: Modify Damage Resolution to Handle Power Strike

### In `damageController.js`, in the `resolveAttackController` function:

```javascript
export const resolveAttackController = (
  defenseCard,
  // ... other parameters
  pendingAttack,
  // ... more parameters
) => {
  if (!pendingAttack) return;

  // Destructure skill-related properties
  const { 
    card, 
    attacker, 
    attackerHero, 
    defender, 
    defenderHero, 
    isFeint,
    skillTriggered,
    skillName,
    skillIcon,
    ignoresBlock,
    stunChance
  } = pendingAttack;

  let defenderDamage = card.damage;
  let attackerDamage = 0;

  // Handle defense card
  if (defenseCard) {
    // Remove defense card from hand
    if (defender === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== defenseCard.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== defenseCard.id));
    }

    // Check defense type
    if (defenseCard.defenseType === 'block' && ignoresBlock) {
      // Power Strike ignores Block!
      addLog(`💥 ${skillName} penetrates the defense! Block has no effect!`);
      // Damage stays as-is
    } else if (defenseCard.defenseType === 'block' && !ignoresBlock) {
      // Normal block works
      defenderDamage = Math.max(0, card.damage - defenseCard.defense);
      addLog(`🛡️ Blocked to ${defenderDamage}!`);
    } else if (defenseCard.defenseType === 'evade') {
      defenderDamage = 0;
      addLog(`💨 ${defenderHero.name} evades!`);
    } else if (defenseCard.defenseType === 'counter' && card.attackType === 'physical') {
      defenderDamage = Math.floor(card.damage * 0.5);
      attackerDamage = Math.floor(card.damage * 0.5);
      addLog(`⚡ Counter! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
    } else {
      addLog(`⚠️ ${defenseCard.name} doesn't work!`);
    }
  } else {
    // No defense
    if (skillTriggered) {
      addLog(`💥 ${skillName} - Full damage: ${defenderDamage}!`);
    } else {
      addLog(`💥 Full damage!`);
    }
  }

  // Apply damage to heroes
  const newHeroes = {
    player1: heroes.player1.map(h => {
      if (h.id === defenderHero.id && defender === 'player1') {
        const newHp = Math.max(0, h.hp - defenderDamage);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      if (h.id === attackerHero.id && attacker === 'player1') {
        const newHp = Math.max(0, h.hp - attackerDamage);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      return h;
    }),
    player2: heroes.player2.map(h => {
      if (h.id === defenderHero.id && defender === 'player2') {
        const newHp = Math.max(0, h.hp - defenderDamage);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      if (h.id === attackerHero.id && attacker === 'player2') {
        const newHp = Math.max(0, h.hp - attackerDamage);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      return h;
    })
  };

  // Apply Stun effect if Power Strike triggered
  if (skillTriggered === 'POWER_STRIKE' && stunChance > 0 && defenderDamage > 0) {
    const stunRoll = Math.random();
    if (stunRoll < stunChance) {
      // Apply stun status effect
      const stunEffect = {
        ...STATUS_EFFECTS.STUN,
        type: 'STUN',
        turnsRemaining: STATUS_EFFECTS.STUN.duration
      };

      newHeroes[defender] = newHeroes[defender].map(h =>
        h.id === defenderHero.id ? {
          ...h,
          statusEffects: [...h.statusEffects.filter(e => e.type !== 'STUN'), stunEffect]
        } : h
      );

      addLog(`💫 ${defenderHero.name} is STUNNED!`);
    }
  }

  setHeroes(newHeroes);

  // Log damage results
  if (defenderDamage > 0) {
    const updatedDefender = newHeroes[defender].find(h => h.id === defenderHero.id);
    addLog(`❤️ ${defenderHero.name}: ${defenderDamage} dmg (HP: ${updatedDefender.hp}/${updatedDefender.maxHp})${updatedDefender.defeated ? ' ☠️ DEFEATED!' : ''}`);
  }

  // ... rest of your existing damage resolution code
};
```

---

## Step 4: Create the Visual Skill Indicator

### Create `components/SkillIndicator.jsx`:

```javascript
import React from 'react';
import '../styles/SkillIndicator.css';

const SkillIndicator = ({ skill, visible }) => {
  if (!visible || !skill) return null;

  return (
    <div className="skill-indicator-overlay">
      <div className="skill-indicator">
        <div className="skill-icon-large">{skill.icon}</div>
        <div className="skill-details">
          <h2 className="skill-name">{skill.name}</h2>
          <p className="skill-description">{skill.description}</p>
        </div>
      </div>
    </div>
  );
};

export default SkillIndicator;
```

### Create `styles/SkillIndicator.css`:

```css
.skill-indicator-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.skill-indicator {
  background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
  border: 4px solid #fbbf24;
  border-radius: 20px;
  padding: 25px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(251, 191, 36, 0.5),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
  animation: 
    skillAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    skillFadeOut 0.5s ease-in 1.5s forwards;
}

.skill-icon-large {
  font-size: 72px;
  animation: iconPulse 0.6s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
}

.skill-details {
  text-align: left;
}

.skill-name {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.9),
    0 0 10px rgba(251, 191, 36, 0.5);
  letter-spacing: 1px;
}

.skill-description {
  margin: 0;
  font-size: 16px;
  color: #e5e7eb;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes skillAppear {
  from {
    transform: scale(0.3) translateY(-50px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes skillFadeOut {
  to {
    opacity: 0;
    transform: translateY(-30px) scale(1.05);
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}
```

---

## Step 5: Add Skill Indicator to Your Main Game Component

### In `Battlefield.jsx` or your main game component:

```javascript
import SkillIndicator from './components/SkillIndicator';

// In your component:
function Battlefield() {
  // ... your existing code
  
  const {
    // ... existing destructured values
    triggeredSkill,
    skillIndicatorVisible,
  } = useGameState();

  return (
    <div className="battlefield">
      {/* Your existing game UI */}
      
      {/* Add the skill indicator */}
      <SkillIndicator 
        skill={triggeredSkill} 
        visible={skillIndicatorVisible} 
      />
      
      {/* Rest of your UI */}
    </div>
  );
}
```

---

## Step 6: Test Power Strike

### Test Scenario:
1. **Setup:** Control a Melee hero (Swordman or Warrior)
2. **Have in hand:** Charge card + Smash card
3. **Turn sequence:**
   - Play Charge card (activates buff, grants 2 extra attacks)
   - Select Smash attack card
   - Select enemy target
4. **Expected Results:**
   - Skill indicator appears: "💥 Power Strike! Devastating blow that ignores defense"
   - Game log shows: "💥 SKILL: Power Strike! Devastating blow that ignores defense!"
   - Damage calculation:
     - Base Smash: 6 damage
     - Charge bonus: +2 damage
     - Power Strike bonus: +3 damage
     - **Total: 11 damage**
   - If enemy plays Block: "💥 Power Strike penetrates the defense! Block has no effect!"
   - 50% chance enemy gets Stunned

### Test Cases:

**Test 1: Basic Power Strike**
- Input: Charge → Smash (first attack)
- Expected: 11 damage, ignores Block
- ✅ Pass if damage = 11 and Block doesn't reduce it

**Test 2: Not First Attack**
- Input: Attack once, then Charge → Smash (second attack)
- Expected: No skill trigger, normal Charge + Smash (8 damage)
- ✅ Pass if skill doesn't trigger

**Test 3: Wrong Attack Type**
- Input: Charge → Strike (not Smash)
- Expected: No skill trigger
- ✅ Pass if skill doesn't trigger

**Test 4: Wrong Buff**
- Input: Focus → Smash
- Expected: No skill trigger
- ✅ Pass if skill doesn't trigger

**Test 5: Wrong Hero Class**
- Input: Ranged/Mage hero uses Charge → Smash
- Expected: No skill trigger (they can't even use Smash)
- ✅ Pass if card is disabled or skill doesn't trigger

**Test 6: Paralyzed Hero**
- Input: Hero with Paralyze status → Charge → Smash
- Expected: No skill trigger
- ✅ Pass if skill doesn't trigger

---

## Expected Output Examples

### Console/Game Log:
```
🔥 Swordman (Melee) uses Charge! 3 attacks!
⚠️ Charge: 0 damage = stunned!
💥 SKILL: Power Strike! Devastating blow that ignores defense!
[Skill indicator appears on screen]
🛡️ Warrior plays Block!
💥 Power Strike penetrates the defense! Block has no effect!
💫 Warrior is STUNNED!
❤️ Warrior: 11 dmg (HP: 54/65)
```

### Visual Feedback:
1. Player clicks Charge card → card removed, buff icon appears
2. Player clicks Smash card → attack targeting mode
3. Player clicks enemy hero → **Skill indicator pops up**
4. Indicator shows: "💥 Power Strike - Devastating blow that ignores defense"
5. Indicator fades after 2 seconds
6. Damage numbers appear, enemy HP bar decreases
7. Stun icon may appear on enemy

---

## Common Issues & Solutions

### Issue 1: Skill not triggering
**Check:**
- Is hero Melee class? (`attackerHero.job.name === 'Melee'`)
- Is Charge buff active? (`activeBuff && activeBuff.buffType === 'charge'`)
- Is it Smash attack? (`attackCard.name === 'Smash'`)
- Is it first attack? (`isFirstAttack === true`)
- Is hero Paralyzed? (check `statusEffects`)

### Issue 2: Damage calculation wrong
**Check:**
- Base damage: `attackCard.damage` should be 6 for Smash
- Buff bonus: Charge adds +2
- Skill bonus: Power Strike adds +3
- Total: 6 + 2 + 3 = 11

### Issue 3: Block still working
**Check:**
- `ignoresBlock` property in `pendingAttack` is true
- Defense resolution code checks `ignoresBlock` before applying Block

### Issue 4: Skill indicator not showing
**Check:**
- `SkillIndicator` component is imported and rendered
- `triggeredSkill` state is being set
- `skillIndicatorVisible` is true
- CSS animation is loaded

---

## Next Steps

Once Power Strike is working, you can:
1. Add more Melee skills (Blade Fury, Counter Stance)
2. Add Ranged skills (Headshot, Rapid Fire)
3. Add Mage skills (Elemental Mastery, Arcane Surge)
4. Add Support skills (Divine Protection, Mass Heal)

Each skill follows the same pattern:
1. Detect trigger conditions
2. Modify attack/effect data
3. Show visual indicator
4. Apply special effects in resolution

---

## Full Working Example

Here's a complete minimal example of the detection logic:

```javascript
// In your attack selection handler:
function handleAttackCardSelected(attackCard, targetHero) {
  const isFirstAttack = (heroAttackCounts[attackerHero.id] || 0) === 0;
  const canUseSkills = !attackerHero.statusEffects.some(e => e.preventSkills);
  
  let skillData = null;
  
  // Power Strike detection
  if (canUseSkills &&
      attackerHero.job.name === 'Melee' &&
      activeBuff?.buffType === 'charge' &&
      attackCard.name === 'Smash' &&
      isFirstAttack) {
    
    skillData = {
      id: 'POWER_STRIKE',
      name: 'Power Strike',
      icon: '💥',
      description: 'Devastating blow that ignores defense',
      damageBonus: 3,
      ignoresBlock: true,
      stunChance: 0.5
    };
    
    setTriggeredSkill(skillData);
    setSkillIndicatorVisible(true);
    setTimeout(() => setSkillIndicatorVisible(false), 2000);
    addLog(`💥 SKILL: Power Strike! Devastating blow that ignores defense!`);
  }
  
  const pendingAttack = {
    card: {
      ...attackCard,
      damage: attackCard.damage + (skillData?.damageBonus || 0)
    },
    attacker: currentTurn,
    attackerHero,
    defender: opponentTeam,
    defenderHero: targetHero,
    isFeint: activeBuff?.unavoidable || false,
    skillTriggered: skillData?.id || null,
    skillName: skillData?.name || null,
    skillIcon: skillData?.icon || null,
    ignoresBlock: skillData?.ignoresBlock || false,
    stunChance: skillData?.stunChance || 0
  };
  
  setPendingAttack(pendingAttack);
  setWaitingForReaction(true);
}
```

This should give you a complete working implementation of Power Strike! 🎮
