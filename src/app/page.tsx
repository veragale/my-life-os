import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "风上心's Life OS",
  description: "A personal life operating system — documenting days on Earth and beyond.",
  openGraph: {
    title: "风上心's Life OS",
    description: "A personal life operating system — documenting days on Earth and beyond.",
  },
};

// ── 数据类型 ─────────────────────────────────────────────
interface HomeData {
  author: string;
  siteName: string;
  daysOnEarth: number;
  yearProgress: number;
  birthDate: string;
}

import homeDataJson from "../../public/data/home.json";

async function getHomeData(): Promise<HomeData> {
  return homeDataJson as HomeData;
}

// ── 导航链接配置 ─────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/now",         label: "此刻",        desc: "此时此刻" },
  { href: "/timeline",    label: "编年史",      desc: "时间轴" },
  { href: "/garden",      label: "数字花园",    desc: "散文随笔" },
  { href: "/bucket-list", label: "愿望清单",    desc: "Bucket List" },
] as const;

// ── 页面组件（Server Component，负责数据获取）─────────────
export default async function HomePage() {
  const data = await getHomeData();

  return (
    <main className="flex-1 flex flex-col">
      {/* ── 全屏 Hero ─────────────────────────────── */}
      <HeroSection
        siteName={data.siteName}
        daysOnEarth={data.daysOnEarth}
        yearProgress={data.yearProgress}
      />

      {/* ── 导航区 ───────────────────────────────── */}
      <section className="px-6 pb-24 max-w-2xl mx-auto w-full">
        <nav className="grid grid-cols-2 gap-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between
                         border border-ink-200 dark:border-ink-800
                         rounded-lg px-5 py-4
                         hover:border-ink-400 dark:hover:border-ink-600
                         transition-colors duration-200"
            >
              <div>
                <span className="font-medium text-sm">{item.label}</span>
                <span className="block text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                  {item.desc}
                </span>
              </div>
              <ArrowRight
                size={16}
                className="text-ink-300 dark:text-ink-600
                           group-hover:text-ink-900 dark:group-hover:text-ink-100
                           group-hover:translate-x-0.5
                           transition-all duration-200"
              />
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
