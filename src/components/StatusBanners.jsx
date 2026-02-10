import React from 'react';

const StatusBanners = ({ selectingTarget, selectingSupportTarget, isFirstAttackOfHero, pendingAttackCard, pendingSupportCard, getActiveHero }) => {
  return (
    <div>
      {/* Support Card Target Selection Banner */}
      {selectingSupportTarget && pendingSupportCard && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-emerald-900 p-4 rounded-lg border-2 border-emerald-400 text-center">
            <p className="text-xl font-bold">💚 Select a teammate to use {pendingSupportCard.name} on...</p>
          </div>
        </div>
      )}

      {/* First Attack Banner */}
      {isFirstAttackOfHero && selectingTarget && pendingAttackCard && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-blue-900 p-4 rounded-lg border-2 border-blue-400 text-center">
            <p className="text-xl font-bold">✨ {getActiveHero().name} is ready to attack with {pendingAttackCard.name}! Select target...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBanners;
