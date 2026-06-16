"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * 回到顶部浮动按钮
 * - 滚动超过 300px 后渐显
 * - 点击平滑滚动到页面顶部（兼容 Lenis）
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 使用 scroll 事件兼容 Lenis（Lenis 会触发原生 scroll 事件）
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 初始检查
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    // 优先使用 Lenis 实例（如果存在），回退到原生 scrollTo
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { duration: 0.8, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="
            fixed bottom-6 right-6 z-[80]
            w-9 h-9 rounded-full
            bg-white/90 dark:bg-ink-800/90
            backdrop-blur-md
            border border-ink-200/60 dark:border-ink-700/60
            shadow-lg shadow-black/5 dark:shadow-black/30
            flex items-center justify-center
            text-ink-400 dark:text-ink-500
            hover:text-ink-900 dark:hover:text-ink-100
            hover:bg-white dark:hover:bg-ink-700
            hover:shadow-xl
            transition-colors duration-200
          "
          aria-label="回到顶部"
        >
          <ArrowUp size={15} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
