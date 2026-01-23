
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ModelManager from './pages/ModelManager';
import KnowledgeBase from './pages/KnowledgeBase';
import DatabaseManager from './pages/DatabaseManager';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import LiveAssistant from './components/LiveAssistant';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem('songseek_consent') === 'true';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('songseek_theme') || 'dark');
  
  const isSearchPage = location.pathname.startsWith('/search-results');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('songseek_theme', theme);
  }, [theme]);

  const handleConsent = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      localStorage.setItem('songseek_consent', 'true');
      setHasConsented(true);
      setIsProcessing(false);
    }, 600);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!hasConsented) {
    return (
      <div className="fixed inset-0 z-[1000] bg-background-base flex flex-col items-center justify-center p-6 hardware-accelerated">
        <div className="glass-panel w-full max-w-sm p-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
               <span className="material-symbols-outlined text-4xl text-primary animate-pulse-gentle">verified_user</span>
            </div>
            <h1 className="text-2xl font-black mb-2">安全使用声明</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 text-center">受星盾内核保护</p>
            <div className="w-full space-y-6 mb-12">
               <ConsentPoint icon="lock_person" title="数据隐私" desc="所有核心算力优先在您的本地芯片运行。" />
               <ConsentPoint icon="shield_lock" title="分片加密" desc="您的知识文档被碎块化并进行物理加密存储。" />
            </div>
            <button 
              onClick={handleConsent}
              disabled={isProcessing}
              className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
               {isProcessing ? "正在初始化..." : "开启智能宇宙"}
            </button>
        </div>
      </div>
    );
  }

  return (
    // 使用 h-[100dvh] 确保在移动端浏览器中高度计算准确
    <div className="relative flex flex-col h-[100dvh] bg-background-base text-current select-none overflow-hidden">
      {/* 沉浸式背景层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* 关键修复：在这里添加 overflow-y-auto 以允许主内容区域滚动 */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
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
        <LiveAssistant />
      </div>
    </div>
  );
};

const ConsentPoint: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 items-start">
     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
     </div>
     <div>
        <h4 className="font-black text-sm">{title}</h4>
        <p className="text-[11px] font-bold text-slate-500 leading-tight mt-0.5">{desc}</p>
     </div>
  </div>
);

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
