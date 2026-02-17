// Game Logic Utilities
import { STATUS_EFFECTS } from '../models/statusEffects';

export const canHeroAct = (hero) => {
  return !hero.statusEffects.some(e => e.skipTurn);
};

export const canHeroUseCard = (hero, card) => {
  // Support cards only usable by Support heroes
  if (card.type === 'support') {
    return hero.job.name === 'Support';
  }
  
  if (card.type === 'buff') {
    // Elemental magic buffs only usable by Mage heroes
    if (card.buffType === 'elementalMagic') {
      return hero.job.name === 'Mage';
    } else {
      return true; // Other buffs can be used by any hero with an attack card
    }
  }

  if (card.type !== 'attack') return true;
  if (hero.hp <= 0) return false;
  if (!canHeroAct(hero)) return false;
  
  const jobName = hero.job.name;
  if (jobName === 'Melee' && card.attackType === 'physical') return true;
  if (jobName === 'Ranged' && card.attackType === 'ranged') return true;
  if (jobName === 'Mage' && card.attackType === 'magic') return true;
  if (jobName === 'Support' && card.attackType === 'magic') return true;
  return false;
};

export const checkVictory = (heroes, addLog, setGameOver, setWinner) => {
  const p1Alive = heroes.player1.filter(h => !h.defeated).length;
  const p2Alive = heroes.player2.filter(h => !h.defeated).length;

  if (p1Alive === 0) {
    setGameOver(true);
    setWinner('player2');
    addLog('🎉 Player 2 wins! All P1 heroes defeated!');
    return true;
  }
  if (p2Alive === 0) {
    setGameOver(true);
    setWinner('player1');
    addLog('🎉 Player 1 wins! All P2 heroes defeated!');
    return true;
  }
  return false;
};

export const applyStatusEffect = (heroId, player, statusType, heroes, setHeroes, addLog, STATUS_EFFECTS) => {
  if (!STATUS_EFFECTS[statusType]) return;
  
  const statusEffect = {
    ...STATUS_EFFECTS[statusType],
    type: statusType,
    turnsRemaining: STATUS_EFFECTS[statusType].duration
  };

  // Get hero name before state update
  const hero = heroes[player].find(h => h.id === heroId);
  
  setHeroes(prev => ({
    ...prev,
    [player]: prev[player].map(h => 
      h.id === heroId ? {
        ...h,
        statusEffects: [...h.statusEffects.filter(e => e.type !== statusType), statusEffect]
      } : h
    )
  }));

  if (hero) {
    addLog(`${STATUS_EFFECTS[statusType].icon} ${hero.name} is ${statusType}!`);
  }
};

export const processStatusEffects = (player, heroes, setHeroes, addLog, STATUS_EFFECTS) => {
  const team = heroes[player];
  let newHeroes = { ...heroes };

  team.forEach(hero => {
    if (hero.defeated || hero.statusEffects.length === 0) return;

    hero.statusEffects.forEach(effect => {
      // Damage over time effects (Burn, Poison)
      if (effect.damagePerTurn) {
        const newHp = Math.max(0, hero.hp - effect.damagePerTurn);
        newHeroes[player] = newHeroes[player].map(h =>
          h.id === hero.id ? { ...h, hp: newHp, defeated: newHp === 0 } : h
        );
        addLog(`${effect.icon} ${hero.name} takes ${effect.damagePerTurn} ${effect.name} damage! (HP: ${newHp})`);
      }
    });

    // Reduce duration
    newHeroes[player] = newHeroes[player].map(h =>
      h.id === hero.id ? {
        ...h,
        statusEffects: h.statusEffects
          .map(e => ({ ...e, turnsRemaining: e.turnsRemaining - 1 }))
          .filter(e => e.turnsRemaining > 0)
      } : h
    );
  });

  setHeroes(newHeroes);
  return newHeroes;
};

export const cleanseHero = (heroId, player, heroes, setHeroes, addLog) => {
  setHeroes(prev => ({
    ...prev,
    [player]: prev[player].map(h =>
      h.id === heroId ? { ...h, statusEffects: [] } : h
    )
  }));
  const hero = heroes[player].find(h => h.id === heroId);
  addLog(`✨ ${hero.name} cleansed of all status effects!`);
};

export const healHero = (heroId, player, amount, heroes, setHeroes, addLog) => {
  setHeroes(prev => ({
    ...prev,
    [player]: prev[player].map(h =>
      h.id === heroId ? { 
        ...h, 
        hp: Math.min(h.maxHp, h.hp + amount) 
      } : h
    )
  }));
  const hero = heroes[player].find(h => h.id === heroId);
  addLog(`💚 ${hero.name} healed ${amount} HP!`);
};

export const applyShield = (heroId, player, shieldAmount, heroes, setHeroes, addLog) => {
  setHeroes(prev => ({
    ...prev,
    [player]: prev[player].map(h =>
      h.id === heroId ? { 
        ...h, 
        shield: h.shield + shieldAmount 
      } : h
    )
  }));
  const hero = heroes[player].find(h => h.id === heroId);
  addLog(`🛡️ ${hero.name} gains ${shieldAmount} shield! (Total: ${hero.shield + shieldAmount})`);
};
