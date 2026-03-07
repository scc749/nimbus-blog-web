import type { Page, NotificationDetail, UnreadCountDTO } from "../types";

import { userRequest } from "../http";

export interface ListNotificationsQuery {
  page?: number;
  page_size?: number;
  sort_by?: string;
  order?: string;
  is_read?: string;
}

export async function listNotifications(
  query?: ListNotificationsQuery,
): Promise<Page<NotificationDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);
  if (query?.is_read) params.set("filter.is_read", query.is_read);

  const qs = params.toString();

  return userRequest<Page<NotificationDetail>>(
    `/notifications${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    true,
  );
}

export async function getUnreadCount(): Promise<UnreadCountDTO> {
  return userRequest<UnreadCountDTO>(
    "/notifications/unread",
    { method: "GET" },
    true,
  );
}

export async function markRead(id: number): Promise<void> {
  await userRequest<void>(`/notifications/${id}/read`, { method: "PUT" }, true);
}

export async function markAllRead(): Promise<void> {
  await userRequest<void>("/notifications/read-all", { method: "PUT" }, true);
}

export async function deleteNotification(id: number): Promise<void> {
  await userRequest<void>(`/notifications/${id}`, { method: "DELETE" }, true);
}
