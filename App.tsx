
import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from './components/Layout';
import { Hub } from './components/Hub';
import { AppView, AppConfig, Language } from './types';

// View Components
import { FileConverter } from './views/FileConverter';
import { TransitStation } from './views/TransitStation';
import { ParallelInterface } from './views/ParallelInterface';
import { MediaDownloader } from './views/MediaDownloader';
import { CourseTable } from './views/CourseTable';
import { ScheduleTask } from './views/ScheduleTask';
import { DiskVisualizer } from './views/DiskVisualizer';
import { Desktop } from './views/Desktop';
import { VirtualWorkspaces } from './views/VirtualWorkspaces';
import { MediaConverter } from './views/MediaConverter';

const TRANSLATIONS = {
  en: {
    "File Converter": "File Converter",
    "Multi-format engine": "Multi-format engine",
    "Transit Station": "Transit Station",
    "Temp Storage": "Temp Storage",
    "AI+ Parallel": "AI+ Parallel",
    "LLM Interface": "LLM Interface",
    "V-Manager": "V-Manager",
    "Virtual Desktops": "Virtual Desktops",
    "MediaHub": "MediaHub",
    "Downloader": "Downloader",
    "Course Table": "Course Table",
    "Schedule & Task": "Schedule & Task",
    "Calendar": "Calendar",
    "Disk Manager": "Disk Manager",
    "Storage Analysis": "Storage Analysis",
    "Desktop": "Desktop",
    "System Overview": "System Overview",
    "Media Converter": "Media Converter",
    "Video Processing": "Video Processing",
    "System Ready": "System Ready",
    "Converting Batch #42...": "Converting Batch #42...",
    "Syncing Local Cache...": "Syncing Local Cache...",
    "Syncing Multi-Model States...": "Syncing Multi-Model States...",
    "Caching Stream Data...": "Caching Stream Data...",
    "Scanning Drives...": "Scanning Drives...",
    "Syncing Calendar Assets...": "Syncing Calendar Assets...",
    "Initializing FFmpeg...": "Initializing FFmpeg...",
    "Loading Module...": "Loading Module...",
    "System Idle": "System Idle",
    "Ready": "Ready",
    "Refreshing view...": "Refreshing view...",
    "Undoing last action...": "Undoing last action...",
    "Redoing last action...": "Redoing last action..."
  },
  zh: {
    "File Converter": "文件转换器",
    "Multi-format engine": "多格式引擎",
    "Transit Station": "中转站",
    "Temp Storage": "临时存储",
    "AI+ Parallel": "AI 并行接口",
    "LLM Interface": "大模型接口",
    "V-Manager": "V-Manager",
    "Virtual Desktops": "虚拟桌面",
    "MediaHub": "媒体中心",
    "Downloader": "下载器",
    "Course Table": "课程表",
    "Schedule & Task": "日程与任务",
    "Calendar": "日历",
    "Disk Manager": "磁盘管理",
    "Storage Analysis": "存储分析",
    "Desktop": "桌面",
    "System Overview": "系统概览",
    "Media Converter": "媒体转换器",
    "Video Processing": "视频处理",
    "System Ready": "系统就绪",
    "Converting Batch #42...": "正在转换批次 #42...",
    "Syncing Local Cache...": "正在同步本地缓存...",
    "Syncing Multi-Model States...": "正在同步多模型状态...",
    "Caching Stream Data...": "正在缓存流数据...",
    "Scanning Drives...": "正在扫描驱动器...",
    "Syncing Calendar Assets...": "正在同步日历资源...",
    "Initializing FFmpeg...": "正在初始化 FFmpeg...",
    "Loading Module...": "正在加载模块...",
    "System Idle": "系统空闲",
    "Ready": "就绪",
    "Refreshing view...": "正在刷新视图...",
    "Undoing last action...": "正在撤销上一步操作...",
    "Redoing last action...": "正在重做上一步操作..."
  }
};

