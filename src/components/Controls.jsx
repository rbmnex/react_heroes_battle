import React from 'react';

const Controls = ({ gameStarted, gameOver, waitingForReaction, waitingForDiscard, waitingForNextAttack, selectingTarget, turnCount, currentPlayerHand, drawUsedThisTurn, pendingAttack, isFirstAttackOfHero, pendingAttackCard, selectingSupportTarget, pendingSupportCard, remainingAttacks, startGame, skipBlock, drawOneAndDiscard, confirmEndTurn, cancelAttack, getActiveHero }) => {
  return (
    <div className="max-w-7xl mx-auto mb-8 text-center">
      {waitingForReaction && pendingAttack && (
        <div className="bg-yellow-900 p-6 rounded-lg border-2 border-yellow-500">
          <p className="text-xl mb-4 font-bold">
            ⚡ {pendingAttack.defenderHero.name}: Defend?
          </p>
          <button onClick={skipBlock} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold">
            Take Damage
          </button>
        </div>
      )}

      {gameStarted && !waitingForReaction && !gameOver && !waitingForNextAttack && !selectingTarget && !selectingSupportTarget && (
        <div className="space-y-3">
          {turnCount > 2 && currentPlayerHand.length === 5 && !waitingForDiscard && !drawUsedThisTurn && (
            <div>
              <button onClick={drawOneAndDiscard} className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg font-bold">
                Draw & Discard
              </button>
            </div>
          )}
          <div>
            <button onClick={confirmEndTurn} className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold">
              End Turn
            </button>
          </div>
          {waitingForDiscard && (
            <div className="bg-orange-900 p-4 rounded-lg">
              <p className="font-bold">🃏 Select card to discard</p>
            </div>
          )}
        </div>
      )}

      {waitingForNextAttack && (
        <div className="bg-amber-900 p-4 rounded-lg border-2 border-amber-500">
          <p className="font-bold">🔥 {remainingAttacks} attacks left - play another attack!</p>
        </div>
      )}

      {(selectingTarget || selectingSupportTarget) && (
        <div className="mt-4">
          <button onClick={cancelAttack} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-sm">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Controls;
