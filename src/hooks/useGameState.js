// Custom Hook for Game State Management
import { useState } from 'react';
import { createInitialGameState, createInitialHeroes } from '../models/initialState';

export const useGameState = () => {
  const initialState = createInitialGameState();
  
  const [heroes, setHeroes] = useState(initialState.heroes);
  const [currentTurn, setCurrentTurn] = useState(initialState.currentTurn);
  const [activeHeroIndex, setActiveHeroIndex] = useState(initialState.activeHeroIndex);
  const [player1Hand, setPlayer1Hand] = useState(initialState.player1Hand);
  const [player2Hand, setPlayer2Hand] = useState(initialState.player2Hand);
  const [gameLog, setGameLog] = useState(initialState.gameLog);
  const [gameOver, setGameOver] = useState(initialState.gameOver);
  const [winner, setWinner] = useState(initialState.winner);
  const [waitingForReaction, setWaitingForReaction] = useState(initialState.waitingForReaction);
  const [pendingAttack, setPendingAttack] = useState(initialState.pendingAttack);
  const [gameStarted, setGameStarted] = useState(initialState.gameStarted);
  const [drawnCard, setDrawnCard] = useState(initialState.drawnCard);
  const [waitingForDiscard, setWaitingForDiscard] = useState(initialState.waitingForDiscard);
  const [drawUsedThisTurn, setDrawUsedThisTurn] = useState(initialState.drawUsedThisTurn);
  const [activeBuff, setActiveBuff] = useState(initialState.activeBuff);
  const [remainingAttacks, setRemainingAttacks] = useState(initialState.remainingAttacks);
  const [waitingForNextAttack, setWaitingForNextAttack] = useState(initialState.waitingForNextAttack);
  const [attacksUsedThisTurn, setAttacksUsedThisTurn] = useState(initialState.attacksUsedThisTurn);
  const [selectingTarget, setSelectingTarget] = useState(initialState.selectingTarget);
  const [pendingAttackCard, setPendingAttackCard] = useState(initialState.pendingAttackCard);
  const [pendingSupportCard, setPendingSupportCard] = useState(initialState.pendingSupportCard);
  const [selectingSupportTarget, setSelectingSupportTarget] = useState(initialState.selectingSupportTarget);
  const [turnCount, setTurnCount] = useState(initialState.turnCount);
  const [heroAttackCounts, setHeroAttackCounts] = useState(initialState.heroAttackCounts);
  const [heroSupportCounts, setHeroSupportCounts] = useState(initialState.heroSupportCounts);
  const [isFirstAttackOfHero, setIsFirstAttackOfHero] = useState(initialState.isFirstAttackOfHero);
  const [triggeredSkill, setTriggeredSkill] = useState(initialState.triggeredSkill);
  const [skillIndicatorVisible, setSkillIndicatorVisible] = useState(initialState.skillIndicatorVisible);

  const addLog = (message) => setGameLog(prev => [...prev, message]);

  const resetGame = () => {
    const newInitialState = createInitialGameState();
    setHeroes(newInitialState.heroes);
    setCurrentTurn(newInitialState.currentTurn);
    setActiveHeroIndex(newInitialState.activeHeroIndex);
    setPlayer1Hand(newInitialState.player1Hand);
    setPlayer2Hand(newInitialState.player2Hand);
    setGameLog(newInitialState.gameLog);
    setGameOver(newInitialState.gameOver);
    setWinner(newInitialState.winner);
    setWaitingForReaction(newInitialState.waitingForReaction);
    setPendingAttack(newInitialState.pendingAttack);
    setGameStarted(newInitialState.gameStarted);
    setDrawnCard(newInitialState.drawnCard);
    setWaitingForDiscard(newInitialState.waitingForDiscard);
    setDrawUsedThisTurn(newInitialState.drawUsedThisTurn);
    setActiveBuff(newInitialState.activeBuff);
    setRemainingAttacks(newInitialState.remainingAttacks);
    setWaitingForNextAttack(newInitialState.waitingForNextAttack);
    setAttacksUsedThisTurn(newInitialState.attacksUsedThisTurn);
    setSelectingTarget(newInitialState.selectingTarget);
    setPendingAttackCard(newInitialState.pendingAttackCard);
    setPendingSupportCard(newInitialState.pendingSupportCard);
    setSelectingSupportTarget(newInitialState.selectingSupportTarget);
    setTurnCount(newInitialState.turnCount);
    setHeroAttackCounts(newInitialState.heroAttackCounts);
    setHeroSupportCounts(newInitialState.heroSupportCounts);
    setIsFirstAttackOfHero(newInitialState.isFirstAttackOfHero);
    setTriggeredSkill(newInitialState.triggeredSkill);
    setSkillIndicatorVisible(newInitialState.skillIndicatorVisible);
  };

  const getActiveHero = () => {
    const team = currentTurn === 'player1' ? heroes.player1 : heroes.player2;
    return team[activeHeroIndex];
  };

  const getCurrentPlayerHand = () => currentTurn === 'player1' ? player1Hand : player2Hand;

  return {
    // State
    heroes, setHeroes,
    currentTurn, setCurrentTurn,
    activeHeroIndex, setActiveHeroIndex,
    player1Hand, setPlayer1Hand,
    player2Hand, setPlayer2Hand,
    gameLog, setGameLog,
    gameOver, setGameOver,
    winner, setWinner,
    waitingForReaction, setWaitingForReaction,
    pendingAttack, setPendingAttack,
    gameStarted, setGameStarted,
    drawnCard, setDrawnCard,
    waitingForDiscard, setWaitingForDiscard,
    drawUsedThisTurn, setDrawUsedThisTurn,
    activeBuff, setActiveBuff,
    remainingAttacks, setRemainingAttacks,
    waitingForNextAttack, setWaitingForNextAttack,
    attacksUsedThisTurn, setAttacksUsedThisTurn,
    selectingTarget, setSelectingTarget,
    pendingAttackCard, setPendingAttackCard,
    pendingSupportCard, setPendingSupportCard,
    selectingSupportTarget, setSelectingSupportTarget,
    turnCount, setTurnCount,
    heroAttackCounts, setHeroAttackCounts,
    heroSupportCounts, setHeroSupportCounts,
    isFirstAttackOfHero, setIsFirstAttackOfHero,
    triggeredSkill, setTriggeredSkill,
    skillIndicatorVisible, setSkillIndicatorVisible,
    // Actions
    addLog,
    resetGame,
    getActiveHero,
    getCurrentPlayerHand
  };
};
