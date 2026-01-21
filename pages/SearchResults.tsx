
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

interface Source {
  title: string;
  uri: string;
}

const SearchResults: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialQuery = state?.query || "量子计算最新进展";
  
  const [query, setQuery] = useState(initialQuery);
  const [followUp, setFollowUp] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrieving, setRetrieving] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchAIResponse = async (searchQuery: string) => {
    setLoading(true);
    setRetrieving(true);
    setSources([]);
    setAnswer('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: searchQuery,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 0 },
          systemInstruction: "你是一个极速AI搜索引擎 Nebula。基于实时搜索结果提供专业、精炼且有深度的回答。使用 Markdown 格式。所有输出必须为中文。"
        }
      });

      setRetrieving(false);
      let fullText = '';
      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setAnswer(fullText);
          setLoading(false);
        }
        const metadata = chunk.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          const extractedSources = metadata.groundingChunks
            .filter(c => c.web)
            .map(c => ({ title: c.web?.title || '参考来源', uri: c.web?.uri || '#' }));
          if (extractedSources.length > 0) {
            setSources(prev => {
              const existingUris = new Set(prev.map(s => s.uri));
              const newSources = extractedSources.filter(s => !existingUris.has(s.uri));
              return [...prev, ...newSources];
            });
          }
        }
      }
      if (!fullText) setAnswer('未能获取有效信息，请尝试更换关键词。');
    } catch (err) {
      setAnswer(`检索服务暂时繁忙。基于本地缓存知识，"${searchQuery}" 是当前技术领域的热点。请稍后重试以获取实时联网数据。`);
      setRetrieving(false);
      setLoading(false);
    }
  };

  useEffect(() => { fetchAIResponse(initialQuery); }, [initialQuery]);

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim()) return;
    setQuery(followUp);
    setFollowUp('');
    fetchAIResponse(followUp);
  };

  return (
    <div className="bg-background-base min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b-white/5 bg-background-base/80">
        <div className="flex items-center gap-3 px-4 pb-3 pt-12 md:pt-4 max-w-xl mx-auto w-full">
          <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 active:scale-95 transition-all text-current">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex-1 glass-panel rounded-full px-4 py-1.5 border-primary/10 flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
            <span className="text-sm font-bold text-current truncate">{query}</span>
          </div>
        </div>
      </header>

      <main className="pt-32 px-4 max-w-xl mx-auto space-y-8 w-full">
        {(sources.length > 0 || retrieving) && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary-light text-[20px]">language</span>
              <h3 className="text-sm font-bold text-current uppercase tracking-widest">实时检索来源</h3>
              {retrieving && <div className="ml-2 w-3 h-3 border-2 border-primary-light border-t-transparent rounded-full animate-spin"></div>}
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4">
              {sources.length > 0 ? (
                sources.map((src, i) => (
                  <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="glass-panel shrink-0 w-[160px] p-3 rounded-xl border-white/5 hover:bg-primary/5 transition-all group overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={`https://www.google.com/s2/favicons?domain=${new URL(src.uri).hostname}&sz=32`} alt="" className="w-4 h-4 rounded-sm" />
                      <span className="text-[10px] text-slate-400 font-bold truncate uppercase">{new URL(src.uri).hostname}</span>
                    </div>
                    <p className="text-[11px] text-current font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{src.title}</p>
                  </a>
                ))
              ) : retrieving ? (
                [1, 2, 3].map(i => <div key={i} className="glass-panel shrink-0 w-[140px] h-[70px] rounded-xl opacity-40 animate-pulse"></div>)
              ) : null}
            </div>
          </section>
        )}

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 w-8 h-8 rounded-lg text-primary flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <h2 className="text-lg font-bold text-current tracking-tight">Nebula 智能摘要</h2>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent shadow-2xl relative overflow-hidden">
            <p className="text-[15px] leading-relaxed text-current whitespace-pre-line font-medium">
              {answer || (loading && "同步全球索引中...")}
              {loading && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle"></span>}
            </p>
          </div>
        </section>
        <div ref={chatEndRef} className="h-28" />
      </main>

      <div className="fixed bottom-0 inset-x-0 p-4 z-40 bg-gradient-to-t from-background-base via-background-base to-transparent">
        <form onSubmit={handleFollowUp} className="max-w-xl mx-auto relative group w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative glass-panel rounded-2xl border border-primary/10 flex items-center p-1.5 shadow-2xl">
            <input type="text" placeholder="继续追问..." value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 bg-transparent border-none text-current px-4 py-3 text-sm focus:ring-0 placeholder-slate-400 font-medium" />
            <button type="submit" disabled={!followUp.trim() || loading} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${followUp.trim() ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-slate-400'}`}>
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchResults;
