import React from 'react';

const Hand = ({ displayHand, displayPlayer, gameStarted, gameOver, drawnCard, waitingForReaction, waitingForDiscard, canPlayCard, playCard, getCardVisual }) => {
  if (displayHand.length === 0 || !gameStarted || gameOver) return null;

  return (
    <div className="max-w-7xl mx-auto mb-8">
      <h3 className="text-xl font-bold mb-4 text-center">
        {displayPlayer}'s Hand
        {waitingForReaction && <span className="text-yellow-400 ml-2">(Defend)</span>}
        {waitingForDiscard && <span className="text-orange-400 ml-2">(Discard)</span>}
      </h3>
      <div className="flex gap-4 justify-center flex-wrap">
        {displayHand.map((card) => {
          const isPlayable = waitingForDiscard ? true : canPlayCard(card);
          const isNewlyDrawn = drawnCard && card.id === drawnCard.id;
          const visual = getCardVisual(card);

          return (
            <button
              key={card.id}
              onClick={() => playCard(card)}
              disabled={!waitingForDiscard && !isPlayable}
              className={`p-6 rounded-lg border-2 min-w-[140px] ${visual.color} ${!waitingForDiscard && !isPlayable ? 'opacity-40' : 'hover:scale-105'
                } ${isNewlyDrawn ? 'ring-4 ring-green-400 animate-pulse' : ''}`}
            >
              <div className="font-bold text-lg mb-2">
                {card.name}
                {isNewlyDrawn && <span className="text-green-400 ml-1">✨</span>}
              </div>
              <div className="text-2xl font-bold">{visual.icon} {visual.label}</div>
              <div className="text-xs text-gray-400 mt-1">{card.type.toUpperCase()}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Hand;
