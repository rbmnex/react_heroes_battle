import { useState } from 'react';

// Status Effects
const STATUS_EFFECTS = {
  BURN: { name: 'Burn', icon: '🔥', damagePerTurn: 2, duration: 3 },
  FREEZE: { name: 'Freeze', icon: '❄️', skipTurn: true, duration: 2 },
  BLEED: { name: 'Bleed', icon: '🩸', damageOnAction: 2, duration: 2 },
  STUN: { name: 'Stun', icon: '💫', skipTurn: true, duration: 1 },
  POISON: { name: 'Poison', icon: '☠️', damagePerTurn: 2, duration: 4 },
  PARALYZE: { name: 'Paralyze', icon: '⚡', preventSkills: true, duration: 2 }
};

// Card data
const CARD_TYPES = {
  NORMAL_ATTACK: { name: 'Normal Attack', damage: 3, type: 'attack', attackType: 'physical' },
  HEAVY_ATTACK: { name: 'Heavy Attack', damage: 6, type: 'attack', attackType: 'physical' },
  NORMAL_SHOT: { name: 'Normal Shot', damage: 3, type: 'attack', attackType: 'ranged' },
  CHARGE_SHOT: { name: 'Charge Shot', damage: 6, type: 'attack', attackType: 'ranged' },
  NORMAL_MAGIC: { name: 'Normal Magic', damage: 3, type: 'attack', attackType: 'magic' },
  HEAVY_MAGIC: { name: 'Heavy Magic', damage: 6, type: 'attack', attackType: 'magic' },
  FOCUS: { name: 'Focus', type: 'buff', buffType: 'focus', damageModifier: 1, extraAttacks: 0 },
  CHARGE: { name: 'Charge', type: 'buff', buffType: 'charge', damageModifier: 2, extraAttacks: 0, risk: 'stun' },
  READY: { name: 'Ready', type: 'buff', buffType: 'ready', damageModifier: 0, extraAttacks: 1 },
  FEINT: { name: 'Feint', type: 'buff', buffType: 'feint', damageModifier: -1, unavoidable: true },
  BLOCK: { name: 'Block', defense: 4, type: 'defense', defenseType: 'block' },
  EVADE: { name: 'Evade', defense: 999, type: 'defense', defenseType: 'evade' },
  COUNTER: { name: 'Counter', defense: 0, type: 'defense', defenseType: 'counter', counterType: 'physical' },
  DEFLECT: { name: 'Deflect', defense: 0, type: 'defense', defenseType: 'deflect', counterType: 'magic' },
  // Elemental magic buffs - combo with magic attacks:
  FIRE_MAGIC: { name: 'Fire Magic', type: 'buff', buffType: 'elementalMagic', element: 'fire', statusEffect: 'BURN', damageModifier: 1, extraAttacks: 0 },
  ICE_MAGIC: { name: 'Ice Magic', type: 'buff', buffType: 'elementalMagic', element: 'ice', statusEffect: 'FREEZE', damageModifier: 1, extraAttacks: 0 },
  WIND_MAGIC: { name: 'Wind Magic', type: 'buff', buffType: 'elementalMagic', element: 'wind', statusEffect: 'BLEED', damageModifier: 1, extraAttacks: 0 },
  EARTH_MAGIC: { name: 'Earth Magic', type: 'buff', buffType: 'elementalMagic', element: 'earth', statusEffect: 'STUN', damageModifier: 1, extraAttacks: 0 },
  IVY_MAGIC: { name: 'Ivy Magic', type: 'buff', buffType: 'elementalMagic', element: 'ivy', statusEffect: 'POISON', damageModifier: 1, extraAttacks: 0 },
  LIGHTNING_MAGIC: { name: 'Lightning Magic', type: 'buff', buffType: 'elementalMagic', element: 'lightning', statusEffect: 'PARALYZE', damageModifier: 1, extraAttacks: 0 },
  // support cards
  CURE: { name: 'Cure', type: 'support', effect: 'cleanse' },
  HEAL: { name: 'Heal', heal :8, type:'support' , effect:'heal'},
  SHIELD: { name: 'Shield', shieldValue: 10, type: 'support', effect: 'shield' },
};

