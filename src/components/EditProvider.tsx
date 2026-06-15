"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * 编辑模式全局上下文
 *
 * 激活方式：
 *   1. URL 添加 ?edit=true
 *   2. 点击右下角浮动 Edit 按钮
 */

interface EditContextType {
  isEditing: boolean;
  isSaving: boolean;
  toggleEdit: () => void;
  setIsSaving: (saving: boolean) => void;
}

const EditContext = createContext<EditContextType>({
  isEditing: false,
  isSaving: false,
  toggleEdit: () => {},
  setIsSaving: () => {},
});

export function EditProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();

  // 每次路由变化时检测 ?edit=true
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true") {
        setIsEditing(true);
      }
    } catch {}
  }, [pathname]);

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  return (
    <EditContext.Provider value={{ isEditing, isSaving, toggleEdit, setIsSaving }}>
      {children}
    </EditContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditContext);
}
