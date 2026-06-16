"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

/**
 * Lenis 全局丝滑惯性滚动
 *
 * 仅在客户端初始化，自动管理 raf 循环和销毁。
 * 路由切换时立即将滚动位置重置到顶部——
 * 这是防止"跳转白屏"的关键修复。
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    // 暴露到 window 上，方便 BackToTop 等组件直接调用
    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      (window as any).__lenis = undefined;
      lenis.destroy();
    };
  }, []);

  // ★ 路由切换 → 滚回顶部 + 重新测量页面高度
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true });
    // 等 React 渲染完新页面内容后再重新计算高度
    const raf = requestAnimationFrame(() => {
      lenis.resize();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return <>{children}</>;
}
