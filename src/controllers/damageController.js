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

  const {
    card, attacker, attackerHero, defender, defenderHero,
    isFeint, ignoresBlock, ignoreShield, unavoidable,
    skillTriggered, skillName, skillIcon,
    statusDurationBonus, statusDamageBonus, splashDamage, selfDamage,
    multiHit, hitsPerAttack, damagePerHit
  } = pendingAttack;

  let defenderDamage = card.damage;
  let attackerDamage = 0;
  let shieldAbsorbed = 0;
  let defenseNullified = false; // track if defense was bypassed

  // Remove defense card if played
  if (defenseCard) {
    if (defender === 'player1') {
      setPlayer1Hand(prev => prev.filter(c => c.id !== defenseCard.id));
    } else {
      setPlayer2Hand(prev => prev.filter(c => c.id !== defenseCard.id));
    }

    // Check if attack is unavoidable (from Feint buff OR skill like Headshot)
    const isUnavoidable = isFeint || unavoidable;

    // Resolve defense interactions
    if (isUnavoidable) {
      // Unavoidable attacks: Counter/Deflect still work (reflect), but Evade/Block don't
      if ((defenseCard.defenseType === 'counter' && card.attackType === 'physical') ||
        (defenseCard.defenseType === 'deflect' && card.attackType === 'magic')) {
        defenderDamage = Math.floor(card.damage * 0.5);
        attackerDamage = Math.floor(card.damage * 0.5);
        addLog(`${defenseCard.defenseType === 'counter' ? '⚡' : '🔮'} ${defenseCard.name}! Dmg: ${defenderDamage}, Reflect: ${attackerDamage}`);
      } else {
        addLog(`💫 ${isFeint ? 'Feint' : skillName || 'Skill'}! ${defenseCard.name} has no effect!`);
        defenseNullified = true;
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
          addLog(`💥 ${skillName || 'Skill'} penetrates the defense!`);
        } else {
          defenderDamage = Math.max(0, card.damage - defenseCard.defense);
          addLog(`🛡️ Blocked to ${defenderDamage}!`);
        }
      } else {
        addLog(`${defenseCard.name} doesn't work against this attack type!`);
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
          if (shieldAbsorbed > 0) addLog(`🛡️ Shield absorbs ${shieldAbsorbed} damage!`);
        } else if (ignoreShield && h.shield > 0) {
          addLog(`⚡ ${skillName || 'Skill'} bypasses shield!`);
        }
        const newHp = Math.max(0, h.hp - damageAfterShield);
        return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
      }
      if (h.id === attackerHero.id && attacker === 'player1') {
        let damageAfterShield = attackerDamage;
        let newShield = h.shield;
        if (h.shield > 0) {
          const absorbed = Math.min(h.shield, attackerDamage);
          damageAfterShield = attackerDamage - absorbed;
          newShield = h.shield - absorbed;
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
          if (shieldAbsorbed > 0) addLog(`🛡️ Shield absorbs ${shieldAbsorbed} damage!`);
        } else if (ignoreShield && h.shield > 0) {
          addLog(`⚡ ${skillName || 'Skill'} bypasses shield!`);
        }
        const newHp = Math.max(0, h.hp - damageAfterShield);
        return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
      }
      if (h.id === attackerHero.id && attacker === 'player2') {
        let damageAfterShield = attackerDamage;
        let newShield = h.shield;
        if (h.shield > 0) {
          const absorbed = Math.min(h.shield, attackerDamage);
          damageAfterShield = attackerDamage - absorbed;
          newShield = h.shield - absorbed;
        }
        const newHp = Math.max(0, h.hp - damageAfterShield);
        return { ...h, hp: newHp, shield: newShield, defeated: newHp === 0 };
      }
      return h;
    })
  };

  // Apply splash damage to adjacent heroes (from Elemental Mastery)
  if (splashDamage > 0 && defenderDamage > 0) {
    const defenderTeam = newHeroes[defender];
    const defenderIdx = defenderTeam.findIndex(h => h.id === defenderHero.id);
    const adjacentIndices = [defenderIdx - 1, defenderIdx + 1].filter(i => i >= 0 && i < defenderTeam.length);

    adjacentIndices.forEach(idx => {
      const adjacentHero = defenderTeam[idx];
      if (adjacentHero && !adjacentHero.defeated) {
        const newHp = Math.max(0, adjacentHero.hp - splashDamage);
        newHeroes[defender] = newHeroes[defender].map(h =>
          h.id === adjacentHero.id ? { ...h, hp: newHp, defeated: newHp === 0 } : h
        );
        addLog(`💫 ${adjacentHero.name} takes ${splashDamage} splash damage! (HP: ${newHp})`);
      }
    });
  }

  // Apply self-damage (from Desperate Strike)
  if (selfDamage > 0) {
    newHeroes[attacker] = newHeroes[attacker].map(h => {
      if (h.id === attackerHero.id) {
        const newHp = Math.max(0, h.hp - selfDamage);
        addLog(`💀 ${attackerHero.name} takes ${selfDamage} self-damage! (HP: ${newHp})`);
        return { ...h, hp: newHp, defeated: newHp === 0 };
      }
      return h;
    });
  }

  // Apply status effects
  let statusToApply = card.statusEffect;
  if (!statusToApply && activeBuff && activeBuff.buffType === 'elementalMagic' && card.attackType === 'magic') {
    statusToApply = activeBuff.statusEffect;
  }

  if (statusToApply) {
    let statusTargetHero = defenderHero;
    let statusTargetPlayer = defender;
    let isReflected = false;

    if (defenseCard && defenseCard.defenseType === 'deflect' && card.attackType === 'magic') {
      statusTargetHero = attackerHero;
      statusTargetPlayer = attacker;
      isReflected = true;
    } else if (defenderDamage <= 0 && !(defenseCard && defenseCard.defenseType === 'block')) {
      statusToApply = null;
    }

    if (statusToApply && STATUS_EFFECTS[statusToApply]) {
      const baseDuration = STATUS_EFFECTS[statusToApply].duration;
      const bonusDuration = statusDurationBonus || 0;
      const bonusDotDamage = statusDamageBonus || 0;

      const statusEffect = {
        ...STATUS_EFFECTS[statusToApply],
        type: statusToApply,
        turnsRemaining: baseDuration + bonusDuration
      };

      // Apply DOT bonus from Elemental Mastery
      if (bonusDotDamage > 0) {
        if (statusEffect.damagePerTurn) {
          statusEffect.damagePerTurn += bonusDotDamage;
        }
        if (statusEffect.damageOnAction) {
          statusEffect.damageOnAction += bonusDotDamage;
        }
      }

      newHeroes[statusTargetPlayer] = newHeroes[statusTargetPlayer].map(h =>
        h.id === statusTargetHero.id ? {
          ...h,
          statusEffects: [...h.statusEffects.filter(e => e.type !== statusToApply), statusEffect]
        } : h
      );

      const durationInfo = bonusDuration > 0 ? ` (${statusEffect.turnsRemaining} turns!)` : '';
      const dotInfo = bonusDotDamage > 0 ? ` [Enhanced: +${bonusDotDamage} dmg/turn]` : '';
      if (isReflected) {
        addLog(`${STATUS_EFFECTS[statusToApply].icon} ${statusTargetHero.name} is ${statusToApply}! [REFLECTED]${durationInfo}${dotInfo}`);
      } else {
        addLog(`${STATUS_EFFECTS[statusToApply].icon} ${statusTargetHero.name} is ${statusToApply}!${durationInfo}${dotInfo}`);
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

  // Charge buff always stuns the attacker next turn (recharge cost)
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
    addLog(`💫 ${attackerHero.name} is stunned from Charge recoil! (skips next turn)`);
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