// Configuration
const APP_CONFIGS: Record<AppView, AppConfig> = {
  [AppView.FILE_CONVERTER]: { id: AppView.FILE_CONVERTER, name: 'File Converter', path: '/mnt/storage/conversion_queue', icon: 'swap_horiz', description: 'Multi-format engine', color: 'bg-rose-500' },
  [AppView.TRANSIT_STATION]: { id: AppView.TRANSIT_STATION, name: 'Transit Station', path: '/transit/active_storage', icon: 'inventory_2', description: 'Temp Storage', color: 'bg-blue-500' },
  [AppView.AI_PARALLEL]: { id: AppView.AI_PARALLEL, name: 'AI+ Parallel', path: '/network/multi-model/parallel', icon: 'psychology', description: 'LLM Interface', color: 'bg-purple-500' },
  [AppView.VIRTUAL_WORKSPACES]: { id: AppView.VIRTUAL_WORKSPACES, name: 'V-Manager', path: '/root/v-spaces/main', icon: 'folder_open', description: 'Virtual Desktops', color: 'bg-blue-600' },
  [AppView.MEDIA_DOWNLOADER]: { id: AppView.MEDIA_DOWNLOADER, name: 'MediaHub', path: '/root/media/downloads', icon: 'movie', description: 'Downloader', color: 'bg-pink-500' },
  [AppView.COURSE_TABLE]: { id: AppView.COURSE_TABLE, name: 'Course Table', path: '/apps/course_table', icon: 'school', description: 'Schedule', color: 'bg-indigo-500' },
  [AppView.SCHEDULE_TASK]: { id: AppView.SCHEDULE_TASK, name: 'Schedule & Task', path: '/apps/calendar_v4', icon: 'calendar_month', description: 'Calendar', color: 'bg-cyan-500' },
  [AppView.DISK_VISUALIZER]: { id: AppView.DISK_VISUALIZER, name: 'Disk Manager', path: '/dev/sda1_visualizer', icon: 'album', description: 'Storage Analysis', color: 'bg-orange-500' },
  [AppView.MEDIA_CONVERTER]: { id: AppView.MEDIA_CONVERTER, name: 'Media Converter', path: '/usr/bin/ffmpeg-v5.0', icon: 'movie_filter', description: 'Video Processing', color: 'bg-rose-600' }
};

const DESKTOP_CONFIG: AppConfig = {
  id: 'DESKTOP' as any,
  name: 'Desktop',
  path: '~/Desktop',
  icon: 'grid_view',
  description: 'System Overview',
  color: 'bg-slate-500'
};

// Placeholder for views not yet fully implemented
const PlaceholderView: React.FC<{ name: string }> = ({ name }) => (
  <div className="h-full w-full flex items-center justify-center flex-col text-slate-500">
    <span className="material-icons-round text-6xl mb-4 opacity-20">construction</span>
    <h2 className="text-xl font-bold opacity-50">{name} Module</h2>
    <p className="text-xs font-mono mt-2">v4.0.2 - UNDER CONSTRUCTION</p>
  </div>
);

