"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import ShortcutsHelp from "@/components/ShortcutsHelp";

/**
 * 全局键盘快捷键
 *
 * G       → /garden     数字花园
 * T       → /timeline   编年史
 * E       → 切换编辑模式
 * ?       → 快捷键帮助
 * Ctrl+W  → 回到顶部
 *
 * 焦点在 input / textarea / select / contenteditable 时不会触发。
 */
export default function KeyboardShortcuts() {
  const router = useRouter();
  const { toggleEdit } = useEditMode();
  const [helpOpen, setHelpOpen] = useState(false);

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  // ── 回到顶部 ──────────────────────────────────────────
  const scrollToTop = useCallback(() => {
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { duration: 0.8, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // ── 忽略输入场景 ──────────────────────────────
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase?.() ?? "";
      const isInput =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isInput) return;

      // ── Ctrl+W：回到顶部 ──────────────────────────────
      if (e.ctrlKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault();
        scrollToTop();
        return;
      }

      // 如果已有修饰键（Cmd/Ctrl/Alt），不拦截其他单键
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "g":
        case "G":
          e.preventDefault();
          router.push("/garden");
          break;
        case "t":
        case "T":
          e.preventDefault();
          router.push("/timeline");
          break;
        case "e":
        case "E":
          e.preventDefault();
          toggleEdit();
          break;
        case "?":
          e.preventDefault();
          setHelpOpen((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router, toggleEdit, scrollToTop]);

  // ── Esc 关闭帮助（在 ShortcutsHelp 内也有处理，这里做兜底）──
  useEffect(() => {
    if (!helpOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [helpOpen]);

  return (
    <AnimatePresence>
      {helpOpen && <ShortcutsHelp open={helpOpen} onClose={closeHelp} />}
    </AnimatePresence>
  );
}
