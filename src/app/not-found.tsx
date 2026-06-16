import Link from "next/link";
import { Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-sm">
        {/* 装饰 */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800/60 mb-6">
          <Sprout size={28} className="text-ink-400 dark:text-ink-500" />
        </div>

        <h1 className="text-5xl font-bold text-ink-900 dark:text-ink-100 mb-3 tracking-tight">
          404
        </h1>

        <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed mb-2">
          这个页面不存在。
        </p>
        <p className="text-xs text-ink-400 dark:text-ink-500 leading-relaxed mb-8">
          也许它还没被种下，也许它已经枯萎了。
          <br />
          花园里的东西不需要永远存在。
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-full bg-ink-900 dark:bg-ink-100 text-ink-50 dark:text-ink-900 font-medium hover:opacity-80 transition-opacity"
        >
          ← 回到首页
        </Link>
      </div>
    </main>
  );
}
