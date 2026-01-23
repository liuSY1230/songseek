
import React, { useState, useEffect, useMemo } from 'react';

interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  size: string;
  type: string;
  active?: boolean;
  status: 'idle' | 'running' | 'downloading';
  progress?: number;
  color: string;
}

interface InferencePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

const ModelManager: React.FC = () => {
  const [vram, setVram] = useState(82);
  const [ram, setRam] = useState(78);
  const [activeTab, setActiveTab] = useState<'local' | 'mesh'>('local');
  const [latencyHistory, setLatencyHistory] = useState<number[]>(new Array(20).fill(0).map(() => 40 + Math.random() * 20));

  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);

  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [globalDownloadProgress, setGlobalDownloadProgress] = useState<number | null>(null);

  const presets: InferencePreset[] = [
    { id: 'precise', label: '严谨模式', icon: 'verified', description: '适用于逻辑分析、代码、事实核查', temperature: 0.1, topP: 0.1, maxTokens: 2048 },
    { id: 'balanced', label: '均衡模式', icon: 'balance', description: '适用于日常问答、搜索、总结', temperature: 0.7, topP: 0.9, maxTokens: 4096 },
    { id: 'creative', label: '创意模式', icon: 'auto_awesome', description: '适用于文学创作、脑暴、角色扮演', temperature: 1.2, topP: 0.95, maxTokens: 8192 },
  ];

  const applyPreset = (preset: InferencePreset) => {
    setTemperature(preset.temperature);
    setTopP(preset.topP);
    setMaxTokens(preset.maxTokens);
  };

  const [models, setModels] = useState<ModelEntry[]>(() => {
    const saved = localStorage.getItem('nebula_local_models');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'qwen-2.5-1.5b', name: "通义千问 2.5 1.5B", provider: "阿里巴巴", size: "1.1GB", type: "Q8_0", status: 'running', active: true, color: "border-orange-500/30 text-orange-400 bg-orange-400/5" },
      { id: 'deepseek-r1-1.5b', name: "DeepSeek R1 精简版", provider: "深度求索", size: "1.2GB", type: "Q4_K_M", status: 'idle', color: "border-purple-500/30 text-purple-400 bg-purple-400/5" },
      { id: 'glm-4-9b', name: "智谱 GLM-4 9B", provider: "智谱AI", size: "5.4GB", type: "INT8", status: 'idle', color: "border-blue-500/30 text-blue-400 bg-blue-400/5" },
    ];
  });

  useEffect(() => {
    localStorage.setItem('nebula_local_models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVram(prev => Math.min(Math.max(prev + (Math.random() * 4 - 2), 10), 95));
      setRam(prev => Math.min(Math.max(prev + (Math.random() * 2 - 1), 40), 90));
      setLatencyHistory(prev => {
        const next = [...prev.slice(1), 40 + Math.random() * 30];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = (id: string) => {
    setModels(prev => prev.map(m => ({
      ...m,
      active: m.id === id,
      status: m.id === id ? 'running' : (m.status === 'downloading' ? 'downloading' : 'idle')
    })));
  };

  const handleDownloadFromUrl = () => {
    if (!downloadUrl.trim()) return;
    
    const url = downloadUrl.trim();
    const fileName = url.split('/').pop()?.replace('.gguf', '') || '外部模型';
    const newId = `external-${Date.now()}`;
    
    setIsDownloadModalOpen(false);
    setGlobalDownloadProgress(0);
    
    const newModel: ModelEntry = {
      id: newId,
      name: fileName,
      provider: "外部来源",
      size: "计算中...",
      type: "GGUF",
      status: 'downloading',
      progress: 0,
      color: "border-primary/30 text-primary bg-primary/5"
    };

    setModels(prev => [...prev, newModel]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setModels(prev => prev.map(m => 
          m.id === newId 
            ? { ...m, status: 'idle', progress: 100, size: `${(Math.random() * 4 + 1).toFixed(1)}GB` } 
            : m
        ));
        setGlobalDownloadProgress(null);
        setDownloadUrl('');
      } else {
        setModels(prev => prev.map(m => 
          m.id === newId ? { ...m, progress: Math.floor(progress) } : m
        ));
        setGlobalDownloadProgress(Math.floor(progress));
      }
    }, 500);
  };

  const latencyChart = useMemo(() => {
    const max = Math.max(...latencyHistory);
    return latencyHistory.map((v, i) => {
      const h = (v / max) * 100;
      return <div key={i} className="flex-1 bg-primary/40 rounded-t-sm self-end transition-all duration-1000" style={{ height: `${h}%` }}></div>;
    });
  }, [latencyHistory]);

  const activeModel = models.find(m => m.active);

  return (
    <div className="relative flex flex-col min-h-screen max-w-xl mx-auto bg-transparent pb-32 hardware-accelerated">
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-base/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-sm p-8 rounded-[32px] border-primary/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">通过 URL 挂载</h3>
              <button onClick={() => setIsDownloadModalOpen(false)} className="material-symbols-outlined text-slate-500">close</button>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">请输入 .GGUF 权重文件的公网下载链接。系统将通过加密信道拉取。</p>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="https://huggingface.co/.../model.gguf"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full glass-panel bg-white/5 border-primary/20 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
              />
              <button 
                onClick={handleDownloadFromUrl}
                className="w-full py-4 bg-primary text-slate-900 font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                启动同步进程
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-6 pt-16 pb-6 sticky top-0 bg-background-base/80 backdrop-blur-xl z-30">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tight leading-none">模型引擎</h1>
          <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mt-2">私有化神经网络控制台</p>
        </div>
        <button className="w-12 h-12 rounded-2xl flex items-center justify-center glass-panel text-primary active:rotate-45 transition-transform border-primary/20">
          <span className="material-symbols-outlined text-2xl font-bold">memory</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 space-y-8 no-scrollbar animate-in fade-in duration-700">
        {globalDownloadProgress !== null && (
          <div className="glass-panel rounded-2xl p-4 border-primary/30 bg-primary/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                正在通过高速骨干网同步模型权重...
              </span>
              <span className="text-[10px] font-mono font-bold text-primary">{globalDownloadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${globalDownloadProgress}%` }}></div>
            </div>
          </div>
        )}

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[11px] uppercase tracking-widest text-gray-500 font-black">硬件资源负载</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
               <span className="text-[10px] font-black text-emerald-500 uppercase">状态：卓越</span>
            </div>
          </div>
          <div className="glass-panel rounded-[32px] p-6 flex flex-col gap-6 border-white/5">
            <div className="flex justify-around items-center">
              <Gauge label="显存占用" percent={Math.round(vram)} color="text-primary-light" />
              <div className="w-px h-12 bg-gray-500/10"></div>
              <Gauge label="内存占用" percent={Math.round(ram)} value="6.2G" color="text-primary" />
            </div>
            <div className="pt-2 border-t border-white/5">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">推理延迟实时波动 (毫秒)</span>
                  <span className="text-[11px] font-mono text-primary font-bold">{Math.round(latencyHistory[19])}ms</span>
               </div>
               <div className="h-10 flex items-end gap-1 px-1">
                  {latencyChart}
               </div>
            </div>
          </div>
        </section>

        <div className="flex p-1.5 glass-panel rounded-2xl mx-1 border-white/5">
          <button onClick={() => setActiveTab('local')} className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${activeTab === 'local' ? 'bg-primary text-white shadow-xl' : 'text-gray-500'}`}>本地挂载</button>
          <button onClick={() => setActiveTab('mesh')} className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${activeTab === 'mesh' ? 'bg-primary text-white shadow-xl' : 'text-gray-500'}`}>协同计算</button>
        </div>

        <section className="space-y-4">
          {activeTab === 'local' ? (
            <div className="flex flex-col gap-4">
              {models.map(model => (
                <ModelCard key={model.id} model={model} onActivate={() => handleActivate(model.id)} />
              ))}
              
              <div className="grid grid-cols-2 gap-3">
                <button className="py-6 rounded-[28px] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary transition-all hover:border-primary/50 group active:scale-95">
                  <span className="material-symbols-outlined text-3xl group-hover:rotate-180 transition-transform duration-500">upload_file</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">本地导入</span>
                </button>
                <button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="py-6 rounded-[28px] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary transition-all hover:border-primary/50 group active:scale-95"
                >
                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform duration-500">cloud_download</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">URL 挂载</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
               <div className="glass-panel rounded-[40px] p-10 border-primary/20 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <span className="material-symbols-outlined text-5xl mb-6 text-primary animate-pulse inline-block">hub</span>
                  <h3 className="font-black text-xl mb-3 tracking-tight">星网 Mesh 协作中心</h3>
                  <p className="text-sm text-gray-500 mb-8 px-4">正在局域网内广播星核协议，寻找可用计算节点以构建临时分布式张量并行...</p>
                  <div className="flex justify-center gap-3">
                     {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}></div>)}
                  </div>
               </div>
            </div>
          )}
        </section>

        {activeTab === 'local' && activeModel && (
          <section key={activeModel.id} className="animate-in slide-in-from-bottom-8 duration-700 pb-16">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[11px] uppercase tracking-widest text-primary font-black">推理调优：{activeModel.name}</h2>
              <span className="material-symbols-outlined text-primary text-sm animate-spin-slow">tune</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {presets.map((preset) => (
                <button 
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`glass-panel p-4 rounded-3xl flex flex-col items-center text-center transition-all border group active:scale-95 ${
                    temperature === preset.temperature && topP === preset.topP 
                    ? 'border-primary/60 bg-primary/10' 
                    : 'border-white/5 hover:border-primary/20 hover:bg-white/5'
                  }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${temperature === preset.temperature ? 'bg-primary text-white' : 'bg-white/5 text-slate-500 group-hover:text-primary'}`}>
                      <span className="material-symbols-outlined text-xl">{preset.icon}</span>
                    </div>
                    <span className="text-[11px] font-black text-current mb-1">{preset.label}</span>
                    <span className="text-[8px] text-slate-500 leading-tight line-clamp-2 font-medium">{preset.description}</span>
                </button>
              ))}
            </div>

            <div className="glass-panel rounded-[40px] p-8 border-white/5 bg-gradient-to-br from-primary/10 to-transparent space-y-8 shadow-2xl">
              <Slider label="思维温度 (Temperature)" value={temperature} min={0} max={2} step={0.1} onChange={v => setTemperature(v)} hint="较低值更稳定，较高值更发散" />
              <Slider label="核心采样 (Top-P)" value={topP} min={0} max={1} step={0.05} onChange={v => setTopP(v)} hint="影响词元搜索空间的宽度" />
              <Slider label="最大长度 (Max Tokens)" value={maxTokens} min={512} max={16384} step={512} onChange={v => setMaxTokens(v)} hint="设置回答的最大生成词元上限" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint: string }> = ({ label, value, min, max, step, onChange, hint }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-[14px] font-black tracking-tight">{label}</span>
      <span className="px-3 py-1 rounded-xl bg-primary text-white font-mono text-xs font-black shadow-lg shadow-primary/20">{value.toFixed(value < 10 ? 2 : 0)}</span>
    </div>
    <div className="relative flex items-center">
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" />
    </div>
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{hint}</p>
  </div>
);

const Gauge: React.FC<{ label: string; percent: number; color: string; value?: string }> = ({ label, percent, color, value }) => (
  <div className="flex flex-col items-center gap-3 flex-1">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="text-white/5 stroke-current fill-none" cx="50" cy="50" r="42" strokeWidth="6" />
        <circle className={`${color} stroke-current fill-none transition-all duration-1000 ease-out`} cx="50" cy="50" r="42" strokeWidth="10" strokeDasharray={`${percent * 2.64}, 264`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-black tracking-tighter ${color}`}>{value || `${percent}%`}</span>
      </div>
    </div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">{label}</span>
  </div>
);

const ModelCard: React.FC<{ model: ModelEntry; onActivate: () => void }> = ({ model, onActivate }) => (
  <div 
    onClick={model.status === 'idle' ? onActivate : undefined}
    className={`relative overflow-hidden rounded-[32px] border transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) group cursor-pointer ${
      model.active 
        ? 'border-primary/50 bg-primary/10 shadow-2xl scale-[1.02] -translate-y-1' 
        : 'glass-panel border-white/5 hover:border-primary/30 hover:-translate-y-0.5'
    }`}
  >
    <div className="relative flex items-center justify-between p-5">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 transition-all duration-500 ${model.active ? 'bg-primary text-white scale-110 shadow-lg rotate-3' : 'bg-white/5 text-slate-400 group-hover:text-primary group-hover:bg-primary/10'}`}>
          <span className="material-symbols-outlined text-3xl">{model.status === 'running' ? 'bolt' : model.status === 'downloading' ? 'sync' : 'deployed_code'}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
             <h3 className="font-black text-[16px] leading-tight truncate">{model.name}</h3>
             <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest shrink-0 transition-colors ${model.active ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                {model.provider}
             </span>
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-2 uppercase tracking-[0.2em]">{model.type} • {model.size}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {model.status === 'running' ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 animate-in fade-in zoom-in duration-300">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">活跃</span>
          </div>
        ) : model.status === 'downloading' ? (
          <div className="flex flex-col items-end gap-1.5 w-16">
            <span className="text-[10px] font-black text-primary uppercase">{model.progress}%</span>
            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${model.progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 rounded-2xl bg-white/5 group-hover:bg-primary/20 text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-all border border-white/10">挂载</div>
        )}
      </div>
    </div>
  </div>
);

export default ModelManager;
