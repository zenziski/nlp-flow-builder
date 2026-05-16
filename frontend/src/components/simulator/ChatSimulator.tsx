import { useEffect, useRef, useState } from 'react';
import { Send, RotateCcw, Terminal, Variable, MessageSquare } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import Button from '../ui/Button';

interface Props { botId: string; flowId: string; }

type Tab = 'chat' | 'logs' | 'context';

export default function ChatSimulator({ botId, flowId }: Props) {
  const [tab, setTab] = useState<Tab>('chat');
  const [input, setInput] = useState('');
  const {
    messages, logs, contextSnapshot, activeNodeId, isConnected, isTyping, isActive, connectionError,
    connect, startSession, sendMessage, resetSession, clearLogs,
  } = useSimulatorStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connect();
    return () => {};
  }, []);

  useEffect(() => {
    if (isConnected && botId && flowId) {
      startSession(botId, flowId);
    }
  }, [isConnected, botId, flowId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || !isActive) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleReset = () => {
    resetSession(botId, flowId);
    clearLogs();
  };

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'context', label: 'Context', icon: Variable },
  ];

  return (
    <div className="flow-editor-pane flow-editor-simulator w-80 border-l flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-[#e8d4c8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#0f766e]' : connectionError ? 'bg-[#b9382f]' : 'bg-[#b4998b]'}`} />
          <span className="text-xs font-semibold text-[#5f4340]">Simulator</span>
          {!isConnected && !connectionError && <span className="text-xs text-[#9a7c6d]">connecting…</span>}
          {connectionError && <span className="text-xs text-[#b9382f]">disconnected</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} title="Reset session">
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex border-b border-[#e8d4c8]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              tab === id ? 'text-[#32272c] border-b-2 border-[#ef6c3e]' : 'text-[#8f6f60] hover:text-[#5f4340]'
            }`}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#ef6c3e] text-white rounded-tr-sm'
                      : 'bg-[#fff1e6] text-[#3b2f36] border border-[#e4d0c2] rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#fff1e6] border border-[#e4d0c2] px-3 py-2 rounded-xl rounded-tl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-[#c69c86] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-[#e8d4c8] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isActive ? 'Type a message…' : 'Start a session first'}
              disabled={!isActive}
              className="flex-1 px-3 py-2 rounded-lg text-xs disabled:opacity-50"
            />
            <Button size="sm" onClick={handleSend} disabled={!isActive || !input.trim()}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}

      {tab === 'logs' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono">
          {logs.length === 0 ? (
            <p className="text-[#9a7c6d] text-xs text-center mt-4">No logs yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-xs bg-[#fffdfb] border border-[#e4d0c2] rounded p-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#b24d2a]">{log.nodeType}</span>
                  <span className="text-[#9a7c6d]">{log.durationMs}ms</span>
                </div>
                <p className="text-[#9a7c6d] text-xs truncate font-mono">{log.nodeId}</p>
                {log.output && <p className="text-[#5f4340] text-xs">{log.output}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'context' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#8a695b] mb-1">Variables</p>
            <pre className="text-xs text-[#5f4340] bg-[#fffdfb] border border-[#e4d0c2] rounded p-2 overflow-auto">
              {JSON.stringify(contextSnapshot.variables, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8a695b] mb-1">Context</p>
            <pre className="text-xs text-[#5f4340] bg-[#fffdfb] border border-[#e4d0c2] rounded p-2 overflow-auto">
              {JSON.stringify(contextSnapshot.context, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
