
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ModelManager from './pages/ModelManager';
import KnowledgeBase from './pages/KnowledgeBase';
import DatabaseManager from './pages/DatabaseManager';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem('songseek_consent') === 'true';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('songseek_theme') || 'dark');
  
  const isSearchPage = location.pathname.startsWith('/search-results');

  // Handle Theme Logic
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('theme-transitioning');
    
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    
    localStorage.setItem('songseek_theme', theme);
    
    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 500);
    return () => clearTimeout(timer);
  }, [theme]);

  const handleConsent = () => {
    setIsProcessing(true);
    setTimeout(() => {
      localStorage.setItem('songseek_consent', 'true');
      setHasConsented(true);
      setIsProcessing(false);
    }, 800);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!hasConsented) {
    return (
      <div className="fixed inset-0 z-[1000] bg-background-base flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(0,108,117,0.15)_0%,transparent_50%)]"></div>
           <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(0,227,243,0.05)_0%,transparent_50%)]"></div>
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div className="glass-panel rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 relative">
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-soft"></div>
                 <span className="material-symbols-outlined text-4xl text-primary-light relative z-10">verified_user</span>
              </div>
            </div>

            <h1 className="text-3xl font-black text-center tracking-tighter mb-2">安全使用声明</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs text-center font-medium mb-8 leading-relaxed">
              songseek 致力于保护您的数字资产安全。<br/>在使用前，请确认您已知晓以下条款：
            </p>

            <div className="space-y-4 mb-8">
               <ConsentPoint icon="cloud_off" title="100% 本地优先" desc="除非您明确请求联网搜索，否则数据不离开设备。" />
               <ConsentPoint icon="enhanced_encryption" title="端到端加密" desc="您的知识库与模型参数均使用 AES-256 加密。" />
               <ConsentPoint icon="visibility_off" title="无遥测记录" desc="我们不收集您的搜索历史或任何身份识别信息。" />
            </div>

            <button 
              onClick={handleConsent}
              disabled={isProcessing}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
               {isProcessing ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <>
                   <span className="material-symbols-outlined text-xl">check_circle</span>
                   <span>开启安全体验</span>
                 </>
               )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-base text-current overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full animate-float opacity-60"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Routes>
            <Route path="/" element={<Home onThemeToggle={toggleTheme} theme={theme} />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/model-manager" element={<ModelManager />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/database" element={<DatabaseManager />} />
            <Route path="/settings" element={<Settings onThemeToggle={toggleTheme} theme={theme} />} />
          </Routes>
        </main>
        {!isSearchPage && <BottomNav />}
      </div>
    </div>
  );
};

const ConsentPoint: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 items-start">
     <div className="mt-0.5 text-primary-light">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
     </div>
     <div>
        <h4 className="font-bold text-[13px] tracking-tight leading-none mb-1">{title}</h4>
        <p className="text-gray-500 text-[11px] font-medium leading-tight">{desc}</p>
     </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
