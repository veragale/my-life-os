"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

/**
 * 全局自定义光标
 *
 * - 外圈：半透明圆环，spring 缓动跟随鼠标，hover 时膨胀
 * - 内点：实心圆，即时跟随
 * - 日间模式：深灰色，夜间模式：浅白色
 * - 触屏设备自动隐藏
 */

const SPRING_CONFIG = { damping: 30, stiffness: 300, mass: 0.4 };

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dark, setDark] = useState(false);

  // ── 运动值 ──────────────────────────────────────────────
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const outerX = useSpring(cursorX, SPRING_CONFIG);
  const outerY = useSpring(cursorY, SPRING_CONFIG);

  // ── 初始化 ──────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    setDark(document.documentElement.classList.contains("dark"));

    // 监听主题切换
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
    };
  }, [cursorX, cursorY, visible]);

  // ── 监听交互元素 hover ──────────────────────────────────
  const setupListeners = useCallback(() => {
    if (!mounted || isTouch) return;

    const interactives = document.querySelectorAll(
      "a, button, [data-magnetic], [data-cursor-hover]"
    );
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);

    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [mounted, isTouch]);

  useEffect(() => {
    const cleanup = setupListeners();
    const observer = new MutationObserver(() => {
      cleanup?.();
      setupListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { cleanup?.(); observer.disconnect(); };
  }, [setupListeners]);

  // ── 触屏设备不渲染 ──────────────────────────────────────
  if (!mounted || isTouch) return null;

  // 日/夜模式颜色
  const ringColor = dark
    ? "border-white/30 bg-white/5"
    : "border-black/30 bg-black/5";
  const ringHover = dark
    ? "border-white/50 bg-white/10"
    : "border-black/40 bg-black/8";
  const dotColor = dark ? "bg-white/80" : "bg-black/80";

  return (
    <>
      {/* ── 外圈：大圆环，spring 跟随 ──────────────── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: outerX, y: outerY }}
        animate={{
          width: hovered ? 56 : 36,
          height: hovered ? 56 : 36,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          width: { type: "spring", damping: 18, stiffness: 300 },
          height: { type: "spring", damping: 18, stiffness: 300 },
          opacity: { duration: 0.15 },
        }}
      >
        <div
          className={`
            w-full h-full rounded-full -translate-x-1/2 -translate-y-1/2
            border transition-colors duration-200
            ${hovered ? ringHover : ringColor}
          `}
        />
      </motion.div>

      {/* ── 内点：实心圆，即时跟随 ──────────────────── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: cursorX, y: cursorY }}
        animate={{
          width: hovered ? 4 : 6,
          height: hovered ? 4 : 6,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.1 }}
      >
        <div
          className={`
            w-full h-full rounded-full -translate-x-1/2 -translate-y-1/2
            ${dotColor} transition-colors duration-200
          `}
        />
      </motion.div>
    </>
  );
}
