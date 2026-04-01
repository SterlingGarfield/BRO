
import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

// --- Types ---

type ViewMode = 'day' | 'week' | 'month' | 'year';
type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in-progress' | 'done';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date; // For month view simplified logic
  startTime: string;
  endTime: string;
  type: 'meeting' | 'work' | 'course' | 'personal';
  color: string;
  description?: string;
  isSync?: boolean; // From course table
}

interface ToDoTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: Date;
  progress: number; // 0-100
  tags: string[];
  description?: string;
  reminder?: string;
}

// --- Mock Initial Data ---

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'System Review', date: new Date(), startTime: '09:00', endTime: '10:00', type: 'meeting', color: 'bg-blue-600' },
  { id: '2', title: 'Project Launch', date: new Date(new Date().setDate(new Date().getDate() + 2)), startTime: '14:00', endTime: '15:00', type: 'work', color: 'bg-emerald-600' },
  { id: '3', title: 'Sprint Demo', date: new Date(new Date().setDate(new Date().getDate() + 5)), startTime: '10:00', endTime: '11:00', type: 'meeting', color: 'bg-indigo-600' },
  { id: '4', title: 'Design Sync', date: new Date(new Date().setDate(new Date().getDate() + 5)), startTime: '11:00', endTime: '12:00', type: 'meeting', color: 'bg-purple-600' },
];

const INITIAL_TASKS: ToDoTask[] = [
  { id: 't1', title: 'Finalize Q4 API Schema', priority: 'high', status: 'in-progress', deadline: new Date(), progress: 65, tags: ['Dev', 'API'] },
  { id: 't2', title: 'Asset Generation Pipeline', priority: 'medium', status: 'todo', deadline: new Date(new Date().setDate(new Date().getDate() + 3)), progress: 20, tags: ['Dev', 'Graphics'] },
  { id: 't3', title: 'Weekly Database Vacuum', priority: 'low', status: 'todo', deadline: new Date(new Date().setDate(new Date().getDate() + 1)), progress: 0, tags: ['Maintenance'] },
  { id: 't4', title: 'Security Patch v2.1', priority: 'high', status: 'done', deadline: new Date(new Date().setDate(new Date().getDate() - 1)), progress: 100, tags: ['Security'] },
];

