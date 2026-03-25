import React from 'react';
import SkillTooltip from './Skilltooltip';

const Battlefield = ({ heroes, currentTurn, activeHeroIndex, selectingTarget, selectingSupportTarget, waitingForReaction, pendingAttack, gameStarted, setActiveHeroIndex, selectTarget, addLog }) => {
  return (
    <div className="max-w-7xl mx-auto mb-8">
      {/* Player 1 Team */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-3 text-blue-400">Player 1 Team</h2>
        <div className="grid grid-cols-3 gap-4">
          {heroes.player1.map((hero, idx) => (
            <div
              key={hero.id}
              onClick={() => {
                if (selectingSupportTarget && currentTurn === 'player1') {
                  selectTarget(hero.id);
                } else if (selectingTarget && currentTurn === 'player2') {
                  selectTarget(hero.id);
                } else if (gameStarted && currentTurn === 'player1' && !waitingForReaction && !selectingTarget && !selectingSupportTarget) {
                  setActiveHeroIndex(idx);
                  addLog(`${hero.name} selected!`);
                }
              }}
              className={`bg-gray-800 p-4 rounded-lg border-4 transition-all cursor-pointer flex flex-col items-center gap-3 ${hero.defeated ? 'opacity-40 border-gray-700' :
                !gameStarted ? 'border-gray-500' :
                currentTurn === 'player1' && idx === activeHeroIndex ? 'border-blue-500 shadow-lg' :
                  ((selectingSupportTarget && currentTurn === 'player1') || (selectingTarget && currentTurn === 'player2')) ? 'border-green-500 hover:border-green-400' :
                    currentTurn === 'player1' && !waitingForReaction ? 'border-blue-400 hover:border-blue-300' :
                      'border-gray-600'
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
                {hero.defeated && <span className="text-2xl ml-2">☠️</span>}
              </div>
              
              <img 
                src={hero.image} 
                alt={hero.name}
                className="w-32 h-32 object-cover rounded border-2 border-gray-600"
              />
              
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>HP</span>
                  <span className="font-bold">{hero.hp}/{hero.maxHp}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
                </div>
                {hero.shield > 0 && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-300">🛡️ Shield</span>
                      <span className="font-bold text-blue-300">{hero.shield}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (hero.shield / hero.maxHp) * 100)}%` }} />
                    </div>
                  </div>
                )}
                {hero.statusEffects.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap justify-center">
                  {hero.statusEffects.map((effect, idx) => (
                    <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded" title={effect.name}>
                      {effect.icon} {effect.turnsRemaining}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player 2 Team */}
      <div>
        <h2 className="text-2xl font-bold mb-3 text-red-400">Player 2 Team</h2>
        <div className="grid grid-cols-3 gap-4">
          {heroes.player2.map((hero, idx) => (
            <div
              key={hero.id}
              onClick={() => {
                if (selectingSupportTarget && currentTurn === 'player2') {
                  selectTarget(hero.id);
                } else if (selectingTarget && currentTurn === 'player1') {
                  selectTarget(hero.id);
                } else if (gameStarted && currentTurn === 'player2' && !waitingForReaction && !selectingTarget && !selectingSupportTarget) {
                  setActiveHeroIndex(idx);
                  addLog(`${hero.name} selected!`);
                }
              }}
              className={`bg-gray-800 p-4 rounded-lg border-4 transition-all cursor-pointer flex flex-col items-center gap-3 ${hero.defeated ? 'opacity-40 border-gray-700' :
                !gameStarted ? 'border-gray-500' :
                currentTurn === 'player2' && idx === activeHeroIndex ? 'border-red-500 shadow-lg' :
                  ((selectingSupportTarget && currentTurn === 'player2') || (selectingTarget && currentTurn === 'player1')) ? 'border-green-500 hover:border-green-400' :
                    currentTurn === 'player2' && !waitingForReaction ? 'border-red-400 hover:border-red-300' :
                      'border-gray-600'
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
                {hero.defeated && <span className="text-2xl ml-2">☠️</span>}
              </div>
              
              <img 
                src={hero.image} 
                alt={hero.name}
                className="w-32 h-32 object-cover rounded border-2 border-gray-600"
              />
              
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>HP</span>
                  <span className="font-bold">{hero.hp}/{hero.maxHp}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
                </div>
                {hero.shield > 0 && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-300">🛡️ Shield</span>
                      <span className="font-bold text-blue-300">{hero.shield}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (hero.shield / hero.maxHp) * 100)}%` }} />
                    </div>
                  </div>
                )}
                {hero.statusEffects.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap justify-center">
                  {hero.statusEffects.map((effect, idx) => (
                    <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded" title={effect.name}>
                      {effect.icon} {effect.turnsRemaining}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Battlefield;
