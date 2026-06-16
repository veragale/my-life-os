import Link from "next/link";
import { Globe, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import MagneticWrapper from "./MagneticWrapper";

// ── 导航项 ───────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/now",         label: "此刻" },
  { href: "/timeline",    label: "编年史" },
  { href: "/garden",      label: "数字花园" },
  { href: "/bucket-list", label: "愿望清单" },
] as const;

// ── 组件 ─────────────────────────────────────────────────
interface NavbarProps {
  onSearchOpen?: () => void;
}

export default function Navbar({ onSearchOpen }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-ink-50/80 dark:bg-ink-950/80 border-b border-ink-200/50 dark:border-ink-800/50">
      <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
        {/* ── 左：品牌 ────────────────────────────── */}
        <MagneticWrapper strength={0.4}>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium
                       text-ink-600 dark:text-ink-400
                       hover:text-ink-900 dark:hover:text-ink-100
                       transition-colors"
          >
            <Globe size={14} />
            <span className="hidden sm:inline">Life OS</span>
          </Link>
        </MagneticWrapper>

        {/* ── 中：导航 ────────────────────────────── */}
        <div className="flex items-center gap-0 sm:gap-1">
          {NAV_LINKS.map((item, i) => (
            <span key={item.href} className="flex items-center">
              {i > 0 && (
                <span className="text-ink-300 dark:text-ink-700 text-[8px] sm:text-[10px] mx-0.5 sm:mx-1.5 select-none">
                  ·
                </span>
              )}
              <MagneticWrapper strength={0.35}>
                <Link
                  href={item.href}
                  className="text-xs sm:text-sm text-ink-500 dark:text-ink-500
                             hover:text-ink-900 dark:hover:text-ink-100
                             transition-colors duration-150 px-1 py-0.5"
                >
                  {item.label}
                </Link>
              </MagneticWrapper>
            </span>
          ))}
        </div>

        {/* ── 右：搜索 + 主题切换 ───────────────────── */}
        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.4}>
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-1.5 text-xs text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors duration-150 px-2 py-1 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800/60"
            >
              <Search size={14} />
            </button>
          </MagneticWrapper>
          <MagneticWrapper strength={0.5}>
            <ThemeToggle />
          </MagneticWrapper>
        </div>
      </div>
    </nav>
  );
}
