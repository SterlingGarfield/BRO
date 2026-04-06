
import React, { useState, useMemo } from 'react';
import { Language } from '../../types';

interface Props {
  lang: Language;
}

type ItemType = 'app' | 'link' | 'folder' | 'file';
type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'favorites' | 'recent' | 'apps' | 'links' | 'docs' | 'media';

interface VirtualItem {
  id: string;
  name: string;
  type: ItemType;
  subtype?: string; // e.g., 'pdf', 'png'
  icon: string;
  color: string;
  target: string; // URL or internal path
  size?: string;
  lastAccessed: Date;
  isFavorite: boolean;
  description?: string;
}

export const VirtualWorkspaces: React.FC<Props> = ({ lang }) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Edit Form State
  const [editForm, setEditForm] = useState<Partial<VirtualItem>>({});

  // Mock Initial Data
  const [items, setItems] = useState<VirtualItem[]>([
    { id: '1', name: 'Dev Projects', type: 'folder', icon: 'folder', color: 'text-blue-400', target: '/root/projects', lastAccessed: new Date(Date.now() - 100000), isFavorite: true, size: '12 Items' },
    { id: '2', name: 'Asset Library', type: 'folder', icon: 'folder_open', color: 'text-amber-400', target: '/root/assets', lastAccessed: new Date(Date.now() - 2000000), isFavorite: false, size: '45 Items' },
    { id: '3', name: 'Terminal 1', type: 'app', icon: 'terminal', color: 'text-emerald-400', target: 'app://terminal', lastAccessed: new Date(), isFavorite: true, description: 'Main system terminal' },
    { id: '4', name: 'VS Code', type: 'app', icon: 'code', color: 'text-indigo-400', target: 'app://vscode', lastAccessed: new Date(Date.now() - 50000), isFavorite: true },
    { id: '5', name: 'GitHub Repo', type: 'link', icon: 'link', color: 'text-white', target: 'https://github.com/user/repo', lastAccessed: new Date(Date.now() - 86400000), isFavorite: false },
    { id: '6', name: 'System Config', type: 'file', subtype: 'json', icon: 'settings', color: 'text-slate-400', target: '/etc/config.json', lastAccessed: new Date(Date.now() - 10000000), isFavorite: false, size: '4 KB' },
    { id: '7', name: 'Project_Specs.pdf', type: 'file', subtype: 'pdf', icon: 'picture_as_pdf', color: 'text-rose-400', target: '/docs/specs.pdf', lastAccessed: new Date(Date.now() - 300000), isFavorite: true, size: '2.4 MB' },
    { id: '8', name: 'Logo_Final.png', type: 'file', subtype: 'image', icon: 'image', color: 'text-purple-400', target: '/assets/logo.png', lastAccessed: new Date(Date.now() - 4000000), isFavorite: false, size: '1.2 MB' },
    { id: '9', name: 'Analytics Dashboard', type: 'link', icon: 'analytics', color: 'text-cyan-400', target: 'https://analytics.internal', lastAccessed: new Date(Date.now() - 600000), isFavorite: false },
    { id: '10', name: 'Redis Admin', type: 'app', icon: 'storage', color: 'text-red-400', target: 'app://redis', lastAccessed: new Date(Date.now() - 9999999), isFavorite: false },
  ]);

  // Translations
  const t = {
    title: lang === 'en' ? 'Shortcut & File Manager' : '快捷方式及文件管理',
    subtitle: lang === 'en' ? 'Manage virtual resources, shortcuts, and file structures independently.' : '独立于系统的虚拟资源、快捷方式及文件结构管理。',
    searchPlaceholder: lang === 'en' ? 'Search items...' : '搜索项...',
    createNew: lang === 'en' ? 'Create New' : '新建项',
    properties: lang === 'en' ? 'Properties' : '属性详情',
    noSelection: lang === 'en' ? 'Select an item to view details' : '选择一个项目以查看详情',
    save: lang === 'en' ? 'Save Changes' : '保存更改',
    delete: lang === 'en' ? 'Delete' : '删除',
    cancel: lang === 'en' ? 'Cancel' : '取消',
    edit: lang === 'en' ? 'Edit' : '编辑',
    open: lang === 'en' ? 'Open' : '打开',
    
    filters: {
      all: lang === 'en' ? 'All Items' : '所有项目',
      favorites: lang === 'en' ? 'Favorites' : '收藏夹',
      recent: lang === 'en' ? 'Recent' : '最近访问',
      apps: lang === 'en' ? 'Applications' : '应用程序',
      links: lang === 'en' ? 'Web Shortcuts' : '网页链接',
      docs: lang === 'en' ? 'Documents' : '文档',
      media: lang === 'en' ? 'Media' : '媒体资源',
    },
    
    labels: {
      name: lang === 'en' ? 'Name' : '名称',
      target: lang === 'en' ? 'Target / Path' : '目标 / 路径',
      type: lang === 'en' ? 'Type' : '类型',
      lastAccessed: lang === 'en' ? 'Last Accessed' : '最后访问',
      size: lang === 'en' ? 'Size' : '大小',
      favorite: lang === 'en' ? 'Favorite' : '设为收藏',
    }
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
    let result = items;

    // 1. Category Filter
    switch (activeFilter) {
      case 'favorites': result = result.filter(i => i.isFavorite); break;
      case 'recent': result = [...result].sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()).slice(0, 5); break;
      case 'apps': result = result.filter(i => i.type === 'app'); break;
      case 'links': result = result.filter(i => i.type === 'link'); break;
      case 'docs': result = result.filter(i => i.type === 'file' && ['pdf', 'doc', 'txt', 'json'].includes(i.subtype || '')); break;
      case 'media': result = result.filter(i => i.type === 'file' && ['image', 'video', 'audio'].includes(i.subtype || '')); break;
    }

    // 2. Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(lowerQ) || i.target.toLowerCase().includes(lowerQ));
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  // Handlers
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setIsEditMode(false);
    const item = items.find(i => i.id === id);
    if (item) setEditForm(item);
  };

  const handleCreateNew = () => {
    const newItem: VirtualItem = {
      id: Date.now().toString(),
      name: lang === 'en' ? 'New Shortcut' : '新建快捷方式',
      type: 'link',
      icon: 'link',
      color: 'text-slate-400',
      target: 'https://',
      lastAccessed: new Date(),
      isFavorite: false
    };
    setItems(prev => [newItem, ...prev]);
    handleSelectItem(newItem.id);
    setIsEditMode(true);
  };

  const handleDelete = () => {
    if (selectedItemId) {
      setItems(prev => prev.filter(i => i.id !== selectedItemId));
      setSelectedItemId(null);
      setIsEditMode(false);
    }
  };

  const handleSave = () => {
    if (selectedItemId && editForm) {
      setItems(prev => prev.map(i => i.id === selectedItemId ? { ...i, ...editForm } as VirtualItem : i));
      setIsEditMode(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
    if (selectedItemId === id) {
       setEditForm(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const getIconForFilter = (f: FilterCategory) => {
    switch(f) {
      case 'all': return 'grid_view';
      case 'favorites': return 'star';
      case 'recent': return 'schedule';
      case 'apps': return 'apps';
      case 'links': return 'link';
      case 'docs': return 'description';
      case 'media': return 'perm_media';
    }
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <div className="h-full w-full flex overflow-hidden bg-background-dark">
      
      {/* LEFT SIDEBAR - Navigation */}
      <div className="w-64 glass border-r border-white/10 flex flex-col p-4 shrink-0 z-20">
         <div className="flex items-center space-x-3 px-2 mb-8 mt-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
               <span className="material-icons-round text-white text-lg">folder_special</span>
            </div>
            <h1 className="font-bold text-sm tracking-wide text-white">V-Manager</h1>
         </div>

         <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {(['all', 'favorites', 'recent'] as FilterCategory[]).map(cat => (
               <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-xs font-medium ${activeFilter === cat ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
               >
                  <span className={`material-icons-round text-lg ${activeFilter === cat ? 'text-blue-400' : 'opacity-70'}`}>{getIconForFilter(cat)}</span>
                  <span>{t.filters[cat]}</span>
               </button>
            ))}
            
            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               {t.labels.type}
            </div>
            
            {(['apps', 'links', 'docs', 'media'] as FilterCategory[]).map(cat => (
               <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-xs font-medium ${activeFilter === cat ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
               >
                  <span className={`material-icons-round text-lg ${activeFilter === cat ? 'text-blue-400' : 'opacity-70'}`}>{getIconForFilter(cat)}</span>
                  <span>{t.filters[cat]}</span>
               </button>
            ))}
         </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-background-dark">
         
         {/* Top Bar */}
         <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/5 backdrop-blur-md">
            <div className="flex items-center space-x-4 flex-1">
               <h2 className="text-lg font-bold text-white hidden md:block">{t.title}</h2>
               <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>
               <div className="relative group max-w-md w-full">
                  <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">search</span>
                  <input 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                     placeholder={t.searchPlaceholder}
                  />
               </div>
            </div>
            
            <div className="flex items-center space-x-2 pl-4">
               <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                     <span className="material-icons-round text-lg">grid_view</span>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                     <span className="material-icons-round text-lg">view_list</span>
                  </button>
               </div>
               <button 
                  onClick={handleCreateNew}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
               >
                  <span className="material-icons-round text-sm mr-1.5">add</span>
                  {t.createNew}
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {filteredItems.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <span className="material-icons-round text-6xl opacity-20 mb-4">search_off</span>
                  <p className="text-sm font-medium opacity-50">No items found</p>
               </div>
            ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredItems.map(item => (
                     <div 
                        key={item.id}
                        onClick={() => handleSelectItem(item.id)}
                        className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center text-center h-40 justify-center
                           ${selectedItemId === item.id 
                              ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1'
                           }`}
                     >
                        <button 
                           onClick={(e) => toggleFavorite(item.id, e)}
                           className={`absolute top-2 right-2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${item.isFavorite ? 'text-amber-400 opacity-100 hover:bg-amber-400/10' : 'text-slate-500 hover:text-white hover:bg-white/20'}`}
                        >
                           <span className="material-icons-round text-sm">{item.isFavorite ? 'star' : 'star_border'}</span>
                        </button>

                        <div className={`w-14 h-14 mb-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${selectedItemId === item.id ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                           <span className={`material-icons-round text-3xl ${item.color}`}>{item.icon}</span>
                        </div>
                        <span className={`text-xs font-medium truncate w-full px-2 ${selectedItemId === item.id ? 'text-blue-200' : 'text-slate-200'}`}>
                           {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full px-2">{item.type}</span>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col space-y-2">
                  {filteredItems.map(item => (
                     <div 
                        key={item.id}
                        onClick={() => handleSelectItem(item.id)}
                        className={`group flex items-center p-3 rounded-xl border transition-all cursor-pointer
                           ${selectedItemId === item.id 
                              ? 'bg-blue-600/10 border-blue-500/50' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                           }`}
                     >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${selectedItemId === item.id ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                           <span className={`material-icons-round text-xl ${item.color}`}>{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                           <div className="col-span-4 font-medium text-sm text-slate-200 truncate">{item.name}</div>
                           <div className="col-span-5 text-xs text-slate-500 font-mono truncate">{item.target}</div>
                           <div className="col-span-2 text-xs text-slate-500">{item.type}</div>
                           <div className="col-span-1 flex justify-end">
                              <button 
                                 onClick={(e) => toggleFavorite(item.id, e)}
                                 className={`p-1.5 rounded-full transition-all ${item.isFavorite ? 'text-amber-400' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300'}`}
                              >
                                 <span className="material-icons-round text-sm">{item.isFavorite ? 'star' : 'star_border'}</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* RIGHT SIDEBAR - Details / Edit */}
      {selectedItemId && selectedItem && (
         <div className="w-80 glass border-l border-white/10 flex flex-col p-6 animate-[slideInRight_0.2s_ease-out] z-20 bg-[#0f172a]/95">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.properties}</h3>
               <div className="flex space-x-1">
                  {!isEditMode ? (
                     <>
                        <button onClick={() => setIsEditMode(true)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" title={t.edit}>
                           <span className="material-icons-round text-lg">edit</span>
                        </button>
                        <button onClick={handleDelete} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title={t.delete}>
                           <span className="material-icons-round text-lg">delete</span>
                        </button>
                     </>
                  ) : (
                     <button onClick={() => setIsEditMode(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title={t.cancel}>
                        <span className="material-icons-round text-lg">close</span>
                     </button>
                  )}
                  <button onClick={() => setSelectedItemId(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                     <span className="material-icons-round text-lg">keyboard_double_arrow_right</span>
                  </button>
               </div>
            </div>

            <div className="flex flex-col items-center mb-6">
               <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-3 shadow-2xl ${isEditMode ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-white/5 border border-white/10'}`}>
                  <span className={`material-icons-round text-4xl ${selectedItem.color}`}>{selectedItem.icon}</span>
               </div>
               {isEditMode ? (
                  <input 
                     value={editForm.name || ''}
                     onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                     className="bg-black/20 border border-white/20 rounded-lg px-2 py-1 text-sm text-center text-white focus:outline-none focus:border-blue-500 w-full"
                  />
               ) : (
                  <h2 className="text-lg font-bold text-white text-center break-words w-full">{selectedItem.name}</h2>
               )}
               <p className="text-xs text-slate-500 mt-1 uppercase font-bold">{selectedItem.type}</p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
               {/* Properties Grid */}
               <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/5">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.target}</label>
                     {isEditMode ? (
                        <input 
                           value={editForm.target || ''}
                           onChange={(e) => setEditForm(prev => ({...prev, target: e.target.value}))}
                           className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                        />
                     ) : (
                        <div className="text-xs text-blue-400 font-mono break-all bg-black/20 p-2 rounded border border-white/5 select-all">
                           {selectedItem.target}
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.size}</label>
                        <div className="text-xs text-slate-300 font-mono">{selectedItem.size || '--'}</div>
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.type}</label>
                        {isEditMode ? (
                           <select 
                              value={editForm.type || 'link'}
                              onChange={(e) => setEditForm(prev => ({...prev, type: e.target.value as ItemType}))}
                              className="w-full bg-slate-900 border border-white/20 rounded-lg px-1 py-1 text-xs text-slate-200 focus:outline-none"
                           >
                              <option value="app">App</option>
                              <option value="link">Link</option>
                              <option value="file">File</option>
                              <option value="folder">Folder</option>
                           </select>
                        ) : (
                           <div className="text-xs text-slate-300 capitalize">{selectedItem.type}</div>
                        )}
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.lastAccessed}</label>
                     <div className="text-xs text-slate-300">{selectedItem.lastAccessed.toLocaleString()}</div>
                  </div>
                  
                  {/* Icon Selector (Edit Mode Only) */}
                  {isEditMode && (
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Icon</label>
                        <div className="grid grid-cols-5 gap-2">
                           {['folder', 'link', 'terminal', 'code', 'image', 'description', 'settings', 'public', 'lock', 'star'].map(icon => (
                              <button 
                                 key={icon}
                                 onClick={() => setEditForm(prev => ({...prev, icon}))}
                                 className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${editForm.icon === icon ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                              >
                                 <span className="material-icons-round text-sm">{icon}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                     <span className="text-xs text-slate-400">{t.labels.favorite}</span>
                     <button 
                        onClick={(e) => toggleFavorite(selectedItem.id, e)}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${editForm.isFavorite ?? selectedItem.isFavorite ? 'bg-amber-500' : 'bg-slate-700'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm`} style={{ left: (editForm.isFavorite ?? selectedItem.isFavorite) ? 'calc(100% - 16px)' : '4px' }}></div>
                     </button>
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
               {isEditMode ? (
                  <button 
                     onClick={handleSave}
                     className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                     <span className="material-icons-round text-sm">save</span>
                     <span>{t.save}</span>
                  </button>
               ) : (
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center space-x-2">
                     <span className="material-icons-round text-sm">open_in_new</span>
                     <span>{t.open}</span>
                  </button>
               )}
            </div>
         </div>
      )}
    </div>
  );
};
