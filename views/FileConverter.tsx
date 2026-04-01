
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

type Category = 'text' | 'office' | 'data' | 'other';
type Status = 'queued' | 'processing' | 'completed' | 'error';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  status: Status;
  progress: number;
  category: Category;
}

interface CategoryConfig {
  targetFormat: string;
  encoding?: string;     // Text
  merge?: boolean;       // Office
  resolution?: string;   // Office
  schema?: boolean;      // Data
  ocr?: boolean;         // Other
  password?: string;     // Other
}

interface LogEntry {
  id: string;
  timestamp: string;
  fileName: string;
  action: string;
  status: 'success' | 'error';
  details: string;
}

export const FileConverter: React.FC<Props> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Independent configuration state for each category
  const [configs, setConfigs] = useState<Record<Category, CategoryConfig>>({
    text: { targetFormat: 'PDF', encoding: 'UTF-8' },
    office: { targetFormat: 'PDF', merge: false, resolution: 'High' },
    data: { targetFormat: 'Excel', schema: true },
    other: { targetFormat: 'JPG', ocr: false, password: '' }
  });

  // Mock initial queue
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'project_readme.md', type: 'Markdown', size: '12 KB', status: 'completed', progress: 100, category: 'text' },
    { id: '2', name: 'q3_financial_report.docx', type: 'Word', size: '2.4 MB', status: 'queued', progress: 0, category: 'office' },
    { id: '3', name: 'user_dump_2024.csv', type: 'CSV', size: '156 MB', status: 'queued', progress: 0, category: 'data' },
    { id: '4', name: 'scanned_contract.pdf', type: 'PDF', size: '8.1 MB', status: 'queued', progress: 0, category: 'other' },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
     { id: 'l0', timestamp: '10:24:12', fileName: 'project_readme.md', action: 'MD -> PDF', status: 'success', details: 'Conversion completed in 1.2s' },
     { id: 'l1', timestamp: '09:15:00', fileName: 'legacy_data.xml', action: 'XML -> JSON', status: 'error', details: 'Parsing error: Unexpected token < at position 0' }
  ]);

  const t = {
    title: lang === 'en' ? 'General File Converter' : '普通文件类型转换模块',
    subtitle: lang === 'en' ? 'Unified platform for Text, Office, Data & Archive conversions' : '支持文本、办公、数据及其他文档类型的统一转换平台',
    upload: lang === 'en' ? 'Drag & Drop or Click to Add Mock Files' : '拖拽或点击添加模拟文件',
    uploadHint: lang === 'en' ? `Adding files to: ${activeCategory.toUpperCase()} module` : `正在向【${activeCategory === 'text' ? '文本' : activeCategory === 'office' ? '办公' : activeCategory === 'data' ? '数据' : '其他'}】模块添加文件`,
    
    categories: {
      text: lang === 'en' ? 'Text Conversion' : '文本文件转换',
      office: lang === 'en' ? 'Office Docs' : '办公文档转换',
      data: lang === 'en' ? 'Data Files' : '数据文件转换',
      other: lang === 'en' ? 'Others/Archives' : '其他文档转换',
    },
    
    config: {
      title: lang === 'en' ? 'Conversion Settings' : '转换设置',
      targetFormat: lang === 'en' ? 'Target Format' : '目标格式',
      encoding: lang === 'en' ? 'Text Encoding' : '文本编码',
      merge: lang === 'en' ? 'Merge Files' : '合并文件',
      ocr: lang === 'en' ? 'OCR Text Recognition' : 'OCR 文字识别',
      resolution: lang === 'en' ? 'Image Resolution' : '图像分辨率',
      password: lang === 'en' ? 'Archive Password' : '压缩包密码',
      schema: lang === 'en' ? 'Retain Schema' : '保留数据结构',
      high: lang === 'en' ? 'High' : '高',
      med: lang === 'en' ? 'Med' : '中',
      low: lang === 'en' ? 'Low' : '低',
      mdHint: lang === 'en' ? 'Markdown conversion retains syntax highlighting.' : 'Markdown 转换将保留语法高亮。'
    },
    
    actions: {
      start: lang === 'en' ? 'Start Conversion' : '开始转换',
      processing: lang === 'en' ? 'Processing...' : '处理中...',
      clear: lang === 'en' ? 'Clear Queue' : '清空队列',
      remove: lang === 'en' ? 'Remove' : '移除',
      preview: lang === 'en' ? 'Preview' : '预览',
      log: lang === 'en' ? 'Log' : '日志',
      help: lang === 'en' ? 'Help' : '帮助',
      clearLogs: lang === 'en' ? 'Clear History' : '清空日志',
    },

    status: {
      queued: lang === 'en' ? 'Queued' : '排队中',
      processing: lang === 'en' ? 'Processing' : '处理中',
      completed: lang === 'en' ? 'Completed' : '已完成',
      error: lang === 'en' ? 'Error' : '错误',
      queueTitle: lang === 'en' ? 'Processing Queue' : '处理队列',
    },

    help: {
       supportedFormats: lang === 'en' ? 'Supported Formats' : '支持格式',
       textDesc: lang === 'en' ? 'TXT ↔ PDF, DOC/DOCX, HTML/XML, Markdown ↔ PDF/HTML/IMG' : 'TXT ↔ PDF, DOC/DOCX, HTML/XML, Markdown ↔ PDF/HTML/图片',
       officeDesc: lang === 'en' ? 'DOC/XLS/PPT ↔ PDF/IMG, Merge PDF, Split Pages' : 'DOC/XLS/PPT ↔ PDF/图片, PDF合并, 分页导出',
       dataDesc: lang === 'en' ? 'CSV ↔ Excel, JSON ↔ XML, DB Dump conversion' : 'CSV ↔ Excel, JSON ↔ XML, 数据库格式转换',
       otherDesc: lang === 'en' ? 'PDF → IMG, Archive Compression/Extraction (ZIP/RAR)' : 'PDF → 图片, 压缩文件处理 (ZIP/RAR)',
       limits: lang === 'en' ? 'Performance Limits: Max 50 files batch, <100MB per file' : '性能限制: 批量最多50个文件, 单文件 <100MB',
       security: lang === 'en' ? 'Security: HTTPS transfer, auto-delete temp files' : '安全性: HTTPS传输, 临时文件自动删除',
    }
  };

  // Helper to update config
  const updateConfig = (key: keyof CategoryConfig, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [key]: value
      }
    }));
  };

  // Options Data
  const formatOptions: Record<Category, string[]> = {
    text: ['PDF', 'DOCX', 'HTML', 'JPG', 'PNG', 'TXT'],
    office: ['PDF', 'JPG', 'PNG', 'CSV', 'DOCX'],
    data: ['Excel', 'XML', 'JSON', 'SQL', 'CSV'],
    other: ['JPG', 'PNG', 'Word', 'Excel', 'PDF']
  };

  // Simulation Logic: Add Mock Files
  const handleAddMockFiles = () => {
    const mockFiles: Record<Category, FileItem[]> = {
      text: [
        { id: Date.now() + '1', name: `notes_${Math.floor(Math.random()*100)}.txt`, type: 'TXT', size: '4 KB', status: 'queued', progress: 0, category: 'text' },
        { id: Date.now() + '2', name: `script_${Math.floor(Math.random()*100)}.md`, type: 'Markdown', size: '15 KB', status: 'queued', progress: 0, category: 'text' }
      ],
      office: [
        { id: Date.now() + '3', name: `presentation_${Math.floor(Math.random()*100)}.pptx`, type: 'PPTX', size: '5.2 MB', status: 'queued', progress: 0, category: 'office' },
        { id: Date.now() + '4', name: `budget_${Math.floor(Math.random()*100)}.xlsx`, type: 'Excel', size: '1.8 MB', status: 'queued', progress: 0, category: 'office' }
      ],
      data: [
        { id: Date.now() + '5', name: `export_${Math.floor(Math.random()*100)}.json`, type: 'JSON', size: '450 KB', status: 'queued', progress: 0, category: 'data' },
        { id: Date.now() + '6', name: `data_${Math.floor(Math.random()*100)}.xml`, type: 'XML', size: '890 KB', status: 'queued', progress: 0, category: 'data' }
      ],
      other: [
        { id: Date.now() + '7', name: `scan_${Math.floor(Math.random()*100)}.zip`, type: 'ZIP', size: '12.4 MB', status: 'queued', progress: 0, category: 'other' },
        { id: Date.now() + '8', name: `ebook_${Math.floor(Math.random()*100)}.epub`, type: 'EPUB', size: '3.2 MB', status: 'queued', progress: 0, category: 'other' }
      ]
    };

    setFiles(prev => [...prev, ...mockFiles[activeCategory]]);
  };

  // Simulation Logic: Start Conversion
  const handleStartConversion = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Filter files that are queued and match current category
    const filesToProcess = files.map(f => f.category === activeCategory && f.status === 'queued' ? f.id : null).filter(Boolean);
    
    if (filesToProcess.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Simulate progress
    const interval = setInterval(() => {
      setFiles(prevFiles => {
        let allDone = true;
        let completedFileIds: string[] = [];
        
        const newFiles = prevFiles.map(file => {
          if (filesToProcess.includes(file.id) && file.status !== 'completed') {
            const newProgress = file.progress + Math.floor(Math.random() * 15) + 5;
            if (newProgress < 100) {
              allDone = false;
              return { ...file, status: 'processing', progress: newProgress } as FileItem;
            } else {
              completedFileIds.push(file.id);
              return { ...file, status: 'completed', progress: 100 } as FileItem;
            }
          }
          return file;
        });

        // Add logs for newly completed files
        if (completedFileIds.length > 0) {
           completedFileIds.forEach(id => {
              const file = prevFiles.find(f => f.id === id);
              if (file && !logs.some(l => l.id === `log-${id}`)) {
                 const newLog: LogEntry = {
                    id: `log-${id}`,
                    timestamp: new Date().toLocaleTimeString(),
                    fileName: file.name,
                    action: `${file.type} -> ${configs[activeCategory].targetFormat}`,
                    status: 'success',
                    details: 'Conversion successful'
                 };
                 setLogs(currentLogs => [newLog, ...currentLogs]);
              }
           });
        }

        if (allDone) {
          clearInterval(interval);
          setIsProcessing(false);
        }
        return newFiles;
      });
    }, 200);
  };

  const handleClearQueue = () => {
    setFiles(prev => prev.filter(f => f.category !== activeCategory));
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRemoveLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const toggleLog = () => {
     setShowLog(!showLog);
     setShowHelp(false);
  };

  const toggleHelp = () => {
     setShowHelp(!showHelp);
     setShowLog(false);
  };

  // Filter files for display based on active category
  const activeFiles = files.filter(f => f.category === activeCategory);

  return (
    <div className="h-full w-full flex overflow-hidden relative">
      
      {/* Left Sidebar / Navigation */}
      <div className="w-64 glass border-r border-white/10 flex flex-col pt-6 pb-4 z-10 shrink-0 transition-all duration-300">
        <div className="px-6 mb-8">
           <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg mb-4">
              <span className="material-icons-round text-2xl text-white">swap_horiz</span>
           </div>
           <h2 className="text-lg font-bold text-white leading-tight">{t.title}</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {(['text', 'office', 'data', 'other'] as Category[]).map(cat => (
             <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeCategory === cat 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 translate-x-1' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-icons-round">
                  {cat === 'text' ? 'text_fields' : cat === 'office' ? 'work' : cat === 'data' ? 'dataset' : 'folder_zip'}
                </span>
                <span className="text-sm font-medium">{t.categories[cat]}</span>
                {/* Badge count */}
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeCategory === cat ? 'bg-white/20' : 'bg-slate-800'}`}>
                   {files.filter(f => f.category === cat).length}
                </span>
             </button>
          ))}
        </nav>

        <div className="px-6 mt-4">
           <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between text-xs mb-2">
                 <span className="text-slate-400">Storage</span>
                 <span className="text-white">75%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-rose-500 w-[75%]"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 shrink-0 backdrop-blur-md">
           <h3 className="text-slate-200 font-medium truncate pr-4">{t.subtitle}</h3>
           <div className="flex space-x-3 shrink-0">
              <button 
                onClick={toggleLog}
                className={`flex items-center space-x-2 text-xs font-bold transition-colors px-3 py-1.5 rounded-lg border ${showLog ? 'bg-white/10 text-white border-white/20' : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'}`}
              >
                 <span className="material-icons-round text-sm">history</span>
                 <span>{t.actions.log}</span>
              </button>
              <button 
                onClick={toggleHelp}
                className={`flex items-center space-x-2 text-xs font-bold transition-colors px-3 py-1.5 rounded-lg border ${showHelp ? 'bg-white/10 text-white border-white/20' : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'}`}
              >
                 <span className="material-icons-round text-sm">help</span>
                 <span>{t.actions.help}</span>
              </button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
           
           {/* Upload Zone */}
           <div 
             onClick={handleAddMockFiles}
             className="w-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] hover:border-rose-500/30 transition-all cursor-pointer group mb-8 active:scale-[0.99]"
           >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-rose-500/20 group-hover:text-rose-500">
                 <span className="material-icons-round text-2xl text-slate-400 group-hover:text-rose-500 transition-colors">cloud_upload</span>
              </div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{t.upload}</p>
              <p className="text-xs text-slate-500 mt-1">{t.uploadHint}</p>
           </div>

           {/* File Queue */}
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.status.queueTitle} ({activeFiles.length})</h4>
                 {activeFiles.length > 0 && (
                   <button 
                     onClick={handleClearQueue}
                     className="text-[10px] text-rose-400 font-bold hover:underline hover:text-rose-300 transition-colors"
                   >
                     {t.actions.clear}
                   </button>
                 )}
              </div>

              {activeFiles.length === 0 ? (
                 <div className="text-center py-10 text-slate-500 text-sm italic opacity-50">
                    No files in queue. Upload some to get started.
                 </div>
              ) : (
                activeFiles.map(file => (
                   <div key={file.id} className="glass p-4 rounded-xl border border-white/5 flex items-center group hover:border-white/10 transition-all animate-[fadeIn_0.3s_ease-out]">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 
                         ${file.category === 'text' ? 'bg-rose-500/20 text-rose-400' : 
                           file.category === 'office' ? 'bg-blue-500/20 text-blue-400' :
                           file.category === 'data' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                         <span className="material-icons-round">{
                            file.category === 'text' ? 'description' :
                            file.category === 'office' ? 'pie_chart' :
                            file.category === 'data' ? 'storage' : 'folder_zip'
                         }</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 mr-6">
                         <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium text-white truncate pr-2">{file.name}</h5>
                            <span className={`text-[10px] font-mono whitespace-nowrap ${
                               file.status === 'completed' ? 'text-emerald-400' :
                               file.status === 'processing' ? 'text-blue-400' : 'text-slate-500'
                            }`}>
                               {file.status === 'completed' ? t.status.completed : 
                                file.status === 'processing' ? `${t.status.processing} ${file.progress}%` : t.status.queued}
                            </span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                               className={`h-full rounded-full transition-all duration-300 ${
                                  file.status === 'completed' ? 'bg-emerald-500' :
                                  file.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                               }`} 
                               style={{ width: `${file.progress}%` }}
                            ></div>
                         </div>
                         <div className="flex items-center mt-1.5 text-[10px] text-slate-500 font-mono space-x-3">
                            <span>{file.size}</span>
                            <span>{file.type} &rarr; {configs[activeCategory].targetFormat}</span>
                         </div>
                      </div>

                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {file.status === 'completed' && (
                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title={t.actions.preview}>
                               <span className="material-icons-round text-lg">visibility</span>
                            </button>
                         )}
                         <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Download">
                            <span className="material-icons-round text-lg">download</span>
                         </button>
                         <button 
                           onClick={() => handleRemoveFile(file.id)}
                           className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" 
                           title={t.actions.remove}
                         >
                            <span className="material-icons-round text-lg">close</span>
                         </button>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>

        {/* LOG PANEL OVERLAY */}
        {showLog && (
           <div className="absolute right-0 top-16 bottom-0 w-80 bg-[#0f172a]/95 backdrop-blur-xl border-l border-white/10 z-20 p-6 flex flex-col animate-[slideInRight_0.2s_ease-out]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-white flex items-center"><span className="material-icons-round mr-2 text-slate-400">history</span>{t.actions.log}</h3>
                 <div className="flex items-center">
                    {logs.length > 0 && (
                      <button 
                        onClick={handleClearLogs}
                        className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors mr-3 font-medium uppercase tracking-tight"
                      >
                        {t.actions.clearLogs}
                      </button>
                    )}
                    <button onClick={() => setShowLog(false)} className="text-slate-500 hover:text-white"><span className="material-icons-round">close</span></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                 {logs.map(log => (
                    <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs relative group">
                       <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-mono">{log.timestamp}</span>
                          <span className={log.status === 'success' ? 'text-emerald-500' : 'text-red-500'}>{log.status.toUpperCase()}</span>
                       </div>
                       <div className="font-medium text-slate-200 mb-1 pr-6">{log.fileName}</div>
                       <div className="text-slate-400 text-[10px]">{log.action}</div>
                       <div className="text-slate-500 text-[10px] mt-1 italic">{log.details}</div>
                       
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleRemoveLog(log.id); }}
                         className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white/5 rounded"
                         title={t.actions.remove}
                       >
                         <span className="material-icons-round text-sm">delete</span>
                       </button>
                    </div>
                 ))}
                 {logs.length === 0 && <p className="text-center text-slate-500 text-xs mt-10">No logs yet.</p>}
              </div>
           </div>
        )}

        {/* HELP PANEL OVERLAY */}
        {showHelp && (
           <div className="absolute right-0 top-16 bottom-0 w-80 bg-[#0f172a]/95 backdrop-blur-xl border-l border-white/10 z-20 p-6 flex flex-col animate-[slideInRight_0.2s_ease-out]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-white flex items-center"><span className="material-icons-round mr-2 text-slate-400">help</span>{t.actions.help}</h3>
                 <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white"><span className="material-icons-round">close</span></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                 <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase mb-2">{t.help.supportedFormats}</h4>
                    <div className="space-y-3 text-xs text-slate-300">
                       <div className="p-2 bg-white/5 rounded border border-white/5">
                          <strong className="block text-slate-200 mb-1">Text</strong>
                          {t.help.textDesc}
                       </div>
                       <div className="p-2 bg-white/5 rounded border border-white/5">
                          <strong className="block text-slate-200 mb-1">Office</strong>
                          {t.help.officeDesc}
                       </div>
                       <div className="p-2 bg-white/5 rounded border border-white/5">
                          <strong className="block text-slate-200 mb-1">Data</strong>
                          {t.help.dataDesc}
                       </div>
                       <div className="p-2 bg-white/5 rounded border border-white/5">
                          <strong className="block text-slate-200 mb-1">Other</strong>
                          {t.help.otherDesc}
                       </div>
                    </div>
                 </div>
                 
                 <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                       <li>{t.help.limits}</li>
                       <li>{t.help.security}</li>
                    </ul>
                 </div>
              </div>
           </div>
        )}

      </div>

      {/* Right Configuration Panel */}
      <div className="w-80 glass border-l border-white/10 p-6 flex flex-col shrink-0 bg-[#0f172a]/40">
         <div className="flex items-center space-x-2 mb-6 text-slate-300">
            <span className="material-icons-round text-lg">tune</span>
            <h3 className="text-xs font-bold uppercase tracking-widest">{t.config.title}</h3>
         </div>

         <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Common Config: Target Format */}
            <div className="space-y-2">
               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.config.targetFormat}</label>
               <select 
                 value={configs[activeCategory].targetFormat}
                 onChange={(e) => updateConfig('targetFormat', e.target.value)}
                 className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none transition-shadow"
               >
                  {formatOptions[activeCategory].map(fmt => (
                     <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
               </select>
            </div>

            {/* Conditional Configs based on Category */}
            {activeCategory === 'text' && (
               <div className="space-y-2 animate-[fadeIn_0.3s]">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.config.encoding}</label>
                  <select 
                    value={configs.text.encoding}
                    onChange={(e) => updateConfig('encoding', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                  >
                     <option value="UTF-8">UTF-8 (Default)</option>
                     <option value="GBK">GBK / GB18030</option>
                     <option value="ASCII">ASCII</option>
                     <option value="ISO-8859-1">ISO-8859-1</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-2">{t.config.mdHint}</p>
               </div>
            )}

            {activeCategory === 'office' && (
               <div className="space-y-4 animate-[fadeIn_0.3s]">
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => updateConfig('merge', !configs.office.merge)}>
                    <span className="text-xs font-medium text-slate-300">{t.config.merge}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${configs.office.merge ? 'bg-rose-500' : 'bg-slate-700'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm`} style={{ left: configs.office.merge ? 'calc(100% - 16px)' : '4px' }}></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.config.resolution}</label>
                    <div className="flex bg-white/5 rounded-lg p-1">
                       {(['High', 'Med', 'Low'] as const).map(res => (
                         <button 
                           key={res}
                           onClick={() => updateConfig('resolution', res)}
                           className={`flex-1 py-1.5 text-[10px] rounded transition-all ${configs.office.resolution === res ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                         >
                           {res === 'High' ? t.config.high : res === 'Med' ? t.config.med : t.config.low}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>
            )}

            {activeCategory === 'data' && (
               <div className="animate-[fadeIn_0.3s]">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => updateConfig('schema', !configs.data.schema)}>
                    <span className="text-xs font-medium text-slate-300">{t.config.schema}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${configs.data.schema ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm`} style={{ left: configs.data.schema ? 'calc(100% - 16px)' : '4px' }}></div>
                    </div>
                  </div>
               </div>
            )}

            {activeCategory === 'other' && (
               <div className="space-y-4 animate-[fadeIn_0.3s]">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => updateConfig('ocr', !configs.other.ocr)}>
                     <span className="text-xs font-medium text-slate-300">{t.config.ocr}</span>
                     <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${configs.other.ocr ? 'bg-amber-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm`} style={{ left: configs.other.ocr ? 'calc(100% - 16px)' : '4px' }}></div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.config.password}</label>
                     <input 
                       type="password" 
                       value={configs.other.password}
                       onChange={(e) => updateConfig('password', e.target.value)}
                       placeholder="***" 
                       className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all" 
                     />
                  </div>
               </div>
            )}
         </div>

         <div className="mt-6 pt-6 border-t border-white/10">
            <button 
              onClick={handleStartConversion}
              disabled={isProcessing || activeFiles.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 group relative overflow-hidden
                ${isProcessing 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : activeFiles.length === 0 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 active:scale-[0.98]'
                }`}
            >
               {isProcessing ? (
                 <>
                   <span className="material-icons-round animate-spin text-lg">refresh</span>
                   <span>{t.actions.processing}</span>
                 </>
               ) : (
                 <>
                   <span className="material-icons-round group-hover:rotate-180 transition-transform duration-500">sync</span>
                   <span>{t.actions.start}</span>
                 </>
               )}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-3 font-mono">
               {isProcessing ? 'Engine running...' : 'Est. time: < 2 min'}
            </p>
         </div>
      </div>

    </div>
  );
};
