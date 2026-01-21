
import React, { useState, useEffect } from 'react';

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

  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);

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

  const [models, setModels] = useState<ModelEntry[]>([
    { id: 'qwen-2.5-1.5b', name: "通义千问 2.5 1.5B", provider: "阿里巴巴", size: "1.1GB", type: "Q8_0", status: 'running', active: true, color: "border-orange-500/30 text-orange-400 bg-orange-400/5" },
    { id: 'deepseek-r1-1.5b', name: "DeepSeek R1 精简版", provider: "深度求索", size: "1.2GB", type: "Q4_K_M", status: 'idle', color: "border-purple-500/30 text-purple-400 bg-purple-400/5" },
    { id: 'glm-4-9b', name: "智谱 GLM-4 9B", provider: "智谱AI", size: "5.4GB", type: "INT8", status: 'idle', color: "border-blue-500/30 text-blue-400 bg-blue-400/5" },
  ]);

  const activeModel = models.find(m => m.active);

  useEffect(() => {
    const interval = setInterval(() => {
      setVram(prev => Math.min(Math.max(prev + (Math.random() * 4 - 2), 10), 95));
      setRam(prev => Math.min(Math.max(prev + (Math.random() * 2 - 1), 40), 90));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = (id: string) => {
    setModels(prev => prev.map(m => ({
      ...m,
      active: m.id === id,
      status: m.id === id ? 'running' : 'idle'
    })));
  };

  return (
    <div className="relative flex flex-col min-h-screen max-w-xl mx-auto bg-transparent pb-32">
      <header className="flex items-center justify-between px-6 pt-16 pb-6">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tight leading-none">模型引擎</h1>
          <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mt-2">私有化神经网络控制台</p>
        </div>
        <button className="w-12 h-12 rounded-2xl flex items-center justify-center glass-panel text-primary">
          <span className="material-symbols-outlined text-2xl">memory</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 space-y-8 no-scrollbar">
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[11px] uppercase tracking-widest text-gray-500 font-black">硬件资源负载</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
               <span className="text-[10px] font-black text-emerald-500 uppercase">状态：卓越</span>
            </div>
          </div>
          <div className="glass-panel rounded-[32px] p-6 flex justify-around items-center">
            <Gauge label="计算负载" percent={45} color="text-primary" />
            <div className="w-px h-12 bg-gray-500/10"></div>
            <Gauge label="显存占用" percent={Math.round(vram)} color="text-primary-light" />
            <div className="w-px h-12 bg-gray-500/10"></div>
            <Gauge label="内存占用" percent={Math.round(ram)} value="6.2G" color="text-primary" />
          </div>
        </section>

        <div className="flex p-1.5 glass-panel rounded-2xl mx-1">
          <button onClick={() => setActiveTab('local')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'local' ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}>本地挂载</button>
          <button onClick={() => setActiveTab('mesh')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'mesh' ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}>协同计算 (Mesh)</button>
        </div>

        <section className="space-y-4">
          {activeTab === 'local' ? (
            <div className="flex flex-col gap-3.5">
              {models.map(model => (
                <ModelCard key={model.id} model={model} onActivate={() => handleActivate(model.id)} />
              ))}
              <button className="py-4 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-center gap-2 text-gray-500 hover:text-primary transition-all group">
                <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add_circle</span>
                <span className="text-[11px] font-black uppercase tracking-widest">导入 GGUF 权重</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
               <div className="glass-panel rounded-3xl p-8 border-primary/20 text-center relative overflow-hidden">
                  <span className="material-symbols-outlined text-4xl mb-4 text-primary animate-float inline-block">hub</span>
                  <h3 className="font-black text-lg mb-2">星网协作中心</h3>
                  <p className="text-sm text-gray-500 mb-6">正在局域网内搜索可用的计算节点以分担推理任务...</p>
                  <div className="flex justify-center gap-2 mb-8">
                     {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                  </div>
               </div>
            </div>
          )}
        </section>

        {activeTab === 'local' && activeModel && (
          <section className="animate-in slide-in-from-bottom-6 duration-500 pb-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[11px] uppercase tracking-widest text-primary font-black">推理引擎调优：{activeModel.name}</h2>
              <span className="material-symbols-outlined text-primary text-sm">tune</span>
            </div>

            {/* 推荐预设组件 */}
            <div className="mb-6 space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">场景推荐预设</p>
               <div className="grid grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <button 
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`glass-panel p-4 rounded-2xl flex flex-col items-center text-center transition-all border ${
                        temperature === preset.temperature && topP === preset.topP 
                        ? 'border-primary/60 bg-primary/10 scale-[1.02]' 
                        : 'border-primary/5 hover:bg-white/5'
                      }`}
                    >
                       <span className={`material-symbols-outlined text-xl mb-2 ${temperature === preset.temperature ? 'text-primary' : 'text-slate-400'}`}>
                         {preset.icon}
                       </span>
                       <span className="text-[11px] font-black text-current">{preset.label}</span>
                       <span className="text-[8px] mt-1 text-slate-500 leading-tight line-clamp-2">{preset.description}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent space-y-6">
              <Slider label="思维温度 (Temperature)" value={temperature} min={0} max={2} step={0.1} onChange={v => setTemperature(v)} hint="较低值更严谨，较高值更具创造力" />
              <Slider label="核心采样 (Top-P)" value={topP} min={0} max={1} step={0.05} onChange={v => setTopP(v)} hint="核采样阈值，影响输出的多样性" />
              <Slider label="最大词元 (Max Tokens)" value={maxTokens} min={512} max={8192} step={512} onChange={v => setMaxTokens(v)} hint="单词生成的长度限制" />
              <div className="pt-2">
                <button 
                  onClick={() => applyPreset(presets[1])}
                  className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-black rounded-xl border border-primary/20 transition-all uppercase tracking-widest active:scale-95"
                >
                  重置为标准均衡配置
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint: string }> = ({ label, value, min, max, step, onChange, hint }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-[13px] font-black tracking-tight">{label}</span>
      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono text-xs font-black">{value.toFixed(value < 10 ? 2 : 0)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1.5 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary" />
    <p className="text-[10px] text-slate-500 font-medium">{hint}</p>
  </div>
);

const Gauge: React.FC<{ label: string; percent: number; color: string; value?: string }> = ({ label, percent, color, value }) => (
  <div className="flex flex-col items-center gap-3 flex-1">
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="text-gray-500/5 stroke-current fill-none" cx="50" cy="50" r="42" strokeWidth="8" />
        <circle className={`${color} stroke-current fill-none transition-all duration-700 ease-out`} cx="50" cy="50" r="42" strokeWidth="8" strokeDasharray={`${percent * 2.64}, 264`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-black ${color}`}>{value || `${percent}%`}</span>
      </div>
    </div>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center leading-tight">{label}</span>
  </div>
);

const ModelCard: React.FC<{ model: ModelEntry; onActivate: () => void }> = ({ model, onActivate }) => (
  <div className={`relative overflow-hidden rounded-[24px] border transition-all duration-300 ${model.active ? 'border-primary/40 bg-primary/5 shadow-xl' : 'glass-panel border-primary/5 hover:bg-primary/5'}`}>
    <div className="relative flex items-center justify-between p-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ${model.color}`}>
          <span className="material-symbols-outlined text-2xl">{model.status === 'running' ? 'bolt' : 'deployed_code'}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
             <h3 className="font-black text-[15px] leading-tight truncate">{model.name}</h3>
             <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono shrink-0">{model.provider}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest">{model.type} • {model.size}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {model.status === 'running' ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">活跃中</span>
          </div>
        ) : (
          <button onClick={onActivate} className="px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary text-[10px] font-black uppercase tracking-widest text-current hover:text-white transition-all active:scale-95">挂载</button>
        )}
      </div>
    </div>
  </div>
);

export default ModelManager;
