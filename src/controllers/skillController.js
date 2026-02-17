// Skill Detection and Execution Controller
import { HERO_SKILLS, detectPossibleSkills, applySkillEffects, canHeroUseSkill } from '../models/heroSkills';
import { CARD_TYPES } from '../models/cardTypes';

/**
 * Check if current card play can trigger any hero skills
 * Called when: buff is played, attack is selected, or card sequence is completed
 */
export const checkForSkillTrigger = (
  hero,
  activeBuff,
  pendingAttackCard,
  heroAttackCounts,
  heroes,
  currentTurn
) => {
  // If hero is paralyzed, skills cannot trigger
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return null;
  }

  // Build context of cards played this turn
  const cardsPlayedContext = {
    buff: activeBuff,
    attack: pendingAttackCard,
    attackCount: heroAttackCounts[hero.id] || 0
  };

  // Get hero state for conditional checks
  const team = heroes[currentTurn];
  const aliveCount = team.filter(h => !h.defeated).length;
  const heroState = {
    aliveCount,
    isLowHp: hero.hp <= hero.maxHp * 0.25
  };

  // Detect which skills could trigger
  const possibleSkills = detectPossibleSkills(hero, cardsPlayedContext, activeBuff, heroState);

  // Return first triggered skill (in future, could handle multiple skills)
  return possibleSkills.length > 0 ? possibleSkills[0] : null;
};

/**
 * Check for buff + attack combination skills
 * Called right before an attack is executed
 */
export const checkBuffAttackSkill = (
  hero,
  activeBuff,
  attackCard,
  isFirstAttack,
  heroes,
  currentTurn
) => {
  if (!activeBuff || !attackCard) return null;
  
  // Check if hero can use skills
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return null;
  }

  const availableSkills = Object.values(HERO_SKILLS).filter(skill => {
    // Must match job class
    if (skill.jobClass !== 'Any' && skill.jobClass !== hero.job.name) {
      return false;
    }

    // Must be buff+attack trigger type
    if (skill.trigger.type !== 'buff+attack') {
      return false;
    }

    // Check buff matches
    if (skill.trigger.requiredBuff !== activeBuff.buffType) {
      return false;
    }

    // Check attack type matches
    const attackTypeKey = Object.keys(CARD_TYPES).find(
      key => CARD_TYPES[key].name === attackCard.name
    );
    
    if (skill.trigger.requiredAttack !== attackTypeKey) {
      return false;
    }

    // Check if requires first attack
    if (skill.trigger.requiresFirstAttack && !isFirstAttack) {
      return false;
    }

    return true;
  });

  return availableSkills.length > 0 ? availableSkills[0] : null;
};

/**
 * Check for elemental + magic combination skills
 */
export const checkElementalSkill = (
  hero,
  activeBuff,
  attackCard,
  heroes,
  currentTurn
) => {
  if (!activeBuff || !attackCard) return null;
  
  // Must be elemental magic buff
  if (activeBuff.buffType !== 'elementalMagic') return null;
  
  // Must be heavy magic attack
  if (attackCard.type !== 'HEAVY_MAGIC') return null;
  
  // Check if hero can use skills
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return null;
  }

  // Find Elemental Mastery skill
  const skill = HERO_SKILLS.ELEMENTAL_MASTERY;
  
  if (skill.jobClass === hero.job.name || skill.jobClass === 'Any') {
    return skill;
  }

  return null;
};

/**
 * Check for multi-card sequence skills
 * Called when multiple attacks of same type are played
 */
export const checkMultiCardSkill = (
  hero,
  attackCardsUsed,
  heroes,
  currentTurn
) => {
  if (!attackCardsUsed || attackCardsUsed.length < 2) return null;
  
  // Check if hero can use skills
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return null;
  }

  // Count cards by type
  const cardTypeCounts = {};
  attackCardsUsed.forEach(card => {
    const cardType = card.name;
    cardTypeCounts[cardType] = (cardTypeCounts[cardType] || 0) + 1;
  });

  // Find skills that match multi-card triggers
  const availableSkills = Object.values(HERO_SKILLS).filter(skill => {
    if (skill.jobClass !== 'Any' && skill.jobClass !== hero.job.name) {
      return false;
    }

    if (skill.trigger.type === 'multi-card') {
      const requiredCardName = skill.trigger.requiredCard;
      const count = cardTypeCounts[requiredCardName] || 0;
      return count >= skill.trigger.minCount;
    }

    if (skill.trigger.type === 'multi-magic') {
      // Check for consecutive magic attacks
      const isMagicSequence = attackCardsUsed.every(card => card.attackType === 'magic');
      return isMagicSequence && attackCardsUsed.length >= skill.trigger.minCount;
    }

    return false;
  });

  return availableSkills.length > 0 ? availableSkills[0] : null;
};

