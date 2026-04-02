// Card Generation Utility
import { CARD_TYPES } from '../models/cardTypes';

const SHARED_CARDS = [
  CARD_TYPES.FOCUS,
  CARD_TYPES.CHARGE,
  CARD_TYPES.READY,
  CARD_TYPES.FEINT,
  CARD_TYPES.BLOCK,
  CARD_TYPES.EVADE,
];

/**
 * Draw one random card from the combined pool of all active heroes.
 * Each hero contributes their own cardPool (defined in heroesModel.js).
 */
export const generateCard = (activeHeroes = []) => {
  const combinedPool = [...SHARED_CARDS, ...activeHeroes.flatMap(h => h.cardPool || [])];

  if (combinedPool.length === 0) {
    // Fallback if somehow no pools exist
    const fallback = [
      CARD_TYPES.FOCUS, CARD_TYPES.CHARGE, CARD_TYPES.READY, CARD_TYPES.FEINT,
      CARD_TYPES.BLOCK, CARD_TYPES.EVADE,
    ];
    return { ...fallback[Math.floor(Math.random() * fallback.length)], id: Date.now() + Math.random() };
  }

  const picked = combinedPool[Math.floor(Math.random() * combinedPool.length)];
  return { ...picked, id: Date.now() + Math.random() };
};

export const drawCardsToFive = (currentHand, playerName, heroes, addLog) => {
  const cardsToDraw = 5 - currentHand.length;
  if (cardsToDraw <= 0) return currentHand;

  const activeHeroes = heroes[playerName].filter(h => !h.defeated);

  const newCards = Array.from({ length: cardsToDraw }, () => generateCard(activeHeroes));
  addLog(`${playerName} draws ${cardsToDraw} card${cardsToDraw > 1 ? 's' : ''}.`);
  return [...currentHand, ...newCards];
};
