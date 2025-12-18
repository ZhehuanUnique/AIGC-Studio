import React from 'react';
import { ArrowLeft, ExternalLink, Trash2, Lock, Upload, Plus } from 'lucide-react';

// TODO: 你把飞书指南链接发我后，我会替换这里
const FEISHU_GUIDE_URL = '#';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
    <div className="text-sm font-black text-slate-100 mb-3">{title}</div>
    <div className="text-sm text-slate-300 leading-relaxed space-y-2">{children}</div>
  </section>
);

export const GuideApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-[#070b17]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-10" />
      </div>

      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-200 hover:text-white transition-colors">
            <ArrowLeft size={16} className="text-slate-400" />
            返回中控台
          </a>
          <a
            href={FEISHU_GUIDE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-lg text-xs font-black"
            title="打开飞书使用指南"
          >
            <ExternalLink size={14} className="text-sky-400" />
            飞书使用指南
          </a>
        </div>
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-3xl md:text-4xl font-black tracking-tight">使用指南</div>
          <div className="mt-2 text-sm text-slate-400">
            本页是站内“功能速查”。点击右上角可跳转飞书文档做更详细说明（你把链接发我后我会替换）。
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="1）组/成员管理（中控台主页面）">
            <div>- **新增组**：页面底部 “＋” 创建新组（仅需组名/组长名，管理员模式可见）。</div>
            <div>- **编辑组**：解锁后可进入“部门管理”弹窗编辑组信息/任务/进度等。</div>
            <div>- **删除组**：管理员模式下，组标题旁有 <Trash2 size={14} className="inline text-red-400" /> 可删除整组（含成员/任务）。</div>
            <div>- **成员编辑**：点击组长/成员卡片（解锁后）进入编辑弹窗。</div>
          </Section>

          <Section title="2）解锁/权限">
            <div>- 每个组右上角有 <Lock size={14} className="inline text-slate-300" /> UPDATE 按钮：用于解锁组内编辑能力。</div>
            <div>- 管理员模式下可新增组/删组/编辑更多内容。</div>
          </Section>

          <Section title="3）任务体系（小组任务 + 成员任务）">
            <div>- 卡片上的 Pending Tasks 只展示“小组任务（总目标）”。</div>
            <div>- hover 打开“全部任务”后包含两部分：小组任务 + 成员任务（按“职位·姓名”分组）。</div>
            <div>- 成员 hover 会展示该成员的“成员任务”。</div>
            <div className="text-[12px] text-slate-400">注：成员任务目前是效果版（前端内存），如需持久化可继续扩展。</div>
          </Section>

          <Section title="4）封面图 + 账号支出（手机端快速预览）">
            <div>- 封面图已改为 9:16 竖图，并与“账号支出”在手机端左右并排。</div>
            <div>- 封面图可通过 <Upload size={14} className="inline text-slate-300" /> 设置入口上传/调整。</div>
            <div>- 账号支出支持 <Plus size={14} className="inline text-slate-300" /> 添加记录、删除记录，并会更新组的实耗。</div>
          </Section>

          <Section title="5）AI TOOLS 右侧悬浮面板（桌面端）">
            <div>- 右侧有一条“发亮提示线”，鼠标移入后向左展开工具面板。</div>
            <div>- 移动端默认不显示，避免误触。</div>
          </Section>

          <Section title="6）剧查查榜单 / 作品展示（独立页面）">
            <div>- 首页“快捷入口”提供：</div>
            <div className="ml-4">- **剧查查榜单**：跳转到 `/juchacha.html`</div>
            <div className="ml-4">- **作品展示**：跳转到 `/works.html`（卡片 9:16，点击可新标签打开外链）</div>
          </Section>
        </div>
      </main>
    </div>
  );
};


