import React, { useState } from 'react';
import { Language } from '../../types';

interface Props {
  lang: Language;
}

interface AppBackup {
  id: string;
  name: string;
  version: string;
  size: string;
  lastBackup: string;
  status: 'idle' | 'backing-up' | 'done' | 'error';
  progress: number;
  category: string;
}

const MOCK_APPS: AppBackup[] = [
  { id: '1', name: 'Adobe Photoshop 2024', version: '25.0.0', size: '4.2 GB', lastBackup: '2024-02-10', status: 'idle', progress: 0, category: 'Graphics' },
  { id: '2', name: 'Visual Studio Code', version: '1.86.0', size: '350 MB', lastBackup: '2024-02-20', status: 'done', progress: 100, category: 'Development' },
  { id: '3', name: 'Docker Desktop', version: '4.27.1', size: '1.8 GB', lastBackup: 'Never', status: 'idle', progress: 0, category: 'Development' },
  { id: '4', name: 'Node.js', version: '20.11.0', size: '60 MB', lastBackup: '2024-01-15', status: 'idle', progress: 0, category: 'Development' },
  { id: '5', name: 'NVIDIA Drivers', version: '551.23', size: '800 MB', lastBackup: '2024-02-01', status: 'idle', progress: 0, category: 'System' },
  { id: '6', name: '7-Zip', version: '23.01', size: '5 MB', lastBackup: '2023-12-20', status: 'idle', progress: 0, category: 'Tools' },
];

