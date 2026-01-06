import { useState } from 'react';

// Card data with attack types
const CARD_TYPES = {
  // Physical Attacks
  NORMAL_ATTACK: { name: 'Normal Attack', damage: 4, type: 'attack', attackType: 'physical' },
  HEAVY_ATTACK: { name: 'Heavy Attack', damage: 6, type: 'attack', attackType: 'physical' },
  
  // Magic Attacks
  NORMAL_MAGIC: { name: 'Normal Magic', damage: 4, type: 'attack', attackType: 'magic' },
  HEAVY_MAGIC: { name: 'Heavy Magic', damage: 6, type: 'attack', attackType: 'magic' },
  
  // Defense Cards
  BLOCK: { name: 'Block', defense: 4, type: 'defense', defenseType: 'block' },
  EVADE: { name: 'Evade', defense: 999, type: 'defense', defenseType: 'evade' },
  COUNTER: { name: 'Counter', defense: 0, type: 'defense', defenseType: 'counter', counterType: 'physical' },
  DEFLECT: { name: 'Deflect', defense: 0, type: 'defense', defenseType: 'deflect', counterType: 'magic' }
};

// Initial game state
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

  // Generate random card
  const generateCard = () => {
    const types = [
      CARD_TYPES.NORMAL_ATTACK,
      CARD_TYPES.NORMAL_ATTACK,
      CARD_TYPES.HEAVY_ATTACK,
      CARD_TYPES.NORMAL_MAGIC,
      CARD_TYPES.HEAVY_MAGIC,
      CARD_TYPES.BLOCK,
      CARD_TYPES.BLOCK,
      CARD_TYPES.EVADE,
      CARD_TYPES.COUNTER,
      CARD_TYPES.DEFLECT
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return { ...randomType, id: Date.now() + Math.random() };
  };

  // Draw cards to fill hand to 5
  const drawCardsToFive = (currentHand, playerName) => {
    const cardsToDraw = 5 - currentHand.length;
    if (cardsToDraw <= 0) return currentHand;

    const newCards = Array.from({ length: cardsToDraw }, () => generateCard());
    addLog(`${playerName} draws ${cardsToDraw} card${cardsToDraw > 1 ? 's' : ''}.`);
    return [...currentHand, ...newCards];
  };

  // Draw one card and prepare to discard
  const drawOneAndDiscard = () => {
    if (drawUsedThisTurn) return; // Prevent using draw more than once per turn
    
    const newCard = generateCard();
    setDrawnCard(newCard);
    setDrawUsedThisTurn(true); // Mark draw as used this turn
    
    if (currentTurn === 'player1') {
      setPlayer1Hand(prev => [...prev, newCard]);
    } else {
      setPlayer2Hand(prev => [...prev, newCard]);
    }
    
    setWaitingForDiscard(true);
    addLog(`${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} draws 1 card. Select a card to discard.`);
  };

  // Discard selected card
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

  // Start game
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

  // Add message to game log
  const addLog = (message) => {
    setGameLog(prev => [...prev, message]);
  };

  // Check victory
  const checkVictory = (newHeroes) => {
    if (newHeroes.player1.hp <= 0) {
      setGameOver(true);
      setWinner('player2');
      addLog('ðŸŽ‰ Player 2 wins! Player 1\'s hero defeated!');
      return true;
    }
    if (newHeroes.player2.hp <= 0) {
      setGameOver(true);
      setWinner('player1');
      addLog('ðŸŽ‰ Player 1 wins! Player 2\'s hero defeated!');
      return true;
    }
    return false;
  };

  // Play attack card
  const playAttack = (card) => {
    const opponent = currentTurn === 'player1' ? 'player2' : 'player1';
    
    if (currentTurn === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== card.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== card.id));
    }
    
    setPendingAttack({ card, attacker: currentTurn, defender: opponent });
    setWaitingForReaction(true);
    
    const attackIcon = card.attackType === 'magic' ? 'ðŸ”®' : 'âš”ï¸';
    addLog(`${currentTurn === 'player1' ? 'Player 1' : 'Player 2'} plays ${card.name} ${attackIcon} (${card.damage} ${card.attackType} damage)!`);
    addLog(`âš¡ ${opponent === 'player1' ? 'Player 1' : 'Player 2'} can defend!`);
  };

  // Defender chooses to block or take damage
  const resolveAttack = (defenseCard = null) => {
    if (!pendingAttack) return;

    const { card, attacker, defender } = pendingAttack;
    let defenderDamage = card.damage;
    let attackerDamage = 0;
    let attackEvaded = false;

    if (defenseCard) {
      // Remove defense card from defender's hand
      if (defender === 'player1') {
        setPlayer1Hand(prev => prev.filter(c => c.id !== defenseCard.id));
      } else {
        setPlayer2Hand(prev => prev.filter(c => c.id !== defenseCard.id));
      }

      // Handle different defense types
      if (defenseCard.defenseType === 'evade') {
        defenderDamage = 0;
        attackEvaded = true;
        addLog(`ðŸ’¨ ${defender === 'player1' ? 'Player 1' : 'Player 2'} uses Evade! Attack completely avoided!`);
      } else if (defenseCard.defenseType === 'counter' && card.attackType === 'physical') {
        // Counter reduces incoming damage by 50% and reflects 50% back
        defenderDamage = Math.floor(card.damage * 0.5);
        attackerDamage = Math.floor(card.damage * 0.5);
        addLog(`âš¡ ${defender === 'player1' ? 'Player 1' : 'Player 2'} uses Counter! Reduces damage to ${defenderDamage} and reflects ${attackerDamage} damage back!`);
      } else if (defenseCard.defenseType === 'deflect' && card.attackType === 'magic') {
        // Deflect reduces incoming damage by 50% and reflects 50% back
        defenderDamage = Math.floor(card.damage * 0.5);
        attackerDamage = Math.floor(card.damage * 0.5);
        addLog(`ðŸ”® ${defender === 'player1' ? 'Player 1' : 'Player 2'} uses Deflect! Reduces magic damage to ${defenderDamage} and reflects ${attackerDamage} damage back!`);
      } else if (defenseCard.defenseType === 'block') {
        // Block reduces damage
        defenderDamage = Math.max(0, card.damage - defenseCard.defense);
        addLog(`ðŸ›¡ï¸ ${defender === 'player1' ? 'Player 1' : 'Player 2'} blocks with ${defenseCard.name}! Damage reduced to ${defenderDamage}.`);
      } else if (defenseCard.defenseType === 'counter' && card.attackType === 'magic') {
        addLog(`âš ï¸ Counter doesn't work against magic attacks! Full damage taken.`);
      } else if (defenseCard.defenseType === 'deflect' && card.attackType === 'physical') {
        addLog(`âš ï¸ Deflect doesn't work against physical attacks! Full damage taken.`);
      }
    } else {
      addLog(`ðŸ’¥ ${defender === 'player1' ? 'Player 1' : 'Player 2'} takes full damage!`);
    }

    // Apply damage to both heroes
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
    
    if (defenderDamage > 0 && !attackEvaded) {
      addLog(`â¤ï¸ ${defender === 'player1' ? 'Player 1' : 'Player 2'} takes ${defenderDamage} damage! (HP: ${newHeroes[defender].hp}/${newHeroes[defender].maxHp})`);
    } else if (attackEvaded) {
      addLog(`âœ“ Attack fully evaded! No damage taken.`);
    } else if (defenderDamage === 0) {
      addLog(`âœ“ Attack fully blocked! No damage taken.`);
    }

    if (attackerDamage > 0) {
      addLog(`ðŸ’¢ ${attacker === 'player1' ? 'Player 1' : 'Player 2'} takes ${attackerDamage} reflected damage! (HP: ${newHeroes[attacker].hp}/${newHeroes[attacker].maxHp})`);
    }

    setWaitingForReaction(false);
    setPendingAttack(null);

    if (!checkVictory(newHeroes)) {
      endTurn();
    }
  };

  // Play selected card
  const playCard = (card) => {
    if (gameOver) return;
    
    if (waitingForDiscard) {
      discardCard(card);
      return;
    }
    
    if (waitingForReaction) {
      const defender = pendingAttack.defender;
      const actingPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
      
      if (actingPlayer !== defender) {
        return;
      }
      if (card.type !== 'defense') {
        addLog('âš ï¸ You can only play defense cards as reactions!');
        return;
      }
      resolveAttack(card);
      return;
    }

    setSelectedCard(card);

    if (card.type === 'attack') {
      playAttack(card);
    } else {
      addLog('âš ï¸ Defense cards can only be played as reactions during opponent\'s attacks!');
      setSelectedCard(null);
    }
  };

  // Skip blocking
  const skipBlock = () => {
    if (waitingForReaction) {
      resolveAttack(null);
    }
  };

  // End turn
  const endTurn = () => {
    setSelectedCard(null);
    setShowDrawOption(true);
    setDrawUsedThisTurn(false); // Reset draw usage for next turn
    addLog('End turn confirmed. Choose to draw or pass to next player.');
  };

  // Confirm end of turn
  const confirmEndTurn = () => {
    setShowDrawOption(false);
    const nextPlayer = currentTurn === 'player1' ? 'player2' : 'player1';
    setCurrentTurn(nextPlayer);
    setTurnPhase('draw');
    
    if (nextPlayer === 'player1') {
      const newHand = drawCardsToFive(player1Hand, 'Player 1');
      setPlayer1Hand(newHand);
    } else {
      const newHand = drawCardsToFive(player2Hand, 'Player 2');
      setPlayer2Hand(newHand);
    }
    
    setTurnPhase('action');
    addLog(`--- ${nextPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn ---`);
  };

  // Reset game
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
    setTurnPhase('draw');
    setDrawnCard(null);
    setWaitingForDiscard(false);
    setShowDrawOption(false);
    setDrawUsedThisTurn(false); // Reset draw usage when game resets
  };

  const getCurrentPlayerHand = () => currentTurn === 'player1' ? player1Hand : player2Hand;
  
  const displayHand = waitingForReaction 
    ? (pendingAttack.defender === 'player1' ? player1Hand : player2Hand)
    : getCurrentPlayerHand();

  const displayPlayer = waitingForReaction
    ? (pendingAttack.defender === 'player1' ? 'Player 1' : 'Player 2')
    : (currentTurn === 'player1' ? 'Player 1' : 'Player 2');

  // Get card visual info
  const getCardVisual = (card) => {
    if (card.type === 'attack') {
      return {
        color: card.attackType === 'magic' ? 'bg-purple-900 border-purple-600 hover:bg-purple-800' : 'bg-red-900 border-red-600 hover:bg-red-800',
        icon: card.attackType === 'magic' ? 'ðŸ”®' : 'âš”ï¸',
        label: card.damage
      };
    } else {
      let color = 'bg-blue-900 border-blue-600 hover:bg-blue-800';
      let icon = 'ðŸ›¡ï¸';
      
      if (card.defenseType === 'evade') {
        color = 'bg-cyan-900 border-cyan-600 hover:bg-cyan-800';
        icon = 'ðŸ’¨';
      } else if (card.defenseType === 'counter') {
        color = 'bg-orange-900 border-orange-600 hover:bg-orange-800';
        icon = 'âš¡';
      } else if (card.defenseType === 'deflect') {
        color = 'bg-pink-900 border-pink-600 hover:bg-pink-800';
        icon = 'ðŸ”®';
      }
      
      return {
        color,
        icon,
        label: card.defenseType === 'evade' ? 'EVADE' : card.defenseType === 'counter' ? 'COUNTER' : card.defenseType === 'deflect' ? 'DEFLECT' : card.defense
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-2">Tactical Hero Card Battle</h1>
      <p className="text-center text-gray-400 mb-8">Phase 2: Advanced Reactions (Counter, Deflect, Evade)</p>

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-4 border-yellow-500">
            <h2 className="text-4xl font-bold mb-6">
              {winner === 'player1' ? 'ðŸŽ‰ Player 1 Wins!' : 'ðŸŽ‰ Player 2 Wins!'}
            </h2>
            <p className="text-xl text-gray-300 mb-6">Victory!</p>
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Battlefield */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 gap-8">
          <div className={`bg-gray-800 p-6 rounded-lg border-4 transition-all ${
            currentTurn === 'player1' && !waitingForReaction
              ? 'border-blue-500 shadow-lg shadow-blue-500/50' 
              : waitingForReaction && pendingAttack?.defender === 'player1'
              ? 'border-yellow-500 shadow-lg shadow-yellow-500/50'
              : 'border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold">Player 1</h3>
              {currentTurn === 'player1' && !waitingForReaction && (
                <span className="text-blue-400 text-sm font-bold">TURN</span>
              )}
              {waitingForReaction && pendingAttack?.defender === 'player1' && (
                <span className="text-yellow-400 text-sm font-bold">DEFENDING</span>
              )}
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>HP</span>
                <span className="font-bold">{heroes.player1.hp}/{heroes.player1.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${(heroes.player1.hp / heroes.player1.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              ðŸƒ Cards: {player1Hand.length}
            </div>
          </div>

          <div className={`bg-gray-800 p-6 rounded-lg border-4 transition-all ${
            currentTurn === 'player2' && !waitingForReaction
              ? 'border-red-500 shadow-lg shadow-red-500/50' 
              : waitingForReaction && pendingAttack?.defender === 'player2'
              ? 'border-yellow-500 shadow-lg shadow-yellow-500/50'
              : 'border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold">Player 2</h3>
              {currentTurn === 'player2' && !waitingForReaction && (
                <span className="text-red-400 text-sm font-bold">TURN</span>
              )}
              {waitingForReaction && pendingAttack?.defender === 'player2' && (
                <span className="text-yellow-400 text-sm font-bold">DEFENDING</span>
              )}
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>HP</span>
                <span className="font-bold">{heroes.player2.hp}/{heroes.player2.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${(heroes.player2.hp / heroes.player2.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              ðŸƒ Cards: {player2Hand.length}
            </div>
          </div>
        </div>
      </div>

      {/* Turn Controls */}
      {!gameOver && (
        <div className="max-w-6xl mx-auto mb-8 text-center">
          {!gameStarted && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 px-12 py-4 rounded-lg font-bold text-2xl shadow-lg"
            >
              Start Game
            </button>
          )}

          {waitingForReaction && pendingAttack && (
            <div className="bg-yellow-900 p-6 rounded-lg border-2 border-yellow-500">
              <p className="text-xl mb-4 font-bold">
                âš¡ {pendingAttack.defender === 'player1' ? 'Player 1' : 'Player 2'}: Defend or take the hit?
              </p>
              <button
                onClick={skipBlock}
                className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold text-lg"
              >
                Take Damage
              </button>
            </div>
          )}

          {gameStarted && !waitingForReaction && !gameOver && (
            <div className="mt-4 space-y-3">
              {!showDrawOption && !waitingForDiscard && (
                <div>
                  <button
                    onClick={endTurn}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold text-lg"
                  >
                    End Turn
                  </button>
                </div>
              )}

              {showDrawOption && getCurrentPlayerHand().length === 5 && !waitingForDiscard && !drawUsedThisTurn && (
                <div>
                  <button
                    onClick={drawOneAndDiscard}
                    className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg font-bold text-lg"
                  >
                    Draw 1 & Discard 1
                  </button>
                </div>
              )}

              {showDrawOption && !waitingForDiscard && (
                <div>
                  <button
                    onClick={confirmEndTurn}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold text-lg"
                  >
                    Pass to Next Player
                  </button>
                </div>
              )}

              {waitingForDiscard && (
                <div className="bg-orange-900 p-4 rounded-lg border-2 border-orange-500">
                  <p className="text-lg font-bold text-orange-200">
                    ðŸƒ Select a card to discard
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hand */}
      {displayHand.length > 0 && !gameOver && gameStarted && (
        <div className="max-w-6xl mx-auto mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">
            {displayPlayer}'s Hand
            {waitingForReaction && <span className="text-yellow-400 ml-2">(Use defense cards)</span>}
            {waitingForDiscard && <span className="text-orange-400 ml-2">(Discard a card)</span>}
          </h3>
          <div className="flex gap-4 justify-center flex-wrap">
            {displayHand.map((card) => {
              const isPlayable = waitingForDiscard 
                ? true
                : waitingForReaction 
                ? card.type === 'defense'
                : card.type === 'attack';
              
              const isNewlyDrawn = drawnCard && card.id === drawnCard.id;
              const visual = getCardVisual(card);
              
              return (
                <button
                  key={card.id}
                  onClick={() => playCard(card)}
                  disabled={!waitingForDiscard && !isPlayable}
                  className={`p-6 rounded-lg border-2 transition-all min-w-[140px] ${visual.color} ${
                    !waitingForDiscard && !isPlayable ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
                  } ${selectedCard?.id === card.id ? 'ring-4 ring-yellow-400' : ''} ${
                    isNewlyDrawn ? 'ring-4 ring-green-400 animate-pulse' : ''
                  }`}
                >
                  <div className="font-bold text-lg mb-2">
                    {card.name}
                    {isNewlyDrawn && <span className="text-green-400 ml-1">âœ¨</span>}
                  </div>
                  <div className="text-2xl font-bold">
                    {visual.icon} {visual.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {card.type === 'attack' ? card.attackType.toUpperCase() : card.defenseType.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Legend */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gray-800 p-4 rounded-lg border-2 border-gray-700">
          <h4 className="font-bold mb-2 text-center">Card Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-red-400">âš”ï¸ Physical Attack</span> - Counter vulnerable</div>
            <div><span className="text-purple-400">ðŸ”® Magic Attack</span> - Deflect vulnerable</div>
            <div><span className="text-blue-400">ðŸ›¡ï¸ Block</span> - Reduces damage by 3</div>
            <div><span className="text-cyan-400">ðŸ’¨ Evade</span> - Completely avoids attack</div>
            <div><span className="text-orange-400">âš¡ Counter</span> - Reflects 50% physical dmg</div>
            <div><span className="text-pink-400">ðŸ”® Deflect</span> - Reflects 50% magic dmg</div>
          </div>
        </div>
      </div>

      {/* Game Log */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold mb-4">ðŸ“œ Game Log</h3>
        <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto border-2 border-gray-700">
          {gameLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Waiting for game to start...</p>
          ) : (
            gameLog.map((log, i) => (
              <p key={i} className="text-sm text-gray-300 mb-1 font-mono">
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {!gameOver && gameStarted && (
        <div className="max-w-6xl mx-auto mt-4 text-center">
          <button
            onClick={resetGame}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm"
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
