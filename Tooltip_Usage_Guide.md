# Enhanced Skill Tooltips - Usage Guide

## Overview
The enhanced skill tooltip system provides detailed, step-by-step explanations of how to trigger skills, what they do, and tips for using them effectively.

## What's Improved

### Before (Old Tooltips):
```
Trigger: Charge → Smash (Heavy Attack) [First attack only]
```

### After (Enhanced Tooltips):
```
HOW TO TRIGGER:
1. Play Charge buff card
2. Play Smash attack card (must be your first attack this turn)
3. Skill activates automatically!

The buff must be active BEFORE playing the attack card.

EFFECT:
• +3 bonus damage
• Penetrates Block defense (ignores Block)
• Cannot be Evaded
• Applies STUN status

REQUIREMENTS:
• Melee class only
• Charge buff must be active
• Must use Smash attack
• Must be your first attack this turn
• Cannot use while Paralyzed

TIPS:
💡 Use on high-HP targets to maximize damage
💡 Block defense won't work against this
💡 Save for critical moments
```

---

## Files Provided

1. **skillTooltipEnhanced.js** - Core tooltip utility functions
2. **SkillTooltip.jsx** - React components for displaying tooltips

---

## Installation

### Step 1: Add the utility file
Place `skillTooltipEnhanced.js` in your utils folder:
```
src/utils/skillTooltipEnhanced.js
```

### Step 2: Add the component file
Place `SkillTooltip.jsx` in your components folder:
```
src/components/SkillTooltip.jsx
```

---

## Usage Examples

### Example 1: Basic Tooltip on Hover

```jsx
import SkillTooltip from './components/SkillTooltip';
import { HERO_SKILLS } from './models/heroSkills';

function MyComponent() {
  const powerStrike = HERO_SKILLS.POWER_STRIKE;
  
  return (
    <SkillTooltip skill={powerStrike}>
      <button className="skill-button">
        💥 Power Strike
      </button>
    </SkillTooltip>
  );
}
```

When user hovers over the button, they see the full detailed tooltip!

---

### Example 2: Compact Tooltip (for cards in hand)

```jsx
import { CompactSkillTooltip } from './components/SkillTooltip';

function CardInHand({ card, potentialSkill }) {
  if (!potentialSkill) {
    return <div className="card">{card.name}</div>;
  }
  
  return (
    <CompactSkillTooltip skill={potentialSkill}>
      <div className="card skill-available">
        {card.name}
        <span className="skill-hint">✨</span>
      </div>
    </CompactSkillTooltip>
  );
}
```

Shows a smaller, quicker tooltip for cards that can trigger skills.

---

### Example 3: Skill List (for hero info screen)

```jsx
import { SkillList } from './components/SkillTooltip';
import { getSkillsForJobClass } from './models/heroSkills';

function HeroInfoPanel({ hero }) {
  const availableSkills = getSkillsForJobClass(hero.job.name);
  
  return (
    <div className="hero-panel">
      <h2>{hero.name}</h2>
      <p>{hero.job.name}</p>
      
      <SkillList 
        skills={availableSkills} 
        heroName={hero.name} 
      />
    </div>
  );
}
```

Displays all skills available to a hero with tooltips on each.

---

### Example 4: Enhanced Skill Indicator (replaces basic one)

```jsx
import { SkillIndicatorWithTooltip } from './components/SkillTooltip';

function Game() {
  const [triggeredSkill, setTriggeredSkill] = useState(null);
  const [skillVisible, setSkillVisible] = useState(false);
  
  return (
    <div className="game">
      {/* Your game content */}
      
      <SkillIndicatorWithTooltip 
        skill={triggeredSkill}
        visible={skillVisible}
        onClose={() => setSkillVisible(false)}
      />
    </div>
  );
}
```

Shows the skill popup AND allows clicking for detailed information.

---

## Utility Functions

### Get detailed skill info
```javascript
import { getDetailedSkillInfo } from './utils/skillTooltipEnhanced';

const skillInfo = getDetailedSkillInfo(HERO_SKILLS.POWER_STRIKE);

console.log(skillInfo.trigger);  // Full trigger description
console.log(skillInfo.effect);   // Effect description
console.log(skillInfo.requirements); // Array of requirements
console.log(skillInfo.tips);     // Array of tips
```

### Get just the trigger description
```javascript
import { getEnhancedTriggerDescription } from './utils/skillTooltipEnhanced';

const trigger = getEnhancedTriggerDescription(HERO_SKILLS.HEADSHOT);
// Returns: "HOW TO TRIGGER:\n1. Play Focus buff card\n2. ..."
```

### Get just the effect description
```javascript
import { getEffectDescription } from './utils/skillTooltipEnhanced';

const effect = getEffectDescription(HERO_SKILLS.POWER_STRIKE);
// Returns: "+3 bonus damage\n• Penetrates Block defense..."
```

### Generate complete tooltip text
```javascript
import { generateSkillTooltip } from './utils/skillTooltipEnhanced';

const tooltipText = generateSkillTooltip(HERO_SKILLS.ELEMENTAL_MASTERY);
// Returns complete formatted text suitable for display
console.log(tooltipText);
```

---

## Integration with Existing Code

### Option 1: Replace SkillIndicator component

Replace your current `SkillIndicator.jsx` with:

```jsx
import { SkillIndicatorWithTooltip } from './components/SkillTooltip';

// In App.jsx:
<SkillIndicatorWithTooltip 
  skill={triggeredSkill} 
  visible={skillIndicatorVisible}
  onClose={() => setSkillIndicatorVisible(false)}
/>
```

### Option 2: Add tooltips to card hints

When showing which cards can trigger skills, add tooltips:

