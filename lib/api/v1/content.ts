import type {
  Page,
  V1PostSummary,
  V1PostDetail,
  CategoryDetail,
  TagDetail,
  LikeInfoDTO,
} from "../types";

import { userRequest } from "../http";

// ContentV1 公开内容 API（文章/分类/标签）。

// Posts 文章。

export interface ListPostsQuery {
  page?: number;
  page_size?: number;
  category_id?: number;
  tag_id?: number;
  is_featured?: boolean;
  keyword?: string;
  sort_by?: string;
  order?: string;
}

export async function listPosts(
  query?: ListPostsQuery,
): Promise<Page<V1PostSummary>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.category_id)
    params.set("filter.category_id", String(query.category_id));
  if (query?.tag_id) params.set("filter.tag_id", String(query.tag_id));
  if (query?.is_featured !== undefined)
    params.set("filter.is_featured", String(query.is_featured));
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return userRequest<Page<V1PostSummary>>(
    `/content/posts${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    true,
  );
}

export async function getPost(slug: string): Promise<V1PostDetail> {
  return userRequest<V1PostDetail>(
    `/content/posts/${encodeURIComponent(slug)}`,
    { method: "GET" },
    true,
  );
}

export async function togglePostLike(id: number): Promise<LikeInfoDTO> {
  return userRequest<LikeInfoDTO>(
    `/content/posts/${id}/likes`,
    { method: "POST" },
    true,
  );
}

export async function removePostLike(id: number): Promise<LikeInfoDTO> {
  return userRequest<LikeInfoDTO>(
    `/content/posts/${id}/likes`,
    { method: "DELETE" },
    true,
  );
}

// Categories 分类。

export async function listCategories(): Promise<CategoryDetail[]> {
  return userRequest<CategoryDetail[]>("/content/categories", {
    method: "GET",
  });
}

// Tags 标签。

export async function listTags(): Promise<TagDetail[]> {
  return userRequest<TagDetail[]>("/content/tags", { method: "GET" });
}
