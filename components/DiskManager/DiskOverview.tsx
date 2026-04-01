import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Language } from '../../types';

interface Props {
  lang: Language;
}

export const DiskOverview: React.FC<Props> = ({ lang }) => {
  const t = {
    totalSpace: lang === 'en' ? 'Total Space' : '总空间',
    used: lang === 'en' ? 'USED' : '已用',
    categoryBreakdown: lang === 'en' ? 'Category Breakdown' : '分类统计',
    analyze: lang === 'en' ? 'Analyze Large Files' : '分析大文件',
    enable: lang === 'en' ? 'Enable' : '开启',
    disable: lang === 'en' ? 'Disable' : '关闭',
    categories: {
      system: lang === 'en' ? 'System' : '系统',
      apps: lang === 'en' ? 'Apps' : '应用',
      media: lang === 'en' ? 'Media' : '媒体',
      projects: lang === 'en' ? 'Projects' : '项目',
      other: lang === 'en' ? 'Other' : '其他',
    }
  };

  const data = [
    { name: t.categories.system, value: 124.5, color: '#3b82f6' },
    { name: t.categories.apps, value: 342.1, color: '#6366f1' },
    { name: t.categories.media, value: 512.8, color: '#a855f7' },
    { name: t.categories.projects, value: 210.3, color: '#10b981' },
    { name: t.categories.other, value: 89.4, color: '#64748b' },
  ];

  return (
    <div className="h-full w-full grid grid-cols-12 gap-6 p-6 overflow-y-auto custom-scrollbar">
      
      {/* Main Chart Area */}
      <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[400px]">
         <ResponsiveContainer width="100%" height={300}>
           <PieChart>
             <Pie
               data={data}
               cx="50%"
               cy="50%"
               innerRadius={100}
               outerRadius={140}
               paddingAngle={5}
               dataKey="value"
               stroke="none"
             >
               {data.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.color} />
               ))}
             </Pie>
             <Tooltip 
               contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
               itemStyle={{ color: '#fff' }}
               formatter={(value: number) => [`${value} GB`]}
             />
           </PieChart>
         </ResponsiveContainer>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
           <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{t.totalSpace}</span>
           <span className="text-3xl font-bold text-white leading-tight">1.8 TB</span>
           <span className="text-[10px] font-mono text-blue-400 mt-1">72% {t.used}</span>
         </div>
      </div>

      {/* Stats Panel */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="glass p-6 rounded-2xl h-full">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center">
            <span className="material-icons-round text-blue-500 mr-2 text-lg">analytics</span>
            {t.categoryBreakdown}
          </h3>
          <div className="space-y-5">
            {data.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-slate-300">{item.name}</span>
                  <span className="text-xs font-mono text-slate-400">{item.value} GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / 600) * 100}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <button className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-xl transition-all border border-blue-500/20 uppercase tracking-widest">
              {t.analyze}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
