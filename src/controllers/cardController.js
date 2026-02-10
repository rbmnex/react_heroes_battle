// Card and Drawing Controller
import { drawCardsToFive } from '../utils/cardGeneration';

export const handleDrawOneAndDiscard = (currentTurn, activeHeroIndex, heroes, player1Hand, setPlayer1Hand, player2Hand, setPlayer2Hand, setDrawnCard, setDrawUsedThisTurn, setWaitingForDiscard, addLog) => {
  if (drawUsedThisTurn) return;
  const hero = heroes[currentTurn][activeHeroIndex];
  const teamHeroes = heroes[currentTurn];
  let activeHeroes = [];
  teamHeroes.forEach(h => {  
    if (!h.defeated) {
      activeHeroes.push(h);
    }
  });
  const { generateCard } = require('../utils/cardGeneration');
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

export const handleDiscardCard = (card, currentTurn, player1Hand, setPlayer1Hand, player2Hand, setPlayer2Hand, setDrawnCard, setWaitingForDiscard, waitingForDiscard, addLog) => {
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

export const handleStartGame = (heroes, setHeroes, setPlayer1Hand, setPlayer2Hand, setGameStarted, addLog) => {
  const { createInitialHeroes } = require('../models/initialState');
  const initialHeroes = createInitialHeroes();
  const p1Cards = drawCardsToFive([], 'player1', initialHeroes, addLog);
  const p2Cards = drawCardsToFive([], 'player2', initialHeroes, addLog);
  setHeroes(initialHeroes);
  setPlayer1Hand(p1Cards);
  setPlayer2Hand(p2Cards);
  setGameStarted(true);
  addLog('Game started! 3v3 Battle begins!');
  addLog('--- Player 1\'s turn ---');
};
