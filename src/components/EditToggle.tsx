"use client";

import { Settings, X } from "lucide-react";
import { useEditMode } from "./EditProvider";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 浮动编辑模式开关
 *
 * 固定在屏幕右下角，始终可见。
 * 激活时展开显示 "Editing" 标签 + 绿色指示。
 */

export default function EditToggle() {
  const { isEditing, toggleEdit } = useEditMode();

  return (
    <motion.button
      onClick={toggleEdit}
      aria-label={isEditing ? "退出编辑模式" : "进入编辑模式"}
      className={`
        fixed bottom-6 right-6 z-[80]
        flex items-center gap-2
        px-3 py-2 rounded-full
        border backdrop-blur-md
        shadow-sm
        transition-colors duration-200
        ${
          isEditing
            ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
            : "bg-ink-50/80 dark:bg-ink-900/80 border-ink-200 dark:border-ink-700 text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
        }
      `}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X size={14} />
          </motion.span>
        ) : (
          <motion.span
            key="settings"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Settings size={14} />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        className="text-xs font-medium"
        layout
      >
        {isEditing ? "Editing" : "Edit"}
      </motion.span>
    </motion.button>
  );
}
