import React from 'react';
import { Language } from '../types';

interface DesktopProps {
  lang: Language;
}

export const Desktop: React.FC<DesktopProps> = ({ lang }) => {
  const t = {
    ready: lang === 'en' ? 'System Ready' : '系统就绪',
    instruction: lang === 'en' ? 'Select an application from the dock to begin.' : '请从程序坞选择应用程序以开始。',
    cpu: lang === 'en' ? 'CPU Load' : 'CPU 负载',
    network: lang === 'en' ? 'Network' : '网络状态'
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Elements Removed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>

      <div className="relative z-10 text-center">
        <div className="w-24 h-24 mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/5">
          <span className="material-icons-round text-5xl text-blue-400">fingerprint</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{t.ready}</h1>
        <p className="text-slate-400 font-mono text-sm">{t.instruction}</p>
        
        <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto">
           <div className="glass p-4 rounded-2xl border border-white/5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="material-icons-round text-emerald-400">memory</span>
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-mono">{t.cpu}</div>
                <div className="text-sm font-bold text-white">12%</div>
              </div>
           </div>
           <div className="glass p-4 rounded-2xl border border-white/5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="material-icons-round text-blue-400">wifi</span>
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-mono">{t.network}</div>
                <div className="text-sm font-bold text-white">1.2 Gbps</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
