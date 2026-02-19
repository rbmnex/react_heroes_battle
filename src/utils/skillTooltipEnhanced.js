/**
 * Enhanced Skill Tooltip System
 * Provides detailed, user-friendly descriptions of skill triggers and effects
 */

/**
 * Get detailed skill information including trigger, effect, and usage tips
 * @param {Object} skill - The skill object
 * @returns {Object} Formatted skill information
 */
export const getDetailedSkillInfo = (skill) => {
  if (!skill) return null;

  return {
    name: skill.name,
    icon: skill.icon,
    description: skill.description,
    jobClass: skill.jobClass,
    trigger: getEnhancedTriggerDescription(skill),
    effect: getEffectDescription(skill),
    requirements: getRequirements(skill),
    tips: getUsageTips(skill)
  };
};

/**
 * Get enhanced trigger description with step-by-step instructions
 * @param {Object} skill - The skill object
 * @returns {string} Detailed trigger description
 */
export const getEnhancedTriggerDescription = (skill) => {
  if (!skill || !skill.trigger) return 'No trigger information';

  const { trigger } = skill;

  switch (trigger.type) {
    case 'buff+attack':
      return getTriggerBuffAttack(trigger);
    
    case 'buff+multi-attack':
      return getTriggerBuffMultiAttack(trigger);
    
    case 'multi-card':
      return getTriggerMultiCard(trigger);
    
    case 'multi-magic':
      return getTriggerMultiMagic(trigger);
    
    case 'elemental+heavy':
      return getTriggerElementalHeavy(trigger);
    
    case 'elemental+multi':
      return getTriggerElementalMulti(trigger);
    
    case 'card_combination':
      return getTriggerCardCombination(trigger);
    
    case 'buff+support':
      return getTriggerBuffSupport(trigger);
    
    case 'multi-support':
      return getTriggerMultiSupport(trigger);
    
    case 'triple-support':
      return getTriggerTripleSupport(trigger);
    
    case 'skip_then_attack':
      return getTriggerSkipThenAttack(trigger);
    
    case 'reactive':
      return getTriggerReactive(trigger);
    
    case 'conditional':
      return getTriggerConditional(trigger);
    
    default:
      return 'Special trigger condition';
  }
};

/**
 * Get effect description explaining what the skill does
 * @param {Object} skill - The skill object
 * @returns {string} Effect description
 */
export const getEffectDescription = (skill) => {
  if (!skill || !skill.effect) return '';

  const { effect } = skill;

  switch (effect.type) {
    case 'damage_modifier':
      return getDamageModifierEffect(effect);
    
    case 'multi_hit':
      return getMultiHitEffect(effect);
    
    case 'multi_target':
      return getMultiTargetEffect(effect);
    
    case 'guaranteed_hit':
      return getGuaranteedHitEffect(effect);
    
    case 'enhanced_status':
      return getEnhancedStatusEffect(effect);
    
    case 'area_status':
      return getAreaStatusEffect(effect);
    
    case 'area_heal':
      return getAreaHealEffect(effect);
    
    case 'team_buff':
      return getTeamBuffEffect(effect);
    
    case 'temporary_buff':
      return getTemporaryBuffEffect(effect);
    
    case 'enhanced_cleanse':
      return getEnhancedCleanseEffect(effect);
    
    case 'enhanced_reflection':
      return getEnhancedReflectionEffect(effect);
    
    case 'risk_reward':
      return getRiskRewardEffect(effect);
    
    case 'survival':
      return getSurvivalEffect(effect);
    
    default:
      return 'Special effect';
  }
};

/**
 * Get requirements/conditions for the skill
 * @param {Object} skill - The skill object
 * @returns {Array<string>} List of requirements
 */
export const getRequirements = (skill) => {
  if (!skill || !skill.trigger) return [];

  const requirements = [];
  const { trigger } = skill;

  // Job class requirement
  if (skill.jobClass && skill.jobClass !== 'Any') {
    requirements.push(`${skill.jobClass} class only`);
  }

  // Buff requirements
  if (trigger.requiredBuff) {
    requirements.push(`${formatBuffName(trigger.requiredBuff)} buff must be active`);
  }

  // Card requirements
  if (trigger.requiredAttack) {
    requirements.push(`Must use ${formatCardName(trigger.requiredAttack)} attack`);
  }

  if (trigger.requiredCard) {
    const count = trigger.minCount || 1;
    requirements.push(`Need ${count}x ${formatCardName(trigger.requiredCard)} in hand`);
  }

  if (trigger.requiredCards && trigger.requiredCards.length > 0) {
    requirements.push(`Need: ${trigger.requiredCards.map(formatCardName).join(', ')}`);
  }

  // Attack position requirements
  if (trigger.requiresFirstAttack) {
    requirements.push('Must be your first attack this turn');
  }

  // Conditional requirements
  if (trigger.condition === 'lowHp') {
    requirements.push('Hero HP must be ≤ 25%');
  }

  if (trigger.condition === 'lastHeroStanding') {
    requirements.push('Must be last hero alive on your team');
  }

  // Cannot use if Paralyzed
  requirements.push('Cannot use while Paralyzed');

  return requirements;
};

