// Skill Detection and Execution Controller
import { HERO_SKILLS, applySkillEffects, canHeroUseSkill } from '../models/heroSkills';
import { CARD_TYPES } from '../models/cardTypes';

/**
 * Helper: Get CARD_TYPES key from a card's display name
 * e.g. 'Smash' → 'HEAVY_ATTACK', 'Focus Shot' → 'CHARGE_SHOT'
 */
const getCardTypeKey = (cardName) => {
  return Object.keys(CARD_TYPES).find(key => CARD_TYPES[key].name === cardName) || null;
};

/**
 * Unified skill detection on attack.
 * Checks the hero's assigned heroSkill AND universal skills.
 * Called when an attack card is played with a target.
 */
export const checkSkillOnAttack = (
  hero,
  activeBuff,
  attackCard,
  heroAttackCounts,
  currentHand,
  heroes,
  currentTurn
) => {
  if (hero.statusEffects.some(e => e.preventSkills)) return null;

  const attackCount = heroAttackCounts[hero.id] || 0;
  const isFirstAttack = attackCount === 0;
  const attackKey = getCardTypeKey(attackCard.name);

  // Check hero's own skill first
  const heroSkill = hero.heroSkill;
  if (heroSkill) {
    const result = matchSkillTrigger(heroSkill, activeBuff, attackCard, attackKey, isFirstAttack, attackCount, currentHand, hero, heroes, currentTurn);
    if (result) return result;
  }

  // Check universal skills (jobClass === 'Any')
  const universalSkills = Object.values(HERO_SKILLS).filter(s => s.jobClass === 'Any');
  for (const skill of universalSkills) {
    const result = matchSkillTrigger(skill, activeBuff, attackCard, attackKey, isFirstAttack, attackCount, currentHand, hero, heroes, currentTurn);
    if (result) return result;
  }

  return null;
};

/**
 * Match a single skill's trigger against current game state
 */
const matchSkillTrigger = (skill, activeBuff, attackCard, attackKey, isFirstAttack, attackCount, currentHand, hero, heroes, currentTurn) => {
  const trigger = skill.trigger;

  switch (trigger.type) {
    case 'buff+attack': {
      // e.g. Power Strike: Charge + Smash (first attack)
      // e.g. Headshot: Focus + Focus Shot (first attack)
      if (!activeBuff) return null;
      if (activeBuff.buffType !== trigger.requiredBuff) return null;
      if (attackKey !== trigger.requiredAttack) return null;
      if (trigger.requiresFirstAttack && !isFirstAttack) return null;
      return skill;
    }

    case 'elemental+heavy': {
      // e.g. Elemental Mastery: any elemental magic buff + Blast
      // e.g. Frost Nova: specifically Ice buff + Blast
      if (!activeBuff) return null;
      if (activeBuff.buffType !== 'elementalMagic') return null;
      if (trigger.requiredElement && activeBuff.element !== trigger.requiredElement) return null;
      if (attackKey !== trigger.requiredAttack) return null;
      return skill;
    }

    case 'buff+multi-attack': {
      // e.g. Blade Fury: Ready + 2nd consecutive Strike
      if (!activeBuff) return null;
      if (activeBuff.buffType !== trigger.requiredBuff) return null;
      if (attackKey !== trigger.requiredAttack) return null;
      // Triggers on the Nth attack (minAttacks-1 already done)
      if (attackCount < trigger.minAttacks - 1) return null;
      return skill;
    }

    case 'multi-card': {
      // e.g. Rapid Fire: 3x Quick Shot in hand
      const requiredCardName = CARD_TYPES[trigger.requiredCard]?.name;
      if (!requiredCardName) return null;
      // Current attack must be the required card type
      if (attackCard.name !== requiredCardName) return null;
      // Count how many of this card are in hand (including the one being played)
      const inHandCount = currentHand.filter(c => c.name === requiredCardName).length;
      if (inHandCount < trigger.minCount) return null;
      return skill;
    }

    case 'multi-magic': {
      // e.g. Arcane Surge: 2x Bolt consecutively
      const requiredCardName = CARD_TYPES[trigger.requiredCard]?.name;
      if (!requiredCardName) return null;
      if (attackCard.name !== requiredCardName) return null;
      // Triggers on the Nth consecutive magic attack
      if (attackCount < trigger.minCount - 1) return null;
      return skill;
    }

    case 'conditional': {
      // e.g. Desperate Strike: HP <= 25% + Charge + any attack
      if (!activeBuff) return null;
      if (trigger.requiredBuff && activeBuff.buffType !== trigger.requiredBuff) return null;
      const team = heroes[currentTurn];
      const aliveCount = team.filter(h => !h.defeated).length;
      if (trigger.condition === 'lowHp' && hero.hp > hero.maxHp * 0.25) return null;
      if (trigger.condition === 'lastHeroStanding' && aliveCount !== 1) return null;
      return skill;
    }

    default:
      return null;
  }
};

