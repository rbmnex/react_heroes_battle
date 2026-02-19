import React, { useState } from 'react';
import { getDetailedSkillInfo, generateSkillTooltip } from '../utils/skillTooltipEnhanced';

/**
 * SkillTooltip Component
 * Displays detailed skill information on hover or click
 */
const SkillTooltip = ({ skill, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!skill) return children;
  
  const info = getDetailedSkillInfo(skill);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute ${positionClasses[position]} z-50 w-96 pointer-events-none`}
          style={{ animation: 'tooltipFadeIn 0.2s ease-out' }}
        >
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-2xl p-4 text-left">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
              <span className="text-4xl">{info.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{info.name}</h3>
                <p className="text-xs text-gray-400">{info.jobClass} Skill</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-300 mb-3 italic">
              {info.description}
            </p>
            
            {/* Trigger Section */}
            <div className="mb-3">
              <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
                <span>⚡</span> HOW TO TRIGGER
              </h4>
              <div className="text-xs text-gray-300 bg-gray-800 rounded p-2 whitespace-pre-line">
                {info.trigger}
              </div>
            </div>
            
            {/* Effect Section */}
            <div className="mb-3">
              <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                <span>💫</span> EFFECT
              </h4>
              <div className="text-xs text-gray-300 bg-gray-800 rounded p-2 whitespace-pre-line">
                {info.effect}
              </div>
            </div>
            
            {/* Requirements Section */}
            {info.requirements.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                  <span>⚠️</span> REQUIREMENTS
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  {info.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Tips Section */}
            {info.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <span>💡</span> TIPS
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  {info.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Arrow pointer */}
          <div 
            className={`absolute w-3 h-3 bg-gray-900 border-yellow-500 transform rotate-45 ${
              position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-b-2 border-r-2' :
              position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-2 border-l-2' :
              position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-t-2 border-r-2' :
              'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-b-2 border-l-2'
            }`}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Compact SkillTooltip for smaller spaces
 */
export const CompactSkillTooltip = ({ skill, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!skill) return children;
  
  const info = getDetailedSkillInfo(skill);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none">
          <div className="bg-gray-900 border border-yellow-500 rounded-lg shadow-xl p-3 text-left text-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{info.icon}</span>
              <div>
                <h4 className="font-bold text-yellow-400">{info.name}</h4>
                <p className="text-gray-500 text-xs">{info.jobClass}</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs mb-2">{info.description}</p>
            <div className="text-gray-400 text-xs">
              <span className="text-green-400">⚡</span> {info.trigger.split('\n')[0]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * SkillList Component - displays all skills for a hero
 */
export const SkillList = ({ skills, heroName }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No skills available for {heroName}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-yellow-400 mb-3">
        {heroName}'s Skills
      </h3>
      {skills.map((skill, index) => (
        <SkillTooltip key={index} skill={skill} position="right">
          <div className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-yellow-500 rounded-lg p-3 cursor-help transition-all">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{skill.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-white">{skill.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
              </div>
              <span className="text-gray-500 text-xs">hover for details</span>
            </div>
          </div>
        </SkillTooltip>
      ))}
    </div>
  );
};

/**
 * SkillIndicatorWithTooltip - combines the skill popup with detailed tooltip
 */
export const SkillIndicatorWithTooltip = ({ skill, visible, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!visible || !skill) return null;
  
  const info = getDetailedSkillInfo(skill);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div 
        className="pointer-events-auto cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Main skill indicator (existing) */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border-4 border-yellow-400 rounded-2xl p-6 shadow-2xl animate-skillAppear">
          <div className="flex items-center gap-5">
            <div className="text-7xl animate-skillPulse">
              {skill.icon}
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                {skill.name}
              </h2>
              <p className="text-base text-gray-200 font-medium">
                {skill.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Click for details
              </p>
            </div>
          </div>
        </div>
        
        {/* Detailed tooltip (optional - shown on click) */}
        {showDetails && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-gray-900 border-2 border-yellow-500 rounded-lg p-4 text-left max-w-md mx-auto">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(false);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-bold text-green-400 mb-1">⚡ HOW TO TRIGGER</h4>
                <p className="text-gray-300 text-xs whitespace-pre-line">{info.trigger}</p>
              </div>
              
              <div>
                <h4 className="font-bold text-purple-400 mb-1">💫 EFFECT</h4>
                <p className="text-gray-300 text-xs whitespace-pre-line">{info.effect}</p>
              </div>
              
              {info.tips.length > 0 && (
                <div>
                  <h4 className="font-bold text-blue-400 mb-1">💡 TIPS</h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    {info.tips.map((tip, i) => (
                      <li key={i}>→ {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTooltip;