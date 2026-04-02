// Hero Skills Model
// Skills are triggered by specific card combinations, not played as separate cards

/**
 * SKILL TRIGGER TYPES:
 * - 'buff+attack': Requires specific buff followed by attack (e.g., Charge + Heavy Attack)
 * - 'multi-card': Requires multiple cards of same type (e.g., 3x Normal Attack)
 * - 'elemental+attack': Requires elemental buff + specific attack type
 */

export const HERO_SKILLS = {
  // === MELEE HERO SKILLS ===
  POWER_STRIKE: {
    id: 'POWER_STRIKE',
    name: 'Power Strike',
    description: 'Devastating blow that ignores defense',
    icon: '💥',
    jobClass: 'Melee',
    trigger: {
      type: 'buff+attack',
      requiredBuff: 'charge',
      requiredAttack: 'HEAVY_ATTACK',
      requiresFirstAttack: true // Must be first attack of sequence
    },
    effect: {
      type: 'damage_modifier',
      damageBonus: 3, // +3 damage on top of normal Charge bonus
      penetration: true, // Ignores Block defense
      statusEffect: 'STUN' // 50% chance to stun
    }
  },

  BLADE_FURY: {
    id: 'BLADE_FURY',
    name: 'Blade Fury',
    description: 'Rapid successive strikes',
    icon: '⚔️',
    jobClass: 'Melee',
    trigger: {
      type: 'buff+multi-attack',
      requiredBuff: 'ready',
      requiredAttack: 'NORMAL_ATTACK',
      minAttacks: 2
    },
    effect: {
      type: 'multi_hit',
      hitsPerAttack: 2, // Each attack in sequence hits twice
      damagePerHit: 2 // Each hit deals 2 damage (total 4 per attack card)
    }
  },

  COUNTER_STANCE: {
    id: 'COUNTER_STANCE',
    name: 'Counter Stance',
    description: 'Defensive position that punishes attackers',
    icon: '🛡️',
    jobClass: 'Melee',
    trigger: {
      type: 'card_combination',
      requiredCards: ['BLOCK', 'COUNTER'],
      mustBeInHand: true // Both must be in hand, played in sequence
    },
    effect: {
      type: 'temporary_buff',
      duration: 1, // Lasts until next attack received
      counterDamage: 'full', // Reflects 100% instead of 50%
      damageReduction: 5 // Reduces incoming damage by 5
    }
  },

  // === RANGED HERO SKILLS ===
  HEADSHOT: {
    id: 'HEADSHOT',
    name: 'Headshot',
    description: 'Precise shot dealing massive damage',
    icon: '🎯',
    jobClass: 'Ranged',
    trigger: {
      type: 'buff+attack',
      requiredBuff: 'focus',
      requiredAttack: 'CHARGE_SHOT',
      requiresFirstAttack: true
    },
    effect: {
      type: 'damage_modifier',
      damageMultiplier: 1.5, // 1.5x damage
      criticalHit: true, // Cannot be blocked or evaded
      ignoreShield: true // Bypasses shield
    }
  },

  RAPID_FIRE: {
    id: 'RAPID_FIRE',
    name: 'Rapid Fire',
    description: 'Unleash a barrage of shots',
    icon: '🔫',
    jobClass: 'Ranged',
    trigger: {
      type: 'buff+multi-attack',
      requiredBuff: 'ready',
      requiredAttack: 'NORMAL_SHOT',
      minAttacks: 2 // Ready buff + 2 Quick Shots
    },
    effect: {
      type: 'multi_target',
      canTargetAll: true, // Can hit all enemy heroes
      damagePerTarget: 2, // Each enemy takes 2 damage
      distributeEvenly: true
    }
  },

  SNIPER_FOCUS: {
    id: 'SNIPER_FOCUS',
    name: 'Sniper Focus',
    description: 'Patient aim for guaranteed hit',
    icon: '🔭',
    jobClass: 'Ranged',
    trigger: {
      type: 'skip_then_attack',
      requiredBuff: 'ready',
      skipFirstAttack: true, // Don't use first attack granted by Ready
      useSecondAttack: true
    },
    effect: {
      type: 'guaranteed_hit',
      damageBonus: 4, // +4 damage
      unavoidable: true, // Cannot be evaded
      unblockable: true // Cannot be blocked
    }
  },

  // === MAGE HERO SKILLS ===
  ELEMENTAL_MASTERY: {
    id: 'ELEMENTAL_MASTERY',
    name: 'Elemental Mastery',
    description: 'Unleash devastating elemental power',
    icon: '🌟',
    jobClass: 'Mage',
    trigger: {
      type: 'elemental+heavy',
      requiredBuff: 'elementalMagic', // Any elemental magic
      requiredAttack: 'HEAVY_MAGIC'
    },
    effect: {
      type: 'enhanced_status',
      statusDurationBonus: 2, // Status lasts 2 turns longer
      statusDamageBonus: 2, // DOT effects deal +2 damage
      splashDamage: 2 // Adjacent heroes take 2 damage
    }
  },

  ARCANE_SURGE: {
    id: 'ARCANE_SURGE',
    name: 'Arcane Surge',
    description: 'Channel raw magical energy',
    icon: '✨',
    jobClass: 'Mage',
    trigger: {
      type: 'multi-magic',
      requiredCard: 'NORMAL_MAGIC',
      minCount: 2,
      consecutiveOnly: true
    },
    effect: {
      type: 'damage_modifier',
      damageBonus: 4, // Each attack gets +4 damage
      piercingDamage: true, // Ignores Shield defense
      chainEffect: true // 50% chance to hit another random enemy
    }
  },

  SPELL_REFLECT: {
    id: 'SPELL_REFLECT',
    name: 'Spell Reflect',
    description: 'Turn enemy magic against them',
    icon: '🔮',
    jobClass: 'Mage',
    trigger: {
      type: 'reactive',
      triggersOn: 'magicAttackReceived',
      requiresCard: 'DEFLECT'
    },
    effect: {
      type: 'enhanced_reflection',
      reflectPercentage: 100, // Reflects 100% instead of 50%
      statusReflect: true, // Also reflects status effects
      damageBonus: 2 // Reflected damage +2
    }
  },

  FROST_NOVA: {
    id: 'FROST_NOVA',
    name: 'Frost Nova',
    description: 'Freeze all enemies in place',
    icon: '❄️',
    jobClass: 'Mage',
    trigger: {
      type: 'elemental+heavy',
      requiredBuff: 'elementalMagic',
      requiredElement: 'ice', // Must specifically be Ice buff
      requiredAttack: 'HEAVY_MAGIC'
    },
    effect: {
      type: 'area_status',
      targetsAllEnemies: true,
      statusEffect: 'FREEZE',
      statusDuration: 1,
      damage: 3 // Each enemy takes 3 damage (boosted since trigger is easier)
    }
  },

  // === SUPPORT HERO SKILLS ===
  DIVINE_PROTECTION: {
    id: 'DIVINE_PROTECTION',
    name: 'Divine Protection',
    description: 'Bestow holy protection on allies',
    icon: '✝️',
    jobClass: 'Support',
    trigger: {
      type: 'multi-support',
      requiredCard: 'SHIELD',
      minCount: 2,
      sameTarget: false // Must target different heroes
    },
    effect: {
      type: 'team_buff',
      shieldBonus: 5, // All allies gain +5 shield
      damageReduction: 2, // All allies take -2 damage for 1 turn
      duration: 1
    }
  },

  MASS_HEAL: {
    id: 'MASS_HEAL',
    name: 'Mass Heal',
    description: 'Restore health to all allies',
    icon: '💚',
    jobClass: 'Support',
    trigger: {
      type: 'card_combination',
      requiredCards: ['HEAL', 'HEAL'],
      mustBeConsecutive: true
    },
    effect: {
      type: 'area_heal',
      targetsAllAllies: true,
      healAmount: 4, // Each ally heals 4 HP
      removesStatus: ['BURN', 'POISON', 'BLEED'] // Removes DOT effects
    }
  },

  PURIFICATION: {
    id: 'PURIFICATION',
    name: 'Purification',
    description: 'Cleanse and protect from ailments',
    icon: '🌟',
    jobClass: 'Support',
    trigger: {
      type: 'buff+support',
      requiredCards: ['CURE', 'SHIELD'],
      mustBeConsecutive: true
    },
    effect: {
      type: 'enhanced_cleanse',
      removesAllStatus: true,
      immunityDuration: 1, // Immune to status effects for 1 turn
      healAmount: 3 // Also heals 3 HP
    }
  },

  BLESSING: {
    id: 'BLESSING',
    name: 'Blessing',
    description: 'Sacrificial prayer that heals all allies but stuns them',
    icon: '🙏',
    jobClass: 'Support',
    trigger: {
      type: 'buff+support',
      requiredBuff: 'charge',
      requiredCards: ['HEAL'],
      mustBeConsecutive: false
    },
    effect: {
      type: 'area_heal',
      targetsAllAllies: true,
      healAmount: 6,
      appliesStatus: 'STUN',
      statusDuration: 1 // All healed allies stunned next turn
    }
  },

  // === UNIVERSAL SKILLS (Any class can trigger) ===
  DESPERATE_STRIKE: {
    id: 'DESPERATE_STRIKE',
    name: 'Desperate Strike',
    description: 'All-or-nothing attack when near death',
    icon: '💀',
    jobClass: 'Any',
    trigger: {
      type: 'conditional',
      condition: 'lowHp', // Hero HP <= 25%
      requiredBuff: 'charge',
      requiredAttack: 'any'
    },
    effect: {
      type: 'risk_reward',
      damageMultiplier: 2, // Double damage
      selfDamage: 5, // Take 5 damage
      guaranteed: true // Cannot miss or be blocked
    }
  },

  LAST_STAND: {
    id: 'LAST_STAND',
    name: 'Last Stand',
    description: 'Final desperate defense',
    icon: '⚔️',
    jobClass: 'Any',
    trigger: {
      type: 'conditional',
      condition: 'lastHeroStanding', // Only hero left on team
      requiresCard: 'BLOCK'
    },
    effect: {
      type: 'survival',
      damageReduction: 10, // Reduce all damage by 10
      counterDamage: 3, // Deal 3 damage to attacker
      duration: 1
    }
  }
};

