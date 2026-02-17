// Damage Resolution Controller
import { STATUS_EFFECTS } from '../models/statusEffects';

/**
 * Resolve an attack - handle defense card, apply damage, status effects, and multi-attack logic
 */
export const resolveAttackController = (
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
) => {
  if (!pendingAttack) return;

  const { card, attacker, attackerHero, defender, defenderHero, isFeint, ignoresBlock, ignoreShield, skillTriggered, skillName, skillIcon } = pendingAttack;
  let defenderDamage = card.damage;
  let attackerDamage = 0;
  let shieldAbsorbed = 0;

  // Remove defense card if played
  if (defenseCard) {
    if (defender === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== defenseCard.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== defenseCard.id));
    }

    // Resolve defense interactions
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
        if (ignoresBlock) {
          addLog(`💥 ${skillName} penetrates the defense!`);
        } else {
          defenderDamage = Math.max(0, card.damage - defenseCard.defense);
          addLog(`🛡️ Blocked to ${defenderDamage}!`);
        }
      } else {
        addLog(`⚠️ ${defenseCard.name} doesn't work!`);
      }
    }
  } else {
    addLog(`💥 Full damage!`);
  }

  // Apply damage with shield absorption
  const newHeroes = {
    player1: heroes.player1.map(h => {
      if (h.id === defenderHero.id && defender === 'player1') {
        let damageAfterShield = defenderDamage;
        let newShield = h.shield;
        if (h.shield > 0 && !ignoreShield) {
          shieldAbsorbed = Math.min(h.shield, defenderDamage);
          damageAfterShield = defenderDamage - shieldAbsorbed;
          newShield = h.shield - shieldAbsorbed;
        } else if (ignoreShield && h.shield > 0) {
          addLog(`⚡ ${skillName} bypasses shield!`);
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
        let damageAfterShield = defenderDamage;
        let newShield = h.shield;
        if (h.shield > 0 && !ignoreShield) {
          shieldAbsorbed = Math.min(h.shield, defenderDamage);
          damageAfterShield = defenderDamage - shieldAbsorbed;
          newShield = h.shield - shieldAbsorbed;
        } else if (ignoreShield && h.shield > 0) {
          addLog(`⚡ ${skillName} bypasses shield!`);
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

  // Apply status effects
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

  // Log damage results
  if (defenderDamage > 0) {
    const updatedDefender = newHeroes[defender].find(h => h.id === defenderHero.id);
    addLog(`❤️ ${defenderHero.name}: ${defenderDamage} dmg (HP: ${updatedDefender.hp}/${updatedDefender.maxHp})${updatedDefender.defeated ? ' ☠️ DEFEATED!' : ''}`);
  }
  if (attackerDamage > 0) {
    const updatedAttacker = newHeroes[attacker].find(h => h.id === attackerHero.id);
    addLog(`💢 ${attackerHero.name}: ${attackerDamage} reflected (HP: ${updatedAttacker.hp}/${updatedAttacker.maxHp})${updatedAttacker.defeated ? ' ☠️ DEFEATED!' : ''}`);
  }

  // Handle charge buff consequences
  if (activeBuff && activeBuff.buffType === 'charge') {
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

  // Handle multi-attack loop
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
