"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/EditProvider";

/**
 * 共享内容编辑 hook — 三个 *Content 组件共用
 *
 * save()   → POST /api/update-content → router.refresh()
 * remove() → DELETE /api/update-content → router.refresh()
 *
 * 自动驱动 EditProvider.isSaving → 全局 SaveOverlay
 */

interface SavePayload {
  type: string;
  body: string;
  metadata: Record<string, any>;
  filename?: string;
}

export function useContentEditor() {
  const router = useRouter();
  const { setIsSaving } = useEditMode();
  const [saved, setSaved] = useState(false);

  const save = useCallback(async (p: SavePayload): Promise<boolean> => {
    setIsSaving(true);
    setSaved(false);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch("/api/update-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: p.type, body: p.body,
          metadata: { ...p.metadata, updated: today },
          filename: p.filename,
        }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); router.refresh(); return true; }
      return false;
    } catch (e) { console.error(`[save ${p.type}]`, e); return false; }
    finally { setIsSaving(false); }
  }, [router, setIsSaving]);

  const remove = useCallback(async (type: string, filename: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/update-content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, filename }),
      });
      if (res.ok) { router.refresh(); return true; }
      return false;
    } catch (e) { console.error(`[delete ${type}]`, e); return false; }
    finally { setIsSaving(false); }
  }, [router, setIsSaving]);

  return { saved, save, remove, clearSaved: () => setSaved(false) };
}
