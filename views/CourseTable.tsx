
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

// --- Types ---
interface Period {
  id: number;
  startTime: string;
  endTime: string;
}

interface Course {
  id: string;
  name: string;
  location: string;
  teacher: string;
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  startPeriod: number; // 1 - 12
  duration: number;
  weeks: number[]; // Array of week numbers this course is active
  color: string;
  isHighlight: boolean;
  note?: string; // For exam notes, homework, etc.
  credits: number;
}

interface Semester {
  id: string;
  name: string;
  isCurrent: boolean;
}

// --- Default Data (Updated to specific requirements) ---
// Duration: 45mins
// P1: 08:00 - 08:45
// P2: 08:55 - 09:40 (10m gap)
// P3: 10:00 - 10:45 (20m gap P2-P3)
// P4: 10:55 - 11:40 (10m gap)
// P5: 14:00 - 14:45 (140m gap P4-P5 Lunch)
// P6: 14:55 - 15:40 (10m gap)
// P7: 16:00 - 16:45 (20m gap P6-P7)
// P8: 16:55 - 17:40 (10m gap)
// P9: 19:00 - 19:45 (80m gap P8-P9 Dinner)
// P10: 19:55 - 20:40 (10m gap, ends at 20:40)
const DEFAULT_PERIODS: Period[] = [
  { id: 1, startTime: '08:00', endTime: '08:45' },
  { id: 2, startTime: '08:55', endTime: '09:40' },
  { id: 3, startTime: '10:00', endTime: '10:45' }, // 20m break
  { id: 4, startTime: '10:55', endTime: '11:40' },
  { id: 5, startTime: '14:00', endTime: '14:45' }, // 140m break (Lunch)
  { id: 6, startTime: '14:55', endTime: '15:40' },
  { id: 7, startTime: '16:00', endTime: '16:45' }, // 20m break
  { id: 8, startTime: '16:55', endTime: '17:40' },
  { id: 9, startTime: '19:00', endTime: '19:45' }, // 80m break (Dinner)
  { id: 10, startTime: '19:55', endTime: '20:40' },
  { id: 11, startTime: '20:50', endTime: '21:35' }, // Extrapolated
  { id: 12, startTime: '21:45', endTime: '22:30' }  // Extrapolated
];

const MOCK_SEMESTERS: Semester[] = [
  { id: '2024-fall', name: '2024-2025 Fall Semester', isCurrent: true },
  { id: '2024-spring', name: '2023-2024 Spring Semester', isCurrent: false },
];

const INITIAL_COURSES: Course[] = [
  { id: 'c1', name: 'Advanced AI Algorithms', location: 'Tech Bldg 304', teacher: 'Dr. Sarah', dayOfWeek: 1, startPeriod: 1, duration: 2, weeks: [1,2,3,4,5,6,7,8,9,10,11,12], color: 'bg-blue-600', isHighlight: true, note: 'Midterm on Week 8', credits: 4 },
  { id: 'c2', name: 'Cyber Ethics', location: 'Lib Hall A', teacher: 'Prof. Chen', dayOfWeek: 1, startPeriod: 5, duration: 2, weeks: [1,3,5,7,9,11], color: 'bg-emerald-600', isHighlight: false, credits: 2 },
  { id: 'c3', name: 'Quantum Computing', location: 'Lab 101', teacher: 'Dr. Alan', dayOfWeek: 2, startPeriod: 3, duration: 3, weeks: [1,2,3,4,5,6,7,8], color: 'bg-purple-600', isHighlight: true, note: 'Project due Friday', credits: 5 },
  { id: 'c4', name: 'Visual Design', location: 'Art Studio', teacher: 'Ms. Lin', dayOfWeek: 3, startPeriod: 7, duration: 2, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], color: 'bg-pink-600', isHighlight: false, credits: 3 },
  { id: 'c5', name: 'Data Structures', location: 'Main Bldg 202', teacher: 'Prof. Wu', dayOfWeek: 4, startPeriod: 1, duration: 2, weeks: [1,2,3,4,5,6,7,8,9,10,11,12], color: 'bg-orange-600', isHighlight: false, credits: 4 },
  { id: 'c6', name: 'System Arch', location: 'Online', teacher: 'Dr. K', dayOfWeek: 5, startPeriod: 3, duration: 2, weeks: [2,4,6,8,10,12], color: 'bg-indigo-600', isHighlight: true, note: 'test', credits: 2 },
];

