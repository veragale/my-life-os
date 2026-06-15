#!/usr/bin/env python3
"""
如果你觉得每次都要敲三行命令太麻烦，你可以直接对 Claude Code 说：
“帮我在项目的 package.json 的 scripts 里面，加一条叫 deploy 的命令。让它能一句话帮我执行 git add . && git commit -m 'site update' && git push origin main。”
这样加了之后，以后你每次改完网页，在终端里只需要敲一行：
npm run deploy

my-life-os 业务调度总入口  
cd my-life-os
npm install && npm run dev

用法:
    python -m backend.main          # 执行完整管道
    python -m backend.main --dry    # 仅打印数据，不写出文件
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from pathlib import Path

# 修复 Windows 终端 UTF-8 输出
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# 将项目根目录加入 sys.path，使 `from backend.xxx` 正常工作
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import OUTPUT_DIR, SITE_NAME
from backend.core.pipeline import (
    build_bucket,
    build_garden,
    build_home,
    build_now,
    build_timeline,
    run_pipeline,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=f"{SITE_NAME} — content pipeline")
    parser.add_argument(
        "--dry",
        action="store_true",
        help="Dry run: print JSON to stdout without writing files",
    )
    args = parser.parse_args()

    print(f"\n🚀 {SITE_NAME} Pipeline\n")

    if args.dry:
        # 干跑模式：仅打印，不写文件
        builders = {
            "home.json":     build_home,
            "now.json":      build_now,
            "timeline.json": build_timeline,
            "garden.json":   build_garden,
            "bucket.json":   build_bucket,
        }
        for name, fn in builders.items():
            print(f"── {name} ──")
            print(json.dumps(fn(), ensure_ascii=False, indent=2))
            print()
        print("⚠️  Dry run — no files written.")
    else:
        run_pipeline()


if __name__ == "__main__":
    main()
