// Attack/Buff Controller - Pure logic for playing buff cards
import { STATUS_EFFECTS } from '../models/statusEffects';

/**
 * Play a buff card (Focus, Charge, Ready, Feint, Elemental Magic)
 * Validates requirements and updates game state via setters
 */
export const playBuffController = (
  card,
  currentTurn,
  activeHeroIndex,
  heroes,
  player1Hand,
  setPlayer1Hand,
  player2Hand,
  setPlayer2Hand,
  setActiveBuff,
  setRemainingAttacks,
  activeBuff,
  addLog
) => {
  const currentHand = currentTurn === 'player1' ? player1Hand : player2Hand;
  const attackCards = currentHand.filter(c => c.type === 'attack');
  const magicCards = attackCards.filter(c => c.attackType === 'magic');
  const hero = heroes[currentTurn][activeHeroIndex];

  // Elemental magic buffs require Mage hero
  if (card.buffType === 'elementalMagic') {
    if (hero.job.name !== 'Mage') {
      addLog(`⚠️ Only Mages can use ${card.name}!`);
      return;
    }
    if (magicCards.length < 1) {
      addLog(`⚠️ ${card.name} requires at least 1 magic attack card! You have ${magicCards.length}.`);
      return;
    }
  } else if (card.buffType === 'ready' && attackCards.length < 2) {
    addLog(`⚠️ Ready requires at least 2 attack cards! You have ${attackCards.length}.`);
    return;
  } else if (attackCards.length < 1) {
    addLog(`⚠️ Buff cards require at least 1 attack card!`);
    return;
  }

  if (activeBuff) {
    addLog('⚠️ Buff already active!');
    return;
  }

  // Remove buff card from hand
  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
  } else {
    setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
  }

  // Activate buff
  setActiveBuff(card);
  const totalAttacks = 1 + card.extraAttacks;
  setRemainingAttacks(totalAttacks);
  
  // Logging
  if (card.buffType === 'elementalMagic') {
    addLog(`✨ ${hero.name} (${hero.job.name}) channels ${card.name}! Magic attacks apply ${card.statusEffect}!`);
  } else {
    addLog(`🔥 ${hero.name} (${hero.job.name}) uses ${card.name}! ${totalAttacks} attacks!`);
  }

  if (card.buffType === 'charge') {
    addLog(`⚠️ Charge: 0 damage = stunned!`);
  }
  if (card.buffType === 'feint') {
    addLog(`💫 Feint: Unavoidable, -1 damage!`);
  }
};
