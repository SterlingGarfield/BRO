import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Language } from '../../../types';

interface Props {
  lang: Language;
}

export const DiskOverview: React.FC<Props> = ({ lang }) => {
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | undefined>(undefined);

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

  const dataL1 = [
    { name: t.categories.system, value: 120, color: '#2563eb' },
    { name: t.categories.apps, value: 300, color: '#9333ea' },
    { name: t.categories.media, value: 450, color: '#e11d48' },
    { name: t.categories.projects, value: 210, color: '#ea580c' },
    { name: t.categories.other, value: 120, color: '#16a34a' },
  ];

  const dataL2 = [
    // System (120)
    { name: 'usr', value: 60, color: '#3b82f6' },
    { name: 'var', value: 30, color: '#60a5fa' },
    { name: 'opt', value: 20, color: '#93c5fd' },
    { name: 'boot', value: 10, color: '#bfdbfe' },
    // Apps (300)
    { name: 'games', value: 140, color: '#a855f7' },
    { name: 'adobe', value: 90, color: '#c084fc' },
    { name: 'docker', value: 70, color: '#d8b4fe' },
    // Media (450)
    { name: 'movies', value: 250, color: '#f43f5e' },
    { name: 'photos', value: 150, color: '#fb7185' },
    { name: 'music', value: 50, color: '#fda4af' },
    // Projects (210)
    { name: 'work', value: 120, color: '#f97316' },
    { name: 'personal', value: 60, color: '#fb923c' },
    { name: 'archive', value: 30, color: '#fdba74' },
    // Other (120)
    { name: 'downloads', value: 70, color: '#22c55e' },
    { name: 'documents', value: 30, color: '#4ade80' },
    { name: 'temp', value: 20, color: '#86efac' },
  ];

  const dataL3 = [
    // System (120) -> usr(60), var(30), opt(20), boot(10)
    { name: 'bin', value: 30, color: '#60a5fa' }, { name: 'lib', value: 20, color: '#93c5fd' }, { name: 'share', value: 10, color: '#bfdbfe' },
    { name: 'log', value: 15, color: '#93c5fd' }, { name: 'cache', value: 15, color: '#bfdbfe' },
    { name: 'opt/app1', value: 15, color: '#bfdbfe' }, { name: 'opt/app2', value: 5, color: '#dbeafe' },
    { name: 'efi', value: 10, color: '#dbeafe' },
    
    // Apps (300) -> games(140), adobe(90), docker(70)
    { name: 'steam', value: 100, color: '#c084fc' }, { name: 'epic', value: 40, color: '#d8b4fe' },
    { name: 'cc', value: 60, color: '#d8b4fe' }, { name: 'cache', value: 30, color: '#e9d5ff' },
    { name: 'containers', value: 40, color: '#e9d5ff' }, { name: 'images', value: 30, color: '#f3e8ff' },

    // Media (450) -> movies(250), photos(150), music(50)
    { name: '2023', value: 150, color: '#fb7185' }, { name: '2024', value: 100, color: '#fda4af' },
    { name: 'raw', value: 100, color: '#fda4af' }, { name: 'exports', value: 50, color: '#fecdd3' },
    { name: 'flac', value: 40, color: '#fecdd3' }, { name: 'mp3', value: 10, color: '#ffe4e6' },

    // Projects (210) -> work(120), personal(60), archive(30)
    { name: 'client_a', value: 80, color: '#fb923c' }, { name: 'client_b', value: 40, color: '#fdba74' },
    { name: 'blog', value: 40, color: '#fdba74' }, { name: 'tools', value: 20, color: '#fed7aa' },
    { name: 'old', value: 30, color: '#fed7aa' },

    // Other (120) -> downloads(70), documents(30), temp(20)
    { name: 'torrents', value: 50, color: '#4ade80' }, { name: 'zip', value: 20, color: '#86efac' },
    { name: 'pdf', value: 20, color: '#86efac' }, { name: 'word', value: 10, color: '#bbf7d0' },
    { name: 'cache', value: 20, color: '#bbf7d0' },
  ];

  return (
    <div className="h-full w-full grid grid-cols-12 gap-6 p-6 overflow-y-auto custom-scrollbar">
      
      {/* Main Chart Area */}
      <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[480px]">
         {/* Background Center Circle */}
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <div className="bg-[#1e293b] rounded-full w-[170px] h-[170px] shadow-inner flex flex-col justify-center items-center border border-white/5">
             <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{t.totalSpace}</span>
             <span className="text-3xl font-bold text-white leading-tight mt-1">1.2 TB</span>
             <span className="text-[10px] font-mono text-blue-400 mt-1">72% {t.used}</span>
           </div>
         </div>

         {/* Chart Layer (On Top) */}
         <div 
           className="w-full h-[450px] z-10"
           onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setTooltipPos({ x: e.clientX - rect.left + 15, y: e.clientY - rect.top + 15 });
           }}
           onMouseLeave={() => setTooltipPos(undefined)}
         >
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={dataL1}
                 cx="50%"
                 cy="50%"
                 innerRadius={90}
                 outerRadius={135}
                 dataKey="value"
                 stroke="#1e293b"
                 strokeWidth={2}
               >
                 {dataL1.map((entry, index) => (
                   <Cell key={`cell-1-${index}`} fill={entry.color} />
                 ))}
               </Pie>
               <Pie
                 data={dataL2}
                 cx="50%"
                 cy="50%"
                 innerRadius={137}
                 outerRadius={180}
                 dataKey="value"
                 stroke="#1e293b"
                 strokeWidth={2}
               >
                 {dataL2.map((entry, index) => (
                   <Cell key={`cell-2-${index}`} fill={entry.color} />
                 ))}
               </Pie>
               <Pie
                 data={dataL3}
                 cx="50%"
                 cy="50%"
                 innerRadius={182}
                 outerRadius={225}
                 dataKey="value"
                 stroke="#1e293b"
                 strokeWidth={2}
               >
                 {dataL3.map((entry, index) => (
                   <Cell key={`cell-3-${index}`} fill={entry.color} />
                 ))}
               </Pie>
               <Tooltip 
                 position={tooltipPos}
                 isAnimationActive={false}
                 contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', pointerEvents: 'none' }}
                 itemStyle={{ color: '#fff' }}
                 formatter={(value: number) => [`${value} GB`, 'Size']}
               />
             </PieChart>
           </ResponsiveContainer>
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
            {dataL1.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-slate-300">{item.name}</span>
                  <span className="text-xs font-mono text-slate-400">{item.value} GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / 1200) * 100}%`, backgroundColor: item.color }}></div>
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
