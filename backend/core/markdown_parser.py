"""
Markdown / MDX 解析器
职责单一：读取 .md 文件，提取 frontmatter 元数据 + body 正文
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


# ── 数据容器 ──────────────────────────────────────────────
@dataclass
class ParsedMarkdown:
    """解析后的 Markdown 文档"""
    source: str                       # 原始文件路径
    metadata: dict[str, Any] = field(default_factory=dict)
    body: str = ""


# ── Frontmatter 分割正则 ─────────────────────────────────
_FM_PATTERN = re.compile(
    r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL
)


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    """
    从 Markdown 文本中分离 YAML frontmatter 与 body。

    不依赖第三方库，手动解析简单 YAML 键值对。
    如需复杂 YAML 支持可后续引入 `python-frontmatter` 库。

    Returns:
        (metadata_dict, body_text)
    """
    match = _FM_PATTERN.match(text)
    if not match:
        return {}, text

    raw_fm = match.group(1)
    body   = text[match.end():]

    metadata: dict[str, Any] = {}
    for line in raw_fm.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue

        key, _, value = line.partition(":")
        key   = key.strip()
        value = value.strip().strip('"').strip("'")

        # 尝试将常见类型做自动转换
        if value.lower() in ("true", "false"):
            value = value.lower() == "true"
        elif re.match(r"^\d{4}-\d{2}-\d{2}$", value):
            value = str(value)  # 保持日期为字符串，便于前端处理
        elif value.startswith("[") and value.endswith("]"):
            # 简单列表: ["a", "b"] → ["a", "b"]
            items = re.findall(r'"([^"]*)"', value)
            if not items:
                items = re.findall(r"'([^']*)'", value)
            if not items:
                items = [v.strip() for v in value[1:-1].split(",") if v.strip()]
            value = items

        metadata[key] = value

    return metadata, body


def parse_file(filepath: Path) -> ParsedMarkdown:
    """
    解析单个 Markdown 文件。

    Args:
        filepath: 文件路径对象

    Returns:
        ParsedMarkdown 实例
    """
    text = filepath.read_text(encoding="utf-8")
    metadata, body = parse_frontmatter(text)

    # 注入源文件名便于前端追溯
    metadata.setdefault("slug", filepath.stem)

    return ParsedMarkdown(
        source=str(filepath),
        metadata=metadata,
        body=body.strip(),
    )


def parse_directory(dirpath: Path, pattern: str = "*.md") -> list[ParsedMarkdown]:
    """
    批量解析目录下所有匹配的 Markdown 文件。

    Args:
        dirpath:  目录路径
        pattern:  glob 匹配模式，默认 "*.md"

    Returns:
        按文件名排序的 ParsedMarkdown 列表
    """
    files = sorted(dirpath.glob(pattern))
    return [parse_file(f) for f in files]
