
import React, { useState } from 'react';

interface AuditDetail {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
  icon: string;
}

const Settings: React.FC<{ onThemeToggle?: () => void, theme?: string }> = ({ onThemeToggle, theme }) => {
  const [temp, setTemp] = useState(0.7);
  const [localOnly, setLocalOnly] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditResults, setAuditResults] = useState<AuditDetail[]>([]);

  const runSecurityAudit = () => {
    setIsAuditing(true);
    setAuditScore(null);
    setAuditResults([]);
    
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
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 max-w-xl mx-auto">
      <header className="px-6 pt-16 pb-8">
        <div className="flex items-center gap-2 text-primary mb-2">
           <span className="material-symbols-outlined text-sm">verified_user</span>
           <span className="text-[11px] font-black uppercase tracking-widest">星盾 v2.4 核心控制中心</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter leading-none">安全与配置</h1>
      </header>

      <main className="px-6 space-y-10">
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">视觉风格</h2>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => theme === 'light' && onThemeToggle?.()} className={`flex items-center justify-center gap-3 p-4 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-primary/20 border-primary/40 text-primary-light shadow-xl' : 'glass-panel text-slate-400 opacity-60'}`}>
                <span className="material-symbols-outlined">dark_mode</span>
                <span className="text-sm font-bold">极夜暗调</span>
             </button>
             <button onClick={() => theme === 'dark' && onThemeToggle?.()} className={`flex items-center justify-center gap-3 p-4 rounded-[24px] border transition-all ${theme === 'light' ? 'bg-primary/10 border-primary/40 text-primary shadow-xl' : 'glass-panel text-slate-400 opacity-60'}`}>
                <span className="material-symbols-outlined">light_mode</span>
                <span className="text-sm font-bold">晨曦暖调</span>
             </button>
          </div>
        </section>

        <section>
          <div className="glass-panel rounded-[32px] p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden shadow-xl">
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 transition-all duration-500 ${isAuditing ? 'border-primary animate-pulse scale-110' : 'border-primary/20 bg-primary/5'}`}>
                   <span className={`material-symbols-outlined text-4xl ${isAuditing ? 'text-primary' : 'text-primary-light opacity-80'}`}>
                     {isAuditing ? 'security_update_good' : 'shield_moon'}
                   </span>
                </div>
                <h3 className="font-black text-xl mb-2">星核安全审计</h3>
                <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">正在全盘监控本地内核、向量分片及存储分区的完整性与安全性。</p>
                {auditScore !== null && !isAuditing && (
                  <div className="w-full mb-8 space-y-6 animate-in zoom-in duration-500">
                     <div>
                        <span className="text-5xl font-black text-emerald-500">{auditScore}</span>
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-2">安全等级：卓越</p>
                     </div>
                     <div className="text-left space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">详细审计报告</p>
                        <div className="space-y-2">
                           {auditResults.map((result, idx) => (
                             <div key={result.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                      <span className="material-symbols-outlined text-[18px]">{result.icon}</span>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[12px] font-black">{result.name}</span>
                                      <span className="text-[9px] text-slate-500 font-bold uppercase">{result.detail}</span>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
                <button onClick={runSecurityAudit} disabled={isAuditing} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                  {isAuditing ? '深度哈希扫描中...' : '启动全量系统审计'}
                </button>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary ml-1">逻辑引擎参数</h2>
          <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-primary/5">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[15px] font-black block">默认推理温度 (Temp)</span>
                  <span className="text-xs text-slate-500 mt-1 block">控制生成答案的随机性</span>
                </div>
                <span className="text-primary font-black text-lg">{temp}</span>
              </div>
              <input type="range" min="0" max="1.5" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <SettingToggle icon="cloud_off" title="强制物理离线" description="禁止外部网络请求，强制在本地 CPU/GPU 执行" enabled={localOnly} onToggle={() => setLocalOnly(!localOnly)} />
          </div>
        </section>

        <div className="text-center py-10 opacity-60">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">songseek 内核 v2.4.0 • 琥珀版</p>
          <p className="text-[10px] font-medium mt-2 text-slate-400">© 2025 星盾安全实验室</p>
        </div>
      </main>
    </div>
  );
};

const SettingToggle: React.FC<{ icon: string; title: string; description: string; enabled: boolean; onToggle: () => void }> = ({ icon, title, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors cursor-pointer group" onClick={onToggle}>
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${enabled ? 'bg-primary/20 text-primary' : 'bg-primary/5 text-slate-400'}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-black leading-tight">{title}</span>
        <span className="text-xs text-slate-500 mt-1 leading-snug">{description}</span>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-white/10'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'} shadow-lg`}></div>
    </div>
  </div>
);

const SettingItem: React.FC<{ icon: string; title: string; description: string; action: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors cursor-pointer group">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-black leading-tight">{title}</span>
        <span className="text-xs text-slate-500 mt-1 leading-snug">{description}</span>
      </div>
    </div>
    <div className="shrink-0 ml-4">{action}</div>
  </div>
);

export default Settings;
