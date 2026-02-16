# Hero Skills System - Integration Guide

## Overview
This guide explains how to integrate the Hero Skills system into your existing React Heroes Battle game.

## Files Created
1. **heroSkills.js** - Model file with all skill definitions
2. **skillController.js** - Controller for detecting and applying skills

## Integration Steps

### Step 1: Add Skill State to useGameState.js

Add these new state variables to `useGameState.js`:

```javascript
const [triggeredSkill, setTriggeredSkill] = useState(initialState.triggeredSkill);
const [skillIndicatorVisible, setSkillIndicatorVisible] = useState(initialState.skillIndicatorVisible);
const [attackCardsUsedThisTurn, setAttackCardsUsedThisTurn] = useState(initialState.attackCardsUsedThisTurn);
```

Add to initialState.js:
```javascript
triggeredSkill: null,
skillIndicatorVisible: false,
attackCardsUsedThisTurn: []
```

Return them from the hook:
```javascript
triggeredSkill, setTriggeredSkill,
skillIndicatorVisible, setSkillIndicatorVisible,
attackCardsUsedThisTurn, setAttackCardsUsedThisTurn
```

---

### Step 2: Modify attackController.js to Detect Skills

Import the skill controller at the top:
```javascript
import { checkBuffAttackSkill, applySkillToAttack } from './skillController';
```

In the function where you select an attack target (likely in `selectAttackTarget` or similar), add skill detection BEFORE creating pendingAttack:

```javascript
// After attack card and target are selected
const isFirstAttack = (heroAttackCounts[attackerHero.id] || 0) === 0;

// Check for skill trigger
const triggeredSkill = checkBuffAttackSkill(
  attackerHero,
  activeBuff,
  attackCard,
  isFirstAttack,
  heroes,
  currentTurn
);

// Create pending attack
let pendingAttack = {
  card: attackCard,
  attacker: currentTurn,
  attackerHero,
  defender: opponentTeam,
  defenderHero: targetHero,
  isFeint: activeBuff && activeBuff.unavoidable
};

// Apply skill effects if triggered
if (triggeredSkill) {
  pendingAttack = applySkillToAttack(
    triggeredSkill,
    pendingAttack,
    heroes,
    currentTurn,
    addLog
  );
  
  // Show skill indicator
  setTriggeredSkill(triggeredSkill);
  setSkillIndicatorVisible(true);
  
  // Hide indicator after 2 seconds
  setTimeout(() => {
    setSkillIndicatorVisible(false);
  }, 2000);
}

setPendingAttack(pendingAttack);
setWaitingForReaction(true);
```

---

### Step 3: Modify damageController.js to Handle Skill Effects

In `resolveAttackController`, add handling for skill-modified attacks:

