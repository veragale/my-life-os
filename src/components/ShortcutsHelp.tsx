"use client";

import { motion } from "framer-motion";
import { X, Search, PenLine, Globe, Clock, Command, Keyboard, ArrowUp } from "lucide-react";

interface ShortcutRow {
  keys: string[];
  label: string;
  icon: React.ReactNode;
}

const SHORTCUTS: ShortcutRow[] = [
  {
    keys: ["Ctrl", "K"],
    label: "全局搜索",
    icon: <Search size={13} />,
  },
  {
    keys: ["G"],
    label: "跳转数字花园",
    icon: <Globe size={13} />,
  },
  {
    keys: ["T"],
    label: "跳转编年史",
    icon: <Clock size={13} />,
  },
  {
    keys: ["E"],
    label: "切换编辑模式",
    icon: <PenLine size={13} />,
  },
  {
    keys: ["Ctrl", "W"],
    label: "回到页面顶部",
    icon: <ArrowUp size={13} />,
  },
  {
    keys: ["?"],
    label: "显示 / 隐藏此帮助",
    icon: <Keyboard size={13} />,
  },
  {
    keys: ["Esc"],
    label: "关闭弹窗 / 对话框",
    icon: <X size={13} />,
  },
];

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl border border-neutral-200/80 dark:border-ink-800/60 rounded-2xl shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/90 ring-1 ring-black/5 dark:ring-white/15 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/60 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <Command size={16} className="text-ink-500 dark:text-ink-400" />
            <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-100">键盘快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Shortcut list */}
        <div className="px-5 py-3">
          <ul className="divide-y divide-ink-100 dark:divide-ink-800/50">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.keys.join("+")}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2.5 text-ink-700 dark:text-ink-300">
                  <span className="text-ink-400 dark:text-ink-500">{shortcut.icon}</span>
                  <span className="text-xs">{shortcut.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <span key={key} className="flex items-center">
                      {i > 0 && (
                        <span className="text-[9px] text-ink-300 dark:text-ink-600 mx-0.5">+</span>
                      )}
                      <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md bg-ink-100 dark:bg-ink-800 text-[10px] font-mono font-medium text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 shadow-sm">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-neutral-200/60 dark:border-ink-800">
          <p className="text-[10px] text-ink-400 dark:text-ink-500 text-center">
            在输入框中键入时快捷键不会触发
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
