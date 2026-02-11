// Attack and Combat Controller
import { STATUS_EFFECTS } from '../models/statusEffects';

export const handlePlayBuff = (card, currentTurn, activeHeroIndex, heroes, player1Hand, setPlayer1Hand, player2Hand, setPlayer2Hand, setActiveBuff, setRemainingAttacks, activeBuff, addLog) => {
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

  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
  } else {
    setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
  }

  setActiveBuff(card);
  const totalAttacks = 1 + card.extraAttacks;
  setRemainingAttacks(totalAttacks);
  
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

export const handlePlayAttack = (card, targetHeroId, currentTurn, activeHeroIndex, heroes, player1Hand, setPlayer1Hand, player2Hand, setPlayer2Hand, activeBuff, heroAttackCounts, setPendingAttackCard, setSelectingTarget, setPendingAttack, setWaitingForReaction, setIsFirstAttackOfHero, setHeroAttackCounts, addLog) => {
  const attacker = heroes[currentTurn][activeHeroIndex];
  
  // Check if this hero can use this attack card
  const canUseAttack = (hero, attackCard) => {
    const jobName = hero.job.name;
    if (jobName === 'Melee' && attackCard.attackType === 'physical') return true;
    if (jobName === 'Ranged' && attackCard.attackType === 'ranged') return true;
    if (jobName === 'Mage' && (attackCard.attackType === 'magic' || attackCard.buffType === 'elementalMagic')) return true;
    if (jobName === 'Support' && (attackCard.attackType === 'magic' || attackCard.type === 'support')) return true;
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
    // Only allow target selection if hero hasn't exceeded max attacks
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

  if (currentTurn === 'player1') {
    setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
  } else {
    setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
  }

  let finalDamage = card.damage;
  let isFeint = false;

  if (activeBuff) {
    finalDamage += activeBuff.damageModifier;
    if (activeBuff.buffType === 'feint') {
      isFeint = true;
    }
  }

  setPendingAttack({
    card: { ...card, damage: finalDamage },
    attacker: currentTurn,
    attackerHero: attacker,
    defender: opponent,
    defenderHero: targetHero,
    isFeint
  });

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
