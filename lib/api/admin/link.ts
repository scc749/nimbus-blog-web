import type { Page, LinkDetail, CreateResultDTO } from "../types";

import { adminRequest } from "../http";

export interface ListLinksQuery {
  page?: number;
  page_size?: number;
  keyword?: string;
  sort_by?: string;
  order?: string;
}

export interface CreateLinkBody {
  name: string;
  url: string;
  description?: string | null;
  logo?: string | null;
  sort_order?: number;
  status: string;
}

export interface UpdateLinkBody {
  name: string;
  url: string;
  description?: string | null;
  logo?: string | null;
  sort_order?: number;
  status: string;
}

export async function listLinks(
  query?: ListLinksQuery,
): Promise<Page<LinkDetail>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<LinkDetail>>(`/links${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export async function createLink(
  body: CreateLinkBody,
): Promise<CreateResultDTO> {
  return adminRequest<CreateResultDTO>("/links", {
    method: "POST",
    body,
  });
}

export async function updateLink(
  id: number,
  body: UpdateLinkBody,
): Promise<void> {
  await adminRequest<void>(`/links/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deleteLink(id: number): Promise<void> {
  await adminRequest<void>(`/links/${id}`, { method: "DELETE" });
}
