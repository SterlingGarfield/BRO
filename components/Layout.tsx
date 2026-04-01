import React, { useState, useEffect } from 'react';
import { AppView, AppConfig, Language } from '../types';

interface HeaderProps {
  currentApp: AppConfig;
  statusText: string;
  progress: number;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  lang: Language;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentApp, 
  statusText, 
  progress,
  onBack,
  onForward,
  onRefresh,
  onUndo,
  onRedo,
  canGoBack,
  canGoForward,
  lang
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const t = {
    back: lang === 'en' ? 'Go Back' : '后退',
    forward: lang === 'en' ? 'Go Forward' : '前进',
    refresh: lang === 'en' ? 'Refresh View' : '刷新',
    undo: lang === 'en' ? 'Undo Action' : '撤销',
    redo: lang === 'en' ? 'Redo Action' : '重做',
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 glass flex items-center justify-between px-4 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button 
            onClick={onBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-md transition-colors ${canGoBack ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'text-slate-700 cursor-not-allowed'}`}
            title={t.back}
          >
            <span className="material-icons-round text-[18px]">arrow_back</span>
          </button>
          <button 
            onClick={onForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-md transition-colors ${canGoForward ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'text-slate-700 cursor-not-allowed'}`}
            title={t.forward}
          >
            <span className="material-icons-round text-[18px]">arrow_forward</span>
          </button>
          <button 
            onClick={onRefresh}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white ml-1 active:rotate-180 duration-500"
            title={t.refresh}
          >
            <span className="material-icons-round text-[18px]">refresh</span>
          </button>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onUndo}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white active:scale-95"
            title={t.undo}
          >
            <span className="material-icons-round text-[18px]">undo</span>
          </button>
          <button 
            onClick={onRedo}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white active:scale-95"
            title={t.redo}
          >
            <span className="material-icons-round text-[18px]">redo</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center max-w-2xl px-8">
        <div className="flex items-center space-x-6 w-full">
          <div className="flex flex-col items-center min-w-[140px]">
            <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold whitespace-nowrap">{currentApp.name}</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{currentApp.path}</span>
          </div>
          <div className="flex-1 flex flex-col space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-slate-300">
            <div className="flex items-center">
              <span className="material-icons-round text-[14px] mr-1 text-blue-400">schedule</span>
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-white/10 rounded-md text-slate-400">
          <span className="material-icons-round text-[16px]">remove</span>
        </button>
        <button className="p-2 hover:bg-white/10 rounded-md text-slate-400">
          <span className="material-icons-round text-[16px]">check_box_outline_blank</span>
        </button>
        <button className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-md text-slate-400 transition-colors">
          <span className="material-icons-round text-[16px]">close</span>
        </button>
      </div>
    </header>
  );
};

