
export enum AppView {
  FILE_CONVERTER = 'FILE_CONVERTER',
  TRANSIT_STATION = 'TRANSIT_STATION',
  AI_PARALLEL = 'AI_PARALLEL',
  VIRTUAL_WORKSPACES = 'VIRTUAL_WORKSPACES',
  MEDIA_DOWNLOADER = 'MEDIA_DOWNLOADER',
  COURSE_TABLE = 'COURSE_TABLE',
  SCHEDULE_TASK = 'SCHEDULE_TASK',
  DISK_VISUALIZER = 'DISK_VISUALIZER',
  MEDIA_CONVERTER = 'MEDIA_CONVERTER'
}

export type Language = 'en' | 'zh';

export interface Breadcrumb {
  label: string;
  path: string;
}

export interface AppConfig {
  id: AppView;
  name: string; // This will now be a key for translation or the fallback
  path: string;
  icon: string;
  description: string;
  color: string;
}