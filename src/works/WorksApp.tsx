import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';

type Work = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  cover: string; // 渐变占位 class 或图片 URL（以 "/" 开头）
  url?: string;  // 外链（如抖音/站外播放）
};

const WORKS: Work[] = [
  {
    id: 'w1',
    title: '抖音作品',
    subtitle: '点击跳转播放（站外）',
    tags: ['抖音', '短剧', '展示'],
    cover: '/works/cover.jpeg',
    url: 'https://www.douyin.com/user/MS4wLjABAAAAfX15yXI8fzIIHHF-ayr2yPqL23FWAEtKAxBL8lDLLEdB2cY_9-zBl78i9yj1sGL1?from_tab_name=main&modal_id=7575476335494073600&showSubTab=playlet',
  },
  { id: 'w2', title: 'AI数字人', subtitle: '口播 / 动作模仿', tags: ['数字人', '驱动', '调色'], cover: 'from-orange-500/25 via-rose-500/20 to-purple-500/20' },
  { id: 'w3', title: '分镜预演', subtitle: '风格化镜头', tags: ['分镜', '镜头语言', '节奏'], cover: 'from-cyan-500/20 via-slate-500/10 to-blue-500/20' },
  { id: 'w4', title: '宣发短片', subtitle: '高密度信息表达', tags: ['宣发', '节奏', '包装'], cover: 'from-emerald-500/20 via-teal-500/15 to-sky-500/20' },
  { id: 'w5', title: '视觉实验', subtitle: '材质 / 光影', tags: ['材质', '渲染', '光影'], cover: 'from-fuchsia-500/20 via-slate-500/10 to-indigo-500/20' },
  { id: 'w6', title: '角色展示', subtitle: '设定 / Turnaround', tags: ['角色', '设定', '统一性'], cover: 'from-amber-500/20 via-orange-500/10 to-rose-500/20' },
];

function useRafScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        setProgress(window.scrollY / max);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return progress;
}

export const WorksApp: React.FC = () => {
  const progress = useRafScrollProgress();
  const works = useMemo(() => WORKS, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 背景动态 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-[#070b17]" />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] rounded-[100%] blur-[120px] opacity-30"
          style={{
            background:
              `radial-gradient(closest-side, rgba(56,189,248,0.18), rgba(99,102,241,0.10), rgba(0,0,0,0))`,
            transform: `translateX(-50%) translateY(${Math.round(progress * 60)}px)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-10" />
      </div>

      {/* 顶部栏（不吸顶） */}
      <div className="bg-slate-950/75 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-200 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="text-slate-400" />
            返回中控台
          </a>
          <div className="text-xs font-black tracking-widest text-slate-400 uppercase">Works Showcase</div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-black tracking-widest uppercase">
                <Sparkles size={12} />
                动态作品展示
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500">
                  作品展示
                </span>
              </h1>
              <p className="mt-4 text-slate-400 max-w-2xl text-sm leading-relaxed">
                测试版
              </p>
            </div>

            <div className="w-full md:w-[360px] bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Scroll</div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">{Math.round(progress * 100)}%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="relative pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((w, i) => (
              <div
                key={w.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/25 overflow-hidden shadow-2xl cursor-pointer aspect-[9/16]"
                style={{
                  transform: `translateY(${Math.round(Math.sin((progress * 6 + i) * 0.7) * 6)}px)`,
                }}
                onClick={() => {
                  if (w.url) window.open(w.url, '_blank', 'noopener,noreferrer');
                }}
              >
                {w.cover.startsWith('/') ? (
                  <div className="absolute inset-0">
                    <img src={w.cover} alt={w.title} className="w-full h-full object-cover opacity-90" />
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${w.cover}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="relative p-5 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-slate-300/80 font-black tracking-widest uppercase">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <button
                        type="button"
                        className="w-10 h-10 rounded-xl border border-slate-700 bg-black/30 backdrop-blur grid place-items-center text-slate-100 opacity-0 group-hover:opacity-100 transition-all group-hover:scale-105"
                        title="播放（占位）"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (w.url) window.open(w.url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <Play size={16} />
                      </button>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-white group-hover:text-sky-200 transition-colors">
                      {w.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300/80">{w.subtitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {w.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded-lg bg-black/30 border border-slate-700 text-[10px] font-bold text-slate-200/90"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-sky-500/60 via-emerald-500/50 to-transparent opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 py-10 text-xs text-slate-500">
          测试版
        </div>
      </footer>
    </div>
  );
};


