// Initial State Model
import { createAllHeroes } from './heroesModel';

export const createInitialHeroes = () => createAllHeroes();

export const createInitialGameState = () => ({
  heroes: createInitialHeroes(),
  currentTurn: 'player1',
  activeHeroIndex: 0,
  player1Hand: [],
  player2Hand: [],
  gameLog: [],
  gameOver: false,
  winner: null,
  waitingForReaction: false,
  pendingAttack: null,
  gameStarted: false,
  drawnCard: null,
  waitingForDiscard: false,
  drawUsedThisTurn: false,
  activeBuff: null,
  remainingAttacks: 0,
  waitingForNextAttack: false,
  attacksUsedThisTurn: 0,
  selectingTarget: false,
  pendingAttackCard: null,
  pendingSupportCard: null,
  selectingSupportTarget: false,
  turnCount: 0,
  heroAttackCounts: {},
  heroSupportCounts: {},
  isFirstAttackOfHero: false,
  statusEffectLog: []
});
