"use client";

import { motion } from "framer-motion";

/**
 * 文字逐词/逐字飞入动画
 *
 * 将文本拆分为独立单元，每个单元以 stagger 延迟从下方飞入。
 * 用于首页精神宣言等 Awwwards 级排版动效。
 */

interface SplitTextProps {
  text: string;
  className?: string;
  /** 按什么拆分：word | char */
  splitBy?: "word" | "char";
  /** 每个单元的 stagger 间隔（秒） */
  stagger?: number;
  /** 整体延迟（秒） */
  delay?: number;
  /** 动画时长（秒） */
  duration?: number;
  /** y 偏移量 px */
  yOffset?: number;
}

export default function SplitText({
  text,
  className = "",
  splitBy = "word",
  stagger = 0.06,
  delay = 0,
  duration = 0.6,
  yOffset = 24,
}: SplitTextProps) {
  const units = splitBy === "char" ? text.split("") : text.split(" ");

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {units.map((unit, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: yOffset }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration,
              delay: delay + i * stagger,
              ease: [0.25, 0.46, 0.45, 0.94], // easeOutCubic
            }}
          >
            {unit}
            {splitBy === "word" && i < units.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
