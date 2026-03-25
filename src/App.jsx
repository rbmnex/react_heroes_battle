import { useState } from 'react';
// Models
import { STATUS_EFFECTS } from './models/statusEffects';
import { CARD_TYPES } from './models/cardTypes';
import { JOB_CLASSES } from './models/jobClasses';
import { getSkillsForJobClass } from './models/heroSkills';
import { createInitialHeroes } from './models/initialState';
import { createHeroesFromSelection } from './models/heroesModel';
// Utilities
import { checkVictory, canHeroUseCard, processStatusEffects } from './utils/gameLogic';
import { drawCardsToFive, generateCard } from './utils/cardGeneration';
import { getCardVisual } from './utils/cardVisuals';
// Controllers
import { playBuffController } from './controllers/attackController';
import { playAttackController, drawOneAndDiscardController, discardCardController } from './controllers/cardController';
import { resolveAttackController } from './controllers/damageController';
import { selectSupportTargetController } from './controllers/supportController';
import { confirmEndTurnController } from './controllers/turnController';
import { checkHandForPotentialSkills } from './controllers/skillController';
// Components
import Battlefield from './components/Battlefield';
import Hand from './components/Hand';
import BattleLog from './components/BattleLog';
import Controls from './components/Controls';
import GameOverModal from './components/GameOverModal';
import StatusBanners from './components/StatusBanners';
import SkillIndicator from './components/Skillindicator';
import { SkillIndicatorWithTooltip } from './components/Skilltooltip';
import HeroSelection from './components/HeroSelection';

