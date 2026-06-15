"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.theme = next ? "dark" : "light";
    } catch {}
  }

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