/**
 * Apply skill effects to pending attack
 * Modifies damage, defense penetration, status effects, etc.
 */
export const applySkillToAttack = (
  skill,
  pendingAttack,
  heroes,
  currentTurn,
  addLog
) => {
  if (!skill || !pendingAttack) return pendingAttack;

  // Log skill activation
  addLog(`${skill.icon} SKILL: ${skill.name}! ${skill.description}`);

  // Create attack context
  const attackContext = {
    damage: pendingAttack.card.damage,
    attacker: pendingAttack.attacker,
    attackerHero: pendingAttack.attackerHero,
    defender: pendingAttack.defender,
    defenderHero: pendingAttack.defenderHero,
    card: pendingAttack.card,
    isFeint: pendingAttack.isFeint,
    ignoresBlock: false,
    unavoidable: false,
    ignoreShield: false,
    statusDurationBonus: 0,
    statusDamageBonus: 0,
    splashDamage: 0
  };

  // Apply skill effects
  const modifiedContext = applySkillEffects(skill, attackContext, heroes, currentTurn);

  // Return modified pending attack
  return {
    ...pendingAttack,
    card: {
      ...pendingAttack.card,
      damage: modifiedContext.damage
    },
    skillTriggered: skill.id,
    skillName: skill.name,
    skillIcon: skill.icon,
    ignoresBlock: modifiedContext.ignoresBlock || false,
    unavoidable: modifiedContext.unavoidable || false,
    ignoreShield: modifiedContext.ignoreShield || false,
    statusDurationBonus: modifiedContext.statusDurationBonus || 0,
    statusDamageBonus: modifiedContext.statusDamageBonus || 0,
    splashDamage: modifiedContext.splashDamage || 0
  };
};

/**
 * Check for conditional skills (low HP, last hero standing, etc.)
 */
export const checkConditionalSkills = (
  hero,
  activeBuff,
  attackCard,
  heroes,
  currentTurn
) => {
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return null;
  }

  const team = heroes[currentTurn];
  const aliveCount = team.filter(h => !h.defeated).length;
  const isLowHp = hero.hp <= hero.maxHp * 0.25;

  const availableSkills = Object.values(HERO_SKILLS).filter(skill => {
    if (skill.trigger.type !== 'conditional') return false;
    
    const condition = skill.trigger.condition;
    
    // Check condition matches
    if (condition === 'lowHp' && !isLowHp) return false;
    if (condition === 'lastHeroStanding' && aliveCount !== 1) return false;
    
    // Check required buff
    if (skill.trigger.requiredBuff && (!activeBuff || activeBuff.buffType !== skill.trigger.requiredBuff)) {
      return false;
    }
    
    return true;
  });

  return availableSkills.length > 0 ? availableSkills[0] : null;
};

/**
 * Get skill visual indicator data for UI
 */
export const getSkillIndicator = (skillId) => {
  const skill = HERO_SKILLS[skillId];
  if (!skill) return null;

  return {
    id: skill.id,
    name: skill.name,
    icon: skill.icon,
    description: skill.description
  };
};

/**
 * Check if cards in hand can potentially trigger skills
 * Used for UI hints/glow effects
 */
export const checkHandForPotentialSkills = (hero, hand, activeBuff) => {
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return [];
  }

  const potentialSkills = [];
  const availableSkills = Object.values(HERO_SKILLS).filter(
    skill => skill.jobClass === hero.job.name || skill.jobClass === 'Any'
  );

  availableSkills.forEach(skill => {
    const trigger = skill.trigger;
    
    switch (trigger.type) {
      case 'buff+attack':
        // Check if buff is active and required attack is in hand
        if (activeBuff && activeBuff.buffType === trigger.requiredBuff) {
          const hasRequiredAttack = hand.some(card => {
            const cardTypeKey = Object.keys(CARD_TYPES).find(
              key => CARD_TYPES[key].name === card.name
            );
            return cardTypeKey === trigger.requiredAttack;
          });
          
          if (hasRequiredAttack) {
            potentialSkills.push(skill);
          }
        }
        break;
        
      case 'multi-card':
        // Check if hand has enough of required card type
        const cardCount = hand.filter(card => card.name === trigger.requiredCard).length;
        if (cardCount >= trigger.minCount) {
          potentialSkills.push(skill);
        }
        break;
    }
  });

  return potentialSkills;
};