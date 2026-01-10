import { useState } from 'react';

// Card data
const CARD_TYPES = {
  NORMAL_ATTACK: { name: 'Normal Attack', damage: 4, type: 'attack', attackType: 'physical' },
  HEAVY_ATTACK: { name: 'Heavy Attack', damage: 6, type: 'attack', attackType: 'physical' },
  NORMAL_SHOT: { name: 'Normal Shot', damage: 4, type: 'attack', attackType: 'physical' },
  CHARGE_SHOT: { name: 'Charge Shot', damage: 6, type: 'attack', attackType: 'physical' },
  NORMAL_MAGIC: { name: 'Normal Magic', damage: 4, type: 'attack', attackType: 'magic' },
  HEAVY_MAGIC: { name: 'Heavy Magic', damage: 6, type: 'attack', attackType: 'magic' },
  FOCUS: { name: 'Focus', type: 'buff', buffType: 'focus', damageModifier: 1, extraAttacks: 0 },
  CHARGE: { name: 'Charge', type: 'buff', buffType: 'charge', damageModifier: 2, extraAttacks: 0, risk: 'stun' },
  READY: { name: 'Ready', type: 'buff', buffType: 'ready', damageModifier: 0, extraAttacks: 1 },
  FEINT: { name: 'Feint', type: 'buff', buffType: 'feint', damageModifier: -1, unavoidable: true },
  BLOCK: { name: 'Block', defense: 4, type: 'defense', defenseType: 'block' },
  EVADE: { name: 'Evade', defense: 999, type: 'defense', defenseType: 'evade' },
  COUNTER: { name: 'Counter', defense: 0, type: 'defense', defenseType: 'counter', counterType: 'physical' },
  DEFLECT: { name: 'Deflect', defense: 0, type: 'defense', defenseType: 'deflect', counterType: 'magic' }
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
    { id: 1, name: 'Hero 1', job: JOB_CLASSES.MELEE, hp: 60, maxHp: 60, defeated: false },
    { id: 2, name: 'Hero 2', job: JOB_CLASSES.RANGED, hp: 45, maxHp: 45, defeated: false },
    { id: 3, name: 'Hero 3', job: JOB_CLASSES.MAGE, hp: 40, maxHp: 40, defeated: false }
  ],
  player2: [
    { id: 4, name: 'Hero 4', job: JOB_CLASSES.MELEE, hp: 60, maxHp: 60, defeated: false },
    { id: 5, name: 'Hero 5', job: JOB_CLASSES.RANGED, hp: 45, maxHp: 45, defeated: false },
    { id: 6, name: 'Hero 6', job: JOB_CLASSES.MAGE, hp: 40, maxHp: 40, defeated: false }
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
  const [turnCount, setTurnCount] = useState(0);
  const [heroAttackCounts, setHeroAttackCounts] = useState({});
  const [isFirstAttackOfHero, setIsFirstAttackOfHero] = useState(false);

  const generateCard = () => {
    const types = [
      CARD_TYPES.NORMAL_ATTACK, CARD_TYPES.NORMAL_ATTACK,
      CARD_TYPES.HEAVY_ATTACK, CARD_TYPES.HEAVY_ATTACK,
      CARD_TYPES.NORMAL_MAGIC, CARD_TYPES.NORMAL_MAGIC,
      CARD_TYPES.HEAVY_MAGIC, CARD_TYPES.HEAVY_MAGIC,
      CARD_TYPES.NORMAL_SHOT,  CARD_TYPES.NORMAL_SHOT,
      CARD_TYPES.CHARGE_SHOT, CARD_TYPES.CHARGE_SHOT, 
      CARD_TYPES.FOCUS, CARD_TYPES.CHARGE, 
      CARD_TYPES.READY, CARD_TYPES.FEINT,
      CARD_TYPES.BLOCK, CARD_TYPES.EVADE,
      CARD_TYPES.COUNTER, CARD_TYPES.DEFLECT
    ];
    return { ...types[Math.floor(Math.random() * types.length)], id: Date.now() + Math.random() };
  };

  const drawCardsToFive = (currentHand, playerName) => {
    const cardsToDraw = 5 - currentHand.length;
    if (cardsToDraw <= 0) return currentHand;
    const newCards = Array.from({ length: cardsToDraw }, generateCard);
    addLog(`${playerName} draws ${cardsToDraw} card${cardsToDraw > 1 ? 's' : ''}.`);
    return [...currentHand, ...newCards];
  };

  const drawOneAndDiscard = () => {
    if (drawUsedThisTurn) return;
    const newCard = generateCard();
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
    const p1Cards = drawCardsToFive([], 'Player 1');
    const p2Cards = drawCardsToFive([], 'Player 2');
    setPlayer1Hand(p1Cards);
    setPlayer2Hand(p2Cards);
    setGameStarted(true);
    addLog('Game started! 3v3 Battle begins!');
    addLog('--- Player 1\'s turn ---');
  };

  const addLog = (message) => setGameLog(prev => [...prev, message]);

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

    if (card.buffType === 'ready' && attackCards.length < 2) {
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

    const hero = getActiveHero();
    addLog(`🔥 ${hero.name} (${hero.job.name}) uses ${card.name}! ${totalAttacks} attacks!`);

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
      if (jobName === 'Mage' && (attackCard.name === 'Normal Magic' || attackCard.name === 'Heavy Magic')) return true;
      return false;
    };

    if (!canUseAttack(attacker, card)) {
      addLog(`⚠️ ${attacker.name} (${attacker.job.name}) cannot use ${card.name}!`);
      return;
    }

    // If no target selected yet, enter target selection mode
    if (!targetHeroId) {
      const heroAttackCount = heroAttackCounts[attacker.id] || 0;
      const isFirst = heroAttackCount === 0;
      
      setPendingAttackCard(card);
      setSelectingTarget(true);
      setIsFirstAttackOfHero(isFirst);
      addLog(`Select target for ${card.name}...`);
      return;
    }

    const maxAttacks = activeBuff ? (1 + activeBuff.extraAttacks) : 1;
    const heroAttackCount = heroAttackCounts[attacker.id] || 0;
    if (heroAttackCount >= maxAttacks) {
      addLog(`⚠️ ${attacker.name} has already attacked ${maxAttacks} time${maxAttacks > 1 ? 's' : ''} this turn!`);
      setSelectingTarget(false);
      return;
    } else {
      setIsFirstAttackOfHero(true);
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

    setHeroes(newHeroes);

    if (defenderDamage > 0) {
      const updatedDefender = newHeroes[defender].find(h => h.id === defenderHero.id);
      addLog(`❤️ ${defenderHero.name}: ${defenderDamage} dmg (HP: ${updatedDefender.hp}/${updatedDefender.maxHp})${updatedDefender.defeated ? ' ☠️ DEFEATED!' : ''}`);
    }
    if (attackerDamage > 0) {
      const updatedAttacker = newHeroes[attacker].find(h => h.id === attackerHero.id);
      addLog(`💢 ${attackerHero.name}: ${attackerDamage} reflected (HP: ${updatedAttacker.hp}/${updatedAttacker.maxHp})${updatedAttacker.defeated ? ' ☠️ DEFEATED!' : ''}`);
    }

    if (activeBuff && activeBuff.buffType === 'charge' && defenderDamage === 0) {
      addLog(`⚠️ CHARGE FAIL! Stunned next turn!`);
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
      setPlayer1Hand(drawCardsToFive(player1Hand, 'Player 1'));
    } else {
      setPlayer2Hand(drawCardsToFive(player2Hand, 'Player 2'));
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
    if (!selectingTarget || !pendingAttackCard) return;
    playAttack(pendingAttackCard, heroId);
  };

  const skipBlock = () => {
    if (waitingForReaction) resolveAttack(null);
  };

  const cancelAttack = () => {
    setSelectingTarget(false);
    setPendingAttackCard(null);
    setIsFirstAttackOfHero(false);
    addLog('Attack cancelled!');
  };

  const confirmEndTurn = () => {
    const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
    setCurrentTurn(nextPlayer);
    setActiveHeroIndex(0);
    setDrawUsedThisTurn(false);
    setAttacksUsedThisTurn(0);
    setActiveBuff(null);
    setRemainingAttacks(0);
    setWaitingForNextAttack(false);
    setTurnCount(prev => prev + 1);
    setHeroAttackCounts({});
    setIsFirstAttackOfHero(false);

    if (nextPlayer === 'player1') {
      setPlayer1Hand(drawCardsToFive(player1Hand, 'Player 1'));
    } else {
      setPlayer2Hand(drawCardsToFive(player2Hand, 'Player 2'));
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
    if (card.type !== 'attack') return true; // Non-attack cards can always be used
    if(hero.hp <= 0) return false; // Defeated heroes cannot use attack cards
    const jobName = hero.job.name;
    if (jobName === 'Melee' && (card.name === 'Normal Attack' || card.name === 'Heavy Attack')) return true;
    if (jobName === 'Ranged' && (card.name === 'Normal Shot' || card.name === 'Charge Shot')) return true;
    if (jobName === 'Mage' && (card.name === 'Normal Magic' || card.name === 'Heavy Magic')) return true;
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
      }
      return { color, icon, label: `+${card.damageModifier || 0}` };
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
                  if (selectingTarget) {
                    selectTarget(hero.id);
                  } else if (currentTurn === 'player1' && !waitingForReaction && !selectingTarget) {
                    setActiveHeroIndex(idx);
                    addLog(`${hero.name} selected!`);
                  }
                }}
                className={`bg-gray-800 p-4 rounded-lg border-4 transition-all cursor-pointer ${hero.defeated ? 'opacity-40 border-gray-700' :
                  currentTurn === 'player1' && idx === activeHeroIndex ? 'border-blue-500 shadow-lg' :
                    selectingTarget ? 'border-green-500 hover:border-green-400' :
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
                  if (selectingTarget) {
                    selectTarget(hero.id);
                  } else if (currentTurn === 'player2' && !waitingForReaction && !selectingTarget) {
                    setActiveHeroIndex(idx);
                    addLog(`${hero.name} selected!`);
                  }
                }}
                className={`bg-gray-800 p-4 rounded-lg border-4 transition-all cursor-pointer ${hero.defeated ? 'opacity-40 border-gray-700' :
                  currentTurn === 'player2' && idx === activeHeroIndex ? 'border-red-500 shadow-lg' :
                    selectingTarget ? 'border-green-500 hover:border-green-400' :
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
                    (card.type === 'buff' && !activeBuff);
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