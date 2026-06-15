"""
全局静态配置 — my-life-os backend
所有路径均相对于 backend/ 目录解析
npm install && npm run dev
"""

from pathlib import Path

# ── 人物基本常量 ──────────────────────────────────────────
BIRTH_DATE = "2003-02-28"       # ← 替换为你的出生日期
AUTHOR_NAME = "风上心"       # ← 替换为你的名字或网名
SITE_NAME = f"{AUTHOR_NAME}'s Life OS"

# ── 路径常量 ─────────────────────────────────────────────
# backend/ 的父目录就是项目根
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR  = PROJECT_ROOT / "content"
OUTPUT_DIR   = PROJECT_ROOT / "public" / "data"

# ── 内容子目录 ───────────────────────────────────────────
TIMELINE_DIR = CONTENT_DIR / "timeline"
GARDEN_DIR   = CONTENT_DIR / "garden"
