// Turn Management Controller
import { drawCardsToFive } from '../utils/cardGeneration';
import { processStatusEffects, checkVictory } from '../utils/gameLogic';
import { STATUS_EFFECTS } from '../models/statusEffects';

/**
 * End current turn - process status effects, switch player, draw cards, reset counters
 */
export const confirmEndTurnController = (
  currentTurn,
  heroes,
  setHeroes,
  player1Hand,
  setPlayer1Hand,
  player2Hand,
  setPlayer2Hand,
  setCurrentTurn,
  setActiveHeroIndex,
  setDrawUsedThisTurn,
  setActiveBuff,
  setRemainingAttacks,
  setWaitingForNextAttack,
  setTurnCount,
  setHeroAttackCounts,
  setHeroSupportCounts,
  setIsFirstAttackOfHero,
  setGameOver,
  setWinner,
  addLog
) => {
  // Process status effects (DOT damage, durations, etc.)
  const updatedHeroes = processStatusEffects(currentTurn, heroes, setHeroes, addLog, STATUS_EFFECTS);
  
  // Check if anyone died from status effects
  if (checkVictory(updatedHeroes, addLog, setGameOver, setWinner)) return;

  // Switch to next player
  const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
  
  // Find first non-defeated hero for the next player
  const nextTeam = updatedHeroes[nextPlayer];
  let nextHeroIndex = nextTeam.findIndex(h => !h.defeated);
  if (nextHeroIndex === -1) nextHeroIndex = 0;
  
  // Reset turn state
  setCurrentTurn(nextPlayer);
  setActiveHeroIndex(nextHeroIndex);
  setDrawUsedThisTurn(false);
  setActiveBuff(null);
  setRemainingAttacks(0);
  setWaitingForNextAttack(false);
  setTurnCount(prev => prev + 1);
  setHeroAttackCounts({});
  setHeroSupportCounts({});
  setIsFirstAttackOfHero(false);

  // Refill next player's hand
  if (nextPlayer === 'player1') {
    setPlayer1Hand(drawCardsToFive(player1Hand, 'player1', updatedHeroes, addLog));
  } else {
    setPlayer2Hand(drawCardsToFive(player2Hand, 'player2', updatedHeroes, addLog));
  }

  addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
};
