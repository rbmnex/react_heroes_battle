import { useState } from 'react';

// Card data with attack types and buffs
const CARD_TYPES = {
  // Physical Attacks
  NORMAL_ATTACK: { name: 'Normal Attack', damage: 4, type: 'attack', attackType: 'physical' },
  HEAVY_ATTACK: { name: 'Heavy Attack', damage: 6, type: 'attack', attackType: 'physical' },
  
  // Magic Attacks
  NORMAL_MAGIC: { name: 'Normal Magic', damage: 4, type: 'attack', attackType: 'magic' },
  HEAVY_MAGIC: { name: 'Heavy Magic', damage: 6, type: 'attack', attackType: 'magic' },
  
  // Buff Cards
  FOCUS: { name: 'Focus', type: 'buff', buffType: 'focus', damageModifier: 1, extraAttacks: 0 },
  CHARGE: { name: 'Charge', type: 'buff', buffType: 'charge', damageModifier: 2, extraAttacks: 0, risk: 'stun' },
  READY: { name: 'Ready', type: 'buff', buffType: 'ready', damageModifier: 0, extraAttacks: 1 },
  FEINT: { name: 'Feint', type: 'buff', buffType: 'feint', damageModifier: -1, unavoidable: true },
  
  // Defense Cards
  BLOCK: { name: 'Block', defense: 4, type: 'defense', defenseType: 'block' },
  EVADE: { name: 'Evade', defense: 999, type: 'defense', defenseType: 'evade' },
  COUNTER: { name: 'Counter', defense: 0, type: 'defense', defenseType: 'counter', counterType: 'physical' },
  DEFLECT: { name: 'Deflect', defense: 0, type: 'defense', defenseType: 'deflect', counterType: 'magic' }
};

const INITIAL_HERO = {
  player1: { name: 'Hero 1', hp: 50, maxHp: 50 },
  player2: { name: 'Hero 2', hp: 50, maxHp: 50 }
};