/**
 * Get usage tips for the skill
 * @param {Object} skill - The skill object
 * @returns {Array<string>} List of tips
 */
export const getUsageTips = (skill) => {
  const tips = [];

  if (!skill) return tips;

  // Add tips based on skill ID
  switch (skill.id) {
    case 'POWER_STRIKE':
      tips.push('Use on high-HP targets to maximize damage');
      tips.push('Block defense won\'t work against this');
      tips.push('Save for critical moments');
      break;
    
    case 'HEADSHOT':
      tips.push('Perfect for finishing low-HP enemies');
      tips.push('Cannot be blocked or evaded - guaranteed damage');
      tips.push('Bypasses shield completely');
      break;
    
    case 'ELEMENTAL_MASTERY':
      tips.push('Maximizes status effect damage over time');
      tips.push('Use Fire for sustained burn damage');
      tips.push('Use Ice to lock down enemies longer');
      tips.push('Splash damage hits adjacent heroes');
      break;
    
    case 'BLADE_FURY':
      tips.push('Multiple small hits are harder to defend against');
      tips.push('Each hit can be blocked separately');
      tips.push('Good for consistent damage');
      break;
    
    case 'RAPID_FIRE':
      tips.push('Great for finishing multiple low-HP enemies');
      tips.push('Each hero can defend individually');
      tips.push('Use when all enemies are damaged');
      break;
    
    case 'MASS_HEAL':
      tips.push('Best when entire team needs healing');
      tips.push('Also removes DOT effects from everyone');
      tips.push('Save for critical team recovery');
      break;
    
    case 'DIVINE_PROTECTION':
      tips.push('Use before enemy\'s turn to maximize defense');
      tips.push('Shields stack with existing shields');
      tips.push('Damage reduction lasts 1 turn');
      break;
    
    case 'DESPERATE_STRIKE':
      tips.push('High risk, high reward - only when desperate');
      tips.push('Deals double damage but hurts you');
      tips.push('Use when you need to finish enemy quickly');
      break;
    
    case 'LAST_STAND':
      tips.push('Activates only when you\'re the last hero');
      tips.push('Can completely negate high damage attacks');
      tips.push('Counter damage applies to all attackers');
      break;
    
    case 'FROST_NOVA':
      tips.push('Team-wide crowd control');
      tips.push('Freezes all enemies for 1 turn');
      tips.push('Use to buy time for your team');
      break;
    
    case 'ARCANE_SURGE':
      tips.push('High burst magic damage');
      tips.push('Chain effect can hit random enemies');
      tips.push('Ignores Shield defense');
      break;
    
    case 'SPELL_REFLECT':
      tips.push('Ultimate counter to enemy mages');
      tips.push('Reflects both damage and status effects');
      tips.push('Only works against magic attacks');
      break;
    
    case 'COUNTER_STANCE':
      tips.push('Best defensive skill for melee heroes');
      tips.push('Reflects full damage back to attacker');
      tips.push('Combine with Block card for maximum defense');
      break;
    
    case 'SNIPER_FOCUS':
      tips.push('Patient setup for guaranteed critical hit');
      tips.push('Skip first attack to empower second');
      tips.push('Use when you need a guaranteed hit');
      break;
    
    case 'PURIFICATION':
      tips.push('Removes all status effects and grants immunity');
      tips.push('Use on heavily debuffed allies');
      tips.push('Also heals 3 HP');
      break;
    
    case 'BLESSING':
      tips.push('Powerful 2-turn buff on one ally');
      tips.push('Great for empowering your strongest attacker');
      tips.push('Both offensive and defensive boost');
      break;
  }

  return tips;
};

// ==================== TRIGGER DESCRIPTION HELPERS ====================

function getTriggerBuffAttack(trigger) {
  const buffName = formatBuffName(trigger.requiredBuff);
  const attackName = formatCardName(trigger.requiredAttack);
  const firstAttackNote = trigger.requiresFirstAttack ? ' (must be your first attack this turn)' : '';
  
  return `HOW TO TRIGGER:
1. Play ${buffName} buff card
2. Play ${attackName} attack card${firstAttackNote}
3. Skill activates automatically!

The buff must be active BEFORE playing the attack card.`;
}

