// Initial State Model
import { JOB_CLASSES } from './jobClasses';

export const createInitialHeroes = () => ({
  player1: [
    { id: 1, name: 'Swordman', job: JOB_CLASSES.MELEE, hp: 60, maxHp: 60, defeated: false, statusEffects: [], shield: 0 },
    { id: 2, name: 'Archer', job: JOB_CLASSES.RANGED, hp: 45, maxHp: 45, defeated: false, statusEffects: [], shield: 0 },
    { id: 3, name: 'Wizard', job: JOB_CLASSES.MAGE, hp: 40, maxHp: 40, defeated: false, statusEffects: [], shield: 0 }
  ],
  player2: [
    { id: 4, name: 'Warrior', job: JOB_CLASSES.MELEE, hp: 60, maxHp: 60, defeated: false, statusEffects: [], shield: 0 },
    { id: 5, name: 'Gunner', job: JOB_CLASSES.RANGED, hp: 40, maxHp: 40, defeated: false, statusEffects: [], shield: 0 },
    { id: 6, name: 'Cleric', job: JOB_CLASSES.SUPPORT, hp: 40, maxHp: 40, defeated: false, statusEffects: [], shield: 0 }
  ]
});

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
