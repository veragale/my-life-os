"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import SplitText from "./SplitText";

/**
 * 首页全屏 Hero
 *
 * Awwwards 级排版动效：
 * - 巨型背景数字（25vw 等宽加粗）
 * - 逐词飞入精神宣言
 * - 分层入场动画（label → 文字 → 数字 → 副标题 → 进度条）
 */

interface HeroSectionProps {
  siteName: string;
  daysOnEarth: number;
  yearProgress: number;
}

export default function HeroSection({
  siteName,
  daysOnEarth,
  yearProgress,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* ── 1. 品牌标签 ──────────────────────────── */}
      <motion.p
        className="text-sm tracking-[0.3em] uppercase text-ink-400 dark:text-ink-500 font-medium mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {siteName}
      </motion.p>

      {/* ── 2. 逐词飞入宣言 ──────────────────────── */}
      <div className="text-center mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          <SplitText
            text="我在地球上"
            splitBy="word"
            stagger={0.08}
            delay={0.5}
          />
        </h1>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          <SplitText
            text="已停留"
            splitBy="word"
            stagger={0.1}
            delay={0.9}
          />
        </h1>
      </div>

      {/* ── 3. 巨型背景数字 ──────────────────────── */}
      <motion.div
        className="relative leading-none select-none"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.4,
          delay: 1.2,
          ease: [0.16, 1, 0.3, 1], // easeOutExpo
        }}
      >
        <span className="text-[24vw] sm:text-[18vw] font-mono font-bold tracking-tighter text-ink-900 dark:text-ink-100">
          <AnimatedCounter
            target={daysOnEarth}
            duration={2200}
            className="text-[24vw] sm:text-[18vw] font-mono font-bold tracking-tighter text-ink-900 dark:text-ink-100"
          />
        </span>

        {/* ── "天" ──────────────────────────────── */}
        <motion.span
          className="block text-center text-3xl sm:text-4xl font-bold text-ink-700 dark:text-ink-300 mt-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          天
        </motion.span>
      </motion.div>

      {/* ── 4. 副标题 ────────────────────────────── */}
      <motion.p
        className="text-ink-500 dark:text-ink-400 text-base sm:text-lg leading-relaxed max-w-md mx-auto text-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.8 }}
      >
        这是我的生命操作系统。
        <br />
        记录来路，标注此刻，想象去处。
      </motion.p>

      {/* ── 5. 年度进度条 ─────────────────────────── */}
      <motion.div
        className="w-full max-w-sm mx-auto mt-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 3.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="border border-ink-200 dark:border-ink-800 rounded-lg px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500 dark:text-ink-400">Year Progress</span>
            <span className="font-mono tabular-nums font-medium">
              {yearProgress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-ink-900 dark:bg-ink-100 rounded-full animate-bar-fill"
              style={{ "--bar-width": `${yearProgress}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </motion.div>

      {/* ── 滚动提示 ─────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.8 }}
      >
        <motion.div
          className="w-5 h-8 rounded-full border-2 border-ink-300 dark:border-ink-700 flex items-start justify-center p-1"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-1.5 rounded-full bg-ink-400 dark:bg-ink-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}
