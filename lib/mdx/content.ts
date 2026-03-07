import type { MDXRemoteSerializeResult } from "next-mdx-remote";

import { serialize } from "next-mdx-remote/serialize";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

// NormalizeMdxContent 清理 BOM 与 YAML frontmatter，避免 frontmatter 被当作正文渲染。
export function normalizeMdxContent(content: string): string {
  if (!content) return "";

  const raw = content.replace(/^\uFEFF/, "");
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);

  if (!match) return raw;

  const frontmatterBody = match[1];
  const hasYamlField = /^\s*[A-Za-z0-9_-]+\s*:/m.test(frontmatterBody);

  if (!hasYamlField) return raw;

  return raw.slice(match[0].length).trimStart();
}

// SerializeMdxContent 统一序列化 Markdown/MDX（含 GFM 与代码高亮）。
export async function serializeMdxContent(
  content: string,
): Promise<MDXRemoteSerializeResult> {
  return serialize(normalizeMdxContent(content), {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark-dimmed",
            },
            keepBackground: true,
            defaultLang: {
              block: "plaintext",
              inline: "plaintext",
            },
          },
        ],
      ],
    },
  });
}
