import React from 'react';
import { AppView, AppConfig, Language } from '../../types';

interface HubProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  apps: AppConfig[];
  lang: Language;
}

export const Hub: React.FC<HubProps> = ({ isOpen, onClose, onNavigate, apps, lang }) => {
  if (!isOpen) return null;

  const t = {
    title: lang === 'en' ? 'Applications & Tools' : '应用程序与工具',
    hub: lang === 'en' ? 'HUB' : '应用中心',
    search: lang === 'en' ? 'Search...' : '搜索...',
    store: lang === 'en' ? 'Store' : '应用商店'
  };

  return (
    <div className="fixed bottom-20 left-20 w-[520px] max-h-[640px] bg-[#212121] border border-white/5 rounded-[28px] z-[100] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-y-auto animate-[fadeIn_0.3s_ease-out] custom-scrollbar">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{t.hub}</h2>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.15em]">{t.title}</p>
        </div>
        <div className="relative">
          <input 
            className="bg-white/2 border border-white/5 rounded-2xl px-5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 outline-none w-56 text-white placeholder-slate-600 transition-all" 
            placeholder={t.search} 
            type="text"
            autoFocus
          />
          <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg">search</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {apps.map((app) => (
          <div 
            key={app.id} 
            onClick={() => {
              onNavigate(app.id);
              onClose();
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-20 h-20 rounded-[22px] flex items-center justify-center shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-white/5 ${app.color.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-')}`}>
              <span className="material-icons-round text-4xl group-hover:scale-110 transition-transform duration-300">{app.icon}</span>
            </div>
            <span className="text-[12px] font-semibold mt-4 text-slate-400 group-hover:text-white transition-colors text-center tracking-tight">{app.name}</span>
          </div>
        ))}
        
        {/* Mock additional item */}
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-20 h-20 rounded-[22px] bg-white/2 border border-dashed border-white/10 flex items-center justify-center hover:bg-white/5 transition-all duration-300">
            <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-slate-400 transition-colors">add</span>
          </div>
          <span className="text-[12px] font-semibold mt-4 text-slate-600 group-hover:text-slate-400 transition-colors tracking-tight">{t.store}</span>
        </div>
      </div>
    </div>
  );
};
