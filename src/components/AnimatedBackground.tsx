/**
 * Awwwards 风格复合背景
 *
 * 三层：
 *   1. 3 个超大模糊彩色圆团，缓慢漂移 + 呼吸（z-0）
 *   2. 全屏胶片噪点纹理，轻微闪烁（z-[1]）
 *
 * 完美兼容 Dark/Light 模式，所有层 pointer-events: none
 */

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* ── 圆团 1：琥珀 / 深紫 ──────────────────────── */}
      <div
        className="bg-orb absolute w-[120vw] h-[120vw] sm:w-[100vw] sm:h-[100vw]
                   rounded-full blur-[140px] sm:blur-[180px]
                   bg-amber-300/40 dark:bg-violet-700/40
                   -top-[30%] -left-[30%]"
        style={{ animation: "drift-1 28s ease-in-out infinite" }}
      />

      {/* ── 圆团 2：玫瑰 / 靛蓝 ──────────────────────── */}
      <div
        className="bg-orb absolute w-[100vw] h-[100vw] sm:w-[80vw] sm:h-[80vw]
                   rounded-full blur-[130px] sm:blur-[160px]
                   bg-rose-300/40 dark:bg-indigo-800/40
                   top-[40%] -right-[20%]"
        style={{
          animation: "drift-2 32s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />

      {/* ── 圆团 3：紫罗兰 / 琥珀 ────────────────────── */}
      <div
        className="bg-orb absolute w-[80vw] h-[80vw] sm:w-[70vw] sm:h-[70vw]
                   rounded-full blur-[120px] sm:blur-[140px]
                   bg-violet-300/40 dark:bg-amber-800/40
                   bottom-[10%] left-[10%]"
        style={{
          animation: "drift-3 35s ease-in-out infinite",
          animationDelay: "-16s",
        }}
      />

      {/* ── 胶片噪点 SVG ────────────────────────────── */}
      <div
        className="bg-noise-layer fixed inset-0 z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          animation: "noise-shimmer 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