```javascript
export const resolveAttackController = (
  defenseCard,
  // ... other params
) => {
  if (!pendingAttack) return;

  const { 
    card, 
    attacker, 
    attackerHero, 
    defender, 
    defenderHero, 
    isFeint,
    // New skill-related properties
    skillTriggered,
    skillName,
    skillIcon,
    ignoresBlock,
    unavoidable,
    ignoreShield,
    statusDurationBonus,
    statusDamageBonus,
    splashDamage
  } = pendingAttack;

  let defenderDamage = card.damage;
  let attackerDamage = 0;
  let shieldAbsorbed = 0;

  // Remove defense card if played
  if (defenseCard) {
    // ... existing defense card removal code

    // Resolve defense interactions
    if (isFeint || unavoidable) {
      // Skill makes attack unavoidable - only counter/deflect work
      if ((defenseCard.defenseType === 'counter' && card.attackType === 'physical') ||
        (defenseCard.defenseType === 'deflect' && card.attackType === 'magic')) {
        defenderDamage = Math.floor(card.damage * 0.5);
        attackerDamage = Math.floor(card.damage * 0.5);
        addLog(`${defenseCard.defenseType === 'counter' ? '⚡' : '🔮'} ${defenseCard.name}! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
      } else {
        addLog(`💫 ${skillName || 'Feint'}! ${defenseCard.name} has no effect!`);
      }
    } else if (defenseCard.defenseType === 'evade') {
      defenderDamage = 0;
      addLog(`💨 ${defenderHero.name} evades!`);
    } else if (defenseCard.defenseType === 'block' && !ignoresBlock) {
      // Block only works if skill doesn't ignore it
      defenderDamage = Math.max(0, card.damage - defenseCard.defense);
      addLog(`🛡️ Blocked to ${defenderDamage}!`);
    } else if (ignoresBlock && defenseCard.defenseType === 'block') {
      addLog(`💥 ${skillName} penetrates the defense!`);
    } else if (defenseCard.defenseType === 'counter' && card.attackType === 'physical') {
      defenderDamage = Math.floor(card.damage * 0.5);
      attackerDamage = Math.floor(card.damage * 0.5);
      addLog(`⚡ Counter! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
    } else if (defenseCard.defenseType === 'deflect' && card.attackType === 'magic') {
      defenderDamage = Math.floor(card.damage * 0.5);
      attackerDamage = Math.floor(card.damage * 0.5);
      addLog(`🔮 Deflect! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
    } else {
      addLog(`⚠️ ${defenseCard.name} doesn't work!`);
    }
  } else {
    if (skillTriggered) {
      addLog(`💥 ${skillName} - Full damage!`);
    } else {
      addLog(`💥 Full damage!`);
    }
  }

  // Apply damage with shield absorption (unless skill ignores shield)
  const newHeroes = {
    player1: heroes.player1.map(h => {
      if (h.id === defenderHero.id && defender === 'player1') {
        let damageAfterShield = defenderDamage;
        let newShield = h.shield;
        
        // Check if shield should be applied
        if (h.shield > 0 && !ignoreShield) {
          shieldAbsorbed = Math.min(h.shield, defenderDamage);
          damageAfterShield = defenderDamage - shieldAbsorbed;
          newShield = h.shield - shieldAbsorbed;
        } else if (ignoreShield && h.shield > 0) {
          addLog(`⚡ ${skillName} bypasses shield!`);
        }
        
        const newHp = Math.max(0, h.hp - damageAfterShield);
        return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
      }
      // ... rest of player1 hero mapping
    }),
    player2: heroes.player2.map(h => {
      // ... similar for player2
    })
  };

  // Apply status effects (with skill bonuses)
  let statusToApply = card.statusEffect;
  if (!statusToApply && activeBuff && activeBuff.buffType === 'elementalMagic' && card.attackType === 'magic') {
    statusToApply = activeBuff.statusEffect;
  }
  
  if (statusToApply) {
    // ... existing status effect code
    
    // Apply skill bonuses to status effect
    if (statusDurationBonus > 0) {
      statusEffect.turnsRemaining += statusDurationBonus;
      addLog(`⏱️ Status duration extended by ${statusDurationBonus} turns!`);
    }
    
    if (statusDamageBonus > 0 && statusEffect.damagePerTurn) {
      statusEffect.damagePerTurn += statusDamageBonus;
      addLog(`🔥 Status damage increased by ${statusDamageBonus}!`);
    }

    // ... apply status effect to hero
  }

  // Handle splash damage from skills
  if (splashDamage > 0) {
    const targetTeam = newHeroes[defender];
    targetTeam.forEach((h, index) => {
      // Apply splash to adjacent heroes (index ± 1)
      const defenderIndex = targetTeam.findIndex(hero => hero.id === defenderHero.id);
      if (Math.abs(index - defenderIndex) === 1 && !h.defeated) {
        newHeroes[defender] = newHeroes[defender].map(hero =>
          hero.id === h.id ? {
            ...hero,
            hp: Math.max(0, hero.hp - splashDamage),
            defeated: Math.max(0, hero.hp - splashDamage) === 0
          } : hero
        );
        addLog(`💥 ${h.name} takes ${splashDamage} splash damage!`);
      }
    });
  }

  setHeroes(newHeroes);

  // ... rest of existing damage resolution code
};
```

---

### Step 4: Create Skill Indicator UI Component

Create a new file `SkillIndicator.jsx`:

```javascript
import React from 'react';
import './SkillIndicator.css';

const SkillIndicator = ({ skill, visible }) => {
  if (!visible || !skill) return null;

  return (
    <div className="skill-indicator">
      <div className="skill-indicator-content">
        <span className="skill-icon">{skill.icon}</span>
        <div className="skill-info">
          <h3 className="skill-name">{skill.name}</h3>
          <p className="skill-description">{skill.description}</p>
        </div>
      </div>
    </div>
  );
};

export default SkillIndicator;
```

Create `SkillIndicator.css`:

```css
.skill-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  animation: skillAppear 0.3s ease-out, skillFadeOut 0.5s ease-in 1.5s forwards;
}

.skill-indicator-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid #ffd700;
  border-radius: 15px;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5),
              0 0 20px rgba(255, 215, 0, 0.5),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.skill-icon {
  font-size: 48px;
  animation: skillPulse 0.6s ease-in-out infinite;
}

.skill-info {
  text-align: left;
}