export const ScheduleTask: React.FC<Props> = ({ lang }) => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<ToDoTask[]>(INITIAL_TASKS);
  
  // Selection / Modals
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent>>({});
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<ToDoTask>>({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Translations ---
  const t = {
    title: lang === 'en' ? 'Schedule & Tasks' : '日程与任务管理',
    subtitle: lang === 'en' ? 'Integrated timeline and priority tracking' : '集成化时间轴与优先级追踪',
    
    // Calendar
    views: {
      day: lang === 'en' ? 'Day' : '日',
      week: lang === 'en' ? 'Week' : '周',
      month: lang === 'en' ? 'Month' : '月',
      year: lang === 'en' ? 'Year' : '年',
    },
    daysShort: lang === 'en' 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] 
      : ['日', '一', '二', '三', '四', '五', '六'],
    syncCourses: lang === 'en' ? 'Sync Courses' : '同步课表',
    syncing: lang === 'en' ? 'Syncing...' : '同步中...',
    today: lang === 'en' ? 'Today' : '今天',
    newEvent: lang === 'en' ? 'New Event' : '新建日程',
    
    // Tasks
    taskTitle: lang === 'en' ? 'Task Manager' : '任务管理',
    addTask: lang === 'en' ? 'Add Task' : '新建任务',
    searchPlaceholder: lang === 'en' ? 'Search tasks...' : '搜索任务...',
    filterAll: lang === 'en' ? 'All' : '全部',
    priority: {
      high: lang === 'en' ? 'High' : '高',
      medium: lang === 'en' ? 'Med' : '中',
      low: lang === 'en' ? 'Low' : '低',
    },
    status: {
      todo: lang === 'en' ? 'To Do' : '待办',
      inprogress: lang === 'en' ? 'In Progress' : '进行中',
      done: lang === 'en' ? 'Done' : '已完成',
    },
    
    // Form
    save: lang === 'en' ? 'Save' : '保存',
    cancel: lang === 'en' ? 'Cancel' : '取消',
    delete: lang === 'en' ? 'Delete' : '删除',
    labels: {
      title: lang === 'en' ? 'Title' : '标题',
      time: lang === 'en' ? 'Time' : '时间',
      type: lang === 'en' ? 'Type' : '类型',
      priority: lang === 'en' ? 'Priority' : '优先级',
      progress: lang === 'en' ? 'Progress' : '进度',
      tags: lang === 'en' ? 'Tags (comma separated)' : '标签 (逗号分隔)',
      desc: lang === 'en' ? 'Description' : '描述',
    }
  };

  // --- Calendar Logic ---

  const getDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Previous Month Padding
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.unshift({
        date: new Date(year, month, -i),
        isCurrentMonth: false
      });
    }
    
    // Current Month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next Month Padding (to fill 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent({ date, startTime: '09:00', endTime: '10:00', type: 'work', color: 'bg-blue-600' });
    setShowEventModal(true);
  };

  const handleEditEvent = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!editingEvent.title) return;
    
    setEvents(prev => {
      if (editingEvent.id) {
        return prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...editingEvent } as CalendarEvent : ev);
      } else {
        const newEvent: CalendarEvent = {
          ...editingEvent as CalendarEvent,
          id: Date.now().toString(),
        };
        return [...prev, newEvent];
      }
    });
    setShowEventModal(false);
  };

  const handleDeleteEvent = () => {
    if (editingEvent.id) {
      setEvents(prev => prev.filter(ev => ev.id !== editingEvent.id));
    }
    setShowEventModal(false);
  };

  // --- Sync Course Simulation ---
  const handleSyncCourses = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Mock importing courses
      const newEvents: CalendarEvent[] = [
        { id: 'c1', title: 'Adv. AI Algorithms', date: new Date(), startTime: '08:00', endTime: '09:40', type: 'course', color: 'bg-sky-600', isSync: true },
        { id: 'c2', title: 'Quantum Computing', date: new Date(new Date().setDate(new Date().getDate() + 1)), startTime: '10:00', endTime: '12:00', type: 'course', color: 'bg-violet-600', isSync: true },
        { id: 'c3', title: 'Data Structures', date: new Date(new Date().setDate(new Date().getDate() + 3)), startTime: '14:00', endTime: '15:40', type: 'course', color: 'bg-orange-600', isSync: true },
      ];
      setEvents(prev => {
        // Filter out old sync events to avoid dupes
        const clean = prev.filter(e => !e.isSync);
        return [...clean, ...newEvents];
      });
      setIsSyncing(false);
    }, 1500);
  };

  // --- Task Logic ---

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTask = () => {
    setEditingTask({ 
      title: '', 
      priority: 'medium', 
      status: 'todo', 
      progress: 0, 
      tags: [],
      deadline: new Date() 
    });
    setShowTaskModal(true);
  };

  const handleEditTask = (task: ToDoTask) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!editingTask.title) return;

    setTasks(prev => {
      if (editingTask.id) {
        return prev.map(t => t.id === editingTask.id ? { ...t, ...editingTask } as ToDoTask : t);
      } else {
        const newTask: ToDoTask = {
          ...editingTask as ToDoTask,
          id: 't-' + Date.now(),
          tags: typeof editingTask.tags === 'string' ? (editingTask.tags as string).split(',').map((s: string) => s.trim()) : (editingTask.tags || []),
        };
        return [...prev, newTask];
      }
    });
    setShowTaskModal(false);
  };

  const handleDeleteTask = () => {
    if (editingTask.id) {
      setTasks(prev => prev.filter(t => t.id !== editingTask.id));
    }
    setShowTaskModal(false);
  };

  // --- Render Helpers ---

  const renderDayView = () => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.date), currentDate));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0f172a]/30">
        <div className="relative min-h-[1440px] p-4">
          {/* Time Grid */}
          {hours.map(h => (
            <div key={h} className="absolute w-full border-t border-white/5 flex group" style={{ top: `${h * 60 + 20}px`, height: '60px' }}>
              <span className="w-16 text-right pr-4 text-[10px] text-slate-500 -mt-2 group-hover:text-slate-300 transition-colors">{h}:00</span>
              <div className="flex-1 border-l border-white/5"></div>
            </div>
          ))}

          {/* Events */}
          {dayEvents.map(ev => {
            const [startH, startM] = ev.startTime.split(':').map(Number);
            const [endH, endM] = ev.endTime.split(':').map(Number);
            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;
            const duration = endMin - startMin;
            
            return (
              <div
                key={ev.id}
                onClick={(e) => handleEditEvent(e, ev)}
                className={`absolute left-20 right-4 rounded-lg p-3 border-l-4 ${ev.color} bg-opacity-20 hover:brightness-110 cursor-pointer transition-all overflow-hidden shadow-sm group`}
                style={{
                  top: `${startMin + 20}px`,
                  height: `${Math.max(duration, 30)}px`,
                }}
              >
                 <div className={`absolute inset-0 opacity-10 ${ev.color}`}></div>
                 <div className="relative z-10">
                    <div className="text-xs font-bold text-white flex items-center">
                       {ev.title}
                       {ev.isSync && <span className="material-icons-round text-[10px] ml-1 opacity-70">sync</span>}
                    </div>
                    <div className="text-[10px] text-white/60 font-mono mt-0.5">{ev.startTime} - {ev.endTime}</div>
                 </div>
              </div>
            );
          })}
          
          {/* Current Time Line */}
          {isSameDay(currentDate, new Date()) && (
             <div 
               className="absolute left-16 right-0 border-t border-red-500 z-20 pointer-events-none flex items-center shadow-[0_0_10px_rgba(239,68,68,0.5)]"
               style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) + 20}px` }}
             >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm"></div>
                <div className="text-[9px] text-red-500 ml-1 font-mono bg-[#0f172a] px-1 rounded">
                   {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {months.map(month => {
             const days = getDaysInMonth(currentDate.getFullYear(), month);
             const monthDate = new Date(currentDate.getFullYear(), month, 1);
             const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === currentDate.getFullYear();
             
             return (
               <div 
                  key={month} 
                  className={`glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-white/20 ${isCurrentMonth ? 'ring-1 ring-blue-500/50 bg-blue-500/5' : ''}`} 
                  onClick={() => { setCurrentDate(monthDate); setViewMode('month'); }}
               >
                  <h3 className={`text-sm font-bold mb-3 ml-1 ${isCurrentMonth ? 'text-blue-400' : 'text-white'}`}>
                    {monthDate.toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { month: 'long' })}
                  </h3>
                  <div className="grid grid-cols-7 gap-1">
                     {['S','M','T','W','T','F','S'].map((d, i) => (
                        <div key={i} className="text-[8px] text-slate-600 text-center font-bold">{d}</div>
                     ))}
                     {days.map((d, i) => {
                        const isToday = isSameDay(d.date, new Date());
                        const hasEvent = events.some(e => isSameDay(new Date(e.date), d.date));
                        return (
                          <div key={i} className={`h-5 flex items-center justify-center rounded-full text-[9px] 
                             ${!d.isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                             ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}
                             ${hasEvent && !isToday ? 'text-emerald-400 font-bold bg-emerald-400/10' : ''}
                          `}>
                             {d.isCurrentMonth ? d.date.getDate() : ''}
                          </div>
                        );
                     })}
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
       <div className="glass rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col h-full">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-[#0f172a]/50">
             {t.daysShort.map((day, i) => (
                <div key={i} className={`py-3 text-center text-[11px] font-bold uppercase tracking-widest ${i >= 5 ? 'text-rose-400/70' : 'text-slate-500'}`}>
                   {day}
                </div>
             ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
             {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((cell, idx) => {
                const isToday = isSameDay(cell.date, new Date());
                const dayEvents = events.filter(e => isSameDay(new Date(e.date), cell.date));
                
                // Conflict Check: Simplistic check if more than 3 events
                const hasConflict = dayEvents.length > 3;

                return (
                   <div 
                      key={idx} 
                      onClick={() => handleDayClick(cell.date)}
                      className={`
                         border-r border-b border-white/5 p-2 min-h-[100px] relative group transition-colors cursor-pointer
                         ${!cell.isCurrentMonth ? 'bg-slate-900/30 opacity-40' : 'hover:bg-white/[0.03]'}
                         ${isToday ? 'bg-blue-500/5 ring-inset ring-1 ring-blue-500/30' : ''}
                      `}
                   >
                      <div className="flex justify-between items-start mb-1">
                         <span className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>
                            {cell.date.getDate()}
                         </span>
                         {hasConflict && (
                            <span className="material-icons-round text-[10px] text-amber-500" title="High Activity">warning</span>
                         )}
                      </div>

                      <div className="space-y-1">
                         {dayEvents.slice(0, 3).map(ev => renderEventChip(ev))}
                         {dayEvents.length > 3 && (
                            <div className="text-[9px] text-slate-500 text-center italic">+ {dayEvents.length - 3} more</div>
                         )}
                      </div>
                      
                      {/* Add Button on Hover */}
                      <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                         <span className="material-icons-round text-sm">add</span>
                      </button>
                   </div>
                );
             })}
          </div>
       </div>
    </div>
  );

  const renderEventChip = (ev: CalendarEvent) => (
    <div 
      key={ev.id}
      onClick={(e) => handleEditEvent(e, ev)}
      className={`px-1.5 py-0.5 rounded text-[9px] font-medium border-l-2 truncate cursor-pointer hover:brightness-110 mb-1 transition-all
        ${ev.color} text-white border-white/40 shadow-sm`}
      title={`${ev.startTime} - ${ev.title}`}
    >
      <span className="opacity-75 mr-1">{ev.startTime}</span>
      {ev.title}
    </div>
  );

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#0f172a] relative">
      
      {/* --- CALENDAR SECTION (Left/Center) --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-white/5">
           <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
                 <span className="material-icons-round text-blue-500 mr-2">calendar_month</span>
                 {t.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
           </div>
           
           <div className="flex items-center space-x-4">
              <button 
                onClick={handleSyncCourses}
                disabled={isSyncing}
                className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all active:scale-95"
              >
                 <span className={`material-icons-round text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                 <span>{isSyncing ? t.syncing : t.syncCourses}</span>
              </button>

              <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                 <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs text-slate-300 hover:text-white transition-colors">{t.today}</button>
                 <div className="w-[1px] h-4 bg-white/10 mx-1 self-center"></div>
                 <button onClick={handlePrev} className="px-2 py-1 text-slate-300 hover:text-white"><span className="material-icons-round text-sm">chevron_left</span></button>
                 <span className="px-3 py-1 text-sm font-bold text-white min-w-[120px] text-center">
                    {viewMode === 'year' 
                       ? currentDate.getFullYear()
                       : viewMode === 'day'
                          ? currentDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })
                          : currentDate.toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { month: 'long', year: 'numeric' })
                    }
                 </span>
                 <button onClick={handleNext} className="px-2 py-1 text-slate-300 hover:text-white"><span className="material-icons-round text-sm">chevron_right</span></button>
              </div>

              <div className="flex bg-black/20 p-1 rounded-lg border border-white/10 hidden sm:flex">
                 {(['day', 'month', 'year'] as ViewMode[]).map(mode => (
                    <button
                       key={mode}
                       onClick={() => setViewMode(mode)}
                       className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                       {t.views[mode]}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Content Area */}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'week' && renderMonthView()} {/* Fallback for now */}
      </div>

      {/* --- TASKS SIDEBAR (Right) --- */}
      <aside className="w-96 glass border-l border-white/10 flex flex-col shrink-0 z-10 bg-[#0f172a]/80 backdrop-blur-xl">
         <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center">
               <span className="material-icons-round text-emerald-400 mr-2">check_circle</span>
               {t.taskTitle}
            </h2>
            <button 
               onClick={handleAddTask}
               className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg active:scale-95 transition-all"
               title={t.addTask}
            >
               <span className="material-icons-round text-sm">add</span>
            </button>
         </div>

         {/* Search & Tabs */}
         <div className="px-5 py-4 space-y-3 bg-black/10 border-b border-white/5">
            {/* Search */}
            <div className="relative">
               <span className="material-icons-round absolute left-2.5 top-2 text-slate-500 text-sm">search</span>
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
               />
            </div>

            {/* Status Tabs */}
            <div className="flex p-1 bg-black/20 rounded-lg border border-white/5">
               {(['all', 'todo', 'in-progress', 'done'] as const).map(status => (
                  <button
                     key={status}
                     onClick={() => setStatusFilter(status)}
                     className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                        statusFilter === status 
                           ? 'bg-blue-600 text-white shadow-sm' 
                           : 'text-slate-500 hover:text-slate-300'
                     }`}
                  >
                     {status === 'all' ? t.filterAll : t.status[status === 'in-progress' ? 'inprogress' : status]}
                  </button>
               ))}
            </div>
         </div>

         {/* Task List */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredTasks.length === 0 && (
               <div className="text-center py-10 text-slate-500 text-xs italic">
                  No tasks found
               </div>
            )}
            
            {filteredTasks.map(task => (
               <div 
                  key={task.id}
                  onClick={() => handleEditTask(task)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden
                     ${task.status === 'done' ? 'bg-slate-800/50 border-white/5 opacity-60' : 'glass hover:bg-white/10 border-white/10'}
                  `}
               >
                  {/* Visual Progress Background for active tasks */}
                  {task.status !== 'done' && (
                     <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/20 w-full">
                        <div className="h-full bg-emerald-500" style={{ width: `${task.progress}%` }}></div>
                     </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <div className="flex items-center space-x-2 mb-1">
                           <span className={`w-2 h-2 rounded-full ${
                              task.priority === 'high' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]' :
                              task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                           }`}></span>
                           <h3 className={`text-sm font-bold truncate max-w-[180px] ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                              {task.title}
                           </h3>
                        </div>
                        <div className="flex space-x-1">
                           {task.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] bg-white/10 px-1.5 rounded text-slate-400">{tag}</span>
                           ))}
                        </div>
                     </div>
                     <button className="text-slate-500 hover:text-emerald-400 transition-colors">
                        <span className="material-icons-round text-lg">{task.status === 'done' ? 'check_circle' : 'radio_button_unchecked'}</span>
                     </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3">
                     <span className="flex items-center">
                        <span className="material-icons-round text-[12px] mr-1">event</span>
                        {new Date(task.deadline).toLocaleDateString()}
                     </span>
                     <span>{task.progress}%</span>
                  </div>
               </div>
            ))}
         </div>
         
         {/* Footer Stats */}
         <div className="p-3 border-t border-white/10 bg-black/20 text-[10px] text-slate-500 text-center font-mono">
            {tasks.filter(t => t.status === 'done').length} / {tasks.length} {t.status.done}
         </div>
      </aside>

      {/* --- MODALS --- */}

      {/* Event Modal */}
      {showEventModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowEventModal(false)}>
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center rounded-t-2xl">
                  <h3 className="font-bold text-white text-sm">{editingEvent.id ? 'Edit Event' : t.newEvent}</h3>
                  <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white"><span className="material-icons-round">close</span></button>
               </div>
               <div className="p-4 space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.title}</label>
                     <input 
                        value={editingEvent.title || ''}
                        onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        autoFocus
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Start</label>
                        <input 
                           type="time"
                           value={editingEvent.startTime || '09:00'}
                           onChange={e => setEditingEvent({...editingEvent, startTime: e.target.value})}
                           className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">End</label>
                        <input 
                           type="time"
                           value={editingEvent.endTime || '10:00'}
                           onChange={e => setEditingEvent({...editingEvent, endTime: e.target.value})}
                           className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.type}</label>
                     <div className="flex space-x-2">
                        {['meeting', 'work', 'personal', 'course'].map(type => (
                           <button
                              key={type}
                              onClick={() => setEditingEvent({
                                 ...editingEvent, 
                                 type: type as any, 
                                 color: type === 'meeting' ? 'bg-blue-600' : type === 'work' ? 'bg-emerald-600' : type === 'course' ? 'bg-violet-600' : 'bg-amber-600'
                              })}
                              className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold border ${editingEvent.type === type ? 'bg-white/10 text-white border-white/30' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between rounded-b-2xl">
                  {editingEvent.id && (
                     <button onClick={handleDeleteEvent} className="text-red-400 hover:text-red-300 text-xs font-bold px-2">{t.delete}</button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                     <button onClick={() => setShowEventModal(false)} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs">{t.cancel}</button>
                     <button onClick={handleSaveEvent} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">{t.save}</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowTaskModal(false)}>
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center rounded-t-2xl">
                  <h3 className="font-bold text-white text-sm">{editingTask.id ? 'Edit Task' : t.addTask}</h3>
                  <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white"><span className="material-icons-round">close</span></button>
               </div>
               <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.title}</label>
                     <input 
                        value={editingTask.title || ''}
                        onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                     />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.priority}</label>
                        <select 
                           value={editingTask.priority} 
                           onChange={e => setEditingTask({...editingTask, priority: e.target.value as TaskPriority})}
                           className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                        >
                           <option value="high">{t.priority.high}</option>
                           <option value="medium">{t.priority.medium}</option>
                           <option value="low">{t.priority.low}</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status</label>
                        <select 
                           value={editingTask.status} 
                           onChange={e => setEditingTask({...editingTask, status: e.target.value as TaskStatus, progress: e.target.value === 'done' ? 100 : editingTask.progress})}
                           className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                        >
                           <option value="todo">{t.status.todo}</option>
                           <option value="in-progress">{t.status.inprogress}</option>
                           <option value="done">{t.status.done}</option>
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.progress}: {editingTask.progress}%</label>
                     <input 
                        type="range"
                        min="0" max="100"
                        value={editingTask.progress || 0}
                        onChange={e => setEditingTask({...editingTask, progress: Number(e.target.value)})}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                  </div>

                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.labels.tags}</label>
                     <input 
                        value={Array.isArray(editingTask.tags) ? editingTask.tags.join(', ') : (editingTask.tags as unknown as string || '')}
                        onChange={e => setEditingTask({...editingTask, tags: e.target.value as any})}
                        placeholder="Dev, Urgent, Design..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                     />
                  </div>
               </div>
               <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between rounded-b-2xl">
                  {editingTask.id && (
                     <button onClick={handleDeleteTask} className="text-red-400 hover:text-red-300 text-xs font-bold px-2">{t.delete}</button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                     <button onClick={() => setShowTaskModal(false)} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs">{t.cancel}</button>
                     <button onClick={handleSaveTask} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">{t.save}</button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