function App() {
  // State Management - using plain useState hooks organized by feature
  const [gamePhase, setGamePhase] = useState('selection'); // 'selection' | 'playing'
  const [player1Picks, setPlayer1Picks] = useState([]);
  const [player2Picks, setPlayer2Picks] = useState([]);
  const [selectionTurn, setSelectionTurn] = useState('player1');

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
  const [supportHistory, setSupportHistory] = useState([]);
  
  // Skill System State
  const [triggeredSkill, setTriggeredSkill] = useState(null);
  const [skillIndicatorVisible, setSkillIndicatorVisible] = useState(false);

  // Helper Functions
  const addLog = (message) => setGameLog(prev => [...prev, message]);
  const getActiveHero = () => {
    const team = heroes[currentTurn];
    return team[activeHeroIndex];
  };
  const getCurrentPlayerHand = () => currentTurn === 'player1' ? player1Hand : player2Hand;

  // Hero Selection
  const handlePickHero = (hero) => {
    if (selectionTurn === 'player1') {
      const newPicks = [...player1Picks, hero];
      setPlayer1Picks(newPicks);
      setSelectionTurn('player2');
    } else {
      const newPicks = [...player2Picks, hero];
      setPlayer2Picks(newPicks);
      setSelectionTurn('player1');
    }
  };

  // Game Initialization
  const startGame = () => {
    const selectedHeroes = createHeroesFromSelection(player1Picks, player2Picks);
    const p1Cards = drawCardsToFive([], 'player1', selectedHeroes, addLog);
    const p2Cards = drawCardsToFive([], 'player2', selectedHeroes, addLog);
    setHeroes(selectedHeroes);
    setPlayer1Hand(p1Cards);
    setPlayer2Hand(p2Cards);
    setGameStarted(true);
    setGamePhase('playing');
    addLog('Game started! 3v3 Battle begins!');
    addLog('--- Player 1\'s turn ---');
  };

  const resetGame = () => {
    setGamePhase('selection');
    setPlayer1Picks([]);
    setPlayer2Picks([]);
    setSelectionTurn('player1');
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
    setSupportHistory([]);
    setTriggeredSkill(null);
    setSkillIndicatorVisible(false);
  };

  // CARD MANAGEMENT via controllers
  const handleDrawOneAndDiscard = () => {
    drawOneAndDiscardController(
      currentTurn,
      activeHeroIndex,
      heroes,
      player1Hand,
      setPlayer1Hand,
      player2Hand,
      setPlayer2Hand,
      setDrawnCard,
      setDrawUsedThisTurn,
      setWaitingForDiscard,
      drawUsedThisTurn,
      addLog
    );
  };

  const handleDiscardCard = (card) => {
    discardCardController(
      card,
      currentTurn,
      player1Hand,
      setPlayer1Hand,
      player2Hand,
      setPlayer2Hand,
      setDrawnCard,
      setWaitingForDiscard,
      waitingForDiscard,
      addLog
    );
  };

  // BUFF PLAY via controller
  const handlePlayBuff = (card) => {
    playBuffController(
      card,
      currentTurn,
      activeHeroIndex,
      heroes,
      player1Hand,
      setPlayer1Hand,
      player2Hand,
      setPlayer2Hand,
      setActiveBuff,
      setRemainingAttacks,
      activeBuff,
      addLog
    );
  };

  // ATTACK PLAY via controller
  const handlePlayAttack = (card, targetHeroId = null) => {
    playAttackController(
      card,
      targetHeroId,
      currentTurn,
      activeHeroIndex,
      heroes,
      player1Hand,
      setPlayer1Hand,
      player2Hand,
      setPlayer2Hand,
      activeBuff,
      heroAttackCounts,
      setPendingAttackCard,
      setSelectingTarget,
      setPendingAttack,
      setWaitingForReaction,
      setIsFirstAttackOfHero,
      setHeroAttackCounts,
      setTriggeredSkill,
      setSkillIndicatorVisible,
      addLog
    );
  };

  // DAMAGE RESOLUTION via controller
  const handleResolveAttack = (defenseCard = null) => {
    resolveAttackController(
      defenseCard,
      player1Hand,
      setPlayer1Hand,
      player2Hand,
      setPlayer2Hand,
      currentTurn,
      heroes,
      setHeroes,
      pendingAttack,
      activeBuff,
      remainingAttacks,
      setActiveBuff,
      setRemainingAttacks,
      setWaitingForReaction,
      setPendingAttack,
      setWaitingForNextAttack,
      setSelectingTarget,
      setPendingAttackCard,
      addLog,
      checkVictory,
      setGameOver,
      setWinner
    );
  };

  // SUPPORT & TARGET SELECTION 
  const handleSelectTarget = (heroId) => {
    // Handle support card targeting via controller
    if (selectingSupportTarget && pendingSupportCard) {
      selectSupportTargetController(
        heroId,
        pendingSupportCard,
        currentTurn,
        activeHeroIndex,
        heroes,
        setHeroes,
        setSelectingSupportTarget,
        setPendingSupportCard,
        setHeroSupportCounts,
        player1Hand,
        setPlayer1Hand,
        player2Hand,
        setPlayer2Hand,
        addLog,
        supportHistory,
        setSupportHistory,
        setTriggeredSkill,
        setSkillIndicatorVisible
      );
      return;
    }
    
    // Handle attack target selection (non-controller path for now)
    if (!selectingTarget || !pendingAttackCard) return;
    handlePlayAttack(pendingAttackCard, heroId);
  };

  // TURN END via controller
  const handleConfirmEndTurn = () => {
    confirmEndTurnController(
      currentTurn,
      heroes,
      setHeroes,
      player1Hand,
      setPlayer1Hand,
      player2Hand,
      setPlayer2Hand,
      setCurrentTurn,
      setActiveHeroIndex,
      setDrawUsedThisTurn,
      setActiveBuff,
      setRemainingAttacks,
      setWaitingForNextAttack,
      setTurnCount,
      setHeroAttackCounts,
      setHeroSupportCounts,
      setIsFirstAttackOfHero,
      setSupportHistory,
      setGameOver,
      setWinner,
      addLog
    );
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

  // Compute map of card name → skill for cards that can trigger skills
  const potentialSkillsByCardName = {};
  if (gameStarted && !waitingForReaction && !waitingForDiscard) {
    const activeHero = getActiveHero();
    if (activeHero) {
      const hand = getCurrentPlayerHand();
      const potentialSkills = checkHandForPotentialSkills(activeHero, hand, activeBuff);
      potentialSkills.forEach(skill => {
        const trigger = skill.trigger;
        if (trigger.type === 'buff+attack' || trigger.type === 'elemental+heavy' || trigger.type === 'buff+multi-attack') {
          const cardName = CARD_TYPES[trigger.requiredAttack]?.name;
          if (cardName) potentialSkillsByCardName[cardName] = skill;
        } else if (trigger.type === 'multi-card' || trigger.type === 'multi-magic') {
          const cardName = CARD_TYPES[trigger.requiredCard]?.name;
          if (cardName) potentialSkillsByCardName[cardName] = skill;
        } else if (trigger.type === 'conditional') {
          // Highlight any attack card for conditional skills
          hand.forEach(c => {
            if (c.type === 'attack') potentialSkillsByCardName[c.name] = skill;
          });
        }
      });
    }
  }

  // Show hero selection phase
  if (gamePhase === 'selection') {
    return (
      <HeroSelection
        player1Picks={player1Picks}
        player2Picks={player2Picks}
        selectionTurn={selectionTurn}
        onPickHero={handlePickHero}
        onStartGame={startGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex gap-6">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-center mb-2">Tactical Hero Card Battle</h1>
          <p className="text-center text-gray-400 mb-4">MVC Architecture Refactoring</p>
        </div>

        <GameOverModal gameOver={gameOver} winner={winner} resetGame={resetGame} />
        
        {/* <SkillIndicator 
          skill={triggeredSkill} 
          visible={skillIndicatorVisible} 
        /> */}
        <SkillIndicatorWithTooltip
          skill={triggeredSkill}
          visible={skillIndicatorVisible}
          onClose={() => setSkillIndicatorVisible(false)}
        />

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
          potentialSkillsByCardName={potentialSkillsByCardName}
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