// Support Card Controller - Handle support card targeting and effects

/**
 * Apply support card effects (heal, cleanse, shield) to a target teammate
 */
export const selectSupportTargetController = (
  heroId,
  pendingSupportCard,
  currentTurn,
  activeHeroIndex,
  heroes,
  setHeroes,
  setSelectingSupportTarget,
  setPendingSupportCard,
  setHeroSupportCounts,
  player1Hand,
  setPlayer1Hand,
  player2Hand,
  setPlayer2Hand,
  addLog
) => {
  const supportCard = pendingSupportCard;
  const team = heroes[currentTurn];
  const targetHero = team.find(h => h.id === heroId);
  const casterHero = heroes[currentTurn][activeHeroIndex];
  
  if (!targetHero || targetHero.defeated) {
    addLog(`⚠️ Invalid target!`);
    return;
  }
  
  // Apply the support effect
  if (supportCard.effect === 'heal') {
    setHeroes(prev => ({
      ...prev,
      [currentTurn]: prev[currentTurn].map(h =>
        h.id === targetHero.id ? { 
          ...h, 
          hp: Math.min(h.maxHp, h.hp + supportCard.heal) 
        } : h
      )
    }));
    addLog(`💚 ${targetHero.name} healed ${supportCard.heal} HP!`);
  } else if (supportCard.effect === 'cleanse') {
    setHeroes(prev => ({
      ...prev,
      [currentTurn]: prev[currentTurn].map(h =>
        h.id === targetHero.id ? { ...h, statusEffects: [] } : h
      )
    }));
    addLog(`✨ ${targetHero.name} cleansed of all status effects!`);
  } else if (supportCard.effect === 'shield') {
    setHeroes(prev => ({
      ...prev,
      [currentTurn]: prev[currentTurn].map(h =>
        h.id === targetHero.id ? { 
          ...h, 
          shield: h.shield + supportCard.shieldValue 
        } : h
      )
    }));
    addLog(`🛡️ ${targetHero.name} gains ${supportCard.shieldValue} shield! (Total: ${targetHero.shield + supportCard.shieldValue})`);
  }
  
  // Remove support card from hand
  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => prev.filter(c => c.id !== supportCard.id));
  } else {
    setPlayer2Hand(prev => prev.filter(c => c.id !== supportCard.id));
  }
  
  // Track support card usage
  setHeroSupportCounts(prev => ({
    ...prev,
    [casterHero.id]: (prev[casterHero.id] || 0) + 1
  }));
  
  // Exit support targeting mode
  setSelectingSupportTarget(false);
  setPendingSupportCard(null);
};
