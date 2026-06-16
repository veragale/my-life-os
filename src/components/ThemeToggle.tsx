"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);

    const html = document.documentElement;

    // ── View Transition API（Chrome 111+ / Edge 111+ / Safari 18.2+）──
    if ("startViewTransition" in document) {
      // @ts-ignore — 类型声明可能缺失
      document.startViewTransition(() => {
        html.classList.toggle("dark", next);
        try {
          localStorage.theme = next ? "dark" : "light";
        } catch {}
      });
      return;
    }

    // ── 回退：CSS transition 方案 ──────────────────────
    html.classList.add("theme-transitioning");
    html.classList.toggle("dark", next);
    try {
      localStorage.theme = next ? "dark" : "light";
    } catch {}

    // transition 结束后移除临时 class，避免影响其他动画
    const onTransitionEnd = () => {
      html.classList.remove("theme-transitioning");
      html.removeEventListener("transitionend", onTransitionEnd);
    };
    html.addEventListener("transitionend", onTransitionEnd);
    // 安全兜底：400ms 后强制移除
    setTimeout(() => {
      html.classList.remove("theme-transitioning");
      html.removeEventListener("transitionend", onTransitionEnd);
    }, 500);
  }, [dark]);

  // 避免 hydration 不匹配：挂载前不渲染
  if (!mounted) {
    return <span className="w-8 h-8" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "切换到亮色模式" : "切换到暗色模式"}
      className="
        relative w-8 h-8 rounded-full
        flex items-center justify-center
        text-ink-400 dark:text-ink-500
        hover:text-ink-900 dark:hover:text-ink-100
        hover:bg-ink-100 dark:hover:bg-ink-800
        transition-all duration-200
      "
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
