import React, { useState } from 'react';
import { Language } from '../../../types';

interface Props {
  lang: Language;
}

interface LogEntry {
  id: string;
  action: 'install' | 'uninstall';
  app: string;
  timestamp: string;
  status: 'success' | 'failed';
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'root' | 'folder' | 'file';
}

interface GraphLink {
  source: string;
  target: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', action: 'install', app: 'Adobe Photoshop 2024', timestamp: '2024-02-22 14:30', status: 'success' },
  { id: '2', action: 'uninstall', app: 'Old Game v1.0', timestamp: '2024-02-21 09:15', status: 'success' },
  { id: '3', action: 'install', app: 'Node.js v20', timestamp: '2024-02-20 18:45', status: 'failed' },
  { id: '4', action: 'install', app: 'VS Code', timestamp: '2024-02-18 10:00', status: 'success' },
];

const MOCK_NODES: GraphNode[] = [
  { id: 'root', x: 400, y: 50, label: 'D:/', type: 'root' },
  { id: 'apps', x: 200, y: 150, label: 'Apps', type: 'folder' },
  { id: 'projects', x: 600, y: 150, label: 'Projects', type: 'folder' },
  { id: 'ps', x: 100, y: 250, label: 'Photoshop', type: 'file' },
  { id: 'vscode', x: 300, y: 250, label: 'VS Code', type: 'file' },
  { id: 'web', x: 500, y: 250, label: 'Web Assets', type: 'file' },
  { id: 'ai', x: 700, y: 250, label: 'AI Models', type: 'file' },
];

const MOCK_LINKS: GraphLink[] = [
  { source: 'root', target: 'apps' },
  { source: 'root', target: 'projects' },
  { source: 'apps', target: 'ps' },
  { source: 'apps', target: 'vscode' },
  { source: 'projects', target: 'web' },
  { source: 'projects', target: 'ai' },
];

export const DiskLogs: React.FC<Props> = ({ lang }) => {
  const t = {
    title: lang === 'en' ? 'System Logs' : '系统日志',
    graph: lang === 'en' ? 'Structure Graph' : '结构网络图',
    action: lang === 'en' ? 'Action' : '操作',
    app: lang === 'en' ? 'Application' : '应用',
    time: lang === 'en' ? 'Time' : '时间',
    status: lang === 'en' ? 'Status' : '状态',
    export: lang === 'en' ? 'Export CSV' : '导出 CSV',
  };

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      
      {/* Top Section: Graph */}
      <div className="h-[300px] glass rounded-2xl p-4 relative overflow-hidden border border-white/5">
        <h3 className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest z-10">{t.graph}</h3>
        <svg className="w-full h-full">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
            </marker>
          </defs>
          {MOCK_LINKS.map((link, i) => {
            const source = MOCK_NODES.find(n => n.id === link.source)!;
            const target = MOCK_NODES.find(n => n.id === link.target)!;
            return (
              <line 
                key={i}
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke="#334155"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
            );
          })}
          {MOCK_NODES.map(node => (
            <g 
              key={node.id} 
              onClick={() => setSelectedNode(node.id)}
              className="cursor-pointer transition-all hover:opacity-80"
            >
              <circle 
                cx={node.x} cy={node.y} 
                r={node.type === 'root' ? 20 : 15} 
                fill={selectedNode === node.id ? '#3b82f6' : node.type === 'root' ? '#6366f1' : node.type === 'folder' ? '#f59e0b' : '#10b981'}
                stroke="#1e293b"
                strokeWidth="4"
              />
              <text 
                x={node.x} y={node.y + 30} 
                textAnchor="middle" 
                fill="#94a3b8" 
                fontSize="10"
                className="font-mono"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom Section: Logs */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t.title}</h3>
          <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-bold flex items-center transition-colors">
            <span className="material-icons-round text-sm mr-1">download</span>
            {t.export}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/20 text-xs uppercase text-slate-500 font-bold sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-3 pl-6">{t.time}</th>
                <th className="p-3">{t.action}</th>
                <th className="p-3">{t.app}</th>
                <th className="p-3 text-right pr-6">{t.status}</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300 divide-y divide-white/5 font-mono">
              {MOCK_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 pl-6 text-slate-500">{log.timestamp}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      log.action === 'install' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-sans font-bold text-white">{log.app}</td>
                  <td className="p-3 text-right pr-6">
                    <span className={`flex items-center justify-end ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="material-icons-round text-sm mr-1">{log.status === 'success' ? 'check_circle' : 'error'}</span>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