/**
 * Check for support card skill triggers
 * Called after a support card is played, with history of support cards used this turn
 */
export const checkSkillOnSupport = (
  hero,
  supportCard,
  supportHistory,
  targetHeroId,
  heroes,
  currentTurn,
  activeBuff
) => {
  if (hero.statusEffects.some(e => e.preventSkills)) return null;

  const heroSkill = hero.heroSkill;
  if (!heroSkill) return null;

  const trigger = heroSkill.trigger;

  switch (trigger.type) {
    case 'card_combination': {
      // e.g. Mass Heal: 2x Heal consecutively
      if (!trigger.requiredCards) return null;
      const required = trigger.requiredCards;
      // Build history including current card
      const fullHistory = [...supportHistory, { cardKey: getCardTypeKey(supportCard.name), targetHeroId }];
      if (fullHistory.length < required.length) return null;
      // Check last N cards match required sequence
      const recent = fullHistory.slice(-required.length);
      const allMatch = required.every((reqKey, i) => recent[i].cardKey === reqKey);
      if (!allMatch) return null;
      if (trigger.mustBeConsecutive) {
        // Already checking last N, so consecutive is guaranteed
      }
      return heroSkill;
    }

    case 'multi-support': {
      // e.g. Divine Protection: 2x Shield on different allies
      // e.g. Blessing: 2x Heal on same ally
      const requiredCardName = trigger.requiredCard;
      const fullHistory = [...supportHistory, { cardKey: getCardTypeKey(supportCard.name), targetHeroId }];
      const matchingPlays = fullHistory.filter(h => h.cardKey === requiredCardName);
      if (matchingPlays.length < trigger.minCount) return null;
      if (trigger.sameTarget === false) {
        const uniqueTargets = new Set(matchingPlays.map(h => h.targetHeroId));
        if (uniqueTargets.size < trigger.minCount) return null;
      }
      if (trigger.sameTarget === true) {
        const recent = matchingPlays.slice(-trigger.minCount);
        const allSameTarget = recent.every(h => h.targetHeroId === recent[0].targetHeroId);
        if (!allSameTarget) return null;
      }
      return heroSkill;
    }

    case 'buff+support': {
      // e.g. Purification: Cure + Shield on same target consecutively
      // e.g. Blessing: Charge buff + Heal
      if (trigger.requiredBuff) {
        if (!activeBuff || activeBuff.buffType !== trigger.requiredBuff) return null;
      }
      if (!trigger.requiredCards) return null;
      const fullHistory = [...supportHistory, { cardKey: getCardTypeKey(supportCard.name), targetHeroId }];
      if (fullHistory.length < trigger.requiredCards.length) return null;
      const recent = fullHistory.slice(-trigger.requiredCards.length);
      const keysMatch = trigger.requiredCards.every((reqKey, i) => recent[i].cardKey === reqKey);
      if (!keysMatch) return null;
      if (trigger.mustBeConsecutive) {
        // Check same target
        const sameTarget = recent.every(h => h.targetHeroId === recent[0].targetHeroId);
        if (!sameTarget) return null;
      }
      return heroSkill;
    }

    case 'triple-support': {
      // e.g. Blessing: 3x Heal on same target
      const requiredCardName = trigger.requiredCard;
      const fullHistory = [...supportHistory, { cardKey: getCardTypeKey(supportCard.name), targetHeroId }];
      const matchingPlays = fullHistory.filter(h => h.cardKey === requiredCardName);
      if (matchingPlays.length < trigger.minCount) return null;
      // Check all on same target
      const recent = matchingPlays.slice(-trigger.minCount);
      const sameTarget = recent.every(h => h.targetHeroId === recent[0].targetHeroId);
      if (!sameTarget) return null;
      return heroSkill;
    }

    default:
      return null;
  }
};

