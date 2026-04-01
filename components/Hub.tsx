import React from 'react';
import { AppView, AppConfig, Language } from '../types';

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
    <div className="fixed bottom-20 left-20 w-[480px] max-h-[600px] glass-panel rounded-3xl z-[100] p-8 shadow-2xl overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.hub}</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t.title}</p>
        </div>
        <div className="relative">
          <input 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none w-48 text-white placeholder-slate-500" 
            placeholder={t.search} 
            type="text"
            autoFocus
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {apps.map((app) => (
          <div 
            key={app.id} 
            onClick={() => {
              onNavigate(app.id);
              onClose();
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ring-1 ring-white/10 ${app.color}`}>
              <span className="material-icons-round text-3xl text-white">{app.icon}</span>
            </div>
            <span className="text-[11px] font-medium mt-3 text-slate-300 group-hover:text-white transition-colors text-center">{app.name}</span>
          </div>
        ))}
        
        {/* Mock additional item */}
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-2xl text-slate-500">add</span>
          </div>
          <span className="text-[11px] font-medium mt-3 text-slate-500">{t.store}</span>
        </div>
      </div>
    </div>
  );
};
