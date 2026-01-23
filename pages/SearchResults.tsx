
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

type TimeFilter = 'all' | 'day' | 'week' | 'month';
type ModelType = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

const SearchResults: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialQuery = state?.query || "";
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<number | null>(null);
  
  // 筛选器状态
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-3-flash-preview');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const chatSessionRef = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 提取所有消息中的唯一来源域名
  const allDomains = useMemo(() => {
    const domains = new Set<string>();
    messages.forEach(msg => {
      msg.sources?.forEach(src => {
        try {
          const domain = new URL(src.uri).hostname.replace('www.', '');
          domains.add(domain);
        } catch (e) {}
      });
    });
    return Array.from(domains);
  }, [messages]);

  const saveToHistory = (query: string) => {
    const history = JSON.parse(localStorage.getItem('nebula_history') || '[]');
    const newHistory = [query, ...history.filter((h: string) => h !== query)].slice(0, 10);
    localStorage.setItem('nebula_history', JSON.stringify(newHistory));
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(index);
    setTimeout(() => setCopyStatus(null), 2000);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const toggleSource = (domain: string) => {
    const next = new Set(selectedSources);
    if (next.has(domain)) next.delete(domain);
    else next.add(domain);
    setSelectedSources(next);
  };

  const sendMessage = useCallback(async (text: string, overrideModel?: ModelType) => {
    if (!text.trim()) return;
    saveToHistory(text);

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("星核凭证失效。");
      return;
    }

    setLoading(true);
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text }]);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const targetModel = overrideModel || selectedModel;

      // 构造时效性指令
      let timeInstruction = "";
      if (timeFilter === 'day') timeInstruction = " 重点关注过去 24 小时内的最新消息。";
      else if (timeFilter === 'week') timeInstruction = " 优先检索本周内的动态。";
      else if (timeFilter === 'month') timeInstruction = " 汇总过去一个月内的相关资讯。";
      
      // 如果切换了模型，重新创建会话
      if (!chatSessionRef.current || overrideModel) {
        chatSessionRef.current = ai.chats.create({
          model: targetModel,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: `你是一个名为 Nebula 的 AI 搜寻引擎。基于实时搜索结果提供专业、精美、深刻的回答。排版使用 Markdown。必须使用中文。${timeInstruction}记住对话上下文，保持连贯性。`
          }
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      const streamResponse = await chatSessionRef.current.sendMessageStream({ message: text });
      
      let fullResponseText = '';
      for await (const chunk of streamResponse) {
        const chunkText = chunk.text || '';
        fullResponseText += chunkText;
        
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last && last.role === 'model') {
            last.text = fullResponseText;
            const metadata = chunk.candidates?.[0]?.groundingMetadata;
            if (metadata?.groundingChunks) {
              const newSources = metadata.groundingChunks
                .filter(c => c.web)
                .map(c => ({ title: c.web?.title || '参考来源', uri: c.web?.uri || '#' }));
              const existing = last.sources || [];
              const uris = new Set(existing.map(s => s.uri));
              last.sources = [...existing, ...newSources.filter(s => !uris.has(s.uri))];
            }
          }
          return newMsgs;
        });

        if (scrollContainerRef.current) {
           scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }
      setLoading(false);
    } catch (err: any) {
      setError("数据链路中断，请检查网络。");
      setLoading(false);
    }
  }, [selectedModel, timeFilter]);

  useEffect(() => { 
    if (initialQuery && messages.length === 0) sendMessage(initialQuery);
    else if (!initialQuery) navigate('/', { replace: true });
  }, [initialQuery, sendMessage, navigate, messages.length]);

  const onFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || loading) return;
    const text = followUp;
    setFollowUp('');
    sendMessage(text);
  };

  // 动态筛选消息显示逻辑 (这里仅过滤来源标签展示，保持对话连贯)
  const isDomainSelected = (uri: string) => {
    if (selectedSources.size === 0) return true;
    try {
      const d = new URL(uri).hostname.replace('www.', '');
      return selectedSources.has(d);
    } catch(e) { return false; }
  };

  return (
    <div className="bg-background-base min-h-screen flex flex-col overflow-hidden">
      <header className="fixed top-0 inset-x-0 z-[120] bg-background-base/80 backdrop-blur-3xl border-b border-white/5 px-6 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4">
        <div className="flex items-center gap-4 max-w-xl mx-auto w-full mb-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl glass-panel active:scale-90 transition-all shrink-0 border-white/10 outline-none">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex-1 glass-panel rounded-xl px-4 py-2 border-primary/20 flex items-center gap-3 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 animate-pulse">explore</span>
            <span className="text-[13px] font-bold truncate tracking-tight text-slate-300">
              {messages[0]?.text || "探索中..."}
            </span>
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border outline-none
              ${isFilterOpen || selectedSources.size > 0 || timeFilter !== 'all' ? 'border-primary bg-primary/10 text-primary' : 'glass-panel border-white/10 text-slate-400'}
            `}
          >
            <span className="material-symbols-outlined text-[20px]">{isFilterOpen ? 'close' : 'tune'}</span>
          </button>
        </div>

        {/* 动态筛选面板 */}
        <div className={`max-w-xl mx-auto overflow-hidden transition-all duration-500 ease-in-out ${isFilterOpen ? 'max-h-[300px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-5">
            {/* 时间维度 */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">schedule</span> 时间窗口
              </p>
              <div className="flex gap-2">
                {(['all', 'day', 'week', 'month'] as TimeFilter[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border
                      ${timeFilter === t ? 'bg-primary text-slate-900 border-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}
                    `}
                  >
                    {t === 'all' ? '全部' : t === 'day' ? '24小时内' : t === 'week' ? '本周' : '本月'}
                  </button>
                ))}
              </div>
            </div>

            {/* 模型引擎 */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">memory</span> 逻辑引擎
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedModel('gemini-3-flash-preview'); sendMessage(messages[messages.length-1]?.text, 'gemini-3-flash-preview'); }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-2
                    ${selectedModel === 'gemini-3-flash-preview' ? 'bg-primary text-slate-900 border-primary' : 'bg-white/5 border-white/10 text-slate-400'}
                  `}
                >
                  <span className="material-symbols-outlined text-xs">bolt</span> FLASH 极速
                </button>
                <button 
                  onClick={() => { setSelectedModel('gemini-3-pro-preview'); sendMessage(messages[messages.length-1]?.text, 'gemini-3-pro-preview'); }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-2
                    ${selectedModel === 'gemini-3-pro-preview' ? 'bg-primary text-slate-900 border-primary' : 'bg-white/5 border-white/10 text-slate-400'}
                  `}
                >
                  <span className="material-symbols-outlined text-xs">psychology</span> PRO 逻辑
                </button>
              </div>
            </div>

            {/* 来源过滤 */}
            {allDomains.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">language</span> 知识来源库</span>
                  {selectedSources.size > 0 && <button onClick={() => setSelectedSources(new Set())} className="text-primary hover:underline">重置</button>}
                </p>
                <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
                  {allDomains.map(d => (
                    <button 
                      key={d}
                      onClick={() => toggleSource(d)}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all border whitespace-nowrap
                        ${selectedSources.has(d) ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 border-white/10 text-slate-500'}
                      `}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main 
        ref={scrollContainerRef}
        className="flex-1 pt-32 pb-48 px-6 max-w-xl mx-auto w-full overflow-y-auto no-scrollbar scroll-smooth"
      >
        <div className="space-y-12">
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fade-up">
              {msg.role === 'user' ? (
                <div className="flex items-center gap-3 mb-4 text-primary/40 pl-2">
                  <span className="material-symbols-outlined text-sm">alternate_email</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Client Interaction</span>
                </div>
              ) : null}

              <div className={`glass-panel rounded-[32px] p-8 border-white/5 ${msg.role === 'user' ? 'bg-primary/5' : 'bg-slate-900/45'} shadow-2xl relative overflow-hidden`}>
                <div className="text-[15px] leading-[1.8] font-medium text-slate-200">
                   {msg.role === 'model' && !msg.text && loading ? (
                      <div className="space-y-4 opacity-15">
                        <div className="h-3.5 bg-current rounded-full w-full"></div>
                        <div className="h-3.5 bg-current rounded-full w-[85%]"></div>
                        <div className="h-3.5 bg-current rounded-full w-[45%]"></div>
                      </div>
                   ) : (
                      <div className="prose prose-invert max-w-none whitespace-pre-wrap selection:bg-primary/30 tracking-tight">
                         {msg.text}
                      </div>
                   )}
                </div>

                {msg.role === 'model' && msg.text && (
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copyStatus === idx ? 'done_all' : 'content_copy'}
                      </span>
                      {copyStatus === idx ? '已复制' : '复制结果'}
                    </button>
                    {idx === messages.length - 1 && loading && (
                       <div className="flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-primary animate-pulse rounded-full"></span>
                          <span className="text-[9px] font-tech text-primary tracking-widest uppercase">Streaming</span>
                       </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2.5 px-2">
                  {msg.sources
                    .filter(src => isDomainSelected(src.uri))
                    .slice(0, 8)
                    .map((src, si) => (
                    <a key={si} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] text-slate-400 hover:text-primary hover:border-primary/20 transition-all active:scale-95 animate-in fade-in zoom-in duration-300">
                      <img src={`https://www.google.com/s2/favicons?domain=${new URL(src.uri).hostname}`} alt="" className="w-3 h-3 grayscale opacity-30" />
                      <span className="truncate max-w-[120px] font-bold">{src.title}</span>
                    </a>
                  ))}
                  {selectedSources.size > 0 && msg.sources.filter(src => isDomainSelected(src.uri)).length === 0 && (
                    <p className="text-[9px] text-slate-600 italic px-2">该回答中暂无匹配所选域名的具体分片</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="glass-panel p-8 rounded-[32px] border-red-500/20 bg-red-500/5 text-center">
              <span className="material-symbols-outlined text-red-500 text-3xl mb-4">report</span>
              <p className="text-[14px] font-bold text-red-500 tracking-tight">{error}</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 p-6 z-[110] bg-gradient-to-t from-background-base via-background-base/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <form onSubmit={onFollowUpSubmit} className="max-w-xl mx-auto w-full">
          <div className="relative glass-panel rounded-[28px] border border-white/10 flex items-center p-1.5 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] bg-slate-900/95 focus-within:border-primary/50 transition-all duration-500">
            <input 
              type="text" 
              placeholder="深入探讨..." 
              value={followUp} 
              autoComplete="off"
              enterKeyHint="send"
              onChange={(e) => setFollowUp(e.target.value)} 
              className="flex-1 bg-transparent border-none px-6 py-4 text-[16px] focus:ring-0 placeholder-slate-700 font-bold text-slate-50 tracking-tight outline-none" 
              style={{ caretColor: '#00d9e6', outline: 'none', border: 'none', WebkitAppearance: 'none', boxShadow: 'none' }}
            />
            <button 
               type="submit" 
               disabled={loading || !followUp.trim()}
               className="w-13 h-13 min-w-[52px] rounded-[22px] bg-primary text-slate-900 flex items-center justify-center shadow-lg disabled:opacity-10 transition-all active:scale-90 outline-none border-none"
            >
               <span className="material-symbols-outlined font-black text-[22px]">send</span>
            </button>
          </div>
          <p className="text-center text-[8px] font-tech font-bold text-slate-600 mt-5 tracking-[0.5em] uppercase opacity-30 select-none">Nebula Persistent Hub v2.6</p>
        </form>
      </div>
    </div>
  );
};

export default SearchResults;
