
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

type Role = 'user' | 'system' | 'assistant';
type ModelId = 'chatgpt' | 'gemini' | 'grok';

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

interface AIModel {
  id: ModelId;
  name: string;
  version: string;
  color: string;
  bgColor: string;
  iconColor: string;
  messages: Message[];
  status: 'idle' | 'thinking' | 'streaming' | 'completed';
  isVisible: boolean;
  systemPrompt: string;
  speed: number; // ms per char (lower is faster)
}

export const ParallelInterface: React.FC<Props> = ({ lang }) => {
  const [inputValue, setInputValue] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const scrollRefs = useRef<Record<ModelId, HTMLDivElement | null>>({ chatgpt: null, Gemini: null, grok: null } as any);

  const t = {
    broadcast: lang === 'en' ? 'Broadcast' : '一键并行发送',
    placeholder: lang === 'en' ? 'Broadcast query to all active models...' : '向所有活跃模型广播查询...',
    active: lang === 'en' ? 'Active' : '活跃',
    idle: lang === 'en' ? 'Idle' : '空闲',
    thinking: lang === 'en' ? 'Thinking...' : '思考中...',
    clear: lang === 'en' ? 'Clear Context' : '清除上下文',
    configure: lang === 'en' ? 'Configure Views' : '视图配置',
  };

  // Initial State Setup
  const [models, setModels] = useState<AIModel[]>([
    {
      id: 'chatgpt',
      name: 'CHATGPT',
      version: 'v4.0',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      messages: [{ id: 'sys-1', role: 'system', content: lang === 'en' ? 'Parallel interface initialized. Awaiting user input.' : '并行接口已初始化。等待用户输入。', timestamp: new Date() }],
      status: 'idle',
      isVisible: true,
      systemPrompt: 'You are ChatGPT, helpful and precise.',
      speed: 30
    },
    {
      id: 'gemini',
      name: 'GEMINI',
      version: 'PRO-1.5',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      messages: [{ id: 'sys-2', role: 'system', content: lang === 'en' ? 'Multimodal synchronization established.' : '多模态同步已建立。', timestamp: new Date() }],
      status: 'idle',
      isVisible: true,
      systemPrompt: 'You are Gemini, creative and multimodal.',
      speed: 45
    },
    {
      id: 'grok',
      name: 'GROK',
      version: 'v2.0',
      color: 'bg-white',
      bgColor: 'bg-white/10',
      iconColor: 'text-white',
      messages: [{ id: 'sys-3', role: 'system', content: lang === 'en' ? 'Real-time data streams connected.' : '实时数据流已连接。', timestamp: new Date() }],
      status: 'idle',
      isVisible: true,
      systemPrompt: 'You are Grok, witty and real-time.',
      speed: 20
    }
  ]);

  // Auto-scroll effect
  useEffect(() => {
    models.forEach(model => {
      if (scrollRefs.current[model.id]) {
        scrollRefs.current[model.id]!.scrollTop = scrollRefs.current[model.id]!.scrollHeight;
      }
    });
  }, [models]);

  // Mock Response Generator
  const generateMockResponse = (modelId: ModelId, prompt: string, lang: Language): string => {
    const isZh = lang === 'zh';
    const prefix = isZh 
      ? `[${modelId.toUpperCase()}] 收到: "${prompt}". \n` 
      : `[${modelId.toUpperCase()}] Received: "${prompt}". \n`;

    const lorem = isZh
      ? "这是一个基于模拟数据的自动回复。在实际系统中，这将通过API连接到相应的大模型。该模型正在分析您的输入并生成上下文相关的响应。"
      : "This is a simulated response based on mock data. In a real system, this would connect via API to the respective LLM. The model is analyzing your input and generating a context-aware response.";

    if (modelId === 'chatgpt') return prefix + (isZh ? "根据我的分析，这是一个非常有趣的问题。通常情况下，我们需要考虑多个维度的因素..." : "Based on my analysis, this is an interesting inquiry. Typically, we need to consider factors across multiple dimensions...") + lorem;
    if (modelId === 'gemini') return prefix + (isZh ? "确实如此！如果我们从创意的角度来看，这里有无限的可能性。✨ 让我为您展示几种不同的方案..." : "Absolutely! If we look at this creatively, there are infinite possibilities here. ✨ Let me show you a few different approaches...") + lorem;
    if (modelId === 'grok') return prefix + (isZh ? "实时数据显示这很热门。在此刻，这就是事实。🚀" : "Real-time data shows this is trending. Here's the raw truth right now. 🚀") + lorem;
    return prefix + lorem;
  };

  const handleBroadcast = () => {
    if (!inputValue.trim() || isBroadcasting) return;

    const userMsgContent = inputValue;
    setInputValue('');
    setIsBroadcasting(true);

    const newModels = models.map(m => {
      if (!m.isVisible) return m;
      return {
        ...m,
        status: 'thinking' as const,
        messages: [
          ...m.messages,
          { id: Date.now().toString() + '-user', role: 'user' as const, content: userMsgContent, timestamp: new Date() }
        ]
      };
    });
    setModels(newModels);

    // Simulate Network Delay & Streaming
    setTimeout(() => {
      startStreaming(newModels, userMsgContent);
    }, 600 + Math.random() * 800);
  };

  const startStreaming = (currentModels: AIModel[], prompt: string) => {
    const targets = currentModels.filter(m => m.isVisible).map(m => ({
      id: m.id,
      fullText: generateMockResponse(m.id, prompt, lang),
      currentText: '',
      done: false
    }));

    // Initialize empty assistant messages
    setModels(prev => prev.map(m => {
      if (!m.isVisible) return m;
      return {
        ...m,
        status: 'streaming',
        messages: [...m.messages, { id: Date.now() + '-ai-' + m.id, role: 'assistant', content: '', timestamp: new Date() }]
      };
    }));

    const streamInterval = setInterval(() => {
      let allDone = true;

      targets.forEach(target => {
        if (!target.done) {
          allDone = false;
          // Calculate chunk based on model speed simulation
          const chunkSize = Math.floor(Math.random() * 3) + 1; 
          const remaining = target.fullText.slice(target.currentText.length);
          
          if (remaining.length === 0) {
            target.done = true;
          } else {
            target.currentText += remaining.slice(0, chunkSize);
          }
        }
      });

      setModels(prev => prev.map(m => {
        const target = targets.find(t => t.id === m.id);
        if (!target) return m;
        
        const newMessages = [...m.messages];
        const lastMsgIndex = newMessages.length - 1;
        newMessages[lastMsgIndex] = {
            ...newMessages[lastMsgIndex],
            content: target.currentText
        };

        return {
          ...m,
          status: target.done ? 'completed' : 'streaming',
          messages: newMessages
        };
      }));

      if (allDone) {
        clearInterval(streamInterval);
        setIsBroadcasting(false);
      }
    }, 50);
  };

  const toggleModelVisibility = (id: ModelId) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, isVisible: !m.isVisible } : m));
  };

  const clearHistory = () => {
    setModels(prev => prev.map(m => ({
        ...m,
        messages: m.messages.filter(msg => msg.role === 'system'),
        status: 'idle'
    })));
  };

  // Helper for Message Bubbles
  const MessageBubble: React.FC<{ msg: Message, modelColor: string }> = ({ msg, modelColor }) => {
    if (msg.role === 'system') {
        return (
            <div className="flex flex-col space-y-1 animate-[fadeIn_0.5s]">
                <span className={`text-[9px] font-mono opacity-60 px-1 uppercase ${modelColor.replace('bg-', 'text-').replace('500', '400')}`}>System</span>
                <div className="bg-white/5 rounded-lg p-3 text-xs text-slate-300 leading-relaxed border border-white/5 font-mono">
                    {msg.content}
                </div>
            </div>
        );
    }
    const isUser = msg.role === 'user';
    return (
        <div className={`flex flex-col space-y-1 animate-[fadeIn_0.3s] ${isUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-slate-500 font-mono px-1">{isUser ? 'USER' : 'AI'}</span>
            <div className={`rounded-2xl p-3 text-sm max-w-[90%] leading-relaxed shadow-sm ${
                isUser 
                ? 'bg-[#3b82f6] text-white rounded-tr-sm' 
                : 'bg-[#1e293b] border border-white/10 text-slate-200 rounded-tl-sm'
            }`}>
                {msg.content}
                {msg.content === '' && <span className="inline-block w-1.5 h-3 bg-slate-400 animate-pulse ml-1 align-middle"></span>}
            </div>
        </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-background-dark">
      
      {/* Top Config Bar */}
      <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 shrink-0">
         <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="material-icons-round text-sm">view_column</span>
            <span>AI+ Parallel Pipeline</span>
         </div>
         <div className="flex items-center space-x-3">
             <div className="flex bg-black/20 rounded-lg p-1 space-x-1">
                {models.map(m => (
                    <button
                        key={m.id}
                        onClick={() => toggleModelVisibility(m.id)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all border ${
                            m.isVisible 
                            ? `bg-white/10 text-white border-white/10 shadow-sm` 
                            : 'text-slate-600 border-transparent hover:text-slate-400'
                        }`}
                    >
                        {m.name}
                    </button>
                ))}
             </div>
             <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
             <button onClick={clearHistory} className="text-slate-500 hover:text-red-400 transition-colors" title={t.clear}>
                 <span className="material-icons-round text-sm">delete_sweep</span>
             </button>
         </div>
      </div>

      {/* Main Parallel View */}
      <div className="flex-1 flex gap-4 overflow-hidden p-6 pb-24">
        {models.map(model => {
            if (!model.isVisible) return null;
            return (
                <div key={model.id} className="flex-1 flex flex-col glass rounded-2xl overflow-hidden border border-white/5 shadow-xl transition-all duration-500">
                    {/* Model Header */}
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                        <div className="flex items-center space-x-2.5">
                            <div className={`w-2 h-2 rounded-full ${model.color} shadow-[0_0_8px_currentColor] opacity-80`}></div>
                            <span className="text-xs font-bold tracking-wider text-slate-200">{model.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <span className="text-[9px] font-mono text-slate-500">{model.version}</span>
                             {model.status === 'thinking' && <span className="material-icons-round text-[10px] text-slate-400 animate-spin">refresh</span>}
                             {model.status === 'streaming' && <span className="flex space-x-0.5"><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></span></span>}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div 
                        ref={(el) => { scrollRefs.current[model.id] = el; }}
                        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth"
                    >
                        {model.messages.map(msg => (
                            <MessageBubble key={msg.id} msg={msg} modelColor={model.color} />
                        ))}
                        {/* Empty state filler if needed */}
                        {model.messages.length === 0 && (
                            <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                                {t.idle}
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Unified Input Area (Floating at bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">
        <div className={`glass rounded-2xl p-2 border border-white/10 flex items-center space-x-2 transition-all duration-300 shadow-2xl ${isBroadcasting ? 'ring-2 ring-blue-500/20 bg-[#0f172a]/80' : 'bg-[#0f172a]/60'}`}>
            <button className="p-2.5 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 group">
                <span className="material-icons-round text-xl group-hover:rotate-12 transition-transform">add_circle_outline</span>
            </button>
            <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder-slate-500 py-3 focus:outline-none font-medium" 
                placeholder={t.placeholder} 
                type="text"
                disabled={isBroadcasting}
                autoFocus
            />
            <div className="flex items-center space-x-1 pr-1">
                <button 
                    onClick={handleBroadcast}
                    disabled={!inputValue.trim() || isBroadcasting}
                    className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg ${
                        inputValue.trim() && !isBroadcasting
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <span className="text-[11px] font-bold tracking-tight uppercase">{t.broadcast}</span>
                    {isBroadcasting ? (
                        <span className="material-icons-round text-sm animate-spin">refresh</span>
                    ) : (
                        <span className="material-icons-round text-sm">send</span>
                    )}
                </button>
            </div>
        </div>
        
        {/* Helper Hint */}
        <div className="text-center mt-2 opacity-0 hover:opacity-100 transition-opacity duration-500">
             <span className="text-[10px] text-slate-500 font-mono">Press Enter to broadcast • AI+ Parallel Engine v1.0</span>
        </div>
      </div>

    </div>
  );
};
