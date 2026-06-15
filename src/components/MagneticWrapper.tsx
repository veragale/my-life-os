"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, useCallback } from "react";

/**
 * 磁吸效果包装器
 *
 * 包裹任何元素，当光标靠近时产生微小的位移吸引效果，
 * 同时光标外圈膨胀——形成 Awwwards 级的「物理交互」质感。
 *
 * 用法：
 *   <MagneticWrapper strength={0.35}>
 *     <a href="/now">Now</a>
 *   </MagneticWrapper>
 */

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.1 };

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** 磁吸强度 0~1，默认 0.35 */
  strength?: number;
}

export default function MagneticWrapper({
  children,
  className,
  strength = 0.35,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
    },
    [x, y, strength]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className ?? ""}`}
      data-magnetic
    >
      {children}
    </motion.div>
  );
}