function App() {
  const [heroes, setHeroes] = useState(INITIAL_HERO);
  const [currentTurn, setCurrentTurn] = useState('player1');
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [gameLog, setGameLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [waitingForReaction, setWaitingForReaction] = useState(false);
  const [pendingAttack, setPendingAttack] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnPhase, setTurnPhase] = useState('draw');
  const [drawnCard, setDrawnCard] = useState(null);
  const [waitingForDiscard, setWaitingForDiscard] = useState(false);
  const [showDrawOption, setShowDrawOption] = useState(false);
  const [drawUsedThisTurn, setDrawUsedThisTurn] = useState(false);
  const [activeBuff, setActiveBuff] = useState(null);
  const [attackSequence, setAttackSequence] = useState([]);
  const [remainingAttacks, setRemainingAttacks] = useState(0);
  const [waitingForNextAttack, setWaitingForNextAttack] = useState(false);
  const [attacksUsedThisTurn, setAttacksUsedThisTurn] = useState(0);

  const generateCard = () => {
    const types = [
      CARD_TYPES.NORMAL_ATTACK, CARD_TYPES.NORMAL_ATTACK,
      CARD_TYPES.HEAVY_ATTACK, CARD_TYPES.NORMAL_MAGIC,
      CARD_TYPES.HEAVY_MAGIC, CARD_TYPES.FOCUS,
      CARD_TYPES.CHARGE, CARD_TYPES.READY,
      CARD_TYPES.FEINT, CARD_TYPES.BLOCK, CARD_TYPES.BLOCK,
      CARD_TYPES.EVADE, CARD_TYPES.COUNTER, CARD_TYPES.DEFLECT
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return { ...randomType, id: Date.now() + Math.random() };
  };

  const drawCardsToFive = (currentHand, playerName) => {
    const cardsToDraw = 5 - currentHand.length;
    if (cardsToDraw <= 0) return currentHand;
    const newCards = Array.from({ length: cardsToDraw }, () => generateCard());
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
    addLog(`${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} draws 1 card. Select a card to discard.`);
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
    setTurnPhase('action');
    addLog('Game started! Both players draw 5 cards.');
    addLog('--- Player 1\'s turn ---');
  };

  const addLog = (message) => setGameLog(prev => [...prev, message]);

  const checkVictory = (newHeroes) => {
    if (newHeroes.player1.hp <= 0) {
      setGameOver(true);
      setWinner('player2');
      addLog('🎉 Player 2 wins!');
      return true;
    }
    if (newHeroes.player2.hp <= 0) {
      setGameOver(true);
      setWinner('player1');
      addLog('🎉 Player 1 wins!');
      return true;
    }
    return false;
  };

  const playBuff = (card) => {
    // Validate buff cards - all require at least 1 attack card
    const currentHand = currentTurn === 'player1' ? player1Hand : player2Hand;
    const attackCards = currentHand.filter(c => c.type === 'attack');
    
    // Ready card requires at least 2 attack cards
    if (card.buffType === 'ready') {
      if (attackCards.length < 2) {
        addLog(`⚠️ Ready card requires at least 2 attack cards in hand! You only have ${attackCards.length}.`);
        setSelectedCard(null);
        return;
      }
    } else {
      // Other buff cards (Focus, Charge, Feint) require at least 1 attack card
      if (attackCards.length < 1) {
        addLog(`⚠️ Buff cards require at least 1 attack card in hand!`);
        setSelectedCard(null);
        return;
      }
    }

    if (currentTurn === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
    }
    setActiveBuff(card);
    addLog(`${card.name} activated, remaining attacks: ${card.extraAttacks}!`);
    const totalAttacks = 1 + card.extraAttacks;
    setRemainingAttacks(totalAttacks);
    addLog(`🔥 ${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} plays ${card.name}! ${totalAttacks} attacks available!`);
    if (card.buffType === 'charge') {
      addLog(`⚠️ Charge: If any attack deals 0 damage, you'll be stunned!`);
    }
    if (card.buffType === 'feint') {
      addLog(`💫 Feint: Attack is unavoidable but -1 damage!`);
    }
  };

  const playAttack = (card) => {
    // Check if player has exceeded their attack limit for this turn
    const maxAttacks = activeBuff ? (1 + activeBuff.extraAttacks) : 1;
    if (attacksUsedThisTurn >= maxAttacks) {
      addLog(`⚠️ Maximum ${maxAttacks} attack${maxAttacks > 1 ? 's' : ''} per turn reached!`);
      return;
    }

    const opponent = currentTurn === 'player1' ? 'player2' : 'player1';
    if (currentTurn === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
    }
    let finalDamage = card.damage;
    let isFeint = false;
    if (activeBuff) {
      finalDamage += activeBuff.damageModifier;
      if( activeBuff.buffType === 'feint') {
        isFeint = true;
      }
    } 
    setPendingAttack({ 
      card: { ...card, damage: finalDamage }, 
      attacker: currentTurn, 
      defender: opponent,
      isFeint
    });
    setWaitingForReaction(true);
    const icon = card.attackType === 'magic' ? '🔮' : '⚔️';
    addLog(`${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} attacks with ${card.name} ${icon} (${finalDamage} damage)${isFeint ? ' [UNAVOIDABLE]' : ''}!`);
    setAttacksUsedThisTurn(prev => prev + 1);
  };

  const resolveAttack = (defenseCard = null) => {
    if (!pendingAttack) return;
    const { card, attacker, defender, isFeint } = pendingAttack;
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
        if (defenseCard.defenseType === 'counter' && card.attackType === 'physical') {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`⚡ Counter! Damage: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else if (defenseCard.defenseType === 'deflect' && card.attackType === 'magic') {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`🔮 Deflect! Damage: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else {
          addLog(`💫 Feint! ${defenseCard.name} has no effect! Get Full Damage 💥!`);
        }
      } else {
        if (defenseCard.defenseType === 'evade') {
          defenderDamage = 0;
          attackEvaded = true;
          addLog(`💨 ${defender === 'player1' ? 'Player 1' : 'Player 2'} evades!`);
        } else if (defenseCard.defenseType === 'counter' && card.attackType === 'physical') {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`⚡ Counter! Damage: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else if (defenseCard.defenseType === 'deflect' && card.attackType === 'magic') {
          defenderDamage = Math.floor(card.damage * 0.5);
          attackerDamage = Math.floor(card.damage * 0.5);
          addLog(`🔮 Deflect! Damage: ${defenderDamage}, Reflect: ${attackerDamage}`);
        } else if (defenseCard.defenseType === 'block') {
          defenderDamage = Math.max(0, card.damage - defenseCard.defense);
          addLog(`🛡️ Blocked! Damage reduced to ${defenderDamage}`);
        } else {
          addLog(`⚠️ ${defenseCard.name} doesn't work on this attack type!`);
        }
      }
    } else {
      addLog(`💥 Full damage!`);
    }

    const newHeroes = {
      player1: {
        ...heroes.player1,
        hp: Math.max(0, heroes.player1.hp - (defender === 'player1' ? defenderDamage : attackerDamage))
      },
      player2: {
        ...heroes.player2,
        hp: Math.max(0, heroes.player2.hp - (defender === 'player2' ? defenderDamage : attackerDamage))
      }
    };

    setHeroes(newHeroes);
    
    if (defenderDamage > 0) {
      addLog(`❤️ ${defender === 'player1' ? 'Player 1' : 'Player 2'}: ${defenderDamage} dmg (HP: ${newHeroes[defender].hp})`);
    }
    if (attackerDamage > 0) {
      addLog(`💢 ${attacker === 'player1' ? 'Player 1' : 'Player 2'}: ${attackerDamage} reflected (HP: ${newHeroes[attacker].hp})`);
    }

    if (activeBuff && activeBuff.buffType === 'charge' && defenderDamage === 0) {
        
      addLog(`⚠️ CHARGE FAIL! 0 damage = stunned next turn!`);
       endTurn();
        
    }

    setWaitingForReaction(false);
    setPendingAttack(null);

    if (checkVictory(newHeroes)) return;

    if (activeBuff && remainingAttacks > 1) {
      setRemainingAttacks(prev => prev - 1);
      setWaitingForNextAttack(true);
      addLog(`🔥 ${remainingAttacks - 1} attacks left!`);
    } else {
      setActiveBuff(null);
      setAttackSequence([]);
      setRemainingAttacks(0);
      setWaitingForNextAttack(false);
      setAttacksUsedThisTurn(0);
      
      // Automatically move to next player's turn
      const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
      setCurrentTurn(nextPlayer);
      if (nextPlayer === 'player1') {
        setPlayer1Hand(drawCardsToFive(player1Hand, 'Player 1'));
      } else {
        setPlayer2Hand(drawCardsToFive(player2Hand, 'Player 2'));
      }
      addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
    }
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
    setSelectedCard(card);
    if (card.type === 'buff') {
      if (activeBuff) {
        addLog('⚠️ Buff already active!');
        setSelectedCard(null);
        return;
      }
      playBuff(card);
    } else if (card.type === 'attack') {
      playAttack(card);
    } else {
      addLog('⚠️ Defense cards only work as reactions!');
      setSelectedCard(null);
    }
  };

  const skipBlock = () => {
    if (waitingForReaction) resolveAttack(null);
  };

  const endTurn = () => {
    setSelectedCard(null);
    setShowDrawOption(true);
    setDrawUsedThisTurn(false);
    setActiveBuff(null);
    setAttackSequence([]);
    setRemainingAttacks(0);
    setWaitingForNextAttack(false);
    setAttacksUsedThisTurn(0);
    addLog('Turn ended.');
  };

  const confirmEndTurn = () => {
    // switch to next player and restore draw option for them
    setShowDrawOption(false);
    const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
    setCurrentTurn(nextPlayer);
    if (nextPlayer === 'player1') {
      setPlayer1Hand(drawCardsToFive(player1Hand, 'Player 1'));
    } else {
      setPlayer2Hand(drawCardsToFive(player2Hand, 'Player 2'));
    }
    // allow the next player to draw & discard if needed
    setShowDrawOption(true);
    setDrawUsedThisTurn(false);
    setAttacksUsedThisTurn(0);
    addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
  };

  const resetGame = () => {
    setHeroes(INITIAL_HERO);
    setCurrentTurn('player1');
    setPlayer1Hand([]);
    setPlayer2Hand([]);
    setSelectedCard(null);
    setGameLog([]);
    setGameOver(false);
    setWinner(null);
    setWaitingForReaction(false);
    setPendingAttack(null);
    setGameStarted(false);
    setDrawnCard(null);
    setWaitingForDiscard(false);
    setShowDrawOption(false);
    setDrawUsedThisTurn(false);
    setActiveBuff(null);
    setAttackSequence([]);
    setRemainingAttacks(0);
    setWaitingForNextAttack(false);
    setAttacksUsedThisTurn(0);
  };

  const getCurrentPlayerHand = () => currentTurn === 'player1' ? player1Hand : player2Hand;
  const displayHand = waitingForReaction 
    ? (pendingAttack.defender === 'player1' ? player1Hand : player2Hand)
    : getCurrentPlayerHand();
  const displayPlayer = waitingForReaction
    ? (pendingAttack.defender === 'player1' ? 'Player 1' : 'Player 2')
    : (currentTurn === 'player1' ? 'Player 1' : 'Player 2');

  const getCardVisual = (card) => {
    if (card.type === 'attack') {
      return {
        color: card.attackType === 'magic' ? 'bg-purple-900 border-purple-600' : 'bg-red-900 border-red-600',
        icon: card.attackType === 'magic' ? '🔮' : '⚔️',
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
      <p className="text-center text-gray-400 mb-8">Phase 3: Buff Cards & Multi-Attack</p>

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

      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 gap-8">
          <div className={`bg-gray-800 p-6 rounded-lg border-4 transition-all ${
            currentTurn === 'player1' && !waitingForReaction ? 'border-blue-500 shadow-lg' : waitingForReaction && pendingAttack?.defender === 'player1' ? 'border-yellow-500 shadow-lg' : 'border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold">Player 1</h3>
              {currentTurn === 'player1' && !waitingForReaction && <span className="text-blue-400 text-sm font-bold">TURN</span>}
              {waitingForReaction && pendingAttack?.defender === 'player1' && <span className="text-yellow-400 text-sm font-bold">DEFEND</span>}
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>HP</span>
                <span className="font-bold">{heroes.player1.hp}/{heroes.player1.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(heroes.player1.hp / heroes.player1.maxHp) * 100}%` }} />
              </div>
            </div>
            <div className="text-sm text-gray-400">🃏 {player1Hand.length} cards</div>
            {currentTurn === 'player1' && activeBuff && (
              <div className="mt-2 text-xs bg-yellow-800 p-2 rounded">
                🔥 {activeBuff.name}: {remainingAttacks} atk left
              </div>
            )}
          </div>

          <div className={`bg-gray-800 p-6 rounded-lg border-4 transition-all ${
            currentTurn === 'player2' && !waitingForReaction ? 'border-red-500 shadow-lg' : waitingForReaction && pendingAttack?.defender === 'player2' ? 'border-yellow-500 shadow-lg' : 'border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold">Player 2</h3>
              {currentTurn === 'player2' && !waitingForReaction && <span className="text-red-400 text-sm font-bold">TURN</span>}
              {waitingForReaction && pendingAttack?.defender === 'player2' && <span className="text-yellow-400 text-sm font-bold">DEFEND</span>}
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>HP</span>
                <span className="font-bold">{heroes.player2.hp}/{heroes.player2.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(heroes.player2.hp / heroes.player2.maxHp) * 100}%` }} />
              </div>
            </div>
            <div className="text-sm text-gray-400">🃏 {player2Hand.length} cards</div>
            {currentTurn === 'player2' && activeBuff && (
              <div className="mt-2 text-xs bg-yellow-800 p-2 rounded">
                🔥 {activeBuff.name}: {remainingAttacks} atk left
              </div>
            )}
          </div>
        </div>
      </div>

      {!gameOver && (
        <div className="max-w-6xl mx-auto mb-8 text-center">
          {!gameStarted && (
            <button onClick={startGame} className="bg-green-600 hover:bg-green-700 px-12 py-4 rounded-lg font-bold text-2xl">
              Start Game
            </button>
          )}

          {waitingForReaction && pendingAttack && (
            <div className="bg-yellow-900 p-6 rounded-lg border-2 border-yellow-500">
              <p className="text-xl mb-4 font-bold">⚡ {pendingAttack.defender === 'player1' ? 'Player 1' : 'Player 2'}: Defend?</p>
              <button onClick={skipBlock} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold">
                Take Damage
              </button>
            </div>
          )}

          {gameStarted && !waitingForReaction && !gameOver && !waitingForNextAttack && (
            <div className="space-y-3">
              {/* End Turn button hidden - players must use all buff attacks first */}
              {!showDrawOption && !waitingForDiscard && (
                <div>
                  <button onClick={confirmEndTurn} className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold">
                    End Turn
                  </button>
                </div>
              )}
              {showDrawOption && getCurrentPlayerHand().length === 5 && !waitingForDiscard && !drawUsedThisTurn && (
                <div>
                <button onClick={drawOneAndDiscard} className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg font-bold">
                  Draw & Discard
                </button>
                </div>
              )}
              {showDrawOption && !waitingForDiscard && (
                <button onClick={confirmEndTurn} className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold">
                  Pass Turn
                </button>
              )}
              {waitingForDiscard && (
                <div className="bg-orange-900 p-4 rounded-lg">
                  <p className="font-bold">🃏 Select card to discard</p>
                </div>
              )}
           
            </div>
          )}

          {waitingForNextAttack && (
            <div className="bg-amber-900 p-4 rounded-lg border-2 border-amber-500">
              <p className="font-bold">🔥 {remainingAttacks} attacks remaining - play another attack!</p>
            </div>
          )}
        </div>
      )}

      {displayHand.length > 0 && !gameOver && gameStarted && (
        <div className="max-w-6xl mx-auto mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">
            {displayPlayer}'s Hand
            {waitingForReaction && <span className="text-yellow-400 ml-2">(Defend)</span>}
            {waitingForDiscard && <span className="text-orange-400 ml-2">(Discard)</span>}
          </h3>
          <div className="flex gap-4 justify-center flex-wrap">
            {displayHand.map((card) => {
              const isPlayable = waitingForDiscard ? true : waitingForReaction ? card.type === 'defense' : (card.type === 'attack' || (card.type === 'buff' && !activeBuff));
              const isNewlyDrawn = drawnCard && card.id === drawnCard.id;
              const visual = getCardVisual(card);
              
              return (
                <button
                  key={card.id}
                  onClick={() => playCard(card)}
                  disabled={!waitingForDiscard && !isPlayable}
                  className={`p-6 rounded-lg border-2 min-w-[140px] ${visual.color} ${
                    !waitingForDiscard && !isPlayable ? 'opacity-40' : 'hover:scale-105'
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

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gray-800 p-4 rounded-lg border-2 border-gray-700">
          <h4 className="font-bold mb-2">Buff Cards</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>🔥 <b>Focus:</b> +1 attack</div>
            <div>⚡ <b>Charge:</b> +2 attacks (risk: stun if 0 dmg)</div>
            <div>💫 <b>Feint:</b> Unavoidable, -1 damage</div>
            <div>🎯 <b>Ready:</b> +1 attack (class bonus)</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold mb-4">📜 Game Log</h3>
        <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto border-2 border-gray-700">
          {gameLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Game not started</p>
          ) : (
            gameLog.map((log, i) => <p key={i} className="text-sm text-gray-300 mb-1">{log}</p>)
          )}
        </div>
      </div>

      {!gameOver && gameStarted && (
        <div className="max-w-6xl mx-auto mt-4 text-center">
          <button onClick={resetGame} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm">
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;