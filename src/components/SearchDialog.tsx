"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sprout, Calendar, ListChecks, Clock } from "lucide-react";
import { useSearch, type SearchResult } from "@/hooks/useSearch";

// ── 类型图标映射 ─────────────────────────────────────────
const TYPE_ICON: Record<SearchResult["type"], React.ElementType> = {
  garden: Sprout,
  timeline: Calendar,
  bucket: ListChecks,
  now: Clock,
};

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  garden: "数字花园",
  timeline: "编年史",
  bucket: "愿望清单",
  now: "此刻",
};

// ── 组件 ─────────────────────────────────────────────────
interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  /** 选中搜索结果时触发，由 SearchProvider 处理延迟导航 */
  onSelect: (href: string) => void;
}

export default function SearchDialog({ open, onClose, onSelect }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const results = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时自动聚焦
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // 按分组渲染
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  const typeOrder: SearchResult["type"][] = ["garden", "timeline", "bucket", "now"];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-[150] bg-white/50 dark:bg-ink-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗 */}
          <div className="fixed inset-0 z-[151] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-xl pointer-events-auto bg-white/95 dark:bg-ink-900/98 backdrop-blur-xl border border-ink-200/60 dark:border-ink-800/50 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* ── 搜索框 ──────────────────────────── */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-200/40 dark:border-ink-800/40">
                <Search size={18} className="shrink-0 text-ink-400 dark:text-ink-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索花园、编年史、清单…"
                  className="flex-1 bg-transparent text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-600 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-md text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-ink-400 dark:text-ink-600 bg-ink-100 dark:bg-ink-800 rounded border border-ink-200 dark:border-ink-700">
                  Esc
                </kbd>
              </div>

              {/* ── 结果列表 ────────────────────────── */}
              <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
                {query.trim() && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-ink-400 dark:text-ink-600">
                    <Search size={24} className="mb-2 opacity-40" />
                    <p className="text-sm">没有找到「{query}」相关内容</p>
                  </div>
                )}

                {!query.trim() && (
                  <div className="flex flex-col items-center justify-center py-10 text-ink-400 dark:text-ink-600">
                    <p className="text-xs">输入关键词搜索全站内容</p>
                  </div>
                )}

                {typeOrder.map((type) => {
                  const items = grouped[type];
                  if (!items?.length) return null;
                  const Icon = TYPE_ICON[type];

                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
                        <Icon size={12} className="text-ink-400 dark:text-ink-500" />
                        <span className="text-[10px] font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wider">
                          {TYPE_LABEL[type]}
                        </span>
                        <span className="text-[10px] text-ink-300 dark:text-ink-700 font-mono">
                          {items.length}
                        </span>
                      </div>

                      {items.map((item, i) => (
                        <button
                          key={`${type}-${i}`}
                          onClick={() => onSelect(item.href)}
                          className="w-full text-left px-5 py-3 hover:bg-ink-50 dark:hover:bg-ink-800/40 transition-colors duration-100 group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-ink-800 dark:text-ink-200 group-hover:text-ink-900 dark:group-hover:text-ink-100 transition-colors">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-ink-500 dark:text-ink-400 line-clamp-2">
                            {item.excerpt}
                          </p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-1.5">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-ink-100/80 dark:bg-ink-800/60 text-ink-500 dark:text-ink-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
