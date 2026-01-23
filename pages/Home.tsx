
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC<{ onThemeToggle?: () => void, theme?: string }> = ({ onThemeToggle, theme }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const saved = JSON.parse(localStorage.getItem('nebula_history') || '[]');
    setHistory(saved);
  }, []);

  const handleSearchTrigger = useCallback((searchStr: string) => {
    const trimmed = searchStr.trim();
    if (trimmed) {
      if (window.navigator.vibrate) window.navigator.vibrate(12);
      navigate('/search-results', { state: { query: trimmed } });
    }
  }, [navigate]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchTrigger(query);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('nebula_history');
    setHistory([]);
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h !== item);
    localStorage.setItem('nebula_history', JSON.stringify(updated));
    setHistory(updated);
  };

  return (
    <div className={`flex flex-col min-h-full max-w-xl mx-auto px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <header className="pt-12 pb-10 flex justify-between items-center w-full">
        <button onClick={onThemeToggle} className="w-11 h-11 glass-panel flex items-center justify-center rounded-2xl text-primary active:scale-90 transition-all border-primary/10">
          <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'nights_stay' : 'wb_sunny'}</span>
        </button>
        <div className="flex h-9 items-center gap-x-2.5 px-4 glass-panel rounded-full border-primary/20 bg-slate-800/50">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,217,230,0.8)]"></div>
          <span className="font-tech text-[10px] text-primary tracking-[0.1em] font-black uppercase">星核在线</span>
        </div>
      </header>

      <main className="flex-1">
        <div className="mb-14 text-center animate-fade-up">
          <div className="inline-flex flex-col items-center">
             <div className="flex items-center gap-x-3 mb-4">
                <span className="text-slate-900 dark:text-white text-5xl font-black tracking-tighter select-none letter-spacing-tight">songseek</span>
                <span className="text-primary text-5xl font-black tracking-tighter select-none letter-spacing-tight">Nebula</span>
             </div>
             <p className="font-tech text-[10px] text-slate-500 tracking-[0.5em] font-bold uppercase opacity-60">Cognitive Search Engine</p>
          </div>
        </div>

        <div className="mb-14 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={onFormSubmit} className="relative flex items-center w-full glass-panel bg-slate-900/40 rounded-[28px] p-2.5 border-white/5 focus-within:border-primary/40 focus-within:bg-slate-900/60 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="pl-4 pr-1 text-primary/40">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-[17px] py-3.5 font-bold placeholder-slate-700 text-slate-100 outline-none" 
              placeholder="探寻宇宙的知识..." 
              value={query} 
              autoComplete="off"
              enterKeyHint="search"
              onChange={e => setQuery(e.target.value)} 
              style={{ caretColor: '#00d9e6', outline: 'none', border: 'none', WebkitAppearance: 'none', boxShadow: 'none' }}
            />
            <button type="submit" className="w-12 h-12 rounded-2xl bg-primary text-slate-900 active:scale-90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
               <span className="material-symbols-outlined text-[22px] font-black">north_east</span>
            </button>
          </form>
        </div>

        {history.length > 0 && (
          <section className="mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-5 px-1">
              <h3 className="font-tech text-[10px] text-slate-500 tracking-[0.25em] font-black uppercase flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sm opacity-50">history</span>
                探索轨迹
              </h3>
              <button onClick={clearHistory} className="text-[10px] font-black uppercase text-slate-700 hover:text-red-400 transition-colors">清除全部</button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {history.map((h, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSearchTrigger(h)}
                  className="glass-panel group px-4 py-3 rounded-2xl hover:bg-primary/10 transition-all flex items-center gap-3 cursor-pointer active:scale-95"
                >
                  <span className="text-[13px] font-bold text-slate-300 whitespace-nowrap">{h}</span>
                  <span onClick={(e) => removeHistoryItem(e, h)} className="material-symbols-outlined text-[14px] text-slate-700 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">close</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="pb-40 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6 px-1">
            <h3 className="font-tech text-[10px] text-slate-500 tracking-[0.25em] font-black uppercase">深度洞察</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DiscoveryCard 
              title="2025 全球算力预测" 
              icon="bolt" 
              onClick={() => handleSearchTrigger('2025年全球AI算力发展趋势预测报告')} 
            />
            <DiscoveryCard 
              title="量子计算最新进展" 
              icon="blur_on" 
              onClick={() => handleSearchTrigger('2025年量子计算实验室最新突破')} 
            />
            <DiscoveryCard 
              title="火星殖民地规划" 
              icon="public" 
              onClick={() => handleSearchTrigger('SpaceX 火星首个殖民地基建规划详情')} 
            />
            <DiscoveryCard 
              title="脑机接口商业化" 
              icon="neurology" 
              onClick={() => handleSearchTrigger('Neuralink 脑机接口商业化应用时间表')} 
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const DiscoveryCard: React.FC<{ title: string; icon: string; onClick: () => void }> = ({ title, icon, onClick }) => (
  <div 
    onClick={onClick} 
    className="glass-panel p-5 rounded-[32px] aspect-[1/1] flex flex-col justify-between bg-gradient-to-t from-primary/10 to-transparent border-white/5 active:scale-95 transition-all cursor-pointer group relative overflow-hidden"
  >
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-6xl">{icon}</span>
     </div>
     <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform relative z-10">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
     </div>
     <h4 className="font-black text-[14px] leading-tight text-slate-100 pr-2 relative z-10">{title}</h4>
  </div>
);

export default Home;
