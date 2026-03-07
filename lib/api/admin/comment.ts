import type { Page, CommentDetail } from "../types";

import { adminRequest } from "../http";

export interface ListCommentsQuery {
  page?: number;
  page_size?: number;
  status?: string;
  sort_by?: string;
  order?: string;
}

export interface UpdateCommentStatusBody {
  status: string;
}

export async function listComments(
  query?: ListCommentsQuery,
): Promise<Page<CommentDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.status) params.set("filter.status", query.status);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<CommentDetail>>(`/comments${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export async function updateCommentStatus(
  id: number,
  body: UpdateCommentStatusBody,
): Promise<void> {
  await adminRequest<void>(`/comments/${id}/status`, {
    method: "PUT",
    body,
  });
}

export async function deleteComment(id: number): Promise<void> {
  await adminRequest<void>(`/comments/${id}`, { method: "DELETE" });
}