// Job Classes
const JOB_CLASSES = {
  MELEE: { name: 'Melee', icon: '⚔️', hp: 60, description: 'High HP, physical attacks' },
  RANGED: { name: 'Ranged', icon: '🏹', hp: 45, description: 'Precision attacks, multi-target' },
  MAGE: { name: 'Mage', icon: '🔮', hp: 40, description: 'Magic attacks, AoE damage' },
  SUPPORT: { name: 'Support', icon: '💚', hp: 50, description: 'Healing, buffs, cleanse' }
};

// Initial 3v3 hero setup
const createInitialHeroes = () => ({
  player1: [
    { id: 1, name: 'Swordman', job: JOB_CLASSES.MELEE, hp: 60, maxHp: 60, defeated: false, statusEffects: [], shield: 0 },
    { id: 2, name: 'Archer', job: JOB_CLASSES.RANGED, hp: 45, maxHp: 45, defeated: false, statusEffects: [], shield: 0 },
    { id: 3, name: 'Wizard', job: JOB_CLASSES.MAGE, hp: 40, maxHp: 40, defeated: false, statusEffects: [], shield: 0 }
  ],
  player2: [
    { id: 4, name: 'Warrior', job: JOB_CLASSES.MELEE, hp: 60, maxHp: 60, defeated: false, statusEffects: [], shield: 0 },
    { id: 5, name: 'Sorceress', job: JOB_CLASSES.MAGE, hp: 40, maxHp: 40, defeated: false, statusEffects: [], shield: 0 },
    { id: 6, name: 'Cleric', job: JOB_CLASSES.SUPPORT, hp: 40, maxHp: 40, defeated: false, statusEffects: [], shield: 0 }
  ]
});

