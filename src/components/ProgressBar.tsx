"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ProgressBar() {
  // 监听全局页面的滚动进度
  const { scrollYProgress } = useScroll();
  
  // 注入物理弹簧动画，让进度条的延伸带有丝滑的“阻尼感”
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-emerald-500/80 dark:bg-emerald-400/80 backdrop-blur-sm origin-left z-[9999]"
      style={{ scaleX }}
    />
  );
}