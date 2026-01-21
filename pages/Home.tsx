
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC<{ onThemeToggle?: () => void, theme?: string }> = ({ onThemeToggle, theme }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isScanActive, setIsScanActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPrivacyCenter, setShowPrivacyCenter] = useState(false);
  const [syncProgress, setSyncProgress] = useState(98.4);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncProgress(p => {
        const next = p + (Math.random() * 0.1 - 0.05);
        return Math.min(Math.max(next, 98), 100);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate('/search-results', { state: { query } });
    }
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    navigate('/search-results', { state: { query: text } });
  };

  const startVoice = () => {
    setIsVoiceActive(true);
    setIsListening(true);
    setTimeout(() => {
      setQuery("分析2025年量子计算趋势");
      setIsListening(false);
      setTimeout(() => {
        setIsVoiceActive(false);
        navigate('/search-results', { state: { query: "2025年量子计算趋势" } });
      }, 1000);
    }, 2500);
  };

  const startScan = async () => {
    setIsScanActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("无法访问摄像头，请检查权限。");
      setIsScanActive(false);
    }
  };

  const closeScan = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanActive(false);
  };

  const captureAndProcess = () => {
    setIsListening(true);
    setTimeout(() => {
      setQuery("识别结果：科技文档 #QT-2025");
      setIsListening(false);
      setTimeout(() => {
        closeScan();
        navigate('/search-results', { state: { query: "分析科技文档 QT-2025" } });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 relative">
      <div className="fixed inset-0 z-0 ambient-glow opacity-50 pointer-events-none"></div>

      <header className="pt-10 pb-4 px-6 flex justify-between items-center w-full relative z-10">
        <div className="flex gap-2.5">
           <button 
            onClick={onThemeToggle}
            className="w-11 h-11 glass-panel flex items-center justify-center rounded-2xl text-primary transition-all active:scale-90 border-primary/10"
           >
            <span className="material-symbols-outlined text-[22px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
           </button>
           <div className="glass-panel flex h-11 items-center gap-x-3 rounded-2xl px-4 border-primary/5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-primary uppercase leading-none">同步活跃</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">{syncProgress.toFixed(2)}% 已加载</span>
              </div>
           </div>
        </div>
        
        <button 
          onClick={() => setShowPrivacyCenter(!showPrivacyCenter)}
          className="flex items-center gap-2 text-primary glass-panel px-4 h-11 rounded-2xl border-primary/20 hover:bg-primary/5 transition-all"
        >
           <span className="material-symbols-outlined text-[20px]">verified_user</span>
           <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">隐私防护盾</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 w-full max-w-xl mx-auto py-4 relative z-10">
        {showPrivacyCenter && (
          <div className="mb-8 glass-panel rounded-[32px] p-6 border-primary/30 bg-primary/5 animate-in slide-in-from-top-4 duration-500 shadow-2xl">
             <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">security</span>
                   </div>
                   <div>
                      <h4 className="font-black text-[13px] uppercase tracking-tight">星盾本地隔离层</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">物理层级数据加密</p>
                   </div>
                </div>
                <button onClick={() => setShowPrivacyCenter(false)} className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors">
                   <span className="material-symbols-outlined text-sm">close</span>
                </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl flex flex-col items-center text-center border border-white/50 dark:border-transparent">
                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">当前算法</span>
                   <span className="text-[13px] font-black text-primary">AES-256-GCM</span>
                </div>
                <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl flex flex-col items-center text-center border border-white/50 dark:border-transparent">
                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">本地通道</span>
                   <span className="text-[13px] font-black text-primary">TLS 1.3 SECURE</span>
                </div>
             </div>
          </div>
        )}

        <div className="mb-12 text-center">
          <div className="inline-block mb-4 p-1 rounded-full bg-primary/5 border border-primary/10 animate-float">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">star</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-current">
            songseek <span className="text-primary-light">内核</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-4 text-[15px] font-medium leading-relaxed max-w-xs mx-auto">
            为您构建的 <span className="text-primary font-bold">完全私有化</span> 智能知识中枢
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-12 relative group">
          <div className="absolute -inset-2 bg-primary/20 rounded-[32px] blur-2xl opacity-0 group-focus-within:opacity-40 transition duration-700"></div>
          <div className="relative flex items-center w-full glass-input rounded-[28px] p-2.5 shadow-xl border-primary/5">
            <div className="pl-4 pr-3 text-primary">
              <span className="material-symbols-outlined text-[28px]">search</span>
            </div>
            <input
              aria-label="搜索"
              className="w-full bg-transparent border-none focus:ring-0 text-lg py-3 px-0 font-bold placeholder-slate-400"
              placeholder="寻找灵感或分析私有数据..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-2 pr-2">
              <button type="button" onClick={startVoice} className="w-12 h-12 rounded-2xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all active:scale-90">
                <span className="material-symbols-outlined text-[26px]">mic</span>
              </button>
              <button type="button" onClick={startScan} className="w-12 h-12 rounded-2xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all active:scale-90">
                <span className="material-symbols-outlined text-[26px]">center_focus_strong</span>
              </button>
            </div>
          </div>
        </form>

        <section className="mb-12">
           <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex flex-col">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">今日搜索聚类</h3>
                <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-1">深度洞察</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">hub</span>
           </div>
           <div className="flex flex-wrap gap-2.5">
              {[
                { label: '多模态推理', score: 95 },
                { label: '向量嵌入优化', score: 82 },
                { label: '边缘计算安全', score: 71 },
                { label: 'RAG 架构分析', score: 64 },
                { label: '私有知识蒸馏', score: 58 }
              ].map((tag, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSuggestionClick(tag.label)}
                  className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 hover:scale-[1.03] hover:border-primary/30 transition-all active:scale-95 group"
                >
                  <span className="text-[13px] font-black text-current">{tag.label}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20 overflow-hidden group-hover:w-8 transition-all duration-500">
                    <div className="h-full bg-primary" style={{ width: `${tag.score}%` }}></div>
                  </div>
                </button>
              ))}
           </div>
        </section>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-black tracking-tight">知识发现</h3>
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <DiscoveryCard 
              tag="研究" 
              title="2025 全球边缘 AI 算力分布白皮书" 
              img="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"
              onClick={() => handleSuggestionClick("2025 边缘AI报告")}
            />
            <DiscoveryCard 
              tag="架构" 
              title="本地化混合增强生成模型 (MoE-RAG)" 
              img="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400"
              onClick={() => handleSuggestionClick("MoE-RAG架构分析")}
            />
          </div>
        </div>
      </main>

      {/* 语音交互 Overlay */}
      {isVoiceActive && (
        <div className="fixed inset-0 z-[100] bg-background-base/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="relative w-56 h-56 mb-16">
             <div className={`absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse ${isListening ? 'scale-150' : 'scale-100'}`}></div>
             <div className="relative w-full h-full glass-panel rounded-full flex items-center justify-center border-primary/20 shadow-2xl">
               <div className="flex items-end gap-3 h-20">
                 {[1, 2, 3, 4, 5, 6, 7].map(i => (
                   <div key={i} className={`w-2.5 bg-primary rounded-full transition-all duration-300 ${isListening ? 'animate-bounce' : 'h-2'}`} style={{ height: isListening ? `${40 + Math.random() * 60}px` : '12px', animationDelay: `${i * 0.12}s` }}></div>
                 ))}
               </div>
             </div>
           </div>
           <h2 className="text-3xl font-black mb-4 tracking-tight">{isListening ? '正在进行本地语义分析...' : '内核正在响应...'}</h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold text-base h-8 tracking-tight">{query || "语音识别过程由本地神经网络处理，确保隐私安全"}</p>
           <button onClick={() => setIsVoiceActive(false)} className="mt-20 w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-xl">
             <span className="material-symbols-outlined text-3xl">close</span>
           </button>
        </div>
      )}

      {/* 扫码识别 Overlay */}
      {isScanActive && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="absolute inset-0 z-0">
            <video ref={videoRef} className="w-full h-full object-cover opacity-60" playsInline muted></video>
          </div>
          
          {/* 扫描动画框 */}
          <div className="relative z-10 w-64 h-64 border-2 border-primary/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(180,83,9,0.3)]">
             <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(180,83,9,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
             <div className="absolute inset-0 border-[40px] border-black/20"></div>
          </div>

          <div className="relative z-10 mt-12 text-center">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {isListening ? '正在解析文档结构...' : '对准文档或二维码'}
            </h2>
            <p className="text-white/60 font-bold text-sm tracking-widest uppercase">
              {isListening ? 'OCR & 实体提取中' : '星核自动捕捉技术'}
            </p>
          </div>

          <div className="absolute bottom-16 inset-x-0 flex items-center justify-center gap-8 z-10">
            <button onClick={closeScan} className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white/50 border-white/10 hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <button onClick={captureAndProcess} disabled={isListening} className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-all">
              {isListening ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-4xl">photo_camera</span>
              )}
            </button>
            <div className="w-16 h-16 opacity-0"></div> {/* 占位平衡 */}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(256px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const DiscoveryCard: React.FC<{ tag: string; title: string; img: string; onClick: () => void }> = ({ tag, title, img, onClick }) => (
  <div onClick={onClick} className="glass-panel rounded-[32px] p-5 flex flex-col gap-4 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer group border-primary/5 bg-white/40 dark:bg-white/[0.03]">
    <div className="h-32 w-full rounded-2xl bg-slate-200 overflow-hidden relative">
      <img src={img} alt={title} className="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent mix-blend-multiply opacity-0 group-hover:opacity-40 transition-opacity"></div>
    </div>
    <div className="px-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{tag}</p>
      </div>
      <h4 className="font-black text-[15px] leading-tight line-clamp-2 text-current group-hover:text-primary transition-colors">{title}</h4>
    </div>
  </div>
);

export default Home;
