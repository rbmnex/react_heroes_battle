// Card Management and Routing Controller
import { generateCard } from '../utils/cardGeneration';
import { checkBuffAttackSkill, applySkillToAttack } from './skillController';

/**
 * Play an attack card - handles target selection or direct attack with target
 */
export const playAttackController = (
  card,
  targetHeroId,
  currentTurn,
  activeHeroIndex,
  heroes,
  player1Hand,
  setPlayer1Hand,
  player2Hand,
  setPlayer2Hand,
  activeBuff,
  heroAttackCounts,
  setPendingAttackCard,
  setSelectingTarget,
  setPendingAttack,
  setWaitingForReaction,
  setIsFirstAttackOfHero,
  setHeroAttackCounts,
  setTriggeredSkill,
  setSkillIndicatorVisible,
  addLog
) => {
  const attacker = heroes[currentTurn][activeHeroIndex];
  
  // Check if this hero can use this attack card
  const canUseAttack = (hero, attackCard) => {
    const jobName = hero.job.name;
    if (jobName === 'Melee' && attackCard.attackType === 'physical') return true;
    if (jobName === 'Ranged' && attackCard.attackType === 'ranged') return true;
    if (jobName === 'Mage' && attackCard.attackType === 'magic') return true;
    if (jobName === 'Support' && attackCard.attackType === 'magic') return true;
    return false;
  };

  if (!canUseAttack(attacker, card)) {
    addLog(`⚠️ ${attacker.name} (${attacker.job.name}) cannot use ${card.name}!`);
    return;
  }

  // If elemental magic buff is active, check that attack is magic type
  if (activeBuff && activeBuff.buffType === 'elementalMagic' && card.attackType !== 'magic') {
    addLog(`⚠️ ${activeBuff.name} only combos with magic attacks!`);
    return;
  }

  const maxAttacks = activeBuff ? (1 + activeBuff.extraAttacks) : 1;
  const heroAttackCount = heroAttackCounts[attacker.id] || 0;

  // If no target selected yet, enter target selection mode
  if (!targetHeroId) {
    if (heroAttackCount >= maxAttacks) {
      addLog(`⚠️ ${attacker.name} has already attacked ${maxAttacks} time${maxAttacks > 1 ? 's' : ''} this turn!`);
      return;
    }
    
    setPendingAttackCard(card);
    setSelectingTarget(true);
    setIsFirstAttackOfHero(true);
    addLog(`Select target for ${card.name}...`);
    return;
  }

  // Target selected - validate and execute
  if (heroAttackCount >= maxAttacks) {
    addLog(`⚠️ ${attacker.name} has already attacked ${maxAttacks} time${maxAttacks > 1 ? 's' : ''} this turn!`);
    setSelectingTarget(false);
    return;
  }

  const opponent = currentTurn === 'player1' ? 'player2' : 'player1';
  const targetHero = heroes[opponent].find(h => h.id === targetHeroId);

  if (!targetHero || targetHero.defeated) {
    addLog(`⚠️ Invalid target!`);
    return;
  }

  // Remove card from hand
  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
  } else {
    setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
  }

  let finalDamage = card.damage;
  let isFeint = false;
  let triggeredSkill = null;

  if (activeBuff) {
    finalDamage += activeBuff.damageModifier;
    if (activeBuff.buffType === 'feint') {
      isFeint = true;
    }
  }

  // Check for skill trigger (buff + attack combinations)
  const isFirstAttack = (heroAttackCounts[attacker.id] || 0) === 0;
  triggeredSkill = checkBuffAttackSkill(
    attacker,
    activeBuff,
    card,
    isFirstAttack,
    heroes,
    currentTurn
  );

  // Set pending attack and wait for defender's reaction
  let pendingAttackObj = {
    card: { ...card, damage: finalDamage },
    attacker: currentTurn,
    attackerHero: attacker,
    defender: opponent,
    defenderHero: targetHero,
    isFeint,
    ignoresBlock: false,
    ignoreShield: false,
    skillTriggered: null,
    skillName: null,
    skillIcon: null
  };

  // Apply skill effects if triggered
  if (triggeredSkill) {
    pendingAttackObj = applySkillToAttack(triggeredSkill, pendingAttackObj, heroes, currentTurn, addLog);
    // Show skill indicator
    setTriggeredSkill(triggeredSkill);
    setSkillIndicatorVisible(true);
    // Hide indicator after 2 seconds
    setTimeout(() => {
      setSkillIndicatorVisible(false);
    }, 2000);
  }

  setPendingAttack(pendingAttackObj);

  setWaitingForReaction(true);
  setSelectingTarget(false);
  setPendingAttackCard(null);

  const icon = card.attackType === 'magic' ? '🔮' : '⚔️';
  addLog(`${attacker.name} attacks ${targetHero.name} with ${card.name} ${icon} (${finalDamage} dmg)${isFeint ? ' [UNAVOIDABLE]' : ''}!`);
  setHeroAttackCounts(prev => ({
    ...prev,
    [attacker.id]: (prev[attacker.id] || 0) + 1
  }));
};

/**
 * Draw one card and enter discard mode
 */
export const drawOneAndDiscardController = (
  currentTurn,
  activeHeroIndex,
  heroes,
  player1Hand,
  setPlayer1Hand,
  player2Hand,
  setPlayer2Hand,
  setDrawnCard,
  setDrawUsedThisTurn,
  setWaitingForDiscard,
  drawUsedThisTurn,
  addLog
) => {
  if (drawUsedThisTurn) return;
  
  const teamHeroes = heroes[currentTurn];
  const activeHeroes = teamHeroes.filter(h => !h.defeated);
  const newCard = generateCard(activeHeroes);
  
  setDrawnCard(newCard);
  setDrawUsedThisTurn(true);
  
  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => [...prev, newCard]);
  } else {
    setPlayer2Hand(prev => [...prev, newCard]);
  }
  
  setWaitingForDiscard(true);
  addLog(`${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} draws 1 card. Select to discard.`);
};

/**
 * Discard a card (after drawing)
 */
export const discardCardController = (
  card,
  currentTurn,
  player1Hand,
  setPlayer1Hand,
  player2Hand,
  setPlayer2Hand,
  setDrawnCard,
  setWaitingForDiscard,
  waitingForDiscard,
  addLog
) => {
  if (!waitingForDiscard) return;
  
  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
  } else {
    setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
  }
  
  addLog(`${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} discards ${card.name}.`);
  setDrawnCard(null);
  setWaitingForDiscard(false);
};
