
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'search', path: '/', label: '探索', icon: 'search' },
    { id: 'knowledge', path: '/knowledge-base', label: '知识库', icon: 'auto_stories' },
    { id: 'database', path: '/database', label: '数据库', icon: 'database' },
    { id: 'model', path: '/model-manager', label: '模型库', icon: 'robot_2' },
    { id: 'settings', path: '/settings', label: '控制台', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-6 left-5 right-5 z-50 pointer-events-none flex justify-center">
      <div className="glass-panel rounded-[32px] h-[84px] px-2 flex items-center justify-around w-full max-w-lg pointer-events-auto relative overflow-hidden">
        
        {/* Subtle interior lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.1] to-transparent pointer-events-none dark:from-white/[0.02]"></div>

        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center h-full flex-1 transition-all duration-500 group outline-none`}
            >
              {/* Active Back-Glow */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 bg-primary/10 blur-[20px] rounded-full animate-pulse-soft"></div>
                  <div className="w-8 h-8 bg-primary/5 blur-md rounded-full"></div>
                </div>
              )}

              {/* Icon Container */}
              <div className={`relative mb-1 flex items-center justify-center transition-all duration-500 ease-out ${
                isActive ? '-translate-y-1.5 scale-110' : 'group-hover:translate-y-[-2px]'
              }`}>
                <span 
                  className={`material-symbols-outlined text-[28px] transition-all duration-500 ${
                    isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(180,83,9,0.3)]' : 'text-slate-400 dark:text-slate-500'
                  }`}
                  style={{
                    fontVariationSettings: isActive 
                      ? "'FILL' 1, 'wght' 700, 'opsz' 48, 'GRAD' 200" 
                      : "'FILL' 0, 'wght' 300, 'opsz' 48, 'GRAD' 0"
                  }}
                >
                  {tab.icon}
                </span>

                {/* Vertical Light Indicator */}
                {isActive && (
                  <div className="absolute -bottom-2.5 w-6 h-[4px] bg-primary rounded-full shadow-[0_2px_10px_rgba(180,83,9,0.4)] animate-in zoom-in-50 duration-300"></div>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500 ${
                isActive ? 'text-primary opacity-100' : 'text-slate-400 dark:text-slate-500 opacity-60 scale-90'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
