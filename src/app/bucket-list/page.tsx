import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import BucketContent from "./BucketContent";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "愿望清单 · Life OS",
  description: "不是待办事项，是生命的可能性目录。完成的划掉，新的不断加入。",
  openGraph: {
    title: "愿望清单 · Life OS",
    description: "不是待办事项，是生命的可能性目录。完成的划掉，新的不断加入。",
  },
};

// ── 数据类型 ─────────────────────────────────────────────
interface BucketData {
  metadata: {
    title: string;
    updated: string;
    slug: string;
  };
  body: string;
}

import bucketDataJson from "../../../public/data/bucket.json";

async function getBucketData(): Promise<BucketData> {
  return bucketDataJson as BucketData;
}

// ── 页面组件 ─────────────────────────────────────────────
export default async function BucketListPage() {
  const data = await getBucketData();

  return (
    <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">
      {/* ── 页面标题 ─────────────────────────────────── */}
      <header className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            愿望清单
          </h1>
          <span className="flex items-center gap-1.5 text-xs text-ink-400 dark:text-ink-600 font-mono">
            <ListChecks size={12} />
            {data.metadata.updated}
          </span>
        </div>
        <p className="text-ink-500 dark:text-ink-400 leading-relaxed max-w-lg">
          不是待办事项，是生命的可能性目录。
          <br />
          完成的划掉，新的不断加入——清单本身就在生长。
        </p>
      </header>

      {/* ── 清单（含编辑功能）────────────────────────── */}
      <BucketContent metadata={data.metadata} body={data.body} />

      <BackToTop />

      {/* ── 底部 ─────────────────────────────────────── */}
      <div className="mt-16 pt-8 border-t border-ink-200 dark:border-ink-800">
        <p className="text-xs text-ink-400 dark:text-ink-600 text-center">
          愿望清单的生命力，不在于完成了多少，而在于还在期待什么。
        </p>
      </div>
    </main>
  );
}
