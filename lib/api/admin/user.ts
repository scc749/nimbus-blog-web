import type { Page, UserDetail } from "../types";

import { adminRequest } from "../http";

export interface ListUsersQuery {
  page?: number;
  page_size?: number;
  status?: string;
  keyword?: string;
  sort_by?: string;
  order?: string;
}

export interface UpdateUserStatusBody {
  status: string;
}

export async function listUsers(
  query?: ListUsersQuery,
): Promise<Page<UserDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.status) params.set("filter.status", query.status);
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<UserDetail>>(`/users${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export async function updateUserStatus(
  id: number,
  body: UpdateUserStatusBody,
): Promise<void> {
  await adminRequest<void>(`/users/${id}/status`, {
    method: "PUT",
    body,
  });
}