/**
 * Get all skills available to a specific job class
 */
export const getSkillsForJobClass = (jobClassName) => {
  return Object.values(HERO_SKILLS).filter(
    skill => skill.jobClass === jobClassName || skill.jobClass === 'Any'
  );
};

/**
 * Get skill by ID
 */
export const getSkillById = (skillId) => {
  return HERO_SKILLS[skillId] || null;
};

/**
 * Check if a hero can use a specific skill
 */
export const canHeroUseSkill = (hero, skillId) => {
  const skill = HERO_SKILLS[skillId];
  if (!skill) return false;
  
  // Check job class restriction
  if (skill.jobClass !== 'Any' && skill.jobClass !== hero.job.name) {
    return false;
  }
  
  // Check if hero is paralyzed (prevents skills)
  if (hero.statusEffects.some(e => e.preventSkills)) {
    return false;
  }
  
  return true;
};

/**
 * Get all skills that could be triggered by current game state
 * This is the main detection function
 */
export const detectPossibleSkills = (hero, cardsPlayed, activeBuff, heroState) => {
  const availableSkills = getSkillsForJobClass(hero.job.name);
  const triggeredSkills = [];
  
  availableSkills.forEach(skill => {
    if (!canHeroUseSkill(hero, skill.id)) return;
    
    // Check trigger conditions based on skill type
    const trigger = skill.trigger;
    
    switch (trigger.type) {
      case 'buff+attack':
        if (activeBuff && 
            activeBuff.buffType === trigger.requiredBuff &&
            cardsPlayed.attack &&
            cardsPlayed.attack.type === trigger.requiredAttack) {
          triggeredSkills.push(skill);
        }
        break;
        
      case 'multi-card':
        if (cardsPlayed.count >= trigger.minCount &&
            cardsPlayed.cardType === trigger.requiredCard) {
          triggeredSkills.push(skill);
        }
        break;
        
      case 'elemental+heavy':
        if (activeBuff && 
            activeBuff.buffType === 'elementalMagic' &&
            cardsPlayed.attack &&
            cardsPlayed.attack.type === 'HEAVY_MAGIC') {
          triggeredSkills.push(skill);
        }
        break;
        
      case 'conditional':
        // Check conditional triggers (low HP, last hero, etc.)
        if (checkConditionalTrigger(trigger.condition, hero, heroState)) {
          if (activeBuff && activeBuff.buffType === trigger.requiredBuff) {
            triggeredSkills.push(skill);
          }
        }
        break;
        
      // Add more trigger type checks as needed
    }
  });
  
  return triggeredSkills;
};

