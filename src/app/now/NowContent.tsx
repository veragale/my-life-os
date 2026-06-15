"use client";

import { useState } from "react";
import { Save, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/components/EditProvider";
import { useContentEditor } from "@/hooks/useContentEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";

// ── 数据结构 ─────────────────────────────────────────────
interface NowField {
  label: string;   // "📍 所在地："
  value: string;   // "地球 · 亚洲 · 中国"
}

interface NowContentProps {
  metadata: {
    title: string;
    updated: string;
    slug: string;
  };
  body: string;
}

// ── 解析 Markdown body 为结构化字段 ──────────────────────
function parseNowBody(body: string): { fields: NowField[]; footer: string } {
  const fields: NowField[] = [];
  let footer = "";

  // 以 "---" 分割：主体部分 + 尾注部分
  const parts = body.split("\n---\n");
  const mainContent = parts[0];

  if (parts.length > 1) {
    footer = parts.slice(1).join("\n---\n").trim();
  }

  for (const line of mainContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^\*\*(.+?)\*\*\s*(.*)/);
    if (match) {
      fields.push({ label: match[1], value: match[2] });
    }
  }

  return { fields, footer };
}

// ── 从编辑字段重建 Markdown body ─────────────────────────
function buildNowBody(fields: NowField[], footer: string): string {
  const fieldsStr = fields
    .map((f) => `**${f.label}** ${f.value}`)
    .join("\n\n");

  if (footer) {
    return `# 此时此刻\n\n${fieldsStr}\n\n---\n\n${footer}`;
  }
  return `# 此时此刻\n\n${fieldsStr}`;
}

// ── 组件 ─────────────────────────────────────────────────
export default function NowContent({ metadata, body }: NowContentProps) {
  const { isEditing } = useEditMode();
  const { saved, save } = useContentEditor();

  const { fields: parsedFields, footer: parsedFooter } = parseNowBody(body);
  const [editFields, setEditFields] = useState<NowField[]>(parsedFields);
  const [editFooter, setEditFooter] = useState(parsedFooter);

  // ── 保存 ──────────────────────────────────────────────
  const handleSave = () => {
    save({
      type: "now",
      body: buildNowBody(editFields, editFooter),
      metadata: metadata as Record<string, any>,
    });
  };

  // ── 渲染模式 ──────────────────────────────────────────
  if (!isEditing) {
    return (
      <MarkdownRenderer
        content={body}
        overrides={{ h1: () => null }}
      />
    );
  }

  // ── 编辑模式 ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── 编辑模式提示 ──────────────────────────── */}
      <motion.div
        className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mb-2"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Pencil size={12} />
        <span>编辑模式 · 修改后点击保存图标同步</span>
      </motion.div>

      {/* ── 各维度字段 ────────────────────────────── */}
      {editFields.map((field, i) => (
        <div key={i} className="group relative">
          <label className="block text-[11px] text-ink-400 dark:text-ink-600 mb-1.5 font-mono tracking-wide">
            {field.label}
          </label>
          <div className="relative">
            <textarea
              value={field.value}
              onChange={(e) => {
                const next = [...editFields];
                next[i] = { ...field, value: e.target.value };
                setEditFields(next);
              }}
              className="w-full px-3 py-2.5 text-sm leading-relaxed
                         bg-ink-50 dark:bg-ink-900/60
                         border border-ink-200 dark:border-ink-800
                         rounded-lg resize-none
                         focus:outline-none focus:ring-2
                         focus:ring-ink-300/50 dark:focus:ring-ink-700/50
                         text-ink-800 dark:text-ink-200
                         transition-shadow duration-200"
              rows={2}
            />
            <button
              onClick={handleSave}
              className="absolute top-2 right-2 p-1.5 rounded-md
                         text-ink-300 dark:text-ink-700
                         hover:text-ink-900 dark:hover:text-ink-100
                         hover:bg-ink-100 dark:hover:bg-ink-800
                         transition-colors duration-150"
              aria-label="保存"
            >
              <Save size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* ── 页面注脚 ─────────────────────────────── */}
      <div className="group relative">
        <label className="block text-[11px] text-ink-400 dark:text-ink-600 mb-1.5 font-mono tracking-wide">
          页面注脚
        </label>
        <div className="relative">
          <textarea
            value={editFooter}
            onChange={(e) => setEditFooter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm leading-relaxed
                       bg-ink-50 dark:bg-ink-900/60
                       border border-ink-200 dark:border-ink-800
                       rounded-lg resize-none font-mono
                       focus:outline-none focus:ring-2
                       focus:ring-ink-300/50 dark:focus:ring-ink-700/50
                       text-ink-800 dark:text-ink-200
                       transition-shadow duration-200"
            rows={4}
          />
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 p-1.5 rounded-md
                       text-ink-300 dark:text-ink-700
                       hover:text-ink-900 dark:hover:text-ink-100
                       hover:bg-ink-100 dark:hover:bg-ink-800
                       transition-colors duration-150"
            aria-label="保存注脚"
          >
            <Save size={14} />
          </button>
        </div>
      </div>

      {/* ── 保存成功提示 ──────────────────────────── */}
      <AnimatePresence>
        {saved && (
          <motion.div
            className="text-center text-xs text-emerald-600 dark:text-emerald-400 mt-4"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            ✓ 生命数据已同步
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
