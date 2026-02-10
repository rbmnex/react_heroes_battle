// Card Types Model
export const CARD_TYPES = {
  NORMAL_ATTACK: { name: 'Normal Attack', damage: 3, type: 'attack', attackType: 'physical' },
  HEAVY_ATTACK: { name: 'Heavy Attack', damage: 6, type: 'attack', attackType: 'physical' },
  NORMAL_SHOT: { name: 'Normal Shot', damage: 3, type: 'attack', attackType: 'ranged' },
  CHARGE_SHOT: { name: 'Charge Shot', damage: 6, type: 'attack', attackType: 'ranged' },
  NORMAL_MAGIC: { name: 'Normal Magic', damage: 3, type: 'attack', attackType: 'magic' },
  HEAVY_MAGIC: { name: 'Heavy Magic', damage: 6, type: 'attack', attackType: 'magic' },
  FOCUS: { name: 'Focus', type: 'buff', buffType: 'focus', damageModifier: 1, extraAttacks: 0 },
  CHARGE: { name: 'Charge', type: 'buff', buffType: 'charge', damageModifier: 2, extraAttacks: 0, risk: 'stun' },
  READY: { name: 'Ready', type: 'buff', buffType: 'ready', damageModifier: 0, extraAttacks: 1 },
  FEINT: { name: 'Feint', type: 'buff', buffType: 'feint', damageModifier: -1, unavoidable: true },
  BLOCK: { name: 'Block', defense: 4, type: 'defense', defenseType: 'block' },
  EVADE: { name: 'Evade', defense: 999, type: 'defense', defenseType: 'evade' },
  COUNTER: { name: 'Counter', defense: 0, type: 'defense', defenseType: 'counter', counterType: 'physical' },
  DEFLECT: { name: 'Deflect', defense: 0, type: 'defense', defenseType: 'deflect', counterType: 'magic' },
  // Elemental magic buffs - combo with magic attacks:
  FIRE_MAGIC: { name: 'Fire Magic', type: 'buff', buffType: 'elementalMagic', element: 'fire', statusEffect: 'BURN', damageModifier: 1, extraAttacks: 0 },
  ICE_MAGIC: { name: 'Ice Magic', type: 'buff', buffType: 'elementalMagic', element: 'ice', statusEffect: 'FREEZE', damageModifier: 1, extraAttacks: 0 },
  WIND_MAGIC: { name: 'Wind Magic', type: 'buff', buffType: 'elementalMagic', element: 'wind', statusEffect: 'BLEED', damageModifier: 1, extraAttacks: 0 },
  EARTH_MAGIC: { name: 'Earth Magic', type: 'buff', buffType: 'elementalMagic', element: 'earth', statusEffect: 'STUN', damageModifier: 1, extraAttacks: 0 },
  IVY_MAGIC: { name: 'Ivy Magic', type: 'buff', buffType: 'elementalMagic', element: 'ivy', statusEffect: 'POISON', damageModifier: 1, extraAttacks: 0 },
  LIGHTNING_MAGIC: { name: 'Lightning Magic', type: 'buff', buffType: 'elementalMagic', element: 'lightning', statusEffect: 'PARALYZE', damageModifier: 1, extraAttacks: 0 },
  // support cards
  CURE: { name: 'Cure', type: 'support', effect: 'cleanse' },
  HEAL: { name: 'Heal', heal: 8, type: 'support', effect: 'heal' },
  SHIELD: { name: 'Shield', shieldValue: 10, type: 'support', effect: 'shield' },
};
