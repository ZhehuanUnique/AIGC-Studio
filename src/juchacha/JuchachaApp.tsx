import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, Cog, Copy, RefreshCw, Send, Trash2, User } from 'lucide-react';

type Role = 'system' | 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  ts: number;
};

type AgentResponse = {
  reply: string;
};

const STORAGE_KEY = 'AIGC_JUCHACHA_AGENT_SETTINGS';

type AgentSettings = {
  endpoint: string; // e.g. http://127.0.0.1:8000/v1/chat/completions or /api/agent
  apiKey?: string;
  model?: string;
  // 如果你的本地服务不是 OpenAI 兼容接口，也可以后续扩展 format
};

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function callAgent(settings: AgentSettings, messages: ChatMessage[]): Promise<AgentResponse> {
  // 默认实现：优先兼容 OpenAI chat.completions（本地 LLM 常用）
  // 你也可以把 endpoint 指到你自定义的本地接口，然后我再按你的接口格式适配。
  const endpoint = settings.endpoint?.trim() || '/api/agent';
  const model = settings.model?.trim() || 'local-model';

  const payload = {
    model,
    messages: messages
      .filter(m => m.role !== 'system') // 先不发送 system（可按需启用）
      .map(m => ({ role: m.role, content: m.content })),
    temperature: 0.6,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  // 兼容两种返回：
  // - OpenAI: { choices: [{ message: { content } }]}
  // - 简化: { reply }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `请求失败 (${res.status})`;
    throw new Error(msg);
  }

  const openAIContent = data?.choices?.[0]?.message?.content;
  const reply = typeof openAIContent === 'string' ? openAIContent : (data?.reply || '');
  return { reply };
}

export function JuchachaApp() {
  const [settings, setSettings] = useState<AgentSettings>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { endpoint: '/api/agent', model: 'local-model' };
    try {
      return { endpoint: '/api/agent', model: 'local-model', ...JSON.parse(raw) };
    } catch {
      return { endpoint: '/api/agent', model: 'local-model' };
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>(() => ([
    {
      id: nowId('m'),
      role: 'assistant',
      content: '你好，我是剧查查 Agent。把你的目标/素材/规则发我，我会一步步帮你拆解并生成可执行方案。',
      ts: Date.now(),
    },
  ]));

  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, loading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError('');
    setInput('');

    const userMsg: ChatMessage = { id: nowId('m'), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    setLoading(true);
    try {
      const res = await callAgent(settings, [...messages, userMsg]);
      const assistantMsg: ChatMessage = { id: nowId('m'), role: 'assistant', content: res.reply || '（空回复）', ts: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setError(e?.message || '请求失败');
    } finally {
      setLoading(false);
    }
  }, [input, loading, settings, messages]);

  const handleClear = useCallback(async () => {
    setError('');
    setMessages([{
      id: nowId('m'),
      role: 'assistant',
      content: '已清空。继续把任务发我吧。',
      ts: Date.now(),
    }]);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = messages
      .map(m => `${m.role === 'user' ? '用户' : m.role === 'assistant' ? '助手' : '系统'}：${m.content}`)
      .join('\n\n');
    await navigator.clipboard.writeText(text);
  }, [messages]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-sky-950/20 rounded-[100%] blur-[120px] animate-pulse opacity-30" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <a
              href="/index.html"
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              title="返回中控台"
            >
              <ArrowLeft size={14} />
              返回中控台
            </a>
            <div className="text-sm font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-purple-300">
              剧查查 Agent
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              title="复制全部对话"
            >
              <Copy size={14} /> 复制
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              title="清空对话"
            >
              <Trash2 size={14} /> 清空
            </button>
            <button
              onClick={() => setShowSettings(v => !v)}
              className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
                showSettings
                  ? 'bg-sky-600/20 border-sky-500/30 text-sky-300'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
              }`}
              title="设置"
            >
              <Cog size={14} /> 设置
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-6 rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
            <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <RefreshCw size={14} /> Agent 连接设置
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-xs text-slate-400">
                接口地址（endpoint）
                <input
                  value={settings.endpoint}
                  onChange={(e) => setSettings(s => ({ ...s, endpoint: e.target.value }))}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
                  placeholder="例如：http://127.0.0.1:8000/v1/chat/completions"
                />
              </label>
              <label className="text-xs text-slate-400">
                模型名（model，可选）
                <input
                  value={settings.model || ''}
                  onChange={(e) => setSettings(s => ({ ...s, model: e.target.value }))}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
                  placeholder="例如：qwen2.5"
                />
              </label>
              <label className="text-xs text-slate-400">
                API Key（可选）
                <input
                  value={settings.apiKey || ''}
                  onChange={(e) => setSettings(s => ({ ...s, apiKey: e.target.value }))}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
                  placeholder="可留空"
                />
              </label>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              默认按 <span className="text-sky-400 font-mono">OpenAI Chat Completions</span> 格式请求。
              如果你的本地大模型接口不是这个格式，把接口示例发我，我会改成适配你那套协议。
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-slate-900/30 border border-slate-800 overflow-hidden shadow-2xl">
          <div ref={listRef} className="h-[68vh] overflow-y-auto custom-scrollbar p-4 space-y-3">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
                    isUser
                      ? 'bg-sky-600/10 border-sky-500/20 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {isUser ? <User size={12} className="text-sky-400" /> : <Bot size={12} className="text-purple-400" />}
                      {isUser ? 'You' : 'Agent'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 border bg-slate-950/60 border-slate-800 text-slate-200">
                  <div className="text-xs text-slate-500">Agent 思考中…</div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 border-t border-slate-800 bg-red-900/10 text-red-300 text-xs">
              请求失败：{error}
            </div>
          )}

          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 resize-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500 min-h-[52px] max-h-[120px]"
                placeholder="输入你的需求…（Enter 发送，Shift+Enter 换行）"
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`inline-flex items-center justify-center gap-2 px-4 rounded-xl font-bold text-sm border transition-colors ${
                  canSend
                    ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500/40'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
                title="发送"
              >
                <Send size={16} />
                发送
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              提示：功能还在开发中...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


