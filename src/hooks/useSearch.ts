"use client";

import { useState, useEffect, useMemo } from "react";
import gardenDataJson from "../../public/data/garden.json";
import timelineDataJson from "../../public/data/timeline.json";
import bucketDataJson from "../../public/data/bucket.json";
import nowDataJson from "../../public/data/now.json";

// ── 搜索结果类型 ─────────────────────────────────────────
export interface SearchResult {
  type: "garden" | "timeline" | "bucket" | "now";
  title: string;
  excerpt: string;
  href: string;
  tags?: string[];
}

// ── 从 body 中提取摘要，优先展示匹配关键词附近的文字 ──────
function extractExcerpt(text: string, query: string, maxLen = 80): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) {
    // 没匹配到就取开头
    const clean = text.replace(/^#{1,6}\s+.*/gm, "").replace(/[#*_>\-\[\]]/g, "").trim();
    return clean.length <= maxLen ? clean : clean.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
  }
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + query.length + maxLen - 20);
  let excerpt = text.slice(start, end).replace(/[#*_>\-\[\]]/g, " ").replace(/\s+/g, " ").trim();
  if (start > 0) excerpt = "…" + excerpt;
  if (end < text.length) excerpt += "…";
  return excerpt;
}

// ── 主 hook ─────────────────────────────────────────────
export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // 300ms 防抖
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo<SearchResult[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    const out: SearchResult[] = [];

    // ── 数字花园 ───────────────────────────────────
    for (const entry of (gardenDataJson as any).entries) {
      const haystack = `${entry.title} ${entry.body} ${(entry.tags || []).join(" ")}`.toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          type: "garden",
          title: entry.title,
          excerpt: extractExcerpt(entry.body, q),
          href: `/garden?open=${encodeURIComponent(entry.slug)}`,
          tags: entry.tags,
        });
      }
    }

    // ── 编年史 ─────────────────────────────────────
    for (const entry of (timelineDataJson as any).entries) {
      const haystack = `${entry.title} ${entry.year} ${entry.body} ${(entry.tags || []).join(" ")}`.toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          type: "timeline",
          title: `${entry.year}：${entry.title}`,
          excerpt: extractExcerpt(entry.body, q),
          href: `/timeline?year=${encodeURIComponent(entry.year)}`,
          tags: entry.tags,
        });
      }
    }

    // ── 愿望清单 ───────────────────────────────────
    {
      const body = (bucketDataJson as any).body as string;
      if (body.toLowerCase().includes(q)) {
        out.push({
          type: "bucket",
          title: "愿望清单",
          excerpt: extractExcerpt(body, q),
          href: "/bucket-list",
        });
      }
    }

    // ── 此刻 ───────────────────────────────────────
    {
      const body = (nowDataJson as any).body as string;
      if (body.toLowerCase().includes(q)) {
        out.push({
          type: "now",
          title: "此时此刻",
          excerpt: extractExcerpt(body, q),
          href: "/now",
        });
      }
    }

    return out;
  }, [debouncedQuery]);

  return results;
}
