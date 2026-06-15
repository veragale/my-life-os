import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

// ── 所有路径以 projectRoot 为准 ──────────────────────────
function getProjectRoot(): string {
  // Next.js API routes 中 cwd 即项目根
  return process.cwd();
}

// ── 工具：读/写 JSON ─────────────────────────────────────
function readJson(path: string): any {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw);
}

function writeJson(path: string, data: any): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

function writeMd(path: string, content: string): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

// ── 前端标记解析器（与 Python markdown_parser.py 逻辑一致）─
function parseFrontmatter(text: string): { metadata: Record<string, any>; body: string } {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { metadata: {}, body: text };

  const fmLines = match[1];
  const body = text.slice(match[0].length).trim();
  const metadata: Record<string, any> = {};

  for (const line of fmLines.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value: any = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (value.toLowerCase() === "true") value = true;
    else if (value.toLowerCase() === "false") value = false;

    metadata[key] = value;
  }

  return { metadata, body };
}

// ── Timeline 条目解析 ─────────────────────────────────────
function parseTimelineEntry(mdContent: string): any {
  const { metadata, body } = parseFrontmatter(mdContent);
  return {
    slug: metadata.year || "",
    title: metadata.title || "",
    date: metadata.date || "",
    year: metadata.year || "",
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    body,
  };
}

// ── Garden 条目解析 ──────────────────────────────────────
function parseGardenEntry(mdContent: string, slug: string): any {
  const { metadata, body } = parseFrontmatter(mdContent);
  return {
    slug,
    title: metadata.title || "",
    date: metadata.date || "",
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    status: metadata.status || "seedling",
    body,
  };
}

// ═══════════════════════════════════════════════════════════
// POST 主处理
// ═══════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const root = getProjectRoot();
  const contentDir = join(root, "content");
  const dataDir = join(root, "public", "data");
  const timelineDir = join(contentDir, "timeline");
  const gardenDir = join(contentDir, "garden");

  try {
    const { type, body, metadata, filename } = await request.json();

    if (!type || typeof body !== "string") {
      return NextResponse.json({ error: "type and body are required" }, { status: 400 });
    }

    // ── 构建完整 Markdown（frontmatter + body）─────────
    const fmLines = Object.entries(metadata || {})
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((v: string) => `  - "${v}"`).join("\n")}`;
        }
        return `${key}: "${value}"`;
      })
      .join("\n");
    const fullMd = `---\n${fmLines}\n---\n\n${body.trim()}\n`;

    // ── 按类型分发处理 ────────────────────────────────
    switch (type) {
      // ── Now ─────────────────────────────────────────
      case "now": {
        const mdPath = join(contentDir, "now.md");
        const jsonPath = join(dataDir, "now.json");

        writeMd(mdPath, fullMd);

        // 直接更新 JSON
        writeJson(jsonPath, {
          metadata: metadata || {},
          body: body.trim(),
        });
        break;
      }

      // ── Bucket List ─────────────────────────────────
      case "bucket-list": {
        const mdPath = join(contentDir, "bucket-list.md");
        const jsonPath = join(dataDir, "bucket.json");

        writeMd(mdPath, fullMd);

        writeJson(jsonPath, {
          metadata: metadata || {},
          body: body.trim(),
        });
        break;
      }

      // ── Timeline ────────────────────────────────────
      case "timeline": {
        if (!filename) {
          return NextResponse.json(
            { error: "filename required for timeline" },
            { status: 400 }
          );
        }
        const safeName = String(filename).replace(/[^a-zA-Z0-9一-鿿\-]/g, "");
        const mdPath = join(timelineDir, `${safeName}.md`);
        const jsonPath = join(dataDir, "timeline.json");

        writeMd(mdPath, fullMd);

        // 读取现有 timeline.json，更新/新增条目
        const existing = existsSync(jsonPath)
          ? readJson(jsonPath)
          : { entries: [] };

        const newEntry = parseTimelineEntry(fullMd);
        const idx = existing.entries.findIndex(
          (e: any) => e.year === newEntry.year || e.slug === safeName
        );

        if (idx >= 0) {
          existing.entries[idx] = newEntry;
        } else {
          existing.entries.push(newEntry);
        }

        // 按年份降序
        existing.entries.sort((a: any, b: any) => Number(b.year) - Number(a.year));

        writeJson(jsonPath, existing);
        break;
      }

      // ── Garden ──────────────────────────────────────
      case "garden": {
        if (!filename) {
          return NextResponse.json(
            { error: "filename required for garden" },
            { status: 400 }
          );
        }
        const safeName = String(filename).replace(/[^a-zA-Z0-9一-鿿\-]/g, "");
        const mdPath = join(gardenDir, `${safeName}.md`);
        const jsonPath = join(dataDir, "garden.json");

        writeMd(mdPath, fullMd);

        const existing = existsSync(jsonPath)
          ? readJson(jsonPath)
          : { entries: [] };

        const newEntry = parseGardenEntry(fullMd, safeName);
        const idx = existing.entries.findIndex((e: any) => e.slug === safeName);

        if (idx >= 0) {
          existing.entries[idx] = newEntry;
        } else {
          existing.entries.unshift(newEntry); // 插到最前面
        }

        // 已按插入顺序（最新在最前），但保证一致性再次排序
        existing.entries.sort(
          (a: any, b: any) => (b.date || "").localeCompare(a.date || "")
        );

        writeJson(jsonPath, existing);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }

    // Python 管道不再在运行时调用——API 直接维护 JSON 为唯一数据源
    // 如需手动全量重建 JSON：在终端运行 `npm run pipeline`
    return NextResponse.json({ success: true, type });
  } catch (error: any) {
    console.error("[update-content POST]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE — 删除条目
// ═══════════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const root = getProjectRoot();
  const contentDir = join(root, "content");
  const dataDir = join(root, "public", "data");
  const timelineDir = join(contentDir, "timeline");
  const gardenDir = join(contentDir, "garden");

  try {
    const { type, filename } = await request.json();

    if (!type || !filename) {
      return NextResponse.json({ error: "type and filename are required" }, { status: 400 });
    }

    const safeName = String(filename).replace(/[^a-zA-Z0-9一-鿿\-]/g, "");

    switch (type) {
      case "timeline": {
        const mdPath = join(timelineDir, `${safeName}.md`);
        const jsonPath = join(dataDir, "timeline.json");

        // 删除 .md 文件
        if (existsSync(mdPath)) unlinkSync(mdPath);

        // 从 JSON 中移除
        if (existsSync(jsonPath)) {
          const data = readJson(jsonPath);
          data.entries = data.entries.filter(
            (e: any) => String(e.year) !== safeName && e.slug !== safeName
          );
          writeJson(jsonPath, data);
        }
        break;
      }

      case "garden": {
        const mdPath = join(gardenDir, `${safeName}.md`);
        const jsonPath = join(dataDir, "garden.json");

        // 删除 .md 文件
        if (existsSync(mdPath)) unlinkSync(mdPath);

        // 从 JSON 中移除
        if (existsSync(jsonPath)) {
          const data = readJson(jsonPath);
          data.entries = data.entries.filter(
            (e: any) => e.slug !== safeName
          );
          writeJson(jsonPath, data);
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Delete not supported for type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[update-content DELETE]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
