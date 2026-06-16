import type { Metadata } from "next";
import { Clock } from "lucide-react";
import NowContent from "./NowContent";

export const metadata: Metadata = {
  title: "此时此刻 · Life OS",
  description: "不追求「最新」，只追求「真实」——记录某一个真实的切面。",
  openGraph: {
    title: "此时此刻 · Life OS",
    description: "不追求「最新」，只追求「真实」——记录某一个真实的切面。",
  },
};

// ── 数据类型 ─────────────────────────────────────────────
interface NowData {
  metadata: {
    title: string;
    updated: string;
    slug: string;
  };
  body: string;
}

import nowDataJson from "../../../public/data/now.json";

async function getNowData(): Promise<NowData> {
  return nowDataJson as NowData;
}

// ── 页面组件 ─────────────────────────────────────────────
export default async function NowPage() {
  const data = await getNowData();

  return (
    <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">
      {/* ── 页面标题行 ──────────────────────────────── */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            此时此刻
          </h1>
          {data.metadata.updated && (
            <span className="flex items-center gap-1.5 text-xs text-ink-400 dark:text-ink-600 font-mono">
              <Clock size={12} />
              {data.metadata.updated}
            </span>
          )}
        </div>
        <p className="text-ink-500 dark:text-ink-400 text-sm leading-relaxed">
          不追求「最新」，只追求「真实」。
        </p>
      </header>

      {/* ── 正文（可编辑）───────────────────────────── */}
      <NowContent metadata={data.metadata} body={data.body} />

      {/* ── 底部注脚 ─────────────────────────────────── */}
      <div className="mt-16 pt-8 border-t border-ink-200 dark:border-ink-800">
        <p className="text-xs text-ink-400 dark:text-ink-600 text-center">
          这个页面记录的是某一个真实的切面。
          <br />
          它会过时——而那恰恰是它存在的意义。
        </p>
      </div>
    </main>
  );
}
