"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * 从 Markdown 中提取 h2 / h3 标题，渲染可点击目录，
 * 并利用 IntersectionObserver 高亮当前阅读位置。
 */
export default function TableOfContents({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);          // 移动端折叠
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── 解析标题 ──────────────────────────────────────────
  useEffect(() => {
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length === 2 ? 2 : 3;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s一-鿿-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80) || "heading";
      items.push({ id, text, level });
    }
    setHeadings(items);
  }, [content]);

  // ── IntersectionObserver：高亮当前标题 ──────────────────
  useEffect(() => {
    if (headings.length === 0) return;

    // 断开旧 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // 找出所有当前可见的标题，取最靠上的那个
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // 在顶部留一点 margin，让标题快滚到顶部时提前切换
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [headings]);

  // ── 点击跳转（阻止 Lenis 拦截）──────────────────────────
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // 使用原生 scrollIntoView，并暂时禁用 Lenis
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setIsOpen(false); // 移动端：跳转后收起
  }, []);

  // ── 没有标题就什么都不渲染 ─────────────────────────────
  if (headings.length === 0) return null;

  return (
    <>
      {/* ── 移动端：浮动按钮 ────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="lg:hidden fixed bottom-20 right-4 z-[110] w-9 h-9 rounded-full bg-white/90 dark:bg-ink-800/90 backdrop-blur border border-ink-200 dark:border-ink-700 shadow-md flex items-center justify-center text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors"
        aria-label="目录"
      >
        <List size={15} />
      </button>

      {/* ── 移动端：下拉面板 ────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed bottom-28 right-4 z-[110] w-56 max-h-[50vh] overflow-y-auto rounded-xl bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl border border-ink-200/80 dark:border-ink-800/60 shadow-xl p-3"
          >
            <p className="text-[10px] font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wider mb-2 px-1">
              目录
            </p>
            <nav>
              <ul className="space-y-0.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => scrollTo(h.id)}
                      className={`w-full text-left text-xs leading-relaxed py-1 px-2 rounded-md transition-colors duration-150 truncate block ${
                        activeId === h.id
                          ? "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100 font-medium"
                          : "text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/50"
                      }`}
                      style={{ paddingLeft: h.level === 3 ? "1.25rem" : "0.5rem" }}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 桌面端：侧边栏 ───────────────────────────── */}
      <aside className={`hidden lg:block ${className}`}>
        <div className="sticky top-20">
          <p className="text-[10px] font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wider mb-3">
            目录
          </p>
          <nav>
            <ul className="space-y-1 border-l border-ink-200 dark:border-ink-800">
              {headings.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`w-full text-left text-xs leading-relaxed py-1 transition-all duration-200 truncate block border-l-2 -ml-px ${
                      activeId === h.id
                        ? "border-ink-900 dark:border-ink-100 text-ink-900 dark:text-ink-100 font-medium"
                        : "border-transparent text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300 hover:border-ink-300 dark:hover:border-ink-700"
                    }`}
                    style={{ paddingLeft: h.level === 3 ? "1.5rem" : "0.75rem" }}
                    title={h.text}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
