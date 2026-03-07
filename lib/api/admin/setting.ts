import type { SiteSettingDetail } from "../types";

import { adminRequest } from "../http";

export interface UpsertSettingBody {
  setting_key: string;
  setting_value?: string | null;
  setting_type: string;
  description?: string | null;
  is_public?: boolean;
}

export async function listSettings(): Promise<SiteSettingDetail[]> {
  return adminRequest<SiteSettingDetail[]>("/settings", { method: "GET" });
}

export async function getSettingByKey(key: string): Promise<SiteSettingDetail> {
  return adminRequest<SiteSettingDetail>(
    `/settings/${encodeURIComponent(key)}`,
    { method: "GET" },
  );
}

export async function upsertSetting(
  key: string,
  body: UpsertSettingBody,
): Promise<void> {
  await adminRequest<void>(`/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body,
  });
}