interface SidebarProps {
  activeApp: AppView | null;
  runningApps: AppView[];
  onAppClick: (appId: AppView) => void;
  onCloseApp: (appId: AppView) => void;
  onToggleHub: () => void;
  isHubOpen: boolean;
  apps: Record<AppView, AppConfig>;
  pinnedApps: AppView[];
  onPin: (appId: AppView) => void;
  lang: Language;
  onToggleLanguage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeApp, 
  runningApps, 
  onAppClick, 
  onCloseApp,
  onToggleHub, 
  isHubOpen, 
  apps, 
  pinnedApps, 
  onPin,
  lang,
  onToggleLanguage
}) => {
  // Logic to determine which apps to show in the dock
  const dockApps = new Set([...pinnedApps, ...runningApps]);
  const sortedDockApps = Array.from(dockApps);

  const t = {
    running: lang === 'en' ? 'Running' : '运行中',
    pinned: lang === 'en' ? 'Pinned' : '已固定',
    pin: lang === 'en' ? 'Pin to Dock' : '固定到程序坞',
    unpin: lang === 'en' ? 'Unpin from Dock' : '取消固定',
    close: lang === 'en' ? 'Close Window' : '关闭窗口',
    startHub: lang === 'en' ? 'Start Hub' : '启动中心',
    switchLang: lang === 'en' ? 'Switch Language' : '切换语言'
  };

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <aside className="fixed left-0 top-14 bottom-0 w-16 glass flex flex-col items-center py-3 z-50 bg-[#0f172a]/90 backdrop-blur-2xl border-r border-white/10 overflow-hidden">
        
        {/* Taskbar Icons (Apps) */}
        <div className="flex flex-col space-y-2 w-full items-center overflow-y-auto no-scrollbar px-1 flex-grow">
          {sortedDockApps.map(appId => {
            const app = apps[appId];
            const isActive = activeApp === appId;
            const isRunning = runningApps.includes(appId);
            const isPinned = pinnedApps.includes(appId);

            return (
              <div key={appId} className="relative group w-full flex justify-center">
                 {/* Active Indicator (Bar) */}
                 {isActive && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-400 rounded-r-full shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                 )}
                 
                 <button
                   onClick={() => onAppClick(appId)}
                   onContextMenu={(e) => {
                     e.preventDefault();
                   }}
                   className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group-active:scale-95
                      ${isActive 
                        ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5' 
                        : (isRunning ? 'text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300')
                      }`}
                 >
                   <span className={`material-icons-round text-[20px] ${isActive ? 'text-blue-400' : ''}`}>{app.icon}</span>
                 </button>

                 {/* Running Indicator (Dot) - Only show if running but NOT active (active has the bar) */}
                 {isRunning && !isActive && (
                   <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-slate-500/50"></div>
                 )}

                 {/* Custom Context Menu / Tooltip replacement for right click simulation */}
                 <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] translate-x-2 group-hover:translate-x-0">
                   <div className="bg-[#1e293b] text-white rounded-lg shadow-xl border border-white/10 overflow-hidden min-w-[140px]">
                      <div className="px-3 py-2 border-b border-white/5 bg-white/5">
                        <span className="font-semibold text-xs block whitespace-nowrap">{app.name}</span>
                        <span className="text-[9px] text-slate-400">{isRunning ? t.running : t.pinned}</span>
                      </div>
                      <div className="pointer-events-auto">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onPin(appId); }}
                           className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-white/10 text-slate-300 flex items-center"
                         >
                           <span className="material-icons-round text-[12px] mr-2 opacity-50">{isPinned ? 'push_pin' : 'push_pin'}</span>
                           {isPinned ? t.unpin : t.pin}
                         </button>
                         {isRunning && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); onCloseApp(appId); }}
                             className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-red-500/20 text-red-300 flex items-center"
                           >
                             <span className="material-icons-round text-[12px] mr-2 opacity-50">close</span>
                             {t.close}
                           </button>
                         )}
                      </div>
                   </div>
                 </div>
              </div>
            );
          })}
        </div>

        {/* Language Switcher */}
        <div className="mb-2 relative group shrink-0">
           <button
              onClick={onToggleLanguage}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/10 text-slate-400 hover:text-white"
           >
              <span className="material-icons-round text-xl">translate</span>
           </button>
           <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded-md border border-white/10 whitespace-nowrap z-[60] shadow-xl translate-x-2 group-hover:translate-x-0">
              {t.switchLang}
           </div>
        </div>

        {/* Start / Hub Button at Bottom */}
        <div className="mb-1 relative group shrink-0">
           <button
              onClick={onToggleHub}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${isHubOpen ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]' : 'hover:bg-white/10 text-blue-400'}`}
           >
              <span className="material-icons-round text-2xl">grid_view</span>
           </button>
           <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded-md border border-white/10 whitespace-nowrap z-[60] shadow-xl translate-x-2 group-hover:translate-x-0">
              {t.startHub}
           </div>
        </div>
      </aside>
    </>
  );
};
