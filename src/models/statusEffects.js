// Status Effects Model
export const STATUS_EFFECTS = {
  BURN: { name: 'Burn', icon: '🔥', damagePerTurn: 2, duration: 3 },
  FREEZE: { name: 'Freeze', icon: '❄️', skipTurn: true, duration: 2 },
  BLEED: { name: 'Bleed', icon: '🩸', damageOnAction: 2, duration: 2 },
  STUN: { name: 'Stun', icon: '💫', skipTurn: true, duration: 1 },
  POISON: { name: 'Poison', icon: '☠️', damagePerTurn: 2, duration: 4 },
  PARALYZE: { name: 'Paralyze', icon: '⚡', preventSkills: true, duration: 2 }
};
