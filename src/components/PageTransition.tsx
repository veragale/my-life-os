"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * 路由转场动画
 *
 * 包裹 layout.tsx 的 {children}，在路由切换时触发
 * Fade + Slide 转场。
 *
 * ★ 使用 mode="popLayout" 替代 mode="wait"
 *
 * mode="wait" 的白屏根因：
 *   exit 动画完成后才挂载新组件 → 若新组件含 useSearchParams()
 *   或 RSC 流式渲染未完成，组件 suspend → AnimatePresence
 *   无法渲染任何内容 → 白屏。
 *
 * mode="popLayout" 的修复：
 *   新组件立即挂载（不等待 exit 完成），exit 组件脱离文档流
 *   （position: absolute）继续播放退出动画。
 *   即使新组件 suspend，也有 loading.tsx 兜底，不会白屏。
 *   视觉效果：旧页淡出 + 新页淡入同步播放，更流畅。
 *
 * 动画参数与原版完全一致。
 */

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
