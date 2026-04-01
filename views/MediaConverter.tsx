
import React from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

export const MediaConverter: React.FC<Props> = ({ lang }) => {
  const t = {
    title: lang === 'en' ? 'Conversion Queue' : '转换队列',
    subtitle: lang === 'en' ? 'Add media files to begin processing' : '添加媒体文件以开始处理',
    addFiles: lang === 'en' ? 'Add Files' : '添加文件',
    processAll: lang === 'en' ? 'Process All' : '全部处理',
    dragDrop: lang === 'en' ? 'Drag and drop media here' : '将媒体文件拖放到此处',
    supports: lang === 'en' ? 'Supports MP4, MKV, MOV, WAV, FLAC, JPG, PNG' : '支持 MP4, MKV, MOV, WAV, FLAC, JPG, PNG',
    
    configTitle: lang === 'en' ? 'Output Configuration' : '输出配置',
    format: lang === 'en' ? 'Format' : '格式',
    resolution: lang === 'en' ? 'Resolution' : '分辨率',
    bitrate: lang === 'en' ? 'Bitrate' : '比特率',
    
    advancedTitle: lang === 'en' ? 'Advanced Parameters' : '高级参数',
    gpu: lang === 'en' ? 'GPU Acceleration' : 'GPU 加速',
    subtitles: lang === 'en' ? 'Burn Subtitles' : '烧录字幕',
    speed: lang === 'en' ? 'Preset Speed' : '预设速度',
    slower: lang === 'en' ? 'Slower' : '较慢',
    medium: lang === 'en' ? 'Medium' : '中等',
    faster: lang === 'en' ? 'Faster' : '较快',
    
    engineStatus: lang === 'en' ? 'Engine Status' : '引擎状态',
    cpuLoad: lang === 'en' ? 'CPU LOAD' : 'CPU 负载',
    vramUse: lang === 'en' ? 'VRAM USE' : '显存使用',
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Main Area */}
      <div className="flex-1 p-8 flex flex-col h-full overflow-hidden">
        {/* Header inside view */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          <div className="flex space-x-3">
             <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors text-slate-200">
               <span className="material-icons-round text-sm">add</span>
               <span>{t.addFiles}</span>
             </button>
             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2">
               <span className="material-icons-round text-sm">play_arrow</span>
               <span>{t.processAll}</span>
             </button>
          </div>
        </div>

        {/* Drag Zone */}
        <div className="flex-1 rounded-[24px] flex flex-col items-center justify-center border-none relative group cursor-pointer hover:bg-white/[0.02] transition-colors bg-cover bg-center overflow-hidden">
          <div className="absolute inset-0 bg-center bg-cover opacity-80" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDYwIIl--a0M63z1ehxm0T-wk7ziFmkMuZ4PY3ix1QBjVeEfiwBtS_MJEnYrNXTeDGAHRb0cCFivQiHA_SCqU7tmoWuiTEA2fu5UCOfvN_VHZ2LwIxihH_PfAC7Jlj1rLYjUXPIngJdnPPKQISVD-3RzZdLeEaiv0btFUDvmgDrctGKrCwKtnpT-4fHDOZKllxQ6nrp4q8O8i-fVjSk35Nk1Zm5Y3bshQ5EU3szsvg8nAlExNPxcaV2f_wO5MNQaCFCZGO2dLLUfIYW)' }}></div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          
          <div className="relative z-10 text-center">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 group-hover:scale-110 transition-transform shadow-2xl">
               <span className="material-icons-round text-4xl text-white">cloud_upload</span>
             </div>
             <h3 className="text-lg font-semibold text-white mb-2 shadow-black drop-shadow-md">{t.dragDrop}</h3>
             <p className="text-sm text-slate-300 font-mono shadow-black drop-shadow-sm">{t.supports}</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[360px] h-full glass border-l border-white/10 p-6 overflow-y-auto custom-scrollbar shrink-0">
         <div className="space-y-8">
            {/* Output Config */}
            <section>
              <div className="flex items-center space-x-2 mb-4 text-blue-400">
                <span className="material-icons-round text-sm">settings_input_component</span>
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold">{t.configTitle}</h2>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold tracking-wider">{t.format}</label>
                    <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none">
                      <option>MP4 Video (H.264)</option>
                      <option>WebM (VP9)</option>
                      <option>MKV (Lossless)</option>
                      <option>MP3 Audio (320kbps)</option>
                      <option>PNG Image</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold tracking-wider">{t.resolution}</label>
                      <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                        <option>Source</option>
                        <option>4K (2160p)</option>
                        <option>1080p</option>
                        <option>720p</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold tracking-wider">{t.bitrate}</label>
                      <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                        <option>Variable</option>
                        <option>Constant</option>
                      </select>
                    </div>
                 </div>
              </div>
            </section>

            <div className="h-[1px] bg-white/5 w-full"></div>

            {/* Advanced Params */}
            <section>
              <div className="flex items-center space-x-2 mb-4 text-slate-400">
                <span className="material-icons-round text-sm">tune</span>
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold">{t.advancedTitle}</h2>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                       <span className="material-icons-round text-slate-400 text-lg">hardware</span>
                       <span className="text-xs text-slate-300">{t.gpu}</span>
                    </div>
                    {/* Toggle Switch Mockup */}
                    <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                       <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                       <span className="material-icons-round text-slate-400 text-lg">closed_caption</span>
                       <span className="text-xs text-slate-300">{t.subtitles}</span>
                    </div>
                    <div className="w-8 h-4 bg-slate-700 rounded-full relative">
                       <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold tracking-wider">{t.speed}</label>
                    <input className="w-full accent-blue-500 bg-white/10 rounded-lg h-1 appearance-none cursor-pointer" type="range" />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                       <span>{t.slower}</span>
                       <span>{t.medium}</span>
                       <span>{t.faster}</span>
                    </div>
                 </div>
              </div>
            </section>
            
            <div className="h-[1px] bg-white/5 w-full"></div>

            {/* Engine Status */}
            <section className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
               <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center space-x-2">
                 <span className="material-icons-round text-sm">memory</span>
                 <span>{t.engineStatus}</span>
               </h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                     <span className="text-slate-400">{t.cpuLoad}</span>
                     <span className="text-slate-200">12%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[12%]"></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                     <span className="text-slate-400">{t.vramUse}</span>
                     <span className="text-slate-200">1.4 GB</span>
                  </div>
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[24%]"></div>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};
