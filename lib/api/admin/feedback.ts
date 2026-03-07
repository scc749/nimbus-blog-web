import type { Page, FeedbackDetail } from "../types";

import { adminRequest } from "../http";

export interface ListFeedbacksQuery {
  page?: number;
  page_size?: number;
  status?: string;
  sort_by?: string;
  order?: string;
}

export interface UpdateFeedbackStatusBody {
  status: string;
}

export async function listFeedbacks(
  query?: ListFeedbacksQuery,
): Promise<Page<FeedbackDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.status) params.set("filter.status", query.status);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<FeedbackDetail>>(`/feedbacks${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export async function getFeedback(id: number): Promise<FeedbackDetail> {
  return adminRequest<FeedbackDetail>(`/feedbacks/${id}`, { method: "GET" });
}

export async function updateFeedbackStatus(
  id: number,
  body: UpdateFeedbackStatusBody,
): Promise<void> {
  await adminRequest<void>(`/feedbacks/${id}/status`, {
    method: "PUT",
    body,
  });
}

export async function deleteFeedback(id: number): Promise<void> {
  await adminRequest<void>(`/feedbacks/${id}`, { method: "DELETE" });
}