function getTriggerBuffMultiAttack(trigger) {
  const buffName = formatBuffName(trigger.requiredBuff);
  const attackName = formatCardName(trigger.requiredAttack);
  const count = trigger.minAttacks || 2;
  
  return `HOW TO TRIGGER:
1. Play ${buffName} buff card (grants multiple attacks)
2. Play ${attackName} ${count} times in a row
3. Skill activates during the sequence!

You need the buff to grant you multiple attacks first.`;
}

function getTriggerMultiCard(trigger) {
  const cardName = formatCardName(trigger.requiredCard);
  const count = trigger.minCount || 2;
  
  return `HOW TO TRIGGER:
1. Gather ${count}x ${cardName} cards in your hand
2. Play them consecutively (one after another)
3. Skill activates after the sequence!

All ${count} cards must be played in the same turn.`;
}

function getTriggerMultiMagic(trigger) {
  const count = trigger.minCount || 2;
  
  return `HOW TO TRIGGER:
1. Play ${count} magic attack cards in a row
2. All attacks must be magic type
3. Must be played consecutively
4. Skill activates during the sequence!

Works with any combination of magic attacks.`;
}

function getTriggerElementalHeavy(trigger) {
  return `HOW TO TRIGGER:
1. Play any Elemental Magic buff (Fire, Ice, Wind, Earth, Ivy, Lightning)
2. Play Heavy Magic attack (Blast)
3. Skill activates automatically!

The elemental buff must be active when you attack.
Only Heavy Magic attacks trigger this skill.`;
}

function getTriggerElementalMulti(trigger) {
  const element = trigger.requiredBuff ? formatBuffName(trigger.requiredBuff) : 'Elemental';
  const count = trigger.requiredAttacks || 2;
  
  return `HOW TO TRIGGER:
1. Play ${element} Magic buff
2. Attack ${count} times consecutively
3. Skill activates after the sequence!

All attacks must be made while the elemental buff is active.`;
}

function getTriggerCardCombination(trigger) {
  const cards = trigger.requiredCards || [];
  const cardNames = cards.map(formatCardName).join(' + ');
  const consecutiveNote = trigger.mustBeConsecutive ? ' consecutively (one after another)' : '';
  
  return `HOW TO TRIGGER:
1. Have these cards: ${cardNames}
2. Play them in order${consecutiveNote}
3. Skill activates after playing all cards!

Order matters! Play them in the sequence shown above.`;
}

function getTriggerBuffSupport(trigger) {
  const cards = trigger.requiredCards || [];
  const cardNames = cards.map(formatCardName).join(' + ');
  
  return `HOW TO TRIGGER:
1. Play ${cardNames} in sequence
2. Both must target allies
3. Skill activates after the second card!

Support cards work on your team members only.`;
}

function getTriggerMultiSupport(trigger) {
  const cardName = formatCardName(trigger.requiredCard);
  const count = trigger.minCount || 2;
  const targetNote = trigger.sameTarget === false ? ' (on different allies)' : '';
  
  return `HOW TO TRIGGER:
1. Play ${cardName} ${count} times${targetNote}
2. All must be played in same turn
3. Skill activates after final cast!

Support cards must target your team members.`;
}

function getTriggerTripleSupport(trigger) {
  const cardName = formatCardName(trigger.requiredCard);
  
  return `HOW TO TRIGGER:
1. Gather 3x ${cardName} in your hand
2. Play all 3 in one turn
3. Can target same or different allies
4. Skill activates after third card!

Requires 3 support cards - plan ahead!`;
}

function getTriggerSkipThenAttack(trigger) {
  const buffName = formatBuffName(trigger.requiredBuff);
  
  return `HOW TO TRIGGER:
1. Play ${buffName} buff (grants multiple attacks)
2. Choose NOT to use first attack
3. Use second attack instead
4. Skill activates on the second attack!

This is a patient, tactical approach for big damage.`;
}

function getTriggerReactive(trigger) {
  const eventName = trigger.triggersOn || 'special event';
  const cardNeeded = trigger.requiresCard ? formatCardName(trigger.requiresCard) : '';
  
  return `HOW TO TRIGGER:
1. Enemy performs: ${eventName}
2. Play ${cardNeeded} as reaction
3. Skill activates automatically!

This is a reactive skill - it responds to enemy actions.`;
}

