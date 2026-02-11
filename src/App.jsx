import { useState } from 'react';
// Models
import { STATUS_EFFECTS } from './models/statusEffects';
import { CARD_TYPES } from './models/cardTypes';
import { JOB_CLASSES } from './models/jobClasses';
import { createInitialHeroes } from './models/initialState';
// Utilities
import { checkVictory, canHeroUseCard, processStatusEffects } from './utils/gameLogic';
import { drawCardsToFive, generateCard } from './utils/cardGeneration';
import { getCardVisual } from './utils/cardVisuals';
// Components
import Battlefield from './components/Battlefield';
import Hand from './components/Hand';
import BattleLog from './components/BattleLog';
import Controls from './components/Controls';
import GameOverModal from './components/GameOverModal';
import StatusBanners from './components/StatusBanners';

function App() {
  // State Management - using plain useState hooks organized by feature
  const [heroes, setHeroes] = useState(createInitialHeroes());
  const [currentTurn, setCurrentTurn] = useState('player1');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);
  const [gameLog, setGameLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  
  // Combat State
  const [waitingForReaction, setWaitingForReaction] = useState(false);
  const [pendingAttack, setPendingAttack] = useState(null);
  const [activeBuff, setActiveBuff] = useState(null);
  const [remainingAttacks, setRemainingAttacks] = useState(0);
  const [waitingForNextAttack, setWaitingForNextAttack] = useState(false);
  const [heroAttackCounts, setHeroAttackCounts] = useState({});
  
  // Draw/Discard State
  const [drawnCard, setDrawnCard] = useState(null);
  const [waitingForDiscard, setWaitingForDiscard] = useState(false);
  const [drawUsedThisTurn, setDrawUsedThisTurn] = useState(false);
  
  // Target Selection State
  const [selectingTarget, setSelectingTarget] = useState(false);
  const [pendingAttackCard, setPendingAttackCard] = useState(null);
  const [isFirstAttackOfHero, setIsFirstAttackOfHero] = useState(false);
  
  // Support Card State
  const [selectingSupportTarget, setSelectingSupportTarget] = useState(false);
  const [pendingSupportCard, setPendingSupportCard] = useState(null);
  const [heroSupportCounts, setHeroSupportCounts] = useState({});

  // Helper Functions
  const addLog = (message) => setGameLog(prev => [...prev, message]);
  const getActiveHero = () => {
    const team = heroes[currentTurn];
    return team[activeHeroIndex];
  };
  const getCurrentPlayerHand = () => currentTurn === 'player1' ? player1Hand : player2Hand;

  // Game Initialization
  const startGame = () => {
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
    setSelectingTarget(false);
    setPendingAttackCard(null);
    setTurnCount(0);
    setHeroAttackCounts({});
    setIsFirstAttackOfHero(false);
    setSelectingSupportTarget(false);
    setPendingSupportCard(null);
    setHeroSupportCounts({});
  };

  // CARD MANAGEMENT CONTROLLER
  const handleDrawOneAndDiscard = () => {
    if (drawUsedThisTurn) return;
    const teamHeroes = heroes[currentTurn];
    let activeHeroes = teamHeroes.filter(h => !h.defeated);
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

  const handleDiscardCard = (card) => {
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

  // BUFF CONTROLLER
  const handlePlayBuff = (card) => {
    const currentHand = getCurrentPlayerHand();
    const attackCards = currentHand.filter(c => c.type === 'attack');
    const magicCards = attackCards.filter(c => c.attackType === 'magic');
    const hero = getActiveHero();

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

    if (card.buffType === 'charge') addLog(`⚠️ Charge: 0 damage = stunned!`);
    if (card.buffType === 'feint') addLog(`💫 Feint: Unavoidable, -1 damage!`);
  };

  // ATTACK CONTROLLER
  const handlePlayAttack = (card, targetHeroId = null) => {
    const attacker = getActiveHero();
    
    const canUseAttack = (hero, attackCard) => {
      const jobName = hero.job.name;
      if (jobName === 'Melee' && attackCard.attackType === 'physical') return true;
      if (jobName === 'Ranged' && attackCard.attackType === 'ranged') return true;
      if (jobName === 'Mage' && (attackCard.attackType === 'magic' || attackCard.buffType === 'elementalMagic')) return true;
      if (jobName === 'Support' && (attackCard.attackType === 'magic' || attackCard.type === 'support')) return true;
    return false;
      return false;
    };

    if (!canUseAttack(attacker, card)) {
      addLog(`⚠️ ${attacker.name} (${attacker.job.name}) cannot use ${card.name}!`);
      return;
    }

    if (activeBuff && activeBuff.buffType === 'elementalMagic' && card.attackType !== 'magic') {
      addLog(`⚠️ ${activeBuff.name} only combos with magic attacks!`);
      return;
    }

    const maxAttacks = activeBuff ? (1 + activeBuff.extraAttacks) : 1;
    const heroAttackCount = heroAttackCounts[attacker.id] || 0;

    if (!targetHeroId) {
      if (heroAttackCount >= maxAttacks) {
        addLog(`⚠️ ${attacker.name} has already attacked ${maxAttacks} time${maxAttacks > 1 ? 's' : ''} this turn!`);
        return;
      }
      
      setPendingAttackCard(card);
      setSelectingTarget(true);
      setIsFirstAttackOfHero(true);
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
      if (activeBuff.buffType === 'feint') isFeint = true;
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

    const icon = card.attackType === 'magic' ? '🔮' : '⚔️';
    addLog(`${attacker.name} attacks ${targetHero.name} with ${card.name} ${icon} (${finalDamage} dmg)${isFeint ? ' [UNAVOIDABLE]' : ''}!`);
    setHeroAttackCounts(prev => ({
      ...prev,
      [attacker.id]: (prev[attacker.id] || 0) + 1
    }));
  };

  // DAMAGE RESOLUTION CONTROLLER
  const handleResolveAttack = (defenseCard = null) => {
    if (!pendingAttack) return;

    const { card, attacker, attackerHero, defender, defenderHero, isFeint } = pendingAttack;
    let defenderDamage = card.damage;
    let attackerDamage = 0;
    let shieldAbsorbed = 0;

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

    const newHeroes = {
      player1: heroes.player1.map(h => {
        if (h.id === defenderHero.id && defender === 'player1') {
          // Shield absorbs damage first
          let damageAfterShield = defenderDamage;
          let newShield = h.shield;
          if (h.shield > 0) {
            shieldAbsorbed = Math.min(h.shield, defenderDamage);
            damageAfterShield = defenderDamage - shieldAbsorbed;
            newShield = h.shield - shieldAbsorbed;
          }
          const newHp = Math.max(0, h.hp - damageAfterShield);
          return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
        }
        if (h.id === attackerHero.id && attacker === 'player1') {
          let damageAfterShield = attackerDamage;
          let newShield = h.shield;
          if (h.shield > 0) {
            const shieldAbsorbed = Math.min(h.shield, attackerDamage);
            damageAfterShield = attackerDamage - shieldAbsorbed;
            newShield = h.shield - shieldAbsorbed;
          }
          const newHp = Math.max(0, h.hp - damageAfterShield);
          return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
        }
        return h;
      }),
      player2: heroes.player2.map(h => {
        if (h.id === defenderHero.id && defender === 'player2') {
          // Shield absorbs damage first
          let damageAfterShield = defenderDamage;
          let newShield = h.shield;
          if (h.shield > 0) {
            shieldAbsorbed = Math.min(h.shield, defenderDamage);
            damageAfterShield = defenderDamage - shieldAbsorbed;
            newShield = h.shield - shieldAbsorbed;
          }
          const newHp = Math.max(0, h.hp - damageAfterShield);
          return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
        }
        if (h.id === attackerHero.id && attacker === 'player2') {
          let damageAfterShield = attackerDamage;
          let newShield = h.shield;
          if (h.shield > 0) {
            const shieldAbsorbed = Math.min(h.shield, attackerDamage);
            damageAfterShield = attackerDamage - shieldAbsorbed;
            newShield = h.shield - shieldAbsorbed;
          }
          const newHp = Math.max(0, h.hp - damageAfterShield);
          return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
        }
        return h;
      })
    };

    let statusToApply = card.statusEffect;
    if (!statusToApply && activeBuff && activeBuff.buffType === 'elementalMagic' && card.attackType === 'magic') {
      statusToApply = activeBuff.statusEffect;
    }
    
    if (statusToApply) {
      let statusTargetHero = defenderHero;
      let statusTargetPlayer = defender;
      let isReflected = false;

      if (defenseCard && defenseCard.defenseType === 'deflect') {
        statusTargetHero = attackerHero;
        statusTargetPlayer = attacker;
        isReflected = true;
      } else if (defenderDamage <= 0 && !(defenseCard && defenseCard.defenseType === 'block')) {
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
      // addLog(`⚠️ CHARGE FAIL! Stunned next turn!`);
      
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
      addLog(`💫 ${attackerHero.name} need to recharge!`);
    }

    setWaitingForReaction(false);
    setPendingAttack(null);

    if (checkVictory(newHeroes, addLog, setGameOver, setWinner)) return;

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

  // SUPPORT CARD CONTROLLER
  const handleSelectTarget = (heroId) => {
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
        setHeroes(prev => ({
          ...prev,
          [currentTurn]: prev[currentTurn].map(h =>
            h.id === targetHero.id ? { 
              ...h, 
              hp: Math.min(h.maxHp, h.hp + supportCard.heal) 
            } : h
          )
        }));
        addLog(`💚 ${targetHero.name} healed ${supportCard.heal} HP!`);
      } else if (supportCard.effect === 'cleanse') {
        setHeroes(prev => ({
          ...prev,
          [currentTurn]: prev[currentTurn].map(h =>
            h.id === targetHero.id ? { ...h, statusEffects: [] } : h
          )
        }));
        addLog(`✨ ${targetHero.name} cleansed of all status effects!`);
      } else if (supportCard.effect === 'shield') {
        setHeroes(prev => ({
          ...prev,
          [currentTurn]: prev[currentTurn].map(h =>
            h.id === targetHero.id ? { 
              ...h, 
              shield: h.shield + supportCard.shieldValue 
            } : h
          )
        }));
        addLog(`🛡️ ${targetHero.name} gains ${supportCard.shieldValue} shield! (Total: ${targetHero.shield + supportCard.shieldValue})`);
      }
      
      if (currentTurn === 'player1') {
        setPlayer1Hand(prev => prev.filter(c => c.id !== supportCard.id));
      } else {
        setPlayer2Hand(prev => prev.filter(c => c.id !== supportCard.id));
      }
      
      setHeroSupportCounts(prev => ({
        ...prev,
        [casterHero.id]: (prev[casterHero.id] || 0) + 1
      }));
      
      setSelectingSupportTarget(false);
      setPendingSupportCard(null);
      return;
    }
    
    if (!selectingTarget || !pendingAttackCard) return;
    handlePlayAttack(pendingAttackCard, heroId);
  };

  // TURN CONTROLLER
  const handleConfirmEndTurn = () => {
    const updatedHeroes = processStatusEffects(currentTurn, heroes, setHeroes, addLog, STATUS_EFFECTS);
    
    if (checkVictory(updatedHeroes, addLog, setGameOver, setWinner)) return;

    const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
    const nextTeam = updatedHeroes[nextPlayer];
    let nextHeroIndex = nextTeam.findIndex(h => !h.defeated);
    if (nextHeroIndex === -1) nextHeroIndex = 0;
    
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

    if (nextPlayer === 'player1') {
      setPlayer1Hand(drawCardsToFive(player1Hand, 'player1', updatedHeroes, addLog));
    } else {
      setPlayer2Hand(drawCardsToFive(player2Hand, 'player2', updatedHeroes, addLog));
    }

    addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
  };

  // Main Card Play Handler
  const playCard = (card) => {
    if (gameOver) return;

    if (waitingForDiscard) {
      handleDiscardCard(card);
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
      handleResolveAttack(card);
      return;
    }

    if (card.type === 'support') {
      const heroSupportUsed = heroSupportCounts[getActiveHero().id] || 0;
      const maxSupportUses = activeBuff && activeBuff.buffType === 'ready' ? 2 : 1;
      
      if (heroSupportUsed >= maxSupportUses) {
        addLog(`⚠️ ${getActiveHero().name} has already used support card${maxSupportUses > 1 ? 's' : ''}!`);
        return;
      }
      
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
      handlePlayBuff(card);
    } else if (card.type === 'attack') {
      handlePlayAttack(card);
    } else {
      addLog('⚠️ Defense cards only as reactions!');
    }
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

  // Display Logic
  const displayHand = waitingForReaction
    ? (pendingAttack.defender === 'player1' ? player1Hand : player2Hand)
    : getCurrentPlayerHand();

  const displayPlayer = waitingForReaction
    ? (pendingAttack.defender === 'player1' ? 'Player 1' : 'Player 2')
    : (currentTurn === 'player1' ? 'Player 1' : 'Player 2');

  const canPlayCard = (card) => {
    const activeHero = getActiveHero();
    return waitingForDiscard ? true :
      waitingForReaction ? card.type === 'defense' :
        card.type === 'attack' ? canHeroUseCard(activeHero, card) :
          (card.type === 'buff' && !activeBuff) ? canHeroUseCard(activeHero, card) :
            card.type === 'support' ? canHeroUseCard(activeHero, card) :
              false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex gap-6">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-center mb-2">Tactical Hero Card Battle</h1>
          <p className="text-center text-gray-400 mb-4">MVC Architecture Refactoring</p>
        </div>

        <GameOverModal gameOver={gameOver} winner={winner} resetGame={resetGame} />

        <Battlefield 
          heroes={heroes}
          currentTurn={currentTurn}
          activeHeroIndex={activeHeroIndex}
          selectingTarget={selectingTarget}
          selectingSupportTarget={selectingSupportTarget}
          waitingForReaction={waitingForReaction}
          pendingAttack={pendingAttack}
          gameStarted={gameStarted}
          setActiveHeroIndex={setActiveHeroIndex}
          selectTarget={handleSelectTarget}
          addLog={addLog}
        />

        <StatusBanners 
          selectingTarget={selectingTarget}
          selectingSupportTarget={selectingSupportTarget}
          isFirstAttackOfHero={isFirstAttackOfHero}
          pendingAttackCard={pendingAttackCard}
          pendingSupportCard={pendingSupportCard}
          getActiveHero={getActiveHero}
        />

        <Controls 
          gameStarted={gameStarted}
          gameOver={gameOver}
          waitingForReaction={waitingForReaction}
          waitingForDiscard={waitingForDiscard}
          waitingForNextAttack={waitingForNextAttack}
          selectingTarget={selectingTarget}
          turnCount={turnCount}
          currentPlayerHand={getCurrentPlayerHand()}
          drawUsedThisTurn={drawUsedThisTurn}
          pendingAttack={pendingAttack}
          isFirstAttackOfHero={isFirstAttackOfHero}
          pendingAttackCard={pendingAttackCard}
          selectingSupportTarget={selectingSupportTarget}
          pendingSupportCard={pendingSupportCard}
          remainingAttacks={remainingAttacks}
          startGame={startGame}
          skipBlock={() => handleResolveAttack(null)}
          drawOneAndDiscard={handleDrawOneAndDiscard}
          confirmEndTurn={handleConfirmEndTurn}
          cancelAttack={cancelAttack}
          getActiveHero={getActiveHero}
        />

        <Hand 
          displayHand={displayHand}
          displayPlayer={displayPlayer}
          gameStarted={gameStarted}
          gameOver={gameOver}
          drawnCard={drawnCard}
          waitingForReaction={waitingForReaction}
          waitingForDiscard={waitingForDiscard}
          canPlayCard={canPlayCard}
          playCard={playCard}
          getCardVisual={getCardVisual}
        />

        {!gameOver && gameStarted && (
          <div className="mt-4 text-center">
            <button onClick={resetGame} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm">
              Reset Game
            </button>
          </div>
        )}
      </div>

      {/* Battle Log Sidebar */}
      <div className="w-80 flex-shrink-0">
        <BattleLog gameLog={gameLog} />
      </div>
    </div>
  );
}

export default App;
