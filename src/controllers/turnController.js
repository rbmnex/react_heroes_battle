// Turn Management Controller
import { drawCardsToFive } from '../utils/cardGeneration';
import { processStatusEffects } from '../utils/gameLogic';

export const handleConfirmEndTurn = (currentTurn, heroes, setHeroes, player1Hand, setPlayer1Hand, player2Hand, setPlayer2Hand, setCurrentTurn, setActiveHeroIndex, setDrawUsedThisTurn, setAttacksUsedThisTurn, setActiveBuff, setRemainingAttacks, setWaitingForNextAttack, setTurnCount, setHeroAttackCounts, setHeroSupportCounts, setIsFirstAttackOfHero, checkVictory, addLog, STATUS_EFFECTS) => {
  // Process status effects before turn ends
  const updatedHeroes = processStatusEffects(currentTurn, heroes, setHeroes, addLog, STATUS_EFFECTS);
  
  // Check if anyone died from status effects
  if (checkVictory(updatedHeroes)) return;

  const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
  
  // Find first non-defeated hero for the next player
  const nextTeam = updatedHeroes[nextPlayer];
  let nextHeroIndex = nextTeam.findIndex(h => !h.defeated);
  if (nextHeroIndex === -1) {
    nextHeroIndex = 0; // All defeated (fallback, game should end)
  }
  
  setCurrentTurn(nextPlayer);
  setActiveHeroIndex(nextHeroIndex);
  setDrawUsedThisTurn(false);
  setAttacksUsedThisTurn(0);
  setActiveBuff(null);
  setRemainingAttacks(0);
  setWaitingForNextAttack(false);
  setTurnCount(prev => prev + 1);
  setHeroAttackCounts({});
  setHeroSupportCounts({});
  setIsFirstAttackOfHero(false);

  if (nextPlayer === 'player1') {
    setPlayer1Hand(drawCardsToFive(player1Hand, 'player1', updatedHeroes, addLog));
  } else {
    setPlayer2Hand(drawCardsToFive(player2Hand, 'player2', updatedHeroes, addLog));
  }

  addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
};

export const handleSkipBlock = (currentTurn, heroes, setHeroes, pendingAttack, activeBuff, remainingAttacks, setActiveBuff, setRemainingAttacks, setWaitingForReaction, setPendingAttack, setWaitingForNextAttack, setSelectingTarget, setPendingAttackCard, addLog, checkVictory) => {
  if (!pendingAttack) return;

  const { card, attacker, attackerHero, defender, defenderHero } = pendingAttack;
  let defenderDamage = card.damage;

  if (activeBuff && activeBuff.buffType === 'feint') {
    // Feint always goes through
  } else {
    // No defense, full damage
  }

  // Apply damage
  const newHeroes = {
    player1: heroes.player1.map(h => {
      if (h.id === defenderHero.id && defender === 'player1') {
        const newHp = Math.max(0, h.hp - defenderDamage);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      return h;
    }),
    player2: heroes.player2.map(h => {
      if (h.id === defenderHero.id && defender === 'player2') {
        const newHp = Math.max(0, h.hp - defenderDamage);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      return h;
    })
  };

  setHeroes(newHeroes);
  addLog(`💥 Full damage!`);
  
  const updatedDefender = newHeroes[defender].find(h => h.id === defenderHero.id);
  addLog(`❤️ ${defenderHero.name}: ${defenderDamage} dmg (HP: ${updatedDefender.hp}/${updatedDefender.maxHp})${updatedDefender.defeated ? ' ☠️ DEFEATED!' : ''}`);

  setWaitingForReaction(false);
  setPendingAttack(null);

  if (checkVictory(newHeroes)) return;

  if (activeBuff && remainingAttacks > 1) {
    setRemainingAttacks(prev => prev - 1);
    setWaitingForNextAttack(true);
    setSelectingTarget(false);
    setPendingAttackCard(null);
    addLog(`🔥 ${remainingAttacks - 1} attacks left!`);
  } else {
    setActiveBuff(null);
    setRemainingAttacks(0);
    setWaitingForNextAttack(false);
    setSelectingTarget(false);
    setPendingAttackCard(null);
  }
};
