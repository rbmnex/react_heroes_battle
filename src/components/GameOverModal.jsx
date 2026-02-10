import React from 'react';

const GameOverModal = ({ gameOver, winner, resetGame }) => {
  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-center border-4 border-yellow-500">
        <h2 className="text-4xl font-bold mb-6">
          {winner === 'player1' ? '🎉 Player 1 Wins!' : '🎉 Player 2 Wins!'}
        </h2>
        <button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-xl">
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