function App() {
  const [heroes, setHeroes] = useState(createInitialHeroes());
  const [currentTurn, setCurrentTurn] = useState('player1');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0); // Which hero is acting
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);
  const [gameLog, setGameLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [waitingForReaction, setWaitingForReaction] = useState(false);
  const [pendingAttack, setPendingAttack] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [drawnCard, setDrawnCard] = useState(null);
  const [waitingForDiscard, setWaitingForDiscard] = useState(false);
  const [drawUsedThisTurn, setDrawUsedThisTurn] = useState(false);
  const [activeBuff, setActiveBuff] = useState(null);
  const [remainingAttacks, setRemainingAttacks] = useState(0);
  const [waitingForNextAttack, setWaitingForNextAttack] = useState(false);
  const [attacksUsedThisTurn, setAttacksUsedThisTurn] = useState(0);
  const [selectingTarget, setSelectingTarget] = useState(false);
  const [pendingAttackCard, setPendingAttackCard] = useState(null);
  const [pendingSupportCard, setPendingSupportCard] = useState(null);
  const [selectingSupportTarget, setSelectingSupportTarget] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [heroAttackCounts, setHeroAttackCounts] = useState({});
  const [heroSupportCounts, setHeroSupportCounts] = useState({});
  const [isFirstAttackOfHero, setIsFirstAttackOfHero] = useState(false);
  const [statusEffectLog, setStatusEffectLog] = useState([]);

  // Generate card pool based on active hero job type
  const generateCard = (forHeroes = null) => {
    // Default pool - universal cards all heroes can draw
    const universalCards = [
      CARD_TYPES.FOCUS, CARD_TYPES.FOCUS,
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
          CARD_TYPES.CURE, CARD_TYPES.SHIELD, CARD_TYPES.HEAL, CARD_TYPES.HEAL,
          CARD_TYPES.DEFLECT
        );
      }
    });

    return { ...types[Math.floor(Math.random() * types.length)], id: Date.now() + Math.random() };
  };

  // Pass hero to generateCard - find first non-defeated hero for card drawing
  const drawCardsToFive = (currentHand, playerName, heroesData = null) => {
    const cardsToDraw = 5 - currentHand.length;
    if (cardsToDraw <= 0) return currentHand;
    
    // Use provided heroesData or fall back to current heroes state
    const team = heroesData ? heroesData[playerName] : heroes[playerName];
    
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

  const drawOneAndDiscard = () => {
    if (drawUsedThisTurn) return;
    const hero = heroes[currentTurn][activeHeroIndex];
    const teamHeroes = heroes[currentTurn];
    let activeHeroes = [];
    teamHeroes.forEach(h => {  
      if (!h.defeated) {
        activeHeroes.push(h);
      }
    });
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

  const discardCard = (card) => {
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

  const startGame = () => {
    // Use first non-defeated hero for each player for initial hand
    const initialHeroes = createInitialHeroes();
    const p1Cards = drawCardsToFive([], 'player1', initialHeroes);
    const p2Cards = drawCardsToFive([], 'player2', initialHeroes);
    setHeroes(initialHeroes);
    setPlayer1Hand(p1Cards);
    setPlayer2Hand(p2Cards);
    setGameStarted(true);
    addLog('Game started! 3v3 Battle begins!');
    addLog('--- Player 1\'s turn ---');
  };

  const addLog = (message) => setGameLog(prev => [...prev, message]);

  // Apply status effect to a hero
const applyStatusEffect = (heroId, player, statusType) => {
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

// Process status effects at turn end
const processStatusEffects = (player) => {
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

// Check if hero can act (not frozen/stunned)
const canHeroAct = (hero) => {
  return !hero.statusEffects.some(e => e.skipTurn);
};

// Cleanse status effects
const cleanseHero = (heroId, player) => {
  setHeroes(prev => ({
    ...prev,
    [player]: prev[player].map(h =>
      h.id === heroId ? { ...h, statusEffects: [] } : h
    )
  }));
  const hero = heroes[player].find(h => h.id === heroId);
  addLog(`✨ ${hero.name} cleansed of all status effects!`);
};

// Heal hero
const healHero = (heroId, player, amount) => {
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

// Apply shield to hero
const applyShield = (heroId, player, shieldAmount) => {
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

  const checkVictory = (newHeroes) => {
    const p1Alive = newHeroes.player1.filter(h => !h.defeated).length;
    const p2Alive = newHeroes.player2.filter(h => !h.defeated).length;

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

  const getActiveHero = () => {
    const team = currentTurn === 'player1' ? heroes.player1 : heroes.player2;
    return team[activeHeroIndex];
  };

  const playBuff = (card) => {
    const currentHand = currentTurn === 'player1' ? player1Hand : player2Hand;
    const attackCards = currentHand.filter(c => c.type === 'attack');
    const magicCards = attackCards.filter(c => c.attackType === 'magic');
    const hero = getActiveHero();

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

  const playAttack = (card, targetHeroId = null) => {
    const attacker = getActiveHero();
    
    // Check if this hero can use this attack card
    const canUseAttack = (hero, attackCard) => {
      const jobName = hero.job.name;
      if (jobName === 'Melee' && (attackCard.name === 'Normal Attack' || attackCard.name === 'Heavy Attack')) return true;
      if (jobName === 'Ranged' && (attackCard.name === 'Normal Shot' || attackCard.name === 'Charge Shot')) return true;
      if (jobName === 'Mage' && (
        attackCard.name === 'Normal Magic' || 
        attackCard.name === 'Heavy Magic'
      )) return true;
      if (jobName === 'Support' && (attackCard.name === 'Normal Magic' || attackCard.name === 'Heavy Magic')) return true;
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
      
      const isFirst = heroAttackCount === 0;
      setPendingAttackCard(card);
      setSelectingTarget(true);
      setIsFirstAttackOfHero(true); // Allow target selection since we passed the check
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
    setWaitingForNextAttack(false);

    const icon = card.attackType === 'magic' ? '🔮' : '⚔️';
    addLog(`${attacker.name} attacks ${targetHero.name} with ${card.name} ${icon} (${finalDamage} dmg)${isFeint ? ' [UNAVOIDABLE]' : ''}!`);
    setHeroAttackCounts(prev => ({
      ...prev,
      [attacker.id]: (prev[attacker.id] || 0) + 1
    }));
  };

  const resolveAttack = (defenseCard = null) => {
    if (!pendingAttack) return;

    const { card, attacker, attackerHero, defender, defenderHero, isFeint } = pendingAttack;
    let defenderDamage = card.damage;
    let attackerDamage = 0;
    let attackEvaded = false;

    if (defenseCard) {
      if (defender === 'player1') {
        setPlayer1Hand(prev => prev.filter(c => c.id !== defenseCard.id));
      } else {
        setPlayer2Hand(prev => prev.filter(c => c.id !== defenseCard.id));
      }

      if (isFeint) {
        if ((defenseCard.defenseType === 'counter' && card.attackType === 'physical') ||
          (defenseCard.defenseType === 'deflect' && card.attackType === 'magic')) {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`${defenseCard.defenseType === 'counter' ? '⚡' : '🔮'} ${defenseCard.name}! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else {
          addLog(`💫 Feint! ${defenseCard.name} has no effect!`);
        }
      } else {
        if (defenseCard.defenseType === 'evade') {
          defenderDamage = 0;
          attackEvaded = true;
          addLog(`💨 ${defenderHero.name} evades!`);
        } else if (defenseCard.defenseType === 'counter' && card.attackType === 'physical') {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`⚡ Counter! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else if (defenseCard.defenseType === 'deflect' && card.attackType === 'magic') {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`🔮 Deflect! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else if (defenseCard.defenseType === 'block') {
          defenderDamage = Math.max(0, card.damage - defenseCard.defense);
          addLog(`🛡️ Blocked to ${defenderDamage}!`);
        } else {
          addLog(`⚠️ ${defenseCard.name} doesn't work!`);
        }
      }
    } else {
      addLog(`💥 Full damage!`);
    }

    // Apply damage to heroes
    const newHeroes = {
      player1: heroes.player1.map(h => {
        if (h.id === defenderHero.id && defender === 'player1') {
          const newHp = Math.max(0, h.hp - defenderDamage);
          return { ...h, hp: newHp, defeated: newHp === 0 };
        }
        if (h.id === attackerHero.id && attacker === 'player1') {
          const newHp = Math.max(0, h.hp - attackerDamage);
          return { ...h, hp: newHp, defeated: newHp === 0 };
        }
        return h;
      }),
      player2: heroes.player2.map(h => {
        if (h.id === defenderHero.id && defender === 'player2') {
          const newHp = Math.max(0, h.hp - defenderDamage);
          return { ...h, hp: newHp, defeated: newHp === 0 };
        }
        if (h.id === attackerHero.id && attacker === 'player2') {
          const newHp = Math.max(0, h.hp - attackerDamage);
          return { ...h, hp: newHp, defeated: newHp === 0 };
        }
        return h;
      })
    };

    // Apply status effect from card or from active elemental magic buff
    let statusToApply = card.statusEffect;
    if (!statusToApply && activeBuff && activeBuff.buffType === 'elementalMagic' && card.attackType === 'magic') {
      statusToApply = activeBuff.statusEffect;
    }
    
    if (statusToApply) {
      // Determine who gets the status effect based on defense type
      let statusTargetHero = defenderHero;
      let statusTargetPlayer = defender;
      let isReflected = false;

      if (defenseCard && defenseCard.defenseType === 'deflect') {
        // DEFLECT bounces status effect back to attacker
        statusTargetHero = attackerHero;
        statusTargetPlayer = attacker;
        isReflected = true;
      } else if (defenseCard && defenseCard.defenseType === 'block') {
        // BLOCK applies status effect to defender regardless of damage
        // Keep defaults (statusTargetHero = defenderHero, statusTargetPlayer = defender)
      } else if (defenderDamage <= 0) {
        // Don't apply status if no damage (except for block)
        statusToApply = null;
      }

      if (statusToApply) {
        const statusEffect = {
          ...STATUS_EFFECTS[statusToApply],
          type: statusToApply,
          turnsRemaining: STATUS_EFFECTS[statusToApply].duration
        };

        newHeroes[statusTargetPlayer] = newHeroes[statusTargetPlayer].map(h =>
          h.id === statusTargetHero.id ? {
            ...h,
            statusEffects: [...h.statusEffects.filter(e => e.type !== statusToApply), statusEffect]
          } : h
        );

        if (isReflected) {
          addLog(`${STATUS_EFFECTS[statusToApply].icon} ${statusTargetHero.name} is ${statusToApply}! [REFLECTED]`);
        } else {
          addLog(`${STATUS_EFFECTS[statusToApply].icon} ${statusTargetHero.name} is ${statusToApply}!`);
        }
      }
    }

    setHeroes(newHeroes);

    if (defenderDamage > 0) {
      const updatedDefender = newHeroes[defender].find(h => h.id === defenderHero.id);
      addLog(`❤️ ${defenderHero.name}: ${defenderDamage} dmg (HP: ${updatedDefender.hp}/${updatedDefender.maxHp})${updatedDefender.defeated ? ' ☠️ DEFEATED!' : ''}`);
    }
    if (attackerDamage > 0) {
      const updatedAttacker = newHeroes[attacker].find(h => h.id === attackerHero.id);
      addLog(`💢 ${attackerHero.name}: ${attackerDamage} reflected (HP: ${updatedAttacker.hp}/${updatedAttacker.maxHp})${updatedAttacker.defeated ? ' ☠️ DEFEATED!' : ''}`);
    }

    if (activeBuff && activeBuff.buffType === 'charge') {
      addLog(`⚠️ CHARGE FAIL! Stunned next turn!`);
      
      // Apply stun to attacker when charge fails
      const stunEffect = {
        ...STATUS_EFFECTS.STUN,
        type: 'STUN',
        turnsRemaining: STATUS_EFFECTS.STUN.duration
      };

      newHeroes[attacker] = newHeroes[attacker].map(h =>
        h.id === attackerHero.id ? {
          ...h,
          statusEffects: [...h.statusEffects.filter(e => e.type !== 'STUN'), stunEffect]
        } : h
      );
      
      setHeroes(newHeroes);
      addLog(`💫 ${attackerHero.name} is STUN!`);
    }

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

  const endCombatSequence = (newHeroes) => {
    setActiveBuff(null);
    setRemainingAttacks(0);
    setWaitingForNextAttack(false);
    setAttacksUsedThisTurn(0);

    const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
    setCurrentTurn(nextPlayer);
    setActiveHeroIndex(0);

    if (nextPlayer === 'player1') {
      setPlayer1Hand(drawCardsToFive(player1Hand, 'player1', newHeroes));
    } else {
      setPlayer2Hand(drawCardsToFive(player2Hand, 'player2', newHeroes));
    }

    addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
  };

  const playCard = (card) => {
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
    resolveAttack(card);
    return;
  }

  // Support cards target a teammate
  if (card.type === 'support') {
    const activeHero = getActiveHero();
    const heroSupportUsed = heroSupportCounts[activeHero.id] || 0;
    const maxSupportUses = activeBuff && activeBuff.buffType === 'ready' ? 2 : 1;
    
    if (heroSupportUsed >= maxSupportUses) {
      addLog(`⚠️ ${activeHero.name} has already used support card ${maxSupportUses > 1 ? 's' : ''}!`);
      return;
    }
    
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

  const selectTarget = (heroId) => {
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
        healHero(targetHero.id, currentTurn, supportCard.heal);
        addLog(`💚 ${supportCard.name} used on ${targetHero.name}!`);
      } else if (supportCard.effect === 'cleanse') {
        cleanseHero(targetHero.id, currentTurn);
        addLog(`✨ ${supportCard.name} used on ${targetHero.name}!`);
      } else if (supportCard.effect === 'shield') {
        shieldHero(targetHero.id, currentTurn, supportCard.shieldValue);
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

  const skipBlock = () => {
    if (waitingForReaction) resolveAttack(null);
  };

  const cancelAttack = () => {
    if (selectingSupportTarget) {
      setSelectingSupportTarget(false);
      setPendingSupportCard(null);
      addLog('Support card cancelled!');
    } else {
      setSelectingTarget(false);
      setPendingAttackCard(null);
      setIsFirstAttackOfHero(false);
      addLog('Attack cancelled!');
    }
  };

  const confirmEndTurn = () => {
  // Process status effects before turn ends
  const updatedHeroes = processStatusEffects(currentTurn);
  
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
    setPlayer1Hand(drawCardsToFive(player1Hand, 'player1', updatedHeroes));
  } else {
    setPlayer2Hand(drawCardsToFive(player2Hand, 'player2', updatedHeroes));
  }

  addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
};

  const resetGame = () => {
    setHeroes(createInitialHeroes());
    setCurrentTurn('player1');
    setActiveHeroIndex(0);
    setPlayer1Hand([]);
    setPlayer2Hand([]);
    setGameLog([]);
    setGameOver(false);
    setWinner(null);
    setWaitingForReaction(false);
    setPendingAttack(null);
    setGameStarted(false);
    setDrawnCard(null);
    setWaitingForDiscard(false);
    setDrawUsedThisTurn(false);
    setActiveBuff(null);
    setRemainingAttacks(0);
    setWaitingForNextAttack(false);
    setAttacksUsedThisTurn(0);
    setSelectingTarget(false);
    setPendingAttackCard(null);
    setTurnCount(0);
    setHeroAttackCounts({});
    setIsFirstAttackOfHero(false);
  };

  const getCurrentPlayerHand = () => currentTurn === 'player1' ? player1Hand : player2Hand;

  const canHeroUseCard = (hero, card) => {
    // Support cards only usable by Support heroes
    if (card.type === 'support') {
      return hero.job.name === 'Support';
    }
    // Elemental magic buffs only usable by Mage heroes
    if (card.type === 'buff' && card.buffType === 'elementalMagic') {
      return hero.job.name === 'Mage';
    }
    if (card.type !== 'attack') return true;
    if (hero.hp <= 0) return false;
    if (!canHeroAct(hero)) return false;
    
    const jobName = hero.job.name;
    if (jobName === 'Melee' && (card.name === 'Normal Attack' || card.name === 'Heavy Attack')) return true;
    if (jobName === 'Ranged' && (card.name === 'Normal Shot' || card.name === 'Charge Shot')) return true;
    if (jobName === 'Mage' && (card.name === 'Normal Magic' || card.name === 'Heavy Magic')) return true;
    if (jobName === 'Support' && (card.name === 'Normal Magic' || card.name === 'Heavy Magic')) return true;
    return false;
  };

  const displayHand = waitingForReaction
    ? (pendingAttack.defender === 'player1' ? player1Hand : player2Hand)
    : getCurrentPlayerHand();

  const displayPlayer = waitingForReaction
    ? (pendingAttack.defender === 'player1' ? 'Player 1' : 'Player 2')
    : (currentTurn === 'player1' ? 'Player 1' : 'Player 2');

  const getCardVisual = (card) => {
    if (card.type === 'attack') {
      let atkColor = 'bg-red-900 border-red-600';
      let atkIcon = '⚔️';
      if(card.attackType === 'magic') {
        atkColor = 'bg-purple-900 border-purple-600';
        atkIcon = '🔮';
      } else if(card.attackType === 'ranged') {
        atkColor = 'bg-green-900 border-green-600';
        atkIcon = '🏹';
      }
      return {
        color: atkColor,
        icon: atkIcon,
        label: card.damage
      };
    } else if (card.type === 'buff') {
      let color = 'bg-yellow-900 border-yellow-600';
      let icon = '🔥';
      if (card.buffType === 'charge') {
        color = 'bg-amber-900 border-amber-600';
        icon = '⚡';
      } else if (card.buffType === 'feint') {
        color = 'bg-indigo-900 border-indigo-600';
        icon = '💫';
      } else if (card.buffType === 'ready') {
        color = 'bg-lime-900 border-lime-600';
        icon = '😣';
      } else if (card.buffType === 'elementalMagic') {
        color = 'bg-pink-900 border-pink-600';
        icon = '🌟';
      }
      const dmg = card.damageModifier || 0;
      return { color, icon, label: `${dmg >= 0 ? '+' : ''}${dmg}` };
    } else if (card.type === 'support') {
         let color = 'bg-emerald-900 border-emerald-600';
          let icon = '✨';
          let label = 'CURE';
          
          if (card.effect === 'heal') {
            icon = '💚';
            label = `+${card.heal}`;
          } else if (card.effect === 'shield') {
            color = 'bg-blue-900 border-blue-600';
            icon = '🛡️';
            label = `+${card.shieldValue}`;
          }
        return { color, icon, label };
  } else {
      let color = 'bg-blue-900 border-blue-600';
      let icon = '🛡️';
      if (card.defenseType === 'evade') {
        color = 'bg-cyan-900 border-cyan-600';
        icon = '💨';
      } else if (card.defenseType === 'counter') {
        color = 'bg-orange-900 border-orange-600';
        icon = '⚡';
      } else if (card.defenseType === 'deflect') {
        color = 'bg-pink-900 border-pink-600';
        icon = '🔮';
      }
      return { color, icon, label: card.defenseType === 'evade' ? 'EVADE' : card.defenseType === 'counter' ? 'CNTR' : card.defenseType === 'deflect' ? 'DFLT' : card.defense };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-2">Tactical Hero Card Battle</h1>
      <p className="text-center text-gray-400 mb-8">Phase 4: 3v3 Hero Teams</p>

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-4 border-yellow-500">
            <h2 className="text-4xl font-bold mb-6">
              {winner === 'player1' ? '🎉 Player 1 Wins!' : '🎉 Player 2 Wins!'}
            </h2>
            <button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-xl">
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Battlefield - 3v3 Heroes */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Player 1 Team */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-3 text-blue-400">Player 1 Team</h2>
          <div className="grid grid-cols-3 gap-4">
            {heroes.player1.map((hero, idx) => (
              <div
                key={hero.id}
                onClick={() => {
                  if (selectingSupportTarget && currentTurn === 'player1') {
                    selectTarget(hero.id);
                  } else if (selectingTarget) {
                    selectTarget(hero.id);
                  } else if (gameStarted && currentTurn === 'player1' && !waitingForReaction && !selectingTarget && !selectingSupportTarget) {
                    setActiveHeroIndex(idx);
                    addLog(`${hero.name} selected!`);
                  }
                }}
                className={`bg-gray-800 p-4 rounded-lg border-4 transition-all cursor-pointer ${hero.defeated ? 'opacity-40 border-gray-700' :
                  !gameStarted ? 'border-gray-500' :
                  currentTurn === 'player1' && idx === activeHeroIndex ? 'border-blue-500 shadow-lg' :
                    (selectingTarget || selectingSupportTarget) && currentTurn === 'player1' ? 'border-green-500 hover:border-green-400' :
                      currentTurn === 'player1' && !waitingForReaction ? 'border-blue-400 hover:border-blue-300' :
                        'border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-bold">{hero.name}</h3>
                    <p className="text-sm text-gray-400">{hero.job.icon} {hero.job.name}</p>
                  </div>
                  {hero.defeated && <span className="text-2xl">☠️</span>}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span className="font-bold">{hero.hp}/{hero.maxHp}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
                  </div>
                  {/* ADD THIS SHIELD DISPLAY */}
                  {hero.shield > 0 && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-300">🛡️ Shield</span>
                        <span className="font-bold text-blue-300">{hero.shield}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (hero.shield / hero.maxHp) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  {hero.statusEffects.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {hero.statusEffects.map((effect, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded" title={effect.name}>
                        {effect.icon} {effect.turnsRemaining}
                      </span>
                    ))}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player 2 Team */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-red-400">Player 2 Team</h2>
          <div className="grid grid-cols-3 gap-4">
            {heroes.player2.map((hero, idx) => (
              <div
                key={hero.id}
                onClick={() => {
                  if (selectingSupportTarget && currentTurn === 'player2') {
                    selectTarget(hero.id);
                  } else if (selectingTarget) {
                    selectTarget(hero.id);
                  } else if (gameStarted && currentTurn === 'player2' && !waitingForReaction && !selectingTarget && !selectingSupportTarget) {
                    setActiveHeroIndex(idx);
                    addLog(`${hero.name} selected!`);
                  }
                }}
                className={`bg-gray-800 p-4 rounded-lg border-4 transition-all cursor-pointer ${hero.defeated ? 'opacity-40 border-gray-700' :
                  !gameStarted ? 'border-gray-500' :
                  currentTurn === 'player2' && idx === activeHeroIndex ? 'border-red-500 shadow-lg' :
                    (selectingTarget || selectingSupportTarget) && currentTurn === 'player2' ? 'border-green-500 hover:border-green-400' :
                      currentTurn === 'player2' && !waitingForReaction ? 'border-red-400 hover:border-red-300' :
                        'border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-bold">{hero.name}</h3>
                    <p className="text-sm text-gray-400">{hero.job.icon} {hero.job.name}</p>
                  </div>
                  {hero.defeated && <span className="text-2xl">☠️</span>}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span className="font-bold">{hero.hp}/{hero.maxHp}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
                  </div>
                  {hero.statusEffects.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {hero.statusEffects.map((effect, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded" title={effect.name}>
                        {effect.icon} {effect.turnsRemaining}
                      </span>
                    ))}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Support Card Target Selection Banner */}
      {selectingSupportTarget && pendingSupportCard && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-emerald-900 p-4 rounded-lg border-2 border-emerald-400 text-center">
            <p className="text-xl font-bold">💚 Select a teammate to use {pendingSupportCard.name} on...</p>
          </div>
        </div>
      )}

      {/* Target Selection Banner */}
      {selectingTarget && !isFirstAttackOfHero && (
        <div className="max-w-7xl mx-auto mb-4" onClick={cancelAttack}>
          <div className="bg-red-900 p-4 rounded-lg border-2 border-red-500 text-center">
            <p className="text-xl font-bold">❌ {getActiveHero().name} already turn ended!</p>
          </div>
        </div>
      )}

      {/* First Attack Banner */}
      {isFirstAttackOfHero && selectingTarget && pendingAttackCard && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-blue-900 p-4 rounded-lg border-2 border-blue-400 text-center">
            <p className="text-xl font-bold">✨ {getActiveHero().name} is ready to attack with {pendingAttackCard.name}! Select target...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {!gameOver && (
        <div className="max-w-7xl mx-auto mb-8 text-center">
          {!gameStarted && (
            <div>
              <button onClick={startGame} className="bg-green-600 hover:bg-green-700 px-12 py-4 rounded-lg font-bold text-2xl">
                Start 3v3 Battle
              </button>
            </div>
          )}

          {waitingForReaction && pendingAttack && (
            <div className="bg-yellow-900 p-6 rounded-lg border-2 border-yellow-500">
              <p className="text-xl mb-4 font-bold">
                ⚡ {pendingAttack.defenderHero.name}: Defend?
              </p>
              <button onClick={skipBlock} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold">
                Take Damage
              </button>
            </div>
          )}

          {gameStarted && !waitingForReaction && !gameOver && !waitingForNextAttack && !selectingTarget && (
            <div className="space-y-3">
              {turnCount > 2 && getCurrentPlayerHand().length === 5 && !waitingForDiscard && !drawUsedThisTurn && (
                <div>
                  <button onClick={drawOneAndDiscard} className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg font-bold">
                    Draw & Discard
                  </button>
                </div>
              )}
              <div>
                <button onClick={confirmEndTurn} className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold">
                  End Turn
                </button>
              </div>
              {waitingForDiscard && (
                <div className="bg-orange-900 p-4 rounded-lg">
                  <p className="font-bold">🃏 Select card to discard</p>
                </div>
              )}
            </div>
          )}

          {waitingForNextAttack && (
            <div className="bg-amber-900 p-4 rounded-lg border-2 border-amber-500">
              <p className="font-bold">🔥 {remainingAttacks} attacks left - play another attack!</p>
            </div>
          )}
        </div>
      )}

      {/* Hand */}
      {displayHand.length > 0 && !gameOver && gameStarted && (
        <div className="max-w-7xl mx-auto mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">
            {displayPlayer}'s Hand
            {waitingForReaction && <span className="text-yellow-400 ml-2">(Defend)</span>}
            {waitingForDiscard && <span className="text-orange-400 ml-2">(Discard)</span>}
          </h3>
          <div className="flex gap-4 justify-center flex-wrap">
            {displayHand.map((card) => {
              const activeHero = getActiveHero();
              const isPlayable = waitingForDiscard ? true :
                waitingForReaction ? card.type === 'defense' :
                  card.type === 'attack' ? canHeroUseCard(activeHero, card) :
                    (card.type === 'buff' && !activeBuff ) ? canHeroUseCard(activeHero, card) :
                      card.type === 'support' ? canHeroUseCard(activeHero, card) :
                        false;
              const isNewlyDrawn = drawnCard && card.id === drawnCard.id;
              const visual = getCardVisual(card);

              return (
                <button
                  key={card.id}
                  onClick={() => playCard(card)}
                  disabled={!waitingForDiscard && !isPlayable}
                  className={`p-6 rounded-lg border-2 min-w-[140px] ${visual.color} ${!waitingForDiscard && !isPlayable ? 'opacity-40' : 'hover:scale-105'
                    } ${isNewlyDrawn ? 'ring-4 ring-green-400 animate-pulse' : ''}`}
                >
                  <div className="font-bold text-lg mb-2">
                    {card.name}
                    {isNewlyDrawn && <span className="text-green-400 ml-1">✨</span>}
                  </div>
                  <div className="text-2xl font-bold">{visual.icon} {visual.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{card.type.toUpperCase()}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Log */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl font-bold mb-4">📜 Battle Log</h3>
        <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto border-2 border-gray-700">
          {gameLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Battle not started</p>
          ) : (
            gameLog.map((log, i) => <p key={i} className="text-sm text-gray-300 mb-1">{log}</p>)
          )}
        </div>
      </div>

      {!gameOver && gameStarted && (
        <div className="max-w-7xl mx-auto mt-4 text-center">
          <button onClick={resetGame} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm">
            Reset Game
          </button>
        </div>
      )}
    </div>

  );
}
export default App;