export const DiskBackup: React.FC<Props> = ({ lang }) => {
  const t = {
    title: lang === 'en' ? 'App Backup' : '应用备份',
    backupPath: lang === 'en' ? 'Backup Path' : '备份路径',
    startBackup: lang === 'en' ? 'Start Backup' : '开始备份',
    restore: lang === 'en' ? 'Restore' : '还原',
    status: {
      idle: lang === 'en' ? 'Idle' : '空闲',
      backingUp: lang === 'en' ? 'Backing up...' : '备份中...',
      done: lang === 'en' ? 'Done' : '完成',
      error: lang === 'en' ? 'Error' : '错误',
    },
    version: lang === 'en' ? 'Version' : '版本',
    size: lang === 'en' ? 'Size' : '大小',
    lastBackup: lang === 'en' ? 'Last Backup' : '上次备份',
    categories: {
      all: lang === 'en' ? 'All' : '全部',
      Graphics: lang === 'en' ? 'Graphics' : '图形',
      Development: lang === 'en' ? 'Development' : '开发',
      System: lang === 'en' ? 'System' : '系统',
      Tools: lang === 'en' ? 'Tools' : '工具',
    },
    folders: lang === 'en' ? 'Folders' : '文件夹',
    items: lang === 'en' ? 'items' : '项',
    rename: lang === 'en' ? 'Rename' : '重命名',
    save: lang === 'en' ? 'Save' : '保存',
    cancel: lang === 'en' ? 'Cancel' : '取消',
    newFolder: lang === 'en' ? 'New Folder' : '新建文件夹',
  };

  const [apps, setApps] = useState<AppBackup[]>(MOCK_APPS);
  const [backupPath, setBackupPath] = useState('D:/Backups/Apps');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  
  const [folders, setFolders] = useState<string[]>(['Graphics', 'Development', 'System', 'Tools']);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const getCategoryCount = (cat: string) => apps.filter(a => a.category === cat).length;

  const handleCreateFolder = () => {
    let baseName = t.newFolder;
    let name = baseName;
    let count = 1;
    while (folders.includes(name)) {
      name = `${baseName} ${count}`;
      count++;
    }
    setFolders(prev => [...prev, name]);
    setEditingFolder(name);
    setNewFolderName(name);
  };

  const handleStartRename = (e: React.MouseEvent, folder: string) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setNewFolderName(folder);
  };

  const handleSaveRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingFolder && newFolderName.trim() && newFolderName !== editingFolder) {
      // Update folders list
      setFolders(prev => prev.map(f => f === editingFolder ? newFolderName : f));
      // Update apps category
      setApps(prev => prev.map(app => app.category === editingFolder ? { ...app, category: newFolderName } : app));
    }
    setEditingFolder(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(null);
  };

  const handleBackup = (id: string) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'backing-up', progress: 0 } : app
    ));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setApps(prev => prev.map(app => 
        app.id === id ? { ...app, progress } : app
      ));

      if (progress >= 100) {
        clearInterval(interval);
        setApps(prev => prev.map(app => 
          app.id === id ? { ...app, status: 'done', lastBackup: new Date().toISOString().split('T')[0] } : app
        ));
      }
    }, 500);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header / Config */}
      <div className="glass p-6 rounded-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">{t.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span className="material-icons-round text-slate-500">folder</span>
              <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-slate-300">{backupPath}</span>
              <button className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase ml-2">Change</button>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center">
            <span className="material-icons-round mr-2">cloud_upload</span>
            {t.startBackup} All
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
           <div className="flex items-center space-x-2 text-sm text-slate-400">
               <button 
                  onClick={() => setCurrentFolder(null)}
                  className={`hover:text-white transition-colors flex items-center ${!currentFolder ? 'text-white font-bold' : ''}`}
               >
                  <span className="material-icons-round text-lg mr-1">home</span>
                  Root
               </button>
               {currentFolder && (
                  <>
                     <span className="material-icons-round text-xs">chevron_right</span>
                     <span className="text-white font-bold flex items-center">
                        <span className="material-icons-round text-lg mr-1 text-amber-400">folder_open</span>
                        {t.categories[currentFolder as keyof typeof t.categories] || currentFolder}
                     </span>
                  </>
               )}
           </div>
           
           {!currentFolder && (
              <button 
                onClick={handleCreateFolder}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-bold flex items-center transition-all border border-blue-500/30"
              >
                <span className="material-icons-round text-sm mr-1">create_new_folder</span>
                {t.newFolder}
              </button>
           )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!currentFolder ? (
           // Folder Grid View
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folders.map(cat => (
                 <div 
                    key={cat}
                    onClick={() => !editingFolder && setCurrentFolder(cat)}
                    className={`glass p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all border border-white/5 hover:border-blue-500/30 group relative ${editingFolder === cat ? 'border-blue-500/50 bg-white/5' : 'active:scale-95'}`}
                 >
                    {/* Edit Button */}
                    {!editingFolder && (
                        <button 
                            onClick={(e) => handleStartRename(e, cat)}
                            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title={t.rename}
                        >
                            <span className="material-icons-round text-sm">edit</span>
                        </button>
                    )}

                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                       <span className="material-icons-round text-5xl text-amber-400 group-hover:scale-110 transition-transform">folder</span>
                    </div>

                    {editingFolder === cat ? (
                        <div className="flex flex-col items-center w-full z-20" onClick={e => e.stopPropagation()}>
                            <input 
                                type="text" 
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="bg-black/40 border border-blue-500/50 rounded px-2 py-1 text-sm text-white text-center w-full mb-2 outline-none focus:border-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(e as any);
                                    if (e.key === 'Escape') handleCancelRename(e as any);
                                }}
                            />
                            <div className="flex space-x-2">
                                <button onClick={handleSaveRename} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" title={t.save}>
                                    <span className="material-icons-round text-sm">check</span>
                                </button>
                                <button onClick={handleCancelRename} className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" title={t.cancel}>
                                    <span className="material-icons-round text-sm">close</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-bold text-white mb-1 text-lg text-center truncate w-full px-2">{t.categories[cat as keyof typeof t.categories] || cat}</h3>
                            <span className="text-xs text-slate-500 bg-black/20 px-2 py-0.5 rounded-full">{getCategoryCount(cat)} {t.items}</span>
                        </>
                    )}
                 </div>
              ))}
           </div>
        ) : (
           // App List View (Filtered)
           <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
              {apps.filter(app => app.category === currentFolder).map(app => (
                <div key={app.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10 relative overflow-hidden">
                  {/* Progress Bar Background */}
                  {app.status === 'backing-up' && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" 
                      style={{ width: `${app.progress}%` }}
                    ></div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      app.category === 'Graphics' ? 'bg-purple-500/20 text-purple-400' :
                      app.category === 'Development' ? 'bg-blue-500/20 text-blue-400' :
                      app.category === 'System' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <span className="material-icons-round">
                        {app.category === 'Graphics' ? 'palette' :
                         app.category === 'Development' ? 'code' :
                         app.category === 'System' ? 'settings' : 'build'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center">
                        {app.name}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                        <span className="bg-white/5 px-1.5 rounded text-[10px] font-mono text-slate-500">v{app.version}</span>
                        <span>{app.size}</span>
                        <span>{t.lastBackup}: {app.lastBackup}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {app.status === 'backing-up' ? (
                      <div className="text-xs font-bold text-blue-400 animate-pulse">{app.progress}%</div>
                    ) : app.status === 'done' ? (
                      <div className="flex items-center text-emerald-400 text-xs font-bold">
                        <span className="material-icons-round text-sm mr-1">check_circle</span>
                        {t.status.done}
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBackup(app.id)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold border border-white/10 transition-colors"
                      >
                        {t.startBackup}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {apps.filter(app => app.category === currentFolder).length === 0 && (
                 <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <span className="material-icons-round text-4xl mb-2 opacity-50">folder_open</span>
                    <span className="text-sm">No items in this folder</span>
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};
