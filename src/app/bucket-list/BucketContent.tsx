"use client";

import { useState, useCallback } from "react";
import { Check, Circle, Save, Plus, X, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import { useContentEditor } from "@/hooks/useContentEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";

// ── 数据类型 ─────────────────────────────────────────────
interface BucketItem { text: string; done: boolean; }
interface BucketGroup { emoji: string; title: string; items: BucketItem[]; }
interface BucketContentProps { metadata: { title: string; updated: string; slug: string }; body: string; }

// ── 解析 / 重建 (增加安全防御) ───────────────────────────
function parseBucketBody(body: string): BucketGroup[] {
  const safeBody = body || ""; // 防弹设计：防止 body 为 undefined 时崩溃
  const groups: BucketGroup[] = [];
  let current: BucketGroup | null = null;
  for (const line of safeBody.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const h2Match = trimmed.match(/^##\s+(.+)/);
    if (h2Match) {
      const heading = h2Match[1];
      const emojiMatch = heading.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
      current = { emoji: emojiMatch ? emojiMatch[1] : "", title: emojiMatch ? heading.slice(emojiMatch[0].length) : heading, items: [] };
      groups.push(current);
      continue;
    }
    const itemMatch = trimmed.match(/^- \[([ xX])\]\s+(.+)/);
    if (itemMatch && current) current.items.push({ done: itemMatch[1].toLowerCase() === "x", text: itemMatch[2] });
  }
  return groups;
}

function buildBucketBody(groups: BucketGroup[], footer: string): string {
  const groupStrs = groups.map((g) => {
    const header = `## ${g.emoji} ${g.title}`;
    const items = g.items.map((item) => `- [${item.done ? "x" : " "}] ${item.text}`).join("\n");
    return `${header}\n${items}`;
  });
  const main = `# 愿望清单\n\n${groupStrs.join("\n\n")}`;
  return footer ? `${main}\n\n---\n\n${footer}` : main;
}

// ── 组件 ─────────────────────────────────────────────────
export default function BucketContent({ metadata, body }: BucketContentProps) {
  const { isEditing } = useEditMode();
  const { saved, save: doApiSave } = useContentEditor();

  const safeBody = body || ""; // 防弹设计
  const footer = safeBody.includes("---") ? (safeBody.split("---").pop() || "").trim() : "";
  const [groups, setGroups] = useState<BucketGroup[]>(() => parseBucketBody(safeBody));
  const [newItemText, setNewItemText] = useState("");
  const [addingToGroup, setAddingToGroup] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{ gi: number; ii: number } | null>(null);
  const [editText, setEditText] = useState("");

  // ── 保存全部 ─────────────────────────────────────────
  const doSave = useCallback(async (next: BucketGroup[]) => {
    setGroups(next);
    await doApiSave({
      type: "bucket-list",
      body: buildBucketBody(next, footer),
      metadata: metadata as Record<string, any>,
    });
  }, [footer, metadata, doApiSave]);

  // ── 切换勾选 ─────────────────────────────────────────
  const toggleItem = useCallback((gi: number, ii: number) => {
    const next = groups.map((g, gIdx) => gIdx !== gi ? g : {
      ...g, items: g.items.map((item, iIdx) => iIdx === ii ? { ...item, done: !item.done } : item),
    });
    doSave(next);
  }, [groups, doSave]);

  // ── 新增条目 ─────────────────────────────────────────
  const addItem = useCallback((gi: number) => {
    if (!newItemText.trim()) return;
    const next = groups.map((g, gIdx) => gIdx !== gi ? g : {
      ...g, items: [...g.items, { text: newItemText.trim(), done: false }],
    });
    setNewItemText("");
    setAddingToGroup(null);
    doSave(next);
  }, [groups, newItemText, doSave]);

  // ── 删除条目 ─────────────────────────────────────────
  const deleteItem = useCallback((gi: number, ii: number) => {
    const next = groups.map((g, gIdx) => gIdx !== gi ? g : {
      ...g, items: g.items.filter((_, iIdx) => iIdx !== ii),
    });
    doSave(next);
  }, [groups, doSave]);

  // ── 修改条目文字 ─────────────────────────────────────
  const startEditItem = (gi: number, ii: number, text: string) => {
    setEditingItem({ gi, ii });
    setEditText(text);
  };
  const commitEditItem = () => {
    if (!editingItem || !editText.trim()) return;
    const { gi, ii } = editingItem;
    const next = groups.map((g, gIdx) => gIdx !== gi ? g : {
      ...g, items: g.items.map((item, iIdx) =>
        iIdx === ii ? { ...item, text: editText.trim() } : item
      ),
    });
    setEditingItem(null);
    setEditText("");
    doSave(next);
  };

  // ── 统计 ─────────────────────────────────────────────
  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);
  const doneItems = groups.reduce((s, g) => s + g.items.filter((i) => i.done).length, 0);
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div>
      {/* ── 总进度条 ─────────────────────────────────── */}
      <div className="space-y-2 mb-10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500 dark:text-ink-400">Life progress</span>
          <span className="font-mono tabular-nums text-ink-700 dark:text-ink-300">{doneItems} of {totalItems} · {progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
          <div className="h-full bg-ink-900 dark:bg-ink-100 rounded-full animate-bar-fill" style={{ "--bar-width": `${progress}%` } as React.CSSProperties} />
        </div>
      </div>

      {/* ── 分组清单 ─────────────────────────────────── */}
      <div className="space-y-10">
        {groups.map((group, gi) => {
          const groupDone = group.items.filter((i) => i.done).length;
          return (
            <section key={gi}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><span className="text-xl">{group.emoji}</span><span>{group.title}</span></h2>
                <span className="text-[10px] font-mono text-ink-400 dark:text-ink-600">{groupDone}/{group.items.length}</span>
              </div>

              <ul className="space-y-2">
                {group.items.map((item, ii) => {
                  const isEditingThis = editingItem?.gi === gi && editingItem?.ii === ii;
                  return (
                  <li key={ii}
                    className={`flex items-start gap-3 rounded-lg px-4 py-3 border transition-colors duration-150 ${item.done ? "border-ink-200/60 dark:border-ink-800/60 bg-ink-50/50 dark:bg-ink-900/30" : "border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950/50"} ${isEditing && !isEditingThis ? "cursor-pointer" : ""}`}
                    onClick={isEditing && !isEditingThis ? () => toggleItem(gi, ii) : undefined}>
                    {item.done ? <Check size={16} className="mt-0.5 shrink-0 text-ink-400 dark:text-ink-500" /> : <Circle size={16} className="mt-0.5 shrink-0 text-ink-300 dark:text-ink-700" />}
                    {/* ── 编辑模式：文字变输入框 ─────── */}
                    {isEditingThis ? (
                      <input type="text" value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEditItem(); if (e.key === "Escape") { setEditingItem(null); setEditText(""); } }}
                        className="flex-1 text-sm bg-transparent border-b border-ink-300 dark:border-ink-600 focus:outline-none focus:border-ink-700 dark:focus:border-ink-300 text-ink-800 dark:text-ink-200 pb-0.5" autoFocus />
                    ) : (
                      <span className={`text-sm leading-relaxed flex-1 ${item.done ? "line-through text-ink-400 dark:text-ink-600" : "text-ink-800 dark:text-ink-200"}`}>{item.text}</span>
                    )}
                    {/* ── 编辑/删除按钮 ─────────────── */}
                    {isEditing && !isEditingThis && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); startEditItem(gi, ii, item.text); }}
                          className="shrink-0 text-ink-200 dark:text-ink-800 hover:text-ink-700 dark:hover:text-ink-300 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(gi, ii); }}
                          className="shrink-0 text-ink-200 dark:text-ink-800 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {isEditingThis && (
                      <button onClick={commitEditItem}
                        className="shrink-0 text-emerald-500 hover:text-emerald-600 transition-colors">
                        <Save size={13} />
                      </button>
                    )}
                  </li>
                )})}

                {/* ── 编辑：添加新条目 ────────────── */}
                <AnimatePresence>
                  {isEditing && addingToGroup === gi && (
                    // 🌟 修复点 1：必须给包裹在 AnimatePresence 里的 motion.li 添加独一无二的 key！
                    <motion.li key={`add-input-${gi}`} className="flex items-center gap-2 px-4 py-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <Circle size={16} className="shrink-0 text-ink-200 dark:text-ink-800" />
                      <input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addItem(gi); if (e.key === "Escape") { setAddingToGroup(null); setNewItemText(""); } }}
                        placeholder="写下新的愿望..." autoFocus
                        className="flex-1 text-sm bg-transparent border-none focus:outline-none text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-700" />
                      <button onClick={() => addItem(gi)} disabled={!newItemText.trim()} className="p-1 text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors disabled:opacity-30"><Save size={14} /></button>
                      <button onClick={() => { setAddingToGroup(null); setNewItemText(""); }} className="p-1 text-ink-300 hover:text-ink-600 dark:hover:text-ink-400 transition-colors"><X size={14} /></button>
                    </motion.li>
                  )}
                </AnimatePresence>
              </ul>

              {/* ── 添加按钮 ───────────────────────── */}
              {isEditing && addingToGroup !== gi && (
                <button onClick={() => setAddingToGroup(gi)}
                  className="mt-2 w-full border border-dashed border-ink-200 dark:border-ink-700 rounded-lg py-2 text-xs text-ink-400 dark:text-ink-500 hover:border-ink-400 dark:hover:border-ink-500 hover:text-ink-600 dark:hover:text-ink-300 transition-colors flex items-center justify-center gap-1">
                  <Plus size={12} /> 新增愿望
                </button>
              )}
            </section>
          );
        })}
      </div>

      {/* ── 尾注 ─────────────────────────────────────── */}
      {footer && (
        <div className="mt-14">
          <MarkdownRenderer content={footer} overrides={{ h1: () => null, h2: () => null, ul: () => null, li: () => null }} />
        </div>
      )}

      {/* ── 编辑模式提示 / 保存成功 ──────────────────── */}
      <AnimatePresence>
        {isEditing && !saved && (
          // 🌟 修复点 2：添加 key="edit-hint"
          <motion.p key="edit-hint" className="text-[11px] text-ink-400 dark:text-ink-600 text-center mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            点击条目可切换完成状态 · 点击 🗑 删除愿望 · 点击 + 新增
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {saved && (
          // 🌟 修复点 3：添加 key="save-success"
          <motion.p key="save-success" className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-4" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            ✓ 生命数据已同步
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}