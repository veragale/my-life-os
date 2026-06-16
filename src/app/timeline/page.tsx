import { CalendarDays } from "lucide-react";
import { Suspense } from "react";
import TimelineContent from "./TimelineContent";

// 🌟 方案二核心：直接把 JSON 当成 JS 模块硬编码引入！
// 路径解析：当前文件在 src/app/timeline，通过 ../../../ 跳回项目根目录，再进入 public/data
import timelineDataJson from "../../../public/data/timeline.json";

export const dynamic = "force-dynamic";

// ── 数据类型 ─────────────────────────────────────────────
interface TimelineEntry {
  slug: string;
  title: string;
  date: string;
  year: string;
  tags: string[];
  body: string;
}

interface TimelineData {
  entries: TimelineEntry[];
}

// ── SSG: 终极暴力读取 JSON (Vercel 绝对防弹版) ─────────────────
async function getTimelineData(): Promise<TimelineData> {
  // 因为 JSON 已经在文件顶部被打包进来了，这里连 fs 读取都不需要了，直接返回！
  return timelineDataJson as TimelineData;
}

// ── 页面组件 ─────────────────────────────────────────────
export default async function TimelinePage() {
  const data = await getTimelineData();

  return (
    <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">
      {/* ── 页面标题 ─────────────────────────────────── */}
      <header className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            编年史
          </h1>
          <span className="flex items-center gap-1.5 text-xs text-ink-400 dark:text-ink-600 font-mono">
            <CalendarDays size={12} />
            {data.entries.length} chapters
          </span>
        </div>
        <p className="text-ink-500 dark:text-ink-400 leading-relaxed max-w-lg">
          时间不是线性的，但记忆需要一个锚点。
          <br />
          这里按年份记录那些值得标记的时刻——不一定盛大，但一定真实。
        </p>
      </header>

      {/* ── 时间轴（含编辑功能）──────────────────────── */}
      <Suspense fallback={<div className="text-center py-8 text-ink-400">Loading...</div>}>
        <TimelineContent entries={data.entries} />
      </Suspense>

      {/* ── 底部 ─────────────────────────────────────── */}
      <div className="mt-16 pt-8 border-t border-ink-200 dark:border-ink-800">
        <p className="text-xs text-ink-400 dark:text-ink-600 text-center">
          编年史不会完整——它只是那些我选择记住的部分。
        </p>
      </div>
    </main>
  );
}