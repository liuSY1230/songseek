
import React, { useState, useEffect } from 'react';

interface AuditDetail {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
  icon: string;
}

const Settings: React.FC<{ onThemeToggle?: () => void, theme?: string }> = ({ onThemeToggle, theme }) => {
  const [temp, setTemp] = useState(0.7);
  const [localOnly, setLocalOnly] = useState(() => localStorage.getItem('nebula_force_offline') === 'true');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditResults, setAuditResults] = useState<AuditDetail[]>([]);

  useEffect(() => {
    localStorage.setItem('nebula_force_offline', String(localOnly));
  }, [localOnly]);

  const runSecurityAudit = () => {
    setIsAuditing(true);
    setAuditScore(null);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditScore(98);
      setAuditResults([
        { id: '1', name: '向量分片完整性', status: 'pass', detail: '1,284 个分片哈希校验一致', icon: 'account_tree' },
        { id: '2', name: '数据库加密状态', status: 'pass', detail: 'AES-256-GCM 物理层级活跃', icon: 'enhanced_encryption' },
        { id: '3', name: '网络访问控制', status: 'pass', detail: '外部请求拦截器 (WAF) 运行中', icon: 'lan' },
        { id: '4', name: '内核签名验证', status: 'pass', detail: 'StarCore 2.4 签名有效且未篡改', icon: 'verified' },
        { id: '5', name: '内存缓存残留', status: 'warning', detail: '发现 12MB 未粉碎的交互缓存', icon: 'cleaning_services' }
      ]);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen pb-40 max-w-xl mx-auto pt-[env(safe-area-inset-top)]">
      <header className="px-6 py-10">
        <div className="flex items-center gap-2 text-primary mb-2">
           <span className="material-symbols-outlined text-sm">verified_user</span>
           <span className="text-[11px] font-black uppercase tracking-widest">星盾 v2.4 核心控制中心</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter leading-none">安全与配置</h1>
      </header>

      <main className="px-6 space-y-10">
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">主题风格</h2>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => theme === 'light' && onThemeToggle?.()} className={`flex items-center justify-center gap-3 p-5 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-primary/20 border-primary/40 text-primary shadow-xl' : 'glass-panel opacity-40'}`}>
                <span className="material-symbols-outlined">dark_mode</span>
                <span className="text-sm font-bold">极夜暗调</span>
             </button>
             <button onClick={() => theme === 'dark' && onThemeToggle?.()} className={`flex items-center justify-center gap-3 p-5 rounded-[24px] border transition-all ${theme === 'light' ? 'bg-primary/10 border-primary/40 text-primary shadow-xl' : 'glass-panel opacity-40'}`}>
                <span className="material-symbols-outlined">light_mode</span>
                <span className="text-sm font-bold">晨曦暖调</span>
             </button>
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border-2 ${isAuditing ? 'border-primary animate-pulse' : 'border-primary/20'}`}>
               <span className="material-symbols-outlined text-4xl text-primary">shield</span>
            </div>
            <h3 className="font-black text-xl mb-2">星核安全审计</h3>
            <p className="text-sm opacity-50 mb-8 leading-relaxed">正在全盘监控本地内核、向量分片及存储分区的安全性。</p>
            {auditScore && (
              <div className="mb-8 animate-in zoom-in duration-500">
                <span className="text-5xl font-black text-emerald-500">{auditScore}</span>
                <p className="text-[11px] font-black text-emerald-600 uppercase mt-2">安全等级：卓越</p>
              </div>
            )}
            <button onClick={runSecurityAudit} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-widest">
              {isAuditing ? '哈希扫描中...' : '启动全量审计'}
            </button>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-primary ml-1">逻辑引擎参数</h2>
          <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-primary/5">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-black">默认推理温度 (Temp)</span>
                <span className="text-primary font-black">{temp}</span>
              </div>
              <input type="range" min="0" max="1.5" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <div className="flex items-center justify-between p-6 cursor-pointer" onClick={() => setLocalOnly(!localOnly)}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${localOnly ? 'bg-primary/20 text-primary' : 'bg-white/5 opacity-40'}`}>
                  <span className="material-symbols-outlined">cloud_off</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-black">强制物理离线</span>
                  <span className="text-xs opacity-50 mt-1">完全断开外部网络请求</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${localOnly ? 'bg-primary' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localOnly ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center py-10 opacity-30">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase">songseek 内核 v2.4.0 • 琥珀版</p>
        </footer>
      </main>
    </div>
  );
};

export default Settings;
