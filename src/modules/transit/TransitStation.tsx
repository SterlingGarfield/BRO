
import React, { useState, useEffect } from 'react';
import { Language } from '../../types';

interface Props {
  lang: Language;
}

type FileType = 'image' | 'doc' | 'archive' | 'code' | 'video' | 'audio';
type FilterType = FileType | 'all' | 'media';
type CleanupPolicy = '24h' | '7d' | '15d' | '30d' | 'never';

interface TransitFile {
  id: string;
  name: string;
  size: string;
  type: string; // MIME type representation
  category: FileType;
  uploadTime: Date;
  expiresInSeconds: number; // Remaining time simulation
  icon: string;
  color: string;
  note?: string;
}

export const TransitStation: React.FC<Props> = ({ lang }) => {
  // State
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<TransitFile | null>(null);
  const [cleanupPolicy, setCleanupPolicy] = useState<CleanupPolicy>('24h');
  const [deleteOnTransfer, setDeleteOnTransfer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Note State
  const [editingNoteFile, setEditingNoteFile] = useState<TransitFile | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [hoveredNote, setHoveredNote] = useState<{ text: string; rect: DOMRect } | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data
  const [files, setFiles] = useState<TransitFile[]>([
    { id: '1', name: 'project_spec_v2.pdf', size: '2.4 MB', type: 'application/pdf', category: 'doc', uploadTime: new Date(), expiresInSeconds: 45845, icon: 'description', color: 'orange', note: 'Final version approved by Sarah. Need to print 2 copies.' },
    { id: '2', name: 'header_render_final.png', size: '18.1 MB', type: 'image/png', category: 'image', uploadTime: new Date(), expiresInSeconds: -1, icon: 'image', color: 'blue' },
    { id: '3', name: 'assets_bundle_2024.zip', size: '412.0 MB', type: 'application/zip', category: 'archive', uploadTime: new Date(), expiresInSeconds: 259200, icon: 'folder_zip', color: 'purple', note: 'Contains raw assets for Q4 campaign.' },
    { id: '4', name: 'deploy_script_old.sh', size: '4 KB', type: 'text/x-sh', category: 'code', uploadTime: new Date(), expiresInSeconds: 0, icon: 'terminal', color: 'red' },
    { id: '5', name: 'demo_recording.mp4', size: '156.2 MB', type: 'video/mp4', category: 'video', uploadTime: new Date(), expiresInSeconds: 32000, icon: 'movie', color: 'pink' },
  ]);

  // Translation
  const t = {
    title: lang === 'en' ? 'Temporary Storage' : '临时中转站',
    subtitle: lang === 'en' ? 'Files automatically expire based on cleanup policy.' : '文件将根据自动清理策略过期删除。',
    upload: lang === 'en' ? 'Upload New' : '上传新文件',
    uploading: lang === 'en' ? 'Uploading...' : '正在上传...',
    settings: lang === 'en' ? 'Cleanup Policy' : '清理策略',
    dropText: lang === 'en' ? 'Drop files to transit' : '拖放文件到此处中转',
    expiresIn: lang === 'en' ? 'EXPIRES IN' : '剩余时间',
    expired: lang === 'en' ? 'EXPIRED' : '已失效',
    never: lang === 'en' ? 'NEVER' : '从不过期',
    searchPlaceholder: lang === 'en' ? 'Search files or notes...' : '搜索文件或笔记...',
    
    filters: {
      all: lang === 'en' ? 'All Files' : '全部文件',
      image: lang === 'en' ? 'Images' : '图像',
      doc: lang === 'en' ? 'Docs' : '文档',
      archive: lang === 'en' ? 'Archives' : '压缩包',
      media: lang === 'en' ? 'Media' : '媒体'
    },
    
    actions: {
      preview: lang === 'en' ? 'Preview' : '预览',
      download: lang === 'en' ? 'Download' : '下载',
      delete: lang === 'en' ? 'Delete' : '删除',
      share: lang === 'en' ? 'Copy Link' : '复制链接',
      transfer: lang === 'en' ? 'Transfer & Delete' : '转出并删除',
      addNote: lang === 'en' ? 'Add Note' : '添加注释',
      editNote: lang === 'en' ? 'Edit Note' : '编辑笔记',
    },

    noteModal: {
      title: lang === 'en' ? 'File Note' : '文件笔记',
      placeholder: lang === 'en' ? 'Enter note content here...' : '在此处输入笔记内容...',
      save: lang === 'en' ? 'Save Note' : '保存笔记',
      clear: lang === 'en' ? 'Clear' : '清空',
    },

    policyModal: {
      title: lang === 'en' ? 'Auto-Cleanup Strategy' : '自动清理策略配置',
      retention: lang === 'en' ? 'Retention Period' : '保留周期',
      options: [
        { val: '24h', label: lang === 'en' ? '24 Hours' : '24 小时 (默认)' },
        { val: '7d', label: lang === 'en' ? '7 Days' : '7 天' },
        { val: '15d', label: lang === 'en' ? '15 Days' : '15 天' },
        { val: '30d', label: lang === 'en' ? '30 Days' : '30 天' },
        { val: 'never', label: lang === 'en' ? 'Never (Manual)' : '永不 (手动)' },
      ],
      transferDel: lang === 'en' ? 'Delete after transfer' : '文件转出后立即删除',
      desc: lang === 'en' ? 'Expired files are permanently shredded.' : '过期文件将被永久粉碎。',
      save: lang === 'en' ? 'Update Policy' : '更新策略'
    }
  };

  // Helper: Format Seconds to Dd HH:MM:SS
  const formatTime = (seconds: number) => {
    if (seconds === -1) return t.never;
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return d > 0 ? `${d}d ${timeStr}` : timeStr;
  };

  // Effect: Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setFiles(prev => prev.map(f => ({
        ...f,
        expiresInSeconds: f.expiresInSeconds > 0 ? f.expiresInSeconds - 1 : f.expiresInSeconds
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      let expiry = 86400; // Default 24h
      if (cleanupPolicy === '7d') expiry = 3600 * 24 * 7;
      else if (cleanupPolicy === '15d') expiry = 3600 * 24 * 15;
      else if (cleanupPolicy === '30d') expiry = 3600 * 24 * 30;
      else if (cleanupPolicy === 'never') expiry = -1;

      const newFile: TransitFile = {
        id: Date.now().toString(),
        name: `upload_${Math.floor(Math.random() * 1000)}.dat`,
        size: '5.0 MB',
        type: 'application/octet-stream',
        category: 'doc',
        uploadTime: new Date(),
        expiresInSeconds: expiry,
        icon: 'draft',
        color: 'slate'
      };
      setFiles(prev => [...prev, newFile]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  };

  // Note Handlers
  const handleOpenNote = (file: TransitFile) => {
    setEditingNoteFile(file);
    setNoteDraft(file.note || '');
    setHoveredNote(null);
  };

  const handleSaveNote = () => {
    if (editingNoteFile) {
      setFiles(prev => prev.map(f =>
        f.id === editingNoteFile.id ? { ...f, note: noteDraft } : f
      ));
      setEditingNoteFile(null);
      setNoteDraft('');
    }
  };

  const filteredFiles = files.filter(f => {
    // 1. Category Filter
    const categoryMatch = activeFilter === 'all' 
      ? true 
      : activeFilter === 'media' 
        ? (f.category === 'video' || f.category === 'audio')
        : f.category === activeFilter;

    // 2. Search Filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || 
      f.name.toLowerCase().includes(searchLower) || 
      (f.note && f.note.toLowerCase().includes(searchLower));

    return categoryMatch && searchMatch;
  });

  // Helper to get urgency color
  const getTimerColor = (seconds: number) => {
    if (seconds === -1) return 'text-cyan-400'; // Never Expire
    if (seconds <= 0) return 'text-red-500'; // Expired
    if (seconds >= 24 * 3600) return 'text-emerald-400'; // > 24 hours (Green)
    if (seconds < 3600) return 'text-red-500 animate-pulse'; // < 1hr
    return 'text-orange-400'; // < 24 hours
  };

  return (
    <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar relative">
      <div className="max-w-7xl mx-auto min-h-full flex flex-col">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <div className="flex items-center space-x-3 mb-1">
               <h1 className="text-2xl font-bold text-white tracking-tight">{t.title}</h1>
            </div>
            <p className="text-sm text-slate-400">{t.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
               onClick={() => setIsSettingsOpen(true)}
               className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors text-slate-300 group"
            >
              <span className="material-icons-round text-sm group-hover:rotate-45 transition-transform">settings</span>
              <span className="text-sm font-medium">{t.settings}</span>
            </button>
            <button 
               onClick={handleUpload}
               disabled={isUploading}
               className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                 <span className="material-icons-round text-sm animate-spin">refresh</span>
              ) : (
                 <span className="material-icons-round text-sm">cloud_upload</span>
              )}
              <span className="text-sm font-bold tracking-tight">{isUploading ? t.uploading : t.upload}</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
            <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}>{t.filters.all}</button>
            <button onClick={() => setActiveFilter('image')} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeFilter === 'image' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}>{t.filters.image}</button>
            <button onClick={() => setActiveFilter('doc')} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeFilter === 'doc' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}>{t.filters.doc}</button>
            <button onClick={() => setActiveFilter('archive')} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeFilter === 'archive' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}>{t.filters.archive}</button>
            <button onClick={() => setActiveFilter('media')} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeFilter === 'media' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}>{t.filters.media}</button>
          </div>
          
          <div className="relative group shrink-0 w-full md:w-auto">
             <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors text-lg">search</span>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t.searchPlaceholder}
               className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
             />
          </div>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
          {filteredFiles.map((file) => (
            <div key={file.id} className="glass rounded-2xl p-5 flex flex-col h-52 transition-all hover:-translate-y-1 hover:border-white/20 group relative overflow-hidden">
               {/* Selection/Hover Overlay */}
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-${file.color}-500/20 text-${file.color}-400 flex items-center justify-center border border-${file.color}-500/20`}>
                  <span className="material-symbols-outlined text-2xl">{file.icon}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[9px] font-bold font-mono uppercase tracking-widest mb-1 ${file.expiresInSeconds === 0 ? 'text-red-500/60' : 'text-slate-500'}`}>{t.expiresIn}</span>
                  <span className={`text-sm font-mono font-bold ${getTimerColor(file.expiresInSeconds)}`}>
                    {file.expiresInSeconds === 0 ? t.expired : formatTime(file.expiresInSeconds)}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center space-x-2">
                   <h3 className="text-sm font-bold text-slate-100 truncate w-full" title={file.name}>
                     {searchQuery ? (
                        <>
                          {file.name.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === searchQuery.toLowerCase() 
                              ? <span key={i} className="bg-blue-500/30 text-blue-200 rounded px-0.5">{part}</span> 
                              : part
                          )}
                        </>
                     ) : file.name}
                   </h3>
                </div>
                <div className="flex items-center text-[11px] text-slate-400 mt-1 font-mono">
                  <span>{file.size}</span>
                  <span className="mx-2 text-slate-600">|</span>
                  <span className="truncate max-w-[100px]">{file.type}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenNote(file); }}
                  onMouseEnter={(e) => {
                      if (file.note) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredNote({ text: file.note, rect });
                      }
                  }}
                  onMouseLeave={() => setHoveredNote(null)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-medium transition-all group/btn ${
                      file.note
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                   <span className={`material-icons-round text-sm ${file.note ? 'opacity-100' : 'opacity-70 group-hover/btn:opacity-100'}`}>
                     {file.note ? 'description' : 'notes'}
                   </span>
                   <span>{file.note ? t.actions.editNote : t.actions.addNote}</span>
                </button>

                <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewFile(file)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title={t.actions.preview}><span className="material-icons-round text-lg">visibility</span></button>
                  <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title={t.actions.share}><span className="material-icons-round text-lg">link</span></button>
                  <button onClick={() => handleDelete(file.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title={t.actions.delete}><span className="material-icons-round text-lg">delete</span></button>
                </div>
              </div>
            </div>
          ))}

          {/* Upload Drop Zone - Only show if no search query or explicit upload intent */}
          {!searchQuery && (
            <div 
              onClick={handleUpload}
              className="rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center h-52 group cursor-pointer hover:bg-white/[0.02] hover:border-blue-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all text-slate-500">
                <span className="material-icons-round text-2xl">add</span>
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">{t.dropText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Note Tooltip */}
      {hoveredNote && (
        <div 
           className="fixed z-[100] bg-[#0f172a] border border-blue-500/20 rounded-xl p-4 shadow-2xl max-w-[280px] pointer-events-none animate-[fadeIn_0.1s_ease-out]"
           style={{
              top: hoveredNote.rect.bottom + 8,
              left: Math.min(hoveredNote.rect.left, window.innerWidth - 300), // Prevent overflow right
           }}
        >
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#0f172a] border-t border-l border-blue-500/20 rotate-45"></div>
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-white/5">
               <span className="material-icons-round text-blue-400 text-sm">sticky_note_2</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note Details</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
               {searchQuery ? (
                 <>
                   {hoveredNote.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                     part.toLowerCase() === searchQuery.toLowerCase() 
                       ? <span key={i} className="bg-blue-500/30 text-blue-200 rounded px-0.5">{part}</span> 
                       : part
                   )}
                 </>
               ) : hoveredNote.text}
            </p>
        </div>
      )}

      {/* Note Editor Modal */}
      {editingNoteFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.1s_ease-out]" onClick={() => setEditingNoteFile(null)}>
           <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                 <h3 className="font-bold text-white flex items-center text-sm">
                    <span className="material-icons-round mr-2 text-blue-400">edit_note</span>
                    {t.noteModal.title}: <span className="text-slate-400 font-normal ml-1 truncate max-w-[150px]">{editingNoteFile.name}</span>
                 </h3>
                 <button onClick={() => setEditingNoteFile(null)} className="text-slate-400 hover:text-white"><span className="material-icons-round">close</span></button>
              </div>
              <div className="p-4">
                 <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 resize-none placeholder-slate-600"
                    placeholder={t.noteModal.placeholder}
                    autoFocus
                 />
              </div>
              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end space-x-2">
                 {noteDraft && (
                    <button
                        onClick={() => setNoteDraft('')}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                    >
                        {t.noteModal.clear}
                    </button>
                 )}
                 <button
                    onClick={handleSaveNote}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg transition-transform active:scale-95"
                 >
                    {t.noteModal.save}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal (Cleanup Policy) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
           <div className="bg-[#1a1f2e] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="material-icons-round text-blue-500 mr-3 p-2 bg-blue-500/10 rounded-xl">auto_delete</span>
                    {t.policyModal.title}
                 </h2>
                 <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">{t.policyModal.retention}</label>
                    <div className="grid grid-cols-2 gap-3">
                       {t.policyModal.options.map(opt => (
                          <button
                             key={opt.val}
                             onClick={() => setCleanupPolicy(opt.val as CleanupPolicy)}
                             className={`px-4 py-3.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${cleanupPolicy === opt.val ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                             {opt.label}
                             {cleanupPolicy === opt.val && <span className="material-icons-round text-sm">check</span>}
                          </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setDeleteOnTransfer(!deleteOnTransfer)}>
                    <div className="flex items-center space-x-3">
                       <span className="material-icons-round text-slate-400 p-1.5 bg-white/5 rounded-lg">logout</span>
                       <span className="text-sm font-bold text-slate-200">{t.policyModal.transferDel}</span>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 p-1 ${deleteOnTransfer ? 'bg-blue-600' : 'bg-slate-700'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm`} style={{ transform: deleteOnTransfer ? 'translateX(20px)' : 'translateX(0)' }}></div>
                    </div>
                 </div>

                 <div className="text-[11px] text-slate-400 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex items-start leading-relaxed">
                    <span className="material-icons-round text-amber-500 text-base mr-3 mt-0.5">info</span>
                    {t.policyModal.desc}
                 </div>
              </div>
              <div className="p-4 bg-white/5 flex justify-end">
                 <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                 >
                    {t.policyModal.save}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-8 animate-[fadeIn_0.2s_ease-out]" onClick={() => setPreviewFile(null)}>
            <div className="glass max-w-3xl w-full max-h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
                  <h3 className="font-bold text-white flex items-center truncate">
                     <span className="material-icons-round mr-2 text-slate-400">{previewFile.icon}</span>
                     {previewFile.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                     <button className="p-2 hover:bg-white/10 rounded-lg text-white" title={t.actions.download}><span className="material-icons-round">download</span></button>
                     <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><span className="material-icons-round">close</span></button>
                  </div>
               </div>
               <div className="flex-1 bg-black/40 flex items-center justify-center p-8 relative overflow-hidden">
                  {previewFile.category === 'image' || previewFile.category === 'video' ? (
                     <div className="flex flex-col items-center justify-center text-slate-500">
                        <span className="material-icons-round text-8xl opacity-20 mb-4">{previewFile.category === 'image' ? 'image' : 'movie'}</span>
                        <p className="text-sm">Preview Unavailable in Mock Mode</p>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center text-slate-500">
                        <span className="material-icons-round text-8xl opacity-20 mb-4">description</span>
                        <p className="text-sm">Document Preview</p>
                     </div>
                  )}
               </div>
               <div className="p-6 bg-[#0f172a] border-t border-white/10 shrink-0">
                  <div className="grid grid-cols-3 gap-6 text-xs">
                     <div>
                        <span className="block text-slate-500 uppercase tracking-wider font-bold mb-1">File Size</span>
                        <span className="text-slate-200 font-mono">{previewFile.size}</span>
                     </div>
                     <div>
                        <span className="block text-slate-500 uppercase tracking-wider font-bold mb-1">Uploaded</span>
                        <span className="text-slate-200 font-mono">{previewFile.uploadTime.toLocaleDateString()}</span>
                     </div>
                     <div>
                        <span className="block text-slate-500 uppercase tracking-wider font-bold mb-1">Expires</span>
                        <span className="text-blue-400 font-mono font-bold">{formatTime(previewFile.expiresInSeconds)}</span>
                     </div>
                     {previewFile.note && (
                        <div className="col-span-3 mt-2 pt-2 border-t border-white/5">
                           <span className="block text-slate-500 uppercase tracking-wider font-bold mb-1">Note</span>
                           <p className="text-slate-300 text-xs italic bg-white/5 p-2 rounded-lg border border-white/5">
                             {searchQuery ? (
                               <>
                                 {previewFile.note.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                                   part.toLowerCase() === searchQuery.toLowerCase() 
                                     ? <span key={i} className="bg-blue-500/30 text-blue-200 rounded px-0.5">{part}</span> 
                                     : part
                                 )}
                               </>
                             ) : previewFile.note}
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
