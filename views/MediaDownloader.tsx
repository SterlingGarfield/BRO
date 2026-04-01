
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

type MediaType = 'video' | 'audio';
type DownloadStatus = 'queued' | 'downloading' | 'converting' | 'completed';
type Platform = 'youtube' | 'bilibili' | 'tiktok' | 'spotify' | 'netease' | 'qq';

interface MediaItem {
  id: string;
  title: string;
  author: string;
  platform: Platform;
  type: MediaType;
  quality: string;
  format: string;
  status: DownloadStatus;
  progress: number;
  totalSize: string;
  speed?: string;
  duration: string;
  durationSec: number; // Added for seeking
  coverColor: string;
  lyrics?: { time: number; text: string }[];
}

export const MediaDownloader: React.FC<Props> = ({ lang }) => {
  // --- State ---
  const [urlInput, setUrlInput] = useState('');
  const [selectedType, setSelectedType] = useState<MediaType>('video');
  const [quality, setQuality] = useState('1080p');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Player State
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0-100
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [volume, setVolume] = useState(80);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Seeking State (Progress)
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Seeking State (Volume)
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // Mock Lyrics
  const MOCK_LYRICS = [
    { time: 0, text: "Instrumental Intro" },
    { time: 5, text: "Neon lights are flashing in the void" },
    { time: 10, text: "Digital rain falling, signals destroyed" },
    { time: 15, text: "Connected to the grid, but feeling so alone" },
    { time: 20, text: "Searching for a signal, waiting by the phone" },
    { time: 25, text: "Synthesizer dreams, coded in the stream" },
    { time: 30, text: "Nothing is ever really what it seems" },
    { time: 35, text: "System overload, system overload..." },
    { time: 40, text: "Rebooting the sequence..." },
    { time: 45, text: "Can you hear the echo?" },
  ];

  const INITIAL_DATA: MediaItem[] = [
    { 
      id: '1', 
      title: 'Cyberpunk City Ambience - 4K', 
      author: 'FutureScapes', 
      platform: 'youtube', 
      type: 'video', 
      quality: '4K', 
      format: 'MP4', 
      status: 'completed', 
      progress: 100, 
      totalSize: '2.8 GB', 
      duration: '1:02:45',
      durationSec: 3765,
      coverColor: 'bg-blue-500' 
    },
    { 
      id: '2', 
      title: 'Synthesizer Dreams (Original Mix)', 
      author: 'Neon Wave', 
      platform: 'spotify', 
      type: 'audio', 
      quality: '320kbps', 
      format: 'FLAC', 
      status: 'completed', 
      progress: 100, 
      totalSize: '42.8 MB', 
      duration: '03:45',
      durationSec: 225,
      coverColor: 'bg-purple-500',
      lyrics: MOCK_LYRICS
    },
    { 
      id: '3', 
      title: 'Tech Review: Quantum Chips', 
      author: 'HardwareNexus', 
      platform: 'bilibili', 
      type: 'video', 
      quality: '1080p', 
      format: 'MP4', 
      status: 'downloading', 
      progress: 45, 
      totalSize: '850 MB', 
      speed: '12.4 MB/s', 
      duration: '15:20',
      durationSec: 920,
      coverColor: 'bg-pink-500' 
    },
     { 
      id: '4', 
      title: 'Lo-Fi Coding Beats', 
      author: 'ChillHop', 
      platform: 'netease', 
      type: 'audio', 
      quality: '128kbps', 
      format: 'MP3', 
      status: 'queued', 
      progress: 0, 
      totalSize: '120 MB', 
      duration: '1:00:00',
      durationSec: 3600,
      coverColor: 'bg-emerald-500' 
    }
  ];

  // Mock Data
  const [queue, setQueue] = useState<MediaItem[]>([...INITIAL_DATA]);
  
  // Playlist State (Independent from Library Queue)
  const [playlist, setPlaylist] = useState<MediaItem[]>([...INITIAL_DATA]);

  // Translations
  const t = {
    title: lang === 'en' ? 'MediaHub' : '流媒体中心',
    subtitle: lang === 'en' ? 'Unified Stream Downloader & Player' : '统一流媒体下载与播放管理',
    inputPlaceholder: lang === 'en' ? 'Paste link from YouTube, Bilibili, Spotify...' : '粘贴来自 YouTube, Bilibili, Spotify 的链接...',
    download: lang === 'en' ? 'Download' : '下载资源',
    analyzing: lang === 'en' ? 'Analyzing...' : '解析中...',
    
    // Config
    type: lang === 'en' ? 'Type' : '类型',
    video: lang === 'en' ? 'Video' : '视频',
    audio: lang === 'en' ? 'Audio' : '音频',
    quality: lang === 'en' ? 'Quality' : '画质/音质',
    format: lang === 'en' ? 'Format' : '格式',
    
    // Tabs/Sections
    library: lang === 'en' ? 'Library & Queue' : '媒体库与队列',
    lyrics: lang === 'en' ? 'Lyrics' : '歌词',
    playlist: lang === 'en' ? 'Playlist' : '播放列表',
    clear: lang === 'en' ? 'Clear' : '清空',
    
    // Status
    queued: lang === 'en' ? 'Queued' : '排队中',
    downloading: lang === 'en' ? 'Downloading' : '下载中',
    converting: lang === 'en' ? 'Converting' : '转码中',
    completed: lang === 'en' ? 'Completed' : '已完成',
    
    // Player
    nowPlaying: lang === 'en' ? 'Now Playing' : '正在播放',
    speed: lang === 'en' ? 'Speed' : '倍速',
    
    // Actions
    addToPlaylist: lang === 'en' ? 'Add to Playlist' : '添加到播放列表',
    playNext: lang === 'en' ? 'Play Next' : '下一首播放',
    
    // Footer
    disclaimer: lang === 'en' ? 'Tool for educational use only. User assumes responsibility for copyright compliance.' : '本工具仅供技术研究。用户需自行承担版权合规责任。'
  };

  // Helper: Platform Icon
  const getPlatformIcon = (p: Platform) => {
    switch(p) {
      case 'youtube': return { icon: 'play_circle', color: 'text-red-500' };
      case 'bilibili': return { icon: 'smart_display', color: 'text-blue-400' }; // approximate
      case 'spotify': return { icon: 'radio', color: 'text-emerald-500' };
      case 'tiktok': return { icon: 'music_note', color: 'text-pink-500' }; // approximate
      case 'netease': return { icon: 'album', color: 'text-red-600' };
      default: return { icon: 'link', color: 'text-slate-400' };
    }
  };

  // Handle Type Change
  const handleTypeChange = (type: MediaType) => {
    setSelectedType(type);
    // Reset quality to default for the selected type
    if (type === 'video') {
       setQuality('1080p');
    } else {
       setQuality('320kbps');
    }
  };

  // Simulate Download
  const handleDownload = () => {
    if (!urlInput) return;
    setIsDownloading(true);
    setTimeout(() => {
      const newItem: MediaItem = {
        id: Date.now().toString(),
        title: `Downloaded Media ${queue.length + 1}`,
        author: 'Unknown Artist',
        platform: 'youtube',
        type: selectedType,
        quality: quality,
        format: selectedType === 'video' ? 'MP4' : 'MP3',
        status: 'downloading',
        progress: 0,
        totalSize: 'Unknown',
        speed: '0 MB/s',
        duration: '--:--',
        durationSec: 0,
        coverColor: 'bg-slate-600'
      };
      setQueue([newItem, ...queue]);
      setIsDownloading(false);
      setUrlInput('');
    }, 1500);
  };

  // Queue (Library) Handlers
  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  // Playlist Handlers
  const handleAddToPlaylist = (item: MediaItem) => {
    setPlaylist(prev => [...prev, item]);
  };

  const handlePlayNext = (item: MediaItem) => {
    setPlaylist(prev => {
        const activeIndex = prev.findIndex(i => i.id === activeItem?.id);
        if (activeIndex !== -1) {
            const newPlaylist = [...prev];
            newPlaylist.splice(activeIndex + 1, 0, item);
            return newPlaylist;
        }
        return [item, ...prev];
    });
  };

  const handleRemoveFromPlaylist = (index: number) => {
    setPlaylist(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearPlaylist = () => {
    setPlaylist([]);
  };

  // --- Playback Logic ---

  // Handle Seek / Drag (Progress)
  const handleSeek = (e: React.MouseEvent | MouseEvent) => {
      if (!progressBarRef.current || !activeItem) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max(0, x / rect.width), 1);
      
      const duration = activeItem.durationSec || 240; // Default or actual
      
      setPlaybackProgress(percentage * 100);
      setCurrentTime(percentage * duration);
  };

  // Handle Seek / Drag (Volume)
  const handleVolumeChange = (e: React.MouseEvent | MouseEvent) => {
      if (!volumeBarRef.current) return;
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max(0, x / rect.width), 1);
      setVolume(Math.round(percentage * 100));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      handleSeek(e);
  };

  // Global Mouse Events for Dragging
  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isDragging) {
              handleSeek(e);
          }
          if (isDraggingVolume) {
              handleVolumeChange(e);
          }
      };
      const handleMouseUp = () => {
          if (isDragging) setIsDragging(false);
          if (isDraggingVolume) setIsDraggingVolume(false);
      };

      if (isDragging || isDraggingVolume) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, isDraggingVolume, activeItem]);

  // Playback Interval
  useEffect(() => {
    let interval: any;
    if (isPlaying && activeItem && !isDragging) {
      interval = setInterval(() => {
        const duration = activeItem.durationSec || 240;
        setCurrentTime(prev => {
           if (prev >= duration) {
               setIsPlaying(false);
               return 0;
           }
           return prev + 1 * playbackRate;
        });
        setPlaybackProgress(prev => {
            const time = currentTime + 1 * playbackRate;
            return (time / duration) * 100;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeItem, playbackRate, isDragging, currentTime]); // Added currentTime to deps for accurate resume

  // Current Lyric Highlight Logic
  const getCurrentLyricIndex = () => {
    if (!activeItem?.lyrics) return -1;
    // Find the last lyric that has a time less than current time
    return activeItem.lyrics.reduce((prevIndex, curr, index) => {
      if (curr.time <= currentTime) return index;
      return prevIndex;
    }, -1);
  };
  
  const currentLyricIndex = getCurrentLyricIndex();

  return (
    <div className="h-full w-full flex flex-col bg-[#0f172a] relative overflow-hidden">
      
      {/* 1. TOP BAR: Input & Config */}
      <div className="shrink-0 p-6 pb-2 bg-[#0f172a] z-20 shadow-xl shadow-black/20">
        <div className="max-w-5xl mx-auto w-full">
           <div className="flex items-center justify-between mb-4">
              <div>
                 <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
                    <span className="material-icons-round mr-2 text-pink-500">subscriptions</span>
                    {t.title}
                 </h1>
                 <p className="text-xs text-slate-400 ml-8">{t.subtitle}</p>
              </div>
              <div className="flex space-x-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* Supported Platforms Indicators */}
                 {['youtube', 'bilibili', 'spotify', 'tiktok', 'netease'].map(p => {
                    const { icon, color } = getPlatformIcon(p as Platform);
                    return <span key={p} className={`material-icons-round text-lg ${color}`} title={p}>{icon}</span>;
                 })}
              </div>
           </div>

           <div className="glass p-1.5 rounded-2xl flex items-center space-x-2 border border-white/10">
              <div className="relative flex-1">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons-round text-slate-500 text-lg">link</span>
                 </div>
                 <input 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all"
                    placeholder={t.inputPlaceholder}
                 />
              </div>
              
              <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

              {/* Config Toggles */}
              <div className="flex bg-black/20 rounded-lg p-1 space-x-1 shrink-0">
                 <button 
                    onClick={() => handleTypeChange('video')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${selectedType === 'video' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                 >
                    <span className="material-icons-round text-sm mr-1">videocam</span> {t.video}
                 </button>
                 <button 
                    onClick={() => handleTypeChange('audio')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${selectedType === 'audio' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                 >
                    <span className="material-icons-round text-sm mr-1">headphones</span> {t.audio}
                 </button>
              </div>

              <select 
                 value={quality}
                 onChange={(e) => setQuality(e.target.value)}
                 className="bg-slate-900 text-xs font-medium text-slate-200 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-pink-500 shrink-0 min-w-[120px]"
              >
                 {selectedType === 'video' ? (
                   <>
                     <option value="4K">4K Ultra HD</option>
                     <option value="1080p">1080p HD</option>
                     <option value="720p">720p</option>
                     <option value="480p">480p</option>
                   </>
                 ) : (
                   <>
                     <option value="320kbps">HQ Audio (320k)</option>
                     <option value="192kbps">Standard (192k)</option>
                     <option value="128kbps">Low (128k)</option>
                   </>
                 )}
              </select>

              <button 
                 onClick={handleDownload}
                 disabled={isDownloading || !urlInput}
                 className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center shadow-lg shadow-pink-500/20 active:scale-95 transition-all shrink-0"
              >
                 {isDownloading ? (
                    <span className="material-icons-round animate-spin text-sm mr-2">refresh</span>
                 ) : (
                    <span className="material-icons-round text-sm mr-2">download</span>
                 )}
                 {isDownloading ? t.analyzing : t.download}
              </button>
           </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT: Split View (List + Lyrics/Visuals) */}
      <div className="flex-1 overflow-hidden flex relative">
         
         {/* Left: Queue/Library 
             Added onClick to close lyrics panel if open (Requirement 1)
         */}
         <div 
            className={`flex-1 p-6 overflow-y-auto custom-scrollbar transition-all duration-500 ${showLyrics ? 'w-1/2 opacity-40 blur-[1px] cursor-pointer' : 'w-full'}`}
            onClick={() => showLyrics && setShowLyrics(false)}
         >
            <div className="max-w-5xl mx-auto space-y-4">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                  <span className="material-icons-round text-sm mr-2">queue_music</span>
                  {t.library}
               </h3>
               
               {queue.map(item => (
                  <div 
                     key={item.id} 
                     className={`group p-3 rounded-xl border transition-all flex items-center space-x-4 cursor-pointer
                        ${activeItem?.id === item.id 
                           ? 'bg-pink-500/10 border-pink-500/30' 
                           : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                     onClick={(e) => { 
                        e.stopPropagation(); // Prevent closing sidebar if clicking an item
                        setActiveItem(item); 
                        setIsPlaying(true); 
                        // Reset progress for new item if different
                        if (activeItem?.id !== item.id) {
                            setPlaybackProgress(0);
                            setCurrentTime(0);
                        }
                     }}
                  >
                     {/* Cover/Icon - Clean visual with no buggy overlays */}
                     <div className={`w-12 h-12 rounded-lg ${item.coverColor} flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden`}>
                        {item.status === 'downloading' ? (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="material-icons-round text-white animate-spin">refresh</span>
                           </div>
                        ) : (
                           <span className="material-icons-round text-white text-xl">
                              {activeItem?.id === item.id && isPlaying ? 'equalizer' : (item.type === 'video' ? 'movie' : 'music_note')}
                           </span>
                        )}
                     </div>

                     {/* Info */}
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                           <h4 className={`text-sm font-bold truncate pr-4 ${activeItem?.id === item.id ? 'text-pink-400' : 'text-slate-200'}`}>{item.title}</h4>
                           <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              item.status === 'completed' ? 'text-emerald-400 bg-emerald-400/10' :
                              item.status === 'downloading' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 bg-white/5'
                           }`}>
                              {item.status === 'completed' ? t.completed : item.status === 'downloading' ? t.downloading : t.queued}
                           </span>
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500 font-mono space-x-3">
                           <span className="flex items-center text-slate-400"><span className={`material-icons-round text-[12px] mr-1 ${getPlatformIcon(item.platform).color}`}>{getPlatformIcon(item.platform).icon}</span> {item.author}</span>
                           <span>•</span>
                           <span>{item.quality}</span>
                           <span>•</span>
                           <span>{item.totalSize}</span>
                           {item.status === 'downloading' && <span className="text-blue-400">• {item.speed}</span>}
                        </div>
                        
                        {/* Progress Bar (if downloading) */}
                        {item.status === 'downloading' && (
                           <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                           </div>
                        )}
                     </div>

                     {/* Actions - UPDATED */}
                     <div className={`flex items-center transition-opacity relative ${openMenuId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="Open Folder">
                           <span className="material-icons-round text-lg">folder</span>
                        </button>
                        <button 
                           onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === item.id ? null : item.id);
                           }}
                           className={`p-2 rounded-lg transition-colors ${openMenuId === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                        >
                           <span className="material-icons-round text-lg">more_vert</span>
                        </button>

                        {/* Context Menu */}
                        {openMenuId === item.id && (
                           <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl z-50 p-1 flex flex-col animate-[fadeIn_0.1s_ease-out]" onClick={(e) => e.stopPropagation()}>
                                 <button 
                                    className="flex items-center space-x-3 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors text-left w-full"
                                    onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(item); setOpenMenuId(null); }}
                                 >
                                    <span className="material-icons-round text-sm opacity-70">playlist_add</span>
                                    <span>{t.addToPlaylist}</span>
                                 </button>
                                 <button 
                                    className="flex items-center space-x-3 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors text-left w-full"
                                    onClick={(e) => { e.stopPropagation(); handlePlayNext(item); setOpenMenuId(null); }}
                                 >
                                    <span className="material-icons-round text-sm opacity-70">playlist_play</span>
                                    <span>{t.playNext}</span>
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Right: Lyrics / Visualizer Panel (Absolute Overlay or Side) */}
         {activeItem && (
            <div className={`absolute inset-y-0 right-0 w-full md:w-1/2 bg-[#0b1120]/95 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col transition-transform duration-500 z-10 ${showLyrics ? 'translate-x-0' : 'translate-x-full'}`}>
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lyrics}</h3>
                  <button onClick={() => setShowLyrics(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                     <span className="material-icons-round">close_fullscreen</span>
                  </button>
               </div>
               
               {/* Cover Art Large */}
               <div className="flex items-center space-x-6 mb-8">
                  <div className={`w-24 h-24 rounded-2xl ${activeItem.coverColor} shadow-2xl flex items-center justify-center shrink-0`}>
                     <span className="material-icons-round text-4xl text-white">music_note</span>
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-white mb-1">{activeItem.title}</h2>
                     <p className="text-sm text-pink-400">{activeItem.author}</p>
                     <p className="text-xs text-slate-500 font-mono mt-2">{activeItem.quality} • {activeItem.format}</p>
                  </div>
               </div>

               {/* Scrolling Lyrics */}
               <div className="flex-1 overflow-y-auto custom-scrollbar relative mask-image-gradient">
                  <div className="space-y-6 py-10 text-center">
                     {activeItem.lyrics ? activeItem.lyrics.map((line, index) => (
                        <p 
                           key={index} 
                           className={`transition-all duration-300 font-medium ${
                              index === currentLyricIndex 
                                 ? 'text-white text-lg scale-105 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' 
                                 : 'text-slate-600 text-sm'
                           }`}
                        >
                           {line.text}
                        </p>
                     )) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                           <span className="material-icons-round text-4xl mb-4 opacity-20">mic_off</span>
                           <p>No lyrics available for this track.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* 3. PLAYER BAR (Footer) */}
      <div className="h-24 bg-[#0b1120] border-t border-white/5 px-6 flex items-center justify-between shrink-0 z-30">
         
         {/* Left: Current Track Info */}
         <div className="flex items-center w-1/4 min-w-[200px]">
            {activeItem ? (
               <>
                  <div className={`w-14 h-14 rounded-xl ${activeItem.coverColor} flex items-center justify-center shadow-lg mr-4`}>
                     <span className="material-icons-round text-2xl text-white">music_note</span>
                  </div>
                  <div className="min-w-0">
                     <div className="text-sm font-bold text-white truncate">{activeItem.title}</div>
                     <div className="text-xs text-slate-400 truncate">{activeItem.author}</div>
                  </div>
               </>
            ) : (
               <div className="text-xs text-slate-600 italic">Select media to play...</div>
            )}
         </div>

         {/* Center: Controls & Progress */}
         <div className="flex-1 max-w-2xl flex flex-col items-center">
            <div className="flex items-center space-x-6 mb-2">
               <button className="text-slate-400 hover:text-white transition-colors" title="Shuffle"><span className="material-icons-round text-lg">shuffle</span></button>
               <button className="text-slate-200 hover:text-white transition-colors"><span className="material-icons-round text-3xl">skip_previous</span></button>
               
               <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/20 active:scale-95 transition-all"
               >
                  <span className="material-icons-round text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
               </button>
               
               <button className="text-slate-200 hover:text-white transition-colors"><span className="material-icons-round text-3xl">skip_next</span></button>
               <button className="text-slate-400 hover:text-white transition-colors" title="Repeat"><span className="material-icons-round text-lg">repeat</span></button>
            </div>
            
            <div className="w-full flex items-center space-x-3 text-[10px] font-mono font-medium text-slate-400">
               <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
               
               {/* Draggable Progress Bar (Requirement 2) */}
               <div 
                  ref={progressBarRef}
                  onMouseDown={handleMouseDown}
                  className="flex-1 h-3 flex items-center cursor-pointer group select-none"
               >
                  <div className="h-1 w-full bg-white/10 rounded-full relative overflow-visible">
                      <div className="absolute inset-y-0 left-0 bg-pink-500 rounded-full group-hover:bg-pink-400 transition-colors" style={{ width: `${playbackProgress}%` }}></div>
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow transition-all ${isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'}`} 
                        style={{ left: `${playbackProgress}%` }}
                      ></div>
                  </div>
               </div>

               <span>{activeItem?.duration || '00:00'}</span>
            </div>
         </div>

         {/* Right: Extra Controls */}
         <div className="w-1/4 min-w-[200px] flex items-center justify-end space-x-4">
            <button 
               onClick={() => setShowLyrics(!showLyrics)}
               className={`p-2 rounded-lg transition-colors ${showLyrics ? 'text-pink-400 bg-pink-400/10' : 'text-slate-400 hover:text-white'}`}
               title={t.lyrics}
            >
               <span className="material-icons-round text-lg">lyrics</span>
            </button>

            {/* Playlist Toggle */}
            <div className="relative">
               <button 
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`p-2 rounded-lg transition-colors ${showPlaylist ? 'text-pink-400 bg-pink-400/10' : 'text-slate-400 hover:text-white'}`}
                  title={t.playlist}
               >
                  <span className="material-icons-round text-lg">queue_music</span>
               </button>

               {showPlaylist && (
                  <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowPlaylist(false)}></div>
                     <div className="absolute bottom-full right-0 mb-4 w-80 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[60vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                           <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.playlist}</h3>
                           <div className="flex items-center space-x-3">
                              <span className="text-[10px] text-slate-400 font-mono">{playlist.length} items</span>
                              {playlist.length > 0 && (
                                <button 
                                  onClick={handleClearPlaylist}
                                  className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                                >
                                  {t.clear}
                                </button>
                              )}
                           </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                           {playlist.length === 0 ? (
                               <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                                   <span className="material-icons-round text-2xl mb-2 opacity-50">queue_music</span>
                                   <span className="text-xs">Queue is empty</span>
                               </div>
                           ) : (
                               playlist.map((item, index) => (
                                  <div 
                                     key={`${item.id}-${index}`}
                                     onClick={() => { setActiveItem(item); setIsPlaying(true); }}
                                     className={`group flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${activeItem?.id === item.id ? 'bg-pink-500/20' : 'hover:bg-white/5'}`}
                                  >
                                     {/* Playing Indicator */}
                                     <div className="w-4 flex justify-center shrink-0">
                                         {activeItem?.id === item.id && isPlaying ? (
                                            <span className="material-icons-round text-pink-400 text-sm animate-pulse">equalizer</span>
                                         ) : (
                                            <span className="text-[10px] text-slate-500 font-mono group-hover:hidden">{index + 1}</span>
                                         )}
                                          <span className="material-icons-round text-slate-400 text-sm hidden group-hover:block">play_arrow</span>
                                     </div>
                                     <div className="min-w-0 flex-1">
                                        <div className={`text-xs font-medium truncate ${activeItem?.id === item.id ? 'text-pink-300' : 'text-slate-200'}`}>{item.title}</div>
                                        <div className="text-[10px] text-slate-500 truncate">{item.author}</div>
                                     </div>
                                     <div className="flex items-center space-x-2">
                                        <span className="text-[10px] text-slate-600 font-mono group-hover:hidden">{item.duration}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(index); }}
                                            className="hidden group-hover:block p-1 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded transition-all"
                                            title="Remove"
                                        >
                                            <span className="material-icons-round text-sm">close</span>
                                        </button>
                                     </div>
                                  </div>
                               ))
                           )}
                        </div>
                     </div>
                  </>
               )}
            </div>
            
            {/* Speed Control - Updated to Click-Toggle Logic */}
            <div className="relative">
               <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className={`text-xs font-bold border rounded px-2 py-1 w-10 transition-colors ${showSpeedMenu ? 'text-white border-white/30 bg-white/10' : 'text-slate-400 hover:text-white border-white/10'}`}
               >
                  {playbackRate}x
               </button>
               
               {showSpeedMenu && (
                  <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)}></div>
                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e293b] border border-white/10 rounded-lg p-1 flex flex-col shadow-xl z-50 min-w-[60px]">
                        {[2.0, 1.5, 1.0, 0.5].map(rate => (
                           <button 
                              key={rate} 
                              onClick={() => { setPlaybackRate(rate); setShowSpeedMenu(false); }}
                              className={`px-3 py-1.5 text-xs hover:bg-white/10 rounded transition-colors ${playbackRate === rate ? 'text-pink-400 font-bold' : 'text-slate-300'}`}
                           >
                              {rate}x
                           </button>
                        ))}
                     </div>
                  </>
               )}
            </div>

            {/* Draggable Volume Bar */}
            <div className="flex items-center space-x-2 group">
               <button onClick={() => setVolume(v => v === 0 ? 80 : 0)} className="text-slate-400 hover:text-white transition-colors">
                  <span className="material-icons-round text-lg">{volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}</span>
               </button>
               <div 
                  ref={volumeBarRef}
                  onMouseDown={(e) => { setIsDraggingVolume(true); handleVolumeChange(e); }}
                  className="w-20 h-4 flex items-center cursor-pointer"
               >
                  <div className="w-full h-1 bg-white/10 rounded-full relative">
                      <div className="absolute inset-y-0 left-0 bg-slate-400 group-hover:bg-white rounded-full transition-colors" style={{ width: `${volume}%` }}></div>
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow transition-all ${isDraggingVolume ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'}`} 
                        style={{ left: `${volume}%` }}
                      ></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Disclaimer */}
      <div className="absolute bottom-0 right-0 left-0 pointer-events-none flex justify-center pb-0.5 opacity-0 hover:opacity-100 transition-opacity z-50">
          <span className="text-[8px] text-slate-600 bg-black/80 px-2 py-0.5 rounded-t-lg backdrop-blur-sm border-t border-x border-white/5">
             {t.disclaimer}
          </span>
      </div>

    </div>
  );
};
