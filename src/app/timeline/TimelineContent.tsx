"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, X, Save, Trash2, Pencil, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import { useContentEditor } from "@/hooks/useContentEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";
// ── 数据类型 ─────────────────────────────────────────────
interface LifeEvent { date: string; title: string; body: string; }
interface TimelineEntry { slug: string; title: string; date: string; year: string; tags: string[]; body: string; events?: LifeEvent[]; }
interface TimelineContentProps { entries: TimelineEntry[]; }

// ── Markdown 覆写 ────────────────────────────────────────
const timelineOverrides = {
  h1: () => null,
  h2: ({ children }: any) => <h2 className="text-base font-semibold mt-6 mb-2 text-ink-800 dark:text-ink-200">{children}</h2>,
  p: ({ children }: any) => <p className="text-sm leading-[1.8] text-ink-600 dark:text-ink-400 mb-3 last:mb-0">{children}</p>,
};

const emptyForm = { year: new Date().getFullYear().toString(), title: "", tags: "", body: "" };
const emptyEvent = { date: "", title: "", body: "" };

// ── 组件 ─────────────────────────────────────────────────
export default function TimelineContent({ entries }: TimelineContentProps) {
  const { isEditing } = useEditMode();
  const { save, remove } = useContentEditor();

  // ★ 移除 useSearchParams() —— 它在客户端导航时导致组件 suspend → 白屏
  // 改用 isEditing（来自 EditProvider 全局状态）控制编辑功能
  const editMode = isEditing;

  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [drawerEntry, setDrawerEntry] = useState<TimelineEntry | null>(null);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [editingEventIdx, setEditingEventIdx] = useState<number | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // ── 打开新建弹窗 ──────────────────────────────────────
  const openCreate = () => { setEditingEntry(null); setForm(emptyForm); setShowModal(true); };

  // ── 打开编辑弹窗 ──────────────────────────────────────
  const openEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setForm({ year: entry.year, title: entry.title, tags: entry.tags.join(", "), body: entry.body.replace(/^# .+\n\n/, "") });
    setShowModal(true);
  };

  // ── 提交（新增/更新）───────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!form.year || !form.title || !form.body) return;
    const tags = form.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const ok = await save({
      type: "timeline", filename: form.year,
      body: `# ${form.title}\n\n${form.body}`,
      metadata: { title: form.title, date: `${form.year}-01-01`, year: form.year, tags },
    });
    if (ok) { setShowModal(false); setEditingEntry(null); setForm(emptyForm); }
  }, [form, save]);

  // ── 删除 ──────────────────────────────────────────────
  const handleDelete = useCallback(async (year: string) => {
    if (!confirm(`确定要删除 ${year} 年的记录吗？\n此操作不可撤销。`)) return;
    await remove("timeline", year);
  }, [remove]);

  // ── 打开抽屉 ──────────────────────────────────────────
  const openDrawer = (entry: TimelineEntry) => setDrawerEntry(entry);
  const closeDrawer = () => { setDrawerEntry(null); setShowEventForm(false); setEditingEventIdx(null); };

  // ── 子事件：新增 ─────────────────────────────────────
  const openEventCreate = () => { setEditingEventIdx(null); setEventForm(emptyEvent); setShowEventForm(true); };

  // ── 子事件：编辑 ─────────────────────────────────────
  const openEventEdit = (idx: number, evt: LifeEvent) => {
    setEditingEventIdx(idx);
    setEventForm(evt);
    setShowEventForm(true);
  };

  // ── 子事件：保存 ─────────────────────────────────────
  const saveEvent = useCallback(async () => {
    if (!drawerEntry || !eventForm.date || !eventForm.title) return;
    const events = drawerEntry.events || [];
    const updatedEvents = editingEventIdx !== null
      ? events.map((e, i) => i === editingEventIdx ? eventForm : e)
      : [...events, eventForm].sort((a, b) => a.date.localeCompare(b.date));

    const ok = await save({
      type: "timeline", filename: drawerEntry.year,
      body: `# ${drawerEntry.title}\n\n${drawerEntry.body}`,
      metadata: { title: drawerEntry.title, date: drawerEntry.date, year: drawerEntry.year, tags: drawerEntry.tags, events: updatedEvents },
    });
    if (ok) { setDrawerEntry({ ...drawerEntry, events: updatedEvents }); setShowEventForm(false); setEventForm(emptyEvent); }
  }, [drawerEntry, eventForm, editingEventIdx, save]);

  // ── 子事件：删除 ─────────────────────────────────────
  const deleteEvent = useCallback(async (idx: number) => {
    if (!drawerEntry || !confirm("确定删除这条事件吗？")) return;
    const events = (drawerEntry.events || []).filter((_, i) => i !== idx);
    const ok = await save({
      type: "timeline", filename: drawerEntry.year,
      body: `# ${drawerEntry.title}\n\n${drawerEntry.body}`,
      metadata: { title: drawerEntry.title, date: drawerEntry.date, year: drawerEntry.year, tags: drawerEntry.tags, events },
    });
    if (ok) setDrawerEntry({ ...drawerEntry, events });
  }, [drawerEntry, save]);

  const isEditMode = !!editingEntry;

  return (
    <>
      {/* ── 编辑模式：新增按钮 ─────────────────────── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-ink-300 dark:border-ink-700 rounded-lg text-sm text-ink-500 dark:text-ink-400 hover:border-ink-500 dark:hover:border-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors duration-200 w-full justify-center">
              <Plus size={16} /> 新增年份大事记
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 时间轴主体 ─────────────────────────────── */}
      <ol className="relative">
        <div className="absolute left-[15px] sm:left-[19px] top-3 bottom-3 w-px bg-ink-200 dark:bg-ink-800" />
        {entries.map((entry, i) => (
          <li key={entry.slug} className="relative pl-10 sm:pl-12 pb-14 last:pb-0">
            <div className={`absolute left-[11px] sm:left-2.5 top-2 w-3 h-3 rounded-full border-2 ${i === 0 ? "bg-ink-900 dark:bg-ink-100 border-ink-900 dark:border-ink-100" : "bg-ink-50 dark:bg-ink-950 border-ink-300 dark:border-ink-700"}`} />
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-lg font-bold tabular-nums text-ink-900 dark:text-ink-100">{entry.year}</span>
              {entry.tags.length > 0 && (
                <span className="flex gap-1.5">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 font-medium tracking-wide">{tag}</span>
                  ))}
                </span>
              )}
            </div>
            <div onClick={() => openDrawer(entry)}
              className="rounded-lg border border-ink-200 dark:border-ink-800 px-5 py-5 group/card relative cursor-pointer hover:border-ink-400 dark:hover:border-ink-600 transition-colors">
              {/* ── 编辑/删除按钮 ──────────────────── */}
              {isEditing && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(entry); }}
                    className="p-1.5 rounded-md text-ink-300 dark:text-ink-700 hover:text-ink-700 dark:hover:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.year); }}
                    className="p-1.5 rounded-md text-ink-300 dark:text-ink-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              <h3 className="text-base font-semibold text-ink-800 dark:text-ink-200 mb-3 pr-16">{entry.title}</h3>
              <MarkdownRenderer content={entry.body} overrides={timelineOverrides} />
            </div>
          </li>
        ))}
      </ol>

      {/* ── 弹窗（新增/编辑共用）─────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-[90] flex items-center justify-center px-4 bg-ink-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowModal(false); setEditingEntry(null); }}>
            <motion.div className="w-full max-w-lg bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl p-6 shadow-2xl"
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{isEditMode ? "编辑年份大事记" : "新增年份大事记"}</h3>
                <button onClick={() => { setShowModal(false); setEditingEntry(null); }}
                  className="p-1.5 rounded-md text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-ink-400 dark:text-ink-600 mb-1.5 font-mono">年份</label>
                    <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                      disabled={isEditMode}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-300/50 dark:focus:ring-ink-700/50 text-ink-800 dark:text-ink-200 font-mono disabled:opacity-40" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-ink-400 dark:text-ink-600 mb-1.5 font-mono">标签（逗号分隔）</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="成长, 里程碑"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-300/50 dark:focus:ring-ink-700/50 text-ink-800 dark:text-ink-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-ink-400 dark:text-ink-600 mb-1.5 font-mono">标题</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="2026：此刻"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-300/50 dark:focus:ring-ink-700/50 text-ink-800 dark:text-ink-200" />
                </div>
                <div>
                  <label className="block text-[11px] text-ink-400 dark:text-ink-600 mb-1.5 font-mono">内容（Markdown）</label>
                  <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder={"## Q1 — 开篇\n这一年从...\n\n---\n\n> 一句话总结"} rows={6}
                    className="w-full px-3 py-2.5 text-sm leading-relaxed bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ink-300/50 dark:focus:ring-ink-700/50 text-ink-800 dark:text-ink-200 font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => { setShowModal(false); setEditingEntry(null); }}
                  className="px-4 py-2 text-sm text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors">取消</button>
                <button onClick={handleSubmit} disabled={!form.year || !form.title || !form.body}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-ink-900 dark:bg-ink-100 text-ink-50 dark:text-ink-900 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
                  <Save size={14} /> {isEditMode ? "更新并同步" : "创建并同步"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 侧边抽屉 ─────────────────────────────────── */}
      <AnimatePresence>
        {drawerEntry && (
          <>
            <style dangerouslySetInnerHTML={{__html: `body, html { overflow: hidden !important; height: 100vh !important; }`}} />
            <motion.div className="fixed inset-0 z-[100] bg-white/40 dark:bg-ink-950/60 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeDrawer} />
            <motion.div className="fixed top-0 right-0 bottom-0 z-[101] w-[90%] max-w-4xl bg-white/90 dark:bg-ink-900/95 backdrop-blur-xl border-l border-neutral-200/80 dark:border-ink-800/60 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/90 ring-1 ring-black/5 dark:ring-white/15 overflow-hidden flex flex-col"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              {/* ── Header ──────────────────────────── */}
              <div className="flex items-center justify-between p-8 border-b border-neutral-200/60 dark:border-ink-800/50">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-ink-50 tracking-tight">{drawerEntry.title}</h2>
                  <div className="flex gap-2 mt-3">
                    {drawerEntry.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-ink-800/60 text-neutral-600 dark:text-ink-400 font-medium tracking-wide">{tag}</span>
                    ))}
                  </div>
                </div>
                <button onClick={closeDrawer}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:text-ink-600 dark:hover:text-ink-100 dark:hover:bg-ink-800/50 transition-all duration-200">
                  <X size={20} />
                </button>
              </div>
              {/* ── Body ─────────────────────────────── */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-8 py-6" onWheel={(e) => e.stopPropagation()} data-lenis-prevent="true">
                <div className="mb-12">
                  <MarkdownRenderer content={drawerEntry.body} />
                </div>

                {/* ── 子事件列表 ──────────────────────── */}
                <div className="border-t border-neutral-200/60 dark:border-ink-800/50 pt-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-ink-50 tracking-wide">Life Logs</h3>
                    {editMode && (
                      <button onClick={openEventCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs text-neutral-600 hover:text-lime-600 dark:text-ink-600 dark:hover:text-lime-400 transition-colors duration-200">
                        <Plus size={14} /> 添加事件
                      </button>
                    )}
                  </div>

                  {!showEventForm && (!drawerEntry.events || drawerEntry.events.length === 0) && (
                    <p className="text-sm text-neutral-500 dark:text-ink-500 text-center py-12 italic">这一年还没有记录具体事件</p>
                  )}

                  {/* ── 事件表单 ─────────────────────── */}
                  <AnimatePresence>
                    {showEventForm && (
                      <motion.div
                        className="mb-8 p-5 rounded-xl border border-neutral-200 dark:border-ink-800/60 bg-neutral-50 dark:bg-ink-800/20 backdrop-blur-sm"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <div className="space-y-4">
                          <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm font-mono bg-white dark:bg-ink-950/50 border border-neutral-300 dark:border-ink-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/30 text-neutral-800 dark:text-ink-200 placeholder:text-neutral-400 dark:placeholder:text-ink-600" />
                          <input type="text" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            placeholder="事件标题..."
                            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-ink-950/50 border border-neutral-300 dark:border-ink-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/30 text-neutral-900 dark:text-ink-100 placeholder:text-neutral-400 dark:placeholder:text-ink-600 font-medium" />
                          <textarea value={eventForm.body} onChange={(e) => setEventForm({ ...eventForm, body: e.target.value })}
                            placeholder="详细描述..." rows={3}
                            className="w-full px-4 py-2.5 text-sm leading-relaxed bg-white dark:bg-ink-950/50 border border-neutral-300 dark:border-ink-800/60 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-lime-400/30 text-neutral-800 dark:text-ink-300 placeholder:text-neutral-400 dark:placeholder:text-ink-600" />
                          <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => { setShowEventForm(false); setEventForm(emptyEvent); }}
                              className="px-4 py-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-ink-500 dark:hover:text-ink-300 transition-colors duration-200">取消</button>
                            <button onClick={saveEvent} disabled={!eventForm.date || !eventForm.title}
                              className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-lime-100 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400 rounded-lg hover:bg-lime-200 dark:hover:bg-lime-400/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-lime-300 dark:border-lime-400/20">
                              <Save size={13} /> {editingEventIdx !== null ? "更新" : "保存"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── 事件时间轴 ────────────────────── */}
                  <div className="relative space-y-0">{(drawerEntry.events || []).map((evt, idx) => (
                      <div key={idx} className="flex gap-6 group relative pb-8 last:pb-0">
                        {/* ── 时间轴线与圆点 ──────────────── */}
                        <div className="relative flex flex-col items-center pt-1">
                          <div className="w-2 h-2 rounded-full bg-lime-500 dark:bg-lime-400 ring-4 ring-lime-500/20 dark:ring-lime-400/10 group-hover:scale-125 transition-transform duration-200 z-10" />
                          {idx < (drawerEntry.events || []).length - 1 && (
                            <div className="absolute top-3 w-[1px] h-full bg-neutral-300 dark:bg-ink-800/60" />
                          )}
                        </div>
                        {/* ── 事件内容 ────────────────────── */}
                        <div className="flex-1 pt-0">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-mono text-neutral-500 dark:text-ink-500 tracking-wider">{evt.date}</span>
                            {editMode && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={() => openEventEdit(idx, evt)}
                                  className="p-1.5 text-neutral-400 hover:text-lime-600 dark:text-ink-600 dark:hover:text-lime-400 transition-colors duration-200">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => deleteEvent(idx)}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 dark:text-ink-600 dark:hover:text-red-400 transition-colors duration-200">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                          <h4 className="text-base font-semibold text-neutral-900 dark:text-ink-50 mb-2 tracking-wide leading-snug">{evt.title}</h4>
                          {evt.body && <p className="text-sm text-neutral-600 dark:text-ink-400 leading-relaxed">{evt.body}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
