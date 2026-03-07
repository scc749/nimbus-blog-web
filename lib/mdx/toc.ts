export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// GenerateHeadingId 将标题文本转换为稳定的锚点 ID。
export function generateHeadingId(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[^\w\s-\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

// ParseTocItems 解析 Markdown 标题并生成 TOC 条目（重复标题自动去重）。
export function parseTocItems(content: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TocItem[] = [];
  const counts: Record<string, number> = {};
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const base = generateHeadingId(text);

    if (!base) {
      const fallback = `section-${items.length + 1}`;

      items.push({ id: fallback, text, level });
      continue;
    }
    const n = counts[base] ?? 0;
    const id = n === 0 ? base : `${base}-${n}`;

    counts[base] = n + 1;
    items.push({ id, text, level });
  }

  return items;
}
