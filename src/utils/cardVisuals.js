// Card Visual Utility
export const getCardVisual = (card) => {
  if (card.type === 'attack') {
    let atkColor = 'bg-red-900 border-red-600';
    let atkIcon = '⚔️';
    if(card.attackType === 'magic') {
      atkColor = 'bg-purple-900 border-purple-600';
      atkIcon = '🔮';
    } else if(card.attackType === 'ranged') {
      atkColor = 'bg-green-900 border-green-600';
      atkIcon = '🏹';
    }
    return {
      color: atkColor,
      icon: atkIcon,
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
    } else if (card.buffType === 'ready') {
      color = 'bg-lime-900 border-lime-600';
      icon = '😣';
    } else if (card.buffType === 'elementalMagic') {
      color = 'bg-pink-900 border-pink-600';
      icon = '🌟';
    }
    const dmg = card.damageModifier || 0;
    return { color, icon, label: `${dmg >= 0 ? '+' : ''}${dmg}` };
  } else if (card.type === 'support') {
    let color = 'bg-emerald-900 border-emerald-600';
    let icon = '✨';
    let label = 'CURE';
    
    if (card.effect === 'heal') {
      icon = '💚';
      label = `+${card.heal}`;
    } else if (card.effect === 'shield') {
      color = 'bg-blue-900 border-blue-600';
      icon = '🛡️';
      label = `+${card.shieldValue}`;
    }
    return { color, icon, label };
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
