"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

// ── 代码块（带复制按钮）───────────────────────────────────
function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="
          absolute top-2.5 right-2.5 z-10
          flex items-center gap-1 px-2 py-1 rounded-md
          text-[10px] font-mono
          bg-ink-200/60 dark:bg-ink-700/60
          text-ink-500 dark:text-ink-400
          hover:bg-ink-300 dark:hover:bg-ink-600
          hover:text-ink-800 dark:hover:text-ink-200
          opacity-0 group-hover:opacity-100
          transition-all duration-200
        "
        aria-label={copied ? "已复制" : "复制代码"}
      >
        {copied ? (
          <>
            <Check size={11} />
            <span>已复制</span>
          </>
        ) : (
          <>
            <Copy size={11} />
            <span>复制</span>
          </>
        )}
      </button>
      <code className="block rounded-lg p-4 text-sm font-mono bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-200 overflow-x-auto">
        {children}
      </code>
    </div>
  );
}

// ── 工具：把标题文本转为 URL 安全的 id ──────────────────
function headingId(children: React.ReactNode): string {
  const text = Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
    : String(children ?? "");
  return text
    .toLowerCase()
    .replace(/[^\w\s一-鿿-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "heading";
}

// ── 估算阅读时长（中英文混合）───────────────────────────
function estimateReadingTime(text: string): number {
  // 中文字符按 400 字/分钟，英文按 238 词/分钟
  const chineseChars = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 238);
  return Math.max(1, minutes);
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
    // 代码块：外包 CodeBlock 以添加复制按钮
    return <CodeBlock>{children}</CodeBlock>;
  },
};

// ── 组件 ─────────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
  /** 覆盖特定元素的渲染方式 */
  overrides?: Partial<Components>;
  /** 额外 className 包裹层 */
  className?: string;
  /** 图片缩放状态变化回调，用于父组件判断是否拦截 Esc */
  onImageZoomChange?: (zoomed: boolean) => void;
}

export default function MarkdownRenderer({
  content,
  overrides,
  className,
  onImageZoomChange,
}: MarkdownRendererProps) {
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  // 通知父组件图片缩放状态
  const handleZoomIn = (src: string) => {
    setZoomedImg(src);
    onImageZoomChange?.(true);
  };
  const handleZoomOut = () => {
    setZoomedImg(null);
    onImageZoomChange?.(false);
  };

  // ── Esc 关闭图片缩放 ──────────────────────────────
  useEffect(() => {
    if (!zoomedImg) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleZoomOut();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zoomedImg]); // eslint-disable-line react-hooks/exhaustive-deps

  const components: Components = {
    ...defaultComponents,
    img: ({ src, alt, ...props }: any) => (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onClick={() => handleZoomIn(src)}
        className="w-full max-w-3xl mx-auto rounded-xl border border-neutral-200/60 dark:border-ink-800/50 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity my-8 bg-ink-100 dark:bg-ink-800/50"
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
          <motion.div
            className="fixed inset-0 z-[200] bg-white/90 dark:bg-ink-950/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={handleZoomOut}
          >
            <motion.img
              src={zoomedImg}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{
                opacity: { duration: 0.2 },
                scale: { type: "spring", damping: 22, stiffness: 220, mass: 0.6 },
              }}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── 导出阅读时长工具函数 ─────────────────────────────────
export { estimateReadingTime };
