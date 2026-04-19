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
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden bg-background-dark">
      {/* Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="relative z-10 text-center max-w-2xl px-6">
        <div className="w-28 h-28 mx-auto glass rounded-[32px] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:scale-105 transition-transform duration-500">
          <span className="material-icons-round text-6xl text-blue-500 group-hover:rotate-12 transition-transform duration-500">fingerprint</span>
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight mb-4">{t.ready}</h1>
        <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed">{t.instruction}</p>
        
        <div className="mt-16 grid grid-cols-2 gap-6 max-w-lg mx-auto">
           <div className="glass p-6 rounded-2xl flex items-center space-x-4 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                <span className="material-icons-round text-blue-500 text-2xl">memory</span>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t.cpu}</div>
                <div className="text-xl font-bold text-white tracking-tight">12%</div>
              </div>
           </div>
           <div className="glass p-6 rounded-2xl flex items-center space-x-4 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                <span className="material-icons-round text-blue-500 text-2xl">wifi</span>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t.network}</div>
                <div className="text-xl font-bold text-white tracking-tight">1.2 Gbps</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