```jsx
import SkillTooltip from './components/SkillTooltip';
import { checkHandForPotentialSkills } from './controllers/skillController';

function Hand({ cards, hero, activeBuff }) {
  const potentialSkills = checkHandForPotentialSkills(hero, cards, activeBuff);
  
  return (
    <div className="hand">
      {cards.map(card => {
        const skillForCard = potentialSkills.find(skill => 
          // Logic to match skill to card
        );
        
        if (skillForCard) {
          return (
            <SkillTooltip key={card.id} skill={skillForCard}>
              <div className="card skill-ready">
                {card.name} ✨
              </div>
            </SkillTooltip>
          );
        }
        
        return <div key={card.id} className="card">{card.name}</div>;
      })}
    </div>
  );
}
```

### Option 3: Add skill reference panel

Create a side panel showing available skills:

```jsx
import { SkillList } from './components/SkillTooltip';
import { getSkillsForJobClass } from './models/heroSkills';

function SkillReferencePanel({ activeHero, isOpen, onClose }) {
  if (!isOpen) return null;
  
  const skills = getSkillsForJobClass(activeHero.job.name);
  
  return (
    <div className="skill-panel">
      <button onClick={onClose}>Close</button>
      <SkillList skills={skills} heroName={activeHero.name} />
    </div>
  );
}
```

---

## Customization

### Change tooltip position
```jsx
<SkillTooltip skill={skill} position="bottom">
  {/* content */}
</SkillTooltip>

// Available positions: 'top', 'bottom', 'left', 'right'
```

### Style customization
The components use Tailwind CSS. Modify the classes in `SkillTooltip.jsx`:

```jsx
// Change background color
className="bg-gray-900" → className="bg-slate-900"

// Change border color
className="border-yellow-500" → className="border-blue-500"

// Change text colors
className="text-yellow-400" → className="text-amber-400"
```

---

## Example Tooltip Outputs

### Power Strike (Melee Skill)
```
💥 Power Strike
===============

Devastating blow that ignores defense

CLASS: Melee

HOW TO TRIGGER:
1. Play Charge buff card
2. Play Smash attack card (must be your first attack this turn)
3. Skill activates automatically!

The buff must be active BEFORE playing the attack card.

EFFECT:
• +3 bonus damage
• Penetrates Block defense (ignores Block)
• Cannot be Evaded

REQUIREMENTS:
• Melee class only
• Charge buff must be active
• Must use Smash attack
• Must be your first attack this turn
• Cannot use while Paralyzed

TIPS:
💡 Use on high-HP targets to maximize damage
💡 Block defense won't work against this
💡 Save for critical moments
```

### Elemental Mastery (Mage Skill)
```
🌟 Elemental Mastery
===================

Unleash devastating elemental power

CLASS: Mage

HOW TO TRIGGER:
1. Play any Elemental Magic buff (Fire, Ice, Wind, Earth, Ivy, Lightning)
2. Play Heavy Magic attack (Blast)
3. Skill activates automatically!

The elemental buff must be active when you attack.
Only Heavy Magic attacks trigger this skill.

EFFECT:
• Status effects last +2 extra turns
• Status DOT damage increased by +2
• Adjacent enemies take 2 splash damage

REQUIREMENTS:
• Mage class only
• Elemental Magic buff must be active
• Must use Heavy Magic attack
• Cannot use while Paralyzed

TIPS:
💡 Maximizes status effect damage over time
💡 Use Fire for sustained burn damage
💡 Use Ice to lock down enemies longer
💡 Splash damage hits adjacent heroes
```

### Mass Heal (Support Skill)
```
💚 Mass Heal
===========

Restore health to all allies

CLASS: Support

HOW TO TRIGGER:
1. Play Heal card
2. Play another Heal card
3. Both must be played in same turn
4. Skill activates after second card!

EFFECT:
• Heals ALL allies for 4 HP each
• Removes: BURN, POISON, BLEED

REQUIREMENTS:
• Support class only
• Need: Heal, Heal
• Cannot use while Paralyzed

TIPS:
💡 Best when entire team needs healing
💡 Also removes DOT effects from everyone
💡 Save for critical team recovery
```

---

## Benefits of Enhanced Tooltips

✅ **Step-by-step instructions** - Players know exactly what to do
✅ **Clear requirements** - No confusion about when skills can be used
✅ **Detailed effects** - Players understand what the skill does
✅ **Strategic tips** - Helps players use skills effectively
✅ **Better UX** - Less trial and error, more informed decisions
✅ **Reduced learning curve** - New players learn faster
✅ **Professional presentation** - Polished, complete information

---

## Testing Checklist

- [ ] Tooltips appear on hover
- [ ] All trigger types display correctly
- [ ] Effect descriptions are accurate
- [ ] Requirements list is complete
- [ ] Tips are helpful and relevant
- [ ] Positioning works (top/bottom/left/right)
- [ ] Mobile-friendly (touch events)
- [ ] No layout breaking on long text
- [ ] Colors are readable
- [ ] Animations are smooth

---

## Troubleshooting

**Tooltip not showing:**
- Check that skill object is passed correctly
- Verify SkillTooltip component is imported
- Check z-index conflicts with other elements

**Tooltip cut off screen:**
- Use different position prop
- Adjust parent container overflow
- Make tooltip width smaller

**Text formatting issues:**
- Check whitespace-pre-line class is applied
- Verify newline characters (\n) in text
- Check CSS is not overriding styles

---

## Future Enhancements

Possible additions:
- [ ] Damage calculator showing exact numbers
- [ ] Interactive trigger simulator
- [ ] Video/animation demonstrations
- [ ] Skill comparison tool
- [ ] Player notes/favorites system
- [ ] Skill combo suggestions
- [ ] Achievement tracking per skill

---

This enhanced tooltip system provides players with all the information they need to master your game's skill system!