
import React, { useState, useEffect, useRef } from 'react';

const DatabaseManager: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'analysis'>('tables');
  const [connections, setConnections] = useState(24);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        return next < 15 ? 15 : next > 48 ? 48 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`已选择文件: ${file.name}\n正在通过本地加密信道解构 SQL 数据流...`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 max-w-xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv,.sql" className="hidden" />

      <header className="px-6 pt-16 pb-6 sticky top-0 bg-background-base/80 backdrop-blur-xl z-30 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-current tracking-tight">存储引擎</h1>
            <p className="text-[11px] text-primary font-black tracking-[0.3em] uppercase mt-1.5">嵌入式 MySQL v8.4 集群</p>
          </div>
          <div className="flex gap-2">
            <button className="w-11 h-11 rounded-2xl flex items-center justify-center glass-panel text-slate-500 border-primary/10">
              <span className="material-symbols-outlined text-[22px]">terminal</span>
            </button>
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isOptimizing ? 'bg-emerald-500 text-white animate-spin' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
            >
              <span className="material-symbols-outlined text-[22px]">{isOptimizing ? 'sync' : 'auto_mode'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        <section className="grid grid-cols-2 gap-4">
          <StatCard label="总条目" value="4.2M" subValue="今日新增 1.2k" icon="view_list" />
          <StatCard label="实时吞吐" value="458" subValue="运行平稳" icon="show_chart" />
          <StatCard label="活跃连接" value={connections.toString()} subValue="峰值 56" icon="cable" />
          <StatCard label="存储加密" value="已开启" subValue="物理加密" icon="verified_user" />
        </section>

        <section className="glass-panel rounded-[32px] p-6 border-primary/5 shadow-xl group">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-black text-sm">InnoDB 缓冲池占用</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">命中率: 99.82%</p>
            </div>
            <span className="text-sm font-black text-primary">1.2G / 2.0G</span>
          </div>
          <div className="w-full h-2.5 bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full group-hover:bg-primary-light transition-colors" style={{ width: '60%' }}></div>
          </div>
        </section>

        <div className="flex p-1.5 glass-panel rounded-2xl">
          <button onClick={() => setActiveTab('tables')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'tables' ? 'bg-primary text-white' : 'text-slate-500'}`}>物理数据表</button>
          <button onClick={() => setActiveTab('analysis')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'analysis' ? 'bg-primary text-white' : 'text-slate-500'}`}>慢查询审计</button>
        </div>

        {activeTab === 'tables' ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-black">已加载表库 (4)</h3>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span className="text-[10px] font-black uppercase tracking-widest">导入数据</span>
              </button>
            </div>
            <div className="space-y-3">
              <TableItem name="knowledge_vectors" rows="1.2M" size="840M" engine="InnoDB" status="同步中" />
              <TableItem name="private_embeddings" rows="84k" size="124M" engine="InnoDB" status="已锁定" />
              <TableItem name="secure_cache" rows="2.8M" size="2.1G" engine="MyISAM" status="活跃" />
            </div>
          </section>
        ) : (
          <section className="space-y-6 animate-in fade-in duration-500">
             <div className="glass-panel rounded-[32px] p-6 border-red-500/10 bg-red-500/5">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined">warning</span>
                   </div>
                   <h3 className="font-black text-sm">检测到 2 条慢查询记录</h3>
                </div>
                <div className="space-y-3">
                   <QueryItem sql="SELECT * FROM massive_data JOIN meta..." time="450毫秒" />
                   <QueryItem sql="UPDATE knowledge_vectors SET cluster..." time="1.2秒" />
                </div>
             </div>
             <button className="w-full py-4 glass-panel text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all">一键重构索引优化性能</button>
          </section>
        )}
      </main>
    </div>
  );
};

const QueryItem: React.FC<{ sql: string; time: string }> = ({ sql, time }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
     <code className="text-[10px] font-mono text-slate-500 truncate">{sql}</code>
     <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">执行超时</span>
        <span className="text-xs font-black text-current">{time}</span>
     </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; subValue: string; icon: string }> = ({ label, value, subValue, icon }) => (
  <div className="glass-panel rounded-[28px] p-5 border-primary/5 flex flex-col justify-between h-[110px] hover:scale-[1.02] transition-transform">
    <div className="flex items-center gap-2 opacity-60">
      <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div>
      <p className="text-2xl font-black leading-tight">{value}</p>
      <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase tracking-widest">{subValue}</p>
    </div>
  </div>
);

const TableItem: React.FC<{ name: string; rows: string; size: string; engine: string; status: string }> = ({ name, rows, size, engine, status }) => (
  <div className="glass-panel rounded-2xl px-4 py-4 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer border-primary/5">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
        <span className="material-symbols-outlined text-[22px]">table_rows</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-black leading-tight">{name}</span>
        <div className="flex items-center gap-2 mt-1.5 opacity-60 font-bold text-[10px] uppercase tracking-tight">
          <span>{rows} 行数据</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span>{size}</span>
          <span className="px-1.5 bg-primary/20 text-primary rounded-md ml-1">{engine}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{status}</span>
       <div className={`w-2 h-2 rounded-full ${status === '活跃' || status === '同步中' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
    </div>
  </div>
);

export default DatabaseManager;
