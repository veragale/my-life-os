"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * 路由转场动画（Vercel 绝对稳定+原版动画保留版）
 *
 * 包裹 layout.tsx 的 {children}，在路由切换时触发
 * Fade + Slide 转场。AnimatePresence 在 layout 层持久化，
 * 确保旧页面先完成 exit 动画再进入新页面。
 */

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        // 🌟 完美保留你原版的转场参数
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        // 🌟 核心修复：加上这行样式，传承 layout 的全屏布局，防止主页 UI 塌陷和天数归零
        className="flex-1 flex flex-col w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}