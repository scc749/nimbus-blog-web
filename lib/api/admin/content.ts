import type {
  Page,
  AdminPostSummary,
  AdminPostDetail,
  CategoryDetail,
  TagDetail,
  CreateResultDTO,
} from "../types";

import { adminRequest } from "../http";

// ContentAdmin 管理端内容管理 API（文章/分类/标签）。

// Posts 文章。

export interface ListPostsQuery {
  page?: number;
  page_size?: number;
  status?: string;
  category_id?: number;
  tag_id?: number;
  is_featured?: boolean;
  keyword?: string;
  sort_by?: string;
  order?: string;
}

export interface CreatePostBody {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  author_id: number;
  category_id: number;
  tag_ids?: number[];
  status: string;
  is_featured?: boolean;
}

export interface UpdatePostBody {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  featured_image?: string | null;
  author_id?: number;
  category_id?: number;
  tag_ids?: number[];
  status?: string;
  is_featured?: boolean;
}

export async function listPosts(
  query?: ListPostsQuery,
): Promise<Page<AdminPostSummary>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.status) params.set("filter.status", query.status);
  if (query?.category_id)
    params.set("filter.category_id", String(query.category_id));
  if (query?.tag_id) params.set("filter.tag_id", String(query.tag_id));
  if (query?.is_featured !== undefined)
    params.set("filter.is_featured", String(query.is_featured));
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<AdminPostSummary>>(
    `/content/posts${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function getPost(id: number): Promise<AdminPostDetail> {
  return adminRequest<AdminPostDetail>(`/content/posts/${id}`, {
    method: "GET",
  });
}

export async function createPost(
  body: CreatePostBody,
): Promise<CreateResultDTO> {
  return adminRequest<CreateResultDTO>("/content/posts", {
    method: "POST",
    body,
  });
}

export async function updatePost(
  id: number,
  body: UpdatePostBody,
): Promise<void> {
  await adminRequest<void>(`/content/posts/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deletePost(id: number): Promise<void> {
  await adminRequest<void>(`/content/posts/${id}`, { method: "DELETE" });
}

// Categories 分类。

export interface ListCategoriesQuery {
  page?: number;
  page_size?: number;
  keyword?: string;
  sort_by?: string;
  order?: string;
}

export interface CreateCategoryBody {
  name: string;
  slug: string;
}

export interface UpdateCategoryBody {
  name?: string;
  slug?: string;
}

export async function listCategories(
  query?: ListCategoriesQuery,
): Promise<Page<CategoryDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<CategoryDetail>>(
    `/content/categories${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function createCategory(
  body: CreateCategoryBody,
): Promise<CreateResultDTO> {
  return adminRequest<CreateResultDTO>("/content/categories", {
    method: "POST",
    body,
  });
}

export async function updateCategory(
  id: number,
  body: UpdateCategoryBody,
): Promise<void> {
  await adminRequest<void>(`/content/categories/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await adminRequest<void>(`/content/categories/${id}`, { method: "DELETE" });
}

// Tags 标签。

export interface ListTagsQuery {
  page?: number;
  page_size?: number;
  keyword?: string;
  sort_by?: string;
  order?: string;
}

export interface CreateTagBody {
  name: string;
  slug: string;
}

export interface UpdateTagBody {
  name?: string;
  slug?: string;
}

export async function listTags(
  query?: ListTagsQuery,
): Promise<Page<TagDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<TagDetail>>(`/content/tags${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export async function createTag(body: CreateTagBody): Promise<CreateResultDTO> {
  return adminRequest<CreateResultDTO>("/content/tags", {
    method: "POST",
    body,
  });
}

export async function updateTag(
  id: number,
  body: UpdateTagBody,
): Promise<void> {
  await adminRequest<void>(`/content/tags/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deleteTag(id: number): Promise<void> {
  await adminRequest<void>(`/content/tags/${id}`, { method: "DELETE" });
}

// Slug Slug 生成。

export async function generateSlug(input: string): Promise<string> {
  const res = await adminRequest<{ slug: string }>("/content/generate-slug", {
    method: "POST",
    body: { input },
  });

  return res.slug;
}
