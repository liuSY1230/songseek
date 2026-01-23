
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(() => [
    { id: 'search', path: '/', label: '探索', code: 'ex', icon: 'explore' },
    { id: 'knowledge', path: '/knowledge-base', label: '知识', code: 'au', icon: 'library_books' },
    { id: 'database', path: '/database', label: '存储', code: 'da', icon: 'database' },
    { id: 'model', path: '/model-manager', label: '引擎', code: 'm', icon: 'memory' },
    { id: 'settings', path: '/settings', label: '控制', code: 'se', icon: 'settings' },
  ], []);

  const activeIndex = tabs.findIndex(tab => 
    location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-background-base via-background-base/80 to-transparent pointer-events-none">
      <div className="glass-panel h-20 px-2 flex items-center justify-around bg-slate-900/90 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] overflow-hidden pointer-events-auto max-w-xl mx-auto">
        {tabs.map((tab, idx) => {
          const isActive = activeIndex === idx;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full active:scale-90 transition-all outline-none group"
            >
              {/* 激活态背景发光 */}
              {isActive && (
                <div className="absolute inset-x-2 inset-y-2 bg-primary/10 blur-xl rounded-full animate-pulse"></div>
              )}
              
              <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'translate-y-[-2px]' : 'opacity-40 grayscale group-hover:opacity-70 group-hover:grayscale-0'}`}>
                {/* 图标层 */}
                <span className={`material-symbols-outlined text-[22px] mb-1 ${isActive ? 'text-primary' : 'text-slate-300'}`}>
                  {tab.icon}
                </span>
                
                {/* 文字层：结合双字母代码和中文标题 */}
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {isActive ? tab.label : tab.code.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* 底部指示条 */}
              {isActive && (
                <div className="absolute bottom-2 w-6 h-[3px] bg-primary shadow-[0_0_12px_var(--primary)] rounded-full animate-in zoom-in duration-300"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(BottomNav);
