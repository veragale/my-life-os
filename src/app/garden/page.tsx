import { Sprout, Flower2, TreePine } from "lucide-react";
import GardenContent from "./GardenContent";

// ── 数据类型 ─────────────────────────────────────────────
interface GardenEntry {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  status: "seedling" | "budding" | "evergreen";
  body: string;
}

interface GardenData {
  entries: GardenEntry[];
}

import gardenDataJson from "../../../public/data/garden.json";

async function getGardenData(): Promise<GardenData> {
  return gardenDataJson as GardenData;
}

// ── 状态图例配置 ─────────────────────────────────────────
const STATUS_LEGEND = [
  { key: "seedling", icon: Sprout, label: "幼苗 Seedling", color: "bg-emerald-400 dark:bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400" },
  { key: "budding",  icon: Flower2, label: "发芽 Budding",  color: "bg-amber-400 dark:bg-amber-500",    textColor: "text-amber-700 dark:text-amber-400" },
  { key: "evergreen", icon: TreePine, label: "常青 Evergreen", color: "bg-teal-400 dark:bg-teal-500",    textColor: "text-teal-700 dark:text-teal-400" },
] as const;

// ── 页面组件 ─────────────────────────────────────────────
export default async function GardenPage() {
  const data = await getGardenData();

  return (
    <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
      {/* ── 页面标题 ─────────────────────────────────── */}
      <header className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            数字花园
          </h1>
          <span className="text-xs text-ink-400 dark:text-ink-600 font-mono">
            {data.entries.length} notes
          </span>
        </div>
        <p className="text-ink-500 dark:text-ink-400 leading-relaxed max-w-lg">
          这里是想法生长的地方。
          <br />
          有的刚冒出土壤，有的正在舒展，有的已经扎根。
          <br />
          它们都不完美——但花园本来就不需要完美。
        </p>

        {/* ── 状态图例 ───────────────────────────────── */}
        <div className="flex items-center gap-5 mt-6 text-xs">
          {STATUS_LEGEND.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.key} className="flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${item.color}`} />
                <Icon size={12} className={item.textColor} />
                <span className="text-ink-500 dark:text-ink-400">{item.label}</span>
              </span>
            );
          })}
        </div>
      </header>

      {/* ── 卡片墙（含编辑功能）──────────────────────── */}
      <GardenContent entries={data.entries} />

      {/* ── 底部 ─────────────────────────────────────── */}
      <div className="mt-16 pt-8 border-t border-ink-200 dark:border-ink-800">
        <p className="text-xs text-ink-400 dark:text-ink-600 text-center">
          花园不需要按时间排序——它按生长的状态呼吸。
        </p>
      </div>
    </main>
  );
}
