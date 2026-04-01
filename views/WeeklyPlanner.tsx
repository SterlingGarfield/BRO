import React from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

export const WeeklyPlanner: React.FC<Props> = ({ lang }) => {
  const t = {
    title: lang === 'en' ? 'Weekly Planner' : '周计划表',
    week: lang === 'en' ? 'WEEK' : '周',
    month: lang === 'en' ? 'MONTH' : '月',
    addCourse: lang === 'en' ? 'Add Course' : '添加课程',
    days: {
      mon: lang === 'en' ? 'Monday' : '星期一',
      tue: lang === 'en' ? 'Tuesday' : '星期二',
      wed: lang === 'en' ? 'Wednesday' : '星期三',
      thu: lang === 'en' ? 'Thursday' : '星期四',
      fri: lang === 'en' ? 'Friday' : '星期五',
      today: lang === 'en' ? '(Today)' : '(今天)'
    }
  };

  const days = [
    t.days.mon,
    `${t.days.tue} ${t.days.today}`,
    t.days.wed,
    t.days.thu,
    t.days.fri
  ];

  return (
    <div className="h-full w-full p-6 flex flex-col overflow-hidden">
      <div className="glass h-full w-full rounded-2xl flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
           <div className="flex items-center space-x-4">
             <h3 className="font-bold text-lg text-white">{t.title}</h3>
             <div className="flex bg-black/20 rounded-lg p-1">
               <button className="px-4 py-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 rounded-md">{t.week}</button>
               <button className="px-4 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-300">{t.month}</button>
             </div>
           </div>
           <button className="px-4 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors">
              {t.addCourse}
           </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           <div className="grid grid-cols-[60px_repeat(5,1fr)] min-w-[800px]">
              {/* Header Row */}
              <div className="sticky top-0 z-10 bg-[#0f172a] border-b border-white/10 h-10"></div>
              {days.map((day, i) => (
                <div key={i} className={`sticky top-0 z-10 bg-[#0f172a] border-b border-white/10 h-10 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest ${day.includes(t.days.today) || day.includes('(Today)') ? 'text-blue-400' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}

              {/* Time Slots */}
              {Array.from({ length: 9 }).map((_, i) => {
                const hour = i + 8; // Start at 8 AM
                return (
                  <React.Fragment key={hour}>
                    <div className="h-24 border-r border-white/5 border-b border-white/5 flex items-start justify-end pr-2 pt-2 text-[10px] text-slate-500 font-mono">
                      {hour}:00
                    </div>
                    {/* Day Cells */}
                    {Array.from({ length: 5 }).map((_, d) => (
                      <div key={`${hour}-${d}`} className="h-24 border-r border-white/5 border-b border-white/5 relative p-1 group">
                         {/* Mock Events */}
                         {hour === 8 && d === 0 && (
                            <div className="absolute top-1 left-1 right-1 bottom-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-2 flex flex-col justify-between hover:brightness-110 cursor-pointer">
                              <div><div className="font-bold text-indigo-400 text-xs">Neural Networks</div><div className="text-[10px] text-indigo-300/60">Lab 304</div></div>
                            </div>
                         )}
                         {hour === 10 && d === 2 && (
                            <div className="absolute top-1 left-1 right-1 h-[200%] z-20 bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2 hover:brightness-110 cursor-pointer">
                               <div className="font-bold text-emerald-400 text-xs">Adv. Algorithms</div>
                               <div className="text-[10px] text-emerald-300/60">Main Hall</div>
                            </div>
                         )}
                         {hour === 14 && d === 1 && (
                            <div className="absolute top-1 left-1 right-1 bottom-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-2 border-l-4 border-l-cyan-500 ring-2 ring-cyan-500/20 hover:brightness-110 cursor-pointer flex justify-between">
                               <span className="font-bold text-cyan-400 text-xs">Quantum Computing</span>
                               <span className="text-[8px] bg-cyan-500 text-black font-bold px-1 rounded h-fit">NOW</span>
                            </div>
                         )}
                         {hour === 9 && (d === 1 || d === 3) && (
                            <div className="absolute top-1 left-1 right-1 bottom-1 bg-orange-500/20 border border-orange-500/30 rounded-lg p-2 hover:brightness-110 cursor-pointer">
                               <div className="font-bold text-orange-400 text-xs">Cyber Ethics</div>
                            </div>
                         )}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};