"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SearchDialog from "@/components/SearchDialog";
import Navbar from "@/components/Navbar";

/**
 * 客户端包装层：管理搜索弹窗状态 + Cmd/Ctrl+K 全局快捷键 + 延迟导航
 *
 * ★ 关键设计：搜索结果的导航不在 SearchDialog 内执行，
 * 而是存入 pendingHref，等弹窗关闭动画结束、DOM 稳定后，
 * 再由 SearchProvider 执行 router.push()。
 * 这避免了 AnimatePresence 退出动画期间导航被吞掉的 bug。
 */
export default function SearchProvider() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // 弹窗关闭后，执行延迟导航
  useEffect(() => {
    if (!searchOpen && pendingHref) {
      router.push(pendingHref);
      setPendingHref(null);
    }
  }, [searchOpen, pendingHref, router]);

  // 搜索结果选中：只存 href + 关闭弹窗，不直接导航
  const handleSelect = useCallback((href: string) => {
    setPendingHref(href);
    setSearchOpen(false);
  }, []);

  // Cmd/Ctrl+K 全局快捷键
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <Navbar onSearchOpen={openSearch} />
      <SearchDialog open={searchOpen} onClose={closeSearch} onSelect={handleSelect} />
    </>
  );
}
