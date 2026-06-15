"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  /** 动画时长 ms */
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  duration = 1600,
  className = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // 使用 IntersectionObserver 触发，元素进入视口时启动
    const el = document.documentElement; // 简化：直接启动
    startRef.current = null;

    function step(timestamp: number) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo 缓动：先快后慢，数字感强
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);

      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {display.toLocaleString()}
    </span>
  );
}
