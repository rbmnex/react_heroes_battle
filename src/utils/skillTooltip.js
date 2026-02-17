/**
 * Utility functions for displaying skill information in tooltips
 */

/**
 * Format trigger information into human-readable description
 * @param {Object} skill - The skill object with trigger property
 * @returns {string} Formatted trigger description
 */
export const getSkillTriggerDescription = (skill) => {
  if (!skill || !skill.trigger) return '';

  const { trigger } = skill;

  switch (trigger.type) {
    case 'buff+attack':
      return `Trigger: Use ${formatBuffName(trigger.requiredBuff)} buff, then play ${formatCardName(trigger.requiredAttack)}${trigger.requiresFirstAttack ? ' (first attack only)' : ''}`;
    
    case 'buff+multi-attack':
      return `Trigger: Use ${formatBuffName(trigger.requiredBuff)} buff, then play ${trigger.minAttacks}x ${formatCardName(trigger.requiredAttack)}`;
    
    case 'multi-attack':
      return `Trigger: Play ${trigger.minAttacks}x ${formatCardName(trigger.requiredAttack)}`;
    
    case 'multi-card':
      return `Trigger: Play ${trigger.minCount || trigger.minAttacks || 2}x ${formatCardName(trigger.requiredCard)}`;
    
    case 'elemental+attack':
      return `Trigger: Use ${formatBuffName(trigger.requiredElemental)} element, then play ${formatCardName(trigger.requiredAttack)}`;
    
    case 'elemental+heavy':
      return `Trigger: Use Elemental Magic buff, then play Heavy Magic attack`;
    
    case 'skip_then_attack':
      return `Trigger: Skip first attack from ${formatBuffName(trigger.requiredBuff)}, use second attack instead`;
    
    case 'card_combination':
      return `Trigger: ${trigger.requiredCards.map(c => formatCardName(c)).join(' + ')} in sequence${trigger.mustBeConsecutive ? ' (consecutively)' : ''}`;
    
    case 'buff+support':
      return `Trigger: ${trigger.requiredCards.map(c => formatCardName(c)).join(' + ')} in sequence`;
    
    case 'conditional':
      return `Trigger: ${trigger.condition} (${trigger.description})`;
    
    default:
      return 'Trigger: Special skill';
  }
};

/**
 * Format buff type name for display
 * @param {string} buffType - The buff type (e.g., 'charge', 'focus', 'ready')
 * @returns {string} Formatted buff name
 */
const formatBuffName = (buffType) => {
  const buffNames = {
    'charge': 'Charge',
    'focus': 'Focus',
    'ready': 'Ready',
    'feint': 'Feint',
    'elementalMagic': 'Elemental Magic'
  };
  return buffNames[buffType] || buffType;
};

/**
 * Format card/attack name for display
 * @param {string} cardKey - The card key (e.g., 'HEAVY_ATTACK', 'NORMAL_ATTACK')
 * @returns {string} Formatted card name
 */
const formatCardName = (cardKey) => {
  const cardNames = {
    'HEAVY_ATTACK': 'Heavy Attack',
    'NORMAL_ATTACK': 'Normal Attack',
    'CHARGE_SHOT': 'Charge Shot',
    'QUICK_SHOT': 'Quick Shot',
    'NORMAL_SHOT': 'Normal Shot',
    'HEAVY_MAGIC': 'Heavy Magic',
    'LIGHT_MAGIC': 'Light Magic',
    'BLOCK': 'Block',
    'COUNTER': 'Counter',
    'HEAL': 'Heal',
    'CURE': 'Cure',
    'SHIELD': 'Shield',
    'FIRE': 'Fire',
    'ICE': 'Ice',
    'WIND': 'Wind',
    'EARTH': 'Earth',
    'READY': 'Ready'
  };
  return cardNames[cardKey] || cardKey.replace(/_/g, ' ');
};

/**
 * Generate complete tooltip text for skill
 * @param {Object} skill - The skill object
 * @returns {string} Complete tooltip with description + trigger info
 */
export const getSkillTooltipText = (skill) => {
  if (!skill) return '';
  
  const triggerDesc = getSkillTriggerDescription(skill);
  return `${skill.description}\n\n${triggerDesc}`;
};
