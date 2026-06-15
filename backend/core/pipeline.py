"""
数据管道 — 将解析后的内容序列化为前端可用的 JSON 文件
职责单一：读取 → 组装 → 写出，不做业务计算
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from backend.config import (
    AUTHOR_NAME,
    BIRTH_DATE,
    CONTENT_DIR,
    GARDEN_DIR,
    OUTPUT_DIR,
    TIMELINE_DIR,
    SITE_NAME,
)
from backend.core.markdown_parser import parse_directory, parse_file
from backend.utils.date_tools import calculate_days_on_earth, get_year_progress


# ── JSON 写出工具 ─────────────────────────────────────────
def _write_json(filepath: Path, data: Any) -> None:
    """将数据以 UTF-8 + 缩进格式写出为 JSON"""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


# ── 各页面数据组装 ────────────────────────────────────────
def build_home() -> dict[str, Any]:
    """首页数据：作者、地球天数、年度进度"""
    return {
        "author": AUTHOR_NAME,
        "siteName": SITE_NAME,
        "daysOnEarth": calculate_days_on_earth(BIRTH_DATE),
        "yearProgress": get_year_progress(),
        "birthDate": BIRTH_DATE,
    }


def build_now() -> dict[str, Any]:
    """/now 页面数据"""
    now_file = CONTENT_DIR / "now.md"
    if not now_file.exists():
        return {"metadata": {}, "body": ""}

    parsed = parse_file(now_file)
    return {
        "metadata": parsed.metadata,
        "body": parsed.body,
    }


def build_timeline() -> dict[str, Any]:
    """/timeline 页面数据：按年份倒序"""
    entries = parse_directory(TIMELINE_DIR)
    items = [
        {
            "slug": e.metadata.get("slug", ""),
            "title": e.metadata.get("title", ""),
            "date": e.metadata.get("date", ""),
            "year": e.metadata.get("year", ""),
            "tags": e.metadata.get("tags", []),
            "body": e.body,
        }
        for e in entries
    ]
    # 按年份降序
    items.sort(key=lambda x: x.get("year", ""), reverse=True)
    return {"entries": items}


def build_garden() -> dict[str, Any]:
    """/garden 页面数据"""
    entries = parse_directory(GARDEN_DIR)
    items = [
        {
            "slug": e.metadata.get("slug", ""),
            "title": e.metadata.get("title", ""),
            "date": e.metadata.get("date", ""),
            "tags": e.metadata.get("tags", []),
            "status": e.metadata.get("status", "seedling"),
            "body": e.body,
        }
        for e in entries
    ]
    return {"entries": items}


def build_bucket() -> dict[str, Any]:
    """/bucket-list 页面数据"""
    bucket_file = CONTENT_DIR / "bucket-list.md"
    if not bucket_file.exists():
        return {"metadata": {}, "body": ""}

    parsed = parse_file(bucket_file)
    return {
        "metadata": parsed.metadata,
        "body": parsed.body,
    }


# ── 管道总入口 ────────────────────────────────────────────
def run_pipeline(output_dir: Path | None = None) -> None:
    """
    执行完整管道：解析内容 → 组装数据 → 写出 JSON

    Args:
        output_dir: 输出目录，默认使用 config.OUTPUT_DIR
    """
    out = output_dir or OUTPUT_DIR

    pipelines = {
        "home.json":     build_home,
        "now.json":      build_now,
        "timeline.json": build_timeline,
        "garden.json":   build_garden,
        "bucket.json":   build_bucket,
    }

    for filename, builder in pipelines.items():
        data = builder()
        _write_json(out / filename, data)
        print(f"  ✔ {filename}")

    print(f"\n✅ Pipeline complete — {len(pipelines)} files written to {out}")
