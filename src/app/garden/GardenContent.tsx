"use client";

import { useState, useCallback } from "react";
import { Plus, Save, Sprout, Flower2, TreePine, Tag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import { useContentEditor } from "@/hooks/useContentEditor";

// ── 数据类型 ─────────────────────────────────────────────
interface GardenEntry {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  status: "seedling" | "budding" | "evergreen";
  body: string;
}

interface GardenContentProps {
  entries: GardenEntry[];
}

// ── 状态视觉映射 ─────────────────────────────────────────
const STATUS_CONFIG = {
  seedling: {
    label: "Seedling", labelCn: "幼苗", icon: Sprout,
    color: { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/60",
             text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-400 dark:bg-emerald-500" },
  },
  budding: {
    label: "Budding", labelCn: "发芽", icon: Flower2,
    color: { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800/60",
             text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-400 dark:bg-amber-500" },
  },
  evergreen: {
    label: "Evergreen", labelCn: "常青", icon: TreePine,
    color: { bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-200 dark:border-teal-800/60",
             text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-400 dark:bg-teal-500" },
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function extractExcerpt(body: string, maxLen = 120): string {
  const lines = body
    .replace(/^#{1,6}\s+.*/gm, "").replace(/^>\s+/gm, "")
    .replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split("\n").map((l) => l.trim())
    .filter((l) => l.length > 0 && l !== "---");
  const text = lines.join(" ");
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s一-鿿-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "untitled";
}

// ── 组件 ─────────────────────────────────────────────────
export default function GardenContent({ entries }: GardenContentProps) {
  const { isEditing } = useEditMode();
  const { save, remove } = useContentEditor();

  const [showNote, setShowNote] = useState(false);
  const [form, setForm] = useState({
    title: "",
    tags: "",
    body: "",
    status: "seedling" as StatusKey,
  });

  // ── 按日期降序排列（最新在最上）────────────────────────
  const sorted = [...entries].sort(
    (a, b) => (b.date || "").localeCompare(a.date || "")
  );

  // ── 种下种子 ──────────────────────────────────────────
  const handlePlant = useCallback(async () => {
    if (!form.title || !form.body) return;
    const tags = form.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const slug = toSlug(form.title);
    const today = new Date().toISOString().split("T")[0];
    const ok = await save({
      type: "garden", filename: slug,
      body: `# ${form.title}\n\n${form.body}`,
      metadata: { title: form.title, date: today, tags, status: form.status },
    });
    if (ok) { setShowNote(false); setForm({ title: "", tags: "", body: "", status: "seedling" }); }
  }, [form, save]);

  // ── 拔除（删除）种子 ──────────────────────────────────
  const handleDelete = useCallback(async (slug: string) => {
    if (!confirm(`确定要删除这颗种子吗？\n"${slug}"`)) return;
    await remove("garden", slug);
  }, [remove]);

  return (
    <>
      {/* ── 编辑模式：便签 ─────────────────────────── */}
      <AnimatePresence>
        {isEditing && !showNote && (
          <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <button
              onClick={() => setShowNote(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-ink-300 dark:border-ink-700 rounded-lg text-sm text-ink-500 dark:text-ink-400 hover:border-ink-500 dark:hover:border-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors duration-200 w-full justify-center"
            >
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
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              <div className="flex gap-3">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="想法的标题..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 dark:focus:ring-emerald-700/50 text-ink-800 dark:text-ink-200 font-medium" />
                <div className="flex items-center gap-1">
                  {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[StatusKey]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => setForm({ ...form, status: key })}
                        className={`p-2 rounded-lg transition-all duration-150 ${form.status === key ? `${cfg.color.bg} ${cfg.color.text} ring-1 ${cfg.color.border}` : "text-ink-300 dark:text-ink-700 hover:text-ink-500"}`}
                        title={cfg.labelCn}><Icon size={16} /></button>
                    );
                  })}
                </div>
              </div>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={"写下想法...支持 Markdown\n\n## 小标题\n正文内容\n\n> 一句引用"} rows={4}
                className="w-full px-3 py-2.5 text-sm leading-relaxed bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300/50 dark:focus:ring-emerald-700/50 text-ink-800 dark:text-ink-200 font-mono" />
              <div className="flex items-center justify-between">
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="标签（逗号分隔）" className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 dark:focus:ring-emerald-700/50 text-ink-600 dark:text-ink-400" />
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => setShowNote(false)} className="px-3 py-1.5 text-xs text-ink-400 dark:text-ink-600 hover:text-ink-600 dark:hover:text-ink-400 transition-colors">收起</button>
                  <button onClick={handlePlant} disabled={!form.title || !form.body}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
                    <Save size={12} /> 种下
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 卡片墙 ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sorted.map((entry, i) => {
          const status = (entry.status || "seedling") as StatusKey;
          const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.seedling;
          const Icon = cfg.icon;

          return (
            <article key={entry.slug}
              className={`group relative rounded-xl border p-5 transition-all duration-200 hover:shadow-sm ${cfg.color.bg} ${cfg.color.border} ${i === 0 ? "sm:col-span-2" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color.bg} ${cfg.color.text} border ${cfg.color.border}`}>
                  <Icon size={10} /> {cfg.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-ink-400 dark:text-ink-600">{entry.date}</span>
                  {/* ── 删除按钮 ──────────────────── */}
                  {isEditing && (
                    <button onClick={() => handleDelete(entry.slug)}
                      className="text-ink-300 dark:text-ink-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5">
                      <Trash2 size={12} />
                    </button>
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
            </article>
          );
        })}
      </div>
    </>
  );
}
