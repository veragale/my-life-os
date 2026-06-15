"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Save, Sprout, Flower2, TreePine, Tag, Trash2, Pencil, Leaf, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import { useContentEditor } from "@/hooks/useContentEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface GardenEntry {
  slug: string; title: string; date: string;
  tags: string[]; status: "seedling" | "budding" | "growth" | "evergreen"; body: string;
}
interface GardenContentProps { entries: GardenEntry[]; }

// ── 状态视觉映射（新增 growth）─────────────────────────
const STATUS_CONFIG = {
  seedling: { label: "Seedling", labelCn: "幼苗", icon: Sprout, color: { bg: "bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-md", border: "border-emerald-200/60 dark:border-emerald-800/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-400 dark:bg-emerald-500" } },
  budding:  { label: "Budding", labelCn: "发芽", icon: Flower2, color: { bg: "bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-md", border: "border-amber-200/60 dark:border-amber-800/40", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-400 dark:bg-amber-500" } },
  evergreen:{ label: "Evergreen", labelCn: "常青", icon: TreePine, color: { bg: "bg-teal-50/80 dark:bg-teal-950/20 backdrop-blur-md", border: "border-teal-200/60 dark:border-teal-800/40", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-400 dark:bg-teal-500" } },
  growth:   { label: "Growth", labelCn: "成长", icon: Leaf, color: { bg: "bg-lime-50/80 dark:bg-lime-950/20 backdrop-blur-md", border: "border-lime-200/60 dark:border-lime-800/40", text: "text-lime-700 dark:text-lime-400", dot: "bg-lime-400 dark:bg-lime-500" } },
} as const;
type StatusKey = keyof typeof STATUS_CONFIG;

const FILTERS = ["all", "seedling", "budding", "growth", "evergreen"] as const;
type FilterType = typeof FILTERS[number];
const FILTER_LABELS: Record<FilterType, string> = {
  all: "全部", seedling: "幼苗", budding: "发芽", growth: "成长", evergreen: "常青",
};

function extractExcerpt(body: string, maxLen = 120): string {
  const lines = body.replace(/^#{1,6}\s+.*/gm, "").replace(/^>\s+/gm, "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && l !== "---");
  const text = lines.join(" ");
  return text.length <= maxLen ? text : text.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
}
function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s一-鿿-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 48) || "untitled";
}

const emptyForm = { title: "", tags: "", body: "", status: "seedling" as StatusKey };

export default function GardenContent({ entries }: GardenContentProps) {
  const { isEditing } = useEditMode();
  const { save, remove } = useContentEditor();

  const [showNote, setShowNote] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GardenEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<FilterType>("all");
  const [modalEntry, setModalEntry] = useState<GardenEntry | null>(null);

  const sorted = [...entries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const filtered = filter === "all" ? sorted : sorted.filter((e) => e.status === filter);

  // ── 锁定背景滚动 ──────────────────────────────────────
  useEffect(() => {
    if (modalEntry) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // 组件销毁时的安全解绑
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalEntry]);// ⚠️ 注意：这里的依赖项必须填 [selectedPost]！

  const openCreate = () => { setEditingEntry(null); setForm(emptyForm); setShowNote(true); };
  const openEdit = (entry: GardenEntry) => {
    setEditingEntry(entry);
    setForm({ title: entry.title, tags: entry.tags.join(", "), body: entry.body.replace(/^# .+\n\n/, ""), status: entry.status });
    setShowNote(true);
  };

  const handleSubmit = useCallback(async () => {
    if (!form.title || !form.body) return;
    const tags = form.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const slug = editingEntry ? editingEntry.slug : toSlug(form.title);
    const date = editingEntry ? editingEntry.date : new Date().toISOString().split("T")[0];
    const ok = await save({
      type: "garden", filename: slug,
      body: `# ${form.title}\n\n${form.body}`,
      metadata: { title: form.title, date, tags, status: form.status },
    });
    if (ok) { setShowNote(false); setEditingEntry(null); setForm(emptyForm); }
  }, [form, save, editingEntry]);

  const handleDelete = useCallback(async (slug: string) => {
    if (!confirm(`确定要删除这颗种子吗？\n"${slug}"`)) return;
    await remove("garden", slug);
  }, [remove]);

  const isEditMode = !!editingEntry;

  return (
    <>
      {/* ── 顶部筛选栏 ─────────────────────────────── */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              filter === f
                ? "bg-ink-900 dark:bg-ink-100 text-ink-50 dark:text-ink-900 shadow-sm"
                : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700"
            }`}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* ── 编辑模式：便签 ─────────────────────────── */}
      <AnimatePresence>
        {isEditing && !showNote && (
          <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-ink-300 dark:border-ink-700 rounded-lg text-sm text-ink-500 dark:text-ink-400 hover:border-ink-500 dark:hover:border-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors duration-200 w-full justify-center">
              <Sprout size={16} /> 种下一颗新种子
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 便签输入框 ─────────────────────────────── */}
      <AnimatePresence>
        {isEditing && showNote && (
          <motion.div
            className="mb-8 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-5"
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.3 }}>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="想法的标题..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 dark:focus:ring-emerald-700/50 text-ink-800 dark:text-ink-200 font-medium" />
                <div className="flex items-center gap-1">
                  {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[StatusKey]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setForm({ ...form, status: key })}
                      className={`p-2 rounded-lg transition-all duration-150 ${form.status === key ? `${cfg.color.bg} ${cfg.color.text} ring-1 ${cfg.color.border}` : "text-ink-300 dark:text-ink-700 hover:text-ink-500"}`}
                      title={cfg.labelCn}><cfg.icon size={16} /></button>
                  ))}
                </div>
              </div>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={"写下想法...支持 Markdown\n\n## 小标题\n正文内容\n\n> 一句引用"} rows={4}
                className="w-full px-3 py-2.5 text-sm leading-relaxed bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300/50 dark:focus:ring-emerald-700/50 text-ink-800 dark:text-ink-200 font-mono" />
              <div className="flex items-center justify-between">
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="标签（逗号分隔）" className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 dark:focus:ring-emerald-700/50 text-ink-600 dark:text-ink-400" />
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => { setShowNote(false); setEditingEntry(null); }}
                    className="px-3 py-1.5 text-xs text-ink-400 dark:text-ink-600 hover:text-ink-600 dark:hover:text-ink-400 transition-colors">收起</button>
                  <button onClick={handleSubmit} disabled={!form.title || !form.body}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
                    <Save size={12} /> {isEditMode ? "更新" : "种下"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 卡片墙（Framer Motion layout）──────────── */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {filtered.map((entry, i) => {
            const status = (entry.status || "seedling") as StatusKey;
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.seedling;
            return (
              <motion.article key={entry.slug} layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => setModalEntry(entry)}
                className={`group relative rounded-xl border p-5 transition-all duration-200 hover:shadow-md cursor-pointer ${cfg.color.bg} ${cfg.color.border} ${i === 0 && filter === "all" ? "sm:col-span-2" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color.bg} ${cfg.color.text} border ${cfg.color.border}`}>
                    <cfg.icon size={10} /> {cfg.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-ink-400 dark:text-ink-600">{entry.date}</span>
                    {isEditing && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(entry); }}
                          className="text-ink-300 dark:text-ink-700 hover:text-ink-700 dark:hover:text-ink-300 transition-colors p-0.5">
                          <Pencil size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.slug); }}
                          className="text-ink-300 dark:text-ink-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5">
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100 mb-2 leading-snug">{entry.title}</h2>
                <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-400 mb-3">{extractExcerpt(entry.body)}</p>
                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag size={10} className="text-ink-300 dark:text-ink-600" />
                    {entry.tags.map((tag) => (<span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-100/80 dark:bg-ink-800/60 text-ink-500 dark:text-ink-400">{tag}</span>))}
                  </div>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ── 沉浸式大弹窗（全文阅读）──────────────────── */}
      <AnimatePresence>
        {modalEntry && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/40 dark:bg-ink-950/60 backdrop-blur-md overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalEntry(null)}>

            {/* 👉 直接塞进来的强制锁定 CSS 👈 */}
            <style dangerouslySetInnerHTML={{__html: `
              body, html, #__next, main, [data-scroll-container] {
                overflow: hidden !important;
                height: 100vh !important;
                touch-action: none;
              }
            `}} />
            <motion.div
              className="relative w-full max-w-3xl my-8 bg-white/90 dark:bg-ink-900/95 backdrop-blur-xl border border-neutral-200/80 dark:border-ink-800/60 rounded-2xl shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/90 ring-1 ring-black/5 dark:ring-white/15 overflow-hidden flex flex-col max-h-[85vh]"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}>
              {/* ── Header ────────────────────────── */}
              <div className="flex items-start justify-between p-6 border-b border-neutral-200/60 dark:border-ink-800">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">{modalEntry.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    {(() => {
                      const cfg = STATUS_CONFIG[modalEntry.status as StatusKey];
                      const Icon = cfg?.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg?.color.bg} ${cfg?.color.text} border ${cfg?.color.border}`}>
                          {Icon && <Icon size={10} />}
                          {cfg?.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-ink-400 dark:text-ink-600">{modalEntry.date}</span>
                    {modalEntry.tags.length > 0 && (
                      <div className="flex gap-1.5">
                        {modalEntry.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setModalEntry(null)}
                  className="shrink-0 p-2 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                  <X size={20} />
                </button>
              </div>
              {/* ── Body（可滚动）─────────────────── */}
              <div 
                className="flex-1 overflow-y-auto overscroll-contain px-6 py-6"
                onWheel={(e) => e.stopPropagation()}
                data-lenis-prevent="true"
              >
                <MarkdownRenderer content={modalEntry.body} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
