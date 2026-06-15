"use client";

import { useState, useCallback } from "react";
import { Plus, X, Save, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import { useContentEditor } from "@/hooks/useContentEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";

// ── 数据类型 ─────────────────────────────────────────────
interface TimelineEntry { slug: string; title: string; date: string; year: string; tags: string[]; body: string; }
interface TimelineContentProps { entries: TimelineEntry[]; }

// ── Markdown 覆写 ────────────────────────────────────────
const timelineOverrides = {
  h1: () => null,
  h2: ({ children }: any) => <h2 className="text-base font-semibold mt-6 mb-2 text-ink-800 dark:text-ink-200">{children}</h2>,
  p: ({ children }: any) => <p className="text-sm leading-[1.8] text-ink-600 dark:text-ink-400 mb-3 last:mb-0">{children}</p>,
};

const emptyForm = { year: new Date().getFullYear().toString(), title: "", tags: "", body: "" };

// ── 组件 ─────────────────────────────────────────────────
export default function TimelineContent({ entries }: TimelineContentProps) {
  const { isEditing } = useEditMode();
  const { save, remove } = useContentEditor();

  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [form, setForm] = useState(emptyForm);

  // ── 打开新建弹窗 ──────────────────────────────────────
  const openCreate = () => {
    setEditingEntry(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // ── 打开编辑弹窗 ──────────────────────────────────────
  const openEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setForm({
      year: entry.year,
      title: entry.title,
      tags: entry.tags.join(", "),
      body: entry.body.replace(/^# .+\n\n/, ""), // 去掉 "# 标题" 行
    });
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
            <div className="rounded-lg border border-ink-200 dark:border-ink-800 px-5 py-5 group/card relative">
              {/* ── 编辑/删除按钮 ──────────────────── */}
              {isEditing && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button onClick={() => openEdit(entry)}
                    className="p-1.5 rounded-md text-ink-300 dark:text-ink-700 hover:text-ink-700 dark:hover:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(entry.year)}
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
                <h3 className="text-lg font-semibold">
                  {isEditMode ? "编辑年份大事记" : "新增年份大事记"}
                </h3>
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
    </>
  );
}
