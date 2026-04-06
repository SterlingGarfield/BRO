import React, { useState } from 'react';
import { Language } from '../../types';
import { DiskOverview } from './components/DiskOverview';
import { DiskExplorer } from './components/DiskExplorer';
import { DiskBackup } from './components/DiskBackup';
import { DiskLogs } from './components/DiskLogs';

interface Props {
  lang: Language;
}

type Tab = 'overview' | 'explorer' | 'backup' | 'logs';

export const DiskVisualizer: React.FC<Props> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const t = {
    title: lang === 'en' ? 'Disk Manager' : '磁盘管理',
    tabs: {
      overview: lang === 'en' ? 'Overview' : '概览',
      explorer: lang === 'en' ? 'Explorer' : '文件浏览',
      backup: lang === 'en' ? 'Backup' : '备份',
      logs: lang === 'en' ? 'Logs' : '日志',
    },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DiskOverview lang={lang} />;
      case 'explorer':
        return <DiskExplorer lang={lang} />;
      case 'backup':
        return <DiskBackup lang={lang} />;
      case 'logs':
        return <DiskLogs lang={lang} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background-dark relative overflow-hidden font-sans text-slate-300 selection:bg-blue-500/30">
      
      {/* Ambient Background Effects Removed */}
      
      {/* Fading Overlay Removed */}

      {/* Header / Tabs */}
      <div className="h-16 shrink-0 border-b border-white/10 bg-white/5 flex items-center px-6 justify-between z-20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
           <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <span className="material-icons-round text-orange-500">album</span>
           </div>
           <h1 className="text-lg font-bold text-white tracking-tight">{t.title}</h1>
        </div>

        <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
           {(['overview', 'explorer', 'backup', 'logs'] as Tab[]).map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    activeTab === tab 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                       : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`}
              >
                 {t.tabs[tab]}
              </button>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        {renderContent()}
      </div>
    </div>
  );
};