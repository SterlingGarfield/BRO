import React, { useState, useEffect } from 'react';
import { AppView, AppConfig, Language } from '../../types';

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
    <header className="fixed top-0 left-0 right-0 h-14 glass flex items-center justify-between px-6 z-50 border-b border-border-dark/50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button 
            onClick={onBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-lg transition-all ${canGoBack ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'text-slate-800 cursor-not-allowed'}`}
            title={t.back}
          >
            <span className="material-icons-round text-[20px]">arrow_back</span>
          </button>
          <button 
            onClick={onForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-lg transition-all ${canGoForward ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'text-slate-800 cursor-not-allowed'}`}
            title={t.forward}
          >
            <span className="material-icons-round text-[20px]">arrow_forward</span>
          </button>
          <button 
            onClick={onRefresh}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-white ml-1 active:rotate-180 duration-500"
            title={t.refresh}
          >
            <span className="material-icons-round text-[20px]">refresh</span>
          </button>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onUndo}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-white active:scale-95"
            title={t.undo}
          >
            <span className="material-icons-round text-[20px]">undo</span>
          </button>
          <button 
            onClick={onRedo}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-white active:scale-95"
            title={t.redo}
          >
            <span className="material-icons-round text-[20px]">redo</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center max-w-2xl px-8">
        <div className="flex items-center space-x-6 w-full">
          <div className="flex flex-col items-center min-w-[140px]">
            <span className="text-[11px] font-semibold text-blue-500 tracking-tight whitespace-nowrap">{currentApp.name}</span>
            <span className="text-[9px] text-slate-500 font-mono truncate max-w-[120px] opacity-70">{currentApp.path}</span>
          </div>
          <div className="flex-1 flex flex-col space-y-1.5">
            <div className="flex justify-between text-[9px] text-slate-500 font-medium uppercase tracking-wider">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)] rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4 text-xs font-medium text-slate-400">
            <div className="flex items-center bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <span className="material-icons-round text-[14px] mr-1.5 text-blue-500/70">schedule</span>
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
          <span className="material-icons-round text-[18px]">remove</span>
        </button>
        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
          <span className="material-icons-round text-[18px]">check_box_outline_blank</span>
        </button>
        <button className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 transition-all">
          <span className="material-icons-round text-[18px]">close</span>
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
      <aside className="fixed left-0 top-14 bottom-0 w-16 glass flex flex-col items-center py-4 z-50 border-r border-border-dark/50">
        
        {/* Taskbar Icons (Apps) */}
        <div className="flex flex-col space-y-3 w-full items-center overflow-y-auto no-scrollbar px-2 flex-grow">
          {sortedDockApps.map(appId => {
            const app = apps[appId];
            const isActive = activeApp === appId;
            const isRunning = runningApps.includes(appId);
            const isPinned = pinnedApps.includes(appId);

            return (
              <div key={appId} className="relative group w-full flex justify-center">
                 {/* Active Indicator (Bar) */}
                 {isActive && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.5)]"></div>
                 )}
                 
                 <button
                   onClick={() => onAppClick(appId)}
                   onContextMenu={(e) => {
                     e.preventDefault();
                   }}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-active:scale-90
                      ${isActive 
                        ? 'bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20' 
                        : (isRunning ? 'text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300')
                      }`}
                 >
                   <span className={`material-icons-round text-[22px] ${isActive ? 'text-blue-500' : ''}`}>{app.icon}</span>
                 </button>

                 {/* Running Indicator (Dot) - Only show if running but NOT active (active has the bar) */}
                 {isRunning && !isActive && (
                   <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-slate-600"></div>
                 )}

                 {/* Custom Context Menu / Tooltip replacement for right click simulation */}
                 <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] translate-x-3 group-hover:translate-x-0">
                   <div className="bg-[#212121] text-white rounded-xl shadow-2xl border border-white/5 overflow-hidden min-w-[160px]">
                      <div className="px-4 py-3 border-b border-white/5 bg-white/2">
                        <span className="font-bold text-xs block whitespace-nowrap tracking-tight">{app.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{isRunning ? t.running : t.pinned}</span>
                      </div>
                      <div className="pointer-events-auto p-1">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onPin(appId); }}
                           className="w-full text-left px-3 py-2 text-[11px] font-medium hover:bg-white/5 rounded-lg text-slate-300 flex items-center transition-colors"
                         >
                           <span className="material-icons-round text-[14px] mr-3 text-slate-500">{isPinned ? 'push_pin' : 'push_pin'}</span>
                           {isPinned ? t.unpin : t.pin}
                         </button>
                         {isRunning && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); onCloseApp(appId); }}
                             className="w-full text-left px-3 py-2 text-[11px] font-medium hover:bg-rose-500/10 rounded-lg text-rose-400 flex items-center transition-colors"
                           >
                             <span className="material-icons-round text-[14px] mr-3 opacity-70">close</span>
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
        <div className="mb-3 relative group shrink-0">
           <button
              onClick={onToggleLanguage}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/5 text-slate-500 hover:text-slate-300"
           >
              <span className="material-icons-round text-xl">translate</span>
           </button>
           <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-[#212121] text-white text-[11px] font-medium px-3 py-2 rounded-lg border border-white/5 whitespace-nowrap z-[60] shadow-2xl translate-x-3 group-hover:translate-x-0">
              {t.switchLang}
           </div>
        </div>

        {/* Start / Hub Button at Bottom */}
        <div className="mb-2 relative group shrink-0">
           <button
              onClick={onToggleHub}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isHubOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-white/5 text-blue-600'}`}
           >
              <span className="material-icons-round text-2xl">grid_view</span>
           </button>
           <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-[#212121] text-white text-[11px] font-medium px-3 py-2 rounded-lg border border-white/5 whitespace-nowrap z-[60] shadow-2xl translate-x-3 group-hover:translate-x-0">
              {t.startHub}
           </div>
        </div>
      </aside>
    </>
  );
};
