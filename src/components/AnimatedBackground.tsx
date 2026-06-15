/**
 * Awwwards 风格复合背景
 *
 * 三层：
 *   1. 2-3 个超大模糊彩色圆团，缓慢漂移 + 呼吸（z-0）
 *   2. 全屏胶片噪点纹理，轻微闪烁（z-[1]）
 *
 * 完美兼容 Dark/Light 模式，所有层 pointer-events: none
 */

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* ── 圆团 1：琥珀 / 深紫 ──────────────────────── */}
      <div
        className="bg-orb absolute w-[60vw] h-[60vw] sm:w-[50vw] sm:h-[50vw]
                   rounded-full blur-[120px] sm:blur-[160px]
                   bg-amber-300/20 dark:bg-violet-700/25
                   -top-[20%] -left-[10%]"
        style={{ animation: "drift-1 28s ease-in-out infinite" }}
      />

      {/* ── 圆团 2：玫瑰 / 靛蓝 ──────────────────────── */}
      <div
        className="bg-orb absolute w-[50vw] h-[50vw] sm:w-[40vw] sm:h-[40vw]
                   rounded-full blur-[100px] sm:blur-[140px]
                   bg-rose-300/15 dark:bg-indigo-800/20
                   top-[40%] -right-[10%]"
        style={{
          animation: "drift-2 32s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />

      {/* ── 圆团 3：紫罗兰 / 琥珀 ────────────────────── */}
      <div
        className="bg-orb absolute w-[40vw] h-[40vw] sm:w-[35vw] sm:h-[35vw]
                   rounded-full blur-[90px] sm:blur-[120px]
                   bg-violet-300/15 dark:bg-amber-800/15
                   bottom-[10%] left-[20%]"
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
