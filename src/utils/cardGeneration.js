// Card Generation Utility
import { CARD_TYPES } from '../models/cardTypes';

export const generateCard = (forHeroes = null) => {
  // Default pool - universal cards all heroes can draw
  const universalCards = [
    CARD_TYPES.FOCUS,
    CARD_TYPES.CHARGE, CARD_TYPES.READY, CARD_TYPES.FEINT,
    CARD_TYPES.BLOCK, CARD_TYPES.EVADE,
  ];

  let types = [...universalCards];

  if (!forHeroes || forHeroes.length === 0) {
    return { ...types[Math.floor(Math.random() * types.length)], id: Date.now() + Math.random() };
  }

  // Combine card pools from all active heroes
  forHeroes.forEach(hero => {
    let jobName = hero.job.name;

    if (jobName === 'Melee') {
      types.push(
        CARD_TYPES.NORMAL_ATTACK, CARD_TYPES.NORMAL_ATTACK,
        CARD_TYPES.HEAVY_ATTACK, CARD_TYPES.HEAVY_ATTACK, CARD_TYPES.COUNTER
      );
    } else if (jobName === 'Ranged') {
      types.push(
        CARD_TYPES.NORMAL_SHOT, CARD_TYPES.NORMAL_SHOT,
        CARD_TYPES.CHARGE_SHOT, CARD_TYPES.CHARGE_SHOT, CARD_TYPES.COUNTER
      );
    } else if (jobName === 'Mage') {
      types.push(
        CARD_TYPES.NORMAL_MAGIC, CARD_TYPES.NORMAL_MAGIC, 
        CARD_TYPES.HEAVY_MAGIC, CARD_TYPES.HEAVY_MAGIC,
        CARD_TYPES.FIRE_MAGIC, CARD_TYPES.ICE_MAGIC,
        CARD_TYPES.WIND_MAGIC, CARD_TYPES.EARTH_MAGIC,
        CARD_TYPES.IVY_MAGIC, CARD_TYPES.LIGHTNING_MAGIC,
        CARD_TYPES.DEFLECT
      );
    } else if (jobName === 'Support') {
      types.push(
        CARD_TYPES.NORMAL_MAGIC,
        CARD_TYPES.HEAVY_MAGIC,
        CARD_TYPES.CURE, CARD_TYPES.SHIELD, CARD_TYPES.HEAL,
        CARD_TYPES.DEFLECT
      );
    }
  });

  return { ...types[Math.floor(Math.random() * types.length)], id: Date.now() + Math.random() };
};

export const drawCardsToFive = (currentHand, playerName, heroes, addLog) => {
  const cardsToDraw = 5 - currentHand.length;
  if (cardsToDraw <= 0) return currentHand;
  
  const team = heroes[playerName];
  
  // Collect all active heroes from the team
  let activeHeroes = [];
  team.forEach(hero => {  
    if (!hero.defeated) {
      activeHeroes.push(hero);
    }
  });
  
  const newCards = Array.from({ length: cardsToDraw }, () => generateCard(activeHeroes));
  addLog(`${playerName} draws ${cardsToDraw} card${cardsToDraw > 1 ? 's' : ''}.`);
  return [...currentHand, ...newCards];
};
