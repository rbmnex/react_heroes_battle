// Damage Resolution Controller
import { STATUS_EFFECTS } from '../models/statusEffects';

export const handleResolveAttack = (defenseCard, currentTurn, heroes, setHeroes, pendingAttack, activeBuff, remainingAttacks, setActiveBuff, setRemainingAttacks, setWaitingForReaction, setPendingAttack, setWaitingForNextAttack, setSelectingTarget, setPendingAttackCard, addLog, checkVictory) => {
  if (!pendingAttack) return;

  const { card, attacker, attackerHero, defender, defenderHero, isFeint } = pendingAttack;
  let defenderDamage = card.damage;
  let attackerDamage = 0;
  let attackEvaded = false;

  if (defenseCard) {
    if (defender === 'player1') {
      // Remove card from hand - note: this might need adjustment in context
    } else {
      // Remove card from hand - note: this might need adjustment in context
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
    // addLog(`⚠️ CHARGE FAIL! Stunned next turn!`);
    
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
    addLog(`💫 ${attackerHero.name} need to recharge!`);
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
