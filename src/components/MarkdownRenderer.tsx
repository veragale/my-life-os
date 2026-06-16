"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── 工具：把标题文本转为 URL 安全的 id ──────────────────
function headingId(children: React.ReactNode): string {
  const text = Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
    : String(children ?? "");
  return text
    .toLowerCase()
    .replace(/[^\w\s一-鿿-]/g, "") // 保留中英文、数字、空格、连字符
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "heading";
}

// ── 默认排版组件 ─────────────────────────────────────────
const defaultComponents: Components = {
  h1: ({ children }) => (
    <h1 id={headingId(children)} className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 leading-tight scroll-mt-20">
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const id = headingId(children);
    return (
      <h2 id={id} className="text-xl font-semibold mt-10 mb-4 text-ink-800 dark:text-ink-200 scroll-mt-20 group">
        {children}
        <a href={`#${id}`} className="inline-block ml-2 opacity-0 group-hover:opacity-50 transition-opacity text-ink-400 dark:text-ink-600 text-base no-underline hover:opacity-100" aria-label="锚点链接">#</a>
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = headingId(children);
    return (
      <h3 id={id} className="text-lg font-semibold mt-8 mb-3 text-ink-800 dark:text-ink-200 scroll-mt-20 group">
        {children}
        <a href={`#${id}`} className="inline-block ml-2 opacity-0 group-hover:opacity-50 transition-opacity text-ink-400 dark:text-ink-600 text-base no-underline hover:opacity-100" aria-label="锚点链接">#</a>
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-base leading-[1.85] text-ink-700 dark:text-ink-300 mb-4">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink-900 dark:text-ink-100">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-ink-600 dark:text-ink-400">{children}</em>
  ),
  hr: () => (
    <hr className="my-10 border-t border-ink-200 dark:border-ink-800" />
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 pl-5 border-l-2 border-ink-300 dark:border-ink-700 text-ink-500 dark:text-ink-400 italic leading-relaxed">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-ink-300 dark:decoration-ink-600 underline-offset-2 hover:decoration-ink-900 dark:hover:decoration-ink-100 transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 text-ink-700 dark:text-ink-300 mb-4">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 text-ink-700 dark:text-ink-300 mb-4">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-200">
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} block rounded-lg p-4 text-sm font-mono bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-200 overflow-x-auto my-4`}>
        {children}
      </code>
    );
  },
};

// ── 组件 ─────────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
  /** 覆盖特定元素的渲染方式 */
  overrides?: Partial<Components>;
  /** 额外 className 包裹层 */
  className?: string;
}

export default function MarkdownRenderer({
  content,
  overrides,
  className,
}: MarkdownRendererProps) {
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  const components: Components = {
    ...defaultComponents,
    img: ({ src, alt, ...props }: any) => (
      <img
        src={src}
        alt={alt}
        onClick={() => setZoomedImg(src)}
        className="w-full max-w-3xl mx-auto rounded-xl border border-neutral-200/60 dark:border-ink-800/50 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity my-8"
        {...props}
      />
    ),
    ...overrides,
  };

  return (
    <>
      <div className={className}>
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>

      <AnimatePresence>
        {zoomedImg && (
          <div
            className="fixed inset-0 z-[200] bg-white/90 dark:bg-ink-950/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImg(null)}
          >
            <motion.img
              src={zoomedImg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