export const CourseTable: React.FC<Props> = ({ lang }) => {
  // --- State ---
  const [currentSemester, setCurrentSemester] = useState(MOCK_SEMESTERS[0].id);
  const [currentWeek, setCurrentWeek] = useState(6); // Mock current week
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [periods, setPeriods] = useState<Period[]>(DEFAULT_PERIODS);
  const [isImporting, setIsImporting] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showWeekend, setShowWeekend] = useState(true);
  
  // Time Config State
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(22);
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false);
  
  // State Awareness
  const [nextClassStatus, setNextClassStatus] = useState<string>('');

  // Translations
  const t = {
    title: lang === 'en' ? 'Course Schedule' : '教务课程表',
    import: lang === 'en' ? 'Import from System' : '教务系统导入',
    importing: lang === 'en' ? 'Syncing...' : '正在同步...',
    semesters: lang === 'en' ? 'Semesters' : '学期',
    week: lang === 'en' ? 'Week' : '第',
    weekSuffix: lang === 'en' ? '' : '周',
    sync: lang === 'en' ? 'Sync to Calendar' : '同步至日程',
    weekend: lang === 'en' ? 'Weekend' : '周末',
    
    // Time Settings
    timeSettings: lang === 'en' ? 'Schedule Settings' : '课程表设置',
    viewRange: lang === 'en' ? 'View Range' : '视图范围',
    startTime: lang === 'en' ? 'Start' : '开始',
    endTime: lang === 'en' ? 'End' : '结束',
    editPeriods: lang === 'en' ? 'Edit Period Times' : '修改课程节次时间',
    period: lang === 'en' ? 'Period' : '第 X 节',
    
    // Panel
    details: lang === 'en' ? 'Course Details' : '课程详情',
    highlight: lang === 'en' ? 'Highlight Course' : '高亮显示',
    notePlaceholder: lang === 'en' ? 'Add notes (e.g. Exam date)...' : '添加备注 (如: 考试日期)...',
    save: lang === 'en' ? 'Save Changes' : '保存更改',
    teacher: lang === 'en' ? 'Teacher' : '教师',
    location: lang === 'en' ? 'Location' : '地点',
    credits: lang === 'en' ? 'Credits' : '学分',
    weeks: lang === 'en' ? 'Weeks' : '周次',

    days: [
      lang === 'en' ? 'Mon' : '周一',
      lang === 'en' ? 'Tue' : '周二',
      lang === 'en' ? 'Wed' : '周三',
      lang === 'en' ? 'Thu' : '周四',
      lang === 'en' ? 'Fri' : '周五',
      lang === 'en' ? 'Sat' : '周六',
      lang === 'en' ? 'Sun' : '周日',
    ]
  };

  // --- Logic ---

  // 1. Calculate Visible Periods (Filter by Start Hour of the period)
  const visiblePeriods = useMemo(() => {
    return periods.filter(p => {
      const hour = parseInt(p.startTime.split(':')[0]);
      return hour >= startHour && hour <= endHour;
    });
  }, [startHour, endHour, periods]);

  // Helper: Compare current time string "HH:MM" with period time
  const isTimeAfter = (time1: string, time2: string) => {
      // time1 > time2 ?
      const [h1, m1] = time1.split(':').map(Number);
      const [h2, m2] = time2.split(':').map(Number);
      return h1 > h2 || (h1 === h2 && m1 > m2);
  };

  // 2. Calculate Next Class (State Awareness)
  useEffect(() => {
    // Mocking "Now" as Monday, 09:30 for demo purposes. 
    
    const mockNowDay = 1; // Monday
    const mockTime = "09:30"; 

    const todayCourses = courses.filter(c => c.dayOfWeek === mockNowDay && c.weeks.includes(currentWeek));
    
    // Find current class
    const current = todayCourses.find(c => {
        const pStart = periods.find(p => p.id === c.startPeriod);
        const pEnd = periods.find(p => p.id === c.startPeriod + c.duration - 1);
        if (!pStart || !pEnd) return false;
        
        // Check if mockTime is between start and end
        return !isTimeAfter(pStart.startTime, mockTime) && isTimeAfter(pEnd.endTime, mockTime);
    });

    // Find next class
    const next = todayCourses
      .sort((a, b) => a.startPeriod - b.startPeriod)
      .find(c => {
          const pStart = periods.find(p => p.id === c.startPeriod);
          return pStart && isTimeAfter(pStart.startTime, mockTime);
      });

    if (current) {
        setNextClassStatus(lang === 'en' ? `In Class: ${current.name} (${current.location})` : `上课中: ${current.name} @ ${current.location}`);
    } else if (next) {
        const pStart = periods.find(p => p.id === next.startPeriod);
        const timeStr = pStart ? pStart.startTime : '';
        setNextClassStatus(lang === 'en' ? `Next: ${next.name} at ${timeStr}` : `下节课: ${next.name} (${timeStr})`);
    } else {
        setNextClassStatus(lang === 'en' ? 'No more classes today' : '今日课程已结束');
    }
  }, [courses, currentWeek, lang, periods]);

  // 3. Import Simulation
  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      const newCourse: Course = {
        id: 'c_new_' + Date.now(),
        name: lang === 'en' ? 'Machine Learning' : '机器学习基础',
        location: 'Sci Bldg 404',
        teacher: 'Dr. Ng',
        dayOfWeek: 3,
        startPeriod: 5,
        duration: 3,
        weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        color: 'bg-cyan-600',
        isHighlight: false,
        credits: 3
      };
      setCourses(prev => [...prev, newCourse]);
      setIsImporting(false);
    }, 1500);
  };

  // 4. Sync Simulation
  const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
  };

  // 5. Update Course Details
  const handleUpdateCourse = (updated: Course) => {
      // Update global list
      setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
      // Update local selection to reflect changes in input fields
      setSelectedCourse(updated);
  };

  // 6. Update Period Time
  const handlePeriodUpdate = (id: number, field: 'startTime' | 'endTime', value: string) => {
      setPeriods(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Helper to get grid row start/span (Adjusted for visiblePeriods offset)
  const getPositionStyle = (course: Course) => {
    if (visiblePeriods.length === 0) return { display: 'none' };
    
    const firstId = visiblePeriods[0].id;
    // Simple check if course is completely outside range
    if (course.startPeriod < firstId && (course.startPeriod + course.duration <= firstId)) {
        return { display: 'none' };
    }

    // Calculate relative position based on the first visible period ID
    // 64px is height (60px) + gap (4px)
    const top = (course.startPeriod - firstId) * 64; 
    const height = course.duration * 64 - 4; // Subtract gap
    
    return { top: `${top}px`, height: `${height}px` };
  };

  // Filter courses that are relevant to current visible periods
  const isCourseVisible = (c: Course) => {
      if (visiblePeriods.length === 0) return false;
      const start = visiblePeriods[0].id;
      const end = visiblePeriods[visiblePeriods.length - 1].id;
      // Show if it overlaps with the visible range
      const courseEnd = c.startPeriod + c.duration - 1;
      return (c.startPeriod >= start && c.startPeriod <= end) || (courseEnd >= start && courseEnd <= end) || (c.startPeriod < start && courseEnd > end);
  };

  // Derived Grid configuration
  const visibleDaysCount = showWeekend ? 7 : 5;
  const visibleDayIndices = showWeekend ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background-dark">
      
      {/* 1. Header & State Awareness */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0 z-20">
        <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-2 text-white">
              <span className="material-icons-round text-indigo-400">school</span>
              <h1 className="font-bold text-lg">{t.title}</h1>
           </div>
           
           {/* State Awareness Widget */}
           <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full animate-[fadeIn_0.5s]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-mono font-medium text-blue-200">{nextClassStatus}</span>
           </div>
        </div>

        <div className="flex items-center space-x-3">
           {/* Semester Selector */}
           <select 
              value={currentSemester}
              onChange={(e) => setCurrentSemester(e.target.value)}
              className="bg-slate-900 text-xs text-slate-200 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 hidden sm:block"
           >
              {MOCK_SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
           </select>

           {/* Week Selector */}
           <div className="flex items-center bg-black/20 rounded-lg border border-white/10 px-2 py-1">
              <button onClick={() => setCurrentWeek(w => Math.max(1, w - 1))} className="text-slate-400 hover:text-white"><span className="material-icons-round text-sm">chevron_left</span></button>
              <span className="text-xs font-mono text-white mx-2 w-16 text-center">{t.week} {currentWeek} {t.weekSuffix}</span>
              <button onClick={() => setCurrentWeek(w => Math.min(20, w + 1))} className="text-slate-400 hover:text-white"><span className="material-icons-round text-sm">chevron_right</span></button>
           </div>
           
           {/* Weekend Toggle */}
           <button 
              onClick={() => setShowWeekend(!showWeekend)}
              className={`p-1.5 rounded-lg transition-colors border border-transparent ${showWeekend ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title={t.weekend}
           >
              <span className="material-icons-round text-lg">weekend</span>
           </button>

           {/* Import Button */}
           <button 
              onClick={handleImport}
              disabled={isImporting}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 flex items-center space-x-1 transition-all"
           >
              {isImporting ? <span className="material-icons-round text-sm animate-spin">refresh</span> : <span className="material-icons-round text-sm">cloud_download</span>}
              <span className="hidden sm:inline">{isImporting ? t.importing : t.import}</span>
           </button>
           
           {/* Immersive/Maximize Button */}
           <button 
              onClick={() => setImmersiveMode(!immersiveMode)}
              className={`p-2 rounded-lg transition-all duration-200 border ${immersiveMode ? 'bg-white/10 text-white border-white/20 shadow-inner' : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'}`}
              title={immersiveMode ? "Restore Side Panel" : "Maximize Schedule"}
           >
              <span className="material-icons-round text-xl">{immersiveMode ? 'fullscreen_exit' : 'crop_free'}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 2. Main Schedule Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar relative flex flex-col transition-all duration-300">
           {/* Days Header */}
           <div 
              className="grid bg-background-dark sticky top-0 z-10 border-b border-white/10"
              style={{ gridTemplateColumns: `50px repeat(${visibleDaysCount}, 1fr)` }}
           >
              {/* Corner / Time Settings Toggle */}
              <div 
                 className="h-10 border-r border-white/10 bg-background-dark flex items-center justify-center relative"
              >
                 <button 
                    onClick={() => setIsTimeEditModalOpen(true)}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-slate-500 hover:text-white"
                    title={t.timeSettings}
                 >
                    <span className="material-icons-round text-sm">tune</span>
                 </button>
              </div>

              {t.days.slice(0, visibleDaysCount).map((day, i) => (
                 <div key={i} className="h-10 flex flex-col items-center justify-center border-r border-white/5 bg-background-dark">
                    <span className="text-xs font-bold text-slate-300 uppercase">{day}</span>
                 </div>
              ))}
           </div>

           <div className="flex relative min-w-[800px]">
              {/* Time Column */}
              <div className="w-[50px] shrink-0 bg-background-dark/50 sticky left-0 z-10 border-r border-white/10 flex flex-col">
                 {visiblePeriods.length > 0 ? visiblePeriods.map((p, i) => (
                    <div key={p.id} className="h-16 border-b border-white/5 flex flex-col items-center justify-center text-[9px] text-slate-500 font-mono">
                       <span className="font-bold text-slate-400">{p.id}</span>
                       <span className="opacity-70 mt-0.5">{p.startTime}</span>
                       <span className="opacity-40">{p.endTime}</span>
                    </div>
                 )) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-[10px] py-4">No Time</div>
                 )}
              </div>

              {/* Course Columns */}
              <div className={`grid flex-1 ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'}`}>
                 {visibleDayIndices.map(dayNum => (
                    <div key={dayNum} className="relative border-r border-white/5 min-h-[768px] bg-white/[0.01]">
                       {/* Grid Lines for reference */}
                       {visiblePeriods.map(p => (
                          <div key={`line-${dayNum}-${p.id}`} className="h-16 border-b border-white/5"></div>
                       ))}

                       {/* Render Courses for this Day */}
                       {courses
                          .filter(c => c.dayOfWeek === dayNum && c.weeks.includes(currentWeek) && isCourseVisible(c))
                          .map(course => (
                             <div 
                                key={course.id}
                                onClick={() => { setSelectedCourse(course); setImmersiveMode(false); }}
                                style={getPositionStyle(course)}
                                className={`absolute left-1 right-1 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:brightness-110 hover:shadow-lg flex flex-col overflow-hidden
                                   ${course.color} ${course.isHighlight ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)] z-20' : 'opacity-90'}
                                   ${selectedCourse?.id === course.id ? 'ring-2 ring-white scale-[1.02] z-20' : ''}
                                `}
                             >
                                <div className="flex justify-between items-start mb-1">
                                   <span className="text-[11px] font-bold text-white leading-tight line-clamp-2">{course.name}</span>
                                   {course.isHighlight && <span className="material-icons-round text-[10px] text-yellow-300">star</span>}
                                </div>
                                
                                <div className="space-y-0.5 mb-1">
                                   <div className="flex items-center text-[9px] text-white/80">
                                      <span className="material-icons-round text-[10px] mr-1">location_on</span>
                                      <span className="truncate">{course.location}</span>
                                   </div>
                                   <div className="flex items-center text-[9px] text-white/80">
                                      <span className="material-icons-round text-[10px] mr-1">person</span>
                                      <span className="truncate">{course.teacher}</span>
                                   </div>
                                </div>

                                {/* Note Section Visualization */}
                                {course.note && (
                                    <div className="mt-auto pt-1.5 border-t border-white/20">
                                        <div className="bg-black/20 rounded px-1.5 py-1">
                                            <p className="text-[9px] text-white/90 truncate leading-tight italic">{course.note}</p>
                                        </div>
                                    </div>
                                )}
                             </div>
                          ))
                       }
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 3. Details Panel (Collapsible) - Solid Opaque Background */}
        <div className={`bg-background-dark border-l border-white/10 shrink-0 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${immersiveMode || !selectedCourse ? 'w-0 opacity-0 border-l-0' : 'w-80 opacity-100'}`}>
            {selectedCourse && (
               <>
                  <div className="p-6 border-b border-white/10 flex justify-between items-center min-w-[320px]">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.details}</h3>
                     <button onClick={() => setSelectedCourse(null)} className="text-slate-400 hover:text-white">
                        <span className="material-icons-round">close</span>
                     </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 min-w-[320px]">
                     {/* Header Card */}
                     <div className={`p-4 rounded-xl ${selectedCourse.color} shadow-lg text-white`}>
                        <h2 className="text-lg font-bold mb-1">{selectedCourse.name}</h2>
                        <div className="text-xs opacity-90 font-mono mb-3">{selectedCourse.id}</div>
                        <div className="flex flex-wrap gap-2">
                           <span className="bg-black/20 px-2 py-1 rounded text-[10px] font-bold backdrop-blur-sm">{selectedCourse.credits} {t.credits}</span>
                           <span className="bg-black/20 px-2 py-1 rounded text-[10px] font-bold backdrop-blur-sm">{t.weeks}: {selectedCourse.weeks[0]}-{selectedCourse.weeks[selectedCourse.weeks.length-1]}</span>
                        </div>
                     </div>

                     {/* Highlight Toggle */}
                     <div 
                        onClick={() => handleUpdateCourse({...selectedCourse, isHighlight: !selectedCourse.isHighlight})}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedCourse.isHighlight ? 'bg-white/10 border-white/20 shadow-sm' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                     >
                        <div className="flex items-center space-x-3">
                           <span className={`material-icons-round ${selectedCourse.isHighlight ? 'text-yellow-400' : 'text-slate-400'}`}>
                              {selectedCourse.isHighlight ? 'star' : 'star_border'}
                           </span>
                           <span className={`text-xs font-bold ${selectedCourse.isHighlight ? 'text-white' : 'text-slate-300'}`}>{t.highlight}</span>
                        </div>
                        
                        {/* Custom Toggle Switch */}
                        <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${selectedCourse.isHighlight ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm`} style={{ left: selectedCourse.isHighlight ? 'calc(100% - 20px)' : '4px' }}></div>
                        </div>
                     </div>

                     {/* Info List */}
                     <div className="space-y-4">
                        <div>
                           <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.teacher}</label>
                           <input 
                              type="text"
                              value={selectedCourse.teacher}
                              onChange={(e) => handleUpdateCourse({...selectedCourse, teacher: e.target.value})}
                              className="w-full text-sm text-slate-200 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{t.location}</label>
                           <input
                              type="text" 
                              value={selectedCourse.location}
                              onChange={(e) => handleUpdateCourse({...selectedCourse, location: e.target.value})}
                              className="w-full text-sm text-slate-200 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors"
                           />
                        </div>
                        
                        {/* Notes Input */}
                        <div>
                           <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Notes / Exams</label>
                           <textarea 
                              value={selectedCourse.note || ''}
                              onChange={(e) => handleUpdateCourse({...selectedCourse, note: e.target.value})}
                              placeholder={t.notePlaceholder}
                              className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all placeholder-slate-600"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Sync Action */}
                  <div className="p-6 border-t border-white/10 bg-white/5 min-w-[320px]">
                     <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
                     >
                        {isSyncing ? <span className="material-icons-round text-sm animate-spin">refresh</span> : <span className="material-icons-round text-sm">event_available</span>}
                        <span>{isSyncing ? t.importing : t.sync}</span>
                     </button>
                     <p className="text-[10px] text-center text-slate-500 mt-2">Syncs details & notes to Calendar module</p>
                  </div>
               </>
            )}
        </div>
      </div>

      {/* 4. Edit Time Modal - Updated Style: Opaque + Glass Effect (like Hub) */}
      {isTimeEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
             <div className="glass-panel bg-background-dark/95 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                   <h3 className="font-bold text-white text-sm uppercase tracking-wider">{t.timeSettings}</h3>
                   <button onClick={() => setIsTimeEditModalOpen(false)} className="text-slate-400 hover:text-white"><span className="material-icons-round">close</span></button>
                </div>
                
                {/* Embedded View Filters */}
                <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/5 bg-white/[0.02] shrink-0">
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">{t.viewRange} - {t.startTime}</label>
                        <select 
                            value={startHour} 
                            onChange={(e) => setStartHour(Number(e.target.value))}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                            {Array.from({length: 8}, (_, i) => i + 6).map(h => (
                                <option key={h} value={h}>{h}:00</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">{t.viewRange} - {t.endTime}</label>
                        <select 
                            value={endHour} 
                            onChange={(e) => setEndHour(Number(e.target.value))}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                            {Array.from({length: 12}, (_, i) => i + 12).map(h => (
                                <option key={h} value={h}>{h}:00</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-[50px_1fr_1fr] gap-2 p-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center sticky top-0 bg-background-dark z-10 border-b border-white/5">
                        <div>{t.period.replace('X', '#')}</div>
                        <div>{t.startTime}</div>
                        <div>{t.endTime}</div>
                    </div>
                    {periods.map((p) => (
                        <div key={p.id} className="grid grid-cols-[50px_1fr_1fr] gap-3 items-center p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="text-center font-bold text-slate-300 text-sm">{p.id}</div>
                            <input 
                                type="time"
                                value={p.startTime}
                                onChange={(e) => handlePeriodUpdate(p.id, 'startTime', e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                            />
                            <input 
                                type="time"
                                value={p.endTime}
                                onChange={(e) => handlePeriodUpdate(p.id, 'endTime', e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                            />
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5 shrink-0 flex justify-end">
                    <button 
                       onClick={() => setIsTimeEditModalOpen(false)}
                       className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all"
                    >
                       {t.save}
                    </button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};