function getTriggerConditional(trigger) {
  let conditionText = '';
  
  switch (trigger.condition) {
    case 'lowHp':
      conditionText = 'Your hero HP is at or below 25%';
      break;
    case 'lastHeroStanding':
      conditionText = 'You are the last hero alive on your team';
      break;
    default:
      conditionText = trigger.condition;
  }
  
  const buffName = trigger.requiredBuff ? formatBuffName(trigger.requiredBuff) : '';
  const buffNote = trigger.requiredBuff ? `\n2. Play ${buffName} buff\n3. Attack with any card` : '\n2. Play required cards';
  
  return `HOW TO TRIGGER:
1. Condition: ${conditionText}${buffNote}
4. Skill activates automatically!

This skill only works in specific situations.`;
}

// ==================== EFFECT DESCRIPTION HELPERS ====================

function getDamageModifierEffect(effect) {
  const parts = [];
  
  if (effect.damageBonus) {
    parts.push(`+${effect.damageBonus} bonus damage`);
  }
  
  if (effect.damageMultiplier) {
    parts.push(`${effect.damageMultiplier}x damage multiplier`);
  }
  
  if (effect.penetration) {
    parts.push('Penetrates Block defense (ignores Block)');
  }
  
  if (effect.unavoidable) {
    parts.push('Cannot be Evaded');
  }
  
  if (effect.ignoreShield) {
    parts.push('Bypasses Shield completely');
  }
  
  if (effect.statusEffect) {
    parts.push(`Applies ${effect.statusEffect} status`);
  }
  
  return parts.join('\n• ');
}

function getMultiHitEffect(effect) {
  const hitsPerAttack = effect.hitsPerAttack || 2;
  const damagePerHit = effect.damagePerHit || 1;
  
  return `Each attack hits ${hitsPerAttack} times
• Each hit deals ${damagePerHit} damage
• Total: ${hitsPerAttack * damagePerHit} damage per attack card
• Defender can block each hit separately`;
}

function getMultiTargetEffect(effect) {
  const damage = effect.damagePerTarget || 0;
  
  return `Hits ALL enemy heroes at once
• Each enemy takes ${damage} damage
• Each hero can defend individually
• Great for finishing multiple low-HP targets`;
}

function getGuaranteedHitEffect(effect) {
  const parts = ['Guaranteed to hit - cannot miss'];
  
  if (effect.damageBonus) {
    parts.push(`+${effect.damageBonus} bonus damage`);
  }
  
  if (effect.unavoidable) {
    parts.push('Cannot be Evaded');
  }
  
  if (effect.unblockable) {
    parts.push('Cannot be Blocked');
  }
  
  return parts.join('\n• ');
}

function getEnhancedStatusEffect(effect) {
  const parts = [];
  
  if (effect.statusDurationBonus) {
    parts.push(`Status effects last +${effect.statusDurationBonus} extra turns`);
  }
  
  if (effect.statusDamageBonus) {
    parts.push(`Status DOT damage increased by +${effect.statusDamageBonus}`);
  }
  
  if (effect.splashDamage) {
    parts.push(`Adjacent enemies take ${effect.splashDamage} splash damage`);
  }
  
  return parts.join('\n• ');
}

function getAreaStatusEffect(effect) {
  const status = effect.statusEffect || 'status effect';
  const damage = effect.damage || 0;
  const duration = effect.statusDuration || 1;
  
  return `Affects ALL enemy heroes
• Applies ${status} for ${duration} turn(s)
• Each enemy takes ${damage} damage
• Team-wide crowd control`;
}

function getAreaHealEffect(effect) {
  const heal = effect.healAmount || 0;
  const removes = effect.removesStatus || [];
  
  const parts = [`Heals ALL allies for ${heal} HP each`];
  
  if (removes.length > 0) {
    parts.push(`Removes: ${removes.join(', ')}`);
  }
  
  return parts.join('\n• ');
}

function getTeamBuffEffect(effect) {
  const parts = ['Affects ALL allies'];
  
  if (effect.shieldBonus) {
    parts.push(`+${effect.shieldBonus} shield to each ally`);
  }
  
  if (effect.damageReduction) {
    parts.push(`All allies take -${effect.damageReduction} damage`);
  }
  
  if (effect.duration) {
    parts.push(`Lasts ${effect.duration} turn(s)`);
  }
  
  return parts.join('\n• ');
}

function getTemporaryBuffEffect(effect) {
  const parts = ['Single target buff'];
  
  if (effect.damageBonus) {
    parts.push(`Target deals +${effect.damageBonus} damage`);
  }
  
  if (effect.defenseBonus) {
    parts.push(`Target takes -${effect.defenseBonus} damage`);
  }
  
  if (effect.duration) {
    parts.push(`Lasts ${effect.duration} turn(s)`);
  }
  
  return parts.join('\n• ');
}

