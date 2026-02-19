import React from 'react';

const SkillIndicator = ({ skill, visible }) => {
  if (!visible || !skill) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 animate-fadeIn">
      <div className="skill-indicator bg-gradient-to-br from-indigo-900 to-purple-900 border-4 border-yellow-400 rounded-2xl p-6 shadow-2xl animate-skillAppear">
        <div className="flex items-center gap-5">
          <div className="text-7xl animate-skillPulse" style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.8)' }}>
            {skill.icon}
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2" style={{ 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(251, 191, 36, 0.5)',
              letterSpacing: '1px'
            }}>
              {skill.name}
            </h2>
            <p className="text-base text-gray-200 font-medium" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)' }}>
              {skill.description}
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes skillAppear {
          from {
            transform: scale(0.3) translateY(-50px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes skillPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-skillAppear {
          animation: skillAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                     fadeOut 0.5s ease-in 1.5s forwards;
        }
        
        .animate-skillPulse {
          animation: skillPulse 0.6s ease-in-out infinite;
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateY(-30px) scale(1.05);
          }
        }
        
        .skill-indicator {
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(251, 191, 36, 0.5),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SkillIndicator;