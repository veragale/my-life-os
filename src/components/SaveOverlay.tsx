"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "./EditProvider";

/**
 * Awwwards 风格保存遮罩层
 *
 * 保存时全屏半透明覆盖 + 旋转加载环 + "正在同步生命数据..." 文案
 */

export default function SaveOverlay() {
  const { isSaving } = useEditMode();

  return (
    <AnimatePresence>
      {isSaving && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center
                     bg-ink-950/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center space-y-4"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* ── 旋转加载环 ────────────────────────── */}
            <motion.div
              className="w-8 h-8 border-2 border-ink-700 border-t-ink-200
                         rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />

            {/* ── 文案 ──────────────────────────────── */}
            <motion.p
              className="text-sm text-ink-400 tracking-wide"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              正在同步生命数据...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
