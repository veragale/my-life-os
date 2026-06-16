export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-ink-300 dark:border-ink-700 border-t-ink-900 dark:border-t-ink-100 rounded-full animate-spin" />
        <span className="text-xs text-ink-400 dark:text-ink-600 font-mono">
          loading…
        </span>
      </div>
    </div>
  );
}