.skill-name {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.skill-description {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

@keyframes skillAppear {
  from {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes skillFadeOut {
  to {
    opacity: 0;
    transform: translate(-50%, -60%) scale(1.1);
  }
}

@keyframes skillPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
```

---

### Step 5: Add Skill Indicator to Main Game Component

In your main game component (likely `Battlefield.jsx` or `App.jsx`):

```javascript
import SkillIndicator from './components/SkillIndicator';

// In your JSX, add:
<SkillIndicator 
  skill={triggeredSkill} 
  visible={skillIndicatorVisible} 
/>
```

---

### Step 6: Add Skill Hints to Cards in Hand (Optional)

In your Hand component, add visual hints when cards can trigger skills:

```javascript
import { checkHandForPotentialSkills } from '../controllers/skillController';

const Hand = ({ hand, hero, activeBuff, onCardClick }) => {
  const potentialSkills = checkHandForPotentialSkills(hero, hand, activeBuff);
  
  return (
    <div className="hand">
      {hand.map(card => {
        const canTriggerSkill = potentialSkills.some(skill => {
          // Check if this card can trigger the skill
          // ... implement logic based on skill trigger type
          return false; // placeholder
        });
        
        return (
          <div 
            key={card.id}
            className={`card ${canTriggerSkill ? 'skill-ready' : ''}`}
            onClick={() => onCardClick(card)}
          >
            {card.name}
            {canTriggerSkill && <span className="skill-hint">✨</span>}
          </div>
        );
      })}
    </div>
  );
};
```

Add to your CSS:
```css
.card.skill-ready {
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  border: 2px solid #ffd700;
  animation: cardGlow 1s ease-in-out infinite;
}

.skill-hint {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 20px;
  animation: skillHintPulse 1s ease-in-out infinite;
}

@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 1);
  }
}

@keyframes skillHintPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}
```

---

## Testing the Skills System

### Test Scenario 1: Power Strike (Melee)
1. Play Charge buff
2. Play Smash (Heavy Attack) on first attack of sequence
3. **Expected**: "💥 SKILL: Power Strike!" appears
4. Damage should be: 6 (Smash) + 2 (Charge) + 3 (Power Strike) = 11 damage
5. Target may be stunned
6. Attack ignores Block defense

### Test Scenario 2: Elemental Mastery (Mage)
1. Play Fire/Ice/Lightning buff
2. Play Blast (Heavy Magic)
3. **Expected**: "🌟 SKILL: Elemental Mastery!" appears
4. Status effect lasts 2 extra turns
5. DOT damage increased by 2
6. Adjacent heroes take 2 splash damage

### Test Scenario 3: Headshot (Ranged)
1. Play Focus buff
2. Play Focus Shot (Charge Shot) on first attack
3. **Expected**: "🎯 SKILL: Headshot!" appears
4. Damage multiplied by 1.5x
5. Cannot be blocked or evaded
6. Bypasses shield

---

## Skill Balance Notes

**Strong Skills:**
- Power Strike (11 total damage, penetration)
- Headshot (9 damage, unavoidable, shield bypass)
- Elemental Mastery (enhanced status effects)

**Situational Skills:**
- Desperate Strike (only at low HP)
- Last Stand (only when last hero)

**Utility Skills:**
- Divine Protection (team defense)
- Mass Heal (team sustain)

---

## Future Enhancements

1. **Multiple Skill Tiers**: Heroes unlock better skills as they level up
2. **Skill Cooldowns**: Prevent spamming the same skill
3. **Skill Combinations**: Chain multiple skills together
4. **Custom Skills**: Let players create custom heroes with unique skills
5. **Skill Upgrading**: Enhance skill effects through gameplay
6. **Reactive Skills**: Skills that trigger automatically on certain conditions
7. **Ultimate Skills**: Super powerful skills that require special conditions

---

## Troubleshooting

**Skill not triggering:**
- Check hero is not Paralyzed (status effect prevents skills)
- Verify correct buff + attack combination
- Check if it's the first attack (some skills require this)
- Ensure hero's job class matches skill requirement

**Skill effects not applying:**
- Check damageController has been updated to read skill properties
- Verify pendingAttack includes skill data
- Check console for errors

**UI indicator not showing:**
- Verify SkillIndicator component is imported and rendered
- Check triggeredSkill state is being set
- Verify CSS animation is working

---

## Summary

The Hero Skills system adds strategic depth to your game by:
- Rewarding smart card combinations
- Creating unique playstyles per job class
- Adding exciting visual/audio feedback
- Preventing skills with Paralyze status effect
- Encouraging tactical decision-making

Skills enhance existing mechanics rather than replacing them, maintaining the core gameplay while adding advanced strategy!