const App: React.FC = () => {
  // Localization State
  const [language, setLanguage] = useState<Language>('en');

  // Navigation History Stack
  const [history, setHistory] = useState<(AppView | null)[]>([null]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Derived state for current view
  const activeApp = history[currentIndex];

  const [runningApps, setRunningApps] = useState<AppView[]>([]);
  const [pinnedApps, setPinnedApps] = useState<AppView[]>([
    AppView.FILE_CONVERTER,
    AppView.TRANSIT_STATION,
    AppView.AI_PARALLEL
  ]); 
  
  const [isHubOpen, setIsHubOpen] = useState(false);

  // Status Simulation
  const [statusText, setStatusText] = useState('System Ready');
  const [progress, setProgress] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger effects on demand

  // Helper to translate
  const t = (key: string): string => {
    return (TRANSLATIONS[language] as any)[key] || key;
  };

  // Generate localized configs
  const getLocalizedAppConfig = (config: AppConfig) => ({
    ...config,
    name: t(config.name),
    description: t(config.description)
  });

  const localizedAppConfigs = Object.fromEntries(
    Object.entries(APP_CONFIGS).map(([key, config]) => [key, getLocalizedAppConfig(config)])
  ) as Record<AppView, AppConfig>;

  // Navigation Logic
  const navigateTo = (view: AppView | null) => {
    if (view === activeApp) return;

    // Truncate history if we are in the middle and navigating to new page
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(view);
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);

    // If opening an app, ensure it's in running list
    if (view && !runningApps.includes(view)) {
      setRunningApps(prev => [...prev, view]);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setStatusText(t('Refreshing view...'));
    setProgress(0);
    setRefreshKey(prev => prev + 1);
  };

  const handleUndo = () => {
    setStatusText(t('Undoing last action...'));
    setProgress(0);
    setRefreshKey(prev => prev + 1);
  };

  const handleRedo = () => {
    setStatusText(t('Redoing last action...'));
    setProgress(0);
    setRefreshKey(prev => prev + 1);
  };

  // Simulate dynamic status based on view or refresh action
  React.useEffect(() => {
    if (!activeApp) {
      // If we just refreshed on desktop
      if (progress === 0) {
          const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) { clearInterval(interval); return 100; }
                return p + 10;
            });
          }, 50);
          return () => clearInterval(interval);
      }
      setStatusText(t('System Idle'));
      setProgress(100);
      return;
    }

    setProgress(0);
    
    let text = t('Ready');
    switch(activeApp) {
      case AppView.FILE_CONVERTER: text = t('Converting Batch #42...'); break;
      case AppView.TRANSIT_STATION: text = t('Syncing Local Cache...'); break;
      case AppView.AI_PARALLEL: text = t('Syncing Multi-Model States...'); break;
      case AppView.MEDIA_DOWNLOADER: text = t('Caching Stream Data...'); break;
      case AppView.DISK_VISUALIZER: text = t('Scanning Drives...'); break;
      case AppView.COURSE_TABLE:
      case AppView.SCHEDULE_TASK: 
          text = t('Syncing Calendar Assets...'); break;
      case AppView.MEDIA_CONVERTER: text = t('Initializing FFmpeg...'); break;
      default: text = t('Loading Module...');
    }
    // If it's a refresh/undo/redo trigger, keep the custom text provided by the handler, otherwise set app status
    if (progress === 100) {
       setStatusText(text);
    }

    // Fake progress bar animation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStatusText(t('Ready')); // Reset text to Ready when done
          return 100;
        }
        return p + Math.floor(Math.random() * 15);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeApp, refreshKey, language]); // Added language dep to update status text

  const renderView = () => {
    if (!activeApp) return <Desktop lang={language} />;

    switch (activeApp) {
      case AppView.FILE_CONVERTER: return <FileConverter lang={language} />;
      case AppView.TRANSIT_STATION: return <TransitStation lang={language} />;
      case AppView.AI_PARALLEL: return <ParallelInterface lang={language} />;
      case AppView.MEDIA_DOWNLOADER: return <MediaDownloader lang={language} />;
      case AppView.COURSE_TABLE: return <CourseTable lang={language} />;
      case AppView.SCHEDULE_TASK: return <ScheduleTask lang={language} />;
      case AppView.DISK_VISUALIZER: return <DiskVisualizer lang={language} />;
      case AppView.VIRTUAL_WORKSPACES: return <VirtualWorkspaces lang={language} />;
      case AppView.MEDIA_CONVERTER: return <MediaConverter lang={language} />;
      default: return <PlaceholderView name={localizedAppConfigs[activeApp as AppView]?.name ?? 'Unknown'} />;
    }
  };

  const handleAppClick = (appId: AppView) => {
    if (activeApp === appId) {
      navigateTo(null);
    } else {
      navigateTo(appId);
    }
  };

  const handleCloseApp = (appId: AppView) => {
    setRunningApps(prev => prev.filter(id => id !== appId));
    if (activeApp === appId) {
      navigateTo(null);
    }
  };

  const handlePin = (appId: AppView) => {
    if (pinnedApps.includes(appId)) {
      setPinnedApps(prev => prev.filter(id => id !== appId));
    } else {
      setPinnedApps(prev => [...prev, appId]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background-dark text-slate-200 font-display overflow-hidden relative selection:bg-blue-500/30">
      <Header 
        currentApp={activeApp ? localizedAppConfigs[activeApp] : getLocalizedAppConfig(DESKTOP_CONFIG)} 
        statusText={statusText}
        progress={progress}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canGoBack={currentIndex > 0}
        canGoForward={currentIndex < history.length - 1}
        lang={language}
      />
      
      <Sidebar 
        activeApp={activeApp}
        runningApps={runningApps}
        onAppClick={handleAppClick}
        onCloseApp={handleCloseApp}
        onToggleHub={() => setIsHubOpen(!isHubOpen)}
        isHubOpen={isHubOpen}
        apps={localizedAppConfigs}
        pinnedApps={pinnedApps}
        onPin={handlePin}
        lang={language}
        onToggleLanguage={() => setLanguage(l => l === 'en' ? 'zh' : 'en')}
      />

      <main className="flex-1 ml-16 mt-14 h-[calc(100vh-3.5rem)] relative z-10">
        {renderView()}
      </main>

      <Hub 
        isOpen={isHubOpen} 
        onClose={() => setIsHubOpen(false)}
        onNavigate={(appId) => {
          handleAppClick(appId);
        }}
        apps={Object.values(localizedAppConfigs)}
        lang={language}
      />
      
      {/* Background Overlay when HUB is open */}
      {isHubOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsHubOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