/**
 * Helper: Check conditional triggers
 */
const checkConditionalTrigger = (condition, hero, heroState) => {
  switch (condition) {
    case 'lowHp':
      return hero.hp <= hero.maxHp * 0.25;
    case 'lastHeroStanding':
      return heroState.aliveCount === 1;
    default:
      return false;
  }
};

/**
 * Apply skill effects to game state
 * This function modifies attack damage, adds status effects, etc.
 */
export const applySkillEffects = (skill, attackContext, heroes, currentTurn) => {
  const effect = skill.effect;
  const modifiedContext = { ...attackContext };
  
  switch (effect.type) {
    case 'damage_modifier':
      if (effect.damageBonus) {
        modifiedContext.damage += effect.damageBonus;
      }
      if (effect.damageMultiplier) {
        modifiedContext.damage = Math.floor(modifiedContext.damage * effect.damageMultiplier);
      }
      if (effect.penetration) {
        modifiedContext.ignoresBlock = true;
      }
      if (effect.unavoidable) {
        modifiedContext.unavoidable = true;
      }
      if (effect.ignoreShield) {
        modifiedContext.ignoreShield = true;
      }
      break;
      
    case 'enhanced_status':
      if (effect.statusDurationBonus) {
        modifiedContext.statusDurationBonus = effect.statusDurationBonus;
      }
      if (effect.statusDamageBonus) {
        modifiedContext.statusDamageBonus = effect.statusDamageBonus;
      }
      if (effect.splashDamage) {
        modifiedContext.splashDamage = effect.splashDamage;
      }
      break;
      
    case 'multi_target':
      modifiedContext.targetsAll = effect.canTargetAll;
      modifiedContext.damagePerTarget = effect.damagePerTarget;
      break;
      
    case 'guaranteed_hit':
      modifiedContext.unavoidable = true;
      modifiedContext.unblockable = true;
      if (effect.damageBonus) {
        modifiedContext.damage += effect.damageBonus;
      }
      break;
      
    // Add more effect types as needed
  }
  
  return modifiedContext;
};