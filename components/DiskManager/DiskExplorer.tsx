import React, { useState } from 'react';
import { Language } from '../../types';

interface Props {
  lang: Language;
}

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'app';
  size: string;
  path: string;
  children?: FileNode[];
}

const MOCK_FILES: FileNode[] = [
  {
    id: 'root',
    name: 'D:',
    type: 'folder',
    size: '1.2 TB',
    path: 'D:/',
    children: [
      {
        id: 'apps',
        name: 'Applications',
        type: 'folder',
        size: '450 GB',
        path: 'D:/Applications',
        children: [
          { id: 'app1', name: 'Adobe Photoshop 2024', type: 'app', size: '4.2 GB', path: 'D:/Applications/Adobe Photoshop 2024' },
          { id: 'app2', name: 'Visual Studio Code', type: 'app', size: '350 MB', path: 'D:/Applications/VSCode' },
          { id: 'app3', name: 'Docker Desktop', type: 'app', size: '1.8 GB', path: 'D:/Applications/Docker' },
        ]
      },
      {
        id: 'projects',
        name: 'Projects',
        type: 'folder',
        size: '210 GB',
        path: 'D:/Projects',
        children: [
          { id: 'p1', name: 'AI_Model_v4', type: 'folder', size: '150 GB', path: 'D:/Projects/AI_Model_v4' },
          { id: 'p2', name: 'Web_Assets', type: 'folder', size: '60 GB', path: 'D:/Projects/Web_Assets' },
        ]
      },
      {
        id: 'downloads',
        name: 'Downloads',
        type: 'folder',
        size: '50 GB',
        path: 'D:/Downloads',
        children: [
          { id: 'd1', name: 'installer_v2.exe', type: 'file', size: '2.4 GB', path: 'D:/Downloads/installer_v2.exe' },
          { id: 'd2', name: 'dataset.zip', type: 'file', size: '12 GB', path: 'D:/Downloads/dataset.zip' },
        ]
      }
    ]
  }
];

export const DiskExplorer: React.FC<Props> = ({ lang }) => {
  const t = {
    title: lang === 'en' ? 'File Explorer' : '文件浏览',
    actions: {
      delete: lang === 'en' ? 'Delete' : '删除',
      uninstall: lang === 'en' ? 'Uninstall' : '卸载',
      install: lang === 'en' ? 'New Install' : '新安装',
      cancel: lang === 'en' ? 'Cancel' : '取消',
      confirm: lang === 'en' ? 'Confirm' : '确认',
    },
    confirmDelete: lang === 'en' ? 'Are you sure you want to delete this item?' : '确定要删除此项目吗？',
    confirmUninstall: lang === 'en' ? 'Are you sure you want to uninstall this application?' : '确定要卸载此应用吗？',
    path: lang === 'en' ? 'Path' : '路径',
    size: lang === 'en' ? 'Size' : '大小',
  };

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root', 'apps']));
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<'delete' | 'uninstall' | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleAction = (action: 'delete' | 'uninstall') => {
    if (selectedFile) {
      setShowConfirmModal(action);
    }
  };

  const confirmAction = () => {
    // Mock action
    console.log(`Confirmed ${showConfirmModal} on ${selectedFile?.name}`);
    setShowConfirmModal(null);
    // In a real app, we would update the file list here
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className={`flex items-center py-2 px-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 ${selectedFile?.id === node.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
          style={{ paddingLeft: `${level * 20 + 16}px` }}
          onClick={() => setSelectedFile(node)}
        >
          <span 
            className={`material-icons-round text-sm mr-2 ${node.children ? 'text-slate-400 hover:text-white' : 'opacity-0'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (node.children) toggleExpand(node.id);
            }}
          >
            {expanded.has(node.id) ? 'expand_more' : 'chevron_right'}
          </span>
          
          <span className={`material-icons-round text-lg mr-2 ${
            node.type === 'folder' ? 'text-amber-400' : 
            node.type === 'app' ? 'text-blue-400' : 'text-slate-400'
          }`}>
            {node.type === 'folder' ? 'folder' : node.type === 'app' ? 'apps' : 'description'}
          </span>
          
          <span className="text-sm text-slate-200 flex-1 truncate">{node.name}</span>
          <span className="text-xs font-mono text-slate-500">{node.size}</span>
        </div>
        
        {node.children && expanded.has(node.id) && (
          <div>{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/10 flex items-center px-4 justify-between bg-white/5">
        <div className="flex items-center space-x-2 text-sm text-slate-400 overflow-hidden">
           <span className="material-icons-round text-slate-500">folder_open</span>
           <span className="truncate max-w-[300px]">{selectedFile ? selectedFile.path : 'Select a file...'}</span>
        </div>
        
        <div className="flex space-x-2">
           <button 
             disabled={!selectedFile || selectedFile.type !== 'app'}
             onClick={() => handleAction('uninstall')}
             className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center"
           >
             <span className="material-icons-round text-sm mr-1">delete_forever</span>
             {t.actions.uninstall}
           </button>
           <button 
             disabled={!selectedFile}
             onClick={() => handleAction('delete')}
             className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center"
           >
             <span className="material-icons-round text-sm mr-1">delete</span>
             {t.actions.delete}
           </button>
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderTree(MOCK_FILES)}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
           <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 mx-auto">
                 <span className="material-icons-round text-rose-500 text-2xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">
                 {showConfirmModal === 'delete' ? t.actions.delete : t.actions.uninstall}
              </h3>
              <p className="text-sm text-slate-400 text-center mb-6">
                 {showConfirmModal === 'delete' ? t.confirmDelete : t.confirmUninstall}
                 <br/>
                 <span className="text-white font-mono mt-2 block bg-black/30 p-1 rounded">{selectedFile?.name}</span>
              </p>
              <div className="flex space-x-3">
                 <button 
                    onClick={() => setShowConfirmModal(null)}
                    className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold"
                 >
                    {t.actions.cancel}
                 </button>
                 <button 
                    onClick={confirmAction}
                    className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold"
                 >
                    {t.actions.confirm}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