function getEnhancedCleanseEffect(effect) {
  const parts = ['Removes ALL status effects'];
  
  if (effect.immunityDuration) {
    parts.push(`Grants ${effect.immunityDuration} turn immunity to status effects`);
  }
  
  if (effect.healAmount) {
    parts.push(`Also heals ${effect.healAmount} HP`);
  }
  
  return parts.join('\n• ');
}

function getEnhancedReflectionEffect(effect) {
  const percent = effect.reflectPercentage || 100;
  const bonus = effect.damageBonus || 0;
  
  const parts = [`Reflects ${percent}% of damage back to attacker`];
  
  if (bonus > 0) {
    parts.push(`Reflected damage gets +${bonus} bonus`);
  }
  
  if (effect.statusReflect) {
    parts.push('Also reflects status effects');
  }
  
  return parts.join('\n• ');
}

function getRiskRewardEffect(effect) {
  const parts = [];
  
  if (effect.damageMultiplier) {
    parts.push(`${effect.damageMultiplier}x damage multiplier`);
  }
  
  if (effect.selfDamage) {
    parts.push(`You take ${effect.selfDamage} damage (self-harm)`);
  }
  
  if (effect.guaranteed) {
    parts.push('Cannot be blocked or evaded');
  }
  
  parts.push('⚠️ HIGH RISK, HIGH REWARD');
  
  return parts.join('\n• ');
}

function getSurvivalEffect(effect) {
  const parts = ['Defensive survival skill'];
  
  if (effect.damageReduction) {
    parts.push(`Reduce all incoming damage by ${effect.damageReduction}`);
  }
  
  if (effect.counterDamage) {
    parts.push(`Deal ${effect.counterDamage} counter damage to attackers`);
  }
  
  if (effect.duration) {
    parts.push(`Lasts ${effect.duration} turn(s)`);
  }
  
  return parts.join('\n• ');
}

// ==================== FORMAT HELPERS ====================

function formatBuffName(buffType) {
  const buffNames = {
    'charge': 'Charge',
    'focus': 'Focus',
    'ready': 'Ready',
    'feint': 'Feint',
    'elementalMagic': 'Elemental Magic',
    'ICE_MAGIC': 'Ice',
    'FIRE_MAGIC': 'Fire',
    'WIND_MAGIC': 'Wind',
    'EARTH_MAGIC': 'Earth',
    'IVY_MAGIC': 'Ivy',
    'LIGHTNING_MAGIC': 'Lightning'
  };
  return buffNames[buffType] || buffType;
}

function formatCardName(cardKey) {
  const cardNames = {
    'HEAVY_ATTACK': 'Smash',
    'NORMAL_ATTACK': 'Strike',
    'CHARGE_SHOT': 'Focus Shot',
    'NORMAL_SHOT': 'Quick Shot',
    'HEAVY_MAGIC': 'Blast',
    'NORMAL_MAGIC': 'Bolt',
    'BLOCK': 'Block',
    'COUNTER': 'Counter',
    'DEFLECT': 'Deflect',
    'EVADE': 'Evade',
    'HEAL': 'Heal',
    'CURE': 'Cure',
    'SHIELD': 'Shield'
  };
  return cardNames[cardKey] || cardKey.replace(/_/g, ' ');
}

/**
 * Generate complete tooltip HTML/text for a skill
 * @param {Object} skill - The skill object
 * @returns {string} Complete formatted tooltip
 */
export const generateSkillTooltip = (skill) => {
  if (!skill) return '';
  
  const info = getDetailedSkillInfo(skill);
  
  let tooltip = `${info.icon} ${info.name}\n`;
  tooltip += `${'='.repeat(info.name.length + 3)}\n\n`;
  tooltip += `${info.description}\n\n`;
  tooltip += `CLASS: ${info.jobClass}\n\n`;
  tooltip += `${info.trigger}\n\n`;
  tooltip += `EFFECT:\n• ${info.effect}\n\n`;
  
  if (info.requirements.length > 0) {
    tooltip += `REQUIREMENTS:\n`;
    info.requirements.forEach(req => {
      tooltip += `• ${req}\n`;
    });
    tooltip += '\n';
  }
  
  if (info.tips.length > 0) {
    tooltip += `TIPS:\n`;
    info.tips.forEach(tip => {
      tooltip += `💡 ${tip}\n`;
    });
  }
  
  return tooltip;
};

/**
 * Export all functions
 */
export default {
  getDetailedSkillInfo,
  getEnhancedTriggerDescription,
  getEffectDescription,
  getRequirements,
  getUsageTips,
  generateSkillTooltip
};