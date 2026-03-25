import React from 'react';

const BattleLog = ({ gameLog }) => {
  return (
    <div className="bg-gray-800 rounded-lg border-2 border-gray-700 h-[500px] flex flex-col">
      <h3 className="text-xl font-bold mb-3 p-4 border-b border-gray-700">📜 Battle Log</h3>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {gameLog.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Battle not started</p>
        ) : (
          [...gameLog].reverse().map((log, i) => <p key={gameLog.length - 1 - i} className="text-sm text-gray-300">{log}</p>)
        )}
      </div>
    </div>
  );
};

export default BattleLog;