/**
 * Check for defensive/reactive skill triggers
 * Called when a defense card is played during reaction
 */
export const checkSkillOnDefense = (
  hero,
  defenseCard,
  pendingAttack,
  heroes,
  currentTurn
) => {
  if (hero.statusEffects.some(e => e.preventSkills)) return null;

  const heroSkill = hero.heroSkill;
  if (!heroSkill) return null;

  const trigger = heroSkill.trigger;

  if (trigger.type === 'reactive') {
    // e.g. Spell Reflect: magic attack received + Deflect
    if (trigger.triggersOn === 'magicAttackReceived' && pendingAttack.card.attackType === 'magic') {
      const defenseKey = getCardTypeKey(defenseCard.name);
      if (defenseKey === trigger.requiresCard) return heroSkill;
    }
  }

  // Check Last Stand (universal) - last hero + Block
  if (defenseCard.defenseType === 'block') {
    const team = heroes[currentTurn];
    const aliveCount = team.filter(h => !h.defeated).length;
    if (aliveCount === 1) {
      const lastStand = HERO_SKILLS.LAST_STAND;
      if (lastStand) return lastStand;
    }
  }

  return null;
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
  addLog(`--- ${skill.icon} SKILL ACTIVATED: ${skill.name}! ---`);
  addLog(`${skill.description}`);

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

  // Log specific effects
  if (modifiedContext.damage !== pendingAttack.card.damage) {
    addLog(`Damage: ${pendingAttack.card.damage} -> ${modifiedContext.damage}`);
  }
  if (modifiedContext.ignoresBlock) {
    addLog(`Penetrates block defense!`);
  }
  if (modifiedContext.unavoidable) {
    addLog(`Attack is unavoidable!`);
  }
  if (modifiedContext.ignoreShield) {
    addLog(`Bypasses shield!`);
  }
  if (modifiedContext.splashDamage > 0) {
    addLog(`Splash: ${modifiedContext.splashDamage} damage to adjacent heroes!`);
  }

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
 * Apply support skill effects
 */
export const applySupportSkillEffects = (
  skill,
  heroes,
  currentTurn,
  setHeroes,
  addLog,
  casterIndex
) => {
  if (!skill) return;

  addLog(`--- ${skill.icon} SKILL ACTIVATED: ${skill.name}! ---`);
  addLog(`${skill.description}`);

  const effect = skill.effect;

  if (effect.type === 'area_heal') {
    // Mass Heal: heal all allies and remove DOT effects
    // Blessing: heal all allies, only caster gets stunned
    const caster = heroes[currentTurn][casterIndex];
    setHeroes(prev => ({
      ...prev,
      [currentTurn]: prev[currentTurn].map(h => {
        if (h.defeated) return h;
        const newHp = Math.min(h.maxHp, h.hp + effect.healAmount);
        let updatedEffects = effect.removesStatus
          ? h.statusEffects.filter(e => !effect.removesStatus.includes(e.type))
          : [...h.statusEffects];
        const isCaster = caster && h.id === caster.id;
        if (effect.appliesStatus && isCaster) {
          updatedEffects = [...updatedEffects, { type: effect.appliesStatus, duration: effect.statusDuration || 1 }];
          addLog(`${skill.icon} ${h.name} heals ${effect.healAmount} HP but is STUNNED! (${h.hp} -> ${newHp})`);
        } else {
          addLog(`${skill.icon} ${h.name} heals ${effect.healAmount} HP! (${h.hp} -> ${newHp})`);
        }
        return { ...h, hp: newHp, statusEffects: updatedEffects };
      })
    }));
    if (effect.removesStatus) {
      addLog(`Removes: ${effect.removesStatus.join(', ')}!`);
    }
  }

  if (effect.type === 'team_buff') {
    // Divine Protection: all allies gain shield and damage reduction
    setHeroes(prev => ({
      ...prev,
      [currentTurn]: prev[currentTurn].map(h => {
        if (h.defeated) return h;
        addLog(`${skill.icon} ${h.name} gains +${effect.shieldBonus} shield!`);
        return { ...h, shield: h.shield + effect.shieldBonus };
      })
    }));
    addLog(`All allies take -${effect.damageReduction} damage for ${effect.duration} turn(s)!`);
  }

  if (effect.type === 'enhanced_cleanse') {
    // Purification: remove all status, grant immunity, heal
    // Applied to the target of the last support card in the sequence
    addLog(`Target cleansed of ALL status effects and gains ${effect.immunityDuration}-turn immunity!`);
    addLog(`Also heals ${effect.healAmount} HP!`);
  }

  if (effect.type === 'temporary_buff') {
    // Blessing: +damage, -damage taken for target
    addLog(`Target gains +${effect.damageBonus} damage and -${effect.defenseBonus} damage taken for ${effect.duration} turns!`);
  }
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

  // Check hero's own skill
  const heroSkill = hero.heroSkill;
  if (heroSkill) {
    const potential = checkPotentialTrigger(heroSkill, hand, activeBuff);
    if (potential) potentialSkills.push(heroSkill);
  }

  // Check universal skills
  const universalSkills = Object.values(HERO_SKILLS).filter(s => s.jobClass === 'Any');
  universalSkills.forEach(skill => {
    const potential = checkPotentialTrigger(skill, hand, activeBuff);
    if (potential) potentialSkills.push(skill);
  });

  return potentialSkills;
};

/**
 * Check if a skill could potentially trigger based on current hand and buff
 */
const checkPotentialTrigger = (skill, hand, activeBuff) => {
  const trigger = skill.trigger;

  switch (trigger.type) {
    case 'buff+attack': {
      if (!activeBuff || activeBuff.buffType !== trigger.requiredBuff) return false;
      const requiredName = CARD_TYPES[trigger.requiredAttack]?.name;
      return hand.some(c => c.name === requiredName);
    }

    case 'elemental+heavy': {
      if (!activeBuff || activeBuff.buffType !== 'elementalMagic') return false;
      if (trigger.requiredElement && activeBuff.element !== trigger.requiredElement) return false;
      const requiredName = CARD_TYPES[trigger.requiredAttack]?.name;
      return hand.some(c => c.name === requiredName);
    }

    case 'buff+multi-attack': {
      if (!activeBuff || activeBuff.buffType !== trigger.requiredBuff) return false;
      const requiredName = CARD_TYPES[trigger.requiredAttack]?.name;
      return hand.filter(c => c.name === requiredName).length >= 1;
    }

    case 'multi-card': {
      const requiredName = CARD_TYPES[trigger.requiredCard]?.name;
      if (!requiredName) return false;
      return hand.filter(c => c.name === requiredName).length >= trigger.minCount;
    }

    case 'multi-magic': {
      const requiredName = CARD_TYPES[trigger.requiredCard]?.name;
      if (!requiredName) return false;
      return hand.filter(c => c.name === requiredName).length >= trigger.minCount;
    }

    case 'conditional': {
      if (trigger.requiredBuff && (!activeBuff || activeBuff.buffType !== trigger.requiredBuff)) return false;
      return hand.some(c => c.type === 'attack');
    }

    default:
      return false;
  }
};

// Keep legacy exports for backwards compatibility
export const checkBuffAttackSkill = checkSkillOnAttack;
export const checkElementalSkill = () => null;
export const checkMultiCardSkill = () => null;
export const checkConditionalSkills = () => null;
export const checkForSkillTrigger = () => null;
export const getSkillIndicator = (skillId) => {
  const skill = HERO_SKILLS[skillId];
  if (!skill) return null;
  return { id: skill.id, name: skill.name, icon: skill.icon, description: skill.description };
};
