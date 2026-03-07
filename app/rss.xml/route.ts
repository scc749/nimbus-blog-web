import type { Page, SiteSettingDetail, V1PostSummary } from "@/lib/api/types";

import { Feed } from "feed";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ?? "";
const V1 = `${API_BASE}/api/v1`;

// Envelope 后端统一响应结构（RSS Route Handler 自行解包，避免依赖浏览器态请求封装）。

interface Envelope<T> {
  code: string;
  message: string;
  data?: T;
}

// ApiFetch 仅用于 Route Handler，在服务端请求后端 API。
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${V1}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);

  const json = (await res.json()) as Envelope<T>;

  if (json.code !== "0000") throw new Error(json.message);

  return json.data as T;
}

// FindSetting 从 settings 列表中按 key 取值。
function findSetting(list: SiteSettingDetail[], key: string): string | null {
  return list.find((s) => s.setting_key === key)?.setting_value ?? null;
}

// ResolveAbsoluteImageURL 生成 RSS 所需的绝对图片 URL。
function resolveAbsoluteImageURL(
  value: string | null,
  siteUrl: string,
): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return `${siteUrl}${value}`;

  return `${API_BASE}/api/v1/files/${value}`;
}

export const revalidate = 3600;

export async function GET(request: Request) {
  const siteUrl = new URL(request.url).origin;

  const [settings, postsPage] = await Promise.all([
    apiFetch<SiteSettingDetail[]>("/settings"),
    apiFetch<Page<V1PostSummary>>(
      "/content/posts?page=1&page_size=30&sort_by=published_at&order=desc",
    ),
  ]);

  const siteName = findSetting(settings, "site.name") ?? "Nimbus Blog";
  const siteTitle = findSetting(settings, "site.title") ?? siteName;
  const siteDescription =
    findSetting(settings, "site.description") ?? "现代化个人博客";
  const authorName = findSetting(settings, "profile.name") ?? siteName;
  const authorAvatar = findSetting(settings, "profile.avatar");
  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: "zh-CN",
    image: `${siteUrl}/logo.png`,
    favicon: `${siteUrl}/logo.png`,
    copyright: `© ${new Date().getFullYear()} ${siteName}`,
    feedLinks: { rss: `${siteUrl}/rss.xml` },
    author: {
      name: authorName,
      link: siteUrl,
      ...(authorAvatar
        ? { avatar: resolveAbsoluteImageURL(authorAvatar, siteUrl) }
        : {}),
    },
  });

  for (const post of postsPage.list) {
    const postUrl = `${siteUrl}/post/${post.slug}`;

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.excerpt,
      author: [{ name: post.author?.nickname ?? authorName }],
      date: new Date(post.published_at ?? post.created_at),
      image: resolveAbsoluteImageURL(post.featured_image, siteUrl),
      category: [{ name: post.category.name }],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
