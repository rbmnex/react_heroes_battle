import React from 'react';
import { ALL_HEROES } from '../models/heroesModel';
import SkillTooltip from './Skilltooltip';

const HeroSelection = ({ player1Picks, player2Picks, selectionTurn, onPickHero, onStartGame }) => {
  const totalPicks = player1Picks.length + player2Picks.length;
  const allPicked = totalPicks === 6;
  const pickedIds = [...player1Picks, ...player2Picks].map(h => h.id);

  const currentPlayer = selectionTurn === 'player1' ? 'Player 1' : 'Player 2';
  const currentColor = selectionTurn === 'player1' ? 'text-blue-400' : 'text-red-400';
  const currentPicks = selectionTurn === 'player1' ? player1Picks.length : player2Picks.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-2">Tactical Hero Card Battle</h1>
      <p className="text-center text-gray-400 mb-8">Hero Selection Phase</p>

      {/* Selection Status */}
      {!allPicked ? (
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold">
            <span className={currentColor}>{currentPlayer}</span>
            <span className="text-gray-300"> — Pick a hero ({currentPicks}/3)</span>
          </p>
          <p className="text-gray-400 mt-1">Alternating draft: each player picks one hero at a time</p>
        </div>
      ) : (
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold text-green-400">All heroes selected!</p>
        </div>
      )}

      {/* Team Previews */}
      <div className="w-full max-w-5xl flex justify-between mb-8">
        {/* Player 1 Team */}
        <div className="flex-1 mr-4">
          <h3 className="text-xl font-bold text-blue-400 mb-3 text-center">Player 1 Team</h3>
          <div className="flex gap-3 justify-center">
            {[0, 1, 2].map(slot => {
              const hero = player1Picks[slot];
              return (
                <div key={slot} className={`w-28 h-36 rounded-lg border-2 flex flex-col items-center justify-center ${
                  hero ? 'border-blue-500 bg-gray-800' : 'border-dashed border-gray-600 bg-gray-800/50'
                }`}>
                  {hero ? (
                    <>
                      <img src={hero.image} alt={hero.name} className="w-16 h-16 object-cover rounded mb-1" />
                      <p className="text-xs font-bold">{hero.name}</p>
                      <p className="text-xs text-gray-400">{hero.job.icon} {hero.job.name}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-2xl">?</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center px-4">
          <span className="text-3xl font-bold text-gray-500">VS</span>
        </div>

        {/* Player 2 Team */}
        <div className="flex-1 ml-4">
          <h3 className="text-xl font-bold text-red-400 mb-3 text-center">Player 2 Team</h3>
          <div className="flex gap-3 justify-center">
            {[0, 1, 2].map(slot => {
              const hero = player2Picks[slot];
              return (
                <div key={slot} className={`w-28 h-36 rounded-lg border-2 flex flex-col items-center justify-center ${
                  hero ? 'border-red-500 bg-gray-800' : 'border-dashed border-gray-600 bg-gray-800/50'
                }`}>
                  {hero ? (
                    <>
                      <img src={hero.image} alt={hero.name} className="w-16 h-16 object-cover rounded mb-1" />
                      <p className="text-xs font-bold">{hero.name}</p>
                      <p className="text-xs text-gray-400">{hero.job.icon} {hero.job.name}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-2xl">?</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Pool */}
      {!allPicked && (
        <div className="w-full max-w-5xl">
          <h3 className="text-lg font-bold text-gray-300 mb-4 text-center">Available Heroes</h3>
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {ALL_HEROES.map(hero => {
              const isPicked = pickedIds.includes(hero.id);
              return (
                <div
                  key={hero.id}
                  onClick={() => !isPicked && onPickHero(hero)}
                  className={`bg-gray-800 p-4 rounded-lg border-4 transition-all flex flex-col items-center gap-3 ${
                    isPicked
                      ? 'opacity-30 border-gray-700 cursor-not-allowed'
                      : selectionTurn === 'player1'
                        ? 'border-blue-400/50 hover:border-blue-400 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20'
                        : 'border-red-400/50 hover:border-red-400 cursor-pointer hover:shadow-lg hover:shadow-red-500/20'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{hero.name}</h3>
                    <p className="text-sm text-gray-400">{hero.job.icon} {hero.job.name}</p>
                    {hero.heroSkill && (
                      <SkillTooltip skill={hero.heroSkill} position="bottom">
                        <p className="text-xs text-purple-300 mt-1 cursor-help hover:text-purple-200 transition-colors">
                          {hero.heroSkill.icon} {hero.heroSkill.name}
                        </p>
                      </SkillTooltip>
                    )}
                  </div>

                  <img
                    src={hero.image}
                    alt={hero.name}
                    className="w-32 h-32 object-cover rounded border-2 border-gray-600"
                  />

                  <div className="w-full text-center">
                    <p className="text-sm"><span className="text-gray-400">HP:</span> <span className="font-bold">{hero.maxHp}</span></p>
                    <p className="text-xs text-gray-500 mt-1">{hero.description}</p>
                  </div>

                  {isPicked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Game Button */}
      {allPicked && (
        <button
          onClick={onStartGame}
          className="mt-4 bg-green-600 hover:bg-green-700 px-12 py-4 rounded-lg font-bold text-2xl transition-all hover:scale-105"
        >
          Start 3v3 Battle!
        </button>
      )}
    </div>
  );
};

export default HeroSelection;
