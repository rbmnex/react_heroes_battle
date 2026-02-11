// Heroes Model - Centralized hero definitions and utilities
import { JOB_CLASSES } from './jobClasses';

// Import hero images
import swordmanImage from '../assets/models/swordman_square.png';
import archerImage from '../assets/models/archer_square.png';
import wizardImage from '../assets/models/wizard_square.png';
import warriorImage from '../assets/models/warrior_square.png';
import gunnerImage from '../assets/models/gunner_square.png';
import clericImage from '../assets/models/cleric_square.png';

/**
 * HEROES DATABASE
 * All hero definitions organized by team
 */
export const HEROES = {
  // Player 1 Team
  SWORDMAN: {
    id: 1,
    name: 'Swordman',
    team: 'player1',
    job: JOB_CLASSES.MELEE,
    maxHp: 60,
    description: 'A strong melee fighter with high HP',
    image: swordmanImage
  },
  ARCHER: {
    id: 2,
    name: 'Archer',
    team: 'player1',
    job: JOB_CLASSES.RANGED,
    maxHp: 40,
    description: 'Precise ranged attacker',
    image: archerImage
  },
  WIZARD: {
    id: 3,
    name: 'Wizard',
    team: 'player1',
    job: JOB_CLASSES.MAGE,
    maxHp: 40,
    description: 'Powerful mage with elemental magic',
    image: wizardImage
  },

  // Player 2 Team
  WARRIOR: {
    id: 4,
    name: 'Warrior',
    team: 'player2',
    job: JOB_CLASSES.MELEE,
    maxHp: 65,
    description: 'A tough melee combatant',
    image: warriorImage
  },
  GUNNER: {
    id: 5,
    name: 'Gunner',
    team: 'player2',
    job: JOB_CLASSES.RANGED,
    maxHp: 40,
    description: 'Skilled gunner with high damage',
    image: gunnerImage
  },
  CLERIC: {
    id: 6,
    name: 'Cleric',
    team: 'player2',
    job: JOB_CLASSES.SUPPORT,
    maxHp: 35,
    description: 'Healer and support specialist',
    image: clericImage
  }
};

/**
 * HERO TEAMS CONFIGURATION
 * Organized by team for easy access
 */
export const HERO_TEAMS = {
  player1: [HEROES.WARRIOR, HEROES.ARCHER, HEROES.WIZARD],
  player2: [HEROES.SWORDMAN, HEROES.GUNNER, HEROES.CLERIC]
};

/**
 * Helper function to create a hero instance with game state properties
 * @param {Object} heroDefinition - Hero definition from HEROES object
 * @returns {Object} Hero instance with initial game state
 */
export const createHeroInstance = (heroDefinition) => ({
  id: heroDefinition.id,
  name: heroDefinition.name,
  job: heroDefinition.job,
  maxHp: heroDefinition.maxHp,
  image: heroDefinition.image,
  hp: heroDefinition.maxHp,
  defeated: false,
  statusEffects: [],
  shield: 0
});

/**
 * Initialize all heroes for a new game
 * @returns {Object} Heroes organized by team with game state
 */
export const createAllHeroes = () => ({
  player1: HERO_TEAMS.player1.map(createHeroInstance),
  player2: HERO_TEAMS.player2.map(createHeroInstance)
});

/**
 * Get hero by ID from all heroes
 * @param {number} heroId - The hero's ID
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {Object|null} Hero object or null if not found
 */
export const getHeroById = (heroId, allHeroes) => {
  if (!allHeroes) return null;
  
  const allHeroesArray = [...(allHeroes.player1 || []), ...(allHeroes.player2 || [])];
  return allHeroesArray.find(hero => hero.id === heroId) || null;
};

/**
 * Get hero by team and index
 * @param {string} team - 'player1' or 'player2'
 * @param {number} index - Hero index (0-2)
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {Object|null} Hero object or null if not found
 */
export const getHeroByTeamIndex = (team, index, allHeroes) => {
  if (!allHeroes || !allHeroes[team]) return null;
  return allHeroes[team][index] || null;
};

/**
 * Get all active (non-defeated) heroes for a team
 * @param {string} team - 'player1' or 'player2'
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {Array} Array of active heroes
 */
export const getActiveHeroesForTeam = (team, allHeroes) => {
  if (!allHeroes || !allHeroes[team]) return [];
  return allHeroes[team].filter(hero => !hero.defeated);
};

/**
 * Get opposite team name
 * @param {string} team - 'player1' or 'player2'
 * @returns {string} Opposite team name
 */
export const getOppositeTeam = (team) => {
  return team === 'player1' ? 'player2' : 'player1';
};

/**
 * Check if a team has any active heroes
 * @param {string} team - 'player1' or 'player2'
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {boolean} True if team has active heroes
 */
export const hasActiveHeroes = (team, allHeroes) => {
  return getActiveHeroesForTeam(team, allHeroes).length > 0;
};

/**
 * Count defeated heroes in a team
 * @param {string} team - 'player1' or 'player2'
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {number} Number of defeated heroes
 */
export const getDefeatedCount = (team, allHeroes) => {
  if (!allHeroes || !allHeroes[team]) return 0;
  return allHeroes[team].filter(hero => hero.defeated).length;
};

/**
 * Get team stats summary
 * @param {string} team - 'player1' or 'player2'
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {Object} Team stats
 */
export const getTeamStats = (team, allHeroes) => {
  if (!allHeroes || !allHeroes[team]) {
    return {
      total: 0,
      active: 0,
      defeated: 0,
      totalHp: 0,
      totalMaxHp: 0
    };
  }

  const teamHeroes = allHeroes[team];
  const activeHeroes = teamHeroes.filter(h => !h.defeated);
  const totalHp = teamHeroes.reduce((sum, h) => sum + h.hp, 0);
  const totalMaxHp = teamHeroes.reduce((sum, h) => sum + h.maxHp, 0);

  return {
    total: teamHeroes.length,
    active: activeHeroes.length,
    defeated: teamHeroes.length - activeHeroes.length,
    totalHp,
    totalMaxHp
  };
};

/**
 * Get all heroes as a flat array
 * @param {Object} allHeroes - All heroes object from game state
 * @returns {Array} Flat array of all heroes
 */
export const getAllHeroesFlat = (allHeroes) => {
  if (!allHeroes) return [];
  return [...(allHeroes.player1 || []), ...(allHeroes.player2 || [])];
};

/**
 * Get hero image by hero name or ID
 * @param {string|number} heroNameOrId - Hero name or ID
 * @returns {string} Image path or placeholder
 */
export const getHeroImage = (heroNameOrId) => {
  if (typeof heroNameOrId === 'string') {
    // Search by name
    const hero = Object.values(HEROES).find(h => h.name === heroNameOrId);
    return hero ? hero.image : '';
  } else {
    // Search by ID
    const hero = Object.values(HEROES).find(h => h.id === heroNameOrId);
    return hero ? hero.image : '';
  }
};

/**
 * Get hero definition by name
 * @param {string} heroName - Hero name
 * @returns {Object|null} Hero definition or null
 */
export const getHeroDefinitionByName = (heroName) => {
  return Object.values(HEROES).find(h => h.name === heroName) || null;
};
