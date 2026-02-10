// Support Card Controller
import { applyShield, healHero, cleanseHero } from '../utils/gameLogic';

export const handlePlayCard = (card, currentTurn, waitingForDiscard, waitingForReaction, pendingAttack, gameOver, setSelectingSupportTarget, setPendingSupportCard, activeBuff, setSelectingTarget, setPendingAttackCard, setIsFirstAttackOfHero, playBuff, playAttack, discardCard, addLog) => {
  if (gameOver) return;

  if (waitingForDiscard) {
    discardCard(card);
    return;
  }

  if (waitingForReaction) {
    const defender = pendingAttack.defender;
    const actingPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
    if (actingPlayer !== defender) return;
    if (card.type !== 'defense') {
      addLog('⚠️ Only defense cards during reactions!');
      return;
    }
    // This will be handled by the parent component
    return;
  }

  // Support cards target a teammate
  if (card.type === 'support') {
    const maxSupportUses = activeBuff && activeBuff.buffType === 'ready' ? 2 : 1;
    
    // Enter target selection mode to choose a teammate
    setPendingSupportCard(card);
    setSelectingSupportTarget(true);
    addLog(`Select a teammate to use ${card.name} on...`);
    return;
  }

  if (card.type === 'buff') {
    if (activeBuff) {
      addLog('⚠️ Buff already active!');
      return;
    }
    playBuff(card);
  } else if (card.type === 'attack') {
    playAttack(card);
  } else {
    addLog('⚠️ Defense cards only as reactions!');
  }
};

export const handleSelectTarget = (heroId, selectingSupportTarget, pendingSupportCard, selectingTarget, pendingAttackCard, currentTurn, heroes, setSelectingSupportTarget, setPendingSupportCard, setHeroSupportCounts, setPlayer1Hand, setPlayer2Hand, getActiveHero, playAttack, addLog) => {
  // Handle support card targeting
  if (selectingSupportTarget && pendingSupportCard) {
    const supportCard = pendingSupportCard;
    const team = heroes[currentTurn];
    const targetHero = team.find(h => h.id === heroId);
    const casterHero = getActiveHero();
    
    if (!targetHero || targetHero.defeated) {
      addLog(`⚠️ Invalid target!`);
      return;
    }
    
    if (supportCard.effect === 'heal') {
      healHero(targetHero.id, currentTurn, supportCard.heal, heroes, () => {}, addLog);
      addLog(`💚 ${supportCard.name} used on ${targetHero.name}!`);
    } else if (supportCard.effect === 'cleanse') {
      cleanseHero(targetHero.id, currentTurn, heroes, () => {}, addLog);
      addLog(`✨ ${supportCard.name} used on ${targetHero.name}!`);
    } else if (supportCard.effect === 'shield') {
      applyShield(targetHero.id, currentTurn, supportCard.shieldValue, heroes, () => {}, addLog);
      addLog(`🛡️ ${supportCard.name} used on ${targetHero.name}!`);
    }
    
    // Remove card from hand
    if (currentTurn === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== supportCard.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== supportCard.id));
    }
    
    // Increment support card counter
    setHeroSupportCounts(prev => ({
      ...prev,
      [casterHero.id]: (prev[casterHero.id] || 0) + 1
    }));
    
    setSelectingSupportTarget(false);
    setPendingSupportCard(null);
    return;
  }
  
  // Handle attack card targeting
  if (!selectingTarget || !pendingAttackCard) return;
  playAttack(pendingAttackCard, heroId);
};
